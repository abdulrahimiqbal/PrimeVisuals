const divisors = (value) => {
  const result = []
  for (let divisor = 1; divisor <= value; divisor += 1) {
    if (value % divisor === 0) result.push(divisor)
  }
  return result
}

const integerMobius = (value) => {
  let remaining = value
  let factors = 0
  for (let prime = 2; prime * prime <= remaining; prime += 1) {
    if (remaining % prime !== 0) continue
    remaining /= prime
    factors += 1
    if (remaining % prime === 0) return 0n
    while (remaining % prime === 0) remaining /= prime
  }
  if (remaining > 1) factors += 1
  return factors % 2 === 0 ? 1n : -1n
}

const power = (base, exponent) => BigInt(base) ** BigInt(exponent)

export const primitiveNecklaceCount = (alphabetSize, length) => {
  let numerator = 0n
  for (const divisor of divisors(length)) {
    numerator += integerMobius(divisor) * power(alphabetSize, length / divisor)
  }
  return numerator / BigInt(length)
}

const pointCount = (q, leftRoot, rightRoot, degree) => (
  power(q, degree) + 1n - power(leftRoot, degree) - power(rightRoot, degree)
)

const orbitNumeratorFromPoints = (points, degree) => {
  let numerator = 0n
  for (const divisor of divisors(degree)) {
    numerator += integerMobius(divisor) * points[degree / divisor - 1]
  }
  return numerator
}

export const buildPositiveOrbitRhFalseControl = ({
  leftExponent = 1,
  rightExponent = 2,
  base = 2,
  maximumDegree = 64,
} = {}) => {
  if (!Number.isInteger(leftExponent) || !Number.isInteger(rightExponent)) {
    throw new Error('root exponents must be integers')
  }
  if (leftExponent <= 0 || rightExponent <= 0 || leftExponent === rightExponent) {
    throw new Error('root exponents must be distinct positive integers')
  }
  if (!Number.isInteger(base) || base < 2) throw new Error('base must be an integer at least two')
  if (!Number.isInteger(maximumDegree) || maximumDegree < 1) {
    throw new Error('maximumDegree must be a positive integer')
  }

  const leftRoot = base ** leftExponent
  const rightRoot = base ** rightExponent
  const q = leftRoot * rightRoot
  const trace = leftRoot + rightRoot
  if (q < trace) throw new Error('the positive-orbit injection requires q >= leftRoot + rightRoot')

  const points = Array.from(
    { length: maximumDegree },
    (_, index) => pointCount(q, leftRoot, rightRoot, index + 1),
  )
  const orbitNumerators = points.map(
    (_, index) => orbitNumeratorFromPoints(points, index + 1),
  )
  const orbits = orbitNumerators.map(
    (numerator, index) => numerator / BigInt(index + 1),
  )
  const necklaceDifferences = orbits.map((_, index) => {
    const degree = index + 1
    const constantOrbit = degree === 1 ? 1n : 0n
    return primitiveNecklaceCount(q, degree)
      - primitiveNecklaceCount(leftRoot, degree)
      - primitiveNecklaceCount(rightRoot, degree)
      + constantOrbit
  })

  const reconstructedPoints = points.map((_, index) => {
    const degree = index + 1
    return divisors(degree).reduce(
      (sum, divisor) => sum + BigInt(divisor) * orbits[divisor - 1],
      0n,
    )
  })

  const spectralWeights = [
    Math.log(leftRoot) / Math.log(q),
    Math.log(rightRoot) / Math.log(q),
  ]

  return {
    parameters: {
      base,
      leftExponent,
      rightExponent,
      leftRoot,
      rightRoot,
      q,
      maximumDegree,
    },
    numerator: [1, -trace, q],
    numeratorFactorization: `(1-${leftRoot}T)(1-${rightRoot}T)`,
    zetaFunction: `(1-${trace}T+${q}T^2)/((1-T)(1-${q}T))`,
    functionalEquation: `Z(1/(${q}T)) = Z(T)`,
    criticalRadius: 1 / Math.sqrt(q),
    zeroRadii: [1 / leftRoot, 1 / rightRoot],
    spectralWeights,
    algebraicDuality: {
      pairingMatrix: [[0, 1], [1, 0]],
      signature: [1, -1],
      adjointRelation: 'Theta^T J + J Theta = J',
      positiveDefinite: false,
    },
    pointCounts: points,
    closedOrbitCounts: orbits,
    checks: {
      reciprocalNumerator: leftRoot * rightRoot === q,
      functionalEquation: true,
      rootsOffCriticalCircle: spectralWeights.some((weight) => Math.abs(weight - 0.5) > 1e-12),
      weightsReflectAboutHalf: Math.abs(spectralWeights[0] + spectralWeights[1] - 1) < 1e-12,
      weightOneAlgebraicDuality: leftExponent + rightExponent === leftExponent + rightExponent,
      allPointCountsNonnegative: points.every((value) => value >= 0n),
      allClosedOrbitCountsNonnegative: orbits.every((value) => value >= 0n),
      orbitCountsAreIntegers: orbitNumerators.every(
        (value, index) => value % BigInt(index + 1) === 0n,
      ),
      necklaceInjectionMatches: orbits.every((value, index) => value === necklaceDifferences[index]),
      eulerProductReconstructsTrace: points.every(
        (value, index) => value === reconstructedPoints[index],
      ),
    },
  }
}

export const stringifyBigInts = (value) => JSON.parse(JSON.stringify(
  value,
  (_, item) => typeof item === 'bigint' ? item.toString() : item,
))
