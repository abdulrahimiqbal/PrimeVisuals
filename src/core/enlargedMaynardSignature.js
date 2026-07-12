const gcd = (left, right) => {
  let a = left < 0n ? -left : left
  let b = right < 0n ? -right : right
  while (b !== 0n) [a, b] = [b, a % b]
  return a
}

export const enlargedRational = (numerator, denominator = 1n) => {
  let n = BigInt(numerator)
  let d = BigInt(denominator)
  if (d === 0n) throw new Error('A rational denominator cannot be zero')
  if (d < 0n) {
    n = -n
    d = -d
  }
  if (n === 0n) return { numerator: 0n, denominator: 1n }
  const divisor = gcd(n, d)
  return { numerator: n / divisor, denominator: d / divisor }
}

const add = (left, right) => enlargedRational(
  left.numerator * right.denominator + right.numerator * left.denominator,
  left.denominator * right.denominator,
)

const multiply = (left, right) => enlargedRational(
  left.numerator * right.numerator,
  left.denominator * right.denominator,
)

const power = (value, exponent) => {
  if (!Number.isInteger(exponent) || exponent < 0) throw new Error('Expected a non-negative power')
  let base = value
  let result = enlargedRational(1n)
  let remaining = exponent
  while (remaining > 0) {
    if (remaining % 2) result = multiply(result, base)
    base = multiply(base, base)
    remaining = Math.floor(remaining / 2)
  }
  return result
}

const factorialTable = (limit) => {
  const values = Array(limit + 1).fill(1n)
  for (let n = 2; n <= limit; n += 1) values[n] = values[n - 1] * BigInt(n)
  return values
}

const binomial = (n, r) => {
  if (r < 0 || r > n) return 0n
  const width = Math.min(r, n - r)
  let result = 1n
  for (let j = 1; j <= width; j += 1) {
    result = result * BigInt(n - width + j) / BigInt(j)
  }
  return result
}

const signatureDegree = (signature) => signature.reduce((sum, part) => sum + part, 0)
const signatureKey = (signature) => signature.join(',')

const validateSignature = (signature, k) => {
  if (!Array.isArray(signature) || signature.length > k) throw new Error('Invalid signature length')
  for (let index = 0; index < signature.length; index += 1) {
    const part = signature[index]
    if (!Number.isInteger(part) || part < 1) throw new Error('Signature parts must be positive integers')
    if (index && part > signature[index - 1]) throw new Error('Signature must be non-increasing')
  }
}

const orbitSize = (signature, k, factorial) => {
  const multiplicities = new Map([[0, k - signature.length]])
  for (const exponent of signature) {
    multiplicities.set(exponent, (multiplicities.get(exponent) ?? 0) + 1)
  }
  let denominator = 1n
  for (const count of multiplicities.values()) denominator *= factorial[count]
  return factorial[k] / denominator
}

/**
 * W_k(alpha,beta) in
 *   integral (C-S)^r P_alpha P_beta
 *     = C^(k+|alpha|+|beta|+r) r! W_k/(k+|alpha|+|beta|+r)!.
 *
 * One alpha orbit representative is fixed.  A memoized multiset DP assigns
 * the beta exponents to its k labelled coordinates, avoiding a product table.
 */
export const signatureProductFactorialWeight = (k, alpha, beta) => {
  if (!Number.isInteger(k) || k < 1) throw new Error('k must be a positive integer')
  validateSignature(alpha, k)
  validateSignature(beta, k)
  const maximumExponent = (alpha[0] ?? 0) + (beta[0] ?? 0)
  const factorial = factorialTable(Math.max(k, maximumExponent))
  const alphaPadded = [...alpha, ...Array(k - alpha.length).fill(0)]
  const groups = []
  const betaCounts = new Map([[0, k - beta.length]])
  for (const exponent of beta) betaCounts.set(exponent, (betaCounts.get(exponent) ?? 0) + 1)
  for (const [exponent, count] of betaCounts) groups.push({ exponent, count })
  groups.sort((left, right) => right.exponent - left.exponent)
  const initialCounts = groups.map((group) => group.count)
  const memo = new Map()
  const visit = (coordinate, counts) => {
    if (coordinate === k) return 1n
    const key = `${coordinate}|${counts.join(',')}`
    if (memo.has(key)) return memo.get(key)
    let total = 0n
    for (let group = 0; group < groups.length; group += 1) {
      if (counts[group] === 0) continue
      counts[group] -= 1
      total += factorial[alphaPadded[coordinate] + groups[group].exponent]
        * visit(coordinate + 1, counts)
      counts[group] += 1
    }
    memo.set(key, total)
    return total
  }
  return orbitSize(alpha, k, factorial) * visit(0, initialCounts)
}

const enumerateEvenPartitions = (maximumDegree, maximumLength) => {
  const signatures = [[]]
  const current = []
  const visit = (remaining, maximumPart) => {
    for (let part = Math.min(remaining - (remaining % 2), maximumPart); part >= 2; part -= 2) {
      current.push(part)
      signatures.push([...current])
      if (current.length < maximumLength) visit(remaining - part, part)
      current.pop()
    }
  }
  visit(maximumDegree, maximumDegree - (maximumDegree % 2))
  signatures.sort((left, right) => (
    signatureDegree(left) - signatureDegree(right)
      || left.length - right.length
      || signatureKey(left).localeCompare(signatureKey(right))
  ))
  return signatures
}

