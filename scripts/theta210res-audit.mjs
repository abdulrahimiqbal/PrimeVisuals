#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const W = 210;
const phiW = 48;
const scale = W / phiW;
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));
const smallPrimeLogs = new Map([[2, Math.log(2)], [3, Math.log(3)], [5, Math.log(5)], [7, Math.log(7)]]);

function gcd(a, b) {
  let x = Math.abs(a), y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function coprimeW(n) {
  return gcd(n, W) === 1;
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
  const fitRows = rows.filter((r) => r.maxAbs > 0);
  if (fitRows.length < 2) return { theta: 0, C: 0 };
  const fit = linearFit(
    fitRows.map((r) => Math.log(r.N)),
    fitRows.map((r) => Math.log(r.maxAbs)),
  );
  return { theta: fit.slope, C: Math.exp(fit.intercept) };
}

function maskFromLabels(labels) {
  const mask = new Uint8Array(N + 1);
  for (const label of labels) if (label <= N) mask[label] = 1;
  return mask;
}

function wheelRandomLabels(seed, isp, compositeOnly = false) {
  const random = rng(seed);
  const labels = [];
  for (let n = 5; n <= N; n++) {
    if (!coprimeW(n)) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, scale / Math.log(n))) labels.push(n);
  }
  return labels;
}

