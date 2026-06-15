#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { buildPolynomialUniverse, polyMod, polyToString } from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const moduli = (process.argv[4] || "30,210").split(",").map((x) => Number(x.trim())).filter(Boolean);
const q2MaxDegree = Number(process.argv[5] || 24);
const q3MaxDegree = Number(process.argv[6] || 15);
const q2ModulusDegree = Number(process.argv[7] || 3);
const q3ModulusDegree = Number(process.argv[8] || 2);

const seeds = [12345, 271828, 314159, 161803, 424242];
const scales = [N / 8, N / 4, N / 2, N].map((x) => Math.max(200_000, Math.round(x)));
const smoothing = 0.5;

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
  let x = Math.abs(a), y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function totient(n) {
  let out = n, m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    out -= Math.floor(out / p);
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= Math.floor(out / m);
  return out;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function upperBound(arr, x) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function valuesInRange(values, lo, hi) {
  const start = upperBound(values, lo);
  const out = [];
  for (let i = start; i < values.length && values[i] <= hi; i++) out.push(values[i]);
  return out;
}

function wheelRandomLabels(limit, W, seed, isp, compositeOnly = false) {
  const phiW = totient(W);
  const densityFactor = W / phiW;
  const random = rng(seed);
  const labels = [];
  const smallPrimes = [];
  for (let p = 2; p <= W && p <= limit; p++) if (isp[p]) smallPrimes.push(p);
  if (!compositeOnly) labels.push(...smallPrimes);
  for (let n = Math.max(5, W + 1); n <= limit; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, densityFactor / Math.log(n))) labels.push(n);
  }
  labels.sort((a, b) => a - b);
  return labels;
}

function residueMapInteger(modulus) {
  const residues = [];
  const map = new Map();
  for (let r = 0; r < modulus; r++) {
    if (gcd(r, modulus) !== 1) continue;
    map.set(r, residues.length);
    residues.push(r);
  }
  return { residues, map };
}

function statesFromInteger(values, modulus, mapper = residueMapInteger(modulus)) {
  return values.map((value) => mapper.map.get(value % modulus) ?? -1).filter((state) => state >= 0);
}

function trainMatrix(states, stateCount) {
  const matrix = Array.from({ length: stateCount }, () => new Float64Array(stateCount).fill(smoothing));
  const rowSums = new Float64Array(stateCount).fill(smoothing * stateCount);
  for (let i = 0; i + 1 < states.length; i++) {
    const a = states[i], b = states[i + 1];
    matrix[a][b]++;
    rowSums[a]++;
  }
  return { matrix, rowSums };
}

function transitionPairs(states) {
  const pairs = [];
  for (let i = 0; i + 1 < states.length; i++) pairs.push([states[i], states[i + 1]]);
  return pairs;
}

function logScore(pairs, model) {
  if (!pairs.length) return NaN;
  let sum = 0;
  for (const [a, b] of pairs) sum += Math.log(model.matrix[a][b] / model.rowSums[a]);
  return sum / pairs.length;
}

function shuffledPairs(pairs, random) {
  const next = pairs.map((pair) => pair[1]);
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const t = next[i];
    next[i] = next[j];
    next[j] = t;
  }
  return pairs.map((pair, i) => [pair[0], next[i]]);
}

