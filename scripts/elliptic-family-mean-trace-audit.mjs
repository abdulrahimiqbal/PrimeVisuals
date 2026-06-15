#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 5000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const A = Number(process.argv[4] || 256);
const holdoutA = Number(process.argv[5] || 128);
const seeds = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 1013904223, 2654435761, 11235813, 14142135,
  17320508, 22360679, 24494897, 31415926, 27182818,
];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(100, Math.round(x)));

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
  return values.length ? [Math.min(...values), Math.max(...values)] : [0, 0];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function mod(value, p) {
  const r = value % p;
  return r < 0 ? r + p : r;
}

function quadraticCharacterTable(p) {
  const chi = new Int8Array(p);
  chi.fill(-1);
  chi[0] = 0;
  for (let y = 1; y <= (p - 1) >> 1; y++) chi[(y * y) % p] = 1;
  return chi;
}

function familyValueAtPrime(p, familySize) {
  if (p <= 3) return null;
  const chi = quadraticCharacterTable(p);
  const cubes = new Int32Array(p);
  for (let x = 0; x < p; x++) cubes[x] = (((x * x) % p) * x + 1) % p;
  let good = 0;
  let sumTrace = 0;
  let maxAbsTraceRatio = 0;
  for (let a = 1; a <= familySize; a++) {
    const ar = a % p;
    const discPart = mod((4 * ar * ar * ar) + 27, p);
    if (discPart === 0) continue;
    let characterSum = 0;
    for (let x = 0; x < p; x++) {
      characterSum += chi[(cubes[x] + ar * x) % p];
    }
    const trace = -characterSum;
    good++;
    sumTrace += trace;
    maxAbsTraceRatio = Math.max(maxAbsTraceRatio, Math.abs(trace) / (2 * Math.sqrt(p)));
  }
  if (!good) return null;
  return {
    p,
    goodCurves: good,
    sumTrace,
    meanU1: sumTrace / (2 * Math.sqrt(p) * good),
    value: sumTrace / (Math.sqrt(p) * Math.sqrt(good)),
    maxAbsTraceRatio,
  };
}

function computeFamilyRecords(familySize) {
  console.error(`[elliptic-family] family A=${familySize}, primes <= ${N}`);
  const records = [];
  for (const p of primesUpTo(N)) {
    const row = familyValueAtPrime(p, familySize);
    if (row) records.push(row);
  }
  return records;
}

