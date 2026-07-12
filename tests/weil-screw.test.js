import { describe, expect, it } from 'vitest'
import {
  brownianKernelMatrix,
  buildWeilScrewEvaluator,
  primeKnotDecomposition,
  primeKnotKernelMatrix,
  screwKernelMatrix,
  symmetricEigenDecomposition,
} from '../src/core/weilScrew.js'

describe('Weil screw-function laboratory', () => {
  it('normalizes the explicit screw function at the origin', () => {
    const { evaluate } = buildWeilScrewEvaluator(2)
    expect(evaluate(0)).toBe(0)
    expect(evaluate(0.25)).toBeCloseTo(evaluate(-0.25), 14)
  })

  it('produces a symmetric finite screw kernel', () => {
    const { evaluate } = buildWeilScrewEvaluator(4)
    const matrix = screwKernelMatrix(evaluate, [0.25, 0.5, 1, 2])
    matrix.forEach((row, i) => row.forEach((value, j) => {
      expect(value).toBeCloseTo(matrix[j][i], 13)
    }))
  })

  it('factors each prime knot into Brownian and triangular pieces', () => {
    const points = [0.2, 0.5, 0.9, 1.4]
    const direct = primeKnotKernelMatrix(0.7, points)
    const pieces = primeKnotDecomposition(0.7, points)
    direct.forEach((row, i) => row.forEach((value, j) => {
      expect(value).toBeCloseTo(
        pieces.brownian[i][j] + pieces.triangularIncrement[i][j],
        13,
      )
    }))
  })

  it('uses Brownian covariance as a positive reference on positive points', () => {
    const matrix = brownianKernelMatrix([0.1, 0.3, 0.8])
    expect(matrix[0][2]).toBeCloseTo(0.1, 14)
    expect(matrix[2][2]).toBeCloseTo(0.8, 14)
  })

  it('returns orthonormal eigenvectors for symmetric sections', () => {
    const result = symmetricEigenDecomposition([[2, 1], [1, 2]])
    expect(result.values[0]).toBeCloseTo(1, 12)
    expect(result.values[1]).toBeCloseTo(3, 12)
    const dot = result.vectors[0][0] * result.vectors[0][1]
      + result.vectors[1][0] * result.vectors[1][1]
    expect(dot).toBeCloseTo(0, 12)
  })
})
