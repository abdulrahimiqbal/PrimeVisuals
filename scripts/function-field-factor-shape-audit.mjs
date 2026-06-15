#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  isMonicIrreducible,
  polyAdd,
  polyDegree,
  polyDivMod,
  polyMod,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(10000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/playground-artifacts";
const shifts = [2, 4, 6, 8, 10, 12];
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(10000, Math.round(maxN * f)));
const seeds = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 112358, 141421, 173205, 223606,
  99991, 100003, 444444, 555555, 777777,
];
const W = 2 * 3 * 5 * 7 * 11 * 13;
const roughCutoffs = [13, 31, 97, 257];
const minCenter = 1001;
const fieldSpecs = [
  { q: 3, maxDegree: 11, degrees: [8, 9, 10, 11] },
  { q: 5, maxDegree: 7, degrees: [4, 5, 6, 7] },
];

function mulberry32(seed) {
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
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function phiOf(n) {
  let m = n;
  let out = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    while (m % p === 0) m = Math.floor(m / p);
    out = (out / p) * (p - 1);
  }
  if (m > 1) out = (out / m) * (m - 1);
  return out;
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
}

function range(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length ? [Math.min(...usable), Math.max(...usable)] : [NaN, NaN];
}

function fmt(x, digits = 6) {
  return Number.isFinite(x) ? x.toFixed(digits) : "NA";
}

function fitTheta(rows, residualKey = "residual", scaleKey = "scale") {
  const pts = rows
    .map((row) => ({ x: row[scaleKey], y: Math.abs(row[residualKey]) }))
    .filter((row) => row.x > 1 && row.y > 0);
  if (pts.length < 2) return NaN;
  const xs = pts.map((row) => Math.log(row.x));
  const ys = pts.map((row) => Math.log(row.y));
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : NaN;
}

function sampleWithoutReplacement(pool, count, seed) {
  if (pool.length === 0 || count <= 0) return new Uint32Array(0);
  const random = mulberry32(seed);
  const copy = new Uint32Array(pool);
  const target = Math.min(count, copy.length);
  const out = new Uint32Array(target);
  for (let i = 0; i < target; i++) {
    const j = i + Math.floor(random() * (copy.length - i));
    const picked = copy[j];
    copy[j] = copy[i];
    copy[i] = picked;
    out[i] = picked;
  }
  if (target === count) return out;
  const filled = new Uint32Array(count);
  filled.set(out);
  for (let i = target; i < count; i++) filled[i] = pool[Math.floor(random() * pool.length)];
  return filled;
}

function prefixLength(sorted, limit) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] <= limit) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function scoreAccumulator(count, sum, sumSq, nullMean, nullVariance) {
  const actualMean = count ? sum / count : 0;
  const actualVariance = count ? Math.max(0, sumSq / count - actualMean * actualMean) : 0;
  const residual = sum - count * nullMean;
  const variance = count * Math.max(1e-15, nullVariance);
  return {
    count,
    sum,
    mean: actualMean,
    actualVariance,
    residual,
    variance,
    z: variance > 0 ? residual / Math.sqrt(variance) : 0,
  };
}

function addScore(acc, value) {
  acc.count++;
  acc.sum += value;
  acc.sumSq += value * value;
}

function fieldFactorDegrees(poly, universe) {
  const q = universe.q;
  let rem = poly;
  let remDegree = polyDegree(rem, q);
  const degrees = [];
  let trialDegree = 1;
  while (remDegree > 0 && trialDegree <= Math.floor(remDegree / 2)) {
    for (const factor of universe.irreduciblesByDegree[trialDegree]) {
      while (remDegree >= trialDegree && polyMod(rem, factor, q) === 0) {
        degrees.push(trialDegree);
        rem = polyDivMod(rem, factor, q).quotient;
        remDegree = polyDegree(rem, q);
      }
      if (remDegree === 0 || trialDegree > Math.floor(remDegree / 2)) break;
    }
    trialDegree++;
  }
  if (remDegree > 0) degrees.push(remDegree);
  return degrees;
}

