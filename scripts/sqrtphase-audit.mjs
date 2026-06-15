#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));
const blocks = endpoints.map((hi, i) => ({ lo: i === 0 ? 1 : endpoints[i - 1], hi }));
const TAU = 2 * Math.PI;

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

function phase(n) {
  return Math.cos(TAU * Math.sqrt(n));
}

function midpointMainAtEndpoints() {
  const out = new Map();
  let acc = 0, endpointIndex = 0;
  for (let i = 0; i <= N; i++) {
    if (i > 2) {
      const mid = i - 0.5;
      acc += phase(mid) / Math.log(mid);
    }
    while (endpointIndex < endpoints.length && i >= endpoints[endpointIndex]) {
      out.set(endpoints[endpointIndex], acc);
      endpointIndex++;
    }
  }
  return out;
}

function wheelRandomLabels(W, seed, isp, compositeOnly = false) {
  const phiW = phiSmall(W);
  const scale = W / phiW;
  const random = rng(seed);
  const labels = [];
  for (let n = 5; n <= N; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, scale / Math.log(n))) labels.push(n);
  }
  return labels;
}

function summarizeCumulative(name, labels, mainByEndpoint) {
  const rows = [];
  let j = 0, sum = 0, maxAbsResidual = 0;
  for (const endpoint of endpoints) {
    while (j < labels.length && labels[j] <= endpoint) {
      sum += phase(labels[j]);
      j++;
    }
    const main = mainByEndpoint.get(endpoint);
    const residual = sum - main;
    maxAbsResidual = Math.max(maxAbsResidual, Math.abs(residual));
    rows.push({
      N: endpoint,
      labels: j,
      phaseSum: sum,
      main,
      residual,
      residualOverSqrtLabels: j ? residual / Math.sqrt(j) : 0,
      maxAbsResidual,
      maxAbsResidualOverSqrtLabels: j ? maxAbsResidual / Math.sqrt(j) : 0,
    });
  }
  return { name, rows };
}

