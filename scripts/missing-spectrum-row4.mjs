#!/usr/bin/env node
// P1-CL ROW 4 — time-domain flank: the preregistered H1 decision + Gowers + ML probe.
// (prompts/parity-battery.md)
//
// H1 (preregistered in the council pilot): the lambda k-block chi^2 drift at
// k=10..12 (pilot z ~ 2.9-3.1 at N=10^7) replicates at N=10^8 against
// >=20 Bernoulli and >=10 RCM seeds. Decide either way. If it replicates
// (real z beyond null band by >3 null-sd), run a Markov-order-3 twin to test
// whether low-order correlations explain it.
// Also: Gowers U2 (exact, FFT) and U3 (sampled h) on a 2^22 window; ML probe
// (logistic SGD, strict range holdout) at N=10^7.
//
// Usage: node scripts/missing-spectrum-row4.mjs [N] [outDir]

import fs from "node:fs";
import path from "node:path";

const N = Number(process.argv[2] || 100_000_000);
const outDir = process.argv[3] || "logs/missing-spectrum-artifacts";
const BLOCK_KS = [10, 11, 12];
const BERN_SEEDS = Array.from({ length: 20 }, (_, i) => 100 + i);
const RCM_SEEDS = Array.from({ length: 10 }, (_, i) => 200 + i);

fs.mkdirSync(outDir, { recursive: true });
const timings = [];
function timed(label, fn) {
  const t0 = performance.now();
  const value = fn();
  console.log(`${label}: ${((performance.now() - t0) / 1000).toFixed(1)}s`);
  timings.push({ label, ms: Math.round(performance.now() - t0) });
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

// --- lambda via Omega-parity toggles over prime powers ----------------------

const primes = timed("prime sieve", () => {
  const composite = new Uint8Array(N + 1);
  const list = [];
  const sqrtN = Math.floor(Math.sqrt(N));
  for (let p = 2; p <= N; p++) {
    if (composite[p]) continue;
    list.push(p);
    if (p <= sqrtN) for (let j = p * p; j <= N; j += p) composite[j] = 1;
  }
  return new Uint32Array(list);
});

function omegaParityToggles(includePrime) {
  // sign(n) = (-1)^{sum over prime powers p^k | n with includePrime(p)}
  const s = new Int8Array(N + 1).fill(1);
  s[0] = 0;
  for (let pi = 0; pi < primes.length; pi++) {
    const p = primes[pi];
    if (!includePrime(pi)) continue;
    for (let pk = p; pk <= N; pk *= p) {
      for (let j = pk; j <= N; j += pk) s[j] = -s[j];
      if (pk > N / p) break;
    }
  }
  return s;
}

const lambda = timed("lambda sieve (Omega parity)", () => omegaParityToggles(() => true));

// --- block chi^2 -------------------------------------------------------------

function blockChi2(seq) {
  const results = [];
  for (const k of BLOCK_KS) {
    const size = 1 << k;
    const mask = size - 1;
    const counts = new Float64Array(size);
    let idx = 0;
    for (let i = 1; i < k; i++) idx = ((idx << 1) | (seq[i] > 0 ? 1 : 0)) & mask;
    for (let i = k; i <= N; i++) {
      idx = ((idx << 1) | (seq[i] > 0 ? 1 : 0)) & mask;
      counts[idx] += 1;
    }
    const total = N - k + 1;
    const expected = total / size;
    let chi2 = 0;
    for (let c = 0; c < size; c++) {
      const d = counts[c] - expected;
      chi2 += (d * d) / expected;
    }
    const df = size - 1;
    results.push({ k, chi2z: (chi2 - df) / Math.sqrt(2 * df) });
  }
  return results;
}

const realBlocks = timed("real block chi2", () => blockChi2(lambda));

const nullBlocks = { bernoulli: [], rcm: [] };
timed("bernoulli null blocks (20 seeds)", () => {
  const buf = new Int8Array(N + 1);
  for (const seed of BERN_SEEDS) {
    const next = rng(seed);
    for (let n = 1; n <= N; n++) buf[n] = next() < 0.5 ? -1 : 1;
    nullBlocks.bernoulli.push({ seed, blocks: blockChi2(buf) });
  }
});
timed("rcm null blocks (10 seeds)", () => {
  for (const seed of RCM_SEEDS) {
    const next = rng(seed);
    const coins = new Uint8Array(primes.length);
    for (let i = 0; i < primes.length; i++) coins[i] = next() < 0.5 ? 1 : 0;
    const s = omegaParityToggles((pi) => coins[pi] === 1);
    nullBlocks.rcm.push({ seed, blocks: blockChi2(s) });
  }
});

function h1Verdict() {
  const rows = [];
  for (let ki = 0; ki < BLOCK_KS.length; ki++) {
    const real = realBlocks[ki].chi2z;
    const nulls = [
      ...nullBlocks.bernoulli.map((r) => r.blocks[ki].chi2z),
      ...nullBlocks.rcm.map((r) => r.blocks[ki].chi2z),
    ];
    const mean = nulls.reduce((a, b) => a + b, 0) / nulls.length;
    const sd = Math.sqrt(nulls.reduce((a, b) => a + (b - mean) ** 2, 0) / nulls.length);
    rows.push({
      k: BLOCK_KS[ki],
      realChi2z: real,
      nullMean: mean,
      nullSd: sd,
      zOfZ: (real - mean) / (sd || 1),
    });
  }
  return rows;
}
const h1 = h1Verdict();
console.log("--- H1 decision (k, real chi2z, null mean±sd, z-of-z) ---");
for (const r of h1) {
  console.log(
    `k=${r.k}: real=${r.realChi2z.toFixed(2)} null=${r.nullMean.toFixed(2)}±${r.nullSd.toFixed(2)} zOfZ=${r.zOfZ.toFixed(2)}`,
  );
}

// optional Markov-order-3 twin, only if H1 replicated (any zOfZ > 3)
let markovTwin = null;
if (h1.some((r) => r.zOfZ > 3)) {
  markovTwin = timed("markov-order-3 twin (5 seeds)", () => {
    const m = 3;
    const size = 1 << m;
    const trans = new Float64Array(size * 2);
    let idx = 0;
    for (let i = 1; i < m; i++) idx = ((idx << 1) | (lambda[i] > 0 ? 1 : 0)) & (size - 1);
    for (let i = m; i < N; i++) {
      idx = ((idx << 1) | (lambda[i] > 0 ? 1 : 0)) & (size - 1);
      trans[idx * 2 + (lambda[i + 1] > 0 ? 1 : 0)] += 1;
    }
    const twins = [];
    const buf = new Int8Array(N + 1);
    for (const seed of [301, 302, 303, 304, 305]) {
      const next = rng(seed);
      let state = 0;
      for (let n = 1; n <= N; n++) {
        const p1 = trans[state * 2 + 1] / (trans[state * 2] + trans[state * 2 + 1] || 1);
        const bit = next() < p1 ? 1 : 0;
        buf[n] = bit ? 1 : -1;
        state = ((state << 1) | bit) & (size - 1);
      }
      twins.push({ seed, blocks: blockChi2(buf) });
    }
    return twins;
  });
}

// --- Gowers U2 (exact) and U3 (sampled) on a 2^22 window --------------------

function fft(re, im, invert) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((2 * Math.PI) / len) * (invert ? -1 : 1);
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cwr = 1;
      let cwi = 0;
      for (let j = 0; j < len / 2; j++) {
        const ur = re[i + j];
        const ui = im[i + j];
        const vr = re[i + j + len / 2] * cwr - im[i + j + len / 2] * cwi;
        const vi = re[i + j + len / 2] * cwi + im[i + j + len / 2] * cwr;
        re[i + j] = ur + vr;
        im[i + j] = ui + vi;
        re[i + j + len / 2] = ur - vr;
        im[i + j + len / 2] = ui - vi;
        const nwr = cwr * wr - cwi * wi;
        cwi = cwr * wi + cwi * wr;
        cwr = nwr;
      }
    }
  }
}

