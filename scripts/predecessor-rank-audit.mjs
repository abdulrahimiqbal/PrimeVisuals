#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildPolynomialUniverse, polyMod, polynomialMobius, polySub } from "../src/core/ffield.js";
import { mobiusUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const integerCutoff = Number(process.argv[4] || 47);
const q2MaxDegree = Number(process.argv[5] || 24);
const q3MaxDegree = Number(process.argv[6] || 15);
const q2FactorDegree = Number(process.argv[7] || 3);
const q3FactorDegree = Number(process.argv[8] || 2);

const W = 210;
const integerOffsets = Array.from({ length: W }, (_, i) => i + 1).filter((x) => gcd(x, W) === 1);
const seeds = [12345, 271828, 314159, 161803, 424242];
const scales = [N / 8, N / 4, N / 2, N].map((x) => Math.max(200_000, Math.round(x)));

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

function stdev(values) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - m) ** 2)));
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function primesUpToSmall(n) {
  const flags = sieve(Math.max(2, n));
  const out = [];
  for (let p = 2; p <= n; p++) if (flags[p]) out.push(p);
  return out;
}

function sampleIndices(length, k, random) {
  const pool = Array.from({ length }, (_, i) => i);
  const out = [];
  for (let i = 0; i < k && pool.length; i++) {
    const j = Math.floor(random() * pool.length);
    out.push(pool[j]);
    pool[j] = pool.at(-1);
    pool.pop();
  }
  return out;
}

function scoreStats(scores) {
  const m = mean(scores);
  const variance = mean(scores.map((score) => (score - m) ** 2));
  return { mean: m, variance };
}

function windowZ(scores, chosenIndices) {
  const M = scores.length;
  const k = chosenIndices.length;
  if (M < 2 || k < 1 || k > M) return null;
  const stats = scoreStats(scores);
  const chosenMean = mean(chosenIndices.map((idx) => scores[idx]));
  const finiteCorrection = Math.max(0, (M - k) / Math.max(1, M - 1));
  const se = Math.sqrt((stats.variance / k) * finiteCorrection);
  if (!(se > 1e-12)) return null;
  return {
    observedMean: chosenMean,
    localMean: stats.mean,
    delta: chosenMean - stats.mean,
    z: (chosenMean - stats.mean) / se,
  };
}

function summarize(items) {
  const usable = items.filter((item) => Number.isFinite(item.z));
  const n = usable.length;
  const sumZ = usable.reduce((sum, item) => sum + item.z, 0);
  const byAbs = usable.slice().sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  const byClass = new Map();
  for (const item of usable) {
    const key = `${item.k}:${item.eligibleSize}`;
    const row = byClass.get(key) || { k: item.k, eligibleSize: item.eligibleSize, n: 0, sumZ: 0 };
    row.n++;
    row.sumZ += item.z;
    byClass.set(key, row);
  }
  const classRows = [...byClass.values()].map((row) => ({
    ...row,
    meanZ: row.sumZ / row.n,
    aggregateZ: row.sumZ / Math.sqrt(row.n || 1),
  })).sort((a, b) => Math.abs(b.aggregateZ) - Math.abs(a.aggregateZ));
  return {
    windows: n,
    meanObserved: mean(usable.map((item) => item.observedMean)),
    meanLocal: mean(usable.map((item) => item.localMean)),
    meanDelta: mean(usable.map((item) => item.delta)),
    meanZ: sumZ / (n || 1),
    aggregateZ: sumZ / Math.sqrt(n || 1),
    rmsZ: Math.sqrt(mean(usable.map((item) => item.z * item.z))),
    sdZ: stdev(usable.map((item) => item.z)),
    strongest: byAbs.slice(0, 8),
    classRows: classRows.slice(0, 12),
  };
}

function controlItems(items, seed) {
  const random = rng(seed);
  return items.map((item) => {
    const sample = sampleIndices(item.scores.length, item.k, random);
    const scored = windowZ(item.scores, sample);
    if (!scored) return null;
    return { ...item, ...scored, id: `${item.id}:ctrl${seed}` };
  }).filter(Boolean);
}

