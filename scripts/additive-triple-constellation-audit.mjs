#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  isMonicIrreducible,
  polyAdd,
  polyDegree,
  polyMod,
  polyMul,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 8_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 23);
const q3MaxDegree = Number(process.argv[5] || 14);

const W = 30030;
const singularCutoff = 100_000;
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(100_000, Math.round(x)));
const integerShiftAtoms = [6, 12, 18, 24, 30, 42];
const integerPairs = [];
for (let i = 0; i < integerShiftAtoms.length; i++) {
  for (let j = i + 1; j < integerShiftAtoms.length; j++) {
    integerPairs.push({ id: `${integerShiftAtoms[i]},${integerShiftAtoms[j]}`, shifts: [0, integerShiftAtoms[i], integerShiftAtoms[j]] });
  }
}

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

function gcd(a, b) {
  let x = Math.abs(a), y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function phiSmall(n) {
  let out = n, m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    out -= Math.floor(out / p);
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= Math.floor(out / m);
  return out;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function energy(cells) {
  return Math.sqrt(mean(cells.map((value) => value * value)));
}

function linearFit(xs, ys) {
  const n = xs.length;
  const mx = mean(xs);
  const my = mean(ys);
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  return { slope: sxy / (sxx || 1), intercept: my - (sxy / (sxx || 1)) * mx };
}

function exponent(rows, key, scaleKey) {
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function buildIntegralPrefix(limit, k) {
  const prefix = new Float64Array(limit + 1);
  for (let n = 1; n <= limit; n++) {
    prefix[n] = prefix[n - 1];
    if (n >= 3) prefix[n] += 1 / (Math.log(n) ** k);
  }
  return prefix;
}

function integerSingularSeries(shifts, primes) {
  const k = shifts.length;
  let product = 1;
  for (const p of primes) {
    const residues = new Set(shifts.map((shift) => ((shift % p) + p) % p));
    const nu = residues.size;
    if (nu >= p) return 0;
    product *= (1 - nu / p) / ((1 - 1 / p) ** k);
  }
  return product;
}

function flagsFromLabels(labels, limit) {
  const flags = new Uint8Array(limit + 1);
  for (const label of labels) {
    if (label >= 0 && label <= limit) flags[label] = 1;
  }
  return flags;
}

function labelsFromFlags(flags) {
  const labels = [];
  for (let n = 2; n < flags.length; n++) if (flags[n]) labels.push(n);
  return labels;
}

function wheelRandomLabels(limit, seed, isp, compositeOnly = false) {
  const random = rng(seed);
  const phi = phiSmall(W);
  const scale = W / phi;
  const labels = [];
  for (let n = 5; n <= limit; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, scale / Math.log(n))) labels.push(n);
  }
  return labels;
}

function topCells(cells, pairs) {
  return cells
    .map((value, i) => ({ pair: pairs[i].id, value, abs: Math.abs(value) }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 8);
}

function summarizeIntegerLabels(name, labels, flags, integralPrefix, pairFactors) {
  const cumulativeCounts = endpoints.map(() => new Int32Array(integerPairs.length));
  const maxEndpoint = endpoints.at(-1);
  for (let pairIndex = 0; pairIndex < integerPairs.length; pairIndex++) {
    const [, a, b] = integerPairs[pairIndex].shifts;
    let count = 0;
    let endpointIndex = 0;
    for (const n of labels) {
      while (endpointIndex < endpoints.length && n > endpoints[endpointIndex] - b) {
        cumulativeCounts[endpointIndex][pairIndex] = count;
        endpointIndex++;
      }
      if (n + b > maxEndpoint) break;
      if (flags[n + a] && flags[n + b]) count++;
    }
    while (endpointIndex < endpoints.length) {
      cumulativeCounts[endpointIndex][pairIndex] = count;
      endpointIndex++;
    }
  }

  const rows = endpoints.map((x, rowIndex) => {
    const cells = [];
    const counts = [];
    const mains = [];
    for (let pairIndex = 0; pairIndex < integerPairs.length; pairIndex++) {
      const b = integerPairs[pairIndex].shifts[2];
      const integral = integralPrefix[Math.max(0, Math.min(N, x - b))];
      const main = pairFactors[pairIndex] * integral;
      const count = cumulativeCounts[rowIndex][pairIndex];
      counts.push(count);
      mains.push(main);
      cells.push(main > 0 ? (count - main) / Math.sqrt(main) : 0);
    }
    return {
      N: x,
      labels: labels.filter((label) => label <= x).length,
      counts,
      mains,
      cells,
      energy: energy(cells),
      maxAbsCell: Math.max(...cells.map(Math.abs)),
      strongest: topCells(cells, integerPairs),
    };
  });

  const blocks = rows.map((row, i) => {
    const prev = i > 0 ? rows[i - 1] : null;
    const cells = row.cells.map((_, j) => {
      const count = row.counts[j] - (prev ? prev.counts[j] : 0);
      const main = row.mains[j] - (prev ? prev.mains[j] : 0);
      return main > 0 ? (count - main) / Math.sqrt(main) : 0;
    });
    return {
      lo: i > 0 ? rows[i - 1].N : 1,
      hi: row.N,
      cells,
      energy: energy(cells),
      maxAbsCell: Math.max(...cells.map(Math.abs)),
      strongest: topCells(cells, integerPairs),
    };
  });

  return {
    name,
    rows,
    blocks,
    exponent: {
      energy: exponent(rows, "energy", "N"),
      maxAbsCell: exponent(rows, "maxAbsCell", "N"),
    },
  };
}

function groupSummary(group) {
  const last = group.map((series) => series.rows.at(-1));
  return {
    energyRange: range(last.map((row) => row.energy)),
    maxAbsCellRange: range(last.map((row) => row.maxAbsCell)),
    thetaEnergyRange: range(group.map((series) => series.exponent.energy)),
    finalStrongest: group.map((series) => series.rows.at(-1).strongest[0]),
  };
}

function polyLinearProduct(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + a, q);
  return product;
}

function polynomialShiftAtoms(q) {
  const base = polyLinearProduct(q);
  const lows = q === 2
    ? [1, 2, 3, 7, 11]
    : [1, 2, q, q + 1, q + 2];
  const seen = new Set();
  const shifts = [];
  for (const low of lows) {
    const h = polyMul(base, low, q);
    if (h && !seen.has(h)) {
      seen.add(h);
      shifts.push(h);
    }
  }
  return shifts;
}

function polynomialPairs(q) {
  const shifts = polynomialShiftAtoms(q);
  const pairs = [];
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      pairs.push({
        id: `${polyToString(shifts[i], q)} | ${polyToString(shifts[j], q)}`,
        shifts: [0, shifts[i], shifts[j]],
      });
    }
  }
  return pairs;
}

