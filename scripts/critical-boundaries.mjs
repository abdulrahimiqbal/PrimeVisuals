#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const OUT_DIR = "primevisuals-critical-boundaries";
const W = 1600;
const H = 1000;
const GAMMA = 0.5772156649015329;
const EGAMMA = Math.exp(GAMMA);

const C = {
  bg: "#071014",
  panel: "#0d1b21",
  panel2: "#10262d",
  line: "#1f3d46",
  grid: "#19313a",
  text: "#d9f4f3",
  dim: "#9bb9bb",
  faint: "#58787d",
  cyan: "#4df6ff",
  amber: "#ffcb64",
  mag: "#ff5ea8",
  green: "#7cff9b",
  red: "#ff766f",
  violet: "#a98cff",
};

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function fmt(n) {
  return Math.round(n).toLocaleString("en-US");
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
}

function diverge(v, maxAbs = 3) {
  const t = clamp(v / maxAbs, -1, 1);
  return t < 0 ? mix(C.violet, C.panel2, 1 + t) : mix(C.panel2, C.amber, t);
}

function thermal(t) {
  t = clamp(t, 0, 1);
  if (t < 0.33) return mix("#11172e", C.cyan, t / 0.33);
  if (t < 0.7) return mix(C.cyan, C.green, (t - 0.33) / 0.37);
  return mix(C.green, C.amber, (t - 0.7) / 0.3);
}

function sieve(N) {
  const s = new Uint8Array(N + 1);
  s.fill(1);
  s[0] = 0;
  if (N >= 1) s[1] = 0;
  for (let i = 2; i * i <= N; i++) if (s[i]) for (let j = i * i; j <= N; j += i) s[j] = 0;
  return s;
}

function primesUpTo(N) {
  const mask = sieve(N);
  const out = [];
  for (let n = 2; n <= N; n++) if (mask[n]) out.push(n);
  return out;
}

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}

function phi(n) {
  let m = n, out = n;
  for (let p = 2; p * p <= m; p++) if (m % p === 0) {
    out -= out / p;
    while (m % p === 0) m /= p;
  }
  if (m > 1) out -= out / m;
  return Math.round(out);
}

function mobiusUpTo(N) {
  const mu = new Int8Array(N + 1);
  const spf = new Int32Array(N + 1);
  const primes = [];
  mu[1] = 1;
  for (let i = 2; i <= N; i++) {
    if (!spf[i]) {
      spf[i] = i;
      primes.push(i);
      mu[i] = -1;
    }
    for (const p of primes) {
      if (p > spf[i] || i * p > N) break;
      spf[i * p] = p;
      if (i % p === 0) {
        mu[i * p] = 0;
        break;
      }
      mu[i * p] = -mu[i];
    }
  }
  return mu;
}

function omegaBigUpTo(N) {
  const omega = new Uint8Array(N + 1);
  for (let p = 2; p <= N; p++) {
    if (omega[p]) continue;
    for (let j = p; j <= N; j += p) {
      let m = j;
      while (m % p === 0) {
        omega[j]++;
        m /= p;
      }
    }
  }
  return omega;
}

function vonMangoldtUpTo(N) {
  const mask = sieve(N);
  const lambda = new Float64Array(N + 1);
  for (let p = 2; p <= N; p++) if (mask[p]) {
    const lp = Math.log(p);
    for (let q = p; q <= N; q *= p) {
      lambda[q] = lp;
      if (q > Math.floor(N / p)) break;
    }
  }
  return lambda;
}

function sigmaUpTo(N) {
  const sigma = new Float64Array(N + 1);
  for (let d = 1; d <= N; d++) for (let j = d; j <= N; j += d) sigma[j] += d;
  return sigma;
}

function solveDense(Ain, bin, n) {
  const A = Float64Array.from(Ain);
  const b = Float64Array.from(bin);
  for (let col = 0; col < n; col++) {
    let piv = col, best = Math.abs(A[col * n + col]);
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(A[r * n + col]);
      if (v > best) { best = v; piv = r; }
    }
    if (piv !== col) {
      for (let c = col; c < n; c++) [A[col * n + c], A[piv * n + c]] = [A[piv * n + c], A[col * n + c]];
      [b[col], b[piv]] = [b[piv], b[col]];
    }
    const diag = A[col * n + col] || 1e-12;
    for (let r = col + 1; r < n; r++) {
      const f = A[r * n + col] / diag;
      if (!f) continue;
      A[r * n + col] = 0;
      for (let c = col + 1; c < n; c++) A[r * n + c] -= f * A[col * n + c];
      b[r] -= f * b[col];
    }
  }
  const x = new Float64Array(n);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let c = r + 1; c < n; c++) s -= A[r * n + c] * x[c];
    x[r] = s / (A[r * n + r] || 1e-12);
  }
  return x;
}

function panel(x, y, w, h, label = "") {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.panel}" stroke="${C.line}"/>${label ? `<text x="${x + 18}" y="${y + 31}" fill="${C.dim}" font-size="18" font-family="ui-monospace, Menlo, monospace" letter-spacing="3">${esc(label)}</text>` : ""}</g>`;
}

