#!/usr/bin/env node
/* Headless evaluation of PrimeVisuals pipelines — the machine interface.
   See MACHINE_HOW_TO_USE.md for the full schema and workflow.

   Commands:
     node scripts/explore.mjs eval  '<spec-json>'   → metrics JSON on stdout
     node scripts/explore.mjs batch                 → JSONL specs on stdin, JSONL results on stdout
     node scripts/explore.mjs link  '<spec-json>'   → shareable URL hash for a human to open
     node scripts/explore.mjs ops                   → machine-readable inventory of sources/planes/lenses/chips/functions

   A spec is either a LAB spec (formulas over a domain):
     {"domain":"real","tMax":60,"ex":"t","ey":"abs(zeta(0.5+i*t))","a":0.5,"b":2.399}
   or a PATCH spec (source → plane pipeline plus optional chips/residual):
     {"cfg":{"source":"gaps","plane":"graph","lens":"mono","p":{"N":100000}},
      "chips":{"y":[{"op":"symlog","p":{}}]},"residual":true}                       */

import { computeLabSeries, makeFns } from "../src/core/engine.js";
import { SOURCES, PLANES, LENSES, withDefaults } from "../src/core/registry.js";
import { applyChips, CHIP_OPS } from "../src/core/chips.js";
import { residualFor, RESIDUALS } from "../src/core/residuals.js";
import { seriesMetrics } from "../src/core/metrics.js";
import { encodeState } from "../src/core/urlState.js";

const LAB_DEFAULTS = { domain: "int", N: 4000, tMax: 60, sMax: 1.6, ex: "n", ey: "0", eh: "", ew: "s", a: 0.5, b: 2.399 };

function evalSpec(spec) {
  if (spec.cfg) {
    const cfg = withDefaults(spec.cfg);
    if (!SOURCES[cfg.source]) throw new Error(`unknown source "${cfg.source}"`);
    if (!PLANES[cfg.plane]) throw new Error(`unknown plane "${cfg.plane}"`);
    const data = SOURCES[cfg.source].gen(cfg.p);
    const mapped = PLANES[cfg.plane].map(data, cfg.p);
    let xs = mapped.xs, ys = mapped.ys;
    if (spec.residual) {
      const r = residualFor(cfg);
      if (!r) throw new Error(`no residual encoded for ${cfg.source}:${cfg.plane}; available: ${Object.keys(RESIDUALS).join(", ")}`);
      const t = r.transform(data, mapped, cfg.p);
      ys = t.ys; if (t.xs) xs = t.xs;
    }
    const chips = spec.chips || {};
    xs = applyChips(xs, chips.x || []);
    ys = applyChips(ys, chips.y || []);
    return { xs, ys };
  }
  if (spec.domain === "complex") throw new Error("complex-domain fields render as images; evaluate re/im/abs of w over the real domain instead");
  const lab = { ...LAB_DEFAULTS, ...spec };
  if (!spec.ex) lab.ex = lab.domain === "real" ? "t" : "n";
  const S = computeLabSeries(lab);
  return { xs: S.xs, ys: S.ys };
}

function stateFor(spec) {
  if (spec.cfg) {
    return {
      mode: "patch", cfg: withDefaults(spec.cfg),
      chips: { x: (spec.chips && spec.chips.x) || [], y: (spec.chips && spec.chips.y) || [] },
      residual: !!spec.residual, twinMode: spec.twinMode || "real",
    };
  }
  const lab = { ...LAB_DEFAULTS, ...spec };
  if (!spec.ex) lab.ex = lab.domain === "real" ? "t" : "n";
  return { mode: "lab", lab };
}

function run(spec) {
  const t0 = performance.now();
  const { xs, ys } = evalSpec(spec);
  const metrics = seriesMetrics(xs, ys);
  return { ok: true, metrics, ms: Math.round(performance.now() - t0), link: encodeState(stateFor(spec)) };
}

const [, , cmd, arg] = process.argv;
const out = (o) => process.stdout.write(JSON.stringify(o) + "\n");

if (cmd === "eval") {
  try { out(run(JSON.parse(arg))); } catch (e) { out({ ok: false, error: e.message }); process.exitCode = 1; }
} else if (cmd === "link") {
  try { out({ ok: true, link: encodeState(stateFor(JSON.parse(arg))), hint: "append to the app URL, e.g. http://localhost:5173/<link>" }); }
  catch (e) { out({ ok: false, error: e.message }); process.exitCode = 1; }
} else if (cmd === "batch") {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => { buf += d; });
  process.stdin.on("end", () => {
    for (const line of buf.split("\n")) {
      const s = line.trim();
      if (!s) continue;
      try { out({ spec: s.length > 200 ? undefined : JSON.parse(s), ...run(JSON.parse(s)) }); }
      catch (e) { out({ ok: false, error: e.message, spec: s.slice(0, 200) }); }
    }
  });
} else if (cmd === "ops") {
  const fns = Object.keys(makeFns({ mu: [], mertens: [], isp: [], pic: [], gap: [], omega: [], bigomega: [], tau: [], phi: [], rad: [] }));
  out({
    sources: Object.fromEntries(Object.entries(SOURCES).map(([id, s]) => [id, { label: s.label, domain: s.domain, params: s.params || [] }])),
    planes: Object.fromEntries(Object.entries(PLANES).map(([id, p]) => [id, { label: p.label, accepts: p.accepts, params: p.params || [] }])),
    lenses: Object.fromEntries(Object.entries(LENSES).map(([id, l]) => [id, { label: l.label, params: l.params || [] }])),
    chips: Object.fromEntries(Object.entries(CHIP_OPS).map(([id, c]) => [id, { label: c.label, title: c.title, param: c.param || null }])),
    residuals: Object.keys(RESIDUALS),
    labDomains: ["int", "prime", "real", "complex"],
    labVariables: ["n (int/prime)", "t (real)", "s (complex)", "i", "a", "b", "pi", "e"],
    labFunctions: fns,
  });
} else {
  console.error("usage: explore.mjs eval '<spec>' | batch | link '<spec>' | ops   (see MACHINE_HOW_TO_USE.md)");
  process.exitCode = 1;
}
