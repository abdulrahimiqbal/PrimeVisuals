#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  buildPositiveOrbitRhFalseControl,
  stringifyBigInts,
} from '../src/core/arithmeticHodgeControls.js'

const outputDirectory = process.argv[2] || 'logs/arithmetic-hodge-transport'
const maximumDegree = Number(process.argv[3] || 80)
const controls = [
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 5],
].map(([leftExponent, rightExponent]) => buildPositiveOrbitRhFalseControl({
  leftExponent,
  rightExponent,
  maximumDegree,
}))

const allChecksPass = controls.every(
  (control) => Object.values(control.checks).every(Boolean),
)

const output = stringifyBigInts({
  generatedAt: new Date().toISOString(),
  maximumDegree,
  verdict: allChecksPass
    ? 'CONTROL SURVIVES: TRACE + EULER PRODUCT + ALGEBRAIC DUALITY DO NOT FORCE RH'
    : 'CONTROL CONSTRUCTION FAILED',
  controls,
})

const rows = controls.map((control) => {
  const { leftExponent, rightExponent, q } = control.parameters
  const firstOrbits = control.closedOrbitCounts.slice(0, 5).join(', ')
  return `| ${leftExponent}/${leftExponent + rightExponent}, ${rightExponent}/${leftExponent + rightExponent} | ${q} | ${control.numerator.join(', ')} | ${firstOrbits} | ${Object.values(control.checks).every(Boolean) ? 'PASS' : 'FAIL'} |`
})

const markdown = `# Arithmetic Hodge control audit

Generated: ${output.generatedAt}

Verdict: **${output.verdict}**.

For distinct positive integers \`u,v\`, put

\`q=2^(u+v)\`, \`r=2^u\`, \`s=2^v\`, and

\`Z(T)=((1-rT)(1-sT))/((1-T)(1-qT))\`.

The numerator is reciprocal because \`rs=q\`, so \`Z(1/(qT))=Z(T)\`.
Its spectral weights are \`u/(u+v)\` and \`v/(u+v)\`: they reflect about
\`1/2\` but are off the critical line whenever \`u != v\`.

On the two-dimensional spectral space, \`Theta=diag(u/(u+v),v/(u+v))\`
obeys \`Theta^T J + J Theta = J\` for \`J=[[0,1],[1,0]]\`.  This is an
exact weight-one algebraic duality, but \`J\` has signature \`(1,1)\` and is
not a positive polarization.

Nevertheless its trace counts

\`N_n=q^n+1-r^n-s^n\`

are nonnegative, and its primitive closed-orbit multiplicities are nonnegative
integers.  For \`n>1\` they equal the number of primitive \`q\`-necklaces minus
the primitive \`r\`- and \`s\`-necklaces.  Since \`q >= r+s\`, choose disjoint
subalphabets of sizes \`r\` and \`s\` inside a \`q\`-letter alphabet; this is an
injection of the two subfamilies into the \`q\`-necklaces.  At \`n=1\`, the
additional constant orbit gives \`q+1-r-s >= 0\`.

Thus positive closed-orbit data, an exact Euler product, trace reconstruction,
reciprocity, and functional-equation symmetry do not force the critical line.
A geometric polarization/weight theorem has a falsifiable job: it must reject
this family before asserting RH.

| spectral weights | q | numerator coefficients | first five orbit counts | checks |
| --- | ---: | --- | --- | --- |
${rows.join('\n')}

All identities and orbit counts were checked with exact \`BigInt\` arithmetic
through degree ${maximumDegree}.  The alphabet-injection argument proves
nonnegativity for every degree; the finite run checks the implementation.
`

fs.mkdirSync(outputDirectory, { recursive: true })
fs.writeFileSync(path.join(outputDirectory, 'positive-orbit-control.json'), `${JSON.stringify(output, null, 2)}\n`)
fs.writeFileSync(path.join(outputDirectory, 'positive-orbit-control.md'), markdown)

console.log(JSON.stringify({
  verdict: output.verdict,
  controls: controls.length,
  maximumDegree,
  outputDirectory,
}))

if (!allChecksPass) process.exitCode = 1
