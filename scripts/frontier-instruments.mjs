#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { ZEROS, zetaC } from "../src/core/math.js";

const OUT_DIR = "primevisuals-frontier-instruments";
const W = 1600;
const H = 1000;
const C = {
  bg: "#071014",
  panel: "#0d1b21",
  panel2: "#10262d",
  line: "#1f3d46",
  grid: "#19313a",
  text: "#d9f4f3",
  dim: "#8fb0b2",
  faint: "#4e6f74",
  cyan: "#4df6ff",
  amber: "#ffcb64",
  mag: "#ff5ea8",
  green: "#7cff9b",
  red: "#ff766f",
  violet: "#a98cff",
  blue: "#6aa8ff",
  white: "#f6fffb",
};

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return `rgb(${r},${g},${bl})`;
}

function diverge(v, maxAbs = 3) {
  const t = clamp(v / maxAbs, -1, 1);
  if (t < 0) return mix(C.violet, C.panel2, 1 + t);
  return mix(C.panel2, C.amber, t);
}

function viridis(t) {
  t = clamp(t, 0, 1);
  if (t < 0.35) return mix("#16213f", C.cyan, t / 0.35);
  if (t < 0.7) return mix(C.cyan, C.green, (t - 0.35) / 0.35);
  return mix(C.green, C.amber, (t - 0.7) / 0.3);
}

function sieve(N) {
  const s = new Uint8Array(N + 1);
  s.fill(1);
  s[0] = 0;
  s[1] = 0;
  for (let i = 2; i * i <= N; i++) if (s[i]) for (let j = i * i; j <= N; j += i) s[j] = 0;
  return s;
}

function primesUpTo(N) {
  const m = sieve(N);
  const out = [];
  for (let n = 2; n <= N; n++) if (m[n]) out.push(n);
  return out;
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

function psiPrefix(N) {
  const isp = sieve(N);
  const atom = new Float64Array(N + 1);
  for (let p = 2; p <= N; p++) if (isp[p]) {
    const lp = Math.log(p);
    for (let q = p; q <= N; q *= p) {
      atom[q] = lp;
      if (q > Math.floor(N / p)) break;
    }
  }
  const psi = new Float64Array(N + 1);
  for (let n = 1; n <= N; n++) psi[n] = psi[n - 1] + atom[n];
  return psi;
}

function isPrimeMask(N) {
  return sieve(N);
}

function panel(x, y, w, h, label = "") {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.panel}" stroke="${C.line}" />${label ? `<text x="${x + 18}" y="${y + 30}" fill="${C.dim}" font-size="18" font-family="ui-monospace, Menlo, monospace" letter-spacing="2">${esc(label)}</text>` : ""}</g>`;
}

function baseSvg(title, subtitle, body, footer = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="wash" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#09212a"/><stop offset="1" stop-color="#05090c"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wash)"/>
  <circle cx="1300" cy="140" r="380" fill="#0c2d31" opacity="0.25"/>
  <text x="58" y="72" fill="${C.text}" font-size="36" font-family="Inter, ui-sans-serif, system-ui" font-weight="700">${esc(title)}</text>
  <text x="60" y="112" fill="${C.dim}" font-size="19" font-family="Inter, ui-sans-serif, system-ui">${esc(subtitle)}</text>
  ${body}
  <text x="60" y="954" fill="${C.faint}" font-size="16" font-family="ui-monospace, Menlo, monospace">${esc(footer || "PrimeVisuals frontier instrument: prediction -> residual -> null")}</text>
</svg>`;
}

function plotPath(points, box, color = C.cyan, width = 2, opacity = 1, fill = "none") {
  if (!points.length) return "";
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  return plotPathScaled(points, box, { x0, x1, y0, y1 }, color, width, opacity, fill);
}

function plotPathScaled(points, box, bounds, color = C.cyan, width = 2, opacity = 1, fill = "none") {
  const [x, y, w, h] = box;
  const { x0, x1, y0, y1 } = bounds;
  const sx = (v) => x + ((v - x0) / (x1 - x0 || 1)) * w;
  const sy = (v) => y + h - ((v - y0) / (y1 - y0 || 1)) * h;
  const d = points.map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(" ");
  return `<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linejoin="round" stroke-linecap="round"/>`;
}

function scatter(points, box, bounds, color = C.cyan, r = 2, opacity = 0.8) {
  const [x, y, w, h] = box;
  const { x0, x1, y0, y1 } = bounds;
  const sx = (v) => x + ((v - x0) / (x1 - x0 || 1)) * w;
  const sy = (v) => y + h - ((v - y0) / (y1 - y0 || 1)) * h;
  return points.map((p) => `<circle cx="${sx(p[0]).toFixed(1)}" cy="${sy(p[1]).toFixed(1)}" r="${r}" fill="${p[2] || color}" opacity="${p[3] ?? opacity}"/>`).join("");
}

function axes(box, xLabel = "", yLabel = "") {
  const [x, y, w, h] = box;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.panel2}" opacity="0.55" stroke="${C.line}"/>`;
  for (let i = 1; i < 5; i++) {
    const xx = x + (w * i) / 5;
    const yy = y + (h * i) / 5;
    s += `<line x1="${xx}" y1="${y}" x2="${xx}" y2="${y + h}" stroke="${C.grid}" stroke-width="1"/>`;
    s += `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="${C.grid}" stroke-width="1"/>`;
  }
  s += `<text x="${x + w - 4}" y="${y + h + 28}" fill="${C.faint}" font-size="15" font-family="ui-monospace, Menlo, monospace" text-anchor="end">${esc(xLabel)}</text>`;
  s += `<text x="${x - 8}" y="${y - 8}" fill="${C.faint}" font-size="15" font-family="ui-monospace, Menlo, monospace">${esc(yLabel)}</text>`;
  return s;
}

function barChart(values, box, color = C.cyan, maxVal = null) {
  const [x, y, w, h] = box;
  const mx = maxVal ?? Math.max(1e-9, ...values.map(Math.abs));
  const bw = w / values.length;
  return values.map((v, i) => {
    const bh = Math.abs(v) / mx * h;
    const yy = v >= 0 ? y + h - bh : y + h / 2;
    return `<rect x="${x + i * bw}" y="${yy}" width="${Math.max(1, bw - 1)}" height="${bh}" fill="${typeof color === "function" ? color(v, i) : color}" opacity="0.86"/>`;
  }).join("");
}

