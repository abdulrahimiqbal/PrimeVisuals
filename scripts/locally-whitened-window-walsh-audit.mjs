#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polynomialMobius,
} from "../src/core/ffield.js";
import { cramerPrimes, mobiusUpTo, oddPartValue, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(1000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/playground-artifacts";
const shifts = [-30, -22, -14, -6, 6, 14, 22, 30];
const localMod = 3 * 3 * 5 * 5 * 7 * 7;
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(10, Math.round(maxN * f)));
const trainSeeds = [
  12345, 271828, 314159, 161803, 424242, 8675309, 112358, 141421,
  173205, 223606, 99991, 100003, 444444, 555555, 777777, 202403,
  202404, 202405, 202406, 202407, 202408, 202409, 202410, 202411,
  202412, 202413, 202414, 202415, 202416, 202417, 202418, 202419,
  202420, 202421, 202422, 202423, 202424, 202425, 202426, 202427,
  202428, 202429, 202430, 202431, 202432, 202433, 202434, 202435,
];
const holdoutSeeds = [
  606060, 707070, 808080, 909090, 101010, 121212, 131313, 141414,
  151515, 161616, 171717, 181818, 191919, 202020, 212121,
];
const ffSpecs = [
  { q: 3, degree: 12 },
  { q: 5, degree: 8 },
];

const features = [];
for (let i = 0; i < shifts.length; i++) features.push({ kind: "one", i, j: -1, label: `${shifts[i]}` });
for (let i = 0; i < shifts.length; i++) {
  for (let j = i + 1; j < shifts.length; j++) {
    features.push({ kind: "two", i, j, label: `${shifts[i]}*${shifts[j]}` });
  }
}

function mulberry32(seed) {
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
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function range(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length ? [Math.min(...usable), Math.max(...usable)] : [NaN, NaN];
}

function fmt(x, digits = 6) {
  return Number.isFinite(x) ? x.toFixed(digits) : "NA";
}

function stateForLabel(n, mu) {
  const out = new Int8Array(shifts.length);
  for (let i = 0; i < shifts.length; i++) {
    const m = n + shifts[i];
    out[i] = m >= 1 && m < mu.length ? (mu[oddPartValue(m)] || 0) : 0;
  }
  return out;
}

function addFeatures(sum, state, scale = 1) {
  for (let k = 0; k < features.length; k++) {
    const f = features[k];
    const v = f.kind === "one" ? state[f.i] : state[f.i] * state[f.j];
    sum[k] += scale * v;
  }
}

function featureVector(n, mu) {
  const sum = new Float64Array(features.length);
  addFeatures(sum, stateForLabel(n, mu));
  return Array.from(sum);
}

function vectorNorm(values) {
  let s = 0;
  for (const v of values) s += v * v;
  return Math.sqrt(s);
}

function buildCompositeResiduePools(N, isp, modulus) {
  const pools = Array.from({ length: modulus }, () => []);
  const fallback = [];
  for (let n = 35; n <= N; n += 2) {
    if (isp[n]) continue;
    fallback.push(n);
    pools[n % modulus].push(n);
  }
  return { pools, fallback };
}

function matchedCompositeLabelsInPrimeOrder(labels, pools, fallback, modulus, seed) {
  const rnd = mulberry32(seed);
  return labels.map((n) => {
    const bucket = pools[n % modulus];
    const source = bucket.length ? bucket : fallback;
    return source[Math.floor(rnd() * source.length)];
  });
}

function sampleSorted(items, k, seed) {
  const rnd = mulberry32(seed);
  const reservoir = [];
  for (let i = 0; i < items.length; i++) {
    if (i < k) {
      reservoir.push(items[i]);
      continue;
    }
    const j = Math.floor(rnd() * (i + 1));
    if (j < k) reservoir[j] = items[i];
  }
  return reservoir.sort((a, b) => a - b);
}

function w210FakeLabels(N, seed) {
  const rnd = mulberry32(seed);
  const out = [11];
  const densityMultiplier = 210 / 48;
  for (let n = 13; n <= N; n += 2) {
    if (gcd(n, 210) !== 1) continue;
    if (rnd() < Math.min(1, densityMultiplier / Math.log(n))) out.push(n);
  }
  return out;
}

function scoreByCount(name, labelsInOrder, mu, targetCounts) {
  const usable = labelsInOrder.filter((n) => n >= 31 && n <= maxN - 31 && n % 2 === 1);
  const endpointRows = [];
  const sum = new Float64Array(features.length);
  let cursor = 0;
  for (let i = 0; i < endpoints.length; i++) {
    const target = targetCounts[i];
    while (cursor < usable.length && cursor < target) {
      addFeatures(sum, stateForLabel(usable[cursor], mu));
      cursor++;
    }
    endpointRows.push({
      N: endpoints[i],
      count: cursor,
      sum: Array.from(sum),
    });
  }
  return { name, labels: usable.length, endpointRows };
}

function scoreSortedByEndpoint(name, labels, mu) {
  const usable = labels.filter((n) => n >= 31 && n <= maxN - 31 && n % 2 === 1).sort((a, b) => a - b);
  const endpointRows = [];
  const sum = new Float64Array(features.length);
  let cursor = 0;
  for (const N of endpoints) {
    while (cursor < usable.length && usable[cursor] <= N) {
      addFeatures(sum, stateForLabel(usable[cursor], mu));
      cursor++;
    }
    endpointRows.push({
      N,
      count: cursor,
      sum: Array.from(sum),
    });
  }
  return { name, labels: usable.length, endpointRows };
}

function fitTheta(rows, key) {
  const pts = rows.filter((r) => r[key] > 0 && r.N > 1);
  if (pts.length < 2) return NaN;
  const xs = pts.map((r) => Math.log(r.N));
  const ys = pts.map((r) => Math.log(r[key]));
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : NaN;
}

function covarianceWhiteners(trainingRuns) {
  const dim = features.length;
  const out = [];
  for (let ep = 0; ep < endpoints.length; ep++) {
    const vectors = trainingRuns.map((run) => run.endpointRows[ep].sum);
    const mean = new Float64Array(dim);
    for (const v of vectors) for (let i = 0; i < dim; i++) mean[i] += v[i] / vectors.length;
    const cov = Array.from({ length: dim }, () => new Float64Array(dim));
    for (const v of vectors) {
      for (let i = 0; i < dim; i++) {
        const di = v[i] - mean[i];
        for (let j = 0; j <= i; j++) {
          cov[i][j] += (di * (v[j] - mean[j])) / Math.max(1, vectors.length - 1);
        }
      }
    }
    for (let i = 0; i < dim; i++) for (let j = 0; j < i; j++) cov[j][i] = cov[i][j];
    out.push(makeWhitener(mean, cov));
  }
  return out;
}

function makeWhitener(mean, cov) {
  const dim = cov.length;
  const shrink = 0.35;
  let trace = 0;
  for (let i = 0; i < dim; i++) trace += Math.max(0, cov[i][i]);
  const avgVar = trace / Math.max(1, dim);
  for (const ridgeScale of [1e-8, 1e-7, 1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1]) {
    const matrix = Array.from({ length: dim }, (_, i) => {
      const row = new Float64Array(dim);
      for (let j = 0; j < dim; j++) {
        row[j] = i === j ? cov[i][i] + ridgeScale * (avgVar || 1) : (1 - shrink) * cov[i][j];
      }
      return row;
    });
    const chol = cholesky(matrix);
    if (chol) {
      return { mean: Array.from(mean), covDiag: Array.from(matrix, (row, i) => row[i]), chol, ridgeScale, shrink };
    }
  }
  throw new Error("could not regularize covariance");
}

function cholesky(matrix) {
  const n = matrix.length;
  const l = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = matrix[i][j];
      for (let k = 0; k < j; k++) sum -= l[i][k] * l[j][k];
      if (i === j) {
        if (!(sum > 0) || !Number.isFinite(sum)) return null;
        l[i][j] = Math.sqrt(sum);
      } else {
        l[i][j] = sum / l[j][j];
      }
    }
  }
  return l;
}

