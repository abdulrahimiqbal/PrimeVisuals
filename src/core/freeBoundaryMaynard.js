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

export const freeBoundaryRational = (numerator, denominator = 1n) => {
  let n = BigInt(numerator)
  let d = BigInt(denominator)
  if (d === 0n) throw new Error('A rational denominator cannot be zero')
  if (d < 0n) {
    n = -n
    d = -d
  }
  if (n === 0n) return { numerator: 0n, denominator: 1n }
  const divisor = gcdBigInt(n, d)
  return { numerator: n / divisor, denominator: d / divisor }
}

const asRational = (value) => {
  if (typeof value === 'object' && value !== null && 'numerator' in value) {
    return freeBoundaryRational(value.numerator, value.denominator ?? 1n)
  }
  return freeBoundaryRational(value)
}

const add = (left, right) => freeBoundaryRational(
  left.numerator * right.denominator + right.numerator * left.denominator,
  left.denominator * right.denominator,
)

const subtract = (left, right) => freeBoundaryRational(
  left.numerator * right.denominator - right.numerator * left.denominator,
  left.denominator * right.denominator,
)

const multiply = (left, right) => freeBoundaryRational(
  left.numerator * right.numerator,
  left.denominator * right.denominator,
)

const divide = (left, right) => freeBoundaryRational(
  left.numerator * right.denominator,
  left.denominator * right.numerator,
)

const rationalPower = (value, exponent) => {
  let result = freeBoundaryRational(1n)
  let base = value
  let power = exponent
  while (power > 0) {
    if (power % 2 === 1) result = multiply(result, base)
    base = multiply(base, base)
    power = Math.floor(power / 2)
  }
  return result
}

const binomial = (n, r) => {
  if (r < 0 || r > n) return 0n
  const width = Math.min(r, n - r)
  let result = 1n
  for (let index = 1; index <= width; index += 1) {
    result = (result * BigInt(n - width + index)) / BigInt(index)
  }
  return result
}

export const freeBoundaryRationalToNumber = (value) => (
  Number(value.numerator) / Number(value.denominator)
)

export const exactFreeBoundaryQuadraticForm = (matrix, coefficients) => {
  const exactCoefficients = coefficients.map(asRational)
  let total = freeBoundaryRational(0n)
  for (let row = 0; row < exactCoefficients.length; row += 1) {
    for (let column = 0; column < exactCoefficients.length; column += 1) {
      total = add(total, multiply(
        multiply(exactCoefficients[row], asRational(matrix[row][column])),
        exactCoefficients[column],
      ))
    }
  }
  return total
}

export const exactFreeBoundaryRayleighQuotient = (gram, coefficients) => {
  const numeratorForm = exactFreeBoundaryQuadraticForm(gram.A, coefficients)
  const denominatorForm = exactFreeBoundaryQuadraticForm(gram.I, coefficients)
  const quotient = divide(numeratorForm, denominatorForm)
  return { ...quotient, value: freeBoundaryRationalToNumber(quotient) }
}

/** Certify A/I < bound on a two-dimensional space by Sylvester's criterion. */
export const certifyFreeBoundaryUpperBound2x = (gram, bound) => {
  const c = asRational(bound)
  const shifted = Array.from({ length: 2 }, (_, row) => Array.from(
    { length: 2 },
    (_, column) => subtract(
      multiply(c, asRational(gram.I[row][column])),
      asRational(gram.A[row][column]),
    ),
  ))
  const determinant = subtract(
    multiply(shifted[0][0], shifted[1][1]),
    multiply(shifted[0][1], shifted[1][0]),
  )
  return {
    bound: c,
    firstMinor: shifted[0][0],
    determinant,
    certified: shifted[0][0].numerator > 0n && determinant.numerator > 0n,
  }
}

const factorial = (value) => {
  let result = 1n
  for (let factor = 2n; factor <= BigInt(value); factor += 1n) result *= factor
  return result
}

