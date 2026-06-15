#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));
const blocks = endpoints.map((hi, i) => ({ lo: i === 0 ? 0 : endpoints[i - 1], hi }));
const modulus = 210;

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

function omegaTable(limit) {
  const omega = new Uint8Array(limit + 1);
  for (let p = 2; p <= limit; p++) {
    if (omega[p] !== 0) continue;
    for (let j = p; j <= limit; j += p) omega[j]++;
  }
  return omega;
}

function wheelRandomLabels(W, seed, isp) {
  const scale = W / phiSmall(W);
  const random = rng(seed);
  const labels = [];
  for (let n = 5; n <= N; n++) {
    if (gcd(n, W) !== 1) continue;
    if (random() < Math.min(1, scale / Math.log(n))) labels.push(n);
  }
  return labels;
}

function residueMatchedCompositeLabels(seed, targetLabels, isp) {
  const random = rng(seed);
  const counts = new Int32Array(modulus);
  for (const label of targetLabels) {
    if (label > N) break;
    if (label < modulus) continue;
    counts[label % modulus]++;
  }
  const buckets = Array.from({ length: modulus }, () => []);
  for (let n = modulus + 1; n <= N; n++) {
    if (isp[n] || gcd(n, modulus) !== 1) continue;
    const r = n % modulus;
    if (counts[r] === 0) continue;
    buckets[r].push({ n, key: random() });
  }
  const out = [];
  for (let r = 0; r < modulus; r++) {
    if (!counts[r]) continue;
    buckets[r].sort((a, b) => a.key - b.key);
    for (const entry of buckets[r].slice(0, counts[r])) out.push(entry.n);
  }
  out.sort((a, b) => a - b);
  return out;
}

function pearsonFromPairs(pairs) {
  const n = pairs.length;
  if (n < 4) return { n, r: 0, z: 0 };
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of pairs) {
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
  }
  const mx = sx / n, my = sy / n;
  const vx = sxx - n * mx * mx;
  const vy = syy - n * my * my;
  const cov = sxy - n * mx * my;
  if (vx <= 0 || vy <= 0) return { n, r: 0, z: 0 };
  const r = cov / Math.sqrt(vx * vy);
  return { n, r, z: r * Math.sqrt(n) };
}

function covarianceForRange(labels, omega, lo, hi) {
  const events = [];
  for (let i = 0; i + 1 < labels.length; i++) {
    const label = labels[i];
    if (label <= lo || label > hi) continue;
    if (label < modulus || label - 1 >= omega.length) continue;
    const gap = labels[i + 1] - label;
    events.push({
      residue: label % modulus,
      omega: omega[label - 1],
      gapZ: gap / Math.log(label) - 1,
    });
  }
  const sums = new Float64Array(modulus);
  const counts = new Int32Array(modulus);
  for (const event of events) {
    sums[event.residue] += event.omega;
    counts[event.residue]++;
  }
  const pairs = [];
  let covariance = 0;
  for (const event of events) {
    const centeredOmega = event.omega - sums[event.residue] / counts[event.residue];
    covariance += centeredOmega * event.gapZ;
    pairs.push([centeredOmega, event.gapZ]);
  }
  const corr = pearsonFromPairs(pairs);
  return {
    lo,
    hi,
    count: events.length,
    covarianceMean: events.length ? covariance / events.length : 0,
    r: corr.r,
    z: corr.z,
  };
}

function summarizeRanges(labels, omega, ranges) {
  return ranges.map(({ lo, hi }) => covarianceForRange(labels, omega, lo, hi));
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function sd(values) {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1));
}