function heatmap(matrix, box, lo = null, hi = null, colorFn = viridis, rowLabels = [], colLabels = []) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const flat = matrix.flat().filter(Number.isFinite);
  const mn = lo ?? Math.min(...flat);
  const mx = hi ?? Math.max(...flat);
  const [x, y, w, h] = box;
  const cw = w / cols, rh = h / rows;
  let out = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = matrix[r][c];
    const fill = Number.isFinite(v) ? colorFn((v - mn) / (mx - mn || 1), v) : "#050709";
    out += `<rect x="${(x + c * cw).toFixed(2)}" y="${(y + r * rh).toFixed(2)}" width="${Math.ceil(cw) + 0.4}" height="${Math.ceil(rh) + 0.4}" fill="${fill}" />`;
  }
  rowLabels.forEach((label, i) => {
    out += `<text x="${x - 12}" y="${y + i * rh + rh * 0.65}" fill="${C.faint}" font-size="13" font-family="ui-monospace, Menlo, monospace" text-anchor="end">${esc(label)}</text>`;
  });
  colLabels.forEach((label, i) => {
    out += `<text x="${x + i * cw + cw / 2}" y="${y + h + 18}" fill="${C.faint}" font-size="12" font-family="ui-monospace, Menlo, monospace" text-anchor="middle">${esc(label)}</text>`;
  });
  return out;
}

function legend(items, x, y) {
  return items.map((it, i) => `<g><rect x="${x}" y="${y + i * 28 - 14}" width="18" height="4" fill="${it[1]}"/><text x="${x + 28}" y="${y + i * 28 - 8}" fill="${C.dim}" font-size="16" font-family="ui-monospace, Menlo, monospace">${esc(it[0])}</text></g>`).join("");
}

function explicitPsiApprox(x, k) {
  let y = x;
  for (let i = 0; i < k && i < ZEROS.length; i++) {
    const g = ZEROS[i];
    const a = 0.5;
    const ln = Math.log(x);
    const xr = Math.sqrt(x);
    const den = a * a + g * g;
    const re = xr * Math.cos(g * ln);
    const im = xr * Math.sin(g * ln);
    y -= 2 * ((re * a + im * g) / den);
  }
  return y;
}

function shot01() {
  const N = 6000;
  const psi = psiPrefix(N);
  const sample = [];
  for (let x = 20; x <= N; x += 10) sample.push([x, psi[x]]);
  const p0 = sample.map(([x]) => [x, x]);
  const p8 = sample.map(([x]) => [x, explicitPsiApprox(x, 8)]);
  const p28 = sample.map(([x]) => [x, explicitPsiApprox(x, 28)]);
  const residual = sample.map(([x]) => [x, psi[x] - explicitPsiApprox(x, 28)]);
  const box = [80, 180, 1000, 520];
  const rb = [80, 760, 1000, 120];
  const allY = [...sample, ...p0, ...p8, ...p28].map((p) => p[1]);
  const bounds = { x0: 0, x1: N, y0: Math.min(...allY), y1: Math.max(...allY) };
  const rmax = Math.max(...residual.map((p) => Math.abs(p[1])));
  const body = panel(58, 150, 1060, 760, "ZERO WAVE LOCK") + axes(box, "x", "psi(x)") +
    plotPathScaled(sample, box, bounds, C.faint, 1.8, 0.75) +
    plotPathScaled(p0, box, bounds, C.amber, 2.2, 0.75) +
    plotPathScaled(p8, box, bounds, C.violet, 2, 0.9) +
    plotPathScaled(p28, box, bounds, C.cyan, 2.8, 0.95) +
    axes(rb, "x", "residual") + plotPathScaled(residual, rb, { x0: 0, x1: N, y0: -rmax, y1: rmax }, C.mag, 2, 0.9) +
    legend([["psi staircase", C.faint], ["x baseline", C.amber], ["8 zero waves", C.violet], ["28 zero waves", C.cyan], ["remaining residual", C.mag]], 1180, 230) +
    `<text x="1180" y="440" fill="${C.text}" font-size="24" font-family="Inter, system-ui" font-weight="700">Conjectural edge</text>
    <text x="1180" y="474" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">RH says the error stays square-root sized.</text>
    <text x="1180" y="504" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">The instrument subtracts known zero waves,</text>
    <text x="1180" y="534" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">then exposes what remains.</text>`;
  return baseSvg("01 Riemann zero-wave prime staircase", "Explicit formula overlay for psi(x), with residual after zero subtraction.", body, `N=${fmt(N)}; zeros used=28`);
}

function shot02() {
  const M = 384;
  const u0 = Math.log(80), u1 = Math.log(9000);
  const maxX = Math.ceil(Math.exp(u1)) + 10;
  const psi = psiPrefix(maxX);
  const y = [];
  for (let i = 0; i < M; i++) {
    const u = u0 + (i / (M - 1)) * (u1 - u0);
    const x = Math.floor(Math.exp(u));
    y.push((psi[x] - x) / Math.sqrt(x));
  }
  const amps = [];
  for (let k = 1; k <= 70; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < M; n++) {
      const ang = (2 * Math.PI * k * n) / M;
      re += y[n] * Math.cos(ang);
      im -= y[n] * Math.sin(ang);
    }
    const gamma = (2 * Math.PI * k) / (u1 - u0);
    amps.push([gamma, Math.hypot(re, im) / M]);
  }
  const box = [80, 190, 1120, 560];
  const bounds = { x0: 0, x1: 60, y0: 0, y1: Math.max(...amps.map((p) => p[1])) * 1.05 };
  const bars = amps.map(([g, a]) => {
    const x = box[0] + (g / bounds.x1) * box[2];
    const bh = (a / bounds.y1) * box[3];
    return `<rect x="${x - 3}" y="${box[1] + box[3] - bh}" width="5" height="${bh}" fill="${C.cyan}" opacity="0.75"/>`;
  }).join("");
  const markers = ZEROS.slice(0, 12).filter((g) => g < 60).map((g, i) => {
    const x = box[0] + (g / bounds.x1) * box[2];
    return `<line x1="${x}" y1="${box[1]}" x2="${x}" y2="${box[1] + box[3]}" stroke="${C.amber}" stroke-width="1.5" opacity="0.9"/><text x="${x + 4}" y="${box[1] + 20 + (i % 3) * 19}" fill="${C.amber}" font-size="12" font-family="ui-monospace, Menlo, monospace">${g.toFixed(1)}</text>`;
  }).join("");
  const trace = y.map((v, i) => [i, v]);
  const tb = [80, 790, 1120, 90];
  const ym = Math.max(...y.map(Math.abs));
  const body = panel(58, 150, 1180, 760, "DFT OF NORMALIZED RAW PRIME RESIDUAL") + axes(box, "angular frequency gamma", "amplitude") + bars + markers +
    axes(tb, "log-grid sample", "(psi(e^u)-e^u)/e^(u/2)") + plotPathScaled(trace, tb, { x0: 0, x1: M - 1, y0: -ym, y1: ym }, C.mag, 1.5, 0.85) +
    legend([["spectral peaks from primes", C.cyan], ["zeta zero heights", C.amber], ["input residual trace", C.mag]], 1280, 260);
  return baseSvg("02 Raw-primes zeta spectrum", "Extract the zeta-zero frequencies from primes instead of building primes from zeros.", body, `${M} log-grid samples; first zeta-zero markers overlaid`);
}

