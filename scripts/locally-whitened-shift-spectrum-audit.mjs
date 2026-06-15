#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polyMul,
  polySub,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 8_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 22);
const q3MaxDegree = Number(process.argv[5] || 13);

const W = 30030;
const seeds = [12345, 271828, 314159, 161803, 424242];
const integerShifts = [6, 12, 18, 24, 30, 42, 60, 90];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(200_000, Math.round(x)));

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

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length ? [Math.min(...usable), Math.max(...usable)] : [NaN, NaN];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function labelsUpTo(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return sorted.slice(0, hi);
}

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} from pool of ${pool.length}`);
  const random = rng(seed);
  const copy = pool.slice();
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (copy.length - i));
    const picked = copy[j];
    copy[j] = copy[i];
    copy[i] = picked;
    out[i] = picked;
  }
  out.sort((a, b) => a - b);
  return out;
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
  const usable = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (usable.length < 2) return 0;
  return linearFit(
    usable.map((row) => Math.log(row[scaleKey])),
    usable.map((row) => Math.log(row[key])),
  ).slope;
}

function eigenvaluesSymmetric(matrix) {
  const n = matrix.length;
  const a = matrix.map((row) => row.slice());
  for (let iter = 0; iter < 80 * n * n; iter++) {
    let p = 0, q = 1, maxOff = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const v = Math.abs(a[i][j]);
        if (v > maxOff) {
          maxOff = v;
          p = i;
          q = j;
        }
      }
    }
    if (maxOff < 1e-12) break;
    const app = a[p][p], aqq = a[q][q], apq = a[p][q];
    const theta = (aqq - app) / (2 * apq);
    const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;
    for (let k = 0; k < n; k++) {
      if (k === p || k === q) continue;
      const akp = a[k][p], akq = a[k][q];
      a[k][p] = c * akp - s * akq;
      a[p][k] = a[k][p];
      a[k][q] = s * akp + c * akq;
      a[q][k] = a[k][q];
    }
    a[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq;
    a[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq;
    a[p][q] = 0;
    a[q][p] = 0;
  }
  return a.map((row, i) => row[i]).sort((x, y) => x - y);
}

function matrixStats(columns, rates, opportunityCounts, edgeCounts) {
  const h = columns.length;
  const m = columns[0]?.length || 0;
  const means = new Float64Array(h);
  const vars = new Float64Array(h);
  for (let i = 0; i < h; i++) {
    let sum = 0, sumSq = 0;
    const col = columns[i];
    for (let row = 0; row < m; row++) {
      const v = col[row];
      sum += v;
      sumSq += v * v;
    }
    means[i] = sum / Math.max(1, m);
    vars[i] = Math.max(0, sumSq / Math.max(1, m) - means[i] * means[i]);
  }
  const corr = Array.from({ length: h }, () => Array(h).fill(0));
  let pairSq = 0, pairN = 0, maxAbsEntry = 0;
  for (let i = 0; i < h; i++) {
    for (let j = i + 1; j < h; j++) {
      let cross = 0;
      const ci = columns[i], cj = columns[j];
      for (let row = 0; row < m; row++) cross += ci[row] * cj[row];
      const cov = cross / Math.max(1, m) - means[i] * means[j];
      const denom = Math.sqrt(vars[i] * vars[j]);
      const value = denom > 0 ? cov / denom : 0;
      corr[i][j] = value;
      corr[j][i] = value;
      pairSq += value * value;
      pairN++;
      maxAbsEntry = Math.max(maxAbsEntry, Math.abs(value));
    }
  }
  const eigenvalues = eigenvaluesSymmetric(corr);
  const rho = Math.max(...eigenvalues.map((value) => Math.abs(value)));
  return {
    vertices: m,
    rates,
    opportunityCounts,
    edgeCounts,
    meanRate: mean(rates),
    corr,
    rho,
    rhoNorm: rho / Math.sqrt(Math.max(1, h - 1)),
    pairRms: Math.sqrt(pairSq / Math.max(1, pairN)),
    maxAbsEntry,
  };
}

function statsFromColumns(columns) {
  return matrixStats(columns, [], [], []);
}

function independentColumnPermutation(columns, seed) {
  const random = rng(seed);
  return columns.map((col) => {
    const out = Float64Array.from(col);
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = out[i];
      out[i] = out[j];
      out[j] = t;
    }
    return out;
  });
}

function integerEligiblePool(limit, primeFlags) {
  const all = [];
  const composite = [];
  for (let n = 5; n <= limit; n++) {
    if (gcd(n, W) !== 1) continue;
    all.push(n);
    if (!primeFlags[n]) composite.push(n);
  }
  return { all, composite };
}

function integerWhitenedStats(labels, limit, shifts, returnColumns = false) {
  const labelSet = new Set(labels.filter((x) => x <= limit));
  const vertices = labels.filter((x) => x <= limit);
  const h = shifts.length;
  const opportunityCounts = Array(h).fill(0);
  const edgeCounts = Array(h).fill(0);
  const opportunities = Array.from({ length: h }, () => new Uint8Array(vertices.length));
  const edges = Array.from({ length: h }, () => new Uint8Array(vertices.length));
  for (let row = 0; row < vertices.length; row++) {
    const p = vertices[row];
    for (let i = 0; i < h; i++) {
      const q = p + shifts[i];
      if (q > limit || gcd(q, W) !== 1) continue;
      opportunities[i][row] = 1;
      opportunityCounts[i]++;
      if (labelSet.has(q)) {
        edges[i][row] = 1;
        edgeCounts[i]++;
      }
    }
  }
  const rates = edgeCounts.map((count, i) => opportunityCounts[i] ? count / opportunityCounts[i] : 0);
  const columns = Array.from({ length: h }, (_, i) => {
    const out = new Float64Array(vertices.length);
    const r = rates[i];
    const denom = Math.sqrt(r * (1 - r));
    if (!(denom > 0)) return out;
    for (let row = 0; row < vertices.length; row++) {
      if (!opportunities[i][row]) continue;
      out[row] = (edges[i][row] - r) / denom;
    }
    return out;
  });
  const stats = matrixStats(columns, rates, opportunityCounts, edgeCounts);
  return returnColumns ? { stats, columns } : stats;
}

function summarizeControls(stats) {
  return {
    rho: range(stats.map((row) => row.rho)),
    rhoNorm: range(stats.map((row) => row.rhoNorm)),
    pairRms: range(stats.map((row) => row.pairRms)),
    maxAbsEntry: range(stats.map((row) => row.maxAbsEntry)),
    meanRate: range(stats.map((row) => row.meanRate)),
  };
}

function runIntegerAudit() {
  const primeFlags = sieve(N + Math.max(...integerShifts));
  const allPrimes = primesUpTo(N);
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[whitened-shift] integer N=${limit}`);
    const primes = labelsUpTo(allPrimes, limit);
    const realWithColumns = integerWhitenedStats(primes, limit, integerShifts, true);
    const { all, composite } = integerEligiblePool(limit, primeFlags);
    const cramerControls = seeds.map((seed) => integerWhitenedStats(cramerPrimes(limit, seed), limit, integerShifts));
    const eligibleControls = seeds.map((seed) => integerWhitenedStats(sampleWithoutReplacement(all, primes.length, seed ^ limit), limit, integerShifts));
    const compositeControls = seeds.map((seed) => integerWhitenedStats(sampleWithoutReplacement(composite, primes.length, seed ^ 0x9e3779b9 ^ limit), limit, integerShifts));
    const columnControls = seeds.map((seed) => statsFromColumns(independentColumnPermutation(realWithColumns.columns, seed ^ 0x51f15e ^ limit)));
    rows.push({
      N: limit,
      labels: primes.length,
      real: realWithColumns.stats,
      controls: { cramer: cramerControls, eligible: eligibleControls, composite: compositeControls, column: columnControls },
      summary: {
        cramer: summarizeControls(cramerControls),
        eligible: summarizeControls(eligibleControls),
        composite: summarizeControls(compositeControls),
        column: summarizeControls(columnControls),
      },
    });
  }
  return {
    shifts: integerShifts,
    rows,
    theta: {
      rho: exponent(rows.map((row) => ({ labels: row.labels, rho: row.real.rho })), "rho", "labels"),
      pairRms: exponent(rows.map((row) => ({ labels: row.labels, pairRms: row.real.pairRms })), "pairRms", "labels"),
    },
  };
}

