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
const seeds = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 112358, 141421, 173205, 223606,
  99991, 100003, 444444, 555555, 777777,
];
const shifts = [-30, -22, -14, -6, 6, 14, 22, 30];
const localMod = 3 * 3 * 5 * 5 * 7 * 7;
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(10, Math.round(maxN * f)));
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
  if (!values.length) return [NaN, NaN];
  return [Math.min(...values), Math.max(...values)];
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

function vectorNorm(values) {
  let s = 0;
  for (const v of values) s += v * v;
  return Math.sqrt(s);
}

function featureRows(vector, count, topN = 12) {
  const root = Math.sqrt(count || 1);
  return Array.from(vector, (value, index) => ({
    index,
    label: features[index].label,
    kind: features[index].kind,
    value,
    normalized: value / root,
  })).sort((a, b) => Math.abs(b.normalized) - Math.abs(a.normalized)).slice(0, topN);
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

function matchedCompositeLabels(labels, pools, fallback, modulus, seed) {
  const rnd = mulberry32(seed);
  return labels.map((n) => {
    const bucket = pools[n % modulus];
    const source = bucket.length ? bucket : fallback;
    return source[Math.floor(rnd() * source.length)];
  });
}

function scoreSequence(name, labels, mu, baselineRuns = null, endpointCounts = null) {
  const sorted = labels.filter((n) => n >= 31 && n <= maxN - 31 && n % 2 === 1).sort((a, b) => a - b);
  const endpointRows = [];
  const blockRows = [];
  const sum = new Float64Array(features.length);
  let blockSum = new Float64Array(features.length);
  let cursor = 0;
  let count = 0;
  let blockCount = 0;
  let blockStart = 1;
  const pushEndpoint = (N, targetCount = null) => {
    while (cursor < sorted.length && (targetCount == null ? sorted[cursor] <= N : count < targetCount)) {
      addFeatures(sum, stateForLabel(sorted[cursor], mu));
      addFeatures(blockSum, stateForLabel(sorted[cursor], mu));
      cursor++;
      count++;
      blockCount++;
    }
    const baseline = new Float64Array(features.length);
    const blockBaseline = new Float64Array(features.length);
    if (baselineRuns?.length) {
      for (const run of baselineRuns) {
        for (let k = 0; k < features.length; k++) {
          baseline[k] += run.endpointRows[endpointRows.length].sum[k] / baselineRuns.length;
          blockBaseline[k] += run.blockRows[blockRows.length].sum[k] / baselineRuns.length;
        }
      }
    }
    const residual = Array.from(sum, (v, k) => v - baseline[k]);
    const blockResidual = Array.from(blockSum, (v, k) => v - blockBaseline[k]);
    endpointRows.push({
      N,
      count,
      rawNorm: vectorNorm(sum),
      residualNorm: vectorNorm(residual),
      rawNormalized: count ? vectorNorm(sum) / Math.sqrt(count) : 0,
      residualNormalized: count ? vectorNorm(residual) / Math.sqrt(count) : 0,
      sum: Array.from(sum),
      residual,
      topResidual: featureRows(residual, count),
      topRaw: featureRows(sum, count),
    });
    blockRows.push({
      from: blockStart,
      to: N,
      count: blockCount,
      rawNorm: vectorNorm(blockSum),
      residualNorm: vectorNorm(blockResidual),
      rawNormalized: blockCount ? vectorNorm(blockSum) / Math.sqrt(blockCount) : 0,
      residualNormalized: blockCount ? vectorNorm(blockResidual) / Math.sqrt(blockCount) : 0,
      sum: Array.from(blockSum),
      residual: blockResidual,
    });
    blockStart = N;
    blockCount = 0;
    blockSum = new Float64Array(features.length);
  };
  for (let i = 0; i < endpoints.length; i++) pushEndpoint(endpoints[i], endpointCounts ? endpointCounts[i] : null);
  return { name, labels: sorted.length, endpointRows, blockRows };
}

function fitTheta(rows, key = "residualNorm") {
  const pts = rows.filter((r) => r[key] > 0 && r.N > 1);
  if (pts.length < 2) return NaN;
  const xs = pts.map((r) => Math.log(r.N));
  const ys = pts.map((r) => Math.log(Math.abs(r[key])));
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

function summarizeControls(runs, endpointIndex, key = "residualNormalized") {
  return {
    value: range(runs.map((r) => r.endpointRows[endpointIndex][key])),
    theta: range(runs.map((r) => fitTheta(r.endpointRows, key === "residualNormalized" ? "residualNorm" : "rawNorm"))),
  };
}

function blockRange(runs, blockIndex, key = "residualNormalized") {
  return range(runs.map((r) => r.blockRows[blockIndex][key]));
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
    ...real.endpointRows.map((r) => r.residualNormalized),
    ...families.flatMap((f) => f.runs.flatMap((run) => run.endpointRows.map((r) => r.residualNormalized))),
  ];
  const yMax = Math.max(1, ...allVals) * 1.15;
  const xAt = (i) => margin.left + (plotW * i) / (endpoints.length - 1);
  const yAt = (v) => margin.top + plotH - (v / yMax) * plotH;
  const colors = {
    real: "#67e8f9",
    cramer: "#f59e0b",
    w210: "#22c55e",
    composite: "#fb7185",
    localComposite: "#f472b6",
    selfShuffle: "#a78bfa",
  };
  const lines = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  lines.push(`<rect width="${W}" height="${H}" fill="#08111f"/>`);
  lines.push(`<text x="${margin.left}" y="38" fill="#e5e7eb" font-size="24" font-weight="700">Prime-centered squarefree window Walsh spectrum</text>`);
  lines.push(`<text x="${margin.left}" y="66" fill="#94a3b8" font-size="15">y=||Σ phi(prime centers)-mean local-composite baseline||₂ / sqrt(center count)</text>`);
  for (let g = 0; g <= 4; g++) {
    const y = margin.top + (plotH * g) / 4;
    const val = yMax * (1 - g / 4);
    lines.push(`<line x1="${margin.left}" x2="${W - margin.right}" y1="${y}" y2="${y}" stroke="#223044" stroke-width="1"/>`);
    lines.push(`<text x="${margin.left - 12}" y="${y + 5}" fill="#94a3b8" text-anchor="end" font-size="13">${fmt(val, 2)}</text>`);
  }
  for (const family of families) {
    for (const run of family.runs) {
      const dLine = run.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.residualNormalized)}`).join(" ");
      lines.push(`<path d="${dLine}" fill="none" stroke="${colors[family.key]}" stroke-width="1.5" opacity="0.34"/>`);
    }
  }
  const dReal = real.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.residualNormalized)}`).join(" ");
  lines.push(`<path d="${dReal}" fill="none" stroke="${colors.real}" stroke-width="4"/>`);
  real.endpointRows.forEach((r, i) => {
    lines.push(`<circle cx="${xAt(i)}" cy="${yAt(r.residualNormalized)}" r="5" fill="${colors.real}"/>`);
    lines.push(`<text x="${xAt(i)}" y="${margin.top + plotH + 24}" fill="#94a3b8" text-anchor="middle" font-size="12">${r.N}</text>`);
  });
  const legend = [
    ["real primes", colors.real],
    ["Cramer labels", colors.cramer],
    ["W210 labels", colors.w210],
    ["composites", colors.composite],
    ["local composites", colors.localComposite],
  ];
  legend.forEach(([label, color], i) => {
    const x = margin.left + (i % 3) * 270;
    const y = H - 62 + Math.floor(i / 3) * 24;
    lines.push(`<line x1="${x}" x2="${x + 24}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="4"/>`);
    lines.push(`<text x="${x + 30}" y="${y + 5}" fill="#cbd5e1" font-size="13">${label}</text>`);
  });
  const end = real.endpointRows.at(-1);
  lines.push(`<text x="${margin.left}" y="${H - 18}" fill="#cbd5e1" font-size="14">Endpoint count=${end.count}, residual/sqrt=${fmt(end.residualNormalized, 3)}, raw/sqrt=${fmt(end.rawNormalized, 3)}, theta=${fmt(fitTheta(real.endpointRows), 3)}</text>`);
  lines.push(`</svg>`);
  return lines.join("\n");
}

