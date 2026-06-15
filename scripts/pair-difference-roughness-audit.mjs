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
const q2MaxDegree = Number(process.argv[4] || 17);
const q3MaxDegree = Number(process.argv[5] || 10);
const pairSamples = Number(process.argv[6] || 120_000);
const backgroundSamples = Number(process.argv[7] || 180_000);

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

function exponent(rows, valueFn, scaleFn = (row) => row.samples) {
  const usable = rows
    .map((row) => ({ x: scaleFn(row), y: Math.abs(valueFn(row)) }))
    .filter((row) => row.x > 1 && row.y > 0);
  if (usable.length < 2) return 0;
  return linearFit(usable.map((row) => Math.log(row.x)), usable.map((row) => Math.log(row.y))).slope;
}

function labelsUpTo(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return sorted.slice(0, hi);
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

function integerOmega(n, spf) {
  let m = Math.max(1, Math.floor(n));
  let count = 0;
  while (m > 1) {
    const p = spf[m] || m;
    count++;
    while (m % p === 0) m = Math.floor(m / p);
  }
  return count;
}

function integerPairFeatures(labels, count, seed, spf, limit) {
  const random = rng(seed);
  const out = [];
  if (labels.length < 2) return out;
  const maxTries = count * 20;
  let tries = 0;
  while (out.length < count && tries < maxTries) {
    tries++;
    const a = labels[Math.floor(random() * labels.length)];
    const b = labels[Math.floor(random() * labels.length)];
    const diff = Math.abs(a - b);
    if (diff < 2) continue;
    const half = Math.max(1, diff / 2);
    const feature = integerOmega(half, spf);
    const bucket = Math.max(1, Math.min(24, Math.floor(Math.log2(diff))));
    out.push({ feature, bucket: `${bucket}` });
  }
  if (out.length < Math.min(1000, count)) throw new Error(`too few integer pairs for limit ${limit}: ${out.length}`);
  return out;
}

function bucketStats(items) {
  const map = new Map();
  for (const item of items) {
    const row = map.get(item.bucket) || { count: 0, sum: 0, sumSq: 0 };
    row.count++;
    row.sum += item.feature;
    row.sumSq += item.feature * item.feature;
    map.set(item.bucket, row);
  }
  for (const row of map.values()) {
    row.mean = row.sum / row.count;
    row.sd = Math.sqrt(Math.max(0, row.sumSq / row.count - row.mean * row.mean));
    if (row.sd < 1e-9) row.sd = 1;
  }
  return map;
}

function scoreItems(items, stats) {
  let sumZ = 0;
  let sumSq = 0;
  const byBucket = new Map();
  for (const item of items) {
    const row = stats.get(item.bucket);
    const z = row ? (item.feature - row.mean) / row.sd : 0;
    sumZ += z;
    sumSq += z * z;
    const b = byBucket.get(item.bucket) || { bucket: item.bucket, count: 0, sumZ: 0 };
    b.count++;
    b.sumZ += z;
    byBucket.set(item.bucket, b);
  }
  const n = items.length;
  const aggregateZ = sumZ / Math.sqrt(Math.max(1, n));
  const bucketRows = [...byBucket.values()]
    .map((row) => ({ ...row, meanZ: row.sumZ / row.count, aggregateZ: row.sumZ / Math.sqrt(row.count) }))
    .sort((a, b) => Math.abs(b.aggregateZ) - Math.abs(a.aggregateZ))
    .slice(0, 8);
  return {
    samples: n,
    meanFeature: mean(items.map((item) => item.feature)),
    aggregateZ,
    absAggregateZ: Math.abs(aggregateZ),
    rmsZ: Math.sqrt(sumSq / Math.max(1, n)),
    topBuckets: bucketRows,
  };
}

function summarizeControls(controls) {
  return {
    aggregateZ: range(controls.map((row) => row.aggregateZ)),
    absAggregateZ: range(controls.map((row) => row.absAggregateZ)),
    rmsZ: range(controls.map((row) => row.rmsZ)),
    meanFeature: range(controls.map((row) => row.meanFeature)),
  };
}

function randomOddLabels(limit) {
  const out = [];
  for (let n = 3; n <= limit; n += 2) out.push(n);
  return out;
}

function oddCompositeLabels(limit, primeFlags) {
  const out = [];
  for (let n = 3; n <= limit; n += 2) if (!primeFlags[n]) out.push(n);
  return out;
}

function integerAudit() {
  console.error(`[pairdiff] integer sieve/spf to ${N}`);
  const primeFlags = sieve(N);
  const spf = smallestPrimeFactors(N);
  const primes = primesUpTo(N);
  const cramer = seeds.map((seed) => cramerPrimes(N, seed).filter((p) => p % 2 === 1));
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[pairdiff] integer N=${limit}`);
    const sampleCount = Math.min(pairSamples, Math.max(10_000, Math.floor((primes.filter((p) => p <= limit).length || 1) * 1.5)));
    const oddLabels = randomOddLabels(limit);
    const compositeLabels = oddCompositeLabels(limit, primeFlags);
    const background = integerPairFeatures(oddLabels, backgroundSamples, limit ^ 0xbadc0de, spf, limit);
    const stats = bucketStats(background);
    const realLabels = labelsUpTo(primes, limit).filter((p) => p % 2 === 1);
    const real = scoreItems(integerPairFeatures(realLabels, sampleCount, limit ^ 0x515151, spf, limit), stats);
    const controls = {
      cramer: cramer.map((labels, i) => scoreItems(integerPairFeatures(labelsUpTo(labels, limit), sampleCount, seeds[i] ^ limit ^ 0x1111, spf, limit), stats)),
      oddRandom: seeds.map((seed) => scoreItems(integerPairFeatures(oddLabels, sampleCount, seed ^ limit ^ 0x2222, spf, limit), stats)),
      oddComposite: seeds.map((seed) => scoreItems(integerPairFeatures(compositeLabels, sampleCount, seed ^ limit ^ 0x3333, spf, limit), stats)),
    };
    rows.push({
      N: limit,
      labels: realLabels.length,
      samples: real.samples,
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

function polynomialFactorOmega(poly, universe) {
  const q = universe.q;
  let rem = poly;
  let count = 0;
  for (let d = 1; d <= Math.floor(polyDegree(rem, q) / 2); d++) {
    for (const factor of universe.irreduciblesByDegree[d]) {
      if (rem && polyDegree(rem, q) >= d && polyMod(rem, factor, q) === 0) {
        count++;
        while (rem && polyDegree(rem, q) >= d && polyMod(rem, factor, q) === 0) {
          rem = polyDivMod(rem, factor, q).quotient;
        }
      }
    }
  }
  if (polyDegree(rem, q) > 0) count++;
  return count;
}

function fieldPairFeatures(labels, count, seed, universe, degree) {
  const random = rng(seed);
  const out = [];
  if (labels.length < 2) return out;
  const maxTries = count * 20;
  let tries = 0;
  while (out.length < count && tries < maxTries) {
    tries++;
    const a = labels[Math.floor(random() * labels.length)];
    const b = labels[Math.floor(random() * labels.length)];
    const diff = polySub(a, b, universe.q);
    const d = polyDegree(diff, universe.q);
    if (d < 0) continue;
    out.push({ feature: polynomialFactorOmega(diff, universe), bucket: `${d}` });
  }
  if (out.length < Math.min(1000, count)) throw new Error(`too few F_${universe.q} pairs at degree ${degree}: ${out.length}`);
  return out;
}

function monicLabels(universe, degree) {
  const lead = universe.pow[degree];
  return Array.from({ length: universe.pow[degree] }, (_, lower) => lead + lower);
}

function reducibleLabels(universe, degree) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const out = [];
  for (let lower = 0; lower < flags.length; lower++) if (!flags[lower]) out.push(lead + lower);
  return out;
}

function fieldAudit(q, maxDegree) {
  console.error(`[pairdiff] F_${q}[t] to degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const degrees = [maxDegree - 3, maxDegree - 2, maxDegree - 1, maxDegree].filter((d) => d >= 5);
  const rows = [];
  for (const degree of degrees) {
    console.error(`[pairdiff] F_${q}[t] degree ${degree}`);
    const monics = monicLabels(universe, degree);
    const irreducibles = Array.from(universe.irreduciblesByDegree[degree]);
    const reducibles = reducibleLabels(universe, degree);
    const sampleCount = Math.min(pairSamples, Math.max(10_000, irreducibles.length * 2));
    const background = fieldPairFeatures(monics, backgroundSamples, (q << 16) ^ degree ^ 0xbadc0de, universe, degree);
    const stats = bucketStats(background);
    const real = scoreItems(fieldPairFeatures(irreducibles, sampleCount, (q << 16) ^ degree ^ 0x515151, universe, degree), stats);
    const controls = {
      monic: seeds.map((seed) => scoreItems(fieldPairFeatures(monics, sampleCount, seed ^ degree ^ (q << 8), universe, degree), stats)),
      reducible: seeds.map((seed) => scoreItems(fieldPairFeatures(reducibles, sampleCount, seed ^ degree ^ 0xa5a5a5 ^ q, universe, degree), stats)),
    };
    rows.push({
      degree,
      labels: irreducibles.length,
      samples: real.samples,
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
  const intRows = result.integer.rows.map((row) => `| ${row.N} | ${row.labels} | ${row.samples} | ${fmt(row.real.aggregateZ)} | ${fmt(row.real.absAggregateZ)} | ${fmt(row.real.rmsZ)} | ${fmt(row.real.meanFeature)} | ${fmt(row.summary.cramer.absAggregateZ[0])}..${fmt(row.summary.cramer.absAggregateZ[1])} | ${fmt(row.summary.oddRandom.absAggregateZ[0])}..${fmt(row.summary.oddRandom.absAggregateZ[1])} | ${fmt(row.summary.oddComposite.absAggregateZ[0])}..${fmt(row.summary.oddComposite.absAggregateZ[1])} |`).join("\n");
  const fieldTable = (audit, label) => `\n${label}\n\n| degree | labels | samples | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range |\n| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${audit.rows.map((row) => `| ${row.degree} | ${row.labels} | ${row.samples} | ${fmt(row.real.aggregateZ)} | ${fmt(row.real.absAggregateZ)} | ${fmt(row.real.rmsZ)} | ${fmt(row.summary.monic.absAggregateZ[0])}..${fmt(row.summary.monic.absAggregateZ[1])} | ${fmt(row.summary.reducible.absAggregateZ[0])}..${fmt(row.summary.reducible.absAggregateZ[1])} |`).join("\n")}`;
  return `# unlabeled prime-pair difference roughness audit

Candidate:
sample unordered prime/irreducible pairs, reduce their difference to an
unlabeled roughness feature omega(diff), bucket by difference size/degree,
and aggregate z-scores against random odd/monic pair backgrounds.

## Integer side

Abs aggregate theta: \`${fmt(result.integer.theta.absAggregateZ)}\`; rmsZ
theta: \`${fmt(result.integer.theta.rmsZ)}\`.

| N | labels | pair samples | real aggregateZ | real absAggregateZ | real rmsZ | real mean omega | Cramer abs range | odd-random abs range | odd-composite abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
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
    row.summary.cramer.absAggregateZ[0],
    row.summary.cramer.absAggregateZ[1],
    row.summary.oddComposite.absAggregateZ[0],
    row.summary.oddComposite.absAggregateZ[1],
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
    ...result.q2.rows.map((row) => ({ label: `F2 d${row.degree}`, value: row.real.absAggregateZ, range: row.summary.reducible.absAggregateZ, color: "#9b7bdb" })),
    ...result.q3.rows.map((row) => ({ label: `F3 d${row.degree}`, value: row.real.absAggregateZ, range: row.summary.reducible.absAggregateZ, color: "#38b98d" })),
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
<text x="64" y="30" fill="#e5e7eb" font-size="18" font-weight="700">Unlabeled prime-pair difference roughness</text>
<text x="64" y="54" fill="#a8b3c7" font-size="13">y: abs aggregate z of omega(pair difference) after difference-size buckets</text>
<line x1="${pad}" x2="${pad + plotW}" y1="${pad + plotH}" y2="${pad + plotH}" stroke="#334155"/>
<line x1="${pad}" x2="${pad}" y1="${pad}" y2="${pad + plotH}" stroke="#334155"/>
${band("cramer", "#facc15")}
${band("oddComposite", "#fb7185")}
<polyline points="${points(rows.map((row) => row.real.absAggregateZ))}" fill="none" stroke="#67e8f9" stroke-width="3"/>
${rows.map((row, i) => `<text x="${x(i) - 26}" y="${pad + plotH + 22}" fill="#94a3b8" font-size="11">${row.N / 1_000_000}M</text>`).join("\n")}
<text x="760" y="72" fill="#e5e7eb" font-size="15" font-weight="700">Function-field real / reducible range</text>
${bars}
<text x="64" y="596" fill="#a8b3c7" font-size="12">cyan real; yellow Cramer band; red odd-composite band; bars compare function-field real to reducible controls</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const basename = `pair-difference-roughness-audit-${N}`;
const jsonPath = path.join(outDir, `${basename}.json`);
const mdPath = path.join(outDir, `${basename}.md`);
const svgPath = path.join(outDir, `${basename}.svg`);

const result = {
  candidate: "unlabeled prime-pair difference roughness",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  pairSamples,
  backgroundSamples,
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
