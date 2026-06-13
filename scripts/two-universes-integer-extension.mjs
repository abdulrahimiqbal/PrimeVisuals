#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { mobiusUpTo, sieve } from "../src/core/math.js";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const N = Number(process.argv[3] || 100000000);
const samples = [10000000, 30000000, 100000000].filter((x) => x <= N);
if (!samples.includes(N)) samples.push(N);

const SHIFTS = [
  { id: "1", h: 1 },
  { id: "2", h: 2 },
  { id: "3", h: 3 },
];

function logSquaredIntegral(xMax) {
  const lo = 3;
  const hi = Math.max(lo, xMax);
  const steps = Math.max(200, Math.ceil(Math.sqrt(hi)));
  const h = (hi - lo) / steps;
  let sum = 0;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * h;
    const fx = 1 / (Math.log(x) ** 2);
    sum += fx * (i === 0 || i === steps ? 1 : i % 2 === 0 ? 2 : 4);
  }
  return (h / 3) * sum;
}

function computeIntegerExtension(limit) {
  const t0 = performance.now();
  const maxH = Math.max(...SHIFTS.map((s) => s.h));
  const mu = mobiusUpTo(limit + maxH);
  const mobiusMs = Math.round(performance.now() - t0);

  const chowla = [];
  const sums = new Map(SHIFTS.map((s) => [s.id, 0]));
  let harmonic = 0;
  let sampleIndex = 0;
  const t1 = performance.now();
  for (let m = 1; m <= limit; m++) {
    harmonic += 1 / m;
    for (const shift of SHIFTS) {
      if (m + shift.h <= limit) sums.set(shift.id, sums.get(shift.id) + (mu[m] || 0) * (mu[m + shift.h] || 0) / m);
    }
    while (sampleIndex < samples.length && m === samples[sampleIndex]) {
      for (const shift of SHIFTS) {
        let sampleSum = sums.get(shift.id);
        for (let k = Math.max(1, m - shift.h + 1); k <= m; k++) {
          if (k + shift.h <= limit) sampleSum -= (mu[k] || 0) * (mu[k + shift.h] || 0) / k;
        }
        chowla.push({
          universe: "Z",
          shift: shift.id,
          N: m,
          weightedSum: sampleSum,
          harmonic,
          normalized: sampleSum / harmonic,
        });
      }
      sampleIndex++;
    }
  }
  const chowlaMs = Math.round(performance.now() - t1);

  const t2 = performance.now();
  const isp = sieve(limit);
  const C2 = 0.6601618158468696;
  const twins = [];
  let count = 0;
  sampleIndex = 0;
  for (let n = 2; n <= limit; n++) {
    if (n >= 4 && isp[n - 2] && isp[n]) count++;
    while (sampleIndex < samples.length && n === samples[sampleIndex]) {
      const predicted = 2 * C2 * logSquaredIntegral(n);
      twins.push({ universe: "Z", N: n, observed: count, predicted, ratio: predicted ? count / predicted : null });
      sampleIndex++;
    }
  }
  const twinMs = Math.round(performance.now() - t2);
  return {
    generatedAt: new Date().toISOString(),
    parameters: { N: limit, samples },
    timingsMs: { mobius: mobiusMs, chowla: chowlaMs, twins: twinMs, total: Math.round(performance.now() - t0) },
    chowla,
    twins,
  };
}

fs.mkdirSync(outDir, { recursive: true });
const summary = computeIntegerExtension(N);
const file = path.join(outDir, `integer-extension-${N}.json`);
fs.writeFileSync(file, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ok: true, file, timingsMs: summary.timingsMs, parameters: summary.parameters }, null, 2));
