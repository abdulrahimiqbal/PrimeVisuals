#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  polyMul,
  polynomialTwinPrediction,
  twinIrreducibleCounts,
} from "../src/core/ffield.js";
import { sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 24);
const q3MaxDegree = Number(process.argv[5] || 15);

const W = 30030;
const TWIN_PRIME_CONSTANT = 0.6601618158468696;
const integerShifts = [2, 4, 6, 8, 10, 12, 14, 16];
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 32, N / 16, N / 8, N / 4, N / 2, N]
  .map((x) => Math.max(1000, Math.round(x)));

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

function dot(a, b) {
  let out = 0;
  for (let i = 0; i < a.length; i++) out += a[i] * b[i];
  return out;
}

function norm(a) {
  return Math.sqrt(dot(a, a));
}

function unit(a) {
  const m = norm(a);
  return m > 0 ? a.map((v) => v / m) : a.map(() => 0);
}

function cosine(a, b) {
  const ma = norm(a), mb = norm(b);
  return ma > 0 && mb > 0 ? dot(a, b) / (ma * mb) : 0;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function stdev(values) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - m) ** 2)));
}

function sign(value) {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

function signHamming(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (sign(a[i]) !== sign(b[i])) diff++;
  return diff / a.length;
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

function wheelPairFactor(W, h) {
  const phi = phiSmall(W);
  let admissiblePairs = 0;
  for (let r = 0; r < W; r++) {
    if (gcd(r, W) === 1 && gcd(r + h, W) === 1) admissiblePairs++;
  }
  return (W * admissiblePairs) / (phi * phi);
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

function directionMetrics(rows) {
  const vectors = rows.map((row) => row.cells);
  const directions = vectors.map(unit);
  const anchor = vectors[0] || [];
  const adjacentCosines = [];
  const anchorCosines = [];
  const anchorProjections = [];
  const anchorHamming = [];
  const pairwiseCosines = [];
  for (let i = 0; i < vectors.length; i++) {
    if (i > 0) adjacentCosines.push(cosine(vectors[i - 1], vectors[i]));
    anchorCosines.push(cosine(anchor, vectors[i]));
    anchorProjections.push(dot(vectors[i], unit(anchor)) / Math.sqrt(vectors[i].length || 1));
    anchorHamming.push(signHamming(anchor, vectors[i]));
    for (let j = 0; j < i; j++) pairwiseCosines.push(cosine(vectors[j], vectors[i]));
  }
  return {
    adjacentCosines,
    anchorCosines,
    anchorProjections,
    anchorHamming,
    meanAdjacentCosine: mean(adjacentCosines),
    minAdjacentCosine: Math.min(...adjacentCosines),
    meanPairwiseCosine: mean(pairwiseCosines),
    stdevPairwiseCosine: stdev(pairwiseCosines),
    meanAnchorHamming: mean(anchorHamming.slice(1)),
    directions,
  };
}

function summarizeIntegerFlags(name, flags, mainByEndpoint, factors) {
  const counts = new Int32Array(integerShifts.length);
  const cumulative = [];
  let endpointIndex = 0;
  for (let n = 2; n <= N; n++) {
    if (flags[n]) {
      for (let i = 0; i < integerShifts.length; i++) {
        const h = integerShifts[i];
        if (n - h >= 2 && flags[n - h]) counts[i]++;
      }
    }
    while (endpointIndex < endpoints.length && n >= endpoints[endpointIndex]) {
      cumulative.push({ N: endpoints[endpointIndex], counts: Array.from(counts) });
      endpointIndex++;
    }
  }
  const blocks = cumulative.map((row, i) => {
    const prev = i === 0 ? null : cumulative[i - 1];
    const lo = i === 0 ? 1 : cumulative[i - 1].N;
    const hi = row.N;
    const integral = mainByEndpoint.get(hi) - (mainByEndpoint.get(lo) || 0);
    const blockCounts = row.counts.map((count, hIndex) => count - (prev ? prev.counts[hIndex] : 0));
    const cells = integerShifts.map((h, hIndex) => {
      const main = factors.get(h) * integral;
      return main > 0 ? (blockCounts[hIndex] - main) / Math.sqrt(main) : 0;
    });
    return {
      id: `${lo}..${hi}`,
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
    blocks,
    metrics: directionMetrics(blocks),
  };
}

function integerAudit() {
  const isp = sieve(N);
  const mainByEndpoint = pairIntegralByEndpoint();
  const hlFactors = new Map(integerShifts.map((h) => [h, hardyLittlewoodPairFactor(h)]));
  const wheelFactors = new Map(integerShifts.map((h) => [h, wheelPairFactor(W, h)]));
  const wheelFlags = seeds.map((seed) => ({ seed, flags: wheelRandomFlags(seed, isp, false) }));
  const compositeFlags = seeds.map((seed) => ({ seed, flags: wheelRandomFlags(seed ^ 0x9e3779b9, isp, true) }));
  const real = summarizeIntegerFlags("real-primes-HL-blocks", isp, mainByEndpoint, hlFactors);
  const wheelAgainstHL = wheelFlags.map(({ seed, flags }) => summarizeIntegerFlags(`W${W}-fake-${seed}-against-HL`, flags, mainByEndpoint, hlFactors));
  const wheelOwnMain = wheelFlags.map(({ seed, flags }) => summarizeIntegerFlags(`W${W}-fake-${seed}-own-main`, flags, mainByEndpoint, wheelFactors));
  const composite = compositeFlags.map(({ seed, flags }) => summarizeIntegerFlags(`W${W}-composite-${seed}`, flags, mainByEndpoint, hlFactors));
  const summarizeGroup = (group) => ({
    meanEnergyRange: range(group.map((series) => mean(series.blocks.map((row) => row.energy)))),
    maxBlockEnergyRange: range(group.map((series) => Math.max(...series.blocks.map((row) => row.energy)))),
    meanAdjacentCosineRange: range(group.map((series) => series.metrics.meanAdjacentCosine)),
    minAdjacentCosineRange: range(group.map((series) => series.metrics.minAdjacentCosine)),
    meanPairwiseCosineRange: range(group.map((series) => series.metrics.meanPairwiseCosine)),
    meanAnchorHammingRange: range(group.map((series) => series.metrics.meanAnchorHamming)),
  });
  return {
    N,
    W,
    endpoints,
    shifts: integerShifts,
    hardyLittlewoodFactors: Object.fromEntries([...hlFactors.entries()]),
    wheelFactors: Object.fromEntries([...wheelFactors.entries()]),
    real,
    wheelAgainstHL,
    wheelOwnMain,
    composite,
    summaries: {
      wheelAgainstHL: summarizeGroup(wheelAgainstHL),
      wheelOwnMain: summarizeGroup(wheelOwnMain),
      composite: summarizeGroup(composite),
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
  const startDegree = Math.max(2, maxDegree - 5);
  const degrees = Array.from({ length: maxDegree - startDegree + 1 }, (_, i) => startDegree + i);
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
      id: `degree ${degree}`,
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
    metrics: directionMetrics(rows),
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NaN";
}

function mdRows(rows) {
  return rows.map((row) => `| ${row.id} | ${fmt(row.energy)} | ${fmt(row.maxAbsCell)} | ${row.cells.map((v) => fmt(v, 3)).join(", ")} |`).join("\n");
}

function mdMetrics(label, metrics) {
  return `| ${label} | ${fmt(metrics.meanAdjacentCosine)} | ${fmt(metrics.minAdjacentCosine)} | ${fmt(metrics.meanPairwiseCosine)} | ${fmt(metrics.stdevPairwiseCosine)} | ${fmt(metrics.meanAnchorHamming)} |`;
}

function mdControl(label, summary) {
  return `| ${label} | ${summary.meanEnergyRange.map((v) => fmt(v)).join(" .. ")} | ${summary.maxBlockEnergyRange.map((v) => fmt(v)).join(" .. ")} | ${summary.meanAdjacentCosineRange.map((v) => fmt(v)).join(" .. ")} | ${summary.minAdjacentCosineRange.map((v) => fmt(v)).join(" .. ")} | ${summary.meanPairwiseCosineRange.map((v) => fmt(v)).join(" .. ")} | ${summary.meanAnchorHammingRange.map((v) => fmt(v)).join(" .. ")} |`;
}

function heatColor(value) {
  const x = Math.max(-3, Math.min(3, value)) / 3;
  if (x >= 0) {
    const t = x;
    const r = Math.round(32 + 190 * t);
    const g = Math.round(90 + 50 * (1 - t));
    const b = Math.round(160 - 80 * t);
    return `rgb(${r},${g},${b})`;
  }
  const t = -x;
  const r = Math.round(48 + 20 * (1 - t));
  const g = Math.round(100 + 120 * t);
  const b = Math.round(170 + 50 * t);
  return `rgb(${r},${g},${b})`;
}

function heatmap(rows, x, y, w, h, title, xLabels) {
  const cellW = w / xLabels.length;
  const cellH = h / rows.length;
  const rects = rows.flatMap((row, r) => row.cells.map((value, c) => {
    const rx = x + c * cellW;
    const ry = y + r * cellH;
    return `<rect x="${rx.toFixed(2)}" y="${ry.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(value)}"><title>${row.id} h${xLabels[c]}: ${fmt(value, 3)}</title></rect>`;
  })).join("\n");
  const rowText = rows.map((row, r) => `<text x="${x - 8}" y="${(y + r * cellH + cellH * 0.62).toFixed(2)}" text-anchor="end" fill="#94a3b8">${row.id.replace("degree ", "d")}</text>`).join("\n");
  const colText = xLabels.map((label, c) => `<text x="${(x + c * cellW + cellW / 2).toFixed(2)}" y="${(y + h + 15).toFixed(2)}" text-anchor="middle" fill="#94a3b8">${label}</text>`).join("\n");
  return `<g font-family="Menlo, Consolas, monospace" font-size="10">
<text x="${x}" y="${y - 10}" fill="#e5e7eb" font-size="13">${title}</text>
${rects}
${rowText}
${colText}
</g>`;
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function svg(integer, q2, q3) {
  const width = 1160, height = 820;
  const chartX = 82, chartY = 58, chartW = 1000, chartH = 230;
  const realAdj = integer.real.metrics.adjacentCosines;
  const q2Adj = q2.metrics.adjacentCosines;
  const q3Adj = q3.metrics.adjacentCosines;
  const values = [...realAdj, ...q2Adj, ...q3Adj, -1, 1];
  const minY = Math.min(...values), maxY = Math.max(...values);
  const axisY = chartY + chartH - ((0 - minY) / (maxY - minY)) * chartH;
  const realPath = linePath(realAdj, chartX, chartY, chartW, chartH, minY, maxY);
  const q2Path = linePath(q2Adj, chartX, chartY, chartW, chartH, minY, maxY);
  const q3Path = linePath(q3Adj, chartX, chartY, chartW, chartH, minY, maxY);
  const heatTop = 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="52" y="30" fill="#f8fafc" font-size="18">HL-whitened prime-pair residual direction field</text>
<text x="52" y="50" fill="#94a3b8" font-size="12">fresh-block adjacent cosines; heatmaps show raw normalized residual cells</text>
<line x1="${chartX}" x2="${chartX + chartW}" y1="${axisY.toFixed(2)}" y2="${axisY.toFixed(2)}" stroke="#475569" stroke-dasharray="4 4"/>
<rect x="${chartX}" y="${chartY}" width="${chartW}" height="${chartH}" fill="none" stroke="#334155"/>
<path d="${realPath}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${q2Path}" fill="none" stroke="#fbbf24" stroke-width="3"/>
<path d="${q3Path}" fill="none" stroke="#f472b6" stroke-width="3"/>
<text x="${chartX}" y="${chartY + chartH + 24}" fill="#94a3b8" font-size="12">adjacent fresh-block cosine, -1..1</text>
<text x="${chartX + 650}" y="${chartY + chartH + 24}" fill="#a7f3d0" font-size="12">Z real</text>
<text x="${chartX + 735}" y="${chartY + chartH + 24}" fill="#fbbf24" font-size="12">F2[t]</text>
<text x="${chartX + 820}" y="${chartY + chartH + 24}" fill="#f472b6" font-size="12">F3[t]</text>
</g>
${heatmap(integer.real.blocks, 118, heatTop, 440, 170, "Z blocks, shifts 2..16", integer.shifts)}
${heatmap(q2.rows, 118, heatTop + 280, 440, 170, "F2[t] degrees", q2.shifts.map((_, i) => i + 1))}
${heatmap(q3.rows, 686, heatTop + 280, 440, 170, "F3[t] degrees", q3.shifts.map((_, i) => i + 1))}
<g font-family="Menlo, Consolas, monospace" font-size="11">
<text x="686" y="${heatTop - 10}" fill="#e5e7eb">summary</text>
<text x="686" y="${heatTop + 16}" fill="#a7f3d0">Z mean adjacent cosine: ${fmt(integer.real.metrics.meanAdjacentCosine)}</text>
<text x="686" y="${heatTop + 36}" fill="#a7f3d0">Z mean pairwise cosine: ${fmt(integer.real.metrics.meanPairwiseCosine)}</text>
<text x="686" y="${heatTop + 56}" fill="#a7f3d0">Z anchor hamming: ${fmt(integer.real.metrics.meanAnchorHamming)}</text>
<text x="686" y="${heatTop + 86}" fill="#fbbf24">F2 mean adjacent cosine: ${fmt(q2.metrics.meanAdjacentCosine)}</text>
<text x="686" y="${heatTop + 106}" fill="#f472b6">F3 mean adjacent cosine: ${fmt(q3.metrics.meanAdjacentCosine)}</text>
<text x="686" y="${heatTop + 142}" fill="#94a3b8">blue = negative residual; red = positive residual; clamp +/-3</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[primepair-shape] integer fresh-block audit to ${N}`);
const integer = integerAudit();
console.error(`[primepair-shape] F_2[t] to degree ${q2MaxDegree}`);
const q2 = summarizeField(2, q2MaxDegree);
console.error(`[primepair-shape] F_3[t] to degree ${q3MaxDegree}`);
const q3 = summarizeField(3, q3MaxDegree);

const output = {
  candidate: "HL-whitened prime-pair residual direction field",
  N,
  integer,
  q2,
  q3,
};

const jsonPath = path.join(outDir, `primepair-shape-audit-${N}.json`);
const mdPath = path.join(outDir, `primepair-shape-audit-${N}.md`);
const svgPath = path.join(outDir, `primepair-shape-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer, q2, q3));

const md = `# HL-whitened prime-pair residual direction field audit

Candidate:
fresh-block residual vectors after full local main subtraction, normalized by
their Euclidean direction. The claimed line would be a stable adjacent-cosine
or anchor-projection trace, not a small count residual norm.

Integer: full Hardy-Littlewood factors, shifts \`${integerShifts.join(", ")}\`,
\`W=${W}\` only for fake/composite breakers.

## Direction metrics

| series | mean adjacent cosine | min adjacent cosine | mean pairwise cosine | stdev pairwise cosine | mean anchor hamming |
| --- | ---: | ---: | ---: | ---: | ---: |
${mdMetrics("Z real HL blocks", integer.real.metrics)}
${mdMetrics("F_2[t]", q2.metrics)}
${mdMetrics("F_3[t]", q3.metrics)}

## Integer controls

| group | mean energy range | max block energy range | mean adjacent cosine range | min adjacent cosine range | mean pairwise cosine range | mean anchor hamming range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdControl(`W=${W} fake labels against HL`, integer.summaries.wheelAgainstHL)}
${mdControl(`W=${W} fake labels own finite-wheel main`, integer.summaries.wheelOwnMain)}
${mdControl(`W=${W} composite-only`, integer.summaries.composite)}

## Integer fresh blocks

| block | energy | maxAbs cell | residual cells |
| --- | ---: | ---: | --- |
${mdRows(integer.real.blocks)}

## F_2[t] rows

| degree | energy | maxAbs cell | residual cells |
| --- | ---: | ---: | --- |
${mdRows(q2.rows)}

## F_3[t] rows

| degree | energy | maxAbs cell | residual cells |
| --- | ---: | ---: | --- |
${mdRows(q3.rows)}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  integerMetrics: integer.real.metrics,
  integerControlSummaries: integer.summaries,
  q2Metrics: q2.metrics,
  q3Metrics: q3.metrics,
}, null, 2));
