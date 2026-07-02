#!/usr/bin/env node
// TRACK Q (COUNCIL3.md; prompts/quantum-probability.md) — Sprints Q1+Q2.
// Place the real Mertens walk W(u) = M(e^u)/e^(u/2) between:
//   Model Z (spectral): W_Z(u) = sum_k 2 r_k cos(gamma_k u + phi_k),
//     r_k = 1/(|rho_k| |zeta'(rho_k)|) computed from bundled zeros,
//     phi_k iid uniform (the RH+LI almost-periodic world);
//   Model C (chaos): W from random completely multiplicative +-1 seeds
//     (Harper's critical-chaos world).
// Method (predeclared, the COUNCIL3 trap rule): distribution SHAPE at fixed N
// against exactly simulated ensembles. Verdict rule per statistic/window:
// consistent with an ensemble iff |z| <= 2.5 ensemble-sd; a statistic is
// DISCRIMINATING iff the two ensemble means separate by >= 3 combined sd.
// Truncation sensitivity: Z battery at K = 50, 100, 200, 267 zeros.
//
// Usage: node scripts/quantum-placement.mjs [N] [outDir] [cSeeds] [zDraws]

import fs from "node:fs";
import path from "node:path";
import { ZEROS, zetaC } from "../src/core/math.js";

const N = Number(process.argv[2] || 100_000_000);
const outDir = process.argv[3] || "logs/quantum-placement-artifacts";
const C_SEED_COUNT = Number(process.argv[4] || 60);
const Z_DRAW_COUNT = Number(process.argv[5] || 200);
const SAMPLES = 8192;
const X_MIN = 10_000;
const K_LADDER = [50, 100, 200, 267];
const K_MAIN = 267;
const ACF_DELTAS = [0.1, 0.25, 0.5, 1, 2, 4];
const CONSISTENT_Z = 2.5;
const DISCRIMINATING_SEP = 3;

