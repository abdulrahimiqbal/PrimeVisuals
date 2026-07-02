#!/usr/bin/env node
// COUNCIL 2 FEASIBILITY ANNEX — parity-battery pilot.
// Instrument calibration only: NOT a research finding, NOT a KNOWLEDGE.md entry.
//
// Measures, at N=10^7, the cost and noise floor of the λ-bitstream battery
// proposed in edge.md (angles 1/4/6) against BOTH nulls:
//   - Bernoulli: iid ±1 (the naive null),
//   - RCM: random completely multiplicative ±1 (f(p) iid ±1, extended
//     multiplicatively) — the null that carries every constraint forced by
//     multiplicativity alone (e.g. f(n^2)=+1), so real-vs-RCM isolates
//     arithmetic content from algebraic bookkeeping.
//
// Usage: node scripts/council2-pilot.mjs [N] [outDir]

import fs from "node:fs";
import path from "node:path";

const N = Number(process.argv[2] || 10_000_000);
const outDir = process.argv[3] || "logs/council2-artifacts";
const BERNOULLI_SEEDS = [12345, 271828, 314159, 161803, 424242];
const RCM_SEEDS = [777001, 777002, 777003];
const SHIFTS = [1, 2, 3, 4, 5, 6, 7, 8];
const TRIPLES = [
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 4],
];
const BLOCK_KS = Array.from({ length: 12 }, (_, i) => i + 1);

fs.mkdirSync(outDir, { recursive: true });

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

function timed(label, fn) {
  const t0 = performance.now();
  const value = fn();
  const ms = performance.now() - t0;
  timings.push({ label, ms: Math.round(ms) });
  console.log(`${label}: ${(ms / 1000).toFixed(2)}s`);
  return value;
}

const timings = [];

// --- sequences -------------------------------------------------------------

function smallestPrimeFactors(n) {
  const spf = new Int32Array(n + 1);
  for (let i = 2; i <= n; i++) {
    if (spf[i] === 0) {
      for (let j = i; j <= n; j += i) {
        if (spf[j] === 0) spf[j] = i;
      }
    }
  }
  return spf;
}

function liouvilleFromSpf(spf, n) {
  const lambda = new Int8Array(n + 1);
  lambda[1] = 1;
  for (let i = 2; i <= n; i++) {
    lambda[i] = -lambda[(i / spf[i]) | 0];
  }
  return lambda;
}

function rcmFromSpf(spf, n, seed) {
  const next = rng(seed);
  const f = new Int8Array(n + 1);
  f[1] = 1;
  for (let i = 2; i <= n; i++) {
    if (spf[i] === i) {
      f[i] = next() < 0.5 ? -1 : 1;
    } else {
      f[i] = f[(i / spf[i]) | 0] * f[spf[i]];
    }
  }
  return f;
}

function bernoulli(n, seed) {
  const next = rng(seed);
  const f = new Int8Array(n + 1);
  f[1] = 1;
  for (let i = 1; i <= n; i++) f[i] = next() < 0.5 ? -1 : 1;
  return f;
}

// --- statistics ------------------------------------------------------------

function twoPoint(seq, n, h) {
  let s = 0;
  for (let i = 1; i + h <= n; i++) s += seq[i] * seq[i + h];
  return s / (n - h);
}

function threePoint(seq, n, h1, h2) {
  const h = Math.max(h1, h2);
  let s = 0;
  for (let i = 1; i + h <= n; i++) s += seq[i] * seq[i + h1] * seq[i + h2];
  return s / (n - h);
}

function blockStats(seq, n, k) {
  const size = 1 << k;
  const mask = size - 1;
  const counts = new Float64Array(size);
  let idx = 0;
  for (let i = 1; i < k; i++) idx = ((idx << 1) | (seq[i] > 0 ? 1 : 0)) & mask;
  for (let i = k; i <= n; i++) {
    idx = ((idx << 1) | (seq[i] > 0 ? 1 : 0)) & mask;
    counts[idx] += 1;
  }
  const total = n - k + 1;
  const expected = total / size;
  let chi2 = 0;
  let entropy = 0;
  for (let c = 0; c < size; c++) {
    const d = counts[c] - expected;
    chi2 += (d * d) / expected;
    if (counts[c] > 0) {
      const p = counts[c] / total;
      entropy -= p * Math.log2(p);
    }
  }
  const df = size - 1;
  return { k, chi2, chi2z: (chi2 - df) / Math.sqrt(2 * df), entropy };
}

