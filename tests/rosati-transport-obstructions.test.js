import { describe, expect, it } from 'vitest'
import {
  buildModularRosatiAudit,
  coarseOrbitQuotientCertificate,
  compactnessDoesNotImplyPositivity,
  idempotentLinearizationCertificate,
} from '../src/core/rosatiTransportObstructions.js'

describe('arithmetic Rosati transport and carrier obstructions', () => {
  it('verifies the modular Rosati relation and involutivity exactly', () => {
    const audit = buildModularRosatiAudit()
    expect(audit.rows).toHaveLength(7)
    for (const row of audit.rows) {
      expect(Object.values(row.checks).every(Boolean)).toBe(true)
    }
  })

  it('certifies that additive group completion kills an idempotent stratum', () => {
    const certificate = idempotentLinearizationCertificate(['p=2', 'p=3'])
    expect(certificate.elements).toHaveLength(2)
    expect(certificate.elements.every((row) => row.killedByGroupCompletion)).toBe(true)
  })

  it('certifies that the coarse orbit quotient kills its defining flow', () => {
    const certificate = coarseOrbitQuotientCertificate()
    expect(certificate.rows.every((row) => row.quotientAction === 'identity')).toBe(true)
    expect(certificate.rows.every((row) => row.infinitesimalGenerator === 0)).toBe(true)
  })

  it('rejects compactness as a substitute for a sign theorem', () => {
    const countermodel = compactnessDoesNotImplyPositivity(2)
    expect(countermodel.compact).toBe(true)
    expect(countermodel.traceClass).toBe(true)
    expect(countermodel.residualEigenvalues).toEqual([-1, 1])
    expect(countermodel.residualPositiveSemidefinite).toBe(false)
  })
})
