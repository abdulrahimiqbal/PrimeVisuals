#!/usr/bin/env node
/* Prime spectroscopy from raw arithmetic data.

   The spectrum builders below never call zeta and never read the zero
   table. Zeros enter only through the explicit matching/report functions
   and CLI summaries. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cramerPrimes, primePowersUpTo, sieve } from "../src/core/math.js";

export const DEFAULT_SEEDS = [12345, 271828, 314159, 161803, 424242];

export const RESIDUE_FRACTIONS = [
  [1, 2], [1, 3], [4, 15], [2, 19], [7, 19], [9, 38],
  [13, 33], [1, 46], [2, 11], [19, 66], [17, 78],
];

const STEP_EPSILON = 1e-12;

export function logGrid(xMin, xMax, n) {
  if (!(xMin > 1) || !(xMax > xMin)) throw new Error("expected 1 < xMin < xMax");
  if (!Number.isInteger(n) || n < 8) throw new Error("expected at least 8 samples");
  const uMin = Math.log(xMin);
  const uMax = Math.log(xMax);
  const us = new Float64Array(n);
  const xs = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const u = uMin + ((uMax - uMin) * i) / (n - 1);
    us[i] = u;
    xs[i] = Math.exp(u);
  }
  return { xMin, xMax, uMin, uMax, us, xs };
}

export function hann(i, n) {
  return n <= 1 ? 1 : 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
}

export function mean(values) {
  let s = 0;
  for (const v of values) s += v;
  return values.length ? s / values.length : 0;
}

export function sampleStepEvents(events, grid, options = {}) {
  const {
    mainTerm = () => 0,
    theta = 0,
    center = false,
  } = options;
  const ys = new Float64Array(grid.xs.length);
  let j = 0;
  let acc = 0;
  for (let i = 0; i < grid.xs.length; i++) {
    const x = grid.xs[i];
    const cutoff = x * (1 + STEP_EPSILON);
    while (j < events.x.length && events.x[j] <= cutoff) {
      acc += events.w[j];
      j++;
    }
    const residual = acc - mainTerm(x);
    ys[i] = residual / Math.pow(x, theta);
  }
  if (center) {
    const m = mean(ys);
    for (let i = 0; i < ys.length; i++) ys[i] -= m;
  }
  return ys;
}

export function primePsiEvents(N) {
  return primePowersUpTo(Math.ceil(N));
}

export function weightedPowerEventsFromBases(bases, N) {
  const extra = [];
  for (const b of bases) {
    if (b > N / b) break;
    const lb = Math.log(b);
    let q = b * b;
    while (q <= N) {
      extra.push([q, lb]);
      if (q > N / b) break;
      q *= b;
    }
  }
  extra.sort((a, b) => a[0] - b[0]);

  const total = bases.length + extra.length;
  const xs = new Float64Array(total);
  const ws = new Float64Array(total);
  let i = 0;
  let j = 0;
  let out = 0;
  while (i < bases.length || j < extra.length) {
    const bx = i < bases.length ? bases[i] : Infinity;
    const ex = j < extra.length ? extra[j][0] : Infinity;
    if (bx <= ex) {
      xs[out] = bx;
      ws[out] = Math.log(bx);
      i++;
    } else {
      xs[out] = ex;
      ws[out] = extra[j][1];
      j++;
    }
    out++;
  }
  return { x: xs, w: ws };
}

export function cramerPsiEvents(N, seed) {
  return weightedPowerEventsFromBases(cramerPrimes(Math.ceil(N), seed), Math.ceil(N));
}

export function twinPrimeEvents(N) {
  const max = Math.ceil(N) + 2;
  const isPrime = sieve(max);
  const xs = [];
  const ws = [];
  for (let p = 2; p <= N; p++) {
    if (isPrime[p] && isPrime[p + 2]) {
      xs.push(p);
      ws.push(Math.log(p));
    }
  }
  return { x: Float64Array.from(xs), w: Float64Array.from(ws) };
}

export function n2Plus1PrimeEvents(N) {
  const max = Math.ceil(N);
  const isPrime = sieve(max);
  const xs = [];
  const ws = [];
  const limit = Math.floor(Math.sqrt(max - 1));
  for (let n = 1; n <= limit; n++) {
    const v = n * n + 1;
    if (isPrime[v]) {
      xs.push(v);
      ws.push(Math.log(v));
    }
  }
  return { x: Float64Array.from(xs), w: Float64Array.from(ws) };
}

export function cramerTwinEvents(N, seed) {
  const max = Math.ceil(N) + 2;
  const fake = cramerPrimes(max, seed);
  const present = new Uint8Array(max + 1);
  for (const p of fake) present[p] = 1;
  const xs = [];
  const ws = [];
  for (const p of fake) {
    if (p <= N && present[p + 2]) {
      xs.push(p);
      ws.push(Math.log(p));
    }
  }
  return { x: Float64Array.from(xs), w: Float64Array.from(ws) };
}

export function cramerN2Plus1Events(N, seed) {
  const max = Math.ceil(N);
  const fake = cramerPrimes(max, seed);
  const present = new Uint8Array(max + 1);
  for (const p of fake) present[p] = 1;
  const xs = [];
  const ws = [];
  const limit = Math.floor(Math.sqrt(max - 1));
  for (let n = 1; n <= limit; n++) {
    const v = n * n + 1;
    if (present[v]) {
      xs.push(v);
      ws.push(Math.log(v));
    }
  }
  return { x: Float64Array.from(xs), w: Float64Array.from(ws) };
}

export function spectrumFromSamples(samples, grid, options = {}) {
  const {
    minFreq = 0.1,
    maxFreq = 120,
    oversample = 12,
    center = true,
  } = options;
  const n = samples.length;
  if (n !== grid.us.length) throw new Error("sample/grid length mismatch");
  const values = Float64Array.from(samples);
  if (center) {
    const m = mean(values);
    for (let i = 0; i < values.length; i++) values[i] -= m;
  }

  const span = grid.uMax - grid.uMin;
  const resolution = (2 * Math.PI) / span;
  const step = resolution / oversample;
  const start = Math.max(step, Math.ceil(minFreq / step) * step);
  const bins = [];
  let windowSum = 0;
  for (let i = 0; i < n; i++) windowSum += hann(i, n);

  for (let f = start; f <= maxFreq + step / 2; f += step) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const w = hann(i, n);
      const y = values[i] * w;
      const phase = f * grid.us[i];
      re += y * Math.cos(phase);
      im -= y * Math.sin(phase);
    }
    bins.push({
      freq: f,
      amplitude: (2 * Math.hypot(re, im)) / windowSum,
      power: (re * re + im * im) / (windowSum * windowSum),
    });
  }

  const peaks = [];
  for (let i = 1; i < bins.length - 1; i++) {
    if (bins[i].amplitude > bins[i - 1].amplitude && bins[i].amplitude >= bins[i + 1].amplitude) {
      peaks.push({ ...bins[i] });
    }
  }
  peaks.sort((a, b) => b.amplitude - a.amplitude);
  return { bins, peaks, resolution, step, span };
}

export function fitScale(events, grid, shapeFn) {
  let j = 0;
  let acc = 0;
  let hh = 0;
  let yh = 0;
  for (const x of grid.xs) {
    const cutoff = x * (1 + STEP_EPSILON);
    while (j < events.x.length && events.x[j] <= cutoff) {
      acc += events.w[j];
      j++;
    }
    const h = shapeFn(x);
    hh += h * h;
    yh += acc * h;
  }
  return hh > 0 ? yh / hh : 0;
}

export function residualStats(events, grid, mainTerm) {
  let j = 0;
  let acc = 0;
  let maxAbs = 0;
  let sumSq = 0;
  for (const x of grid.xs) {
    const cutoff = x * (1 + STEP_EPSILON);
    while (j < events.x.length && events.x[j] <= cutoff) {
      acc += events.w[j];
      j++;
    }
    const r = acc - mainTerm(x);
    const ar = Math.abs(r);
    if (ar > maxAbs) maxAbs = ar;
    sumSq += r * r;
  }
  return { maxAbs, rms: Math.sqrt(sumSq / grid.xs.length) };
}

export function fitLogSlope(points) {
  const filtered = points.filter((p) => p.x > 0 && p.y > 0);
  const n = filtered.length;
  if (n < 2) return 0;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (const p of filtered) {
    const lx = Math.log(p.x);
    const ly = Math.log(p.y);
    sx += lx;
    sy += ly;
    sxx += lx * lx;
    sxy += lx * ly;
  }
  const den = n * sxx - sx * sx;
  return den ? (n * sxy - sx * sy) / den : 0;
}

export function estimateTheta(events, options) {
  const {
    xMin,
    rangeMaxes,
    sampleCount = 2048,
    shapeFn,
  } = options;
  const rows = [];
  for (const xMax of rangeMaxes) {
    const grid = logGrid(xMin, xMax, sampleCount);
    const c = fitScale(events, grid, shapeFn);
    const stats = residualStats(events, grid, (x) => c * shapeFn(x));
    rows.push({ xMax, c, ...stats });
  }
  const thetaMax = fitLogSlope(rows.map((r) => ({ x: r.xMax, y: r.maxAbs })));
  const thetaRms = fitLogSlope(rows.map((r) => ({ x: r.xMax, y: r.rms })));
  return {
    theta: Math.max(0, Math.min(1, thetaMax)),
    thetaMax,
    thetaRms,
    rows,
  };
}

export function nearestMatch(value, targets, tolerance = Infinity) {
  let best = null;
  for (let i = 0; i < targets.length; i++) {
    const error = Math.abs(value - targets[i]);
    if (error <= tolerance && (!best || error < best.error)) {
      best = { index: i, value: targets[i], error };
    }
  }
  return best;
}

export function matchPeaksToTargets(peaks, targets, tolerance, count = peaks.length) {
  const used = new Set();
  const rows = [];
  let matched = 0;
  let spurious = 0;
  for (const peak of peaks.slice(0, count)) {
    let best = null;
    for (let i = 0; i < targets.length; i++) {
      if (used.has(i)) continue;
      const error = Math.abs(peak.freq - targets[i]);
      if (error <= tolerance && (!best || error < best.error)) {
        best = { index: i, value: targets[i], error };
      }
    }
    if (best) {
      used.add(best.index);
      matched++;
      rows.push({ ...peak, matchIndex: best.index, matchValue: best.value, error: best.error });
    } else {
      spurious++;
      rows.push({ ...peak, matchIndex: null, matchValue: null, error: null });
    }
  }
  return { matched, spurious, missed: Math.max(0, Math.min(count, targets.length) - matched), rows };
}

export function residueCatalogFrequencies(maxFreq) {
  const out = [];
  for (const [p, q] of RESIDUE_FRACTIONS) {
    const frac = p / q;
    for (let m = 0; ; m++) {
      const f = 2 * Math.PI * (m + frac);
      if (f > maxFreq) break;
      out.push({ freq: f, label: `${p}/${q}+${m}` });
    }
  }
  out.sort((a, b) => a.freq - b.freq);
  return out;
}

export function classifyPeak(freq, zeros, tolerance, maxFreq = 120) {
  const zero = nearestMatch(freq, zeros, tolerance);
  if (zero) return { kind: "zeta", label: `zero ${zero.index + 1}`, error: zero.error };
  const residues = residueCatalogFrequencies(maxFreq);
  let bestResidue = null;
  for (const r of residues) {
    const error = Math.abs(freq - r.freq);
    if (error <= tolerance && (!bestResidue || error < bestResidue.error)) {
      bestResidue = { ...r, error };
    }
  }
  if (bestResidue) return { kind: "residue", label: bestResidue.label, error: bestResidue.error };
  return { kind: "unexplained", label: "unmatched", error: null };
}

export function clusterStablePeaks(seedPeaks, tolerance) {
  const clusters = [];
  for (let seedIndex = 0; seedIndex < seedPeaks.length; seedIndex++) {
    for (const peak of seedPeaks[seedIndex]) {
      let cluster = clusters.find((c) => Math.abs(c.freq - peak.freq) <= tolerance);
      if (!cluster) {
        cluster = { freq: peak.freq, members: [], seeds: new Set(), maxAmplitude: 0 };
        clusters.push(cluster);
      }
      cluster.members.push({ seedIndex, ...peak });
      cluster.seeds.add(seedIndex);
      cluster.maxAmplitude = Math.max(cluster.maxAmplitude, peak.amplitude);
      cluster.freq = cluster.members.reduce((s, p) => s + p.freq, 0) / cluster.members.length;
    }
  }
  return clusters
    .map((c) => ({
      freq: c.freq,
      support: c.seeds.size,
      members: c.members.length,
      maxAmplitude: c.maxAmplitude,
    }))
    .sort((a, b) => b.support - a.support || b.maxAmplitude - a.maxAmplitude);
}

export function shapeTwin(x) {
  return x / Math.log(Math.max(3, x));
}

export function shapeN2Plus1(x) {
  return Math.sqrt(Math.max(0, x));
}

export function analysePsiSpectrum(options = {}) {
  const {
    xMin = 1e4,
    xMax = 1e8,
    sampleCount = 8192,
    maxFreq = 120,
    oversample = 12,
  } = options;
  const grid = logGrid(xMin, xMax, sampleCount);
  const events = primePsiEvents(xMax);
  const samples = sampleStepEvents(events, grid, { mainTerm: (x) => x, theta: 0.5, center: true });
  const spectrum = spectrumFromSamples(samples, grid, { maxFreq, oversample, center: true });
  return { xMin, xMax, sampleCount, eventCount: events.x.length, grid, samples, spectrum };
}

export function analyseCramerPsi(options = {}) {
  const {
    xMin = 1e4,
    xMax = 1e7,
    sampleCount = 4096,
    maxFreq = 120,
    oversample = 8,
    seeds = DEFAULT_SEEDS,
    top = 20,
  } = options;
  const grid = logGrid(xMin, xMax, sampleCount);
  const runs = [];
  const avg = new Float64Array(sampleCount);
  for (const seed of seeds) {
    const events = cramerPsiEvents(xMax, seed);
    const samples = sampleStepEvents(events, grid, { mainTerm: (x) => x, theta: 0.5, center: true });
    for (let i = 0; i < sampleCount; i++) avg[i] += samples[i] / seeds.length;
    const spectrum = spectrumFromSamples(samples, grid, { maxFreq, oversample, center: true });
    runs.push({ seed, eventCount: events.x.length, spectrum, topPeaks: spectrum.peaks.slice(0, top) });
  }
  const avgSpectrum = spectrumFromSamples(avg, grid, { maxFreq, oversample, center: true });
  const clusters = clusterStablePeaks(runs.map((r) => r.topPeaks), avgSpectrum.resolution);
  return { xMin, xMax, sampleCount, seeds, grid, runs, avgSpectrum, clusters };
}

export function analyseWindowShifts(options = {}) {
  const {
    starts = [1e4, 31622.776601683792, 1e5],
    ratio = 1000,
    sampleCount = 4096,
    maxFreq = 90,
    oversample = 8,
    top = 20,
  } = options;
  const xMax = Math.max(...starts.map((s) => s * ratio));
  const events = primePsiEvents(xMax);
  return starts.map((xMin) => {
    const grid = logGrid(xMin, xMin * ratio, sampleCount);
    const samples = sampleStepEvents(events, grid, { mainTerm: (x) => x, theta: 0.5, center: true });
    const spectrum = spectrumFromSamples(samples, grid, { maxFreq, oversample, center: true });
    return { xMin, xMax: xMin * ratio, resolution: spectrum.resolution, topPeaks: spectrum.peaks.slice(0, top) };
  });
}

export function amplitudeCheck(peaks, zeros, count = 20) {
  const rows = [];
  for (const peak of peaks.slice(0, count)) {
    const match = nearestMatch(peak.freq, zeros, Infinity);
    const gamma = match.value;
    const expected = 2 / Math.hypot(0.5, gamma);
    rows.push({
      freq: peak.freq,
      amplitude: peak.amplitude,
      zeroIndex: match.index,
      gamma,
      expected,
      ratio: peak.amplitude / expected,
      error: Math.abs(peak.freq - gamma),
    });
  }
  return rows;
}

export function analyseFamily(options) {
  const {
    name,
    events,
    shapeFn,
    xMin = 1e4,
    xMax = 1e8,
    rangeMaxes = [2.5e7, 5e7, 1e8],
    sampleCount = 8192,
    thetaSampleCount = 2048,
    maxFreq = 120,
    oversample = 12,
    top = 25,
  } = options;
  const theta = estimateTheta(events, { xMin, rangeMaxes, sampleCount: thetaSampleCount, shapeFn });
  const spectra = [];
  for (const end of rangeMaxes) {
    const grid = logGrid(xMin, end, sampleCount);
    const c = fitScale(events, grid, shapeFn);
    const samples = sampleStepEvents(events, grid, { mainTerm: (x) => c * shapeFn(x), theta: theta.theta, center: true });
    const spectrum = spectrumFromSamples(samples, grid, { maxFreq, oversample, center: true });
    spectra.push({
      xMin,
      xMax: end,
      c,
      resolution: spectrum.resolution,
      topPeaks: spectrum.peaks.slice(0, top),
      spectrum,
    });
  }
  return { name, eventCount: events.x.length, theta, spectra };
}

export function analyseCramerFamily(options) {
  const {
    family,
    eventFactory,
    shapeFn,
    xMin = 1e4,
    xMax = 1e8,
    seeds = DEFAULT_SEEDS,
    sampleCount = 4096,
    maxFreq = 120,
    oversample = 8,
    top = 25,
  } = options;
  const grid = logGrid(xMin, xMax, sampleCount);
  const avg = new Float64Array(sampleCount);
  const runs = [];
  for (const seed of seeds) {
    const events = eventFactory(xMax, seed);
    const theta = estimateTheta(events, {
      xMin,
      rangeMaxes: [xMax / 4, xMax / 2, xMax],
      sampleCount: Math.min(2048, sampleCount),
      shapeFn,
    });
    const c = fitScale(events, grid, shapeFn);
    const samples = sampleStepEvents(events, grid, { mainTerm: (x) => c * shapeFn(x), theta: theta.theta, center: true });
    for (let i = 0; i < sampleCount; i++) avg[i] += samples[i] / seeds.length;
    const spectrum = spectrumFromSamples(samples, grid, { maxFreq, oversample, center: true });
    runs.push({ seed, eventCount: events.x.length, theta, c, topPeaks: spectrum.peaks.slice(0, top), spectrum });
  }
  const avgSpectrum = spectrumFromSamples(avg, grid, { maxFreq, oversample, center: true });
  const clusters = clusterStablePeaks(runs.map((r) => r.topPeaks), avgSpectrum.resolution);
  return { family, seeds, xMin, xMax, runs, avgSpectrum, clusters };
}

export function summarizePeaks(peaks, zeros, resolution, maxFreq = 120) {
  return peaks.map((p, i) => {
    const cls = classifyPeak(p.freq, zeros, resolution, maxFreq);
    return {
      rank: i + 1,
      freq: p.freq,
      amplitude: p.amplitude,
      classification: cls.kind,
      label: cls.label,
      error: cls.error,
    };
  });
}

export function table(rows, columns) {
  const widths = columns.map((c) => Math.max(
    c.header.length,
    ...rows.map((r) => String(c.value(r)).length),
  ));
  const line = (cells) => `| ${cells.map((v, i) => String(v).padEnd(widths[i])).join(" | ")} |`;
  return [
    line(columns.map((c) => c.header)),
    line(widths.map((w) => "-".repeat(w))),
    ...rows.map((r) => line(columns.map((c) => c.value(r)))),
  ].join("\n");
}

export function writeSpectrumSvg(file, title, bins, peaks = [], options = {}) {
  const { width = 1100, height = 520, maxFreq = 120, highlight = [] } = options;
  const margin = { left: 62, right: 22, top: 42, bottom: 52 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const filtered = bins.filter((b) => b.freq <= maxFreq);
  const maxAmp = Math.max(...filtered.map((b) => b.amplitude), 1e-9);
  const sx = (f) => margin.left + (f / maxFreq) * plotW;
  const sy = (a) => margin.top + plotH - (a / maxAmp) * plotH;
  const points = filtered.map((b) => `${sx(b.freq).toFixed(2)},${sy(b.amplitude).toFixed(2)}`).join(" ");
  const peakMarks = peaks.slice(0, 30).map((p) => {
    const x = sx(p.freq);
    return `<line x1="${x.toFixed(2)}" y1="${sy(p.amplitude).toFixed(2)}" x2="${x.toFixed(2)}" y2="${margin.top + plotH}" stroke="#b45309" stroke-width="1" opacity="0.55"/>`;
  }).join("\n");
  const highlights = highlight.map((h) => {
    const x = sx(h.freq);
    return `<line x1="${x.toFixed(2)}" y1="${margin.top}" x2="${x.toFixed(2)}" y2="${margin.top + plotH}" stroke="#2563eb" stroke-width="1" opacity="0.28"><title>${h.label}</title></line>`;
  }).join("\n");
  const xTicks = [];
  for (let f = 0; f <= maxFreq; f += 10) {
    xTicks.push(`<line x1="${sx(f)}" y1="${margin.top + plotH}" x2="${sx(f)}" y2="${margin.top + plotH + 5}" stroke="#475569"/>`);
    xTicks.push(`<text x="${sx(f)}" y="${height - 18}" font-size="12" text-anchor="middle" fill="#334155">${f}</text>`);
  }
  const yTicks = [];
  for (let k = 0; k <= 4; k++) {
    const a = (maxAmp * k) / 4;
    yTicks.push(`<line x1="${margin.left - 5}" y1="${sy(a)}" x2="${margin.left}" y2="${sy(a)}" stroke="#475569"/>`);
    yTicks.push(`<text x="${margin.left - 10}" y="${sy(a) + 4}" font-size="12" text-anchor="end" fill="#334155">${a.toFixed(3)}</text>`);
  }
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <text x="${margin.left}" y="25" font-size="20" font-family="system-ui, -apple-system, sans-serif" font-weight="700" fill="#0f172a">${escapeXml(title)}</text>
  <rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#ffffff" stroke="#cbd5e1"/>
  ${xTicks.join("\n  ")}
  ${yTicks.join("\n  ")}
  ${highlights}
  <polyline fill="none" stroke="#0f766e" stroke-width="1.4" points="${points}"/>
  ${peakMarks}
  <text x="${margin.left + plotW / 2}" y="${height - 4}" font-size="13" text-anchor="middle" fill="#334155">log-frequency gamma</text>
  <text x="15" y="${margin.top + plotH / 2}" font-size="13" text-anchor="middle" fill="#334155" transform="rotate(-90 15 ${margin.top + plotH / 2})">Hann DFT amplitude</text>
</svg>
`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, svg);
}

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function parseArgs(argv) {
  const args = { _: [] };
  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      args._.push(arg);
      continue;
    }
    const eq = arg.indexOf("=");
    if (eq === -1) {
      args[arg.slice(2)] = true;
    } else {
      args[arg.slice(2, eq)] = arg.slice(eq + 1);
    }
  }
  return args;
}

function numArg(args, name, fallback) {
  return args[name] === undefined ? fallback : Number(args[name]);
}

function seedsArg(args, fallback = DEFAULT_SEEDS) {
  if (!args.seeds) return fallback;
  const seeds = String(args.seeds)
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  if (!seeds.length) throw new Error("--seeds must contain at least one numeric seed");
  return seeds;
}

async function loadZeros() {
  const mod = await import("../src/core/zeros.js");
  return mod.ZEROS;
}

function compactPeakRows(rows, n = 20) {
  return rows.slice(0, n).map((r) => ({
    rank: r.rank ?? undefined,
    freq: +r.freq.toFixed(6),
    amplitude: +r.amplitude.toFixed(6),
    classification: r.classification,
    label: r.label,
    error: r.error == null ? null : +r.error.toFixed(6),
  }));
}

async function runPhaseA(args) {
  const zeros = await loadZeros();
  const xMax = numArg(args, "xMax", 1e8);
  const sampleCount = numArg(args, "samples", xMax >= 1e8 ? 8192 : 4096);
  const maxFreq = numArg(args, "maxFreq", 120);
  const top = numArg(args, "top", 35);
  const analysis = analysePsiSpectrum({
    xMin: numArg(args, "xMin", 1e4),
    xMax,
    sampleCount,
    maxFreq,
    oversample: numArg(args, "oversample", 12),
  });
  const matches = matchPeaksToTargets(analysis.spectrum.peaks, zeros, analysis.spectrum.resolution, top);
  const amp = amplitudeCheck(analysis.spectrum.peaks, zeros, Math.min(20, top));
  const summary = {
    xMin: analysis.xMin,
    xMax: analysis.xMax,
    sampleCount,
    eventCount: analysis.eventCount,
    resolution: analysis.spectrum.resolution,
    matched: matches.matched,
    missed: matches.missed,
    spurious: matches.spurious,
    peaks: matches.rows.slice(0, top).map((r, i) => ({
      rank: i + 1,
      freq: r.freq,
      amplitude: r.amplitude,
      zeroIndex: r.matchIndex == null ? null : r.matchIndex + 1,
      gamma: r.matchValue,
      error: r.error,
    })),
    amplitudeCheck: amp,
  };
  maybeWriteArtifacts(args, "phase-a", analysis.spectrum, zeros, summary);
  return summary;
}

async function runControls(args) {
  const zeros = await loadZeros();
  const cramer = analyseCramerPsi({
    xMin: numArg(args, "xMin", 1e4),
    xMax: numArg(args, "xMax", 1e7),
    sampleCount: numArg(args, "samples", 4096),
    maxFreq: numArg(args, "maxFreq", 120),
    oversample: numArg(args, "oversample", 8),
    seeds: seedsArg(args),
    top: numArg(args, "top", 20),
  });
  const shifts = analyseWindowShifts({
    sampleCount: numArg(args, "shiftSamples", 4096),
    maxFreq: numArg(args, "shiftMaxFreq", 90),
    oversample: numArg(args, "shiftOversample", 8),
  });
  const avgPeaks = summarizePeaks(cramer.avgSpectrum.peaks.slice(0, 20), zeros, cramer.avgSpectrum.resolution);
  const summary = {
    cramer: {
      xMin: cramer.xMin,
      xMax: cramer.xMax,
      seeds: cramer.seeds,
      resolution: cramer.avgSpectrum.resolution,
      stableAllSeeds: cramer.clusters.filter((c) => c.support === cramer.seeds.length),
      stableAtLeast3: cramer.clusters.filter((c) => c.support >= 3).slice(0, 10),
      avgTopPeaks: compactPeakRows(avgPeaks),
      perSeedTopPeaks: cramer.runs.map((r) => ({
        seed: r.seed,
        topPeaks: r.topPeaks.slice(0, 5).map((p) => ({ freq: +p.freq.toFixed(6), amplitude: +p.amplitude.toFixed(6) })),
      })),
    },
    shifts: shifts.map((s) => ({
      xMin: s.xMin,
      xMax: s.xMax,
      resolution: s.resolution,
      topPeaks: s.topPeaks.slice(0, 10).map((p) => {
        const z = nearestMatch(p.freq, zeros, s.resolution);
        return {
          freq: +p.freq.toFixed(6),
          amplitude: +p.amplitude.toFixed(6),
          zeroIndex: z ? z.index + 1 : null,
          error: z ? +z.error.toFixed(6) : null,
        };
      }),
    })),
  };
  maybeWriteArtifacts(args, "cramer-avg", cramer.avgSpectrum, zeros, summary);
  return summary;
}

async function runHunt(args) {
  const zeros = await loadZeros();
  const xMin = numArg(args, "xMin", 1e4);
  const xMax = numArg(args, "xMax", 1e8);
  const sampleCount = numArg(args, "samples", 8192);
  const maxFreq = numArg(args, "maxFreq", 120);
  const oversample = numArg(args, "oversample", 12);
  const rangeMaxes = [
    numArg(args, "range1", xMax / 4),
    numArg(args, "range2", xMax / 2),
    xMax,
  ];

  const twin = analyseFamily({
    name: "twin-prime weighted count",
    events: twinPrimeEvents(xMax),
    shapeFn: shapeTwin,
    xMin,
    xMax,
    rangeMaxes,
    sampleCount,
    maxFreq,
    oversample,
  });
  const n2 = analyseFamily({
    name: "n^2+1 prime weighted count",
    events: n2Plus1PrimeEvents(xMax),
    shapeFn: shapeN2Plus1,
    xMin,
    xMax,
    rangeMaxes,
    sampleCount,
    maxFreq,
    oversample,
  });
  const cramerTwin = analyseCramerFamily({
    family: "cramer twin",
    eventFactory: cramerTwinEvents,
    shapeFn: shapeTwin,
    xMin,
    xMax,
    sampleCount: numArg(args, "cramerSamples", 4096),
    maxFreq,
    oversample: numArg(args, "cramerOversample", 8),
    seeds: seedsArg(args),
  });
  const cramerN2 = analyseCramerFamily({
    family: "cramer n^2+1",
    eventFactory: cramerN2Plus1Events,
    shapeFn: shapeN2Plus1,
    xMin,
    xMax,
    sampleCount: numArg(args, "cramerSamples", 4096),
    maxFreq,
    oversample: numArg(args, "cramerOversample", 8),
    seeds: seedsArg(args),
  });

  const summarizeFamily = (family) => ({
    name: family.name,
    eventCount: family.eventCount,
    theta: family.theta,
    ranges: family.spectra.map((s) => ({
      xMin: s.xMin,
      xMax: s.xMax,
      c: s.c,
      resolution: s.resolution,
      topPeaks: compactPeakRows(summarizePeaks(s.topPeaks, zeros, s.resolution, maxFreq), 15),
    })),
  });
  const summarizeCramer = (run) => ({
    family: run.family,
    seeds: run.seeds,
    stableAllSeeds: run.clusters.filter((c) => c.support === run.seeds.length),
    stableAtLeast3: run.clusters.filter((c) => c.support >= 3).slice(0, 10),
    avgTopPeaks: compactPeakRows(summarizePeaks(run.avgSpectrum.peaks.slice(0, 20), zeros, run.avgSpectrum.resolution, maxFreq), 15),
    runs: run.runs.map((r) => ({
      seed: r.seed,
      eventCount: r.eventCount,
      theta: r.theta.theta,
      c: r.c,
      topPeaks: r.topPeaks.slice(0, 5).map((p) => ({ freq: +p.freq.toFixed(6), amplitude: +p.amplitude.toFixed(6) })),
    })),
  });
  const summary = {
    xMin,
    xMax,
    rangeMaxes,
    twin: summarizeFamily(twin),
    n2Plus1: summarizeFamily(n2),
    cramerTwin: summarizeCramer(cramerTwin),
    cramerN2Plus1: summarizeCramer(cramerN2),
  };
  maybeWriteArtifacts(args, "twin-full", twin.spectra[twin.spectra.length - 1].spectrum, zeros, summary);
  maybeWriteArtifacts(args, "n2plus1-full", n2.spectra[n2.spectra.length - 1].spectrum, zeros, summary);
  maybeWriteArtifacts(args, "cramer-twin-avg", cramerTwin.avgSpectrum, zeros, summary);
  maybeWriteArtifacts(args, "cramer-n2plus1-avg", cramerN2.avgSpectrum, zeros, summary);
  return summary;
}

function maybeWriteArtifacts(args, name, spectrum, zeros, summary) {
  const outDir = args.outDir;
  if (!outDir) return;
  fs.mkdirSync(outDir, { recursive: true });
  const prefix = path.join(outDir, name);
  fs.writeFileSync(`${prefix}.json`, JSON.stringify(summary, null, 2));
  const zeroHighlights = zeros
    .filter((z) => z <= Math.min(120, spectrum.bins.at(-1)?.freq ?? 120))
    .slice(0, 35)
    .map((freq, i) => ({ freq, label: `zero ${i + 1}` }));
  writeSpectrumSvg(`${prefix}.svg`, name, spectrum.bins, spectrum.peaks, {
    maxFreq: Math.min(120, spectrum.bins.at(-1)?.freq ?? 120),
    highlight: zeroHighlights,
  });
}

async function runAll(args) {
  const phaseA10m = await runPhaseA({ ...args, xMax: args.phaseA10mXMax || "10000000", samples: args.phaseA10mSamples || "4096", top: args.top || "35" });
  const phaseA = await runPhaseA(args);
  const controls = await runControls(args);
  const hunt = await runHunt(args);
  return { phaseA10m, phaseA, controls, hunt };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || "all";
  let result;
  if (cmd === "phase-a") result = await runPhaseA(args);
  else if (cmd === "controls") result = await runControls(args);
  else if (cmd === "hunt") result = await runHunt(args);
  else if (cmd === "all") result = await runAll(args);
  else throw new Error(`unknown command "${cmd}"`);
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === thisFile) {
  main().catch((err) => {
    console.error(err.stack || err.message);
    process.exitCode = 1;
  });
}