function shuffle(values, seed) {
  const random = rng(seed);
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function sampleObserved(values, count, seed) {
  const random = rng(seed);
  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = values[Math.floor(random() * values.length)];
  return out;
}

function sampleNormal(count, seed) {
  const random = rng(seed);
  const out = new Array(count);
  for (let i = 0; i < count; i += 2) {
    const u1 = Math.max(Number.MIN_VALUE, random());
    const u2 = random();
    const r = Math.sqrt(-2 * Math.log(u1));
    const theta = 2 * Math.PI * u2;
    out[i] = r * Math.cos(theta);
    if (i + 1 < count) out[i + 1] = r * Math.sin(theta);
  }
  return out;
}

function linearFit(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  const slope = sxy / (sxx || 1);
  return { slope, intercept: my - slope * mx };
}

function exponent(rows, key, scaleKey = "count") {
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function endpointCountsForRecords(records) {
  let cursor = 0;
  return endpoints.map((endpoint) => {
    while (cursor < records.length && records[cursor].p <= endpoint) cursor++;
    return cursor;
  });
}

function endpointCountsForLabels(labels) {
  const sorted = labels.slice().sort((a, b) => a - b);
  let cursor = 0;
  return endpoints.map((endpoint) => {
    while (cursor < sorted.length && sorted[cursor] <= endpoint) cursor++;
    return cursor;
  });
}

function scoreValues(name, values, endpointCounts) {
  const rows = [];
  const blocks = [];
  let sum = 0;
  let maxAbsSum = 0;
  let maxAbsZ = 0;
  let cursor = 0;
  let lastCount = 0;
  let lastSum = 0;
  for (let i = 0; i < endpointCounts.length; i++) {
    const target = Math.min(endpointCounts[i], values.length);
    while (cursor < target) {
      sum += values[cursor++];
      const zNow = sum / Math.sqrt(Math.max(1, cursor));
      maxAbsSum = Math.max(maxAbsSum, Math.abs(sum));
      maxAbsZ = Math.max(maxAbsZ, Math.abs(zNow));
    }
    const row = {
      N: endpoints[i],
      count: cursor,
      sum,
      z: sum / Math.sqrt(Math.max(1, cursor)),
      maxAbsSum,
      maxAbsZ,
    };
    rows.push(row);
    const blockCount = cursor - lastCount;
    const blockSum = sum - lastSum;
    blocks.push({
      lo: i ? endpoints[i - 1] : 1,
      hi: endpoints[i],
      count: blockCount,
      sum: blockSum,
      z: blockSum / Math.sqrt(Math.max(1, blockCount)),
    });
    lastCount = cursor;
    lastSum = sum;
  }
  return {
    name,
    rows,
    blocks,
    theta: {
      maxAbsSum: exponent(rows, "maxAbsSum"),
      absSum: exponent(rows.map((row) => ({ ...row, absSum: Math.abs(row.sum) })), "absSum"),
    },
  };
}

function summarizeControls(runs) {
  const finals = runs.map((run) => run.rows.at(-1));
  return {
    count: range(finals.map((row) => row.count)),
    z: range(finals.map((row) => row.z)),
    absZ: range(finals.map((row) => Math.abs(row.z))),
    maxAbsZ: range(finals.map((row) => row.maxAbsZ)),
    theta: range(runs.map((run) => run.theta.maxAbsSum)),
  };
}

function holdoutSummary(runs) {
  const finalBlocks = runs.map((run) => run.blocks.at(-1));
  return {
    count: range(finalBlocks.map((row) => row.count)),
    z: range(finalBlocks.map((row) => row.z)),
    absZ: range(finalBlocks.map((row) => Math.abs(row.z))),
  };
}

function namedCompositeChecks() {
  return [25, 35, 77, 289].map((n) => ({
    n,
    primeField: false,
    reason: "composite modulus is not a finite field, so the family trace over F_n is not defined",
  }));
}

function familyAudit(familySize, includeControls) {
  const records = computeFamilyRecords(familySize);
  const values = records.map((record) => record.value);
  const endpointCounts = endpointCountsForRecords(records);
  const valueMean = mean(values);
  const real = scoreValues(`family-A${familySize}`, values, endpointCounts);
  const centered = scoreValues(`family-A${familySize}-empirical-centered`, values.map((value) => value - valueMean), endpointCounts);
  const maxCount = Math.max(...endpointCounts);
  const controls = includeControls ? {
    shuffle: seeds.map((seed) => scoreValues(`shuffle-${seed}`, shuffle(values, seed), endpointCounts)),
    bootstrap: seeds.map((seed) => scoreValues(`bootstrap-${seed}`, sampleObserved(values, maxCount, seed ^ 0x9e3779b9), endpointCounts)),
    normal: seeds.map((seed) => scoreValues(`normal-${seed}`, sampleNormal(maxCount, seed ^ 0x517cc1b7), endpointCounts)),
    cramerIndex: seeds.map((seed) => {
      const counts = endpointCountsForLabels(cramerPrimes(N, seed));
      const sampled = sampleObserved(values, Math.max(...counts), seed ^ 0xbb67ae85);
      return scoreValues(`cramer-index-${seed}`, sampled, counts);
    }),
  } : {};
  return {
    familySize,
    records,
    endpointCounts,
    real,
    centered,
    traceSummary: {
      count: values.length,
      valueMean,
      valueRange: range(values),
      valueSd: Math.sqrt(mean(values.map((value) => (value - valueMean) ** 2))),
      goodCurvesRange: range(records.map((record) => record.goodCurves)),
      maxAbsTraceRatio: Math.max(...records.map((record) => record.maxAbsTraceRatio)),
    },
    controls,
    summary: includeControls ? Object.fromEntries(
      Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)]),
    ) : {},
    holdout: includeControls ? {
      real: real.blocks.at(-1),
      shuffle: holdoutSummary(controls.shuffle),
      bootstrap: holdoutSummary(controls.bootstrap),
      normal: holdoutSummary(controls.normal),
      cramerIndex: holdoutSummary(controls.cramerIndex),
    } : { real: real.blocks.at(-1) },
  };
}