function lz78Phrases(seq, n) {
  // phrase count of the ±1 bitstream; iid ±1 has ~ n/log2(n) phrases.
  const dict = new Map();
  let node = 0;
  let nextId = 1;
  let phrases = 0;
  for (let i = 1; i <= n; i++) {
    const key = node * 2 + (seq[i] > 0 ? 1 : 0);
    const found = dict.get(key);
    if (found === undefined) {
      dict.set(key, nextId++);
      phrases += 1;
      node = 0;
    } else {
      node = found;
    }
  }
  if (node !== 0) phrases += 1;
  return phrases;
}

function battery(name, seq, n) {
  const out = { name };
  out.twoPoint = SHIFTS.map((h) => ({ h, c: twoPoint(seq, n, h) }));
  out.threePoint = TRIPLES.map(([h1, h2]) => ({
    h1,
    h2,
    c: threePoint(seq, n, h1, h2),
  }));
  out.blocks = BLOCK_KS.map((k) => blockStats(seq, n, k));
  out.lz78 = lz78Phrases(seq, n);
  return out;
}

function summarizeNull(results, pick) {
  const values = results.map(pick);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length,
  );
  return { mean, sd };
}

// --- run -------------------------------------------------------------------

console.log(`council2 pilot at N=${N}`);
const spf = timed("spf sieve", () => smallestPrimeFactors(N));
const lambda = timed("liouville from spf", () => liouvilleFromSpf(spf, N));
const rcms = RCM_SEEDS.map((seed) =>
  timed(`rcm seed ${seed}`, () => rcmFromSpf(spf, N, seed)),
);
const berns = BERNOULLI_SEEDS.map((seed) =>
  timed(`bernoulli seed ${seed}`, () => bernoulli(N, seed)),
);

const real = timed("battery real lambda", () => battery("lambda", lambda, N));
const rcmResults = rcms.map((seq, i) =>
  timed(`battery rcm ${RCM_SEEDS[i]}`, () => battery(`rcm-${RCM_SEEDS[i]}`, seq, N)),
);
const bernResults = berns.map((seq, i) =>
  timed(`battery bernoulli ${BERNOULLI_SEEDS[i]}`, () =>
    battery(`bern-${BERNOULLI_SEEDS[i]}`, seq, N),
  ),
);

const noiseFloor = 1 / Math.sqrt(N);
const report = {
  N,
  noiseFloor,
  generatedAt: new Date().toISOString(),
  timingsMs: timings,
  real,
  nulls: {
    bernoulli: bernResults,
    rcm: rcmResults,
  },
  comparison: {
    twoPoint: SHIFTS.map((h, hi) => ({
      h,
      real: real.twoPoint[hi].c,
      bernoulli: summarizeNull(bernResults, (r) => r.twoPoint[hi].c),
      rcm: summarizeNull(rcmResults, (r) => r.twoPoint[hi].c),
    })),
    threePoint: TRIPLES.map(([h1, h2], ti) => ({
      h1,
      h2,
      real: real.threePoint[ti].c,
      bernoulli: summarizeNull(bernResults, (r) => r.threePoint[ti].c),
      rcm: summarizeNull(rcmResults, (r) => r.threePoint[ti].c),
    })),
    blocks: BLOCK_KS.map((k, ki) => ({
      k,
      realChi2z: real.blocks[ki].chi2z,
      realEntropy: real.blocks[ki].entropy,
      bernoulliChi2z: summarizeNull(bernResults, (r) => r.blocks[ki].chi2z),
      rcmChi2z: summarizeNull(rcmResults, (r) => r.blocks[ki].chi2z),
      rcmEntropy: summarizeNull(rcmResults, (r) => r.blocks[ki].entropy),
    })),
    lz78: {
      real: real.lz78,
      iidAsymptote: N / Math.log2(N),
      bernoulli: summarizeNull(bernResults, (r) => r.lz78),
      rcm: summarizeNull(rcmResults, (r) => r.lz78),
    },
  },
};

