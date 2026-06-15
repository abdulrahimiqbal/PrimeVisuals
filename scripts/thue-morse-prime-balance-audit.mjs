#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildPolynomialUniverse } from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve, thueMorseValue } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 22);
const q3MaxDegree = Number(process.argv[5] || 13);
const seeds = [
  12345, 271828, 314159, 161803, 424242,
  8675309, 1013904223, 2654435761, 11235813, 14142135,
  17320508, 22360679, 24494897, 31415926, 27182818,
];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));

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

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function linearFit(xs, ys) {
  const mx = mean(xs), my = mean(ys);
  let sxx = 0, sxy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  const slope = sxy / (sxx || 1);
  return { slope, intercept: my - slope * mx };
}

function exponent(rows, key, scaleKey = "labels") {
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function digitSign(n, base) {
  if (base === 2) return thueMorseValue(n);
  let x = Math.max(0, Math.round(n));
  let parity = 0;
  while (x > 0) {
    parity ^= x % base & 1;
    x = Math.floor(x / base);
  }
  return parity ? -1 : 1;
}

function labelsUpTo(sorted, limit) {
  let hi = 0;
  while (hi < sorted.length && sorted[hi] <= limit) hi++;
  return sorted.slice(0, hi);
}

function sampleWithoutReplacement(pool, count, seed) {
  if (count > pool.length) throw new Error(`cannot sample ${count} from pool of ${pool.length}`);
  const random = rng(seed);
  const copy = pool.slice();
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (copy.length - i));
    const value = copy[j];
    copy[j] = copy[i];
    copy[i] = value;
    out[i] = value;
  }
  out.sort((a, b) => a - b);
  return out;
}

function compositePool(limit, primeFlags, smallPrimeLimit) {
  const smallPrimes = smallPrimeLimit > 1 ? primesUpTo(smallPrimeLimit) : [];
  const out = [];
  for (let n = 3; n <= limit; n++) {
    if (primeFlags[n]) continue;
    let eligible = true;
    for (const p of smallPrimes) {
      if (n % p === 0) {
        eligible = false;
        break;
      }
    }
    if (!eligible) continue;
    out.push(n);
  }
  return out;
}

function reducedResiduePool(limit, modulus) {
  const out = [];
  for (let n = 2; n <= limit; n++) {
    if (gcd(n, modulus) === 1) out.push(n);
  }
  return out;
}

function summarizeLabels(name, labels, base = 2) {
  const rows = [];
  let acc = 0;
  let maxAbs = 0;
  let j = 0;
  for (const x of endpoints) {
    while (j < labels.length && labels[j] <= x) {
      acc += digitSign(labels[j], base);
      maxAbs = Math.max(maxAbs, Math.abs(acc));
      j++;
    }
    const scale = Math.sqrt(Math.max(1, j));
    rows.push({
      N: x,
      labels: j,
      value: acc,
      normalized: acc / scale,
      maxAbs,
      maxAbsOverSqrtLabels: maxAbs / scale,
    });
  }
  const blocks = rows.map((row, i) => {
    const prev = i ? rows[i - 1] : null;
    const value = row.value - (prev ? prev.value : 0);
    const labels = row.labels - (prev ? prev.labels : 0);
    return { lo: i ? rows[i - 1].N : 1, hi: row.N, labels, value, normalized: value / Math.sqrt(Math.max(1, labels)) };
  });
  return {
    name,
    base,
    rows,
    blocks,
    theta: {
      maxAbs: exponent(rows, "maxAbs"),
      absValue: exponent(rows.map((row) => ({ ...row, absValue: Math.abs(row.value) })), "absValue"),
    },
  };
}

function summarizeControls(controls) {
  const endpointRows = controls.map((control) => control.rows.at(-1));
  return {
    normalized: range(endpointRows.map((row) => row.normalized)),
    maxAbsOverSqrtLabels: range(endpointRows.map((row) => row.maxAbsOverSqrtLabels)),
    maxAbsTheta: range(controls.map((control) => control.theta.maxAbs)),
  };
}

