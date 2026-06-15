#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildPolynomialUniverse, polyMod } from "../src/core/ffield.js";
import { sieve } from "../src/core/math.js";

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

function sampleSubset(values, k, random) {
  const pool = values.slice();
  const out = [];
  for (let i = 0; i < k && pool.length; i++) {
    const j = Math.floor(random() * pool.length);
    out.push(pool[j]);
    pool[j] = pool.at(-1);
    pool.pop();
  }
  out.sort((a, b) => a - b);
  return out;
}

function integerDistance(a, b) {
  return Math.abs(a - b) / W;
}

function polyDegreeInt(poly, q) {
  if (poly <= 0) return -1;
  let d = 0, p = 1;
  while (p * q <= poly) {
    p *= q;
    d++;
  }
  return d;
}

function polySubEncoded(a, b, q) {
  let aa = a, bb = b, pow = 1, out = 0;
  while (aa > 0 || bb > 0) {
    const c = ((aa % q) - (bb % q) + q) % q;
    out += c * pow;
    aa = Math.floor(aa / q);
    bb = Math.floor(bb / q);
    pow *= q;
  }
  return out;
}

function polyOffsetDistance(q, hDegree) {
  const denom = q ** Math.max(0, hDegree - 1);
  return (a, b) => {
    const diff = q === 2 ? (a ^ b) : polySubEncoded(a, b, q);
    const d = polyDegreeInt(diff, q);
    return d < 0 ? 0 : (q ** d) / denom;
  };
}

function tripleShapeMean(values, distanceFn) {
  if (values.length < 3) return NaN;
  let sum = 0, count = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const a = distanceFn(values[i], values[j]);
      for (let k = j + 1; k < values.length; k++) {
        const b = distanceFn(values[i], values[k]);
        const c = distanceFn(values[j], values[k]);
        const m = (a + b + c) / 3;
        if (m <= 0) continue;
        const variance = ((a - m) ** 2 + (b - m) ** 2 + (c - m) ** 2) / 3;
        sum += variance / (m * m);
        count++;
      }
    }
  }
  return count ? sum / count : NaN;
}

function keyFor(k, eligibleSize) {
  return `${k}:${eligibleSize}`;
}

function summarize(items) {
  const usable = items.filter((item) => Number.isFinite(item.residual));
  const n = usable.length;
  const sumResidual = usable.reduce((sum, item) => sum + item.residual, 0);
  const sumRaw = usable.reduce((sum, item) => sum + item.rawDelta, 0);
  const sumLocal = usable.reduce((sum, item) => sum + item.localShift, 0);
  const byAbs = usable.slice().sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual));
  const byClass = new Map();
  for (const item of usable) {
    const key = keyFor(item.k, item.eligibleSize);
    const row = byClass.get(key) || { k: item.k, eligibleSize: item.eligibleSize, n: 0, sumResidual: 0 };
    row.n++;
    row.sumResidual += item.residual;
    byClass.set(key, row);
  }
  const classRows = [...byClass.values()].map((row) => ({
    ...row,
    meanResidual: row.sumResidual / row.n,
    aggregateResidual: row.sumResidual / Math.sqrt(row.n || 1),
  })).sort((a, b) => Math.abs(b.aggregateResidual) - Math.abs(a.aggregateResidual));
  return {
    windows: n,
    meanRawDelta: sumRaw / (n || 1),
    meanLocalShift: sumLocal / (n || 1),
    meanResidual: sumResidual / (n || 1),
    aggregateResidual: sumResidual / Math.sqrt(n || 1),
    rmsResidual: Math.sqrt(mean(usable.map((item) => item.residual * item.residual))),
    sdResidual: stdev(usable.map((item) => item.residual)),
    strongest: byAbs.slice(0, 8),
    classRows: classRows.slice(0, 12),
  };
}