const W = 1 << 22;
const W_START = 1 << 20;

function u2NormFourth(seq, offset) {
  // ||f||_{U2}^4 = sum_r |fhat(r)|^4, fhat = FFT/W
  const re = new Float64Array(W);
  const im = new Float64Array(W);
  for (let i = 0; i < W; i++) re[i] = seq[offset + i];
  fft(re, im, false);
  let s = 0;
  for (let r = 0; r < W; r++) {
    const m2 = (re[r] * re[r] + im[r] * im[r]) / (W * W);
    s += m2 * m2;
  }
  return s;
}

function u3NormEighth(seq, offset, hs) {
  // ||f||_{U3}^8 = E_h ||Delta_h f||_{U2}^4 (sampled over hs)
  const buf = new Int8Array(W);
  let acc = 0;
  for (const h of hs) {
    for (let i = 0; i < W; i++) buf[i] = seq[offset + i] * seq[offset + i + h];
    acc += u2NormFourth(buf, 0);
  }
  return acc / hs.length;
}

const gowers = timed("gowers U2/U3 (real + 2+2 nulls)", () => {
  const hs = Array.from({ length: 16 }, (_, i) => 37 + i * 4099);
  const out = { window: W, start: W_START, sampledHs: hs, rows: [] };
  const bern = (seed) => {
    const next = rng(seed);
    const buf = new Int8Array(W_START + W + 70000);
    for (let i = 0; i < buf.length; i++) buf[i] = next() < 0.5 ? -1 : 1;
    return buf;
  };
  const sequences = [
    { name: "lambda", seq: lambda, offset: W_START },
    { name: "bern-401", seq: bern(401), offset: W_START },
    { name: "bern-402", seq: bern(402), offset: W_START },
    {
      name: "rcm-403",
      seq: (() => {
        const next = rng(403);
        const coins = new Uint8Array(primes.length);
        for (let i = 0; i < primes.length; i++) coins[i] = next() < 0.5 ? 1 : 0;
        return omegaParityToggles((pi) => coins[pi] === 1);
      })(),
      offset: W_START,
    },
    {
      name: "rcm-404",
      seq: (() => {
        const next = rng(404);
        const coins = new Uint8Array(primes.length);
        for (let i = 0; i < primes.length; i++) coins[i] = next() < 0.5 ? 1 : 0;
        return omegaParityToggles((pi) => coins[pi] === 1);
      })(),
      offset: W_START,
    },
  ];
  for (const { name, seq, offset } of sequences) {
    const u2 = Math.pow(u2NormFourth(seq, offset), 1 / 4);
    const u3 = Math.pow(u3NormEighth(seq, offset, hs), 1 / 8);
    out.rows.push({ name, u2, u3 });
    console.log(`${name}: U2=${u2.toExponential(4)} U3=${u3.toExponential(4)}`);
  }
  return out;
});

