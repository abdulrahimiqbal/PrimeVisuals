#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyMod,
  polySub,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 20);
const q3MaxDegree = Number(process.argv[5] || 12);
const q2FactorDegree = Number(process.argv[6] || 4);
const q3FactorDegree = Number(process.argv[7] || 2);

const seeds = [12345, 271828, 314159, 161803, 424242];
const integerFactorPrimes = [3, 5, 7, 11, 13, 17, 19, 23];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(200_000, Math.round(x)));

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
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function linearFit(xs, ys) {
  const mx = mean(xs), my = mean(ys);
  let sxx = 0, sxy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  const slope = sxy / (sxx || 1);
  return { slope, intercept: my - slope * mx };
}

function exponent(rows, valueKey, scaleKey = "labels") {
  const usable = rows
    .map((row) => ({ x: row[scaleKey], y: Math.abs(row.real[valueKey]) }))
    .filter((row) => row.x > 1 && row.y > 0);
  if (usable.length < 2) return 0;
  return linearFit(usable.map((row) => Math.log(row.x)), usable.map((row) => Math.log(row.y))).slope;
}

function labelsUpTo(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return sorted.slice(0, hi);
}

function prefixLength(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return hi;
}

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} from pool of ${pool.length}`);
  const random = rng(seed);
  const copy = new Uint32Array(pool);
  const out = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (copy.length - i));
    const picked = copy[j];
    copy[j] = copy[i];
    copy[i] = picked;
    out[i] = picked;
  }
  return out;
}

function sampleWithReplacement(pool, count, seed) {
  if (pool.length === 0) throw new Error("cannot sample from an empty pool");
  const random = rng(seed);
  const out = new Uint32Array(count);
  for (let i = 0; i < count; i++) out[i] = pool[Math.floor(random() * pool.length)];
  return out;
}

function sampleControl(pool, count, seed) {
  return count <= pool.length
    ? sampleWithoutReplacement(pool, count, seed)
    : sampleWithReplacement(pool, count, seed);
}

function integerFactors() {
  return integerFactorPrimes.map((ell) => {
    const probability = 1 / (ell - 1);
    return {
      label: `${ell}`,
      norm: ell,
      probability,
      sd: Math.sqrt(probability * (1 - probability)),
      test: (n) => (n - 1) % ell === 0,
    };
  });
}

function factorProduct(factors) {
  return factors.reduce((product, factor) => product * factor.norm, 1);
}

function unitIntegerPool(limit, primeFlags, modulus, mode) {
  const out = [];
  for (let n = 3; n <= limit; n++) {
    if (gcd(n, modulus) !== 1) continue;
    if (mode === "composite" && primeFlags[n]) continue;
    out.push(n);
  }
  return Uint32Array.from(out);
}

function triplesForFactors(factors) {
  const triples = [];
  for (let i = 0; i < factors.length; i++) {
    for (let j = i + 1; j < factors.length; j++) {
      for (let k = j + 1; k < factors.length; k++) {
        triples.push({ i, j, k, label: `${factors[i].label} x ${factors[j].label} x ${factors[k].label}` });
      }
    }
  }
  return triples;
}

function statsFromLabels(labels, factors, captureColumns = false) {
  const triples = triplesForFactors(factors);
  const sums = new Float64Array(triples.length);
  const z = new Float64Array(factors.length);
  const columns = captureColumns ? Array.from({ length: factors.length }, () => new Float64Array(labels.length)) : null;
  for (let row = 0; row < labels.length; row++) {
    const label = labels[row];
    for (let i = 0; i < factors.length; i++) {
      const factor = factors[i];
      z[i] = ((factor.test(label) ? 1 : 0) - factor.probability) / factor.sd;
      if (columns) columns[i][row] = z[i];
    }
    for (let t = 0; t < triples.length; t++) {
      const triple = triples[t];
      sums[t] += z[triple.i] * z[triple.j] * z[triple.k];
    }
  }
  return statsFromTripleSums(labels.length, factors, triples, sums, columns);
}

function statsFromColumns(columns, factors) {
  const labels = columns[0]?.length || 0;
  const triples = triplesForFactors(factors);
  const sums = new Float64Array(triples.length);
  for (let row = 0; row < labels; row++) {
    for (let t = 0; t < triples.length; t++) {
      const triple = triples[t];
      sums[t] += columns[triple.i][row] * columns[triple.j][row] * columns[triple.k][row];
    }
  }
  return statsFromTripleSums(labels, factors, triples, sums, null);
}

function statsFromTripleSums(labels, factors, triples, sums, columns) {
  const means = Array.from(sums, (sum) => sum / Math.max(1, labels));
  const tripleRms = Math.sqrt(mean(means.map((value) => value * value)));
  const scale = Math.sqrt(Math.max(1, labels));
  const entries = means.map((value, i) => ({ ...triples[i], value }));
  entries.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  return {
    labels,
    factors: factors.length,
    triples: triples.length,
    tripleRms,
    scaledTriple: scale * tripleRms,
    topTriples: entries.slice(0, 8),
    columns,
  };
}

function columnControls(columns, factors, seedBase) {
  const controls = [];
  for (let s = 0; s < seeds.length; s++) {
    const random = rng(seedBase ^ seeds[s]);
    const permuted = columns.map((column, i) => {
      if (i === 0) return new Float64Array(column);
      const copy = new Float64Array(column);
      for (let j = copy.length - 1; j > 0; j--) {
        const k = Math.floor(random() * (j + 1));
        const tmp = copy[j];
        copy[j] = copy[k];
        copy[k] = tmp;
      }
      return copy;
    });
    controls.push(statsFromColumns(permuted, factors));
  }
  return controls;
}

function summarizeControls(controls) {
  return {
    scaledTriple: range(controls.map((row) => row.scaledTriple)),
    tripleRms: range(controls.map((row) => row.tripleRms)),
    labels: range(controls.map((row) => row.labels)),
  };
}

function stripColumns(row) {
  const { columns, ...rest } = row;
  return rest;
}

function stripRows(rows) {
  return rows.map((row) => ({
    ...row,
    real: stripColumns(row.real),
    controls: Object.fromEntries(Object.entries(row.controls).map(([key, value]) => [key, value.map(stripColumns)])),
  }));
}

function integerAudit() {
  console.error(`[unit-triple] integer sieve to ${N}`);
  const primeFlags = sieve(N);
  const primes = primesUpTo(N);
  const cramer = seeds.map((seed) => cramerPrimes(N, seed));
  const factors = integerFactors();
  const modulus = factorProduct(factors);
  const unitPool = unitIntegerPool(N, primeFlags, modulus, "all");
  const compositePool = unitIntegerPool(N, primeFlags, modulus, "composite");
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[unit-triple] integer N=${limit}`);
    const realLabels = labelsUpTo(primes, limit).filter((p) => gcd(p, modulus) === 1);
    const target = realLabels.length;
    const unitPrefix = unitPool.subarray(0, prefixLength(unitPool, limit));
    const compositePrefix = compositePool.subarray(0, prefixLength(compositePool, limit));
    const real = statsFromLabels(realLabels, factors, true);
    const controls = {
      cramer: cramer.map((labels) => statsFromLabels(labelsUpTo(labels, limit), factors, false)),
      unitRandom: seeds.map((seed) => statsFromLabels(sampleControl(unitPrefix, target, seed ^ limit ^ 0x9e3779b9), factors, false)),
      unitComposite: seeds.map((seed) => statsFromLabels(sampleControl(compositePrefix, target, seed ^ limit ^ 0x85ebca6b), factors, false)),
      column: columnControls(real.columns, factors, 0x533d ^ limit),
    };
    rows.push({
      N: limit,
      labels: target,
      real,
      controls,
      summary: Object.fromEntries(Object.entries(controls).map(([key, value]) => [key, summarizeControls(value)])),
    });
  }
  return {
    factors: factors.map(({ label, norm, probability }) => ({ label, norm, probability })),
    modulus,
    rows: stripRows(rows),
    theta: {
      scaledTriple: exponent(rows, "scaledTriple"),
      tripleRms: exponent(rows, "tripleRms"),
    },
  };
}