function integerEligibleFactory(cutoffPrimes) {
  const cache = new Map();
  return (base) => {
    const key = cutoffPrimes.map((p) => base % p).join(",");
    const cached = cache.get(key);
    if (cached) return cached;
    const eligible = integerOffsets.filter((offset) => {
      const value = base + offset;
      for (const p of cutoffPrimes) if (value % p === 0) return false;
      return true;
    });
    cache.set(key, eligible);
    return eligible;
  };
}

function integerWindowItem(base, offsets, chosenOffsets, mu, id) {
  const indexByOffset = new Map(offsets.map((offset, i) => [offset, i]));
  const scores = offsets.map((offset) => (mu[base + offset - 1] !== 0 ? 1 : 0));
  const chosenIndices = chosenOffsets.map((offset) => indexByOffset.get(offset)).filter((idx) => idx !== undefined);
  const scored = windowZ(scores, chosenIndices);
  if (!scored) return null;
  return {
    id,
    k: chosenIndices.length,
    eligibleSize: offsets.length,
    scores,
    ...scored,
  };
}

function integerItems(isp, mu, lo, hi, mode, eligibleForBase, seed = 0) {
  const random = rng(seed);
  const out = [];
  const start = Math.ceil(lo / W) * W;
  const end = Math.floor((hi - W) / W) * W;
  for (let base = start; base <= end; base += W) {
    const eligible = eligibleForBase(base);
    const primeOffsets = [];
    const compositeOffsets = [];
    for (const offset of eligible) {
      if (isp[base + offset]) primeOffsets.push(offset);
      else compositeOffsets.push(offset);
    }
    const k = primeOffsets.length;
    if (k < 1 || eligible.length <= 1) continue;
    const chosen = mode === "real"
      ? primeOffsets
      : mode === "composite"
        ? (compositeOffsets.length >= k ? sampleIndices(compositeOffsets.length, k, random).map((idx) => compositeOffsets[idx]) : [])
        : sampleIndices(eligible.length, k, random).map((idx) => eligible[idx]);
    if (chosen.length !== k) continue;
    const item = integerWindowItem(base, eligible, chosen, mu, `${base}`);
    if (item) out.push(item);
  }
  return out;
}

function integerAudit(isp, mu) {
  const cutoffPrimes = primesUpToSmall(integerCutoff).filter((p) => W % p !== 0);
  const eligibleForBase = integerEligibleFactory(cutoffPrimes);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    const realItems = integerItems(isp, mu, lo, hi, "real", eligibleForBase);
    const compositeItems = integerItems(isp, mu, lo, hi, "composite", eligibleForBase, 0xc011);
    rows.push({
      lo,
      hi,
      real: summarize(realItems),
      composite: summarize(compositeItems),
    });
  }
  const finalItems = integerItems(isp, mu, rows.at(-1).lo, rows.at(-1).hi, "real", eligibleForBase);
  const controls = seeds.map((seed) => summarize(controlItems(finalItems, seed)));
  return {
    W,
    integerCutoff,
    cutoffPrimes,
    rows,
    controls,
    controlRanges: {
      meanZ: range(controls.map((row) => row.meanZ)),
      aggregateZ: range(controls.map((row) => row.aggregateZ)),
      rmsZ: range(controls.map((row) => row.rmsZ)),
    },
  };
}

function fieldFactorSpecs(q, maxDegree, maxFactorDegree) {
  const universe = buildPolynomialUniverse(q, Math.max(maxDegree, maxFactorDegree));
  const out = [];
  for (let degree = 1; degree <= maxFactorDegree; degree++) {
    for (const modulus of universe.irreduciblesByDegree[degree]) out.push({ degree, modulus });
  }
  return out;
}

function fieldEligibleFactory(q, lead, offsets, factors) {
  const cache = new Map();
  return (base) => {
    const basePoly = lead + base;
    const key = factors.map((factor) => polyMod(basePoly, factor.modulus, q)).join(",");
    const cached = cache.get(key);
    if (cached) return cached;
    const eligible = offsets.filter((offset) => {
      const poly = basePoly + offset;
      for (const factor of factors) if (polyMod(poly, factor.modulus, q) === 0) return false;
      return true;
    });
    cache.set(key, eligible);
    return eligible;
  };
}

