#!/usr/bin/env node
/**
 * scripts/genzeros.mjs
 *
 * Computes imaginary parts of nontrivial zeros of ζ(1/2 + it) for t in (0, 500]
 * by scanning for local minima of |ζ(1/2+it)| and refining with golden-section search.
 *
 * Uses the same Dirichlet eta evaluation as src/core/math.js (zetaHalf, 3000 terms
 * + averaged extra term). Copied inline so the script is standalone.
 *
 * Writes src/core/zeros.js when finished.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/core/zeros.js");

// ---------------------------------------------------------------------------
// ζ(1/2 + it) — exact copy of zetaHalf from src/core/math.js
// ---------------------------------------------------------------------------
const Z_TERMS = 3000;
const _ln = new Float64Array(Z_TERMS + 2);
const _rs = new Float64Array(Z_TERMS + 2);
for (let n = 1; n <= Z_TERMS + 1; n++) {
  _ln[n] = Math.log(n);
  _rs[n] = 1 / Math.sqrt(n);
}

function zetaHalf(t) {
  let re = 0, im = 0, sign = 1;
  for (let n = 1; n <= Z_TERMS; n++) {
    const a = _rs[n] * sign, ang = t * _ln[n];
    re += a * Math.cos(ang); im -= a * Math.sin(ang);
    sign = -sign;
  }
  { // half of the next term — averages consecutive partial sums
    const a = _rs[Z_TERMS + 1] * sign * 0.5, ang = t * _ln[Z_TERMS + 1];
    re += a * Math.cos(ang); im -= a * Math.sin(ang);
  }
  const m = Math.SQRT2, L2 = Math.LN2;
  const dr = 1 - m * Math.cos(t * L2), di = m * Math.sin(t * L2);
  const den = dr * dr + di * di;
  return [(re * dr + im * di) / den, (im * dr - re * di) / den];
}

function abszeta(t) {
  const [re, im] = zetaHalf(t);
  return Math.sqrt(re * re + im * im);
}

// ---------------------------------------------------------------------------
// Riemann–von Mangoldt formula: expected number of zeros up to T
// ---------------------------------------------------------------------------
function nZerosExpected(T) {
  // N(T) ≈ (T/2π)*ln(T/(2πe)) + 7/8
  return (T / (2 * Math.PI)) * Math.log(T / (2 * Math.PI * Math.E)) + 7 / 8;
}

// ---------------------------------------------------------------------------
// Golden-section search for minimum of f in [a, b]
// ---------------------------------------------------------------------------
const PHI_INV = 2 / (1 + Math.sqrt(5)); // 1/φ ≈ 0.618
function goldenMin(f, a, b, tol = 1e-8) {
  let c = b - PHI_INV * (b - a);
  let d = a + PHI_INV * (b - a);
  let fc = f(c), fd = f(d);
  while (Math.abs(b - a) > tol) {
    if (fc < fd) {
      b = d; d = c; fd = fc;
      c = b - PHI_INV * (b - a); fc = f(c);
    } else {
      a = c; c = d; fc = fd;
      d = a + PHI_INV * (b - a); fd = f(d);
    }
  }
  return (a + b) / 2;
}

// ---------------------------------------------------------------------------
// Scan parameters
// ---------------------------------------------------------------------------
const T_START = 10;
const T_END   = 500;
const STEP    = 0.02;   // scan grid step; refinement handles precision
const ZERO_THRESH = 0.05; // |ζ| < this at the refined minimum → accept as zero
const MIN_GAP = 0.5;    // ignore candidate zeros closer than this (dedup)

// Published first-29 list for accuracy check
const PUBLISHED = [
  14.1347, 21.022, 25.0109, 30.4249, 32.9351, 37.5862, 40.9187, 43.3271,
  48.0052, 49.7738, 52.9703, 56.4462, 59.347,  60.8318, 65.1125, 67.0798,
  69.5464, 72.0672, 75.7047, 77.1448, 79.3374, 82.9104, 84.7355, 87.4253,
  88.8091, 92.4919, 94.6513, 95.8706, 98.8312,
];

// ---------------------------------------------------------------------------
// Main scan
// ---------------------------------------------------------------------------
console.log(`Scanning t ∈ [${T_START}, ${T_END}] step=${STEP} …`);
const t0 = Date.now();

const zeros = [];
let prevVal = abszeta(T_START);
let prev2Val = prevVal;

// We need three consecutive samples to detect a local minimum:
// sample at t-2h, t-h, t → minimum if f(t-h) < f(t-2h) && f(t-h) < f(t)
let tPrev2 = T_START - 2 * STEP;
let tPrev  = T_START - STEP;
let valPrev2 = abszeta(tPrev2 > 1 ? tPrev2 : T_START);
let valPrev  = prevVal;

// Track the last T where we still saw zeros (for cutoff diagnostics)
let lastZeroT = T_START;
// Track consecutive chunks with no zeros (for early-stop detection)
let noZeroStreak = 0;

for (let t = T_START + STEP; t <= T_END + 1e-9; t += STEP) {
  const val = abszeta(t);

  // Local minimum at tPrev?
  if (valPrev < valPrev2 && valPrev < val) {
    // Refine with golden-section search in [tPrev2, t]
    const tRef = goldenMin(abszeta, tPrev2, t, 1e-8);
    const vRef = abszeta(tRef);

    if (vRef < ZERO_THRESH) {
      // Dedup: must be far enough from previous zero
      if (zeros.length === 0 || tRef - zeros[zeros.length - 1] > MIN_GAP) {
        zeros.push(tRef);
        lastZeroT = tRef;
        noZeroStreak = 0;
      }
    }
  }

  valPrev2 = valPrev;
  valPrev  = val;
  tPrev2   = tPrev;
  tPrev    = t;
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`Scan done in ${elapsed}s. Raw candidate count: ${zeros.length}`);

// ---------------------------------------------------------------------------
// Accuracy & sanity checks
// ---------------------------------------------------------------------------
console.log("\n--- Accuracy check: first 29 zeros vs published ---");
let maxDev = 0;
for (let i = 0; i < Math.min(29, zeros.length); i++) {
  const dev = Math.abs(zeros[i] - PUBLISHED[i]);
  if (dev > maxDev) maxDev = dev;
  const flag = dev > 0.003 ? " *** FAIL ***" : "";
  console.log(`  z[${String(i + 1).padStart(2)}]  found=${zeros[i].toFixed(6)}  pub=${PUBLISHED[i]}  dev=${dev.toFixed(6)}${flag}`);
}
console.log(`Max deviation on first 29: ${maxDev.toFixed(6)} ${maxDev > 0.003 ? "EXCEEDS 0.003 THRESHOLD" : "(OK)"}`);

// von Mangoldt formula comparison
console.log("\n--- Riemann–von Mangoldt formula check ---");
const checkpoints = [100, 200, 300, 400, 500];
for (const T of checkpoints) {
  const found = zeros.filter(z => z <= T).length;
  const expected = nZerosExpected(T);
  const diff = found - expected;
  console.log(`  N(${T}): found=${found}  expected≈${expected.toFixed(1)}  diff=${diff > 0 ? "+" : ""}${diff.toFixed(1)}`);
}

// Determine reliability cutoff: find where counts start diverging badly
// Also check the minimum |ζ| values in the last section to detect degradation
console.log("\n--- Reliability check: min|ζ| values in bands ---");
const bands = [
  [10, 100], [100, 200], [200, 300], [300, 400], [400, 500]
];
let cutoffT = T_END;
for (const [a, b] of bands) {
  // Sample 200 points in the band, find the minimum |ζ|
  const bandStep = (b - a) / 200;
  let minVal = Infinity;
  for (let t = a; t <= b; t += bandStep) {
    const v = abszeta(t);
    if (v < minVal) minVal = v;
  }
  const bandZeros = zeros.filter(z => z > a && z <= b).length;
  const bandExpected = nZerosExpected(b) - nZerosExpected(a);
  console.log(`  [${a},${b}]: found=${bandZeros}  expected≈${bandExpected.toFixed(1)}  min|ζ|=${minVal.toFixed(4)}`);
  // Flag if the evaluation looks degraded: count is < 80% of expected
  if (bandZeros < 0.8 * bandExpected && cutoffT === T_END) {
    cutoffT = a;
    console.log(`  *** Accuracy appears to degrade around T=${a} ***`);
  }
}

// If no degradation found, cutoff is the full range
const finalZeros = zeros.filter(z => z <= cutoffT);
console.log(`\nCutoff T: ${cutoffT}`);
console.log(`Final zero count: ${finalZeros.length}`);

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------
const rounded = finalZeros.map(z => +z.toFixed(6));

const header = `/* Nontrivial zeros of ζ on the critical line: imaginary parts t_k.
   Generated by scripts/genzeros.mjs using Dirichlet eta series (3000 terms
   + averaged extra term), golden-section refinement to ≤1e-8, threshold |ζ|<${ZERO_THRESH}.
   Cutoff T = ${cutoffT}. Count = ${rounded.length}.
   Max deviation on first 29 vs LMFDB published values: ${maxDev.toFixed(6)}. */
`;

// Format as rows of 8
const rows = [];
for (let i = 0; i < rounded.length; i += 8) {
  rows.push("  " + rounded.slice(i, i + 8).join(", "));
}
const body = `export const ZEROS = [\n${rows.join(",\n")},\n];\n`;

writeFileSync(OUT, header + "\n" + body, "utf8");
console.log(`\nWrote ${OUT}`);
