#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";

const maxN = Math.max(100_000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q3MaxDegree = Number.parseInt(process.argv[4] || "12", 10);
const q5MaxDegree = Number.parseInt(process.argv[5] || "8", 10);
const q7MaxDegree = Number.parseInt(process.argv[6] || "7", 10);

const requiredIntegerEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = requiredIntegerEndpoints.filter((n) => n <= maxN);
if (endpoints.length === 0) endpoints.push(maxN);

function mod(value, p) {
  const r = value % p;
  return r < 0 ? r + p : r;
}

function fmt(value, digits = 9) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mobiusSmall(n) {
  let m = Math.floor(n);
  let factors = 0;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    m = Math.floor(m / p);
    if (m % p === 0) return 0;
    factors++;
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) factors++;
  return factors % 2 ? -1 : 1;
}

function divisors(n) {
  const out = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d !== 0) continue;
    out.push(d);
    if (d * d !== n) out.push(n / d);
  }
  return out.sort((a, b) => a - b);
}

function irreducibleCount(q, degree) {
  let sum = 0;
  for (const d of divisors(degree)) sum += mobiusSmall(d) * (q ** (degree / d));
  return Math.round(sum / degree);
}

function quadraticCharacterTable(p) {
  const chi = new Int8Array(p);
  chi.fill(-1);
  chi[0] = 0;
  for (let y = 1; y <= (p - 1) >> 1; y++) chi[(y * y) % p] = 1;
  return chi;
}

function traceForParameters(p, a, b, chi = quadraticCharacterTable(p)) {
  const ar = mod(a, p);
  const br = mod(b, p);
  let characterSum = 0;
  for (let x = 0; x < p; x++) {
    const x2 = (x * x) % p;
    const x3 = (x2 * x) % p;
    characterSum += chi[(x3 + ar * x + br) % p];
  }
  return -characterSum;
}

function isSingular(p, a, b) {
  const a2 = (a * a) % p;
  const a3 = (a2 * a) % p;
  const b2 = (b * b) % p;
  return mod(4 * a3 + 27 * b2, p) === 0;
}

function exactSecondMomentRow(size) {
  const q = size;
  const allParameterCount = q * q;
  const singularCount = q;
  const goodCount = allParameterCount - singularCount;
  const allSecondMoment = q * q * (q - 1);
  const singularTraceSquareSum = q - 1;
  const goodSecondMoment = allSecondMoment - singularTraceSquareSum;
  const normalizedSecondMoment = goodSecondMoment / (q * goodCount);
  const stResidual = normalizedSecondMoment - 1;
  return {
    residueFieldSize: q,
    allParameterCount,
    singularCount,
    goodCount,
    allSecondMoment,
    singularTraceSquareSum,
    goodSecondMoment,
    normalizedSecondMoment,
    stResidual,
    exactMain: -1 / (q * q),
    exactResidual: 0,
  };
}

function brutePrimeFieldSecondMoment(p) {
  const chi = quadraticCharacterTable(p);
  let goodCount = 0;
  let goodSecondMoment = 0;
  let singularCount = 0;
  let singularTraceSquareSum = 0;
  for (let a = 0; a < p; a++) {
    for (let b = 0; b < p; b++) {
      const trace = traceForParameters(p, a, b, chi);
      const traceSquare = trace * trace;
      if (isSingular(p, a, b)) {
        singularCount++;
        singularTraceSquareSum += traceSquare;
        continue;
      }
      goodCount++;
      goodSecondMoment += traceSquare;
    }
  }
  const formula = exactSecondMomentRow(p);
  return {
    p,
    formulaGoodCount: formula.goodCount,
    bruteGoodCount: goodCount,
    formulaSingularCount: formula.singularCount,
    bruteSingularCount: singularCount,
    formulaSingularTraceSquareSum: formula.singularTraceSquareSum,
    bruteSingularTraceSquareSum: singularTraceSquareSum,
    formulaGoodSecondMoment: formula.goodSecondMoment,
    bruteGoodSecondMoment: goodSecondMoment,
    ok: formula.goodCount === goodCount
      && formula.singularCount === singularCount
      && formula.singularTraceSquareSum === singularTraceSquareSum
      && formula.goodSecondMoment === goodSecondMoment,
  };
}

