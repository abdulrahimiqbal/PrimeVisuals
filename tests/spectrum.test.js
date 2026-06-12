// @vitest-environment node

import { describe, expect, it } from "vitest";
import { ZEROS } from "../src/core/zeros.js";
import {
  analysePsiSpectrum,
  fitLogSlope,
  logGrid,
  matchPeaksToTargets,
  sampleStepEvents,
  spectrumFromSamples,
  weightedPowerEventsFromBases,
} from "../scripts/spectrum.mjs";

describe("spectrum step sampling", () => {
  it("samples a weighted staircase inclusively on a log grid", () => {
    const events = {
      x: Float64Array.from([2, 4, 8]),
      w: Float64Array.from([Math.log(2), Math.log(2), Math.log(2)]),
    };
    const grid = logGrid(2, 8, 9);
    const ys = sampleStepEvents(events, grid);
    expect(ys[0]).toBeCloseTo(Math.log(2), 12);
    expect(ys[4]).toBeCloseTo(2 * Math.log(2), 12);
    expect(ys[8]).toBeCloseTo(3 * Math.log(2), 12);
  });

  it("builds sorted prime-power-style events from sorted bases", () => {
    const events = weightedPowerEventsFromBases([2, 3, 5], 30);
    expect(Array.from(events.x)).toEqual([2, 3, 4, 5, 8, 9, 16, 25, 27]);
    const idx = Array.from(events.x).indexOf(8);
    expect(events.w[idx]).toBeCloseTo(Math.log(2), 12);
  });
});

describe("windowed log-frequency spectrum", () => {
  it("detects a synthetic cosine frequency", () => {
    const f0 = 14.134737;
    const uMin = Math.log(10);
    const grid = logGrid(10, Math.exp(uMin + 10), 2048);
    const samples = Float64Array.from(grid.us, (u) => 0.7 * Math.cos(f0 * u + 0.31));
    const spec = spectrumFromSamples(samples, grid, { minFreq: 5, maxFreq: 25, oversample: 10 });
    expect(Math.abs(spec.peaks[0].freq - f0)).toBeLessThan(spec.resolution);
    expect(spec.peaks[0].amplitude).toBeGreaterThan(0.65);
  });

  it("recovers the first six zero frequencies from raw psi data through 1e6", () => {
    const analysis = analysePsiSpectrum({
      xMin: 1e4,
      xMax: 1e6,
      sampleCount: 2048,
      maxFreq: 45,
      oversample: 8,
    });
    const matches = matchPeaksToTargets(analysis.spectrum.peaks, ZEROS, analysis.spectrum.resolution, 6);
    expect(matches.matched).toBe(6);
    expect(matches.spurious).toBe(0);
  }, 20000);
});

describe("finite-range exponent fitting", () => {
  it("fits a log-log slope", () => {
    const points = [10, 20, 40, 80].map((x) => ({ x, y: 3 * Math.pow(x, 0.37) }));
    expect(fitLogSlope(points)).toBeCloseTo(0.37, 10);
  });
});
