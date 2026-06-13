#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const DEFAULT_INPUT = "logs/divisor-extremes-artifacts/b004394.txt";
const DEFAULT_OUTPUT = "logs/divisor-extremes-artifacts/xa-frontier-barrier.json";
const DEFAULT_LIMIT = 600;
const DEFAULT_SEEDS = [12345, 271828, 314159, 161803, 424242];
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

function logBigInt(n) {
  const s = n.toString();
  if (s.length < 300) return Math.log(Number(n));
  const head = Number(`${s.slice(0, 18)}.${s.slice(18, 34)}`);
  return Math.log(head) + (s.length - 18) * Math.LN10;
}

function parseBFile(text, limit) {
  return text
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [index, value] = line.trim().split(/\s+/);
      return { index: Number(index), n: BigInt(value) };
    })
    .filter((row) => row.index <= limit);
}

function factorPrefix(n, primes) {
  let m = n;
  const factors = [];
  const exponents = [];
  for (const p of primes) {
    if (m === 1n) break;
    const bp = BigInt(p);
    let exp = 0;
    while (m % bp === 0n) {
      m /= bp;
      exp++;
    }
    if (exp === 0 && exponents.length > 0) break;
    if (exp > 0) {
      factors.push(p);
      exponents.push(exp);
    }
  }
  if (m !== 1n) throw new Error(`factorization incomplete; remaining factor ${m}`);
  return { factors, exponents, frontier: factors[factors.length - 1] || 1 };
}

function sigmaOverN(factors, exponents) {
  let product = 1;
  for (let i = 0; i < factors.length; i++) {
    const p = factors[i], a = exponents[i];
    product *= (1 - Math.pow(p, -(a + 1))) / (1 - 1 / p);
  }
  return product;
}

function scoreRow(row, factor) {
  const logN = logBigInt(row.n);
  const sigmaN = sigmaOverN(factor.factors, factor.exponents);
  const f = sigmaN / Math.log(logN);
  return {
    index: row.index,
    n: row.n.toString(),
    logN,
    sigmaOverN: sigmaN,
    f,
    robinRatio: f / E_GAMMA,
    ...factor,
  };
}

function scanRows(rows) {
  const maxLog = Math.max(...rows.map((r) => logBigInt(r.n)));
  const primes = primesUpTo(Math.ceil(maxLog * 3));
  const scanned = rows.map((row) => scoreRow(row, factorPrefix(row.n, primes)));
  const xa = [];
  let best = -Infinity;
  for (const row of scanned) {
    if (row.n === "10080" || (row.logN > Math.log(10080) && row.f > best * (1 + 1e-14))) {
      xa.push(row);
      best = Math.max(best, row.f);
    }
  }
  return { scanned, xa };
}

function frontierFunction(x, k) {
  let denom = 0;
  for (let i = 1; i <= k; i++) denom += x ** i;
  return Math.log(1 + 1 / denom) / Math.log(x);
}

function caEndpointForFrontier(p) {
  const eps = frontierFunction(p, 1);
  const bases = primesUpTo(p);
  const factors = [];
  const exponents = [];
  for (const q of bases) {
    let exp = 0;
    while (frontierFunction(q, exp + 1) + 1e-18 >= eps) exp++;
    if (exp > 0) {
      factors.push(q);
      exponents.push(exp);
    }
  }
  const logN = factors.reduce((s, q, i) => s + exponents[i] * Math.log(q), 0);
  const sigmaN = sigmaOverN(factors, exponents);
  const f = sigmaN / Math.log(logN);
  return {
    epsilon: eps,
    logN,
    sigmaOverN: sigmaN,
    f,
    robinRatio: f / E_GAMMA,
    factors,
    exponents,
    frontier: factors[factors.length - 1],
  };
}

function compactRow(row) {
  return row && {
    index: row.index,
    n: row.n,
    logN: row.logN,
    f: row.f,
    robinRatio: row.robinRatio,
    frontier: row.frontier,
    exponents: row.exponents,
  };
}

function barrierAudit(scanned, xa, frontiers) {
  const xaBefore = (index) => {
    let best = null;
    for (const row of xa) {
      if (row.index >= index) break;
      if (!best || row.f > best.f) best = row;
    }
    return best;
  };
  return frontiers.map((p) => {
    const block = scanned.filter((row) => row.frontier === p);
    const bestBlock = block.reduce((best, row) => (!best || row.f > best.f ? row : best), null);
    const firstIndex = block[0]?.index || null;
    const lastIndex = block[block.length - 1]?.index || null;
    const previous = firstIndex === null ? null : xaBefore(firstIndex);
    const ca = caEndpointForFrontier(p);
    return {
      frontier: p,
      epsilonF1: frontierFunction(p, 1),
      rowCount: block.length,
      firstIndex,
      lastIndex,
      usedByXA: xa.some((row) => row.frontier === p),
      previousXA: compactRow(previous),
      bestSAWithFrontier: compactRow(bestBlock),
      recordMargin: bestBlock && previous ? bestBlock.f - previous.f : null,
      caAtF1: ca,
      caMarginAgainstPreviousXA: previous ? ca.f - previous.f : null,
    };
  });
}

