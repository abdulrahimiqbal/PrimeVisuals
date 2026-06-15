#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const windowSize = Number(process.argv[4] || 8192);
const minGapWindowCount = Number(process.argv[5] || 12);
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

function variance(stats) {
  if (stats.count < 2) return 0;
  return Math.max(1e-9, stats.sumSq / stats.count - (stats.sum / stats.count) ** 2);
}

function sd(stats) {
  return Math.sqrt(variance(stats));
}

function addStat(stats, value) {
  stats.count++;
  stats.sum += value;
  stats.sumSq += value * value;
}

function removeStat(stats, value) {
  stats.count--;
  stats.sum -= value;
  stats.sumSq -= value * value;
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

function rollingValues(records, options = {}) {
  const K = options.windowSize ?? windowSize;
  const minCount = options.minGapWindowCount ?? minGapWindowCount;
  const queue = [];
  const byGap = new Map();
  const global = { count: 0, sum: 0, sumSq: 0 };
  const values = [];
  const scored = [];
  let gapScopedCount = 0;
  let fallbackCount = 0;
  let minSd = Infinity;
  let maxSd = 0;
  const gapHistogram = new Map();

  const pushRecord = (record) => {
    queue.push(record);
    addStat(global, record.u);
    let bucket = byGap.get(record.gap);
    if (!bucket) {
      bucket = { count: 0, sum: 0, sumSq: 0 };
      byGap.set(record.gap, bucket);
    }
    addStat(bucket, record.u);
    while (queue.length > K) {
      const old = queue.shift();
      removeStat(global, old.u);
      const oldBucket = byGap.get(old.gap);
      removeStat(oldBucket, old.u);
      if (oldBucket.count === 0) byGap.delete(old.gap);
    }
  };

  for (const record of records) {
    if (queue.length >= K) {
      const bucket = byGap.get(record.gap);
      const useGap = bucket && bucket.count >= minCount;
      const stats = useGap ? bucket : global;
      const center = stats.sum / Math.max(1, stats.count);
      const localSd = Math.max(1e-9, sd(stats));
      const r = (record.u - center) / localSd;
      values.push(r);
      scored.push({
        ...record,
        r,
        center,
        sd: localSd,
        mode: useGap ? "gap" : "window",
        gapWindowCount: bucket?.count ?? 0,
      });
      if (useGap) {
        gapScopedCount++;
        gapHistogram.set(record.gap, (gapHistogram.get(record.gap) ?? 0) + 1);
      } else {
        fallbackCount++;
      }
      minSd = Math.min(minSd, localSd);
      maxSd = Math.max(maxSd, localSd);
    }
    pushRecord(record);
  }

  return {
    values,
    scored,
    windowSize: K,
    minGapWindowCount: minCount,
    burnInRecords: Math.min(K, records.length),
    gapScopedCount,
    fallbackCount,
    distinctGapScoped: gapHistogram.size,
    sdRange: [minSd === Infinity ? 0 : minSd, maxSd],
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

function centerGlobal(values) {
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

function processRecords(name, records, options = {}) {
  const rolling = rollingValues(records, options);
  return {
    name,
    labelCount: records.length + 1,
    recordCount: records.length,
    rolling: {
      windowSize: rolling.windowSize,
      minGapWindowCount: rolling.minGapWindowCount,
      burnInRecords: rolling.burnInRecords,
      scoredCount: rolling.values.length,
      gapScopedCount: rolling.gapScopedCount,
      fallbackCount: rolling.fallbackCount,
      distinctGapScoped: rolling.distinctGapScoped,
      sdRange: rolling.sdRange,
      residualSummary: {
        mean: mean(rolling.values),
        meanAbs: mean(rolling.values.map((value) => Math.abs(value))),
        range: range(rolling.values),
      },
    },
    score: scoreValues(name, rolling.values, rolling.scored),
    values: rolling.values,
    scored: rolling.scored,
  };
}

function processLabels(name, labels, compact = false, options = {}) {
  const records = recordsFromLabels(labels);
  const processed = processRecords(name, records, options);
  const out = {
    name,
    labelCount: labels.length,
    recordCount: processed.recordCount,
    rolling: processed.rolling,
    score: processed.score,
  };
  if (!compact) {
    out.values = processed.values;
    out.scored = processed.scored;
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
    residualMean: range(runs.map((run) => run.rolling?.residualSummary?.mean ?? 0)),
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
    reason: "the statistic is indexed by a consecutive-prime left endpoint x_i; this composite is not an event label",
  }));
}

function compactControl(name, score) {
  return { name, score };
}

function windowVariantSummary(records, sizes) {
  return sizes.map((K) => {
    const run = processRecords(`real-K${K}`, records, {
      windowSize: K,
      minGapWindowCount,
    });
    const final = run.score.rows.at(-1);
    return {
      windowSize: K,
      scoredCount: run.rolling.scoredCount,
      gapScopedCount: run.rolling.gapScopedCount,
      fallbackCount: run.rolling.fallbackCount,
      residualMean: run.rolling.residualSummary.mean,
      endpointZ: final.z,
      maxAbsZ: final.maxAbsZ,
      thetaMaxAbsSum: run.score.theta.maxAbsSum,
    };
  });
}

function audit() {
  console.error(`[palm-rolling-local] primes to ${N}; K=${windowSize}; minGap=${minGapWindowCount}`);
  const realRecords = recordsFromLabels(primesUpTo(N));
  const real = processRecords("real primes", realRecords, { windowSize, minGapWindowCount });
  const values = real.values;
  const records = real.scored;
  const zeroMeanValues = centerGlobal(values);
  const maxCount = values.length;
  const controls = {
    shuffle: seeds.map((seed) => compactControl(
      `residual-shuffle-${seed}`,
      scoreValues(`residual-shuffle-${seed}`, shuffle(values, seed), records),
    )),
    bootstrap: seeds.map((seed) => compactControl(
      `residual-bootstrap-${seed}`,
      scoreValues(`residual-bootstrap-${seed}`, sampleObserved(values, maxCount, seed ^ 0x9e3779b9), records),
    )),
    signFlip: seeds.map((seed) => compactControl(
      `residual-sign-flip-${seed}`,
      scoreValues(`residual-sign-flip-${seed}`, signFlip(values, seed ^ 0x517cc1b7), records),
    )),
    centeredShuffle: seeds.map((seed) => compactControl(
      `centered-residual-shuffle-${seed}`,
      scoreValues(`centered-residual-shuffle-${seed}`, shuffle(zeroMeanValues, seed ^ 0x94d049bb), records),
    )),
    cramerLabel: seeds.map((seed) => processLabels(`cramer-label-${seed}`, cramerPrimes(N, seed), true, { windowSize, minGapWindowCount })),
    wheel210: seeds.map((seed) => processLabels(`wheel210-${seed}`, wheelRandomLabels(N, 210, seed ^ 0xbb67ae85), true, { windowSize, minGapWindowCount })),
    wheel2310: seeds.map((seed) => processLabels(`wheel2310-${seed}`, wheelRandomLabels(N, 2310, seed ^ 0x243f6a88), true, { windowSize, minGapWindowCount })),
  };
  const realCompact = {
    name: real.name,
    labelCount: realRecords.length + 1,
    recordCount: real.recordCount,
    rolling: real.rolling,
    score: real.score,
  };
  return {
    N,
    endpoints,
    options: {
      windowSize,
      minGapWindowCount,
    },
    real: realCompact,
    controls,
    summary: Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
    holdout: {
      real: real.score.blocks.at(-1),
      ...Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, holdoutSummary(runs)])),
    },
    windowVariants: windowVariantSummary(realRecords, [4096, 8192, 16384].filter((K) => K <= realRecords.length / 3)),
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
  const realRows = report.real.score.rows;
  const series = [
    { id: "real Z", color: "#67e8f9", rows: realRows.map((row, i) => ({ x: i, y: row.z })) },
    { id: "real max |Z|", color: "#fbbf24", rows: realRows.map((row, i) => ({ x: i, y: row.maxAbsZ })) },
    { id: "centered shuffle mean max", color: "#a78bfa", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.centeredShuffle.map((run) => run.score.rows[i].maxAbsZ)) })) },
    { id: "sign-flip mean max", color: "#34d399", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.signFlip.map((run) => run.score.rows[i].maxAbsZ)) })) },
    { id: "W2310 mean max", color: "#fb7185", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.wheel2310.map((run) => run.score.rows[i].maxAbsZ)) })) },
    { id: "Cramer mean max", color: "#f97316", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.cramerLabel.map((run) => run.score.rows[i].maxAbsZ)) })) },
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
    const x = margin.left + (i % 3) * 230;
    const y = 38 + Math.floor(i / 3) * 18;
    return `<text x="${x}" y="${y}" fill="${entry.color}" font-size="13">${xmlText(entry.id)}</text>`;
  }).join("\n");
  const final = realRows.at(-1);
  const rolling = report.real.rolling;
  const notes = [
    `N ${report.N}`,
    `K ${report.options.windowSize}`,
    `min gap count ${report.options.minGapWindowCount}`,
    `scored ${final.count}`,
    `real Z ${fmt(final.z)}`,
    `real max ${fmt(final.maxAbsZ)}`,
    `residual mean ${fmt(rolling.residualSummary.mean)}`,
    `gap/window ${rolling.gapScopedCount}/${rolling.fallbackCount}`,
  ].map((text, i) => `<text x="${width - 300}" y="${116 + i * 27}" fill="#cbd5e1" font-size="13">${xmlText(text)}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Rolling local Palm gap-law residual audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 40}" fill="#94a3b8" font-size="13">Past-only rolling null: score U_i=exp(-Lambda_i)-1/2 against the previous K event gaps; current point is never in its own fit.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  const final = report.real.score.rows.at(-1);
  lines.push("# Rolling local Palm gap-law residual audit", "");
  lines.push(`For each event gap, score \`U_i=exp(-int dt/log(t))-1/2\` against only the previous \`${report.options.windowSize}\` event gaps. If the current gap width has at least \`${report.options.minGapWindowCount}\` previous samples in the window, use that bucket mean/sd; otherwise use the whole previous window.`, "");
  lines.push("## Real endpoint trace", "");
  lines.push("| N | scored count | sum | mean | Z | max abs Z | energy Z |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.real.score.rows) {
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.sum)} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} | ${fmt(row.energyZ)} |`);
  }
  lines.push("");
  lines.push("Rolling-null summary:");
  lines.push("");
  lines.push(`- record count before burn-in: ${report.real.recordCount}`);
  lines.push(`- scored count: ${report.real.rolling.scoredCount}`);
  lines.push(`- burn-in records: ${report.real.rolling.burnInRecords}`);
  lines.push(`- gap-scoped scores: ${report.real.rolling.gapScopedCount}`);
  lines.push(`- window-fallback scores: ${report.real.rolling.fallbackCount}`);
  lines.push(`- distinct gap-scoped widths: ${report.real.rolling.distinctGapScoped}`);
  lines.push(`- residual mean: ${fmt(report.real.rolling.residualSummary.mean)}`);
  lines.push(`- residual mean abs: ${fmt(report.real.rolling.residualSummary.meanAbs)}`);
  lines.push(`- residual range: ${fmt(report.real.rolling.residualSummary.range[0])}..${fmt(report.real.rolling.residualSummary.range[1])}`);
  lines.push(`- local sd range: ${fmt(report.real.rolling.sdRange[0])}..${fmt(report.real.rolling.sdRange[1])}`);
  lines.push("");
  lines.push("## Control summary at full range", "");
  lines.push("| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range | residual mean range |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const key of ["shuffle", "bootstrap", "signFlip", "centeredShuffle", "cramerLabel", "wheel210", "wheel2310"]) {
    const summary = report.summary[key];
    lines.push(`| ${key} | ${summary.count[0]}..${summary.count[1]} | ${fmt(summary.z[0])}..${fmt(summary.z[1])} | ${fmt(summary.maxAbsZ[0])}..${fmt(summary.maxAbsZ[1])} | ${fmt(summary.energyZ[0])}..${fmt(summary.energyZ[1])} | ${fmt(summary.thetaMaxAbsSum[0])}..${fmt(summary.thetaMaxAbsSum[1])} | ${fmt(summary.residualMean[0])}..${fmt(summary.residualMean[1])} |`);
  }
  lines.push("");
  lines.push("Final holdout block:");
  lines.push("");
  lines.push(`- real final block: count ${report.holdout.real.count}, Z ${fmt(report.holdout.real.z)}.`);
  for (const key of ["shuffle", "bootstrap", "signFlip", "centeredShuffle", "cramerLabel", "wheel210", "wheel2310"]) {
    const holdout = report.holdout[key];
    lines.push(`- ${key}: count ${holdout.count[0]}..${holdout.count[1]}, Z ${fmt(holdout.z[0])}..${fmt(holdout.z[1])}.`);
  }
  lines.push("");
  lines.push("Window-size stability:");
  lines.push("");
  lines.push("| K | scored | gap-scoped | fallback | residual mean | endpoint Z | max abs Z | theta max sum |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.windowVariants) {
    lines.push(`| ${row.windowSize} | ${row.scoredCount} | ${row.gapScopedCount} | ${row.fallbackCount} | ${fmt(row.residualMean)} | ${fmt(row.endpointZ)} | ${fmt(row.maxAbsZ)} | ${fmt(row.thetaMaxAbsSum)} |`);
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
  lines.push("The raw hazard telescope is not used, and the one-point Palm gap distribution is centered by a rolling past-only null. Any survivor must therefore beat residual order controls and the same rolling protocol on fake event labels.");
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
  json: path.join(outDir, `palm-rolling-local-${N}.json`),
  md: path.join(outDir, `palm-rolling-local-${N}.md`),
  svg: path.join(outDir, `palm-rolling-local-${N}.svg`),
};
report.paths = paths;
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  endpoint: report.real.score.rows.at(-1),
  rolling: report.real.rolling,
  summary: report.summary,
  windowVariants: report.windowVariants,
  paths,
}, null, 2));
