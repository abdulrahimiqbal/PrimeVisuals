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
  for (let r = 0; r < labels.length; r++) {
    const row = stateForLabel(labels[r], mu);
    states.set(row, r * d);
  }
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
  for (let r = 0; r < rows; r++) {
    out.set(states.subarray(order[r] * d, order[r] * d + d), r * d);
  }
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

function matrixStats(sumPrev, sumNext, sumOuter, count, dim = d) {
  const centered = new Float64Array(dim * dim);
  if (!count) {
    return { opNorm: 0, frobenius: 0, opNormalized: 0, frobeniusNormalized: 0, matrix: Array.from(centered) };
  }
  let frob2 = 0;
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      const idx = i * dim + j;
      const v = sumOuter[idx] - (sumPrev[i] * sumNext[j]) / count;
      centered[idx] = v;
      frob2 += v * v;
    }
  }
  const opNorm = spectralNorm(centered, dim);
  const root = Math.sqrt(count);
  return {
    opNorm,
    frobenius: Math.sqrt(frob2),
    opNormalized: opNorm / root,
    frobeniusNormalized: Math.sqrt(frob2) / root,
    matrix: Array.from(centered, (v) => v / root),
  };
}

function scoreStates(name, labels, states, endpointPairCounts = null) {
  const endpointRows = [];
  const blockRows = [];
  const sumPrev = new Float64Array(d);
  const sumNext = new Float64Array(d);
  const sumOuter = new Float64Array(d * d);
  let blockPrev = new Float64Array(d);
  let blockNext = new Float64Array(d);
  let blockOuter = new Float64Array(d * d);
  let cursor = 0;
  let pairCount = 0;
  let blockPairCount = 0;
  let blockStart = 1;
  const addPair = (idx) => {
    const a0 = idx * d;
    const b0 = (idx + 1) * d;
    for (let i = 0; i < d; i++) {
      const a = states[a0 + i];
      const b = states[b0 + i];
      sumPrev[i] += a;
      sumNext[i] += b;
      blockPrev[i] += a;
      blockNext[i] += b;
      for (let j = 0; j < d; j++) {
        const v = a * states[b0 + j];
        sumOuter[i * d + j] += v;
        blockOuter[i * d + j] += v;
      }
      // `b` is intentionally unused except as documentation of the next-state row.
      void b;
    }
    pairCount++;
    blockPairCount++;
  };
  const pushEndpoint = (N, targetPairCount = null) => {
    while (cursor < labels.length - 1 && (targetPairCount == null ? labels[cursor + 1] <= N : pairCount < targetPairCount)) {
      addPair(cursor);
      cursor++;
    }
    const stats = matrixStats(sumPrev, sumNext, sumOuter, pairCount);
    endpointRows.push({
      N,
      pairCount,
      opNorm: stats.opNorm,
      frobenius: stats.frobenius,
      opNormalized: stats.opNormalized,
      frobeniusNormalized: stats.frobeniusNormalized,
      matrix: stats.matrix,
    });
    const blockStats = matrixStats(blockPrev, blockNext, blockOuter, blockPairCount);
    blockRows.push({
      from: blockStart,
      to: N,
      pairCount: blockPairCount,
      opNormalized: blockStats.opNormalized,
      frobeniusNormalized: blockStats.frobeniusNormalized,
      matrix: blockStats.matrix,
    });
    blockStart = N;
    blockPairCount = 0;
    blockPrev = new Float64Array(d);
    blockNext = new Float64Array(d);
    blockOuter = new Float64Array(d * d);
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

function overlapDiagnostics(labels, states, endpointN, endpointMatrix) {
  const counts = new Float64Array(d * d);
  const nonzero = new Float64Array(d * d);
  let pairCount = 0;
  for (let idx = 0; idx < labels.length - 1 && labels[idx + 1] <= endpointN; idx++) {
    pairCount++;
    const gap = labels[idx + 1] - labels[idx];
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        if (shifts[i] - shifts[j] !== gap) continue;
        const v = states[idx * d + i];
        counts[i * d + j]++;
        if (v !== 0) nonzero[i * d + j]++;
      }
    }
  }
  const root = Math.sqrt(pairCount || 1);
  const normalizedNonzero = Array.from(nonzero, (v) => v / root);
  let supportFrob2 = 0;
  let totalFrob2 = 0;
  let supportEntries = 0;
  for (let idx = 0; idx < endpointMatrix.length; idx++) {
    const e2 = endpointMatrix[idx] ** 2;
    totalFrob2 += e2;
    if (counts[idx] > 0) {
      supportFrob2 += e2;
      supportEntries++;
    }
  }
  const top = Array.from(counts)
    .map((count, idx) => ({
      rowShift: shifts[Math.floor(idx / d)],
      colShift: shifts[idx % d],
      gap: shifts[Math.floor(idx / d)] - shifts[idx % d],
      count,
      nonzero: nonzero[idx],
      nonzeroNormalized: nonzero[idx] / root,
      matrix: endpointMatrix[idx],
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => Math.abs(b.matrix) - Math.abs(a.matrix))
    .slice(0, 12);
  return {
    pairCount,
    supportEntries,
    supportFrobeniusShare: totalFrob2 ? supportFrob2 / totalFrob2 : 0,
    matrixOverlapCorrelation: correlation(Array.from(endpointMatrix), normalizedNonzero),
    top,
  };
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
  lines.push(`<text x="${margin.left}" y="40" fill="#e5e7eb" font-size="24" font-weight="700">Squarefree cloud transition operator</text>`);
  lines.push(`<text x="${margin.left}" y="68" fill="#94a3b8" font-size="15">y=||Σ(v(p_i)-mean)(v(p_{i+1})-mean)^T||op / sqrt(pair count)</text>`);
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
  lines.push(`<text x="${heatX}" y="${heatY - 28}" fill="#e5e7eb" font-size="16" font-weight="700">Endpoint real matrix</text>`);
  lines.push(`<text x="${heatX}" y="${heatY - 9}" fill="#94a3b8" font-size="12">centered / sqrt(pair count)</text>`);
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
  lines.push(`<text x="${margin.left}" y="${H - 18}" fill="#cbd5e1" font-size="14">Endpoint pairs=${end.pairCount}, op/sqrt=${fmt(end.opNormalized, 3)}, frob/sqrt=${fmt(end.frobeniusNormalized, 3)}, theta=${fmt(fitTheta(real.endpointRows), 3)}</text>`);
  lines.push(`</svg>`);
  return lines.join("\n");
}

function markdownReport(data) {
  const lines = [];
  const last = data.real.endpointRows.length - 1;
  lines.push("# Squarefree cloud transition operator audit", "");
  lines.push(`State: v(label)=(mu(oddpart(label+h))) for shifts ${JSON.stringify(shifts)}. Bridge: centered lag-1 operator norm divided by sqrt(pair count).`, "");
  lines.push(`Range: ${maxN}. Seeds: ${seeds.join(", ")}. Local composite match modulus: ${localMod}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | pairs | real op/sqrt | real frob/sqrt | row-shuffle op | Cramer op | W210 op | composite op | local-composite op |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.endpointRows.length; i++) {
    const r = data.real.endpointRows[i];
    lines.push(`| ${r.N} | ${r.pairCount} | ${fmt(r.opNormalized)} | ${fmt(r.frobeniusNormalized)} | ${fmt(data.controlSummaries.rowShuffle[i].opNormalized[0])}..${fmt(data.controlSummaries.rowShuffle[i].opNormalized[1])} | ${fmt(data.controlSummaries.cramer[i].opNormalized[0])}..${fmt(data.controlSummaries.cramer[i].opNormalized[1])} | ${fmt(data.controlSummaries.w210[i].opNormalized[0])}..${fmt(data.controlSummaries.w210[i].opNormalized[1])} | ${fmt(data.controlSummaries.composite[i].opNormalized[0])}..${fmt(data.controlSummaries.composite[i].opNormalized[1])} | ${fmt(data.controlSummaries.localComposite[i].opNormalized[0])}..${fmt(data.controlSummaries.localComposite[i].opNormalized[1])} |`);
  }
  lines.push("", "## Block operator norms", "");
  lines.push("| block | pairs | real op/sqrt | row-shuffle | Cramer | W210 | composite | local-composite |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.blockRows.length; i++) {
    const b = data.real.blockRows[i];
    lines.push(`| (${b.from}, ${b.to}] | ${b.pairCount} | ${fmt(b.opNormalized)} | ${fmt(data.blockSummaries.rowShuffle[i][0])}..${fmt(data.blockSummaries.rowShuffle[i][1])} | ${fmt(data.blockSummaries.cramer[i][0])}..${fmt(data.blockSummaries.cramer[i][1])} | ${fmt(data.blockSummaries.w210[i][0])}..${fmt(data.blockSummaries.w210[i][1])} | ${fmt(data.blockSummaries.composite[i][0])}..${fmt(data.blockSummaries.composite[i][1])} | ${fmt(data.blockSummaries.localComposite[i][0])}..${fmt(data.blockSummaries.localComposite[i][1])} |`);
  }
  lines.push("", "## Endpoint real matrix", "");
  lines.push("Rows are previous-prime shifts; columns are next-prime shifts; entries are centered and divided by sqrt(pair count).", "");
  lines.push(`| h\\\\k | ${shifts.map((h) => `${h}`).join(" | ")} |`);
  lines.push(`| --- | ${shifts.map(() => "---:").join(" | ")} |`);
  const m = data.real.endpointRows.at(-1).matrix;
  for (let i = 0; i < d; i++) {
    lines.push(`| ${shifts[i]} | ${shifts.map((_, j) => fmt(m[i * d + j], 3)).join(" | ")} |`);
  }
  lines.push("", "## Exact shifted-overlap diagnostic", "");
  lines.push("If `p_{i+1}=p_i+g` and `h_prev = g+h_next`, then `p_i+h_prev` and `p_{i+1}+h_next` are the same integer. Those entries test squarefreeness of the same shifted number twice, producing a deterministic positive contribution.", "");
  lines.push(`Support entries: \`${data.overlap.supportEntries}\`. Frobenius share on exact-overlap support: \`${fmt(data.overlap.supportFrobeniusShare)}\`. Matrix/overlap-nonzero correlation: \`${fmt(data.overlap.matrixOverlapCorrelation)}\`.`, "");
  lines.push("| previous h | next h | gap | overlap pairs | nonzero overlaps/sqrt | matrix entry |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of data.overlap.top) {
    lines.push(`| ${row.rowShift} | ${row.colShift} | ${row.gap} | ${row.count} | ${fmt(row.nonzeroNormalized)} | ${fmt(row.matrix)} |`);
  }
  lines.push("", "## Coordinate-free function-field shell state check", "");
  lines.push("No lexicographic transition is used here; that would be an ordering artifact. Rows report unordered shell state covariance for constant shifts.", "");
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
  lines.push("This object avoids collapsing to a one-coordinate Mobius product, but it still uses the prime successor order. Row-shuffle controls keep the exact same state multiset and break any claim that depends only on available local states; local-composite controls keep a matched small-prime residue environment and break finite local squarefactor explanations. A survivor must beat both.");
  lines.push("", "## Files", "");
  lines.push(`- JSON: \`${data.jsonPath}\``);
  lines.push(`- SVG: \`${data.svgPath}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const mu = mobiusUpTo(maxN + Math.max(...shifts.map((h) => Math.abs(h))) + 16);
const realLabels = primesUpTo(maxN).filter((n) => n >= 13);
const realStates = statesForLabels(realLabels, mu);
const real = scoreStates("real", realLabels, realStates);
const endpointPairCounts = real.endpointRows.map((r) => r.pairCount);
const overlap = overlapDiagnostics(realLabels, realStates, endpoints.at(-1), real.endpointRows.at(-1).matrix);

const rowShuffleRuns = seeds.map((seed) => scoreStates(
  `row-shuffle-${seed}`,
  realLabels,
  shuffleRows(realStates, realLabels.length, seed),
  endpointPairCounts,
));
const cramerRuns = seeds.map((seed) => {
  const labels = cramerPrimes(maxN, seed).filter((n) => n >= 13 && n % 2 === 1);
  return scoreStates(`cramer-${seed}`, labels, statesForLabels(labels, mu));
});
const w210Runs = seeds.map((seed) => {
  const labels = w210FakeLabels(maxN, seed).filter((n) => n >= 13 && n % 2 === 1);
  return scoreStates(`w210-${seed}`, labels, statesForLabels(labels, mu));
});
const isp = sieve(maxN);
const compositePool = [];
for (let n = 25; n <= maxN; n += 2) {
  if (!isp[n] && gcd(n, 210) === 1) compositePool.push(n);
}
const compositeRuns = seeds.map((seed) => {
  const labels = sampleSorted(compositePool, realLabels.length, seed);
  return scoreStates(`composite-${seed}`, labels, statesForLabels(labels, mu));
});
const { pools: compositeResiduePools, fallback: compositeResidueFallback } = buildCompositeResiduePools(maxN, isp, localMod);
const localCompositeRuns = seeds.map((seed) => scoreStates(
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

const baseName = `squarefree-cloud-transition-operator-${maxN}`;
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
  overlap,
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
  overlap,
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
