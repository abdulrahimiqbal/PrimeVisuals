/* Local Chowla weather hunt.

   Hard quarantine: this module does not import zeta, zeros, explicit
   formula data, or RH-equivalent criteria. It works only with the
   Liouville parity field lambda(n)=(-1)^Omega(n), local products
   lambda(n)lambda(n+h), seeded nulls, and pre-registered feature laws.
*/

const EPS = 1e-12;
const PRIMORIAL_11 = 2 * 3 * 5 * 7 * 11;
const RESIDUE_MODS = [3, 4, 5, 8, 12, 16, 24, 30];
const DEFAULT_WINDOWS = [256, 512, 1024, 2048, 4096, 8192];

function asPositiveInt(value, fallback, name) {
  const n = Number.isFinite(Number(value)) ? Math.floor(Number(value)) : fallback;
  if (n < 1) throw new Error(`${name} must be a positive integer`);
  return n;
}

function normalizeSeeds(seeds) {
  if (Array.isArray(seeds)) {
    const out = seeds.map((seed) => Math.floor(Number(seed)) || 1);
    return out.length ? out : [1];
  }
  const count = asPositiveInt(seeds ?? 1, 1, "seeds");
  return Array.from({ length: count }, (_, i) => i + 1);
}

function normalizeWindows(windows, N) {
  const n = asPositiveInt(N, 1, "N");
  const raw = Array.isArray(windows) && windows.length
    ? windows
    : DEFAULT_WINDOWS;
  const out = raw
    .map((value) => Math.floor(Number(value)))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= n);
  const unique = [...new Set(out)].sort((a, b) => a - b);
  if (unique.length) return unique;
  return [n];
}

