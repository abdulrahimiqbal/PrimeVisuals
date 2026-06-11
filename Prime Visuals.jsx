import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   PRIMEVISUALS — a patchable instrument for prime-number structure
   Pipeline:  SOURCE (what numbers) → PLANE (where they live) → LENS (how they glow)
   Every module is one entry in a registry. Adding a visualization = adding an entry.
   ════════════════════════════════════════════════════════════════ */

const T = {
  void: "#07080F", panel: "#0C0F17", panel2: "#10141F", line: "#1C2333",
  ink: "#E9ECF5", dim: "#828CA3", faint: "#454E66",
  ion: "#7DD3FC", rose: "#FB7185", amber: "#FBBF24", slate: "#64748B",
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace",
  sans: "'Instrument Sans', system-ui, sans-serif",
};
const FONT_CSS =
  "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');" +
  "input[type=range]{cursor:pointer;} select{cursor:pointer;} ::selection{background:#1d3b4d;color:#e9ecf5;}" +
  ".pv-eye-toggle:focus-visible{outline:2px solid #7DD3FC;outline-offset:2px;}";
const PRESET_KEY = "primevisuals:presets";

async function loadPresets() {
  if (typeof window === "undefined") return null;
  if (window.storage?.get) return window.storage.get(PRESET_KEY);
  if (window.localStorage) {
    const value = window.localStorage.getItem(PRESET_KEY);
    return value ? { value } : null;
  }
  throw new Error("persistent storage unavailable");
}

async function savePresets(list) {
  const value = JSON.stringify(list);
  if (typeof window === "undefined") return;
  if (window.storage?.set) {
    await window.storage.set(PRESET_KEY, value);
    return;
  }
  if (window.localStorage) {
    window.localStorage.setItem(PRESET_KEY, value);
    return;
  }
  throw new Error("persistent storage unavailable");
}

/* ───────────────────────── number theory ───────────────────────── */

function sieve(N) {
  const s = new Uint8Array(N + 1).fill(1);
  s[0] = 0; if (N >= 1) s[1] = 0;
  for (let i = 2; i * i <= N; i++) if (s[i]) for (let j = i * i; j <= N; j += i) s[j] = 0;
  return s;
}
function primesUpTo(N) {
  const s = sieve(N), out = [];
  for (let i = 2; i <= N; i++) if (s[i]) out.push(i);
  return out;
}
function mobiusUpTo(N) {
  const mu = new Int8Array(N + 1); mu[1] = 1;
  const spf = new Int32Array(N + 1); const ps = [];
  for (let i = 2; i <= N; i++) {
    if (!spf[i]) { spf[i] = i; ps.push(i); mu[i] = -1; }
    for (let k = 0; k < ps.length; k++) {
      const p = ps[k]; if (p > spf[i] || i * p > N) break;
      spf[i * p] = p;
      if (i % p === 0) { mu[i * p] = 0; break; } else mu[i * p] = -mu[i];
    }
  }
  return mu;
}

/* ζ(1/2 + it) via the Dirichlet eta series, ζ = η / (1 − 2^{1−s}). */
const Z_TERMS = 3000;
let _ln = null, _rs = null;
function zetaHalf(t) {
  if (!_ln) {
    _ln = new Float64Array(Z_TERMS + 2); _rs = new Float64Array(Z_TERMS + 2);
    for (let n = 1; n <= Z_TERMS + 1; n++) { _ln[n] = Math.log(n); _rs[n] = 1 / Math.sqrt(n); }
  }
  let re = 0, im = 0, sign = 1;
  for (let n = 1; n <= Z_TERMS; n++) {
    const a = _rs[n] * sign, ang = t * _ln[n];
    re += a * Math.cos(ang); im -= a * Math.sin(ang);
    sign = -sign;
  }
  { // half of the next term — averages consecutive partial sums
    const a = _rs[Z_TERMS + 1] * sign * 0.5, ang = t * _ln[Z_TERMS + 1];
    re += a * Math.cos(ang); im -= a * Math.sin(ang);
  }
  const m = Math.SQRT2, L2 = Math.LN2;
  const dr = 1 - m * Math.cos(t * L2), di = m * Math.sin(t * L2);
  const den = dr * dr + di * di;
  return [(re * dr + im * di) / den, (im * dr - re * di) / den];
}

/* First nontrivial zeros of ζ on the critical line (imaginary parts < 100). */
const ZEROS = [14.1347, 21.022, 25.0109, 30.4249, 32.9351, 37.5862, 40.9187, 43.3271,
  48.0052, 49.7738, 52.9703, 56.4462, 59.347, 60.8318, 65.1125, 67.0798, 69.5464,
  72.0672, 75.7047, 77.1448, 79.3374, 82.9104, 84.7355, 87.4253, 88.8091, 92.4919,
  94.6513, 95.8706, 98.8312];

/* Ulam square-spiral coordinates for integer n (1 at the origin). */
function ulamXY(n) {
  if (n <= 1) return [0, 0];
  const k = Math.ceil((Math.sqrt(n) - 1) / 2), s = 2 * k;
  const off = n - ((2 * k - 1) * (2 * k - 1) + 1);
  const side = Math.floor(off / s), p = off % s;
  if (side === 0) return [k, -k + 1 + p];
  if (side === 1) return [k - 1 - p, k];
  if (side === 2) return [-k, k - 1 - p];
  return [-k + 1 + p, -k];
}

/* ═══════════════════════ LAB ENGINE — math as objects ═══════════════════════
   Complex scalars are [re, im]. Expressions parse to an AST and evaluate
   over a domain (n ∈ ℤ, t ∈ ℝ, or s ∈ ℂ), with free knobs a and b. */

const CX = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
  div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1] || 1e-300; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
  abs: (a) => Math.hypot(a[0], a[1]),
  exp: (a) => { const e = Math.exp(a[0]); return [e * Math.cos(a[1]), e * Math.sin(a[1])]; },
  log: (a) => [Math.log(CX.abs(a) + 1e-300), Math.atan2(a[1], a[0])],
  pow: (a, b) => { if (a[0] === 0 && a[1] === 0) return [0, 0]; return CX.exp(CX.mul(b, CX.log(a))); },
  sin: (a) => [Math.sin(a[0]) * Math.cosh(a[1]), Math.cos(a[0]) * Math.sinh(a[1])],
  cos: (a) => [Math.cos(a[0]) * Math.cosh(a[1]), -Math.sin(a[0]) * Math.sinh(a[1])],
};

function tokenize(src) {
  const toks = []; let i = 0;
  const isd = (c) => c >= "0" && c <= "9";
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t") { i++; continue; }
    if (isd(c) || (c === "." && isd(src[i + 1]))) {
      let j = i; while (j < src.length && (isd(src[j]) || src[j] === ".")) j++;
      toks.push({ t: "num", v: parseFloat(src.slice(i, j)) }); i = j; continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i; while (j < src.length && /[a-zA-Z_0-9]/.test(src[j])) j++;
      toks.push({ t: "id", v: src.slice(i, j) }); i = j; continue;
    }
    if ("+-*/^(),".includes(c)) { toks.push({ t: c }); i++; continue; }
    throw new Error(`unexpected “${c}”`);
  }
  return toks;
}

function parseExpr(src) {
  const Tk = tokenize(src); let p = 0;
  const peek = () => Tk[p];
  const eat = (t) => { if (!Tk[p] || Tk[p].t !== t) throw new Error(`expected ${t}`); return Tk[p++]; };
  function expr() { let n = term(); while (peek() && (peek().t === "+" || peek().t === "-")) { const o = Tk[p++].t; n = { k: "bin", o, l: n, r: term() }; } return n; }
  function term() { let n = factor(); while (peek() && (peek().t === "*" || peek().t === "/")) { const o = Tk[p++].t; n = { k: "bin", o, l: n, r: factor() }; } return n; }
  function factor() {
    if (peek() && peek().t === "-") { p++; return { k: "neg", x: factor() }; }
    let n = atom();
    if (peek() && peek().t === "^") { p++; n = { k: "bin", o: "^", l: n, r: factor() }; }
    return n;
  }
  function atom() {
    const tk = peek(); if (!tk) throw new Error("unexpected end of formula");
    if (tk.t === "num") { p++; return { k: "num", v: [tk.v, 0] }; }
    if (tk.t === "(") { p++; const n = expr(); eat(")"); return n; }
    if (tk.t === "id") {
      p++;
      if (peek() && peek().t === "(") {
        p++; const args = [];
        if (peek() && peek().t !== ")") { args.push(expr()); while (peek() && peek().t === ",") { p++; args.push(expr()); } }
        eat(")"); return { k: "call", f: tk.v, a: args };
      }
      return { k: "var", n: tk.v };
    }
    throw new Error("unexpected token");
  }
  const n = expr();
  if (p < Tk.length) throw new Error("trailing input");
  return n;
}

function evalAst(node, env, fns) {
  switch (node.k) {
    case "num": return node.v;
    case "var": { const v = env[node.n]; if (!v) throw new Error(`unknown “${node.n}”`); return v; }
    case "neg": { const x = evalAst(node.x, env, fns); return [-x[0], -x[1]]; }
    case "bin": {
      const l = evalAst(node.l, env, fns), r = evalAst(node.r, env, fns);
      return node.o === "+" ? CX.add(l, r) : node.o === "-" ? CX.sub(l, r)
        : node.o === "*" ? CX.mul(l, r) : node.o === "/" ? CX.div(l, r) : CX.pow(l, r);
    }
    case "call": {
      const f = fns[node.f]; if (!f) throw new Error(`unknown function “${node.f}”`);
      return f(...node.a.map((x) => evalAst(x, env, fns)));
    }
    default: throw new Error("bad node");
  }
}
function astUses(node, name) {
  if (!node) return false;
  if (node.k === "call") return node.f === name || node.a.some((x) => astUses(x, name));
  if (node.k === "bin") return astUses(node.l, name) || astUses(node.r, name);
  if (node.k === "neg") return astUses(node.x, name);
  return false;
}

/* ζ(σ + it) for σ > 0 via eta, with a per-σ power cache (fast down grid columns). */
let _zsig = NaN, _zpw = null;
function zetaC(sig, t) {
  if (!_ln) zetaHalf(0); // build the shared ln/√ caches once
  const s = Math.min(Math.max(sig, 0.05), 8);
  const neg = t < 0; const at = Math.abs(t);
  const M = Math.min(Z_TERMS, Math.max(90, Math.ceil(150 + 17 * at)));
  if (s !== _zsig) {
    _zsig = s; _zpw = new Float64Array(Z_TERMS + 2);
    for (let n = 1; n <= Z_TERMS + 1; n++) _zpw[n] = Math.pow(n, -s);
  }
  let re = 0, im = 0, sign = 1;
  for (let n = 1; n <= M; n++) {
    const a = _zpw[n] * sign, ang = at * _ln[n];
    re += a * Math.cos(ang); im -= a * Math.sin(ang);
    sign = -sign;
  }
  { const a = _zpw[M + 1] * sign * 0.5, ang = at * _ln[M + 1]; re += a * Math.cos(ang); im -= a * Math.sin(ang); }
  const mg = Math.pow(2, 1 - s), L2 = Math.LN2;
  const dr = 1 - mg * Math.cos(at * L2), di = mg * Math.sin(at * L2);
  const den = dr * dr + di * di;
  if (den < 1e-12) return [1e9, 0]; // the pole at s = 1
  const zr = (re * dr + im * di) / den, zi = (im * dr - re * di) / den;
  return neg ? [zr, -zi] : [zr, zi];
}

const makeFns = (tab) => ({
  abs: (z) => [CX.abs(z), 0], arg: (z) => [Math.atan2(z[1], z[0]), 0],
  re: (z) => [z[0], 0], im: (z) => [z[1], 0], conj: (z) => [z[0], -z[1]],
  exp: CX.exp, log: CX.log, sqrt: (z) => CX.pow(z, [0.5, 0]), sin: CX.sin, cos: CX.cos,
  floor: (z) => [Math.floor(z[0]), Math.floor(z[1])],
  frac: (z) => [z[0] - Math.floor(z[0]), z[1] - Math.floor(z[1])],
  pow: CX.pow,
  min: (x, y) => (x[0] <= y[0] ? x : y), max: (x, y) => (x[0] >= y[0] ? x : y),
  mod: (x, y) => { const m = y[0] || 1; return [((x[0] % m) + m) % m, 0]; },
  gcd: (x, y) => {
    let a = Math.abs(Math.round(x[0])), b = Math.abs(Math.round(y[0]));
    while (b) { const t = a % b; a = b; b = t; }
    return [a, 0];
  },
  dot: (x, y) => [x[0] * y[0] + x[1] * y[1], 0],
  zeta: (z) => zetaC(z[0], z[1]),
  mu: (z) => [(tab && tab.mu[Math.round(z[0])]) || 0, 0],
  M: (z) => [(tab && tab.mertens[Math.round(z[0])]) || 0, 0],
  isprime: (z) => [(tab && tab.isp[Math.round(z[0])]) || 0, 0],
  pi: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.pic.length - 1, Math.round(z[0]))); return [tab.pic[k], 0]; },
  gap: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.gap.length - 1, Math.round(z[0]))); return [tab.gap[k], 0]; },
  omega: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.omega.length - 1, Math.round(z[0]))); return [tab.omega[k], 0]; },
  bigomega: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.bigomega.length - 1, Math.round(z[0]))); return [tab.bigomega[k], 0]; },
  tau: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.tau.length - 1, Math.round(z[0]))); return [tab.tau[k], 0]; },
  phi: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.phi.length - 1, Math.round(z[0]))); return [tab.phi[k], 0]; },
  rad: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.rad.length - 1, Math.round(z[0]))); return [tab.rad[k], 0]; },
});

