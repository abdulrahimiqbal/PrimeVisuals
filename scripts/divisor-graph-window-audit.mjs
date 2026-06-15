#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const cutoffs = (process.argv[4] || "47,97").split(",").map((x) => Number(x.trim())).filter(Boolean);
const windowSize = Number(process.argv[5] || 210);

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

function omegaSmall(limit) {
  const out = new Uint8Array(limit + 1);
  for (let p = 2; p <= limit; p++) {
    if (out[p] !== 0) continue;
    for (let m = p; m <= limit; m += p) out[m]++;
  }
  out[1] = 0;
  return out;
}

function primesThrough(limit, isp) {
  const out = [];
  for (let n = 2; n <= limit; n++) if (isp[n]) out.push(n);
  return out;
}

function eligibleFlags(limit, cutoff, smallPrimes) {
  const flags = new Uint8Array(limit + 1);
  flags.fill(1, 2);
  for (const p of smallPrimes) {
    if (p > cutoff) break;
    for (let m = p; m <= limit; m += p) flags[m] = 0;
  }
  return flags;
}

function edgeEnergy(offsets, weight) {
  const k = offsets.length;
  if (k < 2) return NaN;
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      sum += weight[Math.abs(offsets[j] - offsets[i])];
      pairs++;
    }
  }
  return sum / pairs;
}

function sampleSubset(values, k, random) {
  const arr = values.slice();
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(random() * (arr.length - i));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr.slice(0, k).sort((a, b) => a - b);
}

function centeredControl(values) {
  return values.map((value, i) => {
    const others = values.filter((_, j) => j !== i);
    return value - mean(others);
  });
}

function addDiffContributions(diff, offsets, multiplier) {
  for (let i = 0; i < offsets.length; i++) {
    for (let j = i + 1; j < offsets.length; j++) {
      diff[Math.abs(offsets[j] - offsets[i])] += multiplier;
    }
  }
}

function scoreBlock(lo, hi, cutoff, eligible, isp, weight, collectDiffs = false) {
  const randoms = seeds.map((seed) => rng(seed + cutoff * 1009 + lo));
  const compositeRandoms = seeds.map((seed) => rng(seed + cutoff * 2003 + hi));
  const fakeSums = new Float64Array(seeds.length);
  const compositeSums = new Float64Array(seeds.length);
  const diffObserved = new Float64Array(windowSize);
  const diffExpected = new Float64Array(windowSize);
  let observedSum = 0;
  let scoredWindows = 0;
  let primePairs = 0;
  let eligiblePairs = 0;
  let compositeScored = 0;
  let skippedNoComposite = 0;
  let totalPrimeVertices = 0;
  let totalEligibleVertices = 0;

  const firstBase = Math.ceil(lo / windowSize) * windowSize;
  const lastBase = Math.floor((hi - windowSize + 1) / windowSize) * windowSize;
  for (let base = firstBase; base <= lastBase; base += windowSize) {
    const eligibleOffsets = [];
    const primeOffsets = [];
    const compositeOffsets = [];
    for (let off = 0; off < windowSize; off++) {
      const n = base + off;
      if (n < lo || n > hi || n > N || !eligible[n]) continue;
      eligibleOffsets.push(off);
      if (isp[n]) primeOffsets.push(off);
      else compositeOffsets.push(off);
    }
    const k = primeOffsets.length;
    const e = eligibleOffsets.length;
    if (k < 2 || e < k) continue;
    const observed = edgeEnergy(primeOffsets, weight);
    observedSum += observed;
    scoredWindows++;
    totalPrimeVertices += k;
    totalEligibleVertices += e;
    primePairs += (k * (k - 1)) / 2;
    eligiblePairs += (e * (e - 1)) / 2;

    for (let s = 0; s < seeds.length; s++) {
      fakeSums[s] += edgeEnergy(sampleSubset(eligibleOffsets, k, randoms[s]), weight);
      if (compositeOffsets.length >= k) {
        compositeSums[s] += edgeEnergy(sampleSubset(compositeOffsets, k, compositeRandoms[s]), weight);
      }
    }
    if (compositeOffsets.length >= k) compositeScored++;
    else skippedNoComposite++;

    if (collectDiffs) {
      addDiffContributions(diffObserved, primeOffsets, 1);
      const pairProbability = e > 1 ? (k * (k - 1)) / (e * (e - 1)) : 0;
      addDiffContributions(diffExpected, eligibleOffsets, pairProbability);
    }
  }

  if (!scoredWindows) return null;
  const observedMean = observedSum / scoredWindows;
  const fakeMeans = Array.from(fakeSums, (sum) => sum / scoredWindows);
  const fakeMean = mean(fakeMeans);
  const residual = observedMean - fakeMean;
  const scale = Math.sqrt(scoredWindows);
  const compositeMeans = Array.from(compositeSums, (sum) => compositeScored ? sum / compositeScored : NaN);
  const compositeAggregates = compositeMeans
    .filter(Number.isFinite)
    .map((value) => (value - fakeMean) * Math.sqrt(compositeScored || scoredWindows));
  const topDiffs = [];
  if (collectDiffs) {
    for (let d = 1; d < windowSize; d++) {
      const excess = diffObserved[d] - diffExpected[d];
      topDiffs.push({
        d,
        omega: weight[d],
        observed: diffObserved[d],
        expected: diffExpected[d],
        excess,
        weightedExcess: excess * weight[d],
      });
    }
    topDiffs.sort((a, b) => Math.abs(b.weightedExcess) - Math.abs(a.weightedExcess));
  }
  return {
    lo,
    hi,
    cutoff,
    scoredWindows,
    observedMean,
    fakeMean,
    residual,
    aggregate: residual * scale,
    fakeAggregates: centeredControl(fakeMeans).map((value) => value * scale),
    fakeRange: range(centeredControl(fakeMeans).map((value) => value * scale)),
    compositeAggregateMean: mean(compositeAggregates),
    compositeRange: range(compositeAggregates),
    compositeScored,
    skippedNoComposite,
    meanPrimeVertices: totalPrimeVertices / scoredWindows,
    meanEligibleVertices: totalEligibleVertices / scoredWindows,
    primePairs,
    eligiblePairs,
    topDiffs: topDiffs.slice(0, 12),
  };
}

