#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildPolynomialUniverse } from "../src/core/ffield.js";
import { sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 24);
const q3MaxDegree = Number(process.argv[5] || 15);
const pairBinsArg = process.argv[6] ? Number(process.argv[6]) : 24;

const W = 210;
const pairBins = Math.max(4, Math.floor(pairBinsArg));
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

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function stdev(values) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - m) ** 2)));
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

function pairMean(values, distanceFn) {
  if (values.length < 2) return 0;
  let sum = 0, count = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      sum += distanceFn(values[i], values[j]);
      count++;
    }
  }
  return sum / count;
}

function tripleShape(values, distanceFn) {
  if (values.length < 3) return 0;
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
  return count ? sum / count : 0;
}

function pairBin(value) {
  return Math.max(0, Math.min(pairBins - 1, Math.floor(value * pairBins)));
}

function keyFor(k, bin) {
  return `${k}:${bin}`;
}

function buildNull(offsets, distanceFn, maxK, seed) {
  const random = rng(seed);
  const pools = new Map();
  const kPools = new Map();
  const upper = Math.min(maxK, offsets.length);
  for (let k = 3; k <= upper; k++) {
    const reps = Math.max(900, Math.min(7000, Math.floor(80000 / k)));
    for (let i = 0; i < reps; i++) {
      const subset = sampleSubset(offsets, k, random);
      const d = pairMean(subset, distanceFn);
      const t = tripleShape(subset, distanceFn);
      const bin = pairBin(d);
      const key = keyFor(k, bin);
      if (!pools.has(key)) pools.set(key, []);
      pools.get(key).push(t);
      if (!kPools.has(k)) kPools.set(k, []);
      kPools.get(k).push(t);
    }
  }
  const stats = new Map();
  for (const [key, values] of pools.entries()) {
    stats.set(key, {
      mean: mean(values),
      sd: Math.max(stdev(values), 1e-9),
      n: values.length,
      values,
    });
  }
  const kStats = new Map();
  for (const [k, values] of kPools.entries()) {
    kStats.set(k, {
      mean: mean(values),
      sd: Math.max(stdev(values), 1e-9),
      n: values.length,
      values,
    });
  }
  return { stats, kStats };
}

function statFor(nulls, k, bin) {
  const exact = nulls.stats.get(keyFor(k, bin));
  if (exact && exact.n >= 20) return exact;
  let best = null;
  for (let radius = 1; radius <= pairBins; radius++) {
    for (const b of [bin - radius, bin + radius]) {
      const candidate = nulls.stats.get(keyFor(k, b));
      if (candidate && candidate.n >= 20) best = candidate;
    }
    if (best) return best;
  }
  return nulls.kStats.get(k) || { mean: 0, sd: 1, n: 0, values: [0] };
}

function scoreItem(item, nulls) {
  const stat = statFor(nulls, item.k, item.bin);
  return {
    ...item,
    z: (item.shape - stat.mean) / stat.sd,
    nullN: stat.n,
  };
}

function matchedControlItems(items, nulls, seed) {
  const random = rng(seed);
  return items.map((item) => {
    const stat = statFor(nulls, item.k, item.bin);
    const sample = stat.values[Math.floor(random() * stat.values.length)] ?? stat.mean;
    return {
      ...item,
      shape: sample,
      z: (sample - stat.mean) / stat.sd,
      nullN: stat.n,
    };
  });
}

function summarize(items) {
  const usable = items.filter((item) => Number.isFinite(item.z));
  const n = usable.length;
  const sumZ = usable.reduce((sum, item) => sum + item.z, 0);
  const byAbs = usable.slice().sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  const byClass = new Map();
  for (const item of usable) {
    const key = keyFor(item.k, item.bin);
    const row = byClass.get(key) || { k: item.k, bin: item.bin, n: 0, sumZ: 0 };
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
    meanZ: sumZ / (n || 1),
    aggregateZ: sumZ / Math.sqrt(n || 1),
    rmsZ: Math.sqrt(mean(usable.map((item) => item.z * item.z))),
    strongest: byAbs.slice(0, 8),
    classRows: classRows.slice(0, 12),
  };
}

function integerRawItems(isp, lo, hi, mode, seed = 0) {
  const random = rng(seed);
  const out = [];
  const start = Math.ceil(lo / W) * W;
  const end = Math.floor((hi - W) / W) * W;
  for (let base = start; base <= end; base += W) {
    const primeOffsets = [];
    const compositeOffsets = [];
    for (const offset of integerOffsets) {
      const n = base + offset;
      if (isp[n]) primeOffsets.push(offset);
      else compositeOffsets.push(offset);
    }
    const k = primeOffsets.length;
    if (k < 3) continue;
    const chosen = mode === "real"
      ? primeOffsets
      : mode === "composite"
        ? (compositeOffsets.length >= k ? sampleSubset(compositeOffsets, k, random) : [])
        : sampleSubset(integerOffsets, k, random);
    if (chosen.length !== k) continue;
    const d = pairMean(chosen, integerDistance);
    out.push({
      id: `${base}`,
      k,
      pairMean: d,
      bin: pairBin(d),
      shape: tripleShape(chosen, integerDistance),
    });
  }
  return out;
}

