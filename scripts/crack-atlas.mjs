#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT_DIR = path.join(ROOT, "logs", "crack-atlas");
const OFFSETS = [1, 2, 3, 4, 6, 8, 10, 12];
const FEATURE_NAMES = ["mu", "abs_mu", "omega", "tau", "rad"];
const RESIDUE_MODULI = [5, 7, 11, 13, 17, 19, 23, 29, 31];
const WHEELS = [210, 2310, 30030];
const GAP_WINDOWS = [256, 1024, 4096];
const SUMMATORY_WINDOWS = [
  { kind: "fixed", value: 64 },
  { kind: "fixed", value: 256 },
  { kind: "log2", value: 1 },
];
const SUMMATORY_FUNCTIONS = ["mu", "lambda_minus_1", "chowla1"];
const RUN_SEEDS = [12345, 271828, 314159, 161803, 424242];
const AUDIT_SEEDS = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 112358, 141421, 173205, 223606,
  99991, 100003, 444444, 555555, 777777,
  10101, 20202, 30303, 40404, 50505,
  60606, 70707, 80808, 90909, 111111,
];

const DEFAULT_THRESHOLDS = {
  minAbsZ: 6,
  maxLateShrink: 0.5,
  minControlRatio: 3,
  killReproductionFraction: 0.5,
  minBreakthroughN: 32_000_000,
};

const KNOWN_ARTIFACTS = [
  "raw residue expsum peaks",
  "matrix stripes / residue geometry",
  "ordinary adjacent gap autocorrelation",
  "Lemke Oliver-Soundararajan residue-pair bias",
  "Hardy-Littlewood singular-series main terms",
  "cumulative gap telescoping",
  "Chebyshev psi / Mertens / zeta-zero summatory cancellation",
];

