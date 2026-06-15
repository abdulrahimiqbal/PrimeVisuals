#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polynomialTwinPrediction,
  twinIrreducibleCounts,
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
const fieldSpecs = [
  { q: 3, maxDegree: 14, degrees: [10, 11, 12, 13, 14] },
  { q: 5, maxDegree: 9, degrees: [5, 6, 7, 8, 9] },
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

function range(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length ? [Math.min(...usable), Math.max(...usable)] : [NaN, NaN];
}

function fmt(x, digits = 6) {
  return Number.isFinite(x) ? x.toFixed(digits) : "NA";
}

function sampleSorted(items, k, seed) {
  const rnd = mulberry32(seed);
  const reservoir = [];
  for (let i = 0; i < items.length; i++) {
    if (i < k) {
      reservoir.push(items[i]);
      continue;
    }
    const j = Math.floor(rnd() * (i + 1));
    if (j < k) reservoir[j] = items[i];
  }
  return reservoir.sort((a, b) => a - b);
}

function fitTheta(rows, key = "residual") {
  const pts = rows.filter((r) => Math.abs(r[key]) > 0 && r.scale > 1);
  if (pts.length < 2) return NaN;
  const xs = pts.map((r) => Math.log(r.scale));
  const ys = pts.map((r) => Math.log(Math.abs(r[key])));
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : NaN;
}

function finitePairSingular(h, cutoff) {
  const smallPrimes = primesUpTo(cutoff);
  let product = 1;
  for (const ell of smallPrimes) {
    const nu = h % ell === 0 ? 1 : 2;
    const denominator = (1 - 1 / ell) ** 2;
    product *= (1 - nu / ell) / denominator;
    if (product === 0) break;
  }
  return product;
}

const maxShift = Math.max(...shifts);
const singularCutoff = Math.floor(Math.sqrt(maxN + maxShift));
const singularByShift = new Map(shifts.map((h) => [h, finitePairSingular(h, singularCutoff)]));

function companionProbability(n, h) {
  return Math.min(0.95, singularByShift.get(h) / Math.log(Math.max(3, n)));
}

function scoreCenters(name, centers, companionFlags) {
  const sorted = Array.from(new Set(centers.filter((n) => n >= 1000 && n <= maxN))).sort((a, b) => a - b);
  const rows = [];
  const byShift = Object.fromEntries(shifts.map((h) => [h, { observed: 0, expected: 0, variance: 0 }]));
  let cursor = 0;
  let observed = 0;
  let expected = 0;
  let variance = 0;
  for (const endpoint of endpoints) {
    while (cursor < sorted.length && sorted[cursor] <= endpoint) {
      const n = sorted[cursor++];
      for (const h of shifts) {
        if (n + h >= companionFlags.length) continue;
        const q = companionProbability(n, h);
        const hit = companionFlags[n + h] ? 1 : 0;
        observed += hit;
        expected += q;
        variance += q * (1 - q);
        byShift[h].observed += hit;
        byShift[h].expected += q;
        byShift[h].variance += q * (1 - q);
      }
    }
    const residual = observed - expected;
    rows.push({
      N: endpoint,
      scale: Math.max(1, expected),
      centers: cursor,
      observed,
      expected,
      variance,
      residual,
      z: variance > 0 ? residual / Math.sqrt(variance) : 0,
      observedPerCenter: cursor ? observed / cursor : 0,
      expectedPerCenter: cursor ? expected / cursor : 0,
      byShift: Object.fromEntries(shifts.map((h) => {
        const cell = byShift[h];
        const r = cell.observed - cell.expected;
        return [h, {
          observed: cell.observed,
          expected: cell.expected,
          residual: r,
          z: cell.variance > 0 ? r / Math.sqrt(cell.variance) : 0,
        }];
      })),
    });
  }
  return { name, labels: sorted.length, rows, theta: fitTheta(rows) };
}

function scoreHlBernoulli(name, primeCenters, seed) {
  const rnd = mulberry32(seed);
  const sorted = Array.from(new Set(primeCenters.filter((n) => n >= 1000 && n <= maxN))).sort((a, b) => a - b);
  const rows = [];
  const byShift = Object.fromEntries(shifts.map((h) => [h, { observed: 0, expected: 0, variance: 0 }]));
  let cursor = 0;
  let observed = 0;
  let expected = 0;
  let variance = 0;
  for (const endpoint of endpoints) {
    while (cursor < sorted.length && sorted[cursor] <= endpoint) {
      const n = sorted[cursor++];
      for (const h of shifts) {
        const q = companionProbability(n, h);
        const hit = rnd() < q ? 1 : 0;
        observed += hit;
        expected += q;
        variance += q * (1 - q);
        byShift[h].observed += hit;
        byShift[h].expected += q;
        byShift[h].variance += q * (1 - q);
      }
    }
    const residual = observed - expected;
    rows.push({
      N: endpoint,
      scale: Math.max(1, expected),
      centers: cursor,
      observed,
      expected,
      variance,
      residual,
      z: variance > 0 ? residual / Math.sqrt(variance) : 0,
      observedPerCenter: cursor ? observed / cursor : 0,
      expectedPerCenter: cursor ? expected / cursor : 0,
      byShift: Object.fromEntries(shifts.map((h) => {
        const cell = byShift[h];
        const r = cell.observed - cell.expected;
        return [h, {
          observed: cell.observed,
          expected: cell.expected,
          residual: r,
          z: cell.variance > 0 ? r / Math.sqrt(cell.variance) : 0,
        }];
      })),
    });
  }
  return { name, labels: sorted.length, rows, theta: fitTheta(rows) };
}

function wFakeLabels(N, seed, modulus = W) {
  const rnd = mulberry32(seed);
  const phi = phiOf(modulus);
  const scale = modulus / phi;
  const out = [];
  for (let n = 1001; n <= N; n += 2) {
    if (gcd(n, modulus) !== 1) continue;
    if (rnd() < Math.min(0.95, scale / Math.log(n))) out.push(n);
  }
  return out;
}

function labelFlags(labels, size) {
  const flags = new Uint8Array(size);
  for (const n of labels) if (n >= 0 && n < flags.length) flags[n] = 1;
  return flags;
}

function summarizeRuns(runs, index) {
  return {
    z: range(runs.map((r) => r.rows[index].z)),
    absZ: range(runs.map((r) => Math.abs(r.rows[index].z))),
    observedPerCenter: range(runs.map((r) => r.rows[index].observedPerCenter)),
    expectedPerCenter: range(runs.map((r) => r.rows[index].expectedPerCenter)),
    theta: range(runs.map((r) => r.theta)),
  };
}

function fieldOrbit(spec) {
  const universe = buildPolynomialUniverse(spec.q, spec.maxDegree);
  const constants = Array.from({ length: spec.q - 1 }, (_, i) => i + 1);
  const countByConstant = Object.fromEntries(constants.map((c) => [c, twinIrreducibleCounts(spec.q, spec.maxDegree, c)]));
  const predByConstant = Object.fromEntries(constants.map((c) => [c, spec.degrees.map((d) => polynomialTwinPrediction(spec.q, d, c, d))]));
  const rows = [];
  let cumulativeActual = 0;
  let cumulativeExpected = 0;
  for (let i = 0; i < spec.degrees.length; i++) {
    const degree = spec.degrees[i];
    const actualByConstant = {};
    const expectedByConstant = {};
    let actual = 0;
    let expected = 0;
    for (const c of constants) {
      actualByConstant[c] = countByConstant[c][degree];
      expectedByConstant[c] = predByConstant[c][i];
      actual += actualByConstant[c];
      expected += expectedByConstant[c];
    }
    cumulativeActual += actual;
    cumulativeExpected += expected;
    const residual = cumulativeActual - cumulativeExpected;
    rows.push({
      q: spec.q,
      degree,
      scale: Math.max(1, cumulativeExpected),
      actual,
      expected,
      residual: actual - expected,
      z: expected > 0 ? (actual - expected) / Math.sqrt(expected) : 0,
      cumulativeActual,
      cumulativeExpected,
      cumulativeResidual: residual,
      cumulativeZ: cumulativeExpected > 0 ? residual / Math.sqrt(cumulativeExpected) : 0,
      actualByConstant,
      expectedByConstant,
    });
  }
  return {
    q: spec.q,
    maxDegree: spec.maxDegree,
    constants,
    rows,
    theta: fitTheta(rows, "cumulativeResidual"),
  };
}

function namedCompositeChecks(primeFlags) {
  return [25, 35, 77, 121, 169, 289].map((n) => ({
    n,
    isPrime: Boolean(primeFlags[n]),
    hits: Object.fromEntries(shifts.map((h) => [h, Boolean(primeFlags[n + h])])),
    hitCount: shifts.reduce((sum, h) => sum + (primeFlags[n + h] ? 1 : 0), 0),
  }));
}

function makeSvg(data) {
  const width = 1120;
  const height = 780;
  const margin = { left: 92, right: 42, top: 92, bottom: 118 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const series = [
    { key: "integer", label: "Z primes", color: "#67e8f9", values: data.integer.real.rows.map((r) => r.z) },
    { key: "f3", label: "F3 constant orbit", color: "#f472b6", values: data.functionFields[0].rows.map((r) => r.cumulativeZ) },
    { key: "f5", label: "F5 constant orbit", color: "#f59e0b", values: data.functionFields[1].rows.map((r) => r.cumulativeZ) },
  ];
  const controlValues = data.integer.hlBernoulliRuns.flatMap((r) => r.rows.map((row) => row.z));
  const all = [...series.flatMap((s) => s.values), ...controlValues];
  const minY = Math.min(-5, ...all);
  const maxY = Math.max(5, ...all);
  const pad = 0.08 * (maxY - minY || 1);
  const lo = minY - pad;
  const hi = maxY + pad;
  const xAt = (i) => margin.left + (plotW * i) / (endpoints.length - 1);
  const yAt = (v) => margin.top + plotH - ((v - lo) / (hi - lo)) * plotH;
  const lines = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  lines.push(`<rect width="${width}" height="${height}" fill="#08111f"/>`);
  lines.push(`<text x="${margin.left}" y="38" fill="#e5e7eb" font-size="24" font-weight="700">Function-field constant-orbit companion residual</text>`);
  lines.push(`<text x="${margin.left}" y="66" fill="#94a3b8" font-size="15">Finite-field constant shifts first; integer shifts H={2,4,6,8,10,12} with HL Bernoulli controls</text>`);
  for (let g = 0; g <= 4; g++) {
    const y = margin.top + (plotH * g) / 4;
    const val = hi - ((hi - lo) * g) / 4;
    lines.push(`<line x1="${margin.left}" x2="${width - margin.right}" y1="${y}" y2="${y}" stroke="#223044" stroke-width="1"/>`);
    lines.push(`<text x="${margin.left - 12}" y="${y + 5}" fill="#94a3b8" text-anchor="end" font-size="13">${fmt(val, 2)}</text>`);
  }
  lines.push(`<line x1="${margin.left}" x2="${width - margin.right}" y1="${yAt(0)}" y2="${yAt(0)}" stroke="#cbd5e1" stroke-width="1.2" opacity="0.5"/>`);
  for (const run of data.integer.hlBernoulliRuns) {
    const d = run.rows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.z)}`).join(" ");
    lines.push(`<path d="${d}" fill="none" stroke="#a78bfa" stroke-width="1.2" opacity="0.28"/>`);
  }
  for (const s of series) {
    const d = s.values.map((v, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(v)}`).join(" ");
    lines.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="4"/>`);
    s.values.forEach((v, i) => lines.push(`<circle cx="${xAt(i)}" cy="${yAt(v)}" r="5" fill="${s.color}"/>`));
  }
  endpoints.forEach((N, i) => lines.push(`<text x="${xAt(i)}" y="${margin.top + plotH + 24}" fill="#94a3b8" text-anchor="middle" font-size="12">${N}</text>`));
  const legend = [
    ["Z primes", "#67e8f9"],
    ["HL Bernoulli controls", "#a78bfa"],
    ["F3 constant orbit", "#f472b6"],
    ["F5 constant orbit", "#f59e0b"],
  ];
  legend.forEach(([label, color], i) => {
    const x = margin.left + (i % 2) * 360;
    const y = height - 62 + Math.floor(i / 2) * 24;
    lines.push(`<line x1="${x}" x2="${x + 24}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="4"/>`);
    lines.push(`<text x="${x + 30}" y="${y + 5}" fill="#cbd5e1" font-size="13">${label}</text>`);
  });
  const end = data.integer.real.rows.at(-1);
  lines.push(`<text x="${margin.left}" y="${height - 18}" fill="#cbd5e1" font-size="14">Integer endpoint z=${fmt(end.z, 3)}, obs=${Math.round(end.observed)}, exp=${fmt(end.expected, 1)}, theta=${fmt(data.integer.real.theta, 3)}</text>`);
  lines.push(`</svg>`);
  return lines.join("\n");
}

