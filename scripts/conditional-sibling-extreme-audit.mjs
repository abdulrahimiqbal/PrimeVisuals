#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyMod,
  polyMul,
  polyDegree,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 22);
const q3MaxDegree = Number(process.argv[5] || 13);
const q2FactorDegree = Number(process.argv[6] || 3);
const q3FactorDegree = Number(process.argv[7] || 2);

const seeds = [12345, 271828, 314159, 161803, 424242];
const integerModuli = [6, 30, 210, 2310, 30030];
const finalW = integerModuli.at(-1);
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
  const usable = values.filter(Number.isFinite);
  return usable.length ? [Math.min(...usable), Math.max(...usable)] : [NaN, NaN];
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

function exponent(rows, valueKey, scaleKey) {
  const usable = rows.filter((row) => row[scaleKey] > 1 && row[valueKey] > 0);
  if (usable.length < 2) return 0;
  return linearFit(
    usable.map((row) => Math.log(row[scaleKey])),
    usable.map((row) => Math.log(row[valueKey])),
  ).slope;
}

function labelsUpTo(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return sorted.slice(0, hi);
}

function prefixLength(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return hi;
}

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} from pool of ${pool.length}`);
  const random = rng(seed);
  const copy = new Uint32Array(pool);
  const out = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (copy.length - i));
    const picked = copy[j];
    copy[j] = copy[i];
    copy[i] = picked;
    out[i] = picked;
  }
  return out;
}

function sampleWithReplacement(pool, count, seed) {
  if (!pool.length) throw new Error("cannot sample from an empty pool");
  const random = rng(seed);
  const out = new Uint32Array(count);
  for (let i = 0; i < count; i++) out[i] = pool[Math.floor(random() * pool.length)];
  return out;
}

function sampleControl(pool, count, seed) {
  return count <= pool.length
    ? sampleWithoutReplacement(pool, count, seed)
    : sampleWithReplacement(pool, count, seed);
}

function multinomialCounts(total, weights, random) {
  const counts = new Int32Array(weights.length);
  const cumulative = new Float64Array(weights.length);
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    cumulative[i] = sum;
  }
  if (!(sum > 0)) return counts;
  for (let draw = 0; draw < total; draw++) {
    const u = random() * sum;
    let lo = 0, hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (u <= cumulative[mid]) hi = mid;
      else lo = mid + 1;
    }
    counts[lo]++;
  }
  return counts;
}

function edgeExtreme(parentCounts, childCounts, parentBackground, childBackground, childToParent, siblingSimSeed = null) {
  const byParent = new Map();
  for (let child = 0; child < childBackground.length; child++) {
    const bg = childBackground[child];
    if (bg <= 0) continue;
    const parent = childToParent(child);
    let row = byParent.get(parent);
    if (!row) {
      row = { children: [], bg: [] };
      byParent.set(parent, row);
    }
    row.children.push(child);
    row.bg.push(bg);
  }

  const random = siblingSimSeed === null ? null : rng(siblingSimSeed);
  const fiberScores = [];
  let maxFiber = 0;
  for (const [parent, row] of byParent) {
    const cParent = parentCounts[parent] || 0;
    const eParent = parentBackground[parent] || 0;
    const k = row.children.length;
    if (k <= 1 || cParent <= 0 || eParent <= 0) continue;
    const simulated = random ? multinomialCounts(cParent, row.bg, random) : null;
    let maxAbs = 0;
    for (let i = 0; i < k; i++) {
      const q = row.bg[i] / eParent;
      if (!(q > 0) || q >= 1) continue;
      const observed = simulated ? simulated[i] : childCounts[row.children[i]];
      const expected = cParent * q;
      const denom = Math.sqrt(cParent * q * (1 - q));
      if (denom <= 0) continue;
      maxAbs = Math.max(maxAbs, Math.abs((observed - expected) / denom));
    }
    const normalizer = Math.sqrt(2 * Math.log(k));
    if (normalizer > 0) {
      fiberScores.push(maxAbs / normalizer);
      maxFiber = Math.max(maxFiber, maxAbs / normalizer);
    }
  }
  return {
    fibers: fiberScores.length,
    meanExtreme: mean(fiberScores),
    maxExtreme: maxFiber,
  };
}

function summarizeEdges(edges) {
  const usable = edges.filter((edge) => edge.fibers > 0 && Number.isFinite(edge.meanExtreme));
  return {
    meanExtreme: mean(usable.map((edge) => edge.meanExtreme)),
    maxEdgeExtreme: usable.length ? Math.max(...usable.map((edge) => edge.meanExtreme)) : NaN,
    totalFibers: usable.reduce((sum, edge) => sum + edge.fibers, 0),
    edges,
  };
}

function integerBackground(limit, modulus) {
  const counts = new Float64Array(modulus);
  for (let r = 1; r < finalW; r++) {
    if (gcd(r, finalW) !== 1 || r > limit) continue;
    const c = Math.floor((limit - r) / finalW) + 1;
    counts[r % modulus] += c;
  }
  return counts;
}

function integerCounts(labels, limit, modulus) {
  const counts = new Int32Array(modulus);
  let total = 0;
  for (const label of labels) {
    if (label > limit) continue;
    if (gcd(label, finalW) !== 1) continue;
    counts[label % modulus]++;
    total++;
  }
  return { counts, total };
}

function integerScore(labels, limit, simSeed = null) {
  const countByMod = integerModuli.map((modulus) => integerCounts(labels, limit, modulus));
  const bgByMod = integerModuli.map((modulus) => integerBackground(limit, modulus));
  const edges = [];
  for (let i = 0; i + 1 < integerModuli.length; i++) {
    const parentW = integerModuli[i];
    const childW = integerModuli[i + 1];
    edges.push({
      from: `${parentW}`,
      to: `${childW}`,
      ...edgeExtreme(
        countByMod[i].counts,
        countByMod[i + 1].counts,
        bgByMod[i],
        bgByMod[i + 1],
        (child) => child % parentW,
        simSeed === null ? null : simSeed ^ (i * 0x9e3779b9),
      ),
    });
  }
  return {
    labels: countByMod.at(-1).total,
    ...summarizeEdges(edges),
  };
}

function integerPools(limit, primeFlags) {
  const all = [];
  const composite = [];
  for (let n = 2; n <= limit; n++) {
    if (gcd(n, finalW) !== 1) continue;
    all.push(n);
    if (!primeFlags[n]) composite.push(n);
  }
  return { all: Uint32Array.from(all), composite: Uint32Array.from(composite) };
}

function summarizeGroup(stats) {
  return {
    meanExtreme: range(stats.map((row) => row.meanExtreme)),
    maxEdgeExtreme: range(stats.map((row) => row.maxEdgeExtreme)),
  };
}

function runIntegerAudit() {
  const primeFlags = sieve(N);
  const primes = primesUpTo(N);
  const cramer = seeds.map((seed) => cramerPrimes(N, seed));
  const pools = integerPools(N, primeFlags);
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[conditional-sibling] integer N=${limit}`);
    const real = integerScore(labelsUpTo(primes, limit), limit);
    const target = real.labels;
    const allPool = pools.all.subarray(0, prefixLength(pools.all, limit));
    const compositePool = pools.composite.subarray(0, prefixLength(pools.composite, limit));
    const eligible = seeds.map((seed) => integerScore(sampleWithoutReplacement(allPool, target, seed ^ limit ^ 0x243f6a88), limit));
    const composite = seeds.map((seed) => integerScore(sampleWithoutReplacement(compositePool, target, seed ^ limit ^ 0x85a308d3), limit));
    const cramerStats = cramer.map((labels) => integerScore(labelsUpTo(labels, limit), limit));
    const sibling = seeds.map((seed) => integerScore(labelsUpTo(primes, limit), limit, seed ^ limit ^ 0x13198a2e));
    rows.push({
      N: limit,
      real,
      controls: { cramer: cramerStats, eligible, composite, sibling },
      summary: {
        cramer: summarizeGroup(cramerStats),
        eligible: summarizeGroup(eligible),
        composite: summarizeGroup(composite),
        sibling: summarizeGroup(sibling),
      },
    });
  }
  return {
    rows,
    theta: {
      meanExtreme: exponent(rows.map((row) => ({ N: row.N, meanExtreme: row.real.meanExtreme })), "meanExtreme", "N"),
    },
  };
}

