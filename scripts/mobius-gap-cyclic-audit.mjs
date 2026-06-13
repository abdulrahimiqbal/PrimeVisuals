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

function corrFromMoments(n, sx, sy, sxx, syy, sxy) {
  if (n < 4) return { n, r: 0, z: 0 };
  const mx = sx / n, my = sy / n;
  const vx = sxx - n * mx * mx;
  const vy = syy - n * my * my;
  const cov = sxy - n * mx * my;
  if (vx <= 0 || vy <= 0) return { n, r: 0, z: 0 };
  const r = cov / Math.sqrt(vx * vy);
  return { n, r, z: r * Math.sqrt(n) };
}

function shiftSpecs(q) {
  const base = [
    { suffix: "plus_1", shift: 1, sign: 1, leakDirection: "plus" },
    { suffix: "plus_t", shift: q, sign: 1, leakDirection: "plus" },
    { suffix: "plus_t_plus_1", shift: q + 1, sign: 1, leakDirection: "plus" },
  ];
  if (q === 2) return base;
  return [
    ...base,
    { suffix: "minus_1", shift: 1, sign: -1, leakDirection: "minus" },
    { suffix: "minus_t", shift: q, sign: -1, leakDirection: "minus" },
    { suffix: "minus_t_plus_1", shift: q + 1, sign: -1, leakDirection: "minus" },
  ];
}

function specFromId(id, q) {
  if (!id.startsWith("mu_")) throw new Error(`cyclic audit only supports Mobius rows, got ${id}`);
  const suffix = id.slice(3);
  const shift = shiftSpecs(q).find((entry) => entry.suffix === suffix);
  if (!shift) throw new Error(`unknown shift suffix ${suffix} for F_${q}[t]`);
  return { id, ...shift };
}

function polyShift(poly, spec, q) {
  return spec.sign === 1 ? polyAdd(poly, spec.shift, q) : polySub(poly, spec.shift, q);
}

function includeAfterLeakScrub(spec, prevGap, nextGap) {
  if (spec.leakDirection === "plus") return nextGap > spec.shift;
  if (spec.leakDirection === "minus") return prevGap > spec.shift;
  return true;
}

function featureGapVectors(values, spec, universe) {
  const gaps = new Int32Array(values.length - 1);
  for (let i = 0; i + 1 < values.length; i++) gaps[i] = values[i + 1] - values[i];
  let eligible = 0;
  for (let i = 0; i < gaps.length; i++) {
    const prevGap = i > 0 ? gaps[i - 1] : Infinity;
    if (includeAfterLeakScrub(spec, prevGap, gaps[i])) eligible++;
  }

  const x = new Int8Array(eligible);
  const y = new Float64Array(eligible);
  let j = 0;
  for (let i = 0; i < gaps.length; i++) {
    const prevGap = i > 0 ? gaps[i - 1] : Infinity;
    const nextGap = gaps[i];
    if (!includeAfterLeakScrub(spec, prevGap, nextGap)) continue;
    x[j] = polynomialMobius(polyShift(values[i], spec, universe.q), universe);
    y[j] = nextGap;
    j++;
  }
  return { x, y };
}

function moments(x, y) {
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < x.length; i++) {
    const xi = x[i];
    const yi = y[i];
    sx += xi;
    sy += yi;
    sxx += xi * xi;
    syy += yi * yi;
    sxy += xi * yi;
  }
  return { n: x.length, sx, sy, sxx, syy, sxy };
}

function shiftedCorrelation(base, x, y, offset) {
  let sxy = 0;
  const n = x.length;
  for (let i = 0; i < n; i++) sxy += x[(i + offset) % n] * y[i];
  return corrFromMoments(n, base.sx, base.sy, base.sxx, base.syy, sxy);
}

function seededOffsets(n) {
  if (n <= 1) return seeds.map(() => 0);
  return seeds.map((seed) => 1 + Math.floor(rng(seed)() * (n - 1)));
}

