#!/usr/bin/env node
// P1-CL ROWS 1+2 — the integer missing-spectrum hunt + the known-line calibration.
// (prompts/parity-battery.md; COUNCIL2.md Amendment A)
//
// Row 1: C_h(x) = sum_{n<=x} mu(n)mu(n+h) walks; theta2(h) exponents; Hann-windowed
//   DFT of C_h(e^u)/e^(u/2) on a uniform log grid, peak-scored against colored-noise
//   nulls (10 Bernoulli-on-squarefree + 10 random-completely-multiplicative walks).
//   Survivor bar (predeclared): peak score > null max envelope AND present in both
//   octave halves AND coherent across >= 2 shifts.
// Row 2: Mertens walk M(x) spectrum on the same grid — frequencies must match the
//   bundled zeta zeros; amplitudes against the explicit-formula 1/|rho zeta'(rho)|.
// Also: the parity-breaker profile avg_{p<=N} mu(p+h).
//
// Usage: node scripts/missing-spectrum-row12.mjs [N] [outDir]

import fs from "node:fs";
import path from "node:path";
import { ZEROS, zetaC } from "../src/core/math.js";

const N = Number(process.argv[2] || 100_000_000);
const outDir = process.argv[3] || "logs/missing-spectrum-artifacts";
const SHIFTS = [1, 2, 3, 4, 5, 6, 8, 12, 101, 1009];
const NULL_SEEDS_BERN = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const NULL_SEEDS_RCM = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
const SAMPLES = 8192;
const X_MIN = 10_000;
const FREQ_BINS = 512; // gamma up to ~2*pi*512/log(N/X_MIN)
const MEDIAN_HALF_WIDTH = 32;

fs.mkdirSync(outDir, { recursive: true });
const timings = [];
function timed(label, fn) {
  const t0 = performance.now();
  const value = fn();
  const ms = performance.now() - t0;
  timings.push({ label, ms: Math.round(ms) });
  console.log(`${label}: ${(ms / 1000).toFixed(1)}s`);
  return value;
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

// --- sieve: composite flags + exact Mobius via sign toggles ---------------

const composite = new Uint8Array(N + 1);
const mu = new Int8Array(N + 1);
timed(`sieve mu to ${N}`, () => {
  mu.fill(1);
  mu[0] = 0;
  const sqrtN = Math.floor(Math.sqrt(N));
  for (let p = 2; p <= N; p++) {
    if (composite[p]) continue;
    if (p <= sqrtN) {
      for (let j = p * p; j <= N; j += p) composite[j] = 1;
    }
    for (let j = p; j <= N; j += p) mu[j] = -mu[j];
    if (p <= sqrtN) {
      const p2 = p * p;
      for (let j = p2; j <= N; j += p2) mu[j] = 0;
    }
  }
});

const primes = timed("collect primes", () => {
  const list = [];
  for (let p = 2; p <= N; p++) if (!composite[p]) list.push(p);
  return new Uint32Array(list);
});
console.log(`pi(${N}) = ${primes.length}`);

// --- checkpoints on a uniform log grid ------------------------------------

const uMin = Math.log(X_MIN);
const uMax = Math.log(N);
const du = (uMax - uMin) / (SAMPLES - 1);
const checkpoints = new Float64Array(SAMPLES);
for (let i = 0; i < SAMPLES; i++) checkpoints[i] = Math.exp(uMin + i * du);

function walkSamples(seq, h) {
  // samples of C(x) = sum_{n<=x} seq(n)seq(n+h) at the checkpoints
  const out = new Float64Array(SAMPLES);
  let acc = 0;
  let ci = 0;
  const limit = N - h;
  for (let n = 1; n <= limit; n++) {
    acc += seq[n] * seq[n + h];
    while (ci < SAMPLES && n >= checkpoints[ci]) {
      out[ci++] = acc;
    }
  }
  while (ci < SAMPLES) out[ci++] = acc;
  return out;
}

function mertensSamples(seq) {
  const out = new Float64Array(SAMPLES);
  let acc = 0;
  let ci = 0;
  for (let n = 1; n <= N; n++) {
    acc += seq[n];
    while (ci < SAMPLES && n >= checkpoints[ci]) out[ci++] = acc;
  }
  while (ci < SAMPLES) out[ci++] = acc;
  return out;
}

// --- spectrum: Hann-windowed direct DFT of C(e^u)/e^(u/2) ------------------

function spectrum(samples) {
  const y = new Float64Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) {
    const hann = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (SAMPLES - 1)));
    y[i] = (samples[i] / Math.sqrt(checkpoints[i])) * hann;
  }
  const mean = y.reduce((a, b) => a + b, 0) / SAMPLES;
  for (let i = 0; i < SAMPLES; i++) y[i] -= mean;
  const span = uMax - uMin;
  const amps = new Float64Array(FREQ_BINS);
  const gammas = new Float64Array(FREQ_BINS);
  for (let k = 1; k <= FREQ_BINS; k++) {
    const gamma = (2 * Math.PI * k) / span;
    let re = 0;
    let im = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const phase = gamma * (uMin + i * du);
      re += y[i] * Math.cos(phase);
      im -= y[i] * Math.sin(phase);
    }
    gammas[k - 1] = gamma;
    amps[k - 1] = (2 * Math.hypot(re, im)) / SAMPLES;
  }
  return { gammas, amps };
}

