import { describe, expect, it } from "vitest";
import {
  controlExcess,
  entropyBitsFromCounts,
  interactionDefectFromMaskCounts,
  interactionDefectFromJointMoments,
  localInformationDepth,
  maskProbabilitiesFromJointMoments,
} from "../src/core/localGlobalDefect.js";

describe("sieve-conditioned interaction defect", () => {
  it("is zero for an exactly independent uniform three-bit distribution", () => {
    const result = interactionDefectFromMaskCounts(new Array(8).fill(10), 3);
    expect(result.samples).toBe(80);
    expect(result.jointEntropy).toBeCloseTo(3, 12);
    expect(result.marginalEntropySum).toBeCloseTo(3, 12);
    expect(result.totalCorrelation).toBeCloseTo(0, 12);
    expect(result.relativeDefect).toBeCloseTo(0, 12);
  });

  it("detects two bits of total correlation when three fair bits are identical", () => {
    const counts = [50, 0, 0, 0, 0, 0, 0, 50];
    const result = interactionDefectFromMaskCounts(counts, 3);
    expect(result.jointEntropy).toBeCloseTo(1, 12);
    expect(result.marginalEntropySum).toBeCloseTo(3, 12);
    expect(result.totalCorrelation).toBeCloseTo(2, 12);
    expect(result.relativeDefect).toBeCloseTo(2 / 3, 12);
    expect(result.allOneCount).toBe(50);
  });

  it("is invariant under a permutation of bit coordinates", () => {
    const counts = [31, 7, 11, 5, 13, 3, 17, 19];
    const permuted = new Array(8).fill(0);
    for (let mask = 0; mask < 8; mask++) {
      const b0 = mask & 1;
      const b1 = (mask >>> 1) & 1;
      const b2 = (mask >>> 2) & 1;
      const nextMask = b2 | (b0 << 1) | (b1 << 2);
      permuted[nextMask] = counts[mask];
    }
    const a = interactionDefectFromMaskCounts(counts, 3);
    const b = interactionDefectFromMaskCounts(permuted, 3);
    expect(a.totalCorrelation).toBeCloseTo(b.totalCorrelation, 12);
    expect(a.relativeDefect).toBeCloseTo(b.relativeDefect, 12);
  });

  it("computes entropy, information depth, and sample-standardized controls", () => {
    expect(entropyBitsFromCounts([1, 1])).toBeCloseTo(1, 12);
    expect(localInformationDepth(25, 100)).toBeCloseTo(Math.log(4), 12);
    const excess = controlExcess(7, [1, 2, 3]);
    expect(excess.mean).toBeCloseTo(2, 12);
    expect(excess.sd).toBeCloseTo(1, 12);
    expect(excess.z).toBeCloseTo(5, 12);
  });

  it("reconstructs an independent mask law from subset joint moments", () => {
    const p = [0.2, 0.3, 0.4];
    const moments = new Float64Array(8);
    moments[0] = 1;
    for (let mask = 1; mask < 8; mask++) {
      let value = 1;
      for (let bit = 0; bit < 3; bit++) if (mask & (1 << bit)) value *= p[bit];
      moments[mask] = value;
    }
    const probabilities = maskProbabilitiesFromJointMoments(moments, 3);
    expect(probabilities.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
    expect(probabilities[7]).toBeCloseTo(0.2 * 0.3 * 0.4, 12);
    const defect = interactionDefectFromJointMoments(moments, 3);
    expect(defect.totalCorrelation).toBeCloseTo(0, 12);
  });
});
