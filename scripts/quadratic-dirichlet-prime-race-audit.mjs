#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";
import { buildPolynomialUniverse, polyMod, polyMul, polyToString } from "../src/core/ffield.js";

const maxN = Math.max(1_000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const integerModulus = Number.parseInt(process.argv[4] || "5", 10);
const q3MaxDegree = Number.parseInt(process.argv[5] || "12", 10);
const q5MaxDegree = Number.parseInt(process.argv[6] || "8", 10);
const q7MaxDegree = Number.parseInt(process.argv[7] || "7", 10);

const requiredIntegerEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = maxN >= requiredIntegerEndpoints[0]
  ? requiredIntegerEndpoints.filter((n) => n <= maxN)
  : Array.from(new Set([
    Math.max(1_000, Math.round(maxN / 4)),
    Math.max(1_000, Math.round(maxN / 2)),
    maxN,
  ])).sort((a, b) => a - b);
const seeds = [12345, 271828, 314159, 161803, 424242, 8675309, 11235813];
const localControlModuli = [3, 7, 11, 13];

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

function mod(value, p) {
  const r = value % p;
  return r < 0 ? r + p : r;
}

function powMod(base, exp, modulus) {
  let b = mod(base, modulus);
  let e = Math.floor(exp);
  let out = 1;
  while (e > 0) {
    if (e & 1) out = (out * b) % modulus;
    b = (b * b) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

function legendreSymbol(value, p) {
  const a = mod(value, p);
  if (a === 0) return 0;
  return powMod(a, (p - 1) / 2, p) === 1 ? 1 : -1;
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function range(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? [Math.min(...finite), Math.max(...finite)] : [NaN, NaN];
}

function shuffle(values, seed) {
  const random = rng(seed);
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function signFlip(values, seed) {
  const random = rng(seed);
  return values.map((value) => (random() < 0.5 ? -value : value));
}

function sampleObserved(values, count, seed) {
  const random = rng(seed);
  return Array.from({ length: count }, () => values[Math.floor(random() * values.length)]);
}

function scoreValues(name, values, endpointCounts) {
  const rows = [];
  let cursor = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsZ = 0;
  for (let i = 0; i < endpointCounts.length; i++) {
    const target = Math.min(endpointCounts[i], values.length);
    while (cursor < target) {
      const value = values[cursor++];
      sum += value;
      sumSquares += value * value;
      maxAbsZ = Math.max(maxAbsZ, Math.abs(sum / Math.sqrt(Math.max(1, cursor))));
    }
    const count = cursor;
    rows.push({
      endpoint: endpoints[i],
      count,
      sum,
      mean: sum / Math.max(1, count),
      z: sum / Math.sqrt(Math.max(1, count)),
      energyZ: sum / Math.sqrt(Math.max(1e-30, sumSquares)),
      maxAbsZ,
    });
  }
  return { name, rows };
}

function summarizeControls(runs) {
  const finals = runs.map((run) => run.rows.at(-1));
  return {
    zRange: range(finals.map((row) => row.z)),
    absZRange: range(finals.map((row) => Math.abs(row.z))),
    maxAbsZRange: range(finals.map((row) => row.maxAbsZ)),
    energyZRange: range(finals.map((row) => row.energyZ)),
  };
}

function integerAudit() {
  console.error(`[quadratic-dirichlet] rational-prime ladder to ${maxN} modulo ${integerModulus}`);
  const primes = primesUpTo(maxN).filter((p) => p !== integerModulus);
  const endpointCounts = endpoints.map((endpoint) => primes.filter((p) => p <= endpoint).length);
  const values = primes.map((p) => legendreSymbol(p, integerModulus));
  const maxCount = Math.max(...endpointCounts);
  const real = scoreValues(`real primes chi_${integerModulus}`, values, endpointCounts);
  const localCharacterRuns = localControlModuli
    .filter((m) => m !== integerModulus)
    .map((m) => scoreValues(`local-character-chi-${m}`, primes.filter((p) => p !== m).map((p) => legendreSymbol(p, m)), endpointCounts));
  const controls = {
    localCharacters: localCharacterRuns,
    shuffle: seeds.map((seed) => scoreValues(`shuffle-${seed}`, shuffle(values, seed), endpointCounts)),
    signFlip: seeds.map((seed) => scoreValues(`sign-flip-${seed}`, signFlip(values, seed ^ 0x9e3779b9), endpointCounts)),
    bootstrap: seeds.map((seed) => scoreValues(`bootstrap-${seed}`, sampleObserved(values, maxCount, seed ^ 0x517cc1b7), endpointCounts)),
  };
  const validation = [2, 3, 7, 11, 13, 17, 19, 23, 29, 31].map((p) => ({
    p,
    residue: mod(p, integerModulus),
    chi: p === integerModulus ? 0 : legendreSymbol(p, integerModulus),
    euler: p === integerModulus ? 0 : powMod(p, (integerModulus - 1) / 2, integerModulus),
    ok: p === integerModulus || (legendreSymbol(p, integerModulus) === 1 ? 1 : integerModulus - 1) === powMod(p, (integerModulus - 1) / 2, integerModulus),
  }));
  return {
    endpoints,
    modulus: integerModulus,
    recordsCount: primes.length,
    real,
    controls,
    controlSummary: Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
    validation,
    sampleRecords: primes.slice(0, 16).map((p) => ({ p, chi: legendreSymbol(p, integerModulus) })),
  };
}

function powModPoly(base, exp, modulusPoly, q) {
  let b = polyMod(base, modulusPoly, q);
  let e = Math.floor(exp);
  let out = 1;
  while (e > 0) {
    if (e & 1) out = polyMod(polyMul(out, b, q), modulusPoly, q);
    b = polyMod(polyMul(b, b, q), modulusPoly, q);
    e = Math.floor(e / 2);
  }
  return out;
}

function quadraticCharacterResidue(residue, modulusPoly, q, degree) {
  const r = polyMod(residue, modulusPoly, q);
  if (r === 0) return 0;
  return powModPoly(r, (q ** degree - 1) / 2, modulusPoly, q) === 1 ? 1 : -1;
}

function firstIrreducibleQuadratic(q) {
  const universe = buildPolynomialUniverse(q, 2);
  return universe.irreduciblesByDegree[2][0];
}

function fieldAudit(q, maxDegree) {
  const modulusPoly = firstIrreducibleQuadratic(q);
  console.error(`[quadratic-dirichlet] F_${q}[t] degrees <= ${maxDegree} modulo ${polyToString(modulusPoly, q)}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const rows = [];
  let cumulativeLabels = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsZ = 0;
  for (let degree = 1; degree <= maxDegree; degree++) {
    let labels = 0;
    let degreeSum = 0;
    for (const primePoly of universe.irreduciblesByDegree[degree]) {
      if (primePoly === modulusPoly) continue;
      const chi = quadraticCharacterResidue(primePoly, modulusPoly, q, 2);
      if (chi === 0) continue;
      labels++;
      degreeSum += chi;
      sum += chi;
      sumSquares += chi * chi;
      cumulativeLabels++;
      maxAbsZ = Math.max(maxAbsZ, Math.abs(sum / Math.sqrt(Math.max(1, cumulativeLabels))));
    }
    rows.push({
      label: `F_${q}:deg${degree}`,
      q,
      degree,
      labels,
      cumulativeLabels,
      degreeSum,
      degreeMean: degreeSum / Math.max(1, labels),
      z: sum / Math.sqrt(Math.max(1, cumulativeLabels)),
      energyZ: sum / Math.sqrt(Math.max(1e-30, sumSquares)),
      maxAbsZ,
    });
  }
  const validationResidues = [];
  for (let residue = 1; residue < q ** 2 && validationResidues.length < 10; residue++) {
    const chi = quadraticCharacterResidue(residue, modulusPoly, q, 2);
    const square = polyMod(polyMul(residue, residue, q), modulusPoly, q);
    validationResidues.push({
      residue,
      chi,
      square,
      chiSquare: quadraticCharacterResidue(square, modulusPoly, q, 2),
      ok: quadraticCharacterResidue(square, modulusPoly, q, 2) === 1,
    });
  }
  return {
    q,
    maxDegree,
    modulusPoly,
    modulus: polyToString(modulusPoly, q),
    theoremObject: "quadratic Dirichlet character modulo an irreducible quadratic polynomial M_q(t)",
    rows,
    validationResidues,
  };
}

function summarize(integer, fields) {
  const completeIntegerLadder = requiredIntegerEndpoints.every((n) => endpoints.includes(n));
  const completeFieldLadders = fields.map((field) => field.q).sort((a, b) => a - b).join(",") === "3,5,7"
    && fields.every((field) => field.rows.length >= 1);
  const validationPassed = integer.validation.every((row) => row.ok)
    && fields.every((field) => field.validationResidues.every((row) => row.ok));
  const finalInteger = integer.real.rows.at(-1);
  const randomControlMax = Math.max(
    integer.controlSummary.localCharacters.absZRange[1],
    integer.controlSummary.shuffle.absZRange[1],
    integer.controlSummary.bootstrap.absZRange[1],
  );
  const integerBeatsControls = Math.abs(finalInteger.z) > randomControlMax
    && finalInteger.maxAbsZ > Math.max(
      integer.controlSummary.localCharacters.maxAbsZRange[1],
      integer.controlSummary.shuffle.maxAbsZRange[1],
      integer.controlSummary.bootstrap.maxAbsZRange[1],
    );
  const finalFields = fields.map((field) => ({ q: field.q, modulus: field.modulus, final: field.rows.at(-1) }));
  const values = [finalInteger.z, ...finalFields.map((field) => field.final.z)];
  const signs = values.map((z) => Math.sign(z));
  const signsAligned = signs.every((sign) => sign === signs[0]);
  const magnitudes = values.map(Math.abs).filter((value) => value > 0);
  const profileSpread = Math.max(...magnitudes) / Math.max(1e-12, Math.min(...magnitudes));
  const matchedProfile = completeIntegerLadder && completeFieldLadders && integerBeatsControls && signsAligned && profileSpread <= 3;
  return {
    completeIntegerLadder,
    completeFieldLadders,
    validationPassed,
    integerBeatsControls,
    signsAligned,
    profileSpread,
    matchedProfile,
    maxAbsEndpointZ: Math.max(...magnitudes),
    finalInteger,
    finalFields,
  };
}

function renderIntegerRows(rows) {
  return rows.map((row) => `| N<=${row.endpoint} | ${row.count} | ${row.sum} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderFieldRows(rows) {
  return rows.map((row) => `| ${row.label} | ${row.labels} | ${row.cumulativeLabels} | ${row.degreeSum} | ${fmt(row.degreeMean)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Quadratic Dirichlet prime-race audit", "");
  lines.push("Candidate:");
  lines.push("compare the quadratic character race `sum_{p<=N} (p/m)` over rational primes with the matched quadratic Dirichlet character sums over irreducibles in `F_q[t]` modulo irreducible quadratic polynomials.", "");
  lines.push("The statistic is the normalized cumulative character sum `Z(X)=sum chi(P)/sqrt(labels)`. This is a new domain after the algebraic-family stop, but it is expected to be a Dirichlet/PNT-in-progressions calibration rather than a breakthrough.", "");
  lines.push("## Summary", "");
  lines.push(`- Integer modulus: ${report.integer.modulus}`);
  lines.push(`- Complete integer ladder 1M/2M/4M/8M: ${report.summary.completeIntegerLadder}`);
  lines.push(`- Required q=3,5,7 field ladders: ${report.summary.completeFieldLadders}`);
  lines.push(`- Character validation passed: ${report.summary.validationPassed}`);
  lines.push(`- Integer beats controls: ${report.summary.integerBeatsControls}`);
  lines.push(`- Signs aligned: ${report.summary.signsAligned}`);
  lines.push(`- Profile spread: ${fmt(report.summary.profileSpread)}`);
  lines.push(`- Matched profile: ${report.summary.matchedProfile}`);
  lines.push(`- Max endpoint |z|: ${fmt(report.summary.maxAbsEndpointZ)}`, "");
  lines.push("## Integer Rows", "");
  lines.push("| endpoint | labels | sum chi | mean chi | z | energy z | max abs z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(renderIntegerRows(report.integer.real.rows));
  lines.push("", "## Integer Controls", "");
  lines.push("| control | final |z| range | max |z| range | energy z range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, row] of Object.entries(report.integer.controlSummary)) {
    lines.push(`| ${name} | ${fmt(row.absZRange[0])}..${fmt(row.absZRange[1])} | ${fmt(row.maxAbsZRange[0])}..${fmt(row.maxAbsZRange[1])} | ${fmt(row.energyZRange[0])}..${fmt(row.energyZRange[1])} |`);
  }
  for (const field of report.fields) {
    lines.push("", `## F_${field.q}[t] Rows`, "");
    lines.push(`Modulus: \`${field.modulus}\``, "");
    lines.push("| endpoint | labels | cumulative labels | degree sum chi | degree mean chi | z | energy z | max abs z |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
    lines.push(renderFieldRows(field.rows));
  }
  lines.push("", "## Character Validation", "");
  lines.push("| side | item | ok |");
  lines.push("| --- | --- | --- |");
  for (const row of report.integer.validation) {
    lines.push(`| Z | p=${row.p}, residue=${row.residue}, chi=${row.chi}, Euler=${row.euler} | ${row.ok} |`);
  }
  for (const field of report.fields) {
    for (const row of field.validationResidues.slice(0, 4)) {
      lines.push(`| F_${field.q}[t] | residue=${row.residue}, chi=${row.chi}, square=${row.square}, chi(square)=${row.chiSquare} | ${row.ok} |`);
    }
  }
  lines.push("", "## Novelty Audit", "");
  lines.push("- This is a genuinely different object from the stopped algebraic-family branch: Dirichlet character prime races.");
  lines.push("- It is not promoted unless a character-race residual survives nearby-character, shuffle, bootstrap, and q-profile controls.");
  lines.push("- A likely failure means the signal is a known Dirichlet/PNT-in-progressions calibration, not new two-universe structure.", "");
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
    { name: "Z primes", rows: report.integer.real.rows, key: "z", color: "#38bdf8" },
    ...report.fields.map((field, i) => ({ name: `F_${field.q}`, rows: field.rows, key: "z", color: ["#22c55e", "#f59e0b", "#f472b6"][i] })),
  ];
  const width = 1180;
  const height = 660;
  const pad = 78;
  const values = series.flatMap((s) => s.rows.map((row) => row[s.key]));
  const minY = Math.min(-1, ...values) * 1.1;
  const maxY = Math.max(1, ...values) * 1.1;
  const paths = series.map((s) => `<path d="${linePath(s.rows.map((row) => row[s.key]), pad, 88, width - 2 * pad, 390, minY, maxY)}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`).join("\n");
  const legend = series.map((s, i) => `<text x="${pad + i * 150}" y="530" fill="${s.color}" font-size="13">${s.name}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="38" fill="#f8fafc" font-size="20" font-weight="700">Quadratic Dirichlet prime race</text>
<text x="${pad}" y="62" fill="#94a3b8" font-size="13">Normalized cumulative quadratic character sums over rational primes and F_q[t] irreducibles</text>
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
const summary = summarize(integer, fields);
const base = `cycle-023-quadratic-dirichlet-prime-race-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Quadratic Dirichlet prime race",
  generatedAt: new Date().toISOString(),
  maxN,
  integerModulus,
  q3MaxDegree,
  q5MaxDegree,
  q7MaxDegree,
  endpoints,
  requiredIntegerEndpoints,
  seeds,
  theoremShape: {
    statistic: "Z(X)=sum chi(P)/sqrt(labels), with chi a fixed quadratic Dirichlet character",
    integer: "P ranges over rational primes p<=N and chi(p)=(p/m) for fixed odd prime modulus m.",
    functionField: "P ranges over monic irreducibles in F_q[t] and chi(P) is the quadratic residue character modulo a fixed irreducible quadratic M_q(t).",
    baseline: "Dirichlet prime number theorem / prime polynomial theorem in arithmetic progressions predicts cancellation; promotion requires a residual beyond nearby-character and random controls.",
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
  completeIntegerLadder: summary.completeIntegerLadder,
  completeFieldLadders: summary.completeFieldLadders,
  validationPassed: summary.validationPassed,
  integerBeatsControls: summary.integerBeatsControls,
  signsAligned: summary.signsAligned,
  profileSpread: summary.profileSpread,
  matchedProfile: summary.matchedProfile,
  maxAbsEndpointZ: summary.maxAbsEndpointZ,
  paths,
}, null, 2));