const inactiveChamberExpansion = (k, signature) => {
  let states = new Map([['0:0', 1n]])
  for (const exponent of signature) {
    const exponentFactorial = factorial(exponent)
    const next = new Map()
    for (const [key, coefficient] of states) {
      const [selected, lostDegree] = key.split(':').map(Number)
      const retainedKey = `${selected}:${lostDegree}`
      next.set(retainedKey, (next.get(retainedKey) ?? 0n) + coefficient * exponentFactorial)
      for (let loss = 0; loss <= exponent; loss += 1) {
        const shiftedKey = `${selected + 1}:${lostDegree + loss}`
        next.set(
          shiftedKey,
          (next.get(shiftedKey) ?? 0n) + coefficient * (exponentFactorial / factorial(loss)),
        )
      }
    }
    states = next
  }

  const zeroCoordinates = k - signature.length
  const expanded = new Map()
  for (const [key, coefficient] of states) {
    const [selected, lostDegree] = key.split(':').map(Number)
    for (let selectedZeros = 0; selectedZeros <= zeroCoordinates; selectedZeros += 1) {
      const expandedKey = `${selected + selectedZeros}:${lostDegree}`
      expanded.set(
        expandedKey,
        (expanded.get(expandedKey) ?? 0n) + coefficient * binomial(zeroCoordinates, selectedZeros),
      )
    }
  }
  return expanded
}

const integrateInactiveKernel = ({
  b,
  height,
  lower,
  upper,
  selected,
  lostDegree,
  residualPower,
  radialPower,
}) => {
  let total = freeBoundaryRational(0n)
  const slope = BigInt(-(selected - 1))
  for (let residualTerm = 0; residualTerm <= residualPower; residualTerm += 1) {
    const residualCoefficient = freeBoundaryRational(
      binomial(residualPower, residualTerm) * (slope ** BigInt(residualTerm)),
    )
    const residualConstant = rationalPower(b, residualPower - residualTerm)
    for (let radialTerm = 0; radialTerm <= radialPower; radialTerm += 1) {
      const radialCoefficient = freeBoundaryRational(
        binomial(radialPower, radialTerm) * ((-1n) ** BigInt(radialTerm)),
      )
      const radialConstant = rationalPower(height, radialPower - radialTerm)
      const exponent = lostDegree + residualTerm + radialTerm + 1
      const endpointDifference = subtract(
        rationalPower(upper, exponent),
        rationalPower(lower, exponent),
      )
      total = add(total, divide(
        multiply(
          multiply(residualCoefficient, residualConstant),
          multiply(radialCoefficient, multiply(radialConstant, endpointDifference)),
        ),
        freeBoundaryRational(exponent),
      ))
    }
  }
  return total
}

const monomialSymmetricMultiplicity = (k, signature) => {
  const multiplicities = new Map()
  for (const exponent of signature) {
    multiplicities.set(exponent, (multiplicities.get(exponent) ?? 0) + 1)
  }
  let result = factorial(k) / factorial(k - signature.length)
  for (const count of multiplicities.values()) result /= factorial(count)
  return result
}

const signatureMultiplicityMap = (signature) => {
  const counts = new Map()
  for (const exponent of signature) counts.set(exponent, (counts.get(exponent) ?? 0) + 1)
  return counts
}

const canonicalSignature = (signature) => [...signature].sort((left, right) => right - left)

