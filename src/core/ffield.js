/* Function-field arithmetic for F_q[t], q prime in {2,3}.
   Polynomials are encoded as base-q integers with coeff(t^i) in digit i.
   For q=2 this is the usual bitmask representation. */

const SUPPORTED_Q = new Set([2, 3]);
const universeCache = new Map();

function assertSupported(q) {
  if (!SUPPORTED_Q.has(q)) throw new Error(`unsupported finite field F_${q}; expected q=2 or q=3`);
}

export function qPowers(q, maxDegree) {
  assertSupported(q);
  const max = Math.max(0, Math.floor(maxDegree));
  const out = new Int32Array(max + 1);
  out[0] = 1;
  for (let i = 1; i <= max; i++) out[i] = out[i - 1] * q;
  return out;
}

export function monicPolynomial(q, degree, lower = 0) {
  assertSupported(q);
  const d = Math.max(0, Math.floor(degree));
  const pow = q ** d;
  const lo = Math.max(0, Math.floor(lower));
  if (lo >= pow) throw new Error(`lower coefficient encoding ${lower} out of range for degree ${degree} over F_${q}`);
  return pow + lo;
}

export function polyDegree(poly, q) {
  assertSupported(q);
  const f = Math.floor(poly);
  if (f <= 0) return -1;
  if (q === 2) return 31 - Math.clz32(f);
  let d = 0, p = 1;
  while (p * q <= f) { p *= q; d++; }
  return d;
}

function coeffs(poly, q) {
  const d = polyDegree(poly, q);
  const out = new Int8Array(Math.max(0, d + 1));
  let x = Math.floor(poly);
  for (let i = 0; i <= d; i++) {
    out[i] = x % q;
    x = Math.floor(x / q);
  }
  return out;
}

function polyMul2(a, b) {
  let x = a >>> 0, y = b >>> 0, out = 0;
  while (y) {
    if (y & 1) out ^= x;
    y >>>= 1;
    x <<= 1;
  }
  return out >>> 0;
}

function factorTerms(poly, q) {
  const positions = [];
  const coefficients = [];
  let x = poly, pos = 0;
  while (x > 0) {
    const c = x % q;
    if (c) {
      positions.push(pos);
      coefficients.push(c);
    }
    x = Math.floor(x / q);
    pos++;
  }
  return { positions, coefficients };
}

function shiftedProductState(terms, shift, targetDegree, pow) {
  const digits = new Int8Array(targetDegree + 1);
  let value = 0;
  for (let i = 0; i < terms.positions.length; i++) {
    const pos = terms.positions[i] + shift;
    const c = terms.coefficients[i];
    digits[pos] = c;
    value += c * pow[pos];
  }
  return { digits, value };
}

function addShiftedFactorQ3(state, terms, shift, pow) {
  for (let i = 0; i < terms.positions.length; i++) {
    const pos = terms.positions[i] + shift;
    const old = state.digits[pos];
    const next = (old + terms.coefficients[i]) % 3;
    if (next === old) continue;
    state.digits[pos] = next;
    state.value += (next - old) * pow[pos];
  }
}

function advanceMultipleProductQ3(state, lower, terms, hDegree, pow) {
  let carry = lower, pos = 0;
  while (pos < hDegree) {
    addShiftedFactorQ3(state, terms, pos, pow);
    if (carry % 3 !== 2) break;
    carry = Math.floor(carry / 3);
    pos++;
  }
}

function advanceMultipleProduct2(product, lower, factor, hDegree, pow) {
  let out = product;
  let carry = lower, pos = 0;
  while (pos < hDegree) {
    const shifted = factor * pow[pos];
    out = (out ^ shifted) >>> 0;
    if (carry % 2 !== 1) break;
    carry = Math.floor(carry / 2);
    pos++;
  }
  return out;
}

function markCompositeMultiples(composite, factor, q, hDegree, targetDegree, pow) {
  if (q === 3) {
    const terms = factorTerms(factor, q);
    const state = shiftedProductState(terms, hDegree, targetDegree, pow);
    const limit = pow[hDegree];
    for (let hLower = 0; hLower < limit; hLower++) {
      composite[lowerIndex(state.value, targetDegree, pow)] = 1;
      if (hLower + 1 < limit) advanceMultipleProductQ3(state, hLower, terms, hDegree, pow);
    }
    return;
  }
  const limit = pow[hDegree];
  let product = factor * pow[hDegree];
  for (let hLower = 0; hLower < limit; hLower++) {
    composite[lowerIndex(product, targetDegree, pow)] = 1;
    if (hLower + 1 < limit) product = advanceMultipleProduct2(product, hLower, factor, hDegree, pow);
  }
}

