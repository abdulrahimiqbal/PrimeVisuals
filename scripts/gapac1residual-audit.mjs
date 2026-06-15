#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16000000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
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
  let count = 0, mean = 0, m2 = 0, j = 0;
  for (const x of endpoints) {
    while (j + 2 < labels.length && labels[j + 2] <= x) {
      const p0 = labels[j];
      const p1 = labels[j + 1];
      const g0 = p1 - p0;
      const g1 = labels[j + 2] - p1;
      const z0 = g0 / Math.log(p0) - 1;
      const z1 = g1 / Math.log(p1) - 1;
      const product = z0 * z1;
      count++;
      const delta = product - mean;
      mean += delta / count;
      m2 += delta * (product - mean);
      j++;
    }
    const variance = count > 1 ? m2 / (count - 1) : 0;
    const se = count > 1 ? Math.sqrt(variance / count) : 0;
    rows.push({ N: x, labels: Math.min(labels.length, j + 2), pairs: count, mean, variance, se, z: se ? mean / se : 0 });
  }
  return { name, rows };
}

function withResiduals(series, baselines) {
  return {
    ...series,
    rows: series.rows.map((row, i) => ({
      ...row,
      baseline: baselines[i],
      residual: row.mean - baselines[i],
      residualZ: row.se ? (row.mean - baselines[i]) / row.se : 0,
    })),
  };
}

function svg(series) {
  const width = 980, height = 520, pad = 54;
  const all = series.flatMap((s) => s.rows.map((r) => r.residual));
  const minY = Math.min(...all), maxY = Math.max(...all);
  const ySpan = maxY - minY || 1;
  const xScale = (x) => pad + (Math.log(x) - Math.log(endpoints[0])) / (Math.log(N) - Math.log(endpoints[0])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ySpan * (height - 2 * pad);
  const colors = ["#7dd3fc", "#fbbf24", "#f472b6", "#a7f3d0", "#c4b5fd", "#fb7185", "#93c5fd"];
  const paths = series.map((s, i) => {
    const d = s.rows.map((r, k) => `${k ? "L" : "M"} ${xScale(r.N).toFixed(2)} ${yScale(r.residual).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${i === 0 ? 3 : 1.6}" />`;
  }).join("\n");
  const labels = series.map((s, i) => `<text x="${pad}" y="${22 + i * 18}" fill="${colors[i % colors.length]}">${s.name}</text>`).join("\n");
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${zero}" y2="${zero}" stroke="#64748b" stroke-width="1"/>
${paths}
<g font-family="Menlo, Consolas, monospace" font-size="12">${labels}</g>
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">gapac1mean minus five-seed W=210 fake-label baseline, x-axis log-scaled, N=${N}</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const isp = sieve(N);
const realRaw = summarizeLabels("real-primes", primesUpTo(N));
const cramerRaw = seeds.map((seed) => summarizeLabels(`cramer-seed-${seed}`, cramerPrimes(N, seed)));
const wheelRaw = seeds.map((seed) => summarizeLabels(`wheel-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, false)));
const compositeRaw = seeds.map((seed) => summarizeLabels(`composite-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, true)));

const baselines = endpoints.map((_, i) => wheelRaw.reduce((s, w) => s + w.rows[i].mean, 0) / wheelRaw.length);
const real = withResiduals(realRaw, baselines);
const cramer = cramerRaw.map((s) => withResiduals(s, baselines));
const wheel = wheelRaw.map((s) => withResiduals(s, baselines));
const composite = compositeRaw.map((s) => withResiduals(s, baselines));

const output = {
  candidate: "gapac1mean(x) minus five-seed W=210 fake-label baseline",
  preregisteredConfirm: "stable residual flat line after local wheel subtraction, not explained by Cramer/composite controls",
  preregisteredBreak: "residual is known residue-transition/LO-S layer or unstable under range/control expansion",
  N,
  endpoints,
  baselines,
  real,
  cramer,
  wheel,
  composite,
};

const jsonPath = path.join(outDir, `gapac1residual-audit-${N}.json`);
const svgPath = path.join(outDir, `gapac1residual-audit-${N}.svg`);
const mdPath = path.join(outDir, `gapac1residual-audit-${N}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, ...cramer.slice(0, 3), ...wheel.slice(0, 2), ...composite.slice(0, 1)]));

const line = (s) => {
  const last = s.rows.at(-1);
  return `| ${s.name} | ${last.mean.toFixed(8)} | ${last.baseline.toFixed(8)} | ${last.residual.toFixed(8)} | ${last.residualZ.toFixed(3)} |`;
};
const md = `# gapac1 residual audit

Candidate: \`gapac1mean(x)\` minus the five-seed \`W=210\` fake-label baseline.

Preregistered confirmation: stable residual flat line after local wheel
subtraction, not explained by Cramer/composite controls.

Preregistered break: residual is known residue-transition/LO-S layer or
unstable under range/control expansion.

## Real residual by endpoint

| N | mean | W210 baseline | residual | residual/se |
| ---: | ---: | ---: | ---: | ---: |
${real.rows.map((r) => `| ${r.N} | ${r.mean.toFixed(8)} | ${r.baseline.toFixed(8)} | ${r.residual.toFixed(8)} | ${r.residualZ.toFixed(3)} |`).join("\n")}

## Summary at N=${N}

| series | mean | W210 baseline | residual | residual/se |
| --- | ---: | ---: | ---: | ---: |
${[real, ...cramer, ...wheel, ...composite].map(line).join("\n")}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({ ok: true, jsonPath, mdPath, svgPath, baseline: baselines.at(-1), real: real.rows.at(-1) }, null, 2));
