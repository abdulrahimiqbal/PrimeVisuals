#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildPolynomialUniverse } from "../src/core/ffield.js";
import { primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 24);
const q3MaxDegree = Number(process.argv[5] || 15);
const seeds = [12345, 271828, 314159, 161803, 424242];
const harmonics = 8;
const TAU = 2 * Math.PI;
const integerEndpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));

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

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function summarize(values) {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  return { n, mean, sd: Math.sqrt(variance), range: range(values) };
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
  return { slope: sxy / (sxx || 1), intercept: my - (sxy / (sxx || 1)) * mx };
}

function exponent(rows, key) {
  const fitRows = rows.filter((r) => r.labels > 2 && r[key] > 0);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((r) => Math.log(r.labels)),
    fitRows.map((r) => Math.log(r[key])),
  ).slope;
}

function sampleExactRange(lo, hi, count, seed) {
  const random = rng(seed);
  const chosen = new Set();
  const span = hi - lo;
  if (count > span) throw new Error(`cannot sample ${count} labels from ${span} integers in (${lo}, ${hi}]`);
  for (let j = span - count + 1; j <= span; j++) {
    const t = 1 + Math.floor(random() * j);
    chosen.add(chosen.has(t) ? j : t);
  }
  return Array.from(chosen, (offset) => lo + offset).sort((a, b) => a - b);
}

function sampleExactFromCandidates(candidates, count, seed, label) {
  const random = rng(seed);
  const chosen = new Set();
  if (count > candidates.length) {
    throw new Error(`cannot sample ${count} labels from ${candidates.length} ${label} candidates`);
  }
  for (let j = candidates.length - count + 1; j <= candidates.length; j++) {
    const t = Math.floor(random() * j);
    chosen.add(chosen.has(t) ? j - 1 : t);
  }
  return Array.from(chosen, (idx) => candidates[idx]).sort((a, b) => a - b);
}

function sampleExactLowers(size, count, seed, acceptLower) {
  const random = rng(seed);
  const chosen = new Set();
  let guard = 0;
  while (chosen.size < count) {
    const lower = Math.floor(random() * size);
    if (acceptLower(lower)) chosen.add(lower);
    guard++;
    if (guard > count * 200 + size * 20) {
      throw new Error(`could not sample ${count} polynomial labels from ${size} candidates`);
    }
  }
  return Array.from(chosen).sort((a, b) => a - b);
}

function phaseCells(values) {
  const gapCount = Math.max(0, values.length - 1);
  const re = new Float64Array(harmonics);
  const im = new Float64Array(harmonics);
  if (gapCount < 1) return { re, im, gapCount, meanGap: 0 };
  let totalGap = 0;
  for (let i = 0; i < gapCount; i++) totalGap += values[i + 1] - values[i];
  const meanGap = totalGap / gapCount;
  for (let i = 0; i < gapCount; i++) {
    const g = values[i + 1] - values[i];
    for (let h = 1; h <= harmonics; h++) {
      const theta = TAU * h * g / meanGap;
      re[h - 1] += Math.cos(theta);
      im[h - 1] += Math.sin(theta);
    }
  }
  for (let h = 0; h < harmonics; h++) {
    re[h] /= gapCount;
    im[h] /= gapCount;
  }
  return { re, im, gapCount, meanGap };
}

function meanCells(cells, skip = -1) {
  const re = new Float64Array(harmonics);
  const im = new Float64Array(harmonics);
  let n = 0;
  for (let i = 0; i < cells.length; i++) {
    if (i === skip) continue;
    n++;
    for (let h = 0; h < harmonics; h++) {
      re[h] += cells[i].re[h];
      im[h] += cells[i].im[h];
    }
  }
  for (let h = 0; h < harmonics; h++) {
    re[h] /= n || 1;
    im[h] /= n || 1;
  }
  return { re, im };
}

function cellNormDiff(a, b) {
  let sum = 0;
  for (let h = 0; h < harmonics; h++) {
    sum += (a.re[h] - b.re[h]) ** 2 + (a.im[h] - b.im[h]) ** 2;
  }
  return Math.sqrt(sum);
}

function cellRawNorm(a) {
  let sum = 0;
  for (let h = 0; h < harmonics; h++) sum += a.re[h] ** 2 + a.im[h] ** 2;
  return Math.sqrt(sum);
}

function leaveOneOutNorms(cells) {
  return cells.map((cell, i) => cellNormDiff(cell, meanCells(cells, i)));
}

