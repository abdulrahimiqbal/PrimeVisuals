/* LAB ENGINE — math as objects. Complex scalars are [re, im]. Expressions
   parse to an AST and evaluate over a domain (n ∈ ℤ, p prime, t ∈ ℝ, or
   s ∈ ℂ), with free knobs a and b. */

import { zetaC, integerLabTables, primesUpTo } from "./math.js";

export const CX = {
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

export function tokenize(src) {
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

export function parseExpr(src) {
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

export function evalAst(node, env, fns) {
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

export function astUses(node, name) {
  if (!node) return false;
  if (node.k === "call") return node.f === name || node.a.some((x) => astUses(x, name));
  if (node.k === "bin") return astUses(node.l, name) || astUses(node.r, name);
  if (node.k === "neg") return astUses(node.x, name);
  return false;
}

export const makeFns = (tab) => ({
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
  g2: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.g2.length - 1, Math.round(z[0]))); return [tab.g2[k], 0]; },
  G2: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.G2.length - 1, Math.round(z[0]))); return [tab.G2[k], 0]; },
  l2: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.l2.length - 1, Math.round(z[0]))); return [tab.l2[k], 0]; },
  L2: (z) => { if (!tab) return [0, 0]; const k = Math.max(0, Math.min(tab.L2.length - 1, Math.round(z[0]))); return [tab.L2[k], 0]; },
});

/* Evaluate x/y/hue formulas over ℤ, the primes, or ℝ. Throws on parse/eval errors. */
export function computeLabSeries(lab) {
  const t0 = performance.now();
  const isInt = lab.domain === "int" || lab.domain === "prime";
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
  const domainVals = lab.domain === "prime" ? primesUpTo(Math.round(lab.N)) : null;
  const L = lab.domain === "prime" ? domainVals.length : isInt ? Math.round(lab.N) : 1200;
  const xs = new Float64Array(L), ys = new Float64Array(L), hue = new Float64Array(L);
  const env = { i: [0, 1], pi: [Math.PI, 0], e: [Math.E, 0], a: [lab.a, 0], b: [lab.b, 0] };
  for (let k = 0; k < L; k++) {
    env[dv] = [domainVals ? domainVals[k] : isInt ? k + 1 : (k / (L - 1)) * lab.tMax, 0];
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