function makeSvg(report) {
  const width = 1180;
  const height = 660;
  const margin = { left: 70, right: 330, top: 70, bottom: 78 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const realRows = report.primary.real.rows;
  const series = [
    { id: "A256 real Z", color: "#67e8f9", rows: realRows.map((row, i) => ({ x: i, y: row.z })) },
    { id: "A256 max |Z|", color: "#fbbf24", rows: realRows.map((row, i) => ({ x: i, y: row.maxAbsZ })) },
    { id: "shuffle mean max", color: "#a78bfa", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.primary.controls.shuffle.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "bootstrap mean max", color: "#34d399", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.primary.controls.bootstrap.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "normal mean max", color: "#fb7185", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.primary.controls.normal.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "A256 centered max", color: "#f97316", rows: report.primary.centered.rows.map((row, i) => ({ x: i, y: row.maxAbsZ })) },
    { id: "A128 real max", color: "#60a5fa", rows: report.secondary.real.rows.map((row, i) => ({ x: i, y: row.maxAbsZ })) },
  ];
  const allY = series.flatMap((entry) => entry.rows.map((row) => row.y));
  const yMin = Math.min(-1, ...allY) * 1.1;
  const yMax = Math.max(1, ...allY) * 1.1;
  const xOf = (point) => margin.left + (point.x / Math.max(1, realRows.length - 1)) * plotW;
  const yOf = (point) => margin.top + (1 - (point.y - yMin) / (yMax - yMin)) * plotH;
  const polyline = (rows) => rows.map((point) => `${xOf(point).toFixed(2)},${yOf(point).toFixed(2)}`).join(" ");
  const grid = [];
  for (let i = 0; i <= 6; i++) {
    const y = margin.top + (i / 6) * plotH;
    const value = yMax - (i / 6) * (yMax - yMin);
    grid.push(`<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1f2937"/>`);
    grid.push(`<text x="18" y="${y + 4}" fill="#94a3b8" font-size="12">${fmt(value, 2)}</text>`);
  }
  const zeroY = yOf({ x: 0, y: 0 });
  grid.push(`<line x1="${margin.left}" y1="${zeroY}" x2="${width - margin.right}" y2="${zeroY}" stroke="#475569" stroke-width="1.5"/>`);
  const lines = series.map((entry) => {
    const dots = entry.rows.map((point) => `<circle cx="${xOf(point)}" cy="${yOf(point)}" r="4" fill="${entry.color}"/>`).join("");
    return `<polyline points="${polyline(entry.rows)}" fill="none" stroke="${entry.color}" stroke-width="3"/>${dots}`;
  }).join("\n");
  const legend = series.map((entry, i) => {
    const x = margin.left + (i % 3) * 230;
    const y = 38 + Math.floor(i / 3) * 18;
    return `<text x="${x}" y="${y}" fill="${entry.color}" font-size="13">${entry.id}</text>`;
  }).join("\n");
  const final = report.primary.real.rows.at(-1);
  const notes = [
    `family y^2=x^3+a*x+1`,
    `A256 final Z ${fmt(final.z)}`,
    `A256 max |Z| ${fmt(final.maxAbsZ)}`,
    `shuffle max ${fmt(report.primary.summary.shuffle.maxAbsZ[0])}..${fmt(report.primary.summary.shuffle.maxAbsZ[1])}`,
    `normal max ${fmt(report.primary.summary.normal.maxAbsZ[0])}..${fmt(report.primary.summary.normal.maxAbsZ[1])}`,
    `A256 centered max ${fmt(report.primary.centered.rows.at(-1).maxAbsZ)}`,
    `A128 max |Z| ${fmt(report.secondary.real.rows.at(-1).maxAbsZ)}`,
  ].map((text, i) => `<text x="${width - 300}" y="${116 + i * 27}" fill="#cbd5e1" font-size="13">${text}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Elliptic family mean-trace audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 38}" fill="#94a3b8" font-size="13">Z: cumulative normalized family mean trace V_A(p), scaled by sqrt(good-prime count).</text>
</svg>`;
}

function controlTable(summary) {
  return Object.entries(summary).map(([name, row]) => `| ${name} | ${row.count[0]}..${row.count[1]} | ${fmt(row.z[0])}..${fmt(row.z[1])} | ${fmt(row.absZ[0])}..${fmt(row.absZ[1])} | ${fmt(row.maxAbsZ[0])}..${fmt(row.maxAbsZ[1])} | ${fmt(row.theta[0])}..${fmt(row.theta[1])} |`).join("\n");
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Elliptic family mean-trace audit", "");
  lines.push("Family: `E_a: y^2=x^3+a*x+1`, integer `1<=a<=A`; bad reductions are skipped per prime.", "");
  lines.push("Candidate: `V_A(p)=sum_a a_p(E_a)/(sqrt(p)*sqrt(good_a_count))`; `Z_A(N)=sum V_A(p)/sqrt(good_prime_count)`.", "");
  lines.push("## A=256 endpoint trace", "");
  lines.push("| N | primes | sum V | Z | max |Z| |");
  lines.push("| ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.primary.real.rows) {
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.sum)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("A=256 controls, 15 seeds:");
  lines.push("");
  lines.push("| control | count range | final Z range | final |Z| range | max |Z| range | theta range |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  lines.push(controlTable(report.primary.summary));
  lines.push("");
  lines.push("A=256 empirical-centered diagnostic:");
  lines.push("");
  lines.push("| N | primes | centered sum | centered Z | centered max |Z| |");
  lines.push("| ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.primary.centered.rows) {
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.sum)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("Fresh holdout block:");
  lines.push("");
  lines.push("| object | count/range | Z/range | |Z| range |");
  lines.push("| --- | ---: | ---: | ---: |");
  lines.push(`| real | ${report.primary.holdout.real.count} | ${fmt(report.primary.holdout.real.z)} | ${fmt(Math.abs(report.primary.holdout.real.z))} |`);
  for (const key of ["shuffle", "bootstrap", "normal", "cramerIndex"]) {
    const row = report.primary.holdout[key];
    lines.push(`| ${key} | ${row.count[0]}..${row.count[1]} | ${fmt(row.z[0])}..${fmt(row.z[1])} | ${fmt(row.absZ[0])}..${fmt(row.absZ[1])} |`);
  }
  lines.push("");
  lines.push("## A=128 holdout family", "");
  lines.push("| N | primes | sum V | Z | max |Z| |");
  lines.push("| ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.secondary.real.rows) {
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.sum)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("Trace summaries:");
  lines.push("");
  lines.push(`- A=256 value mean: \`${fmt(report.primary.traceSummary.valueMean)}\`, sd: \`${fmt(report.primary.traceSummary.valueSd)}\`, range: \`${fmt(report.primary.traceSummary.valueRange[0])}..${fmt(report.primary.traceSummary.valueRange[1])}\``);
  lines.push(`- A=128 value mean: \`${fmt(report.secondary.traceSummary.valueMean)}\`, sd: \`${fmt(report.secondary.traceSummary.valueSd)}\`, range: \`${fmt(report.secondary.traceSummary.valueRange[0])}..${fmt(report.secondary.traceSummary.valueRange[1])}\``);
  lines.push(`- max |a_p|/(2sqrt(p)) seen in A=256 family: \`${fmt(report.primary.traceSummary.maxAbsTraceRatio)}\``);
  lines.push("");
  lines.push("Named composite checks:");
  lines.push("");
  lines.push("| n | prime field? | reason |");
  lines.push("| ---: | --- | --- |");
  for (const row of report.namedComposites) {
    lines.push(`| ${row.n} | ${row.primeField ? "yes" : "no"} | ${row.reason} |`);
  }
  lines.push("");
  lines.push("Factor check:");
  lines.push("");
  lines.push("This is not a Chebyshev, Mertens, or gap-telescope identity. It breaks if distributional controls reproduce the family-mean walk, because then the object is a finite-family Sato-Tate/character-sum average rather than prime regularity.");
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
const primary = familyAudit(A, true);
const secondary = familyAudit(holdoutA, false);
const paths = {
  json: path.join(outDir, `elliptic-family-mean-trace-${N}.json`),
  md: path.join(outDir, `elliptic-family-mean-trace-${N}.md`),
  svg: path.join(outDir, `elliptic-family-mean-trace-${N}.svg`),
};
const report = {
  candidate: "elliptic family mean-trace bridge",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  seeds,
  primary,
  secondary,
  namedComposites: namedCompositeChecks(),
  paths,
};
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  primaryEndpoint: primary.real.rows.at(-1),
  primaryTraceSummary: primary.traceSummary,
  controls: primary.summary,
  holdout: primary.holdout,
  secondaryEndpoint: secondary.real.rows.at(-1),
  paths,
}, null, 2));
