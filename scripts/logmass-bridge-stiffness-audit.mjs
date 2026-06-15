#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildPolynomialUniverse } from "../src/core/ffield.js";
import { cramerPrimes, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 8_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 24);
const q3MaxDegree = Number(process.argv[5] || 14);
const checkpoints = Number(process.argv[6] || 64);

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

function rms(values) {
  return Math.sqrt(mean(values.map((value) => value * value)));
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

function exponent(rows, valueKey, scaleKey = "expected") {
  const usable = rows
    .map((row) => ({ x: row[scaleKey], y: Math.abs(row.real[valueKey]) }))
    .filter((row) => row.x > 1 && row.y > 0);
  if (usable.length < 2) return 0;
  return linearFit(usable.map((row) => Math.log(row.x)), usable.map((row) => Math.log(row.y))).slope;
}

function poisson(lambda, random) {
  if (lambda <= 0) return 0;
  if (lambda < 32) {
    const limit = Math.exp(-lambda);
    let product = 1, k = 0;
    do {
      k++;
      product *= random();
    } while (product > limit);
    return k - 1;
  }
  const normal = Math.sqrt(-2 * Math.log(Math.max(1e-12, random()))) * Math.cos(2 * Math.PI * random());
  return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * normal));
}

function binomial(count, probability, random) {
  if (count <= 0 || probability <= 0) return 0;
  if (probability >= 1) return count;
  const meanValue = count * probability;
  if (count <= 2000 || meanValue < 40) {
    let hits = 0;
    for (let i = 0; i < count; i++) if (random() < probability) hits++;
    return hits;
  }
  const sd = Math.sqrt(count * probability * (1 - probability));
  const normal = Math.sqrt(-2 * Math.log(Math.max(1e-12, random()))) * Math.cos(2 * Math.PI * random());
  return Math.max(0, Math.min(count, Math.round(meanValue + sd * normal)));
}

function summarizeControls(controls) {
  return {
    rms: range(controls.map((row) => row.rms)),
    maxAbs: range(controls.map((row) => row.maxAbs)),
    endpoint: range(controls.map((row) => row.endpoint)),
    roughness: range(controls.map((row) => row.roughness)),
  };
}

function prefixFromLabels(labels, limit) {
  const prefix = new Int32Array(limit + 1);
  let index = 0, count = 0;
  for (let n = 0; n <= limit; n++) {
    while (index < labels.length && labels[index] === n) {
      count++;
      index++;
    }
    prefix[n] = count;
  }
  return prefix;
}

function buildIntegerTables(limit) {
  console.error(`[bridge] integer tables to ${limit}`);
  const primeFlags = sieve(limit);
  const expected = new Float64Array(limit + 1);
  const primePrefix = new Int32Array(limit + 1);
  const oddCompositePrefix = new Int32Array(limit + 1);
  let e = 0, p = 0, c = 0;
  for (let n = 1; n <= limit; n++) {
    if (n >= 3) e += 1 / Math.log(n);
    if (primeFlags[n]) p++;
    if (n >= 3 && (n & 1) && !primeFlags[n]) c++;
    expected[n] = e;
    primePrefix[n] = p;
    oddCompositePrefix[n] = c;
  }
  const cramerPrefixes = seeds.map((seed) => prefixFromLabels(cramerPrimes(limit, seed), limit));
  return { expected, primePrefix, oddCompositePrefix, cramerPrefixes };
}

function checkpointIndexes(expected, limit, k) {
  const total = expected[limit];
  const indexes = [];
  let cursor = 3;
  for (let j = 1; j <= k; j++) {
    const target = total * j / k;
    while (cursor < limit && expected[cursor] < target) cursor++;
    indexes.push(cursor);
  }
  return indexes;
}

function scoreBridgeFromCounts(counts, expectedValues) {
  const totalExpected = expectedValues.at(-1);
  const endpoint = counts.at(-1) - totalExpected;
  const bridges = counts.map((count, i) => {
    const t = expectedValues[i] / totalExpected;
    return count - expectedValues[i] - t * endpoint;
  });
  const scale = Math.sqrt(Math.max(1, totalExpected));
  const normalized = bridges.map((value) => value / scale);
  const secondDiffs = [];
  for (let i = 1; i + 1 < normalized.length; i++) {
    secondDiffs.push(normalized[i + 1] - 2 * normalized[i] + normalized[i - 1]);
  }
  const maxEntry = normalized
    .map((value, i) => ({ checkpoint: i + 1, value, abs: Math.abs(value) }))
    .sort((a, b) => b.abs - a.abs)[0] || { checkpoint: 0, value: 0, abs: 0 };
  return {
    rms: rms(normalized),
    maxAbs: maxEntry.abs,
    endpoint: endpoint / scale,
    roughness: rms(secondDiffs),
    maxEntry,
    normalized,
  };
}

