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

export function oddPartValue(n) {
  let m = Math.abs(Math.round(n));
  if (m < 1) return 0;
  while (m % 2 === 0) m = Math.floor(m / 2);
  return m;
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

/* Row visibility with respect to lcm(1..y):
   rowVisible(n, y) = 1 iff gcd(n, lcm(1..y)) = 1.
   The implementation uses the equivalent "no divisor d in 2..y divides n"
   test, avoiding construction of the enormous lcm. */
export function rowVisibleValue(n, y) {
  const m = Math.max(0, Math.round(n));
  const yy = Math.max(1, Math.floor(y));
  if (m < 1) return 0;
  for (let d = 2; d <= yy; d++) if (m % d === 0) return 0;
  return 1;
}

export function thueMorseValue(n) {
  let x = Math.max(0, Math.round(n)) >>> 0;
  x ^= x >>> 16;
  x ^= x >>> 8;
  x ^= x >>> 4;
  x &= 0xf;
  const parity = (0x6996 >>> x) & 1;
  return parity ? -1 : 1;
}

export function rowVisibilityTable(N, y = Math.floor(Math.sqrt(N))) {
  const nMax = Math.max(0, Math.round(N));
  const yy = Math.max(1, Math.min(nMax, Math.floor(y)));
  const visible = new Uint8Array(nMax + 1);
  const count = new Int32Array(nMax + 1);
  const gap = new Int32Array(nMax + 1);
  const run = new Int32Array(nMax + 1);
  if (nMax >= 1) visible.fill(1, 1);
  for (let d = 2; d <= yy; d++) {
    for (let j = d; j <= nMax; j += d) visible[j] = 0;
  }
  let c = 0, last = 0, desert = 0;
  for (let n = 1; n <= nMax; n++) {
    if (visible[n]) {
      c++;
      gap[n] = last ? n - last : 0;
      last = n;
      desert = 0;
    } else {
      desert++;
    }
    count[n] = c;
    run[n] = desert;
  }
  return { y: yy, visible, count, gap, run };
}

export function roughIntervalWitnesses(start, width) {
  const a = Math.round(start);
  const h = Math.max(0, Math.round(width));
  let count = 0, firstOffset = 0;
  for (let m = a + 1; m < a + h; m++) {
    if (!rowVisibleValue(m, h - 1)) continue;
    count++;
    if (!firstOffset) firstOffset = m - a;
  }
  return { count, firstOffset };
}

function gcdInt(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function totientValue(n) {
  let m = Math.max(1, Math.round(n));
  let out = m;
  for (let p = 2; p * p <= m; p += p === 2 ? 1 : 2) {
    if (m % p !== 0) continue;
    out -= Math.floor(out / p);
    while (m % p === 0) m = Math.floor(m / p);
  }
  if (m > 1) out -= Math.floor(out / m);
  return out;
}

function modPowBigInt(base, exponent, modulus) {
  if (modulus <= 1n) return 0n;
  let b = base % modulus;
  if (b < 0n) b += modulus;
  let e = exponent;
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % modulus;
    b = (b * b) % modulus;
    e >>= 1n;
  }
  return out;
}

/* Euler quotient modulo n:
   EQ_b(n)=((b^phi(n)-1)/n) mod n, computed from b^phi(n) mod n^2.
   For prime n=p this is the Fermat quotient q_p(b) mod p. */
export function eulerQuotientValue(n, base = 2, phiValue = 0) {
  const m = Math.max(0, Math.round(n));
  const b = Math.round(base);
  if (m < 2 || !Number.isFinite(b) || gcdInt(b, m) !== 1) return NaN;
  const phi = phiValue > 0 ? Math.round(phiValue) : totientValue(m);
  const bigM = BigInt(m);
  const residue = modPowBigInt(BigInt(b), BigInt(phi), bigM * bigM);
  const shifted = residue - 1n;
  if (shifted % bigM !== 0n) return NaN;
  return Number((shifted / bigM) % bigM);
}

function basePowerValuation(n, base) {
  let m = Math.abs(Math.round(n));
  const b = Math.max(2, Math.round(base));
  let e = 0;
  while (m > 0 && m % b === 0) {
    e++;
    m = Math.floor(m / b);
  }
  return e;
}

function totientsUpTo(N) {
  const nMax = Math.max(0, Math.round(N));
  const phi = new Int32Array(nMax + 1);
  for (let i = 0; i <= nMax; i++) phi[i] = i;
  for (let p = 2; p <= nMax; p++) {
    if (phi[p] !== p) continue;
    for (let j = p; j <= nMax; j += p) phi[j] -= Math.floor(phi[j] / p);
  }
  return phi;
}

/* Reciprocal Farey-product base surplus:
   B_b(n)=Σ_{1≤h≤k≤n, gcd(h,k)=1}(ν_b(k)-ν_b(h)).
   For prime b=p this is the p-adic valuation ord_p(1/F_n). */
export function fareyBaseDivisorSurplusTable(N, base) {
  const nMax = Math.max(0, Math.round(N));
  const b = Math.max(2, Math.round(base));
  const phi = totientsUpTo(nMax);
  const out = new Int32Array(nMax + 1);
  let acc = 0;
  for (let k = 1; k <= nMax; k++) {
    let numeratorValuation = 0;
    for (let h = 1; h <= k; h++) {
      if (gcdInt(h, k) === 1) numeratorValuation += basePowerValuation(h, b);
    }
    acc += basePowerValuation(k, b) * phi[k] - numeratorValuation;
    out[k] = acc;
  }
  return out;
}

/* Denominators of finite regular continued fractions [0; a1,...,ak]
   whose partial quotients all lie in {1,...,maxPartial}. */
export function boundedCfDenominatorTable(N, maxPartial) {
  const nMax = Math.max(0, Math.round(N));
  const bound = Math.max(1, Math.round(maxPartial));
  const out = new Uint8Array(nMax + 1);
  const seenState = new Set();
  const stride = nMax + 1;
  function visit(prevQ, q) {
    for (let a = 1; a <= bound; a++) {
      const nextQ = a * q + prevQ;
      if (nextQ > nMax) break;
      if (a > 1) out[nextQ] = 1;
      const key = q * stride + nextQ;
      if (seenState.has(key)) continue;
      seenState.add(key);
      visit(q, nextQ);
    }
  }
  visit(0, 1);
  return out;
}

export function boundedCfMinHeightTable(N, maxPartial = 5) {
  const nMax = Math.max(0, Math.round(N));
  const maxH = Math.max(1, Math.round(maxPartial));
  const out = new Int16Array(nMax + 1);
  for (let h = 1; h <= maxH; h++) {
    const den = boundedCfDenominatorTable(nMax, h);
    for (let n = 1; n <= nMax; n++) if (!out[n] && den[n]) out[n] = h;
  }
  return out;
}

export function boundedCfNumeratorCountTable(N, maxPartial) {
  const nMax = Math.max(0, Math.round(N));
  const bound = Math.max(1, Math.round(maxPartial));
  const numeratorSets = new Map();
  function record(q, p) {
    let set = numeratorSets.get(q);
    if (!set) {
      set = new Set();
      numeratorSets.set(q, set);
    }
    set.add(p);
  }
  function visit(prevP, p, prevQ, q) {
    for (let a = 1; a <= bound; a++) {
      const nextP = a * p + prevP;
      const nextQ = a * q + prevQ;
      if (nextQ > nMax) break;
      if (a > 1) record(nextQ, nextP);
      visit(p, nextP, q, nextQ);
    }
  }
  visit(1, 0, 0, 1);
  const out = new Uint32Array(nMax + 1);
  for (const [q, set] of numeratorSets) out[q] = set.size;
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
  const fareynew = new Int32Array(N + 1);
  const fareydef = new Int32Array(N + 1);
  const rad = new Int32Array(N + 1);
  const g2 = new Float64Array(N + 1);
  const G2 = new Float64Array(N + 1);
  const l2 = new Float64Array(N + 1);
  const L2 = new Float64Array(N + 1);
  const pmuprev = new Int32Array(N + 1);
  const pmugapres = new Float64Array(N + 1);
  const psqprevmean = new Float64Array(N + 1);
  const sqtailgapcov = new Float64Array(N + 1);
  const oprevgapcov = new Float64Array(N + 1);
  const sqrtphaseres = new Float64Array(N + 1);
  const muchowla1 = new Int32Array(N + 1);
  const gapac1mean = new Float64Array(N + 1);
  const gapz2mean = new Float64Array(N + 1);
  const roughmiss = new Int32Array(N + 1);
  const theta210res = new Float64Array(N + 1);
  const tm = new Int8Array(N + 1);
  const tmbal = new Int32Array(N + 1);
  const row = rowVisibilityTable(N);
  tau.fill(1); rad.fill(1);
  for (let i = 0; i <= N; i++) phi[i] = i;
  let pc = 0, mc = 0, pmc = 0, psqCount = 0, t210 = 0, tmPrimeBalance = 0, lastPrime = 0, chowla1 = 0;
  let sqrtPhasePrime = 0, sqrtPhaseMain = 0;
  for (let i = 0; i <= N; i++) {
    tm[i] = thueMorseValue(i);
    if (i > 1) chowla1 += (mu[i - 1] || 0) * (mu[i] || 0);
    muchowla1[i] = chowla1;
    if (i > 2) {
      const mid = i - 0.5;
      sqrtPhaseMain += Math.cos(2 * Math.PI * Math.sqrt(mid)) / Math.log(mid);
    }
    pc += isp[i]; pic[i] = pc;
    mc += mu[i] || 0; mertens[i] = mc;
    if (isp[i]) {
      pmc += mu[i - 1] || 0;
      tmPrimeBalance += tm[i];
      if ((mu[i - 1] || 0) !== 0) psqCount++;
      sqrtPhasePrime += Math.cos(2 * Math.PI * Math.sqrt(i));
    }
    pmuprev[i] = pmc;
    tmbal[i] = tmPrimeBalance;
    psqprevmean[i] = pc ? psqCount / pc : 0;
    sqrtphaseres[i] = sqrtPhasePrime - sqrtPhaseMain;
    if (i >= 2 && gcdInt(i, 210) === 1) t210 += (isp[i] ? Math.log(i) : 0) - 210 / 48;
    theta210res[i] = t210;
    if (isp[i]) {
      if (lastPrime) gap[lastPrime] = i - lastPrime;
      lastPrime = i;
    }
  }
  let roughMissCount = 0;
  for (let i = 0; i <= N; i++) {
    if (isp[i] && gap[i] > 0 && roughIntervalWitnesses(i, gap[i]).count === 0) roughMissCount++;
    roughmiss[i] = roughMissCount;
  }
  let pmgr = 0;
  for (let i = 0; i <= N; i++) {
    if (isp[i] && gap[i] > 0) pmgr += (mu[i - 1] || 0) * (gap[i] - Math.log(i));
    pmugapres[i] = pmgr;
  }
  let gapPairSum = 0, gapPairCount = 0, lastGapPairMean = 0;
  let gapZ2Sum = 0, gapZ2Count = 0, lastGapZ2Mean = 0;
  const smallSquareProduct = (1 - 1 / 2) * (1 - 1 / 6) * (1 - 1 / 20) * (1 - 1 / 42);
  const tailSquarefreeExpectation = 0.373955838964 / smallSquareProduct;
  let sqTailGapSum = 0, sqTailGapCount = 0, lastSqTailGapCov = 0;
  for (let i = 0; i <= N; i++) {
    if (isp[i] && gap[i] > 0) {
      const z = gap[i] / Math.log(i) - 1;
      const predecessor = i - 1;
      const smallClean = predecessor % 4 !== 0 && predecessor % 9 !== 0 && predecessor % 25 !== 0 && predecessor % 49 !== 0;
      if (smallClean) {
        sqTailGapSum += (((mu[predecessor] || 0) !== 0 ? 1 : 0) - tailSquarefreeExpectation) * z;
        sqTailGapCount++;
        lastSqTailGapCov = sqTailGapSum / sqTailGapCount;
      }
      gapZ2Sum += z * z;
      gapZ2Count++;
      lastGapZ2Mean = gapZ2Sum / gapZ2Count;
      const q = i + gap[i];
      if (q <= N && gap[q] > 0) {
        const z0 = z;
        const z1 = gap[q] / Math.log(q) - 1;
        gapPairSum += z0 * z1;
        gapPairCount++;
        lastGapPairMean = gapPairSum / gapPairCount;
      }
    }
    sqtailgapcov[i] = lastSqTailGapCov;
    gapz2mean[i] = lastGapZ2Mean;
    gapac1mean[i] = lastGapPairMean;
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
  let oprevGapSum = 0, oprevGapCount = 0, lastOprevGapCov = 0;
  for (let i = 0; i <= N; i++) {
    if (i >= 3 && isp[i] && gap[i] > 0) {
      const centeredOmega = omega[i - 1] - Math.log(Math.log(i));
      const centeredGap = gap[i] / Math.log(i) - 1;
      oprevGapSum += centeredOmega * centeredGap;
      oprevGapCount++;
      lastOprevGapCov = oprevGapSum / oprevGapCount;
    }
    oprevgapcov[i] = lastOprevGapCov;
  }
  for (let i = 1; i <= N; i++) {
    fareynew[i] = phi[i];
    fareydef[i] = Math.max(0, i - 1 - phi[i]);
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
  return {
    isp, mu, pic, mertens, gap, omega, bigomega, tau, phi, fareynew, fareydef, rad, g2, G2, l2, L2, pmuprev, pmugapres, psqprevmean, sqtailgapcov, oprevgapcov, sqrtphaseres, muchowla1, gapac1mean, gapz2mean, roughmiss, theta210res, tm, tmbal,
    rowY: row.y, rowvis: row.visible, rowcount: row.count, rowgap: row.gap, rowrun: row.run,
  };
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
