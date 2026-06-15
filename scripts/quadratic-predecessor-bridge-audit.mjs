#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cramerPrimes, primesUpTo, sieve } from "../src/core/math.js";

const maxN = Number(process.argv[2] || 4_000_000);
const outDir = process.argv[3] || "logs/playground-artifacts";
const seeds = [12345, 271828, 314159, 161803, 424242];
const endpoints = [maxN / 16, maxN / 8, maxN / 4, maxN / 2, maxN]
  .map((value) => Math.max(1000, Math.round(value)));

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  if (!values.length) return [0, 0];
  return [Math.min(...values), Math.max(...values)];
}

function linearFit(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += dx * (ys[i] - my);
  }
  const slope = sxy / (sxx || 1);
  return { slope, intercept: my - slope * mx };
}

function exponent(rows, key, scaleKey = "pairs") {
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
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
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function modPow(base, exp, mod) {
  let result = 1;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % mod;
    b = (b * b) % mod;
    e = Math.floor(e / 2);
  }
  return result;
}

function legendreSymbol(a, p) {
  const r = ((a % p) + p) % p;
  if (r === 0) return 0;
  const value = modPow(r, (p - 1) >> 1, p);
  return value === 1 ? 1 : (value === p - 1 ? -1 : 0);
}

function jacobiSymbol(a, n) {
  if (n <= 0 || n % 2 === 0) return 0;
  let x = ((a % n) + n) % n;
  let m = n;
  let t = 1;
  while (x !== 0) {
    while (x % 2 === 0) {
      x /= 2;
      const r = m % 8;
      if (r === 3 || r === 5) t = -t;
    }
    const tmp = x;
    x = m;
    m = tmp;
    if (x % 4 === 3 && m % 4 === 3) t = -t;
    x %= m;
  }
  return m === 1 ? t : 0;
}

function upperBound(sorted, x) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function randomItemBelow(sorted, hiExclusive, random) {
  const count = upperBound(sorted, hiExclusive - 1);
  if (count <= 0) return null;
  return sorted[Math.floor(random() * count)];
}

function summarizeSigns(name, signsByCurrent) {
  const rows = [];
  let i = 0;
  let acc = 0;
  let maxAbs = 0;
  let zeros = 0;
  for (const N of endpoints) {
    while (i < signsByCurrent.length && signsByCurrent[i].current <= N) {
      const sign = signsByCurrent[i].sign;
      if (sign === 0) zeros++;
      else {
        acc += sign;
        maxAbs = Math.max(maxAbs, Math.abs(acc));
      }
      i++;
    }
    const pairs = i - zeros;
    const scale = Math.sqrt(Math.max(1, pairs));
    rows.push({
      N,
      transitions: i,
      pairs,
      zeros,
      value: acc,
      normalized: acc / scale,
      maxAbs,
      maxAbsOverSqrtPairs: maxAbs / scale,
    });
  }
  const blocks = rows.map((row, index) => {
    const prev = index ? rows[index - 1] : null;
    const value = row.value - (prev ? prev.value : 0);
    const pairs = row.pairs - (prev ? prev.pairs : 0);
    return {
      lo: index ? rows[index - 1].N : 1,
      hi: row.N,
      pairs,
      value,
      normalized: value / Math.sqrt(Math.max(1, pairs)),
    };
  });
  return {
    name,
    rows,
    blocks,
    theta: {
      maxAbs: exponent(rows, "maxAbs"),
      absValue: exponent(rows.map((row) => ({ ...row, absValue: Math.abs(row.value) })), "absValue"),
    },
  };
}

function realPrimeSigns(primes) {
  const signs = [];
  for (let i = 1; i < primes.length; i++) {
    const previous = primes[i - 1];
    const current = primes[i];
    if (current <= 2) continue;
    signs.push({
      previous,
      current,
      sign: legendreSymbol(previous, current),
      gap: current - previous,
    });
  }
  return signs;
}

function cramerJacobiSigns(labels) {
  const signs = [];
  for (let i = 1; i < labels.length; i++) {
    const previous = labels[i - 1];
    const current = labels[i];
    if (current <= 2 || current % 2 === 0) continue;
    signs.push({
      previous,
      current,
      sign: jacobiSymbol(previous, current),
      gap: current - previous,
    });
  }
  return signs;
}

function randomPredecessorSigns(currentPrimes, pool, seed, name) {
  const random = rng(seed);
  const signs = [];
  for (const current of currentPrimes) {
    if (current <= 3) continue;
    const previous = randomItemBelow(pool, current, random);
    if (!previous) continue;
    signs.push({
      previous,
      current,
      sign: legendreSymbol(previous, current),
      gap: current - previous,
      name,
    });
  }
  return signs;
}

function compositePool(limit, primeFlags) {
  const out = [];
  for (let n = 3; n <= limit; n += 2) {
    if (primeFlags[n]) continue;
    if (gcd(n, 210) !== 1) continue;
    out.push(n);
  }
  return out;
}

