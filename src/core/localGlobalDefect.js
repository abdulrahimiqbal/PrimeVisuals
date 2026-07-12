/* Sieve-conditioned interaction defect helpers.

   The arithmetic campaign constructs a bit mask for each fully locally
   eligible center. This module contains only the invariant's generic,
   deterministic statistics so the entropy and control normalization can be
   tested independently of the integer and polynomial enumerators. */

function assertDimensions(dimensions) {
  const k = Math.floor(dimensions);
  if (k < 1 || k > 20) throw new Error(`dimensions must be an integer in [1,20], received ${dimensions}`);
  return k;
}

function finiteNonnegative(value) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function entropyBitsFromCounts(counts) {
  const values = Array.from(counts, finiteNonnegative);
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!(total > 0)) return 0;
  let entropy = 0;
  for (const count of values) {
    if (!(count > 0)) continue;
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function marginalBitCounts(maskCounts, dimensions = 3) {
  const k = assertDimensions(dimensions);
  const expected = 1 << k;
  if (maskCounts.length !== expected) {
    throw new Error(`expected ${expected} mask counts for ${k} dimensions, received ${maskCounts.length}`);
  }
  const out = Array.from({ length: k }, () => new Float64Array(2));
  for (let mask = 0; mask < expected; mask++) {
    const count = finiteNonnegative(maskCounts[mask]);
    for (let bit = 0; bit < k; bit++) out[bit][(mask >>> bit) & 1] += count;
  }
  return out;
}

export function interactionDefectFromMaskCounts(maskCounts, dimensions = 3) {
  const k = assertDimensions(dimensions);
  const expected = 1 << k;
  if (maskCounts.length !== expected) {
    throw new Error(`expected ${expected} mask counts for ${k} dimensions, received ${maskCounts.length}`);
  }
  const counts = Float64Array.from(maskCounts, finiteNonnegative);
  const samples = counts.reduce((sum, value) => sum + value, 0);
  const marginals = marginalBitCounts(counts, k);
  const marginalEntropies = marginals.map(entropyBitsFromCounts);
  const marginalEntropySum = marginalEntropies.reduce((sum, value) => sum + value, 0);
  const jointEntropy = entropyBitsFromCounts(counts);
  const totalCorrelation = Math.max(0, marginalEntropySum - jointEntropy);
  const marginalOneRates = marginals.map((counts01) => {
    const total = counts01[0] + counts01[1];
    return total > 0 ? counts01[1] / total : 0;
  });
  return {
    dimensions: k,
    samples,
    maskCounts: Array.from(counts),
    marginalCounts: marginals.map((counts01) => Array.from(counts01)),
    marginalOneRates,
    marginalEntropies,
    marginalEntropySum,
    jointEntropy,
    totalCorrelation,
    relativeDefect: marginalEntropySum > 0 ? totalCorrelation / marginalEntropySum : 0,
    allOneCount: counts[expected - 1],
  };
}

export function maskProbabilitiesFromJointMoments(jointMoments, dimensions = 3) {
  const k = assertDimensions(dimensions);
  const expected = 1 << k;
  if (jointMoments.length !== expected) {
    throw new Error(`expected ${expected} joint moments for ${k} dimensions, received ${jointMoments.length}`);
  }
  const moments = Float64Array.from(jointMoments, finiteNonnegative);
  if (Math.abs(moments[0] - 1) > 1e-9) throw new Error(`empty-set joint moment must equal 1, received ${moments[0]}`);
  const probabilities = new Float64Array(expected);
  const fullMask = expected - 1;
  for (let exactMask = 0; exactMask < expected; exactMask++) {
    const absent = fullMask ^ exactMask;
    let submask = absent;
    let probability = 0;
    while (true) {
      let parity = 0;
      let x = submask;
      while (x) {
        x &= x - 1;
        parity++;
      }
      probability += (parity & 1 ? -1 : 1) * moments[exactMask | submask];
      if (submask === 0) break;
      submask = (submask - 1) & absent;
    }
    probabilities[exactMask] = Math.max(0, probability);
  }
  const total = probabilities.reduce((sum, value) => sum + value, 0);
  if (!(total > 0)) throw new Error("joint moments produced no probability mass");
  for (let i = 0; i < probabilities.length; i++) probabilities[i] /= total;
  return probabilities;
}

export function interactionDefectFromJointMoments(jointMoments, dimensions = 3) {
  const probabilities = maskProbabilitiesFromJointMoments(jointMoments, dimensions);
  return interactionDefectFromMaskCounts(probabilities, dimensions);
}

export function localInformationDepth(eligibleCenters, totalCenters) {
  const eligible = finiteNonnegative(eligibleCenters);
  const total = finiteNonnegative(totalCenters);
  if (!(eligible > 0) || !(total > 0) || eligible > total) return Infinity;
  return -Math.log(eligible / total);
}

export function controlExcess(realValue, controlValues) {
  const usable = Array.from(controlValues).filter(Number.isFinite);
  if (!Number.isFinite(realValue) || usable.length < 2) {
    return { count: usable.length, mean: NaN, sd: NaN, min: NaN, max: NaN, z: NaN };
  }
  const mean = usable.reduce((sum, value) => sum + value, 0) / usable.length;
  const variance = usable.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (usable.length - 1);
  const sd = Math.sqrt(Math.max(0, variance));
  return {
    count: usable.length,
    mean,
    sd,
    min: Math.min(...usable),
    max: Math.max(...usable),
    z: sd > 0 ? (realValue - mean) / sd : NaN,
  };
}
