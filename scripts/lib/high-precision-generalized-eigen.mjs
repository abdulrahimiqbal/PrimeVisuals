import Decimal from 'decimal.js'

const dot = (left, right) => left.reduce(
  (sum, value, index) => sum.plus(value.times(right[index])),
  new Decimal(0),
)

const matrixVector = (matrix, vector) => matrix.map((row) => dot(row, vector))

const transpose = (matrix) => matrix[0].map((_, column) => matrix.map((row) => row[column]))

const matrixMultiply = (left, right) => {
  const output = Array.from(
    { length: left.length },
    () => Array.from({ length: right[0].length }, () => new Decimal(0)),
  )
  for (let row = 0; row < left.length; row += 1) {
    for (let index = 0; index < right.length; index += 1) {
      for (let column = 0; column < right[0].length; column += 1) {
        output[row][column] = output[row][column].plus(
          left[row][index].times(right[index][column]),
        )
      }
    }
  }
  return output
}

const cholesky = (matrix) => {
  const size = matrix.length
  const lower = Array.from(
    { length: size },
    () => Array.from({ length: size }, () => new Decimal(0)),
  )
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      let value = matrix[row][column]
      for (let index = 0; index < column; index += 1) {
        value = value.minus(lower[row][index].times(lower[column][index]))
      }
      if (row === column) {
        if (!value.isPositive()) {
          throw new Error(`High-precision Gram matrix is not positive at row ${row}: ${value}`)
        }
        lower[row][column] = value.sqrt()
      } else {
        lower[row][column] = value.div(lower[column][column])
      }
    }
  }
  return lower
}

const solveLower = (lower, rightHandSide) => {
  const output = Array.from({ length: rightHandSide.length }, () => new Decimal(0))
  for (let row = 0; row < output.length; row += 1) {
    let value = rightHandSide[row]
    for (let column = 0; column < row; column += 1) {
      value = value.minus(lower[row][column].times(output[column]))
    }
    output[row] = value.div(lower[row][row])
  }
  return output
}

const solveUpperTranspose = (lower, rightHandSide) => {
  const output = Array.from({ length: rightHandSide.length }, () => new Decimal(0))
  for (let row = output.length - 1; row >= 0; row -= 1) {
    let value = rightHandSide[row]
    for (let column = row + 1; column < output.length; column += 1) {
      value = value.minus(lower[column][row].times(output[column]))
    }
    output[row] = value.div(lower[row][row])
  }
  return output
}

const inverseLower = (lower) => {
  const size = lower.length
  const inverse = Array.from(
    { length: size },
    () => Array.from({ length: size }, () => new Decimal(0)),
  )
  for (let column = 0; column < size; column += 1) {
    const unit = Array.from({ length: size }, () => new Decimal(0))
    unit[column] = new Decimal(1)
    const solution = solveLower(lower, unit)
    for (let row = 0; row < size; row += 1) inverse[row][column] = solution[row]
  }
  return inverse
}

