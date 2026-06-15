#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 8_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const moduli = [210, 2310, 30030];
const seeds = [12345, 271828, 314159, 161803, 424242];
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

function buildGroup(modulus) {
  const residues = [];
  const index = new Int32Array(modulus).fill(-1);
  const inv = new Int32Array(modulus);
  for (let r = 0; r < modulus; r++) {
    if (gcd(r, modulus) === 1) {
      index[r] = residues.length;
      residues.push(r);
    }
  }
  for (const a of residues) {
    for (const b of residues) {
      if ((a * b) % modulus === 1) {
        inv[a] = b;
        break;
      }
    }
  }
  return { modulus, residues, index, inv, phi: residues.length };
}

const groups = moduli.map(buildGroup);

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} labels from pool of ${pool.length}`);
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

function labelsUpTo(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return sorted.slice(0, hi);
}

function eligibleComposites(limit, flags) {
  const out = [];
  for (let n = 2; n <= limit; n++) {
    if (flags[n]) continue;
    if (gcd(n, moduli.at(-1)) !== 1) continue;
    out.push(n);
  }
  return out;
}

function residuesFor(labels, group) {
  const out = [];
  for (const label of labels) {
    const residue = label % group.modulus;
    if (group.index[residue] >= 0) out.push(residue);
  }
  return out;
}

function transitionCounts(residues, group) {
  const counts = new Float64Array(group.phi);
  for (let i = 0; i + 1 < residues.length; i++) {
    const ratio = (residues[i + 1] * group.inv[residues[i]]) % group.modulus;
    const idx = group.index[ratio];
    if (idx >= 0) counts[idx]++;
  }
  return counts;
}

function gapConditionedCounts(labels, group, seed) {
  const rnd = rng(seed ^ group.modulus);
  const counts = new Float64Array(group.phi);
  for (let i = 0; i + 1 < labels.length; i++) {
    const gap = labels[i + 1] - labels[i];
    let a = 1;
    let b = 1;
    for (let tries = 0; tries < 100; tries++) {
      a = group.residues[Math.floor(rnd() * group.residues.length)];
      b = (a + gap) % group.modulus;
      if (group.index[b] >= 0) break;
    }
    if (group.index[b] < 0) {
      for (const candidate of group.residues) {
        const next = (candidate + gap) % group.modulus;
        if (group.index[next] >= 0) {
          a = candidate;
          b = next;
          break;
        }
      }
    }
    if (group.index[b] < 0) continue;
    const ratio = (b * group.inv[a]) % group.modulus;
    const idx = group.index[ratio];
    if (idx >= 0) counts[idx]++;
  }
  return counts;
}

function shuffled(values, seed) {
  const rnd = rng(seed);
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = out[i];
    out[i] = out[j];
    out[j] = t;
  }
  return out;
}

function scoreSequence(labels, label, seedOffset = 0) {
  const levels = [];
  for (const group of groups) {
    const residues = residuesFor(labels, group);
    const realCounts = transitionCounts(residues, group);
    const nullCounts = seeds.map((seed) => transitionCounts(shuffled(residues, seed ^ seedOffset ^ group.modulus), group));
    const zRows = [];
    let chi = 0;
    let active = 0;
    for (let i = 0; i < group.phi; i++) {
      const samples = nullCounts.map((counts) => counts[i]);
      const m = mean(samples);
      const variance = Math.max(1, mean(samples.map((value) => (value - m) ** 2)));
      const z = (realCounts[i] - m) / Math.sqrt(variance);
      chi += z * z;
      active++;
      zRows.push({
        residue: group.residues[i],
        count: realCounts[i],
        expected: m,
        z,
      });
    }
    zRows.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
    levels.push({
      modulus: group.modulus,
      phi: group.phi,
      transitions: Math.max(0, residues.length - 1),
      energy: Math.sqrt(chi / Math.max(1, active)),
      identityZ: zRows.find((row) => row.residue === 1)?.z ?? 0,
      top: zRows.slice(0, 8),
    });
  }
  const energies = levels.map((level) => level.energy);
  return {
    label,
    levels,
    meanEnergy: mean(energies),
    maxEnergy: Math.max(...energies),
    identityAbs: Math.max(...levels.map((level) => Math.abs(level.identityZ))),
  };
}

function scoreGapConditioned(labels, label, seedOffset = 0) {
  const levels = [];
  for (const group of groups) {
    const residues = residuesFor(labels, group);
    const realCounts = transitionCounts(residues, group);
    const nullCounts = seeds.map((seed) => gapConditionedCounts(labels, group, seed ^ seedOffset));
    const zRows = [];
    let chi = 0;
    let active = 0;
    for (let i = 0; i < group.phi; i++) {
      const samples = nullCounts.map((counts) => counts[i]);
      const m = mean(samples);
      const variance = Math.max(1, mean(samples.map((value) => (value - m) ** 2)));
      const z = (realCounts[i] - m) / Math.sqrt(variance);
      chi += z * z;
      active++;
      zRows.push({
        residue: group.residues[i],
        count: realCounts[i],
        expected: m,
        z,
      });
    }
    zRows.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
    levels.push({
      modulus: group.modulus,
      phi: group.phi,
      transitions: Math.max(0, residues.length - 1),
      energy: Math.sqrt(chi / Math.max(1, active)),
      identityZ: zRows.find((row) => row.residue === 1)?.z ?? 0,
      top: zRows.slice(0, 8),
    });
  }
  const energies = levels.map((level) => level.energy);
  return {
    label,
    levels,
    meanEnergy: mean(energies),
    maxEnergy: Math.max(...energies),
    identityAbs: Math.max(...levels.map((level) => Math.abs(level.identityZ))),
  };
}

function summarize(flows) {
  return {
    meanEnergy: range(flows.map((flow) => flow.meanEnergy)),
    maxEnergy: range(flows.map((flow) => flow.maxEnergy)),
    identityAbs: range(flows.map((flow) => flow.identityAbs)),
  };
}

function runIntegerAudit() {
  const flags = sieve(N);
  const allPrimes = primesUpTo(N).filter((p) => gcd(p, moduli.at(-1)) === 1);
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[ratio-transport] integer N=${limit}`);
    const primes = labelsUpTo(allPrimes, limit);
    const composites = eligibleComposites(limit, flags);
    const real = scoreSequence(primes, "primes", limit);
    const gapConditioned = scoreGapConditioned(primes, "primes-gap-conditioned", limit);
    const cramer = seeds.map((seed) => {
      const labels = cramerPrimes(limit, seed).filter((n) => gcd(n, moduli.at(-1)) === 1);
      return scoreSequence(labels, `cramer-${seed}`, seed);
    });
    const composite = seeds.map((seed) => {
      const labels = sampleWithoutReplacement(composites, primes.length, seed);
      return scoreSequence(labels, `composite-${seed}`, seed);
    });
    const randomOrder = seeds.map((seed) => {
      const labels = shuffled(primes, seed);
      return scoreSequence(labels, `random-order-${seed}`, seed);
    });
    rows.push({
      N: limit,
      labels: primes.length,
      real,
      gapConditioned,
      cramer: summarize(cramer),
      composite: summarize(composite),
      randomOrder: summarize(randomOrder),
    });
  }
  return {
    moduli,
    rows,
    meanEnergyTheta: exponent(rows.map((row) => ({ labels: row.labels, meanEnergy: row.real.meanEnergy })), "meanEnergy", "labels"),
    gapConditionedTheta: exponent(rows.map((row) => ({ labels: row.labels, meanEnergy: row.gapConditioned.meanEnergy })), "meanEnergy", "labels"),
    identityTheta: exponent(rows.map((row) => ({ labels: row.labels, identityAbs: row.real.identityAbs })), "identityAbs", "labels"),
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
  const series = [
    { id: "prime transport", color: "#67e8f9", rows: report.integer.rows.map((row, i) => ({ x: i, y: row.real.meanEnergy })) },
    { id: "gap-conditioned", color: "#34d399", rows: report.integer.rows.map((row, i) => ({ x: i, y: row.gapConditioned.meanEnergy })) },
    { id: "Cramer transport", color: "#fb7185", rows: report.integer.rows.map((row, i) => ({ x: i, y: mean(row.cramer.meanEnergy) })) },
    { id: "composite transport", color: "#a78bfa", rows: report.integer.rows.map((row, i) => ({ x: i, y: mean(row.composite.meanEnergy) })) },
    { id: "random order", color: "#f8fafc", rows: report.integer.rows.map((row, i) => ({ x: i, y: mean(row.randomOrder.meanEnergy) })) },
  ];
  const allY = series.flatMap((s) => s.rows.map((row) => row.y)).filter(Number.isFinite);
  const yMin = 0;
  const yMax = Math.max(1.5, Math.max(...allY) * 1.1);
  const xMin = 0, xMax = 4;
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
<text x="70" y="26" fill="#e5e7eb" font-size="18" font-weight="700">consecutive residue-ratio transport spectrum</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${paths}
<text x="70" y="${height - 34}" fill="#94a3b8" font-size="13">y: transition-ratio spectrum energy versus random shuffles of the same endpoint residue multiset</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Consecutive residue-ratio transport audit", "");
  lines.push("Candidate:");
  lines.push("score the ordered multiplicative transition ratio `p_next * p^{-1} mod W` over `W=210,2310,30030`, after removing endpoint residue counts by random-shuffle nulls.", "");
  lines.push("| N | labels | shuffle-null mean energy | gap-conditioned mean energy | max |identity z| | level energies |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.integer.rows) {
    lines.push(`| ${row.N} | ${row.labels} | ${fmt(row.real.meanEnergy)} | ${fmt(row.gapConditioned.meanEnergy)} | ${fmt(row.real.identityAbs)} | ${row.real.levels.map((level) => `${level.modulus}:${fmt(level.energy, 3)}`).join(", ")} |`);
  }
  lines.push("");
  lines.push(`Exponent fits: \`shuffle meanEnergy theta=${fmt(report.integer.meanEnergyTheta)}\`, \`gap-conditioned theta=${fmt(report.integer.gapConditionedTheta)}\`, \`identityAbs theta=${fmt(report.integer.identityTheta)}\`.`);
  const last = report.integer.rows.at(-1);
  lines.push("");
  lines.push(`Endpoint controls at N=${last.N}:`);
  lines.push("");
  lines.push(`Gap-conditioned endpoint levels: ${last.gapConditioned.levels.map((level) => `${level.modulus}:${fmt(level.energy, 3)}`).join(", ")}`);
  lines.push("");
  lines.push("| group | mean energy range | max energy range | max |identity z| range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, summary] of [["random order of same primes", last.randomOrder], ["Cramer labels", last.cramer], ["sampled composites in natural order", last.composite]]) {
    lines.push(`| ${name} | ${fmt(summary.meanEnergy[0])} .. ${fmt(summary.meanEnergy[1])} | ${fmt(summary.maxEnergy[0])} .. ${fmt(summary.maxEnergy[1])} | ${fmt(summary.identityAbs[0])} .. ${fmt(summary.identityAbs[1])} |`);
  }
  lines.push("");
  lines.push("Top endpoint transition-ratio cells:");
  for (const level of last.real.levels) {
    lines.push("");
    lines.push(`W=${level.modulus}:`);
    for (const row of level.top.slice(0, 6)) {
      lines.push(`- ratio ${row.residue}: count=${fmt(row.count, 0)}, null=${fmt(row.expected, 2)}, z=${fmt(row.z, 3)}`);
    }
  }
  lines.push("");
  lines.push("Top endpoint gap-conditioned cells:");
  for (const level of last.gapConditioned.levels) {
    lines.push("");
    lines.push(`W=${level.modulus}:`);
    for (const row of level.top.slice(0, 4)) {
      lines.push(`- ratio ${row.residue}: count=${fmt(row.count, 0)}, gap-null=${fmt(row.expected, 2)}, z=${fmt(row.z, 3)}`);
    }
  }
  lines.push("");
  lines.push("Function-field note: this candidate intentionally has no promoted field row. Consecutive order over integers is canonical; coefficient/lex order over `F_q[t]` is an artifact class already flagged in the ledger. A survivor would need a coordinate-free field transport analogue.");
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[ratio-transport] max N=${N}`);
const integer = runIntegerAudit();

const base = `residue-ratio-transport-audit-${N}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "consecutive residue-ratio transport spectrum",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  seeds,
  integer,
  paths,
};
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  endpoint: {
    N: integer.rows.at(-1).N,
    labels: integer.rows.at(-1).labels,
    meanEnergy: integer.rows.at(-1).real.meanEnergy,
    gapConditionedMeanEnergy: integer.rows.at(-1).gapConditioned.meanEnergy,
    maxEnergy: integer.rows.at(-1).real.maxEnergy,
    identityAbs: integer.rows.at(-1).real.identityAbs,
    cramerMeanEnergyRange: integer.rows.at(-1).cramer.meanEnergy,
    compositeMeanEnergyRange: integer.rows.at(-1).composite.meanEnergy,
  },
  paths,
}, null, 2));
