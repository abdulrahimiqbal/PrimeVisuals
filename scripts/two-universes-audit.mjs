#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  irreducibleCountFormula,
} from "../src/core/ffield.js";
import {
  primesUpTo,
} from "../src/core/math.js";
import {
  autocorr,
  histogram,
  normalizedSpacings,
} from "../src/core/stats.js";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const q2MaxDegree = Number(process.argv[3] || 25);
const q3MaxDegree = Number(process.argv[4] || 16);

const seeds = [
  12345, 271828, 314159, 161803, 424242,
];

const qSpecs = [
  { q: 2, degrees: [q2MaxDegree - 2, q2MaxDegree - 1, q2MaxDegree] },
  { q: 3, degrees: [q3MaxDegree - 2, q3MaxDegree - 1, q3MaxDegree] },
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
  if (!values.length) {
    return { n: 0, mean: 0, meanAbs: 0, sd: 0, min: 0, max: 0 };
  }
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

function gaps(values) {
  const out = new Float64Array(Math.max(0, values.length - 1));
  for (let i = 0; i < out.length; i++) out[i] = values[i + 1] - values[i];
  return out;
}

function gapAutocorr(values) {
  const gs = gaps(values);
  if (gs.length < 4) return { n: gs.length, meanGap: 0, r1: 0, z1: 0 };
  let mean = 0;
  for (const g of gs) mean += g;
  mean /= gs.length;
  const z1 = autocorr(gs, 1)[1];
  return { n: gs.length, meanGap: mean, r1: z1 / Math.sqrt(gs.length - 1), z1 };
}

function expBinMasses(bins, lo, hi) {
  const out = new Float64Array(bins);
  const width = (hi - lo) / bins;
  for (let i = 0; i < bins; i++) {
    const a = lo + i * width;
    const b = i + 1 === bins ? Infinity : a + width;
    out[i] = Math.exp(-a) - (Number.isFinite(b) ? Math.exp(-b) : 0);
  }
  return out;
}

function spacingL1(values) {
  const ns = normalizedSpacings(values);
  const bins = 20, lo = 0, hi = 5;
  const h = histogram(ns, bins, lo, hi);
  const exp = expBinMasses(bins, lo, hi);
  let l1 = 0;
  for (let i = 0; i < bins; i++) l1 += Math.abs(h.counts[i] - exp[i]);
  return { n: ns.length, l1 };
}

function takePrefix(values, hi) {
  let end = values.length;
  while (end > 0 && values[end - 1] > hi) end--;
  return values.slice(0, end);
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

function polySequence(universe, maxDegree) {
  const out = [];
  for (let d = 1; d <= maxDegree; d++) {
    for (const f of universe.irreduciblesByDegree[d]) out.push(f);
  }
  return out;
}

function polyDegreeWindow(universe, degree) {
  return [...universe.irreduciblesByDegree[degree]];
}

function irreducibleFactorsUpTo(universe, maxFactorDegree) {
  const out = [];
  for (let d = 1; d <= maxFactorDegree; d++) {
    for (const f of universe.irreduciblesByDegree[d]) out.push(f);
  }
  return out;
}

function polyDegreeEncoded(poly, q) {
  const f = Math.floor(poly);
  if (f <= 0) return -1;
  if (q === 2) return 31 - Math.clz32(f);
  let d = 0, p = 1;
  while (p * q <= f) { p *= q; d++; }
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
    const shifted = factor * pow[pos];
    out = (out ^ shifted) >>> 0;
    if (carry % 2 !== 1) break;
    carry = Math.floor(carry / 2);
    pos++;
  }
  return out;
}

function markLocalMultiples(flags, factor, universe, targetDegree) {
  const q = universe.q;
  const factorDegree = polyDegreeEncoded(factor, q);
  const hDegree = targetDegree - factorDegree;
  if (hDegree < 0) return;
  const pow = universe.pow;
  if (q === 3) {
    const terms = factorTerms(factor, q);
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

function makePolyEligibility(universe, wheelDegree) {
  const factors = irreducibleFactorsUpTo(universe, wheelDegree);
  const byDegree = Array.from({ length: universe.maxDegree + 1 }, () => null);
  const counts = new Int32Array(universe.maxDegree + 1);
  for (let degree = 1; degree <= universe.maxDegree; degree++) {
    const flags = new Uint8Array(universe.pow[degree]);
    if (degree <= wheelDegree) {
      for (const f of universe.irreduciblesByDegree[degree]) {
        flags[f - universe.pow[degree]] = 1;
      }
    } else {
      flags.fill(1);
      for (const factor of factors) markLocalMultiples(flags, factor, universe, degree);
    }
    let count = 0;
    for (const flag of flags) count += flag;
    counts[degree] = count;
    byDegree[degree] = flags;
  }
  return { wheelDegree, factors, byDegree, counts };
}

function samplePolynomialWheel(universe, eligibility, seed) {
  const random = rng(seed);
  const out = [];
  for (let degree = 1; degree <= universe.maxDegree; degree++) {
    const flags = eligibility.byDegree[degree];
    const eligibleCount = eligibility.counts[degree];
    const p = eligibleCount > 0 ? universe.counts[degree] / eligibleCount : 0;
    const lead = universe.pow[degree];
    for (let lower = 0; lower < flags.length; lower++) {
      if (!flags[lower]) continue;
      if (degree <= eligibility.wheelDegree || random() < p) out.push(lead + lower);
    }
  }
  return out;
}

function deterministicPolynomialWheel(universe, eligibility) {
  const out = [];
  for (let degree = 1; degree <= universe.maxDegree; degree++) {
    const lead = universe.pow[degree];
    const flags = eligibility.byDegree[degree];
    for (let lower = 0; lower < flags.length; lower++) {
      if (flags[lower]) out.push(lead + lower);
    }
  }
  return out;
}

function sampleIntegerWheel(N, W, seed) {
  const random = rng(seed);
  const phi = totient(W);
  const pFactor = W / phi;
  const out = [];
  for (let n = 2; n <= Math.min(N, W); n++) {
    if (W % n === 0 && isPrimeSmall(n)) out.push(n);
  }
  const residues = [];
  for (let r = 1; r < W; r++) {
    if (gcd(r, W) === 1) residues.push(r);
  }
  for (let base = 0; base <= N; base += W) {
    for (const r of residues) {
      const n = base + r;
      if (n < 2 || n > N) continue;
      if (random() < Math.min(1, pFactor / Math.log(n))) out.push(n);
    }
  }
  out.sort((a, b) => a - b);
  return out;
}

function deterministicIntegerWheel(N, W) {
  const out = [];
  for (let n = 2; n <= Math.min(N, W); n++) {
    if (W % n === 0 && isPrimeSmall(n)) out.push(n);
  }
  const residues = [];
  for (let r = 1; r < W; r++) {
    if (gcd(r, W) === 1) residues.push(r);
  }
  for (let base = 0; base <= N; base += W) {
    for (const r of residues) {
      const n = base + r;
      if (n >= 2 && n <= N) out.push(n);
    }
  }
  out.sort((a, b) => a - b);
  return out;
}

function isPrimeSmall(n) {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}

function metricPack(values) {
  return {
    gapAutocorr: gapAutocorr(values),
    spacing: spacingL1(values),
  };
}

function metricPackForRanges(values, ranges) {
  const prefix = {};
  const holdout = {};
  for (const range of ranges) {
    prefix[range.label] = metricPack(takePrefix(values, range.hi));
    holdout[range.label] = metricPack(takeWindow(values, range.lo, range.hi));
  }
  return { prefix, holdout };
}

function collectNullMetrics(nullSequences, ranges) {
  const out = {};
  for (const scope of ["prefix", "holdout"]) {
    out[scope] = {};
    for (const range of ranges) {
      const gapZ = [];
      const gapR = [];
      const spacing = [];
      for (const values of nullSequences) {
        const selected = scope === "prefix"
          ? takePrefix(values, range.hi)
          : takeWindow(values, range.lo, range.hi);
        const pack = metricPack(selected);
        gapZ.push(pack.gapAutocorr.z1);
        gapR.push(pack.gapAutocorr.r1);
        spacing.push(pack.spacing.l1);
      }
      out[scope][range.label] = {
        gapZ: summarize(gapZ),
        gapR: summarize(gapR),
        spacingL1: summarize(spacing),
      };
    }
  }
  return out;
}

function rangesForQ(q, degrees) {
  return degrees.map((degree) => ({
    label: `degree-${degree}`,
    degree,
    lo: q ** (degree - 1),
    hi: q ** degree,
  }));
}

function extractMetricSeries(pack, ranges, scope, metric, field) {
  return ranges.map((range) => pack[scope][range.label][metric][field]);
}

function classifyCandidate(realPack, nullPack, localNullPack, ranges, scope) {
  const last = ranges[ranges.length - 1].label;
  const realZ = realPack[scope][last].gapAutocorr.z1;
  const genericAbs = nullPack[scope][last].gapZ.meanAbs;
  const localAbs = localNullPack[scope][last].gapZ.meanAbs;
  const abs = Math.abs(realZ);
  const signs = ranges.map((range) => Math.sign(realPack[scope][range.label].gapAutocorr.z1));
  const magnitudes = ranges.map((range) => Math.abs(realPack[scope][range.label].gapAutocorr.z1));
  const stableSign = signs.every((s) => s === signs[0] && s !== 0);
  const sharpens = magnitudes[2] > magnitudes[1] && magnitudes[1] > magnitudes[0];
  return {
    realZ,
    genericNullMeanAbs: genericAbs,
    localNullMeanAbs: localAbs,
    stableSign,
    sharpens,
    beatsGeneric: abs > Math.max(4, 2 * genericAbs),
    beatsLocal: abs > Math.max(4, 2 * localAbs),
  };
}

function renderMarkdown(summary) {
  const lines = ["# Two-Universes Audit", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  for (const qRow of summary.qRows) {
    lines.push(`## F_${qRow.q}[t] vs Z`);
    lines.push("");
    lines.push("| range | F gap z | Z gap z | F local-null | Z wheel-210 null | F spacing L1 | Z spacing L1 |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
    for (const range of qRow.ranges) {
      const f = qRow.polynomial.real.prefix[range.label];
      const z = qRow.integer.real.prefix[range.label];
      const fNull = qRow.polynomial.nulls.wheelDegree1.prefix[range.label].gapZ.meanAbs;
      const zNull = qRow.integer.nulls.wheel210.prefix[range.label].gapZ.meanAbs;
      lines.push(`| ${range.label} | ${f.gapAutocorr.z1.toFixed(6)} | ${z.gapAutocorr.z1.toFixed(6)} | ${fNull.toFixed(6)} | ${zNull.toFixed(6)} | ${f.spacing.l1.toFixed(6)} | ${z.spacing.l1.toFixed(6)} |`);
    }
    lines.push("");
    lines.push(`Prefix audit: F beats local null = ${qRow.audit.prefix.polynomial.beatsLocal}; Z beats wheel-210 null = ${qRow.audit.prefix.integer.beatsLocal}.`);
    lines.push(`Holdout audit: F beats local null = ${qRow.audit.holdout.polynomial.beatsLocal}; Z beats wheel-210 null = ${qRow.audit.holdout.integer.beatsLocal}.`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(outDir, { recursive: true });

const maxIntegerN = Math.max(...qSpecs.map((spec) => spec.q ** Math.max(...spec.degrees)));
console.error(`[audit] building integer primes up to ${maxIntegerN}`);
const integerPrimes = primesUpTo(maxIntegerN);
console.error("[audit] building integer wheel nulls");
const integerNulls = {
  wheel6: seeds.map((seed) => sampleIntegerWheel(maxIntegerN, 6, seed)),
  wheel30: seeds.map((seed) => sampleIntegerWheel(maxIntegerN, 30, seed)),
  wheel210: seeds.map((seed) => sampleIntegerWheel(maxIntegerN, 210, seed)),
};
console.error("[audit] building deterministic integer wheel controls");
const integerControls = {
  wheel6All: deterministicIntegerWheel(maxIntegerN, 6),
  wheel30All: deterministicIntegerWheel(maxIntegerN, 30),
  wheel210All: deterministicIntegerWheel(maxIntegerN, 210),
};

const qRows = [];
for (const spec of qSpecs) {
  const maxDegree = Math.max(...spec.degrees);
  const ranges = rangesForQ(spec.q, spec.degrees);
  console.error(`[audit] building F_${spec.q}[t] through degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(spec.q, maxDegree);
  const realPoly = polySequence(universe, maxDegree);
  console.error(`[audit] building F_${spec.q}[t] wheel eligibility`);
  const wheel1 = makePolyEligibility(universe, 1);
  const wheel2 = makePolyEligibility(universe, 2);
  console.error(`[audit] sampling F_${spec.q}[t] polynomial nulls`);
  const polyNulls = {
    wheelDegree0: seeds.map((seed) => samplePolynomialWheel(universe, { wheelDegree: 0, byDegree: Array.from({ length: universe.maxDegree + 1 }, (_, d) => new Uint8Array(universe.pow[d]).fill(1)), counts: universe.pow }, seed)),
    wheelDegree1: seeds.map((seed) => samplePolynomialWheel(universe, wheel1, seed)),
    wheelDegree2: seeds.map((seed) => samplePolynomialWheel(universe, wheel2, seed)),
  };
  const polyControls = {
    wheelDegree1All: deterministicPolynomialWheel(universe, wheel1),
    wheelDegree2All: deterministicPolynomialWheel(universe, wheel2),
  };

  const polynomial = {
    exactCountDeltas: spec.degrees.map((degree) => ({
      degree,
      observed: universe.counts[degree],
      exact: irreducibleCountFormula(spec.q, degree),
      delta: universe.counts[degree] - irreducibleCountFormula(spec.q, degree),
    })),
    real: metricPackForRanges(realPoly, ranges),
    degreeOnly: Object.fromEntries(spec.degrees.map((degree) => [
      `degree-${degree}`,
      metricPack(polyDegreeWindow(universe, degree)),
    ])),
    nulls: {
      wheelDegree0: collectNullMetrics(polyNulls.wheelDegree0, ranges),
      wheelDegree1: collectNullMetrics(polyNulls.wheelDegree1, ranges),
      wheelDegree2: collectNullMetrics(polyNulls.wheelDegree2, ranges),
    },
    controls: {
      wheelDegree1All: metricPackForRanges(polyControls.wheelDegree1All, ranges),
      wheelDegree2All: metricPackForRanges(polyControls.wheelDegree2All, ranges),
    },
  };

  const integer = {
    real: metricPackForRanges(integerPrimes, ranges),
    nulls: {
      wheel6: collectNullMetrics(integerNulls.wheel6, ranges),
      wheel30: collectNullMetrics(integerNulls.wheel30, ranges),
      wheel210: collectNullMetrics(integerNulls.wheel210, ranges),
    },
    controls: {
      wheel6All: metricPackForRanges(integerControls.wheel6All, ranges),
      wheel30All: metricPackForRanges(integerControls.wheel30All, ranges),
      wheel210All: metricPackForRanges(integerControls.wheel210All, ranges),
    },
  };

  const audit = {
    prefix: {
      polynomial: classifyCandidate(polynomial.real, polynomial.nulls.wheelDegree0, polynomial.nulls.wheelDegree1, ranges, "prefix"),
      integer: classifyCandidate(integer.real, integer.nulls.wheel6, integer.nulls.wheel210, ranges, "prefix"),
    },
    holdout: {
      polynomial: classifyCandidate(polynomial.real, polynomial.nulls.wheelDegree0, polynomial.nulls.wheelDegree1, ranges, "holdout"),
      integer: classifyCandidate(integer.real, integer.nulls.wheel6, integer.nulls.wheel210, ranges, "holdout"),
    },
  };

  qRows.push({
    q: spec.q,
    degrees: spec.degrees,
    ranges,
    polynomial,
    integer,
    audit,
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: {
    q2MaxDegree,
    q3MaxDegree,
    seeds,
    maxIntegerN,
    nulls: {
      integer: "wheel W in {6,30,210}, sampled with probability (W/phi(W))/log n among units plus small wheel primes",
      polynomial: "wheelDegree 0/1/2, sampled among monic polynomials coprime to irreducibles of degree <= wheelDegree with per-degree exact-count probability",
    },
  },
  qRows,
};

const jsonFile = path.join(outDir, `audit-q2-${q2MaxDegree}-q3-${q3MaxDegree}.json`);
const mdFile = path.join(outDir, `audit-q2-${q2MaxDegree}-q3-${q3MaxDegree}.md`);
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));

console.log(JSON.stringify({ ok: true, jsonFile, mdFile, qRows: qRows.length }, null, 2));
