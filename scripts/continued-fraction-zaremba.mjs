#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { boundedCfDenominatorTable, boundedCfNumeratorCountTable, cramerPrimes, primesUpTo } from "../src/core/math.js";

const DEFAULT_RANGES = [[10_000, 20_000], [50_000, 100_000]];
const DEFAULT_SEEDS = [12345, 271828, 314159, 161803, 424242];

function parseRanges(src) {
  if (!src) return DEFAULT_RANGES;
  return src.split(",").map((part) => {
    const [a, b] = part.split(/[:-]/).map((x) => Number(x.trim()));
    return Number.isFinite(a) && Number.isFinite(b) && b > a ? [a, b] : null;
  }).filter(Boolean);
}

function liInterval(a, b) {
  if (b <= a) return 0;
  const lo = Math.log(Math.max(a, 2));
  const hi = Math.log(Math.max(b, 2));
  let steps = Math.max(2000, Math.ceil((hi - lo) * 4096));
  if (steps % 2) steps++;
  const h = (hi - lo) / steps;
  const f = (u) => Math.exp(u) / u;
  let sum = f(lo) + f(hi);
  for (let i = 1; i < steps; i++) sum += (i % 2 ? 4 : 2) * f(lo + i * h);
  return (h / 3) * sum;
}

function cramerWeightedMain(A, B, weights) {
  let sum = 0;
  for (let n = Math.max(2, A); n <= B; n++) {
    const weight = weights[n] || 0;
    if (!weight) continue;
    if (n === 2 || n === 3) {
      sum += weight;
    } else if (n % 2 !== 0 && n % 3 !== 0) {
      sum += weight * Math.min(1, 3 / Math.log(n));
    }
  }
  return sum;
}

function countInRange(values, A, B, indicator) {
  let hit = 0;
  let cf3Only = 0;
  let above3 = 0;
  let cf2NumeratorTotal = 0;
  for (const n of values) {
    if (n < A || n > B) continue;
    cf2NumeratorTotal += indicator.cf2num[n] || 0;
    if (indicator.cf2[n]) {
      hit++;
    } else if (indicator.cf3[n]) {
      cf3Only++;
    } else {
      above3++;
    }
  }
  return {
    count: values.length,
    cf2Count: hit,
    cf2Rate: values.length ? hit / values.length : 0,
    cf2NumeratorTotal,
    avgCf2NumeratorsPerLabel: values.length ? cf2NumeratorTotal / values.length : 0,
    avgCf2NumeratorsPerHit: hit ? cf2NumeratorTotal / hit : 0,
    cf3Only,
    above3,
  };
}

function topMisses(values, A, B, indicator, limit = 12) {
  return values
    .filter((n) => n >= A && n <= B && !indicator.cf2[n])
    .slice(0, limit)
    .map((n) => ({ n, inZ3: Boolean(indicator.cf3[n]) }));
}

function summarizeRange([A, B], seeds, tables) {
  const primes = primesUpTo(B).filter((p) => p >= A && p <= B);
  const real = countInRange(primes, A, B, tables);
  const cf2DenominatorCount = tables.cf2.slice(A, B + 1).reduce((s, x) => s + x, 0);
  const cf2NumeratorTotal = tables.cf2num.slice(A, B + 1).reduce((s, x) => s + x, 0);
  const cf2Main = cramerWeightedMain(A, B, tables.cf2);
  const cf2NumeratorMain = cramerWeightedMain(A, B, tables.cf2num);
  const cf3Misses = [];
  for (const p of primes) if (!tables.cf3[p]) cf3Misses.push(p);
  const cramer = seeds.map((seed) => {
    const fake = cramerPrimes(B, seed).filter((n) => n >= A && n <= B);
    return {
      seed,
      ...countInRange(fake, A, B, tables),
    };
  });
  return {
    range: [A, B],
    mainTerms: {
      primeLi: liInterval(A, B),
      cf2CramerWeightedMain: cf2Main,
      cf2NumeratorWeightedMain: cf2NumeratorMain,
    },
    denominatorWorld: {
      cf2DenominatorCount,
      cf2Density: cf2DenominatorCount / (B - A + 1),
      cf2NumeratorTotal,
      avgCf2NumeratorsPerDenominator: cf2DenominatorCount ? cf2NumeratorTotal / cf2DenominatorCount : 0,
    },
    real: {
      ...real,
      cf2MinusWeightedMain: real.cf2Count - cf2Main,
      cf2NumeratorMinusWeightedMain: real.cf2NumeratorTotal - cf2NumeratorMain,
      cf3PrimeMisses: cf3Misses.slice(0, 20),
      firstCf2Misses: topMisses(primes, A, B, tables),
    },
    cramer,
  };
}

