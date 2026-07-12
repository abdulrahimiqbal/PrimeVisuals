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

const maxN = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q2MaxDegree = Number(process.argv[4] || 22);
const q3MaxDegree = Number(process.argv[5] || 13);
const q5MaxDegree = Number(process.argv[6] || 8);

const seeds = [12345, 271828, 314159];
const integerShifts = [6, 12, 18, 24, 30, 42, 60, 90];
const integerLocalPrimes = [2, 3, 5, 7, 11];
const integerLocalW = integerLocalPrimes.reduce((acc, p) => acc * p, 1);
const betaPriorAlpha = 0.5;
const betaPriorBeta = 0.5;
const minTrainEdges = 3;
const profileBins = 8;

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
      lowTrainEdgeSupport: table.edges < minTrainEdges,
    };
  });
  return {
    subsets: details.length,
    vertices: rows.length,
    residualMeanRms: Math.sqrt(mean(details.map((row) => row.meanResidual ** 2))),
    allowedResidualMeanRms: Math.sqrt(mean(details.map((row) => row.allowedMeanResidual ** 2))),
    deterministicBlockedFraction: deterministicBlockedUses / Math.max(1, totalUses),
    lowTrainEdgeFraction: details.filter((row) => row.lowTrainEdgeSupport).length / Math.max(1, details.length),
    details,
  };
}

function exactTensorAudit(trainVertices, holdoutVertices, shifts, trainEdgeAt, holdoutEdgeAt, blockedMaskAt) {
  const trainRows = buildRows(trainVertices, shifts, trainEdgeAt, blockedMaskAt);
  const holdoutRows = buildRows(holdoutVertices, shifts, holdoutEdgeAt, blockedMaskAt);
  const orders = {};
  for (const order of [2, 3]) {
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

function rms(values) {
  return Math.sqrt(mean(values.map((value) => value * value)));
}

function normalize(values) {
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!norm) return values.map(() => 0);
  return values.map((value) => value / norm);
}

function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (!n) return 0;
  const aa = a.slice(0, n), bb = b.slice(0, n);
  const ma = mean(aa), mb = mean(bb);
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const da = aa[i] - ma;
    const db = bb[i] - mb;
    cov += da * db;
    va += da * da;
    vb += db * db;
  }
  return va && vb ? cov / Math.sqrt(va * vb) : 0;
}

function binDetailsByRate(details) {
  const sorted = details.slice().sort((a, b) => a.trainRate - b.trainRate || a.mask - b.mask);
  const bins = [];
  for (let i = 0; i < profileBins; i++) {
    const start = Math.floor((i * sorted.length) / profileBins);
    const end = Math.floor(((i + 1) * sorted.length) / profileBins);
    const rows = sorted.slice(start, Math.max(start + 1, end));
    const residuals = rows.map((row) => row.meanResidual);
    const allowedResiduals = rows.map((row) => row.allowedMeanResidual);
    bins.push({
      index: i,
      count: rows.length,
      rateMean: mean(rows.map((row) => row.trainRate)),
      residualMean: mean(residuals),
      allowedResidualMean: mean(allowedResiduals),
      residualRms: rms(residuals),
      lowTrainEdgeFraction: rows.filter((row) => row.lowTrainEdgeSupport).length / Math.max(1, rows.length),
    });
  }
  return bins;
}

function profileFromOrder(orderResult) {
  const values = orderResult.details.map((row) => row.meanResidual);
  const absValues = values.map(Math.abs).sort((a, b) => b - a);
  const absSum = absValues.reduce((sum, value) => sum + value, 0);
  const topCount = Math.max(1, Math.ceil(absValues.length * 0.2));
  const bins = binDetailsByRate(orderResult.details);
  const binnedResiduals = bins.map((bin) => bin.residualMean);
  return {
    subsets: orderResult.subsets,
    residualMeanRms: orderResult.residualMeanRms,
    allowedResidualMeanRms: orderResult.allowedResidualMeanRms,
    signedMean: mean(values),
    positiveFraction: values.filter((value) => value > 0).length / Math.max(1, values.length),
    top20AbsConcentration: absSum ? absValues.slice(0, topCount).reduce((sum, value) => sum + value, 0) / absSum : 0,
    deterministicBlockedFraction: orderResult.deterministicBlockedFraction,
    lowTrainEdgeFraction: orderResult.lowTrainEdgeFraction,
    binnedByTrainRate: bins,
    vector: binnedResiduals,
    unitVector: normalize(binnedResiduals),
  };
}