const jacobiLargest = (input, tolerance, maximumSweeps) => {
  const size = input.length
  const matrix = input.map((row) => row.map((value) => new Decimal(value)))
  const vectors = Array.from(
    { length: size },
    (_, row) => Array.from({ length: size }, (__, column) => new Decimal(row === column ? 1 : 0)),
  )
  let rotations = 0
  let converged = false

  for (let sweep = 0; sweep < maximumSweeps; sweep += 1) {
    let maximum = new Decimal(0)
    for (let left = 0; left < size - 1; left += 1) {
      for (let right = left + 1; right < size; right += 1) {
        const crossMagnitude = matrix[left][right].abs()
        if (crossMagnitude.gt(maximum)) maximum = crossMagnitude
        const scale = matrix[left][left].times(matrix[right][right]).abs().sqrt().plus(1)
        if (crossMagnitude.lte(tolerance.times(scale))) continue
        const tau = matrix[right][right]
          .minus(matrix[left][left])
          .div(matrix[left][right].times(2))
        const tangent = new Decimal(tau.isNegative() ? -1 : 1)
          .div(tau.abs().plus(tau.times(tau).plus(1).sqrt()))
        const cosine = new Decimal(1).div(tangent.times(tangent).plus(1).sqrt())
        const sine = tangent.times(cosine)
        const leftDiagonal = matrix[left][left]
        const rightDiagonal = matrix[right][right]
        const cross = matrix[left][right]
        matrix[left][left] = leftDiagonal.minus(tangent.times(cross))
        matrix[right][right] = rightDiagonal.plus(tangent.times(cross))
        matrix[left][right] = new Decimal(0)
        matrix[right][left] = new Decimal(0)

        for (let index = 0; index < size; index += 1) {
          if (index === left || index === right) continue
          const leftValue = matrix[index][left]
          const rightValue = matrix[index][right]
          matrix[index][left] = cosine.times(leftValue).minus(sine.times(rightValue))
          matrix[left][index] = matrix[index][left]
          matrix[index][right] = sine.times(leftValue).plus(cosine.times(rightValue))
          matrix[right][index] = matrix[index][right]
        }
        for (let row = 0; row < size; row += 1) {
          const leftValue = vectors[row][left]
          const rightValue = vectors[row][right]
          vectors[row][left] = cosine.times(leftValue).minus(sine.times(rightValue))
          vectors[row][right] = sine.times(leftValue).plus(cosine.times(rightValue))
        }
        rotations += 1
      }
    }
    if (maximum.lte(tolerance)) {
      converged = true
      break
    }
  }

  let largest = 0
  for (let index = 1; index < size; index += 1) {
    if (matrix[index][index].gt(matrix[largest][largest])) largest = index
  }
  return {
    value: matrix[largest][largest],
    vector: vectors.map((row) => row[largest]),
    rotations,
    converged,
  }
}

const fromRational = (value) => new Decimal(value.numerator.toString())
  .div(value.denominator.toString())

export const highPrecisionGeneralizedEigen = (exactA, exactI, options = {}) => {
  const { precision = 100, maximumSweeps = 200 } = options
  Decimal.set({ precision, rounding: Decimal.ROUND_HALF_EVEN })
  const A = exactA.map((row) => row.map(fromRational))
  const I = exactI.map((row) => row.map(fromRational))
  const diagonal = I.map((row, index) => row[index].sqrt())
  const scaledA = A.map((row, rowIndex) => row.map(
    (value, columnIndex) => value.div(diagonal[rowIndex].times(diagonal[columnIndex])),
  ))
  const scaledI = I.map((row, rowIndex) => row.map(
    (value, columnIndex) => value.div(diagonal[rowIndex].times(diagonal[columnIndex])),
  ))
  const lower = cholesky(scaledI)
  const inverse = inverseLower(lower)
  const transformed = matrixMultiply(matrixMultiply(inverse, scaledA), transpose(inverse))
  for (let row = 0; row < transformed.length; row += 1) {
    for (let column = 0; column < row; column += 1) {
      const average = transformed[row][column].plus(transformed[column][row]).div(2)
      transformed[row][column] = average
      transformed[column][row] = average
    }
  }
  const tolerance = new Decimal(10).pow(-Math.floor(precision * 0.7))
  const pair = jacobiLargest(transformed, tolerance, maximumSweeps)
  const scaledCoefficients = solveUpperTranspose(lower, pair.vector)
  const numerator = dot(scaledCoefficients, matrixVector(scaledA, scaledCoefficients))
  const denominator = dot(scaledCoefficients, matrixVector(scaledI, scaledCoefficients))
  const quotient = numerator.div(denominator)
  const image = matrixVector(transformed, pair.vector)
  const residual = image.reduce(
    (sum, value, index) => sum.plus(value.minus(quotient.times(pair.vector[index])).pow(2)),
    new Decimal(0),
  ).sqrt()
  const coefficients = scaledCoefficients.map(
    (value, index) => value.div(diagonal[index]),
  )
  const coefficientScale = Decimal.max(...coefficients.map((value) => value.abs()))
  return {
    quotient,
    coefficients: coefficients.map((value) => value.div(coefficientScale)),
    residual,
    rotations: pair.rotations,
    converged: pair.converged,
    precision,
  }
}

export const rationalizeDecimalVector = (coefficients, decimalPlaces) => {
  const denominator = 10n ** BigInt(decimalPlaces)
  return coefficients.map((coefficient) => ({
    numerator: BigInt(coefficient.times(denominator.toString()).toDecimalPlaces(0).toFixed(0)),
    denominator,
  }))
}