function shapeFromDegrees(degrees, totalDegree) {
  let energy = 0;
  let largest = 0;
  for (const degree of degrees) {
    const w = degree / totalDegree;
    energy += w * w;
    largest = Math.max(largest, w);
  }
  return {
    split: Math.max(0, 1 - energy),
    largest,
    bigOmega: degrees.length,
  };
}

function fieldShape(poly, universe, cache) {
  const cached = cache.get(poly);
  if (cached) return cached;
  const degree = polyDegree(poly, universe.q);
  const shape = shapeFromDegrees(fieldFactorDegrees(poly, universe), degree);
  cache.set(poly, shape);
  return shape;
}

function fieldPools(universe, degree) {
  const lead = universe.pow[degree];
  const all = new Uint32Array(universe.pow[degree]);
  const reducible = [];
  const flags = universe.irreducibleFlagsByDegree[degree];
  for (let lower = 0; lower < universe.pow[degree]; lower++) {
    const poly = lead + lower;
    all[lower] = poly;
    if (!flags[lower]) reducible.push(poly);
  }
  return { all, reducible: Uint32Array.from(reducible) };
}

function fieldRoughPool(universe, degree, maxFactorDegree) {
  const lead = universe.pow[degree];
  const factors = [];
  for (let d = 1; d <= maxFactorDegree; d++) factors.push(...universe.irreduciblesByDegree[d]);
  const out = [];
  for (let lower = 0; lower < universe.pow[degree]; lower++) {
    const poly = lead + lower;
    let ok = true;
    for (const factor of factors) {
      if (polyMod(poly, factor, universe.q) === 0) {
        ok = false;
        break;
      }
    }
    if (ok) out.push(poly);
  }
  return Uint32Array.from(out);
}

function fieldNull(universe, degree, cache) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const acc = { count: 0, sum: 0, sumSq: 0 };
  for (let lower = 0; lower < universe.pow[degree]; lower++) {
    if (flags[lower]) continue;
    addScore(acc, fieldShape(lead + lower, universe, cache).split);
  }
  const meanValue = acc.count ? acc.sum / acc.count : 0;
  const variance = acc.count ? Math.max(1e-15, acc.sumSq / acc.count - meanValue * meanValue) : 1e-15;
  return {
    count: acc.count,
    mean: meanValue,
    variance,
  };
}

function scoreFieldCenters(universe, centers, constants, nullRow, cache) {
  const acc = { count: 0, sum: 0, sumSq: 0 };
  for (const center of centers) {
    for (const c of constants) {
      const mate = polyAdd(center, c, universe.q);
      if (isMonicIrreducible(mate, universe)) continue;
      addScore(acc, fieldShape(mate, universe, cache).split);
    }
  }
  return scoreAccumulator(acc.count, acc.sum, acc.sumSq, nullRow.mean, nullRow.variance);
}

function summarizeScoreRuns(runs, index) {
  return {
    z: range(runs.map((run) => run.rows[index].z)),
    mean: range(runs.map((run) => run.rows[index].mean)),
    count: range(runs.map((run) => run.rows[index].count)),
    theta: range(runs.map((run) => run.theta)),
  };
}