function scoreHoldout(trainStates, testStates, stateCount, controlSeeds = seeds) {
  if (trainStates.length < 4 || testStates.length < 4) return null;
  const model = trainMatrix(trainStates, stateCount);
  const pairs = transitionPairs(testStates);
  if (pairs.length < 3) return null;
  const observed = logScore(pairs, model);
  const controlScores = controlSeeds.map((seed) => logScore(shuffledPairs(pairs, rng(seed)), model));
  const fakeMean = mean(controlScores);
  const aggregate = (observed - fakeMean) * Math.sqrt(pairs.length);
  const controlAggregates = controlScores.map((score, index) => {
    const others = controlScores.filter((_, j) => j !== index);
    return (score - mean(others)) * Math.sqrt(pairs.length);
  });
  const rowCounts = new Int32Array(stateCount);
  const nextCounts = new Int32Array(stateCount);
  for (const [a, b] of pairs) {
    rowCounts[a]++;
    nextCounts[b]++;
  }
  return {
    trainStates: trainStates.length,
    testStates: testStates.length,
    transitions: pairs.length,
    observed,
    fakeMean,
    residual: observed - fakeMean,
    aggregate,
    controlAggregates,
    controlRange: range(controlAggregates),
    activeRows: Array.from(rowCounts).filter(Boolean).length,
    activeNext: Array.from(nextCounts).filter(Boolean).length,
  };
}

function summarizeIntegerSequence(name, values, modulus) {
  const mapper = residueMapInteger(modulus);
  const rows = [];
  for (const scale of scales) {
    const lo = Math.floor(scale / 2);
    const hi = scale;
    const mid = Math.floor((lo + hi) / 2);
    const train = statesFromInteger(valuesInRange(values, lo, mid), modulus, mapper);
    const test = statesFromInteger(valuesInRange(values, mid, hi), modulus, mapper);
    rows.push({ lo, mid, hi, score: scoreHoldout(train, test, mapper.residues.length) });
  }
  return { name, modulus, stateCount: mapper.residues.length, residues: mapper.residues, rows };
}

function integerAudit(isp) {
  const primes = primesUpTo(N);
  const cramer = seeds.map((seed) => cramerPrimes(N, seed));
  const wheel = seeds.map((seed) => wheelRandomLabels(N, 210, seed, isp, false));
  const composite = seeds.map((seed) => wheelRandomLabels(N, 210, seed, isp, true));
  const byModulus = {};
  for (const modulus of moduli) {
    byModulus[modulus] = {
      real: summarizeIntegerSequence("real-primes", primes, modulus),
      cramer: cramer.map((values, i) => summarizeIntegerSequence(`cramer-${seeds[i]}`, values, modulus)),
      wheel: wheel.map((values, i) => summarizeIntegerSequence(`wheel-${seeds[i]}`, values, modulus)),
      composite: composite.map((values, i) => summarizeIntegerSequence(`composite-${seeds[i]}`, values, modulus)),
    };
  }
  return byModulus;
}

function fieldResidueMapper(q, modulus) {
  const norm = q ** polynomialDegreeInt(modulus, q);
  const residues = [];
  const map = new Map();
  for (let r = 1; r < norm; r++) {
    map.set(r, residues.length);
    residues.push(r);
  }
  return {
    norm,
    residues,
    map,
    stateCount: residues.length,
    state(poly) {
      const r = polyMod(poly, modulus, q);
      return map.get(r) ?? -1;
    },
  };
}

function polynomialDegreeInt(poly, q) {
  if (poly <= 0) return -1;
  let d = 0, p = 1;
  while (p * q <= poly) {
    p *= q;
    d++;
  }
  return d;
}

function sampleCompositePolynomials(flags, degree, q, count, seed) {
  const random = rng(seed);
  const total = flags.length - flags.reduce((sum, flag) => sum + flag, 0);
  let remainingNeed = Math.min(count, total);
  let remaining = total;
  const lead = q ** degree;
  const out = [];
  for (let lower = 0; lower < flags.length && remainingNeed > 0; lower++) {
    if (flags[lower]) continue;
    if (random() < remainingNeed / remaining) {
      out.push(lead + lower);
      remainingNeed--;
    }
    remaining--;
  }
  return out;
}

function summarizeFieldValues(name, q, degree, values, mapper) {
  const mid = Math.floor(values.length / 2);
  const train = values.slice(0, mid).map((value) => mapper.state(value)).filter((state) => state >= 0);
  const test = values.slice(mid).map((value) => mapper.state(value)).filter((state) => state >= 0);
  return {
    name,
    q,
    degree,
    count: values.length,
    score: scoreHoldout(train, test, mapper.stateCount),
  };
}

