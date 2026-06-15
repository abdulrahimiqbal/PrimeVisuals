#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
} from "../src/core/ffield.js";
import { sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 24);
const q3MaxDegree = Number(process.argv[5] || 15);

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

function pairDistanceShape(values, distanceFn) {
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

function polyOffsetDistance(q, hDegree) {
  const denom = q ** Math.max(0, hDegree - 1);
  return (a, b) => {
    const diff = q === 2 ? (a ^ b) : polySubEncoded(a, b, q);
    const d = polyDegreeInt(diff, q);
    return d < 0 ? 0 : (q ** d) / denom;
  };
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

function nullStats(offsets, distanceFn, maxK, seed) {
  const random = rng(seed);
  const stats = new Map();
  for (let k = 0; k <= maxK; k++) {
    if (k < 2 || k > offsets.length) {
      stats.set(k, { mean: 0, sd: 1 });
      continue;
    }
    const reps = Math.max(1500, Math.min(12000, 60000 / k));
    const values = [];
    for (let i = 0; i < reps; i++) {
      values.push(pairDistanceShape(sampleSubset(offsets, k, random), distanceFn));
    }
    stats.set(k, { mean: mean(values), sd: Math.max(stdev(values), 1e-9) });
  }
  return stats;
}

function zForShape(shape, k, stats) {
  const s = stats.get(k) || { mean: 0, sd: 1 };
  return (shape - s.mean) / s.sd;
}

function summarizeZ(items, strongestCount = 8) {
  const usable = items.filter((item) => Number.isFinite(item.z));
  const n = usable.length;
  const sumZ = usable.reduce((sum, item) => sum + item.z, 0);
  const byAbs = usable.slice().sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  const byK = new Map();
  for (const item of usable) {
    const row = byK.get(item.k) || { k: item.k, n: 0, sumZ: 0 };
    row.n++;
    row.sumZ += item.z;
    byK.set(item.k, row);
  }
  const kRows = [...byK.values()].map((row) => ({
    ...row,
    meanZ: row.sumZ / row.n,
    aggregateZ: row.sumZ / Math.sqrt(row.n || 1),
  })).sort((a, b) => a.k - b.k);
  return {
    windows: n,
    meanZ: sumZ / (n || 1),
    aggregateZ: sumZ / Math.sqrt(n || 1),
    rmsZ: Math.sqrt(mean(usable.map((item) => item.z * item.z))),
    strongest: byAbs.slice(0, strongestCount),
    kRows,
  };
}

function integerWindowItems(isp, lo, hi, mode, seed = 0) {
  const random = rng(seed);
  const items = [];
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
    if (k < 2) continue;
    const chosen = mode === "real"
      ? primeOffsets
      : mode === "composite"
        ? (compositeOffsets.length >= k ? sampleSubset(compositeOffsets, k, random) : [])
        : sampleSubset(integerOffsets, k, random);
    if (chosen.length !== k) continue;
    items.push({
      id: `${base}`,
      k,
      shape: pairDistanceShape(chosen, integerDistance),
    });
  }
  return items;
}

function integerAudit(isp) {
  const stats = nullStats(integerOffsets, integerDistance, integerOffsets.length, 0xceda);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    const realItems = integerWindowItems(isp, lo, hi, "real").map((item) => ({
      ...item,
      z: zForShape(item.shape, item.k, stats),
    }));
    const compositeItems = integerWindowItems(isp, lo, hi, "composite", 0xfeed).map((item) => ({
      ...item,
      z: zForShape(item.shape, item.k, stats),
    }));
    rows.push({
      lo,
      hi,
      real: summarizeZ(realItems),
      composite: summarizeZ(compositeItems),
    });
  }
  const final = rows.at(-1);
  const controls = seeds.map((seed) => {
    const items = integerWindowItems(isp, final.lo, final.hi, "shuffle", seed).map((item) => ({
      ...item,
      z: zForShape(item.shape, item.k, stats),
    }));
    return summarizeZ(items);
  });
  return {
    W,
    offsets: integerOffsets,
    scales,
    rows,
    controls,
    controlRanges: {
      meanZ: range(controls.map((row) => row.meanZ)),
      aggregateZ: range(controls.map((row) => row.aggregateZ)),
      rmsZ: range(controls.map((row) => row.rmsZ)),
    },
  };
}

function fieldWindowItems(q, maxDegree, degree, hDegree, mode, seed = 0) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const flags = universe.irreducibleFlagsByDegree[degree];
  const hSize = q ** hDegree;
  const windows = q ** (degree - hDegree);
  const offsets = Array.from({ length: hSize }, (_, i) => i);
  const random = rng(seed);
  const items = [];
  for (let high = 0; high < windows; high++) {
    const baseIndex = high * hSize;
    const primeOffsets = [];
    const compositeOffsets = [];
    for (let h = 0; h < hSize; h++) {
      if (flags[baseIndex + h]) primeOffsets.push(h);
      else compositeOffsets.push(h);
    }
    const k = primeOffsets.length;
    if (k < 2) continue;
    const chosen = mode === "real"
      ? primeOffsets
      : mode === "composite"
        ? (compositeOffsets.length >= k ? sampleSubset(compositeOffsets, k, random) : [])
        : sampleSubset(offsets, k, random);
    if (chosen.length !== k) continue;
    items.push({
      id: `${degree}:${high}`,
      k,
      shape: pairDistanceShape(chosen, polyOffsetDistance(q, hDegree)),
    });
  }
  return items;
}

