#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  brownianKernelMatrix,
  buildWeilScrewEvaluator,
  generalizedKernelEigenvalues,
  primeKnotDecomposition,
  screwKernelMatrix,
} from '../src/core/weilScrew.js'

const maximumPrimePower = 1_000
const dimensions = [12, 20, 28]
const gridNames = ['uniform', 'chebyshev']
const selectedKnots = [2, 3, 4, 5, 7, 11, 16, 25, 49, 97, 211, 499, 997]
const radii = [0.4, 0.6, ...selectedKnots.flatMap((n) => [
  Math.max(0.05, Math.log(n) - 0.015),
  Math.log(n) + 0.015,
])].sort((left, right) => left - right)
const maximumRadius = Math.max(...radii)
const outDir = 'logs/weil-screw'
const evaluator = buildWeilScrewEvaluator(maximumRadius)

const zeros = (size) => Array.from({ length: size }, () => Array(size).fill(0))
const addScaled = (target, source, scale = 1) => {
  for (let row = 0; row < target.length; row += 1) {
    for (let column = 0; column < target.length; column += 1) {
      target[row][column] += scale * source[row][column]
    }
  }
  return target
}

const maxAbsDifference = (left, right) => Math.max(...left.flatMap(
  (row, rowIndex) => row.map((value, columnIndex) => Math.abs(value - right[rowIndex][columnIndex])),
))

const pointsFor = (radius, dimension, grid) => {
  if (grid === 'uniform') {
    return Array.from({ length: dimension }, (_, index) => radius * (index + 1) / dimension)
  }
  return Array.from({ length: dimension }, (_, index) => (
    radius * (1 - Math.cos(((index + 1) * Math.PI) / (dimension + 1))) / 2
  ))
}

const rows = []
for (const radius of radii) {
  for (const dimension of dimensions) {
    for (const grid of gridNames) {
      console.error(`[weil-screw] a=${radius.toFixed(4)} d=${dimension} ${grid}`)
      const points = pointsFor(radius, dimension, grid)
      const reference = brownianKernelMatrix(points)
      const total = screwKernelMatrix(evaluator.evaluate, points)
      const archimedean = screwKernelMatrix(evaluator.evaluateArchimedean, points)
      const primeDirect = screwKernelMatrix(evaluator.evaluatePrimePower, points)
      const primeFromKnots = zeros(dimension)
      const triangular = zeros(dimension)
      let totalWeight = 0
      const activeKnots = []
      for (let n = 2; n <= Math.floor(Math.exp(radius) + 1e-12); n += 1) {
        const mangoldt = evaluator.mangoldt[n]
        if (mangoldt === 0) continue
        const weight = mangoldt / Math.sqrt(n)
        const pieces = primeKnotDecomposition(Math.log(n), points)
        addScaled(primeFromKnots, pieces.brownian, weight)
        addScaled(primeFromKnots, pieces.triangularIncrement, weight)
        addScaled(triangular, pieces.triangularIncrement, weight)
        totalWeight += weight
        activeKnots.push({ n, weight })
      }
      const reconstructed = archimedean.map(
        (row, rowIndex) => row.map((value, columnIndex) => value + primeFromKnots[rowIndex][columnIndex]),
      )
      const totalSpectrum = generalizedKernelEigenvalues(total, reference)
      const archSpectrum = generalizedKernelEigenvalues(archimedean, reference)
      const primeSpectrum = generalizedKernelEigenvalues(primeDirect, reference)
      const triangularSpectrum = activeKnots.length
        ? generalizedKernelEigenvalues(triangular, reference)
        : Array(dimension).fill(0)
      const simpleLowerBound = archSpectrum[0] + triangularSpectrum[0] - 2 * totalWeight
      rows.push({
        radius,
        expRadius: Math.exp(radius),
        dimension,
        grid,
        activeKnotCount: activeKnots.length,
        lastKnot: activeKnots.at(-1)?.n ?? null,
        totalWeight,
        totalMinimum: totalSpectrum[0],
        totalMaximum: totalSpectrum.at(-1),
        archimedeanMinimum: archSpectrum[0],
        primeMinimum: primeSpectrum[0],
        primeMaximum: primeSpectrum.at(-1),
        triangularMinimum: triangularSpectrum[0],
        triangularMaximum: triangularSpectrum.at(-1),
        brownianRelief: 2 * totalWeight,
        simpleLowerBound,
        alignmentSurplus: totalSpectrum[0] - simpleLowerBound,
        decompositionError: maxAbsDifference(total, reconstructed),
        primeDecompositionError: maxAbsDifference(primeDirect, primeFromKnots),
      })
    }
  }
}

const grouped = new Map()
for (const row of rows) {
  const key = row.radius.toPrecision(14)
  if (!grouped.has(key)) grouped.set(key, [])
  grouped.get(key).push(row)
}
const radiusSummary = [...grouped.values()].map((group) => ({
  radius: group[0].radius,
  expRadius: group[0].expRadius,
  lastKnot: group[0].lastKnot,
  minimumAcrossBases: Math.min(...group.map((row) => row.totalMinimum)),
  maximumAcrossBases: Math.max(...group.map((row) => row.totalMinimum)),
  simpleBoundMinimum: Math.min(...group.map((row) => row.simpleLowerBound)),
  alignmentSurplusMinimum: Math.min(...group.map((row) => row.alignmentSurplus)),
}))