function fieldWindowItem(q, universe, degree, base, offsets, chosenOffsets, id) {
  const lead = q ** degree;
  const indexByOffset = new Map(offsets.map((offset, i) => [offset, i]));
  const scores = offsets.map((offset) => {
    const poly = lead + base + offset;
    const predecessor = polySub(poly, 1, q);
    return polynomialMobius(predecessor, universe) !== 0 ? 1 : 0;
  });
  const chosenIndices = chosenOffsets.map((offset) => indexByOffset.get(offset)).filter((idx) => idx !== undefined);
  const scored = windowZ(scores, chosenIndices);
  if (!scored) return null;
  return {
    id,
    k: chosenIndices.length,
    eligibleSize: offsets.length,
    scores,
    ...scored,
  };
}

function fieldItems(q, maxDegree, degree, hDegree, factorDegree, mode, seed = 0) {
  const universe = buildPolynomialUniverse(q, Math.max(maxDegree, factorDegree));
  const flags = universe.irreducibleFlagsByDegree[degree];
  const hSize = q ** hDegree;
  const windows = q ** (degree - hDegree);
  const offsets = Array.from({ length: hSize }, (_, i) => i);
  const factors = fieldFactorSpecs(q, maxDegree, factorDegree);
  const lead = q ** degree;
  const eligibleForBase = fieldEligibleFactory(q, lead, offsets, factors);
  const random = rng(seed);
  const out = [];
  for (let high = 0; high < windows; high++) {
    const base = high * hSize;
    const eligible = eligibleForBase(base);
    const primeOffsets = [];
    const compositeOffsets = [];
    for (const offset of eligible) {
      if (flags[base + offset]) primeOffsets.push(offset);
      else compositeOffsets.push(offset);
    }
    const k = primeOffsets.length;
    if (k < 1 || eligible.length <= 1) continue;
    const chosen = mode === "real"
      ? primeOffsets
      : mode === "composite"
        ? (compositeOffsets.length >= k ? sampleIndices(compositeOffsets.length, k, random).map((idx) => compositeOffsets[idx]) : [])
        : sampleIndices(eligible.length, k, random).map((idx) => eligible[idx]);
    if (chosen.length !== k) continue;
    const item = fieldWindowItem(q, universe, degree, base, eligible, chosen, `${degree}:${high}`);
    if (item) out.push(item);
  }
  return out;
}

