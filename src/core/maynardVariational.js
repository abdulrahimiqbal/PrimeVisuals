const gcdBigInt = (left, right) => {
  let a = left < 0n ? -left : left
  let b = right < 0n ? -right : right
  while (b !== 0n) {
    const remainder = a % b
    a = b
    b = remainder
  }
  return a
}

const rational = (numerator, denominator = 1n) => {
  if (denominator === 0n) throw new Error('A rational denominator cannot be zero')
  let n = BigInt(numerator)
  let d = BigInt(denominator)
  if (d < 0n) {
    n = -n
    d = -d
  }
  if (n === 0n) return { numerator: 0n, denominator: 1n }
  const divisor = gcdBigInt(n, d)
  return { numerator: n / divisor, denominator: d / divisor }
}

const addRational = (left, right) => rational(
  left.numerator * right.denominator + right.numerator * left.denominator,
  left.denominator * right.denominator,
)

const multiplyRational = (left, right) => rational(
  left.numerator * right.numerator,
  left.denominator * right.denominator,
)

const divideRational = (left, right) => rational(
  left.numerator * right.denominator,
  left.denominator * right.numerator,
)

const factorialTables = (limit) => {
  const exact = Array(limit + 1).fill(1n)
  const numeric = Array(limit + 1).fill(1)
  for (let index = 2; index <= limit; index += 1) {
    exact[index] = exact[index - 1] * BigInt(index)
    numeric[index] = numeric[index - 1] * index
  }
  return { exact, numeric }
}

const exponentSum = (exponents) => exponents.reduce((total, value) => total + value, 0)

const validateExponents = (exponents, k) => {
  if (!Array.isArray(exponents) || exponents.length !== k) {
    throw new Error(`Expected ${k} non-negative integer exponents`)
  }
  for (const exponent of exponents) {
    if (!Number.isInteger(exponent) || exponent < 0) {
      throw new Error('Monomial exponents must be non-negative integers')
    }
  }
}

/**
 * Enumerate t_1^a_1 ... t_k^a_k with total degree at most maxDegree.
 */
export const enumerateSimplexMonomials = (k, maxDegree) => {
  if (!Number.isInteger(k) || k < 1) throw new Error('k must be a positive integer')
  if (!Number.isInteger(maxDegree) || maxDegree < 0) {
    throw new Error('maxDegree must be a non-negative integer')
  }

  const monomials = []
  const current = Array(k).fill(0)
  const visit = (coordinate, remaining) => {
    if (coordinate === k) {
      monomials.push([...current])
      return
    }
    for (let exponent = 0; exponent <= remaining; exponent += 1) {
      current[coordinate] = exponent
      visit(coordinate + 1, remaining - exponent)
    }
  }

  // visit(maxDegree) already includes all lower degrees without duplication.
  visit(0, maxDegree)
  return monomials
}

const numericIEntry = (alpha, beta, factorial) => {
  let numerator = 1
  let totalDegree = 0
  for (let index = 0; index < alpha.length; index += 1) {
    const combined = alpha[index] + beta[index]
    numerator *= factorial[combined]
    totalDegree += combined
  }
  return numerator / factorial[alpha.length + totalDegree]
}

const numericJEntry = (alpha, beta, coordinate, factorial) => {
  let numerator = 1
  let totalDegree = 0
  for (let index = 0; index < alpha.length; index += 1) {
    const combined = alpha[index] + beta[index]
    totalDegree += combined
    numerator *= factorial[combined + (index === coordinate ? 2 : 0)]
  }
  const integrationDivisor = (alpha[coordinate] + 1) * (beta[coordinate] + 1)
  return numerator / (integrationDivisor * factorial[alpha.length + totalDegree + 1])
}

/**
 * Build the exact-integral Gram matrices for
 * I_k(F) = integral_Rk F^2 and A_k(F) = sum_m J_k^(m)(F).
 */
