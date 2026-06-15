#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, mobiusUpTo, sieve } from "../src/core/math.js";

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
    while (j < labels.length && labels[j] <= x) {
      acc += mu[labels[j] - 1] || 0;
      maxAbs = Math.max(maxAbs, Math.abs(acc));
      sumSquares += acc * acc;
      count++;
      j++;
    }
    rows.push({
      N: x,
      labels: j,
      value: acc,
      maxAbs,
      maxAbsOverSqrtN: maxAbs / Math.sqrt(x),
      rmsOverSqrtN: Math.sqrt(sumSquares / Math.max(1, count)) / Math.sqrt(x),
    });
  }
  return { name, rows, exponent: exponentFit(rows) };
}

function weightedWheelExpectation(W, mu) {
  const phiW = phiSmall(W);
  const scale = W / phiW;
  const rows = [];
  let acc = 0, maxAbs = 0, j = 0;
  for (let n = 2; n <= N; n++) {
    if (gcd(n, W) === 1) {
      acc += scale * (mu[n - 1] || 0) / Math.log(n);
      maxAbs = Math.max(maxAbs, Math.abs(acc));
    }
    if (n === endpoints[j]) {
      rows.push({
        N: n,
        value: acc,
        maxAbs,
        maxAbsOverSqrtN: maxAbs / Math.sqrt(n),
      });
      j++;
    }
  }
  return { name: `wheel-expect-W${W}`, rows, exponent: exponentFit(rows) };
}

function wheelRandomLabels(W, seed, mu, isp, compositeOnly = false) {
  const phiW = phiSmall(W);
  const scale = W / phiW;
  const random = rng(seed);
  const labels = [];
  for (let n = 5; n <= N; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, scale / Math.log(n))) labels.push(n);
  }
  return summarizeLabels(`${compositeOnly ? "composite" : "wheel"}-W${W}-seed-${seed}`, labels, mu);
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
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">Σ μ(label-1), x-axis log-scaled, N=${N}</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const mu = mobiusUpTo(N);
const isp = sieve(N);
const realLabels = [];
for (let n = 2; n <= N; n++) if (isp[n]) realLabels.push(n);

const real = summarizeLabels("real-primes", realLabels, mu);
const cramer = seeds.map((seed) => summarizeLabels(`cramer-seed-${seed}`, cramerPrimes(N, seed), mu));
const wheelExpect = [6, 30, 210, 2310].map((W) => weightedWheelExpectation(W, mu));
const composite = seeds.map((seed) => wheelRandomLabels(210, seed, mu, isp, true));
const wheel = seeds.map((seed) => wheelRandomLabels(210, seed, mu, isp, false));

const output = {
  candidate: "pmuprev(n)=sum_{p<=n} mu(p-1)",
  preregisteredConfirm: "flat zero line whose max residual/sqrt(N) is materially smaller for real primes than Cramer and composite controls",
  preregisteredBreak: "same scale reproduced by Cramer/wheel/composite controls, or explainable as ordinary Mobius cancellation sampled through local congruences",
  N,
  endpoints,
  real,
  cramer,
  wheelExpect,
  wheel,
  composite,
};

const jsonPath = path.join(outDir, `pmuprev-audit-${N}.json`);
const svgPath = path.join(outDir, `pmuprev-audit-${N}.svg`);
const mdPath = path.join(outDir, `pmuprev-audit-${N}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, ...cramer.slice(0, 3), wheelExpect[2], ...composite.slice(0, 2)]));

const line = (s) => {
  const last = s.rows[s.rows.length - 1];
  return `| ${s.name} | ${last.labels ?? ""} | ${last.value.toFixed(3)} | ${last.maxAbs.toFixed(3)} | ${last.maxAbsOverSqrtN.toFixed(6)} | ${s.exponent.theta.toFixed(6)} |`;
};
const md = `# pmuprev audit

Candidate: \`pmuprev(n)=sum_{p<=n} mu(p-1)\`.

Preregistered confirmation: real primes give a flat zero line with materially
smaller \`maxAbs/sqrt(N)\` than Cramer, wheel, and composite-only controls.

Preregistered break: controls reproduce the same scale, or the line is just
ordinary Mobius cancellation sampled through local congruence filters.

## Summary at N=${N}

| series | labels | final value | maxAbs | maxAbs/sqrt(N) | theta |
| --- | ---: | ---: | ---: | ---: | ---: |
${[real, ...cramer, wheelExpect[2], ...composite].map(line).join("\n")}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({ ok: true, jsonPath, mdPath, svgPath, real: real.rows.at(-1), realTheta: real.exponent.theta }, null, 2));
