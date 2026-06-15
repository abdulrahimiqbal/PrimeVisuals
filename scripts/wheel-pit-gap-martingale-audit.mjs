#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const mainWheel = Number(process.argv[4] || 2310);
const wheels = [2, 30, 210, 2310];
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 3 / 4, 1].map((f) => Math.round(N * f));
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
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function totient(n) {
  let m = n;
  let out = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p) continue;
    out -= out / p;
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= out / m;
  return Math.round(out);
}

const phiCache = new Map();

function phi(W) {
  if (!phiCache.has(W)) phiCache.set(W, totient(W));
  return phiCache.get(W);
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function xmlText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
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

function startForWheel(W) {
  const p = phi(W);
  return Math.max(W + 1, Math.ceil(Math.exp(W / p)) + 1, 3);
}

function hazard(n, W) {
  if (n < 3) return 0;
  if (gcd(n, W) !== 1) return 0;
  return Math.min(0.999999, W / (phi(W) * Math.log(n)));
}

function wheelRandomLabels(limit, W, seed) {
  const random = rng(seed);
  const labels = [];
  const start = startForWheel(W);
  for (let n = 3; n <= limit; n++) {
    if (n < start || gcd(n, W) !== 1) continue;
    if (random() < hazard(n, W)) labels.push(n);
  }
  return labels;
}

function recordsFromLabels(labels, limit = N) {
  const sorted = labels.filter((x) => x >= 3 && x <= limit).slice().sort((a, b) => a - b);
  const records = [];
  for (let i = 0; i + 1 < sorted.length; i++) {
    const p = sorted[i];
    const q = sorted[i + 1];
    if (q > limit) break;
    records.push({ p, q, gap: q - p });
  }
  return records;
}

function midPitForGap(record, W) {
  let survival = 1;
  for (let n = record.p + 1; n < record.q; n++) {
    survival *= 1 - hazard(n, W);
  }
  const hq = hazard(record.q, W);
  if (hq <= 0) return null;
  const beforeCdf = 1 - survival;
  const mass = survival * hq;
  return beforeCdf + 0.5 * mass - 0.5;
}

function pitValues(records, W) {
  const values = [];
  const scored = [];
  let skippedEarly = 0;
  let impossible = 0;
  const start = startForWheel(W);
  for (const record of records) {
    if (record.p < start) {
      skippedEarly++;
      continue;
    }
    const value = midPitForGap(record, W);
    if (value === null) {
      impossible++;
      continue;
    }
    values.push(value);
    scored.push({ ...record, value });
  }
  return {
    values,
    scored,
    skippedEarly,
    impossible,
    start,
    summary: {
      mean: mean(values),
      meanAbs: mean(values.map((value) => Math.abs(value))),
      range: range(values),
    },
  };
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

function signFlip(values, seed) {
  const random = rng(seed);
  return values.map((value) => (random() < 0.5 ? -value : value));
}

function centered(values) {
  const m = mean(values);
  return values.map((value) => value - m);
}

function scoreValues(name, values, records) {
  const rows = [];
  const blocks = [];
  let cursor = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsSum = 0;
  let maxAbsZ = 0;
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    const prevCursor = cursor;
    const prevSum = sum;
    while (cursor < values.length && records[cursor].p <= endpoint) {
      const value = values[cursor++];
      sum += value;
      sumSquares += value * value;
      maxAbsSum = Math.max(maxAbsSum, Math.abs(sum));
      maxAbsZ = Math.max(maxAbsZ, Math.abs(sum / Math.sqrt(Math.max(1, cursor))));
    }
    const count = cursor;
    const blockCount = cursor - prevCursor;
    const blockSum = sum - prevSum;
    rows.push({
      N: endpoint,
      count,
      sum,
      mean: sum / Math.max(1, count),
      z: sum / Math.sqrt(Math.max(1, count)),
      energyZ: sum / Math.sqrt(Math.max(1e-18, sumSquares)),
      maxAbsSum,
      maxAbsZ,
    });
    blocks.push({
      lo: i ? endpoints[i - 1] : 0,
      hi: endpoint,
      count: blockCount,
      sum: blockSum,
      z: blockSum / Math.sqrt(Math.max(1, blockCount)),
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

function processRecords(name, records, W, compact = false) {
  const pit = pitValues(records, W);
  const score = scoreValues(name, pit.values, pit.scored);
  const out = {
    name,
    W,
    recordCount: records.length,
    start: pit.start,
    skippedEarly: pit.skippedEarly,
    impossible: pit.impossible,
    scoredCount: pit.values.length,
    valueSummary: pit.summary,
    score,
  };
  if (!compact) {
    out.values = pit.values;
    out.scored = pit.scored;
  }
  return out;
}

function summarizeControls(runs) {
  const finals = runs.map((run) => run.score.rows.at(-1));
  return {
    count: range(finals.map((row) => row.count)),
    z: range(finals.map((row) => row.z)),
    absZ: range(finals.map((row) => Math.abs(row.z))),
    maxAbsZ: range(finals.map((row) => row.maxAbsZ)),
    energyZ: range(finals.map((row) => row.energyZ)),
    thetaMaxAbsSum: range(runs.map((run) => run.score.theta.maxAbsSum)),
    valueMean: range(runs.map((run) => run.valueSummary?.mean ?? 0)),
  };
}

function holdoutSummary(runs) {
  const lastBlocks = runs.map((run) => run.score.blocks.at(-1));
  return {
    count: range(lastBlocks.map((row) => row.count)),
    z: range(lastBlocks.map((row) => row.z)),
    absZ: range(lastBlocks.map((row) => Math.abs(row.z))),
  };
}

function namedCompositeChecks() {
  return [25, 35, 77, 289].map((n) => ({
    n,
    consecutivePrimeEvent: false,
    reason: "the statistic is scored on a consecutive prime/event pair x_i<x_{i+1}; this composite is not a prime event label",
  }));
}

function controlFromValues(name, score) {
  return {
    name,
    score,
    valueSummary: { mean: 0 },
  };
}

function audit() {
  console.error(`[wheel-pit-gap] primes to ${N}; main W=${mainWheel}`);
  const primeRecords = recordsFromLabels(primesUpTo(N));
  const realByWheel = Object.fromEntries(wheels.map((W) => [W, processRecords(`real-W${W}`, primeRecords, W, W !== mainWheel)]));
  const real = realByWheel[mainWheel];
  const mainValues = real.values;
  const mainRecords = real.scored;
  const zeroMean = centered(mainValues);
  const fakeByWheel = Object.fromEntries(wheels.map((W) => [
    W,
    seeds.map((seed) => processRecords(
      `wheel${W}-seed-${seed}`,
      recordsFromLabels(wheelRandomLabels(N, W, seed)),
      W,
      true,
    )),
  ]));
  const controls = {
    shuffle: seeds.map((seed) => controlFromValues(
      `pit-shuffle-${seed}`,
      scoreValues(`pit-shuffle-${seed}`, shuffle(mainValues, seed), mainRecords),
    )),
    bootstrap: seeds.map((seed) => controlFromValues(
      `pit-bootstrap-${seed}`,
      scoreValues(`pit-bootstrap-${seed}`, sampleObserved(mainValues, mainValues.length, seed ^ 0x9e3779b9), mainRecords),
    )),
    signFlip: seeds.map((seed) => controlFromValues(
      `pit-sign-flip-${seed}`,
      scoreValues(`pit-sign-flip-${seed}`, signFlip(mainValues, seed ^ 0x517cc1b7), mainRecords),
    )),
    centeredShuffle: seeds.map((seed) => controlFromValues(
      `centered-pit-shuffle-${seed}`,
      scoreValues(`centered-pit-shuffle-${seed}`, shuffle(zeroMean, seed ^ 0x94d049bb), mainRecords),
    )),
    sameWheel: fakeByWheel[mainWheel],
  };
  return {
    N,
    endpoints,
    mainWheel,
    wheels,
    real: {
      byWheel: Object.fromEntries(wheels.map((W) => {
        const run = realByWheel[W];
        return [W, {
          W,
          start: run.start,
          skippedEarly: run.skippedEarly,
          impossible: run.impossible,
          scoredCount: run.scoredCount,
          valueSummary: run.valueSummary,
          score: run.score,
        }];
      })),
    },
    controls,
    fakeByWheel,
    summary: {
      ...Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
      fakeByWheel: Object.fromEntries(wheels.map((W) => [W, summarizeControls(fakeByWheel[W])])),
    },
    holdout: {
      real: real.score.blocks.at(-1),
      ...Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, holdoutSummary(runs)])),
      fakeByWheel: Object.fromEntries(wheels.map((W) => [W, holdoutSummary(fakeByWheel[W])])),
    },
    namedComposites: namedCompositeChecks(),
    sampleScored: real.scored.slice(0, 20),
  };
}

function makeSvg(report) {
  const width = 1180;
  const height = 660;
  const margin = { left: 74, right: 330, top: 74, bottom: 82 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const realRows = report.real.byWheel[report.mainWheel].score.rows;
  const series = [
    { id: `real W${report.mainWheel} Z`, color: "#67e8f9", rows: realRows.map((row, i) => ({ x: i, y: row.z })) },
    { id: `real W${report.mainWheel} max |Z|`, color: "#fbbf24", rows: realRows.map((row, i) => ({ x: i, y: row.maxAbsZ })) },
    { id: `fake W${report.mainWheel} mean max`, color: "#fb7185", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.sameWheel.map((run) => run.score.rows[i].maxAbsZ)) })) },
    { id: "centered shuffle mean max", color: "#a78bfa", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.centeredShuffle.map((run) => run.score.rows[i].maxAbsZ)) })) },
    { id: "sign-flip mean max", color: "#34d399", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.signFlip.map((run) => run.score.rows[i].maxAbsZ)) })) },
  ];
  const allY = series.flatMap((entry) => entry.rows.map((row) => row.y));
  const yMin = Math.min(-1, ...allY) * 1.1;
  const yMax = Math.max(1, ...allY) * 1.1;
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
    const x = margin.left + (i % 2) * 290;
    const y = 38 + Math.floor(i / 2) * 18;
    return `<text x="${x}" y="${y}" fill="${entry.color}" font-size="13">${xmlText(entry.id)}</text>`;
  }).join("\n");
  const final = realRows.at(-1);
  const realMain = report.real.byWheel[report.mainWheel];
  const family = report.wheels.map((W) => {
    const row = report.real.byWheel[W].score.rows.at(-1);
    return `W${W} Z ${fmt(row.z, 2)}`;
  });
  const notes = [
    `N ${report.N}`,
    `main W ${report.mainWheel}`,
    `scored ${final.count}`,
    `real Z ${fmt(final.z)}`,
    `real max ${fmt(final.maxAbsZ)}`,
    `mean PIT ${fmt(realMain.valueSummary.mean)}`,
    ...family,
  ].map((text, i) => `<text x="${width - 300}" y="${112 + i * 24}" fill="#cbd5e1" font-size="13">${xmlText(text)}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Wheel-PIT next-event martingale audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 40}" fill="#94a3b8" font-size="13">Discrete mid-PIT under h_W(n)=W/(phi(W)log n) on reduced residue classes; no zeta or zero table.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  const main = report.real.byWheel[report.mainWheel];
  const final = main.score.rows.at(-1);
  lines.push("# Wheel-PIT next-event martingale audit", "");
  lines.push(`For each consecutive event gap, compute the discrete mid-PIT score under the local wheel model \`h_W(n)=W/(phi(W)log n)\` on \`gcd(n,W)=1\` classes. Main wheel: \`${report.mainWheel}\`.`, "");
  lines.push("## Main real endpoint trace", "");
  lines.push("| N | scored count | sum | mean | Z | max abs Z | energy Z |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of main.score.rows) {
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.sum)} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} | ${fmt(row.energyZ)} |`);
  }
  lines.push("");
  lines.push("Main PIT summary:");
  lines.push("");
  lines.push(`- start after: ${main.start}`);
  lines.push(`- scored count: ${main.scoredCount}`);
  lines.push(`- skipped early pairs: ${main.skippedEarly}`);
  lines.push(`- impossible observed next events: ${main.impossible}`);
  lines.push(`- value mean: ${fmt(main.valueSummary.mean)}`);
  lines.push(`- value mean abs: ${fmt(main.valueSummary.meanAbs)}`);
  lines.push(`- value range: ${fmt(main.valueSummary.range[0])}..${fmt(main.valueSummary.range[1])}`);
  lines.push("");
  lines.push("## Wheel family on real primes", "");
  lines.push("| W | start | scored | value mean | endpoint Z | max abs Z | theta max sum | same-W fake endpoint Z range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const W of report.wheels) {
    const run = report.real.byWheel[W];
    const row = run.score.rows.at(-1);
    const fake = report.summary.fakeByWheel[W];
    lines.push(`| ${W} | ${run.start} | ${run.scoredCount} | ${fmt(run.valueSummary.mean)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} | ${fmt(run.score.theta.maxAbsSum)} | ${fmt(fake.z[0])}..${fmt(fake.z[1])} |`);
  }
  lines.push("");
  lines.push("## Main control summary at full range", "");
  lines.push("| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range | value mean range |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const key of ["shuffle", "bootstrap", "signFlip", "centeredShuffle", "sameWheel"]) {
    const summary = report.summary[key];
    lines.push(`| ${key} | ${summary.count[0]}..${summary.count[1]} | ${fmt(summary.z[0])}..${fmt(summary.z[1])} | ${fmt(summary.maxAbsZ[0])}..${fmt(summary.maxAbsZ[1])} | ${fmt(summary.energyZ[0])}..${fmt(summary.energyZ[1])} | ${fmt(summary.thetaMaxAbsSum[0])}..${fmt(summary.thetaMaxAbsSum[1])} | ${fmt(summary.valueMean[0])}..${fmt(summary.valueMean[1])} |`);
  }
  lines.push("");
  lines.push("Final holdout block:");
  lines.push("");
  lines.push(`- real final block: count ${report.holdout.real.count}, Z ${fmt(report.holdout.real.z)}.`);
  for (const key of ["shuffle", "bootstrap", "signFlip", "centeredShuffle", "sameWheel"]) {
    const holdout = report.holdout[key];
    lines.push(`- ${key}: count ${holdout.count[0]}..${holdout.count[1]}, Z ${fmt(holdout.z[0])}..${fmt(holdout.z[1])}.`);
  }
  lines.push("");
  lines.push("Named composite checks:");
  lines.push("");
  lines.push("| n | consecutive-prime event? | reason |");
  lines.push("| ---: | --- | --- |");
  for (const row of report.namedComposites) {
    lines.push(`| ${row.n} | ${row.consecutivePrimeEvent ? "yes" : "no"} | ${row.reason} |`);
  }
  lines.push("");
  lines.push("Factor check:");
  lines.push("");
  lines.push("This is not a raw gap sum, not the `Li-pi` hazard telescope, and not a rolling empirical center. It is a discrete PIT against an explicit local next-event distribution. A survivor must beat same-wheel fake labels and residual order controls.");
  lines.push("");
  lines.push(`Break verdict at N=${report.N}: real W${report.mainWheel} endpoint Z ${fmt(final.z)}, max abs Z ${fmt(final.maxAbsZ)}.`);
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

const report = audit();
fs.mkdirSync(outDir, { recursive: true });
const paths = {
  json: path.join(outDir, `wheel-pit-gap-martingale-${N}.json`),
  md: path.join(outDir, `wheel-pit-gap-martingale-${N}.md`),
  svg: path.join(outDir, `wheel-pit-gap-martingale-${N}.svg`),
};
report.paths = paths;
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  endpoint: report.real.byWheel[report.mainWheel].score.rows.at(-1),
  mainSummary: report.real.byWheel[report.mainWheel].valueSummary,
  wheelFamily: Object.fromEntries(report.wheels.map((W) => {
    const run = report.real.byWheel[W];
    return [W, {
      endpoint: run.score.rows.at(-1),
      valueSummary: run.valueSummary,
      fakeSameWheel: report.summary.fakeByWheel[W],
    }];
  })),
  summary: report.summary,
  paths,
}, null, 2));