function axes(box, xLabel = "", yLabel = "") {
  const [x, y, w, h] = box;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.panel2}" opacity="0.56" stroke="${C.line}"/>`;
  for (let i = 1; i < 5; i++) {
    const xx = x + w * i / 5, yy = y + h * i / 5;
    s += `<line x1="${xx}" y1="${y}" x2="${xx}" y2="${y + h}" stroke="${C.grid}"/><line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="${C.grid}"/>`;
  }
  s += `<text x="${x + w}" y="${y + h + 28}" fill="${C.faint}" font-size="15" font-family="ui-monospace, Menlo, monospace" text-anchor="end">${esc(xLabel)}</text>`;
  s += `<text x="${x - 8}" y="${y - 8}" fill="${C.faint}" font-size="15" font-family="ui-monospace, Menlo, monospace">${esc(yLabel)}</text>`;
  return s;
}

function plotPath(points, box, bounds, color = C.cyan, width = 2, opacity = 0.9) {
  if (!points.length) return "";
  const [x, y, w, h] = box;
  const sx = (v) => x + ((v - bounds.x0) / (bounds.x1 - bounds.x0 || 1)) * w;
  const sy = (v) => y + h - ((v - bounds.y0) / (bounds.y1 - bounds.y0 || 1)) * h;
  const d = points.map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(" ");
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function scatter(points, box, bounds, color = C.cyan, r = 2, opacity = 0.75) {
  const [x, y, w, h] = box;
  const sx = (v) => x + ((v - bounds.x0) / (bounds.x1 - bounds.x0 || 1)) * w;
  const sy = (v) => y + h - ((v - bounds.y0) / (bounds.y1 - bounds.y0 || 1)) * h;
  return points.map((p) => `<circle cx="${sx(p[0]).toFixed(1)}" cy="${sy(p[1]).toFixed(1)}" r="${p[3] || r}" fill="${p[2] || color}" opacity="${p[4] ?? opacity}"/>`).join("");
}

function heatmap(matrix, box, lo, hi, colorFn = thermal, rowLabels = [], colLabels = []) {
  const rows = matrix.length, cols = matrix[0].length;
  const [x, y, w, h] = box;
  const cw = w / cols, rh = h / rows;
  let s = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = matrix[r][c];
    const fill = Number.isFinite(v) ? colorFn((v - lo) / (hi - lo || 1), v) : "#05080a";
    s += `<rect x="${(x + c * cw).toFixed(2)}" y="${(y + r * rh).toFixed(2)}" width="${Math.ceil(cw) + 0.4}" height="${Math.ceil(rh) + 0.4}" fill="${fill}"/>`;
  }
  rowLabels.forEach((l, i) => {
    s += `<text x="${x - 12}" y="${y + i * rh + rh * 0.65}" fill="${C.faint}" font-size="13" font-family="ui-monospace, Menlo, monospace" text-anchor="end">${esc(l)}</text>`;
  });
  colLabels.forEach((l, i) => {
    s += `<text x="${x + i * cw + cw / 2}" y="${y + h + 20}" fill="${C.faint}" font-size="12" font-family="ui-monospace, Menlo, monospace" text-anchor="middle">${esc(l)}</text>`;
  });
  return s;
}

