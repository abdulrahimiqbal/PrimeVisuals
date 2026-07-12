const EULER_GAMMA = 0.5772156649015329;

function assertPositiveInteger(value, name) {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

function primesThrough(limit) {
  const composite = new Uint8Array(limit + 1);
  const primes = [];
  for (let n = 2; n <= limit; n++) {
    if (composite[n]) continue;
    primes.push(n);
    for (let multiple = n * n; multiple <= limit; multiple += n) composite[multiple] = 1;
  }
  return primes;
}

export function finiteLocalMangoldtPeriod(z) {
  assertPositiveInteger(z, "z");
  const primes = primesThrough(z);
  let modulus = 1;
  let phi = 1;
  for (const prime of primes) {
    modulus *= prime;
    phi *= prime - 1;
    if (!Number.isSafeInteger(modulus)) throw new RangeError("primorial exceeds safe-integer range");
  }
  const scale = modulus / phi;
  const values = new Float64Array(modulus);
  for (let n = 0; n < modulus; n++) values[n] = (gcd(n, modulus) === 1 ? scale : 0) - 1;
  return { z, primes, modulus, phi, scale, values };
}

export function finiteLocalMangoldtTable(limit, z) {
  assertPositiveInteger(limit, "limit");
  assertPositiveInteger(z, "z");
  const primes = primesThrough(z);
  let scale = 1;
  let modulus = 1;
  for (const prime of primes) {
    scale *= prime / (prime - 1);
    modulus = modulus !== null && Number.isSafeInteger(modulus * prime) ? modulus * prime : null;
  }
  const values = new Float64Array(limit + 1);
  for (let n = 0; n <= limit; n++) {
    let coprime = true;
    for (const prime of primes) {
      if (n % prime === 0) {
        coprime = false;
        break;
      }
    }
    values[n] = (coprime ? scale : 0) - 1;
  }
  return { z, primes, modulus, scale, values };
}

export function divisorMinusLogTable(limit) {
  assertPositiveInteger(limit, "limit");
  const divisor = new Uint32Array(limit + 1);
  for (let d = 1; d <= limit; d++) {
    for (let n = d; n <= limit; n += d) divisor[n]++;
  }
  const values = new Float64Array(limit + 1);
  for (let n = 1; n <= limit; n++) values[n] = divisor[n] - Math.log(n);
  // Differentiating x log x + (2 gamma - 1)x gives the local density
  // log x + 2 gamma, so d_2(n)-log n has dyadic mean 2 gamma.
  return { divisor, values, asymptoticMean: 2 * EULER_GAMMA };
}

export function mobiusTable(limit) {
  assertPositiveInteger(limit, "limit");
  const mu = new Int8Array(limit + 1);
  const primes = [];
  const composite = new Uint8Array(limit + 1);
  mu[1] = 1;
  for (let n = 2; n <= limit; n++) {
    if (!composite[n]) {
      primes.push(n);
      mu[n] = -1;
    }
    for (const prime of primes) {
      const multiple = n * prime;
      if (multiple > limit) break;
      composite[multiple] = 1;
      if (n % prime === 0) {
        mu[multiple] = 0;
        break;
      }
      mu[multiple] = -mu[n];
    }
  }
  return mu;
}

export function packetTentWeight(h, H) {
  assertPositiveInteger(H, "H");
  if (!Number.isFinite(h) || h <= 0 || h >= 2 * H) return 0;
  return h <= H ? h / H : (2 * H - h) / H;
}

/**
 * Complete dyadic packet.  The zeroModeContribution is exact: at each shift
 * we split the correlation into the product of its two empirical means plus
 * the covariance of the empirically centered sequences.
 */
export function completePacketAudit(values, { X, H, reference = null } = {}) {
  assertPositiveInteger(X, "X");
  assertPositiveInteger(H, "H");
  if (!values || values.length <= 2 * X + 2 * H) throw new RangeError("values do not cover the packet");
  if (reference && reference.length <= 2 * X + 2 * H) throw new RangeError("reference does not cover the packet");

  const shifts = [];
  let signed = 0;
  let shiftwiseAbsolute = 0;
  let zeroModeContribution = 0;
  let centeredSigned = 0;
  for (let h = 1; h < 2 * H; h++) {
    const weight = packetTentWeight(h, H);
    let leftMean = 0;
    let rightMean = 0;
    let referenceLeftMean = 0;
    let referenceRightMean = 0;
    for (let n = X; n < 2 * X; n++) {
      leftMean += values[n];
      rightMean += values[n + h];
      if (reference) {
        referenceLeftMean += reference[n];
        referenceRightMean += reference[n + h];
      }
    }
    leftMean /= X;
    rightMean /= X;
    referenceLeftMean /= X;
    referenceRightMean /= X;

    let correlation = 0;
    let referenceCorrelation = 0;
    let centeredCorrelation = 0;
    let centeredReferenceCorrelation = 0;
    for (let n = X; n < 2 * X; n++) {
      correlation += values[n] * values[n + h];
      centeredCorrelation += (values[n] - leftMean) * (values[n + h] - rightMean);
      if (reference) {
        referenceCorrelation += reference[n] * reference[n + h];
        centeredReferenceCorrelation += (reference[n] - referenceLeftMean)
          * (reference[n + h] - referenceRightMean);
      }
    }
    const residual = correlation - referenceCorrelation;
    const zeroMode = X * (leftMean * rightMean - referenceLeftMean * referenceRightMean);
    const centeredResidual = centeredCorrelation - centeredReferenceCorrelation;
    signed += weight * residual;
    shiftwiseAbsolute += weight * Math.abs(residual);
    zeroModeContribution += weight * zeroMode;
    centeredSigned += weight * centeredResidual;
    shifts.push({
      h,
      weight,
      correlation,
      referenceCorrelation,
      residual,
      zeroMode,
      centeredResidual,
    });
  }
  return {
    X,
    H,
    signed,
    shiftwiseAbsolute,
    cancellationRatio: shiftwiseAbsolute ? Math.abs(signed) / shiftwiseAbsolute : 0,
    zeroModeContribution,
    centeredSigned,
    zeroModeIdentityError: signed - zeroModeContribution - centeredSigned,
    shifts,
  };
}

/** Exact periodic Ramanujan/Fourier audit for a_z# = Lambda_z# - 1. */
export function localCharacterPacketCertificate(z, H) {
  assertPositiveInteger(H, "H");
  const period = finiteLocalMangoldtPeriod(z);
  const { modulus, values } = period;
  const coefficients = [];
  for (let r = 0; r < modulus; r++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < modulus; n++) {
      const phase = -2 * Math.PI * r * n / modulus;
      re += values[n] * Math.cos(phase) / modulus;
      im += values[n] * Math.sin(phase) / modulus;
    }
    coefficients.push({ r, re, im, normSquared: re * re + im * im });
  }

  let directPacket = 0;
  let fourierPacket = 0;
  let eulerProductMaxError = 0;
  for (let h = 1; h < 2 * H; h++) {
    const weight = packetTentWeight(h, H);
    let direct = 0;
    for (let n = 0; n < modulus; n++) direct += values[n] * values[(n + h) % modulus] / modulus;
    let fourier = 0;
    for (const coefficient of coefficients) {
      fourier += coefficient.normSquared * Math.cos(2 * Math.PI * coefficient.r * h / modulus);
    }
    let localProduct = 1;
    for (const prime of period.primes) {
      const occupiedClasses = h % prime === 0 ? 1 : 2;
      localProduct *= (1 - occupiedClasses / prime) / ((1 - 1 / prime) ** 2);
    }
    const euler = localProduct - 1;
    directPacket += weight * direct;
    fourierPacket += weight * fourier;
    eulerProductMaxError = Math.max(eulerProductMaxError, Math.abs(direct - euler));
  }
  return {
    ...period,
    coefficients,
    zeroCoefficient: coefficients[0],
    directPacket,
    fourierPacket,
    packetIdentityError: directPacket - fourierPacket,
    eulerProductMaxError,
  };
}

