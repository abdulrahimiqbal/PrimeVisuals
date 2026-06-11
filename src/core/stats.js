/* Pure-math statistics for the per-view statistics panel. */

/* histogram(values, bins, lo, hi)
   Returns { counts: Float64Array(bins), lo, hi, n }.
   Values outside [lo, hi) are clamped to the edge bins.
   counts is normalised so that sum === 1 when n > 0. */
export function histogram(values, bins, lo, hi) {
  const counts = new Float64Array(bins);
  const n = values.length;
  if (n === 0) return { counts, lo, hi, n };
  const range = hi - lo;
  for (let i = 0; i < n; i++) {
    let idx = Math.floor(((values[i] - lo) / range) * bins);
    if (idx < 0) idx = 0;
    if (idx >= bins) idx = bins - 1;
    counts[idx]++;
  }
  for (let b = 0; b < bins; b++) counts[b] /= n;
  return { counts, lo, hi, n };
}

/* GUE nearest-neighbour spacing pdf (mean 1):
   wignerGUE(s) = (32/π²) · s² · exp(−4s²/π) */
export function wignerGUE(s) {
  return (32 / (Math.PI * Math.PI)) * s * s * Math.exp((-4 * s * s) / Math.PI);
}

/* Null pdf under the Cramér model (normalised gaps ~ Exp(1)):
   expPdf(x) = exp(−x) */
export function expPdf(x) {
  return Math.exp(-x);
}

/* Euler's totient of q — used internally. */
function totient(q) {
  let n = q, r = q;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      r -= r / p;
      while (n % p === 0) n = Math.floor(n / p);
    }
  }
  if (n > 1) r -= r / n;
  return Math.round(r);
}

function gcd(a, b) {
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

/* residueChi(primes, q)
   For each residue class r coprime to q:
     counts how many primes p ≡ r (mod q) (excluding primes that divide q).
   Returns { q, classes:[{r,count}], expected, chi2, df, z, worst:{r,dev} }
   where worst.dev is the most-extreme signed standardised per-class deviation. */
export function residueChi(primes, q) {
  // collect coprime residue classes
  const classes = [];
  for (let r = 1; r < q; r++) {
    if (gcd(r, q) === 1) classes.push({ r, count: 0 });
  }
  // primes dividing q are excluded
  const divQ = new Set();
  let tmp = q;
  for (let p = 2; p * p <= tmp; p++) {
    if (tmp % p === 0) { divQ.add(p); while (tmp % p === 0) tmp = Math.floor(tmp / p); }
  }
  if (tmp > 1) divQ.add(tmp);

  // count
  const rMap = new Map(classes.map(c => [c.r, c]));
  let total = 0;
  for (const p of primes) {
    if (divQ.has(p)) continue;
    const r = p % q;
    const cls = rMap.get(r);
    if (cls) { cls.count++; total++; }
  }

  const phi = classes.length; // φ(q)
  const expected = phi > 0 ? total / phi : 0;
  let chi2 = 0;
  let worstDev = 0, worstR = classes[0]?.r ?? 1;
  for (const c of classes) {
    const diff = c.count - expected;
    if (expected > 0) chi2 += (diff * diff) / expected;
    const dev = expected > 0 ? diff / Math.sqrt(expected) : 0;
    if (Math.abs(dev) > Math.abs(worstDev)) { worstDev = dev; worstR = c.r; }
  }
  const df = phi - 1;
  const z = df > 0 ? (chi2 - df) / Math.sqrt(2 * df) : 0;
  return { q, classes, expected, chi2, df, z, worst: { r: worstR, dev: worstDev } };
}

/* expSum(primes, alpha) = |Σ_p e^{i·alpha·p}| / √L
   Under randomness ~ Rayleigh with σ = √(1/2): mean √(π/4) ≈ 0.886 */
export function expSum(primes, alpha) {
  const L = primes.length;
  if (L === 0) return 0;
  let re = 0, im = 0;
  for (const p of primes) {
    const ang = alpha * p;
    re += Math.cos(ang);
    im += Math.sin(ang);
  }
  return Math.sqrt(re * re + im * im) / Math.sqrt(L);
}

const _RAYLEIGH_MEAN = Math.sqrt(Math.PI / 4);
const _RAYLEIGH_STD = Math.sqrt(1 - Math.PI / 4);

/* expSumZ(value) → standardised z-score relative to the Rayleigh null. */
export function expSumZ(value) {
  return (value - _RAYLEIGH_MEAN) / _RAYLEIGH_STD;
}

/* autocorr(series, maxLag)
   Returns Float64Array(maxLag+1) of z-scores.
   index 0 is set to 0 (unused); for lag k ≥ 1: z_k = r_k · √(L − k). */
export function autocorr(series, maxLag) {
  const L = series.length;
  const zs = new Float64Array(maxLag + 1);
  if (L < 2) return zs;
  // mean-centre
  let mean = 0;
  for (let i = 0; i < L; i++) mean += series[i];
  mean /= L;
  const x = new Float64Array(L);
  let var0 = 0;
  for (let i = 0; i < L; i++) { x[i] = series[i] - mean; var0 += x[i] * x[i]; }
  if (var0 === 0) return zs;
  for (let k = 1; k <= maxLag; k++) {
    let cov = 0;
    for (let i = 0; i < L - k; i++) cov += x[i] * x[i + k];
    const r = cov / var0; // uses full var0 in denominator (standard estimator)
    zs[k] = r * Math.sqrt(L - k);
  }
  return zs;
}

/* contFrac(x, maxDen)
   Returns array of convergents [{p, q, err}] with q ≤ maxDen, err = |x − p/q|,
   in order of increasing q. Standard continued-fraction algorithm. */
export function contFrac(x, maxDen) {
  const out = [];
  let h0 = 1, h1 = 0, k0 = 0, k1 = 1;
  let rem = x;
  for (let iter = 0; iter < 200; iter++) {
    const a = Math.floor(rem);
    const h2 = a * h0 + h1;
    const k2 = a * k0 + k1;
    if (k2 > maxDen) break;
    const err = Math.abs(x - h2 / k2);
    out.push({ p: h2, q: k2, err });
    if (err === 0) break;
    const frac = rem - a;
    if (Math.abs(frac) < 1e-15) break;
    rem = 1 / frac;
    h1 = h0; h0 = h2;
    k1 = k0; k0 = k2;
  }
  return out;
}

/* normalizedSpacings(values)
   values must be ascending. Returns array of length-1 spacings divided by their mean. */
export function normalizedSpacings(values) {
  const n = values.length;
  if (n < 2) return [];
  const gaps = new Float64Array(n - 1);
  let sum = 0;
  for (let i = 0; i < n - 1; i++) { gaps[i] = values[i + 1] - values[i]; sum += gaps[i]; }
  const mean = sum / gaps.length;
  if (mean === 0) return gaps;
  for (let i = 0; i < gaps.length; i++) gaps[i] /= mean;
  return gaps;
}