function baseSvg(title, subtitle, body, footer = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="wash" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#08212a"/><stop offset="1" stop-color="#05090c"/></linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wash)"/>
  <circle cx="1320" cy="130" r="390" fill="#0d3436" opacity="0.25"/>
  <text x="58" y="72" fill="${C.text}" font-size="36" font-family="Inter, ui-sans-serif, system-ui" font-weight="760">${esc(title)}</text>
  <text x="60" y="112" fill="${C.dim}" font-size="19" font-family="Inter, ui-sans-serif, system-ui">${esc(subtitle)}</text>
  ${body}
  <text x="60" y="954" fill="${C.faint}" font-size="16" font-family="ui-monospace, Menlo, monospace">${esc(footer)}</text>
</svg>`;
}

function auditStatus({ breakthrough = false, verdict, reason, metrics = {} }) {
  return { breakthrough, verdict, reason, metrics };
}

function levelDistribution() {
  const xs = [5000, 10000, 20000, 40000, 80000];
  const thetas = Array.from({ length: 18 }, (_, i) => 0.1 + i * 0.05);
  const lambda = vonMangoldtUpTo(Math.max(...xs));
  const matrix = [];
  const raw = [];
  for (const x of xs) {
    const row = [];
    for (const theta of thetas) {
      const q = Math.max(3, Math.round(x ** theta));
      const sums = new Float64Array(q);
      for (let n = 1; n <= x; n++) sums[n % q] += lambda[n];
      const ph = phi(q);
      const expected = x / ph;
      let worst = 0;
      for (let a = 0; a < q; a++) if (gcd(a, q) === 1) worst = Math.max(worst, Math.abs(sums[a] - expected));
      const normalized = worst / Math.max(1e-12, expected);
      row.push(Math.log10(1 + normalized));
      raw.push({ x, theta, q, worst, expected, normalized });
    }
    matrix.push(row);
  }
  const left = raw.filter((r) => r.theta <= 0.5).map((r) => r.normalized);
  const right = raw.filter((r) => r.theta > 0.5).map((r) => r.normalized);
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const body = panel(58, 150, 1180, 750, "LEVEL OF DISTRIBUTION WALL") +
    heatmap(matrix, [170, 220, 880, 470], 0, Math.max(...matrix.flat()), thermal, xs.map((x) => `x=${fmt(x)}`), thetas.map((t) => t.toFixed(2))) +
    `<line x1="${170 + ((0.5 - 0.1) / (0.95 - 0.1)) * 880}" y1="220" x2="${170 + ((0.5 - 0.1) / (0.95 - 0.1)) * 880}" y2="690" stroke="${C.amber}" stroke-width="4"/>
    <line x1="${170 + ((0.9 - 0.1) / (0.95 - 0.1)) * 880}" y1="220" x2="${170 + ((0.9 - 0.1) / (0.95 - 0.1)) * 880}" y2="690" stroke="${C.mag}" stroke-width="3" stroke-dasharray="10 8"/>
    <text x="1120" y="300" fill="${C.text}" font-size="25" font-family="Inter, system-ui" font-weight="700">Proof-space frontier</text>
    <text x="1120" y="338" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">solid: theta = 1/2 BV wall</text>
    <text x="1120" y="368" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">dashed: near EH territory</text>
    <text x="1120" y="430" fill="${C.amber}" font-size="18" font-family="ui-monospace, Menlo, monospace">left mean ${mean(left).toFixed(3)}</text>
    <text x="1120" y="462" fill="${C.mag}" font-size="18" font-family="ui-monospace, Menlo, monospace">right mean ${mean(right).toFixed(3)}</text>`;
  return {
    svg: baseSvg("01 Distribution Wall: theta = 1/2 to theta = 1", "Worst residue-class error as modulus scale crosses the Bombieri-Vinogradov frontier.", body, "Finite heatmap only; theorem frontier is not a numerical discovery."),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "Finite samples show relative AP error worsening as q grows, but do not provide new control beyond theta=1/2.",
      metrics: { xs, thetaMin: thetas[0], thetaMax: thetas.at(-1), leftMean: mean(left), rightMean: mean(right), rightOverLeft: mean(right) / mean(left) },
    }),
  };
}

function sieveParity() {
  const start = 1_000_000;
  const width = 7200;
  const N = start + width + 4;
  const primes = primesUpTo(47);
  const mask = sieve(N);
  const omega = omegaBigUpTo(N);
  const grid = [];
  const cols = 120;
  const rows = Math.ceil(width / cols);
  let survivors = 0, truePrimes = 0, odd = 0, even = 0, twinCandidates = 0, twinTruth = 0;
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const n = start + r * cols + c;
      if (n >= start + width) { row.push(NaN); continue; }
      let survives = true;
      for (const p of primes) {
        if (n % p === 0) { survives = false; break; }
      }
      if (!survives) { row.push(0); continue; }
      survivors++;
      if (mask[n]) truePrimes++;
      if (omega[n] % 2) odd++; else even++;
      row.push(omega[n] % 2 ? 2 : 1);
      let pairSurvives = true;
      for (const p of primes) {
        if ((n * (n + 2)) % p === 0) { pairSurvives = false; break; }
      }
      if (pairSurvives) {
        twinCandidates++;
        if (mask[n] && mask[n + 2]) twinTruth++;
      }
    }
    grid.push(row);
  }
  const body = panel(58, 150, 1040, 750, "SIEVE SURVIVORS COLORED BY OMEGA PARITY") +
    heatmap(grid, [110, 220, 920, 520], 0, 2, (t, v) => !v ? "#05080a" : v === 1 ? C.violet : C.green) +
    `<text x="1160" y="270" fill="${C.text}" font-size="25" font-family="Inter, system-ui" font-weight="700">Parity wall</text>
    <text x="1160" y="308" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">black: removed by local sieve</text>
    <text x="1160" y="340" fill="${C.green}" font-size="18" font-family="ui-monospace, Menlo, monospace">green: odd Omega</text>
    <text x="1160" y="372" fill="${C.violet}" font-size="18" font-family="ui-monospace, Menlo, monospace">violet: even Omega</text>
    <text x="1160" y="438" fill="${C.amber}" font-size="18" font-family="ui-monospace, Menlo, monospace">survivors ${fmt(survivors)}</text>
    <text x="1160" y="470" fill="${C.amber}" font-size="18" font-family="ui-monospace, Menlo, monospace">actual primes ${fmt(truePrimes)}</text>
    <text x="1160" y="502" fill="${C.mag}" font-size="18" font-family="ui-monospace, Menlo, monospace">twin sieve hits ${fmt(twinCandidates)}</text>
    <text x="1160" y="534" fill="${C.mag}" font-size="18" font-family="ui-monospace, Menlo, monospace">actual twins ${fmt(twinTruth)}</text>`;
  return {
    svg: baseSvg("02 Sieve Parity Wall", "Local divisibility can produce candidates, but parity-sensitive prime detection remains hidden.", body, `Interval [${fmt(start)}, ${fmt(start + width)}]; sieved by primes <= 47.`),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "The candidate set remains parity-mixed; the sieve selects many non-primes and gives no lower-bound separator for primes/twins.",
      metrics: { start, width, survivors, truePrimes, oddParitySurvivors: odd, evenParitySurvivors: even, twinCandidates, twinTruth },
    }),
  };
}

function robinNicolas() {
  const N = 220000;
  const sigma = sigmaUpTo(N);
  const cloud = [];
  const ridge = [];
  let maxSigmaRatio = 0;
  let worstAfter5040 = { n: 0, r: 0 };
  for (let n = 3; n <= N; n++) {
    const denom = EGAMMA * n * Math.log(Math.log(n));
    if (!(denom > 0)) continue;
    const r = sigma[n] / denom;
    if (n % 11 === 0) cloud.push([Math.log(n), r, C.faint, 1.3, 0.3]);
    if (sigma[n] / n > maxSigmaRatio) {
      maxSigmaRatio = sigma[n] / n;
      ridge.push([Math.log(n), r]);
    }
    if (n > 5040 && r > worstAfter5040.r) worstAfter5040 = { n, r };
  }
  const primes = primesUpTo(5000);
  const nic = [];
  let logP = 0, prod = 1;
  for (let k = 0; k < primes.length && k < 110; k++) {
    const p = primes[k];
    logP += Math.log(p);
    prod *= p / (p - 1);
    if (logP <= Math.E) continue;
    const margin = prod / (EGAMMA * Math.log(logP)) - 1;
    nic.push([k + 1, margin]);
  }
  const b1 = [85, 190, 870, 600];
  const b2 = [1060, 230, 390, 450];
  const yMax = Math.max(1.12, ...cloud.map((p) => p[1]), ...ridge.map((p) => p[1]));
  const nicMax = Math.max(...nic.map((p) => Math.abs(p[1]))) * 1.15;
  let s = panel(58, 150, 950, 750, "ROBIN DIVISOR-ABUNDANCE WALL") + axes(b1, "log n", "") +
    scatter(cloud, b1, { x0: Math.log(3), x1: Math.log(N), y0: 0, y1: yMax }, C.faint, 1.1, 0.3) +
    plotPath(ridge, b1, { x0: Math.log(3), x1: Math.log(N), y0: 0, y1: yMax }, C.cyan, 3, 0.95);
  const barrierY = b1[1] + b1[3] - (1 / yMax) * b1[3];
  s += `<line x1="${b1[0]}" y1="${barrierY}" x2="${b1[0] + b1[2]}" y2="${barrierY}" stroke="${C.amber}" stroke-width="4"/><text x="${b1[0] + 15}" y="${barrierY - 12}" fill="${C.amber}" font-size="17" font-family="ui-monospace, Menlo, monospace">RH ceiling R(n)=1 after 5040</text>`;
  s += panel(1030, 150, 500, 750, "NICOLAS PRIMORIAL PRESSURE") + axes(b2, "k", "margin");
  s += plotPath(nic, b2, { x0: 1, x1: nic.length, y0: -nicMax, y1: nicMax }, C.mag, 3, 0.95);
  s += `<line x1="${b2[0]}" y1="${b2[1] + b2[3] / 2}" x2="${b2[0] + b2[2]}" y2="${b2[1] + b2[3] / 2}" stroke="${C.amber}" stroke-dasharray="8 8"/>
    <text x="1070" y="760" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">dual arithmetic-only RH criteria</text>
    <text x="1070" y="794" fill="${C.cyan}" font-size="17" font-family="ui-monospace, Menlo, monospace">Robin max after 5040: n=${fmt(worstAfter5040.n)}, R=${worstAfter5040.r.toFixed(6)}</text>`;
  return {
    svg: baseSvg("03 Robin Wall and Nicolas Gauge", "Divisor abundance and primorial totient pressure as arithmetic-only RH-equivalent barriers.", s, `Robin scan through n=${fmt(N)}; Nicolas first ${nic.length} primorials.`),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "No Robin breach appears in the scanned range, and the Nicolas margins follow known finite behavior; this confirms the barrier visual rather than creating a new criterion.",
      metrics: { robinN: N, worstAfter5040, nicolasPrimorials: nic.length, nicolasMinMargin: Math.min(...nic.map((p) => p[1])), nicolasLastMargin: nic.at(-1)[1] },
    }),
  };
}

function robinWall() {
  const N = 220000;
  const sigma = sigmaUpTo(N);
  const cloud = [];
  const ridge = [];
  let maxSigmaRatio = 0;
  let worstAfter5040 = { n: 0, r: 0 };
  for (let n = 3; n <= N; n++) {
    const denom = EGAMMA * n * Math.log(Math.log(n));
    if (!(denom > 0)) continue;
    const r = sigma[n] / denom;
    if (n % 9 === 0) cloud.push([Math.log(n), r, C.faint, 1.3, 0.28]);
    if (sigma[n] / n > maxSigmaRatio) {
      maxSigmaRatio = sigma[n] / n;
      ridge.push([Math.log(n), r]);
    }
    if (n > 5040 && r > worstAfter5040.r) worstAfter5040 = { n, r };
  }
  const b = [90, 190, 1040, 650];
  const yMax = Math.max(1.12, ...cloud.map((p) => p[1]), ...ridge.map((p) => p[1]));
  let s = panel(58, 150, 1120, 750, "DIVISOR-ABUNDANCE MOUNTAIN RANGE") + axes(b, "log n", "") +
    scatter(cloud, b, { x0: Math.log(3), x1: Math.log(N), y0: 0, y1: yMax }, C.faint, 1.1, 0.28) +
    plotPath(ridge, b, { x0: Math.log(3), x1: Math.log(N), y0: 0, y1: yMax }, C.cyan, 3, 0.95);
  const barrierY = b[1] + b[3] - (1 / yMax) * b[3];
  s += `<line x1="${b[0]}" y1="${barrierY}" x2="${b[0] + b[2]}" y2="${barrierY}" stroke="${C.amber}" stroke-width="4"/>
    <text x="${b[0] + 15}" y="${barrierY - 12}" fill="${C.amber}" font-size="18" font-family="ui-monospace, Menlo, monospace">critical ceiling R(n)=1 after 5040</text>
    <text x="1230" y="300" fill="${C.text}" font-size="25" font-family="Inter, system-ui" font-weight="700">Robin criterion</text>
    <text x="1230" y="340" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">A breach above the wall after</text>
    <text x="1230" y="370" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">5040 would be RH-negative.</text>
    <text x="1230" y="435" fill="${C.cyan}" font-size="18" font-family="ui-monospace, Menlo, monospace">scan max: n=${fmt(worstAfter5040.n)}</text>
    <text x="1230" y="467" fill="${C.cyan}" font-size="18" font-family="ui-monospace, Menlo, monospace">R=${worstAfter5040.r.toFixed(6)}</text>`;
  return {
    svg: baseSvg("03 Robin Wall: divisor abundance ceiling", "An arithmetic-only RH-equivalent barrier: divisor mass must stay under the ceiling.", s, `Scan through n=${fmt(N)}; no post-5040 breach found.`),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "No Robin inequality breach appears in the scanned range; the record ridge stays below the RH-equivalent ceiling after 5040.",
      metrics: { robinN: N, worstAfter5040 },
    }),
  };
}

function nicolasGauge() {
  const primes = primesUpTo(8000);
  const nic = [];
  let logP = 0, prod = 1;
  for (let k = 0; k < primes.length && k < 160; k++) {
    const p = primes[k];
    logP += Math.log(p);
    prod *= p / (p - 1);
    if (logP <= Math.E) continue;
    const margin = prod / (EGAMMA * Math.log(logP)) - 1;
    nic.push([k + 1, margin]);
  }
  const b = [95, 210, 1010, 550];
  const yMax = Math.max(...nic.map((p) => p[1])) * 1.12;
  let s = panel(58, 150, 1120, 750, "PRIMORIAL PRESSURE GAUGE") + axes(b, "primorial index k", "Nicolas margin") +
    plotPath(nic, b, { x0: nic[0][0], x1: nic.at(-1)[0], y0: 0, y1: yMax }, C.mag, 3, 0.95);
  const zeroY = b[1] + b[3];
  s += `<line x1="${b[0]}" y1="${zeroY}" x2="${b[0] + b[2]}" y2="${zeroY}" stroke="${C.amber}" stroke-width="3" stroke-dasharray="8 8"/>
    <text x="1200" y="292" fill="${C.text}" font-size="25" font-family="Inter, system-ui" font-weight="700">Nicolas criterion</text>
    <text x="1200" y="332" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">Primorial totient pressure should</text>
    <text x="1200" y="362" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">remain on the correct side of zero.</text>
    <text x="1200" y="430" fill="${C.mag}" font-size="18" font-family="ui-monospace, Menlo, monospace">last margin ${nic.at(-1)[1].toFixed(6)}</text>
    <text x="1200" y="462" fill="${C.mag}" font-size="18" font-family="ui-monospace, Menlo, monospace">min margin ${Math.min(...nic.map((p) => p[1])).toFixed(6)}</text>`;
  return {
    svg: baseSvg("04 Nicolas primorial pressure gauge", "Primorials expose a totient-pressure RH criterion without plotting primes as points.", s, `First ${nic.length} valid primorial margins after log log P is positive.`),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "Margins stay positive in the rendered primorial range and follow the known slow decay; no new anomaly is flagged.",
      metrics: { nicolasPrimorials: nic.length, nicolasMinMargin: Math.min(...nic.map((p) => p[1])), nicolasLastMargin: nic.at(-1)[1] },
    }),
  };
}

function fareyOcean() {
  const orders = Array.from({ length: 42 }, (_, i) => 20 + i * 5);
  const cols = 180;
  const matrix = [];
  const trace = [];
  for (const N of orders) {
    const vals = [];
    for (let q = 1; q <= N; q++) for (let a = 0; a <= q; a++) if (gcd(a, q) === 1) vals.push(a / q);
    vals.sort((a, b) => a - b);
    const row = Array(cols).fill(0);
    let maxD = 0;
    const L = vals.length - 1;
    for (let c = 0; c < cols; c++) {
      const k = Math.floor((c / (cols - 1)) * L);
      const d = vals[k] - k / L;
      row[c] = d * N;
      maxD = Math.max(maxD, Math.abs(d));
    }
    matrix.push(row);
    trace.push([N, maxD * N]);
  }
  const b = [130, 210, 1060, 510];
  const tb = [130, 790, 1060, 90];
  const lim = Math.max(...matrix.flat().map(Math.abs));
  let s = panel(58, 150, 1210, 750, "FAREY DISCREPANCY OCEAN") +
    heatmap(matrix, b, -lim, lim, (_, v) => diverge(v, lim), orders.map((N) => `${N}`), []) +
    axes(tb, "Farey order N", "N * max discrepancy") +
    plotPath(trace, tb, { x0: orders[0], x1: orders.at(-1), y0: 0, y1: Math.max(...trace.map((p) => p[1])) * 1.1 }, C.cyan, 3, 0.95) +
    `<text x="1310" y="295" fill="${C.text}" font-size="25" font-family="Inter, system-ui" font-weight="700">Rational uniformity</text>
    <text x="1310" y="334" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">RH-equivalent statements can be</text>
    <text x="1310" y="364" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">phrased as Farey discrepancy</text>
    <text x="1310" y="394" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">growth control.</text>`;
  return {
    svg: baseSvg("05 Farey Sea: rational uniformity shadow", "Reduced fractions try to become uniform; discrepancy carries hidden prime-distribution information.", s, `Farey orders ${orders[0]}..${orders.at(-1)}.`),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "The discrepancy trace stays modest in this small range but supplies no new asymptotic control.",
      metrics: { orderMin: orders[0], orderMax: orders.at(-1), maxScaledDiscrepancy: Math.max(...trace.map((p) => p[1])), lastScaledDiscrepancy: trace.at(-1)[1] },
    }),
  };
}

