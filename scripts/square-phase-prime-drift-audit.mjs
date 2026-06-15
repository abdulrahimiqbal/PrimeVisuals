#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const W = Number(process.argv[4] || 2310);
const seeds = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 1013904223, 2654435761, 11235813, 14142135,
  17320508, 22360679, 24494897, 31415926, 27182818,
];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));

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

function phiOfInteger(n) {
  let result = n;
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p !== 0) continue;
    while (x % p === 0) x /= p;
    result -= result / p;
  }
  if (x > 1) result -= result / x;
  return result;
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

function exponent(rows, key, scaleKey = "labels") {
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function squarePhase(n) {
  const k = Math.floor(Math.sqrt(n));
  const lo = k * k;
  const width = 2 * k + 1;
  return 2 * ((n - lo) / width) - 1;
}

function buildSquareShellStats(limit, modulus) {
  const maxK = Math.floor(Math.sqrt(limit));
  const count = new Int32Array(maxK + 1);
  const sum = new Float64Array(maxK + 1);
  const sumSq = new Float64Array(maxK + 1);
  const candidatePool = [];
  const compositePool = [];
  const primeFlags = sieve(limit);
  for (let n = 2; n <= limit; n++) {
    if (gcd(n, modulus) !== 1) continue;
    const k = Math.floor(Math.sqrt(n));
    const phase = squarePhase(n);
    count[k]++;
    sum[k] += phase;
    sumSq[k] += phase * phase;
    candidatePool.push(n);
    if (!primeFlags[n]) compositePool.push(n);
  }
  const meanByK = new Float64Array(maxK + 1);
  const varByK = new Float64Array(maxK + 1);
  for (let k = 0; k <= maxK; k++) {
    if (!count[k]) continue;
    meanByK[k] = sum[k] / count[k];
    varByK[k] = Math.max(1e-12, sumSq[k] / count[k] - meanByK[k] * meanByK[k]);
  }
  return { limit, modulus, primeFlags, maxK, count, meanByK, varByK, candidatePool, compositePool };
}

function scoreLabels(name, labels, ctx, rowEndpoints = endpoints) {
  const rows = [];
  let raw = 0;
  let rawUncentered = 0;
  let variance = 0;
  let labelsUsed = 0;
  let maxAbsRaw = 0;
  let maxAbsZ = 0;
  let j = 0;
  for (const endpoint of rowEndpoints) {
    while (j < labels.length && labels[j] <= endpoint) {
      const n = labels[j++];
      if (n < 2 || gcd(n, ctx.modulus) !== 1) continue;
      const k = Math.floor(Math.sqrt(n));
      if (k > ctx.maxK || ctx.count[k] < 2) continue;
      const phase = squarePhase(n);
      const centered = phase - ctx.meanByK[k];
      raw += centered;
      rawUncentered += phase;
      variance += ctx.varByK[k];
      labelsUsed++;
      const z = raw / Math.sqrt(Math.max(1e-12, variance));
      maxAbsRaw = Math.max(maxAbsRaw, Math.abs(raw));
      maxAbsZ = Math.max(maxAbsZ, Math.abs(z));
    }
    const sqrtVar = Math.sqrt(Math.max(1e-12, variance));
    rows.push({
      N: endpoint,
      labels: labelsUsed,
      raw,
      rawUncentered,
      sqrtVar,
      z: raw / sqrtVar,
      maxAbsRaw,
      maxAbsZ,
    });
  }
  const blocks = rows.map((row, i) => {
    const prev = i ? rows[i - 1] : null;
    const rawBlock = row.raw - (prev ? prev.raw : 0);
    const varBlock = row.sqrtVar * row.sqrtVar - (prev ? prev.sqrtVar * prev.sqrtVar : 0);
    const labelsBlock = row.labels - (prev ? prev.labels : 0);
    return {
      lo: i ? rows[i - 1].N : 1,
      hi: row.N,
      labels: labelsBlock,
      raw: rawBlock,
      sqrtVar: Math.sqrt(Math.max(1e-12, varBlock)),
      z: rawBlock / Math.sqrt(Math.max(1e-12, varBlock)),
    };
  });
  return {
    name,
    rows,
    blocks,
    thetaRaw: exponent(rows, "maxAbsRaw"),
  };
}

function sampleLogDensity(pool, seed, scale, primeFlags = null, compositesOnly = false) {
  const random = rng(seed);
  const labels = [];
  for (const n of pool) {
    if (compositesOnly && primeFlags[n]) continue;
    const probability = Math.min(1, scale / Math.log(Math.max(3, n)));
    if (random() < probability) labels.push(n);
  }
  return labels;
}

function summarizeControls(controls) {
  const finals = controls.map((control) => control.rows.at(-1));
  return {
    labels: range(finals.map((row) => row.labels)),
    z: range(finals.map((row) => row.z)),
    absZ: range(finals.map((row) => Math.abs(row.z))),
    maxAbsZ: range(finals.map((row) => row.maxAbsZ)),
    thetaRaw: range(controls.map((control) => control.thetaRaw)),
  };
}

function namedCompositeChecks(ctx) {
  return [25, 35, 77, 289].map((n) => {
    const k = Math.floor(Math.sqrt(n));
    const eligible = gcd(n, ctx.modulus) === 1 && k <= ctx.maxK && ctx.count[k] > 1;
    const phase = squarePhase(n);
    const centered = eligible ? phase - ctx.meanByK[k] : null;
    const oneStepZ = eligible ? centered / Math.sqrt(ctx.varByK[k]) : null;
    return {
      n,
      isPrime: Boolean(ctx.primeFlags[n]),
      WEligible: gcd(n, ctx.modulus) === 1,
      phase,
      centered,
      oneStepZ,
      admissibleAsPrimeInput: Boolean(ctx.primeFlags[n]),
    };
  });
}

function holdoutScore(name, labels, ctx, lo, hi) {
  const filtered = labels.filter((n) => n > lo && n <= hi);
  return scoreLabels(name, filtered, ctx, [hi]).rows[0];
}

function integerAudit() {
  console.error(`[square-phase] building W=${W} square shell to ${N}`);
  const ctx = buildSquareShellStats(N, W);
  const densityScale = W / phiOfInteger(W);
  console.error(`[square-phase] building real primes and controls`);
  const primes = primesUpTo(N);
  const real = scoreLabels("real-primes", primes, ctx);
  const cramer = seeds.map((seed) => scoreLabels(`cramer-${seed}`, cramerPrimes(N, seed), ctx));
  const wRandom = seeds.map((seed) => scoreLabels(
    `W${W}-log-random-${seed}`,
    sampleLogDensity(ctx.candidatePool, seed ^ 0x9e3779b9, densityScale),
    ctx,
  ));
  const wComposite = seeds.map((seed) => scoreLabels(
    `W${W}-log-composite-${seed}`,
    sampleLogDensity(ctx.candidatePool, seed ^ 0x517cc1b7, densityScale, ctx.primeFlags, true),
    ctx,
  ));
  const holdoutLo = endpoints.at(-2);
  const holdoutHi = endpoints.at(-1);
  return {
    W,
    phiW: phiOfInteger(W),
    densityScale,
    poolSizes: {
      WCandidates: ctx.candidatePool.length,
      WComposites: ctx.compositePool.length,
      primes: primes.length,
    },
    real,
    cramer,
    wRandom,
    wComposite,
    summary: {
      cramer: summarizeControls(cramer),
      wRandom: summarizeControls(wRandom),
      wComposite: summarizeControls(wComposite),
    },
    holdout: {
      lo: holdoutLo,
      hi: holdoutHi,
      real: holdoutScore("real-holdout", primes, ctx, holdoutLo, holdoutHi),
      cramer: summarizeControls(seeds.map((seed) => scoreLabels(
        `cramer-holdout-${seed}`,
        cramerPrimes(holdoutHi, seed).filter((n) => n > holdoutLo),
        ctx,
        [holdoutHi],
      ))),
      wRandom: summarizeControls(seeds.map((seed) => scoreLabels(
        `W${W}-holdout-random-${seed}`,
        sampleLogDensity(ctx.candidatePool.filter((n) => n > holdoutLo), seed ^ 0x6a09e667, densityScale),
        ctx,
        [holdoutHi],
      ))),
      wComposite: summarizeControls(seeds.map((seed) => scoreLabels(
        `W${W}-holdout-composite-${seed}`,
        sampleLogDensity(ctx.candidatePool.filter((n) => n > holdoutLo), seed ^ 0xbb67ae85, densityScale, ctx.primeFlags, true),
        ctx,
        [holdoutHi],
      ))),
    },
    namedComposites: namedCompositeChecks(ctx),
    fieldNote: "No coordinate-free finite-field square phase was used: inside a fixed degree shell every monic polynomial has the same norm, and ordering lower coefficients would reintroduce the coefficient-ordering artifact.",
  };
}

function makeSvg(report) {
  const width = 1180;
  const height = 660;
  const margin = { left: 70, right: 330, top: 70, bottom: 78 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const rows = report.integer.real.rows;
  const endpointSeries = [
    { id: "real Z", color: "#67e8f9", rows: rows.map((row, i) => ({ x: i, y: row.z })) },
    { id: "real max |Z|", color: "#fbbf24", rows: rows.map((row, i) => ({ x: i, y: row.maxAbsZ })) },
    { id: "Cramer mean |Z|", color: "#a78bfa", rows: rows.map((_row, i) => ({ x: i, y: mean(report.integer.cramer.map((control) => Math.abs(control.rows[i].z))) })) },
    { id: "W random mean |Z|", color: "#34d399", rows: rows.map((_row, i) => ({ x: i, y: mean(report.integer.wRandom.map((control) => Math.abs(control.rows[i].z))) })) },
    { id: "W composite mean |Z|", color: "#fb7185", rows: rows.map((_row, i) => ({ x: i, y: mean(report.integer.wComposite.map((control) => Math.abs(control.rows[i].z))) })) },
  ];
  const allY = endpointSeries.flatMap((series) => series.rows.map((row) => row.y));
  const yMin = Math.min(-1, ...allY) * 1.1;
  const yMax = Math.max(1, ...allY) * 1.1;
  const xOf = (point) => margin.left + (point.x / Math.max(1, rows.length - 1)) * plotW;
  const yOf = (point) => margin.top + (1 - (point.y - yMin) / (yMax - yMin)) * plotH;
  const line = (points) => points.map((point) => `${xOf(point).toFixed(2)},${yOf(point).toFixed(2)}`).join(" ");
  const grid = [];
  for (let i = 0; i <= 6; i++) {
    const y = margin.top + (i / 6) * plotH;
    const val = yMax - (i / 6) * (yMax - yMin);
    grid.push(`<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1f2937"/>`);
    grid.push(`<text x="18" y="${y + 4}" fill="#94a3b8" font-size="12">${fmt(val, 2)}</text>`);
  }
  const zeroY = yOf({ x: 0, y: 0 });
  grid.push(`<line x1="${margin.left}" y1="${zeroY}" x2="${width - margin.right}" y2="${zeroY}" stroke="#475569" stroke-width="1.5"/>`);
  const paths = endpointSeries.map((series) => {
    const circles = series.rows.map((point) => `<circle cx="${xOf(point)}" cy="${yOf(point)}" r="4" fill="${series.color}"/>`).join("");
    return `<polyline points="${line(series.rows)}" fill="none" stroke="${series.color}" stroke-width="3"/>${circles}`;
  }).join("\n");
  const legend = endpointSeries.map((series, i) => {
    const x = margin.left + (i % 3) * 220;
    const y = 38 + Math.floor(i / 3) * 18;
    return `<text x="${x}" y="${y}" fill="${series.color}" font-size="13">${series.id}</text>`;
  }).join("\n");
  const final = report.integer.real.rows.at(-1);
  const notes = [
    `real final Z ${fmt(final.z)}`,
    `real max |Z| ${fmt(final.maxAbsZ)}`,
    `Cramer max |Z| ${fmt(report.integer.summary.cramer.maxAbsZ[0])}..${fmt(report.integer.summary.cramer.maxAbsZ[1])}`,
    `W random max |Z| ${fmt(report.integer.summary.wRandom.maxAbsZ[0])}..${fmt(report.integer.summary.wRandom.maxAbsZ[1])}`,
    `W comp max |Z| ${fmt(report.integer.summary.wComposite.maxAbsZ[0])}..${fmt(report.integer.summary.wComposite.maxAbsZ[1])}`,
    `holdout real Z ${fmt(report.integer.holdout.real.z)}`,
  ].map((text, i) => `<text x="${width - 300}" y="${120 + i * 28}" fill="#cbd5e1" font-size="13">${text}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Square-phase prime drift audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${paths}
${notes}
<text x="${margin.left}" y="${height - 38}" fill="#94a3b8" font-size="13">Z: cumulative centered square-annulus phase against exact W-shell mean and variance.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  const real = report.integer.real;
  lines.push("# Square-phase prime-drift audit", "");
  lines.push("Candidate:");
  lines.push("`Z_W(N)=sum_{p<=N}(phi(p)-E_W(phi|square annulus))/sqrt(sum Var_W)`, with `phi(n)=2 frac_square(n)-1`.", "");
  lines.push("## Integer side", "");
  lines.push(`W: ${report.integer.W}, phi(W): ${report.integer.phiW}, density scale W/phi(W): ${fmt(report.integer.densityScale)}.`);
  lines.push(`Pool sizes: W candidates ${report.integer.poolSizes.WCandidates}, W composites ${report.integer.poolSizes.WComposites}, primes ${report.integer.poolSizes.primes}.`, "");
  lines.push("| N | labels | raw centered sum | sqrt variance | Z | max |Z| | raw theta so far | block Z |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < real.rows.length; i++) {
    const row = real.rows[i];
    lines.push(`| ${row.N} | ${row.labels} | ${fmt(row.raw)} | ${fmt(row.sqrtVar)} | ${fmt(row.z)} | ${fmt(row.maxAbsZ)} | ${fmt(real.thetaRaw)} | ${fmt(real.blocks[i].z)} |`);
  }
  lines.push("");
  lines.push("Endpoint controls, 15 seeds:");
  lines.push("");
  lines.push("| control | labels range | final Z range | final |Z| range | max |Z| range | raw theta range |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const [name, summary] of Object.entries(report.integer.summary)) {
    lines.push(`| ${name} | ${summary.labels[0]}..${summary.labels[1]} | ${fmt(summary.z[0])}..${fmt(summary.z[1])} | ${fmt(summary.absZ[0])}..${fmt(summary.absZ[1])} | ${fmt(summary.maxAbsZ[0])}..${fmt(summary.maxAbsZ[1])} | ${fmt(summary.thetaRaw[0])}..${fmt(summary.thetaRaw[1])} |`);
  }
  lines.push("");
  lines.push(`Holdout range: (${report.integer.holdout.lo}, ${report.integer.holdout.hi}]`);
  lines.push("");
  lines.push("| holdout | labels | Z / range | max |Z| range |");
  lines.push("| --- | ---: | ---: | ---: |");
  lines.push(`| real | ${report.integer.holdout.real.labels} | ${fmt(report.integer.holdout.real.z)} | ${fmt(report.integer.holdout.real.maxAbsZ)} |`);
  lines.push(`| cramer | ${report.integer.holdout.cramer.labels[0]}..${report.integer.holdout.cramer.labels[1]} | ${fmt(report.integer.holdout.cramer.z[0])}..${fmt(report.integer.holdout.cramer.z[1])} | ${fmt(report.integer.holdout.cramer.maxAbsZ[0])}..${fmt(report.integer.holdout.cramer.maxAbsZ[1])} |`);
  lines.push(`| wRandom | ${report.integer.holdout.wRandom.labels[0]}..${report.integer.holdout.wRandom.labels[1]} | ${fmt(report.integer.holdout.wRandom.z[0])}..${fmt(report.integer.holdout.wRandom.z[1])} | ${fmt(report.integer.holdout.wRandom.maxAbsZ[0])}..${fmt(report.integer.holdout.wRandom.maxAbsZ[1])} |`);
  lines.push(`| wComposite | ${report.integer.holdout.wComposite.labels[0]}..${report.integer.holdout.wComposite.labels[1]} | ${fmt(report.integer.holdout.wComposite.z[0])}..${fmt(report.integer.holdout.wComposite.z[1])} | ${fmt(report.integer.holdout.wComposite.maxAbsZ[0])}..${fmt(report.integer.holdout.wComposite.maxAbsZ[1])} |`);
  lines.push("");
  lines.push("Named composite checks:");
  lines.push("");
  lines.push("| n | prime input? | W-eligible? | phase | centered | one-step Z |");
  lines.push("| ---: | --- | --- | ---: | ---: | ---: |");
  for (const row of report.integer.namedComposites) {
    lines.push(`| ${row.n} | ${row.admissibleAsPrimeInput ? "yes" : "no"} | ${row.WEligible ? "yes" : "no"} | ${fmt(row.phase)} | ${row.centered == null ? "NA" : fmt(row.centered)} | ${row.oneStepZ == null ? "NA" : fmt(row.oneStepZ)} |`);
  }
  lines.push("");
  lines.push("## Function-field note", "");
  lines.push(report.integer.fieldNote);
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
const integer = integerAudit();
const paths = {
  json: path.join(outDir, `square-phase-prime-drift-${N}.json`),
  md: path.join(outDir, `square-phase-prime-drift-${N}.md`),
  svg: path.join(outDir, `square-phase-prime-drift-${N}.svg`),
};
const report = {
  candidate: "square-phase prime drift",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  seeds,
  integer,
  paths,
};
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  endpoint: {
    labels: integer.real.rows.at(-1).labels,
    z: integer.real.rows.at(-1).z,
    maxAbsZ: integer.real.rows.at(-1).maxAbsZ,
    thetaRaw: integer.real.thetaRaw,
  },
  controls: integer.summary,
  holdout: {
    real: integer.holdout.real,
    cramerZ: integer.holdout.cramer.z,
    wRandomZ: integer.holdout.wRandom.z,
    wCompositeZ: integer.holdout.wComposite.z,
  },
  paths,
}, null, 2));
