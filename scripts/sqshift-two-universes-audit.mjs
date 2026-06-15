#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polySub,
  polynomialMobius,
} from "../src/core/ffield.js";
import { cramerPrimes, mobiusUpTo, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 16_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const integerEndpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(1000, Math.round(x)));
const fieldSpecs = [
  { q: 2, maxDegree: 24, degrees: [20, 21, 22, 23, 24] },
  { q: 3, maxDegree: 15, degrees: [11, 12, 13, 14, 15] },
];

function gcd(a, b) {
  let x = Math.abs(a), y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function phiSmall(n) {
  let out = n, m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    out -= Math.floor(out / p);
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= Math.floor(out / m);
  return out;
}

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

function linearFit(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  const slope = sxy / (sxx || 1);
  return { slope, intercept: my - slope * mx };
}

function residualExponent(rows, scaleKey = "labels") {
  const fitRows = rows.filter((r) => Math.abs(r.residual) > 0 && r[scaleKey] > 1);
  if (fitRows.length < 2) return { theta: 0, C: 0 };
  const fit = linearFit(
    fitRows.map((r) => Math.log(r[scaleKey])),
    fitRows.map((r) => Math.log(Math.abs(r.residual))),
  );
  return { theta: fit.slope, C: Math.exp(fit.intercept) };
}

function range(values) {
  let lo = Infinity, hi = -Infinity;
  for (const value of values) {
    if (value < lo) lo = value;
    if (value > hi) hi = value;
  }
  return [lo, hi];
}

function finiteArtinProducts(limit) {
  const primes = primesUpTo(Math.max(2, Math.floor(Math.sqrt(limit))));
  let product = 1, j = 0;
  const out = new Map();
  for (const x of integerEndpoints) {
    const cutoff = Math.floor(Math.sqrt(x));
    while (j < primes.length && primes[j] <= cutoff) {
      const p = primes[j++];
      product *= 1 - 1 / (p * (p - 1));
    }
    out.set(x, product);
  }
  return out;
}

function wheelRandomLabels(maxN, W, seed, isp, compositeOnly = false) {
  const phiW = phiSmall(W);
  const scale = W / phiW;
  const random = rng(seed);
  const labels = [];
  for (let n = 5; n <= maxN; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, scale / Math.log(n))) labels.push(n);
  }
  return labels;
}

function summarizeIntegerLabels(name, labels, mu, products) {
  const rows = [];
  let j = 0, squarefree = 0;
  for (const x of integerEndpoints) {
    while (j < labels.length && labels[j] <= x) {
      if ((mu[labels[j] - 1] || 0) !== 0) squarefree++;
      j++;
    }
    const expected = products.get(x);
    const residual = squarefree - expected * j;
    rows.push({
      N: x,
      labels: j,
      squarefree,
      expected,
      mean: j ? squarefree / j : 0,
      residual,
      residualOverSqrtLabels: j ? residual / Math.sqrt(j) : 0,
      binomialZ: j ? residual / Math.sqrt(j * expected * (1 - expected)) : 0,
    });
  }
  return { name, rows, exponent: residualExponent(rows) };
}

function groupSummary(group) {
  const last = group.map((s) => s.rows.at(-1));
  return {
    meanRange: range(last.map((r) => r.mean)),
    residualOverSqrtLabelsRange: range(last.map((r) => r.residualOverSqrtLabels)),
    binomialZRange: range(last.map((r) => r.binomialZ)),
    thetaRange: range(group.map((s) => s.exponent.theta)),
  };
}

function squarefreeShiftProduct(universe, degree) {
  const maxFactorDegree = Math.floor(degree / 2);
  let product = 1;
  for (let d = 1; d <= maxFactorDegree; d++) {
    const norm = universe.q ** d;
    const factor = 1 - 1 / (norm * norm - norm);
    product *= factor ** universe.counts[d];
  }
  return product;
}