function peakScores(amps) {
  const scores = new Float64Array(amps.length);
  for (let i = 0; i < amps.length; i++) {
    const lo = Math.max(0, i - MEDIAN_HALF_WIDTH);
    const hi = Math.min(amps.length, i + MEDIAN_HALF_WIDTH + 1);
    const window = Array.from(amps.slice(lo, hi)).sort((a, b) => a - b);
    const median = window[Math.floor(window.length / 2)] || 1e-18;
    scores[i] = amps[i] / median;
  }
  return scores;
}

// Predeclared exclusion: the lowest bins sit on the random-walk resolution
// ramp where the local-median score inflates for real AND null walks alike;
// peaks are only scored for bin >= RAMP_EXCLUDE.
const RAMP_EXCLUDE = 8;

function topPeaks(gammas, scores, amps, count = 10) {
  const idx = Array.from(scores.keys())
    .filter((i) => i >= RAMP_EXCLUDE && i < scores.length - 2)
    .filter((i) => scores[i] >= scores[i - 1] && scores[i] >= scores[i + 1])
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, count);
  return idx.map((i) => ({ gamma: gammas[i], score: scores[i], amp: amps[i], bin: i }));
}

function octaveHalves(samples, h) {
  // spectra of the two halves of the log-range (for octave stability)
  const half = Math.floor(SAMPLES / 2);
  const specOf = (from, to) => {
    const y = new Float64Array(to - from);
    for (let i = from; i < to; i++) {
      const j = i - from;
      const hann = 0.5 * (1 - Math.cos((2 * Math.PI * j) / (to - from - 1)));
      y[j] = (samples[i] / Math.sqrt(checkpoints[i])) * hann;
    }
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    for (let j = 0; j < y.length; j++) y[j] -= mean;
    const span = (to - from) * du;
    const amps = new Float64Array(Math.floor(FREQ_BINS / 2));
    const gammas = new Float64Array(amps.length);
    for (let k = 1; k <= amps.length; k++) {
      const gamma = (2 * Math.PI * k) / span;
      let re = 0;
      let im = 0;
      for (let j = 0; j < y.length; j++) {
        const phase = gamma * ((from + j) * du);
        re += y[j] * Math.cos(phase);
        im -= y[j] * Math.sin(phase);
      }
      gammas[k - 1] = gamma;
      amps[k - 1] = (2 * Math.hypot(re, im)) / y.length;
    }
    return { gammas, amps, scores: peakScores(amps) };
  };
  return { first: specOf(0, half), second: specOf(half, SAMPLES), h };
}

function theta2(samples) {
  // slope of log RMS(C) vs log x over octave bands
  const bands = [];
  let x0 = X_MIN;
  while (x0 * 2 <= N) {
    const inBand = [];
    for (let i = 0; i < SAMPLES; i++) {
      if (checkpoints[i] >= x0 && checkpoints[i] < x0 * 2) inBand.push(samples[i]);
    }
    if (inBand.length > 8) {
      const rms = Math.sqrt(inBand.reduce((a, b) => a + b * b, 0) / inBand.length);
      if (rms > 0) bands.push({ x: x0 * 1.5, rms });
    }
    x0 *= 2;
  }
  if (bands.length < 4) return { slope: null, bands };
  const xs = bands.map((b) => Math.log(b.x));
  const ys = bands.map((b) => Math.log(b.rms));
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < xs.length; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
  }
  return { slope: sxy / sxx, bands };
}

