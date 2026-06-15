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
const integerOffsetIndex = new Map(integerOffsets.map((offset, i) => [offset, i]));
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

function bit(index) {
  return 1n << BigInt(index);
}

function popcount(mask) {
  let x = mask;
  let count = 0;
  while (x) {
    x &= x - 1n;
    count++;
  }
  return count;
}

const maskIndexCache = new Map();
function indicesFromMask(mask) {
  const key = mask.toString();
  const cached = maskIndexCache.get(key);
  if (cached) return cached;
  const out = [];
  let x = mask, index = 0;
  while (x) {
    if (x & 1n) out.push(index);
    x >>= 1n;
    index++;
  }
  maskIndexCache.set(key, out);
  return out;
}

function sampleMaskFromEligible(eligibleMask, k, random) {
  const pool = indicesFromMask(eligibleMask).slice();
  let mask = 0n;
  for (let i = 0; i < k && pool.length; i++) {
    const j = Math.floor(random() * pool.length);
    mask |= bit(pool[j]);
    pool[j] = pool.at(-1);
    pool.pop();
  }
  return mask;
}

function descriptor(id, eligibleMask, chosenMask) {
  const M = popcount(eligibleMask);
  const k = popcount(chosenMask);
  if (M <= 1 || k <= 0 || k >= M) return null;
  return {
    id,
    eligibleMask,
    chosenMask,
    M,
    k,
    norm: Math.sqrt(k * (1 - k / M)),
  };
}

function randomDescriptor(template, random) {
  return descriptor(template.id, template.eligibleMask, sampleMaskFromEligible(template.eligibleMask, template.k, random));
}

function correlation(a, b) {
  if (!a || !b || !(a.norm > 0) || !(b.norm > 0)) return null;
  const commonEligible = a.eligibleMask & b.eligibleMask;
  const commonCount = popcount(commonEligible);
  if (commonCount === 0) return null;
  const p = a.k / a.M;
  const q = b.k / b.M;
  const chosenBoth = popcount(a.chosenMask & b.chosenMask);
  const aInBEligible = popcount(a.chosenMask & b.eligibleMask);
  const bInAEligible = popcount(b.chosenMask & a.eligibleMask);
  const dot = chosenBoth - q * aInBEligible - p * bInAEligible + p * q * commonCount;
  return dot / (a.norm * b.norm);
}

function pairItems(windows) {
  const out = [];
  for (let i = 1; i < windows.length; i++) {
    const prev = windows[i - 1];
    const curr = windows[i];
    const corr = correlation(prev, curr);
    if (!Number.isFinite(corr)) continue;
    out.push({
      id: `${prev.id}->${curr.id}`,
      corr,
      k0: prev.k,
      k1: curr.k,
      e0: prev.M,
      e1: curr.M,
    });
  }
  return out;
}

function summarizePairs(items) {
  const n = items.length;
  const sum = items.reduce((acc, item) => acc + item.corr, 0);
  const byAbs = items.slice().sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr));
  const byClass = new Map();
  for (const item of items) {
    const key = `${item.k0},${item.k1}:${item.e0},${item.e1}`;
    const row = byClass.get(key) || { k0: item.k0, k1: item.k1, e0: item.e0, e1: item.e1, n: 0, sum: 0 };
    row.n++;
    row.sum += item.corr;
    byClass.set(key, row);
  }
  const classRows = [...byClass.values()].map((row) => ({
    ...row,
    meanCorr: row.sum / row.n,
    aggregate: row.sum / Math.sqrt(row.n || 1),
  })).sort((a, b) => Math.abs(b.aggregate) - Math.abs(a.aggregate));
  return {
    pairs: n,
    meanCorr: sum / (n || 1),
    aggregate: sum / Math.sqrt(n || 1),
    rmsCorr: Math.sqrt(mean(items.map((item) => item.corr * item.corr))),
    sdCorr: stdev(items.map((item) => item.corr)),
    strongest: byAbs.slice(0, 8),
    classRows: classRows.slice(0, 12),
  };
}

function summarizeWindows(windows) {
  return summarizePairs(pairItems(windows));
}

function controlSummary(windows, seed) {
  const random = rng(seed);
  return summarizeWindows(windows.map((win) => (win ? randomDescriptor(win, random) : null)));
}

