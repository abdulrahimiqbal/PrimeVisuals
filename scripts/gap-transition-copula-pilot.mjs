#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  lagOneCorrelation,
  transitionResidualSeries,
} from "../src/core/gapTransitionCopula.js";
import { controlExcess } from "../src/core/localGlobalDefect.js";
import { primesUpTo, sieve } from "../src/core/math.js";

const quick = process.argv.includes("--quick");
const N = quick ? 500_000 : 2_000_000;
const endpoints = quick ? [500_000] : [500_000, 1_000_000, 2_000_000];
const cutoffs = [29, 97];
const wheels = [30, 210];
const startAfter = 100_000;
const shrinkage = 20;
const minimumPairs = quick ? 2_000 : 20_000;
const seeds = quick
  ? [12345, 271828, 314159]
  : [12345, 271828, 314159, 161803, 424242, 8675309, 104729, 130363, 999983, 15485863, 32452843, 49979687];
const outDir = "logs/gap-transition-copula";

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

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function range(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length ? [Math.min(...usable), Math.max(...usable)] : [NaN, NaN];
}

function admissibleData(limit, cutoff) {
  const small = primesUpTo(cutoff);
  const flags = new Uint8Array(limit + 1);
  flags.fill(1);
  flags[0] = 0;
  flags[1] = 0;
  for (const p of small) for (let n = p; n <= limit; n += p) flags[n] = 0;
  let rho = 1;
  for (const p of small) rho *= p / (p - 1);
  return { cutoff, small, flags, rho };
}

function hazard(n, data) {
  if (n < 3 || !data.flags[n]) return 0;
  return Math.min(0.999999, data.rho / Math.log(n));
}

function generatedLabels(limit, data, seed, mode, primeFlags) {
  const random = rng(seed);
  const labels = [];
  for (let n = startAfter + 1; n <= limit; n++) {
    if (!data.flags[n]) continue;
    if (mode === "composite" && primeFlags[n]) continue;
    if (random() < hazard(n, data)) labels.push(n);
  }
  return labels;
}

function recordsFromLabels(labels) {
  const records = [];
  for (let i = 0; i + 1 < labels.length; i++) records.push({ p: labels[i], q: labels[i + 1] });
  return records;
}

function midPit(record, data) {
  let survival = 1;
  for (let n = record.p + 1; n < record.q; n++) survival *= 1 - hazard(n, data);
  const hq = hazard(record.q, data);
  if (!(hq > 0)) return null;
  return 1 - survival + 0.5 * survival * hq - 0.5;
}

function scoredRecords(labels, data) {
  const out = [];
  for (const record of recordsFromLabels(labels)) {
    if (record.p <= startAfter) continue;
    const value = midPit(record, data);
    if (value === null) continue;
    out.push({ ...record, value });
  }
  return out;
}

