#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const DEFAULT_LOG_LIMITS = [80, 160];
const DEFAULT_SEEDS = [12345, 271828, 314159, 161803, 424242];
const XA_THRESHOLD_LOG = Math.log(10080);
const GAMMA = 0.5772156649015329;
const E_GAMMA = Math.exp(GAMMA);

function liRange(a, b, steps = 2048) {
  const lo = Math.max(2, a), hi = Math.max(lo, b);
  const n = steps + (steps % 2);
  const h = (hi - lo) / n;
  let sum = 1 / Math.log(lo) + 1 / Math.log(hi);
  for (let i = 1; i < n; i++) {
    const x = lo + i * h;
    sum += (i % 2 ? 4 : 2) / Math.log(x);
  }
  return (h / 3) * sum;
}

function basesForLogLimit(kind, logLimit, seed) {
  const roughMax = Math.max(100, Math.ceil(4 * logLimit * Math.log(Math.max(10, logLimit))));
  const bases = kind === "real" ? primesUpTo(roughMax) : cramerPrimes(roughMax, seed);
  const out = [];
  let theta = 0;
  for (const b of bases) {
    const next = theta + Math.log(b);
    if (next > logLimit + 1e-12) break;
    out.push(b);
    theta = next;
  }
  return out;
}

function ratioFactor(base, exp) {
  return (1 - Math.pow(base, -(exp + 1))) / (1 - 1 / base);
}

function generatePrefixProfiles(bases, logLimit) {
  const rows = [];
  const maxExp = Math.floor(logLimit / Math.log(2));

  function visit(index, maxNextExp, logN, nBig, sigmaOverN, exps) {
    if (index > 0) {
      rows.push({
        n: nBig,
        logN,
        sigmaOverN,
        exps: exps.slice(),
        frontierBase: bases[index - 1],
        frontierIndex: index,
      });
    }
    if (index >= bases.length) return;

    const base = bases[index];
    const bigBase = BigInt(base);
    let pow = 1n;
    let logPow = 0;
    for (let exp = 1; exp <= maxNextExp; exp++) {
      pow *= bigBase;
      logPow += Math.log(base);
      if (logN + logPow > logLimit + 1e-12) break;
      exps.push(exp);
      visit(
        index + 1,
        exp,
        logN + logPow,
        nBig * pow,
        sigmaOverN * ratioFactor(base, exp),
        exps,
      );
      exps.pop();
    }
  }

  visit(0, maxExp, 0, 1n, 1, []);
  rows.sort((a, b) => (a.n < b.n ? -1 : a.n > b.n ? 1 : 0));
  return rows;
}

function selectSuperabundant(rows) {
  const out = [];
  let best = 0;
  for (const row of rows) {
    if (row.sigmaOverN > best * (1 + 1e-14)) {
      out.push(row);
      best = row.sigmaOverN;
    }
  }
  return out;
}

function selectExtremelyAbundant(superRows, fake = false) {
  const out = [];
  let best = -Infinity;
  let started = fake;
  for (const row of superRows) {
    if (row.logN < XA_THRESHOLD_LOG - 1e-12) continue;
    const f = row.sigmaOverN / Math.log(row.logN);
    const is10080 = !fake && row.n === 10080n;
    if (is10080 || !started || f > best * (1 + 1e-14)) {
      out.push({ ...row, robinRatio: f / E_GAMMA, normalizedF: f });
      best = Math.max(best, f);
      started = true;
    }
  }
  return out;
}

function exponentDrops(row) {
  const out = [];
  for (let i = 1; i < row.exps.length; i++) {
    const drop = row.exps[i - 1] - row.exps[i];
    if (drop > 0) out.push({ afterIndex: i, drop });
  }
  return out;
}

