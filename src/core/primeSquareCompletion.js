import { brownianKernelMatrix } from './weilScrew.js'

const zeros = (rows, columns = rows) => Array.from(
  { length: rows },
  () => Array(columns).fill(0),
)

const identity = (size) => Array.from(
  { length: size },
  (_, row) => Array.from({ length: size }, (__, column) => row === column ? 1 : 0),
)

const transpose = (matrix) => matrix[0].map((_, column) => matrix.map((row) => row[column]))

const multiply = (left, right) => {
  const output = zeros(left.length, right[0].length)
  for (let row = 0; row < left.length; row += 1) {
    for (let index = 0; index < right.length; index += 1) {
      const leftValue = left[row][index]
      if (leftValue === 0) continue
      for (let column = 0; column < right[0].length; column += 1) {
        output[row][column] += leftValue * right[index][column]
      }
    }
  }
  return output
}

const add = (left, right) => left.map(
  (row, rowIndex) => row.map((value, columnIndex) => value + right[rowIndex][columnIndex]),
)

const scale = (matrix, scalar) => matrix.map((row) => row.map((value) => scalar * value))

const inverse = (input) => {
  const size = input.length
  const augmented = input.map((row, rowIndex) => [...row, ...identity(size)[rowIndex]])
  for (let pivot = 0; pivot < size; pivot += 1) {
    let best = pivot
    for (let row = pivot + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][pivot]) > Math.abs(augmented[best][pivot])) best = row
    }
    if (Math.abs(augmented[best][pivot]) < 1e-14) throw new Error('Singular matrix')
    ;[augmented[pivot], augmented[best]] = [augmented[best], augmented[pivot]]
    const divisor = augmented[pivot][pivot]
    for (let column = 0; column < 2 * size; column += 1) augmented[pivot][column] /= divisor
    for (let row = 0; row < size; row += 1) {
      if (row === pivot) continue
      const factor = augmented[row][pivot]
      if (factor === 0) continue
      for (let column = 0; column < 2 * size; column += 1) {
        augmented[row][column] -= factor * augmented[pivot][column]
      }
    }
  }
  return augmented.map((row) => row.slice(size))
}

const primesBelow = (maximum) => {
  const prime = new Uint8Array(maximum)
  prime.fill(1)
  if (maximum > 0) prime[0] = 0
  if (maximum > 1) prime[1] = 0
  for (let p = 2; p * p < maximum; p += 1) {
    if (!prime[p]) continue
    for (let multiple = p * p; multiple < maximum; multiple += p) prime[multiple] = 0
  }
  return Array.from({ length: maximum }, (_, value) => value).filter((value) => prime[value])
}

/** Endpoints whose anchored indicators span the log-integer partition of [0, log N]. */
export const logEndpointPoints = (maximumInteger) => {
  if (!Number.isInteger(maximumInteger) || maximumInteger < 2) {
    throw new Error('maximumInteger must be an integer at least 2')
  }
  return Array.from({ length: maximumInteger - 1 }, (_, index) => Math.log(index + 2))
}

/**
 * Matrix of the truncated shift T_(log m) in the anchored basis
 * phi_n = 1_[0, log n], 2 <= n <= N.
 *
 * T_(log m) phi_n = phi_(min(m*n,N)) - phi_m.  The representation therefore
 * preserves T_(log m) T_(log n) = T_(log(m*n)) exactly before floating-point
 * coefficients enter.
 */
export const truncatedDilationShiftMatrix = (multiplier, maximumInteger) => {
  if (!Number.isInteger(multiplier) || multiplier < 1) throw new Error('multiplier must be positive')
  const size = maximumInteger - 1
  if (multiplier === 1) return identity(size)
  const matrix = zeros(size)
  if (multiplier >= maximumInteger) return matrix
  const lowerRow = multiplier - 2
  for (let n = 2; n <= maximumInteger; n += 1) {
    const upper = Math.min(multiplier * n, maximumInteger)
    if (upper <= multiplier) continue
    const column = n - 2
    matrix[upper - 2][column] += 1
    matrix[lowerRow][column] -= 1
  }
  return matrix
}

/** Exact finite Euler-product metric and its pulled-back logarithmic strain. */
export const buildPrimeMetricStrain = (maximumInteger, sigma = 0.5) => {
  const points = logEndpointPoints(maximumInteger)
  const reference = brownianKernelMatrix(points)
  const primes = primesBelow(maximumInteger)
  const size = points.length
  let eulerOperator = identity(size)
  let logarithmicGenerator = zeros(size)
  const primePowers = []

  for (const p of primes) {
    const primeShift = truncatedDilationShiftMatrix(p, maximumInteger)
    eulerOperator = multiply(
      eulerOperator,
      add(identity(size), scale(primeShift, -(p ** -sigma))),
    )
    for (let power = p, exponent = 1; power < maximumInteger; exponent += 1) {
      const weight = Math.log(p) * p ** (-exponent * sigma)
      const shift = truncatedDilationShiftMatrix(power, maximumInteger)
      logarithmicGenerator = add(logarithmicGenerator, scale(shift, weight))
      primePowers.push({ p, exponent, value: power, weight })
      if (power > (maximumInteger - 1) / p) break
      power *= p
    }
  }

  const eulerDerivative = multiply(eulerOperator, logarithmicGenerator)
  const metric = multiply(multiply(transpose(eulerOperator), reference), eulerOperator)
  const metricDerivative = add(
    multiply(multiply(transpose(eulerDerivative), reference), eulerOperator),
    multiply(multiply(transpose(eulerOperator), reference), eulerDerivative),
  )
  const eulerInverse = inverse(eulerOperator)
  const pulledBackStrain = multiply(
    multiply(transpose(eulerInverse), metricDerivative),
    eulerInverse,
  )
  const generatorStrain = add(
    multiply(transpose(logarithmicGenerator), reference),
    multiply(reference, logarithmicGenerator),
  )

  return {
    maximumInteger,
    sigma,
    points,
    reference,
    primes,
    primePowers,
    eulerOperator,
    metric,
    metricDerivative,
    logarithmicGenerator,
    pulledBackStrain,
    generatorStrain,
  }
}