function integerEligibleFactory(cutoffPrimes) {
  const cache = new Map();
  return (base) => {
    const key = cutoffPrimes.map((p) => base % p).join(",");
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    let mask = 0n;
    for (const offset of integerOffsets) {
      const value = base + offset;
      let ok = true;
      for (const p of cutoffPrimes) {
        if (value % p === 0) {
          ok = false;
          break;
        }
      }
      if (ok) mask |= bit(integerOffsetIndex.get(offset));
    }
    cache.set(key, mask);
    return mask;
  };
}

function integerWindows(isp, lo, hi, mode, eligibleForBase, seed = 0) {
  const random = rng(seed);
  const out = [];
  const start = Math.ceil(lo / W) * W;
  const end = Math.floor((hi - W) / W) * W;
  for (let base = start; base <= end; base += W) {
    const eligibleMask = eligibleForBase(base);
    let primeMask = 0n;
    let compositeMask = 0n;
    for (const offset of integerOffsets) {
      const idx = integerOffsetIndex.get(offset);
      const b = bit(idx);
      if (!(eligibleMask & b)) continue;
      if (isp[base + offset]) primeMask |= b;
      else compositeMask |= b;
    }
    const k = popcount(primeMask);
    const chosenMask = mode === "real"
      ? primeMask
      : mode === "composite"
        ? (popcount(compositeMask) >= k ? sampleMaskFromEligible(compositeMask, k, random) : 0n)
        : sampleMaskFromEligible(eligibleMask, k, random);
    out.push(descriptor(`${base}`, eligibleMask, chosenMask));
  }
  return out;
}

