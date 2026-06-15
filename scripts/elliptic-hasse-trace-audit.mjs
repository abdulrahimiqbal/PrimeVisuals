#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 80_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const curve = { A: -1, B: 1, label: "y^2=x^3-x+1", badPrimes: [2, 23] };
const badPrimeSet = new Set(curve.badPrimes);
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

function sampleSatoTateU2(count, seed) {
  const random = rng(seed);
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    let x = 0;
    while (true) {
      x = 2 * random() - 1;
      if (random() <= Math.sqrt(Math.max(0, 1 - x * x))) break;
    }
    out[i] = 4 * x * x - 1;
  }
  return out;
}

function quadraticCharacterTable(p) {
  const chi = new Int8Array(p);
  chi.fill(-1);
  chi[0] = 0;
  for (let y = 1; y <= (p - 1) >> 1; y++) chi[(y * y) % p] = 1;
  return chi;
}

function hasseTracePrime(p, { A, B }) {
  const chi = quadraticCharacterTable(p);
  let sum = 0;
  const a = mod(A, p);
  const b = mod(B, p);
  for (let x = 0; x < p; x++) {
    const x2 = (x * x) % p;
    const x3 = (x2 * x) % p;
    const rhs = (x3 + a * x + b) % p;
    sum += chi[rhs];
  }
  return -sum;
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

function scoreValues(name, u2Values, endpointCounts, u1Values = null) {
  const rows = [];
  let sumU2 = 0;
  let sumU1 = 0;
  let maxAbsU2 = 0;
  let maxAbsZ2 = 0;
  let cursor = 0;
  for (let i = 0; i < endpointCounts.length; i++) {
    const target = Math.min(endpointCounts[i], u2Values.length);
    while (cursor < target) {
      sumU2 += u2Values[cursor];
      if (u1Values) sumU1 += u1Values[cursor];
      cursor++;
      const z2Now = sumU2 / Math.sqrt(Math.max(1, cursor));
      maxAbsU2 = Math.max(maxAbsU2, Math.abs(sumU2));
      maxAbsZ2 = Math.max(maxAbsZ2, Math.abs(z2Now));
    }
    const sqrtCount = Math.sqrt(Math.max(1, cursor));
    rows.push({
      N: endpoints[i],
      count: cursor,
      sumU2,
      z2: sumU2 / sqrtCount,
      maxAbsU2,
      maxAbsZ2,
      sumU1,
      z1: u1Values ? sumU1 / Math.sqrt(Math.max(0.25, cursor / 4)) : null,
    });
  }
  const blocks = rows.map((row, i) => {
    const prev = i ? rows[i - 1] : null;
    const count = row.count - (prev ? prev.count : 0);
    const sumU2Block = row.sumU2 - (prev ? prev.sumU2 : 0);
    const sumU1Block = row.sumU1 - (prev ? prev.sumU1 : 0);
    return {
      lo: i ? rows[i - 1].N : 1,
      hi: row.N,
      count,
      sumU2: sumU2Block,
      z2: sumU2Block / Math.sqrt(Math.max(1, count)),
      sumU1: sumU1Block,
      z1: u1Values ? sumU1Block / Math.sqrt(Math.max(0.25, count / 4)) : null,
    };
  });
  return {
    name,
    rows,
    blocks,
    theta: {
      maxAbsU2: exponent(rows, "maxAbsU2"),
      absSumU2: exponent(rows.map((row) => ({ ...row, absSumU2: Math.abs(row.sumU2) })), "absSumU2"),
    },
  };
}

function endpointCountsForPrimes(records) {
  return endpoints.map((endpoint) => records.filter((record) => record.p <= endpoint).length);
}

function endpointCountsForLabels(labels) {
  const sorted = labels.slice().sort((a, b) => a - b);
  let j = 0;
  return endpoints.map((endpoint) => {
    while (j < sorted.length && sorted[j] <= endpoint) j++;
    return j;
  });
}

function summarizeControls(runs) {
  const finals = runs.map((run) => run.rows.at(-1));
  return {
    count: range(finals.map((row) => row.count)),
    z2: range(finals.map((row) => row.z2)),
    absZ2: range(finals.map((row) => Math.abs(row.z2))),
    maxAbsZ2: range(finals.map((row) => row.maxAbsZ2)),
    thetaMaxAbsU2: range(runs.map((run) => run.theta.maxAbsU2)),
  };
}

function holdoutSummary(runs) {
  const lastBlock = runs.map((run) => run.blocks.at(-1));
  return {
    count: range(lastBlock.map((row) => row.count)),
    z2: range(lastBlock.map((row) => row.z2)),
    absZ2: range(lastBlock.map((row) => Math.abs(row.z2))),
  };
}

function namedCompositeChecks() {
  return [25, 35, 77, 289].map((n) => ({
    n,
    primeField: false,
    goodPrime: false,
    reason: "composite modulus is not a finite field, so #E(F_n) and Hasse trace a_n are not defined",
  }));
}

function computeCurveRecords() {
  console.error(`[elliptic] counting ${curve.label} at good primes <= ${N}`);
  const primes = primesUpTo(N);
  const records = [];
  for (const p of primes) {
    if (badPrimeSet.has(p)) continue;
    const a = hasseTracePrime(p, curve);
    const u1 = a / (2 * Math.sqrt(p));
    const u2 = (a * a) / p - 1;
    records.push({ p, a, u1, u2 });
    if (records.length % 1000 === 0) console.error(`[elliptic] traces ${records.length}/${primes.length}`);
  }
  return records;
}

function audit() {
  const records = computeCurveRecords();
  const endpointCounts = endpointCountsForPrimes(records);
  const u2 = records.map((record) => record.u2);
  const u1 = records.map((record) => record.u1);
  const maxCount = Math.max(...endpointCounts);
  const real = scoreValues("real-primes", u2, endpointCounts, u1);
  const shuffleControls = seeds.map((seed) => scoreValues(
    `trace-shuffle-${seed}`,
    shuffle(u2, seed),
    endpointCounts,
  ));
  const bootstrapControls = seeds.map((seed) => scoreValues(
    `observed-trace-bootstrap-${seed}`,
    sampleObserved(u2, maxCount, seed ^ 0x9e3779b9),
    endpointCounts,
  ));
  const satoTateControls = seeds.map((seed) => scoreValues(
    `sato-tate-${seed}`,
    sampleSatoTateU2(maxCount, seed ^ 0x517cc1b7),
    endpointCounts,
  ));
  const cramerIndexControls = seeds.map((seed) => {
    const counts = endpointCountsForLabels(cramerPrimes(N, seed));
    const values = sampleObserved(u2, Math.max(...counts), seed ^ 0xbb67ae85);
    return scoreValues(`cramer-index-${seed}`, values, counts);
  });
  return {
    curve,
    endpointCounts,
    recordCount: records.length,
    traceSummary: {
      u1Mean: mean(u1),
      u2Mean: mean(u2),
      u1Range: range(u1),
      u2Range: range(u2),
      hasseMaxRatio: Math.max(...records.map((record) => Math.abs(record.a) / (2 * Math.sqrt(record.p)))),
    },
    real,
    controls: {
      shuffle: shuffleControls,
      bootstrap: bootstrapControls,
      satoTate: satoTateControls,
      cramerIndex: cramerIndexControls,
    },
    summary: {
      shuffle: summarizeControls(shuffleControls),
      bootstrap: summarizeControls(bootstrapControls),
      satoTate: summarizeControls(satoTateControls),
      cramerIndex: summarizeControls(cramerIndexControls),
    },
    holdout: {
      real: real.blocks.at(-1),
      shuffle: holdoutSummary(shuffleControls),
      bootstrap: holdoutSummary(bootstrapControls),
      satoTate: holdoutSummary(satoTateControls),
      cramerIndex: holdoutSummary(cramerIndexControls),
    },
    namedComposites: namedCompositeChecks(),
    sampleRecords: records.slice(0, 12),
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
    { id: "real Z2", color: "#67e8f9", rows: realRows.map((row, i) => ({ x: i, y: row.z2 })) },
    { id: "real max |Z2|", color: "#fbbf24", rows: realRows.map((row, i) => ({ x: i, y: row.maxAbsZ2 })) },
    { id: "shuffle mean max", color: "#a78bfa", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.shuffle.map((run) => run.rows[i].maxAbsZ2)) })) },
    { id: "bootstrap mean max", color: "#34d399", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.bootstrap.map((run) => run.rows[i].maxAbsZ2)) })) },
    { id: "Sato-Tate mean max", color: "#fb7185", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.satoTate.map((run) => run.rows[i].maxAbsZ2)) })) },
    { id: "Cramer-index mean max", color: "#f97316", rows: realRows.map((_row, i) => ({ x: i, y: mean(report.controls.cramerIndex.map((run) => run.rows[i].maxAbsZ2)) })) },
  ];
  const allY = series.flatMap((entry) => entry.rows.map((row) => row.y));
  const yMin = Math.min(-1, ...allY) * 1.1;
  const yMax = Math.max(1, ...allY) * 1.1;
  const xOf = (point) => margin.left + (point.x / Math.max(1, realRows.length - 1)) * plotW;
  const yOf = (point) => margin.top + (1 - (point.y - yMin) / (yMax - yMin)) * plotH;
  const pathFor = (rows) => rows.map((point) => `${xOf(point).toFixed(2)},${yOf(point).toFixed(2)}`).join(" ");
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
    return `<polyline points="${pathFor(entry.rows)}" fill="none" stroke="${entry.color}" stroke-width="3"/>${dots}`;
  }).join("\n");
  const legend = series.map((entry, i) => {
    const x = margin.left + (i % 3) * 230;
    const y = 38 + Math.floor(i / 3) * 18;
    return `<text x="${x}" y="${y}" fill="${entry.color}" font-size="13">${entry.id}</text>`;
  }).join("\n");
  const final = report.real.rows.at(-1);
  const notes = [
    `curve ${report.curve.label}`,
    `good primes ${report.recordCount}`,
    `real final Z2 ${fmt(final.z2)}`,
    `real max |Z2| ${fmt(final.maxAbsZ2)}`,
    `shuffle max ${fmt(report.summary.shuffle.maxAbsZ2[0])}..${fmt(report.summary.shuffle.maxAbsZ2[1])}`,
    `ST max ${fmt(report.summary.satoTate.maxAbsZ2[0])}..${fmt(report.summary.satoTate.maxAbsZ2[1])}`,
    `Cramer-index max ${fmt(report.summary.cramerIndex.maxAbsZ2[0])}..${fmt(report.summary.cramerIndex.maxAbsZ2[1])}`,
  ].map((text, i) => `<text x="${width - 290}" y="${110 + i * 26}" fill="#cbd5e1" font-size="13">${text}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Elliptic Hasse-trace moment audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 38}" fill="#94a3b8" font-size="13">Z2: cumulative sum of a_p^2/p - 1, normalized by sqrt(good-prime count).</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Elliptic Hasse-trace moment audit", "");
  lines.push(`Curve: \`${report.curve.label}\`; bad primes: ${report.curve.badPrimes.join(", ")}.`, "");
  lines.push("Candidate: `U2(p)=a_p^2/p-1`; `Z2(N)=sum U2(p)/sqrt(count)`.", "");
  lines.push("## Real endpoint trace", "");
  lines.push("| N | good primes | sum U2 | Z2 | max |Z2| | sum U1 | Z1 |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.real.rows) {
    lines.push(`| ${row.N} | ${row.count} | ${fmt(row.sumU2)} | ${fmt(row.z2)} | ${fmt(row.maxAbsZ2)} | ${fmt(row.sumU1)} | ${fmt(row.z1)} |`);
  }
  lines.push("");
  lines.push("Endpoint controls, 15 seeds:");
  lines.push("");
  lines.push("| control | count range | final Z2 range | final |Z2| range | max |Z2| range | theta range |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const [name, summary] of Object.entries(report.summary)) {
    lines.push(`| ${name} | ${summary.count[0]}..${summary.count[1]} | ${fmt(summary.z2[0])}..${fmt(summary.z2[1])} | ${fmt(summary.absZ2[0])}..${fmt(summary.absZ2[1])} | ${fmt(summary.maxAbsZ2[0])}..${fmt(summary.maxAbsZ2[1])} | ${fmt(summary.thetaMaxAbsU2[0])}..${fmt(summary.thetaMaxAbsU2[1])} |`);
  }
  lines.push("");
  lines.push("Fresh holdout block:");
  lines.push("");
  lines.push("| object | count/range | Z2/range | |Z2| range |");
  lines.push("| --- | ---: | ---: | ---: |");
  lines.push(`| real | ${report.holdout.real.count} | ${fmt(report.holdout.real.z2)} | ${fmt(Math.abs(report.holdout.real.z2))} |`);
  for (const key of ["shuffle", "bootstrap", "satoTate", "cramerIndex"]) {
    const row = report.holdout[key];
    lines.push(`| ${key} | ${row.count[0]}..${row.count[1]} | ${fmt(row.z2[0])}..${fmt(row.z2[1])} | ${fmt(row.absZ2[0])}..${fmt(row.absZ2[1])} |`);
  }
  lines.push("");
  lines.push("Trace sanity:");
  lines.push("");
  lines.push(`- mean U1: \`${fmt(report.traceSummary.u1Mean)}\``);
  lines.push(`- mean U2: \`${fmt(report.traceSummary.u2Mean)}\``);
  lines.push(`- max |a_p|/(2sqrt(p)): \`${fmt(report.traceSummary.hasseMaxRatio)}\``);
  lines.push("");
  lines.push("Named composite checks:");
  lines.push("");
  lines.push("| n | prime field? | good prime? | reason |");
  lines.push("| ---: | --- | --- | --- |");
  for (const row of report.namedComposites) {
    lines.push(`| ${row.n} | ${row.primeField ? "yes" : "no"} | ${row.goodPrime ? "yes" : "no"} | ${row.reason} |`);
  }
  lines.push("");
  lines.push("Factor check:");
  lines.push("");
  lines.push("This does not telescope to `theta`, `psi`, or `M`; it is a bounded Frobenius-trace statistic. A break occurs if observed-trace shuffles, Sato-Tate samples, or Cramer-index resampling reproduce the excursion, because then the line is just generic trace-distribution noise rather than prime regularity.");
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
const integer = audit();
const paths = {
  json: path.join(outDir, `elliptic-hasse-trace-${N}.json`),
  md: path.join(outDir, `elliptic-hasse-trace-${N}.md`),
  svg: path.join(outDir, `elliptic-hasse-trace-${N}.svg`),
};
const report = {
  candidate: "elliptic Hasse-trace moment line",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  seeds,
  ...integer,
  paths,
};
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  endpoint: report.real.rows.at(-1),
  traceSummary: report.traceSummary,
  controls: report.summary,
  holdout: report.holdout,
  paths,
}, null, 2));