/** Sparse structure constants for P_alpha P_beta in the monomial basis. */
export const multiplyMaynardMonomialSymmetric = (k, alpha, beta) => {
  const left = canonicalSignature(alpha)
  const right = canonicalSignature(beta)
  if (left.length > k || right.length > k) throw new Error('Signature length exceeds k')
  const leftCounts = [...signatureMultiplicityMap(left).entries()]
  const rightValues = [...signatureMultiplicityMap(right).keys()].sort((a, b) => b - a)
  const rightInitial = signatureMultiplicityMap(right)
  const fixedCounts = new Map()

  const visitLeftType = (typeIndex, rightRemaining, accumulatedParts, placementCount) => {
    if (typeIndex === leftCounts.length) {
      const leftoverParts = []
      let leftoverLength = 0
      let leftoverDenominator = 1n
      for (const value of rightValues) {
        const count = rightRemaining.get(value) ?? 0
        leftoverLength += count
        leftoverDenominator *= factorial(count)
        for (let index = 0; index < count; index += 1) leftoverParts.push(value)
      }
      const zeroCoordinates = k - left.length
      if (leftoverLength > zeroCoordinates) return
      const zeroPlacementCount = factorial(zeroCoordinates)
        / (factorial(zeroCoordinates - leftoverLength) * leftoverDenominator)
      const signature = canonicalSignature([...accumulatedParts, ...leftoverParts])
      const key = signature.join(',')
      fixedCounts.set(key, (fixedCounts.get(key) ?? 0n) + placementCount * zeroPlacementCount)
      return
    }

    const [leftValue, leftMultiplicity] = leftCounts[typeIndex]
    const allocations = Array(rightValues.length).fill(0)
    const allocateRightTypes = (rightIndex, used) => {
      if (rightIndex === rightValues.length) {
        const remainingLeft = leftMultiplicity - used
        let rowPlacements = factorial(leftMultiplicity) / factorial(remainingLeft)
        const parts = Array.from({ length: remainingLeft }, () => leftValue)
        const nextRemaining = new Map(rightRemaining)
        for (let index = 0; index < rightValues.length; index += 1) {
          const count = allocations[index]
          rowPlacements /= factorial(count)
          const rightValue = rightValues[index]
          nextRemaining.set(rightValue, nextRemaining.get(rightValue) - count)
          for (let copy = 0; copy < count; copy += 1) parts.push(leftValue + rightValue)
        }
        visitLeftType(
          typeIndex + 1,
          nextRemaining,
          [...accumulatedParts, ...parts],
          placementCount * rowPlacements,
        )
        return
      }
      const rightValue = rightValues[rightIndex]
      const maximum = Math.min(rightRemaining.get(rightValue) ?? 0, leftMultiplicity - used)
      for (let count = 0; count <= maximum; count += 1) {
        allocations[rightIndex] = count
        allocateRightTypes(rightIndex + 1, used + count)
      }
    }
    allocateRightTypes(0, 0)
  }

  visitLeftType(0, rightInitial, [], 1n)
  const leftMultiplicity = monomialSymmetricMultiplicity(k, left)
  const result = new Map()
  for (const [key, fixedCount] of fixedCounts) {
    const signature = key === '' ? [] : key.split(',').map(Number)
    const orbitSize = monomialSymmetricMultiplicity(k, signature)
    const numerator = leftMultiplicity * fixedCount
    if (numerator % orbitSize !== 0n) {
      throw new Error(`Non-integral monomial structure constant for ${key}`)
    }
    result.set(key, numerator / orbitSize)
  }
  return result
}

/**
 * Exact integral of (1+epsilon-S)^radialPower P_signature over the chamber
 * S-t_i > 1-epsilon for every i inside S <= 1+epsilon.
 *
 * P_signature is the monomial symmetric polynomial used by Polymath8b.  The
 * calculation groups inclusion-exclusion terms by selected-coordinate count
 * and lost monomial degree.  It never enumerates the 2^k labelled subsets.
 */
