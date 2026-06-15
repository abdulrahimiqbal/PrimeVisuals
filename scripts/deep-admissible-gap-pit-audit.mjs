#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const mainCutoff = Number(process.argv[4] || 97);
const startAfter = Number(process.argv[5] || 100_000);
const cutoffs = [2, 5, 11, 29, 97];
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

function admissibleData(limit, cutoff) {
  const small = primesUpTo(cutoff);
  const flags = new Uint8Array(limit + 1);
  flags.fill(1);
  flags[0] = 0;
  flags[1] = 0;
  for (const p of small) {
    for (let n = p; n <= limit; n += p) flags[n] = 0;
  }
  let rho = 1;
  for (const p of small) rho *= p / (p - 1);
  return { cutoff, small, flags, rho };
}

function hazard(q, data) {
  if (q < 3 || !data.flags[q]) return 0;
  return Math.min(0.999999, data.rho / Math.log(q));
}

function admissibleRandomLabels(limit, data, seed) {
  const random = rng(seed);
  const labels = [];
  for (let n = startAfter + 1; n <= limit; n++) {
    const h = hazard(n, data);
    if (h > 0 && random() < h) labels.push(n);
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

function midPitForGap(record, data) {
  let survival = 1;
  for (let n = record.p + 1; n < record.q; n++) {
    survival *= 1 - hazard(n, data);
  }
  const hq = hazard(record.q, data);
  if (hq <= 0) return null;
  const beforeCdf = 1 - survival;
  const mass = survival * hq;
  return beforeCdf + 0.5 * mass - 0.5;
}

function pitValues(records, data) {
  const values = [];
  const scored = [];
  let skippedEarly = 0;
  let impossible = 0;
  for (const record of records) {
    if (record.p <= startAfter) {
      skippedEarly++;
      continue;
    }
    const value = midPitForGap(record, data);
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

function processRecords(name, records, data, compact = false) {
  const pit = pitValues(records, data);
  const score = scoreValues(name, pit.values, pit.scored);
  const out = {
    name,
    cutoff: data.cutoff,
    rho: data.rho,
    smallPrimeCount: data.small.length,
    recordCount: records.length,
    startAfter,
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
    reason: "the statistic is scored on a consecutive prime/event pair p_i<p_{i+1}; this composite is not a prime event label",
  }));
}

function controlFromValues(name, score) {
  return { name, score, valueSummary: { mean: 0 } };
}

function audit() {
  console.error(`[deep-admissible-gap-pit] primes to ${N}; main B=${mainCutoff}; start>${startAfter}`);
  const dataByCutoff = Object.fromEntries(cutoffs.map((B) => [B, admissibleData(N, B)]));
  const primeRecords = recordsFromLabels(primesUpTo(N));
  const realByCutoff = Object.fromEntries(cutoffs.map((B) => [
    B,
    processRecords(`real-B${B}`, primeRecords, dataByCutoff[B], B !== mainCutoff),
  ]));
  const main = realByCutoff[mainCutoff];
  const mainValues = main.values;
  const mainRecords = main.scored;
  const zeroMean = centered(mainValues);
  const fakeByCutoff = Object.fromEntries(cutoffs.map((B) => [
    B,
    seeds.map((seed) => processRecords(
      `admissible-B${B}-seed-${seed}`,
      recordsFromLabels(admissibleRandomLabels(N, dataByCutoff[B], seed)),
      dataByCutoff[B],
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
    sameCutoff: fakeByCutoff[mainCutoff],
  };
  return {
    N,
    endpoints,
    startAfter,
    mainCutoff,
    cutoffs,
    real: {
      byCutoff: Object.fromEntries(cutoffs.map((B) => {
        const run = realByCutoff[B];
        return [B, {
          cutoff: B,
          rho: run.rho,
          smallPrimeCount: run.smallPrimeCount,
          skippedEarly: run.skippedEarly,
          impossible: run.impossible,
          scoredCount: run.scoredCount,
          valueSummary: run.valueSummary,
          score: run.score,
        }];
      })),
    },
    controls,
    fakeByCutoff,
    summary: {
      ...Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
      fakeByCutoff: Object.fromEntries(cutoffs.map((B) => [B, summarizeControls(fakeByCutoff[B])])),
    },
    holdout: {
      real: main.score.blocks.at(-1),
      ...Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, holdoutSummary(runs)])),
      fakeByCutoff: Object.fromEntries(cutoffs.map((B) => [B, holdoutSummary(fakeByCutoff[B])])),
    },
    namedComposites: namedCompositeChecks(),
    sampleScored: main.scored.slice(0, 20),
  };
}

function makeSvg(report) {
  const width = 1180;
  const height = 660;
  const margin = { left: 74, right: 330, top: 74, bottom: 82 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const realRows = report.real.byCutoff[report.mainCutoff].score.rows;
  const series = [
    { id: `real B${report.mainCutoff} Z`, color: "#67e8f9", rows: realRows.map((row, i) => ({ x: i, y: row.z })) },
    { id: `real B${report.mainCutoff} max |Z|`, color: "#fbbf24", rows: realRows.map((row, i) => ({ x: i, y: row.maxAbsZ })) },
    { id: `fake B${report.mainCutoff} mean max`, color: "#fb7185", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.sameCutoff.map((run) => run.score.rows[i].maxAbsZ)) })) },
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
    const x = margin.left + (i % 2) * 300;
    const y = 38 + Math.floor(i / 2) * 18;
    return `<text x="${x}" y="${y}" fill="${entry.color}" font-size="13">${xmlText(entry.id)}</text>`;
  }).join("\n");
  const final = realRows.at(-1);
  const main = report.real.byCutoff[report.mainCutoff];
  const family = report.cutoffs.map((B) => {
    const row = report.real.byCutoff[B].score.rows.at(-1);
    return `B${B} Z ${fmt(row.z, 2)}`;
  });
  const notes = [
    `N ${report.N}`,
    `start > ${report.startAfter}`,
    `main B ${report.mainCutoff}`,
    `rho ${fmt(main.rho, 3)}`,
    `scored ${final.count}`,
    `real Z ${fmt(final.z)}`,
    `mean PIT ${fmt(main.valueSummary.mean)}`,
    ...family,
  ].map((text, i) => `<text x="${width - 300}" y="${108 + i * 23}" fill="#cbd5e1" font-size="13">${xmlText(text)}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Deep-admissible next-gap PIT audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 40}" fill="#94a3b8" font-size="13">${xmlText("Hazard h_B(n)=1_{n has no prime factor <=B} rho_B/log n; discrete mid-PIT over the next-event survival distribution.")}</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  const main = report.real.byCutoff[report.mainCutoff];
  const final = main.score.rows.at(-1);
  lines.push("# Deep-admissible next-gap PIT audit", "");
  lines.push(`For each consecutive event gap after \`${report.startAfter}\`, compute the discrete mid-PIT score under \`h_B(n)=A_B(n)*rho_B/log(n)\`, where \`A_B(n)=1\` when \`n\` has no prime divisor \`<=B\`. Main cutoff: \`${report.mainCutoff}\`.`, "");
  lines.push("## Main real endpoint trace", "");
  lines.push("| N | scored count | sum | mean | Z | max abs Z | energy Z |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of main.score.rows) {
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.sum)} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} | ${fmt(row.energyZ)} |`);
  }
  lines.push("");
  lines.push("Main PIT summary:");
  lines.push("");
  lines.push(`- start after: ${report.startAfter}`);
  lines.push(`- rho_B: ${fmt(main.rho)}`);
  lines.push(`- small prime count: ${main.smallPrimeCount}`);
  lines.push(`- scored count: ${main.scoredCount}`);
  lines.push(`- skipped early pairs: ${main.skippedEarly}`);
  lines.push(`- impossible observed next events: ${main.impossible}`);
  lines.push(`- value mean: ${fmt(main.valueSummary.mean)}`);
  lines.push(`- value mean abs: ${fmt(main.valueSummary.meanAbs)}`);
  lines.push(`- value range: ${fmt(main.valueSummary.range[0])}..${fmt(main.valueSummary.range[1])}`);
  lines.push("");
  lines.push("## Cutoff family on real primes", "");
  lines.push("| B | rho_B | scored | value mean | endpoint Z | max abs Z | theta max sum | same-B fake endpoint Z range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const B of report.cutoffs) {
    const run = report.real.byCutoff[B];
    const row = run.score.rows.at(-1);
    const fake = report.summary.fakeByCutoff[B];
    lines.push(`| ${B} | ${fmt(run.rho)} | ${run.scoredCount} | ${fmt(run.valueSummary.mean)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} | ${fmt(run.score.theta.maxAbsSum)} | ${fmt(fake.z[0])}..${fmt(fake.z[1])} |`);
  }
  lines.push("");
  lines.push("## Main control summary at full range", "");
  lines.push("| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range | value mean range |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const key of ["shuffle", "bootstrap", "signFlip", "centeredShuffle", "sameCutoff"]) {
    const summary = report.summary[key];
    lines.push(`| ${key} | ${summary.count[0]}..${summary.count[1]} | ${fmt(summary.z[0])}..${fmt(summary.z[1])} | ${fmt(summary.maxAbsZ[0])}..${fmt(summary.maxAbsZ[1])} | ${fmt(summary.energyZ[0])}..${fmt(summary.energyZ[1])} | ${fmt(summary.thetaMaxAbsSum[0])}..${fmt(summary.thetaMaxAbsSum[1])} | ${fmt(summary.valueMean[0])}..${fmt(summary.valueMean[1])} |`);
  }
  lines.push("");
  lines.push("Final holdout block:");
  lines.push("");
  lines.push(`- real final block: count ${report.holdout.real.count}, Z ${fmt(report.holdout.real.z)}.`);
  for (const key of ["shuffle", "bootstrap", "signFlip", "centeredShuffle", "sameCutoff"]) {
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
  lines.push("This is not a raw gap sum, not the `Li-pi` hazard telescope, and not a rolling empirical center. It is an explicit finite-admissibility survival distribution. A survivor must beat same-cutoff fake labels and residual order controls.");
  lines.push("");
  lines.push(`Break verdict at N=${report.N}: real B${report.mainCutoff} endpoint Z ${fmt(final.z)}, max abs Z ${fmt(final.maxAbsZ)}.`);
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

const report = audit();
fs.mkdirSync(outDir, { recursive: true });
const paths = {
  json: path.join(outDir, `deep-admissible-gap-pit-${N}.json`),
  md: path.join(outDir, `deep-admissible-gap-pit-${N}.md`),
  svg: path.join(outDir, `deep-admissible-gap-pit-${N}.svg`),
};
report.paths = paths;
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  endpoint: report.real.byCutoff[report.mainCutoff].score.rows.at(-1),
  mainSummary: report.real.byCutoff[report.mainCutoff].valueSummary,
  cutoffFamily: Object.fromEntries(report.cutoffs.map((B) => {
    const run = report.real.byCutoff[B];
    return [B, {
      rho: run.rho,
      endpoint: run.score.rows.at(-1),
      valueSummary: run.valueSummary,
      fakeSameCutoff: report.summary.fakeByCutoff[B],
    }];
  })),
  summary: report.summary,
  paths,
}, null, 2));
