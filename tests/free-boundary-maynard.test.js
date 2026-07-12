import { describe, expect, it } from 'vitest'
import {
  buildK2HalfFreeBoundaryAudit,
  buildMaynardInactiveChamberConstantPilot,
  buildMaynardEnlargedRadialGram,
  buildMaynardInactiveChamberCorrectionMatrix,
  certifyFreeBoundaryUpperBound2x,
  exactFreeBoundaryRayleighQuotient,
  estimateFreeBoundaryMaynardScaling,
  evaluateMaynardInactiveChamberQuadratic,
  freeBoundaryRational,
  freeBoundaryRationalToNumber,
  integrateMaynardInactiveChamberSignature,
  integrateMaynardSimplexSignature,
  multiplyMaynardMonomialSymmetric,
  integrateRationalTriangleMonomial,
} from '../src/core/freeBoundaryMaynard.js'
import { maximizeMaynardQuotient } from '../src/core/maynardVariational.js'

const midpointCapQuadrature = (steps) => {
  const xWidth = 0.5 / steps
  let total = 0
  for (let xIndex = 0; xIndex < steps; xIndex += 1) {
    const x = 0.5 + (xIndex + 0.5) * xWidth
    const yWidth = (1.5 - x - 0.5) / steps
    for (let yIndex = 0; yIndex < steps; yIndex += 1) {
      const y = 0.5 + (yIndex + 0.5) * yWidth
      total += x * x * y * xWidth * yWidth
    }
  }
  return total
}

