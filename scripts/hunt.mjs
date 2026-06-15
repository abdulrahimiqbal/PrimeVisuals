#!/usr/bin/env node
/* scripts/hunt.mjs — the critical-line gauntlet runner + self-improving wildcard generator.

   The companion to scripts/explore.mjs, built for goal-directed hunting of a
   *novel* critical line (a straight line, a flat law, or a stable cancellation
   exponent theta in a partial-sum walk) WITHOUT the zeta function / complex plane.

   The discipline this enforces: a line is cheap. Nothing is interesting until a
   null TWIN fails to reproduce it. So every spec is run on REAL primes and on two
   nulls (Cramer fake-primes + a shuffled-order null) across N, 2N, 4N, 8N.

   Commands:
     gen N            emit N random wildcard specs (JSONL), sampled from logs/bias.md
     gauntlet '<spec>'  run one spec through the auto bars (persistence/holdout/twin)
     batch            JSONL specs on stdin -> JSONL verdicts on stdout
     update results.jsonl   nudge logs/bias.md weights by twin-beating yield + log lessons

   A spec is a LAB spec ({"domain":"prime","N":40000,"ey":"..."}) or a PATCH spec
   ({"cfg":{"source":"primes","plane":"walk","lens":"mono","p":{}},"chips":{"y":[...]}}).
   An optional "_family" tag routes generator bookkeeping; it is ignored by evaluation. */

import { SOURCES, PLANES, withDefaults } from "../src/core/registry.js";
import { applyChips, CHIP_OPS } from "../src/core/chips.js";
import { computeLabSeries } from "../src/core/engine.js";
import { seriesMetrics } from "../src/core/metrics.js";
import { cramerPrimes } from "../src/core/math.js";
import { encodeState } from "../src/core/urlState.js";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const BIAS = join(HERE, "..", "logs", "bias.md");
const BASE = 25000; // scan scale; the ladder runs BASE, 2x, 4x, 8x

/* ───────────────────────── helpers ───────────────────────── */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function clean(spec) { const o = {}; for (const k of Object.keys(spec)) if (!k.startsWith("_")) o[k] = spec[k]; return o; }
function rms(a) { let s = 0, n = 0; for (let i = 0; i < a.length; i++) { const v = a[i]; if (Number.isFinite(v)) { s += v * v; n++; } } return n ? Math.sqrt(s / n) : 0; }
function lsq(X, Y) { let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0; for (let i = 0; i < X.length; i++) { const x = X[i], y = Y[i]; if (!Number.isFinite(x) || !Number.isFinite(y)) continue; n++; sx += x; sy += y; sxx += x * x; sxy += x * y; } const d = n * sxx - sx * sx; const slope = d ? (n * sxy - sx * sy) / d : 0; return { slope, intercept: (sy - slope * sx) / (n || 1) }; }

function shuffleData(d, seed) {
  const r = rng(seed), idx = Array.from(d.n.keys());
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...d, w: Float64Array.from(idx, (i) => d.w[i]), ww: Float64Array.from(idx, (i) => (d.ww ? d.ww[i] : d.w[i])) };
}
function shuffleArr(a, seed) { const r = rng(seed), o = Float64Array.from(a); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; }

// Cramer fake-prime analog of a prime-list source; null for non-prime sources.
function cramerData(source, N, seed) {
  const cp = cramerPrimes(N, seed);
  if (source === "primes") { const n = Float64Array.from(cp), w = new Float64Array(cp.length); for (let i = 0; i < cp.length; i++) w[i] = cp[i] % 4 === 1 ? 1 : cp[i] % 4 === 3 ? -1 : 0; return { kind: "primes", domain: "int", n, w, ww: w }; }
  if (source === "gaps") { const m = cp.length - 1, n = new Float64Array(m), w = new Float64Array(m), ww = new Float64Array(m); for (let i = 0; i < m; i++) { n[i] = cp[i]; w[i] = cp[i + 1] - cp[i]; ww[i] = w[i] - Math.log(cp[i]); } return { kind: "gaps", domain: "int", n, w, ww }; }
  return null;
}

function pipeline(spec, N, twin, seed) {
  if (spec.cfg) {
    const cfg = withDefaults(spec.cfg), p = { ...cfg.p, N };
    let data;
    if (twin === "cramer") { data = cramerData(cfg.source, N, seed); if (!data) return null; }
    else { data = SOURCES[cfg.source].gen(p); if (twin === "shuffle") data = shuffleData(data, seed); }
    const mapped = PLANES[cfg.plane].map(data, p);
    const chips = spec.chips || {};
    return { xs: applyChips(mapped.xs, chips.x || []), ys: applyChips(mapped.ys, chips.y || []) };
  }
  const lab = { domain: "int", N, tMax: 60, ex: "", ey: "0", a: 0.5, b: 2.399, ...spec, N };
  if (!spec.ex) lab.ex = lab.domain === "real" ? "t" : "n";
  const S = computeLabSeries(lab);
  return { xs: S.xs, ys: twin === "shuffle" ? shuffleArr(S.ys, seed) : S.ys };
}

