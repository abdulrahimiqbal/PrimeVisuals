#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));
const modulus = 210;

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

function omegaTable(limit) {
  const omega = new Uint8Array(limit + 1);
  for (let p = 2; p <= limit; p++) {
    if (omega[p] !== 0) continue;
    for (let j = p; j <= limit; j += p) omega[j]++;
  }
  return omega;
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

function residueMatchedCompositeLabels(seed, targetLabels, isp) {
  const random = rng(seed);
  const counts = new Int32Array(modulus);
  for (const label of targetLabels) {
    if (label > N) break;
    if (label < modulus) continue;
    counts[label % modulus]++;
  }
  const buckets = Array.from({ length: modulus }, () => []);
  for (let n = modulus + 1; n <= N; n++) {
    if (isp[n] || gcd(n, modulus) !== 1) continue;
    const r = n % modulus;
    if (counts[r] === 0) continue;
    buckets[r].push({ n, key: random() });
  }
  const out = [];
  for (let r = 0; r < modulus; r++) {
    if (!counts[r]) continue;
    buckets[r].sort((a, b) => a.key - b.key);
    for (const entry of buckets[r].slice(0, counts[r])) out.push(entry.n);
  }
  out.sort((a, b) => a - b);
  return out;
}

function pearsonFromPairs(pairs) {
  const n = pairs.length;
  if (n < 4) return { n, r: 0, z: 0 };
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of pairs) {
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
  }
  const mx = sx / n, my = sy / n;
  const vx = sxx - n * mx * mx;
  const vy = syy - n * my * my;
  const cov = sxy - n * mx * my;
  if (vx <= 0 || vy <= 0) return { n, r: 0, z: 0 };
  const r = cov / Math.sqrt(vx * vy);
  return { n, r, z: r * Math.sqrt(n) };
}

function summarizeAtEndpoint(labels, omega, endpoint) {
  const events = [];
  for (let i = 0; i + 1 < labels.length; i++) {
    const p = labels[i];
    if (p > endpoint) break;
    if (p < modulus || p - 1 >= omega.length) continue;
    const g = labels[i + 1] - p;
    events.push({
      residue: p % modulus,
      omega: omega[p - 1],
      gapZ: g / Math.log(p) - 1,
    });
  }
  const sums = new Float64Array(modulus);
  const counts = new Int32Array(modulus);
  for (const event of events) {
    sums[event.residue] += event.omega;
    counts[event.residue]++;
  }
  const pairs = [];
  let covariance = 0;
  for (const event of events) {
    const centeredOmega = event.omega - sums[event.residue] / counts[event.residue];
    covariance += centeredOmega * event.gapZ;
    pairs.push([centeredOmega, event.gapZ]);
  }
  const corr = pearsonFromPairs(pairs);
  return {
    N: endpoint,
    count: events.length,
    covarianceMean: events.length ? covariance / events.length : 0,
    r: corr.r,
    z: corr.z,
  };
}