function flipMobiusMultiples(muTable, factor, q, hDegree, targetDegree, pow) {
  if (q === 3) {
    const terms = factorTerms(factor, q);
    const state = shiftedProductState(terms, hDegree, targetDegree, pow);
    const limit = pow[hDegree];
    for (let hLower = 0; hLower < limit; hLower++) {
      const idx = lowerIndex(state.value, targetDegree, pow);
      if (muTable[idx] !== 0) muTable[idx] *= -1;
      if (hLower + 1 < limit) advanceMultipleProductQ3(state, hLower, terms, hDegree, pow);
    }
    return;
  }
  const limit = pow[hDegree];
  let product = factor * pow[hDegree];
  for (let hLower = 0; hLower < limit; hLower++) {
    const idx = lowerIndex(product, targetDegree, pow);
    if (muTable[idx] !== 0) muTable[idx] *= -1;
    if (hLower + 1 < limit) product = advanceMultipleProduct2(product, hLower, factor, hDegree, pow);
  }
}

function zeroMobiusMultiples(muTable, factor, q, hDegree, targetDegree, pow) {
  if (q === 3) {
    const terms = factorTerms(factor, q);
    const state = shiftedProductState(terms, hDegree, targetDegree, pow);
    const limit = pow[hDegree];
    for (let hLower = 0; hLower < limit; hLower++) {
      muTable[lowerIndex(state.value, targetDegree, pow)] = 0;
      if (hLower + 1 < limit) advanceMultipleProductQ3(state, hLower, terms, hDegree, pow);
    }
    return;
  }
  const limit = pow[hDegree];
  let product = factor * pow[hDegree];
  for (let hLower = 0; hLower < limit; hLower++) {
    muTable[lowerIndex(product, targetDegree, pow)] = 0;
    if (hLower + 1 < limit) product = advanceMultipleProduct2(product, hLower, factor, hDegree, pow);
  }
}

export function polyAdd(a, b, q) {
  assertSupported(q);
  if (q === 2) return (a ^ b) >>> 0;
  const da = polyDegree(a, q), db = polyDegree(b, q);
  const d = Math.max(da, db);
  let aa = Math.floor(a), bb = Math.floor(b), pow = 1, out = 0;
  for (let i = 0; i <= d; i++) {
    const c = ((aa % q) + (bb % q)) % q;
    out += c * pow;
    aa = Math.floor(aa / q);
    bb = Math.floor(bb / q);
    pow *= q;
  }
  return out;
}

export function polySub(a, b, q) {
  assertSupported(q);
  if (q === 2) return (a ^ b) >>> 0;
  const da = polyDegree(a, q), db = polyDegree(b, q);
  const d = Math.max(da, db);
  let aa = Math.floor(a), bb = Math.floor(b), pow = 1, out = 0;
  for (let i = 0; i <= d; i++) {
    const c = ((aa % q) - (bb % q) + q) % q;
    out += c * pow;
    aa = Math.floor(aa / q);
    bb = Math.floor(bb / q);
    pow *= q;
  }
  return out;
}

export function polyMul(a, b, q) {
  assertSupported(q);
  if (a === 0 || b === 0) return 0;
  if (q === 2) return polyMul2(a, b);
  const ca = coeffs(a, q), cb = coeffs(b, q);
  const outCoeffs = new Int8Array(ca.length + cb.length - 1);
  for (let i = 0; i < ca.length; i++) {
    if (!ca[i]) continue;
    for (let j = 0; j < cb.length; j++) {
      if (cb[j]) outCoeffs[i + j] = (outCoeffs[i + j] + ca[i] * cb[j]) % q;
    }
  }
  let out = 0, pow = 1;
  for (let i = 0; i < outCoeffs.length; i++) {
    out += outCoeffs[i] * pow;
    pow *= q;
  }
  return out;
}