const jsonPath = path.join(outDir, `pilot-${N}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const fmt = (x, d = 6) => (typeof x === "number" ? x.toFixed(d) : x);
const lines = [];
lines.push(`# Council 2 feasibility annex — parity-battery pilot at N=${N}`);
lines.push("");
lines.push(
  "Instrument calibration only: NOT a research finding and NOT a KNOWLEDGE.md",
);
lines.push(
  "entry. Purpose: cost the λ-bitstream battery, expose the null hierarchy",
);
lines.push(
  "(Bernoulli vs random-completely-multiplicative), and fix the noise floor",
);
lines.push(`before Track P sprints. Noise floor 1/sqrt(N) = ${fmt(noiseFloor, 7)}.`);
lines.push("");
lines.push("## Two-point correlations c(h) = mean λ(n)λ(n+h)");
lines.push("");
lines.push("| h | real λ | Bernoulli mean±sd | RCM mean±sd |");
lines.push("| ---: | ---: | --- | --- |");
for (const row of report.comparison.twoPoint) {
  lines.push(
    `| ${row.h} | ${fmt(row.real)} | ${fmt(row.bernoulli.mean)} ± ${fmt(row.bernoulli.sd)} | ${fmt(row.rcm.mean)} ± ${fmt(row.rcm.sd)} |`,
  );
}
lines.push("");
lines.push("## Three-point correlations mean λ(n)λ(n+h1)λ(n+h2)");
lines.push("");
lines.push("| (h1,h2) | real λ | Bernoulli mean±sd | RCM mean±sd |");
lines.push("| --- | ---: | --- | --- |");
for (const row of report.comparison.threePoint) {
  lines.push(
    `| (${row.h1},${row.h2}) | ${fmt(row.real)} | ${fmt(row.bernoulli.mean)} ± ${fmt(row.bernoulli.sd)} | ${fmt(row.rcm.mean)} ± ${fmt(row.rcm.sd)} |`,
  );
}
lines.push("");
lines.push("## Block-pattern χ² z-scores and block entropy");
lines.push("");
lines.push(
  "| k | real χ²z | Bern χ²z mean±sd | RCM χ²z mean±sd | real H_k | RCM H_k mean |",
);
lines.push("| ---: | ---: | --- | --- | ---: | ---: |");
for (const row of report.comparison.blocks) {
  lines.push(
    `| ${row.k} | ${fmt(row.realChi2z, 2)} | ${fmt(row.bernoulliChi2z.mean, 2)} ± ${fmt(row.bernoulliChi2z.sd, 2)} | ${fmt(row.rcmChi2z.mean, 2)} ± ${fmt(row.rcmChi2z.sd, 2)} | ${fmt(row.realEntropy)} | ${fmt(row.rcmEntropy.mean)} |`,
  );
}
lines.push("");
lines.push("## LZ78 phrase counts");
lines.push("");
lines.push(
  `real ${report.comparison.lz78.real}; iid asymptote ~${Math.round(report.comparison.lz78.iidAsymptote)}; ` +
    `Bernoulli ${fmt(report.comparison.lz78.bernoulli.mean, 1)} ± ${fmt(report.comparison.lz78.bernoulli.sd, 1)}; ` +
    `RCM ${fmt(report.comparison.lz78.rcm.mean, 1)} ± ${fmt(report.comparison.lz78.rcm.sd, 1)}.`,
);
lines.push("");
lines.push("## Timings");
lines.push("");
for (const t of timings) lines.push(`- ${t.label}: ${(t.ms / 1000).toFixed(2)}s`);
lines.push("");
lines.push(
  "Scale note: at N=10^8 the SPF sieve needs ~400MB (Int32Array); switch to a",
);
lines.push(
  "Uint8 Ω-parity sieve (~100MB) or segmented sieve. Expected battery runtime",
);
lines.push("scales ~linearly from the timings above.");
lines.push("");
fs.writeFileSync(path.join(outDir, `pilot-${N}.md`), lines.join("\n"));
console.log(`wrote ${jsonPath} and pilot-${N}.md`);