function windowSummary(a, b, auditRows, baseList = null) {
  const available = baseList ? baseList.filter((x) => a < x && x <= b) : primesUpTo(b).filter((p) => p > a);
  const byFrontier = new Map(auditRows.map((row) => [row.frontier, row]));
  const certifiedSkipped = available.filter((p) => byFrontier.get(p)?.usedByXA === false);
  const used = available.filter((p) => byFrontier.get(p)?.usedByXA === true);
  const unscanned = available.filter((p) => !byFrontier.has(p));
  return {
    range: [a, b],
    baseCount: available.length,
    liMain: liRange(a, b),
    usedCount: used.length,
    certifiedSkippedCount: certifiedSkipped.length,
    unscannedCount: unscanned.length,
    used,
    certifiedSkipped,
    unscanned,
  };
}

function enoughCramerBases(count, seed) {
  let limit = 300;
  while (true) {
    const bases = cramerPrimes(limit, seed);
    if (bases.length >= count) return bases.slice(0, count);
    limit *= 2;
  }
}

function fakeShapeAudit(scanned, seeds) {
  const maxK = Math.max(...scanned.map((r) => r.exponents.length));
  return seeds.map((seed) => {
    const bases = enoughCramerBases(maxK, seed);
    const fakeRows = scanned.map((row) => {
      let logN = 0, sigmaN = 1;
      for (let i = 0; i < row.exponents.length; i++) {
        const base = bases[i], exp = row.exponents[i];
        logN += exp * Math.log(base);
        sigmaN *= (1 - Math.pow(base, -(exp + 1))) / (1 - 1 / base);
      }
      const f = sigmaN / Math.log(logN);
      return {
        index: row.index,
        logN,
        sigmaOverN: sigmaN,
        f,
        robinRatio: f / E_GAMMA,
        frontier: bases[row.exponents.length - 1],
        exponents: row.exponents,
      };
    }).sort((a, b) => a.logN - b.logN);
    const records = [];
    let best = -Infinity;
    for (const row of fakeRows) {
      if (row.logN < Math.log(10080)) continue;
      if (row.f > best * (1 + 1e-14)) {
        records.push(row);
        best = row.f;
      }
    }
    const frontierSet = [...new Set(fakeRows.map((row) => row.frontier))].sort((a, b) => a - b);
    const auditRows = frontierSet.map((frontier) => {
      const block = fakeRows.filter((row) => row.frontier === frontier);
      const bestBlock = block.reduce((bestRow, row) => (!bestRow || row.f > bestRow.f ? row : bestRow), null);
      const previous = records.filter((row) => row.logN < Math.min(...block.map((r) => r.logN))).at(-1) || null;
      return {
        frontier,
        usedByXA: records.some((row) => row.frontier === frontier),
        recordMargin: previous && bestBlock ? bestBlock.f - previous.f : null,
      };
    });
    return {
      seed,
      recordCount: records.length,
      frontierUsed: new Set(records.map((row) => row.frontier)).size,
      maxFrontier: records.length ? Math.max(...records.map((row) => row.frontier)) : 0,
      windows: [
        windowSummary(100, 140, auditRows, bases),
        windowSummary(140, 182, auditRows, bases),
      ].map((window) => ({ ...window, activeByRecordMax: records.some((row) => row.frontier >= window.range[0]) })),
    };
  });
}

const input = process.argv[1] && process.argv[2] ? process.argv[2] : DEFAULT_INPUT;
const output = process.argv[3] || DEFAULT_OUTPUT;
const limit = process.argv[4] ? Number(process.argv[4]) : DEFAULT_LIMIT;
const seeds = process.argv[5]
  ? process.argv[5].split(",").map((x) => Number(x.trim())).filter(Boolean)
  : DEFAULT_SEEDS;

if (!existsSync(input)) throw new Error(`missing input ${input}; run extremely-abundant-oeis first`);
const rows = parseBFile(readFileSync(input, "utf8"), limit);
const { scanned, xa } = scanRows(rows);
const frontiers = [...new Set(scanned.map((row) => row.frontier))].sort((a, b) => a - b);
const audit = barrierAudit(scanned, xa, frontiers);
const result = {
  object: "XA frontier record-barrier audit",
  generatedAt: new Date().toISOString(),
  source: input,
  limit,
  xaCount: xa.length,
  frontiersScanned: frontiers.length,
  statement: "A frontier p is locally blocked in the scanned SA prefix when every SA row with largest prime p has f below the previous XA record.",
  windows: [
    windowSummary(100, 140, audit),
    windowSummary(140, 182, audit),
  ],
  focus: audit.filter((row) => [101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151].includes(row.frontier)),
  audit,
  cramerShapeBarrier: fakeShapeAudit(scanned, seeds),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
