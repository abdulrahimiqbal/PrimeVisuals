#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  brownianKernelMatrix,
  buildWeilScrewEvaluator,
  primeKnotDecomposition,
  screwKernelMatrix,
  symmetricEigenDecomposition,
  whitenKernelMatrix,
} from '../src/core/weilScrew.js'

const pilot = JSON.parse(fs.readFileSync('logs/weil-screw/prime-knot-pilot.json', 'utf8'))
const dimension = 28
const grids = ['uniform', 'chebyshev']
const evaluator = buildWeilScrewEvaluator(Math.max(...pilot.radii))
const outDir = 'logs/weil-screw'

const zeros = (rows, columns = rows) => Array.from({ length: rows }, () => Array(columns).fill(0))
const identity = (size) => Array.from(
  { length: size },
  (_, row) => Array.from({ length: size }, (__, column) => row === column ? 1 : 0),
)
const transpose = (matrix) => matrix[0].map((_, column) => matrix.map((row) => row[column]))
const multiply = (left, right) => {
  const output = zeros(left.length, right[0].length)
  for (let row = 0; row < left.length; row += 1) {
    for (let index = 0; index < right.length; index += 1) {
      for (let column = 0; column < right[0].length; column += 1) {
        output[row][column] += left[row][index] * right[index][column]
      }
    }
  }
  return output
}
const addScaled = (target, source, scale = 1) => {
  for (let row = 0; row < target.length; row += 1) {
    for (let column = 0; column < target.length; column += 1) target[row][column] += scale * source[row][column]
  }
  return target
}
const add = (left, right) => left.map(
  (row, rowIndex) => row.map((value, columnIndex) => value + right[rowIndex][columnIndex]),
)
const subtract = (left, right) => left.map(
  (row, rowIndex) => row.map((value, columnIndex) => value - right[rowIndex][columnIndex]),
)
const submatrix = (matrix, rowIndices, columnIndices) => rowIndices.map(
  (row) => columnIndices.map((column) => matrix[row][column]),
)

const choleskySolveMatrix = (matrix, rightHandSide) => {
  const size = matrix.length
  const lower = zeros(size)
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      let value = matrix[row][column]
      for (let index = 0; index < column; index += 1) value -= lower[row][index] * lower[column][index]
      if (row === column) {
        if (!(value > 1e-12)) throw new Error(`Schur positive block failed at ${row}: ${value}`)
        lower[row][column] = Math.sqrt(value)
      } else lower[row][column] = value / lower[column][column]
    }
  }
  const result = zeros(size, rightHandSide[0].length)
  for (let rhs = 0; rhs < rightHandSide[0].length; rhs += 1) {
    const y = Array(size).fill(0)
    for (let row = 0; row < size; row += 1) {
      let value = rightHandSide[row][rhs]
      for (let column = 0; column < row; column += 1) value -= lower[row][column] * y[column]
      y[row] = value / lower[row][row]
    }
    for (let row = size - 1; row >= 0; row -= 1) {
      let value = y[row]
      for (let column = row + 1; column < size; column += 1) value -= lower[column][row] * result[column][rhs]
      result[row][rhs] = value / lower[row][row]
    }
  }
  return result
}

const pointsFor = (radius, grid) => grid === 'uniform'
  ? Array.from({ length: dimension }, (_, index) => radius * (index + 1) / dimension)
  : Array.from({ length: dimension }, (_, index) => (
    radius * (1 - Math.cos(((index + 1) * Math.PI) / (dimension + 1))) / 2
  ))

