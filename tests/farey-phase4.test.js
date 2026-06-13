import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const artifactPath = "logs/farey-product-artifacts/numerics.json";
const exhibitPath = "logs/farey-product-artifacts/farey-product-exhibit.html";
const packPath = "logs/farey-product-artifacts/farey-phase4-pack.md";
const leanPath = "logs/farey-product-artifacts/farey_phase4_stub.lean";
const auditPath = "logs/farey-product-artifacts/farey-completion-audit.md";

describe("Farey reciprocal-product phase-4 package", () => {
  it("pins the two-range real/Cramer signature evidence", () => {
    expect(existsSync(artifactPath)).toBe(true);
    const data = JSON.parse(readFileSync(artifactPath, "utf8"));

    expect(data.ranges).toEqual([[1000, 2000], [10000, 20000]]);
    expect(data.seeds).toEqual([12345, 271828, 314159, 161803, 424242]);

    expect(data.results[0].real.count).toBe(135);
    expect(data.results[0].real.exactPrimeShape).toBe(135);
    expect(data.results[0].real.theoremViolations).toEqual([]);
    expect(data.results[0].mainTerms.countLi).toBeCloseTo(137.1995886361323, 12);
    expect(data.results[0].real.endpointDebtTotal).toBe(100394);
    expect(data.results[0].cramer.map((row) => [row.seed, row.count, row.exactPrimeShape])).toEqual([
      [12345, 124, 47],
      [271828, 138, 53],
      [314159, 139, 55],
      [161803, 131, 51],
      [424242, 128, 47],
    ]);

    expect(data.results[1].real.count).toBe(1033);
    expect(data.results[1].real.exactPrimeShape).toBe(1033);
    expect(data.results[1].real.theoremViolations).toEqual([]);
    expect(data.results[1].mainTerms.countLi).toBeCloseTo(1042.4768271902074, 12);
    expect(data.results[1].real.endpointDebtTotal).toBe(7716881);
    expect(data.results[1].cramer.map((row) => [row.seed, row.count, row.exactPrimeShape])).toEqual([
      [12345, 1016, 323],
      [271828, 1062, 321],
      [314159, 1050, 315],
      [161803, 1023, 333],
      [424242, 1077, 338],
    ]);
  });

  it("renders exhibit, expert pack, and Lean stub", () => {
    expect(existsSync(exhibitPath)).toBe(true);
    expect(existsSync(packPath)).toBe(true);
    expect(existsSync(leanPath)).toBe(true);

    const html = readFileSync(exhibitPath, "utf8");
    expect(html).toContain("Farey reciprocal-product signature");
    expect(html).toContain("B_p(p)=p-1");
    expect(html).toContain("B_p(3p-1)=-(p-1)/2");

    const pack = readFileSync(packPath, "utf8");
    expect(pack).toContain("# Farey Reciprocal-Product Phase-4 Pack");
    expect(pack).toContain("## Factor Check");
    expect(pack).toContain("B_p(n)=p-1-m-ceil(m/2)<0");
    expect(pack).toContain("GOAL-CLOSE / KNOWN-MATH / ONE-DIRECTIONAL");
    expect(pack).toContain("KNOWN-MATH / ONE-DIRECTIONAL");
    expect(pack).toContain("one-directional bridge route");
    expect(pack).toContain("real 135/135 exact signatures");
    expect(pack).toContain("real 1,033/1,033 exact signatures");
    const teaching = pack.split("## WHAT THIS TEACHES ABOUT PRIMES\n\n").at(1);
    expect(teaching.trim().split(/\n+/)).toHaveLength(3);

    const lean = readFileSync(leanPath, "utf8");
    expect(lean).toContain("namespace FareyProduct");
    expect(lean).toContain("theorem prime_farey_surplus_spike_canyon");
    expect(lean).toContain("fareyRecipBaseSurplus p (3 * p - 1)");
    expect(lean).toContain("sorry");
  });

  it("emits a criterion-by-criterion completion audit", () => {
    expect(existsSync(auditPath)).toBe(true);
    const audit = readFileSync(auditPath, "utf8");

    expect(audit).toContain("# Farey Completion Audit");
    expect(audit).toContain("## Criterion 1: Different World");
    expect(audit).toContain("Satisfied. The object is `B_b(n)=sum");
    expect(audit).toContain("## Criterion 2: Factor Check");
    expect(audit).toContain("## Criterion 3: Dictionary Moves Prime Information");
    expect(audit).toContain("## Criterion 4: Derivation");
    expect(audit).toContain("honest one-directional bridge");
    expect(audit).toContain("## Criterion 5: Exhibit And Phase-4 Pack");
    expect(audit).toContain("COMPLETE for v2 under the criterion-4 one-directional route");
  });
});
