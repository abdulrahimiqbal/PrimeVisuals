import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, eulerQuotientValue, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(1000, Number.parseInt(process.argv[2] || "2000000", 10));
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const base = 2;
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(3, Math.round(maxN * f)));

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

function totientTable(N) {
  const phi = new Int32Array(N + 1);
  for (let i = 0; i <= N; i++) phi[i] = i;
  for (let p = 2; p <= N; p++) {
    if (phi[p] !== p) continue;
    for (let j = p; j <= N; j += p) phi[j] -= Math.floor(phi[j] / p);
  }
  return phi;
}

function range(values) {
  if (!values.length) return [NaN, NaN];
  return [Math.min(...values), Math.max(...values)];
}

function fmt(x, digits = 6) {
  return Number.isFinite(x) ? x.toFixed(digits) : "NA";
}

function tailProbability(n) {
  return Math.min(1, 2 / Math.sqrt(n));
}

function eulerTailHit(n, phi, b = base) {
  if (gcd(n, b) !== 1) return null;
  const q = eulerQuotientValue(n, b, phi[n] || 0);
  if (!Number.isFinite(q)) return null;
  const folded = Math.min(q, n - q);
  return {
    hit: folded <= Math.sqrt(n) ? 1 : 0,
    q,
    folded,
    scaled: folded / Math.sqrt(n),
  };
}

function scoreLabels(name, labels, phi, valueFactory) {
  const sorted = labels.filter((n) => n >= 3 && n <= maxN && gcd(n, base) === 1).sort((a, b) => a - b);
  const endpointRows = [];
  const blockRows = [];
  let cursor = 0;
  let count = 0;
  let hits = 0;
  let expected = 0;
  let variance = 0;
  let residual = 0;
  let maxAbsResidual = 0;
  let zeros = 0;
  let blockStart = 1;
  let blockCount = 0;
  let blockHits = 0;
  let blockExpected = 0;
  let blockVariance = 0;
  const pushEndpoint = (N) => {
    while (cursor < sorted.length && sorted[cursor] <= N) {
      const n = sorted[cursor++];
      const p = tailProbability(n);
      const event = valueFactory ? valueFactory(n, count, p) : eulerTailHit(n, phi, base);
      if (!event) {
        zeros++;
        continue;
      }
      count++;
      blockCount++;
      hits += event.hit;
      blockHits += event.hit;
      expected += p;
      blockExpected += p;
      variance += p * (1 - p);
      blockVariance += p * (1 - p);
      residual += event.hit - p;
      maxAbsResidual = Math.max(maxAbsResidual, Math.abs(residual));
    }
    endpointRows.push({
      N,
      count,
      hits,
      expected,
      variance,
      zeros,
      residual,
      normalized: variance > 0 ? residual / Math.sqrt(variance) : 0,
      maxAbsResidual,
      maxAbsNormalized: variance > 0 ? maxAbsResidual / Math.sqrt(variance) : 0,
    });
    const blockResidual = blockHits - blockExpected;
    blockRows.push({
      from: blockStart,
      to: N,
      count: blockCount,
      hits: blockHits,
      expected: blockExpected,
      variance: blockVariance,
      residual: blockResidual,
      normalized: blockVariance > 0 ? blockResidual / Math.sqrt(blockVariance) : 0,
    });
    blockStart = N;
    blockCount = 0;
    blockHits = 0;
    blockExpected = 0;
    blockVariance = 0;
  };
  for (const N of endpoints) pushEndpoint(N);
  return { name, labels: sorted.length, endpointRows, blockRows };
}

