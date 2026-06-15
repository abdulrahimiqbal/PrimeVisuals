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

function makeIntegerMetric() {
  const n = integerOffsets.length;
  const distances = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const diff = Math.abs(integerOffsets[i] - integerOffsets[j]);
      const d = Math.min(diff, W - diff) / W;
      distances[i][j] = d;
      distances[j][i] = d;
    }
  }
  return { name: "Z/210Z circular", distances };
}

function makeFieldMetric(q, hDegree) {
  const size = q ** hDegree;
  const denom = q ** Math.max(0, hDegree - 1);
  const distances = Array.from({ length: size }, () => new Float64Array(size));
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      const diff = q === 2 ? (i ^ j) : polySubEncoded(i, j, q);
      const degree = polyDegreeInt(diff, q);
      const d = degree < 0 ? 0 : (q ** degree) / denom;
      distances[i][j] = d;
      distances[j][i] = d;
    }
  }
  return { name: `F_${q}^${hDegree} degree ultrametric`, distances };
}

function distanceVector(mask, metric) {
  const indices = indicesFromMask(mask);
  if (indices.length < 2) return null;
  const out = [];
  for (let i = 0; i < indices.length; i++) {
    const row = metric.distances[indices[i]];
    for (let j = i + 1; j < indices.length; j++) out.push(row[indices[j]]);
  }
  out.sort((a, b) => a - b);
  return out;
}

function centerVector(vectors, skip = -1) {
  const usable = vectors.filter((vector, index) => index !== skip && vector);
  if (!usable.length) return null;
  const length = usable[0].length;
  const center = new Float64Array(length);
  for (const vector of usable) {
    if (vector.length !== length) return null;
    for (let i = 0; i < length; i++) center[i] += vector[i];
  }
  for (let i = 0; i < length; i++) center[i] /= usable.length;
  return center;
}

function transportDistance(vector, center) {
  if (!vector || !center || vector.length !== center.length || vector.length === 0) return NaN;
  let sum = 0;
  for (let i = 0; i < vector.length; i++) sum += Math.abs(vector[i] - center[i]);
  return sum / vector.length;
}

function scoreWindow(win, metric, randoms, compositeRandom) {
  const k = popcount(win.primeMask);
  const eligibleSize = popcount(win.eligibleMask);
  if (k < 2 || eligibleSize <= k) return null;
  const realVector = distanceVector(win.primeMask, metric);
  if (!realVector) return null;
  const controlVectors = randoms.map((random) => distanceVector(sampleMaskFromEligible(win.eligibleMask, k, random), metric));
  if (controlVectors.some((vector) => !vector)) return null;
  const realExcesses = [];
  const localMeans = [];
  const realDistances = [];
  const controlExcesses = controlVectors.map((vector, index) => {
    const leaveCenter = centerVector(controlVectors, index);
    const leaveDistances = controlVectors
      .filter((_, j) => j !== index)
      .map((other) => transportDistance(other, leaveCenter));
    const localMean = mean(leaveDistances);
    const realDistance = transportDistance(realVector, leaveCenter);
    realDistances.push(realDistance);
    localMeans.push(localMean);
    realExcesses.push(realDistance - localMean);
    return transportDistance(vector, leaveCenter) - localMean;
  });
  const fakeExcessMean = mean(controlExcesses);
  const controlResiduals = controlExcesses.map((value, index) => {
    const others = controlExcesses.filter((_, j) => j !== index);
    return value - mean(others);
  });
  const realExcess = mean(realExcesses);
  const realDistance = mean(realDistances);
  const localMean = mean(localMeans);
  let compositeDistance = NaN;
  let compositeResidual = NaN;
  if (popcount(win.compositeMask) >= k) {
    const compositeVector = distanceVector(sampleMaskFromEligible(win.compositeMask, k, compositeRandom), metric);
    const compositeExcesses = controlVectors.map((_, index) => {
      const leaveCenter = centerVector(controlVectors, index);
      const leaveDistances = controlVectors
        .filter((__, j) => j !== index)
        .map((other) => transportDistance(other, leaveCenter));
      return transportDistance(compositeVector, leaveCenter) - mean(leaveDistances);
    });
    compositeDistance = mean(controlVectors.map((_, index) => transportDistance(compositeVector, centerVector(controlVectors, index))));
    compositeResidual = mean(compositeExcesses) - fakeExcessMean;
  }
  return {
    id: win.id,
    k,
    eligibleSize,
    realDistance,
    localMean,
    realExcess,
    fakeExcessMean,
    residual: realExcess - fakeExcessMean,
    controlResiduals,
    compositeDistance,
    compositeResidual,
  };
}

