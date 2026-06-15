#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const trainCut = Math.floor(N / 2);
const endpoints = [9 / 16, 5 / 8, 3 / 4, 7 / 8, 1].map((f) => Math.round(N * f));
const seeds = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 1013904223, 2654435761, 11235813, 14142135,
];
const minGapTrainCount = 10;

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

function fitGapNull(records) {
  const byGap = new Map();
  let globalN = 0;
  let globalSum = 0;
  let globalSumSq = 0;
  for (const record of records) {
    if (record.p > trainCut) continue;
    let bucket = byGap.get(record.gap);
    if (!bucket) {
      bucket = { count: 0, sum: 0, sumSq: 0 };
      byGap.set(record.gap, bucket);
    }
    bucket.count++;
    bucket.sum += record.u;
    bucket.sumSq += record.u * record.u;
    globalN++;
    globalSum += record.u;
    globalSumSq += record.u * record.u;
  }
  const globalMean = globalSum / Math.max(1, globalN);
  const globalVariance = Math.max(1e-9, globalSumSq / Math.max(1, globalN) - globalMean * globalMean);
  const gaps = new Map();
  let usableGaps = 0;
  for (const [gap, bucket] of byGap.entries()) {
    const localMean = bucket.sum / bucket.count;
    const localVariance = Math.max(1e-9, bucket.sumSq / bucket.count - localMean * localMean);
    const usable = bucket.count >= minGapTrainCount;
    if (usable) usableGaps++;
    gaps.set(gap, {
      gap,
      count: bucket.count,
      mean: usable ? localMean : globalMean,
      variance: usable ? localVariance : globalVariance,
      sd: Math.sqrt(usable ? localVariance : globalVariance),
      usable,
    });
  }
  return {
    trainCount: globalN,
    globalMean,
    globalVariance,
    globalSd: Math.sqrt(globalVariance),
    gapCount: byGap.size,
    usableGaps,
    gaps,
  };
}

function centeredValues(records, fit) {
  const values = [];
  const scored = [];
  let fallbackCount = 0;
  for (const record of records) {
    if (record.p <= trainCut) continue;
    const gapFit = fit.gaps.get(record.gap);
    const center = gapFit?.mean ?? fit.globalMean;
    const sd = gapFit?.sd ?? fit.globalSd;
    if (!gapFit || !gapFit.usable) fallbackCount++;
    const r = (record.u - center) / Math.max(1e-9, sd);
    values.push(r);
    scored.push({ ...record, r, center, sd, fallback: !gapFit || !gapFit.usable });
  }
  return { values, scored, fallbackCount };
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
      lo: i ? endpoints[i - 1] : trainCut,
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

function processLabels(name, labels, compact = false) {
  const records = recordsFromLabels(labels);
  const fit = fitGapNull(records);
  const centered = centeredValues(records, fit);
  const score = scoreValues(name, centered.values, centered.scored);
  const out = {
    name,
    fit: {
      trainCount: fit.trainCount,
      globalMean: fit.globalMean,
      globalSd: fit.globalSd,
      gapCount: fit.gapCount,
      usableGaps: fit.usableGaps,
    },
    fallbackCount: centered.fallbackCount,
    testCount: centered.values.length,
    score,
  };
  if (!compact) {
    out.records = records;
    out.centered = centered;
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
    primeGapEvent: false,
    reason: "the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label",
  }));
}

function audit() {
  console.error(`[palm-gaplaw-centered] primes to ${N}`);
  const real = processLabels("real primes", primesUpTo(N));
  const values = real.centered.values;
  const records = real.centered.scored;
  const maxCount = values.length;
  const controls = {
    shuffle: seeds.map((seed) => ({
      name: `residual-shuffle-${seed}`,
      score: scoreValues(`residual-shuffle-${seed}`, shuffle(values, seed), records),
    })),
    bootstrap: seeds.map((seed) => ({
      name: `residual-bootstrap-${seed}`,
      score: scoreValues(`residual-bootstrap-${seed}`, sampleObserved(values, maxCount, seed ^ 0x9e3779b9), records),
    })),
    signFlip: seeds.map((seed) => ({
      name: `residual-sign-flip-${seed}`,
      score: scoreValues(`residual-sign-flip-${seed}`, signFlip(values, seed ^ 0x517cc1b7), records),
    })),
    cramerLabel: seeds.map((seed) => processLabels(`cramer-label-${seed}`, cramerPrimes(N, seed), true)),
    wheel210: seeds.map((seed) => processLabels(`wheel210-${seed}`, wheelRandomLabels(N, 210, seed ^ 0xbb67ae85), true)),
    wheel2310: seeds.map((seed) => processLabels(`wheel2310-${seed}`, wheelRandomLabels(N, 2310, seed ^ 0x243f6a88), true)),
  };
  return {
    N,
    trainCut,
    endpoints,
    real: {
      score: real.score,
      fit: real.fit,
      fallbackCount: real.centered.fallbackCount,
      testCount: real.centered.values.length,
      residualSummary: {
        mean: mean(real.centered.values),
        meanAbs: mean(real.centered.values.map((value) => Math.abs(value))),
        range: range(real.centered.values),
      },
    },
    controls,
    summary: Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
    holdout: {
      real: real.score.blocks.at(-1),
      ...Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, holdoutSummary(runs)])),
    },
    namedComposites: namedCompositeChecks(),
    sampleScored: real.centered.scored.slice(0, 20),
  };
}

