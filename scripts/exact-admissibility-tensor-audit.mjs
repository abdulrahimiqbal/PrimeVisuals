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
import { primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 2_000_000);
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q2MaxDegree = Number(process.argv[4] || 22);
const q3MaxDegree = Number(process.argv[5] || 13);
const q5MaxDegree = Number(process.argv[6] || 8);

const seeds = [12345, 271828, 314159, 161803, 424242];
const integerShifts = [6, 12, 18, 24, 30, 42, 60, 90];
const integerLocalPrimes = [2, 3, 5, 7, 11];
const integerLocalW = integerLocalPrimes.reduce((acc, p) => acc * p, 1);
const betaPriorAlpha = 0.5;
const betaPriorBeta = 0.5;
const minTrainEdges = 3;

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

function clampProbability(p) {
  return Math.min(1 - 1e-9, Math.max(1e-9, p));
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

function sampleUpToWithoutReplacement(pool, count, seed) {
  return sampleWithoutReplacement(pool, Math.min(count, pool.length), seed);
}

function bitCount(mask) {
  let x = mask >>> 0, count = 0;
  while (x) {
    x &= x - 1;
    count++;
  }
  return count;
}

function bitSubsets(count, order) {
  const out = [];
  const limit = 1 << count;
  for (let mask = 1; mask < limit; mask++) {
    if (bitCount(mask) === order) out.push(mask);
  }
  return out;
}

function maskLabels(mask, labels) {
  const out = [];
  for (let i = 0; i < labels.length; i++) {
    if (mask & (1 << i)) out.push(labels[i]);
  }
  return out;
}

function summarizeOrder(rows) {
  return {
    residualMeanRms: range(rows.map((row) => row.residualMeanRms)),
    allowedResidualMeanRms: range(rows.map((row) => row.allowedResidualMeanRms)),
    maxAbsMeanResidual: range(rows.map((row) => row.maxAbsMeanResidual)),
    deterministicBlockedFraction: range(rows.map((row) => row.deterministicBlockedFraction)),
    lowTrainEdgeFraction: range(rows.map((row) => row.lowTrainEdgeFraction)),
    minTrainEdges: range(rows.map((row) => row.minTrainEdges)),
  };
}

function summarizeControls(rows) {
  return {
    order1: summarizeOrder(rows.map((row) => row.orders.order1)),
    order2: summarizeOrder(rows.map((row) => row.orders.order2)),
    order3: summarizeOrder(rows.map((row) => row.orders.order3)),
  };
}

function buildRows(vertices, shifts, edgeAt, blockedMaskAt) {
  return vertices.map((v) => {
    let edgeMask = 0;
    for (let i = 0; i < shifts.length; i++) {
      if (edgeAt(v, shifts[i])) edgeMask |= 1 << i;
    }
    return { edgeMask, blockedMask: blockedMaskAt(v) };
  });
}

function buildSubsetTables(rows, subsets) {
  return subsets.map((mask) => {
    let blocked = 0;
    let eligible = 0;
    let edges = 0;
    for (const row of rows) {
      if (row.blockedMask & mask) {
        blocked++;
        continue;
      }
      eligible++;
      if ((row.edgeMask & mask) === mask) edges++;
    }
    const rate = (edges + betaPriorAlpha) / Math.max(1, eligible + betaPriorAlpha + betaPriorBeta);
    return { mask, order: bitCount(mask), blocked, eligible, edges, rate };
  });
}

function scoreSubsetTables(rows, tables) {
  const sums = new Float64Array(tables.length);
  const allowedSums = new Float64Array(tables.length);
  const allowedCounts = new Int32Array(tables.length);
  let deterministicBlockedUses = 0;
  let totalUses = 0;
  for (const row of rows) {
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      totalUses++;
      if (row.blockedMask & table.mask) {
        deterministicBlockedUses++;
        continue;
      }
      const p = clampProbability(table.rate);
      const x = (row.edgeMask & table.mask) === table.mask ? 1 : 0;
      const z = (x - p) / Math.sqrt(p * (1 - p));
      sums[i] += z;
      allowedSums[i] += z;
      allowedCounts[i]++;
    }
  }
  const details = tables.map((table, i) => {
    const meanResidual = sums[i] / Math.max(1, rows.length);
    const allowedMeanResidual = allowedSums[i] / Math.max(1, allowedCounts[i]);
    return {
      mask: table.mask,
      order: table.order,
      trainEligible: table.eligible,
      trainBlocked: table.blocked,
      trainEdges: table.edges,
      trainRate: table.rate,
      holdoutAllowed: allowedCounts[i],
      meanResidual,
      allowedMeanResidual,
      absMeanResidual: Math.abs(meanResidual),
      absAllowedMeanResidual: Math.abs(allowedMeanResidual),
      lowTrainEdgeSupport: table.edges < minTrainEdges,
    };
  });
  return {
    subsets: details.length,
    vertices: rows.length,
    residualMeanRms: Math.sqrt(mean(details.map((row) => row.meanResidual ** 2))),
    allowedResidualMeanRms: Math.sqrt(mean(details.map((row) => row.allowedMeanResidual ** 2))),
    maxAbsMeanResidual: Math.max(...details.map((row) => row.absMeanResidual)),
    maxAbsAllowedMeanResidual: Math.max(...details.map((row) => row.absAllowedMeanResidual)),
    deterministicBlockedFraction: deterministicBlockedUses / Math.max(1, totalUses),
    lowTrainEdgeFraction: details.filter((row) => row.lowTrainEdgeSupport).length / Math.max(1, details.length),
    minTrainEdges: Math.min(...details.map((row) => row.trainEdges)),
    medianTrainEdges: details.map((row) => row.trainEdges).sort((a, b) => a - b)[Math.floor(details.length / 2)] ?? 0,
    details,
  };
}