describe('free-boundary Maynard exact cells', () => {
  it('integrates a rational boundary triangle monomial exactly', () => {
    const half = freeBoundaryRational(1n, 2n)
    const triangle = [
      [half, half],
      [freeBoundaryRational(1n), half],
      [half, freeBoundaryRational(1n)],
    ]
    const exact = integrateRationalTriangleMonomial(triangle, 2, 1)
    expect(exact).toEqual({ numerator: 71n, denominator: 1920n })
    expect(midpointCapQuadrature(800)).toBeCloseTo(freeBoundaryRationalToNumber(exact), 7)
  })

  it('finds a strict gain from a boundary-aligned inactive-cap direction', () => {
    const audit = buildK2HalfFreeBoundaryAudit()
    const global = maximizeMaynardQuotient({
      I: audit.I.slice(0, 2).map((row) => row.slice(0, 2)),
      A: audit.A.slice(0, 2).map((row) => row.slice(0, 2)),
      monomials: audit.basis.slice(0, 2),
    })
    const enriched = maximizeMaynardQuotient({
      I: audit.I,
      A: audit.A,
      monomials: audit.basis,
    })

    expect(global.converged).toBe(true)
    expect(enriched.converged).toBe(true)
    expect(enriched.quotient - global.quotient).toBeGreaterThan(0.01)
    expect(Math.abs(enriched.coefficients[2])).toBeGreaterThan(0.01)
    expect(audit.exact.A[2]).toEqual([
      freeBoundaryRational(0n),
      freeBoundaryRational(0n),
      freeBoundaryRational(0n),
    ])

    const globalUpper = certifyFreeBoundaryUpperBound2x({
      I: audit.exact.I.slice(0, 2).map((row) => row.slice(0, 2)),
      A: audit.exact.A.slice(0, 2).map((row) => row.slice(0, 2)),
    }, freeBoundaryRational(1641n, 1000n))
    const enrichedWitness = exactFreeBoundaryRayleighQuotient(audit.exact, [
      -1000n,
      462n,
      384n,
    ])
    expect(globalUpper.certified).toBe(true)
    expect(enrichedWitness.value).toBeGreaterThan(1.714)
    expect(enrichedWitness.value).toBeGreaterThan(1.641)
  })

  it('enumerates k=49 boundary chambers directly by symmetry orbit', () => {
    const scaling = estimateFreeBoundaryMaynardScaling(49, 27)
    expect(scaling.labelledSignCellUpperBound).toBe(562949953421312n)
    expect(scaling.signCellOrbitUpperBound).toBe(50)
    expect(scaling.polynomialDimension).toBe(2526)
    expect(scaling.naiveOrbitLocalDimension).toBe(126300)
  })

  it('reduces the inactive chamber to exact orbit-counted moments', () => {
    const epsilon = freeBoundaryRational(1n, 2n)
    expect(integrateMaynardInactiveChamberSignature({
      k: 2,
      epsilon,
    })).toEqual(freeBoundaryRational(1n, 8n))
    expect(integrateMaynardInactiveChamberSignature({
      k: 2,
      epsilon,
      signature: [1],
    })).toEqual(freeBoundaryRational(1n, 6n))
    expect(integrateMaynardInactiveChamberSignature({
      k: 2,
      epsilon,
      radialPower: 1,
    })).toEqual(freeBoundaryRational(1n, 48n))
    expect(integrateMaynardInactiveChamberSignature({
      k: 2,
      epsilon,
      signature: [2],
    })).toEqual(freeBoundaryRational(11n, 96n))
    expect(integrateMaynardInactiveChamberSignature({
      k: 2,
      epsilon,
      signature: [1, 1],
    })).toEqual(freeBoundaryRational(7n, 128n))
    expect(integrateMaynardSimplexSignature({
      k: 2,
      limit: freeBoundaryRational(3n, 2n),
    })).toEqual(freeBoundaryRational(9n, 8n))

    const pilot = buildMaynardInactiveChamberConstantPilot(2, epsilon)
    expect(pilot.chamberMassRatio).toEqual(freeBoundaryRational(1n, 9n))
    expect(pilot.globalQuotient).toEqual(freeBoundaryRational(38n, 27n))
    expect(pilot.truncatedQuotient).toEqual(freeBoundaryRational(19n, 12n))
  })

  it('multiplies monomial-symmetric orbits and evaluates a sparse square exactly', () => {
    expect([...multiplyMaynardMonomialSymmetric(5, [1], [1])]).toEqual([
      ['1,1', 2n],
      ['2', 1n],
    ])
    expect([...multiplyMaynardMonomialSymmetric(5, [2], [2])]).toEqual([
      ['2,2', 2n],
      ['4', 1n],
    ])
    const result = evaluateMaynardInactiveChamberQuadratic({
      k: 2,
      epsilon: freeBoundaryRational(1n, 2n),
      terms: [
        { radialPower: 0, signature: [], coefficient: 2n },
        { radialPower: 0, signature: [1], coefficient: 3n },
      ],
    })
    expect(result.correction).toEqual(freeBoundaryRational(289n, 64n))
    expect(result.squareTermCount).toBe(4)

    const correction = buildMaynardInactiveChamberCorrectionMatrix({
      k: 2,
      epsilon: freeBoundaryRational(1n, 2n),
      basis: [
        { slackPower: 0, signature: [] },
        { slackPower: 0, signature: [1] },
      ],
    })
    expect(correction.exactCorrection).toEqual([
      [freeBoundaryRational(1n, 8n), freeBoundaryRational(1n, 6n)],
      [freeBoundaryRational(1n, 6n), freeBoundaryRational(43n, 192n)],
    ])
  })

  it('produces a reproducible corrected radial eigenvalue', () => {
    const epsilon = freeBoundaryRational(1n, 2n)
    const globalConstant = buildMaynardEnlargedRadialGram({
      k: 2,
      epsilon,
      degree: 0,
    })
    const truncatedConstant = buildMaynardEnlargedRadialGram({
      k: 2,
      epsilon,
      degree: 0,
      truncateInactive: true,
    })
    expect(globalConstant.exact.A[0][0]).toEqual(freeBoundaryRational(19n, 12n))
    expect(globalConstant.exact.I[0][0]).toEqual(freeBoundaryRational(9n, 8n))
    expect(truncatedConstant.exact.I[0][0]).toEqual(freeBoundaryRational(1n))

    const global = maximizeMaynardQuotient(buildMaynardEnlargedRadialGram({
      k: 2,
      epsilon,
      degree: 1,
    }))
    const truncated = maximizeMaynardQuotient(buildMaynardEnlargedRadialGram({
      k: 2,
      epsilon,
      degree: 1,
      truncateInactive: true,
    }))
    expect(global.converged).toBe(true)
    expect(truncated.converged).toBe(true)
    expect(truncated.quotient).toBeGreaterThan(global.quotient)
  })
})