function polynomialTupleSingular(universe, shifts, productDegree) {
  const q = universe.q;
  const k = shifts.length;
  let product = 1;
  for (let degree = 1; degree <= productDegree; degree++) {
    const norm = q ** degree;
    const denominator = (1 - 1 / norm) ** k;
    for (const primePoly of universe.irreduciblesByDegree[degree]) {
      const residues = new Set(shifts.map((shift) => polyMod(shift, primePoly, q)));
      const nu = residues.size;
      if (nu >= norm) return 0;
      product *= (1 - nu / norm) / denominator;
    }
  }
  return product;
}

function countPolynomialTriples(universe, degree, pairs, flags) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const counts = new Int32Array(pairs.length);
  for (let lower = 0; lower < flags.length; lower++) {
    if (!flags[lower]) continue;
    const poly = lead + lower;
    for (let i = 0; i < pairs.length; i++) {
      const [, h1, h2] = pairs[i].shifts;
      const mate1 = polyAdd(poly, h1, q);
      const mate2 = polyAdd(poly, h2, q);
      if (polyDegree(mate1, q) !== degree || polyDegree(mate2, q) !== degree) continue;
      if (flags[mate1 - lead] && flags[mate2 - lead]) counts[i]++;
    }
  }
  return Array.from(counts);
}

function randomPolynomialFlags(universe, degree, seed, reducibleOnly = false) {
  const random = rng(seed);
  const realFlags = universe.irreducibleFlagsByDegree[degree];
  const size = realFlags.length;
  const target = universe.counts[degree];
  const pool = reducibleOnly ? size - target : size;
  const p = pool > 0 ? target / pool : 0;
  const flags = new Uint8Array(size);
  for (let lower = 0; lower < size; lower++) {
    if (reducibleOnly && realFlags[lower]) continue;
    if (random() < p) flags[lower] = 1;
  }
  return flags;
}

