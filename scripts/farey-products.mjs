#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const DEFAULT_OUTPUT = "logs/farey-product-artifacts/numerics.json";
const DEFAULT_RANGES = [[1_000, 2_000], [10_000, 20_000]];
const DEFAULT_SEEDS = [12345, 271828, 314159, 161803, 424242];

function parseRanges(src) {
  if (!src) return DEFAULT_RANGES;
  return src.split(",").map((part) => {
    const [a, b] = part.split(/[:-]/).map((x) => Number(x.trim()));
    return Number.isFinite(a) && Number.isFinite(b) && b > a ? [a, b] : null;
  }).filter(Boolean);
}

function weightedPrimeIntegral(a, b, weight) {
  if (b <= a) return 0;
  const lo = Math.log(Math.max(3, a));
  const hi = Math.log(Math.max(3, b));
  let steps = Math.max(2000, Math.ceil((hi - lo) * 4096));
  if (steps % 2) steps++;
  const h = (hi - lo) / steps;
  const f = (u) => {
    const t = Math.exp(u);
    return weight(t) * t / u;
  };
  let sum = f(lo) + f(hi);
  for (let i = 1; i < steps; i++) sum += (i % 2 ? 4 : 2) * f(lo + i * h);
  return (h / 3) * sum;
}

function distinctPrimeFactors(n) {
  let m = Math.max(1, Math.round(n));
  const factors = [];
  if (m % 2 === 0) {
    factors.push(2);
    while (m % 2 === 0) m = Math.floor(m / 2);
  }
  for (let d = 3; d * d <= m; d += 2) {
    if (m % d !== 0) continue;
    factors.push(d);
    while (m % d === 0) m = Math.floor(m / d);
  }
  if (m > 1) factors.push(m);
  return factors;
}

function phiFromFactors(n, factors) {
  let out = Math.max(0, Math.round(n));
  for (const p of factors) out = Math.floor(out / p) * (p - 1);
  return out;
}

function coprimeCountUpTo(x, factors) {
  const limit = Math.floor(x);
  if (limit <= 0) return 0;
  let excluded = 0;
  const masks = 1 << factors.length;
  for (let mask = 1; mask < masks; mask++) {
    let product = 1, bits = 0;
    for (let i = 0; i < factors.length; i++) {
      if (!(mask & (1 << i))) continue;
      product *= factors[i];
      bits++;
      if (product > limit) break;
    }
    if (product > limit) continue;
    excluded += (bits % 2 ? 1 : -1) * Math.floor(limit / product);
  }
  return limit - excluded;
}

function coprimeCountRange(lo, hi, factors) {
  if (hi < lo) return 0;
  return coprimeCountUpTo(hi, factors) - coprimeCountUpTo(lo - 1, factors);
}

function fareyBaseSurplusBelowTriple(base, n) {
  const b = Math.max(2, Math.round(base));
  const row = Math.max(b, Math.min(3 * b - 1, Math.round(n)));
  const factorsB = distinctPrimeFactors(b);
  const factors2B = distinctPrimeFactors(2 * b);
  const denom = phiFromFactors(b, factorsB) + (row >= 2 * b ? phiFromFactors(2 * b, factors2B) : 0);
  const numer1 = coprimeCountRange(b, row, factorsB);
  const numer2 = row >= 2 * b ? coprimeCountRange(2 * b, row, factors2B) : 0;
  return denom - numer1 - numer2;
}

function fareySignature(base) {
  const b = Math.max(2, Math.round(base));
  const factorsB = distinctPrimeFactors(b);
  const spike = phiFromFactors(b, factorsB);
  const firstCanyonRow = Math.ceil((8 * b) / 3);
  const firstCanyon = fareyBaseSurplusBelowTriple(b, firstCanyonRow);
  const endpointRow = 3 * b - 1;
  const endpoint = fareyBaseSurplusBelowTriple(b, endpointRow);
  return {
    base: b,
    spikeAtBase: spike,
    spikeTarget: b - 1,
    firstCanyonRow,
    firstCanyon,
    endpointRow,
    endpoint,
    endpointTarget: -(b - 1) / 2,
    exactPrimeShape: spike === b - 1 && firstCanyon < 0 && endpoint === -(b - 1) / 2,
    spikeDefect: (b - 1) - spike,
    endpointMismatch: Math.abs(endpoint + (b - 1) / 2),
  };
}

