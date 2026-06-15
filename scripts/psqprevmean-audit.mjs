#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, mobiusUpTo, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
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
  const fitRows = rows.filter((r) => r.maxAbsResidual > 0);
  if (fitRows.length < 2) return { theta: 0, C: 0 };
  const fit = linearFit(
    fitRows.map((r) => Math.log(r.N)),
    fitRows.map((r) => Math.log(r.maxAbsResidual)),
  );
  return { theta: fit.slope, C: Math.exp(fit.intercept) };
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

function artinConstant(limit) {
  let product = 1;
  for (const p of primesUpTo(limit)) product *= 1 - 1 / (p * (p - 1));
  return product;
}

function summarizeLabels(name, labels, mu, expected) {
  const rows = [];
  let j = 0, squarefree = 0, maxAbsResidual = 0;
  for (const x of endpoints) {
    while (j < labels.length && labels[j] <= x) {
      if ((mu[labels[j] - 1] || 0) !== 0) squarefree++;
      j++;
    }
    const residual = squarefree - expected * j;
    maxAbsResidual = Math.max(maxAbsResidual, Math.abs(residual));
    rows.push({
      N: x,
      labels: j,
      squarefree,
      mean: j ? squarefree / j : 0,
      residual,
      residualOverSqrtLabels: j ? residual / Math.sqrt(j) : 0,
      maxAbsResidual,
      maxAbsResidualOverSqrtLabels: j ? maxAbsResidual / Math.sqrt(j) : 0,
    });
  }
  return { name, rows, exponent: exponentFit(rows) };
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function groupSummary(group) {
  const last = group.map((s) => s.rows.at(-1));
  return {
    meanRange: range(last.map((r) => r.mean)),
    residualOverSqrtLabelsRange: range(last.map((r) => r.residualOverSqrtLabels)),
    maxAbsResidualOverSqrtLabelsRange: range(last.map((r) => r.maxAbsResidualOverSqrtLabels)),
    thetaRange: range(group.map((s) => s.exponent.theta)),
  };
}

function svg(series, expected) {
  const width = 980, height = 520, pad = 56;
  const all = series.flatMap((s) => s.rows.map((r) => r.mean)).concat([expected]);
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
  const expectedY = yScale(expected);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${expectedY}" y2="${expectedY}" stroke="#64748b" stroke-width="1" stroke-dasharray="5 5"/>
${paths}
<g font-family="Menlo, Consolas, monospace" font-size="12">${labels}</g>
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">mean(mu(label-1)^2), dashed line Artin product ${expected.toFixed(9)}, N=${N}</text>
</svg>`;
}

function mdRows(s) {
  return s.rows.map((r) => `| ${r.N} | ${r.labels} | ${r.squarefree} | ${r.mean.toFixed(8)} | ${r.residual.toFixed(3)} | ${r.residualOverSqrtLabels.toFixed(6)} |`).join("\n");
}

function mdGroupLine(name, summary) {
  return `| ${name} | ${summary.meanRange[0].toFixed(8)} .. ${summary.meanRange[1].toFixed(8)} | ${summary.residualOverSqrtLabelsRange[0].toFixed(6)} .. ${summary.residualOverSqrtLabelsRange[1].toFixed(6)} | ${summary.maxAbsResidualOverSqrtLabelsRange[0].toFixed(6)} .. ${summary.maxAbsResidualOverSqrtLabelsRange[1].toFixed(6)} | ${summary.thetaRange[0].toFixed(6)} .. ${summary.thetaRange[1].toFixed(6)} |`;
}

fs.mkdirSync(outDir, { recursive: true });
const mu = mobiusUpTo(N);
const isp = sieve(N);
const expected = artinConstant(1_000_000);
const real = summarizeLabels("real-primes", primesUpTo(N), mu, expected);
const cramer = seeds.map((seed) => summarizeLabels(`cramer-seed-${seed}`, cramerPrimes(N, seed), mu, expected));
const wheel = seeds.map((seed) => summarizeLabels(`wheel-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, false), mu, expected));
const composite = seeds.map((seed) => summarizeLabels(`composite-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, true), mu, expected));

const summaries = {
  cramer: groupSummary(cramer),
  wheel: groupSummary(wheel),
  composite: groupSummary(composite),
};

const output = {
  candidate: "psqprevmean(x)=mean_{p<=x} mu(p-1)^2",
  expectedArtinProduct: expected,
  preregisteredConfirm: "stable flat line whose count residual relative to A*pi(x) is materially smaller than five Cramer and W=210 fake/composite controls",
  preregisteredBreak: "flat line explained by local congruence Euler product and reproduced by fake labels or composite controls",
  N,
  endpoints,
  seeds,
  real,
  cramer,
  wheel,
  composite,
  summaries,
};

const jsonPath = path.join(outDir, `psqprevmean-audit-${N}.json`);
const svgPath = path.join(outDir, `psqprevmean-audit-${N}.svg`);
const mdPath = path.join(outDir, `psqprevmean-audit-${N}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, ...cramer.slice(0, 2), ...wheel.slice(0, 2), composite[0]], expected));

const md = `# psqprevmean audit

Candidate: \`psqprevmean(x)=mean_{p<=x} mu(p-1)^2\`.

Artin/local-congruence product used as main term:
\`${expected.toFixed(12)}\`.

Preregistered confirmation: stable flat line whose count residual relative to
\`A*pi(x)\` is materially smaller than five Cramer and W=210 fake/composite
controls.

Preregistered break: flat line explained by local congruence Euler product and
reproduced by fake labels or composite controls.

## Real primes

| N | labels | squarefree | mean | residual vs A*labels | residual/sqrt(labels) |
| ---: | ---: | ---: | ---: | ---: | ---: |
${mdRows(real)}

Real endpoint max-residual exponent: \`theta=${real.exponent.theta.toFixed(6)}\`.

## Control summary at N=${N}

| group | mean range | residual/sqrt(labels) range | max residual/sqrt(labels) range | theta range |
| --- | ---: | ---: | ---: | ---: |
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
  expected,
  realLast: real.rows.at(-1),
  realTheta: real.exponent.theta,
  summaries,
}, null, 2));