function fieldAudit(q, maxDegree, modulusDegree) {
  const universe = buildPolynomialUniverse(q, Math.max(maxDegree, modulusDegree));
  const modulus = universe.irreduciblesByDegree[modulusDegree][0];
  const mapper = fieldResidueMapper(q, modulus);
  const start = Math.max(modulusDegree + 3, maxDegree - 3);
  const degrees = Array.from({ length: maxDegree - start + 1 }, (_, i) => start + i);
  const rows = [];
  for (const degree of degrees) {
    const values = universe.irreduciblesByDegree[degree].map((lower) => q ** degree + lower);
    const flags = universe.irreducibleFlagsByDegree[degree];
    const real = summarizeFieldValues("irreducibles-encoded-order", q, degree, values, mapper);
    const composite = seeds.map((seed) => summarizeFieldValues(
      `composite-sample-${seed}`,
      q,
      degree,
      sampleCompositePolynomials(flags, degree, q, values.length, seed),
      mapper,
    ));
    rows.push({ degree, real, composite });
  }
  return {
    q,
    maxDegree,
    modulusDegree,
    modulus,
    modulusLabel: polyToString(modulus, q),
    stateCount: mapper.stateCount,
    rows,
  };
}

function finalScore(summary) {
  return summary.rows.at(-1).score;
}

