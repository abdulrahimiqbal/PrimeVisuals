#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyMod,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(10000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/playground-artifacts";
const roughCutoff = Number.parseInt(process.argv[4] || "257", 10);
const blockCount = 24;
const integerModuli = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
const budgets = [3, 5, 8, 10];
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(10000, Math.round(maxN * f)));
const seeds = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 112358, 141421, 173205, 223606,
  99991, 100003, 444444, 555555, 777777,
];
const fieldSpecs = [
  { q: 3, maxDegree: 11, degrees: [8, 9, 10, 11], maxModulusDegree: 2 },
  { q: 5, maxDegree: 7, degrees: [4, 5, 6, 7], maxModulusDegree: 1 },
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
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (values[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function valuesInRange(values, lo, hi) {
  const start = upperBound(values, lo);
  const out = [];
  for (let i = start; i < values.length && values[i] <= hi; i++) out.push(values[i]);
  return out;
}

function buildRoughFlags(primeFlags, roughPrimes) {
  const flags = new Uint8Array(maxN + 1);
  for (let n = 1001 | 1; n <= maxN; n += 2) flags[n] = 1;
  for (const p of roughPrimes) {
    if (p === 2) continue;
    for (let n = p; n <= maxN; n += p) flags[n] = 0;
  }
  const composite = new Uint8Array(maxN + 1);
  for (let n = 1001 | 1; n <= maxN; n += 2) {
    if (flags[n] && !primeFlags[n]) composite[n] = 1;
  }
  return { rough: flags, composite };
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
      if (roughFlags.composite[n]) {
        compositeTotal++;
        addResidue(roughComposite, n, moduli);
      }
    }
    if (primeFlags[n]) {
      realTotal++;
      addResidue(real, n, moduli);
    }
  }
  for (const n of cramerLabels) {
    if (n <= lo || n > hi || n % 2 === 0) continue;
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
  const random = mulberry32(seed);
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

function fitTheta(rows, key = "excessEdge") {
  const usable = rows.filter((row) => Math.abs(row[key]) > 0 && row.N > 1);
  if (usable.length < 2) return NaN;
  const xs = usable.map((row) => Math.log(row.N));
  const ys = usable.map((row) => Math.log(Math.abs(row[key])));
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

function integerAudit() {
  console.error(`[rough-current] integer sieve to ${maxN}`);
  const primeFlags = sieve(maxN);
  const roughPrimes = primesUpTo(roughCutoff);
  const roughFlags = buildRoughFlags(primeFlags, roughPrimes);
  const cramerBySeed = seeds.map((seed) => cramerPrimes(maxN, seed));
  const byBudget = [];
  for (const budget of budgets) {
    const moduli = integerModuli.slice(0, budget);
    const meta = integerMeta(moduli);
    const rows = [];
    for (const endpoint of endpoints) {
      console.error(`[rough-current] Z endpoint ${endpoint}, budget ${budget}`);
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
    byBudget.push({ budget, moduli, rows, theta: fitTheta(rows) });
  }
  const named = [25, 35, 77, 289].map((center) => ({
    center,
    roughEligible: center <= maxN ? roughFlags.rough[center] === 1 : false,
    residues: Object.fromEntries(integerModuli.slice(0, 5).map((modulus) => [modulus, center % modulus])),
  }));
  return { roughCutoff, moduli: integerModuli, budgets, byBudget, named };
}

function polynomialModuli(universe, maxDegree, limit) {
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
  for (let d = 1; d <= roughDegree; d++) factors.push(...universe.irreduciblesByDegree[d]);
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

function fieldCounts(universe, degree, moduli, roughDegree) {
  const real = emptyCounts(moduli.map((spec) => spec.norm));
  const roughCounts = emptyCounts(moduli.map((spec) => spec.norm));
  const compositeCounts = emptyCounts(moduli.map((spec) => spec.norm));
  const { rough, roughComposite } = fieldRoughCenters(universe, degree, roughDegree);
  const irreducibles = universe.irreduciblesByDegree[degree];
  for (const poly of irreducibles) addPolyResidue(real, poly, moduli, universe.q);
  for (const poly of rough) addPolyResidue(roughCounts, poly, moduli, universe.q);
  for (const poly of roughComposite) addPolyResidue(compositeCounts, poly, moduli, universe.q);
  return {
    real,
    rough: roughCounts,
    composite: compositeCounts,
    realTotal: irreducibles.length,
    roughTotal: rough.length,
    compositeTotal: roughComposite.length,
  };
}

function prepareFieldCounts(spec, universe, moduli) {
  return spec.degrees.map((degree) => {
    const roughDegree = Math.max(1, Math.floor(degree / 2) - 1);
    return fieldCounts(universe, degree, moduli, roughDegree);
  });
}

function fieldRowsFromPrepared(prepared, mode, seed = 0) {
  const random = mulberry32(seed);
  const rows = [];
  for (const counts of prepared) {
    let observed = counts.real;
    if (mode === "rough-random") observed = randomObserved(counts.realTotal, counts.rough, random);
    if (mode === "rough-composite") observed = randomObserved(counts.realTotal, counts.composite, random);
    rows.push(residualRow(observed, counts.rough, counts.realTotal));
  }
  return rows;
}

function fieldAudit(spec) {
  console.error(`[rough-current] F_${spec.q}[t] to degree ${spec.maxDegree}`);
  const universe = buildPolynomialUniverse(spec.q, spec.maxDegree);
  const allModuli = polynomialModuli(universe, spec.maxModulusDegree, Math.max(...budgets));
  const byBudget = [];
  for (const budget of budgets.filter((b) => b <= allModuli.length)) {
    const moduli = allModuli.slice(0, budget);
    const meta = fieldMeta(moduli, spec.q);
    const prepared = prepareFieldCounts(spec, universe, moduli);
    const real = spectralSummary(fieldRowsFromPrepared(prepared, "real"), meta);
    const random = seeds.map((seed) => spectralSummary(fieldRowsFromPrepared(prepared, "rough-random", seed), meta));
    const composite = seeds.map((seed) => spectralSummary(fieldRowsFromPrepared(prepared, "rough-composite", seed ^ 0x85ebca6b), meta));
    byBudget.push({
      budget,
      moduli: moduli.map((item) => item.label),
      real,
      random: summarizeRuns(random),
      composite: summarizeRuns(composite),
    });
  }
  return { q: spec.q, maxDegree: spec.maxDegree, degrees: spec.degrees, byBudget };
}

function strongest(summary) {
  return summary.strongestColumns
    .map((item) => `${item.universe}:${item.modulus}:r${item.residue}=${fmt(item.rms, 3)}`)
    .join(", ");
}

function markdownReport(result) {
  const budgetRows = result.integer.byBudget.map((group) => {
    const row = group.rows.at(-1);
    const f3 = result.fields[0].byBudget.find((item) => item.budget === group.budget);
    const f5 = result.fields[1].byBudget.find((item) => item.budget === group.budget);
    return `| ${group.budget} | ${group.moduli.join(",")} | ${fmt(row.real.normalizedEdge)} | ${fmt(row.random.edge[0])}..${fmt(row.random.edge[1])} | ${fmt(row.composite.edge[0])}..${fmt(row.composite.edge[1])} | ${fmt(row.cramer.edge[0])}..${fmt(row.cramer.edge[1])} | ${f3 ? fmt(f3.real.normalizedEdge) : "NA"} | ${f3 ? `${fmt(f3.random.edge[0])}..${fmt(f3.random.edge[1])}` : "NA"} | ${f5 ? fmt(f5.real.normalizedEdge) : "NA"} | ${f5 ? `${fmt(f5.random.edge[0])}..${fmt(f5.random.edge[1])}` : "NA"} |`;
  }).join("\n");
  const traceRows = result.integer.byBudget.at(-1).rows.map((row) => `| ${row.N} | ${fmt(row.real.normalizedEdge)} | ${fmt(row.real.energy)} | ${fmt(row.random.edge[0])}..${fmt(row.random.edge[1])} | ${fmt(row.composite.edge[0])}..${fmt(row.composite.edge[1])} | ${fmt(row.excessEdge)} |`).join("\n");
  const namedRows = result.integer.named.map((row) => `| ${row.center} | ${row.roughEligible ? "yes" : "no"} | ${Object.entries(row.residues).map(([m, r]) => `${m}:${r}`).join(", ")} |`).join("\n");
  const finalBudget = result.integer.byBudget.at(-1);
  const finalRow = finalBudget.rows.at(-1);

  return `# rough-shell residue-current spectral edge audit

Candidate:
count prime residues in fresh blocks, whiten every residue cell against
the exact \`${result.integer.roughCutoff}\`-rough shell in the same block,
and score the covariance spectral edge normalized by a Marchenko-Pastur
edge. This is non-neighbor and avoids uniform/Cramer as the primary null.

## Final endpoint budget comparison

| budget | Z moduli | Z edge | Z rough-random edge range | Z rough-composite edge range | Cramer edge range | F3 edge | F3 rough-random edge range | F5 edge | F5 rough-random edge range |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${budgetRows}

## Integer budget-${finalBudget.budget} endpoint trace

Theta for excess edge: \`${fmt(finalBudget.theta)}\`

| N | real edge | real energy | rough-random edge range | rough-composite edge range | excess edge |
| ---: | ---: | ---: | ---: | ---: | ---: |
${traceRows}

Final strongest Z columns:
\`${strongest(finalRow.real)}\`

Named composite centers:

| center | 257-rough eligible | residues |
| ---: | --- | --- |
${namedRows}

## Function-field final budgets

F_3[t] strongest columns:
\`${strongest(result.fields[0].byBudget.at(-1).real)}\`

F_5[t] strongest columns:
\`${strongest(result.fields[1].byBudget.at(-1).real)}\`

SVG: \`${result.svgPath}\`
JSON: \`${result.jsonPath}\`
`;
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((value, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(value).toFixed(2)}`).join(" ");
}

function svgPlot(result) {
  const width = 1160;
  const height = 660;
  const chart = { x: 82, y: 78, w: 700, h: 380 };
  const finalBudget = result.integer.byBudget.at(-1);
  const values = finalBudget.rows.map((row) => row.real.normalizedEdge);
  const randomLow = finalBudget.rows.map((row) => row.random.edge[0]);
  const randomHigh = finalBudget.rows.map((row) => row.random.edge[1]);
  const compositeLow = finalBudget.rows.map((row) => row.composite.edge[0]);
  const compositeHigh = finalBudget.rows.map((row) => row.composite.edge[1]);
  const all = [...values, ...randomLow, ...randomHigh, ...compositeLow, ...compositeHigh, 1].filter(Number.isFinite);
  const minY = Math.min(...all) * 0.9;
  const maxY = Math.max(...all) * 1.1;
  const y = (v) => chart.y + chart.h - ((v - minY) / (maxY - minY || 1)) * chart.h;
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
    color: field.q === 3 ? "#60a5fa" : "#34d399",
  })));
  const barX = 850;
  const barW = 210;
  const barMax = Math.max(1, ...fieldRows.flatMap((row) => [row.value, row.range[1]]));
  const bars = fieldRows.map((row, i) => {
    const yy = 112 + i * 31;
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
<text x="64" y="38" fill="#f9fafb" font-size="20" font-weight="700">Rough-shell residue-current spectral edge</text>
<text x="64" y="60" fill="#a7b0c4" font-size="13">Integer budget-${finalBudget.budget}: covariance edge after whitening by the ${result.integer.roughCutoff}-rough shell.</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="#0b1220" stroke="#263244"/>
${band(randomLow, randomHigh, "#2a9d8f", 0.18)}
${band(compositeLow, compositeHigh, "#a78bfa", 0.16)}
<path d="${linePath(values, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f8fafc" stroke-width="3"/>
${values.map((value, i) => `<circle cx="${chart.x + (i / Math.max(1, values.length - 1)) * chart.w}" cy="${y(value)}" r="4" fill="#f8fafc"/><text x="${chart.x + (i / Math.max(1, values.length - 1)) * chart.w}" y="${chart.y + chart.h + 24}" text-anchor="middle" fill="#9ca3af" font-size="11">${endpoints[i] >= 1000000 ? `${endpoints[i] / 1000000}M` : `${Math.round(endpoints[i] / 1000)}k`}</text>`).join("\n")}
<text x="${chart.x}" y="${chart.y + chart.h + 52}" fill="#a7b0c4" font-size="12">teal: rough-random controls; violet: rough-composite controls</text>
<rect x="810" y="82" width="310" height="450" fill="#0b1220" stroke="#263244"/>
<text x="840" y="58" fill="#dbeafe" font-size="14">function-field budget edges</text>
${bars}
</svg>`;
}

console.error(`[rough-current] starting audit N=${maxN}`);
const integer = integerAudit();
const fields = fieldSpecs.map(fieldAudit);

fs.mkdirSync(outDir, { recursive: true });
const basename = `rough-residue-current-${maxN}`;
const result = {
  candidate: "rough-shell residue-current spectral edge",
  maxN,
  integer,
  fields,
  generatedAt: new Date().toISOString(),
};
result.jsonPath = path.join(outDir, `${basename}.json`);
result.mdPath = path.join(outDir, `${basename}.md`);
result.svgPath = path.join(outDir, `${basename}.svg`);
fs.writeFileSync(result.jsonPath, `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(result.mdPath, markdownReport(result));
fs.writeFileSync(result.svgPath, svgPlot(result));
const final = integer.byBudget.at(-1).rows.at(-1);
console.log(JSON.stringify({
  ok: true,
  candidate: result.candidate,
  integerFinal: {
    budget: integer.byBudget.at(-1).budget,
    N: final.N,
    edge: final.real.normalizedEdge,
    energy: final.real.energy,
    randomEdge: final.random.edge,
    compositeEdge: final.composite.edge,
    cramerEdge: final.cramer.edge,
    theta: integer.byBudget.at(-1).theta,
  },
  fields: fields.map((field) => ({
    q: field.q,
    finalBudget: field.byBudget.at(-1).budget,
    edge: field.byBudget.at(-1).real.normalizedEdge,
    randomEdge: field.byBudget.at(-1).random.edge,
    compositeEdge: field.byBudget.at(-1).composite.edge,
  })),
  mdPath: result.mdPath,
  jsonPath: result.jsonPath,
  svgPath: result.svgPath,
}, null, 2));