export function polyDivMod(a, b, q) {
  assertSupported(q);
  if (b === 0) throw new Error("division by zero polynomial");
  let r = Math.floor(a);
  let dr = polyDegree(r, q);
  const db = polyDegree(b, q);
  if (dr < db) return { quotient: 0, remainder: r };
  const inv = q === 2 ? [0, 1] : [0, 1, 2];
  const bLead = Math.floor(b / (q ** db)) % q;
  const bLeadInv = inv[bLead];
  let quotient = 0;
  while (r && dr >= db) {
    const rLead = Math.floor(r / (q ** dr)) % q;
    const c = (rLead * bLeadInv) % q;
    const shift = dr - db;
    const term = c * (q ** shift);
    quotient = polyAdd(quotient, term, q);
    r = polySub(r, polyMul(term, b, q), q);
    dr = polyDegree(r, q);
  }
  return { quotient, remainder: r };
}

export function polyMod(a, b, q) {
  return polyDivMod(a, b, q).remainder;
}

function integerMobiusValue(n) {
  let m = Math.max(1, Math.floor(n));
  let mu = 1;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    m = Math.floor(m / p);
    if (m % p === 0) return 0;
    mu = -mu;
    while (m % p === 0) m = Math.floor(m / p);
  }
  return m > 1 ? -mu : mu;
}

export function irreducibleCountFormula(q, degree) {
  assertSupported(q);
  const n = Math.max(1, Math.floor(degree));
  let sum = 0;
  for (let d = 1; d <= n; d++) {
    if (n % d !== 0) continue;
    sum += integerMobiusValue(d) * (q ** (n / d));
  }
  return sum / n;
}

function lowerIndex(poly, degree, pow) {
  return poly - pow[degree];
}

function buildMobiusTables(q, maxDegree, pow, irreduciblesByDegree) {
  const muByDegree = Array.from({ length: maxDegree + 1 }, (_, d) => {
    const arr = new Int8Array(pow[d]);
    arr.fill(1);
    return arr;
  });
  muByDegree[0][0] = 1;

  for (let d = 1; d <= maxDegree; d++) {
    for (const primePoly of irreduciblesByDegree[d]) {
      for (let totalDegree = d; totalDegree <= maxDegree; totalDegree++) {
        const hDegree = totalDegree - d;
        flipMobiusMultiples(muByDegree[totalDegree], primePoly, q, hDegree, totalDegree, pow);
      }

      if (2 * d > maxDegree) continue;
      const square = polyMul(primePoly, primePoly, q);
      for (let totalDegree = 2 * d; totalDegree <= maxDegree; totalDegree++) {
        const hDegree = totalDegree - 2 * d;
        zeroMobiusMultiples(muByDegree[totalDegree], square, q, hDegree, totalDegree, pow);
      }
    }
  }
  return muByDegree;
}

export function buildPolynomialUniverse(q, maxDegree) {
  assertSupported(q);
  const max = Math.max(0, Math.floor(maxDegree));
  const key = `${q}:${max}`;
  const cached = universeCache.get(key);
  if (cached) return cached;

  const pow = qPowers(q, max);
  const irreducibleFlagsByDegree = Array.from({ length: max + 1 }, (_, d) => new Uint8Array(pow[d]));
  const irreduciblesByDegree = Array.from({ length: max + 1 }, () => []);

  for (let degree = 1; degree <= max; degree++) {
    const composite = new Uint8Array(pow[degree]);
    for (let factorDegree = 1; factorDegree <= Math.floor(degree / 2); factorDegree++) {
      const hDegree = degree - factorDegree;
      for (const factor of irreduciblesByDegree[factorDegree]) {
        markCompositeMultiples(composite, factor, q, hDegree, degree, pow);
      }
    }
    const flags = irreducibleFlagsByDegree[degree];
    for (let lower = 0; lower < pow[degree]; lower++) {
      if (composite[lower]) continue;
      flags[lower] = 1;
      irreduciblesByDegree[degree].push(pow[degree] + lower);
    }
  }

  const muByDegree = buildMobiusTables(q, max, pow, irreduciblesByDegree);
  const counts = new Int32Array(max + 1);
  const exactCounts = new Int32Array(max + 1);
  for (let degree = 1; degree <= max; degree++) {
    counts[degree] = irreduciblesByDegree[degree].length;
    exactCounts[degree] = irreducibleCountFormula(q, degree);
  }

  const universe = {
    q,
    maxDegree: max,
    pow,
    irreducibleFlagsByDegree,
    irreduciblesByDegree,
    muByDegree,
    counts,
    exactCounts,
  };
  universeCache.set(key, universe);
  return universe;
}