function summarizeControlProfiles(rows, orderKey) {
  const profiles = rows.map((row) => profileFromOrder(row.orders[orderKey]));
  return {
    residualMeanRms: range(profiles.map((profile) => profile.residualMeanRms)),
    positiveFraction: range(profiles.map((profile) => profile.positiveFraction)),
    top20AbsConcentration: range(profiles.map((profile) => profile.top20AbsConcentration)),
    lowTrainEdgeFraction: range(profiles.map((profile) => profile.lowTrainEdgeFraction)),
    profiles,
  };
}

function annotateResult(raw, controlGroups) {
  const order2 = profileFromOrder(raw.real.orders.order2);
  const order3 = profileFromOrder(raw.real.orders.order3);
  return {
    ...raw.meta,
    trainVertices: raw.real.trainVertices,
    holdoutVertices: raw.real.holdoutVertices,
    order2,
    order3,
    controls: Object.fromEntries(Object.entries(controlGroups).map(([name, rows]) => [name, {
      order2: summarizeControlProfiles(rows, "order2"),
      order3: summarizeControlProfiles(rows, "order3"),
    }])),
  };
}

function slope(points, xKey, yKey) {
  const filtered = points.filter((point) => point[xKey] > 0 && point[yKey] > 0);
  if (filtered.length < 2) return NaN;
  const xs = filtered.map((point) => Math.log(point[xKey]));
  const ys = filtered.map((point) => Math.log(point[yKey]));
  const mx = mean(xs), my = mean(ys);
  let cov = 0, vx = 0;
  for (let i = 0; i < filtered.length; i++) {
    cov += (xs[i] - mx) * (ys[i] - my);
    vx += (xs[i] - mx) ** 2;
  }
  return vx ? cov / vx : NaN;
}

function integerEligiblePool(limit, primeFlags, mode) {
  const out = [];
  for (let n = 5; n <= limit; n++) {
    if (gcd(n, integerLocalW) !== 1) continue;
    if (mode === "eligible" || (mode === "composite" && !primeFlags[n])) out.push(n);
  }
  return out;
}