function scorePrefix(prefix, indexes, expected) {
  const counts = indexes.map((idx) => prefix[idx]);
  const expectedValues = indexes.map((idx) => expected[idx]);
  return scoreBridgeFromCounts(counts, expectedValues);
}

function poissonControl(indexes, expected, seed) {
  const random = rng(seed);
  let count = 0, lastExpected = 0;
  const counts = [];
  const expectedValues = [];
  for (const idx of indexes) {
    const e = expected[idx];
    count += poisson(e - lastExpected, random);
    lastExpected = e;
    counts.push(count);
    expectedValues.push(e);
  }
  return scoreBridgeFromCounts(counts, expectedValues);
}

function fixedTotalControl(indexes, expected, totalCount, seed) {
  const random = rng(seed);
  const totalExpected = expected[indexes.at(-1)];
  let count = 0, previousMass = 0;
  const counts = [];
  const expectedValues = [];
  for (const idx of indexes) {
    const mass = expected[idx] / totalExpected;
    const p = Math.max(0, Math.min(1, (mass - previousMass) / Math.max(1e-12, 1 - previousMass)));
    const hits = binomial(totalCount - count, p, random);
    count += hits;
    previousMass = mass;
    counts.push(count);
    expectedValues.push(expected[idx]);
  }
  return scoreBridgeFromCounts(counts, expectedValues);
}

function thinnedCompositeControl(indexes, expected, compositePrefix, seed) {
  const random = rng(seed);
  let count = 0, lastExpected = 0, lastComposite = 0;
  const counts = [];
  const expectedValues = [];
  for (const idx of indexes) {
    const composites = compositePrefix[idx] - lastComposite;
    const expectedIncrement = expected[idx] - lastExpected;
    const probability = Math.min(1, expectedIncrement / Math.max(1, composites));
    count += binomial(composites, probability, random);
    lastExpected = expected[idx];
    lastComposite = compositePrefix[idx];
    counts.push(count);
    expectedValues.push(expected[idx]);
  }
  return scoreBridgeFromCounts(counts, expectedValues);
}

