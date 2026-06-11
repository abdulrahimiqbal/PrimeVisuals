import { describe, it, expect } from "vitest";
import {
  sieve,
  primesUpTo,
  mobiusUpTo,
  ulamXY,
  zetaHalf,
  zetaC,
  integerLabTables,
  liUpTo,
  primePowersUpTo,
  psiExplicit,
  cramerPrimes,
} from "../src/core/math.js";

// ---------------------------------------------------------------------------
// sieve / primesUpTo
// ---------------------------------------------------------------------------
describe("sieve / primesUpTo", () => {
  it("primes up to 30 equal [2,3,5,7,11,13,17,19,23,29]", () => {
    expect(primesUpTo(30)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  });

  it("π(10000) === 1229", () => {
    expect(primesUpTo(10000).length).toBe(1229);
  });

  it("sieve marks composites as 0 and primes as 1", () => {
    const s = sieve(20);
    expect(s[2]).toBe(1);
    expect(s[4]).toBe(0);
    expect(s[19]).toBe(1);
    expect(s[20]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// mobiusUpTo
// ---------------------------------------------------------------------------
describe("mobiusUpTo", () => {
  it("individual mu values are correct", () => {
    const mu = mobiusUpTo(30);
    expect(mu[1]).toBe(1);
    expect(mu[2]).toBe(-1);
    expect(mu[4]).toBe(0);   // 4 = 2^2, square factor
    expect(mu[6]).toBe(1);   // 6 = 2*3, two distinct primes
    expect(mu[30]).toBe(-1); // 30 = 2*3*5, three distinct primes
    expect(mu[12]).toBe(0);  // 12 = 2^2*3, square factor
  });

  it("Mertens sum M(10000) = −23", () => {
    const mu = mobiusUpTo(10000);
    let sum = 0;
    for (let i = 1; i <= 10000; i++) sum += mu[i];
    expect(sum).toBe(-23);
  });
});

// ---------------------------------------------------------------------------
// ulamXY
// ---------------------------------------------------------------------------
describe("ulamXY", () => {
  it("n=1 maps to [0, 0]", () => {
    expect(ulamXY(1)).toEqual([0, 0]);
  });

  it("spiral is a bijection for n in 1..10000 (all coordinates distinct)", () => {
    const seen = new Set();
    for (let n = 1; n <= 10000; n++) {
      const [x, y] = ulamXY(n);
      const key = `${x},${y}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
    expect(seen.size).toBe(10000);
  });

  it("consecutive n are adjacent (Chebyshev distance 1) for n in 1..10000", () => {
    for (let n = 1; n <= 9999; n++) {
      const [x1, y1] = ulamXY(n);
      const [x2, y2] = ulamXY(n + 1);
      const dist = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
      expect(dist).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// zetaHalf
// ---------------------------------------------------------------------------
describe("zetaHalf", () => {
  it("ζ(1/2) ≈ −1.4603545 (within 1e-3 on real part, imag ≈ 0)", () => {
    const [re, im] = zetaHalf(0);
    expect(re).toBeCloseTo(-1.4603545088, 3);
    expect(Math.abs(im)).toBeLessThan(1e-3);
  });

  it("|ζ(1/2 + i·14.1347)| < 0.01 (first non-trivial zero)", () => {
    const [re, im] = zetaHalf(14.1347);
    expect(Math.hypot(re, im)).toBeLessThan(0.01);
  });

  it("|ζ(1/2 + i·20)| > 0.5 (not near a zero)", () => {
    const [re, im] = zetaHalf(20);
    expect(Math.hypot(re, im)).toBeGreaterThan(0.5);
  });
});

// ---------------------------------------------------------------------------
// zetaC
// ---------------------------------------------------------------------------
describe("zetaC", () => {
  it("zetaC(2, 0) ≈ [π²/6, 0] within 1e-3", () => {
    const [re, im] = zetaC(2, 0);
    expect(re).toBeCloseTo(Math.PI * Math.PI / 6, 3);
    expect(Math.abs(im)).toBeLessThan(1e-3);
  });

  it("zetaC(0.5, 14.1347) magnitude < 0.01 (first zero)", () => {
    const [re, im] = zetaC(0.5, 14.1347);
    expect(Math.hypot(re, im)).toBeLessThan(0.01);
  });
});

// ---------------------------------------------------------------------------
// integerLabTables
// ---------------------------------------------------------------------------
describe("integerLabTables(100)", () => {
  const tab = integerLabTables(100);

  it("phi[10] = 4", () => expect(tab.phi[10]).toBe(4));
  it("phi[100] = 40", () => expect(tab.phi[100]).toBe(40));
  it("tau[12] = 6", () => expect(tab.tau[12]).toBe(6));
  it("tau[100] = 9", () => expect(tab.tau[100]).toBe(9));
  it("rad[12] = 6", () => expect(tab.rad[12]).toBe(6));
  it("rad[100] = 10", () => expect(tab.rad[100]).toBe(10));
  it("omega[12] = 2", () => expect(tab.omega[12]).toBe(2));
  it("bigomega[12] = 3", () => expect(tab.bigomega[12]).toBe(3));
  it("pic[100] = 25", () => expect(tab.pic[100]).toBe(25));
  it("gap[7] = 4 (next prime after 7 is 11)", () => expect(tab.gap[7]).toBe(4));
  it("mertens[100] = 1", () => expect(tab.mertens[100]).toBe(1));
});

// ---------------------------------------------------------------------------
// liUpTo
// ---------------------------------------------------------------------------
describe("liUpTo", () => {
  it("Li(100) (offset from 2) ≈ 29.081 within 0.05 when fed dense xs", () => {
    // Pass integers 2..100 so the accumulator stays accurate
    const xs = Array.from({ length: 99 }, (_, i) => i + 2); // [2, 3, ..., 100]
    const li = liUpTo(xs);
    // li[97] corresponds to x = 99; li[98] is x = 100
    const li100 = li[li.length - 1];
    expect(Math.abs(li100 - 29.081)).toBeLessThan(0.05);
  });

  it("is monotone increasing over xs = 2..100", () => {
    const xs = Array.from({ length: 99 }, (_, i) => i + 2);
    const li = liUpTo(xs);
    for (let i = 1; i < li.length; i++) {
      expect(li[i]).toBeGreaterThanOrEqual(li[i - 1]);
    }
  });
});

// ---------------------------------------------------------------------------
// primePowersUpTo
// ---------------------------------------------------------------------------
describe("primePowersUpTo", () => {
  const pp50 = primePowersUpTo(50);

  it("includes x=32 with weight log 2 (within 1e-12)", () => {
    const xs = Array.from(pp50.x);
    const idx = xs.indexOf(32);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(Math.abs(pp50.w[idx] - Math.log(2))).toBeLessThan(1e-12);
  });

  it("includes x=49 with weight log 7 (within 1e-12)", () => {
    const xs = Array.from(pp50.x);
    const idx = xs.indexOf(49);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(Math.abs(pp50.w[idx] - Math.log(7))).toBeLessThan(1e-12);
  });

  it("sorted ascending", () => {
    const xs = Array.from(pp50.x);
    for (let i = 1; i < xs.length; i++) {
      expect(xs[i]).toBeGreaterThanOrEqual(xs[i - 1]);
    }
  });

  it("ψ(50) = sum of all weights ≈ 49.49 within 0.3", () => {
    // true ψ(50): sum of log p over prime powers p^k ≤ 50
    let sum = 0;
    for (let i = 0; i < pp50.w.length; i++) sum += pp50.w[i];
    // The actual computed value is ~49.485
    expect(Math.abs(sum - 49.485)).toBeLessThan(0.3);
  });
});

// ---------------------------------------------------------------------------
// psiExplicit
// ---------------------------------------------------------------------------
describe("psiExplicit", () => {
  it("with K=29 bundled zeros, psiExplicit(100, 29) is within 5 of true ψ(100) ≈ 94.045", () => {
    const trueValue = 94.0453112293574;
    const approx = psiExplicit(100, 29);
    expect(Math.abs(approx - trueValue)).toBeLessThan(5);
  });

  it("psiExplicit(100, 0) equals the smooth part: 100 − log(2π) − ½·log(1 − 100⁻²)", () => {
    const smooth = 100 - Math.log(2 * Math.PI) - 0.5 * Math.log(1 - 1 / (100 * 100));
    const result = psiExplicit(100, 0);
    expect(Math.abs(result - smooth)).toBeLessThan(1e-10);
  });
});

// ---------------------------------------------------------------------------
// cramerPrimes
// ---------------------------------------------------------------------------
describe("cramerPrimes", () => {
  it("is deterministic: two calls with the same seed give identical arrays", () => {
    const c1 = cramerPrimes(100000, 12345);
    const c2 = cramerPrimes(100000, 12345);
    expect(c1).toEqual(c2);
  });

  it("different seeds produce different arrays", () => {
    const c1 = cramerPrimes(100000, 12345);
    const c2 = cramerPrimes(100000, 99999);
    // At least some elements should differ
    const same = c1.length === c2.length && c1.every((v, i) => v === c2[i]);
    expect(same).toBe(false);
  });

  it("count for N=100000 is within 25% of π(100000) = 9592", () => {
    const c = cramerPrimes(100000, 12345);
    expect(c.length).toBeGreaterThanOrEqual(Math.floor(9592 * 0.75));
    expect(c.length).toBeLessThanOrEqual(Math.ceil(9592 * 1.25));
  });

  it("always starts with 2 and 3", () => {
    const c = cramerPrimes(100000, 12345);
    expect(c[0]).toBe(2);
    expect(c[1]).toBe(3);
  });

  it("no member after index 1 is divisible by 2 or 3", () => {
    const c = cramerPrimes(100000, 12345);
    for (let i = 2; i < c.length; i++) {
      expect(c[i] % 2).not.toBe(0);
      expect(c[i] % 3).not.toBe(0);
    }
  });
});
