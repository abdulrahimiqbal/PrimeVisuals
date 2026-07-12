import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  chowlaWeatherNulls,
  liouvilleFeatures,
  liouvilleUpTo,
  localChowlaTensor,
  scoreFeatureLaws,
} from "../src/core/frontier/chowlaWeather.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "scripts/frontier-chowla-weather.mjs");

describe("local Chowla weather core", () => {
  it("liouville values for n=1..20 match (-1)^Omega(n)", () => {
    const lambda = liouvilleUpTo(20);
    expect(Array.from(lambda.slice(1, 21))).toEqual([
      1, -1, -1, 1, -1, 1, -1, -1, 1, 1,
      -1, -1, -1, 1, 1, 1, -1, -1, -1, -1,
    ]);
  });

  it("local B(h,x,L) equals brute force", () => {
    const N = 48;
    const H = 6;
    const windows = [4, 8, 16];
    const stride = 5;
    const lambda = liouvilleUpTo(N + H);
    const tensor = localChowlaTensor({ N, H, windows, stride, lambda });
    for (const row of tensor.rows) {
      let brute = 0;
      for (let n = row.x; n < row.x + row.L; n++) brute += lambda[n] * lambda[n + row.h];
      expect(row.B).toBe(brute);
      expect(row.Z).toBeCloseTo(brute / Math.sqrt(row.L), 14);
    }
  });

  it("seeded nulls are reproducible", () => {
    const args = { N: 40, H: 5, windows: [8, 16], stride: 8, seeds: [12, 99] };
    const a = chowlaWeatherNulls(args);
    const b = chowlaWeatherNulls(args);
    expect(a).toEqual(b);
  });

  it("extracts h features used by feature-law searches", () => {
    const f = liouvilleFeatures(12);
    expect(f.v2).toBe(2);
    expect(f.oddpart).toBe(3);
    expect(f.omega).toBe(2);
    expect(f.bigomega).toBe(3);
    expect(f.rad).toBe(6);
    expect(f.tau).toBe(6);
    expect(f.phiRatio).toBeCloseTo(1 / 3, 14);
    expect(f.squarefree).toBe(false);
    expect(f.parityOmega).toBe("odd");
    expect(f.gcdPrimorial).toBe(6);
    expect(f.mod8).toBe(4);
    expect(f.mod30).toBe(12);
  });

  it("scoring rejects individual-h artifacts instead of ranking h columns", () => {
    const tensor = localChowlaTensor({
      N: 128,
      H: 32,
      windows: [16, 32],
      stride: 16,
      includeRows: false,
    });
    const fake = {
      ...tensor,
      cells: tensor.cells.map((cell) => ({
        ...cell,
        meanZ: cell.h === 7 ? 12 : 0,
        maxAbsZ: cell.h === 7 ? 12 : 0,
      })),
    };
    const nulls = chowlaWeatherNulls({ N: 128, H: 32, windows: [16, 32], stride: 16, seeds: [1, 2, 3] });
    const scored = scoreFeatureLaws({ tensor: fake, halfTensor: fake, nulls, seeds: [1, 2, 3], minTrainZ: 2 });
    expect(scored.survivors).toEqual([]);
    expect(scored.laws.some((law) => /^h\s*=/.test(law.description))).toBe(false);
    expect(scored.laws.some((law) => law.rejectionReasons.includes("train effect dominated by an isolated h"))).toBe(true);
  });
});

describe("frontier-chowla-weather CLI", () => {
  it("writes all requested artifacts", () => {
    const outDir = path.join(ROOT, "logs", `frontier-chowla-weather-test-${process.pid}-${Date.now()}`);
    fs.rmSync(outDir, { recursive: true, force: true });
    const stdout = execFileSync("node", [
      CLI,
      "--N", "96",
      "--H", "18",
      "--windows", "8,16,32",
      "--stride", "8",
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
      "chowla-weather-report.md",
      "chowla-weather-laws.json",
      "chowla-weather-feature-matrix.csv",
      "chowla-weather-heatmap.svg",
      "chowla-weather-phase.svg",
    ]) {
      expect(fs.existsSync(path.join(outDir, file))).toBe(true);
    }
    const report = fs.readFileSync(path.join(outDir, "chowla-weather-report.md"), "utf8");
    expect(report).toContain("B(h,x,L) = sum_{n=x}^{x+L-1}");
    expect(report).toContain("No individual h column is ranked");
    expect(report).toMatch(/NO SURVIVOR|Candidate Conjecture/);
    fs.rmSync(outDir, { recursive: true, force: true });
  });
});
