/* SOURCES → PLANES → LENSES registries plus shared drawing/format helpers.
   Adding a visualization = adding an entry. */

import { T } from "./theme.js";
import { primesUpTo, mobiusUpTo, zetaHalf, ulamXY, ZEROS, primePowersUpTo, psiExplicit } from "./math.js";
import { polynomialPrimeSourceData } from "./ffield.js";

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

function primeMaskUpTo(N) {
  const mask = new Uint8Array(Math.max(0, Math.round(N)) + 1);
  primesUpTo(N).forEach((p) => { mask[p] = 1; });
  return mask;
}

function mod2pi(x) {
  x %= 2 * Math.PI;
  return x < 0 ? x + 2 * Math.PI : x;
}

function wrapPi(x) {
  x = mod2pi(x);
  return x > Math.PI ? x - 2 * Math.PI : x;
}

function fitLine(xs, ys) {
  const L = xs.length;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < L; i++) {
    const x = xs[i], y = ys[i];
    sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y;
  }
  const mx = sx / L, my = sy / L;
  const den = sxx - L * mx * mx || 1;
  const slope = (sxy - L * mx * my) / den;
  const intercept = my - slope * mx;
  const sst = syy - L * my * my;
  let sse = 0;
  for (let i = 0; i < L; i++) {
    const e = ys[i] - (slope * xs[i] + intercept);
    sse += e * e;
  }
  return { slope, intercept, r2: sst ? 1 - sse / sst : 1 };
}

function modPowSmall(base, exp, mod) {
  let b = ((base % mod) + mod) % mod, e = exp, out = 1;
  while (e > 0) {
    if (e & 1) out = (out * b) % mod;
    b = (b * b) % mod;
    e >>= 1;
  }
  return out;
}

function legendreSymbol(a, p) {
  const r = modPowSmall(a, (p - 1) >> 1, p);
  return r === p - 1 ? -1 : r;
}

function jacobiEigenvaluesSym(flat, n) {
  const a = Float64Array.from(flat);
  const vals = new Float64Array(n);
  const maxIter = Math.max(120, n * n * 10);
  for (let iter = 0; iter < maxIter; iter++) {
    let p = 0, q = 1, best = 0;
    for (let i = 0; i < n; i++) {
      const row = i * n;
      for (let j = i + 1; j < n; j++) {
        const v = Math.abs(a[row + j]);
        if (v > best) { best = v; p = i; q = j; }
      }
    }
    if (best < 1e-9) break;
    const pp = p * n + p, qq = q * n + q, pq = p * n + q;
    const app = a[pp], aqq = a[qq], apq = a[pq];
    const tau = (aqq - app) / (2 * apq);
    const t = Math.sign(tau || 1) / (Math.abs(tau) + Math.sqrt(1 + tau * tau));
    const c = 1 / Math.sqrt(1 + t * t), s = t * c;
    a[pp] = app - t * apq;
    a[qq] = aqq + t * apq;
    a[pq] = 0; a[q * n + p] = 0;
    for (let k = 0; k < n; k++) {
      if (k === p || k === q) continue;
      const kp = k * n + p, kq = k * n + q;
      const akp = a[kp], akq = a[kq];
      const np = c * akp - s * akq;
      const nq = s * akp + c * akq;
      a[kp] = np; a[p * n + k] = np;
      a[kq] = nq; a[q * n + k] = nq;
    }
  }
  for (let i = 0; i < n; i++) vals[i] = a[i * n + i];
  return Array.from(vals).sort((a, b) => a - b);
}

function histogramSeries(values, bins, lo, hi) {
  const xs = new Float64Array(bins), ys = new Float64Array(bins);
  const step = (hi - lo) / bins || 1;
  for (let i = 0; i < bins; i++) xs[i] = lo + (i + 0.5) * step;
  for (const v of values) {
    if (!Number.isFinite(v) || v < lo || v > hi) continue;
    const k = Math.max(0, Math.min(bins - 1, Math.floor((v - lo) / step)));
    ys[k]++;
  }
  const norm = Math.max(1, values.length) * step;
  for (let i = 0; i < bins; i++) ys[i] /= norm;
  return { xs, ys };
}

