import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polynomialMobius,
} from "../src/core/ffield.js";
import { cramerPrimes, mobiusUpTo, oddPartValue, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(1000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const shifts = [-10, -8, -4, -2, 2, 4, 8, 10];
const d = shifts.length;
const entries = d * d;
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(10, Math.round(maxN * f)));
const localMod = 3 * 3 * 5 * 5 * 7 * 7;
const ffSpecs = [
  { q: 3, degree: 12 },
  { q: 5, degree: 8 },
];

function mulberry32(seed) {
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
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function range(values) {
  if (!values.length) return [NaN, NaN];
  return [Math.min(...values), Math.max(...values)];
}

function fmt(x, digits = 6) {
  return Number.isFinite(x) ? x.toFixed(digits) : "NA";
}

function stateForLabel(n, mu) {
  const out = new Int8Array(d);
  for (let i = 0; i < d; i++) {
    const m = n + shifts[i];
    out[i] = m >= 1 && m < mu.length ? (mu[oddPartValue(m)] || 0) : 0;
  }
  return out;
}

function statesForLabels(labels, mu) {
  const states = new Int8Array(labels.length * d);
  for (let r = 0; r < labels.length; r++) states.set(stateForLabel(labels[r], mu), r * d);
  return states;
}

function shuffleRows(states, rows, seed) {
  const rnd = mulberry32(seed);
  const order = Array.from({ length: rows }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const out = new Int8Array(states.length);
  for (let r = 0; r < rows; r++) out.set(states.subarray(order[r] * d, order[r] * d + d), r * d);
  return out;
}

function spectralNorm(matrix, dim = d) {
  let x = Array.from({ length: dim }, () => 1 / Math.sqrt(dim));
  let y = Array.from({ length: dim }, () => 0);
  for (let iter = 0; iter < 80; iter++) {
    y.fill(0);
    for (let i = 0; i < dim; i++) {
      let s = 0;
      for (let j = 0; j < dim; j++) s += matrix[i * dim + j] * x[j];
      y[i] = s;
    }
    const yn = Math.hypot(...y);
    if (!yn) return 0;
    for (let i = 0; i < dim; i++) y[i] /= yn;
    const next = Array.from({ length: dim }, () => 0);
    for (let j = 0; j < dim; j++) {
      let s = 0;
      for (let i = 0; i < dim; i++) s += matrix[i * dim + j] * y[i];
      next[j] = s;
    }
    const xn = Math.hypot(...next);
    if (!xn) return 0;
    x = next.map((v) => v / xn);
  }
  y.fill(0);
  for (let i = 0; i < dim; i++) {
    let s = 0;
    for (let j = 0; j < dim; j++) s += matrix[i * dim + j] * x[j];
    y[i] = s;
  }
  return Math.hypot(...y);
}

function makeAccum() {
  return {
    sumPrev: new Float64Array(entries),
    sumNext: new Float64Array(entries),
    sumOuter: new Float64Array(entries),
    allowed: new Int32Array(entries),
    skipped: new Int32Array(entries),
    pairs: 0,
    skippedTotal: 0,
  };
}

function addPair(acc, labels, states, idx) {
  const gap = labels[idx + 1] - labels[idx];
  const a0 = idx * d;
  const b0 = (idx + 1) * d;
  acc.pairs++;
  for (let i = 0; i < d; i++) {
    const a = states[a0 + i];
    for (let j = 0; j < d; j++) {
      const k = i * d + j;
      if (shifts[i] - shifts[j] === gap) {
        acc.skipped[k]++;
        acc.skippedTotal++;
        continue;
      }
      const b = states[b0 + j];
      acc.allowed[k]++;
      acc.sumPrev[k] += a;
      acc.sumNext[k] += b;
      acc.sumOuter[k] += a * b;
    }
  }
}

function addPairWithRadius(acc, labels, states, idx, radius) {
  const gap = labels[idx + 1] - labels[idx];
  const a0 = idx * d;
  const b0 = (idx + 1) * d;
  acc.pairs++;
  for (let i = 0; i < d; i++) {
    const a = states[a0 + i];
    for (let j = 0; j < d; j++) {
      const delta = gap - (shifts[i] - shifts[j]);
      const k = i * d + j;
      if (Math.abs(delta) <= radius) {
        acc.skipped[k]++;
        acc.skippedTotal++;
        continue;
      }
      const b = states[b0 + j];
      acc.allowed[k]++;
      acc.sumPrev[k] += a;
      acc.sumNext[k] += b;
      acc.sumOuter[k] += a * b;
    }
  }
}

function scoreRadiusStates(name, labels, states, radius) {
  const endpointRows = [];
  const acc = makeAccum();
  let cursor = 0;
  for (const N of endpoints) {
    while (cursor < labels.length - 1 && labels[cursor + 1] <= N) {
      addPairWithRadius(acc, labels, states, cursor, radius);
      cursor++;
    }
    const stats = statsFromAccum(acc);
    endpointRows.push({
      N,
      pairCount: acc.pairs,
      opNorm: stats.opNorm,
      frobenius: stats.frobenius,
      opNormalized: stats.opNormalized,
      frobeniusNormalized: stats.frobeniusNormalized,
      skippedPerPair: stats.skippedPerPair,
      matrix: stats.matrix,
    });
  }
  return { name, radius, endpointRows };
}

function statsFromAccum(acc) {
  const centered = new Float64Array(entries);
  let frob2 = 0;
  let allowedMin = Infinity;
  let allowedMax = 0;
  for (let k = 0; k < entries; k++) {
    const c = acc.allowed[k];
    allowedMin = Math.min(allowedMin, c);
    allowedMax = Math.max(allowedMax, c);
    if (!c) continue;
    const v = acc.sumOuter[k] - (acc.sumPrev[k] * acc.sumNext[k]) / c;
    centered[k] = v;
    frob2 += v * v;
  }
  const root = Math.sqrt(acc.pairs || 1);
  return {
    opNorm: spectralNorm(centered),
    frobenius: Math.sqrt(frob2),
    opNormalized: spectralNorm(centered) / root,
    frobeniusNormalized: Math.sqrt(frob2) / root,
    matrix: Array.from(centered, (v) => v / root),
    allowedMin: Number.isFinite(allowedMin) ? allowedMin : 0,
    allowedMax,
    skippedTotal: acc.skippedTotal,
    skippedPerPair: acc.pairs ? acc.skippedTotal / acc.pairs : 0,
  };
}

function scoreProjectedStates(name, labels, states, endpointPairCounts = null) {
  const endpointRows = [];
  const blockRows = [];
  const cumulative = makeAccum();
  let block = makeAccum();
  let cursor = 0;
  let blockStart = 1;
  const pushEndpoint = (N, targetPairCount = null) => {
    while (cursor < labels.length - 1 && (targetPairCount == null ? labels[cursor + 1] <= N : cumulative.pairs < targetPairCount)) {
      addPair(cumulative, labels, states, cursor);
      addPair(block, labels, states, cursor);
      cursor++;
    }
    const stats = statsFromAccum(cumulative);
    endpointRows.push({
      N,
      pairCount: cumulative.pairs,
      opNorm: stats.opNorm,
      frobenius: stats.frobenius,
      opNormalized: stats.opNormalized,
      frobeniusNormalized: stats.frobeniusNormalized,
      allowedMin: stats.allowedMin,
      allowedMax: stats.allowedMax,
      skippedTotal: stats.skippedTotal,
      skippedPerPair: stats.skippedPerPair,
      matrix: stats.matrix,
    });
    const blockStats = statsFromAccum(block);
    blockRows.push({
      from: blockStart,
      to: N,
      pairCount: block.pairs,
      opNormalized: blockStats.opNormalized,
      frobeniusNormalized: blockStats.frobeniusNormalized,
      skippedPerPair: blockStats.skippedPerPair,
      matrix: blockStats.matrix,
    });
    blockStart = N;
    block = makeAccum();
  };
  for (let i = 0; i < endpoints.length; i++) pushEndpoint(endpoints[i], endpointPairCounts ? endpointPairCounts[i] : null);
  return { name, labels: labels.length, endpointRows, blockRows };
}

function fitTheta(rows, key = "opNorm") {
  const pts = rows.filter((r) => r[key] > 0 && r.N > 1);
  if (pts.length < 2) return NaN;
  const xs = pts.map((r) => Math.log(r.N));
  const ys = pts.map((r) => Math.log(Math.abs(r[key])));
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : NaN;
}

function w210FakeLabels(N, seed) {
  const rnd = mulberry32(seed);
  const out = [11];
  const densityMultiplier = 210 / 48;
  for (let n = 13; n <= N; n += 2) {
    if (gcd(n, 210) !== 1) continue;
    if (rnd() < Math.min(1, densityMultiplier / Math.log(n))) out.push(n);
  }
  return out;
}

function sampleSorted(items, k, seed) {
  const rnd = mulberry32(seed);
  const reservoir = [];
  for (let i = 0; i < items.length; i++) {
    if (i < k) {
      reservoir.push(items[i]);
      continue;
    }
    const j = Math.floor(rnd() * (i + 1));
    if (j < k) reservoir[j] = items[i];
  }
  return reservoir.sort((a, b) => a - b);
}

function buildCompositeResiduePools(N, isp, modulus) {
  const pools = Array.from({ length: modulus }, () => []);
  const fallback = [];
  for (let n = 25; n <= N; n += 2) {
    if (isp[n]) continue;
    fallback.push(n);
    pools[n % modulus].push(n);
  }
  return { pools, fallback };
}

function matchedCompositeStates(labels, mu, pools, fallback, modulus, seed) {
  const rnd = mulberry32(seed);
  const states = new Int8Array(labels.length * d);
  for (let r = 0; r < labels.length; r++) {
    const bucket = pools[labels[r] % modulus];
    const source = bucket.length ? bucket : fallback;
    const n = source[Math.floor(rnd() * source.length)];
    states.set(stateForLabel(n, mu), r * d);
  }
  return states;
}

function summarizeControls(runs, endpointIndex) {
  return {
    opNormalized: range(runs.map((r) => r.endpointRows[endpointIndex].opNormalized)),
    frobeniusNormalized: range(runs.map((r) => r.endpointRows[endpointIndex].frobeniusNormalized)),
    theta: range(runs.map((r) => fitTheta(r.endpointRows))),
  };
}

function blockRange(runs, blockIndex, key = "opNormalized") {
  return range(runs.map((r) => r.blockRows[blockIndex][key]));
}

function correlation(xs, ys) {
  if (xs.length !== ys.length || xs.length < 2) return NaN;
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0;
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  return vx && vy ? num / Math.sqrt(vx * vy) : NaN;
}

function nearBandMatrix(labels, states, endpointN, band) {
  const acc = makeAccum();
  let cursor = 0;
  while (cursor < labels.length - 1 && labels[cursor + 1] <= endpointN) {
    const gap = labels[cursor + 1] - labels[cursor];
    const a0 = cursor * d;
    const b0 = (cursor + 1) * d;
    acc.pairs++;
    for (let i = 0; i < d; i++) {
      const a = states[a0 + i];
      for (let j = 0; j < d; j++) {
        const delta = gap - (shifts[i] - shifts[j]);
        if (delta === 0 || Math.abs(delta) > band) continue;
        const k = i * d + j;
        const b = states[b0 + j];
        acc.allowed[k]++;
        acc.sumPrev[k] += a;
        acc.sumNext[k] += b;
        acc.sumOuter[k] += a * b;
      }
    }
    cursor++;
  }
  return statsFromAccum(acc);
}

function functionFieldStateRows(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const constShifts = Array.from({ length: q - 1 }, (_, i) => i + 1);
  const rows = [];
  for (let degree = 1; degree <= maxDegree; degree++) {
    const polys = universe.irreduciblesByDegree[degree];
    const dim = constShifts.length;
    const sum = new Float64Array(dim);
    const outer = new Float64Array(dim * dim);
    for (const f of polys) {
      const state = constShifts.map((c) => polynomialMobius(polyAdd(f, c, q), universe));
      for (let i = 0; i < dim; i++) {
        sum[i] += state[i];
        for (let j = 0; j < dim; j++) outer[i * dim + j] += state[i] * state[j];
      }
    }
    const count = polys.length;
    const cov = new Float64Array(dim * dim);
    let meanNorm2 = 0;
    for (let i = 0; i < dim; i++) meanNorm2 += (sum[i] / count) ** 2;
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) cov[i * dim + j] = outer[i * dim + j] / count - (sum[i] * sum[j]) / (count * count);
    }
    rows.push({
      q,
      degree,
      shifts: constShifts,
      count,
      meanNorm: Math.sqrt(meanNorm2),
      covarianceOp: spectralNorm(cov, dim),
    });
  }
  return rows;
}

function makeSvg(real, families) {
  const W = 1220;
  const H = 820;
  const margin = { left: 92, right: 430, top: 96, bottom: 122 };
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;
  const allVals = [
    ...real.endpointRows.map((r) => r.opNormalized),
    ...families.flatMap((f) => f.runs.flatMap((run) => run.endpointRows.map((r) => r.opNormalized))),
  ];
  const yMax = Math.max(1, ...allVals) * 1.15;
  const xAt = (i) => margin.left + (plotW * i) / (endpoints.length - 1);
  const yAt = (v) => margin.top + plotH - (v / yMax) * plotH;
  const colors = {
    real: "#67e8f9",
    rowShuffle: "#a78bfa",
    cramer: "#f59e0b",
    w210: "#22c55e",
    composite: "#fb7185",
    localComposite: "#f472b6",
  };
  const lines = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  lines.push(`<rect width="${W}" height="${H}" fill="#08111f"/>`);
  lines.push(`<text x="${margin.left}" y="40" fill="#e5e7eb" font-size="24" font-weight="700">Overlap-projected squarefree cloud residual</text>`);
  lines.push(`<text x="${margin.left}" y="68" fill="#94a3b8" font-size="15">y=||entrywise centered transition matrix after exact shift-overlap removal||op / sqrt(pair count)</text>`);
  for (let g = 0; g <= 4; g++) {
    const y = margin.top + (plotH * g) / 4;
    const val = yMax * (1 - g / 4);
    lines.push(`<line x1="${margin.left}" x2="${margin.left + plotW}" y1="${y}" y2="${y}" stroke="#223044" stroke-width="1"/>`);
    lines.push(`<text x="${margin.left - 12}" y="${y + 5}" fill="#94a3b8" text-anchor="end" font-size="13">${fmt(val, 2)}</text>`);
  }
  for (const family of families) {
    for (const run of family.runs) {
      const dLine = run.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.opNormalized)}`).join(" ");
      lines.push(`<path d="${dLine}" fill="none" stroke="${colors[family.key]}" stroke-width="1.5" opacity="0.34"/>`);
    }
  }
  const dReal = real.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.opNormalized)}`).join(" ");
  lines.push(`<path d="${dReal}" fill="none" stroke="${colors.real}" stroke-width="4"/>`);
  real.endpointRows.forEach((r, i) => {
    lines.push(`<circle cx="${xAt(i)}" cy="${yAt(r.opNormalized)}" r="5" fill="${colors.real}"/>`);
    lines.push(`<text x="${xAt(i)}" y="${margin.top + plotH + 24}" fill="#94a3b8" text-anchor="middle" font-size="12">${r.N}</text>`);
  });

  const heatX = W - 350;
  const heatY = 126;
  const cell = 31;
  const matrix = real.endpointRows.at(-1).matrix;
  const maxAbs = Math.max(1e-9, ...matrix.map((v) => Math.abs(v)));
  lines.push(`<text x="${heatX}" y="${heatY - 28}" fill="#e5e7eb" font-size="16" font-weight="700">Endpoint residual matrix</text>`);
  lines.push(`<text x="${heatX}" y="${heatY - 9}" fill="#94a3b8" font-size="12">projected and centered / sqrt(pair count)</text>`);
  for (let i = 0; i < d; i++) {
    lines.push(`<text x="${heatX - 8}" y="${heatY + i * cell + 20}" fill="#94a3b8" font-size="11" text-anchor="end">${shifts[i]}</text>`);
    lines.push(`<text x="${heatX + i * cell + 15}" y="${heatY - 38}" fill="#94a3b8" font-size="11" text-anchor="middle">${shifts[i]}</text>`);
    for (let j = 0; j < d; j++) {
      const v = matrix[i * d + j];
      const a = Math.min(1, Math.abs(v) / maxAbs);
      const color = v >= 0
        ? `rgb(${Math.round(80 + 90 * a)}, ${Math.round(170 + 60 * a)}, ${Math.round(210 + 35 * a)})`
        : `rgb(${Math.round(210 + 35 * a)}, ${Math.round(90 + 50 * a)}, ${Math.round(120 + 35 * a)})`;
      lines.push(`<rect x="${heatX + j * cell}" y="${heatY + i * cell}" width="${cell - 2}" height="${cell - 2}" fill="${color}" opacity="${0.25 + 0.75 * a}"/>`);
    }
  }

  const legend = [
    ["real primes", colors.real],
    ["row shuffle", colors.rowShuffle],
    ["Cramer labels", colors.cramer],
    ["W210 labels", colors.w210],
    ["composites", colors.composite],
    ["local composites", colors.localComposite],
  ];
  legend.forEach(([label, color], i) => {
    const x = margin.left + (i % 3) * 220;
    const y = H - 70 + Math.floor(i / 3) * 24;
    lines.push(`<line x1="${x}" x2="${x + 24}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="4"/>`);
    lines.push(`<text x="${x + 30}" y="${y + 5}" fill="#cbd5e1" font-size="13">${label}</text>`);
  });
  const end = real.endpointRows.at(-1);
  lines.push(`<text x="${margin.left}" y="${H - 18}" fill="#cbd5e1" font-size="14">Endpoint pairs=${end.pairCount}, op/sqrt=${fmt(end.opNormalized, 3)}, frob/sqrt=${fmt(end.frobeniusNormalized, 3)}, skipped/pair=${fmt(end.skippedPerPair, 3)}, theta=${fmt(fitTheta(real.endpointRows), 3)}</text>`);
  lines.push(`</svg>`);
  return lines.join("\n");
}

