import { describe, it, expect } from "vitest";
import { seriesMetrics } from "../src/core/metrics.js";

describe("seriesMetrics", () => {
  it("perfect line y=2x+1 over x=0..99", () => {
    const N = 100;
    const xs = new Float64Array(N);
    const ys = new Float64Array(N);
    for (let i = 0; i < N; i++) { xs[i] = i; ys[i] = 2 * i + 1; }
    const m = seriesMetrics(xs, ys);
    expect(m.linearity).toBeGreaterThan(0.999999);
    expect(Math.abs(m.slope - 2)).toBeLessThan(1e-9);
    expect(Math.abs(m.intercept - 1)).toBeLessThan(1e-9);
    expect(m.monotonicity).toBe(1);
    expect(m.zeroCrossings).toBe(0); // all y > 0
    expect(m.finiteFrac).toBe(1);
  });

  it("constant series: linearity===1, flatness near 0, monotonicity 0", () => {
    const N = 50;
    const xs = new Float64Array(N);
    const ys = new Float64Array(N);
    for (let i = 0; i < N; i++) { xs[i] = i; ys[i] = 7; }
    const m = seriesMetrics(xs, ys);
    expect(m.linearity).toBe(1);
    expect(m.flatness).toBeLessThan(1e-9);
    expect(m.monotonicity).toBe(0);
  });

  it("sin(x) over 0..20 in steps of 0.05: oscillatory", () => {
    const step = 0.05;
    const N = Math.round(20 / step) + 1;
    const xs = new Float64Array(N);
    const ys = new Float64Array(N);
    for (let i = 0; i < N; i++) { xs[i] = i * step; ys[i] = Math.sin(xs[i]); }
    const m = seriesMetrics(xs, ys);
    expect(m.linearity).toBeLessThan(0.2);
    expect(m.zeroCrossings).toBeGreaterThanOrEqual(5);
    expect(Math.abs(m.monotonicity)).toBeLessThan(0.2);
  });

  it("series with NaN/Infinity mixed in: finiteFrac reflects finite fraction", () => {
    const xs = new Float64Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const ys = new Float64Array([1, 2, NaN, 4, Infinity, 6, 7, 8, 9, 10]);
    // 8 out of 10 are finite (NaN and Infinity excluded)
    const m = seriesMetrics(xs, ys);
    expect(m.finiteFrac).toBeCloseTo(8 / 10, 10);
    expect(Number.isFinite(m.linearity)).toBe(true);
    expect(Number.isFinite(m.slope)).toBe(true);
    expect(Number.isFinite(m.intercept)).toBe(true);
    expect(Number.isFinite(m.flatness)).toBe(true);
    expect(Number.isFinite(m.zeroCrossings)).toBe(true);
    expect(Number.isFinite(m.monotonicity)).toBe(true);
  });

  it("fewer than 3 finite points: returns n<3 and zeroed metrics without throwing", () => {
    const xs = new Float64Array([0, 1, 2]);
    const ys = new Float64Array([1, NaN, NaN]);
    const m = seriesMetrics(xs, ys);
    expect(m.n).toBeLessThan(3);
    expect(m.linearity).toBe(0);
    expect(m.slope).toBe(0);
    expect(m.intercept).toBe(0);
    expect(m.flatness).toBe(0);
    expect(m.zeroCrossings).toBe(0);
    expect(m.monotonicity).toBe(0);
    expect(Number.isFinite(m.finiteFrac)).toBe(true);
  });
});
