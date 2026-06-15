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

function makeCyclicPhasors(length, positions) {
  const freqCount = Math.floor(length / 2);
  const cos = [];
  const sin = [];
  const weights = new Float64Array(freqCount);
  for (let f = 1; f <= freqCount; f++) {
    const c = new Float64Array(positions.length);
    const s = new Float64Array(positions.length);
    const angleScale = (2 * Math.PI * f) / length;
    for (let i = 0; i < positions.length; i++) {
      const angle = angleScale * positions[i];
      c[i] = Math.cos(angle);
      s[i] = -Math.sin(angle);
    }
    cos.push(c);
    sin.push(s);
    weights[f - 1] = f * 2 === length ? 1 : 2;
  }
  return { name: `Z/${length}Z`, positions, cos, sin, weights, logK: Math.log(freqCount) };
}

function digitDot(a, b, q, hDegree) {
  let x = a, y = b, sum = 0;
  for (let i = 0; i < hDegree; i++) {
    sum += (x % q) * (y % q);
    x = Math.floor(x / q);
    y = Math.floor(y / q);
  }
  return sum % q;
}

function makeAdditivePhasors(q, hDegree) {
  const size = q ** hDegree;
  const positions = Array.from({ length: size }, (_, i) => i);
  const cos = [];
  const sin = [];
  const weights = new Float64Array(size - 1);
  for (let character = 1; character < size; character++) {
    const c = new Float64Array(size);
    const s = new Float64Array(size);
    for (let offset = 0; offset < size; offset++) {
      const angle = (2 * Math.PI * digitDot(character, offset, q, hDegree)) / q;
      c[offset] = Math.cos(angle);
      s[offset] = -Math.sin(angle);
    }
    cos.push(c);
    sin.push(s);
    weights[character - 1] = 1;
  }
  return { name: `F_${q}^${hDegree}`, positions, cos, sin, weights, logK: Math.log(size - 1) };
}

function spectralEntropy(eligibleMask, chosenMask, phasors, scratch) {
  const M = popcount(eligibleMask);
  const k = popcount(chosenMask);
  if (M <= 1 || k <= 0 || k >= M) return NaN;
  const p = k / M;
  const eligible = indicesFromMask(eligibleMask);
  const powers = scratch || new Float64Array(phasors.cos.length);
  let totalPower = 0;
  for (let f = 0; f < phasors.cos.length; f++) {
    const c = phasors.cos[f];
    const s = phasors.sin[f];
    let re = 0, im = 0;
    for (const idx of eligible) {
      const value = (chosenMask & bit(idx)) ? 1 - p : -p;
      re += value * c[idx];
      im += value * s[idx];
    }
    const power = phasors.weights[f] * (re * re + im * im);
    powers[f] = power;
    totalPower += power;
  }
  if (!(totalPower > 0)) return NaN;
  let entropy = 0;
  for (let f = 0; f < phasors.cos.length; f++) {
    const q = powers[f] / totalPower;
    if (q > 0) entropy -= q * Math.log(q);
  }
  return entropy / phasors.logK;
}

function scoreWindows(windows, phasors, mode, seed = 0) {
  const random = rng(seed);
  const scratch = new Float64Array(phasors.cos.length);
  return windows.map((win) => {
    if (!win) return null;
    const k = popcount(win.primeMask);
    let chosenMask = 0n;
    if (mode === "real") {
      chosenMask = win.primeMask;
    } else if (mode === "control") {
      chosenMask = sampleMaskFromEligible(win.eligibleMask, k, random);
    } else if (mode === "composite") {
      if (popcount(win.compositeMask) < k) return null;
      chosenMask = sampleMaskFromEligible(win.compositeMask, k, random);
    }
    const entropy = spectralEntropy(win.eligibleMask, chosenMask, phasors, scratch);
    if (!Number.isFinite(entropy)) return null;
    return {
      id: win.id,
      k,
      eligibleSize: popcount(win.eligibleMask),
      entropy,
    };
  });
}