function normalize(values) {
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!(norm > 0)) return values.map(() => 0);
  return values.map((value) => value / norm);
}

function dot(left, right) {
  let sum = 0;
  for (let i = 0; i < left.length; i++) sum += left[i] * right[i];
  return sum;
}

function multiplyMatrix(matrix, vector) {
  return matrix.map((row) => dot(row, vector));
}

function projectOff(columns, vector) {
  const output = [...vector];
  for (const column of columns) {
    const coefficient = dot(output, column);
    for (let i = 0; i < output.length; i++) output[i] -= coefficient * column[i];
  }
  return output;
}

function localColumns(entries, primes = [2, 3, 5]) {
  const candidates = [entries.map(() => 1)];
  for (const prime of primes) {
    for (let residue = 0; residue < prime - 1; residue++) {
      candidates.push(entries.map((entry) => entry % prime === residue ? 1 : 0));
    }
  }
  const columns = [];
  for (const candidate of candidates) {
    const projected = projectOff(columns, candidate);
    const normalized = normalize(projected);
    if (dot(normalized, normalized) > 0.99) columns.push(normalized);
  }
  return columns;
}

function deterministicVector(length, seed = 1) {
  let state = seed >>> 0;
  const values = [];
  for (let i = 0; i < length; i++) {
    state = (1664525 * state + 1013904223) >>> 0;
    values.push((state / 2 ** 32) * 2 - 1);
  }
  return normalize(values);
}