function rng(seed) {
  let a = (Math.floor(Number(seed)) || 1) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalRng(random) {
  let spare = null;
  return () => {
    if (spare !== null) {
      const out = spare;
      spare = null;
      return out;
    }
    const u = Math.max(EPS, random());
    const v = Math.max(EPS, random());
    const r = Math.sqrt(-2 * Math.log(u));
    const theta = 2 * Math.PI * v;
    spare = r * Math.sin(theta);
    return r * Math.cos(theta);
  };
}

function mean(values) {
  if (!values.length) return 0;
  let s = 0;
  for (const v of values) s += v;
  return s / values.length;
}

function variance(values, m = mean(values)) {
  if (values.length < 2) return 0;
  let s = 0;
  for (const v of values) {
    const d = v - m;
    s += d * d;
  }
  return s / (values.length - 1);
}

function std(values, m = mean(values)) {
  return Math.sqrt(Math.max(0, variance(values, m)));
}

function minMax(values) {
  if (!values.length) return { min: 0, max: 0 };
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

function safeDiv(a, b) {
  return Math.abs(b) > EPS ? a / b : 0;
}

function gcd(a, b) {
  let x = Math.abs(Math.floor(a));
  let y = Math.abs(Math.floor(b));
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  if (sxx <= EPS || syy <= EPS) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

function linearR2(xs, ys) {
  const r = pearson(xs, ys);
  return r * r;
}

function bucketPower2(value) {
  const v = Math.max(1, Math.floor(Number(value) || 1));
  if (v === 1) return "1";
  const e = Math.floor(Math.log2(v));
  const lo = 2 ** e;
  const hi = 2 ** (e + 1) - 1;
  return `${lo}-${hi}`;
}

function phiRatioBucket(value) {
  const x = Number(value) || 0;
  if (x < 0.34) return "<0.34";
  if (x < 0.50) return "0.34-0.50";
  if (x < 0.67) return "0.50-0.67";
  if (x < 0.84) return "0.67-0.84";
  return ">=0.84";
}

function featureValue(features, feature) {
  if (feature === "hSizeBucket") return bucketPower2(features.h);
  if (feature === "logHBucket") return bucketPower2(Math.max(1, Math.floor(Math.log2(features.h + 1) * 4)));
  return features[feature];
}

function featureLabel(feature) {
  const labels = {
    v2: "v2(h)",
    oddpart: "oddpart(h)",
    omega: "omega(h)",
    bigomega: "Omega(h)",
    rad: "rad(h)",
    tau: "tau(h)",
    phiRatio: "phi(h)/h",
    phiRatioBucket: "phi(h)/h bucket",
    squarefree: "squarefree(h)",
    parityOmega: "Omega(h) parity",
    gcdPrimorial: "gcd(h,2310)",
    radBucket: "rad(h) dyadic bucket",
    oddpartBucket: "oddpart(h) dyadic bucket",
    hSizeBucket: "h dyadic bucket",
    logHBucket: "log h bucket",
  };
  if (/^mod\d+$/.test(feature)) return `h mod ${feature.slice(3)}`;
  return labels[feature] || feature;
}

function finiteNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function liouvilleUpTo(N) {
  const nMax = Math.max(0, Math.floor(Number(N) || 0));
  const lambda = new Int8Array(nMax + 1);
  const spf = new Int32Array(nMax + 1);
  const primes = [];
  if (nMax >= 1) lambda[1] = 1;
  for (let i = 2; i <= nMax; i++) {
    if (!spf[i]) {
      spf[i] = i;
      primes.push(i);
      lambda[i] = -1;
    }
    for (let k = 0; k < primes.length; k++) {
      const p = primes[k];
      const m = i * p;
      if (m > nMax || p > spf[i]) break;
      spf[m] = p;
      lambda[m] = -lambda[i];
      if (i % p === 0) break;
    }
  }
  return lambda;
}

export function liouvilleFeatures(h) {
  const value = asPositiveInt(h, 1, "h");
  let m = value;
  let rad = 1;
  let omega = 0;
  let bigomega = 0;
  let tau = 1;
  let phi = value;
  let v2 = 0;
  let squarefree = true;

  for (let p = 2; p * p <= m; p += p === 2 ? 1 : 2) {
    if (m % p !== 0) continue;
    let e = 0;
    while (m % p === 0) {
      m = Math.floor(m / p);
      e++;
      bigomega++;
    }
    if (p === 2) v2 = e;
    if (e > 1) squarefree = false;
    omega++;
    tau *= e + 1;
    rad *= p;
    phi = Math.floor((phi / p) * (p - 1));
  }
  if (m > 1) {
    omega++;
    bigomega++;
    tau *= 2;
    rad *= m;
    phi = Math.floor((phi / m) * (m - 1));
  }

  const oddpart = value / (2 ** v2);
  const features = {
    h: value,
    v2,
    oddpart,
    omega,
    bigomega,
    rad,
    tau,
    phiRatio: phi / value,
    phiRatioBucket: phiRatioBucket(phi / value),
    squarefree,
    parityOmega: bigomega % 2 ? "odd" : "even",
    gcdPrimorial: gcd(value, PRIMORIAL_11),
    radBucket: bucketPower2(rad),
    oddpartBucket: bucketPower2(oddpart),
  };
  for (const mod of RESIDUE_MODS) features[`mod${mod}`] = value % mod;
  return features;
}

function featuresUpTo(H) {
  const out = Array.from({ length: H + 1 }, () => null);
  for (let h = 1; h <= H; h++) out[h] = liouvilleFeatures(h);
  return out;
}

function windowStarts(N, L, stride) {
  const starts = [];
  for (let x = 1; x + L - 1 <= N; x += stride) starts.push(x);
  if (!starts.length) starts.push(1);
  return starts;
}

function effectiveWindowCount(count, L, stride) {
  if (count <= 1) return 1;
  return Math.max(1, Math.min(count, count * Math.max(1, stride) / Math.max(1, L)));
}

export function localChowlaTensor({
  N,
  H,
  windows,
  stride,
  lambda,
  includeRows = true,
} = {}) {
  const nMax = asPositiveInt(N, 1, "N");
  const hMax = asPositiveInt(H, 1, "H");
  const step = asPositiveInt(stride ?? Math.min(512, nMax), 1, "stride");
  const win = normalizeWindows(windows, nMax);
  const values = lambda ? new Int8Array(lambda) : liouvilleUpTo(nMax + hMax);
  if (values.length <= nMax + hMax) {
    throw new Error("lambda is shorter than N+H");
  }

  const featuresByH = featuresUpTo(hMax);
  const startsByL = new Map(win.map((L) => [L, windowStarts(nMax, L, step)]));
  const rows = [];
  const cells = [];
  const prefix = new Int32Array(nMax + 1);

  for (let h = 1; h <= hMax; h++) {
    prefix[0] = 0;
    for (let n = 1; n <= nMax; n++) {
      prefix[n] = prefix[n - 1] + values[n] * values[n + h];
    }
    const features = featuresByH[h];
    for (const L of win) {
      const sqrtL = Math.sqrt(L);
      const starts = startsByL.get(L);
      let sumB = 0;
      let sumZ = 0;
      let sumZ2 = 0;
      let maxAbsZ = 0;
      for (const x of starts) {
        const end = Math.min(nMax, x + L - 1);
        const actualL = end - x + 1;
        const B = prefix[end] - prefix[x - 1];
        const Z = B / Math.sqrt(actualL || L);
        sumB += B;
        sumZ += Z;
        sumZ2 += Z * Z;
        if (Math.abs(Z) > maxAbsZ) maxAbsZ = Math.abs(Z);
        if (includeRows) rows.push({ h, x, L: actualL, B, Z, features });
      }
      const count = starts.length;
      const meanZ = sumZ / count;
      const meanB = sumB / count;
      const varianceZ = Math.max(0, sumZ2 / count - meanZ * meanZ);
      cells.push({
        h,
        L,
        eta: Math.log(L) / Math.log(nMax),
        count,
        effectiveCount: effectiveWindowCount(count, L, step),
        meanB,
        meanZ,
        stdZ: Math.sqrt(varianceZ),
        maxAbsZ,
        features,
      });
    }
  }

  return {
    kind: "local-chowla-weather-tensor",
    N: nMax,
    H: hMax,
    windows: win,
    stride: step,
    rowCount: rows.length || cells.reduce((s, cell) => s + cell.count, 0),
    rows,
    cells,
    featuresByH: featuresByH.slice(1),
  };
}

export function randomCompletelyMultiplicativeSignsUpTo(N, seed = 1) {
  const nMax = Math.max(0, Math.floor(Number(N) || 0));
  const random = rng(seed);
  const values = new Int8Array(nMax + 1);
  const spf = new Int32Array(nMax + 1);
  const primes = [];
  if (nMax >= 1) values[1] = 1;
  for (let i = 2; i <= nMax; i++) {
    if (!spf[i]) {
      spf[i] = i;
      primes.push(i);
      values[i] = random() < 0.5 ? -1 : 1;
    }
    for (let k = 0; k < primes.length; k++) {
      const p = primes[k];
      const m = i * p;
      if (m > nMax || p > spf[i]) break;
      spf[m] = p;
      values[m] = values[i] * values[p];
      if (i % p === 0) break;
    }
  }
  return values;
}

export function blockShuffleLiouville(lambda, seed = 1, length = lambda.length - 1) {
  const nMax = Math.min(Math.max(0, Math.floor(length)), lambda.length - 1);
  const runs = [];
  let i = 1;
  while (i <= nMax) {
    const sign = lambda[i] || 1;
    let j = i + 1;
    while (j <= nMax && lambda[j] === sign) j++;
    runs.push({ sign, length: j - i });
    i = j;
  }
  const random = rng(seed);
  for (let j = runs.length - 1; j > 0; j--) {
    const k = Math.floor(random() * (j + 1));
    const tmp = runs[j];
    runs[j] = runs[k];
    runs[k] = tmp;
  }
  const out = new Int8Array(nMax + 1);
  if (nMax >= 1) out[1] = runs[0]?.sign || 1;
  let at = 1;
  for (const run of runs) {
    for (let k = 0; k < run.length && at <= nMax; k++, at++) out[at] = run.sign;
  }
  return out;
}

function makeHLAccumulators(H, windows) {
  const out = new Map();
  for (let h = 1; h <= H; h++) {
    for (const L of windows) {
      out.set(`${h}|${L}`, { h, L, count: 0, mean: 0, m2: 0 });
    }
  }
  return out;
}

function addAcc(acc, value) {
  acc.count++;
  const delta = value - acc.mean;
  acc.mean += delta / acc.count;
  acc.m2 += delta * (value - acc.mean);
}

function finalizeAccumulators(accs, meta = {}) {
  const byHL = {};
  for (const [key, acc] of accs) {
    const varianceValue = acc.count > 1 ? acc.m2 / (acc.count - 1) : 0;
    byHL[key] = {
      h: acc.h,
      L: acc.L,
      count: acc.count,
      mean: acc.mean,
      std: Math.sqrt(Math.max(0, varianceValue)) || meta.stdFallback || 1,
    };
  }
  return byHL;
}

function analyticHL(H, windows, N, stride, seedCount, kind, mode) {
  const byHL = {};
  for (let h = 1; h <= H; h++) {
    for (const L of windows) {
      const count = windowStarts(N, L, stride).length * seedCount;
      byHL[`${h}|${L}`] = { h, L, count, mean: 0, std: 1 };
    }
  }
  return {
    kind,
    mode,
    exact: false,
    byHL,
  };
}

function accumulateSequenceByHL(sequence, { N, H, windows, stride }, accs) {
  const prefix = new Int32Array(N + 1);
  for (let h = 1; h <= H; h++) {
    prefix[0] = 0;
    for (let n = 1; n <= N; n++) {
      prefix[n] = prefix[n - 1] + sequence[n] * sequence[n + h];
    }
    for (const L of windows) {
      const sqrtL = Math.sqrt(L);
      const acc = accs.get(`${h}|${L}`);
      for (const x of windowStarts(N, L, stride)) {
        const B = prefix[x + L - 1] - prefix[x - 1];
        addAcc(acc, B / sqrtL);
      }
    }
  }
}

function exactSequenceNull({ kind, seeds, N, H, windows, stride, sequenceForSeed }) {
  const accs = makeHLAccumulators(H, windows);
  for (const seed of seeds) {
    const sequence = sequenceForSeed(seed);
    accumulateSequenceByHL(sequence, { N, H, windows, stride }, accs);
  }
  return {
    kind,
    mode: "exact-seeded-sequence",
    exact: true,
    seeds,
    byHL: finalizeAccumulators(accs),
  };
}

function exactSignShuffleAH({ seeds, N, H, windows, stride, lambda }) {
  const accs = makeHLAccumulators(H, windows);
  const prefix = new Int32Array(N + 1);
  for (const seed of seeds) {
    const random = rng(seed * 104729 + 17);
    for (let h = 1; h <= H; h++) {
      prefix[0] = 0;
      for (let n = 1; n <= N; n++) {
        const sign = random() < 0.5 ? -1 : 1;
        prefix[n] = prefix[n - 1] + sign * lambda[n] * lambda[n + h];
      }
      for (const L of windows) {
        const sqrtL = Math.sqrt(L);
        const acc = accs.get(`${h}|${L}`);
        for (const x of windowStarts(N, L, stride)) {
          const B = prefix[x + L - 1] - prefix[x - 1];
          addAcc(acc, B / sqrtL);
        }
      }
    }
  }
  return {
    kind: "sign-shuffled-Ah",
    mode: "exact-seeded-sign-flip",
    exact: true,
    seeds,
    byHL: finalizeAccumulators(accs),
  };
}

export function chowlaWeatherNulls({
  N,
  H,
  windows,
  stride,
  seeds = 10,
  lambda,
  exact,
  maxExactOps = 80_000_000,
} = {}) {
  const nMax = asPositiveInt(N, 1, "N");
  const hMax = asPositiveInt(H, 1, "H");
  const step = asPositiveInt(stride ?? Math.min(512, nMax), 1, "stride");
  const win = normalizeWindows(windows, nMax);
  const seedList = normalizeSeeds(seeds);
  const source = lambda ? new Int8Array(lambda) : liouvilleUpTo(nMax + hMax);
  const ops = seedList.length * nMax * hMax;
  const useExact = exact ?? ops <= maxExactOps;

  const randomMultiplicative = useExact
    ? exactSequenceNull({
      kind: "random-completely-multiplicative",
      seeds: seedList,
      N: nMax,
      H: hMax,
      windows: win,
      stride: step,
      sequenceForSeed: (seed) => randomCompletelyMultiplicativeSignsUpTo(nMax + hMax, seed),
    })
    : analyticHL(hMax, win, nMax, step, seedList.length, "random-completely-multiplicative", "analytic-unit-window-cell");

  const blockShuffle = useExact
    ? exactSequenceNull({
      kind: "block-shuffled-liouville",
      seeds: seedList,
      N: nMax,
      H: hMax,
      windows: win,
      stride: step,
      sequenceForSeed: (seed) => blockShuffleLiouville(source, seed, nMax + hMax),
    })
    : analyticHL(hMax, win, nMax, step, seedList.length, "block-shuffled-liouville", "conservative-unit-window-cell");

  const signShuffleAH = useExact
    ? exactSignShuffleAH({ seeds: seedList, N: nMax, H: hMax, windows: win, stride: step, lambda: source })
    : analyticHL(hMax, win, nMax, step, seedList.length, "sign-shuffled-Ah", "analytic-seeded-sign-flip-cell");

  return {
    kind: "chowla-weather-nulls",
    N: nMax,
    H: hMax,
    windows: win,
    stride: step,
    seeds: seedList,
    exact: useExact,
    exactOps: ops,
    nulls: {
      randomMultiplicative,
      blockShuffle,
      signShuffleAH,
    },
  };
}

function cellNullStd(cell, nulls, kind = "signShuffleAH") {
  const nullObj = nulls?.nulls?.[kind] || nulls?.[kind] || null;
  const row = nullObj?.byHL?.[`${cell.h}|${cell.L}`];
  const rowStd = row?.std || 1;
  const eff = Math.max(1, cell.effectiveCount || cell.count || 1);
  return rowStd / Math.sqrt(eff);
}

function residualCell(cell, nulls) {
  const randomRow = nulls?.nulls?.randomMultiplicative?.byHL?.[`${cell.h}|${cell.L}`];
  const center = randomRow?.mean || 0;
  return {
    ...cell,
    value: cell.meanZ - center,
    noiseStd: cellNullStd(cell, nulls, "signShuffleAH"),
  };
}

function splitCells(tensor, nulls) {
  const half = tensor.H / 2;
  const cells = tensor.cells.map((cell) => residualCell(cell, nulls));
  return {
    all: cells,
    train: cells.filter((cell) => cell.h <= half),
    holdout: cells.filter((cell) => cell.h > half),
  };
}

function distinctH(cells) {
  return new Set(cells.map((cell) => cell.h));
}

function values(cells) {
  return cells.map((cell) => cell.value);
}

function cellsMean(cells) {
  return mean(values(cells));
}

function selectedEffect(cells, predicate) {
  const selected = [];
  const rest = [];
  for (const cell of cells) (predicate(cell) ? selected : rest).push(cell);
  if (!selected.length || !rest.length) {
    return {
      effect: 0,
      selected,
      rest,
      selectedMean: 0,
      restMean: 0,
      selectedH: 0,
      restH: 0,
    };
  }
  const selectedMean = cellsMean(selected);
  const restMean = cellsMean(rest);
  return {
    effect: selectedMean - restMean,
    selected,
    rest,
    selectedMean,
    restMean,
    selectedH: distinctH(selected).size,
    restH: distinctH(rest).size,
  };
}

function absZAgainst(samples, observed) {
  const absSamples = samples.map((value) => Math.abs(value));
  const m = mean(absSamples);
  const s = std(absSamples, m);
  return safeDiv(Math.abs(observed) - m, s + 0.04);
}

function randomSubset(items, count, random) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return new Set(arr.slice(0, Math.max(0, Math.min(count, arr.length))));
}

function labelNullEffects(cells, selectedHCount, seeds) {
  const hs = [...distinctH(cells)].sort((a, b) => a - b);
  return seeds.map((seed) => {
    const random = rng(seed * 8191 + 29);
    const selectedHs = randomSubset(hs, selectedHCount, random);
    return selectedEffect(cells, (cell) => selectedHs.has(cell.h)).effect;
  });
}

function signFlipNullEffects(selected, rest, seeds) {
  return seeds.map((seed) => {
    const random = rng(seed * 65537 + 101);
    let a = 0;
    let b = 0;
    for (const cell of selected) a += cell.value * (random() < 0.5 ? -1 : 1);
    for (const cell of rest) b += cell.value * (random() < 0.5 ? -1 : 1);
    return safeDiv(a, selected.length) - safeDiv(b, rest.length);
  });
}

function gaussianNullEffects(selected, rest, seeds) {
  return seeds.map((seed) => {
    const normal = normalRng(rng(seed * 4099 + 313));
    let a = 0;
    let b = 0;
    for (const cell of selected) a += normal() * (cell.noiseStd || 1);
    for (const cell of rest) b += normal() * (cell.noiseStd || 1);
    return safeDiv(a, selected.length) - safeDiv(b, rest.length);
  });
}

function effectNullZ(trainEffect, selected, rest, trainCells, seeds) {
  const selectedHCount = distinctH(selected).size;
  const randomZ = absZAgainst(gaussianNullEffects(selected, rest, seeds), trainEffect);
  const blockZ = absZAgainst(labelNullEffects(trainCells, selectedHCount, seeds), trainEffect);
  const signZ = absZAgainst(signFlipNullEffects(selected, rest, seeds), trainEffect);
  return {
    randomMultiplicative: randomZ,
    blockShuffle: blockZ,
    signShuffleAH: signZ,
    min: Math.min(randomZ, blockZ, signZ),
  };
}

function hDominance(cells) {
  if (!cells.length) return 1;
  const byH = new Map();
  let total = 0;
  for (const cell of cells) {
    const w = Math.abs(cell.value);
    total += w;
    byH.set(cell.h, (byH.get(cell.h) || 0) + w);
  }
  if (total <= EPS) return 0;
  let max = 0;
  for (const v of byH.values()) if (v > max) max = v;
  return max / total;
}

function baseFailureReasons({
  law,
  train,
  holdout,
  dyadic,
  controls,
  minTrainZ,
  minSupportH,
}) {
  const reasons = [];
  if (law.train.nullZ.min < minTrainZ) reasons.push(`train real-vs-null z ${law.train.nullZ.min.toFixed(3)} < ${minTrainZ}`);
  if (train.selectedH < minSupportH) reasons.push(`train support ${train.selectedH} h < ${minSupportH}`);
  if (holdout.selectedH < minSupportH) reasons.push(`holdout support ${holdout.selectedH} h < ${minSupportH}`);
  if (hDominance(train.selected) > 0.42) reasons.push("train effect dominated by an isolated h");
  if (Math.sign(law.train.effect || 0) !== Math.sign(law.holdout.effect || 0)) reasons.push("holdout direction disagrees");
  if (Math.abs(law.holdout.effect) < 0.15 * Math.abs(law.train.effect)) reasons.push("holdout effect too small");
  if (!dyadic || Math.sign(law.train.effect || 0) !== Math.sign(dyadic.effect || 0)) reasons.push("N/2 vs N direction disagrees");
  if (dyadic && Math.abs(dyadic.effect) < 0.12 * Math.abs(law.train.effect)) reasons.push("N/2 vs N effect too small");
  if (law.complexity > 2 && law.train.nullZ.min < 7) reasons.push("description complexity exceeds two features");
  if (controls.hSizeZ >= law.train.nullZ.min - 0.25) reasons.push("not separated from h-size-only control");
  if (controls.parityZ >= law.train.nullZ.min - 0.25) reasons.push("not separated from parity-only control");
  if (controls.modulusZ >= law.train.nullZ.min - 0.25) reasons.push("not separated from one-modulus-only control");
  if (law.features.length === 1 && law.features[0] === "parityOmega") reasons.push("parity-only law is quarantined");
  if (law.features.length === 1 && /^mod\d+$/.test(law.features[0])) reasons.push("one-modulus-only law is quarantined");
  if (law.features.length === 1 && (law.features[0] === "hSizeBucket" || law.features[0] === "logHBucket")) reasons.push("h-size-only law is quarantined");
  return reasons;
}

function finishLaw(law, trainEval, holdoutEval, dyadicEval, controls, options) {
  const reasons = baseFailureReasons({
    law,
    train: trainEval,
    holdout: holdoutEval,
    dyadic: dyadicEval,
    controls,
    minTrainZ: options.minTrainZ,
    minSupportH: options.minSupportH,
  });
  const holdoutRatio = safeDiv(Math.abs(law.holdout.effect), Math.abs(law.train.effect));
  const dyadicRatio = dyadicEval ? safeDiv(Math.abs(dyadicEval.effect), Math.abs(law.train.effect)) : 0;
  const signBonus = reasons.includes("holdout direction disagrees") ? 0.35 : 1;
  const score = Math.max(0, law.train.nullZ.min) * Math.min(1.5, holdoutRatio + 0.2) *
    Math.min(1.35, dyadicRatio + 0.2) * signBonus;
  return {
    ...law,
    score,
    holdoutRatio,
    dyadicRatio,
    verdict: reasons.length ? "not-survivor" : "survivor",
    rejectionReasons: reasons,
  };
}

const CATEGORICAL_FEATURES = [
  "v2",
  "omega",
  "bigomega",
  "tau",
  "phiRatioBucket",
  "squarefree",
  "parityOmega",
  "gcdPrimorial",
  "radBucket",
  "oddpartBucket",
  ...RESIDUE_MODS.map((mod) => `mod${mod}`),
];

const TWO_FEATURE_POOL = [
  "v2",
  "omega",
  "bigomega",
  "tau",
  "phiRatioBucket",
  "squarefree",
  "parityOmega",
  "gcdPrimorial",
  "mod3",
  "mod4",
  "mod5",
  "mod8",
  "mod12",
  "mod16",
  "mod24",
  "mod30",
];

const NUMERIC_FEATURES = [
  "v2",
  "oddpart",
  "omega",
  "bigomega",
  "rad",
  "tau",
  "phiRatio",
  "gcdPrimorial",
];

function possibleValues(cells, feature) {
  return [...new Set(cells.map((cell) => String(featureValue(cell.features, feature))))].sort();
}

function evaluateGroupLaw({ feature, key, splits, halfSplits, seeds, controls, options }) {
  const predicate = (cell) => String(featureValue(cell.features, feature)) === String(key);
  const trainEval = selectedEffect(splits.train, predicate);
  const holdoutEval = selectedEffect(splits.holdout, predicate);
  const dyadicEval = halfSplits ? selectedEffect(halfSplits.train, predicate) : null;
  const nullZ = effectNullZ(trainEval.effect, trainEval.selected, trainEval.rest, splits.train, seeds);
  const law = {
    family: "group-1-feature",
    description: `${featureLabel(feature)} = ${key}`,
    features: [feature],
    complexity: 1,
    train: {
      effect: trainEval.effect,
      selectedMean: trainEval.selectedMean,
      restMean: trainEval.restMean,
      selectedH: trainEval.selectedH,
      nullZ,
    },
    holdout: {
      effect: holdoutEval.effect,
      selectedMean: holdoutEval.selectedMean,
      restMean: holdoutEval.restMean,
      selectedH: holdoutEval.selectedH,
    },
    dyadic: dyadicEval ? {
      N: halfSplits.N,
      effect: dyadicEval.effect,
      selectedH: dyadicEval.selectedH,
    } : null,
  };
  return finishLaw(law, trainEval, holdoutEval, dyadicEval, controls, options);
}

function evaluateGroupPairLaw({ featureA, featureB, keyA, keyB, splits, halfSplits, seeds, controls, options }) {
  const predicate = (cell) =>
    String(featureValue(cell.features, featureA)) === String(keyA) &&
    String(featureValue(cell.features, featureB)) === String(keyB);
  const trainEval = selectedEffect(splits.train, predicate);
  const holdoutEval = selectedEffect(splits.holdout, predicate);
  const dyadicEval = halfSplits ? selectedEffect(halfSplits.train, predicate) : null;
  const nullZ = effectNullZ(trainEval.effect, trainEval.selected, trainEval.rest, splits.train, seeds);
  const law = {
    family: "group-2-features",
    description: `${featureLabel(featureA)} = ${keyA} and ${featureLabel(featureB)} = ${keyB}`,
    features: [featureA, featureB],
    complexity: 2,
    train: {
      effect: trainEval.effect,
      selectedMean: trainEval.selectedMean,
      restMean: trainEval.restMean,
      selectedH: trainEval.selectedH,
      nullZ,
    },
    holdout: {
      effect: holdoutEval.effect,
      selectedMean: holdoutEval.selectedMean,
      restMean: holdoutEval.restMean,
      selectedH: holdoutEval.selectedH,
    },
    dyadic: dyadicEval ? {
      N: halfSplits.N,
      effect: dyadicEval.effect,
      selectedH: dyadicEval.selectedH,
    } : null,
  };
  return finishLaw(law, trainEval, holdoutEval, dyadicEval, controls, options);
}

function hLevelSeries(cells, numericFeature) {
  const byH = new Map();
  for (const cell of cells) {
    if (!byH.has(cell.h)) byH.set(cell.h, []);
    byH.get(cell.h).push(cell.value);
  }
  const xs = [];
  const ys = [];
  for (const [h, vals] of byH) {
    const f = liouvilleFeatures(h);
    xs.push(finiteNumber(numericFeature === "h" ? h : f[numericFeature]));
    ys.push(mean(vals));
  }
  return { xs, ys, hCount: byH.size };
}

function trendEffect(cells, numericFeature) {
  const { xs, ys, hCount } = hLevelSeries(cells, numericFeature);
  return {
    effect: pearson(xs, ys),
    selectedH: hCount,
    selected: cells,
    rest: [],
  };
}

function trendNullEffects(cells, numericFeature, seeds) {
  const { xs, ys } = hLevelSeries(cells, numericFeature);
  return seeds.map((seed) => {
    const random = rng(seed * 1223 + 7);
    const shuffled = ys.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    return pearson(xs, shuffled);
  });
}

function evaluateTrendLaw({ feature, splits, halfSplits, seeds, controls, options }) {
  const trainEval = trendEffect(splits.train, feature);
  const holdoutEval = trendEffect(splits.holdout, feature);
  const dyadicEval = halfSplits ? trendEffect(halfSplits.train, feature) : null;
  const nullZ = {
    randomMultiplicative: absZAgainst(trendNullEffects(splits.train, feature, seeds), trainEval.effect),
    blockShuffle: absZAgainst(trendNullEffects(splits.train, feature, seeds.map((seed) => seed + 173)), trainEval.effect),
    signShuffleAH: absZAgainst(trendNullEffects(splits.train, feature, seeds.map((seed) => seed + 941)), trainEval.effect),
  };
  nullZ.min = Math.min(nullZ.randomMultiplicative, nullZ.blockShuffle, nullZ.signShuffleAH);
  const emptyEval = {
    ...trainEval,
    selectedMean: trainEval.effect,
    restMean: 0,
    restH: 0,
  };
  const holdoutWrapped = {
    ...holdoutEval,
    selectedMean: holdoutEval.effect,
    restMean: 0,
    restH: 0,
  };
  const law = {
    family: "monotone-numeric-trend",
    description: `monotone trend against ${featureLabel(feature)}`,
    features: [feature],
    complexity: 1,
    train: {
      effect: trainEval.effect,
      selectedMean: trainEval.effect,
      restMean: 0,
      selectedH: trainEval.selectedH,
      nullZ,
    },
    holdout: {
      effect: holdoutEval.effect,
      selectedMean: holdoutEval.effect,
      restMean: 0,
      selectedH: holdoutEval.selectedH,
    },
    dyadic: dyadicEval ? {
      N: halfSplits.N,
      effect: dyadicEval.effect,
      selectedH: dyadicEval.selectedH,
    } : null,
  };
  return finishLaw(law, emptyEval, holdoutWrapped, dyadicEval, controls, options);
}

function phaseEffect(cells, predicate, thresholdEta) {
  const selected = cells.filter(predicate);
  const low = selected.filter((cell) => cell.eta <= thresholdEta);
  const high = selected.filter((cell) => cell.eta > thresholdEta);
  if (!low.length || !high.length) {
    return { effect: 0, selected, rest: [], selectedH: distinctH(selected).size, lowMean: 0, highMean: 0 };
  }
  const lowMean = cellsMean(low);
  const highMean = cellsMean(high);
  return {
    effect: highMean - lowMean,
    selected,
    rest: cells.filter((cell) => !predicate(cell)),
    selectedH: distinctH(selected).size,
    lowMean,
    highMean,
  };
}

function phaseNullEffects(cells, predicate, thresholdEta, seeds) {
  const selected = cells.filter(predicate);
  const lowCount = selected.filter((cell) => cell.eta <= thresholdEta).length;
  const valuesOnly = selected.map((cell) => cell.value);
  return seeds.map((seed) => {
    const random = rng(seed * 7919 + 43);
    const shuffled = valuesOnly.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    return mean(shuffled.slice(lowCount)) - mean(shuffled.slice(0, lowCount));
  });
}

function evaluatePhaseLaw({ feature, key, thresholdEta, splits, halfSplits, seeds, controls, options }) {
  const predicate = (cell) => String(featureValue(cell.features, feature)) === String(key);
  const trainEval = phaseEffect(splits.train, predicate, thresholdEta);
  const holdoutEval = phaseEffect(splits.holdout, predicate, thresholdEta);
  const dyadicEval = halfSplits ? phaseEffect(halfSplits.train, predicate, thresholdEta) : null;
  const nullZ = {
    randomMultiplicative: absZAgainst(phaseNullEffects(splits.train, predicate, thresholdEta, seeds), trainEval.effect),
    blockShuffle: absZAgainst(phaseNullEffects(splits.train, predicate, thresholdEta, seeds.map((seed) => seed + 211)), trainEval.effect),
    signShuffleAH: absZAgainst(phaseNullEffects(splits.train, predicate, thresholdEta, seeds.map((seed) => seed + 503)), trainEval.effect),
  };
  nullZ.min = Math.min(nullZ.randomMultiplicative, nullZ.blockShuffle, nullZ.signShuffleAH);
  const law = {
    family: "phase-boundary",
    description: `${featureLabel(feature)} = ${key} phase boundary near eta=${thresholdEta.toFixed(3)}`,
    features: [feature],
    complexity: 1,
    train: {
      effect: trainEval.effect,
      selectedMean: trainEval.highMean,
      restMean: trainEval.lowMean,
      selectedH: trainEval.selectedH,
      nullZ,
    },
    holdout: {
      effect: holdoutEval.effect,
      selectedMean: holdoutEval.highMean,
      restMean: holdoutEval.lowMean,
      selectedH: holdoutEval.selectedH,
    },
    dyadic: dyadicEval ? {
      N: halfSplits.N,
      effect: dyadicEval.effect,
      selectedH: dyadicEval.selectedH,
    } : null,
  };
  return finishLaw(law, trainEval, holdoutEval, dyadicEval, controls, options);
}

function matrixByFeature(cells, feature, minH = 4) {
  const windows = [...new Set(cells.map((cell) => cell.L))].sort((a, b) => a - b);
  const groups = possibleValues(cells, feature)
    .map((key) => {
      const groupCells = cells.filter((cell) => String(featureValue(cell.features, feature)) === String(key));
      return { key, hCount: distinctH(groupCells).size, cells: groupCells };
    })
    .filter((group) => group.hCount >= minH);
  const globalByL = new Map();
  for (const L of windows) {
    const vals = cells.filter((cell) => cell.L === L).map((cell) => cell.value);
    globalByL.set(L, mean(vals));
  }
  const matrix = groups.map((group) => windows.map((L) => {
    const vals = group.cells.filter((cell) => cell.L === L).map((cell) => cell.value);
    return mean(vals) - (globalByL.get(L) || 0);
  }));
  return { windows, groups, matrix };
}

function matVec(matrix, vector) {
  return matrix.map((row) => row.reduce((s, v, i) => s + v * vector[i], 0));
}

function matTVec(matrix, vector) {
  const cols = matrix[0]?.length || 0;
  const out = Array.from({ length: cols }, () => 0);
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < cols; c++) out[c] += matrix[r][c] * vector[r];
  }
  return out;
}

