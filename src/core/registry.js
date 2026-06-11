/* SOURCES → PLANES → LENSES registries plus shared drawing/format helpers.
   Adding a visualization = adding an entry. */

import { T } from "./theme.js";
import { primesUpTo, mobiusUpTo, zetaHalf, ulamXY, ZEROS } from "./math.js";

/* ───────────────────────── shared helpers ───────────────────────── */

export function decorOrigin(ctx, px, th2) {
  const [ox, oy] = px(0, 0);
  ctx.strokeStyle = th2.faint; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ox - 9, oy); ctx.lineTo(ox + 9, oy); ctx.moveTo(ox, oy - 9); ctx.lineTo(ox, oy + 9); ctx.stroke();
}

export function baseline(ctx, px, th2, x0, x1) {
  const [a, y] = px(x0, 0); const [b] = px(x1, 0);
  ctx.strokeStyle = th2.faint; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(b, y); ctx.stroke();
}

export function padBounds(xs, ys, m, force = {}) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] < x0) x0 = xs[i]; if (xs[i] > x1) x1 = xs[i];
    if (ys[i] < y0) y0 = ys[i]; if (ys[i] > y1) y1 = ys[i];
  }
  if (force.y0 !== undefined) y0 = Math.min(y0, force.y0);
  const dx = (x1 - x0) || 1, dy = (y1 - y0) || 1;
  return { x0: x0 - dx * m, x1: x1 + dx * m, y0: y0 - dy * m, y1: y1 + dy * m };
}

export function padTop(ys) { let m = -Infinity; for (let i = 0; i < ys.length; i++) if (ys[i] > m) m = ys[i]; return m; }
export function avg(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
export function fmt(x) { return x.toLocaleString("en-US"); }

export function neat(x, digits = 4) {
  if (!Number.isFinite(x)) return "n/a";
  const ax = Math.abs(x);
  if (ax >= 10000) return fmt(Math.round(x));
  if (ax >= 100) return x.toFixed(1);
  if (ax >= 10) return x.toFixed(2);
  return x.toFixed(digits);
}

/* ═══════════════════════ SOURCES — what numbers ═══════════════════════
   gen(p) → { kind, n[], w[], ww[], re?[], im?[], stats } */

export const SOURCES = {
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
    blurb: `known ½ + itₖ, k ≤ ${ZEROS.length}`,
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

export const PLANES = {
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

export const NB = 48;
export const LENSES = {
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

export function ramp(f) { const a = new Array(NB); for (let i = 0; i < NB; i++) a[i] = f(i / (NB - 1)); return a; }

/* ═══════════════════ LIBRARY — stored interesting ways ═══════════════════ */

export const LIBRARY = [
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

export function withDefaults(cfg) {
  const p = { ...(cfg.p || {}) };
  const defs = [
    ...(SOURCES[cfg.source].params || []),
    ...(PLANES[cfg.plane].params || []),
    ...(LENSES[cfg.lens].params || []),
  ];
  defs.forEach((d) => { if (p[d.key] === undefined) p[d.key] = d.def; });
  return { ...cfg, p };
}

export function caption(cfg, data) {
  const bits = [data.stats];
  if (cfg.source === "primes" && cfg.plane === "walk") {
    const lead = data._end > 0 ? `1-mod-4 leads by ${Math.round(data._end)}` : data._end < 0 ? `3-mod-4 leads by ${Math.round(-data._end)}` : "dead heat";
    bits.push(`Chebyshev race · ${lead}`);
  }
  if (cfg.source === "mobius" && cfg.plane === "walk") bits.push(`M(N) = ${Math.round(data._end)}`);
  if (cfg.plane === "polar" && cfg.source !== "zeta") bits.push(`α = ${(+cfg.p.alpha).toFixed(3)} rad`);
  return bits.filter(Boolean).join("  ·  ");
}