function summarizeMask(name, mask, factorCheck = false) {
  const rows = [];
  let acc = 0, maxAbs = 0, coprimeCount = 0, theta = 0, smallLog = 0, maxIdentityError = 0;
  let endpointIndex = 0;
  for (let n = 2; n <= N; n++) {
    if (factorCheck && mask[n]) theta += Math.log(n);
    if (factorCheck && smallPrimeLogs.has(n)) smallLog += smallPrimeLogs.get(n);
    if (coprimeW(n)) {
      coprimeCount++;
      acc += (mask[n] ? Math.log(n) : 0) - scale;
      maxAbs = Math.max(maxAbs, Math.abs(acc));
    }
    if (n === endpoints[endpointIndex]) {
      const row = {
        N: n,
        value: acc,
        normalized: acc / Math.sqrt(n),
        maxAbs,
        maxAbsOverSqrtN: maxAbs / Math.sqrt(n),
        coprimeCount,
      };
      if (factorCheck) {
        const factor = theta - smallLog - scale * coprimeCount;
        const identityError = acc - factor;
        maxIdentityError = Math.max(maxIdentityError, Math.abs(identityError));
        row.factorValue = factor;
        row.identityError = identityError;
      }
      rows.push(row);
      endpointIndex++;
    }
  }
  return { name, rows, exponent: exponentFit(rows), maxIdentityError };
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function groupSummary(group) {
  const last = group.map((s) => s.rows.at(-1));
  return {
    valueRange: range(last.map((r) => r.value)),
    normalizedRange: range(last.map((r) => r.normalized)),
    maxAbsOverSqrtNRange: range(last.map((r) => r.maxAbsOverSqrtN)),
    thetaRange: range(group.map((s) => s.exponent.theta)),
  };
}

function svg(series) {
  const width = 980, height = 520, pad = 56;
  const all = series.flatMap((s) => s.rows.map((r) => r.normalized));
  const minY = Math.min(...all), maxY = Math.max(...all);
  const ySpan = maxY - minY || 1;
  const xScale = (x) => pad + (Math.log(x) - Math.log(endpoints[0])) / (Math.log(N) - Math.log(endpoints[0])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ySpan * (height - 2 * pad);
  const colors = ["#7dd3fc", "#fbbf24", "#f472b6", "#a7f3d0", "#c4b5fd", "#fb7185", "#93c5fd"];
  const paths = series.map((s, i) => {
    const d = s.rows.map((r, k) => `${k ? "L" : "M"} ${xScale(r.N).toFixed(2)} ${yScale(r.normalized).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${i === 0 ? 3 : 1.5}" />`;
  }).join("\n");
  const labels = series.map((s, i) => `<text x="${pad}" y="${22 + i * 18}" fill="${colors[i % colors.length]}">${s.name}</text>`).join("\n");
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${zero}" y2="${zero}" stroke="#64748b" stroke-width="1"/>
${paths}
<g font-family="Menlo, Consolas, monospace" font-size="12">${labels}</g>
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">Theta210res(x)/sqrt(x), x-axis log-scaled, N=${N}</text>
</svg>`;
}

function mdRows(s) {
  return s.rows.map((r) => `| ${r.N} | ${r.value.toFixed(6)} | ${r.normalized.toFixed(6)} | ${r.maxAbsOverSqrtN.toFixed(6)} | ${r.identityError === undefined ? "" : r.identityError.toExponential(3)} |`).join("\n");
}

function mdGroupLine(name, summary) {
  return `| ${name} | ${summary.normalizedRange[0].toFixed(6)} .. ${summary.normalizedRange[1].toFixed(6)} | ${summary.maxAbsOverSqrtNRange[0].toFixed(6)} .. ${summary.maxAbsOverSqrtNRange[1].toFixed(6)} | ${summary.thetaRange[0].toFixed(6)} .. ${summary.thetaRange[1].toFixed(6)} |`;
}

fs.mkdirSync(outDir, { recursive: true });
const isp = sieve(N);
const real = summarizeMask("real-primes", isp, true);
const cramer = seeds.map((seed) => summarizeMask(`cramer-seed-${seed}`, maskFromLabels(cramerPrimes(N, seed))));
const wheel = seeds.map((seed) => summarizeMask(`wheel-W210-seed-${seed}`, maskFromLabels(wheelRandomLabels(seed, isp, false))));
const composite = seeds.map((seed) => summarizeMask(`composite-W210-seed-${seed}`, maskFromLabels(wheelRandomLabels(seed, isp, true))));

const summaries = {
  cramer: groupSummary(cramer),
  wheel: groupSummary(wheel),
  composite: groupSummary(composite),
};

const output = {
  candidate: "Theta210res(x)=sum_{2<=n<=x,gcd(n,210)=1}(isprime(n)*log(n)-210/phi(210))",
  preregisteredConfirm: "tight sqrt-normalized flat band, raw exponent near 1/2, materially wider W=210 fake-label controls, composite controls fail",
  preregisteredBreak: "exact Chebyshev factor identity, or W=210 controls reproduce residual width",
  N,
  W,
  phiW,
  scale,
  endpoints,
  seeds,
  real,
  cramer,
  wheel,
  composite,
  summaries,
};

const jsonPath = path.join(outDir, `theta210res-audit-${N}.json`);
const svgPath = path.join(outDir, `theta210res-audit-${N}.svg`);
const mdPath = path.join(outDir, `theta210res-audit-${N}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, ...wheel.slice(0, 3), cramer[0], composite[0]]));

const md = `# theta210res audit

Candidate:
\`Theta210res(x)=sum_{2<=n<=x,gcd(n,210)=1}(isprime(n)*log(n)-210/phi(210))\`.

Preregistered confirmation: tight sqrt-normalized flat band, raw exponent near
\`1/2\`, materially wider W=210 fake-label controls, composite controls fail.

Preregistered break: exact Chebyshev factor identity, or W=210 controls
reproduce residual width.

## Real primes and factor check

| N | value | value/sqrt(N) | maxAbs/sqrt(N) | identity error |
| ---: | ---: | ---: | ---: | ---: |
${mdRows(real)}

Real exponent fit from endpoint maxAbs: \`theta=${real.exponent.theta.toFixed(6)}\`.
Maximum identity error at endpoints: \`${real.maxIdentityError.toExponential(6)}\`.

Exact identity checked:
\`Theta210res(x)=theta(x)-sum_{p|210,p<=x}log(p)-(210/48)C_210(x)\`.

## Control summary at N=${N}

| group | value/sqrt(N) range | maxAbs/sqrt(N) range | theta range |
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
  realTheta: real.exponent.theta,
  maxIdentityError: real.maxIdentityError,
  summaries,
}, null, 2));
