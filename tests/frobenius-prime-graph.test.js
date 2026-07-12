import { describe, expect, it } from "vitest";
import {
  bruteE0PointCount,
  e0Trace,
  gl2TraceDetHistogram,
  jonesUniversalLocalFactor2,
  normalizedAliquotPairFactor,
  primeTable,
  quadraticTwistTrace,
  serreAliquotCorrection2,
  shortWeierstrassTrace,
  traceGapCoordinates,
  truncatedJonesUniversalConstant2,
} from "../src/core/frobeniusPrimeGraph.js";

describe("Frobenius prime graph exact kernels", () => {
  it("agrees with independent brute point counts for E0", () => {
    for (const p of [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 41]) {
      expect(p + 1 - e0Trace(p)).toBe(bruteE0PointCount(p));
    }
  });

  it("recovers the two trace-gap equations", () => {
    expect(traceGapCoordinates(1622311, -159, 1622471, 161)).toEqual({
      h: 160,
      firstEdge: true,
      returnEdge: true,
      expectedAP: -159,
      expectedAQ: 161,
    });
  });

  it("twists traces by the exact quadratic character at good primes", () => {
    expect(quadraticTwistTrace(3, 5, 2)).toBe(-3);
    expect(quadraticTwistTrace(3, 7, 2)).toBe(3);
    expect(quadraticTwistTrace(3, 7, 7)).toBeNull();
  });

  it("reconstructs Jones's closed GL2 local factor", () => {
    for (const ell of [2, 3, 5, 7]) {
      const enumerated = normalizedAliquotPairFactor(gl2TraceDetHistogram(ell)).factor;
      expect(enumerated).toBeCloseTo(jonesUniversalLocalFactor2(ell), 14);
    }
    expect(truncatedJonesUniversalConstant2(10_000)).toBeCloseTo(0.077088124, 5);
    const reconstructedE0 = truncatedJonesUniversalConstant2(100_000) * serreAliquotCorrection2(37);
    expect(reconstructedE0).toBeCloseTo(0.077093, 6);
  });

  it("counts the zero-constant control by its exact formula", () => {
    // y^2=x^3-3x+4 has 7 points over F_5 (checked by direct enumeration).
    expect(5 + 1 - shortWeierstrassTrace(5, -3, 4)).toBe(7);
  });

  it("constructs inclusive prime tables", () => {
    const table = primeTable(11);
    expect([...table].map((value, n) => value ? n : null).filter(Number.isInteger)).toEqual([2, 3, 5, 7, 11]);
  });
});
