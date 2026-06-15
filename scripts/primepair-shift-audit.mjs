#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  polyMul,
  polynomialTwinPrediction,
  twinIrreducibleCounts,
} from "../src/core/ffield.js";
import { cramerPrimes, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 24);
const q3MaxDegree = Number(process.argv[5] || 15);
const W = 30030;
const TWIN_PRIME_CONSTANT = 0.6601618158468696;
const integerShifts = [2, 4, 6, 8, 10, 12, 14, 16];
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));

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

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function energy(cells) {
  return Math.sqrt(cells.reduce((sum, value) => sum + value * value, 0) / cells.length);
}

function linearFit(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  const slope = sxy / (sxx || 1);
  return { slope, intercept: my - slope * mx };
}

function exponent(rows, key, scaleKey) {
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function wheelPairFactor(W, h) {
  const phi = phiSmall(W);
  let admissiblePairs = 0;
  for (let r = 0; r < W; r++) {
    if (gcd(r, W) === 1 && gcd(r + h, W) === 1) admissiblePairs++;
  }
  return (W * admissiblePairs) / (phi * phi);
}

function hardyLittlewoodPairFactor(h) {
  let out = 2 * TWIN_PRIME_CONSTANT;
  let m = Math.floor(Math.abs(h));
  while (m % 2 === 0) m = Math.floor(m / 2);
  for (let p = 3; p * p <= m; p += 2) {
    if (m % p !== 0) continue;
    out *= (p - 1) / (p - 2);
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out *= (m - 1) / (m - 2);
  return out;
}

function pairIntegralByEndpoint() {
  const out = new Map();
  let acc = 0, endpointIndex = 0;
  for (let n = 3; n <= N; n++) {
    const mid = n - 0.5;
    acc += 1 / (Math.log(mid) ** 2);
    while (endpointIndex < endpoints.length && n >= endpoints[endpointIndex]) {
      out.set(endpoints[endpointIndex], acc);
      endpointIndex++;
    }
  }
  return out;
}

function flagsFromLabels(labels, limit = N) {
  const flags = new Uint8Array(limit + 1);
  for (const label of labels) if (label <= limit) flags[label] = 1;
  return flags;
}

function wheelRandomFlags(seed, isp, compositeOnly = false) {
  const random = rng(seed);
  const phi = phiSmall(W);
  const scale = W / phi;
  const flags = new Uint8Array(N + 1);
  for (let n = 5; n <= N; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, scale / Math.log(n))) flags[n] = 1;
  }
  return flags;
}

function summarizeIntegerFlags(name, flags, mainByEndpoint, factors) {
  const maxShift = Math.max(...integerShifts);
  const counts = new Int32Array(integerShifts.length);
  const rows = [];
  let endpointIndex = 0;
  for (let n = 2; n <= N; n++) {
    if (flags[n]) {
      for (let i = 0; i < integerShifts.length; i++) {
        const h = integerShifts[i];
        if (n - h >= 2 && flags[n - h]) counts[i]++;
      }
    }
    while (endpointIndex < endpoints.length && n >= endpoints[endpointIndex]) {
      const x = endpoints[endpointIndex];
      const integral = mainByEndpoint.get(x);
      const cells = integerShifts.map((h, i) => {
        const main = factors.get(h) * integral;
        return main > 0 ? (counts[i] - main) / Math.sqrt(main) : 0;
      });
      rows.push({
        N: x,
        labels: x,
        counts: Array.from(counts),
        cells,
        energy: energy(cells),
        maxAbsCell: Math.max(...cells.map(Math.abs)),
      });
      endpointIndex++;
    }
    if (n + maxShift > N && endpointIndex >= endpoints.length) break;
  }
  const blocks = rows.map((row, i) => {
    const prev = i === 0 ? null : rows[i - 1];
    const lo = i === 0 ? 1 : endpoints[i - 1];
    const hi = row.N;
    const integral = mainByEndpoint.get(hi) - (mainByEndpoint.get(lo) || 0);
    const blockCounts = row.counts.map((count, hIndex) => count - (prev ? prev.counts[hIndex] : 0));
    const cells = integerShifts.map((h, hIndex) => {
      const main = factors.get(h) * integral;
      return main > 0 ? (blockCounts[hIndex] - main) / Math.sqrt(main) : 0;
    });
    return {
      lo,
      hi,
      labels: hi - lo,
      counts: blockCounts,
      cells,
      energy: energy(cells),
      maxAbsCell: Math.max(...cells.map(Math.abs)),
    };
  });
  return {
    name,
    rows,
    blocks,
    exponent: {
      energy: exponent(rows, "energy", "labels"),
      maxAbsCell: exponent(rows, "maxAbsCell", "labels"),
    },
  };
}

