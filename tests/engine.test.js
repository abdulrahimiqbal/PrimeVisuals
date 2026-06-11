import { describe, it, expect } from "vitest";
import { parseExpr, evalAst, makeFns, computeLabSeries } from "../src/core/engine.js";
import { integerLabTables } from "../src/core/math.js";

// Shared env and fns used across parser/eval tests
const baseFns = makeFns(null);
const baseEnv = {
  i: [0, 1],
  pi: [Math.PI, 0],
  e: [Math.E, 0],
  a: [1, 0],
  b: [1, 0],
};

// ---------------------------------------------------------------------------
// parseExpr / evalAst — arithmetic
// ---------------------------------------------------------------------------
describe("parseExpr / evalAst — arithmetic", () => {
  it('"1+2*3" → 7 (operator precedence)', () => {
    const [re, im] = evalAst(parseExpr("1+2*3"), baseEnv, baseFns);
    expect(re).toBe(7);
    expect(im).toBe(0);
  });

  it('"(1+2)*3" → 9 (parentheses)', () => {
    const [re, im] = evalAst(parseExpr("(1+2)*3"), baseEnv, baseFns);
    expect(re).toBe(9);
    expect(im).toBe(0);
  });

  it('"2^10" → 1024 (exponentiation)', () => {
    const [re, im] = evalAst(parseExpr("2^10"), baseEnv, baseFns);
    expect(re).toBeCloseTo(1024, 10);
    expect(Math.abs(im)).toBeLessThan(1e-10);
  });

  it('"-3+5" → 2 (unary minus)', () => {
    const [re, im] = evalAst(parseExpr("-3+5"), baseEnv, baseFns);
    expect(re).toBe(2);
    expect(im).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// parseExpr / evalAst — complex arithmetic
// ---------------------------------------------------------------------------
describe("parseExpr / evalAst — complex arithmetic", () => {
  it('"i*i" → [−1, 0] within 1e-12', () => {
    const [re, im] = evalAst(parseExpr("i*i"), baseEnv, baseFns);
    expect(Math.abs(re - (-1))).toBeLessThan(1e-12);
    expect(Math.abs(im)).toBeLessThan(1e-12);
  });

  it('"exp(i*pi)" → [−1, ~0] within 1e-9 (Euler\'s identity)', () => {
    const [re, im] = evalAst(parseExpr("exp(i*pi)"), baseEnv, baseFns);
    expect(Math.abs(re - (-1))).toBeLessThan(1e-9);
    expect(Math.abs(im)).toBeLessThan(1e-9);
  });
});

// ---------------------------------------------------------------------------
// parseExpr — error cases
// ---------------------------------------------------------------------------
describe("parseExpr — parse errors throw", () => {
  it('"1+" throws (trailing operator)', () => {
    expect(() => parseExpr("1+")).toThrow();
  });

  it('"foo bar" throws (two identifiers with no operator)', () => {
    expect(() => parseExpr("foo bar")).toThrow();
  });

  it('")(" throws (mismatched parens)', () => {
    expect(() => parseExpr(")(")).toThrow();
  });

  it('"1 2" throws (two numbers with no operator)', () => {
    expect(() => parseExpr("1 2")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// evalAst — runtime errors
// ---------------------------------------------------------------------------
describe("evalAst — runtime errors", () => {
  it("unknown variable throws", () => {
    expect(() => evalAst(parseExpr("xyz"), baseEnv, baseFns)).toThrow();
  });

  it("unknown function throws", () => {
    expect(() => evalAst(parseExpr("unknown(1)"), baseEnv, baseFns)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// makeFns — table-backed functions
// ---------------------------------------------------------------------------
describe("makeFns — table functions", () => {
  const tab = integerLabTables(100);
  const fns = makeFns(tab);

  it("isprime([7,0]) → [1,0]", () => {
    expect(fns.isprime([7, 0])).toEqual([1, 0]);
  });

  it("isprime([8,0]) → [0,0]", () => {
    expect(fns.isprime([8, 0])).toEqual([0, 0]);
  });

  it("phi([10,0]) → [4,0]", () => {
    expect(fns.phi([10, 0])).toEqual([4, 0]);
  });

  it("mod([7,0],[3,0]) → [1,0]", () => {
    expect(fns.mod([7, 0], [3, 0])).toEqual([1, 0]);
  });

  it("gcd([12,0],[18,0]) → [6,0]", () => {
    expect(fns.gcd([12, 0], [18, 0])).toEqual([6, 0]);
  });
});

// ---------------------------------------------------------------------------
// computeLabSeries
// ---------------------------------------------------------------------------
describe("computeLabSeries", () => {
  it("domain=int, N=100, ex=n, ey=n*n: L=100, xs[9]=10, ys[9]=100", () => {
    const result = computeLabSeries({
      domain: "int",
      N: 100,
      ex: "n",
      ey: "n*n",
      eh: "",
      a: 1,
      b: 1,
    });
    expect(result.L).toBe(100);
    expect(result.xs[9]).toBe(10);
    expect(result.ys[9]).toBe(100);
  });

  it("domain=prime, N=30: L=10 (primes ≤ 30), xs = [2,3,5,7,11,13,17,19,23,29]", () => {
    const result = computeLabSeries({
      domain: "prime",
      N: 30,
      ex: "n",
      ey: "0",
      eh: "",
      a: 1,
      b: 1,
      tMax: 60,
    });
    expect(result.L).toBe(10);
    expect(Array.from(result.xs)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  });

  it("domain=real, tMax=10, ex=t, ey=sin(t): L=1200, ys[last] ≈ sin(10)", () => {
    const result = computeLabSeries({
      domain: "real",
      tMax: 10,
      ex: "t",
      ey: "sin(t)",
      eh: "",
      a: 1,
      b: 1,
      N: 100,
    });
    expect(result.L).toBe(1200);
    expect(result.ys[result.L - 1]).toBeCloseTo(Math.sin(10), 10);
  });
});
