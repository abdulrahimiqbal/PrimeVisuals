#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polyMod,
  polyMul,
  polySub,
  polyToString,
} from "../src/core/ffield.js";
import {
  controlExcess,
  interactionDefectFromMaskCounts,
  localInformationDepth,
} from "../src/core/localGlobalDefect.js";
import { sieve } from "../src/core/math.js";

const args = new Set(process.argv.slice(2));
const quick = args.has("--quick");
const outDir = "logs/local-global-defect";
const seeds = quick
  ? [12345, 271828, 314159]
  : [12345, 271828, 314159, 161803, 424242, 8675309, 104729, 130363, 999983, 15485863, 32452843, 49979687];
const integerScales = quick ? [100_000, 200_000] : [250_000, 500_000, 1_000_000];
const integerCutoffs = quick ? [5, 11] : [5, 7, 11, 17, 29];
const integerShapes = [
  { id: "A", shifts: [0, 30, 60] },
  { id: "B", shifts: [0, 30, 90] },
  { id: "C", shifts: [0, 60, 90] },
];
const fieldSpecs = quick
  ? [{ q: 2, degrees: [14], maxDegree: 14 }]
  : [
      { q: 2, degrees: [16, 18, 20], maxDegree: 20 },
      { q: 3, degrees: [9, 10, 11], maxDegree: 11 },
      { q: 5, degrees: [9], maxDegree: 9 },
    ];
const fieldCutoffs = quick ? [1, 2] : [1, 2, 3];
const minimumEligibleCenters = quick ? 2_000 : 20_000;
const minimumAllOneCount = quick ? 3 : 25;

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

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function range(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length ? [Math.min(...usable), Math.max(...usable)] : [NaN, NaN];
}

function sampledFlags(pool, count, seed, length) {
  if (count > pool.length) return null;
  const random = rng(seed);
  const copy = pool.slice();
  const flags = new Uint8Array(length);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (copy.length - i));
    const value = copy[j];
    copy[j] = copy[i];
    copy[i] = value;
    flags[value] = 1;
  }
  return flags;
}

function independentMaskControl(samples, rates, seed) {
  const random = rng(seed ^ 0xa5a5a5a5);
  const counts = new Float64Array(8);
  for (let i = 0; i < samples; i++) {
    let mask = 0;
    for (let bit = 0; bit < 3; bit++) if (random() < rates[bit]) mask |= 1 << bit;
    counts[mask]++;
  }
  return interactionDefectFromMaskCounts(counts, 3);
}

function pointSummary(real, eligibleControls, compositeControls, independentControls, totalCenters, poolSizes) {
  const eligibleValues = eligibleControls.map((row) => row.relativeDefect);
  const compositeValues = compositeControls.map((row) => row.relativeDefect);
  const independentValues = independentControls.map((row) => row.relativeDefect);
  const eligibleExcess = controlExcess(real.relativeDefect, eligibleValues);
  const compositeExcess = controlExcess(real.relativeDefect, compositeValues);
  const strictZ = Number.isFinite(eligibleExcess.z) && Number.isFinite(compositeExcess.z)
    ? Math.min(eligibleExcess.z, compositeExcess.z)
    : NaN;
  const supportPass = real.samples >= minimumEligibleCenters
    && real.allOneCount >= minimumAllOneCount
    && poolSizes.eligible >= poolSizes.labels
    && poolSizes.composite >= poolSizes.labels;
  return {
    totalCenters,
    eligibleCenters: real.samples,
    eligibleFraction: real.samples / Math.max(1, totalCenters),
    tau: localInformationDepth(real.samples, totalCenters),
    real,
    controls: {
      eligibleRandom: { range: range(eligibleValues), ...eligibleExcess },
      eligibleComposite: { range: range(compositeValues), ...compositeExcess },
      independentMask: { range: range(independentValues), ...controlExcess(real.relativeDefect, independentValues) },
    },
    poolSizes,
    strictZ,
    supportPass,
    scoreable: supportPass && Number.isFinite(strictZ),
  };
}