function summarizePolynomialDegree(universe, degree, pairs, pairSingulars, flags, name) {
  const counts = countPolynomialTriples(universe, degree, pairs, flags);
  const cells = [];
  const mains = [];
  for (let i = 0; i < pairs.length; i++) {
    const main = pairSingulars[i] * universe.pow[degree] / (degree ** 3);
    mains.push(main);
    cells.push(main > 1e-9 ? (counts[i] - main) / Math.sqrt(main) : 0);
  }
  return {
    name,
    q: universe.q,
    degree,
    labels: flags.reduce((sum, value) => sum + value, 0),
    counts,
    mains,
    cells,
    energy: energy(cells),
    maxAbsCell: Math.max(...cells.map(Math.abs)),
    strongest: topCells(cells, pairs),
  };
}

function summarizePolynomialUniverse(q, maxDegree) {
  console.error(`[triple] building F_${q}[t] universe to degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const pairs = polynomialPairs(q);
  const pairSingulars = pairs.map((pair) => polynomialTupleSingular(universe, pair.shifts, maxDegree));
  const startDegree = Math.max(5, maxDegree - 4);
  const rows = [];
  for (let degree = startDegree; degree <= maxDegree; degree++) {
    console.error(`[triple] F_${q}[t] degree ${degree}`);
    const flags = universe.irreducibleFlagsByDegree[degree];
    rows.push(summarizePolynomialDegree(universe, degree, pairs, pairSingulars, flags, `F_${q}-real`));
  }
  const finalDegree = maxDegree;
  const randomMonic = seeds.map((seed) => summarizePolynomialDegree(
    universe,
    finalDegree,
    pairs,
    pairSingulars,
    randomPolynomialFlags(universe, finalDegree, seed, false),
    `F_${q}-random-monic-${seed}`,
  ));
  const randomReducible = seeds.map((seed) => summarizePolynomialDegree(
    universe,
    finalDegree,
    pairs,
    pairSingulars,
    randomPolynomialFlags(universe, finalDegree, seed ^ 0x9e3779b9, true),
    `F_${q}-random-reducible-${seed}`,
  ));
  return {
    q,
    maxDegree,
    pairs: pairs.map((pair, i) => ({ id: pair.id, singular: pairSingulars[i] })),
    rows,
    exponent: {
      energy: exponent(rows, "energy", "degree"),
      maxAbsCell: exponent(rows, "maxAbsCell", "degree"),
    },
    controls: {
      randomMonic,
      randomReducible,
      randomMonicSummary: {
        energyRange: range(randomMonic.map((row) => row.energy)),
        maxAbsCellRange: range(randomMonic.map((row) => row.maxAbsCell)),
      },
      randomReducibleSummary: {
        energyRange: range(randomReducible.map((row) => row.energy)),
        maxAbsCellRange: range(randomReducible.map((row) => row.maxAbsCell)),
      },
    },
  };
}

function mdRows(series) {
  return series.rows.map((row) => `| ${row.N} | ${row.labels} | ${row.energy.toFixed(6)} | ${row.maxAbsCell.toFixed(6)} | ${row.strongest[0].pair} ${row.strongest[0].value.toFixed(3)} |`).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => `| ${row.degree} | ${row.labels} | ${row.energy.toFixed(6)} | ${row.maxAbsCell.toFixed(6)} | ${row.strongest[0].pair} ${row.strongest[0].value.toFixed(3)} |`).join("\n");
}

function mdSummaryLine(name, summary) {
  return `| ${name} | ${summary.energyRange[0].toFixed(6)} .. ${summary.energyRange[1].toFixed(6)} | ${summary.maxAbsCellRange[0].toFixed(6)} .. ${summary.maxAbsCellRange[1].toFixed(6)} | ${summary.thetaEnergyRange ? `${summary.thetaEnergyRange[0].toFixed(6)} .. ${summary.thetaEnergyRange[1].toFixed(6)}` : ""} |`;
}

function svg(output) {
  const width = 1120, height = 640, pad = 66;
  const points = [
    ...output.integer.real.rows.map((row) => ({ group: "Z", x: Math.log(row.N), y: row.energy })),
    ...output.integer.wheelMean.rows.map((row) => ({ group: "wheel", x: Math.log(row.N), y: row.energy })),
    ...output.integer.compositeMean.rows.map((row) => ({ group: "composite", x: Math.log(row.N), y: row.energy })),
    ...output.functionFields.flatMap((field) => field.rows.map((row) => ({ group: `F_${field.q}`, x: Math.log(row.labels || 1), y: row.energy }))),
  ];
  const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x));
  const minY = 0, maxY = Math.max(1, ...points.map((p) => p.y)) * 1.08;
  const sx = (x) => pad + (x - minX) / ((maxX - minX) || 1) * (width - 2 * pad);
  const sy = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const colors = { Z: "#67e8f9", wheel: "#fbbf24", composite: "#fb7185", F_2: "#a78bfa", F_3: "#34d399" };
  const lineFor = (group) => {
    const groupPoints = points.filter((p) => p.group === group);
    const d = groupPoints.map((p, i) => `${i ? "L" : "M"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(" ");
    const circles = groupPoints.map((p) => `<circle cx="${sx(p.x).toFixed(2)}" cy="${sy(p.y).toFixed(2)}" r="4" fill="${colors[group]}"/>`).join("\n");
    return `<path d="${d}" fill="none" stroke="${colors[group]}" stroke-width="2.5"/>\n${circles}`;
  };
  const groups = ["Z", "wheel", "composite", ...output.functionFields.map((field) => `F_${field.q}`)];
  const legend = groups.map((group, i) => `<text x="${pad}" y="${30 + i * 19}" fill="${colors[group]}" font-size="13">${group} residual energy</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<g stroke="#1f2937" stroke-width="1">
${[0.25, 0.5, 0.75, 1].map((t) => `<line x1="${pad}" x2="${width - pad}" y1="${sy(maxY * t).toFixed(2)}" y2="${sy(maxY * t).toFixed(2)}"/>`).join("\n")}
</g>
${groups.map(lineFor).join("\n")}
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="22" fill="#f8fafc" font-size="18">HL-whitened additive triple constellation surface</text>
${legend}
<text x="${pad}" y="${height - 26}" fill="#94a3b8" font-size="12">x = log(range/labels), y = RMS cell residual after tuple singular-series subtraction</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[triple] integer side to ${N}`);
const isp = sieve(N);
const primesForSeries = primesUpTo(singularCutoff);
const integralPrefix = buildIntegralPrefix(N, 3);
const pairFactors = integerPairs.map((pair) => integerSingularSeries(pair.shifts, primesForSeries));
const realLabels = labelsFromFlags(isp);
const real = summarizeIntegerLabels("real-primes", realLabels, isp, integralPrefix, pairFactors);
const cramer = seeds.map((seed) => {
  const labels = cramerPrimes(N, seed);
  return summarizeIntegerLabels(`cramer-${seed}`, labels, flagsFromLabels(labels, N), integralPrefix, pairFactors);
});
const wheel = seeds.map((seed) => {
  const labels = wheelRandomLabels(N, seed, isp, false);
  return summarizeIntegerLabels(`wheel-${seed}`, labels, flagsFromLabels(labels, N), integralPrefix, pairFactors);
});
const composite = seeds.map((seed) => {
  const labels = wheelRandomLabels(N, seed ^ 0x9e3779b9, isp, true);
  return summarizeIntegerLabels(`composite-${seed}`, labels, flagsFromLabels(labels, N), integralPrefix, pairFactors);
});

function meanSeries(name, group) {
  return {
    name,
    rows: endpoints.map((x, i) => ({
      N: x,
      energy: mean(group.map((series) => series.rows[i].energy)),
      maxAbsCell: mean(group.map((series) => series.rows[i].maxAbsCell)),
    })),
  };
}

const functionFields = [
  summarizePolynomialUniverse(2, q2MaxDegree),
  summarizePolynomialUniverse(3, q3MaxDegree),
];

const output = {
  candidate: "HL-whitened additive triple constellation surface",
  N,
  W,
  singularCutoff,
  seeds,
  integer: {
    endpoints,
    pairs: integerPairs.map((pair, i) => ({ id: pair.id, singular: pairFactors[i] })),
    real,
    cramer,
    wheel,
    composite,
    wheelMean: meanSeries("wheel-mean", wheel),
    compositeMean: meanSeries("composite-mean", composite),
    summaries: {
      cramer: groupSummary(cramer),
      wheel: groupSummary(wheel),
      composite: groupSummary(composite),
    },
  },
  functionFields,
};

const jsonPath = path.join(outDir, `additive-triple-constellation-audit-${N}.json`);
const mdPath = path.join(outDir, `additive-triple-constellation-audit-${N}.md`);
const svgPath = path.join(outDir, `additive-triple-constellation-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(output));

const md = `# HL-whitened additive triple constellation audit

Candidate:
fixed additive triples \`n,n+a,n+b\` and \`f,f+h1,f+h2\`, with each cell
whitened as \`(observed-main)/sqrt(main)\` after singular-series subtraction.

Integer singular series used primes \`<=${singularCutoff}\`. Function-field
singular products used all irreducibles through the audited max degree.

## Integer side

| N | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
${mdRows(real)}

Integer exponent fits:
\`energy theta=${real.exponent.energy.toFixed(6)}\`,
\`max-cell theta=${real.exponent.maxAbsCell.toFixed(6)}\`.

Endpoint controls at N=${N}:

| group | residual energy range | max abs cell range | energy theta range |
| --- | ---: | ---: | ---: |
${mdSummaryLine("Cramer labels", output.integer.summaries.cramer)}
${mdSummaryLine("W=30030 fake labels", output.integer.summaries.wheel)}
${mdSummaryLine("W=30030 composite-only", output.integer.summaries.composite)}

Strongest real endpoint cells:

${real.rows.at(-1).strongest.map((cell) => `- ${cell.pair}: ${cell.value.toFixed(6)}`).join("\n")}

## Function-field side

${functionFields.map((field) => `### F_${field.q}[t]

| degree | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
${mdFieldRows(field)}

Endpoint random monic controls:
\`${field.controls.randomMonicSummary.energyRange[0].toFixed(6)} .. ${field.controls.randomMonicSummary.energyRange[1].toFixed(6)}\`
energy, max cell
\`${field.controls.randomMonicSummary.maxAbsCellRange[0].toFixed(6)} .. ${field.controls.randomMonicSummary.maxAbsCellRange[1].toFixed(6)}\`.

Endpoint random reducible controls:
\`${field.controls.randomReducibleSummary.energyRange[0].toFixed(6)} .. ${field.controls.randomReducibleSummary.energyRange[1].toFixed(6)}\`
energy, max cell
\`${field.controls.randomReducibleSummary.maxAbsCellRange[0].toFixed(6)} .. ${field.controls.randomReducibleSummary.maxAbsCellRange[1].toFixed(6)}\`.

Strongest endpoint cells:

${field.rows.at(-1).strongest.map((cell) => `- ${cell.pair}: ${cell.value.toFixed(6)}`).join("\n")}
`).join("\n")}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;

fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  integerLast: {
    N: real.rows.at(-1).N,
    labels: real.rows.at(-1).labels,
    energy: real.rows.at(-1).energy,
    maxAbsCell: real.rows.at(-1).maxAbsCell,
    strongest: real.rows.at(-1).strongest.slice(0, 5),
    exponent: real.exponent,
  },
  integerControls: {
    cramer: output.integer.summaries.cramer,
    wheel: output.integer.summaries.wheel,
    composite: output.integer.summaries.composite,
  },
  fieldLast: functionFields.map((field) => ({
    q: field.q,
    last: {
      degree: field.rows.at(-1).degree,
      labels: field.rows.at(-1).labels,
      energy: field.rows.at(-1).energy,
      maxAbsCell: field.rows.at(-1).maxAbsCell,
      strongest: field.rows.at(-1).strongest.slice(0, 5),
      exponent: field.exponent,
    },
    controls: {
      randomMonicSummary: field.controls.randomMonicSummary,
      randomReducibleSummary: field.controls.randomReducibleSummary,
    },
  })),
}, null, 2));
