#!/usr/bin/env node
// P1-CL ROW 3 — Montgomery-Soundararajan short-interval variance
// (prompts/parity-battery.md; around-the-line physics, NOT a new line).
//
// V(X,H) = mean over x in [X,2X] of (psi(x+H) - psi(x) - H)^2, sampled on a
// grid; conjectured V ~ H (log(X/H) - B), B = gamma + log 2pi ~ 2.4152.
// Deliverable: V/H vs log(X/H) for an H ladder, real vs 5 Cramer twins.
//
// Usage: node scripts/missing-spectrum-row3.mjs [X] [outDir]

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes } from "../src/core/math.js";

const X = Number(process.argv[2] || 10_000_000);
const outDir = process.argv[3] || "logs/missing-spectrum-artifacts";
const H_LADDER = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400];
const SAMPLE_COUNT = 8192;
const CRAMER_SEEDS = [12345, 271828, 314159, 161803, 424242];
const B_CONST = 0.5772156649 + Math.log(2 * Math.PI); // gamma + log 2pi

fs.mkdirSync(outDir, { recursive: true });
const HI = 2 * X + H_LADDER[H_LADDER.length - 1] + 1;

// cumulative psi over [0, HI] via Lambda toggles (primes + prime powers)
function cumulativePsiFromPrimes(markPrime) {
  // markPrime(cb): calls cb(p) for each "prime" p <= HI
  const lam = new Float64Array(HI + 1);
  markPrime((p) => {
    const logp = Math.log(p);
    for (let pk = p; pk <= HI; pk *= p) {
      lam[pk] += logp;
      if (pk > HI / p) break;
    }
  });
  let acc = 0;
  for (let i = 0; i <= HI; i++) {
    acc += lam[i];
    lam[i] = acc;
  }
  return lam; // lam[i] = psi(i)
}

function realPsi() {
  const composite = new Uint8Array(HI + 1);
  const sqrtHi = Math.floor(Math.sqrt(HI));
  for (let p = 2; p <= sqrtHi; p++) {
    if (composite[p]) continue;
    for (let j = p * p; j <= HI; j += p) composite[j] = 1;
  }
  return cumulativePsiFromPrimes((cb) => {
    for (let p = 2; p <= HI; p++) if (!composite[p]) cb(p);
  });
}

function cramerPsi(seed) {
  // Cramer fakes carry weight log(p) at fake primes, no prime powers
  const fakes = cramerPrimes(HI, seed);
  const lam = new Float64Array(HI + 1);
  for (const p of fakes) if (p >= 2 && p <= HI) lam[p] += Math.log(p);
  let acc = 0;
  for (let i = 0; i <= HI; i++) {
    acc += lam[i];
    lam[i] = acc;
  }
  return lam;
}

function varianceCurve(psi) {
  const rows = [];
  for (const H of H_LADDER) {
    let ss = 0;
    for (let s = 0; s < SAMPLE_COUNT; s++) {
      const x = Math.floor(X + ((X - H) * s) / (SAMPLE_COUNT - 1));
      const d = psi[x + H] - psi[x] - H;
      ss += d * d;
    }
    const v = ss / SAMPLE_COUNT;
    rows.push({ H, vOverH: v / H, predicted: Math.log(X / H) - B_CONST });
  }
  return rows;
}

console.log(`Row 3 at X=${X}, HI=${HI}`);
const t0 = performance.now();
const psiReal = realPsi();
console.log(`real psi built in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
const realCurve = varianceCurve(psiReal);

const cramerCurves = [];
for (const seed of CRAMER_SEEDS) {
  const psi = cramerPsi(seed);
  cramerCurves.push({ seed, curve: varianceCurve(psi) });
  console.log(`cramer seed ${seed} done`);
}

const summary = realCurve.map((row, i) => {
  const cvals = cramerCurves.map((c) => c.curve[i].vOverH);
  const mean = cvals.reduce((a, b) => a + b, 0) / cvals.length;
  const sd = Math.sqrt(cvals.reduce((a, b) => a + (b - mean) ** 2, 0) / cvals.length);
  return {
    H: row.H,
    logXoverH: Math.log(X / row.H),
    realVoverH: row.vOverH,
    msPredicted: row.predicted,
    cramerMean: mean,
    cramerSd: sd,
  };
});

const report = { X, B_CONST, generatedAt: new Date().toISOString(), summary, cramerCurves };
fs.writeFileSync(path.join(outDir, `row3-msvariance-X${X}.json`), JSON.stringify(report, null, 2));

console.log("H | log(X/H) | real V/H | MS predicted | cramer mean±sd");
for (const r of summary) {
  console.log(
    `${r.H} | ${r.logXoverH.toFixed(2)} | ${r.realVoverH.toFixed(3)} | ${r.msPredicted.toFixed(3)} | ${r.cramerMean.toFixed(3)} ± ${r.cramerSd.toFixed(3)}`,
  );
}
console.log(`wrote row3-msvariance-X${X}.json`);
