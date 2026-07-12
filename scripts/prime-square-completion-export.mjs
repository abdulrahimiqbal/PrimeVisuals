#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  buildStrictPrimeSquareAtoms,
  logIntegerPartition,
  mixedDifferenceKernelMatrix,
  shiftPolynomialCrossGram,
  shiftedCellCrossGram,
} from '../src/core/primeSquareCompletion.js'
import { buildWeilScrewEvaluator } from '../src/core/weilScrew.js'

const horizons = [8, 12, 18, 26, 10, 15, 22, 30]
const discovery = new Set([8, 12, 18, 26])
const outDir = 'logs/prime-square-completion/problems'

const maxAbs = (matrix) => Math.max(...matrix.flatMap((row) => row.map(Math.abs)))
const maxAbsDifference = (left, right) => Math.max(...left.flatMap(
  (row, rowIndex) => row.map((value, columnIndex) => Math.abs(value - right[rowIndex][columnIndex])),
))
const add = (left, right) => left.map(
  (row, rowIndex) => row.map((value, columnIndex) => value + right[rowIndex][columnIndex]),
)
const scale = (matrix, scalar) => matrix.map((row) => row.map((value) => scalar * value))

const primesBelow = (maximum) => {
  const prime = new Uint8Array(maximum)
  prime.fill(1)
  prime[0] = 0
  prime[1] = 0
  for (let p = 2; p * p < maximum; p += 1) {
    if (!prime[p]) continue
    for (let multiple = p * p; multiple < maximum; multiple += p) prime[multiple] = 0
  }
  return Array.from({ length: maximum }, (_, value) => value).filter((value) => prime[value])
}

const edgeTerms = (p) => [
  { shift: 0, coefficient: 1 },
  { shift: Math.log(p), coefficient: -1 },
]
const squareTerms = (p, q) => [
  { shift: 0, coefficient: 1 },
  { shift: Math.log(p), coefficient: -1 },
  { shift: Math.log(q), coefficient: -1 },
  { shift: Math.log(p * q), coefficient: 1 },
]

fs.mkdirSync(outDir, { recursive: true })
const manifest = []
for (const N of horizons) {
  const partition = logIntegerPartition(N)
  const evaluator = buildWeilScrewEvaluator(Math.log(N))
  const target = mixedDifferenceKernelMatrix(evaluator.evaluate, partition)
  const primeKernel = mixedDifferenceKernelMatrix(evaluator.evaluatePrimePower, partition)
  let strain = target.map((row) => row.map(() => 0))
  const primes = primesBelow(N)
  const primePowers = []
  for (const p of primes) {
    for (let power = p, exponent = 1; power < N; exponent += 1) {
      const weight = Math.log(p) / Math.sqrt(power)
      const shift = Math.log(power)
      strain = add(strain, scale(add(
        shiftedCellCrossGram(partition, 0, shift),
        shiftedCellCrossGram(partition, shift, 0),
      ), weight))
      primePowers.push({ p, exponent, value: power, weight })
      if (power > (N - 1) / p) break
      power *= p
    }
  }

  const strict = buildStrictPrimeSquareAtoms(N)
  const boundary = strict.atoms.find((atom) => atom.name === 'boundary:identity')
  const edges = strict.atoms.filter((atom) => atom.name.startsWith('edge:'))
  const squares = strict.atoms.filter((atom) => atom.name.startsWith('square:'))
  const pairs = []
  for (let left = 0; left < primes.length; left += 1) {
    for (let right = left + 1; right < primes.length; right += 1) {
      const p = primes[left]
      const q = primes[right]
      if (p * q >= N) continue
      const operators = [edgeTerms(p), edgeTerms(q), squareTerms(p, q)]
      const cross = operators.map((leftTerms) => operators.map(
        (rightTerms) => shiftPolynomialCrossGram(partition, leftTerms, rightTerms),
      ))
      pairs.push({ p, q, cross })
    }
  }

  const problem = {
    generatedAt: new Date().toISOString(),
    split: discovery.has(N) ? 'discovery' : 'holdout',
    N,
    dimension: N - 1,
    partition,
    primes,
    primePowers,
    target,
    normalization: {
      strainPrimeError: maxAbsDifference(primeKernel, scale(strain, -1)),
      targetMaxAbs: maxAbs(target),
    },
    boundary,
    edges,
    squares,
    pairs,
  }
  const filename = `problem-N${N}.json`
  fs.writeFileSync(path.join(outDir, filename), `${JSON.stringify(problem)}\n`)
  manifest.push({
    N,
    split: problem.split,
    dimension: problem.dimension,
    primes: primes.length,
    squares: pairs.length,
    strainPrimeError: problem.normalization.strainPrimeError,
    file: filename,
  })
  console.log(`[prime-square-export] N=${N} d=${N - 1} pairs=${pairs.length} normalization=${problem.normalization.strainPrimeError.toExponential(3)}`)
}
fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify({ horizons, manifest }, null, 2)}\n`)
