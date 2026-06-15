#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  isMonicIrreducible,
  polyAdd,
  polyMod,
  polyMul,
  polySub,
  polyToString,
} from "../src/core/ffield.js";
import { sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 24);
const q3MaxDegree = Number(process.argv[5] || 15);

const integerModuli = [3, 5, 7, 11, 13];
const budgetSizes = [2, 4, 5];
const integerShifts = [2, 4, 6, 8];
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

function energy(cells) {
  return Math.sqrt(mean(cells.map((value) => value * value)));
}

function countResidueLeq(x, modulus, residue) {
  if (x < residue) return 0;
  return Math.floor((x - residue) / modulus) + 1;
}

function countResidueRange(loExclusive, hiInclusive, modulus, residue) {
  return countResidueLeq(hiInclusive, modulus, residue) - countResidueLeq(loExclusive, modulus, residue);
}

function admissibleIntegerResidues(modulus, shift) {
  const out = [];
  for (let r = 1; r < modulus; r++) {
    if ((r + shift) % modulus === 0) continue;
    out.push(r);
  }
  return out;
}

function multinomial(total, weights, random) {
  const counts = new Float64Array(weights.length);
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  if (total <= 0 || weightSum <= 0) return counts;
  const cumulative = new Float64Array(weights.length);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i] / weightSum;
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

function residualCells(counts, eligible, total) {
  const eligibleTotal = eligible.reduce((sum, value) => sum + value, 0);
  const out = [];
  for (let i = 0; i < counts.length; i++) {
    const expected = eligibleTotal > 0 ? total * eligible[i] / eligibleTotal : 0;
    if (expected >= 1e-9) out.push((counts[i] - expected) / Math.sqrt(expected));
  }
  return out;
}

function summarizeCells(cells, meta) {
  const e = energy(cells);
  const byCell = cells.map((value, i) => ({ ...meta[i], value, abs: Math.abs(value) }))
    .sort((a, b) => b.abs - a.abs);
  return {
    cells,
    energy: e,
    maxAbs: byCell[0]?.abs || 0,
    strongest: byCell.slice(0, 8),
  };
}

function primesInRange(primes, lo, hi) {
  const out = [];
  for (const p of primes) {
    if (p <= lo) continue;
    if (p > hi) break;
    out.push(p);
  }
  return out;
}

function integerCellsForBlock(primes, isp, lo, hi, moduli, mode, seed = 0) {
  const random = rng(seed);
  const cells = [];
  const meta = [];
  for (const modulus of moduli) {
    for (const shift of integerShifts) {
      const startHi = hi - shift;
      if (startHi <= lo) continue;
      const residues = admissibleIntegerResidues(modulus, shift);
      const index = new Map(residues.map((residue, i) => [residue, i]));
      const eligible = new Float64Array(residues.length);
      const pair = new Float64Array(residues.length);
      const startPrime = new Float64Array(residues.length);
      const endPrime = new Float64Array(residues.length);
      for (let i = 0; i < residues.length; i++) {
        eligible[i] = countResidueRange(lo, startHi, modulus, residues[i]);
      }
      for (const p of primes) {
        if (p > lo && p <= startHi) {
          const r = p % modulus;
          const j = index.get(r);
          if (j !== undefined) {
            startPrime[j]++;
            if (isp[p + shift]) pair[j]++;
          }
        }
        if (p > lo + shift && p <= hi) {
          const r = (p - shift) % modulus;
          const j = index.get(r);
          if (j !== undefined) endPrime[j]++;
        }
        if (p > hi) break;
      }
      const totalPairs = pair.reduce((sum, value) => sum + value, 0);
      const counts = mode === "real"
        ? pair
        : mode === "shuffle"
          ? multinomial(totalPairs, Array.from(eligible), random)
          : new Float64Array(residues.map((_, i) => eligible[i] - startPrime[i] - endPrime[i] + pair[i]));
      const total = counts.reduce((sum, value) => sum + value, 0);
      const residuals = residualCells(counts, Array.from(eligible), total);
      for (let i = 0; i < residuals.length; i++) {
        cells.push(residuals[i]);
        meta.push({ universe: "Z", modulus, shift, residue: residues[i] });
      }
    }
  }
  return { cells, meta };
}