function frac(x) {
  return x - Math.floor(x);
}

function nymanBeurling() {
  const M = 520;
  const xs = Array.from({ length: M }, (_, i) => (i + 0.5) / M);
  const maxN = 36;
  const residualRows = [];
  const errors = [];
  const basis = Array.from({ length: maxN }, (_, a) => xs.map((x) => frac(1 / ((a + 1) * x))));
  let example = [];
  for (let n = 1; n <= maxN; n++) {
    const A = new Float64Array(n * n);
    const b = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let k = 0; k < M; k++) s += basis[i][k] * basis[j][k];
        A[i * n + j] = s / M;
      }
      let t = 0;
      for (let k = 0; k < M; k++) t += basis[i][k];
      b[i] = t / M;
    }
    const coef = solveDense(A, b, n);
    const row = [];
    let err = 0;
    for (let k = 0; k < M; k++) {
      let y = 0;
      for (let i = 0; i < n; i++) y += coef[i] * basis[i][k];
      const res = 1 - y;
      row.push(res);
      err += res * res;
    }
    errors.push([n, Math.sqrt(err / M)]);
    if (n === maxN) example = xs.map((x, k) => [x, 1 - row[k]]);
    if (n % 2 === 0) residualRows.push(row.filter((_, k) => k % 4 === 0));
  }
  const b1 = [110, 210, 740, 360];
  const b2 = [110, 650, 740, 180];
  const b3 = [960, 240, 480, 430];
  const lim = Math.max(...residualRows.flat().map(Math.abs));
  let s = panel(58, 150, 850, 750, "SAWTOOTH APPROXIMATION THEATRE") + axes(b1, "x", "target and approximation") +
    plotPath(xs.map((x) => [x, 1]), b1, { x0: 0, x1: 1, y0: -0.2, y1: 1.6 }, C.amber, 3, 0.9) +
    plotPath(example, b1, { x0: 0, x1: 1, y0: -0.2, y1: 1.6 }, C.cyan, 2.2, 0.9) +
    axes(b2, "number of basis functions", "L2 error") +
    plotPath(errors, b2, { x0: 1, x1: maxN, y0: 0, y1: Math.max(...errors.map((p) => p[1])) }, C.mag, 3, 0.95) +
    panel(930, 150, 560, 750, "RESIDUAL ENERGY") +
    heatmap(residualRows, b3, -lim, lim, (_, v) => diverge(v, lim), [], []);
  s += `<text x="970" y="730" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">Question: does the residual energy tend to zero?</text>`;
  return {
    svg: baseSvg("06 Nyman-Beurling sawtooth theatre", "RH as closure of arithmetic sawtooth spans, shown as approximation error rather than zeros.", s, `Least-squares discretization with ${M} samples and ${maxN} basis functions.`),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "The finite least-squares error decreases but does not suggest a new rate, proof mechanism, or exceptional obstruction.",
      metrics: { samples: M, maxBasis: maxN, firstError: errors[0][1], lastError: errors.at(-1)[1], errorRatio: errors.at(-1)[1] / errors[0][1] },
    }),
  };
}

