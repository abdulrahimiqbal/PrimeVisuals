#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";
import { buildPolynomialUniverse } from "../src/core/ffield.js";

const maxN = Math.max(100_000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/two-universes-protocol";
const q2MaxDegree = Number.parseInt(process.argv[4] || "18", 10);
const q5MaxDegree = Number.parseInt(process.argv[5] || "8", 10);
const q7MaxDegree = Number.parseInt(process.argv[6] || "7", 10);
const familyLimit = Number.parseInt(process.argv[7] || "10", 10);

const requiredIntegerEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = requiredIntegerEndpoints.filter((n) => n <= maxN);
if (endpoints.length === 0) endpoints.push(maxN);
const seeds = [137, 1009, 7919, 65537, 104729];
const integerCovers = [2, 5, 7, 11, 13, 17, 19, 23, 29, 31].slice(0, familyLimit);
const covVariance = 4 / 81;
const bothVariance = (1 / 9) * (8 / 9);
const robustCovRmsThreshold = 1.75;
const robustMaxAbsZThreshold = 4.25;

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
  let b = ((base % mod) + mod) % mod;
  let e = Math.floor(exp);
  let out = 1 % mod;
  while (e > 0) {
    if (e & 1) out = (out * b) % mod;
    b = (b * b) % mod;
    e = Math.floor(e / 2);
  }
  return out;
}

