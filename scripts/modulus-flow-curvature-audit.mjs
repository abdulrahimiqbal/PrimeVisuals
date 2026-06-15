#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyDegree,
  polyMod,
  polyMul,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 8_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 22);
const q3MaxDegree = Number(process.argv[5] || 13);

const seeds = [12345, 271828, 314159, 161803, 424242];
const integerModuli = [6, 30, 210, 2310, 30030];
const endpointW = integerModuli.at(-1);
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
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
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

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} labels from pool of ${pool.length}`);
  const rnd = rng(seed);
  const copy = pool.slice();
  const out = new Int32Array(count);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rnd() * (copy.length - i));
    const picked = copy[j];
    copy[j] = copy[i];
    copy[i] = picked;
    out[i] = picked;
  }
  return Array.from(out);
}

function labelsUpTo(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return sorted.slice(0, hi);
}

function integerPool(limit, primeFlags, compositeOnly = false) {
  const out = [];
  for (let n = 2; n <= limit; n++) {
    if (gcd(n, endpointW) !== 1) continue;
    if (compositeOnly && primeFlags[n]) continue;
    out.push(n);
  }
  return out;
}

function integerFlowStats(labels, tower) {
  const energies = [];
  for (const level of tower) {
    const counts = new Float64Array(level.modulus);
    let total = 0;
    for (const label of labels) {
      const residue = label % level.modulus;
      if (!level.unit[residue]) continue;
      counts[residue]++;
      total++;
    }
    const expected = total / level.phi;
    let chi = 0;
    if (expected > 0) {
      for (const residue of level.residues) {
        const diff = counts[residue] - expected;
        chi += (diff * diff) / expected;
      }
    }
    energies.push({
      label: level.label,
      modulus: level.modulus,
      phi: level.phi,
      labels: total,
      chi,
      norm: chi / Math.max(1, level.phi - 1),
    });
  }
  return summarizeFlow(energies);
}

function balancedEndpointResidues(unitResidues, count) {
  const residues = unitResidues.slice();
  const out = new Int32Array(count);
  for (let i = 0; i < count; i++) out[i] = residues[i % residues.length];
  return Array.from(out);
}

function integerResidueFlowStats(endpointResidues, tower) {
  const energies = [];
  for (const level of tower) {
    const counts = new Float64Array(level.modulus);
    let total = 0;
    for (const endpointResidue of endpointResidues) {
      const residue = endpointResidue % level.modulus;
      if (!level.unit[residue]) continue;
      counts[residue]++;
      total++;
    }
    const expected = total / level.phi;
    let chi = 0;
    if (expected > 0) {
      for (const residue of level.residues) {
        const diff = counts[residue] - expected;
        chi += (diff * diff) / expected;
      }
    }
    energies.push({
      label: level.label,
      modulus: level.modulus,
      phi: level.phi,
      labels: total,
      chi,
      norm: chi / Math.max(1, level.phi - 1),
    });
  }
  return summarizeFlow(energies);
}

function summarizeFlow(energies) {
  const increments = [];
  for (let i = 1; i < energies.length; i++) {
    const deltaChi = energies[i].chi - energies[i - 1].chi;
    const deltaDf = energies[i].phi - energies[i - 1].phi;
    increments.push({
      from: energies[i - 1].label,
      to: energies[i].label,
      deltaChi,
      deltaDf,
      k: deltaChi / deltaDf,
    });
  }
  const ks = increments.map((row) => row.k);
  const meanK = mean(ks);
  const rmsK = Math.sqrt(mean(ks.map((k) => k * k)));
  const flatness = std(ks) / (Math.abs(meanK) || 1);
  const defect = Math.sqrt(mean(ks.map((k) => (k - 1) ** 2)));
  return { energies, increments, meanK, rmsK, flatness, defect };
}

function summarizeControls(flows) {
  return {
    meanK: range(flows.map((flow) => flow.meanK)),
    rmsK: range(flows.map((flow) => flow.rmsK)),
    flatness: range(flows.map((flow) => flow.flatness)),
    defect: range(flows.map((flow) => flow.defect)),
  };
}

function runIntegerAudit() {
  const tower = integerTower();
  const primeFlags = sieve(N);
  const allPrimes = primesUpTo(N).filter((p) => gcd(p, endpointW) === 1);
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[modulus-flow] integer N=${limit}`);
    const realLabels = labelsUpTo(allPrimes, limit);
    const eligible = integerPool(limit, primeFlags, false);
    const composites = integerPool(limit, primeFlags, true);
    const real = integerFlowStats(realLabels, tower);
    const balanced = integerResidueFlowStats(balancedEndpointResidues(tower.at(-1).residues, realLabels.length), tower);
    const eligibleControls = seeds.map((seed) => integerFlowStats(sampleWithoutReplacement(eligible, realLabels.length, seed), tower));
    const compositeControls = seeds.map((seed) => integerFlowStats(sampleWithoutReplacement(composites, realLabels.length, seed), tower));
    const cramerControls = seeds.map((seed) => {
      const labels = cramerPrimes(limit, seed).filter((n) => gcd(n, endpointW) === 1);
      return integerFlowStats(labels, tower);
    });
    const eligibleMean = mean(eligibleControls.map((flow) => flow.meanK));
    rows.push({
      N: limit,
      labels: realLabels.length,
      real,
      balanced,
      effectVsEligible: real.meanK - eligibleMean,
      eligible: summarizeControls(eligibleControls),
      composite: summarizeControls(compositeControls),
      cramer: summarizeControls(cramerControls),
    });
  }
  return {
    tower: tower.map(({ label, modulus, phi }) => ({ label, modulus, phi })),
    rows,
    meanKTheta: exponent(rows.map((row) => ({ labels: row.labels, meanK: row.real.meanK })), "meanK", "labels"),
    defectTheta: exponent(rows.map((row) => ({ labels: row.labels, defect: row.real.defect })), "defect", "labels"),
    effectTheta: exponent(rows.map((row) => ({ labels: row.labels, absEffect: Math.abs(row.effectVsEligible) })), "absEffect", "labels"),
  };
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

