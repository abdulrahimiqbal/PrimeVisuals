#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  chowlaTwoPoint,
  polyAdd,
} from "../src/core/ffield.js";
import { mobiusUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 24);
const q3MaxDegree = Number(process.argv[5] || 15);
const shifts = [1, 2, 3, 4, 5, 6, 7, 8];
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));
const maxShift = Math.max(...shifts);

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

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function summarize(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return { mean, sd: Math.sqrt(variance), range: range(values) };
}

function energyFromNormalized(normalized) {
  return Math.sqrt(normalized.reduce((sum, value) => sum + value * value, 0) / normalized.length);
}

function linearFit(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  const slope = sxy / (sxx || 1);
  return { slope, intercept: my - slope * mx };
}

function exponent(rows, key, scaleKey) {
  const fitRows = rows.filter((r) => r[key] > 0 && r[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((r) => Math.log(r[scaleKey])),
    fitRows.map((r) => Math.log(r[key])),
  ).slope;
}

function randomizeMobiusSigns(mu, seed) {
  const random = rng(seed);
  const signs = new Int8Array(mu.length);
  for (let i = 1; i < mu.length; i++) {
    if (mu[i] !== 0) signs[i] = random() < 0.5 ? -1 : 1;
  }
  return signs;
}

function summarizeIntegerSequence(name, values) {
  const sums = new Int32Array(shifts.length);
  const recorded = Array.from({ length: endpoints.length }, () => new Int32Array(shifts.length));
  const endpointIndex = new Int8Array(shifts.length);

  for (let n = 1; n <= N; n++) {
    for (let hIndex = 0; hIndex < shifts.length; hIndex++) {
      const h = shifts[hIndex];
      if (n + h >= values.length || n + h > N) continue;
      sums[hIndex] += (values[n] || 0) * (values[n + h] || 0);
      while (endpointIndex[hIndex] < endpoints.length && n === endpoints[endpointIndex[hIndex]] - h) {
        recorded[endpointIndex[hIndex]][hIndex] = sums[hIndex];
        endpointIndex[hIndex]++;
      }
    }
  }

  const rows = endpoints.map((endpoint, i) => {
    const normalized = shifts.map((_h, hIndex) => recorded[i][hIndex] / Math.sqrt(endpoint));
    return {
      N: endpoint,
      labels: endpoint,
      sums: Array.from(recorded[i]),
      normalized,
      energy: energyFromNormalized(normalized),
      maxAbsCell: Math.max(...normalized.map(Math.abs)),
    };
  });

  const blocks = rows.map((row, i) => {
    const previous = i === 0 ? null : rows[i - 1];
    const lo = i === 0 ? 1 : endpoints[i - 1];
    const hi = row.N;
    const length = hi - lo;
    const sumsBlock = shifts.map((_h, hIndex) => row.sums[hIndex] - (previous ? previous.sums[hIndex] : 0));
    const normalized = sumsBlock.map((value) => value / Math.sqrt(length));
    return {
      lo,
      hi,
      labels: length,
      sums: sumsBlock,
      normalized,
      energy: energyFromNormalized(normalized),
      maxAbsCell: Math.max(...normalized.map(Math.abs)),
    };
  });

  return {
    name,
    rows,
    blocks,
    exponent: {
      energy: exponent(rows, "energy", "labels"),
      maxAbsCell: exponent(rows, "maxAbsCell", "labels"),
    },
  };
}

function integerAudit() {
  const mu = mobiusUpTo(N + maxShift);
  const real = summarizeIntegerSequence("Z-mobius", mu);
  const controls = seeds.map((seed) => summarizeIntegerSequence(`random-squarefree-signs-${seed}`, randomizeMobiusSigns(mu, seed)));
  const lastControls = controls.map((control) => control.rows.at(-1));
  const blockControls = controls.map((control) => control.blocks.map((row) => row.energy));
  return {
    real,
    controls,
    summary: {
      energyRange: range(lastControls.map((row) => row.energy)),
      maxAbsCellRange: range(lastControls.map((row) => row.maxAbsCell)),
      thetaRange: range(controls.map((control) => control.exponent.energy)),
      blockEnergyRanges: real.blocks.map((_row, i) => range(blockControls.map((rows) => rows[i]))),
    },
  };
}

function fieldRealRows(q, maxDegree) {
  const startDegree = Math.max(1, maxDegree - 4);
  const degreeRange = Array.from({ length: 5 }, (_, i) => startDegree + i);
  const curves = shifts.map((shift) => ({ shift, values: chowlaTwoPoint(q, maxDegree, shift) }));
  return degreeRange.map((degree) => {
    const scale = Math.sqrt(q ** degree);
    const normalized = curves.map(({ values }) => values[degree] * scale);
    const sums = curves.map(({ values }) => values[degree] * (q ** degree));
    return {
      q,
      degree,
      labels: q ** degree,
      sums,
      normalized,
      energy: energyFromNormalized(normalized),
      maxAbsCell: Math.max(...normalized.map(Math.abs)),
    };
  });
}

function fieldRandomControlTop(q, degree, seed) {
  const universe = buildPolynomialUniverse(q, degree);
  const size = universe.pow[degree];
  const lead = universe.pow[degree];
  const mu = universe.muByDegree[degree];
  const random = rng(seed);
  const signs = new Int8Array(size);
  for (let lower = 0; lower < size; lower++) {
    if (mu[lower] !== 0) signs[lower] = random() < 0.5 ? -1 : 1;
  }
  const sums = shifts.map((shift) => {
    let sum = 0;
    for (let lower = 0; lower < size; lower++) {
      const mate = polyAdd(lead + lower, shift, q) - lead;
      sum += signs[lower] * signs[mate];
    }
    return sum;
  });
  const normalized = sums.map((sum) => sum / Math.sqrt(size));
  return {
    q,
    degree,
    seed,
    labels: size,
    sums,
    normalized,
    energy: energyFromNormalized(normalized),
    maxAbsCell: Math.max(...normalized.map(Math.abs)),
  };
}

function fieldAudit(q, maxDegree) {
  const rows = fieldRealRows(q, maxDegree);
  const controls = seeds.map((seed) => fieldRandomControlTop(q, maxDegree, seed));
  return {
    q,
    rows,
    controls,
    exponent: {
      energy: exponent(rows, "energy", "labels"),
      maxAbsCell: exponent(rows, "maxAbsCell", "labels"),
    },
    summary: {
      energyRange: range(controls.map((row) => row.energy)),
      maxAbsCellRange: range(controls.map((row) => row.maxAbsCell)),
    },
  };
}

function mdRows(rows, firstColumn) {
  return rows.map((r) => `| ${firstColumn(r)} | ${r.labels} | ${r.energy.toFixed(6)} | ${r.maxAbsCell.toFixed(6)} | ${r.normalized.map((v) => v.toFixed(3)).join(", ")} |`).join("\n");
}

function mdControlRows(rows, firstColumn) {
  return rows.map((r) => `| ${firstColumn(r)} | ${r.energy.toFixed(6)} | ${r.maxAbsCell.toFixed(6)} | ${r.normalized.map((v) => v.toFixed(3)).join(", ")} |`).join("\n");
}

function svg(integerRows, q2Rows, q3Rows) {
  const width = 1040, height = 620, pad = 64;
  const series = [
    { name: "Z mu-shift energy", rows: integerRows, color: "#7dd3fc" },
    { name: "F2[t] mu-shift energy", rows: q2Rows, color: "#fbbf24" },
    { name: "F3[t] mu-shift energy", rows: q3Rows, color: "#f472b6" },
  ];
  const maxY = Math.max(...series.flatMap((s) => s.rows.map((r) => r.energy)), 1) * 1.12;
  const xScale = (i) => pad + (i / 4) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y / maxY) * (height - 2 * pad);
  const paths = series.map((s) => {
    const d = s.rows.map((r, i) => `${i ? "L" : "M"} ${xScale(i).toFixed(2)} ${yScale(r.energy).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3"/>`;
  }).join("\n");
  const points = series.flatMap((s) => s.rows.map((r, i) => `<circle cx="${xScale(i).toFixed(2)}" cy="${yScale(r.energy).toFixed(2)}" r="4" fill="${s.color}"/>`)).join("\n");
  const legend = series.map((s, i) => `<text x="${pad}" y="${26 + i * 18}" fill="${s.color}">${s.name}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}" stroke="#64748b"/>
<line x1="${pad}" x2="${pad}" y1="${pad}" y2="${height - pad}" stroke="#64748b"/>
${paths}
${points}
<g font-family="Menlo, Consolas, monospace" font-size="12">
${legend}
<text x="${pad}" y="${height - 22}" fill="#94a3b8">L2 energy of mu(a)mu(a+h) cells for h=1..8, square-root normalized</text>
<text x="${width - pad - 160}" y="${height - 22}" fill="#94a3b8">five growing scales</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[muchowla] integer Mobius to ${N + maxShift}`);
const integer = integerAudit();
console.error(`[muchowla] F_2[t] to degree ${q2MaxDegree}`);
const q2 = fieldAudit(2, q2MaxDegree);
console.error(`[muchowla] F_3[t] to degree ${q3MaxDegree}`);
const q3 = fieldAudit(3, q3MaxDegree);

const output = {
  candidate: "two-universes Mobius additive-shift energy",
  N,
  shifts,
  seeds,
  integer,
  q2,
  q3,
};

const jsonPath = path.join(outDir, `muchowla-shift-audit-${N}.json`);
const mdPath = path.join(outDir, `muchowla-shift-audit-${N}.md`);
const svgPath = path.join(outDir, `muchowla-shift-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer.real.rows, q2.rows, q3.rows));

const md = `# Mobius additive-shift energy audit

Candidate:
\`E_U(scale)=sqrt(mean_{h=1..8}(sum_a mu(a)mu(a+h)/sqrt(size))^2)\`.

This uses fixed additive shifts, not consecutive ordering.

## Integer cumulative

Energy exponent over endpoints: \`${integer.real.exponent.energy.toFixed(6)}\`.
Random sign-control energy range at \`N=${N}\`: \`${integer.summary.energyRange[0].toFixed(6)}..${integer.summary.energyRange[1].toFixed(6)}\`.

| N | labels | energy | maxAbs cell | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | --- |
${mdRows(integer.real.rows, (r) => r.N)}

## Integer dyadic blocks

| block | labels | energy | maxAbs cell | normalized cells h=1..8 |
| --- | ---: | ---: | ---: | --- |
${mdRows(integer.real.blocks, (r) => `${r.lo}..${r.hi}`)}

Block random-control energy ranges:

| block | control energy range |
| --- | ---: |
${integer.real.blocks.map((r, i) => `| ${r.lo}..${r.hi} | ${integer.summary.blockEnergyRanges[i][0].toFixed(6)} .. ${integer.summary.blockEnergyRanges[i][1].toFixed(6)} |`).join("\n")}

## F_2[t]

Energy exponent over degrees: \`${q2.exponent.energy.toFixed(6)}\`.
Top-degree random sign-control energy range: \`${q2.summary.energyRange[0].toFixed(6)}..${q2.summary.energyRange[1].toFixed(6)}\`.

| degree | monics | energy | maxAbs cell | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | --- |
${mdRows(q2.rows, (r) => r.degree)}

Top-degree random controls:

| seed | energy | maxAbs cell | normalized cells h=1..8 |
| ---: | ---: | ---: | --- |
${mdControlRows(q2.controls, (r) => r.seed)}

## F_3[t]

Energy exponent over degrees: \`${q3.exponent.energy.toFixed(6)}\`.
Top-degree random sign-control energy range: \`${q3.summary.energyRange[0].toFixed(6)}..${q3.summary.energyRange[1].toFixed(6)}\`.

| degree | monics | energy | maxAbs cell | normalized cells h=1..8 |
| ---: | ---: | ---: | ---: | --- |
${mdRows(q3.rows, (r) => r.degree)}

Top-degree random controls:

| seed | energy | maxAbs cell | normalized cells h=1..8 |
| ---: | ---: | ---: | --- |
${mdControlRows(q3.controls, (r) => r.seed)}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  integerLast: integer.real.rows.at(-1),
  integerControlRange: integer.summary.energyRange,
  q2Last: q2.rows.at(-1),
  q2ControlRange: q2.summary.energyRange,
  q3Last: q3.rows.at(-1),
  q3ControlRange: q3.summary.energyRange,
}, null, 2));
