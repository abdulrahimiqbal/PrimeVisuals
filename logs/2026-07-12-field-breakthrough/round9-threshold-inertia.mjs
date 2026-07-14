import { buildEnlargedMaynardSignatureGramMatrices } from '../../src/core/enlargedMaynardSignature.js'

const abs = (x) => (x < 0n ? -x : x)
const gcd = (a0, b0) => {
  let a = abs(a0)
  let b = abs(b0)
  while (b) [a, b] = [b, a % b]
  return a
}
const rational = (numerator, denominator = 1n) => {
  if (denominator < 0n) {
    numerator = -numerator
    denominator = -denominator
  }
  if (numerator === 0n) return { numerator: 0n, denominator: 1n }
  const divisor = gcd(numerator, denominator)
  return { numerator: numerator / divisor, denominator: denominator / divisor }
}
const subtract = (a, b) => rational(
  a.numerator * b.denominator - b.numerator * a.denominator,
  a.denominator * b.denominator,
)
const multiply = (a, b) => rational(
  a.numerator * b.numerator,
  a.denominator * b.denominator,
)
const divide = (a, b) => rational(
  a.numerator * b.denominator,
  a.denominator * b.numerator,
)

const gram = buildEnlargedMaynardSignatureGramMatrices(50, 1n, 25n, 5)

const inertiaAt = (thresholdNumerator, thresholdDenominator) => {
  const threshold = rational(thresholdNumerator, thresholdDenominator)
  const dimension = gram.basis.length
  const matrix = Array.from({ length: dimension }, (_, i) =>
    Array.from({ length: dimension }, (_, j) =>
      subtract(gram.exactA[i][j], multiply(threshold, gram.exactI[i][j]))))
  const lower = Array.from({ length: dimension }, () =>
    Array.from({ length: dimension }, () => rational(0n)))
  const diagonal = Array(dimension)
  let maxPivotNumeratorDigits = 0
  let maxPivotDenominatorDigits = 0

  for (let i = 0; i < dimension; i += 1) {
    lower[i][i] = rational(1n)
    let pivot = matrix[i][i]
    for (let s = 0; s < i; s += 1) {
      pivot = subtract(pivot, multiply(multiply(lower[i][s], lower[i][s]), diagonal[s]))
    }
    if (pivot.numerator === 0n) throw new Error(`zero pivot at ${i}`)
    diagonal[i] = pivot
    maxPivotNumeratorDigits = Math.max(
      maxPivotNumeratorDigits,
      abs(pivot.numerator).toString().length,
    )
    maxPivotDenominatorDigits = Math.max(
      maxPivotDenominatorDigits,
      pivot.denominator.toString().length,
    )
    for (let row = i + 1; row < dimension; row += 1) {
      let value = matrix[row][i]
      for (let s = 0; s < i; s += 1) {
        value = subtract(value, multiply(multiply(lower[row][s], lower[i][s]), diagonal[s]))
      }
      lower[row][i] = divide(value, pivot)
    }
  }

  return {
    threshold: `${thresholdNumerator}/${thresholdDenominator}`,
    positive: diagonal.filter((x) => x.numerator > 0n).length,
    negative: diagonal.filter((x) => x.numerator < 0n).length,
    maxPivotNumeratorDigits,
    maxPivotDenominatorDigits,
  }
}

console.log(JSON.stringify({
  dimension: gram.basis.length,
  results: [
    inertiaAt(35n, 10n),
    inertiaAt(351n, 100n),
    inertiaAt(40043n, 10000n),
  ],
}, null, 2))