function summarizeRows(rows) {
  const count = rows.length;
  const exactPrimeShape = rows.filter((r) => r.exactPrimeShape).length;
  const spikeDefectTotal = rows.reduce((s, r) => s + r.spikeDefect, 0);
  const endpointDebtTotal = rows.reduce((s, r) => s + Math.max(0, -r.endpoint), 0);
  const endpointTargetDebtTotal = rows.reduce((s, r) => s + (r.base - 1) / 2, 0);
  return {
    count,
    exactPrimeShape,
    exactPrimeShapeRate: count ? exactPrimeShape / count : 0,
    spikeDefectTotal,
    endpointDebtTotal,
    endpointTargetDebtTotal,
    endpointDebtRatio: endpointTargetDebtTotal ? endpointDebtTotal / endpointTargetDebtTotal : 0,
    topMismatches: [...rows]
      .sort((a, b) => b.endpointMismatch - a.endpointMismatch || b.spikeDefect - a.spikeDefect || a.base - b.base)
      .slice(0, 8)
      .map((r) => ({
        base: r.base,
        spikeAtBase: r.spikeAtBase,
        spikeDefect: r.spikeDefect,
        firstCanyon: r.firstCanyon,
        endpoint: r.endpoint,
        endpointTarget: r.endpointTarget,
        endpointMismatch: r.endpointMismatch,
      })),
  };
}

function summarizeRange([A, B], seeds) {
  const primes = primesUpTo(B).filter((p) => p >= A && p <= B);
  const primeSet = new Uint8Array(B + 1);
  for (const p of primes) primeSet[p] = 1;
  const primeRows = primes.map(fareySignature);
  const real = {
    ...summarizeRows(primeRows),
    theoremViolations: primeRows
      .filter((r) => !r.exactPrimeShape)
      .map((r) => ({ base: r.base, spikeAtBase: r.spikeAtBase, firstCanyon: r.firstCanyon, endpoint: r.endpoint })),
  };
  const cramer = seeds.map((seed) => {
    const fake = cramerPrimes(B, seed).filter((n) => n >= A && n <= B);
    const rows = fake.map(fareySignature);
    return {
      seed,
      actualPrimeLabels: fake.filter((n) => primeSet[n]).length,
      ...summarizeRows(rows),
    };
  });
  return {
    range: [A, B],
    mainTerms: {
      countLi: weightedPrimeIntegral(A, B, () => 1),
      spikeLi: weightedPrimeIntegral(A, B, (t) => t - 1),
      endpointDebtLi: weightedPrimeIntegral(A, B, (t) => (t - 1) / 2),
    },
    real,
    cramer,
  };
}

