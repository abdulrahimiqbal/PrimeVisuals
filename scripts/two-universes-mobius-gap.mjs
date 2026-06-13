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
import { primesUpTo } from "../src/core/math.js";

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

function gcd(a, b) {
  let x = Math.abs(a), y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function totient(n) {
  let m = n, out = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p) continue;
    out -= out / p;
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= out / m;
  return Math.round(out);
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

function buildIntegerMuOmega(N) {
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

function isPrimeSmall(n) {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}

function sampleIntegerWheel(lo, hi, W, seed) {
  const random = rng(seed);
  const densityFactor = W / totient(W);
  const out = [];
  for (let n = Math.max(2, lo + 1); n <= Math.min(hi, W); n++) {
    if (W % n === 0 && isPrimeSmall(n)) out.push(n);
  }
  const residues = [];
  for (let r = 1; r < W; r++) if (gcd(r, W) === 1) residues.push(r);
  const startBase = Math.floor((lo + 1) / W) * W;
  for (let base = startBase; base <= hi; base += W) {
    for (const r of residues) {
      const n = base + r;
      if (n <= lo || n > hi) continue;
      if (random() < Math.min(1, densityFactor / Math.log(n))) out.push(n);
    }
  }
  out.sort((a, b) => a - b);
  return out;
}

function takeWindow(values, lo, hi) {
  const out = [];
  for (const value of values) {
    if (value <= lo) continue;
    if (value > hi) break;
    out.push(value);
  }
  return out;
}

function integerFeatureSpecs(tables) {
  const { mu, omega } = tables;
  return [
    { id: "mu_p_minus_1", fn: (p) => mu[p - 1] },
    { id: "abs_mu_p_minus_1", fn: (p) => Math.abs(mu[p - 1]) },
    { id: "omega_p_minus_1", fn: (p) => omega[p - 1] },
    { id: "mu_p_plus_1", fn: (p) => mu[p + 1] },
    { id: "abs_mu_p_plus_1", fn: (p) => Math.abs(mu[p + 1]) },
    { id: "omega_p_plus_1", fn: (p) => omega[p + 1] },
  ];
}

function featureCorrelations(values, featureSpecs) {
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
    for (const spec of featureSpecs) {
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
    { id: "plus_1", shift: 1, sign: 1 },
    { id: "plus_t", shift: q, sign: 1 },
    { id: "plus_t_plus_1", shift: q + 1, sign: 1 },
  ];
  if (q === 2) return base;
  return [
    ...base,
    { id: "minus_1", shift: 1, sign: -1 },
    { id: "minus_t", shift: q, sign: -1 },
    { id: "minus_t_plus_1", shift: q + 1, sign: -1 },
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
      fn: (f) => polynomialMobius(polyShift(f, shift, universe.q), universe),
    });
    out.push({
      id: `abs_mu_${shift.id}`,
      fn: (f) => Math.abs(polynomialMobius(polyShift(f, shift, universe.q), universe)),
    });
    out.push({
      id: `omega_${shift.id}`,
      fn: (f) => polyOmega(polyShift(f, shift, universe.q), universe, omegaByDegree),
    });
  }
  return out;
}