export const integrateMaynardInactiveChamberSignature = ({
  k,
  epsilon,
  radialPower = 0,
  signature = [],
  kernelCache,
}) => {
  if (!Number.isInteger(k) || k < 2) throw new Error('Expected k >= 2')
  if (!Number.isInteger(radialPower) || radialPower < 0) {
    throw new Error('Expected a non-negative radial power')
  }
  if (!Array.isArray(signature)
    || signature.length > k
    || signature.some((value) => !Number.isInteger(value) || value < 1)) {
    throw new Error('Expected a positive-integer signature of length at most k')
  }
  const eps = asRational(epsilon)
  if (eps.numerator <= 0n || freeBoundaryRationalToNumber(eps) >= 1) {
    throw new Error('Expected 0 < epsilon < 1')
  }
  const one = freeBoundaryRational(1n)
  const b = subtract(one, eps)
  const height = multiply(freeBoundaryRational(2n), eps)
  const lower = divide(b, freeBoundaryRational(k - 1))
  if (subtract(height, lower).numerator <= 0n) return freeBoundaryRational(0n)

  const degree = signature.reduce((total, exponent) => total + exponent, 0)
  const expansion = inactiveChamberExpansion(k, signature)
  let labelledIntegral = freeBoundaryRational(0n)
  for (const [key, integerCoefficient] of expansion) {
    const [selected, lostDegree] = key.split(':').map(Number)
    let upper = height
    if (selected >= 2) {
      const root = divide(b, freeBoundaryRational(selected - 1))
      if (subtract(root, upper).numerator < 0n) upper = root
    }
    if (subtract(upper, lower).numerator <= 0n) continue

    const residualPower = k + degree - lostDegree - 1
    const kernelKey = `${k}|${eps.numerator}/${eps.denominator}|${radialPower}|${degree}|${selected}|${lostDegree}`
    let kernel = kernelCache?.get(kernelKey)
    if (!kernel) {
      kernel = integrateInactiveKernel({
        b,
        height,
        lower,
        upper,
        selected,
        lostDegree,
        residualPower,
        radialPower,
      })
      kernelCache?.set(kernelKey, kernel)
    }
    const signedCoefficient = selected % 2 === 0 ? integerCoefficient : -integerCoefficient
    labelledIntegral = add(labelledIntegral, multiply(
      freeBoundaryRational(signedCoefficient, factorial(residualPower)),
      kernel,
    ))
  }

  return multiply(
    freeBoundaryRational(monomialSymmetricMultiplicity(k, signature)),
    labelledIntegral,
  )
}

/** Exact Dirichlet-simplex companion moment for calibration and mass ratios. */
export const integrateMaynardSimplexSignature = ({
  k,
  limit,
  radialPower = 0,
  signature = [],
}) => {
  const edge = asRational(limit)
  const degree = signature.reduce((total, exponent) => total + exponent, 0)
  let numerator = factorial(radialPower)
  for (const exponent of signature) numerator *= factorial(exponent)
  numerator *= monomialSymmetricMultiplicity(k, signature)
  return multiply(
    freeBoundaryRational(numerator, factorial(k + degree + radialPower)),
    rationalPower(edge, k + degree + radialPower),
  )
}

/**
 * Contract a sparse rational coefficient vector against the exact chamber
 * correction.  Terms use {radialPower, signature, coefficient}.
 */
export const evaluateMaynardInactiveChamberQuadratic = ({
  k,
  epsilon,
  terms,
  momentCache = new Map(),
  productCache = new Map(),
  kernelCache = new Map(),
}) => {
  const normalized = terms
    .map((term) => ({
      radialPower: term.radialPower ?? term.a ?? 0,
      signature: canonicalSignature(term.signature ?? []),
      coefficient: asRational(term.coefficient ?? 0n),
    }))
    .filter((term) => term.coefficient.numerator !== 0n)
  const square = new Map()

  for (let leftIndex = 0; leftIndex < normalized.length; leftIndex += 1) {
    const left = normalized[leftIndex]
    for (let rightIndex = leftIndex; rightIndex < normalized.length; rightIndex += 1) {
      const right = normalized[rightIndex]
      const productKey = `${left.signature.join(',')}|${right.signature.join(',')}`
      let product = productCache.get(productKey)
      if (!product) {
        product = multiplyMaynardMonomialSymmetric(k, left.signature, right.signature)
        productCache.set(productKey, product)
      }
      let scalar = multiply(left.coefficient, right.coefficient)
      if (leftIndex !== rightIndex) scalar = multiply(freeBoundaryRational(2n), scalar)
      const radialPower = left.radialPower + right.radialPower
      for (const [signatureKey, structureConstant] of product) {
        const squareKey = `${radialPower}|${signatureKey}`
        square.set(squareKey, add(
          square.get(squareKey) ?? freeBoundaryRational(0n),
          multiply(scalar, freeBoundaryRational(structureConstant)),
        ))
      }
    }
  }

  let correction = freeBoundaryRational(0n)
  let evaluatedMoments = 0
  for (const [key, coefficient] of square) {
    if (coefficient.numerator === 0n) continue
    const [radialText, signatureText] = key.split('|')
    let moment = momentCache.get(key)
    if (!moment) {
      moment = integrateMaynardInactiveChamberSignature({
        k,
        epsilon,
        radialPower: Number(radialText),
        signature: signatureText === '' ? [] : signatureText.split(',').map(Number),
        kernelCache,
      })
      momentCache.set(key, moment)
      evaluatedMoments += 1
    }
    correction = add(correction, multiply(coefficient, moment))
  }
  return {
    correction,
    square,
    squareTermCount: [...square.values()].filter((value) => value.numerator !== 0n).length,
    evaluatedMoments,
    momentCache,
    productCache,
    kernelCache,
  }
}