function exactTensorAudit(trainVertices, holdoutVertices, shifts, trainEdgeAt, holdoutEdgeAt, blockedMaskAt) {
  const trainRows = buildRows(trainVertices, shifts, trainEdgeAt, blockedMaskAt);
  const holdoutRows = buildRows(holdoutVertices, shifts, holdoutEdgeAt, blockedMaskAt);
  const orders = {};
  for (const order of [1, 2, 3]) {
    const subsets = bitSubsets(shifts.length, order);
    const tables = buildSubsetTables(trainRows, subsets);
    orders[`order${order}`] = scoreSubsetTables(holdoutRows, tables);
  }
  return {
    trainVertices: trainVertices.length,
    holdoutVertices: holdoutVertices.length,
    orders,
  };
}

function integerEligiblePool(limit, primeFlags, mode) {
  const out = [];
  for (let n = 5; n <= limit; n++) {
    if (gcd(n, integerLocalW) !== 1) continue;
    if (mode === "eligible" || (mode === "composite" && !primeFlags[n])) out.push(n);
  }
  return out;
}

function integerBlockedMaskAt(v, shifts) {
  let mask = 0;
  for (let i = 0; i < shifts.length; i++) {
    const x = v + shifts[i];
    for (const p of integerLocalPrimes) {
      if (x !== p && x % p === 0) {
        mask |= 1 << i;
        break;
      }
    }
  }
  return mask;
}