function scanIntegerMasks(lo, hi, shape, eligibleFlags, labelFlags) {
  const counts = new Float64Array(8);
  const maxShift = Math.max(...shape.shifts);
  const stop = hi - maxShift;
  for (let center = lo; center <= stop; center++) {
    let eligible = true;
    let mask = 0;
    for (let bit = 0; bit < 3; bit++) {
      const value = center + shape.shifts[bit];
      if (!eligibleFlags[value]) {
        eligible = false;
        break;
      }
      if (labelFlags[value]) mask |= 1 << bit;
    }
    if (eligible) counts[mask]++;
  }
  return interactionDefectFromMaskCounts(counts, 3);
}

function integerEligibility(lo, hi, limit, cutoff) {
  const flags = new Uint8Array(limit + 1);
  flags.fill(1, lo, hi + 1);
  const localFlags = sieve(cutoff);
  for (let p = 2; p <= cutoff; p++) {
    if (!localFlags[p]) continue;
    const start = Math.ceil(lo / p) * p;
    for (let value = start; value <= hi; value += p) flags[value] = 0;
  }
  return flags;
}

function poolsFromFlags(eligibleFlags, realFlags, lo, hi) {
  const eligible = [];
  const composite = [];
  let labels = 0;
  for (let value = lo; value <= hi; value++) {
    if (realFlags[value]) labels++;
    if (!eligibleFlags[value]) continue;
    eligible.push(value);
    if (!realFlags[value]) composite.push(value);
  }
  return { eligible, composite, labels };
}

function runIntegerPilot() {
  const maxN = Math.max(...integerScales);
  const maxShift = Math.max(...integerShapes.flatMap((shape) => shape.shifts));
  console.error(`[scid] integer sieve to ${maxN + maxShift}`);
  const primeFlags = sieve(maxN + maxShift);
  const rows = [];
  for (const N of integerScales) {
    const lo = Math.floor(N / 2);
    const hi = N;
    for (const cutoff of integerCutoffs) {
      const eligibleFlags = integerEligibility(lo, hi, maxN + maxShift, cutoff);
      const pools = poolsFromFlags(eligibleFlags, primeFlags, lo, hi);
      const eligibleLabelFlags = seeds.map((seed) => sampledFlags(pools.eligible, pools.labels, seed ^ (N + cutoff), primeFlags.length));
      const compositeLabelFlags = seeds.map((seed) => sampledFlags(pools.composite, pools.labels, seed ^ 0x9e3779b9 ^ (N + cutoff), primeFlags.length));
      for (const shape of integerShapes) {
        const real = scanIntegerMasks(lo, hi, shape, eligibleFlags, primeFlags);
        const eligibleControls = eligibleLabelFlags.filter(Boolean).map((flags) => scanIntegerMasks(lo, hi, shape, eligibleFlags, flags));
        const compositeControls = compositeLabelFlags.filter(Boolean).map((flags) => scanIntegerMasks(lo, hi, shape, eligibleFlags, flags));
        const independentControls = seeds.map((seed) => independentMaskControl(real.samples, real.marginalOneRates, seed ^ cutoff ^ N));
        rows.push({
          universe: "Z",
          scale: N,
          scaleLabel: `N=${N}`,
          depth: cutoff,
          depthLabel: `p<=${cutoff}`,
          shape: shape.id,
          shifts: shape.shifts,
          ...pointSummary(real, eligibleControls, compositeControls, independentControls, hi - Math.max(...shape.shifts) - lo + 1, {
            labels: pools.labels,
            eligible: pools.eligible.length,
            composite: pools.composite.length,
          }),
        });
      }
    }
  }
  return rows;
}

function linearPrimorial(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + ((q - a) % q), q);
  return product;
}

function fieldShapes(q) {
  const P = linearPrimorial(q);
  const tP = polyMul(q, P, q);
  const quadraticMultiplier = q ** 2 + q + 1;
  const cubicMultiplier = q ** 3 + q + 1;
  const quadraticP = polyMul(quadraticMultiplier, P, q);
  const cubicP = polyMul(cubicMultiplier, P, q);
  return [
    { id: "A", shifts: [0, P, tP] },
    { id: "B", shifts: [0, P, quadraticP] },
    { id: "C", shifts: [0, tP, cubicP] },
  ];
}

