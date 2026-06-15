#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyDegree,
  polyMod,
  polyMul,
  polynomialMobius,
  polySub,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, mobiusUpTo, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 20);
const q3MaxDegree = Number(process.argv[5] || 12);

const seeds = [12345, 271828, 314159, 161803, 424242];
const integerModuli = [6, 30, 210, 2310, 30030];
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

function std(values) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - m) ** 2)));
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
  const fitRows = rows.filter((row) => Math.abs(row[key]) > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(Math.abs(row[key]))),
  ).slope;
}

function phi(n) {
  let out = n, m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    out -= Math.floor(out / p);
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= Math.floor(out / m);
  return out;
}

function integerTower() {
  return integerModuli.map((modulus) => {
    const unit = new Uint8Array(modulus);
    const residues = [];
    for (let r = 0; r < modulus; r++) {
      if (gcd(r, modulus) === 1) {
        unit[r] = 1;
        residues.push(r);
      }
    }
    return { modulus, phi: phi(modulus), unit, residues, label: `${modulus}` };
  });
}

function firstIrreducibles(universe, count) {
  const out = [];
  for (let degree = 1; degree <= universe.maxDegree && out.length < count; degree++) {
    for (const poly of universe.irreduciblesByDegree[degree]) {
      out.push(poly);
      if (out.length === count) break;
    }
  }
  return out;
}

function polyCoprime(poly, factors, q) {
  for (const factor of factors) {
    if (polyMod(poly, factor, q) === 0) return false;
  }
  return true;
}

function polynomialTower(universe, factorCounts = [3, 4, 5, 6]) {
  const factors = firstIrreducibles(universe, Math.max(...factorCounts));
  return factorCounts.map((count) => {
    const used = factors.slice(0, count);
    let modulus = 1;
    let phiValue = 1;
    for (const factor of used) {
      modulus = polyMul(modulus, factor, universe.q);
      phiValue *= universe.q ** polyDegree(factor, universe.q) - 1;
    }
    const degree = polyDegree(modulus, universe.q);
    const size = universe.q ** degree;
    const unit = new Uint8Array(size);
    const residues = [];
    for (let residue = 0; residue < size; residue++) {
      if (polyCoprime(residue, used, universe.q)) {
        unit[residue] = 1;
        residues.push(residue);
      }
    }
    return {
      count,
      factors: used,
      modulus,
      degree,
      phi: phiValue,
      unit,
      residues,
      label: used.map((factor) => `(${polyToString(factor, universe.q)})`).join("*"),
    };
  });
}

function emptyBaselines(tower) {
  return tower.map((level) => ({
    count: new Int32Array(level.residues.length ? level.unit.length : level.modulus),
    sum: new Float64Array(level.residues.length ? level.unit.length : level.modulus),
    sumSq: new Float64Array(level.residues.length ? level.unit.length : level.modulus),
  }));
}

function addBaselineSample(baselines, tower, endpointResidue, value, residueFn) {
  for (let i = 0; i < tower.length; i++) {
    const residue = residueFn(endpointResidue, tower[i]);
    const base = baselines[i];
    base.count[residue]++;
    base.sum[residue] += value;
    base.sumSq[residue] += value * value;
  }
}

function samplePairs(pool, count, seed) {
  if (pool.length === 0) throw new Error("cannot sample from an empty pool");
  const rnd = rng(seed);
  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = pool[Math.floor(rnd() * pool.length)];
  return out;
}

function residueCounts(pairs) {
  const counts = new Map();
  for (const pair of pairs) counts.set(pair.residue, (counts.get(pair.residue) || 0) + 1);
  return counts;
}

function sampleStratified(counts, pools, seed) {
  const rnd = rng(seed);
  const out = [];
  for (const [residue, count] of counts.entries()) {
    const pool = pools.get(residue) || [];
    if (!pool.length) continue;
    for (let i = 0; i < count; i++) {
      const value = pool[Math.floor(rnd() * pool.length)];
      out.push({ residue, value });
    }
  }
  return out;
}

