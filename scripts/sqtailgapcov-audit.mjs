#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, mobiusUpTo, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));
const smallSquareProduct = (1 - 1 / 2) * (1 - 1 / 6) * (1 - 1 / 20) * (1 - 1 / 42);
const artinProduct = 0.373955838964;
const tailSquarefreeExpectation = artinProduct / smallSquareProduct;

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
  return { slope, intercept: my - slope * mx };
}

function exponentFit(rows) {
  const fitRows = rows.filter((r) => Math.abs(r.sum) > 0 && r.count > 1);
  if (fitRows.length < 2) return { theta: 0, C: 0 };
  const fit = linearFit(
    fitRows.map((r) => Math.log(r.count)),
    fitRows.map((r) => Math.log(Math.abs(r.sum))),
  );
  return { theta: fit.slope, C: Math.exp(fit.intercept) };
}

function smallClean(predecessor) {
  return predecessor % 4 !== 0 && predecessor % 9 !== 0 && predecessor % 25 !== 0 && predecessor % 49 !== 0;
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

function summarizeLabels(name, labels, mu) {
  const rows = [];
  let endpointIndex = 0;
  let count = 0, sum = 0, sumSq = 0;
  let squarefree = 0, largeSquareFail = 0;
  let passGapSum = 0, passGapCount = 0, failGapSum = 0, failGapCount = 0;

  for (let i = 0; i + 1 < labels.length && endpointIndex < endpoints.length; i++) {
    const p = labels[i];
    while (endpointIndex < endpoints.length && p > endpoints[endpointIndex]) {
      rows.push(rowForEndpoint(endpoints[endpointIndex]));
      endpointIndex++;
    }
    if (!smallClean(p - 1)) continue;
    const gap = labels[i + 1] - p;
    const zGap = gap / Math.log(p) - 1;
    const isSquarefree = (mu[p - 1] || 0) !== 0;
    const tailResidual = (isSquarefree ? 1 : 0) - tailSquarefreeExpectation;
    const value = tailResidual * zGap;
    count++;
    sum += value;
    sumSq += value * value;
    if (isSquarefree) {
      squarefree++;
      passGapSum += zGap;
      passGapCount++;
    } else {
      largeSquareFail++;
      failGapSum += zGap;
      failGapCount++;
    }
  }

  while (endpointIndex < endpoints.length) {
    rows.push(rowForEndpoint(endpoints[endpointIndex]));
    endpointIndex++;
  }

  function rowForEndpoint(endpoint) {
    const mean = count ? sum / count : 0;
    const variance = count > 1 ? Math.max(0, (sumSq - count * mean * mean) / (count - 1)) : 0;
    const se = count ? Math.sqrt(variance / count) : 0;
    const z = se ? mean / se : 0;
    return {
      N: endpoint,
      count,
      squarefree,
      largeSquareFail,
      tailFailRate: count ? largeSquareFail / count : 0,
      mean,
      sum,
      se,
      z,
      passGapMean: passGapCount ? passGapSum / passGapCount : 0,
      failGapMean: failGapCount ? failGapSum / failGapCount : 0,
      gapMeanDiff: failGapCount && passGapCount ? failGapSum / failGapCount - passGapSum / passGapCount : 0,
    };
  }

  return { name, rows, exponent: exponentFit(rows) };
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function groupSummary(series) {
  const last = series.map((s) => s.rows.at(-1));
  return {
    meanRange: range(last.map((r) => r.mean)),
    zRange: range(last.map((r) => r.z)),
    tailFailRateRange: range(last.map((r) => r.tailFailRate)),
    gapMeanDiffRange: range(last.map((r) => r.gapMeanDiff)),
    thetaRange: range(series.map((s) => s.exponent.theta)),
  };
}

function svg(series) {
  const width = 1040, height = 560, pad = 58;
  const all = series.flatMap((s) => s.rows.map((r) => r.mean));
  const minY = Math.min(-0.001, ...all), maxY = Math.max(0.001, ...all);
  const xScale = (x) => pad + (Math.log(x) - Math.log(endpoints[0])) / (Math.log(N) - Math.log(endpoints[0])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const colors = ["#7dd3fc", "#fbbf24", "#f472b6", "#a7f3d0", "#c4b5fd", "#fb7185"];
  const paths = series.map((s, i) => {
    const d = s.rows.map((r, k) => `${k ? "L" : "M"} ${xScale(r.N).toFixed(2)} ${yScale(r.mean).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${i === 0 ? 3 : 1.4}" />`;
  }).join("\n");
  const labels = series.map((s, i) => `<text x="${pad}" y="${24 + i * 18}" fill="${colors[i % colors.length]}">${s.name}</text>`).join("\n");
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${zero}" y2="${zero}" stroke="#64748b" stroke-width="1" stroke-dasharray="5 5"/>
${paths}
<g font-family="Menlo, Consolas, monospace" font-size="12">${labels}</g>
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">mean((mu(label-1)^2-A_tail)*(gap/log(label)-1)) after removing 2^2,3^2,5^2,7^2 obstructions</text>
</svg>`;
}

function mdRows(s) {
  return s.rows.map((r) => `| ${r.N} | ${r.count} | ${r.largeSquareFail} | ${r.tailFailRate.toFixed(6)} | ${r.mean.toFixed(8)} | ${r.z.toFixed(3)} | ${r.gapMeanDiff.toFixed(6)} |`).join("\n");
}

function mdGroupLine(name, summary) {
  return `| ${name} | ${summary.meanRange[0].toFixed(8)} .. ${summary.meanRange[1].toFixed(8)} | ${summary.zRange[0].toFixed(3)} .. ${summary.zRange[1].toFixed(3)} | ${summary.tailFailRateRange[0].toFixed(6)} .. ${summary.tailFailRateRange[1].toFixed(6)} | ${summary.gapMeanDiffRange[0].toFixed(6)} .. ${summary.gapMeanDiffRange[1].toFixed(6)} | ${summary.thetaRange[0].toFixed(6)} .. ${summary.thetaRange[1].toFixed(6)} |`;
}

fs.mkdirSync(outDir, { recursive: true });
const mu = mobiusUpTo(N);
const isp = sieve(N);

const real = summarizeLabels("real-primes", primesUpTo(N), mu);
const cramer = seeds.map((seed) => summarizeLabels(`cramer-seed-${seed}`, cramerPrimes(N, seed), mu));
const wheel = seeds.map((seed) => summarizeLabels(`wheel-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, false), mu));
const composite = seeds.map((seed) => summarizeLabels(`composite-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, true), mu));
const summaries = {
  cramer: groupSummary(cramer),
  wheel: groupSummary(wheel),
  composite: groupSummary(composite),
};

const output = {
  candidate: "sqtailgapcov(x)=mean(((mu(p-1)^2)-A_tail)*(gap(p)/log(p)-1)) after removing small square obstructions",
  N,
  endpoints,
  seeds,
  artinProduct,
  smallSquareProduct,
  tailSquarefreeExpectation,
  real,
  cramer,
  wheel,
  composite,
  summaries,
};

const jsonPath = path.join(outDir, `sqtailgapcov-audit-${N}.json`);
const mdPath = path.join(outDir, `sqtailgapcov-audit-${N}.md`);
const svgPath = path.join(outDir, `sqtailgapcov-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, ...cramer.slice(0, 1), ...wheel.slice(0, 2), ...composite.slice(0, 1)]));

const md = `# sqtailgapcov audit

Candidate:
\`sqtailgapcov(x)=mean(((mu(p-1)^2)-A_tail)*(gap(p)/log(p)-1))\`, over labels
whose predecessor has no \`2^2,3^2,5^2,7^2\` divisor.

\`A_tail=${tailSquarefreeExpectation.toFixed(12)}\`, with Artin product
\`${artinProduct.toFixed(12)}\` and small-square product
\`${smallSquareProduct.toFixed(12)}\`.

## Real primes

| N | clean labels | large-square failures | fail rate | mean covariance | z | fail-pass gap mean diff |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdRows(real)}

Real cumulative-sum exponent versus clean-label count:
\`theta=${real.exponent.theta.toFixed(6)}\`.

## Control summary at N=${N}

| group | mean range | z range | fail-rate range | gap mean diff range | theta range |
| --- | ---: | ---: | ---: | ---: | ---: |
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
  tailSquarefreeExpectation,
  realLast: real.rows.at(-1),
  realTheta: real.exponent.theta,
  summaries,
}, null, 2));
