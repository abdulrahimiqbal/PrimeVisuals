#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { mobiusUpTo, sieve } from '../src/core/math.js'
import { NYMAN_CONSTANTS, nymanDistanceLadder } from '../src/core/nymanBeurling.js'

const maximumIndex = 60
const cutoffs = [2_048, 4_096, 8_192]
const seeds = Array.from({ length: 2_000 }, (_, index) => 104729 + index * 130363)
const outDir = 'logs/nyman-beurling'

const rng = (seed) => {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const solveLinearSystem = (matrix, vector) => {
  const size = vector.length
  const augmented = matrix.map((row, index) => [...row, vector[index]])
  for (let pivot = 0; pivot < size; pivot += 1) {
    let best = pivot
    for (let row = pivot + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][pivot]) > Math.abs(augmented[best][pivot])) best = row
    }
    ;[augmented[pivot], augmented[best]] = [augmented[best], augmented[pivot]]
    const divisor = augmented[pivot][pivot]
    for (let column = pivot; column <= size; column += 1) augmented[pivot][column] /= divisor
    for (let row = 0; row < size; row += 1) {
      if (row === pivot) continue
      const factor = augmented[row][pivot]
      for (let column = pivot; column <= size; column += 1) {
        augmented[row][column] -= factor * augmented[pivot][column]
      }
    }
  }
  return augmented.map((row) => row[size])
}

const residualize = (rows) => {
  const design = rows.map((row) => [
    1,
    Math.log(row.n),
    Math.log(Math.max(row.minPivot, 1e-30)),
    Math.log(Math.max(Math.abs(row.newestCoefficient), 1e-30)),
  ])
  const response = rows.map((row) => Math.log(Math.max(row.gain, 1e-30)))
  const width = design[0].length
  const gram = Array.from({ length: width }, () => Array(width).fill(0))
  const target = Array(width).fill(0)
  for (let row = 0; row < design.length; row += 1) {
    for (let left = 0; left < width; left += 1) {
      target[left] += design[row][left] * response[row]
      for (let right = 0; right < width; right += 1) {
        gram[left][right] += design[row][left] * design[row][right]
      }
    }
  }
  const coefficients = solveLinearSystem(gram, target)
  return rows.map((row, index) => ({
    ...row,
    logGain: response[index],
    residualLogGain: response[index] - design[index].reduce(
      (total, value, column) => total + value * coefficients[column],
      0,
    ),
  }))
}

const mean = (values) => values.reduce((total, value) => total + value, 0) / values.length

const effect = (rows, predicate, field = 'residualLogGain') => {
  const selected = rows.filter(predicate).map((row) => row[field])
  const complement = rows.filter((row) => !predicate(row)).map((row) => row[field])
  return selected.length && complement.length ? mean(selected) - mean(complement) : NaN
}

const dyadicBlock = (n) => Math.floor(Math.log2(n))

const permutationZ = (rows, predicate) => {
  const observed = effect(rows, predicate)
  const blocks = new Map()
  for (const row of rows) {
    const key = dyadicBlock(row.n)
    if (!blocks.has(key)) blocks.set(key, [])
    blocks.get(key).push(row)
  }
  const nullValues = []
  for (const seed of seeds) {
    const random = rng(seed)
    const permuted = rows.map((row) => ({ ...row }))
    const byN = new Map(permuted.map((row) => [row.n, row]))
    for (const block of blocks.values()) {
      const values = block.map((row) => row.residualLogGain)
      for (let index = values.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(random() * (index + 1))
        ;[values[index], values[swap]] = [values[swap], values[index]]
      }
      block.forEach((row, index) => { byN.get(row.n).residualLogGain = values[index] })
    }
    nullValues.push(effect(permuted, predicate))
  }
  const nullMean = mean(nullValues)
  const variance = nullValues.reduce((total, value) => total + (value - nullMean) ** 2, 0)
    / Math.max(1, nullValues.length - 1)
  const sd = Math.sqrt(variance)
  return { observed, nullMean, sd, z: sd > 0 ? (observed - nullMean) / sd : NaN }
}