function solveDense(Ain, bin, n) {
  const A = Float64Array.from(Ain);
  const b = Float64Array.from(bin);
  for (let col = 0; col < n; col++) {
    let piv = col, pv = Math.abs(A[col * n + col]);
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(A[r * n + col]);
      if (v > pv) { pv = v; piv = r; }
    }
    if (piv !== col) {
      for (let c = col; c < n; c++) {
        const t = A[col * n + c]; A[col * n + c] = A[piv * n + c]; A[piv * n + c] = t;
      }
      const tb = b[col]; b[col] = b[piv]; b[piv] = tb;
    }
    const diag = A[col * n + col] || 1e-12;
    for (let r = col + 1; r < n; r++) {
      const f = A[r * n + col] / diag;
      if (!f) continue;
      A[r * n + col] = 0;
      for (let c = col + 1; c < n; c++) A[r * n + c] -= f * A[col * n + c];
      b[r] -= f * b[col];
    }
  }
  const x = new Float64Array(n);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let c = r + 1; c < n; c++) s -= A[r * n + c] * x[c];
    x[r] = s / (A[r * n + r] || 1e-12);
  }
  return x;
}

function monnaValue(n, base) {
  let m = Math.max(0, Math.round(n));
  let den = base, out = 0;
  while (m > 0) {
    out += (m % base) / den;
    m = Math.floor(m / base);
    den *= base;
  }
  return out;
}

/* ═══════════════════════ SOURCES — what numbers ═══════════════════════
   gen(p) → { kind, n[], w[], ww[], re?[], im?[], stats } */