function integerAudit() {
  const isp = sieve(N);
  const realFlags = isp;
  const mainByEndpoint = pairIntegralByEndpoint();
  const factors = new Map(integerShifts.map((h) => [h, wheelPairFactor(W, h)]));
  const hlFactors = new Map(integerShifts.map((h) => [h, hardyLittlewoodPairFactor(h)]));
  const real = summarizeIntegerFlags("real-primes", realFlags, mainByEndpoint, factors);
  const realHL = summarizeIntegerFlags("real-primes-HL", realFlags, mainByEndpoint, hlFactors);
  const cramer = seeds.map((seed) => summarizeIntegerFlags(`cramer-${seed}`, flagsFromLabels(cramerPrimes(N, seed)), mainByEndpoint, factors));
  const wheel = seeds.map((seed) => summarizeIntegerFlags(`W${W}-fake-${seed}`, wheelRandomFlags(seed, isp, false), mainByEndpoint, factors));
  const composite = seeds.map((seed) => summarizeIntegerFlags(`W${W}-composite-${seed}`, wheelRandomFlags(seed ^ 0x9e3779b9, isp, true), mainByEndpoint, factors));
  function groupSummary(group) {
    const last = group.map((series) => series.rows.at(-1));
    return {
      energyRange: range(last.map((row) => row.energy)),
      maxAbsCellRange: range(last.map((row) => row.maxAbsCell)),
      thetaRange: range(group.map((series) => series.exponent.energy)),
    };
  }
  return {
    W,
    shifts: integerShifts,
    factors: Object.fromEntries([...factors.entries()]),
    hardyLittlewoodFactors: Object.fromEntries([...hlFactors.entries()]),
    real,
    realHL,
    cramer,
    wheel,
    composite,
    summaries: {
      cramer: groupSummary(cramer),
      wheel: groupSummary(wheel),
      composite: groupSummary(composite),
    },
  };
}

function polyLinearProduct(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + a, q);
  return product;
}

function polyShiftSpecs(q) {
  const linearProduct = polyLinearProduct(q);
  const lows = q === 2
    ? [1, 2, 3, 5, 7, 9, 11, 13]
    : [1, 2, 3, 4, 5, 10, 13, 17];
  return lows.map((low, i) => ({
    id: `L${q}*${i + 1}`,
    h: polyMul(linearProduct, low, q),
  }));
}

function summarizeField(q, maxDegree) {
  const shiftSpecs = polyShiftSpecs(q);
  const startDegree = Math.max(2, maxDegree - 4);
  const degrees = Array.from({ length: 5 }, (_, i) => startDegree + i);
  const countCurves = shiftSpecs.map((spec) => ({
    ...spec,
    counts: twinIrreducibleCounts(q, maxDegree, spec.h),
  }));
  const rows = degrees.map((degree) => {
    const cells = countCurves.map((curve) => {
      const predicted = polynomialTwinPrediction(q, degree, curve.h, maxDegree);
      return predicted > 0 ? (curve.counts[degree] - predicted) / Math.sqrt(predicted) : 0;
    });
    return {
      q,
      degree,
      labels: q ** degree,
      counts: countCurves.map((curve) => curve.counts[degree]),
      predicted: countCurves.map((curve) => polynomialTwinPrediction(q, degree, curve.h, maxDegree)),
      cells,
      energy: energy(cells),
      maxAbsCell: Math.max(...cells.map(Math.abs)),
    };
  });
  return {
    q,
    shifts: shiftSpecs,
    rows,
    exponent: {
      energy: exponent(rows, "energy", "labels"),
      maxAbsCell: exponent(rows, "maxAbsCell", "labels"),
    },
  };
}

function mdRows(rows, firstColumn) {
  return rows.map((row) => `| ${firstColumn(row)} | ${row.energy.toFixed(6)} | ${row.maxAbsCell.toFixed(6)} | ${row.cells.map((v) => v.toFixed(3)).join(", ")} |`).join("\n");
}

function mdIntegerControls(label, summary) {
  return `| ${label} | ${summary.energyRange[0].toFixed(6)} .. ${summary.energyRange[1].toFixed(6)} | ${summary.maxAbsCellRange[0].toFixed(6)} .. ${summary.maxAbsCellRange[1].toFixed(6)} | ${summary.thetaRange[0].toFixed(6)} .. ${summary.thetaRange[1].toFixed(6)} |`;
}