function hslPx(h, s, l) { // h,s,l ∈ [0,1] → [r,g,b]
  const a = s * Math.min(l, 1 - l);
  const f = (k) => { const x = (k + h * 12) % 12; return l - a * Math.max(-1, Math.min(x - 3, Math.min(9 - x, 1))); };
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

/* ═══════════════════════ SOURCES — what numbers ═══════════════════════
   gen(p) → { kind, n[], w[], ww[], re?[], im?[], stats } */

const SOURCES = {
  primes: {
    label: "Primes", domain: "int",
    blurb: "p ≤ N, weighted ±1 by p mod 4",
    params: [{ key: "N", label: "range n ≤", min: 2000, max: 200000, step: 1000, def: 20000 }],
    gen: (p) => {
      const ps = primesUpTo(p.N);
      const n = Float64Array.from(ps);
      const w = new Float64Array(ps.length);
      for (let i = 0; i < ps.length; i++) w[i] = ps[i] % 4 === 1 ? 1 : ps[i] % 4 === 3 ? -1 : 0;
      return { kind: "primes", domain: "int", n, w, ww: w, stats: `π(${fmt(p.N)}) = ${fmt(ps.length)}` };
    },
  },
  gaps: {
    label: "Prime gaps", domain: "int",
    blurb: "gₖ = pₖ₊₁ − pₖ at each prime",
    params: [{ key: "N", label: "range n ≤", min: 2000, max: 200000, step: 1000, def: 100000 }],
    gen: (p) => {
      const ps = primesUpTo(p.N);
      const m = ps.length - 1;
      const n = new Float64Array(m), w = new Float64Array(m), ww = new Float64Array(m);
      let gmax = 0;
      for (let i = 0; i < m; i++) {
        n[i] = ps[i]; w[i] = ps[i + 1] - ps[i]; ww[i] = w[i] - Math.log(ps[i]);
        if (w[i] > gmax) gmax = w[i];
      }
      return { kind: "gaps", domain: "int", n, w, ww, stats: `largest gap ${gmax} below ${fmt(p.N)}` };
    },
  },
  mobius: {
    label: "Möbius μ(n)", domain: "int",
    blurb: "−1, 0, +1 by squarefree parity",
    params: [{ key: "N", label: "range n ≤", min: 2000, max: 60000, step: 1000, def: 50000 }],
    gen: (p) => {
      const mu = mobiusUpTo(p.N);
      const n = new Float64Array(p.N), w = new Float64Array(p.N);
      for (let i = 1; i <= p.N; i++) { n[i - 1] = i; w[i - 1] = mu[i]; }
      return { kind: "mobius", domain: "int", n, w, ww: w, stats: `μ over n ≤ ${fmt(p.N)}` };
    },
  },
  zeta: {
    label: "ζ on the critical line", domain: "curve",
    blurb: "ζ(½ + it), Dirichlet-eta summed",
    params: [{ key: "tMax", label: "height t ≤", min: 15, max: 100, step: 1, def: 60 }],
    gen: (p) => {
      const t0 = performance.now();
      const S = Math.min(2200, Math.max(420, Math.round(p.tMax * 18)));
      const n = new Float64Array(S), re = new Float64Array(S), im = new Float64Array(S), w = new Float64Array(S);
      for (let i = 0; i < S; i++) {
        const t = (i / (S - 1)) * p.tMax;
        const [r, m] = zetaHalf(t);
        n[i] = t; re[i] = r; im[i] = m; w[i] = Math.hypot(r, m);
      }
      const zc = ZEROS.filter((z) => z <= p.tMax).length;
      const ms = Math.round(performance.now() - t0);
      return { kind: "zeta", domain: "curve", n, w, ww: w, re, im, stats: `${zc} zeros below t = ${p.tMax} · summed in ${ms} ms` };
    },
  },
  zeros: {
    label: "Nontrivial zeros", domain: "zeros",
    blurb: "known ½ + itₖ, k ≤ 29",
    params: [{ key: "tMax", label: "height t ≤", min: 15, max: 100, step: 1, def: 100 }],
    gen: (p) => {
      const zs = ZEROS.filter((z) => z <= p.tMax);
      const n = Float64Array.from(zs), w = new Float64Array(zs.length);
      for (let i = 0; i < zs.length; i++) w[i] = (i + 1 < zs.length ? zs[i + 1] - zs[i] : w[i - 1] || 0);
      return { kind: "zeros", domain: "zeros", n, w, ww: w, stats: `first ${zs.length} zeros of ζ` };
    },
  },
};

/* ═══════════════════════ PLANES — where they live ═══════════════════════
   map(data, p) → { xs, ys, mode: points|path|step|orbs, bounds?, decor? } */

const PLANES = {
  ulam: {
    label: "Ulam square spiral", accepts: ["int"],
    map: (d) => {
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      for (let i = 0; i < L; i++) { const [x, y] = ulamXY(d.n[i]); xs[i] = x; ys[i] = y; }
      return { xs, ys, mode: "points" };
    },
  },
  sacks: {
    label: "Sacks spiral", accepts: ["int"],
    map: (d) => {
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      for (let i = 0; i < L; i++) {
        const r = Math.sqrt(d.n[i]), th = 2 * Math.PI * r;
        xs[i] = r * Math.cos(th); ys[i] = r * Math.sin(th);
      }
      return { xs, ys, mode: "points" };
    },
  },
  polar: {
    label: "Polar  θ = α·n", accepts: ["int", "curve"],
    params: [{ key: "alpha", label: "α (radians)", min: 0.05, max: 6.3, step: 0.005, def: 1 }],
    map: (d, p) => {
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      const curve = d.domain === "curve";
      for (let i = 0; i < L; i++) {
        const r = curve ? d.w[i] : d.n[i];
        const th = p.alpha * d.n[i];
        xs[i] = r * Math.cos(th); ys[i] = r * Math.sin(th);
      }
      return { xs, ys, mode: curve ? "path" : "points", decor: curve ? decorOrigin : null };
    },
  },
  clock: {
    label: "Modular clock", accepts: ["int"],
    params: [{ key: "mod", label: "modulus m", min: 3, max: 60, step: 1, def: 12 }],
    map: (d, p) => {
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      const m = Math.max(2, Math.round(p.mod));
      let rmax = 0;
      for (let i = 0; i < L; i++) {
        const r = Math.sqrt(d.n[i]);
        const th = (2 * Math.PI * (d.n[i] % m)) / m - Math.PI / 2;
        xs[i] = r * Math.cos(th); ys[i] = r * Math.sin(th);
        if (r > rmax) rmax = r;
      }
      const pad = rmax * 1.18;
      return {
        xs, ys, mode: "points",
        bounds: { x0: -pad, x1: pad, y0: -pad, y1: pad },
        decor: (ctx, px, th2) => {
          ctx.strokeStyle = th2.faint; ctx.lineWidth = 1; ctx.setLineDash([2, 5]);
          ctx.beginPath();
          for (let a = 0; a <= 240; a++) {
            const t = (a / 240) * 2 * Math.PI;
            const [sx, sy] = px(rmax * 1.06 * Math.cos(t), rmax * 1.06 * Math.sin(t));
            if (a === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = th2.dim; ctx.font = `10px ${th2.mono}`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          const step = m <= 16 ? 1 : Math.ceil(m / 16);
          for (let k = 0; k < m; k += step) {
            const t = (2 * Math.PI * k) / m - Math.PI / 2;
            const [sx, sy] = px(rmax * 1.13 * Math.cos(t), rmax * 1.13 * Math.sin(t));
            ctx.fillText(String(k), sx, sy);
          }
        },
      };
    },
  },
  graph: {
    label: "Function graph", accepts: ["int", "curve", "zeros"],
    map: (d, p) => {
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      if (d.kind === "primes") {
        for (let i = 0; i < L; i++) { xs[i] = d.n[i]; ys[i] = i + 1; }
        return {
          xs, ys, mode: "step",
          bounds: padBounds(xs, ys, 0.05, { y0: 0 }),
          decor: (ctx, px, th2) => { // x / ln x comparison
            ctx.strokeStyle = th2.amber; ctx.globalAlpha = 0.65; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
            ctx.beginPath();
            const X = d.n[L - 1];
            for (let i = 0; i <= 200; i++) {
              const x = 3 + (i / 200) * (X - 3);
              const [sx, sy] = px(x, x / Math.log(x));
              if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
            }
            ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
            ctx.fillStyle = th2.amber; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "right";
            const [lx, ly] = px(X, X / Math.log(X));
            ctx.fillText("x / ln x", lx - 6, ly + 14);
          },
        };
      }
      if (d.kind === "zeta") {
        for (let i = 0; i < L; i++) { xs[i] = d.n[i]; ys[i] = d.w[i]; }
        return {
          xs, ys, mode: "path",
          bounds: padBounds(xs, ys, 0.06, { y0: -0.15 }),
          decor: (ctx, px, th2) => {
            ctx.font = `10px ${th2.mono}`;
            const zs = ZEROS.filter((z) => z <= d.n[L - 1]);
            zs.forEach((z, i) => {
              const [sx, sy0] = px(z, 0);
              const [, syT] = px(z, padTop(ys));
              ctx.strokeStyle = th2.faint; ctx.setLineDash([2, 5]); ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(sx, sy0); ctx.lineTo(sx, syT); ctx.stroke(); ctx.setLineDash([]);
              ctx.fillStyle = th2.rose;
              ctx.beginPath(); ctx.arc(sx, sy0, 2.6, 0, 7); ctx.fill();
              if (i === 0) { ctx.fillStyle = th2.dim; ctx.textAlign = "left"; ctx.fillText("t₁ ≈ 14.134…", sx + 6, sy0 - 8); }
            });
            baseline(ctx, px, th2, xs[0], xs[L - 1]);
          },
        };
      }
      if (d.kind === "zeros") {
        for (let i = 0; i < L; i++) { xs[i] = d.n[i]; ys[i] = d.w[i]; }
        const mean = avg(ys);
        return {
          xs, ys, mode: "orbs",
          bounds: padBounds(xs, ys, 0.12, { y0: 0 }),
          decor: (ctx, px, th2) => {
            const [x0, ym] = px(xs[0], mean); const [x1] = px(xs[L - 1], mean);
            ctx.strokeStyle = th2.faint; ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(x0, ym); ctx.lineTo(x1, ym); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = th2.dim; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "left";
            ctx.fillText(`mean spacing ≈ ${mean.toFixed(2)}  (consecutive zeros repel — GUE statistics)`, x0, ym - 8);
          },
        };
      }
      for (let i = 0; i < L; i++) { xs[i] = d.n[i]; ys[i] = d.w[i]; }   // gaps, möbius
      return { xs, ys, mode: "points", bounds: padBounds(xs, ys, 0.07), decor: (c, px, t2) => baseline(c, px, t2, xs[0], xs[L - 1]) };
    },
  },
  walk: {
    label: "Cumulative walk", accepts: ["int"],
    map: (d) => {
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      let acc = 0;
      for (let i = 0; i < L; i++) { acc += d.ww[i]; xs[i] = d.n[i]; ys[i] = acc; }
      return {
        xs, ys, mode: "path",
        bounds: padBounds(xs, ys, 0.08),
        decor: (ctx, px, th2) => {
          baseline(ctx, px, th2, xs[0], xs[L - 1]);
          const end = ys[L - 1];
          const [ex, ey] = px(xs[L - 1], end);
          ctx.fillStyle = th2.ink; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "right";
          ctx.fillText(`Σ = ${Math.round(end)}`, ex - 4, ey - 8);
        },
      };
    },
  },
  argand: {
    label: "Argand trace (ℂ)", accepts: ["curve"],
    map: (d) => {
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      for (let i = 0; i < L; i++) { xs[i] = d.re[i]; ys[i] = d.im[i]; }
      return {
        xs, ys, mode: "path", bounds: padBounds(xs, ys, 0.1),
        decor: (ctx, px, th2) => {
          decorOrigin(ctx, px, th2);
          ctx.fillStyle = th2.dim; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "left";
          const [ox, oy] = px(0, 0);
          ctx.fillText("every loop through 0 is a zero of ζ", ox + 10, oy - 10);
        },
      };
    },
  },
  strip: {
    label: "Critical strip", accepts: ["zeros"],
    map: (d, p) => {
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      const top = (p.tMax || 100) * 1.03;
      for (let i = 0; i < L; i++) { xs[i] = 0.5; ys[i] = d.n[i]; }
      return {
        xs, ys, mode: "orbs",
        bounds: { x0: -0.9, x1: 1.9, y0: -top * 0.04, y1: top },
        decor: (ctx, px, th2) => {
          const [sx0, syT] = px(0, top); const [sx1, syB] = px(1, 0);
          ctx.fillStyle = "rgba(125,211,252,0.05)";
          ctx.fillRect(sx0, syT, sx1 - sx0, syB - syT);
          ctx.strokeStyle = th2.faint; ctx.lineWidth = 1;
          [0, 1].forEach((x) => { const [sx] = px(x, 0); ctx.beginPath(); ctx.moveTo(sx, syT); ctx.lineTo(sx, syB); ctx.stroke(); });
          const [cx] = px(0.5, 0);
          ctx.strokeStyle = th2.ion; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(cx, syT); ctx.lineTo(cx, syB); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = th2.dim; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "center";
          ctx.fillText("0", px(0, 0)[0], syB + 14); ctx.fillText("1", px(1, 0)[0], syB + 14);
          ctx.fillStyle = th2.ion; ctx.fillText("Re(s) = ½", cx, syB + 14);
          ctx.fillStyle = th2.dim; ctx.textAlign = "left";
          ctx.fillText("the hypothesis: nothing lives off this line", cx + 12, syT + 14);
        },
      };
    },
  },
};

/* ═══════════════════════ LENSES — how they glow ═══════════════════════ */

const NB = 48;
const LENSES = {
  aurora: {
    label: "Aurora (sequence)",
    palette: () => ramp((t) => `hsl(${195 + 140 * t} 90% ${58 + 12 * t}%)`),
    bucket: (d, i, L) => Math.min(NB - 1, Math.floor((i / L) * NB)),
  },
  residue: {
    label: "Residue classes",
    params: [{ key: "kres", label: "color by n mod k", min: 2, max: 30, step: 1, def: 6 }],
    palette: (p) => ramp((t) => `hsl(${Math.floor(t * 360)} 85% 62%)`),
    bucket: (d, i, L, p) => {
      const k = Math.max(2, Math.round(p.kres || 6));
      return Math.min(NB - 1, Math.floor(((d.n[i] % k) / k) * NB));
    },
  },
  signal: {
    label: "Signal (±)",
    palette: () => { const a = new Array(NB); for (let i = 0; i < NB; i++) a[i] = i < 16 ? T.rose : i < 32 ? T.slate : T.ion; return a; },
    bucket: (d, i) => (d.w[i] > 1e-12 ? 40 : d.w[i] < -1e-12 ? 8 : 24),
  },
  pulse: {
    label: "Pulse (magnitude)",
    palette: () => ramp((t) => `hsl(${215 - 175 * t} ${70 + 25 * t}% ${48 + 28 * t}%)`),
    bucket: (d, i, L, p, lo, span) => Math.min(NB - 1, Math.max(0, Math.floor(((d.w[i] - lo) / span) * NB))),
    needsRange: true,
  },
  mono: {
    label: "Ion mono",
    palette: () => new Array(NB).fill(T.ion),
    bucket: () => 24,
  },
};
function ramp(f) { const a = new Array(NB); for (let i = 0; i < NB; i++) a[i] = f(i / (NB - 1)); return a; }

function neat(x, digits = 4) {
  if (!Number.isFinite(x)) return "n/a";
  const ax = Math.abs(x);
  if (ax >= 10000) return fmt(Math.round(x));
  if (ax >= 100) return x.toFixed(1);
  if (ax >= 10) return x.toFixed(2);
  return x.toFixed(digits);
}

function patchGuide(cfg, data) {
  const source = SOURCES[cfg.source], plane = PLANES[cfg.plane], lens = LENSES[cfg.lens];
  const count = data && data.n ? fmt(data.n.length) : "the selected";
  const N = cfg.p.N ? fmt(cfg.p.N) : null;
  const dot = {
    primes: `Each dot is one prime p${N ? ` from the ${count} primes up to ${N}` : ""}.`,
    gaps: `Each point is one gap between consecutive primes: next prime minus p.`,
    mobius: `Each point is one integer n; the signal is mu(n), which is -1, 0, or +1.`,
    zeta: `Each sample is zeta(1/2 + it) at one height t, not an individual prime.`,
    zeros: `Each dot is one known nontrivial zeta zero height t_k.`,
  }[cfg.source] || `Each item comes from ${source.label}.`;

  const position = (() => {
    if (cfg.plane === "ulam") return "Integers are written on a square spiral; this source marks the positions that survive the source filter.";
    if (cfg.plane === "sacks") return "The number is wrapped onto a spiral with r = sqrt(n) and theta = 2*pi*sqrt(n).";
    if (cfg.plane === "polar") return `The angle is alpha*n, currently alpha = ${(+cfg.p.alpha).toFixed(3)}; radius comes from n or |zeta|.`;
    if (cfg.plane === "clock") return `The spoke is n mod ${Math.round(cfg.p.mod || 12)} and radius grows like sqrt(n).`;
    if (cfg.plane === "walk") return "X moves along n; Y is the cumulative total of the source signal.";
    if (cfg.plane === "argand") return "The complex zeta value becomes a point: x = Re(zeta), y = Im(zeta).";
    if (cfg.plane === "strip") return "Zeros are placed at x = 1/2 and y = t_k inside the critical strip.";
    if (cfg.plane === "graph" && cfg.source === "primes") return "X is prime p; Y is pi(p), the count of primes up to p.";
    if (cfg.plane === "graph" && cfg.source === "gaps") return "X is prime p; Y is the following prime gap.";
    if (cfg.plane === "graph" && cfg.source === "zeta") return "X is height t; Y is |zeta(1/2 + it)|.";
    if (cfg.plane === "graph" && cfg.source === "zeros") return "X is the zero height; Y is spacing to the next zero.";
    return `The ${plane.label} plane decides the x/y position.`;
  })();

  const color = (() => {
    if (cfg.lens === "mono") return "One color only; read the geometry without a second variable.";
    if (cfg.lens === "aurora") return "Color follows order through the sequence from first to last.";
    if (cfg.lens === "signal") return "Color separates positive, negative, and zero signal values.";
    if (cfg.lens === "pulse") return "Color follows magnitude; stronger values move through the palette.";
    if (cfg.lens === "residue" && data && data.domain !== "int") return "Residue coloring needs integer data, so this view falls back to sequence color.";
    if (cfg.lens === "residue") return `Color is n mod ${Math.round(cfg.p.kres || 6)}. Matching colors share the same residue class.`;
    return `${lens.label} controls how each item glows.`;
  })();

  const lookFor = (() => {
    const key = `${cfg.source}:${cfg.plane}`;
    const notes = {
      "primes:sacks": "Look for curved streaks. They often reveal prime-rich polynomial paths.",
      "primes:ulam": "Look for diagonal streaks. Sparse diagonals and dense diagonals both matter.",
      "primes:polar": "Turn alpha slowly and watch for spokes or petals that suddenly lock in.",
      "primes:clock": "Empty spokes are usually impossible residue classes, not missing data.",
      "primes:walk": "Watch which residue class leads, then see whether the lead persists as N grows.",
      "gaps:graph": "Tall spikes are unusually large prime gaps; the baseline slowly drifts upward.",
      "mobius:walk": "Read it as balance. Long drift means one Mobius sign has led for a while.",
      "zeta:graph": "Deep dips toward zero mark zero heights on the critical line.",
      "zeta:argand": "Loops passing through the origin correspond to zeta zeros.",
      "zeros:strip": "The visual question is whether zeros stay on the center line Re(s) = 1/2.",
      "zeros:graph": "Compare each spacing with the mean line; nearby zeros tend to repel.",
    };
    return notes[key] || "Increase the range and see which structures persist instead of disappearing.";
  })();

  return [
    ["Dot", dot],
    ["Position", position],
    ["Color", color],
    ["Look For", lookFor],
  ];
}

function labGuide(lab, labData) {
  if (lab.domain === "complex") {
    return [
      ["Sample", "Each pixel is one complex input s = sigma + i*t."],
      ["Relationship", "Your node graph compiles into w(s), the complex relationship being painted."],
      ["Color", "Hue shows arg(w(s)); brightness follows |w(s)|. Dark spots are low-magnitude outputs."],
      ["Look For", (lab.ew || "").includes("zeta") ? "This template uses zeta, but any complex relationship can be connected to w." : "Look for repeating color cycles, poles, and zero-like dark points."],
    ];
  }
  const variable = lab.domain === "int" ? "n" : "t";
  const zetaNote = lab.domain === "real" && /zeta/.test(lab.ey || "")
    ? ` With a = ${(+lab.a).toFixed(3)}, dips hit zero only when the path crosses actual zeros.`
    : "";
  return [
    ["Sample", lab.domain === "int" ? "Each point samples one integer n." : "Each point samples one height t on a real line."],
    ["Relationship", `The graph compiles to x(${variable}), y(${variable}), and optional hue(${variable}).`],
    ["Color", lab.eh && lab.eh.trim() ? `Color comes from the relationship connected to hue(${variable}).` : "No hue relationship is active, so color is used as a neutral trace."],
    ["Look For", `${labData && labData.err ? "The last valid render stays visible while the graph has an error. " : ""}Drag new objects in, connect relationships, then turn knobs a and b.${zetaNote}`],
  ];
}

function hoverInfo(mode, cfg, data, lab, labData, idx) {
  if (mode === "patch") {
    const n = data.n && data.n[idx];
    if (data.kind === "primes") {
      const p = Math.round(n);
      const lines = [`p = ${fmt(p)}`, `prime #${fmt(idx + 1)}`, `p mod 4 = ${p % 4}`];
      if (cfg.lens === "residue") {
        const k = Math.max(2, Math.round(cfg.p.kres || 6));
        lines.push(`p mod ${k} = ${p % k}`);
      }
      return { title: "Prime", lines };
    }
    if (data.kind === "gaps") {
      return { title: "Prime Gap", lines: [`p = ${fmt(Math.round(n))}`, `next gap = ${fmt(Math.round(data.w[idx]))}`, `gap - ln(p) = ${neat(data.ww[idx], 3)}`] };
    }
    if (data.kind === "mobius") {
      return { title: "Mobius", lines: [`n = ${fmt(Math.round(n))}`, `mu(n) = ${Math.round(data.w[idx])}`] };
    }
    if (data.kind === "zeta") {
      return { title: "Zeta Sample", lines: [`t = ${neat(n, 3)}`, `|zeta| = ${neat(data.w[idx], 4)}`, `Re = ${neat(data.re[idx], 4)}`, `Im = ${neat(data.im[idx], 4)}`] };
    }
    if (data.kind === "zeros") {
      return { title: "Zeta Zero", lines: [`zero #${idx + 1}`, `t_k = ${neat(n, 4)}`, `next spacing = ${neat(data.w[idx], 4)}`] };
    }
  }
  if (mode === "lab" && labData && labData.series) {
    const S = labData.series;
    return {
      title: "Lab Sample",
      lines: [
        `sample #${idx + 1} / ${fmt(S.L)}`,
        `x = ${neat(S.xs[idx], 4)}`,
        `y = ${neat(S.ys[idx], 4)}`,
        `hue = ${neat(S.hue[idx], 4)}`,
      ],
    };
  }
  return null;
}

function sceneProjector(scene, wrap, viewState) {
  if (!scene || scene.fieldMeta || !scene.xs || !scene.ys || !wrap) return null;
  const W = wrap.clientWidth, H = wrap.clientHeight;
  if (!W || !H || !scene.xs.length) return null;
  const b = scene.bounds || padBounds(scene.xs, scene.ys, 0.06);
  const M = 26;
  const sc = Math.min((W - 2 * M) / (b.x1 - b.x0 || 1), (H - 2 * M) / (b.y1 - b.y0 || 1));
  const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  return {
    W, H,
    projectX: (x) => (x - cx) * sc * viewState.z + W / 2 + viewState.ox,
    projectY: (y) => -(y - cy) * sc * viewState.z + H / 2 + viewState.oy,
    px: (x, y) => [(x - cx) * sc * viewState.z + W / 2 + viewState.ox, -(y - cy) * sc * viewState.z + H / 2 + viewState.oy],
  };
}

/* ───────────────────────── shared decor helpers ───────────────────────── */
function decorOrigin(ctx, px, th2) {
  const [ox, oy] = px(0, 0);
  ctx.strokeStyle = th2.faint; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ox - 9, oy); ctx.lineTo(ox + 9, oy); ctx.moveTo(ox, oy - 9); ctx.lineTo(ox, oy + 9); ctx.stroke();
}
function baseline(ctx, px, th2, x0, x1) {
  const [a, y] = px(x0, 0); const [b] = px(x1, 0);
  ctx.strokeStyle = th2.faint; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(b, y); ctx.stroke();
}
function padBounds(xs, ys, m, force = {}) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] < x0) x0 = xs[i]; if (xs[i] > x1) x1 = xs[i];
    if (ys[i] < y0) y0 = ys[i]; if (ys[i] > y1) y1 = ys[i];
  }
  if (force.y0 !== undefined) y0 = Math.min(y0, force.y0);
  const dx = (x1 - x0) || 1, dy = (y1 - y0) || 1;
  return { x0: x0 - dx * m, x1: x1 + dx * m, y0: y0 - dy * m, y1: y1 + dy * m };
}
function padTop(ys) { let m = -Infinity; for (let i = 0; i < ys.length; i++) if (ys[i] > m) m = ys[i]; return m; }
function avg(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
function fmt(x) { return x.toLocaleString("en-US"); }

/* ═══════════════════════ LIBRARY — stored interesting ways ═══════════════════════ */

const LIBRARY = [
  { name: "Sacks spiral", cfg: { source: "primes", plane: "sacks", lens: "mono", p: { N: 12000 } } },
  { name: "Ulam spiral", cfg: { source: "primes", plane: "ulam", lens: "mono", p: { N: 60000 } } },
  { name: "Polar α-dial", cfg: { source: "primes", plane: "polar", lens: "residue", p: { N: 20000, alpha: 1, kres: 6 } } },
  { name: "Critical line |ζ|", cfg: { source: "zeta", plane: "graph", lens: "mono", p: { tMax: 60 } } },
  { name: "Zeta pirouette", cfg: { source: "zeta", plane: "argand", lens: "aurora", p: { tMax: 34 } } },
  { name: "Zeros on the strip", cfg: { source: "zeros", plane: "strip", lens: "mono", p: { tMax: 100 } } },
  { name: "Mertens walk", cfg: { source: "mobius", plane: "walk", lens: "signal", p: { N: 50000 } } },
  { name: "Chebyshev race", cfg: { source: "primes", plane: "walk", lens: "signal", p: { N: 100000 } } },
  { name: "Gap skyline", cfg: { source: "gaps", plane: "graph", lens: "pulse", p: { N: 100000 } } },
  { name: "Prime clock m=30", cfg: { source: "primes", plane: "clock", lens: "residue", p: { N: 9000, mod: 30, kres: 30 } } },
];

function withDefaults(cfg) {
  const p = { ...(cfg.p || {}) };
  const defs = [
    ...(SOURCES[cfg.source].params || []),
    ...(PLANES[cfg.plane].params || []),
    ...(LENSES[cfg.lens].params || []),
  ];
  defs.forEach((d) => { if (p[d.key] === undefined) p[d.key] = d.def; });
  return { ...cfg, p };
}

/* ═══════════════════════ LAB — defaults, presets, evaluation ═══════════════════════ */

const DEFAULT_LAB = {
  domain: "real",            // 'int' | 'real' | 'complex'
  N: 6000, tMax: 60, sMax: 1.6,
  ex: "n", ey: "0", eh: "",
  ew: "s",
  a: 0.5, b: 2.399,
};
const withLabDefaults = (l) => ({ ...DEFAULT_LAB, ...(l || {}) });

const LAB_LIBRARY = [
  { name: "σ off the line", lab: { domain: "real", tMax: 60, ex: "t", ey: "abs(zeta(a+i*t))", eh: "arg(zeta(a+i*t))", a: 0.5 } },
  { name: "Pirouette off-line", lab: { domain: "real", tMax: 34, ex: "re(zeta(a+i*t))", ey: "im(zeta(a+i*t))", eh: "t", a: 0.5 } },
  { name: "ζ domain coloring", lab: { domain: "complex", tMax: 45, sMax: 1.6, ew: "zeta(s)" } },
  { name: "Moiré dot field", lab: { domain: "int", N: 6000, ex: "n*cos(a*n)", ey: "n*sin(a*n)", eh: "dot(exp(i*a*n), exp(i*b*n))", a: 1, b: 2.399 } },
];

const NODE_PALETTE = [
  { id: "src-n", group: "Domains", kind: "source", label: "integer n", params: { expr: "n" } },
  { id: "src-t", group: "Domains", kind: "source", label: "real t", params: { expr: "t" } },
  { id: "src-s", group: "Domains", kind: "source", label: "complex s", params: { expr: "s" } },
  { id: "custom", group: "Expressions", kind: "custom", label: "custom expr", params: { expr: "n" } },
  { id: "const", group: "Expressions", kind: "const", label: "constant", params: { value: "1" } },
  { id: "knob-a", group: "Expressions", kind: "knob", label: "knob a", params: { name: "a" } },
  { id: "knob-b", group: "Expressions", kind: "knob", label: "knob b", params: { name: "b" } },
  ...["sin", "cos", "exp", "log", "sqrt", "abs", "arg", "re", "im", "zeta", "mu", "M", "isprime", "pi", "gap", "omega", "bigomega", "tau", "phi", "rad"].map((fn) => ({
    id: `fn-${fn}`, group: fn === "zeta" ? "Functions" : "Functions", kind: "unary", label: fn, params: { fn },
  })),
  { id: "op-add", group: "Operators", kind: "binary", label: "add", params: { op: "+" } },
  { id: "op-sub", group: "Operators", kind: "binary", label: "subtract", params: { op: "-" } },
  { id: "op-mul", group: "Operators", kind: "binary", label: "multiply", params: { op: "*" } },
  { id: "op-div", group: "Operators", kind: "binary", label: "divide", params: { op: "/" } },
  { id: "op-pow", group: "Operators", kind: "binary", label: "power", params: { op: "^" } },
  { id: "op-mod", group: "Operators", kind: "binary", label: "mod", params: { op: "mod" } },
  { id: "chan-x", group: "Visual Channels", kind: "channel", label: "x position", params: { channel: "x" } },
  { id: "chan-y", group: "Visual Channels", kind: "channel", label: "y position", params: { channel: "y" } },
  { id: "chan-hue", group: "Visual Channels", kind: "channel", label: "color hue", params: { channel: "hue" } },
  { id: "chan-w", group: "Visual Channels", kind: "channel", label: "complex field w", params: { channel: "w" } },
];

const paletteById = Object.fromEntries(NODE_PALETTE.map((d) => [d.id, d]));
const NODE_INPUTS = { unary: ["value"], binary: ["left", "right"], channel: ["value"] };
const BINARY_SYMBOLS = new Set(["+", "-", "*", "/", "^"]);
let graphNodeSeq = 0;

function gnode(id, kind, label, x, y, params = {}) { return { id, kind, label, x, y, params }; }
function gedge(from, to, toPort = "value") { return { id: `${from}->${to}:${toPort}`, from, to, toPort }; }
function graphTemplate(name, domain, lab, nodes, edges) { return { name, graph: { domain, nodes, edges }, lab: withLabDefaults({ domain, ...lab }) }; }
function cloneGraph(g) { return JSON.parse(JSON.stringify(g)); }
function createNodeFromPalette(defId, x, y) {
  const def = paletteById[defId] || paletteById.custom;
  graphNodeSeq++;
  return { id: `${def.kind}-${graphNodeSeq}`, kind: def.kind, label: def.label, x, y, params: { ...(def.params || {}) } };
}
function nodeInputPorts(node) { return NODE_INPUTS[node.kind] || []; }
function nextInputPort(graph, node) {
  const ports = nodeInputPorts(node);
  if (!ports.length) return "value";
  const used = new Set(graph.edges.filter((e) => e.to === node.id).map((e) => e.toPort));
  return ports.find((p) => !used.has(p)) || ports[ports.length - 1];
}
function channelLabel(ch) {
  return ch === "x" ? "x" : ch === "y" ? "y" : ch === "hue" ? "hue" : "w";
}
function compileNodeExpr(id, graph, seen = new Set()) {
  const node = graph.nodes.find((n) => n.id === id);
  if (!node) throw new Error("missing node");
  if (seen.has(id)) throw new Error("cycle in graph");
  seen.add(id);
  const incoming = (port) => graph.edges.find((e) => e.to === id && e.toPort === port);
  const compileFrom = (edge) => edge ? compileNodeExpr(edge.from, graph, new Set(seen)) : null;
  if (node.kind === "source" || node.kind === "custom") return node.params.expr || "n";
  if (node.kind === "const") return String(node.params.value || "0");
  if (node.kind === "knob") return node.params.name === "b" ? "b" : "a";
  if (node.kind === "unary") {
    const v = compileFrom(incoming("value")) || "n";
    return `${node.params.fn || node.label}(${v})`;
  }
  if (node.kind === "binary") {
    const a = compileFrom(incoming("left")) || "n";
    const b = compileFrom(incoming("right")) || "a";
    const op = node.params.op || "+";
    return BINARY_SYMBOLS.has(op) ? `(${a}${op}${b})` : `${op}(${a},${b})`;
  }
  return node.params.expr || "n";
}
function compileGraphToLab(graph) {
  const domain = graph.domain || "int";
  const out = { domain };
  const channelNodes = graph.nodes.filter((n) => n.kind === "channel");
  channelNodes.forEach((node) => {
    const edge = graph.edges.find((e) => e.to === node.id && e.toPort === "value");
    if (!edge) return;
    const expr = compileNodeExpr(edge.from, graph);
    const ch = node.params.channel;
    if (ch === "x") out.ex = expr;
    if (ch === "y") out.ey = expr;
    if (ch === "hue") out.eh = expr;
    if (ch === "w") out.ew = expr;
  });
  if (domain === "complex") {
    out.ew = out.ew || "s";
  } else {
    const dv = domain === "real" ? "t" : "n";
    out.ex = out.ex || dv;
    out.ey = out.ey || "0";
    out.eh = out.eh || "";
  }
  return out;
}

const LAB_TEMPLATES = [
  graphTemplate("Blank canvas", "int", { N: 6000, ex: "n", ey: "0", eh: "" }, [
    gnode("n", "source", "integer n", 22, 40, { expr: "n" }),
    gnode("zero", "const", "zero", 22, 140, { value: "0" }),
    gnode("x", "channel", "x position", 210, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 210, 140, { channel: "y" }),
    gnode("hue", "channel", "color hue", 210, 240, { channel: "hue" }),
  ], [gedge("n", "x"), gedge("zero", "y")]),
  graphTemplate("Prime spiral", "int", { N: 9000, a: 1, b: 2.399 }, [
    gnode("xexpr", "custom", "spiral x", 22, 36, { expr: "n*cos(a*n)" }),
    gnode("yexpr", "custom", "spiral y", 22, 128, { expr: "n*sin(a*n)" }),
    gnode("prime", "custom", "prime test", 22, 220, { expr: "isprime(n)" }),
    gnode("x", "channel", "x position", 214, 36, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 128, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 220, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("yexpr", "y"), gedge("prime", "hue")]),
  graphTemplate("Mertens relation", "int", { N: 12000 }, [
    gnode("xexpr", "custom", "integer axis", 22, 40, { expr: "n" }),
    gnode("mertens", "custom", "M(n)", 22, 136, { expr: "M(n)" }),
    gnode("mu", "custom", "mu(n)", 22, 232, { expr: "mu(n)" }),
    gnode("x", "channel", "x position", 214, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 136, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 232, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("mertens", "y"), gedge("mu", "hue")]),
  graphTemplate("Prime gap skyline", "int", { N: 12000 }, [
    gnode("xexpr", "custom", "integer axis", 22, 40, { expr: "n" }),
    gnode("gap", "custom", "gap(n)", 22, 136, { expr: "gap(n)" }),
    gnode("x", "channel", "x position", 214, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 136, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 232, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("gap", "y"), gedge("gap", "hue")]),
  graphTemplate("Totient garden", "int", { N: 10000, a: 0.25 }, [
    gnode("xexpr", "custom", "rotated n", 22, 40, { expr: "n*cos(a*n)" }),
    gnode("totient", "custom", "phi(n)", 22, 136, { expr: "phi(n)" }),
    gnode("rad", "custom", "rad(n)", 22, 232, { expr: "rad(n)" }),
    gnode("x", "channel", "x position", 214, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 136, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 232, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("totient", "y"), gedge("rad", "hue")]),
  graphTemplate("Riemann hypothesis", "real", { tMax: 60, a: 0.5 }, [
    gnode("xexpr", "custom", "height t", 22, 40, { expr: "t" }),
    gnode("absz", "custom", "|zeta|", 22, 136, { expr: "abs(zeta(0.5+i*t))" }),
    gnode("argz", "custom", "arg zeta", 22, 232, { expr: "arg(zeta(0.5+i*t))" }),
    gnode("x", "channel", "x position", 214, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 136, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 232, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("absz", "y"), gedge("argz", "hue")]),
  graphTemplate("Zeta field", "complex", { tMax: 45, sMax: 1.6 }, [
    gnode("zeta", "custom", "zeta(s)", 24, 96, { expr: "zeta(s)" }),
    gnode("w", "channel", "complex field w", 220, 96, { channel: "w" }),
  ], [gedge("zeta", "w")]),
];

function integerLabTables(N) {
  const isp = sieve(N);
  const mu = mobiusUpTo(N);
  const pic = new Int32Array(N + 1);
  const mertens = new Int32Array(N + 1);
  const gap = new Int32Array(N + 1);
  const omega = new Int16Array(N + 1);
  const bigomega = new Int16Array(N + 1);
  const tau = new Int32Array(N + 1);
  const phi = new Int32Array(N + 1);
  const rad = new Int32Array(N + 1);
  tau.fill(1); rad.fill(1);
  for (let i = 0; i <= N; i++) phi[i] = i;
  let pc = 0, mc = 0, lastPrime = 0;
  for (let i = 0; i <= N; i++) {
    pc += isp[i]; pic[i] = pc;
    mc += mu[i] || 0; mertens[i] = mc;
    if (isp[i]) {
      if (lastPrime) gap[lastPrime] = i - lastPrime;
      lastPrime = i;
    }
  }
  for (let p = 2; p <= N; p++) if (isp[p]) {
    for (let j = p; j <= N; j += p) {
      omega[j]++;
      phi[j] -= Math.floor(phi[j] / p);
      rad[j] *= p;
      let q = j;
      while (q % p === 0) { bigomega[j]++; q = Math.floor(q / p); }
    }
  }
  for (let d = 2; d <= N; d++) for (let j = d; j <= N; j += d) tau[j]++;
  return { isp, mu, pic, mertens, gap, omega, bigomega, tau, phi, rad };
}

/* Evaluate x/y/hue formulas over ℤ or ℝ. Throws on parse/eval errors. */
function computeLabSeries(lab) {
  const t0 = performance.now();
  const isInt = lab.domain === "int";
  const dv = isInt ? "n" : "t";
  const ax = parseExpr(lab.ex && lab.ex.trim() ? lab.ex : dv);
  const ay = parseExpr(lab.ey && lab.ey.trim() ? lab.ey : "0");
  const ah = lab.eh && lab.eh.trim() ? parseExpr(lab.eh) : null;
  let tab = null;
  if (isInt) {
    const N = Math.max(10, Math.round(lab.N));
    tab = integerLabTables(N);
  }
  const fns = makeFns(tab);
  const L = isInt ? Math.round(lab.N) : 1200;
  const xs = new Float64Array(L), ys = new Float64Array(L), hue = new Float64Array(L);
  const env = { i: [0, 1], pi: [Math.PI, 0], e: [Math.E, 0], a: [lab.a, 0], b: [lab.b, 0] };
  for (let k = 0; k < L; k++) {
    env[dv] = [isInt ? k + 1 : (k / (L - 1)) * lab.tMax, 0];
    xs[k] = evalAst(ax, env, fns)[0];
    ys[k] = evalAst(ay, env, fns)[0];
    hue[k] = ah ? evalAst(ah, env, fns)[0] : 0;
  }
  let lo = Infinity, hi = -Infinity;
  for (let k = 0; k < L; k++) { if (hue[k] < lo) lo = hue[k]; if (hue[k] > hi) hi = hue[k]; }
  const usesZ = astUses(ax, "zeta") || astUses(ay, "zeta") || (ah ? astUses(ah, "zeta") : false);
  return {
    xs, ys, hue, hueLo: lo, hueSpan: hi - lo, L,
    mode: isInt ? "points" : "path",
    ms: Math.round(performance.now() - t0), usesZ,
  };
}

function caption(cfg, data) {
  const bits = [data.stats];
  if (cfg.source === "primes" && cfg.plane === "walk") {
    const lead = data._end > 0 ? `3-mod-4 leads by ${Math.round(data._end)}` : data._end < 0 ? `1-mod-4 leads by ${Math.round(-data._end)}` : "dead heat";
    bits.push(`Chebyshev race · ${lead}`);
  }
  if (cfg.source === "mobius" && cfg.plane === "walk") bits.push(`M(N) = ${Math.round(data._end)}`);
  if (cfg.plane === "polar" && cfg.source !== "zeta") bits.push(`α = ${(+cfg.p.alpha).toFixed(3)} rad`);
  return bits.filter(Boolean).join("  ·  ");
}

/* ═══════════════════════════════ THE INSTRUMENT ═══════════════════════════════ */

export default function PrimeVisuals() {
  const [cfg, setCfg] = useState(() => withDefaults(LIBRARY[0].cfg));
  const [mode, setMode] = useState("patch"); // 'patch' | 'lab'
  const [lab, setLab] = useState(() => withLabDefaults(LAB_TEMPLATES[0].lab));
  const [labGraph, setLabGraph] = useState(() => cloneGraph(LAB_TEMPLATES[0].graph));
  const [labEditor, setLabEditor] = useState("canvas");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [fieldNote, setFieldNote] = useState(""); // complex-field render status
  const [saved, setSaved] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [storageOk, setStorageOk] = useState(true);
  const [tick, setTick] = useState(0); // forces caption refresh after walk end value lands
  const [uiVisible, setUiVisible] = useState(true);
  const [hoverTip, setHoverTip] = useState(null);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const graphRef = useRef(null);
  const view = useRef({ z: 1, ox: 0, oy: 0 });
  const drag = useRef(null);
  const drawRef = useRef(() => {});
  const fieldCanvas = useRef(null);  // offscreen canvas for domain coloring
  const fieldGen = useRef(0);        // cancels stale progressive renders
  const focusRef = useRef(null);     // which formula field gets object-chip inserts
  const lastLab = useRef(null);      // last good lab result, kept through typos
  const hoverFrame = useRef(0);
  const hoverPoint = useRef(null);

  /* ----- pipeline computation (each stage re-runs only when ITS params change) ----- */
  const srcKey = (SOURCES[cfg.source].params || []).map((d) => cfg.p[d.key]).join("|");
  const planeKey = (PLANES[cfg.plane].params || []).map((d) => cfg.p[d.key]).join("|");
  const lensKey = (LENSES[cfg.lens].params || []).map((d) => cfg.p[d.key]).join("|");

  const data = useMemo(() => {
    const d = SOURCES[cfg.source].gen(cfg.p);
    let a = 0; for (let i = 0; i < d.ww.length; i++) a += d.ww[i];
    d._end = a;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.source, srcKey]);

  const mapped = useMemo(
    () => PLANES[cfg.plane].map(data, cfg.p),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, cfg.plane, planeKey]
  );

  const colors = useMemo(() => {
    const lens = LENSES[cfg.lens];
    const pal = lens.palette(cfg.p);
    const L = mapped.xs.length;
    const buckets = new Uint8Array(L);
    let lo = 0, span = 1;
    if (lens.needsRange) {
      lo = Infinity; let hi = -Infinity;
      for (let i = 0; i < L; i++) { if (data.w[i] < lo) lo = data.w[i]; if (data.w[i] > hi) hi = data.w[i]; }
      span = hi - lo || 1;
    }
    const intLens = cfg.lens === "residue" && data.domain !== "int";
    for (let i = 0; i < L; i++) {
      buckets[i] = intLens
        ? Math.min(NB - 1, Math.floor((i / L) * NB))      // residue on a curve falls back to sequence
        : lens.bucket(data, i, L, cfg.p, lo, span);
    }
    return { pal: intLens ? LENSES.aurora.palette() : pal, buckets };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mapped, cfg.lens, lensKey]);

  /* ----- LAB evaluation: formulas → series (or a field spec for ℂ) ----- */
  const labData = useMemo(() => {
    if (mode !== "lab") return null;
    try {
      if (lab.domain === "complex") {
        const ast = parseExpr(lab.ew && lab.ew.trim() ? lab.ew : "s");
        const out = {
          field: { ast, sMin: 0.05, sMax: lab.sMax, tMax: lab.tMax, usesZ: astUses(ast, "zeta") },
          err: null,
        };
        lastLab.current = out; return out;
      }
      const series = computeLabSeries(lab);
      const out = { series, err: null };
      lastLab.current = out; return out;
    } catch (e) {
      return { ...(lastLab.current || {}), err: e.message };
    }
  }, [mode, lab]);

  useEffect(() => {
    if (mode !== "lab" || labEditor !== "canvas") return;
    const compiled = compileGraphToLab(labGraph);
    setLab((prev) => {
      const next = withLabDefaults({ ...prev, ...compiled });
      const keys = ["domain", "ex", "ey", "eh", "ew"];
      return keys.every((k) => prev[k] === next[k]) ? prev : next;
    });
  }, [mode, labEditor, labGraph]);

  /* ----- unified scene: what draw() renders, whichever mode we're in ----- */
  const scene = useMemo(() => {
    if (mode === "patch") {
      return { xs: mapped.xs, ys: mapped.ys, mode: mapped.mode, bounds: mapped.bounds, decor: mapped.decor, pal: colors.pal, buckets: colors.buckets };
    }
    if (!labData) return { xs: new Float64Array(0), ys: new Float64Array(0), mode: "points", pal: [], buckets: new Uint8Array(0) };
    if (labData.field) {
      const f = labData.field;
      const AR = 0.72; // display the strip at a fixed pleasant aspect; axes carry the real units
      return { fieldMeta: f, bounds: { x0: 0, x1: AR, y0: 0, y1: 1 } };
    }
    const S = labData.series;
    if (!S) return { xs: new Float64Array(0), ys: new Float64Array(0), mode: "points", pal: [], buckets: new Uint8Array(0) };
    const buckets = new Uint8Array(S.L);
    const span = S.hueSpan;
    for (let i = 0; i < S.L; i++) {
      buckets[i] = span > 1e-12 ? Math.min(NB - 1, Math.floor(((S.hue[i] - S.hueLo) / span) * NB)) : 24;
    }
    const pal = span > 1e-12 ? ramp((t) => `hsl(${(190 + 320 * t) % 360} 88% 60%)`) : new Array(NB).fill(T.ion);
    const showZeros = lab.domain === "real" && /zeta/.test(lab.ey || "") && (lab.ex || "").trim() === "t";
    const decor = (ctx, px, th2) => {
      baseline(ctx, px, th2, S.xs[0] || 0, S.xs[S.L - 1] || 1);
      if (showZeros) {
        ctx.fillStyle = th2.rose;
        ZEROS.filter((z) => z <= lab.tMax).forEach((z) => {
          const [sx, sy] = px(z, 0);
          ctx.beginPath(); ctx.arc(sx, sy, 2.6, 0, 7); ctx.fill();
        });
        ctx.fillStyle = th2.dim; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "left";
        const [lx, ly] = px(ZEROS[0], 0);
        ctx.fillText("known zeros (they live at σ = ½)", lx + 8, ly + 14);
      }
    };
    return { xs: S.xs, ys: S.ys, mode: S.mode, bounds: padBounds(S.xs, S.ys, 0.07, { y0: 0 }), decor, pal, buckets };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, mapped, colors, labData, lab.tMax, lab.ey, lab.ex, lab.domain]);

  /* ----- renderer ----- */
  const draw = useCallback(() => {
    const cv = canvasRef.current, wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const W = wrap.clientWidth, H = wrap.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = T.void; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.75);
    g.addColorStop(0, "rgba(60,80,140,0.10)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const { xs, ys, mode: dmode } = scene.fieldMeta ? { xs: null, ys: null, mode: "field" } : scene;
    const b = scene.bounds || (xs ? padBounds(xs, ys, 0.06) : { x0: 0, x1: 1, y0: 0, y1: 1 });
    const M = 26;
    const sc = Math.min((W - 2 * M) / (b.x1 - b.x0 || 1), (H - 2 * M) / (b.y1 - b.y0 || 1));
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    const v = view.current;
    const px = (x, y) => [(x - cx) * sc * v.z + W / 2 + v.ox, -(y - cy) * sc * v.z + H / 2 + v.oy];

    /* ── complex field: blit the progressively-rendered domain coloring ── */
    if (scene.fieldMeta) {
      const f = scene.fieldMeta;
      const [X0, Y0] = px(b.x0, b.y1), [X1, Y1] = px(b.x1, b.y0);
      if (fieldCanvas.current) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(fieldCanvas.current, X0, Y0, X1 - X0, Y1 - Y0);
      }
      const sigToX = (s) => b.x0 + ((s - f.sMin) / (f.sMax - f.sMin)) * (b.x1 - b.x0);
      const tToY = (t) => (t / f.tMax) * (b.y1 - b.y0);
      ctx.font = `10px ${T.mono}`;
      // σ ticks
      ctx.fillStyle = T.dim; ctx.textAlign = "center";
      [0.5, 1, 1.5].filter((s) => s <= f.sMax).forEach((s) => {
        const [sx, sy] = px(sigToX(s), 0);
        ctx.fillText(s === 0.5 ? "½" : String(s), sx, sy + 14);
      });
      // t ticks
      ctx.textAlign = "right";
      for (let t = 10; t <= f.tMax; t += 10) {
        const [sx, sy] = px(b.x0, tToY(t));
        ctx.fillText(`t=${t}`, sx - 6, sy + 3);
      }
      // the critical line
      const [clx, clTop] = px(sigToX(0.5), b.y1); const [, clBot] = px(sigToX(0.5), b.y0);
      ctx.strokeStyle = T.ion; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.2; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(clx, clTop); ctx.lineTo(clx, clBot); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = T.ion; ctx.textAlign = "left";
      ctx.fillText("σ = ½ — the dark points sit only here", clx + 8, clTop + 14);
      // pole marker at s = 1 (if it's in frame)
      if (f.sMax >= 1) {
        const [pxx, pyy] = px(sigToX(1), tToY(0));
        ctx.fillStyle = T.amber; ctx.textAlign = "left";
        ctx.fillText("← pole at s = 1", pxx + 6, pyy - 8);
      }
      return;
    }

    const L = xs.length; if (!L) return;
    const { pal, buckets } = scene;

    if (dmode === "points") {
      ctx.globalCompositeOperation = "lighter";
      const s = L < 2500 ? 3 : L < 16000 ? 2.3 : 1.7;
      const groups = []; for (let k = 0; k < NB; k++) groups.push([]);
      for (let i = 0; i < L; i++) groups[buckets[i]].push(i);
      for (let k = 0; k < NB; k++) {
        const idx = groups[k]; if (!idx.length) continue;
        ctx.fillStyle = pal[k]; ctx.globalAlpha = 0.92;
        for (let j = 0; j < idx.length; j++) {
          const [sx, sy] = px(xs[idx[j]], ys[idx[j]]);
          if (sx < -4 || sy < -4 || sx > W + 4 || sy > H + 4) continue;
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    } else if (dmode === "orbs") {
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < L; i++) {
        const [sx, sy] = px(xs[i], ys[i]);
        ctx.fillStyle = pal[buckets[i]];
        ctx.shadowColor = pal[buckets[i]]; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, 7); ctx.fill();
      }
      ctx.shadowBlur = 0;
    } else {
      const heavyPath = L > 24000;
      const simplifyPx = heavyPath ? 0.85 : 0;
      ctx.lineWidth = heavyPath ? 1.1 : 1.6; ctx.lineJoin = "round";
      ctx.shadowBlur = heavyPath ? 0 : 7;
      let i0 = 0;
      while (i0 < L - 1) {
        let i1 = i0 + 1;
        while (i1 < L - 1 && buckets[i1] === buckets[i0] && i1 - i0 < 80) i1++;
        ctx.strokeStyle = pal[buckets[i0]]; ctx.shadowColor = pal[buckets[i0]];
        ctx.beginPath();
        let [sx, sy] = px(xs[i0], ys[i0]); ctx.moveTo(sx, sy);
        let lastDrawX = sx, lastDrawY = sy;
        for (let i = i0 + 1; i <= i1; i++) {
          const [nx, ny] = px(xs[i], ys[i]);
          if (simplifyPx && i < i1 && Math.abs(nx - lastDrawX) < simplifyPx && Math.abs(ny - lastDrawY) < simplifyPx) continue;
          if (dmode === "step") ctx.lineTo(nx, sy);
          ctx.lineTo(nx, ny); sx = nx; sy = ny;
          lastDrawX = nx; lastDrawY = ny;
        }
        ctx.stroke();
        i0 = i1;
      }
      ctx.shadowBlur = 0;
    }

    if (scene.decor) scene.decor(ctx, px, T);
  }, [scene]);

  useEffect(() => { drawRef.current = draw; draw(); }, [draw]);
  useEffect(() => { view.current = { z: 1, ox: 0, oy: 0 }; setTick((t) => t + 1); }, [cfg.source, cfg.plane, mode, lab.domain]);

  /* ----- progressive domain coloring of w(s) over the strip ----- */
  useEffect(() => {
    if (mode !== "lab" || !labData || !labData.field) { fieldGen.current++; setFieldNote(""); return; }
    const f = labData.field;
    const gen = ++fieldGen.current;
    const COLS = 170, ROWS = 230;
    if (!fieldCanvas.current) fieldCanvas.current = document.createElement("canvas");
    const oc = fieldCanvas.current; oc.width = COLS; oc.height = ROWS;
    const octx = oc.getContext("2d");
    const img = octx.createImageData(COLS, ROWS);
    for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255;
    const fns = makeFns(null);
    const env = { i: [0, 1], pi: [Math.PI, 0], e: [Math.E, 0], a: [lab.a, 0], b: [lab.b, 0], s: [0, 0] };
    let col = 0;
    const t0 = performance.now();
    const stepFn = () => {
      if (gen !== fieldGen.current) return; // a newer render superseded this one
      const start = performance.now();
      while (col < COLS && performance.now() - start < 14) {
        const sig = f.sMin + (col / (COLS - 1)) * (f.sMax - f.sMin);
        for (let row = 0; row < ROWS; row++) {
          env.s = [sig, (1 - row / (ROWS - 1)) * f.tMax];
          let z; try { z = evalAst(f.ast, env, fns); } catch (e) { z = [0, 0]; }
          let r, g2, bl;
          if (!isFinite(z[0]) || !isFinite(z[1])) { r = g2 = bl = 255; }
          else {
            const mag = Math.hypot(z[0], z[1]);
            const h = (Math.atan2(z[1], z[0]) + Math.PI) / (2 * Math.PI);
            const l0 = mag / (1 + mag);
            const bb = Math.log2(mag + 1e-9), mf = bb - Math.floor(bb);
            const Lt = Math.min(0.97, (0.10 + 0.78 * l0) * (0.84 + 0.16 * mf));
            const St = Math.min(1, 0.95 - 0.55 * l0);
            const rgb = hslPx(h, St, Lt); r = rgb[0]; g2 = rgb[1]; bl = rgb[2];
          }
          const o = (row * COLS + col) * 4;
          img.data[o] = r; img.data[o + 1] = g2; img.data[o + 2] = bl;
        }
        col++;
      }
      octx.putImageData(img, 0, 0);
      drawRef.current();
      if (col < COLS) {
        setFieldNote(`painting w(s) over the strip … ${Math.round((100 * col) / COLS)}%`);
        requestAnimationFrame(stepFn);
      } else {
        setFieldNote(`${COLS}×${ROWS} field · ${Math.round(performance.now() - t0)} ms · hue = arg, brightness = |w|`);
      }
    };
    requestAnimationFrame(stepFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, labData]);

  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const ro = new ResizeObserver(() => drawRef.current());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const onWheel = (e) => {
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const f = Math.exp(-e.deltaY * 0.0014);
      const v = view.current;
      const W = r.width, H = r.height;
      v.ox = mx - (mx - (v.ox + W / 2)) * f - W / 2;
      v.oy = my - (my - (v.oy + H / 2)) * f - H / 2;
      v.z *= f;
      drawRef.current();
    };
    cv.addEventListener("wheel", onWheel, { passive: false });
    return () => cv.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e) => {
    setHoverTip(null);
    drag.current = { x: e.clientX, y: e.clientY, ox: view.current.ox, oy: view.current.oy };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (drag.current) {
      setHoverTip(null);
      view.current.ox = drag.current.ox + (e.clientX - drag.current.x);
      view.current.oy = drag.current.oy + (e.clientY - drag.current.y);
      drawRef.current();
      return;
    }
    scheduleInspect(e);
  };
  const onPointerUp = () => { drag.current = null; };
  const onPointerLeave = () => {
    hoverPoint.current = null;
    if (hoverFrame.current) {
      cancelAnimationFrame(hoverFrame.current);
      hoverFrame.current = 0;
    }
    if (!drag.current) setHoverTip(null);
  };
  const zoomBy = (f) => { view.current.z *= f; drawRef.current(); };
  const resetView = () => { view.current = { z: 1, ox: 0, oy: 0 }; drawRef.current(); };

  const scheduleInspect = (e) => {
    hoverPoint.current = { clientX: e.clientX, clientY: e.clientY };
    if (hoverFrame.current) return;
    hoverFrame.current = requestAnimationFrame(() => {
      hoverFrame.current = 0;
      inspectPointer();
    });
  };

  const inspectPointer = () => {
    if (!uiVisible || scene.fieldMeta || !scene.xs || !scene.ys) { setHoverTip(null); return; }
    const wrap = wrapRef.current;
    const projector = sceneProjector(scene, wrap, view.current);
    const point = hoverPoint.current;
    if (!wrap || !projector || !point) { setHoverTip(null); return; }
    const rect = wrap.getBoundingClientRect();
    const mx = point.clientX - rect.left, my = point.clientY - rect.top;
    const threshold = scene.mode === "orbs" ? 11 : scene.mode === "points" ? 8 : 10;
    const threshold2 = threshold * threshold;
    let best = -1, bestD = threshold2;
    const xs = scene.xs, ys = scene.ys;
    const maxChecks = scene.mode === "points" ? 30000 : 9000;
    const stride = Math.max(1, Math.ceil(xs.length / maxChecks));
    for (let i = 0; i < xs.length; i += stride) {
      const sx = projector.projectX(xs[i]);
      const sy = projector.projectY(ys[i]);
      if (sx < -threshold || sy < -threshold || sx > projector.W + threshold || sy > projector.H + threshold) continue;
      const dx = sx - mx, dy = sy - my, d2 = dx * dx + dy * dy;
      if (d2 <= bestD) { best = i; bestD = d2; }
    }
    if (best < 0) { setHoverTip(null); return; }
    const info = hoverInfo(mode, cfg, data, lab, labData, best);
    if (!info) { setHoverTip(null); return; }
    setHoverTip({
      ...info,
      index: best,
      x: Math.max(8, Math.min(mx + 12, projector.W - 250)),
      y: Math.max(8, Math.min(my + 12, projector.H - 116)),
    });
  };

  /* ----- presets: persistent storage ----- */
  useEffect(() => {
    (async () => {
      try {
        const r = await loadPresets();
        if (r && r.value) setSaved(JSON.parse(r.value));
      } catch (e) { setStorageOk(false); }
    })();
  }, []);

  const persist = async (list) => {
    setSaved(list);
    try { await savePresets(list); setStorageOk(true); }
    catch (e) { setStorageOk(false); }
  };
  const savePreset = () => {
    const auto = mode === "patch"
      ? `${SOURCES[cfg.source].label} → ${PLANES[cfg.plane].label}`
      : labEditor === "canvas" ? `Canvas · ${labGraph.domain}` : (lab.domain === "complex" ? `w = ${lab.ew}` : `y = ${lab.ey}`).slice(0, 30);
    const name = saveName.trim() || auto;
    const item = mode === "patch"
      ? { name, ts: Date.now(), cfg: JSON.parse(JSON.stringify(cfg)) }
      : { name, ts: Date.now(), lab: JSON.parse(JSON.stringify(lab)), graph: cloneGraph(labGraph), editor: labEditor };
    persist([...saved, item]);
    setSaveName("");
  };
  const deletePreset = (ts) => persist(saved.filter((s) => s.ts !== ts));
  const applyAny = (item) => {
    if (item.lab) {
      setMode("lab");
      setLab(withLabDefaults(JSON.parse(JSON.stringify(item.lab))));
      if (item.graph) setLabGraph(cloneGraph(item.graph));
      setLabEditor(item.graph ? (item.editor || "canvas") : "formula");
      setSelectedNodeId(null);
      setConnectFrom(null);
    }
    else { setMode("patch"); setCfg(withDefaults(JSON.parse(JSON.stringify(item.cfg)))); }
  };

  /* ----- config plumbing ----- */
  const setSource = (id) => {
    let plane = cfg.plane;
    if (!PLANES[plane].accepts.includes(SOURCES[id].domain)) {
      plane = Object.keys(PLANES).find((k) => PLANES[k].accepts.includes(SOURCES[id].domain));
    }
    setCfg(withDefaults({ ...cfg, source: id, plane }));
  };
  const setPlane = (id) => setCfg(withDefaults({ ...cfg, plane: id }));
  const setLens = (id) => setCfg(withDefaults({ ...cfg, lens: id }));
  const setParam = (key, val) => setCfg({ ...cfg, p: { ...cfg.p, [key]: val } });

  const dv = lab.domain === "int" ? "n" : lab.domain === "real" ? "t" : "s";
  const insertTok = (txt) => {
    const f = focusRef.current;
    const key = (f && f.key) || (lab.domain === "complex" ? "ew" : "ey");
    const cur = lab[key] || "";
    let pos = cur.length;
    if (f && f.el && typeof f.el.selectionStart === "number") pos = f.el.selectionStart;
    setLab({ ...lab, [key]: cur.slice(0, pos) + txt + cur.slice(pos) });
    if (f && f.el) setTimeout(() => { try { f.el.focus(); f.el.setSelectionRange(pos + txt.length, pos + txt.length); } catch (e) {} }, 0);
  };

  const setGraphDomain = (domain) => {
    setLabGraph((g) => ({ ...g, domain }));
    setLab((l) => ({ ...l, domain }));
  };
  const applyLabTemplate = (tpl) => {
    setMode("lab");
    setLab(withLabDefaults(JSON.parse(JSON.stringify(tpl.lab))));
    setLabGraph(cloneGraph(tpl.graph));
    setLabEditor("canvas");
    setSelectedNodeId(null);
    setConnectFrom(null);
  };
  const updateNode = (id, patch) => setLabGraph((g) => ({
    ...g,
    nodes: g.nodes.map((n) => n.id === id ? { ...n, ...patch, params: { ...n.params, ...(patch.params || {}) } } : n),
  }));
  const deleteNode = (id) => setLabGraph((g) => ({
    ...g,
    nodes: g.nodes.filter((n) => n.id !== id),
    edges: g.edges.filter((e) => e.from !== id && e.to !== id),
  }));
  const addEdge = (from, to, preferredPort) => setLabGraph((g) => {
    if (!from || !to || from === to) return g;
    const target = g.nodes.find((n) => n.id === to);
    if (!target || !nodeInputPorts(target).length) return g;
    const toPort = preferredPort || nextInputPort(g, target);
    const edges = g.edges.filter((e) => !(e.to === to && e.toPort === toPort));
    return { ...g, edges: [...edges, gedge(from, to, toPort)] };
  });
  const deleteEdge = (id) => setLabGraph((g) => ({ ...g, edges: g.edges.filter((e) => e.id !== id) }));
  const handlePaletteDrag = (e, defId) => {
    e.dataTransfer.setData("application/x-primevisuals-node", defId);
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleNodeOutputDrag = (e, nodeId) => {
    e.stopPropagation();
    e.dataTransfer.setData("application/x-primevisuals-edge", nodeId);
    e.dataTransfer.effectAllowed = "link";
  };
  const handleGraphDrop = (e) => {
    e.preventDefault();
    const defId = e.dataTransfer.getData("application/x-primevisuals-node");
    if (!defId || !graphRef.current) return;
    const r = graphRef.current.getBoundingClientRect();
    const node = createNodeFromPalette(defId, Math.max(8, e.clientX - r.left - 70), Math.max(8, e.clientY - r.top - 20));
    setLabGraph((g) => ({ ...g, nodes: [...g.nodes, node] }));
    setSelectedNodeId(node.id);
  };
  const handleNodeDragStart = (e, node) => {
    e.preventDefault();
    const start = {
      x: e.clientX, y: e.clientY, nx: node.x, ny: node.y,
      move: null, up: null,
    };
    start.move = (ev) => {
      setLabGraph((g) => ({
        ...g,
        nodes: g.nodes.map((n) => n.id === node.id ? { ...n, x: Math.max(4, start.nx + ev.clientX - start.x), y: Math.max(4, start.ny + ev.clientY - start.y) } : n),
      }));
    };
    start.up = () => {
      window.removeEventListener("pointermove", start.move);
      window.removeEventListener("pointerup", start.up);
    };
    window.addEventListener("pointermove", start.move);
    window.addEventListener("pointerup", start.up);
  };

  const cap = useMemo(() => {
    if (mode === "lab") {
      if (labData && labData.err) return `⚠ ${labData.err}`;
      if (labData && labData.field) return fieldNote || "complex field";
      const S = labData && labData.series;
      if (!S) return "";
      const onLine = Math.abs(lab.a - 0.5) < 1e-9;
      const sig = lab.domain === "real" && /zeta/.test(lab.ey || "")
        ? ` · σ = a = ${(+lab.a).toFixed(3)} ${onLine ? "— on the critical line" : "— off the line: the dips stop touching 0"}`
        : "";
      return `${S.L} samples · ${S.ms} ms${S.usesZ ? " · ζ summed live" : ""}${sig}`;
    }
    return caption(cfg, data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, labData, lab, fieldNote, cfg, data, tick]);

  const readingSections = useMemo(
    () => mode === "patch" ? patchGuide(cfg, data) : labGuide(lab, labData),
    [mode, cfg, data, lab, labData]
  );

  useEffect(() => {
    setHoverTip(null);
    requestAnimationFrame(() => drawRef.current());
  }, [uiVisible]);

  /* ───────────────────────────── UI ───────────────────────────── */
  const slot = (num, title, children) => (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10 }} className="p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span style={{ fontFamily: T.mono, color: T.dim, fontSize: 10, letterSpacing: "0.18em" }}>{num} · {title}</span>
      </div>
      {children}
    </div>
  );

  const readingPanel = (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10 }} className="p-3 mt-4">
      <div style={{ fontFamily: T.mono, color: T.dim, fontSize: 10, letterSpacing: "0.18em" }} className="mb-2">
        READING THIS VIEW
      </div>
      <div className="flex flex-col gap-1">
        {readingSections.map(([title, body]) => (
          <div key={title} className="rounded-md px-2 py-1" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ion, letterSpacing: "0.12em" }}>{title.toUpperCase()}</div>
            <div style={{ fontSize: 11, color: T.dim, lineHeight: 1.45 }}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const select = (value, onChange, entries, disabledFn) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md px-2 py-2 text-sm outline-none"
      style={{ background: T.panel2, color: T.ink, border: `1px solid ${T.line}`, fontFamily: T.sans }}
    >
      {entries.map(([id, m]) => {
        const off = disabledFn ? disabledFn(id, m) : false;
        return (
          <option key={id} value={id} disabled={off} style={{ color: off ? T.faint : T.ink, background: T.panel2 }}>
            {m.label}{off ? `  — needs ${m.accepts.join("/")}` : ""}
          </option>
        );
      })}
    </select>
  );

  const sliders = (defs) =>
    defs.map((d) => (
      <div key={d.key} className="mt-3">
        <div className="flex justify-between mb-1" style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>
          <span>{d.label}</span>
          <span style={{ color: T.ink }}>{d.step < 1 ? (+cfg.p[d.key]).toFixed(3) : fmt(+cfg.p[d.key])}</span>
        </div>
        <input
          type="range" min={d.min} max={d.max} step={d.step} value={cfg.p[d.key]}
          onChange={(e) => setParam(d.key, +e.target.value)}
          className="w-full" style={{ accentColor: T.ion, height: 14 }}
        />
      </div>
    ));

  const labSlider = (key, label, min, max, step) => (
    <div className="mt-3" key={key}>
      <div className="flex justify-between mb-1" style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>
        <span>{label}</span>
        <span style={{ color: T.ink }}>{step < 1 ? (+lab[key]).toFixed(3) : fmt(+lab[key])}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={lab[key]}
        onChange={(e) => setLab({ ...lab, [key]: +e.target.value })}
        className="w-full" style={{ accentColor: T.ion, height: 14 }}
      />
    </div>
  );

  const formulaField = (key, labelTxt) => (
    <div className="mt-2" key={key}>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }} className="mb-1">{labelTxt}</div>
      <input
        value={lab[key] || ""}
        onChange={(e) => setLab({ ...lab, [key]: e.target.value })}
        onFocus={(e) => { focusRef.current = { key, el: e.target }; }}
        spellCheck={false}
        className="w-full rounded-md px-2 py-2 outline-none"
        style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.mono, fontSize: 11 }}
      />
    </div>
  );

  const connector = (
    <div className="flex flex-col items-center" style={{ height: 18 }}>
      <div style={{ width: 1, flex: 1, background: `linear-gradient(${T.ion}66, ${T.line})` }} />
      <div style={{ color: T.ion, fontSize: 9, lineHeight: "8px", opacity: 0.8 }}>▼</div>
    </div>
  );

  const chip = (id, label, onClick, onDelete) => (
    <div
      key={id}
      onClick={onClick}
      className="flex items-center justify-between rounded-md px-2 py-1 text-xs cursor-pointer select-none"
      style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.sans }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.ion)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
    >
      <span className="truncate">{label}</span>
      {onDelete && (
        <span onClick={(e) => { e.stopPropagation(); onDelete(); }} className="ml-2" style={{ color: T.faint }}>✕</span>
      )}
    </div>
  );

  const graphBuilder = (() => {
    const groups = NODE_PALETTE.reduce((acc, item) => {
      (acc[item.group] ||= []).push(item);
      return acc;
    }, {});
    const selected = labGraph.nodes.find((n) => n.id === selectedNodeId);
    const nodeMap = Object.fromEntries(labGraph.nodes.map((n) => [n.id, n]));
    const compiled = (() => { try { return compileGraphToLab(labGraph); } catch (e) { return { err: e.message }; } })();
    return (
      <div>
        <div className="flex gap-1 mb-2">
          {["canvas", "formula"].map((m) => (
            <button
              key={m}
              onClick={() => setLabEditor(m)}
              className="px-2 py-1 rounded-md"
              style={{
                background: labEditor === m ? T.panel2 : "transparent",
                border: `1px solid ${labEditor === m ? T.ion + "66" : T.line}`,
                color: labEditor === m ? T.ion : T.dim,
                fontFamily: T.mono,
                fontSize: 10,
                letterSpacing: "0.12em",
              }}
            >
              {m === "canvas" ? "CANVAS" : "FORMULAS"}
            </button>
          ))}
        </div>

        {labEditor === "canvas" ? (
          <>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, letterSpacing: "0.18em" }} className="mb-2">
              TEMPLATES
            </div>
            <div className="grid grid-cols-2 gap-1 mb-3">
              {LAB_TEMPLATES.map((tpl) => chip(tpl.name, tpl.name, () => applyLabTemplate(tpl)))}
            </div>

            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, letterSpacing: "0.18em" }} className="mb-2">
              PALETTE
            </div>
            <div className="flex flex-col gap-1 mb-3">
              {Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: "0.12em" }}>{group.toUpperCase()}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        draggable
                        onDragStart={(e) => handlePaletteDrag(e, item.id)}
                        onClick={() => {
                          const node = createNodeFromPalette(item.id, 24 + (labGraph.nodes.length % 3) * 76, 48 + (labGraph.nodes.length % 4) * 54);
                          setLabGraph((g) => ({ ...g, nodes: [...g.nodes, node] }));
                          setSelectedNodeId(node.id);
                        }}
                        className="rounded px-1"
                        style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ion, fontFamily: T.mono, fontSize: 10, lineHeight: "18px" }}
                        title="Drag onto the canvas, or click to add"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div
              ref={graphRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleGraphDrop}
              className="relative rounded-md mb-2"
              style={{ height: 330, background: "#090B12", border: `1px solid ${T.line}`, overflow: "auto" }}
            >
              <svg width="640" height="460" className="absolute" style={{ left: 0, top: 0, pointerEvents: "none" }}>
                {labGraph.edges.map((edge) => {
                  const a = nodeMap[edge.from], b = nodeMap[edge.to];
                  if (!a || !b) return null;
                  const x1 = a.x + 132, y1 = a.y + 22, x2 = b.x, y2 = b.y + 22;
                  const mx = (x1 + x2) / 2;
                  return (
                    <path
                      key={edge.id}
                      d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={T.ion}
                      strokeOpacity="0.45"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
              {labGraph.nodes.map((node) => {
                const selectedNode = selectedNodeId === node.id;
                const hasInput = nodeInputPorts(node).length > 0;
                return (
                  <div
                    key={node.id}
                    className="absolute rounded-md"
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: 132,
                      background: selectedNode ? "#111827" : T.panel2,
                      border: `1px solid ${selectedNode ? T.ion : T.line}`,
                      color: T.ink,
                      boxShadow: selectedNode ? "0 0 0 1px rgba(125,211,252,0.2)" : "none",
                    }}
                  >
                    <div
                      onPointerDown={(e) => handleNodeDragStart(e, node)}
                      className="px-2 py-1 cursor-pointer select-none"
                      style={{ borderBottom: `1px solid ${T.line}` }}
                    >
                      <div className="truncate" style={{ fontFamily: T.mono, fontSize: 10, color: node.kind === "channel" ? T.amber : T.ion }}>
                        {node.label}
                      </div>
                      <div style={{ fontFamily: T.mono, fontSize: 8, color: T.faint }}>{node.kind}</div>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1">
                      {hasInput ? (
                        <button
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            addEdge(e.dataTransfer.getData("application/x-primevisuals-edge"), node.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (connectFrom) { addEdge(connectFrom, node.id); setConnectFrom(null); }
                          }}
                          className="rounded px-1"
                          style={{ border: `1px solid ${connectFrom ? T.ion : T.line}`, color: T.dim, fontSize: 9, fontFamily: T.mono }}
                          title="Drop a relationship here"
                        >
                          IN
                        </button>
                      ) : <span />}
                      {node.kind !== "channel" && (
                        <button
                          draggable
                          onDragStart={(e) => handleNodeOutputDrag(e, node.id)}
                          onClick={(e) => { e.stopPropagation(); setConnectFrom(connectFrom === node.id ? null : node.id); }}
                          className="rounded px-1"
                          style={{ border: `1px solid ${connectFrom === node.id ? T.ion : T.line}`, color: T.ion, fontSize: 9, fontFamily: T.mono }}
                          title="Drag to another node input"
                        >
                          OUT
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {compiled.err ? (
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.rose }}>Graph error: {compiled.err}</div>
            ) : (
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, lineHeight: 1.45 }}>
                Compiles to {labGraph.domain === "complex" ? `w(s) = ${compiled.ew}` : `x = ${compiled.ex} · y = ${compiled.ey}${compiled.eh ? ` · hue = ${compiled.eh}` : ""}`}
              </div>
            )}

            {selected && (
              <div className="mt-2 rounded-md p-2" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
                <div className="flex items-center justify-between mb-1">
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ion, letterSpacing: "0.12em" }}>SELECTED NODE</div>
                  <button onClick={() => { deleteNode(selected.id); setSelectedNodeId(null); }} style={{ color: T.rose, fontFamily: T.mono, fontSize: 10 }}>Delete</button>
                </div>
                <input
                  value={selected.label}
                  onChange={(e) => updateNode(selected.id, { label: e.target.value })}
                  className="w-full rounded-md px-2 py-1 outline-none mb-1"
                  style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, fontSize: 11 }}
                />
                {(selected.kind === "custom" || selected.kind === "source") && (
                  <input
                    value={selected.params.expr || ""}
                    onChange={(e) => updateNode(selected.id, { params: { expr: e.target.value } })}
                    className="w-full rounded-md px-2 py-1 outline-none"
                    style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.mono, fontSize: 11 }}
                  />
                )}
                {selected.kind === "const" && (
                  <input
                    value={selected.params.value || ""}
                    onChange={(e) => updateNode(selected.id, { params: { value: e.target.value } })}
                    className="w-full rounded-md px-2 py-1 outline-none"
                    style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.mono, fontSize: 11 }}
                  />
                )}
                {selected.kind === "binary" && (
                  <select
                    value={selected.params.op || "+"}
                    onChange={(e) => updateNode(selected.id, { params: { op: e.target.value } })}
                    className="w-full rounded-md px-2 py-1 outline-none"
                    style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.mono, fontSize: 11 }}
                  >
                    {["+", "-", "*", "/", "^", "mod", "gcd", "dot"].map((op) => <option key={op} value={op}>{op}</option>)}
                  </select>
                )}
                <div className="mt-2">
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: "0.12em" }}>RELATIONSHIPS</div>
                  {labGraph.edges.filter((e) => e.from === selected.id || e.to === selected.id).length === 0 ? (
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>No links yet.</div>
                  ) : labGraph.edges.filter((e) => e.from === selected.id || e.to === selected.id).map((edge) => (
                    <button
                      key={edge.id}
                      onClick={() => deleteEdge(edge.id)}
                      className="block w-full truncate text-left rounded px-1 mt-1"
                      style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.dim, fontFamily: T.mono, fontSize: 9 }}
                      title="Click to remove this relationship"
                    >
                      {(nodeMap[edge.from] && nodeMap[edge.from].label) || edge.from} {"->"} {(nodeMap[edge.to] && nodeMap[edge.to].label) || edge.to}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {lab.domain === "complex"
              ? formulaField("ew", "w(s) =")
              : (<>
                {formulaField("ex", `x(${dv}) =`)}
                {formulaField("ey", `y(${dv}) =`)}
                {formulaField("eh", `hue(${dv}) =   (optional)`)}
              </>)}
            <div className="mt-2 flex flex-wrap gap-1">
              {[`zeta(${dv})`, "abs()", "re()", "im()", "arg()", "conj()", "dot(,)", "mod(,)", "gcd(,)", "exp()", "log()", "sin()", "cos()", "sqrt()", "i", "a", "b", "^"]
                .concat(lab.domain === "int" ? ["mu(n)", "M(n)", "isprime(n)", "pi(n)", "gap(n)", "omega(n)", "tau(n)", "phi(n)", "rad(n)"] : [])
                .map((o) => (
                  <button key={o} onClick={() => insertTok(o)}
                    className="px-1 rounded"
                    style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ion, fontFamily: T.mono, fontSize: 10, lineHeight: "18px" }}>
                    {o}
                  </button>
                ))}
            </div>
          </>
        )}
      </div>
    );
  })();

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: T.void, color: T.ink, fontFamily: T.sans }}>
      <style>{FONT_CSS}</style>
      <button
        type="button"
        className="pv-eye-toggle fixed top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center"
        onClick={() => setUiVisible((v) => !v)}
        aria-label={uiVisible ? "Hide interface" : "Show interface"}
        title={uiVisible ? "Hide interface" : "Show interface"}
        style={{
          zIndex: 30,
          background: "rgba(12,15,23,0.9)",
          border: `1px solid ${uiVisible ? T.ion + "77" : T.line}`,
          color: uiVisible ? T.ion : T.dim,
        }}
      >
        {uiVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>

      {/* header */}
      {uiVisible && <header className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.line}`, paddingRight: 56 }}>
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: T.mono, fontWeight: 600, fontSize: 15, letterSpacing: "0.22em" }}>
            PRIME<span style={{ color: T.ion }}>VISUALS</span>
          </span>
          <div className="flex gap-1">
            {["patch", "lab"].map((m) => (
              <button
                key={m} onClick={() => setMode(m)}
                className="px-2 py-1 rounded-md"
                style={{
                  fontFamily: T.mono, fontSize: 10, letterSpacing: "0.18em",
                  background: mode === m ? T.panel2 : "transparent",
                  border: `1px solid ${mode === m ? T.ion + "66" : T.line}`,
                  color: mode === m ? T.ion : T.dim,
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="hidden sm:inline" style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: "0.08em" }}>
            {mode === "patch" ? "patch a source into a plane · turn the lens" : "write the math · turn the knobs"}
          </span>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }} className="truncate text-right ml-3">{cap}</span>
      </header>}

      <div className={uiVisible ? "flex-1 flex flex-col lg:flex-row min-h-0" : "flex-1 min-h-0"}>
        {/* ── rail: the patch chain ── */}
        {uiVisible && <aside
          className="w-full lg:w-80 lg:h-full max-h-96 lg:max-h-none overflow-y-auto p-3 flex-none"
          style={{ borderRight: `1px solid ${T.line}` }}
        >
          <div className="flex flex-col">
            {mode === "patch" && (<>
              {slot("01", "SOURCE", (
                <>
                  {select(cfg.source, setSource, Object.entries(SOURCES))}
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    {SOURCES[cfg.source].blurb}
                  </div>
                  {sliders(SOURCES[cfg.source].params || [])}
                </>
              ))}
              {connector}
              {slot("02", "PLANE", (
                <>
                  {select(cfg.plane, setPlane, Object.entries(PLANES),
                    (id, m) => !m.accepts.includes(SOURCES[cfg.source].domain))}
                  {sliders(PLANES[cfg.plane].params || [])}
                </>
              ))}
              {connector}
              {slot("03", "LENS", (
                <>
                  {select(cfg.lens, setLens, Object.entries(LENSES))}
                  {sliders(LENSES[cfg.lens].params || [])}
                </>
              ))}
              {readingPanel}

              {/* library */}
              <div className="mt-4">
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, letterSpacing: "0.18em" }} className="mb-2">LIBRARY</div>
                <div className="grid grid-cols-2 gap-1">
                  {LIBRARY.map((it) => chip(it.name, it.name, () => applyAny(it)))}
                </div>
              </div>
            </>)}

            {mode === "lab" && (<>
              {slot("01", "DOMAIN", (
                <>
                  {select(lab.domain, setGraphDomain, [
                    ["int", { label: "Integers  n = 1 … N" }],
                    ["real", { label: "Real line  t ∈ [0, T]" }],
                    ["complex", { label: "Complex plane  s = σ + it" }],
                  ])}
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    {lab.domain === "int" ? "drop integer relationships, sequences, operators, and visual channels"
                      : lab.domain === "real" ? "build curves from t, knobs, functions, and comparisons"
                        : "paint a complex relationship w(s) across a plane"}
                  </div>
                  {lab.domain === "int" && labSlider("N", "range n ≤", 500, 20000, 500)}
                  {lab.domain !== "int" && labSlider("tMax", "height t ≤", 10, lab.domain === "complex" ? 60 : 100, 1)}
                  {lab.domain === "complex" && labSlider("sMax", "σ up to", 0.8, 3, 0.05)}
                </>
              ))}
              {connector}
              {slot("02", "CANVAS LAB", (
                <>
                  {graphBuilder}
                  {labData && labData.err && (
                    <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.rose }}>
                      ⚠ {labData.err} — showing the last good render
                    </div>
                  )}
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    drag palette items onto the canvas · drag OUT to IN to make relationships
                  </div>
                </>
              ))}
              {connector}
              {slot("03", "KNOBS", (
                <>
                  {labSlider("a", "knob a", 0, 2, 0.001)}
                  {labSlider("b", "knob b", 0, 6.283, 0.001)}
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    drop a or b into any formula, then turn
                  </div>
                </>
              ))}
              {readingPanel}
            </>)}

              {/* saved */}
              <div className="mt-4">
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, letterSpacing: "0.18em" }} className="mb-2">SAVED</div>
                {saved.length === 0 ? (
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>
                    Nothing saved yet — compose something worth keeping.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {saved.map((s) => chip(s.ts, s.name, () => applyAny(s), () => deletePreset(s.ts)))}
                  </div>
                )}
                <div className="flex gap-1 mt-2">
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Name this view"
                    className="flex-1 rounded-md px-2 py-1 text-xs outline-none min-w-0"
                    style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ink }}
                  />
                  <button
                    onClick={savePreset}
                    className="rounded-md px-2 py-1 text-xs"
                    style={{ background: T.panel2, border: `1px solid ${T.ion}55`, color: T.ion, fontFamily: T.mono }}
                  >
                    Save view
                  </button>
                </div>
                {!storageOk && (
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    Persistent storage unavailable here — saves last for this session only.
                  </div>
                )}
              </div>

              <div className="mt-5 pb-2" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, lineHeight: 1.6 }}>
                Extend it: a new visualization is one entry in the SOURCES, PLANES, or LENSES registry. Presets are plain JSON of the patch.
              </div>
          </div>
        </aside>}

        {/* ── canvas ── */}
        <section
          ref={wrapRef}
          className={uiVisible ? "relative flex-1 min-h-0" : "relative w-full h-full min-h-0"}
          style={{ minHeight: uiVisible ? 320 : "100%" }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block touch-none"
            style={{ cursor: "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerLeave}
            onDoubleClick={resetView}
          />
          {uiVisible && hoverTip && (
            <div
              className="absolute rounded-md px-2 py-1"
              style={{
                left: hoverTip.x,
                top: hoverTip.y,
                zIndex: 15,
                width: 238,
                maxWidth: "calc(100% - 16px)",
                pointerEvents: "none",
                background: "rgba(7,8,15,0.88)",
                border: `1px solid ${T.ion}55`,
                boxShadow: "0 12px 34px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ion, letterSpacing: "0.12em" }}>
                {hoverTip.title.toUpperCase()}
              </div>
              {hoverTip.lines.map((line) => (
                <div key={line} style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, lineHeight: 1.45 }}>
                  {line}
                </div>
              ))}
            </div>
          )}
          {uiVisible && <div className="absolute top-3 right-3 flex gap-1" style={{ paddingRight: 36 }}>
            {[["−", () => zoomBy(1 / 1.35)], ["+", () => zoomBy(1.35)], ["⟲", resetView]].map(([t, fn]) => (
              <button key={t} onClick={fn}
                className="w-7 h-7 rounded-md text-sm"
                style={{ background: "rgba(12,15,23,0.85)", border: `1px solid ${T.line}`, color: T.dim, fontFamily: T.mono }}>
                {t}
              </button>
            ))}
          </div>}
          {uiVisible && <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md truncate"
            style={{ background: "rgba(7,8,15,0.7)", border: `1px solid ${T.line}`, fontFamily: T.mono, fontSize: 10, color: T.dim, maxWidth: "calc(100% - 24px)" }}>
            {mode === "patch"
              ? `${SOURCES[cfg.source].label} → ${PLANES[cfg.plane].label} → ${LENSES[cfg.lens].label}`
              : lab.domain === "complex" ? `LAB · w(s) = ${lab.ew}` : `LAB · x = ${lab.ex} · y = ${lab.ey}`}
            <span className="hidden sm:inline" style={{ color: T.faint }}>  ·  drag to pan, scroll to zoom, double-click to reset</span>
          </div>}
        </section>
      </div>
    </div>
  );
}
