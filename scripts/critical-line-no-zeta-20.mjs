#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  boundedCfDenominatorTable,
  cramerPrimes,
  dyadicExpTransform,
  mobiusUpTo,
  primesUpTo,
  sieve,
} from "../src/core/math.js";

const DEFAULT_N = 1_000_000;
const N = Math.max(20_000, Math.round(Number(process.argv[2] || DEFAULT_N)));
const outDir = process.argv[3] || "logs/critical-line-no-zeta-20-artifacts";
const cfN = Math.max(5_000, Math.min(12_000, Math.round(Number(process.argv[4] || Math.min(N, 12_000)))));
const primeNForMatrix = Math.min(N, 300_000);
const endpoints = [N / 16, N / 8, N / 4, N / 2, N]
  .map((x) => Math.max(1_000, Math.round(x)))
  .filter((x, i, a) => x <= N && a.indexOf(x) === i);

const COLORS = [
  "#38bdf8",
  "#f59e0b",
  "#a78bfa",
  "#34d399",
  "#fb7185",
  "#facc15",
  "#60a5fa",
  "#f472b6",
];
const C_SQFREE = 6 / (Math.PI * Math.PI);
const C_TOTIENT = 3 / (Math.PI * Math.PI);
const C_REPEAT = 0.773156669049; // sum_p 1/(p*(p-1))
const EULER_GAMMA = 0.5772156649015329;

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
}

function fmt(x, d = 4) {
  if (!Number.isFinite(x)) return "n/a";
  const ax = Math.abs(x);
  if (ax >= 100_000) return x.toExponential(3);
  if (ax >= 1_000) return x.toFixed(1);
  if (ax >= 10) return x.toFixed(3);
  if (ax >= 1) return x.toFixed(d);
  if (ax >= 1e-3) return x.toFixed(Math.max(d, 6));
  return x.toExponential(3);
}

function linearFit(points) {
  const clean = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const n = clean.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 1 };
  let sx = 0, sy = 0;
  for (const p of clean) {
    sx += p.x;
    sy += p.y;
  }
  const mx = sx / n;
  const my = sy / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of clean) {
    const dx = p.x - mx;
    const dy = p.y - my;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const slope = sxy / (sxx || 1);
  const intercept = my - slope * mx;
  let rss = 0;
  for (const p of clean) {
    const e = p.y - (slope * p.x + intercept);
    rss += e * e;
  }
  return { slope, intercept, r2: syy ? 1 - rss / syy : 1 };
}

function powerFit(rows) {
  const points = rows
    .filter((r) => r.N > 1 && r.maxAbs > 0)
    .map((r) => ({ x: Math.log(r.N), y: Math.log(r.maxAbs) }));
  const fit = linearFit(points);
  return { theta: fit.slope, C: Math.exp(fit.intercept), r2: fit.r2 };
}

function sampleByIndex(max, count = 700) {
  const out = [];
  const step = Math.max(1, Math.floor(max / count));
  for (let n = 1; n <= max; n += step) out.push(n);
  if (out[out.length - 1] !== max) out.push(max);
  return out;
}

function recordMaxRows(valueAt) {
  const rows = [];
  let j = 0;
  let maxAbs = 0;
  for (let n = 1; n <= N; n++) {
    const v = valueAt(n);
    if (Number.isFinite(v)) maxAbs = Math.max(maxAbs, Math.abs(v));
    while (j < endpoints.length && n === endpoints[j]) {
      rows.push({ N: endpoints[j], maxAbs, endpoint: v });
      j++;
    }
  }
  return rows;
}

function zetaReal(s) {
  const M = 250_000;
  let sum = 0;
  for (let n = 1; n <= M; n++) sum += 1 / n ** s;
  return sum + (M ** (1 - s)) / (s - 1) + 0.5 / (M ** s);
}