function markdownReport(data) {
  const lines = [];
  const last = data.real.endpointRows.length - 1;
  lines.push("# Overlap-projected squarefree cloud residual operator audit", "");
  lines.push(`State: v(label)=(mu(oddpart(label+h))) for shifts ${JSON.stringify(shifts)}. For each pair, entries with h_prev-h_next=gap are excluded before entrywise centering.`, "");
  lines.push(`Range: ${maxN}. Seeds: ${seeds.join(", ")}. Local composite match modulus: ${localMod}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | pairs | skipped/pair | real op/sqrt | real frob/sqrt | row-shuffle op | Cramer op | W210 op | composite op | local-composite op |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.endpointRows.length; i++) {
    const r = data.real.endpointRows[i];
    lines.push(`| ${r.N} | ${r.pairCount} | ${fmt(r.skippedPerPair)} | ${fmt(r.opNormalized)} | ${fmt(r.frobeniusNormalized)} | ${fmt(data.controlSummaries.rowShuffle[i].opNormalized[0])}..${fmt(data.controlSummaries.rowShuffle[i].opNormalized[1])} | ${fmt(data.controlSummaries.cramer[i].opNormalized[0])}..${fmt(data.controlSummaries.cramer[i].opNormalized[1])} | ${fmt(data.controlSummaries.w210[i].opNormalized[0])}..${fmt(data.controlSummaries.w210[i].opNormalized[1])} | ${fmt(data.controlSummaries.composite[i].opNormalized[0])}..${fmt(data.controlSummaries.composite[i].opNormalized[1])} | ${fmt(data.controlSummaries.localComposite[i].opNormalized[0])}..${fmt(data.controlSummaries.localComposite[i].opNormalized[1])} |`);
  }
  lines.push("", "## Block operator norms", "");
  lines.push("| block | pairs | real op/sqrt | row-shuffle | Cramer | W210 | composite | local-composite |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.blockRows.length; i++) {
    const b = data.real.blockRows[i];
    lines.push(`| (${b.from}, ${b.to}] | ${b.pairCount} | ${fmt(b.opNormalized)} | ${fmt(data.blockSummaries.rowShuffle[i][0])}..${fmt(data.blockSummaries.rowShuffle[i][1])} | ${fmt(data.blockSummaries.cramer[i][0])}..${fmt(data.blockSummaries.cramer[i][1])} | ${fmt(data.blockSummaries.w210[i][0])}..${fmt(data.blockSummaries.w210[i][1])} | ${fmt(data.blockSummaries.composite[i][0])}..${fmt(data.blockSummaries.composite[i][1])} | ${fmt(data.blockSummaries.localComposite[i][0])}..${fmt(data.blockSummaries.localComposite[i][1])} |`);
  }
  lines.push("", "## Endpoint projected residual matrix", "");
  lines.push("Rows are previous-label shifts; columns are next-label shifts; entries are projected, entrywise centered, and divided by sqrt(pair count).", "");
  lines.push(`| h\\\\k | ${shifts.map((h) => `${h}`).join(" | ")} |`);
  lines.push(`| --- | ${shifts.map(() => "---:").join(" | ")} |`);
  const m = data.real.endpointRows.at(-1).matrix;
  for (let i = 0; i < d; i++) {
    lines.push(`| ${shifts[i]} | ${shifts.map((_, j) => fmt(m[i * d + j], 3)).join(" | ")} |`);
  }
  lines.push("", "## Projection check", "");
  const end = data.real.endpointRows.at(-1);
  lines.push(`Endpoint skipped entries per pair: \`${fmt(end.skippedPerPair)}\`. Per-entry allowed pair count range: \`${end.allowedMin}..${end.allowedMax}\`. Exact-overlap entries are absent by construction; if a signal remains, it is not the direct Cycle 68 identity.`, "");
  lines.push("## Near-overlap diagnostic", "");
  lines.push("After exact overlaps are removed, entries can still compare shifted integers at very small separation `delta = gap - (h_prev-h_next)`. This diagnostic isolates `|delta|<=2` and then excludes that band too.", "");
  lines.push(`Near band ` + "`|delta|<=2`" + ` op/sqrt: \`${fmt(data.nearBand.opNormalized)}\`; Frobenius/sqrt: \`${fmt(data.nearBand.frobeniusNormalized)}\`; correlation with full projected matrix: \`${fmt(data.nearBandCorrelation)}\`.`);
  lines.push(`Far residual after also excluding ` + "`|delta|<=2`" + ` has endpoint op/sqrt \`${fmt(data.far2.endpointRows.at(-1).opNormalized)}\`, frob/sqrt \`${fmt(data.far2.endpointRows.at(-1).frobeniusNormalized)}\`, skipped/pair \`${fmt(data.far2.endpointRows.at(-1).skippedPerPair)}\`.`);
  lines.push("", "| excluded radius R in `|delta|<=R` | endpoint op/sqrt | endpoint frob/sqrt | skipped entries / pair |");
  lines.push("| ---: | ---: | ---: | ---: |");
  for (const row of data.radiusDiagnostics) {
    const endpoint = row.run.endpointRows.at(-1);
    lines.push(`| ${row.radius} | ${fmt(endpoint.opNormalized)} | ${fmt(endpoint.frobeniusNormalized)} | ${fmt(endpoint.skippedPerPair)} |`);
  }
  lines.push("");
  lines.push("## Coordinate-free function-field shell state check", "");
  lines.push("As in Cycle 68, no lexicographic function-field successor ordering is used. Rows report unordered shell state covariance for constant shifts.", "");
  lines.push("| q | degree | shifts | irreducibles | mean norm | covariance op |");
  lines.push("| ---: | ---: | --- | ---: | ---: | ---: |");
  for (const row of data.functionFieldRows) {
    lines.push(`| ${row.q} | ${row.degree} | ${row.shifts.join(",")} | ${row.count} | ${fmt(row.meanNorm)} | ${fmt(row.covarianceOp)} |`);
  }
  lines.push("", "## Summary", "");
  lines.push(`Real op-norm theta: \`${fmt(fitTheta(data.real.endpointRows))}\`.`);
  lines.push(`Endpoint row-shuffle op/sqrt range: \`${fmt(data.controlSummaries.rowShuffle[last].opNormalized[0])}..${fmt(data.controlSummaries.rowShuffle[last].opNormalized[1])}\`.`);
  lines.push(`Endpoint Cramer op/sqrt range: \`${fmt(data.controlSummaries.cramer[last].opNormalized[0])}..${fmt(data.controlSummaries.cramer[last].opNormalized[1])}\`.`);
  lines.push(`Endpoint W210 op/sqrt range: \`${fmt(data.controlSummaries.w210[last].opNormalized[0])}..${fmt(data.controlSummaries.w210[last].opNormalized[1])}\`.`);
  lines.push(`Endpoint composite op/sqrt range: \`${fmt(data.controlSummaries.composite[last].opNormalized[0])}..${fmt(data.controlSummaries.composite[last].opNormalized[1])}\`.`);
  lines.push(`Endpoint local-composite op/sqrt range: \`${fmt(data.controlSummaries.localComposite[last].opNormalized[0])}..${fmt(data.controlSummaries.localComposite[last].opNormalized[1])}\`.`);
  lines.push("", "## Factor check", "");
  lines.push("The exact shifted-overlap identity from Cycle 68 is removed entry-by-entry. A survivor must now beat row-shuffle, which preserves the exact state multiset and prime gap projection pattern, and local-composite controls, which preserve the same small-prime residue environment on the real prime timeline.");
  lines.push("", "## Files", "");
  lines.push(`- JSON: \`${data.jsonPath}\``);
  lines.push(`- SVG: \`${data.svgPath}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const mu = mobiusUpTo(maxN + Math.max(...shifts.map((h) => Math.abs(h))) + 16);
const realLabels = primesUpTo(maxN).filter((n) => n >= 13);
const realStates = statesForLabels(realLabels, mu);
const real = scoreProjectedStates("real", realLabels, realStates);
const nearBand = nearBandMatrix(realLabels, realStates, endpoints.at(-1), 2);
const nearBandCorrelation = correlation(real.endpointRows.at(-1).matrix, nearBand.matrix);
const far2 = scoreRadiusStates("real-far2", realLabels, realStates, 2);
const radiusDiagnostics = [0, 2, 4, 6, 10, 20].map((radius) => ({
  radius,
  run: scoreRadiusStates(`real-radius-${radius}`, realLabels, realStates, radius),
}));
const endpointPairCounts = real.endpointRows.map((r) => r.pairCount);

const rowShuffleRuns = seeds.map((seed) => scoreProjectedStates(
  `row-shuffle-${seed}`,
  realLabels,
  shuffleRows(realStates, realLabels.length, seed),
  endpointPairCounts,
));
const cramerRuns = seeds.map((seed) => {
  const labels = cramerPrimes(maxN, seed).filter((n) => n >= 13 && n % 2 === 1);
  return scoreProjectedStates(`cramer-${seed}`, labels, statesForLabels(labels, mu));
});
const w210Runs = seeds.map((seed) => {
  const labels = w210FakeLabels(maxN, seed).filter((n) => n >= 13 && n % 2 === 1);
  return scoreProjectedStates(`w210-${seed}`, labels, statesForLabels(labels, mu));
});
const isp = sieve(maxN);
const compositePool = [];
for (let n = 25; n <= maxN; n += 2) {
  if (!isp[n] && gcd(n, 210) === 1) compositePool.push(n);
}
const compositeRuns = seeds.map((seed) => {
  const labels = sampleSorted(compositePool, realLabels.length, seed);
  return scoreProjectedStates(`composite-${seed}`, labels, statesForLabels(labels, mu));
});
const { pools: compositeResiduePools, fallback: compositeResidueFallback } = buildCompositeResiduePools(maxN, isp, localMod);
const localCompositeRuns = seeds.map((seed) => scoreProjectedStates(
  `local-composite-${seed}`,
  realLabels,
  matchedCompositeStates(realLabels, mu, compositeResiduePools, compositeResidueFallback, localMod, seed),
  endpointPairCounts,
));

const families = [
  { key: "rowShuffle", runs: rowShuffleRuns },
  { key: "cramer", runs: cramerRuns },
  { key: "w210", runs: w210Runs },
  { key: "composite", runs: compositeRuns },
  { key: "localComposite", runs: localCompositeRuns },
];

const controlSummaries = Object.fromEntries(
  families.map((family) => [
    family.key,
    endpoints.map((_, i) => summarizeControls(family.runs, i)),
  ]),
);
const blockSummaries = Object.fromEntries(
  families.map((family) => [
    family.key,
    endpoints.map((_, i) => blockRange(family.runs, i)),
  ]),
);
const functionFieldRows = ffSpecs.flatMap(({ q, degree }) => functionFieldStateRows(q, degree));

const baseName = `overlap-projected-cloud-operator-${maxN}`;
const jsonPath = path.join(outDir, `${baseName}.json`);
const mdPath = path.join(outDir, `${baseName}.md`);
const svgPath = path.join(outDir, `${baseName}.svg`);
const data = {
  maxN,
  shifts,
  seeds,
  endpoints,
  localMod,
  ffSpecs,
  real,
  nearBand,
  nearBandCorrelation,
  far2,
  radiusDiagnostics,
  rowShuffleRuns,
  cramerRuns,
  w210Runs,
  compositeRuns,
  localCompositeRuns,
  controlSummaries,
  blockSummaries,
  functionFieldRows,
  jsonPath,
  mdPath,
  svgPath,
};

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(svgPath, makeSvg(real, families));
fs.writeFileSync(mdPath, markdownReport(data));

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  endpoint: real.endpointRows.at(-1),
  nearBand: {
    opNormalized: nearBand.opNormalized,
    frobeniusNormalized: nearBand.frobeniusNormalized,
    correlation: nearBandCorrelation,
  },
  far2Endpoint: far2.endpointRows.at(-1),
  radiusDiagnostics: radiusDiagnostics.map((row) => ({
    radius: row.radius,
    endpoint: row.run.endpointRows.at(-1),
  })),
  theta: {
    opNorm: fitTheta(real.endpointRows),
  },
  summary: {
    rowShuffle: controlSummaries.rowShuffle.at(-1),
    cramer: controlSummaries.cramer.at(-1),
    w210: controlSummaries.w210.at(-1),
    composite: controlSummaries.composite.at(-1),
    localComposite: controlSummaries.localComposite.at(-1),
  },
  functionFieldEndpoint: functionFieldRows.filter((r) => ffSpecs.some((s) => s.q === r.q && s.degree === r.degree)),
}, null, 2));