export const buildMaynardGramMatrices = (k, maxDegree) => {
  const monomials = enumerateSimplexMonomials(k, maxDegree)
  const factorialLimit = k + 2 * maxDegree + 2
  const { numeric: factorial } = factorialTables(factorialLimit)
  const size = monomials.length
  const I = Array.from({ length: size }, () => Array(size).fill(0))
  const A = Array.from({ length: size }, () => Array(size).fill(0))

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      const alpha = monomials[row]
      const beta = monomials[column]
      const iEntry = numericIEntry(alpha, beta, factorial)
      let aEntry = 0
      for (let coordinate = 0; coordinate < k; coordinate += 1) {
        aEntry += numericJEntry(alpha, beta, coordinate, factorial)
      }
      I[row][column] = iEntry
      I[column][row] = iEntry
      A[row][column] = aEntry
      A[column][row] = aEntry
    }
  }

  return { k, maxDegree, monomials, I, A }
}

const binomialBigInt = (n, r) => {
  if (r < 0 || r > n) return 0n
  const width = Math.min(r, n - r)
  let result = 1n
  for (let index = 1; index <= width; index += 1) {
    result = (result * BigInt(n - width + index)) / BigInt(index)
  }
  return result
}

const positiveCompositions = (total, parts) => {
  if (parts === 0) return total === 0 ? [[]] : []
  if (parts === 1) return total >= 1 ? [[total]] : []
  const compositions = []
  for (let first = 1; first <= total - parts + 1; first += 1) {
    for (const tail of positiveCompositions(total - first, parts - 1)) {
      compositions.push([first, ...tail])
    }
  }
  return compositions
}

const gPolynomialAtInteger = (power, j, k, factorial) => {
  if (power === 0) return 1n
  let total = 0n
  for (let occupied = 1; occupied <= Math.min(power, k); occupied += 1) {
    let compositionSum = 0n
    for (const composition of positiveCompositions(power, occupied)) {
      let product = 1n
      for (const part of composition) product *= factorial[j * part] / factorial[part]
      compositionSum += product
    }
    total += binomialBigInt(k, occupied) * compositionSum
  }
  return factorial[power] * total
}

export const enumerateMaynardSymmetricBasis = (weightedDegree) => {
  if (!Number.isInteger(weightedDegree) || weightedDegree < 0) {
    throw new Error('weightedDegree must be a non-negative integer')
  }
  const basis = []
  for (let c = 0; 2 * c <= weightedDegree; c += 1) {
    for (let b = 0; b + 2 * c <= weightedDegree; b += 1) basis.push({ b, c })
  }
  return basis
}

const exactSymmetricIEntry = (k, left, right, factorial, gCache) => {
  const b = left.b + right.b
  const c = left.c + right.c
  const key = `${c}:${k}`
  if (!gCache.has(key)) gCache.set(key, gPolynomialAtInteger(c, 2, k, factorial))
  return rational(
    factorial[b] * gCache.get(key),
    factorial[k + b + 2 * c],
  )
}

const exactSymmetricJEntry = (k, left, right, factorial, gCache) => {
  let total = rational(0n)
  for (let c1 = 0; c1 <= left.c; c1 += 1) {
    for (let c2 = 0; c2 <= right.c; c2 += 1) {
      const remainingLeft = 2 * left.c - 2 * c1
      const remainingRight = 2 * right.c - 2 * c2
      const combinedC = c1 + c2
      const gKey = `${combinedC}:${k - 1}`
      if (!gCache.has(gKey)) {
        gCache.set(gKey, gPolynomialAtInteger(combinedC, 2, k - 1, factorial))
      }
      const gammaNumerator = factorial[left.b]
        * factorial[right.b]
        * factorial[remainingLeft]
        * factorial[remainingRight]
        * factorial[left.b + right.b + remainingLeft + remainingRight + 2]
      const gammaDenominator = factorial[left.b + remainingLeft + 1]
        * factorial[right.b + remainingRight + 1]
      const numerator = binomialBigInt(left.c, c1)
        * binomialBigInt(right.c, c2)
        * gammaNumerator
        * gCache.get(gKey)
      const denominator = gammaDenominator
        * factorial[k + left.b + right.b + 2 * left.c + 2 * right.c + 1]
      total = addRational(total, rational(numerator, denominator))
    }
  }
  return total
}

/**
 * Maynard's symmetry-reduced basis (1 - P_1)^b P_2^c, b + 2c <= d.
 * Lemmas 8.1--8.2 give every entry using exact integer arithmetic.
 */