function summarizeControls(series) {
  const endpointRows = series.map((control) => control.rows.at(-1));
  return {
    normalized: range(endpointRows.map((row) => row.normalized)),
    maxAbsOverSqrtPairs: range(endpointRows.map((row) => row.maxAbsOverSqrtPairs)),
    maxAbsTheta: range(series.map((control) => control.theta.maxAbs)),
  };
}

function makeSvg(report) {
  const width = 1240;
  const height = 760;
  const margin = { left: 76, right: 350, top: 88, bottom: 76 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const xMin = Math.log(report.endpoints[0]);
  const xMax = Math.log(report.endpoints.at(-1));
  const xOf = (row) => margin.left + ((Math.log(row.N) - xMin) / (xMax - xMin)) * plotW;
  const controls = [
    { id: "Cramer/Jacobi", rows: report.controls.cramer, color: "#a78bfa" },
    { id: "random prime predecessor", rows: report.controls.randomPrime, color: "#f59e0b" },
    { id: "composite predecessor", rows: report.controls.composite, color: "#fb7185" },
  ];
  const allRows = [report.real.rows, ...controls.flatMap((group) => group.rows.map((control) => control.rows))].flat();
  const yMax = Math.max(1, ...allRows.map((row) => row.maxAbsOverSqrtPairs)) * 1.18;
  const yOf = (value) => margin.top + (1 - value / yMax) * plotH;
  const pathFrom = (rows) => rows.map((row, i) => `${i ? "L" : "M"} ${xOf(row).toFixed(2)} ${yOf(row.maxAbsOverSqrtPairs).toFixed(2)}`).join(" ");
  const grid = [];
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + (i / 5) * plotH;
    const value = yMax - (i / 5) * yMax;
    grid.push(`<line x1="${margin.left}" y1="${y.toFixed(2)}" x2="${(margin.left + plotW).toFixed(2)}" y2="${y.toFixed(2)}" stroke="#1f2937"/>`);
    grid.push(`<text x="22" y="${(y + 4).toFixed(2)}" fill="#94a3b8" font-size="12">${fmt(value, 2)}</text>`);
  }
  const controlPaths = controls.map((group) => group.rows.map((control, i) => (
    `<path d="${pathFrom(control.rows)}" fill="none" stroke="${group.color}" stroke-opacity="0.24" stroke-width="1.4"/>`
    + (i === 0 ? `<text x="${margin.left + plotW + 18}" y="${margin.top + 30 + controls.indexOf(group) * 26}" fill="${group.color}" font-size="12">${group.id}</text>` : "")
  )).join("\n")).join("\n");
  const realPath = `<path d="${pathFrom(report.real.rows)}" fill="none" stroke="#67e8f9" stroke-width="3.4"/>`;
  const realDots = report.real.rows.map((row) => `<circle cx="${xOf(row).toFixed(2)}" cy="${yOf(row.maxAbsOverSqrtPairs).toFixed(2)}" r="4" fill="#67e8f9"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>text{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}</style>
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="30" fill="#e5e7eb" font-size="20" font-weight="700">Quadratic predecessor character bridge</text>
<text x="${margin.left}" y="52" fill="#94a3b8" font-size="13">S(Y)=sum Legendre(previous prime / current prime); y=max |S| / sqrt(pair count).</text>
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${controlPaths}
${realPath}
${realDots}
<text x="${margin.left + plotW + 18}" y="${margin.top}" fill="#67e8f9" font-size="12">real primes</text>
<text x="${margin.left}" y="${height - 38}" fill="#cbd5e1" font-size="13">Endpoint real maxAbs/sqrt=${fmt(report.real.rows.at(-1).maxAbsOverSqrtPairs, 3)}, theta=${fmt(report.real.theta.maxAbs, 3)}.</text>
<text x="${margin.left}" y="${height - 18}" fill="#94a3b8" font-size="13">Moving quadratic character gives many events, but controls test whether it is gap-residue character energy.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# Quadratic predecessor character bridge audit", "");
  lines.push("Candidate:");
  lines.push("for consecutive primes `p<q`, score `chi(q)=(p/q)` and track `max |sum chi| / sqrt(pair_count)`.", "");
  lines.push(`Range: ${report.maxN}. Seeds: ${report.seeds.join(", ")}.`, "");
  lines.push("## Endpoint trace", "");
  lines.push("| N | pairs | real value | real normalized | real maxAbs/sqrt | Cramer maxAbs/sqrt range | random-prime predecessor range | composite predecessor range |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < report.real.rows.length; i++) {
    const row = report.real.rows[i];
    const cramer = range(report.controls.cramer.map((control) => control.rows[i].maxAbsOverSqrtPairs));
    const randomPrime = range(report.controls.randomPrime.map((control) => control.rows[i].maxAbsOverSqrtPairs));
    const composite = range(report.controls.composite.map((control) => control.rows[i].maxAbsOverSqrtPairs));
    lines.push(`| ${row.N} | ${row.pairs} | ${row.value} | ${fmt(row.normalized)} | ${fmt(row.maxAbsOverSqrtPairs)} | ${fmt(cramer[0])}..${fmt(cramer[1])} | ${fmt(randomPrime[0])}..${fmt(randomPrime[1])} | ${fmt(composite[0])}..${fmt(composite[1])} |`);
  }
  lines.push("");
  lines.push("## Block normalized values", "");
  lines.push("| block | pairs | real | Cramer range | random-prime predecessor range | composite predecessor range |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < report.real.blocks.length; i++) {
    const block = report.real.blocks[i];
    const cramer = range(report.controls.cramer.map((control) => control.blocks[i].normalized));
    const randomPrime = range(report.controls.randomPrime.map((control) => control.blocks[i].normalized));
    const composite = range(report.controls.composite.map((control) => control.blocks[i].normalized));
    lines.push(`| (${block.lo}, ${block.hi}] | ${block.pairs} | ${fmt(block.normalized)} | ${fmt(cramer[0])}..${fmt(cramer[1])} | ${fmt(randomPrime[0])}..${fmt(randomPrime[1])} | ${fmt(composite[0])}..${fmt(composite[1])} |`);
  }
  lines.push("");
  lines.push("## Summary", "");
  lines.push(`Real maxAbs theta: \`${fmt(report.real.theta.maxAbs)}\`.`);
  lines.push(`Cramer maxAbs/sqrt endpoint range: \`${fmt(report.summary.cramer.maxAbsOverSqrtPairs[0])}..${fmt(report.summary.cramer.maxAbsOverSqrtPairs[1])}\`.`);
  lines.push(`Random-prime predecessor endpoint range: \`${fmt(report.summary.randomPrime.maxAbsOverSqrtPairs[0])}..${fmt(report.summary.randomPrime.maxAbsOverSqrtPairs[1])}\`.`);
  lines.push(`Composite predecessor endpoint range: \`${fmt(report.summary.composite.maxAbsOverSqrtPairs[0])}..${fmt(report.summary.composite.maxAbsOverSqrtPairs[1])}\`.`);
  lines.push("");
  lines.push("## Factor check", "");
  lines.push("By quadratic reciprocity, `(p/q)` can be rewritten using `q mod p` and the sign of `p,q mod 4`; since `q=p+gap`, this is a moving gap-residue character. If the audit separates only against weak Cramer/Jacobi labels but not against prime-modulus random predecessor controls, the construction is gap-residue character energy rather than a critical line.");
  lines.push("");
  lines.push("## Files", "");
  lines.push(`- JSON: \`${report.jsonPath}\``);
  lines.push(`- SVG: \`${report.svgPath}\``);
  return `${lines.join("\n")}\n`;
}

