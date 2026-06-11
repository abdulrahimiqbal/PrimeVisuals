import { describe, it, expect, beforeAll } from "vitest";
import {
  prepareScan,
  scanResidues,
  scanExpSums,
  runScan,
} from "../src/core/anomaly.js";
import { primesUpTo } from "../src/core/math.js";

// ---------------------------------------------------------------------------
// prepareScan
// ---------------------------------------------------------------------------
describe("prepareScan", () => {
  it("pFind has π(20000)=2262 primes", () => {
    const prep = prepareScan(20000);
    // π(20000) = 2262
    expect(prep.pFind.length).toBe(2262);
  });

  it("pScore has π(40000)−π(20000) primes", () => {
    const prep = prepareScan(20000);
    const all = primesUpTo(40000);
    const expected = all.filter(p => p > 20000).length;
    expect(prep.pScore.length).toBe(expected);
  });

  it("pFind and pScore are disjoint and cover [2..40000]", () => {
    const prep = prepareScan(20000);
    const setFind = new Set(prep.pFind);
    for (const p of prep.pScore) expect(setFind.has(p)).toBe(false);
    expect(prep.pFind.every(p => p <= 20000)).toBe(true);
    expect(prep.pScore.every(p => p > 20000 && p <= 40000)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// runScan
// ---------------------------------------------------------------------------
describe("runScan", () => {
  // run once for all sub-tests
  let rows;
  beforeAll(async () => {
    rows = await runScan(20000);
  });

  it("returns ≤60 rows", () => {
    expect(rows.length).toBeLessThanOrEqual(60);
  });

  it("rows are sorted by |zScore| descending", () => {
    for (let i = 1; i < rows.length; i++) {
      expect(Math.abs(rows[i - 1].zScore)).toBeGreaterThanOrEqual(Math.abs(rows[i].zScore));
    }
  });

  it("every row has required fields", () => {
    for (const row of rows) {
      expect(row.kind).toBeDefined();
      expect(row.label).toBeDefined();
      expect(row.view).toBeDefined();
      expect(typeof row.zFind).toBe("number");
      expect(typeof row.zScore).toBe("number");
      expect(row.id).toBeDefined();
    }
  });

  it("view.source is always 'primes' or 'gaps'", () => {
    for (const row of rows) {
      expect(["primes", "gaps"]).toContain(row.view.source);
    }
  });
});

// ---------------------------------------------------------------------------
// scanResidues
// ---------------------------------------------------------------------------
describe("scanResidues", () => {
  it("zScore is finite for all q", () => {
    const prep = prepareScan(20000);
    const rows = scanResidues(prep, 60);
    for (const row of rows) {
      expect(Number.isFinite(row.zScore)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// scanExpSums — top rows include α near a rational multiple of 2π
// ---------------------------------------------------------------------------
describe("scanExpSums", () => {
  it("full output contains at least one α near 2π·(1/k) for small k", async () => {
    const prep = prepareScan(20000);
    const rows = await runScan(20000);
    const expRows = rows.filter(r => r.kind === "expsum");

    // candidate rationals: 1/2, 1/3, 1/4, 1/5, 1/6, 2/3, 2/5, 3/4, 3/5, 4/5
    const rationals = [1/2, 1/3, 1/4, 1/5, 1/6, 2/3, 2/5, 3/4, 3/5, 4/5];
    const targets = rationals.map(r => 2 * Math.PI * r);

    let found = false;
    for (const row of expRows) {
      for (const target of targets) {
        if (Math.abs(row.alpha - target) < 0.02) { found = true; break; }
      }
      if (found) break;
    }
    expect(found).toBe(true);
  });

  it("each row has alpha, zFind, zScore", () => {
    const prep = prepareScan(20000);
    const rows = scanExpSums(prep);
    for (const row of rows) {
      expect(typeof row.alpha).toBe("number");
      expect(typeof row.zFind).toBe("number");
      expect(typeof row.zScore).toBe("number");
    }
  });
});