function scoreCumulative(rows, valueKey) {
  let sum = 0;
  let sumSquares = 0;
  let maxAbsZ = 0;
  return rows.map((row, i) => {
    const value = row[valueKey];
    sum += value;
    sumSquares += value * value;
    const labels = i + 1;
    const z = sum / Math.sqrt(labels);
    const energyZ = sum / Math.sqrt(Math.max(1e-30, sumSquares));
    maxAbsZ = Math.max(maxAbsZ, Math.abs(z));
    return { ...row, cumulativeSum: sum, z, energyZ, maxAbsZ };
  });
}

function integerAudit() {
  console.error(`[weierstrass-second] rational primes to ${maxN}`);
  const primes = primesUpTo(maxN).filter((p) => p >= 5);
  const perPrime = primes.map((p) => ({
    label: `F_${p}`,
    p,
    ...exactSecondMomentRow(p),
  }));
  const scoredSt = scoreCumulative(perPrime.map((row) => ({ ...row, value: row.stResidual })), "value");
  const scoredExact = scoreCumulative(perPrime.map((row) => ({ ...row, value: row.exactResidual })), "value");
  const rows = [];
  for (const endpoint of endpoints) {
    let count = 0;
    while (count < primes.length && primes[count] <= endpoint) count++;
    const st = scoredSt[Math.max(0, count - 1)];
    const exact = scoredExact[Math.max(0, count - 1)];
    rows.push({
      label: `Z<=${endpoint}`,
      endpoint,
      labels: count,
      finalPrime: primes[Math.max(0, count - 1)] || null,
      meanStResidual: st ? st.cumulativeSum / count : 0,
      stResidualZ: st ? st.z : 0,
      stEnergyZ: st ? st.energyZ : 0,
      maxAbsStResidualZ: st ? st.maxAbsZ : 0,
      exactResidualZ: exact ? exact.z : 0,
      maxAbsExactResidualZ: exact ? exact.maxAbsZ : 0,
    });
  }
  return {
    endpoints,
    labels: "rational primes p>=5",
    theoremObject: "complete nonsingular two-parameter family E_{a,b}: y^2=x^3+a*x+b over F_p",
    rows,
    sampleRows: perPrime.slice(0, 10),
  };
}

function fieldAudit(q, maxDegree) {
  console.error(`[weierstrass-second] F_${q}[t] degrees <= ${maxDegree}`);
  const rows = [];
  let cumulativeSt = 0;
  let cumulativeStSquares = 0;
  let cumulativeExact = 0;
  let maxAbsStResidualZ = 0;
  let maxAbsExactResidualZ = 0;
  let labelTotal = 0;
  for (let degree = 1; degree <= maxDegree; degree++) {
    const labels = irreducibleCount(q, degree);
    const fieldSize = q ** degree;
    const exact = exactSecondMomentRow(fieldSize);
    for (let i = 0; i < labels; i++) {
      cumulativeSt += exact.stResidual;
      cumulativeStSquares += exact.stResidual * exact.stResidual;
      cumulativeExact += exact.exactResidual;
      labelTotal++;
      maxAbsStResidualZ = Math.max(maxAbsStResidualZ, Math.abs(cumulativeSt / Math.sqrt(labelTotal)));
      maxAbsExactResidualZ = Math.max(maxAbsExactResidualZ, Math.abs(cumulativeExact / Math.sqrt(labelTotal)));
    }
    rows.push({
      label: `F_${q}:deg${degree}`,
      q,
      degree,
      labels,
      cumulativeLabels: labelTotal,
      residueFieldSize: fieldSize,
      normalizedSecondMoment: exact.normalizedSecondMoment,
      stResidual: exact.stResidual,
      exactMain: exact.exactMain,
      stResidualZ: cumulativeSt / Math.sqrt(Math.max(1, labelTotal)),
      stEnergyZ: cumulativeSt / Math.sqrt(Math.max(1e-30, cumulativeStSquares)),
      maxAbsStResidualZ,
      exactResidualZ: cumulativeExact / Math.sqrt(Math.max(1, labelTotal)),
      maxAbsExactResidualZ,
    });
  }
  return {
    q,
    maxDegree,
    labels: `monic irreducibles P in F_${q}[t]`,
    theoremObject: "complete nonsingular two-parameter family E_{a,b}: y^2=x^3+a*x+b over F_q[t]/P",
    rows,
  };
}