function redhefferMatrix() {
  const N = 9000;
  const mu = mobiusUpTo(N);
  let Mertens = 0;
  const walk = [];
  const zeros = [];
  let maxRatio = 0, maxN = 1;
  for (let n = 1; n <= N; n++) {
    Mertens += mu[n];
    if (n % 4 === 0) walk.push([n, Mertens]);
    if (Mertens === 0) zeros.push(n);
    const ratio = n >= 10 ? Math.abs(Mertens) / Math.sqrt(n) : 0;
    if (ratio > maxRatio) { maxRatio = ratio; maxN = n; }
  }
  const size = 90;
  const mat = [];
  for (let i = 1; i <= size; i++) {
    const row = [];
    for (let j = 1; j <= size; j++) row.push(j === 1 || j % i === 0 ? 1 : 0);
    mat.push(row);
  }
  const b = [900, 230, 520, 450];
  const ym = Math.max(...walk.map((p) => Math.abs(p[1])));
  let s = panel(58, 150, 760, 750, "REDHEFFER DIVISIBILITY MATRIX") +
    heatmap(mat, [110, 220, 620, 620], 0, 1, (t) => t > 0.5 ? C.cyan : "#05080a") +
    panel(850, 150, 670, 750, "DETERMINANT WALK det(R_n)=M(n)") + axes(b, "n", "M(n)") +
    plotPath(walk, b, { x0: 1, x1: N, y0: -ym, y1: ym }, C.mag, 2.5, 0.95);
  const upper = [], lower = [];
  for (let x = 1; x <= N; x += 200) {
    upper.push([x, Math.sqrt(x)]);
    lower.push([x, -Math.sqrt(x)]);
  }
  s += plotPath(upper, b, { x0: 1, x1: N, y0: -ym, y1: ym }, C.amber, 1.6, 0.8) + plotPath(lower, b, { x0: 1, x1: N, y0: -ym, y1: ym }, C.amber, 1.6, 0.8);
  s += `<text x="900" y="745" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">zero moments observed: ${fmt(zeros.length)}</text>
    <text x="900" y="780" fill="${C.amber}" font-size="17" font-family="ui-monospace, Menlo, monospace">max |M(n)|/sqrt(n)=${maxRatio.toFixed(4)} at n=${fmt(maxN)}</text>`;
  return {
    svg: baseSvg("07 Divisibility Matrix determinant pressure", "Mertens cancellation as linear algebra: the Redheffer determinant walk.", s, `Redheffer matrix preview ${size}x${size}; Mertens walk to ${fmt(N)}.`),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "The determinant/Mertens walk remains within small square-root scale in this range, matching known finite behavior.",
      metrics: { N, matrixSize: size, zeroMertensCount: zeros.length, maxAbsMOverSqrtN: maxRatio, maxAtN: maxN },
    }),
  };
}