function markdownReport(data) {
  const lines = [];
  const last = data.real.endpointRows.length - 1;
  lines.push("# Prime-centered squarefree window Walsh spectrum audit", "");
  lines.push(`State shifts: ${JSON.stringify(shifts)}. Features: ${features.length} one/two-coordinate Walsh products. Main metric subtracts the mean of ${seeds.length} local-residue matched composite baselines.`, "");
  lines.push(`Range: ${maxN}. Seeds: ${seeds.join(", ")}. Local modulus: ${localMod}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | centers | real residual/sqrt | real raw/sqrt | Cramer residual | W210 residual | composite residual | local-composite residual |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.endpointRows.length; i++) {
    const r = data.real.endpointRows[i];
    lines.push(`| ${r.N} | ${r.count} | ${fmt(r.residualNormalized)} | ${fmt(r.rawNormalized)} | ${fmt(data.controlSummaries.cramer[i].value[0])}..${fmt(data.controlSummaries.cramer[i].value[1])} | ${fmt(data.controlSummaries.w210[i].value[0])}..${fmt(data.controlSummaries.w210[i].value[1])} | ${fmt(data.controlSummaries.composite[i].value[0])}..${fmt(data.controlSummaries.composite[i].value[1])} | ${fmt(data.controlSummaries.localComposite[i].value[0])}..${fmt(data.controlSummaries.localComposite[i].value[1])} |`);
  }
  lines.push("", "## Block residual norms", "");
  lines.push("| block | centers | real residual/sqrt | Cramer | W210 | composite | local-composite |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.blockRows.length; i++) {
    const b = data.real.blockRows[i];
    lines.push(`| (${b.from}, ${b.to}] | ${b.count} | ${fmt(b.residualNormalized)} | ${fmt(data.blockSummaries.cramer[i][0])}..${fmt(data.blockSummaries.cramer[i][1])} | ${fmt(data.blockSummaries.w210[i][0])}..${fmt(data.blockSummaries.w210[i][1])} | ${fmt(data.blockSummaries.composite[i][0])}..${fmt(data.blockSummaries.composite[i][1])} | ${fmt(data.blockSummaries.localComposite[i][0])}..${fmt(data.blockSummaries.localComposite[i][1])} |`);
  }
  lines.push("", "## Top endpoint residual features", "");
  lines.push("| feature | kind | value/sqrt | raw value/sqrt |");
  lines.push("| --- | --- | ---: | ---: |");
  const endpoint = data.real.endpointRows.at(-1);
  const root = Math.sqrt(endpoint.count || 1);
  for (const row of data.real.endpointRows.at(-1).topResidual) {
    lines.push(`| ${row.label} | ${row.kind} | ${fmt(row.normalized)} | ${fmt(endpoint.sum[row.index] / root)} |`);
  }
  lines.push("", "## Function-field unordered shell Walsh check", "");
  lines.push("| q | degree | shifts | irreducibles | feature count | norm/sqrt |");
  lines.push("| ---: | ---: | --- | ---: | ---: | ---: |");
  for (const row of data.functionFieldRows) {
    lines.push(`| ${row.q} | ${row.degree} | ${row.shifts.join(",")} | ${row.count} | ${row.featureCount} | ${fmt(row.normNormalized)} |`);
  }
  lines.push("", "## Summary", "");
  lines.push(`Real residual theta: \`${fmt(fitTheta(data.real.endpointRows))}\`.`);
  lines.push(`Endpoint Cramer residual/sqrt range: \`${fmt(data.controlSummaries.cramer[last].value[0])}..${fmt(data.controlSummaries.cramer[last].value[1])}\`.`);
  lines.push(`Endpoint W210 residual/sqrt range: \`${fmt(data.controlSummaries.w210[last].value[0])}..${fmt(data.controlSummaries.w210[last].value[1])}\`.`);
  lines.push(`Endpoint composite residual/sqrt range: \`${fmt(data.controlSummaries.composite[last].value[0])}..${fmt(data.controlSummaries.composite[last].value[1])}\`.`);
  lines.push(`Endpoint local-composite residual/sqrt range: \`${fmt(data.controlSummaries.localComposite[last].value[0])}..${fmt(data.controlSummaries.localComposite[last].value[1])}\`.`);
  lines.push("", "## Factor check", "");
  lines.push("This is a distributional statistic, not an adjacent-prime transition, so the overlap and near-overlap gap kernels from Cycles 68-69 are not available. The main remaining breakers are local squarefree density mismatch, feature-count norm inflation, and one-coordinate local factors dominating the residual. A survivor must beat local-residue matched composites and not be concentrated in one-coordinate features.");
  lines.push("", "## Files", "");
  lines.push(`- JSON: \`${data.jsonPath}\``);
  lines.push(`- SVG: \`${data.svgPath}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const mu = mobiusUpTo(maxN + Math.max(...shifts.map((h) => Math.abs(h))) + 16);
const isp = sieve(maxN);
const realLabels = primesUpTo(maxN).filter((n) => n >= 31 && n <= maxN - 31);
const { pools: compositeResiduePools, fallback: compositeResidueFallback } = buildCompositeResiduePools(maxN, isp, localMod);
const localBaselineRuns = seeds.map((seed) => {
  const labels = matchedCompositeLabels(realLabels, compositeResiduePools, compositeResidueFallback, localMod, seed);
  return scoreSequence(`local-baseline-${seed}`, labels, mu, null, null);
});
const endpointCounts = localBaselineRuns[0].endpointRows.map((_, i) => {
  // Real endpoint counts are authoritative for local matched baselines.
  const N = endpoints[i];
  return realLabels.filter((n) => n <= N).length;
});
const real = scoreSequence("real", realLabels, mu, localBaselineRuns);
const realEndpointCounts = real.endpointRows.map((r) => r.count);

const cramerRuns = seeds.map((seed) => {
  const labels = cramerPrimes(maxN, seed).filter((n) => n >= 31 && n <= maxN - 31 && n % 2 === 1);
  return scoreSequence(`cramer-${seed}`, labels, mu, localBaselineRuns);
});
const w210Runs = seeds.map((seed) => {
  const labels = w210FakeLabels(maxN, seed).filter((n) => n >= 31 && n <= maxN - 31 && n % 2 === 1);
  return scoreSequence(`w210-${seed}`, labels, mu, localBaselineRuns);
});
const compositePool = [];
for (let n = 35; n <= maxN - 31; n += 2) {
  if (!isp[n] && gcd(n, 210) === 1) compositePool.push(n);
}
const compositeRuns = seeds.map((seed) => scoreSequence(`composite-${seed}`, sampleSorted(compositePool, realLabels.length, seed), mu, localBaselineRuns));
const localCompositeRuns = seeds.map((seed) => {
  const labels = matchedCompositeLabels(realLabels, compositeResiduePools, compositeResidueFallback, localMod, seed);
  return scoreSequence(`local-composite-${seed}`, labels, mu, localBaselineRuns, realEndpointCounts);
});

const families = [
  { key: "cramer", runs: cramerRuns },
  { key: "w210", runs: w210Runs },
  { key: "composite", runs: compositeRuns },
  { key: "localComposite", runs: localCompositeRuns },
];

const controlSummaries = Object.fromEntries(
  families.map((family) => [
    family.key,
    endpoints.map((_, i) => summarizeControls(family.runs, i)),
  ]),
);
const blockSummaries = Object.fromEntries(
  families.map((family) => [
    family.key,
    endpoints.map((_, i) => blockRange(family.runs, i)),
  ]),
);
const functionFieldRows = ffSpecs.flatMap(({ q, degree }) => functionFieldWalshRows(q, degree));

const baseName = `squarefree-window-walsh-spectrum-${maxN}`;
const jsonPath = path.join(outDir, `${baseName}.json`);
const mdPath = path.join(outDir, `${baseName}.md`);
const svgPath = path.join(outDir, `${baseName}.svg`);
const data = {
  maxN,
  shifts,
  featureCount: features.length,
  seeds,
  endpoints,
  localMod,
  ffSpecs,
  real,
  localBaselineRuns,
  cramerRuns,
  w210Runs,
  compositeRuns,
  localCompositeRuns,
  controlSummaries,
  blockSummaries,
  functionFieldRows,
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
    residualNormalized: real.endpointRows.at(-1).residualNormalized,
    rawNormalized: real.endpointRows.at(-1).rawNormalized,
    topResidual: real.endpointRows.at(-1).topResidual.slice(0, 8),
  },
  theta: {
    residual: fitTheta(real.endpointRows),
  },
  summary: {
    cramer: controlSummaries.cramer.at(-1),
    w210: controlSummaries.w210.at(-1),
    composite: controlSummaries.composite.at(-1),
    localComposite: controlSummaries.localComposite.at(-1),
  },
  functionFieldEndpoint: functionFieldRows.filter((r) => ffSpecs.some((s) => s.q === r.q && s.degree === r.degree)),
}, null, 2));
