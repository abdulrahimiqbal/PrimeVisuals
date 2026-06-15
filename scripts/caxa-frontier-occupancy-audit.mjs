#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { primesUpTo } from "../src/core/math.js";

const inputPath = process.argv[2] || "logs/divisor-extremes-artifacts/ca-xa-transitions.json";
const outDir = process.argv[3] || "logs/playground-artifacts";

function fmt(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "nan";
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
}

function range(values) {
  return [Math.min(...values), Math.max(...values)];
}

function liRange(a, b, steps = 4096) {
  const lo = Math.max(2, a);
  const hi = Math.max(lo, b);
  if (hi <= lo) return 0;
  let n = Math.max(200, Math.ceil(steps * Math.log(hi / lo)));
  if (n % 2) n++;
  const h = (hi - lo) / n;
  let sum = 1 / Math.log(lo) + 1 / Math.log(hi);
  for (let i = 1; i < n; i++) {
    const x = lo + i * h;
    sum += (i % 2 ? 4 : 2) / Math.log(x);
  }
  return (h / 3) * sum;
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

function exponent(rows, key, scaleKey = "Y") {
  const fitRows = rows.filter((row) => row[key] > 0 && row[scaleKey] > 1);
  if (fitRows.length < 2) return 0;
  return linearFit(
    fitRows.map((row) => Math.log(row[scaleKey])),
    fitRows.map((row) => Math.log(row[key])),
  ).slope;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function countLeq(sorted, x) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function endpointRows(data) {
  const frontiers = uniqueSorted(data.summary.caXa.map((row) => row.frontier));
  const minFrontier = frontiers[0];
  const maxFrontier = frontiers.at(-1);
  const primes = primesUpTo(maxFrontier).filter((p) => p >= minFrontier);
  const endpointSet = new Set([
    200,
    300,
    500,
    800,
    1000,
    1500,
    2000,
    maxFrontier,
  ].filter((x) => x >= minFrontier && x <= maxFrontier));
  for (const row of data.summary.frontierSkipSummary.nonzeroTransitions || []) {
    endpointSet.add(row.toFrontier);
  }
  const endpoints = [...endpointSet].sort((a, b) => a - b);
  const rows = endpoints.map((Y) => {
    const primeCount = countLeq(primes, Y);
    const occupied = countLeq(frontiers, Y);
    const skipped = primeCount - occupied;
    const main = liRange(minFrontier, Y);
    const sqrtMain = Math.sqrt(main || 1);
    const piResidual = (primeCount - main) / sqrtMain;
    const occupancyResidual = (occupied - main) / sqrtMain;
    const skippedCorrection = skipped / sqrtMain;
    return {
      Y,
      primeCount,
      occupied,
      skipped,
      mainLi: main,
      piResidual,
      occupancyResidual,
      skippedCorrection,
      identityError: occupancyResidual - (piResidual - skippedCorrection),
    };
  });
  return { minFrontier, maxFrontier, primes, frontiers, rows };
}

function summarizeFakeControls(data) {
  return data.cramerShapeContrast.map((row) => ({
    seed: row.seed,
    xaCount: row.xaCount,
    caXaCount: row.caXaCount,
    nonCaXaCount: row.nonCaXaCount,
    closureFailures: row.closureFailures,
    skippedOverLiTotal: row.frontierSkipSummary.skippedOverLiTotal,
    skippedPrimeTotal: row.frontierSkipSummary.skippedPrimeTotal,
    maxSkippedPrimeCount: row.frontierSkipSummary.maxSkippedPrimeCount,
    frontierChangingTransitions: row.frontierSkipSummary.frontierChangingTransitions,
    nonzeroSkipTransitions: row.frontierSkipSummary.nonzeroSkipTransitions,
  }));
}

function makeSvg(report) {
  const width = 1180;
  const height = 660;
  const margin = { left: 66, right: 360, top: 70, bottom: 72 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const series = [
    { id: "CA-XA occupancy Q", color: "#67e8f9", key: "occupancyResidual" },
    { id: "prime-count residual", color: "#fbbf24", key: "piResidual" },
    { id: "skip correction", color: "#fb7185", key: "skippedCorrection" },
  ];
  const allY = report.rows.flatMap((row) => series.map((s) => row[s.key]));
  const minY = Math.min(-1, Math.min(...allY) * 1.12);
  const maxY = Math.max(1, Math.max(...allY) * 1.12);
  const xMin = Math.log(report.minFrontier);
  const xMax = Math.log(report.maxFrontier);
  const xOf = (row) => margin.left + ((Math.log(row.Y) - xMin) / (xMax - xMin)) * plotW;
  const yOf = (value) => margin.top + (1 - (value - minY) / (maxY - minY)) * plotH;
  const line = (s) => report.rows.map((row, i) => `${i ? "L" : "M"} ${xOf(row).toFixed(2)} ${yOf(row[s.key]).toFixed(2)}`).join(" ");
  const grid = [];
  for (let i = 0; i <= 6; i++) {
    const y = margin.top + (i / 6) * plotH;
    const val = maxY - (i / 6) * (maxY - minY);
    grid.push(`<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#1f2937"/>`);
    grid.push(`<text x="20" y="${y + 4}" fill="#94a3b8" font-size="12">${fmt(val, 2)}</text>`);
  }
  const paths = series.map((s) => {
    const circles = report.rows.map((row) => `<circle cx="${xOf(row)}" cy="${yOf(row[s.key])}" r="4" fill="${s.color}"/>`).join("");
    return `<path d="${line(s)}" fill="none" stroke="${s.color}" stroke-width="3"/>${circles}`;
  }).join("\n");
  const legend = series.map((s, i) => `<text x="${margin.left + i * 210}" y="42" fill="${s.color}" font-size="13">${s.id}</text>`).join("\n");
  const fakeMax = Math.max(...report.fakeControls.map((row) => row.skippedOverLiTotal), report.realSkipOverLiTotal, 1);
  const barX = 855;
  const barY = 100;
  const bars = [
    { label: "real", value: report.realSkipOverLiTotal, color: "#67e8f9" },
    ...report.fakeControls.map((row) => ({ label: `seed ${row.seed}`, value: row.skippedOverLiTotal, color: "#a78bfa" })),
  ].map((row, i) => {
    const y = barY + i * 38;
    const w = 230 * row.value / fakeMax;
    return `<text x="${barX}" y="${y + 13}" fill="#cbd5e1" font-size="12">${row.label}</text>
<rect x="${barX + 88}" y="${y}" width="${w.toFixed(2)}" height="18" fill="${row.color}"/>
<text x="${barX + 94 + w}" y="${y + 13}" fill="#94a3b8" font-size="12">${fmt(row.value, 3)}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${margin.left}" y="25" fill="#e5e7eb" font-size="18" font-weight="700">CA-XA divisor-frontier occupancy residual</text>
${legend}
<rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="#0b1626" stroke="#1f2937"/>
${grid.join("\n")}
${paths}
<text x="${barX}" y="64" fill="#e5e7eb" font-size="14">skip / Li controls</text>
${bars}
<text x="${margin.left}" y="${height - 34}" fill="#94a3b8" font-size="13">Q(Y) decomposes exactly as prime-count residual minus skipped-frontier correction; x-axis is frontier Y on log scale.</text>
</svg>`;
}

function makeMarkdown(report) {
  const lines = [];
  lines.push("# CA-XA divisor-frontier occupancy audit", "");
  lines.push("Candidate:");
  lines.push("count frontiers occupied by `CA ∩ XA` records and test whether `(occupied-Li)/sqrt(Li)` is a divisor-world critical line.", "");
  lines.push(`Source: \`${report.inputPath}\`.`);
  lines.push(`Frontier range: ${report.minFrontier}..${report.maxFrontier}.`, "");
  lines.push("## Occupancy decomposition", "");
  lines.push("| Y | primes in range | occupied frontiers | skipped | Li main | prime residual | occupancy Q | skipped/sqrt(Li) | identity error |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.rows) {
    lines.push(`| ${row.Y} | ${row.primeCount} | ${row.occupied} | ${row.skipped} | ${fmt(row.mainLi)} | ${fmt(row.piResidual)} | ${fmt(row.occupancyResidual)} | ${fmt(row.skippedCorrection)} | ${row.identityError.toExponential(3)} |`);
  }
  lines.push("");
  lines.push(`Exponent fits: \`abs(Q) theta=${fmt(report.absOccupancyTheta)}\`, \`abs(pi residual) theta=${fmt(report.absPrimeTheta)}\`, \`skip correction theta=${fmt(report.skipCorrectionTheta)}\`.`);
  lines.push("");
  lines.push(`Endpoint: occupied ${report.endpoint.occupied} of ${report.endpoint.primeCount} prime frontiers, skipped ${report.endpoint.skipped}.`);
  lines.push(`Endpoint decomposition: Q=${fmt(report.endpoint.occupancyResidual)}, prime residual=${fmt(report.endpoint.piResidual)}, skipped/sqrt(Li)=${fmt(report.endpoint.skippedCorrection)}.`);
  lines.push("");
  lines.push("## Fixed-shape fake-base controls", "");
  lines.push("| group | skipped/Li | skipped total | max skipped | frontier changes | nonzero skips | closure failures |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| real CA-XA | ${fmt(report.realSkipOverLiTotal)} | ${report.realSkipPrimeTotal} | ${report.realMaxSkippedPrimeCount} | ${report.realFrontierChangingTransitions} | ${report.realNonzeroSkipTransitions} | 0 |`);
  for (const row of report.fakeControls) {
    lines.push(`| seed ${row.seed} | ${fmt(row.skippedOverLiTotal)} | ${row.skippedPrimeTotal} | ${row.maxSkippedPrimeCount} | ${row.frontierChangingTransitions} | ${row.nonzeroSkipTransitions} | ${row.closureFailures} |`);
  }
  const fakeRange = range(report.fakeControls.map((row) => row.skippedOverLiTotal));
  lines.push("");
  lines.push(`Fake skipped/Li range: ${fmt(fakeRange[0])}..${fmt(fakeRange[1])}; real=${fmt(report.realSkipOverLiTotal)}.`);
  lines.push("");
  lines.push("## Factor check", "");
  lines.push("The candidate line has an exact decomposition:");
  lines.push("");
  lines.push("`(occupied-Li)/sqrt(Li) = (pi-Li)/sqrt(Li) - skipped/sqrt(Li)`.");
  lines.push("");
  lines.push("Thus the apparent line is prime-count residual plus a small finite skipped-frontier correction. That is a relabeling unless a new theorem bounds skipped frontiers uniformly.");
  lines.push("");
  lines.push(`SVG: \`${report.paths.svg}\``);
  lines.push(`JSON: \`${report.paths.json}\``);
  return lines.join("\n");
}

fs.mkdirSync(outDir, { recursive: true });
const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const { minFrontier, maxFrontier, primes, frontiers, rows } = endpointRows(data);
const fakeControls = summarizeFakeControls(data);
const skipSummary = data.summary.frontierSkipSummary;
const report = {
  candidate: "CA-XA divisor-frontier occupancy line",
  generatedAt: new Date().toISOString(),
  inputPath,
  minFrontier,
  maxFrontier,
  primeFrontiers: primes.length,
  occupiedFrontiers: frontiers.length,
  rows,
  absOccupancyTheta: exponent(rows.map((row) => ({ ...row, absQ: Math.abs(row.occupancyResidual) })), "absQ"),
  absPrimeTheta: exponent(rows.map((row) => ({ ...row, absP: Math.abs(row.piResidual) })), "absP"),
  skipCorrectionTheta: exponent(rows, "skippedCorrection"),
  endpoint: rows.at(-1),
  realSkipOverLiTotal: skipSummary.skippedOverLiTotal,
  realSkipPrimeTotal: skipSummary.skippedPrimeTotal,
  realMaxSkippedPrimeCount: skipSummary.maxSkippedPrimeCount,
  realFrontierChangingTransitions: skipSummary.frontierChangingTransitions,
  realNonzeroSkipTransitions: skipSummary.nonzeroSkipTransitions,
  fakeControls,
  paths: {
    json: path.join(outDir, "caxa-frontier-occupancy-audit.json"),
    md: path.join(outDir, "caxa-frontier-occupancy-audit.md"),
    svg: path.join(outDir, "caxa-frontier-occupancy-audit.svg"),
  },
};

fs.writeFileSync(report.paths.json, JSON.stringify(report, null, 2));
fs.writeFileSync(report.paths.md, makeMarkdown(report));
fs.writeFileSync(report.paths.svg, makeSvg(report));

console.log(JSON.stringify({
  ok: true,
  frontierRange: [minFrontier, maxFrontier],
  endpoint: report.endpoint,
  realSkipOverLiTotal: report.realSkipOverLiTotal,
  fakeSkipOverLiRange: range(fakeControls.map((row) => row.skippedOverLiTotal)),
  paths: report.paths,
}, null, 2));
