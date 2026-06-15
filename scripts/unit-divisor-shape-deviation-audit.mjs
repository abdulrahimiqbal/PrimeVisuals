#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyDegree,
  polyDivMod,
  polyMod,
  polySub,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 2_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 18);
const q3MaxDegree = Number(process.argv[5] || 10);
const seeds = [12345, 271828, 314159, 161803, 424242];
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

function exponent(rows, valueFn, scaleFn = (row) => row.labels) {
  const usable = rows
    .map((row) => ({ x: scaleFn(row), y: Math.abs(valueFn(row)) }))
    .filter((row) => row.x > 1 && row.y > 0);
  if (usable.length < 2) return 0;
  return linearFit(usable.map((row) => Math.log(row.x)), usable.map((row) => Math.log(row.y))).slope;
}

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} from pool of ${pool.length}`);
  const random = rng(seed);
  const copy = pool.slice();
  const out = new Array(count);
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
  return Array.from({ length: count }, () => pool[Math.floor(random() * pool.length)]);
}

function sampleControl(pool, count, seed) {
  return count <= pool.length
    ? sampleWithoutReplacement(pool, count, seed)
    : sampleWithReplacement(pool, count, seed);
}

function smallestPrimeFactors(limit) {
  const spf = new Int32Array(limit + 1);
  for (let i = 2; i <= limit; i++) {
    if (spf[i]) continue;
    spf[i] = i;
    if (i * i <= limit) for (let j = i * i; j <= limit; j += i) if (!spf[j]) spf[j] = i;
  }
  return spf;
}

function integerFactorTerms(n, spf) {
  let m = Math.max(1, Math.floor(n));
  const terms = [];
  while (m > 1) {
    const p = spf[m] || m;
    let a = 0;
    while (m % p === 0) {
      m = Math.floor(m / p);
      a++;
    }
    terms.push({ weight: Math.log(p), degree: p, exponent: a });
  }
  return terms;
}

function divisorShapeFromTerms(terms, totalWeight) {
  if (totalWeight <= 0 || terms.length === 0) return 0;
  let variance = 0;
  for (const term of terms) variance += term.exponent * (term.exponent + 2) * term.weight * term.weight / 12;
  return Math.sqrt(12 * variance / (totalWeight * totalWeight));
}

function integerFeature(label, spf) {
  const m = label - 1;
  const terms = integerFactorTerms(m, spf);
  const maxFactor = terms.reduce((max, term) => Math.max(max, term.degree), 1);
  const omega = terms.length;
  const shape = divisorShapeFromTerms(terms, Math.log(Math.max(2, m)));
  return {
    label,
    shape,
    omega,
    maxFactor,
    bucket: `${Math.min(12, omega)}:${Math.min(24, Math.floor(Math.log2(maxFactor || 1)))}`,
  };
}

function buildIntegerFeatures(limit, primeFlags, spf) {
  const features = [];
  const byLabel = new Map();
  const composites = [];
  for (let n = 3; n <= limit; n += 2) {
    const feature = integerFeature(n, spf);
    feature.isPrime = primeFlags[n] === 1;
    features.push(feature);
    byLabel.set(n, feature);
    if (!feature.isPrime) composites.push(feature);
  }
  return { features, byLabel, composites };
}

function prefixFeatures(features, limit) {
  let hi = 0;
  while (hi < features.length && features[hi].label <= limit) hi++;
  return features.slice(0, hi);
}

function bucketStats(features) {
  const map = new Map();
  for (const feature of features) {
    const row = map.get(feature.bucket) || { count: 0, sum: 0, sumSq: 0 };
    row.count++;
    row.sum += feature.shape;
    row.sumSq += feature.shape * feature.shape;
    map.set(feature.bucket, row);
  }
  for (const row of map.values()) {
    row.mean = row.sum / row.count;
    row.sd = Math.sqrt(Math.max(0, row.sumSq / row.count - row.mean * row.mean));
    if (row.sd < 1e-9) row.sd = 1;
  }
  return map;
}

function zScore(feature, stats) {
  const row = stats.get(feature.bucket);
  if (!row) return 0;
  return (feature.shape - row.mean) / row.sd;
}

function summarizeFeatures(features, stats) {
  const values = features.map((feature) => zScore(feature, stats));
  const labels = values.length;
  const sumZ = values.reduce((sum, value) => sum + value, 0);
  const aggregateZ = sumZ / Math.sqrt(Math.max(1, labels));
  const rmsZ = Math.sqrt(mean(values.map((value) => value * value)));
  const byBucket = new Map();
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    const row = byBucket.get(feature.bucket) || { bucket: feature.bucket, count: 0, sumZ: 0 };
    row.count++;
    row.sumZ += values[i];
    byBucket.set(feature.bucket, row);
  }
  const bucketRows = [...byBucket.values()]
    .map((row) => ({ ...row, meanZ: row.sumZ / row.count, aggregateZ: row.sumZ / Math.sqrt(row.count) }))
    .sort((a, b) => Math.abs(b.aggregateZ) - Math.abs(a.aggregateZ))
    .slice(0, 8);
  return {
    labels,
    meanShape: mean(features.map((feature) => feature.shape)),
    aggregateZ,
    absAggregateZ: Math.abs(aggregateZ),
    rmsZ,
    topBuckets: bucketRows,
  };
}

function featuresForLabels(labels, byLabel) {
  const out = [];
  for (const label of labels) {
    const feature = byLabel.get(label);
    if (feature) out.push(feature);
  }
  return out;
}

function groupByBucket(features) {
  const map = new Map();
  for (const feature of features) {
    const row = map.get(feature.bucket) || [];
    row.push(feature);
    map.set(feature.bucket, row);
  }
  return map;
}

function bucketMatchedControls(realFeatures, candidateFeatures, seed) {
  const byBucket = groupByBucket(candidateFeatures);
  const random = rng(seed);
  const out = [];
  for (const feature of realFeatures) {
    const pool = byBucket.get(feature.bucket) || candidateFeatures;
    out.push(pool[Math.floor(random() * pool.length)]);
  }
  return out;
}

function summarizeControls(controls) {
  return {
    aggregateZ: range(controls.map((row) => row.aggregateZ)),
    absAggregateZ: range(controls.map((row) => row.absAggregateZ)),
    rmsZ: range(controls.map((row) => row.rmsZ)),
    meanShape: range(controls.map((row) => row.meanShape)),
  };
}

function integerAudit() {
  console.error(`[divshape] integer sieve/spf to ${N}`);
  const primeFlags = sieve(N);
  const primes = primesUpTo(N);
  const cramer = seeds.map((seed) => cramerPrimes(N, seed));
  const spf = smallestPrimeFactors(N);
  const all = buildIntegerFeatures(N, primeFlags, spf);
  const rows = [];

  for (const limit of endpoints) {
    console.error(`[divshape] integer N=${limit}`);
    const background = prefixFeatures(all.features, limit);
    const composites = background.filter((feature) => !feature.isPrime);
    const stats = bucketStats(background);
    const real = summarizeFeatures(featuresForLabels(primes.filter((p) => p <= limit), all.byLabel), stats);
    const controls = {
      cramer: cramer.map((labels) => summarizeFeatures(featuresForLabels(labels.filter((p) => p <= limit), all.byLabel), stats)),
      oddRandom: seeds.map((seed) => summarizeFeatures(sampleControl(background, real.labels, seed ^ limit ^ 0x9e3779b9), stats)),
      oddComposite: seeds.map((seed) => summarizeFeatures(sampleControl(composites, real.labels, seed ^ limit ^ 0x85ebca6b), stats)),
      bucketComposite: seeds.map((seed) => summarizeFeatures(bucketMatchedControls(featuresForLabels(primes.filter((p) => p <= limit), all.byLabel), composites, seed ^ limit ^ 0x51f15e), stats)),
    };
    rows.push({
      N: limit,
      labels: real.labels,
      background: background.length,
      buckets: stats.size,
      real,
      controls,
      summary: Object.fromEntries(Object.entries(controls).map(([key, value]) => [key, summarizeControls(value)])),
    });
  }
  return {
    rows,
    theta: {
      absAggregateZ: exponent(rows, (row) => row.real.absAggregateZ),
      rmsZ: exponent(rows, (row) => row.real.rmsZ),
    },
  };
}

function polynomialFactorTerms(poly, universe) {
  const q = universe.q;
  let rem = poly;
  const terms = [];
  for (let d = 1; d <= Math.floor(polyDegree(rem, q) / 2); d++) {
    for (const factor of universe.irreduciblesByDegree[d]) {
      let exponent = 0;
      while (rem && polyDegree(rem, q) >= d && polyMod(rem, factor, q) === 0) {
        rem = polyDivMod(rem, factor, q).quotient;
        exponent++;
      }
      if (exponent) terms.push({ weight: d, degree: d, exponent });
    }
  }
  const rd = polyDegree(rem, q);
  if (rd > 0) terms.push({ weight: rd, degree: rd, exponent: 1 });
  return terms;
}

function fieldFeature(poly, universe) {
  const shifted = polySub(poly, 1, universe.q);
  const totalDegree = polyDegree(shifted, universe.q);
  const terms = polynomialFactorTerms(shifted, universe);
  const maxDegree = terms.reduce((max, term) => Math.max(max, term.degree), 0);
  const omega = terms.length;
  return {
    label: poly,
    shape: divisorShapeFromTerms(terms, totalDegree),
    omega,
    maxDegree,
    bucket: `${Math.min(12, omega)}:${maxDegree}`,
  };
}

function fieldDegreeFeatures(universe, degree) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const features = new Array(universe.pow[degree]);
  const irreducibles = [];
  const reducibles = [];
  for (let lower = 0; lower < universe.pow[degree]; lower++) {
    const feature = fieldFeature(lead + lower, universe);
    feature.isIrreducible = flags[lower] === 1;
    features[lower] = feature;
    if (feature.isIrreducible) irreducibles.push(feature);
    else reducibles.push(feature);
  }
  return { features, irreducibles, reducibles };
}

function fieldAudit(q, maxDegree) {
  console.error(`[divshape] F_${q}[t] to degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const degrees = [maxDegree - 3, maxDegree - 2, maxDegree - 1, maxDegree].filter((degree) => degree >= 4);
  const rows = [];
  for (const degree of degrees) {
    console.error(`[divshape] F_${q}[t] degree ${degree}`);
    const data = fieldDegreeFeatures(universe, degree);
    const stats = bucketStats(data.features);
    const real = summarizeFeatures(data.irreducibles, stats);
    const controls = {
      monic: seeds.map((seed) => summarizeFeatures(sampleControl(data.features, real.labels, seed ^ degree ^ (q << 8)), stats)),
      reducible: seeds.map((seed) => summarizeFeatures(sampleControl(data.reducibles, real.labels, seed ^ degree ^ 0xa5a5a5 ^ q), stats)),
      bucketReducible: seeds.map((seed) => summarizeFeatures(bucketMatchedControls(data.irreducibles, data.reducibles, seed ^ degree ^ 0xbadc0de ^ q), stats)),
    };
    rows.push({
      degree,
      labels: real.labels,
      background: data.features.length,
      buckets: stats.size,
      real,
      controls,
      summary: Object.fromEntries(Object.entries(controls).map(([key, value]) => [key, summarizeControls(value)])),
    });
  }
  return {
    q,
    maxDegree,
    rows,
    theta: {
      absAggregateZ: exponent(rows, (row) => row.real.absAggregateZ),
      rmsZ: exponent(rows, (row) => row.real.rmsZ),
    },
  };
}