function summarizeSurface(name, labels, ordinaryControls, primaryControls, compositeControls) {
  const realCells = phaseCells(labels);
  const ordinaryCells = ordinaryControls.map(phaseCells);
  const primaryCells = primaryControls.map(phaseCells);
  const compositeCells = compositeControls.map(phaseCells);
  const ordinaryBaseline = meanCells(ordinaryCells);
  const primaryBaseline = meanCells(primaryCells);
  const compositeBaseline = meanCells(compositeCells);
  const primaryNorm = cellNormDiff(realCells, primaryBaseline);
  return {
    name,
    labels: labels.length,
    gaps: realCells.gapCount,
    meanGap: realCells.meanGap,
    rawNorm: cellRawNorm(realCells),
    ordinaryNorm: cellNormDiff(realCells, ordinaryBaseline),
    primaryNorm,
    primarySqrtScaled: primaryNorm * Math.sqrt(Math.max(1, realCells.gapCount)),
    compositeNorm: cellNormDiff(realCells, compositeBaseline),
    ordinaryControl: summarize(leaveOneOutNorms(ordinaryCells)),
    primaryControl: summarize(leaveOneOutNorms(primaryCells)),
    compositeControl: summarize(leaveOneOutNorms(compositeCells)),
    cells: Array.from({ length: harmonics }, (_, i) => ({
      h: i + 1,
      re: realCells.re[i],
      im: realCells.im[i],
      primaryRe: primaryBaseline.re[i],
      primaryIm: primaryBaseline.im[i],
    })),
  };
}

function integerBlockRows() {
  const isp = sieve(N);
  const primes = primesUpTo(N);
  const rows = [];
  let lo = 1;
  for (const hi of integerEndpoints) {
    const labels = primes.filter((p) => p > lo && p <= hi);
    const count = labels.length;
    const wheelCandidates = [];
    const compositeCandidates = [];
    for (let n = lo + 1; n <= hi; n++) {
      if (gcd(n, 210) !== 1) continue;
      wheelCandidates.push(n);
      if (!isp[n]) compositeCandidates.push(n);
    }
    const ordinary = seeds.map((seed) => sampleExactRange(lo, hi, count, seed));
    const wheel = seeds.map((seed) => sampleExactFromCandidates(wheelCandidates, count, seed ^ 0x51ed, "W=210"));
    const composite = seeds.map((seed) => sampleExactFromCandidates(compositeCandidates, count, seed ^ 0x9e3779b9, "W=210 composite"));
    rows.push({
      lo,
      hi,
      ...summarizeSurface(`Z ${lo}..${hi}`, labels, ordinary, wheel, composite),
    });
    lo = hi;
  }
  return rows;
}

function fieldDegreeRows(q, degrees) {
  const universe = buildPolynomialUniverse(q, Math.max(...degrees));
  return degrees.map((degree) => {
    const lead = universe.pow[degree];
    const flags = universe.irreducibleFlagsByDegree[degree];
    const labels = universe.irreduciblesByDegree[degree].map((poly) => poly - lead);
    const count = labels.length;
    const ordinary = seeds.map((seed) => sampleExactLowers(universe.pow[degree], count, seed ^ (q << 16) ^ degree, () => true));
    const reducible = seeds.map((seed) => sampleExactLowers(universe.pow[degree], count, seed ^ 0x7f4a7c15 ^ (q << 16) ^ degree, (lower) => !flags[lower]));
    return {
      q,
      degree,
      ...summarizeSurface(`F_${q}[t] degree ${degree}`, labels, ordinary, ordinary, reducible),
    };
  });
}

function mdRows(rows, firstColumn) {
  return rows.map((r) => `| ${firstColumn(r)} | ${r.labels} | ${r.meanGap.toFixed(6)} | ${r.primaryNorm.toFixed(6)} | ${r.primarySqrtScaled.toFixed(6)} | ${r.primaryControl.range[0].toFixed(6)} .. ${r.primaryControl.range[1].toFixed(6)} | ${r.compositeNorm.toFixed(6)} | ${r.compositeControl.range[0].toFixed(6)} .. ${r.compositeControl.range[1].toFixed(6)} |`).join("\n");
}

