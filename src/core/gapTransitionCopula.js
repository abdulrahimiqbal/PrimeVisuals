/* Generic helpers for the deep-admissible gap transition copula campaign. */

function lowerBound(values, target) {
  let lo = 0, hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (values[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function upperBound(values, target) {
  let lo = 0, hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (values[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function rankCoordinate(value, sortedTrainingValues) {
  const n = sortedTrainingValues.length;
  if (!n || !Number.isFinite(value)) return NaN;
  const left = lowerBound(sortedTrainingValues, value);
  const right = upperBound(sortedTrainingValues, value);
  const midrank = (left + right) / 2;
  return 2 * ((midrank + 0.5) / (n + 1)) - 1;
}

export function lagOneCorrelation(values) {
  const xs = [];
  const ys = [];
  for (let i = 0; i + 1 < values.length; i++) {
    if (!Number.isFinite(values[i]) || !Number.isFinite(values[i + 1])) continue;
    xs.push(values[i]);
    ys.push(values[i + 1]);
  }
  if (xs.length < 3) return { pairs: xs.length, correlation: NaN };
  const mx = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const my = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let covariance = 0, vx = 0, vy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    covariance += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  return {
    pairs: xs.length,
    correlation: vx > 0 && vy > 0 ? covariance / Math.sqrt(vx * vy) : NaN,
  };
}

function transitionKey(row, modulus) {
  const a = ((row.p % modulus) + modulus) % modulus;
  const b = ((row.q % modulus) + modulus) % modulus;
  return `${a}:${b}`;
}

export function transitionResidualSeries(trainingRows, holdoutRows, modulus, shrinkage = 20) {
  const W = Math.max(2, Math.floor(modulus));
  const alpha = Math.max(0, Number(shrinkage));
  const sorted = trainingRows.map((row) => row.value).filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length < 3) {
    return { trainingCount: sorted.length, holdoutCount: 0, unseenFraction: 1, rawRanks: [], residuals: [], classCount: 0 };
  }
  const rankedTrain = trainingRows.map((row) => ({ ...row, rank: rankCoordinate(row.value, sorted) })).filter((row) => Number.isFinite(row.rank));
  const globalMean = rankedTrain.reduce((sum, row) => sum + row.rank, 0) / rankedTrain.length;
  const classes = new Map();
  for (const row of rankedTrain) {
    const key = transitionKey(row, W);
    const cell = classes.get(key) || { count: 0, sum: 0 };
    cell.count++;
    cell.sum += row.rank;
    classes.set(key, cell);
  }
  const rawRanks = [];
  const residuals = [];
  let unseen = 0;
  for (const row of holdoutRows) {
    const rank = rankCoordinate(row.value, sorted);
    if (!Number.isFinite(rank)) continue;
    const cell = classes.get(transitionKey(row, W));
    if (!cell) unseen++;
    const count = cell?.count || 0;
    const sum = cell?.sum || 0;
    const classMean = (sum + alpha * globalMean) / (count + alpha || 1);
    rawRanks.push(rank);
    residuals.push(rank - classMean);
  }
  return {
    trainingCount: rankedTrain.length,
    holdoutCount: residuals.length,
    globalMean,
    classCount: classes.size,
    unseen,
    unseenFraction: unseen / Math.max(1, residuals.length),
    rawRanks,
    residuals,
  };
}

