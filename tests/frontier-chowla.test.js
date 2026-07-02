import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  chowlaPairMatrix,
  dyadicChowlaAtlas,
  liouvilleUpTo,
  randomMultiplicativeNull,
  scoreChowlaAtlas,
  shuffleNull,
} from "../src/core/frontier/chowla.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "scripts/frontier-chowla.mjs");

describe("FrontierLab Chowla module", () => {
  it("liouville values for n=1..20 match (-1)^Omega(n)", () => {
    const lambda = liouvilleUpTo(20);
    expect(Array.from(lambda.slice(1, 21))).toEqual([
      1, -1, -1, 1, -1, 1, -1, -1, 1, 1,
      -1, -1, -1, 1, 1, 1, -1, -1, -1, -1,
    ]);
  });

  it("S(h,N) matches brute force for small N,H", () => {
    const N = 30;
    const H = 6;
    const lambda = liouvilleUpTo(N);
    const rows = chowlaPairMatrix({ N, H });
    for (const row of rows) {
      let brute = 0;
      for (let n = 1; n <= N - row.h; n++) brute += lambda[n] * lambda[n + row.h];
      expect(row.S).toBe(brute);
      expect(row.Z).toBeCloseTo(brute / Math.sqrt(N), 14);
    }
  });

  it("random multiplicative null is reproducible by seed", () => {
    const a = randomMultiplicativeNull({ N: [40, 80], H: 6, seeds: [123, 456] });
    const b = randomMultiplicativeNull({ N: [40, 80], H: 6, seeds: [123, 456] });
    expect(a).toEqual(b);
  });

  it("scoring demotes pure shuffled artifacts", () => {
    const atlas = dyadicChowlaAtlas({ N0: 64, levels: 3, H: 12 });
    const lambda = liouvilleUpTo(256);
    const randomNull = randomMultiplicativeNull({ N: atlas.Ns, H: 12, seeds: [1, 2, 3, 4, 5] });
    const shuffled = shuffleNull({ lambda, N: atlas.Ns, H: 12, seeds: [1, 2, 3, 4, 5] });
    const fakeAtlas = {
      ...atlas,
      kind: "shuffled-control-as-real",
      levels: atlas.levels.map((level, levelIndex) => ({
        ...level,
        rows: level.rows.map((row, rowIndex) => ({
          ...row,
          S: shuffled.levels[levelIndex].rows[rowIndex].samplesS[0],
          Z: shuffled.levels[levelIndex].rows[rowIndex].samplesZ[0],
        })),
      })),
    };
    const scored = scoreChowlaAtlas(fakeAtlas, { randomMultiplicative: randomNull, shuffle: shuffled });
    expect(scored.survivors).toEqual([]);
    expect(scored.candidates[0].verdict).toBe("not-survivor");
  });
});

describe("frontier-chowla CLI", () => {
  it("creates all expected files", () => {
    const outDir = path.join(ROOT, "logs", `frontier-chowla-test-${process.pid}-${Date.now()}`);
    fs.rmSync(outDir, { recursive: true, force: true });
    const stdout = execFileSync("node", [
      CLI,
      "--N0", "64",
      "--levels", "2",
      "--H", "8",
      "--seeds", "3",
      "--outDir", outDir,
    ], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 60000,
    });
    const summary = JSON.parse(stdout);
    expect(summary.ok).toBe(true);
    for (const file of [
      "chowla-atlas.json",
      "chowla-report.md",
      "chowla-heatmap.svg",
      "chowla-feature-summary.csv",
    ]) {
      expect(fs.existsSync(path.join(outDir, file))).toBe(true);
    }
    const report = fs.readFileSync(path.join(outDir, "chowla-report.md"), "utf8");
    expect(report).toContain("S(h,N) = sum_{1 <= n <= N-h} lambda(n) lambda(n+h)");
    expect(report).toContain("Known Disguise Audit");
    fs.rmSync(outDir, { recursive: true, force: true });
  });
});