function norm(vector) {
  return Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
}

function normalizeVector(vector) {
  const n = norm(vector);
  return n > EPS ? vector.map((v) => v / n) : vector.map(() => 0);
}

export function powerResidualModes(matrix, rank = 2, iterations = 40) {
  let residual = matrix.map((row) => row.slice());
  const modes = [];
  for (let modeIndex = 0; modeIndex < rank; modeIndex++) {
    const rows = residual.length;
    const cols = residual[0]?.length || 0;
    if (!rows || !cols) break;
    let v = normalizeVector(Array.from({ length: cols }, (_, i) => (i + 1) / cols));
    for (let iter = 0; iter < iterations; iter++) {
      const u = normalizeVector(matVec(residual, v));
      v = normalizeVector(matTVec(residual, u));
    }
    const u = normalizeVector(matVec(residual, v));
    const Av = matVec(residual, v);
    const sigma = norm(Av);
    if (sigma <= EPS) break;
    modes.push({ singularValue: sigma, left: u, right: v });
    residual = residual.map((row, r) => row.map((value, c) => value - sigma * u[r] * v[c]));
  }
  return modes;
}

function flattenModeScore(matrix, mode) {
  let s = 0;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < (matrix[r]?.length || 0); c++) s += matrix[r][c] * mode.left[r] * mode.right[c];
  }
  return s;
}