// --- Row 1: real walks ------------------------------------------------------

const real = {};
timed("real C_h walks + spectra", () => {
  for (const h of SHIFTS) {
    const samples = walkSamples(mu, h);
    const spec = spectrum(samples);
    const scores = peakScores(spec.amps);
    real[h] = {
      endpoint: samples[SAMPLES - 1],
      theta2: theta2(samples),
      peaks: topPeaks(spec.gammas, scores, spec.amps),
      octave: h <= 3 ? null : undefined, // filled below for small h
      amps: Array.from(spec.amps),
      gammas: Array.from(spec.gammas),
      samplesTail: samples[SAMPLES - 1],
    };
    if (h <= 3) {
      const halves = octaveHalves(samples, h);
      real[h].octave = {
        firstPeaks: topPeaks(halves.first.gammas, halves.first.scores, halves.first.amps, 5),
        secondPeaks: topPeaks(halves.second.gammas, halves.second.scores, halves.second.amps, 5),
      };
    }
  }
});

// --- Row 1: nulls (h=1; the null process is h-independent) ----------------

const nullBuffer = new Int8Array(N + 2);
function bernoulliNullWalk(seed) {
  const next = rng(seed);
  for (let n = 1; n <= N + 1; n++) {
    nullBuffer[n] = mu[Math.min(n, N)] === 0 ? 0 : next() < 0.5 ? -1 : 1;
  }
  return walkSamples(nullBuffer, 1);
}
function rcmNullWalk(seed) {
  const next = rng(seed);
  nullBuffer.fill(1);
  for (let pi = 0; pi < primes.length; pi++) {
    if (next() < 0.5) continue;
    const p = primes[pi];
    for (let j = p; j <= N; j += p) nullBuffer[j] = -nullBuffer[j];
  }
  for (let n = 1; n <= N; n++) if (mu[n] === 0) nullBuffer[n] = 0;
  return walkSamples(nullBuffer, 1);
}

const nulls = { bernoulli: [], rcm: [] };
timed("null walks + spectra", () => {
  for (const seed of NULL_SEEDS_BERN) {
    const samples = bernoulliNullWalk(seed);
    const spec = spectrum(samples);
    const scores = peakScores(spec.amps);
    const top = topPeaks(spec.gammas, scores, spec.amps, 3);
    nulls.bernoulli.push({
      seed,
      theta2: theta2(samples).slope,
      maxScore: top[0]?.score ?? 0,
      maxScoreGamma: top[0]?.gamma,
      peaks: top,
      amps: Array.from(spec.amps),
    });
  }
  for (const seed of NULL_SEEDS_RCM) {
    const samples = rcmNullWalk(seed);
    const spec = spectrum(samples);
    const scores = peakScores(spec.amps);
    const top = topPeaks(spec.gammas, scores, spec.amps, 3);
    nulls.rcm.push({
      seed,
      theta2: theta2(samples).slope,
      maxScore: top[0]?.score ?? 0,
      maxScoreGamma: top[0]?.gamma,
      peaks: top,
      amps: Array.from(spec.amps),
    });
  }
});

// --- Row 2: Mertens walk against the known line ----------------------------

const row2 = timed("mertens spectrum + amplitude ladder", () => {
  const samples = mertensSamples(mu);
  const spec = spectrum(samples);
  const scores = peakScores(spec.amps);
  const peaks = topPeaks(spec.gammas, scores, spec.amps, 25);
  // match against bundled zeros; explicit-formula amplitude 2/|rho zeta'(rho)|
  const dz = 1e-4;
  const matches = [];
  for (let k = 0; k < 20; k++) {
    const gamma = ZEROS[k];
    let best = null;
    for (const peak of peaks) {
      const dist = Math.abs(peak.gamma - gamma);
      if (!best || dist < best.dist) best = { ...peak, dist };
    }
    const [zpr, zpi] = zetaC(0.5, gamma + dz);
    const [zmr, zmi] = zetaC(0.5, gamma - dz);
    const zetaPrimeAbs = Math.hypot(zpr - zmr, zpi - zmi) / (2 * dz);
    const rhoAbs = Math.hypot(0.5, gamma);
    const predictedAmp = 2 / (rhoAbs * zetaPrimeAbs);
    matches.push({
      k: k + 1,
      gamma,
      nearestPeakGamma: best?.gamma,
      dist: best?.dist,
      measuredAmp: best?.amp,
      predictedAmp,
      ratio: best ? best.amp / predictedAmp : null,
    });
  }
  return { endpoint: samples[SAMPLES - 1], peaks, matches };
});