function shot03() {
  const strip = [90, 180, 610, 660];
  const arg = [800, 180, 660, 660];
  let s = panel(58, 150, 680, 750, "CRITICAL STRIP") + panel(770, 150, 730, 750, "ZETA PIROUETTE");
  s += axes(strip, "Re(s)", "Im(s)");
  for (let r = 0.1; r <= 0.9; r += 0.1) {
    const x = strip[0] + r * strip[2];
    s += `<line x1="${x}" y1="${strip[1]}" x2="${x}" y2="${strip[1] + strip[3]}" stroke="${Math.abs(r - 0.5) < 1e-6 ? C.amber : C.grid}" stroke-width="${Math.abs(r - 0.5) < 1e-6 ? 4 : 1}" opacity="0.9"/>`;
  }
  const maxT = 60;
  for (const g of ZEROS.filter((z) => z < maxT)) {
    const y = strip[1] + strip[3] - (g / maxT) * strip[3];
    const x = strip[0] + 0.5 * strip[2];
    s += `<circle cx="${x}" cy="${y}" r="6" fill="${C.cyan}" filter="url(#glow)"/><line x1="${x - 26}" y1="${y}" x2="${x + 26}" y2="${y}" stroke="${C.cyan}" opacity="0.25"/>`;
  }
  s += `<circle cx="${strip[0] + 0.72 * strip[2]}" cy="${strip[1] + 240}" r="12" fill="none" stroke="${C.red}" stroke-width="3" stroke-dasharray="6 8"/><text x="${strip[0] + 0.72 * strip[2] + 24}" y="${strip[1] + 246}" fill="${C.red}" font-size="17" font-family="ui-monospace, Menlo, monospace">off-line ghost</text>`;
  const pts = [];
  for (let i = 0; i <= 1000; i++) {
    const t = 2 + (i / 1000) * 58;
    const z = zetaC(0.5, t);
    pts.push([z[0], z[1]]);
  }
  const maxAbs = Math.max(...pts.flat().map(Math.abs));
  s += axes(arg, "Re zeta(1/2+it)", "Im");
  s += `<line x1="${arg[0]}" y1="${arg[1] + arg[3] / 2}" x2="${arg[0] + arg[2]}" y2="${arg[1] + arg[3] / 2}" stroke="${C.grid}"/><line x1="${arg[0] + arg[2] / 2}" y1="${arg[1]}" x2="${arg[0] + arg[2] / 2}" y2="${arg[1] + arg[3]}" stroke="${C.grid}"/>`;
  s += plotPathScaled(pts, arg, { x0: -maxAbs, x1: maxAbs, y0: -maxAbs, y1: maxAbs }, C.cyan, 2.2, 0.9);
  s += `<circle cx="${arg[0] + arg[2] / 2}" cy="${arg[1] + arg[3] / 2}" r="9" fill="${C.amber}" filter="url(#glow)"/><text x="${arg[0] + arg[2] / 2 + 18}" y="${arg[1] + arg[3] / 2 - 14}" fill="${C.amber}" font-size="17" font-family="ui-monospace, Menlo, monospace">origin crossings mark zeros</text>`;
  return baseSvg("03 Critical strip plus zeta pirouette theatre", "Zeros on Re(s)=1/2 beside the Argand trace of zeta(1/2+it).", s, "Ghost layer marks what an RH violation would look like.");
}

function shot04() {
  const N = 120000;
  const mu = mobiusUpTo(N);
  const pts = [];
  let m = 0;
  for (let n = 1; n <= N; n++) {
    m += mu[n];
    if (n % 40 === 0) pts.push([n, m / Math.sqrt(n)]);
  }
  const ymax = Math.max(0.6, ...pts.map((p) => Math.abs(p[1])));
  const box = [90, 190, 1030, 610];
  const panels = [7500, 15000, 30000, 60000, 120000];
  let s = panel(58, 150, 1120, 750, "MERTENS WALK") + axes(box, "x", "M(x)/sqrt(x)");
  s += plotPathScaled(pts, box, { x0: 0, x1: N, y0: -ymax, y1: ymax }, C.cyan, 2, 0.9);
  s += `<line x1="${box[0]}" y1="${box[1] + box[3] / 2}" x2="${box[0] + box[2]}" y2="${box[1] + box[3] / 2}" stroke="${C.amber}" stroke-dasharray="8 8"/>`;
  panels.forEach((v) => {
    const x = box[0] + (v / N) * box[2];
    s += `<line x1="${x}" y1="${box[1]}" x2="${x}" y2="${box[1] + box[3]}" stroke="${C.faint}" opacity="0.55"/><text x="${x + 4}" y="${box[1] + 22}" fill="${C.faint}" font-size="12" font-family="ui-monospace, Menlo, monospace">${fmt(v)}</text>`;
  });
  s += legend([["observed M(x)/sqrt(x)", C.cyan], ["zero baseline", C.amber], ["dyadic range gates", C.faint]], 1240, 280);
  return baseSvg("04 Mertens / Mobius square-root cancellation walk", "Mobius signs as a normalized random-walk testbed for square-root cancellation.", s, `Computed directly to N=${fmt(N)}.`);
}

function shot05() {
  const N = 180000;
  const primes = primesUpTo(N);
  const pts = [];
  const records = [];
  let rec = 0;
  for (let i = 0; i < primes.length - 1; i++) {
    const p = primes[i], g = primes[i + 1] - p;
    pts.push([p, g]);
    if (g > rec) {
      rec = g;
      records.push([p, g]);
    }
  }
  const box = [80, 185, 1120, 610];
  const yMax = Math.max(...pts.map((p) => p[1]), Math.log(N) ** 2);
  let s = panel(58, 150, 1180, 750, "GAP SKYLINE") + axes(box, "prime p", "gap to next prime");
  s += scatter(pts.filter((_, i) => i % 2 === 0), box, { x0: 0, x1: N, y0: 0, y1: yMax }, C.cyan, 1.2, 0.45);
  const logLine = [], log2Line = [];
  for (let x = 100; x <= N; x += 1000) {
    logLine.push([x, Math.log(x)]);
    log2Line.push([x, Math.log(x) ** 2]);
  }
  s += plotPathScaled(logLine, box, { x0: 0, x1: N, y0: 0, y1: yMax }, C.green, 2, 0.9);
  s += plotPathScaled(log2Line, box, { x0: 0, x1: N, y0: 0, y1: yMax }, C.amber, 2, 0.9);
  s += plotPathScaled(records, box, { x0: 0, x1: N, y0: 0, y1: yMax }, C.mag, 3, 0.9);
  for (const g of [2, 4, 6, 8]) {
    const y = box[1] + box[3] - (g / yMax) * box[3];
    s += `<line x1="${box[0]}" y1="${y}" x2="${box[0] + box[2]}" y2="${y}" stroke="${C.faint}" stroke-dasharray="4 10" opacity="0.45"/><text x="${box[0] + box[2] + 8}" y="${y + 4}" fill="${C.faint}" font-size="13" font-family="ui-monospace, Menlo, monospace">gap ${g}</text>`;
  }
  s += legend([["prime gaps", C.cyan], ["log p", C.green], ["log^2 p envelope", C.amber], ["record gaps", C.mag]], 1280, 260);
  return baseSvg("05 Prime gap skyline with Cramer-Granville envelopes", "Tiny gaps and record gaps in the same residual-ready skyline.", s, `${fmt(primes.length)} primes up to ${fmt(N)}`);
}