function fieldAudit(spec) {
  console.error(`[shape] F_${spec.q}[t] to degree ${spec.maxDegree}`);
  const universe = buildPolynomialUniverse(spec.q, spec.maxDegree);
  const constants = Array.from({ length: spec.q - 1 }, (_, i) => i + 1);
  const cache = new Map();
  const rows = [];
  let cumulativeResidual = 0;
  let cumulativeVariance = 0;
  let cumulativeCount = 0;

  for (const degree of spec.degrees) {
    console.error(`[shape] F_${spec.q}[t] degree ${degree}`);
    const nullRow = fieldNull(universe, degree, cache);
    const centers = Uint32Array.from(universe.irreduciblesByDegree[degree]);
    const pools = fieldPools(universe, degree);
    const roughDegree = Math.max(1, Math.floor(degree / 2) - 1);
    const roughPool = fieldRoughPool(universe, degree, roughDegree);
    const actual = scoreFieldCenters(universe, centers, constants, nullRow, cache);
    cumulativeResidual += actual.residual;
    cumulativeVariance += actual.variance;
    cumulativeCount += actual.count;

    const monicRuns = seeds.map((seed) => ({
      rows: [scoreFieldCenters(universe, sampleWithoutReplacement(pools.all, centers.length, seed ^ degree ^ (spec.q << 8)), constants, nullRow, cache)],
      theta: NaN,
    }));
    const reducibleRuns = seeds.map((seed) => ({
      rows: [scoreFieldCenters(universe, sampleWithoutReplacement(pools.reducible, centers.length, seed ^ degree ^ 0xa5a5a5 ^ spec.q), constants, nullRow, cache)],
      theta: NaN,
    }));
    const roughRuns = seeds.map((seed) => ({
      rows: [scoreFieldCenters(universe, sampleWithoutReplacement(roughPool, centers.length, seed ^ degree ^ 0x51f15e ^ spec.q), constants, nullRow, cache)],
      theta: NaN,
    }));

    rows.push({
      degree,
      centers: centers.length,
      constants: constants.length,
      roughDegree,
      roughPool: roughPool.length,
      null: nullRow,
      actual,
      cumulativeCount,
      cumulativeResidual,
      cumulativeVariance,
      cumulativeZ: cumulativeVariance > 0 ? cumulativeResidual / Math.sqrt(cumulativeVariance) : 0,
      controls: {
        monic: summarizeScoreRuns(monicRuns, 0),
        reducible: summarizeScoreRuns(reducibleRuns, 0),
        rough: summarizeScoreRuns(roughRuns, 0),
      },
    });
  }

  return {
    q: spec.q,
    maxDegree: spec.maxDegree,
    degrees: spec.degrees,
    constants,
    rows,
    theta: fitTheta(rows.map((row) => ({
      residual: row.cumulativeResidual,
      scale: Math.max(1, row.cumulativeCount),
    }))),
  };
}

function smallestPrimeFactors(limit) {
  const spf = new Int32Array(limit + 1);
  for (let i = 2; i <= limit; i++) {
    if (spf[i]) continue;
    spf[i] = i;
    if (i * i > limit) continue;
    for (let j = i * i; j <= limit; j += i) if (!spf[j]) spf[j] = i;
  }
  return spf;
}

function integerSplitShapes(limit, primeFlags, spf) {
  console.error(`[shape] factoring integer composite shapes to ${limit}`);
  const split = new Float64Array(limit + 1);
  const largest = new Float64Array(limit + 1);
  for (let n = 4; n <= limit; n++) {
    if (primeFlags[n]) continue;
    const logN = Math.log(n);
    let m = n;
    let energy = 0;
    let maxWeight = 0;
    while (m > 1) {
      const p = spf[m] || m;
      const w = Math.log(p) / logN;
      while (m % p === 0) {
        energy += w * w;
        maxWeight = Math.max(maxWeight, w);
        m = Math.floor(m / p);
      }
    }
    split[n] = Math.max(0, 1 - energy);
    largest[n] = maxWeight;
  }
  return { split, largest };
}

function isCoprimeToList(n, primeList) {
  for (const p of primeList) if (n % p === 0) return false;
  return true;
}

function localNullRows(shape, primeFlags, limit, centerPrimeList) {
  const rows = [];
  let cursor = minCenter | 1;
  const acc = { count: 0, sum: 0, sumSq: 0 };
  for (const endpoint of endpoints) {
    while (cursor <= endpoint) {
      if (isCoprimeToList(cursor, centerPrimeList)) {
        for (const h of shifts) {
          const mate = cursor + h;
          if (mate <= limit && mate > 1 && !primeFlags[mate]) addScore(acc, shape.split[mate]);
        }
      }
      cursor += 2;
    }
    const meanValue = acc.count ? acc.sum / acc.count : 0;
    rows.push({
      N: endpoint,
      count: acc.count,
      mean: meanValue,
      variance: acc.count ? Math.max(1e-15, acc.sumSq / acc.count - meanValue * meanValue) : 1e-15,
    });
  }
  return rows;
}

