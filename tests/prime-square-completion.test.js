import { describe, expect, it } from 'vitest'
import {
  buildPrimeMetricStrain,
  buildStrictPrimeSquareAtoms,
  flattenSymmetricFrobenius,
  logEndpointPoints,
  logIntegerPartition,
  mixedDifferenceKernelMatrix,
  primeEdgeGram,
  primePlaquetteGram,
  primeSquareMatrix,
  PRIME_SQUARE_MATRIX_OPS,
  truncatedDilationShiftMatrix,
} from '../src/core/primeSquareCompletion.js'
import {
  buildWeilScrewEvaluator,
  screwKernelMatrix,
} from '../src/core/weilScrew.js'

const { multiply } = PRIME_SQUARE_MATRIX_OPS

const maxAbsDifference = (left, right) => Math.max(...left.flatMap(
  (row, rowIndex) => row.map(
    (value, columnIndex) => Math.abs(value - right[rowIndex][columnIndex]),
  ),
))

describe('prime-square completion laboratory', () => {
  it('represents the multiplicative semigroup by exact truncated shifts', () => {
    const maximumInteger = 40
    const shift2 = truncatedDilationShiftMatrix(2, maximumInteger)
    const shift3 = truncatedDilationShiftMatrix(3, maximumInteger)
    const shift6 = truncatedDilationShiftMatrix(6, maximumInteger)
    expect(maxAbsDifference(multiply(shift2, shift3), shift6)).toBe(0)
    expect(maxAbsDifference(multiply(shift3, shift2), shift6)).toBe(0)
  })

  it('identifies prime squares with mixed shift differences', () => {
    const maximumInteger = 30
    const square = primeSquareMatrix(2, 3, maximumInteger)
    const left = PRIME_SQUARE_MATRIX_OPS.add(
      PRIME_SQUARE_MATRIX_OPS.identity(maximumInteger - 1),
      PRIME_SQUARE_MATRIX_OPS.scale(truncatedDilationShiftMatrix(2, maximumInteger), -1),
    )
    const right = PRIME_SQUARE_MATRIX_OPS.add(
      PRIME_SQUARE_MATRIX_OPS.identity(maximumInteger - 1),
      PRIME_SQUARE_MATRIX_OPS.scale(truncatedDilationShiftMatrix(3, maximumInteger), -1),
    )
    expect(maxAbsDifference(square, multiply(left, right))).toBe(0)
  })

  it('derives the prime-power generator as the strain of a positive Euler metric', () => {
    for (const maximumInteger of [8, 12, 20]) {
      const result = buildPrimeMetricStrain(maximumInteger, 0.5)
      expect(maxAbsDifference(result.pulledBackStrain, result.generatorStrain)).toBeLessThan(2e-12)
    }
  })

  it('matches the metric strain to the signed prime-knot screw kernel', () => {
    for (const maximumInteger of [8, 12, 20]) {
      const result = buildPrimeMetricStrain(maximumInteger, 0.5)
      const evaluator = buildWeilScrewEvaluator(Math.log(maximumInteger))
      const primeKernel = screwKernelMatrix(evaluator.evaluatePrimePower, logEndpointPoints(maximumInteger))
      const negatedStrain = result.generatorStrain.map((row) => row.map((value) => -value))
      expect(maxAbsDifference(primeKernel, negatedStrain)).toBeLessThan(2e-12)
    }
  })

  it('builds positive edge and plaquette atoms on the exact log partition', () => {
    const maximumInteger = 12
    const partition = logIntegerPartition(maximumInteger)
    for (const matrix of [primeEdgeGram(partition, 2), primePlaquetteGram(partition, 2, 3)]) {
      for (let row = 0; row < matrix.length; row += 1) {
        expect(matrix[row][row]).toBeGreaterThanOrEqual(-1e-14)
        for (let column = 0; column < matrix.length; column += 1) {
          expect(matrix[row][column]).toBeCloseTo(matrix[column][row], 13)
        }
      }
    }
    const { atoms } = buildStrictPrimeSquareAtoms(maximumInteger)
    expect(atoms.some((atom) => atom.name === 'square:2:3')).toBe(true)
  })

  it('uses mixed differences to move the screw form to log cells', () => {
    const maximumInteger = 12
    const evaluator = buildWeilScrewEvaluator(Math.log(maximumInteger))
    const partition = logIntegerPartition(maximumInteger)
    const total = mixedDifferenceKernelMatrix(evaluator.evaluate, partition)
    const vector = flattenSymmetricFrobenius(total)
    expect(vector.length).toBe((maximumInteger - 1) * maximumInteger / 2)
    expect(vector.every(Number.isFinite)).toBe(true)
  })
})
