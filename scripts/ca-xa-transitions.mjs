#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { cramerPrimes, primesUpTo } from "../src/core/math.js";

const DEFAULT_INPUT = "logs/divisor-extremes-artifacts/b004394.txt";
const DEFAULT_OUTPUT = "logs/divisor-extremes-artifacts/ca-xa-transitions.json";
const DEFAULT_LIMIT = 8436;
const DEFAULT_SEEDS = [12345, 271828, 314159, 161803, 424242];
const GAMMA = 0.5772156649015329;
const E_GAMMA = Math.exp(GAMMA);
const FIRST_20_CA_XA = new Set([356, 368, 380, 394, 408, 409, 440, 444, 459, 476, 493, 502, 519, 537, 555]);

function liRange(a, b, steps = 2048) {
  const lo = Math.max(2, a), hi = Math.max(lo, b);
  const n = steps + (steps % 2);
  const h = (hi - lo) / n;
  let sum = 1 / Math.log(lo) + 1 / Math.log(hi);
  for (let i = 1; i < n; i++) {
    const x = lo + i * h;
    sum += (i % 2 ? 4 : 2) / Math.log(x);
  }
  return (h / 3) * sum;
}

function logBigInt(n) {
  const s = n.toString();
  if (s.length < 300) return Math.log(Number(n));
  const head = Number(`${s.slice(0, 18)}.${s.slice(18, 34)}`);
  return Math.log(head) + (s.length - 18) * Math.LN10;
}

function parseBFile(text, limit) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const explicit = /^(\d+)\s+(\d+)$/.exec(line);
      if (explicit) return { index: Number(explicit[1]), n: BigInt(explicit[2]), source: "explicit" };
      const compact = /^#\s+(\d+)\s+(\S+)$/.exec(line);
      if (!compact) return null;
      const factor = parseFactoredExpression(compact[2]);
      return { index: Number(compact[1]), expression: compact[2], source: "factored", ...factor };
    })
    .filter(Boolean)
    .filter((row) => row.index <= limit);
}

function addFactor(map, p, exp) {
  map.set(p, (map.get(p) || 0) + exp);
}

function addPrimorial(map, n) {
  for (const p of primesUpTo(n)) addFactor(map, p, 1);
}

function addFactorial(map, n) {
  for (const p of primesUpTo(n)) {
    let exp = 0;
    for (let q = p; q <= n; q *= p) exp += Math.floor(n / q);
    addFactor(map, p, exp);
  }
}

function addInteger(map, n) {
  let m = n;
  for (const p of primesUpTo(Math.floor(Math.sqrt(n)) + 1)) {
    while (m % p === 0) {
      addFactor(map, p, 1);
      m = Math.floor(m / p);
    }
  }
  if (m > 1) addFactor(map, m, 1);
}