function svg(integerRows, q2Rows, q3Rows) {
  const width = 1040, height = 620, pad = 64;
  const series = [
    { name: "Z vs W210 random", rows: integerRows, color: "#7dd3fc" },
    { name: "F2[t] vs random monic", rows: q2Rows, color: "#fbbf24" },
    { name: "F3[t] vs random monic", rows: q3Rows, color: "#f472b6" },
  ];
  const all = series.flatMap((s) => s.rows.map((r, i) => ({ i, y: r.primaryNorm })));
  const maxY = Math.max(...all.map((p) => p.y), 0.01) * 1.15;
  const xScale = (i) => pad + (i / 4) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y / maxY) * (height - 2 * pad);
  const paths = series.map((s) => {
    const d = s.rows.map((r, i) => `${i ? "L" : "M"} ${xScale(i).toFixed(2)} ${yScale(r.primaryNorm).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3"/>`;
  }).join("\n");
  const points = series.flatMap((s) => s.rows.map((r, i) => `<circle cx="${xScale(i).toFixed(2)}" cy="${yScale(r.primaryNorm).toFixed(2)}" r="4" fill="${s.color}"/>`)).join("\n");
  const legend = series.map((s, i) => `<text x="${pad}" y="${26 + i * 18}" fill="${s.color}">${s.name}</text>`).join("\n");
  const axis = `<line x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}" stroke="#64748b"/>
<line x1="${pad}" x2="${pad}" y1="${pad}" y2="${height - pad}" stroke="#64748b"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
${axis}
${paths}
${points}
<g font-family="Menlo, Consolas, monospace" font-size="12">
${legend}
<text x="${pad}" y="${height - 22}" fill="#94a3b8">gap-phase residual surface norm after cell-wise random-label baseline subtraction</text>
<text x="${width - pad - 170}" y="${height - 22}" fill="#94a3b8">five growing blocks/degrees</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

const q2Start = Math.max(1, q2MaxDegree - 4);
const q3Start = Math.max(1, q3MaxDegree - 4);
const integerRows = integerBlockRows();
const q2Rows = fieldDegreeRows(2, Array.from({ length: 5 }, (_, i) => q2Start + i));
const q3Rows = fieldDegreeRows(3, Array.from({ length: 5 }, (_, i) => q3Start + i));

const output = {
  candidate: "two-universes normalized gap-phase residual surface",
  N,
  seeds,
  harmonics,
  integerRows,
  q2Rows,
  q3Rows,
  exponent: {
    integerPrimaryNorm: exponent(integerRows, "primaryNorm"),
    integerPrimarySqrtScaled: exponent(integerRows, "primarySqrtScaled"),
    q2PrimaryNorm: exponent(q2Rows, "primaryNorm"),
    q2PrimarySqrtScaled: exponent(q2Rows, "primarySqrtScaled"),
    q3PrimaryNorm: exponent(q3Rows, "primaryNorm"),
    q3PrimarySqrtScaled: exponent(q3Rows, "primarySqrtScaled"),
  },
};

const jsonPath = path.join(outDir, `gapphase-surface-audit-${N}.json`);
const mdPath = path.join(outDir, `gapphase-surface-audit-${N}.md`);
const svgPath = path.join(outDir, `gapphase-surface-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integerRows, q2Rows, q3Rows));

const md = `# gap-phase residual surface audit

Candidate:
\`S_U(d,j)=mean exp(2*pi*i*j*gap/meanGap_d)\`, subtract matched random-label
baseline cell-by-cell for harmonics \`j=1..${harmonics}\`, then collapse the
residual surface by L2 norm.

Primary baselines: integers use W=210 random labels; function fields use
random monic labels of the same degree and count. Composite controls are
W=210 composite-only labels for integers and random reducible monics for
function fields.

Exponent fits over labels:

| universe | primary norm theta | sqrt-scaled theta |
| --- | ---: | ---: |
| Z | ${output.exponent.integerPrimaryNorm.toFixed(6)} | ${output.exponent.integerPrimarySqrtScaled.toFixed(6)} |
| F_2[t] | ${output.exponent.q2PrimaryNorm.toFixed(6)} | ${output.exponent.q2PrimarySqrtScaled.toFixed(6)} |
| F_3[t] | ${output.exponent.q3PrimaryNorm.toFixed(6)} | ${output.exponent.q3PrimarySqrtScaled.toFixed(6)} |

## Integers

| block | labels | mean gap | real vs primary | sqrt-scaled | primary control range | real vs composite | composite control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdRows(integerRows, (r) => `${r.lo}..${r.hi}`)}

## F_2[t]

| degree | labels | mean encoding gap | real vs primary | sqrt-scaled | primary control range | real vs reducible | reducible control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdRows(q2Rows, (r) => r.degree)}

## F_3[t]

| degree | labels | mean encoding gap | real vs primary | sqrt-scaled | primary control range | real vs reducible | reducible control range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdRows(q3Rows, (r) => r.degree)}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  exponent: output.exponent,
  integerLast: integerRows.at(-1),
  q2Last: q2Rows.at(-1),
  q3Last: q3Rows.at(-1),
}, null, 2));
