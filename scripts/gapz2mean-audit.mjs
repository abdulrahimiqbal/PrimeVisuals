#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const ladderWheels = [210, 2310, 30030, 510510, 9699690];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));

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
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
  const intercept = my - slope * mx;
  return { slope, intercept };
}

function trendFit(rows) {
  if (rows.length < 2) return { slope: 0, intercept: rows[0]?.mean ?? 0 };
  return linearFit(rows.map((r) => Math.log(r.N)), rows.map((r) => r.mean));
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

function summarizeLabels(name, labels) {
  const rows = [];
  let count = 0, mean = 0, m2 = 0, rawGapSum = 0, j = 0;
  for (const x of endpoints) {
    while (j + 1 < labels.length && labels[j + 1] <= x) {
      const p = labels[j];
      const gap = labels[j + 1] - p;
      const z = gap / Math.log(p) - 1;
      const z2 = z * z;
      count++;
      rawGapSum += gap;
      const delta = z2 - mean;
      mean += delta / count;
      m2 += delta * (z2 - mean);
      j++;
    }
    const variance = count > 1 ? m2 / (count - 1) : 0;
    const se = count > 1 ? Math.sqrt(variance / count) : 0;
    rows.push({
      N: x,
      labels: Math.min(labels.length, j + 1),
      gaps: count,
      mean,
      variance,
      se,
      meanGap: count ? rawGapSum / count : 0,
      zFromOne: se ? (mean - 1) / se : 0,
    });
  }
  return { name, rows, trend: trendFit(rows) };
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function groupSummary(group) {
  const last = group.map((s) => s.rows.at(-1));
  return {
    meanRange: range(last.map((r) => r.mean)),
    seRange: range(last.map((r) => r.se)),
    slopeRange: range(group.map((s) => s.trend.slope)),
    zFromOneRange: range(last.map((r) => r.zFromOne)),
  };
}

function svg(series) {
  const width = 980, height = 520, pad = 56;
  const all = series.flatMap((s) => s.rows.map((r) => r.mean));
  const minY = Math.min(...all), maxY = Math.max(...all);
  const ySpan = maxY - minY || 1;
  const xScale = (x) => pad + (Math.log(x) - Math.log(endpoints[0])) / (Math.log(N) - Math.log(endpoints[0])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ySpan * (height - 2 * pad);
  const colors = ["#7dd3fc", "#fbbf24", "#f472b6", "#a7f3d0", "#c4b5fd", "#fb7185", "#93c5fd"];
  const paths = series.map((s, i) => {
    const d = s.rows.map((r, k) => `${k ? "L" : "M"} ${xScale(r.N).toFixed(2)} ${yScale(r.mean).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
  }).join("\n");
  const labels = series.map((s, i) => `<text x="${pad}" y="${22 + i * 18}" fill="${colors[i % colors.length]}">${s.name}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
${paths}
<g font-family="Menlo, Consolas, monospace" font-size="12">${labels}</g>
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">mean((gap/log p - 1)^2), x-axis log-scaled, N=${N}</text>
</svg>`;
}

function mdRows(s) {
  return s.rows.map((r) => `| ${r.N} | ${r.gaps} | ${r.mean.toFixed(8)} | ${r.se.toFixed(8)} | ${r.zFromOne.toFixed(3)} | ${r.meanGap.toFixed(3)} |`).join("\n");
}

function mdGroupLine(name, summary) {
  return `| ${name} | ${summary.meanRange[0].toFixed(8)} .. ${summary.meanRange[1].toFixed(8)} | ${summary.seRange[0].toFixed(8)} .. ${summary.seRange[1].toFixed(8)} | ${summary.slopeRange[0].toFixed(8)} .. ${summary.slopeRange[1].toFixed(8)} | ${summary.zFromOneRange[0].toFixed(3)} .. ${summary.zFromOneRange[1].toFixed(3)} |`;
}

function mdLadderLine(row) {
  const scale = row.W / phiSmall(row.W);
  return `| ${row.W} | ${scale.toFixed(6)} | ${row.summary.meanRange[0].toFixed(8)} .. ${row.summary.meanRange[1].toFixed(8)} | ${row.summary.slopeRange[0].toFixed(8)} .. ${row.summary.slopeRange[1].toFixed(8)} |`;
}

fs.mkdirSync(outDir, { recursive: true });
const isp = sieve(N);
const real = summarizeLabels("real-primes", primesUpTo(N));
const cramer = seeds.map((seed) => summarizeLabels(`cramer-seed-${seed}`, cramerPrimes(N, seed)));
const wheel = seeds.map((seed) => summarizeLabels(`wheel-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, false)));
const composite = seeds.map((seed) => summarizeLabels(`composite-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, true)));
const wheelLadder = ladderWheels.map((W) => {
  const series = W === 210 ? wheel : seeds.map((seed) => summarizeLabels(`wheel-W${W}-seed-${seed}`, wheelRandomLabels(W, seed, isp, false)));
  return { W, series, summary: groupSummary(series) };
});

const summaries = {
  cramer: groupSummary(cramer),
  wheel: groupSummary(wheel),
  composite: groupSummary(composite),
};

const output = {
  candidate: "gapz2mean(x)=mean((gap(p)/log(p)-1)^2)",
  preregisteredConfirm: "stable flat real line whose value/trend differs materially from five W=210 fake-label controls, with composite-only controls failing",
  preregisteredBreak: "ordinary Cramer or W=210 fake labels reproduce the line and drift; then it is a density/null gap-moment calibration",
  N,
  endpoints,
  seeds,
  real,
  cramer,
  wheel,
  composite,
  wheelLadder,
  summaries,
};

const jsonPath = path.join(outDir, `gapz2mean-audit-${N}.json`);
const svgPath = path.join(outDir, `gapz2mean-audit-${N}.svg`);
const mdPath = path.join(outDir, `gapz2mean-audit-${N}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, ...cramer.slice(0, 2), ...wheel.slice(0, 2), composite[0]]));

const md = `# gapz2mean audit

Candidate: \`gapz2mean(x)=mean((gap(p)/log(p)-1)^2)\`.

Preregistered confirmation: stable flat real line whose value/trend differs
materially from five W=210 fake-label controls, with composite-only controls
failing.

Preregistered break: ordinary Cramer or W=210 fake labels reproduce the line
and drift; then it is a density/null gap-moment calibration.

## Real primes

| N | gaps | mean | se | z from 1 | mean raw gap |
| ---: | ---: | ---: | ---: | ---: | ---: |
${mdRows(real)}

Real log-range trend slope: \`${real.trend.slope.toFixed(8)}\`.

## Control summary at N=${N}

| group | mean range | se range | log-trend slope range | z-from-1 range |
| --- | ---: | ---: | ---: | ---: |
${mdGroupLine("ordinary Cramer", summaries.cramer)}
${mdGroupLine("W=210 fake labels", summaries.wheel)}
${mdGroupLine("W=210 composite-only", summaries.composite)}

## Primorial wheel ladder

| W | W/phi(W) | mean range at N=${N} | log-trend slope range |
| ---: | ---: | ---: | ---: |
${wheelLadder.map(mdLadderLine).join("\n")}

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
  realTrend: real.trend,
  wheelLadder: wheelLadder.map((row) => ({ W: row.W, summary: row.summary })),
  summaries,
}, null, 2));