function integerAudit(primes, isp) {
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    const row = { scale, lo, hi, budgets: [] };
    for (const size of budgetSizes) {
      const moduli = integerModuli.slice(0, size);
      const real = integerCellsForBlock(primes, isp, lo, hi, moduli, "real");
      const composite = integerCellsForBlock(primes, isp, lo, hi, moduli, "composite");
      row.budgets.push({
        size,
        moduli,
        real: summarizeCells(real.cells, real.meta),
        composite: summarizeCells(composite.cells, composite.meta),
      });
    }
    rows.push(row);
  }
  const final = rows.at(-1);
  const controls = {};
  for (const size of budgetSizes) {
    const moduli = integerModuli.slice(0, size);
    const group = seeds.map((seed) => {
      const shuffled = integerCellsForBlock(primes, isp, final.lo, final.hi, moduli, "shuffle", seed);
      return summarizeCells(shuffled.cells, shuffled.meta);
    });
    controls[size] = {
      shuffle: group,
      energyRange: range(group.map((item) => item.energy)),
      maxAbsRange: range(group.map((item) => item.maxAbs)),
    };
  }
  return { moduli: integerModuli, shifts: integerShifts, budgetSizes, scales, rows, controls };
}

function polyLinearProduct(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + a, q);
  return product;
}

function polyShiftSpecs(q) {
  const base = polyLinearProduct(q);
  const lows = q === 2 ? [1, 3, 5, 7] : [1, 2, 4, 5];
  return lows.map((low, i) => ({ id: `s${i + 1}`, h: polyMul(base, low, q) }));
}

function polynomialModuli(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const out = [];
  for (let degree = 1; degree <= Math.min(4, maxDegree); degree++) {
    for (const modulus of universe.irreduciblesByDegree[degree]) {
      const norm = q ** degree;
      if (norm <= 3) continue;
      out.push({ q, degree, norm, modulus, label: polyToString(modulus, q) });
      if (out.length >= 5) return out;
    }
  }
  return out;
}

function admissiblePolynomialResidues(q, modulus, shift) {
  const degree = Math.round(Math.log(Math.max(1, modulus)) / Math.log(q));
  const norm = q ** degree;
  const out = [];
  for (let residue = 1; residue < norm; residue++) {
    if (polyMod(polyAdd(residue, shift, q), modulus, q) === 0) continue;
    out.push(residue);
  }
  return out;
}

function fieldCellsForDegree(q, maxDegree, degree, moduli, mode, seed = 0) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const values = universe.irreduciblesByDegree[degree];
  const shifts = polyShiftSpecs(q);
  const random = rng(seed);
  const cells = [];
  const meta = [];
  for (const spec of moduli) {
    const classMass = q ** Math.max(0, degree - spec.degree);
    for (const shift of shifts) {
      const residues = admissiblePolynomialResidues(q, spec.modulus, shift.h);
      const index = new Map(residues.map((residue, i) => [residue, i]));
      const eligible = new Float64Array(residues.length).fill(classMass);
      const pair = new Float64Array(residues.length);
      const startPrime = new Float64Array(residues.length);
      const endPrime = new Float64Array(residues.length);
      for (const poly of values) {
        const r = polyMod(poly, spec.modulus, q);
        const j = index.get(r);
        if (j !== undefined) {
          startPrime[j]++;
          const mate = polyAdd(poly, shift.h, q);
          if (isMonicIrreducible(mate, universe)) pair[j]++;
        }
        const start = polySub(poly, shift.h, q);
        const sr = polyMod(start, spec.modulus, q);
        const k = index.get(sr);
        if (k !== undefined) endPrime[k]++;
      }
      const totalPairs = pair.reduce((sum, value) => sum + value, 0);
      const counts = mode === "real"
        ? pair
        : mode === "shuffle"
          ? multinomial(totalPairs, Array.from(eligible), random)
          : new Float64Array(residues.map((_, i) => eligible[i] - startPrime[i] - endPrime[i] + pair[i]));
      const total = counts.reduce((sum, value) => sum + value, 0);
      const residuals = residualCells(counts, Array.from(eligible), total);
      for (let i = 0; i < residuals.length; i++) {
        cells.push(residuals[i]);
        meta.push({
          universe: `F_${q}[t]`,
          degree,
          modulus: spec.label,
          modulusDegree: spec.degree,
          shift: shift.id,
          residue: residues[i],
        });
      }
    }
  }
  return { cells, meta };
}

