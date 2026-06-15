#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  isMonicIrreducible,
  polyAdd,
  polyDegree,
  polyDivMod,
  polyMod,
} from "../src/core/ffield.js";
import { primesUpTo, sieve } from "../src/core/math.js";

const maxN = Math.max(10000, Number.parseInt(process.argv[2] || "8000000", 10));
const outDir = process.argv[3] || "logs/playground-artifacts";
const shifts = [2, 4, 6, 8, 10, 12];
const endpoints = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1].map((f) => Math.max(10000, Math.round(maxN * f)));
const roughCutoffs = [7, 13, 19, 31, 43, 67, 97, 151, 257, 401, 631, 997, 1543, 2237];
const namedCenters = [25, 35, 77, 289];
const fieldSpecs = [
  { q: 3, maxDegree: 11, degrees: [8, 9, 10, 11] },
  { q: 5, maxDegree: 7, degrees: [4, 5, 6, 7] },
];

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function range(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length ? [Math.min(...usable), Math.max(...usable)] : [NaN, NaN];
}

function scoreAccumulator() {
  return { count: 0, centers: 0, sum: 0, sumSq: 0 };
}

function addScore(acc, value) {
  acc.count++;
  acc.sum += value;
  acc.sumSq += value * value;
}

function finishAccumulator(acc) {
  const avg = acc.count ? acc.sum / acc.count : NaN;
  return {
    centers: acc.centers,
    count: acc.count,
    mean: avg,
    variance: acc.count ? Math.max(0, acc.sumSq / acc.count - avg * avg) : NaN,
  };
}

function linearFit(xs, ys, throughOrigin = false) {
  if (xs.length < 2) return { slope: NaN, intercept: NaN, r2: NaN, rmse: NaN, maxAbs: NaN };
  let slope;
  let intercept;
  if (throughOrigin) {
    let num = 0;
    let den = 0;
    for (let i = 0; i < xs.length; i++) {
      num += xs[i] * ys[i];
      den += xs[i] * xs[i];
    }
    slope = den ? num / den : NaN;
    intercept = 0;
  } else {
    const mx = mean(xs);
    const my = mean(ys);
    let num = 0;
    let den = 0;
    for (let i = 0; i < xs.length; i++) {
      num += (xs[i] - mx) * (ys[i] - my);
      den += (xs[i] - mx) ** 2;
    }
    slope = den ? num / den : NaN;
    intercept = my - slope * mx;
  }
  const yMean = mean(ys);
  let sse = 0;
  let sst = 0;
  let maxAbs = 0;
  for (let i = 0; i < xs.length; i++) {
    const residual = ys[i] - (slope * xs[i] + intercept);
    sse += residual * residual;
    sst += (ys[i] - yMean) ** 2;
    maxAbs = Math.max(maxAbs, Math.abs(residual));
  }
  return {
    slope,
    intercept,
    r2: sst ? 1 - sse / sst : 1,
    rmse: Math.sqrt(sse / xs.length),
    maxAbs,
  };
}

function integerTheta(rows, key) {
  const usable = rows
    .map((row) => ({ x: row.N, y: Math.abs(row.fit[key]) }))
    .filter((row) => row.x > 1 && row.y > 0);
  if (usable.length < 2) return NaN;
  const xs = usable.map((row) => Math.log(row.x));
  const ys = usable.map((row) => Math.log(row.y));
  return linearFit(xs, ys).slope;
}

function smallestPrimeFactors(limit) {
  const spf = new Int32Array(limit + 1);
  for (let i = 2; i <= limit; i++) {
    if (spf[i]) continue;
    spf[i] = i;
    if (i * i > limit) continue;
    for (let j = i * i; j <= limit; j += i) if (!spf[j]) spf[j] = i;
  }
  return spf;
}

function integerSplitShapes(limit, primeFlags, spf) {
  console.error(`[rough-profile] factoring integer composite shapes to ${limit}`);
  const split = new Float64Array(limit + 1);
  for (let n = 4; n <= limit; n++) {
    if (primeFlags[n]) continue;
    const logN = Math.log(n);
    let m = n;
    let energy = 0;
    while (m > 1) {
      const p = spf[m] || m;
      const w = Math.log(p) / logN;
      while (m % p === 0) {
        energy += w * w;
        m = Math.floor(m / p);
      }
    }
    split[n] = Math.max(0, 1 - energy);
  }
  return split;
}

