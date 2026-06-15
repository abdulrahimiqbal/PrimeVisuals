#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(10000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/playground-artifacts";
const W = 2 * 3 * 5 * 7 * 11 * 13;
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(10000, Math.round(maxN * f)));
const seeds = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 112358, 141421, 173205, 223606,
  99991, 100003, 444444, 555555, 777777,
];
const namedCenters = [25, 35, 77, 289];

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

function phiOf(n) {
  let m = n;
  let out = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    while (m % p === 0) m /= p;
    out = (out / p) * (p - 1);
  }
  if (m > 1) out = (out / m) * (m - 1);
  return out;
}

const phiW = phiOf(W);
const coprimePrefix = new Int32Array(W + 1);
for (let r = 1; r <= W; r++) coprimePrefix[r] = coprimePrefix[r - 1] + (gcd(r, W) === 1 ? 1 : 0);

function coprimeCountUpTo(x) {
  if (x <= 0) return 0;
  const whole = Math.floor(x / W);
  const rem = x % W;
  return whole * phiW + coprimePrefix[rem];
}

function recoveredRank(a, b) {
  return coprimeCountUpTo(b) - coprimeCountUpTo(a);
}

function qAt(n) {
  return Math.min(0.95, W / (phiW * Math.log(Math.max(3, n))));
}

function scoreLabels(name, labels) {
  const sorted = Array.from(new Set(labels.filter((n) => n >= 1000 && n <= maxN && gcd(n, W) === 1))).sort((a, b) => a - b);
  const endpointRows = [];
  let cursor = 0;
  let count = 0;
  let rankSum = 0;
  let expectedRankSum = 0;
  let residual = 0;
  let variance = 0;
  let rawGapSum = 0;
  let roughCandidateSum = 0;
  for (const N of endpoints) {
    while (cursor + 1 < sorted.length && sorted[cursor] <= N && sorted[cursor + 1] <= maxN) {
      const a = sorted[cursor];
      const b = sorted[cursor + 1];
      const rank = recoveredRank(a, b);
      const q = qAt(a);
      const mean = 1 / q;
      const varianceTerm = Math.max(1e-12, (1 - q) / (q * q));
      rankSum += rank;
      expectedRankSum += mean;
      residual += rank - mean;
      variance += varianceTerm;
      rawGapSum += b - a;
      roughCandidateSum += rank;
      cursor++;
      count++;
    }
    endpointRows.push({
      N,
      count,
      rankMean: count ? rankSum / count : 0,
      expectedRankMean: count ? expectedRankSum / count : 0,
      rawGapMean: count ? rawGapSum / count : 0,
      roughCandidatesPerGap: count ? roughCandidateSum / count : 0,
      residual,
      variance,
      z: variance > 0 ? residual / Math.sqrt(variance) : 0,
      residualPerSqrtCount: count ? residual / Math.sqrt(count) : 0,
    });
  }
  return { name, labels: sorted.length, endpointRows };
}

