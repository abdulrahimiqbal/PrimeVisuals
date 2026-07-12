import { legendreSymbol, positiveMod } from "./frobeniusTuple.js";

/** Inclusive Eratosthenes table. */
export function primeTable(limit) {
  const bound = Math.max(0, Math.floor(limit));
  const table = new Uint8Array(bound + 1);
  if (bound >= 2) table.fill(1, 2);
  for (let p = 2; p * p <= bound; p++) {
    if (!table[p]) continue;
    for (let multiple = p * p; multiple <= bound; multiple += p) table[multiple] = 0;
  }
  return table;
}

export function primesFromTable(table) {
  const primes = [];
  for (let n = 2; n < table.length; n++) if (table[n]) primes.push(n);
  return primes;
}

/** Exact quadratic-character lookup table over F_p. */
export function quadraticResidueTable(p) {
  const character = new Int8Array(p);
  for (let x = 1; x <= (p - 1) / 2; x++) character[(x * x) % p] = 1;
  for (let n = 1; n < p; n++) if (character[n] === 0) character[n] = -1;
  return character;
}

/**
 * Exact a_p for E0: y^2 + y = x^3 - x at an odd good prime.
 * Completing the square gives a_p = -sum_x (1 + 4(x^3-x) | p).
 */
export function e0Trace(p) {
  if (p === 2 || p === 37) return null;
  const character = quadraticResidueTable(p);
  let characterSum = 0;
  for (let x = 0; x < p; x++) {
    const x2 = (x * x) % p;
    const rhs = positiveMod(x2 * x - x, p);
    characterSum += character[positiveMod(1 + 4 * rhs, p)];
  }
  return -characterSum;
}

/** Exact a_p for y^2=x^3+A*x+B at an odd good prime. */
export function shortWeierstrassTrace(p, a, b) {
  if (p === 2) return null;
  const character = quadraticResidueTable(p);
  let characterSum = 0;
  for (let x = 0; x < p; x++) {
    const x2 = (x * x) % p;
    characterSum += character[positiveMod(x2 * x + a * x + b, p)];
  }
  return -characterSum;
}

/** Independent O(p^2) definition check for E0, intended only for tiny p. */
export function bruteE0PointCount(p) {
  let affine = 0;
  for (let x = 0; x < p; x++) {
    const rhs = positiveMod(x * x * x - x, p);
    for (let y = 0; y < p; y++) {
      if (positiveMod(y * y + y - rhs, p) === 0) affine++;
    }
  }
  return affine + 1;
}

export function quadraticTwistTrace(baseTrace, p, squarefreeTwist) {
  if (baseTrace == null || positiveMod(squarefreeTwist, p) === 0) return null;
  return legendreSymbol(squarefreeTwist, p) * baseTrace;
}

export function traceGapCoordinates(p, aP, q, aQ) {
  const h = q - p;
  return {
    h,
    firstEdge: q === p + 1 - aP,
    returnEdge: p === q + 1 - aQ,
    expectedAP: 1 - h,
    expectedAQ: 1 + h,
  };
}

export function smallestPrimeFactorTable(limit) {
  const spf = new Uint32Array(limit + 1);
  for (let p = 2; p <= limit; p++) {
    if (spf[p]) continue;
    for (let multiple = p; multiple <= limit; multiple += p) {
      if (!spf[multiple]) spf[multiple] = p;
    }
  }
  return spf;
}

export function omegaWithMultiplicity(n, spf) {
  let value = n;
  let omega = 0;
  while (value > 1) {
    const factor = spf[value];
    if (!factor) return NaN;
    omega++;
    value /= factor;
  }
  return omega;
}

/** Jones's universal L=2 local factor for GL_2(F_ell). */
export function jonesUniversalLocalFactor2(ell) {
  const l = ell;
  const numerator = l * l * (l ** 4 - 2 * l ** 3 - 2 * l * l + 3 * l + 3);
  const denominator = ((l * l - 1) * (l - 1)) ** 2;
  return numerator / denominator;
}

/** Truncated universal constant C_2 = 8/(3*pi^2) product_ell F_ell. */
export function truncatedJonesUniversalConstant2(primeLimit) {
  const table = primeTable(primeLimit);
  let product = 8 / (3 * Math.PI * Math.PI);
  for (let ell = 2; ell <= primeLimit; ell++) {
    if (table[ell]) product *= jonesUniversalLocalFactor2(ell);
  }
  return product;
}

function matrixDeterminant(a, b, c, d, modulus) {
  return positiveMod(a * d - b * c, modulus);
}