function polyLinearProduct(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + a, q);
  return product;
}

function uniquePolynomialShifts(q) {
  const base = polyLinearProduct(q);
  const lows = q === 2 ? [1, 2, 3, 5, 7, 11, 13, 17] : [1, 2, 3, 4, 5, 7];
  const seen = new Set();
  const shifts = [];
  for (const low of lows) {
    const candidates = q === 2
      ? [polyMul(base, low, q)]
      : [polyMul(base, low, q), polySub(0, polyMul(base, low, q), q)];
    for (const h of candidates) {
      if (!h || seen.has(h)) continue;
      seen.add(h);
      shifts.push(h);
      if (shifts.length === 8) return shifts;
    }
  }
  return shifts;
}

function polynomialLabels(universe, degree, count, seed, mode) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const pool = [];
  for (let lower = 0; lower < flags.length; lower++) {
    if (mode === "reducible" && flags[lower]) continue;
    pool.push(lead + lower);
  }
  return sampleWithoutReplacement(pool, count, seed);
}

function polynomialWhitenedStats(universe, degree, shifts, labels, returnColumns = false) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const top = lead + universe.pow[degree];
  const labelSet = new Set(labels);
  const h = shifts.length;
  const opportunityCounts = Array(h).fill(0);
  const edgeCounts = Array(h).fill(0);
  const opportunities = Array.from({ length: h }, () => new Uint8Array(labels.length));
  const edges = Array.from({ length: h }, () => new Uint8Array(labels.length));
  for (let row = 0; row < labels.length; row++) {
    const f = labels[row];
    for (let i = 0; i < h; i++) {
      const g = polyAdd(f, shifts[i], q);
      if (g < lead || g >= top) continue;
      opportunities[i][row] = 1;
      opportunityCounts[i]++;
      if (labelSet.has(g)) {
        edges[i][row] = 1;
        edgeCounts[i]++;
      }
    }
  }
  const rates = edgeCounts.map((count, i) => opportunityCounts[i] ? count / opportunityCounts[i] : 0);
  const columns = Array.from({ length: h }, (_, i) => {
    const out = new Float64Array(labels.length);
    const r = rates[i];
    const denom = Math.sqrt(r * (1 - r));
    if (!(denom > 0)) return out;
    for (let row = 0; row < labels.length; row++) {
      if (!opportunities[i][row]) continue;
      out[row] = (edges[i][row] - r) / denom;
    }
    return out;
  });
  const stats = matrixStats(columns, rates, opportunityCounts, edgeCounts);
  return returnColumns ? { stats, columns } : stats;
}