function shuffle(values, seed) {
  const out = values.slice();
  const random = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function analyzeSequence(scored, endpoint, wheel) {
  const training = scored.filter((row) => row.p > endpoint / 4 && row.p <= endpoint / 2);
  const holdout = scored.filter((row) => row.p > endpoint / 2 && row.p <= endpoint);
  const residual = transitionResidualSeries(training, holdout, wheel, shrinkage);
  const raw = lagOneCorrelation(residual.rawRanks);
  const adjusted = lagOneCorrelation(residual.residuals);
  return {
    endpoint,
    wheel,
    trainingCount: residual.trainingCount,
    holdoutCount: residual.holdoutCount,
    classCount: residual.classCount,
    unseenFraction: residual.unseenFraction,
    rawCorrelation: raw.correlation,
    adjustedCorrelation: adjusted.correlation,
    pairs: adjusted.pairs,
    residuals: residual.residuals,
  };
}

function publicAnalysis(row) {
  const { residuals: _residuals, ...out } = row;
  return out;
}

function summarizeControl(values) {
  return { count: values.length, range: range(values) };
}

console.error(`[gap-copula] sieve and primes to ${N}`);
const primeFlags = sieve(N);
const primeLabels = primesUpTo(N);
const rows = [];

for (const cutoff of cutoffs) {
  console.error(`[gap-copula] cutoff B=${cutoff}: real PIT sequence`);
  const data = admissibleData(N, cutoff);
  const realScored = scoredRecords(primeLabels, data);
  const cells = new Map();
  for (const endpoint of endpoints) {
    for (const wheel of wheels) {
      const real = analyzeSequence(realScored, endpoint, wheel);
      const shuffleValues = seeds.map((seed) => lagOneCorrelation(shuffle(real.residuals, seed ^ cutoff ^ endpoint ^ wheel)).correlation);
      cells.set(`${endpoint}:${wheel}`, { real, shuffleValues, fakeValues: [], compositeValues: [], fakeRows: [], compositeRows: [] });
    }
  }

  for (const seed of seeds) {
    console.error(`[gap-copula] B=${cutoff} seed=${seed}`);
    const fakeScored = scoredRecords(generatedLabels(N, data, seed ^ 0x517cc1b7, "fake", primeFlags), data);
    const compositeScored = scoredRecords(generatedLabels(N, data, seed ^ 0x9e3779b9, "composite", primeFlags), data);
    for (const endpoint of endpoints) {
      for (const wheel of wheels) {
        const cell = cells.get(`${endpoint}:${wheel}`);
        const fake = analyzeSequence(fakeScored, endpoint, wheel);
        const composite = analyzeSequence(compositeScored, endpoint, wheel);
        cell.fakeValues.push(fake.adjustedCorrelation);
        cell.compositeValues.push(composite.adjustedCorrelation);
        cell.fakeRows.push(publicAnalysis(fake));
        cell.compositeRows.push(publicAnalysis(composite));
      }
    }
  }

  for (const endpoint of endpoints) {
    for (const wheel of wheels) {
      const cell = cells.get(`${endpoint}:${wheel}`);
      const real = publicAnalysis(cell.real);
      const fakeExcess = controlExcess(real.adjustedCorrelation, cell.fakeValues);
      const compositeExcess = controlExcess(real.adjustedCorrelation, cell.compositeValues);
      const shuffleExcess = controlExcess(real.adjustedCorrelation, cell.shuffleValues);
      const strictAbsZ = [fakeExcess.z, compositeExcess.z, shuffleExcess.z].every(Number.isFinite)
        ? Math.min(Math.abs(fakeExcess.z), Math.abs(compositeExcess.z), Math.abs(shuffleExcess.z))
        : NaN;
      const supportPass = real.pairs >= minimumPairs
        && real.unseenFraction < 0.10
        && cell.fakeValues.filter(Number.isFinite).length >= Math.min(10, seeds.length)
        && cell.compositeValues.filter(Number.isFinite).length >= Math.min(10, seeds.length)
        && fakeExcess.sd > 0
        && compositeExcess.sd > 0
        && shuffleExcess.sd > 0;
      rows.push({
        cutoff,
        rho: data.rho,
        endpoint,
        wheel,
        real,
        controls: {
          sameBFake: { ...summarizeControl(cell.fakeValues), ...fakeExcess },
          roughComposite: { ...summarizeControl(cell.compositeValues), ...compositeExcess },
          realOrderShuffle: { ...summarizeControl(cell.shuffleValues), ...shuffleExcess },
        },
        strictAbsZ,
        supportPass,
        fakeRows: cell.fakeRows,
        compositeRows: cell.compositeRows,
      });
    }
  }
}

function leadGate(rowsToCheck) {
  const final = rowsToCheck.filter((row) => row.endpoint === Math.max(...endpoints));
  const previous = rowsToCheck.filter((row) => row.endpoint === endpoints.at(-2));
  const allFinalPass = final.length === cutoffs.length * wheels.length
    && final.every((row) => row.supportPass && row.strictAbsZ >= 4);
  const signStable = final.every((row) => {
    const prior = previous.find((item) => item.cutoff === row.cutoff && item.wheel === row.wheel);
    return prior && Math.sign(prior.real.adjustedCorrelation) === Math.sign(row.real.adjustedCorrelation);
  });
  return { allFinalPass, signStable, passed: allFinalPass && signStable };
}

function table(reportRows) {
  return reportRows.map((row) => `| ${row.cutoff} | ${row.endpoint} | ${row.wheel} | ${row.real.pairs} | ${fmt(row.real.unseenFraction, 4)} | ${fmt(row.real.rawCorrelation, 7)} | ${fmt(row.real.adjustedCorrelation, 7)} | ${fmt(row.controls.sameBFake.min, 7)}..${fmt(row.controls.sameBFake.max, 7)} | ${fmt(row.controls.roughComposite.min, 7)}..${fmt(row.controls.roughComposite.max, 7)} | ${fmt(row.controls.realOrderShuffle.min, 7)}..${fmt(row.controls.realOrderShuffle.max, 7)} | ${fmt(row.strictAbsZ, 2)} | ${row.supportPass ? "PASS" : "FAIL"} |`).join("\n");
}

function renderMarkdown(report) {
  return `# Deep-admissible prime-gap transition copula — pilot

This is an exploratory pilot under
\`logs/gap-transition-copula/PREREGISTRATION.md\`. It cannot be promoted as a
discovery.

Primary statistic: lag-one correlation of cross-fitted PIT ranks after a
shrunk transition-class mean modulo \`W\` is removed.

- maximum endpoint: ${report.N}
- endpoints: ${report.endpoints.join(", ")}
- cutoffs: ${report.cutoffs.join(", ")}
- wheels: ${report.wheels.join(", ")}
- seeds: ${report.seeds.length}
- pilot lead gate: ${report.leadGate.passed ? "PASS" : "FAIL"}

| B | endpoint | W | pairs | unseen frac | raw rank corr | transition-adjusted corr | same-B fake range | rough-composite range | order-shuffle range | strict |z| | support |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${table(report.rows)}

Interpretation rule: a raw adjacent-gap correlation is already known
calibration. Only the transition-adjusted correlation, compared against every
listed control family, can trigger a confirmatory run.

JSON: \`${report.paths.json}\`
SVG: \`${report.paths.svg}\`
`;
}

function renderSvg(report) {
  const width = 1180, height = 700;
  const chart = { x: 80, y: 82, w: 790, h: 500 };
  const values = report.rows.flatMap((row) => [row.real.adjustedCorrelation, row.controls.sameBFake.min, row.controls.sameBFake.max, row.controls.roughComposite.min, row.controls.roughComposite.max]).filter(Number.isFinite);
  const bound = Math.max(0.01, ...values.map(Math.abs)) * 1.15;
  const y = (value) => chart.y + chart.h / 2 - (value / bound) * chart.h / 2;
  const finalRows = report.rows.filter((row) => row.endpoint === Math.max(...report.endpoints));
  const groupW = chart.w / finalRows.length;
  const marks = finalRows.map((row, i) => {
    const x = chart.x + (i + 0.5) * groupW;
    const fakeLo = y(row.controls.sameBFake.min), fakeHi = y(row.controls.sameBFake.max);
    const compLo = y(row.controls.roughComposite.min), compHi = y(row.controls.roughComposite.max);
    return `<line x1="${x - 10}" x2="${x - 10}" y1="${fakeLo}" y2="${fakeHi}" stroke="#34d399" stroke-width="8" opacity="0.55"/><line x1="${x + 10}" x2="${x + 10}" y1="${compLo}" y2="${compHi}" stroke="#a78bfa" stroke-width="8" opacity="0.55"/><circle cx="${x}" cy="${y(row.real.adjustedCorrelation)}" r="6" fill="#f8fafc"/><text x="${x}" y="${chart.y + chart.h + 28}" text-anchor="middle" fill="#cbd5e1" font-size="12">B${row.cutoff}/W${row.wheel}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="64" y="36" fill="#f8fafc" font-size="21" font-weight="700">Deep-admissible gap transition copula pilot</text>
<text x="64" y="62" fill="#94a3b8" font-size="13">white: real adjusted correlation; green: same-B fake; violet: B-rough composite</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="#0b1627" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${y(0)}" y2="${y(0)}" stroke="#64748b"/>
${marks}
<text x="920" y="120" fill="#f8fafc" font-size="16" font-weight="700">pilot gate</text>
<text x="920" y="151" fill="${report.leadGate.passed ? "#34d399" : "#fb7185"}" font-size="26" font-weight="700">${report.leadGate.passed ? "PASS" : "FAIL"}</text>
<text x="920" y="190" fill="#cbd5e1" font-size="13">all final cells |z| >= 4: ${report.leadGate.allFinalPass}</text>
<text x="920" y="214" fill="#cbd5e1" font-size="13">sign stable: ${report.leadGate.signStable}</text>
</svg>`;
}

const paths = {
  json: path.join(outDir, quick ? "gap-transition-copula-quick.json" : "gap-transition-copula-pilot.json"),
  md: path.join(outDir, quick ? "gap-transition-copula-quick.md" : "gap-transition-copula-pilot.md"),
  svg: path.join(outDir, quick ? "gap-transition-copula-quick.svg" : "gap-transition-copula-pilot.svg"),
};
const report = {
  candidate: "deep-admissible prime-gap transition copula",
  grade: "EXPLORATORY_PILOT_ONLY",
  generatedAt: new Date().toISOString(),
  quick,
  N,
  endpoints,
  cutoffs,
  wheels,
  startAfter,
  shrinkage,
  minimumPairs,
  seeds,
  rows,
  leadGate: leadGate(rows),
  paths,
};
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  grade: report.grade,
  leadGate: report.leadGate,
  finalRows: rows.filter((row) => row.endpoint === Math.max(...endpoints)).map((row) => ({
    cutoff: row.cutoff,
    wheel: row.wheel,
    pairs: row.real.pairs,
    unseenFraction: row.real.unseenFraction,
    raw: row.real.rawCorrelation,
    adjusted: row.real.adjustedCorrelation,
    sameBFake: row.controls.sameBFake.range,
    roughComposite: row.controls.roughComposite.range,
    orderShuffle: row.controls.realOrderShuffle.range,
    strictAbsZ: row.strictAbsZ,
    supportPass: row.supportPass,
  })),
  paths,
}, null, 2));

