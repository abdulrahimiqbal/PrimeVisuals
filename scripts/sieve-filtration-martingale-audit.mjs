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

function meanFinite(values) {
  const usable = values.filter(Number.isFinite);
  return mean(usable);
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
  if (pool.length === 0) throw new Error("cannot sample from an empty pool");
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

function exponent(rows, valueFn, scaleFn) {
  const usable = rows
    .map((row) => ({ x: scaleFn(row), y: Math.abs(valueFn(row)) }))
    .filter((row) => row.x > 1 && row.y > 0);
  if (usable.length < 2) return 0;
  return linearFit(usable.map((row) => Math.log(row.x)), usable.map((row) => Math.log(row.y))).slope;
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

function chiFromCounts(observed, background, totalLabels) {
  let chi = 0, active = 0;
  for (let i = 0; i < background.counts.length; i++) {
    const bg = background.counts[i];
    if (bg <= 0) continue;
    active++;
    const expected = totalLabels * bg / background.total;
    if (expected <= 0) continue;
    const diff = observed[i] - expected;
    chi += (diff * diff) / expected;
  }
  const df = active - 1;
  return { chi, active, df, norm: df > 0 ? chi / df : NaN };
}

function integerPathStats(labels, limit, backgrounds) {
  const levels = integerModuli.map((modulus, index) => {
    const observed = new Float64Array(modulus);
    let totalLabels = 0;
    for (const label of labels) {
      if (label > limit) continue;
      if (gcd(label, finalW) !== 1) continue;
      observed[label % modulus]++;
      totalLabels++;
    }
    const scored = chiFromCounts(observed, backgrounds[index], totalLabels);
    return { level: `${modulus}`, modulus, labels: totalLabels, ...scored };
  });
  return {
    labels: levels.at(-1).labels,
    meanNorm: meanFinite(levels.map((level) => level.norm)),
    maxNorm: Math.max(...levels.map((level) => level.norm).filter(Number.isFinite)),
    endpointNorm: levels.at(-1).norm,
    levels,
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
    meanNorm: range(stats.map((row) => row.meanNorm)),
    endpointNorm: range(stats.map((row) => row.endpointNorm)),
    maxNorm: range(stats.map((row) => row.maxNorm)),
    labels: range(stats.map((row) => row.labels)),
  };
}

function runIntegerAudit() {
  const primeFlags = sieve(N);
  const primes = primesUpTo(N);
  const cramer = seeds.map((seed) => cramerPrimes(N, seed));
  const pools = integerPools(N, primeFlags);
  const rows = [];

  for (const limit of endpoints) {
    console.error(`[sieve-filtration] integer N=${limit}`);
    const backgrounds = integerModuli.map((modulus) => integerBackground(limit, modulus));
    const real = integerPathStats(labelsUpTo(primes, limit), limit, backgrounds);
    const allPool = pools.all.subarray(0, prefixLength(pools.all, limit));
    const compositePool = pools.composite.subarray(0, prefixLength(pools.composite, limit));
    const target = real.labels;
    const cramerStats = cramer.map((labels) => integerPathStats(labelsUpTo(labels, limit), limit, backgrounds));
    const eligibleStats = seeds.map((seed) => integerPathStats(
      sampleWithoutReplacement(allPool, target, seed ^ limit ^ 0x9e3779b9),
      limit,
      backgrounds,
    ));
    const compositeStats = seeds.map((seed) => integerPathStats(
      sampleWithoutReplacement(compositePool, target, seed ^ limit ^ 0x85ebca6b),
      limit,
      backgrounds,
    ));
    rows.push({
      N: limit,
      real,
      controls: {
        cramer: cramerStats,
        eligible: eligibleStats,
        composite: compositeStats,
      },
      summary: {
        cramer: summarizeGroup(cramerStats),
        eligible: summarizeGroup(eligibleStats),
        composite: summarizeGroup(compositeStats),
      },
    });
  }

  return {
    rows,
    theta: {
      meanNorm: exponent(rows, (row) => row.real.meanNorm, (row) => row.N),
      endpointNorm: exponent(rows, (row) => row.real.endpointNorm, (row) => row.N),
      absMeanMinusOne: exponent(rows, (row) => row.real.meanNorm - 1, (row) => row.N),
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

  return {
    all: Uint32Array.from(all),
    reducible: Uint32Array.from(reducible),
    backgrounds,
  };
}

function fieldPathStats(labels, q, stages, backgrounds) {
  const levels = stages.map((stage, index) => {
    const observed = new Float64Array(stage.size);
    let totalLabels = 0;
    for (const poly of labels) {
      const finalStage = stages.at(-1);
      const finalResidue = polyMod(poly, finalStage.product, q);
      if (!finalStage.eligible[finalResidue]) continue;
      const residue = polyMod(poly, stage.product, q);
      observed[residue]++;
      totalLabels++;
    }
    const scored = chiFromCounts(observed, backgrounds[index], totalLabels);
    return {
      level: stage.level,
      factorDegree: stage.factorDegree,
      productDegree: stage.productDegree,
      residues: stage.eligibleResidues.length,
      labels: totalLabels,
      ...scored,
    };
  });
  return {
    labels: levels.at(-1).labels,
    meanNorm: meanFinite(levels.map((level) => level.norm)),
    maxNorm: Math.max(...levels.map((level) => level.norm).filter(Number.isFinite)),
    endpointNorm: levels.at(-1).norm,
    levels,
  };
}

function runFieldAudit(q, maxDegree, maxFactorDegree) {
  console.error(`[sieve-filtration] F_${q}[t] universe degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const stages = factorStages(universe, maxFactorDegree);
  const startDegree = Math.max(maxFactorDegree + 1, maxDegree - 3);
  const rows = [];
  for (let degree = startDegree; degree <= maxDegree; degree++) {
    console.error(`[sieve-filtration] F_${q}[t] degree ${degree}`);
    const pools = fieldPools(universe, degree, stages);
    const realLabels = Uint32Array.from(universe.irreduciblesByDegree[degree]);
    const real = fieldPathStats(realLabels, q, stages, pools.backgrounds);
    const target = real.labels;
    const eligibleStats = seeds.map((seed) => fieldPathStats(
      sampleWithoutReplacement(pools.all, target, seed ^ (degree * 1009) ^ (q * 9176)),
      q,
      stages,
      pools.backgrounds,
    ));
    const reducibleStats = seeds.map((seed) => fieldPathStats(
      sampleControl(pools.reducible, target, seed ^ (degree * 811) ^ (q * 3571)),
      q,
      stages,
      pools.backgrounds,
    ));
    rows.push({
      q,
      degree,
      backgroundSize: pools.all.length,
      reducibleBackgroundSize: pools.reducible.length,
      real,
      controls: {
        eligible: eligibleStats,
        reducible: reducibleStats,
      },
      summary: {
        eligible: summarizeGroup(eligibleStats),
        reducible: summarizeGroup(reducibleStats),
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
    theta: {
      meanNorm: exponent(rows, (row) => row.real.meanNorm, (row) => row.degree),
      endpointNorm: exponent(rows, (row) => row.real.endpointNorm, (row) => row.degree),
      absMeanMinusOne: exponent(rows, (row) => row.real.meanNorm - 1, (row) => row.degree),
    },
  };
}

function tableInteger(rows) {
  return rows.map((row) => {
    const c = row.summary.composite.meanNorm;
    const e = row.summary.eligible.meanNorm;
    const cr = row.summary.cramer.meanNorm;
    return `| ${row.N} | ${row.real.labels} | ${fmt(row.real.meanNorm)} | ${fmt(row.real.endpointNorm)} | ${fmt(cr[0])}..${fmt(cr[1])} | ${fmt(e[0])}..${fmt(e[1])} | ${fmt(c[0])}..${fmt(c[1])} |`;
  }).join("\n");
}

function tableField(field) {
  return field.rows.map((row) => {
    const e = row.summary.eligible.meanNorm;
    const r = row.summary.reducible.meanNorm;
    return `| ${row.degree} | ${row.real.labels} | ${fmt(row.real.meanNorm)} | ${fmt(row.real.endpointNorm)} | ${fmt(e[0])}..${fmt(e[1])} | ${fmt(r[0])}..${fmt(r[1])} |`;
  }).join("\n");
}

function svg(output) {
  const width = 1120, height = 620, pad = 64;
  const intRows = output.integer.rows;
  const series = [
    { name: "Z real", color: "#67e8f9", points: intRows.map((row) => [row.N, row.real.meanNorm]) },
    { name: "Z composite min", color: "#fb7185", points: intRows.map((row) => [row.N, row.summary.composite.meanNorm[0]]) },
    { name: "Z composite max", color: "#fb7185", points: intRows.map((row) => [row.N, row.summary.composite.meanNorm[1]]) },
    { name: "Z eligible min", color: "#fbbf24", points: intRows.map((row) => [row.N, row.summary.eligible.meanNorm[0]]) },
    { name: "Z eligible max", color: "#fbbf24", points: intRows.map((row) => [row.N, row.summary.eligible.meanNorm[1]]) },
  ];
  const allY = series.flatMap((s) => s.points.map((p) => p[1]))
    .concat(output.q2.rows.map((row) => row.real.meanNorm))
    .concat(output.q3.rows.map((row) => row.real.meanNorm));
  const minY = Math.min(...allY, 0.7);
  const maxY = Math.max(...allY, 1.3);
  const minX = intRows[0].N;
  const maxX = intRows.at(-1).N;
  const xScale = (x) => pad + (Math.log(x) - Math.log(minX)) / (Math.log(maxX) - Math.log(minX)) * (width * 0.62 - pad * 1.2);
  const yScale = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const line = (points, color, sw = 2, dash = "") => {
    const d = points.map(([x, y], i) => `${i ? "L" : "M"} ${xScale(x).toFixed(2)} ${yScale(y).toFixed(2)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  };
  const paths = [
    `<line x1="${pad}" y1="${yScale(1).toFixed(2)}" x2="${(width * 0.62 - pad * 0.2).toFixed(2)}" y2="${yScale(1).toFixed(2)}" stroke="#475569" stroke-dasharray="5 5"/>`,
    line(series[0].points, series[0].color, 3),
    line(series[1].points, series[1].color, 1.5, "4 4"),
    line(series[2].points, series[2].color, 1.5, "4 4"),
    line(series[3].points, series[3].color, 1.5, "2 5"),
    line(series[4].points, series[4].color, 1.5, "2 5"),
  ].join("\n");
  const fieldX = width * 0.68;
  const fieldTop = 110;
  const fieldGap = 28;
  const fieldRows = [
    ...output.q2.rows.map((row) => ({ name: `F2 d${row.degree}`, color: "#a78bfa", value: row.real.meanNorm, ctrl: row.summary.reducible.meanNorm })),
    ...output.q3.rows.map((row) => ({ name: `F3 d${row.degree}`, color: "#34d399", value: row.real.meanNorm, ctrl: row.summary.reducible.meanNorm })),
  ];
  const fieldText = fieldRows.map((row, i) => {
    const y = fieldTop + i * fieldGap;
    const bar = Math.min(190, Math.max(0, row.value * 80));
    return `<g><text x="${fieldX}" y="${y}" fill="${row.color}">${row.name}</text><rect x="${fieldX + 80}" y="${y - 12}" width="${bar.toFixed(2)}" height="10" fill="${row.color}" opacity="0.75"/><text x="${fieldX + 280}" y="${y}" fill="#cbd5e1">${fmt(row.value)} / red ${fmt(row.ctrl[0])}..${fmt(row.ctrl[1])}</text></g>`;
  }).join("\n");
  const labels = `<text x="${pad}" y="30" fill="#e2e8f0" font-size="18" font-weight="700">Finite-eligible sieve-filtration martingale</text>
<text x="${pad}" y="52" fill="#94a3b8">y: mean chi-square per degree of freedom after deepest local-obstruction background</text>
<text x="${pad}" y="${height - 18}" fill="#94a3b8">cyan real Z; red sampled final-eligible composites; yellow final-eligible random controls; dashed y=1 random line</text>
<text x="${fieldX}" y="72" fill="#e2e8f0" font-size="14" font-weight="700">Function-field real meanNorm / reducible range</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace" font-size="12">
${paths}
${labels}
${fieldText}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

const integer = runIntegerAudit();
const q2 = runFieldAudit(2, q2MaxDegree, q2FactorDegree);
const q3 = runFieldAudit(3, q3MaxDegree, q3FactorDegree);

const output = {
  candidate: "finite-eligible sieve-filtration martingale: mean chi-square/df over local obstruction tower",
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

const base = `sieve-filtration-martingale-audit-${N}`;
const jsonPath = path.join(outDir, `${base}.json`);
const mdPath = path.join(outDir, `${base}.md`);
const svgPath = path.join(outDir, `${base}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(output));

const md = `# finite-eligible sieve-filtration martingale audit

Candidate:
\`A_*(N)=mean_W chi_W/(df_W)\`, where \`chi_W\` is computed against the
deepest visible eligible background projected to level \`W\`.

## Integer side

Real theta:
\`meanNorm=${fmt(integer.theta.meanNorm)}\`,
\`endpointNorm=${fmt(integer.theta.endpointNorm)}\`,
\`abs(meanNorm-1)=${fmt(integer.theta.absMeanMinusOne)}\`.

| N | real labels | real meanNorm | real W=30030 norm | Cramer meanNorm range | eligible meanNorm range | composite meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${tableInteger(integer.rows)}

Endpoint per-level real path:

| level W | labels | df | chi | norm |
| ---: | ---: | ---: | ---: | ---: |
${integer.rows.at(-1).real.levels.map((level) => `| ${level.modulus} | ${level.labels} | ${level.df} | ${fmt(level.chi)} | ${fmt(level.norm)} |`).join("\n")}

## Function fields

F_2[t] stages:
${q2.stages.map((stage) => `- factors <= degree ${stage.factorDegree}: product degree ${stage.productDegree}, eligible residues ${stage.eligibleResidues}`).join("\n")}

| degree | real labels | real meanNorm | real endpoint norm | eligible meanNorm range | reducible meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: |
${tableField(q2)}

F_3[t] stages:
${q3.stages.map((stage) => `- factors <= degree ${stage.factorDegree}: product degree ${stage.productDegree}, eligible residues ${stage.eligibleResidues}`).join("\n")}

| degree | real labels | real meanNorm | real endpoint norm | eligible meanNorm range | reducible meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: |
${tableField(q3)}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;

fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  integerEndpoint: integer.rows.at(-1).real,
  integerEndpointCompositeRange: integer.rows.at(-1).summary.composite.meanNorm,
  q2Endpoint: q2.rows.at(-1).real,
  q2EndpointReducibleRange: q2.rows.at(-1).summary.reducible.meanNorm,
  q3Endpoint: q3.rows.at(-1).real,
  q3EndpointReducibleRange: q3.rows.at(-1).summary.reducible.meanNorm,
}, null, 2));
