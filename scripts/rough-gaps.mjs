#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { cramerPrimes, primesUpTo, roughIntervalWitnesses } from "../src/core/math.js";

const DEFAULT_RANGES = [100_000, 1_000_000];
const DEFAULT_SEEDS = [12345, 271828, 314159, 161803, 424242];

function logIntegralPower(a, b, power) {
  if (b <= a) return 0;
  const lo = Math.log(Math.max(a, 2));
  const hi = Math.log(Math.max(b, 2));
  let steps = Math.max(2000, Math.ceil((hi - lo) * 4096));
  if (steps % 2) steps++;
  const h = (hi - lo) / steps;
  const f = (u) => Math.exp(u) / (u ** power);
  let sum = f(lo) + f(hi);
  for (let i = 1; i < steps; i++) sum += (i % 2 ? 4 : 2) * f(lo + i * h);
  return (h / 3) * sum;
}

function gapRows(events, X, upper) {
  const rows = [];
  for (let i = 0; i + 1 < events.length; i++) {
    const p = events[i], q = events[i + 1];
    if (p < X || p > upper) continue;
    const width = q - p;
    const witness = roughIntervalWitnesses(p, width);
    rows.push({
      start: p,
      end: q,
      width,
      roughCount: witness.count,
      firstOffset: witness.firstOffset,
    });
  }
  return rows;
}

function summarizeRows(rows) {
  const exceptions = rows.filter((r) => r.roughCount === 0);
  const byWidth = new Map();
  let totalWitnesses = 0, maxWidth = 0, maxWitnessCount = 0;
  const topExceptions = [];
  const topWitnessRich = [];
  for (const row of rows) {
    totalWitnesses += row.roughCount;
    maxWidth = Math.max(maxWidth, row.width);
    maxWitnessCount = Math.max(maxWitnessCount, row.roughCount);
    const bucket = byWidth.get(row.width) || { width: row.width, gaps: 0, exceptions: 0, witnesses: 0 };
    bucket.gaps++;
    bucket.witnesses += row.roughCount;
    if (row.roughCount === 0) bucket.exceptions++;
    byWidth.set(row.width, bucket);
    if (row.roughCount === 0) topExceptions.push(row);
    if (row.roughCount > 0) topWitnessRich.push(row);
  }
  topExceptions.sort((a, b) => b.width - a.width || a.start - b.start);
  topWitnessRich.sort((a, b) => b.roughCount - a.roughCount || b.width - a.width || a.start - b.start);
  return {
    gaps: rows.length,
    exceptions: exceptions.length,
    exceptionRate: rows.length ? exceptions.length / rows.length : 0,
    totalWitnesses,
    avgWitnesses: rows.length ? totalWitnesses / rows.length : 0,
    maxWidth,
    maxWitnessCount,
    topExceptions: topExceptions.slice(0, 10),
    topWitnessRich: topWitnessRich.slice(0, 10),
    byWidth: Array.from(byWidth.values()).sort((a, b) => a.width - b.width),
  };
}

function summarizeRange(X, seeds) {
  const upper = 2 * X;
  const eventLimit = upper + Math.max(10000, Math.ceil(20 * (Math.log(upper) ** 2)));
  const primes = primesUpTo(eventLimit);
  const realRows = gapRows(primes, X, upper);
  const li1 = logIntegralPower(X, upper, 1);
  const li2 = logIntegralPower(X, upper, 2);
  const real = summarizeRows(realRows);
  const cramer = seeds.map((seed) => {
    const fake = cramerPrimes(eventLimit, seed);
    const rows = gapRows(fake, X, upper);
    return { seed, ...summarizeRows(rows) };
  });
  return {
    X,
    upper,
    eventLimit,
    mainTerms: {
      primeGapCountLi: li1,
      exceptionalScaleLi2: li2,
    },
    real,
    cramer,
  };
}

const output = process.argv[2] || "logs/rough-gap-artifacts/numerics.json";
const ranges = process.argv[3] ? process.argv[3].split(",").map((x) => Number(x.trim())).filter(Boolean) : DEFAULT_RANGES;
const seeds = process.argv[4] ? process.argv[4].split(",").map((x) => Number(x.trim())).filter(Boolean) : DEFAULT_SEEDS;

const result = {
  object: "rough witnesses inside prime gaps",
  generatedAt: new Date().toISOString(),
  definition: "R(a,h)=#{m:a<m<a+h and gcd(m,lcm(1..h-1))=1}",
  ranges,
  seeds,
  results: ranges.map((X) => summarizeRange(X, seeds)),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