const FAILURE_RULES = {
  "residue geometry": "move to within-residue residuals and stronger wheel conditioning",
  "density/Cramér noise": "increase Cramér seed count and require larger real/control separation",
  "composite control reproduced it": "add primality-specific contrast features using Lambda, Mobius, and prime-order conditioning",
  "LO-S transition artifact": "search non-adjacent prime transitions and tuple-tail residuals",
  "Hardy-Littlewood artifact": "condition tuple residuals on local environment after singular-series subtraction",
  "summatory/zeta disguise": "move from global sums to local-window and conditioned residuals",
  "unstable under range": "increase range and reduce feature grid size",
  "insufficient power": "increase range and keep only the highest-power coordinate families",
};

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      args._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === "quick" || key === "json" || key === "mirror") {
      args[key] = true;
      continue;
    }
    args[key] = argv[++i];
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function formatNumber(x, digits = 6) {
  if (!Number.isFinite(x)) return "NA";
  if (Math.abs(x) >= 1000) return x.toFixed(2);
  return x.toFixed(digits);
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function totient(n) {
  let m = Math.max(1, Math.round(n));
  let out = m;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    out -= Math.floor(out / p);
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= Math.floor(out / m);
  return out;
}

function isAdmissiblePairShift(h) {
  return h > 0 && h % 2 === 0;
}

function tupleShifts(maxH = 120) {
  const out = [];
  for (let h = 2; h <= maxH; h += 2) if (isAdmissiblePairShift(h)) out.push(h);
  return out;
}

function cycleRanges(cycle = 1, quick = false, overrideN = null) {
  if (quick) {
    const N = overrideN ? Number(overrideN) : 12000;
    return {
      cycle,
      discoveryN: N,
      confirmationN: Math.max(N * 2, 24000),
      holdoutN: Math.max(N * 4, 48000),
    };
  }
  if (overrideN) {
    const N = Number(overrideN);
    return { cycle, discoveryN: N, confirmationN: 4 * N, holdoutN: 16 * N };
  }
  const scales = [
    { discoveryN: 2_000_000, confirmationN: 8_000_000, holdoutN: 32_000_000 },
    { discoveryN: 8_000_000, confirmationN: 32_000_000, holdoutN: 128_000_000 },
    { discoveryN: 32_000_000, confirmationN: 128_000_000, holdoutN: 512_000_000 },
  ];
  return { cycle, ...(scales[Math.max(0, Math.min(scales.length - 1, cycle - 1))]) };
}

export function makeManifest({ cycle = 1, quick = false, N = null, previousFailureSummary = null } = {}) {
  const ranges = cycleRanges(cycle, quick, N);
  const rows = [];
  const add = (row) => rows.push({ ordinal: rows.length + 1, ...row });

  for (const offset of OFFSETS) {
    for (const side of ["minus", "plus"]) {
      for (const feature of FEATURE_NAMES) {
        const featureId = `${feature}_p_${side}_${offset}`;
        add({
          id: `nearby:${featureId}:corr_next_gap`,
          family: "nearby-arithmetic",
          response: "corr_next_gap",
          feature: featureId,
          offset,
          side,
          arithmetic: feature,
          baseline: "raw correlation against g_next/log(p)",
        });
        add({
          id: `nearby:${featureId}:conditional_prev_gap`,
          family: "nearby-arithmetic",
          response: "conditional_corr_prev_gap_bucket",
          feature: featureId,
          offset,
          side,
          arithmetic: feature,
          baseline: "within quartiles of g_prev/log(p)",
        });
        add({
          id: `nearby:${featureId}:bin_mean_gap`,
          family: "nearby-arithmetic",
          response: "bin_mean_gap",
          feature: featureId,
          offset,
          side,
          arithmetic: feature,
          baseline: "top-vs-bottom feature bins for g_next/log(p)",
        });
      }
    }
  }

  for (const window of GAP_WINDOWS) {
    add({
      id: `gapdyn:prev_gap_percentile_w${window}:corr_next_gap`,
      family: "gap-dynamics",
      response: "corr_next_gap",
      feature: `prev_gap_percentile_w${window}`,
      window,
      baseline: "rolling previous-gap percentile",
    });
    add({
      id: `gapdyn:prev_gap_percentile_w${window}:conditional_prev_gap`,
      family: "gap-dynamics",
      response: "conditional_corr_prev_gap_bucket",
      feature: `prev_gap_percentile_w${window}`,
      window,
      baseline: "rolling previous-gap percentile within previous-gap quartiles",
    });
  }

  for (const q of RESIDUE_MODULI) {
    add({
      id: `residue:transition_mod_${q}:lo_s_residual`,
      family: "residue-transition",
      response: "transition_residual",
      modulus: q,
      baseline: "independence of consecutive residue classes; audit subtracts matched composite transition baselines",
      knownArtifactRisk: "LO-S transition artifact",
    });
  }

  for (const h of tupleShifts(120)) {
    add({
      id: `tuple:pair_shift_${h}:hl_residual`,
      family: "tuple-residual",
      response: "hardy_littlewood_pair_residual",
      shift: h,
      baseline: "finite singular-series pair expectation",
      knownArtifactRisk: "Hardy-Littlewood artifact",
    });
  }

  for (const fn of SUMMATORY_FUNCTIONS) {
    for (const window of SUMMATORY_WINDOWS) {
      const w = window.kind === "fixed" ? String(window.value) : window.kind;
      add({
        id: `summatory:${fn}:window_${w}:local_mean`,
        family: "local-summatory",
        response: "local_summatory_mean",
        summatory: fn,
        window,
        baseline: "local-window residual around prime centers",
        knownArtifactRisk: "summatory/zeta disguise",
      });
    }
  }

  const improvement = previousFailureSummary
    ? chooseNextCoordinateFamily(previousFailureSummary)
    : "cycle starts from the full frozen atlas; no prior failure summary applied";

  return {
    schema: "prime-crack-atlas-manifest/v1",
    generatedAt: new Date().toISOString(),
    cycle,
    quick,
    ranges,
    thresholds: DEFAULT_THRESHOLDS,
    controls: {
      runSeeds: RUN_SEEDS,
      auditSeeds: AUDIT_SEEDS,
      wheels: WHEELS,
      compositeMatch: "residue-count-matched composites modulo W=30030",
      shuffles: ["gap-sequence shuffle", "feature shuffle"],
      directLeakageScrub: "nearby p+a rows drop cases with g_next<=a; nearby p-a rows drop cases with g_prev<=a; local summatory windows subtract the center n=p term",
    },
    excludedKnownArtifacts: KNOWN_ARTIFACTS,
    improvementRule: improvement,
    rows,
  };
}

function chooseNextCoordinateFamily(summary) {
  const counts = summary?.deathReasonCounts || {};
  let topReason = "insufficient power";
  let topCount = -1;
  for (const [reason, count] of Object.entries(counts)) {
    if (count > topCount) {
      topReason = reason;
      topCount = count;
    }
  }
  return {
    topDeathReason: topReason,
    addExactlyOneCoordinateFamily: FAILURE_RULES[topReason] || FAILURE_RULES["insufficient power"],
  };
}

export function buildArithmeticTables(limit) {
  const N = Math.max(2, Math.floor(limit));
  const isp = new Uint8Array(N + 1);
  const spf = new Int32Array(N + 1);
  const exp = new Uint8Array(N + 1);
  const mu = new Int8Array(N + 1);
  const omega = new Uint8Array(N + 1);
  const tau = new Uint16Array(N + 1);
  const rad = new Uint32Array(N + 1);
  const primes = [];
  mu[1] = 1;
  tau[1] = 1;
  rad[1] = 1;
  for (let i = 2; i <= N; i++) {
    if (!spf[i]) {
      spf[i] = i;
      isp[i] = 1;
      primes.push(i);
      exp[i] = 1;
      mu[i] = -1;
      omega[i] = 1;
      tau[i] = 2;
      rad[i] = i;
    }
    for (let k = 0; k < primes.length; k++) {
      const p = primes[k];
      const m = i * p;
      if (m > N) break;
      spf[m] = p;
      if (p === spf[i]) {
        exp[m] = exp[i] + 1;
        mu[m] = 0;
        omega[m] = omega[i];
        rad[m] = rad[i];
        tau[m] = Math.round((tau[i] / (exp[i] + 1)) * (exp[i] + 2));
        break;
      }
      exp[m] = 1;
      mu[m] = -mu[i];
      omega[m] = omega[i] + 1;
      rad[m] = rad[i] * p;
      tau[m] = tau[i] * 2;
    }
  }
  return { N, isp, spf, mu, omega, tau, rad, primes };
}

function mangoldtValueFromSpf(n, spf) {
  if (n < 2) return 0;
  const p = spf[n] || n;
  let m = n;
  while (m % p === 0) m = Math.floor(m / p);
  return m === 1 ? Math.log(p) : 0;
}

function buildPrefixTables(tables) {
  const { N, mu, spf } = tables;
  const prefixMu = new Int32Array(N + 1);
  const prefixChowla1 = new Int32Array(N + 1);
  const prefixLambdaMinus1 = new Float64Array(N + 1);
  let m = 0;
  let c = 0;
  let l = 0;
  for (let n = 1; n <= N; n++) {
    m += mu[n] || 0;
    if (n > 1) c += (mu[n - 1] || 0) * (mu[n] || 0);
    l += mangoldtValueFromSpf(n, spf) - 1;
    prefixMu[n] = m;
    prefixChowla1[n] = c;
    prefixLambdaMinus1[n] = l;
  }
  return { prefixMu, prefixChowla1, prefixLambdaMinus1 };
}

export function finitePairSingular(h, cutoff = 1000) {
  if (!isAdmissiblePairShift(h)) return 0;
  const primes = primesUpTo(Math.max(2, cutoff));
  let product = 1;
  for (const ell of primes) {
    const nu = h % ell === 0 ? 1 : 2;
    const denominator = (1 - 1 / ell) ** 2;
    product *= (1 - nu / ell) / denominator;
    if (product === 0) break;
  }
  return product;
}

export function sampleWheelLabels(N, W = 30030, seed = 12345) {
  const random = rng(seed);
  const out = [];
  const phi = totient(W);
  const densityFactor = W / phi;
  for (let n = 2; n <= Math.min(N, W); n++) {
    if (W % n === 0 && isSmallPrime(n)) out.push(n);
  }
  const residues = [];
  for (let r = 1; r < W; r++) if (gcd(r, W) === 1) residues.push(r);
  for (let base = 0; base <= N; base += W) {
    for (const r of residues) {
      const n = base + r;
      if (n < 2 || n > N) continue;
      if (random() < Math.min(0.95, densityFactor / Math.log(n))) out.push(n);
    }
  }
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

function isSmallPrime(n) {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}

export function sampleCompositeResidueMatched(primes, N, W, seed, isp) {
  const targetCounts = new Map();
  for (const p of primes) {
    if (p > N) break;
    const r = p % W;
    targetCounts.set(r, (targetCounts.get(r) || 0) + 1);
  }
  const random = rng(seed);
  const reservoirs = new Map();
  const seen = new Map();
  for (let n = 2; n <= N; n++) {
    if (isp[n] || gcd(n, W) !== 1) continue;
    const r = n % W;
    const k = targetCounts.get(r) || 0;
    if (!k) continue;
    const s = (seen.get(r) || 0) + 1;
    seen.set(r, s);
    let bucket = reservoirs.get(r);
    if (!bucket) {
      bucket = [];
      reservoirs.set(r, bucket);
    }
    if (bucket.length < k) {
      bucket.push(n);
    } else {
      const j = Math.floor(random() * s);
      if (j < k) bucket[j] = n;
    }
  }
  const out = [];
  for (const bucket of reservoirs.values()) out.push(...bucket);
  return out.sort((a, b) => a - b);
}

function recordsFromLabels(labels, upper, tables, prefixTables = null) {
  const rows = [];
  for (let i = 1; i + 1 < labels.length; i++) {
    const prev = labels[i - 1];
    const p = labels[i];
    const next = labels[i + 1];
    if (p > upper) break;
    if (p < 3 || next <= p) continue;
    rows.push({
      index: i,
      p,
      prev,
      next,
      gPrev: p - prev,
      gNext: next - p,
      y: (next - p) / Math.log(p),
      prevNorm: (p - prev) / Math.log(p),
      tables,
      prefixTables,
    });
  }
  return rows;
}

function blockSpecs(N) {
  return [
    { label: "B1", lo: 0, hi: Math.floor(N / 4) },
    { label: "B2", lo: Math.floor(N / 4), hi: Math.floor(N / 2) },
    { label: "B3", lo: Math.floor(N / 2), hi: N },
  ];
}

function rowsInBlock(records, block) {
  return records.filter((r) => r.p > block.lo && r.p <= block.hi);
}

function featureValue(record, row, gapPercentiles) {
  if (row.family === "gap-dynamics") {
    const series = gapPercentiles.get(row.window);
    return series ? series[record.index] : NaN;
  }
  if (row.family !== "nearby-arithmetic") return NaN;
  if (row.side === "plus" && record.gNext <= row.offset) return NaN;
  if (row.side === "minus" && record.gPrev <= row.offset) return NaN;
  const n = row.side === "minus" ? record.p - row.offset : record.p + row.offset;
  if (n < 1 || n > record.tables.N) return NaN;
  const { mu, omega, tau, rad } = record.tables;
  switch (row.arithmetic) {
    case "mu": return mu[n] || 0;
    case "abs_mu": return Math.abs(mu[n] || 0);
    case "omega": return omega[n] || 0;
    case "tau": return tau[n] || 0;
    case "rad": return rad[n] || 0;
    default: return NaN;
  }
}

function corrFromPairs(pairs) {
  const n = pairs.length;
  if (n < 8) return { n, effect: 0, z: 0 };
  let sx = 0, sy = 0;
  for (const [x, y] of pairs) {
    sx += x;
    sy += y;
  }
  const mx = sx / n;
  const my = sy / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of pairs) {
    const dx = x - mx;
    const dy = y - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  if (sxx <= 0 || syy <= 0) return { n, effect: 0, z: 0 };
  const r = sxy / Math.sqrt(sxx * syy);
  return { n, effect: r, z: r * Math.sqrt(n) };
}

function quantiles(values, cuts) {
  const xs = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!xs.length) return cuts.map(() => NaN);
  return cuts.map((c) => xs[Math.max(0, Math.min(xs.length - 1, Math.floor(c * (xs.length - 1))))]);
}

function scoreCorr(records, row, gapPercentiles) {
  const pairs = [];
  for (const record of records) {
    const x = featureValue(record, row, gapPercentiles);
    if (Number.isFinite(x) && Number.isFinite(record.y)) pairs.push([x, record.y]);
  }
  return corrFromPairs(pairs);
}

function scoreConditionalCorr(records, row, gapPercentiles) {
  const prevs = records.map((r) => r.prevNorm).filter(Number.isFinite);
  const [q1, q2, q3] = quantiles(prevs, [0.25, 0.5, 0.75]);
  const buckets = [[], [], [], []];
  for (const record of records) {
    const x = featureValue(record, row, gapPercentiles);
    if (!Number.isFinite(x) || !Number.isFinite(record.y)) continue;
    const b = record.prevNorm <= q1 ? 0 : record.prevNorm <= q2 ? 1 : record.prevNorm <= q3 ? 2 : 3;
    buckets[b].push([x, record.y]);
  }
  const residualPairs = [];
  for (const bucket of buckets) {
    if (bucket.length < 4) continue;
    const mx = bucket.reduce((s, p) => s + p[0], 0) / bucket.length;
    const my = bucket.reduce((s, p) => s + p[1], 0) / bucket.length;
    for (const [x, y] of bucket) residualPairs.push([x - mx, y - my]);
  }
  return corrFromPairs(residualPairs);
}

function meanAndVariance(values) {
  const n = values.length;
  if (!n) return { n: 0, mean: 0, variance: 0 };
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, n - 1);
  return { n, mean, variance };
}