export const buildMaynardSymmetricGramMatrices = (k, weightedDegree) => {
  if (!Number.isInteger(k) || k < 2) throw new Error('k must be an integer at least 2')
  const basis = enumerateMaynardSymmetricBasis(weightedDegree)
  const { exact: factorial } = factorialTables(k + 2 * weightedDegree + 4)
  const gCache = new Map()
  const size = basis.length
  const I = Array.from({ length: size }, () => Array(size).fill(0))
  const A = Array.from({ length: size }, () => Array(size).fill(0))
  const exactI = Array.from({ length: size }, () => Array(size))
  const exactA = Array.from({ length: size }, () => Array(size))
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      const iEntry = exactSymmetricIEntry(k, basis[row], basis[column], factorial, gCache)
      const jEntry = exactSymmetricJEntry(k, basis[row], basis[column], factorial, gCache)
      const aEntry = multiplyRational(rational(BigInt(k)), jEntry)
      const numericI = Number(iEntry.numerator) / Number(iEntry.denominator)
      const numericA = Number(aEntry.numerator) / Number(aEntry.denominator)
      I[row][column] = numericI
      I[column][row] = numericI
      A[row][column] = numericA
      A[column][row] = numericA
      exactI[row][column] = iEntry
      exactI[column][row] = iEntry
      exactA[row][column] = aEntry
      exactA[column][row] = aEntry
    }
  }
  // maximizeMaynardQuotient only relies on the basis length at this field.
  return { k, weightedDegree, basis, monomials: basis, I, A, exactI, exactA }
}

export const exactSymmetricRayleighQuotient = (gram, coefficients) => {
  if (coefficients.length !== gram.basis.length) {
    throw new Error('Coefficient vector does not match the symmetric basis')
  }
  const normalized = coefficients.map((coefficient) => rational(
    coefficient.numerator,
    coefficient.denominator ?? 1n,
  ))
  let iTotal = rational(0n)
  let aTotal = rational(0n)
  for (let row = 0; row < normalized.length; row += 1) {
    for (let column = 0; column < normalized.length; column += 1) {
      const product = multiplyRational(normalized[row], normalized[column])
      iTotal = addRational(iTotal, multiplyRational(product, gram.exactI[row][column]))
      aTotal = addRational(aTotal, multiplyRational(product, gram.exactA[row][column]))
    }
  }
  const quotient = divideRational(aTotal, iTotal)
  return {
    numerator: quotient.numerator,
    denominator: quotient.denominator,
    value: Number(quotient.numerator) / Number(quotient.denominator),
    I: iTotal,
    A: aTotal,
  }
}

const signatureKey = (signature) => signature.join(',')

const signatureOrbitSize = (signature, k, factorial) => {
  const multiplicities = new Map([[0, k - signature.length]])
  for (const exponent of signature) {
    multiplicities.set(exponent, (multiplicities.get(exponent) ?? 0) + 1)
  }
  let denominator = 1n
  for (const count of multiplicities.values()) denominator *= factorial[count]
  return factorial[k] / denominator
}

const applyMaynardOperator = (polynomial, k, factorial) => {
  const output = new Map()
  const addOutput = (b, signature, coefficient) => {
    const key = `${b}|${signatureKey(signature)}`
    output.set(key, output.has(key) ? addRational(output.get(key), coefficient) : coefficient)
  }

  for (const term of polynomial.values()) {
    const signature = term.signature
    const multiplicities = new Map([[0, k - signature.length]])
    for (const exponent of signature) {
      multiplicities.set(exponent, (multiplicities.get(exponent) ?? 0) + 1)
    }
    if (multiplicities.get(0) === 0) multiplicities.delete(0)
    const sourceOrbit = signatureOrbitSize(signature, k, factorial)

    for (const [removedExponent, multiplicity] of multiplicities) {
      const integrationDegree = term.b + removedExponent + 1
      const remainder = [...signature]
      if (removedExponent > 0) remainder.splice(remainder.indexOf(removedExponent), 1)

      for (let b = 0; b <= integrationDegree; b += 1) {
        const replacementExponent = integrationDegree - b
        const targetSignature = replacementExponent > 0
          ? [...remainder, replacementExponent].sort((left, right) => right - left)
          : [...remainder]
        const targetOrbit = signatureOrbitSize(targetSignature, k, factorial)
        const operatorCoefficient = rational(
          factorial[term.b]
            * factorial[removedExponent]
            * binomialBigInt(integrationDegree, b)
            * sourceOrbit
            * BigInt(multiplicity),
          factorial[integrationDegree] * targetOrbit,
        )
        addOutput(
          b,
          targetSignature,
          multiplyRational(term.coefficient, operatorCoefficient),
        )
      }
    }
  }

  const normalized = new Map()
  for (const [key, coefficient] of output) {
    if (coefficient.numerator === 0n) continue
    const separator = key.indexOf('|')
    const b = Number(key.slice(0, separator))
    const signatureText = key.slice(separator + 1)
    normalized.set(key, {
      b,
      signature: signatureText ? signatureText.split(',').map(Number) : [],
      coefficient,
    })
  }
  return normalized
}

