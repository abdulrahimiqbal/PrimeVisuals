#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 8_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const moduli = [210, 2310, 30030];
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(200_000, Math.round(x)));
const trimFrac = 0.01;

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

function mod(a, m) {
  return ((a % m) + m) % m;
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

function labelsUpTo(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return sorted.slice(0, hi);
}

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

function eligibleComposites(limit, flags) {
  const out = [];
  const endpointW = moduli.at(-1);
  for (let n = 2; n <= limit; n++) {
    if (flags[n]) continue;
    if (gcd(n, endpointW) !== 1) continue;
    out.push(n);
  }
  return out;
}

function transitionCounts(labels, group) {
  const counts = new Float64Array(group.phi);
  for (let i = 0; i + 1 < labels.length; i++) {
    const a = mod(labels[i], group.modulus);
    const b = mod(labels[i + 1], group.modulus);
    if (group.index[a] < 0 || group.index[b] < 0) continue;
    const ratio = (b * group.inv[a]) % group.modulus;
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
    let a = 1, b = 1;
    for (let tries = 0; tries < 100; tries++) {
      a = group.residues[Math.floor(rnd() * group.phi)];
      b = mod(a + gap, group.modulus);
      if (group.index[b] >= 0) break;
    }
    if (group.index[b] < 0) {
      for (const candidate of group.residues) {
        const next = mod(candidate + gap, group.modulus);
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

function rms(rows) {
  return Math.sqrt(mean(rows.map((row) => row.z * row.z)));
}

function scoreSequence(labels, label, seedOffset = 0) {
  const levels = [];
  for (const group of groups) {
    const realCounts = transitionCounts(labels, group);
    const nullCounts = seeds.map((seed) => gapConditionedCounts(labels, group, seed ^ seedOffset));
    const rows = [];
    for (let i = 0; i < group.phi; i++) {
      const samples = nullCounts.map((counts) => counts[i]);
      const expected = mean(samples);
      const variance = Math.max(1, mean(samples.map((value) => (value - expected) ** 2)));
      const z = (realCounts[i] - expected) / Math.sqrt(variance);
      rows.push({
        residue: group.residues[i],
        count: realCounts[i],
        expected,
        z,
      });
    }
    rows.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
    const trim = Math.max(1, Math.ceil(trimFrac * group.phi));
    const kept = rows.slice(trim);
    const top = rows.slice(0, trim);
    levels.push({
      modulus: group.modulus,
      phi: group.phi,
      trim,
      transitions: Math.max(0, labels.length - 1),
      fullEnergy: rms(rows),
      bulkEnergy: rms(kept),
      topEnergy: rms(top),
      top: rows.slice(0, 8),
    });
  }
  const bulkValues = levels.map((level) => level.bulkEnergy);
  const fullValues = levels.map((level) => level.fullEnergy);
  const topValues = levels.map((level) => level.topEnergy);
  return {
    label,
    levels,
    meanBulk: mean(bulkValues),
    maxBulk: Math.max(...bulkValues),
    meanFull: mean(fullValues),
    meanTop: mean(topValues),
  };
}

function summarize(flows) {
  return {
    meanBulk: range(flows.map((flow) => flow.meanBulk)),
    maxBulk: range(flows.map((flow) => flow.maxBulk)),
    meanFull: range(flows.map((flow) => flow.meanFull)),
    meanTop: range(flows.map((flow) => flow.meanTop)),
  };
}

function runAudit() {
  const flags = sieve(N);
  const endpointW = moduli.at(-1);
  const allPrimes = primesUpTo(N).filter((p) => gcd(p, endpointW) === 1);
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[transport-bulk] integer N=${limit}`);
    const primes = labelsUpTo(allPrimes, limit);
    const composites = eligibleComposites(limit, flags);
    const real = scoreSequence(primes, "primes", limit);
    const cramer = seeds.map((seed) => {
      const labels = cramerPrimes(limit, seed).filter((n) => gcd(n, endpointW) === 1);
      return scoreSequence(labels, `cramer-${seed}`, seed);
    });
    const composite = seeds.map((seed) => scoreSequence(sampleWithoutReplacement(composites, primes.length, seed), `composite-${seed}`, seed));
    rows.push({
      N: limit,
      labels: primes.length,
      real,
      cramer: summarize(cramer),
      composite: summarize(composite),
    });
  }
  return {
    moduli,
    trimFrac,
    rows,
    meanBulkTheta: exponent(rows.map((row) => ({ labels: row.labels, meanBulk: row.real.meanBulk })), "meanBulk", "labels"),
    meanFullTheta: exponent(rows.map((row) => ({ labels: row.labels, meanFull: row.real.meanFull })), "meanFull", "labels"),
    meanTopTheta: exponent(rows.map((row) => ({ labels: row.labels, meanTop: row.real.meanTop })), "meanTop", "labels"),
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
  const rows = report.integer.rows;
  const series = [
    { id: "prime trimmed bulk", color: "#67e8f9", rows: rows.map((row, i) => ({ x: i, y: row.real.meanBulk })) },
    { id: "prime full", color: "#34d399", rows: rows.map((row, i) => ({ x: i, y: row.real.meanFull })) },
    { id: "Cramer trimmed", color: "#fb7185", rows: rows.map((row, i) => ({ x: i, y: mean(row.cramer.meanBulk) })) },
    { id: "composite trimmed", color: "#a78bfa", rows: rows.map((row, i) => ({ x: i, y: mean(row.composite.meanBulk) })) },
  ];
  const allY = series.flatMap((s) => s.rows.map((row) => row.y)).filter(Number.isFinite);
  const yMin = 0;
  const yMax = Math.max(1.5, Math.max(...allY) * 1.1);
  const xMin = 0, xMax = rows.length - 1;
  const xOf = (point) => margin.left + ((point.x - xMin) / (xMax - xMin || 1)) * plotW;
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
    const x = 70 + (i % 4) * 230;
    return `<text x="${x}" y="42" fill="${s.color}" font-size="13">${s.id}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="70" y="26" fill="#e5e7eb" font-size="18" font-weight="700">gap-conditioned trimmed transport bulk</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${paths}
<text x="70" y="${height - 34}" fill="#94a3b8" font-size="13">y: RMS after preserving gaps and trimming top 1% transition-ratio cells</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Gap-conditioned trimmed transport bulk audit", "");
  lines.push("Candidate:");
  lines.push("preserve the actual gap sequence, compute transition-ratio z-scores, trim the top 1% cells by `|z|`, and score the remaining bulk RMS.", "");
  lines.push("| N | labels | prime bulk | prime full | prime top | levels bulk |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.integer.rows) {
    lines.push(`| ${row.N} | ${row.labels} | ${fmt(row.real.meanBulk)} | ${fmt(row.real.meanFull)} | ${fmt(row.real.meanTop)} | ${row.real.levels.map((level) => `${level.modulus}:${fmt(level.bulkEnergy, 3)}`).join(", ")} |`);
  }
  lines.push("");
  lines.push(`Exponent fits: \`bulk theta=${fmt(report.integer.meanBulkTheta)}\`, \`full theta=${fmt(report.integer.meanFullTheta)}\`, \`top theta=${fmt(report.integer.meanTopTheta)}\`.`);
  const last = report.integer.rows.at(-1);
  lines.push("");
  lines.push(`Endpoint controls at N=${last.N}:`);
  lines.push("");
  lines.push("| group | bulk range | full range | top range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, summary] of [["Cramer labels", last.cramer], ["sampled composites", last.composite]]) {
    lines.push(`| ${name} | ${fmt(summary.meanBulk[0])} .. ${fmt(summary.meanBulk[1])} | ${fmt(summary.meanFull[0])} .. ${fmt(summary.meanFull[1])} | ${fmt(summary.meanTop[0])} .. ${fmt(summary.meanTop[1])} |`);
  }
  lines.push("");
  lines.push("Endpoint top cells after gap conditioning:");
  for (const level of last.real.levels) {
    lines.push("");
    lines.push(`W=${level.modulus}, trim=${level.trim}, bulk=${fmt(level.bulkEnergy)}, top=${fmt(level.topEnergy)}:`);
    for (const row of level.top.slice(0, 5)) {
      lines.push(`- ratio ${row.residue}: count=${fmt(row.count, 0)}, gap-null=${fmt(row.expected, 2)}, z=${fmt(row.z, 3)}`);
    }
  }
  lines.push("");
  lines.push("Function-field note: no promoted field row. This still uses consecutive order; coefficient/lex order over `F_q[t]` would be an artifact, so the two-universe gate is unmet unless a coordinate-free analogue is invented.");
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[transport-bulk] max N=${N}`);
const integer = runAudit();
const base = `gapconditioned-transport-bulk-audit-${N}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "gap-conditioned trimmed transport bulk",
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
    meanBulk: integer.rows.at(-1).real.meanBulk,
    meanFull: integer.rows.at(-1).real.meanFull,
    meanTop: integer.rows.at(-1).real.meanTop,
    cramerBulkRange: integer.rows.at(-1).cramer.meanBulk,
    compositeBulkRange: integer.rows.at(-1).composite.meanBulk,
  },
  paths,
}, null, 2));