function fieldAudit(q, maxDegree, hDegree) {
  const offsets = Array.from({ length: q ** hDegree }, (_, i) => i);
  const distanceFn = polyOffsetDistance(q, hDegree);
  const stats = nullStats(offsets, distanceFn, offsets.length, 0x51f1e + q);
  const start = Math.max(hDegree + 2, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    const realItems = fieldWindowItems(q, maxDegree, degree, hDegree, "real").map((item) => ({
      ...item,
      z: zForShape(item.shape, item.k, stats),
    }));
    const compositeItems = fieldWindowItems(q, maxDegree, degree, hDegree, "composite", 0xbeef + q).map((item) => ({
      ...item,
      z: zForShape(item.shape, item.k, stats),
    }));
    rows.push({
      degree,
      real: summarizeZ(realItems),
      composite: summarizeZ(compositeItems),
    });
  }
  const final = rows.at(-1);
  const controls = seeds.map((seed) => {
    const items = fieldWindowItems(q, maxDegree, final.degree, hDegree, "shuffle", seed).map((item) => ({
      ...item,
      z: zForShape(item.shape, item.k, stats),
    }));
    return summarizeZ(items);
  });
  return {
    q,
    maxDegree,
    hDegree,
    offsets,
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

function strongestText(summary) {
  return summary.strongest.map((item) => `${item.id}:k${item.k}:z${fmt(item.z, 3)}`).join(", ");
}

function kRowsText(summary) {
  return summary.kRows.map((row) => `k${row.k}:n${row.n}:mean${fmt(row.meanZ, 3)}:Z${fmt(row.aggregateZ, 3)}`).join(", ");
}

function mdIntegerRows(integer) {
  return integer.rows.map((row) => `| ${row.lo}..${row.hi} | ${row.real.windows} | ${fmt(row.real.meanZ)} | ${fmt(row.real.aggregateZ)} | ${fmt(row.real.rmsZ)} | ${fmt(row.composite.aggregateZ)} | ${fmt(row.composite.rmsZ)} |`).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => `| ${row.degree} | ${row.real.windows} | ${fmt(row.real.meanZ)} | ${fmt(row.real.aggregateZ)} | ${fmt(row.real.rmsZ)} | ${fmt(row.composite.aggregateZ)} | ${fmt(row.composite.rmsZ)} |`).join("\n");
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
    return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(item.z)}"><title>${item.id} k=${item.k} z=${fmt(item.z, 3)}</title></rect>`;
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
<text x="54" y="36" fill="#f8fafc" font-size="18">count-conditioned admissible window shape residual</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">aggregate Z of pairwise-distance shape after conditioning on the number of hits per window</text>
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
<text x="650" y="484" fill="#94a3b8">Z shuffle aggregate ${integer.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="508" fill="#7dd3fc">composite aggregate ${fmt(integer.rows.at(-1).composite.aggregateZ)}</text>
<text x="650" y="532" fill="#fbbf24">F2 aggregate ${fmt(q2Final.aggregateZ)}, shuffle ${q2.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="556" fill="#f472b6">F3 aggregate ${fmt(q3Final.aggregateZ)}, shuffle ${q3.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="594" fill="#94a3b8">blue = too clustered, red = too spread, clamp +/-4</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[window-shape] building integer sieve to ${N}`);
const isp = sieve(N + W + 1);

console.error("[window-shape] integer windows");
const integer = integerAudit(isp);
console.error(`[window-shape] F_2[t] degree ${q2MaxDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, 5);
console.error(`[window-shape] F_3[t] degree ${q3MaxDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, 3);

const output = {
  candidate: "count-conditioned admissible window shape residual",
  N,
  integer,
  q2,
  q3,
};

const jsonPath = path.join(outDir, `window-shape-audit-${N}.json`);
const mdPath = path.join(outDir, `window-shape-audit-${N}.md`);
const svgPath = path.join(outDir, `window-shape-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(integer, q2, q3));

const finalInteger = integer.rows.at(-1).real;
const finalQ2 = q2.rows.at(-1).real;
const finalQ3 = q3.rows.at(-1).real;
const md = `# count-conditioned admissible window shape residual audit

Candidate:
condition on the number of primes/irreducibles in each short admissible
window, then measure whether their positions are more spread or clustered than
a uniformly random count-matched subset.

Integer windows: length \`${W}\`, reduced offsets \`${integerOffsets.length}\`.
Function windows: \`F_2[t]\` low-degree offset space \`2^5\`; \`F_3[t]\`
low-degree offset space \`3^3\`.

## Integer fresh blocks

| block | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(integer)}

Endpoint count-matched permutation controls:

- aggregate Z range: \`${integer.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}\`
- mean z range: \`${integer.controlRanges.meanZ.map((v) => fmt(v)).join(" .. ")}\`
- rms z range: \`${integer.controlRanges.rmsZ.map((v) => fmt(v)).join(" .. ")}\`

## F_2[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q2)}

Endpoint permutation controls:
\`${q2.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}\`.

## F_3[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(q3)}

Endpoint permutation controls:
\`${q3.controlRanges.aggregateZ.map((v) => fmt(v)).join(" .. ")}\`.

## Count-class checks

Z endpoint:
\`${kRowsText(finalInteger)}\`

F_2[t] endpoint:
\`${kRowsText(finalQ2)}\`

F_3[t] endpoint:
\`${kRowsText(finalQ3)}\`

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