function summarizeLabels(name, labels, omega) {
  const rows = endpoints.map((endpoint) => summarizeAtEndpoint(labels, omega, endpoint));
  return { name, rows };
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function groupSummary(series) {
  const last = series.map((s) => s.rows.at(-1));
  const previous = series.flatMap((s) => s.rows.map((r) => r.covarianceMean));
  return {
    covarianceRange: range(last.map((r) => r.covarianceMean)),
    zRange: range(last.map((r) => r.z)),
    rRange: range(last.map((r) => r.r)),
    pathRange: range(previous),
  };
}

function svg(series) {
  const width = 1040, height = 560, pad = 58;
  const all = series.flatMap((s) => s.rows.map((r) => r.covarianceMean));
  const minY = Math.min(-0.005, ...all), maxY = Math.max(0.005, ...all);
  const xScale = (x) => pad + (Math.log(x) - Math.log(endpoints[0])) / (Math.log(N) - Math.log(endpoints[0])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const colors = ["#7dd3fc", "#fbbf24", "#f472b6", "#a7f3d0", "#c4b5fd", "#fb7185"];
  const paths = series.map((s, i) => {
    const d = s.rows.map((r, k) => `${k ? "L" : "M"} ${xScale(r.N).toFixed(2)} ${yScale(r.covarianceMean).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${i === 0 ? 3 : 1.4}" />`;
  }).join("\n");
  const labels = series.map((s, i) => `<text x="${pad}" y="${24 + i * 18}" fill="${colors[i % colors.length]}">${s.name}</text>`).join("\n");
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${zero}" y2="${zero}" stroke="#64748b" stroke-width="1" stroke-dasharray="5 5"/>
${paths}
<g font-family="Menlo, Consolas, monospace" font-size="12">${labels}</g>
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">mean((omega(label-1)-mean by label mod 210)*(gap/log(label)-1))</text>
</svg>`;
}

function mdRows(s) {
  return s.rows.map((r) => `| ${r.N} | ${r.count} | ${r.covarianceMean.toFixed(8)} | ${r.r.toFixed(8)} | ${r.z.toFixed(3)} |`).join("\n");
}

function mdGroupLine(name, summary) {
  return `| ${name} | ${summary.covarianceRange[0].toFixed(8)} .. ${summary.covarianceRange[1].toFixed(8)} | ${summary.rRange[0].toFixed(8)} .. ${summary.rRange[1].toFixed(8)} | ${summary.zRange[0].toFixed(3)} .. ${summary.zRange[1].toFixed(3)} | ${summary.pathRange[0].toFixed(8)} .. ${summary.pathRange[1].toFixed(8)} |`;
}

fs.mkdirSync(outDir, { recursive: true });
const isp = sieve(N);
const omega = omegaTable(N);
const realLabels = primesUpTo(N);
const real = summarizeLabels("real-primes", realLabels, omega);
const cramer = seeds.map((seed) => summarizeLabels(`cramer-seed-${seed}`, cramerPrimes(N, seed), omega));
const wheel = seeds.map((seed) => summarizeLabels(`wheel-W210-seed-${seed}`, wheelRandomLabels(210, seed, isp, false), omega));
const composite = seeds.map((seed) => summarizeLabels(`residue-matched-composite-${seed}`, residueMatchedCompositeLabels(seed, realLabels, isp), omega));
const summaries = {
  cramer: groupSummary(cramer),
  wheel: groupSummary(wheel),
  composite: groupSummary(composite),
};

const output = {
  candidate: "residue-centered omega(p-1) by normalized next-gap covariance",
  N,
  endpoints,
  seeds,
  modulus,
  real,
  cramer,
  wheel,
  composite,
  summaries,
};

const jsonPath = path.join(outDir, `oprevgapcov-audit-${N}.json`);
const mdPath = path.join(outDir, `oprevgapcov-audit-${N}.md`);
const svgPath = path.join(outDir, `oprevgapcov-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg([real, cramer[0], wheel[0], wheel[1], composite[0]]));

const md = `# oprevgapcov audit

Candidate:
\`mean((omega(label-1)-E[omega(label-1)|label mod 210])*(gap/log(label)-1))\`.

The app primitive uses \`log(log(p))\` centering for a quick view; this audit
uses endpoint-local residue-class centering modulo \`${modulus}\`.

## Real primes

| N | events | covariance mean | Pearson r | z=r*sqrt(events) |
| ---: | ---: | ---: | ---: | ---: |
${mdRows(real)}

## Control summary at N=${N}

| group | covariance range | r range | z range | full path covariance range |
| --- | ---: | ---: | ---: | ---: |
${mdGroupLine("ordinary Cramer", summaries.cramer)}
${mdGroupLine("W=210 fake labels", summaries.wheel)}
${mdGroupLine("residue-count-matched composite", summaries.composite)}

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
  summaries,
}, null, 2));