function polyDegree(poly, q) {
  let f = Math.floor(poly);
  if (f <= 0) return -1;
  let d = 0;
  while (f >= q) {
    f = Math.floor(f / q);
    d++;
  }
  return d;
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

function coeffsDynamic(poly, q) {
  const degree = polyDegree(poly, q);
  const out = new Int16Array(Math.max(0, degree + 1));
  let x = Math.floor(poly);
  for (let i = 0; i <= degree; i++) {
    out[i] = x % q;
    x = Math.floor(x / q);
  }
  return out;
}

function encodeCoeffs(coeffs, q, length = coeffs.length) {
  let out = 0;
  let pow = 1;
  for (let i = 0; i < length; i++) {
    const c = ((coeffs[i] % q) + q) % q;
    out += c * pow;
    pow *= q;
  }
  return out;
}

function polyMod(poly, modulus, q) {
  const modDegree = polyDegree(modulus, q);
  if (modDegree <= 0) return 0;
  const degree = polyDegree(poly, q);
  if (degree < modDegree) return poly;
  const work = Array.from(coeffsDynamic(poly, q), (x) => x);
  const modCoeffs = Array.from(coeffsDynamic(modulus, q), (x) => x);
  for (let k = degree; k >= modDegree; k--) {
    const lead = ((work[k] % q) + q) % q;
    if (!lead) continue;
    for (let i = 0; i < modDegree; i++) {
      work[k - modDegree + i] = (work[k - modDegree + i] - lead * modCoeffs[i]) % q;
    }
    work[k] = 0;
  }
  return encodeCoeffs(work, q, modDegree);
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
  let b = encodeCoeffs(coeffsFixed(polyMod(base, modulus, q), q, degree), q, degree);
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

function polynomialName(poly, q) {
  const coeffs = coeffsDynamic(poly, q);
  const terms = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (!c) continue;
    const coeff = c === 1 && i > 0 ? "" : `${c}`;
    const power = i === 0 ? "" : i === 1 ? "t" : `t^${i}`;
    terms.push(`${coeff}${power}`);
  }
  return terms.length ? terms.join("+") : "0";
}

function isSquarefreeMonicQuadratic(q, a, b) {
  if (q === 2) return a !== 0;
  return (((a * a - 4 * b) % q) + q) % q !== 0;
}

function fieldCovers(q, limit) {
  const covers = [];
  for (let a = 0; a < q && covers.length < limit; a++) {
    const poly = q + a;
    covers.push({ id: polynomialName(poly, q), poly, degree: 1 });
  }
  for (let a = 0; a < q && covers.length < limit; a++) {
    for (let b = 0; b < q && covers.length < limit; b++) {
      if (!isSquarefreeMonicQuadratic(q, a, b)) continue;
      const poly = q ** 2 + a * q + b;
      covers.push({ id: polynomialName(poly, q), poly, degree: 2 });
    }
  }
  return covers;
}

function pairTemplate(covers) {
  const pairs = [];
  for (let i = 0; i < covers.length; i++) {
    for (let j = i + 1; j < covers.length; j++) {
      pairs.push({
        i,
        j,
        key: `${covers[i].id}|${covers[j].id}`,
        a: covers[i].id,
        b: covers[j].id,
        labels: 0,
        splitA: 0,
        splitB: 0,
        bothSplit: 0,
        covarianceSum: 0,
      });
    }
  }
  return pairs;
}

function updatePairs(pairs, splitVector) {
  for (const pair of pairs) {
    const x = splitVector[pair.i];
    const y = splitVector[pair.j];
    if (x === null || y === null) continue;
    pair.labels++;
    if (x) pair.splitA++;
    if (y) pair.splitB++;
    if (x && y) pair.bothSplit++;
    pair.covarianceSum += (x - 1 / 3) * (y - 1 / 3);
  }
}

function scorePairs(label, scale, coverCount, pairs) {
  const pairRows = pairs.map((pair) => {
    const covZ = pair.labels ? pair.covarianceSum / Math.sqrt(pair.labels * covVariance) : NaN;
    const bothZ = pair.labels ? (pair.bothSplit - pair.labels / 9) / Math.sqrt(pair.labels * bothVariance) : NaN;
    return {
      key: pair.key,
      a: pair.a,
      b: pair.b,
      labels: pair.labels,
      splitRateA: pair.labels ? pair.splitA / pair.labels : NaN,
      splitRateB: pair.labels ? pair.splitB / pair.labels : NaN,
      bothRate: pair.labels ? pair.bothSplit / pair.labels : NaN,
      covariance: pair.labels ? pair.covarianceSum / pair.labels : NaN,
      covZ,
      bothZ,
    };
  });
  const activePairs = pairRows.filter((row) => row.labels > 0 && Number.isFinite(row.covZ));
  const covZs = activePairs.map((row) => row.covZ);
  const bothZs = activePairs.map((row) => row.bothZ);
  return {
    label,
    scale,
    coverCount,
    pairCount: pairs.length,
    activePairCount: activePairs.length,
    minPairLabels: activePairs.length ? Math.min(...activePairs.map((row) => row.labels)) : 0,
    maxPairLabels: activePairs.length ? Math.max(...activePairs.map((row) => row.labels)) : 0,
    covRmsZ: activePairs.length ? Math.sqrt(mean(covZs.map((z) => z * z))) : 0,
    bothRmsZ: activePairs.length ? Math.sqrt(mean(bothZs.map((z) => z * z))) : 0,
    maxAbsCovZ: Math.max(0, ...covZs.map((z) => Math.abs(z))),
    topPairs: activePairs
      .slice()
      .sort((a, b) => Math.abs(b.covZ) - Math.abs(a.covZ))
      .slice(0, 8),
    pairs: pairRows,
  };
}

function sampleControlRow(row, seed) {
  const random = rng(seed);
  const sampledPairs = row.pairs
    .filter((pair) => pair.labels > 0)
    .map((pair) => {
      let covarianceSum = 0;
      let bothSplit = 0;
      for (let i = 0; i < pair.labels; i++) {
        const x = random() < 1 / 3 ? 1 : 0;
        const y = random() < 1 / 3 ? 1 : 0;
        covarianceSum += (x - 1 / 3) * (y - 1 / 3);
        if (x && y) bothSplit++;
      }
      const covZ = covarianceSum / Math.sqrt(pair.labels * covVariance);
      const bothZ = (bothSplit - pair.labels / 9) / Math.sqrt(pair.labels * bothVariance);
      return { covZ, bothZ };
    });
  return {
    covRmsZ: Math.sqrt(mean(sampledPairs.map((pair) => pair.covZ * pair.covZ))),
    bothRmsZ: Math.sqrt(mean(sampledPairs.map((pair) => pair.bothZ * pair.bothZ))),
    maxAbsCovZ: Math.max(0, ...sampledPairs.map((pair) => Math.abs(pair.covZ))),
  };
}

function summarizeControlRows(rows) {
  return {
    covRmsZRange: range(rows.map((row) => row.covRmsZ)),
    bothRmsZRange: range(rows.map((row) => row.bothRmsZ)),
    maxAbsCovZRange: range(rows.map((row) => row.maxAbsCovZ)),
  };
}

function attachControls(row) {
  const controls = summarizeControlRows(seeds.map((seed) => sampleControlRow(row, seed)));
  const envelope = {
    covRmsZHigh: Math.max(controls.covRmsZRange[1], robustCovRmsThreshold),
    maxAbsCovZHigh: Math.max(controls.maxAbsCovZRange[1], robustMaxAbsZThreshold),
  };
  const withinControls = row.covRmsZ <= envelope.covRmsZHigh && row.maxAbsCovZ <= envelope.maxAbsCovZHigh;
  return {
    ...row,
    controls,
    envelope,
    withinControls,
    beatsControls: !withinControls,
  };
}

function classifyIntegerCover(c, p) {
  if (p % 3 !== 1) return null;
  if (p % c === 0) return null;
  return modPow(c, (p - 1) / 3, p) === 1 ? 1 : 0;
}

function integerAudit() {
  console.error(`[family-chebotarev] integer primes to ${maxN}`);
  const covers = integerCovers.map((c) => ({ id: `${c}`, c }));
  const primes = Array.from(primesUpTo(maxN));
  const pairs = pairTemplate(covers);
  const rows = [];
  let endpointIndex = 0;
  let activeLabels = 0;
  for (const p of primes) {
    if (p % 3 === 1) {
      const splitVector = covers.map((cover) => classifyIntegerCover(cover.c, p));
      if (splitVector.some((value) => value !== null)) {
        activeLabels++;
        updatePairs(pairs, splitVector);
      }
    }
    while (endpointIndex < endpoints.length && p >= endpoints[endpointIndex]) {
      rows.push(attachControls(scorePairs(`Z<=${endpoints[endpointIndex]}`, endpoints[endpointIndex], covers.length, pairs)));
      endpointIndex++;
    }
  }
  while (endpointIndex < endpoints.length) {
    rows.push(attachControls(scorePairs(`Z<=${endpoints[endpointIndex]}`, endpoints[endpointIndex], covers.length, pairs)));
    endpointIndex++;
  }
  return {
    covers: covers.map((cover) => cover.id),
    endpoints,
    activeCondition: "p == 1 mod 3 and p does not divide the cover constant",
    activeLabels,
    rows,
  };
}

function classifyFieldCover(base, q, degree, primePoly) {
  const size = q ** degree;
  if ((size - 1) % 3 !== 0) return null;
  const residue = polyMod(base, primePoly, q);
  if (residue === 0) return null;
  return polyPowModFast(residue, (size - 1) / 3, primePoly, q, degree) === 1 ? 1 : 0;
}

function fieldAudit(q, maxDegree) {
  console.error(`[family-chebotarev] F_${q}[t] degree ${maxDegree}`);
  const covers = fieldCovers(q, familyLimit);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const rows = [];
  for (let degree = 1; degree <= maxDegree; degree++) {
    const pairs = pairTemplate(covers);
    let activeLabels = 0;
    for (const primePoly of universe.irreduciblesByDegree[degree]) {
      const splitVector = covers.map((cover) => classifyFieldCover(cover.poly, q, degree, primePoly));
      if (splitVector.some((value) => value !== null)) {
        activeLabels++;
        updatePairs(pairs, splitVector);
      }
    }
    rows.push(attachControls({
      ...scorePairs(`F_${q}:deg${degree}`, degree, covers.length, pairs),
      activeLabels,
      activeDegree: ((q ** degree) - 1) % 3 === 0,
    }));
  }
  return {
    q,
    maxDegree,
    covers: covers.map((cover) => cover.id),
    activeCondition: "q^deg(P)-1 divisible by 3, with A(t) nonzero modulo P",
    rows,
  };
}

function finalActiveFieldRow(field) {
  return field.rows.slice().reverse().find((row) => row.activePairCount > 0) || field.rows.at(-1);
}

function summarize(integer, fields) {
  const finalInteger = integer.rows.at(-1);
  const finalFields = fields.map((field) => ({ q: field.q, row: finalActiveFieldRow(field) }));
  const hasRequiredIntegerScaleLadder = requiredIntegerEndpoints.every((n) => endpoints.includes(n));
  const hasRequiredFieldLadders = fields.map((field) => field.q).sort((a, b) => a - b).join(",") === "2,5,7"
    && finalFields.every((field) => field.row.activePairCount > 0);
  const integerWithinControls = finalInteger.withinControls;
  const fieldsWithinControls = finalFields.every((field) => field.row.withinControls);
  const matchedControlSurvival = finalInteger.beatsControls && finalFields.every((field) => field.row.beatsControls);
  const endpointEnergies = [finalInteger.covRmsZ, ...finalFields.map((field) => field.row.covRmsZ)].filter(Number.isFinite);
  const profileSpread = Math.max(...endpointEnergies) / Math.max(1e-12, Math.min(...endpointEnergies));
  return {
    hasRequiredIntegerScaleLadder,
    hasRequiredFieldLadders,
    integerWithinControls,
    fieldsWithinControls,
    allWithinControls: integerWithinControls && fieldsWithinControls,
    matchedControlSurvival,
    profileSpread,
    profileAligned: matchedControlSurvival && profileSpread <= 2,
    maxCovRmsZ: Math.max(...endpointEnergies),
    maxAbsCovZ: Math.max(finalInteger.maxAbsCovZ, ...finalFields.map((field) => field.row.maxAbsCovZ)),
    finalInteger: {
      label: finalInteger.label,
      covRmsZ: finalInteger.covRmsZ,
      maxAbsCovZ: finalInteger.maxAbsCovZ,
      withinControls: finalInteger.withinControls,
      beatsControls: finalInteger.beatsControls,
      envelope: finalInteger.envelope,
      topPairs: finalInteger.topPairs,
    },
    finalFields: finalFields.map((field) => ({
      q: field.q,
      label: field.row.label,
      covRmsZ: field.row.covRmsZ,
      maxAbsCovZ: field.row.maxAbsCovZ,
      withinControls: field.row.withinControls,
      beatsControls: field.row.beatsControls,
      envelope: field.row.envelope,
      topPairs: field.row.topPairs,
    })),
  };
}

function renderEndpointRows(rows) {
  return rows.map((row) => `| ${row.label} | ${row.coverCount} | ${row.activePairCount} | ${row.activePairCount ? row.minPairLabels : "NA"} | ${row.activePairCount ? fmt(row.covRmsZ) : "NA"} | ${row.activePairCount ? fmt(row.maxAbsCovZ) : "NA"} | ${fmt(row.envelope.covRmsZHigh)} | ${fmt(row.envelope.maxAbsCovZHigh)} | ${row.withinControls} |`).join("\n");
}

function renderTopPairs(row) {
  return row.topPairs.map((pair) => `| ${pair.a} | ${pair.b} | ${pair.labels} | ${fmt(pair.splitRateA)} | ${fmt(pair.splitRateB)} | ${fmt(pair.bothRate)} | ${fmt(pair.covZ)} |`).join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Family cubic Chebotarev covariance audit", "");
  lines.push("Candidate:");
  lines.push("test a family-level covariance residual across many cubic Kummer covers after subtracting the Chebotarev split baseline.", "");
  lines.push("Statistic:");
  lines.push("for covers A,B and active unramified labels lambda, set X_A(lambda)=1 when A is a cube in the residue field and 0 otherwise. Score");
  lines.push("");
  lines.push("`Z_AB = sum_lambda (X_A(lambda)-1/3)(X_B(lambda)-1/3) / sqrt(|labels| * 4/81)`", "");
  lines.push("The family energy is RMS of `Z_AB`; the max statistic is `max |Z_AB|`. Controls use Bernoulli(1/3) split labels with the same pair label counts plus robust multiple-testing envelopes.", "");
  lines.push("## Summary", "");
  lines.push(`- Complete integer ladder 1M/2M/4M/8M: ${report.summary.hasRequiredIntegerScaleLadder}`);
  lines.push(`- Required q=2,5,7 field ladders: ${report.summary.hasRequiredFieldLadders}`);
  lines.push(`- Final integer within controls: ${report.summary.integerWithinControls}`);
  lines.push(`- Final fields within controls: ${report.summary.fieldsWithinControls}`);
  lines.push(`- Matched control survival: ${report.summary.matchedControlSurvival}`);
  lines.push(`- Max family covariance RMS z: ${fmt(report.summary.maxCovRmsZ)}`);
  lines.push(`- Max pair absolute z: ${fmt(report.summary.maxAbsCovZ)}`, "");
  lines.push("## Integer Rows", "");
  lines.push(`Covers: ${report.integer.covers.map((cover) => `\`${cover}\``).join(", ")}`, "");
  lines.push("| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  lines.push(renderEndpointRows(report.integer.rows));
  lines.push("", "### Integer Top Final Pairs", "");
  lines.push("| A | B | labels | split A | split B | both split | cov z |");
  lines.push("| --- | --- | ---: | ---: | ---: | ---: | ---: |");
  lines.push(renderTopPairs(report.integer.rows.at(-1)));
  for (const field of report.fields) {
    lines.push("", `## F_${field.q}[t] Rows`, "");
    lines.push(`Covers: ${field.covers.map((cover) => `\`${cover}\``).join(", ")}`, "");
    lines.push("| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
    lines.push(renderEndpointRows(field.rows));
    const finalRow = finalActiveFieldRow(field);
    lines.push("", `### F_${field.q}[t] Top Final Active Pairs`, "");
    lines.push("| A | B | labels | split A | split B | both split | cov z |");
    lines.push("| --- | --- | ---: | ---: | ---: | ---: | ---: |");
    lines.push(renderTopPairs(finalRow));
  }
  lines.push("", "## Novelty Audit", "");
  lines.push("- This is a family-level object, so it is a real mutation from cycles 013 and 014.");
  lines.push("- The null explanation is still standard Chebotarev/Kummer equidistribution for independent cubic residue characters.");
  lines.push("- A promotion would require matched control-surviving covariance in Z and every required F_q[t] ladder, plus a proof path that is not just Chebotarev independence.");
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
    ...report.fields.map((field, i) => ({ name: `F_${field.q}`, rows: field.rows.filter((row) => row.activePairCount > 0), color: ["#22c55e", "#f59e0b", "#f472b6"][i] })),
  ];
  const width = 1180;
  const height = 660;
  const pad = 78;
  const maxY = Math.max(1, ...series.flatMap((s) => s.rows.map((row) => row.covRmsZ || 0))) * 1.2;
  const paths = series.map((s) => `<path d="${linePath(s.rows.map((row) => row.covRmsZ || 0), pad, 88, width - 2 * pad, 390, 0, maxY)}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`).join("\n");
  const legend = series.map((s, i) => `<text x="${pad + i * 150}" y="530" fill="${s.color}" font-size="13">${s.name}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#07111f"/>
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="38" fill="#f8fafc" font-size="20" font-weight="700">Family cubic Chebotarev covariance</text>
<text x="${pad}" y="62" fill="#94a3b8" font-size="13">RMS z of centered split covariance across low-conductor Kummer covers</text>
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
  fieldAudit(7, q7MaxDegree),
];
const summary = summarize(integer, fields);
const base = `cycle-015-family-cubic-chebotarev-covariance-${maxN}`;
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "Family cubic Chebotarev covariance",
  generatedAt: new Date().toISOString(),
  maxN,
  q2MaxDegree,
  q5MaxDegree,
  q7MaxDegree,
  familyLimit,
  seeds,
  requiredIntegerEndpoints,
  robustControlEnvelope: {
    covRmsZHigh: robustCovRmsThreshold,
    maxAbsCovZHigh: robustMaxAbsZThreshold,
  },
  theoremShape: {
    statistic: "Z_AB(S)=sum_{lambda in S_AB}(X_A(lambda)-1/3)(X_B(lambda)-1/3)/sqrt(|S_AB|*4/81), then E(S)=RMS_{A<B} Z_AB",
    integer: "A ranges over low-conductor constants c and labels are rational primes p == 1 mod 3; X_c(p)=1 when c is a cubic residue mod p",
    functionField: "A ranges over low-degree squarefree polynomials A(t) and labels are monic irreducibles P with mu_3 in F_q[t]/P; X_A(P)=1 when A(t) is a cube modulo P",
    baseline: "independent cubic Kummer characters give E[split]=1/3 and E[(X_A-1/3)(X_B-1/3)]=0 for unrelated covers",
  },
  noveltyAudit: {
    mutationFromPreviousCycles: "Cycles 013-014 used one or two fixed covers; this cycle tests a low-conductor family covariance matrix.",
    knownExplanationToBeat: "Chebotarev density for the compositum of Kummer extensions predicts independent cubic residue characters when the covers are independent modulo cubes.",
    promotionRequirement: "Matched control-surviving covariance must occur in the integer ladder and q=2,5,7 field ladders, with a proof path not reducible to Chebotarev/Kummer independence.",
    sourceChecked: "Pietro Sgobba, Divisibility conditions on the order of the reductions of algebraic numbers, arXiv:2110.08911; used here as the known-explanation class, not as promotion evidence.",
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
  hasRequiredFieldLadders: summary.hasRequiredFieldLadders,
  matchedControlSurvival: summary.matchedControlSurvival,
  allWithinControls: summary.allWithinControls,
  maxCovRmsZ: summary.maxCovRmsZ,
  maxAbsCovZ: summary.maxAbsCovZ,
  paths,
}, null, 2));
