import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(1000, Number.parseInt(process.argv[2] || "4000000", 10));
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(10, Math.round(maxN * f)));
const mainTerm = 2 / 3;

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

function isExtremum(a, b, c) {
  return (b > a && b > c) || (b < a && b < c) ? 1 : 0;
}

function zGapsFromLabels(labels) {
  const z = [];
  const anchors = [];
  for (let i = 0; i + 1 < labels.length; i++) {
    const p = labels[i];
    if (p < 3) continue;
    z.push((labels[i + 1] - p) / Math.log(p));
    anchors.push(labels[i + 1]);
  }
  return { z, anchors };
}

function scoreOrdinalSeries(name, z, anchors, endpointCounts = null) {
  const events = [];
  for (let i = 1; i + 1 < z.length; i++) {
    events.push({
      anchor: anchors ? anchors[i + 1] : null,
      hit: isExtremum(z[i - 1], z[i], z[i + 1]),
    });
  }
  const endpointRows = [];
  const blockRows = [];
  let cursor = 0;
  let count = 0;
  let hits = 0;
  let residual = 0;
  let maxAbsResidual = 0;
  let blockStart = 1;
  let blockCount = 0;
  let blockHits = 0;
  let blockExpected = 0;
  const pushEndpoint = (N, targetCount = null) => {
    while (
      cursor < events.length &&
      (targetCount == null ? events[cursor].anchor <= N : count < targetCount)
    ) {
      const hit = events[cursor++].hit;
      count++;
      blockCount++;
      hits += hit;
      blockHits += hit;
      residual += hit - mainTerm;
      blockExpected += mainTerm;
      maxAbsResidual = Math.max(maxAbsResidual, Math.abs(residual));
    }
    const expected = count * mainTerm;
    endpointRows.push({
      N,
      count,
      hits,
      expected,
      residual: hits - expected,
      normalized: count ? (hits - expected) / Math.sqrt(count) : 0,
      maxAbsResidual,
      maxAbsNormalized: count ? maxAbsResidual / Math.sqrt(count) : 0,
      extremaRate: count ? hits / count : 0,
    });
    const blockResidual = blockHits - blockExpected;
    blockRows.push({
      from: blockStart,
      to: N,
      count: blockCount,
      hits: blockHits,
      expected: blockExpected,
      residual: blockResidual,
      normalized: blockCount ? blockResidual / Math.sqrt(blockCount) : 0,
      extremaRate: blockCount ? blockHits / blockCount : 0,
    });
    blockStart = N;
    blockCount = 0;
    blockHits = 0;
    blockExpected = 0;
  };
  for (let i = 0; i < endpoints.length; i++) pushEndpoint(endpoints[i], endpointCounts ? endpointCounts[i] : null);
  return { name, labels: z.length + 1, endpointRows, blockRows };
}