function topAbsoluteEigenpair(matrix, projectorColumns = []) {
  let vector = normalize(projectOff(projectorColumns, deterministicVector(matrix.length, 271828)));
  let eigenvalue = 0;
  for (let iteration = 0; iteration < 1000; iteration++) {
    let next = multiplyMatrix(matrix, vector);
    next = projectOff(projectorColumns, next);
    next = multiplyMatrix(matrix, next);
    next = projectOff(projectorColumns, next);
    next = normalize(next);
    if (dot(next, vector) < 0) next = next.map((value) => -value);
    const change = Math.sqrt(next.reduce((sum, value, index) => sum + (value - vector[index]) ** 2, 0));
    vector = next;
    const applied = multiplyMatrix(matrix, vector);
    eigenvalue = dot(vector, applied);
    if (change < 1e-12) break;
  }
  return { vector, eigenvalue, singularValue: Math.abs(eigenvalue) };
}

function liftedBasis(mEntries, nEntries, beta) {
  const maximum = mEntries.at(-1) * nEntries.at(-1);
  return mEntries.map((m) => {
    const values = new Float64Array(maximum + 1);
    for (let j = 0; j < nEntries.length; j++) values[m * nEntries[j]] += beta[j];
    return values;
  });
}

function packetMatrix(basis, H) {
  const size = basis.length;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const maximum = basis[0].length - 1;
  for (let i = 0; i < size; i++) {
    for (let j = i; j < size; j++) {
      let value = 0;
      for (let h = 1; h < 2 * H; h++) {
        const weight = packetTentWeight(h, H);
        let forward = 0;
        let backward = 0;
        for (let n = 0; n + h <= maximum; n++) {
          forward += basis[i][n] * basis[j][n + h];
          backward += basis[j][n] * basis[i][n + h];
        }
        value += weight * (forward + backward) / 2;
      }
      matrix[i][j] = value;
      matrix[j][i] = value;
    }
  }
  return matrix;
}

function coefficientScore(name, raw, matrix, top, projectorColumns) {
  const projected = normalize(projectOff(projectorColumns, raw));
  const applied = multiplyMatrix(matrix, projected);
  const rayleigh = dot(projected, applied);
  return {
    name,
    rayleigh,
    normRatio: top.singularValue ? Math.abs(rayleigh) / top.singularValue : 0,
    topAlignment: Math.abs(dot(projected, top.vector)),
  };
}

/**
 * A reproducible balanced Vaughan box: alpha_m=mu(m), beta_n=log(n).
 * Constants and residue classes mod 2,3,5 are projected off before the norm
 * comparison.  This is a finite obstruction audit, not a Type-II theorem.
 */
export function balancedVaughanPacketAudit({ M = 24, N = 24, H = 8, randomSamples = 64 } = {}) {
  assertPositiveInteger(M, "M");
  assertPositiveInteger(N, "N");
  assertPositiveInteger(H, "H");
  const mEntries = Array.from({ length: M }, (_, index) => M + index);
  const nEntries = Array.from({ length: N }, (_, index) => N + index);
  const beta = normalize(nEntries.map((n) => Math.log(n)));
  const basis = liftedBasis(mEntries, nEntries, beta);
  const matrix = packetMatrix(basis, H);
  const projectorColumns = localColumns(mEntries);
  const top = topAbsoluteEigenpair(matrix, projectorColumns);
  const mu = mobiusTable(2 * M);
  const families = [
    coefficientScore("vaughan-mu-times-log", mEntries.map((m) => mu[m]), matrix, top, projectorColumns),
    coefficientScore("mobius-log-m", mEntries.map((m) => mu[m] * Math.log(m)), matrix, top, projectorColumns),
    coefficientScore("rational-phase-q7", mEntries.map((m) => Math.cos(2 * Math.PI * m / 7)), matrix, top, projectorColumns),
    coefficientScore("rational-phase-q11", mEntries.map((m) => Math.cos(2 * Math.PI * m / 11)), matrix, top, projectorColumns),
    coefficientScore("alternating", mEntries.map((m) => m % 2 ? -1 : 1), matrix, top, projectorColumns),
  ];
  const randomRatios = [];
  for (let seed = 1; seed <= randomSamples; seed++) {
    const score = coefficientScore(`random-${seed}`, deterministicVector(M, seed), matrix, top, projectorColumns);
    randomRatios.push(score.normRatio);
  }
  randomRatios.sort((a, b) => a - b);
  return {
    M,
    N,
    H,
    localProjectionRank: projectorColumns.length,
    topSingularValue: top.singularValue,
    families,
    random: {
      samples: randomSamples,
      medianNormRatio: randomRatios[Math.floor(randomRatios.length / 2)],
      maximumNormRatio: randomRatios.at(-1),
    },
  };
}

export function logLogSlope(rows, valueKey) {
  const usable = rows.filter((row) => row.H > 0 && Math.abs(row[valueKey]) > 0);
  if (usable.length < 2) return NaN;
  const xs = usable.map((row) => Math.log(row.H));
  const ys = usable.map((row) => Math.log(Math.abs(row[valueKey]) / row.X));
  const xMean = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const yMean = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < xs.length; i++) {
    numerator += (xs[i] - xMean) * (ys[i] - yMean);
    denominator += (xs[i] - xMean) ** 2;
  }
  return denominator ? numerator / denominator : NaN;
}
