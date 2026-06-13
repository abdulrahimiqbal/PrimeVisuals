#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polyDegree,
  polynomialMobius,
  polySub,
} from "../src/core/ffield.js";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];

const blockSpecs = [
  { label: "base2", q: 2, degrees: [23, 24, 25] },
  { label: "base3", q: 3, degrees: [14, 15, 16] },
];

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

function polyDegreeEncoded(poly, q) {
  if (poly <= 0) return -1;
  if (q === 2) return 31 - Math.clz32(poly);
  let d = 0, p = 1;
  while (p * q <= poly) { p *= q; d++; }
  return d;
}

function factorTerms(poly, q) {
  const positions = [];
  const coefficients = [];
  let x = poly, pos = 0;
  while (x > 0) {
    const c = x % q;
    if (c) {
      positions.push(pos);
      coefficients.push(c);
    }
    x = Math.floor(x / q);
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

function advanceMultipleProduct2(product, lower, factor, hDegree, pow) {
  let out = product;
  let carry = lower, pos = 0;
  while (pos < hDegree) {
    out = (out ^ (factor * pow[pos])) >>> 0;
    if (carry % 2 !== 1) break;
    carry = Math.floor(carry / 2);
    pos++;
  }
  return out;
}

function addOmegaMultiples(omegaTable, factor, universe, targetDegree) {
  const factorDegree = polyDegreeEncoded(factor, universe.q);
  const hDegree = targetDegree - factorDegree;
  if (hDegree < 0) return;
  const pow = universe.pow;
  if (universe.q === 3) {
    const terms = factorTerms(factor, universe.q);
    const state = shiftedProductState(terms, hDegree, targetDegree, pow);
    const limit = pow[hDegree];
    for (let hLower = 0; hLower < limit; hLower++) {
      omegaTable[state.value - pow[targetDegree]]++;
      if (hLower + 1 < limit) advanceMultipleProductQ3(state, hLower, terms, hDegree, pow);
    }
    return;
  }
  const limit = pow[hDegree];
  let product = factor * pow[hDegree];
  for (let hLower = 0; hLower < limit; hLower++) {
    omegaTable[product - pow[targetDegree]]++;
    if (hLower + 1 < limit) product = advanceMultipleProduct2(product, hLower, factor, hDegree, pow);
  }
}

function buildPolynomialOmegaTables(universe) {
  const omegaByDegree = Array.from({ length: universe.maxDegree + 1 }, (_, degree) => new Int8Array(universe.pow[degree]));
  for (let factorDegree = 1; factorDegree <= universe.maxDegree; factorDegree++) {
    for (const factor of universe.irreduciblesByDegree[factorDegree]) {
      for (let totalDegree = factorDegree; totalDegree <= universe.maxDegree; totalDegree++) {
        addOmegaMultiples(omegaByDegree[totalDegree], factor, universe, totalDegree);
      }
    }
  }
  return omegaByDegree;
}

function polyOmega(poly, universe, omegaByDegree) {
  const degree = polyDegree(poly, universe.q);
  if (degree < 0 || degree > universe.maxDegree) return 0;
  if (degree === 0) return 0;
  return omegaByDegree[degree][poly - universe.pow[degree]] ?? 0;
}

function markLocalMultiples(flags, factor, universe, targetDegree) {
  const factorDegree = polyDegreeEncoded(factor, universe.q);
  const hDegree = targetDegree - factorDegree;
  if (hDegree < 0) return;
  const pow = universe.pow;
  if (universe.q === 3) {
    const terms = factorTerms(factor, universe.q);
    const state = shiftedProductState(terms, hDegree, targetDegree, pow);
    const limit = pow[hDegree];
    for (let hLower = 0; hLower < limit; hLower++) {
      flags[state.value - pow[targetDegree]] = 0;
      if (hLower + 1 < limit) advanceMultipleProductQ3(state, hLower, terms, hDegree, pow);
    }
    return;
  }
  const limit = pow[hDegree];
  let product = factor * pow[hDegree];
  for (let hLower = 0; hLower < limit; hLower++) {
    flags[product - pow[targetDegree]] = 0;
    if (hLower + 1 < limit) product = advanceMultipleProduct2(product, hLower, factor, hDegree, pow);
  }
}

function irreducibleFactorsUpTo(universe, maxFactorDegree) {
  const out = [];
  for (let d = 1; d <= maxFactorDegree; d++) {
    for (const f of universe.irreduciblesByDegree[d]) out.push(f);
  }
  return out;
}

const polyEligibilityCache = new Map();
function polyEligibility(universe, degree, wheelDegree) {
  const key = `${universe.q}:${universe.maxDegree}:${degree}:${wheelDegree}`;
  const cached = polyEligibilityCache.get(key);
  if (cached) return cached;
  const flags = new Uint8Array(universe.pow[degree]);
  if (degree <= wheelDegree) {
    for (const f of universe.irreduciblesByDegree[degree]) flags[f - universe.pow[degree]] = 1;
    polyEligibilityCache.set(key, flags);
    return flags;
  }
  flags.fill(1);
  for (const factor of irreducibleFactorsUpTo(universe, wheelDegree)) markLocalMultiples(flags, factor, universe, degree);
  polyEligibilityCache.set(key, flags);
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

function shiftSpecs(q) {
  const base = [
    { id: "plus_1", shift: 1, sign: 1, leakDirection: "plus" },
    { id: "plus_t", shift: q, sign: 1, leakDirection: "plus" },
    { id: "plus_t_plus_1", shift: q + 1, sign: 1, leakDirection: "plus" },
  ];
  if (q === 2) return base;
  return [
    ...base,
    { id: "minus_1", shift: 1, sign: -1, leakDirection: "minus" },
    { id: "minus_t", shift: q, sign: -1, leakDirection: "minus" },
    { id: "minus_t_plus_1", shift: q + 1, sign: -1, leakDirection: "minus" },
  ];
}

function polyShift(poly, spec, q) {
  return spec.sign === 1 ? polyAdd(poly, spec.shift, q) : polySub(poly, spec.shift, q);
}

function polynomialFeatureSpecs(universe, omegaByDegree) {
  const out = [];
  for (const shift of shiftSpecs(universe.q)) {
    out.push({
      id: `mu_${shift.id}`,
      shift: shift.shift,
      leakDirection: shift.leakDirection,
      fn: (f) => polynomialMobius(polyShift(f, shift, universe.q), universe),
    });
    out.push({
      id: `abs_mu_${shift.id}`,
      shift: shift.shift,
      leakDirection: shift.leakDirection,
      fn: (f) => Math.abs(polynomialMobius(polyShift(f, shift, universe.q), universe)),
    });
    out.push({
      id: `omega_${shift.id}`,
      shift: shift.shift,
      leakDirection: shift.leakDirection,
      fn: (f) => polyOmega(polyShift(f, shift, universe.q), universe, omegaByDegree),
    });
  }
  return out;
}

function includeAfterLeakScrub(spec, prevGap, nextGap) {
  if (spec.leakDirection === "plus") return nextGap > spec.shift;
  if (spec.leakDirection === "minus") return prevGap > spec.shift;
  return true;
}

function featureCorrelationsLeakScrubbed(values, featureSpecs) {
  if (values.length < 3) return Object.fromEntries(featureSpecs.map((spec) => [spec.id, { n: 0, r: 0, z: 0 }]));
  const gaps = new Float64Array(values.length - 1);
  let sum = 0;
  for (let i = 0; i + 1 < values.length; i++) {
    gaps[i] = values[i + 1] - values[i];
    sum += gaps[i];
  }
  const meanGap = sum / gaps.length;
  const stats = new Map(featureSpecs.map((spec) => [spec.id, { n: 0, sx: 0, sy: 0, sxx: 0, syy: 0, sxy: 0 }]));
  for (let i = 0; i < gaps.length; i++) {
    const y = gaps[i] / meanGap;
    const value = values[i];
    const prevGap = i > 0 ? gaps[i - 1] : Infinity;
    const nextGap = gaps[i];
    for (const spec of featureSpecs) {
      if (!includeAfterLeakScrub(spec, prevGap, nextGap)) continue;
      const x = spec.fn(value);
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
  for (const spec of featureSpecs) out[spec.id] = corrFromSums(stats.get(spec.id));
  return out;
}

function classifyRows(blocks) {
  const ids = Object.keys(blocks.at(-1).real);
  const rows = [];
  for (const id of ids) {
    const realZ = blocks.map((block) => block.real[id].z);
    const realN = blocks.map((block) => block.real[id].n);
    const nullAbs = blocks.map((block) => block.nulls[id].meanAbs);
    const signs = realZ.map((z) => Math.sign(z));
    const stableSign = signs.every((s) => s !== 0 && s === signs[0]);
    const abs = realZ.map((z) => Math.abs(z));
    const sharpens = abs[2] > abs[1] && abs[1] > abs[0];
    const largestPass = abs[2] > Math.max(6, 2 * nullAbs[2]);
    rows.push({
      id,
      realZ,
      realN,
      nullAbs,
      stableSign,
      sharpens,
      largestPass,
      pass: stableSign && sharpens && largestPass,
      largestRatio: abs[2] / Math.max(1e-12, nullAbs[2]),
      largestN: blocks.at(-1).real[id].n,
    });
  }
  rows.sort((a, b) => {
    if (Number(b.pass) !== Number(a.pass)) return Number(b.pass) - Number(a.pass);
    return b.largestRatio - a.largestRatio;
  });
  return rows;
}

function rawFirstPassRows(label) {
  const rawFile = path.join(outDir, "mobius-gap-battery.json");
  if (!fs.existsSync(rawFile)) return [];
  const raw = JSON.parse(fs.readFileSync(rawFile, "utf8"));
  const group = raw.groups.find((entry) => entry.label === label);
  if (!group) return [];
  return group.polynomial.classified.filter((row) => row.pass).map((row) => row.id);
}

function renderMarkdown(summary) {
  const lines = ["# Mobius/Gap Leakage Audit", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push("Rule: positive-shift rows exclude next gap <= shift; negative-shift rows exclude previous gap <= shift. Nulls use the same exclusion on each sampled local-wheel sequence.");
  lines.push("");
  for (const group of summary.groups) {
    lines.push(`## ${group.label}`);
    lines.push("");
    lines.push(`First-pass polynomial candidates: ${group.firstPassCandidates.length ? group.firstPassCandidates.join(", ") : "none"}`);
    lines.push("");
    lines.push("| rank | statistic | scrubbed real z values | scrubbed n values | null meanAbs values | largest ratio | verdict |");
    lines.push("| ---: | --- | ---: | ---: | ---: | ---: | --- |");
    for (const [index, row] of group.polynomial.classified.slice(0, 12).entries()) {
      lines.push(`| ${index + 1} | ${row.id} | ${row.realZ.map((z) => z.toFixed(3)).join(", ")} | ${row.realN.join(", ")} | ${row.nullAbs.map((z) => z.toFixed(3)).join(", ")} | ${row.largestRatio.toFixed(3)} | ${row.pass ? "survives" : "fails"} |`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(outDir, { recursive: true });

const groups = [];
for (const blockSpec of blockSpecs) {
  console.error(`[mobius-gap-leakage] F_${blockSpec.q}[t] universe to degree ${Math.max(...blockSpec.degrees)}`);
  const universe = buildPolynomialUniverse(blockSpec.q, Math.max(...blockSpec.degrees));
  console.error(`[mobius-gap-leakage] F_${blockSpec.q}[t] omega tables`);
  const omegaByDegree = buildPolynomialOmegaTables(universe);
  const polyFeatures = polynomialFeatureSpecs(universe, omegaByDegree);

  const polynomialBlocks = [];
  for (const degree of blockSpec.degrees) {
    console.error(`[mobius-gap-leakage] F_${blockSpec.q}[t] degree ${degree}`);
    const real = [...universe.irreduciblesByDegree[degree]];
    const realStats = featureCorrelationsLeakScrubbed(real, polyFeatures);
    const nullStatsByFeature = new Map(polyFeatures.map((spec) => [spec.id, []]));
    for (const seed of seeds) {
      const fake = samplePolynomialWheel(universe, degree, 2, seed);
      const fakeStats = featureCorrelationsLeakScrubbed(fake, polyFeatures);
      for (const spec of polyFeatures) nullStatsByFeature.get(spec.id).push(fakeStats[spec.id].z);
    }
    const nulls = {};
    for (const spec of polyFeatures) nulls[spec.id] = summarize(nullStatsByFeature.get(spec.id));
    polynomialBlocks.push({ degree, real: realStats, nulls });
  }

  groups.push({
    label: blockSpec.label,
    q: blockSpec.q,
    firstPassCandidates: rawFirstPassRows(blockSpec.label),
    polynomial: { blocks: polynomialBlocks, classified: classifyRows(polynomialBlocks) },
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: {
    blockSpecs,
    seeds,
    nulls: { polynomial: "degree-2 local wheel" },
    exclusion: {
      plus: "exclude pair when next gap <= shift",
      minus: "exclude pair when previous gap <= shift",
    },
  },
  groups,
};

const jsonFile = path.join(outDir, "mobius-gap-leakage.json");
const mdFile = path.join(outDir, "mobius-gap-leakage.md");
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, groups: groups.length }, null, 2));