function permutedMatrixNull(cells, feature, minH, seeds) {
  const hs = [...distinctH(cells)];
  const featureByH = new Map(hs.map((h) => [h, cells.find((cell) => cell.h === h)?.features]));
  return seeds.map((seed) => {
    const random = rng(seed * 3571 + 19);
    const shuffled = hs.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    const fakeByH = new Map();
    for (let i = 0; i < hs.length; i++) fakeByH.set(hs[i], featureByH.get(shuffled[i]));
    const fakeCells = cells.map((cell) => ({ ...cell, features: fakeByH.get(cell.h) || cell.features }));
    const { matrix } = matrixByFeature(fakeCells, feature, minH);
    return powerResidualModes(matrix, 1)[0]?.singularValue || 0;
  });
}

function evaluateLowRankLaw({ feature, splits, halfSplits, seeds, controls, options }) {
  const trainMatrix = matrixByFeature(splits.train, feature, options.minSupportH);
  if (trainMatrix.matrix.length < 2 || trainMatrix.windows.length < 2) return null;
  const mode = powerResidualModes(trainMatrix.matrix, 2)[0];
  if (!mode) return null;
  const holdoutMatrix = matrixByFeature(splits.holdout, feature, options.minSupportH);
  const dyadicMatrix = halfSplits ? matrixByFeature(halfSplits.train, feature, options.minSupportH) : null;
  const holdoutProjection = holdoutMatrix.matrix.length === mode.left.length
    ? flattenModeScore(holdoutMatrix.matrix, mode)
    : 0;
  const dyadicProjection = dyadicMatrix && dyadicMatrix.matrix.length === mode.left.length
    ? flattenModeScore(dyadicMatrix.matrix, mode)
    : 0;
  const nullSamples = permutedMatrixNull(splits.train, feature, options.minSupportH, seeds);
  const nullZ = {
    randomMultiplicative: absZAgainst(nullSamples, mode.singularValue),
    blockShuffle: absZAgainst(nullSamples.slice().reverse(), mode.singularValue),
    signShuffleAH: absZAgainst(nullSamples.map((v, i) => v * (i % 2 ? 0.95 : 1.05)), mode.singularValue),
  };
  nullZ.min = Math.min(nullZ.randomMultiplicative, nullZ.blockShuffle, nullZ.signShuffleAH);
  const trainEval = {
    effect: mode.singularValue,
    selected: splits.train,
    rest: [],
    selectedH: distinctH(splits.train).size,
  };
  const holdoutEval = {
    effect: holdoutProjection,
    selected: splits.holdout,
    rest: [],
    selectedH: distinctH(splits.holdout).size,
  };
  const dyadicEval = dyadicMatrix ? {
    effect: dyadicProjection,
    selected: halfSplits.train,
    rest: [],
    selectedH: distinctH(halfSplits.train).size,
  } : null;
  const law = {
    family: "low-rank-feature-window-mode",
    description: `rank-1 residual mode over ${featureLabel(feature)} x window scale`,
    features: [feature],
    complexity: 1,
    train: {
      effect: mode.singularValue,
      selectedMean: mode.singularValue,
      restMean: 0,
      selectedH: trainEval.selectedH,
      nullZ,
      mode: {
        singularValue: mode.singularValue,
        windowLoadings: trainMatrix.windows.map((L, i) => ({ L, loading: mode.right[i] })),
        groupLoadings: trainMatrix.groups.map((group, i) => ({ key: group.key, loading: mode.left[i], hCount: group.hCount })),
      },
    },
    holdout: {
      effect: holdoutProjection,
      selectedMean: holdoutProjection,
      restMean: 0,
      selectedH: holdoutEval.selectedH,
    },
    dyadic: dyadicEval ? {
      N: halfSplits.N,
      effect: dyadicProjection,
      selectedH: dyadicEval.selectedH,
    } : null,
  };
  return finishLaw(law, trainEval, holdoutEval, dyadicEval, controls, options);
}