function welchDiff(a, b) {
  const A = meanAndVariance(a);
  const B = meanAndVariance(b);
  const se = Math.sqrt(A.variance / Math.max(1, A.n) + B.variance / Math.max(1, B.n));
  const effect = A.mean - B.mean;
  return { n: A.n + B.n, effect, z: se > 0 ? effect / se : 0, meanA: A.mean, meanB: B.mean };
}

function scoreBinMean(records, row, gapPercentiles) {
  const xs = [];
  const pairs = [];
  for (const record of records) {
    const x = featureValue(record, row, gapPercentiles);
    if (Number.isFinite(x) && Number.isFinite(record.y)) {
      xs.push(x);
      pairs.push([x, record.y]);
    }
  }
  if (pairs.length < 16) return { n: pairs.length, effect: 0, z: 0 };
  const unique = new Set(xs);
  if (unique.size <= 3) {
    const center = xs.reduce((s, x) => s + x, 0) / xs.length;
    const lo = [];
    const hi = [];
    for (const [x, y] of pairs) (x > center ? hi : lo).push(y);
    return welchDiff(hi, lo);
  }
  const [loCut, hiCut] = quantiles(xs, [0.25, 0.75]);
  const lo = [];
  const hi = [];
  for (const [x, y] of pairs) {
    if (x <= loCut) lo.push(y);
    else if (x >= hiCut) hi.push(y);
  }
  return welchDiff(hi, lo);
}