function localFactorDegrees(universe, maxCutoff) {
  const factors = [];
  for (let degree = 1; degree <= maxCutoff; degree++) {
    for (const modulus of universe.irreduciblesByDegree[degree]) factors.push({ degree, modulus });
  }
  return factors;
}

function smallestFactorDegreeByLower(universe, degree, maxCutoff) {
  const lead = universe.pow[degree];
  const count = universe.pow[degree];
  const factors = localFactorDegrees(universe, maxCutoff);
  const out = new Uint8Array(count);
  for (let lower = 0; lower < count; lower++) {
    const poly = lead + lower;
    for (const factor of factors) {
      if (polyMod(poly, factor.modulus, universe.q) !== 0) continue;
      out[lower] = factor.degree;
      break;
    }
  }
  return out;
}

function shiftedIndices(universe, degree, shape) {
  const lead = universe.pow[degree];
  const count = universe.pow[degree];
  const out = new Int32Array(count * 3);
  for (let lower = 0; lower < count; lower++) {
    const poly = lead + lower;
    for (let bit = 0; bit < 3; bit++) {
      const shifted = polyAdd(poly, shape.shifts[bit], universe.q);
      const idx = shifted - lead;
      if (idx < 0 || idx >= count) throw new Error(`shift changed degree in F_${universe.q}[t] at degree ${degree}`);
      out[3 * lower + bit] = idx;
    }
  }
  return out;
}

function scanFieldMasks(indices, eligibleFlags, labelFlags) {
  const counts = new Float64Array(8);
  const centers = indices.length / 3;
  for (let center = 0; center < centers; center++) {
    let eligible = true;
    let mask = 0;
    for (let bit = 0; bit < 3; bit++) {
      const idx = indices[3 * center + bit];
      if (!eligibleFlags[idx]) {
        eligible = false;
        break;
      }
      if (labelFlags[idx]) mask |= 1 << bit;
    }
    if (eligible) counts[mask]++;
  }
  return interactionDefectFromMaskCounts(counts, 3);
}

function fieldPools(eligibleFlags, realFlags) {
  const eligible = [];
  const composite = [];
  let labels = 0;
  for (let lower = 0; lower < eligibleFlags.length; lower++) {
    if (realFlags[lower]) labels++;
    if (!eligibleFlags[lower]) continue;
    eligible.push(lower);
    if (!realFlags[lower]) composite.push(lower);
  }
  return { eligible, composite, labels };
}

function runFieldPilot(spec) {
  console.error(`[scid] F_${spec.q}[t] universe to degree ${spec.maxDegree}`);
  const universe = buildPolynomialUniverse(spec.q, spec.maxDegree);
  const shapes = fieldShapes(spec.q);
  const rows = [];
  for (const degree of spec.degrees) {
    console.error(`[scid] F_${spec.q}[t] degree ${degree}: local factor table`);
    const smallestFactorDegree = smallestFactorDegreeByLower(universe, degree, Math.max(...fieldCutoffs));
    const realFlags = universe.irreducibleFlagsByDegree[degree];
    const indicesByShape = new Map(shapes.map((shape) => [shape.id, shiftedIndices(universe, degree, shape)]));
    for (const cutoff of fieldCutoffs) {
      const eligibleFlags = new Uint8Array(smallestFactorDegree.length);
      for (let lower = 0; lower < eligibleFlags.length; lower++) {
        const factorDegree = smallestFactorDegree[lower];
        if (factorDegree === 0 || factorDegree > cutoff) eligibleFlags[lower] = 1;
      }
      const pools = fieldPools(eligibleFlags, realFlags);
      const eligibleLabelFlags = seeds.map((seed) => sampledFlags(pools.eligible, pools.labels, seed ^ (spec.q << 24) ^ (degree << 8) ^ cutoff, eligibleFlags.length));
      const compositeLabelFlags = seeds.map((seed) => sampledFlags(pools.composite, pools.labels, seed ^ 0x9e3779b9 ^ (spec.q << 24) ^ (degree << 8) ^ cutoff, eligibleFlags.length));
      for (const shape of shapes) {
        const indices = indicesByShape.get(shape.id);
        const real = scanFieldMasks(indices, eligibleFlags, realFlags);
        const eligibleControls = eligibleLabelFlags.filter(Boolean).map((flags) => scanFieldMasks(indices, eligibleFlags, flags));
        const compositeControls = compositeLabelFlags.filter(Boolean).map((flags) => scanFieldMasks(indices, eligibleFlags, flags));
        const independentControls = seeds.map((seed) => independentMaskControl(real.samples, real.marginalOneRates, seed ^ spec.q ^ degree ^ cutoff));
        rows.push({
          universe: `F_${spec.q}[t]`,
          q: spec.q,
          scale: degree,
          scaleLabel: `degree=${degree}`,
          depth: cutoff,
          depthLabel: `deg(P)<=${cutoff}`,
          shape: shape.id,
          shifts: shape.shifts.map((shift) => polyToString(shift, spec.q)),
          ...pointSummary(real, eligibleControls, compositeControls, independentControls, universe.pow[degree], {
            labels: pools.labels,
            eligible: pools.eligible.length,
            composite: pools.composite.length,
          }),
        });
      }
    }
  }
  return rows;
}

