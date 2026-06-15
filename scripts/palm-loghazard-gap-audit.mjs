#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));
const seeds = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 1013904223, 2654435761, 11235813, 14142135,
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

function gcd(a, b) {
  let x = Math.abs(a), y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function totient(n) {
  let m = n, out = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p) continue;
    out -= out / p;
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= out / m;
  return Math.round(out);
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  if (!values.length) return [0, 0];
  let lo = Infinity;
  let hi = -Infinity;
  for (const value of values) {
    if (value < lo) lo = value;
    if (value > hi) hi = value;
  }
  return [lo, hi];
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

function exponent(rows, key) {
  const fitRows = rows.filter((row) => row.count > 1 && row[key] > 0);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row.count)),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function logHazard(a, b) {
  if (b <= a || a < 3) return 0;
  const mid = (a + b) / 2;
  return ((b - a) / 6) * (1 / Math.log(a) + 4 / Math.log(mid) + 1 / Math.log(b));
}

function recordsFromLabels(labels, limit = N) {
  const sorted = labels.filter((x) => x >= 3 && x <= limit).slice().sort((a, b) => a - b);
  const records = [];
  for (let i = 0; i + 1 < sorted.length; i++) {
    const p = sorted[i];
    const q = sorted[i + 1];
    if (q > limit) break;
    const lambda = logHazard(p, q);
    records.push({
      p,
      q,
      gap: q - p,
      lambda,
      rawHazardResidual: lambda - 1,
      u: Math.exp(-lambda) - 0.5,
    });
  }
  return records;
}

function wheelRandomLabels(limit, W, seed) {
  const random = rng(seed);
  const phi = totient(W);
  const labels = [];
  for (let n = 3; n <= limit; n++) {
    if (gcd(n, W) !== 1) continue;
    const probability = Math.min(1, W / (phi * Math.log(n)));
    if (random() < probability) labels.push(n);
  }
  return labels;
}

function poissonHazardValues(count, seed) {
  const random = rng(seed);
  const values = new Array(count);
  for (let i = 0; i < count; i++) {
    const lambda = -Math.log(Math.max(Number.EPSILON, 1 - random()));
    values[i] = Math.exp(-lambda) - 0.5;
  }
  return values;
}

