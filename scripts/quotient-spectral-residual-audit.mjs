#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyMod,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(200_000, Number.parseInt(process.argv[2] || "4000000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q2MaxDegree = Number.parseInt(process.argv[4] || "22", 10);
const q3MaxDegree = Number.parseInt(process.argv[5] || "13", 10);
const q5MaxDegree = Number.parseInt(process.argv[6] || "8", 10);

const roughCutoff = 257;
const blockCount = 24;
const integerModuli = [3, 5, 7, 11, 13, 17, 19, 23];
const integerBudgets = [3, 5, 8];
const requiredIntegerEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = requiredIntegerEndpoints.filter((n) => n <= maxN);
const seeds = [12345, 271828, 314159, 161803, 424242];
const fieldSpecs = [
  { q: 2, maxDegree: q2MaxDegree, degrees: [q2MaxDegree - 2, q2MaxDegree - 1, q2MaxDegree], maxModulusDegree: 2, roughDegree: 2 },
  { q: 3, maxDegree: q3MaxDegree, degrees: [q3MaxDegree - 2, q3MaxDegree - 1, q3MaxDegree], maxModulusDegree: 2, roughDegree: 2 },
  { q: 5, maxDegree: q5MaxDegree, degrees: [q5MaxDegree - 2, q5MaxDegree - 1, q5MaxDegree], maxModulusDegree: 2, roughDegree: 2 },
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

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function range(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length ? [Math.min(...usable), Math.max(...usable)] : [NaN, NaN];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function dot(a, b) {
  let out = 0;
  for (let i = 0; i < a.length; i++) out += a[i] * b[i];
  return out;
}

function multinomial(total, weights, random) {
  const counts = new Float64Array(weights.length);
  const sum = weights.reduce((a, b) => a + b, 0);
  if (total <= 0 || sum <= 0) return counts;
  const cumulative = new Float64Array(weights.length);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i] / sum;
    cumulative[i] = acc;
  }
  for (let k = 0; k < total; k++) {
    const u = random();
    let i = 0;
    while (i + 1 < cumulative.length && u > cumulative[i]) i++;
    counts[i]++;
  }
  return counts;
}

function spectralSummary(rows, meta) {
  const rowCount = rows.length;
  const dim = rows[0]?.length || 0;
  const means = new Float64Array(dim);
  for (const row of rows) for (let j = 0; j < dim; j++) means[j] += row[j];
  for (let j = 0; j < dim; j++) means[j] /= Math.max(1, rowCount);

  let rawSq = 0;
  let centeredSq = 0;
  const centered = rows.map((row) => {
    const out = new Float64Array(dim);
    for (let j = 0; j < dim; j++) {
      rawSq += row[j] * row[j];
      out[j] = row[j] - means[j];
      centeredSq += out[j] * out[j];
    }
    return out;
  });

  const gram = Array.from({ length: rowCount }, () => new Float64Array(rowCount));
  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j <= i; j++) {
      const value = dot(centered[i], centered[j]) / Math.max(1, rowCount);
      gram[i][j] = value;
      gram[j][i] = value;
    }
  }

  let v = new Float64Array(rowCount).fill(1 / Math.sqrt(Math.max(1, rowCount)));
  let lambda = 0;
  for (let iter = 0; iter < 80; iter++) {
    const next = new Float64Array(rowCount);
    for (let i = 0; i < rowCount; i++) for (let j = 0; j < rowCount; j++) next[i] += gram[i][j] * v[j];
    const mag = Math.sqrt(dot(next, next));
    if (!mag) break;
    for (let i = 0; i < rowCount; i++) v[i] = next[i] / mag;
    lambda = dot(v, next);
  }

  const centeredVariance = centeredSq / Math.max(1, rowCount * dim);
  const mpEdge = (1 + Math.sqrt(dim / Math.max(1, rowCount - 1))) ** 2;
  const columnRms = meta.map((item, j) => {
    let sq = 0;
    for (const row of rows) sq += row[j] * row[j];
    return { ...item, rms: Math.sqrt(sq / Math.max(1, rowCount)) };
  }).sort((a, b) => b.rms - a.rms);
  const columnVariances = Array.from({ length: dim }, (_, j) => {
    let sq = 0;
    for (const row of centered) sq += row[j] * row[j];
    return sq / Math.max(1, rowCount);
  });
  const varianceTotal = columnVariances.reduce((a, b) => a + b, 0);

  return {
    rows: rowCount,
    dim,
    energy: Math.sqrt(rawSq / Math.max(1, rowCount * dim)),
    centeredEnergy: Math.sqrt(centeredVariance),
    lambdaMax: lambda,
    mpEdge,
    normalizedEdge: centeredVariance > 0 ? lambda / (centeredVariance * mpEdge) : 0,
    maxColumnVarianceShare: varianceTotal > 0 ? Math.max(...columnVariances) / varianceTotal : 0,
    strongestColumns: columnRms.slice(0, 8),
  };
}

