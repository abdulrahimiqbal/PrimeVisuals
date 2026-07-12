#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";

const maxN = Math.max(100_000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q3MaxDegree = Number.parseInt(process.argv[4] || "14", 10);
const q5MaxDegree = Number.parseInt(process.argv[5] || "10", 10);
const q7MaxDegree = Number.parseInt(process.argv[6] || "8", 10);

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

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function range(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? [Math.min(...finite), Math.max(...finite)] : [NaN, NaN];
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

function integerAudit() {
  console.error(`[cm-elliptic] rational primes to ${maxN}`);
  const primes = primesUpTo(maxN).filter((p) => p >= 3);
  const { aRep, bRep } = buildTwoSquareRepresentations(maxN);
  const records = primes.map((p) => {
    const trace = traceFromTwoSquares(p, aRep, bRep);
    return {
      p,
      trace,
      u1: trace / (2 * Math.sqrt(p)),
      u2: (trace * trace) / p - 1,
      mod4: p % 4,
    };
  });
  const endpointCounts = endpoints.map((endpoint) => records.filter((record) => record.p <= endpoint).length);
  const values = records.map((record) => record.u2);
  const maxCount = Math.max(...endpointCounts);
  const real = scoreValues("real-prime-order CM U2", values, endpointCounts);
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
    recordsCount: records.length,
    traceFormula: "E:y^2=x^3-x has a_p=0 for p=3 mod 4; for p=a^2+b^2, choose odd a with a+b=1 mod 4 and a_p=2a",
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

function fieldTraceSequence(q, maxDegree) {
  const a1 = bruteCmTracePrimeField(q);
  const traces = new Array(maxDegree + 1).fill(0);
  traces[0] = 2;
  traces[1] = a1;
  for (let d = 2; d <= maxDegree; d++) traces[d] = a1 * traces[d - 1] - q * traces[d - 2];
  return traces;
}

function fieldAudit(q, maxDegree) {
  console.error(`[cm-elliptic] F_${q}[t] degrees <= ${maxDegree}`);
  const traces = fieldTraceSequence(q, maxDegree);
  const rows = [];
  let cumulativeLabels = 0;
  let sum = 0;
  let sumSquares = 0;
  let maxAbsZ = 0;
  for (let degree = 1; degree <= maxDegree; degree++) {
    const labels = irreducibleCount(q, degree);
    const fieldSize = q ** degree;
    const trace = traces[degree];
    const u2 = (trace * trace) / fieldSize - 1;
    cumulativeLabels += labels;
    sum += labels * u2;
    sumSquares += labels * u2 * u2;
    const z = sum / Math.sqrt(Math.max(1, cumulativeLabels));
    maxAbsZ = Math.max(maxAbsZ, Math.abs(z));
    rows.push({
      label: `F_${q}:deg${degree}`,
      q,
      degree,
      labels,
      cumulativeLabels,
      fieldSize,
      trace,
      u2,
      z,
      energyZ: sum / Math.sqrt(Math.max(1e-30, sumSquares)),
      maxAbsZ,
    });
  }
  return {
    q,
    maxDegree,
    baseTrace: traces[1],
    labels: `monic irreducibles P in F_${q}[t]`,
    theoremObject: "constant CM elliptic curve E:y^2=x^3-x over residue fields F_q[t]/P",
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
  const fieldIntegerZSpread = Math.max(Math.abs(finalInteger.z), ...fieldEndpointZ.map(Math.abs))
    / Math.max(1e-12, Math.min(Math.abs(finalInteger.z), ...fieldEndpointZ.map((z) => Math.abs(z)).filter((z) => z > 0)));
  const fieldSignsAligned = fieldEndpointZ.every((z) => Math.sign(z) === Math.sign(finalInteger.z));
  const matchedProfile = integerBeatsControls && fieldSignsAligned && fieldIntegerZSpread <= 3;
  return {
    completeIntegerLadder,
    completeFieldLadders,
    validationPassed,
    integerBeatsControls,
    fieldSignsAligned,
    fieldIntegerZSpread,
    matchedProfile,
    maxAbsEndpointZ: Math.max(Math.abs(finalInteger.z), ...fieldEndpointZ.map(Math.abs)),
    finalInteger,
    finalFields,
  };
}

function renderRows(rows) {
  return rows.map((row) => `| ${row.label ?? `N<=${row.endpoint}`} | ${row.count ?? row.cumulativeLabels} | ${fmt(row.u2 ?? row.mean)} | ${fmt(row.z)} | ${fmt(row.energyZ)} | ${fmt(row.maxAbsZ)} |`).join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# CM elliptic spectral residual audit", "");
  lines.push("Candidate:");
  lines.push("test the fixed CM elliptic curve `E: y^2=x^3-x` using the spectral statistic `u2(K)=a_K(E)^2/|K|-1`.", "");
  lines.push("Integer side: rational primes `p`. Function-field side: residue fields `F_q[t]/P`; since the curve is constant, `a_{q^d}` depends only on `q` and `deg(P)`.", "");
  lines.push("## Summary", "");
  lines.push(`- Complete integer ladder 1M/2M/4M/8M: ${report.summary.completeIntegerLadder}`);
  lines.push(`- Required q=3,5,7 field ladders: ${report.summary.completeFieldLadders}`);
  lines.push(`- Trace formula validation passed: ${report.summary.validationPassed}`);
  lines.push(`- Integer beats order/null controls: ${report.summary.integerBeatsControls}`);
  lines.push(`- Field signs aligned with integer endpoint: ${report.summary.fieldSignsAligned}`);
  lines.push(`- Field/integer endpoint z spread: ${fmt(report.summary.fieldIntegerZSpread)}`);
  lines.push(`- Matched profile: ${report.summary.matchedProfile}`);
  lines.push(`- Max endpoint |z|: ${fmt(report.summary.maxAbsEndpointZ)}`, "");
  lines.push("## Integer Rows", "");
  lines.push("| endpoint | labels | mean u2 | z | energy z | max abs z |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  lines.push(renderRows(report.integer.real.rows));
  lines.push("", "## Integer Control Summary", "");
  lines.push("| control | final |z| range | max |z| range | energy z range |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const [name, row] of Object.entries(report.integer.controlSummary)) {
    lines.push(`| ${name} | ${fmt(row.absZRange[0])}..${fmt(row.absZRange[1])} | ${fmt(row.maxAbsZRange[0])}..${fmt(row.maxAbsZRange[1])} | ${fmt(row.energyZRange[0])}..${fmt(row.energyZRange[1])} |`);
  }
  for (const field of report.fields) {
    lines.push("", `## F_${field.q}[t] Rows`, "");
    lines.push("| endpoint | cumulative labels | u2 | z | energy z | max abs z |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
    lines.push(renderRows(field.rows));
  }
  lines.push("", "## Trace Validation", "");
  lines.push("| p | formula trace | brute trace | ok |");
  lines.push("| ---: | ---: | ---: | --- |");
  for (const row of report.integer.validation) lines.push(`| ${row.p} | ${row.formulaTrace} | ${row.bruteTrace} | ${row.ok} |`);
  lines.push("", "## Novelty Audit", "");
  lines.push("- This breaks the complete-family orthogonality pattern by using one fixed CM curve.");
  lines.push("- It is not promoted if the integer order is absorbed by controls or if the field profiles do not match the integer profile.");
  lines.push("- Constant-curve residue fields are degree-rigid; a stronger next step would need nonconstant monodromy over `F_q(t)` or an incomplete family with a theorem-normalized nonzero residual.", "");
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
<text x="${pad}" y="38" fill="#f8fafc" font-size="20" font-weight="700">CM elliptic spectral residual</text>
<text x="${pad}" y="62" fill="#94a3b8" font-size="13">u2(K)=a_K(E)^2/|K|-1 for E:y^2=x^3-x</text>
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
const base = `cycle-018-cm-elliptic-spectral-residual-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "CM elliptic spectral residual",
  generatedAt: new Date().toISOString(),
  maxN,
  q3MaxDegree,
  q5MaxDegree,
  q7MaxDegree,
  endpoints,
  seeds,
  theoremShape: {
    statistic: "u2(K)=a_K(E)^2/|K|-1 for E:y^2=x^3-x",
    integer: "K=F_p for rational primes p>=3, with CM trace formula by two-square representation",
    functionField: "K=F_q[t]/P; for constant E/F_q, a_K is computed by the Frobenius recurrence a_{q^d}=a_q*a_{q^{d-1}}-q*a_{q^{d-2}}",
    baseline: "CM Sato-Tate predicts mean-zero u2 in aggregate, but no exact labelwise cancellation is subtracted.",
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
  fieldSignsAligned: summary.fieldSignsAligned,
  fieldIntegerZSpread: summary.fieldIntegerZSpread,
  matchedProfile: summary.matchedProfile,
  maxAbsEndpointZ: summary.maxAbsEndpointZ,
  paths,
}, null, 2));