function ladder(spec, twin, seedBase = 0) {
  const Ns = [BASE, BASE * 2, BASE * 4, BASE * 8], rows = [];
  for (let i = 0; i < Ns.length; i++) {
    const r = pipeline(spec, Ns[i], twin, 1000 + seedBase * 17 + i); if (!r) return null;
    const m = seriesMetrics(r.xs, r.ys);
    rows.push({ N: Ns[i], lin: m.linearity, slope: m.slope, flat: m.flatness, finite: m.finiteFrac, rY: rms(r.ys), rX: rms(r.xs) });
  }
  const lnN = rows.map((r) => Math.log(r.N));
  // theta from RMS growth of the (partial-sum) series — far less noisy than running-max
  const thetaY = lsq(lnN, rows.map((r) => Math.log(r.rY || 1e-12))).slope;
  const thetaX = lsq(lnN, rows.map((r) => Math.log(r.rX || 1e-12))).slope;
  const last = rows[rows.length - 1];
  return { thetaX, thetaY, lin: last.lin, flat: last.flat, slope: last.slope, finite: last.finite, linDrift: last.lin - rows[0].lin };
}
// Average a noisy null over several seeds so the twin baseline is stable.
function avgLadder(spec, twin, n) {
  const acc = []; for (let s = 0; s < n; s++) { const L = ladder(spec, twin, s); if (L) acc.push(L); }
  if (!acc.length) return null;
  const mean = (k) => acc.reduce((a, x) => a + x[k], 0) / acc.length;
  return { thetaX: mean("thetaX"), thetaY: mean("thetaY"), lin: mean("lin"), flat: mean("flat"), slope: mean("slope"), finite: mean("finite"), linDrift: mean("linDrift") };
}

function holdoutR2(spec) {
  const r = pipeline(spec, BASE * 2, "real", 7); if (!r) return 0;
  const { xs, ys } = r, L = xs.length, h = Math.floor(L / 2);
  const { slope, intercept } = lsq(Array.from(xs.slice(0, h)), Array.from(ys.slice(0, h)));
  let ssr = 0, sst = 0, my = 0, n = 0;
  for (let i = h; i < L; i++) if (Number.isFinite(ys[i])) { my += ys[i]; n++; }
  my /= n || 1;
  for (let i = h; i < L; i++) { if (!Number.isFinite(xs[i]) || !Number.isFinite(ys[i])) continue; const pred = slope * xs[i] + intercept; ssr += (ys[i] - pred) ** 2; sst += (ys[i] - my) ** 2; }
  return sst > 1e-12 ? Math.max(0, 1 - ssr / sst) : 1;
}

function stateFor(spec) {
  if (spec.cfg) return { mode: "patch", cfg: withDefaults(spec.cfg), chips: { x: (spec.chips && spec.chips.x) || [], y: (spec.chips && spec.chips.y) || [] }, residual: !!spec.residual, twinMode: "real" };
  return { mode: "lab", lab: { domain: "int", N: 4000, tMax: 60, ex: "", ey: "0", a: 0.5, b: 2.399, ...spec } };
}