function integerAudit() {
  const tables = buildIntegerTables(Math.max(...endpoints));
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[bridge] integer N=${limit}`);
    const indexes = checkpointIndexes(tables.expected, limit, checkpoints);
    const expected = indexes.at(-1) ? tables.expected[indexes.at(-1)] : tables.expected[limit];
    const real = scorePrefix(tables.primePrefix, indexes, tables.expected);
    const controls = {
      poisson: seeds.map((seed) => poissonControl(indexes, tables.expected, seed ^ limit ^ 0x10101)),
      fixedTotal: seeds.map((seed) => fixedTotalControl(indexes, tables.expected, tables.primePrefix[limit], seed ^ limit ^ 0x20202)),
      cramer: tables.cramerPrefixes.map((prefix) => scorePrefix(prefix, indexes, tables.expected)),
      composite: seeds.map((seed) => thinnedCompositeControl(indexes, tables.expected, tables.oddCompositePrefix, seed ^ limit ^ 0x30303)),
    };
    rows.push({
      N: limit,
      expected,
      labels: tables.primePrefix[limit],
      checkpoints,
      real,
      controls,
      summary: Object.fromEntries(Object.entries(controls).map(([key, value]) => [key, summarizeControls(value)])),
    });
  }
  return {
    rows,
    theta: {
      rms: exponent(rows, "rms"),
      maxAbs: exponent(rows, "maxAbs"),
      roughness: exponent(rows, "roughness"),
    },
  };
}

function degreeBridge(counts, expectedShells, maxDegree) {
  let observed = 0, expected = 0;
  const cumulativeCounts = [];
  const expectedValues = [];
  for (let degree = 1; degree <= maxDegree; degree++) {
    observed += counts[degree] || 0;
    expected += expectedShells[degree] || 0;
    cumulativeCounts.push(observed);
    expectedValues.push(expected);
  }
  return scoreBridgeFromCounts(cumulativeCounts, expectedValues);
}

function fieldControl(expectedShells, maxDegree, seed, mode, q) {
  const random = rng(seed);
  const counts = new Array(maxDegree + 1).fill(0);
  for (let degree = 1; degree <= maxDegree; degree++) {
    const expected = expectedShells[degree];
    if (mode === "poisson") {
      counts[degree] = poisson(expected, random);
    } else {
      const monics = q ** degree;
      counts[degree] = binomial(monics, Math.min(1, expected / monics), random);
    }
  }
  return degreeBridge(counts, expectedShells, maxDegree);
}

function fieldAudit(q, maxDegree) {
  console.error(`[bridge] F_${q}[t] to degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const degrees = [maxDegree - 4, maxDegree - 3, maxDegree - 2, maxDegree - 1, maxDegree].filter((d) => d >= 6);
  const rows = [];
  for (const degreeLimit of degrees) {
    const expectedShells = new Array(degreeLimit + 1).fill(0);
    const counts = new Array(degreeLimit + 1).fill(0);
    for (let degree = 1; degree <= degreeLimit; degree++) {
      expectedShells[degree] = (q ** degree) / degree;
      counts[degree] = universe.counts[degree];
    }
    const real = degreeBridge(counts, expectedShells, degreeLimit);
    const controls = {
      poisson: seeds.map((seed) => fieldControl(expectedShells, degreeLimit, seed ^ (q << 12) ^ degreeLimit, "poisson", q)),
      binomial: seeds.map((seed) => fieldControl(expectedShells, degreeLimit, seed ^ (q << 16) ^ degreeLimit, "binomial", q)),
    };
    rows.push({
      degree: degreeLimit,
      expected: expectedShells.reduce((sum, value) => sum + value, 0),
      labels: counts.reduce((sum, value) => sum + value, 0),
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
      rms: exponent(rows, "rms"),
      maxAbs: exponent(rows, "maxAbs"),
      roughness: exponent(rows, "roughness"),
    },
  };
}

function markdownReport(result) {
  const intRows = result.integer.rows.map((row) => `| ${row.N} | ${row.labels} | ${fmt(row.expected)} | ${fmt(row.real.rms)} | ${fmt(row.real.maxAbs)} | ${fmt(row.real.endpoint)} | ${fmt(row.real.roughness)} | ${fmt(row.summary.poisson.rms[0])}..${fmt(row.summary.poisson.rms[1])} | ${fmt(row.summary.fixedTotal.rms[0])}..${fmt(row.summary.fixedTotal.rms[1])} | ${fmt(row.summary.cramer.rms[0])}..${fmt(row.summary.cramer.rms[1])} | ${fmt(row.summary.composite.rms[0])}..${fmt(row.summary.composite.rms[1])} |`).join("\n");
  const fieldTable = (audit, label) => `\n${label}\n\n| degree | labels | expected | real rms | real max | real endpoint | real roughness | Poisson rms range | binomial rms range |\n| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${audit.rows.map((row) => `| ${row.degree} | ${row.labels} | ${fmt(row.expected)} | ${fmt(row.real.rms)} | ${fmt(row.real.maxAbs)} | ${fmt(row.real.endpoint)} | ${fmt(row.real.roughness)} | ${fmt(row.summary.poisson.rms[0])}..${fmt(row.summary.poisson.rms[1])} | ${fmt(row.summary.binomial.rms[0])}..${fmt(row.summary.binomial.rms[1])} |`).join("\n")}`;
  return `# log-mass prime-count bridge stiffness audit

Candidate:
partition integer time by equal increments of the discrete logarithmic
density main term, bridge the cumulative prime-count residual, and score
the normalized internal path stiffness.

## Integer side

RMS theta: \`${fmt(result.integer.theta.rms)}\`; max theta:
\`${fmt(result.integer.theta.maxAbs)}\`; roughness theta:
\`${fmt(result.integer.theta.roughness)}\`.

| N | labels | expected | real rms | real max | endpoint | roughness | Poisson rms range | fixed-total rms range | Cramer rms range | composite rms range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${intRows}

Endpoint largest normalized bridge displacement:
\`${JSON.stringify(result.integer.rows.at(-1).real.maxEntry)}\`.

## Function fields
${fieldTable(result.q2, "F_2[t]")}
${fieldTable(result.q3, "F_3[t]")}

SVG: \`${result.svgPath}\`
JSON: \`${result.jsonPath}\`
`;
}

function svgPlot(result) {
  const width = 1140, height = 650, pad = 70, plotW = 620, plotH = 430;
  const rows = result.integer.rows;
  const allY = rows.flatMap((row) => [
    row.real.rms,
    row.summary.poisson.rms[0],
    row.summary.poisson.rms[1],
    row.summary.fixedTotal.rms[0],
    row.summary.fixedTotal.rms[1],
    row.summary.composite.rms[0],
    row.summary.composite.rms[1],
    row.summary.cramer.rms[0],
    row.summary.cramer.rms[1],
  ]);
  const yMax = Math.max(...allY, 1) * 1.15;
  const x = (i) => pad + (i * plotW) / Math.max(1, rows.length - 1);
  const y = (value) => pad + plotH - (value / yMax) * plotH;
  const points = (values) => values.map((value, i) => `${x(i)},${y(value)}`).join(" ");
  const band = (key, color, opacity = 0.16) => {
    const top = rows.map((row) => row.summary[key].rms[1]);
    const bottom = rows.map((row) => row.summary[key].rms[0]);
    const d = [...top.map((value, i) => `${x(i)},${y(value)}`), ...bottom.map((value, i) => `${x(rows.length - 1 - i)},${y(value)}`)].join(" ");
    return `<polygon points="${d}" fill="${color}" opacity="${opacity}"/>`;
  };
  const bridge = result.integer.rows.at(-1).real.normalized;
  const bridgeX = (i) => 75 + (i * 570) / Math.max(1, bridge.length - 1);
  const bridgeMax = Math.max(...bridge.map(Math.abs), 0.25) * 1.15;
  const bridgeY = (value) => 585 - ((value + bridgeMax) / (2 * bridgeMax)) * 68;
  const fieldRows = [
    ...result.q2.rows.map((row) => ({ label: `F2 d${row.degree}`, value: row.real.rms, range: row.summary.poisson.rms, color: "#9b7bdb" })),
    ...result.q3.rows.map((row) => ({ label: `F3 d${row.degree}`, value: row.real.rms, range: row.summary.poisson.rms, color: "#38b98d" })),
  ];
  const barX = 805, barW = 215;
  const barMax = Math.max(...fieldRows.flatMap((row) => [row.value, row.range[1]]), 1);
  const bars = fieldRows.map((row, i) => {
    const yy = 96 + i * 28;
    const w = (row.value / barMax) * barW;
    const r0 = barX + (row.range[0] / barMax) * barW;
    const r1 = barX + (row.range[1] / barMax) * barW;
    return `<text x="${barX - 84}" y="${yy + 8}" fill="${row.color}" font-size="13">${row.label}</text>
<line x1="${r0}" x2="${r1}" y1="${yy + 4}" y2="${yy + 4}" stroke="#e2e8f0" stroke-width="3" opacity="0.8"/>
<rect x="${barX}" y="${yy}" width="${w}" height="10" fill="${row.color}" opacity="0.9"/>
<text x="${barX + barW + 18}" y="${yy + 9}" fill="#dbeafe" font-size="12">${fmt(row.value)}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#080d17"/>
<style>text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }</style>
<text x="70" y="32" fill="#e5e7eb" font-size="18" font-weight="700">Log-mass prime-count bridge stiffness</text>
<text x="70" y="55" fill="#a8b3c7" font-size="13">rms of bridged pi(x)-sum 1/log(n), normalized by sqrt(expected mass)</text>
<line x1="${pad}" x2="${pad + plotW}" y1="${pad + plotH}" y2="${pad + plotH}" stroke="#334155"/>
<line x1="${pad}" x2="${pad}" y1="${pad}" y2="${pad + plotH}" stroke="#334155"/>
${band("poisson", "#facc15")}
${band("fixedTotal", "#60a5fa", 0.12)}
${band("composite", "#fb7185", 0.13)}
${band("cramer", "#f97316", 0.13)}
<polyline points="${points(rows.map((row) => row.real.rms))}" fill="none" stroke="#67e8f9" stroke-width="3"/>
${rows.map((row, i) => `<text x="${x(i) - 24}" y="${pad + plotH + 22}" fill="#94a3b8" font-size="11">${row.N / 1_000_000}M</text>`).join("\n")}
<text x="805" y="72" fill="#e5e7eb" font-size="15" font-weight="700">Function-field real / Poisson range</text>
${bars}
<line x1="75" x2="645" y1="${bridgeY(0)}" y2="${bridgeY(0)}" stroke="#334155"/>
<polyline points="${bridge.map((value, i) => `${bridgeX(i)},${bridgeY(value)}`).join(" ")}" fill="none" stroke="#67e8f9" stroke-width="2"/>
<text x="70" y="620" fill="#a8b3c7" font-size="12">bottom: endpoint real bridge path; cyan real; yellow Poisson; blue fixed-total; red composite; orange Cramer</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const basename = `logmass-bridge-stiffness-audit-${N}`;
const jsonPath = path.join(outDir, `${basename}.json`);
const mdPath = path.join(outDir, `${basename}.md`);
const svgPath = path.join(outDir, `${basename}.svg`);

const result = {
  candidate: "log-mass prime-count bridge stiffness",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  checkpoints,
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