function namedCompositeChecks(primeFlags) {
  return [25, 35, 77, 289].map((n) => ({
    n,
    isPrime: Boolean(primeFlags[n]),
    admissibleAsPrimeInput: Boolean(primeFlags[n]),
    base2Sign: digitSign(n, 2),
    base3Sign: digitSign(n, 3),
    base10Sign: digitSign(n, 10),
  }));
}

function integerAudit() {
  console.error(`[thue-morse] integer sieve to ${N}`);
  const primeFlags = sieve(N);
  const primes = primesUpTo(N);
  const real2 = summarizeLabels("real-primes-base2", primes, 2);
  const real3 = summarizeLabels("real-primes-base3", primes, 3);
  const real10 = summarizeLabels("real-primes-base10", primes, 10);
  const shells = [
    summarizeLabels("W6-candidates-base2", reducedResiduePool(N, 6), 2),
    summarizeLabels("W210-candidates-base2", reducedResiduePool(N, 210), 2),
  ];
  const cramer = seeds.map((seed) => summarizeLabels(`cramer-base2-${seed}`, cramerPrimes(N, seed), 2));
  const composites = compositePool(N, primeFlags, 7);
  const roughComposites = compositePool(N, primeFlags, 31);
  const composite = seeds.map((seed) => summarizeLabels(
    `sampled-composite-base2-${seed}`,
    sampleWithoutReplacement(composites, primes.length, seed),
    2,
  ));
  const roughComposite = seeds.map((seed) => summarizeLabels(
    `rough31-composite-base2-${seed}`,
    sampleWithoutReplacement(roughComposites, primes.length, seed ^ 0x517cc1b7),
    2,
  ));
  return {
    rows: [real2, real3, real10],
    shells,
    cramer,
    composite,
    roughComposite,
    poolSizes: {
      primes: primes.length,
      composite210: composites.length,
      rough31Composite: roughComposites.length,
    },
    namedComposites: namedCompositeChecks(primeFlags),
    summary: {
      cramer: summarizeControls(cramer),
      composite: summarizeControls(composite),
      roughComposite: summarizeControls(roughComposite),
    },
  };
}

function coefficientDigitSign(poly, q) {
  let x = Math.max(0, Math.round(poly));
  let parity = 0;
  while (x > 0) {
    parity ^= x % q & 1;
    x = Math.floor(x / q);
  }
  return parity ? -1 : 1;
}

function summarizePolynomialLabels(universe, degree, labels, name) {
  let sum = 0;
  let maxAbs = 0;
  for (const label of labels) {
    sum += coefficientDigitSign(label, universe.q);
    maxAbs = Math.max(maxAbs, Math.abs(sum));
  }
  const scale = Math.sqrt(Math.max(1, labels.length));
  return {
    degree,
    labels: labels.length,
    name,
    value: sum,
    normalized: sum / scale,
    maxAbs,
    maxAbsOverSqrtLabels: maxAbs / scale,
  };
}

function samplePolynomialLabels(universe, degree, count, seed, mode) {
  const lead = universe.pow[degree];
  const flags = universe.irreducibleFlagsByDegree[degree];
  const pool = [];
  for (let lower = 0; lower < flags.length; lower++) {
    if (mode === "reducible" && flags[lower]) continue;
    pool.push(lead + lower);
  }
  return sampleWithoutReplacement(pool, count, seed);
}