export const primeSquareMatrix = (p, q, maximumInteger) => {
  const size = maximumInteger - 1
  return add(
    add(identity(size), scale(truncatedDilationShiftMatrix(p, maximumInteger), -1)),
    add(
      scale(truncatedDilationShiftMatrix(q, maximumInteger), -1),
      truncatedDilationShiftMatrix(p * q, maximumInteger),
    ),
  )
}

export const logIntegerPartition = (maximumInteger) => [0, ...logEndpointPoints(maximumInteger)]

/** Cross-Gram of cell indicators after two causal translations. */
export const shiftedCellCrossGram = (partition, leftShift = 0, rightShift = 0) => {
  const size = partition.length - 1
  const horizon = partition.at(-1)
  const output = zeros(size)
  for (let row = 0; row < size; row += 1) {
    const leftStart = partition[row] + leftShift
    const leftEnd = Math.min(horizon, partition[row + 1] + leftShift)
    if (leftStart >= leftEnd) continue
    for (let column = 0; column < size; column += 1) {
      const rightStart = partition[column] + rightShift
      const rightEnd = Math.min(horizon, partition[column + 1] + rightShift)
      if (rightStart >= rightEnd) continue
      output[row][column] = Math.max(
        0,
        Math.min(leftEnd, rightEnd) - Math.max(leftStart, rightStart),
      )
    }
  }
  return output
}

/** Cross-Gram of two operator polynomials in the causal shifts. */
export const shiftPolynomialCrossGram = (partition, leftTerms, rightTerms) => {
  const size = partition.length - 1
  let output = zeros(size)
  for (const left of leftTerms) {
    for (const right of rightTerms) {
      output = add(
        output,
        scale(
          shiftedCellCrossGram(partition, left.shift, right.shift),
          left.coefficient * right.coefficient,
        ),
      )
    }
  }
  return output
}

/** Gram matrix of an operator polynomial sum coefficient_i T_(shift_i). */
export const shiftPolynomialGram = (partition, terms) => (
  shiftPolynomialCrossGram(partition, terms, terms)
)

export const primeEdgeGram = (partition, p) => shiftPolynomialGram(partition, [
  { shift: 0, coefficient: 1 },
  { shift: Math.log(p), coefficient: -1 },
])

export const primePlaquetteGram = (partition, p, q) => shiftPolynomialGram(partition, [
  { shift: 0, coefficient: 1 },
  { shift: Math.log(p), coefficient: -1 },
  { shift: Math.log(q), coefficient: -1 },
  { shift: Math.log(p * q), coefficient: 1 },
])

/** Convert an anchored screw-kernel matrix into the log-cell basis. */
export const mixedDifferenceKernelMatrix = (g, partition) => {
  const size = partition.length - 1
  const anchored = Array.from(
    { length: partition.length },
    (_, row) => Array.from(
      { length: partition.length },
      (__, column) => g(partition[row] - partition[column])
        - g(partition[row]) - g(-partition[column]) + g(0),
    ),
  )
  return Array.from(
    { length: size },
    (_, row) => Array.from(
      { length: size },
      (__, column) => anchored[row + 1][column + 1]
        - anchored[row][column + 1]
        - anchored[row + 1][column]
        + anchored[row][column],
    ),
  )
}

/** Vectorization whose Euclidean product equals the Frobenius product. */
export const flattenSymmetricFrobenius = (matrix) => {
  const output = []
  for (let row = 0; row < matrix.length; row += 1) {
    for (let column = row; column < matrix.length; column += 1) {
      output.push(matrix[row][column] * (row === column ? 1 : Math.SQRT2))
    }
  }
  return output
}

export const buildStrictPrimeSquareAtoms = (maximumInteger) => {
  const partition = logIntegerPartition(maximumInteger)
  const primes = primesBelow(maximumInteger)
  const atoms = [{ name: 'boundary:identity', matrix: shiftedCellCrossGram(partition, 0, 0) }]
  for (const p of primes) atoms.push({ name: `edge:${p}`, matrix: primeEdgeGram(partition, p) })
  for (let left = 0; left < primes.length; left += 1) {
    for (let right = left + 1; right < primes.length; right += 1) {
      const p = primes[left]
      const q = primes[right]
      if (p * q >= maximumInteger) continue
      atoms.push({ name: `square:${p}:${q}`, matrix: primePlaquetteGram(partition, p, q) })
    }
  }
  return { maximumInteger, partition, primes, atoms }
}

export const PRIME_SQUARE_MATRIX_OPS = {
  add,
  identity,
  inverse,
  multiply,
  scale,
  transpose,
  zeros,
}