function integerAudit(isp) {
  const nulls = buildNull(integerOffsets, integerDistance, 30, 0x7253);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    const realRaw = integerRawItems(isp, lo, hi, "real");
    const compRaw = integerRawItems(isp, lo, hi, "composite", 0xc011);
    rows.push({
      lo,
      hi,
      real: summarize(realRaw.map((item) => scoreItem(item, nulls))),
      composite: summarize(compRaw.map((item) => scoreItem(item, nulls))),
    });
  }
  const finalRaw = integerRawItems(isp, rows.at(-1).lo, rows.at(-1).hi, "real");
  const controls = seeds.map((seed) => summarize(matchedControlItems(finalRaw, nulls, seed)));
  return {
    W,
    pairBins,
    offsets: integerOffsets.length,
    rows,
    controls,
    controlRanges: {
      meanZ: range(controls.map((row) => row.meanZ)),
      aggregateZ: range(controls.map((row) => row.aggregateZ)),
      rmsZ: range(controls.map((row) => row.rmsZ)),
    },
  };
}

function fieldRawItems(q, maxDegree, degree, hDegree, mode, seed = 0) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const flags = universe.irreducibleFlagsByDegree[degree];
  const hSize = q ** hDegree;
  const windows = q ** (degree - hDegree);
  const offsets = Array.from({ length: hSize }, (_, i) => i);
  const random = rng(seed);
  const distanceFn = polyOffsetDistance(q, hDegree);
  const out = [];
  for (let high = 0; high < windows; high++) {
    const base = high * hSize;
    const primeOffsets = [];
    const compositeOffsets = [];
    for (let h = 0; h < hSize; h++) {
      if (flags[base + h]) primeOffsets.push(h);
      else compositeOffsets.push(h);
    }
    const k = primeOffsets.length;
    if (k < 3) continue;
    const chosen = mode === "real"
      ? primeOffsets
      : mode === "composite"
        ? (compositeOffsets.length >= k ? sampleSubset(compositeOffsets, k, random) : [])
        : sampleSubset(offsets, k, random);
    if (chosen.length !== k) continue;
    const d = pairMean(chosen, distanceFn);
    out.push({
      id: `${degree}:${high}`,
      k,
      pairMean: d,
      bin: pairBin(d),
      shape: tripleShape(chosen, distanceFn),
    });
  }
  return out;
}

function fieldAudit(q, maxDegree, hDegree) {
  const offsets = Array.from({ length: q ** hDegree }, (_, i) => i);
  const distanceFn = polyOffsetDistance(q, hDegree);
  const nulls = buildNull(offsets, distanceFn, Math.min(18, offsets.length), 0x71200 + q);
  const start = Math.max(hDegree + 2, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    const realRaw = fieldRawItems(q, maxDegree, degree, hDegree, "real");
    const compRaw = fieldRawItems(q, maxDegree, degree, hDegree, "composite", 0xc0de + q);
    rows.push({
      degree,
      real: summarize(realRaw.map((item) => scoreItem(item, nulls))),
      composite: summarize(compRaw.map((item) => scoreItem(item, nulls))),
    });
  }
  const finalRaw = fieldRawItems(q, maxDegree, rows.at(-1).degree, hDegree, "real");
  const controls = seeds.map((seed) => summarize(matchedControlItems(finalRaw, nulls, seed)));
  return {
    q,
    maxDegree,
    hDegree,
    offsets: offsets.length,
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
  return integer.rows.map((row) => `| ${row.lo}..${row.hi} | ${row.real.windows} | ${fmt(row.real.meanZ)} | ${fmt(row.real.aggregateZ)} | ${fmt(row.real.rmsZ)} | ${fmt(row.composite.aggregateZ)} | ${fmt(row.composite.rmsZ)} |`).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => `| ${row.degree} | ${row.real.windows} | ${fmt(row.real.meanZ)} | ${fmt(row.real.aggregateZ)} | ${fmt(row.real.rmsZ)} | ${fmt(row.composite.aggregateZ)} | ${fmt(row.composite.rmsZ)} |`).join("\n");
}

