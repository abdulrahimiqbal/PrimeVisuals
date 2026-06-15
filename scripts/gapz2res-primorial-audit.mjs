#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const wheels = [9_699_690, 223_092_870, 6_469_693_230];
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

function wheelRandomLabels(W, seed) {
  const scale = W / phiSmall(W);
  const random = rng(seed);
  const labels = [];
  for (let n = 5; n <= N; n++) {
    if (gcd(n, W) !== 1) continue;
    if (random() < Math.min(1, scale / Math.log(n))) labels.push(n);
  }
  return labels;
}

function summarizeLabels(name, labels) {
  const rows = [];
  let count = 0, mean = 0, m2 = 0, j = 0;
  for (const x of endpoints) {
    while (j + 1 < labels.length && labels[j + 1] <= x) {
      const p = labels[j];
      const gap = labels[j + 1] - p;
      const z = gap / Math.log(p) - 1;
      const z2 = z * z;
      count++;
      const delta = z2 - mean;
      mean += delta / count;
      m2 += delta * (z2 - mean);
      j++;
    }
    const variance = count > 1 ? m2 / (count - 1) : 0;
    const se = count > 1 ? Math.sqrt(variance / count) : 0;
    rows.push({ N: x, labels: Math.min(labels.length, j + 1), gaps: count, mean, se });
  }
  return { name, rows };
}

function avgRows(series) {
  return endpoints.map((x, i) => {
    const means = series.map((s) => s.rows[i].mean);
    const avg = means.reduce((a, b) => a + b, 0) / means.length;
    const min = Math.min(...means);
    const max = Math.max(...means);
    return { N: x, mean: avg, min, max };
  });
}

function residualRows(realRows, baselineRows) {
  return realRows.map((r, i) => ({
    N: r.N,
    realMean: r.mean,
    baselineMean: baselineRows[i].mean,
    residual: r.mean - baselineRows[i].mean,
    seedRange: [baselineRows[i].min, baselineRows[i].max],
  }));
}

function svg(real, audits) {
  const width = 980, height = 520, pad = 56;
  const all = audits.flatMap((a) => a.residuals.map((r) => r.residual));
  const minY = Math.min(...all), maxY = Math.max(...all);
  const ySpan = maxY - minY || 1;
  const xScale = (x) => pad + (Math.log(x) - Math.log(endpoints[0])) / (Math.log(N) - Math.log(endpoints[0])) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ySpan * (height - 2 * pad);
  const colors = ["#7dd3fc", "#fbbf24", "#f472b6", "#a7f3d0"];
  const paths = audits.map((a, i) => {
    const d = a.residuals.map((r, k) => `${k ? "L" : "M"} ${xScale(r.N).toFixed(2)} ${yScale(r.residual).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="2" />`;
  }).join("\n");
  const labels = audits.map((a, i) => `<text x="${pad}" y="${22 + i * 18}" fill="${colors[i % colors.length]}">real - W=${a.W} baseline</text>`).join("\n");
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${zero}" y2="${zero}" stroke="#64748b" stroke-width="1"/>
${paths}
<g font-family="Menlo, Consolas, monospace" font-size="12">${labels}</g>
<text x="${pad}" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="12">gapz2mean real residual after high-primorial fake-label baselines, N=${N}</text>
</svg>`;
}

function mdRows(audit) {
  return audit.residuals.map((r) => `| ${r.N} | ${r.realMean.toFixed(8)} | ${r.baselineMean.toFixed(8)} | ${r.residual.toFixed(8)} | ${r.seedRange[0].toFixed(8)}..${r.seedRange[1].toFixed(8)} |`).join("\n");
}

function mdSummary(audit) {
  const last = audit.residuals.at(-1);
  return `| ${audit.W} | ${(audit.W / audit.phi).toFixed(6)} | ${last.baselineMean.toFixed(8)} | ${last.residual.toFixed(8)} | ${last.seedRange[0].toFixed(8)}..${last.seedRange[1].toFixed(8)} |`;
}

fs.mkdirSync(outDir, { recursive: true });
const real = summarizeLabels("real-primes", primesUpTo(N));
const audits = wheels.map((W) => {
  const phi = phiSmall(W);
  const series = seeds.map((seed) => summarizeLabels(`wheel-W${W}-seed-${seed}`, wheelRandomLabels(W, seed)));
  const baseline = avgRows(series);
  return { W, phi, series, baseline, residuals: residualRows(real.rows, baseline) };
});

const output = {
  candidate: "G2res_W(x)=gapz2mean(x)-five-seed high-primorial fake-label baseline",
  preregisteredConfirm: "real residual stable and materially separated from independent high-primorial controls; larger primorials do not erase it",
  preregisteredBreak: "residual shrinks or moves monotonically as W grows, or high-primorial controls show comparable residuals",
  N,
  endpoints,
  seeds,
  real,
  audits,
};

const jsonPath = path.join(outDir, `gapz2res-primorial-audit-${N}.json`);
const svgPath = path.join(outDir, `gapz2res-primorial-audit-${N}.svg`);
const mdPath = path.join(outDir, `gapz2res-primorial-audit-${N}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(real, audits));

const md = `# gapz2 high-primorial residual audit

Candidate: \`G2res_W(x)=gapz2mean(x)-B_W(x)\`, where \`B_W\` is the five-seed
fake-label baseline restricted to \`gcd(n,W)=1\`.

Preregistered confirmation: real residual stable and materially separated from
independent high-primorial controls; larger primorials do not erase it.

Preregistered break: residual shrinks or moves monotonically as \`W\` grows, or
high-primorial controls show comparable residuals.

## Last endpoint summary

| W | W/phi(W) | baseline mean at N=${N} | real-baseline residual | seed baseline range |
| ---: | ---: | ---: | ---: | ---: |
${audits.map(mdSummary).join("\n")}

## Residual paths

${audits.map((a) => `### W=${a.W}\n\n| N | real mean | baseline mean | residual | seed baseline range |\n| ---: | ---: | ---: | ---: | ---: |\n${mdRows(a)}`).join("\n\n")}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  lastEndpoint: audits.map((a) => {
    const last = a.residuals.at(-1);
    return { W: a.W, baselineMean: last.baselineMean, residual: last.residual, seedRange: last.seedRange };
  }),
}, null, 2));
