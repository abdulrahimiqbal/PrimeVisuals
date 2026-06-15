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
const taus = [0.5, 1, 1.5];

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

const triples = combinations(integerVertices.length, 3);
const tetrahedra = combinations(integerVertices.length, 4);

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

function integerSingularSeries(a, b, primes) {
  let product = 1;
  for (const p of primes) {
    const residues = new Set([0, a % p, b % p]);
    const nu = residues.size;
    if (nu >= p) return 0;
    product *= (1 - nu / p) / ((1 - 1 / p) ** 3);
  }
  return product;
}

function shapeKey(a, b) {
  return `${a},${b}`;
}

function buildIntegerShapeComplex(vertices) {
  const shapeMap = new Map();
  const shapeForTriple = new Map();
  for (const triple of triples) {
    const a = vertices[triple[1]] - vertices[triple[0]];
    const b = vertices[triple[2]] - vertices[triple[0]];
    const key = shapeKey(a, b);
    if (!shapeMap.has(key)) shapeMap.set(key, { key, a, b, label: key });
    shapeForTriple.set(triple.join(","), key);
  }
  const shapes = Array.from(shapeMap.values()).sort((x, y) => x.a - y.a || x.b - y.b);
  const index = new Map(shapes.map((shape, i) => [shape.key, i]));
  const edges = Array.from({ length: shapes.length }, () => new Set());
  for (const [i, j, k, l] of tetrahedra) {
    const faceKeys = [
      [j, k, l],
      [i, k, l],
      [i, j, l],
      [i, j, k],
    ].map((face) => shapeForTriple.get(face.join(",")));
    for (let a = 0; a < faceKeys.length; a++) {
      for (let b = a + 1; b < faceKeys.length; b++) {
        const u = index.get(faceKeys[a]);
        const v = index.get(faceKeys[b]);
        if (u !== v) {
          edges[u].add(v);
          edges[v].add(u);
        }
      }
    }
  }
  return { shapes, edges };
}

