#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polyMul,
  polySub,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 2_000_000);
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q2MaxDegree = Number(process.argv[4] || 22);
const q3MaxDegree = Number(process.argv[5] || 13);

const seeds = [12345, 271828, 314159, 161803, 424242];
const integerShifts = [6, 12, 18, 24, 30, 42, 60, 90];
const W = 30030;

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

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} from pool of ${pool.length}`);
  const rnd = rng(seed);
  const copy = pool.slice();
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rnd() * (copy.length - i));
    const value = copy[j];
    copy[j] = copy[i];
    copy[i] = value;
    out[i] = value;
  }
  out.sort((a, b) => a - b);
  return out;
}

function integerCompositePool(limit, primeFlags) {
  const out = [];
  for (let n = 5; n <= limit; n++) {
    if (primeFlags[n]) continue;
    if (gcd(n, W) !== 1) continue;
    out.push(n);
  }
  return out;
}

function integerRates(labels, flags, limit, shifts, lo = 0, hi = limit) {
  const rates = [];
  for (const h of shifts) {
    let eligible = 0;
    let edges = 0;
    for (const v of labels) {
      if (v <= lo || v > hi || v + h > hi) continue;
      eligible++;
      if (flags[v + h]) edges++;
    }
    rates.push({ shift: h, eligible, edges, rate: edges / Math.max(1, eligible) });
  }
  return rates;
}

function residualTensorForInteger(labels, flags, limit, shifts, baselineRates, lo = 0, hi = limit) {
  const rows = [];
  const maxShift = Math.max(...shifts);
  for (const v of labels) {
    if (v <= lo || v + maxShift > hi) continue;
    rows.push(v);
  }
  return residualTensor(rows, shifts, baselineRates, (v, h) => flags[v + h] ? 1 : 0);
}

function residualTensor(vertices, shifts, baselineRates, edgeAt) {
  const k = shifts.length;
  const rates = baselineRates.map((row) => Math.min(1 - 1e-9, Math.max(1e-9, row.rate)));
  const sums = new Float64Array(k);
  const matrix = Array.from({ length: k }, () => new Float64Array(k));
  for (const v of vertices) {
    const z = new Float64Array(k);
    for (let i = 0; i < k; i++) {
      const p = rates[i];
      z[i] = (edgeAt(v, shifts[i]) - p) / Math.sqrt(p * (1 - p));
      sums[i] += z[i];
    }
    for (let i = 0; i < k; i++) {
      for (let j = i; j < k; j++) {
        matrix[i][j] += z[i] * z[j];
      }
    }
  }
  const n = vertices.length;
  let offdiagSum = 0;
  let offdiagCount = 0;
  let maxAbsOffdiag = 0;
  const normalized = Array.from({ length: k }, () => new Array(k).fill(0));
  for (let i = 0; i < k; i++) {
    for (let j = i; j < k; j++) {
      const value = matrix[i][j] / Math.max(1, n);
      normalized[i][j] = value;
      normalized[j][i] = value;
      if (i !== j) {
        offdiagSum += value * value;
        offdiagCount++;
        maxAbsOffdiag = Math.max(maxAbsOffdiag, Math.abs(value));
      }
    }
  }
  const meanResiduals = Array.from(sums, (sum) => sum / Math.max(1, n));
  return {
    vertices: n,
    offdiagRms: Math.sqrt(offdiagSum / Math.max(1, offdiagCount)),
    maxAbsOffdiag,
    meanAbsResidual: mean(meanResiduals.map(Math.abs)),
    maxAbsMeanResidual: Math.max(...meanResiduals.map(Math.abs)),
    diagonalMean: mean(normalized.map((row, i) => row[i])),
    matrix: normalized,
    meanResiduals,
  };
}

function summarizeControls(rows) {
  return {
    offdiagRms: range(rows.map((row) => row.offdiagRms)),
    maxAbsOffdiag: range(rows.map((row) => row.maxAbsOffdiag)),
    meanAbsResidual: range(rows.map((row) => row.meanAbsResidual)),
    maxAbsMeanResidual: range(rows.map((row) => row.maxAbsMeanResidual)),
  };
}

function runIntegerAudit() {
  const maxShift = Math.max(...integerShifts);
  const flags = sieve(N + maxShift);
  const primes = primesUpTo(N + maxShift).filter((p) => p <= N);
  const split = Math.floor(N / 2);
  const baselineRates = integerRates(primes, flags, N, integerShifts, 0, split);
  const real = residualTensorForInteger(primes, flags, N, integerShifts, baselineRates, split, N);
  const cramer = seeds.map((seed) => {
    const labels = cramerPrimes(N + maxShift, seed).filter((p) => p <= N);
    const cflags = new Uint8Array(N + maxShift + 1);
    for (const label of labels) cflags[label] = 1;
    const rates = integerRates(labels, cflags, N, integerShifts, 0, split);
    return { seed, ...residualTensorForInteger(labels, cflags, N, integerShifts, rates, split, N) };
  });
  const composites = integerCompositePool(N, flags);
  const composite = seeds.map((seed) => {
    const labels = sampleWithoutReplacement(composites, primes.length, seed);
    const cflags = new Uint8Array(N + maxShift + 1);
    for (const label of labels) cflags[label] = 1;
    const rates = integerRates(labels, cflags, N, integerShifts, 0, split);
    return { seed, ...residualTensorForInteger(labels, cflags, N, integerShifts, rates, split, N) };
  });
  return {
    N,
    split,
    shifts: integerShifts,
    labels: primes.length,
    trainRates: baselineRates,
    holdout: real,
    cramer,
    composite,
    controls: {
      cramer: summarizeControls(cramer),
      composite: summarizeControls(composite),
    },
  };
}

function polyLinearProduct(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + a, q);
  return product;
}

function uniquePolynomialShifts(q) {
  const base = polyLinearProduct(q);
  const lows = q === 2 ? [1, 2, 3, 5, 7, 11] : [1, 2, 3, 4, 5, 7];
  const seen = new Set();
  const shifts = [];
  for (const low of lows) {
    for (const h of [polyMul(base, low, q), polySub(0, polyMul(base, low, q), q)]) {
      if (!h || seen.has(h)) continue;
      seen.add(h);
      shifts.push(h);
    }
  }
  return shifts;
}

function polynomialPool(universe, degree, mode) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  if (mode === "irreducible") return universe.irreduciblesByDegree[degree].slice();
  const out = [];
  for (let lower = 0; lower < flags.length; lower++) {
    if (mode === "monic" || (mode === "reducible" && !flags[lower])) out.push(lead + lower);
  }
  return out;
}

function polynomialRates(labels, universe, degree, shifts) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const pow = universe.pow[degree];
  const labelSet = new Set(labels);
  return shifts.map((h) => {
    let eligible = 0;
    let edges = 0;
    for (const f of labels) {
      const g = polyAdd(f, h, q);
      if (g < lead || g >= lead + pow) continue;
      eligible++;
      if (labelSet.has(g)) edges++;
    }
    return { shift: polyToString(h, q), h, eligible, edges, rate: edges / Math.max(1, eligible) };
  });
}

function residualTensorForPolynomial(labels, universe, degree, shifts, baselineRates) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const pow = universe.pow[degree];
  const labelSet = new Set(labels);
  const vertices = labels.filter((f) => shifts.every((h) => {
    const g = polyAdd(f, h, q);
    return g >= lead && g < lead + pow;
  }));
  return residualTensor(vertices, shifts, baselineRates, (f, h) => labelSet.has(polyAdd(f, h, q)) ? 1 : 0);
}

function runPolynomialAudit(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const shifts = uniquePolynomialShifts(q);
  const trainDegree = maxDegree - 1;
  const holdoutDegree = maxDegree;
  const trainLabels = polynomialPool(universe, trainDegree, "irreducible");
  const holdoutLabels = polynomialPool(universe, holdoutDegree, "irreducible");
  const baselineRates = polynomialRates(trainLabels, universe, trainDegree, shifts);
  const real = residualTensorForPolynomial(holdoutLabels, universe, holdoutDegree, shifts, baselineRates);
  const randomMonic = seeds.map((seed) => {
    const train = sampleWithoutReplacement(polynomialPool(universe, trainDegree, "monic"), trainLabels.length, seed);
    const holdout = sampleWithoutReplacement(polynomialPool(universe, holdoutDegree, "monic"), holdoutLabels.length, seed ^ 0x517cc1b7);
    const rates = polynomialRates(train, universe, trainDegree, shifts);
    return { seed, ...residualTensorForPolynomial(holdout, universe, holdoutDegree, shifts, rates) };
  });
  const randomReducible = seeds.map((seed) => {
    const train = sampleWithoutReplacement(polynomialPool(universe, trainDegree, "reducible"), trainLabels.length, seed ^ 0x9e3779b9);
    const holdout = sampleWithoutReplacement(polynomialPool(universe, holdoutDegree, "reducible"), holdoutLabels.length, seed ^ 0x243f6a88);
    const rates = polynomialRates(train, universe, trainDegree, shifts);
    return { seed, ...residualTensorForPolynomial(holdout, universe, holdoutDegree, shifts, rates) };
  });
  return {
    q,
    trainDegree,
    holdoutDegree,
    shifts: shifts.map((h) => polyToString(h, q)),
    trainLabels: trainLabels.length,
    holdoutLabels: holdoutLabels.length,
    trainRates: baselineRates.map(({ shift, eligible, edges, rate }) => ({ shift, eligible, edges, rate })),
    holdout: real,
    randomMonic,
    randomReducible,
    controls: {
      randomMonic: summarizeControls(randomMonic),
      randomReducible: summarizeControls(randomReducible),
    },
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Centered multi-shift tensor audit", "");
  lines.push("Candidate:");
  lines.push("subtract per-shift train edge rates, then score the holdout off-diagonal covariance of normalized residual edge variables", "");
  lines.push("```text");
  lines.push("Z_h(v) = (1_{v+h is prime-like} - p_h(train)) / sqrt(p_h(train)(1-p_h(train)))");
  lines.push("score = RMS_{h != k} mean_holdout Z_h(v) Z_k(v)");
  lines.push("```", "");
  lines.push("## Integer side", "");
  lines.push(`N=${report.integer.N}, split=${report.integer.split}, labels=${report.integer.labels}`);
  lines.push("");
  lines.push("| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual |");
  lines.push("| --- | ---: | ---: | ---: | ---: |");
  lines.push(`| real primes | ${fmt(report.integer.holdout.offdiagRms)} | ${fmt(report.integer.holdout.maxAbsOffdiag)} | ${fmt(report.integer.holdout.meanAbsResidual)} | ${fmt(report.integer.holdout.maxAbsMeanResidual)} |`);
  lines.push(`| Cramer controls | ${fmt(report.integer.controls.cramer.offdiagRms[0])}..${fmt(report.integer.controls.cramer.offdiagRms[1])} | ${fmt(report.integer.controls.cramer.maxAbsOffdiag[0])}..${fmt(report.integer.controls.cramer.maxAbsOffdiag[1])} | ${fmt(report.integer.controls.cramer.meanAbsResidual[0])}..${fmt(report.integer.controls.cramer.meanAbsResidual[1])} | ${fmt(report.integer.controls.cramer.maxAbsMeanResidual[0])}..${fmt(report.integer.controls.cramer.maxAbsMeanResidual[1])} |`);
  lines.push(`| composite controls | ${fmt(report.integer.controls.composite.offdiagRms[0])}..${fmt(report.integer.controls.composite.offdiagRms[1])} | ${fmt(report.integer.controls.composite.maxAbsOffdiag[0])}..${fmt(report.integer.controls.composite.maxAbsOffdiag[1])} | ${fmt(report.integer.controls.composite.meanAbsResidual[0])}..${fmt(report.integer.controls.composite.meanAbsResidual[1])} | ${fmt(report.integer.controls.composite.maxAbsMeanResidual[0])}..${fmt(report.integer.controls.composite.maxAbsMeanResidual[1])} |`);
  lines.push("");
  for (const field of report.functionFields) {
    lines.push(`## F_${field.q}[t] side`, "");
    lines.push(`train degree=${field.trainDegree}, holdout degree=${field.holdoutDegree}, train labels=${field.trainLabels}, holdout labels=${field.holdoutLabels}`);
    lines.push("");
    lines.push("| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual |");
    lines.push("| --- | ---: | ---: | ---: | ---: |");
    lines.push(`| real irreducibles | ${fmt(field.holdout.offdiagRms)} | ${fmt(field.holdout.maxAbsOffdiag)} | ${fmt(field.holdout.meanAbsResidual)} | ${fmt(field.holdout.maxAbsMeanResidual)} |`);
    lines.push(`| random monic controls | ${fmt(field.controls.randomMonic.offdiagRms[0])}..${fmt(field.controls.randomMonic.offdiagRms[1])} | ${fmt(field.controls.randomMonic.maxAbsOffdiag[0])}..${fmt(field.controls.randomMonic.maxAbsOffdiag[1])} | ${fmt(field.controls.randomMonic.meanAbsResidual[0])}..${fmt(field.controls.randomMonic.meanAbsResidual[1])} | ${fmt(field.controls.randomMonic.maxAbsMeanResidual[0])}..${fmt(field.controls.randomMonic.maxAbsMeanResidual[1])} |`);
    lines.push(`| random reducible controls | ${fmt(field.controls.randomReducible.offdiagRms[0])}..${fmt(field.controls.randomReducible.offdiagRms[1])} | ${fmt(field.controls.randomReducible.maxAbsOffdiag[0])}..${fmt(field.controls.randomReducible.maxAbsOffdiag[1])} | ${fmt(field.controls.randomReducible.meanAbsResidual[0])}..${fmt(field.controls.randomReducible.meanAbsResidual[1])} | ${fmt(field.controls.randomReducible.maxAbsMeanResidual[0])}..${fmt(field.controls.randomReducible.maxAbsMeanResidual[1])} |`);
    lines.push("");
  }
  lines.push(`JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function renderSvg(report) {
  const width = 1120, height = 640, pad = 70;
  const rows = [
    { label: "Z real", value: report.integer.holdout.offdiagRms, color: "#67e8f9" },
    { label: "Z Cramer max", value: report.integer.controls.cramer.offdiagRms[1], color: "#fb7185" },
    { label: "Z composite max", value: report.integer.controls.composite.offdiagRms[1], color: "#fbbf24" },
    ...report.functionFields.flatMap((field) => [
      { label: `F_${field.q} real`, value: field.holdout.offdiagRms, color: field.q === 2 ? "#a78bfa" : "#34d399" },
      { label: `F_${field.q} monic max`, value: field.controls.randomMonic.offdiagRms[1], color: "#94a3b8" },
      { label: `F_${field.q} reducible max`, value: field.controls.randomReducible.offdiagRms[1], color: "#c084fc" },
    ]),
  ];
  const max = Math.max(...rows.map((row) => row.value)) * 1.12;
  const barW = (width - 2 * pad) / rows.length;
  const bars = rows.map((row, i) => {
    const h = (row.value / max) * (height - 2 * pad - 70);
    const x = pad + i * barW + 8;
    const y = height - pad - h;
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(12, barW - 16).toFixed(2)}" height="${h.toFixed(2)}" fill="${row.color}" opacity="0.82"/><text transform="translate(${(x + barW / 2 - 8).toFixed(2)} ${height - pad + 8}) rotate(60)" fill="#cbd5e1" font-size="12">${row.label}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${pad}" y="34" fill="#f8fafc" font-size="19" font-weight="700">centered multi-shift tensor off-diagonal RMS</text>
<text x="${pad}" y="58" fill="#94a3b8" font-size="13">pair-centered train/holdout residual covariance; lower is more null-like</text>
<line x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}" stroke="#334155"/>
${bars}
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[centered-tensor] integer side N=${N}`);
const integer = runIntegerAudit();
console.error(`[centered-tensor] function fields F_2 degree=${q2MaxDegree}, F_3 degree=${q3MaxDegree}`);
const functionFields = [
  runPolynomialAudit(2, q2MaxDegree),
  runPolynomialAudit(3, q3MaxDegree),
];

const base = `cycle-003-centered-shift-tensor-${N}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};

const report = {
  candidate: "centered multi-shift residual tensor",
  generatedAt: new Date().toISOString(),
  N,
  q2MaxDegree,
  q3MaxDegree,
  W,
  seeds,
  integer,
  functionFields,
  paths,
};

fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  integer: {
    offdiagRms: integer.holdout.offdiagRms,
    cramerRange: integer.controls.cramer.offdiagRms,
    compositeRange: integer.controls.composite.offdiagRms,
  },
  functionFields: functionFields.map((field) => ({
    q: field.q,
    holdoutDegree: field.holdoutDegree,
    offdiagRms: field.holdout.offdiagRms,
    randomMonicRange: field.controls.randomMonic.offdiagRms,
    randomReducibleRange: field.controls.randomReducible.offdiagRms,
  })),
  paths,
}, null, 2));