function makeArithmeticTables(maxN) {
  const isp = sieve(maxN);
  const primes = primesUpTo(maxN);
  const mu = mobiusUpTo(maxN);
  const omega = new Int16Array(maxN + 1);
  const bigomega = new Int16Array(maxN + 1);
  const tau = new Int32Array(maxN + 1);
  const phi = new Int32Array(maxN + 1);
  for (let i = 0; i <= maxN; i++) phi[i] = i;
  for (let d = 1; d <= maxN; d++) for (let j = d; j <= maxN; j += d) tau[j]++;
  for (const p of primes) {
    for (let j = p; j <= maxN; j += p) {
      omega[j]++;
      phi[j] -= Math.floor(phi[j] / p);
      let q = j;
      while (q % p === 0) {
        bigomega[j]++;
        q = Math.floor(q / p);
      }
    }
  }

  const Q = new Int32Array(maxN + 1);
  const M = new Int32Array(maxN + 1);
  const lambda = new Int8Array(maxN + 1);
  const L = new Int32Array(maxN + 1);
  const mWeighted = new Float64Array(maxN + 1);
  const tauSum = new Float64Array(maxN + 1);
  const phiSum = new Float64Array(maxN + 1);
  const repeatSum = new Int32Array(maxN + 1);
  const lambdaAP = Array.from({ length: 4 }, () => new Int32Array(maxN + 1));

  lambda[1] = 1;
  for (let n = 1; n <= maxN; n++) {
    if (n > 1) lambda[n] = bigomega[n] % 2 ? -1 : 1;
    Q[n] = Q[n - 1] + (mu[n] === 0 ? 0 : 1);
    M[n] = M[n - 1] + mu[n];
    L[n] = L[n - 1] + lambda[n];
    mWeighted[n] = mWeighted[n - 1] + mu[n] / n;
    tauSum[n] = tauSum[n - 1] + tau[n];
    phiSum[n] = phiSum[n - 1] + phi[n];
    repeatSum[n] = repeatSum[n - 1] + (bigomega[n] - omega[n]);
    for (let r = 0; r < 4; r++) lambdaAP[r][n] = lambdaAP[r][n - 1];
    lambdaAP[n % 4][n] += lambda[n];
  }

  const r2 = new Int32Array(maxN + 1);
  for (let d = 1; d <= maxN; d += 2) {
    const r = d % 4;
    const chi = r === 1 ? 1 : r === 3 ? -1 : 0;
    if (!chi) continue;
    for (let j = d; j <= maxN; j += d) r2[j] += 4 * chi;
  }
  const circle = new Int32Array(maxN + 1);
  circle[0] = 1;
  for (let n = 1; n <= maxN; n++) circle[n] = circle[n - 1] + r2[n];

  const muSeq = Float64Array.from({ length: maxN }, (_, i) => mu[i + 1]);
  const g2 = dyadicExpTransform(muSeq);
  const G2 = new Float64Array(maxN + 1);
  for (let n = 1; n <= maxN; n++) G2[n] = G2[n - 1] + g2[n - 1];
  const MSeq = Float64Array.from({ length: maxN }, (_, i) => M[i + 1]);
  const E2M = dyadicExpTransform(MSeq);

  const kfree = {};
  for (const k of [2, 3, 4, 5]) {
    const blocked = new Uint8Array(maxN + 1);
    for (const p of primes) {
      const pk = p ** k;
      if (pk > maxN) break;
      for (let j = pk; j <= maxN; j += pk) blocked[j] = 1;
    }
    const count = new Int32Array(maxN + 1);
    for (let n = 1; n <= maxN; n++) count[n] = count[n - 1] + (blocked[n] ? 0 : 1);
    kfree[k] = count;
  }

  return {
    isp,
    primes,
    mu,
    omega,
    bigomega,
    tau,
    phi,
    Q,
    M,
    lambda,
    L,
    mWeighted,
    tauSum,
    phiSum,
    repeatSum,
    lambdaAP,
    circle,
    G2,
    E2M,
    kfree,
  };
}