/* ───────────────────────── the gauntlet (auto bars 2-4) ───────────────────────── */
function gauntlet(rawSpec) {
  const spec = clean(rawSpec);
  let real; try { real = ladder(spec, "real", 0); } catch (e) { return { ok: false, error: e.message }; }
  if (!real) return { ok: false, error: "pipeline failed" };
  const link = encodeState(stateFor(spec));
  if (real.finite < 0.99) return { ok: true, verdict: "REJECT blew-up", finiteFrac: +real.finite.toFixed(3), link };

  const twins = [];
  if (spec.cfg && (spec.cfg.source === "primes" || spec.cfg.source === "gaps")) { const t = ladder(spec, "cramer", 0); if (t) twins.push(t); }
  const sh = avgLadder(spec, "shuffle", 3); if (sh) twins.push(sh);

  const twinLin = twins.length ? Math.max(...twins.map((t) => t.lin)) : 0;
  const twinFlat = twins.length ? Math.min(...twins.map((t) => t.flat)) : 1;
  const nearest = (key) => twins.length ? twins.reduce((a, t) => Math.abs(t[key] - real[key]) < Math.abs(a - real[key]) ? t[key] : a, twins[0][key]) : real[key];
  const twinThetaY = nearest("thetaY"), twinThetaX = nearest("thetaX");

  const ho = holdoutR2(spec);
  const line = real.lin >= 0.999, flatLaw = real.flat <= 0.03 && real.lin < 0.6;
  const dTheta = Math.max(Math.abs(real.thetaY - twinThetaY), Math.abs(real.thetaX - twinThetaX));
  const persistent = real.linDrift >= -0.02;
  const twinBeatsLine = line && real.lin - twinLin >= 0.05;
  const twinBeatsExp = dTheta >= 0.10 && persistent; // robust gap + must persist
  const twinBeatsFlat = flatLaw && twinFlat - real.flat >= 0.05;
  const promote = (twinBeatsLine && ho >= 0.95 && persistent) || twinBeatsExp || twinBeatsFlat;

  return {
    ok: true,
    verdict: promote ? "PROMOTE — beats twin; now do bars 1 & 5 (state it precisely, grep KNOWLEDGE.md)" : "discard — generic / twin-matched / known",
    promote,
    real: { lin: +real.lin.toFixed(4), flat: +real.flat.toFixed(3), slope: +real.slope.toPrecision(3), thetaY: +real.thetaY.toFixed(3), thetaX: +real.thetaX.toFixed(3) },
    twin: { lin: +twinLin.toFixed(4), flat: +twinFlat.toFixed(3), thetaY: +twinThetaY.toFixed(3), thetaX: +twinThetaX.toFixed(3) },
    holdoutR2: +ho.toFixed(3), persistent, link,
  };
}

/* ───────────────────────── generator (reads logs/bias.md) ───────────────────────── */
const DEFAULT_FAMS = ["mu-walk-chip", "gaps-stack", "prime-walk-chip", "expsum-cos", "residue-mod-cumsum", "dyexp-compose", "twoD-front", "polyprime-stack", "lab-residual"];
const POOL = ["symlog", "sqrt", "abs", "sin", "cos", "scale", "offset", "mod", "diff", "cumsum", "dyexp", "norm"];

function families() {
  let txt = ""; try { txt = readFileSync(BIAS, "utf8"); } catch { /* seed not present */ }
  const fams = [];
  for (const line of txt.split("\n")) { const m = line.match(/^\s*([\d.]+)\s*\|\s*(\S+)\s*\|/); if (m) fams.push({ w: parseFloat(m[1]), id: m[2] }); }
  return fams.length ? fams.filter((f) => f.id !== "cross-domain") : DEFAULT_FAMS.map((id) => ({ w: 1, id }));
}
const choose = (r, arr) => arr[Math.floor(r() * arr.length)];
function randChips(r, k) { const out = []; for (let i = 0; i < k; i++) { const op = choose(r, POOL), def = CHIP_OPS[op], p = def.param ? { [def.param.key]: +(def.param.min + r() * (def.param.max - def.param.min)).toFixed(def.param.step >= 1 ? 0 : 3) } : {}; out.push({ op, p }); } return out; }

function genFamily(id, r) {
  const N = choose(r, [20000, 30000, 40000]), Nm = Math.min(N, 50000);
  switch (id) {
    case "mu-walk-chip": return { cfg: { source: "mobius", plane: "walk", lens: "mono", p: { N: Nm } }, chips: { y: randChips(r, 1 + Math.floor(r() * 3)) } };
    case "gaps-stack": return { cfg: { source: "gaps", plane: choose(r, ["graph", "walk"]), lens: "mono", p: { N } }, chips: { y: randChips(r, 1 + Math.floor(r() * 3)) } };
    case "prime-walk-chip": return { cfg: { source: "primes", plane: "walk", lens: "mono", p: { N } }, chips: { y: randChips(r, 1 + Math.floor(r() * 3)) } };
    case "expsum-cos": return { cfg: { source: "primes", plane: "graph", lens: "mono", p: { N } }, chips: { x: [{ op: "scale", p: { a: +(0.2 + r() * 6).toFixed(3) } }, { op: "cos", p: {} }, { op: "cumsum", p: {} }] } };
    case "residue-mod-cumsum": return { cfg: { source: choose(r, ["primes", "mobius"]), plane: "graph", lens: "mono", p: { N: Nm } }, chips: { x: [{ op: "mod", p: { a: choose(r, [4, 6, 8, 12, 30, 210]) } }, { op: "cumsum", p: {} }] } };
    case "dyexp-compose": return { cfg: { source: choose(r, ["mobius", "primes", "gaps"]), plane: "walk", lens: "mono", p: { N: Nm } }, chips: { y: [{ op: "dyexp", p: {} }, ...randChips(r, Math.floor(r() * 2))] } };
    case "twoD-front": return { cfg: { source: "primes", plane: choose(r, ["clock", "matrix", "family"]), lens: "mono", p: { N, mod: choose(r, [6, 12, 30]), matW: choose(r, [210, 360, 420]), famQ: choose(r, [60, 80, 120]) } } };
    case "polyprime-stack": return { cfg: { source: "polyprimes", plane: choose(r, ["graph", "walk"]), lens: "mono", p: { q: choose(r, [2, 3]), deg: choose(r, [8, 10, 12]) } }, chips: { y: randChips(r, 1 + Math.floor(r() * 2)) } };
    case "lab-residual": return { domain: "prime", N, ey: choose(r, ["n - pi(n)*log(pi(n))", "n/pi(n) - log(n)", "omega(n) - log(log(n))", "gap(n) - log(n)"]) };
    default: return null; // cross-domain is serviced by the agent, not auto-gen
  }
}