const integrateMaynardPolynomial = (polynomial, k, factorial) => {
  let total = rational(0n)
  for (const term of polynomial.values()) {
    const orbit = signatureOrbitSize(term.signature, k, factorial)
    let numerator = factorial[term.b] * orbit
    let degree = 0
    for (const exponent of term.signature) {
      numerator *= factorial[exponent]
      degree += exponent
    }
    const integral = rational(numerator, factorial[k + term.b + degree])
    total = addRational(total, multiplyRational(term.coefficient, integral))
  }
  return total
}

/**
 * Compute <L^i 1,1> exactly. L is the self-adjoint Maynard integral
 * operator used by Polymath8b's Krylov construction.
 */
export const maynardKrylovMoments = (k, maximumPower) => {
  if (!Number.isInteger(k) || k < 2) throw new Error('k must be an integer at least 2')
  if (!Number.isInteger(maximumPower) || maximumPower < 0) {
    throw new Error('maximumPower must be a non-negative integer')
  }
  const { exact: factorial } = factorialTables(k + maximumPower + 2)
  let polynomial = new Map([
    ['0|', { b: 0, signature: [], coefficient: rational(1n) }],
  ])
  const moments = []
  const termCounts = []
  for (let power = 0; power <= maximumPower; power += 1) {
    moments.push(integrateMaynardPolynomial(polynomial, k, factorial))
    termCounts.push(polynomial.size)
    if (power < maximumPower) polynomial = applyMaynardOperator(polynomial, k, factorial)
  }
  return { k, maximumPower, moments, termCounts }
}

export const buildMaynardKrylovGramMatrices = (k, dimension) => {
  if (!Number.isInteger(dimension) || dimension < 1) {
    throw new Error('dimension must be a positive integer')
  }
  const momentData = maynardKrylovMoments(k, 2 * dimension - 1)
  const I = Array.from({ length: dimension }, () => Array(dimension).fill(0))
  const A = Array.from({ length: dimension }, () => Array(dimension).fill(0))
  const exactI = Array.from({ length: dimension }, () => Array(dimension))
  const exactA = Array.from({ length: dimension }, () => Array(dimension))
  for (let row = 0; row < dimension; row += 1) {
    for (let column = 0; column < dimension; column += 1) {
      const iEntry = momentData.moments[row + column]
      const aEntry = momentData.moments[row + column + 1]
      I[row][column] = Number(iEntry.numerator) / Number(iEntry.denominator)
      A[row][column] = Number(aEntry.numerator) / Number(aEntry.denominator)
      exactI[row][column] = iEntry
      exactA[row][column] = aEntry
    }
  }
  const basis = Array.from({ length: dimension }, (_, index) => ({ krylovPower: index }))
  return {
    k,
    dimension,
    basis,
    monomials: basis,
    I,
    A,
    exactI,
    exactA,
    moments: momentData.moments,
    termCounts: momentData.termCounts,
  }
}

const dot = (left, right) => left.reduce((sum, value, index) => sum + value * right[index], 0)

const multiplyMatrixVector = (matrix, vector) => matrix.map((row) => dot(row, vector))

