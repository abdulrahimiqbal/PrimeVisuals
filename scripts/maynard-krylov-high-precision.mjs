#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import Decimal from 'decimal.js'
import {
  buildMaynardKrylovGramMatrices,
  exactSymmetricRayleighQuotient,
} from '../src/core/maynardVariational.js'
import {
  highPrecisionGeneralizedEigen,
  rationalizeDecimalVector,
} from './lib/high-precision-generalized-eigen.mjs'

const option = (name, fallback) => {
  const prefix = `--${name}=`
  const argument = process.argv.find((item) => item.startsWith(prefix))
  return argument ? Number(argument.slice(prefix.length)) : fallback
}

const k = option('k', 54)
const dimension = option('dimension', 16)
const precision = option('precision', 100)
const rationalDigits = option('rational-digits', Math.floor(precision * 0.55))
const outDir = 'logs/maynard-variational'
const stem = `krylov-k${k}-n${dimension}-p${precision}`

console.error(`[maynard-hp] exact moments k=${k}, dimension=${dimension}`)
const gram = buildMaynardKrylovGramMatrices(k, dimension)
console.error(`[maynard-hp] ${gram.moments.length} moments; final polynomial has ${gram.termCounts.at(-1)} terms`)
console.error(`[maynard-hp] ${precision}-digit generalized eigenproblem`)
const optimum = highPrecisionGeneralizedEigen(gram.exactA, gram.exactI, { precision })
console.error(`[maynard-hp] rationalize at ${rationalDigits} decimal places`)
const rationalCoefficients = rationalizeDecimalVector(optimum.coefficients, rationalDigits)
const exact = exactSymmetricRayleighQuotient(gram, rationalCoefficients)
Decimal.set({ precision })
const exactDecimal = new Decimal(exact.numerator.toString()).div(exact.denominator.toString())
const threshold = new Decimal(4)

const report = {
  generatedAt: new Date().toISOString(),
  k,
  dimension,
  precision,
  rationalDigits,
  moments: gram.moments.length,
  finalPolynomialTermCount: gram.termCounts.at(-1),
  numericalQuotient: optimum.quotient.toSignificantDigits(precision - 5).toString(),
  numericalResidual: optimum.residual.toExponential(12),
  rotations: optimum.rotations,
  converged: optimum.converged,
  exactNumerator: exact.numerator.toString(),
  exactDenominator: exact.denominator.toString(),
  exactQuotient: exactDecimal.toSignificantDigits(precision - 5).toString(),
  exactAboveFour: exact.numerator > 4n * exact.denominator,
  marginAboveFour: exactDecimal.minus(threshold).toString(),
  coefficients: rationalCoefficients.map((coefficient, index) => ({
    krylovPower: index,
    numerator: coefficient.numerator.toString(),
    denominator: coefficient.denominator.toString(),
  })),
}

const jsonPath = path.join(outDir, `${stem}.json`)
const mdPath = path.join(outDir, `${stem}.md`)
const markdown = `# High-precision Maynard--Tao Krylov cell

- k: ${k}
- Krylov dimension: ${dimension}
- exact moments: 0 through ${2 * dimension - 1}
- polynomial terms in final moment: ${report.finalPolynomialTermCount}
- working precision: ${precision} decimal digits
- numerical quotient: ${report.numericalQuotient}
- numerical residual: ${report.numericalResidual}
- rational coefficient scale: 10^${rationalDigits}
- exact rational quotient: ${report.exactNumerator}/${report.exactDenominator}
- exact decimal quotient: ${report.exactQuotient}
- exact margin above 4: ${report.marginAboveFour}
- gate M_k > 4: ${report.exactAboveFour ? 'PASS' : 'NOT YET'}

This cell is a rigorous lower bound only through the displayed rational
coefficient vector and exact quotient. The numerical eigenvalue is a proposal
generator, not evidence by itself.
`

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(mdPath, markdown)
console.log(`[maynard-hp] numerical ${report.numericalQuotient}`)
console.log(`[maynard-hp] exact ${report.exactQuotient}`)
console.log(`[maynard-hp] M_${k}>4 ${report.exactAboveFour ? 'PASS' : 'NOT YET'}`)
console.log(`[maynard-hp] wrote ${jsonPath}`)
console.log(`[maynard-hp] wrote ${mdPath}`)