function integerAudit(isp) {
  const cutoffPrimes = primesUpToSmall(integerCutoff).filter((p) => W % p !== 0);
  const eligibleForBase = integerEligibleFactory(cutoffPrimes);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    rows.push({
      lo,
      hi,
      real: summarizeWindows(integerWindows(isp, lo, hi, "real", eligibleForBase)),
      composite: summarizeWindows(integerWindows(isp, lo, hi, "composite", eligibleForBase, 0xc011)),
    });
  }
  const finalWindows = integerWindows(isp, rows.at(-1).lo, rows.at(-1).hi, "real", eligibleForBase);
  const controls = seeds.map((seed) => controlSummary(finalWindows, seed));
  return {
    W,
    integerCutoff,
    cutoffPrimes,
    rows,
    controls,
    controlRanges: {
      meanCorr: range(controls.map((row) => row.meanCorr)),
      aggregate: range(controls.map((row) => row.aggregate)),
      rmsCorr: range(controls.map((row) => row.rmsCorr)),
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

function fieldEligibleFactory(q, lead, hSize, factors) {
  const cache = new Map();
  return (base) => {
    const basePoly = lead + base;
    const key = factors.map((factor) => polyMod(basePoly, factor.modulus, q)).join(",");
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    let mask = 0n;
    for (let offset = 0; offset < hSize; offset++) {
      const poly = basePoly + offset;
      let ok = true;
      for (const factor of factors) {
        if (polyMod(poly, factor.modulus, q) === 0) {
          ok = false;
          break;
        }
      }
      if (ok) mask |= bit(offset);
    }
    cache.set(key, mask);
    return mask;
  };
}

function fieldWindows(q, maxDegree, degree, hDegree, factorDegree, mode, seed = 0) {
  const universe = buildPolynomialUniverse(q, Math.max(maxDegree, factorDegree));
  const flags = universe.irreducibleFlagsByDegree[degree];
  const hSize = q ** hDegree;
  const windows = q ** (degree - hDegree);
  const factors = fieldFactorSpecs(q, maxDegree, factorDegree);
  const lead = q ** degree;
  const eligibleForBase = fieldEligibleFactory(q, lead, hSize, factors);
  const random = rng(seed);
  const out = [];
  for (let high = 0; high < windows; high++) {
    const base = high * hSize;
    const eligibleMask = eligibleForBase(base);
    let primeMask = 0n;
    let compositeMask = 0n;
    for (let offset = 0; offset < hSize; offset++) {
      const b = bit(offset);
      if (!(eligibleMask & b)) continue;
      if (flags[base + offset]) primeMask |= b;
      else compositeMask |= b;
    }
    const k = popcount(primeMask);
    const chosenMask = mode === "real"
      ? primeMask
      : mode === "composite"
        ? (popcount(compositeMask) >= k ? sampleMaskFromEligible(compositeMask, k, random) : 0n)
        : sampleMaskFromEligible(eligibleMask, k, random);
    out.push(descriptor(`${degree}:${high}`, eligibleMask, chosenMask));
  }
  return out;
}

function fieldAudit(q, maxDegree, hDegree, factorDegree) {
  const start = Math.max(hDegree + 2, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    rows.push({
      degree,
      real: summarizeWindows(fieldWindows(q, maxDegree, degree, hDegree, factorDegree, "real")),
      composite: summarizeWindows(fieldWindows(q, maxDegree, degree, hDegree, factorDegree, "composite", 0xc0de + q)),
    });
  }
  const finalWindows = fieldWindows(q, maxDegree, rows.at(-1).degree, hDegree, factorDegree, "real");
  const controls = seeds.map((seed) => controlSummary(finalWindows, seed));
  return {
    q,
    maxDegree,
    hDegree,
    factorDegree,
    rows,
    controls,
    controlRanges: {
      meanCorr: range(controls.map((row) => row.meanCorr)),
      aggregate: range(controls.map((row) => row.aggregate)),
      rmsCorr: range(controls.map((row) => row.rmsCorr)),
    },
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mdIntegerRows(integer) {
  return integer.rows.map((row) => `| ${row.lo}..${row.hi} | ${row.real.pairs} | ${fmt(row.real.meanCorr)} | ${fmt(row.real.aggregate)} | ${fmt(row.real.rmsCorr)} | ${fmt(row.composite.aggregate)} | ${fmt(row.composite.rmsCorr)} |`).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => `| ${row.degree} | ${row.real.pairs} | ${fmt(row.real.meanCorr)} | ${fmt(row.real.aggregate)} | ${fmt(row.real.rmsCorr)} | ${fmt(row.composite.aggregate)} | ${fmt(row.composite.rmsCorr)} |`).join("\n");
}

function classRowsText(summary) {
  return summary.classRows.map((row) => `k${row.k0}-${row.k1}/e${row.e0}-${row.e1}:n${row.n}:mean${fmt(row.meanCorr, 4)}:A${fmt(row.aggregate, 3)}`).join(", ");
}

function strongestText(summary) {
  return summary.strongest.map((item) => `${item.id}:k${item.k0}-${item.k1}:e${item.e0}-${item.e1}:c${fmt(item.corr, 4)}`).join(", ");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function heatColor(value) {
  const x = Math.max(-1, Math.min(1, value));
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
    return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(item.corr)}"><title>${item.id} corr=${fmt(item.corr, 4)}</title></rect>`;
  }).join("\n");
  return `<g font-family="Menlo, Consolas, monospace" font-size="10">
<text x="${x}" y="${y - 10}" fill="#e5e7eb" font-size="13">${title}</text>
${rects}
</g>`;
}

function svg(integer, q2, q3) {
  const width = 1160, height = 820;
  const z = integer.rows.map((row) => row.real.aggregate);
  const zComp = integer.rows.map((row) => row.composite.aggregate);
  const f2 = q2.rows.map((row) => row.real.aggregate);
  const f3 = q3.rows.map((row) => row.real.aggregate);
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
<text x="54" y="36" fill="#f8fafc" font-size="18">adjacent local-eligible occupancy autocorrelation</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">aggregate adjacent-window correlation of centered prime occupancy vectors</text>
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
${heatmap(iFinal.strongest, 90, 430, 440, 120, "Z strongest adjacent pairs")}
${heatmap(q2Final.strongest, 90, 655, 440, 120, "F2[t] strongest adjacent pairs")}
${heatmap(q3Final.strongest, 650, 655, 440, 120, "F3[t] strongest adjacent pairs")}
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="650" y="430" fill="#e5e7eb">final summary</text>
<text x="650" y="460" fill="#a7f3d0">Z aggregate ${fmt(iFinal.aggregate)}, mean corr ${fmt(iFinal.meanCorr)}</text>
<text x="650" y="484" fill="#94a3b8">Z controls ${integer.controlRanges.aggregate.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="508" fill="#7dd3fc">composite aggregate ${fmt(integer.rows.at(-1).composite.aggregate)}</text>
<text x="650" y="532" fill="#fbbf24">F2 aggregate ${fmt(q2Final.aggregate)}, controls ${q2.controlRanges.aggregate.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="556" fill="#f472b6">F3 aggregate ${fmt(q3Final.aggregate)}, controls ${q3.controlRanges.aggregate.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="594" fill="#94a3b8">red = positive corr, blue = negative corr, clamp +/-1</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[eligible-adjacent] building integer sieve to ${N}`);
const isp = sieve(N + W + 1);

console.error(`[eligible-adjacent] integer windows cutoff ${integerCutoff}`);
const integer = integerAudit(isp);
console.error(`[eligible-adjacent] F_2[t] degree ${q2MaxDegree}, factor degree ${q2FactorDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, 5, q2FactorDegree);
console.error(`[eligible-adjacent] F_3[t] degree ${q3MaxDegree}, factor degree ${q3FactorDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, 3, q3FactorDegree);

const tag = `eligible-adjacent-audit-${N}-p${integerCutoff}-f${q2FactorDegree}${q3FactorDegree}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);

const output = {
  candidate: "adjacent local-eligible occupancy autocorrelation",
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

const md = `# adjacent local-eligible occupancy autocorrelation audit

Candidate:
center prime occupancy inside each local eligible window and correlate adjacent
window residual vectors on the common offset coordinate.

Integer windows: length \`${W}\`, reduced offsets \`${integerOffsets.length}\`,
small-prime cutoff \`${integerCutoff}\`, active primes
\`${integer.cutoffPrimes.join(",")}\`.

## Integer fresh blocks

| block | adjacent pairs | mean corr | aggregate | rms corr | composite aggregate | composite rms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(integer)}

Endpoint local-eligible shuffled controls:

- aggregate range: \`${integer.controlRanges.aggregate.map((v) => fmt(v)).join(" .. ")}\`
- mean corr range: \`${integer.controlRanges.meanCorr.map((v) => fmt(v)).join(" .. ")}\`
- rms corr range: \`${integer.controlRanges.rmsCorr.map((v) => fmt(v)).join(" .. ")}\`

## F_2[t] degree path

Factor degree cutoff: \`${q2FactorDegree}\`.

| degree | adjacent pairs | mean corr | aggregate | rms corr | composite aggregate | composite rms |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q2)}

Endpoint local-eligible shuffled controls:
\`${q2.controlRanges.aggregate.map((v) => fmt(v)).join(" .. ")}\`.

## F_3[t] degree path

Factor degree cutoff: \`${q3FactorDegree}\`.

| degree | adjacent pairs | mean corr | aggregate | rms corr | composite aggregate | composite rms |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q3)}

Endpoint local-eligible shuffled controls:
\`${q3.controlRanges.aggregate.map((v) => fmt(v)).join(" .. ")}\`.

## Dominant adjacent classes

Z endpoint:
\`${classRowsText(finalInteger)}\`

F_2[t] endpoint:
\`${classRowsText(finalQ2)}\`

F_3[t] endpoint:
\`${classRowsText(finalQ3)}\`

## Strongest adjacent pairs

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
    pairs: finalInteger.pairs,
    meanCorr: finalInteger.meanCorr,
    aggregate: finalInteger.aggregate,
    rmsCorr: finalInteger.rmsCorr,
    controlAggregateRange: integer.controlRanges.aggregate,
    compositeAggregate: integer.rows.at(-1).composite.aggregate,
  },
  finalQ2: {
    pairs: finalQ2.pairs,
    meanCorr: finalQ2.meanCorr,
    aggregate: finalQ2.aggregate,
    controlAggregateRange: q2.controlRanges.aggregate,
  },
  finalQ3: {
    pairs: finalQ3.pairs,
    meanCorr: finalQ3.meanCorr,
    aggregate: finalQ3.aggregate,
    controlAggregateRange: q3.controlRanges.aggregate,
  },
}, null, 2));
