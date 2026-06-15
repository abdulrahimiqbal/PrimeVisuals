#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";

const N = Number(process.argv[2] || 50_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(100, Math.round(x)));

function mod(value, p) {
  const r = value % p;
  return r < 0 ? r + p : r;
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function quadraticCharacterTable(p) {
  const chi = new Int8Array(p);
  chi.fill(-1);
  chi[0] = 0;
  for (let y = 1; y <= (p - 1) >> 1; y++) chi[(y * y) % p] = 1;
  return chi;
}

function traceForParameter(p, a, chi = quadraticCharacterTable(p)) {
  const ar = mod(a, p);
  let characterSum = 0;
  for (let x = 0; x < p; x++) {
    const x2 = (x * x) % p;
    const x3 = (x2 * x) % p;
    characterSum += chi[(x3 + ar * x + 1) % p];
  }
  return -characterSum;
}

function singularParameters(p) {
  if (p <= 3) return [];
  const roots = [];
  for (let a = 0; a < p; a++) {
    if ((4 * ((a * a) % p) * a + 27) % p === 0) roots.push(a);
  }
  return roots;
}

function completeFamilyRow(p) {
  const chi = quadraticCharacterTable(p);
  const singular = singularParameters(p);
  const singularTraceSum = singular.reduce((sum, a) => sum + traceForParameter(p, a, chi), 0);
  const allTraceSum = -p;
  const goodTraceSum = allTraceSum - singularTraceSum;
  const goodCount = p - singular.length;
  const denominator = Math.sqrt(p) * Math.sqrt(goodCount);
  return {
    p,
    singular,
    singularCount: singular.length,
    singularTraceSum,
    allTraceSum,
    goodCount,
    goodTraceSum,
    normalized: goodTraceSum / denominator,
    naiveMain: allTraceSum / denominator,
    singularCorrection: -singularTraceSum / denominator,
    exactMain: goodTraceSum / denominator,
    residual: 0,
  };
}

function bruteGoodTraceSum(p) {
  const chi = quadraticCharacterTable(p);
  let sum = 0;
  let good = 0;
  for (let a = 0; a < p; a++) {
    if ((4 * ((a * a) % p) * a + 27) % p === 0) continue;
    sum += traceForParameter(p, a, chi);
    good++;
  }
  return { p, good, sum };
}

function validateFormula(primes) {
  const sample = primes.filter((p) => p >= 5 && p <= 97);
  return sample.map((p) => {
    const row = completeFamilyRow(p);
    const brute = bruteGoodTraceSum(p);
    return {
      p,
      singularCount: row.singularCount,
      formulaGood: row.goodTraceSum,
      bruteGood: brute.sum,
      goodCount: row.goodCount,
      bruteGoodCount: brute.good,
      ok: row.goodTraceSum === brute.sum && row.goodCount === brute.good,
    };
  });
}

function scoreRows(rows) {
  const endpointRows = [];
  let cursor = 0;
  let sumNormalized = 0;
  let sumExactMain = 0;
  let sumNaiveMain = 0;
  let sumCorrection = 0;
  let residual = 0;
  let maxAbsResidual = 0;
  let maxAbsRawZ = 0;
  const singularHistogram = new Map();
  for (const endpoint of endpoints) {
    while (cursor < rows.length && rows[cursor].p <= endpoint) {
      const row = rows[cursor++];
      sumNormalized += row.normalized;
      sumExactMain += row.exactMain;
      sumNaiveMain += row.naiveMain;
      sumCorrection += row.singularCorrection;
      residual += row.normalized - row.exactMain;
      maxAbsResidual = Math.max(maxAbsResidual, Math.abs(residual));
      maxAbsRawZ = Math.max(maxAbsRawZ, Math.abs(sumNormalized / Math.sqrt(Math.max(1, cursor))));
      singularHistogram.set(row.singularCount, (singularHistogram.get(row.singularCount) || 0) + 1);
    }
    endpointRows.push({
      N: endpoint,
      primes: cursor,
      sumNormalized,
      rawZ: sumNormalized / Math.sqrt(Math.max(1, cursor)),
      sumExactMain,
      sumNaiveMain,
      sumCorrection,
      residual,
      residualZ: residual / Math.sqrt(Math.max(1, cursor)),
      maxAbsResidual,
      maxAbsResidualZ: maxAbsResidual / Math.sqrt(Math.max(1, cursor)),
      maxAbsRawZ,
    });
  }
  return { endpointRows, singularHistogram: Object.fromEntries(Array.from(singularHistogram.entries()).sort((a, b) => Number(a[0]) - Number(b[0]))) };
}

function namedCompositeChecks() {
  return [25, 35, 77, 289].map((n) => ({
    n,
    primeField: false,
    reason: "complete parameter family E_a/F_p is only defined over a prime field in this audit",
  }));
}

function makeSvg(report) {
  const width = 1180;
  const height = 660;
  const margin = { left: 70, right: 320, top: 70, bottom: 78 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const series = [
    { id: "raw complete-family Z", color: "#67e8f9", rows: report.score.endpointRows.map((row, i) => ({ x: i, y: row.rawZ })) },
    { id: "exact main Z", color: "#fbbf24", rows: report.score.endpointRows.map((row, i) => ({ x: i, y: row.sumExactMain / Math.sqrt(Math.max(1, row.primes)) })) },
    { id: "residual Z", color: "#34d399", rows: report.score.endpointRows.map((row, i) => ({ x: i, y: row.residualZ })) },
    { id: "naive all-a main Z", color: "#a78bfa", rows: report.score.endpointRows.map((row, i) => ({ x: i, y: row.sumNaiveMain / Math.sqrt(Math.max(1, row.primes)) })) },
    { id: "singular correction Z", color: "#fb7185", rows: report.score.endpointRows.map((row, i) => ({ x: i, y: row.sumCorrection / Math.sqrt(Math.max(1, row.primes)) })) },
  ];
  const allY = series.flatMap((entry) => entry.rows.map((row) => row.y));
  const yMin = Math.min(-1, ...allY) * 1.08;
  const yMax = Math.max(1, ...allY) * 1.08;
  const xOf = (point) => margin.left + (point.x / Math.max(1, endpoints.length - 1)) * plotW;
  const yOf = (point) => margin.top + (1 - (point.y - yMin) / (yMax - yMin)) * plotH;
  const grid = [];
  for (let i = 0; i <= 6; i++) {
    const y = margin.top + (i / 6) * plotH;
    const value = yMax - (i / 6) * (yMax - yMin);
    grid.push(`<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1f2937"/>`);
    grid.push(`<text x="18" y="${y + 4}" fill="#94a3b8" font-size="12">${fmt(value, 2)}</text>`);
  }
  const zeroY = yOf({ x: 0, y: 0 });
  grid.push(`<line x1="${margin.left}" y1="${zeroY}" x2="${width - margin.right}" y2="${zeroY}" stroke="#475569" stroke-width="1.5"/>`);
  const lines = series.map((entry) => {
    const points = entry.rows.map((point) => `${xOf(point).toFixed(2)},${yOf(point).toFixed(2)}`).join(" ");
    const dots = entry.rows.map((point) => `<circle cx="${xOf(point)}" cy="${yOf(point)}" r="4" fill="${entry.color}"/>`).join("");
    return `<polyline points="${points}" fill="none" stroke="${entry.color}" stroke-width="3"/>${dots}`;
  }).join("\n");
  const legend = series.map((entry, i) => {
    const x = margin.left + (i % 3) * 220;
    const y = 38 + Math.floor(i / 3) * 18;
    return `<text x="${x}" y="${y}" fill="${entry.color}" font-size="13">${entry.id}</text>`;
  }).join("\n");
  const final = report.score.endpointRows.at(-1);
  const notes = [
    `N ${report.N}`,
    `primes ${final.primes}`,
    `raw Z ${fmt(final.rawZ)}`,
    `residual Z ${fmt(final.residualZ)}`,
    `max residual Z ${fmt(final.maxAbsResidualZ)}`,
    `validation ${report.validation.every((row) => row.ok) ? "passed" : "FAILED"}`,
  ].map((text, i) => `<text x="${width - 286}" y="${118 + i * 27}" fill="#cbd5e1" font-size="13">${text}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="26" fill="#e5e7eb" font-size="18" font-weight="700">Complete elliptic family trace audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${lines}
${notes}
<text x="${margin.left}" y="${height - 38}" fill="#94a3b8" font-size="13">Complete family E_a: y^2=x^3+a*x+1 over F_p. Residual subtracts exact character-sum main term.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Complete elliptic family trace audit", "");
  lines.push("Family: `E_a: y^2=x^3+a*x+1`, complete parameters `a in F_p`, singular `4a^3+27=0` discarded.", "");
  lines.push("Derived identity:");
  lines.push("");
  lines.push("`sum_{a in F_p} a_p(E_a) = -p`.");
  lines.push("");
  lines.push("Reason: `a_p(E_a)=-sum_x chi(x^3+a*x+1)`. For `x=0`, the inner character is always `chi(1)=1`, contributing `p`; for every `x!=0`, `a -> x^3+a*x+1` is a bijection of `F_p`, so the character sum is `0`.", "");
  lines.push("## Brute-force validation", "");
  lines.push("| p | singular count | formula good sum | brute good sum | good count | ok |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.validation) {
    lines.push(`| ${row.p} | ${row.singularCount} | ${row.formulaGood} | ${row.bruteGood} | ${row.goodCount} | ${row.ok ? "yes" : "NO"} |`);
  }
  lines.push("");
  lines.push("## Endpoint trace", "");
  lines.push("| N | primes | raw Z | exact-main Z | naive-main Z | singular-correction Z | residual Z | max residual/sqrt |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.score.endpointRows) {
    const scale = Math.sqrt(Math.max(1, row.primes));
    lines.push(`| ${row.N} | ${row.primes} | ${fmt(row.rawZ)} | ${fmt(row.sumExactMain / scale)} | ${fmt(row.sumNaiveMain / scale)} | ${fmt(row.sumCorrection / scale)} | ${fmt(row.residualZ)} | ${fmt(row.maxAbsResidualZ)} |`);
  }
  lines.push("");
  lines.push(`Singular-count histogram: \`${JSON.stringify(report.score.singularHistogram)}\`.`);
  lines.push("");
  lines.push("Named composite checks:");
  lines.push("");
  lines.push("| n | prime field? | reason |");
  lines.push("| ---: | --- | --- |");
  for (const row of report.namedComposites) {
    lines.push(`| ${row.n} | ${row.primeField ? "yes" : "no"} | ${row.reason} |`);
  }
  lines.push("");
  lines.push("Factor check:");
  lines.push("");
  lines.push("This does not telescope to `theta`, `psi`, or `M`; it collapses instead to a finite-field character-sum identity. After subtracting the exact complete-family main term, the residual is identically zero by construction and by brute-force validation on small primes.");
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[complete-elliptic] primes to ${N}`);
const primes = primesUpTo(N).filter((p) => p >= 5);
const rows = primes.map((p) => completeFamilyRow(p));
const score = scoreRows(rows);
const validation = validateFormula(primes);
const paths = {
  json: path.join(outDir, `complete-elliptic-family-trace-${N}.json`),
  md: path.join(outDir, `complete-elliptic-family-trace-${N}.md`),
  svg: path.join(outDir, `complete-elliptic-family-trace-${N}.svg`),
};
const report = {
  candidate: "complete elliptic family trace main line",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  score,
  validation,
  namedComposites: namedCompositeChecks(),
  sampleRows: rows.slice(0, 20),
  paths,
};
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  validationOk: validation.every((row) => row.ok),
  endpoint: score.endpointRows.at(-1),
  singularHistogram: score.singularHistogram,
  paths,
}, null, 2));
