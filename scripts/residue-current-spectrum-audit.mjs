#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyMod,
  polyToString,
} from "../src/core/ffield.js";
import { sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 24);
const q3MaxDegree = Number(process.argv[5] || 15);

const integerModuli = [3, 5, 7, 11, 13, 17, 19, 23];
const budgetSizes = [2, 4, 6, 8];
const blockCount = 24;
const seeds = [12345, 271828, 314159, 161803, 424242];
const scales = [N / 8, N / 4, N / 2, N].map((x) => Math.max(200_000, Math.round(x)));

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function stdev(values) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - m) ** 2)));
}

function dot(a, b) {
  let out = 0;
  for (let i = 0; i < a.length; i++) out += a[i] * b[i];
  return out;
}

function countResidueLeq(x, modulus, residue) {
  if (x < residue) return 0;
  return Math.floor((x - residue) / modulus) + 1;
}

function intervalResidueCounts(lo, hi, modulus) {
  const out = new Float64Array(modulus - 1);
  for (let r = 1; r < modulus; r++) {
    out[r - 1] = countResidueLeq(hi, modulus, r) - countResidueLeq(lo, modulus, r);
  }
  return out;
}

function blockBounds(lo, hi, count) {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.floor(lo + ((hi - lo) * i) / count);
    const b = Math.floor(lo + ((hi - lo) * (i + 1)) / count);
    return { lo: a, hi: b, id: `${a}..${b}` };
  });
}

function primesInInterval(primes, lo, hi) {
  const out = [];
  for (const p of primes) {
    if (p <= lo) continue;
    if (p > hi) break;
    out.push(p);
  }
  return out;
}

function multinomial(total, weights, random) {
  const counts = new Float64Array(weights.length);
  const sum = weights.reduce((a, b) => a + b, 0);
  const cumulative = new Float64Array(weights.length);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i] / sum;
    cumulative[i] = acc;
  }
  for (let k = 0; k < total; k++) {
    const u = random();
    let i = 0;
    while (i + 1 < cumulative.length && u > cumulative[i]) i++;
    counts[i]++;
  }
  return counts;
}

function residualCells(observed, expectedWeights, total) {
  const weightTotal = expectedWeights.reduce((a, b) => a + b, 0);
  const cells = [];
  for (let i = 0; i < observed.length; i++) {
    const expected = total * expectedWeights[i] / weightTotal;
    if (expected <= 0) {
      cells.push(0);
    } else {
      cells.push((observed[i] - expected) / Math.sqrt(expected));
    }
  }
  return cells;
}

function spectralSummary(rows) {
  const rowCount = rows.length;
  const dim = rows[0]?.length || 0;
  const columnMeans = new Float64Array(dim);
  for (const row of rows) for (let j = 0; j < dim; j++) columnMeans[j] += row[j];
  for (let j = 0; j < dim; j++) columnMeans[j] /= rowCount || 1;

  const centered = rows.map((row) => row.map((value, j) => value - columnMeans[j]));
  let rawSq = 0, centeredSq = 0;
  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j < dim; j++) {
      rawSq += rows[i][j] ** 2;
      centeredSq += centered[i][j] ** 2;
    }
  }
  const gram = Array.from({ length: rowCount }, () => new Float64Array(rowCount));
  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j <= i; j++) {
      const value = dot(centered[i], centered[j]) / (rowCount || 1);
      gram[i][j] = value;
      gram[j][i] = value;
    }
  }
  let v = new Float64Array(rowCount).fill(1 / Math.sqrt(rowCount || 1));
  let lambda = 0;
  for (let iter = 0; iter < 80; iter++) {
    const next = new Float64Array(rowCount);
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < rowCount; j++) next[i] += gram[i][j] * v[j];
    }
    const mag = Math.sqrt(dot(next, next));
    if (mag === 0) break;
    for (let i = 0; i < rowCount; i++) v[i] = next[i] / mag;
    lambda = dot(v, next);
  }
  const centeredVariance = centeredSq / ((rowCount || 1) * (dim || 1));
  const mpEdge = (1 + Math.sqrt(dim / Math.max(1, rowCount - 1))) ** 2;
  const normalizedEdge = centeredVariance > 0 ? lambda / (centeredVariance * mpEdge) : 0;
  const columnVariance = Array.from({ length: dim }, (_, j) => {
    let s = 0;
    for (let i = 0; i < rowCount; i++) s += centered[i][j] ** 2;
    return s / (rowCount || 1);
  });
  const totalColumnVariance = columnVariance.reduce((a, b) => a + b, 0);
  const maxColumnVarianceShare = totalColumnVariance > 0
    ? Math.max(...columnVariance) / totalColumnVariance
    : 0;
  return {
    rows: rowCount,
    dim,
    energy: Math.sqrt(rawSq / ((rowCount || 1) * (dim || 1))),
    centeredEnergy: Math.sqrt(centeredVariance),
    lambdaMax: lambda,
    mpEdge,
    normalizedEdge,
    maxColumnVarianceShare,
    edgeVector: Array.from(v),
  };
}