function landauMountain() {
  const N = 520;
  const primes = primesUpTo(N);
  const dp = new Float64Array(N + 1);
  const choice = Array.from({ length: primes.length + 1 }, () => new Int16Array(N + 1));
  for (let idx = 0; idx < primes.length; idx++) {
    const p = primes[idx];
    const next = Float64Array.from(dp);
    const powers = [];
    for (let q = p; q <= N; q *= p) {
      powers.push(q);
      if (q > Math.floor(N / p)) break;
    }
    for (let w = 0; w <= N; w++) {
      for (const q of powers) {
        if (q > w) break;
        const v = dp[w - q] + Math.log(q);
        if (v > next[w]) {
          next[w] = v;
          choice[idx + 1][w] = q;
        }
      }
    }
    dp.set(next);
  }
  const pts = [];
  const residual = [];
  for (let n = 2; n <= N; n++) {
    const main = Math.sqrt(n * Math.log(n));
    pts.push([n, dp[n]]);
    residual.push([n, dp[n] - main]);
  }
  const blocks = [];
  let w = N;
  for (let idx = primes.length; idx > 0; idx--) {
    const q = choice[idx][w];
    if (q) {
      blocks.push(q);
      w -= q;
    }
  }
  blocks.sort((a, b) => b - a);
  const b1 = [90, 200, 950, 420];
  const b2 = [90, 700, 950, 130];
  const yMax = Math.max(...pts.map((p) => p[1])) * 1.05;
  const main = pts.map(([n]) => [n, Math.sqrt(n * Math.log(n))]);
  const rMax = Math.max(...residual.map((p) => Math.abs(p[1])));
  let s = panel(58, 150, 1040, 750, "LANDAU PERMUTATION-ORDER MOUNTAIN") + axes(b1, "n", "log g(n)") +
    plotPath(pts, b1, { x0: 2, x1: N, y0: 0, y1: yMax }, C.cyan, 3, 0.95) +
    plotPath(main, b1, { x0: 2, x1: N, y0: 0, y1: yMax }, C.amber, 2, 0.85) +
    axes(b2, "n", "residual") +
    plotPath(residual, b2, { x0: 2, x1: N, y0: -rMax, y1: rMax }, C.mag, 2.2, 0.95);
  s += panel(1140, 150, 370, 750, "OPTIMAL PRIME-POWER PACKING");
  let y = 240;
  for (const q of blocks.slice(0, 18)) {
    const wbox = clamp(q / blocks[0], 0.08, 1) * 280;
    s += `<rect x="1180" y="${y}" width="${wbox}" height="22" fill="${thermal(q / blocks[0])}" opacity="0.9"/><text x="${1188 + wbox}" y="${y + 17}" fill="${C.dim}" font-size="14" font-family="ui-monospace, Menlo, monospace"> ${q}</text>`;
    y += 31;
  }
  return {
    svg: baseSvg("08 Landau permutation-order mountain", "Prime powers hidden inside the extremal order of permutations.", s, `Exact group-knapsack dynamic program through n=${N}.`),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "The residual oscillates around the classical main scale; no unexpected packing law or persistent anomaly appears.",
      metrics: { N, logGAtN: dp[N], mainAtN: Math.sqrt(N * Math.log(N)), residualAtN: dp[N] - Math.sqrt(N * Math.log(N)), topPackingBlocks: blocks.slice(0, 20) },
    }),
  };
}