function fitTheta(rows, key = "maxAbsResidual") {
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

function randomQuotientRun(labels, seed) {
  const rnd = mulberry32(seed);
  return scoreLabels(`randomQuotient-${seed}`, labels, null, (n) => {
    const q = Math.floor(rnd() * n);
    const folded = Math.min(q, n - q);
    return { hit: folded <= Math.sqrt(n) ? 1 : 0 };
  });
}

function summarizeControls(runs, endpointIndex) {
  return {
    normalized: range(runs.map((r) => r.endpointRows[endpointIndex].normalized)),
    maxAbsNormalized: range(runs.map((r) => r.endpointRows[endpointIndex].maxAbsNormalized)),
    hits: range(runs.map((r) => r.endpointRows[endpointIndex].hits)),
    theta: range(runs.map((r) => fitTheta(r.endpointRows))),
  };
}

function blockRange(runs, blockIndex) {
  return range(runs.map((r) => r.blockRows[blockIndex].normalized));
}

function makeSvg(real, families) {
  const W = 1040;
  const H = 780;
  const margin = { left: 90, right: 40, top: 92, bottom: 112 };
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;
  const allVals = [
    ...real.endpointRows.map((r) => r.maxAbsNormalized),
    ...families.flatMap((f) => f.runs.flatMap((run) => run.endpointRows.map((r) => r.maxAbsNormalized))),
  ];
  const yMax = Math.max(1, ...allVals) * 1.14;
  const xAt = (i) => margin.left + (plotW * i) / (endpoints.length - 1);
  const yAt = (v) => margin.top + plotH - (v / yMax) * plotH;
  const colors = {
    real: "#67e8f9",
    randomQuotient: "#a78bfa",
    cramer: "#f59e0b",
    w210: "#22c55e",
    composite: "#fb7185",
  };
  const lines = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  lines.push(`<rect width="${W}" height="${H}" fill="#08111f"/>`);
  lines.push(`<text x="${margin.left}" y="38" fill="#e5e7eb" font-size="24" font-weight="700">Near-Wieferich Euler quotient tail bridge</text>`);
  lines.push(`<text x="${margin.left}" y="66" fill="#94a3b8" font-size="15">Tail hit: min(EQ_2(n), n-EQ_2(n)) &lt;= sqrt(n); y=max residual/sqrt(variance)</text>`);
  for (let g = 0; g <= 4; g++) {
    const y = margin.top + (plotH * g) / 4;
    const val = yMax * (1 - g / 4);
    lines.push(`<line x1="${margin.left}" x2="${W - margin.right}" y1="${y}" y2="${y}" stroke="#223044" stroke-width="1"/>`);
    lines.push(`<text x="${margin.left - 12}" y="${y + 5}" fill="#94a3b8" text-anchor="end" font-size="13">${fmt(val, 2)}</text>`);
  }
  for (const family of families) {
    for (const run of family.runs) {
      const d = run.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.maxAbsNormalized)}`).join(" ");
      lines.push(`<path d="${d}" fill="none" stroke="${colors[family.key]}" stroke-width="1.5" opacity="0.38"/>`);
    }
  }
  const dReal = real.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.maxAbsNormalized)}`).join(" ");
  lines.push(`<path d="${dReal}" fill="none" stroke="${colors.real}" stroke-width="4"/>`);
  real.endpointRows.forEach((r, i) => {
    lines.push(`<circle cx="${xAt(i)}" cy="${yAt(r.maxAbsNormalized)}" r="5" fill="${colors.real}"/>`);
    lines.push(`<text x="${xAt(i)}" y="${margin.top + plotH + 24}" fill="#94a3b8" text-anchor="middle" font-size="12">${r.N}</text>`);
  });
  const legend = [
    ["real primes", colors.real],
    ["random quotient", colors.randomQuotient],
    ["Cramer labels", colors.cramer],
    ["W210 labels", colors.w210],
    ["composites", colors.composite],
  ];
  legend.forEach(([label, color], i) => {
    const x = margin.left + i * 178;
    const y = H - 52;
    lines.push(`<line x1="${x}" x2="${x + 24}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="4"/>`);
    lines.push(`<text x="${x + 30}" y="${y + 5}" fill="#cbd5e1" font-size="13">${label}</text>`);
  });
  const end = real.endpointRows.at(-1);
  lines.push(`<text x="${margin.left}" y="${H - 24}" fill="#cbd5e1" font-size="14">Endpoint real hits=${end.hits}, expected=${fmt(end.expected, 1)}, z=${fmt(end.normalized, 3)}, max/sqrtVar=${fmt(end.maxAbsNormalized, 3)}, theta=${fmt(fitTheta(real.endpointRows), 3)}</text>`);
  lines.push(`</svg>`);
  return lines.join("\n");
}

