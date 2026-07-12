#!/usr/bin/env node

import { primesUpTo } from '../src/core/math.js'

const maxN = Math.max(100, Number.parseInt(process.argv[2] || '20000', 10))
const parameters = Array.from({ length: 11 }, (_, index) => index + 3)
const endpoints = [
  Math.max(100, Math.round(maxN / 4)),
  Math.max(100, Math.round(maxN / 2)),
  maxN,
]
const seeds = [12345, 271828, 314159, 161803, 424242, 8675309, 11235813]

const mod = (value, modulus) => {
  const residue = value % modulus
  return residue < 0 ? residue + modulus : residue
}

const gcd = (left, right) => {
  let a = left < 0n ? -left : left
  let b = right < 0n ? -right : right
  while (b) [a, b] = [b, a % b]
  return a
}

const rationalJInvariant = (lambda) => {
  const value = BigInt(lambda)
  const numerator = 256n * (1n - value + value * value) ** 3n
  const denominator = value * value * (1n - value) ** 2n
  const divisor = gcd(numerator, denominator)
  return {
    lambda,
    numerator: (numerator / divisor).toString(),
    denominator: (denominator / divisor).toString(),
    nonIntegralHenceNonCm: denominator / divisor !== 1n,
  }
}

const rng = (seed) => {
  let state = seed >>> 0
  return () => {
    state |= 0
    state = (state + 0x6D2B79F5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const quadraticCharacterTable = (prime) => {
  const table = new Int8Array(prime)
  table.fill(-1)
  table[0] = 0
  for (let value = 1; value <= (prime - 1) >> 1; value += 1) {
    table[(value * value) % prime] = 1
  }
  return table
}

const legendreTrace = (prime, lambda, character) => {
  let trace = 0
  for (let x = 0; x < prime; x += 1) {
    trace -= character[mod(x * (x - 1) * (x - lambda), prime)]
  }
  return trace
}

const isSpecialReduction = (lambda, prime) => (
  mod(
    (lambda + 1)
    * (lambda - 2)
    * (2 * lambda - 1)
    * (lambda * lambda - lambda + 1),
    prime,
  ) === 0
)

const score = (values, endpointCounts) => {
  let cursor = 0
  let sum = 0
  let energy = 0
  let maxAbsZ = 0
  return endpointCounts.map((count, index) => {
    while (cursor < count) {
      const value = values[cursor]
      cursor += 1
      sum += value
      energy += value * value
      maxAbsZ = Math.max(maxAbsZ, Math.abs(sum / Math.sqrt(cursor)))
    }
    return {
      endpoint: endpoints[index],
      count: cursor,
      mean: sum / cursor,
      z: sum / Math.sqrt(cursor),
      energyZ: sum / Math.sqrt(energy),
      maxAbsZ,
    }
  })
}

const summarize = (runs) => {
  const finals = runs.map((run) => run.at(-1))
  const range = (values) => [Math.min(...values), Math.max(...values)]
  return {
    absZRange: range(finals.map((row) => Math.abs(row.z))),
    maxAbsZRange: range(finals.map((row) => row.maxAbsZ)),
    energyZRange: range(finals.map((row) => row.energyZ)),
  }
}

const records = []
for (const prime of primesUpTo(maxN)) {
  if (prime < 5) continue
  const character = quadraticCharacterTable(prime)
  let traceSum = 0
  let good = 0
  let specialReductionsRemoved = 0
  for (const rawParameter of parameters) {
    const lambda = rawParameter % prime
    if (lambda === 0 || lambda === 1) continue
    if (isSpecialReduction(lambda, prime)) {
      specialReductionsRemoved += 1
      continue
    }
    traceSum += legendreTrace(prime, lambda, character)
    good += 1
  }
  if (!good) continue
  records.push({
    prime,
    good,
    specialReductionsRemoved,
    value: traceSum / Math.sqrt(prime * good),
  })
}

const values = records.map((record) => record.value)
const endpointCounts = endpoints.map(
  (endpoint) => records.filter((record) => record.prime <= endpoint).length,
)

const shuffleRuns = seeds.map((seed) => {
  const random = rng(seed)
  const shuffled = values.slice()
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]]
  }
  return score(shuffled, endpointCounts)
})

const signFlipRuns = seeds.map((seed) => {
  const random = rng(seed ^ 0x9e3779b9)
  return score(values.map((value) => (random() < 0.5 ? -value : value)), endpointCounts)
})

const bootstrapRuns = seeds.map((seed) => {
  const random = rng(seed ^ 0x517cc1b7)
  const sampled = Array.from(
    { length: values.length },
    () => values[Math.floor(random() * values.length)],
  )
  return score(sampled, endpointCounts)
})

const removedHistogram = Object.fromEntries(
  [...new Set(records.map((record) => record.specialReductionsRemoved))]
    .sort((left, right) => left - right)
    .map((removed) => [
      removed,
      records.filter((record) => record.specialReductionsRemoved === removed).length,
    ]),
)

const completeMomentCells = []
for (const prime of primesUpTo(Math.min(maxN, 97))) {
  if (prime < 5) continue
  const character = quadraticCharacterTable(prime)
  let firstMoment = 0
  let secondMoment = 0
  let specialSecondMoment = 0
  for (let lambda = 2; lambda < prime; lambda += 1) {
    const trace = legendreTrace(prime, lambda, character)
    firstMoment += trace
    secondMoment += trace * trace
    if (isSpecialReduction(lambda, prime)) specialSecondMoment += trace * trace
  }
  const expectedFirstMoment = -1 - character[prime - 1]
  const expectedSecondMoment = prime * prime - 2 * prime - 3
  completeMomentCells.push({
    prime,
    firstMoment,
    expectedFirstMoment,
    secondMoment,
    expectedSecondMoment,
    specialSecondMoment,
    genericSecondMoment: secondMoment - specialSecondMoment,
    pass: firstMoment === expectedFirstMoment && secondMoment === expectedSecondMoment,
  })
}

const report = {
  candidate: 'generic non-CM Legendre fixed window after special-reduction excision',
  maxN,
  endpoints,
  parameters,
  rationalJInvariants: parameters.map(rationalJInvariant),
  exactExcision: '(lambda+1)(lambda-2)(2lambda-1)(lambda^2-lambda+1)=0 mod p',
  skippedPrimeCount: primesUpTo(maxN).filter((prime) => prime >= 5).length - records.length,
  removedHistogram,
  completeMomentCheck: {
    checkedThrough: Math.min(maxN, 97),
    allPass: completeMomentCells.every((cell) => cell.pass),
    cells: completeMomentCells,
  },
  rows: score(values, endpointCounts),
  controls: {
    shuffle: summarize(shuffleRuns),
    signFlip: summarize(signFlipRuns),
    bootstrap: summarize(bootstrapRuns),
  },
}

console.log(JSON.stringify(report, null, 2))
