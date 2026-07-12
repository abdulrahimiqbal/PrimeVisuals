#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  liouvilleTwoPoint,
  polyAdd,
  polynomialCompletelyMultiplicativeTables,
} from "../src/core/ffield.js";
import { liouvilleUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 2_000_000);
const outDir = process.argv[3] || "logs/frontierlab-artifacts";
const q2MaxDegree = Number(process.argv[4] || 20);
const q3MaxDegree = Number(process.argv[5] || 13);
const maxShift = Number(process.argv[6] || 32);
const shifts = Array.from({ length: maxShift }, (_, i) => i + 1);
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N]
  .map((x) => Math.max(256, Math.round(x)));

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

function fmt(x, digits = 6) {
  return Number.isFinite(x) ? x.toFixed(digits) : "n/a";
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
}

function stdev(values) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

function energy(values) {
  return Math.sqrt(mean(values.map((v) => v * v)));
}

function cosine(a, b) {
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return dot / Math.sqrt((aa || 1) * (bb || 1));
}

function linearFit(xs, ys) {
  const mx = mean(xs), my = mean(ys);
  let sxx = 0, sxy = 0;
  for (let i = 0; i < xs.length; i++) {
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

function factorInfo(n) {
  let m = n;
  let rad = 1, omega = 0, bigomega = 0, squarefree = true, v2 = 0;
  for (let p = 2; p * p <= m; p += p === 2 ? 1 : 2) {
    if (m % p !== 0) continue;
    let e = 0;
    while (m % p === 0) {
      m = Math.floor(m / p);
      e++;
      bigomega++;
    }
    if (p === 2) v2 = e;
    if (e > 1) squarefree = false;
    omega++;
    rad *= p;
  }
  if (m > 1) {
    omega++;
    bigomega++;
    rad *= m;
  }
  return { h: n, rad, omega, bigomega, squarefree, v2, parity: bigomega % 2 ? "odd" : "even" };
}

function groupR2(values, featureFn) {
  const totalMean = mean(values);
  let sst = 0;
  for (const v of values) sst += (v - totalMean) ** 2;
  if (sst <= 1e-12) return { r2: 0, groups: [] };
  const groups = new Map();
  for (let i = 0; i < values.length; i++) {
    const key = String(featureFn(shifts[i]));
    const group = groups.get(key) || [];
    group.push(values[i]);
    groups.set(key, group);
  }
  let sse = 0;
  const rows = [];
  for (const [key, group] of groups) {
    const m = mean(group);
    rows.push({ key, n: group.length, mean: m, energy: energy(group) });
    for (const v of group) sse += (v - m) ** 2;
  }
  rows.sort((a, b) => String(a.key).localeCompare(String(b.key), undefined, { numeric: true }));
  return { r2: Math.max(0, 1 - sse / sst), groups: rows };
}

function bestFactorLaw(values) {
  const features = [
    { name: "Omega(h)", fn: (h) => factorInfo(h).bigomega },
    { name: "omega(h)", fn: (h) => factorInfo(h).omega },
    { name: "squarefree(h)", fn: (h) => factorInfo(h).squarefree ? "sf" : "sq" },
    { name: "v2(h)", fn: (h) => factorInfo(h).v2 },
    { name: "lambda(h)", fn: (h) => factorInfo(h).parity },
    { name: "rad(h)", fn: (h) => factorInfo(h).rad },
  ];
  return features
    .map((feature) => ({ feature: feature.name, ...groupR2(values, feature.fn) }))
    .sort((a, b) => b.r2 - a.r2)[0];
}

function rankOneFraction(rows) {
  const matrix = rows.map((row) => row.normalized);
  const rowCount = matrix.length;
  const gram = Array.from({ length: rowCount }, () => new Float64Array(rowCount));
  let trace = 0;
  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      let dot = 0;
      for (let k = 0; k < matrix[i].length; k++) dot += matrix[i][k] * matrix[j][k];
      gram[i][j] = dot;
    }
    trace += gram[i][i];
  }
  if (trace <= 1e-12) return 0;
  let v = new Float64Array(rowCount).fill(1 / Math.sqrt(rowCount));
  for (let iter = 0; iter < 40; iter++) {
    const next = new Float64Array(rowCount);
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < rowCount; j++) next[i] += gram[i][j] * v[j];
    }
    const norm = Math.hypot(...next) || 1;
    for (let i = 0; i < rowCount; i++) v[i] = next[i] / norm;
  }
  let lambda = 0;
  for (let i = 0; i < rowCount; i++) {
    let rowDot = 0;
    for (let j = 0; j < rowCount; j++) rowDot += gram[i][j] * v[j];
    lambda += v[i] * rowDot;
  }
  return lambda / trace;
}