function polynomialTower(universe, factorCounts) {
  const maxCount = Math.max(...factorCounts);
  const factors = firstIrreducibles(universe, maxCount);
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
    const unitResidues = [];
    for (let residue = 0; residue < size; residue++) {
      if (polyCoprime(residue, used, universe.q)) {
        unit[residue] = 1;
        unitResidues.push(residue);
      }
    }
    return {
      count,
      factors: used,
      modulus,
      degree,
      phi: phiValue,
      unit,
      unitResidues,
      label: used.map((factor) => `(${polyToString(factor, universe.q)})`).join("*"),
    };
  });
}

function polynomialResidueFlowStats(endpointResidues, tower, q) {
  const energies = [];
  for (const level of tower) {
    const size = q ** level.degree;
    const counts = new Float64Array(size);
    let total = 0;
    for (const endpointResidue of endpointResidues) {
      const residue = polyMod(endpointResidue, level.modulus, q);
      counts[residue]++;
      total++;
    }
    const expected = total / level.phi;
    let chi = 0;
    if (expected > 0) {
      for (const residue of level.unitResidues) {
        const diff = counts[residue] - expected;
        chi += (diff * diff) / expected;
      }
    }
    energies.push({
      label: `first ${level.count}`,
      modulus: level.label,
      degree: level.degree,
      phi: level.phi,
      labels: total,
      chi,
      norm: chi / Math.max(1, level.phi - 1),
    });
  }
  return summarizeFlow(energies);
}

function endpointResiduesForLabels(labels, fullLevel, q) {
  return labels.map((poly) => polyMod(poly, fullLevel.modulus, q));
}

function sampleEndpointResidues(unitResidues, count, seed) {
  const rnd = rng(seed);
  const out = new Int32Array(count);
  for (let i = 0; i < count; i++) {
    out[i] = unitResidues[Math.floor(rnd() * unitResidues.length)];
  }
  return Array.from(out);
}

function reducibleEndpointResiduePool(universe, degree, fullLevel) {
  const q = universe.q;
  const size = universe.pow[degree];
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const out = [];
  for (let lower = 0; lower < size; lower++) {
    if (flags[lower]) continue;
    const poly = lead + lower;
    const residue = polyMod(poly, fullLevel.modulus, q);
    if (fullLevel.unit[residue]) out.push(residue);
  }
  return out;
}