function polyShapeKey(a, b) {
  return `${a}:${b}`;
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

function buildPolynomialShapeComplex(vertices, q) {
  const shapeMap = new Map();
  const shapeForTriple = new Map();
  for (const triple of triples) {
    const base = vertices[triple[0]];
    const a = polySub(vertices[triple[1]], base, q);
    const b = polySub(vertices[triple[2]], base, q);
    const key = polyShapeKey(a, b);
    if (!shapeMap.has(key)) {
      shapeMap.set(key, {
        key,
        a,
        b,
        label: `${polyToString(a, q)} | ${polyToString(b, q)}`,
      });
    }
    shapeForTriple.set(triple.join(","), key);
  }
  const shapes = Array.from(shapeMap.values()).sort((x, y) => x.a - y.a || x.b - y.b);
  const index = new Map(shapes.map((shape, i) => [shape.key, i]));
  const edges = Array.from({ length: shapes.length }, () => new Set());
  for (const [i, j, k, l] of tetrahedra) {
    const faceKeys = [
      [j, k, l],
      [i, k, l],
      [i, j, l],
      [i, j, k],
    ].map((face) => shapeForTriple.get(face.join(",")));
    for (let a = 0; a < faceKeys.length; a++) {
      for (let b = a + 1; b < faceKeys.length; b++) {
        const u = index.get(faceKeys[a]);
        const v = index.get(faceKeys[b]);
        if (u !== v) {
          edges[u].add(v);
          edges[v].add(u);
        }
      }
    }
  }
  return { shapes, edges };
}

function componentStats(residuals, labels, edges, tau) {
  const active = residuals.map((value) => value > tau ? 1 : value < -tau ? -1 : 0);
  const seen = new Uint8Array(active.length);
  const components = [];
  for (let i = 0; i < active.length; i++) {
    if (!active[i] || seen[i]) continue;
    const sign = active[i];
    const stack = [i];
    seen[i] = 1;
    const nodes = [];
    while (stack.length) {
      const u = stack.pop();
      nodes.push(u);
      for (const v of edges[u]) {
        if (!seen[v] && active[v] === sign) {
          seen[v] = 1;
          stack.push(v);
        }
      }
    }
    components.push({
      sign,
      size: nodes.length,
      labels: nodes.map((node) => labels[node]),
      maxAbs: Math.max(...nodes.map((node) => Math.abs(residuals[node]))),
    });
  }
  components.sort((a, b) => b.size - a.size || b.maxAbs - a.maxAbs);
  const largest = components[0] || { sign: 0, size: 0, labels: [], maxAbs: 0 };
  return {
    tau,
    activeCount: active.filter(Boolean).length,
    positiveCount: active.filter((x) => x > 0).length,
    negativeCount: active.filter((x) => x < 0).length,
    largestSize: largest.size,
    persistence: largest.size / active.length,
    largest,
    components: components.slice(0, 8),
  };
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

function strongestShapes(residuals, shapes) {
  return residuals
    .map((value, i) => ({ shape: shapes[i].label, value, abs: Math.abs(value) }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 8);
}

function summarizeIntegerLabels(name, labels, flags, complex, singulars, integralPrefix) {
  const { shapes, edges } = complex;
  const cumulative = endpoints.map(() => new Int32Array(shapes.length));
  const maxEndpoint = endpoints.at(-1);
  for (let shapeIndex = 0; shapeIndex < shapes.length; shapeIndex++) {
    const { a, b } = shapes[shapeIndex];
    let count = 0;
    let endpointIndex = 0;
    for (const n of labels) {
      while (endpointIndex < endpoints.length && n > endpoints[endpointIndex] - b) {
        cumulative[endpointIndex][shapeIndex] = count;
        endpointIndex++;
      }
      if (n + b > maxEndpoint) break;
      if (flags[n + a] && flags[n + b]) count++;
    }
    while (endpointIndex < endpoints.length) cumulative[endpointIndex++][shapeIndex] = count;
  }
  const rows = endpoints.map((x, rowIndex) => {
    const residuals = shapes.map((shape, shapeIndex) => {
      const integral = integralPrefix[Math.max(0, Math.min(N, x - shape.b))];
      const main = singulars[shapeIndex] * integral;
      return main > 1e-9 ? (cumulative[rowIndex][shapeIndex] - main) / Math.sqrt(main) : 0;
    });
    const byTau = Object.fromEntries(taus.map((tau) => [tau, componentStats(residuals, shapes.map((s) => s.label), edges, tau)]));
    return {
      N: x,
      labels: labels.filter((label) => label <= x).length,
      shapeEnergy: energy(residuals),
      maxAbsShape: Math.max(...residuals.map(Math.abs)),
      persistenceTau1: byTau[1].persistence,
      activeTau1: byTau[1].activeCount,
      largestTau1: byTau[1].largest,
      byTau,
      strongestShapes: strongestShapes(residuals, shapes),
    };
  });
  return {
    name,
    rows,
    exponent: {
      persistenceTau1: exponent(rows, "persistenceTau1", "N"),
      shapeEnergy: exponent(rows, "shapeEnergy", "N"),
    },
  };
}

function groupSummary(group) {
  const last = group.map((series) => series.rows.at(-1));
  return {
    persistenceRange: range(last.map((row) => row.persistenceTau1)),
    activeRange: range(last.map((row) => row.activeTau1)),
    shapeEnergyRange: range(last.map((row) => row.shapeEnergy)),
    thetaRange: range(group.map((series) => series.exponent.persistenceTau1)),
    largest: last.map((row) => row.largestTau1),
  };
}

function rowGroupSummary(rows) {
  return {
    persistenceRange: range(rows.map((row) => row.persistenceTau1)),
    activeRange: range(rows.map((row) => row.activeTau1)),
    shapeEnergyRange: range(rows.map((row) => row.shapeEnergy)),
    thetaRange: [0, 0],
    largest: rows.map((row) => row.largestTau1),
  };
}

function polynomialTupleSingular(universe, a, b, productDegree) {
  const q = universe.q;
  let product = 1;
  for (let degree = 1; degree <= productDegree; degree++) {
    const norm = q ** degree;
    const denominator = (1 - 1 / norm) ** 3;
    for (const primePoly of universe.irreduciblesByDegree[degree]) {
      const residues = new Set([0, polyMod(a, primePoly, q), polyMod(b, primePoly, q)]);
      const nu = residues.size;
      if (nu >= norm) return 0;
      product *= (1 - nu / norm) / denominator;
    }
  }
  return product;
}

function countPolynomialShapes(universe, degree, shapes, flags) {
  const q = universe.q;
  const lead = universe.pow[degree];
  const counts = new Int32Array(shapes.length);
  for (let lower = 0; lower < flags.length; lower++) {
    if (!flags[lower]) continue;
    const poly = lead + lower;
    for (let shapeIndex = 0; shapeIndex < shapes.length; shapeIndex++) {
      const shape = shapes[shapeIndex];
      const mate1 = polyAdd(poly, shape.a, q);
      const mate2 = polyAdd(poly, shape.b, q);
      if (polyDegree(mate1, q) !== degree || polyDegree(mate2, q) !== degree) continue;
      if (flags[mate1 - lead] && flags[mate2 - lead]) counts[shapeIndex]++;
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

function summarizePolynomialDegree(universe, degree, complex, singulars, flags, name) {
  const { shapes, edges } = complex;
  const counts = countPolynomialShapes(universe, degree, shapes, flags);
  const residuals = shapes.map((shape, i) => {
    const main = singulars[i] * universe.pow[degree] / (degree ** 3);
    return main > 1e-9 ? (counts[i] - main) / Math.sqrt(main) : 0;
  });
  const byTau = Object.fromEntries(taus.map((tau) => [tau, componentStats(residuals, shapes.map((s) => s.label), edges, tau)]));
  return {
    name,
    q: universe.q,
    degree,
    labels: flags.reduce((sum, value) => sum + value, 0),
    shapeEnergy: energy(residuals),
    maxAbsShape: Math.max(...residuals.map(Math.abs)),
    persistenceTau1: byTau[1].persistence,
    activeTau1: byTau[1].activeCount,
    largestTau1: byTau[1].largest,
    byTau,
    strongestShapes: strongestShapes(residuals, shapes),
  };
}

function summarizePolynomialUniverse(q, maxDegree) {
  console.error(`[qsign] building F_${q}[t] universe to degree ${maxDegree}`);
  const universe = buildPolynomialUniverse(q, maxDegree);
  const vertices = polynomialVertices(q);
  const complex = buildPolynomialShapeComplex(vertices, q);
  const singulars = complex.shapes.map((shape) => polynomialTupleSingular(universe, shape.a, shape.b, maxDegree));
  const startDegree = Math.max(5, maxDegree - 4);
  const rows = [];
  for (let degree = startDegree; degree <= maxDegree; degree++) {
    console.error(`[qsign] F_${q}[t] degree ${degree}`);
    rows.push(summarizePolynomialDegree(universe, degree, complex, singulars, universe.irreducibleFlagsByDegree[degree], `F_${q}-real`));
  }
  const finalDegree = maxDegree;
  const randomMonic = seeds.map((seed) => summarizePolynomialDegree(
    universe,
    finalDegree,
    complex,
    singulars,
    randomPolynomialFlags(universe, finalDegree, seed, false),
    `F_${q}-random-monic-${seed}`,
  ));
  const randomReducible = seeds.map((seed) => summarizePolynomialDegree(
    universe,
    finalDegree,
    complex,
    singulars,
    randomPolynomialFlags(universe, finalDegree, seed ^ 0x9e3779b9, true),
    `F_${q}-random-reducible-${seed}`,
  ));
  return {
    q,
    maxDegree,
    shapeCount: complex.shapes.length,
    vertices: vertices.map((v) => polyToString(v, q)),
    rows,
    exponent: {
      persistenceTau1: exponent(rows, "persistenceTau1", "degree"),
      shapeEnergy: exponent(rows, "shapeEnergy", "degree"),
    },
    controls: {
      randomMonicSummary: rowGroupSummary(randomMonic),
      randomReducibleSummary: rowGroupSummary(randomReducible),
    },
  };
}

function mdRows(series) {
  return series.rows.map((row) => `| ${row.N} | ${row.labels} | ${row.shapeEnergy.toFixed(6)} | ${row.persistenceTau1.toFixed(6)} | ${row.activeTau1} | ${row.largestTau1.size} | ${row.strongestShapes[0].shape} ${row.strongestShapes[0].value.toFixed(3)} |`).join("\n");
}

function mdFieldRows(field) {
  return field.rows.map((row) => `| ${row.degree} | ${row.labels} | ${row.shapeEnergy.toFixed(6)} | ${row.persistenceTau1.toFixed(6)} | ${row.activeTau1} | ${row.largestTau1.size} | ${row.strongestShapes[0].shape} ${row.strongestShapes[0].value.toFixed(3)} |`).join("\n");
}

function mdSummaryLine(name, summary) {
  return `| ${name} | ${summary.persistenceRange[0].toFixed(6)} .. ${summary.persistenceRange[1].toFixed(6)} | ${summary.activeRange[0]} .. ${summary.activeRange[1]} | ${summary.shapeEnergyRange[0].toFixed(6)} .. ${summary.shapeEnergyRange[1].toFixed(6)} | ${summary.thetaRange[0].toFixed(6)} .. ${summary.thetaRange[1].toFixed(6)} |`;
}

function svg(output) {
  const width = 1120, height = 640, pad = 66;
  const points = [
    ...output.integer.real.rows.map((row) => ({ group: "Z", x: Math.log(row.N), y: row.persistenceTau1 })),
    ...output.integer.wheelMean.rows.map((row) => ({ group: "wheel", x: Math.log(row.N), y: row.persistenceTau1 })),
    ...output.integer.compositeMean.rows.map((row) => ({ group: "composite", x: Math.log(row.N), y: row.persistenceTau1 })),
    ...output.functionFields.flatMap((field) => field.rows.map((row) => ({ group: `F_${field.q}`, x: Math.log(row.labels || 1), y: row.persistenceTau1 }))),
  ];
  const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x));
  const minY = 0, maxY = Math.max(0.1, ...points.map((p) => p.y)) * 1.15;
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
  const legend = groups.map((group, i) => `<text x="${pad}" y="${49 + i * 19}" fill="${colors[group]}" font-size="13">${group} P(tau=1)</text>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<g stroke="#1f2937" stroke-width="1">
${[0.25, 0.5, 0.75, 1].map((t) => `<line x1="${pad}" x2="${width - pad}" y1="${sy(maxY * t).toFixed(2)}" y2="${sy(maxY * t).toFixed(2)}"/>`).join("\n")}
</g>
${groups.map(lineFor).join("\n")}
<g font-family="Menlo, Consolas, monospace">
<text x="${pad}" y="24" fill="#f8fafc" font-size="18">quotient residual sign-domain persistence</text>
${legend}
<text x="${pad}" y="${height - 26}" fill="#94a3b8" font-size="12">x = log(range/labels), y = largest same-sign component / quotient shape count at |R| &gt; 1</text>
</g>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

console.error(`[qsign] integer side to ${N}`);
const isp = sieve(N);
const integerComplex = buildIntegerShapeComplex(integerVertices);
const integralPrefix = buildIntegralPrefix(N);
const singularPrimes = primesUpTo(singularCutoff);
const integerSingulars = integerComplex.shapes.map((shape) => integerSingularSeries(shape.a, shape.b, singularPrimes));
const realLabels = labelsFromFlags(isp);
const real = summarizeIntegerLabels("real-primes", realLabels, isp, integerComplex, integerSingulars, integralPrefix);
const cramer = seeds.map((seed) => {
  const labels = cramerPrimes(N, seed);
  return summarizeIntegerLabels(`cramer-${seed}`, labels, flagsFromLabels(labels, N), integerComplex, integerSingulars, integralPrefix);
});
const wheel = seeds.map((seed) => {
  const labels = wheelRandomLabels(N, seed, isp, false);
  return summarizeIntegerLabels(`wheel-${seed}`, labels, flagsFromLabels(labels, N), integerComplex, integerSingulars, integralPrefix);
});
const composite = seeds.map((seed) => {
  const labels = wheelRandomLabels(N, seed ^ 0x9e3779b9, isp, true);
  return summarizeIntegerLabels(`composite-${seed}`, labels, flagsFromLabels(labels, N), integerComplex, integerSingulars, integralPrefix);
});

function meanSeries(name, group) {
  return {
    name,
    rows: endpoints.map((x, i) => ({
      N: x,
      persistenceTau1: mean(group.map((series) => series.rows[i].persistenceTau1)),
      activeTau1: mean(group.map((series) => series.rows[i].activeTau1)),
      shapeEnergy: mean(group.map((series) => series.rows[i].shapeEnergy)),
    })),
  };
}

const functionFields = [
  summarizePolynomialUniverse(2, q2MaxDegree),
  summarizePolynomialUniverse(3, q3MaxDegree),
];

const output = {
  candidate: "quotient residual sign-domain persistence",
  N,
  W,
  singularCutoff,
  seeds,
  taus,
  integer: {
    vertices: integerVertices,
    shapeCount: integerComplex.shapes.length,
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

const jsonPath = path.join(outDir, `quotient-sign-domain-audit-${N}.json`);
const mdPath = path.join(outDir, `quotient-sign-domain-audit-${N}.md`);
const svgPath = path.join(outDir, `quotient-sign-domain-audit-${N}.svg`);
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(svgPath, svg(output));

const md = `# Quotient residual sign-domain persistence audit

Candidate:
collapse translated triple faces to relative shapes, subtract the local tuple
main for each shape, and score the largest same-sign connected component in the
quotient shape graph at \`|R|>1\`.

Integer quotient shape count: \`${integerComplex.shapes.length}\`.

## Integer side

| N | labels | shape energy | P(tau=1) | active shapes | largest component | strongest shape |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
${mdRows(real)}

Integer exponent fits:
\`P theta=${real.exponent.persistenceTau1.toFixed(6)}\`,
\`shape-energy theta=${real.exponent.shapeEnergy.toFixed(6)}\`.

Endpoint controls at N=${N}:

| group | P range | active range | shape energy range | P theta range |
| --- | ---: | ---: | ---: | ---: |
${mdSummaryLine("Cramer labels", output.integer.summaries.cramer)}
${mdSummaryLine("W=30030 fake labels", output.integer.summaries.wheel)}
${mdSummaryLine("W=30030 composite-only", output.integer.summaries.composite)}

Strongest real endpoint shapes:

${real.rows.at(-1).strongestShapes.map((cell) => `- ${cell.shape}: ${cell.value.toFixed(6)}`).join("\n")}

Largest real endpoint component:
\`${JSON.stringify(real.rows.at(-1).largestTau1)}\`

## Function-field side

${functionFields.map((field) => `### F_${field.q}[t]

Quotient shape count: \`${field.shapeCount}\`.

| degree | labels | shape energy | P(tau=1) | active shapes | largest component | strongest shape |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
${mdFieldRows(field)}

Endpoint random monic controls:
${mdSummaryLine("random monic", field.controls.randomMonicSummary)}

Endpoint random reducible controls:
${mdSummaryLine("random reducible", field.controls.randomReducibleSummary)}

Strongest endpoint shapes:

${field.rows.at(-1).strongestShapes.map((cell) => `- ${cell.shape}: ${cell.value.toFixed(6)}`).join("\n")}
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
    shapeEnergy: real.rows.at(-1).shapeEnergy,
    persistenceTau1: real.rows.at(-1).persistenceTau1,
    activeTau1: real.rows.at(-1).activeTau1,
    largestTau1: real.rows.at(-1).largestTau1,
    strongestShapes: real.rows.at(-1).strongestShapes.slice(0, 5),
    exponent: real.exponent,
  },
  integerControls: Object.fromEntries(Object.entries(output.integer.summaries).map(([key, summary]) => [key, {
    persistenceRange: summary.persistenceRange,
    activeRange: summary.activeRange,
    shapeEnergyRange: summary.shapeEnergyRange,
    thetaRange: summary.thetaRange,
    largestSizes: summary.largest.map((component) => component.size),
    largestSigns: summary.largest.map((component) => component.sign),
  }])),
  fieldLast: functionFields.map((field) => ({
    q: field.q,
    last: {
      degree: field.rows.at(-1).degree,
      labels: field.rows.at(-1).labels,
      shapeEnergy: field.rows.at(-1).shapeEnergy,
      persistenceTau1: field.rows.at(-1).persistenceTau1,
      activeTau1: field.rows.at(-1).activeTau1,
      largestTau1: field.rows.at(-1).largestTau1,
      strongestShapes: field.rows.at(-1).strongestShapes.slice(0, 5),
      exponent: field.exponent,
    },
    controls: {
      randomMonicSummary: {
        persistenceRange: field.controls.randomMonicSummary.persistenceRange,
        activeRange: field.controls.randomMonicSummary.activeRange,
        shapeEnergyRange: field.controls.randomMonicSummary.shapeEnergyRange,
        largestSizes: field.controls.randomMonicSummary.largest.map((component) => component.size),
      },
      randomReducibleSummary: {
        persistenceRange: field.controls.randomReducibleSummary.persistenceRange,
        activeRange: field.controls.randomReducibleSummary.activeRange,
        shapeEnergyRange: field.controls.randomReducibleSummary.shapeEnergyRange,
        largestSizes: field.controls.randomReducibleSummary.largest.map((component) => component.size),
      },
    },
  })),
}, null, 2));
