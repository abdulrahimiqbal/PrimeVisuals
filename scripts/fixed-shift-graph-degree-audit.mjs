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
  return [Math.min(...values), Math.max(...values)];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
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
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function labelsUpTo(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return sorted.slice(0, hi);
}

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} from pool of ${pool.length}`);
  const rnd = rng(seed);
  const copy = pool.slice();
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rnd() * (copy.length - i));
    const value = copy[j];
    copy[j] = copy[i];
    copy[i] = value;
    out[i] = value;
  }
  out.sort((a, b) => a - b);
  return out;
}

function integerCompositePool(limit, primeFlags) {
  const out = [];
  for (let n = 5; n <= limit; n++) {
    if (primeFlags[n]) continue;
    if (gcd(n, 30030) !== 1) continue;
    out.push(n);
  }
  return out;
}

function degreeStats(degrees, shiftCount) {
  const n = degrees.length;
  let sum = 0;
  let maxDegree = 0;
  let zeroes = 0;
  for (const d of degrees) {
    sum += d;
    if (d > maxDegree) maxDegree = d;
    if (d === 0) zeroes++;
  }
  const m = sum / Math.max(1, n);
  let ss = 0;
  for (const d of degrees) ss += (d - m) ** 2;
  const variance = ss / Math.max(1, n);
  const std = Math.sqrt(variance);
  const D = std / Math.sqrt(m || 1);
  const zeroFrac = zeroes / Math.max(1, n);
  return { vertices: n, meanDegree: m, std, D, zeroFrac, maxDegree, shiftCount };
}

function integerGraphStats(labels, limit, shifts) {
  const maxShift = Math.max(...shifts);
  const flags = new Uint8Array(limit + maxShift + 1);
  const index = new Map();
  const vertices = [];
  for (const label of labels) {
    if (label > limit) continue;
    index.set(label, vertices.length);
    flags[label] = 1;
    vertices.push(label);
  }
  const degrees = new Int16Array(vertices.length);
  const shiftEdges = shifts.map((h) => ({ h, edges: 0 }));
  for (let i = 0; i < vertices.length; i++) {
    const p = vertices[i];
    for (const row of shiftEdges) {
      const q = p + row.h;
      if (q <= limit && flags[q]) {
        degrees[i]++;
        const j = index.get(q);
        if (j !== undefined) degrees[j]++;
        row.edges++;
      }
    }
  }
  return {
    ...degreeStats(Array.from(degrees), shifts.length),
    edges: shiftEdges.reduce((sum, row) => sum + row.edges, 0),
    shiftEdges,
  };
}

function summarizeControls(flows) {
  return {
    D: range(flows.map((flow) => flow.D)),
    meanDegree: range(flows.map((flow) => flow.meanDegree)),
    zeroFrac: range(flows.map((flow) => flow.zeroFrac)),
  };
}

function runIntegerAudit() {
  const primeFlags = sieve(N + Math.max(...integerShifts));
  const allPrimes = primesUpTo(N);
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[fixed-shift-graph] integer N=${limit}`);
    const primes = labelsUpTo(allPrimes, limit);
    const real = integerGraphStats(primes, limit, integerShifts);
    const composites = integerCompositePool(limit, primeFlags);
    const cramer = seeds.map((seed) => {
      const labels = cramerPrimes(limit, seed).filter((n) => n <= limit);
      return integerGraphStats(labels, limit, integerShifts);
    });
    const composite = seeds.map((seed) => integerGraphStats(sampleWithoutReplacement(composites, primes.length, seed), limit, integerShifts));
    rows.push({
      N: limit,
      labels: primes.length,
      real,
      cramer: summarizeControls(cramer),
      composite: summarizeControls(composite),
    });
  }
  return {
    shifts: integerShifts,
    rows,
    DTheta: exponent(rows.map((row) => ({ labels: row.labels, D: row.real.D })), "D", "labels"),
    meanDegreeTheta: exponent(rows.map((row) => ({ labels: row.labels, meanDegree: row.real.meanDegree })), "meanDegree", "labels"),
  };
}

