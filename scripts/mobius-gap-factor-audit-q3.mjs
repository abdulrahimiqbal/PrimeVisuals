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
const degrees = [14, 15, 16, 17];
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

function corr(x, y) {
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
  return corrFromMoments(x.length, sx, sy, sxx, syy, sxy);
}

function partialCorr(x, y, z) {
  const n = x.length;
  if (n < 4) return { n, r: 0, z: 0 };
  let sx = 0, sy = 0, sz = 0, sxx = 0, syy = 0, szz = 0, sxy = 0, sxz = 0, syz = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i];
    const yi = y[i];
    const zi = z[i];
    sx += xi;
    sy += yi;
    sz += zi;
    sxx += xi * xi;
    syy += yi * yi;
    szz += zi * zi;
    sxy += xi * yi;
    sxz += xi * zi;
    syz += yi * zi;
  }
  const rxy = corrFromMoments(n, sx, sy, sxx, syy, sxy).r;
  const rxz = corrFromMoments(n, sx, sz, sxx, szz, sxz).r;
  const ryz = corrFromMoments(n, sy, sz, syy, szz, syz).r;
  const denom = Math.sqrt(Math.max(0, (1 - rxz * rxz) * (1 - ryz * ryz)));
  if (!denom) return { n, r: 0, z: 0 };
  const r = (rxy - rxz * ryz) / denom;
  return { n, r, z: r * Math.sqrt(n) };
}

function shiftedCorr(x, y, offset) {
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  const n = x.length;
  for (let i = 0; i < n; i++) {
    const xi = x[(i + offset) % n];
    const yi = y[i];
    sx += xi;
    sy += yi;
    sxx += xi * xi;
    syy += yi * yi;
    sxy += xi * yi;
  }
  return corrFromMoments(n, sx, sy, sxx, syy, sxy);
}

function shiftedPartialCorr(x, y, z, offset) {
  const n = x.length;
  if (n < 4) return { n, r: 0, z: 0 };
  let sx = 0, sy = 0, sz = 0, sxx = 0, syy = 0, szz = 0, sxy = 0, sxz = 0, syz = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[(i + offset) % n];
    const yi = y[i];
    const zi = z[i];
    sx += xi;
    sy += yi;
    sz += zi;
    sxx += xi * xi;
    syy += yi * yi;
    szz += zi * zi;
    sxy += xi * yi;
    sxz += xi * zi;
    syz += yi * zi;
  }
  const rxy = corrFromMoments(n, sx, sy, sxx, syy, sxy).r;
  const rxz = corrFromMoments(n, sx, sz, sxx, szz, sxz).r;
  const ryz = corrFromMoments(n, sy, sz, syy, szz, syz).r;
  const denom = Math.sqrt(Math.max(0, (1 - rxz * rxz) * (1 - ryz * ryz)));
  if (!denom) return { n, r: 0, z: 0 };
  const r = (rxy - rxz * ryz) / denom;
  return { n, r, z: r * Math.sqrt(n) };
}