function svg(integerRows, integerHLRows, q2Rows, q3Rows) {
  const width = 1040, height = 620, pad = 64;
  const series = [
    { name: "Z finite-wheel residual energy", rows: integerRows, color: "#7dd3fc" },
    { name: "Z full-HL residual energy", rows: integerHLRows, color: "#a7f3d0" },
    { name: "F2[t] irreducible-pair residual energy", rows: q2Rows, color: "#fbbf24" },
    { name: "F3[t] irreducible-pair residual energy", rows: q3Rows, color: "#f472b6" },
  ];
  const maxY = Math.max(...series.flatMap((s) => s.rows.map((row) => row.energy)), 1) * 1.12;
  const xScale = (i) => pad + (i / 4) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y / maxY) * (height - 2 * pad);
  const paths = series.map((s) => {
    const d = s.rows.map((row, i) => `${i ? "L" : "M"} ${xScale(i).toFixed(2)} ${yScale(row.energy).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3"/>`;
  }).join("\n");
  const points = series.flatMap((s) => s.rows.map((row, i) => `<circle cx="${xScale(i).toFixed(2)}" cy="${yScale(row.energy).toFixed(2)}" r="4" fill="${s.color}"/>`)).join("\n");
  const legend = series.map((s, i) => `<text x="${pad}" y="${26 + i * 18}" fill="${s.color}">${s.name}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}" stroke="#64748b"/>
<line x1="${pad}" x2="${pad}" y1="${pad}" y2="${height - pad}" stroke="#64748b"/>
${paths}
${points}
<g font-family="Menlo, Consolas, monospace" font-size="12">
${legend}
<text x="${pad}" y="${height - 22}" fill="#94a3b8">normalized residual energy after finite-wheel / polynomial singular-series pair main</text>
<text x="${width - pad - 160}" y="${height - 22}" fill="#94a3b8">five growing scales</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[primepair] integer audit to ${N}`);
const integer = integerAudit();
console.error(`[primepair] F_2[t] to degree ${q2MaxDegree}`);
const q2 = summarizeField(2, q2MaxDegree);
console.error(`[primepair] F_3[t] to degree ${q3MaxDegree}`);
const q3 = summarizeField(3, q3MaxDegree);

const output = {
  candidate: "two-universes prime-pair shift residual matrix",
  N,
  integer,
  q2,
  q3,
};

const jsonPath = path.join(outDir, `primepair-shift-audit-${N}.json`);
const mdPath = path.join(outDir, `primepair-shift-audit-${N}.md`);
const svgPath = path.join(outDir, `primepair-shift-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer.real.rows, integer.realHL.rows, q2.rows, q3.rows));

const md = `# prime-pair shift residual matrix audit

Candidate:
\`R_Z(x,h)=(pair_count - K_W(h) integral dt/log(t)^2)/sqrt(main)\` and
\`R_q(d,h)=(twin_irreducible_count - polynomial_prediction)/sqrt(prediction)\`.

Integer finite wheel: \`W=${W}\`, shifts \`${integerShifts.join(", ")}\`.

## Integer cumulative

Energy exponent over endpoints: \`${integer.real.exponent.energy.toFixed(6)}\`.

| N | energy | maxAbs cell | residual cells |
| ---: | ---: | ---: | --- |
${mdRows(integer.real.rows, (row) => row.N)}

## Integer cumulative with full Hardy-Littlewood factors

Energy exponent over endpoints: \`${integer.realHL.exponent.energy.toFixed(6)}\`.

| N | energy | maxAbs cell | residual cells |
| ---: | ---: | ---: | --- |
${mdRows(integer.realHL.rows, (row) => row.N)}

## Integer dyadic blocks

| block | energy | maxAbs cell | residual cells |
| --- | ---: | ---: | --- |
${mdRows(integer.real.blocks, (row) => `${row.lo}..${row.hi}`)}

## Integer controls at N=${N}

| group | energy range | maxAbs cell range | energy theta range |
| --- | ---: | ---: | ---: |
${mdIntegerControls("ordinary Cramer", integer.summaries.cramer)}
${mdIntegerControls(`W=${W} fake labels`, integer.summaries.wheel)}
${mdIntegerControls(`W=${W} composite-only`, integer.summaries.composite)}

## F_2[t]

Energy exponent over degrees: \`${q2.exponent.energy.toFixed(6)}\`.

| degree | energy | maxAbs cell | residual cells |
| ---: | ---: | ---: | --- |
${mdRows(q2.rows, (row) => row.degree)}

## F_3[t]

Energy exponent over degrees: \`${q3.exponent.energy.toFixed(6)}\`.

| degree | energy | maxAbs cell | residual cells |
| ---: | ---: | ---: | --- |
${mdRows(q3.rows, (row) => row.degree)}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  integerLast: integer.real.rows.at(-1),
  integerHLLast: integer.realHL.rows.at(-1),
  integerControlSummaries: integer.summaries,
  q2Last: q2.rows.at(-1),
  q3Last: q3.rows.at(-1),
}, null, 2));
