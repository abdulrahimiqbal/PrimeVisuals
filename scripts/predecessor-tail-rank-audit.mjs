#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const stripB = Number(process.argv[4] || 97);
const extendedQ = Number(process.argv[5] || 997);

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

function lowerBound(arr, x) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
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

function percentile(sorted, value) {
  return (lowerBound(sorted, value) + upperBound(sorted, value)) / (2 * sorted.length);
}

function primesThrough(limit, isp) {
  const out = [];
  for (let n = 2; n <= limit; n++) if (isp[n]) out.push(n);
  return out;
}

function smallestPrimeFactors(limit) {
  const spf = new Int32Array(limit + 1);
  for (let i = 2; i <= limit; i++) {
    if (spf[i]) continue;
    spf[i] = i;
    if (i * i > limit) continue;
    for (let j = i * i; j <= limit; j += i) if (!spf[j]) spf[j] = i;
  }
  return spf;
}

function stripSmallFactors(n, smallPrimes) {
  let m = n;
  for (const q of smallPrimes) {
    if (q > stripB) break;
    while (m % q === 0) m = Math.floor(m / q);
  }
  return m;
}

function tailStats(tail, spf) {
  if (tail <= 1) return { omega: 0, rad: 1 };
  let m = tail;
  let omega = 0;
  let rad = 1;
  while (m > 1) {
    const p = spf[m] || m;
    omega++;
    rad *= p;
    while (m % p === 0) m = Math.floor(m / p);
  }
  return { omega, rad };
}

function modelWeights(firstEven, count, oddPrimes, maxQ) {
  const weights = new Float64Array(count);
  weights.fill(1);
  for (const q of oddPrimes) {
    if (q > maxQ) break;
    const bonus = (q - 1) / (q - 2);
    let m = Math.ceil(firstEven / q) * q;
    if (m % 2 !== 0) m += q;
    for (; m < firstEven + 2 * count; m += 2 * q) {
      weights[(m - firstEven) / 2] *= bonus;
    }
  }
  return weights;
}

function scoreFromValues(values) {
  const sorted = new Float64Array(values);
  sorted.sort();
  const ranks = new Float64Array(values.length);
  for (let i = 0; i < values.length; i++) ranks[i] = percentile(sorted, values[i]);
  return ranks;
}

function weightedMean(ranks, weights) {
  let num = 0, den = 0;
  for (let i = 0; i < ranks.length; i++) {
    num += ranks[i] * weights[i];
    den += weights[i];
  }
  return num / den;
}