function squarefreeShiftFlags(universe, degree) {
  const flags = new Uint8Array(universe.pow[degree]);
  const lead = universe.pow[degree];
  for (let lower = 0; lower < flags.length; lower++) {
    flags[lower] = polynomialMobius(polySub(lead + lower, 1, universe.q), universe) !== 0 ? 1 : 0;
  }
  return flags;
}

function summarizeFieldDegree(universe, degree, doControls) {
  const expected = squarefreeShiftProduct(universe, degree);
  const irred = universe.irreducibleFlagsByDegree[degree];
  const squarefree = squarefreeShiftFlags(universe, degree);
  let count = 0, squarefreeCount = 0, compositeCount = 0;
  for (let lower = 0; lower < irred.length; lower++) {
    if (irred[lower]) {
      count++;
      squarefreeCount += squarefree[lower];
    } else {
      compositeCount++;
    }
  }
  const residual = squarefreeCount - expected * count;
  const row = {
    q: universe.q,
    degree,
    labels: count,
    squarefree: squarefreeCount,
    expected,
    mean: squarefreeCount / count,
    residual,
    residualOverSqrtLabels: residual / Math.sqrt(count),
    binomialZ: residual / Math.sqrt(count * expected * (1 - expected)),
  };

  if (!doControls) return { row, controls: null };

  const randoms = seeds.map((seed) => rng(seed));
  const compositeRandoms = seeds.map((seed) => rng(seed ^ 0x9e3779b9));
  const randomLabelCounts = new Int32Array(seeds.length);
  const randomSqCounts = new Int32Array(seeds.length);
  const compositeLabelCounts = new Int32Array(seeds.length);
  const compositeSqCounts = new Int32Array(seeds.length);
  const randomP = count / irred.length;
  const compositeP = count / compositeCount;

  for (let lower = 0; lower < irred.length; lower++) {
    const sf = squarefree[lower];
    for (let i = 0; i < seeds.length; i++) {
      if (randoms[i]() < randomP) {
        randomLabelCounts[i]++;
        randomSqCounts[i] += sf;
      }
      if (!irred[lower] && compositeRandoms[i]() < compositeP) {
        compositeLabelCounts[i]++;
        compositeSqCounts[i] += sf;
      }
    }
  }

  function controlRows(prefix, labelCounts, sqCounts) {
    return seeds.map((seed, i) => {
      const labels = labelCounts[i];
      const sq = sqCounts[i];
      const controlResidual = sq - expected * labels;
      return {
        name: `${prefix}-${seed}`,
        labels,
        squarefree: sq,
        mean: labels ? sq / labels : 0,
        residual: controlResidual,
        residualOverSqrtLabels: labels ? controlResidual / Math.sqrt(labels) : 0,
        binomialZ: labels ? controlResidual / Math.sqrt(labels * expected * (1 - expected)) : 0,
      };
    });
  }

  const randomControls = controlRows("random-monic", randomLabelCounts, randomSqCounts);
  const compositeControls = controlRows("random-reducible", compositeLabelCounts, compositeSqCounts);

  return {
    row,
    controls: {
      randomMonic: randomControls,
      randomReducible: compositeControls,
      randomMonicSummary: {
        meanRange: range(randomControls.map((r) => r.mean)),
        residualOverSqrtLabelsRange: range(randomControls.map((r) => r.residualOverSqrtLabels)),
        binomialZRange: range(randomControls.map((r) => r.binomialZ)),
      },
      randomReducibleSummary: {
        meanRange: range(compositeControls.map((r) => r.mean)),
        residualOverSqrtLabelsRange: range(compositeControls.map((r) => r.residualOverSqrtLabels)),
        binomialZRange: range(compositeControls.map((r) => r.binomialZ)),
      },
    },
  };
}

