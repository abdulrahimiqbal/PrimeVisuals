#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  irreducibleCountFormula,
  polyAdd,
  polyDegree,
  polyMod,
  polyMul,
} from "../src/core/ffield.js";
import { interactionDefectFromJointMoments } from "../src/core/localGlobalDefect.js";
import { primesUpTo } from "../src/core/math.js";

const input = process.argv[2] || "logs/local-global-defect/scid-pilot.json";
const outDir = "logs/local-global-defect";
const pilot = JSON.parse(fs.readFileSync(input, "utf8"));
const rationalTailLimit = 100_000;
const polynomialTailDegree = 16;

function bitCount(mask) {
  let x = mask, count = 0;
  while (x) {
    x &= x - 1;
    count++;
  }
  return count;
}

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function selected(values, mask) {
  const out = [];
  for (let bit = 0; bit < values.length; bit++) if (mask & (1 << bit)) out.push(values[bit]);
  return out;
}

function distinctIntegerResidues(shifts, modulus) {
  return new Set(shifts.map((shift) => ((shift % modulus) + modulus) % modulus)).size;
}

function averageInverseLogPower(lo, hi, power, samples = 4096) {
  let sum = 0;
  for (let i = 0; i < samples; i++) {
    const x = lo + ((i + 0.5) / samples) * (hi - lo);
    sum += 1 / Math.log(x) ** power;
  }
  return sum / samples;
}

const rationalPrimes = primesUpTo(rationalTailLimit);

function integerPrediction(row) {
  const shifts = row.shifts;
  const N = row.scale;
  const cutoff = row.depth;
  const moments = new Float64Array(8);
  moments[0] = 1;
  for (let mask = 1; mask < 8; mask++) {
    const subset = selected(shifts, mask);
    const order = bitCount(mask);
    let logFactor = 0;
    for (const p of rationalPrimes) {
      if (p <= cutoff) {
        logFactor -= order * Math.log1p(-1 / p);
        continue;
      }
      const nu = distinctIntegerResidues(subset, p);
      const numerator = 1 - nu / p;
      if (!(numerator > 0)) {
        logFactor = -Infinity;
        break;
      }
      logFactor += Math.log(numerator) - order * Math.log1p(-1 / p);
    }
    moments[mask] = averageInverseLogPower(N / 2, N, order) * Math.exp(logFactor);
  }
  return { moments: Array.from(moments), prediction: interactionDefectFromJointMoments(moments, 3) };
}

function linearPrimorial(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + ((q - a) % q), q);
  return product;
}

function fieldShapes(q) {
  const P = linearPrimorial(q);
  const tP = polyMul(q, P, q);
  const quadraticP = polyMul(q ** 2 + q + 1, P, q);
  const cubicP = polyMul(q ** 3 + q + 1, P, q);
  return new Map([
    ["A", [0, P, tP]],
    ["B", [0, P, quadraticP]],
    ["C", [0, tP, cubicP]],
  ]);
}

function distinctPolynomialResidues(shifts, modulus, q) {
  return new Set(shifts.map((shift) => polyMod(shift, modulus, q))).size;
}

const universeCache = new Map();

function cachedUniverse(q, degree) {
  const key = `${q}:${degree}`;
  if (!universeCache.has(key)) universeCache.set(key, buildPolynomialUniverse(q, degree));
  return universeCache.get(key);
}