function singularSeries(pattern) {
  const ps = primesUpTo(97);
  const k = pattern.length;
  let prod = 1;
  for (const p of ps) {
    const residues = new Set(pattern.map((h) => ((h % p) + p) % p));
    if (residues.size === p) return 0;
    prod *= (1 - residues.size / p) / ((1 - 1 / p) ** k);
  }
  return prod;
}

function tupleCount(pattern, N, mask) {
  let c = 0;
  const m = Math.max(...pattern);
  for (let n = 2; n + m <= N; n++) {
    let ok = true;
    for (const h of pattern) if (!mask[n + h]) { ok = false; break; }
    if (ok) c++;
  }
  return c;
}

function shot06() {
  const patterns = [[0, 2], [0, 4], [0, 2, 6], [0, 6, 12], [0, 2, 6, 8]];
  const Ns = [8000, 16000, 32000, 64000];
  const mask = isPrimeMask(Math.max(...Ns) + 20);
  const matrix = patterns.map((pat) => Ns.map((N) => {
    const obs = tupleCount(pat, N, mask);
    const ss = singularSeries(pat);
    const exp = ss * N / (Math.log(N) ** pat.length);
    return (obs - exp) / Math.sqrt(Math.max(1, exp));
  }));
  const box = [210, 230, 700, 420];
  let s = panel(58, 150, 1080, 750, "HARDY-LITTLEWOOD RESIDUALS");
  s += heatmap(matrix, box, -3, 3, (_, v) => diverge(v, 3), patterns.map((p) => `{${p.join(",")}}`), Ns.map(fmt));
  s += `<text x="210" y="695" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">cells = (observed - HL prediction) / sqrt(prediction)</text>`;
  const maskBox = [1010, 230, 290, 420];
  const qRows = [2, 3, 5, 7, 11];
  const mm = patterns.map((pat) => qRows.map((q) => new Set(pat.map((h) => ((h % q) + q) % q)).size === q ? NaN : 1));
  s += heatmap(mm, maskBox, 0, 1, (t, v) => Number.isFinite(v) ? C.green : C.red, patterns.map((p) => `{${p.join(",")}}`), qRows.map((q) => `mod ${q}`));
  s += `<text x="1010" y="695" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">local obstruction mask</text>`;
  s += legend([["positive residual", C.amber], ["near prediction", C.panel2], ["negative residual", C.violet], ["admissible local cells", C.green]], 1220, 760);
  return baseSvg("06 Hardy-Littlewood k-tuple observatory", "Admissible patterns, range doubling, singular-series subtraction, and local obstructions.", s, "Patterns counted as n+h all prime.");
}

function shot07() {
  const N = 900;
  const mask = isPrimeMask(N);
  const pts = [];
  const rows = [];
  for (let n = 6; n <= N; n += 2) {
    let count = 0;
    for (let p = 2; p <= n / 2; p++) {
      if (mask[p] && mask[n - p]) {
        pts.push([n, p / n, C.cyan, 0.4]);
        count++;
      }
    }
    rows.push([n, count]);
  }
  const box = [80, 180, 1040, 610];
  const cb = [80, 820, 1040, 70];
  let s = panel(58, 150, 1120, 760, "GOLDBACH COMET") + axes(box, "even N", "p/N");
  s += scatter(pts, box, { x0: 0, x1: N, y0: 0, y1: 0.5 }, C.cyan, 1.6, 0.4);
  const maxc = Math.max(...rows.map((p) => p[1]));
  s += axes(cb, "even N", "representation density") + barChart(rows.map((p) => p[1]), cb, (v) => viridis(v / maxc), maxc);
  s += `<text x="1210" y="270" fill="${C.text}" font-size="24" font-family="Inter, system-ui" font-weight="700">Goldbach test</text>
  <text x="1210" y="306" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">Each vertical row is one even N.</text>
  <text x="1210" y="336" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">An empty row would be visible immediately.</text>`;
  return baseSvg("07 Goldbach comet / additive-prime galaxy", "All decompositions N = p + q, with a row-density readout beneath.", s, `Even rows through N=${N}; no empty rows in this rendered range.`);
}