export const buildMaynardInactiveChamberCorrectionMatrix = ({
  k,
  epsilon,
  basis,
  globalI,
  momentCache = new Map(),
  productCache = new Map(),
  kernelCache = new Map(),
}) => {
  const normalized = basis.map((term) => ({
    radialPower: term.radialPower ?? term.slackPower ?? term.a ?? 0,
    signature: canonicalSignature(term.signature ?? []),
  }))
  const size = normalized.length
  const exactCorrection = Array.from({ length: size }, () => Array(size))
  const exactCorrectedI = globalI ? Array.from({ length: size }, () => Array(size)) : undefined

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      const left = normalized[row]
      const right = normalized[column]
      const productKey = `${left.signature.join(',')}|${right.signature.join(',')}`
      let product = productCache.get(productKey)
      if (!product) {
        product = multiplyMaynardMonomialSymmetric(k, left.signature, right.signature)
        productCache.set(productKey, product)
      }
      const radialPower = left.radialPower + right.radialPower
      let entry = freeBoundaryRational(0n)
      for (const [signatureKey, structureConstant] of product) {
        const momentKey = `${radialPower}|${signatureKey}`
        let moment = momentCache.get(momentKey)
        if (!moment) {
          moment = integrateMaynardInactiveChamberSignature({
            k,
            epsilon,
            radialPower,
            signature: signatureKey === '' ? [] : signatureKey.split(',').map(Number),
            kernelCache,
          })
          momentCache.set(momentKey, moment)
        }
        entry = add(entry, multiply(freeBoundaryRational(structureConstant), moment))
      }
      exactCorrection[row][column] = entry
      exactCorrection[column][row] = entry
      if (exactCorrectedI) {
        const corrected = subtract(asRational(globalI[row][column]), entry)
        exactCorrectedI[row][column] = corrected
        exactCorrectedI[column][row] = corrected
      }
    }
  }
  const numeric = (matrix) => matrix.map((row) => row.map(freeBoundaryRationalToNumber))
  return {
    basis: normalized,
    exactCorrection,
    correction: numeric(exactCorrection),
    exactCorrectedI,
    correctedI: exactCorrectedI ? numeric(exactCorrectedI) : undefined,
    momentCount: momentCache.size,
    productCount: productCache.size,
    kernelCount: kernelCache.size,
    momentCache,
    productCache,
    kernelCache,
  }
}

const integrateRadialMarginalProduct = (k, b, limit, leftPower, rightPower) => {
  const marginalPower = leftPower + rightPower + 2
  const polynomial = Array.from({ length: marginalPower + 1 }, (_, power) => (
    multiply(
      freeBoundaryRational(binomial(marginalPower, power) * ((-1n) ** BigInt(power))),
      rationalPower(limit, marginalPower - power),
    )
  ))
  const weighted = Array.from(
    { length: k - 2 },
    () => freeBoundaryRational(0n),
  ).concat(polynomial)
  return divide(
    integratePolynomial(weighted, b),
    freeBoundaryRational(
      factorial(k - 2) * BigInt(leftPower + 1) * BigInt(rightPower + 1),
    ),
  )
}