function fieldPrediction(row) {
  const q = row.q;
  const degree = row.scale;
  const cutoff = row.depth;
  const shifts = fieldShapes(q).get(row.shape);
  const maxShiftDegree = Math.max(...shifts.map((shift) => polyDegree(shift, q)));
  const universe = cachedUniverse(q, Math.max(degree, maxShiftDegree));
  const primeDensity = universe.counts[degree] / universe.pow[degree];
  const moments = new Float64Array(8);
  moments[0] = 1;
  for (let mask = 1; mask < 8; mask++) {
    const subset = selected(shifts, mask);
    const order = bitCount(mask);
    let logFactor = 0;
    for (let d = 1; d <= polynomialTailDegree; d++) {
      const norm = q ** d;
      const count = irreducibleCountFormula(q, d);
      if (d <= cutoff) {
        logFactor -= count * order * Math.log1p(-1 / norm);
        continue;
      }
      if (d <= maxShiftDegree) {
        for (const modulus of universe.irreduciblesByDegree[d]) {
          const nu = distinctPolynomialResidues(subset, modulus, q);
          const numerator = 1 - nu / norm;
          if (!(numerator > 0)) {
            logFactor = -Infinity;
            break;
          }
          logFactor += Math.log(numerator) - order * Math.log1p(-1 / norm);
        }
      } else {
        const numerator = 1 - order / norm;
        if (!(numerator > 0)) {
          logFactor = -Infinity;
          break;
        }
        logFactor += count * (Math.log(numerator) - order * Math.log1p(-1 / norm));
      }
      if (!Number.isFinite(logFactor)) break;
    }
    moments[mask] = primeDensity ** order * Math.exp(logFactor);
  }
  return { moments: Array.from(moments), prediction: interactionDefectFromJointMoments(moments, 3) };
}

function compare(row, model) {
  const independentBias = row.controls.independentMask.mean;
  const debiasedReal = Math.max(0, row.real.relativeDefect - (Number.isFinite(independentBias) ? independentBias : 0));
  const predicted = model.prediction.relativeDefect;
  const residual = debiasedReal - predicted;
  const noiseScale = Math.max(
    row.controls.independentMask.sd || 0,
    row.controls.eligibleRandom.sd || 0,
    row.controls.eligibleComposite.sd || 0
  );
  return {
    ...row,
    model,
    independentBias,
    debiasedReal,
    predicted,
    ratio: predicted > 0 ? debiasedReal / predicted : NaN,
    residual,
    residualNoiseZ: noiseScale > 0 ? residual / noiseScale : NaN,
    factorExplainedDiagnostic: predicted > 0
      && debiasedReal / predicted >= 0.5
      && debiasedReal / predicted <= 2
      && Math.abs(noiseScale > 0 ? residual / noiseScale : Infinity) < 4,
  };
}

console.error(`[scid-factor] rational Euler product to ${rationalTailLimit}`);
const integer = pilot.integer.map((row) => compare(row, integerPrediction(row)));
console.error(`[scid-factor] polynomial Euler products to degree ${polynomialTailDegree}`);
const fields = pilot.fields.map((row) => compare(row, fieldPrediction(row)));

function table(rows) {
  return rows.map((row) => `| ${row.universe} | ${row.scaleLabel} | ${row.shape} | ${row.depthLabel} | ${fmt(row.real.relativeDefect, 8)} | ${fmt(row.independentBias, 8)} | ${fmt(row.debiasedReal, 8)} | ${fmt(row.predicted, 8)} | ${fmt(row.ratio, 3)} | ${fmt(row.residualNoiseZ, 2)} | ${row.factorExplainedDiagnostic ? "YES" : "NO"} |`).join("\n");
}

function renderMarkdown(report) {
  const all = [...report.integer, ...report.fields];
  return `# SCID Hardy–Littlewood / prime-polynomial factor check

This is the mandatory disguise check for the calibration pilot. For every
nonempty subset of a shift triple, the model predicts the conditional joint
moment after local factors through the scored cutoff have been removed:

\`\`\`text
m_S ~= density^|S|
       * product(local factor <= cutoff)^(-|S|)
       * product(tuple Euler factors > cutoff).
\`\`\`

The eight exact-mask probabilities are recovered from the seven subset
moments by inclusion–exclusion, then scored with the same SCID definition.
The empirical SCID is debiased by the mean independent-mask control. The
"factor explained" column is diagnostic, not a theorem: ratio in
\`[0.5,2]\` and residual smaller than four matched-control standard
deviations.

- rational Euler-product cutoff: ${report.rationalTailLimit}
- polynomial Euler-product cutoff degree: ${report.polynomialTailDegree}
- diagnostically factor-explained rows: ${all.filter((row) => row.factorExplainedDiagnostic).length}/${all.length}

| universe | scale | shape | depth | raw SCID | entropy bias | debiased real | Euler prediction | ratio | residual/noise | factor explained |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${table(all)}

The product model is asymptotic and the diagnostic does not establish
novelty. A surviving residual must also pass the confirmatory scale ladder and
the primary-source audit.

JSON: \`${report.paths.json}\`
SVG: \`${report.paths.svg}\`
`;
}

