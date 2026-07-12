#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import Decimal from 'decimal.js'
import { buildEnlargedMaynardSignatureGramMatrices } from '../src/core/enlargedMaynardSignature.js'
import { exactFreeBoundaryRayleighQuotient } from '../src/core/freeBoundaryMaynard.js'
import {
  highPrecisionGeneralizedEigen,
  rationalizeDecimalVector,
} from './lib/high-precision-generalized-eigen.mjs'

const option = (name, fallback) => {
  const prefix = `--${name}=`
  const argument = process.argv.find((item) => item.startsWith(prefix))
  return argument ? Number(argument.slice(prefix.length)) : fallback
}

const maximumDegree = option('degree', 7)
const precision = option('precision', 70)
const rationalDigits = option('rational-digits', Math.floor(precision / 2))
const k = 50
const epsilonNumerator = 1n
const epsilonDenominator = 25n
const outputDirectory = 'logs/atlas-next-frontiers/free-boundary-maynard-49'
const stem = `signature-calibration-k50-e1over25-d${maximumDegree}`

console.error(`[maynard-enlarged] build exact k=${k}, epsilon=1/25, degree=${maximumDegree}`)
const buildStarted = Date.now()
const gram = buildEnlargedMaynardSignatureGramMatrices(
  k,
  epsilonNumerator,
  epsilonDenominator,
  maximumDegree,
)
const buildSeconds = (Date.now() - buildStarted) / 1000
console.error(`[maynard-enlarged] ${gram.basis.length} directions in ${buildSeconds.toFixed(3)}s`)
const solveStarted = Date.now()
const optimum = highPrecisionGeneralizedEigen(gram.exactA, gram.exactI, {
  precision,
  maximumSweeps: 300,
})
const solveSeconds = (Date.now() - solveStarted) / 1000
const rationalCoefficients = rationalizeDecimalVector(optimum.coefficients, rationalDigits)
const exact = exactFreeBoundaryRayleighQuotient(
  { A: gram.exactA, I: gram.exactI },
  rationalCoefficients,
)
Decimal.set({ precision })
const exactDecimal = new Decimal(exact.numerator.toString()).div(exact.denominator.toString())

const report = {
  generatedAt: new Date().toISOString(),
  theoremObject: 'Polymath8b M_(50,1/25)',
  basis: '(1+epsilon-P_(1))^a P_alpha, alpha an even-entry signature, a+|alpha|<=d',
  k,
  epsilon: '1/25',
  maximumDegree,
  dimension: gram.basis.length,
  buildSeconds,
  solveSeconds,
  precision,
  rationalDigits,
  numericalQuotient: optimum.quotient.toString(),
  numericalResidual: optimum.residual.toString(),
  eigensolverConvergedFlag: optimum.converged,
  exactNumerator: exact.numerator.toString(),
  exactDenominator: exact.denominator.toString(),
  exactQuotient: exactDecimal.toString(),
  exactAboveFour: exact.numerator > 4n * exact.denominator,
  publishedCalibration: {
    degree: 27,
    dimension: 2526,
    threshold: '4.0043',
    reproduced: maximumDegree === 27 && exactDecimal.gt('4.0043'),
  },
  coefficients: gram.basis.map((item, index) => ({
    index,
    slackPower: item.slackPower,
    signature: item.signature,
    numerator: rationalCoefficients[index].numerator.toString(),
    denominator: rationalCoefficients[index].denominator.toString(),
  })),
}

const markdown = `# Exact enlarged-signature calibration: k=50, epsilon=1/25, d=${maximumDegree}

- basis dimension: ${report.dimension}
- working precision: ${precision} digits
- numerical quotient: ${report.numericalQuotient}
- numerical residual: ${report.numericalResidual}
- exact rational quotient: ${report.exactNumerator}/${report.exactDenominator}
- exact decimal quotient: ${report.exactQuotient}
- exact quotient above 4: ${report.exactAboveFour ? 'yes' : 'no'}
- published d=27, dimension=2526, >4.0043 gate reproduced: ${report.publishedCalibration.reproduced ? 'yes' : 'no'}

The rational coefficient vector and basis ordering are stored in the sibling
JSON file.  The displayed quotient is evaluated from the exact rational Gram
matrices; the generalized eigensolver only proposes the vector.
`

fs.mkdirSync(outputDirectory, { recursive: true })
fs.writeFileSync(path.join(outputDirectory, `${stem}.json`), `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(path.join(outputDirectory, `${stem}.md`), markdown)
console.log(JSON.stringify({
  dimension: report.dimension,
  exactQuotient: report.exactQuotient,
  exactAboveFour: report.exactAboveFour,
  buildSeconds,
  solveSeconds,
}, null, 2))
