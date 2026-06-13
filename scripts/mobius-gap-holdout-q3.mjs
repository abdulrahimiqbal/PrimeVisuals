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
const holdoutDegree = 17;
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

function polyDegreeEncoded(poly, fieldSize) {
  if (poly <= 0) return -1;
  let d = 0, p = 1;
  while (p * fieldSize <= poly) { p *= fieldSize; d++; }
  return d;
}

function factorTerms(poly, fieldSize) {
  const positions = [];
  const coefficients = [];
  let x = poly, pos = 0;
  while (x > 0) {
    const c = x % fieldSize;
    if (c) {
      positions.push(pos);
      coefficients.push(c);
    }
    x = Math.floor(x / fieldSize);
    pos++;
  }
  return { positions, coefficients };
}

function shiftedProductState(terms, shift, targetDegree, pow) {
  const digits = new Int8Array(targetDegree + 1);
  let value = 0;
  for (let i = 0; i < terms.positions.length; i++) {
    const pos = terms.positions[i] + shift;
    const c = terms.coefficients[i];
    digits[pos] = c;
    value += c * pow[pos];
  }
  return { digits, value };
}

function addShiftedFactorQ3(state, terms, shift, pow) {
  for (let i = 0; i < terms.positions.length; i++) {
    const pos = terms.positions[i] + shift;
    const old = state.digits[pos];
    const next = (old + terms.coefficients[i]) % 3;
    if (next === old) continue;
    state.digits[pos] = next;
    state.value += (next - old) * pow[pos];
  }
}

function advanceMultipleProductQ3(state, lower, terms, hDegree, pow) {
  let carry = lower, pos = 0;
  while (pos < hDegree) {
    addShiftedFactorQ3(state, terms, pos, pow);
    if (carry % 3 !== 2) break;
    carry = Math.floor(carry / 3);
    pos++;
  }
}

function markLocalMultiples(flags, factor, universe, targetDegree) {
  const factorDegree = polyDegreeEncoded(factor, universe.q);
  const hDegree = targetDegree - factorDegree;
  if (hDegree < 0) return;
  const terms = factorTerms(factor, universe.q);
  const state = shiftedProductState(terms, hDegree, targetDegree, universe.pow);
  const limit = universe.pow[hDegree];
  for (let hLower = 0; hLower < limit; hLower++) {
    flags[state.value - universe.pow[targetDegree]] = 0;
    if (hLower + 1 < limit) advanceMultipleProductQ3(state, hLower, terms, hDegree, universe.pow);
  }
}

function irreducibleFactorsUpTo(universe, maxFactorDegree) {
  const out = [];
  for (let d = 1; d <= maxFactorDegree; d++) {
    for (const f of universe.irreduciblesByDegree[d]) out.push(f);
  }
  return out;
}

function polyEligibility(universe, degree, wheelDegree) {
  const flags = new Uint8Array(universe.pow[degree]);
  flags.fill(1);
  for (const factor of irreducibleFactorsUpTo(universe, wheelDegree)) markLocalMultiples(flags, factor, universe, degree);
  return flags;
}