function factorStages(universe, maxFactorDegree) {
  const stages = [];
  let product = 1;
  const factors = [];
  for (let degree = 1; degree <= maxFactorDegree; degree++) {
    for (const factor of universe.irreduciblesByDegree[degree]) {
      product = polyMul(product, factor, universe.q);
      factors.push(factor);
    }
    const productDegree = polyDegree(product, universe.q);
    const size = universe.q ** productDegree;
    const eligible = new Uint8Array(size);
    const residues = [];
    for (let residue = 0; residue < size; residue++) {
      let ok = true;
      for (const factor of factors) {
        if (polyMod(residue, factor, universe.q) === 0) {
          ok = false;
          break;
        }
      }
      if (ok) {
        eligible[residue] = 1;
        residues.push(residue);
      }
    }
    stages.push({
      level: `<=${degree}`,
      factorDegree: degree,
      product,
      productDegree,
      size,
      eligible,
      eligibleResidues: Uint32Array.from(residues),
    });
  }
  return stages;
}

function fieldPools(universe, degree, stages) {
  const q = universe.q;
  const lead = q ** degree;
  const flags = universe.irreducibleFlagsByDegree[degree];
  const finalStage = stages.at(-1);
  const all = [];
  const reducible = [];
  const backgrounds = stages.map((stage) => new Float64Array(stage.size));
  for (let lower = 0; lower < lead; lower++) {
    const poly = lead + lower;
    const finalResidue = polyMod(poly, finalStage.product, q);
    if (!finalStage.eligible[finalResidue]) continue;
    all.push(poly);
    if (!flags[lower]) reducible.push(poly);
    for (let i = 0; i < stages.length; i++) {
      backgrounds[i][polyMod(poly, stages[i].product, q)]++;
    }
  }
  return { all: Uint32Array.from(all), reducible: Uint32Array.from(reducible), backgrounds };
}