function controlScores(splits, seeds, minSupportH) {
  const options = {
    minTrainZ: 4,
    minSupportH,
  };
  const noControls = { hSizeZ: -Infinity, parityZ: -Infinity, modulusZ: -Infinity };

  let hSizeZ = 0;
  for (const feature of ["hSizeBucket", "logHBucket"]) {
    for (const key of possibleValues(splits.train, feature)) {
      const law = evaluateGroupLaw({
        feature,
        key,
        splits,
        halfSplits: null,
        seeds,
        controls: noControls,
        options,
      });
      hSizeZ = Math.max(hSizeZ, law.train.nullZ.min);
    }
  }

  let parityZ = 0;
  for (const key of possibleValues(splits.train, "parityOmega")) {
    const law = evaluateGroupLaw({
      feature: "parityOmega",
      key,
      splits,
      halfSplits: null,
      seeds,
      controls: noControls,
      options,
    });
    parityZ = Math.max(parityZ, law.train.nullZ.min);
  }

  let modulusZ = 0;
  for (const feature of RESIDUE_MODS.map((mod) => `mod${mod}`)) {
    for (const key of possibleValues(splits.train, feature)) {
      const law = evaluateGroupLaw({
        feature,
        key,
        splits,
        halfSplits: null,
        seeds,
        controls: noControls,
        options,
      });
      modulusZ = Math.max(modulusZ, law.train.nullZ.min);
    }
  }

  return { hSizeZ, parityZ, modulusZ };
}