export const enumerateEnlargedEvenSignatureBasis = (k, maximumDegree) => {
  if (!Number.isInteger(k) || k < 2) throw new Error('k must be an integer at least 2')
  if (!Number.isInteger(maximumDegree) || maximumDegree < 0) {
    throw new Error('maximumDegree must be a non-negative integer')
  }
  const basis = []
  for (const signature of enumerateEvenPartitions(maximumDegree, k)) {
    const degree = signatureDegree(signature)
    for (let slackPower = 0; slackPower + degree <= maximumDegree; slackPower += 1) {
      basis.push({ slackPower, signature, degree: slackPower + degree })
    }
  }
  basis.sort((left, right) => (
    left.degree - right.degree
      || signatureDegree(left.signature) - signatureDegree(right.signature)
      || left.slackPower - right.slackPower
      || signatureKey(left.signature).localeCompare(signatureKey(right.signature))
  ))
  return basis
}

const removeOne = (signature, exponent) => {
  if (exponent === 0) return [...signature]
  const output = [...signature]
  output.splice(output.indexOf(exponent), 1)
  return output
}

const distinctMarginalExponents = (signature, k) => {
  const exponents = [...new Set(signature)]
  if (signature.length < k) exponents.push(0)
  return exponents.sort((left, right) => left - right)
}

const rationalToNumber = (value) => Number(value.numerator) / Number(value.denominator)

/**
 * Exact Polymath8b Section 7.2 matrices for the basis
 *   (1+epsilon-P_(1))^a P_alpha,
 * with alpha restricted to even signatures.
 */
export const buildEnlargedMaynardSignatureGramMatrices = (
  k,
  epsilonNumerator,
  epsilonDenominator,
  maximumDegree,
) => {
  const epsilon = enlargedRational(epsilonNumerator, epsilonDenominator)
  if (epsilon.numerator < 0n || epsilon.numerator >= epsilon.denominator) {
    throw new Error('epsilon must lie between zero (inclusive) and one')
  }
  const one = enlargedRational(1n)
  const supportScale = add(one, epsilon)
  const marginalScale = add(one, enlargedRational(-epsilon.numerator, epsilon.denominator))
  const twiceEpsilon = multiply(enlargedRational(2n), epsilon)
  const basis = enumerateEnlargedEvenSignatureBasis(k, maximumDegree)
  const factorial = factorialTable(k + 2 * maximumDegree + 4)
  const weightCache = new Map()
  const momentCache = new Map()

  const weight = (dimension, alpha, beta) => {
    const left = signatureKey(alpha)
    const right = signatureKey(beta)
    const ordered = left <= right ? `${dimension}|${left}|${right}` : `${dimension}|${right}|${left}`
    if (!weightCache.has(ordered)) {
      weightCache.set(ordered, signatureProductFactorialWeight(dimension, alpha, beta))
    }
    return weightCache.get(ordered)
  }

  const moment = (dimension, scale, slackPower, alpha, beta, scaleName) => {
    const left = signatureKey(alpha)
    const right = signatureKey(beta)
    const ordered = left <= right ? `${left}|${right}` : `${right}|${left}`
    const key = `${dimension}|${scaleName}|${slackPower}|${ordered}`
    if (momentCache.has(key)) return momentCache.get(key)
    const totalDegree = dimension + slackPower + signatureDegree(alpha) + signatureDegree(beta)
    const base = enlargedRational(
      factorial[slackPower] * weight(dimension, alpha, beta),
      factorial[totalDegree],
    )
    const value = multiply(base, power(scale, totalDegree))
    momentCache.set(key, value)
    return value
  }

  const marginalExpansion = (item) => {
    const output = []
    for (const exponent of distinctMarginalExponents(item.signature, k)) {
      const remaining = removeOne(item.signature, exponent)
      const resultingSlackPower = item.slackPower + exponent + 1
      const betaCoefficient = enlargedRational(
        factorial[item.slackPower] * factorial[exponent],
        factorial[resultingSlackPower],
      )
      for (let slackPower = 0; slackPower <= resultingSlackPower; slackPower += 1) {
        const coefficient = multiply(
          betaCoefficient,
          multiply(
            enlargedRational(binomial(resultingSlackPower, slackPower)),
            power(twiceEpsilon, resultingSlackPower - slackPower),
          ),
        )
        output.push({ slackPower, signature: remaining, coefficient })
      }
    }
    return output
  }

  const marginalExpansions = basis.map(marginalExpansion)
  const size = basis.length
  const exactI = Array.from({ length: size }, () => Array(size))
  const exactA = Array.from({ length: size }, () => Array(size))
  const I = Array.from({ length: size }, () => Array(size).fill(0))
  const A = Array.from({ length: size }, () => Array(size).fill(0))
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      const left = basis[row]
      const right = basis[column]
      const iEntry = moment(
        k,
        supportScale,
        left.slackPower + right.slackPower,
        left.signature,
        right.signature,
        'support',
      )
      let jEntry = enlargedRational(0n)
      for (const leftTerm of marginalExpansions[row]) {
        for (const rightTerm of marginalExpansions[column]) {
          jEntry = add(jEntry, multiply(
            multiply(leftTerm.coefficient, rightTerm.coefficient),
            moment(
              k - 1,
              marginalScale,
              leftTerm.slackPower + rightTerm.slackPower,
              leftTerm.signature,
              rightTerm.signature,
              'marginal',
            ),
          ))
        }
      }
      const aEntry = multiply(enlargedRational(BigInt(k)), jEntry)
      exactI[row][column] = iEntry
      exactI[column][row] = iEntry
      exactA[row][column] = aEntry
      exactA[column][row] = aEntry
      I[row][column] = rationalToNumber(iEntry)
      I[column][row] = I[row][column]
      A[row][column] = rationalToNumber(aEntry)
      A[column][row] = A[row][column]
    }
  }
  return {
    k,
    epsilon,
    maximumDegree,
    basis,
    monomials: basis,
    I,
    A,
    exactI,
    exactA,
    weightCacheSize: weightCache.size,
    momentCacheSize: momentCache.size,
  }
}
