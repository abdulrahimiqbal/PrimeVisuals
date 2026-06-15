#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, mobiusUpTo, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 4000000);
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

function exponentFit(rows) {
  const xs = rows.map((r) => Math.log(r.N));
  const ys = rows.map((r) => Math.log(Math.max(1, r.maxAbs)));
  const fit = linearFit(xs, ys);
  return { theta: fit.slope, C: Math.exp(fit.intercept) };
}

function summarizeLabels(name, labels, mu) {
  const rows = [];
  let acc = 0, maxAbs = 0, sumSquares = 0, count = 0, j = 0;
  for (const x of endpoints) {
    while (j + 1 < labels.length && labels[j + 1] <= x) {
      const p = labels[j];
      const gap = labels[j + 1] - p;
      acc += (mu[p - 1] || 0) * (gap - Math.log(p));
      maxAbs = Math.max(maxAbs, Math.abs(acc));
      sumSquares += acc * acc;
      count++;
      j++;
    }
    rows.push({
      N: x,
      labels: j + 1,
      value: acc,
      maxAbs,
      maxAbsOverSqrtN: maxAbs / Math.sqrt(x),
      rmsOverSqrtN: Math.sqrt(sumSquares / Math.max(1, count)) / Math.sqrt(x),
    });
  }
  return { name, rows, exponent: exponentFit(rows) };
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

function svg(series) {
  const width = 980, height = 520, pad = 54;
  const all = series.flatMap((s) => s.rows.map((r) => r.value));
  const minY = Math.min(...all), maxY = Math.max(...all);
  const ySpan = maxY - minY || 1;
  const xScale = (x) => pad + (Math.log(x) - Math.log(endpoints[0])) / (Math.log(N) - Math.log(endpoints[0])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ySpan * (height - 2 * pad);
  const colors = ["#7dd3fc", "#fbbf24", "#f472b6", "#a7f3d0", "#c4b5fd", "#fb7185", "#93c5fd"];
  const paths = series.map((s, i) => {
    const d = s.rows.map((r, k) => `${k ? "L" : "M"} ${xScale(r.N).toFixed(2)} ${yScale(r.value).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${i === 0 ? 3 : 1.6}" />`;
  }).join("\n");
  const labels = series.map((s, i) => `<text x="${pad}" y="${22 + i * 18}" fill="${colors[i % colors.length]}">${s.name}</text>`).join("\n");
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${zero}" y2="${zero}" stroke="#64748b" stroke-width="1"/>
${paths}
<g font-family="Menlo, Consolas, monospace" font-size="12">${labels}</g>
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">Σ μ(label-1)(next-label gap - log label), x-axis log-scaled, N=${N}</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const mu = mobiusUpTo(N);
const isp = sieve(N);
const real = summarizeLabels("real-primes", primesUpTo(N), mu);
const cramer = seeds.map((seed) => summarizeLabels(`cramer-seed-${seed}`, cramerPrimes(N, seed), mu));
const wheel = seeds.map((seed) => summarizeLabels(`wheel-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, false), mu));
const composite = seeds.map((seed) => summarizeLabels(`composite-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, true), mu));

const output = {
  candidate: "pmugapres(n)=sum_{p<=n} mu(p-1)*(gap(p)-log(p))",
  preregisteredConfirm: "flat line with stable residual and materially smaller scale than five Cramer and composite controls",
  preregisteredBreak: "visible drift, unstable residual exponent, or comparable fake/composite controls",
  N,
  endpoints,
  real,
  cramer,
  wheel,
  composite,
};

const jsonPath = path.join(outDir, `pmugapres-audit-${N}.json`);
const svgPath = path.join(outDir, `pmugapres-audit-${N}.svg`);
const mdPath = path.join(outDir, `pmugapres-audit-${N}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, ...cramer.slice(0, 3), ...composite.slice(0, 2)]));

const line = (s) => {
  const last = s.rows.at(-1);
  return `| ${s.name} | ${last.labels} | ${last.value.toFixed(3)} | ${last.maxAbs.toFixed(3)} | ${last.maxAbsOverSqrtN.toFixed(6)} | ${s.exponent.theta.toFixed(6)} |`;
};
const md = `# pmugapres audit

Candidate: \`pmugapres(n)=sum_{p<=n} mu(p-1)*(gap(p)-log(p))\`.

Preregistered confirmation: flat line with stable residual and materially
smaller scale than five Cramer and composite controls.

Preregistered break: visible drift, unstable residual exponent, or comparable
fake/composite controls.

## Summary at N=${N}

| series | labels | final value | maxAbs | maxAbs/sqrt(N) | theta |
| --- | ---: | ---: | ---: | ---: | ---: |
${[real, ...cramer, ...composite].map(line).join("\n")}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({ ok: true, jsonPath, mdPath, svgPath, real: real.rows.at(-1), realTheta: real.exponent.theta }, null, 2));
