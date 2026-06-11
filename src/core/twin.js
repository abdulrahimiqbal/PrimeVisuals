/* NULL-MODEL TWIN — Cramér-model pseudoprimes rendered through the same
   pipeline as the real primes. Structure visible in both is generic;
   structure only on the real side is arithmetic. */

import { cramerPrimes } from "./math.js";
import { fmt } from "./registry.js";

export const TWIN_SOURCES = new Set(["primes", "gaps"]);

export function genTwin(cfg, seed = 1234567) {
  if (cfg.source === "primes") {
    const ps = cramerPrimes(cfg.p.N, seed);
    const n = Float64Array.from(ps);
    const w = new Float64Array(ps.length);
    for (let i = 0; i < ps.length; i++) w[i] = ps[i] % 4 === 1 ? 1 : ps[i] % 4 === 3 ? -1 : 0;
    return { kind: "primes", domain: "int", n, w, ww: w, stats: `Cramér twin · ${fmt(ps.length)} pseudoprimes` };
  }
  if (cfg.source === "gaps") {
    const ps = cramerPrimes(cfg.p.N, seed);
    const m = ps.length - 1;
    const n = new Float64Array(m), w = new Float64Array(m), ww = new Float64Array(m);
    for (let i = 0; i < m; i++) {
      n[i] = ps[i]; w[i] = ps[i + 1] - ps[i]; ww[i] = w[i] - Math.log(ps[i]);
    }
    return { kind: "gaps", domain: "int", n, w, ww, stats: "Cramér twin gaps" };
  }
  return null;
}