function markdownTable(rows) {
  return rows.map((row) => `| ${row.universe} | ${row.scaleLabel} | ${row.shape} | ${row.depthLabel} | ${row.eligibleCenters} | ${row.real.allOneCount} | ${fmt(row.tau, 4)} | ${fmt(row.real.relativeDefect, 8)} | ${fmt(row.controls.eligibleRandom.min, 8)}..${fmt(row.controls.eligibleRandom.max, 8)} | ${fmt(row.controls.eligibleComposite.min, 8)}..${fmt(row.controls.eligibleComposite.max, 8)} | ${fmt(row.strictZ, 3)} | ${row.supportPass ? "PASS" : "FAIL"} |`).join("\n");
}

function renderMarkdown(report) {
  const all = [...report.integer, ...report.fields];
  const scoreable = all.filter((row) => row.scoreable);
  const strictFour = scoreable.filter((row) => row.strictZ >= 4);
  return `# Sieve-conditioned interaction defect — calibration pilot

This is the preregistered exploratory pilot. It cannot be promoted as a
discovery. Definitions and gates were frozen in
\`logs/local-global-defect/PREREGISTRATION.md\` before this run.

## Summary

- points: ${all.length}
- support-passing points: ${all.filter((row) => row.supportPass).length}
- scoreable points: ${scoreable.length}
- exploratory points with strict control z >= 4: ${strictFour.length}
- quick mode: ${report.quick}
- control seeds: ${report.seeds.length}

## Flow points

| universe | scale | shape | local depth | eligible centers | real 111 | tau | real SCID | eligible-random range | composite range | strict z | support |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${markdownTable(all)}

## Interpretation rule

No row above is discovery evidence. The pilot is used only to check support,
runtime, finite-sample entropy bias, and whether the frozen confirmatory ladder
is feasible. Any apparent effect must survive the separately frozen
confirmatory scales, primary-source novelty audit, factor/local-product check,
and expert attack.

JSON: \`${report.paths.json}\`
SVG: \`${report.paths.svg}\`
`;
}