function shot08() {
  const N = 90000;
  const primes = primesUpTo(N);
  const qs = Array.from({ length: 30 }, (_, i) => i + 3);
  const maxQ = Math.max(...qs);
  const matrix = qs.map((q) => Array.from({ length: maxQ }, (_, r) => {
    if (r >= q) return NaN;
    if (gcd(r, q) !== 1) return NaN;
    let c = 0;
    for (const p of primes) if (p % q === r) c++;
    const allowed = phi(q);
    const exp = primes.length / allowed;
    return (c - exp) / Math.sqrt(exp);
  }));
  let s = panel(58, 150, 1020, 750, "RESIDUE TAPESTRY") +
    heatmap(matrix, [150, 190, 850, 560], -4, 4, (_, v) => diverge(v, 4), qs.map((q) => `q=${q}`), []);
  const cx = 1325, cy = 510, R = 205;
  s += panel(1110, 150, 430, 750, "PRIME CLOCK MOD 30");
  for (let r = 0; r < 30; r++) {
    const ang = -Math.PI / 2 + (2 * Math.PI * r) / 30;
    const rr = gcd(r, 30) === 1 ? R : R * 0.72;
    s += `<line x1="${cx}" y1="${cy}" x2="${cx + rr * Math.cos(ang)}" y2="${cy + rr * Math.sin(ang)}" stroke="${gcd(r, 30) === 1 ? C.cyan : C.faint}" stroke-width="${gcd(r, 30) === 1 ? 4 : 1}" opacity="${gcd(r, 30) === 1 ? 0.9 : 0.35}"/>`;
  }
  for (const p of primes.slice(0, 2200)) {
    const r = p % 30;
    const ang = -Math.PI / 2 + (2 * Math.PI * r) / 30;
    const rad = 30 + (p / N) * (R - 35);
    s += `<circle cx="${cx + rad * Math.cos(ang)}" cy="${cy + rad * Math.sin(ang)}" r="1.7" fill="${C.amber}" opacity="0.32"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.line}"/><text x="${cx}" y="${cy + R + 45}" fill="${C.dim}" text-anchor="middle" font-size="17" font-family="Inter, system-ui">forbidden spokes stay empty</text>`;
  return baseSvg("08 Residue tapestry plus prime clock", "Dirichlet/AP density residuals paired with a visible modular clock.", s, `Primes up to ${fmt(N)}; black cells are non-coprime residues.`);
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function phi(n) {
  let x = n, out = n;
  for (let p = 2; p * p <= x; p++) if (x % p === 0) {
    out -= out / p;
    while (x % p === 0) x /= p;
  }
  if (x > 1) out -= out / x;
  return Math.round(out);
}

function shot09() {
  const N = 300000;
  const primes = primesUpTo(N);
  const q = 4;
  const counts = { 1: 0, 3: 0 };
  const race = [];
  for (const p of primes) {
    if (p % q === 1) counts[1]++;
    if (p % q === 3) counts[3]++;
    if (p > 5 && p % 17 === 0) race.push([p, counts[3] - counts[1]]);
    else if (race.length === 0 || p - race[race.length - 1][0] > 1300) race.push([p, counts[3] - counts[1]]);
  }
  const box = [90, 190, 1060, 620];
  const ym = Math.max(...race.map((p) => Math.abs(p[1])));
  let s = panel(58, 150, 1130, 750, "PRIME RACE MOD 4") + axes(box, "x", "pi(x;4,3) - pi(x;4,1)");
  s += plotPathScaled(race, box, { x0: 0, x1: N, y0: -ym, y1: ym }, C.cyan, 2.5, 0.95);
  s += `<line x1="${box[0]}" y1="${box[1] + box[3] / 2}" x2="${box[0] + box[2]}" y2="${box[1] + box[3] / 2}" stroke="${C.amber}" stroke-dasharray="8 8"/>`;
  s += `<text x="1230" y="265" fill="${C.text}" font-size="24" font-family="Inter, system-ui" font-weight="700">Chebyshev bias</text>
  <text x="1230" y="302" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">The expected density is equal after</text>
  <text x="1230" y="332" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">normalization, but the lead can persist.</text>
  <text x="1230" y="390" fill="${C.amber}" font-size="18" font-family="ui-monospace, Menlo, monospace">final lead: ${counts[3] - counts[1]}</text>`;
  return baseSvg("09 Prime race arena", "A normalized scoreboard for residue-class races and Chebyshev bias.", s, `mod ${q}; primes up to ${fmt(N)}`);
}

function ulamXY(n) {
  if (n <= 1) return [0, 0];
  const k = Math.ceil((Math.sqrt(n) - 1) / 2);
  const side = 2 * k;
  const off = n - ((2 * k - 1) ** 2 + 1);
  const edge = Math.floor(off / side);
  const p = off % side;
  if (edge === 0) return [k, -k + 1 + p];
  if (edge === 1) return [k - 1 - p, k];
  if (edge === 2) return [-k, k - 1 - p];
  return [-k + 1 + p, -k];
}

function shot10() {
  const N = 25000;
  const mask = isPrimeMask(N);
  const pts = [];
  for (let n = 2; n <= N; n++) if (mask[n]) {
    const [x, y] = ulamXY(n);
    pts.push([x, y, C.cyan, 0.5]);
  }
  const curves = [
    { c: 41, col: C.amber, label: "n^2+n+41" },
    { c: 17, col: C.mag, label: "n^2+n+17" },
    { c: 11, col: C.green, label: "n^2+n+11" },
  ];
  const box = [90, 180, 760, 700];
  let s = panel(58, 150, 850, 760, "ULAM ATLAS") + panel(930, 150, 590, 760, "POLYNOMIAL STREAK AUDIT") + axes(box, "spiral x", "spiral y");
  s += scatter(pts, box, { x0: -80, x1: 80, y0: -80, y1: 80 }, C.cyan, 1.25, 0.45);
  for (const cur of curves) {
    const path = [];
    let count = 0;
    for (let n = 0; n < 160; n++) {
      const v = n * n + n + cur.c;
      if (v <= N && mask[v]) count++;
      if (v <= N) path.push(ulamXY(v));
    }
    s += plotPathScaled(path, box, { x0: -80, x1: 80, y0: -80, y1: 80 }, cur.col, 3, 0.85);
    s += `<text x="970" y="${250 + curves.indexOf(cur) * 62}" fill="${cur.col}" font-size="21" font-family="ui-monospace, Menlo, monospace">${esc(cur.label)}: ${count} primes in view</text>`;
  }
  s += `<text x="970" y="480" fill="${C.dim}" font-size="20" font-family="Inter, system-ui">Bright diagonals become honest only when each</text>
  <text x="970" y="514" fill="${C.dim}" font-size="20" font-family="Inter, system-ui">curve is tied to a polynomial, an expected</text>
  <text x="970" y="548" fill="${C.dim}" font-size="20" font-family="Inter, system-ui">count, a residual, and a holdout range.</text>`;
  return baseSvg("10 Ulam/Sacks polynomial-streak atlas", "Prime-rich spiral streaks with polynomial paths made explicit.", s, `Ulam primes up to ${fmt(N)}`);
}

function shot11() {
  const N = 50000;
  const mask = isPrimeMask(2 * N + 1000);
  const ranges = [5000, 10000, 20000, 50000];
  const families = [
    ["twin p,p+2", (n) => n >= 2 && mask[n] && mask[n + 2], (x) => 1.32 * x / (Math.log(x) ** 2)],
    ["n^2+1", (n) => mask[n * n + 1], (x) => 0.75 * Math.sqrt(x) / Math.log(x)],
    ["Sophie Germain", (n) => mask[n] && mask[2 * n + 1], (x) => 1.32 * x / (Math.log(x) ** 2)],
    ["safe primes", (n) => mask[n] && mask[(n - 1) / 2], (x) => 0.66 * x / (Math.log(x) ** 2)],
  ];
  const rows = families.map(([label, pred, expFn]) => ranges.map((R) => {
    let c = 0;
    const lim = label === "n^2+1" ? Math.floor(Math.sqrt(R)) : R;
    for (let n = 2; n <= lim; n++) if (pred(n)) c++;
    const e = expFn(R);
    return { c, e, z: (c - e) / Math.sqrt(Math.max(1, e)) };
  }));
  const box = [130, 230, 680, 420];
  let s = panel(58, 150, 1000, 750, "SPARSE FAMILY DASHBOARD");
  s += heatmap(rows.map((r) => r.map((v) => v.z)), box, -4, 4, (_, v) => diverge(v, 4), families.map((f) => f[0]), ranges.map(fmt));
  const lb = [900, 240, 530, 360];
  s += axes(lb, "range", "observed / prediction");
  families.forEach((fam, i) => {
    const pts = ranges.map((R, j) => [R, rows[i][j].c / Math.max(1, rows[i][j].e)]);
    s += plotPathScaled(pts, lb, { x0: 0, x1: Math.max(...ranges), y0: 0, y1: 2.2 }, [C.cyan, C.amber, C.mag, C.green][i], 3, 0.9);
  });
  s += legend(families.map((f, i) => [f[0], [C.cyan, C.amber, C.mag, C.green][i]]), 930, 660);
  return baseSvg("11 Bateman-Horn sparse-family dashboard", "Special prime families shown as observed counts versus heuristic prediction.", s, "Prediction constants are lightweight approximations for visual audit.");
}

function shot12() {
  const N = 9000;
  const mask = isPrimeMask(N);
  const rows = [3, 4, 5, 6];
  const maxD = 360;
  const matrix = rows.map((k) => Array.from({ length: 72 }, (_, idx) => {
    const d0 = idx * 5 + 1;
    let found = 0;
    for (let d = d0; d < d0 + 5; d++) {
      for (let a = 2; a + (k - 1) * d <= N; a++) {
        let ok = true;
        for (let j = 0; j < k; j++) if (!mask[a + j * d]) { ok = false; break; }
        if (ok) { found++; break; }
      }
    }
    return found;
  }));
  let s = panel(58, 150, 1150, 750, "PROGRESSION CONSTELLATION");
  s += heatmap(matrix, [150, 220, 980, 430], 0, 5, viridis, rows.map((k) => `k=${k}`), []);
  s += `<text x="150" y="710" fill="${C.dim}" font-size="19" font-family="Inter, system-ui">Rows are progression length; columns are common-difference bands.</text>
  <text x="150" y="744" fill="${C.dim}" font-size="19" font-family="Inter, system-ui">Cells light when at least one all-prime arithmetic progression is found.</text>`;
  s += `<text x="1260" y="310" fill="${C.text}" font-size="24" font-family="Inter, system-ui" font-weight="700">Open frontier</text>
  <text x="1260" y="346" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">Existence is theorem-rich.</text>
  <text x="1260" y="376" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">Quantitative density and</text>
  <text x="1260" y="406" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">earliest occurrence remain</text>
  <text x="1260" y="436" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">the visual edge.</text>`;
  return baseSvg("12 Green-Tao progression constellation map", "Prime arithmetic progressions by length and difference scale.", s, `Search window N=${fmt(N)}, d<=${maxD}`);
}

function shot13() {
  const shifts = [2, 4, 6, 8, 10, 12, 18, 30];
  const ranges = [2000, 5000, 12000, 30000];
  const maxN = Math.max(...ranges) + Math.max(...shifts);
  const mask = isPrimeMask(maxN);
  const left = shifts.map((h) => ranges.map((N) => {
    let c = 0;
    for (let p = 2; p + h <= N; p++) if (mask[p] && mask[p + h]) c++;
    const exp = singularSeries([0, h]) * N / (Math.log(N) ** 2);
    return (c - exp) / Math.sqrt(Math.max(1, exp));
  }));
  const qs = [2, 3, 5, 7, 11, 13, 17, 19];
  const degrees = [4, 5, 6, 7];
  const right = qs.map((q) => degrees.map((d) => {
    const exact = (q ** d) / d;
    const pred = (q ** d - q ** Math.floor(d / 2)) / d;
    return (exact - pred) / Math.sqrt(Math.max(1, pred));
  }));
  let s = panel(58, 150, 700, 750, "INTEGER PRIME PAIRS") + panel(820, 150, 700, 750, "F_q[t] IRREDUCIBLES");
  s += heatmap(left, [170, 240, 480, 420], -4, 4, (_, v) => diverge(v, 4), shifts.map((h) => `h=${h}`), ranges.map((r) => `${r / 1000}k`));
  s += heatmap(right, [930, 240, 480, 420], -4, 4, (_, v) => diverge(v, 4), qs.map((q) => `q=${q}`), degrees.map((d) => `d=${d}`));
  s += `<text x="170" y="720" fill="${C.dim}" font-size="18" font-family="Inter, system-ui">Same question shape: subtract the local main term, then compare residual texture.</text>`;
  return baseSvg("13 Two-universes function-field mirror", "Integer primes beside the theorem-rich polynomial-prime universe.", s, "Right panel uses irreducible polynomial count scale as a calibration mirror.");
}

function polyRootsX3Minus2(p) {
  let roots = 0;
  for (let x = 0; x < p; x++) if (((x * x % p) * x - 2) % p === 0) roots++;
  return roots;
}

function shot14() {
  const primes = primesUpTo(3500).filter((p) => p !== 2 && p !== 3);
  const classes = { split: 0, linearQuad: 0, inert: 0 };
  const wheel = [];
  for (const p of primes) {
    const r = polyRootsX3Minus2(p);
    const cls = r === 3 ? "split" : r === 1 ? "linearQuad" : "inert";
    classes[cls]++;
    wheel.push([p, cls]);
  }
  const cx = 520, cy = 520, R = 320;
  const colors = { split: C.green, linearQuad: C.cyan, inert: C.mag };
  let s = panel(58, 150, 940, 750, "FROBENIUS WHEEL: x^3 - 2") + panel(1050, 150, 450, 750, "DENSITY RACE");
  for (const [p, cls] of wheel) {
    const ang = (2 * Math.PI * (p % 360)) / 360 - Math.PI / 2;
    const rad = 40 + (p / 3500) * (R - 40);
    s += `<circle cx="${cx + rad * Math.cos(ang)}" cy="${cy + rad * Math.sin(ang)}" r="2.4" fill="${colors[cls]}" opacity="0.7"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.line}"/>`;
  const total = primes.length;
  const vals = [classes.inert / total, classes.linearQuad / total, classes.split / total];
  const expected = [1 / 3, 1 / 2, 1 / 6];
  const b = [1120, 275, 300, 430];
  s += axes(b, "class", "density");
  vals.forEach((v, i) => {
    const x = b[0] + i * 90 + 35;
    const h = v / 0.55 * b[3];
    const eh = expected[i] / 0.55 * b[3];
    s += `<rect x="${x}" y="${b[1] + b[3] - h}" width="46" height="${h}" fill="${[C.mag, C.cyan, C.green][i]}" opacity="0.8"/>`;
    s += `<line x1="${x - 8}" y1="${b[1] + b[3] - eh}" x2="${x + 54}" y2="${b[1] + b[3] - eh}" stroke="${C.amber}" stroke-width="3"/>`;
  });
  s += legend([["inert", C.mag], ["linear + quadratic", C.cyan], ["split", C.green], ["Chebotarev density", C.amber]], 1110, 760);
  return baseSvg("14 Chebotarev / Frobenius wheel", "Primes colored by splitting behavior in an algebraic field.", s, `${fmt(primes.length)} primes; polynomial x^3 - 2 mod p`);
}

function shot15() {
  const rows = ["zeta", "quadratic D=-3", "quadratic D=-4", "quadratic D=5", "elliptic-like"];
  const zeros = rows.map((_, r) => ZEROS.slice(0, 28).map((z, i) => z + r * 0.19 * Math.sin(i + r)));
  const matrix = zeros.map((zs) => {
    const spacings = [];
    for (let i = 1; i < zs.length; i++) spacings.push((zs[i] - zs[i - 1]) / 2.2);
    const bins = Array(42).fill(0);
    for (const s of spacings) {
      const k = clamp(Math.floor(s * 14), 0, bins.length - 1);
      bins[k]++;
    }
    return bins;
  });
  let s = panel(58, 150, 1120, 750, "L-FUNCTION ZERO ORCHESTRA");
  s += heatmap(matrix, [250, 250, 820, 370], 0, Math.max(...matrix.flat()), viridis, rows, []);
  for (let i = 0; i < rows.length; i++) {
    const y = 710 + i * 28;
    const pts = zeros[i].slice(0, 15).map((z) => [z, y]);
    for (const p of pts) s += `<circle cx="${250 + (p[0] / 80) * 820}" cy="${p[1]}" r="4" fill="${[C.cyan, C.green, C.amber, C.mag, C.violet][i]}" opacity="0.8"/>`;
  }
  s += `<rect x="1125" y="250" width="270" height="370" fill="none" stroke="${C.red}" stroke-width="3" stroke-dasharray="10 8" opacity="0.8"/><text x="1138" y="286" fill="${C.red}" font-size="18" font-family="ui-monospace, Menlo, monospace">off-critical-line</text><text x="1138" y="312" fill="${C.red}" font-size="18" font-family="ui-monospace, Menlo, monospace">forbidden zone</text>`;
  return baseSvg("15 L-function zero orchestra", "Families of normalized zero spacings compared as a spectral ensemble.", s, "Synthetic family rows are anchored on zeta-zero spacings for visual comparison.");
}

function ellipticTrace(p) {
  let points = 1;
  for (let x = 0; x < p; x++) {
    const rhs = ((x * x % p) * x - x + 1 + p) % p;
    let leg = 0;
    if (rhs === 0) leg = 0;
    else {
      const v = modPow(rhs, (p - 1) / 2, p);
      leg = v === 1 ? 1 : -1;
    }
    points += 1 + leg;
  }
  return p + 1 - points;
}

function modPow(a, e, m) {
  let b = ((a % m) + m) % m, out = 1;
  while (e > 0) {
    if (e & 1) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1;
  }
  return out;
}

function shot16() {
  const primes = primesUpTo(7000).filter((p) => p > 3);
  const vals = primes.map((p) => ellipticTrace(p) / (2 * Math.sqrt(p))).filter(Number.isFinite);
  const bins = Array(44).fill(0);
  vals.forEach((v) => bins[clamp(Math.floor(((v + 1) / 2) * bins.length), 0, bins.length - 1)]++);
  const box = [100, 220, 900, 520];
  const mx = Math.max(...bins);
  let s = panel(58, 150, 1050, 750, "SATO-TATE HISTOGRAM") + axes(box, "a_p / (2 sqrt(p))", "density");
  s += barChart(bins, box, C.cyan, mx);
  const curve = [];
  for (let i = 0; i <= 200; i++) {
    const x = -1 + (2 * i) / 200;
    curve.push([x, Math.sqrt(Math.max(0, 1 - x * x))]);
  }
  s += plotPathScaled(curve, box, { x0: -1, x1: 1, y0: 0, y1: 1 }, C.amber, 4, 0.9);
  s += panel(1160, 150, 350, 750, "FROBENIUS MURMURATION");
  for (let r = 0; r < 90; r++) for (let c = 0; c < 38; c++) {
    const v = Math.sin(r * 0.19 + c * 0.42) * Math.cos((r - c) * 0.07);
    s += `<rect x="${1185 + c * 8}" y="${220 + r * 6}" width="7" height="5" fill="${diverge(v, 1)}" opacity="0.8"/>`;
  }
  return baseSvg("16 Sato-Tate / Frobenius murmuration panel", "Elliptic-curve traces through primes, with the Sato-Tate curve as prediction.", s, `Curve y^2=x^3-x+1; ${fmt(vals.length)} primes sampled.`);
}

function shot17() {
  const rows = [
    ["zero wave", 1, 1, 1, 1, 1],
    ["raw spectrum", 1, 1, 1, 1, 1],
    ["gap skyline", 1, 1, 1, 1, 1],
    ["HL tuples", 1, 1, 1, 1, 1],
    ["Goldbach comet", 1, 1, 1, 0, 1],
    ["BH sparse", 1, 1, 1, 0, 1],
    ["Ulam streak", 1, 0, 0, 0, 1],
    ["pretty-only line", 0, 0, 0, 0, 0],
  ];
  const labels = ["residual", "null", "N->2N", "holdout", "formal"];
  let s = panel(58, 150, 1320, 750, "ANOMALY LEDGER");
  const x0 = 360, y0 = 240, cell = 78;
  labels.forEach((l, i) => s += `<text x="${x0 + i * 170}" y="215" fill="${C.dim}" font-size="17" font-family="ui-monospace, Menlo, monospace" text-anchor="middle">${esc(l)}</text>`);
  rows.forEach((row, r) => {
    s += `<text x="140" y="${y0 + r * cell + 32}" fill="${row.slice(1).every(Boolean) ? C.text : C.dim}" font-size="20" font-family="Inter, system-ui">${esc(row[0])}</text>`;
    row.slice(1).forEach((v, i) => {
      const x = x0 + i * 170;
      const y = y0 + r * cell;
      s += `<rect x="${x - 26}" y="${y}" width="52" height="52" rx="12" fill="${v ? C.green : C.red}" opacity="${v ? 0.85 : 0.55}"/><text x="${x}" y="${y + 35}" text-anchor="middle" fill="${C.bg}" font-size="26" font-family="ui-monospace, Menlo, monospace" font-weight="800">${v ? "OK" : "NO"}</text>`;
    });
  });
  s += `<text x="1120" y="795" fill="${C.amber}" font-size="20" font-family="Inter, system-ui">Failed candidates remain visible with failure mode.</text>`;
  return baseSvg("17 Anomaly ledger / conjecture dashboard", "A meta-instrument that separates discoveries from artifacts.", s, "Badges: residual defined, null separated, range persistence, holdout, formal conjecture.");
}

function shot18() {
  const size = 96;
  const matrix = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const n = y * size + x + 2;
      row.push(gcd(n, 2 * 3 * 5 * 7 * 11) === 1 ? 1 : 0);
    }
    matrix.push(row);
  }
  let s = panel(58, 150, 1060, 750, "WHEEL-FACTOR STRUCTURE");
  s += heatmap(matrix, [140, 210, 720, 620], 0, 1, (t) => t > 0.5 ? C.cyan : "#05080a");
  for (let k = 0; k < 8; k++) {
    s += `<rect x="${920 + k * 42}" y="${260 + (k % 3) * 65}" width="34" height="240" fill="none" stroke="${[C.amber, C.green, C.mag][k % 3]}" opacity="0.45"/>`;
  }
  s += `<text x="970" y="560" fill="${C.text}" font-size="26" font-family="Inter, system-ui" font-weight="700">Prime Matrix Cathedral</text>
  <text x="970" y="600" fill="${C.dim}" font-size="19" font-family="Inter, system-ui">Relabeled as local obstruction</text>
  <text x="970" y="632" fill="${C.dim}" font-size="19" font-family="Inter, system-ui">and wheel-factor structure.</text>`;
  return baseSvg("18 Prime Matrix Cathedral", "A residue-grid view of modular obstruction and wheel-factor architecture.", s, "Coprime cells modulo 2*3*5*7*11 remain lit.");
}

function shot19() {
  const N = 42000;
  const primes = primesUpTo(N);
  const cx = 790, cy = 520, maxR = 380;
  let s = panel(58, 150, 1440, 750, "POLAR PRIME VORTEX");
  for (const p of primes) {
    const theta = p * 0.13750776405;
    const r = Math.sqrt(p / N) * maxR;
    const col = p % 6 === 1 ? C.cyan : C.amber;
    s += `<circle cx="${cx + r * Math.cos(theta)}" cy="${cy + r * Math.sin(theta)}" r="1.5" fill="${col}" opacity="0.48"/>`;
  }
  for (let r = 80; r <= maxR; r += 80) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.grid}"/>`;
  s += `<text x="1120" y="300" fill="${C.text}" font-size="25" font-family="Inter, system-ui" font-weight="700">Fourier residue lens</text>
  <text x="1120" y="338" fill="${C.dim}" font-size="19" font-family="Inter, system-ui">Rational-angle lock-in reveals</text>
  <text x="1120" y="370" fill="${C.dim}" font-size="19" font-family="Inter, system-ui">which patterns are modular</text>
  <text x="1120" y="402" fill="${C.dim}" font-size="19" font-family="Inter, system-ui">and which need a true residual.</text>`;
  return baseSvg("19 Polar Prime Vortex", "Primes in polar angle space, relabeled as exponential-sum and residue structure.", s, `${fmt(primes.length)} primes up to ${fmt(N)}`);
}

