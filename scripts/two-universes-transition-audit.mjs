#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyMod,
} from "../src/core/ffield.js";
import {
  primesUpTo,
} from "../src/core/math.js";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const integerModuli = [5, 7, 11];
const gapBinCount = 4;
const polyEligibilityCache = new Map();
const polyResidueClassCache = new Map();
const polyResidueEligibleCountCache = new Map();

const q3Degrees = process.env.PV_TRANSITION_FAST_Q3 === "1" ? [13, 14, 15] : [14, 15, 16];
const groupFilter = process.env.PV_TRANSITION_GROUP || "";

const blockSpecs = [
  { label: "base2", q: 2, degrees: [23, 24, 25] },
  { label: "base3", q: 3, degrees: q3Degrees },
].filter((spec) => !groupFilter || spec.label === groupFilter);

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

function l1(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s;
}

function meanMatrix(matrices, size) {
  const out = new Float64Array(size);
  if (!matrices.length) return out;
  for (const matrix of matrices) {
    for (let i = 0; i < size; i++) out[i] += matrix[i];
  }
  for (let i = 0; i < size; i++) out[i] /= matrices.length;
  return out;
}

function compareToNull(realMatrix, nullMatrices) {
  const mean = meanMatrix(nullMatrices, realMatrix.length);
  const nullDistances = nullMatrices.map((matrix) => l1(matrix, mean));
  const realDistance = l1(realMatrix, mean);
  const nullSummary = summarize(nullDistances);
  const residuals = Array.from(realMatrix, (value, i) => value - mean[i]);
  const topCells = residuals
    .map((residual, cell) => ({ cell, residual }))
    .sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual))
    .slice(0, 8);
  return {
    realDistance,
    nullDistance: nullSummary,
    ratio: realDistance / Math.max(1e-12, nullSummary.meanAbs),
    topCells,
  };
}

function matrixFromStates(states, stateCount) {
  const size = stateCount * stateCount;
  const out = new Float64Array(size);
  let total = 0;
  for (let i = 0; i + 1 < states.length; i++) {
    const a = states[i], b = states[i + 1];
    if (a < 0 || b < 0) continue;
    out[a * stateCount + b]++;
    total++;
  }
  if (total > 0) {
    for (let i = 0; i < out.length; i++) out[i] /= total;
  }
  return { matrix: out, transitions: total };
}

function gaps(values) {
  const out = new Float64Array(Math.max(0, values.length - 1));
  for (let i = 0; i < out.length; i++) out[i] = values[i + 1] - values[i];
  return out;
}

function normalizedGaps(values) {
  const gs = gaps(values);
  if (!gs.length) return gs;
  let sum = 0;
  for (const gap of gs) sum += gap;
  const mean = sum / gs.length;
  if (mean === 0) return gs;
  for (let i = 0; i < gs.length; i++) gs[i] /= mean;
  return gs;
}

function quantileThresholds(values, binCount) {
  const sorted = Array.from(values).sort((a, b) => a - b);
  const out = [];
  for (let k = 1; k < binCount; k++) {
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((k * sorted.length) / binCount)));
    out.push(sorted[idx] ?? 0);
  }
  return out;
}

function binIndex(value, thresholds) {
  let idx = 0;
  while (idx < thresholds.length && value > thresholds[idx]) idx++;
  return idx;
}

function gapStates(values, thresholds) {
  const ns = normalizedGaps(values);
  return Array.from(ns, (value) => binIndex(value, thresholds));
}

function integerResidueMap(modulus) {
  const classes = [];
  const map = new Map();
  for (let r = 1; r < modulus; r++) {
    if (gcd(r, modulus) !== 1) continue;
    map.set(r, classes.length);
    classes.push(r);
  }
  return { classes, map };
}

function integerResidueStates(values, modulus) {
  const { classes, map } = integerResidueMap(modulus);
  return {
    stateCount: classes.length,
    states: values.map((value) => map.get(value % modulus) ?? -1),
    classes,
  };
}