function summarizeWindows(windows, metric, compositeSeed) {
  const randoms = seeds.map((seed) => rng(seed));
  const compositeRandom = rng(compositeSeed);
  const items = windows.map((win) => scoreWindow(win, metric, randoms, compositeRandom)).filter(Boolean);
  const n = items.length;
  const sumResidual = items.reduce((sum, item) => sum + item.residual, 0);
  const sumDistance = items.reduce((sum, item) => sum + item.realDistance, 0);
  const sumLocal = items.reduce((sum, item) => sum + item.localMean, 0);
  const sumRealExcess = items.reduce((sum, item) => sum + item.realExcess, 0);
  const sumFakeExcess = items.reduce((sum, item) => sum + item.fakeExcessMean, 0);
  const controlSums = new Array(seeds.length).fill(0);
  for (const item of items) {
    item.controlResiduals.forEach((value, index) => { controlSums[index] += value; });
  }
  const compositeItems = items.filter((item) => Number.isFinite(item.compositeResidual));
  const compositeSum = compositeItems.reduce((sum, item) => sum + item.compositeResidual, 0);
  const byAbs = items.slice().sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual));
  const byClass = new Map();
  for (const item of items) {
    const key = `${item.k}:${item.eligibleSize}`;
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
  const scale = Math.sqrt(n || 1);
  return {
    windows: n,
    meanDistance: sumDistance / (n || 1),
    meanLocalDistance: sumLocal / (n || 1),
    meanRealExcess: sumRealExcess / (n || 1),
    meanFakeExcess: sumFakeExcess / (n || 1),
    meanResidual: sumResidual / (n || 1),
    aggregateResidual: sumResidual / scale,
    rmsResidual: Math.sqrt(mean(items.map((item) => item.residual * item.residual))),
    sdResidual: stdev(items.map((item) => item.residual)),
    controlAggregates: controlSums.map((sum) => sum / scale),
    controlAggregateRange: range(controlSums.map((sum) => sum / scale)),
    compositeWindows: compositeItems.length,
    compositeMeanResidual: compositeSum / (compositeItems.length || 1),
    compositeAggregateResidual: compositeSum / Math.sqrt(compositeItems.length || 1),
    strongest: byAbs.slice(0, 8),
    classRows: classRows.slice(0, 12),
  };
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

function integerWindows(isp, lo, hi, eligibleForBase) {
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
    out.push({ id: `${base}`, eligibleMask, primeMask, compositeMask });
  }
  return out;
}

function integerAudit(isp, metric) {
  const cutoffPrimes = primesUpToSmall(integerCutoff).filter((p) => W % p !== 0);
  const eligibleForBase = integerEligibleFactory(cutoffPrimes);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    rows.push({
      lo,
      hi,
      summary: summarizeWindows(integerWindows(isp, lo, hi, eligibleForBase), metric, 0xc011),
    });
  }
  return {
    W,
    integerCutoff,
    cutoffPrimes,
    metric: metric.name,
    rows,
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

function fieldWindows(q, maxDegree, degree, hDegree, factorDegree) {
  const universe = buildPolynomialUniverse(q, Math.max(maxDegree, factorDegree));
  const flags = universe.irreducibleFlagsByDegree[degree];
  const hSize = q ** hDegree;
  const windows = q ** (degree - hDegree);
  const factors = fieldFactorSpecs(q, maxDegree, factorDegree);
  const lead = q ** degree;
  const eligibleForBase = fieldEligibleFactory(q, lead, hSize, factors);
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
    out.push({ id: `${degree}:${high}`, eligibleMask, primeMask, compositeMask });
  }
  return out;
}