function summarizeRows(rows, columnMeta) {
  const summary = spectralSummary(rows);
  const columnEnergy = columnMeta.map((meta, j) => {
    let sum = 0;
    for (const row of rows) sum += row[j] ** 2;
    return { ...meta, rms: Math.sqrt(sum / rows.length) };
  });
  columnEnergy.sort((a, b) => b.rms - a.rms);
  return {
    ...summary,
    strongestColumns: columnEnergy.slice(0, 8),
  };
}

function buildIntegerRows(primes, scale, moduli, mode, seed = 0) {
  const lo = Math.floor(scale / 2);
  const hi = scale;
  const bounds = blockBounds(lo, hi, blockCount);
  const random = rng(seed);
  const rows = [];
  for (const block of bounds) {
    const blockPrimes = primesInInterval(primes, block.lo, block.hi);
    const cells = [];
    for (const modulus of moduli) {
      const eligible = intervalResidueCounts(block.lo, block.hi, modulus);
      const eligibleTotal = eligible.reduce((a, b) => a + b, 0);
      const counts = new Float64Array(modulus - 1);
      if (mode === "real") {
        for (const p of blockPrimes) counts[(p % modulus) - 1]++;
        cells.push(...residualCells(counts, Array.from(eligible), blockPrimes.length));
      } else if (mode === "random") {
        const sampled = multinomial(blockPrimes.length, Array.from(eligible), random);
        cells.push(...residualCells(sampled, Array.from(eligible), blockPrimes.length));
      } else if (mode === "composite") {
        for (let i = 0; i < eligible.length; i++) counts[i] = eligible[i];
        for (const p of blockPrimes) counts[(p % modulus) - 1]--;
        cells.push(...residualCells(counts, Array.from(eligible), eligibleTotal - blockPrimes.length));
      }
    }
    rows.push(cells);
  }
  return rows;
}

function integerColumnMeta(moduli) {
  const out = [];
  for (const modulus of moduli) {
    for (let residue = 1; residue < modulus; residue++) out.push({ universe: "Z", modulus, residue });
  }
  return out;
}

function integerAudit(primes) {
  const scaleRows = [];
  for (const scale of scales) {
    const row = { scale, budgets: [] };
    for (const size of budgetSizes) {
      const moduli = integerModuli.slice(0, size);
      const meta = integerColumnMeta(moduli);
      row.budgets.push({
        size,
        moduli,
        real: summarizeRows(buildIntegerRows(primes, scale, moduli, "real"), meta),
        composite: summarizeRows(buildIntegerRows(primes, scale, moduli, "composite"), meta),
      });
    }
    scaleRows.push(row);
  }
  const controlScale = scales.at(-1);
  const controls = {};
  for (const size of budgetSizes) {
    const moduli = integerModuli.slice(0, size);
    const meta = integerColumnMeta(moduli);
    const random = seeds.map((seed) => summarizeRows(buildIntegerRows(primes, controlScale, moduli, "random", seed), meta));
    controls[size] = {
      random,
      normalizedEdgeRange: range(random.map((item) => item.normalizedEdge)),
      energyRange: range(random.map((item) => item.energy)),
      maxColumnVarianceShareRange: range(random.map((item) => item.maxColumnVarianceShare)),
    };
  }
  return { moduli: integerModuli, budgetSizes, scales, rows: scaleRows, controls };
}

