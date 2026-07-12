#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  LOG_TWO,
  adjacentBlockAnticorrelation,
  adjacentScalePrimeVariance,
  hardyLittlewoodAdjacentScale,
  vonMangoldtTable,
} from "../src/core/primeVariance.js";

const maxX = Math.max(20_000, Math.round(Number(process.argv[2] || 1_600_000)));
const outDir = process.argv[3] || "logs/dpvr-artifacts";
const xLevels = [maxX / 8, maxX / 4, maxX / 2, maxX]
  .map((value) => Math.max(10_000, Math.round(value)))
  .filter((value, index, values) => values.indexOf(value) === index);
const exponents = [0.25, 1 / 3, 0.4, 0.5, 0.6];
const maxH = Math.max(...xLevels.flatMap((X) => exponents.map((theta) => Math.round(X ** theta))));

function adjacentBlockBatchSummary(psi, X, H) {
  const batchCount = Math.max(4, Math.min(32, Math.floor(X / (8 * H))));
  const estimates = [];
  for (let batch = 0; batch < batchCount; batch++) {
    const start = X + Math.floor(batch * X / batchCount);
    const end = X + Math.floor((batch + 1) * X / batchCount);
    let productSum = 0;
    for (let x = start; x < end; x++) {
      const first = psi[x + H] - psi[x] - H;
      const second = psi[x + 2 * H] - psi[x + H] - H;
      productSum += first * second;
    }
    estimates.push(-productSum / ((end - start) * H));
  }
  const mean = estimates.reduce((sum, value) => sum + value, 0) / estimates.length;
  const variance = estimates.length > 1
    ? estimates.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (estimates.length - 1)
    : NaN;
  return {
    batchCount,
    mean,
    standardError: Math.sqrt(variance / estimates.length),
  };
}

fs.mkdirSync(outDir, { recursive: true });
const { psi } = vonMangoldtTable(2 * maxX + 2 * maxH + 8);

const rows = [];
for (const X of xLevels) {
  for (const theta of exponents) {
    const H = Math.max(2, Math.round(X ** theta));
    const prime = adjacentScalePrimeVariance(psi, X, H);
    const adjacentBlocks = adjacentBlockAnticorrelation(psi, X, H);
    const batch = adjacentBlockBatchSummary(psi, X, H);
    const hardyLittlewood = hardyLittlewoodAdjacentScale(H);
    rows.push({
      X,
      theta,
      H,
      prime: prime.value,
      primeResidual: prime.residual,
      adjacentBlocks: adjacentBlocks.value,
      adjacentBlocksResidual: adjacentBlocks.residual,
      adjacentBlocksIdentityError: adjacentBlocks.identityError,
      batchCount: batch.batchCount,
      batchStandardError: batch.standardError,
      batchZFromLogTwo: (adjacentBlocks.value - LOG_TWO) / batch.standardError,
      hardyLittlewood: hardyLittlewood.value,
      hardyLittlewoodResidual: hardyLittlewood.residual,
      primeMinusHardyLittlewood: adjacentBlocks.value - hardyLittlewood.value,
      batchZFromHardyLittlewood: (adjacentBlocks.value - hardyLittlewood.value) / batch.standardError,
      fineNormalized: prime.fine.normalized,
      coarseNormalized: prime.coarse.normalized,
      meanResidualH: prime.fine.meanResidual,
      meanResidual2H: prime.coarse.meanResidual,
    });
  }
}

const payload = {
  object: "dyadic-prime-variance-renormalization",
  generatedAt: new Date().toISOString(),
  convention: "integer x in [X,2X), centered by H",
  target: LOG_TWO,
  rows,
};
fs.writeFileSync(path.join(outDir, "dpvr-audit.json"), `${JSON.stringify(payload, null, 2)}\n`);

const lines = [
  "# DPVR finite audit",
  "",
  `Target: log 2 = ${LOG_TWO.toFixed(9)}. Values are diagnostics, not theorem evidence.`,
  "",
  "| X | theta | H | adjacent blocks | HL tent | AB-HL | batch SE* | z vs HL* |",
  "|---:|---:|---:|---:|---:|---:|---:|---:|",
  ...rows.map((row) => `| ${row.X} | ${row.theta.toFixed(3)} | ${row.H} | ${row.adjacentBlocks.toFixed(6)} | ${row.hardyLittlewood.toFixed(6)} | ${row.primeMinusHardyLittlewood.toFixed(6)} | ${row.batchStandardError.toFixed(6)} | ${row.batchZFromHardyLittlewood.toFixed(2)} |`),
  "",
  "*Batch standard errors are dependence-aware diagnostics, not rigorous confidence intervals; batches have length at least about 8H.",
  "",
];
fs.writeFileSync(path.join(outDir, "README.md"), `${lines.join("\n")}\n`);
process.stdout.write(`${lines.join("\n")}\n`);