function scoreIntegerCenters(name, centers, nullRows, shape, primeFlags, limit) {
  const sorted = Array.from(new Set(centers.filter((n) => n >= minCenter && n <= maxN))).sort((a, b) => a - b);
  const rows = [];
  const acc = { count: 0, sum: 0, sumSq: 0 };
  let cursor = 0;
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    while (cursor < sorted.length && sorted[cursor] <= endpoint) {
      const center = sorted[cursor++];
      for (const h of shifts) {
        const mate = center + h;
        if (mate <= limit && mate > 1 && !primeFlags[mate]) addScore(acc, shape.split[mate]);
      }
    }
    const scored = scoreAccumulator(acc.count, acc.sum, acc.sumSq, nullRows[i].mean, nullRows[i].variance);
    rows.push({
      N: endpoint,
      centers: cursor,
      localNull: nullRows[i],
      ...scored,
      scale: Math.max(1, scored.count),
    });
  }
  return { name, labels: sorted.length, rows, theta: fitTheta(rows) };
}

function scoreIntegerListAtEndpoint(name, centers, endpoint, nullRow, shape, primeFlags, limit) {
  const acc = { count: 0, sum: 0, sumSq: 0 };
  for (const center of centers) {
    if (center < minCenter || center > endpoint) continue;
    for (const h of shifts) {
      const mate = center + h;
      if (mate <= limit && mate > 1 && !primeFlags[mate]) addScore(acc, shape.split[mate]);
    }
  }
  const scored = scoreAccumulator(acc.count, acc.sum, acc.sumSq, nullRow.mean, nullRow.variance);
  return {
    N: endpoint,
    centers: centers.length,
    localNull: nullRow,
    ...scored,
    scale: Math.max(1, scored.count),
  };
}

function wFakeLabels(seed) {
  const random = mulberry32(seed);
  const phi = phiOf(W);
  const scale = W / phi;
  const out = [];
  for (let n = minCenter | 1; n <= maxN; n += 2) {
    if (gcd(n, W) !== 1) continue;
    if (random() < Math.min(0.95, scale / Math.log(n))) out.push(n);
  }
  return out;
}

function wCompositePool(primeFlags) {
  const out = [];
  for (let n = minCenter | 1; n <= maxN; n += 2) {
    if (gcd(n, W) !== 1 || primeFlags[n]) continue;
    out.push(n);
  }
  return Uint32Array.from(out);
}

function scoreCompositeControls(real, pool, nullRows, shape, primeFlags, limit) {
  return seeds.map((seed) => {
    const rows = endpoints.map((endpoint, i) => {
      const available = pool.subarray(0, prefixLength(pool, endpoint));
      const target = real.rows[i].centers;
      const centers = sampleWithoutReplacement(available, target, seed ^ endpoint ^ 0x85ebca6b);
      return scoreIntegerListAtEndpoint(`W${W}-composite-${seed}`, centers, endpoint, nullRows[i], shape, primeFlags, limit);
    });
    return { name: `W${W}-composite-${seed}`, rows, theta: fitTheta(rows) };
  });
}

function summarizeIntegerControls(runs, index) {
  return {
    z: range(runs.map((run) => run.rows[index].z)),
    mean: range(runs.map((run) => run.rows[index].mean)),
    count: range(runs.map((run) => run.rows[index].count)),
    theta: range(runs.map((run) => run.theta)),
  };
}

function namedCompositeChecks(shape, primeFlags, limit) {
  return [25, 35, 77, 289].map((center) => {
    const values = [];
    for (const h of shifts) {
      const mate = center + h;
      if (mate <= limit && mate > 1 && !primeFlags[mate]) values.push({ shift: h, mate, split: shape.split[mate] });
    }
    return {
      center,
      wCoprime: gcd(center, W) === 1,
      compositeMates: values.length,
      meanSplit: values.length ? mean(values.map((row) => row.split)) : NaN,
      values,
    };
  });
}