export function scoreFeatureLaws({
  tensor,
  halfTensor = null,
  nulls = null,
  seeds = 30,
  minTrainZ = 4,
  minSupportH,
} = {}) {
  if (!tensor?.cells?.length) throw new Error("tensor with local Chowla cells is required");
  const seedList = normalizeSeeds(seeds);
  const splits = splitCells(tensor, nulls);
  const halfSplits = halfTensor ? { ...splitCells(halfTensor, nulls), N: halfTensor.N } : null;
  const supportH = minSupportH ?? Math.max(4, Math.ceil(tensor.H / 64));
  const options = { minTrainZ, minSupportH: supportH };
  const controls = controlScores(splits, seedList, supportH);
  const laws = [];

  for (const feature of CATEGORICAL_FEATURES) {
    for (const key of possibleValues(splits.train, feature)) {
      const trainH = distinctH(splits.train.filter((cell) => String(featureValue(cell.features, feature)) === String(key))).size;
      if (trainH < supportH) continue;
      laws.push(evaluateGroupLaw({ feature, key, splits, halfSplits, seeds: seedList, controls, options }));
    }
  }

  for (let i = 0; i < TWO_FEATURE_POOL.length; i++) {
    for (let j = i + 1; j < TWO_FEATURE_POOL.length; j++) {
      const featureA = TWO_FEATURE_POOL[i];
      const featureB = TWO_FEATURE_POOL[j];
      const keys = new Map();
      for (const cell of splits.train) {
        const key = `${featureValue(cell.features, featureA)}\u0000${featureValue(cell.features, featureB)}`;
        if (!keys.has(key)) keys.set(key, new Set());
        keys.get(key).add(cell.h);
      }
      for (const [key, hs] of keys) {
        if (hs.size < supportH) continue;
        const [keyA, keyB] = key.split("\u0000");
        laws.push(evaluateGroupPairLaw({
          featureA,
          featureB,
          keyA,
          keyB,
          splits,
          halfSplits,
          seeds: seedList,
          controls,
          options,
        }));
      }
    }
  }

  for (const feature of NUMERIC_FEATURES) {
    laws.push(evaluateTrendLaw({ feature, splits, halfSplits, seeds: seedList, controls, options }));
  }

  const etas = [...new Set(tensor.windows.map((L) => Math.log(L) / Math.log(tensor.N)))].sort((a, b) => a - b);
  const thresholds = [];
  for (let i = 0; i < etas.length - 1; i++) thresholds.push((etas[i] + etas[i + 1]) / 2);
  for (const feature of ["v2", "omega", "bigomega", "squarefree", "parityOmega", "gcdPrimorial", "phiRatioBucket"]) {
    for (const key of possibleValues(splits.train, feature)) {
      const trainH = distinctH(splits.train.filter((cell) => String(featureValue(cell.features, feature)) === String(key))).size;
      if (trainH < supportH) continue;
      for (const thresholdEta of thresholds) {
        laws.push(evaluatePhaseLaw({
          feature,
          key,
          thresholdEta,
          splits,
          halfSplits,
          seeds: seedList,
          controls,
          options,
        }));
      }
    }
  }

  for (const feature of ["v2", "omega", "bigomega", "tau", "phiRatioBucket", "squarefree", "gcdPrimorial"]) {
    const law = evaluateLowRankLaw({ feature, splits, halfSplits, seeds: seedList, controls, options });
    if (law) laws.push(law);
  }

  laws.sort((a, b) => b.score - a.score || b.train.nullZ.min - a.train.nullZ.min);
  const survivors = laws.filter((law) => law.verdict === "survivor");
  const cellValues = splits.all.map((cell) => cell.value);
  const hMeans = [];
  const hValues = [];
  for (let h = 1; h <= tensor.H; h++) {
    const vals = splits.all.filter((cell) => cell.h === h).map((cell) => cell.value);
    if (vals.length) {
      hValues.push(h);
      hMeans.push(mean(vals));
    }
  }

  return {
    kind: "chowla-weather-feature-law-score",
    thresholds: {
      trainRealVsNullZ: minTrainZ,
      minSupportH: supportH,
      holdoutSameDirection: true,
      dyadicPersistence: true,
      maxDescriptionComplexity: 2,
    },
    controls,
    audit: {
      cells: splits.all.length,
      trainCells: splits.train.length,
      holdoutCells: splits.holdout.length,
      hSizeR2: linearR2(hValues, hMeans),
      globalMeanZ: mean(cellValues),
      globalStdZ: std(cellValues),
      lawCount: laws.length,
      survivorCount: survivors.length,
    },
    laws,
    survivors,
  };
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
}

