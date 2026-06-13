#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const modulus = Number(process.argv[3] || 11);
const seeds = [12345, 271828, 314159, 161803, 424242];
const intervals = [
  { id: "base2-largest", lo: 2 ** 24, hi: 2 ** 25 },
  { id: "base3-largest-reduced", lo: 3 ** 14, hi: 3 ** 15 },
  { id: "base3-largest-full", lo: 3 ** 15, hi: 3 ** 16 },
];

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
  let x = Math.abs(a), y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function takeWindow(values, lo, hi) {
  const out = [];
  for (const value of values) {
    if (value <= lo) continue;
    if (value > hi) break;
    out.push(value);
  }
  return out;
}

function residueMap(q) {
  const classes = [];
  const map = new Map();
  for (let r = 1; r < q; r++) {
    if (gcd(r, q) !== 1) continue;
    map.set(r, classes.length);
    classes.push(r);
  }
  return { classes, map };
}

function transitionMatrix(values, q) {
  const { classes, map } = residueMap(q);
  const n = classes.length;
  const matrix = new Float64Array(n * n);
  let total = 0;
  for (let i = 0; i + 1 < values.length; i++) {
    const a = map.get(values[i] % q);
    const b = map.get(values[i + 1] % q);
    if (a === undefined || b === undefined) continue;
    matrix[a * n + b]++;
    total++;
  }
  if (total > 0) {
    for (let i = 0; i < matrix.length; i++) matrix[i] /= total;
  }
  return { classes, matrix, transitions: total };
}

function l1(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s;
}

function meanMatrix(matrices, size) {
  const out = new Float64Array(size);
  for (const matrix of matrices) {
    for (let i = 0; i < size; i++) out[i] += matrix[i];
  }
  for (let i = 0; i < size; i++) out[i] /= matrices.length;
  return out;
}

function summarize(values) {
  if (!values.length) return { n: 0, mean: 0, meanAbs: 0, min: 0, max: 0 };
  return {
    n: values.length,
    mean: values.reduce((s, v) => s + v, 0) / values.length,
    meanAbs: values.reduce((s, v) => s + Math.abs(v), 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function compare(realMatrix, nullMatrices) {
  const mean = meanMatrix(nullMatrices, realMatrix.length);
  const nullDistances = nullMatrices.map((matrix) => l1(matrix, mean));
  const realDistance = l1(realMatrix, mean);
  const residuals = Array.from(realMatrix, (v, i) => v - mean[i]);
  return {
    realDistance,
    nullDistance: summarize(nullDistances),
    ratio: realDistance / Math.max(1e-12, summarize(nullDistances).meanAbs),
    topCells: residuals
      .map((residual, cell) => ({ cell, residual }))
      .sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual))
      .slice(0, 8),
  };
}

function countResidues(values, q) {
  const counts = new Int32Array(q);
  for (const value of values) {
    if (value % q !== 0) counts[value % q]++;
  }
  return counts;
}

function sampleResidueMatched(lo, hi, q, targetCounts, seed) {
  const random = rng(seed);
  const eligible = new Int32Array(q);
  for (let n = Math.max(5, lo + 1); n <= hi; n++) {
    if (gcd(n, 6 * q) !== 1) continue;
    eligible[n % q]++;
  }
  const probs = new Float64Array(q);
  for (let r = 1; r < q; r++) probs[r] = eligible[r] > 0 ? Math.min(1, targetCounts[r] / eligible[r]) : 0;
  const out = [];
  for (let n = Math.max(5, lo + 1); n <= hi; n++) {
    if (gcd(n, 6 * q) !== 1) continue;
    if (random() < probs[n % q]) out.push(n);
  }
  return out;
}

function renderMarkdown(summary) {
  const lines = ["# Targeted Residue Transition Audit", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push("| interval | real distance | residue-matched null meanAbs | ratio | verdict |");
  lines.push("| --- | ---: | ---: | ---: | --- |");
  for (const row of summary.rows) {
    lines.push(`| ${row.id} | ${row.comparison.realDistance.toFixed(6)} | ${row.comparison.nullDistance.meanAbs.toFixed(6)} | ${row.comparison.ratio.toFixed(3)} | ${row.comparison.ratio >= 2 ? "survives" : "killed"} |`);
  }
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(outDir, { recursive: true });
const maxN = Math.max(...intervals.map((interval) => interval.hi));
console.error(`[target] primes up to ${maxN}`);
const primes = primesUpTo(maxN);

const rows = [];
for (const interval of intervals) {
  console.error(`[target] ${interval.id}`);
  const real = takeWindow(primes, interval.lo, interval.hi);
  const realMatrix = transitionMatrix(real, modulus).matrix;
  const targetCounts = countResidues(real, modulus);
  const nullMatrices = seeds.map((seed) => transitionMatrix(
    sampleResidueMatched(interval.lo, interval.hi, modulus, targetCounts, seed),
    modulus,
  ).matrix);
  rows.push({
    ...interval,
    realCount: real.length,
    targetCounts: Object.fromEntries(Array.from(targetCounts.entries())),
    comparison: compare(realMatrix, nullMatrices),
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: { modulus, seeds, intervals },
  rows,
};

const jsonFile = path.join(outDir, `transition-targeted-residue-mod-${modulus}.json`);
const mdFile = path.join(outDir, `transition-targeted-residue-mod-${modulus}.md`);
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, rows: rows.length }, null, 2));