function fieldAudit(q, maxDegree, hDegree, factorDegree) {
  const start = Math.max(hDegree + 2, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    const realItems = fieldItems(q, maxDegree, degree, hDegree, factorDegree, "real");
    const compositeItems = fieldItems(q, maxDegree, degree, hDegree, factorDegree, "composite", 0xc0de + q);
    rows.push({
      degree,
      real: summarize(realItems),
      composite: summarize(compositeItems),
    });
  }
  const finalItems = fieldItems(q, maxDegree, rows.at(-1).degree, hDegree, factorDegree, "real");
  const controls = seeds.map((seed) => summarize(controlItems(finalItems, seed)));
  return {
    q,
    maxDegree,
    hDegree,
    factorDegree,
    rows,
    controls,
    controlRanges: {
      meanZ: range(controls.map((row) => row.meanZ)),
      aggregateZ: range(controls.map((row) => row.aggregateZ)),
      rmsZ: range(controls.map((row) => row.rmsZ)),
    },
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mdIntegerRows(integer) {
  return integer.rows.map((row) => `| ${row.lo}..${row.hi} | ${row.real.windows} | ${fmt(row.real.meanObserved)} | ${fmt(row.real.meanLocal)} | ${fmt(row.real.meanDelta)} | ${fmt(row.real.meanZ)} | ${fmt(row.real.aggregateZ)} | ${fmt(row.composite.aggregateZ)} |`).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => `| ${row.degree} | ${row.real.windows} | ${fmt(row.real.meanObserved)} | ${fmt(row.real.meanLocal)} | ${fmt(row.real.meanDelta)} | ${fmt(row.real.meanZ)} | ${fmt(row.real.aggregateZ)} | ${fmt(row.composite.aggregateZ)} |`).join("\n");
}

function classRowsText(summary) {
  return summary.classRows.map((row) => `k${row.k}/e${row.eligibleSize}:n${row.n}:meanZ${fmt(row.meanZ, 3)}:Z${fmt(row.aggregateZ, 3)}`).join(", ");
}

function strongestText(summary) {
  return summary.strongest.map((item) => `${item.id}:k${item.k}:e${item.eligibleSize}:z${fmt(item.z, 3)}:obs${fmt(item.observedMean, 3)}:loc${fmt(item.localMean, 3)}`).join(", ");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function heatColor(value) {
  const x = Math.max(-4, Math.min(4, value)) / 4;
  if (x >= 0) return `rgb(${Math.round(55 + 175 * x)},${Math.round(115 - 35 * x)},${Math.round(165 - 85 * x)})`;
  const t = -x;
  return `rgb(${Math.round(55 - 20 * t)},${Math.round(115 + 115 * t)},${Math.round(170 + 45 * t)})`;
}

function heatmap(items, x, y, w, h, title) {
  const cells = items.slice(0, 96);
  const cols = 32;
  const rows = Math.max(1, Math.ceil(cells.length / cols));
  const cellW = w / cols;
  const cellH = h / rows;
  const rects = cells.map((item, i) => {
    const cx = x + (i % cols) * cellW;
    const cy = y + Math.floor(i / cols) * cellH;
    return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(item.z)}"><title>${item.id} k=${item.k} eligible=${item.eligibleSize} z=${fmt(item.z, 3)}</title></rect>`;
  }).join("\n");
  return `<g font-family="Menlo, Consolas, monospace" font-size="10">
<text x="${x}" y="${y - 10}" fill="#e5e7eb" font-size="13">${title}</text>
${rects}
</g>`;
}

function svg(integer, q2, q3) {
  const width = 1160, height = 820;
  const z = integer.rows.map((row) => row.real.aggregateZ);
  const zComp = integer.rows.map((row) => row.composite.aggregateZ);
  const f2 = q2.rows.map((row) => row.real.aggregateZ);
  const f3 = q3.rows.map((row) => row.real.aggregateZ);
  const all = [...z, ...zComp, ...f2, ...f3, 0];
  const minY = Math.min(...all) * 1.08;
  const maxY = Math.max(...all) * 1.08;
  const chart = { x: 82, y: 72, w: 1000, h: 260 };
  const zeroY = chart.y + chart.h - ((0 - minY) / (maxY - minY || 1)) * chart.h;
  const iFinal = integer.rows.at(-1).real;
  const q2Final = q2.rows.at(-1).real;
  const q3Final = q3.rows.at(-1).real;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">local-eligible predecessor-squarefree rank discrepancy</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">aggregate Z of Q(n)=1_{n-1 squarefree} inside window-specific local eligible sets</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
<path d="${linePath(z, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${linePath(zComp, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#7dd3fc" stroke-width="3"/>
<path d="${linePath(f2, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fbbf24" stroke-width="3"/>
<path d="${linePath(f3, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f472b6" stroke-width="3"/>
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">integer scales / F_q top degrees</text>
<text x="${chart.x + 640}" y="${chart.y + chart.h + 24}" fill="#a7f3d0" font-size="12">Z primes</text>
<text x="${chart.x + 745}" y="${chart.y + chart.h + 24}" fill="#7dd3fc" font-size="12">Z composites</text>
<text x="${chart.x + 875}" y="${chart.y + chart.h + 24}" fill="#fbbf24" font-size="12">F2[t]</text>
<text x="${chart.x + 950}" y="${chart.y + chart.h + 24}" fill="#f472b6" font-size="12">F3[t]</text>
</g>
${heatmap(iFinal.strongest, 90, 430, 440, 120, "Z strongest windows")}
${heatmap(q2Final.strongest, 90, 655, 440, 120, "F2[t] strongest windows")}
${heatmap(q3Final.strongest, 650, 655, 440, 120, "F3[t] strongest windows")}
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="650" y="430" fill="#e5e7eb">final summary</text>
<text x="650" y="460" fill="#a7f3d0">Z aggregate ${fmt(iFinal.aggregateZ)}, mean z ${fmt(iFinal.meanZ)}</text>
<text x="650" y="484" fill="#94a3b8">Z controls ${integer.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="508" fill="#7dd3fc">composite aggregate ${fmt(integer.rows.at(-1).composite.aggregateZ)}</text>
<text x="650" y="532" fill="#fbbf24">F2 aggregate ${fmt(q2Final.aggregateZ)}, controls ${q2.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="556" fill="#f472b6">F3 aggregate ${fmt(q3Final.aggregateZ)}, controls ${q3.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="594" fill="#94a3b8">red = positive z, blue = negative z, clamp +/-4</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[predecessor-rank] building integer sieve/mobius to ${N}`);
const isp = sieve(N + W + 1);
const mu = mobiusUpTo(N + W + 1);

console.error(`[predecessor-rank] integer windows cutoff ${integerCutoff}`);
const integer = integerAudit(isp, mu);
console.error(`[predecessor-rank] F_2[t] degree ${q2MaxDegree}, factor degree ${q2FactorDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, 5, q2FactorDegree);
console.error(`[predecessor-rank] F_3[t] degree ${q3MaxDegree}, factor degree ${q3FactorDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, 3, q3FactorDegree);

const tag = `predecessor-rank-audit-${N}-p${integerCutoff}-f${q2FactorDegree}${q3FactorDegree}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);

const output = {
  candidate: "local-eligible predecessor-squarefree rank discrepancy",
  N,
  integer,
  q2,
  q3,
};

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer, q2, q3));

const finalInteger = integer.rows.at(-1).real;
const finalQ2 = q2.rows.at(-1).real;
const finalQ3 = q3.rows.at(-1).real;

const md = `# local-eligible predecessor-squarefree rank discrepancy audit

Candidate:
inside each local eligible set, score offsets by whether the predecessor is
squarefree, then compare prime offsets against finite-population count-matched
subsets.

Integer windows: length \`${W}\`, reduced offsets \`${integerOffsets.length}\`,
small-prime cutoff \`${integerCutoff}\`, active primes
\`${integer.cutoffPrimes.join(",")}\`.

## Integer fresh blocks

| block | windows | observed mean | local mean | mean delta | mean z | aggregate Z | composite aggregate Z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(integer)}

Endpoint local-eligible count-matched controls:

- aggregate Z range: \`${integer.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}\`
- mean z range: \`${integer.controlRanges.meanZ.map((v) => fmt(v)).join(" .. ")}\`
- rms z range: \`${integer.controlRanges.rmsZ.map((v) => fmt(v)).join(" .. ")}\`

## F_2[t] degree path

Factor degree cutoff: \`${q2FactorDegree}\`.

| degree | windows | observed mean | local mean | mean delta | mean z | aggregate Z | composite aggregate Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q2)}

Endpoint local-eligible count-matched controls:
\`${q2.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}\`.

## F_3[t] degree path

Factor degree cutoff: \`${q3FactorDegree}\`.

| degree | windows | observed mean | local mean | mean delta | mean z | aggregate Z | composite aggregate Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q3)}

Endpoint local-eligible count-matched controls:
\`${q3.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}\`.

## Dominant count/eligible-size classes

Z endpoint:
\`${classRowsText(finalInteger)}\`

F_2[t] endpoint:
\`${classRowsText(finalQ2)}\`

F_3[t] endpoint:
\`${classRowsText(finalQ3)}\`

## Strongest windows

Z:
\`${strongestText(finalInteger)}\`

F_2[t]:
\`${strongestText(finalQ2)}\`

F_3[t]:
\`${strongestText(finalQ3)}\`

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;

fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  finalInteger: {
    windows: finalInteger.windows,
    observedMean: finalInteger.meanObserved,
    localMean: finalInteger.meanLocal,
    meanDelta: finalInteger.meanDelta,
    meanZ: finalInteger.meanZ,
    aggregateZ: finalInteger.aggregateZ,
    controlAggregateRange: integer.controlRanges.aggregateZ,
    compositeAggregateZ: integer.rows.at(-1).composite.aggregateZ,
  },
  finalQ2: {
    windows: finalQ2.windows,
    observedMean: finalQ2.meanObserved,
    localMean: finalQ2.meanLocal,
    aggregateZ: finalQ2.aggregateZ,
    controlAggregateRange: q2.controlRanges.aggregateZ,
  },
  finalQ3: {
    windows: finalQ3.windows,
    observedMean: finalQ3.meanObserved,
    localMean: finalQ3.meanLocal,
    aggregateZ: finalQ3.aggregateZ,
    controlAggregateRange: q3.controlRanges.aggregateZ,
  },
}, null, 2));