function fieldAudit(q, maxDegree, hDegree, factorDegree, metric) {
  const start = Math.max(hDegree + 2, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    rows.push({
      degree,
      summary: summarizeWindows(fieldWindows(q, maxDegree, degree, hDegree, factorDegree), metric, 0xc0de + q),
    });
  }
  return {
    q,
    maxDegree,
    hDegree,
    factorDegree,
    metric: metric.name,
    rows,
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mdIntegerRows(integer) {
  return integer.rows.map((row) => {
    const s = row.summary;
    return `| ${row.lo}..${row.hi} | ${s.windows} | ${fmt(s.meanRealExcess)} | ${fmt(s.meanFakeExcess)} | ${fmt(s.meanResidual)} | ${fmt(s.aggregateResidual)} | ${fmt(s.compositeAggregateResidual)} |`;
  }).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => {
    const s = row.summary;
    return `| ${row.degree} | ${s.windows} | ${fmt(s.meanRealExcess)} | ${fmt(s.meanFakeExcess)} | ${fmt(s.meanResidual)} | ${fmt(s.aggregateResidual)} | ${fmt(s.compositeAggregateResidual)} |`;
  }).join("\n");
}

function classRowsText(summary) {
  return summary.classRows.map((row) => `k${row.k}/e${row.eligibleSize}:n${row.n}:mean${fmt(row.meanResidual, 5)}:A${fmt(row.aggregateResidual, 3)}`).join(", ");
}

function strongestText(summary) {
  return summary.strongest.map((item) => `${item.id}:k${item.k}:e${item.eligibleSize}:r${fmt(item.residual, 5)}:D${fmt(item.realDistance, 4)}`).join(", ");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function heatColor(value) {
  const x = Math.max(-0.08, Math.min(0.08, value)) / 0.08;
  if (x >= 0) return `rgb(${Math.round(70 + 160 * x)},${Math.round(120 - 35 * x)},${Math.round(165 - 80 * x)})`;
  const t = -x;
  return `rgb(${Math.round(70 - 35 * t)},${Math.round(120 + 110 * t)},${Math.round(170 + 45 * t)})`;
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
    return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(item.residual)}"><title>${item.id} residual=${fmt(item.residual, 5)}</title></rect>`;
  }).join("\n");
  return `<g font-family="Menlo, Consolas, monospace" font-size="10">
<text x="${x}" y="${y - 10}" fill="#e5e7eb" font-size="13">${title}</text>
${rects}
</g>`;
}