function transitionMatrixScore(records, q) {
  const counts = Array.from({ length: q }, () => new Float64Array(q));
  const rowSums = new Float64Array(q);
  const colSums = new Float64Array(q);
  let n = 0;
  for (const record of records) {
    const a = record.p % q;
    const b = record.next % q;
    if (a === 0 || b === 0) continue;
    counts[a][b]++;
    rowSums[a]++;
    colSums[b]++;
    n++;
  }
  if (n < q * q) return { n, effect: 0, z: 0 };
  let l1 = 0;
  for (let a = 1; a < q; a++) {
    for (let b = 1; b < q; b++) {
      const observed = counts[a][b] / n;
      const expected = (rowSums[a] / n) * (colSums[b] / n);
      l1 += Math.abs(observed - expected);
    }
  }
  return { n, effect: l1, z: l1 * Math.sqrt(n) };
}

function tupleScore(records, shift, isp) {
  if (!isAdmissiblePairShift(shift)) return { n: 0, effect: 0, z: 0, observed: 0, expected: 0 };
  let observed = 0;
  let expected = 0;
  let variance = 0;
  const singular = finitePairSingular(shift, Math.max(100, Math.floor(Math.sqrt(records.at(-1)?.p || 100))));
  for (const record of records) {
    const q = record.p + shift;
    if (q >= isp.length) continue;
    const prob = Math.min(0.95, singular / Math.log(Math.max(3, q)));
    const hit = isp[q] ? 1 : 0;
    observed += hit;
    expected += prob;
    variance += prob * (1 - prob);
  }
  const residual = observed - expected;
  return {
    n: records.length,
    effect: residual / Math.max(1, Math.sqrt(Math.max(1, expected))),
    z: variance > 0 ? residual / Math.sqrt(variance) : 0,
    observed,
    expected,
  };
}