function integerBlockedMaskAt(v) {
  let mask = 0;
  for (let i = 0; i < integerShifts.length; i++) {
    const x = v + integerShifts[i];
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
  const real = exactTensorAudit(train, holdout, integerShifts, edgeAt, edgeAt, integerBlockedMaskAt);
  const eligiblePool = integerEligiblePool(scaleN, flags, "eligible");
  const compositePool = integerEligiblePool(scaleN, flags, "composite");

  function control(seed, mode, pool, salt) {
    const labels = sampleWithoutReplacement(pool, primes.length, seed ^ salt);
    const labelFlags = new Uint8Array(scaleN + maxShift + 1);
    for (const label of labels) labelFlags[label] = 1;
    const ctrain = labels.filter((p) => p <= split && p + maxShift <= split);
    const choldout = labels.filter((p) => p > split && p + maxShift <= scaleN);
    const cedgeAt = (v, h) => labelFlags[v + h] ? 1 : 0;
    return { seed, mode, ...exactTensorAudit(ctrain, choldout, integerShifts, cedgeAt, cedgeAt, integerBlockedMaskAt) };
  }

  return annotateResult(
    {
      meta: {
        kind: "integer",
        label: `Z N=${scaleN}`,
        N: scaleN,
        split,
        x: scaleN,
        labels: primes.length,
        shifts: integerShifts,
        localState: `deterministic admissibility over primes ${integerLocalPrimes.join(",")} (W=${integerLocalW})`,
      },
      real,
    },
    {
      randomEligible: seeds.map((seed) => control(seed, "eligible", eligiblePool, 0x517cc1b7)),
      composite: seeds.map((seed) => control(seed, "composite", compositePool, 0x9e3779b9)),
    }
  );
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

function runPolynomialDegree(q, holdoutDegree, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const shifts = uniquePolynomialShifts(q);
  const moduli = smallLocalModuli(universe);
  const { blockedMaskAt, locallyEligible } = makePolynomialRemainderRows(q, moduli, shifts);
  const trainDegree = holdoutDegree - 1;
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

  return annotateResult(
    {
      meta: {
        kind: "functionField",
        label: `F_${q} degree=${holdoutDegree}`,
        q,
        trainDegree,
        holdoutDegree,
        x: q ** holdoutDegree,
        shifts: shifts.map((h) => polyToString(h, q)),
        localModuli: moduli.map((m) => polyToString(m, q)),
        localState: `deterministic admissibility against ${moduli.length} irreducible moduli of degree <=2`,
      },
      real,
    },
    {
      randomMonicEligible: seeds.map((seed) => control(seed, "monic", 0x517cc1b7, 0x94d049bb)),
      randomReducibleEligible: seeds.map((seed) => control(seed, "reducible", 0x9e3779b9, 0x243f6a88)),
    }
  );
}

function integerScalesFor(maxValue) {
  return [1_000_000, 2_000_000, 4_000_000, 8_000_000].filter((value) => value <= maxValue);
}

function degreeLadder(maxDegree) {
  const out = [];
  for (let d = Math.max(3, maxDegree - 2); d <= maxDegree; d++) out.push(d);
  return out;
}

function consecutiveCorrelations(runs, orderKey) {
  const out = [];
  for (let i = 1; i < runs.length; i++) {
    out.push({
      from: runs[i - 1].label,
      to: runs[i].label,
      pearson: pearson(runs[i - 1][orderKey].unitVector, runs[i][orderKey].unitVector),
    });
  }
  return out;
}

function crossUniverseCorrelations(integerEndpoint, fieldEndpoints, orderKey) {
  return fieldEndpoints.map((field) => ({
    field: field.label,
    pearson: pearson(integerEndpoint[orderKey].unitVector, field[orderKey].unitVector),
  }));
}

function slopeForRuns(runs, orderKey) {
  return slope(runs.map((run) => ({ x: run.x, y: run[orderKey].residualMeanRms })), "x", "y");
}

function summarizeAudit(integerRuns, fieldGroups) {
  const fieldEndpoints = fieldGroups.map((group) => group.runs.at(-1));
  const integerEndpoint = integerRuns.at(-1);
  const order2Cross = crossUniverseCorrelations(integerEndpoint, fieldEndpoints, "order2");
  const order3Cross = crossUniverseCorrelations(integerEndpoint, fieldEndpoints, "order3");
  const integerSlope2 = slopeForRuns(integerRuns, "order2");
  const integerSlope3 = slopeForRuns(integerRuns, "order3");
  const fieldSlopes = fieldGroups.map((group) => ({
    q: group.q,
    order2Slope: slopeForRuns(group.runs, "order2"),
    order3Slope: slopeForRuns(group.runs, "order3"),
  }));
  return {
    integerScaleCount: integerRuns.length,
    requiredIntegerScales: [1_000_000, 2_000_000, 4_000_000, 8_000_000],
    hasRequiredIntegerScaleLadder: [1_000_000, 2_000_000, 4_000_000, 8_000_000].every((value) => integerRuns.some((run) => run.N === value)),
    integerProfileStability: {
      order2: consecutiveCorrelations(integerRuns, "order2"),
      order3: consecutiveCorrelations(integerRuns, "order3"),
    },
    fieldProfileStability: fieldGroups.map((group) => ({
      q: group.q,
      order2: consecutiveCorrelations(group.runs, "order2"),
      order3: consecutiveCorrelations(group.runs, "order3"),
    })),
    crossUniverseProfile: {
      order2: order2Cross,
      order3: order3Cross,
    },
    decaySlopes: {
      integer: { order2: integerSlope2, order3: integerSlope3 },
      fields: fieldSlopes,
    },
    thresholds: {
      minProfilePearson: 0.8,
      maxSlopeGap: 0.35,
    },
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function renderRunRows(runs) {
  const lines = [];
  lines.push("| run | x | order2 RMS | order2 positive | order2 top20 | order3 RMS | order3 positive | order3 top20 |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const run of runs) {
    lines.push(`| ${run.label} | ${run.x} | ${fmt(run.order2.residualMeanRms)} | ${fmt(run.order2.positiveFraction)} | ${fmt(run.order2.top20AbsConcentration)} | ${fmt(run.order3.residualMeanRms)} | ${fmt(run.order3.positiveFraction)} | ${fmt(run.order3.top20AbsConcentration)} |`);
  }
  return lines.join("\n");
}

function renderCorrelationRows(rows) {
  const lines = [];
  lines.push("| from | to | Pearson |");
  lines.push("| --- | --- | ---: |");
  for (const row of rows) lines.push(`| ${row.from || "Z endpoint"} | ${row.to || row.field} | ${fmt(row.pearson)} |`);
  return lines.join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Signed residual-profile / scale-decay audit", "");
  lines.push("Candidate:");
  lines.push("after exact admissibility subtraction, compare signed residual profiles binned by train allowed-rate and compare log-slope decay across scale/degree.", "");
  lines.push("```text");
  lines.push("R_S = mean_holdout Z_S(v), |S| in {2,3}");
  lines.push("profile_k = bin_by_train_rate({R_S : |S|=k})");
  lines.push("accept only if signed profiles and decay slopes match across Z and F_q[t] beyond controls");
  lines.push("```", "");
  lines.push(`Profile bins: ${profileBins}. Seeds per control family: ${seeds.length}.`, "");
  lines.push("## Integer scales", "");
  lines.push(renderRunRows(report.integerRuns));
  lines.push("");
  for (const group of report.fieldGroups) {
    lines.push(`## F_${group.q}[t] degree ladder`, "");
    lines.push(renderRunRows(group.runs));
    lines.push("");
  }
  lines.push("## Correlation diagnostics", "");
  lines.push("### Integer order2 consecutive profile correlations", "");
  lines.push(renderCorrelationRows(report.summary.integerProfileStability.order2));
  lines.push("");
  lines.push("### Cross-universe order2 endpoint profile correlations", "");
  lines.push(renderCorrelationRows(report.summary.crossUniverseProfile.order2));
  lines.push("");
  lines.push("## Decay slopes", "");
  lines.push(`Integer order2 slope: ${fmt(report.summary.decaySlopes.integer.order2)}; order3 slope: ${fmt(report.summary.decaySlopes.integer.order3)}`);
  lines.push("");
  lines.push("| q | order2 slope | order3 slope |");
  lines.push("| ---: | ---: | ---: |");
  for (const row of report.summary.decaySlopes.fields) {
    lines.push(`| ${row.q} | ${fmt(row.order2Slope)} | ${fmt(row.order3Slope)} |`);
  }
  lines.push("");
  lines.push(`JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function renderSvg(report) {
  const rows = [
    ...report.integerRuns.map((run) => ({ label: run.label.replace("Z N=", "Z "), value: run.order2.residualMeanRms, color: "#67e8f9" })),
    ...report.fieldGroups.flatMap((group) => group.runs.map((run) => ({ label: `F_${group.q} d${run.holdoutDegree}`, value: run.order2.residualMeanRms, color: group.q === 2 ? "#a78bfa" : group.q === 3 ? "#34d399" : "#fbbf24" }))),
  ];
  const width = 1180, height = 640, pad = 76;
  const max = Math.max(...rows.map((row) => row.value)) * 1.15;
  const barW = (width - 2 * pad) / rows.length;
  const bars = rows.map((row, i) => {
    const h = (row.value / max) * (height - 2 * pad - 70);
    const x = pad + i * barW + 8;
    const y = height - pad - h;
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(10, barW - 16).toFixed(2)}" height="${h.toFixed(2)}" fill="${row.color}" opacity="0.84"/><text transform="translate(${(x + barW / 2 - 8).toFixed(2)} ${height - pad + 9}) rotate(58)" fill="#cbd5e1" font-size="12">${row.label}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${pad}" y="36" fill="#f8fafc" font-size="19" font-weight="700">signed residual profile audit: order-2 residual RMS</text>
<text x="${pad}" y="61" fill="#94a3b8" font-size="13">exact admissibility subtraction; profile matching checked in JSON/MD</text>
<line x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}" stroke="#334155"/>
${bars}
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

const integerScales = integerScalesFor(maxN);
console.error(`[signed-profile] integer scales ${integerScales.join(", ")}`);
const integerRuns = integerScales.map(runIntegerScale);

const fieldSpecs = [
  { q: 2, maxDegree: q2MaxDegree },
  { q: 3, maxDegree: q3MaxDegree },
  { q: 5, maxDegree: q5MaxDegree },
];
console.error(`[signed-profile] field ladders ${fieldSpecs.map((field) => `F_${field.q}:${degreeLadder(field.maxDegree).join("/")}`).join(", ")}`);
const fieldGroups = fieldSpecs.map((field) => ({
  q: field.q,
  degrees: degreeLadder(field.maxDegree),
  runs: degreeLadder(field.maxDegree).map((degree) => runPolynomialDegree(field.q, degree, field.maxDegree)),
}));

const summary = summarizeAudit(integerRuns, fieldGroups);
const base = `cycle-006-signed-profile-decay-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};

const report = {
  candidate: "signed residual-profile and scale-decay matching",
  generatedAt: new Date().toISOString(),
  maxN,
  q2MaxDegree,
  q3MaxDegree,
  q5MaxDegree,
  seeds,
  integerLocalPrimes,
  integerLocalW,
  betaPriorAlpha,
  betaPriorBeta,
  minTrainEdges,
  profileBins,
  integerRuns,
  fieldGroups,
  summary,
  paths,
};

fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  integerScales,
  fieldGroups: fieldGroups.map((group) => ({ q: group.q, degrees: group.degrees })),
  summary: {
    hasRequiredIntegerScaleLadder: summary.hasRequiredIntegerScaleLadder,
    integerOrder2Slope: summary.decaySlopes.integer.order2,
    fieldOrder2Slopes: summary.decaySlopes.fields.map((row) => ({ q: row.q, slope: row.order2Slope })),
    crossOrder2: summary.crossUniverseProfile.order2,
  },
  paths,
}, null, 2));
