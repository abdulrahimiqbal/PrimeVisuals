#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polySub,
  polynomialMobius,
} from "../src/core/ffield.js";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const mode = process.argv[3] || "initial";
const seeds = [12345, 271828, 314159, 161803, 424242];

const initialFieldRuns = [
  {
    label: "F_5[t]",
    q: 5,
    degrees: [9, 10, 11],
    controlDegree: 11,
    prediction: { kind: "odd", sign: 1, rMin: 0.010, rMax: 0.016 },
    scrubModes: ["previous"],
  },
  {
    label: "F_7[t]",
    q: 7,
    degrees: [7, 8, 9],
    controlDegree: 9,
    prediction: { kind: "odd", sign: 1, rMin: 0.006, rMax: 0.012 },
    scrubModes: ["previous"],
  },
  {
    label: "F_4[t]",
    q: 4,
    degrees: [10, 11, 12],
    controlDegree: 12,
    prediction: { kind: "char2-null", maxAbsR: 0.003 },
    scrubModes: ["previous", "two-sided"],
  },
  {
    label: "F_3[t]",
    q: 3,
    degrees: [18],
    controlDegree: 18,
    prediction: { kind: "odd", sign: 1, rMin: 0.019, rMax: 0.024 },
    scrubModes: ["previous"],
  },
];

const refinedFieldRuns = [
  {
    label: "F_5[t]",
    q: 5,
    degrees: [12],
    controlDegree: 12,
    prediction: { kind: "odd", sign: 1, rMin: 0.005, rMax: 0.009 },
    scrubModes: ["previous"],
  },
  {
    label: "F_7[t]",
    q: 7,
    degrees: [10],
    controlDegree: 10,
    prediction: { kind: "small-nonnegative", rMax: 0.004 },
    scrubModes: ["previous"],
  },
  {
    label: "F_8[t]",
    q: 8,
    degrees: [8],
    controlDegree: 8,
    prediction: { kind: "char2-null", maxAbsR: 0.003 },
    scrubModes: ["two-sided"],
  },
];

const f8HoldoutFieldRuns = [
  {
    label: "F_8[t]",
    q: 8,
    degrees: [9],
    controlDegree: 9,
    prediction: { kind: "odd", sign: 1, rMin: 0.004, rMax: 0.009 },
    scrubModes: ["two-sided"],
  },
];

const f2NullFieldRuns = [
  {
    label: "F_2[t]",
    q: 2,
    degrees: [25],
    controlDegree: 25,
    prediction: { kind: "char2-null", maxAbsR: 0.003 },
    scrubModes: ["two-sided"],
  },
];

const fieldRuns = mode === "refined"
  ? refinedFieldRuns
  : mode === "f8-holdout"
    ? f8HoldoutFieldRuns
    : mode === "f2-null"
      ? f2NullFieldRuns
    : initialFieldRuns;

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

function initMoments() {
  return { n: 0, sx: 0, sy: 0, sxx: 0, syy: 0, sxy: 0 };
}

function addMoment(stat, x, y) {
  stat.n++;
  stat.sx += x;
  stat.sy += y;
  stat.sxx += x * x;
  stat.syy += y * y;
  stat.sxy += x * y;
}

function corrFromMoments(stat) {
  const { n, sx, sy, sxx, syy, sxy } = stat;
  if (n < 4) return { n, r: 0, z: 0 };
  const mx = sx / n, my = sy / n;
  const vx = sxx - n * mx * mx;
  const vy = syy - n * my * my;
  const cov = sxy - n * mx * my;
  if (vx <= 0 || vy <= 0) return { n, r: 0, z: 0 };
  const r = cov / Math.sqrt(vx * vy);
  return { n, r, z: r * Math.sqrt(n) };
}