function fieldFactors(universe, maxFactorDegree) {
  const factors = [];
  for (let degree = 1; degree <= maxFactorDegree; degree++) {
    for (const factor of universe.irreduciblesByDegree[degree]) {
      const norm = universe.q ** degree;
      const probability = 1 / (norm - 1);
      if (probability >= 1) continue;
      factors.push({
        poly: factor,
        label: polyToString(factor, universe.q),
        norm,
        degree,
        probability,
        sd: Math.sqrt(probability * (1 - probability)),
        test: (poly) => polyMod(polySub(poly, 1, universe.q), factor, universe.q) === 0,
      });
    }
  }
  return factors;
}

function fieldLocalPool(universe, degree, factors, mode) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const out = [];
  for (let lower = 0; lower < universe.pow[degree]; lower++) {
    const poly = lead + lower;
    let ok = true;
    for (const factor of factors) {
      if (polyMod(poly, factor.poly, universe.q) === 0) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (mode === "reducible" && flags[lower]) continue;
    out.push(poly);
  }
  return Uint32Array.from(out);
}

function fieldMonicPool(universe, degree) {
  const lead = universe.pow[degree];
  const out = new Uint32Array(universe.pow[degree]);
  for (let lower = 0; lower < out.length; lower++) out[lower] = lead + lower;
  return out;
}