function summarizeScored(real, controls, composite) {
  const usable = [];
  const controlAggregates = new Array(controls.length).fill(0);
  let compositeSum = 0, compositeN = 0;
  for (let i = 0; i < real.length; i++) {
    const item = real[i];
    if (!item) continue;
    const controlValues = controls.map((control) => control[i]?.entropy).filter(Number.isFinite);
    if (controlValues.length !== controls.length) continue;
    const localMean = mean(controlValues);
    const residual = item.entropy - localMean;
    usable.push({ ...item, residual, localMean });
    for (let j = 0; j < controls.length; j++) controlAggregates[j] += controls[j][i].entropy - localMean;
    const comp = composite[i];
    if (comp && Number.isFinite(comp.entropy)) {
      compositeSum += comp.entropy - localMean;
      compositeN++;
    }
  }

  const n = usable.length;
  const sumEntropy = usable.reduce((sum, item) => sum + item.entropy, 0);
  const sumLocal = usable.reduce((sum, item) => sum + item.localMean, 0);
  const sumResidual = usable.reduce((sum, item) => sum + item.residual, 0);
  const byAbs = usable.slice().sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual));
  const byClass = new Map();
  for (const item of usable) {
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
    meanEntropy: sumEntropy / (n || 1),
    meanLocalEntropy: sumLocal / (n || 1),
    meanResidual: sumResidual / (n || 1),
    aggregateResidual: sumResidual / scale,
    rmsResidual: Math.sqrt(mean(usable.map((item) => item.residual * item.residual))),
    sdResidual: stdev(usable.map((item) => item.residual)),
    controlAggregateRange: range(controlAggregates.map((sum) => sum / scale)),
    controlAggregates: controlAggregates.map((sum) => sum / scale),
    compositeWindows: compositeN,
    compositeMeanResidual: compositeSum / (compositeN || 1),
    compositeAggregateResidual: compositeSum / Math.sqrt(compositeN || 1),
    strongest: byAbs.slice(0, 8),
    classRows: classRows.slice(0, 12),
  };
}

