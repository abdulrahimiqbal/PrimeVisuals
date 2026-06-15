import { describe, expect, it } from "vitest";
import { computeLabSeries } from "../src/core/engine.js";
import { integerLabTables } from "../src/core/math.js";

describe("prime predecessor Mobius sum", () => {
  it("matches hand-computed values through 20", () => {
    const { pmuprev } = integerLabTables(20);
    const expected = {
      1: 0,
      2: 1,
      3: 0,
      5: 0,
      7: 1,
      11: 2,
      13: 2,
      17: 2,
      19: 2,
      20: 2,
    };
    for (const [n, value] of Object.entries(expected)) {
      expect(pmuprev[Number(n)]).toBe(value);
    }
  });

  it("exposes pmuprev to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "pmuprev(n)" });
    expect(series.ys[1]).toBe(1);
    expect(series.ys[10]).toBe(2);
    expect(series.ys[19]).toBe(2);
  });

  it("computes the centered predecessor-Mobius gap residual", () => {
    const { pmugapres } = integerLabTables(20);
    const expected =
      (1 - Math.log(2)) -
      (2 - Math.log(3)) +
      (4 - Math.log(7)) +
      (2 - Math.log(11));
    expect(pmugapres[1]).toBe(0);
    expect(pmugapres[2]).toBeCloseTo(1 - Math.log(2), 12);
    expect(pmugapres[11]).toBeCloseTo(expected, 12);
    expect(pmugapres[20]).toBeCloseTo(expected, 12);
  });

  it("exposes pmugapres to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "pmugapres(n)" });
    expect(series.ys[0]).toBe(0);
    expect(series.ys[1]).toBeCloseTo(1 - Math.log(2), 12);
    expect(series.ys[10]).toBeCloseTo(1 - Math.log(2) - (2 - Math.log(3)) + (4 - Math.log(7)) + (2 - Math.log(11)), 12);
    expect(series.ys[19]).toBeCloseTo(series.ys[10], 12);
  });

  it("computes the squarefree rate of prime predecessors", () => {
    const { psqprevmean } = integerLabTables(20);
    expect(psqprevmean[1]).toBe(0);
    expect(psqprevmean[2]).toBe(1);
    expect(psqprevmean[3]).toBe(1);
    expect(psqprevmean[5]).toBeCloseTo(2 / 3, 12);
    expect(psqprevmean[11]).toBeCloseTo(4 / 5, 12);
    expect(psqprevmean[20]).toBeCloseTo(4 / 8, 12);
  });

  it("exposes psqprevmean to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "psqprevmean(n)" });
    expect(series.ys[0]).toBe(0);
    expect(series.ys[1]).toBe(1);
    expect(series.ys[10]).toBeCloseTo(4 / 5, 12);
    expect(series.ys[19]).toBeCloseTo(1 / 2, 12);
  });

  it("computes large-squarefree-tail gap covariance", () => {
    const { sqtailgapcov } = integerLabTables(20);
    const smallSquareProduct = (1 - 1 / 2) * (1 - 1 / 6) * (1 - 1 / 20) * (1 - 1 / 42);
    const tailSquarefreeExpectation = 0.373955838964 / smallSquareProduct;
    const weight = 1 - tailSquarefreeExpectation;
    const z = (p, g) => g / Math.log(p) - 1;
    const through3 = weight * (z(2, 1) + z(3, 2)) / 2;
    const through11 = weight * (z(2, 1) + z(3, 2) + z(7, 4) + z(11, 2)) / 4;
    expect(sqtailgapcov[1]).toBe(0);
    expect(sqtailgapcov[2]).toBeCloseTo(weight * z(2, 1), 12);
    expect(sqtailgapcov[3]).toBeCloseTo(through3, 12);
    expect(sqtailgapcov[5]).toBeCloseTo(through3, 12);
    expect(sqtailgapcov[11]).toBeCloseTo(through11, 12);
    expect(sqtailgapcov[20]).toBeCloseTo(through11, 12);
  });

  it("exposes sqtailgapcov to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "sqtailgapcov(n)" });
    expect(series.ys[0]).toBe(0);
    expect(series.ys[1]).toBeCloseTo(integerLabTables(20).sqtailgapcov[2], 12);
    expect(series.ys[19]).toBeCloseTo(integerLabTables(20).sqtailgapcov[20], 12);
  });

  it("computes omega-predecessor gap covariance", () => {
    const { oprevgapcov } = integerLabTables(20);
    const omega = (n) => {
      let m = n, count = 0;
      for (let p = 2; p * p <= m; p++) {
        if (m % p !== 0) continue;
        count++;
        while (m % p === 0) m = Math.floor(m / p);
      }
      return m > 1 ? count + 1 : count;
    };
    const value = (p, g) => (omega(p - 1) - Math.log(Math.log(p))) * (g / Math.log(p) - 1);
    const through5 = (value(3, 2) + value(5, 2)) / 2;
    const through17 = [value(3, 2), value(5, 2), value(7, 4), value(11, 2), value(13, 4), value(17, 2)]
      .reduce((a, b) => a + b, 0) / 6;
    expect(oprevgapcov[1]).toBe(0);
    expect(oprevgapcov[2]).toBe(0);
    expect(oprevgapcov[3]).toBeCloseTo(value(3, 2), 12);
    expect(oprevgapcov[5]).toBeCloseTo(through5, 12);
    expect(oprevgapcov[20]).toBeCloseTo(through17, 12);
  });

  it("exposes oprevgapcov to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "oprevgapcov(n)" });
    expect(series.ys[0]).toBe(0);
    expect(series.ys[2]).toBeCloseTo(integerLabTables(20).oprevgapcov[3], 12);
    expect(series.ys[19]).toBeCloseTo(integerLabTables(20).oprevgapcov[20], 12);
  });

  it("computes the square-root phase prime residual", () => {
    const { sqrtphaseres } = integerLabTables(5);
    const phase = (x) => Math.cos(2 * Math.PI * Math.sqrt(x));
    const main25 = phase(2.5) / Math.log(2.5);
    const main35 = phase(3.5) / Math.log(3.5);
    const main45 = phase(4.5) / Math.log(4.5);
    expect(sqrtphaseres[1]).toBe(0);
    expect(sqrtphaseres[2]).toBeCloseTo(phase(2), 12);
    expect(sqrtphaseres[3]).toBeCloseTo(phase(2) + phase(3) - main25, 12);
    expect(sqrtphaseres[4]).toBeCloseTo(phase(2) + phase(3) - main25 - main35, 12);
    expect(sqrtphaseres[5]).toBeCloseTo(phase(2) + phase(3) + phase(5) - main25 - main35 - main45, 12);
  });

  it("exposes sqrtphaseres to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "sqrtphaseres(n)" });
    expect(series.ys[0]).toBe(0);
    expect(series.ys[1]).toBeCloseTo(integerLabTables(20).sqrtphaseres[2], 12);
    expect(series.ys[19]).toBeCloseTo(integerLabTables(20).sqrtphaseres[20], 12);
  });

  it("computes the adjacent Mobius shift sum", () => {
    const { muchowla1 } = integerLabTables(12);
    expect(muchowla1[1]).toBe(0);
    expect(muchowla1[2]).toBe(-1);
    expect(muchowla1[3]).toBe(0);
    expect(muchowla1[5]).toBe(0);
    expect(muchowla1[6]).toBe(-1);
    expect(muchowla1[7]).toBe(-2);
    expect(muchowla1[11]).toBe(-3);
    expect(muchowla1[12]).toBe(-3);
  });

  it("exposes muchowla1 to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 12, ex: "n", ey: "muchowla1(n)" });
    expect(series.ys[0]).toBe(0);
    expect(series.ys[1]).toBe(-1);
    expect(series.ys[10]).toBe(-3);
    expect(series.ys[11]).toBe(-3);
  });

  it("computes adjacent normalized gap-product means", () => {
    const { gapac1mean } = integerLabTables(20);
    const z = (p, g) => g / Math.log(p) - 1;
    const products = [
      z(2, 1) * z(3, 2),
      z(3, 2) * z(5, 2),
      z(5, 2) * z(7, 4),
      z(7, 4) * z(11, 2),
      z(11, 2) * z(13, 4),
      z(13, 4) * z(17, 2),
    ];
    const meanThrough13 = products.reduce((a, b) => a + b, 0) / products.length;
    expect(gapac1mean[1]).toBe(0);
    expect(gapac1mean[2]).toBeCloseTo(products[0], 12);
    expect(gapac1mean[13]).toBeCloseTo(meanThrough13, 12);
    expect(gapac1mean[20]).toBeCloseTo(meanThrough13, 12);
  });

  it("exposes gapac1mean to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "gapac1mean(n)" });
    expect(series.ys[0]).toBe(0);
    expect(series.ys[1]).toBeCloseTo((1 / Math.log(2) - 1) * (2 / Math.log(3) - 1), 12);
    expect(series.ys[19]).toBeCloseTo(integerLabTables(20).gapac1mean[20], 12);
  });

  it("computes normalized centered gap second moments", () => {
    const { gapz2mean } = integerLabTables(20);
    const z2 = (p, g) => (g / Math.log(p) - 1) ** 2;
    const values = [
      z2(2, 1),
      z2(3, 2),
      z2(5, 2),
      z2(7, 4),
      z2(11, 2),
      z2(13, 4),
      z2(17, 2),
    ];
    const meanThrough13 = values.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
    const meanThrough20 = values.reduce((a, b) => a + b, 0) / values.length;
    expect(gapz2mean[1]).toBe(0);
    expect(gapz2mean[2]).toBeCloseTo(values[0], 12);
    expect(gapz2mean[13]).toBeCloseTo(meanThrough13, 12);
    expect(gapz2mean[20]).toBeCloseTo(meanThrough20, 12);
  });

  it("exposes gapz2mean to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "gapz2mean(n)" });
    expect(series.ys[0]).toBe(0);
    expect(series.ys[1]).toBeCloseTo((1 / Math.log(2) - 1) ** 2, 12);
    expect(series.ys[19]).toBeCloseTo(integerLabTables(20).gapz2mean[20], 12);
  });

  it("counts prime gaps with no rough interior witness", () => {
    const { roughmiss } = integerLabTables(20);
    expect(roughmiss[1]).toBe(0);
    expect(roughmiss[2]).toBe(1);
    expect(roughmiss[3]).toBe(1);
    expect(roughmiss[7]).toBe(2);
    expect(roughmiss[13]).toBe(3);
    expect(roughmiss[20]).toBe(3);
  });

  it("exposes roughmiss to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "roughmiss(n)" });
    expect(series.ys[0]).toBe(0);
    expect(series.ys[1]).toBe(1);
    expect(series.ys[12]).toBe(3);
    expect(series.ys[19]).toBe(3);
  });

  it("computes the W=210 compensated Chebyshev residual", () => {
    const { theta210res } = integerLabTables(20);
    const scale = 210 / 48;
    const through13 = Math.log(11) - scale + Math.log(13) - scale;
    const through19 = through13 + Math.log(17) - scale + Math.log(19) - scale;
    expect(theta210res[10]).toBe(0);
    expect(theta210res[11]).toBeCloseTo(Math.log(11) - scale, 12);
    expect(theta210res[12]).toBeCloseTo(Math.log(11) - scale, 12);
    expect(theta210res[13]).toBeCloseTo(through13, 12);
    expect(theta210res[20]).toBeCloseTo(through19, 12);
  });

  it("exposes theta210res to lab formulas", () => {
    const series = computeLabSeries({ domain: "int", N: 20, ex: "n", ey: "theta210res(n)" });
    expect(series.ys[9]).toBe(0);
    expect(series.ys[10]).toBeCloseTo(Math.log(11) - 210 / 48, 12);
    expect(series.ys[19]).toBeCloseTo(integerLabTables(20).theta210res[20], 12);
  });
});
