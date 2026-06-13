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

  it("g2 and G2 expose the dyadic exponential Mobius atom and sum", () => {
    expect(fns.g2([12, 0])[0]).toBeCloseTo(0.5, 14);
    expect(fns.G2([12, 0])[0]).toBeCloseTo(tab.G2[12], 14);
  });

  it("l2 and L2 expose the dyadic exponential von Mangoldt atom and sum", () => {
    expect(fns.l2([12, 0])[0]).toBeCloseTo(Math.log(3) / 2, 14);
    expect(fns.L2([12, 0])[0]).toBeCloseTo(tab.L2[12], 14);
  });

  it("row visibility functions expose the lcm-row survivor table", () => {
    expect(fns.rowvis([11, 0])[0]).toBe(1);
    expect(fns.rowvis([49, 0])[0]).toBe(0);
    expect(fns.rowvis([11, 0], [10, 0])[0]).toBe(1);
    expect(fns.rowgap([13, 0])[0]).toBe(2);
    expect(fns.rowrun([12, 0])[0]).toBe(1);
    expect(fns.rowcount([13, 0])[0]).toBe(3);
  });

  it("rough interval functions expose rough witness counts and offsets", () => {
    expect(fns.roughcount([3, 0], [2, 0])[0]).toBe(1);
    expect(fns.roughfirst([3, 0], [2, 0])[0]).toBe(1);
    expect(fns.roughcount([7, 0], [4, 0])[0]).toBe(0);
    expect(fns.roughfirst([7, 0], [4, 0])[0]).toBe(0);
  });

  it("Farey functions expose insertion rows and product base surplus", () => {
    expect(fns.fareynew([6, 0])[0]).toBe(2);
    expect(fns.fareydef([6, 0])[0]).toBe(3);
    expect(fns.fareyord([7, 0], [2, 0])[0]).toBe(-1);
    expect(fns.fareyord([8, 0], [3, 0])[0]).toBe(-1);
  });

  it("continued-fraction functions expose bounded-denominator tables", () => {
    expect(fns.cf2den([5, 0])[0]).toBe(1);
    expect(fns.cf2den([6, 0])[0]).toBe(0);
    expect(fns.cf2num([5, 0])[0]).toBe(2);
    expect(fns.cf2num([6, 0])[0]).toBe(0);
    expect(fns.cfheight([6, 0])[0]).toBe(5);
    expect(fns.cfheight([20, 0])[0]).toBe(4);
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

  it("domain=int can evaluate g2(n) and G2(n)", () => {
    const result = computeLabSeries({
      domain: "int",
      N: 12,
      ex: "n",
      ey: "g2(n)+G2(n)",
      eh: "",
      a: 1,
      b: 1,
    });
    const tab = integerLabTables(12);
    expect(result.ys[11]).toBeCloseTo(tab.g2[12] + tab.G2[12], 14);
  });

  it("domain=int can evaluate l2(n) and L2(n)", () => {
    const result = computeLabSeries({
      domain: "int",
      N: 12,
      ex: "n",
      ey: "l2(n)+L2(n)",
      eh: "",
      a: 1,
      b: 1,
    });
    const tab = integerLabTables(12);
    expect(result.ys[11]).toBeCloseTo(tab.l2[12] + tab.L2[12], 14);
  });

  it("domain=int can evaluate row visibility functions", () => {
    const result = computeLabSeries({
      domain: "int",
      N: 100,
      ex: "n",
      ey: "rowvis(n)+rowvis(n,a)+rowgap(n)+rowrun(n)+rowcount(n)",
      eh: "",
      a: 10,
      b: 1,
    });
    const tab = integerLabTables(100);
    expect(result.ys[12]).toBe(
      tab.rowvis[13] + 1 + tab.rowgap[13] + tab.rowrun[13] + tab.rowcount[13],
    );
  });

  it("domain=int can evaluate rough interval witness functions", () => {
    const result = computeLabSeries({
      domain: "int",
      N: 60,
      ex: "n",
      ey: "roughcount(n,a)+roughfirst(n,a)",
      eh: "",
      a: 6,
      b: 1,
    });
    expect(result.ys[46]).toBe(3);
  });

  it("domain=int can evaluate Farey insertion and product functions", () => {
    const result = computeLabSeries({
      domain: "int",
      N: 12,
      ex: "n",
      ey: "fareynew(n)+fareydef(n)+fareyord(n,a)",
      eh: "",
      a: 3,
      b: 1,
    });
    const tab = integerLabTables(12);
    expect(result.ys[7]).toBe(tab.fareynew[8] + tab.fareydef[8] - 1);
  });

  it("domain=int can evaluate bounded continued-fraction functions", () => {
    const result = computeLabSeries({
      domain: "int",
      N: 20,
      ex: "n",
      ey: "cf2den(n)+cf2num(n)+cfheight(n)",
      eh: "",
      a: 3,
      b: 1,
    });
    expect(result.ys[4]).toBe(5);
    expect(result.ys[5]).toBe(5);
    expect(result.ys[19]).toBe(4);
  });
});
