#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, roughIntervalWitnesses, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const windows = [N / 16, N / 8, N / 4, N / 2].map((lo) => [Math.round(lo), Math.round(2 * lo)]);
const eventLimit = Math.ceil(N + Math.max(10000, 20 * Math.log(N) ** 2));

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

function logIntegralPower(a, b, power) {
  if (b <= a) return 0;
  const lo = Math.log(Math.max(a, 2));
  const hi = Math.log(Math.max(b, 2));
  let steps = Math.max(2000, Math.ceil((hi - lo) * 4096));
  if (steps % 2) steps++;
  const h = (hi - lo) / steps;
  const f = (u) => Math.exp(u) / (u ** power);
  let sum = f(lo) + f(hi);
  for (let i = 1; i < steps; i++) sum += (i % 2 ? 4 : 2) * f(lo + i * h);
  return (h / 3) * sum;
}

function wheelRandomLabels(W, seed, isp, compositeOnly = false) {
  const phiW = phiSmall(W);
  const scale = W / phiW;
  const random = rng(seed);
  const labels = [];
  for (let n = 5; n <= eventLimit; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, scale / Math.log(n))) labels.push(n);
  }
  return labels;
}

function roughStats(labels, lo, hi) {
  let gaps = 0, exceptions = 0, witnesses = 0, maxGap = 0;
  for (let i = 0; i + 1 < labels.length; i++) {
    const p = labels[i];
    if (p < lo) continue;
    if (p >= hi) break;
    const width = labels[i + 1] - p;
    const count = roughIntervalWitnesses(p, width).count;
    gaps++;
    maxGap = Math.max(maxGap, width);
    if (count === 0) exceptions++;
    else witnesses += count;
  }
  const main = logIntegralPower(lo, hi, 2);
  return {
    lo,
    hi,
    gaps,
    exceptions,
    witnesses,
    maxGap,
    constant: main ? exceptions / main : 0,
    exceptionRate: gaps ? exceptions / gaps : 0,
    avgWitnesses: gaps ? witnesses / gaps : 0,
    mainLi2: main,
  };
}