function localWindowWidth(p, window) {
  if (window.kind === "log2") return Math.max(8, Math.round(Math.log(p) ** 2));
  return Math.max(1, Math.round(window.value));
}

function prefixForSummatory(prefixTables, name) {
  if (name === "mu") return prefixTables.prefixMu;
  if (name === "lambda_minus_1") return prefixTables.prefixLambdaMinus1;
  if (name === "chowla1") return prefixTables.prefixChowla1;
  throw new Error(`unknown summatory function ${name}`);
}

function summatoryValueAt(record, name) {
  const n = record.p;
  const { mu, spf } = record.tables;
  if (name === "mu") return mu[n] || 0;
  if (name === "lambda_minus_1") return mangoldtValueFromSpf(n, spf) - 1;
  if (name === "chowla1") return n > 1 ? (mu[n - 1] || 0) * (mu[n] || 0) : 0;
  throw new Error(`unknown summatory function ${name}`);
}

function scoreLocalSummatory(records, row) {
  if (!records.length || !records[0].prefixTables) return { n: 0, effect: 0, z: 0 };
  const prefix = prefixForSummatory(records[0].prefixTables, row.summatory);
  const values = [];
  for (const record of records) {
    const w = localWindowWidth(record.p, row.window);
    const lo = Math.max(1, record.p - w);
    const hi = Math.min(prefix.length - 1, record.p + w);
    const raw = prefix[hi] - prefix[lo - 1] - summatoryValueAt(record, row.summatory);
    values.push(raw / Math.sqrt(Math.max(1, hi - lo + 1)));
  }
  const s = meanAndVariance(values);
  const se = Math.sqrt(s.variance / Math.max(1, s.n));
  return { n: s.n, effect: s.mean, z: se > 0 ? s.mean / se : 0 };
}

function scoreRow(records, row, context) {
  if (!records.length) return { n: 0, effect: 0, z: 0 };
  if (row.response === "corr_next_gap") return scoreCorr(records, row, context.gapPercentiles);
  if (row.response === "conditional_corr_prev_gap_bucket") return scoreConditionalCorr(records, row, context.gapPercentiles);
  if (row.response === "bin_mean_gap") return scoreBinMean(records, row, context.gapPercentiles);
  if (row.response === "transition_residual") return transitionMatrixScore(records, row.modulus);
  if (row.response === "hardy_littlewood_pair_residual") return tupleScore(records, row.shift, context.tables.isp);
  if (row.response === "local_summatory_mean") return scoreLocalSummatory(records, row);
  return { n: 0, effect: 0, z: 0 };
}

class Fenwick {
  constructor(n) {
    this.n = n;
    this.tree = new Int32Array(n + 2);
  }
  add(index, delta) {
    let i = Math.max(1, Math.min(this.n, index));
    while (i <= this.n) {
      this.tree[i] += delta;
      i += i & -i;
    }
  }
  sum(index) {
    let i = Math.max(0, Math.min(this.n, index));
    let out = 0;
    while (i > 0) {
      out += this.tree[i];
      i -= i & -i;
    }
    return out;
  }
}

function buildGapPercentiles(records, windows) {
  const out = new Map();
  let maxGap = 1;
  for (const record of records) if (record.gPrev > maxGap) maxGap = record.gPrev;
  for (const window of windows) {
    const series = new Float64Array(records.length + 2);
    const bit = new Fenwick(maxGap + 2);
    let count = 0;
    for (let i = 0; i < records.length; i++) {
      const remove = i - window;
      if (remove >= 0) {
        bit.add(records[remove].gPrev + 1, -1);
        count--;
      }
      if (count > 0) {
        const g = records[i].gPrev;
        series[records[i].index] = bit.sum(g + 1) / count;
      } else {
        series[records[i].index] = 0.5;
      }
      bit.add(records[i].gPrev + 1, 1);
      count++;
    }
    out.set(window, series);
  }
  return out;
}

function stablePromotion(blockScores, overall, thresholds) {
  const signs = blockScores.map((b) => Math.sign(b.effect)).filter((s) => s !== 0);
  const sameSign = signs.length === blockScores.length && signs.every((s) => s === signs[0]);
  const b2 = Math.abs(blockScores[1]?.effect || 0);
  const b3 = Math.abs(blockScores[2]?.effect || 0);
  const lateStable = b2 === 0 ? b3 > 0 : b3 >= thresholds.maxLateShrink * b2;
  return {
    sameSign,
    lateStable,
    passesReal: sameSign && lateStable && Math.abs(overall.z) >= thresholds.minAbsZ,
  };
}