function polynomialResidueStates(values, q, modulus, modulusDegree) {
  const norm = q ** modulusDegree;
  return {
    stateCount: norm - 1,
    states: values.map((value) => {
      const r = polyMod(value, modulus, q);
      return r > 0 ? r - 1 : -1;
    }),
    classes: Array.from({ length: norm - 1 }, (_, i) => i + 1),
  };
}

function combinedStates(residueStates, gapStateValues, gapBins) {
  const n = Math.min(residueStates.states.length - 1, gapStateValues.length);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const r = residueStates.states[i];
    const g = gapStateValues[i];
    out[i] = r >= 0 && g >= 0 ? r * gapBins + g : -1;
  }
  return { stateCount: residueStates.stateCount * gapBins, states: out };
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

function countIntegerResidues(values, modulus) {
  const counts = new Int32Array(modulus);
  for (const value of values) {
    if (value % modulus !== 0) counts[value % modulus]++;
  }
  return counts;
}

function sampleIntegerResidueMatched(lo, hi, modulus, targetCounts, seed) {
  const random = rng(seed);
  const eligible = new Int32Array(modulus);
  for (let n = Math.max(5, lo + 1); n <= hi; n++) {
    if (gcd(n, 6 * modulus) !== 1) continue;
    eligible[n % modulus]++;
  }
  const probs = new Float64Array(modulus);
  for (let r = 1; r < modulus; r++) {
    probs[r] = eligible[r] > 0 ? Math.min(1, targetCounts[r] / eligible[r]) : 0;
  }
  const out = [];
  for (let n = Math.max(5, lo + 1); n <= hi; n++) {
    if (gcd(n, 6 * modulus) !== 1) continue;
    if (random() < probs[n % modulus]) out.push(n);
  }
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
  for (const factor of irreducibleFactorsUpTo(universe, wheelDegree)) {
    markLocalMultiples(flags, factor, universe, degree);
  }
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

function samplePolynomialWheelMany(universe, degree, wheelDegree, seedList) {
  const flags = polyEligibility(universe, degree, wheelDegree);
  let eligible = 0;
  for (const flag of flags) eligible += flag;
  const p = eligible > 0 ? universe.counts[degree] / eligible : 0;
  const randoms = seedList.map((seed) => rng(seed));
  const outs = seedList.map(() => []);
  const lead = universe.pow[degree];
  for (let lower = 0; lower < flags.length; lower++) {
    if (!flags[lower]) continue;
    const value = lead + lower;
    for (let i = 0; i < randoms.length; i++) {
      if (randoms[i]() < p) outs[i].push(value);
    }
  }
  return outs;
}

function countPolynomialResidues(values, q, modulus, norm) {
  const counts = new Int32Array(norm);
  for (const value of values) counts[polyMod(value, modulus, q)]++;
  return counts;
}

function polynomialResidueClasses(universe, degree, wheelDegree, modulus) {
  const key = `${universe.q}:${universe.maxDegree}:${degree}:${wheelDegree}:${modulus}`;
  const cached = polyResidueClassCache.get(key);
  if (cached) return cached;
  const flags = polyEligibility(universe, degree, wheelDegree);
  const classes = new Int16Array(flags.length);
  classes.fill(-1);
  const lead = universe.pow[degree];
  for (let lower = 0; lower < classes.length; lower++) {
    if (!flags[lower]) continue;
    classes[lower] = polyMod(lead + lower, modulus, universe.q);
  }
  polyResidueClassCache.set(key, classes);
  return classes;
}

function polynomialResidueEligibleCounts(universe, degree, wheelDegree, modulus, norm) {
  const key = `${universe.q}:${universe.maxDegree}:${degree}:${wheelDegree}:${modulus}:counts`;
  const cached = polyResidueEligibleCountCache.get(key);
  if (cached) return cached;
  const classes = polynomialResidueClasses(universe, degree, wheelDegree, modulus);
  const eligible = new Int32Array(norm);
  for (const r of classes) if (r >= 0) eligible[r]++;
  polyResidueEligibleCountCache.set(key, eligible);
  return eligible;
}

function samplePolynomialResidueMatched(universe, degree, wheelDegree, modulus, norm, targetCounts, seed) {
  const random = rng(seed);
  const classes = polynomialResidueClasses(universe, degree, wheelDegree, modulus);
  const eligible = polynomialResidueEligibleCounts(universe, degree, wheelDegree, modulus, norm);
  const probs = new Float64Array(norm);
  for (let r = 1; r < norm; r++) probs[r] = eligible[r] > 0 ? Math.min(1, targetCounts[r] / eligible[r]) : 0;
  const out = [];
  const lead = universe.pow[degree];
  for (let lower = 0; lower < classes.length; lower++) {
    const r = classes[lower];
    if (r < 0) continue;
    if (random() < probs[r]) out.push(lead + lower);
  }
  return out;
}

function samplePolynomialResidueMatchedMany(universe, degree, wheelDegree, modulus, norm, targetCounts, seedList) {
  const classes = polynomialResidueClasses(universe, degree, wheelDegree, modulus);
  const eligible = polynomialResidueEligibleCounts(universe, degree, wheelDegree, modulus, norm);
  const probs = new Float64Array(norm);
  for (let r = 1; r < norm; r++) probs[r] = eligible[r] > 0 ? Math.min(1, targetCounts[r] / eligible[r]) : 0;
  const randoms = seedList.map((seed) => rng(seed));
  const outs = seedList.map(() => []);
  const lead = universe.pow[degree];
  for (let lower = 0; lower < classes.length; lower++) {
    const r = classes[lower];
    if (r < 0) continue;
    const p = probs[r];
    if (p <= 0) continue;
    const value = lead + lower;
    for (let i = 0; i < randoms.length; i++) {
      if (randoms[i]() < p) outs[i].push(value);
    }
  }
  return outs;
}

function analyzeMatrices(realValues, nullSets, specs) {
  const thresholds = quantileThresholds(normalizedGaps(realValues), gapBinCount);
  const rows = [];

  const realGapStates = gapStates(realValues, thresholds);
  const realGapMatrix = matrixFromStates(realGapStates, gapBinCount).matrix;
  const nullGapMatrices = nullSets.map((values) => matrixFromStates(gapStates(values, thresholds), gapBinCount).matrix);
  rows.push({
    id: "gap-bin-transition",
    kind: "gap",
    stateCount: gapBinCount,
    gapThresholds: thresholds,
    comparison: compareToNull(realGapMatrix, nullGapMatrices),
  });

  for (const spec of specs) {
    const realResidue = spec.residueStates(realValues);
    const realResidueMatrix = matrixFromStates(realResidue.states, realResidue.stateCount).matrix;
    const nullResidueMatrices = nullSets.map((values) => {
      const states = spec.residueStates(values);
      return matrixFromStates(states.states, states.stateCount).matrix;
    });
    rows.push({
      id: `${spec.id}-residue-transition`,
      kind: "residue",
      stateCount: realResidue.stateCount,
      classes: realResidue.classes,
      comparison: compareToNull(realResidueMatrix, nullResidueMatrices),
    });

    const realCombined = combinedStates(realResidue, realGapStates, gapBinCount);
    const realCombinedMatrix = matrixFromStates(realCombined.states, realCombined.stateCount).matrix;
    const nullCombinedMatrices = nullSets.map((values) => {
      const residue = spec.residueStates(values);
      const gapsForNull = gapStates(values, thresholds);
      const combined = combinedStates(residue, gapsForNull, gapBinCount);
      return matrixFromStates(combined.states, combined.stateCount).matrix;
    });
    rows.push({
      id: `${spec.id}-residue-gap-transition`,
      kind: "residue-gap",
      stateCount: realCombined.stateCount,
      residueStateCount: realResidue.stateCount,
      gapBinCount,
      classes: realResidue.classes,
      gapThresholds: thresholds,
      comparison: compareToNull(realCombinedMatrix, nullCombinedMatrices),
    });
  }
  return rows;
}

function buildRealTransitionRows(realValues, specs) {
  const thresholds = quantileThresholds(normalizedGaps(realValues), gapBinCount);
  const rows = [];

  const realGapStates = gapStates(realValues, thresholds);
  rows.push({
    id: "gap-bin-transition",
    kind: "gap",
    stateCount: gapBinCount,
    gapThresholds: thresholds,
    matrix: matrixFromStates(realGapStates, gapBinCount).matrix,
  });

  for (const spec of specs) {
    const realResidue = spec.residueStates(realValues);
    rows.push({
      id: `${spec.id}-residue-transition`,
      kind: "residue",
      stateCount: realResidue.stateCount,
      classes: realResidue.classes,
      matrix: matrixFromStates(realResidue.states, realResidue.stateCount).matrix,
    });

    const realCombined = combinedStates(realResidue, realGapStates, gapBinCount);
    rows.push({
      id: `${spec.id}-residue-gap-transition`,
      kind: "residue-gap",
      stateCount: realCombined.stateCount,
      residueStateCount: realResidue.stateCount,
      gapBinCount,
      classes: realResidue.classes,
      gapThresholds: thresholds,
      matrix: matrixFromStates(realCombined.states, realCombined.stateCount).matrix,
    });
  }
  return { thresholds, rows };
}

function normalizeCountMatrix(counts, total) {
  const out = new Float64Array(counts.length);
  if (total <= 0) return out;
  for (let i = 0; i < counts.length; i++) out[i] = counts[i] / total;
  return out;
}

function streamPolynomialWheelMatrices(universe, degree, wheelDegree, seedList, specs, thresholds) {
  const flags = polyEligibility(universe, degree, wheelDegree);
  let eligible = 0;
  for (const flag of flags) eligible += flag;
  const p = eligible > 0 ? universe.counts[degree] / eligible : 0;
  const lead = universe.pow[degree];

  const randomsFirst = seedList.map((seed) => rng(seed));
  const first = new Int32Array(seedList.length);
  const last = new Int32Array(seedList.length);
  const counts = new Int32Array(seedList.length);
  first.fill(-1);
  last.fill(-1);

  for (let lower = 0; lower < flags.length; lower++) {
    if (!flags[lower]) continue;
    const value = lead + lower;
    for (let i = 0; i < randomsFirst.length; i++) {
      if (randomsFirst[i]() >= p) continue;
      if (counts[i] === 0) first[i] = value;
      last[i] = value;
      counts[i]++;
    }
  }

  const means = new Float64Array(seedList.length);
  for (let i = 0; i < seedList.length; i++) {
    means[i] = counts[i] > 1 ? (last[i] - first[i]) / (counts[i] - 1) : 1;
  }

  const randomsSecond = seedList.map((seed) => rng(seed));
  const seedStates = seedList.map(() => ({
    hasPrev: false,
    prevValue: 0,
    prevGapState: -1,
    gapCounts: new Float64Array(gapBinCount * gapBinCount),
    gapTotal: 0,
    specs: specs.map((spec) => {
      const residueStateCount = spec.stateCount;
      const combinedStateCount = residueStateCount * gapBinCount;
      return {
        stateCount: residueStateCount,
        combinedStateCount,
        prevResidue: -1,
        prevCombined: -1,
        residueCounts: new Float64Array(residueStateCount * residueStateCount),
        residueTotal: 0,
        combinedCounts: new Float64Array(combinedStateCount * combinedStateCount),
        combinedTotal: 0,
      };
    }),
  }));

  for (let lower = 0; lower < flags.length; lower++) {
    if (!flags[lower]) continue;
    const value = lead + lower;
    for (let seedIndex = 0; seedIndex < randomsSecond.length; seedIndex++) {
      if (randomsSecond[seedIndex]() >= p) continue;
      const state = seedStates[seedIndex];
      const residues = specs.map((spec) => spec.stateForValue(value));
      if (state.hasPrev) {
        const gState = binIndex((value - state.prevValue) / means[seedIndex], thresholds);
        if (state.prevGapState >= 0) {
          state.gapCounts[state.prevGapState * gapBinCount + gState]++;
          state.gapTotal++;
        }
        for (let specIndex = 0; specIndex < specs.length; specIndex++) {
          const specState = state.specs[specIndex];
          const prevResidue = specState.prevResidue;
          const residue = residues[specIndex];
          if (prevResidue >= 0 && residue >= 0) {
            specState.residueCounts[prevResidue * specState.stateCount + residue]++;
            specState.residueTotal++;
            const combined = prevResidue * gapBinCount + gState;
            if (specState.prevCombined >= 0) {
              specState.combinedCounts[specState.prevCombined * specState.combinedStateCount + combined]++;
              specState.combinedTotal++;
            }
            specState.prevCombined = combined;
          }
          specState.prevResidue = residue;
        }
        state.prevGapState = gState;
      } else {
        for (let specIndex = 0; specIndex < specs.length; specIndex++) {
          state.specs[specIndex].prevResidue = residues[specIndex];
        }
      }
      state.prevValue = value;
      state.hasPrev = true;
    }
  }

  const matricesById = {
    "gap-bin-transition": seedStates.map((state) => normalizeCountMatrix(state.gapCounts, state.gapTotal)),
  };
  for (let specIndex = 0; specIndex < specs.length; specIndex++) {
    const spec = specs[specIndex];
    matricesById[`${spec.id}-residue-transition`] = seedStates.map((state) => {
      const specState = state.specs[specIndex];
      return normalizeCountMatrix(specState.residueCounts, specState.residueTotal);
    });
    matricesById[`${spec.id}-residue-gap-transition`] = seedStates.map((state) => {
      const specState = state.specs[specIndex];
      return normalizeCountMatrix(specState.combinedCounts, specState.combinedTotal);
    });
  }
  return matricesById;
}

function compareTransitionRows(realRows, matricesById) {
  return realRows.map((row) => {
    const { matrix, ...rest } = row;
    return {
      ...rest,
      comparison: compareToNull(matrix, matricesById[row.id] || []),
    };
  });
}

function rowById(rows) {
  return Object.fromEntries(rows.map((row) => [row.id, row]));
}

function classifySeries(blockRows) {
  const ids = Object.keys(blockRows[blockRows.length - 1].realRows);
  const out = [];
  for (const id of ids) {
    const ratios = blockRows.map((row) => row.realRows[id].comparison.ratio);
    const largest = blockRows.at(-1).realRows[id].comparison;
    const strongest = blockRows.at(-1).strongestRows[id].comparison;
    const signs = blockRows.map((row) => Math.sign(row.realRows[id].comparison.topCells[0]?.residual ?? 0));
    const stableTopSign = signs.every((sign) => sign !== 0 && sign === signs[0]);
    const sharpens = ratios[2] > ratios[1] && ratios[1] > ratios[0];
    out.push({
      id,
      ratios,
      largestRatio: largest.ratio,
      strongestLargestRatio: strongest.ratio,
      stableTopSign,
      sharpens,
      pass: strongest.ratio >= 2 && stableTopSign && sharpens,
      largestTopCells: largest.topCells,
      strongestTopCells: strongest.topCells,
    });
  }
  out.sort((a, b) => b.strongestLargestRatio - a.strongestLargestRatio);
  return out;
}

function renderMarkdown(summary) {
  const lines = ["# Two-Universes Transition Audit", ""];
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  for (const group of summary.groups) {
    lines.push(`## ${group.label}`);
    lines.push("");
    lines.push("| universe | top statistic | ratios across ranges | strongest largest ratio | verdict |");
    lines.push("| --- | --- | ---: | ---: | --- |");
    for (const side of ["polynomial", "integer"]) {
      const best = group[side].classified[0];
      lines.push(`| ${side} | ${best.id} | ${best.ratios.map((x) => x.toFixed(3)).join(", ")} | ${best.strongestLargestRatio.toFixed(3)} | ${best.pass ? "candidate" : "noise/local"} |`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(outDir, { recursive: true });

const maxInteger = Math.max(...blockSpecs.map((spec) => spec.q ** Math.max(...spec.degrees)));
console.error(`[transition] building real primes up to ${maxInteger}`);
const realPrimes = primesUpTo(maxInteger);

const groups = [];
for (const blockSpec of blockSpecs) {
  const maxDegree = Math.max(...blockSpec.degrees);
  const universe = buildPolynomialUniverse(blockSpec.q, maxDegree);
  const polySpecs = [];
  for (const modulusDegree of [1, 2]) {
    if (blockSpec.q ** modulusDegree <= 2) continue;
    const modulus = universe.irreduciblesByDegree[modulusDegree][0];
    polySpecs.push({
      id: `poly-mod-deg-${modulusDegree}`,
      modulusDegree,
      modulus,
      norm: blockSpec.q ** modulusDegree,
      stateCount: (blockSpec.q ** modulusDegree) - 1,
      stateForValue: (value) => {
        const r = polyMod(value, modulus, blockSpec.q);
        return r > 0 ? r - 1 : -1;
      },
      residueStates: (values) => polynomialResidueStates(values, blockSpec.q, modulus, modulusDegree),
    });
  }

  const polynomialBlocks = [];
  for (const degree of blockSpec.degrees) {
    console.error(`[transition] F_${blockSpec.q}[t] degree ${degree}`);
    const realValues = [...universe.irreduciblesByDegree[degree]];
    const realTransition = buildRealTransitionRows(realValues, polySpecs);
    const wheel1Matrices = streamPolynomialWheelMatrices(universe, degree, 1, seeds, polySpecs, realTransition.thresholds);
    const wheel2Matrices = streamPolynomialWheelMatrices(universe, degree, 2, seeds, polySpecs, realTransition.thresholds);
    const realRows = rowById(compareTransitionRows(realTransition.rows, wheel2Matrices));
    const wheel1Rows = rowById(compareTransitionRows(realTransition.rows, wheel1Matrices));
    const wheel2Rows = rowById(compareTransitionRows(realTransition.rows, wheel2Matrices));
    const residueMatchedRows = {};
    const strongestRows = {};
    for (const [id, row] of Object.entries(realRows)) {
      const candidates = [row, wheel1Rows[id], wheel2Rows[id]].filter(Boolean);
      strongestRows[id] = candidates.reduce((best, candidate) => (
        candidate.comparison.ratio < best.comparison.ratio ? candidate : best
      ), candidates[0]);
    }
    polynomialBlocks.push({ degree, realRows, wheel1Rows, wheel2Rows, residueMatchedRows, strongestRows });
  }

  const integerBlocks = [];
  for (const degree of blockSpec.degrees) {
    const lo = blockSpec.q ** (degree - 1);
    const hi = blockSpec.q ** degree;
    console.error(`[transition] Z interval (${lo}, ${hi}]`);
    const realValues = takeWindow(realPrimes, lo, hi);
    const specs = integerModuli.map((modulus) => ({
      id: `Z-mod-${modulus}`,
      modulus,
      residueStates: (values) => integerResidueStates(values, modulus),
    }));
    const wheel210 = seeds.map((seed) => sampleIntegerWheel(lo, hi, 210, seed));
    const realRows = rowById(analyzeMatrices(realValues, wheel210, specs));
    const wheelRows = rowById(analyzeMatrices(realValues, wheel210, specs));
    const residueMatchedRows = {};
    const strongestRows = {};
    for (const [id, row] of Object.entries(realRows)) {
      const candidates = [row, wheelRows[id]].filter(Boolean);
      strongestRows[id] = candidates.reduce((best, candidate) => (
        candidate.comparison.ratio < best.comparison.ratio ? candidate : best
      ), candidates[0]);
    }
    integerBlocks.push({ degree, lo, hi, realRows, wheelRows, residueMatchedRows, strongestRows });
  }

  groups.push({
    label: blockSpec.label,
    q: blockSpec.q,
    polynomial: {
      blocks: polynomialBlocks,
      classified: classifySeries(polynomialBlocks),
    },
    integer: {
      blocks: integerBlocks,
      classified: classifySeries(integerBlocks),
    },
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: {
    seeds,
    blockSpecs,
    integerModuli,
    gapBinCount,
    nulls: {
      polynomial: "sampled degree-1/2 local wheels; residue-count-matched controls are reserved for targeted follow-up rows",
      integer: "sampled W=210 wheel; residue-count-matched controls are reserved for targeted follow-up rows",
    },
  },
  groups,
};

const jsonFile = path.join(outDir, "transition-audit.json");
const mdFile = path.join(outDir, "transition-audit.md");
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));
fs.writeFileSync(mdFile, renderMarkdown(summary));
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, groups: groups.length }, null, 2));
