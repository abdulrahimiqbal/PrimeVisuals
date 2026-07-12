#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polyMod,
  polyMul,
  polySub,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 2_000_000);
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q2MaxDegree = Number(process.argv[4] || 22);
const q3MaxDegree = Number(process.argv[5] || 13);

const seeds = [12345, 271828, 314159, 161803, 424242];
const integerShifts = [6, 12, 18, 24, 30, 42, 60, 90];
const integerLocalW = 210;
const compositeW = 30030;
const minStateCount = 25;
const minEdgeSupport = 3;
const localRatePriorWeight = 16;

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

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} from pool of ${pool.length}`);
  const rnd = rng(seed);
  const copy = pool.slice();
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rnd() * (copy.length - i));
    const value = copy[j];
    copy[j] = copy[i];
    copy[i] = value;
    out[i] = value;
  }
  out.sort((a, b) => a - b);
  return out;
}

function clampProbability(p) {
  return Math.min(1 - 1e-9, Math.max(1e-9, p));
}

function integerCompositePool(limit, primeFlags) {
  const out = [];
  for (let n = 5; n <= limit; n++) {
    if (primeFlags[n]) continue;
    if (gcd(n, compositeW) !== 1) continue;
    out.push(n);
  }
  return out;
}

function buildLocalRateTables(vertices, shifts, edgeAt, stateKey) {
  return shifts.map((h) => {
    let eligible = 0;
    let edges = 0;
    const states = new Map();
    for (const v of vertices) {
      eligible++;
      const edge = edgeAt(v, h);
      edges += edge;
      const key = stateKey(v, h);
      let row = states.get(key);
      if (!row) {
        row = { eligible: 0, edges: 0 };
        states.set(key, row);
      }
      row.eligible++;
      row.edges += edge;
    }
    const globalRate = edges / Math.max(1, eligible);
    const table = new Map();
    for (const [key, row] of states) {
      table.set(key, {
        eligible: row.eligible,
        edges: row.edges,
        rate: (row.edges + localRatePriorWeight * globalRate) / Math.max(1, row.eligible + localRatePriorWeight),
      });
    }
    return { h, eligible, edges, globalRate, states: table };
  });
}

function localResidualTensor(vertices, shifts, tables, edgeAt, stateKey) {
  const k = shifts.length;
  const sums = new Float64Array(k);
  const matrix = Array.from({ length: k }, () => new Float64Array(k));
  let fallbackUses = 0;
  let totalUses = 0;
  for (const v of vertices) {
    const z = new Float64Array(k);
    for (let i = 0; i < k; i++) {
      const table = tables[i];
      const key = stateKey(v, shifts[i]);
      const row = table.states.get(key);
      const useLocal = row
        && row.eligible >= minStateCount
        && row.edges >= minEdgeSupport
        && row.eligible - row.edges >= minEdgeSupport;
      const p = clampProbability(useLocal ? row.rate : table.globalRate);
      if (!useLocal) fallbackUses++;
      totalUses++;
      z[i] = (edgeAt(v, shifts[i]) - p) / Math.sqrt(p * (1 - p));
      sums[i] += z[i];
    }
    for (let i = 0; i < k; i++) {
      for (let j = i; j < k; j++) matrix[i][j] += z[i] * z[j];
    }
  }
  const n = vertices.length;
  let offdiagSum = 0;
  let offdiagCount = 0;
  let maxAbsOffdiag = 0;
  const normalized = Array.from({ length: k }, () => new Array(k).fill(0));
  for (let i = 0; i < k; i++) {
    for (let j = i; j < k; j++) {
      const value = matrix[i][j] / Math.max(1, n);
      normalized[i][j] = value;
      normalized[j][i] = value;
      if (i !== j) {
        offdiagSum += value * value;
        offdiagCount++;
        maxAbsOffdiag = Math.max(maxAbsOffdiag, Math.abs(value));
      }
    }
  }
  const meanResiduals = Array.from(sums, (sum) => sum / Math.max(1, n));
  return {
    vertices: n,
    offdiagRms: Math.sqrt(offdiagSum / Math.max(1, offdiagCount)),
    maxAbsOffdiag,
    meanAbsResidual: mean(meanResiduals.map(Math.abs)),
    maxAbsMeanResidual: Math.max(...meanResiduals.map(Math.abs)),
    diagonalMean: mean(normalized.map((row, i) => row[i])),
    fallbackFraction: fallbackUses / Math.max(1, totalUses),
    matrix: normalized,
    meanResiduals,
  };
}

function summarizeControls(rows) {
  return {
    offdiagRms: range(rows.map((row) => row.offdiagRms)),
    maxAbsOffdiag: range(rows.map((row) => row.maxAbsOffdiag)),
    meanAbsResidual: range(rows.map((row) => row.meanAbsResidual)),
    maxAbsMeanResidual: range(rows.map((row) => row.maxAbsMeanResidual)),
    fallbackFraction: range(rows.map((row) => row.fallbackFraction)),
  };
}

function runIntegerAudit() {
  const maxShift = Math.max(...integerShifts);
  const flags = sieve(N + maxShift);
  const primes = primesUpTo(N + maxShift).filter((p) => p <= N);
  const split = Math.floor(N / 2);
  const train = primes.filter((p) => p <= split && p + maxShift <= split);
  const holdout = primes.filter((p) => p > split && p + maxShift <= N);
  const stateKey = (v) => v % integerLocalW;
  const edgeAt = (v, h) => flags[v + h] ? 1 : 0;
  const tables = buildLocalRateTables(train, integerShifts, edgeAt, stateKey);
  const real = localResidualTensor(holdout, integerShifts, tables, edgeAt, stateKey);
  const cramer = seeds.map((seed) => {
    const labels = cramerPrimes(N + maxShift, seed).filter((p) => p <= N);
    const cflags = new Uint8Array(N + maxShift + 1);
    for (const label of labels) cflags[label] = 1;
    const ctrain = labels.filter((p) => p <= split && p + maxShift <= split);
    const choldout = labels.filter((p) => p > split && p + maxShift <= N);
    const cedgeAt = (v, h) => cflags[v + h] ? 1 : 0;
    const ctables = buildLocalRateTables(ctrain, integerShifts, cedgeAt, stateKey);
    return { seed, ...localResidualTensor(choldout, integerShifts, ctables, cedgeAt, stateKey) };
  });
  const composites = integerCompositePool(N, flags);
  const composite = seeds.map((seed) => {
    const labels = sampleWithoutReplacement(composites, primes.length, seed);
    const cflags = new Uint8Array(N + maxShift + 1);
    for (const label of labels) cflags[label] = 1;
    const ctrain = labels.filter((p) => p <= split && p + maxShift <= split);
    const choldout = labels.filter((p) => p > split && p + maxShift <= N);
    const cedgeAt = (v, h) => cflags[v + h] ? 1 : 0;
    const ctables = buildLocalRateTables(ctrain, integerShifts, cedgeAt, stateKey);
    return { seed, ...localResidualTensor(choldout, integerShifts, ctables, cedgeAt, stateKey) };
  });
  return {
    N,
    split,
    localState: `n mod ${integerLocalW}`,
    shifts: integerShifts,
    labels: primes.length,
    trainVertices: train.length,
    holdoutVertices: holdout.length,
    trainRates: tables.map((table) => ({
      shift: table.h,
      eligible: table.eligible,
      edges: table.edges,
      globalRate: table.globalRate,
      states: table.states.size,
    })),
    holdout: real,
    cramer,
    composite,
    controls: {
      cramer: summarizeControls(cramer),
      composite: summarizeControls(composite),
    },
  };
}

function polyLinearProduct(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + a, q);
  return product;
}

function uniquePolynomialShifts(q) {
  const base = polyLinearProduct(q);
  const lows = q === 2 ? [1, 2, 3, 5, 7, 11] : [1, 2, 3, 4, 5, 7];
  const seen = new Set();
  const shifts = [];
  for (const low of lows) {
    for (const h of [polyMul(base, low, q), polySub(0, polyMul(base, low, q), q)]) {
      if (!h || seen.has(h)) continue;
      seen.add(h);
      shifts.push(h);
    }
  }
  return shifts;
}

function polynomialPool(universe, degree, mode) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  if (mode === "irreducible") return universe.irreduciblesByDegree[degree].slice();
  const out = [];
  for (let lower = 0; lower < flags.length; lower++) {
    if (mode === "monic" || (mode === "reducible" && !flags[lower])) out.push(lead + lower);
  }
  return out;
}

function smallLocalModuli(universe) {
  const out = [];
  for (let degree = 1; degree <= Math.min(2, universe.maxDegree); degree++) {
    for (const poly of universe.irreduciblesByDegree[degree]) out.push(poly);
  }
  return out;
}

function makePolynomialStateKey(q, moduli, shifts) {
  const remainderCache = new Map();
  const shiftRemainders = new Map(shifts.map((h) => [h, moduli.map((m) => polyMod(h, m, q))]));
  function remainders(poly) {
    let row = remainderCache.get(poly);
    if (!row) {
      row = moduli.map((m) => polyMod(poly, m, q));
      remainderCache.set(poly, row);
    }
    return row;
  }
  return (f, h) => {
    const rem = remainders(f);
    const hRem = shiftRemainders.get(h);
    let mask = 0;
    for (let i = 0; i < moduli.length; i++) {
      if (polyAdd(rem[i], hRem[i], q) === 0) mask |= 1 << i;
    }
    return mask;
  };
}

function polynomialVerticesInRange(labels, universe, degree, shifts) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const pow = universe.pow[degree];
  return labels.filter((f) => shifts.every((h) => {
    const g = polyAdd(f, h, q);
    return g >= lead && g < lead + pow;
  }));
}

function runPolynomialAudit(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const shifts = uniquePolynomialShifts(q);
  const moduli = smallLocalModuli(universe);
  const trainDegree = maxDegree - 1;
  const holdoutDegree = maxDegree;
  const trainLabels = polynomialPool(universe, trainDegree, "irreducible");
  const holdoutLabels = polynomialPool(universe, holdoutDegree, "irreducible");
  const train = polynomialVerticesInRange(trainLabels, universe, trainDegree, shifts);
  const holdout = polynomialVerticesInRange(holdoutLabels, universe, holdoutDegree, shifts);
  const stateKey = makePolynomialStateKey(q, moduli, shifts);
  const edgeAt = (labels) => {
    const labelSet = new Set(labels);
    return (f, h) => labelSet.has(polyAdd(f, h, q)) ? 1 : 0;
  };
  const trainEdgeAt = edgeAt(trainLabels);
  const holdoutEdgeAt = edgeAt(holdoutLabels);
  const tables = buildLocalRateTables(train, shifts, trainEdgeAt, stateKey);
  const real = localResidualTensor(holdout, shifts, tables, holdoutEdgeAt, stateKey);

  function control(seed, mode, saltTrain, saltHoldout) {
    const trainPool = polynomialPool(universe, trainDegree, mode);
    const holdoutPool = polynomialPool(universe, holdoutDegree, mode);
    const sampledTrain = sampleWithoutReplacement(trainPool, trainLabels.length, seed ^ saltTrain);
    const sampledHoldout = sampleWithoutReplacement(holdoutPool, holdoutLabels.length, seed ^ saltHoldout);
    const ctrain = polynomialVerticesInRange(sampledTrain, universe, trainDegree, shifts);
    const choldout = polynomialVerticesInRange(sampledHoldout, universe, holdoutDegree, shifts);
    const ctrainEdgeAt = edgeAt(sampledTrain);
    const choldoutEdgeAt = edgeAt(sampledHoldout);
    const ctables = buildLocalRateTables(ctrain, shifts, ctrainEdgeAt, stateKey);
    return { seed, ...localResidualTensor(choldout, shifts, ctables, choldoutEdgeAt, stateKey) };
  }

  const randomMonic = seeds.map((seed) => control(seed, "monic", 0x517cc1b7, 0x94d049bb));
  const randomReducible = seeds.map((seed) => control(seed, "reducible", 0x9e3779b9, 0x243f6a88));
  return {
    q,
    trainDegree,
    holdoutDegree,
    localState: `divisibility mask of f+a by ${moduli.length} irreducibles of degree <=2`,
    shifts: shifts.map((h) => polyToString(h, q)),
    localModuli: moduli.map((m) => polyToString(m, q)),
    trainLabels: trainLabels.length,
    holdoutLabels: holdoutLabels.length,
    trainVertices: train.length,
    holdoutVertices: holdout.length,
    trainRates: tables.map((table, i) => ({
      shift: polyToString(shifts[i], q),
      eligible: table.eligible,
      edges: table.edges,
      globalRate: table.globalRate,
      states: table.states.size,
    })),
    holdout: real,
    randomMonic,
    randomReducible,
    controls: {
      randomMonic: summarizeControls(randomMonic),
      randomReducible: summarizeControls(randomReducible),
    },
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Local-state centered multi-shift tensor audit", "");
  lines.push("Candidate:");
  lines.push("condition each shift's edge baseline on a local residue/factor state before scoring holdout residual covariance.", "");
  lines.push("```text");
  lines.push("Z_h(v) = (1_{v+h is prime-like} - p_h(train, local_state(v,h))) / sqrt(p_h(1-p_h))");
  lines.push("score = RMS_{h != k} mean_holdout Z_h(v) Z_k(v)");
  lines.push("```", "");
  lines.push(`Minimum train count per local state: ${minStateCount}; minimum edge/non-edge support: ${minEdgeSupport}; local rates are smoothed toward the per-shift global rate with prior weight ${localRatePriorWeight}. Unsupported states fall back to the global per-shift rate.`, "");
  lines.push("## Integer side", "");
  lines.push(`N=${report.integer.N}, split=${report.integer.split}, labels=${report.integer.labels}, local state=${report.integer.localState}`);
  lines.push("");
  lines.push("| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual | fallback frac |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| real primes | ${fmt(report.integer.holdout.offdiagRms)} | ${fmt(report.integer.holdout.maxAbsOffdiag)} | ${fmt(report.integer.holdout.meanAbsResidual)} | ${fmt(report.integer.holdout.maxAbsMeanResidual)} | ${fmt(report.integer.holdout.fallbackFraction)} |`);
  lines.push(`| Cramer controls | ${fmt(report.integer.controls.cramer.offdiagRms[0])}..${fmt(report.integer.controls.cramer.offdiagRms[1])} | ${fmt(report.integer.controls.cramer.maxAbsOffdiag[0])}..${fmt(report.integer.controls.cramer.maxAbsOffdiag[1])} | ${fmt(report.integer.controls.cramer.meanAbsResidual[0])}..${fmt(report.integer.controls.cramer.meanAbsResidual[1])} | ${fmt(report.integer.controls.cramer.maxAbsMeanResidual[0])}..${fmt(report.integer.controls.cramer.maxAbsMeanResidual[1])} | ${fmt(report.integer.controls.cramer.fallbackFraction[0])}..${fmt(report.integer.controls.cramer.fallbackFraction[1])} |`);
  lines.push(`| composite controls | ${fmt(report.integer.controls.composite.offdiagRms[0])}..${fmt(report.integer.controls.composite.offdiagRms[1])} | ${fmt(report.integer.controls.composite.maxAbsOffdiag[0])}..${fmt(report.integer.controls.composite.maxAbsOffdiag[1])} | ${fmt(report.integer.controls.composite.meanAbsResidual[0])}..${fmt(report.integer.controls.composite.meanAbsResidual[1])} | ${fmt(report.integer.controls.composite.maxAbsMeanResidual[0])}..${fmt(report.integer.controls.composite.maxAbsMeanResidual[1])} | ${fmt(report.integer.controls.composite.fallbackFraction[0])}..${fmt(report.integer.controls.composite.fallbackFraction[1])} |`);
  lines.push("");
  for (const field of report.functionFields) {
    lines.push(`## F_${field.q}[t] side`, "");
    lines.push(`train degree=${field.trainDegree}, holdout degree=${field.holdoutDegree}, local state=${field.localState}`);
    lines.push("");
    lines.push("| group | offdiag rms | max offdiag | mean abs residual | max abs mean residual | fallback frac |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
    lines.push(`| real irreducibles | ${fmt(field.holdout.offdiagRms)} | ${fmt(field.holdout.maxAbsOffdiag)} | ${fmt(field.holdout.meanAbsResidual)} | ${fmt(field.holdout.maxAbsMeanResidual)} | ${fmt(field.holdout.fallbackFraction)} |`);
    lines.push(`| random monic controls | ${fmt(field.controls.randomMonic.offdiagRms[0])}..${fmt(field.controls.randomMonic.offdiagRms[1])} | ${fmt(field.controls.randomMonic.maxAbsOffdiag[0])}..${fmt(field.controls.randomMonic.maxAbsOffdiag[1])} | ${fmt(field.controls.randomMonic.meanAbsResidual[0])}..${fmt(field.controls.randomMonic.meanAbsResidual[1])} | ${fmt(field.controls.randomMonic.maxAbsMeanResidual[0])}..${fmt(field.controls.randomMonic.maxAbsMeanResidual[1])} | ${fmt(field.controls.randomMonic.fallbackFraction[0])}..${fmt(field.controls.randomMonic.fallbackFraction[1])} |`);
    lines.push(`| random reducible controls | ${fmt(field.controls.randomReducible.offdiagRms[0])}..${fmt(field.controls.randomReducible.offdiagRms[1])} | ${fmt(field.controls.randomReducible.maxAbsOffdiag[0])}..${fmt(field.controls.randomReducible.maxAbsOffdiag[1])} | ${fmt(field.controls.randomReducible.meanAbsResidual[0])}..${fmt(field.controls.randomReducible.meanAbsResidual[1])} | ${fmt(field.controls.randomReducible.maxAbsMeanResidual[0])}..${fmt(field.controls.randomReducible.maxAbsMeanResidual[1])} | ${fmt(field.controls.randomReducible.fallbackFraction[0])}..${fmt(field.controls.randomReducible.fallbackFraction[1])} |`);
    lines.push("");
  }
  lines.push(`JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function renderSvg(report) {
  const width = 1120, height = 640, pad = 70;
  const rows = [
    { label: "Z real", value: report.integer.holdout.offdiagRms, color: "#67e8f9" },
    { label: "Z Cramer max", value: report.integer.controls.cramer.offdiagRms[1], color: "#fb7185" },
    { label: "Z composite max", value: report.integer.controls.composite.offdiagRms[1], color: "#fbbf24" },
    ...report.functionFields.flatMap((field) => [
      { label: `F_${field.q} real`, value: field.holdout.offdiagRms, color: field.q === 2 ? "#a78bfa" : "#34d399" },
      { label: `F_${field.q} monic max`, value: field.controls.randomMonic.offdiagRms[1], color: "#94a3b8" },
      { label: `F_${field.q} reducible max`, value: field.controls.randomReducible.offdiagRms[1], color: "#c084fc" },
    ]),
  ];
  const max = Math.max(...rows.map((row) => row.value)) * 1.12;
  const barW = (width - 2 * pad) / rows.length;
  const bars = rows.map((row, i) => {
    const h = (row.value / max) * (height - 2 * pad - 70);
    const x = pad + i * barW + 8;
    const y = height - pad - h;
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(12, barW - 16).toFixed(2)}" height="${h.toFixed(2)}" fill="${row.color}" opacity="0.82"/><text transform="translate(${(x + barW / 2 - 8).toFixed(2)} ${height - pad + 8}) rotate(60)" fill="#cbd5e1" font-size="12">${row.label}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${pad}" y="34" fill="#f8fafc" font-size="19" font-weight="700">local-state centered tensor off-diagonal RMS</text>
<text x="${pad}" y="58" fill="#94a3b8" font-size="13">residue/factor-state train baselines; lower is more null-like</text>
<line x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}" stroke="#334155"/>
${bars}
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[local-state-tensor] integer side N=${N}`);
const integer = runIntegerAudit();
console.error(`[local-state-tensor] function fields F_2 degree=${q2MaxDegree}, F_3 degree=${q3MaxDegree}`);
const functionFields = [
  runPolynomialAudit(2, q2MaxDegree),
  runPolynomialAudit(3, q3MaxDegree),
];

const base = `cycle-004-local-state-centered-tensor-${N}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};

const report = {
  candidate: "local-state centered multi-shift residual tensor",
  generatedAt: new Date().toISOString(),
  N,
  q2MaxDegree,
  q3MaxDegree,
  integerLocalW,
  compositeW,
  minStateCount,
  minEdgeSupport,
  localRatePriorWeight,
  seeds,
  integer,
  functionFields,
  paths,
};

fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  integer: {
    offdiagRms: integer.holdout.offdiagRms,
    cramerRange: integer.controls.cramer.offdiagRms,
    compositeRange: integer.controls.composite.offdiagRms,
    fallbackFraction: integer.holdout.fallbackFraction,
  },
  functionFields: functionFields.map((field) => ({
    q: field.q,
    holdoutDegree: field.holdoutDegree,
    offdiagRms: field.holdout.offdiagRms,
    randomMonicRange: field.controls.randomMonic.offdiagRms,
    randomReducibleRange: field.controls.randomReducible.offdiagRms,
    fallbackFraction: field.holdout.fallbackFraction,
  })),
  paths,
}, null, 2));