function plotSvg({ title, subtitle = "", series, path: filePath, logX = false, yLabel = "", xLabel = "n", hlines = [] }) {
  const width = 920;
  const height = 420;
  const pad = { left: 66, right: 26, top: 54, bottom: 52 };
  const all = [];
  for (const s of series) for (const p of s.points) if (Number.isFinite(p.x) && Number.isFinite(p.y)) all.push(p);
  for (const y of hlines) all.push({ x: all[0]?.x || 1, y }, { x: all[all.length - 1]?.x || 2, y });
  const tx = (x) => (logX ? Math.log(Math.max(1, x)) : x);
  const minX = Math.min(...all.map((p) => tx(p.x)));
  const maxX = Math.max(...all.map((p) => tx(p.x)));
  let minY = Math.min(...all.map((p) => p.y));
  let maxY = Math.max(...all.map((p) => p.y));
  if (!Number.isFinite(minY) || !Number.isFinite(maxY) || minY === maxY) {
    minY = -1;
    maxY = 1;
  }
  const spanY = maxY - minY;
  minY -= spanY * 0.08;
  maxY += spanY * 0.08;
  const sx = (x) => pad.left + ((tx(x) - minX) / ((maxX - minX) || 1)) * (width - pad.left - pad.right);
  const sy = (y) => height - pad.bottom - ((y - minY) / ((maxY - minY) || 1)) * (height - pad.top - pad.bottom);
  const grid = [];
  for (let i = 0; i <= 4; i++) {
    const y = minY + (i / 4) * (maxY - minY);
    grid.push(`<line x1="${pad.left}" x2="${width - pad.right}" y1="${sy(y).toFixed(2)}" y2="${sy(y).toFixed(2)}" stroke="#1e293b" stroke-width="1"/>`);
    grid.push(`<text x="${pad.left - 8}" y="${(sy(y) + 4).toFixed(2)}" text-anchor="end" fill="#94a3b8">${fmt(y, 3)}</text>`);
  }
  const lines = series.map((s, i) => {
    const d = s.points
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
      .map((p, k) => `${k ? "L" : "M"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`)
      .join(" ");
    return `<path d="${d}" fill="none" stroke="${s.color || COLORS[i % COLORS.length]}" stroke-width="${s.width || 2}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }).join("\n");
  const h = hlines.map((y) => `<line x1="${pad.left}" x2="${width - pad.right}" y1="${sy(y).toFixed(2)}" y2="${sy(y).toFixed(2)}" stroke="#64748b" stroke-width="1" stroke-dasharray="5 5"/>`).join("\n");
  const legend = series.map((s, i) => {
    const y = 30 + i * 17;
    const c = s.color || COLORS[i % COLORS.length];
    return `<g><line x1="${width - 242}" x2="${width - 222}" y1="${y}" y2="${y}" stroke="${c}" stroke-width="3"/><text x="${width - 214}" y="${y + 4}" fill="#cbd5e1">${esc(s.name)}</text></g>`;
  }).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace" font-size="11">${grid}</g>
<line x1="${pad.left}" x2="${width - pad.right}" y1="${height - pad.bottom}" y2="${height - pad.bottom}" stroke="#334155"/>
<line x1="${pad.left}" x2="${pad.left}" y1="${pad.top}" y2="${height - pad.bottom}" stroke="#334155"/>
${h}
${lines}
<g font-family="Menlo, Consolas, monospace" font-size="12">${legend}</g>
<text x="${pad.left}" y="24" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="18" font-weight="700">${esc(title)}</text>
<text x="${pad.left}" y="43" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="11">${esc(subtitle)}</text>
<text x="${width / 2}" y="${height - 14}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="11" text-anchor="middle">${esc(xLabel)}${logX ? " (log scale)" : ""}</text>
<text x="18" y="${height / 2}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="11" text-anchor="middle" transform="rotate(-90 18 ${height / 2})">${esc(yLabel)}</text>
</svg>
`;
  fs.writeFileSync(filePath, svg);
}

function heatSvg({ title, subtitle = "", width = 920, height = 420, cells, filePath, footer = "" }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="36" y="28" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="18" font-weight="700">${esc(title)}</text>
<text x="36" y="48" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="11">${esc(subtitle)}</text>
${cells}
<text x="36" y="${height - 18}" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="11">${esc(footer)}</text>
</svg>
`;
  fs.writeFileSync(filePath, svg);
}

function histogramSvg({ title, subtitle = "", bins, normal, filePath }) {
  const width = 920;
  const height = 420;
  const pad = { left: 62, right: 30, top: 58, bottom: 50 };
  const maxY = Math.max(...bins.map((b) => b.y), ...normal.map((p) => p.y)) * 1.15;
  const minX = bins[0].x0;
  const maxX = bins[bins.length - 1].x1;
  const sx = (x) => pad.left + ((x - minX) / (maxX - minX)) * (width - pad.left - pad.right);
  const sy = (y) => height - pad.bottom - (y / maxY) * (height - pad.top - pad.bottom);
  const bars = bins.map((b) => `<rect x="${sx(b.x0).toFixed(2)}" y="${sy(b.y).toFixed(2)}" width="${Math.max(1, sx(b.x1) - sx(b.x0) - 1).toFixed(2)}" height="${(height - pad.bottom - sy(b.y)).toFixed(2)}" fill="#38bdf8" opacity="0.75"/>`).join("\n");
  const curve = normal.map((p, i) => `${i ? "L" : "M"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<line x1="${pad.left}" x2="${width - pad.right}" y1="${height - pad.bottom}" y2="${height - pad.bottom}" stroke="#334155"/>
<line x1="${pad.left}" x2="${pad.left}" y1="${pad.top}" y2="${height - pad.bottom}" stroke="#334155"/>
${bars}
<path d="${curve}" fill="none" stroke="#f59e0b" stroke-width="3"/>
<text x="${pad.left}" y="26" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="18" font-weight="700">${esc(title)}</text>
<text x="${pad.left}" y="45" fill="#94a3b8" font-family="Menlo, Consolas, monospace" font-size="11">${esc(subtitle)}</text>
<text x="${width - 250}" y="34" fill="#38bdf8" font-family="Menlo, Consolas, monospace" font-size="12">observed histogram</text>
<text x="${width - 250}" y="52" fill="#f59e0b" font-family="Menlo, Consolas, monospace" font-size="12">standard normal density</text>
</svg>`;
  fs.writeFileSync(filePath, svg);
}

function makeCandidate(id, name, file, verdict, note, metrics = {}) {
  return { id, name, file: path.relative(outDir, file), verdict, note, metrics };
}

function graphPoints(ns, fn) {
  return ns.map((n) => ({ x: n, y: fn(n) }));
}

function gapData(primes) {
  const out = [];
  for (let i = 0; i + 1 < primes.length; i++) {
    const p = primes[i];
    out.push({ p, gap: primes[i + 1] - p, u: (primes[i + 1] - p) / Math.log(p) });
  }
  return out;
}

function buildDashboard(candidates, summary) {
  const cards = candidates.map((c) => {
    const metrics = Object.entries(c.metrics || {})
      .slice(0, 5)
      .map(([k, v]) => `<span><b>${esc(k)}</b> ${esc(typeof v === "number" ? fmt(v) : v)}</span>`)
      .join("");
    return `<section class="card">
  <h2>${String(c.id).padStart(2, "0")}. ${esc(c.name)}</h2>
  <img src="${esc(c.file)}" alt="${esc(c.name)}"/>
  <p class="verdict">${esc(c.verdict)}</p>
  <p>${esc(c.note)}</p>
  <div class="metrics">${metrics}</div>
</section>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Critical line without zeta - 20 visualizations</title>
<style>
body{margin:0;background:#030712;color:#e5e7eb;font:14px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
header{padding:28px 34px 12px;max-width:1180px;margin:auto}
h1{margin:0 0 8px;font-size:28px}
.lead{color:#a8b3c7;max-width:960px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:18px;max-width:1480px;margin:0 auto;padding:18px 28px 38px}
.card{background:#0b1220;border:1px solid #1e293b;border-radius:8px;padding:14px}
.card h2{font-size:16px;margin:0 0 10px}
.card img{display:block;width:100%;height:auto;border:1px solid #1f2937;background:#07111f}
.verdict{color:#facc15;font-family:Menlo,Consolas,monospace;font-size:12px;margin:10px 0 4px}
.card p{color:#cbd5e1;margin:7px 0}
.metrics{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.metrics span{font:12px Menlo,Consolas,monospace;background:#111827;border:1px solid #263244;border-radius:6px;padding:4px 6px;color:#cbd5e1}
</style>
</head>
<body>
<header>
<h1>Critical-line no-zeta batch: 20 candidate visualizations</h1>
<p class="lead">${esc(summary)}</p>
</header>
<main class="grid">
${cards}
</main>
</body>
</html>`;
}

mkdirp(outDir);

console.error(`building arithmetic tables to N=${N}`);
const tab = makeArithmeticTables(N);
const ns = sampleByIndex(N, 700).filter((n) => n >= 10);
const candidates = [];

{
  const file = path.join(outDir, "01-squarefree-residual.svg");
  const residual = (n) => (tab.Q[n] - C_SQFREE * n) / n ** 0.25;
  const rows = recordMaxRows((n) => tab.Q[n] - C_SQFREE * n);
  const exp = powerFit(rows);
  plotSvg({
    title: "01 Squarefree count residual",
    subtitle: "R(x)=(Q(x)-6/pi^2*x)/x^0.25",
    series: [{ name: "normalized residual", points: graphPoints(ns, residual) }],
    path: file,
    logX: true,
    yLabel: "R(x)",
  });
  candidates.push(makeCandidate(1, "Squarefree count Q(x)", file, "KNOWN-MATH / classical squarefree error", "The level line is real, but the 1/4 exponent question is a named classical squarefree-error problem, not an undiscovered object.", { theta: exp.theta, density: tab.Q[N] / N }));
}

{
  const file = path.join(outDir, "02-liouville-walk.svg");
  const rows = recordMaxRows((n) => tab.L[n]);
  const exp = powerFit(rows);
  plotSvg({
    title: "02 Liouville summatory walk",
    subtitle: "L(x)=sum lambda(n), plotted as L(x)/sqrt(x)",
    series: [{ name: "L/sqrt(x)", points: graphPoints(ns, (n) => tab.L[n] / Math.sqrt(n)) }],
    path: file,
    logX: true,
    yLabel: "L/sqrt(x)",
    hlines: [0],
  });
  candidates.push(makeCandidate(2, "Liouville L(x)", file, "KNOWN-MATH / Pólya and RH-adjacent", "Distinct from Mertens in the app, but the object and its failure modes are classical; no new discovery claim survives.", { theta: exp.theta, endpoint: tab.L[N] }));
}

{
  const file = path.join(outDir, "03-dirichlet-divisor.svg");
  const delta = (n) => tab.tauSum[n] - n * Math.log(n) - (2 * EULER_GAMMA - 1) * n;
  const rows = recordMaxRows(delta);
  const exp = powerFit(rows);
  plotSvg({
    title: "03 Dirichlet divisor residual",
    subtitle: "Delta(x)=sum tau(n)-x log x-(2 gamma-1)x, scaled by x^0.25",
    series: [{ name: "Delta/x^0.25", points: graphPoints(ns, (n) => delta(n) / n ** 0.25) }],
    path: file,
    logX: true,
    yLabel: "Delta/x^0.25",
    hlines: [0],
  });
  candidates.push(makeCandidate(3, "Dirichlet divisor Delta(x)", file, "OPEN CLASSICAL PROBLEM", "This is one of the best visual 1/4 siblings, but it is exactly the Dirichlet divisor problem; the plot is not undiscovered mathematics.", { theta: exp.theta, maxAbs: rows.at(-1).maxAbs }));
}

{
  const file = path.join(outDir, "04-gauss-circle.svg");
  const err = (n) => tab.circle[n] - Math.PI * n;
  const rows = recordMaxRows(err);
  const exp = powerFit(rows);
  plotSvg({
    title: "04 Gauss circle residual",
    subtitle: "E(x)=#{a^2+b^2<=x}-pi*x, scaled by x^0.25",
    series: [{ name: "E/x^0.25", points: graphPoints(ns, (n) => err(n) / n ** 0.25) }],
    path: file,
    logX: true,
    yLabel: "E/x^0.25",
    hlines: [0],
  });
  candidates.push(makeCandidate(4, "Gauss circle E(x)", file, "OPEN CLASSICAL PROBLEM", "A genuine non-zeta-looking 1/4 front, but the circle problem is a famous old problem, not a newly uncovered line.", { theta: exp.theta, endpoint: err(N) }));
}

{
  const file = path.join(outDir, "05-totient-sum.svg");
  const err = (n) => tab.phiSum[n] - C_TOTIENT * n * n;
  const rows = recordMaxRows(err);
  const exp = powerFit(rows);
  plotSvg({
    title: "05 Totient summatory level line",
    subtitle: "Phi(x)=sum phi(n), residual divided by x log x",
    series: [{ name: "(Phi-3/pi^2*x^2)/(x log x)", points: graphPoints(ns, (n) => err(n) / (n * Math.log(n))) }],
    path: file,
    logX: true,
    yLabel: "scaled residual",
    hlines: [0],
  });
  candidates.push(makeCandidate(5, "Totient summatory Phi(x)", file, "KNOWN-MATH / Farey-coprimality calibration", "The 3/pi^2 level line is classical and overlaps the Farey/coprimality branch.", { theta: exp.theta, density: tab.phiSum[N] / (N * N) }));
}

{
  const file = path.join(outDir, "06-normalized-mertens.svg");
  const rows = recordMaxRows((n) => tab.mWeighted[n]);
  const exp = powerFit(rows);
  plotSvg({
    title: "06 Normalized Mertens m(x)",
    subtitle: "m(x)=sum_{n<=x} mu(n)/n",
    series: [{ name: "m(x)", points: graphPoints(ns, (n) => tab.mWeighted[n]) }],
    path: file,
    logX: true,
    yLabel: "m(x)",
    hlines: [0],
  });
  candidates.push(makeCandidate(6, "Normalized Mertens m(x)", file, "KNOWN-MATH / Mertens branch", "Calmer than M(x), but it is still a standard Mobius summatory object and belongs to the logged Mertens family.", { theta: exp.theta, endpoint: tab.mWeighted[N] }));
}

{
  const file = path.join(outDir, "07-dyadic-mobius.svg");
  const rows = recordMaxRows((n) => tab.G2[n]);
  const exp = powerFit(rows);
  plotSvg({
    title: "07 Dyadic-Mobius G2 line",
    subtitle: "G2(x)=sum E2(mu)(n), plotted as G2/sqrt(x)",
    series: [{ name: "G2/sqrt(x)", points: graphPoints(ns, (n) => tab.G2[n] / Math.sqrt(n)) }],
    path: file,
    logX: true,
    yLabel: "G2/sqrt(x)",
    hlines: [0],
  });
  candidates.push(makeCandidate(7, "Dyadic-Mobius G2", file, "PROJECT-NOVEL / not mathematically established as new", "This is the most native unlogged transform in the batch. It is a new visualization here, but structurally it is a bounded dyadic transform of Mobius, so not an undiscovered theorem.", { theta: exp.theta, endpoint: tab.G2[N] }));
}

{
  const file = path.join(outDir, "08-e2-invariance.svg");
  plotSvg({
    title: "08 E2 invariance test",
    subtitle: "Compare M, E2(M), and sum E2(mu), all divided by sqrt(x)",
    series: [
      { name: "M/sqrt(x)", points: graphPoints(ns, (n) => tab.M[n] / Math.sqrt(n)), color: COLORS[0] },
      { name: "E2(M)/sqrt(x)", points: graphPoints(ns, (n) => tab.E2M[n - 1] / Math.sqrt(n)), color: COLORS[1] },
      { name: "G2/sqrt(x)", points: graphPoints(ns, (n) => tab.G2[n] / Math.sqrt(n)), color: COLORS[2] },
    ],
    path: file,
    logX: true,
    yLabel: "normalized walk",
    hlines: [0],
  });
  candidates.push(makeCandidate(8, "E2-invariance chip-order test", file, "PROJECT-NOVEL DIAGNOSTIC / not undiscovered math", "Useful as an instrument test: the square-root scale persists under these dyadic orders. That is a transform diagnostic, not a new critical line.", { M_end: tab.M[N], G2_end: tab.G2[N] }));
}

{
  const file = path.join(outDir, "09-chebyshev-bias-mod4.svg");
  const points = [];
  let race = 0;
  let pi = 0;
  const primeSet = new Set(tab.primes);
  for (let n = 2; n <= N; n++) {
    if (primeSet.has(n)) {
      pi++;
      if (n % 4 === 1) race++;
      else if (n % 4 === 3) race--;
    }
    if (n % Math.max(1, Math.floor(N / 700)) === 0 || n === N) {
      const x = Math.max(3, n);
      points.push({ x, y: race * Math.log(x) / Math.sqrt(x) });
    }
  }
  plotSvg({
    title: "09 Chebyshev bias mod 4",
    subtitle: "race=(pi_1 mod4 - pi_3 mod4), normalized by log(x)/sqrt(x)",
    series: [{ name: "mod 4 race", points }],
    path: file,
    logX: true,
    yLabel: "race*log/sqrt",
    hlines: [0],
  });
  candidates.push(makeCandidate(9, "Chebyshev bias mod 4", file, "KNOWN-MATH / prime number race", "The visual bias is real, but it is the classical Chebyshev/Rubinstein-Sarnak prime race.", { endpoint: points.at(-1).y, primes: pi }));
}

{
  const file = path.join(outDir, "10-prime-race-family.svg");
  const qs = [3, 5, 8];
  const series = qs.map((q, idx) => {
    const residues = [];
    for (let r = 1; r < q; r++) {
      let g = q, a = r;
      while (a) {
        const t = g % a;
        g = a;
        a = t;
      }
      if (g === 1) residues.push(r);
    }
    const squares = new Set(residues.map((r) => (r * r) % q));
    const qr = residues.filter((r) => squares.has(r));
    const nqr = residues.filter((r) => !squares.has(r));
    const counts = new Int32Array(q);
    const pts = [];
    let seen = 0;
    for (const p of tab.primes) {
      if (p > N) break;
      counts[p % q]++;
      seen++;
      if (seen % Math.max(1, Math.floor(tab.primes.length / 700)) === 0 || p === tab.primes[tab.primes.length - 1]) {
        const a = qr.reduce((s, r) => s + counts[r], 0) / Math.max(1, qr.length);
        const b = nqr.reduce((s, r) => s + counts[r], 0) / Math.max(1, nqr.length);
        pts.push({ x: p, y: (a - b) * Math.log(p) / Math.sqrt(p) });
      }
    }
    return { name: `q=${q} QR-NQR`, points: pts, color: COLORS[idx] };
  });
  plotSvg({
    title: "10 Prime-race family",
    subtitle: "QR minus non-QR races for q=3,5,8, normalized by log(x)/sqrt(x)",
    series,
    path: file,
    logX: true,
    yLabel: "normalized race",
    hlines: [0],
  });
  candidates.push(makeCandidate(10, "Race family over moduli", file, "KNOWN-MATH / prime number races", "Good calibration family; the direction and scale are part of known prime-race theory.", { moduli: "3,5,8" }));
}

{
  const file = path.join(outDir, "11-liouville-ap-bias.svg");
  plotSvg({
    title: "11 Liouville in AP mod 4",
    subtitle: "class sums of lambda(n), scaled by sqrt(x)",
    series: [0, 1, 2, 3].map((r) => ({
      name: `r=${r}`,
      points: graphPoints(ns, (n) => tab.lambdaAP[r][n] / Math.sqrt(n)),
      color: COLORS[r],
    })),
    path: file,
    logX: true,
    yLabel: "S_r/sqrt(x)",
    hlines: [0],
  });
  candidates.push(makeCandidate(11, "Liouville AP bias mod 4", file, "KNOWN-MATH / multiplicative-function race", "It is an independent-looking bias plot, but lambda in arithmetic progressions is a classical multiplicative-function object.", { endpoint_r1: tab.lambdaAP[1][N], endpoint_r3: tab.lambdaAP[3][N] }));
}

const gaps = gapData(tab.primes);

{
  const file = path.join(outDir, "12-gap-log-survival.svg");
  const points = [];
  for (let u = 0.25; u <= 6.01; u += 0.25) {
    let count = 0;
    for (const g of gaps) if (g.u > u) count++;
    const p = count / gaps.length;
    if (p > 0) points.push({ x: u, y: Math.log(p) });
  }
  const fakeGaps = gapData(cramerPrimes(N, 12345));
  const fake = [];
  for (let u = 0.25; u <= 6.01; u += 0.25) {
    let count = 0;
    for (const g of fakeGaps) if (g.u > u) count++;
    const p = count / fakeGaps.length;
    if (p > 0) fake.push({ x: u, y: Math.log(p) });
  }
  const fit = linearFit(points.filter((p) => p.x >= 1 && p.x <= 4));
  plotSvg({
    title: "12 Gap log-survival",
    subtitle: "log P(gap/log p > u); Poisson/Cramer benchmark has slope -1",
    series: [
      { name: "real primes", points, color: COLORS[0] },
      { name: "Cramer seed", points: fake, color: COLORS[4] },
      { name: "slope -1 guide", points: points.map((p) => ({ x: p.x, y: -p.x })), color: "#94a3b8", width: 1.5 },
    ],
    path: file,
    yLabel: "log survival",
    xLabel: "u",
  });
  candidates.push(makeCandidate(12, "Gap log-survival", file, "KNOWN-MATH / Cramer-Poisson calibration", "The straight line is the null model itself; deviations are useful diagnostics, not an undiscovered line.", { slope: fit.slope, r2: fit.r2 }));
}

{
  const file = path.join(outDir, "13-gap-centered-walk.svg");
  const pts = [];
  let acc = 0;
  let maxAbs = 0;
  const step = Math.max(1, Math.floor(gaps.length / 700));
  for (let i = 0; i < gaps.length; i++) {
    acc += gaps[i].gap - Math.log(gaps[i].p);
    maxAbs = Math.max(maxAbs, Math.abs(acc));
    if (i % step === 0 || i === gaps.length - 1) pts.push({ x: gaps[i].p, y: acc / Math.sqrt(gaps[i].p) });
  }
  plotSvg({
    title: "13 Centered gap walk",
    subtitle: "sum(g_p-log p), normalized by sqrt(p)",
    series: [{ name: "gap walk/sqrt", points: pts }],
    path: file,
    logX: true,
    yLabel: "walk/sqrt",
    hlines: [0],
  });
  candidates.push(makeCandidate(13, "sum(g_n-log p_n) walk", file, "KNOWN-MATH DISGUISE / theta telescope", "The walk telescopes to p_k-2-theta(p_{k-1}); it is Chebyshev theta in gap coordinates.", { maxAbs }));
}

{
  const file = path.join(outDir, "14-max-gap-cramer.svg");
  const pts = [];
  let record = 0;
  for (const g of gaps) {
    if (g.gap > record) record = g.gap;
    if (pts.length === 0 || g.p / (pts.at(-1).x || 1) > 1.025 || g === gaps.at(-1)) {
      pts.push({ x: g.p, y: record / (Math.log(g.p) ** 2) });
    }
  }
  plotSvg({
    title: "14 Maximal gap over log^2 x",
    subtitle: "running max gap divided by log^2(x)",
    series: [{ name: "G(x)/log^2(x)", points: pts }],
    path: file,
    logX: true,
    yLabel: "ratio",
    hlines: [1],
  });
  candidates.push(makeCandidate(14, "Maximal-gap Cramer line", file, "KNOWN/CONJECTURAL GAP THEORY", "A legitimate frontier diagnostic, but Cramer/Granville maximal-gap behavior is already a named research area.", { endpoint: pts.at(-1).y }));
}

{
  const file = path.join(outDir, "15-repeat-prime-factor-law.svg");
  const err = (n) => tab.repeatSum[n] - C_REPEAT * n;
  const rows = recordMaxRows(err);
  const exp = powerFit(rows);
  plotSvg({
    title: "15 Repeated prime-factor law",
    subtitle: "sum(Omega-omega)-C*x, scaled by sqrt(x)",
    series: [{ name: "residual/sqrt(x)", points: graphPoints(ns, (n) => err(n) / Math.sqrt(n)) }],
    path: file,
    logX: true,
    yLabel: "scaled residual",
    hlines: [0],
  });
  candidates.push(makeCandidate(15, "sum(Omega-omega)(n)", file, "KNOWN-MATH / additive-function mean", "The constant-slope law is standard additive-function averaging; the residual is a calibration target.", { theta: exp.theta, endpoint: err(N) }));
}

{
  const file = path.join(outDir, "16-erdos-kac.svg");
  const loglog = Math.log(Math.log(N));
  const sigma = Math.sqrt(loglog);
  const binCount = 40;
  const lo = -4;
  const hi = 4;
  const bins = Array.from({ length: binCount }, (_, i) => ({ x0: lo + (i / binCount) * (hi - lo), x1: lo + ((i + 1) / binCount) * (hi - lo), y: 0 }));
  let total = 0;
  for (let n = Math.floor(N / 2); n <= N; n++) {
    const z = (tab.omega[n] - loglog) / sigma;
    const b = Math.floor(((z - lo) / (hi - lo)) * binCount);
    if (b >= 0 && b < binCount) bins[b].y++;
    total++;
  }
  const width = (hi - lo) / binCount;
  for (const b of bins) b.y = b.y / total / width;
  const normal = [];
  for (let i = 0; i <= 160; i++) {
    const x = lo + (i / 160) * (hi - lo);
    normal.push({ x, y: Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI) });
  }
  histogramSvg({ title: "16 Erdos-Kac omega(n)", subtitle: `n in [${Math.floor(N / 2)}, ${N}], z=(omega-loglog N)/sqrt(loglog N)`, bins, normal, filePath: file });
  candidates.push(makeCandidate(16, "Erdos-Kac balance", file, "KNOWN-MATH / CLT calibration", "The slow convergence is visible; this is a textbook theorem-shaped control, not a new line.", { loglog, sample: total }));
}

{
  const file = path.join(outDir, "17-kfree-ladder.svg");
  const series = [2, 3, 4, 5].map((k, i) => {
    const target = 1 / zetaReal(k);
    return {
      name: `${k}-free minus 1/zeta(${k})`,
      points: graphPoints(ns, (n) => tab.kfree[k][n] / n - target),
      color: COLORS[i],
    };
  });
  plotSvg({
    title: "17 k-free density ladder",
    subtitle: "count_kfree(x)/x - 1/zeta(k), k=2..5",
    series,
    path: file,
    logX: true,
    yLabel: "density error",
    hlines: [0],
  });
  candidates.push(makeCandidate(17, "k-free ladder", file, "KNOWN-MATH / zeta-density family", "The slope constants and error hierarchy are classical; useful family visualization, not undiscovered.", { endpoint2: tab.kfree[2][N] / N, endpoint3: tab.kfree[3][N] / N }));
}

{
  const file = path.join(outDir, "18-coprimality-farey.svg");
  const cop = (n) => 1 + 2 * tab.phiSum[n];
  const main = (n) => C_SQFREE * n * n;
  const err = (n) => (cop(n) - main(n)) / n;
  plotSvg({
    title: "18 Coprimality/Farey count residual",
    subtitle: "(1+2*sum phi(n)-6/pi^2*x^2)/x",
    series: [{ name: "scaled residual", points: graphPoints(ns, err) }],
    path: file,
    logX: true,
    yLabel: "residual/x",
    hlines: [0],
  });
  candidates.push(makeCandidate(18, "Coprimality/Farey-count residual", file, "KNOWN-MATH / overlaps totient", "This is the two-dimensional version of the totient-sum line, not a new branch distinct from #5.", { endpoint: err(N) }));
}

{
  const file = path.join(outDir, "19-matrix-width-front.svg");
  const ps = tab.primes.filter((p) => p <= primeNForMatrix);
  const pts = [];
  const top = [];
  for (let W = 2; W <= 512; W++) {
    const counts = new Float64Array(W);
    for (const p of ps) counts[p % W]++;
    const mean = ps.length / W;
    let ss = 0;
    let zeroCols = 0;
    for (let r = 0; r < W; r++) {
      const d = counts[r] - mean;
      ss += d * d;
      if (counts[r] === 0) zeroCols++;
    }
    const contrast = Math.sqrt(ss / W) / (mean || 1);
    pts.push({ x: W, y: contrast });
    top.push({ W, contrast, zeroCols });
  }
  top.sort((a, b) => b.contrast - a.contrast);
  plotSvg({
    title: "19 Matrix critical width W",
    subtitle: `stripe contrast for primes <= ${primeNForMatrix}, W=2..512`,
    series: [{ name: "column contrast", points: pts }],
    path: file,
    yLabel: "std/mean",
    xLabel: "W",
  });
  candidates.push(makeCandidate(19, "Matrix critical width W", file, "KNOWN RESIDUE-LAYER FRONT", "The contrast peaks when W has many small prime factors. That is local residue geometry, not an undiscovered critical line.", { topW: top.slice(0, 5).map((x) => x.W).join(","), primeN: primeNForMatrix }));
}

{
  const file = path.join(outDir, "20-zaremba-cf-front.svg");
  const maxA = 8;
  const series = [];
  const primeSmall = primesUpTo(cfN);
  for (let A = 1; A <= maxA; A++) {
    const den = boundedCfDenominatorTable(cfN, A);
    let count = 0;
    let primeHits = 0;
    const densityPts = [];
    const step = Math.max(1, Math.floor(cfN / 180));
    for (let n = 1; n <= cfN; n++) {
      if (den[n]) count++;
      if (n % step === 0 || n === cfN) densityPts.push({ x: n, y: count / n });
    }
    const pset = new Set(primeSmall);
    for (const p of pset) if (den[p]) primeHits++;
    series.push({ name: `A=${A}`, points: densityPts, color: COLORS[(A - 1) % COLORS.length], primeHitRate: primeHits / primeSmall.length, density: count / cfN });
  }
  plotSvg({
    title: "20 Bounded-CF/Zaremba front",
    subtitle: `reachable denominator density for partial quotients <= A, cfN=${cfN}`,
    series,
    path: file,
    logX: true,
    yLabel: "density",
    hlines: [0],
  });
  const a2 = series.find((s) => s.name === "A=2");
  candidates.push(makeCandidate(20, "Bounded-CF / Zaremba dimension front", file, "OPEN/KNOWN ZAREMBA BRANCH", "The threshold picture is meaningful, but it is the established Zaremba continued-fraction problem rather than an undiscovered line.", { A2_density: a2.density, A2_primeHitRate: a2.primeHitRate }));
}

const summary = `Generated ${candidates.length} SVG panels at N=${N} (continued-fraction subrange ${cfN}). No candidate can be honestly called mathematically undiscovered from this run. The strongest project-native survivor is #7/#8, the Dyadic-Mobius/E2 transform diagnostic; the strongest mathematical visuals are #3 and #4, but both are famous open 1/4-exponent problems.`;
const html = buildDashboard(candidates, summary);
fs.writeFileSync(path.join(outDir, "dashboard.html"), html);
fs.writeFileSync(path.join(outDir, "summary.json"), `${JSON.stringify({ N, cfN, generatedAt: new Date().toISOString(), summary, candidates }, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, "summary.md"), `# Critical-line no-zeta 20-candidate visualization batch

${summary}

Dashboard: \`${path.join(outDir, "dashboard.html")}\`

| # | candidate | verdict | note |
| ---: | --- | --- | --- |
${candidates.map((c) => `| ${c.id} | ${c.name} | ${c.verdict} | ${c.note} |`).join("\n")}
`);

console.log(JSON.stringify({ ok: true, N, cfN, outDir, dashboard: path.join(outDir, "dashboard.html"), summary: path.join(outDir, "summary.md") }, null, 2));