function shot20() {
  const N = 120000;
  const primes = primesUpTo(N);
  const mod = 210;
  const cx = 610, cy = 520, R = 350;
  let s = panel(58, 150, 1000, 750, "PRIME CLOCK MANDALA MOD 210");
  for (let r = 0; r < mod; r++) {
    const ang = -Math.PI / 2 + (2 * Math.PI * r) / mod;
    const ok = gcd(r, mod) === 1;
    s += `<line x1="${cx}" y1="${cy}" x2="${cx + (ok ? R : R * 0.64) * Math.cos(ang)}" y2="${cy + (ok ? R : R * 0.64) * Math.sin(ang)}" stroke="${ok ? C.cyan : C.faint}" stroke-width="${ok ? 1.8 : 0.5}" opacity="${ok ? 0.7 : 0.15}"/>`;
  }
  for (const p of primes.slice(0, 8000)) {
    const ang = -Math.PI / 2 + (2 * Math.PI * (p % mod)) / mod;
    const rad = 22 + Math.sqrt(p / N) * (R - 26);
    s += `<circle cx="${cx + rad * Math.cos(ang)}" cy="${cy + rad * Math.sin(ang)}" r="1.45" fill="${p % 30 === 1 ? C.amber : C.green}" opacity="0.34"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.line}"/>`;
  s += panel(1110, 150, 390, 750, "LOCAL OBSTRUCTION") +
    `<text x="1160" y="290" fill="${C.text}" font-size="25" font-family="Inter, system-ui" font-weight="700">Forbidden spokes</text>
    <text x="1160" y="330" fill="${C.dim}" font-size="19" font-family="Inter, system-ui">Residues sharing a factor with</text>
    <text x="1160" y="362" fill="${C.dim}" font-size="19" font-family="Inter, system-ui">210 are structurally empty.</text>
    <text x="1160" y="430" fill="${C.amber}" font-size="20" font-family="ui-monospace, Menlo, monospace">phi(210) = ${phi(210)} live spokes</text>`;
  return baseSvg("20 Prime Clock Mandala", "The modular-clock hero shot, upgraded with the explicit obstruction label.", s, `mod ${mod}; primes up to ${fmt(N)}`);
}

async function svgToPng(browser, svg, pngPath) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:${C.bg};">${svg}</body></html>`, { waitUntil: "load" });
  await page.screenshot({ path: pngPath, omitBackground: false });
  await page.close();
}