/** Exact enlarged-simplex Gram matrices on span{(L-S)^a: 0<=a<=degree}. */
export const buildMaynardEnlargedRadialGram = ({
  k,
  epsilon,
  degree,
  truncateInactive = false,
}) => {
  const eps = asRational(epsilon)
  const one = freeBoundaryRational(1n)
  const b = subtract(one, eps)
  const limit = add(one, eps)
  const size = degree + 1
  const iExact = Array.from({ length: size }, () => Array(size))
  const aExact = Array.from({ length: size }, () => Array(size))
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      let iEntry = integrateMaynardSimplexSignature({
        k,
        limit,
        radialPower: row + column,
      })
      if (truncateInactive) {
        iEntry = subtract(iEntry, integrateMaynardInactiveChamberSignature({
          k,
          epsilon: eps,
          radialPower: row + column,
        }))
      }
      const aEntry = multiply(
        freeBoundaryRational(k),
        integrateRadialMarginalProduct(k, b, limit, row, column),
      )
      iExact[row][column] = iEntry
      iExact[column][row] = iEntry
      aExact[row][column] = aEntry
      aExact[column][row] = aEntry
    }
  }
  const numeric = (matrix) => matrix.map((row) => row.map(freeBoundaryRationalToNumber))
  const basis = Array.from({ length: size }, (_, radialPower) => ({ radialPower, signature: [] }))
  return {
    k,
    epsilon: eps,
    degree,
    basis,
    monomials: basis,
    exact: { I: iExact, A: aExact },
    I: numeric(iExact),
    A: numeric(aExact),
  }
}

/**
 * Small exact pilot: quotient of the constant function before and after the
 * all-marginals-inactive chamber is removed.
 */
export const buildMaynardInactiveChamberConstantPilot = (k, epsilon) => {
  const eps = asRational(epsilon)
  const one = freeBoundaryRational(1n)
  const b = subtract(one, eps)
  const limit = add(one, eps)
  const chamberI = integrateMaynardInactiveChamberSignature({ k, epsilon: eps })
  const globalI = integrateMaynardSimplexSignature({ k, limit })
  const truncatedI = subtract(globalI, chamberI)

  // For F=1, one marginal is
  // 1/(k-2)! integral_0^b (limit-T)^2 T^(k-2) dT.
  const oneMarginal = divide(sumRationals([
    divide(
      multiply(rationalPower(limit, 2), rationalPower(b, k - 1)),
      freeBoundaryRational(k - 1),
    ),
    multiply(freeBoundaryRational(-2n), divide(
      multiply(limit, rationalPower(b, k)),
      freeBoundaryRational(k),
    )),
    divide(rationalPower(b, k + 1), freeBoundaryRational(k + 1)),
  ]), freeBoundaryRational(factorial(k - 2)))
  const numeratorForm = multiply(freeBoundaryRational(k), oneMarginal)
  return {
    k,
    epsilon: eps,
    globalI,
    chamberI,
    chamberMassRatio: divide(chamberI, globalI),
    truncatedI,
    numeratorForm,
    globalQuotient: divide(numeratorForm, globalI),
    truncatedQuotient: divide(numeratorForm, truncatedI),
  }
}

const polynomialKey = (uPower, vPower) => `${uPower}:${vPower}`

const addPolynomialTerm = (polynomial, uPower, vPower, coefficient) => {
  const key = polynomialKey(uPower, vPower)
  polynomial.set(key, add(polynomial.get(key) ?? freeBoundaryRational(0n), coefficient))
}

const multiplyPolynomials = (left, right) => {
  const product = new Map()
  for (const [leftKey, leftCoefficient] of left) {
    const [leftU, leftV] = leftKey.split(':').map(Number)
    for (const [rightKey, rightCoefficient] of right) {
      const [rightU, rightV] = rightKey.split(':').map(Number)
      addPolynomialTerm(
        product,
        leftU + rightU,
        leftV + rightV,
        multiply(leftCoefficient, rightCoefficient),
      )
    }
  }
  return product
}

const polynomialPower = (polynomial, exponent) => {
  let result = new Map([[polynomialKey(0, 0), freeBoundaryRational(1n)]])
  for (let power = 0; power < exponent; power += 1) {
    result = multiplyPolynomials(result, polynomial)
  }
  return result
}

const affinePolynomial = (constant, uCoefficient, vCoefficient) => new Map([
  [polynomialKey(0, 0), constant],
  [polynomialKey(1, 0), uCoefficient],
  [polynomialKey(0, 1), vCoefficient],
])

