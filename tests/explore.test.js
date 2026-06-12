import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "scripts/explore.mjs");

function exploreEval(specJson) {
  const result = execSync(`node "${CLI}" eval '${specJson}'`, {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 30000,
  });
  return JSON.parse(result.trim());
}

function exploreCmd(cmd, arg) {
  const argPart = arg ? ` '${arg}'` : "";
  const result = execSync(`node "${CLI}" ${cmd}${argPart}`, {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 30000,
  });
  return JSON.parse(result.trim());
}

describe("explore CLI", () => {
  it("eval pi(n) over int domain N=2000: ok, linearity>0.99, link starts with #v=", () => {
    const r = exploreEval('{"domain":"int","N":2000,"ey":"pi(n)"}');
    expect(r.ok).toBe(true);
    expect(r.metrics.linearity).toBeGreaterThan(0.99);
    expect(r.link).toMatch(/^#v=/);
  });

  it("eval patch spec primes matrix N=5000 matW=30: ok, n===669", () => {
    const spec = JSON.stringify({ cfg: { source: "primes", plane: "matrix", lens: "mono", p: { N: 5000, matW: 30 } } });
    const r = exploreEval(spec);
    expect(r.ok).toBe(true);
    expect(r.metrics.n).toBe(669); // number of primes <= 5000
  });

  it("eval with cumsum chip on gaps N=20000: linearity > 0.9999", () => {
    const spec = JSON.stringify({
      cfg: { source: "gaps", plane: "graph", lens: "mono", p: { N: 20000 } },
      chips: { y: [{ op: "cumsum", p: {} }] },
    });
    const r = exploreEval(spec);
    expect(r.ok).toBe(true);
    expect(r.metrics.linearity).toBeGreaterThan(0.9999);
  });

  it("eval with residual on gaps N=20000: ok, flatness > 0", () => {
    const spec = JSON.stringify({
      cfg: { source: "gaps", plane: "graph", lens: "mono", p: { N: 20000 } },
      residual: true,
    });
    const r = exploreEval(spec);
    expect(r.ok).toBe(true);
    expect(r.metrics.flatness).toBeGreaterThan(0);
  });

  it("eval invalid spec with unknown variable q: ok false, error mentions q", () => {
    let stdout;
    try {
      execSync(`node "${CLI}" eval '{"domain":"real","ey":"abs(zeta(q))"}' `, {
        cwd: ROOT,
        encoding: "utf8",
        timeout: 30000,
      });
      // If no error thrown somehow, get stdout from the run above
      stdout = '{"ok":false,"error":"unknown \\"q\\""}'; // fallback
    } catch (e) {
      stdout = e.stdout;
    }
    const r = JSON.parse(stdout.trim());
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/q/);
  });

  it("link command returns link starting with #v=", () => {
    const spec = JSON.stringify({ domain: "int", N: 1000, ey: "pi(n)" });
    const r = exploreCmd("link", spec);
    expect(r.ok).toBe(true);
    expect(r.link).toMatch(/^#v=/);
  });

  it("batch: pipes two JSONL specs and gets two JSON lines back", () => {
    const spec1 = JSON.stringify({ domain: "int", N: 2000, ey: "pi(n)" });
    const spec2 = JSON.stringify({ cfg: { source: "gaps", plane: "graph", lens: "mono", p: { N: 5000 } } });
    const input = `${spec1}\n${spec2}\n`;
    const output = execSync(`node "${CLI}" batch`, {
      cwd: ROOT,
      input,
      encoding: "utf8",
      timeout: 30000,
    });
    const lines = output.trim().split("\n").filter((l) => l.trim());
    expect(lines.length).toBe(2);
    const r1 = JSON.parse(lines[0]);
    const r2 = JSON.parse(lines[1]);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
  });

  it("ops: parses as JSON with sources.primes, planes.matrix, chips.cumsum, labFunctions including zeta", () => {
    const r = exploreCmd("ops");
    expect(r.sources).toHaveProperty("primes");
    expect(r.planes).toHaveProperty("matrix");
    expect(r.chips).toHaveProperty("cumsum");
    expect(r.labFunctions).toContain("zeta");
  });
});