function scorePairs(pairs, baselines, tower, residueFn) {
  const levels = [];
  for (let i = 0; i < tower.length; i++) {
    const level = tower[i];
    const counts = new Int32Array(level.residues.length ? level.unit.length : level.modulus);
    const sums = new Float64Array(counts.length);
    for (const pair of pairs) {
      const residue = residueFn(pair.residue, level);
      counts[residue]++;
      sums[residue] += pair.value;
    }
    const base = baselines[i];
    let chi = 0;
    let active = 0;
    for (const residue of level.residues) {
      const c = counts[residue];
      if (!c || !base.count[residue]) continue;
      const m = base.sum[residue] / base.count[residue];
      const v = Math.max(1e-12, base.sumSq[residue] / base.count[residue] - m * m);
      const z = (sums[residue] - c * m) / Math.sqrt(c * v);
      chi += z * z;
      active++;
    }
    levels.push({
      label: level.label,
      chi,
      active,
      energy: chi / Math.max(1, active),
    });
  }
  const energies = levels.map((level) => level.energy);
  return {
    levels,
    meanE: mean(energies),
    rmsE: Math.sqrt(mean(energies.map((value) => value * value))),
    flatness: std(energies) / (Math.abs(mean(energies)) || 1),
    defect: Math.sqrt(mean(energies.map((value) => (value - 1) ** 2))),
  };
}

function summarizeControls(flows) {
  return {
    meanE: range(flows.map((flow) => flow.meanE)),
    defect: range(flows.map((flow) => flow.defect)),
    flatness: range(flows.map((flow) => flow.flatness)),
  };
}