function sampleObserved(values, count, seed) {
  const random = rng(seed);
  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = values[Math.floor(random() * values.length)];
  return out;
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

function endpointCountsForRecords(records) {
  return endpoints.map((endpoint) => records.filter((record) => record.p <= endpoint).length);
}

function endpointCountsForLabels(labels) {
  const records = recordsFromLabels(labels);
  return endpointCountsForRecords(records);
}

function scoreValues(name, values, endpointCounts) {
  const rows = [];
  const blocks = [];
  let cursor = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsSum = 0;
  let maxAbsZ = 0;
  for (let i = 0; i < endpointCounts.length; i++) {
    const prevCursor = cursor;
    const prevSum = sum;
    const target = Math.min(endpointCounts[i], values.length);
    while (cursor < target) {
      const value = values[cursor++];
      sum += value;
      sumSquares += value * value;
      maxAbsSum = Math.max(maxAbsSum, Math.abs(sum));
      maxAbsZ = Math.max(maxAbsZ, Math.abs(sum / Math.sqrt(Math.max(1 / 12, cursor / 12))));
    }
    const count = cursor;
    const blockCount = cursor - prevCursor;
    const blockSum = sum - prevSum;
    const denominator = Math.sqrt(Math.max(1 / 12, count / 12));
    rows.push({
      N: endpoints[i],
      count,
      sum,
      mean: sum / Math.max(1, count),
      z: sum / denominator,
      energyZ: sum / Math.sqrt(Math.max(1e-18, sumSquares)),
      maxAbsSum,
      maxAbsZ,
    });
    blocks.push({
      lo: i ? endpoints[i - 1] : 1,
      hi: endpoints[i],
      count: blockCount,
      sum: blockSum,
      z: blockSum / Math.sqrt(Math.max(1 / 12, blockCount / 12)),
    });
  }
  return {
    name,
    rows,
    blocks,
    theta: {
      maxAbsSum: exponent(rows, "maxAbsSum"),
      maxAbsZ: exponent(rows, "maxAbsZ"),
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
    energyZ: range(finals.map((row) => row.energyZ)),
    thetaMaxAbsSum: range(runs.map((run) => run.theta.maxAbsSum)),
  };
}

function holdoutSummary(runs) {
  const lastBlocks = runs.map((run) => run.blocks.at(-1));
  return {
    count: range(lastBlocks.map((row) => row.count)),
    z: range(lastBlocks.map((row) => row.z)),
    absZ: range(lastBlocks.map((row) => Math.abs(row.z))),
  };
}

function rawHazardTelescope(records) {
  const values = records.map((record) => record.rawHazardResidual);
  const counts = endpointCountsForRecords(records);
  return scoreValues("raw hazard telescope", values, counts);
}

function namedCompositeChecks() {
  return [25, 35, 77, 289].map((n) => ({
    n,
    primeGapEvent: false,
    reason: "the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label",
  }));
}

function audit() {
  console.error(`[palm-loghazard] primes to ${N}`);
  const primeRecords = recordsFromLabels(primesUpTo(N));
  const values = primeRecords.map((record) => record.u);
  const endpointCounts = endpointCountsForRecords(primeRecords);
  const maxCount = Math.max(...endpointCounts);
  const real = scoreValues("real primes", values, endpointCounts);
  const rawTelescope = rawHazardTelescope(primeRecords);
  const controls = {
    shuffle: seeds.map((seed) => scoreValues(`gap-value-shuffle-${seed}`, shuffle(values, seed), endpointCounts)),
    bootstrap: seeds.map((seed) => scoreValues(`observed-bootstrap-${seed}`, sampleObserved(values, maxCount, seed ^ 0x9e3779b9), endpointCounts)),
    poissonHazard: seeds.map((seed) => scoreValues(`poisson-hazard-${seed}`, poissonHazardValues(maxCount, seed ^ 0x517cc1b7), endpointCounts)),
    cramerLabel: seeds.map((seed) => {
      const records = recordsFromLabels(cramerPrimes(N, seed));
      return scoreValues(`cramer-label-${seed}`, records.map((record) => record.u), endpointCountsForRecords(records));
    }),
    wheel210: seeds.map((seed) => {
      const records = recordsFromLabels(wheelRandomLabels(N, 210, seed ^ 0xbb67ae85));
      return scoreValues(`wheel210-${seed}`, records.map((record) => record.u), endpointCountsForRecords(records));
    }),
    wheel2310: seeds.map((seed) => {
      const records = recordsFromLabels(wheelRandomLabels(N, 2310, seed ^ 0x243f6a88));
      return scoreValues(`wheel2310-${seed}`, records.map((record) => record.u), endpointCountsForRecords(records));
    }),
  };
  return {
    N,
    endpoints,
    real,
    rawTelescope,
    controls,
    summary: Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
    holdout: {
      real: real.blocks.at(-1),
      rawTelescope: rawTelescope.blocks.at(-1),
      ...Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, holdoutSummary(runs)])),
    },
    pairSummary: {
      count: primeRecords.length,
      meanGap: mean(primeRecords.map((record) => record.gap)),
      meanLambda: mean(primeRecords.map((record) => record.lambda)),
      meanExpNegLambda: mean(primeRecords.map((record) => Math.exp(-record.lambda))),
      meanU: mean(values),
      gapRange: range(primeRecords.map((record) => record.gap)),
      lambdaRange: range(primeRecords.map((record) => record.lambda)),
    },
    namedComposites: namedCompositeChecks(),
    sampleRecords: primeRecords.slice(0, 20),
  };
}