function persistence(rows) {
  if (rows.length < 2) return 0;
  const cosines = [];
  for (let i = 1; i < rows.length; i++) cosines.push(cosine(rows[i - 1].normalized, rows[i].normalized));
  return mean(cosines.map(Math.abs));
}

function summarizeShiftField(name, values) {
  const sums = new Float64Array(shifts.length);
  const recorded = endpoints.map(() => new Float64Array(shifts.length));
  let endpointIndex = 0;
  const top = endpoints.at(-1);
  for (let n = 1; n <= top; n++) {
    for (let i = 0; i < shifts.length; i++) sums[i] += values[n] * values[n + shifts[i]];
    while (endpointIndex < endpoints.length && n === endpoints[endpointIndex]) {
      recorded[endpointIndex].set(sums);
      endpointIndex++;
    }
  }
  const rows = endpoints.map((endpoint, i) => {
    const normalized = Array.from(recorded[i], (sum) => sum / Math.sqrt(endpoint));
    return {
      N: endpoint,
      labels: endpoint,
      sums: Array.from(recorded[i]),
      normalized,
      energy: energy(normalized),
      maxAbsCell: Math.max(...normalized.map(Math.abs)),
    };
  });
  const blocks = rows.map((row, i) => {
    const previous = i === 0 ? null : rows[i - 1];
    const lo = i === 0 ? 1 : endpoints[i - 1] + 1;
    const hi = row.N;
    const labels = hi - lo + 1;
    const sumsBlock = row.sums.map((sum, h) => sum - (previous ? previous.sums[h] : 0));
    const normalized = sumsBlock.map((sum) => sum / Math.sqrt(labels));
    return {
      lo,
      hi,
      labels,
      sums: sumsBlock,
      normalized,
      energy: energy(normalized),
      maxAbsCell: Math.max(...normalized.map(Math.abs)),
    };
  });
  return {
    name,
    rows,
    blocks,
    persistence: persistence(rows),
    rankOneFraction: rankOneFraction(rows),
    exponent: {
      energy: exponent(rows, "energy", "labels"),
      maxAbsCell: exponent(rows, "maxAbsCell", "labels"),
    },
    factorLaw: bestFactorLaw(rows.at(-1).normalized),
  };
}

function randomCompletelyMultiplicativeSigns(nMax, seed) {
  const random = rng(seed);
  const values = new Int8Array(nMax + 1);
  const spf = new Int32Array(nMax + 1);
  const primes = [];
  values[1] = 1;
  for (let i = 2; i <= nMax; i++) {
    if (!spf[i]) {
      spf[i] = i;
      primes.push(i);
      values[i] = random() < 0.5 ? -1 : 1;
    }
    for (let k = 0; k < primes.length; k++) {
      const p = primes[k];
      const m = i * p;
      if (m > nMax || p > spf[i]) break;
      spf[m] = p;
      values[m] = values[i] * values[p];
      if (i % p === 0) break;
    }
  }
  return values;
}