function runPolynomialAudit(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const shifts = uniquePolynomialShifts(q);
  const rows = [];
  for (let degree = Math.max(2, maxDegree - 3); degree <= maxDegree; degree++) {
    console.error(`[whitened-shift] F_${q}[t] degree=${degree}`);
    const labels = universe.irreduciblesByDegree[degree];
    const realWithColumns = polynomialWhitenedStats(universe, degree, shifts, labels, true);
    const monicControls = seeds.map((seed) => polynomialWhitenedStats(universe, degree, shifts, polynomialLabels(universe, degree, labels.length, seed, "monic")));
    const reducibleControls = seeds.map((seed) => polynomialWhitenedStats(universe, degree, shifts, polynomialLabels(universe, degree, labels.length, seed ^ 0x9e3779b9, "reducible")));
    const columnControls = seeds.map((seed) => statsFromColumns(independentColumnPermutation(realWithColumns.columns, seed ^ (q * 0x51f15e))));
    rows.push({
      degree,
      labels: labels.length,
      real: realWithColumns.stats,
      controls: { monic: monicControls, reducible: reducibleControls, column: columnControls },
      summary: {
        monic: summarizeControls(monicControls),
        reducible: summarizeControls(reducibleControls),
        column: summarizeControls(columnControls),
      },
    });
  }
  return {
    q,
    shifts: shifts.map((h) => polyToString(h, q)),
    rows,
    theta: {
      rho: exponent(rows.map((row) => ({ labels: row.labels, rho: row.real.rho })), "rho", "labels"),
      pairRms: exponent(rows.map((row) => ({ labels: row.labels, pairRms: row.real.pairRms })), "pairRms", "labels"),
    },
  };
}

function tableInteger(rows) {
  return rows.map((row) => {
    const c = row.summary.composite.rho;
    const e = row.summary.eligible.rho;
    const col = row.summary.column.rho;
    return `| ${row.N} | ${row.labels} | ${fmt(row.real.rho)} | ${fmt(row.real.pairRms)} | ${fmt(row.real.meanRate)} | ${fmt(e[0])}..${fmt(e[1])} | ${fmt(c[0])}..${fmt(c[1])} | ${fmt(col[0])}..${fmt(col[1])} |`;
  }).join("\n");
}

function tableField(group) {
  return group.rows.map((row) => {
    const m = row.summary.monic.rho;
    const r = row.summary.reducible.rho;
    const c = row.summary.column.rho;
    return `| ${row.degree} | ${row.labels} | ${fmt(row.real.rho)} | ${fmt(row.real.pairRms)} | ${fmt(row.real.meanRate)} | ${fmt(m[0])}..${fmt(m[1])} | ${fmt(r[0])}..${fmt(r[1])} | ${fmt(c[0])}..${fmt(c[1])} |`;
  }).join("\n");
}