function solveCholesky(l, b) {
  const n = l.length;
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = b[i];
    for (let k = 0; k < i; k++) sum -= l[i][k] * y[k];
    y[i] = sum / l[i][i];
  }
  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i];
    for (let k = i + 1; k < n; k++) sum -= l[k][i] * x[k];
    x[i] = sum / l[i][i];
  }
  return x;
}

function evaluateRun(run, whiteners) {
  return {
    ...run,
    endpointRows: run.endpointRows.map((row, ep) => {
      const whitener = whiteners[ep];
      const residual = row.sum.map((v, i) => v - whitener.mean[i]);
      const solved = solveCholesky(whitener.chol, residual);
      let quad = 0;
      let maxZ = 0;
      let maxIndex = 0;
      const zScores = residual.map((value, i) => value / Math.sqrt(Math.max(1e-12, whitener.covDiag[i])));
      for (let i = 0; i < residual.length; i++) {
        quad += residual[i] * solved[i];
        const z = Math.abs(zScores[i]);
        if (z > maxZ) {
          maxZ = z;
          maxIndex = i;
        }
      }
      const topZ = zScores.map((z, index) => ({
        index,
        label: features[index].label,
        kind: features[index].kind,
        z,
      })).sort((a, b) => Math.abs(b.z) - Math.abs(a.z)).slice(0, 12);
      return {
        ...row,
        rawResidualNorm: vectorNorm(residual),
        whitenedNorm: Math.sqrt(Math.max(0, quad)),
        maxZ,
        maxFeature: features[maxIndex].label,
        maxFeatureKind: features[maxIndex].kind,
        residual,
        topZ,
      };
    }),
  };
}