function fitTheta(rows, key = "residual") {
  const pts = rows.filter((r) => Math.abs(r[key]) > 0 && r.N > 1);
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

function summarizeRuns(runs, endpointIndex) {
  return {
    count: range(runs.map((r) => r.endpointRows[endpointIndex].count)),
    z: range(runs.map((r) => r.endpointRows[endpointIndex].z)),
    absZ: range(runs.map((r) => Math.abs(r.endpointRows[endpointIndex].z))),
    residualPerSqrtCount: range(runs.map((r) => r.endpointRows[endpointIndex].residualPerSqrtCount)),
    rankMean: range(runs.map((r) => r.endpointRows[endpointIndex].rankMean)),
    theta: range(runs.map((r) => fitTheta(r.endpointRows))),
  };
}

function wFakeLabels(N, seed, modulus = W) {
  const rnd = mulberry32(seed);
  const phi = phiOf(modulus);
  const out = [];
  for (let n = 1001; n <= N; n += 2) {
    if (gcd(n, modulus) !== 1) continue;
    const q = Math.min(0.95, modulus / (phi * Math.log(n)));
    if (rnd() < q) out.push(n);
  }
  return out;
}

function w210FakeLabels(N, seed) {
  return wFakeLabels(N, seed, 2 * 3 * 5 * 7);
}

function nextPrimeAfter(n, primeFlags) {
  for (let m = n + 1; m < primeFlags.length; m++) if (primeFlags[m]) return m;
  return null;
}

function computeNamedCenterChecks(primeFlags) {
  return namedCenters.map((n) => {
    const eligible = gcd(n, W) === 1;
    const next = nextPrimeAfter(n, primeFlags);
    const rank = eligible && next != null ? recoveredRank(n, next) : null;
    const q = eligible ? qAt(Math.max(1000, n)) : null;
    return {
      n,
      isPrime: Boolean(primeFlags[n]),
      eligible,
      nextPrime: next,
      rankToNextPrime: rank,
      expectedRank: q ? 1 / q : null,
    };
  });
}

function makeSvg(real, families) {
  const width = 1120;
  const height = 780;
  const margin = { left: 92, right: 42, top: 92, bottom: 118 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const zoomFamilies = new Set(["w30030"]);
  const values = [
    ...real.endpointRows.map((r) => r.z),
    ...families
      .filter((family) => zoomFamilies.has(family.key))
      .flatMap((f) => f.runs.flatMap((run) => run.endpointRows.map((r) => r.z))),
  ];
  const minY = Math.min(-8, ...values);
  const maxY = Math.max(8, ...values);
  const pad = 0.08 * (maxY - minY || 1);
  const lo = minY - pad;
  const hi = maxY + pad;
  const xAt = (i) => margin.left + (plotW * i) / (endpoints.length - 1);
  const yAt = (v) => {
    const clipped = Math.max(lo, Math.min(hi, v));
    return margin.top + plotH - ((clipped - lo) / (hi - lo)) * plotH;
  };
  const colors = {
    real: "#67e8f9",
    w30030: "#f472b6",
    w210: "#22c55e",
    cramer: "#f59e0b",
    composite: "#fb7185",
  };
  const lines = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  lines.push(`<rect width="${width}" height="${height}" fill="#08111f"/>`);
  lines.push(`<text x="${margin.left}" y="38" fill="#e5e7eb" font-size="24" font-weight="700">Primorial recovery-debt rank line</text>`);
  lines.push(`<text x="${margin.left}" y="66" fill="#94a3b8" font-size="15">zoomed z-scale: real vs W30030 fake; Cramer/W210/composites are clipped when off-scale</text>`);
  for (let g = 0; g <= 4; g++) {
    const y = margin.top + (plotH * g) / 4;
    const val = hi - ((hi - lo) * g) / 4;
    lines.push(`<line x1="${margin.left}" x2="${width - margin.right}" y1="${y}" y2="${y}" stroke="#223044" stroke-width="1"/>`);
    lines.push(`<text x="${margin.left - 12}" y="${y + 5}" fill="#94a3b8" text-anchor="end" font-size="13">${fmt(val, 2)}</text>`);
  }
  lines.push(`<line x1="${margin.left}" x2="${width - margin.right}" y1="${yAt(0)}" y2="${yAt(0)}" stroke="#cbd5e1" stroke-width="1.5" opacity="0.55"/>`);
  for (const family of families) {
    for (const run of family.runs) {
      const dLine = run.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.z)}`).join(" ");
      lines.push(`<path d="${dLine}" fill="none" stroke="${colors[family.key]}" stroke-width="1.4" opacity="0.34"/>`);
    }
  }
  const dReal = real.endpointRows.map((r, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(r.z)}`).join(" ");
  lines.push(`<path d="${dReal}" fill="none" stroke="${colors.real}" stroke-width="4"/>`);
  real.endpointRows.forEach((r, i) => {
    lines.push(`<circle cx="${xAt(i)}" cy="${yAt(r.z)}" r="5" fill="${colors.real}"/>`);
    lines.push(`<text x="${xAt(i)}" y="${margin.top + plotH + 24}" fill="#94a3b8" text-anchor="middle" font-size="12">${r.N}</text>`);
  });
  const legend = [
    ["real primes", colors.real],
    ["W30030 fake", colors.w30030],
    ["W210 fake", colors.w210],
    ["Cramer labels", colors.cramer],
    ["count-matched composites", colors.composite],
  ];
  legend.forEach(([label, color], i) => {
    const x = margin.left + (i % 3) * 292;
    const y = height - 62 + Math.floor(i / 3) * 24;
    lines.push(`<line x1="${x}" x2="${x + 24}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="4"/>`);
    lines.push(`<text x="${x + 30}" y="${y + 5}" fill="#cbd5e1" font-size="13">${label}</text>`);
  });
  const end = real.endpointRows.at(-1);
  lines.push(`<text x="${margin.left}" y="${height - 18}" fill="#cbd5e1" font-size="14">Endpoint pairs=${end.count}, z=${fmt(end.z, 3)}, rank mean=${fmt(end.rankMean, 3)}, expected=${fmt(end.expectedRankMean, 3)}, theta=${fmt(fitTheta(real.endpointRows), 3)}</text>`);
  lines.push("</svg>");
  return lines.join("\n");
}

function markdownReport(data) {
  const lines = [];
  const last = data.real.endpointRows.length - 1;
  lines.push("# Primorial recovery-debt rank audit", "");
  lines.push(`Modulus W=${W}, phi(W)=${phiW}. Rank counts W-coprime candidates between consecutive labels. Main term is geometric with q(n)=W/(phi(W)log n).`, "");
  lines.push(`Range: ${maxN}. Seeds: ${seeds.join(", ")}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | pairs | real z | real rank mean | expected rank mean | W30030 fake z | W210 fake z | Cramer z | composite z |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < data.real.endpointRows.length; i++) {
    const r = data.real.endpointRows[i];
    lines.push(`| ${r.N} | ${r.count} | ${fmt(r.z)} | ${fmt(r.rankMean)} | ${fmt(r.expectedRankMean)} | ${fmt(data.controlSummaries.w30030[i].z[0])}..${fmt(data.controlSummaries.w30030[i].z[1])} | ${fmt(data.controlSummaries.w210[i].z[0])}..${fmt(data.controlSummaries.w210[i].z[1])} | ${fmt(data.controlSummaries.cramer[i].z[0])}..${fmt(data.controlSummaries.cramer[i].z[1])} | ${fmt(data.controlSummaries.composite[i].z[0])}..${fmt(data.controlSummaries.composite[i].z[1])} |`);
  }
  lines.push("", "## Absolute z and exponent summary", "");
  lines.push("| family | endpoint abs z range | theta range | endpoint rank mean range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const key of ["w30030", "w210", "cramer", "composite"]) {
    const s = data.controlSummaries[key][last];
    lines.push(`| ${key} | ${fmt(s.absZ[0])}..${fmt(s.absZ[1])} | ${fmt(s.theta[0])}..${fmt(s.theta[1])} | ${fmt(s.rankMean[0])}..${fmt(s.rankMean[1])} |`);
  }
  lines.push(`| real | ${fmt(Math.abs(data.real.endpointRows[last].z))} | ${fmt(fitTheta(data.real.endpointRows))} | ${fmt(data.real.endpointRows[last].rankMean)} |`);
  lines.push("", "## Named center check", "");
  lines.push("| n | is prime | W-eligible | next prime | rank to next prime | expected rank |");
  lines.push("| ---: | --- | --- | ---: | ---: | ---: |");
  for (const row of data.namedCenterChecks) {
    lines.push(`| ${row.n} | ${row.isPrime ? "yes" : "no"} | ${row.eligible ? "yes" : "no"} | ${row.nextPrime ?? "NA"} | ${row.rankToNextPrime ?? "NA"} | ${row.expectedRank == null ? "NA" : fmt(row.expectedRank)} |`);
  }
  lines.push("", "## Factor check", "");
  lines.push("This object is a normalized prime-gap statistic in W-coprime candidate coordinates. A survivor must beat the W30030 fake process; otherwise the line is only the geometric waiting-time law after local factors are installed.");
  lines.push("", "## Files", "");
  lines.push(`- JSON: \`${data.jsonPath}\``);
  lines.push(`- SVG: \`${data.svgPath}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const primeFlags = sieve(maxN + 10000);
const realLabels = primesUpTo(maxN).filter((n) => n >= 1000 && gcd(n, W) === 1);
const real = scoreLabels("real", realLabels);
const w30030Runs = seeds.map((seed) => scoreLabels(`w30030-${seed}`, wFakeLabels(maxN, seed, W)));
const w210Runs = seeds.map((seed) => scoreLabels(`w210-${seed}`, w210FakeLabels(maxN, seed).filter((n) => gcd(n, W) === 1)));
const cramerRuns = seeds.map((seed) => scoreLabels(`cramer-${seed}`, cramerPrimes(maxN, seed).filter((n) => gcd(n, W) === 1)));
const compositePool = [];
for (let n = 1001; n <= maxN; n += 2) {
  if (!primeFlags[n] && gcd(n, W) === 1) compositePool.push(n);
}
const compositeRuns = seeds.map((seed) => scoreLabels(`composite-${seed}`, sampleSorted(compositePool, realLabels.length, seed)));

const families = [
  { key: "w30030", runs: w30030Runs },
  { key: "w210", runs: w210Runs },
  { key: "cramer", runs: cramerRuns },
  { key: "composite", runs: compositeRuns },
];
const controlSummaries = Object.fromEntries(
  families.map((family) => [
    family.key,
    endpoints.map((_, i) => summarizeRuns(family.runs, i)),
  ]),
);
const namedCenterChecks = computeNamedCenterChecks(primeFlags);

const baseName = `primorial-recovery-debt-${maxN}`;
const jsonPath = path.join(outDir, `${baseName}.json`);
const mdPath = path.join(outDir, `${baseName}.md`);
const svgPath = path.join(outDir, `${baseName}.svg`);
const data = {
  maxN,
  W,
  phiW,
  endpoints,
  seeds,
  real,
  w30030Runs,
  w210Runs,
  cramerRuns,
  compositeRuns,
  controlSummaries,
  namedCenterChecks,
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
    z: real.endpointRows.at(-1).z,
    rankMean: real.endpointRows.at(-1).rankMean,
    expectedRankMean: real.endpointRows.at(-1).expectedRankMean,
    residualPerSqrtCount: real.endpointRows.at(-1).residualPerSqrtCount,
  },
  theta: fitTheta(real.endpointRows),
  summary: {
    w30030: controlSummaries.w30030.at(-1),
    w210: controlSummaries.w210.at(-1),
    cramer: controlSummaries.cramer.at(-1),
    composite: controlSummaries.composite.at(-1),
  },
  namedCenterChecks,
}, null, 2));