function fieldAudit(q, maxDegree, maxFactorDegree) {
  console.error(`[unit-triple] F_${q}[t] to degree ${maxDegree}, factors <= ${maxFactorDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const factors = fieldFactors(universe, maxFactorDegree);
  const degrees = [maxDegree - 3, maxDegree - 2, maxDegree - 1, maxDegree].filter((degree) => degree >= maxFactorDegree + 5);
  const rows = [];
  for (const degree of degrees) {
    console.error(`[unit-triple] F_${q}[t] degree ${degree}`);
    const labels = Uint32Array.from(universe.irreduciblesByDegree[degree]);
    const target = labels.length;
    const monicPool = fieldMonicPool(universe, degree);
    const localPool = fieldLocalPool(universe, degree, factors, "all");
    const reduciblePool = fieldLocalPool(universe, degree, factors, "reducible");
    const real = statsFromLabels(labels, factors, true);
    const controls = {
      monic: seeds.map((seed) => statsFromLabels(sampleControl(monicPool, target, seed ^ degree ^ (q << 8)), factors, false)),
      localMonic: seeds.map((seed) => statsFromLabels(sampleControl(localPool, target, seed ^ degree ^ 0x515151 ^ q), factors, false)),
      localReducible: seeds.map((seed) => statsFromLabels(sampleControl(reduciblePool, target, seed ^ degree ^ 0xa5a5a5 ^ q), factors, false)),
      column: columnControls(real.columns, factors, 0x6d2b79f5 ^ degree ^ q),
    };
    rows.push({
      degree,
      labels: target,
      localPool: localPool.length,
      reduciblePool: reduciblePool.length,
      real,
      controls,
      summary: Object.fromEntries(Object.entries(controls).map(([key, value]) => [key, summarizeControls(value)])),
    });
  }
  return {
    q,
    maxDegree,
    maxFactorDegree,
    factors: factors.map(({ label, norm, degree, probability }) => ({ label, norm, degree, probability })),
    rows: stripRows(rows),
    theta: {
      scaledTriple: exponent(rows, "scaledTriple"),
      tripleRms: exponent(rows, "tripleRms"),
    },
  };
}

function markdownReport(result) {
  const intRows = result.integer.rows.map((row) => `| ${row.N} | ${row.labels} | ${fmt(row.real.scaledTriple)} | ${fmt(row.real.tripleRms)} | ${fmt(row.summary.cramer.scaledTriple[0])}..${fmt(row.summary.cramer.scaledTriple[1])} | ${fmt(row.summary.unitRandom.scaledTriple[0])}..${fmt(row.summary.unitRandom.scaledTriple[1])} | ${fmt(row.summary.unitComposite.scaledTriple[0])}..${fmt(row.summary.unitComposite.scaledTriple[1])} | ${fmt(row.summary.column.scaledTriple[0])}..${fmt(row.summary.column.scaledTriple[1])} |`).join("\n");
  const fieldTable = (audit, label) => `\n${label} factors: ${audit.factors.map((factor) => factor.label).join(", ")}\n\n| degree | labels | real scaledTriple | real tripleRms | monic range | local-monic range | local-reducible range | column-null range |\n| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${audit.rows.map((row) => `| ${row.degree} | ${row.labels} | ${fmt(row.real.scaledTriple)} | ${fmt(row.real.tripleRms)} | ${fmt(row.summary.monic.scaledTriple[0])}..${fmt(row.summary.monic.scaledTriple[1])} | ${fmt(row.summary.localMonic.scaledTriple[0])}..${fmt(row.summary.localMonic.scaledTriple[1])} | ${fmt(row.summary.localReducible.scaledTriple[0])}..${fmt(row.summary.localReducible.scaledTriple[1])} | ${fmt(row.summary.column.scaledTriple[0])}..${fmt(row.summary.column.scaledTriple[1])} |`).join("\n")}`;
  return `# centered unit-order triple cumulant audit

Candidate:
score only the sqrt(label)-scaled rms of centered triple products
Z(a)Z(b)Z(c), after the first- and second-order unit-order lines are no
longer directly visible to the statistic.

## Integer side

Factors: ${result.integer.factors.map((factor) => factor.label).join(", ")}

Scaled triple theta: \`${fmt(result.integer.theta.scaledTriple)}\`;
raw triple theta: \`${fmt(result.integer.theta.tripleRms)}\`.

| N | labels | real scaledTriple | real tripleRms | Cramer range | local-random range | local-composite range | column-null range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${intRows}

Endpoint top triples:
${result.integer.rows.at(-1).real.topTriples.map((entry) => `- ${entry.label}: ${fmt(entry.value)}`).join("\n")}

## Function fields
${fieldTable(result.q2, "F_2[t]")}

Endpoint F_2[t] top triples:
${result.q2.rows.at(-1).real.topTriples.map((entry) => `- ${entry.label}: ${fmt(entry.value)}`).join("\n")}

${fieldTable(result.q3, "F_3[t]")}

Endpoint F_3[t] top triples:
${result.q3.rows.at(-1).real.topTriples.map((entry) => `- ${entry.label}: ${fmt(entry.value)}`).join("\n")}

SVG: \`${result.svgPath}\`
JSON: \`${result.jsonPath}\`
`;
}

function svgPlot(result) {
  const width = 1120;
  const height = 620;
  const pad = 64;
  const plotW = 620;
  const plotH = 430;
  const rows = result.integer.rows;
  const allY = rows.flatMap((row) => [
    row.real.scaledTriple,
    row.summary.unitRandom.scaledTriple[0],
    row.summary.unitRandom.scaledTriple[1],
    row.summary.unitComposite.scaledTriple[0],
    row.summary.unitComposite.scaledTriple[1],
    row.summary.column.scaledTriple[0],
    row.summary.column.scaledTriple[1],
  ]);
  const yMax = Math.max(...allY) * 1.08;
  const x = (i) => pad + (i * plotW) / Math.max(1, rows.length - 1);
  const y = (value) => pad + plotH - (value / yMax) * plotH;
  const points = (values) => values.map((value, i) => `${x(i)},${y(value)}`).join(" ");
  const band = (key, color) => {
    const top = rows.map((row) => row.summary[key].scaledTriple[1]);
    const bottom = rows.map((row) => row.summary[key].scaledTriple[0]);
    const d = [...top.map((value, i) => `${x(i)},${y(value)}`), ...bottom.map((value, i) => `${x(rows.length - 1 - i)},${y(value)}`)].join(" ");
    return `<polygon points="${d}" fill="${color}" opacity="0.16"/>`;
  };
  const fieldRows = [
    ...result.q2.rows.map((row) => ({ label: `F2 d${row.degree}`, value: row.real.scaledTriple, range: row.summary.localReducible.scaledTriple, color: "#9b7bdb" })),
    ...result.q3.rows.map((row) => ({ label: `F3 d${row.degree}`, value: row.real.scaledTriple, range: row.summary.localReducible.scaledTriple, color: "#38b98d" })),
  ];
  const barX = 760;
  const barW = 230;
  const barMax = Math.max(...fieldRows.flatMap((row) => [row.value, row.range[1]]), 1);
  const bars = fieldRows.map((row, i) => {
    const yy = 98 + i * 28;
    const w = (row.value / barMax) * barW;
    const r0 = barX + (row.range[0] / barMax) * barW;
    const r1 = barX + (row.range[1] / barMax) * barW;
    return `<text x="${barX - 80}" y="${yy + 8}" fill="${row.color}" font-size="13">${row.label}</text>
<line x1="${r0}" x2="${r1}" y1="${yy + 4}" y2="${yy + 4}" stroke="#e2e8f0" stroke-width="3" opacity="0.8"/>
<rect x="${barX}" y="${yy}" width="${w}" height="10" fill="${row.color}" opacity="0.9"/>
<text x="${barX + barW + 18}" y="${yy + 9}" fill="#dbeafe" font-size="12">${fmt(row.value)}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#080d17"/>
<style>text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }</style>
<text x="64" y="30" fill="#e5e7eb" font-size="18" font-weight="700">Centered unit-order triple cumulant</text>
<text x="64" y="54" fill="#a8b3c7" font-size="13">y: sqrt(label-count)-scaled rms of centered Z(a)Z(b)Z(c) over p-1 / f-1 factors</text>
<line x1="${pad}" x2="${pad + plotW}" y1="${pad + plotH}" y2="${pad + plotH}" stroke="#334155"/>
<line x1="${pad}" x2="${pad}" y1="${pad}" y2="${pad + plotH}" stroke="#334155"/>
${band("unitRandom", "#facc15")}
${band("unitComposite", "#fb7185")}
${band("column", "#94a3b8")}
<polyline points="${points(rows.map((row) => row.real.scaledTriple))}" fill="none" stroke="#67e8f9" stroke-width="3"/>
${rows.map((row, i) => `<text x="${x(i) - 26}" y="${pad + plotH + 22}" fill="#94a3b8" font-size="11">${row.N / 1_000_000}M</text>`).join("\n")}
<text x="760" y="72" fill="#e5e7eb" font-size="15" font-weight="700">Function-field real / local-reducible range</text>
${bars}
<text x="64" y="596" fill="#a8b3c7" font-size="12">cyan real; yellow local-random, red local-composite, gray column-null bands; bars compare function-field real to local-reducible controls</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const basename = `unit-order-triple-cumulant-audit-${N}`;
const jsonPath = path.join(outDir, `${basename}.json`);
const mdPath = path.join(outDir, `${basename}.md`);
const svgPath = path.join(outDir, `${basename}.svg`);

const result = {
  candidate: "centered unit-order triple cumulant",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  seeds,
  q2MaxDegree,
  q3MaxDegree,
  q2FactorDegree,
  q3FactorDegree,
  integer: integerAudit(),
  q2: fieldAudit(2, q2MaxDegree, q2FactorDegree),
  q3: fieldAudit(3, q3MaxDegree, q3FactorDegree),
};
result.jsonPath = jsonPath;
result.mdPath = mdPath;
result.svgPath = svgPath;

fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
fs.writeFileSync(mdPath, markdownReport(result));
fs.writeFileSync(svgPath, svgPlot(result));

console.log(JSON.stringify({
  jsonPath,
  mdPath,
  svgPath,
  integerTheta: result.integer.theta,
  integerEndpoint: result.integer.rows.at(-1),
  q2Endpoint: result.q2.rows.at(-1),
  q3Endpoint: result.q3.rows.at(-1),
}, null, 2));