function fieldCounts(labels, q, stages) {
  const finalStage = stages.at(-1);
  return stages.map((stage) => {
    const counts = new Int32Array(stage.size);
    let total = 0;
    for (const poly of labels) {
      const finalResidue = polyMod(poly, finalStage.product, q);
      if (!finalStage.eligible[finalResidue]) continue;
      counts[polyMod(poly, stage.product, q)]++;
      total++;
    }
    return { counts, total };
  });
}

function fieldScore(labels, q, stages, backgrounds, simSeed = null) {
  const countByStage = fieldCounts(labels, q, stages);
  const edges = [];
  for (let i = 0; i + 1 < stages.length; i++) {
    edges.push({
      from: stages[i].level,
      to: stages[i + 1].level,
      ...edgeExtreme(
        countByStage[i].counts,
        countByStage[i + 1].counts,
        backgrounds[i],
        backgrounds[i + 1],
        (child) => polyMod(child, stages[i].product, q),
        simSeed === null ? null : simSeed ^ (i * 0x9e3779b9),
      ),
    });
  }
  return {
    labels: countByStage.at(-1).total,
    ...summarizeEdges(edges),
  };
}

function runFieldAudit(q, maxDegree, maxFactorDegree) {
  console.error(`[conditional-sibling] F_${q}[t] universe degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const stages = factorStages(universe, maxFactorDegree);
  const startDegree = Math.max(maxFactorDegree + 1, maxDegree - 3);
  const rows = [];
  for (let degree = startDegree; degree <= maxDegree; degree++) {
    console.error(`[conditional-sibling] F_${q}[t] degree ${degree}`);
    const pools = fieldPools(universe, degree, stages);
    const realLabels = Uint32Array.from(universe.irreduciblesByDegree[degree]);
    const real = fieldScore(realLabels, q, stages, pools.backgrounds);
    const target = real.labels;
    const eligible = seeds.map((seed) => fieldScore(
      sampleWithoutReplacement(pools.all, target, seed ^ (degree * 1009) ^ (q * 9176)),
      q,
      stages,
      pools.backgrounds,
    ));
    const reducible = seeds.map((seed) => fieldScore(
      sampleControl(pools.reducible, target, seed ^ (degree * 811) ^ (q * 3571)),
      q,
      stages,
      pools.backgrounds,
    ));
    const sibling = seeds.map((seed) => fieldScore(realLabels, q, stages, pools.backgrounds, seed ^ (degree * 1531) ^ (q * 65537)));
    rows.push({
      q,
      degree,
      backgroundSize: pools.all.length,
      reducibleBackgroundSize: pools.reducible.length,
      real,
      controls: { eligible, reducible, sibling },
      summary: {
        eligible: summarizeGroup(eligible),
        reducible: summarizeGroup(reducible),
        sibling: summarizeGroup(sibling),
      },
    });
  }
  return {
    q,
    maxDegree,
    maxFactorDegree,
    stages: stages.map((stage) => ({
      level: stage.level,
      factorDegree: stage.factorDegree,
      productDegree: stage.productDegree,
      eligibleResidues: stage.eligibleResidues.length,
    })),
    rows,
  };
}

function tableInteger(rows) {
  return rows.map((row) => {
    const e = row.summary.eligible.meanExtreme;
    const c = row.summary.composite.meanExtreme;
    const s = row.summary.sibling.meanExtreme;
    return `| ${row.N} | ${row.real.labels} | ${fmt(row.real.meanExtreme)} | ${fmt(row.real.maxEdgeExtreme)} | ${fmt(e[0])}..${fmt(e[1])} | ${fmt(c[0])}..${fmt(c[1])} | ${fmt(s[0])}..${fmt(s[1])} |`;
  }).join("\n");
}

function tableField(field, controlName) {
  return field.rows.map((row) => {
    const e = row.summary.eligible.meanExtreme;
    const c = row.summary[controlName].meanExtreme;
    const s = row.summary.sibling.meanExtreme;
    return `| ${row.degree} | ${row.real.labels} | ${fmt(row.real.meanExtreme)} | ${fmt(row.real.maxEdgeExtreme)} | ${fmt(e[0])}..${fmt(e[1])} | ${fmt(c[0])}..${fmt(c[1])} | ${fmt(s[0])}..${fmt(s[1])} |`;
  }).join("\n");
}

function svg(output) {
  const width = 1120, height = 620, pad = 64;
  const rows = output.integer.rows;
  const minX = rows[0].N, maxX = rows.at(-1).N;
  const allY = rows.flatMap((row) => [
    row.real.meanExtreme,
    ...row.summary.composite.meanExtreme,
    ...row.summary.sibling.meanExtreme,
  ]).concat(output.q2.rows.map((row) => row.real.meanExtreme), output.q3.rows.map((row) => row.real.meanExtreme)).filter(Number.isFinite);
  const minY = Math.min(0.3, ...allY);
  const maxY = Math.max(1.4, ...allY);
  const xScale = (x) => pad + (Math.log(x) - Math.log(minX)) / (Math.log(maxX) - Math.log(minX)) * (width * 0.62 - pad * 1.2);
  const yScale = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const line = (points, color, sw = 2, dash = "") => {
    const finite = points.filter(([, y]) => Number.isFinite(y));
    if (!finite.length) return "";
    const d = finite.map(([x, y], i) => `${i ? "L" : "M"} ${xScale(x).toFixed(2)} ${yScale(y).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  };
  const paths = [
    line(rows.map((row) => [row.N, row.real.meanExtreme]), "#67e8f9", 3),
    line(rows.map((row) => [row.N, row.summary.composite.meanExtreme[0]]), "#fb7185", 1.5, "4 4"),
    line(rows.map((row) => [row.N, row.summary.composite.meanExtreme[1]]), "#fb7185", 1.5, "4 4"),
    line(rows.map((row) => [row.N, row.summary.sibling.meanExtreme[0]]), "#fbbf24", 1.5, "2 5"),
    line(rows.map((row) => [row.N, row.summary.sibling.meanExtreme[1]]), "#fbbf24", 1.5, "2 5"),
  ].join("\n");
  const fieldX = width * 0.68;
  const fieldRows = [
    ...output.q2.rows.map((row) => ({ name: `F2 d${row.degree}`, color: "#a78bfa", value: row.real.meanExtreme, ctrl: row.summary.reducible.meanExtreme })),
    ...output.q3.rows.map((row) => ({ name: `F3 d${row.degree}`, color: "#34d399", value: row.real.meanExtreme, ctrl: row.summary.reducible.meanExtreme })),
  ];
  const fieldText = fieldRows.map((row, i) => {
    const y = 110 + i * 28;
    const bar = Number.isFinite(row.value) ? Math.min(190, Math.max(0, (row.value - minY) / ((maxY - minY) || 1) * 190)) : 0;
    return `<g><text x="${fieldX}" y="${y}" fill="${row.color}">${row.name}</text><rect x="${fieldX + 80}" y="${y - 12}" width="${bar.toFixed(2)}" height="10" fill="${row.color}" opacity="0.75"/><text x="${fieldX + 280}" y="${y}" fill="#cbd5e1">${fmt(row.value)} / red ${fmt(row.ctrl[0])}..${fmt(row.ctrl[1])}</text></g>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace" font-size="12">
${paths}
<text x="${pad}" y="30" fill="#e2e8f0" font-size="18" font-weight="700">Conditional sibling-extreme filtration line</text>
<text x="${pad}" y="52" fill="#94a3b8">y: mean parent-conditioned max child innovation / sqrt(2 log sibling count)</text>
<text x="${pad}" y="${height - 18}" fill="#94a3b8">cyan real Z; red sampled final-eligible composites; yellow parent-conditioned sibling multinomial controls</text>
<text x="${fieldX}" y="72" fill="#e2e8f0" font-size="14" font-weight="700">Function-field real meanExtreme / reducible range</text>
${fieldText}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

const integer = runIntegerAudit();
const q2 = runFieldAudit(2, q2MaxDegree, q2FactorDegree);
const q3 = runFieldAudit(3, q3MaxDegree, q3FactorDegree);

const output = {
  candidate: "conditional sibling-extreme filtration line",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  integerModuli,
  finalW,
  seeds,
  q2MaxDegree,
  q3MaxDegree,
  q2FactorDegree,
  q3FactorDegree,
  integer,
  q2,
  q3,
};

const base = `conditional-sibling-extreme-audit-${N}`;
const jsonPath = path.join(outDir, `${base}.json`);
const mdPath = path.join(outDir, `${base}.md`);
const svgPath = path.join(outDir, `${base}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(output));

const md = `# conditional sibling-extreme filtration audit

Candidate:
parent-conditioned sibling maximum child innovation, normalized by
\`sqrt(2 log sibling_count)\`.

## Integer side

Mean-extreme theta:
\`${fmt(integer.theta.meanExtreme)}\`.

| N | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | composite meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${tableInteger(integer.rows)}

Endpoint per-edge real path:

| edge | fibers | meanExtreme | maxFiber |
| --- | ---: | ---: | ---: |
${integer.rows.at(-1).real.edges.map((edge) => `| ${edge.from}->${edge.to} | ${edge.fibers} | ${fmt(edge.meanExtreme)} | ${fmt(edge.maxExtreme)} |`).join("\n")}

## Function fields

F_2[t] stages:
${q2.stages.map((stage) => `- factors <= degree ${stage.factorDegree}: product degree ${stage.productDegree}, eligible residues ${stage.eligibleResidues}`).join("\n")}

| degree | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | reducible meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${tableField(q2, "reducible")}

F_3[t] stages:
${q3.stages.map((stage) => `- factors <= degree ${stage.factorDegree}: product degree ${stage.productDegree}, eligible residues ${stage.eligibleResidues}`).join("\n")}

| degree | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | reducible meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${tableField(q3, "reducible")}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;

fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  integerEndpoint: output.integer.rows.at(-1).real,
  integerEndpointCompositeRange: output.integer.rows.at(-1).summary.composite.meanExtreme,
  integerEndpointSiblingRange: output.integer.rows.at(-1).summary.sibling.meanExtreme,
  q2Endpoint: output.q2.rows.at(-1).real,
  q2EndpointReducibleRange: output.q2.rows.at(-1).summary.reducible.meanExtreme,
  q3Endpoint: output.q3.rows.at(-1).real,
  q3EndpointReducibleRange: output.q3.rows.at(-1).summary.reducible.meanExtreme,
}, null, 2));
