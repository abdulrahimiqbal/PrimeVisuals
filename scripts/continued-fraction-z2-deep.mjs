#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { boundedCfNumeratorCountTable, cramerPrimes, primesUpTo } from "../src/core/math.js";

const DEFAULT_RANGES = [[100_000, 200_000], [500_000, 1_000_000]];
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

function cramerProbability(n) {
  if (n === 2 || n === 3) return 1;
  if (n < 2 || n % 2 === 0 || n % 3 === 0) return 0;
  return Math.min(1, 3 / Math.log(n));
}

function weightedMain(A, B, weights) {
  let total = 0;
  for (let n = Math.max(2, A); n <= B; n++) {
    const w = weights[n] || 0;
    if (w) total += w * cramerProbability(n);
  }
  return total;
}

function summarizeLabels(labels, A, B, cf2num) {
  let hit = 0, witnessTotal = 0;
  const misses = [];
  const topWitnesses = [];
  for (const n of labels) {
    if (n < A || n > B) continue;
    const witnesses = cf2num[n] || 0;
    witnessTotal += witnesses;
    if (witnesses > 0) {
      hit++;
      topWitnesses.push({ n, witnesses });
    } else if (misses.length < 12) {
      misses.push(n);
    }
  }
  topWitnesses.sort((a, b) => b.witnesses - a.witnesses || a.n - b.n);
  return {
    count: labels.length,
    cf2Count: hit,
    cf2Rate: labels.length ? hit / labels.length : 0,
    cf2NumeratorTotal: witnessTotal,
    avgCf2NumeratorsPerLabel: labels.length ? witnessTotal / labels.length : 0,
    avgCf2NumeratorsPerHit: hit ? witnessTotal / hit : 0,
    firstCf2Misses: misses,
    topWitnesses: topWitnesses.slice(0, 10),
  };
}

function summarizeRange([A, B], seeds, cf2num) {
  const primes = primesUpTo(B).filter((p) => p >= A && p <= B);
  const membership = new Uint8Array(B + 1);
  for (let n = A; n <= B; n++) if (cf2num[n]) membership[n] = 1;
  const denominatorCount = membership.slice(A, B + 1).reduce((s, x) => s + x, 0);
  const witnessWorldTotal = cf2num.slice(A, B + 1).reduce((s, x) => s + x, 0);
  const membershipMain = weightedMain(A, B, membership);
  const witnessMain = weightedMain(A, B, cf2num);
  const real = summarizeLabels(primes, A, B, cf2num);
  const cramer = seeds.map((seed) => {
    const fake = cramerPrimes(B, seed).filter((n) => n >= A && n <= B);
    return { seed, ...summarizeLabels(fake, A, B, cf2num) };
  });
  return {
    range: [A, B],
    mainTerms: {
      primeLi: liInterval(A, B),
      cf2CramerWeightedMain: membershipMain,
      cf2NumeratorWeightedMain: witnessMain,
    },
    denominatorWorld: {
      cf2DenominatorCount: denominatorCount,
      cf2Density: denominatorCount / (B - A + 1),
      cf2NumeratorTotal: witnessWorldTotal,
      avgCf2NumeratorsPerDenominator: denominatorCount ? witnessWorldTotal / denominatorCount : 0,
    },
    real: {
      ...real,
      cf2MinusWeightedMain: real.cf2Count - membershipMain,
      cf2NumeratorMinusWeightedMain: real.cf2NumeratorTotal - witnessMain,
    },
    cramer,
  };
}