function summarizeRuns(runs, endpointIndex) {
  return {
    count: range(runs.map((r) => r.endpointRows[endpointIndex].count)),
    whitenedNorm: range(runs.map((r) => r.endpointRows[endpointIndex].whitenedNorm)),
    maxZ: range(runs.map((r) => r.endpointRows[endpointIndex].maxZ)),
    rawResidualNorm: range(runs.map((r) => r.endpointRows[endpointIndex].rawResidualNorm)),
    thetaWhitened: range(runs.map((r) => fitTheta(r.endpointRows, "whitenedNorm"))),
    thetaRaw: range(runs.map((r) => fitTheta(r.endpointRows, "rawResidualNorm"))),
  };
}

function functionFieldWalshRows(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const constShifts = Array.from({ length: q - 1 }, (_, i) => i + 1);
  const rows = [];
  for (let degree = 1; degree <= maxDegree; degree++) {
    const polys = universe.irreduciblesByDegree[degree];
    const dim = constShifts.length;
    const ffFeatures = [];
    for (let i = 0; i < dim; i++) ffFeatures.push([i, -1]);
    for (let i = 0; i < dim; i++) for (let j = i + 1; j < dim; j++) ffFeatures.push([i, j]);
    const sum = new Float64Array(ffFeatures.length);
    for (const f of polys) {
      const state = constShifts.map((c) => polynomialMobius(polyAdd(f, c, q), universe));
      for (let k = 0; k < ffFeatures.length; k++) {
        const [i, j] = ffFeatures[k];
        sum[k] += j < 0 ? state[i] : state[i] * state[j];
      }
    }
    rows.push({
      q,
      degree,
      shifts: constShifts,
      count: polys.length,
      featureCount: ffFeatures.length,
      normNormalized: polys.length ? vectorNorm(sum) / Math.sqrt(polys.length) : 0,
    });
  }
  return rows;
}