function samplePolynomialWheel(universe, degree, wheelDegree, seed) {
  const random = rng(seed);
  const flags = polyEligibility(universe, degree, wheelDegree);
  let eligible = 0;
  for (const flag of flags) eligible += flag;
  const p = eligible > 0 ? universe.counts[degree] / eligible : 0;
  const out = [];
  const lead = universe.pow[degree];
  for (let lower = 0; lower < flags.length; lower++) {
    if (!flags[lower]) continue;
    if (random() < p) out.push(lead + lower);
  }
  return out;
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
  if (!id.startsWith("mu_")) throw new Error(`holdout only supports Mobius rows, got ${id}`);
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
    x[j] = polynomialMobius(polyShift(values[i], spec), universe);
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

function featureCorrelation(values, spec, universe) {
  const { x, y } = featureGapVectors(values, spec, universe);
  const base = moments(x, y);
  return corrFromMoments(base.n, base.sx, base.sy, base.sxx, base.syy, base.sxy);
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

function renderMarkdown(summary) {
  const lines = ["# Mobius/Gap Degree-17 Holdout", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push("| statistic | expected sign | real z | real n | local-wheel meanAbs | cyclic meanAbs | local ratio | cyclic ratio | verdict |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of summary.rows) {
    lines.push(`| ${row.id} | ${row.expectedSign} | ${row.real.z.toFixed(3)} | ${row.real.n} | ${row.localWheel.meanAbs.toFixed(3)} | ${row.cyclic.meanAbs.toFixed(3)} | ${row.localRatio.toFixed(3)} | ${row.cyclicRatio.toFixed(3)} | ${row.pass ? "survives" : "fails"} |`);
  }
  lines.push("");
  return `${lines.join("\n")}`;
}

const cyclicFile = path.join(outDir, "mobius-gap-cyclic.json");
if (!fs.existsSync(cyclicFile)) throw new Error(`missing cyclic artifact: ${cyclicFile}`);

const cyclicAudit = JSON.parse(fs.readFileSync(cyclicFile, "utf8"));
const base3 = cyclicAudit.groups.find((group) => group.q === q);
const survivors = base3.classified.filter((row) => row.pass);
if (!survivors.length) throw new Error("no base3 cyclic survivors to hold out");

console.error(`[mobius-gap-holdout] F_3[t] universe to degree ${holdoutDegree}`);
const universe = buildPolynomialUniverse(q, holdoutDegree);
const realValues = universe.irreduciblesByDegree[holdoutDegree];
const rows = [];

for (const survivor of survivors) {
  const spec = specFromId(survivor.id);
  const expectedSign = Math.sign(survivor.realZ.at(-1));
  console.error(`[mobius-gap-holdout] real ${spec.id}`);
  const { x, y } = featureGapVectors(realValues, spec, universe);
  const base = moments(x, y);
  const real = corrFromMoments(base.n, base.sx, base.sy, base.sxx, base.syy, base.sxy);

  const cyclicZ = [];
  for (const offset of seededOffsets(x.length)) cyclicZ.push(shiftedCorrelation(base, x, y, offset).z);

  const localWheelZ = [];
  for (const seed of seeds) {
    console.error(`[mobius-gap-holdout] local-wheel ${spec.id} seed ${seed}`);
    const fake = samplePolynomialWheel(universe, holdoutDegree, 2, seed);
    localWheelZ.push(featureCorrelation(fake, spec, universe).z);
  }

  const localWheel = summarize(localWheelZ);
  const cyclic = summarize(cyclicZ);
  const localThreshold = Math.max(6, 2 * localWheel.meanAbs);
  const cyclicThreshold = Math.max(6, 2 * cyclic.meanAbs);
  rows.push({
    id: spec.id,
    expectedSign,
    real,
    localWheel,
    cyclic,
    localRatio: Math.abs(real.z) / Math.max(1e-12, localWheel.meanAbs),
    cyclicRatio: Math.abs(real.z) / Math.max(1e-12, cyclic.meanAbs),
    pass: Math.sign(real.z) === expectedSign && Math.abs(real.z) > localThreshold && Math.abs(real.z) > cyclicThreshold,
  });
}

rows.sort((a, b) => {
  if (Number(b.pass) !== Number(a.pass)) return Number(b.pass) - Number(a.pass);
  return Math.abs(b.real.z) - Math.abs(a.real.z);
});

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: {
    q,
    holdoutDegree,
    seeds,
    source: cyclicFile,
    exclusions: {
      plus: "next gap > shift",
      minus: "previous gap > shift",
    },
  },
  rows,
};

const jsonFile = path.join(outDir, "mobius-gap-holdout-q3-d17.json");
const mdFile = path.join(outDir, "mobius-gap-holdout-q3-d17.md");
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, rows: rows.length }, null, 2));
