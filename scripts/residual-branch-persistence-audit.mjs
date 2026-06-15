#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyDegree,
  polyMod,
  polyMul,
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
  return [Math.min(...values), Math.max(...values)];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
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
  const usable = rows.filter((row) => Math.abs(row[key]) > 0 && row[scaleKey] > 1);
  if (usable.length < 2) return 0;
  return linearFit(
    usable.map((row) => Math.log(row[scaleKey])),
    usable.map((row) => Math.log(Math.abs(row[key]))),
  ).slope;
}

function integerBackground(limit, modulus) {
  const counts = new Float64Array(modulus);
  let total = 0;
  for (let r = 1; r < finalW; r++) {
    if (gcd(r, finalW) !== 1) continue;
    if (r > limit) continue;
    const c = Math.floor((limit - r) / finalW) + 1;
    counts[r % modulus] += c;
    total += c;
  }
  return { counts, total };
}

function zField(observed, background, totalLabels) {
  const z = new Float64Array(background.counts.length);
  let active = 0, chi = 0;
  for (let i = 0; i < background.counts.length; i++) {
    const bg = background.counts[i];
    if (bg <= 0) continue;
    active++;
    const expected = totalLabels * bg / background.total;
    const value = expected > 0 ? (observed[i] - expected) / Math.sqrt(expected) : 0;
    z[i] = value;
    chi += value * value;
  }
  const df = active - 1;
  return { z, active, df, chi, norm: df > 0 ? chi / df : NaN };
}

function branchScore(levels, finalResidues, residueAt) {
  let signed = 0, weightSum = 0, agreements = 0, pairs = 0;
  for (const finalResidue of finalResidues) {
    for (let j = 0; j + 1 < levels.length; j++) {
      const a = levels[j].z[residueAt(finalResidue, j)];
      const b = levels[j + 1].z[residueAt(finalResidue, j + 1)];
      if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0 || b === 0) continue;
      const weight = Math.sqrt(Math.abs(a * b));
      const sign = Math.sign(a * b);
      signed += sign * weight;
      weightSum += weight;
      agreements += sign > 0 ? 1 : 0;
      pairs++;
    }
  }
  const alignment = weightSum > 0 ? signed / weightSum : NaN;
  return {
    alignment,
    persistence: Number.isFinite(alignment) ? (alignment + 1) / 2 : NaN,
    unweightedAgreement: pairs ? agreements / pairs : NaN,
    pairs,
    weightSum,
    meanNorm: mean(levels.map((level) => level.norm).filter(Number.isFinite)),
    endpointNorm: levels.at(-1).norm,
  };
}

function permuteLevelValues(levels, activeResiduesByLevel, seed) {
  const random = rng(seed);
  return levels.map((level, index) => {
    const residues = activeResiduesByLevel[index];
    const values = residues.map((residue) => level.z[residue]);
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = values[i];
      values[i] = values[j];
      values[j] = t;
    }
    const z = new Float64Array(level.z.length);
    for (let i = 0; i < residues.length; i++) z[residues[i]] = values[i];
    return { ...level, z };
  });
}

function integerActiveResidues(modulus, limit) {
  const residues = [];
  for (let r = 0; r < modulus; r++) {
    if (gcd(r, modulus) !== 1) continue;
    let has = false;
    for (let finalResidue = r; finalResidue < finalW; finalResidue += modulus) {
      if (gcd(finalResidue, finalW) !== 1) continue;
      if (finalResidue <= limit) {
        has = true;
        break;
      }
    }
    if (has) residues.push(r);
  }
  return residues;
}

function integerFinalResidues(limit) {
  const residues = [];
  for (let r = 1; r < finalW; r++) {
    if (r <= limit && gcd(r, finalW) === 1) residues.push(r);
  }
  return residues;
}

function integerLevels(labels, limit, backgrounds) {
  return integerModuli.map((modulus, index) => {
    const observed = new Float64Array(modulus);
    let totalLabels = 0;
    for (const label of labels) {
      if (label > limit) continue;
      if (gcd(label, finalW) !== 1) continue;
      observed[label % modulus]++;
      totalLabels++;
    }
    const field = zField(observed, backgrounds[index], totalLabels);
    return { level: `${modulus}`, modulus, labels: totalLabels, ...field };
  });
}

function scoreIntegerLabels(labels, limit, backgrounds, finalResidues) {
  const levels = integerLevels(labels, limit, backgrounds);
  return {
    labels: levels.at(-1).labels,
    levels: levels.map(({ z, ...level }) => level),
    ...branchScore(levels, finalResidues, (finalResidue, levelIndex) => finalResidue % integerModuli[levelIndex]),
    zLevels: levels,
  };
}

