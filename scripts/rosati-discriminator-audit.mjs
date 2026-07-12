#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  buildDegreeTwoRosatiDatum,
  buildRosatiControlFamily,
  stringifyRosatiBigInts,
} from '../src/core/rosatiDiscriminator.js'

const outputDirectory = process.argv[2]
  || 'logs/arithmetic-hodge-transport/rosati-discriminator'

const controls = buildRosatiControlFamily()
const calibration = [
  buildDegreeTwoRosatiDatum({ q: 5, trace: 4 }),
  buildDegreeTwoRosatiDatum({ q: 4, trace: 4 }),
]
const allChecksPass = [...controls, ...calibration].every(
  (datum) => Object.values(datum.checks).every(Boolean),
)

const report = stringifyRosatiBigInts({
  generatedAt: new Date().toISOString(),
  verdict: allChecksPass
    ? 'EXACT DISCRIMINATOR: ALGEBRAIC DUALITY SURVIVES, POSITIVE ROSATI FAILS'
    : 'DISCRIMINATOR IMPLEMENTATION FAILED',
  theorem: {
    frobeniusPolynomial: 'x^2-a*x+q',
    frobeniusMatrix: '[[0,-q],[1,a]]',
    verschiebung: 'a*I-F',
    symmetricAdjointPairing: 'J=[[2,a],[a,2q]] (unique up to scale)',
    adjointIdentity: 'F^T J = J V',
    centeredIdentity: '(2F-aI)^2=(a^2-4q)I',
    determinant: 'det(J)=4q-a^2',
    conclusion: 'J is positive definite iff a^2<4q',
  },
  calibration,
  controls,
})

const rows = controls.map((control) => (
  `| (${control.leftExponent},${control.rightExponent}) | ${control.q} | ${control.trace} | ${control.pairingDeterminant} | ${control.pairingSignature} | ${Object.values(control.checks).every(Boolean) ? 'PASS' : 'FAIL'} |`
))

const markdown = `# Exact Rosati discriminator audit

Generated: ${report.generatedAt}

Verdict: **${report.verdict}**.

## Degree-two theorem

Let \`F\` have characteristic polynomial \`x^2-a x+q\` in its cyclic
companion basis, and put \`V=aI-F\`.  Then \`FV=VF=qI\`.  The symmetric
solutions of the Rosati adjoint equation

\`F^T J = J V\`

form a one-dimensional space.  With positive leading scale its generator is

\`J=[[2,a],[a,2q]]\`.

Therefore

\`det(J)=4q-a^2\`.

Equivalently, for \`D=2F-aI\`, one has

\`D^dagger=-D\`, \`D^2=(a^2-4q)I\`, and
\`D D^dagger=(4q-a^2)I\`.

A geometric Rosati form can be positive only when \`a^2<=4q\`.  Solving the
adjoint equation and then declaring its solution positive would be circular:
in degree two, positivity is already exactly the Hasse/critical-circle sign.
The form must instead be constructed from an independent ample/effective
intersection theory.

## Frozen controls

For roots \`r=2^u\`, \`s=2^v\`, the controls have \`q=rs\`, \`a=r+s\` and

\`det(J)=4rs-(r+s)^2=-(r-s)^2<0\`.

| (u,v) | q | trace a | det(J) | pairing | exact checks |
| --- | ---: | ---: | ---: | --- | --- |
${rows.join('\n')}

Every control retains \`FV=qI\` and the algebraic adjoint identity.  It fails
only the positivity of the unique symmetric adjoint form.
`

fs.mkdirSync(outputDirectory, { recursive: true })
fs.writeFileSync(
  path.join(outputDirectory, 'rosati-discriminator.json'),
  `${JSON.stringify(report, null, 2)}\n`,
)
fs.writeFileSync(
  path.join(outputDirectory, 'rosati-discriminator.md'),
  markdown,
)

console.log(JSON.stringify({
  verdict: report.verdict,
  controls: controls.length,
  outputDirectory,
}))

if (!allChecksPass) process.exitCode = 1