/**
 * Integrate x^xPower y^yPower exactly over a triangle with rational vertices.
 *
 * The affine map from the standard triangle has a rational Jacobian.  After
 * expansion, each term uses
 *   integral_{u,v >= 0, u+v <= 1} u^a v^b du dv = a! b! / (a+b+2)!.
 */
export const integrateRationalTriangleMonomial = (vertices, xPower, yPower) => {
  if (!Array.isArray(vertices) || vertices.length !== 3) {
    throw new Error('Expected exactly three triangle vertices')
  }
  if (!Number.isInteger(xPower) || xPower < 0 || !Number.isInteger(yPower) || yPower < 0) {
    throw new Error('Monomial powers must be non-negative integers')
  }

  const points = vertices.map(([x, y]) => [asRational(x), asRational(y)])
  const [origin, uVertex, vVertex] = points
  const ux = subtract(uVertex[0], origin[0])
  const uy = subtract(uVertex[1], origin[1])
  const vx = subtract(vVertex[0], origin[0])
  const vy = subtract(vVertex[1], origin[1])
  let jacobian = subtract(multiply(ux, vy), multiply(vx, uy))
  if (jacobian.numerator < 0n) jacobian = freeBoundaryRational(-jacobian.numerator, jacobian.denominator)

  const xPolynomial = affinePolynomial(origin[0], ux, vx)
  const yPolynomial = affinePolynomial(origin[1], uy, vy)
  const integrand = multiplyPolynomials(
    polynomialPower(xPolynomial, xPower),
    polynomialPower(yPolynomial, yPower),
  )

  let integral = freeBoundaryRational(0n)
  for (const [key, coefficient] of integrand) {
    const [uPower, vPower] = key.split(':').map(Number)
    const standardMoment = freeBoundaryRational(
      factorial(uPower) * factorial(vPower),
      factorial(uPower + vPower + 2),
    )
    integral = add(integral, multiply(coefficient, standardMoment))
  }
  return multiply(jacobian, integral)
}

const integratePolynomial = (coefficients, upperLimit) => {
  let result = freeBoundaryRational(0n)
  let limitPower = freeBoundaryRational(1n)
  for (let power = 0; power < coefficients.length; power += 1) {
    limitPower = multiply(limitPower, upperLimit)
    result = add(result, divide(
      multiply(coefficients[power], limitPower),
      freeBoundaryRational(power + 1),
    ))
  }
  return result
}

const multiplyUnivariate = (left, right) => {
  const result = Array.from(
    { length: left.length + right.length - 1 },
    () => freeBoundaryRational(0n),
  )
  for (let leftPower = 0; leftPower < left.length; leftPower += 1) {
    for (let rightPower = 0; rightPower < right.length; rightPower += 1) {
      result[leftPower + rightPower] = add(
        result[leftPower + rightPower],
        multiply(left[leftPower], right[rightPower]),
      )
    }
  }
  return result
}

const triangleMoment = (vertices, xPower, yPower) => (
  integrateRationalTriangleMonomial(vertices, xPower, yPower)
)

const sumRationals = (values) => values.reduce(
  (total, value) => add(total, value),
  freeBoundaryRational(0n),
)

/**
 * Exact k=2, epsilon=1/2 survival cell.
 *
 * The base space is span{1, x+y} on x+y <= 3/2.  The enriched space adds the
 * indicator of the inactive cap x,y >= 1/2.  That cap lies beyond both
 * J-integration cutoffs, so it changes I but has a zero row in A=sum_i J_i.
 */