function svg(integer, q2, q3) {
  const width = 1160, height = 820;
  const z = integer.rows.map((row) => row.summary.aggregateResidual);
  const zComp = integer.rows.map((row) => row.summary.compositeAggregateResidual);
  const f2 = q2.rows.map((row) => row.summary.aggregateResidual);
  const f3 = q3.rows.map((row) => row.summary.aggregateResidual);
  const all = [...z, ...zComp, ...f2, ...f3, 0];
  const minY = Math.min(...all) * 1.08;
  const maxY = Math.max(...all) * 1.08;
  const chart = { x: 82, y: 72, w: 1000, h: 260 };
  const zeroY = chart.y + chart.h - ((0 - minY) / (maxY - minY || 1)) * chart.h;
  const iFinal = integer.rows.at(-1).summary;
  const q2Final = q2.rows.at(-1).summary;
  const q3Final = q3.rows.at(-1).summary;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">local eligible distance-transport residual</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">calibrated W1 excess of sorted pair-distance vector beyond local fake excess</text>
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
${heatmap(iFinal.strongest, 90, 430, 440, 120, "Z strongest distance residuals")}
${heatmap(q2Final.strongest, 90, 655, 440, 120, "F2[t] strongest distance residuals")}
${heatmap(q3Final.strongest, 650, 655, 440, 120, "F3[t] strongest distance residuals")}
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="650" y="430" fill="#e5e7eb">final summary</text>
<text x="650" y="460" fill="#a7f3d0">Z aggregate ${fmt(iFinal.aggregateResidual)}, mean residual ${fmt(iFinal.meanResidual)}</text>
<text x="650" y="484" fill="#94a3b8">Z controls ${iFinal.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="508" fill="#7dd3fc">composite aggregate ${fmt(iFinal.compositeAggregateResidual)}</text>
<text x="650" y="532" fill="#fbbf24">F2 aggregate ${fmt(q2Final.aggregateResidual)}, controls ${q2Final.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="556" fill="#f472b6">F3 aggregate ${fmt(q3Final.aggregateResidual)}, controls ${q3Final.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="594" fill="#94a3b8">red = farther from local shuffled center, blue = closer</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[eligible-distance] building integer sieve to ${N}`);
const isp = sieve(N + W + 1);
const integerMetric = makeIntegerMetric();
const q2Metric = makeFieldMetric(2, 5);
const q3Metric = makeFieldMetric(3, 3);

console.error(`[eligible-distance] integer windows cutoff ${integerCutoff}`);
const integer = integerAudit(isp, integerMetric);
console.error(`[eligible-distance] F_2[t] degree ${q2MaxDegree}, factor degree ${q2FactorDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, 5, q2FactorDegree, q2Metric);
console.error(`[eligible-distance] F_3[t] degree ${q3MaxDegree}, factor degree ${q3FactorDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, 3, q3FactorDegree, q3Metric);

const tag = `eligible-distance-audit-${N}-p${integerCutoff}-f${q2FactorDegree}${q3FactorDegree}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);

const output = {
  candidate: "local eligible distance-transport residual",
  N,
  integer,
  q2,
  q3,
};

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer, q2, q3));

const finalInteger = integer.rows.at(-1).summary;
const finalQ2 = q2.rows.at(-1).summary;
const finalQ3 = q3.rows.at(-1).summary;

const md = `# local eligible distance-transport residual audit

Candidate:
within each local eligible window, compare the sorted pair-distance
distribution of prime offsets to leave-one per-rank centers of five exact
eligible/count shuffled controls by a Wasserstein-1-style mean absolute
transport distance.

Integer windows: length \`${W}\`, reduced offsets \`${integerOffsets.length}\`,
small-prime cutoff \`${integerCutoff}\`, active primes
\`${integer.cutoffPrimes.join(",")}\`.

Integer metric: \`${integer.metric}\`.
Field metrics: \`${q2.metric}\`, \`${q3.metric}\`.

Residual aggregate: \`sum((observed distance excess) - (mean fake distance
excess)) / sqrt(windows)\`.

## Integer fresh blocks

| block | windows | real excess | fake excess | mean residual | aggregate residual | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(integer)}

Endpoint leave-one local-shuffle fake controls:
\`${finalInteger.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}\`.

## F_2[t] degree path

Factor degree cutoff: \`${q2FactorDegree}\`; additive window: \`F_2^5\`.

| degree | windows | real excess | fake excess | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q2)}

Endpoint leave-one local-shuffle fake controls:
\`${finalQ2.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}\`.

## F_3[t] degree path

Factor degree cutoff: \`${q3FactorDegree}\`; additive window: \`F_3^3\`.

| degree | windows | real excess | fake excess | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q3)}

Endpoint leave-one local-shuffle fake controls:
\`${finalQ3.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}\`.

## Dominant classes

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
    meanDistance: finalInteger.meanDistance,
    meanLocalDistance: finalInteger.meanLocalDistance,
    meanRealExcess: finalInteger.meanRealExcess,
    meanFakeExcess: finalInteger.meanFakeExcess,
    meanResidual: finalInteger.meanResidual,
    aggregateResidual: finalInteger.aggregateResidual,
    controlAggregateRange: finalInteger.controlAggregateRange,
    compositeAggregateResidual: finalInteger.compositeAggregateResidual,
  },
  finalQ2: {
    windows: finalQ2.windows,
    meanDistance: finalQ2.meanDistance,
    meanLocalDistance: finalQ2.meanLocalDistance,
    meanRealExcess: finalQ2.meanRealExcess,
    meanFakeExcess: finalQ2.meanFakeExcess,
    meanResidual: finalQ2.meanResidual,
    aggregateResidual: finalQ2.aggregateResidual,
    controlAggregateRange: finalQ2.controlAggregateRange,
  },
  finalQ3: {
    windows: finalQ3.windows,
    meanDistance: finalQ3.meanDistance,
    meanLocalDistance: finalQ3.meanLocalDistance,
    meanRealExcess: finalQ3.meanRealExcess,
    meanFakeExcess: finalQ3.meanFakeExcess,
    meanResidual: finalQ3.meanResidual,
    aggregateResidual: finalQ3.aggregateResidual,
    controlAggregateRange: finalQ3.controlAggregateRange,
  },
}, null, 2));
