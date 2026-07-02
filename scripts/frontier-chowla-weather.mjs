#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  chowlaWeatherHeatmapSvg,
  chowlaWeatherNulls,
  chowlaWeatherPhaseSvg,
  featureMatrixCsv,
  liouvilleUpTo,
  localChowlaTensor,
  scoreFeatureLaws,
  summarizeRejectedArtifacts,
} from "../src/core/frontier/chowlaWeather.js";

function parseArgs(argv) {
  const args = {
    N: 300000,
    H: 512,
    windows: [256, 512, 1024, 2048, 4096, 8192],
    stride: 512,
    seeds: 30,
    outDir: "logs/frontier",
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    if (key === "windows") args.windows = value.split(",").map((x) => Number(x.trim())).filter(Boolean);
    else if (["N", "H", "stride", "seeds"].includes(key)) args[key] = Number(value);
    else if (key === "outDir") args.outDir = value;
    else throw new Error(`unknown argument --${key}`);
  }
  return args;
}

function fmt(value, digits = 3) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : "n/a";
}

function lawTable(laws) {
  if (!laws.length) return "_No feature laws were scored._";
  return `| rank | feature law | family | score | train z | train effect | holdout effect | N/2 effect | verdict | rejection |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
${laws.slice(0, 10).map((law, i) => `| ${i + 1} | ${law.description} | ${law.family} | ${fmt(law.score, 3)} | ${fmt(law.train.nullZ.min, 3)} | ${fmt(law.train.effect, 5)} | ${fmt(law.holdout.effect, 5)} | ${fmt(law.dyadic?.effect ?? 0, 5)} | ${law.verdict} | ${(law.rejectionReasons || []).join("; ") || "passed gates"} |`).join("\n")}`;
}

function survivorText(survivors) {
  if (!survivors.length) return "";
  return survivors.slice(0, 5).map((law, i) =>
    `${i + 1}. ${law.description}: train z ${fmt(law.train.nullZ.min, 3)}, holdout effect ${fmt(law.holdout.effect, 5)}, N/2 effect ${fmt(law.dyadic?.effect ?? 0, 5)}.`,
  ).join("\n");
}

function rejectedTable(rejected) {
  if (!rejected.length) return "_No named artifact controls were triggered._";
  return `| artifact | score | reason |
| --- | ---: | --- |
${rejected.map((row) => `| ${row.artifact} | ${fmt(row.score, 3)} | ${row.reason} |`).join("\n")}`;
}

function nullModeTable(nulls) {
  return `| null | definition | implementation mode |
| --- | --- | --- |
| random completely multiplicative signs | choose seeded independent signs on primes and extend multiplicatively | ${nulls.nulls.randomMultiplicative.mode} |
| block-shuffled lambda | shuffle contiguous lambda sign runs, preserving local run lengths roughly | ${nulls.nulls.blockShuffle.mode} |
| sign-shuffled A_h | multiply A_h(n)=lambda(n)lambda(n+h) by seeded random signs within each scale | ${nulls.nulls.signShuffleAH.mode} |`;
}

function dyadicSummary(scored) {
  const rows = scored.laws.slice(0, 10);
  return `| feature law | N train effect | N/2 effect | same direction | dyadic ratio |
| --- | ---: | ---: | --- | ---: |
${rows.map((law) => {
  const same = Math.sign(law.train.effect || 0) === Math.sign(law.dyadic?.effect || 0);
  return `| ${law.description} | ${fmt(law.train.effect, 5)} | ${fmt(law.dyadic?.effect ?? 0, 5)} | ${same ? "yes" : "no"} | ${fmt(law.dyadicRatio, 3)} |`;
}).join("\n")}`;
}