function integerAudit() {
  const limit = maxN + Math.max(...shifts);
  console.error(`[shape] integer sieve to ${limit}`);
  const primeFlags = sieve(limit);
  const primes = primesUpTo(maxN);
  const roughPrimeLists = Object.fromEntries(roughCutoffs.map((cutoff) => [cutoff, primesUpTo(cutoff)]));
  const spf = smallestPrimeFactors(limit);
  const shape = integerSplitShapes(limit, primeFlags, spf);
  const nullRows = localNullRows(shape, primeFlags, limit, roughPrimeLists[13]);
  const real = scoreIntegerCenters("real-primes", primes, nullRows, shape, primeFlags, limit);
  console.error(`[shape] rough-center null diagnostics`);
  const roughNulls = Object.fromEntries(roughCutoffs.map((cutoff) => [
    cutoff,
    localNullRows(shape, primeFlags, limit, roughPrimeLists[cutoff]),
  ]));
  const roughScores = Object.fromEntries(roughCutoffs.map((cutoff) => [
    cutoff,
    scoreIntegerCenters(`real-vs-rough-${cutoff}`, primes, roughNulls[cutoff], shape, primeFlags, limit),
  ]));
  console.error(`[shape] integer controls`);
  const wFakes = seeds.map((seed) => scoreIntegerCenters(`W${W}-fake-${seed}`, wFakeLabels(seed), nullRows, shape, primeFlags, limit));
  const cramers = seeds.map((seed) => scoreIntegerCenters(`cramer-${seed}`, cramerPrimes(maxN, seed), nullRows, shape, primeFlags, limit));
  const compositePool = wCompositePool(primeFlags);
  const composites = scoreCompositeControls(real, compositePool, nullRows, shape, primeFlags, limit);
  return {
    W,
    shifts,
    endpoints,
    real,
    roughCutoffs,
    roughScores,
    controls: {
      wFake: wFakes,
      cramer: cramers,
      composite: composites,
    },
    summaries: endpoints.map((endpoint, i) => ({
      N: endpoint,
      wFake: summarizeIntegerControls(wFakes, i),
      cramer: summarizeIntegerControls(cramers, i),
      composite: summarizeIntegerControls(composites, i),
    })),
    namedComposites: namedCompositeChecks(shape, primeFlags, limit),
  };
}

function markdownReport(result) {
  const integerRows = result.integer.real.rows.map((row, i) => {
    const summary = result.integer.summaries[i];
    return `| ${row.N} | ${row.centers} | ${row.count} | ${fmt(row.mean)} | ${fmt(row.localNull.mean)} | ${fmt(row.z)} | ${fmt(summary.wFake.z[0])}..${fmt(summary.wFake.z[1])} | ${fmt(summary.composite.z[0])}..${fmt(summary.composite.z[1])} | ${fmt(summary.cramer.z[0])}..${fmt(summary.cramer.z[1])} |`;
  }).join("\n");
  const fieldTable = (audit) => audit.rows.map((row) => `| ${row.degree} | ${row.centers} | ${row.actual.count} | ${fmt(row.actual.mean)} | ${fmt(row.null.mean)} | ${fmt(row.actual.z)} | ${fmt(row.cumulativeZ)} | <=${row.roughDegree} (${row.roughPool}) | ${fmt(row.controls.monic.z[0])}..${fmt(row.controls.monic.z[1])} | ${fmt(row.controls.reducible.z[0])}..${fmt(row.controls.reducible.z[1])} | ${fmt(row.controls.rough.z[0])}..${fmt(row.controls.rough.z[1])} |`).join("\n");
  const namedRows = result.integer.namedComposites.map((row) => `| ${row.center} | ${row.wCoprime ? "yes" : "no"} | ${row.compositeMates} | ${fmt(row.meanSplit)} |`).join("\n");
  const roughRows = result.integer.roughCutoffs.map((cutoff) => {
    const score = result.integer.roughScores[cutoff];
    const row = score.rows.at(-1);
    return `| ${cutoff} | ${row.localNull.count} | ${fmt(row.localNull.mean)} | ${fmt(row.mean)} | ${fmt(row.z)} | ${score.rows.map((r) => fmt(r.z, 2)).join(", ")} |`;
  }).join("\n");

  return `# function-field factor-shape audit

Candidate:
leave direct companion-prime counting. For an additive constant orbit,
condition on the mate being reducible/composite and measure only its factor
fragmentation

\`split(g)=1-sum_i (deg factor_i / deg g)^2\`

in F_q[t], transported to integers as
\`1-sum_i (log p_i / log n)^2\` with prime factors counted with
multiplicity. The finite-field null is the exact all-monic reducible shell.
The integer null is the deterministic W=${result.integer.W} local center
shell, also conditioned on composite mates.

## Integer side

Real theta: \`${fmt(result.integer.real.theta)}\`.

| N | prime centers | composite mates | real mean split | W-local null mean | real z | W-fake z range | W-composite z range | Cramer z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${integerRows}

Rough-center null diagnostics for the real prime centers:

| center coprime to primes <= | null mate cells | endpoint null mean | real mean split | endpoint z | z trace |
| ---: | ---: | ---: | ---: | ---: | --- |
${roughRows}

Named composite centers:

| center | W-coprime | composite mates in orbit | mean split |
| ---: | --- | ---: | ---: |
${namedRows}

## Function fields

F_3[t] theta: \`${fmt(result.fields[0].theta)}\`

| degree | irreducible centers | reducible mates | real mean split | all-reducible mean | real z | cumulative z | rough center rule | monic-center z range | reducible-center z range | rough-center z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
${fieldTable(result.fields[0])}

F_5[t] theta: \`${fmt(result.fields[1].theta)}\`

| degree | irreducible centers | reducible mates | real mean split | all-reducible mean | real z | cumulative z | rough center rule | monic-center z range | reducible-center z range | rough-center z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
${fieldTable(result.fields[1])}

SVG: \`${result.svgPath}\`
JSON: \`${result.jsonPath}\`
`;
}