function summarizeControls(realZ, controlScores) {
  if (!controlScores.length) {
    return { n: 0, meanAbsZ: 0, maxAbsZ: 0, ratio: Infinity, reproduced: false };
  }
  const abs = controlScores.map((s) => Math.abs(s.z));
  const meanAbsZ = abs.reduce((a, b) => a + b, 0) / abs.length;
  const maxAbsZ = Math.max(...abs);
  const ratio = meanAbsZ > 0 ? Math.abs(realZ) / meanAbsZ : Infinity;
  return {
    n: controlScores.length,
    meanAbsZ,
    maxAbsZ,
    ratio,
    reproduced: maxAbsZ >= DEFAULT_THRESHOLDS.killReproductionFraction * Math.abs(realZ),
  };
}

function buildContext(labels, N, tables, prefixTables, neededGapWindows) {
  const records = recordsFromLabels(labels, N, tables, prefixTables);
  return {
    labels,
    records,
    blocks: blockSpecs(N).map((block) => ({ ...block, records: rowsInBlock(records, block) })),
    gapPercentiles: buildGapPercentiles(records, neededGapWindows),
    tables,
  };
}

function neededGapWindows(rows) {
  return Array.from(new Set(rows.filter((row) => row.family === "gap-dynamics").map((row) => row.window)));
}

function needsSummatory(rows) {
  return rows.some((row) => row.family === "local-summatory");
}

function scoreRowsForContext(rows, context, thresholds) {
  const results = [];
  for (const row of rows) {
    const blockScores = context.blocks.map((block) => ({ label: block.label, ...scoreRow(block.records, row, context) }));
    const overall = scoreRow(context.records, row, context);
    const promotion = stablePromotion(blockScores, overall, thresholds);
    results.push({ ...row, blockScores, overall, promotion });
  }
  return results;
}

function scoreControlsForCandidates(candidates, N, tables, prefixTables, gapWindows, seeds, kind) {
  const scores = new Map(candidates.map((candidate) => [candidate.id, []]));
  for (const seed of seeds) {
    const labels = kind === "cramer"
      ? cramerPrimes(N + 256, seed)
      : sampleWheelLabels(N + 256, 30030, seed);
    const context = buildContext(labels, N, tables, prefixTables, gapWindows);
    for (const candidate of candidates) {
      scores.get(candidate.id).push({ seed, ...scoreRow(context.records, candidate, context) });
    }
  }
  return scores;
}

function classifyDeath(result, audit = null) {
  if (!result.promotion.sameSign || !result.promotion.lateStable) return "unstable under range";
  if (Math.abs(result.overall.z) < result.thresholds.minAbsZ) return "insufficient power";
  const controls = audit?.controls || result.controls;
  if (controls?.cramer?.reproduced || controls?.wheel?.reproduced) return "density/Cramér noise";
  if (controls?.composite?.reproduced) return "composite control reproduced it";
  if (result.family === "residue-transition") return "LO-S transition artifact";
  if (result.family === "tuple-residual") return "Hardy-Littlewood artifact";
  if (result.family === "local-summatory") return "summatory/zeta disguise";
  if (result.family === "nearby-arithmetic" && result.controls?.wheel?.ratio < result.thresholds.minControlRatio) return "residue geometry";
  return "insufficient power";
}

function resultPassesControls(result) {
  if (!result.promotion.passesReal) return false;
  const c = result.controls;
  if (!c) return false;
  return c.cramer.ratio >= result.thresholds.minControlRatio
    && c.wheel.ratio >= result.thresholds.minControlRatio
    && !c.cramer.reproduced
    && !c.wheel.reproduced;
}

export function runAtlas(manifest, { N = manifest.ranges.discoveryN, seeds = RUN_SEEDS } = {}) {
  const maxOffset = Math.max(...OFFSETS, ...tupleShifts(120)) + 256;
  const limit = N + maxOffset;
  const rows = manifest.rows;
  const tables = buildArithmeticTables(limit);
  const prefixTables = needsSummatory(rows) ? buildPrefixTables(tables) : null;
  const primeLabels = tables.primes.filter((p) => p <= limit);
  const gapWindows = neededGapWindows(rows);
  const context = buildContext(primeLabels, N, tables, prefixTables, gapWindows);
  const realResults = scoreRowsForContext(rows, context, manifest.thresholds);
  const prelim = realResults.filter((r) => r.promotion.passesReal);
  const cramerScores = scoreControlsForCandidates(prelim, N, tables, prefixTables, gapWindows, seeds, "cramer");
  const wheelScores = scoreControlsForCandidates(prelim, N, tables, prefixTables, gapWindows, seeds, "wheel");
  const results = realResults.map((result) => {
    const controls = result.promotion.passesReal
      ? {
          cramer: summarizeControls(result.overall.z, cramerScores.get(result.id) || []),
          wheel: summarizeControls(result.overall.z, wheelScores.get(result.id) || []),
        }
      : null;
    const enriched = { ...result, thresholds: manifest.thresholds, controls };
    return {
      ...enriched,
      promoted: resultPassesControls(enriched),
      deathReason: resultPassesControls(enriched) ? null : classifyDeath(enriched),
    };
  });
  return {
    schema: "prime-crack-atlas-run/v1",
    generatedAt: new Date().toISOString(),
    manifest: { schema: manifest.schema, cycle: manifest.cycle, quick: manifest.quick, ranges: manifest.ranges },
    N,
    seeds,
    rowCount: rows.length,
    promotedCount: results.filter((r) => r.promoted).length,
    results: results.sort((a, b) => Math.abs(b.overall.z) - Math.abs(a.overall.z)),
    failureSummary: failureSummary(results),
  };
}

