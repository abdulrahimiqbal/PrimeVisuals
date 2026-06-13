#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyMod,
} from "../src/core/ffield.js";
import {
  cramerPrimes,
  primesUpTo,
} from "../src/core/math.js";
import {
  autocorr,
  histogram,
  normalizedSpacings,
  residueChi,
} from "../src/core/stats.js";

const outDir = process.argv[2] || "logs/two-universes-artifacts";
const q3Degree = Number(process.argv[3] || 13);
const q2Degree = Number(process.argv[4] || 24);
const nullSeeds = [12345, 271828, 314159, 161803, 424242];

const THRESHOLDS = {
  residueAbsZ: 4,
  gapAutocorrAbsZ: 4,
  spacingL1AboveNull: 0.05,
  sharedRelativeTolerance: 0.5,
};

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

function polyPrimeSequence(q, degree) {
  const universe = buildPolynomialUniverse(q, degree);
  const values = [];
  for (let d = 1; d <= degree; d++) {
    for (const f of universe.irreduciblesByDegree[d]) values.push(f);
  }
  return { universe, values };
}

function cramerPolynomialSequence(q, degree, seed) {
  const universe = buildPolynomialUniverse(q, degree);
  const random = rng(seed);
  const values = [];
  for (let d = 1; d <= degree; d++) {
    const p = universe.counts[d] / universe.pow[d];
    const lead = universe.pow[d];
    for (let lower = 0; lower < universe.pow[d]; lower++) {
      if (random() < p) values.push(lead + lower);
    }
  }
  return values;
}

function gaps(values) {
  const out = new Float64Array(Math.max(0, values.length - 1));
  for (let i = 0; i < out.length; i++) out[i] = values[i + 1] - values[i];
  return out;
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
  return l1;
}

function gapAutocorrLag1(values) {
  const gs = gaps(values);
  if (gs.length < 4) return 0;
  return autocorr(gs, 1)[1];
}

function polyResidueChi(values, q, modulus) {
  const degree = Math.round(Math.log(modulus) / Math.log(q));
  const classes = [];
  const norm = q ** degree;
  for (let r = 1; r < norm; r++) classes.push({ r, count: 0 });
  const rMap = new Map(classes.map((c) => [c.r, c]));
  let total = 0;
  for (const f of values) {
    const r = polyMod(f, modulus, q);
    const cls = rMap.get(r);
    if (!cls) continue;
    cls.count++;
    total++;
  }
  const expected = classes.length ? total / classes.length : 0;
  let chi2 = 0, worstDev = 0, worstR = classes[0]?.r ?? 1;
  for (const c of classes) {
    const diff = c.count - expected;
    if (expected > 0) chi2 += (diff * diff) / expected;
    const dev = expected > 0 ? diff / Math.sqrt(expected) : 0;
    if (Math.abs(dev) > Math.abs(worstDev)) {
      worstDev = dev;
      worstR = c.r;
    }
  }
  const df = classes.length - 1;
  const z = df > 0 ? (chi2 - df) / Math.sqrt(2 * df) : 0;
  return { classes, expected, chi2, df, z, worst: { r: worstR, dev: worstDev } };
}

function mean(rows, key) {
  return rows.reduce((s, row) => s + row[key], 0) / rows.length;
}