function reportMarkdown({ args, tensor, halfTensor, nulls, scored, elapsedMs }) {
  const survivors = scored.survivors || [];
  const rejected = summarizeRejectedArtifacts(scored);
  const topFailure = scored.laws.find((law) => law.verdict !== "survivor");
  const survivorSection = survivors.length
    ? `## Candidate Conjecture\n\nThe following feature-family laws survived the pre-registered local-weather gates. This is numerical evidence only, not a proof.\n\n${survivorText(survivors)}`
    : `## NO SURVIVOR\n\nNO SURVIVOR: local weather also null. Exact failure reason: the best-ranked law, \`${topFailure?.description || "n/a"}\`, failed with ${(topFailure?.rejectionReasons || ["no laws scored"]).join("; ")}. No candidate conjecture is promoted.`;

  return `# Local Chowla weather report

## Objective and Quarantine

This run replaces the earlier terminal-column Chowla audit with a local-window search for rigid residual feature laws. It does not use zeta functions, zeros, explicit formula terms, RH equivalents, Robin, Nicolas, or Lagarias criteria. It also refuses to promote individual h columns.

Configuration: \`N=${args.N}\`, \`H=${args.H}\`, \`windows=${args.windows.join(",")}\`, \`stride=${args.stride}\`, \`seeds=${args.seeds}\`.
Elapsed: \`${fmt(elapsedMs / 1000, 2)}s\`.

## Why terminal C_h(N) was insufficient

The previous terminal statistic collapses every shift into one endpoint number, so a large \`C_h(N)\` can be an isolated h outlier, an endpoint accident, or a low-complexity parity/modulus artifact. Local weather keeps the x-coordinate and window scale alive, then scores only feature-family laws that have train/holdout support, null separation, and dyadic persistence.

## Statistic

\`\`\`text
lambda(n) = (-1)^Omega(n)
B(h,x,L) = sum_{n=x}^{x+L-1} lambda(n) lambda(n+h)
Z(h,x,L) = B(h,x,L) / sqrt(L)
\`\`\`

The implementation uses prefix sums of \`A_h(n)=lambda(n)lambda(n+h)\` for each h, so every local window query is an O(1) prefix difference after the per-shift pass.

Tensor rows scanned: \`${tensor.rowCount}\`. Aggregated h x L cells: \`${tensor.cells.length}\`.
Dyadic comparison tensor: \`N/2=${halfTensor.N}\`, rows scanned \`${halfTensor.rowCount}\`, cells \`${halfTensor.cells.length}\`.

## Null Definitions

${nullModeTable(nulls)}

The law score uses the most conservative train z across random-multiplicative, block-shuffle, and sign-shuffle gates. Large runs use unit-variance local-cell null summaries for h x L reporting and seeded law-level perturbations for the gate; small runs use exact seeded null tensors.

## Top 10 Feature Laws

These are feature-family laws only. No individual h column is ranked.

${lawTable(scored.laws)}

## Train vs Holdout Controls

- h-size-only control max z: \`${fmt(scored.controls.hSizeZ, 3)}\`
- parity-only control max z: \`${fmt(scored.controls.parityZ, 3)}\`
- one-modulus-only control max z: \`${fmt(scored.controls.modulusZ, 3)}\`
- global h-size R2 over local cells: \`${fmt(scored.audit.hSizeR2, 4)}\`

Every promoted law must beat these controls, keep the same sign on h <= H/2 and h > H/2, and avoid isolated-h dominance.

## Dyadic rerun comparison: N/2 vs N

${dyadicSummary(scored)}

## Rejected Artifacts

${rejectedTable(rejected)}

## Artifact Files

- \`logs/frontier/chowla-weather-laws.json\`
- \`logs/frontier/chowla-weather-feature-matrix.csv\`
- \`logs/frontier/chowla-weather-heatmap.svg\`
- \`logs/frontier/chowla-weather-phase.svg\`

${survivorSection}
`;
}

const args = parseArgs(process.argv.slice(2));
const outDir = args.outDir;
const t0 = Date.now();
fs.mkdirSync(outDir, { recursive: true });

console.error(`[frontier-chowla-weather] lambda to ${args.N + args.H}`);
const lambda = liouvilleUpTo(args.N + args.H);

console.error(`[frontier-chowla-weather] local tensor N=${args.N}, H=${args.H}`);
const tensor = localChowlaTensor({
  N: args.N,
  H: args.H,
  windows: args.windows,
  stride: args.stride,
  lambda,
  includeRows: false,
});

const halfN = Math.max(1, Math.floor(args.N / 2));
console.error(`[frontier-chowla-weather] dyadic tensor N/2=${halfN}`);
const halfTensor = localChowlaTensor({
  N: halfN,
  H: args.H,
  windows: args.windows.filter((L) => L <= halfN),
  stride: args.stride,
  lambda,
  includeRows: false,
});

console.error(`[frontier-chowla-weather] null summaries seeds=${args.seeds}`);
const nulls = chowlaWeatherNulls({
  N: args.N,
  H: args.H,
  windows: args.windows,
  stride: args.stride,
  seeds: args.seeds,
  lambda,
});

console.error("[frontier-chowla-weather] scoring feature laws");
const scored = scoreFeatureLaws({
  tensor,
  halfTensor,
  nulls,
  seeds: args.seeds,
});

const elapsedMs = Date.now() - t0;
const lawsPath = path.join(outDir, "chowla-weather-laws.json");
const csvPath = path.join(outDir, "chowla-weather-feature-matrix.csv");
const heatmapPath = path.join(outDir, "chowla-weather-heatmap.svg");
const phasePath = path.join(outDir, "chowla-weather-phase.svg");
const reportPath = path.join(outDir, "chowla-weather-report.md");

const lawsOutput = {
  objective: "local Chowla weather hunt for rigid residual feature laws",
  quarantine: ["no zeta", "no zeros", "no explicit formula", "no RH equivalents", "no individual h promotion"],
  args,
  elapsedMs,
  tensorSummary: {
    N: tensor.N,
    H: tensor.H,
    windows: tensor.windows,
    stride: tensor.stride,
    rowCount: tensor.rowCount,
    cellCount: tensor.cells.length,
  },
  dyadicSummary: {
    N: halfTensor.N,
    rowCount: halfTensor.rowCount,
    cellCount: halfTensor.cells.length,
  },
  nulls,
  scored,
};

fs.writeFileSync(lawsPath, JSON.stringify(lawsOutput, null, 2));
fs.writeFileSync(csvPath, featureMatrixCsv(tensor));
fs.writeFileSync(heatmapPath, chowlaWeatherHeatmapSvg(tensor, scored));
fs.writeFileSync(phasePath, chowlaWeatherPhaseSvg(tensor, scored));
fs.writeFileSync(reportPath, reportMarkdown({ args, tensor, halfTensor, nulls, scored, elapsedMs }));

const summary = {
  ok: true,
  survivorCount: scored.survivors.length,
  topFeatureLaws: scored.laws.slice(0, 5).map((law) => ({
    law: law.description,
    family: law.family,
    score: Number(law.score.toFixed(6)),
    trainZ: Number(law.train.nullZ.min.toFixed(6)),
    verdict: law.verdict,
    rejectionReasons: law.rejectionReasons,
  })),
  files: {
    reportPath,
    lawsPath,
    csvPath,
    heatmapPath,
    phasePath,
  },
};

console.log(JSON.stringify(summary, null, 2));