function residualRows(realRows, controlRowsBySeed) {
  return realRows.map((real, i) => {
    const controls = controlRowsBySeed.map((rows) => rows[i].covarianceMean);
    const baselineMean = mean(controls);
    const baselineSd = sd(controls);
    const residual = real.covarianceMean - baselineMean;
    return {
      ...real,
      baselineMean,
      baselineSd,
      baselineMin: Math.min(...controls),
      baselineMax: Math.max(...controls),
      residual,
      residualOverBaselineSd: baselineSd ? residual / baselineSd : 0,
    };
  });
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function controlSummary(rowsBySeed) {
  const last = rowsBySeed.map((rows) => rows.at(-1));
  return {
    covarianceRange: range(last.map((r) => r.covarianceMean)),
    zRange: range(last.map((r) => r.z)),
    pathRange: range(rowsBySeed.flatMap((rows) => rows.map((r) => r.covarianceMean))),
  };
}

function svg(cumulativeResidual, blockResidual) {
  const width = 1040, height = 560, pad = 58;
  const all = cumulativeResidual.map((r) => r.residual).concat(blockResidual.map((r) => r.residual));
  const minY = Math.min(-0.005, ...all), maxY = Math.max(0.005, ...all);
  const xScale = (x) => pad + (Math.log(x) - Math.log(endpoints[0])) / (Math.log(N) - Math.log(endpoints[0])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const pathFor = (rows, xKey, color, widthStroke) => {
    const d = rows.map((r, i) => `${i ? "L" : "M"} ${xScale(r[xKey]).toFixed(2)} ${yScale(r.residual).toFixed(2)}`).join(" ");
    const circles = rows.map((r) => `<circle cx="${xScale(r[xKey]).toFixed(2)}" cy="${yScale(r.residual).toFixed(2)}" r="3" fill="${color}"/>`).join("\n");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${widthStroke}"/>\n${circles}`;
  };
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${zero}" y2="${zero}" stroke="#64748b" stroke-width="1" stroke-dasharray="5 5"/>
${pathFor(cumulativeResidual, "hi", "#7dd3fc", 3)}
${pathFor(blockResidual, "hi", "#f472b6", 2)}
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="${pad}" y="26" fill="#7dd3fc">cumulative real - composite baseline</text>
<text x="${pad}" y="46" fill="#f472b6">dyadic block real - composite baseline</text>
<text x="${pad}" y="${height - 18}" fill="#94a3b8">residual of residue-centered omega(label-1) gap covariance</text>
</g>
</svg>`;
}

function mdRows(rows, includeLo = false) {
  return rows.map((r) => {
    const interval = includeLo ? `${r.lo}..${r.hi}` : `${r.hi}`;
    return `| ${interval} | ${r.count} | ${r.covarianceMean.toFixed(8)} | ${r.baselineMean.toFixed(8)} | ${r.baselineSd.toFixed(8)} | ${r.residual.toFixed(8)} | ${r.residualOverBaselineSd.toFixed(3)} |`;
  }).join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
const isp = sieve(N);
const omega = omegaTable(N);
const realLabels = primesUpTo(N);
const realCumulative = summarizeRanges(realLabels, omega, endpoints.map((hi) => ({ lo: 0, hi })));
const realBlocks = summarizeRanges(realLabels, omega, blocks);
const compositeLabelsBySeed = seeds.map((seed) => residueMatchedCompositeLabels(seed, realLabels, isp));
const compositeCumulative = compositeLabelsBySeed.map((labels) => summarizeRanges(labels, omega, endpoints.map((hi) => ({ lo: 0, hi }))));
const compositeBlocks = compositeLabelsBySeed.map((labels) => summarizeRanges(labels, omega, blocks));
const cramer = seeds.map((seed) => summarizeRanges(cramerPrimes(N, seed), omega, endpoints.map((hi) => ({ lo: 0, hi }))));
const wheel = seeds.map((seed) => summarizeRanges(wheelRandomLabels(210, seed, isp), omega, endpoints.map((hi) => ({ lo: 0, hi }))));
const cumulativeResidual = residualRows(realCumulative, compositeCumulative);
const blockResidual = residualRows(realBlocks, compositeBlocks);

const output = {
  candidate: "oprevgap covariance residual after subtracting residue-matched composite baseline",
  N,
  endpoints,
  blocks,
  seeds,
  modulus,
  realCumulative,
  realBlocks,
  compositeCumulative,
  compositeBlocks,
  cumulativeResidual,
  blockResidual,
  summaries: {
    cramer: controlSummary(cramer),
    wheel: controlSummary(wheel),
    compositeCumulative: controlSummary(compositeCumulative),
    compositeBlocks: controlSummary(compositeBlocks),
    cumulativeResidualRange: range(cumulativeResidual.map((r) => r.residual)),
    blockResidualRange: range(blockResidual.map((r) => r.residual)),
  },
};

const jsonPath = path.join(outDir, `oprevgapres-audit-${N}.json`);
const mdPath = path.join(outDir, `oprevgapres-audit-${N}.md`);
const svgPath = path.join(outDir, `oprevgapres-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(cumulativeResidual, blockResidual));

const md = `# oprevgap residual audit

Candidate:
\`Ores=C_real-mean_s C_residue_matched_composite_s\`, where \`C\` is the
mod-210 residue-centered covariance between \`omega(label-1)\` and
\`gap/log(label)-1\`.

## Cumulative residuals

| endpoint | events | real covariance | composite mean | composite sd | residual | residual / composite sd |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdRows(cumulativeResidual)}

## Dyadic block residuals

| block | events | real covariance | composite mean | composite sd | residual | residual / composite sd |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdRows(blockResidual, true)}

## Control context at N=${N}

| group | covariance range | z range | full path covariance range |
| --- | ---: | ---: | ---: |
| ordinary Cramer | ${output.summaries.cramer.covarianceRange[0].toFixed(8)} .. ${output.summaries.cramer.covarianceRange[1].toFixed(8)} | ${output.summaries.cramer.zRange[0].toFixed(3)} .. ${output.summaries.cramer.zRange[1].toFixed(3)} | ${output.summaries.cramer.pathRange[0].toFixed(8)} .. ${output.summaries.cramer.pathRange[1].toFixed(8)} |
| W=210 fake labels | ${output.summaries.wheel.covarianceRange[0].toFixed(8)} .. ${output.summaries.wheel.covarianceRange[1].toFixed(8)} | ${output.summaries.wheel.zRange[0].toFixed(3)} .. ${output.summaries.wheel.zRange[1].toFixed(3)} | ${output.summaries.wheel.pathRange[0].toFixed(8)} .. ${output.summaries.wheel.pathRange[1].toFixed(8)} |
| residue-matched composite cumulative | ${output.summaries.compositeCumulative.covarianceRange[0].toFixed(8)} .. ${output.summaries.compositeCumulative.covarianceRange[1].toFixed(8)} | ${output.summaries.compositeCumulative.zRange[0].toFixed(3)} .. ${output.summaries.compositeCumulative.zRange[1].toFixed(3)} | ${output.summaries.compositeCumulative.pathRange[0].toFixed(8)} .. ${output.summaries.compositeCumulative.pathRange[1].toFixed(8)} |

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  lastCumulative: cumulativeResidual.at(-1),
  blockResidualRange: output.summaries.blockResidualRange,
  cumulativeResidualRange: output.summaries.cumulativeResidualRange,
}, null, 2));