const pearson = (left, right) => {
  const meanLeft = mean(left)
  const meanRight = mean(right)
  let numerator = 0
  let normLeft = 0
  let normRight = 0
  for (let index = 0; index < left.length; index += 1) {
    const x = left[index] - meanLeft
    const y = right[index] - meanRight
    numerator += x * y
    normLeft += x * x
    normRight += y * y
  }
  return numerator / Math.sqrt(normLeft * normRight)
}

const primeFlags = sieve(maximumIndex)
const mu = mobiusUpTo(maximumIndex)
const ladders = []
for (const cutoff of cutoffs) {
  console.error(`[nyman] distance ladder N<=${maximumIndex}, S1 cutoff=${cutoff}`)
  ladders.push({ cutoff, rows: nymanDistanceLadder(maximumIndex, { directCutoff: cutoff }) })
}

const mainRows = residualize(ladders.find((item) => item.cutoff === 4_096).rows
  .filter((row) => row.n >= 5)
  .map((row) => ({
    ...row,
    isPrime: Boolean(primeFlags[row.n]),
    mobius: mu[row.n],
    isSquarefree: mu[row.n] !== 0,
    isSquarefreeComposite: !primeFlags[row.n] && mu[row.n] !== 0,
    isNonsquarefree: mu[row.n] === 0,
  })))

const predicates = {
  prime: (row) => row.isPrime,
  squarefreeComposite: (row) => row.isSquarefreeComposite,
  nonsquarefree: (row) => row.isNonsquarefree,
  positiveMobius: (row) => row.mobius === 1,
  negativeMobius: (row) => row.mobius === -1,
}

const featureScores = Object.fromEntries(
  Object.entries(predicates).map(([name, predicate]) => [name, {
    full: permutationZ(mainRows, predicate),
    finalThird: permutationZ(mainRows.filter((row) => row.n > 40), predicate),
  }]),
)

const cutoffStability = cutoffs.slice(1).map((cutoff, index) => {
  const previous = ladders[index].rows.slice(4).map((row) => Math.log(Math.max(row.gain, 1e-30)))
  const current = ladders[index + 1].rows.slice(4).map((row) => Math.log(Math.max(row.gain, 1e-30)))
  return {
    leftCutoff: cutoffs[index],
    rightCutoff: cutoff,
    correlation: pearson(previous, current),
    maximumDistanceDelta: Math.max(...ladders[index].rows.map((row, rowIndex) => Math.abs(
      row.distanceSquared - ladders[index + 1].rows[rowIndex].distanceSquared,
    ))),
  }
})

const strongest = Object.entries(featureScores)
  .map(([name, score]) => ({ name, ...score }))
  .sort((left, right) => Math.abs(right.full.z) - Math.abs(left.full.z))[0]
const leadPass = Math.abs(strongest.full.z) >= 4
  && Math.abs(strongest.finalThird.z) >= 4
  && Math.sign(strongest.full.observed) === Math.sign(strongest.finalThird.observed)
  && cutoffStability.every((row) => row.correlation > 0.999)

const report = {
  generatedAt: new Date().toISOString(),
  maximumIndex,
  cutoffs,
  burnolConstant: NYMAN_CONSTANTS.burnolConstant,
  ladders,
  residualRows: mainRows,
  featureScores,
  cutoffStability,
  strongestFeature: strongest.name,
  leadPass,
  verdict: leadPass ? 'FINITE LEAD; NOVELTY AND PROOF-OBLIGATION AUDIT REQUIRED' : 'NO SCHUR-INNOVATION SURVIVOR',
}

