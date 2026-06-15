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

function quadraticCharacterTable(p) {
  const chi = new Int8Array(p);
  chi.fill(-1);
  chi[0] = 0;
  for (let y = 1; y <= (p - 1) >> 1; y++) chi[(y * y) % p] = 1;
  return chi;
}

function traceForParameters(p, a, b, chi = quadraticCharacterTable(p)) {
  const ar = mod(a, p);
  const br = mod(b, p);
  let characterSum = 0;
  for (let x = 0; x < p; x++) {
    const x2 = (x * x) % p;
    const x3 = (x2 * x) % p;
    characterSum += chi[(x3 + ar * x + br) % p];
  }
  return -characterSum;
}

function isSingular(p, a, b) {
  const a2 = (a * a) % p;
  const a3 = (a2 * a) % p;
  const b2 = (b * b) % p;
  return mod(4 * a3 + 27 * b2, p) === 0;
}

function completeSecondMomentRow(p) {
  const allParameterCount = p * p;
  const singularCount = p;
  const goodCount = allParameterCount - singularCount;
  const allSecondMoment = p * p * (p - 1);
  const singularTraceSquareSum = p - 1;
  const goodSecondMoment = allSecondMoment - singularTraceSquareSum;
  const normalizedSecondMoment = goodSecondMoment / (p * goodCount);
  const stResidual = normalizedSecondMoment - 1;
  const exactMain = -1 / (p * p);
  return {
    p,
    allParameterCount,
    singularCount,
    goodCount,
    allSecondMoment,
    singularTraceSquareSum,
    goodSecondMoment,
    normalizedSecondMoment,
    stResidual,
    exactMain,
    exactResidual: 0,
  };
}

function bruteGoodSecondMoment(p) {
  const chi = quadraticCharacterTable(p);
  let goodCount = 0;
  let goodSecondMoment = 0;
  let singularCount = 0;
  let singularTraceSquareSum = 0;
  for (let a = 0; a < p; a++) {
    for (let b = 0; b < p; b++) {
      const trace = traceForParameters(p, a, b, chi);
      const traceSquare = trace * trace;
      if (isSingular(p, a, b)) {
        singularCount++;
        singularTraceSquareSum += traceSquare;
        continue;
      }
      goodCount++;
      goodSecondMoment += traceSquare;
    }
  }
  return { p, goodCount, goodSecondMoment, singularCount, singularTraceSquareSum };
}

