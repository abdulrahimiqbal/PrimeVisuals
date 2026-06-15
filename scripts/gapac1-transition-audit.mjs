#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16000000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const moduli = (process.argv[4] || "11,210").split(",").map((x) => Number(x.trim())).filter(Boolean);
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

function upperBound(arr, x) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function transitionResidualAt(labels, q, x) {
  const m = upperBound(labels, x);
  if (m < 3) return { N: x, labels: m, pairs: 0, raw: 0, baseline: 0, residual: 0, se: 0, residualZ: 0 };

  const size = q * q;
  const sums = new Float64Array(size);
  const counts = new Int32Array(size);
  const z = new Float64Array(m - 1);
  const cls = new Int32Array(m - 1);

  for (let i = 0; i + 1 < m; i++) {
    const p0 = labels[i];
    const p1 = labels[i + 1];
    const g = p1 - p0;
    const zi = g / Math.log(p0) - 1;
    const c = (p0 % q) * q + (p1 % q);
    z[i] = zi;
    cls[i] = c;
    sums[c] += zi;
    counts[c]++;
  }

  const means = new Float64Array(size);
  for (let i = 0; i < size; i++) if (counts[i]) means[i] = sums[i] / counts[i];

  let raw = 0, baseline = 0, m2 = 0;
  const pairs = m - 2;
  for (let i = 0; i < pairs; i++) {
    const product = z[i] * z[i + 1];
    raw += product;
    baseline += means[cls[i]] * means[cls[i + 1]];
  }
  raw /= pairs;
  baseline /= pairs;
  const residual = raw - baseline;
  for (let i = 0; i < pairs; i++) {
    const productResidual = z[i] * z[i + 1] - means[cls[i]] * means[cls[i + 1]];
    const d = productResidual - residual;
    m2 += d * d;
  }
  const variance = pairs > 1 ? m2 / (pairs - 1) : 0;
  const se = pairs > 1 ? Math.sqrt(variance / pairs) : 0;
  return { N: x, labels: m, pairs, raw, baseline, residual, variance, se, residualZ: se ? residual / se : 0 };
}

function summarizeLabels(name, labels, q) {
  return { name, q, rows: endpoints.map((x) => transitionResidualAt(labels, q, x)) };
}

function svg(series, q) {
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
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">gapac1mean minus transition-class baseline mod ${q}, x-axis log-scaled, N=${N}</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const isp = sieve(N);
const labels = {
  real: primesUpTo(N),
  cramer: seeds.map((seed) => cramerPrimes(N, seed)),
  wheel: seeds.map((seed) => wheelRandomLabels(210, seed, isp, false)),
  composite: seeds.map((seed) => wheelRandomLabels(210, seed, isp, true)),
};

const results = {};
for (const q of moduli) {
  const real = summarizeLabels("real-primes", labels.real, q);
  const cramer = labels.cramer.map((xs, i) => summarizeLabels(`cramer-seed-${seeds[i]}`, xs, q));
  const wheel = labels.wheel.map((xs, i) => summarizeLabels(`wheel-W210-seed-${seeds[i]}`, xs, q));
  const composite = labels.composite.map((xs, i) => summarizeLabels(`composite-W210-seed-${seeds[i]}`, xs, q));
  results[q] = { real, cramer, wheel, composite };
  fs.writeFileSync(path.join(outDir, `gapac1-transition-q${q}-${N}.svg`), svg([real, ...cramer.slice(0, 2), ...wheel.slice(0, 2), composite[0]], q));
}

const output = {
  candidate: "gapac1mean minus transition-class baseline",
  baseline: "For each endpoint and modulus q, replace every normalized gap by the mean normalized gap for its transition class (label_i mod q, label_{i+1} mod q), then average adjacent products over the actual transition-class sequence.",
  preregisteredConfirm: "q=11 or q=210 transition baseline erases the Cycle 6 residual",
  preregisteredSurvivor: "stable nonzero residual after q=210 with controls",
  N,
  endpoints,
  moduli,
  results,
};

const jsonPath = path.join(outDir, `gapac1-transition-audit-${N}.json`);
const mdPath = path.join(outDir, `gapac1-transition-audit-${N}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));

function line(s) {
  const r = s.rows.at(-1);
  return `| ${s.name} | ${r.raw.toFixed(8)} | ${r.baseline.toFixed(8)} | ${r.residual.toFixed(8)} | ${r.residualZ.toFixed(3)} |`;
}

let md = `# gapac1 transition audit

Candidate: \`gapac1mean\` minus transition-class baseline.

Baseline: for each endpoint and modulus \`q\`, replace every normalized gap by
the mean normalized gap for its transition class
\`(label_i mod q, label_{i+1} mod q)\`, then average adjacent products over the
actual transition-class sequence.

Preregistered break: \`q=11\` or \`q=210\` transition baseline erases the Cycle
6 residual. Survivor condition: stable nonzero residual after \`q=210\` with
controls.
`;

for (const q of moduli) {
  const group = results[q];
  md += `
## q=${q}

Real residual by endpoint:

| N | raw | transition baseline | residual | residual/se |
| ---: | ---: | ---: | ---: | ---: |
${group.real.rows.map((r) => `| ${r.N} | ${r.raw.toFixed(8)} | ${r.baseline.toFixed(8)} | ${r.residual.toFixed(8)} | ${r.residualZ.toFixed(3)} |`).join("\n")}

Summary at N=${N}:

| series | raw | transition baseline | residual | residual/se |
| --- | ---: | ---: | ---: | ---: |
${[group.real, ...group.cramer, ...group.wheel, ...group.composite].map(line).join("\n")}

SVG: \`logs/playground-artifacts/gapac1-transition-q${q}-${N}.svg\`
`;
}

md += `
JSON: \`${jsonPath}\`
`;

fs.writeFileSync(mdPath, md);
console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  moduli: Object.fromEntries(moduli.map((q) => [q, results[q].real.rows.at(-1)])),
}, null, 2));