function auditCutoff(cutoff, eligible, isp, weight) {
  const rows = [];
  for (let i = 0; i < scales.length; i++) {
    const hi = scales[i];
    const lo = Math.floor(hi / 2);
    rows.push(scoreBlock(lo, hi, cutoff, eligible, isp, weight, i === scales.length - 1));
  }
  return { cutoff, rows };
}

function exponentFit(rows) {
  const pts = rows
    .filter(Boolean)
    .map((row) => [row.scoredWindows, Math.abs(row.aggregate)])
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

function mdRows(series) {
  return series.rows.map((row) => row
    ? `| ${row.lo}..${row.hi} | ${row.scoredWindows} | ${fmt(row.meanPrimeVertices)} | ${fmt(row.meanEligibleVertices)} | ${fmt(row.observedMean)} | ${fmt(row.fakeMean)} | ${fmt(row.aggregate)} | ${row.fakeRange.map((v) => fmt(v)).join(" .. ")} | ${row.compositeRange.map((v) => fmt(v)).join(" .. ")} |`
    : "| NA | 0 | NA | NA | NA | NA | NA | NA | NA |").join("\n");
}

function mdDiffRows(row) {
  return row.topDiffs.map((item) => `| ${item.d} | ${item.omega} | ${fmt(item.observed, 3)} | ${fmt(item.expected, 3)} | ${fmt(item.excess, 3)} | ${fmt(item.weightedExcess, 3)} |`).join("\n");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function svg(results) {
  const width = 1160, height = 760;
  const series = results.cutoffs.map((item) => item.rows.map((row) => row?.aggregate ?? 0));
  const composite = results.cutoffs.map((item) => item.rows.map((row) => row?.compositeAggregateMean ?? 0));
  const controls = results.cutoffs.map((item) => item.rows.map((row) => row ? Math.max(Math.abs(row.fakeRange[0]), Math.abs(row.fakeRange[1])) : 0));
  const all = [...series.flat(), ...composite.flat(), ...controls.flat().map((v) => v), ...controls.flat().map((v) => -v), 0];
  const minY = Math.min(...all) * 1.12;
  const maxY = Math.max(...all) * 1.12;
  const chart = { x: 82, y: 72, w: 1000, h: 310 };
  const zeroY = chart.y + chart.h - ((0 - minY) / (maxY - minY || 1)) * chart.h;
  const colors = ["#a7f3d0", "#7dd3fc", "#fbbf24", "#fb7185"];
  const finalRows = results.cutoffs.map((item) => item.rows.at(-1));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">local divisor-graph edge energy</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">mean omega(offset difference) for prime pairs minus exact local-eligible count-matched shuffles</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
${series.map((values, i) => `<path d="${linePath(values, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="${colors[i]}" stroke-width="3"/>`).join("\n")}
${composite.map((values, i) => `<path d="${linePath(values, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="${colors[i + 2]}" stroke-width="2" stroke-dasharray="6 4"/>`).join("\n")}
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">fresh integer blocks</text>
${results.cutoffs.map((item, i) => `<text x="${chart.x + 520 + i * 150}" y="${chart.y + chart.h + 24}" fill="${colors[i]}" font-size="12">B=${item.cutoff} prime</text>`).join("\n")}
<text x="${chart.x + 820}" y="${chart.y + chart.h + 24}" fill="#fbbf24" font-size="12">composite dashed</text>
</g>
<g font-family="Menlo, Consolas, monospace" font-size="12">
${finalRows.map((row, i) => `<text x="90" y="${460 + i * 90}" fill="#e5e7eb">B=${results.cutoffs[i].cutoff}: aggregate ${fmt(row.aggregate)}, residual ${fmt(row.residual, 9)}, windows ${row.scoredWindows}</text>
<text x="90" y="${484 + i * 90}" fill="${colors[i]}">fake controls ${row.fakeRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="90" y="${508 + i * 90}" fill="#fbbf24">composite range ${row.compositeRange.map((v) => fmt(v)).join(" .. ")}</text>`).join("\n")}
<text x="650" y="460" fill="#e5e7eb">top weighted differences at final cutoff ${results.cutoffs.at(-1).cutoff}</text>
${results.cutoffs.at(-1).rows.at(-1).topDiffs.slice(0, 6).map((d, i) => `<text x="650" y="${488 + i * 22}" fill="#94a3b8">d=${d.d}, omega=${d.omega}, excess=${fmt(d.excess, 1)}, weighted=${fmt(d.weightedExcess, 1)}</text>`).join("\n")}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[divgraph] sieve to ${N}`);
const isp = sieve(N);
const smallPrimes = primesThrough(Math.max(...cutoffs), isp);
const weight = omegaSmall(windowSize);
const results = { candidate: "local divisor-graph edge energy", N, windowSize, seeds, cutoffs: [] };

for (const cutoff of cutoffs) {
  console.error(`[divgraph] cutoff ${cutoff}`);
  const eligible = eligibleFlags(N, cutoff, smallPrimes);
  results.cutoffs.push(auditCutoff(cutoff, eligible, isp, weight));
}

const tag = `divisor-graph-window-audit-${N}-b${cutoffs.join("-")}-w${windowSize}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
fs.writeFileSync(svgPath, svg(results));

let md = `# local divisor-graph edge energy audit

Candidate:
in each \`${windowSize}\`-wide window, put the prime offsets into a complete
graph with edge weight \`omega(|u-v|)\`. Compare the mean edge weight against
five exact count-matched random subsets of the same local eligible offsets
(not divisible by primes up to cutoff \`B\`).

Aggregate:
\`sqrt(scored windows) * mean_window(E_real - E_local_shuffle)\`.

## Integer paths
`;

for (const seriesItem of results.cutoffs) {
  const final = seriesItem.rows.at(-1);
  md += `
### cutoff ${seriesItem.cutoff}

Aggregate exponent fit: \`${fmt(exponentFit(seriesItem.rows))}\`.

| block | windows | mean prime vertices | mean eligible vertices | observed mean | fake mean | aggregate | fake aggregate range | composite aggregate range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
${mdRows(seriesItem)}

Final top weighted pair-difference contributions:

| difference d | omega(d) | observed pairs | expected pairs | excess | weighted excess |
| ---: | ---: | ---: | ---: | ---: | ---: |
${mdDiffRows(final)}
`;
}

md += `
## Artifacts

- JSON: \`${jsonPath}\`
- SVG: \`${svgPath}\`
`;

fs.writeFileSync(mdPath, md);
console.log(JSON.stringify({ ok: true, jsonPath, mdPath, svgPath }));