function summarizeField(spec) {
  console.error(`[sqshift] building F_${spec.q}[t] universe to degree ${spec.maxDegree}`);
  const universe = buildPolynomialUniverse(spec.q, spec.maxDegree);
  const rows = [];
  let finalControls = null;
  for (const degree of spec.degrees) {
    console.error(`[sqshift] F_${spec.q}[t] degree ${degree}`);
    const result = summarizeFieldDegree(universe, degree, degree === spec.degrees.at(-1));
    rows.push(result.row);
    if (result.controls) finalControls = result.controls;
  }
  return {
    q: spec.q,
    maxDegree: spec.maxDegree,
    degrees: spec.degrees,
    rows,
    exponent: residualExponent(rows),
    finalControls,
  };
}

function mdIntegerRows(series) {
  return series.rows.map((r) => `| ${r.N} | ${r.labels} | ${r.squarefree} | ${r.expected.toFixed(12)} | ${r.mean.toFixed(8)} | ${r.residual.toFixed(3)} | ${r.residualOverSqrtLabels.toFixed(6)} | ${r.binomialZ.toFixed(3)} |`).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((r) => `| ${r.degree} | ${r.labels} | ${r.squarefree} | ${r.expected.toFixed(12)} | ${r.mean.toFixed(8)} | ${r.residual.toFixed(3)} | ${r.residualOverSqrtLabels.toFixed(6)} | ${r.binomialZ.toFixed(3)} |`).join("\n");
}

function mdGroupLine(name, summary) {
  return `| ${name} | ${summary.meanRange[0].toFixed(8)} .. ${summary.meanRange[1].toFixed(8)} | ${summary.residualOverSqrtLabelsRange[0].toFixed(6)} .. ${summary.residualOverSqrtLabelsRange[1].toFixed(6)} | ${summary.binomialZRange[0].toFixed(3)} .. ${summary.binomialZRange[1].toFixed(3)} | ${summary.thetaRange ? `${summary.thetaRange[0].toFixed(6)} .. ${summary.thetaRange[1].toFixed(6)}` : ""} |`;
}

function svg(output) {
  const width = 1100, height = 620, pad = 62;
  const points = [
    ...output.integer.real.rows.map((r) => ({ label: "Z", x: Math.log(r.labels), y: r.residualOverSqrtLabels })),
    ...output.functionFields.flatMap((field) => field.rows.map((r) => ({ label: `F_${field.q}`, x: Math.log(r.labels), y: r.residualOverSqrtLabels }))),
  ];
  const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(-1, ...points.map((p) => p.y)), maxY = Math.max(1, ...points.map((p) => p.y));
  const xScale = (x) => pad + (x - minX) / ((maxX - minX) || 1) * (width - 2 * pad);
  const yScale = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const colors = { Z: "#7dd3fc", F_2: "#fbbf24", F_3: "#f472b6" };
  const groups = ["Z", "F_2", "F_3"].map((label) => {
    const group = points.filter((p) => p.label === label);
    const d = group.map((p, i) => `${i ? "L" : "M"} ${xScale(p.x).toFixed(2)} ${yScale(p.y).toFixed(2)}`).join(" ");
    const circles = group.map((p) => `<circle cx="${xScale(p.x).toFixed(2)}" cy="${yScale(p.y).toFixed(2)}" r="3.5" fill="${colors[label]}"/>`).join("\n");
    return `<path d="${d}" fill="none" stroke="${colors[label]}" stroke-width="2.5"/>\n${circles}`;
  }).join("\n");
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#070b14"/>
<line x1="${pad}" x2="${width - pad}" y1="${zero}" y2="${zero}" stroke="#64748b" stroke-width="1" stroke-dasharray="5 5"/>
${groups}
<g font-family="Menlo, Consolas, monospace" font-size="13">
<text x="${pad}" y="28" fill="${colors.Z}">Z finite-Artin residual/sqrt(labels)</text>
<text x="${pad}" y="48" fill="${colors.F_2}">F_2[t] finite-local residual/sqrt(labels)</text>
<text x="${pad}" y="68" fill="${colors.F_3}">F_3[t] finite-local residual/sqrt(labels)</text>
<text x="${pad}" y="${height - 20}" fill="#94a3b8">x=log(labels), y=(squarefree shifted prime objects - local product * labels)/sqrt(labels)</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[sqshift] integer side to ${N}`);
const mu = mobiusUpTo(N);
const isp = sieve(N);
const products = finiteArtinProducts(N);
const realInteger = summarizeIntegerLabels("real-primes", primesUpTo(N), mu, products);
const cramer = seeds.map((seed) => summarizeIntegerLabels(`cramer-seed-${seed}`, cramerPrimes(N, seed), mu, products));
const wheel = seeds.map((seed) => summarizeIntegerLabels(`wheel-W210-seed-${seed}`, wheelRandomLabels(N, 210, seed, isp, false), mu, products));
const composite = seeds.map((seed) => summarizeIntegerLabels(`composite-W210-seed-${seed}`, wheelRandomLabels(N, 210, seed, isp, true), mu, products));

const functionFields = fieldSpecs.map(summarizeField);

const output = {
  candidate: "two-universes squarefree shifted prime-object residual",
  N,
  seeds,
  integer: {
    endpoints: integerEndpoints,
    real: realInteger,
    cramer,
    wheel,
    composite,
    summaries: {
      cramer: groupSummary(cramer),
      wheel: groupSummary(wheel),
      composite: groupSummary(composite),
    },
  },
  functionFields,
};

const jsonPath = path.join(outDir, `sqshift-two-universes-audit-${N}.json`);
const mdPath = path.join(outDir, `sqshift-two-universes-audit-${N}.md`);
const svgPath = path.join(outDir, `sqshift-two-universes-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(output));