export function isMonicIrreducible(poly, universe) {
  const degree = polyDegree(poly, universe.q);
  if (degree < 1 || degree > universe.maxDegree) return false;
  const idx = poly - universe.pow[degree];
  return idx >= 0 && idx < universe.pow[degree] && universe.irreducibleFlagsByDegree[degree][idx] === 1;
}

export function polynomialMobius(poly, universe) {
  const degree = polyDegree(poly, universe.q);
  if (degree < 0 || degree > universe.maxDegree) return 0;
  if (degree === 0) return poly === 1 ? 1 : 0;
  const idx = poly - universe.pow[degree];
  return idx >= 0 && idx < universe.pow[degree] ? universe.muByDegree[degree][idx] : 0;
}

export function polynomialPrimeList(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  return universe.irreduciblesByDegree.flat();
}

export function polynomialPrimeSourceData(q, maxDegree) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const total = universe.counts.reduce((a, b) => a + b, 0);
  const n = new Float64Array(total);
  const w = new Float64Array(total);
  const ww = new Float64Array(total);
  let idx = 0;
  for (let degree = 1; degree <= universe.maxDegree; degree++) {
    for (const poly of universe.irreduciblesByDegree[degree]) {
      n[idx] = poly;
      w[idx] = degree;
      ww[idx] = 1;
      idx++;
    }
  }
  return { universe, n, w, ww };
}

export function twinIrreducibleCounts(q, maxDegree, shiftPoly) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const shift = Math.floor(shiftPoly);
  const out = new Int32Array(universe.maxDegree + 1);
  for (let degree = 1; degree <= universe.maxDegree; degree++) {
    let count = 0;
    for (const poly of universe.irreduciblesByDegree[degree]) {
      const mate = polyAdd(poly, shift, q);
      if (polyDegree(mate, q) === degree && isMonicIrreducible(mate, universe)) count++;
    }
    out[degree] = count;
  }
  return out;
}

export function polynomialTwinSingularSeries(q, maxFactorDegree, shiftPoly) {
  const universe = buildPolynomialUniverse(q, maxFactorDegree);
  const shift = Math.floor(shiftPoly);
  let product = 1;
  for (let degree = 1; degree <= universe.maxDegree; degree++) {
    const norm = q ** degree;
    const denominator = (1 - 1 / norm) ** 2;
    for (const primePoly of universe.irreduciblesByDegree[degree]) {
      const nu = polyMod(shift, primePoly, q) === 0 ? 1 : 2;
      product *= (1 - nu / norm) / denominator;
      if (product === 0) return 0;
    }
  }
  return product;
}

export function polynomialTwinPrediction(q, degree, shiftPoly, maxFactorDegree = degree) {
  const n = Math.max(1, Math.floor(degree));
  const singular = polynomialTwinSingularSeries(q, maxFactorDegree, shiftPoly);
  return singular * (q ** n) / (n * n);
}

export function chowlaTwoPoint(q, maxDegree, shiftPoly) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const shift = Math.floor(shiftPoly);
  const out = new Float64Array(universe.maxDegree + 1);
  for (let degree = 1; degree <= universe.maxDegree; degree++) {
    let sum = 0;
    const lead = universe.pow[degree];
    for (let lower = 0; lower < universe.pow[degree]; lower++) {
      const poly = lead + lower;
      const mate = polyAdd(poly, shift, q);
      const muA = universe.muByDegree[degree][lower];
      const muB = polyDegree(mate, q) === degree ? polynomialMobius(mate, universe) : 0;
      sum += muA * muB;
    }
    out[degree] = sum / universe.pow[degree];
  }
  return out;
}

export function polyToString(poly, q, variable = "t") {
  assertSupported(q);
  if (poly === 0) return "0";
  const parts = [];
  let x = Math.floor(poly), i = 0;
  while (x > 0) {
    const c = x % q;
    if (c) {
      const coeff = c === 1 ? "" : `${c}*`;
      const term = i === 0 ? `${c}` : i === 1 ? `${coeff}${variable}` : `${coeff}${variable}^${i}`;
      parts.push(term);
    }
    x = Math.floor(x / q);
    i++;
  }
  return parts.reverse().join(" + ");
}