function scoreIntegerCenters(centers, endpoint, split, primeFlags, limit, minCenter = 1001) {
  const acc = scoreAccumulator();
  for (const center of centers) {
    if (center < minCenter || center > endpoint) continue;
    acc.centers++;
    for (const h of shifts) {
      const mate = center + h;
      if (mate <= limit && mate > 1 && !primeFlags[mate]) addScore(acc, split[mate]);
    }
  }
  return finishAccumulator(acc);
}

function scoreVisibleCenters(visible, endpoint, split, primeFlags, limit) {
  const acc = scoreAccumulator();
  for (let center = 1001 | 1; center <= endpoint; center += 2) {
    if (!visible[center]) continue;
    acc.centers++;
    for (const h of shifts) {
      const mate = center + h;
      if (mate <= limit && mate > 1 && !primeFlags[mate]) addScore(acc, split[mate]);
    }
  }
  return finishAccumulator(acc);
}

function tailPrimeMass(primes, cutoff, endpoint) {
  const upper = Math.floor(Math.sqrt(endpoint));
  let total = 0;
  for (const p of primes) {
    if (p <= cutoff) continue;
    if (p > upper) break;
    total += 1 / p;
  }
  return total;
}

function updateVisibleForCutoff(visible, primes, lastCutoff, cutoff) {
  for (const p of primes) {
    if (p <= lastCutoff) continue;
    if (p > cutoff) break;
    for (let n = p; n < visible.length; n += p) visible[n] = 0;
  }
}

function integerAudit() {
  const limit = maxN + Math.max(...shifts);
  console.error(`[rough-profile] integer sieve to ${limit}`);
  const primeFlags = sieve(limit);
  const primes = primesUpTo(limit);
  const primeCenters = primes.filter((p) => p <= maxN);
  const spf = smallestPrimeFactors(limit);
  const split = integerSplitShapes(limit, primeFlags, spf);
  const realByEndpoint = endpoints.map((endpoint) => ({
    N: endpoint,
    ...scoreIntegerCenters(primeCenters, endpoint, split, primeFlags, limit),
  }));

  const visible = new Uint8Array(maxN + 1);
  for (let n = 1001 | 1; n <= maxN; n += 2) visible[n] = 1;
  let lastCutoff = 1;
  const roughRows = [];
  for (const cutoff of roughCutoffs) {
    updateVisibleForCutoff(visible, primes, lastCutoff, cutoff);
    lastCutoff = cutoff;
    const rows = endpoints.map((endpoint, i) => {
      const rough = scoreVisibleCenters(visible, endpoint, split, primeFlags, limit);
      const real = realByEndpoint[i];
      return {
        N: endpoint,
        cutoff,
        tailMass: tailPrimeMass(primes, cutoff, endpoint),
        realMean: real.mean,
        roughMean: rough.mean,
        delta: real.mean - rough.mean,
        roughCenters: rough.centers,
        roughCount: rough.count,
        realCenters: real.centers,
        realCount: real.count,
      };
    });
    roughRows.push({ cutoff, rows });
  }

  const profileRows = endpoints.map((endpoint, endpointIndex) => {
    const points = roughRows
      .map((rough) => rough.rows[endpointIndex])
      .filter((row) => row.tailMass > 0 && row.roughCount > 0 && Number.isFinite(row.delta));
    const xs = points.map((row) => row.tailMass);
    const ys = points.map((row) => row.delta);
    const fit = linearFit(xs, ys);
    const originFit = linearFit(xs, ys, true);
    const endpointRow = {
      N: endpoint,
      real: realByEndpoint[endpointIndex],
      points,
      fit,
      originFit,
    };
    endpointRow.named = namedCenters.map((center) => {
      const score = scoreIntegerCenters([center], endpoint, split, primeFlags, limit, 1);
      return { center, ...score };
    });
    return endpointRow;
  });

  return {
    maxN,
    shifts,
    roughCutoffs,
    endpoints,
    rows: profileRows,
    theta: {
      slope: integerTheta(profileRows, "slope"),
      intercept: integerTheta(profileRows, "intercept"),
      rmse: integerTheta(profileRows, "rmse"),
      originSlope: integerTheta(profileRows.map((row) => ({ ...row, fit: row.originFit })), "slope"),
    },
  };
}

function fieldFactorDegrees(poly, universe) {
  const q = universe.q;
  let rem = poly;
  let remDegree = polyDegree(rem, q);
  const degrees = [];
  let trialDegree = 1;
  while (remDegree > 0 && trialDegree <= Math.floor(remDegree / 2)) {
    for (const factor of universe.irreduciblesByDegree[trialDegree]) {
      while (remDegree >= trialDegree && polyMod(rem, factor, q) === 0) {
        degrees.push(trialDegree);
        rem = polyDivMod(rem, factor, q).quotient;
        remDegree = polyDegree(rem, q);
      }
      if (remDegree === 0 || trialDegree > Math.floor(remDegree / 2)) break;
    }
    trialDegree++;
  }
  if (remDegree > 0) degrees.push(remDegree);
  return degrees;
}

