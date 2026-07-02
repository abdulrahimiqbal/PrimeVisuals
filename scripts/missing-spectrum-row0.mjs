#!/usr/bin/env node
// P1-CL ROW 0 — validation gate on the theorem side (prompts/parity-battery.md).
// Exact S_n(g) = sum over monic f of degree n of mu(f)mu(f+g) in F_q[t],
// where the +1-shift sum equals |Y_n(F_q)| - q^n (Keating-Rudnick, edge.md).
// Gate checks: (1) square-root scale |S_n|/q^(n/2) bounded, (2) linear-recurrence
// probe (Prony orders 1..5) with on-circle test for fitted |alpha|/sqrt(q).
//
// Usage: node scripts/missing-spectrum-row0.mjs [outDir]

import fs from "node:fs";
import path from "node:path";
import {
  buildPolynomialUniverse,
  polyAdd,
  polyDegree,
  polynomialMobius,
} from "../src/core/ffield.js";

const outDir = process.argv[2] || "logs/missing-spectrum-artifacts";
fs.mkdirSync(outDir, { recursive: true });

const CONFIGS = [
  { q: 2, maxDegree: 24, shifts: [1, 2, 3] }, // 1, t, t+1
  { q: 3, maxDegree: 15, shifts: [1, 3, 4] },
];

function rawShiftSums(universe, shift) {
  const { q, maxDegree, pow, muByDegree } = universe;
  const sums = [];
  for (let degree = 1; degree <= maxDegree; degree++) {
    let sum = 0;
    const lead = pow[degree];
    const mu = muByDegree[degree];
    for (let lower = 0; lower < pow[degree]; lower++) {
      const muA = mu[lower];
      if (muA === 0) continue;
      const mate = polyAdd(lead + lower, shift, q);
      if (polyDegree(mate, q) !== degree) continue;
      sum += muA * polynomialMobius(mate, universe);
    }
    sums.push({ degree, sum });
  }
  return sums;
}

function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) return null;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / M[i][i]);
}

function polyRoots(coeffs) {
  // roots of x^m - c_{m-1} x^{m-1} - ... - c_0 via Durand-Kerner
  const m = coeffs.length;
  const re = new Float64Array(m);
  const im = new Float64Array(m);
  for (let i = 0; i < m; i++) {
    re[i] = Math.cos((2 * Math.PI * i) / m) * 1.5;
    im[i] = Math.sin((2 * Math.PI * i) / m) * 1.5;
  }
  const evalP = (x, y) => {
    // p(z) = z^m - sum c_j z^j
    let pr = 1, pi = 0;
    for (let k = 0; k < m; k++) {
      const nr = pr * x - pi * y;
      pi = pr * y + pi * x;
      pr = nr;
    }
    let zr = 1, zi = 0;
    for (let j = 0; j < m; j++) {
      pr -= coeffs[j] * zr;
      pi -= coeffs[j] * zi;
      const nr = zr * x - zi * y;
      zi = zr * y + zi * x;
      zr = nr;
    }
    return [pr, pi];
  };
  for (let iter = 0; iter < 300; iter++) {
    let moved = 0;
    for (let i = 0; i < m; i++) {
      const [pr, pi] = evalP(re[i], im[i]);
      let dr = 1, di = 0;
      for (let j = 0; j < m; j++) {
        if (j === i) continue;
        const ar = re[i] - re[j];
        const ai = im[i] - im[j];
        const nr = dr * ar - di * ai;
        di = dr * ai + di * ar;
        dr = nr;
      }
      const denom = dr * dr + di * di || 1e-18;
      const sr = (pr * dr + pi * di) / denom;
      const si = (pi * dr - pr * di) / denom;
      re[i] -= sr;
      im[i] -= si;
      moved += Math.abs(sr) + Math.abs(si);
    }
    if (moved < 1e-12) break;
  }
  return Array.from({ length: m }, (_, i) => ({
    re: re[i],
    im: im[i],
    abs: Math.hypot(re[i], im[i]),
  }));
}

function pronyProbe(series, q) {
  // Try recurrence a_{n+m} = sum_j c_j a_{n+j} for m = 1..5 on the tail
  // (skip the first 2 degrees; boundary effects). Report residual + roots.
  const a = series.map((r) => r.sum);
  const start = 2;
  const tail = a.slice(start);
  const probes = [];
  for (let m = 1; m <= 5; m++) {
    const rows = tail.length - m;
    if (rows < m + 2) break;
    // least squares: normal equations for c (m unknowns)
    const AtA = Array.from({ length: m }, () => new Float64Array(m));
    const Atb = new Float64Array(m);
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < m; i++) {
        Atb[i] += tail[r + i] * tail[r + m];
        for (let j = 0; j < m; j++) AtA[i][j] += tail[r + i] * tail[r + j];
      }
    }
    const c = solveLinear(
      AtA.map((row) => Array.from(row)),
      Array.from(Atb),
    );
    if (!c) continue;
    let ss = 0;
    let st = 0;
    for (let r = 0; r < rows; r++) {
      let pred = 0;
      for (let j = 0; j < m; j++) pred += c[j] * tail[r + j];
      ss += (tail[r + m] - pred) ** 2;
      st += tail[r + m] ** 2;
    }
    const relResidual = Math.sqrt(ss / (st || 1));
    const roots = polyRoots(c).map((root) => ({
      ...root,
      absOverSqrtQ: root.abs / Math.sqrt(q),
    }));
    probes.push({ order: m, coeffs: c, relResidual, roots });
  }
  return probes;
}

const report = { generatedAt: new Date().toISOString(), configs: [] };

for (const { q, maxDegree, shifts } of CONFIGS) {
  const t0 = performance.now();
  const universe = buildPolynomialUniverse(q, maxDegree);
  const buildSeconds = (performance.now() - t0) / 1000;
  console.log(`built F_${q}[t] universe to degree ${maxDegree} in ${buildSeconds.toFixed(1)}s`);
  const shiftsOut = [];
  for (const shift of shifts) {
    const series = rawShiftSums(universe, shift);
    const scaled = series.map(({ degree, sum }) => ({
      degree,
      sum,
      overQhalf: sum / Math.pow(q, degree / 2),
    }));
    // exponent fit on log_q |S_n| vs n over nonzero tail
    const pts = scaled.filter((r) => r.sum !== 0 && r.degree >= 3);
    let slope = null;
    if (pts.length >= 4) {
      const xs = pts.map((r) => r.degree);
      const ys = pts.map((r) => Math.log(Math.abs(r.sum)) / Math.log(q));
      const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
      const my = ys.reduce((a, b) => a + b, 0) / ys.length;
      let sxx = 0, sxy = 0;
      for (let i = 0; i < xs.length; i++) {
        sxx += (xs[i] - mx) ** 2;
        sxy += (xs[i] - mx) * (ys[i] - my);
      }
      slope = sxy / sxx;
    }
    const prony = pronyProbe(series, q);
    shiftsOut.push({ shift, series: scaled, exponentSlope: slope, prony });
    console.log(
      `q=${q} shift=${shift}: slope(log_q|S_n|/n)=${slope?.toFixed(4)}; ` +
        `|S_n|/q^(n/2) tail: ${scaled.slice(-4).map((r) => r.overQhalf.toFixed(3)).join(", ")}`,
    );
  }
  report.configs.push({ q, maxDegree, buildSeconds, shifts: shiftsOut });
}

fs.writeFileSync(path.join(outDir, "row0-ynseries.json"), JSON.stringify(report, null, 2));
console.log(`wrote ${path.join(outDir, "row0-ynseries.json")}`);
