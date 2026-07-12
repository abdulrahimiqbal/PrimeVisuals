import { describe, expect, it } from 'vitest'
import {
  buildDegreeTwoRosatiDatum,
  buildRosatiControlFamily,
} from '../src/core/rosatiDiscriminator.js'

describe('degree-two Rosati discriminator', () => {
  it('derives Frobenius adjunction and the Hasse determinant exactly', () => {
    const datum = buildDegreeTwoRosatiDatum({ q: 5, trace: 4 })
    expect(datum.pairing).toEqual([[2n, 4n], [4n, 10n]])
    expect(datum.pairingDeterminant).toBe(4n)
    expect(datum.pairingSignature).toBe('positive-definite')
    expect(Object.values(datum.checks).every(Boolean)).toBe(true)
  })

  it('detects the critical-circle boundary', () => {
    const datum = buildDegreeTwoRosatiDatum({ q: 4, trace: 4 })
    expect(datum.pairingDeterminant).toBe(0n)
    expect(datum.pairingSignature).toBe('positive-semidefinite-boundary')
  })

  it('rejects every positive-orbit RH-false control at positivity', () => {
    const controls = buildRosatiControlFamily()
    expect(controls).toHaveLength(4)
    for (const control of controls) {
      expect(control.pairingSignature).toBe('indefinite')
      expect(control.pairingDeterminant).toBe(control.expectedNegativeDeterminant)
      expect(Object.values(control.checks).every(Boolean)).toBe(true)
    }
  })
})
