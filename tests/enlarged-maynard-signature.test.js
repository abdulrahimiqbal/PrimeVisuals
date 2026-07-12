import { describe, expect, it } from 'vitest'
import {
  buildEnlargedMaynardSignatureGramMatrices,
  enumerateEnlargedEvenSignatureBasis,
  signatureProductFactorialWeight,
} from '../src/core/enlargedMaynardSignature.js'
import {
  buildMaynardSymmetricGramMatrices,
  maximizeMaynardQuotient,
} from '../src/core/maynardVariational.js'

describe('Polymath8b enlarged-simplex signature calibration', () => {
  it('computes the orbit product weights without structure tables', () => {
    expect(signatureProductFactorialWeight(2, [], [])).toBe(1n)
    expect(signatureProductFactorialWeight(2, [2], [])).toBe(4n)
    expect(signatureProductFactorialWeight(2, [2], [2])).toBe(56n)
    expect(signatureProductFactorialWeight(5, [4, 2], [2])).toBe(
      signatureProductFactorialWeight(5, [2], [4, 2]),
    )
  })

  it('enumerates the published k=50,d=27 even-signature dimension', () => {
    const basis = enumerateEnlargedEvenSignatureBasis(50, 27)
    expect(basis).toHaveLength(2526)
    expect(basis[0]).toEqual({ slackPower: 0, signature: [], degree: 0 })
    expect(basis.every((item) => (
      item.slackPower + item.signature.reduce((sum, part) => sum + part, 0) <= 27
      && item.signature.every((part) => part % 2 === 0)
    ))).toBe(true)
  })

  it('matches the direct constant-function enlarged-simplex quotient exactly', () => {
    const gram = buildEnlargedMaynardSignatureGramMatrices(2, 1n, 4n, 0)
    // C=5/4, B=3/4. I=C^2/2 and A=2(C^3-(C-B)^3)/3.
    expect(gram.exactI[0][0]).toEqual({ numerator: 25n, denominator: 32n })
    expect(gram.exactA[0][0]).toEqual({ numerator: 39n, denominator: 32n })
    expect(gram.A[0][0] / gram.I[0][0]).toBeCloseTo(1.56, 14)
  })

  it('reduces at epsilon zero to the independent P2 symmetric engine', () => {
    const signature = buildEnlargedMaynardSignatureGramMatrices(5, 0n, 1n, 2)
    const p2 = buildMaynardSymmetricGramMatrices(5, 2)
    expect(signature.basis.map(({ slackPower, signature: alpha }) => [slackPower, alpha])).toEqual([
      [0, []],
      [1, []],
      [2, []],
      [0, [2]],
    ])
    expect(signature.exactI).toEqual(p2.exactI)
    expect(signature.exactA).toEqual(p2.exactA)
  })

  it('builds and solves a nontrivial k=50 epsilon=1/25 calibration cell', () => {
    const gram = buildEnlargedMaynardSignatureGramMatrices(50, 1n, 25n, 3)
    const optimum = maximizeMaynardQuotient(gram, { method: 'jacobi' })
    expect(gram.basis).toHaveLength(6)
    expect(optimum.converged).toBe(true)
    expect(optimum.quotient).toBeGreaterThan(3)
  })
})