function renderSvg(report) {
  const rows = [...report.integer, ...report.fields].filter((row) => row.supportPass && row.debiasedReal > 0 && row.predicted > 0);
  const width = 1000, height = 760, pad = 90;
  const max = Math.max(1e-6, ...rows.flatMap((row) => [row.debiasedReal, row.predicted]));
  const logMin = Math.log10(Math.min(...rows.flatMap((row) => [row.debiasedReal, row.predicted]).filter((x) => x > 0))) - 0.25;
  const logMax = Math.log10(max) + 0.25;
  const xy = (value) => pad + ((Math.log10(value) - logMin) / (logMax - logMin || 1)) * (width - 2 * pad);
  const colors = { Z: "#f8fafc", "F_2[t]": "#a78bfa", "F_3[t]": "#60a5fa", "F_5[t]": "#34d399" };
  const points = rows.map((row) => `<circle cx="${xy(row.predicted)}" cy="${height - xy(row.debiasedReal)}" r="4.5" fill="${colors[row.universe]}" opacity="0.8"><title>${row.universe} ${row.scaleLabel} ${row.shape} ${row.depthLabel}</title></circle>`).join("\n");
  const lo = xy(10 ** logMin), hi = xy(10 ** logMax);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${pad}" y="40" fill="#f8fafc" font-size="21" font-weight="700">SCID factor check</text>
<text x="${pad}" y="66" fill="#94a3b8" font-size="13">debiased observed defect versus truncated tuple Euler-product prediction (log-log)</text>
<rect x="${pad}" y="${pad}" width="${width - 2 * pad}" height="${height - 2 * pad}" fill="#0b1627" stroke="#334155"/>
<line x1="${lo}" y1="${height - lo}" x2="${hi}" y2="${height - hi}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="8 7"/>
${points}
<text x="${width / 2}" y="${height - 24}" text-anchor="middle" fill="#cbd5e1" font-size="14">Euler-product predicted SCID</text>
<text transform="translate(28 ${height / 2}) rotate(-90)" text-anchor="middle" fill="#cbd5e1" font-size="14">debiased observed SCID</text>
</svg>`;
}

const paths = {
  json: path.join(outDir, "scid-factor-check.json"),
  md: path.join(outDir, "scid-factor-check.md"),
  svg: path.join(outDir, "scid-factor-check.svg"),
};
const report = {
  candidate: pilot.candidate,
  grade: "FACTOR_CHECK_ONLY",
  generatedAt: new Date().toISOString(),
  input,
  rationalTailLimit,
  polynomialTailDegree,
  integer,
  fields,
  paths,
};
fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(paths.md, renderMarkdown(report));
fs.writeFileSync(paths.svg, renderSvg(report));

const all = [...integer, ...fields];
console.log(JSON.stringify({
  ok: true,
  grade: report.grade,
  rows: all.length,
  factorExplainedDiagnostic: all.filter((row) => row.factorExplainedDiagnostic).length,
  supportPassing: all.filter((row) => row.supportPass).length,
  largestResiduals: all.filter((row) => row.supportPass && Number.isFinite(row.residualNoiseZ)).sort((a, b) => Math.abs(b.residualNoiseZ) - Math.abs(a.residualNoiseZ)).slice(0, 12).map((row) => ({
    universe: row.universe,
    scale: row.scaleLabel,
    shape: row.shape,
    depth: row.depthLabel,
    debiasedReal: row.debiasedReal,
    predicted: row.predicted,
    ratio: row.ratio,
    residualNoiseZ: row.residualNoiseZ,
  })),
  paths,
}, null, 2));