function makeSvg(report) {
  const width = 1180;
  const height = 660;
  const margin = { left: 70, right: 320, top: 70, bottom: 78 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const realRows = report.real.score.rows;
  const series = [
    { id: "real Z", color: "#67e8f9", rows: realRows.map((row, i) => ({ x: i, y: row.z })) },
    { id: "real max |Z|", color: "#fbbf24", rows: realRows.map((row, i) => ({ x: i, y: row.maxAbsZ })) },
    { id: "shuffle mean max", color: "#a78bfa", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.shuffle.map((run) => run.score.rows[i].maxAbsZ)) })) },
    { id: "sign-flip mean max", color: "#34d399", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.signFlip.map((run) => run.score.rows[i].maxAbsZ)) })) },
    { id: "W2310 mean max", color: "#fb7185", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.wheel2310.map((run) => run.score.rows[i].maxAbsZ)) })) },
    { id: "Cramer mean max", color: "#f97316", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.cramerLabel.map((run) => run.score.rows[i].maxAbsZ)) })) },
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
    return `<text x="${x}" y="${y}" fill="${entry.color}" font-size="13">${xmlText(entry.id)}</text>`;
  }).join("\n");
  const final = realRows.at(-1);
  const notes = [
    `N ${report.N}`,
    `train <= ${report.trainCut}`,
    `test ${final.count}`,
    `real Z ${fmt(final.z)}`,
    `real max ${fmt(final.maxAbsZ)}`,
    `fallback ${report.real.fallbackCount}`,
    `gap means ${report.real.fit.usableGaps}/${report.real.fit.gapCount}`,
  ].map((text, i) => `<text x="${width - 286}" y="${116 + i * 27}" fill="#cbd5e1" font-size="13">${xmlText(text)}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Cross-fitted Palm gap-law residual audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 38}" fill="#94a3b8" font-size="13">Train gap-width means on p&lt;=N/2; score standardized U_i=exp(-Lambda_i)-1/2 residuals on the second half.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  const final = report.real.score.rows.at(-1);
  lines.push("# Cross-fitted Palm gap-law residual audit", "");
  lines.push("Train on records with `p_i<=N/2`: for each gap width `g`, estimate the mean and variance of `U_i=exp(-int dt/log(t))-1/2`. Score only second-half records by `(U_i-m_g)/s_g`; rare/unseen gaps use the global train mean and variance.", "");
  lines.push("## Real endpoint trace", "");
  lines.push("| N | test count | sum | mean | Z | max abs Z | energy Z |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.real.score.rows) {
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.sum)} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} | ${fmt(row.energyZ)} |`);
  }
  lines.push("");
  lines.push("Fit summary:");
  lines.push("");
  lines.push(`- train count: ${report.real.fit.trainCount}`);
  lines.push(`- test count: ${report.real.testCount}`);
  lines.push(`- global train mean: ${fmt(report.real.fit.globalMean)}`);
  lines.push(`- global train sd: ${fmt(report.real.fit.globalSd)}`);
  lines.push(`- usable gap means: ${report.real.fit.usableGaps}/${report.real.fit.gapCount}`);
  lines.push(`- fallback test records: ${report.real.fallbackCount}`);
  lines.push(`- residual mean: ${fmt(report.real.residualSummary.mean)}`);
  lines.push(`- residual mean abs: ${fmt(report.real.residualSummary.meanAbs)}`);
  lines.push(`- residual range: ${fmt(report.real.residualSummary.range[0])}..${fmt(report.real.residualSummary.range[1])}`);
  lines.push("");
  lines.push("## Control summary at full range", "");
  lines.push("| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const key of ["shuffle", "bootstrap", "signFlip", "cramerLabel", "wheel210", "wheel2310"]) {
    const summary = report.summary[key];
    lines.push(`| ${key} | ${summary.count[0]}..${summary.count[1]} | ${fmt(summary.z[0])}..${fmt(summary.z[1])} | ${fmt(summary.maxAbsZ[0])}..${fmt(summary.maxAbsZ[1])} | ${fmt(summary.energyZ[0])}..${fmt(summary.energyZ[1])} | ${fmt(summary.thetaMaxAbsSum[0])}..${fmt(summary.thetaMaxAbsSum[1])} |`);
  }
  lines.push("");
  lines.push("Final holdout block:");
  lines.push("");
  lines.push(`- real \`(7N/8,N]\`: count ${report.holdout.real.count}, Z ${fmt(report.holdout.real.z)}.`);
  for (const key of ["shuffle", "bootstrap", "signFlip", "cramerLabel", "wheel210", "wheel2310"]) {
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
  lines.push("The raw Cycle 84 one-point Palm gap bias is removed by first-half gap-width centering. Any remaining line must be judged against residual shuffles/sign flips and against Cramer/Wheel labels processed with the same train/test protocol.");
  lines.push("");
  lines.push(`Break verdict at N=${report.N}: real endpoint Z ${fmt(final.z)}, max abs Z ${fmt(final.maxAbsZ)}.`);
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

const report = audit();
fs.mkdirSync(outDir, { recursive: true });
const paths = {
  json: path.join(outDir, `palm-gaplaw-centered-${N}.json`),
  md: path.join(outDir, `palm-gaplaw-centered-${N}.md`),
  svg: path.join(outDir, `palm-gaplaw-centered-${N}.svg`),
};
report.paths = paths;
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  endpoint: report.real.score.rows.at(-1),
  fit: report.real.fit,
  fallbackCount: report.real.fallbackCount,
  residualSummary: report.real.residualSummary,
  summary: report.summary,
  paths,
}, null, 2));