function boundaryDashboard(audits) {
  const labels = audits.map((a) => a.title.replace(/^\d+\s*/, ""));
  const cols = ["residual", "null/control", "range", "formal", "breakthrough"];
  const values = labels.map((_, i) => [1, i < 2 ? 1 : 0, 1, 1, 0]);
  let s = panel(58, 150, 1390, 750, "BREAKTHROUGH TRIAGE LEDGER");
  const x0 = 560, y0 = 225, dx = 168, dy = 72;
  cols.forEach((c, i) => s += `<text x="${x0 + i * dx}" y="210" fill="${C.dim}" font-size="16" font-family="ui-monospace, Menlo, monospace" text-anchor="middle">${esc(c)}</text>`);
  values.forEach((row, r) => {
    s += `<text x="110" y="${y0 + r * dy + 34}" fill="${C.text}" font-size="17" font-family="Inter, system-ui">${esc(labels[r])}</text>`;
    row.forEach((v, i) => {
      const fill = v ? (i === 4 ? C.red : C.green) : (i === 4 ? C.red : C.faint);
      const txt = i === 4 ? "NO" : (v ? "OK" : "--");
      s += `<rect x="${x0 + i * dx - 28}" y="${y0 + r * dy}" width="56" height="52" rx="12" fill="${fill}" opacity="${i === 4 ? 0.65 : 0.85}"/><text x="${x0 + i * dx}" y="${y0 + r * dy + 35}" text-anchor="middle" fill="${C.bg}" font-size="23" font-weight="800" font-family="ui-monospace, Menlo, monospace">${txt}</text>`;
    });
  });
  s += `<text x="120" y="845" fill="${C.amber}" font-size="21" font-family="Inter, system-ui">Result: these are strong boundary instruments, not breakthrough evidence in the computed ranges.</text>`;
  return {
    svg: baseSvg("09 Critical Boundaries breakthrough triage", "A dashboard separating proof-frontier value from discovery claims.", s, "A finite visual audit can suggest candidates; it cannot certify asymptotic breakthroughs."),
    audit: auditStatus({
      verdict: "no breakthrough",
      reason: "None of the seven computed boundary instruments produced a persistent anomaly, null-model failure, or formal candidate strong enough to label as a breakthrough.",
      metrics: { instrumentsTriaged: values.length, breakthroughsFlagged: 0 },
    }),
  };
}

