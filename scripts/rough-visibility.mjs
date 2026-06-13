#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { cramerPrimes, primesUpTo, rowVisibilityTable } from "../src/core/math.js";

const DEFAULT_RANGES = [1_000_000, 10_000_000];
const DEFAULT_SEEDS = [12345, 271828, 314159, 161803, 424242];

function liInterval(a, b) {
  if (b <= a) return 0;
  const lo = Math.log(Math.max(a, 2));
  const hi = Math.log(Math.max(b, 2));
  let steps = Math.max(2000, Math.ceil((hi - lo) * 4096));
  if (steps % 2) steps++;
  const h = (hi - lo) / steps;
  let sum = Math.exp(lo) / lo + Math.exp(hi) / hi;
  for (let i = 1; i < steps; i++) {
    const u = lo + i * h;
    sum += (i % 2 ? 4 : 2) * Math.exp(u) / u;
  }
  return (h / 3) * sum;
}

function gapStats(values) {
  let maxGap = 0, start = 0, end = 0;
  const top = [];
  for (let i = 1; i < values.length; i++) {
    const gap = values[i] - values[i - 1];
    if (gap > maxGap) {
      maxGap = gap;
      start = values[i - 1];
      end = values[i];
    }
    top.push({ gap, start: values[i - 1], end: values[i], normalized: gap / Math.log(values[i - 1]) });
  }
  top.sort((a, b) => b.gap - a.gap || a.start - b.start);
  return {
    maxGap,
    start,
    end,
    normalizedAtStart: start > 1 ? maxGap / Math.log(start) : 0,
    overLogSquaredN: values.length ? maxGap / (Math.log(values[values.length - 1]) ** 2) : 0,
    top: top.slice(0, 8),
  };
}

function summarizeRange(N, seeds) {
  const y = Math.floor(Math.sqrt(N));
  const row = rowVisibilityTable(N, y);
  const primes = primesUpTo(N);
  const primeSet = new Uint8Array(N + 1);
  for (const p of primes) primeSet[p] = 1;

  const rowSurvivors = [];
  let visibleCompositeAboveY = 0;
  let missingPrimeAboveY = 0;
  for (let n = y + 1; n <= N; n++) {
    if (row.visible[n]) {
      rowSurvivors.push(n);
      if (!primeSet[n]) visibleCompositeAboveY++;
    } else if (primeSet[n]) {
      missingPrimeAboveY++;
    }
  }

  const primeAboveY = primes.filter((p) => p > y);
  const main = liInterval(y, N);
  const realGaps = gapStats(rowSurvivors);

  const cramer = seeds.map((seed) => {
    const fake = cramerPrimes(N, seed).filter((n) => n > y);
    let rowInvisibleHits = 0;
    for (const n of fake) if (!row.visible[n]) rowInvisibleHits++;
    return {
      seed,
      count: fake.length,
      countMinusLi: fake.length - main,
      rowInvisibleHits,
      rowInvisibleRate: fake.length ? rowInvisibleHits / fake.length : 0,
      gaps: gapStats(fake),
    };
  });

  return {
    N,
    y,
    rowDefinition: "rowvis(n,y)=1 iff gcd(n,lcm(1..y))=1",
    exactBridgeWindow: `(floor(sqrt(N)), N] with y=floor(sqrt(N))`,
    visibleCount: rowSurvivors.length,
    primeCountAboveY: primeAboveY.length,
    liMainTerm: main,
    countMinusLi: rowSurvivors.length - main,
    visibleCompositeAboveY,
    missingPrimeAboveY,
    realGaps,
    cramer,
  };
}

const output = process.argv[2] || "logs/rough-visibility-artifacts/numerics.json";
const ranges = process.argv[3] ? process.argv[3].split(",").map((x) => Number(x.trim())).filter(Boolean) : DEFAULT_RANGES;
const seeds = process.argv[4] ? process.argv[4].split(",").map((x) => Number(x.trim())).filter(Boolean) : DEFAULT_SEEDS;

const result = {
  object: "rough-row visibility",
  generatedAt: new Date().toISOString(),
  ranges,
  seeds,
  results: ranges.map((N) => summarizeRange(N, seeds)),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
