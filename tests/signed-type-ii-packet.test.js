import { describe, expect, it } from "vitest";
import {
  balancedVaughanPacketAudit,
  completePacketAudit,
  finiteLocalMangoldtPeriod,
  finiteLocalMangoldtTable,
  localCharacterPacketCertificate,
  packetTentWeight,
} from "../src/core/signedTypeIIPacket.js";

describe("signed Type-II packet survival audit", () => {
  it("gives the triangular packet mass and endpoints", () => {
    const H = 9;
    let mass = 0;
    for (let h = 1; h < 2 * H; h++) mass += packetTentWeight(h, H);
    expect(packetTentWeight(0, H)).toBe(0);
    expect(packetTentWeight(H, H)).toBe(1);
    expect(packetTentWeight(2 * H, H)).toBe(0);
    expect(mass).toBeCloseTo(H, 14);
  });

  it("has exact zero mean and exact Ramanujan/local Euler correlations", () => {
    const period = finiteLocalMangoldtPeriod(5);
    const mean = period.values.reduce((sum, value) => sum + value, 0) / period.modulus;
    expect(period.modulus).toBe(30);
    expect(mean).toBeCloseTo(0, 14);

    const certificate = localCharacterPacketCertificate(5, 11);
    expect(certificate.zeroCoefficient.normSquared).toBeLessThan(1e-28);
    expect(certificate.packetIdentityError).toBeCloseTo(0, 11);
    expect(certificate.eulerProductMaxError).toBeLessThan(1e-12);
  });

  it("evaluates large local cutoffs without allocating their primorial period", () => {
    const table = finiteLocalMangoldtTable(256, 47);
    expect(table.modulus).toBeNull();
    expect(table.values).toHaveLength(257);
    expect(table.values[47]).toBe(-1);
    expect(table.values[53]).toBeCloseTo(table.scale - 1, 14);
  });

  it("splits every finite packet exactly into zero and centered modes", () => {
    const X = 64;
    const H = 8;
    const values = Float64Array.from({ length: 2 * X + 2 * H + 2 }, (_, n) => (
      0.25 + Math.sin(2 * Math.PI * n / 7)
    ));
    const audit = completePacketAudit(values, { X, H });
    expect(audit.zeroModeIdentityError).toBeCloseTo(0, 10);
    expect(Math.abs(audit.zeroModeContribution)).toBeGreaterThan(0);
  });

  it("constructs the projected balanced Vaughan operator reproducibly", () => {
    const first = balancedVaughanPacketAudit({ M: 16, N: 16, H: 6, randomSamples: 8 });
    const second = balancedVaughanPacketAudit({ M: 16, N: 16, H: 6, randomSamples: 8 });
    expect(first.localProjectionRank).toBeGreaterThan(0);
    expect(first.topSingularValue).toBeGreaterThan(0);
    expect(first.topSingularValue).toBeCloseTo(second.topSingularValue, 12);
    expect(first.families.map((row) => row.normRatio)).toEqual(
      second.families.map((row) => row.normRatio),
    );
    for (const family of first.families) expect(family.normRatio).toBeLessThanOrEqual(1 + 1e-10);
  });
});