function classifyRows(blocks) {
  const rows = [];
  for (const id of Object.keys(blocks.at(-1).real)) {
    const realZ = blocks.map((block) => block.real[id].z);
    const realN = blocks.map((block) => block.real[id].n);
    const nullAbs = blocks.map((block) => block.cyclic[id].meanAbs);
    const signs = realZ.map((z) => Math.sign(z));
    const stableSign = signs.every((s) => s !== 0 && s === signs[0]);
    const abs = realZ.map((z) => Math.abs(z));
    const sharpens = abs[2] > abs[1] && abs[1] > abs[0];
    const largestPass = abs[2] > Math.max(6, 2 * nullAbs[2]);
    rows.push({
      id,
      realZ,
      realN,
      cyclicMeanAbs: nullAbs,
      stableSign,
      sharpens,
      largestPass,
      pass: stableSign && sharpens && largestPass,
      largestRatio: abs[2] / Math.max(1e-12, nullAbs[2]),
    });
  }
  rows.sort((a, b) => {
    if (Number(b.pass) !== Number(a.pass)) return Number(b.pass) - Number(a.pass);
    return b.largestRatio - a.largestRatio;
  });
  return rows;
}

function renderMarkdown(summary) {
  const lines = ["# Mobius/Gap Cyclic Alignment Audit", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push("Rule: keep scrubbed real rows, then compare the real feature-gap alignment to five seeded cyclic shifts of the same feature vector inside each degree block.");
  lines.push("");
  for (const group of summary.groups) {
    lines.push(`## ${group.label}`);
    lines.push("");
    lines.push("| rank | statistic | real z values | cyclic meanAbs values | largest ratio | verdict |");
    lines.push("| ---: | --- | ---: | ---: | ---: | --- |");
    for (const [index, row] of group.classified.entries()) {
      lines.push(`| ${index + 1} | ${row.id} | ${row.realZ.map((z) => z.toFixed(3)).join(", ")} | ${row.cyclicMeanAbs.map((z) => z.toFixed(3)).join(", ")} | ${row.largestRatio.toFixed(3)} | ${row.pass ? "survives" : "fails"} |`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

const leakageFile = path.join(outDir, "mobius-gap-leakage.json");
if (!fs.existsSync(leakageFile)) throw new Error(`missing leakage artifact: ${leakageFile}`);

const leakage = JSON.parse(fs.readFileSync(leakageFile, "utf8"));
const groups = [];

for (const leakageGroup of leakage.groups) {
  const survivorIds = leakageGroup.polynomial.classified.filter((row) => row.pass).map((row) => row.id);
  if (!survivorIds.length) {
    groups.push({ label: leakageGroup.label, q: leakageGroup.q, blocks: [], classified: [] });
    continue;
  }

  console.error(`[mobius-gap-cyclic] F_${leakageGroup.q}[t] universe to degree ${Math.max(...leakageGroup.polynomial.blocks.map((block) => block.degree))}`);
  const universe = buildPolynomialUniverse(leakageGroup.q, Math.max(...leakageGroup.polynomial.blocks.map((block) => block.degree)));
  const specs = survivorIds.map((id) => specFromId(id, leakageGroup.q));
  const blocks = [];

  for (const block of leakageGroup.polynomial.blocks) {
    console.error(`[mobius-gap-cyclic] ${leakageGroup.label} degree ${block.degree}`);
    const values = universe.irreduciblesByDegree[block.degree];
    const real = {};
    const cyclic = {};
    for (const spec of specs) {
      const { x, y } = featureGapVectors(values, spec, universe);
      const base = moments(x, y);
      real[spec.id] = corrFromMoments(base.n, base.sx, base.sy, base.sxx, base.syy, base.sxy);
      const shiftZ = [];
      for (const offset of seededOffsets(x.length)) shiftZ.push(shiftedCorrelation(base, x, y, offset).z);
      cyclic[spec.id] = summarize(shiftZ);
    }
    blocks.push({ degree: block.degree, real, cyclic });
  }

  groups.push({
    label: leakageGroup.label,
    q: leakageGroup.q,
    survivorIds,
    blocks,
    classified: classifyRows(blocks),
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: {
    seeds,
    source: leakageFile,
    null: "seeded cyclic shifts of the scrubbed feature vector inside each homogeneous degree block",
  },
  groups,
};

const jsonFile = path.join(outDir, "mobius-gap-cyclic.json");
const mdFile = path.join(outDir, "mobius-gap-cyclic.md");
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, groups: groups.length }, null, 2));