function runIntegerScale(scaleN) {
  const maxShift = Math.max(...integerShifts);
  const flags = sieve(scaleN + maxShift);
  const primes = primesUpTo(scaleN + maxShift).filter((p) => p <= scaleN);
  const split = Math.floor(scaleN / 2);
  const train = primes.filter((p) => p > integerLocalPrimes.at(-1) && p <= split && p + maxShift <= split);
  const holdout = primes.filter((p) => p > split && p + maxShift <= scaleN);
  const edgeAt = (v, h) => flags[v + h] ? 1 : 0;
  const blockedMaskAt = (v) => integerBlockedMaskAt(v, integerShifts);
  const real = exactTensorAudit(train, holdout, integerShifts, edgeAt, edgeAt, blockedMaskAt);
  const eligiblePool = integerEligiblePool(scaleN, flags, "eligible");
  const compositePool = integerEligiblePool(scaleN, flags, "composite");

  function control(seed, mode, pool, salt) {
    const labels = sampleWithoutReplacement(pool, primes.length, seed ^ salt);
    const labelFlags = new Uint8Array(scaleN + maxShift + 1);
    for (const label of labels) labelFlags[label] = 1;
    const ctrain = labels.filter((p) => p <= split && p + maxShift <= split);
    const choldout = labels.filter((p) => p > split && p + maxShift <= scaleN);
    const cedgeAt = (v, h) => labelFlags[v + h] ? 1 : 0;
    return { seed, mode, ...exactTensorAudit(ctrain, choldout, integerShifts, cedgeAt, cedgeAt, blockedMaskAt) };
  }

  const randomEligible = seeds.map((seed) => control(seed, "eligible", eligiblePool, 0x517cc1b7));
  const composite = seeds.map((seed) => control(seed, "composite", compositePool, 0x9e3779b9));
  return {
    N: scaleN,
    split,
    localState: `deterministic admissibility over primes ${integerLocalPrimes.join(",")} (W=${integerLocalW})`,
    shifts: integerShifts,
    labels: primes.length,
    trainVertices: train.length,
    holdoutVertices: holdout.length,
    real,
    randomEligible,
    composite,
    controls: {
      randomEligible: summarizeControls(randomEligible),
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

function smallLocalModuli(universe) {
  const out = [];
  for (let degree = 1; degree <= Math.min(2, universe.maxDegree); degree++) {
    for (const poly of universe.irreduciblesByDegree[degree]) out.push(poly);
  }
  return out;
}

function makePolynomialRemainderRows(q, moduli, shifts) {
  const remainderCache = new Map();
  const shiftRemainders = shifts.map((h) => moduli.map((m) => polyMod(h, m, q)));
  function remainders(poly) {
    let row = remainderCache.get(poly);
    if (!row) {
      row = moduli.map((m) => polyMod(poly, m, q));
      remainderCache.set(poly, row);
    }
    return row;
  }
  function blockedMaskAt(poly) {
    const rem = remainders(poly);
    let mask = 0;
    for (let i = 0; i < shifts.length; i++) {
      const hRem = shiftRemainders[i];
      for (let j = 0; j < moduli.length; j++) {
        if (polyAdd(rem[j], hRem[j], q) === 0) {
          mask |= 1 << i;
          break;
        }
      }
    }
    return mask;
  }
  function locallyEligible(poly) {
    const rem = remainders(poly);
    return rem.every((value) => value !== 0);
  }
  return { blockedMaskAt, locallyEligible };
}

function polynomialPool(universe, degree, mode, locallyEligible) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  if (mode === "irreducible") return universe.irreduciblesByDegree[degree].slice();
  const out = [];
  for (let lower = 0; lower < flags.length; lower++) {
    const poly = lead + lower;
    if (!locallyEligible(poly)) continue;
    if (mode === "monic" || (mode === "reducible" && !flags[lower])) out.push(poly);
  }
  return out;
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
  const { blockedMaskAt, locallyEligible } = makePolynomialRemainderRows(q, moduli, shifts);
  const trainDegree = maxDegree - 1;
  const holdoutDegree = maxDegree;
  const trainLabels = polynomialPool(universe, trainDegree, "irreducible", locallyEligible);
  const holdoutLabels = polynomialPool(universe, holdoutDegree, "irreducible", locallyEligible);
  const train = polynomialVerticesInRange(trainLabels, universe, trainDegree, shifts);
  const holdout = polynomialVerticesInRange(holdoutLabels, universe, holdoutDegree, shifts);
  const edgeAt = (labels) => {
    const labelSet = new Set(labels);
    return (f, h) => labelSet.has(polyAdd(f, h, q)) ? 1 : 0;
  };
  const real = exactTensorAudit(train, holdout, shifts, edgeAt(trainLabels), edgeAt(holdoutLabels), blockedMaskAt);

  function control(seed, mode, saltTrain, saltHoldout) {
    const trainPool = polynomialPool(universe, trainDegree, mode, locallyEligible);
    const holdoutPool = polynomialPool(universe, holdoutDegree, mode, locallyEligible);
    const sampledTrain = sampleUpToWithoutReplacement(trainPool, trainLabels.length, seed ^ saltTrain);
    const sampledHoldout = sampleUpToWithoutReplacement(holdoutPool, holdoutLabels.length, seed ^ saltHoldout);
    const ctrain = polynomialVerticesInRange(sampledTrain, universe, trainDegree, shifts);
    const choldout = polynomialVerticesInRange(sampledHoldout, universe, holdoutDegree, shifts);
    return {
      seed,
      mode,
      targetTrainLabels: trainLabels.length,
      targetHoldoutLabels: holdoutLabels.length,
      sampledTrainLabels: sampledTrain.length,
      sampledHoldoutLabels: sampledHoldout.length,
      ...exactTensorAudit(ctrain, choldout, shifts, edgeAt(sampledTrain), edgeAt(sampledHoldout), blockedMaskAt),
    };
  }

  const randomMonicEligible = seeds.map((seed) => control(seed, "monic", 0x517cc1b7, 0x94d049bb));
  const randomReducibleEligible = seeds.map((seed) => control(seed, "reducible", 0x9e3779b9, 0x243f6a88));
  return {
    q,
    trainDegree,
    holdoutDegree,
    localState: `deterministic admissibility against ${moduli.length} irreducible moduli of degree <=2`,
    shifts: shifts.map((h) => polyToString(h, q)),
    localModuli: moduli.map((m) => polyToString(m, q)),
    trainLabels: trainLabels.length,
    holdoutLabels: holdoutLabels.length,
    trainVertices: train.length,
    holdoutVertices: holdout.length,
    real,
    randomMonicEligible,
    randomReducibleEligible,
    controls: {
      randomMonicEligible: summarizeControls(randomMonicEligible),
      randomReducibleEligible: summarizeControls(randomReducibleEligible),
    },
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function orderRow(label, result, controlsA, controlsB) {
  return `| ${label} | ${fmt(result.residualMeanRms)} | ${fmt(result.allowedResidualMeanRms)} | ${fmt(result.maxAbsMeanResidual)} | ${fmt(result.deterministicBlockedFraction)} | ${fmt(result.lowTrainEdgeFraction)} | ${fmt(controlsA.residualMeanRms[0])}..${fmt(controlsA.residualMeanRms[1])} | ${fmt(controlsB.residualMeanRms[0])}..${fmt(controlsB.residualMeanRms[1])} |`;
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Exact admissibility-conditioned tensor audit", "");
  lines.push("Candidate:");
  lines.push("subtract deterministic local obstructions and train allowed pair/triple rates before scoring holdout tensor residuals.", "");
  lines.push("```text");
  lines.push("A_S(v)=1 if no local modulus forces any v+h, h in S, to be composite");
  lines.push("Z_S(v)=0 when A_S(v)=0");
  lines.push("Z_S(v)=(1_{all h in S are prime-like}-p_S(train | A_S=1))/sqrt(p_S(1-p_S)) otherwise");
  lines.push("score_order_k = RMS_{|S|=k} mean_holdout Z_S(v)");
  lines.push("```", "");
  lines.push(`Beta prior for allowed cells: alpha=${betaPriorAlpha}, beta=${betaPriorBeta}. Low train-edge support threshold: ${minTrainEdges}.`, "");
  lines.push("## Integer side", "");
  for (const scale of report.integerScales) {
    lines.push(`### N=${scale.N}`, "");
    lines.push(`split=${scale.split}, labels=${scale.labels}, local state=${scale.localState}`);
    lines.push("");
    lines.push("| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random eligible RMS range | composite RMS range |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
    for (const order of [1, 2, 3]) {
      const key = `order${order}`;
      lines.push(orderRow(
        `order ${order}`,
        scale.real.orders[key],
        scale.controls.randomEligible[key],
        scale.controls.composite[key]
      ));
    }
    lines.push("");
  }
  for (const field of report.functionFields) {
    lines.push(`## F_${field.q}[t] side`, "");
    lines.push(`train degree=${field.trainDegree}, holdout degree=${field.holdoutDegree}, local state=${field.localState}`);
    lines.push("");
    lines.push("| order | real RMS | real allowed RMS | max mean residual | blocked frac | low-edge frac | random monic eligible RMS range | random reducible eligible RMS range |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
    for (const order of [1, 2, 3]) {
      const key = `order${order}`;
      lines.push(orderRow(
        `order ${order}`,
        field.real.orders[key],
        field.controls.randomMonicEligible[key],
        field.controls.randomReducibleEligible[key]
      ));
    }
    lines.push("");
  }
  lines.push(`JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function renderSvg(report) {
  const rows = [
    ...report.integerScales.flatMap((scale) => [2, 3].map((order) => ({
      label: `Z ${scale.N / 1_000_000}M o${order}`,
      value: scale.real.orders[`order${order}`].residualMeanRms,
      control: Math.max(
        scale.controls.randomEligible[`order${order}`].residualMeanRms[1],
        scale.controls.composite[`order${order}`].residualMeanRms[1]
      ),
      color: "#67e8f9",
    }))),
    ...report.functionFields.flatMap((field) => [2, 3].map((order) => ({
      label: `F_${field.q} o${order}`,
      value: field.real.orders[`order${order}`].residualMeanRms,
      control: Math.max(
        field.controls.randomMonicEligible[`order${order}`].residualMeanRms[1],
        field.controls.randomReducibleEligible[`order${order}`].residualMeanRms[1]
      ),
      color: field.q === 2 ? "#a78bfa" : field.q === 3 ? "#34d399" : "#fbbf24",
    }))),
  ];
  const width = 1180, height = 680, pad = 76;
  const max = Math.max(...rows.flatMap((row) => [row.value, row.control])) * 1.15;
  const groupW = (width - 2 * pad) / rows.length;
  const bars = rows.map((row, i) => {
    const x = pad + i * groupW + 6;
    const y0 = height - pad;
    const realH = (row.value / max) * (height - 2 * pad - 72);
    const ctrlH = (row.control / max) * (height - 2 * pad - 72);
    const w = Math.max(8, groupW / 2 - 8);
    return `<rect x="${x.toFixed(2)}" y="${(y0 - realH).toFixed(2)}" width="${w.toFixed(2)}" height="${realH.toFixed(2)}" fill="${row.color}" opacity="0.86"/><rect x="${(x + w + 4).toFixed(2)}" y="${(y0 - ctrlH).toFixed(2)}" width="${w.toFixed(2)}" height="${ctrlH.toFixed(2)}" fill="#94a3b8" opacity="0.72"/><text transform="translate(${(x + groupW / 2 - 10).toFixed(2)} ${height - pad + 9}) rotate(58)" fill="#cbd5e1" font-size="12">${row.label}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${pad}" y="36" fill="#f8fafc" font-size="19" font-weight="700">exact admissibility tensor residual RMS</text>
<text x="${pad}" y="61" fill="#94a3b8" font-size="13">left bar: real primes/irreducibles; right bar: strongest listed control</text>
<line x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}" stroke="#334155"/>
${bars}
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

const scaleNs = Array.from(new Set([Math.floor(N / 2), N].filter((x) => x >= 200_000)));
console.error(`[exact-admissibility] integer scales ${scaleNs.join(", ")}`);
const integerScales = scaleNs.map(runIntegerScale);

console.error(`[exact-admissibility] function fields F_2 degree=${q2MaxDegree}, F_3 degree=${q3MaxDegree}, F_5 degree=${q5MaxDegree}`);
const functionFields = [
  runPolynomialAudit(2, q2MaxDegree),
  runPolynomialAudit(3, q3MaxDegree),
  runPolynomialAudit(5, q5MaxDegree),
];

const base = `cycle-005-exact-admissibility-tensor-${N}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};

const report = {
  candidate: "exact admissibility-conditioned pair/triple residual tensor",
  generatedAt: new Date().toISOString(),
  N,
  q2MaxDegree,
  q3MaxDegree,
  q5MaxDegree,
  seeds,
  integerLocalPrimes,
  integerLocalW,
  betaPriorAlpha,
  betaPriorBeta,
  minTrainEdges,
  integerScales,
  functionFields,
  paths,
};

fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  integerScales: integerScales.map((scale) => ({
    N: scale.N,
    order2Rms: scale.real.orders.order2.residualMeanRms,
    order3Rms: scale.real.orders.order3.residualMeanRms,
    randomEligibleOrder2Range: scale.controls.randomEligible.order2.residualMeanRms,
    compositeOrder2Range: scale.controls.composite.order2.residualMeanRms,
  })),
  functionFields: functionFields.map((field) => ({
    q: field.q,
    holdoutDegree: field.holdoutDegree,
    order2Rms: field.real.orders.order2.residualMeanRms,
    order3Rms: field.real.orders.order3.residualMeanRms,
    randomMonicOrder2Range: field.controls.randomMonicEligible.order2.residualMeanRms,
    randomReducibleOrder2Range: field.controls.randomReducibleEligible.order2.residualMeanRms,
  })),
  paths,
}, null, 2));
