#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";
import { buildPolynomialUniverse, polyMod } from "../src/core/ffield.js";

const maxN = Math.max(1_000, Number.parseInt(process.argv[2] || "20000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q3MaxDegree = Number.parseInt(process.argv[4] || "7", 10);
const q5MaxDegree = Number.parseInt(process.argv[5] || "5", 10);
const q7MaxDegree = Number.parseInt(process.argv[6] || "4", 10);
const familyLimit = Number.parseInt(process.argv[7] || "12", 10);

const requiredIntegerEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = Array.from(new Set([
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

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function range(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? [Math.min(...finite), Math.max(...finite)] : [NaN, NaN];
}

function quadraticCharacterTable(p) {
  const chi = new Int8Array(p);
  chi.fill(-1);
  chi[0] = 0;
  for (let y = 1; y <= (p - 1) >> 1; y++) chi[(y * y) % p] = 1;
  return chi;
}

function integerParameters(limit) {
  const out = [];
  for (let n = 2; out.length < limit; n++) out.push(n);
  return out;
}

function legendreTracePrime(p, lambda, chi = quadraticCharacterTable(p)) {
  const l = mod(lambda, p);
  if (l === 0 || l === 1) return null;
  let characterSum = 0;
  for (let x = 0; x < p; x++) {
    characterSum += chi[mod(x * (x - 1) * (x - l), p)];
  }
  return -characterSum;
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
  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = values[Math.floor(random() * values.length)];
  return out;
}

function scoreValues(name, values, endpointCounts) {
  const rows = [];
  const blocks = [];
  let cursor = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsZ = 0;
  for (let i = 0; i < endpointCounts.length; i++) {
    const prevCursor = cursor;
    const prevSum = sum;
    const target = Math.min(endpointCounts[i], values.length);
    while (cursor < target) {
      const value = values[cursor++];
      sum += value;
      sumSquares += value * value;
      maxAbsZ = Math.max(maxAbsZ, Math.abs(sum / Math.sqrt(Math.max(1, cursor))));
    }
    const count = cursor;
    const blockCount = cursor - prevCursor;
    const blockSum = sum - prevSum;
    rows.push({
      endpoint: endpoints[i],
      count,
      sum,
      mean: sum / Math.max(1, count),
      z: sum / Math.sqrt(Math.max(1, count)),
      energyZ: sum / Math.sqrt(Math.max(1e-30, sumSquares)),
      maxAbsZ,
    });
    blocks.push({
      lo: i ? endpoints[i - 1] : 1,
      hi: endpoints[i],
      count: blockCount,
      sum: blockSum,
      z: blockSum / Math.sqrt(Math.max(1, blockCount)),
    });
  }
  return { name, rows, blocks };
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

function integerAudit(params) {
  console.error(`[noncm-legendre] rational-prime pilot to ${maxN}`);
  const primes = primesUpTo(maxN).filter((p) => p >= 5);
  const records = [];
  for (const p of primes) {
    const chi = quadraticCharacterTable(p);
    let good = 0;
    let traceSum = 0;
    for (const lambda of params) {
      const trace = legendreTracePrime(p, lambda, chi);
      if (trace === null) continue;
      good++;
      traceSum += trace;
    }
    records.push({ p, good, traceSum, value: traceSum / Math.sqrt(p * Math.max(1, good)) });
  }
  const endpointCounts = endpoints.map((endpoint) => records.filter((record) => record.p <= endpoint).length);
  const values = records.map((record) => record.value);
  const maxCount = Math.max(...endpointCounts);
  const real = scoreValues("real-prime-order non-CM Legendre family", values, endpointCounts);
  const controls = {
    shuffle: seeds.map((seed) => scoreValues(`shuffle-${seed}`, shuffle(values, seed), endpointCounts)),
    signFlip: seeds.map((seed) => scoreValues(`sign-flip-${seed}`, signFlip(values, seed ^ 0x9e3779b9), endpointCounts)),
    bootstrap: seeds.map((seed) => scoreValues(`bootstrap-${seed}`, sampleObserved(values, maxCount, seed ^ 0x517cc1b7), endpointCounts)),
  };
  const validation = [5, 7, 11, 13, 17, 19].map((p) => {
    const chi = quadraticCharacterTable(p);
    const lambda = params.find((item) => item % p !== 0 && item % p !== 1) || 2;
    const trace = legendreTracePrime(p, lambda, chi);
    let brutePoints = 1;
    for (let x = 0; x < p; x++) brutePoints += 1 + chi[mod(x * (x - 1) * (x - lambda), p)];
    return { p, lambda, trace, pointCount: brutePoints, ok: trace === p + 1 - brutePoints };
  });
  return {
    endpoints,
    parameters: params,
    recordsCount: records.length,
    real,
    controls,
    controlSummary: Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
    validation,
    sampleRecords: records.slice(0, 12),
  };
}

function fieldParameters(q, limit) {
  const out = [];
  for (let c = 0; c < q && out.length < limit; c++) out.push({ id: `t+${c}`, poly: q + c });
  for (let a = 0; a < q && out.length < limit; a++) {
    for (let b = 0; b < q && out.length < limit; b++) out.push({ id: `t^2+${a}t+${b}`, poly: q * q + a * q + b });
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

function encodeCoeffs(coeffs, q, length = coeffs.length) {
  let out = 0;
  let pow = 1;
  for (let i = 0; i < length; i++) {
    out += mod(coeffs[i], q) * pow;
    pow *= q;
  }
  return out;
}

function addField(a, b, q, degree) {
  const out = new Int16Array(degree);
  let aa = Math.floor(a);
  let bb = Math.floor(b);
  for (let i = 0; i < degree; i++) {
    out[i] = (aa % q + bb % q) % q;
    aa = Math.floor(aa / q);
    bb = Math.floor(bb / q);
  }
  return encodeCoeffs(out, q, degree);
}

function subField(a, b, q, degree) {
  const out = new Int16Array(degree);
  let aa = Math.floor(a);
  let bb = Math.floor(b);
  for (let i = 0; i < degree; i++) {
    out[i] = mod((aa % q) - (bb % q), q);
    aa = Math.floor(aa / q);
    bb = Math.floor(bb / q);
  }
  return encodeCoeffs(out, q, degree);
}

function mulModField(a, b, modulusCoeffs, q, degree, tmp = new Int16Array(2 * degree - 1)) {
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
    const lead = mod(tmp[k], q);
    if (!lead) continue;
    for (let i = 0; i < degree; i++) tmp[k - degree + i] = mod(tmp[k - degree + i] - lead * modulusCoeffs[i], q);
  }
  return encodeCoeffs(tmp, q, degree);
}

function powModField(base, exp, modulusCoeffs, q, degree) {
  let b = base;
  let e = Math.floor(exp);
  let out = 1;
  const tmp = new Int16Array(2 * degree - 1);
  while (e > 0) {
    if (e & 1) out = mulModField(out, b, modulusCoeffs, q, degree, tmp);
    b = mulModField(b, b, modulusCoeffs, q, degree, tmp);
    e = Math.floor(e / 2);
  }
  return out;
}

function quadraticCharacterResidue(value, modulusCoeffs, q, degree) {
  if (value === 0) return 0;
  const size = q ** degree;
  return powModField(value, (size - 1) / 2, modulusCoeffs, q, degree) === 1 ? 1 : -1;
}

function buildResidueContext(q, degree, primePoly) {
  const size = q ** degree;
  const modulusCoeffs = coeffsFixed(primePoly, q, degree);
  const tmp = new Int16Array(2 * degree - 1);
  const chi = new Int8Array(size);
  chi.fill(-1);
  chi[0] = 0;
  for (let y = 1; y < size; y++) {
    chi[mulModField(y, y, modulusCoeffs, q, degree, tmp)] = 1;
  }
  const xTimesXMinusOne = new Uint32Array(size);
  for (let x = 0; x < size; x++) {
    xTimesXMinusOne[x] = mulModField(x, subField(x, 1, q, degree), modulusCoeffs, q, degree, tmp);
  }
  return { q, degree, primePoly, size, modulusCoeffs, chi, xTimesXMinusOne };
}

function legendreTraceResidue(lambda, context) {
  const { q, degree, primePoly, size, modulusCoeffs, chi, xTimesXMinusOne } = context;
  const l = polyMod(lambda, primePoly, q);
  if (l === 0 || l === 1) return null;
  let characterSum = 0;
  const tmp = new Int16Array(2 * degree - 1);
  for (let x = 0; x < size; x++) {
    const xMinusLambda = subField(x, l, q, degree);
    const product = mulModField(xTimesXMinusOne[x], xMinusLambda, modulusCoeffs, q, degree, tmp);
    characterSum += chi[product];
  }
  return -characterSum;
}

function fieldAudit(q, maxDegree) {
  console.error(`[noncm-legendre] F_${q}[t] degrees <= ${maxDegree}`);
  const params = fieldParameters(q, familyLimit);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const rows = [];
  let cumulativeLabels = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsZ = 0;
  for (let degree = 1; degree <= maxDegree; degree++) {
    let labels = 0;
    let degreeSum = 0;
    const fieldSize = q ** degree;
    for (const primePoly of universe.irreduciblesByDegree[degree]) {
      const context = buildResidueContext(q, degree, primePoly);
      let good = 0;
      let traceSum = 0;
      for (const param of params) {
        const trace = legendreTraceResidue(param.poly, context);
        if (trace === null) continue;
        good++;
        traceSum += trace;
      }
      if (!good) continue;
      const value = traceSum / Math.sqrt(fieldSize * good);
      labels++;
      degreeSum += value;
      sum += value;
      sumSquares += value * value;
      cumulativeLabels++;
      maxAbsZ = Math.max(maxAbsZ, Math.abs(sum / Math.sqrt(Math.max(1, cumulativeLabels))));
    }
    rows.push({
      label: `F_${q}:deg${degree}`,
      q,
      degree,
      labels,
      cumulativeLabels,
      fieldSize,
      degreeMean: degreeSum / Math.max(1, labels),
      z: sum / Math.sqrt(Math.max(1, cumulativeLabels)),
      energyZ: sum / Math.sqrt(Math.max(1e-30, sumSquares)),
      maxAbsZ,
    });
  }
  return {
    q,
    maxDegree,
    parameters: params.map((param) => param.id),
    theoremObject: "non-isotrivial Legendre family E_lambda:y^2=x(x-1)(x-lambda) over residue fields F_q[t]/P",
    rows,
  };
}

function summarize(integer, fields) {
  const hasRequiredIntegerScaleLadder = requiredIntegerEndpoints.every((n) => endpoints.includes(n));
  const completeFieldLadders = fields.map((field) => field.q).sort((a, b) => a - b).join(",") === "3,5,7"
    && fields.every((field) => field.rows.length >= 1);
  const validationPassed = integer.validation.every((row) => row.ok);
  const finalInteger = integer.real.rows.at(-1);
  const integerBeatsControls = Math.abs(finalInteger.z) > Math.max(
    integer.controlSummary.shuffle.absZRange[1],
    integer.controlSummary.bootstrap.absZRange[1],
  ) && finalInteger.maxAbsZ > Math.max(
    integer.controlSummary.shuffle.maxAbsZRange[1],
    integer.controlSummary.bootstrap.maxAbsZRange[1],
  );
  const finalFields = fields.map((field) => ({ q: field.q, final: field.rows.at(-1) }));
  const values = [finalInteger.z, ...finalFields.map((field) => field.final.z)];
  const signs = values.map((z) => Math.sign(z));
  const signsAligned = signs.every((sign) => sign === signs[0]);
  const magnitudes = values.map(Math.abs).filter((value) => value > 0);
  const profileSpread = Math.max(...magnitudes) / Math.max(1e-12, Math.min(...magnitudes));
  const matchedProfile = hasRequiredIntegerScaleLadder && integerBeatsControls && signsAligned && profileSpread <= 3;
  return {
    hasRequiredIntegerScaleLadder,
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
  return rows.map((row) => `| N<=${row.endpoint} | ${row.count} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderFieldRows(rows) {
  return rows.map((row) => `| ${row.label} | ${row.labels} | ${row.cumulativeLabels} | ${fmt(row.degreeMean)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Non-CM Legendre family pilot audit", "");
  lines.push("Candidate:");
  lines.push("test a non-isotrivial Legendre family `E_lambda:y^2=x(x-1)(x-lambda)` over rational prime fields and residue fields `F_q[t]/P`.", "");
  lines.push("The statistic is `V_S(K)=sum_{lambda in S} a_K(E_lambda)/sqrt(|K|*good_lambda)`. This is a real non-CM monodromy pilot, but it is not eligible for promotion unless the full 1M/2M/4M/8M integer ladder is run.", "");
  lines.push("## Summary", "");
  lines.push(`- Required integer ladder 1M/2M/4M/8M present: ${report.summary.hasRequiredIntegerScaleLadder}`);
  lines.push(`- Required q=3,5,7 field ladders: ${report.summary.completeFieldLadders}`);
  lines.push(`- Point-count validation passed: ${report.summary.validationPassed}`);
  lines.push(`- Integer beats controls: ${report.summary.integerBeatsControls}`);
  lines.push(`- Signs aligned: ${report.summary.signsAligned}`);
  lines.push(`- Profile spread: ${fmt(report.summary.profileSpread)}`);
  lines.push(`- Matched profile: ${report.summary.matchedProfile}`);
  lines.push(`- Max endpoint |z|: ${fmt(report.summary.maxAbsEndpointZ)}`, "");
  lines.push("## Integer Pilot Rows", "");
  lines.push(`Parameters: ${report.integer.parameters.map((x) => `\`${x}\``).join(", ")}`, "");
  lines.push("| endpoint | labels | mean V | z | energy z | max abs z |");
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
    lines.push(`Parameters: ${field.parameters.map((x) => `\`${x}\``).join(", ")}`, "");
    lines.push("| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
    lines.push(renderFieldRows(field.rows));
  }
  lines.push("", "## Point-Count Validation", "");
  lines.push("| p | lambda | trace | point count | ok |");
  lines.push("| ---: | ---: | ---: | ---: | --- |");
  for (const row of report.integer.validation) lines.push(`| ${row.p} | ${row.lambda} | ${row.trace} | ${row.pointCount} | ${row.ok} |`);
  lines.push("", "## Novelty Audit", "");
  lines.push("- This is the first non-CM, non-isotrivial algebraic-family pilot in the strict loop.");
  lines.push("- It is deliberately not promoted because the current implementation is a pilot and lacks the full 8M integer ladder.");
  lines.push("- A real promotion attempt needs a faster trace engine or a theorem-first residual that avoids brute point counting on rational primes.", "");
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
<text x="${pad}" y="38" fill="#f8fafc" font-size="20" font-weight="700">Non-CM Legendre family pilot</text>
<text x="${pad}" y="62" fill="#94a3b8" font-size="13">V_S(K)=Σ a_K(E_lambda)/sqrt(|K|good) for E_lambda:y^2=x(x-1)(x-lambda)</text>
<rect x="${pad}" y="88" width="${width - 2 * pad}" height="390" fill="none" stroke="#334155"/>
${paths}
${legend}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const integer = integerAudit(integerParameters(familyLimit));
const fields = [
  fieldAudit(3, q3MaxDegree),
  fieldAudit(5, q5MaxDegree),
  fieldAudit(7, q7MaxDegree),
];
const summary = summarize(integer, fields);
const base = `cycle-020-noncm-legendre-family-pilot-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Non-CM Legendre family pilot",
  generatedAt: new Date().toISOString(),
  maxN,
  q3MaxDegree,
  q5MaxDegree,
  q7MaxDegree,
  familyLimit,
  endpoints,
  requiredIntegerEndpoints,
  seeds,
  theoremShape: {
    statistic: "V_S(K)=sum_{lambda in S good} a_K(E_lambda)/sqrt(|K|*good), E_lambda:y^2=x(x-1)(x-lambda)",
    integer: "K=F_p with integer lambda window",
    functionField: "K=F_q[t]/P with low-degree polynomial lambda(t) window",
    baseline: "Non-CM Legendre-family monodromy suggests mean-zero trace sums; promotion requires full integer ladder and matched field controls.",
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
  completeFieldLadders: summary.completeFieldLadders,
  validationPassed: summary.validationPassed,
  integerBeatsControls: summary.integerBeatsControls,
  signsAligned: summary.signsAligned,
  profileSpread: summary.profileSpread,
  matchedProfile: summary.matchedProfile,
  maxAbsEndpointZ: summary.maxAbsEndpointZ,
  paths,
}, null, 2));
