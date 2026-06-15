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

function eigenvaluesSymmetric(matrix) {
  const n = matrix.length;
  const a = matrix.map((row) => row.slice());
  const maxIter = 80 * n * n;
  for (let iter = 0; iter < maxIter; iter++) {
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
    const c = 1 / Math.sqrt(t * t + 1);
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

function operatorStatsFromCounts(vertexCount, shiftCounts, pairCounts) {
  const m = Math.max(1, vertexCount);
  const h = shiftCounts.length;
  const corr = Array.from({ length: h }, () => Array(h).fill(0));
  let offSq = 0, pairSq = 0, maxAbsEntry = 0, pairN = 0;
  for (let i = 0; i < h; i++) {
    for (let j = i + 1; j < h; j++) {
      const pi = shiftCounts[i] / m;
      const pj = shiftCounts[j] / m;
      const pij = pairCounts[i][j] / m;
      const denom = Math.sqrt(pi * (1 - pi) * pj * (1 - pj));
      const c = denom > 0 ? (pij - pi * pj) / denom : 0;
      corr[i][j] = c;
      corr[j][i] = c;
      offSq += 2 * c * c;
      pairSq += c * c;
      pairN++;
      maxAbsEntry = Math.max(maxAbsEntry, Math.abs(c));
    }
  }
  const eigenvalues = eigenvaluesSymmetric(corr);
  const rho = Math.max(...eigenvalues.map((value) => Math.abs(value)));
  const fro = Math.sqrt(offSq);
  const pairRms = Math.sqrt(pairSq / Math.max(1, pairN));
  const meanShiftRate = mean(shiftCounts.map((count) => count / m));
  return {
    vertices: vertexCount,
    shiftCounts: Array.from(shiftCounts),
    shiftRates: shiftCounts.map((count) => count / m),
    meanShiftRate,
    corr,
    eigenvalues,
    rho,
    rhoNorm: rho / Math.sqrt(Math.max(1, h - 1)),
    fro,
    pairRms,
    maxAbsEntry,
  };
}

function integerIncidenceStats(labels, limit, shifts) {
  const maxShift = Math.max(...shifts);
  const flags = new Uint8Array(limit + maxShift + 1);
  const vertices = [];
  for (const label of labels) {
    if (label > limit) continue;
    flags[label] = 1;
    vertices.push(label);
  }
  const h = shifts.length;
  const shiftCounts = Array(h).fill(0);
  const pairCounts = Array.from({ length: h }, () => Array(h).fill(0));
  for (const p of vertices) {
    const active = [];
    for (let i = 0; i < h; i++) {
      const q = p + shifts[i];
      if (q <= limit && flags[q]) {
        active.push(i);
        shiftCounts[i]++;
      }
    }
    for (let a = 0; a < active.length; a++) {
      for (let b = a + 1; b < active.length; b++) {
        pairCounts[active[a]][active[b]]++;
      }
    }
  }
  return operatorStatsFromCounts(vertices.length, shiftCounts, pairCounts);
}

function exactColumnNullStats(vertexCount, shiftCounts, seed) {
  const rnd = rng(seed);
  const columns = shiftCounts.map((count) => {
    const flags = new Uint8Array(vertexCount);
    let chosen = 0;
    while (chosen < count) {
      const index = Math.floor(rnd() * vertexCount);
      if (flags[index]) continue;
      flags[index] = 1;
      chosen++;
    }
    return flags;
  });
  const h = shiftCounts.length;
  const pairCounts = Array.from({ length: h }, () => Array(h).fill(0));
  for (let i = 0; i < h; i++) {
    for (let j = i + 1; j < h; j++) {
      let count = 0;
      const a = columns[i], b = columns[j];
      for (let row = 0; row < vertexCount; row++) if (a[row] && b[row]) count++;
      pairCounts[i][j] = count;
    }
  }
  return operatorStatsFromCounts(vertexCount, shiftCounts, pairCounts);
}

function summarizeControls(stats) {
  return {
    rho: range(stats.map((row) => row.rho)),
    rhoNorm: range(stats.map((row) => row.rhoNorm)),
    fro: range(stats.map((row) => row.fro)),
    pairRms: range(stats.map((row) => row.pairRms)),
    maxAbsEntry: range(stats.map((row) => row.maxAbsEntry)),
    meanShiftRate: range(stats.map((row) => row.meanShiftRate)),
  };
}

function runIntegerAudit() {
  const primeFlags = sieve(N + Math.max(...integerShifts));
  const allPrimes = primesUpTo(N);
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[shift-incidence-operator] integer N=${limit}`);
    const primes = labelsUpTo(allPrimes, limit);
    const real = integerIncidenceStats(primes, limit, integerShifts);
    const composites = integerCompositePool(limit, primeFlags);
    const cramerControls = seeds.map((seed) => {
      const labels = cramerPrimes(limit, seed).filter((n) => n <= limit);
      return integerIncidenceStats(labels, limit, integerShifts);
    });
    const compositeControls = seeds.map((seed) => integerIncidenceStats(
      sampleWithoutReplacement(composites, primes.length, seed),
      limit,
      integerShifts,
    ));
    const columnNullControls = seeds.map((seed) => exactColumnNullStats(
      real.vertices,
      real.shiftCounts,
      seed ^ 0x51f15e,
    ));
    rows.push({
      N: limit,
      labels: primes.length,
      real,
      cramerControls,
      compositeControls,
      columnNullControls,
      cramer: summarizeControls(cramerControls),
      composite: summarizeControls(compositeControls),
      columnNull: summarizeControls(columnNullControls),
    });
  }
  return {
    shifts: integerShifts,
    rows,
    rhoTheta: exponent(rows.map((row) => ({ labels: row.labels, rho: row.real.rho })), "rho", "labels"),
    rhoNormTheta: exponent(rows.map((row) => ({ labels: row.labels, rhoNorm: row.real.rhoNorm })), "rhoNorm", "labels"),
    pairRmsTheta: exponent(rows.map((row) => ({ labels: row.labels, pairRms: row.real.pairRms })), "pairRms", "labels"),
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

function polynomialIncidenceStats(universe, degree, shifts, labels) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const labelSet = new Set(labels);
  const h = shifts.length;
  const shiftCounts = Array(h).fill(0);
  const pairCounts = Array.from({ length: h }, () => Array(h).fill(0));
  for (const f of labels) {
    const active = [];
    for (let i = 0; i < h; i++) {
      const g = polyAdd(f, shifts[i], q);
      if (g >= lead && g < lead + universe.pow[degree] && labelSet.has(g)) {
        active.push(i);
        shiftCounts[i]++;
      }
    }
    for (let a = 0; a < active.length; a++) {
      for (let b = a + 1; b < active.length; b++) {
        pairCounts[active[a]][active[b]]++;
      }
    }
  }
  return operatorStatsFromCounts(labels.length, shiftCounts, pairCounts);
}

function samplePolynomialLabels(universe, degree, count, seed, mode) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const pool = [];
  for (let lower = 0; lower < flags.length; lower++) {
    if (mode === "reducible" && flags[lower]) continue;
    pool.push(lead + lower);
  }
  return sampleWithoutReplacement(pool, count, seed);
}

function runPolynomialAudit(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const shifts = uniquePolynomialShifts(q);
  const rows = [];
  for (let degree = Math.max(2, maxDegree - 3); degree <= maxDegree; degree++) {
    console.error(`[shift-incidence-operator] F_${q}[t] degree=${degree}`);
    const labels = universe.irreduciblesByDegree[degree];
    const real = polynomialIncidenceStats(universe, degree, shifts, labels);
    const randomMonicControls = seeds.map((seed) => polynomialIncidenceStats(
      universe,
      degree,
      shifts,
      samplePolynomialLabels(universe, degree, labels.length, seed, "monic"),
    ));
    const randomReducibleControls = seeds.map((seed) => polynomialIncidenceStats(
      universe,
      degree,
      shifts,
      samplePolynomialLabels(universe, degree, labels.length, seed ^ 0x9e3779b9, "reducible"),
    ));
    const columnNullControls = seeds.map((seed) => exactColumnNullStats(
      real.vertices,
      real.shiftCounts,
      seed ^ (q * 0x51f15e),
    ));
    rows.push({
      degree,
      labels: labels.length,
      real,
      randomMonicControls,
      randomReducibleControls,
      columnNullControls,
      randomMonic: summarizeControls(randomMonicControls),
      randomReducible: summarizeControls(randomReducibleControls),
      columnNull: summarizeControls(columnNullControls),
    });
  }
  return {
    q,
    shifts: shifts.map((h) => polyToString(h, q)),
    rows,
    rhoTheta: exponent(rows.map((row) => ({ labels: row.labels, rho: row.real.rho })), "rho", "labels"),
    rhoNormTheta: exponent(rows.map((row) => ({ labels: row.labels, rhoNorm: row.real.rhoNorm })), "rhoNorm", "labels"),
    pairRmsTheta: exponent(rows.map((row) => ({ labels: row.labels, pairRms: row.real.pairRms })), "pairRms", "labels"),
  };
}

function topPairs(stats, shifts, limit = 5) {
  const pairs = [];
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      pairs.push({ pair: `${shifts[i]} / ${shifts[j]}`, value: stats.corr[i][j] });
    }
  }
  return pairs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, limit);
}

function line(points, xOf, yOf) {
  return points.map((point) => `${xOf(point).toFixed(2)},${yOf(point).toFixed(2)}`).join(" ");
}

function heatColor(value, scale) {
  const t = Math.min(1, Math.abs(value) / (scale || 1));
  const alpha = 0.16 + 0.84 * t;
  return value >= 0
    ? `rgba(248,113,113,${alpha.toFixed(3)})`
    : `rgba(34,211,238,${alpha.toFixed(3)})`;
}

function matrixSvg(stats, x, y, cell, title) {
  const h = stats.corr.length;
  const scale = Math.max(0.01, stats.maxAbsEntry);
  const rects = [];
  rects.push(`<text x="${x}" y="${y - 8}" fill="#e5e7eb" font-size="12">${title}</text>`);
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < h; j++) {
      const value = i === j ? 0 : stats.corr[i][j];
      const fill = i === j ? "#111827" : heatColor(value, scale);
      rects.push(`<rect x="${x + j * cell}" y="${y + i * cell}" width="${cell - 1}" height="${cell - 1}" fill="${fill}"/>`);
    }
  }
  rects.push(`<text x="${x}" y="${y + h * cell + 15}" fill="#94a3b8" font-size="11">rho ${fmt(stats.rho, 3)} max ${fmt(stats.maxAbsEntry, 3)}</text>`);
  return rects.join("\n");
}

function makeSvg(report) {
  const width = 1240, height = 720;
  const margin = { left: 70, right: 490, top: 70, bottom: 72 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const f2 = report.polynomial.find((group) => group.q === 2);
  const f3 = report.polynomial.find((group) => group.q === 3);
  const series = [
    { id: "Z prime rho", color: "#67e8f9", rows: report.integer.rows.map((row, i) => ({ x: i, y: row.real.rho })) },
    { id: "Z Cramer rho", color: "#fb7185", rows: report.integer.rows.map((row, i) => ({ x: i, y: mean(row.cramerControls.map((s) => s.rho)) })) },
    { id: "Z composite rho", color: "#a78bfa", rows: report.integer.rows.map((row, i) => ({ x: i, y: mean(row.compositeControls.map((s) => s.rho)) })) },
    { id: "Z column-null rho", color: "#fbbf24", rows: report.integer.rows.map((row, i) => ({ x: i, y: mean(row.columnNullControls.map((s) => s.rho)) })) },
    { id: "F_2 rho", color: "#34d399", rows: f2.rows.map((row, i) => ({ x: i + 6, y: row.real.rho })) },
    { id: "F_3 rho", color: "#60a5fa", rows: f3.rows.map((row, i) => ({ x: i + 11, y: row.real.rho })) },
  ];
  const allY = series.flatMap((s) => s.rows.map((row) => row.y)).filter(Number.isFinite);
  const yMin = 0;
  const yMax = Math.max(1, Math.max(...allY) * 1.12);
  const xMin = 0, xMax = 14;
  const xOf = (point) => margin.left + ((point.x - xMin) / (xMax - xMin)) * plotW;
  const yOf = (point) => margin.top + (1 - ((point.y - yMin) / (yMax - yMin))) * plotH;
  const grid = [];
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + (i / 5) * plotH;
    const val = yMax - (i / 5) * (yMax - yMin);
    grid.push(`<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1f2937" stroke-width="1"/>`);
    grid.push(`<text x="20" y="${y + 4}" fill="#94a3b8" font-size="12">${fmt(val, 2)}</text>`);
  }
  const paths = series.map((s) => {
    const circles = s.rows.map((point) => `<circle cx="${xOf(point)}" cy="${yOf(point)}" r="4" fill="${s.color}"/>`).join("");
    return `<polyline points="${line(s.rows, xOf, yOf)}" fill="none" stroke="${s.color}" stroke-width="3"/>${circles}`;
  }).join("\n");
  const legend = series.map((s, i) => {
    const x = 70 + (i % 3) * 205;
    const y = 43 + Math.floor(i / 3) * 18;
    return `<text x="${x}" y="${y}" fill="${s.color}" font-size="13">${s.id}</text>`;
  }).join("\n");
  const zEnd = report.integer.rows.at(-1);
  const f2End = f2.rows.at(-1);
  const f3End = f3.rows.at(-1);
  const heatX = 780;
  const heatY = 96;
  const cell = 21;
  const heatmaps = [
    matrixSvg(zEnd.real, heatX, heatY, cell, "Z primes endpoint"),
    matrixSvg(zEnd.compositeControls[0], heatX + 215, heatY, cell, "sampled composites"),
    matrixSvg(f2End.real, heatX, heatY + 250, cell, "F_2[t] endpoint"),
    matrixSvg(f3End.real, heatX + 215, heatY + 250, cell, "F_3[t] endpoint"),
  ].join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="70" y="26" fill="#e5e7eb" font-size="18" font-weight="700">locally calibrated shift-incidence operator</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${paths}
${heatmaps}
<text x="70" y="${height - 34}" fill="#94a3b8" font-size="13">left: spectral radius rho(C), where C is the off-diagonal centered shift-incidence correlation matrix; right: signed endpoint matrices</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Shift-incidence operator audit", "");
  lines.push("Candidate:");
  lines.push("for each label, build the fixed-shift neighbor incidence vector, subtract each shift's pair count, and score the spectral radius `rho(C)` of the off-diagonal correlation operator.", "");
  lines.push("## Integer side", "");
  lines.push(`Shifts: ${report.integer.shifts.join(", ")}`, "");
  lines.push("| N | labels | mean shift rate | rho | rho/sqrt(H-1) | pair RMS | max | column-null rho | composite rho | Cramer rho |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.integer.rows) {
    lines.push(`| ${row.N} | ${row.labels} | ${fmt(row.real.meanShiftRate)} | ${fmt(row.real.rho)} | ${fmt(row.real.rhoNorm)} | ${fmt(row.real.pairRms)} | ${fmt(row.real.maxAbsEntry)} | ${fmt(row.columnNull.rho[0])} .. ${fmt(row.columnNull.rho[1])} | ${fmt(row.composite.rho[0])} .. ${fmt(row.composite.rho[1])} | ${fmt(row.cramer.rho[0])} .. ${fmt(row.cramer.rho[1])} |`);
  }
  lines.push("");
  lines.push(`Integer exponent fits: \`rho theta=${fmt(report.integer.rhoTheta)}\`, \`rhoNorm theta=${fmt(report.integer.rhoNormTheta)}\`, \`pairRms theta=${fmt(report.integer.pairRmsTheta)}\`.`);
  const last = report.integer.rows.at(-1);
  lines.push("");
  lines.push(`Endpoint top signed entries at N=${last.N}:`);
  for (const item of topPairs(last.real, report.integer.shifts)) lines.push(`- ${item.pair}: ${fmt(item.value)}`);
  lines.push("");
  for (const group of report.polynomial) {
    lines.push(`## F_${group.q}[t] side`, "");
    lines.push(`Shifts: ${group.shifts.join(", ")}`, "");
    lines.push("| degree | labels | mean shift rate | rho | rho/sqrt(H-1) | pair RMS | max | column-null rho | random monic rho | random reducible rho |");
    lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
    for (const row of group.rows) {
      lines.push(`| ${row.degree} | ${row.labels} | ${fmt(row.real.meanShiftRate)} | ${fmt(row.real.rho)} | ${fmt(row.real.rhoNorm)} | ${fmt(row.real.pairRms)} | ${fmt(row.real.maxAbsEntry)} | ${fmt(row.columnNull.rho[0])} .. ${fmt(row.columnNull.rho[1])} | ${fmt(row.randomMonic.rho[0])} .. ${fmt(row.randomMonic.rho[1])} | ${fmt(row.randomReducible.rho[0])} .. ${fmt(row.randomReducible.rho[1])} |`);
    }
    lines.push("");
    lines.push(`Exponent fits: \`rho theta=${fmt(group.rhoTheta)}\`, \`rhoNorm theta=${fmt(group.rhoNormTheta)}\`, \`pairRms theta=${fmt(group.pairRmsTheta)}\`.`);
    const end = group.rows.at(-1);
    lines.push("");
    lines.push(`Endpoint top signed entries at degree=${end.degree}:`);
    for (const item of topPairs(end.real, group.shifts)) lines.push(`- ${item.pair}: ${fmt(item.value)}`);
    lines.push("");
  }
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[shift-incidence-operator] integer max N=${N}`);
const integer = runIntegerAudit();
console.error(`[shift-incidence-operator] polynomial universes F_2 degree=${q2MaxDegree}, F_3 degree=${q3MaxDegree}`);
const polynomial = [
  runPolynomialAudit(2, q2MaxDegree),
  runPolynomialAudit(3, q3MaxDegree),
];

const base = `shift-incidence-operator-audit-${N}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "locally calibrated shift-incidence operator",
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
    rho: integer.rows.at(-1).real.rho,
    rhoNorm: integer.rows.at(-1).real.rhoNorm,
    pairRms: integer.rows.at(-1).real.pairRms,
    columnNullRhoRange: integer.rows.at(-1).columnNull.rho,
    cramerRhoRange: integer.rows.at(-1).cramer.rho,
    compositeRhoRange: integer.rows.at(-1).composite.rho,
  },
  fieldEndpoints: polynomial.map((group) => ({
    q: group.q,
    degree: group.rows.at(-1).degree,
    rho: group.rows.at(-1).real.rho,
    rhoNorm: group.rows.at(-1).real.rhoNorm,
    pairRms: group.rows.at(-1).real.pairRms,
  })),
  paths,
}, null, 2));