function polynomialAudit(q, maxDegree) {
  console.error(`[thue-morse] F_${q}[t] through degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const start = Math.max(2, maxDegree - 3);
  const rows = [];
  for (let degree = start; degree <= maxDegree; degree++) {
    const labels = universe.irreduciblesByDegree[degree];
    const real = summarizePolynomialLabels(universe, degree, labels, `F_${q}[t]-irreducibles`);
    const randomMonic = seeds.map((seed) => summarizePolynomialLabels(
      universe,
      degree,
      samplePolynomialLabels(universe, degree, labels.length, seed, "monic"),
      `F_${q}[t]-random-monic-${seed}`,
    ));
    const randomReducible = seeds.map((seed) => summarizePolynomialLabels(
      universe,
      degree,
      samplePolynomialLabels(universe, degree, labels.length, seed ^ 0x9e3779b9, "reducible"),
      `F_${q}[t]-random-reducible-${seed}`,
    ));
    rows.push({
      degree,
      real,
      randomMonic: summarizeControls(randomMonic.map((control) => ({ rows: [control], theta: { maxAbs: 0 } }))),
      randomReducible: summarizeControls(randomReducible.map((control) => ({ rows: [control], theta: { maxAbs: 0 } }))),
      randomMonicRows: randomMonic,
      randomReducibleRows: randomReducible,
    });
  }
  return { q, rows };
}

function makeSvg(report) {
  const width = 1180;
  const height = 680;
  const margin = { left: 70, right: 330, top: 70, bottom: 78 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const intSeries = [
    { id: "Z base 2", color: "#67e8f9", rows: report.integer.rows[0].rows.map((row, i) => ({ x: i, y: row.maxAbsOverSqrtLabels })) },
    { id: "Z base 3", color: "#fbbf24", rows: report.integer.rows[1].rows.map((row, i) => ({ x: i, y: row.maxAbsOverSqrtLabels })) },
    { id: "Z base 10", color: "#fb7185", rows: report.integer.rows[2].rows.map((row, i) => ({ x: i, y: row.maxAbsOverSqrtLabels })) },
    { id: "W6 candidates", color: "#eab308", rows: report.integer.shells[0].rows.map((row, i) => ({ x: i, y: row.maxAbsOverSqrtLabels })) },
    { id: "W210 candidates", color: "#84cc16", rows: report.integer.shells[1].rows.map((row, i) => ({ x: i, y: row.maxAbsOverSqrtLabels })) },
    { id: "Cramer mean", color: "#a78bfa", rows: report.integer.rows[0].rows.map((_row, i) => ({ x: i, y: mean(report.integer.cramer.map((control) => control.rows[i].maxAbsOverSqrtLabels)) })) },
    { id: "Composite mean", color: "#34d399", rows: report.integer.rows[0].rows.map((_row, i) => ({ x: i, y: mean(report.integer.composite.map((control) => control.rows[i].maxAbsOverSqrtLabels)) })) },
    { id: "Rough31 composite mean", color: "#f97316", rows: report.integer.rows[0].rows.map((_row, i) => ({ x: i, y: mean(report.integer.roughComposite.map((control) => control.rows[i].maxAbsOverSqrtLabels)) })) },
  ];
  const f2 = report.polynomial.find((row) => row.q === 2);
  const f3 = report.polynomial.find((row) => row.q === 3);
  const fieldSeries = [
    { id: "F2 coeff parity", color: "#22d3ee", rows: f2.rows.map((row, i) => ({ x: i + 6, y: row.real.maxAbsOverSqrtLabels })) },
    { id: "F3 coeff parity", color: "#60a5fa", rows: f3.rows.map((row, i) => ({ x: i + 11, y: row.real.maxAbsOverSqrtLabels })) },
  ];
  const series = [...intSeries, ...fieldSeries];
  const yMax = Math.max(...series.flatMap((s) => s.rows.map((row) => row.y)), 1) * 1.1;
  const xOf = (point) => margin.left + (point.x / 14) * plotW;
  const yOf = (point) => margin.top + (1 - point.y / yMax) * plotH;
  const line = (rows) => rows.map((point) => `${xOf(point).toFixed(2)},${yOf(point).toFixed(2)}`).join(" ");
  const grid = [];
  for (let i = 0; i <= 6; i++) {
    const y = margin.top + (i / 6) * plotH;
    const val = yMax - (i / 6) * yMax;
    grid.push(`<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1f2937"/>`);
    grid.push(`<text x="18" y="${y + 4}" fill="#94a3b8" font-size="12">${fmt(val, 2)}</text>`);
  }
  const paths = series.map((s) => {
    const circles = s.rows.map((point) => `<circle cx="${xOf(point)}" cy="${yOf(point)}" r="4" fill="${s.color}"/>`).join("");
    return `<polyline points="${line(s.rows)}" fill="none" stroke="${s.color}" stroke-width="3"/>${circles}`;
  }).join("\n");
  const legend = series.map((s, i) => {
    const x = margin.left + (i % 3) * 205;
    const y = 36 + Math.floor(i / 3) * 18;
    return `<text x="${x}" y="${y}" fill="${s.color}" font-size="13">${s.id}</text>`;
  }).join("\n");
  const notes = [
    `Z endpoint base2 ${fmt(report.integer.rows[0].rows.at(-1).maxAbsOverSqrtLabels)}`,
    `W6 endpoint ${fmt(report.integer.shells[0].rows.at(-1).maxAbsOverSqrtLabels)}`,
    `W210 endpoint ${fmt(report.integer.shells[1].rows.at(-1).maxAbsOverSqrtLabels)}`,
    `Cramer ${fmt(report.integer.summary.cramer.maxAbsOverSqrtLabels[0])}..${fmt(report.integer.summary.cramer.maxAbsOverSqrtLabels[1])}`,
    `composite ${fmt(report.integer.summary.composite.maxAbsOverSqrtLabels[0])}..${fmt(report.integer.summary.composite.maxAbsOverSqrtLabels[1])}`,
    `rough31 comp ${fmt(report.integer.summary.roughComposite.maxAbsOverSqrtLabels[0])}..${fmt(report.integer.summary.roughComposite.maxAbsOverSqrtLabels[1])}`,
    `F2 endpoint ${fmt(f2.rows.at(-1).real.maxAbsOverSqrtLabels)}`,
    `F3 endpoint ${fmt(f3.rows.at(-1).real.maxAbsOverSqrtLabels)}`,
  ].map((text, i) => `<text x="${width - 290}" y="${110 + i * 28}" fill="#cbd5e1" font-size="13">${text}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="25" fill="#e5e7eb" font-size="18" font-weight="700">Thue-Morse prime balance audit</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${paths}
${notes}
<text x="${margin.left}" y="${height - 36}" fill="#94a3b8" font-size="13">y: max |sum sign(label)| / sqrt(label count). Integer scales first, then coefficient-parity function-field checks.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Thue-Morse prime-balance audit", "");
  lines.push("Candidate:");
  lines.push("`T(x)=sum_{p<=x}(-1)^{s_2(p)}`, scored by `max |T| / sqrt(pi(x))`.", "");
  lines.push("## Integer side", "");
  lines.push("| series | endpoint labels | final normalized | maxAbs/sqrt(labels) | maxAbs theta | block normalized values |");
  lines.push("| --- | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.integer.rows) {
    const last = row.rows.at(-1);
    lines.push(`| ${row.name} | ${last.labels} | ${fmt(last.normalized)} | ${fmt(last.maxAbsOverSqrtLabels)} | ${fmt(row.theta.maxAbs)} | ${row.blocks.map((block) => fmt(block.normalized, 3)).join(", ")} |`);
  }
  lines.push("");
  lines.push("Exact local-shell comparators:");
  lines.push("");
  lines.push("| shell | endpoint labels | final normalized | maxAbs/sqrt(labels) | maxAbs theta |");
  lines.push("| --- | ---: | ---: | ---: | ---: |");
  for (const row of report.integer.shells) {
    const last = row.rows.at(-1);
    lines.push(`| ${row.name} | ${last.labels} | ${fmt(last.normalized)} | ${fmt(last.maxAbsOverSqrtLabels)} | ${fmt(row.theta.maxAbs)} |`);
  }
  lines.push("");
  lines.push(`Cramer endpoint maxAbs/sqrt(labels): ${fmt(report.integer.summary.cramer.maxAbsOverSqrtLabels[0])}..${fmt(report.integer.summary.cramer.maxAbsOverSqrtLabels[1])}.`);
  lines.push(`Sampled composite endpoint maxAbs/sqrt(labels): ${fmt(report.integer.summary.composite.maxAbsOverSqrtLabels[0])}..${fmt(report.integer.summary.composite.maxAbsOverSqrtLabels[1])}.`);
  lines.push(`Rough31 composite endpoint maxAbs/sqrt(labels): ${fmt(report.integer.summary.roughComposite.maxAbsOverSqrtLabels[0])}..${fmt(report.integer.summary.roughComposite.maxAbsOverSqrtLabels[1])}.`);
  lines.push(`Pool sizes: primes ${report.integer.poolSizes.primes}, W210 composites ${report.integer.poolSizes.composite210}, rough31 composites ${report.integer.poolSizes.rough31Composite}.`);
  lines.push("");
  lines.push("Named composite checks:");
  lines.push("");
  lines.push("| n | prime input? | base2 sign | base3 sign | base10 sign |");
  lines.push("| ---: | --- | ---: | ---: | ---: |");
  for (const row of report.integer.namedComposites) {
    lines.push(`| ${row.n} | ${row.admissibleAsPrimeInput ? "yes" : "no"} | ${row.base2Sign} | ${row.base3Sign} | ${row.base10Sign} |`);
  }
  lines.push("");
  lines.push("## Function-field coefficient-parity check", "");
  for (const group of report.polynomial) {
    lines.push(`### F_${group.q}[t]`, "");
    lines.push("| degree | irreducibles | real normalized | real maxAbs/sqrt(labels) | random monic maxAbs range | random reducible maxAbs range |");
    lines.push("| ---: | ---: | ---: | ---: | ---: | ---: |");
    for (const row of group.rows) {
      lines.push(`| ${row.degree} | ${row.real.labels} | ${fmt(row.real.normalized)} | ${fmt(row.real.maxAbsOverSqrtLabels)} | ${fmt(row.randomMonic.maxAbsOverSqrtLabels[0])}..${fmt(row.randomMonic.maxAbsOverSqrtLabels[1])} | ${fmt(row.randomReducible.maxAbsOverSqrtLabels[0])}..${fmt(row.randomReducible.maxAbsOverSqrtLabels[1])} |`);
    }
    lines.push("");
  }
  lines.push("## Factor check", "");
  lines.push("Over `F_2[t]`, coefficient parity is `f(1)`. A monic irreducible of degree greater than one cannot have `f(1)=0`, or it would be divisible by `t+1`. Therefore the sign is forced for almost every irreducible. The two-universe version explodes by algebra, not by prime regularity.");
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
const integer = integerAudit();
const polynomial = [
  polynomialAudit(2, q2MaxDegree),
  polynomialAudit(3, q3MaxDegree),
];
const paths = {
  json: path.join(outDir, `thue-morse-prime-balance-audit-${N}.json`),
  md: path.join(outDir, `thue-morse-prime-balance-audit-${N}.md`),
  svg: path.join(outDir, `thue-morse-prime-balance-audit-${N}.svg`),
};
const report = {
  candidate: "Thue-Morse prime balance",
  generatedAt: new Date().toISOString(),
  N,
  endpoints,
  q2MaxDegree,
  q3MaxDegree,
  seeds,
  integer,
  polynomial,
  paths,
};
fs.writeFileSync(paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(paths.md, makeMarkdown(report));
fs.writeFileSync(paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  integerEndpoint: integer.rows.map((row) => ({
    name: row.name,
    labels: row.rows.at(-1).labels,
    normalized: row.rows.at(-1).normalized,
    maxAbsOverSqrtLabels: row.rows.at(-1).maxAbsOverSqrtLabels,
  })),
  shellEndpoints: integer.shells.map((row) => ({
    name: row.name,
    labels: row.rows.at(-1).labels,
    normalized: row.rows.at(-1).normalized,
    maxAbsOverSqrtLabels: row.rows.at(-1).maxAbsOverSqrtLabels,
    maxAbsTheta: row.theta.maxAbs,
  })),
  cramerMaxAbsRange: integer.summary.cramer.maxAbsOverSqrtLabels,
  compositeMaxAbsRange: integer.summary.composite.maxAbsOverSqrtLabels,
  roughCompositeMaxAbsRange: integer.summary.roughComposite.maxAbsOverSqrtLabels,
  fieldEndpoints: polynomial.map((group) => ({
    q: group.q,
    degree: group.rows.at(-1).degree,
    normalized: group.rows.at(-1).real.normalized,
    maxAbsOverSqrtLabels: group.rows.at(-1).real.maxAbsOverSqrtLabels,
  })),
  paths,
}, null, 2));