/** Histogram indexed by trace*ell+det for GL_2(F_ell). */
export function gl2TraceDetHistogram(ell) {
  const histogram = Array.from({ length: ell * ell }, () => 0n);
  let total = 0n;
  for (let a = 0; a < ell; a++) {
    for (let b = 0; b < ell; b++) {
      for (let c = 0; c < ell; c++) {
        for (let d = 0; d < ell; d++) {
          const determinant = matrixDeterminant(a, b, c, d, ell);
          if (determinant === 0) continue;
          const trace = (a + d) % ell;
          histogram[trace * ell + determinant]++;
          total++;
        }
      }
    }
  }
  return { modulus: ell, histogram, total };
}

export function aliquotPairCountFromHistogram(histogram, modulus) {
  let count = 0n;
  for (let t1 = 0; t1 < modulus; t1++) {
    for (let d1 = 0; d1 < modulus; d1++) {
      const left = histogram[t1 * modulus + d1];
      if (left === 0n) continue;
      const d2 = positiveMod(d1 + 1 - t1, modulus);
      for (let t2 = 0; t2 < modulus; t2++) {
        if (positiveMod(d2 + 1 - t2, modulus) !== d1) continue;
        count += left * histogram[t2 * modulus + d2];
      }
    }
  }
  return count;
}

export function normalizedAliquotPairFactor({ modulus, histogram, total }) {
  const pairCount = aliquotPairCountFromHistogram(histogram, modulus);
  return {
    pairCount,
    total,
    factor: (modulus * modulus * Number(pairCount)) / Number(total * total),
  };
}

function permutationSignMod2(a, b, c, d) {
  const vectors = [[1, 0], [0, 1], [1, 1]];
  const imageIndices = vectors.map(([x, y]) => {
    const imageX = (a * x + b * y) & 1;
    const imageY = (c * x + d * y) & 1;
    return vectors.findIndex(([vx, vy]) => vx === imageX && vy === imageY);
  });
  let inversions = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) if (imageIndices[i] > imageIndices[j]) inversions++;
  }
  return inversions % 2 === 0 ? 1 : -1;
}

function crtTwoOdd(residue2, residueOdd, oddPrime) {
  return residueOdd % 2 === residue2 ? residueOdd : residueOdd + oddPrime;
}

/**
 * Trace/determinant histogram for the index-two Serre subgroup at level 2*ell:
 * sign(g mod 2) = (det(g mod ell) / ell).
 */
export function serreEntanglementHistogram(ell) {
  const twoCells = [];
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      for (let c = 0; c < 2; c++) {
        for (let d = 0; d < 2; d++) {
          if (matrixDeterminant(a, b, c, d, 2) === 0) continue;
          twoCells.push({ trace: (a + d) % 2, sign: permutationSignMod2(a, b, c, d) });
        }
      }
    }
  }

  const oddBySign = new Map();
  for (const sign of [-1, 1]) {
    oddBySign.set(sign, Array.from({ length: ell * ell }, () => 0n));
  }
  for (let a = 0; a < ell; a++) {
    for (let b = 0; b < ell; b++) {
      for (let c = 0; c < ell; c++) {
        for (let d = 0; d < ell; d++) {
          const determinant = matrixDeterminant(a, b, c, d, ell);
          if (determinant === 0) continue;
          const sign = legendreSymbol(determinant, ell);
          const trace = (a + d) % ell;
          oddBySign.get(sign)[trace * ell + determinant]++;
        }
      }
    }
  }

  const modulus = 2 * ell;
  const histogram = Array.from({ length: modulus * modulus }, () => 0n);
  let total = 0n;
  for (const two of twoCells) {
    const odd = oddBySign.get(two.sign);
    for (let trace = 0; trace < ell; trace++) {
      for (let determinant = 1; determinant < ell; determinant++) {
        const multiplicity = odd[trace * ell + determinant];
        if (multiplicity === 0n) continue;
        const combinedTrace = crtTwoOdd(two.trace, trace, ell);
        const combinedDeterminant = crtTwoOdd(1, determinant, ell);
        histogram[combinedTrace * modulus + combinedDeterminant] += multiplicity;
        total += multiplicity;
      }
    }
  }
  return { modulus, histogram, total };
}

export function serreAliquotCorrection2(ell) {
  const entangled = normalizedAliquotPairFactor(serreEntanglementHistogram(ell)).factor;
  const local2 = normalizedAliquotPairFactor(gl2TraceDetHistogram(2)).factor;
  const localEll = normalizedAliquotPairFactor(gl2TraceDetHistogram(ell)).factor;
  return entangled / (local2 * localEll);
}