function gen(count, seed) {
  const fams = families(), total = fams.reduce((a, f) => a + f.w, 0), r = rng(seed || (Date.now() & 0xffffffff)), out = [];
  while (out.length < count) {
    let id;
    if (r() < 0.25) id = choose(r, fams).id; // pure-random floor keeps exploration alive
    else { let x = r() * total, acc = 0; id = fams[fams.length - 1].id; for (const f of fams) { acc += f.w; if (x <= acc) { id = f.id; break; } } }
    const spec = genFamily(id, r); if (!spec) continue;
    out.push(JSON.stringify({ _family: id, ...spec }));
  }
  return out.join("\n");
}

/* ───────────────────────── update (self-improvement write side) ───────────────────────── */
function update(resultsFile) {
  const lines = readFileSync(resultsFile, "utf8").trim().split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const tried = {}, won = {};
  for (const o of lines) { const f = o._family || "?"; tried[f] = (tried[f] || 0) + 1; if (o.promote) won[f] = (won[f] || 0) + 1; }
  let txt = readFileSync(BIAS, "utf8");
  const newLines = txt.split("\n").map((line) => {
    const m = line.match(/^(\s*)([\d.]+)(\s*\|\s*)(\S+)(\s*\|.*)$/); if (!m) return line;
    const id = m[4], rate = tried[id] ? (won[id] || 0) / tried[id] : 0;
    let w = parseFloat(m[2]); w = w + 0.1 * (1 - w); w *= 1 + rate; w = Math.max(0.1, Math.min(5, w)); // decay toward uniform, then reward yield
    return m[1] + w.toFixed(2) + m[3] + id + m[5];
  });
  // distil <=2 lessons
  const ranked = Object.keys(tried).sort((a, b) => ((won[b] || 0) / tried[b]) - ((won[a] || 0) / tried[a]));
  const lessons = [];
  if (ranked.length && won[ranked[0]]) lessons.push(`- LEAD ${ranked[0]}: ${won[ranked[0]]}/${tried[ranked[0]]} beat their twin — pursue/mutate`);
  const worst = ranked.reverse().find((f) => tried[f] >= 3 && !won[f]); if (worst) lessons.push(`- FAIL ${worst}: 0/${tried[worst]} beat the twin — generic, downweighted`);
  let out = newLines.join("\n");
  const marker = "<!--LESSONS";
  const mi = out.indexOf(marker);
  if (mi >= 0 && lessons.length) {
    const eol = out.indexOf("\n", mi); const head = out.slice(0, eol + 1), rest = out.slice(eol + 1);
    const existing = rest.split("\n").filter((l) => l.startsWith("- "));
    const kept = [...lessons, ...existing].slice(0, 12).join("\n");
    out = head + kept + "\n";
  }
  writeFileSync(BIAS, out);
  return { tried, won, lessons };
}

/* ───────────────────────── CLI ───────────────────────── */
const [, , cmd, arg] = process.argv;
const emit = (o) => process.stdout.write(JSON.stringify(o) + "\n");
if (cmd === "gauntlet") { try { emit(gauntlet(JSON.parse(arg))); } catch (e) { emit({ ok: false, error: e.message }); process.exitCode = 1; } }
else if (cmd === "gen") { process.stdout.write(gen(parseInt(arg || "100", 10)) + "\n"); }
else if (cmd === "update") { try { emit({ ok: true, ...update(arg) }); } catch (e) { emit({ ok: false, error: e.message }); process.exitCode = 1; } }
else if (cmd === "batch") {
  let buf = ""; process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (buf += d));
  process.stdin.on("end", () => { for (const line of buf.split("\n")) { const s = line.trim(); if (!s) continue; try { const spec = JSON.parse(s); emit({ _family: spec._family, ...gauntlet(spec) }); } catch (e) { emit({ ok: false, error: e.message }); } } });
} else { console.error("usage: hunt.mjs gen N | gauntlet '<spec>' | batch | update results.jsonl   (see MACHINE_HOW_TO_USE.md)"); process.exitCode = 1; }