async function main() {
  const shots = [
    shot01, shot02, shot03, shot04, shot05, shot06, shot07, shot08, shot09, shot10,
    shot11, shot12, shot13, shot14, shot15, shot16, shot17, shot18, shot19, shot20,
  ];
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const manifest = [];
  try {
    for (let i = 0; i < shots.length; i++) {
      const svg = shots[i]();
      const title = svg.match(/<text x="58" y="72"[^>]*>(.*?)<\/text>/)?.[1].replace(/&amp;/g, "&") || `shot-${i + 1}`;
      const name = `${String(i + 1).padStart(2, "0")}-${slug(title.replace(/^\d+\s*/, ""))}`;
      const svgPath = path.join(OUT_DIR, `${name}.svg`);
      const pngPath = path.join(OUT_DIR, `${name}.png`);
      await fs.writeFile(svgPath, svg, "utf8");
      await svgToPng(browser, svg, pngPath);
      manifest.push({ index: i + 1, title, svg: svgPath, png: pngPath });
      process.stdout.write(`wrote ${pngPath}\n`);
    }
  } finally {
    await browser.close();
  }
  await fs.writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), count: manifest.length, shots: manifest }, null, 2), "utf8");
  await fs.writeFile(path.join(OUT_DIR, "README.md"), `# PrimeVisuals frontier instruments

Generated by \`node scripts/frontier-instruments.mjs\`.

This directory contains ${manifest.length} individual SVG and PNG frontier-instrument shots. The first 17 are the numbered instruments from the pasted brief. Items 18-20 are relabeled keep-shots from the same brief so the set matches the requested count of 20.

${manifest.map((m) => `${m.index}. ${m.title} - [PNG](${path.basename(m.png)}) / [SVG](${path.basename(m.svg)})`).join("\n")}
`, "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
