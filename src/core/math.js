/* Number theory kernel: sieves, arithmetic functions, ζ evaluation. */

import { ZEROS } from "./zeros.js";
export { ZEROS };

export function sieve(N) {
  const s = new Uint8Array(N + 1).fill(1);
  s[0] = 0; if (N >= 1) s[1] = 0;
  for (let i = 2; i * i <= N; i++) if (s[i]) for (let j = i * i; j <= N; j += i) s[j] = 0;
  return s;
}

export function primesUpTo(N) {
  const s = sieve(N), out = [];
  for (let i = 2; i <= N; i++) if (s[i]) out.push(i);
  return out;
}

export function mobiusUpTo(N) {
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

function oddMobius(n) {
  let m = Math.max(1, Math.round(n));
  let mu = 1;
  for (let p = 3; p * p <= m; p += 2) {
    if (m % p !== 0) continue;
    m = Math.floor(m / p);
    if (m % p === 0) return 0;
    mu = -mu;
    while (m % p === 0) m = Math.floor(m / p);
  }
  return m > 1 ? -mu : mu;
}

/* Dyadic exponential Mobius atom:
   g2(n) = Σ_{2^k|n} μ(n/2^k)/k!, so Σ_{m≤x}g2(m)
   is the factorial-weighted dyadic transform of M(x). */
export function dyadicExpMobiusValue(n) {
  let m = Math.round(n);
  if (m < 1) return 0;
  let twos = 0;
  while (m % 2 === 0) { twos++; m = Math.floor(m / 2); }
  const muOdd = oddMobius(m);
  if (muOdd === 0) return 0;
  if (twos === 0) return muOdd;
  let prevFact = 1;
  for (let k = 2; k <= twos - 1; k++) prevFact *= k;
  const fact = prevFact * twos;
  return muOdd * (1 / fact - 1 / prevFact);
}

function mangoldtValue(n) {
  let m = Math.round(n);
  if (m < 2) return 0;
  let base = 0;
  for (let p = 2; p * p <= m; p += p === 2 ? 1 : 2) {
    if (m % p !== 0) continue;
    base = p;
    while (m % p === 0) m = Math.floor(m / p);
    return m === 1 ? Math.log(base) : 0;
  }
  return Math.log(m);
}

/* Dyadic exponential von Mangoldt atom:
   l2(n) = Σ_{2^k|n} Λ(n/2^k)/k!, so Σ_{m≤x}l2(m)
   is the same transform applied to Chebyshev's ψ(x). */
export function dyadicExpMangoldtValue(n) {
  let m = Math.round(n);
  if (m < 1) return 0;
  let s = 0, fact = 1, k = 0;
  while (m >= 1) {
    s += mangoldtValue(m) / fact;
    if (m % 2 !== 0) break;
    k++;
    fact *= k;
    m = Math.floor(m / 2);
  }
  return s;
}

export function dyadicExpTransform(values, inverse = false) {
  const out = new Float64Array(values.length);
  const sign = inverse ? -1 : 1;
  for (let n = 1; n <= values.length; n++) {
    let m = n, k = 0, fact = 1, coeff = 1, sum = 0;
    while (m >= 1) {
      sum += coeff * values[m - 1];
      k++;
      fact *= k;
      coeff = Math.pow(sign, k) / fact;
      m = Math.floor(n / (2 ** k));
    }
    out[n - 1] = sum;
  }
  return out;
}

/* ζ(1/2 + it) via the Dirichlet eta series, ζ = η / (1 − 2^{1−s}). */
export const Z_TERMS = 3000;
let _ln = null, _rs = null;
export function zetaHalf(t) {
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

/* ζ(σ + it) for σ > 0 via eta, with a per-σ power cache (fast down grid columns). */
let _zsig = NaN, _zpw = null;
export function zetaC(sig, t) {
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

/* Ulam square-spiral coordinates for integer n (1 at the origin). */
export function ulamXY(n) {
  if (n <= 1) return [0, 0];
  const k = Math.ceil((Math.sqrt(n) - 1) / 2), s = 2 * k;
  const off = n - ((2 * k - 1) * (2 * k - 1) + 1);
  const side = Math.floor(off / s), p = off % s;
  if (side === 0) return [k, -k + 1 + p];
  if (side === 1) return [k - 1 - p, k];
  if (side === 2) return [-k, k - 1 - p];
  return [-k + 1 + p, -k];
}

export function integerLabTables(N) {
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
  const g2 = new Float64Array(N + 1);
  const G2 = new Float64Array(N + 1);
  const l2 = new Float64Array(N + 1);
  const L2 = new Float64Array(N + 1);
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
  for (let i = 1; i <= N; i++) {
    let s = 0, fact = 1, k = 0, d = i;
    while (d >= 1) {
      s += (mu[d] || 0) / fact;
      if (d % 2 !== 0) break;
      k++;
      fact *= k;
      d = Math.floor(d / 2);
    }
    g2[i] = s;
    G2[i] = G2[i - 1] + s;

    let ls = 0, lfact = 1, lk = 0, ld = i;
    while (ld >= 1) {
      const r = rad[ld];
      ls += (r >= 2 && isp[r] ? Math.log(r) : 0) / lfact;
      if (ld % 2 !== 0) break;
      lk++;
      lfact *= lk;
      ld = Math.floor(ld / 2);
    }
    l2[i] = ls;
    L2[i] = L2[i - 1] + ls;
  }
  return { isp, mu, pic, mertens, gap, omega, bigomega, tau, phi, rad, g2, G2, l2, L2 };
}

/* Logarithmic integral Li(x) (offset, Li(2) = 0) by Simpson integration. */
export function liUpTo(xs) {
  const out = new Float64Array(xs.length);
  let acc = 0, prev = 2;
  for (let i = 0; i < xs.length; i++) {
    const x = Math.max(2, xs[i]);
    const steps = Math.max(2, Math.min(64, Math.ceil((x - prev) / 50)));
    const h = (x - prev) / steps;
    if (h > 0) {
      for (let k = 0; k < steps; k++) {
        const a = prev + k * h, b = a + h, m = (a + b) / 2;
        acc += (h / 6) * (1 / Math.log(a) + 4 / Math.log(m) + 1 / Math.log(b));
      }
      prev = x;
    }
    out[i] = acc;
  }
  return out;
}

/* Chebyshev ψ(x) support: prime powers p^k ≤ N with weight log p, sorted. */
export function primePowersUpTo(N) {
  const ps = primesUpTo(N);
  const xs = [], ws = [];
  for (const p of ps) {
    const lp = Math.log(p);
    for (let q = p; q <= N; q *= p) { xs.push(q); ws.push(lp); }
  }
  const idx = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]);
  return { x: Float64Array.from(idx, (i) => xs[i]), w: Float64Array.from(idx, (i) => ws[i]) };
}

/* Explicit-formula approximation of ψ(x) using the first K zero pairs:
   ψ₀(x) ≈ x − Σ_k 2·Re(x^ρ/ρ) − ln 2π − ½·ln(1 − x⁻²),  ρ = ½ + iγ_k. */
export function psiExplicit(x, K, zeros = ZEROS) {
  if (x < 2) return 0;
  const sx = Math.sqrt(x), lx = Math.log(x);
  let s = x - Math.log(2 * Math.PI) - 0.5 * Math.log(1 - 1 / (x * x));
  const n = Math.min(K, zeros.length);
  for (let k = 0; k < n; k++) {
    const g = zeros[k];
    s -= 2 * sx * (0.5 * Math.cos(g * lx) + g * Math.sin(g * lx)) / (0.25 + g * g);
  }
  return s;
}

/* Seeded Cramér-model pseudoprimes: include odd n coprime to 6 with
   probability min(1, 3/ln n) — the same density and small-modulus bias
   as the primes, but otherwise random. */
export function cramerPrimes(N, seed = 12345) {
  let a = seed >>> 0;
  const rnd = () => { // mulberry32
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [2, 3];
  for (let n = 5; n <= N; n++) {
    if (n % 2 === 0 || n % 3 === 0) continue;
    if (rnd() < Math.min(1, 3 / Math.log(n))) out.push(n);
  }
  return out;
}