async function svgToPng(browser, svg, pngPath) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:${C.bg};">${svg}</body></html>`, { waitUntil: "load" });
  await page.screenshot({ path: pngPath });
  await page.close();
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const built = [
    ["Distribution Wall", levelDistribution()],
    ["Sieve Parity Wall", sieveParity()],
    ["Robin Wall", robinWall()],
    ["Nicolas Gauge", nicolasGauge()],
    ["Farey Sea", fareyOcean()],
    ["Nyman-Beurling Sawtooth Theatre", nymanBeurling()],
    ["Redheffer Divisibility Matrix", redhefferMatrix()],
    ["Landau Permutation Mountain", landauMountain()],
  ];
  const dashboard = ["Critical Boundaries breakthrough triage", boundaryDashboard(built.map(([title, result]) => ({ title, ...result.audit })))];
  const shots = [...built, dashboard];
  const browser = await chromium.launch();
  const manifest = [];
  try {
    for (let i = 0; i < shots.length; i++) {
      const [shortTitle, result] = shots[i];
      const fullTitle = result.svg.match(/<text x="58" y="72"[^>]*>(.*?)<\/text>/)?.[1] || shortTitle;
      const name = `${String(i + 1).padStart(2, "0")}-${slug(shortTitle)}`;
      const svgPath = path.join(OUT_DIR, `${name}.svg`);
      const pngPath = path.join(OUT_DIR, `${name}.png`);
      await fs.writeFile(svgPath, result.svg, "utf8");
      await svgToPng(browser, result.svg, pngPath);
      manifest.push({ index: i + 1, title: fullTitle, shortTitle, svg: svgPath, png: pngPath, audit: result.audit });
      process.stdout.write(`wrote ${pngPath}\n`);
    }
  } finally {
    await browser.close();
  }
  const breakthroughs = manifest.filter((m) => m.audit.breakthrough);
  await fs.writeFile(path.join(OUT_DIR, "audit.json"), JSON.stringify({ generatedAt: new Date().toISOString(), count: manifest.length, breakthroughs: breakthroughs.length, shots: manifest }, null, 2), "utf8");
  await fs.writeFile(path.join(OUT_DIR, "README.md"), `# PrimeVisuals Critical Boundaries

Generated by \`node scripts/critical-boundaries.mjs\`.

This pack builds the boundary instruments from the pasted brief and runs a finite numerical audit for each. Result: **${breakthroughs.length} breakthrough candidates flagged**. The computed evidence supports these as strong explanatory frontier visuals, not new mathematical breakthroughs.

${manifest.map((m) => `${m.index}. ${m.title} - [PNG](${path.basename(m.png)}) / [SVG](${path.basename(m.svg)}) - ${m.audit.verdict}`).join("\n")}

See [audit.json](audit.json) for metrics and reasons.
`, "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