function markdownReport(result) {
  const intRows = result.integer.rows.map((row) => `| ${row.N} | ${row.labels} | ${fmt(row.real.aggregateZ)} | ${fmt(row.real.absAggregateZ)} | ${fmt(row.real.rmsZ)} | ${fmt(row.real.meanShape)} | ${fmt(row.summary.cramer.absAggregateZ[0])}..${fmt(row.summary.cramer.absAggregateZ[1])} | ${fmt(row.summary.oddComposite.absAggregateZ[0])}..${fmt(row.summary.oddComposite.absAggregateZ[1])} | ${fmt(row.summary.bucketComposite.absAggregateZ[0])}..${fmt(row.summary.bucketComposite.absAggregateZ[1])} |`).join("\n");
  const fieldTable = (audit, label) => `\n${label}\n\n| degree | labels | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range | bucket-reducible abs range |\n| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${audit.rows.map((row) => `| ${row.degree} | ${row.labels} | ${fmt(row.real.aggregateZ)} | ${fmt(row.real.absAggregateZ)} | ${fmt(row.real.rmsZ)} | ${fmt(row.summary.monic.absAggregateZ[0])}..${fmt(row.summary.monic.absAggregateZ[1])} | ${fmt(row.summary.reducible.absAggregateZ[0])}..${fmt(row.summary.reducible.absAggregateZ[1])} | ${fmt(row.summary.bucketReducible.absAggregateZ[0])}..${fmt(row.summary.bucketReducible.absAggregateZ[1])} |`).join("\n")}`;
  return `# unlabeled unit-divisor shape deviation audit

Candidate:
score the bucket-standardized aggregate deviation of the normalized
log-divisor / degree-divisor cloud width of p-1 or f-1, using only unlabeled
factorization shape.

## Integer side

Abs aggregate theta: \`${fmt(result.integer.theta.absAggregateZ)}\`; rmsZ
theta: \`${fmt(result.integer.theta.rmsZ)}\`.

| N | labels | real aggregateZ | real absAggregateZ | real rmsZ | real meanShape | Cramer abs range | odd-composite abs range | bucket-composite abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${intRows}

Endpoint top buckets:
${result.integer.rows.at(-1).real.topBuckets.map((entry) => `- ${entry.bucket}: n=${entry.count}, aggregateZ=${fmt(entry.aggregateZ)}, meanZ=${fmt(entry.meanZ)}`).join("\n")}

## Function fields
${fieldTable(result.q2, "F_2[t]")}

Endpoint F_2[t] top buckets:
${result.q2.rows.at(-1).real.topBuckets.map((entry) => `- ${entry.bucket}: n=${entry.count}, aggregateZ=${fmt(entry.aggregateZ)}, meanZ=${fmt(entry.meanZ)}`).join("\n")}

${fieldTable(result.q3, "F_3[t]")}

Endpoint F_3[t] top buckets:
${result.q3.rows.at(-1).real.topBuckets.map((entry) => `- ${entry.bucket}: n=${entry.count}, aggregateZ=${fmt(entry.aggregateZ)}, meanZ=${fmt(entry.meanZ)}`).join("\n")}

SVG: \`${result.svgPath}\`
JSON: \`${result.jsonPath}\`
`;
}