const cholesky = (matrix, tolerance = 1e-13) => {
  const size = matrix.length
  const lower = Array.from({ length: size }, () => Array(size).fill(0))
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      let value = matrix[row][column]
      for (let index = 0; index < column; index += 1) {
        value -= lower[row][index] * lower[column][index]
      }
      if (row === column) {
        if (!(value > tolerance)) {
          throw new Error(`I Gram matrix lost positive definiteness at row ${row} (${value})`)
        }
        lower[row][column] = Math.sqrt(value)
      } else {
        lower[row][column] = value / lower[column][column]
      }
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

const solveUpperTranspose = (lower, rightHandSide) => {
  const result = Array(rightHandSide.length).fill(0)
  for (let row = result.length - 1; row >= 0; row -= 1) {
    let value = rightHandSide[row]
    for (let column = row + 1; column < result.length; column += 1) {
      value -= lower[column][row] * result[column]
    }
    result[row] = value / lower[row][row]
  }
  return result
}

const scaleGeneralizedProblem = (A, I) => {
  const diagonal = I.map((row, index) => Math.sqrt(row[index]))
  const scaledI = I.map((row, rowIndex) => row.map(
    (value, columnIndex) => value / (diagonal[rowIndex] * diagonal[columnIndex]),
  ))
  const scaledA = A.map((row, rowIndex) => row.map(
    (value, columnIndex) => value / (diagonal[rowIndex] * diagonal[columnIndex]),
  ))
  return { scaledA, scaledI, diagonal }
}

const multiplyMatrices = (left, right) => {
  const rows = left.length
  const columns = right[0].length
  const shared = right.length
  const output = Array.from({ length: rows }, () => Array(columns).fill(0))
  for (let row = 0; row < rows; row += 1) {
    for (let index = 0; index < shared; index += 1) {
      const coefficient = left[row][index]
      for (let column = 0; column < columns; column += 1) {
        output[row][column] += coefficient * right[index][column]
      }
    }
  }
  return output
}

const transpose = (matrix) => matrix[0].map((_, column) => matrix.map((row) => row[column]))

const transformedSymmetricMatrix = (lower, matrix) => {
  const size = lower.length
  const inverseLower = Array.from({ length: size }, () => Array(size).fill(0))
  for (let column = 0; column < size; column += 1) {
    const unit = Array(size).fill(0)
    unit[column] = 1
    const solution = solveLower(lower, unit)
    for (let row = 0; row < size; row += 1) inverseLower[row][column] = solution[row]
  }
  const transformed = multiplyMatrices(multiplyMatrices(inverseLower, matrix), transpose(inverseLower))
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < row; column += 1) {
      const average = (transformed[row][column] + transformed[column][row]) / 2
      transformed[row][column] = average
      transformed[column][row] = average
    }
  }
  return transformed
}

const jacobiLargestEigenpair = (input, tolerance = 1e-13, maximumSweeps = 100) => {
  const size = input.length
  const matrix = input.map((row) => [...row])
  const vectors = Array.from(
    { length: size },
    (_, row) => Array.from({ length: size }, (__, column) => (row === column ? 1 : 0)),
  )
  let rotations = 0
  let converged = false
  for (let sweep = 0; sweep < maximumSweeps; sweep += 1) {
    let maximum = 0
    for (let left = 0; left < size - 1; left += 1) {
      for (let right = left + 1; right < size; right += 1) {
        maximum = Math.max(maximum, Math.abs(matrix[left][right]))
        const scale = Math.sqrt(Math.abs(matrix[left][left] * matrix[right][right]))
        if (Math.abs(matrix[left][right]) <= tolerance * Math.max(1, scale)) continue
        const tau = (matrix[right][right] - matrix[left][left]) / (2 * matrix[left][right])
        const tangent = (tau >= 0 ? 1 : -1) / (Math.abs(tau) + Math.sqrt(1 + tau * tau))
        const cosine = 1 / Math.sqrt(1 + tangent * tangent)
        const sine = tangent * cosine
        const leftDiagonal = matrix[left][left]
        const rightDiagonal = matrix[right][right]
        const cross = matrix[left][right]
        matrix[left][left] = leftDiagonal - tangent * cross
        matrix[right][right] = rightDiagonal + tangent * cross
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
        rotations += 1
      }
    }
    if (maximum <= tolerance) {
      converged = true
      break
    }
  }
  let largest = 0
  for (let index = 1; index < size; index += 1) {
    if (matrix[index][index] > matrix[largest][largest]) largest = index
  }
  return {
    value: matrix[largest][largest],
    vector: vectors.map((row) => row[largest]),
    rotations,
    converged,
  }
}