function failureSummary(results) {
  const deathReasonCounts = {};
  for (const result of results) {
    const reason = result.deathReason || "promoted";
    deathReasonCounts[reason] = (deathReasonCounts[reason] || 0) + 1;
  }
  return {
    deathReasonCounts,
    nextCycle: chooseNextCoordinateFamily({ deathReasonCounts }),
  };
}

function selectCandidates(runResult, limit = 20, candidateIds = null) {
  const idSet = candidateIds?.length ? new Set(candidateIds) : null;
  const allowed = (row) => !idSet || idSet.has(row.id);
  const promoted = runResult.results.filter((r) => r.promoted && allowed(r));
  if (promoted.length) return promoted.slice(0, limit);
  return runResult.results.filter((r) => r.promotion.passesReal && allowed(r)).slice(0, limit);
}

export function auditAtlas(manifest, runResult, { N = manifest.ranges.holdoutN, seeds = AUDIT_SEEDS, candidateIds = null } = {}) {
  const candidates = selectCandidates(runResult, 20, candidateIds);
  const maxOffset = Math.max(...OFFSETS, ...tupleShifts(120)) + 256;
  const limit = N + maxOffset;
  const tables = buildArithmeticTables(limit);
  const prefixTables = needsSummatory(candidates) ? buildPrefixTables(tables) : null;
  const primeLabels = tables.primes.filter((p) => p <= limit);
  const gapWindows = neededGapWindows(candidates);
  const context = buildContext(primeLabels, N, tables, prefixTables, gapWindows);
  const real = scoreRowsForContext(candidates, context, manifest.thresholds);
  const cramerScores = scoreControlsForCandidates(candidates, N, tables, prefixTables, gapWindows, seeds, "cramer");
  const wheelScores = scoreControlsForCandidates(candidates, N, tables, prefixTables, gapWindows, seeds, "wheel");
  const compositeScores = new Map(candidates.map((candidate) => [candidate.id, []]));
  for (const seed of seeds) {
    const composite = sampleCompositeResidueMatched(primeLabels, N, 30030, seed, tables.isp);
    const compositeContext = buildContext(composite, N, tables, prefixTables, gapWindows);
    for (const candidate of candidates) {
      compositeScores.get(candidate.id).push({ seed, ...scoreRow(compositeContext.records, candidate, compositeContext) });
    }
  }

  const audited = real.map((result) => {
    const controls = {
      cramer: summarizeControls(result.overall.z, cramerScores.get(result.id) || []),
      wheel: summarizeControls(result.overall.z, wheelScores.get(result.id) || []),
      composite: summarizeControls(result.overall.z, compositeScores.get(result.id) || []),
    };
    const enriched = { ...result, thresholds: manifest.thresholds, controls };
    const meetsBreakthroughScale = N >= manifest.thresholds.minBreakthroughN;
    const passes = meetsBreakthroughScale
      && resultPassesControls(enriched)
      && controls.composite.ratio >= manifest.thresholds.minControlRatio
      && !controls.composite.reproduced
      && result.family !== "residue-transition"
      && result.family !== "tuple-residual"
      && result.family !== "local-summatory";
    return {
      ...enriched,
      breakthroughCandidate: passes,
      deathReason: passes ? null : (meetsBreakthroughScale ? classifyDeath(enriched, { controls }) : "insufficient power"),
    };
  }).sort((a, b) => Math.abs(b.overall.z) - Math.abs(a.overall.z));

  return {
    schema: "prime-crack-atlas-audit/v1",
    generatedAt: new Date().toISOString(),
    manifest: { schema: manifest.schema, cycle: manifest.cycle, quick: manifest.quick, ranges: manifest.ranges },
    N,
    seeds,
    candidateCount: candidates.length,
    breakthroughCount: audited.filter((r) => r.breakthroughCandidate).length,
    results: audited,
    failureSummary: failureSummary(audited),
  };
}

function markdownTable(rows, auditMode = false) {
  const lines = [
    "| id | family | z | effect | verdict | death reason |",
    "| --- | --- | ---: | ---: | --- | --- |",
  ];
  for (const row of rows) {
    const survives = auditMode ? row.breakthroughCandidate : row.promoted;
    lines.push(`| \`${row.id}\` | ${row.family} | ${formatNumber(row.overall.z, 3)} | ${formatNumber(row.overall.effect, 6)} | ${survives ? "SURVIVOR" : "rejected"} | ${row.deathReason || ""} |`);
  }
  return lines.join("\n");
}

