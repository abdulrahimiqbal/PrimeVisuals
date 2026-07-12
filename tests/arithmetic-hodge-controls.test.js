import { describe, expect, it } from 'vitest'
import {
  buildPositiveOrbitRhFalseControl,
  primitiveNecklaceCount,
} from '../src/core/arithmeticHodgeControls.js'

describe('arithmetic Hodge transport controls', () => {
  it('counts primitive necklaces exactly', () => {
    expect(primitiveNecklaceCount(2, 1)).toBe(2n)
    expect(primitiveNecklaceCount(2, 2)).toBe(1n)
    expect(primitiveNecklaceCount(2, 3)).toBe(2n)
    expect(primitiveNecklaceCount(3, 2)).toBe(3n)
  })

  it('builds a positive-orbit reciprocal system with off-line spectral weights', () => {
    const control = buildPositiveOrbitRhFalseControl({ maximumDegree: 80 })
    expect(control.parameters.q).toBe(8)
    expect(control.numerator).toEqual([1, -6, 8])
    expect(control.spectralWeights[0]).toBeCloseTo(1 / 3, 14)
    expect(control.spectralWeights[1]).toBeCloseTo(2 / 3, 14)
    expect(Object.values(control.checks).every(Boolean)).toBe(true)
  })

  it('gives an infinite family rather than one fitted counterexample', () => {
    for (const [leftExponent, rightExponent] of [[1, 2], [1, 3], [2, 3], [2, 5]]) {
      const control = buildPositiveOrbitRhFalseControl({
        leftExponent,
        rightExponent,
        maximumDegree: 40,
      })
      expect(control.checks.allClosedOrbitCountsNonnegative).toBe(true)
      expect(control.checks.eulerProductReconstructsTrace).toBe(true)
      expect(control.checks.rootsOffCriticalCircle).toBe(true)
    }
  })
})