function blockBounds(endpoint) {
  const lo = Math.floor(endpoint / 2);
  const hi = endpoint;
  return Array.from({ length: blockCount }, (_, i) => ({
    lo: Math.floor(lo + ((hi - lo) * i) / blockCount),
    hi: Math.floor(lo + ((hi - lo) * (i + 1)) / blockCount),
  }));
}

function upperBound(values, x) {
  let lo = 0, hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (values[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function buildRoughFlags(primeFlags, roughPrimes) {
  const rough = new Uint8Array(maxN + 1);
  for (let n = 3; n <= maxN; n += 2) rough[n] = 1;
  for (const p of roughPrimes) {
    if (p === 2) continue;
    for (let n = p; n <= maxN; n += p) rough[n] = 0;
  }
  const roughComposite = new Uint8Array(maxN + 1);
  for (let n = 3; n <= maxN; n += 2) {
    if (rough[n] && !primeFlags[n]) roughComposite[n] = 1;
  }
  return { rough, roughComposite };
}

function integerMeta(moduli) {
  const out = [];
  for (const modulus of moduli) for (let residue = 1; residue < modulus; residue++) out.push({ universe: "Z", modulus, residue });
  return out;
}

function emptyCounts(moduli) {
  return moduli.map((modulus) => new Float64Array(modulus - 1));
}

function addResidue(counts, value, moduli) {
  for (let i = 0; i < moduli.length; i++) {
    const residue = value % moduli[i];
    if (residue > 0) counts[i][residue - 1]++;
  }
}

function blockCounts(lo, hi, moduli, primeFlags, roughFlags, cramerLabels = []) {
  const rough = emptyCounts(moduli);
  const roughComposite = emptyCounts(moduli);
  const real = emptyCounts(moduli);
  const cramer = emptyCounts(moduli);
  let roughTotal = 0;
  let compositeTotal = 0;
  let realTotal = 0;
  let cramerTotal = 0;

  for (let n = (lo + 1) | 1; n <= hi; n += 2) {
    if (roughFlags.rough[n]) {
      roughTotal++;
      addResidue(rough, n, moduli);
      if (roughFlags.roughComposite[n]) {
        compositeTotal++;
        addResidue(roughComposite, n, moduli);
      }
    }
    if (primeFlags[n]) {
      realTotal++;
      addResidue(real, n, moduli);
    }
  }
  const start = upperBound(cramerLabels, lo);
  for (let i = start; i < cramerLabels.length && cramerLabels[i] <= hi; i++) {
    const n = cramerLabels[i];
    if (n % 2 === 0) continue;
    cramerTotal++;
    addResidue(cramer, n, moduli);
  }
  return { rough, roughComposite, real, cramer, roughTotal, compositeTotal, realTotal, cramerTotal };
}

function residualRow(observed, expectedWeights, observedTotal) {
  const row = [];
  for (let i = 0; i < observed.length; i++) {
    const weights = expectedWeights[i];
    const weightTotal = weights.reduce((a, b) => a + b, 0);
    for (let j = 0; j < observed[i].length; j++) {
      const expected = weightTotal > 0 ? observedTotal * weights[j] / weightTotal : 0;
      row.push(expected > 0 ? (observed[i][j] - expected) / Math.sqrt(expected) : 0);
    }
  }
  return row;
}

function randomObserved(total, weightsByModulus, random) {
  return weightsByModulus.map((weights) => multinomial(total, Array.from(weights), random));
}

function summarizeRuns(runs) {
  return {
    edge: range(runs.map((run) => run.normalizedEdge)),
    energy: range(runs.map((run) => run.energy)),
    maxColumnVarianceShare: range(runs.map((run) => run.maxColumnVarianceShare)),
  };
}

function integerRows(endpoint, moduli, primeFlags, roughFlags, mode, seed = 0, cramerLabels = []) {
  const random = rng(seed);
  const rows = [];
  for (const block of blockBounds(endpoint)) {
    const counts = blockCounts(block.lo, block.hi, moduli, primeFlags, roughFlags, cramerLabels);
    let observed = counts.real;
    let total = counts.realTotal;
    if (mode === "rough-random") observed = randomObserved(counts.realTotal, counts.rough, random);
    if (mode === "rough-composite") observed = randomObserved(counts.realTotal, counts.roughComposite, random);
    if (mode === "cramer") {
      observed = counts.cramer;
      total = counts.cramerTotal;
    }
    rows.push(residualRow(observed, counts.rough, total));
  }
  return rows;
}

function fitSlope(rows, key = "excessEdge") {
  const usable = rows.filter((row) => Math.abs(row[key]) > 0 && row.N > 1);
  if (usable.length < 2) return NaN;
  const xs = usable.map((row) => Math.log(row.N));
  const ys = usable.map((row) => Math.log(Math.abs(row[key])));
  const mx = mean(xs), my = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : NaN;
}

function integerAudit() {
  console.error(`[quotient-spectral] integer sieve to ${maxN}`);
  const primeFlags = sieve(maxN);
  const roughPrimes = primesUpTo(roughCutoff);
  const roughFlags = buildRoughFlags(primeFlags, roughPrimes);
  const cramerBySeed = seeds.map((seed) => cramerPrimes(maxN, seed));
  const byBudget = [];
  for (const budget of integerBudgets) {
    const moduli = integerModuli.slice(0, budget);
    const meta = integerMeta(moduli);
    const rows = [];
    for (const endpoint of endpoints) {
      console.error(`[quotient-spectral] Z endpoint ${endpoint}, budget ${budget}`);
      const real = spectralSummary(integerRows(endpoint, moduli, primeFlags, roughFlags, "real"), meta);
      const random = seeds.map((seed) => spectralSummary(integerRows(endpoint, moduli, primeFlags, roughFlags, "rough-random", seed), meta));
      const composite = seeds.map((seed) => spectralSummary(integerRows(endpoint, moduli, primeFlags, roughFlags, "rough-composite", seed ^ 0x85ebca6b), meta));
      const cramer = seeds.map((seed, i) => spectralSummary(integerRows(endpoint, moduli, primeFlags, roughFlags, "cramer", seed, cramerBySeed[i]), meta));
      const randomMean = mean(random.map((run) => run.normalizedEdge));
      rows.push({
        N: endpoint,
        real,
        random: summarizeRuns(random),
        composite: summarizeRuns(composite),
        cramer: summarizeRuns(cramer),
        excessEdge: real.normalizedEdge - randomMean,
      });
    }
    byBudget.push({ budget, moduli, rows, edgeSlope: fitSlope(rows) });
  }
  return { roughCutoff, moduli: integerModuli, budgets: integerBudgets, endpoints, byBudget };
}

function polynomialModuli(universe, maxDegree, limit = Infinity) {
  const out = [];
  for (let degree = 1; degree <= maxDegree; degree++) {
    for (const modulus of universe.irreduciblesByDegree[degree]) {
      out.push({
        q: universe.q,
        degree,
        modulus,
        label: polyToString(modulus, universe.q),
        norm: universe.q ** degree,
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function fieldMeta(moduli, q) {
  const out = [];
  for (const spec of moduli) {
    for (let residue = 1; residue < spec.norm; residue++) {
      out.push({ universe: `F_${q}[t]`, modulus: spec.label, modulusDegree: spec.degree, residue });
    }
  }
  return out;
}

function fieldRoughCenters(universe, degree, roughDegree) {
  const lead = universe.pow[degree];
  const factors = [];
  for (let d = 1; d <= Math.min(roughDegree, degree - 1); d++) factors.push(...universe.irreduciblesByDegree[d]);
  const rough = [];
  const roughComposite = [];
  const flags = universe.irreducibleFlagsByDegree[degree];
  for (let lower = 0; lower < universe.pow[degree]; lower++) {
    const poly = lead + lower;
    let ok = true;
    for (const factor of factors) {
      if (polyMod(poly, factor, universe.q) === 0) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    rough.push(poly);
    if (!flags[lower]) roughComposite.push(poly);
  }
  return { rough, roughComposite };
}

function addPolyResidue(counts, poly, moduli, q) {
  for (let i = 0; i < moduli.length; i++) {
    const residue = polyMod(poly, moduli[i].modulus, q);
    if (residue > 0) counts[i][residue - 1]++;
  }
}

function fieldCounts(universe, degree, allModuli, roughDegree) {
  const real = emptyCounts(allModuli.map((spec) => spec.norm));
  const roughCounts = emptyCounts(allModuli.map((spec) => spec.norm));
  const compositeCounts = emptyCounts(allModuli.map((spec) => spec.norm));
  const { rough, roughComposite } = fieldRoughCenters(universe, degree, roughDegree);
  const irreducibles = universe.irreduciblesByDegree[degree];
  for (const poly of irreducibles) addPolyResidue(real, poly, allModuli, universe.q);
  for (const poly of rough) addPolyResidue(roughCounts, poly, allModuli, universe.q);
  for (const poly of roughComposite) addPolyResidue(compositeCounts, poly, allModuli, universe.q);
  return {
    degree,
    real,
    rough: roughCounts,
    composite: compositeCounts,
    realTotal: irreducibles.length,
    roughTotal: rough.length,
    compositeTotal: roughComposite.length,
  };
}

function sliceCounts(counts, budget) {
  return counts.slice(0, budget);
}

function fieldRowsFromPrepared(prepared, budget, mode, seed = 0) {
  const random = rng(seed);
  const rows = [];
  for (const counts of prepared) {
    let observed = sliceCounts(counts.real, budget);
    if (mode === "rough-random") observed = randomObserved(counts.realTotal, sliceCounts(counts.rough, budget), random);
    if (mode === "rough-composite") observed = randomObserved(counts.realTotal, sliceCounts(counts.composite, budget), random);
    rows.push(residualRow(observed, sliceCounts(counts.rough, budget), counts.realTotal));
  }
  return rows;
}

function fieldAudit(spec) {
  console.error(`[quotient-spectral] F_${spec.q}[t] to degree ${spec.maxDegree}`);
  const universe = buildPolynomialUniverse(spec.q, spec.maxDegree);
  const allModuli = polynomialModuli(universe, spec.maxModulusDegree);
  const budgets = [2, 3, 5, 8].filter((budget) => budget <= allModuli.length);
  const prepared = spec.degrees
    .filter((degree) => degree >= 2 && degree <= spec.maxDegree)
    .map((degree) => fieldCounts(universe, degree, allModuli, spec.roughDegree));
  const byBudget = [];
  for (const budget of budgets) {
    const moduli = allModuli.slice(0, budget);
    const meta = fieldMeta(moduli, spec.q);
    const real = spectralSummary(fieldRowsFromPrepared(prepared, budget, "real"), meta);
    const random = seeds.map((seed) => spectralSummary(fieldRowsFromPrepared(prepared, budget, "rough-random", seed), meta));
    const composite = seeds.map((seed) => spectralSummary(fieldRowsFromPrepared(prepared, budget, "rough-composite", seed ^ 0x85ebca6b), meta));
    byBudget.push({
      budget,
      moduli: moduli.map((item) => item.label),
      real,
      random: summarizeRuns(random),
      composite: summarizeRuns(composite),
    });
  }
  return {
    q: spec.q,
    maxDegree: spec.maxDegree,
    degrees: prepared.map((row) => row.degree),
    roughDegree: spec.roughDegree,
    moduli: allModuli.map((item) => item.label),
    byBudget,
  };
}

function strongest(summary) {
  return summary.strongestColumns
    .map((item) => `${item.universe}:${item.modulus}:r${item.residue}=${fmt(item.rms, 3)}`)
    .join(", ");
}

function markdownReport(result) {
  const finalBudget = result.integer.byBudget.at(-1);
  const finalRows = finalBudget.rows;
  const finalRow = finalRows.at(-1);
  const budgetRows = result.integer.byBudget.map((group) => {
    const row = group.rows.at(-1);
    return `| ${group.budget} | ${group.moduli.join(",")} | ${fmt(row.real.normalizedEdge)} | ${fmt(row.random.edge[0])}..${fmt(row.random.edge[1])} | ${fmt(row.composite.edge[0])}..${fmt(row.composite.edge[1])} | ${fmt(row.cramer.edge[0])}..${fmt(row.cramer.edge[1])} | ${fmt(group.edgeSlope)} |`;
  }).join("\n");
  const traceRows = finalRows.map((row) => `| ${row.N} | ${fmt(row.real.normalizedEdge)} | ${fmt(row.real.energy)} | ${fmt(row.random.edge[0])}..${fmt(row.random.edge[1])} | ${fmt(row.composite.edge[0])}..${fmt(row.composite.edge[1])} | ${fmt(row.excessEdge)} |`).join("\n");
  const fieldRows = result.fields.flatMap((field) => field.byBudget.map((row) => `| F_${field.q}[t] | ${field.degrees.join(",")} | ${row.budget} | ${row.moduli.join(", ")} | ${fmt(row.real.normalizedEdge)} | ${fmt(row.random.edge[0])}..${fmt(row.random.edge[1])} | ${fmt(row.composite.edge[0])}..${fmt(row.composite.edge[1])} |`)).join("\n");

  return `# Quotient spectral residual audit

Candidate:
build prime-indicator residual rows after rough/local admissibility subtraction,
then score the quotient-residue covariance spectral edge normalized by the
Marchenko-Pastur edge. Residue-cell basis is an orthogonal transform away from
Fourier/character modes for the same quotient energy.

Integer rough cutoff: \`${result.integer.roughCutoff}\`; block count:
\`${blockCount}\`; control seeds: \`${seeds.length}\`.

## Integer final endpoint by quotient budget

| budget | moduli | Z edge | rough-random edge range | rough-composite edge range | Cramer edge range | excess edge slope |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
${budgetRows}

## Integer budget-${finalBudget.budget} scale trace

| N | Z edge | Z energy | rough-random edge range | rough-composite edge range | excess edge |
| ---: | ---: | ---: | ---: | ---: | ---: |
${traceRows}

Final strongest Z columns:
\`${strongest(finalRow.real)}\`

## Function-field quotient budgets

| universe | degrees | budget | moduli | real edge | rough-random edge range | rough-composite edge range |
| --- | --- | ---: | --- | ---: | ---: | ---: |
${fieldRows}

JSON: \`${result.paths.json}\`
SVG: \`${result.paths.svg}\`
`;
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (value) => y + h - ((value - minY) / (maxY - minY || 1)) * h;
  return values.map((value, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(value).toFixed(2)}`).join(" ");
}

function svgPlot(result) {
  const width = 1180, height = 680;
  const chart = { x: 84, y: 82, w: 710, h: 390 };
  const finalBudget = result.integer.byBudget.at(-1);
  const values = finalBudget.rows.map((row) => row.real.normalizedEdge);
  const randomLow = finalBudget.rows.map((row) => row.random.edge[0]);
  const randomHigh = finalBudget.rows.map((row) => row.random.edge[1]);
  const compositeLow = finalBudget.rows.map((row) => row.composite.edge[0]);
  const compositeHigh = finalBudget.rows.map((row) => row.composite.edge[1]);
  const all = [...values, ...randomLow, ...randomHigh, ...compositeLow, ...compositeHigh, 1].filter(Number.isFinite);
  const minY = Math.min(...all) * 0.9;
  const maxY = Math.max(...all) * 1.1;
  const y = (value) => chart.y + chart.h - ((value - minY) / (maxY - minY || 1)) * chart.h;
  const band = (lo, hi, color, opacity) => {
    const sx = (i) => chart.x + (i / Math.max(1, lo.length - 1)) * chart.w;
    const top = hi.map((value, i) => `${sx(i)},${y(value)}`);
    const bottom = lo.map((value, i) => `${sx(lo.length - 1 - i)},${y(value)}`);
    return `<polygon points="${[...top, ...bottom].join(" ")}" fill="${color}" opacity="${opacity}"/>`;
  };
  const fieldRows = result.fields.flatMap((field) => field.byBudget.map((row) => ({
    label: `F${field.q} b${row.budget}`,
    value: row.real.normalizedEdge,
    range: row.random.edge,
    color: field.q === 2 ? "#a78bfa" : field.q === 3 ? "#60a5fa" : "#34d399",
  })));
  const barX = 858, barW = 218;
  const barMax = Math.max(1, ...fieldRows.flatMap((row) => [row.value, row.range[1]]));
  const bars = fieldRows.map((row, i) => {
    const yy = 116 + i * 29;
    const w = (row.value / barMax) * barW;
    const r0 = barX + (row.range[0] / barMax) * barW;
    const r1 = barX + (row.range[1] / barMax) * barW;
    return `<text x="${barX - 62}" y="${yy + 4}" fill="${row.color}" font-size="12">${row.label}</text>
<line x1="${r0}" y1="${yy + 1}" x2="${r1}" y2="${yy + 1}" stroke="#f4a261" stroke-width="5" opacity="0.65"/>
<rect x="${barX}" y="${yy - 10}" width="${w}" height="13" fill="${row.color}"/>
<text x="${barX + w + 8}" y="${yy + 1}" fill="#dbeafe" font-size="11">${fmt(row.value, 3)}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#111827"/>
<text x="64" y="38" fill="#f9fafb" font-size="20" font-weight="700">Quotient spectral residual audit</text>
<text x="64" y="60" fill="#a7b0c4" font-size="13">Integer budget-${finalBudget.budget}: covariance edge after rough/local admissibility subtraction.</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="#0b1220" stroke="#263244"/>
${band(randomLow, randomHigh, "#2a9d8f", 0.18)}
${band(compositeLow, compositeHigh, "#a78bfa", 0.16)}
<path d="${linePath(values, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f8fafc" stroke-width="3"/>
${values.map((value, i) => `<circle cx="${chart.x + (i / Math.max(1, values.length - 1)) * chart.w}" cy="${y(value)}" r="4" fill="#f8fafc"/><text x="${chart.x + (i / Math.max(1, values.length - 1)) * chart.w}" y="${chart.y + chart.h + 24}" text-anchor="middle" fill="#9ca3af" font-size="11">${endpoints[i] >= 1000000 ? `${endpoints[i] / 1000000}M` : `${Math.round(endpoints[i] / 1000)}k`}</text>`).join("\n")}
<text x="${chart.x}" y="${chart.y + chart.h + 52}" fill="#a7b0c4" font-size="12">teal: rough-random controls; violet: rough-composite controls</text>
<rect x="820" y="84" width="318" height="480" fill="#0b1220" stroke="#263244"/>
<text x="850" y="62" fill="#dbeafe" font-size="14">function-field quotient edges</text>
${bars}
</svg>`;
}

console.error(`[quotient-spectral] starting audit maxN=${maxN}`);
const integer = integerAudit();
const fields = fieldSpecs.map(fieldAudit);

const basename = `cycle-007-quotient-spectral-residual-${maxN}`;
const paths = {
  json: path.join(outDir, `${basename}.json`),
  md: path.join(outDir, `${basename}.md`),
  svg: path.join(outDir, `${basename}.svg`),
};
const result = {
  candidate: "quotient spectral residual edge",
  generatedAt: new Date().toISOString(),
  maxN,
  q2MaxDegree,
  q3MaxDegree,
  q5MaxDegree,
  roughCutoff,
  blockCount,
  seeds,
  requiredIntegerEndpoints,
  integer,
  fields,
  paths,
};
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(paths.json, `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(paths.md, markdownReport(result));
fs.writeFileSync(paths.svg, svgPlot(result));

const finalIntegerBudget = integer.byBudget.at(-1);
const finalInteger = finalIntegerBudget.rows.at(-1);
console.log(JSON.stringify({
  ok: true,
  candidate: result.candidate,
  integerFinal: {
    budget: finalIntegerBudget.budget,
    N: finalInteger.N,
    edge: finalInteger.real.normalizedEdge,
    energy: finalInteger.real.energy,
    randomEdge: finalInteger.random.edge,
    compositeEdge: finalInteger.composite.edge,
    cramerEdge: finalInteger.cramer.edge,
    excessEdgeSlope: finalIntegerBudget.edgeSlope,
  },
  fields: fields.map((field) => ({
    q: field.q,
    finalBudget: field.byBudget.at(-1)?.budget ?? 0,
    edge: field.byBudget.at(-1)?.real.normalizedEdge ?? NaN,
    randomEdge: field.byBudget.at(-1)?.random.edge ?? [NaN, NaN],
    compositeEdge: field.byBudget.at(-1)?.composite.edge ?? [NaN, NaN],
  })),
  paths,
}, null, 2));