function classifyRows(blocks) {
  const ids = Object.keys(blocks.at(-1).real);
  const rows = [];
  for (const id of ids) {
    const realZ = blocks.map((block) => block.real[id].z);
    const nullAbs = blocks.map((block) => block.nulls[id].meanAbs);
    const signs = realZ.map((z) => Math.sign(z));
    const stableSign = signs.every((s) => s !== 0 && s === signs[0]);
    const abs = realZ.map((z) => Math.abs(z));
    const sharpens = abs[2] > abs[1] && abs[1] > abs[0];
    const largestPass = abs[2] > Math.max(6, 2 * nullAbs[2]);
    rows.push({
      id,
      realZ,
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

function renderMarkdown(summary) {
  const lines = ["# Two-Universes Mobius/Gap Battery", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  for (const group of summary.groups) {
    lines.push(`## ${group.label}`);
    lines.push("");
    lines.push("| universe | top statistic | real z values | null meanAbs values | largest ratio | verdict |");
    lines.push("| --- | --- | ---: | ---: | ---: | --- |");
    for (const side of ["polynomial", "integer"]) {
      const row = group[side].classified[0];
      lines.push(`| ${side} | ${row.id} | ${row.realZ.map((z) => z.toFixed(3)).join(", ")} | ${row.nullAbs.map((z) => z.toFixed(3)).join(", ")} | ${row.largestRatio.toFixed(3)} | ${row.pass ? "candidate" : "noise"} |`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(outDir, { recursive: true });

const maxInteger = Math.max(...blockSpecs.map((spec) => spec.q ** Math.max(...spec.degrees)));
console.error(`[mobius-gap] integer tables to ${maxInteger + 1}`);
const integerTables = buildIntegerMuOmega(maxInteger + 1);
console.error(`[mobius-gap] primes to ${maxInteger}`);
const realPrimes = primesUpTo(maxInteger);

const groups = [];
for (const blockSpec of blockSpecs) {
  console.error(`[mobius-gap] F_${blockSpec.q}[t] universe to degree ${Math.max(...blockSpec.degrees)}`);
  const universe = buildPolynomialUniverse(blockSpec.q, Math.max(...blockSpec.degrees));
  console.error(`[mobius-gap] F_${blockSpec.q}[t] omega tables`);
  const omegaByDegree = buildPolynomialOmegaTables(universe);
  const polyFeatures = polynomialFeatureSpecs(universe, omegaByDegree);
  const integerFeatures = integerFeatureSpecs(integerTables);

  const polynomialBlocks = [];
  for (const degree of blockSpec.degrees) {
    console.error(`[mobius-gap] F_${blockSpec.q}[t] degree ${degree}`);
    const real = [...universe.irreduciblesByDegree[degree]];
    const realStats = featureCorrelations(real, polyFeatures);
    const nullStatsByFeature = new Map(polyFeatures.map((spec) => [spec.id, []]));
    for (const seed of seeds) {
      const fake = samplePolynomialWheel(universe, degree, 2, seed);
      const fakeStats = featureCorrelations(fake, polyFeatures);
      for (const spec of polyFeatures) nullStatsByFeature.get(spec.id).push(fakeStats[spec.id].z);
    }
    const nulls = {};
    for (const spec of polyFeatures) nulls[spec.id] = summarize(nullStatsByFeature.get(spec.id));
    polynomialBlocks.push({ degree, real: realStats, nulls });
  }

  const integerBlocks = [];
  for (const degree of blockSpec.degrees) {
    const lo = blockSpec.q ** (degree - 1);
    const hi = blockSpec.q ** degree;
    console.error(`[mobius-gap] Z interval (${lo}, ${hi}]`);
    const real = takeWindow(realPrimes, lo, hi);
    const realStats = featureCorrelations(real, integerFeatures);
    const nullStatsByFeature = new Map(integerFeatures.map((spec) => [spec.id, []]));
    for (const seed of seeds) {
      const fake = sampleIntegerWheel(lo, hi, 210, seed);
      const fakeStats = featureCorrelations(fake, integerFeatures);
      for (const spec of integerFeatures) nullStatsByFeature.get(spec.id).push(fakeStats[spec.id].z);
    }
    const nulls = {};
    for (const spec of integerFeatures) nulls[spec.id] = summarize(nullStatsByFeature.get(spec.id));
    integerBlocks.push({ degree, lo, hi, real: realStats, nulls });
  }

  groups.push({
    label: blockSpec.label,
    q: blockSpec.q,
    polynomial: { blocks: polynomialBlocks, classified: classifyRows(polynomialBlocks) },
    integer: { blocks: integerBlocks, classified: classifyRows(integerBlocks) },
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: { blockSpecs, seeds, nulls: { polynomial: "degree-2 local wheel", integer: "W=210 wheel" } },
  groups,
};

const jsonFile = path.join(outDir, "mobius-gap-battery.json");
const mdFile = path.join(outDir, "mobius-gap-battery.md");
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, groups: groups.length }, null, 2));
