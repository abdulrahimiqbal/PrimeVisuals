export const LOG_TWO = Math.log(2);
export const TWIN_PRIME_CONSTANT = 0.6601618158468696;

function assertPositiveInteger(value, name) {
  if (!Number.isInteger(value) || value < 1) throw new RangeError(`${name} must be a positive integer`);
}

/** Exact von Mangoldt values and their prefix sums through limit. */
export function vonMangoldtTable(limit) {
  assertPositiveInteger(limit, "limit");
  const composite = new Uint8Array(limit + 1);
  const lambda = new Float64Array(limit + 1);

  for (let p = 2; p <= limit; p++) {
    if (composite[p]) continue;
    for (let multiple = p + p; multiple <= limit; multiple += p) composite[multiple] = 1;
    const logP = Math.log(p);
    for (let power = p; power <= limit;) {
      lambda[power] = logP;
      if (power > Math.floor(limit / p)) break;
      power *= p;
    }
  }

  const psi = new Float64Array(limit + 1);
  for (let n = 1; n <= limit; n++) psi[n] = psi[n - 1] + lambda[n];
  return { lambda, psi };
}

/**
 * Integer-start version of the Goldston--Montgomery second moment:
 * mean_{X <= x < 2X} (psi(x+H)-psi(x)-H)^2.
 */
export function shortIntervalSecondMoment(psi, X, H) {
  assertPositiveInteger(X, "X");
  assertPositiveInteger(H, "H");
  if (!psi || psi.length <= 2 * X + H - 1) {
    throw new RangeError("psi table does not cover every requested interval");
  }
  let sum = 0;
  let first = 0;
  let second = 0;
  for (let x = X; x < 2 * X; x++) {
    const residual = psi[x + H] - psi[x] - H;
    sum += residual * residual;
    first += residual;
    second += residual * residual;
  }
  const meanResidual = first / X;
  return {
    X,
    H,
    samples: X,
    value: sum / X,
    normalized: sum / (X * H),
    meanResidual,
    sampleVariance: second / X - meanResidual * meanResidual,
  };
}

/** The adjacent-scale statistic V(X,H)/H - V(X,2H)/(2H). */
export function adjacentScalePrimeVariance(psi, X, H) {
  const fine = shortIntervalSecondMoment(psi, X, H);
  const coarse = shortIntervalSecondMoment(psi, X, 2 * H);
  const value = fine.normalized - coarse.normalized;
  return { X, H, value, residual: value - LOG_TWO, fine, coarse };
}

/**
 * Exact diagonal-free version using the two halves of the same 2H interval:
 * -mean_x A(x,H) A(x+H,H) / H, where A(x,H)=psi(x+H)-psi(x)-H.
 */
export function adjacentBlockAnticorrelation(psi, X, H) {
  assertPositiveInteger(X, "X");
  assertPositiveInteger(H, "H");
  if (!psi || psi.length <= 2 * X + 2 * H - 1) {
    throw new RangeError("psi table does not cover every requested interval");
  }
  let productSum = 0;
  let firstSquareSum = 0;
  let secondSquareSum = 0;
  let coarseSquareSum = 0;
  for (let x = X; x < 2 * X; x++) {
    const first = psi[x + H] - psi[x] - H;
    const second = psi[x + 2 * H] - psi[x + H] - H;
    productSum += first * second;
    firstSquareSum += first * first;
    secondSquareSum += second * second;
    coarseSquareSum += (first + second) ** 2;
  }
  const value = -productSum / (X * H);
  const polarizationSide = (firstSquareSum + secondSquareSum - coarseSquareSum) / (2 * X * H);
  return {
    X,
    H,
    value,
    residual: value - LOG_TWO,
    polarizationSide,
    identityError: value - polarizationSide,
    firstNormalized: firstSquareSum / (X * H),
    secondNormalized: secondSquareSum / (X * H),
    coarseNormalized: coarseSquareSum / (2 * X * H),
  };
}

/** Pair singular series for {0,h}; zero for odd h. */
export function pairSingularSeries(h) {
  assertPositiveInteger(h, "h");
  if (h % 2) return 0;
  let value = 2 * TWIN_PRIME_CONSTANT;
  let remaining = h / 2;
  while (remaining % 2 === 0) remaining /= 2;
  for (let p = 3; p * p <= remaining; p += 2) {
    if (remaining % p) continue;
    value *= (p - 1) / (p - 2);
    while (remaining % p === 0) remaining /= p;
  }
  if (remaining > 2) value *= (remaining - 1) / (remaining - 2);
  return value;
}

/** Tent coefficient created by adjacent-scale differencing. */
export function dyadicTentWeight(h, H) {
  assertPositiveInteger(H, "H");
  if (!Number.isFinite(h) || h <= 0 || h >= 2 * H) return 0;
  return h <= H ? h / H : (2 * H - h) / H;
}

/** Signed frequency kernel for negative covariance of adjacent H-blocks. */
export function adjacentBlockSpectralKernel(alpha, H) {
  assertPositiveInteger(H, "H");
  if (!Number.isFinite(alpha)) return NaN;
  const reduced = alpha - Math.round(alpha);
  const denominator = Math.sin(Math.PI * reduced);
  const magnitudeSquared = Math.abs(denominator) < 1e-14
    ? H * H
    : (Math.sin(Math.PI * H * reduced) / denominator) ** 2;
  return -(magnitudeSquared / H) * Math.cos(2 * Math.PI * H * reduced);
}

/** Hardy--Littlewood prediction for the diagonal-free DPVR statistic. */
export function hardyLittlewoodAdjacentScale(H) {
  assertPositiveInteger(H, "H");
  let value = 0;
  for (let h = 1; h < 2 * H; h++) {
    value -= dyadicTentWeight(h, H) * (pairSingularSeries(h) - 1);
  }
  return { H, value, residual: value - LOG_TWO };
}

/** Circular covariance C(h)=N^{-1} sum_n a(n)a(n+h). */
export function circularCovariance(values, h) {
  const N = values.length;
  if (!N) throw new RangeError("values must be non-empty");
  const shift = ((h % N) + N) % N;
  let sum = 0;
  for (let n = 0; n < N; n++) sum += values[n] * values[(n + shift) % N];
  return sum / N;
}

/** Exact circular mean square of H-term forward sums. */
export function circularWindowSecondMoment(values, H) {
  const N = values.length;
  assertPositiveInteger(H, "H");
  if (!N || H >= N) throw new RangeError("require 1 <= H < values.length");
  let window = 0;
  for (let j = 1; j <= H; j++) window += values[j % N];
  let sumSquares = 0;
  for (let x = 0; x < N; x++) {
    sumSquares += window * window;
    window += values[(x + H + 1) % N] - values[(x + 1) % N];
  }
  return sumSquares / N;
}

/**
 * Exact finite identity:
 * V_N(H)/H - V_N(2H)/(2H)
 *   = -sum_{1 <= h < 2H} tent_H(h) C_N(h).
 */
export function circularAdjacentScaleIdentity(values, H) {
  const N = values.length;
  assertPositiveInteger(H, "H");
  if (2 * H >= N) throw new RangeError("require 2H < values.length");
  const direct = circularWindowSecondMoment(values, H) / H
    - circularWindowSecondMoment(values, 2 * H) / (2 * H);
  let covarianceSide = 0;
  for (let h = 1; h < 2 * H; h++) {
    covarianceSide -= dyadicTentWeight(h, H) * circularCovariance(values, h);
  }
  return { direct, covarianceSide, error: direct - covarianceSide };
}