function runIntegerAudit() {
  const tower = integerTower();
  const full = tower.at(-1);
  const mu = mobiusUpTo(N + 1);
  const flags = sieve(N);
  const primeList = primesUpTo(N);
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[mobius-flow] integer N=${limit}`);
    const baselines = emptyBaselines(tower);
    const realPairs = [];
    const eligiblePairs = [];
    const compositePairs = [];
    const compositePools = new Map();
    for (let n = 2; n <= limit; n++) {
      const residue = n % full.modulus;
      if (!full.unit[residue]) continue;
      const value = mu[n - 1];
      const pair = { residue, value };
      eligiblePairs.push(pair);
      addBaselineSample(baselines, tower, residue, value, (r, level) => r % level.modulus);
      if (flags[n]) {
        realPairs.push(pair);
      } else {
        compositePairs.push(pair);
        if (!compositePools.has(residue)) compositePools.set(residue, []);
        compositePools.get(residue).push(value);
      }
    }
    const real = scorePairs(realPairs, baselines, tower, (r, level) => r % level.modulus);
    const counts = residueCounts(realPairs);
    const stratified = seeds.map((seed) => scorePairs(sampleStratified(counts, compositePools, seed), baselines, tower, (r, level) => r % level.modulus));
    const eligible = seeds.map((seed) => scorePairs(samplePairs(eligiblePairs, realPairs.length, seed), baselines, tower, (r, level) => r % level.modulus));
    const composite = seeds.map((seed) => scorePairs(samplePairs(compositePairs, realPairs.length, seed), baselines, tower, (r, level) => r % level.modulus));
    const cramer = seeds.map((seed) => {
      const labels = cramerPrimes(limit, seed);
      const pairs = [];
      for (const n of labels) {
        const residue = n % full.modulus;
        if (!full.unit[residue]) continue;
        pairs.push({ residue, value: mu[n - 1] });
      }
      return scorePairs(pairs, baselines, tower, (r, level) => r % level.modulus);
    });
    rows.push({
      N: limit,
      labels: realPairs.length,
      real,
      effectVsStratified: real.meanE - mean(stratified.map((flow) => flow.meanE)),
      stratified: summarizeControls(stratified),
      eligible: summarizeControls(eligible),
      composite: summarizeControls(composite),
      cramer: summarizeControls(cramer),
    });
  }
  return {
    tower: tower.map(({ label, modulus, phi }) => ({ label, modulus, phi })),
    rows,
    meanETheta: exponent(rows.map((row) => ({ labels: row.labels, meanE: row.real.meanE })), "meanE", "labels"),
    effectTheta: exponent(rows.map((row) => ({ labels: row.labels, effect: row.effectVsStratified })), "effect", "labels"),
  };
}

function runPolynomialAudit(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const tower = polynomialTower(universe);
  const full = tower.at(-1);
  const degrees = [];
  for (let degree = Math.max(full.degree + 1, maxDegree - 3); degree <= maxDegree; degree++) degrees.push(degree);
  const rows = [];
  for (const degree of degrees) {
    console.error(`[mobius-flow] F_${q}[t] degree=${degree}`);
    const baselines = emptyBaselines(tower);
    const realPairs = [];
    const monicPairs = [];
    const reduciblePairs = [];
    const reduciblePools = new Map();
    const lead = universe.pow[degree];
    const size = universe.pow[degree];
    const flags = universe.irreducibleFlagsByDegree[degree];
    for (let lower = 0; lower < size; lower++) {
      const poly = lead + lower;
      const residue = polyMod(poly, full.modulus, q);
      if (!full.unit[residue]) continue;
      const value = polynomialMobius(polySub(poly, 1, q), universe);
      const pair = { residue, value };
      monicPairs.push(pair);
      addBaselineSample(baselines, tower, residue, value, (r, level) => polyMod(r, level.modulus, q));
      if (flags[lower]) {
        realPairs.push(pair);
      } else {
        reduciblePairs.push(pair);
        if (!reduciblePools.has(residue)) reduciblePools.set(residue, []);
        reduciblePools.get(residue).push(value);
      }
    }
    const real = scorePairs(realPairs, baselines, tower, (r, level) => polyMod(r, level.modulus, q));
    const counts = residueCounts(realPairs);
    const stratified = seeds.map((seed) => scorePairs(sampleStratified(counts, reduciblePools, seed), baselines, tower, (r, level) => polyMod(r, level.modulus, q)));
    const randomMonic = seeds.map((seed) => scorePairs(samplePairs(monicPairs, realPairs.length, seed), baselines, tower, (r, level) => polyMod(r, level.modulus, q)));
    const randomReducible = seeds.map((seed) => scorePairs(samplePairs(reduciblePairs, realPairs.length, seed), baselines, tower, (r, level) => polyMod(r, level.modulus, q)));
    rows.push({
      degree,
      labels: realPairs.length,
      real,
      effectVsStratified: real.meanE - mean(stratified.map((flow) => flow.meanE)),
      stratified: summarizeControls(stratified),
      randomMonic: summarizeControls(randomMonic),
      randomReducible: summarizeControls(randomReducible),
    });
  }
  return {
    q,
    tower: tower.map((level) => ({
      count: level.count,
      degree: level.degree,
      phi: level.phi,
      label: level.label,
    })),
    rows,
    meanETheta: exponent(rows.map((row) => ({ labels: row.labels, meanE: row.real.meanE })), "meanE", "labels"),
    effectTheta: exponent(rows.map((row) => ({ labels: row.labels, effect: row.effectVsStratified })), "effect", "labels"),
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
  const series = [];
  const add = (id, rows, color) => series.push({ id, rows, color });
  add("Z real", report.integer.rows.map((row, i) => ({ x: i, y: row.real.meanE })), "#67e8f9");
  add("Z stratified fake", report.integer.rows.map((row, i) => ({ x: i, y: mean(row.stratified.meanE) })), "#f8fafc");
  add("Z composite", report.integer.rows.map((row, i) => ({ x: i, y: mean(row.composite.meanE) })), "#a78bfa");
  add("Z Cramer", report.integer.rows.map((row, i) => ({ x: i, y: mean(row.cramer.meanE) })), "#fb7185");
  add("F_2 real", report.polynomial.find((group) => group.q === 2).rows.map((row, i) => ({ x: i + 6, y: row.real.meanE })), "#34d399");
  add("F_3 real", report.polynomial.find((group) => group.q === 3).rows.map((row, i) => ({ x: i + 12, y: row.real.meanE })), "#60a5fa");
  const allY = series.flatMap((s) => s.rows.map((row) => row.y)).filter(Number.isFinite);
  const yMin = Math.min(0, Math.min(...allY) * 0.9);
  const yMax = Math.max(1.4, Math.max(...allY) * 1.1);
  const xMin = 0, xMax = 16;
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
    const y = 38 + Math.floor(i / 3) * 20;
    return `<text x="${x}" y="${y}" fill="${s.color}" font-size="13">${s.id}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="70" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Mobius-twisted local modulus flow</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
<line x1="${margin.left}" y1="${yOf({ y: 1 })}" x2="${width - margin.right}" y2="${yOf({ y: 1 })}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="6 6" opacity="0.6"/>
${paths}
<text x="70" y="${height - 34}" fill="#94a3b8" font-size="13">x: integer endpoints, then F_2 degrees, then F_3 degrees; y: locally standardized residue energy of mu(label-1)</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Mobius-twisted local modulus-flow audit", "");
  lines.push("Candidate:");
  lines.push("locally subtract residue-class means of `mu(n-1)` and score standardized prime residual energy through the wheel / polynomial-modulus tower.", "");
  lines.push("## Integer side", "");
  lines.push("| N | labels | real meanE | effect vs stratified | level energies |");
  lines.push("| ---: | ---: | ---: | ---: | --- |");
  for (const row of report.integer.rows) {
    lines.push(`| ${row.N} | ${row.labels} | ${fmt(row.real.meanE)} | ${fmt(row.effectVsStratified)} | ${row.real.levels.map((level) => fmt(level.energy, 3)).join(", ")} |`);
  }
  lines.push("");
  lines.push(`Integer exponent fits: \`meanE theta=${fmt(report.integer.meanETheta)}\`, \`abs(effect-vs-stratified) theta=${fmt(report.integer.effectTheta)}\`.`);
  const last = report.integer.rows.at(-1);
  lines.push("");
  lines.push(`Endpoint controls at N=${last.N}:`);
  lines.push("");
  lines.push("| group | meanE range | defect range | flatness range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, summary] of [["stratified composite by residue", last.stratified], ["eligible random", last.eligible], ["Cramer labels", last.cramer], ["composite random", last.composite]]) {
    lines.push(`| ${name} | ${fmt(summary.meanE[0])} .. ${fmt(summary.meanE[1])} | ${fmt(summary.defect[0])} .. ${fmt(summary.defect[1])} | ${fmt(summary.flatness[0])} .. ${fmt(summary.flatness[1])} |`);
  }
  lines.push("");
  for (const group of report.polynomial) {
    lines.push(`## F_${group.q}[t] side`, "");
    lines.push("| degree | labels | real meanE | effect vs stratified | level energies |");
    lines.push("| ---: | ---: | ---: | ---: | --- |");
    for (const row of group.rows) {
      lines.push(`| ${row.degree} | ${row.labels} | ${fmt(row.real.meanE)} | ${fmt(row.effectVsStratified)} | ${row.real.levels.map((level) => fmt(level.energy, 3)).join(", ")} |`);
    }
    lines.push("");
    lines.push(`Exponent fits: \`meanE theta=${fmt(group.meanETheta)}\`, \`abs(effect-vs-stratified) theta=${fmt(group.effectTheta)}\`.`);
    const end = group.rows.at(-1);
    lines.push("");
    lines.push(`Endpoint controls at degree=${end.degree}:`);
    lines.push("");
    lines.push("| group | meanE range | defect range | flatness range |");
    lines.push("| --- | ---: | ---: | ---: |");
    for (const [name, summary] of [["stratified reducible by residue", end.stratified], ["random monic", end.randomMonic], ["random reducible", end.randomReducible]]) {
      lines.push(`| ${name} | ${fmt(summary.meanE[0])} .. ${fmt(summary.meanE[1])} | ${fmt(summary.defect[0])} .. ${fmt(summary.defect[1])} | ${fmt(summary.flatness[0])} .. ${fmt(summary.flatness[1])} |`);
    }
    lines.push("");
  }
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[mobius-flow] integer max N=${N}`);
const integer = runIntegerAudit();
console.error(`[mobius-flow] polynomial universes F_2 degree=${q2MaxDegree}, F_3 degree=${q3MaxDegree}`);
const polynomial = [
  runPolynomialAudit(2, q2MaxDegree),
  runPolynomialAudit(3, q3MaxDegree),
];

const base = `mobius-modulus-flow-audit-${N}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Mobius-twisted local modulus flow",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  q2MaxDegree,
  q3MaxDegree,
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
    meanE: integer.rows.at(-1).real.meanE,
    stratifiedMeanERange: integer.rows.at(-1).stratified.meanE,
    cramerMeanERange: integer.rows.at(-1).cramer.meanE,
    compositeMeanERange: integer.rows.at(-1).composite.meanE,
  },
  fieldEndpoints: polynomial.map((group) => ({
    q: group.q,
    degree: group.rows.at(-1).degree,
    meanE: group.rows.at(-1).real.meanE,
    stratifiedMeanERange: group.rows.at(-1).stratified.meanE,
  })),
  paths,
}, null, 2));