function renderSvg(report) {
  const all = [...report.integer, ...report.fields];
  const finalByUniverse = [];
  for (const universe of [...new Set(all.map((row) => row.universe))]) {
    const universeRows = all.filter((row) => row.universe === universe);
    const maxScale = Math.max(...universeRows.map((row) => row.scale));
    finalByUniverse.push(...universeRows.filter((row) => row.scale === maxScale && row.shape === "A"));
  }
  const width = 1180, height = 700;
  const chart = { x: 88, y: 86, w: 820, h: 500 };
  const maxTau = Math.max(1, ...finalByUniverse.map((row) => row.tau));
  const maxY = Math.max(1e-6, ...finalByUniverse.flatMap((row) => [row.real.relativeDefect, row.controls.eligibleRandom.max, row.controls.eligibleComposite.max])) * 1.15;
  const colors = { Z: "#f8fafc", "F_2[t]": "#a78bfa", "F_3[t]": "#60a5fa", "F_5[t]": "#34d399" };
  const x = (tau) => chart.x + (tau / maxTau) * chart.w;
  const y = (value) => chart.y + chart.h - (value / maxY) * chart.h;
  const groups = [...new Set(finalByUniverse.map((row) => row.universe))].map((universe) => {
    const rows = finalByUniverse.filter((row) => row.universe === universe).sort((a, b) => a.tau - b.tau);
    const points = rows.map((row) => `${x(row.tau).toFixed(2)},${y(row.real.relativeDefect).toFixed(2)}`).join(" ");
    return `<polyline points="${points}" fill="none" stroke="${colors[universe]}" stroke-width="3"/>\n${rows.map((row) => `<line x1="${x(row.tau)}" x2="${x(row.tau)}" y1="${y(row.controls.eligibleRandom.min)}" y2="${y(Math.max(row.controls.eligibleRandom.max, row.controls.eligibleComposite.max))}" stroke="#f59e0b" stroke-width="5" opacity="0.45"/><circle cx="${x(row.tau)}" cy="${y(row.real.relativeDefect)}" r="5" fill="${colors[universe]}"/>`).join("\n")}`;
  }).join("\n");
  const legend = [...new Set(finalByUniverse.map((row) => row.universe))].map((universe, i) => `<circle cx="970" cy="${130 + i * 34}" r="6" fill="${colors[universe]}"/><text x="988" y="${135 + i * 34}" fill="#dbeafe" font-size="14">${universe}</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="68" y="38" fill="#f8fafc" font-size="21" font-weight="700">SCID calibration pilot — final-scale shape A</text>
<text x="68" y="63" fill="#94a3b8" font-size="13">real interaction defect versus local-information depth; amber bars show listed control envelope</text>
<rect x="${chart.x}" y="${chart.y}" width="${chart.w}" height="${chart.h}" fill="#0b1627" stroke="#334155"/>
<line x1="${chart.x}" x2="${chart.x + chart.w}" y1="${chart.y + chart.h}" y2="${chart.y + chart.h}" stroke="#64748b"/>
<text x="${chart.x + chart.w / 2}" y="${chart.y + chart.h + 48}" text-anchor="middle" fill="#cbd5e1" font-size="14">local information depth tau</text>
<text transform="translate(28 ${chart.y + chart.h / 2}) rotate(-90)" text-anchor="middle" fill="#cbd5e1" font-size="14">relative total correlation (SCID)</text>
${groups}
${legend}
<text x="950" y="94" fill="#f8fafc" font-size="14" font-weight="700">universe</text>
</svg>`;
}

console.error(`[scid] starting ${quick ? "quick" : "full"} calibration pilot with ${seeds.length} seeds`);
const integer = runIntegerPilot();
const fields = fieldSpecs.flatMap(runFieldPilot);
const base = quick ? "scid-pilot-quick" : "scid-pilot";
const paths = {
  json: path.join(outDir, `${base}.json`),
  md: path.join(outDir, `${base}.md`),
  svg: path.join(outDir, `${base}.svg`),
};
const report = {
  candidate: "sieve-conditioned interaction defect flow",
  grade: "EXPLORATORY_CALIBRATION_PILOT_ONLY",
  generatedAt: new Date().toISOString(),
  quick,
  seeds,
  minimumEligibleCenters,
  minimumAllOneCount,
  integerScales,
  integerCutoffs,
  fieldSpecs,
  fieldCutoffs,
  integer,
  fields,
  paths,
};
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

const all = [...integer, ...fields];
console.log(JSON.stringify({
  ok: true,
  grade: report.grade,
  points: all.length,
  supportPassing: all.filter((row) => row.supportPass).length,
  scoreable: all.filter((row) => row.scoreable).length,
  strictFour: all.filter((row) => row.scoreable && row.strictZ >= 4).length,
  strongestExploratory: all.filter((row) => row.scoreable && Number.isFinite(row.strictZ)).sort((a, b) => b.strictZ - a.strictZ).slice(0, 8).map((row) => ({
    universe: row.universe,
    scale: row.scaleLabel,
    shape: row.shape,
    depth: row.depthLabel,
    scid: row.real.relativeDefect,
    strictZ: row.strictZ,
    eligible: row.eligibleCenters,
    allOne: row.real.allOneCount,
  })),
  paths,
}, null, 2));