function markdownReport(data) {
  const lines = [];
  const last = data.real.endpointRows.length - 1;
  lines.push("# Near-Wieferich Euler quotient tail bridge audit", "");
  lines.push("Candidate: tail hit when min(EQ_2(n), n-EQ_2(n)) <= sqrt(n), residual against 2/sqrt(n).", "");
  lines.push(`Range: ${maxN}. Seeds: ${seeds.join(", ")}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | count | hits | expected | real z | real max/sqrtVar | random quotient max | Cramer max | W210 max | composite max |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.endpointRows.length; i++) {
    const r = data.real.endpointRows[i];
    lines.push(`| ${r.N} | ${r.count} | ${r.hits} | ${fmt(r.expected)} | ${fmt(r.normalized)} | ${fmt(r.maxAbsNormalized)} | ${fmt(data.controlSummaries.randomQuotient[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.randomQuotient[i].maxAbsNormalized[1])} | ${fmt(data.controlSummaries.cramer[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.cramer[i].maxAbsNormalized[1])} | ${fmt(data.controlSummaries.w210[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.w210[i].maxAbsNormalized[1])} | ${fmt(data.controlSummaries.composite[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.composite[i].maxAbsNormalized[1])} |`);
  }
  lines.push("", "## Block normalized residuals", "");
  lines.push("| block | count | hits | expected | real | random quotient | Cramer | W210 | composite |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.blockRows.length; i++) {
    const b = data.real.blockRows[i];
    lines.push(`| (${b.from}, ${b.to}] | ${b.count} | ${b.hits} | ${fmt(b.expected)} | ${fmt(b.normalized)} | ${fmt(data.blockSummaries.randomQuotient[i][0])}..${fmt(data.blockSummaries.randomQuotient[i][1])} | ${fmt(data.blockSummaries.cramer[i][0])}..${fmt(data.blockSummaries.cramer[i][1])} | ${fmt(data.blockSummaries.w210[i][0])}..${fmt(data.blockSummaries.w210[i][1])} | ${fmt(data.blockSummaries.composite[i][0])}..${fmt(data.blockSummaries.composite[i][1])} |`);
  }
  lines.push("", "## Base holdouts", "");
  lines.push("| base | hits | expected | z | max/sqrtVar | theta |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const holdout of data.baseHoldouts) {
    const end = holdout.endpointRows.at(-1);
    lines.push(`| ${holdout.base} | ${end.hits} | ${fmt(end.expected)} | ${fmt(end.normalized)} | ${fmt(end.maxAbsNormalized)} | ${fmt(fitTheta(holdout.endpointRows))} |`);
  }
  lines.push("", "## Summary", "");
  lines.push(`Real max residual theta: \`${fmt(fitTheta(data.real.endpointRows))}\`.`);
  lines.push(`Endpoint random-quotient max/sqrtVar range: \`${fmt(data.controlSummaries.randomQuotient[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.randomQuotient[last].maxAbsNormalized[1])}\`.`);
  lines.push(`Endpoint Cramer max/sqrtVar range: \`${fmt(data.controlSummaries.cramer[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.cramer[last].maxAbsNormalized[1])}\`.`);
  lines.push(`Endpoint W210 max/sqrtVar range: \`${fmt(data.controlSummaries.w210[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.w210[last].maxAbsNormalized[1])}\`.`);
  lines.push(`Endpoint composite max/sqrtVar range: \`${fmt(data.controlSummaries.composite[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.composite[last].maxAbsNormalized[1])}\`.`);
  lines.push("", "Named composite check:", "");
  lines.push("| n | EQ_2(n) | folded | folded/sqrt(n) | hit |");
  lines.push("| ---: | ---: | ---: | ---: | ---: |");
  for (const row of data.namedCompositeCheck) {
    lines.push(`| ${row.n} | ${row.eq} | ${fmt(row.folded)} | ${fmt(row.scaled)} | ${row.hit} |`);
  }
  lines.push("", "## Factor check", "");
  lines.push("The main term is the uniform-quotient tail probability 2/sqrt(n). If real primes do not separate from uniform quotient, W210, and composite Euler-quotient controls after this integrated subtraction, the object is a tail of modular quotient equidistribution rather than a critical line.");
  lines.push("", "## Files", "");
  lines.push(`- JSON: \`${data.jsonPath}\``);
  lines.push(`- SVG: \`${data.svgPath}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const phi = totientTable(maxN);
const isp = sieve(maxN);
const realLabels = primesUpTo(maxN).filter((p) => p > 2);
const compositePool = [];
for (let n = 25; n <= maxN; n += 2) {
  if (!isp[n] && gcd(n, 210) === 1) compositePool.push(n);
}

const real = scoreLabels("real", realLabels, phi);
const randomQuotientRuns = seeds.map((seed) => randomQuotientRun(realLabels, seed));
const cramerRuns = seeds.map((seed) => scoreLabels(`cramer-${seed}`, cramerPrimes(maxN, seed), phi));
const w210Runs = seeds.map((seed) => scoreLabels(`w210-${seed}`, w210FakeLabels(maxN, seed), phi));
const compositeRuns = seeds.map((seed) => scoreLabels(`composite-${seed}`, sampleSorted(compositePool, realLabels.length, seed), phi));
const baseHoldouts = [3, 5].map((b) => {
  const run = scoreLabels(`base-${b}`, realLabels.filter((n) => gcd(n, b) === 1), phi, (n) => eulerTailHit(n, phi, b));
  return { base: b, ...run };
});

const families = [
  { key: "randomQuotient", runs: randomQuotientRuns },
  { key: "cramer", runs: cramerRuns },
  { key: "w210", runs: w210Runs },
  { key: "composite", runs: compositeRuns },
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
const namedCompositeCheck = [25, 35, 77].map((n) => {
  const hit = eulerTailHit(n, phi, base);
  return { n, eq: hit ? hit.q : null, folded: hit ? hit.folded : NaN, scaled: hit ? hit.scaled : NaN, hit: hit ? hit.hit : null };
});

const baseName = `eulerq-tail-bridge-${maxN}`;
const jsonPath = path.join(outDir, `${baseName}.json`);
const mdPath = path.join(outDir, `${baseName}.md`);
const svgPath = path.join(outDir, `${baseName}.svg`);
const data = {
  maxN,
  base,
  seeds,
  endpoints,
  real,
  randomQuotientRuns,
  cramerRuns,
  w210Runs,
  compositeRuns,
  baseHoldouts,
  controlSummaries,
  blockSummaries,
  namedCompositeCheck,
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
  endpoint: real.endpointRows.at(-1),
  theta: {
    maxAbsResidual: fitTheta(real.endpointRows),
    absResidual: fitTheta(real.endpointRows, "residual"),
  },
  summary: {
    randomQuotient: controlSummaries.randomQuotient.at(-1),
    cramer: controlSummaries.cramer.at(-1),
    w210: controlSummaries.w210.at(-1),
    composite: controlSummaries.composite.at(-1),
  },
  baseHoldouts: baseHoldouts.map((run) => ({
    base: run.base,
    endpoint: run.endpointRows.at(-1),
    theta: fitTheta(run.endpointRows),
  })),
}, null, 2));
