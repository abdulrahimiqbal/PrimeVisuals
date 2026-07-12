import {
  e0Trace,
  omegaWithMultiplicity,
  primeTable,
  primesFromTable,
  quadraticTwistTrace,
  serreAliquotCorrection2,
  shortWeierstrassTrace,
  smallestPrimeFactorTable,
  traceGapCoordinates,
  truncatedJonesUniversalConstant2,
} from "../src/core/frobeniusPrimeGraph.js";
import { positiveMod } from "../src/core/frobeniusTuple.js";

const endpoints = [5_000, 10_000, 20_000, 40_000];
const maxEndpoint = endpoints.at(-1);
const traceLimit = maxEndpoint + Math.ceil(2 * Math.sqrt(maxEndpoint)) + 4;
const primality = primeTable(traceLimit);
const primes = primesFromTable(primality);
const spf = smallestPrimeFactorTable(traceLimit);

function traceMap(traceFunction, badPrimes) {
  const map = new Map();
  for (const p of primes) {
    if (p === 2 || badPrimes.has(p)) continue;
    map.set(p, traceFunction(p));
  }
  return map;
}

function scanCurve(map, badPrimes, twist = 1) {
  const cells = [];
  for (const X of endpoints) {
    let primeOrders = 0;
    let semiprimeOrders = 0;
    const pairs = [];
    for (const p of primes) {
      if (p > X) break;
      if (badPrimes.has(p)) continue;
      const baseAP = map.get(p);
      const aP = twist === 1 ? baseAP : quadraticTwistTrace(baseAP, p, twist);
      if (aP == null) continue;
      const q = p + 1 - aP;
      if (q <= 1 || q >= primality.length || badPrimes.has(q) || positiveMod(twist, q) === 0) continue;
      if (primality[q]) {
        primeOrders++;
        if (p >= q) continue;
        const baseAQ = map.get(q);
        const aQ = twist === 1 ? baseAQ : quadraticTwistTrace(baseAQ, q, twist);
        if (aQ != null && q + 1 - aQ === p) pairs.push([p, q]);
      } else if (omegaWithMultiplicity(q, spf) === 2) {
        semiprimeOrders++;
      }
    }
    cells.push({ X, primeOrders, semiprimeOrders, amicablePairs: pairs.length, pairs });
  }
  return cells;
}

const e0Map = traceMap(e0Trace, new Set([37]));
const zeroMap = traceMap((p) => shortWeierstrassTrace(p, -3, 4), new Set([2, 3]));
// CM j=0 control from Silverman--Stange: y^2=x^3+2.
const cmMap = traceMap((p) => shortWeierstrassTrace(p, 0, 2), new Set([2, 3]));

const knownP = 1_622_311;
const knownQ = 1_622_471;
const knownAP = e0Trace(knownP);
const knownAQ = e0Trace(knownQ);
const knownPair = {
  p: knownP,
  q: knownQ,
  aP: knownAP,
  aQ: knownAQ,
  ...traceGapCoordinates(knownP, knownAP, knownQ, knownAQ),
};

const congruenceCollisions = [2, 3, 4, 5, 7, 8, 11].map((modulus) => {
  const target = [knownP, knownAP, knownQ, knownAQ].map((value) => positiveMod(value, modulus));
  const examples = [];
  let count = 0;
  for (const p of primes) {
    if (p > maxEndpoint) break;
    if (p === 37) continue;
    const aP = e0Map.get(p);
    const q = p + 1 - aP;
    if (q <= 1 || q >= primality.length || !primality[q] || q === 37) continue;
    const aQ = e0Map.get(q);
    const signature = [p, aP, q, aQ].map((value) => positiveMod(value, modulus));
    if (signature.some((value, index) => value !== target[index])) continue;
    if (q + 1 - aQ === p) continue;
    count++;
    if (examples.length < 3) examples.push({ p, q, aP, aQ });
  }
  return { modulus, target, nonreturningMatches: count, examples };
});

const twistPanel = [
  -30, -23, -22, -21, -19, -17, -15, -14, -13, -11, -10, -7,
  -6, -5, -3, -2, 2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19,
  21, 22, 23, 26, 29, 30,
];
const twistResults = twistPanel.map((twist) => ({
  twist,
  cells: scanCurve(e0Map, new Set([37, ...primeDivisors(Math.abs(twist))]), twist),
}));

function primeDivisors(n) {
  const divisors = [];
  let value = n;
  for (let p = 2; p * p <= value; p++) {
    if (value % p) continue;
    divisors.push(p);
    while (value % p === 0) value /= p;
  }
  if (value > 1) divisors.push(value);
  return divisors;
}

const finalTwistCounts = twistResults.map((result) => result.cells.at(-1).amicablePairs);
const twistMean = finalTwistCounts.reduce((sum, value) => sum + value, 0) / finalTwistCounts.length;
const twistVariance = finalTwistCounts.reduce((sum, value) => sum + (value - twistMean) ** 2, 0)
  / finalTwistCounts.length;
const twistLadder = endpoints.map((X, endpointIndex) => {
  const counts = twistResults.map((result) => result.cells[endpointIndex].amicablePairs);
  const mean = counts.reduce((sum, value) => sum + value, 0) / counts.length;
  const variance = counts.reduce((sum, value) => sum + (value - mean) ** 2, 0) / counts.length;
  const uniquePairs = new Set(
    twistResults.flatMap((result) => result.cells[endpointIndex].pairs.map(([p, q]) => `${p}:${q}`)),
  );
  return {
    X,
    mean,
    variance,
    varianceOverMeanSquared: mean ? variance / (mean * mean) : null,
    zeroFraction: counts.filter((count) => count === 0).length / counts.length,
    uniquePairCount: uniquePairs.size,
  };
});

const universalTruncation = truncatedJonesUniversalConstant2(100_000);
const entanglementCorrection = serreAliquotCorrection2(37);
const e0ConstantReconstruction = universalTruncation * entanglementCorrection;

const output = {
  frozenEndpoints: endpoints,
  sources: {
    jones: "https://arxiv.org/abs/1212.1010",
    silvermanStange: "https://arxiv.org/abs/0912.1831",
    parks: "https://arxiv.org/abs/1410.5888",
  },
  constants: {
    universalPrimeTruncation: 100_000,
    universalTruncatedC2: universalTruncation,
    serreLevel74Correction: entanglementCorrection,
    reconstructedE0C2: e0ConstantReconstruction,
    jonesQuotedE0C2: 0.077093,
    jonesQuotedZeroControlC2: 0,
  },
  knownPair,
  traceScans: {
    e0: scanCurve(e0Map, new Set([37])),
    zeroConstant: scanCurve(zeroMap, new Set([2, 3])),
    cm: scanCurve(cmMap, new Set([2, 3])),
  },
  congruenceCollisions,
  twistPanel: {
    twists: twistResults,
    finalCounts: finalTwistCounts,
    zeroFraction: finalTwistCounts.filter((count) => count === 0).length / finalTwistCounts.length,
    mean: twistMean,
    variance: twistVariance,
    varianceOverMeanSquared: twistMean ? twistVariance / (twistMean * twistMean) : null,
    ladder: twistLadder,
    note: "Raw exact counts only. Curve-dependent adelic constants were not established for every twist, so this panel cannot pass the frozen normalized-concentration gate.",
  },
};

console.log(JSON.stringify(output, null, 2));