function summarizeRecords(label, bases, logLimit, fake = false) {
  const candidates = generatePrefixProfiles(bases, logLimit);
  const superRows = selectSuperabundant(candidates);
  const xaRows = selectExtremelyAbundant(superRows, fake);
  const frontierSet = new Set(xaRows.map((r) => r.frontierBase));
  const maxFrontier = xaRows.length ? Math.max(...xaRows.map((r) => r.frontierBase)) : 0;
  const availableFrontiers = bases.filter((b) => b <= maxFrontier);
  const skippedFrontiers = availableFrontiers.filter((b) => !frontierSet.has(b));
  const frontierJumps = [];
  for (let i = 1; i < xaRows.length; i++) {
    const prev = xaRows[i - 1], cur = xaRows[i];
    frontierJumps.push({
      from: prev.frontierBase,
      to: cur.frontierBase,
      skippedBases: bases.filter((b) => prev.frontierBase < b && b < cur.frontierBase),
      logRatio: cur.logN - prev.logN,
    });
  }
  const bigJumps = frontierJumps
    .filter((j) => j.skippedBases.length > 0)
    .sort((a, b) => b.skippedBases.length - a.skippedBases.length || b.to - a.to)
    .slice(0, 10);

  const windows = [];
  for (const [a, b] of [[10, 50], [50, 100], [100, 200], [200, 400]]) {
    if (a >= maxFrontier) continue;
    const hi = Math.min(b, maxFrontier + 1);
    const baseCount = availableFrontiers.filter((x) => a < x && x <= hi).length;
    const usedCount = new Set(
      xaRows.filter((r) => a < r.frontierBase && r.frontierBase <= hi).map((r) => r.frontierBase),
    ).size;
    windows.push({
      range: [a, hi],
      baseCount,
      liMain: liRange(a, hi),
      usedCount,
      usedShare: baseCount ? usedCount / baseCount : 0,
    });
  }

  return {
    label,
    logLimit,
    baseCount: bases.length,
    candidateCount: candidates.length,
    superabundantCount: superRows.length,
    xaCount: xaRows.length,
    maxFrontier,
    frontierUsed: frontierSet.size,
    frontierAvailable: availableFrontiers.length,
    frontierSkipped: skippedFrontiers.length,
    skippedFrontiers,
    windows,
    bigJumps,
    firstRecords: xaRows.slice(0, 12).map(compactRecord),
    lastRecords: xaRows.slice(-12).map(compactRecord),
    maxRobinRatio: xaRows.reduce((m, r) => Math.max(m, r.robinRatio), 0),
  };
}

function compactRecord(row) {
  return {
    n: row.n.toString(),
    logN: row.logN,
    frontierBase: row.frontierBase,
    frontierIndex: row.frontierIndex,
    exponents: row.exps,
    exponentDrops: exponentDrops(row).slice(0, 12),
    sigmaOverN: row.sigmaOverN,
    robinRatio: row.robinRatio,
  };
}

function runRange(logLimit, seeds) {
  const realBases = basesForLogLimit("real", logLimit);
  const real = summarizeRecords("real primes", realBases, logLimit, false);
  const cramer = seeds.map((seed) => {
    const bases = basesForLogLimit("cramer", logLimit, seed);
    return { seed, ...summarizeRecords(`cramer seed ${seed}`, bases, logLimit, true) };
  });
  return { logLimit, real, cramer };
}

const output = process.argv[2] || "logs/divisor-extremes-artifacts/numerics.json";
const logLimits = process.argv[3]
  ? process.argv[3].split(",").map((x) => Number(x.trim())).filter(Boolean)
  : DEFAULT_LOG_LIMITS;
const seeds = process.argv[4]
  ? process.argv[4].split(",").map((x) => Number(x.trim())).filter(Boolean)
  : DEFAULT_SEEDS;

const result = {
  object: "extremely abundant frontier primes",
  generatedAt: new Date().toISOString(),
  definition: "XA records of sigma(n)/(n log log n), generated through the SA prefix-exponent theorem",
  logLimits,
  seeds,
  gamma: GAMMA,
  eGamma: E_GAMMA,
  results: logLimits.map((limit) => runRange(limit, seeds)),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
