#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polyDegree,
  polyMod,
  polyMul,
  polySub,
  polyToString,
} from "../src/core/ffield.js";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const N = Number(process.argv[2] || 6_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const q2MaxDegree = Number(process.argv[4] || 22);
const q3MaxDegree = Number(process.argv[5] || 13);

const W = 30030;
const singularCutoff = 100_000;
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [N / 16, N / 8, N / 4, N / 2, N].map((x) => Math.max(100_000, Math.round(x)));
const integerVertices = [0, 6, 12, 18, 24, 30, 42, 60];
const triples = combinations(integerVertices.length, 3);
const tetrahedra = combinations(integerVertices.length, 4);

function combinations(n, k) {
  const out = [];
  const row = [];
  function rec(start) {
    if (row.length === k) {
      out.push(row.slice());
      return;
    }
    for (let i = start; i <= n - (k - row.length); i++) {
      row.push(i);
      rec(i + 1);
      row.pop();
    }
  }
  rec(0);
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

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function energy(values) {
  return Math.sqrt(mean(values.map((value) => value * value)));
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

function exponent(rows, key, scaleKey) {
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function buildIntegralPrefix(limit) {
  const prefix = new Float64Array(limit + 1);
  for (let n = 1; n <= limit; n++) {
    prefix[n] = prefix[n - 1];
    if (n >= 3) prefix[n] += 1 / (Math.log(n) ** 3);
  }
  return prefix;
}

function integerSingularSeries(shifts, primes) {
  const k = shifts.length;
  let product = 1;
  for (const p of primes) {
    const residues = new Set(shifts.map((shift) => ((shift % p) + p) % p));
    const nu = residues.size;
    if (nu >= p) return 0;
    product *= (1 - nu / p) / ((1 - 1 / p) ** k);
  }
  return product;
}

function relativeIntegerShifts(triple) {
  const base = integerVertices[triple[0]];
  return triple.map((i) => integerVertices[i] - base);
}

function labelsFromFlags(flags) {
  const labels = [];
  for (let n = 2; n < flags.length; n++) if (flags[n]) labels.push(n);
  return labels;
}

function flagsFromLabels(labels, limit) {
  const flags = new Uint8Array(limit + 1);
  for (const label of labels) if (label <= limit) flags[label] = 1;
  return flags;
}

function wheelRandomLabels(limit, seed, isp, compositeOnly = false) {
  const random = rng(seed);
  const phi = phiSmall(W);
  const scale = W / phi;
  const labels = [];
  for (let n = 5; n <= limit; n++) {
    if (gcd(n, W) !== 1) continue;
    if (compositeOnly && isp[n]) continue;
    if (random() < Math.min(1, scale / Math.log(n))) labels.push(n);
  }
  return labels;
}

function tripleKey(triple) {
  return triple.join(",");
}

function tetraLabel(vertices, tetra) {
  return tetra.map((i) => vertices[i]).join(",");
}

function strongest(values, labels, n = 8) {
  return values
    .map((value, i) => ({ id: labels[i], value, abs: Math.abs(value) }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, n);
}

function curlCells(residualByKey, vertices) {
  const cells = [];
  const labels = [];
  for (const [a, b, c, d] of tetrahedra) {
    const cell = residualByKey.get(tripleKey([b, c, d]))
      - residualByKey.get(tripleKey([a, c, d]))
      + residualByKey.get(tripleKey([a, b, d]))
      - residualByKey.get(tripleKey([a, b, c]));
    cells.push(cell);
    labels.push(tetraLabel(vertices, [a, b, c, d]));
  }
  return { cells, labels };
}

function summarizeIntegerLabels(name, labels, flags, integralPrefix, singulars) {
  const cumulativeCounts = endpoints.map(() => new Int32Array(triples.length));
  const maxEndpoint = endpoints.at(-1);
  for (let tripleIndex = 0; tripleIndex < triples.length; tripleIndex++) {
      const shiftValues = relativeIntegerShifts(triples[tripleIndex]);
      const maxShift = shiftValues.at(-1);
    let count = 0;
    let endpointIndex = 0;
    for (const n of labels) {
      while (endpointIndex < endpoints.length && n > endpoints[endpointIndex] - maxShift) {
        cumulativeCounts[endpointIndex][tripleIndex] = count;
        endpointIndex++;
      }
      if (n + maxShift > maxEndpoint) break;
      let ok = true;
      for (let j = 1; j < shiftValues.length; j++) {
        if (!flags[n + shiftValues[j]]) {
          ok = false;
          break;
        }
      }
      if (ok) count++;
    }
    while (endpointIndex < endpoints.length) {
      cumulativeCounts[endpointIndex][tripleIndex] = count;
      endpointIndex++;
    }
  }

  const rows = endpoints.map((x, rowIndex) => {
    const residualByKey = new Map();
    const tripleResiduals = [];
    for (let tripleIndex = 0; tripleIndex < triples.length; tripleIndex++) {
      const maxShift = relativeIntegerShifts(triples[tripleIndex]).at(-1);
      const integral = integralPrefix[Math.max(0, Math.min(N, x - maxShift))];
      const main = singulars[tripleIndex] * integral;
      const count = cumulativeCounts[rowIndex][tripleIndex];
      const residual = main > 1e-9 ? (count - main) / Math.sqrt(main) : 0;
      residualByKey.set(tripleKey(triples[tripleIndex]), residual);
      tripleResiduals.push(residual);
    }
    const curl = curlCells(residualByKey, integerVertices);
    return {
      N: x,
      labels: labels.filter((label) => label <= x).length,
      tripleEnergy: energy(tripleResiduals),
      curlEnergy: energy(curl.cells),
      maxAbsCurl: Math.max(...curl.cells.map(Math.abs)),
      strongestCurl: strongest(curl.cells, curl.labels),
    };
  });

  return {
    name,
    rows,
    exponent: {
      curlEnergy: exponent(rows, "curlEnergy", "N"),
      maxAbsCurl: exponent(rows, "maxAbsCurl", "N"),
    },
  };
}

function groupSummary(group) {
  const last = group.map((series) => series.rows.at(-1));
  return {
    curlEnergyRange: range(last.map((row) => row.curlEnergy)),
    maxAbsCurlRange: range(last.map((row) => row.maxAbsCurl)),
    thetaRange: range(group.map((series) => series.exponent.curlEnergy)),
    strongest: group.map((series) => series.rows.at(-1).strongestCurl[0]),
  };
}

function polyLinearProduct(q) {
  let product = 1;
  for (let a = 0; a < q; a++) product = polyMul(product, q + a, q);
  return product;
}

function polynomialVertices(q) {
  const base = polyLinearProduct(q);
  const lows = q === 2 ? [1, 2, 3, 5, 7, 11, 13] : [1, 2, 3, 4, 5, 7, 8];
  const out = [0];
  const seen = new Set([0]);
  for (const low of lows) {
    const h = polyMul(base, low, q);
    if (!seen.has(h)) {
      seen.add(h);
      out.push(h);
    }
  }
  return out;
}

function polynomialTupleSingular(universe, shifts, productDegree) {
  const q = universe.q;
  const k = shifts.length;
  let product = 1;
  for (let degree = 1; degree <= productDegree; degree++) {
    const norm = q ** degree;
    const denominator = (1 - 1 / norm) ** k;
    for (const primePoly of universe.irreduciblesByDegree[degree]) {
      const residues = new Set(shifts.map((shift) => polyMod(shift, primePoly, q)));
      const nu = residues.size;
      if (nu >= norm) return 0;
      product *= (1 - nu / norm) / denominator;
    }
  }
  return product;
}

function relativePolynomialShifts(vertices, triple, q) {
  const base = vertices[triple[0]];
  return triple.map((i) => polySub(vertices[i], base, q));
}

function countPolynomialTriples(universe, degree, vertices, flags) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const counts = new Int32Array(triples.length);
  for (let lower = 0; lower < flags.length; lower++) {
    if (!flags[lower]) continue;
    const poly = lead + lower;
    for (let tripleIndex = 0; tripleIndex < triples.length; tripleIndex++) {
      const shifts = relativePolynomialShifts(vertices, triples[tripleIndex], q);
      const mate1 = polyAdd(poly, shifts[1], q);
      const mate2 = polyAdd(poly, shifts[2], q);
      if (polyDegree(mate1, q) !== degree || polyDegree(mate2, q) !== degree) continue;
      if (flags[mate1 - lead] && flags[mate2 - lead]) counts[tripleIndex]++;
    }
  }
  return counts;
}

function randomPolynomialFlags(universe, degree, seed, reducibleOnly = false) {
  const random = rng(seed);
  const realFlags = universe.irreducibleFlagsByDegree[degree];
  const size = realFlags.length;
  const target = universe.counts[degree];
  const pool = reducibleOnly ? size - target : size;
  const p = pool > 0 ? target / pool : 0;
  const flags = new Uint8Array(size);
  for (let lower = 0; lower < size; lower++) {
    if (reducibleOnly && realFlags[lower]) continue;
    if (random() < p) flags[lower] = 1;
  }
  return flags;
}

function summarizePolynomialDegree(universe, degree, vertices, singulars, flags, name) {
  const counts = countPolynomialTriples(universe, degree, vertices, flags);
  const residualByKey = new Map();
  const tripleResiduals = [];
  for (let tripleIndex = 0; tripleIndex < triples.length; tripleIndex++) {
    const main = singulars[tripleIndex] * universe.pow[degree] / (degree ** 3);
    const residual = main > 1e-9 ? (counts[tripleIndex] - main) / Math.sqrt(main) : 0;
    residualByKey.set(tripleKey(triples[tripleIndex]), residual);
    tripleResiduals.push(residual);
  }
  const labels = vertices.map((v) => polyToString(v, universe.q));
  const curl = curlCells(residualByKey, labels);
  return {
    name,
    q: universe.q,
    degree,
    labels: flags.reduce((sum, value) => sum + value, 0),
    tripleEnergy: energy(tripleResiduals),
    curlEnergy: energy(curl.cells),
    maxAbsCurl: Math.max(...curl.cells.map(Math.abs)),
    strongestCurl: strongest(curl.cells, curl.labels),
  };
}

function summarizePolynomialUniverse(q, maxDegree) {
  console.error(`[curl] building F_${q}[t] universe to degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const vertices = polynomialVertices(q);
  const singulars = triples.map((triple) => polynomialTupleSingular(
    universe,
    relativePolynomialShifts(vertices, triple, q),
    maxDegree,
  ));
  const startDegree = Math.max(5, maxDegree - 4);
  const rows = [];
  for (let degree = startDegree; degree <= maxDegree; degree++) {
    console.error(`[curl] F_${q}[t] degree ${degree}`);
    rows.push(summarizePolynomialDegree(
      universe,
      degree,
      vertices,
      singulars,
      universe.irreducibleFlagsByDegree[degree],
      `F_${q}-real`,
    ));
  }
  const finalDegree = maxDegree;
  const randomMonic = seeds.map((seed) => summarizePolynomialDegree(
    universe,
    finalDegree,
    vertices,
    singulars,
    randomPolynomialFlags(universe, finalDegree, seed, false),
    `F_${q}-random-monic-${seed}`,
  ));
  const randomReducible = seeds.map((seed) => summarizePolynomialDegree(
    universe,
    finalDegree,
    vertices,
    singulars,
    randomPolynomialFlags(universe, finalDegree, seed ^ 0x9e3779b9, true),
    `F_${q}-random-reducible-${seed}`,
  ));
  return {
    q,
    maxDegree,
    vertices: vertices.map((v) => polyToString(v, q)),
    rows,
    exponent: {
      curlEnergy: exponent(rows, "curlEnergy", "degree"),
      maxAbsCurl: exponent(rows, "maxAbsCurl", "degree"),
    },
    controls: {
      randomMonicSummary: {
        curlEnergyRange: range(randomMonic.map((row) => row.curlEnergy)),
        maxAbsCurlRange: range(randomMonic.map((row) => row.maxAbsCurl)),
      },
      randomReducibleSummary: {
        curlEnergyRange: range(randomReducible.map((row) => row.curlEnergy)),
        maxAbsCurlRange: range(randomReducible.map((row) => row.maxAbsCurl)),
      },
    },
  };
}

function mdRows(series) {
  return series.rows.map((row) => `| ${row.N} | ${row.labels} | ${row.tripleEnergy.toFixed(6)} | ${row.curlEnergy.toFixed(6)} | ${row.maxAbsCurl.toFixed(6)} | ${row.strongestCurl[0].id} ${row.strongestCurl[0].value.toFixed(3)} |`).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => `| ${row.degree} | ${row.labels} | ${row.tripleEnergy.toFixed(6)} | ${row.curlEnergy.toFixed(6)} | ${row.maxAbsCurl.toFixed(6)} | ${row.strongestCurl[0].id} ${row.strongestCurl[0].value.toFixed(3)} |`).join("\n");
}

function mdSummaryLine(name, summary) {
  return `| ${name} | ${summary.curlEnergyRange[0].toFixed(6)} .. ${summary.curlEnergyRange[1].toFixed(6)} | ${summary.maxAbsCurlRange[0].toFixed(6)} .. ${summary.maxAbsCurlRange[1].toFixed(6)} | ${summary.thetaRange ? `${summary.thetaRange[0].toFixed(6)} .. ${summary.thetaRange[1].toFixed(6)}` : ""} |`;
}

function svg(output) {
  const width = 1120, height = 640, pad = 66;
  const points = [
    ...output.integer.real.rows.map((row) => ({ group: "Z", x: Math.log(row.N), y: row.curlEnergy })),
    ...output.integer.wheelMean.rows.map((row) => ({ group: "wheel", x: Math.log(row.N), y: row.curlEnergy })),
    ...output.integer.compositeMean.rows.map((row) => ({ group: "composite", x: Math.log(row.N), y: row.curlEnergy })),
    ...output.functionFields.flatMap((field) => field.rows.map((row) => ({ group: `F_${field.q}`, x: Math.log(row.labels || 1), y: row.curlEnergy }))),
  ];
  const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x));
  const minY = 0, maxY = Math.max(1, ...points.map((p) => p.y)) * 1.08;
  const sx = (x) => pad + (x - minX) / ((maxX - minX) || 1) * (width - 2 * pad);
  const sy = (y) => height - pad - (y - minY) / ((maxY - minY) || 1) * (height - 2 * pad);
  const colors = { Z: "#67e8f9", wheel: "#fbbf24", composite: "#fb7185", F_2: "#a78bfa", F_3: "#34d399" };
  const groups = ["Z", "wheel", "composite", ...output.functionFields.map((field) => `F_${field.q}`)];
  const lineFor = (group) => {
    const groupPoints = points.filter((p) => p.group === group);
    const d = groupPoints.map((p, i) => `${i ? "L" : "M"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(" ");
    const circles = groupPoints.map((p) => `<circle cx="${sx(p.x).toFixed(2)}" cy="${sy(p.y).toFixed(2)}" r="4" fill="${colors[group]}"/>`).join("\n");
    return `<path d="${d}" fill="none" stroke="${colors[group]}" stroke-width="2.5"/>\n${circles}`;
  };
  const legend = groups.map((group, i) => `<text x="${pad}" y="${49 + i * 19}" fill="${colors[group]}" font-size="13">${group} curl energy</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<g stroke="#1f2937" stroke-width="1">
${[0.25, 0.5, 0.75, 1].map((t) => `<line x1="${pad}" x2="${width - pad}" y1="${sy(maxY * t).toFixed(2)}" y2="${sy(maxY * t).toFixed(2)}"/>`).join("\n")}
</g>
${groups.map(lineFor).join("\n")}
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="24" fill="#f8fafc" font-size="18">tuple-residual tetrahedron curl</text>
${legend}
<text x="${pad}" y="${height - 26}" fill="#94a3b8" font-size="12">x = log(range/labels), y = RMS alternating boundary of HL-whitened triple residuals</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[curl] integer side to ${N}`);
const isp = sieve(N);
const integralPrefix = buildIntegralPrefix(N);
const singularPrimes = primesUpTo(singularCutoff);
const singulars = triples.map((triple) => integerSingularSeries(relativeIntegerShifts(triple), singularPrimes));
const realLabels = labelsFromFlags(isp);
const real = summarizeIntegerLabels("real-primes", realLabels, isp, integralPrefix, singulars);
const cramer = seeds.map((seed) => {
  const labels = cramerPrimes(N, seed);
  return summarizeIntegerLabels(`cramer-${seed}`, labels, flagsFromLabels(labels, N), integralPrefix, singulars);
});
const wheel = seeds.map((seed) => {
  const labels = wheelRandomLabels(N, seed, isp, false);
  return summarizeIntegerLabels(`wheel-${seed}`, labels, flagsFromLabels(labels, N), integralPrefix, singulars);
});
const composite = seeds.map((seed) => {
  const labels = wheelRandomLabels(N, seed ^ 0x9e3779b9, isp, true);
  return summarizeIntegerLabels(`composite-${seed}`, labels, flagsFromLabels(labels, N), integralPrefix, singulars);
});

function meanSeries(name, group) {
  return {
    name,
    rows: endpoints.map((x, i) => ({
      N: x,
      curlEnergy: mean(group.map((series) => series.rows[i].curlEnergy)),
      maxAbsCurl: mean(group.map((series) => series.rows[i].maxAbsCurl)),
    })),
  };
}

const functionFields = [
  summarizePolynomialUniverse(2, q2MaxDegree),
  summarizePolynomialUniverse(3, q3MaxDegree),
];

const output = {
  candidate: "tuple-residual tetrahedron curl",
  N,
  W,
  singularCutoff,
  seeds,
  integer: {
    vertices: integerVertices,
    endpoints,
    real,
    cramer,
    wheel,
    composite,
    wheelMean: meanSeries("wheel-mean", wheel),
    compositeMean: meanSeries("composite-mean", composite),
    summaries: {
      cramer: groupSummary(cramer),
      wheel: groupSummary(wheel),
      composite: groupSummary(composite),
    },
  },
  functionFields,
};

const jsonPath = path.join(outDir, `tuple-curl-audit-${N}.json`);
const mdPath = path.join(outDir, `tuple-curl-audit-${N}.md`);
const svgPath = path.join(outDir, `tuple-curl-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(output));

const md = `# Tuple-residual tetrahedron curl audit

Candidate:
after cellwise tuple singular-series subtraction, treat triple residuals as a
2-cochain on shifts and score the alternating boundary over tetrahedra:
\`C_ijkl = R_jkl - R_ikl + R_ijl - R_ijk\`.

Integer singular series used primes \`<=${singularCutoff}\`.

## Integer side

| N | labels | triple energy | curl energy | max abs curl | strongest tetrahedron |
| ---: | ---: | ---: | ---: | ---: | --- |
${mdRows(real)}

Integer exponent fits:
\`curl theta=${real.exponent.curlEnergy.toFixed(6)}\`,
\`max-curl theta=${real.exponent.maxAbsCurl.toFixed(6)}\`.

Endpoint controls at N=${N}:

| group | curl energy range | max abs curl range | curl theta range |
| --- | ---: | ---: | ---: |
${mdSummaryLine("Cramer labels", output.integer.summaries.cramer)}
${mdSummaryLine("W=30030 fake labels", output.integer.summaries.wheel)}
${mdSummaryLine("W=30030 composite-only", output.integer.summaries.composite)}

Strongest real endpoint tetrahedra:

${real.rows.at(-1).strongestCurl.map((cell) => `- ${cell.id}: ${cell.value.toFixed(6)}`).join("\n")}

## Function-field side

${functionFields.map((field) => `### F_${field.q}[t]

Vertices: ${field.vertices.map((v) => `\`${v}\``).join(", ")}

| degree | labels | triple energy | curl energy | max abs curl | strongest tetrahedron |
| ---: | ---: | ---: | ---: | ---: | --- |
${mdFieldRows(field)}

Endpoint random monic controls:
\`${field.controls.randomMonicSummary.curlEnergyRange[0].toFixed(6)} .. ${field.controls.randomMonicSummary.curlEnergyRange[1].toFixed(6)}\`
curl energy, max curl
\`${field.controls.randomMonicSummary.maxAbsCurlRange[0].toFixed(6)} .. ${field.controls.randomMonicSummary.maxAbsCurlRange[1].toFixed(6)}\`.

Endpoint random reducible controls:
\`${field.controls.randomReducibleSummary.curlEnergyRange[0].toFixed(6)} .. ${field.controls.randomReducibleSummary.curlEnergyRange[1].toFixed(6)}\`
curl energy, max curl
\`${field.controls.randomReducibleSummary.maxAbsCurlRange[0].toFixed(6)} .. ${field.controls.randomReducibleSummary.maxAbsCurlRange[1].toFixed(6)}\`.

Strongest endpoint tetrahedra:

${field.rows.at(-1).strongestCurl.map((cell) => `- ${cell.id}: ${cell.value.toFixed(6)}`).join("\n")}
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
  integerLast: {
    N: real.rows.at(-1).N,
    labels: real.rows.at(-1).labels,
    tripleEnergy: real.rows.at(-1).tripleEnergy,
    curlEnergy: real.rows.at(-1).curlEnergy,
    maxAbsCurl: real.rows.at(-1).maxAbsCurl,
    strongestCurl: real.rows.at(-1).strongestCurl.slice(0, 5),
    exponent: real.exponent,
  },
  integerControls: output.integer.summaries,
  fieldLast: functionFields.map((field) => ({
    q: field.q,
    last: {
      degree: field.rows.at(-1).degree,
      labels: field.rows.at(-1).labels,
      tripleEnergy: field.rows.at(-1).tripleEnergy,
      curlEnergy: field.rows.at(-1).curlEnergy,
      maxAbsCurl: field.rows.at(-1).maxAbsCurl,
      strongestCurl: field.rows.at(-1).strongestCurl.slice(0, 5),
      exponent: field.exponent,
    },
    controls: field.controls,
  })),
}, null, 2));
