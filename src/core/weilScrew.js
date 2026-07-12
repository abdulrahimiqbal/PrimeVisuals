const EULER_GAMMA = 0.5772156649015329
const CATALAN = 0.915965594177219
const PSI_QUARTER = -EULER_GAMMA - Math.PI / 2 - 3 * Math.log(2)
const HURWITZ_ZETA_TWO_QUARTER = Math.PI ** 2 + 8 * CATALAN

const mangoldtTable = (maximum) => {
  const values = new Float64Array(maximum + 1)
  const isPrime = new Uint8Array(maximum + 1)
  isPrime.fill(1)
  if (maximum >= 0) isPrime[0] = 0
  if (maximum >= 1) isPrime[1] = 0
  for (let p = 2; p <= maximum; p += 1) {
    if (!isPrime[p]) continue
    for (let multiple = p * 2; multiple <= maximum; multiple += p) isPrime[multiple] = 0
    for (let power = p; power <= maximum; power *= p) {
      values[power] = Math.log(p)
      if (power > maximum / p) break
    }
  }
  return values
}

const lerchQuarter = (t) => {
  if (t === 0) return HURWITZ_ZETA_TWO_QUARTER
  const z = Math.exp(-2 * t)
  let power = 1
  let total = 0
  for (let index = 0; index < 1_000_000; index += 1) {
    const term = power / (index + 0.25) ** 2
    total += term
    if (term < 2e-16 * Math.max(1, total)) break
    power *= z
  }
  return total
}

export const buildWeilScrewEvaluator = (maximumAbsT) => {
  if (!(maximumAbsT >= 0)) throw new Error('maximumAbsT must be non-negative')
  const maximumInteger = Math.max(2, Math.ceil(Math.exp(maximumAbsT)))
  const mangoldt = mangoldtTable(maximumInteger)
  const logValues = Array.from({ length: maximumInteger + 1 }, (_, n) => n > 0 ? Math.log(n) : 0)
  const cache = new Map([[0, 0]])

  const evaluateParts = (input) => {
    const t = Math.abs(input)
    if (t === 0) return { archimedean: 0, primePower: 0, total: 0 }
    if (t > maximumAbsT + 1e-12) throw new Error(`Requested |t|=${t} beyond evaluator support ${maximumAbsT}`)
    let primePowerTerm = 0
    const cutoff = Math.min(maximumInteger, Math.floor(Math.exp(t) + 1e-12))
    for (let n = 2; n <= cutoff; n += 1) {
      if (mangoldt[n] === 0) continue
      primePowerTerm += mangoldt[n] / Math.sqrt(n) * (t - logValues[n])
    }
    const archimedean = -4 * (Math.exp(t / 2) + Math.exp(-t / 2) - 2)
      - (t / 2) * (PSI_QUARTER - Math.log(Math.PI))
      - 0.25 * (
        HURWITZ_ZETA_TWO_QUARTER - Math.exp(-t / 2) * lerchQuarter(t)
      )
    return { archimedean, primePower: primePowerTerm, total: archimedean + primePowerTerm }
  }

  const evaluate = (input) => {
    const t = Math.abs(input)
    const key = t.toPrecision(15)
    if (!cache.has(key)) cache.set(key, evaluateParts(t).total)
    return cache.get(key)
  }
  const evaluateArchimedean = (input) => evaluateParts(input).archimedean
  const evaluatePrimePower = (input) => evaluateParts(input).primePower

  return {
    evaluate,
    evaluateArchimedean,
    evaluatePrimePower,
    evaluateParts,
    maximumAbsT,
    mangoldt,
    logValues,
  }
}

export const screwKernelEntry = (g, t, u) => g(t - u) - g(t) - g(-u) + g(0)

export const screwKernelMatrix = (g, points) => points.map(
  (t) => points.map((u) => screwKernelEntry(g, t, u)),
)

export const brownianKernelMatrix = (points) => points.map(
  (t) => points.map((u) => Math.min(Math.abs(t), Math.abs(u)) * (Math.sign(t) === Math.sign(u) ? 1 : 0)),
)

export const truncatedDistance = (t, cutoff) => Math.max(0, Math.abs(t) - cutoff)

/** Prime-power knot kernel from h_c(t)=(|t|-c)_+. */
export const primeKnotKernelMatrix = (cutoff, points) => screwKernelMatrix(
  (t) => truncatedDistance(t, cutoff),
  points,
)

const triangular = (t, cutoff) => Math.max(0, cutoff - Math.abs(t))

/**
 * K_{h_c} = K_{|.|} + K_{(c-|.|)_+}; on one positive half-line
 * K_{|.|}=-2 min(t,u). This returns the two pieces explicitly.
 */
export const primeKnotDecomposition = (cutoff, points) => {
  const brownian = brownianKernelMatrix(points).map((row) => row.map((value) => -2 * value))
  const triangularIncrement = screwKernelMatrix((t) => triangular(t, cutoff), points)
  return { brownian, triangularIncrement }
}

