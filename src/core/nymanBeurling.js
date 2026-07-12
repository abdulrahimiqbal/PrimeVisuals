const EULER_GAMMA = 0.5772156649015329
const LOG_TWO_PI = Math.log(2 * Math.PI)

const gcd = (left, right) => {
  let a = Math.abs(Math.trunc(left))
  let b = Math.abs(Math.trunc(right))
  while (b) [a, b] = [b, a % b]
  return a
}

const bernoulliPolynomial = (order, x) => {
  if (order === 2) return x ** 2 - x + 1 / 6
  if (order === 3) return x ** 3 - 1.5 * x ** 2 + 0.5 * x
  if (order === 4) return x ** 4 - 2 * x ** 3 + x ** 2 - 1 / 30
  if (order === 5) return x ** 5 - 2.5 * x ** 4 + (5 / 3) * x ** 3 - x / 6
  if (order === 6) return x ** 6 - 3 * x ** 5 + 2.5 * x ** 4 - 0.5 * x ** 2 + 1 / 42
  throw new Error(`Unsupported Bernoulli polynomial order ${order}`)
}

const harmonicNumber = (n) => {
  if (n < 1) return 0
  if (n < 32) {
    let total = 0
    for (let index = 1; index <= n; index += 1) total += 1 / index
    return total
  }
  const inverse = 1 / n
  const inverse2 = inverse * inverse
  return Math.log(n) + EULER_GAMMA + inverse / 2 - inverse2 / 12
    + inverse2 ** 2 / 120 - inverse2 ** 3 / 252 + inverse2 ** 4 / 240
    - 5 * inverse2 ** 5 / 660
}

export const nymanR1 = (x) => {
  if (!(x > 0)) throw new Error('R1 requires x > 0')
  const fractional = x - Math.floor(x)
  if (x < 10_000) {
    return Math.log(x) + EULER_GAMMA - harmonicNumber(Math.floor(x))
      - (fractional - 0.5) / x
  }
  let total = 0
  for (let order = 2; order <= 6; order += 1) {
    total += bernoulliPolynomial(order, fractional) / (order * x ** order)
  }
  return total
}

const HURWITZ_BERNOULLI = [
  [2, 1 / 6],
  [4, -1 / 30],
  [6, 1 / 42],
  [8, -1 / 30],
  [10, 5 / 66],
  [12, -691 / 2730],
]

const factorial = (n) => {
  let value = 1
  for (let index = 2; index <= n; index += 1) value *= index
  return value
}

const risingFactorial = (start, width) => {
  let value = 1
  for (let index = 0; index < width; index += 1) value *= start + index
  return value
}

const hurwitzZeta = (s, a) => {
  const directTerms = 24
  let total = 0
  for (let index = 0; index < directTerms; index += 1) total += (a + index) ** -s
  const edge = a + directTerms
  total += edge ** (1 - s) / (s - 1) + 0.5 * edge ** -s
  for (const [order, bernoulli] of HURWITZ_BERNOULLI) {
    total += (bernoulli / factorial(order))
      * risingFactorial(s, order - 1)
      * edge ** (-(s + order - 1))
  }
  return total
}

const progressionTail = (power, modulus, residue, cutoff) => {
  const normalizedResidue = residue === 0 ? modulus : residue
  let first = normalizedResidue
  if (first <= cutoff) first += Math.ceil((cutoff + 1 - first) / modulus) * modulus
  const a = first / modulus
  return hurwitzZeta(power, a) / modulus ** power
}

/**
 * Ehm's absolutely convergent Müntz series S_1(x), specialized to a rational
 * x = numerator / denominator >= 1. The tail uses the periodic Bernoulli
 * expansion through order six.
 */
export const nymanS1Rational = (numerator, denominator, options = {}) => {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)
    || numerator < denominator || denominator < 1) {
    throw new Error('S1 rational arguments require integer numerator >= denominator >= 1')
  }
  const common = gcd(numerator, denominator)
  const v = numerator / common
  const u = denominator / common
  const x = v / u
  const directCutoff = options.directCutoff ?? 4_096
  let total = 0
  for (let k = 1; k <= directCutoff; k += 1) total += nymanR1(k * x)

  for (let residue = 0; residue < u; residue += 1) {
    const fractional = ((residue * v) % u) / u
    for (let order = 2; order <= 6; order += 1) {
      total += bernoulliPolynomial(order, fractional)
        / (order * x ** order)
        * progressionTail(order, u, residue, directCutoff)
    }
  }
  return total
}

