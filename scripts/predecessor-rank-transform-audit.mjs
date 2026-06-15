#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const modelQ = Number(process.argv[4] || 97);

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

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  return values.length ? [Math.min(...values), Math.max(...values)] : [NaN, NaN];
}

function upperBound(arr, x) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function lowerBound(arr, x) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function primesThrough(limit, isp) {
  const out = [];
  for (let n = 2; n <= limit; n++) if (isp[n]) out.push(n);
  return out;
}

function arithmeticTables(limit, isp) {
  const phi = new Int32Array(limit + 1);
  const rad = new Int32Array(limit + 1);
  rad.fill(1);
  for (let i = 0; i <= limit; i++) phi[i] = i;
  for (let p = 2; p <= limit; p++) {
    if (!isp[p]) continue;
    for (let m = p; m <= limit; m += p) {
      phi[m] -= Math.floor(phi[m] / p);
      rad[m] *= p;
    }
  }
  return { phi, rad };
}

function percentile(sorted, value) {
  return (lowerBound(sorted, value) + upperBound(sorted, value)) / (2 * sorted.length);
}

function sampleMean(ranks, populationSize, k, random) {
  const seen = new Set();
  while (seen.size < k && seen.size < populationSize) seen.add(Math.floor(random() * populationSize));
  let sum = 0;
  for (const idx of seen) sum += ranks[idx];
  return sum / (seen.size || 1);
}

function sampleMeanFromList(ranks, indices, k, random) {
  const seen = new Set();
  while (seen.size < k && seen.size < indices.length) seen.add(Math.floor(random() * indices.length));
  let sum = 0;
  for (const pos of seen) sum += ranks[indices[pos]];
  return sum / (seen.size || 1);
}

function meanAt(ranks, indices) {
  let sum = 0;
  for (const idx of indices) sum += ranks[idx];
  return sum / (indices.length || 1);
}

function weightedMean(ranks, weights) {
  let num = 0, den = 0;
  for (let i = 0; i < ranks.length; i++) {
    num += ranks[i] * weights[i];
    den += weights[i];
  }
  return num / den;
}

function modelWeights(firstEven, count, oddPrimes) {
  const weights = new Float64Array(count);
  weights.fill(1);
  for (const q of oddPrimes) {
    const bonus = (q - 1) / (q - 2);
    let m = Math.ceil(firstEven / q) * q;
    if (m % 2 !== 0) m += q;
    for (; m < firstEven + 2 * count; m += 2 * q) {
      weights[(m - firstEven) / 2] *= bonus;
    }
  }
  return weights;
}

function scoreFromValues(values, sorted) {
  const out = new Float64Array(values.length);
  for (let i = 0; i < values.length; i++) out[i] = percentile(sorted, values[i]);
  return out;
}

function scoreRanks(label, ranks, primeIdx, compositeIdx, cramerIdxs, weights, blockSeed) {
  const k = primeIdx.length;
  const scale = Math.sqrt(k || 1);
  const primeMean = meanAt(ranks, primeIdx);
  const modelMean = weightedMean(ranks, weights);
  const randomMeans = seeds.map((seed) => sampleMean(ranks, ranks.length, k, rng(seed + blockSeed)));
  const compositeMeans = seeds.map((seed) => sampleMeanFromList(ranks, compositeIdx, k, rng(seed + blockSeed * 3)));
  const cramerMeans = cramerIdxs.map((idxs) => meanAt(ranks, idxs));
  return {
    label,
    primeMean,
    primeAggregate: (primeMean - 0.5) * scale,
    modelMean,
    modelAggregate: (modelMean - 0.5) * scale,
    correctedMean: primeMean - modelMean,
    correctedAggregate: (primeMean - modelMean) * scale,
    randomRange: range(randomMeans.map((value) => (value - 0.5) * scale)),
    compositeRange: range(compositeMeans.map((value) => (value - 0.5) * scale)),
    cramerRange: range(cramerMeans.map((value) => (value - 0.5) * scale)),
  };
}

function indicesFromLabels(labels, lo, hi, firstEven, count) {
  const out = [];
  for (const value of labels) {
    if (value < lo || value > hi || value <= 2) continue;
    const n = value - 1;
    if (n < firstEven || n >= firstEven + 2 * count || n % 2 !== 0) continue;
    out.push((n - firstEven) / 2);
  }
  return out;
}