function shapeFromDegrees(degrees, totalDegree) {
  let energy = 0;
  for (const degree of degrees) {
    const w = degree / totalDegree;
    energy += w * w;
  }
  return Math.max(0, 1 - energy);
}

function fieldShape(poly, universe, cache) {
  const cached = cache.get(poly);
  if (cached !== undefined) return cached;
  const degree = polyDegree(poly, universe.q);
  const split = shapeFromDegrees(fieldFactorDegrees(poly, universe), degree);
  cache.set(poly, split);
  return split;
}

function fieldRoughCenters(universe, degree, roughDegree) {
  const lead = universe.pow[degree];
  const factors = [];
  for (let d = 1; d <= roughDegree; d++) factors.push(...universe.irreduciblesByDegree[d]);
  const out = [];
  for (let lower = 0; lower < universe.pow[degree]; lower++) {
    const poly = lead + lower;
    let ok = true;
    for (const factor of factors) {
      if (polyMod(poly, factor, universe.q) === 0) {
        ok = false;
        break;
      }
    }
    if (ok) out.push(poly);
  }
  return out;
}

function scoreFieldCenters(universe, centers, constants, cache) {
  const acc = scoreAccumulator();
  for (const center of centers) {
    acc.centers++;
    for (const c of constants) {
      const mate = polyAdd(center, c, universe.q);
      if (isMonicIrreducible(mate, universe)) continue;
      addScore(acc, fieldShape(mate, universe, cache));
    }
  }
  return finishAccumulator(acc);
}

function fieldTailMass(universe, roughDegree, degree) {
  let total = 0;
  for (let d = roughDegree + 1; d <= Math.floor(degree / 2); d++) {
    total += universe.counts[d] / (universe.q ** d);
  }
  return total;
}

function fieldAudit(spec) {
  console.error(`[rough-profile] F_${spec.q}[t] to degree ${spec.maxDegree}`);
  const universe = buildPolynomialUniverse(spec.q, spec.maxDegree);
  const constants = Array.from({ length: spec.q - 1 }, (_, i) => i + 1);
  const cache = new Map();
  const rows = [];
  for (const degree of spec.degrees) {
    console.error(`[rough-profile] F_${spec.q}[t] degree ${degree}`);
    const irreducibles = universe.irreduciblesByDegree[degree];
    const real = scoreFieldCenters(universe, irreducibles, constants, cache);
    const points = [];
    for (let roughDegree = 0; roughDegree <= Math.floor(degree / 2); roughDegree++) {
      const centers = roughDegree === Math.floor(degree / 2)
        ? irreducibles
        : fieldRoughCenters(universe, degree, roughDegree);
      const rough = scoreFieldCenters(universe, centers, constants, cache);
      points.push({
        degree,
        roughDegree,
        tailMass: fieldTailMass(universe, roughDegree, degree),
        realMean: real.mean,
        roughMean: rough.mean,
        delta: real.mean - rough.mean,
        roughCenters: rough.centers,
        roughCount: rough.count,
        realCenters: real.centers,
        realCount: real.count,
      });
    }
    const fitPoints = points.filter((point) => point.tailMass > 0 && Number.isFinite(point.delta));
    rows.push({
      q: spec.q,
      degree,
      real,
      points,
      fit: linearFit(fitPoints.map((point) => point.tailMass), fitPoints.map((point) => point.delta)),
      originFit: linearFit(fitPoints.map((point) => point.tailMass), fitPoints.map((point) => point.delta), true),
    });
  }
  return {
    q: spec.q,
    maxDegree: spec.maxDegree,
    rows,
    slopeRange: range(rows.map((row) => row.fit.slope)),
    r2Range: range(rows.map((row) => row.fit.r2)),
    rmseRange: range(rows.map((row) => row.fit.rmse)),
  };
}