function markdownReport(data) {
  const lines = [];
  const last = data.integer.real.rows.length - 1;
  lines.push("# Function-field constant-orbit companion residual audit", "");
  lines.push("Finite-field object is defined first: aggregate constant shifts `f+c`, `c in F_q^*`, over monic irreducibles and subtract polynomial twin-prime predictions.", "");
  lines.push(`Integer transport uses shifts ${JSON.stringify(shifts)} with finite singular products through primes <= ${singularCutoff}. Range: ${maxN}.`, "");
  lines.push("## Integer endpoint trace", "");
  lines.push("| N | centers | observed | expected | z | observed/center | expected/center |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const r of data.integer.real.rows) {
    lines.push(`| ${r.N} | ${r.centers} | ${Math.round(r.observed)} | ${fmt(r.expected)} | ${fmt(r.z)} | ${fmt(r.observedPerCenter)} | ${fmt(r.expectedPerCenter)} |`);
  }
  lines.push("", "## Integer controls at endpoint", "");
  lines.push("| control | z range | abs z range | theta range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const key of ["hlBernoulli", "w30030", "cramer", "composite"]) {
    const s = data.integer.summaries[key][last];
    lines.push(`| ${key} | ${fmt(s.z[0])}..${fmt(s.z[1])} | ${fmt(s.absZ[0])}..${fmt(s.absZ[1])} | ${fmt(s.theta[0])}..${fmt(s.theta[1])} |`);
  }
  lines.push("", "## Function-field constant orbit", "");
  for (const field of data.functionFields) {
    lines.push(`### F_${field.q}[t]`, "");
    lines.push("| degree | actual | predicted | cumulative z | per-degree z |");
    lines.push("| ---: | ---: | ---: | ---: | ---: |");
    for (const row of field.rows) {
      lines.push(`| ${row.degree} | ${row.actual} | ${fmt(row.expected)} | ${fmt(row.cumulativeZ)} | ${fmt(row.z)} |`);
    }
    lines.push(`Cumulative residual exponent: \`${fmt(field.theta)}\`.`, "");
  }
  lines.push("## Top integer shift cells", "");
  lines.push("| shift | observed | expected | z |");
  lines.push("| ---: | ---: | ---: | ---: |");
  const byShift = data.integer.real.rows.at(-1).byShift;
  for (const h of shifts) {
    const cell = byShift[h];
    lines.push(`| ${h} | ${cell.observed} | ${fmt(cell.expected)} | ${fmt(cell.z)} |`);
  }
  lines.push("", "## Named composite check", "");
  lines.push("| n | is prime | hit count among n+h | hits |");
  lines.push("| ---: | --- | ---: | --- |");
  for (const row of data.namedCompositeChecks) {
    lines.push(`| ${row.n} | ${row.isPrime ? "yes" : "no"} | ${row.hitCount} | ${JSON.stringify(row.hits)} |`);
  }
  lines.push("", "## Factor check", "");
  lines.push("A survivor must beat the integer HL Bernoulli controls after finite local products are fixed. If the integer real line sits inside those controls, the object is ordinary Hardy-Littlewood prime-pair noise, regardless of Cramer/W30030 behavior.");
  lines.push("", "## Files", "");
  lines.push(`- JSON: \`${data.jsonPath}\``);
  lines.push(`- SVG: \`${data.svgPath}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const primeFlags = sieve(maxN + maxShift + 64);
const realCenters = primesUpTo(maxN);
const real = scoreCenters("real-primes", realCenters, primeFlags);
const hlBernoulliRuns = seeds.map((seed) => scoreHlBernoulli(`hl-bernoulli-${seed}`, realCenters, seed));
const w30030Runs = seeds.map((seed) => {
  const labels = wFakeLabels(maxN + maxShift, seed, W);
  return scoreCenters(`w30030-${seed}`, labels, labelFlags(labels, maxN + maxShift + 64));
});
const cramerRuns = seeds.map((seed) => {
  const labels = cramerPrimes(maxN + maxShift, seed);
  return scoreCenters(`cramer-${seed}`, labels, labelFlags(labels, maxN + maxShift + 64));
});
const compositePool = [];
for (let n = 1001; n <= maxN; n += 2) {
  if (!primeFlags[n] && gcd(n, W) === 1) compositePool.push(n);
}
const compositeRuns = seeds.map((seed) => scoreCenters(`composite-${seed}`, sampleSorted(compositePool, realCenters.length, seed), primeFlags));
const functionFields = fieldSpecs.map(fieldOrbit);
const integerFamilies = [
  ["hlBernoulli", hlBernoulliRuns],
  ["w30030", w30030Runs],
  ["cramer", cramerRuns],
  ["composite", compositeRuns],
];
const integerSummaries = Object.fromEntries(
  integerFamilies.map(([key, runs]) => [key, endpoints.map((_, i) => summarizeRuns(runs, i))]),
);

const baseName = `function-field-constant-orbit-${maxN}`;
const jsonPath = path.join(outDir, `${baseName}.json`);
const mdPath = path.join(outDir, `${baseName}.md`);
const svgPath = path.join(outDir, `${baseName}.svg`);
const data = {
  maxN,
  shifts,
  W,
  endpoints,
  seeds,
  singularCutoff,
  singularByShift: Object.fromEntries(shifts.map((h) => [h, singularByShift.get(h)])),
  fieldSpecs,
  integer: {
    real,
    hlBernoulliRuns,
    w30030Runs,
    cramerRuns,
    compositeRuns,
    summaries: integerSummaries,
  },
  functionFields,
  namedCompositeChecks: namedCompositeChecks(primeFlags),
  jsonPath,
  mdPath,
  svgPath,
};

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(svgPath, makeSvg(data));
fs.writeFileSync(mdPath, markdownReport(data));

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  integerEndpoint: data.integer.real.rows.at(-1),
  integerTheta: data.integer.real.theta,
  integerSummary: {
    hlBernoulli: integerSummaries.hlBernoulli.at(-1),
    w30030: integerSummaries.w30030.at(-1),
    cramer: integerSummaries.cramer.at(-1),
    composite: integerSummaries.composite.at(-1),
  },
  functionFieldEndpoint: functionFields.map((field) => ({
    q: field.q,
    last: field.rows.at(-1),
    theta: field.theta,
  })),
  namedCompositeChecks: data.namedCompositeChecks,
}, null, 2));