function polynomialModuli(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const out = [];
  for (let degree = 1; degree <= Math.min(5, maxDegree); degree++) {
    const norm = q ** degree;
    if (norm - 1 < 2) continue;
    for (const modulus of universe.irreduciblesByDegree[degree]) {
      out.push({ q, degree, norm, modulus, label: polyToString(modulus, q) });
    }
  }
  return out.slice(0, 8);
}

function buildFieldRows(q, maxDegree, moduli, mode, seed = 0) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const start = Math.max(2, maxDegree - 7);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const random = rng(seed);
  const rows = [];
  for (const degree of degrees) {
    const values = universe.irreduciblesByDegree[degree];
    const cells = [];
    for (const spec of moduli) {
      const classCount = spec.norm - 1;
      const counts = new Float64Array(classCount);
      if (mode === "real") {
        for (const poly of values) {
          const residue = polyMod(poly, spec.modulus, q);
          if (residue > 0) counts[residue - 1]++;
        }
      } else {
        const sampled = multinomial(values.length, new Array(classCount).fill(1), random);
        counts.set(sampled);
      }
      cells.push(...residualCells(counts, new Array(classCount).fill(1), values.length));
    }
    rows.push(cells);
  }
  return { degrees, rows };
}

function fieldColumnMeta(moduli, universeName) {
  const out = [];
  for (const spec of moduli) {
    for (let residue = 1; residue < spec.norm; residue++) {
      out.push({
        universe: universeName,
        modulus: spec.label,
        modulusDegree: spec.degree,
        residue,
      });
    }
  }
  return out;
}

function fieldAudit(q, maxDegree) {
  const allModuli = polynomialModuli(q, maxDegree);
  const sizes = budgetSizes.filter((size) => size <= allModuli.length);
  const budgets = [];
  const controls = {};
  for (const size of sizes) {
    const moduli = allModuli.slice(0, size);
    const meta = fieldColumnMeta(moduli, `F_${q}[t]`);
    const realRows = buildFieldRows(q, maxDegree, moduli, "real");
    const random = seeds.map((seed) => summarizeRows(buildFieldRows(q, maxDegree, moduli, "random", seed).rows, meta));
    budgets.push({
      size,
      moduli,
      degrees: realRows.degrees,
      real: summarizeRows(realRows.rows, meta),
    });
    controls[size] = {
      random,
      normalizedEdgeRange: range(random.map((item) => item.normalizedEdge)),
      energyRange: range(random.map((item) => item.energy)),
      maxColumnVarianceShareRange: range(random.map((item) => item.maxColumnVarianceShare)),
    };
  }
  return { q, maxDegree, moduli: allModuli, budgetSizes: sizes, budgets, controls };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NaN";
}

function mdBudgetRows(rows) {
  return rows.map((row) => {
    const final = row.budgets.at(-1).real;
    const comp = row.budgets.at(-1).composite;
    return `| ${row.scale} | ${fmt(final.normalizedEdge)} | ${fmt(final.energy)} | ${fmt(final.maxColumnVarianceShare)} | ${fmt(comp.normalizedEdge)} | ${fmt(comp.energy)} |`;
  }).join("\n");
}

function mdFinalBudgetRows(integer, q2, q3) {
  const final = integer.rows.at(-1);
  return budgetSizes.map((size) => {
    const z = final.budgets.find((item) => item.size === size);
    const c = integer.controls[size];
    const f2 = q2.budgets.find((item) => item.size === size);
    const f2c = q2.controls[size];
    const f3 = q3.budgets.find((item) => item.size === size);
    const f3c = q3.controls[size];
    return `| ${size} | ${z.moduli.join(",")} | ${fmt(z.real.normalizedEdge)} | ${fmt(z.real.energy)} | ${c.normalizedEdgeRange.map((v) => fmt(v)).join(" .. ")} | ${f2 ? fmt(f2.real.normalizedEdge) : "NA"} | ${f2c ? f2c.normalizedEdgeRange.map((v) => fmt(v)).join(" .. ") : "NA"} | ${f3 ? fmt(f3.real.normalizedEdge) : "NA"} | ${f3c ? f3c.normalizedEdgeRange.map((v) => fmt(v)).join(" .. ") : "NA"} |`;
  }).join("\n");
}

