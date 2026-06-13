import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const artifactPath = "logs/farey-product-artifacts/numerics.json";
const exhibitPath = "logs/farey-product-artifacts/farey-product-exhibit.html";
const packPath = "logs/farey-product-artifacts/farey-phase4-pack.md";
const leanPath = "logs/farey-product-artifacts/farey_phase4_stub.lean";

describe("Farey reciprocal-product phase-4 artifacts", () => {
  it("pins the two-range real/Cramer signature evidence", () => {
    expect(existsSync(artifactPath)).toBe(true);
    const data = JSON.parse(readFileSync(artifactPath, "utf8"));

    expect(data.object).toBe("reciprocal Farey-product prime signatures");
    expect(data.ranges).toEqual([[1000, 2000], [10000, 20000]]);
    expect(data.seeds).toEqual([12345, 271828, 314159, 161803, 424242]);

    const small = data.results[0];
    expect(small.real.count).toBe(135);
    expect(small.real.exactPrimeShape).toBe(135);
    expect(small.real.theoremViolations).toEqual([]);
    expect(small.mainTerms.countLi).toBeCloseTo(137.1995886361323, 12);
    expect(small.real.endpointDebtTotal).toBe(100394);
    expect(small.mainTerms.endpointDebtLi).toBeCloseTo(102293.75293074908, 9);
    expect(small.cramer.map((row) => [row.seed, row.count, row.exactPrimeShape])).toEqual([
      [12345, 124, 47],
      [271828, 138, 53],
      [314159, 139, 55],
      [161803, 131, 51],
      [424242, 128, 47],
    ]);

    const large = data.results[1];
    expect(large.real.count).toBe(1033);
    expect(large.real.exactPrimeShape).toBe(1033);
    expect(large.real.theoremViolations).toEqual([]);
    expect(large.mainTerms.countLi).toBeCloseTo(1042.4768271902074, 12);
    expect(large.real.endpointDebtTotal).toBe(7716881);
    expect(large.mainTerms.endpointDebtLi).toBeCloseTo(7787063.079815943, 9);
    expect(large.cramer.map((row) => [row.seed, row.count, row.exactPrimeShape])).toEqual([
      [12345, 1016, 323],
      [271828, 1062, 321],
      [314159, 1050, 315],
      [161803, 1023, 333],
      [424242, 1077, 338],
    ]);
  });

  it("renders a static exhibit for the Farey signature", () => {
    expect(existsSync(exhibitPath)).toBe(true);
    const html = readFileSync(exhibitPath, "utf8");

    expect(html).toContain("Farey reciprocal-product signature");
    expect(html).toContain("B_p(p)=p-1");
    expect(html).toContain("B_p(3p-1)=-(p-1)/2");
    expect(html).toContain("Real primes have the exact p-adic spike/canyon");
    expect(html).toContain("real 1.000");
    expect(html).toContain("fake 0.312");
    expect(html).toContain("1,000-2,000");
    expect(html).toContain("10,000-20,000");
  });

  it("packages the one-directional theorem with a three-sentence teaching section", () => {
    expect(existsSync(packPath)).toBe(true);
    const pack = readFileSync(packPath, "utf8");

    expect(pack).toContain("# Farey Reciprocal-Product Phase-4 Pack");
    expect(pack).toContain("## Object");
    expect(pack).toContain("## Factor Check");
    expect(pack).toContain("## Dictionary");
    expect(pack).toContain("## Derivation");
    expect(pack).toContain("## Lean-Stub-Ready Statements");
    expect(pack).toContain("KNOWN-MATH / ONE-DIRECTIONAL");
    expect(pack).toContain("not an RH equivalence");
    expect(pack).toContain("not required for this Farey completion certificate");
    expect(pack).toContain("real 135/135 exact signatures");
    expect(pack).toContain("real 1,033/1,033 exact signatures");
    expect(pack).toContain("five-seed Cramer exact-shape average 0.311904");

    const teaching = pack.split("## WHAT THIS TEACHES ABOUT PRIMES\n\n").at(1);
    expect(teaching).toBeTruthy();
    const lines = teaching.trim().split(/\n+/);
    expect(lines).toHaveLength(3);
    for (const line of lines) expect(line.endsWith(".")).toBe(true);
  });

  it("generates a standalone Lean 4 theorem stub", () => {
    expect(existsSync(leanPath)).toBe(true);
    const lean = readFileSync(leanPath, "utf8");

    expect(lean).toContain("namespace FareyProduct");
    expect(lean).toContain("opaque fareyRecipBaseSurplus : Nat -> Nat -> Int");
    expect(lean).toContain("opaque OddPrime : Nat -> Prop");
    expect(lean).toContain("theorem prime_farey_surplus_spike_canyon");
    expect(lean).toContain("fareyRecipBaseSurplus p p = Int.ofNat (p - 1)");
    expect(lean).toContain("fareyRecipBaseSurplus p (3 * p - 1) = -Int.ofNat ((p - 1) / 2)");
    expect(lean).toContain("sorry");
    expect(lean).toContain("-- range 1,000..2,000: real 135/135 exact, Cramer average 0.383055");
    expect(lean).toContain("-- range 10,000..20,000: real 1,033/1,033 exact, Cramer average 0.311904");
  });
});