function shuffledSigns(values, seed) {
  const random = rng(seed);
  const out = new Int8Array(values);
  for (let i = out.length - 1; i >= 2; i--) {
    const j = 1 + Math.floor(random() * i);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function controlSummary(controls) {
  const finalRows = controls.map((control) => control.rows.at(-1));
  const blockEnergies = controls.map((control) => control.blocks.map((row) => row.energy));
  return {
    energyRange: range(finalRows.map((row) => row.energy)),
    maxAbsCellRange: range(finalRows.map((row) => row.maxAbsCell)),
    energyMean: mean(finalRows.map((row) => row.energy)),
    energySd: stdev(finalRows.map((row) => row.energy)),
    blockEnergyRanges: controls[0].blocks.map((_row, i) => range(blockEnergies.map((rows) => rows[i]))),
  };
}

function integerAudit() {
  const values = liouvilleUpTo(N + maxShift);
  const real = summarizeShiftField("Z-liouville", values);
  const multiplicativeControls = seeds.map((seed) => summarizeShiftField(
    `random-completely-multiplicative-${seed}`,
    randomCompletelyMultiplicativeSigns(N + maxShift, seed),
  ));
  const shuffleControls = seeds.map((seed) => summarizeShiftField(
    `shuffled-liouville-${seed}`,
    shuffledSigns(values, seed),
  ));
  return {
    real,
    multiplicativeControls,
    shuffleControls,
    summary: {
      multiplicative: controlSummary(multiplicativeControls),
      shuffle: controlSummary(shuffleControls),
      combined: controlSummary([...multiplicativeControls, ...shuffleControls]),
    },
  };
}

function fieldRealRows(q, maxDegree) {
  const startDegree = Math.max(1, maxDegree - 4);
  const degreeRange = Array.from({ length: maxDegree - startDegree + 1 }, (_, i) => startDegree + i);
  const curves = shifts.map((shift) => ({ shift, values: liouvilleTwoPoint(q, maxDegree, shift) }));
  return degreeRange.map((degree) => {
    const labels = q ** degree;
    const normalized = curves.map(({ values }) => values[degree] * Math.sqrt(labels));
    const sums = curves.map(({ values }) => values[degree] * labels);
    return {
      q,
      degree,
      labels,
      sums,
      normalized,
      energy: energy(normalized),
      maxAbsCell: Math.max(...normalized.map(Math.abs)),
    };
  });
}

function fieldRandomMultiplicativeControlTop(q, degree, seed) {
  const universe = buildPolynomialUniverse(q, degree);
  const random = rng(seed);
  const primeSigns = new Map();
  for (let d = 1; d <= universe.maxDegree; d++) {
    for (const primePoly of universe.irreduciblesByDegree[d]) {
      primeSigns.set(primePoly, random() < 0.5 ? -1 : 1);
    }
  }
  const tables = polynomialCompletelyMultiplicativeTables(universe, (primePoly) => primeSigns.get(primePoly) || 1);
  const values = tables[degree];
  const lead = universe.pow[degree];
  const size = universe.pow[degree];
  const sums = shifts.map((shift) => {
    let sum = 0;
    for (let lower = 0; lower < size; lower++) {
      const mate = polyAdd(lead + lower, shift, q);
      sum += values[lower] * (mate >= lead && mate < lead + size ? values[mate - lead] : 0);
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
    energy: energy(normalized),
    maxAbsCell: Math.max(...normalized.map(Math.abs)),
  };
}

function fieldAudit(q, maxDegree) {
  const rows = fieldRealRows(q, maxDegree);
  const controls = seeds.map((seed) => fieldRandomMultiplicativeControlTop(q, maxDegree, seed));
  return {
    q,
    rows,
    controls,
    persistence: persistence(rows),
    rankOneFraction: rankOneFraction(rows),
    exponent: {
      energy: exponent(rows, "energy", "labels"),
      maxAbsCell: exponent(rows, "maxAbsCell", "labels"),
    },
    factorLaw: bestFactorLaw(rows.at(-1).normalized),
    summary: {
      energyRange: range(controls.map((row) => row.energy)),
      maxAbsCellRange: range(controls.map((row) => row.maxAbsCell)),
      energyMean: mean(controls.map((row) => row.energy)),
      energySd: stdev(controls.map((row) => row.energy)),
    },
  };
}

function compareWorlds(integerRows, fieldRows) {
  const integerFinal = integerRows.at(-1).normalized;
  const fieldFinal = fieldRows.at(-1).normalized;
  const residual = integerFinal.map((value, i) => value - fieldFinal[i]);
  return {
    residual,
    energy: energy(residual),
    maxAbsCell: Math.max(...residual.map(Math.abs)),
    cosine: cosine(integerFinal, fieldFinal),
    topCells: shifts.map((h, i) => ({ h, residual: residual[i], integer: integerFinal[i], field: fieldFinal[i], ...factorInfo(h) }))
      .sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual))
      .slice(0, 10),
  };
}

function frontierScore(integer, q2, q3) {
  const realEnergy = integer.real.rows.at(-1).energy;
  const combined = integer.summary.combined;
  const realVsNullZ = (realEnergy - combined.energyMean) / (combined.energySd || 1);
  const factorLaw = integer.real.factorLaw;
  const persistenceScore = integer.real.persistence;
  const lowRank = integer.real.rankOneFraction;
  const collapseQuality = factorLaw.r2;
  const crossWorldCoherence = Math.max(
    0,
    (cosine(integer.real.rows.at(-1).normalized, q2.rows.at(-1).normalized) +
      cosine(integer.real.rows.at(-1).normalized, q3.rows.at(-1).normalized)) / 2,
  );
  const statementSimplicity = factorLaw.groups.length <= 6 ? 1 : 0.35;
  const noveltyGate = 1;
  const candidateScore = Math.max(0, realVsNullZ / 3) *
    persistenceScore *
    lowRank *
    Math.max(0.05, collapseQuality) *
    Math.max(0.1, crossWorldCoherence) *
    statementSimplicity *
    noveltyGate;
  return {
    candidateScore,
    realVsNullZ,
    persistence: persistenceScore,
    residualLowRank: lowRank,
    collapseQuality,
    crossWorldCoherence,
    statementSimplicity,
    noveltyGate,
    promotion: realVsNullZ > 3 && persistenceScore > 0.65 && collapseQuality > 0.25
      ? "frontier-candidate"
      : "not-promoted",
  };
}

function mdRows(rows, firstColumn) {
  return rows.map((row) => `| ${firstColumn(row)} | ${row.labels} | ${fmt(row.energy)} | ${fmt(row.maxAbsCell)} | ${row.normalized.map((v) => fmt(v, 3)).join(", ")} |`).join("\n");
}

function mdControlRows(rows, firstColumn) {
  return rows.map((row) => `| ${firstColumn(row)} | ${fmt(row.energy)} | ${fmt(row.maxAbsCell)} | ${row.normalized.map((v) => fmt(v, 3)).join(", ")} |`).join("\n");
}

function mdTopCells(cells) {
  return cells.map((cell) => `| ${cell.h} | ${cell.rad} | ${cell.omega} | ${cell.bigomega} | ${cell.v2} | ${cell.squarefree ? "yes" : "no"} | ${fmt(cell.value ?? cell.residual, 6)} |`).join("\n");
}

function topShiftCells(values) {
  return shifts.map((h, i) => ({ h, value: values[i], ...factorInfo(h) }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 10);
}

function heatColor(v, clamp = 3) {
  const x = Math.max(-1, Math.min(1, v / clamp));
  if (x >= 0) {
    const b = Math.round(32 + 80 * (1 - x));
    const g = Math.round(88 + 80 * (1 - x));
    const r = Math.round(120 + 120 * x);
    return `rgb(${r},${g},${b})`;
  }
  const a = -x;
  const r = Math.round(42 + 50 * (1 - a));
  const g = Math.round(100 + 70 * (1 - a));
  const b = Math.round(150 + 95 * a);
  return `rgb(${r},${g},${b})`;
}

function heatmapPanel(rows, x, y, width, height, title, yLabelFn) {
  const cols = rows.length;
  const cellW = width / cols;
  const cellH = height / shifts.length;
  const rects = [];
  for (let c = 0; c < rows.length; c++) {
    for (let r = 0; r < shifts.length; r++) {
      const v = rows[c].normalized[r];
      rects.push(`<rect x="${(x + c * cellW).toFixed(2)}" y="${(y + r * cellH).toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(v)}"><title>${title} ${yLabelFn(rows[c])}, h=${shifts[r]}, z=${fmt(v, 4)}</title></rect>`);
    }
  }
  return `<g>
<text x="${x}" y="${y - 12}" fill="#e5e7eb" font-size="15" font-weight="700">${title}</text>
${rects.join("\n")}
<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="#475569"/>
</g>`;
}

function svg(integer, q2, q3, score) {
  const width = 1180, height = 760;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#071018"/>
<g font-family="Inter, ui-sans-serif, system-ui, sans-serif">
<text x="48" y="42" fill="#f8fafc" font-size="22" font-weight="750">FrontierLab Liouville correlation atlas</text>
<text x="48" y="67" fill="#94a3b8" font-size="13">C_h(scale)=sum lambda(a)lambda(a+h), square-root normalized; blue negative, red positive, clamp +/-3</text>
${heatmapPanel(integer.real.rows, 54, 108, 320, 520, "Z integer", (row) => `N=${row.N}`)}
${heatmapPanel(q2.rows, 430, 108, 290, 520, `F_${q2.q}[t]`, (row) => `degree=${row.degree}`)}
${heatmapPanel(q3.rows, 776, 108, 290, 520, `F_${q3.q}[t]`, (row) => `degree=${row.degree}`)}
<text x="54" y="675" fill="#e2e8f0" font-size="14">score ${fmt(score.candidateScore, 4)} · ${score.promotion} · real-vs-null z ${fmt(score.realVsNullZ, 3)} · persistence ${fmt(score.persistence, 3)} · factor R2 ${fmt(score.collapseQuality, 3)}</text>
<text x="54" y="703" fill="#94a3b8" font-size="12">Top integer energy ${fmt(integer.real.rows.at(-1).energy)}; random multiplicative control ${fmt(integer.summary.multiplicative.energyRange[0])}..${fmt(integer.summary.multiplicative.energyRange[1])}; shuffled ${fmt(integer.summary.shuffle.energyRange[0])}..${fmt(integer.summary.shuffle.energyRange[1])}</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[frontierlab] integer Liouville to ${N + maxShift}`);
const integer = integerAudit();
console.error(`[frontierlab] F_2[t] Liouville to degree ${q2MaxDegree}`);
const q2 = fieldAudit(2, q2MaxDegree);
console.error(`[frontierlab] F_3[t] Liouville to degree ${q3MaxDegree}`);
const q3 = fieldAudit(3, q3MaxDegree);
const q2Deviation = compareWorlds(integer.real.rows, q2.rows);
const q3Deviation = compareWorlds(integer.real.rows, q3.rows);
const score = frontierScore(integer, q2, q3);

const output = {
  candidate: "FrontierLab Liouville additive-shift residual atlas",
  object: "C_h(N)=sum_{n<=N} lambda(n)lambda(n+h)",
  baseline: "Chowla predicts zero mean for fixed nonzero h; square-root normalization tests residual scale.",
  residual: "C_h(N)/sqrt(N), with arithmetic-deviation fields against F_q[t] top-degree analogues.",
  nulls: ["random completely multiplicative signs", "shuffled integer Liouville", "random completely multiplicative polynomial signs"],
  N,
  shifts,
  seeds,
  endpoints,
  integer,
  q2,
  q3,
  deviations: { q2: q2Deviation, q3: q3Deviation },
  score,
};

const slug = `frontierlab-liouville-atlas-${N}-h${maxShift}-q2d${q2MaxDegree}-q3d${q3MaxDegree}`;
const jsonPath = path.join(outDir, `${slug}.json`);
const mdPath = path.join(outDir, `${slug}.md`);
const svgPath = path.join(outDir, `${slug}.svg`);

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer, q2, q3, score));

const integerTop = topShiftCells(integer.real.rows.at(-1).normalized);

const md = `# FrontierLab Liouville correlation atlas

Candidate object:

\`\`\`text
OBJECT:    C_h(N)=sum_{n<=N} lambda(n)lambda(n+h), h=1..${maxShift}
BASELINE:  Chowla fixed-shift cancellation, centered at 0
RESIDUAL:  C_h(N)/sqrt(N)
NULLS:     random completely multiplicative signs; shuffled lambda; random polynomial multiplicative signs
STATEMENT: search for a persistent factorization-type law or rigid shift-space boundary after null comparison
\`\`\`

Promotion result: \`${score.promotion}\`.
Candidate score: \`${fmt(score.candidateScore, 6)}\`.

## FrontierLab score

| metric | value |
| --- | ---: |
| real-vs-null z | ${fmt(score.realVsNullZ, 6)} |
| persistence | ${fmt(score.persistence, 6)} |
| residual low-rank fraction | ${fmt(score.residualLowRank, 6)} |
| best factor-law R2 | ${fmt(score.collapseQuality, 6)} |
| cross-world coherence | ${fmt(score.crossWorldCoherence, 6)} |
| statement simplicity | ${fmt(score.statementSimplicity, 6)} |
| novelty gate | ${fmt(score.noveltyGate, 6)} |

Best integer factor grouping at the final range:
\`${integer.real.factorLaw.feature}\`, R2 \`${fmt(integer.real.factorLaw.r2, 6)}\`.

## Integer cumulative field

Energy exponent over endpoints: \`${fmt(integer.real.exponent.energy, 6)}\`.
Random completely multiplicative energy range at \`N=${N}\`:
\`${fmt(integer.summary.multiplicative.energyRange[0])}..${fmt(integer.summary.multiplicative.energyRange[1])}\`.
Shuffled lambda energy range:
\`${fmt(integer.summary.shuffle.energyRange[0])}..${fmt(integer.summary.shuffle.energyRange[1])}\`.

| N | labels | energy | maxAbs cell | normalized cells h=1..${maxShift} |
| ---: | ---: | ---: | ---: | --- |
${mdRows(integer.real.rows, (row) => row.N)}

## Integer dyadic blocks

| block | labels | energy | maxAbs cell | normalized cells h=1..${maxShift} |
| --- | ---: | ---: | ---: | --- |
${mdRows(integer.real.blocks, (row) => `${row.lo}..${row.hi}`)}

Block random completely multiplicative energy ranges:

| block | control energy range |
| --- | ---: |
${integer.real.blocks.map((row, i) => `| ${row.lo}..${row.hi} | ${fmt(integer.summary.multiplicative.blockEnergyRanges[i][0])} .. ${fmt(integer.summary.multiplicative.blockEnergyRanges[i][1])} |`).join("\n")}

Top final integer cells:

| h | rad(h) | omega(h) | Omega(h) | v2(h) | squarefree | normalized value |
| ---: | ---: | ---: | ---: | ---: | --- | ---: |
${mdTopCells(integerTop)}

## F_2[t]

Energy exponent over degrees: \`${fmt(q2.exponent.energy, 6)}\`.
Top-degree random multiplicative energy range:
\`${fmt(q2.summary.energyRange[0])}..${fmt(q2.summary.energyRange[1])}\`.
Best factor grouping: \`${q2.factorLaw.feature}\`, R2 \`${fmt(q2.factorLaw.r2, 6)}\`.

| degree | monics | energy | maxAbs cell | normalized cells h=1..${maxShift} |
| ---: | ---: | ---: | ---: | --- |
${mdRows(q2.rows, (row) => row.degree)}

Top-degree controls:

| seed | energy | maxAbs cell | normalized cells h=1..${maxShift} |
| ---: | ---: | ---: | --- |
${mdControlRows(q2.controls, (row) => row.seed)}

## F_3[t]

Energy exponent over degrees: \`${fmt(q3.exponent.energy, 6)}\`.
Top-degree random multiplicative energy range:
\`${fmt(q3.summary.energyRange[0])}..${fmt(q3.summary.energyRange[1])}\`.
Best factor grouping: \`${q3.factorLaw.feature}\`, R2 \`${fmt(q3.factorLaw.r2, 6)}\`.

| degree | monics | energy | maxAbs cell | normalized cells h=1..${maxShift} |
| ---: | ---: | ---: | ---: | --- |
${mdRows(q3.rows, (row) => row.degree)}

Top-degree controls:

| seed | energy | maxAbs cell | normalized cells h=1..${maxShift} |
| ---: | ---: | ---: | --- |
${mdControlRows(q3.controls, (row) => row.seed)}

## Arithmetic-deviation fields

Integer minus F_2[t] top-degree residual energy: \`${fmt(q2Deviation.energy)}\`;
cosine: \`${fmt(q2Deviation.cosine)}\`.

| h | rad(h) | omega(h) | Omega(h) | v2(h) | squarefree | residual |
| ---: | ---: | ---: | ---: | ---: | --- | ---: |
${mdTopCells(q2Deviation.topCells)}

Integer minus F_3[t] top-degree residual energy: \`${fmt(q3Deviation.energy)}\`;
cosine: \`${fmt(q3Deviation.cosine)}\`.

| h | rad(h) | omega(h) | Omega(h) | v2(h) | squarefree | residual |
| ---: | ---: | ---: | ---: | ---: | --- | ---: |
${mdTopCells(q3Deviation.topCells)}

## Audit gate

- Factor check: Liouville correlations are not prime-count, psi, Mertens, cumulative gap, or dyadic-smoothing transforms. They are the fixed-shift Chowla object for complete multiplicative parity.
- Composite control: not applicable as a primality signature; the object is defined on all positive integers.
- Null contrast: integer field is checked against five random completely multiplicative controls and five shuffled-lambda controls.
- Range persistence: endpoints are ${endpoints.join(", ")}.
- Known-result check: any promoted law must be labeled Chowla-adjacent and conjectural; this run does not claim a theorem.

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;

fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  score,
  integerLast: integer.real.rows.at(-1),
  integerCombinedControlEnergyRange: integer.summary.combined.energyRange,
  q2Last: q2.rows.at(-1),
  q2ControlRange: q2.summary.energyRange,
  q3Last: q3.rows.at(-1),
  q3ControlRange: q3.summary.energyRange,
}, null, 2));
