import { describe, expect, it } from 'vitest'
import {
  NYMAN_CONSTANTS,
  nymanDistanceLadder,
  nymanGramEntry,
  nymanOptimalDistance,
  nymanR1,
  nymanS1Rational,
  nymanTargetEntry,
} from '../src/core/nymanBeurling.js'

describe('Nyman--Beurling RH-equivalent laboratory', () => {
  it('matches the elementary R1 formula at one', () => {
    expect(nymanR1(1)).toBeCloseTo(NYMAN_CONSTANTS.eulerGamma - 0.5, 14)
  })

  it('reproduces Ehm\'s published S1(1) and G11 values', () => {
    expect(nymanS1Rational(1, 1)).toBeCloseTo(0.130331, 6)
    expect(nymanGramEntry(1, 1)).toBeCloseTo(1.260661, 6)
  })

  it('is symmetric and positive on a finite Gram section', () => {
    expect(nymanGramEntry(3, 7)).toBeCloseTo(nymanGramEntry(7, 3), 14)
    const result = nymanOptimalDistance([1, 2, 3, 4, 5, 6])
    expect(result.minPivot).toBeGreaterThan(0)
    expect(result.distanceSquared).toBeGreaterThan(0)
    expect(result.distanceSquared).toBeLessThan(1)
  })

  it('uses the published mixed-term sign convention', () => {
    expect(nymanTargetEntry(1)).toBeCloseTo(NYMAN_CONSTANTS.eulerGamma - 1, 14)
  })

  it('produces a monotone projection-distance ladder', () => {
    const ladder = nymanDistanceLadder(12)
    for (let index = 1; index < ladder.length; index += 1) {
      expect(ladder[index].distanceSquared).toBeLessThanOrEqual(
        ladder[index - 1].distanceSquared + 1e-12,
      )
      expect(ladder[index].gain).toBeGreaterThanOrEqual(-1e-12)
    }
  })
})