export function packAtlas(manifest, runResult, auditResult = null) {
  const source = auditResult || runResult;
  const survivors = auditResult
    ? source.results.filter((r) => r.breakthroughCandidate)
    : source.results.filter((r) => r.promoted);
  const top = source.results.slice(0, 25);
  const lines = [
    "# Prime Crack Atlas Evidence Pack",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Manifest cycle: ${manifest.cycle}`,
    `Range N: ${source.N}`,
    "",
    "## Breakthrough Status",
    "",
    survivors.length
      ? `Survivors: ${survivors.length}. These require human mathematical review before any proof claim.`
      : "No breakthrough has passed the gate in this cycle. The next cycle is selected by the failure taxonomy, not by lowering thresholds.",
    "",
    "## Top Rows",
    "",
    markdownTable(top, !!auditResult),
    "",
    "## Failure Summary",
    "",
    "```json",
    JSON.stringify(source.failureSummary, null, 2),
    "```",
    "",
    "## Frozen Known-Artifact Exclusions",
    "",
    ...manifest.excludedKnownArtifacts.map((x) => `- ${x}`),
    "",
    "## Next Cycle Rule",
    "",
    "```json",
    JSON.stringify(source.failureSummary.nextCycle, null, 2),
    "```",
  ];
  return {
    schema: "prime-crack-atlas-pack/v1",
    generatedAt: new Date().toISOString(),
    survivorCount: survivors.length,
    markdown: `${lines.join("\n")}\n`,
  };
}

function defaultManifestPath(outDir, cycle, quick) {
  return path.join(outDir, `cycle-${cycle}${quick ? "-quick" : ""}-manifest.json`);
}

function defaultRunPath(outDir, cycle, quick) {
  return path.join(outDir, `cycle-${cycle}${quick ? "-quick" : ""}-run.json`);
}

function defaultAuditPath(outDir, cycle, quick) {
  return path.join(outDir, `cycle-${cycle}${quick ? "-quick" : ""}-audit.json`);
}

function main() {
  const [cmd = "help", ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  const quick = !!args.quick;
  const cycle = Number(args.cycle || 1);
  const outDir = path.resolve(args.out || DEFAULT_OUT_DIR);
  ensureDir(outDir);
  const manifestPath = path.resolve(args.manifest || defaultManifestPath(outDir, cycle, quick));
  const runPath = path.resolve(args.run || defaultRunPath(outDir, cycle, quick));
  const auditPath = path.resolve(args.audit || defaultAuditPath(outDir, cycle, quick));

  if (cmd === "plan") {
    const previous = args.previous ? readJson(path.resolve(args.previous)).failureSummary : null;
    const manifest = makeManifest({ cycle, quick, N: args.N, previousFailureSummary: previous });
    writeJson(manifestPath, manifest);
    process.stdout.write(`${JSON.stringify({ ok: true, manifest: manifestPath, rows: manifest.rows.length, ranges: manifest.ranges }, null, 2)}\n`);
    return;
  }

  if (cmd === "run") {
    const manifest = fs.existsSync(manifestPath)
      ? readJson(manifestPath)
      : makeManifest({ cycle, quick, N: args.N });
    if (!fs.existsSync(manifestPath)) writeJson(manifestPath, manifest);
    const result = runAtlas(manifest, { N: Number(args.N || manifest.ranges.discoveryN), seeds: quick ? RUN_SEEDS.slice(0, 2) : RUN_SEEDS });
    writeJson(runPath, result);
    process.stdout.write(`${JSON.stringify({ ok: true, manifest: manifestPath, run: runPath, promoted: result.promotedCount, top: result.results.slice(0, 5).map((r) => ({ id: r.id, z: r.overall.z, deathReason: r.deathReason })) }, null, 2)}\n`);
    return;
  }

  if (cmd === "audit") {
    const manifest = readJson(manifestPath);
    const runResult = readJson(runPath);
    const candidateIds = args.candidate ? String(args.candidate).split(",").map((x) => x.trim()).filter(Boolean) : null;
    const result = auditAtlas(manifest, runResult, { N: Number(args.N || manifest.ranges.holdoutN), seeds: quick ? RUN_SEEDS.slice(0, 2) : AUDIT_SEEDS, candidateIds });
    writeJson(auditPath, result);
    process.stdout.write(`${JSON.stringify({ ok: true, audit: auditPath, breakthroughCount: result.breakthroughCount, top: result.results.slice(0, 5).map((r) => ({ id: r.id, z: r.overall.z, deathReason: r.deathReason })) }, null, 2)}\n`);
    return;
  }

  if (cmd === "pack") {
    const manifest = readJson(manifestPath);
    const runResult = fs.existsSync(runPath) ? readJson(runPath) : null;
    if (!runResult) throw new Error(`missing run result ${runPath}`);
    const auditResult = fs.existsSync(auditPath) ? readJson(auditPath) : null;
    const pack = packAtlas(manifest, runResult, auditResult);
    const mdPath = path.join(outDir, `cycle-${cycle}${quick ? "-quick" : ""}-evidence-pack.md`);
    fs.writeFileSync(mdPath, pack.markdown);
    process.stdout.write(`${JSON.stringify({ ok: true, pack: mdPath, survivorCount: pack.survivorCount }, null, 2)}\n`);
    return;
  }

  process.stderr.write("usage: node scripts/crack-atlas.mjs plan|run|audit|pack [--quick] [--cycle N] [--N n] [--out dir]\n");
  process.exit(cmd === "help" ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
