#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 50_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(100, Math.round(x)));
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

function mod(value, p) {
  const r = value % p;
  return r < 0 ? r + p : r;
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  return values.length ? [Math.min(...values), Math.max(...values)] : [0, 0];
}

function quadraticCharacterTable(p) {
  const chi = new Int8Array(p);
  chi.fill(-1);
  chi[0] = 0;
  for (let y = 1; y <= (p - 1) >> 1; y++) chi[(y * y) % p] = 1;
  return chi;
}

function traceForParameter(p, a, chi = quadraticCharacterTable(p)) {
  const ar = mod(a, p);
  let characterSum = 0;
  for (let x = 0; x < p; x++) {
    const x2 = (x * x) % p;
    const x3 = (x2 * x) % p;
    characterSum += chi[(x3 + ar * x + 1) % p];
  }
  return -characterSum;
}

function fieldCorrections(p, chi) {
  const singular = [];
  let fixedCurveCharacterSum = 0;
  let overlapRoots = 0;
  for (let t = 0; t < p; t++) {
    const t2 = (t * t) % p;
    const t3 = (t2 * t) % p;
    fixedCurveCharacterSum += chi[mod(t3 - 4, p)];
    if (mod(4 * t3 + 27, p) === 0) singular.push(t);
    if (t > 0 && mod(2 * t3 - 1, p) === 0) overlapRoots++;
  }
  const fixedCurveTrace = -fixedCurveCharacterSum;
  const chiMinusOne = chi[mod(-1, p)];
  const curveSum = -fixedCurveTrace - chiMinusOne;
  return { singular, fixedCurveTrace, chiMinusOne, curveSum, overlapRoots };
}

function completeSecondMomentRow(p) {
  const chi = quadraticCharacterTable(p);
  const corrections = fieldCorrections(p, chi);
  const singularTraceSquares = corrections.singular.map((a) => {
    const trace = traceForParameter(p, a, chi);
    return { a, trace, traceSquare: trace * trace };
  });
  const singularTraceSquareSum = singularTraceSquares.reduce((sum, row) => sum + row.traceSquare, 0);
  const allSecondMoment = p * p + p * (corrections.curveSum - corrections.overlapRoots);
  const goodCount = p - corrections.singular.length;
  const goodSecondMoment = allSecondMoment - singularTraceSquareSum;
  const normalizedSecondMoment = goodSecondMoment / (p * goodCount);
  const stResidual = normalizedSecondMoment - 1;
  const allAResidual = allSecondMoment / (p * p) - 1;
  const singularCorrection = -singularTraceSquareSum / (p * goodCount);
  return {
    p,
    singular: corrections.singular,
    singularCount: corrections.singular.length,
    singularTraceSquares,
    singularTraceSquareSum,
    fixedCurveTrace: corrections.fixedCurveTrace,
    chiMinusOne: corrections.chiMinusOne,
    curveSum: corrections.curveSum,
    overlapRoots: corrections.overlapRoots,
    allSecondMoment,
    goodCount,
    goodSecondMoment,
    normalizedSecondMoment,
    stResidual,
    allAResidual,
    singularCorrection,
    exactMain: stResidual,
    exactResidual: 0,
  };
}

function bruteGoodSecondMoment(p) {
  const chi = quadraticCharacterTable(p);
  let sum = 0;
  let good = 0;
  for (let a = 0; a < p; a++) {
    const a2 = (a * a) % p;
    const a3 = (a2 * a) % p;
    if (mod(4 * a3 + 27, p) === 0) continue;
    const trace = traceForParameter(p, a, chi);
    sum += trace * trace;
    good++;
  }
  return { p, good, sum };
}