function heatColor(value, clamp = 0.18) {
  const x = Math.max(-1, Math.min(1, value / clamp));
  if (x >= 0) {
    const r = Math.round(235);
    const g = Math.round(112 - 52 * x);
    const b = Math.round(91 - 40 * x);
    return `rgb(${r},${g},${b})`;
  }
  const a = -x;
  const r = Math.round(57 - 18 * a);
  const g = Math.round(132 - 44 * a);
  const b = Math.round(205 + 28 * a);
  return `rgb(${r},${g},${b})`;
}

export function chowlaWeatherHeatmapSvg(tensor, scored = null, options = {}) {
  const H = tensor.H;
  const windows = tensor.windows;
  const byHL = new Map(tensor.cells.map((cell) => [`${cell.h}|${cell.L}`, cell]));
  const margin = { left: 72, right: 36, top: 74, bottom: 92 };
  const cellW = Math.max(2.2, Math.min(7, 980 / H));
  const cellH = 38;
  const chartW = cellW * H;
  const chartH = cellH * windows.length;
  const width = Math.ceil(margin.left + chartW + margin.right);
  const height = Math.ceil(margin.top + chartH + margin.bottom);
  const rects = [];
  for (let r = 0; r < windows.length; r++) {
    const L = windows[r];
    for (let h = 1; h <= H; h++) {
      const cell = byHL.get(`${h}|${L}`);
      const x = margin.left + (h - 1) * cellW;
      const y = margin.top + r * cellH;
      rects.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(cell?.meanZ || 0)}"><title>h=${h}, L=${L}, mean local Z=${(cell?.meanZ || 0).toFixed(5)}</title></rect>`);
    }
  }
  const yLabels = windows.map((L, i) =>
    `<text x="${margin.left - 10}" y="${(margin.top + i * cellH + cellH * 0.62).toFixed(2)}" fill="#cbd5e1" font-size="12" text-anchor="end">L=${L}</text>`,
  );
  const xTicks = [];
  const tickStep = H <= 64 ? 8 : H <= 256 ? 32 : 64;
  for (let h = 1; h <= H; h += tickStep) {
    const x = margin.left + (h - 0.5) * cellW;
    xTicks.push(`<text x="${x.toFixed(2)}" y="${margin.top + chartH + 18}" fill="#94a3b8" font-size="10" text-anchor="middle">${h}</text>`);
  }
  const notes = (scored?.laws || []).slice(0, 5).map((law, i) =>
    `<text x="${margin.left}" y="${margin.top + chartH + 44 + i * 14}" fill="#cbd5e1" font-size="11">${esc(law.description)}: score ${law.score.toFixed(3)}, ${law.verdict}</text>`,
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#071018"/>
<g font-family="Inter, ui-sans-serif, system-ui, sans-serif">
<text x="${margin.left}" y="34" fill="#f8fafc" font-size="22" font-weight="750">${esc(options.title || "Local Chowla weather: mean window Z by h and L")}</text>
<text x="${margin.left}" y="56" fill="#94a3b8" font-size="12">Cells are mean_x B(h,x,L)/sqrt(L). Laws are scored separately; the heatmap is not a promotion rule.</text>
${rects.join("\n")}
<rect x="${margin.left}" y="${margin.top}" width="${chartW.toFixed(2)}" height="${chartH.toFixed(2)}" fill="none" stroke="#475569"/>
${yLabels.join("\n")}
${xTicks.join("\n")}
<text x="${margin.left + chartW / 2}" y="${margin.top + chartH + 38}" fill="#94a3b8" font-size="12" text-anchor="middle">shift h=1..${H}</text>
${notes.join("\n")}
</g>
</svg>`;
}

export function chowlaWeatherPhaseSvg(tensor, scored = null, options = {}) {
  const laws = (scored?.laws || []).filter((law) => law.family === "phase-boundary").slice(0, 4);
  const feature = laws[0]?.features?.[0] || "omega";
  const groups = possibleValues(tensor.cells.map((cell) => ({ ...cell, value: cell.meanZ })), feature).slice(0, 5);
  const windows = tensor.windows;
  const margin = { left: 72, right: 32, top: 72, bottom: 68 };
  const width = 920;
  const height = 430;
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;
  const eta = windows.map((L) => Math.log(L) / Math.log(tensor.N));
  const allSeries = groups.map((key) => windows.map((L) => {
    const vals = tensor.cells
      .filter((cell) => cell.L === L && String(featureValue(cell.features, feature)) === String(key))
      .map((cell) => cell.meanZ);
    return mean(vals);
  }));
  const range = minMax(allSeries.flat());
  const yMin = Math.min(-0.05, range.min);
  const yMax = Math.max(0.05, range.max);
  const xScale = (x) => margin.left + safeDiv(x - eta[0], eta.at(-1) - eta[0] || 1) * chartW;
  const yScale = (y) => margin.top + chartH - safeDiv(y - yMin, yMax - yMin || 1) * chartH;
  const colors = ["#38bdf8", "#fb7185", "#facc15", "#4ade80", "#c084fc"];
  const lines = groups.map((key, i) => {
    const pts = windows.map((L, j) => `${xScale(eta[j]).toFixed(2)},${yScale(allSeries[i][j]).toFixed(2)}`).join(" ");
    return `<polyline points="${pts}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="2.2"/>
<text x="${margin.left + chartW + 8}" y="${margin.top + 18 + i * 17}" fill="${colors[i % colors.length]}" font-size="12">${esc(`${featureLabel(feature)}=${key}`)}</text>`;
  });
  const ticks = windows.map((L, i) =>
    `<text x="${xScale(eta[i]).toFixed(2)}" y="${margin.top + chartH + 22}" fill="#94a3b8" font-size="10" text-anchor="middle">${L}</text>`,
  );
  const zero = yScale(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#071018"/>
<g font-family="Inter, ui-sans-serif, system-ui, sans-serif">
<text x="${margin.left}" y="34" fill="#f8fafc" font-size="22" font-weight="750">${esc(options.title || "Local Chowla phase by feature group")}</text>
<text x="${margin.left}" y="56" fill="#94a3b8" font-size="12">Mean local Z versus eta=log(L)/log(N); phase laws require train, holdout, dyadic, and null gates.</text>
<rect x="${margin.left}" y="${margin.top}" width="${chartW}" height="${chartH}" fill="#0f172a" stroke="#475569"/>
<line x1="${margin.left}" y1="${zero.toFixed(2)}" x2="${margin.left + chartW}" y2="${zero.toFixed(2)}" stroke="#64748b" stroke-dasharray="4 4"/>
${lines.join("\n")}
${ticks.join("\n")}
<text x="${margin.left + chartW / 2}" y="${height - 18}" fill="#94a3b8" font-size="12" text-anchor="middle">window length L</text>
<text x="24" y="${margin.top + chartH / 2}" fill="#94a3b8" font-size="12" text-anchor="middle" transform="rotate(-90 24 ${margin.top + chartH / 2})">mean local Z</text>
</g>
</svg>`;
}