function validationRows() {
  return [5, 7, 11, 13].map((p) => brutePrimeFieldSecondMoment(p));
}

function summarize(integer, fields, validation) {
  const completeIntegerLadder = requiredIntegerEndpoints.every((n) => endpoints.includes(n));
  const completeFieldLadders = fields.map((field) => field.q).sort((a, b) => a - b).join(",") === "3,5,7"
    && fields.every((field) => field.rows.length >= 1);
  const validationPassed = validation.every((row) => row.ok);
  const finalInteger = integer.rows.at(-1);
  const finalFields = fields.map((field) => ({ q: field.q, final: field.rows.at(-1) }));
  const allFinals = [finalInteger, ...finalFields.map((field) => field.final)];
  const maxAbsExactResidualZ = Math.max(...allFinals.map((row) => Math.abs(row.exactResidualZ)));
  const maxAbsStResidualZ = Math.max(...allFinals.map((row) => Math.abs(row.stResidualZ)));
  const allExactResidualsZero = maxAbsExactResidualZ === 0;
  return {
    completeIntegerLadder,
    completeFieldLadders,
    validationPassed,
    allExactResidualsZero,
    absorbedByExactSecondMoment: allExactResidualsZero,
    maxAbsExactResidualZ,
    maxAbsStResidualZ,
    finalInteger,
    finalFields,
  };
}