function scoreBlock(lo, hi, isp, tables, cramer, oddPrimes) {
  const firstEven = Math.max(2, (lo - 1) % 2 === 0 ? lo - 1 : lo);
  const lastEven = (hi - 1) % 2 === 0 ? hi - 1 : hi - 2;
  const count = Math.max(0, Math.floor((lastEven - firstEven) / 2) + 1);
  const phiValues = new Float64Array(count);
  const radValues = new Float64Array(count);
  const compositeIdx = [];
  for (let i = 0; i < count; i++) {
    const n = firstEven + 2 * i;
    phiValues[i] = Math.log(Math.max(1, tables.phi[n])) / Math.log(n);
    radValues[i] = Math.log(Math.max(1, tables.rad[n])) / Math.log(n);
    if (n + 1 <= N && n + 1 >= 4 && !isp[n + 1]) compositeIdx.push(i);
  }
  const sortedPhi = new Float64Array(phiValues);
  const sortedRad = new Float64Array(radValues);
  sortedPhi.sort();
  sortedRad.sort();
  const phiRanks = scoreFromValues(phiValues, sortedPhi);
  const radRanks = scoreFromValues(radValues, sortedRad);
  const weights = modelWeights(firstEven, count, oddPrimes);
  const primeIdx = [];
  for (let p = Math.max(3, lo); p <= hi; p++) {
    if (!isp[p]) continue;
    const n = p - 1;
    if (n >= firstEven && n <= lastEven) primeIdx.push((n - firstEven) / 2);
  }
  const cramerIdxs = cramer.map((labels) => indicesFromLabels(labels, lo, hi, firstEven, count));
  return {
    lo,
    hi,
    evenCount: count,
    primeCount: primeIdx.length,
    compositeSuccessorCount: compositeIdx.length,
    phi: scoreRanks("phi", phiRanks, primeIdx, compositeIdx, cramerIdxs, weights, lo + 17),
    rad: scoreRanks("rad", radRanks, primeIdx, compositeIdx, cramerIdxs, weights, lo + 31),
  };
}