function summarizeBlocks(name, labels, mainByEndpoint) {
  return {
    name,
    rows: blocks.map(({ lo, hi }) => {
      let sum = 0, count = 0;
      for (const label of labels) {
        if (label <= lo) continue;
        if (label > hi) break;
        sum += phase(label);
        count++;
      }
      const main = mainByEndpoint.get(hi) - (mainByEndpoint.get(lo) || 0);
      const residual = sum - main;
      return {
        lo,
        hi,
        labels: count,
        phaseSum: sum,
        main,
        residual,
        residualOverSqrtLabels: count ? residual / Math.sqrt(count) : 0,
      };
    }),
  };
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function groupSummary(series) {
  const last = series.map((s) => s.rows.at(-1));
  return {
    residualRange: range(last.map((r) => r.residual)),
    residualOverSqrtLabelsRange: range(last.map((r) => r.residualOverSqrtLabels)),
    maxAbsResidualOverSqrtLabelsRange: range(last.map((r) => r.maxAbsResidualOverSqrtLabels)),
  };
}

function exponentFit(rows, valueKey) {
  const usable = rows.filter((r) => r.N > 0 && Math.abs(r[valueKey]) > 0);
  const xs = usable.map((r) => Math.log(r.N));
  const ys = usable.map((r) => Math.log(Math.abs(r[valueKey])));
  const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const numerator = xs.reduce((sum, x, i) => sum + (x - xMean) * (ys[i] - yMean), 0);
  const denominator = xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
  return numerator / denominator;
}

function svg(series, blockSeries) {
  const width = 1040, height = 580, pad = 60;
  const cumulativePoints = series.flatMap((s) => s.rows.map((r) => ({ ...r, name: s.name, kind: "cumulative" })));
  const blockPoints = blockSeries.rows.map((r) => ({ ...r, N: r.hi, name: "real-blocks", kind: "blocks" }));
  const all = cumulativePoints.concat(blockPoints);
  const minY = Math.min(...all.map((r) => r.residualOverSqrtLabels), -2);
  const maxY = Math.max(...all.map((r) => r.residualOverSqrtLabels), 2);
  const xScale = (x) => pad + (Math.log(x) - Math.log(endpoints[0])) / (Math.log(N) - Math.log(endpoints[0])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const colors = ["#7dd3fc", "#fbbf24", "#f472b6", "#a7f3d0", "#c4b5fd", "#fb7185"];
  const paths = series.map((s, i) => {
    const d = s.rows.map((r, k) => `${k ? "L" : "M"} ${xScale(r.N).toFixed(2)} ${yScale(r.residualOverSqrtLabels).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${i === 0 ? 3 : 1.4}" />`;
  }).join("\n");
  const blockPath = blockSeries.rows.map((r, k) => `${k ? "L" : "M"} ${xScale(r.hi).toFixed(2)} ${yScale(r.residualOverSqrtLabels).toFixed(2)}`).join(" ");
  const labels = series.map((s, i) => `<text x="${pad}" y="${24 + i * 18}" fill="${colors[i % colors.length]}">${s.name}</text>`).join("\n");
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${zero}" y2="${zero}" stroke="#64748b" stroke-width="1" stroke-dasharray="5 5"/>
${paths}
<path d="${blockPath}" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 4"/>
<g font-family="Menlo, Consolas, monospace" font-size="12">
${labels}
<text x="${pad}" y="${24 + series.length * 18}" fill="#ffffff">real dyadic blocks</text>
<text x="${pad}" y="${height - 18}" fill="#94a3b8">sqrt-phase residual / sqrt(labels), after midpoint density integral</text>
</g>
</svg>`;
}

function mdRows(s) {
  return s.rows.map((r) => `| ${r.N} | ${r.labels} | ${r.phaseSum.toFixed(3)} | ${r.main.toFixed(3)} | ${r.residual.toFixed(3)} | ${r.residualOverSqrtLabels.toFixed(6)} | ${r.maxAbsResidualOverSqrtLabels?.toFixed(6) ?? ""} |`).join("\n");
}

function mdBlockRows(s) {
  return s.rows.map((r) => `| ${r.lo}..${r.hi} | ${r.labels} | ${r.phaseSum.toFixed(3)} | ${r.main.toFixed(3)} | ${r.residual.toFixed(3)} | ${r.residualOverSqrtLabels.toFixed(6)} |`).join("\n");
}

function mdGroupLine(name, summary) {
  return `| ${name} | ${summary.residualRange[0].toFixed(3)} .. ${summary.residualRange[1].toFixed(3)} | ${summary.residualOverSqrtLabelsRange[0].toFixed(6)} .. ${summary.residualOverSqrtLabelsRange[1].toFixed(6)} | ${summary.maxAbsResidualOverSqrtLabelsRange[0].toFixed(6)} .. ${summary.maxAbsResidualOverSqrtLabelsRange[1].toFixed(6)} |`;
}

fs.mkdirSync(outDir, { recursive: true });
const isp = sieve(N);
const mainByEndpoint = midpointMainAtEndpoints();
const real = summarizeCumulative("real-primes", primesUpTo(N), mainByEndpoint);
const realBlocks = summarizeBlocks("real-prime-blocks", primesUpTo(N), mainByEndpoint);
const cramer = seeds.map((seed) => summarizeCumulative(`cramer-seed-${seed}`, cramerPrimes(N, seed), mainByEndpoint));
const wheel = seeds.map((seed) => summarizeCumulative(`wheel-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, false), mainByEndpoint));
const composite = seeds.map((seed) => summarizeCumulative(`composite-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, true), mainByEndpoint));
const summaries = {
  cramer: groupSummary(cramer),
  wheel: groupSummary(wheel),
  composite: groupSummary(composite),
};
const realMaxAbsTheta = exponentFit(real.rows, "maxAbsResidual");

const output = {
  candidate: "sqrtphaseres(x)=sum_{p<=x}cos(2*pi*sqrt(p))-integral cos(2*pi*sqrt(t))/log(t)dt",
  N,
  endpoints,
  blocks,
  seeds,
  realMaxAbsTheta,
  real,
  realBlocks,
  cramer,
  wheel,
  composite,
  summaries,
};

const jsonPath = path.join(outDir, `sqrtphase-audit-${N}.json`);
const mdPath = path.join(outDir, `sqrtphase-audit-${N}.md`);
const svgPath = path.join(outDir, `sqrtphase-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, cramer[0], wheel[0], composite[0]], realBlocks));

const md = `# sqrt phase residual audit

Candidate:
\`sqrtphaseres(x)=sum_{p<=x} cos(2*pi*sqrt(p)) - integral_2^x cos(2*pi*sqrt(t))/log(t) dt\`.

The integral is approximated by midpoint intervals, matching the lab primitive.

Endpoint max-residual exponent fit: \`${realMaxAbsTheta.toFixed(6)}\`.

## Real primes

| N | labels | phase sum | density main | residual | residual/sqrt(labels) | maxAbs residual/sqrt(labels) |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdRows(real)}

## Real dyadic blocks

| block | labels | phase sum | density main | residual | residual/sqrt(labels) |
| --- | ---: | ---: | ---: | ---: | ---: |
${mdBlockRows(realBlocks)}

## Control summary at N=${N}

| group | residual range | residual/sqrt(labels) range | maxAbs residual/sqrt(labels) range |
| --- | ---: | ---: | ---: |
${mdGroupLine("ordinary Cramer", summaries.cramer)}
${mdGroupLine("W=210 fake labels", summaries.wheel)}
${mdGroupLine("W=210 composite-only", summaries.composite)}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  realLast: real.rows.at(-1),
  realMaxAbsTheta,
  realBlockRange: range(realBlocks.rows.map((r) => r.residualOverSqrtLabels)),
  summaries,
}, null, 2));
