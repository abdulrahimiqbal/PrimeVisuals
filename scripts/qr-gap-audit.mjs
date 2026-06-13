#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  cramerPrimes,
  primesUpTo,
} from "../src/core/math.js";

const outDir = process.argv[2] || "logs/cross-stat-artifacts";
const maxN = Number(process.argv[3] || 32_000_000);
const q = Number(process.argv[4] || 11);
const ranges = [maxN / 4, maxN / 2, maxN].map((N) => Math.round(N));
const seeds = [12345, 271828, 314159, 161803, 424242];

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

function quadraticResidues(modulus) {
  const residues = new Set();
  for (let a = 1; a < modulus; a++) residues.add((a * a) % modulus);
  return residues;
}

function mean(xs) {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function variance(xs, m) {
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, xs.length - 1);
}

function qrGapStat(labels, modulus, lo, hi) {
  const qrSet = quadraticResidues(modulus);
  const qr = [];
  const qnr = [];
  const residueCounts = Object.fromEntries(Array.from({ length: modulus }, (_, r) => [r, 0]));
  for (let i = 0; i + 1 < labels.length; i++) {
    const p = labels[i];
    const next = labels[i + 1];
    if (p <= lo || next > hi || p % modulus === 0) continue;
    const y = (next - p) / Math.log(p);
    const r = p % modulus;
    residueCounts[r]++;
    if (qrSet.has(r)) qr.push(y);
    else qnr.push(y);
  }
  const meanQr = qr.length ? mean(qr) : 0;
  const meanQnr = qnr.length ? mean(qnr) : 0;
  const varQr = qr.length > 1 ? variance(qr, meanQr) : 0;
  const varQnr = qnr.length > 1 ? variance(qnr, meanQnr) : 0;
  const se = Math.sqrt(varQr / Math.max(1, qr.length) + varQnr / Math.max(1, qnr.length));
  const diff = meanQr - meanQnr;
  return {
    nQr: qr.length,
    nQnr: qnr.length,
    meanQr,
    meanQnr,
    diff,
    z: se > 0 ? diff / se : 0,
    residueCounts,
  };
}

function countEligibleByResidue(N, modulus, lo = 1) {
  const counts = new Int32Array(modulus);
  for (let n = Math.max(5, lo + 1); n <= N; n++) {
    if (gcd(n, 6 * modulus) !== 1) continue;
    counts[n % modulus]++;
  }
  return counts;
}

function countLabelsByResidue(labels, modulus, lo, hi) {
  const counts = new Int32Array(modulus);
  for (const n of labels) {
    if (n <= lo || n > hi || n % modulus === 0) continue;
    counts[n % modulus]++;
  }
  return counts;
}

function residueMatchedLabels(N, modulus, targetCounts, eligible, seed, lo = 1) {
  const random = rng(seed);
  const probs = new Float64Array(modulus);
  for (let r = 1; r < modulus; r++) {
    probs[r] = eligible[r] > 0 ? Math.min(1, targetCounts[r] / eligible[r]) : 0;
  }
  const out = lo <= 1 ? [2, 3] : [];
  for (let n = Math.max(5, lo + 1); n <= N; n++) {
    if (gcd(n, 6 * modulus) !== 1) continue;
    if (random() < probs[n % modulus]) out.push(n);
  }
  return out;
}

function summarize(values) {
  if (!values.length) return { n: 0, mean: 0, meanAbs: 0, sd: 0, min: 0, max: 0 };
  const n = values.length;
  const m = mean(values);
  const meanAbs = values.reduce((s, v) => s + Math.abs(v), 0) / n;
  return {
    n,
    mean: m,
    meanAbs,
    sd: Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / n),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function evaluateRange(realLabels, N, lo = 1) {
  const real = qrGapStat(realLabels, q, lo, N);
  const cramerStats = [];
  const matchedStats = [];
  const targetCounts = countLabelsByResidue(realLabels, q, lo, N);
  const eligible = countEligibleByResidue(N, q, lo);
  for (const seed of seeds) {
    cramerStats.push(qrGapStat(cramerPrimes(N, seed), q, lo, N).z);
    matchedStats.push(qrGapStat(residueMatchedLabels(N, q, targetCounts, eligible, seed, lo), q, lo, N).z);
  }
  return {
    lo,
    hi: N,
    real,
    cramerNull: summarize(cramerStats),
    residueMatchedNull: summarize(matchedStats),
    targetCounts: Object.fromEntries(Array.from(targetCounts.entries())),
  };
}

function renderMarkdown(summary) {
  const lines = ["# QR Gap Audit", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push("| range | real z | QR mean | QNR mean | QR n | QNR n | Cramer meanAbs | residue-matched meanAbs | verdict |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of summary.rows) {
    const verdict = Math.abs(row.real.z) > Math.max(6, 2 * row.cramerNull.meanAbs)
      && Math.abs(row.real.z) > Math.max(6, 2 * row.residueMatchedNull.meanAbs)
      ? "survives" : "killed";
    lines.push(`| (${row.lo}, ${row.hi}] | ${row.real.z.toFixed(6)} | ${row.real.meanQr.toFixed(6)} | ${row.real.meanQnr.toFixed(6)} | ${row.real.nQr} | ${row.real.nQnr} | ${row.cramerNull.meanAbs.toFixed(6)} | ${row.residueMatchedNull.meanAbs.toFixed(6)} | ${verdict} |`);
  }
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[qr] building real primes up to ${maxN}`);
const realLabels = primesUpTo(maxN);
const rows = [];
for (const N of ranges) {
  console.error(`[qr] prefix ${N}`);
  rows.push(evaluateRange(realLabels, N, 1));
}
console.error(`[qr] holdout ${ranges.at(-2)}..${ranges.at(-1)}`);
rows.push(evaluateRange(realLabels, ranges.at(-1), ranges.at(-2)));

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: { maxN, q, ranges, holdout: [ranges.at(-2), ranges.at(-1)], seeds },
  rows,
};

const jsonFile = path.join(outDir, `qr-gap-mod-${q}-${maxN}.json`);
const mdFile = path.join(outDir, `qr-gap-mod-${q}-${maxN}.md`);
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, rows: rows.length }, null, 2));