function classRowsText(summary) {
  return summary.classRows.map((row) => `k${row.k}/b${row.bin}:n${row.n}:mean${fmt(row.meanZ, 3)}:Z${fmt(row.aggregateZ, 3)}`).join(", ");
}

function strongestText(summary) {
  return summary.strongest.map((item) => `${item.id}:k${item.k}:b${item.bin}:z${fmt(item.z, 3)}`).join(", ");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function heatColor(value) {
  const x = Math.max(-4, Math.min(4, value)) / 4;
  if (x >= 0) return `rgb(${Math.round(55 + 175 * x)},${Math.round(115 - 40 * x)},${Math.round(165 - 75 * x)})`;
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
    return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(item.z)}"><title>${item.id} k=${item.k} bin=${item.bin} z=${fmt(item.z, 3)}</title></rect>`;
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
<text x="54" y="36" fill="#f8fafc" font-size="18">count+pair-conditioned triple-shape residual</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">aggregate Z of triple distance-variance after matching both count and pair-distance bin</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
<path d="${linePath(z, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${linePath(zComp, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#7dd3fc" stroke-width="3"/>
<path d="${linePath(f2, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fbbf24" stroke-width="3"/>
<path d="${linePath(f3, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f472b6" stroke-width="3"/>
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">Z scales / F_q top degrees</text>
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
<text x="650" y="460" fill="#a7f3d0">Z aggregate ${fmt(iFinal.aggregateZ)}, mean ${fmt(iFinal.meanZ)}, rms ${fmt(iFinal.rmsZ)}</text>
<text x="650" y="484" fill="#94a3b8">Z matched controls ${integer.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="508" fill="#7dd3fc">composite aggregate ${fmt(integer.rows.at(-1).composite.aggregateZ)}</text>
<text x="650" y="532" fill="#fbbf24">F2 aggregate ${fmt(q2Final.aggregateZ)}, controls ${q2.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="556" fill="#f472b6">F3 aggregate ${fmt(q3Final.aggregateZ)}, controls ${q3.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="594" fill="#94a3b8">blue = low triple variance, red = high triple variance, clamp +/-4</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[third-shape] building integer sieve to ${N}`);
const isp = sieve(N + W + 1);

console.error("[third-shape] integer windows");
const integer = integerAudit(isp);
console.error(`[third-shape] F_2[t] degree ${q2MaxDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, 5);
console.error(`[third-shape] F_3[t] degree ${q3MaxDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, 3);

const output = {
  candidate: "count+pair-conditioned triple-shape residual",
  N,
  integer,
  q2,
  q3,
};

const outputTag = process.argv[6]
  ? `window-thirdshape-audit-${N}-b${pairBins}`
  : `window-thirdshape-audit-${N}`;
const jsonPath = path.join(outDir, `${outputTag}.json`);
const mdPath = path.join(outDir, `${outputTag}.md`);
const svgPath = path.join(outDir, `${outputTag}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer, q2, q3));

const finalInteger = integer.rows.at(-1).real;
const finalQ2 = q2.rows.at(-1).real;
const finalQ3 = q3.rows.at(-1).real;

const md = `# count+pair-conditioned triple-shape residual audit

Candidate:
condition on count and pair-distance bin inside each short window, then measure
the third-order variance of triple distance shapes.

Integer windows: length \`${W}\`, reduced offsets \`${integerOffsets.length}\`,
pair-distance bins \`${pairBins}\`.

## Integer fresh blocks

| block | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(integer)}

Endpoint count+pair matched controls:

- aggregate Z range: \`${integer.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}\`
- mean z range: \`${integer.controlRanges.meanZ.map((v) => fmt(v)).join(" .. ")}\`
- rms z range: \`${integer.controlRanges.rmsZ.map((v) => fmt(v)).join(" .. ")}\`

## F_2[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q2)}

Endpoint count+pair matched controls:
\`${q2.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}\`.

## F_3[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q3)}

Endpoint count+pair matched controls:
\`${q3.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}\`.

## Dominant count/pair classes

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
    meanZ: finalInteger.meanZ,
    aggregateZ: finalInteger.aggregateZ,
    rmsZ: finalInteger.rmsZ,
    controlAggregateRange: integer.controlRanges.aggregateZ,
    compositeAggregateZ: integer.rows.at(-1).composite.aggregateZ,
  },
  finalQ2: {
    windows: finalQ2.windows,
    meanZ: finalQ2.meanZ,
    aggregateZ: finalQ2.aggregateZ,
    controlAggregateRange: q2.controlRanges.aggregateZ,
  },
  finalQ3: {
    windows: finalQ3.windows,
    meanZ: finalQ3.meanZ,
    aggregateZ: finalQ3.aggregateZ,
    controlAggregateRange: q3.controlRanges.aggregateZ,
  },
}, null, 2));
