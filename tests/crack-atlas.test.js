import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildArithmeticTables,
  finitePairSingular,
  makeManifest,
  sampleCompositeResidueMatched,
  sampleWheelLabels,
} from "../scripts/crack-atlas.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "scripts", "crack-atlas.mjs");

describe("crack atlas helpers", () => {
  it("builds arithmetic features used by nearby-prime scans", () => {
    const tables = buildArithmeticTables(30);
    expect(tables.isp[29]).toBe(1);
    expect(tables.isp[27]).toBe(0);
    expect(tables.mu[30]).toBe(-1);
    expect(tables.mu[12]).toBe(0);
    expect(tables.omega[18]).toBe(2);
    expect(tables.tau[28]).toBe(6);
    expect(tables.rad[18]).toBe(6);
  });

  it("computes finite Hardy-Littlewood pair singular factors", () => {
    expect(finitePairSingular(1, 30)).toBe(0);
    expect(finitePairSingular(2, 30)).toBeGreaterThan(0);
    expect(finitePairSingular(6, 30)).toBeGreaterThan(finitePairSingular(2, 30));
  });

  it("samples wheel labels from coprime classes after wheel primes", () => {
    const labels = sampleWheelLabels(5000, 210, 12345);
    expect(labels.length).toBeGreaterThan(0);
    for (const n of labels) {
      if (n > 7) expect([2, 3, 5, 7].some((p) => n % p === 0)).toBe(false);
    }
  });

  it("samples residue-matched composite controls without primes", () => {
    const tables = buildArithmeticTables(2000);
    const primes = tables.primes.filter((p) => p <= 2000);
    const control = sampleCompositeResidueMatched(primes, 2000, 30, 271828, tables.isp);
    expect(control.length).toBeGreaterThan(0);
    for (const n of control) {
      expect(tables.isp[n]).toBe(0);
      expect([2, 3, 5].some((p) => n % p === 0)).toBe(false);
    }
  });

  it("freezes the requested search surface in the manifest", () => {
    const manifest = makeManifest({ quick: true });
    expect(manifest.rows.length).toBeGreaterThan(300);
    expect(manifest.rows.some((r) => r.family === "nearby-arithmetic")).toBe(true);
    expect(manifest.rows.some((r) => r.family === "tuple-residual")).toBe(true);
    expect(manifest.rows.some((r) => r.family === "local-summatory")).toBe(true);
    expect(manifest.thresholds.minBreakthroughN).toBe(32_000_000);
  });
});

describe("crack atlas CLI", () => {
  it("quick plan/run/audit/pack completes and declares no breakthrough", () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "crack-atlas-test-"));
    execSync(`node "${CLI}" plan --quick --out "${outDir}"`, { cwd: ROOT, encoding: "utf8", timeout: 30000 });
    execSync(`node "${CLI}" run --quick --out "${outDir}"`, { cwd: ROOT, encoding: "utf8", timeout: 30000 });
    const auditStdout = execSync(`node "${CLI}" audit --quick --out "${outDir}"`, { cwd: ROOT, encoding: "utf8", timeout: 30000 });
    const audit = JSON.parse(auditStdout);
    expect(audit.ok).toBe(true);
    expect(audit.breakthroughCount).toBe(0);
    const packStdout = execSync(`node "${CLI}" pack --quick --out "${outDir}"`, { cwd: ROOT, encoding: "utf8", timeout: 30000 });
    const pack = JSON.parse(packStdout);
    expect(pack.ok).toBe(true);
    expect(pack.survivorCount).toBe(0);
  }, 90000);
});