function nullSummary(values) {
  const absValues = values.map((value) => Math.abs(value));
  return {
    mean: values.reduce((s, value) => s + value, 0) / values.length,
    meanAbs: absValues.reduce((s, value) => s + value, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function classify({ kind, fqLarge, zLarge, fqNull, zNull, fqSmall, zSmall }) {
  let strongF = false, strongZ = false;
  let stableF = false, stableZ = false;
  let comparable = false;

  if (kind === "spacing") {
    strongF = fqLarge > fqNull.mean + THRESHOLDS.spacingL1AboveNull;
    strongZ = zLarge > zNull.mean + THRESHOLDS.spacingL1AboveNull;
    stableF = Math.abs(fqLarge - fqSmall) <= Math.max(0.12, 0.75 * Math.max(fqLarge, fqSmall));
    stableZ = Math.abs(zLarge - zSmall) <= Math.max(0.12, 0.75 * Math.max(zLarge, zSmall));
    comparable = Math.abs(fqLarge - zLarge) <= THRESHOLDS.sharedRelativeTolerance * Math.max(fqLarge, zLarge, 1e-9);
  } else {
    const fAbs = Math.abs(fqLarge);
    const zAbs = Math.abs(zLarge);
    const fNullAbs = fqNull.meanAbs;
    const zNullAbs = zNull.meanAbs;
    const threshold = kind === "residue" ? THRESHOLDS.residueAbsZ : THRESHOLDS.gapAutocorrAbsZ;
    strongF = fAbs > Math.max(threshold, 2 * fNullAbs);
    strongZ = zAbs > Math.max(threshold, 2 * zNullAbs);
    stableF = Math.sign(fqLarge) === Math.sign(fqSmall) && Math.abs(fqSmall) >= 0.35 * fAbs;
    stableZ = Math.sign(zLarge) === Math.sign(zSmall) && Math.abs(zSmall) >= 0.35 * zAbs;
    comparable = Math.sign(fqLarge) === Math.sign(zLarge)
      && Math.abs(fAbs - zAbs) <= THRESHOLDS.sharedRelativeTolerance * Math.max(fAbs, zAbs, 1e-9);
  }

  if (strongF && strongZ && stableF && stableZ && comparable) return "SHARED-LAW candidate";
  if ((strongF && stableF) || (strongZ && stableZ)) return "DIVERGENCE candidate";
  return "noise";
}

function integerNFor(q, degree) {
  return q ** degree;
}

function buildRangeContext(q, smallDegree, largeDegree) {
  const smallN = integerNFor(q, smallDegree);
  const largeN = integerNFor(q, largeDegree);
  const smallPoly = polyPrimeSequence(q, smallDegree);
  const largePoly = polyPrimeSequence(q, largeDegree);
  return {
    q,
    smallDegree,
    largeDegree,
    smallN,
    largeN,
    smallPoly,
    largePoly,
    smallInteger: primesUpTo(smallN),
    largeInteger: primesUpTo(largeN),
  };
}

function makeRow({
  context,
  id,
  statistic,
  kind,
  integerModulus,
  polyMetric,
  integerMetric,
  notes,
}) {
  const {
    q,
    smallDegree,
    largeDegree,
    smallN,
    largeN,
    smallPoly,
    largePoly,
    smallInteger,
    largeInteger,
    polyNulls,
    integerNulls,
  } = context;
  const fqSmall = polyMetric(smallPoly.universe, smallPoly.values);
  const fqLarge = polyMetric(largePoly.universe, largePoly.values);
  const zSmall = integerMetric(smallInteger, integerModulus);
  const zLarge = integerMetric(largeInteger, integerModulus);
  const fqNull = nullSummary(polyNulls.map((values) => polyMetric(largePoly.universe, values)));
  const zNull = nullSummary(integerNulls.map((values) => integerMetric(values, integerModulus)));
  const verdict = classify({ kind, fqLarge, zLarge, fqNull, zNull, fqSmall, zSmall });
  return {
    id,
    statistic,
    universe: `F_${q}[t]`,
    integerRange: largeN,
    rangeCheck: {
      smaller: { degree: smallDegree, integerN: smallN, fqValue: fqSmall, zValue: zSmall },
      larger: { degree: largeDegree, integerN: largeN, fqValue: fqLarge, zValue: zLarge },
    },
    fqValue: fqLarge,
    zValue: zLarge,
    matchedNull: { fq: fqNull, z: zNull },
    verdict,
    star: verdict !== "noise",
    notes,
  };
}

function residueRows(context) {
  if (context.q !== 3) return [];
  const { q, largeDegree, largePoly } = context;
  const universe = largePoly.universe;
  const rows = [];
  const specs = [
    { polyDegree: 1, integerModulus: 3 },
    { polyDegree: 2, integerModulus: 15 },
  ];
  for (const spec of specs) {
    const modulus = universe.irreduciblesByDegree[spec.polyDegree][0];
    rows.push(makeRow({
      context,
      id: `F${q}-residue-deg${spec.polyDegree}`,
      statistic: `residue chi z-score; poly modulus degree ${spec.polyDegree}; Z modulus ${spec.integerModulus}`,
      kind: "residue",
      integerModulus: spec.integerModulus,
      polyMetric: (_universe, values) => polyResidueChi(values, q, modulus).z,
      integerMetric: (values, integerModulus) => residueChi(values, integerModulus).z,
      notes: `[F_${q}[t]: measured] chi-square over nonzero residue classes modulo an irreducible polynomial; [Z: measured] uses an integer modulus with the same number of coprime classes when possible.`,
    }));
  }
  return rows;
}

function gapRow(context) {
  const { q } = context;
  return makeRow({
    context,
    id: `F${q}-gap-autocorr-lag1`,
    statistic: "gap autocorrelation lag 1 z-score",
    kind: "gapcorr",
    integerModulus: null,
    polyMetric: (_universe, values) => gapAutocorrLag1(values),
    integerMetric: (values) => gapAutocorrLag1(values),
    notes: `[F_${q}[t]: measured] gaps are consecutive encoding gaps in degree/value order; [Z: measured] gaps are consecutive prime gaps.`,
  });
}

function spacingRow(context) {
  const { q } = context;
  return makeRow({
    context,
    id: `F${q}-spacing-l1`,
    statistic: "spacing histogram L1 distance from Exp(1)",
    kind: "spacing",
    integerModulus: null,
    polyMetric: (_universe, values) => spacingL1(values),
    integerMetric: (values) => spacingL1(values),
    notes: `[F_${q}[t]: measured] and [Z: measured] spacings are normalized consecutive gaps; null is matched Cramer-style sampling.`,
  });
}

function metricSpecs(context) {
  const specs = [];
  if (context.q === 3) {
    const universe = context.largePoly.universe;
    for (const spec of [
      { polyDegree: 1, integerModulus: 3 },
      { polyDegree: 2, integerModulus: 15 },
    ]) {
      const modulus = universe.irreduciblesByDegree[spec.polyDegree][0];
      specs.push({
        id: `F${context.q}-residue-deg${spec.polyDegree}`,
        statistic: `residue chi z-score; poly modulus degree ${spec.polyDegree}; Z modulus ${spec.integerModulus}`,
        kind: "residue",
        integerModulus: spec.integerModulus,
        polyMetric: (_universe, values) => polyResidueChi(values, context.q, modulus).z,
        integerMetric: (values, integerModulus) => residueChi(values, integerModulus).z,
        notes: `[F_${context.q}[t]: measured] chi-square over nonzero residue classes modulo an irreducible polynomial; [Z: measured] uses an integer modulus with the same number of coprime classes when possible.`,
      });
    }
  }
  specs.push({
    id: `F${context.q}-gap-autocorr-lag1`,
    statistic: "gap autocorrelation lag 1 z-score",
    kind: "gapcorr",
    integerModulus: null,
    polyMetric: (_universe, values) => gapAutocorrLag1(values),
    integerMetric: (values) => gapAutocorrLag1(values),
    notes: `[F_${context.q}[t]: measured] gaps are consecutive encoding gaps in degree/value order; [Z: measured] gaps are consecutive prime gaps.`,
  });
  specs.push({
    id: `F${context.q}-spacing-l1`,
    statistic: "spacing histogram L1 distance from Exp(1)",
    kind: "spacing",
    integerModulus: null,
    polyMetric: (_universe, values) => spacingL1(values),
    integerMetric: (values) => spacingL1(values),
    notes: `[F_${context.q}[t]: measured] and [Z: measured] spacings are normalized consecutive gaps; null is matched Cramer-style sampling.`,
  });
  return specs;
}

function materializeRows(context) {
  const specs = metricSpecs(context);
  const partial = specs.map((spec) => ({
    ...spec,
    fqSmall: spec.polyMetric(context.smallPoly.universe, context.smallPoly.values),
    fqLarge: spec.polyMetric(context.largePoly.universe, context.largePoly.values),
    zSmall: spec.integerMetric(context.smallInteger, spec.integerModulus),
    zLarge: spec.integerMetric(context.largeInteger, spec.integerModulus),
    fqNullValues: [],
    zNullValues: [],
  }));

  for (const seed of nullSeeds) {
    const polyNull = cramerPolynomialSequence(context.q, context.largeDegree, seed);
    const integerNull = cramerPrimes(context.largeN, seed);
    for (const row of partial) {
      row.fqNullValues.push(row.polyMetric(context.largePoly.universe, polyNull));
      row.zNullValues.push(row.integerMetric(integerNull, row.integerModulus));
    }
  }

  return partial.map((row) => {
    const fqNull = nullSummary(row.fqNullValues);
    const zNull = nullSummary(row.zNullValues);
    const verdict = classify({
      kind: row.kind,
      fqLarge: row.fqLarge,
      zLarge: row.zLarge,
      fqNull,
      zNull,
      fqSmall: row.fqSmall,
      zSmall: row.zSmall,
    });
    return {
      id: row.id,
      statistic: row.statistic,
      universe: `F_${context.q}[t]`,
      integerRange: context.largeN,
      rangeCheck: {
        smaller: { degree: context.smallDegree, integerN: context.smallN, fqValue: row.fqSmall, zValue: row.zSmall },
        larger: { degree: context.largeDegree, integerN: context.largeN, fqValue: row.fqLarge, zValue: row.zLarge },
      },
      fqValue: row.fqLarge,
      zValue: row.zLarge,
      matchedNull: { fq: fqNull, z: zNull },
      verdict,
      star: verdict !== "noise",
      notes: row.notes,
    };
  });
}

fs.mkdirSync(outDir, { recursive: true });

const qSpecs = [
  { q: 3, degree: q3Degree },
  { q: 2, degree: q2Degree },
];

const rows = [];
for (const { q, degree } of qSpecs) {
  const context = buildRangeContext(q, degree - 1, degree);
  rows.push(...materializeRows(context));
}

const summary = {
  generatedAt: new Date().toISOString(),
  parameters: { q3Degree, q2Degree, nullSeeds },
  thresholds: THRESHOLDS,
  rows,
};

const jsonFile = path.join(outDir, "divergence-summary.json");
const mdFile = path.join(outDir, "divergence-summary.md");
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));

const table = [
  "| statistic | F_q[t] value | Z value | matched null | verdict |",
  "| --- | ---: | ---: | --- | --- |",
  ...rows.map((row) => {
    const mark = row.star ? "STAR " : "";
    const fNull = row.matchedNull.fq.meanAbs !== undefined ? row.matchedNull.fq.meanAbs : row.matchedNull.fq.mean;
    const zNull = row.matchedNull.z.meanAbs !== undefined ? row.matchedNull.z.meanAbs : row.matchedNull.z.mean;
    return `| ${row.universe} ${row.statistic} | ${row.fqValue.toFixed(6)} | ${row.zValue.toFixed(6)} | F null ${fNull.toFixed(6)}; Z null ${zNull.toFixed(6)} | ${mark}${row.verdict} |`;
  }),
].join("\n");

fs.writeFileSync(mdFile, `# Two-Universes Divergence Summary\n\n${table}\n`);
console.log(JSON.stringify({ ok: true, jsonFile, mdFile, rows: rows.length }, null, 2));
