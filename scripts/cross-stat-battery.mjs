#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  cramerPrimes,
  primesUpTo,
} from "../src/core/math.js";

const outDir = process.argv[2] || "logs/cross-stat-artifacts";
const maxN = Number(process.argv[3] || 8_000_000);
const ranges = [maxN / 4, maxN / 2, maxN].map((N) => Math.round(N));
const seeds = [12345, 271828, 314159, 161803, 424242];
const qrModuli = [5, 7, 11, 13];

function buildMuOmega(N) {
  const mu = new Int8Array(N + 2);
  const omega = new Int16Array(N + 2);
  const spf = new Int32Array(N + 2);
  const primes = [];
  mu[1] = 1;
  for (let i = 2; i <= N + 1; i++) {
    if (!spf[i]) {
      spf[i] = i;
      primes.push(i);
      mu[i] = -1;
      omega[i] = 1;
    }
    for (let k = 0; k < primes.length; k++) {
      const p = primes[k];
      const m = i * p;
      if (m > N + 1 || p > spf[i]) break;
      spf[m] = p;
      if (i % p === 0) {
        mu[m] = 0;
        omega[m] = omega[i];
        break;
      }
      mu[m] = -mu[i];
      omega[m] = omega[i] + 1;
    }
  }
  return { mu, omega };
}

function corrZ(pairs) {
  const n = pairs.length;
  if (n < 4) return { n, r: 0, z: 0 };
  let sx = 0, sy = 0;
  for (const [x, y] of pairs) {
    sx += x;
    sy += y;
  }
  const mx = sx / n, my = sy / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of pairs) {
    const dx = x - mx;
    const dy = y - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  if (sxx === 0 || syy === 0) return { n, r: 0, z: 0 };
  const r = sxy / Math.sqrt(sxx * syy);
  return { n, r, z: r * Math.sqrt(n) };
}

function welchZ(groupA, groupB) {
  const nA = groupA.length, nB = groupB.length;
  if (nA < 4 || nB < 4) return { nA, nB, meanA: 0, meanB: 0, diff: 0, z: 0 };
  const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const meanA = mean(groupA), meanB = mean(groupB);
  const variance = (xs, m) => xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, xs.length - 1);
  const vA = variance(groupA, meanA), vB = variance(groupB, meanB);
  const se = Math.sqrt(vA / nA + vB / nB);
  const diff = meanA - meanB;
  return { nA, nB, meanA, meanB, diff, z: se > 0 ? diff / se : 0 };
}

function quadraticResidues(q) {
  const residues = new Set();
  for (let a = 1; a < q; a++) residues.add((a * a) % q);
  return residues;
}

function primeGapStats(labels, lo, hi, tables) {
  const { mu, omega } = tables;
  const featurePairs = new Map([
    ["mu_p_minus_1", []],
    ["abs_mu_p_minus_1", []],
    ["omega_p_minus_1", []],
    ["mu_p_plus_1", []],
    ["abs_mu_p_plus_1", []],
    ["omega_p_plus_1", []],
  ]);
  const qrGroups = new Map(qrModuli.map((q) => [q, { qr: [], nr: [] }]));

  for (let i = 0; i + 1 < labels.length; i++) {
    const p = labels[i];
    const next = labels[i + 1];
    if (p <= lo || next > hi) continue;
    const y = (next - p) / Math.log(p);
    featurePairs.get("mu_p_minus_1").push([mu[p - 1], y]);
    featurePairs.get("abs_mu_p_minus_1").push([Math.abs(mu[p - 1]), y]);
    featurePairs.get("omega_p_minus_1").push([omega[p - 1], y]);
    featurePairs.get("mu_p_plus_1").push([mu[p + 1], y]);
    featurePairs.get("abs_mu_p_plus_1").push([Math.abs(mu[p + 1]), y]);
    featurePairs.get("omega_p_plus_1").push([omega[p + 1], y]);
    for (const q of qrModuli) {
      if (p % q === 0) continue;
      const groups = qrGroups.get(q);
      if (quadraticResidueCache.get(q).has(p % q)) groups.qr.push(y);
      else groups.nr.push(y);
    }
  }

  const stats = {};
  for (const [id, pairs] of featurePairs) {
    stats[`corr_${id}_gap`] = { kind: "corr", ...corrZ(pairs) };
  }
  for (const [q, groups] of qrGroups) {
    stats[`qr_minus_qnr_gap_mod_${q}`] = { kind: "welch", ...welchZ(groups.qr, groups.nr) };
  }
  return stats;
}

function integerCountdownStats(labels, lo, hi, tables) {
  const { mu, omega } = tables;
  const pairs = new Map([
    ["mu_n", []],
    ["abs_mu_n", []],
    ["omega_n", []],
  ]);
  let startIndex = 0;
  while (startIndex + 1 < labels.length && labels[startIndex + 1] <= lo) startIndex++;
  for (let i = startIndex; i + 1 < labels.length; i++) {
    const a = labels[i];
    const b = labels[i + 1];
    if (a > hi) break;
    const from = Math.max(lo + 1, a);
    const to = Math.min(hi, b - 1);
    for (let n = from; n <= to; n++) {
      if (n < 3) continue;
      const y = (b - n) / Math.log(n);
      pairs.get("mu_n").push([mu[n], y]);
      pairs.get("abs_mu_n").push([Math.abs(mu[n]), y]);
      pairs.get("omega_n").push([omega[n], y]);
    }
  }
  const stats = {};
  for (const [id, values] of pairs) {
    stats[`corr_${id}_gap_to_next`] = { kind: "corr", ...corrZ(values) };
  }
  return stats;
}