function markdownReport(result) {
  const integerRows = result.integer.rows.map((row) => `| ${row.N} | ${row.real.centers} | ${fmt(row.fit.r2, 6)} | ${fmt(row.fit.slope, 8)} | ${fmt(row.fit.intercept, 8)} | ${fmt(row.fit.rmse, 8)} | ${fmt(row.originFit.r2, 6)} | ${fmt(row.originFit.slope, 8)} |`).join("\n");
  const endpointProfile = result.integer.rows.at(-1).points.map((point) => `| ${point.cutoff} | ${fmt(point.tailMass, 8)} | ${point.roughCenters} | ${fmt(point.roughMean, 8)} | ${fmt(point.delta, 8)} |`).join("\n");
  const namedRows = result.integer.rows.at(-1).named.map((row) => `| ${row.center} | ${row.centers} | ${row.count} | ${fmt(row.mean, 8)} |`).join("\n");
  const fieldTable = (field) => field.rows.map((row) => `| ${row.degree} | ${row.real.centers} | ${fmt(row.fit.r2, 6)} | ${fmt(row.fit.slope, 8)} | ${fmt(row.fit.intercept, 8)} | ${fmt(row.fit.rmse, 8)} | ${fmt(row.originFit.r2, 6)} | ${fmt(row.originFit.slope, 8)} |`).join("\n");
  const fieldEndpoint = (field) => field.rows.at(-1).points.map((point) => `| ${point.roughDegree} | ${fmt(point.tailMass, 8)} | ${point.roughCenters} | ${fmt(point.roughMean, 8)} | ${fmt(point.delta, 8)} |`).join("\n");

  return `# roughness-collapse profile audit

Candidate:
make the Cycle 74 collapse itself the object. For rough-center cutoff
\`B\`, score

\`Delta(B,N)=mean_prime_center_split(N)-mean_B_rough_center_split(N)\`

against missing roughness mass
\`T(B,N)=sum_{B<p<=sqrt(N)} 1/p\`. A survivor would have a stable
line in this coordinate and a nontrivial residual after roughness matching.

## Integer line fits

Theta estimates from endpoint fits:

- slope theta: \`${fmt(result.integer.theta.slope)}\`
- intercept theta: \`${fmt(result.integer.theta.intercept)}\`
- rmse theta: \`${fmt(result.integer.theta.rmse)}\`

| N | prime centers | affine R2 | affine slope | affine intercept | affine RMSE | origin R2 | origin slope |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${integerRows}

Endpoint profile at N=${result.integer.rows.at(-1).N}:

| cutoff B | tail mass T | rough centers | rough mean split | Delta |
| ---: | ---: | ---: | ---: | ---: |
${endpointProfile}

Named composite centers at endpoint:

| center | scored centers | composite mates | mean split |
| ---: | ---: | ---: | ---: |
${namedRows}

## Function-field line fits

F_3[t]:

| degree | irreducible centers | affine R2 | affine slope | affine intercept | affine RMSE | origin R2 | origin slope |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${fieldTable(result.fields[0])}

Endpoint F_3[t] profile:

| rough degree r | tail mass T_q | rough centers | rough mean split | Delta |
| ---: | ---: | ---: | ---: | ---: |
${fieldEndpoint(result.fields[0])}

F_5[t]:

| degree | irreducible centers | affine R2 | affine slope | affine intercept | affine RMSE | origin R2 | origin slope |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${fieldTable(result.fields[1])}

Endpoint F_5[t] profile:

| rough degree r | tail mass T_q | rough centers | rough mean split | Delta |
| ---: | ---: | ---: | ---: | ---: |
${fieldEndpoint(result.fields[1])}

SVG: \`${result.svgPath}\`
JSON: \`${result.jsonPath}\`
`;
}