// --- ML probe: logistic SGD, strict range holdout ---------------------------

function mlProbe(seq, label) {
  // features: previous 8 values + n mod 3,5,7,11 (centered)
  const F = 12;
  const w = new Float64Array(F + 1);
  const lr = 0.05;
  const TRAIN_LO = 1 << 20;
  const TRAIN_HI = 6_000_000;
  const TEST_HI = 10_000_000;
  const feat = new Float64Array(F);
  const fill = (n) => {
    for (let j = 0; j < 8; j++) feat[j] = seq[n - 1 - j];
    feat[8] = (n % 3) - 1;
    feat[9] = ((n % 5) - 2) / 2;
    feat[10] = ((n % 7) - 3) / 3;
    feat[11] = ((n % 11) - 5) / 5;
  };
  for (let epoch = 0; epoch < 2; epoch++) {
    for (let n = TRAIN_LO; n < TRAIN_HI; n++) {
      fill(n);
      let z = w[F];
      for (let j = 0; j < F; j++) z += w[j] * feat[j];
      const p = 1 / (1 + Math.exp(-z));
      const y = seq[n] > 0 ? 1 : 0;
      const g = y - p;
      w[F] += lr * g;
      for (let j = 0; j < F; j++) w[j] += lr * g * feat[j];
    }
  }
  let correct = 0;
  let total = 0;
  for (let n = TRAIN_HI; n < TEST_HI; n++) {
    fill(n);
    let z = w[F];
    for (let j = 0; j < F; j++) z += w[j] * feat[j];
    const pred = z > 0 ? 1 : -1;
    if (pred === (seq[n] > 0 ? 1 : -1)) correct++;
    total++;
  }
  const acc = correct / total;
  console.log(`${label}: holdout accuracy ${acc.toFixed(6)} (n=${total})`);
  return { label, accuracy: acc, testCount: total, weights: Array.from(w) };
}

const ml = timed("ML probe (real + 2+2 nulls)", () => {
  const rows = [mlProbe(lambda, "lambda")];
  const buf = new Int8Array(10_000_001);
  for (const seed of [501, 502]) {
    const next = rng(seed);
    for (let n = 1; n <= 10_000_000; n++) buf[n] = next() < 0.5 ? -1 : 1;
    rows.push(mlProbe(buf, `bern-${seed}`));
  }
  for (const seed of [503, 504]) {
    const next = rng(seed);
    const coins = new Uint8Array(primes.length);
    for (let i = 0; i < primes.length; i++) coins[i] = next() < 0.5 ? 1 : 0;
    rows.push(mlProbe(omegaParityToggles((pi) => coins[pi] === 1), `rcm-${seed}`));
  }
  return rows;
});

const report = {
  N,
  generatedAt: new Date().toISOString(),
  h1,
  realBlocks,
  nullBlocks: {
    bernoulli: nullBlocks.bernoulli.map((r) => ({ seed: r.seed, z: r.blocks.map((b) => b.chi2z) })),
    rcm: nullBlocks.rcm.map((r) => ({ seed: r.seed, z: r.blocks.map((b) => b.chi2z) })),
  },
  markovTwin: markovTwin
    ? markovTwin.map((r) => ({ seed: r.seed, z: r.blocks.map((b) => b.chi2z) }))
    : null,
  gowers,
  ml: ml.map(({ label, accuracy, testCount }) => ({ label, accuracy, testCount })),
  timingsMs: timings,
};
fs.writeFileSync(path.join(outDir, `row4-flank-N${N}.json`), JSON.stringify(report, null, 2));
console.log(`wrote row4-flank-N${N}.json`);