function makeSvg(real, families) {
  const W = 1120;
  const H = 780;
  const margin = { left: 92, right: 40, top: 92, bottom: 118 };
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;
  const allVals = [
    ...real.endpointRows.map((r) => r.whitenedNorm),
    ...families.flatMap((f) => f.runs.flatMap((run) => run.endpointRows.map((r) => r.whitenedNorm))),
  ];
  const yMax = Math.max(1, ...allVals) * 1.15;
  const xAt = (i) => margin.left + (plotW * i) / (endpoints.length - 1);
  const yAt = (v) => margin.top + plotH - (v / yMax) * plotH;
  const colors = {
    real: "#67e8f9",
    localHoldout: "#f472b6",
    cramer: "#f59e0b",
    w210: "#22c55e",
    composite: "#fb7185",
  };
  const lines = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  lines.push(`<rect width="${W}" height="${H}" fill="#08111f"/>`);
  lines.push(`<text x="${margin.left}" y="38" fill="#e5e7eb" font-size="24" font-weight="700">Locally whitened squarefree window Walsh residual</text>`);
  lines.push(`<text x="${margin.left}" y="66" fill="#94a3b8" font-size="15">y=sqrt((S-mean_local)^T C_local^-1 (S-mean_local)); trained on matched composites, tested on holdouts</text>`);
  for (let g = 0; g <= 4; g++) {
    const y = margin.top + (plotH * g) / 4;
    const val = yMax * (1 - g / 4);
    lines.push(`<line x1="${margin.left}" x2="${W - margin.right}" y1="${y}" y2="${y}" stroke="#223044" stroke-width="1"/>`);
    lines.push(`<text x="${margin.left - 12}" y="${y + 5}" fill="#94a3b8" text-anchor="end" font-size="13">${fmt(val, 2)}</text>`);
  }
  for (const family of families) {
    for (const run of family.runs) {
      const dLine = run.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.whitenedNorm)}`).join(" ");
      lines.push(`<path d="${dLine}" fill="none" stroke="${colors[family.key]}" stroke-width="1.5" opacity="0.34"/>`);
    }
  }
  const dReal = real.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.whitenedNorm)}`).join(" ");
  lines.push(`<path d="${dReal}" fill="none" stroke="${colors.real}" stroke-width="4"/>`);
  real.endpointRows.forEach((r, i) => {
    lines.push(`<circle cx="${xAt(i)}" cy="${yAt(r.whitenedNorm)}" r="5" fill="${colors.real}"/>`);
    lines.push(`<text x="${xAt(i)}" y="${margin.top + plotH + 24}" fill="#94a3b8" text-anchor="middle" font-size="12">${r.N}</text>`);
  });
  const legend = [
    ["real primes", colors.real],
    ["local holdout", colors.localHoldout],
    ["Cramer labels", colors.cramer],
    ["W210 labels", colors.w210],
    ["count-matched composites", colors.composite],
  ];
  legend.forEach(([label, color], i) => {
    const x = margin.left + (i % 3) * 292;
    const y = H - 62 + Math.floor(i / 3) * 24;
    lines.push(`<line x1="${x}" x2="${x + 24}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="4"/>`);
    lines.push(`<text x="${x + 30}" y="${y + 5}" fill="#cbd5e1" font-size="13">${label}</text>`);
  });
  const end = real.endpointRows.at(-1);
  lines.push(`<text x="${margin.left}" y="${H - 18}" fill="#cbd5e1" font-size="14">Endpoint count=${end.count}, W=${fmt(end.whitenedNorm, 3)}, Zmax=${fmt(end.maxZ, 3)} (${end.maxFeature}), thetaW=${fmt(fitTheta(real.endpointRows, "whitenedNorm"), 3)}</text>`);
  lines.push(`</svg>`);
  return lines.join("\n");
}