export const SOURCES = {
  primon: {
    label: "Primon gas critical line", domain: "series",
    blurb: "prime gas partition function near beta = 1; log U vs log(beta-1)",
    params: [{ key: "pts", label: "halving steps", min: 4, max: 12, step: 1, def: 8 }],
    gen: (p) => {
      const L = Math.max(4, Math.round(p.pts || 8));
      const n = new Float64Array(L), w = new Float64Array(L), ww = new Float64Array(L);
      for (let i = 0; i < L; i++) {
        const delta = 0.4 / (2 ** i);
        const U = Math.max(1e-9, 1 / delta - 0.58);
        n[i] = Math.log(delta);
        w[i] = Math.log(U);
        ww[i] = U;
      }
      const fit = fitLine(n, w);
      return {
        kind: "primon", domain: "series", n, w, ww, mode: "path", fit,
        stats: `Primon gas: slope ${fit.slope.toFixed(3)} near beta = 1 (theory -1)`,
      };
    },
  },
  rotor: {
    label: "Prime-kicked rotor", domain: "phase",
    blurb: "standard-map KAM portrait beside prime-only kicks",
    params: [
      { key: "steps", label: "time steps", min: 160, max: 1400, step: 20, def: 620 },
      { key: "orbits", label: "seed orbits", min: 10, max: 80, step: 2, def: 38 },
    ],
    gen: (p) => {
      const steps = Math.max(80, Math.round(p.steps || 620));
      const orbits = Math.max(8, Math.round(p.orbits || 38));
      const mask = primeMaskUpTo(steps + 5);
      const K = 0.97;
      const pts = [];
      for (let variant = 0; variant < 2; variant++) {
        for (let j = 0; j < orbits; j++) {
          let theta = mod2pi(2 * Math.PI * ((j * 0.61803398875 + 0.071 * variant) % 1));
          let mom = wrapPi(-2.7 + 5.4 * ((j + 0.5) / orbits));
          for (let t = 1; t <= steps; t++) {
            if (variant === 0 || mask[t]) mom = wrapPi(mom + K * Math.sin(theta));
            theta = mod2pi(theta + mom);
            if (t > 35 && t % 2 === 0) {
              pts.push([
                variant * 1.28 + theta / (2 * Math.PI),
                mom / Math.PI,
                variant === 0 ? -1 : 1,
              ]);
            }
          }
        }
      }
      const L = pts.length;
      const n = new Float64Array(L), w = new Float64Array(L), re = new Float64Array(L), im = new Float64Array(L);
      for (let i = 0; i < L; i++) { n[i] = i + 1; re[i] = pts[i][0]; im[i] = pts[i][1]; w[i] = pts[i][2]; }
      return {
        kind: "rotor", domain: "phase", n, w, ww: w, re, im,
        stats: `K = 0.97 · ${fmt(orbits)} seeds · prime kicks use ${fmt(primesUpTo(steps).length)} kicks over ${fmt(steps)} steps`,
      };
    },
  },
  anderson: {
    label: "Prime quasicrystal", domain: "series",
    blurb: "tight-binding chain with on-site V_n = lambda when n is prime",
    params: [
      { key: "N", label: "chain length", min: 800, max: 12000, step: 200, def: 4200 },
      { key: "lambda", label: "prime potential lambda", min: 0.2, max: 3, step: 0.05, def: 1 },
    ],
    gen: (p) => {
      const N = Math.max(200, Math.round(p.N || 4200));
      const lambda = +(p.lambda || 1);
      const mask = primeMaskUpTo(N);
      const L = 170, n = new Float64Array(L), w = new Float64Array(L);
      for (let i = 0; i < L; i++) {
        const E = -3 + (6 * i) / (L - 1);
        let a = 1, b = 0, sum = 0;
        for (let k = 1; k <= N; k++) {
          const V = mask[k] ? lambda : 0;
          const na = (E - V) * a - b;
          const nb = a;
          const norm = Math.hypot(na, nb) || 1;
          sum += Math.log(norm);
          a = na / norm; b = nb / norm;
        }
        n[i] = E;
        w[i] = Math.max(0, sum / N);
      }
      return {
        kind: "anderson", domain: "series", n, w, ww: w, mode: "path",
        stats: `Prime quasicrystal transfer matrix · N=${fmt(N)} · lambda=${lambda.toFixed(2)}`,
      };
    },
  },
  levy: {
    label: "Prime CF Levy line", domain: "series",
    blurb: "continued fractions of the binary prime-indicator constant",
    params: [{ key: "terms", label: "CF terms", min: 8, max: 30, step: 1, def: 22 }],
    gen: (p) => {
      const terms = Math.max(6, Math.round(p.terms || 22));
      const mask = primeMaskUpTo(58);
      let x = 0;
      for (let i = 1; i <= 52; i++) if (mask[i]) x += 2 ** -i;
      let q0 = 0, q1 = 1;
      const xs = [], ys = [];
      for (let k = 1; k <= terms && x > 1e-14; k++) {
        const a = Math.floor(1 / x);
        const q = a * q1 + q0;
        if (!Number.isFinite(q) || q <= 0) break;
        xs.push(k);
        ys.push((2 * Math.log(q)) / k);
        q0 = q1; q1 = q;
        x = 1 / x - a;
      }
      const n = Float64Array.from(xs), w = Float64Array.from(ys);
      const target = Math.PI * Math.PI / (6 * Math.log(2));
      return {
        kind: "levy", domain: "series", n, w, ww: w, mode: "path", target,
        stats: `Prime binary constant CF · target 2 log(q_n)/n = ${target.toFixed(4)}`,
      };
    },
  },
  linking: {
    label: "Legendre linking spectrum", domain: "series",
    blurb: "symmetric Legendre-symbol matrix inspired by arithmetic topology",
    params: [{ key: "M", label: "matrix size", min: 24, max: 88, step: 4, def: 60 }],
    gen: (p) => {
      const M = Math.max(12, Math.round(p.M || 60));
      const ps = primesUpTo(1200).filter((x) => x > 2).slice(0, M);
      const A = new Float64Array(M * M);
      for (let i = 0; i < M; i++) {
        for (let j = i + 1; j < M; j++) {
          const v = (legendreSymbol(ps[i], ps[j]) + legendreSymbol(ps[j], ps[i])) / (2 * Math.sqrt(M));
          A[i * M + j] = v; A[j * M + i] = v;
        }
      }
      const eig = jacobiEigenvaluesSym(A, M);
      const { xs, ys } = histogramSeries(eig, 46, -2.25, 2.25);
      return {
        kind: "linking", domain: "series", n: xs, w: ys, ww: ys, mode: "path", semicircle: true,
        stats: `Legendre linking matrix · ${fmt(M)} primes · symmetric eigensolver`,
      };
    },
  },
  primeTda: {
    label: "Prime persistence proxy", domain: "diagram",
    blurb: "adjacent normalized prime gaps as a persistence-style birth/death cloud",
    params: [{ key: "N", label: "range n ≤", min: 5000, max: 200000, step: 5000, def: 80000 }],
    gen: (p) => {
      const ps = primesUpTo(p.N || 80000);
      const L = Math.max(0, ps.length - 2);
      const n = new Float64Array(L), w = new Float64Array(L), re = new Float64Array(L), im = new Float64Array(L);
      for (let i = 0; i < L; i++) {
        const a = (ps[i + 1] - ps[i]) / Math.log(ps[i]);
        const b = (ps[i + 2] - ps[i + 1]) / Math.log(ps[i + 1]);
        re[i] = Math.min(a, b);
        im[i] = Math.max(a, b);
        w[i] = im[i] - re[i];
        n[i] = i + 1;
      }
      return {
        kind: "primeTda", domain: "diagram", n, w, ww: w, re, im,
        stats: `Prime gap persistence proxy · ${fmt(L)} adjacent-gap pairs`,
      };
    },
  },
  magnitude: {
    label: "Magnitude of primes", domain: "series",
    blurb: "Leinster magnitude growth for the metric space of the first primes",
    params: [{ key: "M", label: "prime count", min: 12, max: 80, step: 4, def: 44 }],
    gen: (p) => {
      const M = Math.max(8, Math.round(p.M || 44));
      const ps = primesUpTo(500).slice(0, M);
      const span = ps[M - 1] - ps[0] || 1;
      const L = 30, n = new Float64Array(L), w = new Float64Array(L);
      const ones = new Float64Array(M).fill(1);
      for (let k = 0; k < L; k++) {
        const t = 0.08 * ((4.5 / 0.08) ** (k / (L - 1)));
        const A = new Float64Array(M * M);
        for (let i = 0; i < M; i++) {
          for (let j = 0; j < M; j++) A[i * M + j] = Math.exp(-t * Math.abs(ps[i] - ps[j]) / span);
        }
        const weights = solveDense(A, ones, M);
        let mag = 0;
        for (let i = 0; i < M; i++) mag += weights[i];
        n[k] = Math.log(t);
        w[k] = Math.log(Math.max(1e-9, mag));
      }
      const fit = fitLine(n, w);
      return {
        kind: "magnitude", domain: "series", n, w, ww: w, mode: "path", fit,
        stats: `Magnitude growth · slope ${fit.slope.toFixed(3)} effective dimension`,
      };
    },
  },
  primeAction: {
    label: "Prime least-action path", domain: "series",
    blurb: "dynamic-programming path cost through V(x,y)=1 when x+y is prime",
    params: [{ key: "N", label: "grid length", min: 24, max: 130, step: 2, def: 78 }],
    gen: (p) => {
      const N = Math.max(10, Math.round(p.N || 78));
      const mask = primeMaskUpTo(2 * N + 2);
      const dp = new Float64Array((N + 1) * (N + 1)).fill(Infinity);
      const at = (x, y) => x * (N + 1) + y;
      dp[0] = 0;
      for (let x = 0; x <= N; x++) {
        for (let y = 0; y <= N; y++) {
          const cur = dp[at(x, y)];
          if (!Number.isFinite(cur)) continue;
          const moves = [[1, 0, 1], [0, 1, 1], [1, 1, Math.SQRT2]];
          for (const [dx, dy, len] of moves) {
            const nx = x + dx, ny = y + dy;
            if (nx > N || ny > N) continue;
            const pot = mask[nx + ny] ? 0.42 : 0;
            const idx = at(nx, ny);
            dp[idx] = Math.min(dp[idx], cur + len + pot);
          }
        }
      }
      const L = N, n = new Float64Array(L), w = new Float64Array(L);
      for (let k = 1; k <= N; k++) { n[k - 1] = k; w[k - 1] = dp[at(k, k)]; }
      const fit = fitLine(n, w);
      return {
        kind: "primeAction", domain: "series", n, w, ww: w, mode: "path", fit,
        stats: `DP least action through prime potential · slope ${fit.slope.toFixed(3)}`,
      };
    },
  },
  monna: {
    label: "Monna p-adic staircase", domain: "series",
    blurb: "digit reversal from integers to the p-adic/Bruhat-Tits boundary picture",
    params: [
      { key: "N", label: "range n ≤", min: 128, max: 4096, step: 128, def: 1536 },
      { key: "base", label: "p-adic base", min: 2, max: 7, step: 1, def: 3 },
    ],
    gen: (p) => {
      const N = Math.max(8, Math.round(p.N || 1536));
      const base = Math.max(2, Math.round(p.base || 3));
      const n = new Float64Array(N), w = new Float64Array(N), ww = new Float64Array(N);
      const mask = primeMaskUpTo(N);
      for (let i = 1; i <= N; i++) {
        n[i - 1] = i;
        w[i - 1] = monnaValue(i, base);
        ww[i - 1] = mask[i] ? 1 : 0;
      }
      return {
        kind: "monna", domain: "series", n, w, ww, mode: "points",
        stats: `Monna digit reversal · base ${base} · ${fmt(N)} integers`,
      };
    },
  },
  goldbach: {
    label: "Goldbach graph spectrum", domain: "series",
    blurb: "graph on 1..M with edge i~j when i+j is prime",
    params: [{ key: "M", label: "vertex count", min: 24, max: 104, step: 4, def: 68 }],
    gen: (p) => {
      const M = Math.max(12, Math.round(p.M || 68));
      const mask = primeMaskUpTo(2 * M + 3);
      let edgeCount = 0;
      for (let i = 1; i <= M; i++) for (let j = i + 1; j <= M; j++) if (mask[i + j]) edgeCount++;
      const rho = edgeCount / Math.max(1, (M * (M - 1)) / 2);
      const scale = Math.sqrt(Math.max(1e-9, M * rho * (1 - rho)));
      const A = new Float64Array(M * M);
      for (let i = 0; i < M; i++) {
        for (let j = i + 1; j < M; j++) {
          const v = ((mask[i + j + 2] ? 1 : 0) - rho) / scale;
          A[i * M + j] = v; A[j * M + i] = v;
        }
      }
      const eig = jacobiEigenvaluesSym(A, M);
      const { xs, ys } = histogramSeries(eig, 46, -2.25, 2.25);
      return {
        kind: "goldbach", domain: "series", n: xs, w: ys, ww: ys, mode: "path", semicircle: true,
        stats: `Goldbach graph · ${fmt(M)} vertices · edge density ${rho.toFixed(3)}`,
      };
    },
  },
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
  psi: {
    label: "ψ(x) — explicit formula", domain: "int",
    blurb: "the prime staircase vs x − Σ x^ρ/ρ over the first K zeros",
    params: [
      { key: "N", label: "range x ≤", min: 50, max: 10000, step: 50, def: 500 },
      { key: "K", label: "zeros used K", min: 0, max: ZEROS.length, step: 1, def: 10 },
    ],
    gen: (p) => {
      const { x, w } = primePowersUpTo(p.N);
      return {
        kind: "psi", domain: "int", n: x, w, ww: w, K: Math.round(p.K),
        stats: `${fmt(x.length)} prime powers ≤ ${fmt(p.N)} · explicit formula over K = ${Math.round(p.K)} zero pairs`,
      };
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
  polyprimes: {
    label: "Polynomial primes F_q[t]", domain: "int",
    blurb: "monic irreducible polynomials over F_2 or F_3; degree is the log analog",
    params: [
      { key: "q", label: "field size q", min: 2, max: 3, step: 1, def: 2 },
      { key: "deg", label: "max degree", min: 2, max: 24, step: 1, def: 10 },
    ],
    gen: (p) => {
      const q = Math.round(p.q) === 3 ? 3 : 2;
      const hardMax = q === 2 ? 24 : 15;
      const maxDegree = Math.max(1, Math.min(hardMax, Math.round(p.deg)));
      const { universe, n, w, ww } = polynomialPrimeSourceData(q, maxDegree);
      const total = n.length;
      const topCount = universe.counts[maxDegree];
      return {
        kind: "polyprimes", domain: "int", n, w, ww, q, maxDegree,
        stats: `F_${q}[t] · ${fmt(total)} monic irreducibles through degree ${maxDegree} · I_${maxDegree}=${fmt(topCount)}`,
      };
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
  phase: {
    label: "Phase portrait panels", accepts: ["phase"],
    map: (d) => ({
      xs: d.re,
      ys: d.im,
      mode: "points",
      bounds: { x0: -0.06, x1: 2.34, y0: -1.08, y1: 1.08 },
      decor: (ctx, px, th2) => {
        const panels = [
          { x0: 0, x1: 1, label: "[A] standard KAM kicks" },
          { x0: 1.28, x1: 2.28, label: "[B] prime-time kicks" },
        ];
        ctx.lineWidth = 1;
        ctx.font = `10px ${th2.mono}`;
        panels.forEach((pnl) => {
          const [x0, y0] = px(pnl.x0, -1);
          const [x1, y1] = px(pnl.x1, 1);
          ctx.strokeStyle = th2.faint;
          ctx.strokeRect(x0, y1, x1 - x0, y0 - y1);
          ctx.fillStyle = th2.dim;
          ctx.textAlign = "left";
          ctx.fillText(pnl.label, x0 + 6, y1 + 14);
        });
        ctx.fillStyle = th2.dim;
        ctx.textAlign = "center";
        ctx.fillText("theta mod 2pi", (px(0, 0)[0] + px(1, 0)[0]) / 2, px(0, -1)[1] + 16);
        ctx.fillText("theta mod 2pi", (px(1.28, 0)[0] + px(2.28, 0)[0]) / 2, px(1.28, -1)[1] + 16);
      },
    }),
  },
  diagram: {
    label: "Persistence diagram", accepts: ["diagram"],
    map: (d) => ({
      xs: d.re,
      ys: d.im,
      mode: "points",
      bounds: { x0: -0.05, x1: 4.2, y0: -0.05, y1: 4.2 },
      decor: (ctx, px, th2) => {
        const [a0, b0] = px(0, 0), [a1, b1] = px(4, 4);
        ctx.strokeStyle = th2.ion;
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(a0, b0);
        ctx.lineTo(a1, b1);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = th2.dim;
        ctx.font = `10px ${th2.mono}`;
        ctx.textAlign = "left";
        ctx.fillText("birth = death diagonal", a0 + 8, b0 - 8);
      },
    }),
  },
  graph: {
    label: "Function graph", accepts: ["int", "curve", "zeros", "series"],
    map: (d, p) => {
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      if (d.domain === "series") {
        for (let i = 0; i < L; i++) { xs[i] = d.n[i]; ys[i] = d.w[i]; }
        const mode = d.mode || "path";
        return {
          xs, ys, mode,
          bounds: padBounds(xs, ys, d.kind === "monna" ? 0.03 : 0.08, { y0: d.kind === "anderson" ? 0 : undefined }),
          decor: (ctx, px, th2) => {
            const drawLine = (y, label, color = th2.amber) => {
              const [x0, sy] = px(xs[0], y); const [x1] = px(xs[L - 1], y);
              ctx.strokeStyle = color; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2;
              ctx.beginPath(); ctx.moveTo(x0, sy); ctx.lineTo(x1, sy); ctx.stroke(); ctx.setLineDash([]);
              ctx.fillStyle = color; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "left";
              ctx.fillText(label, x0 + 6, sy - 8);
            };
            if (d.kind === "primon" && d.fit) {
              const x0 = xs[0], x1 = xs[L - 1];
              ctx.strokeStyle = th2.amber; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(...px(x0, d.fit.slope * x0 + d.fit.intercept));
              ctx.lineTo(...px(x1, d.fit.slope * x1 + d.fit.intercept));
              ctx.stroke(); ctx.setLineDash([]);
              ctx.fillStyle = th2.amber; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "left";
              const [lx, ly] = px(x1, d.fit.slope * x1 + d.fit.intercept);
              ctx.fillText(`fit slope ${d.fit.slope.toFixed(3)} · theory -1`, lx + 6, ly - 8);
            } else if (d.kind === "anderson") {
              drawLine(0, "gamma(E) = 0 mobility-edge line", th2.ion);
            } else if (d.kind === "levy" && d.target) {
              drawLine(d.target, "pi^2 / (6 ln 2)", th2.ion);
            } else if ((d.kind === "linking" || d.kind === "goldbach") && d.semicircle) {
              ctx.strokeStyle = th2.amber; ctx.globalAlpha = 0.8; ctx.lineWidth = 1.4;
              ctx.beginPath();
              for (let i = 0; i <= 160; i++) {
                const x = -2 + (4 * i) / 160;
                const y = Math.sqrt(Math.max(0, 4 - x * x)) / (2 * Math.PI);
                const [sx, sy] = px(x, y);
                if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
              }
              ctx.stroke(); ctx.globalAlpha = 1;
              ctx.fillStyle = th2.amber; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "left";
              ctx.fillText("semicircle reference", px(-1.9, 0.31)[0], px(-1.9, 0.31)[1] - 8);
            } else if ((d.kind === "magnitude" || d.kind === "primeAction") && d.fit) {
              const x0 = xs[0], x1 = xs[L - 1];
              ctx.strokeStyle = th2.amber; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(...px(x0, d.fit.slope * x0 + d.fit.intercept));
              ctx.lineTo(...px(x1, d.fit.slope * x1 + d.fit.intercept));
              ctx.stroke(); ctx.setLineDash([]);
              ctx.fillStyle = th2.amber; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "left";
              const [lx, ly] = px(x1, d.fit.slope * x1 + d.fit.intercept);
              ctx.fillText(`linear fit · slope ${d.fit.slope.toFixed(3)}`, lx - 150, ly - 8);
            } else {
              baseline(ctx, px, th2, xs[0], xs[L - 1]);
            }
          },
        };
      }
      if (d.kind === "psi") {
        let acc = 0;
        for (let i = 0; i < L; i++) { xs[i] = d.n[i]; acc += d.w[i]; ys[i] = acc; }
        const K = d.K || 0;
        return {
          xs, ys, mode: "step",
          bounds: padBounds(xs, ys, 0.05, { y0: 0 }),
          decor: (ctx, px, th2) => {
            ctx.strokeStyle = th2.amber; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.95;
            ctx.beginPath();
            const x0 = Math.max(2, xs[0]), x1 = xs[L - 1];
            for (let i = 0; i <= 420; i++) {
              const x = x0 + (i / 420) * (x1 - x0);
              const [sx, sy] = px(x, psiExplicit(x, K));
              if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
            }
            ctx.stroke(); ctx.globalAlpha = 1;
            ctx.fillStyle = th2.amber; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "right";
            const [lx, ly] = px(x1, psiExplicit(x1, K));
            ctx.fillText(`x − Σ x^ρ/ρ  (K = ${K} zero pairs)`, lx - 6, ly - 10);
            ctx.fillStyle = th2.dim; ctx.textAlign = "left";
            const [tx, ty] = px(x0 + (x1 - x0) * 0.02, ys[L - 1]);
            ctx.fillText("ψ(x): each prime power p^k adds log p", tx, ty - 6);
          },
        };
      }
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
  matrix: {
    label: "Matrix rows (width W)", accepts: ["int"],
    params: [{ key: "matW", label: "row width W", min: 2, max: 512, step: 1, def: 360 }],
    map: (d, p) => {
      const W = Math.max(2, Math.round(p.matW));
      const L = d.n.length, xs = new Float64Array(L), ys = new Float64Array(L);
      const nMax = L ? d.n[L - 1] : 1;
      const rows = Math.max(1, Math.ceil((nMax + 1) / W));
      // normalize to a unit square so any W stays readable on screen
      for (let i = 0; i < L; i++) {
        xs[i] = (d.n[i] % W) / W;
        ys[i] = -Math.floor(d.n[i] / W) / rows;
      }
      return {
        xs, ys, mode: "points",
        bounds: { x0: -0.02, x1: 1.02, y0: -1.02, y1: 0.04 },
        decor: (ctx, px, th2) => {
          ctx.fillStyle = th2.dim; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "left";
          const [sx, sy] = px(0, 0);
          ctx.fillText(`${fmt(rows)} rows of width ${fmt(W)} · vertical stripes appear when W shares factors with small primes`, sx, sy - 10);
        },
      };
    },
  },
  family: {
    label: "Family sweep (mod-q heatmap)", accepts: ["int"],
    params: [{ key: "famQ", label: "moduli q from 3 to", min: 10, max: 150, step: 1, def: 80 }],
    map: (d, p) => {
      const Q = Math.max(3, Math.round(p.famQ));
      const C = 360, rows = Q - 2;
      const cv = typeof document !== "undefined" ? document.createElement("canvas") : null;
      if (cv) {
        cv.width = C; cv.height = rows;
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(C, rows);
        const gcd = (a, b) => { while (b) { const t = a % b; a = b; b = t; } return a; };
        for (let q = 3; q <= Q; q++) {
          const counts = new Float64Array(q);
          for (let i = 0; i < d.n.length; i++) counts[d.n[i] % q]++;
          let phi = 0; for (let r = 0; r < q; r++) if (gcd(r, q) === 1) phi++;
          let coprimeTotal = 0;
          for (let r = 0; r < q; r++) if (gcd(r, q) === 1) coprimeTotal += counts[r];
          const exp = coprimeTotal / Math.max(1, phi);
          const row = q - 3;
          for (let c = 0; c < C; c++) {
            const r = Math.floor((c / C) * q);
            const o = (row * C + c) * 4;
            if (gcd(r, q) !== 1) { // impossible class: near-black
              img.data[o] = 10; img.data[o + 1] = 12; img.data[o + 2] = 18; img.data[o + 3] = 255;
              continue;
            }
            const z = Math.max(-4, Math.min(4, (counts[r] - exp) / Math.sqrt(exp || 1)));
            const k = z / 4; // −1 … 1
            img.data[o] = k > 0 ? 40 + 215 * k : 40;
            img.data[o + 1] = 46 + 30 * (1 - Math.abs(k));
            img.data[o + 2] = k < 0 ? 60 + 195 * -k : 60;
            img.data[o + 3] = 255;
          }
        }
        ctx.putImageData(img, 0, 0);
      }
      return {
        xs: new Float64Array(0), ys: new Float64Array(0), mode: "points",
        bounds: { x0: 0, x1: 1, y0: 0, y1: 1 },
        decor: (ctx, px, th2) => {
          const [X0, Y0] = px(0, 1), [X1, Y1] = px(1, 0);
          if (cv) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(cv, X0, Y0, X1 - X0, Y1 - Y0);
          }
          ctx.font = `10px ${th2.mono}`; ctx.fillStyle = th2.dim; ctx.textAlign = "right";
          for (let q = 10; q <= Q; q += 10) {
            const [, sy] = px(0, 1 - (q - 3 + 0.5) / rows);
            ctx.fillText(`q=${q}`, X0 - 6, sy + 3);
          }
          ctx.textAlign = "left";
          ctx.fillText("each row: counts of n ≡ r (mod q) · warm = excess, cold = deficit, black = impossible class", X0, Y1 + 16);
          ctx.fillText("columns are residue position r/q — coherent vertical bands are family-wide structure", X0, Y1 + 30);
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
  { name: "Primon gas critical line", cfg: { source: "primon", plane: "graph", lens: "mono", p: { pts: 8 } } },
  { name: "Prime-kicked rotor", cfg: { source: "rotor", plane: "phase", lens: "signal", p: { steps: 620, orbits: 38 } } },
  { name: "Prime quasicrystal mobility", cfg: { source: "anderson", plane: "graph", lens: "pulse", p: { N: 4200, lambda: 1 } } },
  { name: "Prime CF Levy line", cfg: { source: "levy", plane: "graph", lens: "mono", p: { terms: 22 } } },
  { name: "Legendre linking spectrum", cfg: { source: "linking", plane: "graph", lens: "mono", p: { M: 60 } } },
  { name: "Prime persistence proxy", cfg: { source: "primeTda", plane: "diagram", lens: "pulse", p: { N: 80000 } } },
  { name: "Magnitude of primes", cfg: { source: "magnitude", plane: "graph", lens: "mono", p: { M: 44 } } },
  { name: "Prime least-action path", cfg: { source: "primeAction", plane: "graph", lens: "mono", p: { N: 78 } } },
  { name: "Monna p-adic staircase", cfg: { source: "monna", plane: "graph", lens: "signal", p: { N: 1536, base: 3 } } },
  { name: "Goldbach graph spectrum", cfg: { source: "goldbach", plane: "graph", lens: "mono", p: { M: 68 } } },
  { name: "Riemann explicit formula", cfg: { source: "psi", plane: "graph", lens: "mono", p: { N: 500, K: 10 } } },
  { name: "Family sweep mod q", cfg: { source: "primes", plane: "family", lens: "mono", p: { N: 200000, famQ: 80 } } },
  { name: "Prime matrix", cfg: { source: "primes", plane: "matrix", lens: "mono", p: { N: 100000, matW: 360 } } },
  { name: "Sacks spiral", cfg: { source: "primes", plane: "sacks", lens: "mono", p: { N: 12000 } } },
  { name: "Ulam spiral", cfg: { source: "primes", plane: "ulam", lens: "mono", p: { N: 60000 } } },
  { name: "Polar α-dial", cfg: { source: "primes", plane: "polar", lens: "residue", p: { N: 120000, alpha: 1, kres: 6 } } },
  { name: "Critical line |ζ|", cfg: { source: "zeta", plane: "graph", lens: "mono", p: { tMax: 60 } } },
  { name: "Zeta pirouette", cfg: { source: "zeta", plane: "argand", lens: "aurora", p: { tMax: 34 } } },
  { name: "Zeros on the strip", cfg: { source: "zeros", plane: "strip", lens: "mono", p: { tMax: 100 } } },
  { name: "Mertens walk", cfg: { source: "mobius", plane: "walk", lens: "signal", p: { N: 50000 } } },
  { name: "Polynomial primes F₂[t]", cfg: { source: "polyprimes", plane: "graph", lens: "pulse", p: { q: 2, deg: 10 } } },
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