function svgPlot(result) {
  const width = 1120, height = 620, pad = 64, plotW = 620, plotH = 430;
  const rows = result.integer.rows;
  const allY = rows.flatMap((row) => [
    row.real.absAggregateZ,
    row.summary.oddComposite.absAggregateZ[0],
    row.summary.oddComposite.absAggregateZ[1],
    row.summary.bucketComposite.absAggregateZ[0],
    row.summary.bucketComposite.absAggregateZ[1],
  ]);
  const yMax = Math.max(...allY, 1) * 1.12;
  const x = (i) => pad + (i * plotW) / Math.max(1, rows.length - 1);
  const y = (value) => pad + plotH - (value / yMax) * plotH;
  const points = (values) => values.map((value, i) => `${x(i)},${y(value)}`).join(" ");
  const band = (key, color) => {
    const top = rows.map((row) => row.summary[key].absAggregateZ[1]);
    const bottom = rows.map((row) => row.summary[key].absAggregateZ[0]);
    const d = [...top.map((value, i) => `${x(i)},${y(value)}`), ...bottom.map((value, i) => `${x(rows.length - 1 - i)},${y(value)}`)].join(" ");
    return `<polygon points="${d}" fill="${color}" opacity="0.18"/>`;
  };
  const fieldRows = [
    ...result.q2.rows.map((row) => ({ label: `F2 d${row.degree}`, value: row.real.absAggregateZ, range: row.summary.bucketReducible.absAggregateZ, color: "#9b7bdb" })),
    ...result.q3.rows.map((row) => ({ label: `F3 d${row.degree}`, value: row.real.absAggregateZ, range: row.summary.bucketReducible.absAggregateZ, color: "#38b98d" })),
  ];
  const barX = 760, barW = 230;
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
<text x="64" y="30" fill="#e5e7eb" font-size="18" font-weight="700">Unlabeled unit-divisor shape deviation</text>
<text x="64" y="54" fill="#a8b3c7" font-size="13">y: abs aggregate z of normalized divisor-cloud width for p-1 / f-1 after omega/largest-factor buckets</text>
<line x1="${pad}" x2="${pad + plotW}" y1="${pad + plotH}" y2="${pad + plotH}" stroke="#334155"/>
<line x1="${pad}" x2="${pad}" y1="${pad}" y2="${pad + plotH}" stroke="#334155"/>
${band("oddComposite", "#fb7185")}
${band("bucketComposite", "#facc15")}
<polyline points="${points(rows.map((row) => row.real.absAggregateZ))}" fill="none" stroke="#67e8f9" stroke-width="3"/>
${rows.map((row, i) => `<text x="${x(i) - 26}" y="${pad + plotH + 22}" fill="#94a3b8" font-size="11">${row.N / 1_000_000}M</text>`).join("\n")}
<text x="760" y="72" fill="#e5e7eb" font-size="15" font-weight="700">Function-field real / bucket-reducible range</text>
${bars}
<text x="64" y="596" fill="#a8b3c7" font-size="12">cyan real; red odd-composite band; yellow bucket-matched composite band; bars compare function-field real to bucket-reducible controls</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const basename = `unit-divisor-shape-deviation-audit-${N}`;
const jsonPath = path.join(outDir, `${basename}.json`);
const mdPath = path.join(outDir, `${basename}.md`);
const svgPath = path.join(outDir, `${basename}.svg`);

const result = {
  candidate: "unlabeled unit-divisor shape deviation",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  seeds,
  q2MaxDegree,
  q3MaxDegree,
  integer: integerAudit(),
  q2: fieldAudit(2, q2MaxDegree),
  q3: fieldAudit(3, q3MaxDegree),
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
