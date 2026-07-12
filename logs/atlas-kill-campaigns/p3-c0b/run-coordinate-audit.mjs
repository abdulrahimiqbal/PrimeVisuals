#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const outputDirectory = path.dirname(new URL(import.meta.url).pathname)
const L = Math.log(3)
const lambda = Math.sqrt(3)
const rho = 2 * Math.PI / L
const ell2 = Math.log(2)
const a = 1 / Math.sqrt(2)
const r = 2 * Math.sqrt(2) / 3

const add = ([ar, ai], [br, bi]) => [ar + br, ai + bi]
const scale = ([ar, ai], value) => [ar * value, ai * value]
const expi = (value) => [Math.cos(value), Math.sin(value)]
const abs = ([re, im]) => Math.hypot(re, im)

const mellinClosed = (n, s) => {
  const denominator = s - rho * n
  if (Math.abs(denominator) < 1e-10) return ((n & 1) ? -1 : 1) * Math.sqrt(L)
  return 2 * Math.sin(L * s / 2) / (Math.sqrt(L) * denominator)
}

// Composite Simpson integration after x=log(lambda*u), so d*u=dx.
const mellinQuadrature = (n, s, panels = 1 << 16) => {
  const step = L / panels
  let total = [0, 0]
  for (let index = 0; index <= panels; index += 1) {
    const x = index * step
    const phase = rho * n * x - s * (x - L / 2)
    const coefficient = index === 0 || index === panels ? 1 : index % 2 ? 4 : 2
    total = add(total, scale(expi(phase), coefficient / Math.sqrt(L)))
  }
  return scale(total, step / 3)
}

const mellinRows = []
let maximumMellinError = 0
for (const n of [-3, -2, -1, 0, 1, 2, 3]) {
  for (const s of [-8.25, -1.125, 0, 0.75, 5.5, rho * n]) {
    const observed = mellinQuadrature(n, s)
    const expected = mellinClosed(n, s)
    const error = abs(add(observed, [-expected, 0]))
    maximumMellinError = Math.max(maximumMellinError, error)
    mellinRows.push({ n, s, observed, expected, error })
  }
}

const dSquared = (s) => 1.5 - Math.sqrt(2) * Math.cos(ell2 * s)
let sampledMinimum = Infinity
let sampledMaximum = -Infinity
for (let index = 0; index <= 200000; index += 1) {
  const phase = 2 * Math.PI * index / 200000
  const value = 1.5 - Math.sqrt(2) * Math.cos(phase)
  sampledMinimum = Math.min(sampledMinimum, value)
  sampledMaximum = Math.max(sampledMaximum, value)
}

const qEntry = (m, n, y) => {
  if (m === n) return 2 * (1 - Math.abs(y) / L) * Math.cos(2 * Math.PI * n * y / L)
  return (
    Math.sin(2 * Math.PI * m * Math.abs(y) / L)
    - Math.sin(2 * Math.PI * n * Math.abs(y) / L)
  ) / (Math.PI * (n - m))
}

let endpointMaximum = 0
for (let m = -8; m <= 8; m += 1) {
  for (let n = -8; n <= 8; n += 1) {
    endpointMaximum = Math.max(endpointMaximum, Math.abs(qEntry(m, n, L)))
  }
}

const neumannRemainderBound = (degree) => (
  (2 / 3) * r ** (degree + 1) / (1 - r)
)

const report = {
  generatedAt: new Date().toISOString(),
  frozenParameters: { c: 3, L, lambda, rho, places: ['infinity', 2] },
  commonBasis: {
    U: 'U_n(x)=L^(-1/2) exp(2*pi*i*n*x/L), 0<=x<=L',
    V: 'V_n(u)=U_n(log(lambda*u)), lambda^(-1)<=u<=lambda',
    mellinMultiplier: 'h_n(s)=2 sin(L*s/2)/(sqrt(L)*(s-rho*n))',
    continuousValue: 'h_n(rho*n)=(-1)^n sqrt(L)',
    quadratureMaximumAbsoluteError: maximumMellinError,
    quadratureRows: mellinRows,
  },
  constraintAudit: {
    actualMellinZero: 'For an even vector v, h_v(0)=sqrt(L)*v_0; hence the row is v_0=0.',
    groskinM0: 'M_0(v)=v_0+sqrt(2)*sum_(k>=1) v_k=sqrt(L)*f_v(lambda^(-1)).',
    witnessMellinZeroButNotGroskinM0: {
      v: [0, 1],
      hAtZero: 0,
      groskinM0: Math.sqrt(2),
    },
    witnessGroskinM0ButNotMellinZero: {
      v: [-Math.sqrt(2), 1],
      hAtZero: -Math.sqrt(2 * L),
      groskinM0: 0,
    },
    rowsAreNotEquivalent: true,
  },
  onePrimeTransport: {
    d: 'd_2(s)=1-2^(-1/2-is)',
    dSquared: '|d_2(s)|^2=3/2-sqrt(2)*cos(s*log(2))',
    exactMinimum: (1 - a) ** 2,
    exactMaximum: (1 + a) ** 2,
    sampledMinimum,
    sampledMaximum,
    compressedOperator: 'G=(3/2)I_M-sqrt(2) C, C=P M_cos(s log 2) P|_M',
    neumannRatio: r,
    inverseSeries: 'G^(-1)=(2/3) sum_(j>=0) (2sqrt(2)/3)^j C^j',
    operatorNormRemainderBounds: {
      degree50: neumannRemainderBound(50),
      degree100: neumannRemainderBound(100),
      degree250: neumannRemainderBound(250),
    },
  },
  supportAudit: {
    convolutionSupport: '[1/3,3]',
    possiblePrimePowers: [2, 3],
    endpointQEntryMaximumForBandsThrough8: endpointMaximum,
    conclusion: 'The q=3 endpoint has q(U_m,U_n)(L)=0 identically; only prime 2 contributes.',
  },
  matrixContract: {
    represents: 'T_S and E_S=Q_S-T_S (exact reduction, not evaluated matrix)',
    domain: 'finite spans of the CCM basis V_n inside L^2([3^(-1/2),3^(1/2)],d*u)',
    basis: 'V_n as specified above',
    constraints: 'pole row from W_0,2; actual Mellin-zero row v_0=0; Groskin M_0 excluded',
    comparisonMap: 'K_2(s,t)=d_2(s)[P G^(-1) P](s,t) conjugate(d_2(t)); T_nm=integral h_n conjugate(h_m) K_2(s,s) ds',
    finiteOnly: false,
    promotionAllowed: false,
  },
  gates: {
    exactBasisMultiplierDerived: maximumMellinError < 1e-10,
    primeSupportTransported: endpointMaximum < 1e-12,
    falseMomentDictionaryKilled: true,
    exactResolventReductionDerived: true,
    archimedeanRestrictionAlgebraic: true,
    independentlyEvaluatedFiniteTMatrix: false,
    independentlyEvaluatedFiniteEMatrix: false,
    p3C0bPass: false,
    signTestAllowed: false,
  },
  verdict: 'EXACT SAME-COORDINATE RESOLVENT REDUCTION / FALSE M_0 DICTIONARY KILLED / P3-C0B NOT CLOSED',
}

fs.writeFileSync(path.join(outputDirectory, 'evidence.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({
  maximumMellinError,
  endpointMaximum,
  neumannRatio: r,
  gates: report.gates,
  verdict: report.verdict,
}, null, 2))
