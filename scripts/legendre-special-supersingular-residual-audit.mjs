#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";
import { irreducibleCountFormula } from "../src/core/ffield.js";

const maxN = Math.max(1_000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q3MaxDegree = Number.parseInt(process.argv[4] || "12", 10);
const q5MaxDegree = Number.parseInt(process.argv[5] || "8", 10);
const q7MaxDegree = Number.parseInt(process.argv[6] || "7", 10);

const requiredIntegerEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = maxN >= requiredIntegerEndpoints[0]
  ? requiredIntegerEndpoints.filter((n) => n <= maxN)
  : Array.from(new Set([
    Math.max(1_000, Math.round(maxN / 4)),
    Math.max(1_000, Math.round(maxN / 2)),
    maxN,
  ])).sort((a, b) => a - b);
const seeds = [12345, 271828, 314159, 161803, 424242, 8675309, 11235813];

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

function invMod(a, p) {
  const aa = mod(a, p);
  for (let x = 1; x < p; x++) if ((aa * x) % p === 1) return x;
  throw new Error(`no inverse for ${a} modulo ${p}`);
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

function specialSupersingularCountPrime(p) {
  if (p === 3) return 1;
  if (p < 5) return 0;
  return p % 4 === 3 ? 3 : 0;
}

function specialSupersingularCountField(q, degree) {
  if (q === 3) return 1;
  let count = q % 4 === 3 ? 3 : 0;
  if (q % 3 === 2 && (q ** degree) % 3 === 1) count += 2;
  return count;
}

function deuringCoeffs(p) {
  const m = (p - 1) >> 1;
  const coeffs = new Int32Array(m + 1);
  let binomial = 1;
  coeffs[0] = 1;
  for (let i = 1; i <= m; i++) {
    binomial = (((binomial * (m - i + 1)) % p) * invMod(i, p)) % p;
    coeffs[i] = (binomial * binomial) % p;
  }
  return coeffs;
}

function evalPolyMod(coeffs, x, p) {
  let value = 0;
  let pow = 1;
  for (const coeff of coeffs) {
    value = (value + coeff * pow) % p;
    pow = (pow * x) % p;
  }
  return value;
}

function sqrtModBrute(a, p) {
  const target = mod(a, p);
  const roots = [];
  for (let x = 0; x < p; x++) if ((x * x) % p === target) roots.push(x);
  return roots;
}

function specialOrbitValuesFp(p) {
  const values = new Set();
  values.add(mod(-1, p));
  values.add(mod(2, p));
  values.add(invMod(2, p));
  for (const root of sqrtModBrute(-3, p)) {
    values.add(mod((1 + root) * invMod(2, p), p));
  }
  values.delete(0);
  values.delete(1);
  return [...values].sort((a, b) => a - b);
}

function validationRows() {
  return [5, 7, 11, 13, 17, 19, 23, 29, 31, 43].map((p) => {
    const coeffs = deuringCoeffs(p);
    const specialLambdas = specialOrbitValuesFp(p);
    const deuringSupersingular = specialLambdas.filter((lambda) => evalPolyMod(coeffs, lambda, p) === 0);
    const formulaCount = specialSupersingularCountPrime(p);
    return {
      p,
      pMod4: p % 4,
      specialLambdas,
      deuringSupersingular,
      deuringCount: deuringSupersingular.length,
      formulaCount,
      ok: deuringSupersingular.length === formulaCount,
    };
  });
}

function integerAudit() {
  console.error(`[legendre-special-ss] rational-prime theorem ladder to ${maxN}`);
  const primes = primesUpTo(maxN).filter((p) => p >= 5);
  const records = primes.map((p) => {
    const specialCount = specialSupersingularCountPrime(p);
    const value = specialCount - 1.5;
    return {
      p,
      pMod4: p % 4,
      specialCount,
      value,
      localMod4Value: value,
    };
  });
  const endpointCounts = endpoints.map((endpoint) => records.filter((record) => record.p <= endpoint).length);
  const values = records.map((record) => record.value);
  const maxCount = Math.max(...endpointCounts);
  const real = scoreValues("real-prime-order special supersingular orbit residual", values, endpointCounts);
  const localMod4 = scoreValues("exact local mod-4 theorem control", records.map((record) => record.localMod4Value), endpointCounts);
  const controls = {
    localMod4: [localMod4],
    shuffle: seeds.map((seed) => scoreValues(`shuffle-${seed}`, shuffle(values, seed), endpointCounts)),
    signFlip: seeds.map((seed) => scoreValues(`sign-flip-${seed}`, signFlip(values, seed ^ 0x9e3779b9), endpointCounts)),
    bootstrap: seeds.map((seed) => scoreValues(`bootstrap-${seed}`, sampleObserved(values, maxCount, seed ^ 0x517cc1b7), endpointCounts)),
  };
  return {
    endpoints,
    recordsCount: records.length,
    real,
    controls,
    controlSummary: Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
    validation: validationRows(),
    sampleRecords: records.slice(0, 12),
  };
}

function fieldAudit(q, maxDegree) {
  console.error(`[legendre-special-ss] F_${q}[t] degrees <= ${maxDegree}`);
  const rows = [];
  let cumulativeLabels = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsZ = 0;
  for (let degree = 1; degree <= maxDegree; degree++) {
    const labels = irreducibleCountFormula(q, degree);
    const specialCount = specialSupersingularCountField(q, degree);
    const value = specialCount - 1.5;
    cumulativeLabels += labels;
    sum += labels * value;
    sumSquares += labels * value * value;
    maxAbsZ = Math.max(maxAbsZ, Math.abs(sum / Math.sqrt(Math.max(1, cumulativeLabels))));
    rows.push({
      label: `F_${q}:deg${degree}`,
      q,
      degree,
      labels,
      cumulativeLabels,
      specialCount,
      value,
      z: sum / Math.sqrt(Math.max(1, cumulativeLabels)),
      energyZ: sum / Math.sqrt(Math.max(1e-30, sumSquares)),
      maxAbsZ,
    });
  }
  return {
    q,
    maxDegree,
    theoremObject: "special automorphism Legendre loci j=1728 and j=0 inside E_lambda:y^2=x(x-1)(x-lambda)",
    rows,
  };
}

function summarize(integer, fields) {
  const completeIntegerLadder = requiredIntegerEndpoints.every((n) => endpoints.includes(n));
  const completeFieldLadders = fields.map((field) => field.q).sort((a, b) => a - b).join(",") === "3,5,7"
    && fields.every((field) => field.rows.length >= 1);
  const validationPassed = integer.validation.every((row) => row.ok);
  const finalInteger = integer.real.rows.at(-1);
  const finalLocal = integer.controls.localMod4[0].rows.at(-1);
  const localControlExplains = Math.abs(finalInteger.z - finalLocal.z) < 1e-12
    && integer.real.rows.every((row, i) => Math.abs(row.z - integer.controls.localMod4[0].rows[i].z) < 1e-12);
  const randomControlMax = Math.max(
    integer.controlSummary.shuffle.absZRange[1],
    integer.controlSummary.bootstrap.absZRange[1],
  );
  const integerBeatsControls = !localControlExplains && Math.abs(finalInteger.z) > randomControlMax;
  const finalFields = fields.map((field) => ({ q: field.q, final: field.rows.at(-1) }));
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
    localControlExplains,
    integerBeatsControls,
    signsAligned,
    profileSpread,
    matchedProfile,
    maxAbsEndpointZ: Math.max(...magnitudes),
    finalInteger,
    finalLocalControl: finalLocal,
    finalFields,
  };
}

function renderIntegerRows(rows) {
  return rows.map((row) => `| N<=${row.endpoint} | ${row.count} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderFieldRows(rows) {
  return rows.map((row) => `| ${row.label} | ${row.labels} | ${row.cumulativeLabels} | ${row.specialCount} | ${fmt(row.value)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Legendre special supersingular residual audit", "");
  lines.push("Candidate:");
  lines.push("test the theorem-first supersingular special-automorphism loci inside the Legendre family `E_lambda:y^2=x(x-1)(x-lambda)`.", "");
  lines.push("The statistic is `B(K)-3/2`, where `B(K)` counts Legendre parameters in the special `j=1728` and `j=0` orbits that are supersingular over the residue characteristic. This is computable by the Deuring/Hasse invariant theorem, not by point-counting.", "");
  lines.push("## Theorem Baseline", "");
  lines.push("- `j=1728` orbit: `lambda in {-1,2,1/2}`; supersingular iff the residue characteristic is `3 mod 4`.");
  lines.push("- `j=0` orbit: `lambda^2-lambda+1=0`; supersingular iff the residue characteristic is `2 mod 3`, and the roots contribute only when they lie in the residue field.");
  lines.push("- For rational primes `p>=5`, this collapses to `B(F_p)=3*1_{p=3 mod 4}`, so the integer signal is exactly a local mod-4 theorem control.", "");
  lines.push("## Summary", "");
  lines.push(`- Complete integer ladder 1M/2M/4M/8M: ${report.summary.completeIntegerLadder}`);
  lines.push(`- Required q=3,5,7 field ladders: ${report.summary.completeFieldLadders}`);
  lines.push(`- Deuring-polynomial validation passed: ${report.summary.validationPassed}`);
  lines.push(`- Local mod-4 control explains integer signal exactly: ${report.summary.localControlExplains}`);
  lines.push(`- Integer beats controls: ${report.summary.integerBeatsControls}`);
  lines.push(`- Signs aligned: ${report.summary.signsAligned}`);
  lines.push(`- Profile spread: ${fmt(report.summary.profileSpread)}`);
  lines.push(`- Matched profile: ${report.summary.matchedProfile}`);
  lines.push(`- Max endpoint |z|: ${fmt(report.summary.maxAbsEndpointZ)}`, "");
  lines.push("## Integer Rows", "");
  lines.push("| endpoint | labels | mean residual | z | energy z | max abs z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  lines.push(renderIntegerRows(report.integer.real.rows));
  lines.push("", "## Integer Controls", "");
  lines.push("| control | final |z| range | max |z| range | energy z range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, row] of Object.entries(report.integer.controlSummary)) {
    lines.push(`| ${name} | ${fmt(row.absZRange[0])}..${fmt(row.absZRange[1])} | ${fmt(row.maxAbsZRange[0])}..${fmt(row.maxAbsZRange[1])} | ${fmt(row.energyZRange[0])}..${fmt(row.energyZRange[1])} |`);
  }
  for (const field of report.fields) {
    lines.push("", `## F_${field.q}[t] Rows`, "");
    lines.push("| endpoint | labels | cumulative labels | B(K) | residual | z | energy z | max abs z |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
    lines.push(renderFieldRows(field.rows));
  }
  lines.push("", "## Deuring Validation", "");
  lines.push("| p | p mod 4 | special lambdas | Deuring supersingular lambdas | formula count | ok |");
  lines.push("| ---: | ---: | --- | --- | ---: | --- |");
  for (const row of report.integer.validation) {
    lines.push(`| ${row.p} | ${row.pMod4} | ${row.specialLambdas.join(",")} | ${row.deuringSupersingular.join(",")} | ${row.formulaCount} | ${row.ok} |`);
  }
  lines.push("", "## Novelty Audit", "");
  lines.push("- This satisfies the theorem-first/non-point-counting constraint after the non-CM trace pilot.");
  lines.push("- It is deliberately not promoted because the integer signal is exactly the known `p mod 4` supersingularity criterion for the `j=1728` CM orbit.");
  lines.push("- A real continuation must leave special automorphism/CM loci and name a generic non-CM residual with a nonzero baseline.", "");
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
<text x="${pad}" y="38" fill="#f8fafc" font-size="20" font-weight="700">Legendre special supersingular residual</text>
<text x="${pad}" y="62" fill="#94a3b8" font-size="13">B(K)-3/2 for special j=1728 and j=0 Legendre loci; theorem-first local-control audit</text>
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
const base = `cycle-021-legendre-special-supersingular-residual-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Legendre special supersingular residual",
  generatedAt: new Date().toISOString(),
  maxN,
  q3MaxDegree,
  q5MaxDegree,
  q7MaxDegree,
  endpoints,
  requiredIntegerEndpoints,
  seeds,
  theoremShape: {
    statistic: "R(K)=B(K)-3/2, where B(K) counts supersingular Legendre parameters in the j=1728 and j=0 special automorphism loci",
    integer: "For rational primes p>=5, B(F_p)=3*1_{p=3 mod 4}; this is the Deuring/Hasse invariant criterion for the j=1728 orbit.",
    functionField: "For K=F_q[t]/P of degree d, B(K) is determined by q mod 4, q mod 3, and whether q^d contains the j=0 lambda roots.",
    baseline: "This is a theorem-first nonzero residual, but it is exactly a local congruence/CM special-locus signal and is not novel.",
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
  localControlExplains: summary.localControlExplains,
  integerBeatsControls: summary.integerBeatsControls,
  signsAligned: summary.signsAligned,
  profileSpread: summary.profileSpread,
  matchedProfile: summary.matchedProfile,
  maxAbsEndpointZ: summary.maxAbsEndpointZ,
  paths,
}, null, 2));
