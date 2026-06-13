#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polynomialMobius,
  polySub,
} from "../src/core/ffield.js";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const q = 3;
const degree = 17;
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

function corrFromSums(stat) {
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

function shiftSpecs() {
  return [
    { suffix: "plus_1", shift: 1, sign: 1, leakDirection: "plus" },
    { suffix: "plus_t", shift: q, sign: 1, leakDirection: "plus" },
    { suffix: "plus_t_plus_1", shift: q + 1, sign: 1, leakDirection: "plus" },
    { suffix: "minus_1", shift: 1, sign: -1, leakDirection: "minus" },
    { suffix: "minus_t", shift: q, sign: -1, leakDirection: "minus" },
    { suffix: "minus_t_plus_1", shift: q + 1, sign: -1, leakDirection: "minus" },
  ];
}

function specFromId(id) {
  if (!id.startsWith("mu_")) throw new Error(`composite control only supports Mobius rows, got ${id}`);
  const suffix = id.slice(3);
  const shift = shiftSpecs().find((entry) => entry.suffix === suffix);
  if (!shift) throw new Error(`unknown shift suffix ${suffix}`);
  return { id, ...shift };
}

function polyShift(poly, spec) {
  return spec.sign === 1 ? polyAdd(poly, spec.shift, q) : polySub(poly, spec.shift, q);
}

function includeAfterLeakScrub(spec, prevGap, nextGap) {
  if (spec.leakDirection === "plus") return nextGap > spec.shift;
  if (spec.leakDirection === "minus") return prevGap > spec.shift;
  return true;
}

function featureCorrelations(values, specs, universe) {
  if (values.length < 3) return Object.fromEntries(specs.map((spec) => [spec.id, { n: 0, r: 0, z: 0 }]));
  const gaps = new Int32Array(values.length - 1);
  for (let i = 0; i + 1 < values.length; i++) gaps[i] = values[i + 1] - values[i];
  const stats = new Map(specs.map((spec) => [spec.id, { n: 0, sx: 0, sy: 0, sxx: 0, syy: 0, sxy: 0 }]));
  for (let i = 0; i < gaps.length; i++) {
    const prevGap = i > 0 ? gaps[i - 1] : Infinity;
    const nextGap = gaps[i];
    for (const spec of specs) {
      if (!includeAfterLeakScrub(spec, prevGap, nextGap)) continue;
      const x = polynomialMobius(polyShift(values[i], spec), universe);
      const y = nextGap;
      const stat = stats.get(spec.id);
      stat.n++;
      stat.sx += x;
      stat.sy += y;
      stat.sxx += x * x;
      stat.syy += y * y;
      stat.sxy += x * y;
    }
  }
  const out = {};
  for (const spec of specs) out[spec.id] = corrFromSums(stats.get(spec.id));
  return out;
}

function sampleCompositeSequence(universe, seed) {
  const flags = universe.irreducibleFlagsByDegree[degree];
  const random = rng(seed);
  const compositeCount = flags.length - universe.counts[degree];
  const p = universe.counts[degree] / compositeCount;
  const out = [];
  const lead = universe.pow[degree];
  for (let lower = 0; lower < flags.length; lower++) {
    if (flags[lower]) continue;
    if (random() < p) out.push(lead + lower);
  }
  return out;
}

function renderMarkdown(summary) {
  const lines = ["# Mobius/Gap Composite-Only Control", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push("| statistic | real holdout z | composite meanAbs | real/composite ratio | verdict |");
  lines.push("| --- | ---: | ---: | ---: | --- |");
  for (const row of summary.rows) {
    lines.push(`| ${row.id} | ${row.realZ.toFixed(3)} | ${row.composite.meanAbs.toFixed(3)} | ${row.ratio.toFixed(3)} | ${row.pass ? "survives" : "fails"} |`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

const holdoutFile = path.join(outDir, "mobius-gap-holdout-q3-d17.json");
if (!fs.existsSync(holdoutFile)) throw new Error(`missing holdout artifact: ${holdoutFile}`);

const holdout = JSON.parse(fs.readFileSync(holdoutFile, "utf8"));
const survivors = holdout.rows.filter((row) => row.pass);
if (!survivors.length) throw new Error("no holdout survivors to composite-control");
const specs = survivors.map((row) => specFromId(row.id));

console.error(`[mobius-gap-composite] F_3[t] universe to degree ${degree}`);
const universe = buildPolynomialUniverse(q, degree);
const statsByFeature = new Map(specs.map((spec) => [spec.id, []]));

for (const seed of seeds) {
  console.error(`[mobius-gap-composite] seed ${seed}`);
  const values = sampleCompositeSequence(universe, seed);
  const stats = featureCorrelations(values, specs, universe);
  for (const spec of specs) statsByFeature.get(spec.id).push(stats[spec.id].z);
}

const rows = survivors.map((survivor) => {
  const composite = summarize(statsByFeature.get(survivor.id));
  const threshold = Math.max(6, 2 * composite.meanAbs);
  return {
    id: survivor.id,
    realZ: survivor.real.z,
    composite,
    ratio: Math.abs(survivor.real.z) / Math.max(1e-12, composite.meanAbs),
    pass: Math.abs(survivor.real.z) > threshold,
  };
});
rows.sort((a, b) => {
  if (Number(b.pass) !== Number(a.pass)) return Number(b.pass) - Number(a.pass);
  return b.ratio - a.ratio;
});

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: {
    q,
    degree,
    seeds,
    source: holdoutFile,
    compositeSampling: "reducible monic polynomials only, sampled at irreducible density",
  },
  rows,
};

const jsonFile = path.join(outDir, "mobius-gap-composite-control-q3.json");
const mdFile = path.join(outDir, "mobius-gap-composite-control-q3.md");
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, rows: rows.length }, null, 2));