// --- parity-breaker profile -------------------------------------------------

const parityBreaker = timed("parity-breaker profile", () => {
  const rows = [];
  for (const h of [1, 2, 3, 4, 5, 6, 7, 8]) {
    let sum = 0;
    let count = 0;
    for (let pi = 0; pi < primes.length; pi++) {
      const p = primes[pi];
      if (p + h > N) break;
      sum += mu[p + h];
      count++;
    }
    // naive null sd: mu over random positions has mean 0, var ~ 6/pi^2
    const sd = Math.sqrt((6 / Math.PI ** 2) / count);
    rows.push({ h, mean: sum / count, count, naiveZ: sum / count / sd });
  }
  return rows;
});

// --- report ------------------------------------------------------------------

const nullMaxScores = [...nulls.bernoulli, ...nulls.rcm].map((r) => r.maxScore);
const report = {
  N,
  generatedAt: new Date().toISOString(),
  grid: { samples: SAMPLES, xMin: X_MIN, freqBins: FREQ_BINS, deltaGamma: (2 * Math.PI) / (uMax - uMin) },
  row1: {
    shifts: SHIFTS,
    theta2: Object.fromEntries(SHIFTS.map((h) => [h, real[h].theta2.slope])),
    endpoints: Object.fromEntries(SHIFTS.map((h) => [h, real[h].endpoint])),
    topPeaksPerShift: Object.fromEntries(SHIFTS.map((h) => [h, real[h].peaks])),
    octaveChecks: Object.fromEntries(
      SHIFTS.filter((h) => h <= 3).map((h) => [h, real[h].octave]),
    ),
    nullTheta2: {
      bernoulli: nulls.bernoulli.map((r) => r.theta2),
      rcm: nulls.rcm.map((r) => r.theta2),
    },
    nullMaxScore: {
      values: nullMaxScores,
      max: Math.max(...nullMaxScores),
      mean: nullMaxScores.reduce((a, b) => a + b, 0) / nullMaxScores.length,
    },
  },
  row2,
  parityBreaker,
  timingsMs: timings,
};

fs.writeFileSync(path.join(outDir, `row12-N${N}.json`), JSON.stringify(report, null, 2));

// slim spectra dump for plotting
fs.writeFileSync(
  path.join(outDir, `row12-spectra-N${N}.json`),
  JSON.stringify({
    gammas: real[1].gammas,
    realAmps: Object.fromEntries(SHIFTS.filter((h) => h <= 6).map((h) => [h, real[h].amps])),
    bernAmps: nulls.bernoulli.slice(0, 3).map((r) => r.amps),
    rcmAmps: nulls.rcm.slice(0, 3).map((r) => r.amps),
  }),
);

console.log("--- Row 1 summary ---");
for (const h of SHIFTS) {
  console.log(
    `h=${h}: theta2=${real[h].theta2.slope?.toFixed(4)} endpoint=${real[h].endpoint} ` +
      `top peak score=${real[h].peaks[0]?.score.toFixed(2)} @ gamma=${real[h].peaks[0]?.gamma.toFixed(2)}`,
  );
}
console.log(
  `null max-score envelope: mean=${report.row1.nullMaxScore.mean.toFixed(2)} max=${report.row1.nullMaxScore.max.toFixed(2)}`,
);
console.log("--- Row 2: first 8 zero matches (gamma, dist, measured/predicted amp) ---");
for (const m of row2.matches.slice(0, 8)) {
  console.log(
    `gamma_${m.k}=${m.gamma.toFixed(3)} dist=${m.dist?.toFixed(3)} ratio=${m.ratio?.toFixed(3)}`,
  );
}
console.log("--- parity-breaker profile ---");
for (const r of parityBreaker) console.log(`h=${r.h}: mean mu(p+h)=${r.mean.toFixed(6)} naiveZ=${r.naiveZ.toFixed(2)}`);
console.log(`wrote row12-N${N}.json`);
