#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";
import { buildPolynomialUniverse } from "../src/core/ffield.js";

const maxN = Math.max(100_000, Number.parseInt(process.argv[2] || "4000000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q2MaxDegree = Number.parseInt(process.argv[4] || "22", 10);
const q5MaxDegree = Number.parseInt(process.argv[5] || "10", 10);

const classes = ["split", "linearQuad", "inert"];
const seeds = [12345, 271828, 314159, 161803, 424242];
const requiredIntegerEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = requiredIntegerEndpoints.filter((n) => n <= maxN);

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

function modPow(base, exp, mod) {
  let b = base % mod;
  let e = Math.floor(exp);
  let out = 1 % mod;
  while (e > 0) {
    if (e & 1) out = (out * b) % mod;
    b = (b * b) % mod;
    e = Math.floor(e / 2);
  }
  return out;
}

function coeffsFixed(poly, q, length) {
  const out = new Int16Array(length);
  let x = Math.floor(poly);
  for (let i = 0; i < length; i++) {
    out[i] = x % q;
    x = Math.floor(x / q);
  }
  return out;
}

function encodeCoeffs(coeffs, q, length) {
  let out = 0;
  let pow = 1;
  for (let i = 0; i < length; i++) {
    const c = ((coeffs[i] % q) + q) % q;
    out += c * pow;
    pow *= q;
  }
  return out;
}

function mulModPrimeField(a, b, modulusCoeffs, q, degree, tmp) {
  tmp.fill(0);
  let aa = Math.floor(a);
  for (let i = 0; i < degree; i++) {
    const ai = aa % q;
    aa = Math.floor(aa / q);
    if (!ai) continue;
    let bb = Math.floor(b);
    for (let j = 0; j < degree; j++) {
      const bj = bb % q;
      bb = Math.floor(bb / q);
      if (bj) tmp[i + j] = (tmp[i + j] + ai * bj) % q;
    }
  }
  for (let k = tmp.length - 1; k >= degree; k--) {
    const lead = ((tmp[k] % q) + q) % q;
    if (!lead) continue;
    for (let i = 0; i < degree; i++) {
      tmp[k - degree + i] = (tmp[k - degree + i] - lead * modulusCoeffs[i]) % q;
    }
  }
  return encodeCoeffs(tmp, q, degree);
}

function polyPowModFast(base, exp, modulus, q, degree) {
  const modulusCoeffs = coeffsFixed(modulus, q, degree);
  let b = encodeCoeffs(coeffsFixed(base, q, degree), q, degree);
  let e = Math.floor(exp);
  let out = 1;
  const tmp = new Int16Array(2 * degree - 1);
  while (e > 0) {
    if (e & 1) out = mulModPrimeField(out, b, modulusCoeffs, q, degree, tmp);
    b = mulModPrimeField(b, b, modulusCoeffs, q, degree, tmp);
    e = Math.floor(e / 2);
  }
  return out;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function range(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? [Math.min(...finite), Math.max(...finite)] : [NaN, NaN];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function integerExpected() {
  return { split: 1 / 6, linearQuad: 1 / 2, inert: 1 / 3 };
}

function fieldExpected(q, degree) {
  const size = q ** degree;
  return (size - 1) % 3 === 0
    ? { split: 1 / 3, linearQuad: 0, inert: 2 / 3 }
    : { split: 0, linearQuad: 1, inert: 0 };
}

function scoreCounts(label, scale, labels, counts, expected) {
  const fractions = Object.fromEntries(classes.map((cls) => [cls, labels ? counts[cls] / labels : 0]));
  const z = {};
  for (const cls of classes) {
    const p = expected[cls];
    if (p === 0) z[cls] = counts[cls] === 0 ? 0 : Infinity;
    else if (p === 1) z[cls] = counts[cls] === labels ? 0 : Infinity;
    else z[cls] = (counts[cls] - labels * p) / Math.sqrt(labels * p * (1 - p));
  }
  const activeZ = classes.map((cls) => z[cls]).filter(Number.isFinite);
  return {
    label,
    scale,
    labels,
    counts: { ...counts },
    expected,
    fractions,
    z,
    chi: Math.sqrt(mean(activeZ.map((value) => value * value))),
    maxAbsZ: Math.max(0, ...activeZ.map((value) => Math.abs(value))),
  };
}

function sampleCounts(labels, expected, seed) {
  const random = rng(seed);
  const thresholds = [
    expected.split,
    expected.split + expected.linearQuad,
    1,
  ];
  const counts = { split: 0, linearQuad: 0, inert: 0 };
  for (let i = 0; i < labels; i++) {
    const x = random();
    if (x < thresholds[0]) counts.split++;
    else if (x < thresholds[1]) counts.linearQuad++;
    else counts.inert++;
  }
  return counts;
}

function controlRows(row) {
  return seeds.map((seed) => scoreCounts(`${row.label}-random-${seed}`, row.scale, row.labels, sampleCounts(row.labels, row.expected, seed), row.expected));
}

function summarizeControls(rows) {
  return {
    chiRange: range(rows.map((row) => row.chi)),
    maxAbsZRange: range(rows.map((row) => row.maxAbsZ)),
  };
}

function classifyIntegerPrime(p) {
  if (p === 2 || p === 3) return "ramified";
  if (p % 3 === 2) return "linearQuad";
  return modPow(2, (p - 1) / 3, p) === 1 ? "split" : "inert";
}

function integerAudit() {
  console.error(`[chebotarev] integer primes to ${maxN}`);
  const primes = Array.from(primesUpTo(maxN));
  const counts = { split: 0, linearQuad: 0, inert: 0 };
  const rows = [];
  let endpointIndex = 0;
  let labels = 0;
  for (const p of primes) {
    const cls = classifyIntegerPrime(p);
    if (cls !== "ramified") {
      counts[cls]++;
      labels++;
    }
    while (endpointIndex < endpoints.length && p >= endpoints[endpointIndex]) {
      rows.push(scoreCounts(`Z<=${endpoints[endpointIndex]}`, endpoints[endpointIndex], labels, counts, integerExpected()));
      endpointIndex++;
    }
  }
  while (endpointIndex < endpoints.length) {
    rows.push(scoreCounts(`Z<=${endpoints[endpointIndex]}`, endpoints[endpointIndex], labels, counts, integerExpected()));
    endpointIndex++;
  }
  const controls = Object.fromEntries(rows.map((row) => [row.label, summarizeControls(controlRows(row))]));
  return { polynomial: "x^3 - 2", endpoints, rows, controls };
}

function classifyKummerAtPrime(q, degree, primePoly) {
  const alpha = q; // t modulo primePoly.
  if (primePoly === q) return "ramified"; // P=t.
  const size = q ** degree;
  if ((size - 1) % 3 !== 0) return "linearQuad";
  return polyPowModFast(alpha, (size - 1) / 3, primePoly, q, degree) === 1 ? "split" : "inert";
}

function fieldAudit(q, maxDegree) {
  console.error(`[chebotarev] F_${q}[t] degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const rows = [];
  for (let degree = 1; degree <= maxDegree; degree++) {
    const counts = { split: 0, linearQuad: 0, inert: 0 };
    let labels = 0;
    for (const primePoly of universe.irreduciblesByDegree[degree]) {
      const cls = classifyKummerAtPrime(q, degree, primePoly);
      if (cls === "ramified") continue;
      counts[cls]++;
      labels++;
    }
    rows.push(scoreCounts(`F_${q}:deg${degree}`, degree, labels, counts, fieldExpected(q, degree)));
  }
  const controls = Object.fromEntries(rows.map((row) => [row.label, summarizeControls(controlRows(row))]));
  return { q, polynomial: "x^3 - t", maxDegree, rows, controls };
}

function summarize(integer, fields) {
  const finalInteger = integer.rows.at(-1);
  const fieldEndpoints = fields.map((field) => field.rows.at(-1));
  const integerControl = integer.controls[finalInteger.label];
  const fieldControls = fieldEndpoints.map((row, i) => fields[i].controls[row.label]);
  const integerWithinControls = finalInteger.chi <= integerControl.chiRange[1] && finalInteger.maxAbsZ <= integerControl.maxAbsZRange[1];
  const fieldsWithinControls = fieldEndpoints.every((row, i) => row.chi <= fieldControls[i].chiRange[1] && row.maxAbsZ <= fieldControls[i].maxAbsZRange[1]);
  return {
    hasRequiredIntegerScaleLadder: requiredIntegerEndpoints.every((n) => endpoints.includes(n)),
    finalInteger: {
      label: finalInteger.label,
      chi: finalInteger.chi,
      maxAbsZ: finalInteger.maxAbsZ,
      control: integerControl,
      withinControls: integerWithinControls,
    },
    finalFields: fieldEndpoints.map((row, i) => ({
      q: fields[i].q,
      label: row.label,
      chi: row.chi,
      maxAbsZ: row.maxAbsZ,
      control: fieldControls[i],
      withinControls: row.chi <= fieldControls[i].chiRange[1] && row.maxAbsZ <= fieldControls[i].maxAbsZRange[1],
    })),
    allWithinControls: integerWithinControls && fieldsWithinControls,
    maxChi: Math.max(finalInteger.chi, ...fieldEndpoints.map((row) => row.chi)),
  };
}

function renderRows(rows) {
  return rows.map((row) => `| ${row.label} | ${row.labels} | ${row.counts.split} | ${row.counts.linearQuad} | ${row.counts.inert} | ${fmt(row.fractions.split)} | ${fmt(row.fractions.linearQuad)} | ${fmt(row.fractions.inert)} | ${fmt(row.chi)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Cubic Chebotarev splitting transport audit", "");
  lines.push("Candidate:");
  lines.push("compare Frobenius splitting type distributions for `x^3-2` over integer primes and `x^3-t` over closed points of `F_q[t]`.", "");
  lines.push("Classes: `split = 1+1+1`, `linearQuad = 1+2`, `inert = 3`.", "");
  lines.push("This is a new-domain calibration branch, not a claimed breakthrough: classical/effective Chebotarev is the expected explanation.", "");
  lines.push("## Summary", "");
  lines.push(`- Complete integer ladder 1M/2M/4M/8M: ${report.summary.hasRequiredIntegerScaleLadder}`);
  lines.push(`- Final integer within multinomial controls: ${report.summary.finalInteger.withinControls}`);
  lines.push(`- Final fields within multinomial controls: ${report.summary.finalFields.every((row) => row.withinControls)}`);
  lines.push(`- All endpoint diagnostics within controls: ${report.summary.allWithinControls}`);
  lines.push(`- Max endpoint chi: ${fmt(report.summary.maxChi)}`, "");
  lines.push("## Integer Chebotarev Rows", "");
  lines.push("| label | labels | split | linear+quad | inert | split frac | linear+quad frac | inert frac | chi | maxAbsZ |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(renderRows(report.integer.rows));
  for (const field of report.fields) {
    lines.push("", `## F_${field.q}[t] Kummer Rows`, "");
    lines.push("| label | labels | split | linear+quad | inert | split frac | linear+quad frac | inert frac | chi | maxAbsZ |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
    lines.push(renderRows(field.rows));
  }
  lines.push("", `JSON: \`${report.paths.json}\``);
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
    { name: "Z", rows: report.integer.rows, color: "#38bdf8" },
    ...report.fields.map((field, i) => ({ name: `F_${field.q}`, rows: field.rows, color: i ? "#f59e0b" : "#22c55e" })),
  ];
  const width = 1180;
  const height = 660;
  const pad = 78;
  const maxY = Math.max(1, ...series.flatMap((s) => s.rows.map((row) => row.chi))) * 1.15;
  const paths = series.map((s) => `<path d="${linePath(s.rows.map((row) => row.chi), pad, 88, width - 2 * pad, 390, 0, maxY)}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`).join("\n");
  const legend = series.map((s, i) => `<text x="${pad + i * 150}" y="530" fill="${s.color}" font-size="13">${s.name}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="38" fill="#f8fafc" font-size="20" font-weight="700">Cubic Chebotarev splitting transport</text>
<text x="${pad}" y="62" fill="#94a3b8" font-size="13">chi distance from expected splitting-type proportions; x^3-2 over Z, x^3-t over F_q[t]</text>
<rect x="${pad}" y="88" width="${width - 2 * pad}" height="390" fill="none" stroke="#334155"/>
${paths}
${legend}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const integer = integerAudit();
const fields = [
  fieldAudit(2, q2MaxDegree),
  fieldAudit(5, q5MaxDegree),
];
const summary = summarize(integer, fields);
const base = `cycle-013-cubic-chebotarev-transport-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Cubic Chebotarev splitting transport",
  generatedAt: new Date().toISOString(),
  maxN,
  q2MaxDegree,
  q5MaxDegree,
  classes,
  seeds,
  requiredIntegerEndpoints,
  theoremShape: {
    integer: "factorization type of x^3-2 modulo unramified rational primes p",
    functionField: "factorization type of x^3-t over residue fields F_q[t]/P for unramified monic irreducibles P",
    expectedIntegerDensities: integerExpected(),
    expectedFieldRule: "if q^deg(P)-1 is divisible by 3, split/inert densities are 1/3 and 2/3; otherwise all unramified classes are linear+quadratic",
  },
  integer,
  fields,
  summary,
  paths,
};

fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

console.log(JSON.stringify({
  ok: true,
  candidate: report.candidate,
  hasRequiredIntegerScaleLadder: summary.hasRequiredIntegerScaleLadder,
  allWithinControls: summary.allWithinControls,
  maxChi: summary.maxChi,
  paths,
}, null, 2));