function summarize(values) {
  if (!values.length) return { n: 0, mean: 0, meanAbs: 0, sd: 0, min: 0, max: 0 };
  const n = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const meanAbs = values.reduce((s, v) => s + Math.abs(v), 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  return {
    n,
    mean,
    meanAbs,
    sd: Math.sqrt(variance),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function includeRow(scrubMode, prevGap, nextGap, shift) {
  if (scrubMode === "previous") return prevGap > shift;
  if (scrubMode === "two-sided") return prevGap > shift && nextGap > shift;
  throw new Error(`unknown scrub mode ${scrubMode}`);
}

function shiftedPoly(poly, shift, universe) {
  return polySub(poly, shift, universe.q);
}

function countEligible(values, shift, scrubMode) {
  let eligible = 0;
  for (let i = 0; i + 1 < values.length; i++) {
    const prevGap = i > 0 ? values[i] - values[i - 1] : Infinity;
    const nextGap = values[i + 1] - values[i];
    if (includeRow(scrubMode, prevGap, nextGap, shift)) eligible++;
  }
  return eligible;
}

function realRows(values, universe, degree, scrubMode, withVectors) {
  const shift = universe.q; // t
  const highShift = universe.pow[degree - 1]; // t^(n-1)
  const eligible = withVectors ? countEligible(values, shift, scrubMode) : 0;
  const x = withVectors ? new Int8Array(eligible) : null;
  const y = withVectors ? new Float64Array(eligible) : null;
  const main = initMoments();
  const high = initMoments();
  let j = 0;
  for (let i = 0; i + 1 < values.length; i++) {
    const prevGap = i > 0 ? values[i] - values[i - 1] : Infinity;
    const nextGap = values[i + 1] - values[i];
    if (!includeRow(scrubMode, prevGap, nextGap, shift)) continue;
    const value = values[i];
    const mu = polynomialMobius(shiftedPoly(value, shift, universe), universe);
    const highMu = polynomialMobius(shiftedPoly(value, highShift, universe), universe);
    addMoment(main, mu, nextGap);
    addMoment(high, highMu, nextGap);
    if (withVectors) {
      x[j] = mu;
      y[j] = nextGap;
      j++;
    }
  }
  return { main: corrFromMoments(main), high: corrFromMoments(high), x, y, mainMoments: main };
}

function shiftedCorrelation(base, x, y, offset) {
  let sxy = 0;
  const n = x.length;
  for (let i = 0; i < n; i++) sxy += x[(i + offset) % n] * y[i];
  return corrFromMoments({ n, sx: base.sx, sy: base.sy, sxx: base.sxx, syy: base.syy, sxy });
}

function cyclicControl(x, y, base) {
  if (!x?.length) return { r: summarize([]), z: summarize([]), rows: [] };
  const rows = [];
  for (const seed of seeds) {
    const offset = x.length <= 1 ? 0 : 1 + Math.floor(rng(seed)() * (x.length - 1));
    rows.push({ seed, offset, ...shiftedCorrelation(base, x, y, offset) });
  }
  return {
    rows,
    r: summarize(rows.map((row) => row.r)),
    z: summarize(rows.map((row) => row.z)),
  };
}

function advanceCompositeState(state, value, universe, shift, scrubMode) {
  if (state.previous !== null) {
    const nextGap = value - state.previous;
    if (includeRow(scrubMode, state.prevGap, nextGap, shift)) {
      const mu = polynomialMobius(shiftedPoly(state.previous, shift, universe), universe);
      addMoment(state.moments, mu, nextGap);
    }
    state.prevGap = nextGap;
  }
  state.previous = value;
  state.selected++;
}

function compositeControls(universe, degree, scrubMode) {
  const shift = universe.q;
  const flags = universe.irreducibleFlagsByDegree[degree];
  const compositeCount = flags.length - universe.counts[degree];
  const p = compositeCount > 0 ? universe.counts[degree] / compositeCount : 0;
  const lead = universe.pow[degree];
  const states = seeds.map((seed) => ({
    seed,
    random: rng(seed),
    moments: initMoments(),
    previous: null,
    prevGap: Infinity,
    selected: 0,
  }));

  for (let lower = 0; lower < flags.length; lower++) {
    if (flags[lower]) continue;
    const value = lead + lower;
    for (const state of states) {
      if (state.random() < p) advanceCompositeState(state, value, universe, shift, scrubMode);
    }
  }

  const rows = states.map((state) => ({
    seed: state.seed,
    selected: state.selected,
    ...corrFromMoments(state.moments),
  }));
  return {
    sampling: "reducible monic polynomials only, Bernoulli sampled at irreducible density",
    p,
    rows,
    r: summarize(rows.map((row) => row.r)),
    z: summarize(rows.map((row) => row.z)),
  };
}

function verdictFor(prediction, real, controls) {
  const maxControlR = Math.max(
    controls.cyclic.r.meanAbs,
    controls.composite.r.meanAbs,
    Math.abs(real.high.r),
  );
  if (prediction.kind === "char2-null") {
    return {
      pass: Math.abs(real.main.r) < prediction.maxAbsR && maxControlR < prediction.maxAbsR,
      maxControlR,
      reason: `null gate |r|<${prediction.maxAbsR}`,
    };
  }
  if (prediction.kind === "small-nonnegative") {
    return {
      pass: real.main.r >= 0 && real.main.r <= prediction.rMax && maxControlR < Math.max(0.002, prediction.rMax),
      maxControlR,
      reason: `small nonnegative gate 0<=r<=${prediction.rMax}`,
    };
  }
  return {
    pass: Math.sign(real.main.r) === prediction.sign
      && real.main.r >= prediction.rMin
      && real.main.r <= prediction.rMax
      && maxControlR < Math.abs(real.main.r) / 2,
    maxControlR,
    reason: `sign ${prediction.sign > 0 ? "+" : "-"} and ${prediction.rMin}<=r<=${prediction.rMax}`,
  };
}

function renderMarkdown(summary) {
  const lines = ["# Mobius-Gap Cross-q Law Audit", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push("Statistic: `Corr(mu(f-t), next_gap(f) | previous_gap(f)>t)` unless the scrub mode is marked `two-sided`.");
  lines.push("Controls at each largest degree: five cyclic shifts, five composite-only samples, and high-coefficient placebo `mu(f-t^(n-1))` on the same rows.");
  lines.push("");
  lines.push("## Prediction Confirmation");
  lines.push("");
  lines.push("| field | scrub | degrees real r | control degree real r | cyclic meanAbs r | composite meanAbs r | high-placebo r | verdict |");
  lines.push("| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const run of summary.runs) {
    for (const mode of run.scrubModes) {
      const result = run.results[mode];
      const degreeR = result.degrees.map((row) => `${row.degree}:${row.main.r.toFixed(6)}`).join(", ");
      lines.push(`| ${run.label} | ${mode} | ${degreeR} | ${result.control.real.main.r.toFixed(6)} | ${result.control.cyclic.r.meanAbs.toFixed(6)} | ${result.control.composite.r.meanAbs.toFixed(6)} | ${result.control.real.high.r.toFixed(6)} | ${result.verdict.pass ? "passes" : "fails"} |`);
    }
  }
  lines.push("");
  lines.push("## Raw Control z-scores");
  lines.push("");
  lines.push("| field | scrub | real z | cyclic meanAbs z | composite meanAbs z | high-placebo z |");
  lines.push("| --- | --- | ---: | ---: | ---: | ---: |");
  for (const run of summary.runs) {
    for (const mode of run.scrubModes) {
      const result = run.results[mode];
      lines.push(`| ${run.label} | ${mode} | ${result.control.real.main.z.toFixed(3)} | ${result.control.cyclic.z.meanAbs.toFixed(3)} | ${result.control.composite.z.meanAbs.toFixed(3)} | ${result.control.real.high.z.toFixed(3)} |`);
    }
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(outDir, { recursive: true });

const runs = [];
for (const config of fieldRuns) {
  console.error(`[mobius-gap-cross-q] building ${config.label} to degree ${Math.max(...config.degrees)}`);
  const universe = buildPolynomialUniverse(config.q, Math.max(...config.degrees));
  const results = {};

  for (const scrubMode of config.scrubModes) {
    console.error(`[mobius-gap-cross-q] ${config.label} scrub=${scrubMode} real degree series`);
    const degrees = [];
    for (const degree of config.degrees) {
      const rows = realRows(universe.irreduciblesByDegree[degree], universe, degree, scrubMode, false);
      degrees.push({ degree, main: rows.main, high: rows.high });
    }

    console.error(`[mobius-gap-cross-q] ${config.label} scrub=${scrubMode} controls at degree ${config.controlDegree}`);
    const real = realRows(universe.irreduciblesByDegree[config.controlDegree], universe, config.controlDegree, scrubMode, true);
    const cyclic = cyclicControl(real.x, real.y, real.mainMoments);
    const composite = compositeControls(universe, config.controlDegree, scrubMode);
    const control = { degree: config.controlDegree, real: { main: real.main, high: real.high }, cyclic, composite };
    const verdict = verdictFor(config.prediction, control.real, { cyclic, composite });
    results[scrubMode] = { degrees, control, verdict };
  }

  runs.push({
    label: config.label,
    q: config.q,
    degrees: config.degrees,
    controlDegree: config.controlDegree,
    prediction: config.prediction,
    scrubModes: config.scrubModes,
    results,
  });
  if (global.gc) global.gc();
}

const summary = {
  generatedAt: new Date().toISOString(),
  preregistration: "logs/2026-06-13-mobius-gap-cross-q.md",
  parameters: { mode, seeds, fieldRuns },
  runs,
};

const suffix = mode === "refined"
  ? "-refined"
  : mode === "f8-holdout"
    ? "-f8-holdout"
    : mode === "f2-null"
      ? "-f2-null"
      : "";
const jsonFile = path.join(outDir, `mobius-gap-cross-q-law${suffix}.json`);
const mdFile = path.join(outDir, `mobius-gap-cross-q-law${suffix}.md`);
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, runs: runs.length }, null, 2));