function mdStrongest(summary) {
  return summary.strongestColumns
    .map((item) => `${item.universe}:${item.modulus}:${item.residue}=${fmt(item.rms, 3)}`)
    .join(", ");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function heatColor(value) {
  const x = Math.max(-3, Math.min(3, value)) / 3;
  if (x >= 0) {
    const t = x;
    return `rgb(${Math.round(45 + 175 * t)},${Math.round(110 - 35 * t)},${Math.round(165 - 70 * t)})`;
  }
  const t = -x;
  return `rgb(${Math.round(50 - 15 * t)},${Math.round(115 + 115 * t)},${Math.round(170 + 45 * t)})`;
}

function heatmap(rows, x, y, w, h, title) {
  const visibleCols = Math.min(48, rows[0].length);
  const cellW = w / visibleCols;
  const cellH = h / rows.length;
  const rects = rows.flatMap((row, r) => row.slice(0, visibleCols).map((value, c) => {
    const rx = x + c * cellW;
    const ry = y + r * cellH;
    return `<rect x="${rx.toFixed(2)}" y="${ry.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(value)}"/>`;
  })).join("\n");
  return `<g font-family="Menlo, Consolas, monospace" font-size="10">
<text x="${x}" y="${y - 10}" fill="#e5e7eb" font-size="13">${title}</text>
${rects}
</g>`;
}

function svg(integer, q2, q3, primes) {
  const width = 1160, height = 820;
  const final = integer.rows.at(-1);
  const zValues = final.budgets.map((item) => item.real.normalizedEdge);
  const compValues = final.budgets.map((item) => item.composite.normalizedEdge);
  const q2Values = q2.budgets.map((item) => item.real.normalizedEdge);
  const q3Values = q3.budgets.map((item) => item.real.normalizedEdge);
  const all = [...zValues, ...compValues, ...q2Values, ...q3Values, 1];
  const minY = Math.min(...all) * 0.95;
  const maxY = Math.max(...all) * 1.08;
  const chart = { x: 88, y: 72, w: 990, h: 260 };
  const oneY = chart.y + chart.h - ((1 - minY) / (maxY - minY || 1)) * chart.h;
  const zHeat = buildIntegerRows(primes, N, integerModuli.slice(0, 8), "real");
  const q2Heat = buildFieldRows(2, q2.maxDegree, q2.moduli.slice(0, 8), "real").rows;
  const q3Heat = buildFieldRows(3, q3.maxDegree, q3.moduli.slice(0, 8), "real").rows;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">whitened residue-current spectral edge</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">normalized lambda_max / MP edge as modulus budget grows; heatmaps show first 48 residual cells</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${oneY.toFixed(2)}" y2="${oneY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
<path d="${linePath(zValues, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${linePath(compValues, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#7dd3fc" stroke-width="3"/>
<path d="${linePath(q2Values, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fbbf24" stroke-width="3"/>
<path d="${linePath(q3Values, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f472b6" stroke-width="3"/>
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">budget sizes: ${budgetSizes.join(", ")}</text>
<text x="${chart.x + 650}" y="${chart.y + chart.h + 24}" fill="#a7f3d0" font-size="12">Z primes</text>
<text x="${chart.x + 745}" y="${chart.y + chart.h + 24}" fill="#7dd3fc" font-size="12">Z composites</text>
<text x="${chart.x + 870}" y="${chart.y + chart.h + 24}" fill="#fbbf24" font-size="12">F2[t]</text>
<text x="${chart.x + 945}" y="${chart.y + chart.h + 24}" fill="#f472b6" font-size="12">F3[t]</text>
</g>
${heatmap(zHeat, 90, 420, 440, 170, "Z primes, final scale")}
${heatmap(q2Heat, 90, 655, 440, 120, "F2[t], top degrees")}
${heatmap(q3Heat, 650, 655, 440, 120, "F3[t], top degrees")}
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="650" y="420" fill="#e5e7eb">final budget-8 summary</text>
<text x="650" y="448" fill="#a7f3d0">Z edge ${fmt(zValues.at(-1))}, energy ${fmt(final.budgets.at(-1).real.energy)}</text>
<text x="650" y="472" fill="#94a3b8">Z random edge range ${integer.controls[8].normalizedEdgeRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="496" fill="#7dd3fc">composite edge ${fmt(compValues.at(-1))}, energy ${fmt(final.budgets.at(-1).composite.energy)}</text>
<text x="650" y="520" fill="#fbbf24">F2 edge ${fmt(q2Values.at(-1))}, random ${q2.controls[8].normalizedEdgeRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="544" fill="#f472b6">F3 edge ${fmt(q3Values.at(-1))}, random ${q3.controls[8].normalizedEdgeRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="584" fill="#94a3b8">blue = negative excess, red = positive excess, clamp +/-3</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[residue-current] building primes to ${N}`);
const isp = sieve(N);
const primes = [];
for (let n = 2; n <= N; n++) if (isp[n]) primes.push(n);

console.error("[residue-current] integer audit");
const integer = integerAudit(primes);
console.error(`[residue-current] F_2[t] degree ${q2MaxDegree}`);
const q2 = fieldAudit(2, q2MaxDegree);
console.error(`[residue-current] F_3[t] degree ${q3MaxDegree}`);
const q3 = fieldAudit(3, q3MaxDegree);

const output = {
  candidate: "whitened residue-current spectral edge",
  N,
  integer,
  q2,
  q3,
};

const jsonPath = path.join(outDir, `residue-current-spectrum-audit-${N}.json`);
const mdPath = path.join(outDir, `residue-current-spectrum-audit-${N}.md`);
const svgPath = path.join(outDir, `residue-current-spectrum-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer, q2, q3, primes));

const finalBudget = integer.rows.at(-1).budgets.at(-1);
const md = `# whitened residue-current spectral edge audit

Candidate:
concatenate square-root-normalized residue-class excesses over a growing
modulus budget, split into fresh blocks/degrees, and track
\`lambda_max / MP_edge\` for the covariance of the whitened current matrix.

Integer moduli: \`${integerModuli.join(", ")}\`; budget sizes
\`${budgetSizes.join(", ")}\`; fresh blocks per scale \`${blockCount}\`.

## Final-scale budget path

| budget | Z moduli | Z edge | Z energy | Z random edge range | F2 edge | F2 random edge range | F3 edge | F3 random edge range |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFinalBudgetRows(integer, q2, q3)}

## Integer range stability at budget 8

| scale | Z edge | Z energy | Z max-column share | composite edge | composite energy |
| ---: | ---: | ---: | ---: | ---: | ---: |
${mdBudgetRows(integer.rows)}

## Final budget-8 strongest columns

Z primes:
\`${mdStrongest(finalBudget.real)}\`

Z composites:
\`${mdStrongest(finalBudget.composite)}\`

F_2[t]:
\`${mdStrongest(q2.budgets.at(-1).real)}\`

F_3[t]:
\`${mdStrongest(q3.budgets.at(-1).real)}\`

## Control summaries at final scale

| budget | random energy range | random edge range | random max-column-share range |
| ---: | ---: | ---: | ---: |
${budgetSizes.map((size) => {
  const c = integer.controls[size];
  return `| ${size} | ${c.energyRange.map((v) => fmt(v)).join(" .. ")} | ${c.normalizedEdgeRange.map((v) => fmt(v)).join(" .. ")} | ${c.maxColumnVarianceShareRange.map((v) => fmt(v)).join(" .. ")} |`;
}).join("\n")}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  finalIntegerBudget8: {
    edge: finalBudget.real.normalizedEdge,
    energy: finalBudget.real.energy,
    maxColumnVarianceShare: finalBudget.real.maxColumnVarianceShare,
  },
  finalCompositeBudget8: {
    edge: finalBudget.composite.normalizedEdge,
    energy: finalBudget.composite.energy,
  },
  integerControlBudget8: {
    edgeRange: integer.controls[8].normalizedEdgeRange,
    energyRange: integer.controls[8].energyRange,
  },
  q2Budget8: {
    edge: q2.budgets.at(-1).real.normalizedEdge,
    energy: q2.budgets.at(-1).real.energy,
  },
  q2ControlBudget8: {
    edgeRange: q2.controls[8].normalizedEdgeRange,
    energyRange: q2.controls[8].energyRange,
  },
  q3Budget8: {
    edge: q3.budgets.at(-1).real.normalizedEdge,
    energy: q3.budgets.at(-1).real.energy,
  },
  q3ControlBudget8: {
    edgeRange: q3.controls[8].normalizedEdgeRange,
    energyRange: q3.controls[8].energyRange,
  },
}, null, 2));