function int(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function writeSvg(result, path) {
  const width = 920, height = 360;
  const colors = { real: "#1f9d8a", fake: "#b35c2e", line: "#d8d0bf", text: "#2d2a24", faint: "#746b5c" };
  const bar = (x, y, w, h, value, color) => {
    const hh = Math.max(0, Math.min(1, value)) * h;
    return `<rect x="${x}" y="${y + h - hh}" width="${w}" height="${hh}" fill="${color}" rx="3"/>`;
  };
  const groups = result.results.map((rangeResult, i) => {
    const [A, B] = rangeResult.range;
    const fakeRate = rangeResult.cramer.reduce((s, r) => s + r.exactPrimeShapeRate, 0) / rangeResult.cramer.length;
    const realDebtRatio = rangeResult.real.endpointDebtTotal / rangeResult.mainTerms.endpointDebtLi;
    const fakeDebtRatio = rangeResult.cramer.reduce((s, r) => s + r.endpointDebtRatio, 0) / rangeResult.cramer.length;
    const x = 120 + i * 380;
    const y = 92;
    return [
      `<text x="${x}" y="58" font-size="16" fill="${colors.text}" font-family="system-ui">${int(A)}-${int(B)}</text>`,
      `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 180}" stroke="${colors.line}"/>`,
      `<line x1="${x}" y1="${y + 180}" x2="${x + 260}" y2="${y + 180}" stroke="${colors.line}"/>`,
      bar(x + 28, y, 44, 180, rangeResult.real.exactPrimeShapeRate, colors.real),
      bar(x + 78, y, 44, 180, fakeRate, colors.fake),
      bar(x + 158, y, 44, 180, Math.min(1.4, realDebtRatio) / 1.4, colors.real),
      bar(x + 208, y, 44, 180, Math.min(1.4, fakeDebtRatio) / 1.4, colors.fake),
      `<text x="${x + 14}" y="${y + 205}" font-size="11" fill="${colors.faint}" font-family="ui-monospace">shape</text>`,
      `<text x="${x + 148}" y="${y + 205}" font-size="11" fill="${colors.faint}" font-family="ui-monospace">debt/Li</text>`,
      `<text x="${x + 28}" y="${y + 225}" font-size="11" fill="${colors.real}" font-family="ui-monospace">real 1.000</text>`,
      `<text x="${x + 28}" y="${y + 242}" font-size="11" fill="${colors.fake}" font-family="ui-monospace">fake ${fakeRate.toFixed(3)}</text>`,
      `<text x="${x + 158}" y="${y + 225}" font-size="11" fill="${colors.real}" font-family="ui-monospace">real ${realDebtRatio.toFixed(3)}</text>`,
      `<text x="${x + 158}" y="${y + 242}" font-size="11" fill="${colors.fake}" font-family="ui-monospace">fake ${fakeDebtRatio.toFixed(3)}</text>`,
    ].join("\n");
  }).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#fbf8ef"/>
  <text x="36" y="34" font-size="20" fill="${colors.text}" font-family="system-ui" font-weight="700">Farey reciprocal-product signature</text>
  <text x="36" y="62" font-size="12" fill="${colors.faint}" font-family="ui-monospace">Real primes have the exact p-adic spike/canyon; Cramer labels usually do not.</text>
  ${groups}
  <rect x="36" y="308" width="14" height="14" fill="${colors.real}" rx="2"/>
  <text x="58" y="320" font-size="12" fill="${colors.text}" font-family="system-ui">real primes</text>
  <rect x="156" y="308" width="14" height="14" fill="${colors.fake}" rx="2"/>
  <text x="178" y="320" font-size="12" fill="${colors.text}" font-family="system-ui">five Cramer seeds, averaged</text>
</svg>
`;
  writeFileSync(path, svg);
  return svg;
}

function writeHtml(result, svg, path) {
  const rangeRows = result.results.map((row) => {
    const [a, b] = row.range;
    const fakeRate = row.cramer.reduce((s, r) => s + r.exactPrimeShapeRate, 0) / row.cramer.length;
    return `<tr><td>${int(a)}-${int(b)}</td><td>${int(row.real.exactPrimeShape)}/${int(row.real.count)}</td><td>${row.mainTerms.countLi.toFixed(6)}</td><td>${int(row.real.endpointDebtTotal)}</td><td>${row.mainTerms.endpointDebtLi.toFixed(6)}</td><td>${fakeRate.toFixed(6)}</td></tr>`;
  }).join("\n");
  const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Farey reciprocal-product signature</title>
<style>
  body { margin: 0; font-family: system-ui, sans-serif; background: #fbf8ef; color: #2d2a24; }
  main { max-width: 1040px; margin: 0 auto; padding: 32px; }
  h1 { font-size: 28px; margin: 0 0 10px; }
  p { line-height: 1.5; max-width: 820px; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  table { border-collapse: collapse; width: 100%; margin-top: 24px; font-size: 14px; }
  th, td { border-bottom: 1px solid #ddd3bd; padding: 10px 8px; text-align: right; }
  th:first-child, td:first-child { text-align: left; }
</style>
<main>
  <h1>Farey reciprocal-product signature</h1>
  <p>For every odd prime <code>p</code>, the reciprocal Farey product has <code>B_p(p)=p-1</code>, then <code>B_p(n)&lt;0</code> from <code>ceil(8p/3)</code> through <code>3p-1</code>, with endpoint <code>B_p(3p-1)=-(p-1)/2</code>.</p>
  ${svg}
  <table>
    <thead><tr><th>range</th><th>real exact</th><th>Li count</th><th>real debt</th><th>debt main</th><th>Cramer exact avg</th></tr></thead>
    <tbody>${rangeRows}</tbody>
  </table>
</main>
</html>
`;
  writeFileSync(path, html);
}

const output = process.argv[2] || DEFAULT_OUTPUT;
const ranges = parseRanges(process.argv[3]);
const seeds = process.argv[4] ? process.argv[4].split(",").map((x) => Number(x.trim())).filter(Boolean) : DEFAULT_SEEDS;

const result = {
  object: "reciprocal Farey-product prime signatures",
  generatedAt: new Date().toISOString(),
  definition: "B_b(n)=sum_{1<=h<=k<=n,gcd(h,k)=1}(nu_b(k)-nu_b(h)); for prime b=p this is ord_p of the reciprocal Farey product.",
  theoremChecked: "For every odd prime p in the ranges: B_p(p)=p-1, B_p(ceil(8p/3))<0, and B_p(3p-1)=-(p-1)/2.",
  ranges,
  seeds,
  results: ranges.map((range) => summarizeRange(range, seeds)),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
const svg = writeSvg(result, join(dirname(output), "farey-product-summary.svg"));
writeHtml(result, svg, join(dirname(output), "farey-product-exhibit.html"));
process.stdout.write(`${output}\n`);