function svgPlot(result) {
  const width = 1180;
  const height = 660;
  const pad = 64;
  const plotW = 650;
  const plotH = 430;
  const rows = result.integer.real.rows;
  const summaries = result.integer.summaries;
  const allZ = rows.flatMap((row, i) => [
    row.z,
    summaries[i].wFake.z[0],
    summaries[i].wFake.z[1],
    summaries[i].composite.z[0],
    summaries[i].composite.z[1],
    summaries[i].cramer.z[0],
    summaries[i].cramer.z[1],
  ]).filter(Number.isFinite);
  const zMin = Math.min(-1, ...allZ) * 1.1;
  const zMax = Math.max(1, ...allZ) * 1.1;
  const x = (i) => pad + (i * plotW) / Math.max(1, rows.length - 1);
  const y = (value) => pad + ((zMax - value) / (zMax - zMin)) * plotH;
  const points = (values) => values.map((value, i) => `${x(i)},${y(value)}`).join(" ");
  const band = (key, color, opacity = 0.15) => {
    const top = summaries.map((row) => row[key].z[1]);
    const bottom = summaries.map((row) => row[key].z[0]);
    const polygon = [
      ...top.map((value, i) => `${x(i)},${y(value)}`),
      ...bottom.map((value, i) => `${x(rows.length - 1 - i)},${y(value)}`),
    ].join(" ");
    return `<polygon points="${polygon}" fill="${color}" opacity="${opacity}"/>`;
  };
  const yTicks = [-10, -5, 0, 5, 10, 15, 20].filter((value) => value >= zMin && value <= zMax);
  const fieldRows = result.fields.flatMap((field) => field.rows.map((row) => ({
    label: `F${field.q} d${row.degree}`,
    value: row.cumulativeZ,
    mono: row.controls.monic.z,
    reducible: row.controls.reducible.z,
    color: field.q === 3 ? "#4f8cc9" : "#38a06d",
  })));
  const barX = 820;
  const barZero = 960;
  const barW = 130;
  const fieldAbs = Math.max(1, ...fieldRows.flatMap((row) => [Math.abs(row.value), Math.abs(row.mono[0]), Math.abs(row.mono[1]), Math.abs(row.reducible[0]), Math.abs(row.reducible[1])]));
  const bars = fieldRows.map((row, i) => {
    const yy = 112 + i * 34;
    const w = (Math.abs(row.value) / fieldAbs) * barW;
    const x0 = row.value >= 0 ? barZero : barZero - w;
    const r0 = barZero + (row.mono[0] / fieldAbs) * barW;
    const r1 = barZero + (row.mono[1] / fieldAbs) * barW;
    const c0 = barZero + (row.reducible[0] / fieldAbs) * barW;
    const c1 = barZero + (row.reducible[1] / fieldAbs) * barW;
    return `<text x="${barX}" y="${yy + 5}" fill="${row.color}" font-size="13">${row.label}</text>
<line x1="${r0}" y1="${yy - 7}" x2="${r1}" y2="${yy - 7}" stroke="#f4a261" stroke-width="5" opacity="0.65"/>
<line x1="${c0}" y1="${yy + 2}" x2="${c1}" y2="${yy + 2}" stroke="#a78bfa" stroke-width="5" opacity="0.65"/>
<rect x="${x0}" y="${yy - 13}" width="${w}" height="13" fill="${row.color}"/>
<text x="${barZero + barW + 12}" y="${yy + 1}" fill="#dbeafe" font-size="12">${fmt(row.value, 2)}</text>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#111827"/>
<text x="64" y="34" fill="#f9fafb" font-size="20" font-weight="700">Composite-only factor-shape residual</text>
<text x="64" y="56" fill="#a7b0c4" font-size="13">Integer y-axis: z against W=${result.integer.W} local composite-mate split null. Function-field bars: cumulative z.</text>
<rect x="${pad}" y="${pad}" width="${plotW}" height="${plotH}" fill="#0b1220" stroke="#273244"/>
${yTicks.map((tick) => `<line x1="${pad}" y1="${y(tick)}" x2="${pad + plotW}" y2="${y(tick)}" stroke="#243044"/><text x="${pad - 14}" y="${y(tick) + 4}" text-anchor="end" fill="#8fa0b8" font-size="11">${tick}</text>`).join("\n")}
${band("cramer", "#e76f51", 0.1)}
${band("wFake", "#2a9d8f", 0.16)}
${band("composite", "#a78bfa", 0.14)}
<polyline points="${points(rows.map((row) => row.z))}" fill="none" stroke="#f8fafc" stroke-width="3"/>
${rows.map((row, i) => `<circle cx="${x(i)}" cy="${y(row.z)}" r="4" fill="#f8fafc"/><text x="${x(i)}" y="${pad + plotH + 24}" text-anchor="middle" fill="#9ca3af" font-size="11">${row.N >= 1000000 ? `${row.N / 1000000}M` : `${Math.round(row.N / 1000)}k`}</text>`).join("\n")}
<text x="${pad}" y="${pad + plotH + 48}" fill="#9ca3af" font-size="12">endpoint</text>
<rect x="740" y="82" width="370" height="450" fill="#0b1220" stroke="#273244"/>
<text x="780" y="58" fill="#dbeafe" font-size="14">control bands: Cramer red, W-fake teal, W-composite violet</text>
<line x1="${barZero}" y1="92" x2="${barZero}" y2="500" stroke="#52617a"/>
${bars}
<text x="${barX}" y="548" fill="#a7b0c4" font-size="12">field bars use the same split statistic on reducible f+c; orange/violet are sampled monic/reducible-center ranges.</text>
</svg>`;
}

console.error(`[shape] starting factor-shape audit N=${maxN}`);
const fields = fieldSpecs.map(fieldAudit);
const integer = integerAudit();

fs.mkdirSync(outDir, { recursive: true });
const basename = `function-field-factor-shape-${maxN}`;
const result = {
  candidate: "constant-orbit composite-only factor-shape residual",
  maxN,
  fieldSpecs,
  fields,
  integer,
  generatedAt: new Date().toISOString(),
};
const jsonPath = path.join(outDir, `${basename}.json`);
const mdPath = path.join(outDir, `${basename}.md`);
const svgPath = path.join(outDir, `${basename}.svg`);
result.jsonPath = jsonPath;
result.mdPath = mdPath;
result.svgPath = svgPath;
fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(mdPath, markdownReport(result));
fs.writeFileSync(svgPath, svgPlot(result));
console.log(JSON.stringify({
  ok: true,
  candidate: result.candidate,
  integerEndpoint: integer.real.rows.at(-1),
  integerEndpointControls: integer.summaries.at(-1),
  fieldEndpoint: fields.map((field) => ({
    q: field.q,
    row: field.rows.at(-1),
    theta: field.theta,
  })),
  mdPath,
  jsonPath,
  svgPath,
}, null, 2));