const decompositionPass = rows.every((row) => row.decompositionError < 2e-10
  && row.primeDecompositionError < 2e-10)
const finitePositivity = rows.every((row) => row.totalMinimum > -2e-8)
const simpleDominationPass = rows.every((row) => row.simpleLowerBound >= -2e-8)
const report = {
  generatedAt: new Date().toISOString(),
  maximumPrimePower,
  dimensions,
  gridNames,
  radii,
  rows,
  radiusSummary,
  gates: { decompositionPass, finitePositivity, simpleDominationPass },
  verdict: simpleDominationPass
    ? 'LOW-COMPLEXITY DOMINATION SURVIVES FINITE PILOT; PROOF AND NOVELTY AUDIT REQUIRED'
    : 'FINITE POSITIVITY USES CROSS-EIGENSPACE ALIGNMENT; SIMPLE DOMINATION FAILS',
}

const fmt = (value, digits = 7) => Number.isFinite(value) ? value.toFixed(digits) : 'NA'
const table = radiusSummary.map((row) =>
  `| ${fmt(row.radius, 4)} | ${fmt(row.expRadius, 2)} | ${row.lastKnot ?? 'none'} | ${fmt(row.minimumAcrossBases)} | ${fmt(row.maximumAcrossBases)} | ${fmt(row.simpleBoundMinimum)} | ${fmt(row.alignmentSurplusMinimum)} |`,
).join('\n')
const markdown = `# Weil screw prime-knot operator pilot

Generated: ${report.generatedAt}

This pilot evaluates Suzuki's explicit continuous screw kernel using only the
archimedean formula and prime powers. It also verifies the identity
\`K_(|t|-c)+ = -2 Brownian + triangular increment\` knot by knot.

- decomposition gate: ${decompositionPass ? 'PASS' : 'FAIL'}
- finite sampled positivity: ${finitePositivity ? 'PASS' : 'FAIL'}
- simple eigenvalue-wise domination: ${simpleDominationPass ? 'PASS' : 'FAIL'}

The simple bound is

\`lambda_min(arch) + lambda_min(triangular sum) - 2 sum Lambda(n)/sqrt(n)\`.

If it is negative while the total kernel stays positive, positivity depends on
alignment between the archimedean and triangular eigenspaces. That rules out
the simplest termwise proof and identifies the next invariant: the joint
angle/commutator structure of those two positive operators.

| a | exp(a) | last knot | min margin | max margin | simple lower bound | alignment surplus |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${table}

Verdict: **${report.verdict}**.
`

const width = 1100
const height = 680
const pad = 75
const minRadius = Math.min(...radiusSummary.map((row) => row.radius))
const maxRadius = Math.max(...radiusSummary.map((row) => row.radius))
const values = radiusSummary.flatMap((row) => [row.minimumAcrossBases, row.simpleBoundMinimum])
const minValue = Math.min(...values)
const maxValue = Math.max(...values)
const x = (value) => pad + ((value - minRadius) / (maxRadius - minRadius)) * (width - 2 * pad)
const y = (value) => height - pad - ((value - minValue) / (maxValue - minValue)) * (height - 2 * pad)
const pathFor = (field) => radiusSummary.map(
  (row, index) => `${index ? 'L' : 'M'}${x(row.radius)},${y(row[field])}`,
).join(' ')
const zeroY = y(0)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="${pad}" y="40" fill="#f8fafc" font-size="22" font-weight="700">Weil screw operator margin</text>
<text x="${pad}" y="64" fill="#94a3b8" font-size="13">Brownian-normalized finite sections across prime-power knots</text>
<line x1="${pad}" y1="${zeroY}" x2="${width - pad}" y2="${zeroY}" stroke="#64748b" stroke-dasharray="7 6"/>
<path d="${pathFor('minimumAcrossBases')}" fill="none" stroke="#34d399" stroke-width="3"/>
<path d="${pathFor('simpleBoundMinimum')}" fill="none" stroke="#f59e0b" stroke-width="3"/>
<text x="${width - 300}" y="40" fill="#34d399" font-size="13">sampled total minimum</text>
<text x="${width - 300}" y="60" fill="#f59e0b" font-size="13">termwise lower bound</text>
<text x="${width / 2}" y="${height - 20}" text-anchor="middle" fill="#cbd5e1" font-size="14">support radius a</text>
</svg>`

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'prime-knot-pilot.json'), `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(path.join(outDir, 'prime-knot-pilot.md'), markdown)
fs.writeFileSync(path.join(outDir, 'prime-knot-pilot.svg'), svg)
console.log(`[weil-screw] decomposition ${decompositionPass ? 'PASS' : 'FAIL'}`)
console.log(`[weil-screw] finite positivity ${finitePositivity ? 'PASS' : 'FAIL'}`)
console.log(`[weil-screw] simple domination ${simpleDominationPass ? 'PASS' : 'FAIL'}`)
console.log(`[weil-screw] ${report.verdict}`)