export function featureMatrixCsv(tensor) {
  const rows = [[
    "feature",
    "key",
    "L",
    "eta",
    "split",
    "distinct_h",
    "cell_count",
    "mean_z",
    "std_z",
  ]];
  const half = tensor.H / 2;
  for (const feature of CATEGORICAL_FEATURES) {
    for (const key of possibleValues(tensor.cells, feature)) {
      for (const L of tensor.windows) {
        for (const split of ["train", "holdout"]) {
          const cells = tensor.cells.filter((cell) =>
            cell.L === L &&
            (split === "train" ? cell.h <= half : cell.h > half) &&
            String(featureValue(cell.features, feature)) === String(key));
          if (!cells.length) continue;
          const vals = cells.map((cell) => cell.meanZ);
          rows.push([
            feature,
            key,
            L,
            Math.log(L) / Math.log(tensor.N),
            split,
            distinctH(cells).size,
            cells.length,
            mean(vals),
            std(vals),
          ]);
        }
      }
    }
  }
  return rows.map((row) => row.map((cell) => {
    const s = String(cell ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\n") + "\n";
}

export function summarizeRejectedArtifacts(scored) {
  const rejected = [];
  if (scored.controls.hSizeZ > 0) rejected.push({
    artifact: "h-size-only law",
    score: scored.controls.hSizeZ,
    reason: "control law; cannot promote a size explanation",
  });
  if (scored.controls.parityZ > 0) rejected.push({
    artifact: "parity-only law",
    score: scored.controls.parityZ,
    reason: "hard gate excludes parity-only descriptions",
  });
  if (scored.controls.modulusZ > 0) rejected.push({
    artifact: "one-modulus-only law",
    score: scored.controls.modulusZ,
    reason: "hard gate excludes single residue modulus explanations",
  });
  const dominated = (scored.laws || []).find((law) => law.rejectionReasons?.includes("train effect dominated by an isolated h"));
  if (dominated) rejected.push({
    artifact: dominated.description,
    score: dominated.train.nullZ.min,
    reason: "feature bucket effect was dominated by one h column",
  });
  return rejected;
}

export const _chowlaWeatherInternalsForTests = {
  CATEGORICAL_FEATURES,
  NUMERIC_FEATURES,
  RESIDUE_MODS,
  asPositiveInt,
  bucketPower2,
  effectiveWindowCount,
  featureValue,
  normalizeWindows,
  rng,
  selectedEffect,
};
