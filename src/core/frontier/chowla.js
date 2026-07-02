/* FrontierLab Chowla/Liouville residual search.
   This module is deliberately standalone: no zeta tables, no explicit
   formula imports, and no RH-equivalent criteria. */

const EPS = 1e-12;

function asPositiveInt(value, fallback, name) {
  const n = Number.isFinite(Number(value)) ? Math.floor(Number(value)) : fallback;
  if (n < 1) throw new Error(`${name} must be a positive integer`);
  return n;
}

function normalizeNs(N) {
  const raw = Array.isArray(N) ? N : [N];
  const ns = raw.map((value) => asPositiveInt(value, 1, "N"));
  ns.sort((a, b) => a - b);
  return [...new Set(ns)];
}

function normalizeSeeds(seeds) {
  if (Array.isArray(seeds)) {
    const out = seeds.map((seed) => Math.floor(Number(seed)) || 1);
    return out.length ? out : [1];
  }
  const count = asPositiveInt(seeds ?? 1, 1, "seeds");
  return Array.from({ length: count }, (_, i) => i + 1);
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

function energy(values) {
  if (!values.length) return 0;
  let s = 0;
  for (const v of values) s += v * v;
  return Math.sqrt(s / values.length);
}

function maxAbs(values) {
  let m = 0;
  for (const v of values) if (Math.abs(v) > m) m = Math.abs(v);
  return m;
}

function linearR2(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  if (sxx <= EPS || syy <= EPS) return 0;
  return Math.max(0, Math.min(1, (sxy * sxy) / (sxx * syy)));
}

function signedPersistence(values) {
  if (values.length < 2) return 1;
  let same = 0, comparable = 0;
  for (let i = 1; i < values.length; i++) {
    if (Math.abs(values[i - 1]) < EPS || Math.abs(values[i]) < EPS) continue;
    comparable++;
    if (Math.sign(values[i - 1]) === Math.sign(values[i])) same++;
  }
  const signScore = comparable ? same / comparable : 0;
  const mags = values.map((v) => Math.abs(v));
  const m = mean(mags);
  const magnitudeScore = m > EPS ? 1 / (1 + std(mags, m) / m) : 0;
  return signScore * magnitudeScore;
}

function holdoutCheck(values) {
  if (values.length < 2) return { pass: true, ratio: 1, trainMean: values[0] || 0, holdout: values[0] || 0 };
  const train = values.slice(0, -1);
  const trainMean = mean(train);
  const holdout = values[values.length - 1];
  const trainAbs = mean(train.map((v) => Math.abs(v)));
  const ratio = Math.abs(holdout) / (trainAbs + EPS);
  const signPass = Math.abs(trainMean) > EPS && Math.sign(trainMean) === Math.sign(holdout);
  return { pass: signPass && ratio >= 0.45, ratio, trainMean, holdout };
}

function bucketPower2(value) {
  const v = Math.max(1, Math.floor(value));
  if (v === 1) return "1";
  const e = Math.floor(Math.log2(v));
  const lo = 2 ** e;
  const hi = 2 ** (e + 1) - 1;
  return `${lo}-${hi}`;
}

function factorFeatures(h) {
  let m = Math.max(1, Math.floor(h));
  let rad = 1;
  let omega = 0;
  let bigomega = 0;
  let squarefree = true;
  let v2 = 0;

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
    rad *= p;
  }
  if (m > 1) {
    omega++;
    bigomega++;
    rad *= m;
  }
  const oddpart = h / (2 ** v2);
  return {
    rad,
    omega,
    bigomega,
    squarefree,
    v2,
    oddpart,
    parityBigomega: bigomega % 2 ? "odd" : "even",
    radBucket: bucketPower2(rad),
    oddpartBucket: bucketPower2(oddpart),
  };
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

function rowsFromSums(N, H, sums) {
  const sqrtN = Math.sqrt(Math.max(1, N));
  const rows = [];
  for (let h = 1; h <= H; h++) {
    const S = sums[h] || 0;
    rows.push({
      N,
      h,
      pairs: Math.max(0, N - h),
      S,
      Z: S / sqrtN,
      ...factorFeatures(h),
    });
  }
  return rows;
}

function pairSumsForNs(values, Ns, H) {
  const levels = Ns.map(() => new Float64Array(H + 1));
  const maxN = Ns[Ns.length - 1] || 0;
  for (let h = 1; h <= H; h++) {
    let levelIndex = 0;
    while (levelIndex < Ns.length && Ns[levelIndex] - h <= 0) {
      levels[levelIndex][h] = 0;
      levelIndex++;
    }
    const maxT = Math.min(maxN - h, values.length - 1 - h);
    let sum = 0;
    for (let n = 1; n <= maxT; n++) {
      sum += values[n] * values[n + h];
      while (levelIndex < Ns.length && n === Ns[levelIndex] - h) {
        levels[levelIndex][h] = sum;
        levelIndex++;
      }
    }
    while (levelIndex < Ns.length) {
      levels[levelIndex][h] = sum;
      levelIndex++;
    }
  }
  return levels;
}

export function chowlaPairMatrix({ N, H }) {
  const nMax = asPositiveInt(N, 1, "N");
  const hMax = asPositiveInt(H, 1, "H");
  const lambda = liouvilleUpTo(nMax);
  const sums = pairSumsForNs(lambda, [nMax], hMax)[0];
  return rowsFromSums(nMax, hMax, sums);
}

export function dyadicChowlaAtlas({ N0, levels, H }) {
  const start = asPositiveInt(N0, 1, "N0");
  const levelCount = asPositiveInt(levels, 1, "levels");
  const hMax = asPositiveInt(H, 1, "H");
  const Ns = Array.from({ length: levelCount }, (_, j) => start * (2 ** j));
  const lambda = liouvilleUpTo(Ns[Ns.length - 1]);
  const sums = pairSumsForNs(lambda, Ns, hMax);
  return {
    kind: "chowla-dyadic-atlas",
    N0: start,
    levelCount,
    H: hMax,
    Ns,
    levels: Ns.map((N, i) => ({ index: i, N, rows: rowsFromSums(N, hMax, sums[i]) })),
  };
}

function randomCompletelyMultiplicativeSigns(nMax, seed) {
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

function shuffledSigns(values, seed) {
  const random = rng(seed);
  const out = new Int8Array(values.length);
  out.set(values);
  for (let i = out.length - 1; i >= 2; i--) {
    const j = 1 + Math.floor(random() * i);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function buildNull(kind, Ns, H, seeds, sequenceForSeed) {
  const levels = Ns.map((N) => ({
    N,
    rows: Array.from({ length: H }, (_, i) => ({
      N,
      h: i + 1,
      meanS: 0,
      stdS: 0,
      meanZ: 0,
      stdZ: 0,
      samplesS: [],
      samplesZ: [],
      ...factorFeatures(i + 1),
    })),
  }));

  for (const seed of seeds) {
    const values = sequenceForSeed(seed);
    const sums = pairSumsForNs(values, Ns, H);
    for (let levelIndex = 0; levelIndex < Ns.length; levelIndex++) {
      const sqrtN = Math.sqrt(Math.max(1, Ns[levelIndex]));
      for (let h = 1; h <= H; h++) {
        const S = sums[levelIndex][h] || 0;
        const Z = S / sqrtN;
        const row = levels[levelIndex].rows[h - 1];
        row.samplesS.push(S);
        row.samplesZ.push(Z);
      }
    }
  }

  for (const level of levels) {
    for (const row of level.rows) {
      row.meanS = mean(row.samplesS);
      row.stdS = std(row.samplesS, row.meanS);
      row.meanZ = mean(row.samplesZ);
      row.stdZ = std(row.samplesZ, row.meanZ);
    }
  }

  return { kind, seeds, H, Ns, levels };
}

export function randomMultiplicativeNull({ N, H, seeds }) {
  const Ns = normalizeNs(N);
  const hMax = asPositiveInt(H, 1, "H");
  const seedList = normalizeSeeds(seeds);
  const maxN = Ns[Ns.length - 1];
  return buildNull("random-multiplicative", Ns, hMax, seedList, (seed) =>
    randomCompletelyMultiplicativeSigns(maxN, seed),
  );
}

export function shuffleNull({ lambda, N, H, seeds }) {
  const Ns = normalizeNs(N);
  const hMax = asPositiveInt(H, 1, "H");
  const seedList = normalizeSeeds(seeds);
  const maxN = Ns[Ns.length - 1];
  const source = lambda ? new Int8Array(lambda.slice(0, maxN + 1)) : liouvilleUpTo(maxN);
  if (source.length <= maxN) throw new Error("lambda is shorter than the requested maximum N");
  return buildNull("shuffle", Ns, hMax, seedList, (seed) => shuffledSigns(source, seed));
}

function nullRows(nulls, kind) {
  if (!nulls) return null;
  if (nulls.kind === kind) return nulls;
  return nulls[kind] || nulls[kind.replace("-", "")] || nulls[kind.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] || null;
}

function standardized(value, row) {
  if (!row) return value;
  const s = row.stdZ > 1e-9 ? row.stdZ : 1;
  return (value - row.meanZ) / s;
}

function rowNullZ(levelIndex, h, nullObj) {
  return nullObj?.levels?.[levelIndex]?.rows?.[h - 1] || null;
}

function descriptionForRow(row) {
  return `h=${row.h} (rad=${row.rad}, omega=${row.omega}, Omega=${row.bigomega}, v2=${row.v2}, ${row.squarefree ? "squarefree" : "not squarefree"})`;
}

function individualComplexity(row) {
  let bonus = row.h <= 8 ? 0.75 : 0.42;
  if ((row.h & (row.h - 1)) === 0) bonus += 0.18;
  if (row.squarefree) bonus += 0.06;
  if (row.rad <= 30) bonus += 0.08;
  return Math.min(1.15, bonus);
}

const FEATURE_DEFS = [
  { feature: "omega", label: "omega(h)", key: (row) => String(row.omega), complexity: 1.08 },
  { feature: "bigomega", label: "Omega(h)", key: (row) => String(row.bigomega), complexity: 1.05 },
  { feature: "squarefree", label: "squarefree(h)", key: (row) => row.squarefree ? "squarefree" : "nonsquarefree", complexity: 1.08 },
  { feature: "v2", label: "v2(h)", key: (row) => String(row.v2), complexity: 0.95, disguise: "trivial small-prime divisibility" },
  { feature: "parityBigomega", label: "Omega(h) parity", key: (row) => row.parityBigomega, complexity: 0.92, disguise: "parity only" },
  { feature: "radBucket", label: "rad(h) dyadic bucket", key: (row) => row.radBucket, complexity: 0.86 },
  { feature: "oddpartBucket", label: "oddpart(h) dyadic bucket", key: (row) => row.oddpartBucket, complexity: 0.86 },
];

function featureSummary(rows, values, def) {
  const groups = new Map();
  for (let i = 0; i < rows.length; i++) {
    const key = def.key(rows[i]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ row: rows[i], value: values[i] });
  }
  const totalMean = mean(values);
  let sst = 0;
  for (const v of values) {
    const d = v - totalMean;
    sst += d * d;
  }
  let sse = 0;
  const groupRows = [];
  for (const [key, items] of groups) {
    const vals = items.map((item) => item.value);
    const m = mean(vals);
    for (const v of vals) {
      const d = v - m;
      sse += d * d;
    }
    groupRows.push({
      key,
      n: vals.length,
      h: items.map((item) => item.row.h),
      mean: m,
      absMean: Math.abs(m),
      energy: energy(vals),
    });
  }
  groupRows.sort((a, b) => Math.abs(b.mean) - Math.abs(a.mean));
  return {
    feature: def.feature,
    label: def.label,
    r2: sst > EPS ? Math.max(0, 1 - sse / sst) : 0,
    groups: groupRows,
  };
}

function groupNullZ(levelIndex, members, nullObj) {
  const first = nullObj?.levels?.[levelIndex]?.rows?.[members[0] - 1];
  const sampleCount = first?.samplesZ?.length || 0;
  if (!sampleCount) return { meanZ: 0, stdZ: 1, samplesZ: [] };
  const samplesZ = [];
  for (let s = 0; s < sampleCount; s++) {
    let total = 0;
    for (const h of members) total += nullObj.levels[levelIndex].rows[h - 1].samplesZ[s];
    samplesZ.push(total / members.length);
  }
  const meanZ = mean(samplesZ);
  return { meanZ, stdZ: std(samplesZ, meanZ), samplesZ };
}

function candidateVerdict({
  separation,
  persistence,
  holdout,
  extraPass = true,
  extraReason = "feature support too weak",
  disqualified = false,
}) {
  const failures = [];
  if (separation < 3.25) failures.push("below real-vs-null threshold");
  if (persistence < 0.65) failures.push("weak dyadic persistence");
  if (!holdout.pass) failures.push("failed holdout sign/magnitude check");
  if (!extraPass) failures.push(extraReason);
  if (disqualified) failures.push("known-disguise gate");
  return {
    verdict: failures.length ? "not-survivor" : "survivor",
    rejectionReasons: failures,
  };
}

export function scoreChowlaAtlas(atlas, nulls = {}) {
  const randomNull = nullRows(nulls, "random-multiplicative") || nulls.randomMultiplicative || nulls.random || null;
  const shuffle = nullRows(nulls, "shuffle") || nulls.shuffleNull || nulls.shuffle || null;
  const levels = atlas.levels || [];
  const H = atlas.H || levels[0]?.rows?.length || 0;
  const candidates = [];

  for (let h = 1; h <= H; h++) {
    const realZ = levels.map((level) => level.rows[h - 1].Z);
    const randomNorms = levels.map((level, i) => standardized(level.rows[h - 1].Z, rowNullZ(i, h, randomNull)));
    const shuffleNorms = levels.map((level, i) => standardized(level.rows[h - 1].Z, rowNullZ(i, h, shuffle)));
    const randomMax = maxAbs(randomNorms);
    const shuffleMax = maxAbs(shuffleNorms);
    const separation = Math.min(randomMax, shuffleMax);
    const persistence = signedPersistence(randomNorms);
    const holdout = holdoutCheck(randomNorms);
    const row = levels[levels.length - 1].rows[h - 1];
    const complexityBonus = individualComplexity(row);
    const score = separation * (0.25 + 0.75 * persistence) * (holdout.pass ? 1 : 0.45) * complexityBonus;
    const individualSupport = complexityBonus >= 0.7 || separation >= 4.75;
    const verdict = candidateVerdict({
      separation,
      persistence,
      holdout,
      extraPass: individualSupport,
      extraReason: "single-shift multiple-test/complexity gate",
    });
    candidates.push({
      type: "shift",
      h,
      description: descriptionForRow(row),
      score,
      maxAbsZNullNormalized: randomMax,
      shuffleMaxAbsZNormalized: shuffleMax,
      realVsNullSeparation: separation,
      persistence,
      holdout,
      lowComplexityDescriptionBonus: complexityBonus,
      dyadic: levels.map((level, i) => ({
        N: level.N,
        Z: realZ[i],
        randomNormalized: randomNorms[i],
        shuffleNormalized: shuffleNorms[i],
      })),
      features: {
        rad: row.rad,
        omega: row.omega,
        bigomega: row.bigomega,
        squarefree: row.squarefree,
        v2: row.v2,
        oddpart: row.oddpart,
        parityBigomega: row.parityBigomega,
      },
      ...verdict,
    });
  }

  const finalRows = levels[levels.length - 1]?.rows || [];
  const finalRandomResiduals = finalRows.map((row, i) => standardized(row.Z, rowNullZ(levels.length - 1, i + 1, randomNull)));
  const featureSummaries = FEATURE_DEFS.map((def) => featureSummary(finalRows, finalRandomResiduals, def));

  for (const def of FEATURE_DEFS) {
    const summary = featureSummaries.find((item) => item.feature === def.feature);
    for (const group of summary.groups) {
      if (group.n < 2) continue;
      const members = group.h;
      const randomNorms = [];
      const shuffleNorms = [];
      const realMeans = [];
      for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
        const realMean = mean(members.map((h) => levels[levelIndex].rows[h - 1].Z));
        realMeans.push(realMean);
        const rNull = groupNullZ(levelIndex, members, randomNull);
        const sNull = groupNullZ(levelIndex, members, shuffle);
        randomNorms.push(standardized(realMean, rNull));
        shuffleNorms.push(standardized(realMean, sNull));
      }
      const randomMax = maxAbs(randomNorms);
      const shuffleMax = maxAbs(shuffleNorms);
      const separation = Math.min(randomMax, shuffleMax);
      const persistence = signedPersistence(randomNorms);
      const holdout = holdoutCheck(randomNorms);
      const support = Math.min(1, Math.sqrt(group.n / 4));
      const featureSupport = summary.r2 >= 0.12 && group.n >= 3;
      const disqualified = Boolean(def.disguise);
      const complexityBonus = def.complexity;
      const score = separation * (0.25 + 0.75 * persistence) * (holdout.pass ? 1 : 0.45) *
        support * complexityBonus * (0.35 + summary.r2);
      const verdict = candidateVerdict({
        separation,
        persistence,
        holdout,
        extraPass: featureSupport,
        disqualified,
      });
      candidates.push({
        type: "feature-group",
        feature: def.feature,
        key: group.key,
        description: `${def.label}=${group.key}`,
        members,
        score,
        maxAbsZNullNormalized: randomMax,
        shuffleMaxAbsZNormalized: shuffleMax,
        realVsNullSeparation: separation,
        persistence,
        holdout,
        featureR2: summary.r2,
        featureMean: group.mean,
        lowComplexityDescriptionBonus: complexityBonus,
        knownDisguise: def.disguise || "",
        dyadic: levels.map((level, i) => ({
          N: level.N,
          Z: realMeans[i],
          randomNormalized: randomNorms[i],
          shuffleNormalized: shuffleNorms[i],
        })),
        ...verdict,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const hValues = finalRows.map((row) => row.h);
  const logHValues = hValues.map((h) => Math.log(h + 1));
  const audit = {
    hSizeR2: linearR2(hValues, finalRandomResiduals),
    logHSizeR2: linearR2(logHValues, finalRandomResiduals),
    parityR2: featureSummaries.find((s) => s.feature === "parityBigomega")?.r2 || 0,
    v2R2: featureSummaries.find((s) => s.feature === "v2")?.r2 || 0,
    squarefreeR2: featureSummaries.find((s) => s.feature === "squarefree")?.r2 || 0,
    maxRandomNormalized: maxAbs(finalRandomResiduals),
    candidateCount: candidates.length,
    survivorCount: candidates.filter((candidate) => candidate.verdict === "survivor").length,
  };

  return {
    candidates,
    survivors: candidates.filter((candidate) => candidate.verdict === "survivor"),
    featureSummaries,
    audit,
    thresholds: {
      realVsNullSeparation: 3.25,
      persistence: 0.65,
      featureR2: 0.12,
      holdoutRatioMin: 0.45,
    },
  };
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
}

function heatColor(value, clamp = 3.5) {
  const x = Math.max(-1, Math.min(1, value / clamp));
  if (x >= 0) {
    const r = Math.round(246 - 45 * (1 - x));
    const g = Math.round(116 - 66 * x);
    const b = Math.round(86 - 38 * x);
    return `rgb(${r},${g},${b})`;
  }
  const a = -x;
  const r = Math.round(70 - 20 * a);
  const g = Math.round(140 - 45 * a);
  const b = Math.round(210 + 35 * a);
  return `rgb(${r},${g},${b})`;
}

export function chowlaHeatmapSvg(atlas, nulls, scored, options = {}) {
  const randomNull = nullRows(nulls, "random-multiplicative") || nulls.randomMultiplicative || nulls.random || null;
  const levels = atlas.levels || [];
  const H = atlas.H || levels[0]?.rows?.length || 1;
  const margin = { left: 62, right: 34, top: 78, bottom: 128 };
  const cellW = Math.max(2.4, Math.min(8, 980 / H));
  const cellH = 42;
  const chartW = cellW * H;
  const chartH = cellH * levels.length;
  const width = Math.ceil(margin.left + chartW + margin.right);
  const height = Math.ceil(margin.top + chartH + margin.bottom);
  const title = options.title || "FrontierLab Chowla residual heatmap";
  const rects = [];
  for (let y = 0; y < levels.length; y++) {
    const level = levels[y];
    for (let h = 1; h <= H; h++) {
      const row = level.rows[h - 1];
      const z = standardized(row.Z, rowNullZ(y, h, randomNull));
      const x0 = margin.left + (h - 1) * cellW;
      const y0 = margin.top + y * cellH;
      rects.push(`<rect x="${x0.toFixed(2)}" y="${y0.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${heatColor(z)}"><title>N=${level.N}, h=${h}, random-normalized residual=${z.toFixed(4)}</title></rect>`);
    }
  }

  const shiftMarks = (scored?.candidates || [])
    .filter((candidate) => candidate.type === "shift" && candidate.persistence >= 0.55)
    .slice(0, 8)
    .map((candidate, i) => {
      const x = margin.left + (candidate.h - 0.5) * cellW;
      const labelY = margin.top - 12 - (i % 2) * 16;
      return `<g>
<line x1="${x.toFixed(2)}" y1="${margin.top}" x2="${x.toFixed(2)}" y2="${(margin.top + chartH).toFixed(2)}" stroke="#f8fafc" stroke-width="1.2" opacity="0.75"/>
<text x="${x.toFixed(2)}" y="${labelY}" fill="#f8fafc" font-size="10" text-anchor="middle">h=${candidate.h}</text>
</g>`;
    });

  const featureNotes = (scored?.candidates || [])
    .filter((candidate) => candidate.type === "feature-group")
    .slice(0, 5)
    .map((candidate, i) => `<text x="${margin.left}" y="${margin.top + chartH + 36 + i * 16}" fill="#cbd5e1" font-size="12">${esc(candidate.description)}: score ${candidate.score.toFixed(3)}, max |z| ${candidate.maxAbsZNullNormalized.toFixed(3)}, ${candidate.verdict}</text>`);

  const xTicks = [];
  const tickStep = H <= 64 ? 8 : H <= 256 ? 32 : 64;
  for (let h = 1; h <= H; h += tickStep) {
    const x = margin.left + (h - 0.5) * cellW;
    xTicks.push(`<text x="${x.toFixed(2)}" y="${margin.top + chartH + 18}" fill="#94a3b8" font-size="10" text-anchor="middle">${h}</text>`);
  }
  if (H % tickStep !== 1) {
    const x = margin.left + (H - 0.5) * cellW;
    xTicks.push(`<text x="${x.toFixed(2)}" y="${margin.top + chartH + 18}" fill="#94a3b8" font-size="10" text-anchor="middle">${H}</text>`);
  }

  const yLabels = levels.map((level, i) =>
    `<text x="${margin.left - 10}" y="${(margin.top + i * cellH + cellH * 0.62).toFixed(2)}" fill="#cbd5e1" font-size="12" text-anchor="end">N=${level.N}</text>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#071018"/>
<g font-family="Inter, ui-sans-serif, system-ui, sans-serif">
<text x="${margin.left}" y="34" fill="#f8fafc" font-size="22" font-weight="750">${esc(title)}</text>
<text x="${margin.left}" y="56" fill="#94a3b8" font-size="12">Cells are (Z_real - random multiplicative null mean) / null sd. Blue negative, red positive, clamp +/-3.5.</text>
${rects.join("\n")}
<rect x="${margin.left}" y="${margin.top}" width="${chartW.toFixed(2)}" height="${chartH.toFixed(2)}" fill="none" stroke="#475569"/>
${yLabels.join("\n")}
${xTicks.join("\n")}
<text x="${margin.left + chartW / 2}" y="${margin.top + chartH + 42}" fill="#94a3b8" font-size="12" text-anchor="middle">shift h=1..${H}</text>
${shiftMarks.join("\n")}
${featureNotes.join("\n")}
</g>
</svg>`;
}

export const _chowlaInternalsForTests = {
  factorFeatures,
  pairSumsForNs,
  randomCompletelyMultiplicativeSigns,
  shuffledSigns,
  standardized,
};