function fieldAudit(q, maxDegree) {
  const moduli = polynomialModuli(q, maxDegree);
  const sizes = budgetSizes.filter((size) => size <= moduli.length);
  const start = Math.max(3, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    const row = { degree, budgets: [] };
    for (const size of sizes) {
      const chosen = moduli.slice(0, size);
      const real = fieldCellsForDegree(q, maxDegree, degree, chosen, "real");
      const composite = fieldCellsForDegree(q, maxDegree, degree, chosen, "composite");
      row.budgets.push({
        size,
        real: summarizeCells(real.cells, real.meta),
        composite: summarizeCells(composite.cells, composite.meta),
      });
    }
    rows.push(row);
  }
  const final = rows.at(-1);
  const controls = {};
  for (const size of sizes) {
    const chosen = moduli.slice(0, size);
    const group = seeds.map((seed) => {
      const shuffled = fieldCellsForDegree(q, maxDegree, final.degree, chosen, "shuffle", seed);
      return summarizeCells(shuffled.cells, shuffled.meta);
    });
    controls[size] = {
      shuffle: group,
      energyRange: range(group.map((item) => item.energy)),
      maxAbsRange: range(group.map((item) => item.maxAbs)),
    };
  }
  return { q, maxDegree, moduli, budgetSizes: sizes, degrees, rows, controls };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function strongestText(summary) {
  return summary.strongest.map((item) => {
    const mod = item.modulus || item.modulusDegree || "";
    return `${item.universe}:${mod}:r${item.residue}:h${item.shift}=${fmt(item.value, 3)}`;
  }).join(", ");
}

function mdFinalBudgetRows(integer, q2, q3) {
  const final = integer.rows.at(-1);
  return budgetSizes.map((size) => {
    const z = final.budgets.find((item) => item.size === size);
    const zc = integer.controls[size];
    const f2 = q2.rows.at(-1).budgets.find((item) => item.size === size);
    const f2c = q2.controls[size];
    const f3 = q3.rows.at(-1).budgets.find((item) => item.size === size);
    const f3c = q3.controls[size];
    return `| ${size} | ${fmt(z.real.energy)} | ${fmt(z.composite.energy)} | ${zc.energyRange.map((v) => fmt(v)).join(" .. ")} | ${f2 ? fmt(f2.real.energy) : "NA"} | ${f2 ? fmt(f2.composite.energy) : "NA"} | ${f2c ? f2c.energyRange.map((v) => fmt(v)).join(" .. ") : "NA"} | ${f3 ? fmt(f3.real.energy) : "NA"} | ${f3 ? fmt(f3.composite.energy) : "NA"} | ${f3c ? f3c.energyRange.map((v) => fmt(v)).join(" .. ") : "NA"} |`;
  }).join("\n");
}

function mdIntegerScaleRows(integer) {
  return integer.rows.map((row) => {
    const b = row.budgets.at(-1);
    return `| ${row.lo}..${row.hi} | ${fmt(b.real.energy)} | ${fmt(b.real.maxAbs)} | ${fmt(b.composite.energy)} | ${fmt(b.composite.maxAbs)} |`;
  }).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => {
    const b = row.budgets.at(-1);
    return `| ${row.degree} | ${fmt(b.real.energy)} | ${fmt(b.real.maxAbs)} | ${fmt(b.composite.energy)} | ${fmt(b.composite.maxAbs)} |`;
  }).join("\n");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function heatColor(value) {
  const x = Math.max(-4, Math.min(4, value)) / 4;
  if (x >= 0) {
    return `rgb(${Math.round(50 + 180 * x)},${Math.round(120 - 45 * x)},${Math.round(165 - 75 * x)})`;
  }
  const t = -x;
  return `rgb(${Math.round(55 - 20 * t)},${Math.round(115 + 115 * t)},${Math.round(170 + 45 * t)})`;
}

function heatmap(cells, x, y, w, h, title) {
  const cols = Math.min(72, cells.length);
  const rows = Math.ceil(cols / 24);
  const cellW = w / 24;
  const cellH = h / rows;
  const rects = cells.slice(0, cols).map((value, i) => {
    const cx = x + (i % 24) * cellW;
    const cy = y + Math.floor(i / 24) * cellH;
    return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(value)}"/>`;
  }).join("\n");
  return `<g font-family="Menlo, Consolas, monospace" font-size="10">
<text x="${x}" y="${y - 10}" fill="#e5e7eb" font-size="13">${title}</text>
${rects}
</g>`;
}

