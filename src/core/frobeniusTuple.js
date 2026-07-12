const TWIN_PRIME_CONSTANT = 0.6601618158468695739;

export function positiveMod(value, modulus) {
  const r = value % modulus;
  return r < 0 ? r + modulus : r;
}

export function powMod(base, exponent, modulus) {
  let b = positiveMod(base, modulus);
  let e = Math.floor(exponent);
  let out = 1 % modulus;
  while (e > 0) {
    if (e & 1) out = (out * b) % modulus;
    b = (b * b) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

/** Quadratic Frobenius character (n/ell) for an odd prime ell. */
export function legendreSymbol(n, ell) {
  const residue = positiveMod(n, ell);
  if (residue === 0) return 0;
  return powMod(residue, (ell - 1) / 2, ell) === 1 ? 1 : -1;
}

export function quadraticCharacterTable(ell) {
  return Int8Array.from({ length: ell }, (_, residue) => legendreSymbol(residue, ell));
}

/**
 * Exact mean of f(r)f(r+h) on residues for which neither member is ramified.
 * Accepts the Legendre table or any replacement residue class function.
 */
export function pairConditionedMean(table, shift) {
  const modulus = table.length;
  let sum = 0;
  let count = 0;
  for (let residue = 0; residue < modulus; residue++) {
    const left = table[residue];
    const right = table[positiveMod(residue + shift, modulus)];
    if (left === 0 || right === 0) continue;
    sum += left * right;
    count++;
  }
  return { mean: count ? sum / count : NaN, count, sum };
}

export function theoreticalQuadraticPairMean(ell, shift) {
  return positiveMod(shift, ell) === 0 ? 1 : -1 / (ell - 2);
}

export function centeredPairScore(sum, count, mean) {
  const residual = sum - mean * count;
  const variance = count * Math.max(0, 1 - mean * mean);
  return {
    count,
    sum,
    mean,
    residual,
    residualRate: count ? residual / count : NaN,
    variance,
    z: variance > 0 ? residual / Math.sqrt(variance) : 0,
  };
}

/** Hardy--Littlewood singular series for the pair {0,h}. */
export function hardyLittlewoodPairSingularSeries(shift) {
  if (Math.abs(Math.round(shift)) % 2 === 1) return 0;
  let value = 2 * TWIN_PRIME_CONSTANT;
  let remaining = Math.abs(Math.round(shift));
  while (remaining > 0 && remaining % 2 === 0) remaining /= 2;
  for (let prime = 3; prime * prime <= remaining; prime += 2) {
    if (remaining % prime !== 0) continue;
    value *= (prime - 1) / (prime - 2);
    while (remaining % prime === 0) remaining /= prime;
  }
  if (remaining > 1) value *= (remaining - 1) / (remaining - 2);
  return value;
}

export function rms(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length
    ? Math.sqrt(finite.reduce((sum, value) => sum + value * value, 0) / finite.length)
    : NaN;
}

export function mean(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : NaN;
}

export function pearson(left, right) {
  const pairs = [];
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    if (Number.isFinite(left[i]) && Number.isFinite(right[i])) pairs.push([left[i], right[i]]);
  }
  if (pairs.length < 2) return NaN;
  const leftMean = mean(pairs.map(([value]) => value));
  const rightMean = mean(pairs.map(([, value]) => value));
  let covariance = 0;
  let leftVariance = 0;
  let rightVariance = 0;
  for (const [a, b] of pairs) {
    const da = a - leftMean;
    const db = b - rightMean;
    covariance += da * db;
    leftVariance += da * da;
    rightVariance += db * db;
  }
  const denominator = Math.sqrt(leftVariance * rightVariance);
  return denominator ? covariance / denominator : NaN;
}

export function signAgreement(left, right) {
  let agreements = 0;
  let active = 0;
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    if (!Number.isFinite(left[i]) || !Number.isFinite(right[i]) || left[i] === 0 || right[i] === 0) continue;
    active++;
    if (Math.sign(left[i]) === Math.sign(right[i])) agreements++;
  }
  return active ? agreements / active : NaN;
}

export function summarizeZCells(cells) {
  const zs = cells.map((cell) => cell.z).filter(Number.isFinite);
  return {
    cellCount: zs.length,
    rmsZ: rms(zs),
    meanZ: mean(zs),
    stoufferZ: zs.length ? zs.reduce((sum, z) => sum + z, 0) / Math.sqrt(zs.length) : NaN,
    maxAbsZ: zs.length ? Math.max(...zs.map(Math.abs)) : NaN,
  };
}