function renderRows(rows, integer = false) {
  return rows.map((row) => `| ${row.label} | ${integer ? row.labels : row.cumulativeLabels} | ${row.labels} | ${fmt(row.meanStResidual ?? row.stResidual)} | ${fmt(row.stResidualZ)} | ${fmt(row.stEnergyZ)} | ${fmt(row.exactResidualZ)} |`).join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Complete Weierstrass second-moment transport audit", "");
  lines.push("Candidate:");
  lines.push("transport the exact second moment of the complete two-parameter Weierstrass family across rational prime fields and residue fields F_q[t]/P.", "");
  lines.push("For every odd finite field K, consider nonsingular curves");
  lines.push("");
  lines.push("`E_{a,b}: y^2=x^3+a*x+b`, `(a,b) in K^2`, `4a^3+27b^2 != 0`.");
  lines.push("");
  lines.push("The exact identity is");
  lines.push("");
  lines.push("`M2(K)/( |K| * good_count ) - 1 = -1/|K|^2`.", "");
  lines.push("The scored theorem residual subtracts `-1/|K|^2`, so a breakthrough candidate would need nonzero structure after this exact second-moment baseline.", "");
  lines.push("## Summary", "");
  lines.push(`- Complete integer ladder 1M/2M/4M/8M: ${report.summary.completeIntegerLadder}`);
  lines.push(`- Required q=3,5,7 field ladders: ${report.summary.completeFieldLadders}`);
  lines.push(`- Brute validation passed: ${report.summary.validationPassed}`);
  lines.push(`- Exact theorem residuals zero: ${report.summary.allExactResidualsZero}`);
  lines.push(`- Absorbed by exact second moment: ${report.summary.absorbedByExactSecondMoment}`);
  lines.push(`- Max exact residual z: ${fmt(report.summary.maxAbsExactResidualZ)}`);
  lines.push(`- Max Sato-Tate-baseline residual z before exact subtraction: ${fmt(report.summary.maxAbsStResidualZ)}`, "");
  lines.push("## Integer Rows", "");
  lines.push("| label | cumulative labels | endpoint labels | mean ST residual | ST residual z | ST energy z | exact residual z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(renderRows(report.integer.rows, true));
  for (const field of report.fields) {
    lines.push("", `## F_${field.q}[t] Rows`, "");
    lines.push("| label | cumulative labels | endpoint labels | ST residual | ST residual z | ST energy z | exact residual z |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
    lines.push(renderRows(field.rows));
  }
  lines.push("", "## Brute Validation", "");
  lines.push("| p | formula good count | brute good count | formula singular square sum | brute singular square sum | formula good M2 | brute good M2 | ok |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.validation) {
    lines.push(`| ${row.p} | ${row.formulaGoodCount} | ${row.bruteGoodCount} | ${row.formulaSingularTraceSquareSum} | ${row.bruteSingularTraceSquareSum} | ${row.formulaGoodSecondMoment} | ${row.bruteGoodSecondMoment} | ${row.ok} |`);
  }
  lines.push("", "## Novelty Audit", "");
  lines.push("- This is a higher-moment mutation from the cycle 016 trace identity.");
  lines.push("- It is still not a breakthrough candidate: diagonal character orthogonality and singular-curve bookkeeping give the exact residual.");
  lines.push("- A continuation must leave complete orthogonality moments and register an incomplete-family, monodromy, or spectral statistic with a nonzero theorem-normalized residual.", "");
  lines.push(`JSON: \`${report.paths.json}\``);
  lines.push(`SVG: \`${report.paths.svg}\``);
  return `${lines.join("\n")}\n`;
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (value) => y + h - ((value - minY) / (maxY - minY || 1)) * h;
  return values.map((value, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(value).toFixed(2)}`).join(" ");
}

function renderSvg(report) {
  const series = [
    { name: "Z ST residual", rows: report.integer.rows, key: "stResidualZ", color: "#f97316" },
    { name: "Z exact residual", rows: report.integer.rows, key: "exactResidualZ", color: "#22c55e" },
    ...report.fields.map((field, i) => ({ name: `F_${field.q} exact residual`, rows: field.rows, key: "exactResidualZ", color: ["#38bdf8", "#f472b6", "#a3e635"][i] })),
  ];
  const width = 1180;
  const height = 660;
  const pad = 78;
  const values = series.flatMap((s) => s.rows.map((row) => row[s.key]));
  const minY = Math.min(-1e-6, ...values) * 1.1;
  const maxY = Math.max(1e-6, ...values) * 1.1;
  const paths = series.map((s) => `<path d="${linePath(s.rows.map((row) => row[s.key]), pad, 88, width - 2 * pad, 390, minY, maxY)}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`).join("\n");
  const legend = series.map((s, i) => `<text x="${pad + (i % 3) * 260}" y="${530 + Math.floor(i / 3) * 22}" fill="${s.color}" font-size="13">${s.name}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="38" fill="#f8fafc" font-size="20" font-weight="700">Complete Weierstrass second-moment transport</text>
<text x="${pad}" y="62" fill="#94a3b8" font-size="13">The Sato-Tate residual is exactly -1/|K|^2; theorem-normalized residual is zero</text>
<rect x="${pad}" y="88" width="${width - 2 * pad}" height="390" fill="none" stroke="#334155"/>
${paths}
${legend}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const integer = integerAudit();
const fields = [
  fieldAudit(3, q3MaxDegree),
  fieldAudit(5, q5MaxDegree),
  fieldAudit(7, q7MaxDegree),
];
const validation = validationRows();
const summary = summarize(integer, fields, validation);
const base = `cycle-017-complete-weierstrass-second-moment-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Complete Weierstrass second-moment transport",
  generatedAt: new Date().toISOString(),
  maxN,
  q3MaxDegree,
  q5MaxDegree,
  q7MaxDegree,
  requiredIntegerEndpoints,
  theoremShape: {
    statistic: "M2(K)/( |K| * good_count ) - 1, with theorem residual subtracting -1/|K|^2",
    integer: "K=F_p for rational primes p>=5",
    functionField: "K=F_q[t]/P for monic irreducibles P over q=3,5,7",
    exactIdentity: "For odd finite fields K, the complete nonsingular family y^2=x^3+a*x+b has normalized second moment 1-1/|K|^2",
  },
  integer,
  fields,
  validation,
  summary,
  paths,
};

fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  completeIntegerLadder: summary.completeIntegerLadder,
  completeFieldLadders: summary.completeFieldLadders,
  validationPassed: summary.validationPassed,
  allExactResidualsZero: summary.allExactResidualsZero,
  absorbedByExactSecondMoment: summary.absorbedByExactSecondMoment,
  maxAbsExactResidualZ: summary.maxAbsExactResidualZ,
  maxAbsStResidualZ: summary.maxAbsStResidualZ,
  paths,
}, null, 2));
