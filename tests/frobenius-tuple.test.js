import { describe, expect, it } from "vitest";
import {
  centeredPairScore,
  hardyLittlewoodPairSingularSeries,
  legendreSymbol,
  pairConditionedMean,
  pearson,
  quadraticCharacterTable,
  signAgreement,
  theoreticalQuadraticPairMean,
} from "../src/core/frobeniusTuple.js";

describe("quadratic Frobenius tuple kernel", () => {
  it("computes Legendre characters", () => {
    expect([0, 1, 2, 3, 4].map((n) => legendreSymbol(n, 5))).toEqual([0, 1, -1, -1, 1]);
  });

  it("derives the exact pair-conditioned character mean", () => {
    for (const ell of [5, 7, 11, 13, 17, 19]) {
      const table = quadraticCharacterTable(ell);
      for (const h of [2, 6, 8, 12, 18, 24, 32, 36, 46, 48, 54, 64]) {
        expect(pairConditionedMean(table, h).mean).toBeCloseTo(theoreticalQuadraticPairMean(ell, h), 14);
      }
      expect(pairConditionedMean(table, ell).mean).toBe(1);
    }
  });

  it("centers and normalizes pair sums", () => {
    const score = centeredPairScore(-20, 100, -0.2);
    expect(score.residual).toBeCloseTo(0, 14);
    expect(score.z).toBeCloseTo(0, 14);
  });

  it("uses the standard pair singular-series factors", () => {
    const s2 = hardyLittlewoodPairSingularSeries(2);
    expect(s2).toBeCloseTo(1.320323631693739, 14);
    expect(hardyLittlewoodPairSingularSeries(6)).toBeCloseTo(2 * s2, 14);
    expect(hardyLittlewoodPairSingularSeries(3)).toBe(0);
  });

  it("computes replication diagnostics", () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 14);
    expect(signAgreement([1, -2, 3], [4, -5, -1])).toBeCloseTo(2 / 3, 14);
  });
});