function polyLinearProduct(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + a, q);
  return product;
}

function uniquePolynomialShifts(q) {
  const base = polyLinearProduct(q);
  const lows = q === 2 ? [1, 2, 3, 5, 7, 11] : [1, 2, 3, 4, 5, 7];
  const seen = new Set();
  const shifts = [];
  for (const low of lows) {
    for (const h of [polyMul(base, low, q), polySub(0, polyMul(base, low, q), q)]) {
      if (!h || seen.has(h)) continue;
      seen.add(h);
      shifts.push(h);
    }
  }
  return shifts;
}

function polynomialGraphStats(universe, degree, shifts) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const vertices = universe.irreduciblesByDegree[degree];
  const lowerIndex = new Map(vertices.map((poly, i) => [poly - lead, i]));
  const degrees = new Int16Array(vertices.length);
  const shiftEdges = shifts.map((h) => ({ h, label: polyToString(h, q), edges: 0 }));
  for (let i = 0; i < vertices.length; i++) {
    const f = vertices[i];
    for (const row of shiftEdges) {
      const g = polyAdd(f, row.h, q);
      const lower = g - lead;
      if (lower >= 0 && lower < flags.length && flags[lower]) {
        degrees[i]++;
        const j = lowerIndex.get(lower);
        if (j !== undefined) degrees[j]++;
        row.edges++;
      }
    }
  }
  return {
    ...degreeStats(Array.from(degrees), shifts.length),
    edges: shiftEdges.reduce((sum, row) => sum + row.edges, 0),
    shiftEdges,
  };
}

function samplePolynomialLabels(universe, degree, count, seed, mode) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const pool = [];
  for (let lower = 0; lower < flags.length; lower++) {
    if (mode === "reducible" && flags[lower]) continue;
    if (mode === "monic" || mode === "reducible") pool.push(lead + lower);
  }
  return sampleWithoutReplacement(pool, count, seed);
}

function polynomialGraphStatsForLabels(universe, degree, shifts, labels) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const labelSet = new Set(labels);
  const degrees = new Int16Array(labels.length);
  const index = new Map(labels.map((poly, i) => [poly, i]));
  const shiftEdges = shifts.map((h) => ({ h, label: polyToString(h, q), edges: 0 }));
  for (let i = 0; i < labels.length; i++) {
    const f = labels[i];
    for (const row of shiftEdges) {
      const g = polyAdd(f, row.h, q);
      if (g >= lead && g < lead + universe.pow[degree] && labelSet.has(g)) {
        degrees[i]++;
        const j = index.get(g);
        if (j !== undefined) degrees[j]++;
        row.edges++;
      }
    }
  }
  return {
    ...degreeStats(Array.from(degrees), shifts.length),
    edges: shiftEdges.reduce((sum, row) => sum + row.edges, 0),
    shiftEdges,
  };
}

function runPolynomialAudit(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const shifts = uniquePolynomialShifts(q);
  const rows = [];
  for (let degree = Math.max(2, maxDegree - 3); degree <= maxDegree; degree++) {
    console.error(`[fixed-shift-graph] F_${q}[t] degree=${degree}`);
    const real = polynomialGraphStats(universe, degree, shifts);
    const count = universe.irreduciblesByDegree[degree].length;
    const randomMonic = seeds.map((seed) => polynomialGraphStatsForLabels(universe, degree, shifts, samplePolynomialLabels(universe, degree, count, seed, "monic")));
    const randomReducible = seeds.map((seed) => polynomialGraphStatsForLabels(universe, degree, shifts, samplePolynomialLabels(universe, degree, count, seed ^ 0x9e3779b9, "reducible")));
    rows.push({
      degree,
      labels: count,
      real,
      randomMonic: summarizeControls(randomMonic),
      randomReducible: summarizeControls(randomReducible),
    });
  }
  return {
    q,
    shifts: shifts.map((h) => polyToString(h, q)),
    rows,
    DTheta: exponent(rows.map((row) => ({ labels: row.labels, D: row.real.D })), "D", "labels"),
    meanDegreeTheta: exponent(rows.map((row) => ({ labels: row.labels, meanDegree: row.real.meanDegree })), "meanDegree", "labels"),
  };
}