function scoreIntegerPermutation(real, limit, finalResidues, seed) {
  const active = integerModuli.map((modulus) => integerActiveResidues(modulus, limit));
  const permuted = permuteLevelValues(real.zLevels, active, seed);
  return branchScore(permuted, finalResidues, (finalResidue, levelIndex) => finalResidue % integerModuli[levelIndex]);
}

function stripZ(scored) {
  const { zLevels, ...rest } = scored;
  return rest;
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
    alignment: range(stats.map((row) => row.alignment)),
    persistence: range(stats.map((row) => row.persistence)),
    unweightedAgreement: range(stats.map((row) => row.unweightedAgreement)),
    meanNorm: range(stats.map((row) => row.meanNorm)),
  };
}

function runIntegerAudit() {
  const primeFlags = sieve(N);
  const primes = primesUpTo(N);
  const cramer = seeds.map((seed) => cramerPrimes(N, seed));
  const pools = integerPools(N, primeFlags);
  const rows = [];
  for (const limit of endpoints) {
    console.error(`[residual-branch] integer N=${limit}`);
    const backgrounds = integerModuli.map((modulus) => integerBackground(limit, modulus));
    const finalResidues = integerFinalResidues(limit);
    const realWithZ = scoreIntegerLabels(labelsUpTo(primes, limit), limit, backgrounds, finalResidues);
    const target = realWithZ.labels;
    const allPool = pools.all.subarray(0, prefixLength(pools.all, limit));
    const compositePool = pools.composite.subarray(0, prefixLength(pools.composite, limit));
    const eligible = seeds.map((seed) => stripZ(scoreIntegerLabels(
      sampleWithoutReplacement(allPool, target, seed ^ limit ^ 0x632be59b),
      limit,
      backgrounds,
      finalResidues,
    )));
    const composite = seeds.map((seed) => stripZ(scoreIntegerLabels(
      sampleWithoutReplacement(compositePool, target, seed ^ limit ^ 0x85157af5),
      limit,
      backgrounds,
      finalResidues,
    )));
    const cramerStats = cramer.map((labels) => stripZ(scoreIntegerLabels(
      labelsUpTo(labels, limit),
      limit,
      backgrounds,
      finalResidues,
    )));
    const permutation = seeds.map((seed) => scoreIntegerPermutation(realWithZ, limit, finalResidues, seed ^ limit ^ 0xd1b54a35));
    rows.push({
      N: limit,
      real: stripZ(realWithZ),
      controls: { cramer: cramerStats, eligible, composite, permutation },
      summary: {
        cramer: summarizeGroup(cramerStats),
        eligible: summarizeGroup(eligible),
        composite: summarizeGroup(composite),
        permutation: summarizeGroup(permutation),
      },
    });
  }
  return {
    rows,
    theta: {
      alignment: exponent(rows.map((row) => ({ N: row.N, alignment: row.real.alignment })), "alignment", "N"),
      persistenceMinusHalf: exponent(rows.map((row) => ({ N: row.N, value: row.real.persistence - 0.5 })), "value", "N"),
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
  const backgrounds = stages.map((stage) => ({ counts: new Float64Array(stage.size), total: 0 }));
  for (let lower = 0; lower < lead; lower++) {
    const poly = lead + lower;
    const finalResidue = polyMod(poly, finalStage.product, q);
    if (!finalStage.eligible[finalResidue]) continue;
    all.push(poly);
    if (!flags[lower]) reducible.push(poly);
    for (let i = 0; i < stages.length; i++) {
      const residue = polyMod(poly, stages[i].product, q);
      backgrounds[i].counts[residue]++;
      backgrounds[i].total++;
    }
  }
  return { all: Uint32Array.from(all), reducible: Uint32Array.from(reducible), backgrounds };
}

function fieldLevels(labels, q, stages, backgrounds) {
  return stages.map((stage, index) => {
    const observed = new Float64Array(stage.size);
    let totalLabels = 0;
    const finalStage = stages.at(-1);
    for (const poly of labels) {
      const finalResidue = polyMod(poly, finalStage.product, q);
      if (!finalStage.eligible[finalResidue]) continue;
      observed[polyMod(poly, stage.product, q)]++;
      totalLabels++;
    }
    const field = zField(observed, backgrounds[index], totalLabels);
    return {
      level: stage.level,
      factorDegree: stage.factorDegree,
      productDegree: stage.productDegree,
      residues: stage.eligibleResidues.length,
      labels: totalLabels,
      ...field,
    };
  });
}

function scoreFieldLabels(labels, q, stages, backgrounds) {
  const levels = fieldLevels(labels, q, stages, backgrounds);
  const finalResidues = stages.at(-1).eligibleResidues;
  return {
    labels: levels.at(-1).labels,
    levels: levels.map(({ z, ...level }) => level),
    ...branchScore(levels, finalResidues, (finalResidue, levelIndex) => polyMod(finalResidue, stages[levelIndex].product, q)),
    zLevels: levels,
  };
}

function scoreFieldPermutation(real, q, stages, seed) {
  const active = stages.map((stage) => Array.from(stage.eligibleResidues));
  const permuted = permuteLevelValues(real.zLevels, active, seed);
  return branchScore(permuted, stages.at(-1).eligibleResidues, (finalResidue, levelIndex) => polyMod(finalResidue, stages[levelIndex].product, q));
}

function runFieldAudit(q, maxDegree, maxFactorDegree) {
  console.error(`[residual-branch] F_${q}[t] universe degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const stages = factorStages(universe, maxFactorDegree);
  const startDegree = Math.max(maxFactorDegree + 1, maxDegree - 3);
  const rows = [];
  for (let degree = startDegree; degree <= maxDegree; degree++) {
    console.error(`[residual-branch] F_${q}[t] degree ${degree}`);
    const pools = fieldPools(universe, degree, stages);
    const realLabels = Uint32Array.from(universe.irreduciblesByDegree[degree]);
    const realWithZ = scoreFieldLabels(realLabels, q, stages, pools.backgrounds);
    const target = realWithZ.labels;
    const eligible = seeds.map((seed) => stripZ(scoreFieldLabels(
      sampleWithoutReplacement(pools.all, target, seed ^ (degree * 1009) ^ (q * 9176)),
      q,
      stages,
      pools.backgrounds,
    )));
    const reducible = seeds.map((seed) => stripZ(scoreFieldLabels(
      sampleControl(pools.reducible, target, seed ^ (degree * 811) ^ (q * 3571)),
      q,
      stages,
      pools.backgrounds,
    )));
    const permutation = seeds.map((seed) => scoreFieldPermutation(realWithZ, q, stages, seed ^ (degree * 1531) ^ (q * 65537)));
    rows.push({
      q,
      degree,
      backgroundSize: pools.all.length,
      reducibleBackgroundSize: pools.reducible.length,
      real: stripZ(realWithZ),
      controls: { eligible, reducible, permutation },
      summary: {
        eligible: summarizeGroup(eligible),
        reducible: summarizeGroup(reducible),
        permutation: summarizeGroup(permutation),
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
    const c = row.summary.composite.alignment;
    const e = row.summary.eligible.alignment;
    const p = row.summary.permutation.alignment;
    return `| ${row.N} | ${row.real.labels} | ${fmt(row.real.alignment)} | ${fmt(row.real.persistence)} | ${fmt(e[0])}..${fmt(e[1])} | ${fmt(c[0])}..${fmt(c[1])} | ${fmt(p[0])}..${fmt(p[1])} |`;
  }).join("\n");
}

function tableField(field, controlName) {
  return field.rows.map((row) => {
    const e = row.summary.eligible.alignment;
    const c = row.summary[controlName].alignment;
    const p = row.summary.permutation.alignment;
    return `| ${row.degree} | ${row.real.labels} | ${fmt(row.real.alignment)} | ${fmt(row.real.persistence)} | ${fmt(e[0])}..${fmt(e[1])} | ${fmt(c[0])}..${fmt(c[1])} | ${fmt(p[0])}..${fmt(p[1])} |`;
  }).join("\n");
}

function svg(output) {
  const width = 1120, height = 620, pad = 64;
  const rows = output.integer.rows;
  const minX = rows[0].N, maxX = rows.at(-1).N;
  const allY = rows.flatMap((row) => [
    row.real.alignment,
    ...row.summary.eligible.alignment,
    ...row.summary.composite.alignment,
    ...row.summary.permutation.alignment,
  ])
    .concat(output.q2.rows.map((row) => row.real.alignment), output.q3.rows.map((row) => row.real.alignment))
    .filter(Number.isFinite);
  const minY = Math.min(-0.15, ...allY);
  const maxY = Math.max(0.8, ...allY);
  const xScale = (x) => pad + (Math.log(x) - Math.log(minX)) / (Math.log(maxX) - Math.log(minX)) * (width * 0.62 - pad * 1.2);
  const yScale = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const line = (points, color, sw = 2, dash = "") => {
    const finite = points.filter(([, y]) => Number.isFinite(y));
    if (!finite.length) return "";
    const d = finite.map(([x, y], i) => `${i ? "L" : "M"} ${xScale(x).toFixed(2)} ${yScale(y).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  };
  const paths = [
    `<line x1="${pad}" y1="${yScale(0).toFixed(2)}" x2="${(width * 0.62 - pad * 0.2).toFixed(2)}" y2="${yScale(0).toFixed(2)}" stroke="#475569" stroke-dasharray="5 5"/>`,
    line(rows.map((row) => [row.N, row.real.alignment]), "#67e8f9", 3),
    line(rows.map((row) => [row.N, row.summary.composite.alignment[0]]), "#fb7185", 1.5, "4 4"),
    line(rows.map((row) => [row.N, row.summary.composite.alignment[1]]), "#fb7185", 1.5, "4 4"),
    line(rows.map((row) => [row.N, row.summary.permutation.alignment[0]]), "#fbbf24", 1.5, "2 5"),
    line(rows.map((row) => [row.N, row.summary.permutation.alignment[1]]), "#fbbf24", 1.5, "2 5"),
  ].join("\n");
  const fieldX = width * 0.68;
  const fieldRows = [
    ...output.q2.rows.map((row) => ({ name: `F2 d${row.degree}`, color: "#a78bfa", value: row.real.alignment, ctrl: row.summary.reducible.alignment })),
    ...output.q3.rows.map((row) => ({ name: `F3 d${row.degree}`, color: "#34d399", value: row.real.alignment, ctrl: row.summary.reducible.alignment })),
  ];
  const fieldText = fieldRows.map((row, i) => {
    const y = 110 + i * 28;
    const bar = Number.isFinite(row.value)
      ? Math.min(190, Math.max(0, (row.value - minY) / ((maxY - minY) || 1) * 190))
      : 0;
    return `<g><text x="${fieldX}" y="${y}" fill="${row.color}">${row.name}</text><rect x="${fieldX + 80}" y="${y - 12}" width="${bar.toFixed(2)}" height="10" fill="${row.color}" opacity="0.75"/><text x="${fieldX + 280}" y="${y}" fill="#cbd5e1">${fmt(row.value)} / red ${fmt(row.ctrl[0])}..${fmt(row.ctrl[1])}</text></g>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace" font-size="12">
${paths}
<text x="${pad}" y="30" fill="#e2e8f0" font-size="18" font-weight="700">Residual-field branch persistence</text>
<text x="${pad}" y="52" fill="#94a3b8">y: adjacent ancestor sign alignment of standardized residual fields</text>
<text x="${pad}" y="${height - 18}" fill="#94a3b8">cyan real Z; red sampled final-eligible composites; yellow level-permutation controls; dashed y=0 random sign line</text>
<text x="${fieldX}" y="72" fill="#e2e8f0" font-size="14" font-weight="700">Function-field real alignment / reducible range</text>
${fieldText}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

const integer = runIntegerAudit();
const q2 = runFieldAudit(2, q2MaxDegree, q2FactorDegree);
const q3 = runFieldAudit(3, q3MaxDegree, q3FactorDegree);

const output = {
  candidate: "residual-field branch persistence: adjacent ancestor sign alignment after local-obstruction subtraction",
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

const base = `residual-branch-persistence-audit-${N}`;
const jsonPath = path.join(outDir, `${base}.json`);
const mdPath = path.join(outDir, `${base}.md`);
const svgPath = path.join(outDir, `${base}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(output));

const md = `# residual-field branch persistence audit

Candidate:
weighted adjacent sign alignment of standardized AP residuals along the
local-obstruction tower.

## Integer side

Alignment theta:
\`${fmt(integer.theta.alignment)}\`.
Persistence-minus-half theta:
\`${fmt(integer.theta.persistenceMinusHalf)}\`.

| N | real labels | real alignment | real persistence | eligible alignment range | composite alignment range | level-permutation alignment range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${tableInteger(integer.rows)}

Endpoint per-level real energy carried along the same branch field:

| level | labels | df | norm |
| --- | ---: | ---: | ---: |
${integer.rows.at(-1).real.levels.map((level) => `| ${level.level} | ${level.labels} | ${level.df} | ${fmt(level.norm)} |`).join("\n")}

## Function fields

F_2[t] stages:
${q2.stages.map((stage) => `- factors <= degree ${stage.factorDegree}: product degree ${stage.productDegree}, eligible residues ${stage.eligibleResidues}`).join("\n")}

| degree | real labels | real alignment | real persistence | eligible alignment range | reducible alignment range | level-permutation alignment range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${tableField(q2, "reducible")}

F_3[t] stages:
${q3.stages.map((stage) => `- factors <= degree ${stage.factorDegree}: product degree ${stage.productDegree}, eligible residues ${stage.eligibleResidues}`).join("\n")}

| degree | real labels | real alignment | real persistence | eligible alignment range | reducible alignment range | level-permutation alignment range |
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
  integerEndpointCompositeRange: output.integer.rows.at(-1).summary.composite.alignment,
  integerEndpointPermutationRange: output.integer.rows.at(-1).summary.permutation.alignment,
  q2Endpoint: output.q2.rows.at(-1).real,
  q2EndpointReducibleRange: output.q2.rows.at(-1).summary.reducible.alignment,
  q3Endpoint: output.q3.rows.at(-1).real,
  q3EndpointReducibleRange: output.q3.rows.at(-1).summary.reducible.alignment,
}, null, 2));