function svg(output) {
  const width = 1120, height = 620, pad = 64;
  const rows = output.integer.rows;
  const minX = rows[0].N, maxX = rows.at(-1).N;
  const allY = rows.flatMap((row) => [
    row.real.rho,
    ...row.summary.composite.rho,
    ...row.summary.eligible.rho,
  ]).concat(output.q2.rows.map((row) => row.real.rho), output.q3.rows.map((row) => row.real.rho)).filter(Number.isFinite);
  const minY = 0;
  const maxY = Math.max(0.5, ...allY) * 1.08;
  const xScale = (x) => pad + (Math.log(x) - Math.log(minX)) / (Math.log(maxX) - Math.log(minX)) * (width * 0.62 - pad * 1.2);
  const yScale = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const line = (points, color, sw = 2, dash = "") => {
    const finite = points.filter(([, y]) => Number.isFinite(y));
    const d = finite.map(([x, y], i) => `${i ? "L" : "M"} ${xScale(x).toFixed(2)} ${yScale(y).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  };
  const paths = [
    line(rows.map((row) => [row.N, row.real.rho]), "#67e8f9", 3),
    line(rows.map((row) => [row.N, row.summary.composite.rho[0]]), "#fb7185", 1.5, "4 4"),
    line(rows.map((row) => [row.N, row.summary.composite.rho[1]]), "#fb7185", 1.5, "4 4"),
    line(rows.map((row) => [row.N, row.summary.eligible.rho[0]]), "#fbbf24", 1.5, "2 5"),
    line(rows.map((row) => [row.N, row.summary.eligible.rho[1]]), "#fbbf24", 1.5, "2 5"),
  ].join("\n");
  const fieldX = width * 0.68;
  const fieldRows = [
    ...output.q2.rows.map((row) => ({ name: `F2 d${row.degree}`, color: "#a78bfa", value: row.real.rho, ctrl: row.summary.reducible.rho })),
    ...output.q3.rows.map((row) => ({ name: `F3 d${row.degree}`, color: "#34d399", value: row.real.rho, ctrl: row.summary.reducible.rho })),
  ];
  const fieldText = fieldRows.map((row, i) => {
    const y = 110 + i * 28;
    const bar = Math.min(190, Math.max(0, (row.value - minY) / ((maxY - minY) || 1) * 190));
    return `<g><text x="${fieldX}" y="${y}" fill="${row.color}">${row.name}</text><rect x="${fieldX + 80}" y="${y - 12}" width="${bar.toFixed(2)}" height="10" fill="${row.color}" opacity="0.75"/><text x="${fieldX + 280}" y="${y}" fill="#cbd5e1">${fmt(row.value)} / red ${fmt(row.ctrl[0])}..${fmt(row.ctrl[1])}</text></g>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace" font-size="12">
${paths}
<text x="${pad}" y="30" fill="#e2e8f0" font-size="18" font-weight="700">Locally whitened shift-incidence spectrum</text>
<text x="${pad}" y="52" fill="#94a3b8">y: spectral radius of off-diagonal covariance after shift opportunity whitening</text>
<text x="${pad}" y="${height - 18}" fill="#94a3b8">cyan real Z; red sampled final-eligible composites; yellow final-eligible random controls</text>
<text x="${fieldX}" y="72" fill="#e2e8f0" font-size="14" font-weight="700">Function-field real rho / reducible range</text>
${fieldText}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[whitened-shift] integer max N=${N}`);
const integer = runIntegerAudit();
console.error(`[whitened-shift] polynomial universes`);
const q2 = runPolynomialAudit(2, q2MaxDegree);
const q3 = runPolynomialAudit(3, q3MaxDegree);

const output = {
  candidate: "locally whitened shift-incidence spectrum",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  W,
  seeds,
  integer,
  q2,
  q3,
};

const base = `locally-whitened-shift-spectrum-audit-${N}`;
const jsonPath = path.join(outDir, `${base}.json`);
const mdPath = path.join(outDir, `${base}.md`);
const svgPath = path.join(outDir, `${base}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(output));

const md = `# locally whitened shift-incidence spectrum audit

Candidate:
center each fixed shift by its observed pair rate over locally admissible
opportunities, whiten the incidence columns, and score the off-diagonal
covariance spectral radius.

## Integer side

Rho theta: \`${fmt(integer.theta.rho)}\`; pairRms theta:
\`${fmt(integer.theta.pairRms)}\`.

| N | labels | real rho | real pairRms | mean pair rate | eligible rho range | composite rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${tableInteger(integer.rows)}

## Function fields

F_2[t] shifts: ${q2.shifts.join(", ")}

| degree | labels | real rho | real pairRms | mean pair rate | monic rho range | reducible rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${tableField(q2)}

F_3[t] shifts: ${q3.shifts.join(", ")}

| degree | labels | real rho | real pairRms | mean pair rate | monic rho range | reducible rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${tableField(q3)}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  integerEndpoint: integer.rows.at(-1).real,
  integerEndpointCompositeRange: integer.rows.at(-1).summary.composite.rho,
  q2Endpoint: q2.rows.at(-1).real,
  q2EndpointReducibleRange: q2.rows.at(-1).summary.reducible.rho,
  q3Endpoint: q3.rows.at(-1).real,
  q3EndpointReducibleRange: q3.rows.at(-1).summary.reducible.rho,
}, null, 2));