function svg(integer, q2, q3) {
  const width = 1160, height = 820;
  const zValues = integer.rows.map((row) => row.budgets.at(-1).real.energy);
  const zComp = integer.rows.map((row) => row.budgets.at(-1).composite.energy);
  const q2Values = q2.rows.map((row) => row.budgets.at(-1).real.energy);
  const q3Values = q3.rows.map((row) => row.budgets.at(-1).real.energy);
  const all = [...zValues, ...zComp, ...q2Values, ...q3Values, 1];
  const minY = Math.min(...all) * 0.85;
  const maxY = Math.max(...all) * 1.12;
  const chart = { x: 82, y: 72, w: 1000, h: 260 };
  const oneY = chart.y + chart.h - ((1 - minY) / (maxY - minY || 1)) * chart.h;
  const zFinal = integer.rows.at(-1).budgets.at(-1).real;
  const q2Final = q2.rows.at(-1).budgets.at(-1).real;
  const q3Final = q3.rows.at(-1).budgets.at(-1).real;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">residue-local additive pair interaction energy</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">energy of pair-start residue residuals after exact local admissibility weighting</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${oneY.toFixed(2)}" y2="${oneY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
<path d="${linePath(zValues, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${linePath(zComp, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#7dd3fc" stroke-width="3"/>
<path d="${linePath(q2Values, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fbbf24" stroke-width="3"/>
<path d="${linePath(q3Values, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f472b6" stroke-width="3"/>
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">Z scales / F_q top degrees</text>
<text x="${chart.x + 650}" y="${chart.y + chart.h + 24}" fill="#a7f3d0" font-size="12">Z prime pairs</text>
<text x="${chart.x + 790}" y="${chart.y + chart.h + 24}" fill="#7dd3fc" font-size="12">Z composite pairs</text>
<text x="${chart.x + 950}" y="${chart.y + chart.h + 24}" fill="#fbbf24" font-size="12">F2[t]</text>
<text x="${chart.x + 1020}" y="${chart.y + chart.h + 24}" fill="#f472b6" font-size="12">F3[t]</text>
</g>
${heatmap(zFinal.cells, 90, 430, 440, 120, "Z final residual cells")}
${heatmap(q2Final.cells, 90, 655, 440, 120, "F2[t] final cells")}
${heatmap(q3Final.cells, 650, 655, 440, 120, "F3[t] final cells")}
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="650" y="430" fill="#e5e7eb">final budget-${budgetSizes.at(-1)} summary</text>
<text x="650" y="460" fill="#a7f3d0">Z energy ${fmt(zFinal.energy)}, max ${fmt(zFinal.maxAbs)}</text>
<text x="650" y="484" fill="#94a3b8">Z shuffle ${integer.controls[budgetSizes.at(-1)].energyRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="508" fill="#7dd3fc">composite energy ${fmt(integer.rows.at(-1).budgets.at(-1).composite.energy)}</text>
<text x="650" y="532" fill="#fbbf24">F2 energy ${fmt(q2Final.energy)}, shuffle ${q2.controls[budgetSizes.at(-1)].energyRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="556" fill="#f472b6">F3 energy ${fmt(q3Final.energy)}, shuffle ${q3.controls[budgetSizes.at(-1)].energyRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="594" fill="#94a3b8">blue = negative residual, red = positive residual, clamp +/-4</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[residue-pair] building sieve to ${N}`);
const isp = sieve(N + Math.max(...integerShifts) + 2);
const primes = [];
for (let n = 2; n <= N + Math.max(...integerShifts); n++) if (isp[n]) primes.push(n);

console.error("[residue-pair] integer audit");
const integer = integerAudit(primes, isp);
console.error(`[residue-pair] F_2[t] degree ${q2MaxDegree}`);
const q2 = fieldAudit(2, q2MaxDegree);
console.error(`[residue-pair] F_3[t] degree ${q3MaxDegree}`);
const q3 = fieldAudit(3, q3MaxDegree);

const output = {
  candidate: "residue-local additive pair interaction energy",
  N,
  integer,
  q2,
  q3,
};

const jsonPath = path.join(outDir, `residue-pair-interaction-audit-${N}.json`);
const mdPath = path.join(outDir, `residue-pair-interaction-audit-${N}.md`);
const svgPath = path.join(outDir, `residue-pair-interaction-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer, q2, q3));

const final = integer.rows.at(-1).budgets.at(-1);
const q2Final = q2.rows.at(-1).budgets.at(-1);
const q3Final = q3.rows.at(-1).budgets.at(-1);
const finalSize = budgetSizes.at(-1);
const md = `# residue-local additive pair interaction energy audit

Candidate:
for each block, modulus, residue, and additive shift, count pair starts and
subtract the exact admissible residue-weighted local pair total. Collapse the
cell matrix by energy only after checking strongest cells and controls.

Integer moduli: \`${integerModuli.join(", ")}\`; shifts
\`${integerShifts.join(", ")}\`; budget sizes \`${budgetSizes.join(", ")}\`.

## Final-scale budget path

| budget | Z energy | Z composite energy | Z shuffle energy range | F2 energy | F2 composite energy | F2 shuffle range | F3 energy | F3 composite energy | F3 shuffle range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFinalBudgetRows(integer, q2, q3)}

## Integer scale stability at budget ${finalSize}

| block | Z energy | Z maxAbs | composite energy | composite maxAbs |
| --- | ---: | ---: | ---: | ---: |
${mdIntegerScaleRows(integer)}

## F_2[t] degree path at budget ${finalSize}

| degree | energy | maxAbs | composite energy | composite maxAbs |
| ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q2)}

## F_3[t] degree path at budget ${finalSize}

| degree | energy | maxAbs | composite energy | composite maxAbs |
| ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q3)}

## Strongest final cells

Z primes:
\`${strongestText(final.real)}\`

Z composite pairs:
\`${strongestText(final.composite)}\`

F_2[t]:
\`${strongestText(q2Final.real)}\`

F_3[t]:
\`${strongestText(q3Final.real)}\`

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  finalInteger: {
    energy: final.real.energy,
    maxAbs: final.real.maxAbs,
    compositeEnergy: final.composite.energy,
    shuffleEnergyRange: integer.controls[finalSize].energyRange,
  },
  q2Final: {
    energy: q2Final.real.energy,
    compositeEnergy: q2Final.composite.energy,
    shuffleEnergyRange: q2.controls[finalSize].energyRange,
  },
  q3Final: {
    energy: q3Final.real.energy,
    compositeEnergy: q3Final.composite.energy,
    shuffleEnergyRange: q3.controls[finalSize].energyRange,
  },
}, null, 2));
