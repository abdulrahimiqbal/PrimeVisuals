const multiply2 = (left, right) => [
  [
    left[0][0] * right[0][0] + left[0][1] * right[1][0],
    left[0][0] * right[0][1] + left[0][1] * right[1][1],
  ],
  [
    left[1][0] * right[0][0] + left[1][1] * right[1][0],
    left[1][0] * right[0][1] + left[1][1] * right[1][1],
  ],
]

const transpose2 = (matrix) => [
  [matrix[0][0], matrix[1][0]],
  [matrix[0][1], matrix[1][1]],
]

const equal2 = (left, right) => left.every(
  (row, rowIndex) => row.every(
    (value, columnIndex) => value === right[rowIndex][columnIndex],
  ),
)

const scalarIdentity2 = (value) => [[value, 0n], [0n, value]]

export const determinant2 = (matrix) => (
  matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
)

export const buildDegreeTwoRosatiDatum = ({ q, trace }) => {
  const qValue = BigInt(q)
  const traceValue = BigInt(trace)
  if (qValue <= 0n) throw new Error('q must be positive')

  // Companion matrix of x^2 - trace*x + q.
  const frobenius = [[0n, -qValue], [1n, traceValue]]
  const verschiebung = [[traceValue, qValue], [-1n, 0n]]

  // Every symmetric solution of F^T J = J(trace*I-F) is a scalar
  // multiple of this matrix when the cyclic companion basis is fixed.
  const pairing = [[2n, traceValue], [traceValue, 2n * qValue]]
  const pairingDeterminant = determinant2(pairing)
  const rosatiNormScalar = 4n * qValue - traceValue * traceValue
  const centeredFrobenius = [
    [-traceValue, -2n * qValue],
    [2n, traceValue],
  ]

  const frobeniusVerschiebung = multiply2(frobenius, verschiebung)
  const adjointLeft = multiply2(transpose2(frobenius), pairing)
  const adjointRight = multiply2(pairing, verschiebung)
  const centeredSquare = multiply2(centeredFrobenius, centeredFrobenius)

  let pairingSignature
  if (pairingDeterminant > 0n) pairingSignature = 'positive-definite'
  else if (pairingDeterminant === 0n) pairingSignature = 'positive-semidefinite-boundary'
  else pairingSignature = 'indefinite'

  return {
    q: qValue,
    trace: traceValue,
    characteristicPolynomial: [1n, -traceValue, qValue],
    frobenius,
    verschiebung,
    centeredFrobenius,
    pairing,
    pairingDeterminant,
    rosatiNormScalar,
    pairingSignature,
    checks: {
      frobeniusTimesVerschiebungIsQ: equal2(
        frobeniusVerschiebung,
        scalarIdentity2(qValue),
      ),
      adjointIdentity: equal2(adjointLeft, adjointRight),
      centeredSquareIdentity: equal2(
        centeredSquare,
        scalarIdentity2(traceValue * traceValue - 4n * qValue),
      ),
      determinantEqualsRosatiNorm: pairingDeterminant === rosatiNormScalar,
    },
  }
}

export const buildRosatiControlFamily = ({
  exponentPairs = [[1, 2], [1, 3], [2, 3], [2, 5]],
  base = 2,
} = {}) => exponentPairs.map(([leftExponent, rightExponent]) => {
  const leftRoot = BigInt(base) ** BigInt(leftExponent)
  const rightRoot = BigInt(base) ** BigInt(rightExponent)
  const datum = buildDegreeTwoRosatiDatum({
    q: leftRoot * rightRoot,
    trace: leftRoot + rightRoot,
  })
  return {
    leftExponent,
    rightExponent,
    leftRoot,
    rightRoot,
    expectedNegativeDeterminant: -((leftRoot - rightRoot) ** 2n),
    ...datum,
    checks: {
      ...datum.checks,
      controlFailsPositivityExactly: datum.pairingDeterminant === -((leftRoot - rightRoot) ** 2n),
    },
  }
})

export const stringifyRosatiBigInts = (value) => JSON.parse(JSON.stringify(
  value,
  (_, item) => typeof item === 'bigint' ? item.toString() : item,
))