function controlItems(items, seed) {
  const random = rng(seed);
  return items.map((item) => {
    const chosen = sampleSubset(item.eligibleOffsets, item.k, random);
    const shape = tripleShapeMean(chosen, item.distanceFn);
    const rawDelta = shape - item.fullMean;
    return {
      ...item,
      id: `${item.id}:ctrl${seed}`,
      shape,
      rawDelta,
      residual: shape - item.localMean,
      localShift: item.localMean - item.fullMean,
    };
  }).filter((item) => Number.isFinite(item.residual));
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

function meanCache(distanceFn) {
  const cache = new Map();
  return (values) => {
    const key = values.join(",");
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const value = tripleShapeMean(values, distanceFn);
    cache.set(key, value);
    return value;
  };
}

function integerItems(isp, lo, hi, mode, eligibleForBase, localMeanFor, seed = 0) {
  const random = rng(seed);
  const out = [];
  const fullMean = tripleShapeMean(integerOffsets, integerDistance);
  const start = Math.ceil(lo / W) * W;
  const end = Math.floor((hi - W) / W) * W;
  for (let base = start; base <= end; base += W) {
    const eligibleOffsets = eligibleForBase(base);
    const primeOffsets = [];
    const compositeEligible = [];
    for (const offset of eligibleOffsets) {
      if (isp[base + offset]) primeOffsets.push(offset);
      else compositeEligible.push(offset);
    }
    const k = primeOffsets.length;
    if (k < 3 || eligibleOffsets.length < k) continue;
    const chosen = mode === "real"
      ? primeOffsets
      : mode === "composite"
        ? (compositeEligible.length >= k ? sampleSubset(compositeEligible, k, random) : [])
        : sampleSubset(eligibleOffsets, k, random);
    if (chosen.length !== k) continue;
    const localMean = localMeanFor(eligibleOffsets);
    const shape = tripleShapeMean(chosen, integerDistance);
    if (!Number.isFinite(localMean) || !Number.isFinite(shape)) continue;
    out.push({
      id: `${base}`,
      k,
      eligibleSize: eligibleOffsets.length,
      shape,
      fullMean,
      localMean,
      rawDelta: shape - fullMean,
      localShift: localMean - fullMean,
      residual: shape - localMean,
      eligibleOffsets,
      distanceFn: integerDistance,
    });
  }
  return out;
}

function integerAudit(isp) {
  const cutoffPrimes = primesUpToSmall(integerCutoff).filter((p) => W % p !== 0);
  const eligibleForBase = integerEligibleFactory(cutoffPrimes);
  const localMeanFor = meanCache(integerDistance);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    const realItems = integerItems(isp, lo, hi, "real", eligibleForBase, localMeanFor);
    const compositeItems = integerItems(isp, lo, hi, "composite", eligibleForBase, localMeanFor, 0xc011);
    rows.push({
      lo,
      hi,
      real: summarize(realItems),
      composite: summarize(compositeItems),
    });
  }
  const finalItems = integerItems(isp, rows.at(-1).lo, rows.at(-1).hi, "real", eligibleForBase, localMeanFor);
  const controls = seeds.map((seed) => summarize(controlItems(finalItems, seed)));
  return {
    W,
    integerCutoff,
    cutoffPrimes,
    offsets: integerOffsets.length,
    rows,
    controls,
    controlRanges: {
      meanResidual: range(controls.map((row) => row.meanResidual)),
      aggregateResidual: range(controls.map((row) => row.aggregateResidual)),
      rmsResidual: range(controls.map((row) => row.rmsResidual)),
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

function fieldItems(q, maxDegree, degree, hDegree, factorDegree, mode, seed = 0) {
  const universe = buildPolynomialUniverse(q, Math.max(maxDegree, factorDegree));
  const flags = universe.irreducibleFlagsByDegree[degree];
  const hSize = q ** hDegree;
  const windows = q ** (degree - hDegree);
  const offsets = Array.from({ length: hSize }, (_, i) => i);
  const factors = fieldFactorSpecs(q, maxDegree, factorDegree);
  const distanceFn = polyOffsetDistance(q, hDegree);
  const fullMean = tripleShapeMean(offsets, distanceFn);
  const localMeanFor = meanCache(distanceFn);
  const random = rng(seed);
  const lead = q ** degree;
  const eligibleForBase = fieldEligibleFactory(q, lead, offsets, factors);
  const out = [];
  for (let high = 0; high < windows; high++) {
    const base = high * hSize;
    const eligibleOffsets = eligibleForBase(base);
    const primeOffsets = [];
    const compositeEligible = [];
    for (const offset of eligibleOffsets) {
      if (flags[base + offset]) primeOffsets.push(offset);
      else compositeEligible.push(offset);
    }
    const k = primeOffsets.length;
    if (k < 3 || eligibleOffsets.length < k) continue;
    const chosen = mode === "real"
      ? primeOffsets
      : mode === "composite"
        ? (compositeEligible.length >= k ? sampleSubset(compositeEligible, k, random) : [])
        : sampleSubset(eligibleOffsets, k, random);
    if (chosen.length !== k) continue;
    const localMean = localMeanFor(eligibleOffsets);
    const shape = tripleShapeMean(chosen, distanceFn);
    if (!Number.isFinite(localMean) || !Number.isFinite(shape)) continue;
    out.push({
      id: `${degree}:${high}`,
      k,
      eligibleSize: eligibleOffsets.length,
      shape,
      fullMean,
      localMean,
      rawDelta: shape - fullMean,
      localShift: localMean - fullMean,
      residual: shape - localMean,
      eligibleOffsets,
      distanceFn,
    });
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
      meanResidual: range(controls.map((row) => row.meanResidual)),
      aggregateResidual: range(controls.map((row) => row.aggregateResidual)),
      rmsResidual: range(controls.map((row) => row.rmsResidual)),
    },
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mdIntegerRows(integer) {
  return integer.rows.map((row) => `| ${row.lo}..${row.hi} | ${row.real.windows} | ${fmt(row.real.meanRawDelta)} | ${fmt(row.real.meanLocalShift)} | ${fmt(row.real.meanResidual)} | ${fmt(row.real.aggregateResidual)} | ${fmt(row.composite.aggregateResidual)} |`).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => `| ${row.degree} | ${row.real.windows} | ${fmt(row.real.meanRawDelta)} | ${fmt(row.real.meanLocalShift)} | ${fmt(row.real.meanResidual)} | ${fmt(row.real.aggregateResidual)} | ${fmt(row.composite.aggregateResidual)} |`).join("\n");
}

function classRowsText(summary) {
  return summary.classRows.map((row) => `k${row.k}/e${row.eligibleSize}:n${row.n}:mean${fmt(row.meanResidual, 5)}:A${fmt(row.aggregateResidual, 4)}`).join(", ");
}

function strongestText(summary) {
  return summary.strongest.map((item) => `${item.id}:k${item.k}:e${item.eligibleSize}:res${fmt(item.residual, 5)}`).join(", ");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function heatColor(value, scale) {
  const x = Math.max(-1, Math.min(1, value / (scale || 1)));
  if (x >= 0) return `rgb(${Math.round(55 + 175 * x)},${Math.round(115 - 35 * x)},${Math.round(165 - 85 * x)})`;
  const t = -x;
  return `rgb(${Math.round(55 - 20 * t)},${Math.round(115 + 115 * t)},${Math.round(170 + 45 * t)})`;
}

function heatmap(items, x, y, w, h, title) {
  const cells = items.slice(0, 96);
  const maxAbs = Math.max(1e-9, ...cells.map((item) => Math.abs(item.residual)));
  const cols = 32;
  const rows = Math.max(1, Math.ceil(cells.length / cols));
  const cellW = w / cols;
  const cellH = h / rows;
  const rects = cells.map((item, i) => {
    const cx = x + (i % cols) * cellW;
    const cy = y + Math.floor(i / cols) * cellH;
    return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(item.residual, maxAbs)}"><title>${item.id} k=${item.k} eligible=${item.eligibleSize} residual=${fmt(item.residual, 6)}</title></rect>`;
  }).join("\n");
  return `<g font-family="Menlo, Consolas, monospace" font-size="10">
<text x="${x}" y="${y - 10}" fill="#e5e7eb" font-size="13">${title}</text>
${rects}
</g>`;
}

function svg(integer, q2, q3) {
  const width = 1160, height = 820;
  const z = integer.rows.map((row) => row.real.aggregateResidual);
  const zComp = integer.rows.map((row) => row.composite.aggregateResidual);
  const f2 = q2.rows.map((row) => row.real.aggregateResidual);
  const f3 = q3.rows.map((row) => row.real.aggregateResidual);
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
<text x="54" y="36" fill="#f8fafc" font-size="18">local-sieve-subtracted triple-shape cumulant</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">aggregate residual after count-matching inside window-specific small-factor eligible sets</text>
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
${heatmap(iFinal.strongest, 90, 430, 440, 120, "Z strongest residual windows")}
${heatmap(q2Final.strongest, 90, 655, 440, 120, "F2[t] strongest residual windows")}
${heatmap(q3Final.strongest, 650, 655, 440, 120, "F3[t] strongest residual windows")}
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="650" y="430" fill="#e5e7eb">final summary</text>
<text x="650" y="460" fill="#a7f3d0">Z residual agg ${fmt(iFinal.aggregateResidual)}, mean ${fmt(iFinal.meanResidual)}</text>
<text x="650" y="484" fill="#94a3b8">Z controls ${integer.controlRanges.aggregateResidual.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="508" fill="#7dd3fc">composite residual agg ${fmt(integer.rows.at(-1).composite.aggregateResidual)}</text>
<text x="650" y="532" fill="#fbbf24">F2 residual agg ${fmt(q2Final.aggregateResidual)}, controls ${q2.controlRanges.aggregateResidual.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="556" fill="#f472b6">F3 residual agg ${fmt(q3Final.aggregateResidual)}, controls ${q3.controlRanges.aggregateResidual.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="594" fill="#94a3b8">red = positive residual, blue = negative residual, per-panel clamp</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[triple-local-sieve] building integer sieve to ${N}`);
const isp = sieve(N + W + 1);

console.error(`[triple-local-sieve] integer windows cutoff ${integerCutoff}`);
const integer = integerAudit(isp);
console.error(`[triple-local-sieve] F_2[t] degree ${q2MaxDegree}, factor degree ${q2FactorDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, 5, q2FactorDegree);
console.error(`[triple-local-sieve] F_3[t] degree ${q3MaxDegree}, factor degree ${q3FactorDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, 3, q3FactorDegree);

const tag = `triple-local-sieve-audit-${N}-p${integerCutoff}-f${q2FactorDegree}${q3FactorDegree}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);

const output = {
  candidate: "local-sieve-subtracted triple-shape cumulant",
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

const md = `# local-sieve-subtracted triple-shape cumulant audit

Candidate:
inside each short window, condition on observed count and on the
window-specific small-factor eligible offsets, then measure the remaining
triple-shape residual.

Integer windows: length \`${W}\`, reduced offsets \`${integerOffsets.length}\`,
small-prime cutoff \`${integerCutoff}\`, active primes
\`${integer.cutoffPrimes.join(",")}\`.

## Integer fresh blocks

| block | windows | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate residual |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(integer)}

Endpoint local-sieve count-matched controls:

- aggregate residual range: \`${integer.controlRanges.aggregateResidual.map((v) => fmt(v)).join(" .. ")}\`
- mean residual range: \`${integer.controlRanges.meanResidual.map((v) => fmt(v)).join(" .. ")}\`
- rms residual range: \`${integer.controlRanges.rmsResidual.map((v) => fmt(v)).join(" .. ")}\`

## F_2[t] degree path

Factor degree cutoff: \`${q2FactorDegree}\`.

| degree | windows | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate residual |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q2)}

Endpoint local-sieve count-matched controls:
\`${q2.controlRanges.aggregateResidual.map((v) => fmt(v)).join(" .. ")}\`.

## F_3[t] degree path

Factor degree cutoff: \`${q3FactorDegree}\`.

| degree | windows | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate residual |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q3)}

Endpoint local-sieve count-matched controls:
\`${q3.controlRanges.aggregateResidual.map((v) => fmt(v)).join(" .. ")}\`.

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
    meanRawDelta: finalInteger.meanRawDelta,
    meanLocalShift: finalInteger.meanLocalShift,
    meanResidual: finalInteger.meanResidual,
    aggregateResidual: finalInteger.aggregateResidual,
    controlAggregateRange: integer.controlRanges.aggregateResidual,
    compositeAggregateResidual: integer.rows.at(-1).composite.aggregateResidual,
  },
  finalQ2: {
    windows: finalQ2.windows,
    meanResidual: finalQ2.meanResidual,
    aggregateResidual: finalQ2.aggregateResidual,
    controlAggregateRange: q2.controlRanges.aggregateResidual,
  },
  finalQ3: {
    windows: finalQ3.windows,
    meanResidual: finalQ3.meanResidual,
    aggregateResidual: finalQ3.aggregateResidual,
    controlAggregateRange: q3.controlRanges.aggregateResidual,
  },
}, null, 2));