const md = `# Two-universes squarefree-shift audit

Candidate:
\`SqShift_U = mean_{prime objects a in U} mu(a-1)^2 - A_U\`.

Integer main term is the finite Artin product through primes \`l<=sqrt(x)\`.
Function-field main term is
\`prod_{deg P<=floor(n/2)}(1-1/(|P|^2-|P|))\`.

## Integer side

| N | labels | squarefree | finite product | mean | residual | residual/sqrt(labels) | binomial z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdIntegerRows(realInteger)}

Integer residual exponent versus labels:
\`theta=${realInteger.exponent.theta.toFixed(6)}\`.

### Integer controls at N=${N}

| group | mean range | residual/sqrt(labels) range | binomial z range | theta range |
| --- | ---: | ---: | ---: | ---: |
${mdGroupLine("ordinary Cramer", output.integer.summaries.cramer)}
${mdGroupLine("W=210 fake labels", output.integer.summaries.wheel)}
${mdGroupLine("W=210 composite-only", output.integer.summaries.composite)}

## Function-field side

${functionFields.map((field) => `### F_${field.q}[t]

| degree | labels | squarefree | finite product | mean | residual | residual/sqrt(labels) | binomial z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${mdFieldRows(field)}

Residual exponent versus labels:
\`theta=${field.exponent.theta.toFixed(6)}\`.

Final-degree controls:

| group | mean range | residual/sqrt(labels) range | binomial z range | theta range |
| --- | ---: | ---: | ---: | ---: |
${mdGroupLine("random monic labels", field.finalControls.randomMonicSummary)}
${mdGroupLine("random reducible labels", field.finalControls.randomReducibleSummary)}
`).join("\n")}

SVG: \`${svgPath}\`
JSON: \`${jsonPath}\`
`;

fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  integerLast: realInteger.rows.at(-1),
  integerTheta: realInteger.exponent.theta,
  fieldLast: functionFields.map((field) => ({
    q: field.q,
    last: field.rows.at(-1),
    theta: field.exponent.theta,
    controls: field.finalControls,
  })),
}, null, 2));
