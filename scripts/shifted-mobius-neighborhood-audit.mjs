import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polySub,
  polynomialMobius,
} from "../src/core/ffield.js";
import { cramerPrimes, mobiusUpTo, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(1000, Number.parseInt(process.argv[2] || "4000000", 10));
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(10, Math.round(maxN * f)));
const ffSpecs = [
  { q: 3, degree: 12 },
  { q: 5, degree: 8 },
];

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

function scoreValue(n, mu) {
  if (n < 3 || n + 1 >= mu.length) return 0;
  return (mu[n - 1] || 0) * (mu[n + 1] || 0);
}

function scoreLabels(name, labels, mu, valueFactory = null, endpointCounts = null) {
  const sorted = labels.filter((n) => n >= 3 && n <= maxN).sort((a, b) => a - b);
  const values = sorted.map((n) => valueFactory ? valueFactory(n) : scoreValue(n, mu));
  const endpointRows = [];
  const blockRows = [];
  let cursor = 0;
  let count = 0;
  let nonzero = 0;
  let sum = 0;
  let maxAbs = 0;
  let blockStart = 1;
  let blockCount = 0;
  let blockNonzero = 0;
  let blockSum = 0;
  const pushEndpoint = (N, targetCount = null) => {
    while (cursor < values.length && (targetCount == null ? sorted[cursor] <= N : count < targetCount)) {
      const v = values[cursor++];
      count++;
      blockCount++;
      if (v !== 0) {
        nonzero++;
        blockNonzero++;
      }
      sum += v;
      blockSum += v;
      maxAbs = Math.max(maxAbs, Math.abs(sum));
    }
    endpointRows.push({
      N,
      count,
      nonzero,
      zero: count - nonzero,
      sum,
      normalized: nonzero ? sum / Math.sqrt(nonzero) : 0,
      maxAbs,
      maxAbsNormalized: nonzero ? maxAbs / Math.sqrt(nonzero) : 0,
      nonzeroRate: count ? nonzero / count : 0,
    });
    blockRows.push({
      from: blockStart,
      to: N,
      count: blockCount,
      nonzero: blockNonzero,
      zero: blockCount - blockNonzero,
      sum: blockSum,
      normalized: blockNonzero ? blockSum / Math.sqrt(blockNonzero) : 0,
      nonzeroRate: blockCount ? blockNonzero / blockCount : 0,
    });
    blockStart = N;
    blockCount = 0;
    blockNonzero = 0;
    blockSum = 0;
  };
  for (let i = 0; i < endpoints.length; i++) pushEndpoint(endpoints[i], endpointCounts ? endpointCounts[i] : null);
  return { name, labels: sorted.length, endpointRows, blockRows };
}

function fitTheta(rows, key = "maxAbs") {
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
    nonzeroRate: range(runs.map((r) => r.endpointRows[endpointIndex].nonzeroRate)),
    theta: range(runs.map((r) => fitTheta(r.endpointRows))),
  };
}

function blockRange(runs, blockIndex) {
  return range(runs.map((r) => r.blockRows[blockIndex].normalized));
}