fs.mkdirSync(outDir, { recursive: true });
const timings = [];
function timed(label, fn) {
  const t0 = performance.now();
  const v = fn();
  timings.push({ label, ms: Math.round(performance.now() - t0) });
  console.log(`${label}: ${((performance.now() - t0) / 1000).toFixed(1)}s`);
  return v;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const uMin = Math.log(X_MIN);
const uMax = Math.log(N);
const du = (uMax - uMin) / (SAMPLES - 1);
const uGrid = Float64Array.from({ length: SAMPLES }, (_, i) => uMin + i * du);
const checkpoints = Float64Array.from(uGrid, (u) => Math.exp(u));

// --- real walk ---------------------------------------------------------------

const { realW, primes, muRef } = timed(`mu sieve + real walk to ${N}`, () => {
  const composite = new Uint8Array(N + 1);
  const mu = new Int8Array(N + 1);
  mu.fill(1);
  mu[0] = 0;
  const sqrtN = Math.floor(Math.sqrt(N));
  const plist = [];
  for (let p = 2; p <= N; p++) {
    if (composite[p]) continue;
    plist.push(p);
    if (p <= sqrtN) {
      for (let j = p * p; j <= N; j += p) composite[j] = 1;
      const p2 = p * p;
      for (let j = p; j <= N; j += p) mu[j] = -mu[j];
      for (let j = p2; j <= N; j += p2) mu[j] = 0;
    } else {
      for (let j = p; j <= N; j += p) mu[j] = -mu[j];
    }
  }
  const w = new Float64Array(SAMPLES);
  let acc = 0;
  let ci = 0;
  for (let n = 1; n <= N; n++) {
    acc += mu[n];
    while (ci < SAMPLES && n >= checkpoints[ci]) {
      w[ci] = acc / Math.sqrt(checkpoints[ci]);
      ci++;
    }
  }
  while (ci < SAMPLES) w[ci++] = acc / Math.sqrt(N);
  return { realW: w, primes: new Uint32Array(plist), muRef: mu };
});

// --- Model C ensemble ---------------------------------------------------------

function rcmWalk(seed) {
  const next = rng(seed);
  const s = new Int8Array(N + 1);
  s.fill(1);
  s[0] = 0;
  for (let pi = 0; pi < primes.length; pi++) {
    if (next() < 0.5) continue;
    const p = primes[pi];
    for (let j = p; j <= N; j += p) s[j] = -s[j];
  }
  const w = new Float64Array(SAMPLES);
  let acc = 0;
  let ci = 0;
  for (let n = 1; n <= N; n++) {
    acc += muRef[n] === 0 ? 0 : s[n]; // squarefree support, random mult sign
    while (ci < SAMPLES && n >= checkpoints[ci]) {
      w[ci] = acc / Math.sqrt(checkpoints[ci]);
      ci++;
    }
  }
  while (ci < SAMPLES) w[ci++] = acc / Math.sqrt(N);
  return w;
}

const cWalks = timed(`C-ensemble (${C_SEED_COUNT} RCM seeds)`, () => {
  const walks = [];
  for (let s = 0; s < C_SEED_COUNT; s++) walks.push(rcmWalk(1000 + s));
  return walks;
});

// --- Model Z ensemble ---------------------------------------------------------

const ladder = timed("amplitude ladder r_k (zetaC central differences)", () => {
  const dz = 1e-4;
  return ZEROS.slice(0, K_MAIN).map((gamma) => {
    const [zpr, zpi] = zetaC(0.5, gamma + dz);
    const [zmr, zmi] = zetaC(0.5, gamma - dz);
    const zetaPrimeAbs = Math.hypot(zpr - zmr, zpi - zmi) / (2 * dz);
    const rhoAbs = Math.hypot(0.5, gamma);
    return { gamma, r: 1 / (rhoAbs * zetaPrimeAbs) };
  });
});

function zWalk(seed, K) {
  const next = rng(seed);
  const phases = Float64Array.from({ length: K }, () => next() * 2 * Math.PI);
  const w = new Float64Array(SAMPLES);
  for (let k = 0; k < K; k++) {
    const { gamma, r } = ladder[k];
    const amp = 2 * r;
    const phi = phases[k];
    for (let i = 0; i < SAMPLES; i++) w[i] += amp * Math.cos(gamma * uGrid[i] + phi);
  }
  return w;
}

const zWalksByK = timed(`Z-ensemble (${Z_DRAW_COUNT} draws x K ladder)`, () => {
  const byK = {};
  for (const K of K_LADDER) {
    byK[K] = [];
    const draws = K === K_MAIN ? Z_DRAW_COUNT : 40; // full count at main K
    for (let d = 0; d < draws; d++) byK[K].push(zWalk(5000 + d * 7 + K, K));
  }
  return byK;
});

// --- battery -------------------------------------------------------------------

const WINDOWS = [
  { name: "full", from: 0, to: SAMPLES },
  { name: "firstHalf", from: 0, to: SAMPLES >> 1 },
  { name: "secondHalf", from: SAMPLES >> 1, to: SAMPLES },
];

function battery(w, from, to) {
  const n = to - from;
  let mean = 0;
  for (let i = from; i < to; i++) mean += w[i];
  mean /= n;
  let m2 = 0;
  let m3 = 0;
  let m4 = 0;
  let absSum = 0;
  let sq = 0;
  let max = -Infinity;
  let min = Infinity;
  let signChanges = 0;
  for (let i = from; i < to; i++) {
    const d = w[i] - mean;
    m2 += d * d;
    m3 += d * d * d;
    m4 += d * d * d * d;
    absSum += Math.abs(w[i]);
    sq += w[i] * w[i];
    if (w[i] > max) max = w[i];
    if (w[i] < min) min = w[i];
    if (i > from && Math.sign(w[i]) !== Math.sign(w[i - 1])) signChanges++;
  }
  m2 /= n;
  m3 /= n;
  m4 /= n;
  const out = {
    variance: m2,
    skewness: m3 / Math.pow(m2, 1.5),
    kurtosisExcess: m4 / (m2 * m2) - 3,
    momentRatio: absSum / n / Math.sqrt(sq / n),
    max,
    min,
    signChanges,
  };
  for (const d of ACF_DELTAS) {
    const lag = Math.round(d / du);
    let c = 0;
    let cnt = 0;
    for (let i = from; i + lag < to; i++) {
      c += (w[i] - mean) * (w[i + lag] - mean);
      cnt++;
    }
    out[`acf${d}`] = c / cnt / m2;
  }
  return out;
}

const STAT_KEYS = [
  "variance",
  "skewness",
  "kurtosisExcess",
  "momentRatio",
  "max",
  "min",
  "signChanges",
  ...ACF_DELTAS.map((d) => `acf${d}`),
];

function ensembleStats(walks, from, to) {
  const rows = walks.map((w) => battery(w, from, to));
  const out = {};
  for (const key of STAT_KEYS) {
    const vals = rows.map((r) => r[key]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
    out[key] = { mean, sd };
  }
  return out;
}

const placement = timed("placement battery", () => {
  const perWindow = [];
  for (const { name, from, to } of WINDOWS) {
    const real = battery(realW, from, to);
    const zStats = ensembleStats(zWalksByK[K_MAIN], from, to);
    const cStats = ensembleStats(cWalks, from, to);
    const rows = STAT_KEYS.map((key) => {
      const zZ = (real[key] - zStats[key].mean) / (zStats[key].sd || 1e-12);
      const zC = (real[key] - cStats[key].mean) / (cStats[key].sd || 1e-12);
      const sep =
        Math.abs(zStats[key].mean - cStats[key].mean) /
        Math.sqrt(zStats[key].sd ** 2 + cStats[key].sd ** 2 || 1e-12);
      const zOk = Math.abs(zZ) <= CONSISTENT_Z;
      const cOk = Math.abs(zC) <= CONSISTENT_Z;
      const verdict = zOk && cOk ? "BOTH" : zOk ? "Z-side" : cOk ? "C-side" : "NEITHER";
      return {
        stat: key,
        real: real[key],
        zMean: zStats[key].mean,
        zSd: zStats[key].sd,
        cMean: cStats[key].mean,
        cSd: cStats[key].sd,
        zZ,
        zC,
        separation: sep,
        discriminating: sep >= DISCRIMINATING_SEP,
        verdict,
      };
    });
    perWindow.push({ window: name, rows });
  }
  return perWindow;
});

// truncation sensitivity at full window (variance + acf1)
const truncation = K_LADDER.map((K) => {
  const s = ensembleStats(zWalksByK[K], 0, SAMPLES);
  return { K, variance: s.variance.mean, acf1: s.acf1.mean };
});

// --- report + visual ------------------------------------------------------------

const report = {
  N,
  generatedAt: new Date().toISOString(),
  config: { samples: SAMPLES, xMin: X_MIN, cSeeds: C_SEED_COUNT, zDraws: Z_DRAW_COUNT, kMain: K_MAIN },
  rules: { consistentZ: CONSISTENT_Z, discriminatingSep: DISCRIMINATING_SEP },
  ladderHead: ladder.slice(0, 10),
  ladderVarianceSum: ladder.reduce((a, { r }) => a + 2 * r * r, 0),
  truncation,
  placement,
  timingsMs: timings,
};
fs.writeFileSync(path.join(outDir, `placement-N${N}.json`), JSON.stringify(report, null, 2));

console.log("\n--- PLACEMENT TABLE (full window) ---");
console.log("stat | real | Z mean±sd | C mean±sd | zZ | zC | sep | verdict");
for (const row of placement[0].rows) {
  console.log(
    `${row.stat} | ${row.real.toFixed(4)} | ${row.zMean.toFixed(4)}±${row.zSd.toFixed(4)} | ` +
      `${row.cMean.toFixed(4)}±${row.cSd.toFixed(4)} | ${row.zZ.toFixed(1)} | ${row.zC.toFixed(1)} | ` +
      `${row.separation.toFixed(1)}${row.discriminating ? "*" : ""} | ${row.verdict}`,
  );
}
console.log("\ntruncation (Z variance, acf1 by K):", JSON.stringify(truncation));

// density + ACF overlay panel
{
  const W = 960;
  const H = 520;
  const bg = "#0b0e17";
  const panel = (x0) => x0;
  // density: histogram of W values, full window
  const histOf = (w) => {
    const bins = 60;
    const lo = -0.8;
    const hi = 0.8;
    const h = new Float64Array(bins);
    let cnt = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const b = Math.floor(((w[i] - lo) / (hi - lo)) * bins);
      if (b >= 0 && b < bins) {
        h[b]++;
        cnt++;
      }
    }
    for (let b = 0; b < bins; b++) h[b] /= cnt * ((hi - lo) / bins);
    return { h, lo, hi, bins };
  };
  const realHist = histOf(realW);
  const zHists = zWalksByK[K_MAIN].slice(0, 60).map(histOf);
  const cHists = cWalks.map(histOf);
  const bandOf = (hists) => {
    const bins = hists[0].h.length;
    const loB = new Float64Array(bins);
    const hiB = new Float64Array(bins);
    for (let b = 0; b < bins; b++) {
      const vals = hists.map((x) => x.h[b]).sort((a, c) => a - c);
      loB[b] = vals[Math.floor(vals.length * 0.1)];
      hiB[b] = vals[Math.floor(vals.length * 0.9)];
    }
    return { loB, hiB };
  };
  const zBand = bandOf(zHists);
  const cBand = bandOf(cHists);
  const maxY = Math.max(...realHist.h, ...zBand.hiB, ...cBand.hiB) * 1.1;
  const px = (v) => 60 + ((v - realHist.lo) / (realHist.hi - realHist.lo)) * 400;
  const py = (v) => 470 - (v / maxY) * 400;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="system-ui,sans-serif"><rect width="${W}" height="${H}" fill="${bg}"/>`;
  svg += `<text x="60" y="24" fill="#dbe2f1" font-size="15" font-weight="600">Track Q placement at N=10^8 - real Mertens walk vs Model Z (spectral) vs Model C (chaos)</text>`;
  svg += `<text x="60" y="40" fill="#8b94ab" font-size="11">left: density of W=M(x)/sqrt(x) over [10^4,10^8] (bands = ensemble 10-90%); right: two-scale autocorrelation</text>`;
  const bandPath = (band) => {
    const pts = [];
    for (let b = 0; b < realHist.bins; b++) {
      const x = px(realHist.lo + ((b + 0.5) / realHist.bins) * (realHist.hi - realHist.lo));
      pts.push([x, py(band.hiB[b])]);
    }
    for (let b = realHist.bins - 1; b >= 0; b--) {
      const x = px(realHist.lo + ((b + 0.5) / realHist.bins) * (realHist.hi - realHist.lo));
      pts.push([x, py(band.loB[b])]);
    }
    return `M ${pts.map(([a, c]) => `${a.toFixed(1)} ${c.toFixed(1)}`).join(" L ")} Z`;
  };
  svg += `<path d="${bandPath(cBand)}" fill="#f06292" opacity="0.3"/>`;
  svg += `<path d="${bandPath(zBand)}" fill="#81c784" opacity="0.35"/>`;
  const realPts = [];
  for (let b = 0; b < realHist.bins; b++) {
    const x = px(realHist.lo + ((b + 0.5) / realHist.bins) * (realHist.hi - realHist.lo));
    realPts.push(`${x.toFixed(1)},${py(realHist.h[b]).toFixed(1)}`);
  }
  svg += `<polyline points="${realPts.join(" ")}" fill="none" stroke="#4fc3f7" stroke-width="2"/>`;
  svg += `<text x="70" y="70" fill="#4fc3f7" font-size="11">real</text><text x="70" y="85" fill="#81c784" font-size="11">Model Z band</text><text x="70" y="100" fill="#f06292" font-size="11">Model C band</text>`;
  svg += `<text x="260" y="500" fill="#aab3c8" font-size="11">W value</text>`;
  // right panel: ACF
  const acfX = (i) => 540 + (i / (ACF_DELTAS.length - 1)) * 380;
  const acfY = (v) => 260 - v * 180;
  svg += `<line x1="540" y1="${acfY(0)}" x2="920" y2="${acfY(0)}" stroke="#232a3d"/>`;
  const acfSeries = (statsRows, color, label, yLab) => {
    const pts = ACF_DELTAS.map((d, i) => {
      const row = placement[0].rows.find((r) => r.stat === `acf${d}`);
      return [acfX(i), acfY(statsRows(row))];
    });
    let s = `<polyline points="${pts.map(([a, c]) => `${a.toFixed(1)},${c.toFixed(1)}`).join(" ")}" fill="none" stroke="${color}" stroke-width="2"/>`;
    for (const [a, c] of pts) s += `<circle cx="${a}" cy="${c}" r="3" fill="${color}"/>`;
    s += `<text x="545" y="${yLab}" fill="${color}" font-size="11">${label}</text>`;
    return s;
  };
  svg += acfSeries((r) => r.real, "#4fc3f7", "real ACF", 70);
  svg += acfSeries((r) => r.zMean, "#81c784", "Z mean", 85);
  svg += acfSeries((r) => r.cMean, "#f06292", "C mean", 100);
  ACF_DELTAS.forEach((d, i) => {
    svg += `<text x="${acfX(i)}" y="480" fill="#8b94ab" font-size="10" text-anchor="middle">${d}</text>`;
  });
  svg += `<text x="700" y="500" fill="#aab3c8" font-size="11">lag Delta-u</text>`;
  svg += `</svg>`;
  fs.writeFileSync(path.join(outDir, "placement-panel.svg"), svg);
}
console.log(`wrote placement-N${N}.json and placement-panel.svg`);