console.error(`[quadratic-predecessor] building primes and flags to ${maxN}`);
const primeFlags = sieve(maxN);
const primes = primesUpTo(maxN);
const currentPrimes = primes.filter((p) => p > 2);
const composites = compositePool(maxN, primeFlags);
const real = summarizeSigns("real-prime-predecessor-legendre", realPrimeSigns(primes));
const cramer = seeds.map((seed) => summarizeSigns(
  `cramer-jacobi-${seed}`,
  cramerJacobiSigns(cramerPrimes(maxN, seed)),
));
const randomPrime = seeds.map((seed) => summarizeSigns(
  `random-prime-predecessor-${seed}`,
  randomPredecessorSigns(currentPrimes, primes, seed, "prime"),
));
const composite = seeds.map((seed) => summarizeSigns(
  `random-composite-predecessor-${seed}`,
  randomPredecessorSigns(currentPrimes, composites, seed ^ 0x9e3779b9, "composite"),
));

const report = {
  generatedAt: new Date().toISOString(),
  object: "quadratic predecessor character bridge",
  maxN,
  endpoints,
  seeds,
  real,
  controls: { cramer, randomPrime, composite },
  summary: {
    cramer: summarizeControls(cramer),
    randomPrime: summarizeControls(randomPrime),
    composite: summarizeControls(composite),
  },
};

fs.mkdirSync(outDir, { recursive: true });
const stem = `quadratic-predecessor-bridge-${maxN}`;
const jsonPath = path.join(outDir, `${stem}.json`);
const mdPath = path.join(outDir, `${stem}.md`);
const svgPath = path.join(outDir, `${stem}.svg`);
report.jsonPath = jsonPath;
report.mdPath = mdPath;
report.svgPath = svgPath;
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(mdPath, makeMarkdown(report));
fs.writeFileSync(svgPath, makeSvg(report));
console.log(JSON.stringify({
  ok: true,
  jsonPath,
  mdPath,
  svgPath,
  endpoint: report.real.rows.at(-1),
  theta: report.real.theta,
  summary: report.summary,
}, null, 2));