function cumulativeStats(labels, endpoints) {
  const out = [];
  let j = 0, gaps = 0, exceptions = 0, witnesses = 0;
  for (const x of endpoints) {
    while (j + 1 < labels.length && labels[j] < x) {
      const width = labels[j + 1] - labels[j];
      const count = roughIntervalWitnesses(labels[j], width).count;
      gaps++;
      if (count === 0) exceptions++;
      else witnesses += count;
      j++;
    }
    const main = logIntegralPower(3, x, 2);
    out.push({
      N: x,
      gaps,
      exceptions,
      witnesses,
      constant: main ? exceptions / main : 0,
      mainLi2: main,
    });
  }
  return out;
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

function residualFit(cumulative) {
  const num = cumulative.reduce((acc, r) => acc + r.exceptions * r.mainLi2, 0);
  const den = cumulative.reduce((acc, r) => acc + r.mainLi2 * r.mainLi2, 0);
  const cHat = den ? num / den : 0;
  const rows = cumulative.map((r) => ({
    N: r.N,
    residual: r.exceptions - cHat * r.mainLi2,
    absResidual: Math.abs(r.exceptions - cHat * r.mainLi2),
  })).filter((r) => r.absResidual > 0);
  const fit = rows.length >= 2
    ? linearFit(rows.map((r) => Math.log(r.N)), rows.map((r) => Math.log(r.absResidual)))
    : { slope: 0, intercept: 0 };
  return { cHat, theta: fit.slope, residuals: rows };
}

function summarize(name, labels) {
  const win = windows.map(([lo, hi]) => roughStats(labels, lo, hi));
  const endpoints = windows.map(([, hi]) => hi);
  const cumulative = cumulativeStats(labels, endpoints);
  return { name, windows: win, cumulative, residualFit: residualFit(cumulative) };
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function groupWindowSummary(group) {
  return windows.map(([lo, hi], index) => {
    const constants = group.map((s) => s.windows[index].constant);
    const rates = group.map((s) => s.windows[index].exceptionRate);
    return { lo, hi, constantRange: range(constants), exceptionRateRange: range(rates) };
  });
}

function svg(series) {
  const width = 980, height = 520, pad = 56;
  const all = series.flatMap((s) => s.windows.map((r) => r.constant));
  const minY = Math.min(...all), maxY = Math.max(...all);
  const ySpan = maxY - minY || 1;
  const xScale = (x) => pad + (Math.log(x) - Math.log(windows[0][1])) / (Math.log(N) - Math.log(windows[0][1])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ySpan * (height - 2 * pad);
  const colors = ["#7dd3fc", "#fbbf24", "#f472b6", "#a7f3d0", "#c4b5fd", "#fb7185", "#93c5fd"];
  const paths = series.map((s, i) => {
    const d = s.windows.map((r, k) => `${k ? "L" : "M"} ${xScale(r.hi).toFixed(2)} ${yScale(r.constant).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
  }).join("\n");
  const labels = series.map((s, i) => `<text x="${pad}" y="${22 + i * 18}" fill="${colors[i % colors.length]}">${s.name}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
${paths}
<g font-family="Menlo, Consolas, monospace" font-size="12">${labels}</g>
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">rough-gap exceptions / integral dt/log^2(t), dyadic windows, N=${N}</text>
</svg>`;
}

function mdTableSeries(series) {
  return series.windows.map((r) => `| ${r.lo}..${r.hi} | ${r.gaps} | ${r.exceptions} | ${r.constant.toFixed(6)} | ${r.exceptionRate.toFixed(6)} | ${r.avgWitnesses.toFixed(6)} |`).join("\n");
}

function mdGroup(name, group) {
  return groupWindowSummary(group).map((r) => `| ${r.lo}..${r.hi} | ${r.constantRange[0].toFixed(6)}..${r.constantRange[1].toFixed(6)} | ${r.exceptionRateRange[0].toFixed(6)}..${r.exceptionRateRange[1].toFixed(6)} |`).join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
const isp = sieve(eventLimit);
const real = summarize("real-primes", primesUpTo(eventLimit));
const cramer = seeds.map((seed) => summarize(`cramer-seed-${seed}`, cramerPrimes(eventLimit, seed)));
const wheel = seeds.map((seed) => summarize(`wheel-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, false)));
const composite = seeds.map((seed) => summarize(`composite-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, true)));

const output = {
  candidate: "roughmiss(x) * log(x)^2 / x, audited on dyadic windows as exceptions / integral dt/log^2(t)",
  preregisteredConfirm: "stable real constant distinct from ordinary Cramer and composite-permitting controls",
  preregisteredBreak: "known Gafni-Tao rough-gap law, or reproduction by non-prime/wheel controls",
  N,
  eventLimit,
  windows,
  seeds,
  real,
  cramer,
  wheel,
  composite,
  groupSummary: {
    cramer: groupWindowSummary(cramer),
    wheel: groupWindowSummary(wheel),
    composite: groupWindowSummary(composite),
  },
};

const jsonPath = path.join(outDir, `roughmiss-audit-${N}.json`);
const svgPath = path.join(outDir, `roughmiss-audit-${N}.svg`);
const mdPath = path.join(outDir, `roughmiss-audit-${N}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, ...cramer.slice(0, 2), ...wheel.slice(0, 2), ...composite.slice(0, 1)]));

const lastReal = real.windows.at(-1);
const md = `# roughmiss audit

Candidate: \`roughmiss(x) * log(x)^2 / x\`, audited on dyadic windows as
\`exceptions / integral dt/log^2(t)\`.

Preregistered confirmation: stable real constant distinct from ordinary
Cramer and composite-permitting controls.

Preregistered break: known Gafni-Tao rough-gap law, or reproduction by
non-prime/wheel controls.

## Real primes

| window | gaps | exceptions | constant | exception rate | avg witnesses |
| --- | ---: | ---: | ---: | ---: | ---: |
${mdTableSeries(real)}

Least-squares cumulative main constant: \`${real.residualFit.cHat.toFixed(6)}\`.
Residual exponent fit after subtracting that main term:
\`theta=${real.residualFit.theta.toFixed(6)}\`.

## Control ranges

### Cramer

| window | constant range | exception-rate range |
| --- | ---: | ---: |
${mdGroup("cramer", cramer)}

### W=210 fake labels

| window | constant range | exception-rate range |
| --- | ---: | ---: |
${mdGroup("wheel", wheel)}

### W=210 composite-only labels

| window | constant range | exception-rate range |
| --- | ---: | ---: |
${mdGroup("composite", composite)}

## Last-window read

Real on \`${lastReal.lo}..${lastReal.hi}\`:
\`${lastReal.constant.toFixed(6)}\`.

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  realLast: lastReal,
  cramerLastRange: output.groupSummary.cramer.at(-1).constantRange,
  wheelLastRange: output.groupSummary.wheel.at(-1).constantRange,
  compositeLastRange: output.groupSummary.composite.at(-1).constantRange,
}, null, 2));