function svgPlot(result) {
  const width = 1160;
  const height = 660;
  const pad = 70;
  const plotW = 660;
  const plotH = 450;
  const endpoint = result.integer.rows.at(-1);
  const pts = endpoint.points.filter((point) => point.tailMass > 0);
  const xMax = Math.max(...pts.map((point) => point.tailMass), 1e-9);
  const yMax = Math.max(...pts.map((point) => point.delta), 1e-9) * 1.1;
  const x = (value) => pad + (value / xMax) * plotW;
  const y = (value) => pad + plotH - (value / yMax) * plotH;
  const lineY = (value) => endpoint.fit.slope * value + endpoint.fit.intercept;
  const integerCircles = pts.map((point) => `<circle cx="${x(point.tailMass)}" cy="${y(point.delta)}" r="4" fill="#f8fafc"/><text x="${x(point.tailMass)}" y="${y(point.delta) - 8}" fill="#a7b0c4" font-size="10" text-anchor="middle">${point.cutoff}</text>`).join("\n");
  const fieldRows = result.fields.flatMap((field) => field.rows.map((row) => ({
    label: `F${field.q} d${row.degree}`,
    r2: row.fit.r2,
    slope: row.fit.slope,
    rmse: row.fit.rmse,
    color: field.q === 3 ? "#60a5fa" : "#34d399",
  })));
  const barX = 820;
  const barW = 230;
  const slopeAbs = Math.max(1e-9, ...fieldRows.map((row) => Math.abs(row.slope)), Math.abs(endpoint.fit.slope));
  const bars = fieldRows.map((row, i) => {
    const yy = 118 + i * 34;
    const w = (Math.abs(row.slope) / slopeAbs) * barW;
    return `<text x="${barX - 72}" y="${yy + 5}" fill="${row.color}" font-size="13">${row.label}</text>
<rect x="${barX}" y="${yy - 12}" width="${w}" height="14" fill="${row.color}" opacity="0.82"/>
<text x="${barX + w + 8}" y="${yy}" fill="#dbeafe" font-size="12">s=${fmt(row.slope, 4)} R2=${fmt(row.r2, 3)}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#111827"/>
<text x="64" y="38" fill="#f9fafb" font-size="20" font-weight="700">Roughness-collapse profile</text>
<text x="64" y="60" fill="#a7b0c4" font-size="13">Endpoint N=${endpoint.N}: Delta(B,N) against missing roughness mass T(B,N). Points labeled by B.</text>
<rect x="${pad}" y="${pad}" width="${plotW}" height="${plotH}" fill="#0b1220" stroke="#263244"/>
${[0, 0.25, 0.5, 0.75, 1].map((t) => `<line x1="${pad + t * plotW}" y1="${pad}" x2="${pad + t * plotW}" y2="${pad + plotH}" stroke="#1f2a3a"/><line x1="${pad}" y1="${pad + t * plotH}" x2="${pad + plotW}" y2="${pad + t * plotH}" stroke="#1f2a3a"/>`).join("\n")}
<line x1="${x(0)}" y1="${y(lineY(0))}" x2="${x(xMax)}" y2="${y(lineY(xMax))}" stroke="#f4a261" stroke-width="3"/>
${integerCircles}
<text x="${pad + plotW / 2}" y="${pad + plotH + 42}" fill="#9ca3af" font-size="13" text-anchor="middle">missing roughness mass T(B,N)</text>
<text transform="translate(22 ${pad + plotH / 2}) rotate(-90)" fill="#9ca3af" font-size="13" text-anchor="middle">Delta mean split</text>
<text x="${pad}" y="${pad + plotH + 68}" fill="#d1d5db" font-size="12">integer affine R2=${fmt(endpoint.fit.r2, 5)}, slope=${fmt(endpoint.fit.slope, 6)}, intercept=${fmt(endpoint.fit.intercept, 6)}, RMSE=${fmt(endpoint.fit.rmse, 8)}</text>
<rect x="770" y="86" width="340" height="430" fill="#0b1220" stroke="#263244"/>
<text x="790" y="112" fill="#dbeafe" font-size="14">function-field slopes</text>
${bars}
<text x="790" y="548" fill="#a7b0c4" font-size="12">A survivor needs aligned slopes and a residual not explained by the roughness shell.</text>
</svg>`;
}

console.error(`[rough-profile] starting audit N=${maxN}`);
const integer = integerAudit();
const fields = fieldSpecs.map(fieldAudit);
fs.mkdirSync(outDir, { recursive: true });
const basename = `roughness-collapse-profile-${maxN}`;
const result = {
  candidate: "roughness-collapse profile line",
  maxN,
  integer,
  fields,
  generatedAt: new Date().toISOString(),
};
result.jsonPath = path.join(outDir, `${basename}.json`);
result.mdPath = path.join(outDir, `${basename}.md`);
result.svgPath = path.join(outDir, `${basename}.svg`);
fs.writeFileSync(result.jsonPath, `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(result.mdPath, markdownReport(result));
fs.writeFileSync(result.svgPath, svgPlot(result));
console.log(JSON.stringify({
  ok: true,
  candidate: result.candidate,
  integerEndpoint: {
    N: integer.rows.at(-1).N,
    fit: integer.rows.at(-1).fit,
    originFit: integer.rows.at(-1).originFit,
  },
  integerTheta: integer.theta,
  fieldFits: fields.map((field) => ({
    q: field.q,
    slopeRange: field.slopeRange,
    r2Range: field.r2Range,
    rmseRange: field.rmseRange,
    endpoint: field.rows.at(-1).fit,
  })),
  mdPath: result.mdPath,
  jsonPath: result.jsonPath,
  svgPath: result.svgPath,
}, null, 2));