function parseFactoredExpression(expr) {
  const exponentsByPrime = new Map();
  let pos = 0;
  while (pos < expr.length) {
    const match = /^(\d+)([#!]?)/.exec(expr.slice(pos));
    if (!match) throw new Error(`cannot parse compact factor expression ${expr} at ${pos}`);
    const value = Number(match[1]);
    const marker = match[2];
    if (marker === "#") addPrimorial(exponentsByPrime, value);
    else if (marker === "!") addFactorial(exponentsByPrime, value);
    else addInteger(exponentsByPrime, value);
    pos += match[0].length;
  }
  const factors = [...exponentsByPrime.keys()].sort((a, b) => a - b);
  const exponents = factors.map((p) => exponentsByPrime.get(p));
  const logN = factors.reduce((s, p, i) => s + exponents[i] * Math.log(p), 0);
  return { factors, exponents, logN, frontier: factors[factors.length - 1] || 1 };
}

function factorPrefix(n, primes) {
  let m = n;
  const factors = [];
  const exponents = [];
  for (const p of primes) {
    if (m === 1n) break;
    const bp = BigInt(p);
    let exp = 0;
    while (m % bp === 0n) {
      m /= bp;
      exp++;
    }
    if (exp === 0 && exponents.length > 0) break;
    if (exp > 0) {
      factors.push(p);
      exponents.push(exp);
    }
  }
  if (m !== 1n) throw new Error(`factorization incomplete; remaining factor ${m}`);
  return { factors, exponents, frontier: factors[factors.length - 1] || 1 };
}

function sigmaOverN(factors, exponents) {
  let product = 1;
  for (let i = 0; i < factors.length; i++) {
    const p = factors[i], a = exponents[i];
    product *= (1 - Math.pow(p, -(a + 1))) / (1 - 1 / p);
  }
  return product;
}

function frontierFunction(x, k) {
  let denom = 0;
  for (let i = 1; i <= k; i++) denom += x ** i;
  return Math.log(1 + 1 / denom) / Math.log(x);
}

function nextBaseAfter(bases, x) {
  for (const b of bases) if (b > x) return b;
  return null;
}

function previousBaseAtOrBelow(bases, x) {
  let previous = null;
  for (const b of bases) {
    if (b > x) return previous;
    previous = b;
  }
  return previous;
}

function countBasesInOpenClosed(bases, lo, hi) {
  if (!(hi > lo)) return 0;
  let count = 0;
  for (const b of bases) {
    if (b > hi) break;
    if (b > lo) count++;
  }
  return count;
}

function caInterval(factors, exponents, bases) {
  let lower = 0;
  let upper = Infinity;
  for (let i = 0; i < factors.length; i++) {
    const q = factors[i], a = exponents[i];
    upper = Math.min(upper, frontierFunction(q, a));
    lower = Math.max(lower, frontierFunction(q, a + 1));
  }
  const next = nextBaseAfter(bases, factors[factors.length - 1] || 1);
  if (next) lower = Math.max(lower, frontierFunction(next, 1));
  const width = upper - lower;
  return { lower, upper, width, isCA: width >= -1e-15 };
}

function scanRows(rows) {
  const maxLog = Math.max(...rows.map((r) => r.logN ?? logBigInt(r.n)));
  const maxFrontier = Math.max(...rows.map((r) => r.frontier || 1));
  const bases = primesUpTo(Math.ceil(Math.max(maxLog * 4, maxFrontier + 200)));
  const scanned = rows.map((row) => {
    const factor = row.factors ? { factors: row.factors, exponents: row.exponents, frontier: row.frontier } : factorPrefix(row.n, bases);
    const logN = row.logN ?? logBigInt(row.n);
    const ratio = sigmaOverN(factor.factors, factor.exponents);
    const interval = caInterval(factor.factors, factor.exponents, bases);
    return {
      index: row.index,
      n: row.n ? row.n.toString() : row.expression,
      source: row.source,
      logN,
      sigmaOverN: ratio,
      f: ratio / Math.log(logN),
      robinRatio: ratio / Math.log(logN) / E_GAMMA,
      ...factor,
      ca: interval.isCA,
      caInterval: interval,
    };
  });
  const xa = recordRows(scanned);
  return { scanned, xa, bases };
}

function recordRows(rows) {
  const records = [];
  let best = -Infinity;
  for (const row of rows) {
    if (row.n === "10080" || (row.logN > Math.log(10080) && row.f > best * (1 + 1e-14))) {
      records.push(row);
      best = Math.max(best, row.f);
    }
  }
  return records;
}

function compact(row) {
  return row && {
    index: row.index,
    logN: row.logN,
    f: row.f,
    frontier: row.frontier,
    ca: row.ca,
    exponents: row.exponents,
  };
}

function quotientSignature(from, to, bases = null) {
  const exponents = new Map();
  for (let i = 0; i < from.factors.length; i++) exponents.set(from.factors[i], -(from.exponents[i] || 0));
  for (let i = 0; i < to.factors.length; i++) exponents.set(to.factors[i], (exponents.get(to.factors[i]) || 0) + (to.exponents[i] || 0));
  const numerator = [];
  const denominator = [];
  for (const [p, delta] of [...exponents.entries()].sort((a, b) => a[0] - b[0])) {
    if (delta > 0) numerator.push({ p, exp: delta });
    else if (delta < 0) denominator.push({ p, exp: -delta });
  }
  const omega = numerator.reduce((sum, row) => sum + row.exp, 0);
  const kind = denominator.length
    ? "not-divisibility"
    : omega === 1
      ? "prime"
      : omega === 2 && numerator.length === 2
        ? "distinct-semiprime"
        : omega === 2
          ? "prime-square"
          : "higher";
  const sigmaRatio = to.sigmaOverN / from.sigmaOverN;
  const logSigmaGain = Math.log(sigmaRatio);
  const logLogPenalty = Math.log(Math.log(to.logN) / Math.log(from.logN));
  const logHeightRatio = Math.log(to.f / from.f);
  let primeStep = kind === "prime" && numerator.length === 1
    ? primeStepFormula(from, numerator[0].p, bases)
    : null;
  if (primeStep) primeStep = {
    ...primeStep,
    ...caBoundaryGlueDiagnostics(primeStep, from, to),
  };
  return {
    fromIndex: from.index,
    toIndex: to.index,
    fromFrontier: from.frontier,
    toFrontier: to.frontier,
    logQuotient: to.logN - from.logN,
    kind,
    omega,
    numerator,
    denominator,
    heightStep: {
      fDelta: to.f - from.f,
      relativeFDelta: to.f / from.f - 1,
      sigmaRatio,
      logSigmaGain,
      logLogPenalty,
      logHeightRatio,
      logGainMinusPenalty: logSigmaGain - logLogPenalty,
      identityError: logHeightRatio - (logSigmaGain - logLogPenalty),
      primeStep,
    },
  };
}

function primeStepFormula(from, p, bases = null) {
  const idx = from.factors.indexOf(p);
  const oldExponent = idx >= 0 ? from.exponents[idx] : 0;
  const localSigmaRatio = (1 - p ** (-(oldExponent + 2))) / (1 - p ** (-(oldExponent + 1)));
  const logLocalSigmaGain = Math.log(localSigmaRatio);
  const logLogPenalty = Math.log(Math.log(from.logN + Math.log(p)) / Math.log(from.logN));
  const criticalP = criticalPrimeThreshold(from.logN, oldExponent);
  const criticalAsymptotic = criticalPrimeAsymptotic(from.logN, oldExponent, criticalP);
  const caBoundaryEpsilon = frontierFunction(p, oldExponent + 1);
  const criticalCaBoundaryEpsilon = criticalP ? frontierFunction(criticalP, oldExponent + 1) : null;
  const newFrontierBoundaryTaylor = oldExponent === 0 && criticalP
    ? newFrontierLogBoundaryTaylor(criticalP, p)
    : {};
  const newFrontierApproxBoundary = oldExponent === 0 && criticalAsymptotic.secondOrderCriticalP
    ? newFrontierApproxBoundaryDiagnostics(criticalAsymptotic.secondOrderCriticalP, p)
    : {};
  const newFrontierBaseGap = oldExponent === 0 && bases && criticalAsymptotic.secondOrderCriticalP
    ? newFrontierBaseGapDiagnostics(from, p, criticalAsymptotic.secondOrderCriticalP, bases)
    : {};
  return {
    p,
    oldExponent,
    newExponent: oldExponent + 1,
    caBoundaryEpsilon,
    criticalCaBoundaryEpsilon,
    caBoundaryRatioToCritical: criticalCaBoundaryEpsilon ? caBoundaryEpsilon / criticalCaBoundaryEpsilon : null,
    caBoundaryLogDeltaToCritical: criticalCaBoundaryEpsilon ? Math.log(caBoundaryEpsilon / criticalCaBoundaryEpsilon) : null,
    caBoundaryLogNScale: oldExponent === 0 ? caBoundaryEpsilon * from.logN * Math.log(from.logN) : null,
    criticalCaBoundaryLogNScale: oldExponent === 0 && criticalCaBoundaryEpsilon
      ? criticalCaBoundaryEpsilon * from.logN * Math.log(from.logN)
      : null,
    ...newFrontierBoundaryTaylor,
    ...newFrontierApproxBoundary,
    ...newFrontierBaseGap,
    localSigmaRatio,
    logLocalSigmaGain,
    logLogPenalty,
    logGainMinusPenalty: logLocalSigmaGain - logLogPenalty,
    primeMinusLogN: p - from.logN,
    criticalP,
    criticalDelta: criticalP ? p - criticalP : null,
    criticalRatio: criticalP ? p / criticalP : null,
    criticalLogDelta: criticalP ? Math.log(p / criticalP) : null,
    criticalMinusLogN: criticalP ? criticalP - from.logN : null,
    ...criticalAsymptotic,
  };
}

function newFrontierBaseGapDiagnostics(from, p, secondOrderCriticalP, bases) {
  const previousAtP2 = previousBaseAtOrBelow(bases, secondOrderCriticalP);
  const nextAfterP2 = nextBaseAfter(bases, secondOrderCriticalP);
  const nextAfterFrontier = nextBaseAfter(bases, from.frontier);
  const basesBeforeThreshold = countBasesInOpenClosed(bases, from.frontier, secondOrderCriticalP);
  const thresholdLi = secondOrderCriticalP > from.frontier ? liRange(from.frontier, secondOrderCriticalP) : 0;
  return {
    newFrontierNextBase: nextAfterFrontier,
    newFrontierNextBaseMatches: nextAfterFrontier === p,
    previousBaseAtSecondOrderThreshold: previousAtP2,
    nextBaseAfterSecondOrderThreshold: nextAfterP2,
    nextBaseAfterSecondOrderMatchesStepPrime: nextAfterP2 === p,
    basesBeforeSecondOrderThreshold: basesBeforeThreshold,
    noBaseBeforeSecondOrderThreshold: basesBeforeThreshold === 0,
    secondOrderThresholdMinusFrontier: secondOrderCriticalP - from.frontier,
    nextBaseGapFromFrontier: p - from.frontier,
    secondOrderGapOvershoot: p - secondOrderCriticalP,
    secondOrderThresholdLiFromFrontier: thresholdLi,
    noBaseBeforeSecondOrderExpectedCount: thresholdLi,
  };
}

function newFrontierLogBoundaryDerivative(x) {
  return -1 / ((x ** 2 + x) * Math.log(1 + 1 / x)) - 1 / (x * Math.log(x));
}

function newFrontierLogBoundarySecondDerivative(x) {
  const h = Math.max(1e-4, x * 1e-5);
  const lo = Math.max(1 + 1e-9, x - h);
  const hi = x + h;
  return (newFrontierLogBoundaryDerivative(hi) - newFrontierLogBoundaryDerivative(lo)) / (hi - lo);
}

function newFrontierLogBoundaryTaylor(criticalP, p) {
  const delta = p - criticalP;
  const firstDerivative = newFrontierLogBoundaryDerivative(criticalP);
  const secondDerivative = newFrontierLogBoundarySecondDerivative(criticalP);
  const firstOrder = firstDerivative * delta;
  const secondOrder = firstOrder + 0.5 * secondDerivative * delta ** 2;
  const exact = Math.log(frontierFunction(p, 1) / frontierFunction(criticalP, 1));
  return {
    caBoundaryDerivativeAtCritical: firstDerivative,
    caBoundarySecondDerivativeAtCritical: secondDerivative,
    caBoundaryTaylorFirstOrderLogDelta: firstOrder,
    caBoundaryTaylorSecondOrderLogDelta: secondOrder,
    caBoundaryTaylorFirstOrderError: firstOrder - exact,
    caBoundaryTaylorSecondOrderError: secondOrder - exact,
  };
}

function newFrontierApproxBoundaryDiagnostics(center, p) {
  const caBoundaryEpsilon = frontierFunction(p, 1);
  const centerBoundaryEpsilon = frontierFunction(center, 1);
  const delta = p - center;
  const firstDerivative = newFrontierLogBoundaryDerivative(center);
  const secondDerivative = newFrontierLogBoundarySecondDerivative(center);
  const exact = Math.log(caBoundaryEpsilon / centerBoundaryEpsilon);
  const firstOrder = firstDerivative * delta;
  const secondOrder = firstOrder + 0.5 * secondDerivative * delta ** 2;
  return {
    secondOrderCaBoundaryEpsilon: centerBoundaryEpsilon,
    caBoundaryRatioToSecondOrder: caBoundaryEpsilon / centerBoundaryEpsilon,
    caBoundaryLogDeltaToSecondOrder: exact,
    secondOrderCenterDelta: delta,
    secondOrderCenterBoundaryTaylorFirstOrderLogDelta: firstOrder,
    secondOrderCenterBoundaryTaylorSecondOrderLogDelta: secondOrder,
    secondOrderCenterBoundaryTaylorFirstOrderError: firstOrder - exact,
    secondOrderCenterBoundaryTaylorSecondOrderError: secondOrder - exact,
  };
}

function caBoundaryGlueDiagnostics(primeStep, from, to) {
  const eps = primeStep.caBoundaryEpsilon;
  return {
    fromCaIntervalLower: from.caInterval?.lower,
    fromCaIntervalUpper: from.caInterval?.upper,
    toCaIntervalLower: to.caInterval?.lower,
    toCaIntervalUpper: to.caInterval?.upper,
    caBoundaryMinusFromLower: Number.isFinite(eps) && Number.isFinite(from.caInterval?.lower)
      ? eps - from.caInterval.lower
      : null,
    caBoundaryMinusToUpper: Number.isFinite(eps) && Number.isFinite(to.caInterval?.upper)
      ? eps - to.caInterval.upper
      : null,
  };
}

function primeStepMarginAt(logN, oldExponent, p) {
  const localSigmaRatio = (1 - p ** (-(oldExponent + 2))) / (1 - p ** (-(oldExponent + 1)));
  return Math.log(localSigmaRatio) - Math.log(Math.log(logN + Math.log(p)) / Math.log(logN));
}

function criticalPrimeThreshold(logN, oldExponent) {
  if (!(logN > 1)) return null;
  let lo = 1 + 1e-9;
  let hi = 2;
  let loMargin = primeStepMarginAt(logN, oldExponent, lo);
  let hiMargin = primeStepMarginAt(logN, oldExponent, hi);
  if (!Number.isFinite(loMargin)) return null;
  while (Number.isFinite(hiMargin) && hiMargin > 0 && hi < 1e12) {
    lo = hi;
    loMargin = hiMargin;
    hi *= 2;
    hiMargin = primeStepMarginAt(logN, oldExponent, hi);
  }
  if (!Number.isFinite(hiMargin) || loMargin < 0 || hiMargin > 0) return null;
  for (let i = 0; i < 80; i++) {
    const mid = Math.sqrt(lo * hi);
    const midMargin = primeStepMarginAt(logN, oldExponent, mid);
    if (!Number.isFinite(midMargin)) return null;
    if (midMargin > 0) lo = mid;
    else hi = mid;
  }
  return Math.sqrt(lo * hi);
}

function lambertWPositive(x) {
  if (!(x >= 0) || !Number.isFinite(x)) return null;
  if (x === 0) return 0;
  let w = x < Math.E ? Math.log1p(x) : Math.log(x) - Math.log(Math.log(x));
  if (!(w > 0)) w = Math.log1p(x);
  for (let i = 0; i < 30; i++) {
    const ew = Math.exp(w);
    const f = w * ew - x;
    const denominator = ew * (w + 1) - ((w + 2) * f) / (2 * w + 2);
    if (!Number.isFinite(denominator) || denominator === 0) break;
    const next = w - f / denominator;
    if (!(next > 0) || !Number.isFinite(next)) break;
    if (Math.abs(next - w) <= 1e-14 * Math.max(1, Math.abs(next))) return next;
    w = next;
  }
  return w;
}

function criticalPrimeAsymptotic(logN, oldExponent, criticalP) {
  if (!(logN > 1)) return {};
  const k = oldExponent + 1;
  const a = logN * Math.log(logN);
  const w = lambertWPositive(k * a);
  if (!w) return {};
  const firstOrderCriticalP = Math.exp(w / k);
  const result = {
    firstOrderCriticalP,
    firstOrderApproxRatio: safeApproxRatio(criticalP, firstOrderCriticalP),
    firstOrderCriticalRelativeError: criticalP ? firstOrderCriticalP / criticalP - 1 : null,
    firstOrderMinusLogN: firstOrderCriticalP - logN,
  };
  if (oldExponent === 0) {
    const b = Math.log(firstOrderCriticalP);
    const secondOrderCriticalP = firstOrderCriticalP + (Math.log(logN) * b) / (2 * (b + 1));
    result.secondOrderCriticalP = secondOrderCriticalP;
    result.secondOrderApproxRatio = safeApproxRatio(criticalP, secondOrderCriticalP);
    result.secondOrderCriticalRelativeError = criticalP ? secondOrderCriticalP / criticalP - 1 : null;
    result.secondOrderMinusLogN = secondOrderCriticalP - logN;
    result.newFrontierCriticalEquationResidual = criticalP
      ? criticalP * Math.log1p(Math.log(criticalP) / logN) - Math.log(logN)
      : null;
  }
  return result;
}

function safeApproxRatio(criticalP, approximation) {
  return criticalP && Number.isFinite(approximation) ? approximation / criticalP : null;
}

function summarizeStepDecomposition(caRows, bases) {
  const steps = [];
  for (let i = 1; i < caRows.length; i++) steps.push(quotientSignature(caRows[i - 1], caRows[i], bases));
  const primeSteps = steps.filter((row) => row.kind === "prime");
  const finitePrimeSteps = primeSteps.filter((row) => Number.isFinite(row.heightStep.logGainMinusPenalty));
  const post10080PrimeSteps = finitePrimeSteps.filter((row) => row.fromIndex >= 20);
  const postFirstCaXaPrimeSteps = finitePrimeSteps.filter((row) => row.fromIndex >= 356);
  const margins = finitePrimeSteps.map((row) => row.heightStep.logGainMinusPenalty);
  const identityErrors = finitePrimeSteps.map((row) => Math.abs(row.heightStep.identityError)).filter(Number.isFinite);
  const minMargin = margins.reduce((min, value) => Math.min(min, value), Infinity);
  const maxMargin = margins.reduce((max, value) => Math.max(max, value), -Infinity);
  const negativeSteps = finitePrimeSteps.filter((row) => row.heightStep.logGainMinusPenalty < 0);
  const post10080Margins = post10080PrimeSteps.map((row) => row.heightStep.logGainMinusPenalty);
  const post10080MinMargin = post10080Margins.reduce((min, value) => Math.min(min, value), Infinity);
  const post10080MaxMargin = post10080Margins.reduce((max, value) => Math.max(max, value), -Infinity);
  const postFirstCaXaMargins = postFirstCaXaPrimeSteps.map((row) => row.heightStep.logGainMinusPenalty);
  const postFirstCaXaMinMargin = postFirstCaXaMargins.reduce((min, value) => Math.min(min, value), Infinity);
  const postFirstCaXaMaxMargin = postFirstCaXaMargins.reduce((max, value) => Math.max(max, value), -Infinity);
  const summarizeRows = (rows) => [...rows]
    .sort((a, b) => a.heightStep.logGainMinusPenalty - b.heightStep.logGainMinusPenalty)
    .slice(0, 12)
    .map((row) => ({
      fromIndex: row.fromIndex,
      toIndex: row.toIndex,
      p: row.numerator[0]?.p,
      fromFrontier: row.fromFrontier,
      toFrontier: row.toFrontier,
      logGainMinusPenalty: row.heightStep.logGainMinusPenalty,
      fDelta: row.heightStep.fDelta,
      oldExponent: row.heightStep.primeStep?.oldExponent,
      criticalP: row.heightStep.primeStep?.criticalP,
      criticalRatio: row.heightStep.primeStep?.criticalRatio,
    }));
  const thresholdStats = (rows) => {
    const withThreshold = rows.filter((row) => Number.isFinite(row.heightStep.primeStep?.criticalRatio));
    const above = withThreshold.filter((row) => row.heightStep.primeStep.criticalRatio > 1);
    const below = withThreshold.filter((row) => row.heightStep.primeStep.criticalRatio < 1);
    return {
      withThreshold: withThreshold.length,
      aboveCritical: above.length,
      belowCritical: below.length,
      maxCriticalRatio: withThreshold.reduce((max, row) => Math.max(max, row.heightStep.primeStep.criticalRatio), -Infinity),
      minCriticalRatio: withThreshold.reduce((min, row) => Math.min(min, row.heightStep.primeStep.criticalRatio), Infinity),
    };
  };
  const approximationStats = (rows, criticalField) => {
    const withApproximation = rows.filter((row) => {
      const primeStep = row.heightStep.primeStep;
      return Number.isFinite(primeStep?.criticalP) && Number.isFinite(primeStep?.[criticalField]);
    });
    const relativeErrors = withApproximation.map((row) => (
      row.heightStep.primeStep[criticalField] / row.heightStep.primeStep.criticalP - 1
    ));
    const absErrors = relativeErrors.map(Math.abs);
    const classificationMismatches = withApproximation.filter((row) => {
      const p = row.numerator[0]?.p;
      const primeStep = row.heightStep.primeStep;
      return (p > primeStep.criticalP) !== (p > primeStep[criticalField]);
    });
    return {
      steps: withApproximation.length,
      aboveCriticalByApproximation: withApproximation.filter((row) => (
        row.numerator[0]?.p > row.heightStep.primeStep[criticalField]
      )).length,
      classificationMismatches: classificationMismatches.length,
      maxAbsRelativeError: absErrors.reduce((max, value) => Math.max(max, value), 0),
      meanAbsRelativeError: absErrors.length
        ? absErrors.reduce((sum, value) => sum + value, 0) / absErrors.length
        : 0,
      maxRelativeError: relativeErrors.reduce((max, value) => Math.max(max, value), -Infinity),
      minRelativeError: relativeErrors.reduce((min, value) => Math.min(min, value), Infinity),
    };
  };
  const valueStats = (rows, accessor) => {
    const values = rows.map(accessor).filter(Number.isFinite);
    return {
      count: values.length,
      min: values.reduce((min, value) => Math.min(min, value), Infinity),
      max: values.reduce((max, value) => Math.max(max, value), -Infinity),
      mean: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
    };
  };
  const baselineStats = (rows) => ({
    steps: rows.length,
    aboveCritical: rows.filter((row) => row.heightStep.primeStep?.criticalRatio > 1).length,
    primeMinusLogN: valueStats(rows, (row) => row.heightStep.primeStep?.primeMinusLogN),
    criticalMinusLogN: valueStats(rows, (row) => row.heightStep.primeStep?.criticalMinusLogN),
    primeMinusCritical: valueStats(rows, (row) => row.heightStep.primeStep?.criticalDelta),
    secondOrderMinusCritical: valueStats(rows, (row) => (
      row.heightStep.primeStep?.secondOrderCriticalP - row.heightStep.primeStep?.criticalP
    )),
  });
  const boundaryStats = (rows) => {
    const withBoundary = rows.filter((row) => Number.isFinite(row.heightStep.primeStep?.caBoundaryRatioToCritical));
    const belowCriticalBoundary = withBoundary.filter((row) => (
      row.heightStep.primeStep.caBoundaryRatioToCritical < 1
    ));
    const classificationMismatches = withBoundary.filter((row) => (
      (row.heightStep.primeStep.caBoundaryRatioToCritical < 1)
        !== (row.heightStep.primeStep.criticalRatio > 1)
    ));
    const glueErrors = withBoundary.flatMap((row) => [
      Math.abs(row.heightStep.primeStep.caBoundaryMinusFromLower),
      Math.abs(row.heightStep.primeStep.caBoundaryMinusToUpper),
    ]).filter(Number.isFinite);
    const withTaylor = withBoundary.filter((row) => (
      Number.isFinite(row.heightStep.primeStep.caBoundaryTaylorFirstOrderLogDelta)
        && Number.isFinite(row.heightStep.primeStep.caBoundaryTaylorSecondOrderLogDelta)
    ));
    const firstOrderTaylorMismatches = withTaylor.filter((row) => (
      (row.heightStep.primeStep.caBoundaryTaylorFirstOrderLogDelta < 0)
        !== (row.heightStep.primeStep.caBoundaryRatioToCritical < 1)
    ));
    const secondOrderTaylorMismatches = withTaylor.filter((row) => (
      (row.heightStep.primeStep.caBoundaryTaylorSecondOrderLogDelta < 0)
        !== (row.heightStep.primeStep.caBoundaryRatioToCritical < 1)
    ));
    const firstOrderTaylorAbsErrors = withTaylor
      .map((row) => Math.abs(row.heightStep.primeStep.caBoundaryTaylorFirstOrderError))
      .filter(Number.isFinite);
    const secondOrderTaylorAbsErrors = withTaylor
      .map((row) => Math.abs(row.heightStep.primeStep.caBoundaryTaylorSecondOrderError))
      .filter(Number.isFinite);
    const withSecondOrderBoundary = withBoundary.filter((row) => (
      Number.isFinite(row.heightStep.primeStep?.caBoundaryRatioToSecondOrder)
    ));
    const belowSecondOrderBoundary = withSecondOrderBoundary.filter((row) => (
      row.heightStep.primeStep.caBoundaryRatioToSecondOrder < 1
    ));
    const secondOrderBoundaryMismatches = withSecondOrderBoundary.filter((row) => (
      (row.heightStep.primeStep.caBoundaryRatioToSecondOrder < 1)
        !== (row.heightStep.primeStep.criticalRatio > 1)
    ));
    const secondOrderCenterFirstAbsErrors = withSecondOrderBoundary
      .map((row) => Math.abs(row.heightStep.primeStep.secondOrderCenterBoundaryTaylorFirstOrderError))
      .filter(Number.isFinite);
    const secondOrderCenterSecondAbsErrors = withSecondOrderBoundary
      .map((row) => Math.abs(row.heightStep.primeStep.secondOrderCenterBoundaryTaylorSecondOrderError))
      .filter(Number.isFinite);
    return {
      steps: withBoundary.length,
      belowCriticalBoundary: belowCriticalBoundary.length,
      classificationMismatches: classificationMismatches.length,
      caBoundaryRatioToCritical: valueStats(withBoundary, (row) => (
        row.heightStep.primeStep.caBoundaryRatioToCritical
      )),
      caBoundaryLogNScale: valueStats(withBoundary, (row) => (
        row.heightStep.primeStep.caBoundaryLogNScale
      )),
      criticalCaBoundaryLogNScale: valueStats(withBoundary, (row) => (
        row.heightStep.primeStep.criticalCaBoundaryLogNScale
      )),
      firstOrderTaylorMismatches: firstOrderTaylorMismatches.length,
      secondOrderTaylorMismatches: secondOrderTaylorMismatches.length,
      maxAbsFirstOrderTaylorError: firstOrderTaylorAbsErrors.reduce((max, value) => Math.max(max, value), 0),
      meanAbsFirstOrderTaylorError: firstOrderTaylorAbsErrors.length
        ? firstOrderTaylorAbsErrors.reduce((sum, value) => sum + value, 0) / firstOrderTaylorAbsErrors.length
        : 0,
      maxAbsSecondOrderTaylorError: secondOrderTaylorAbsErrors.reduce((max, value) => Math.max(max, value), 0),
      meanAbsSecondOrderTaylorError: secondOrderTaylorAbsErrors.length
        ? secondOrderTaylorAbsErrors.reduce((sum, value) => sum + value, 0) / secondOrderTaylorAbsErrors.length
        : 0,
      belowSecondOrderBoundary: belowSecondOrderBoundary.length,
      secondOrderBoundaryMismatches: secondOrderBoundaryMismatches.length,
      caBoundaryRatioToSecondOrder: valueStats(withSecondOrderBoundary, (row) => (
        row.heightStep.primeStep.caBoundaryRatioToSecondOrder
      )),
      secondOrderCenterDelta: valueStats(withSecondOrderBoundary, (row) => (
        row.heightStep.primeStep.secondOrderCenterDelta
      )),
      secondOrderCenterFirstOrderTaylorMismatches: withSecondOrderBoundary.filter((row) => (
        (row.heightStep.primeStep.secondOrderCenterBoundaryTaylorFirstOrderLogDelta < 0)
          !== (row.heightStep.primeStep.caBoundaryRatioToSecondOrder < 1)
      )).length,
      secondOrderCenterSecondOrderTaylorMismatches: withSecondOrderBoundary.filter((row) => (
        (row.heightStep.primeStep.secondOrderCenterBoundaryTaylorSecondOrderLogDelta < 0)
          !== (row.heightStep.primeStep.caBoundaryRatioToSecondOrder < 1)
      )).length,
      maxAbsSecondOrderCenterFirstOrderTaylorError: secondOrderCenterFirstAbsErrors.reduce((max, value) => Math.max(max, value), 0),
      maxAbsSecondOrderCenterSecondOrderTaylorError: secondOrderCenterSecondAbsErrors.reduce((max, value) => Math.max(max, value), 0),
      maxAbsIntervalGlueError: glueErrors.reduce((max, value) => Math.max(max, value), 0),
    };
  };
  const runSummary = (rows, predicate) => {
    const runs = [];
    let current = null;
    for (const row of rows) {
      if (!predicate(row)) {
        if (current) runs.push(current);
        current = null;
        continue;
      }
      const p = row.numerator[0]?.p;
      const primeStep = row.heightStep.primeStep;
      if (!current) {
        current = {
          length: 0,
          fromIndex: row.fromIndex,
          fromFrontier: row.fromFrontier,
          primes: [],
          maxSecondOrderGapOvershoot: -Infinity,
          expectedBaseCountTotal: 0,
        };
      }
      current.length++;
      current.toIndex = row.toIndex;
      current.toFrontier = row.toFrontier;
      current.primes.push(p);
      current.maxSecondOrderGapOvershoot = Math.max(
        current.maxSecondOrderGapOvershoot,
        primeStep?.secondOrderGapOvershoot ?? -Infinity,
      );
      current.expectedBaseCountTotal += primeStep?.noBaseBeforeSecondOrderExpectedCount || 0;
    }
    if (current) runs.push(current);
    return {
      runCount: runs.length,
      maxRunLength: runs.reduce((max, run) => Math.max(max, run.length), 0),
      runs: runs
        .sort((a, b) => b.length - a.length || b.maxSecondOrderGapOvershoot - a.maxSecondOrderGapOvershoot)
        .slice(0, 12),
    };
  };
  const recoverySummary = (allRows) => {
    const isNoBase = (row) => row.heightStep.primeStep?.noBaseBeforeSecondOrderThreshold;
    const runs = [];
    let i = 0;
    while (i < allRows.length) {
      if (!isNoBase(allRows[i])) {
        i++;
        continue;
      }
      const start = i;
      while (i + 1 < allRows.length && isNoBase(allRows[i + 1])) i++;
      const end = i;
      let cumulative = 0;
      let minCumulative = 0;
      let recoveryIndex = null;
      for (let j = start; j < allRows.length; j++) {
        cumulative += allRows[j].heightStep.logGainMinusPenalty;
        minCumulative = Math.min(minCumulative, cumulative);
        if (j >= end && cumulative > 0) {
          recoveryIndex = j;
          break;
        }
      }
      const noBaseRows = allRows.slice(start, end + 1);
      const recoveryRows = recoveryIndex === null ? [] : allRows.slice(start, recoveryIndex + 1);
      const extraRows = recoveryIndex === null ? [] : allRows.slice(end + 1, recoveryIndex + 1);
      const extraNewFrontierRows = extraRows.filter((row) => row.heightStep.primeStep?.oldExponent === 0);
      const extraNonNewFrontierRows = extraRows.filter((row) => row.heightStep.primeStep?.oldExponent !== 0);
      const extraBelowP2Rows = extraNewFrontierRows.filter((row) => (
        (row.heightStep.primeStep?.secondOrderGapOvershoot ?? Infinity) <= 0
      ));
      const noBaseMarginTotal = noBaseRows.reduce((sum, row) => sum + row.heightStep.logGainMinusPenalty, 0);
      const recoveryMarginTotal = recoveryRows.reduce((sum, row) => sum + row.heightStep.logGainMinusPenalty, 0);
      const extraMarginTotal = extraRows.reduce((sum, row) => sum + row.heightStep.logGainMinusPenalty, 0);
      const extraNewFrontierMarginTotal = extraNewFrontierRows.reduce((sum, row) => sum + row.heightStep.logGainMinusPenalty, 0);
      const extraNonNewFrontierMarginTotal = extraNonNewFrontierRows.reduce((sum, row) => sum + row.heightStep.logGainMinusPenalty, 0);
      const extraBelowP2SlackTotal = extraBelowP2Rows.reduce((sum, row) => (
        sum + Math.max(0, -(row.heightStep.primeStep?.secondOrderGapOvershoot || 0))
      ), 0);
      runs.push({
        length: noBaseRows.length,
        fromIndex: noBaseRows[0].fromIndex,
        toIndex: noBaseRows.at(-1).toIndex,
        fromFrontier: noBaseRows[0].fromFrontier,
        toFrontier: noBaseRows.at(-1).toFrontier,
        primes: noBaseRows.map((row) => row.numerator[0]?.p),
        noBaseMarginTotal,
        minCumulativeLogMargin: minCumulative,
        recovered: recoveryIndex !== null,
        recoveryIndex: recoveryIndex === null ? null : allRows[recoveryIndex].toIndex,
        recoveryFrontier: recoveryIndex === null ? null : allRows[recoveryIndex].toFrontier,
        totalStepsToRecovery: recoveryIndex === null ? null : recoveryIndex - start + 1,
        extraStepsAfterNoBaseRun: recoveryIndex === null ? null : recoveryIndex - end,
        recoveryMarginTotal: recoveryIndex === null ? null : recoveryMarginTotal,
        recoveryPrimes: recoveryRows.map((row) => row.numerator[0]?.p),
        extraRecoveryPrimes: extraRows.map((row) => row.numerator[0]?.p),
        extraMarginTotal: recoveryIndex === null ? null : extraMarginTotal,
        extraNewFrontierSteps: extraNewFrontierRows.length,
        extraNonNewFrontierSteps: extraNonNewFrontierRows.length,
        extraBelowP2Steps: extraBelowP2Rows.length,
        extraNewFrontierSlackTotal: extraBelowP2SlackTotal,
        extraNewFrontierMarginTotal,
        extraNonNewFrontierMarginTotal,
        expectedBaseCountTotal: noBaseRows.reduce((sum, row) => (
          sum + (row.heightStep.primeStep.noBaseBeforeSecondOrderExpectedCount || 0)
        ), 0),
      });
      i++;
    }
    return {
      runCount: runs.length,
      unrecoveredRuns: runs.filter((run) => !run.recovered).length,
      maxNoBaseRunLength: runs.reduce((max, run) => Math.max(max, run.length), 0),
      maxTotalStepsToRecovery: runs.reduce((max, run) => Math.max(max, run.totalStepsToRecovery || 0), 0),
      maxExtraStepsAfterNoBaseRun: runs.reduce((max, run) => Math.max(max, run.extraStepsAfterNoBaseRun || 0), 0),
      deepestCumulativeLogMargin: runs.reduce((min, run) => Math.min(min, run.minCumulativeLogMargin), 0),
      recoveredUsingNonNewFrontierSteps: runs.filter((run) => run.recovered && run.extraNonNewFrontierSteps > 0).length,
      recoveredUsingOnlyNewFrontierSteps: runs.filter((run) => (
        run.recovered && run.extraStepsAfterNoBaseRun > 0 && run.extraNonNewFrontierSteps === 0
      )).length,
      recoveredWithoutExtraSteps: runs.filter((run) => run.recovered && run.extraStepsAfterNoBaseRun === 0).length,
      totalExtraNewFrontierSlack: runs.reduce((sum, run) => sum + (run.extraNewFrontierSlackTotal || 0), 0),
      totalExtraNewFrontierMargin: runs.reduce((sum, run) => sum + (run.extraNewFrontierMarginTotal || 0), 0),
      totalExtraNonNewFrontierMargin: runs.reduce((sum, run) => sum + (run.extraNonNewFrontierMarginTotal || 0), 0),
      runs,
    };
  };
  const baseGapStats = (rows, allRows) => {
    const withGap = rows.filter((row) => (
      Number.isFinite(row.heightStep.primeStep?.secondOrderGapOvershoot)
        && Number.isFinite(row.heightStep.primeStep?.basesBeforeSecondOrderThreshold)
    ));
    const noBase = withGap.filter((row) => row.heightStep.primeStep.noBaseBeforeSecondOrderThreshold);
    const noBaseMismatches = withGap.filter((row) => (
      row.heightStep.primeStep.noBaseBeforeSecondOrderThreshold
        !== (row.heightStep.primeStep.secondOrderGapOvershoot > 0)
    ));
    const ranges = [[100, 500], [500, 1000], [1000, 2000], [2000, 3000]].map(([a, b]) => {
      const rangeRows = withGap.filter((row) => a < row.fromFrontier && row.toFrontier <= b);
      const rangeNoBase = rangeRows.filter((row) => row.heightStep.primeStep.noBaseBeforeSecondOrderThreshold);
      return {
        range: [a, b],
        steps: rangeRows.length,
        noBaseBeforeSecondOrderThreshold: rangeNoBase.length,
        expectedBaseCountTotal: rangeRows.reduce((sum, row) => (
          sum + (row.heightStep.primeStep.noBaseBeforeSecondOrderExpectedCount || 0)
        ), 0),
        noBaseExpectedBaseCountTotal: rangeNoBase.reduce((sum, row) => (
          sum + (row.heightStep.primeStep.noBaseBeforeSecondOrderExpectedCount || 0)
        ), 0),
      };
    });
    const benchmarkRows = withGap.map((row) => {
      const frontier = row.fromFrontier;
      const intervalLength = row.heightStep.primeStep.secondOrderThresholdMinusFrontier;
      const bhp0525Length = frontier ** 0.525;
      const dusart2010Length = frontier / (25 * Math.log(frontier) ** 2);
      return {
        ...row,
        intervalLength,
        bhp0525Length,
        dusart2010Length,
      };
    });
    const noBaseBenchmarkRows = benchmarkRows.filter((row) => row.heightStep.primeStep.noBaseBeforeSecondOrderThreshold);
    return {
      steps: withGap.length,
      nextBaseMismatches: withGap.filter((row) => !row.heightStep.primeStep.newFrontierNextBaseMatches).length,
      noBaseBeforeSecondOrderThreshold: noBase.length,
      noBaseClassifierMismatches: noBaseMismatches.length,
      thresholdBeforeOrAtFrontier: withGap.filter((row) => (
        row.heightStep.primeStep.secondOrderThresholdMinusFrontier <= 0
      )).length,
      thresholdAtOrAfterStepPrime: withGap.filter((row) => (
        row.heightStep.primeStep.secondOrderGapOvershoot <= 0
      )).length,
      basesBeforeSecondOrderThreshold: valueStats(withGap, (row) => (
        row.heightStep.primeStep.basesBeforeSecondOrderThreshold
      )),
      secondOrderThresholdMinusFrontier: valueStats(withGap, (row) => (
        row.heightStep.primeStep.secondOrderThresholdMinusFrontier
      )),
      nextBaseGapFromFrontier: valueStats(withGap, (row) => (
        row.heightStep.primeStep.nextBaseGapFromFrontier
      )),
      secondOrderGapOvershoot: valueStats(withGap, (row) => (
        row.heightStep.primeStep.secondOrderGapOvershoot
      )),
      expectedBaseCountTotal: withGap.reduce((sum, row) => (
        sum + (row.heightStep.primeStep.noBaseBeforeSecondOrderExpectedCount || 0)
      ), 0),
      noBaseExpectedBaseCountTotal: noBase.reduce((sum, row) => (
        sum + (row.heightStep.primeStep.noBaseBeforeSecondOrderExpectedCount || 0)
      ), 0),
      noBaseRuns: runSummary(withGap, (row) => row.heightStep.primeStep.noBaseBeforeSecondOrderThreshold),
      noBaseRecovery: recoverySummary(allRows),
      ordinaryPrimeGapBenchmarks: {
        bhp0525Length: valueStats(benchmarkRows, (row) => row.bhp0525Length),
        intervalOverBhp0525: valueStats(benchmarkRows, (row) => row.intervalLength / row.bhp0525Length),
        bhp0525FitsP2Interval: benchmarkRows.filter((row) => row.bhp0525Length <= row.intervalLength).length,
        noBaseBhp0525FitsP2Interval: noBaseBenchmarkRows.filter((row) => (
          row.bhp0525Length <= row.intervalLength
        )).length,
        dusart2010Length: valueStats(benchmarkRows, (row) => row.dusart2010Length),
        intervalOverDusart2010: valueStats(benchmarkRows, (row) => row.intervalLength / row.dusart2010Length),
        dusart2010ApplicableFrontiers: benchmarkRows.filter((row) => row.fromFrontier >= 396738).length,
        dusart2010FitsP2IntervalIfApplicable: benchmarkRows.filter((row) => (
          row.fromFrontier >= 396738 && row.dusart2010Length <= row.intervalLength
        )).length,
        noBaseDusart2010FitsP2IntervalIfApplicable: noBaseBenchmarkRows.filter((row) => (
          row.fromFrontier >= 396738 && row.dusart2010Length <= row.intervalLength
        )).length,
      },
      ranges,
    };
  };
  const criticalApproximationSummary = (rows) => {
    const newFrontierRows = rows.filter((row) => row.heightStep.primeStep?.oldExponent === 0);
    const newFrontierResiduals = newFrontierRows
      .map((row) => Math.abs(row.heightStep.primeStep?.newFrontierCriticalEquationResidual))
      .filter(Number.isFinite);
    return {
      firstOrder: approximationStats(rows, "firstOrderCriticalP"),
      newFrontierFirstOrder: approximationStats(newFrontierRows, "firstOrderCriticalP"),
      newFrontierSecondOrder: approximationStats(newFrontierRows, "secondOrderCriticalP"),
      newFrontierBaseline: baselineStats(newFrontierRows),
      newFrontierBoundary: boundaryStats(newFrontierRows),
      newFrontierGap: baseGapStats(newFrontierRows, rows),
      maxAbsNewFrontierEquationResidual: newFrontierResiduals.reduce((max, value) => Math.max(max, value), 0),
    };
  };
  return {
    primeSteps: primeSteps.length,
    finitePrimeSteps: finitePrimeSteps.length,
    nonFinitePrimeSteps: primeSteps.length - finitePrimeSteps.length,
    minLogGainMinusPenalty: Number.isFinite(minMargin) ? minMargin : null,
    maxLogGainMinusPenalty: Number.isFinite(maxMargin) ? maxMargin : null,
    negativePrimeSteps: negativeSteps.length,
    maxIdentityError: identityErrors.reduce((max, value) => Math.max(max, value), 0),
    post10080: {
      primeSteps: post10080PrimeSteps.length,
      negativePrimeSteps: post10080PrimeSteps.filter((row) => row.heightStep.logGainMinusPenalty < 0).length,
      minLogGainMinusPenalty: Number.isFinite(post10080MinMargin) ? post10080MinMargin : null,
      maxLogGainMinusPenalty: Number.isFinite(post10080MaxMargin) ? post10080MaxMargin : null,
      mostNegativePrimeSteps: summarizeRows(post10080PrimeSteps),
    },
    postFirstCaXa: {
      primeSteps: postFirstCaXaPrimeSteps.length,
      negativePrimeSteps: postFirstCaXaPrimeSteps.filter((row) => row.heightStep.logGainMinusPenalty < 0).length,
      minLogGainMinusPenalty: Number.isFinite(postFirstCaXaMinMargin) ? postFirstCaXaMinMargin : null,
      maxLogGainMinusPenalty: Number.isFinite(postFirstCaXaMaxMargin) ? postFirstCaXaMaxMargin : null,
      thresholdStats: thresholdStats(postFirstCaXaPrimeSteps),
      criticalApproximationSummary: criticalApproximationSummary(postFirstCaXaPrimeSteps),
      mostNegativePrimeSteps: summarizeRows(postFirstCaXaPrimeSteps),
    },
    mostNegativePrimeSteps: summarizeRows(finitePrimeSteps),
  };
}

function primeGapCount(a, b, bases) {
  return bases.filter((p) => a < p && p < b).length;
}

function summarizeFrontierSkips(frontierTransitions, ranges) {
  const changed = frontierTransitions.filter((row) => !row.sameFrontier);
  const nonzero = changed.filter((row) => row.skippedPrimeCount > 0);
  const liMainTotal = changed.reduce((sum, row) => sum + row.liMain, 0);
  const skippedPrimeTotal = changed.reduce((sum, row) => sum + row.skippedPrimeCount, 0);
  const summarize = (rows) => {
    const changedRows = rows.filter((row) => !row.sameFrontier);
    const liTotal = changedRows.reduce((sum, row) => sum + row.liMain, 0);
    const skipTotal = changedRows.reduce((sum, row) => sum + row.skippedPrimeCount, 0);
    return {
      transitions: rows.length,
      frontierChangingTransitions: changedRows.length,
      zeroSkipTransitions: changedRows.filter((row) => row.skippedPrimeCount === 0).length,
      nonzeroSkipTransitions: changedRows.filter((row) => row.skippedPrimeCount > 0).length,
      skippedPrimeTotal: skipTotal,
      liMainTotal: liTotal,
      skippedOverLiTotal: liTotal > 0 ? skipTotal / liTotal : 0,
      maxSkippedPrimeCount: changedRows.reduce((max, row) => Math.max(max, row.skippedPrimeCount), 0),
      maxSkippedOverLi: changedRows.reduce((max, row) => Math.max(max, row.skippedOverLi), 0),
    };
  };
  return {
    ...summarize(frontierTransitions),
    allTransitions: frontierTransitions.length,
    repeatedFrontierTransitions: frontierTransitions.length - changed.length,
    nonzeroTransitions: nonzero.map((row) => ({
      fromIndex: row.fromIndex,
      toIndex: row.toIndex,
      fromFrontier: row.fromFrontier,
      toFrontier: row.toFrontier,
      skippedPrimeCount: row.skippedPrimeCount,
      skippedPrimes: row.skippedPrimes,
      liMain: row.liMain,
      skippedOverLi: row.skippedOverLi,
    })),
    ranges: ranges.map(([a, b]) => {
      const rows = frontierTransitions.filter((row) => a < row.fromFrontier && row.toFrontier <= b);
      return { range: [a, b], ...summarize(rows) };
    }),
    liMainTotal,
    skippedPrimeTotal,
    skippedOverLiTotal: liMainTotal > 0 ? skippedPrimeTotal / liMainTotal : 0,
  };
}

function summarizeEndpointBarriers(frontierTransitions) {
  const skippedEndpoints = frontierTransitions.flatMap((row) => row.caEndpointBarriers || []);
  const nonzeroBarrierTransitions = frontierTransitions.filter((row) => row.skippedCAEndpointCount > 0);
  return {
    skippedCAEndpointTotal: skippedEndpoints.length,
    transitionsWithSkippedCAEndpoints: nonzeroBarrierTransitions.length,
    maxSkippedCAEndpoints: frontierTransitions.reduce((max, row) => Math.max(max, row.skippedCAEndpointCount || 0), 0),
    closestBarrierDeficit: skippedEndpoints.reduce((max, row) => Math.max(max, row.fMinusPreviousH), -Infinity),
    deepestBarrierDeficit: skippedEndpoints.reduce((min, row) => Math.min(min, row.fMinusPreviousH), Infinity),
    nonCaXaWitnessTotal: frontierTransitions.reduce((sum, row) => sum + (row.nonCaXaWitnesses?.length || 0), 0),
    transitionsWithNonCaXaWitnesses: frontierTransitions.filter((row) => row.nonCaXaWitnesses?.length).length,
    barrierEndpoints: skippedEndpoints,
    transitions: nonzeroBarrierTransitions.map((row) => ({
      fromIndex: row.fromIndex,
      toIndex: row.toIndex,
      fromFrontier: row.fromFrontier,
      toFrontier: row.toFrontier,
      skippedPrimeCount: row.skippedPrimeCount,
      skippedCAEndpointCount: row.skippedCAEndpointCount,
      closestBarrierDeficit: row.closestBarrierDeficit,
      deepestBarrierDeficit: row.deepestBarrierDeficit,
      finalGain: row.finalGain,
      caEndpointPath: row.caEndpointPath,
      caEndpointBarriers: row.caEndpointBarriers,
      nonCaXaWitnesses: row.nonCaXaWitnesses,
    })),
  };
}

function summarizeCaQuotients(caRows, bases) {
  const steps = [];
  for (let i = 1; i < caRows.length; i++) steps.push(quotientSignature(caRows[i - 1], caRows[i], bases));
  const byKind = {};
  for (const step of steps) byKind[step.kind] = (byKind[step.kind] || 0) + 1;
  return {
    total: steps.length,
    byKind,
    theoremShapeFailures: steps.filter((row) => !["prime", "distinct-semiprime"].includes(row.kind)).slice(0, 12),
    firstDistinctSemiprimeSteps: steps.filter((row) => row.kind === "distinct-semiprime").slice(0, 12),
    barrierRunSteps: steps.filter((row) => row.toFrontier !== row.fromFrontier && row.toFrontier - row.fromFrontier > 2 && row.kind === "distinct-semiprime").slice(0, 12),
  };
}

function summarizeBarrierStepDecomposition(frontierTransitions) {
  const transitions = frontierTransitions.filter((row) => row.skippedCAEndpointCount > 0);
  const rows = transitions.map((transition) => {
    let cumulativeLogMargin = 0;
    const path = (transition.caEndpointPath || []).map((step) => {
      const margin = step.quotientFromPreviousCA.heightStep.logGainMinusPenalty;
      cumulativeLogMargin += margin;
      return {
        index: step.index,
        frontier: step.frontier,
        isTerminalH: step.isTerminalH,
        fMinusPreviousH: step.fMinusPreviousH,
        quotient: step.quotientFromPreviousCA.numerator,
        oldExponent: step.quotientFromPreviousCA.heightStep.primeStep?.oldExponent,
        logSigmaGain: step.quotientFromPreviousCA.heightStep.logSigmaGain,
        logLogPenalty: step.quotientFromPreviousCA.heightStep.logLogPenalty,
        logGainMinusPenalty: margin,
        cumulativeLogGainMinusPenalty: cumulativeLogMargin,
        identityError: step.quotientFromPreviousCA.heightStep.identityError,
        criticalP: step.quotientFromPreviousCA.heightStep.primeStep?.criticalP,
        criticalDelta: step.quotientFromPreviousCA.heightStep.primeStep?.criticalDelta,
        criticalRatio: step.quotientFromPreviousCA.heightStep.primeStep?.criticalRatio,
      };
    });
    return {
      fromIndex: transition.fromIndex,
      toIndex: transition.toIndex,
      fromFrontier: transition.fromFrontier,
      toFrontier: transition.toFrontier,
      skippedPrimeCount: transition.skippedPrimeCount,
      skippedCAEndpointCount: transition.skippedCAEndpointCount,
      finalGain: transition.finalGain,
      path,
      minCumulativeLogGainMinusPenalty: path.reduce((min, row) => Math.min(min, row.cumulativeLogGainMinusPenalty), Infinity),
      finalCumulativeLogGainMinusPenalty: path.at(-1)?.cumulativeLogGainMinusPenalty ?? 0,
    };
  });
  return {
    transitionCount: rows.length,
    maxPathLength: rows.reduce((max, row) => Math.max(max, row.path.length), 0),
    maxSkippedCAEndpoints: rows.reduce((max, row) => Math.max(max, row.skippedCAEndpointCount), 0),
    closestFinalCumulativeLogMargin: rows.reduce((min, row) => Math.min(min, Math.abs(row.finalCumulativeLogGainMinusPenalty)), Infinity),
    transitions: rows,
  };
}

function transitionSummary(scanned, xa, bases) {
  const xaSet = new Set(xa.map((row) => row.index));
  const ordered = [...scanned].sort((a, b) => a.logN - b.logN || a.index - b.index);
  const order = new Map(ordered.map((row, i) => [row, i]));
  const caRows = ordered.filter((row) => row.ca);
  const caXa = xa.filter((row) => row.ca);
  const nonCaXa = xa.filter((row) => !row.ca && row.index > 20);
  const closure = nonCaXa.map((row) => {
    const rowOrder = order.get(row);
    const nextCA = caRows.find((candidate) => order.get(candidate) > rowOrder) || null;
    return {
      from: compact(row),
      nextCA: compact(nextCA),
      nextCAIsXA: nextCA ? xaSet.has(nextCA.index) : false,
      frontierDelta: nextCA ? nextCA.frontier - row.frontier : null,
      skippedFrontierPrimes: nextCA ? bases.filter((p) => row.frontier < p && p < nextCA.frontier) : [],
    };
  });
  const frontierTransitions = [];
  for (let i = 1; i < caXa.length; i++) {
    const prev = caXa[i - 1], cur = caXa[i];
    const prevOrder = order.get(prev);
    const curOrder = order.get(cur);
    const caChain = caRows.filter((row) => {
      const rowOrder = order.get(row);
      return prevOrder < rowOrder && rowOrder <= curOrder;
    });
    const caEndpointPath = caChain.map((row, j) => {
      const from = j === 0 ? prev : caChain[j - 1];
      return {
        index: row.index,
        frontier: row.frontier,
        logN: row.logN,
        f: row.f,
        fMinusPreviousH: row.f - prev.f,
        isTerminalH: row.index === cur.index,
        quotientFromPreviousCA: quotientSignature(from, row, bases),
      };
    });
    const caEndpointBarriers = caChain
      .filter((row) => row.index !== cur.index)
      .map((row) => ({
        transitionFromIndex: prev.index,
        transitionToIndex: cur.index,
        index: row.index,
        frontier: row.frontier,
        logN: row.logN,
        f: row.f,
        fMinusPreviousH: row.f - prev.f,
        previousHIndex: prev.index,
        previousHFrontier: prev.frontier,
        quotientFromPreviousCA: caEndpointPath.find((pathRow) => pathRow.index === row.index)?.quotientFromPreviousCA,
      }));
    const nonCaXaWitnesses = nonCaXa
      .filter((row) => {
        const rowOrder = order.get(row);
        return prevOrder < rowOrder && rowOrder < curOrder;
      })
      .map((row) => ({
        index: row.index,
        frontier: row.frontier,
        logN: row.logN,
        f: row.f,
        fMinusPreviousH: row.f - prev.f,
      }));
    const skippedPrimeCount = primeGapCount(prev.frontier, cur.frontier, bases);
    const liMain = liRange(prev.frontier, cur.frontier);
    frontierTransitions.push({
      fromIndex: prev.index,
      toIndex: cur.index,
      fromFrontier: prev.frontier,
      toFrontier: cur.frontier,
      sameFrontier: prev.frontier === cur.frontier,
      skippedPrimeCount,
      skippedPrimes: bases.filter((p) => prev.frontier < p && p < cur.frontier),
      liMain,
      skippedOverLi: liMain > 0 ? skippedPrimeCount / liMain : 0,
      logGap: cur.logN - prev.logN,
      finalGain: cur.f - prev.f,
      skippedCAEndpointCount: caEndpointBarriers.length,
      closestBarrierDeficit: caEndpointBarriers.length ? Math.max(...caEndpointBarriers.map((row) => row.fMinusPreviousH)) : null,
      deepestBarrierDeficit: caEndpointBarriers.length ? Math.min(...caEndpointBarriers.map((row) => row.fMinusPreviousH)) : null,
      caEndpointPath,
      caEndpointBarriers,
      nonCaXaWitnesses,
    });
  }
  const windows = [[100, 182], [182, 300], [300, 500], [500, 1000], [1000, 2000], [2000, 2800]].map(([a, b]) => {
    const ps = bases.filter((p) => a < p && p <= b);
    const used = new Set(caXa.filter((row) => a < row.frontier && row.frontier <= b).map((row) => row.frontier));
    const closures = closure.filter((row) => a < row.from.frontier && row.from.frontier <= b);
    return {
      range: [a, b],
      primeCount: ps.length,
      liMain: liRange(a, b),
      caXaFrontiers: used.size,
      caXaShare: ps.length ? used.size / ps.length : 0,
      nonCaXaClosures: closures.length,
      closureSuccesses: closures.filter((row) => row.nextCAIsXA).length,
    };
  });
  return {
    xaCount: xa.length,
    caCount: caRows.length,
    caXaCount: caXa.length,
    nonCaXaCount: nonCaXa.length,
    closureFailures: closure.filter((row) => !row.nextCAIsXA).length,
    first20CAValidation: xa.slice(0, 20).map((row) => ({
      index: row.index,
      expectedCA: FIRST_20_CA_XA.has(row.index),
      actualCA: row.ca,
      ok: FIRST_20_CA_XA.has(row.index) === row.ca,
    })),
    caXa: caXa.map(compact),
    caQuotientSummary: summarizeCaQuotients(caRows, bases),
    caStepDecompositionSummary: summarizeStepDecomposition(caRows, bases),
    nonCaClosure: closure,
    frontierTransitions,
    frontierSkipSummary: summarizeFrontierSkips(frontierTransitions, [[100, 182], [182, 300], [300, 500], [500, 1000], [1000, 2000], [2000, 2800]]),
    endpointBarrierSummary: summarizeEndpointBarriers(frontierTransitions),
    barrierStepDecompositionSummary: summarizeBarrierStepDecomposition(frontierTransitions),
    windows,
  };
}

function enoughCramerBases(count, seed) {
  let limit = 300;
  while (true) {
    const bases = cramerPrimes(limit, seed);
    if (bases.length >= count + 1) return bases.slice(0, count + 1);
    limit *= 2;
  }
}

function fakeShapeContrast(scanned, seeds) {
  const maxK = Math.max(...scanned.map((row) => row.exponents.length));
  return seeds.map((seed) => {
    const bases = enoughCramerBases(maxK, seed);
    const fake = scanned.map((row) => {
      const factors = bases.slice(0, row.exponents.length);
      let logN = 0;
      for (let i = 0; i < factors.length; i++) logN += row.exponents[i] * Math.log(factors[i]);
      const ratio = sigmaOverN(factors, row.exponents);
      const interval = caInterval(factors, row.exponents, bases);
      return {
        index: row.index,
        logN,
        sigmaOverN: ratio,
        f: ratio / Math.log(logN),
        robinRatio: ratio / Math.log(logN) / E_GAMMA,
        factors,
        exponents: row.exponents,
        frontier: factors[factors.length - 1],
        ca: interval.isCA,
        caInterval: interval,
      };
    }).sort((a, b) => a.logN - b.logN);
    const records = recordRows(fake);
    const summary = transitionSummary(fake, records, bases);
    return {
      seed,
      xaCount: summary.xaCount,
      caXaCount: summary.caXaCount,
      nonCaXaCount: summary.nonCaXaCount,
      closureFailures: summary.closureFailures,
      frontierSkipSummary: summary.frontierSkipSummary,
      caStepThresholdSummary: summary.caStepDecompositionSummary.postFirstCaXa,
      windows: summary.windows,
    };
  });
}

const input = process.argv[2] || DEFAULT_INPUT;
const output = process.argv[3] || DEFAULT_OUTPUT;
const limit = process.argv[4] ? Number(process.argv[4]) : DEFAULT_LIMIT;
const seeds = process.argv[5]
  ? process.argv[5].split(",").map((x) => Number(x.trim())).filter(Boolean)
  : DEFAULT_SEEDS;

if (!existsSync(input)) throw new Error(`missing input ${input}`);
const rows = parseBFile(readFileSync(input, "utf8"), limit);
const { scanned, xa, bases } = scanRows(rows);
const summary = transitionSummary(scanned, xa, bases);
const result = {
  object: "CA-XA transition closure",
  generatedAt: new Date().toISOString(),
  source: input,
  limit,
  rowsParsed: rows.length,
  definition: "CA endpoint classifier plus XA record scan over explicit superabundant prefix",
  theoremHandle: "Proposition 20 and Lemma 21: a non-CA XA between successive CA numbers forces the next CA endpoint to be XA.",
  summary,
  cramerShapeContrast: fakeShapeContrast(scanned, seeds),
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
