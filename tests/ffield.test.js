import { describe, it, expect } from "vitest";
import {
  buildPolynomialUniverse,
  chowlaTwoPoint,
  irreducibleCountFormula,
  isMonicIrreducible,
  monicPolynomial,
  polyAdd,
  polynomialMobius,
  polyMul,
  polyToString,
  polynomialTwinPrediction,
  polynomialTwinSingularSeries,
  twinIrreducibleCounts,
} from "../src/core/ffield.js";
import { SOURCES } from "../src/core/registry.js";

describe("F_q[t] polynomial arithmetic", () => {
  it("uses bitmask multiplication over F_2", () => {
    const t = 0b10;
    const tPlus1 = 0b11;
    expect(polyMul(t, tPlus1, 2)).toBe(0b110);
    expect(polyAdd(0b111, 1, 2)).toBe(0b110);
  });

  it("multiplies over F_3 without integer carries", () => {
    // (t + 2)(t + 1) = t^2 + 0*t + 2 over F_3.
    expect(polyMul(3 + 2, 3 + 1, 3)).toBe(9 + 2);
    expect(polyToString(9 + 2, 3)).toBe("t^2 + 2");
  });

  it("uses extension-field coefficient arithmetic over F_4", () => {
    // Coefficient label 2 is u in F_4 = F_2[u]/(u^2 + u + 1), so u^2 = u + 1.
    expect(polyMul(2, 2, 4)).toBe(3);
    expect(polyAdd(2, 3, 4)).toBe(1);
  });

  it("encodes monic polynomials as q^degree + lower coefficients", () => {
    expect(monicPolynomial(2, 3, 0b011)).toBe(0b1011);
    expect(monicPolynomial(3, 2, 5)).toBe(14);
  });
});

describe("F_q[t] irreducible sieve", () => {
  it("matches the exact irreducible-count formula over F_2 through degree 12", () => {
    const universe = buildPolynomialUniverse(2, 12);
    for (let n = 1; n <= 12; n++) {
      expect(universe.counts[n]).toBe(irreducibleCountFormula(2, n));
      expect(universe.counts[n]).toBe(universe.exactCounts[n]);
    }
  });

  it("matches the exact irreducible-count formula over F_3 through degree 8", () => {
    const universe = buildPolynomialUniverse(3, 8);
    for (let n = 1; n <= 8; n++) {
      expect(universe.counts[n]).toBe(irreducibleCountFormula(3, n));
      expect(universe.counts[n]).toBe(universe.exactCounts[n]);
    }
  });

  it("matches the exact irreducible-count formula over F_4 and F_5", () => {
    for (const [q, maxDegree] of [[4, 6], [5, 6]]) {
      const universe = buildPolynomialUniverse(q, maxDegree);
      for (let n = 1; n <= maxDegree; n++) {
        expect(universe.counts[n]).toBe(irreducibleCountFormula(q, n));
        expect(universe.counts[n]).toBe(universe.exactCounts[n]);
      }
    }
  });

  it("matches the exact irreducible-count formula at the advertised support caps", () => {
    for (const [q, maxDegree] of [[2, 24], [3, 15]]) {
      const universe = buildPolynomialUniverse(q, maxDegree);
      for (let n = 1; n <= maxDegree; n++) {
        expect(universe.counts[n]).toBe(irreducibleCountFormula(q, n));
        expect(universe.counts[n]).toBe(universe.exactCounts[n]);
      }
    }
  }, 90000);

  it("has the expected small irreducibles over F_2", () => {
    const universe = buildPolynomialUniverse(2, 4);
    expect(universe.irreduciblesByDegree[1]).toEqual([0b10, 0b11]);
    expect(universe.irreduciblesByDegree[2]).toEqual([0b111]);
    expect(isMonicIrreducible(0b111, universe)).toBe(true);
    expect(isMonicIrreducible(0b101, universe)).toBe(false);
  });
});

describe("F_q[t] polynomial Mobius", () => {
  it("matches squarefree parity over F_2 in hand-computed examples", () => {
    const universe = buildPolynomialUniverse(2, 4);
    expect(polynomialMobius(1, universe)).toBe(1);
    expect(polynomialMobius(0b10, universe)).toBe(-1); // t
    expect(polynomialMobius(0b11, universe)).toBe(-1); // t + 1
    expect(polynomialMobius(0b110, universe)).toBe(1); // t(t + 1)
    expect(polynomialMobius(0b100, universe)).toBe(0); // t^2
  });

  it("computes Chowla two-point averages by degree", () => {
    const C = chowlaTwoPoint(2, 3, 1);
    expect(C[1]).toBe(1);
    expect(Math.abs(C[2])).toBeLessThanOrEqual(1);
  });
});

describe("F_q[t] twin irreducibles and registry source", () => {
  it("counts ordered twin pairs for shifts 1 and t over F_2", () => {
    const byOne = twinIrreducibleCounts(2, 4, 1);
    const byT = twinIrreducibleCounts(2, 4, 0b10);
    expect(byOne[1]).toBe(2);
    expect(byOne[2]).toBe(0);
    expect(byT[1]).toBe(0);
    expect(byT[2]).toBe(0);
    expect(twinIrreducibleCounts(3, 3, 3)[2]).toBe(1);
  });

  it("computes the polynomial twin singular-series local factors", () => {
    expect(polynomialTwinSingularSeries(2, 4, 1)).toBe(0);
    expect(polynomialTwinSingularSeries(2, 4, 0b10)).toBe(0);
    expect(polynomialTwinSingularSeries(3, 4, 1)).toBeGreaterThan(0);
    expect(polynomialTwinPrediction(3, 4, 1, 4)).toBeGreaterThan(0);
  });

  it("exposes polynomial primes as a registry source", () => {
    const data = SOURCES.polyprimes.gen({ q: 2, deg: 5 });
    const universe = buildPolynomialUniverse(2, 5);
    const total = universe.counts.reduce((a, b) => a + b, 0);
    expect(data.kind).toBe("polyprimes");
    expect(data.n.length).toBe(total);
    expect(data.w[data.w.length - 1]).toBe(5);
    expect(data.stats).toContain("F_2[t]");
  });

  it("keeps registry degree caps aligned with supported finite fields", () => {
    const param = SOURCES.polyprimes.params.find((p) => p.key === "deg");
    expect(param.max).toBe(24);

    const q2 = SOURCES.polyprimes.gen({ q: 2, deg: 24 });
    expect(q2.maxDegree).toBe(24);
    expect(q2.stats).toContain("I_24=698,870");

    const q3 = SOURCES.polyprimes.gen({ q: 3, deg: 24 });
    expect(q3.maxDegree).toBe(15);
    expect(q3.stats).toContain("I_15=956,576");
  });
});