function functionFieldShells(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const rows = [];
  for (let degree = 1; degree <= maxDegree; degree++) {
    let primeSum = 0;
    let primeNonzero = 0;
    let monicSum = 0;
    let monicNonzero = 0;
    const lead = universe.pow[degree];
    for (const f of universe.irreduciblesByDegree[degree]) {
      const v = polynomialMobius(polySub(f, 1, q), universe) * polynomialMobius(polyAdd(f, 1, q), universe);
      primeSum += v;
      if (v !== 0) primeNonzero++;
    }
    for (let lower = 0; lower < universe.pow[degree]; lower++) {
      const f = lead + lower;
      const v = polynomialMobius(polySub(f, 1, q), universe) * polynomialMobius(polyAdd(f, 1, q), universe);
      monicSum += v;
      if (v !== 0) monicNonzero++;
    }
    const primeCount = universe.irreduciblesByDegree[degree].length;
    const monicCount = universe.pow[degree];
    rows.push({
      q,
      degree,
      primeCount,
      primeNonzero,
      primeSum,
      primeNormalized: primeNonzero ? primeSum / Math.sqrt(primeNonzero) : 0,
      primeMean: primeCount ? primeSum / primeCount : 0,
      primeNonzeroRate: primeCount ? primeNonzero / primeCount : 0,
      monicCount,
      monicNonzero,
      monicSum,
      monicNormalized: monicNonzero ? monicSum / Math.sqrt(monicNonzero) : 0,
      monicMean: monicCount ? monicSum / monicCount : 0,
      monicNonzeroRate: monicCount ? monicNonzero / monicCount : 0,
    });
  }
  return rows;
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
    signShuffle: "#a78bfa",
    cramer: "#f59e0b",
    w210: "#22c55e",
    composite: "#fb7185",
  };
  const lines = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  lines.push(`<rect width="${W}" height="${H}" fill="#08111f"/>`);
  lines.push(`<text x="${margin.left}" y="38" fill="#e5e7eb" font-size="24" font-weight="700">Shifted Mobius twin-neighborhood parity bridge</text>`);
  lines.push(`<text x="${margin.left}" y="66" fill="#94a3b8" font-size="15">X(n)=mu(n-1)mu(n+1); y=max |sum X| / sqrt(nonzero count)</text>`);
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
    ["sign shuffle", colors.signShuffle],
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
  lines.push(`<text x="${margin.left}" y="${H - 24}" fill="#cbd5e1" font-size="14">Endpoint real sum=${end.sum}, nonzero=${end.nonzero}, normalized=${fmt(end.normalized, 3)}, max/sqrt=${fmt(end.maxAbsNormalized, 3)}, theta=${fmt(fitTheta(real.endpointRows), 3)}</text>`);
  lines.push(`</svg>`);
  return lines.join("\n");
}