function finalSeriesScores(series) {
  return series.map((item) => finalScore(item)).filter(Boolean);
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function mdRowsInteger(summary) {
  return summary.rows.map((row) => {
    const s = row.score;
    return `| ${row.lo}..${row.hi} | ${s?.transitions ?? 0} | ${fmt(s?.observed)} | ${fmt(s?.fakeMean)} | ${fmt(s?.residual)} | ${fmt(s?.aggregate)} | ${s ? s.controlRange.map((v) => fmt(v)).join(" .. ") : "NA"} |`;
  }).join("\n");
}

function mdRowsField(field) {
  return field.rows.map((row) => {
    const s = row.real.score;
    const composites = row.composite.map((item) => item.score?.aggregate).filter(Number.isFinite);
    return `| ${row.degree} | ${s?.transitions ?? 0} | ${fmt(s?.observed)} | ${fmt(s?.fakeMean)} | ${fmt(s?.residual)} | ${fmt(s?.aggregate)} | ${s ? s.controlRange.map((v) => fmt(v)).join(" .. ") : "NA"} | ${composites.length ? range(composites).map((v) => fmt(v)).join(" .. ") : "NA"} |`;
  }).join("\n");
}

function linePath(values, x, y, w, h, minY, maxY) {
  const sx = (i) => x + (i / Math.max(1, values.length - 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  return values.map((v, i) => `${i ? "L" : "M"} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`).join(" ");
}

function svg(integer210, q2, q3) {
  const width = 1160, height = 760;
  const real = integer210.real.rows.map((row) => row.score?.aggregate ?? 0);
  const cramerMean = integer210.cramer[0].rows.map((_, i) => mean(integer210.cramer.map((s) => s.rows[i].score?.aggregate ?? 0)));
  const wheelMean = integer210.wheel[0].rows.map((_, i) => mean(integer210.wheel.map((s) => s.rows[i].score?.aggregate ?? 0)));
  const compositeMean = integer210.composite[0].rows.map((_, i) => mean(integer210.composite.map((s) => s.rows[i].score?.aggregate ?? 0)));
  const f2 = q2.rows.map((row) => row.real.score?.aggregate ?? 0);
  const f3 = q3.rows.map((row) => row.real.score?.aggregate ?? 0);
  const all = [...real, ...cramerMean, ...wheelMean, ...compositeMean, ...f2, ...f3, 0];
  const minY = Math.min(...all) * 1.08;
  const maxY = Math.max(...all) * 1.08;
  const chart = { x: 82, y: 72, w: 1000, h: 310 };
  const zeroY = chart.y + chart.h - ((0 - minY) / (maxY - minY || 1)) * chart.h;
  const final = finalScore(integer210.real);
  const finalCramer = finalSeriesScores(integer210.cramer).map((s) => s.aggregate);
  const finalWheel = finalSeriesScores(integer210.wheel).map((s) => s.aggregate);
  const finalComposite = finalSeriesScores(integer210.composite).map((s) => s.aggregate);
  const finalQ2 = q2.rows.at(-1).real.score;
  const finalQ3 = q3.rows.at(-1).real.score;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<g font-family="Menlo, Consolas, monospace">
<text x="54" y="36" fill="#f8fafc" font-size="18">holdout residue-transition Markov surprise</text>
<text x="54" y="56" fill="#94a3b8" font-size="12">train lower-half transition matrix, test upper-half log-score versus row-shuffled next residues</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="none" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${zeroY.toFixed(2)}" y2="${zeroY.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
<path d="${linePath(real, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#a7f3d0" stroke-width="3"/>
<path d="${linePath(cramerMean, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fbbf24" stroke-width="2"/>
<path d="${linePath(wheelMean, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#7dd3fc" stroke-width="2"/>
<path d="${linePath(compositeMean, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#fb7185" stroke-width="2"/>
<path d="${linePath(f2, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#c4b5fd" stroke-width="2"/>
<path d="${linePath(f3, chart.x, chart.y, chart.w, chart.h, minY, maxY)}" fill="none" stroke="#f472b6" stroke-width="2"/>
<text x="${chart.x}" y="${chart.y + chart.h + 24}" fill="#94a3b8" font-size="12">integer scales / F_q top degrees</text>
<text x="${chart.x + 560}" y="${chart.y + chart.h + 24}" fill="#a7f3d0" font-size="12">Z primes</text>
<text x="${chart.x + 655}" y="${chart.y + chart.h + 24}" fill="#fbbf24" font-size="12">Cramer mean</text>
<text x="${chart.x + 780}" y="${chart.y + chart.h + 24}" fill="#7dd3fc" font-size="12">wheel mean</text>
<text x="${chart.x + 900}" y="${chart.y + chart.h + 24}" fill="#fb7185" font-size="12">comp mean</text>
</g>
<g font-family="Menlo, Consolas, monospace" font-size="12">
<text x="90" y="460" fill="#e5e7eb">final integer mod 210</text>
<text x="90" y="488" fill="#a7f3d0">prime aggregate ${fmt(final.aggregate)}, residual ${fmt(final.residual)}, transitions ${final.transitions}</text>
<text x="90" y="512" fill="#94a3b8">row-shuffle controls ${final.controlRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="90" y="536" fill="#fbbf24">Cramer aggregate range ${range(finalCramer).map((v) => fmt(v)).join(" .. ")}</text>
<text x="90" y="560" fill="#7dd3fc">wheel aggregate range ${range(finalWheel).map((v) => fmt(v)).join(" .. ")}</text>
<text x="90" y="584" fill="#fb7185">composite aggregate range ${range(finalComposite).map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="460" fill="#e5e7eb">function-field encoded-order check</text>
<text x="650" y="488" fill="#c4b5fd">F2 aggregate ${fmt(finalQ2.aggregate)}, controls ${finalQ2.controlRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="512" fill="#f472b6">F3 aggregate ${fmt(finalQ3.aggregate)}, controls ${finalQ3.controlRange.map((v) => fmt(v)).join(" .. ")}</text>
<text x="650" y="560" fill="#94a3b8">positive = test transitions match previous-block Markov memory</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
console.error(`[transition-holdout] building integer sequences to ${N}`);
const isp = sieve(N);
const integer = integerAudit(isp);
console.error(`[transition-holdout] F_2[t] degree ${q2MaxDegree}, modulus degree ${q2ModulusDegree}`);
const q2 = fieldAudit(2, q2MaxDegree, q2ModulusDegree);
console.error(`[transition-holdout] F_3[t] degree ${q3MaxDegree}, modulus degree ${q3ModulusDegree}`);
const q3 = fieldAudit(3, q3MaxDegree, q3ModulusDegree);

const tag = `residue-transition-holdout-audit-${N}-q${moduli.join("-")}-f${q2ModulusDegree}${q3ModulusDegree}`;
const jsonPath = path.join(outDir, `${tag}.json`);
const mdPath = path.join(outDir, `${tag}.md`);
const svgPath = path.join(outDir, `${tag}.svg`);
const output = {
  candidate: "holdout residue-transition Markov surprise",
  N,
  scales,
  moduli,
  smoothing,
  integer,
  q2,
  q3,
};

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
const svgModulus = moduli.includes(210) ? 210 : moduli.at(-1);
fs.writeFileSync(svgPath, svg(integer[svgModulus], q2, q3));

let md = `# holdout residue-transition Markov surprise audit

Candidate:
train a smoothed residue transition matrix on the lower half of each fresh
range, score upper-half consecutive labels by log likelihood, and subtract
row-shuffled next-residue controls.

Aggregate: \`(observed log score - mean row-shuffle score) * sqrt(test
transitions)\`.

Smoothing: \`${smoothing}\`.

## Integer paths
`;

for (const modulus of moduli) {
  const group = integer[modulus];
  const final = finalScore(group.real);
  const cramerFinal = finalSeriesScores(group.cramer).map((s) => s.aggregate);
  const wheelFinal = finalSeriesScores(group.wheel).map((s) => s.aggregate);
  const compositeFinal = finalSeriesScores(group.composite).map((s) => s.aggregate);
  md += `
### modulus ${modulus}

Reduced residue states: \`${group.real.stateCount}\`.

| block | transitions | observed | fake mean | residual | aggregate | row-shuffle controls |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${mdRowsInteger(group.real)}

Final controls:

- row-shuffle aggregate range: \`${final.controlRange.map((v) => fmt(v)).join(" .. ")}\`
- Cramer aggregate range: \`${range(cramerFinal).map((v) => fmt(v)).join(" .. ")}\`
- wheel aggregate range: \`${range(wheelFinal).map((v) => fmt(v)).join(" .. ")}\`
- composite aggregate range: \`${range(compositeFinal).map((v) => fmt(v)).join(" .. ")}\`
`;
}

md += `
## F_2[t] encoded-order path

Residue modulus: \`${q2.modulusLabel}\`; states: \`${q2.stateCount}\`.

| degree | transitions | observed | fake mean | residual | aggregate | row-shuffle controls | composite aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
${mdRowsField(q2)}

## F_3[t] encoded-order path

Residue modulus: \`${q3.modulusLabel}\`; states: \`${q3.stateCount}\`.

| degree | transitions | observed | fake mean | residual | aggregate | row-shuffle controls | composite aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
${mdRowsField(q3)}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;

fs.writeFileSync(mdPath, md);

const summaryModulus = integer[svgModulus];
console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  finalInteger: {
    modulus: svgModulus,
    ...finalScore(summaryModulus.real),
    cramerAggregateRange: range(finalSeriesScores(summaryModulus.cramer).map((s) => s.aggregate)),
    wheelAggregateRange: range(finalSeriesScores(summaryModulus.wheel).map((s) => s.aggregate)),
    compositeAggregateRange: range(finalSeriesScores(summaryModulus.composite).map((s) => s.aggregate)),
  },
  finalQ2: q2.rows.at(-1).real.score,
  finalQ3: q3.rows.at(-1).real.score,
}, null, 2));