const cholesky = (matrix) => {
  const size = matrix.length
  const lower = Array.from({ length: size }, () => Array(size).fill(0))
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      let value = matrix[row][column]
      for (let index = 0; index < column; index += 1) value -= lower[row][index] * lower[column][index]
      if (row === column) {
        if (!(value > 1e-14)) throw new Error(`Reference kernel is singular at row ${row}`)
        lower[row][column] = Math.sqrt(value)
      } else lower[row][column] = value / lower[column][column]
    }
  }
  return lower
}

const solveLower = (lower, rightHandSide) => {
  const result = Array(rightHandSide.length).fill(0)
  for (let row = 0; row < result.length; row += 1) {
    let value = rightHandSide[row]
    for (let column = 0; column < row; column += 1) value -= lower[row][column] * result[column]
    result[row] = value / lower[row][row]
  }
  return result
}

const transpose = (matrix) => matrix[0].map((_, column) => matrix.map((row) => row[column]))

const multiply = (left, right) => {
  const output = Array.from({ length: left.length }, () => Array(right[0].length).fill(0))
  for (let row = 0; row < left.length; row += 1) {
    for (let index = 0; index < right.length; index += 1) {
      for (let column = 0; column < right[0].length; column += 1) {
        output[row][column] += left[row][index] * right[index][column]
      }
    }
  }
  return output
}

export const symmetricEigenDecomposition = (input, tolerance = 1e-12, maximumSweeps = 100) => {
  const matrix = input.map((row) => [...row])
  const size = matrix.length
  const vectors = Array.from(
    { length: size },
    (_, row) => Array.from({ length: size }, (__, column) => row === column ? 1 : 0),
  )
  for (let sweep = 0; sweep < maximumSweeps; sweep += 1) {
    let maximum = 0
    for (let left = 0; left < size - 1; left += 1) {
      for (let right = left + 1; right < size; right += 1) {
        maximum = Math.max(maximum, Math.abs(matrix[left][right]))
        if (Math.abs(matrix[left][right]) <= tolerance) continue
        const tau = (matrix[right][right] - matrix[left][left]) / (2 * matrix[left][right])
        const tangent = (tau >= 0 ? 1 : -1) / (Math.abs(tau) + Math.sqrt(1 + tau * tau))
        const cosine = 1 / Math.sqrt(1 + tangent * tangent)
        const sine = tangent * cosine
        const cross = matrix[left][right]
        matrix[left][left] -= tangent * cross
        matrix[right][right] += tangent * cross
        matrix[left][right] = 0
        matrix[right][left] = 0
        for (let index = 0; index < size; index += 1) {
          if (index === left || index === right) continue
          const leftValue = matrix[index][left]
          const rightValue = matrix[index][right]
          matrix[index][left] = cosine * leftValue - sine * rightValue
          matrix[left][index] = matrix[index][left]
          matrix[index][right] = sine * leftValue + cosine * rightValue
          matrix[right][index] = matrix[index][right]
        }
        for (let row = 0; row < size; row += 1) {
          const leftValue = vectors[row][left]
          const rightValue = vectors[row][right]
          vectors[row][left] = cosine * leftValue - sine * rightValue
          vectors[row][right] = sine * leftValue + cosine * rightValue
        }
      }
    }
    if (maximum <= tolerance) break
  }
  const order = Array.from({ length: size }, (_, index) => index)
    .sort((left, right) => matrix[left][left] - matrix[right][right])
  return {
    values: order.map((index) => matrix[index][index]),
    vectors: vectors.map((row) => order.map((index) => row[index])),
  }
}

export const whitenKernelMatrix = (matrix, reference) => {
  const lower = cholesky(reference)
  const size = lower.length
  const inverse = Array.from({ length: size }, () => Array(size).fill(0))
  for (let column = 0; column < size; column += 1) {
    const unit = Array(size).fill(0)
    unit[column] = 1
    const solution = solveLower(lower, unit)
    for (let row = 0; row < size; row += 1) inverse[row][column] = solution[row]
  }
  const transformed = multiply(multiply(inverse, matrix), transpose(inverse))
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < row; column += 1) {
      const average = (transformed[row][column] + transformed[column][row]) / 2
      transformed[row][column] = average
      transformed[column][row] = average
    }
  }
  return { transformed, inverseLower: inverse }
}

/** Generalized eigenvalues of matrix relative to a positive reference kernel. */
export const generalizedKernelEigenvalues = (matrix, reference) => {
  const { transformed } = whitenKernelMatrix(matrix, reference)
  return symmetricEigenDecomposition(transformed).values
}

export const WEIL_SCREW_CONSTANTS = {
  eulerGamma: EULER_GAMMA,
  catalan: CATALAN,
  psiQuarter: PSI_QUARTER,
  hurwitzZetaTwoQuarter: HURWITZ_ZETA_TWO_QUARTER,
}