function seededOffsets(n) {
  if (n <= 1) return seeds.map(() => 0);
  return seeds.map((seed) => 1 + Math.floor(rng(seed)() * (n - 1)));
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
  if (!id.startsWith("mu_")) throw new Error(`factor audit only supports Mobius rows, got ${id}`);
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

function collectRows(values, spec, universe) {
  const gaps = new Int32Array(values.length - 1);
  for (let i = 0; i + 1 < values.length; i++) gaps[i] = values[i + 1] - values[i];

  let eligible = 0;
  let squarefree = 0;
  const byMu = {
    "-1": { n: 0, sumGap: 0 },
    "0": { n: 0, sumGap: 0 },
    "1": { n: 0, sumGap: 0 },
  };
  for (let i = 0; i < gaps.length; i++) {
    const prevGap = i > 0 ? gaps[i - 1] : Infinity;
    const nextGap = gaps[i];
    if (!includeAfterLeakScrub(spec, prevGap, nextGap)) continue;
    const mu = polynomialMobius(polyShift(values[i], spec), universe);
    eligible++;
    if (Math.abs(mu) === 1) squarefree++;
    byMu[String(mu)].n++;
    byMu[String(mu)].sumGap += nextGap;
  }

  const x = new Int8Array(eligible);
  const y = new Float64Array(eligible);
  const prev = new Float64Array(eligible);
  const xs = new Int8Array(squarefree);
  const ys = new Float64Array(squarefree);
  let j = 0, k = 0;
  for (let i = 0; i < gaps.length; i++) {
    const prevGap = i > 0 ? gaps[i - 1] : Infinity;
    const nextGap = gaps[i];
    if (!includeAfterLeakScrub(spec, prevGap, nextGap)) continue;
    const mu = polynomialMobius(polyShift(values[i], spec), universe);
    x[j] = mu;
    y[j] = nextGap;
    prev[j] = Number.isFinite(prevGap) ? prevGap : nextGap;
    if (Math.abs(mu) === 1) {
      xs[k] = mu;
      ys[k] = nextGap;
      k++;
    }
    j++;
  }

  return {
    x,
    y,
    prev,
    squarefreeX: xs,
    squarefreeY: ys,
    byMu: Object.fromEntries(Object.entries(byMu).map(([mu, row]) => [
      mu,
      { n: row.n, meanGap: row.n ? row.sumGap / row.n : 0 },
    ])),
  };
}

function cyclicSummary(x, y) {
  return summarize(seededOffsets(x.length).map((offset) => shiftedCorr(x, y, offset).z));
}

function cyclicPartialSummary(x, y, z) {
  return summarize(seededOffsets(x.length).map((offset) => shiftedPartialCorr(x, y, z, offset).z));
}

function classifySeries(zValues, nullValues) {
  const signs = zValues.map((z) => Math.sign(z));
  const stableSign = signs.every((sign) => sign !== 0 && sign === signs[0]);
  const abs = zValues.map((z) => Math.abs(z));
  const sharpens = abs.every((value, index) => index === 0 || value > abs[index - 1]);
  const largestPass = abs.at(-1) > Math.max(6, 2 * nullValues.at(-1));
  return {
    stableSign,
    sharpens,
    largestPass,
    pass: stableSign && sharpens && largestPass,
    largestRatio: abs.at(-1) / Math.max(1e-12, nullValues.at(-1)),
  };
}

function renderMarkdown(summary) {
  const lines = ["# Mobius/Gap Factor and Mediation Audit", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push("## Squarefree-only parity");
  lines.push("");
  lines.push("| statistic | z values | cyclic meanAbs values | largest ratio | verdict |");
  lines.push("| --- | ---: | ---: | ---: | --- |");
  for (const row of summary.rows) {
    lines.push(`| ${row.id} | ${row.squarefree.zValues.map((z) => z.toFixed(3)).join(", ")} | ${row.squarefree.cyclicMeanAbs.map((z) => z.toFixed(3)).join(", ")} | ${row.squarefree.classification.largestRatio.toFixed(3)} | ${row.squarefree.classification.pass ? "survives" : "fails"} |`);
  }
  lines.push("");
  lines.push("## Previous-gap mediation for negative shifts");
  lines.push("");
  lines.push("| statistic | partial z values | cyclic meanAbs values | largest ratio | verdict |");
  lines.push("| --- | ---: | ---: | ---: | --- |");
  for (const row of summary.rows.filter((entry) => entry.partialPrevious)) {
    lines.push(`| ${row.id} | ${row.partialPrevious.zValues.map((z) => z.toFixed(3)).join(", ")} | ${row.partialPrevious.cyclicMeanAbs.map((z) => z.toFixed(3)).join(", ")} | ${row.partialPrevious.classification.largestRatio.toFixed(3)} | ${row.partialPrevious.classification.pass ? "survives" : "fails"} |`);
  }
  lines.push("");
  lines.push("## Degree-17 conditional means by Mobius value");
  lines.push("");
  lines.push("| statistic | mu=-1 n/meanGap | mu=0 n/meanGap | mu=1 n/meanGap |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const row of summary.rows) {
    const d17 = row.blocks.find((block) => block.degree === 17);
    const fmt = (entry) => `${entry.n}/${entry.meanGap.toFixed(3)}`;
    lines.push(`| ${row.id} | ${fmt(d17.byMu["-1"])} | ${fmt(d17.byMu["0"])} | ${fmt(d17.byMu["1"])} |`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

const holdoutFile = path.join(outDir, "mobius-gap-holdout-q3-d17.json");
if (!fs.existsSync(holdoutFile)) throw new Error(`missing holdout artifact: ${holdoutFile}`);

const holdout = JSON.parse(fs.readFileSync(holdoutFile, "utf8"));
const survivorIds = holdout.rows.filter((row) => row.pass).map((row) => row.id);
if (!survivorIds.length) throw new Error("no holdout survivors to factor-audit");

console.error(`[mobius-gap-factor] F_3[t] universe to degree ${Math.max(...degrees)}`);
const universe = buildPolynomialUniverse(q, Math.max(...degrees));
const specs = survivorIds.map(specFromId);
const rows = [];

for (const spec of specs) {
  console.error(`[mobius-gap-factor] ${spec.id}`);
  const blocks = [];
  for (const degree of degrees) {
    const collected = collectRows(universe.irreduciblesByDegree[degree], spec, universe);
    const squarefree = corr(collected.squarefreeX, collected.squarefreeY);
    const squarefreeCyclic = cyclicSummary(collected.squarefreeX, collected.squarefreeY);
    const block = {
      degree,
      all: corr(collected.x, collected.y),
      squarefree,
      squarefreeCyclic,
      byMu: collected.byMu,
    };
    if (spec.leakDirection === "minus") {
      block.partialPrevious = partialCorr(collected.x, collected.y, collected.prev);
      block.partialPreviousCyclic = cyclicPartialSummary(collected.x, collected.y, collected.prev);
    }
    blocks.push(block);
  }

  const squarefreeZ = blocks.map((block) => block.squarefree.z);
  const squarefreeNull = blocks.map((block) => block.squarefreeCyclic.meanAbs);
  const row = {
    id: spec.id,
    blocks,
    squarefree: {
      zValues: squarefreeZ,
      cyclicMeanAbs: squarefreeNull,
      classification: classifySeries(squarefreeZ, squarefreeNull),
    },
  };
  if (spec.leakDirection === "minus") {
    const partialZ = blocks.map((block) => block.partialPrevious.z);
    const partialNull = blocks.map((block) => block.partialPreviousCyclic.meanAbs);
    row.partialPrevious = {
      zValues: partialZ,
      cyclicMeanAbs: partialNull,
      classification: classifySeries(partialZ, partialNull),
    };
  }
  rows.push(row);
}

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: {
    q,
    degrees,
    seeds,
    source: holdoutFile,
  },
  rows,
};

const jsonFile = path.join(outDir, "mobius-gap-factor-audit-q3.json");
const mdFile = path.join(outDir, "mobius-gap-factor-audit-q3.md");
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, rows: rows.length }, null, 2));
