#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  chowlaTwoPoint,
  polynomialTwinPrediction,
  polynomialTwinSingularSeries,
  twinIrreducibleCounts,
} from "../src/core/ffield.js";
import { mobiusUpTo, sieve } from "../src/core/math.js";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const maxQ2 = Number(process.argv[3] || 16);
const maxQ3 = Number(process.argv[4] || 12);
const integerN = Number(process.argv[5] || 1000000);

const SHIFTS = [
  { id: "1", label: "1", poly: (q) => 1, int: 1 },
  { id: "t", label: "t", poly: (q) => q, int: 2 },
  { id: "t+1", label: "t+1", poly: (q) => q + 1, int: 3 },
];

function fitLogAbsDecay(rows) {
  const pts = rows.filter((r) => r.degree >= 2 && Math.abs(r.value) > 0);
  if (pts.length < 2) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const row of pts) {
    const x = row.degree;
    const y = Math.log(Math.abs(row.value));
    sx += x; sy += y; sxx += x * x; sxy += x * y;
  }
  const n = pts.length;
  const den = n * sxx - sx * sx;
  if (den === 0) return null;
  const slope = (n * sxy - sx * sy) / den;
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept, expPerDegree: Math.exp(slope), points: pts.length };
}

function harmonicSamples(N) {
  const base = [100000, 300000, 1000000, 3000000, 10000000, 30000000, 100000000];
  const out = base.filter((x) => x <= N);
  if (!out.includes(N)) out.push(N);
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

function integerChowlaCurves(N) {
  const maxH = Math.max(...SHIFTS.map((s) => s.int));
  const mu = mobiusUpTo(N + maxH);
  const samples = harmonicSamples(N);
  const rows = [];
  const sums = new Map(SHIFTS.map((s) => [s.id, 0]));
  let harmonic = 0;
  let sampleIndex = 0;
  for (let m = 1; m <= N; m++) {
    harmonic += 1 / m;
    for (const shift of SHIFTS) {
      if (m + shift.int <= N) sums.set(shift.id, sums.get(shift.id) + (mu[m] || 0) * (mu[m + shift.int] || 0) / m);
    }
    while (sampleIndex < samples.length && m === samples[sampleIndex]) {
      for (const shift of SHIFTS) {
        rows.push({
          universe: "Z",
          shift: shift.id,
          N: m,
          weightedSum: sums.get(shift.id),
          harmonic,
          normalized: sums.get(shift.id) / harmonic,
        });
      }
      sampleIndex++;
    }
  }
  return rows;
}

function logSquaredIntegral(N) {
  const lo = 3;
  const hi = Math.max(lo, N);
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

function twinPrimeRows(N) {
  const isp = sieve(N + 2);
  const samples = harmonicSamples(N);
  const C2 = 0.6601618158468696;
  const rows = [];
  let count = 0, sampleIndex = 0;
  for (let n = 2; n <= N; n++) {
    if (n >= 4 && isp[n - 2] && isp[n]) count++;
    while (sampleIndex < samples.length && n === samples[sampleIndex]) {
      const predicted = 2 * C2 * logSquaredIntegral(n);
      rows.push({ universe: "Z", N: n, observed: count, predicted, ratio: predicted ? count / predicted : null });
      sampleIndex++;
    }
  }
  return rows;
}

function linePath(points, xScale, yScale) {
  return points.map((p, i) => `${i ? "L" : "M"}${xScale(p.x).toFixed(2)},${yScale(p.y).toFixed(2)}`).join(" ");
}

function writeSvg(summary, file) {
  const width = 980, height = 560;
  const pad = { l: 62, r: 30, t: 42, b: 54 };
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  const q3Chowla = summary.chowla.filter((r) => r.q === 3 && r.degree >= 2).map((r) => ({
    x: r.degree,
    y: Math.max(1e-6, Math.abs(r.value)),
    shift: r.shift,
  }));
  const twin = summary.polyTwins.filter((r) => r.q === 3 && r.predicted > 0 && r.degree >= 2).map((r) => ({
    x: r.degree,
    y: r.ratio,
    shift: r.shift,
  }));
  const maxDegree = Math.max(2, ...q3Chowla.map((p) => p.x), ...twin.map((p) => p.x));
  const x = (v) => pad.l + ((v - 1) / (maxDegree - 1)) * plotW;
  const yLog = (v) => pad.t + (Math.log10(1) - Math.log10(v)) / (Math.log10(1) - Math.log10(1e-6)) * (plotH * 0.48);
  const yRatio = (v) => pad.t + plotH * 0.54 + (1.8 - Math.min(1.8, Math.max(0, v))) / 1.8 * (plotH * 0.38);
  const colors = { "1": "#38bdf8", "t": "#f59e0b", "t+1": "#a78bfa" };
  const paths = [];
  for (const shift of SHIFTS) {
    const cPts = q3Chowla.filter((p) => p.shift === shift.id);
    if (cPts.length) paths.push(`<path d="${linePath(cPts, x, yLog)}" fill="none" stroke="${colors[shift.id]}" stroke-width="2"/>`);
    const tPts = twin.filter((p) => p.shift === shift.id);
    if (tPts.length) paths.push(`<path d="${linePath(tPts, x, yRatio)}" fill="none" stroke="${colors[shift.id]}" stroke-width="2" stroke-dasharray="5 4"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#08111f"/>
  <text x="${pad.l}" y="24" fill="#e5edf7" font-family="system-ui" font-size="17">Two-universes calibration: F_3[t] Chowla decay and twin-density ratios</text>
  <line x1="${pad.l}" y1="${pad.t + plotH * 0.48}" x2="${width - pad.r}" y2="${pad.t + plotH * 0.48}" stroke="#243244"/>
  <line x1="${pad.l}" y1="${pad.t + plotH * 0.54}" x2="${width - pad.r}" y2="${pad.t + plotH * 0.54}" stroke="#243244"/>
  <text x="14" y="${pad.t + 18}" fill="#9fb0c4" font-family="ui-monospace" font-size="12">|C(h,n)|</text>
  <text x="14" y="${pad.t + plotH * 0.56}" fill="#9fb0c4" font-family="ui-monospace" font-size="12">obs/pred</text>
  ${[1, 4, 8, 12, 15].filter((d) => d <= maxDegree).map((d) => `<text x="${x(d)}" y="${height - 22}" fill="#8091a8" font-family="ui-monospace" font-size="11" text-anchor="middle">${d}</text>`).join("")}
  <text x="${pad.l + plotW / 2}" y="${height - 8}" fill="#9fb0c4" font-family="ui-monospace" font-size="12" text-anchor="middle">degree n (log analog)</text>
  ${paths.join("\n  ")}
  ${SHIFTS.map((s, i) => `<g transform="translate(${width - 210},${58 + i * 22})"><line x1="0" y1="0" x2="30" y2="0" stroke="${colors[s.id]}" stroke-width="2"/><text x="38" y="4" fill="#d8e2ee" font-family="ui-monospace" font-size="12">h=${s.label}</text></g>`).join("")}
  <rect x="${width - 220}" y="132" width="204" height="42" rx="3" fill="#08111f" stroke="#243244"/>
  <text x="${width - 210}" y="149" fill="#9fb0c4" font-family="ui-monospace" font-size="11">solid: Chowla |avg mu(f)mu(f+h)|</text>
  <text x="${width - 210}" y="167" fill="#9fb0c4" font-family="ui-monospace" font-size="11">dashed: twin obs/pred</text>
</svg>`;
  fs.writeFileSync(file, svg);
}

fs.mkdirSync(outDir, { recursive: true });

const pnt = [];
const chowla = [];
const chowlaFits = [];
const polyTwins = [];
for (const [q, maxDegree] of [[2, maxQ2], [3, maxQ3]]) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  for (let degree = 1; degree <= maxDegree; degree++) {
    pnt.push({
      universe: `F_${q}[t]`,
      degree,
      observed: universe.counts[degree],
      exact: universe.exactCounts[degree],
      delta: universe.counts[degree] - universe.exactCounts[degree],
    });
  }
  for (const shift of SHIFTS) {
    const h = shift.poly(q);
    const C = chowlaTwoPoint(q, maxDegree, h);
    const shiftRows = [];
    for (let degree = 1; degree <= maxDegree; degree++) {
      const row = { universe: `F_${q}[t]`, q, shift: shift.id, degree, value: C[degree] };
      chowla.push(row);
      shiftRows.push(row);
    }
    chowlaFits.push({ universe: `F_${q}[t]`, q, shift: shift.id, fit: fitLogAbsDecay(shiftRows) });

    const twins = twinIrreducibleCounts(q, maxDegree, h);
    const singular = polynomialTwinSingularSeries(q, maxDegree, h);
    for (let degree = 1; degree <= maxDegree; degree++) {
      const predicted = polynomialTwinPrediction(q, degree, h, maxDegree);
      polyTwins.push({
        universe: `F_${q}[t]`,
        q,
        shift: shift.id,
        degree,
        observed: twins[degree],
        singularSeries: singular,
        predicted,
        ratio: predicted ? twins[degree] / predicted : null,
      });
    }
  }
}

const integerChowla = integerChowlaCurves(integerN);
const integerTwins = twinPrimeRows(integerN);

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: { maxQ2, maxQ3, integerN },
  labels: {
    pnt: "[F_q[t]: measured] observed counts compared with [F_q[t]: THEOREM] exact formula",
    chowla: "[F_q[t]: measured] and [Z: measured] two-point Mobius correlations",
    twins: "[F_q[t]: measured]/[F_q[t]: conjecture-asymptotic] and [Z: measured]/[Z: conjecture] density ratios",
  },
  pnt,
  chowla,
  chowlaFits,
  integerChowla,
  polyTwins,
  integerTwins,
};

const jsonFile = path.join(outDir, "calibration-summary.json");
const svgFile = path.join(outDir, "calibration-summary.svg");
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
writeSvg(summary, svgFile);
console.log(JSON.stringify({ ok: true, jsonFile, svgFile, parameters: summary.parameters }, null, 2));