function meanAt(ranks, indices) {
  let sum = 0;
  for (const idx of indices) sum += ranks[idx];
  return sum / (indices.length || 1);
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

function centeredRange(means, scale) {
  return range(means.map((value) => (value - 0.5) * scale));
}

function scoreFeature(label, ranks, primeIdx, compositeIdx, cramerIdxs, weights97, weightsExt, blockSeed) {
  const k = primeIdx.length;
  const scale = Math.sqrt(k || 1);
  const primeMean = meanAt(ranks, primeIdx);
  const model97Mean = weightedMean(ranks, weights97);
  const modelExtMean = weightedMean(ranks, weightsExt);
  const randomMeans = seeds.map((seed) => sampleMean(ranks, ranks.length, k, rng(seed + blockSeed)));
  const compositeMeans = seeds.map((seed) => sampleMeanFromList(ranks, compositeIdx, k, rng(seed + blockSeed * 3)));
  const cramerMeans = cramerIdxs.map((idxs) => meanAt(ranks, idxs));
  return {
    label,
    primeMean,
    primeAggregate: (primeMean - 0.5) * scale,
    model97Mean,
    model97Aggregate: (model97Mean - 0.5) * scale,
    corrected97Aggregate: (primeMean - model97Mean) * scale,
    modelExtMean,
    modelExtAggregate: (modelExtMean - 0.5) * scale,
    correctedExtAggregate: (primeMean - modelExtMean) * scale,
    randomRange: centeredRange(randomMeans, scale),
    compositeRange: centeredRange(compositeMeans, scale),
    cramerRange: centeredRange(cramerMeans, scale),
  };
}

function scoreBlock(lo, hi, isp, spf, cramer, smallPrimes, oddPrimes) {
  const firstEven = Math.max(2, (lo - 1) % 2 === 0 ? lo - 1 : lo);
  const lastEven = (hi - 1) % 2 === 0 ? hi - 1 : hi - 2;
  const count = Math.max(0, Math.floor((lastEven - firstEven) / 2) + 1);
  const omegaValues = new Float64Array(count);
  const radValues = new Float64Array(count);
  const compositeIdx = [];
  let tailOneCount = 0;
  for (let i = 0; i < count; i++) {
    const n = firstEven + 2 * i;
    const tail = stripSmallFactors(n, smallPrimes);
    if (tail === 1) tailOneCount++;
    const stats = tailStats(tail, spf);
    omegaValues[i] = stats.omega;
    radValues[i] = Math.log(stats.rad) / Math.log(n);
    if (n + 1 <= N && n + 1 >= 4 && !isp[n + 1]) compositeIdx.push(i);
  }
  const omegaRanks = scoreFromValues(omegaValues);
  const radRanks = scoreFromValues(radValues);
  const weights97 = modelWeights(firstEven, count, oddPrimes, stripB);
  const weightsExt = modelWeights(firstEven, count, oddPrimes, extendedQ);
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
    tailOneRate: tailOneCount / count,
    omegaTail: scoreFeature("omegaTail", omegaRanks, primeIdx, compositeIdx, cramerIdxs, weights97, weightsExt, lo + 13),
    radTail: scoreFeature("radTail", radRanks, primeIdx, compositeIdx, cramerIdxs, weights97, weightsExt, lo + 29),
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
    return `| ${row.lo}..${row.hi} | ${row.primeCount} | ${fmt(s.primeMean, 9)} | ${fmt(s.primeAggregate)} | ${fmt(s.model97Aggregate)} | ${fmt(s.corrected97Aggregate)} | ${fmt(s.modelExtAggregate)} | ${fmt(s.correctedExtAggregate)} | ${s.randomRange.map((v) => fmt(v)).join(" .. ")} | ${s.compositeRange.map((v) => fmt(v)).join(" .. ")} | ${s.cramerRange.map((v) => fmt(v)).join(" .. ")} |`;
  }).join("\n");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function svg(rows) {
  const width = 1160, height = 760;
  const omega = rows.map((row) => row.omegaTail.corrected97Aggregate);
  const omegaExt = rows.map((row) => row.omegaTail.correctedExtAggregate);
  const rad = rows.map((row) => row.radTail.corrected97Aggregate);
  const radExt = rows.map((row) => row.radTail.correctedExtAggregate);
  const all = [...omega, ...omegaExt, ...rad, ...radExt, 0];
  const minY = Math.min(...all) * 1.15;
  const maxY = Math.max(...all) * 1.15;
  const chart = { x: 82, y: 72, w: 1000, h: 310 };
  const zeroY = chart.y + chart.h - ((0 - minY) / (maxY - minY || 1)) * chart.h;
  const final = rows.at(-1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">AP-scrubbed predecessor large-prime tail rank</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">strip q&lt;=${stripB}, rank tail omega/rad, subtract AP-product weighted nulls q&lt;=${stripB} and q&lt;=${extendedQ}</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
<path d="${linePath(omega, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${linePath(omegaExt, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="6 4"/>
<path d="${linePath(rad, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fb7185" stroke-width="3"/>
<path d="${linePath(radExt, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="6 4"/>
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">fresh blocks</text>
<text x="${chart.x + 470}" y="${chart.y + chart.h + 24}" fill="#a7f3d0" font-size="12">omega corrected q&lt;=${stripB}</text>
<text x="${chart.x + 690}" y="${chart.y + chart.h + 24}" fill="#7dd3fc" font-size="12">omega q&lt;=${extendedQ}</text>
<text x="${chart.x + 835}" y="${chart.y + chart.h + 24}" fill="#fb7185" font-size="12">rad corrected</text>
</g>
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="90" y="460" fill="#e5e7eb">final block ${final.lo}..${final.hi}, prime predecessors ${final.primeCount}</text>
<text x="90" y="488" fill="#a7f3d0">omega: prime ${fmt(final.omegaTail.primeAggregate)}, q&lt;=${stripB} corrected ${fmt(final.omegaTail.corrected97Aggregate)}, q&lt;=${extendedQ} corrected ${fmt(final.omegaTail.correctedExtAggregate)}</text>
<text x="90" y="512" fill="#94a3b8">omega controls random ${final.omegaTail.randomRange.map((v) => fmt(v)).join(" .. ")}, composite ${final.omegaTail.compositeRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="90" y="548" fill="#fb7185">rad: prime ${fmt(final.radTail.primeAggregate)}, q&lt;=${stripB} corrected ${fmt(final.radTail.corrected97Aggregate)}, q&lt;=${extendedQ} corrected ${fmt(final.radTail.correctedExtAggregate)}</text>
<text x="90" y="572" fill="#94a3b8">rad controls random ${final.radTail.randomRange.map((v) => fmt(v)).join(" .. ")}, composite ${final.radTail.compositeRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="500" fill="#fbbf24">tailOneRate final ${fmt(final.tailOneRate, 6)}</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[tailrank] sieve to ${N}`);
const isp = sieve(N);
console.error("[tailrank] smallest prime factors");
const spf = smallestPrimeFactors(N);
console.error("[tailrank] fake labels");
const cramer = seeds.map((seed) => cramerPrimes(N, seed));
const smallPrimes = primesThrough(stripB, isp);
const oddPrimes = primesThrough(extendedQ, isp).filter((p) => p > 2);
const rows = [];
for (const hi of scales) {
  const lo = Math.floor(hi / 2);
  console.error(`[tailrank] block ${lo}..${hi}`);
  rows.push(scoreBlock(lo, hi, isp, spf, cramer, smallPrimes, oddPrimes));
}

const tag = `predecessor-tail-rank-audit-${N}-b${stripB}-q${extendedQ}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);
const output = { candidate: "AP-scrubbed predecessor large-prime tail rank", N, stripB, extendedQ, seeds, scales, rows };
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(rows));

let md = `# AP-scrubbed predecessor large-prime tail rank audit

Candidate:
strip all prime factors \`q<=${stripB}\` from even \`n\`, rank the remaining
large-prime tail features in each block, and compare prime predecessors
\`n=p-1\` against AP-product weighted nulls.

Features:

- \`omegaTail = omega(tail_${stripB}(n))\`
- \`radTail = log(rad(tail_${stripB}(n)))/log(n)\`

Aggregates:
\`sqrt(#prime predecessors) * (mean prime rank - weighted model rank)\`.

## Tail omega rank

Exponent fit after q<=${stripB} correction: \`${fmt(exponentFit(rows, "omegaTail", "corrected97Aggregate"))}\`;
after q<=${extendedQ}: \`${fmt(exponentFit(rows, "omegaTail", "correctedExtAggregate"))}\`.

| block | prime predecessors | mean prime rank | prime aggregate | model q<=${stripB} | corrected q<=${stripB} | model q<=${extendedQ} | corrected q<=${extendedQ} | random range | composite range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
${mdRows(rows, "omegaTail")}

## Tail radical rank

Exponent fit after q<=${stripB} correction: \`${fmt(exponentFit(rows, "radTail", "corrected97Aggregate"))}\`;
after q<=${extendedQ}: \`${fmt(exponentFit(rows, "radTail", "correctedExtAggregate"))}\`.

| block | prime predecessors | mean prime rank | prime aggregate | model q<=${stripB} | corrected q<=${stripB} | model q<=${extendedQ} | corrected q<=${extendedQ} | random range | composite range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
${mdRows(rows, "radTail")}

## Artifacts

- JSON: \`${jsonPath}\`
- SVG: \`${svgPath}\`
`;

fs.writeFileSync(mdPath, md);
console.log(JSON.stringify({ ok: true, jsonPath, mdPath, svgPath }));