function runPolynomialAudit(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const factorCounts = q === 2 ? [3, 4, 5, 6] : [3, 4, 5, 6];
  const tower = polynomialTower(universe, factorCounts);
  const fullFactors = tower.at(-1).factors;
  const fullLevel = tower.at(-1);
  const degreeStart = Math.max(2, maxDegree - 4);
  const degrees = [];
  for (let degree = degreeStart; degree <= maxDegree; degree++) degrees.push(degree);
  const rows = [];
  for (const degree of degrees) {
    console.error(`[modulus-flow] F_${q}[t] degree=${degree}`);
    const realLabels = universe.irreduciblesByDegree[degree].filter((poly) => polyCoprime(poly, fullFactors, q));
    const realResidues = endpointResiduesForLabels(realLabels, fullLevel, q);
    const real = polynomialResidueFlowStats(realResidues, tower, q);
    const balanced = polynomialResidueFlowStats(balancedEndpointResidues(fullLevel.unitResidues, realLabels.length), tower, q);
    const reduciblePool = reducibleEndpointResiduePool(universe, degree, fullLevel);
    const randomMonicControls = seeds.map((seed) => {
      const residues = sampleEndpointResidues(fullLevel.unitResidues, realLabels.length, seed);
      return polynomialResidueFlowStats(residues, tower, q);
    });
    const randomReducibleControls = seeds.map((seed) => {
      const residues = sampleEndpointResidues(reduciblePool, realLabels.length, seed ^ 0x9E3779B9);
      return polynomialResidueFlowStats(residues, tower, q);
    });
    const randomMean = mean(randomMonicControls.map((flow) => flow.meanK));
    rows.push({
      degree,
      labels: realLabels.length,
      real,
      balanced,
      effectVsRandomMonic: real.meanK - randomMean,
      randomMonic: summarizeControls(randomMonicControls),
      randomReducible: summarizeControls(randomReducibleControls),
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
    meanKTheta: exponent(rows.map((row) => ({ labels: row.labels, meanK: row.real.meanK })), "meanK", "labels"),
    defectTheta: exponent(rows.map((row) => ({ labels: row.labels, defect: row.real.defect })), "defect", "labels"),
    effectTheta: exponent(rows.map((row) => ({ labels: row.labels, absEffect: Math.abs(row.effectVsRandomMonic) })), "absEffect", "labels"),
  };
}

function line(points, xOf, yOf) {
  return points.map((point) => `${xOf(point).toFixed(2)},${yOf(point).toFixed(2)}`).join(" ");
}

function makeSvg(report) {
  const width = 1120, height = 640;
  const margin = { left: 70, right: 30, top: 60, bottom: 70 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const series = [];
  const add = (id, rows, color, key = "meanK") => {
    series.push({ id, rows, color, key });
  };
  add("Z real meanK", report.integer.rows.map((row, i) => ({ x: i, y: row.real.meanK })), "#67e8f9");
  add("Z eligible meanK", report.integer.rows.map((row, i) => ({ x: i, y: mean(row.eligible.meanK) })), "#fbbf24");
  add("Z balanced fake", report.integer.rows.map((row, i) => ({ x: i, y: row.balanced.meanK })), "#f8fafc");
  add("Z Cramer meanK", report.integer.rows.map((row, i) => ({ x: i, y: mean(row.cramer.meanK) })), "#fb7185");
  add("Z composite meanK", report.integer.rows.map((row, i) => ({ x: i, y: mean(row.composite.meanK) })), "#a78bfa");
  add("F_2 real meanK", report.polynomial.find((row) => row.q === 2).rows.map((row, i) => ({ x: i + 6, y: row.real.meanK })), "#34d399");
  add("F_3 real meanK", report.polynomial.find((row) => row.q === 3).rows.map((row, i) => ({ x: i + 12, y: row.real.meanK })), "#60a5fa");
  const allY = series.flatMap((s) => s.rows.map((row) => row.y)).filter(Number.isFinite);
  const yMin = Math.min(0, Math.min(...allY) * 0.9);
  const yMax = Math.max(1.2, Math.max(...allY) * 1.1);
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
    const x = 70 + (i % 4) * 240;
    const y = 38 + Math.floor(i / 4) * 20;
    return `<text x="${x}" y="${y}" fill="${s.color}" font-size="13">${s.id}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="70" y="26" fill="#e5e7eb" font-size="18" font-weight="700">primorial modulus-flow curvature</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
<line x1="${margin.left}" y1="${yOf({ y: 1 })}" x2="${width - margin.right}" y2="${yOf({ y: 1 })}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="6 6" opacity="0.6"/>
${paths}
<text x="70" y="${height - 34}" fill="#94a3b8" font-size="13">x: integer endpoints, then F_2 degrees, then F_3 degrees; y: mean new chi-square energy per new residue degree of freedom</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Primorial modulus-flow curvature audit", "");
  lines.push("Candidate:");
  lines.push("measure how much new residue imbalance is injected while refining a nested wheel or polynomial-modulus tower.", "");
  lines.push("## Integer side", "");
  lines.push("Tower:");
  for (const level of report.integer.tower) lines.push(`- W=${level.modulus}, phi=${level.phi}`);
  lines.push("");
  lines.push("| N | labels | real meanK | balanced fake meanK | real defect | real flatness | effect vs eligible | K levels |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.integer.rows) {
    lines.push(`| ${row.N} | ${row.labels} | ${fmt(row.real.meanK)} | ${fmt(row.balanced.meanK)} | ${fmt(row.real.defect)} | ${fmt(row.real.flatness)} | ${fmt(row.effectVsEligible)} | ${row.real.increments.map((inc) => fmt(inc.k, 3)).join(", ")} |`);
  }
  lines.push("");
  lines.push("Integer exponent fits:");
  lines.push(`\`meanK theta=${fmt(report.integer.meanKTheta)}\`,`);
  lines.push(`\`defect theta=${fmt(report.integer.defectTheta)}\`,`);
  lines.push(`\`abs(effect-vs-eligible) theta=${fmt(report.integer.effectTheta)}\`.`);
  lines.push("");
  const last = report.integer.rows.at(-1);
  lines.push(`Endpoint controls at N=${last.N}:`, "");
  lines.push("| group | meanK range | defect range | flatness range |");
  lines.push("| --- | ---: | ---: | ---: |");
  lines.push(`| balanced residue fake | ${fmt(last.balanced.meanK)} .. ${fmt(last.balanced.meanK)} | ${fmt(last.balanced.defect)} .. ${fmt(last.balanced.defect)} | ${fmt(last.balanced.flatness)} .. ${fmt(last.balanced.flatness)} |`);
  for (const [name, summary] of [["eligible random", last.eligible], ["Cramer labels", last.cramer], ["composite eligible", last.composite]]) {
    lines.push(`| ${name} | ${fmt(summary.meanK[0])} .. ${fmt(summary.meanK[1])} | ${fmt(summary.defect[0])} .. ${fmt(summary.defect[1])} | ${fmt(summary.flatness[0])} .. ${fmt(summary.flatness[1])} |`);
  }
  lines.push("");
  for (const group of report.polynomial) {
    lines.push(`## F_${group.q}[t] side`, "");
    lines.push("Tower:");
    for (const level of group.tower) lines.push(`- first ${level.count} irreducibles, degree=${level.degree}, phi=${level.phi}, modulus=${level.label}`);
    lines.push("");
    lines.push("| degree | labels | real meanK | balanced fake meanK | real defect | real flatness | effect vs random monic | K levels |");
    lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
    for (const row of group.rows) {
      lines.push(`| ${row.degree} | ${row.labels} | ${fmt(row.real.meanK)} | ${fmt(row.balanced.meanK)} | ${fmt(row.real.defect)} | ${fmt(row.real.flatness)} | ${fmt(row.effectVsRandomMonic)} | ${row.real.increments.map((inc) => fmt(inc.k, 3)).join(", ")} |`);
    }
    lines.push("");
    lines.push(`Exponent fits: \`meanK theta=${fmt(group.meanKTheta)}\`, \`defect theta=${fmt(group.defectTheta)}\`, \`abs(effect-vs-random) theta=${fmt(group.effectTheta)}\`.`);
    const end = group.rows.at(-1);
    lines.push("");
    lines.push(`Endpoint controls at degree=${end.degree}:`);
    lines.push("");
    lines.push("| group | meanK range | defect range | flatness range |");
    lines.push("| --- | ---: | ---: | ---: |");
    lines.push(`| balanced residue fake | ${fmt(end.balanced.meanK)} .. ${fmt(end.balanced.meanK)} | ${fmt(end.balanced.defect)} .. ${fmt(end.balanced.defect)} | ${fmt(end.balanced.flatness)} .. ${fmt(end.balanced.flatness)} |`);
    for (const [name, summary] of [["random monic", end.randomMonic], ["random reducible", end.randomReducible]]) {
      lines.push(`| ${name} | ${fmt(summary.meanK[0])} .. ${fmt(summary.meanK[1])} | ${fmt(summary.defect[0])} .. ${fmt(summary.defect[1])} | ${fmt(summary.flatness[0])} .. ${fmt(summary.flatness[1])} |`);
    }
    lines.push("");
  }
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[modulus-flow] integer max N=${N}`);
const integer = runIntegerAudit();
console.error(`[modulus-flow] polynomial universes F_2 degree=${q2MaxDegree}, F_3 degree=${q3MaxDegree}`);
const polynomial = [
  runPolynomialAudit(2, q2MaxDegree),
  runPolynomialAudit(3, q3MaxDegree),
];

const base = `modulus-flow-curvature-audit-${N}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "primorial modulus-flow curvature",
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
    meanK: integer.rows.at(-1).real.meanK,
    defect: integer.rows.at(-1).real.defect,
    eligibleMeanKRange: integer.rows.at(-1).eligible.meanK,
    compositeMeanKRange: integer.rows.at(-1).composite.meanK,
  },
  fieldEndpoints: polynomial.map((group) => ({
    q: group.q,
    degree: group.rows.at(-1).degree,
    meanK: group.rows.at(-1).real.meanK,
    randomMonicMeanKRange: group.rows.at(-1).randomMonic.meanK,
  })),
  paths,
}, null, 2));
