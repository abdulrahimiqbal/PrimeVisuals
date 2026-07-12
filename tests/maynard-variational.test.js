import { describe, expect, it } from 'vitest'
import {
  buildMaynardGramMatrices,
  buildMaynardKrylovGramMatrices,
  buildMaynardSymmetricGramMatrices,
  calibratedM5CubicWitness,
  enumerateSimplexMonomials,
  exactRayleighQuotient,
  exactSymmetricRayleighQuotient,
  maximizeMaynardQuotient,
  maynardKrylovMoments,
  maynardM5Witness,
} from '../src/core/maynardVariational.js'

describe('Maynard--Tao variational engine', () => {
  it('enumerates the complete bounded-degree monomial basis', () => {
    expect(enumerateSimplexMonomials(5, 3)).toHaveLength(56)
  })

  it('gives the constant-function quotient 2k/(k+1)', () => {
    for (const k of [1, 2, 5, 50]) {
      const gram = buildMaynardGramMatrices(k, 0)
      expect(gram.A[0][0] / gram.I[0][0]).toBeCloseTo((2 * k) / (k + 1), 13)
    }
  })

  it('reproduces Maynard\'s published M5 rational certificate exactly', () => {
    const result = exactRayleighQuotient(5, maynardM5Witness())
    expect(result.numerator).toBe(1417255n)
    expect(result.denominator).toBe(708216n)
    expect(result.value).toBeGreaterThan(2)
  })

  it('independently rediscovers M5 > 2 in the complete cubic space', () => {
    const gram = buildMaynardGramMatrices(5, 3)
    const result = maximizeMaynardQuotient(gram)
    expect(result.converged).toBe(true)
    expect(result.quotient).toBeGreaterThan(2)
    expect(result.residual).toBeLessThan(1e-5)
  })

  it('turns the optimized cubic calibration into a stronger exact certificate', () => {
    const result = exactRayleighQuotient(5, calibratedM5CubicWitness())
    expect(result.numerator).toBe(11148726395n)
    expect(result.denominator).toBe(5566329648n)
    expect(result.value).toBeGreaterThan(2.0028)
  })

  it('matches the full basis on Maynard symmetric coordinates', () => {
    const symmetric = buildMaynardSymmetricGramMatrices(5, 3)
    const index = (b, c) => symmetric.basis.findIndex((term) => term.b === b && term.c === c)
    const coefficients = symmetric.basis.map(() => ({ numerator: 0n }))
    coefficients[index(1, 1)] = { numerator: 1n }
    coefficients[index(2, 0)] = { numerator: 7n, denominator: 10n }
    coefficients[index(0, 1)] = { numerator: 1n, denominator: 14n }
    coefficients[index(1, 0)] = { numerator: -3n, denominator: 14n }
    const result = exactSymmetricRayleighQuotient(symmetric, coefficients)
    expect(result.numerator).toBe(1417255n)
    expect(result.denominator).toBe(708216n)
  })

  it('reproduces the first Polymath Krylov moments exactly', () => {
    const k = 7
    const { moments } = maynardKrylovMoments(k, 3)
    const factorial = (n) => Array.from({ length: n }, (_, index) => BigInt(index + 1))
      .reduce((product, value) => product * value, 1n)
    const expectRatio = (actual, numerator, denominator) => {
      expect(actual.numerator * denominator).toBe(numerator * actual.denominator)
    }
    expectRatio(moments[0], 1n, factorial(k))
    expectRatio(moments[1], 2n * BigInt(k), factorial(k + 1))
    expectRatio(moments[2], BigInt(k * (5 * k + 1)), factorial(k + 2))
    expectRatio(moments[3], 2n * BigInt(k * k * (7 * k + 5)), factorial(k + 3))
  })

  it('builds a positive Krylov variational ladder', () => {
    const gram = buildMaynardKrylovGramMatrices(5, 4)
    const result = maximizeMaynardQuotient(gram)
    expect(result.quotient).toBeGreaterThan(2)
  })
})
