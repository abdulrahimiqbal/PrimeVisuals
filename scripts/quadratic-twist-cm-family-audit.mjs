#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";
import { buildPolynomialUniverse, polyMod } from "../src/core/ffield.js";

const maxN = Math.max(100_000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q3MaxDegree = Number.parseInt(process.argv[4] || "10", 10);
const q5MaxDegree = Number.parseInt(process.argv[5] || "7", 10);
const q7MaxDegree = Number.parseInt(process.argv[6] || "6", 10);
const familyLimit = Number.parseInt(process.argv[7] || "12", 10);

const requiredIntegerEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = requiredIntegerEndpoints.filter((n) => n <= maxN);
if (endpoints.length === 0) endpoints.push(maxN);
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

function factorDistinct(n) {
  let m = Math.abs(Math.floor(n));
  const factors = [];
  for (let p = 2; p * p <= m; p += p === 2 ? 1 : 2) {
    if (m % p !== 0) continue;
    factors.push(p);
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) factors.push(m);
  return factors;
}

function isSquarefree(n) {
  for (let p = 2; p * p <= n; p++) if (n % (p * p) === 0) return false;
  return true;
}

function integerTwists(limit) {
  const out = [];
  for (let n = 1; out.length < limit; n++) if (isSquarefree(n)) out.push({ id: `${n}`, n, factors: factorDistinct(n) });
  return out;
}

function legendrePrimeNumerator(l, p) {
  if (l === p) return 0;
  if (l === 2) {
    const r = p % 8;
    return r === 1 || r === 7 ? 1 : -1;
  }
  const residues = legendrePrimeNumerator.cache.get(l) || (() => {
    const set = new Set();
    for (let x = 1; x < l; x++) set.add((x * x) % l);
    legendrePrimeNumerator.cache.set(l, set);
    return set;
  })();
  let value = residues.has(p % l) ? 1 : -1;
  if (l % 4 === 3 && p % 4 === 3) value = -value;
  return value;
}
legendrePrimeNumerator.cache = new Map();

function legendreSquarefree(d, p) {
  let out = 1;
  for (const factor of d.factors) {
    const symbol = legendrePrimeNumerator(factor, p);
    if (symbol === 0) return 0;
    out *= symbol;
  }
  return out;
}

function quadraticCharacterTable(p) {
  const chi = new Int8Array(p);
  chi.fill(-1);
  chi[0] = 0;
  for (let y = 1; y <= (p - 1) >> 1; y++) chi[(y * y) % p] = 1;
  return chi;
}

function bruteCmTracePrimeField(p) {
  const chi = quadraticCharacterTable(p);
  let characterSum = 0;
  for (let x = 0; x < p; x++) characterSum += chi[mod((x * x * x) - x, p)];
  return -characterSum;
}

function buildTwoSquareRepresentations(limit) {
  const maxRoot = Math.floor(Math.sqrt(limit));
  const aRep = new Int16Array(limit + 1);
  const bRep = new Int16Array(limit + 1);
  aRep.fill(-1);
  for (let a = 0; a <= maxRoot; a++) {
    const aa = a * a;
    for (let b = 0; aa + b * b <= limit; b++) {
      const n = aa + b * b;
      if (aRep[n] === -1) {
        aRep[n] = a;
        bRep[n] = b;
      }
    }
  }
  return { aRep, bRep };
}

function traceFromTwoSquares(p, aRep, bRep) {
  if (p === 2) return 0;
  if (p % 4 === 3) return 0;
  const a = aRep[p];
  const b = bRep[p];
  if (a < 0) throw new Error(`missing two-square representation for p=${p}`);
  for (const x of [a, -a, b, -b]) {
    const y2 = p - x * x;
    if (y2 < 0) continue;
    const y = Math.round(Math.sqrt(y2));
    if (y * y !== y2) continue;
    if (Math.abs(x) % 2 === 1 && mod(x + y, 4) === 1) return 2 * x;
  }
  throw new Error(`missing CM sign choice for p=${p}, a=${a}, b=${b}`);
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

function sampleObserved(values, count, seed) {
  const random = rng(seed);
  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = values[Math.floor(random() * values.length)];
  return out;
}

function signFlip(values, seed) {
  const random = rng(seed);
  return values.map((value) => (random() < 0.5 ? -value : value));
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

function holdoutSummary(runs) {
  const blocks = runs.map((run) => run.blocks.at(-1));
  return {
    zRange: range(blocks.map((row) => row.z)),
    absZRange: range(blocks.map((row) => Math.abs(row.z))),
  };
}

function integerAudit(twists) {
  console.error(`[twist-cm] rational primes to ${maxN}`);
  const primes = primesUpTo(maxN).filter((p) => p >= 3);
  const { aRep, bRep } = buildTwoSquareRepresentations(maxN);
  const records = primes.map((p) => {
    const baseTrace = traceFromTwoSquares(p, aRep, bRep);
    let good = 0;
    let characterSum = 0;
    for (const twist of twists) {
      const symbol = legendreSquarefree(twist, p);
      if (symbol === 0) continue;
      good++;
      characterSum += symbol;
    }
    const value = good ? baseTrace * characterSum / Math.sqrt(p * good) : 0;
    return { p, baseTrace, good, characterSum, value };
  });
  const endpointCounts = endpoints.map((endpoint) => records.filter((record) => record.p <= endpoint).length);
  const values = records.map((record) => record.value);
  const maxCount = Math.max(...endpointCounts);
  const real = scoreValues("real-prime-order quadratic-twist CM family", values, endpointCounts);
  const controls = {
    shuffle: seeds.map((seed) => scoreValues(`shuffle-${seed}`, shuffle(values, seed), endpointCounts)),
    signFlip: seeds.map((seed) => scoreValues(`sign-flip-${seed}`, signFlip(values, seed ^ 0x9e3779b9), endpointCounts)),
    bootstrap: seeds.map((seed) => scoreValues(`bootstrap-${seed}`, sampleObserved(values, maxCount, seed ^ 0x517cc1b7), endpointCounts)),
  };
  const validation = [3, 5, 7, 13, 17, 29, 37, 53, 97].map((p) => ({
    p,
    formulaTrace: traceFromTwoSquares(p, aRep, bRep),
    bruteTrace: bruteCmTracePrimeField(p),
    ok: traceFromTwoSquares(p, aRep, bRep) === bruteCmTracePrimeField(p),
  }));
  return {
    endpoints,
    twists: twists.map((twist) => twist.id),
    recordsCount: records.length,
    real,
    controls,
    controlSummary: Object.fromEntries(Object.entries(controls).map(([key, runs]) => [key, summarizeControls(runs)])),
    holdout: {
      real: real.blocks.at(-1),
      shuffle: holdoutSummary(controls.shuffle),
      signFlip: holdoutSummary(controls.signFlip),
      bootstrap: holdoutSummary(controls.bootstrap),
    },
    validation,
    sampleRecords: records.slice(0, 12),
  };
}

function fieldTwists(q, limit) {
  const twists = [];
  for (let c = 0; c < q && twists.length < limit; c++) twists.push({ id: `t+${c}`, poly: q + c });
  for (let a = 0; a < q && twists.length < limit; a++) {
    for (let b = 0; b < q && twists.length < limit; b++) {
      twists.push({ id: `t^2+${a}t+${b}`, poly: q * q + a * q + b });
    }
  }
  return twists;
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

function fieldTraceSequence(q, maxDegree) {
  const a1 = bruteCmTracePrimeField(q);
  const traces = new Array(maxDegree + 1).fill(0);
  traces[0] = 2;
  traces[1] = a1;
  for (let d = 2; d <= maxDegree; d++) traces[d] = a1 * traces[d - 1] - q * traces[d - 2];
  return traces;
}

function fieldAudit(q, maxDegree) {
  console.error(`[twist-cm] F_${q}[t] degrees <= ${maxDegree}`);
  const twists = fieldTwists(q, familyLimit);
  const traces = fieldTraceSequence(q, maxDegree);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const rows = [];
  let cumulativeLabels = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsZ = 0;
  for (let degree = 1; degree <= maxDegree; degree++) {
    const fieldSize = q ** degree;
    const baseTrace = traces[degree];
    let labels = 0;
    let degreeSum = 0;
    for (const primePoly of universe.irreduciblesByDegree[degree]) {
      const modulusCoeffs = coeffsFixed(primePoly, q, degree);
      let good = 0;
      let characterSum = 0;
      for (const twist of twists) {
        const residue = polyMod(twist.poly, primePoly, q);
        const symbol = quadraticCharacterResidue(residue, modulusCoeffs, q, degree);
        if (symbol === 0) continue;
        good++;
        characterSum += symbol;
      }
      if (!good) continue;
      const value = baseTrace * characterSum / Math.sqrt(fieldSize * good);
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
      baseTrace,
      degreeMean: degreeSum / Math.max(1, labels),
      z: sum / Math.sqrt(Math.max(1, cumulativeLabels)),
      energyZ: sum / Math.sqrt(Math.max(1e-30, sumSquares)),
      maxAbsZ,
    });
  }
  return {
    q,
    maxDegree,
    twists: twists.map((twist) => twist.id),
    theoremObject: "incomplete quadratic-twist family E_D:y^2=x^3-D(t)^2*x over residue fields F_q[t]/P",
    rows,
  };
}

function summarize(integer, fields) {
  const completeIntegerLadder = requiredIntegerEndpoints.every((n) => endpoints.includes(n));
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
  const fieldEndpointZ = finalFields.map((field) => field.final.z);
  const signs = [finalInteger.z, ...fieldEndpointZ].map((z) => Math.sign(z));
  const signsAligned = signs.every((sign) => sign === signs[0]);
  const magnitudes = [Math.abs(finalInteger.z), ...fieldEndpointZ.map(Math.abs)].filter((value) => value > 0);
  const profileSpread = Math.max(...magnitudes) / Math.max(1e-12, Math.min(...magnitudes));
  const matchedProfile = integerBeatsControls && signsAligned && profileSpread <= 3;
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
  return rows.map((row) => `| N<=${row.endpoint} | ${row.count} | ${fmt(row.mean)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderFieldRows(rows) {
  return rows.map((row) => `| ${row.label} | ${row.labels} | ${row.cumulativeLabels} | ${fmt(row.degreeMean)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Quadratic-twist CM family audit", "");
  lines.push("Candidate:");
  lines.push("test an incomplete quadratic-twist family of the CM curve `E:y^2=x^3-x`.", "");
  lines.push("Integer side: squarefree twists `d` in a fixed low-conductor window. Function-field side: polynomial twists `D(t)` in a fixed low-degree window. Statistic:");
  lines.push("");
  lines.push("`V_S(K)=sum_{D in S, D!=0 mod K} chi_K(D) * a_K(E) / sqrt(|K| * good_D)`.", "");
  lines.push("This breaks complete-family orthogonality and avoids constant-curve degree-only profiles by using nonconstant twist polynomials on the `F_q[t]` side.", "");
  lines.push("## Summary", "");
  lines.push(`- Complete integer ladder 1M/2M/4M/8M: ${report.summary.completeIntegerLadder}`);
  lines.push(`- Required q=3,5,7 field ladders: ${report.summary.completeFieldLadders}`);
  lines.push(`- Trace formula validation passed: ${report.summary.validationPassed}`);
  lines.push(`- Integer beats controls: ${report.summary.integerBeatsControls}`);
  lines.push(`- Signs aligned: ${report.summary.signsAligned}`);
  lines.push(`- Profile spread: ${fmt(report.summary.profileSpread)}`);
  lines.push(`- Matched profile: ${report.summary.matchedProfile}`);
  lines.push(`- Max endpoint |z|: ${fmt(report.summary.maxAbsEndpointZ)}`, "");
  lines.push("## Integer Rows", "");
  lines.push(`Twists: ${report.integer.twists.map((twist) => `\`${twist}\``).join(", ")}`, "");
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
    lines.push(`Twists: ${field.twists.map((twist) => `\`${twist}\``).join(", ")}`, "");
    lines.push("| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
    lines.push(renderFieldRows(field.rows));
  }
  lines.push("", "## Trace Validation", "");
  lines.push("| p | formula trace | brute trace | ok |");
  lines.push("| ---: | ---: | ---: | --- |");
  for (const row of report.integer.validation) lines.push(`| ${row.p} | ${row.formulaTrace} | ${row.bruteTrace} | ${row.ok} |`);
  lines.push("", "## Novelty Audit", "");
  lines.push("- This is a real mutation from cycle 018: the `F_q[t]` side uses nonconstant quadratic twists, not a constant curve.");
  lines.push("- It is not promoted unless the integer profile survives controls and the q=3,5,7 field profiles match in sign and scale.");
  lines.push("- If this fails, the next step must leave CM twist factorization and use non-CM monodromy or a theorem-first incomplete-family residual.", "");
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
<text x="${pad}" y="38" fill="#f8fafc" font-size="20" font-weight="700">Quadratic-twist CM family residual</text>
<text x="${pad}" y="62" fill="#94a3b8" font-size="13">Incomplete twist family V_S(K)=Σ chi(D)a_K(E)/sqrt(|K|good)</text>
<rect x="${pad}" y="88" width="${width - 2 * pad}" height="390" fill="none" stroke="#334155"/>
${paths}
${legend}
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
const twists = integerTwists(familyLimit);
const integer = integerAudit(twists);
const fields = [
  fieldAudit(3, q3MaxDegree),
  fieldAudit(5, q5MaxDegree),
  fieldAudit(7, q7MaxDegree),
];
const summary = summarize(integer, fields);
const base = `cycle-019-quadratic-twist-cm-family-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Quadratic-twist CM family residual",
  generatedAt: new Date().toISOString(),
  maxN,
  q3MaxDegree,
  q5MaxDegree,
  q7MaxDegree,
  familyLimit,
  endpoints,
  seeds,
  theoremShape: {
    statistic: "V_S(K)=sum_{D in S, D nonzero} chi_K(D)*a_K(E)/sqrt(|K|*good_D), E:y^2=x^3-x",
    integer: "K=F_p with squarefree integer twists d in a low-conductor window",
    functionField: "K=F_q[t]/P with low-degree nonconstant polynomial twists D(t)",
    baseline: "Quadratic-twist trace factorization gives exact values; promotion requires matched residual profile beyond integer controls.",
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