function exponentFit(rows, key, subkey) {
  const pts = rows
    .map((row) => [row.primeCount, Math.abs(row[key][subkey])])
    .filter(([x, y]) => x > 0 && y > 0);
  if (pts.length < 2) return NaN;
  const xs = pts.map(([x]) => Math.log(x));
  const ys = pts.map(([, y]) => Math.log(y));
  const mx = mean(xs), my = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : NaN;
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mdRows(rows, key) {
  return rows.map((row) => {
    const s = row[key];
    return `| ${row.lo}..${row.hi} | ${row.primeCount} | ${fmt(s.primeMean, 9)} | ${fmt(s.primeAggregate)} | ${fmt(s.modelAggregate)} | ${fmt(s.correctedAggregate)} | ${s.randomRange.map((v) => fmt(v)).join(" .. ")} | ${s.compositeRange.map((v) => fmt(v)).join(" .. ")} | ${s.cramerRange.map((v) => fmt(v)).join(" .. ")} |`;
  }).join("\n");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function svg(rows) {
  const width = 1160, height = 760;
  const phi = rows.map((row) => row.phi.primeAggregate);
  const phiModel = rows.map((row) => row.phi.modelAggregate);
  const phiCorrected = rows.map((row) => row.phi.correctedAggregate);
  const rad = rows.map((row) => row.rad.primeAggregate);
  const radModel = rows.map((row) => row.rad.modelAggregate);
  const radCorrected = rows.map((row) => row.rad.correctedAggregate);
  const all = [...phi, ...phiModel, ...phiCorrected, ...rad, ...radModel, ...radCorrected, 0];
  const minY = Math.min(...all) * 1.08;
  const maxY = Math.max(...all) * 1.08;
  const chart = { x: 82, y: 72, w: 1000, h: 310 };
  const zeroY = chart.y + chart.h - ((0 - minY) / (maxY - minY || 1)) * chart.h;
  const final = rows.at(-1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">prime-predecessor totient/radical rank drift</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">percentile ranks of log(phi(n))/log(n) and log(rad(n))/log(n) at n=p-1 inside even blocks</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
<path d="${linePath(phi, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${linePath(phiModel, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#7dd3fc" stroke-width="2"/>
<path d="${linePath(phiCorrected, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f8fafc" stroke-width="2" stroke-dasharray="6 4"/>
<path d="${linePath(rad, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fb7185" stroke-width="3"/>
<path d="${linePath(radModel, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fbbf24" stroke-width="2"/>
<path d="${linePath(radCorrected, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#c4b5fd" stroke-width="2" stroke-dasharray="6 4"/>
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">fresh blocks</text>
<text x="${chart.x + 445}" y="${chart.y + chart.h + 24}" fill="#a7f3d0" font-size="12">phi prime</text>
<text x="${chart.x + 555}" y="${chart.y + chart.h + 24}" fill="#7dd3fc" font-size="12">phi model</text>
<text x="${chart.x + 675}" y="${chart.y + chart.h + 24}" fill="#fb7185" font-size="12">rad prime</text>
<text x="${chart.x + 785}" y="${chart.y + chart.h + 24}" fill="#fbbf24" font-size="12">rad model</text>
<text x="${chart.x + 895}" y="${chart.y + chart.h + 24}" fill="#f8fafc" font-size="12">corrected dashed</text>
</g>
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="90" y="460" fill="#e5e7eb">final block ${final.lo}..${final.hi}, prime predecessors ${final.primeCount}</text>
<text x="90" y="488" fill="#a7f3d0">phi prime aggregate ${fmt(final.phi.primeAggregate)}, model ${fmt(final.phi.modelAggregate)}, corrected ${fmt(final.phi.correctedAggregate)}</text>
<text x="90" y="512" fill="#94a3b8">phi random ${final.phi.randomRange.map((v) => fmt(v)).join(" .. ")}, composite ${final.phi.compositeRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="90" y="548" fill="#fb7185">rad prime aggregate ${fmt(final.rad.primeAggregate)}, model ${fmt(final.rad.modelAggregate)}, corrected ${fmt(final.rad.correctedAggregate)}</text>
<text x="90" y="572" fill="#94a3b8">rad random ${final.rad.randomRange.map((v) => fmt(v)).join(" .. ")}, composite ${final.rad.compositeRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="488" fill="#fbbf24">local-product model q &lt;= ${modelQ}: weight n by product(q-1)/(q-2) for odd q|n</text>
<text x="650" y="526" fill="#94a3b8">negative rank = predecessor is more factor-compressed than a random even integer</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[prevrank] sieve to ${N}`);
const isp = sieve(N);
console.error("[prevrank] arithmetic tables");
const tables = arithmeticTables(N, isp);
console.error("[prevrank] fake labels");
const cramer = seeds.map((seed) => cramerPrimes(N, seed));
const oddPrimes = primesThrough(modelQ, isp).filter((p) => p > 2);
const rows = [];
for (const hi of scales) {
  const lo = Math.floor(hi / 2);
  console.error(`[prevrank] block ${lo}..${hi}`);
  rows.push(scoreBlock(lo, hi, isp, tables, cramer, oddPrimes));
}

const tag = `predecessor-rank-transform-audit-${N}-q${modelQ}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);
const output = { candidate: "prime-predecessor totient/radical rank drift", N, modelQ, seeds, scales, rows };
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(rows));

let md = `# prime-predecessor totient/radical rank drift audit

Candidate:
rank even integers in each fresh block by \`log(phi(n))/log(n)\` and
\`log(rad(n))/log(n)\`, then score the percentile ranks of prime predecessors
\`n=p-1\`.

Aggregates:
\`sqrt(#prime predecessors) * (mean rank - 1/2)\`.

The local-product model weights even \`n\` by
\`product_{odd q|n, q<=${modelQ}} (q-1)/(q-2)\`, the first-order AP bias for
prime predecessors.

## Totient-compression rank

Aggregate exponent fit: prime \`${fmt(exponentFit(rows, "phi", "primeAggregate"))}\`;
corrected \`${fmt(exponentFit(rows, "phi", "correctedAggregate"))}\`.

| block | prime predecessors | mean prime rank | prime aggregate | local-product aggregate | corrected aggregate | random even range | composite-successor range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
${mdRows(rows, "phi")}

## Radical-compression rank

Aggregate exponent fit: prime \`${fmt(exponentFit(rows, "rad", "primeAggregate"))}\`;
corrected \`${fmt(exponentFit(rows, "rad", "correctedAggregate"))}\`.

| block | prime predecessors | mean prime rank | prime aggregate | local-product aggregate | corrected aggregate | random even range | composite-successor range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
${mdRows(rows, "rad")}

## Artifacts

- JSON: \`${jsonPath}\`
- SVG: \`${svgPath}\`
`;

fs.writeFileSync(mdPath, md);
console.log(JSON.stringify({ ok: true, jsonPath, mdPath, svgPath }));