const fmt = (value, digits = 6) => Number.isFinite(value) ? value.toFixed(digits) : 'NA'
const finalRows = mainRows.filter((row) => row.n > 40)
const featureTable = Object.entries(featureScores).map(([name, score]) =>
  `| ${name} | ${fmt(score.full.observed)} | ${fmt(score.full.z, 2)} | ${fmt(score.finalThird.observed)} | ${fmt(score.finalThird.z, 2)} |`,
).join('\n')
const ladderTable = mainRows.map((row) =>
  `| ${row.n} | ${row.isPrime ? 'P' : row.isNonsquarefree ? 'NSF' : 'SF-C'} | ${row.distanceSquared.toExponential(8)} | ${row.gain.toExponential(8)} | ${fmt(row.residualLogGain)} | ${fmt(row.newestCoefficient)} |`,
).join('\n')

const markdown = `# Nyman--Beurling Schur innovation pilot

Generated: ${report.generatedAt}

The finite projection distance is RH-equivalent only in the limit. Its monotone
decrease is automatic and is not scored. This pilot residualizes each one-step
log innovation against index, Cholesky pivot, and newest coefficient magnitude,
then tests low-complexity arithmetic classes against 2,000 within-dyadic-block
permutations.

- ladder: N=1..${maximumIndex}
- scored rows: N=5..${maximumIndex}
- final-third support: ${finalRows.length}
- Burnol lower-bound constant: ${report.burnolConstant}
- strongest feature: ${report.strongestFeature}
- lead gate: ${leadPass ? 'PASS' : 'FAIL'}

| feature | full residual effect | full z | final-third effect | final-third z |
| --- | ---: | ---: | ---: | ---: |
${featureTable}

## Numerical cutoff stability

${cutoffStability.map((row) => `- ${row.leftCutoff} vs ${row.rightCutoff}: log-gain r=${fmt(row.correlation, 9)}, max distance delta=${row.maximumDistanceDelta.toExponential(3)}`).join('\n')}

## Innovation ladder

Classes: P=prime, SF-C=squarefree composite, NSF=nonsquarefree.

| N | class | d_N^2 | gain | residual log gain | newest coefficient |
| ---: | --- | ---: | ---: | ---: | ---: |
${ladderTable}

Verdict: **${report.verdict}**.
`

const svgWidth = 1100
const svgHeight = 680
const pad = 70
const x = (n) => pad + ((n - 5) / (maximumIndex - 5)) * (svgWidth - 2 * pad)
const residualExtent = Math.max(...mainRows.map((row) => Math.abs(row.residualLogGain)), 1)
const y = (value) => svgHeight / 2 - (value / residualExtent) * (svgHeight / 2 - pad)
const colors = { prime: '#f59e0b', squarefree: '#60a5fa', nonsquarefree: '#a78bfa' }
const points = mainRows.map((row) => {
  const color = row.isPrime ? colors.prime : row.isNonsquarefree ? colors.nonsquarefree : colors.squarefree
  return `<circle cx="${x(row.n)}" cy="${y(row.residualLogGain)}" r="5" fill="${color}"><title>N=${row.n} residual=${row.residualLogGain}</title></circle>`
}).join('\n')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${pad}" y="38" fill="#f8fafc" font-size="22" font-weight="700">Nyman–Beurling Schur innovations</text>
<text x="${pad}" y="61" fill="#94a3b8" font-size="13">residual log distance gain after scale, pivot, and coefficient controls</text>
<line x1="${pad}" y1="${svgHeight / 2}" x2="${svgWidth - pad}" y2="${svgHeight / 2}" stroke="#475569"/>
${points}
<text x="${svgWidth / 2}" y="${svgHeight - 20}" text-anchor="middle" fill="#cbd5e1" font-size="14">new dilation index N</text>
</svg>`

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'schur-pilot.json'), `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(path.join(outDir, 'schur-pilot.md'), markdown)
fs.writeFileSync(path.join(outDir, 'schur-pilot.svg'), svg)
console.log(`[nyman] strongest ${strongest.name}: z=${fmt(strongest.full.z, 3)}, final z=${fmt(strongest.finalThird.z, 3)}`)
console.log(`[nyman] ${report.verdict}`)
