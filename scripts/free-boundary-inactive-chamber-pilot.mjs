import {
  buildMaynardInactiveChamberConstantPilot,
  freeBoundaryRational,
  freeBoundaryRationalToNumber,
  integrateMaynardInactiveChamberSignature,
} from '../src/core/freeBoundaryMaynard.js'

const epsilon = freeBoundaryRational(1n, 25n)
const exact = (value) => ({
  numerator: value.numerator.toString(),
  denominator: value.denominator.toString(),
  decimal: freeBoundaryRationalToNumber(value),
})

const started = performance.now()
const constant = buildMaynardInactiveChamberConstantPilot(50, epsilon)
const moments = {}
for (const [name, parameters] of Object.entries({
  P2: { signature: [2] },
  P22: { signature: [2, 2] },
  radial1: { radialPower: 1 },
})) {
  moments[name] = exact(integrateMaynardInactiveChamberSignature({
    k: 50,
    epsilon,
    ...parameters,
  }))
}

const report = {
  object: 'Polymath8b all-marginals-inactive chamber',
  k: 50,
  epsilon: '1/25',
  elapsedMilliseconds: performance.now() - started,
  constantPilot: {
    globalI: exact(constant.globalI),
    chamberI: exact(constant.chamberI),
    chamberMassRatio: exact(constant.chamberMassRatio),
    numeratorForm: exact(constant.numeratorForm),
    globalQuotient: exact(constant.globalQuotient),
    truncatedQuotient: exact(constant.truncatedQuotient),
  },
  chamberMoments: moments,
}

console.log(JSON.stringify(report, null, 2))
