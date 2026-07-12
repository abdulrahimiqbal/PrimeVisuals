import { describe, expect, it } from "vitest";
import {
  lagOneCorrelation,
  rankCoordinate,
  transitionResidualSeries,
} from "../src/core/gapTransitionCopula.js";

describe("gap transition copula helpers", () => {
  it("maps values monotonically through a training empirical CDF", () => {
    const training = [1, 2, 3, 4];
    expect(rankCoordinate(1, training)).toBeLessThan(rankCoordinate(2, training));
    expect(rankCoordinate(2.5, training)).toBeCloseTo(0, 12);
    expect(rankCoordinate(4, training)).toBeGreaterThan(0);
  });

  it("detects positive and negative lag-one correlation", () => {
    expect(lagOneCorrelation([1, 2, 3, 4, 5]).correlation).toBeCloseTo(1, 12);
    expect(lagOneCorrelation([1, -1, 1, -1, 1]).correlation).toBeCloseTo(-1, 12);
  });

  it("subtracts cross-fitted transition-class means with shrinkage", () => {
    const training = [];
    for (let i = 0; i < 100; i++) {
      const even = i % 2 === 0;
      training.push({ p: even ? 1 : 7, q: even ? 7 : 1, value: even ? 10 + i / 1000 : -10 - i / 1000 });
    }
    const holdout = [
      { p: 1, q: 7, value: 10.05 },
      { p: 7, q: 1, value: -10.05 },
    ];
    const result = transitionResidualSeries(training, holdout, 30, 0);
    expect(result.classCount).toBe(2);
    expect(result.unseenFraction).toBe(0);
    expect(Math.abs(result.residuals[0])).toBeLessThan(0.2);
    expect(Math.abs(result.residuals[1])).toBeLessThan(0.2);
  });
});