function validateFormula(primes) {
  return primes.filter((p) => p >= 5 && p <= 97).map((p) => {
    const row = completeSecondMomentRow(p);
    const brute = bruteGoodSecondMoment(p);
    return {
      p,
      singularCount: row.singularCount,
      curveSum: row.curveSum,
      overlapRoots: row.overlapRoots,
      fixedCurveTrace: row.fixedCurveTrace,
      formulaGoodSecondMoment: row.goodSecondMoment,
      bruteGoodSecondMoment: brute.sum,
      goodCount: row.goodCount,
      bruteGoodCount: brute.good,
      ok: row.goodSecondMoment === brute.sum && row.goodCount === brute.good,
    };
  });
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

function endpointCountsForRows(rows) {
  return endpoints.map((endpoint) => rows.filter((row) => row.p <= endpoint).length);
}

function endpointCountsForLabels(labels) {
  const sorted = labels.slice().sort((a, b) => a - b);
  let j = 0;
  return endpoints.map((endpoint) => {
    while (j < sorted.length && sorted[j] <= endpoint) j++;
    return j;
  });
}

function scoreValues(name, values, endpointCounts) {
  const rows = [];
  const blocks = [];
  let cursor = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsZ = 0;
  let maxAbsEnergyZ = 0;
  for (let i = 0; i < endpointCounts.length; i++) {
    const prevCursor = cursor;
    const prevSum = sum;
    const target = Math.min(endpointCounts[i], values.length);
    while (cursor < target) {
      const value = values[cursor++];
      sum += value;
      sumSquares += value * value;
      const zNow = sum / Math.sqrt(Math.max(1, cursor));
      const energyNow = sum / Math.sqrt(Math.max(1e-18, sumSquares));
      maxAbsZ = Math.max(maxAbsZ, Math.abs(zNow));
      maxAbsEnergyZ = Math.max(maxAbsEnergyZ, Math.abs(energyNow));
    }
    const count = cursor;
    const blockCount = cursor - prevCursor;
    const blockSum = sum - prevSum;
    const sqrtCount = Math.sqrt(Math.max(1, count));
    rows.push({
      N: endpoints[i],
      count,
      sum,
      mean: sum / Math.max(1, count),
      z: sum / sqrtCount,
      energyZ: sum / Math.sqrt(Math.max(1e-18, sumSquares)),
      maxAbsZ,
      maxAbsEnergyZ,
    });
    blocks.push({
      lo: i ? endpoints[i - 1] : 1,
      hi: endpoints[i],
      count: blockCount,
      sum: blockSum,
      mean: blockSum / Math.max(1, blockCount),
      z: blockSum / Math.sqrt(Math.max(1, blockCount)),
    });
  }
  return { name, rows, blocks };
}

function summarizeControls(runs) {
  const finals = runs.map((run) => run.rows.at(-1));
  return {
    count: range(finals.map((row) => row.count)),
    z: range(finals.map((row) => row.z)),
    absZ: range(finals.map((row) => Math.abs(row.z))),
    maxAbsZ: range(finals.map((row) => row.maxAbsZ)),
    energyZ: range(finals.map((row) => row.energyZ)),
    maxAbsEnergyZ: range(finals.map((row) => row.maxAbsEnergyZ)),
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

function scoreRows(rows) {
  const endpointCounts = endpointCountsForRows(rows);
  const values = rows.map((row) => row.stResidual);
  const exactResiduals = rows.map((row) => row.exactResidual);
  const allAValues = rows.map((row) => row.allAResidual);
  const real = scoreValues("real-prime-order st residual", values, endpointCounts);
  const exactResidual = scoreValues("exact residual after curve main", exactResiduals, endpointCounts);
  const allA = scoreValues("all-a residual before singular discard", allAValues, endpointCounts);
  const maxCount = Math.max(...endpointCounts);
  const controls = {
    shuffle: seeds.map((seed) => scoreValues(`shuffle-${seed}`, shuffle(values, seed), endpointCounts)),
    signFlip: seeds.map((seed) => scoreValues(`sign-flip-${seed}`, signFlip(values, seed ^ 0x9e3779b9), endpointCounts)),
    bootstrap: seeds.map((seed) => scoreValues(`bootstrap-${seed}`, sampleObserved(values, maxCount, seed ^ 0x517cc1b7), endpointCounts)),
    cramerIndex: seeds.map((seed) => {
      const counts = endpointCountsForLabels(cramerPrimes(N, seed));
      const sampled = sampleObserved(values, Math.max(...counts), seed ^ 0xbb67ae85);
      return scoreValues(`cramer-index-${seed}`, sampled, counts);
    }),
  };
  return {
    endpointCounts,
    real,
    exactResidual,
    allA,
    controls,
    summary: Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
    holdout: {
      real: real.blocks.at(-1),
      allA: allA.blocks.at(-1),
      exactResidual: exactResidual.blocks.at(-1),
      shuffle: holdoutSummary(controls.shuffle),
      signFlip: holdoutSummary(controls.signFlip),
      bootstrap: holdoutSummary(controls.bootstrap),
      cramerIndex: holdoutSummary(controls.cramerIndex),
    },
  };
}

function namedCompositeChecks() {
  return [25, 35, 77, 289].map((n) => ({
    n,
    primeField: false,
    reason: "complete parameter family E_a/F_p and Hasse traces are finite-field inputs; composite modulus is not a field",
  }));
}

function makeSvg(report) {
  const width = 1180;
  const height = 660;
  const margin = { left: 70, right: 320, top: 70, bottom: 78 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const endpointRows = report.score.real.rows;
  const series = [
    { id: "ST residual Z", color: "#67e8f9", rows: endpointRows.map((row, i) => ({ x: i, y: row.z })) },
    { id: "all-a residual Z", color: "#fbbf24", rows: report.score.allA.rows.map((row, i) => ({ x: i, y: row.z })) },
    { id: "exact residual Z", color: "#34d399", rows: report.score.exactResidual.rows.map((row, i) => ({ x: i, y: row.z })) },
    { id: "shuffle mean max", color: "#a78bfa", rows: endpointRows.map((_row, i) => ({ x: i, y: mean(report.score.controls.shuffle.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "bootstrap mean max", color: "#fb7185", rows: endpointRows.map((_row, i) => ({ x: i, y: mean(report.score.controls.bootstrap.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "Cramer-index mean max", color: "#f97316", rows: endpointRows.map((_row, i) => ({ x: i, y: mean(report.score.controls.cramerIndex.map((run) => run.rows[i].maxAbsZ)) })) },
  ];
  const allY = series.flatMap((entry) => entry.rows.map((row) => row.y));
  const yMin = Math.min(-1, ...allY) * 1.1;
  const yMax = Math.max(1, ...allY) * 1.1;
  const xOf = (point) => margin.left + (point.x / Math.max(1, endpointRows.length - 1)) * plotW;
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
  const final = endpointRows.at(-1);
  const notes = [
    `N ${report.N}`,
    `primes ${final.count}`,
    `ST residual Z ${fmt(final.z)}`,
    `energy r ${fmt(final.energyZ)}`,
    `exact residual Z ${fmt(report.score.exactResidual.rows.at(-1).z)}`,
    `validation ${report.validation.every((row) => row.ok) ? "passed" : "FAILED"}`,
    `collapse y^2=x^3-4`,
  ].map((text, i) => `<text x="${width - 286}" y="${116 + i * 27}" fill="#cbd5e1" font-size="13">${text}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Complete elliptic family second-moment audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 38}" fill="#94a3b8" font-size="13">Second moment over E_a: y^2=x^3+a*x+1. The pair term collapses to the fixed CM curve y^2=x^3-4.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  const final = report.score.real.rows.at(-1);
  const exactFinal = report.score.exactResidual.rows.at(-1);
  lines.push("# Complete elliptic family second-moment audit", "");
  lines.push("Family: `E_a: y^2=x^3+a*x+1`, complete parameters `a in F_p`, singular `4a^3+27=0` discarded.", "");
  lines.push("Derived identity:", "");
  lines.push("`sum_{a in F_p} a_p(E_a)^2 = p^2 + p*(C_p - R_p)`", "");
  lines.push("where `R_p=#{x in F_p*: 2*x^3=1}` and", "");
  lines.push("`C_p=sum_u chi(u*(1-4*u^3)) = -a_p(y^2=x^3-4)-chi(-1)`.", "");
  lines.push("Reason: after expanding `a_p(E_a)^2`, the nonzero `x,y` pair sum is nonzero beyond the baseline only when the two linear roots in `a` agree. That condition is `x=y` or `xy(x+y)=1`. Grouping the curved branch by `u=xy` gives the fixed-curve character sum above.", "");
  lines.push("Good-parameter formula subtracts the singular trace-square correction:", "");
  lines.push("`M2_good(p)=p^2+p*(C_p-R_p)-sum_singular a_p(E_a)^2`.", "");
  lines.push("## Brute-force validation", "");
  lines.push("| p | singular count | curve sum | overlap roots | fixed trace | formula good M2 | brute good M2 | good count | ok |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.validation) {
    lines.push(`| ${row.p} | ${row.singularCount} | ${row.curveSum} | ${row.overlapRoots} | ${row.fixedCurveTrace} | ${row.formulaGoodSecondMoment} | ${row.bruteGoodSecondMoment} | ${row.goodCount} | ${row.ok ? "yes" : "NO"} |`);
  }
  lines.push("");
  lines.push("## Endpoint trace", "");
  lines.push("| N | primes | mean U2 | ST residual Z | energy r | all-a residual Z | exact residual Z | max abs Z |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < report.score.real.rows.length; i++) {
    const row = report.score.real.rows[i];
    const allA = report.score.allA.rows[i];
    const exact = report.score.exactResidual.rows[i];
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(allA.z)} | ${fmt(exact.z)} | ${fmt(row.maxAbsZ)} |`);
  }
  lines.push("");
  lines.push("Control summary at full range:", "");
  lines.push("| control | endpoint Z range | max abs Z range | energy r range | max energy r range |");
  lines.push("| --- | ---: | ---: | ---: | ---: |");
  for (const key of ["shuffle", "signFlip", "bootstrap", "cramerIndex"]) {
    const summary = report.score.summary[key];
    lines.push(`| ${key} | ${fmt(summary.z[0])}..${fmt(summary.z[1])} | ${fmt(summary.maxAbsZ[0])}..${fmt(summary.maxAbsZ[1])} | ${fmt(summary.energyZ[0])}..${fmt(summary.energyZ[1])} | ${fmt(summary.maxAbsEnergyZ[0])}..${fmt(summary.maxAbsEnergyZ[1])} |`);
  }
  lines.push("");
  lines.push("Final holdout block:", "");
  lines.push(`- real \`(N/2,N]\`: count ${report.score.holdout.real.count}, Z ${fmt(report.score.holdout.real.z)}.`);
  for (const key of ["shuffle", "signFlip", "bootstrap", "cramerIndex"]) {
    const holdout = report.score.holdout[key];
    lines.push(`- ${key}: Z ${fmt(holdout.z[0])}..${fmt(holdout.z[1])}.`);
  }
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
  lines.push("This does not telescope to `theta`, `psi`, or `M`. It collapses to an exact finite-field trace-pair identity, and the only non-diagonal term is the Hasse trace of the fixed CM elliptic curve `y^2=x^3-4` plus an overlap correction. After subtracting that exact main term, the residual is identically zero.");
  lines.push("");
  lines.push("Break verdict:");
  lines.push("");
  lines.push(`At \`N=${report.N}\`, the Sato-Tate-centered path has endpoint \`Z=${fmt(final.z)}\` and energy-normalized \`r=${fmt(final.energyZ)}\`, while the exact residual endpoint is \`Z=${fmt(exactFinal.z)}\`. The nonzero path is a fixed elliptic trace sequence, not a new prime critical line.`);
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[complete-elliptic-second] primes to ${N}`);
const primes = primesUpTo(N).filter((p) => p >= 5);
const rows = [];
for (let i = 0; i < primes.length; i++) {
  rows.push(completeSecondMomentRow(primes[i]));
  if ((i + 1) % 1000 === 0) console.error(`[complete-elliptic-second] rows ${i + 1}/${primes.length}`);
}
const score = scoreRows(rows);
const validation = validateFormula(primes);
const paths = {
  json: path.join(outDir, `complete-elliptic-family-second-moment-${N}.json`),
  md: path.join(outDir, `complete-elliptic-family-second-moment-${N}.md`),
  svg: path.join(outDir, `complete-elliptic-family-second-moment-${N}.svg`),
};
const report = {
  candidate: "complete elliptic family second-moment line",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  score,
  validation,
  namedComposites: namedCompositeChecks(),
  sampleRows: rows.slice(0, 20),
  paths,
};
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  validationOk: validation.every((row) => row.ok),
  endpoint: score.real.rows.at(-1),
  exactResidualEndpoint: score.exactResidual.rows.at(-1),
  summaries: score.summary,
  paths,
}, null, 2));