function validateFormula(primes) {
  return primes.filter((p) => p >= 5 && p <= 97).map((p) => {
    const formula = completeSecondMomentRow(p);
    const brute = bruteGoodSecondMoment(p);
    return {
      p,
      formulaGoodCount: formula.goodCount,
      bruteGoodCount: brute.goodCount,
      formulaSingularCount: formula.singularCount,
      bruteSingularCount: brute.singularCount,
      formulaSingularTraceSquareSum: formula.singularTraceSquareSum,
      bruteSingularTraceSquareSum: brute.singularTraceSquareSum,
      formulaGoodSecondMoment: formula.goodSecondMoment,
      bruteGoodSecondMoment: brute.goodSecondMoment,
      ok: formula.goodCount === brute.goodCount
        && formula.singularCount === brute.singularCount
        && formula.singularTraceSquareSum === brute.singularTraceSquareSum
        && formula.goodSecondMoment === brute.goodSecondMoment,
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
  let maxAbsSum = 0;
  for (let i = 0; i < endpointCounts.length; i++) {
    const prevCursor = cursor;
    const prevSum = sum;
    const target = Math.min(endpointCounts[i], values.length);
    while (cursor < target) {
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
      N: endpoints[i],
      count,
      sum,
      mean: sum / Math.max(1, count),
      z: sum / Math.sqrt(Math.max(1, count)),
      energyZ: sum / Math.sqrt(Math.max(1e-18, sumSquares)),
      maxAbsSum,
      maxAbsZ,
    });
    blocks.push({
      lo: i ? endpoints[i - 1] : 1,
      hi: endpoints[i],
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

function summarizeControls(runs) {
  const finals = runs.map((run) => run.rows.at(-1));
  return {
    count: range(finals.map((row) => row.count)),
    z: range(finals.map((row) => row.z)),
    absZ: range(finals.map((row) => Math.abs(row.z))),
    maxAbsZ: range(finals.map((row) => row.maxAbsZ)),
    energyZ: range(finals.map((row) => row.energyZ)),
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
  const maxCount = Math.max(...endpointCounts);
  const real = scoreValues("real prime fields", values, endpointCounts);
  const exactResidual = scoreValues("exact residual", exactResiduals, endpointCounts);
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
    controls,
    summary: Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
    holdout: {
      real: real.blocks.at(-1),
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
    reason: "complete Weierstrass family E_{a,b}/F_p and Legendre traces require a field; composite modulus is not a field",
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
    { id: "exact residual Z", color: "#34d399", rows: report.score.exactResidual.rows.map((row, i) => ({ x: i, y: row.z })) },
    { id: "shuffle mean max", color: "#a78bfa", rows: endpointRows.map((_row, i) => ({ x: i, y: mean(report.score.controls.shuffle.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "bootstrap mean max", color: "#fb7185", rows: endpointRows.map((_row, i) => ({ x: i, y: mean(report.score.controls.bootstrap.map((run) => run.rows[i].maxAbsZ)) })) },
    { id: "Cramer-index mean max", color: "#f97316", rows: endpointRows.map((_row, i) => ({ x: i, y: mean(report.score.controls.cramerIndex.map((run) => run.rows[i].maxAbsZ)) })) },
  ];
  const allY = series.flatMap((entry) => entry.rows.map((row) => row.y));
  const yMin = Math.min(-0.001, ...allY) * 1.15;
  const yMax = Math.max(0.001, ...allY) * 1.15;
  const xOf = (point) => margin.left + (point.x / Math.max(1, endpointRows.length - 1)) * plotW;
  const yOf = (point) => margin.top + (1 - (point.y - yMin) / (yMax - yMin)) * plotH;
  const grid = [];
  for (let i = 0; i <= 6; i++) {
    const y = margin.top + (i / 6) * plotH;
    const value = yMax - (i / 6) * (yMax - yMin);
    grid.push(`<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1f2937"/>`);
    grid.push(`<text x="18" y="${y + 4}" fill="#94a3b8" font-size="12">${fmt(value, 4)}</text>`);
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
    `prime fields ${final.count}`,
    `ST residual Z ${fmt(final.z, 9)}`,
    `sum main ${fmt(final.sum, 9)}`,
    `exact residual Z ${fmt(report.score.exactResidual.rows.at(-1).z)}`,
    `validation ${report.validation.every((row) => row.ok) ? "passed" : "FAILED"}`,
    `formula U2=-1/p^2`,
  ].map((text, i) => `<text x="${width - 286}" y="${116 + i * 27}" fill="#cbd5e1" font-size="13">${text}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Complete Weierstrass family second-moment audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 38}" fill="#94a3b8" font-size="13">Two-parameter family y^2=x^3+a*x+b. The second moment is exact diagonal orthogonality.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  const final = report.score.real.rows.at(-1);
  const exactFinal = report.score.exactResidual.rows.at(-1);
  lines.push("# Complete Weierstrass family second-moment audit", "");
  lines.push("Family: `E_{a,b}: y^2=x^3+a*x+b`, complete parameters `(a,b) in F_p^2`, singular `4a^3+27b^2=0` discarded.", "");
  lines.push("Derived identities:", "");
  lines.push("`sum_(a,b) a_p(E_{a,b})^2 = p^2*(p-1)`.", "");
  lines.push("Singular curves are parameterized by `a=-3r^2`, `b=2r^3`; the singular trace is `0` for `r=0` and `chi(3r)` for `r!=0`, so `sum_singular a_p^2=p-1`.", "");
  lines.push("Therefore:", "");
  lines.push("`M2_good(p)=(p-1)*(p^2-1)` and `M2_good(p)/(p*good_count)-1=-1/p^2`.", "");
  lines.push("## Brute-force validation", "");
  lines.push("| p | formula good count | brute good count | formula singular square sum | brute singular square sum | formula good M2 | brute good M2 | ok |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.validation) {
    lines.push(`| ${row.p} | ${row.formulaGoodCount} | ${row.bruteGoodCount} | ${row.formulaSingularTraceSquareSum} | ${row.bruteSingularTraceSquareSum} | ${row.formulaGoodSecondMoment} | ${row.bruteGoodSecondMoment} | ${row.ok ? "yes" : "NO"} |`);
  }
  lines.push("");
  lines.push("## Endpoint trace", "");
  lines.push("| N | prime fields | mean U2 | ST residual Z | cumulative main | exact residual Z | max abs Z |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < report.score.real.rows.length; i++) {
    const row = report.score.real.rows[i];
    const exact = report.score.exactResidual.rows[i];
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.mean, 9)} | ${fmt(row.z, 9)} | ${fmt(row.sum, 9)} | ${fmt(exact.z, 9)} | ${fmt(row.maxAbsZ, 9)} |`);
  }
  lines.push("");
  lines.push("Control summary at full range:", "");
  lines.push("| control | endpoint Z range | max abs Z range | energy Z range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const key of ["shuffle", "signFlip", "bootstrap", "cramerIndex"]) {
    const summary = report.score.summary[key];
    lines.push(`| ${key} | ${fmt(summary.z[0], 9)}..${fmt(summary.z[1], 9)} | ${fmt(summary.maxAbsZ[0], 9)}..${fmt(summary.maxAbsZ[1], 9)} | ${fmt(summary.energyZ[0], 6)}..${fmt(summary.energyZ[1], 6)} |`);
  }
  lines.push("");
  lines.push("Final holdout block:", "");
  lines.push(`- real \`(N/2,N]\`: count ${report.score.holdout.real.count}, Z ${fmt(report.score.holdout.real.z, 9)}.`);
  for (const key of ["shuffle", "signFlip", "bootstrap", "cramerIndex"]) {
    const holdout = report.score.holdout[key];
    lines.push(`- ${key}: Z ${fmt(holdout.z[0], 9)}..${fmt(holdout.z[1], 9)}.`);
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
  lines.push("This does not telescope to `theta`, `psi`, or `M`; it collapses to exact character orthogonality in the complete two-parameter finite-field family. After subtracting the deterministic main term `-1/p^2`, the residual is identically zero.");
  lines.push("");
  lines.push("Break verdict:");
  lines.push("");
  lines.push(`At \`N=${report.N}\`, the Sato-Tate-centered path has endpoint \`Z=${fmt(final.z, 9)}\`, cumulative main \`${fmt(final.sum, 9)}\`, and exact residual endpoint \`Z=${fmt(exactFinal.z, 9)}\`. The apparent flat line is exact diagonal orthogonality plus singular bookkeeping, not prime regularity.`);
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[complete-weierstrass-second] primes to ${N}`);
const primes = primesUpTo(N).filter((p) => p >= 5);
const rows = primes.map((p) => completeSecondMomentRow(p));
const score = scoreRows(rows);
const validation = validateFormula(primes);
const paths = {
  json: path.join(outDir, `complete-weierstrass-family-second-moment-${N}.json`),
  md: path.join(outDir, `complete-weierstrass-family-second-moment-${N}.md`),
  svg: path.join(outDir, `complete-weierstrass-family-second-moment-${N}.svg`),
};
const report = {
  candidate: "complete two-parameter Weierstrass family second-moment line",
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