export const buildK2HalfFreeBoundaryAudit = () => {
  const half = freeBoundaryRational(1n, 2n)
  const threeHalves = freeBoundaryRational(3n, 2n)
  const support = [
    [freeBoundaryRational(0n), freeBoundaryRational(0n)],
    [threeHalves, freeBoundaryRational(0n)],
    [freeBoundaryRational(0n), threeHalves],
  ]
  const inactiveCap = [
    [half, half],
    [freeBoundaryRational(1n), half],
    [half, freeBoundaryRational(1n)],
  ]

  const supportMoments = {
    one: triangleMoment(support, 0, 0),
    x: triangleMoment(support, 1, 0),
    y: triangleMoment(support, 0, 1),
    xx: triangleMoment(support, 2, 0),
    xy: triangleMoment(support, 1, 1),
    yy: triangleMoment(support, 0, 2),
  }
  const capMoments = {
    one: triangleMoment(inactiveCap, 0, 0),
    x: triangleMoment(inactiveCap, 1, 0),
    y: triangleMoment(inactiveCap, 0, 1),
  }

  const zero = freeBoundaryRational(0n)
  const iExact = [
    [supportMoments.one, sumRationals([supportMoments.x, supportMoments.y]), capMoments.one],
    [
      sumRationals([supportMoments.x, supportMoments.y]),
      sumRationals([
        supportMoments.xx,
        multiply(freeBoundaryRational(2n), supportMoments.xy),
        supportMoments.yy,
      ]),
      sumRationals([capMoments.x, capMoments.y]),
    ],
    [capMoments.one, sumRationals([capMoments.x, capMoments.y]), capMoments.one],
  ]

  // For y <= 1/2, the x-marginals of 1 and x+y on x+y <= 3/2 are
  // g_0(y)=3/2-y and g_1(y)=((3/2)^2-y^2)/2.  Symmetry doubles J_1.
  const g0 = [threeHalves, freeBoundaryRational(-1n)]
  const g1 = [freeBoundaryRational(9n, 8n), zero, freeBoundaryRational(-1n, 2n)]
  const marginals = [g0, g1]
  const aExact = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => zero))
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 2; column += 1) {
      aExact[row][column] = multiply(
        freeBoundaryRational(2n),
        integratePolynomial(multiplyUnivariate(marginals[row], marginals[column]), half),
      )
    }
  }

  const numericMatrix = (matrix) => matrix.map((row) => row.map(freeBoundaryRationalToNumber))
  return {
    k: 2,
    epsilon: half,
    basis: ['1', 'x+y', 'inactive-cap-indicator'],
    support,
    inactiveCap,
    exact: { I: iExact, A: aExact },
    I: numericMatrix(iExact),
    A: numericMatrix(aExact),
  }
}

const countEvenSignatures = (total, maximumPart, maximumLength, cache) => {
  if (total === 0) return 1
  if (total < 0 || maximumPart < 2 || maximumLength === 0) return 0
  const evenMaximum = maximumPart - (maximumPart % 2)
  const key = `${total}:${evenMaximum}:${maximumLength}`
  if (cache.has(key)) return cache.get(key)
  let count = 0
  for (let part = Math.min(total - (total % 2), evenMaximum); part >= 2; part -= 2) {
    count += countEvenSignatures(total - part, part, maximumLength - 1, cache)
  }
  cache.set(key, count)
  return count
}

/**
 * Scaling of the first mesh induced by the k marginal-cut hyperplanes.
 * Sign cells are permutation-equivalent by the number of exceeded cuts, so
 * their orbits can be enumerated without visiting all 2^k labelled cells.
 */
export const estimateFreeBoundaryMaynardScaling = (k, degree) => {
  if (!Number.isInteger(k) || k < 1 || !Number.isInteger(degree) || degree < 0) {
    throw new Error('Expected positive k and non-negative degree')
  }
  const cache = new Map()
  let polynomialDimension = 0
  let signatureCount = 0
  for (let total = 0; total <= degree; total += 2) {
    const count = countEvenSignatures(total, total, k, cache)
    signatureCount += count
    polynomialDimension += count * (degree - total + 1)
  }
  const signCellOrbitUpperBound = k + 1
  const naiveOrbitLocalDimension = polynomialDimension * signCellOrbitUpperBound
  return {
    k,
    degree,
    labelledSignCellUpperBound: 2n ** BigInt(k),
    signCellOrbitUpperBound,
    signatureCount,
    polynomialDimension,
    naiveOrbitLocalDimension,
    denseBytesPerNumericMatrix: 8n * BigInt(naiveOrbitLocalDimension) ** 2n,
  }
}
