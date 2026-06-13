#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const DEFAULT_SOURCE = "https://oeis.org/A004394/b004394.txt";
const DEFAULT_OUTPUT = "logs/divisor-extremes-artifacts/xa-oeis-prefix.json";
const DEFAULT_SOURCE_CACHE = "logs/divisor-extremes-artifacts/b004394.txt";
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

async function loadSource(cachePath, url) {
  if (existsSync(cachePath)) return readFileSync(cachePath, "utf8");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, text);
  return text;
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
  const exponents = [];
  const factors = [];
  for (const p of primes) {
    const bp = BigInt(p);
    if (m === 1n) break;
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
  return { factors, exponents, frontierPrime: factors[factors.length - 1] || 1 };
}

function sigmaOverN(factors, exponents) {
  let product = 1;
  for (let i = 0; i < factors.length; i++) {
    const p = factors[i], a = exponents[i];
    product *= (1 - Math.pow(p, -(a + 1))) / (1 - 1 / p);
  }
  return product;
}

function scanXA(rows) {
  const maxLog = Math.max(...rows.map((r) => logBigInt(r.n)));
  const primes = primesUpTo(Math.ceil(maxLog * 3));
  const scanned = rows.map((row) => {
    const factor = factorPrefix(row.n, primes);
    const logN = logBigInt(row.n);
    const ratio = sigmaOverN(factor.factors, factor.exponents);
    const f = ratio / Math.log(logN);
    return {
      index: row.index,
      n: row.n.toString(),
      logN,
      sigmaOverN: ratio,
      f,
      robinRatio: f / E_GAMMA,
      ...factor,
    };
  });

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

function compactRecord(row) {
  return {
    index: row.index,
    n: row.n,
    logN: row.logN,
    f: row.f,
    robinRatio: row.robinRatio,
    frontierPrime: row.frontierPrime,
    exponents: row.exponents,
  };
}

function summarize(scanned, xa) {
  const used = new Set(xa.map((r) => r.frontierPrime));
  const maxFrontier = Math.max(...xa.map((r) => r.frontierPrime));
  const available = primesUpTo(maxFrontier);
  const skipped = available.filter((p) => !used.has(p));
  const frontierJumps = [];
  for (let i = 1; i < xa.length; i++) {
    const prev = xa[i - 1], cur = xa[i];
    frontierJumps.push({
      from: prev.frontierPrime,
      to: cur.frontierPrime,
      skipped: available.filter((p) => prev.frontierPrime < p && p < cur.frontierPrime),
      logRatio: cur.logN - prev.logN,
    });
  }
  const windows = [[100, 140], [140, 182]].map(([a, b]) => {
    const ps = available.filter((p) => a < p && p <= b);
    const us = new Set(xa.filter((r) => a < r.frontierPrime && r.frontierPrime <= b).map((r) => r.frontierPrime));
    return {
      range: [a, b],
      primeCount: ps.length,
      liMain: liRange(a, b),
      usedFrontiers: us.size,
      skipped: ps.filter((p) => !us.has(p)),
      usedShare: ps.length ? us.size / ps.length : 0,
    };
  });
  return {
    source: "OEIS A004394 b-file, first superabundant values",
    scannedSuperabundant: scanned.length,
    xaCount: xa.length,
    maxScannedIndex: scanned[scanned.length - 1]?.index || 0,
    maxScannedLogN: scanned[scanned.length - 1]?.logN || 0,
    maxFrontier,
    usedFrontierPrimes: [...used].sort((a, b) => a - b),
    skippedFrontierPrimes: skipped,
    windows,
    frontierJumps,
    firstRecords: xa.slice(0, 20).map(compactRecord),
    lastRecords: xa.slice(-10).map(compactRecord),
    knownTableCheck: {
      secondXAIndex: xa[1]?.index,
      secondXAFrontier: xa[1]?.frontierPrime,
      twentiethXAIndex: xa[19]?.index,
      twentiethXAFrontier: xa[19]?.frontierPrime,
      p149Used: used.has(149),
    },
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

function shapeContrast(scanned, seeds) {
  const maxK = Math.max(...scanned.map((r) => r.exponents.length));
  return seeds.map((seed) => {
    const bases = enoughCramerBases(maxK, seed);
    const fakeRows = scanned.map((row) => {
      let logN = 0, ratio = 1;
      for (let i = 0; i < row.exponents.length; i++) {
        const base = bases[i], exp = row.exponents[i];
        logN += exp * Math.log(base);
        ratio *= (1 - Math.pow(base, -(exp + 1))) / (1 - 1 / base);
      }
      const f = ratio / Math.log(logN);
      return {
        sourceIndex: row.index,
        logN,
        f,
        robinRatio: f / E_GAMMA,
        frontierBase: bases[row.exponents.length - 1],
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

    const used = new Set(records.map((r) => r.frontierBase));
    const maxFrontier = records.length ? Math.max(...records.map((r) => r.frontierBase)) : 0;
    const available = bases.filter((b) => b <= maxFrontier);
    const windows = [[100, 140], [140, 182]].map(([a, b]) => {
      const bs = available.filter((x) => a < x && x <= b);
      const us = new Set(records.filter((r) => a < r.frontierBase && r.frontierBase <= b).map((r) => r.frontierBase));
      return {
        range: [a, b],
        baseCount: bs.length,
        liMain: liRange(a, b),
        usedFrontiers: us.size,
        skipped: bs.filter((x) => !us.has(x)),
        usedShare: bs.length ? us.size / bs.length : 0,
      };
    });
    return {
      seed,
      recordCount: records.length,
      maxFrontier,
      frontierUsed: used.size,
      frontierAvailable: available.length,
      frontierSkipped: available.filter((b) => !used.has(b)).length,
      windows,
      firstRecord: records[0] || null,
      lastRecord: records[records.length - 1] || null,
    };
  });
}

const output = process.argv[2] || DEFAULT_OUTPUT;
const limit = process.argv[3] ? Number(process.argv[3]) : DEFAULT_LIMIT;
const sourceCache = process.argv[4] || DEFAULT_SOURCE_CACHE;
const source = process.argv[5] || DEFAULT_SOURCE;
const seeds = process.argv[6]
  ? process.argv[6].split(",").map((x) => Number(x.trim())).filter(Boolean)
  : DEFAULT_SEEDS;

const text = await loadSource(sourceCache, source);
const rows = parseBFile(text, limit);
const { scanned, xa } = scanXA(rows);
const result = {
  object: "extremely abundant frontier primes from SA prefix",
  generatedAt: new Date().toISOString(),
  limit,
  gamma: GAMMA,
  eGamma: E_GAMMA,
  summary: summarize(scanned, xa),
  cramerShapeContrast: shapeContrast(scanned, seeds),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
