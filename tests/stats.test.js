import { describe, it, expect } from "vitest";
import { primesUpTo } from "../src/core/math.js";
import {
  histogram,
  wignerGUE,
  residueChi,
  expSum,
  expSumZ,
  autocorr,
  contFrac,
  normalizedSpacings,
} from "../src/core/stats.js";

// ---------------------------------------------------------------------------
// histogram
// ---------------------------------------------------------------------------
describe("histogram", () => {
  it("counts sum to 1 for non-empty input", () => {
    const values = Array.from({ length: 1000 }, (_, i) => i / 10);
    const { counts } = histogram(values, 20, 0, 100);
    let sum = 0;
    for (const c of counts) sum += c;
    expect(Math.abs(sum - 1)).toBeLessThan(1e-12);
  });

  it("returns n=0 and all-zero counts for empty input", () => {
    const { counts, n } = histogram([], 10, 0, 1);
    expect(n).toBe(0);
    let sum = 0;
    for (const c of counts) sum += c;
    expect(sum).toBe(0);
  });

  it("clamps out-of-range values to edge bins", () => {
    // all values below lo → first bin; all above hi → last bin
    const { counts } = histogram([-5, -1, 200, 300], 4, 0, 100);
    let sum = 0;
    for (const c of counts) sum += c;
    expect(Math.abs(sum - 1)).toBeLessThan(1e-12);
  });
});

// ---------------------------------------------------------------------------
// wignerGUE
// ---------------------------------------------------------------------------
describe("wignerGUE", () => {
  it("integrates to ≈1 over [0,4] (trapezoid, tol 0.02)", () => {
    const N = 4000;
    const lo = 0, hi = 4;
    const h = (hi - lo) / N;
    let integral = 0.5 * wignerGUE(lo) + 0.5 * wignerGUE(hi);
    for (let i = 1; i < N; i++) integral += wignerGUE(lo + i * h);
    integral *= h;
    expect(Math.abs(integral - 1)).toBeLessThan(0.02);
  });

  it("has mean ≈1 (tol 0.03)", () => {
    const N = 4000;
    const lo = 0, hi = 4;
    const h = (hi - lo) / N;
    let mean = 0.5 * (0 * wignerGUE(0)) + 0.5 * (hi * wignerGUE(hi));
    for (let i = 1; i < N; i++) {
      const s = lo + i * h;
      mean += s * wignerGUE(s);
    }
    mean *= h;
    expect(Math.abs(mean - 1)).toBeLessThan(0.03);
  });
});

// ---------------------------------------------------------------------------
// residueChi
// ---------------------------------------------------------------------------
describe("residueChi", () => {
  const primes100k = primesUpTo(100000);

  it("q=4: classes 1 and 3 roughly balanced (each count within 5% of expected)", () => {
    const res = residueChi(primes100k, 4);
    const byR = Object.fromEntries(res.classes.map(c => [c.r, c.count]));
    const exp = res.expected;
    expect(Math.abs(byR[1] - exp) / exp).toBeLessThan(0.05);
    expect(Math.abs(byR[3] - exp) / exp).toBeLessThan(0.05);
  });

  it("q=4: z < 3", () => {
    const res = residueChi(primes100k, 4);
    expect(Math.abs(res.z)).toBeLessThan(3);
  });

  it("q=8 has φ(8)=4 coprime classes", () => {
    const res = residueChi(primes100k, 8);
    expect(res.classes.length).toBe(4);
    // classes should be 1,3,5,7
    const rs = res.classes.map(c => c.r).sort((a, b) => a - b);
    expect(rs).toEqual([1, 3, 5, 7]);
  });
});

// ---------------------------------------------------------------------------
// expSum / expSumZ
// ---------------------------------------------------------------------------
describe("expSum / expSumZ", () => {
  const primes100k = primesUpTo(100000);

  it("α=2π/3: z > 5 (strong peak because cube-root-of-unity classes don't cancel)", () => {
    const alpha = (2 * Math.PI) / 3;
    const z = expSumZ(expSum(primes100k, alpha));
    expect(z).toBeGreaterThan(5);
  });

  it("generic irrational α=1.234567: |z| < 5", () => {
    const z = expSumZ(expSum(primes100k, 1.234567));
    expect(Math.abs(z)).toBeLessThan(5);
  });
});

// ---------------------------------------------------------------------------
// contFrac
// ---------------------------------------------------------------------------
describe("contFrac", () => {
  it("contains convergent {p:22,q:7} for π", () => {
    const cvs = contFrac(Math.PI, 1000);
    const hit = cvs.find(c => c.p === 22 && c.q === 7);
    expect(hit).toBeDefined();
  });

  it("contains convergent {p:355,q:113} for π", () => {
    const cvs = contFrac(Math.PI, 1000);
    const hit = cvs.find(c => c.p === 355 && c.q === 113);
    expect(hit).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// autocorr
// ---------------------------------------------------------------------------
describe("autocorr", () => {
  it("i.i.d. pseudo-random series (LCG, n=5000): all |z| < 4 for lags 1..10", () => {
    // Seeded LCG
    let seed = 0x12345678;
    const lcg = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 0x100000000; };
    const series = Array.from({ length: 5000 }, () => lcg());
    const zs = autocorr(series, 10);
    for (let lag = 1; lag <= 10; lag++) {
      expect(Math.abs(zs[lag])).toBeLessThan(4);
    }
  });
});

// ---------------------------------------------------------------------------
// normalizedSpacings
// ---------------------------------------------------------------------------
describe("normalizedSpacings", () => {
  it("mean of normalized spacings is ≈1", () => {
    const primes = primesUpTo(1000);
    const ns = normalizedSpacings(primes);
    let sum = 0;
    for (const v of ns) sum += v;
    const mean = sum / ns.length;
    expect(Math.abs(mean - 1)).toBeLessThan(1e-12);
  });
});