function makeSvg(report) {
  const width = 1180;
  const height = 660;
  const margin = { left: 70, right: 320, top: 70, bottom: 78 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const realRows = report.real.rows;
  const series = [
    { id: "real Z", color: "#67e8f9", rows: realRows.map((row, i) => ({ x: i, y: row.z })) },
    { id: "real max |Z|", color: "#fbbf24", rows: realRows.map((row, i) => ({ x: i, y: row.maxAbsZ })) },
    { id: "shuffle mean max", color: "#a78bfa", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.shuffle.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "Poisson mean max", color: "#34d399", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.poissonHazard.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "W2310 mean max", color: "#fb7185", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.wheel2310.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "raw telescope Z", color: "#f97316", rows: report.rawTelescope.rows.map((row, i) => ({ x: i, y: row.z / 10 })) },
  ];
  const allY = series.flatMap((entry) => entry.rows.map((row) => row.y));
  const yMin = Math.min(-1, ...allY) * 1.08;
  const yMax = Math.max(1, ...allY) * 1.08;
  const xOf = (point) => margin.left + (point.x / Math.max(1, realRows.length - 1)) * plotW;
  const yOf = (point) => margin.top + (1 - (point.y - yMin) / (yMax - yMin)) * plotH;
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
    const points = entry.rows.map((point) => `${xOf(point).toFixed(2)},${yOf(point).toFixed(2)}`).join(" ");
    const dots = entry.rows.map((point) => `<circle cx="${xOf(point)}" cy="${yOf(point)}" r="4" fill="${entry.color}"/>`).join("");
    return `<polyline points="${points}" fill="none" stroke="${entry.color}" stroke-width="3"/>${dots}`;
  }).join("\n");
  const legend = series.map((entry, i) => {
    const x = margin.left + (i % 3) * 220;
    const y = 38 + Math.floor(i / 3) * 18;
    return `<text x="${x}" y="${y}" fill="${entry.color}" font-size="13">${entry.id}</text>`;
  }).join("\n");
  const final = report.real.rows.at(-1);
  const notes = [
    `N ${report.N}`,
    `pairs ${final.count}`,
    `real Z ${fmt(final.z)}`,
    `real max ${fmt(final.maxAbsZ)}`,
    `theta ${fmt(report.real.theta.maxAbsSum)}`,
    `mean exp(-L) ${fmt(report.pairSummary.meanExpNegLambda)}`,
    `raw telescope /10`,
  ].map((text, i) => `<text x="${width - 286}" y="${116 + i * 27}" fill="#cbd5e1" font-size="13">${text}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Palm log-hazard gap audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 38}" fill="#94a3b8" font-size="13">Score U_i=exp(-int_p^q dt/log t)-1/2 over consecutive prime gaps. Raw hazard telescope is scaled by 1/10.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  const final = report.real.rows.at(-1);
  lines.push("# Palm log-hazard gap audit", "");
  lines.push("For consecutive labels `p_i<p_{i+1}`, define `Lambda_i=int_{p_i}^{p_{i+1}} dt/log(t)` by Simpson integration and score `U_i=exp(-Lambda_i)-1/2`.", "");
  lines.push("The raw score `Lambda_i-1` is separately reported as the forbidden telescope: cumulatively it is `Li(p)-pi(p)` at prime endpoints up to endpoint constants.", "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | pairs | mean U | Z | max abs Z | energy Z | theta max sum | raw telescope Z |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < report.real.rows.length; i++) {
    const row = report.real.rows[i];
    const raw = report.rawTelescope.rows[i];
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} | ${fmt(row.energyZ)} | ${fmt(report.real.theta.maxAbsSum)} | ${fmt(raw.z)} |`);
  }
  lines.push("");
  lines.push("Pair summary:");
  lines.push("");
  lines.push(`- count: ${report.pairSummary.count}`);
  lines.push(`- mean gap: ${fmt(report.pairSummary.meanGap)}`);
  lines.push(`- mean Lambda: ${fmt(report.pairSummary.meanLambda)}`);
  lines.push(`- mean exp(-Lambda): ${fmt(report.pairSummary.meanExpNegLambda)}`);
  lines.push(`- mean U: ${fmt(report.pairSummary.meanU)}`);
  lines.push(`- gap range: ${fmt(report.pairSummary.gapRange[0], 0)}..${fmt(report.pairSummary.gapRange[1], 0)}`);
  lines.push(`- Lambda range: ${fmt(report.pairSummary.lambdaRange[0])}..${fmt(report.pairSummary.lambdaRange[1])}`);
  lines.push("");
  lines.push("## Control summary at full range", "");
  lines.push("| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const key of ["shuffle", "bootstrap", "poissonHazard", "cramerLabel", "wheel210", "wheel2310"]) {
    const summary = report.summary[key];
    lines.push(`| ${key} | ${summary.count[0]}..${summary.count[1]} | ${fmt(summary.z[0])}..${fmt(summary.z[1])} | ${fmt(summary.maxAbsZ[0])}..${fmt(summary.maxAbsZ[1])} | ${fmt(summary.energyZ[0])}..${fmt(summary.energyZ[1])} | ${fmt(summary.thetaMaxAbsSum[0])}..${fmt(summary.thetaMaxAbsSum[1])} |`);
  }
  lines.push("");
  lines.push("Final holdout block:", "");
  lines.push(`- real \`(N/2,N]\`: count ${report.holdout.real.count}, Z ${fmt(report.holdout.real.z)}.`);
  for (const key of ["shuffle", "bootstrap", "poissonHazard", "cramerLabel", "wheel210", "wheel2310"]) {
    const holdout = report.holdout[key];
    lines.push(`- ${key}: count ${holdout.count[0]}..${holdout.count[1]}, Z ${fmt(holdout.z[0])}..${fmt(holdout.z[1])}.`);
  }
  lines.push("");
  lines.push("Named composite checks:");
  lines.push("");
  lines.push("| n | prime-gap event? | reason |");
  lines.push("| ---: | --- | --- |");
  for (const row of report.namedComposites) {
    lines.push(`| ${row.n} | ${row.primeGapEvent ? "yes" : "no"} | ${row.reason} |`);
  }
  lines.push("");
  lines.push("Factor check:");
  lines.push("");
  lines.push("The nonlinear score is not the raw `Li-pi` telescope, but it is absorbed by the empirical gap-value shuffle and wheel-random controls. Its endpoint is fixed by the observed mean of `exp(-Lambda)`, so a large line here is gap-distribution bias rather than a new prime critical line.");
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

const report = audit();
fs.mkdirSync(outDir, { recursive: true });
const paths = {
  json: path.join(outDir, `palm-loghazard-gap-${N}.json`),
  md: path.join(outDir, `palm-loghazard-gap-${N}.md`),
  svg: path.join(outDir, `palm-loghazard-gap-${N}.svg`),
};
report.paths = paths;
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  endpoint: report.real.rows.at(-1),
  rawTelescopeEndpoint: report.rawTelescope.rows.at(-1),
  pairSummary: report.pairSummary,
  summary: report.summary,
  paths,
}, null, 2));