/**
 * Numerically maximize A_k(F) / I_k(F) in the supplied polynomial space.
 * The returned quotient is a rigorous lower bound only after the coefficients
 * are rationalized and checked by exactRayleighQuotient.
 */
export const maximizeMaynardQuotient = (gram, options = {}) => {
  const { tolerance = 1e-12, maxIterations = 10_000, method = 'power' } = options
  const { scaledA, scaledI, diagonal } = scaleGeneralizedProblem(gram.A, gram.I)
  const lower = cholesky(scaledI)
  if (method === 'jacobi') {
    const transformedMatrix = transformedSymmetricMatrix(lower, scaledA)
    const pair = jacobiLargestEigenpair(transformedMatrix, tolerance / 10)
    const scaledCoefficients = solveUpperTranspose(lower, pair.vector)
    const numerator = dot(scaledCoefficients, multiplyMatrixVector(scaledA, scaledCoefficients))
    const denominator = dot(scaledCoefficients, multiplyMatrixVector(scaledI, scaledCoefficients))
    const quotient = numerator / denominator
    const image = multiplyMatrixVector(transformedMatrix, pair.vector)
    const residual = Math.sqrt(image.reduce(
      (sum, value, index) => sum + (value - quotient * pair.vector[index]) ** 2,
      0,
    ))
    const coefficients = scaledCoefficients.map((value, index) => value / diagonal[index])
    const coefficientScale = Math.max(...coefficients.map(Math.abs))
    return {
      quotient,
      coefficients: coefficients.map((value) => value / coefficientScale),
      iterations: pair.rotations,
      residual,
      converged: pair.converged,
    }
  }
  if (method !== 'power') throw new Error(`Unknown eigenvalue method: ${method}`)
  let transformed = Array.from(
    { length: gram.monomials.length },
    (_, index) => 1 + ((index * 104729) % 101) / 101,
  )
  let norm = Math.sqrt(dot(transformed, transformed))
  transformed = transformed.map((value) => value / norm)

  let quotient = 0
  let residual = Number.POSITIVE_INFINITY
  let iterations = 0
  for (; iterations < maxIterations; iterations += 1) {
    const scaledCoefficients = solveUpperTranspose(lower, transformed)
    const image = solveLower(lower, multiplyMatrixVector(scaledA, scaledCoefficients))
    const nextNorm = Math.sqrt(dot(image, image))
    const next = image.map((value) => value / nextNorm)
    const nextScaledCoefficients = solveUpperTranspose(lower, next)
    const numerator = dot(nextScaledCoefficients, multiplyMatrixVector(scaledA, nextScaledCoefficients))
    const denominator = dot(nextScaledCoefficients, multiplyMatrixVector(scaledI, nextScaledCoefficients))
    const nextQuotient = numerator / denominator
    const transformedImage = solveLower(
      lower,
      multiplyMatrixVector(scaledA, nextScaledCoefficients),
    )
    residual = Math.sqrt(transformedImage.reduce(
      (sum, value, index) => sum + (value - nextQuotient * next[index]) ** 2,
      0,
    ))
    transformed = next
    if (Math.abs(nextQuotient - quotient) <= tolerance * Math.max(1, Math.abs(nextQuotient)) && residual <= Math.sqrt(tolerance)) {
      quotient = nextQuotient
      break
    }
    quotient = nextQuotient
  }

  const scaledCoefficients = solveUpperTranspose(lower, transformed)
  const coefficients = scaledCoefficients.map((value, index) => value / diagonal[index])
  const coefficientScale = Math.max(...coefficients.map(Math.abs))
  return {
    quotient,
    coefficients: coefficients.map((value) => value / coefficientScale),
    iterations: iterations + 1,
    residual,
    converged: iterations < maxIterations,
  }
}

const exactIEntry = (alpha, beta, factorial) => {
  let numerator = 1n
  let totalDegree = 0
  for (let index = 0; index < alpha.length; index += 1) {
    const combined = alpha[index] + beta[index]
    numerator *= factorial[combined]
    totalDegree += combined
  }
  return rational(numerator, factorial[alpha.length + totalDegree])
}