function line(points, xOf, yOf) {
  return points.map((point) => `${xOf(point).toFixed(2)},${yOf(point).toFixed(2)}`).join(" ");
}

function makeSvg(report) {
  const width = 1120, height = 640;
  const margin = { left: 70, right: 30, top: 62, bottom: 70 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const f2 = report.polynomial.find((group) => group.q === 2);
  const f3 = report.polynomial.find((group) => group.q === 3);
  const series = [
    { id: "Z prime graph D", color: "#67e8f9", rows: report.integer.rows.map((row, i) => ({ x: i, y: row.real.D })) },
    { id: "Z Cramer D", color: "#fb7185", rows: report.integer.rows.map((row, i) => ({ x: i, y: mean(row.cramer.D) })) },
    { id: "Z composite D", color: "#a78bfa", rows: report.integer.rows.map((row, i) => ({ x: i, y: mean(row.composite.D) })) },
    { id: "F_2 graph D", color: "#34d399", rows: f2.rows.map((row, i) => ({ x: i + 6, y: row.real.D })) },
    { id: "F_3 graph D", color: "#60a5fa", rows: f3.rows.map((row, i) => ({ x: i + 11, y: row.real.D })) },
  ];
  const allY = series.flatMap((s) => s.rows.map((row) => row.y)).filter(Number.isFinite);
  const yMin = 0;
  const yMax = Math.max(2, Math.max(...allY) * 1.1);
  const xMin = 0, xMax = 14;
  const xOf = (point) => margin.left + ((point.x - xMin) / (xMax - xMin)) * plotW;
  const yOf = (point) => margin.top + (1 - ((point.y - yMin) / (yMax - yMin))) * plotH;
  const grid = [];
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + (i / 5) * plotH;
    const val = yMax - (i / 5) * (yMax - yMin);
    grid.push(`<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1f2937" stroke-width="1"/>`);
    grid.push(`<text x="18" y="${y + 4}" fill="#94a3b8" font-size="12">${fmt(val, 2)}</text>`);
  }
  const paths = series.map((s) => {
    const circles = s.rows.map((point) => `<circle cx="${xOf(point)}" cy="${yOf(point)}" r="4" fill="${s.color}"/>`).join("");
    return `<polyline points="${line(s.rows, xOf, yOf)}" fill="none" stroke="${s.color}" stroke-width="3"/>${circles}`;
  }).join("\n");
  const legend = series.map((s, i) => {
    const x = 70 + (i % 3) * 270;
    const y = 42 + Math.floor(i / 3) * 18;
    return `<text x="${x}" y="${y}" fill="${s.color}" font-size="13">${s.id}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="70" y="26" fill="#e5e7eb" font-size="18" font-weight="700">fixed-shift graph degree spectrum</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${paths}
<text x="70" y="${height - 34}" fill="#94a3b8" font-size="13">y: D = std(fixed-shift graph degree) / sqrt(mean degree); integer endpoints, then F_2 and F_3 degrees</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Fixed-shift graph degree-spectrum audit", "");
  lines.push("Candidate:");
  lines.push("build an unordered graph on primes/irreducibles using a fixed admissible shift set and score `D=std(degree)/sqrt(mean degree)`.", "");
  lines.push("## Integer side", "");
  lines.push(`Shifts: ${report.integer.shifts.join(", ")}`, "");
  lines.push("| N | labels | mean degree | D | zero frac | shift edges |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.integer.rows) {
    lines.push(`| ${row.N} | ${row.labels} | ${fmt(row.real.meanDegree)} | ${fmt(row.real.D)} | ${fmt(row.real.zeroFrac)} | ${row.real.shiftEdges.map((s) => `${s.h}:${s.edges}`).join(", ")} |`);
  }
  lines.push("");
  lines.push(`Integer exponent fits: \`D theta=${fmt(report.integer.DTheta)}\`, \`meanDegree theta=${fmt(report.integer.meanDegreeTheta)}\`.`);
  const last = report.integer.rows.at(-1);
  lines.push("");
  lines.push(`Endpoint controls at N=${last.N}:`);
  lines.push("");
  lines.push("| group | D range | mean degree range | zero frac range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, summary] of [["Cramer labels", last.cramer], ["sampled composites", last.composite]]) {
    lines.push(`| ${name} | ${fmt(summary.D[0])} .. ${fmt(summary.D[1])} | ${fmt(summary.meanDegree[0])} .. ${fmt(summary.meanDegree[1])} | ${fmt(summary.zeroFrac[0])} .. ${fmt(summary.zeroFrac[1])} |`);
  }
  lines.push("");
  for (const group of report.polynomial) {
    lines.push(`## F_${group.q}[t] side`, "");
    lines.push(`Shifts: ${group.shifts.join(", ")}`, "");
    lines.push("| degree | labels | mean degree | D | zero frac |");
    lines.push("| ---: | ---: | ---: | ---: | ---: |");
    for (const row of group.rows) {
      lines.push(`| ${row.degree} | ${row.labels} | ${fmt(row.real.meanDegree)} | ${fmt(row.real.D)} | ${fmt(row.real.zeroFrac)} |`);
    }
    lines.push("");
    lines.push(`Exponent fits: \`D theta=${fmt(group.DTheta)}\`, \`meanDegree theta=${fmt(group.meanDegreeTheta)}\`.`);
    const end = group.rows.at(-1);
    lines.push("");
    lines.push(`Endpoint controls at degree=${end.degree}:`);
    lines.push("");
    lines.push("| group | D range | mean degree range | zero frac range |");
    lines.push("| --- | ---: | ---: | ---: |");
    for (const [name, summary] of [["random monic", end.randomMonic], ["random reducible", end.randomReducible]]) {
      lines.push(`| ${name} | ${fmt(summary.D[0])} .. ${fmt(summary.D[1])} | ${fmt(summary.meanDegree[0])} .. ${fmt(summary.meanDegree[1])} | ${fmt(summary.zeroFrac[0])} .. ${fmt(summary.zeroFrac[1])} |`);
    }
    lines.push("");
  }
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[fixed-shift-graph] integer max N=${N}`);
const integer = runIntegerAudit();
console.error(`[fixed-shift-graph] polynomial universes F_2 degree=${q2MaxDegree}, F_3 degree=${q3MaxDegree}`);
const polynomial = [
  runPolynomialAudit(2, q2MaxDegree),
  runPolynomialAudit(3, q3MaxDegree),
];

const base = `fixed-shift-graph-degree-audit-${N}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "fixed-shift prime graph degree spectrum",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  seeds,
  integer,
  polynomial,
  paths,
};
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  integerEndpoint: {
    N: integer.rows.at(-1).N,
    labels: integer.rows.at(-1).labels,
    meanDegree: integer.rows.at(-1).real.meanDegree,
    D: integer.rows.at(-1).real.D,
    cramerDRange: integer.rows.at(-1).cramer.D,
    compositeDRange: integer.rows.at(-1).composite.D,
  },
  fieldEndpoints: polynomial.map((group) => ({
    q: group.q,
    degree: group.rows.at(-1).degree,
    meanDegree: group.rows.at(-1).real.meanDegree,
    D: group.rows.at(-1).real.D,
  })),
  paths,
}, null, 2));
