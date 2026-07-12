import { describe, expect, it } from "vitest";
import {
  LOG_TWO,
  adjacentBlockAnticorrelation,
  adjacentBlockSpectralKernel,
  adjacentScalePrimeVariance,
  circularAdjacentScaleIdentity,
  dyadicTentWeight,
  hardyLittlewoodAdjacentScale,
  pairSingularSeries,
  shortIntervalSecondMoment,
  vonMangoldtTable,
} from "../src/core/primeVariance.js";

describe("dyadic prime-variance renormalization", () => {
  it("computes von Mangoldt values only on prime powers", () => {
    const { lambda, psi } = vonMangoldtTable(12);
    expect(lambda[2]).toBeCloseTo(Math.log(2), 14);
    expect(lambda[4]).toBeCloseTo(Math.log(2), 14);
    expect(lambda[8]).toBeCloseTo(Math.log(2), 14);
    expect(lambda[9]).toBeCloseTo(Math.log(3), 14);
    expect(lambda[6]).toBe(0);
    expect(psi[12] - psi[11]).toBe(0);
  });

  it("matches the circular covariance identity exactly", () => {
    const values = Float64Array.from([1, -2, 0.5, 3, -1, 4, -3, 2, 0.25, -0.75, 1.5]);
    const result = circularAdjacentScaleIdentity(values, 3);
    expect(result.direct).toBeCloseTo(result.covarianceSide, 12);
    expect(result.error).toBeCloseTo(0, 12);
  });

  it("has the expected negative tent coefficients and no diagonal term", () => {
    expect(dyadicTentWeight(0, 8)).toBe(0);
    expect(dyadicTentWeight(4, 8)).toBeCloseTo(0.5, 14);
    expect(dyadicTentWeight(8, 8)).toBe(1);
    expect(dyadicTentWeight(12, 8)).toBeCloseTo(0.5, 14);
    expect(dyadicTentWeight(16, 8)).toBe(0);
  });

  it("has a zero-mean signed spectral kernel, so white noise contributes zero", () => {
    const H = 8;
    const samples = 257;
    let mean = 0;
    let minimum = Infinity;
    let maximum = -Infinity;
    for (let j = 0; j < samples; j++) {
      const value = adjacentBlockSpectralKernel(j / samples, H);
      mean += value / samples;
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    }
    expect(mean).toBeCloseTo(0, 12);
    expect(minimum).toBeLessThan(0);
    expect(maximum).toBeGreaterThan(0);
  });

  it("uses the standard pair singular series", () => {
    expect(pairSingularSeries(1)).toBe(0);
    expect(pairSingularSeries(2)).toBeCloseTo(1.3203236316937392, 14);
    expect(pairSingularSeries(6)).toBeCloseTo(2 * 0.6601618158468696 * 2, 14);
  });

  it("shows the Hardy--Littlewood scale statistic approaching log 2", () => {
    const small = hardyLittlewoodAdjacentScale(128);
    const large = hardyLittlewoodAdjacentScale(4096);
    expect(Math.abs(large.residual)).toBeLessThan(Math.abs(small.residual));
    expect(large.value).toBeCloseTo(LOG_TWO, 1);
  });

  it("computes direct prime-window moments and their adjacent difference", () => {
    const X = 200;
    const H = 12;
    const { psi } = vonMangoldtTable(2 * X + 2 * H);
    const moment = shortIntervalSecondMoment(psi, X, H);
    const adjacent = adjacentScalePrimeVariance(psi, X, H);
    expect(moment.samples).toBe(X);
    expect(moment.value).toBeGreaterThan(0);
    expect(adjacent.value).toBeCloseTo(
      adjacent.fine.normalized - adjacent.coarse.normalized,
      14,
    );
    const block = adjacentBlockAnticorrelation(psi, X, H);
    expect(block.value).toBeCloseTo(block.polarizationSide, 12);
    expect(block.identityError).toBeCloseTo(0, 12);
  });
});