function markdownReport(data) {
  const lines = [];
  const last = data.real.endpointRows.length - 1;
  lines.push("# Shifted Mobius twin-neighborhood parity bridge audit", "");
  lines.push("Candidate: X(label)=mu(label-1)*mu(label+1), bridge sum X normalized by sqrt(nonzero count).", "");
  lines.push(`Range: ${maxN}. Seeds: ${seeds.join(", ")}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | labels | nonzero | sum | real normalized | real max/sqrt | shuffle max | Cramer max | W210 max | composite max |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.endpointRows.length; i++) {
    const r = data.real.endpointRows[i];
    lines.push(`| ${r.N} | ${r.count} | ${r.nonzero} | ${r.sum} | ${fmt(r.normalized)} | ${fmt(r.maxAbsNormalized)} | ${fmt(data.controlSummaries.signShuffle[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.signShuffle[i].maxAbsNormalized[1])} | ${fmt(data.controlSummaries.cramer[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.cramer[i].maxAbsNormalized[1])} | ${fmt(data.controlSummaries.w210[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.w210[i].maxAbsNormalized[1])} | ${fmt(data.controlSummaries.composite[i].maxAbsNormalized[0])}..${fmt(data.controlSummaries.composite[i].maxAbsNormalized[1])} |`);
  }
  lines.push("", "## Block normalized sums", "");
  lines.push("| block | labels | nonzero | sum | real | shuffle | Cramer | W210 | composite |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.blockRows.length; i++) {
    const b = data.real.blockRows[i];
    lines.push(`| (${b.from}, ${b.to}] | ${b.count} | ${b.nonzero} | ${b.sum} | ${fmt(b.normalized)} | ${fmt(data.blockSummaries.signShuffle[i][0])}..${fmt(data.blockSummaries.signShuffle[i][1])} | ${fmt(data.blockSummaries.cramer[i][0])}..${fmt(data.blockSummaries.cramer[i][1])} | ${fmt(data.blockSummaries.w210[i][0])}..${fmt(data.blockSummaries.w210[i][1])} | ${fmt(data.blockSummaries.composite[i][0])}..${fmt(data.blockSummaries.composite[i][1])} |`);
  }
  lines.push("", "## Function-field shell check", "");
  lines.push("| q | degree | irreducibles | prime nonzero | prime sum | prime normalized | monic sum | monic normalized |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of data.functionFieldRows) {
    lines.push(`| ${row.q} | ${row.degree} | ${row.primeCount} | ${row.primeNonzero} | ${row.primeSum} | ${fmt(row.primeNormalized)} | ${row.monicSum} | ${fmt(row.monicNormalized)} |`);
  }
  lines.push("", "## Summary", "");
  lines.push(`Real max residual theta: \`${fmt(fitTheta(data.real.endpointRows))}\`.`);
  lines.push(`Endpoint sign-shuffle max/sqrt range: \`${fmt(data.controlSummaries.signShuffle[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.signShuffle[last].maxAbsNormalized[1])}\`.`);
  lines.push(`Endpoint Cramer max/sqrt range: \`${fmt(data.controlSummaries.cramer[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.cramer[last].maxAbsNormalized[1])}\`.`);
  lines.push(`Endpoint W210 max/sqrt range: \`${fmt(data.controlSummaries.w210[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.w210[last].maxAbsNormalized[1])}\`.`);
  lines.push(`Endpoint composite max/sqrt range: \`${fmt(data.controlSummaries.composite[last].maxAbsNormalized[0])}..${fmt(data.controlSummaries.composite[last].maxAbsNormalized[1])}\`.`);
  lines.push("", "## Factor check", "");
  lines.push("For every odd integer n, the neighbors n-1 and n+1 are consecutive even integers. Exactly one is divisible by 4, so its Mobius value is 0. Therefore X(n)=mu(n-1)mu(n+1) is identically 0 for every odd prime, and for every odd-label control. This is a perfect flat line, but it is a trivial local squarefactor obstruction, not prime regularity.");
  lines.push("");
  lines.push("The odd-characteristic function-field shells do not share this integer mod-4 obstruction: f-1 and f+1 are not forced to contain a repeated linear factor. Their nonzero rows are therefore a local-universe mismatch, not a rescue of the integer bridge.");
  lines.push("", "## Files", "");
  lines.push(`- JSON: \`${data.jsonPath}\``);
  lines.push(`- SVG: \`${data.svgPath}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const mu = mobiusUpTo(maxN + 1);
const realLabels = primesUpTo(maxN).filter((n) => n >= 3);
const real = scoreLabels("real", realLabels, mu);
const realValues = realLabels.map((n) => scoreValue(n, mu));
const endpointCounts = real.endpointRows.map((r) => r.count);
const signShuffleRuns = seeds.map((seed) => {
  const shuffled = shuffle(realValues, seed);
  let index = 0;
  return scoreLabels(`sign-shuffle-${seed}`, realLabels, mu, () => shuffled[index++] ?? 0, endpointCounts);
});
const cramerRuns = seeds.map((seed) => scoreLabels(`cramer-${seed}`, cramerPrimes(maxN, seed), mu));
const w210Runs = seeds.map((seed) => scoreLabels(`w210-${seed}`, w210FakeLabels(maxN, seed), mu));
const isp = sieve(maxN);
const compositePool = [];
for (let n = 25; n <= maxN; n += 2) {
  if (!isp[n] && gcd(n, 210) === 1) compositePool.push(n);
}
const compositeRuns = seeds.map((seed) => scoreLabels(`composite-${seed}`, sampleSorted(compositePool, realLabels.length, seed), mu));
const functionFieldRows = ffSpecs.flatMap(({ q, degree }) => functionFieldShells(q, degree));

const families = [
  { key: "signShuffle", runs: signShuffleRuns },
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

const baseName = `shifted-mobius-neighborhood-${maxN}`;
const jsonPath = path.join(outDir, `${baseName}.json`);
const mdPath = path.join(outDir, `${baseName}.md`);
const svgPath = path.join(outDir, `${baseName}.svg`);
const data = {
  maxN,
  seeds,
  endpoints,
  ffSpecs,
  real,
  signShuffleRuns,
  cramerRuns,
  w210Runs,
  compositeRuns,
  functionFieldRows,
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
    maxAbs: fitTheta(real.endpointRows),
    absSum: fitTheta(real.endpointRows, "sum"),
  },
  summary: {
    signShuffle: controlSummaries.signShuffle.at(-1),
    cramer: controlSummaries.cramer.at(-1),
    w210: controlSummaries.w210.at(-1),
    composite: controlSummaries.composite.at(-1),
  },
  functionFieldEndpoint: functionFieldRows.filter((r) => ffSpecs.some((s) => s.q === r.q && s.degree === r.degree)),
}, null, 2));