function summarizeWindows(windows, phasors, compositeSeed) {
  const real = scoreWindows(windows, phasors, "real");
  const controls = seeds.map((seed) => scoreWindows(windows, phasors, "control", seed));
  const composite = scoreWindows(windows, phasors, "composite", compositeSeed);
  return summarizeScored(real, controls, composite);
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

function integerAudit(isp, phasors) {
  const cutoffPrimes = primesUpToSmall(integerCutoff).filter((p) => W % p !== 0);
  const eligibleForBase = integerEligibleFactory(cutoffPrimes);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    const windows = integerWindows(isp, lo, hi, eligibleForBase);
    rows.push({
      lo,
      hi,
      summary: summarizeWindows(windows, phasors, 0xc011),
    });
  }
  return {
    W,
    integerCutoff,
    cutoffPrimes,
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

function fieldAudit(q, maxDegree, hDegree, factorDegree, phasors) {
  const start = Math.max(hDegree + 2, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    rows.push({
      degree,
      summary: summarizeWindows(fieldWindows(q, maxDegree, degree, hDegree, factorDegree), phasors, 0xc0de + q),
    });
  }
  return {
    q,
    maxDegree,
    hDegree,
    factorDegree,
    rows,
  };
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mdIntegerRows(integer) {
  return integer.rows.map((row) => {
    const s = row.summary;
    return `| ${row.lo}..${row.hi} | ${s.windows} | ${fmt(s.meanEntropy)} | ${fmt(s.meanLocalEntropy)} | ${fmt(s.meanResidual)} | ${fmt(s.aggregateResidual)} | ${fmt(s.compositeAggregateResidual)} |`;
  }).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => {
    const s = row.summary;
    return `| ${row.degree} | ${s.windows} | ${fmt(s.meanEntropy)} | ${fmt(s.meanLocalEntropy)} | ${fmt(s.meanResidual)} | ${fmt(s.aggregateResidual)} | ${fmt(s.compositeAggregateResidual)} |`;
  }).join("\n");
}

function classRowsText(summary) {
  return summary.classRows.map((row) => `k${row.k}/e${row.eligibleSize}:n${row.n}:mean${fmt(row.meanResidual, 5)}:A${fmt(row.aggregateResidual, 3)}`).join(", ");
}

function strongestText(summary) {
  return summary.strongest.map((item) => `${item.id}:k${item.k}:e${item.eligibleSize}:r${fmt(item.residual, 5)}:H${fmt(item.entropy, 4)}`).join(", ");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function heatColor(value) {
  const x = Math.max(-0.35, Math.min(0.35, value)) / 0.35;
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
<text x="54" y="36" fill="#f8fafc" font-size="18">local eligible Fourier-power entropy</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">entropy residual = observed spectrum entropy - exact eligible/count shuffled mean</text>
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
${heatmap(iFinal.strongest, 90, 430, 440, 120, "Z strongest entropy residuals")}
${heatmap(q2Final.strongest, 90, 655, 440, 120, "F2[t] strongest entropy residuals")}
${heatmap(q3Final.strongest, 650, 655, 440, 120, "F3[t] strongest entropy residuals")}
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="650" y="430" fill="#e5e7eb">final summary</text>
<text x="650" y="460" fill="#a7f3d0">Z aggregate ${fmt(iFinal.aggregateResidual)}, mean residual ${fmt(iFinal.meanResidual)}</text>
<text x="650" y="484" fill="#94a3b8">Z controls ${iFinal.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="508" fill="#7dd3fc">composite aggregate ${fmt(iFinal.compositeAggregateResidual)}</text>
<text x="650" y="532" fill="#fbbf24">F2 aggregate ${fmt(q2Final.aggregateResidual)}, controls ${q2Final.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="556" fill="#f472b6">F3 aggregate ${fmt(q3Final.aggregateResidual)}, controls ${q3Final.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="594" fill="#94a3b8">red = higher entropy than controls, blue = lower entropy</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[eligible-spectrum] building integer sieve to ${N}`);
const isp = sieve(N + W + 1);
const integerPhasors = makeCyclicPhasors(W, integerOffsets);
const q2Phasors = makeAdditivePhasors(2, 5);
const q3Phasors = makeAdditivePhasors(3, 3);

console.error(`[eligible-spectrum] integer windows cutoff ${integerCutoff}`);
const integer = integerAudit(isp, integerPhasors);
console.error(`[eligible-spectrum] F_2[t] degree ${q2MaxDegree}, factor degree ${q2FactorDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, 5, q2FactorDegree, q2Phasors);
console.error(`[eligible-spectrum] F_3[t] degree ${q3MaxDegree}, factor degree ${q3FactorDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, 3, q3FactorDegree, q3Phasors);

const tag = `eligible-spectrum-audit-${N}-p${integerCutoff}-f${q2FactorDegree}${q3FactorDegree}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);

const output = {
  candidate: "local eligible Fourier-power entropy",
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

const md = `# local eligible Fourier-power entropy audit

Candidate:
center prime occupancy inside each local eligible window, compute the
Fourier-power distribution, and compare its normalized entropy against exact
eligible/count shuffled controls.

Integer windows: length \`${W}\`, reduced offsets \`${integerOffsets.length}\`,
small-prime cutoff \`${integerCutoff}\`, active primes
\`${integer.cutoffPrimes.join(",")}\`.

Residual aggregate: \`sum(observed entropy - per-window mean of five
count-matched shuffled controls) / sqrt(windows)\`.

## Integer fresh blocks

| block | windows | mean entropy | local mean | mean residual | aggregate residual | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(integer)}

Endpoint local-eligible shuffled controls:
\`${finalInteger.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}\`.

## F_2[t] degree path

Factor degree cutoff: \`${q2FactorDegree}\`; additive window: \`F_2^5\`.

| degree | windows | mean entropy | local mean | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q2)}

Endpoint local-eligible shuffled controls:
\`${finalQ2.controlAggregateRange.map((v) => fmt(v)).join(" .. ")}\`.

## F_3[t] degree path

Factor degree cutoff: \`${q3FactorDegree}\`; additive window: \`F_3^3\`.

| degree | windows | mean entropy | local mean | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q3)}

Endpoint local-eligible shuffled controls:
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
    meanEntropy: finalInteger.meanEntropy,
    meanLocalEntropy: finalInteger.meanLocalEntropy,
    meanResidual: finalInteger.meanResidual,
    aggregateResidual: finalInteger.aggregateResidual,
    controlAggregateRange: finalInteger.controlAggregateRange,
    compositeAggregateResidual: finalInteger.compositeAggregateResidual,
  },
  finalQ2: {
    windows: finalQ2.windows,
    meanEntropy: finalQ2.meanEntropy,
    meanLocalEntropy: finalQ2.meanLocalEntropy,
    meanResidual: finalQ2.meanResidual,
    aggregateResidual: finalQ2.aggregateResidual,
    controlAggregateRange: finalQ2.controlAggregateRange,
  },
  finalQ3: {
    windows: finalQ3.windows,
    meanEntropy: finalQ3.meanEntropy,
    meanLocalEntropy: finalQ3.meanLocalEntropy,
    meanResidual: finalQ3.meanResidual,
    aggregateResidual: finalQ3.aggregateResidual,
    controlAggregateRange: finalQ3.controlAggregateRange,
  },
}, null, 2));