function writeSvg(result, path) {
  const width = 940, height = 390;
  const colors = { real: "#1f8f7a", fake: "#a65d31", line: "#d5ccbd", text: "#292620", faint: "#71695c" };
  const groups = result.results.map((row, i) => {
    const [A, B] = row.range;
    const fakeRate = row.cramer.reduce((s, r) => s + r.cf2Rate, 0) / row.cramer.length;
    const fakeWitness = row.cramer.reduce((s, r) => s + r.avgCf2NumeratorsPerLabel, 0) / row.cramer.length;
    const x = 120 + i * 390;
    const y = 96;
    const bar = (xx, value, max, color) => {
      const h = Math.max(0, Math.min(1, value / max)) * 180;
      return `<rect x="${xx}" y="${y + 180 - h}" width="52" height="${h}" fill="${color}" rx="3"/>`;
    };
    const witnessMax = Math.max(row.real.avgCf2NumeratorsPerLabel, fakeWitness, 1) * 1.15;
    return [
      `<text x="${x}" y="60" font-size="16" fill="${colors.text}" font-family="system-ui">${A.toLocaleString()}-${B.toLocaleString()}</text>`,
      `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 180}" stroke="${colors.line}"/>`,
      `<line x1="${x}" y1="${y + 180}" x2="${x + 270}" y2="${y + 180}" stroke="${colors.line}"/>`,
      bar(x + 28, row.real.cf2Rate, 1, colors.real),
      bar(x + 86, fakeRate, 1, colors.fake),
      bar(x + 172, row.real.avgCf2NumeratorsPerLabel, witnessMax, colors.real),
      bar(x + 230, fakeWitness, witnessMax, colors.fake),
      `<text x="${x + 18}" y="${y + 206}" font-size="11" fill="${colors.faint}" font-family="ui-monospace">hit-rate</text>`,
      `<text x="${x + 160}" y="${y + 206}" font-size="11" fill="${colors.faint}" font-family="ui-monospace">num/label</text>`,
      `<text x="${x + 18}" y="${y + 228}" font-size="11" fill="${colors.real}" font-family="ui-monospace">real ${row.real.cf2Rate.toFixed(3)}</text>`,
      `<text x="${x + 18}" y="${y + 246}" font-size="11" fill="${colors.fake}" font-family="ui-monospace">fake ${fakeRate.toFixed(3)}</text>`,
      `<text x="${x + 160}" y="${y + 228}" font-size="11" fill="${colors.real}" font-family="ui-monospace">real ${row.real.avgCf2NumeratorsPerLabel.toFixed(2)}</text>`,
      `<text x="${x + 160}" y="${y + 246}" font-size="11" fill="${colors.fake}" font-family="ui-monospace">fake ${fakeWitness.toFixed(2)}</text>`,
      `<text x="${x + 18}" y="${y + 268}" font-size="11" fill="${colors.faint}" font-family="ui-monospace">minus main ${row.real.cf2NumeratorMinusWeightedMain.toFixed(1)}</text>`,
    ].join("\n");
  }).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#fbf8ef"/>
  <text x="36" y="36" font-size="20" fill="${colors.text}" font-family="system-ui" font-weight="700">Deep Z_2 continued-fraction witness scan</text>
  <text x="36" y="64" font-size="12" fill="${colors.faint}" font-family="ui-monospace">Only alphabet {1,2}; Cramer contrast uses the same denominator witness table.</text>
  ${groups}
  <rect x="36" y="336" width="14" height="14" fill="${colors.real}" rx="2"/>
  <text x="58" y="348" font-size="12" fill="${colors.text}" font-family="system-ui">real primes</text>
  <rect x="156" y="336" width="14" height="14" fill="${colors.fake}" rx="2"/>
  <text x="178" y="348" font-size="12" fill="${colors.text}" font-family="system-ui">five Cramer seeds, averaged</text>
</svg>
`;
  writeFileSync(path, svg);
}

const output = process.argv[2] || "logs/continued-fraction-artifacts/z2-deep.json";
const ranges = parseRanges(process.argv[3]);
const seeds = process.argv[4] ? process.argv[4].split(",").map((x) => Number(x.trim())).filter(Boolean) : DEFAULT_SEEDS;
const maxN = Math.max(...ranges.map(([, B]) => B));
const cf2num = boundedCfNumeratorCountTable(maxN, 2);
const result = {
  object: "deep bounded continued-fraction Z_2 witness scan",
  generatedAt: new Date().toISOString(),
  definition: "cf2num(q)=#{a: a/q has canonical continued fraction digits all in {1,2}}.",
  ranges,
  seeds,
  results: ranges.map((range) => summarizeRange(range, seeds, cf2num)),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
writeSvg(result, join(dirname(output), "z2-deep-summary.svg"));
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
