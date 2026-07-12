#!/usr/bin/env node

import fs from 'node:fs'
import Decimal from 'decimal.js'
import { buildEnlargedMaynardSignatureGramMatrices } from '../src/core/enlargedMaynardSignature.js'
import {
  buildMaynardInactiveChamberCorrectionMatrix,
  exactFreeBoundaryQuadraticForm,
  exactFreeBoundaryRayleighQuotient,
} from '../src/core/freeBoundaryMaynard.js'

const inputPath = process.argv[2]
if (!inputPath) {
  throw new Error('Usage: node scripts/free-boundary-chamber-correct-witness.mjs witness.json')
}

const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
if (input.epsilon !== '1/25') throw new Error('This calibration runner currently expects epsilon=1/25')
const coefficients = input.coefficients.map((term) => ({
  numerator: BigInt(term.numerator),
  denominator: BigInt(term.denominator),
}))
const basis = input.coefficients.map((term) => ({
  slackPower: term.slackPower,
  signature: term.signature,
}))

const gram = buildEnlargedMaynardSignatureGramMatrices(
  input.k,
  1n,
  25n,
  input.maximumDegree,
)
const started = Date.now()
const correction = buildMaynardInactiveChamberCorrectionMatrix({
  k: input.k,
  epsilon: { numerator: 1n, denominator: 25n },
  basis,
  globalI: gram.exactI,
})
const globalI = exactFreeBoundaryQuadraticForm(gram.exactI, coefficients)
const chamberI = exactFreeBoundaryQuadraticForm(correction.exactCorrection, coefficients)
const correctedI = exactFreeBoundaryQuadraticForm(correction.exactCorrectedI, coefficients)
const numeratorForm = exactFreeBoundaryQuadraticForm(gram.exactA, coefficients)
const correctedQuotient = exactFreeBoundaryRayleighQuotient(
  { A: gram.exactA, I: correction.exactCorrectedI },
  coefficients,
)

Decimal.set({ precision: 80 })
const decimal = (value) => new Decimal(value.numerator.toString()).div(value.denominator.toString())
const serialize = (value) => ({
  numerator: value.numerator.toString(),
  denominator: value.denominator.toString(),
  decimal: decimal(value).toString(),
})
const chamberRatio = decimal(chamberI).div(decimal(globalI))

console.log(JSON.stringify({
  inputPath,
  k: input.k,
  epsilon: input.epsilon,
  maximumDegree: input.maximumDegree,
  dimension: basis.length,
  correctionSeconds: (Date.now() - started) / 1000,
  momentCount: correction.momentCount,
  kernelCount: correction.kernelCount,
  productCount: correction.productCount,
  globalI: serialize(globalI),
  chamberI: serialize(chamberI),
  chamberMassRatio: chamberRatio.toString(),
  correctedI: serialize(correctedI),
  numeratorForm: serialize(numeratorForm),
  originalQuotient: decimal(numeratorForm).div(decimal(globalI)).toString(),
  correctedQuotient: serialize(correctedQuotient),
}, null, 2))