function allStats(labels, lo, hi, tables) {
  return {
    ...primeGapStats(labels, lo, hi, tables),
    ...integerCountdownStats(labels, lo, hi, tables),
  };
}

function valueOf(stat) {
  return stat.z;
}

function summarize(values) {
  if (!values.length) return { n: 0, mean: 0, meanAbs: 0, sd: 0, min: 0, max: 0 };
  const n = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const meanAbs = values.reduce((s, v) => s + Math.abs(v), 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  return { n, mean, meanAbs, sd: Math.sqrt(variance), min: Math.min(...values), max: Math.max(...values) };
}

function evaluate(realByRange, fakeBySeedRange) {
  const ids = Object.keys(realByRange[`prefix-${ranges.at(-1)}`]);
  const rows = [];
  for (const id of ids) {
    const realPrefixValues = ranges.map((N) => valueOf(realByRange[`prefix-${N}`][id]));
    const realHoldout = valueOf(realByRange.holdout[id]);
    const fakeLargest = fakeBySeedRange.map((byRange) => valueOf(byRange[`prefix-${ranges.at(-1)}`][id]));
    const fakeHoldout = fakeBySeedRange.map((byRange) => valueOf(byRange.holdout[id]));
    const nullLargest = summarize(fakeLargest);
    const nullHoldout = summarize(fakeHoldout);
    const signs = realPrefixValues.map((v) => Math.sign(v));
    const stableSign = signs.every((s) => s !== 0 && s === signs[0]);
    const largestPass = Math.abs(realPrefixValues.at(-1)) > Math.max(6, 2 * nullLargest.meanAbs);
    const holdoutPass = Math.abs(realHoldout) > Math.max(6, 2 * nullHoldout.meanAbs)
      && Math.sign(realHoldout) === signs.at(-1);
    rows.push({
      id,
      kind: realByRange[`prefix-${ranges.at(-1)}`][id].kind,
      realPrefixValues,
      realHoldout,
      nullLargest,
      nullHoldout,
      stableSign,
      largestPass,
      holdoutPass,
      star: stableSign && largestPass && holdoutPass,
    });
  }
  rows.sort((a, b) => {
    if (Number(b.star) !== Number(a.star)) return Number(b.star) - Number(a.star);
    const scoreA = Math.abs(a.realPrefixValues.at(-1)) / Math.max(1e-9, a.nullLargest.meanAbs);
    const scoreB = Math.abs(b.realPrefixValues.at(-1)) / Math.max(1e-9, b.nullLargest.meanAbs);
    return scoreB - scoreA;
  });
  return rows;
}

function renderMarkdown(summary) {
  const lines = ["# Cross-Statistic Battery", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push("| rank | statistic | prefix z values | holdout z | fake largest meanAbs | fake holdout meanAbs | verdict |");
  lines.push("| ---: | --- | ---: | ---: | ---: | ---: | --- |");
  summary.rows.slice(0, 20).forEach((row, idx) => {
    const prefix = row.realPrefixValues.map((v) => v.toFixed(3)).join(", ");
    const verdict = row.star ? "STAR" : "noise";
    lines.push(`| ${idx + 1} | ${row.id} | ${prefix} | ${row.realHoldout.toFixed(3)} | ${row.nullLargest.meanAbs.toFixed(3)} | ${row.nullHoldout.meanAbs.toFixed(3)} | ${verdict} |`);
  });
  return `${lines.join("\n")}\n`;
}

const quadraticResidueCache = new Map(qrModuli.map((q) => [q, quadraticResidues(q)]));

fs.mkdirSync(outDir, { recursive: true });
console.error(`[cross] building mu/omega up to ${maxN + 1}`);
const tables = buildMuOmega(maxN + 1);
console.error(`[cross] building real primes up to ${maxN}`);
const realLabels = primesUpTo(maxN);
console.error("[cross] building fake labels");
const fakeLabels = seeds.map((seed) => cramerPrimes(maxN, seed));

const realByRange = {};
for (const N of ranges) {
  console.error(`[cross] real prefix ${N}`);
  realByRange[`prefix-${N}`] = allStats(realLabels, 1, N, tables);
}
console.error("[cross] real holdout");
realByRange.holdout = allStats(realLabels, ranges.at(-2), ranges.at(-1), tables);

const fakeBySeedRange = [];
for (let i = 0; i < seeds.length; i++) {
  const byRange = {};
  for (const N of ranges) {
    console.error(`[cross] fake seed ${seeds[i]} prefix ${N}`);
    byRange[`prefix-${N}`] = allStats(fakeLabels[i], 1, N, tables);
  }
  console.error(`[cross] fake seed ${seeds[i]} holdout`);
  byRange.holdout = allStats(fakeLabels[i], ranges.at(-2), ranges.at(-1), tables);
  fakeBySeedRange.push(byRange);
}

const rows = evaluate(realByRange, fakeBySeedRange);
const summary = {
  generatedAt: new Date().toISOString(),
  parameters: { maxN, ranges, holdout: [ranges.at(-2), ranges.at(-1)], seeds, qrModuli },
  rows,
};

const jsonFile = path.join(outDir, `cross-stat-${maxN}.json`);
const mdFile = path.join(outDir, `cross-stat-${maxN}.md`);
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, rows: rows.length }, null, 2));