const gramCache = new Map()

/** Gram entry G^(1)_{m,n} in the Báez--Duarte criterion. */
export const nymanGramEntry = (m, n, options = {}) => {
  if (!Number.isInteger(m) || !Number.isInteger(n) || m < 1 || n < 1) {
    throw new Error('Gram indices must be positive integers')
  }
  const u = Math.min(m, n)
  const v = Math.max(m, n)
  const cacheKey = `${u}:${v}:${options.directCutoff ?? 4096}`
  if (gramCache.has(cacheKey)) return gramCache.get(cacheKey)
  const K = (LOG_TWO_PI - EULER_GAMMA + 1) / 2
  const value = (K + 0.5 * Math.log(v / u)) / v
    + nymanS1Rational(v, u, options) / u
  gramCache.set(cacheKey, value)
  return value
}

/** Mixed term F_n in Ehm equation (3), q=1. */
export const nymanTargetEntry = (n) => (EULER_GAMMA - 1 - Math.log(n)) / n

const choleskySolve = (matrix, rightHandSide) => {
  const size = matrix.length
  const lower = Array.from({ length: size }, () => Array(size).fill(0))
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      let value = matrix[row][column]
      for (let index = 0; index < column; index += 1) {
        value -= lower[row][index] * lower[column][index]
      }
      if (row === column) {
        if (!(value > 0)) throw new Error(`Nyman Gram matrix is not positive at row ${row}`)
        lower[row][column] = Math.sqrt(value)
      } else lower[row][column] = value / lower[column][column]
    }
  }
  const intermediate = Array(size).fill(0)
  for (let row = 0; row < size; row += 1) {
    let value = rightHandSide[row]
    for (let column = 0; column < row; column += 1) value -= lower[row][column] * intermediate[column]
    intermediate[row] = value / lower[row][row]
  }
  const solution = Array(size).fill(0)
  for (let row = size - 1; row >= 0; row -= 1) {
    let value = intermediate[row]
    for (let column = row + 1; column < size; column += 1) value -= lower[column][row] * solution[column]
    solution[row] = value / lower[row][row]
  }
  return { solution, lower }
}

export const nymanOptimalDistance = (indices, options = {}) => {
  const basis = [...indices]
  const gram = basis.map((left) => basis.map((right) => nymanGramEntry(left, right, options)))
  const target = basis.map(nymanTargetEntry)
  const { solution: coefficients, lower } = choleskySolve(gram, target)
  const projectionEnergy = coefficients.reduce(
    (total, coefficient, index) => total + coefficient * target[index],
    0,
  )
  const distanceSquared = Math.max(0, 1 - projectionEnergy)
  const minPivot = Math.min(...lower.map((row, index) => row[index] ** 2))
  const maxPivot = Math.max(...lower.map((row, index) => row[index] ** 2))
  return {
    indices: basis,
    distanceSquared,
    coefficients,
    projectionEnergy,
    minPivot,
    pivotRatio: maxPivot / minPivot,
  }
}

export const nymanDistanceLadder = (maximumIndex, options = {}) => {
  const rows = []
  let previous = 1
  for (let n = 1; n <= maximumIndex; n += 1) {
    const result = nymanOptimalDistance(
      Array.from({ length: n }, (_, index) => index + 1),
      options,
    )
    rows.push({
      n,
      distanceSquared: result.distanceSquared,
      gain: previous - result.distanceSquared,
      logScaledDistance: n > 1 ? Math.log(n) * result.distanceSquared : 0,
      newestCoefficient: result.coefficients.at(-1),
      minPivot: result.minPivot,
      pivotRatio: result.pivotRatio,
    })
    previous = result.distanceSquared
  }
  return rows
}

export const NYMAN_CONSTANTS = {
  eulerGamma: EULER_GAMMA,
  burnolConstant: 2 + EULER_GAMMA - Math.log(4 * Math.PI),
  K: (LOG_TWO_PI - EULER_GAMMA + 1) / 2,
}