function writeSvg(result, path) {
  const width = 920, height = 360;
  const colors = { real: "#1f8f7a", fake: "#a65d31", line: "#d5ccbd", text: "#292620", faint: "#71695c" };
  const groups = result.results.map((rangeResult, i) => {
    const [A, B] = rangeResult.range;
    const fakeRate = rangeResult.cramer.reduce((s, row) => s + row.cf2Rate, 0) / rangeResult.cramer.length;
    const fakeWitnessAvg = rangeResult.cramer.reduce((s, row) => s + row.avgCf2NumeratorsPerLabel, 0) / rangeResult.cramer.length;
    const x = 120 + i * 380;
    const y = 92;
    const bar = (xx, value, color) => {
      const h = Math.max(0, Math.min(1, value)) * 180;
      return `<rect x="${xx}" y="${y + 180 - h}" width="54" height="${h}" fill="${color}" rx="3"/>`;
    };
    return [
      `<text x="${x}" y="58" font-size="16" fill="${colors.text}" font-family="system-ui">${A.toLocaleString()}-${B.toLocaleString()}</text>`,
      `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 180}" stroke="${colors.line}"/>`,
      `<line x1="${x}" y1="${y + 180}" x2="${x + 240}" y2="${y + 180}" stroke="${colors.line}"/>`,
      bar(x + 34, rangeResult.real.cf2Rate, colors.real),
      bar(x + 104, fakeRate, colors.fake),
      `<text x="${x + 22}" y="${y + 205}" font-size="11" fill="${colors.faint}" font-family="ui-monospace">cf2 hit-rate</text>`,
      `<text x="${x + 28}" y="${y + 228}" font-size="11" fill="${colors.real}" font-family="ui-monospace">real ${rangeResult.real.cf2Rate.toFixed(3)}</text>`,
      `<text x="${x + 28}" y="${y + 246}" font-size="11" fill="${colors.fake}" font-family="ui-monospace">fake ${fakeRate.toFixed(3)}</text>`,
      `<text x="${x + 28}" y="${y + 266}" font-size="11" fill="${colors.faint}" font-family="ui-monospace">cf2 den ${rangeResult.denominatorWorld.cf2Density.toFixed(3)}</text>`,
      `<text x="${x + 28}" y="${y + 286}" font-size="11" fill="${colors.faint}" font-family="ui-monospace">num/label ${rangeResult.real.avgCf2NumeratorsPerLabel.toFixed(2)} vs ${fakeWitnessAvg.toFixed(2)}</text>`,
    ].join("\n");
  }).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#fbf8ef"/>
  <text x="36" y="34" font-size="20" fill="${colors.text}" font-family="system-ui" font-weight="700">Continued-fraction denominator test</text>
  <text x="36" y="62" font-size="12" fill="${colors.faint}" font-family="ui-monospace">Z_2 denominators are generated without primality; primes are tested against that set.</text>
  ${groups}
  <rect x="36" y="314" width="14" height="14" fill="${colors.real}" rx="2"/>
  <text x="58" y="326" font-size="12" fill="${colors.text}" font-family="system-ui">real primes</text>
  <rect x="156" y="314" width="14" height="14" fill="${colors.fake}" rx="2"/>
  <text x="178" y="326" font-size="12" fill="${colors.text}" font-family="system-ui">five Cramer seeds, averaged</text>
</svg>
`;
  writeFileSync(path, svg);
}

const output = process.argv[2] || "logs/continued-fraction-artifacts/numerics.json";
const ranges = parseRanges(process.argv[3]);
const seeds = process.argv[4] ? process.argv[4].split(",").map((x) => Number(x.trim())).filter(Boolean) : DEFAULT_SEEDS;
const maxN = Math.max(...ranges.map(([, B]) => B));
const tables = {
  cf2: boundedCfDenominatorTable(maxN, 2),
  cf2num: boundedCfNumeratorCountTable(maxN, 2),
  cf3: boundedCfDenominatorTable(maxN, 3),
};

const result = {
  object: "bounded continued-fraction denominator set",
  generatedAt: new Date().toISOString(),
  definition: "Z_A={q: q is the denominator of some finite continued fraction [0;a1,...,ak] with every ai<=A}; cfheight(q)=least tested A.",
  conjecturalPrimePattern: "Hensley conjectures that every sufficiently large prime denominator lies in Z_2.",
  theoremBackstop: "Shkredov proves the prime-denominator Zaremba case with an absolute constant; Zhang's 2026 preprint claims the full Zaremba conjecture.",
  ranges,
  seeds,
  results: ranges.map((range) => summarizeRange(range, seeds, tables)),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
writeSvg(result, join(dirname(output), "continued-fraction-summary.svg"));
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