const rows = []
for (const radius of pilot.radii) {
  for (const grid of grids) {
    console.error(`[weil-align] a=${radius.toFixed(4)} ${grid}`)
    const points = pointsFor(radius, grid)
    const reference = brownianKernelMatrix(points)
    const arch = screwKernelMatrix(evaluator.evaluateArchimedean, points)
    const triangular = zeros(dimension)
    let totalWeight = 0
    let knotCount = 0
    for (let n = 2; n <= Math.floor(Math.exp(radius) + 1e-12); n += 1) {
      if (evaluator.mangoldt[n] === 0) continue
      const weight = evaluator.mangoldt[n] / Math.sqrt(n)
      addScaled(triangular, primeKnotDecomposition(Math.log(n), points).triangularIncrement, weight)
      totalWeight += weight
      knotCount += 1
    }
    const whiteArch = whitenKernelMatrix(arch, reference).transformed
    const whiteTriangular = whitenKernelMatrix(triangular, reference).transformed
    const H = whiteArch.map(
      (row, rowIndex) => row.map((value, columnIndex) => value - (rowIndex === columnIndex ? 2 * totalWeight : 0)),
    )
    const decomposition = symmetricEigenDecomposition(H)
    const negative = decomposition.values.map((value, index) => ({ value, index }))
      .filter((item) => item.value < -1e-10)
    const positive = decomposition.values.map((value, index) => ({ value, index }))
      .filter((item) => item.value >= -1e-10)
    if (negative.length === 0) {
      const totalMin = symmetricEigenDecomposition(add(H, whiteTriangular)).values[0]
      rows.push({ radius, grid, knotCount, totalWeight, negativeDimension: 0, rawCoverage: Infinity, rawReserve: totalMin, schurReserve: totalMin, leakagePenalty: 0, totalMinimum: totalMin })
      continue
    }

    const eigenvectorsT = transpose(decomposition.vectors)
    const basisOrder = [...negative, ...positive].map((item) => item.index)
    const Q = transpose(basisOrder.map((index) => eigenvectorsT[index]))
    const MInBasis = multiply(multiply(transpose(Q), add(H, whiteTriangular)), Q)
    const negativeIndices = Array.from({ length: negative.length }, (_, index) => index)
    const positiveIndices = Array.from({ length: positive.length }, (_, index) => index + negative.length)
    const Mnn = submatrix(MInBasis, negativeIndices, negativeIndices)
    const deficit = negative.map((item) => -item.value)
    const normalizedRaw = Mnn.map((row, rowIndex) => row.map(
      (value, columnIndex) => value / Math.sqrt(deficit[rowIndex] * deficit[columnIndex]),
    ))
    const rawReserve = symmetricEigenDecomposition(normalizedRaw).values[0]
    const rawCoverage = rawReserve + 1

    let schur = Mnn
    if (positive.length) {
      const Mnp = submatrix(MInBasis, negativeIndices, positiveIndices)
      const Mpp = submatrix(MInBasis, positiveIndices, positiveIndices)
      const solved = choleskySolveMatrix(Mpp, transpose(Mnp))
      schur = subtract(Mnn, multiply(Mnp, solved))
    }
    const normalizedSchur = schur.map((row, rowIndex) => row.map(
      (value, columnIndex) => value / Math.sqrt(deficit[rowIndex] * deficit[columnIndex]),
    ))
    const schurReserve = symmetricEigenDecomposition(normalizedSchur).values[0]
    const totalMinimum = symmetricEigenDecomposition(add(H, whiteTriangular)).values[0]
    rows.push({
      radius,
      expRadius: Math.exp(radius),
      grid,
      knotCount,
      totalWeight,
      negativeDimension: negative.length,
      largestDeficit: Math.max(...deficit),
      rawCoverage,
      rawReserve,
      schurReserve,
      leakagePenalty: rawReserve - schurReserve,
      totalMinimum,
    })
  }
}

const finiteCells = rows.filter((row) => Number.isFinite(row.rawCoverage))
const gates = {
  rawCoverage: finiteCells.every((row) => row.rawCoverage > 1),
  schurReserve: finiteCells.every((row) => row.schurReserve > -1e-8),
  stableNegativeDimension: new Set(finiteCells.filter((row) => row.radius > 3).map((row) => row.negativeDimension)).size === 1,
}
const report = {
  generatedAt: new Date().toISOString(),
  dimension,
  grids,
  rows,
  gates,
  verdict: gates.rawCoverage && gates.schurReserve && gates.stableNegativeDimension
    ? 'FINITE GATES PASS / ALGEBRAICALLY TAUTOLOGICAL / NOT PROMOTED'
    : 'NO LOW-COMPLEXITY UNIFORM FRAME-COVERAGE LAW YET',
}

const fmt = (value, digits = 6) => value === Infinity ? 'INF' : Number.isFinite(value) ? value.toFixed(digits) : 'NA'
const table = rows.map((row) =>
  `| ${fmt(row.radius, 4)} | ${row.grid} | ${row.knotCount} | ${row.negativeDimension} | ${fmt(row.rawCoverage)} | ${fmt(row.schurReserve)} | ${fmt(row.leakagePenalty)} | ${fmt(row.totalMinimum)} |`,
).join('\n')
const markdown = `# Localized Weil prime-frame alignment audit

Generated: ${report.generatedAt}

| a | grid | knots | negative dim | raw coverage | Schur reserve | leakage | total min |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
${table}

Gates:

- triangular frame covers the raw archimedean/Brownian deficit: ${gates.rawCoverage ? 'PASS' : 'FAIL'}
- reserve survives exact positive-subspace leakage: ${gates.schurReserve ? 'PASS' : 'FAIL'}
- negative dimension stabilizes for a>3: ${gates.stableNegativeDimension ? 'PASS' : 'FAIL'}

The Schur reserve is a finite identity-level diagnostic.  In the full-negative
regime, coverage above one is algebraically equivalent to sampled positivity;
at smaller radii the Schur complement is again an exact positivity test.  See
\`ALIGNMENT_NOVELTY_AUDIT.md\`.

Verdict: **${report.verdict}**.
`

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'alignment-audit.json'), `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(path.join(outDir, 'alignment-audit.md'), markdown)
console.log(`[weil-align] raw coverage ${gates.rawCoverage ? 'PASS' : 'FAIL'}`)
console.log(`[weil-align] Schur reserve ${gates.schurReserve ? 'PASS' : 'FAIL'}`)
console.log(`[weil-align] stable negative dimension ${gates.stableNegativeDimension ? 'PASS' : 'FAIL'}`)
console.log(`[weil-align] ${report.verdict}`)