const exactJEntry = (alpha, beta, coordinate, factorial) => {
  let numerator = 1n
  let totalDegree = 0
  for (let index = 0; index < alpha.length; index += 1) {
    const combined = alpha[index] + beta[index]
    totalDegree += combined
    numerator *= factorial[combined + (index === coordinate ? 2 : 0)]
  }
  const integrationDivisor = BigInt((alpha[coordinate] + 1) * (beta[coordinate] + 1))
  return rational(
    numerator,
    integrationDivisor * factorial[alpha.length + totalDegree + 1],
  )
}

/**
 * Evaluate a rational polynomial witness with BigInt-only simplex integration.
 */
export const exactRayleighQuotient = (k, terms) => {
  if (!Array.isArray(terms) || terms.length === 0) throw new Error('At least one term is required')
  let maxDegree = 0
  const normalizedTerms = terms.map((term) => {
    validateExponents(term.exponents, k)
    maxDegree = Math.max(maxDegree, exponentSum(term.exponents))
    return {
      exponents: [...term.exponents],
      coefficient: rational(term.numerator, term.denominator ?? 1n),
    }
  })
  const { exact: factorial } = factorialTables(k + 2 * maxDegree + 2)
  let iTotal = rational(0n)
  let aTotal = rational(0n)

  for (const left of normalizedTerms) {
    for (const right of normalizedTerms) {
      const coefficientProduct = multiplyRational(left.coefficient, right.coefficient)
      iTotal = addRational(
        iTotal,
        multiplyRational(coefficientProduct, exactIEntry(left.exponents, right.exponents, factorial)),
      )
      for (let coordinate = 0; coordinate < k; coordinate += 1) {
        aTotal = addRational(
          aTotal,
          multiplyRational(
            coefficientProduct,
            exactJEntry(left.exponents, right.exponents, coordinate, factorial),
          ),
        )
      }
    }
  }

  const quotient = divideRational(aTotal, iTotal)
  return {
    numerator: quotient.numerator,
    denominator: quotient.denominator,
    value: Number(quotient.numerator) / Number(quotient.denominator),
    I: iTotal,
    A: aTotal,
  }
}

const addTerm = (terms, exponents, numerator, denominator = 1n) => {
  terms.push({ exponents, numerator: BigInt(numerator), denominator: BigInt(denominator) })
}

/** The polynomial P in Maynard (2015), equations (8.16)--(8.17). */
export const maynardM5Witness = () => {
  const k = 5
  const terms = []
  addTerm(terms, Array(k).fill(0), 17n, 35n)
  for (let index = 0; index < k; index += 1) {
    const linear = Array(k).fill(0)
    linear[index] = 1
    addTerm(terms, linear, -83n, 70n)

    const square = Array(k).fill(0)
    square[index] = 2
    addTerm(terms, square, 62n, 35n)

    const cube = Array(k).fill(0)
    cube[index] = 3
    addTerm(terms, cube, -1n)
  }
  for (let left = 0; left < k; left += 1) {
    for (let right = left + 1; right < k; right += 1) {
      const cross = Array(k).fill(0)
      cross[left] = 1
      cross[right] = 1
      addTerm(terms, cross, 7n, 5n)
    }
  }
  for (let linearIndex = 0; linearIndex < k; linearIndex += 1) {
    for (let squareIndex = 0; squareIndex < k; squareIndex += 1) {
      if (linearIndex === squareIndex) continue
      const mixed = Array(k).fill(0)
      mixed[linearIndex] = 1
      mixed[squareIndex] = 2
      addTerm(terms, mixed, -1n)
    }
  }
  return terms
}

/** A four-decimal rationalization of the independently optimized cubic witness. */
export const calibratedM5CubicWitness = () => {
  const gram = buildMaynardGramMatrices(5, 3)
  const coefficientsByPartition = new Map([
    ['0,0,0,0,0', 2389n],
    ['1,0,0,0,0', -6425n],
    ['2,0,0,0,0', 9395n],
    ['3,0,0,0,0', -5035n],
    ['1,1,0,0,0', 10000n],
    ['2,1,0,0,0', -6895n],
    ['1,1,1,0,0', -6368n],
  ])
  return gram.monomials.map((exponents) => ({
    exponents,
    numerator: coefficientsByPartition.get([...exponents].sort((a, b) => b - a).join(',')),
    denominator: 10000n,
  }))
}