function markdownReport(data) {
  const lines = [];
  const last = data.real.endpointRows.length - 1;
  lines.push("# Locally whitened window Walsh residual audit", "");
  lines.push(`State shifts: ${JSON.stringify(shifts)}. Features: ${features.length} one/two-coordinate Walsh products. Local covariance is trained on ${trainSeeds.length} prime-prefix matched composite runs and tested against ${holdoutSeeds.length} heldout seeds.`, "");
  lines.push(`Range: ${maxN}. Local modulus: ${localMod}. Shrinkage: off-diagonal factor ${1 - data.whiteners[0].shrink}; endpoint ridge scales ${data.whiteners.map((w) => w.ridgeScale).join(", ")}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | centers | real W | real Zmax | top feature | local-holdout W | Cramer W | W210 W | composite W |");
  lines.push("| ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.endpointRows.length; i++) {
    const r = data.real.endpointRows[i];
    lines.push(`| ${r.N} | ${r.count} | ${fmt(r.whitenedNorm)} | ${fmt(r.maxZ)} | ${r.maxFeature} | ${fmt(data.controlSummaries.localHoldout[i].whitenedNorm[0])}..${fmt(data.controlSummaries.localHoldout[i].whitenedNorm[1])} | ${fmt(data.controlSummaries.cramer[i].whitenedNorm[0])}..${fmt(data.controlSummaries.cramer[i].whitenedNorm[1])} | ${fmt(data.controlSummaries.w210[i].whitenedNorm[0])}..${fmt(data.controlSummaries.w210[i].whitenedNorm[1])} | ${fmt(data.controlSummaries.composite[i].whitenedNorm[0])}..${fmt(data.controlSummaries.composite[i].whitenedNorm[1])} |`);
  }
  lines.push("", "## Max-coordinate trace", "");
  lines.push("| N | real Zmax | local-holdout Zmax | Cramer Zmax | W210 Zmax | composite Zmax |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.endpointRows.length; i++) {
    const r = data.real.endpointRows[i];
    lines.push(`| ${r.N} | ${fmt(r.maxZ)} | ${fmt(data.controlSummaries.localHoldout[i].maxZ[0])}..${fmt(data.controlSummaries.localHoldout[i].maxZ[1])} | ${fmt(data.controlSummaries.cramer[i].maxZ[0])}..${fmt(data.controlSummaries.cramer[i].maxZ[1])} | ${fmt(data.controlSummaries.w210[i].maxZ[0])}..${fmt(data.controlSummaries.w210[i].maxZ[1])} | ${fmt(data.controlSummaries.composite[i].maxZ[0])}..${fmt(data.controlSummaries.composite[i].maxZ[1])} |`);
  }
  lines.push("", "## Top endpoint whitened coordinates", "");
  lines.push("| feature | kind | z |");
  lines.push("| --- | --- | ---: |");
  for (const row of data.real.endpointRows.at(-1).topZ) {
    lines.push(`| ${row.label} | ${row.kind} | ${fmt(row.z)} |`);
  }
  lines.push("", "## Summary", "");
  lines.push(`Real whitened-norm theta: \`${fmt(fitTheta(data.real.endpointRows, "whitenedNorm"))}\`.`);
  lines.push(`Real raw-residual theta: \`${fmt(fitTheta(data.real.endpointRows, "rawResidualNorm"))}\`.`);
  lines.push(`Endpoint local-holdout W range: \`${fmt(data.controlSummaries.localHoldout[last].whitenedNorm[0])}..${fmt(data.controlSummaries.localHoldout[last].whitenedNorm[1])}\`.`);
  lines.push(`Endpoint Cramer W range: \`${fmt(data.controlSummaries.cramer[last].whitenedNorm[0])}..${fmt(data.controlSummaries.cramer[last].whitenedNorm[1])}\`.`);
  lines.push(`Endpoint W210 W range: \`${fmt(data.controlSummaries.w210[last].whitenedNorm[0])}..${fmt(data.controlSummaries.w210[last].whitenedNorm[1])}\`.`);
  lines.push(`Endpoint composite W range: \`${fmt(data.controlSummaries.composite[last].whitenedNorm[0])}..${fmt(data.controlSummaries.composite[last].whitenedNorm[1])}\`.`);
  lines.push("", "## Named composite check", "");
  lines.push("| n | is prime | state | feature norm |");
  lines.push("| ---: | --- | --- | ---: |");
  for (const row of data.namedCompositeChecks) {
    lines.push(`| ${row.n} | ${row.isPrime ? "yes" : "no"} | ${row.state.join(",")} | ${fmt(row.featureNorm)} |`);
  }
  lines.push("", "## Function-field unordered shell Walsh check", "");
  lines.push("| q | degree | shifts | irreducibles | feature count | norm/sqrt |");
  lines.push("| ---: | ---: | --- | ---: | ---: | ---: |");
  for (const row of data.functionFieldRows) {
    lines.push(`| ${row.q} | ${row.degree} | ${row.shifts.join(",")} | ${row.count} | ${row.featureCount} | ${fmt(row.normNormalized)} |`);
  }
  lines.push("", "## Factor check", "");
  lines.push("This statistic is still transport-free: no consecutive-prime shifted integer can overlap. The new failure modes are covariance overfit, shrinkage dependence, and multiple-testing rotation in the top z-coordinate. A survivor must beat heldout local composites after the training covariance is fixed.");
  lines.push("", "## Files", "");
  lines.push(`- JSON: \`${data.jsonPath}\``);
  lines.push(`- SVG: \`${data.svgPath}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const mu = mobiusUpTo(maxN + Math.max(...shifts.map((h) => Math.abs(h))) + 16);
const isp = sieve(maxN);
const realLabels = primesUpTo(maxN).filter((n) => n >= 31 && n <= maxN - 31);
const targetCounts = endpoints.map((N) => realLabels.filter((n) => n <= N).length);
const { pools: compositeResiduePools, fallback: compositeResidueFallback } = buildCompositeResiduePools(maxN, isp, localMod);

const trainingRuns = trainSeeds.map((seed) => {
  const labels = matchedCompositeLabelsInPrimeOrder(realLabels, compositeResiduePools, compositeResidueFallback, localMod, seed);
  return scoreByCount(`local-train-${seed}`, labels, mu, targetCounts);
});
const whiteners = covarianceWhiteners(trainingRuns);

const real = evaluateRun(scoreByCount("real", realLabels, mu, targetCounts), whiteners);
const localHoldoutRuns = holdoutSeeds.map((seed) => {
  const labels = matchedCompositeLabelsInPrimeOrder(realLabels, compositeResiduePools, compositeResidueFallback, localMod, seed);
  return evaluateRun(scoreByCount(`local-holdout-${seed}`, labels, mu, targetCounts), whiteners);
});
const cramerRuns = holdoutSeeds.map((seed) => {
  const labels = cramerPrimes(maxN, seed).filter((n) => n >= 31 && n <= maxN - 31 && n % 2 === 1);
  return evaluateRun(scoreSortedByEndpoint(`cramer-${seed}`, labels, mu), whiteners);
});
const w210Runs = holdoutSeeds.map((seed) => {
  const labels = w210FakeLabels(maxN, seed).filter((n) => n >= 31 && n <= maxN - 31 && n % 2 === 1);
  return evaluateRun(scoreSortedByEndpoint(`w210-${seed}`, labels, mu), whiteners);
});
const compositePool = [];
for (let n = 35; n <= maxN - 31; n += 2) {
  if (!isp[n] && gcd(n, 210) === 1) compositePool.push(n);
}
const compositeRuns = holdoutSeeds.map((seed) => {
  const labels = sampleSorted(compositePool, realLabels.length, seed);
  return evaluateRun(scoreByCount(`composite-${seed}`, labels, mu, targetCounts), whiteners);
});

const families = [
  { key: "localHoldout", runs: localHoldoutRuns },
  { key: "cramer", runs: cramerRuns },
  { key: "w210", runs: w210Runs },
  { key: "composite", runs: compositeRuns },
];
const controlSummaries = Object.fromEntries(
  families.map((family) => [
    family.key,
    endpoints.map((_, i) => summarizeRuns(family.runs, i)),
  ]),
);
const functionFieldRows = ffSpecs.flatMap(({ q, degree }) => functionFieldWalshRows(q, degree));
const namedCompositeChecks = [25, 35, 77].map((n) => {
  const state = Array.from(stateForLabel(n, mu));
  return {
    n,
    isPrime: Boolean(isp[n]),
    state,
    featureNorm: vectorNorm(featureVector(n, mu)),
  };
});

const baseName = `locally-whitened-window-walsh-${maxN}`;
const jsonPath = path.join(outDir, `${baseName}.json`);
const mdPath = path.join(outDir, `${baseName}.md`);
const svgPath = path.join(outDir, `${baseName}.svg`);
const data = {
  maxN,
  shifts,
  featureCount: features.length,
  trainSeeds,
  holdoutSeeds,
  endpoints,
  targetCounts,
  localMod,
  ffSpecs,
  real,
  localHoldoutRuns,
  cramerRuns,
  w210Runs,
  compositeRuns,
  controlSummaries,
  functionFieldRows,
  namedCompositeChecks,
  whiteners: whiteners.map((w) => ({
    mean: w.mean,
    covDiag: w.covDiag,
    ridgeScale: w.ridgeScale,
    shrink: w.shrink,
  })),
  jsonPath,
  mdPath,
  svgPath,
};

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(svgPath, makeSvg(real, families));
fs.writeFileSync(mdPath, markdownReport(data));

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  endpoint: {
    N: real.endpointRows.at(-1).N,
    count: real.endpointRows.at(-1).count,
    whitenedNorm: real.endpointRows.at(-1).whitenedNorm,
    maxZ: real.endpointRows.at(-1).maxZ,
    maxFeature: real.endpointRows.at(-1).maxFeature,
    topZ: real.endpointRows.at(-1).topZ.slice(0, 8),
  },
  theta: {
    whitened: fitTheta(real.endpointRows, "whitenedNorm"),
    rawResidual: fitTheta(real.endpointRows, "rawResidualNorm"),
  },
  summary: {
    localHoldout: controlSummaries.localHoldout.at(-1),
    cramer: controlSummaries.cramer.at(-1),
    w210: controlSummaries.w210.at(-1),
    composite: controlSummaries.composite.at(-1),
  },
  namedCompositeChecks,
  functionFieldEndpoint: functionFieldRows.filter((r) => ffSpecs.some((s) => s.q === r.q && s.degree === r.degree)),
}, null, 2));