function scoreLabels(name, labels) {
  const { z, anchors } = zGapsFromLabels(labels.filter((n) => n <= maxN).sort((a, b) => a - b));
  return scoreOrdinalSeries(name, z, anchors);
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

function shuffle(values, seed) {
  const rnd = mulberry32(seed);
  const out = Array.from(values);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function summarizeControls(runs, endpointIndex) {
  return {
    normalized: range(runs.map((r) => r.endpointRows[endpointIndex].normalized)),
    maxAbsNormalized: range(runs.map((r) => r.endpointRows[endpointIndex].maxAbsNormalized)),
    extremaRate: range(runs.map((r) => r.endpointRows[endpointIndex].extremaRate)),
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
  const yMax = Math.max(1, ...allVals) * 1.15;
  const xAt = (i) => margin.left + (plotW * i) / (endpoints.length - 1);
  const yAt = (v) => margin.top + plotH - (v / yMax) * plotH;
  const colors = {
    real: "#67e8f9",
    shuffled: "#a78bfa",
    cramer: "#f59e0b",
    w210: "#22c55e",
    composite: "#fb7185",
  };
  const lines = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  lines.push(`<rect width="${W}" height="${H}" fill="#08111f"/>`);
  lines.push(`<text x="${margin.left}" y="38" fill="#e5e7eb" font-size="24" font-weight="700">Ordinal normalized-gap extrema bridge</text>`);
  lines.push(`<text x="${margin.left}" y="66" fill="#94a3b8" font-size="15">E=1 when middle normalized gap is local max/min; y=max |sum(E-2/3)| / sqrt(triples)</text>`);
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
    ["shuffled gaps", colors.shuffled],
    ["Cramer labels", colors.cramer],
    ["W210 labels", colors.w210],
    ["composites", colors.composite],
  ];
  legend.forEach(([label, color], i) => {
    const x = margin.left + i * 176;
    const y = H - 52;
    lines.push(`<line x1="${x}" x2="${x + 24}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="4"/>`);
    lines.push(`<text x="${x + 30}" y="${y + 5}" fill="#cbd5e1" font-size="13">${label}</text>`);
  });
  const end = real.endpointRows.at(-1);
  lines.push(`<text x="${margin.left}" y="${H - 24}" fill="#cbd5e1" font-size="14">Endpoint real rate=${fmt(end.extremaRate, 4)}, z=${fmt(end.normalized, 3)}, max/sqrt=${fmt(end.maxAbsNormalized, 3)}, theta=${fmt(fitTheta(real.endpointRows), 3)}</text>`);
  lines.push(`</svg>`);
  return lines.join("\n");
}

function markdownReport(data) {
  const lines = [];
  const last = data.real.endpointRows.length - 1;
  lines.push("# Ordinal normalized-gap extrema bridge audit", "");
  lines.push("Candidate: E=1 when the middle normalized gap in a triple is a strict local max/min; residual against iid ordinal main term 2/3.", "");
  lines.push(`Range: ${maxN}. Seeds: ${seeds.join(", ")}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | triples | hits | rate | real z | real max/sqrt | shuffled max | Cramer max | W210 max | composite max |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.endpointRows.length; i++) {
    const r = data.real.endpointRows[i];
    lines.push(`| ${r.N} | ${r.count} | ${r.hits} | ${fmt(r.extremaRate)} | ${fmt(r.normalized)} | ${fmt(r.maxAbsNormalized)} | ${fmt(data.controlSummaries.shuffled[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.shuffled[i].maxAbsNormalized[1])} | ${fmt(data.controlSummaries.cramer[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.cramer[i].maxAbsNormalized[1])} | ${fmt(data.controlSummaries.w210[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.w210[i].maxAbsNormalized[1])} | ${fmt(data.controlSummaries.composite[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.composite[i].maxAbsNormalized[1])} |`);
  }
  lines.push("", "## Block normalized residuals", "");
  lines.push("| block | triples | hits | rate | real | shuffled | Cramer | W210 | composite |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.blockRows.length; i++) {
    const b = data.real.blockRows[i];
    lines.push(`| (${b.from}, ${b.to}] | ${b.count} | ${b.hits} | ${fmt(b.extremaRate)} | ${fmt(b.normalized)} | ${fmt(data.blockSummaries.shuffled[i][0])}..${fmt(data.blockSummaries.shuffled[i][1])} | ${fmt(data.blockSummaries.cramer[i][0])}..${fmt(data.blockSummaries.cramer[i][1])} | ${fmt(data.blockSummaries.w210[i][0])}..${fmt(data.blockSummaries.w210[i][1])} | ${fmt(data.blockSummaries.composite[i][0])}..${fmt(data.blockSummaries.composite[i][1])} |`);
  }
  lines.push("", "## Summary", "");
  lines.push(`Real max residual theta: \`${fmt(fitTheta(data.real.endpointRows))}\`.`);
  lines.push(`Endpoint shuffled-gap max/sqrt range: \`${fmt(data.controlSummaries.shuffled[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.shuffled[last].maxAbsNormalized[1])}\`.`);
  lines.push(`Endpoint Cramer max/sqrt range: \`${fmt(data.controlSummaries.cramer[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.cramer[last].maxAbsNormalized[1])}\`.`);
  lines.push(`Endpoint W210 max/sqrt range: \`${fmt(data.controlSummaries.w210[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.w210[last].maxAbsNormalized[1])}\`.`);
  lines.push(`Endpoint composite max/sqrt range: \`${fmt(data.controlSummaries.composite[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.composite[last].maxAbsNormalized[1])}\`.`);
  lines.push("", "## Factor check", "");
  lines.push("The object is a nonlinear ordinal transform of adjacent normalized gaps. It does not telescope to theta/psi, but if W210/Cramer labels or shuffled real gaps reproduce the bridge, then it is not a new critical line. A positive excess would be the ordinal form of adjacent-gap anti-correlation or transition structure unless transition-matched controls fail.");
  lines.push("", "## Files", "");
  lines.push(`- JSON: \`${data.jsonPath}\``);
  lines.push(`- SVG: \`${data.svgPath}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const realLabels = primesUpTo(maxN);
const real = scoreLabels("real", realLabels);
const { z: realZ } = zGapsFromLabels(realLabels);
const endpointCounts = real.endpointRows.map((r) => r.count);
const shuffledRuns = seeds.map((seed) => scoreOrdinalSeries(`shuffled-${seed}`, shuffle(realZ, seed), null, endpointCounts));
const cramerRuns = seeds.map((seed) => scoreLabels(`cramer-${seed}`, cramerPrimes(maxN, seed)));
const w210Runs = seeds.map((seed) => scoreLabels(`w210-${seed}`, w210FakeLabels(maxN, seed)));
const isp = sieve(maxN);
const compositePool = [];
for (let n = 25; n <= maxN; n += 2) {
  if (!isp[n] && gcd(n, 210) === 1) compositePool.push(n);
}
const compositeRuns = seeds.map((seed) => scoreLabels(`composite-${seed}`, sampleSorted(compositePool, realLabels.length, seed)));

const families = [
  { key: "shuffled", runs: shuffledRuns },
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

const baseName = `ordinal-gap-extrema-${maxN}`;
const jsonPath = path.join(outDir, `${baseName}.json`);
const mdPath = path.join(outDir, `${baseName}.md`);
const svgPath = path.join(outDir, `${baseName}.svg`);
const data = {
  maxN,
  mainTerm,
  seeds,
  endpoints,
  real,
  shuffledRuns,
  cramerRuns,
  w210Runs,
  compositeRuns,
  controlSummaries,
  blockSummaries,
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
    shuffled: controlSummaries.shuffled.at(-1),
    cramer: controlSummaries.cramer.at(-1),
    w210: controlSummaries.w210.at(-1),
    composite: controlSummaries.composite.at(-1),
  },
}, null, 2));
