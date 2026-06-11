/* Automated anomaly scanner.
   Every statistic is computed on a FIND half and re-scored on a disjoint SCORE half
   so that look-elsewhere flukes die. */

import { primesUpTo } from "./math.js";
import { residueChi, expSum, expSumZ, autocorr } from "./stats.js";

/* prepareScan(N, opts={})
   Splits integers: find-range primes = primes in [2, N],
                    score-range      = primes in (N, 2N].
   Also builds gap arrays for both halves.
   Returns { pFind, pScore, gFind, gScore, N }. */
export function prepareScan(N, _opts = {}) {
  const all = primesUpTo(2 * N);
  const pFind = all.filter(p => p <= N);
  const pScore = all.filter(p => p > N);

  const gaps = arr => {
    const g = new Float64Array(Math.max(0, arr.length - 1));
    for (let i = 0; i < g.length; i++) g[i] = arr[i + 1] - arr[i];
    return g;
  };

  return { pFind, pScore, gFind: gaps(pFind), gScore: gaps(pScore), N };
}

/* gcd helper */
function gcd(a, b) { while (b) { const t = b; b = a % b; a = t; } return a; }

/* scanResidues(prep, qMax=60)
   For q in 3..qMax, compute residueChi on pFind, rescore on pScore.
   Returns [{kind, q, zFind, zScore, label, view}]. */
export function scanResidues(prep, qMax = 60) {
  const { pFind, pScore, N } = prep;
  const results = [];
  for (let q = 3; q <= qMax; q++) {
    const rFind = residueChi(pFind, q);
    const rScore = residueChi(pScore, q);
    const { worst } = rFind;
    const label = `primes mod ${q}: weakest class r=${worst.r} (dev ${worst.dev.toFixed(2)})`;
    const view = {
      source: "primes",
      plane: "clock",
      lens: "residue",
      p: { N: N * 2, mod: q, kres: q },
    };
    results.push({
      kind: "residue",
      q,
      zFind: rFind.z,
      zScore: rScore.z,
      label,
      view,
    });
  }
  return results;
}

/* scanExpSums(prep, gridSize=1500, keep=40)
   Alpha grid over (0.02, π); compute expSumZ for each; keep `keep` largest
   by |zFind| with minimum α-separation of 0.01 (suppress near-duplicate peaks).
   Rescore on pScore.
   Returns [{kind, alpha, zFind, zScore, label, view}]. */
export function scanExpSums(prep, gridSize = 1500, keep = 40) {
  const { pFind, pScore, N } = prep;
  const LO = 0.02, HI = Math.PI;
  const step = (HI - LO) / (gridSize - 1);

  // compute zFind for every grid point
  const alphas = new Float64Array(gridSize);
  const zs = new Float64Array(gridSize);
  for (let i = 0; i < gridSize; i++) {
    const alpha = LO + i * step;
    alphas[i] = alpha;
    zs[i] = expSumZ(expSum(pFind, alpha));
  }

  // greedy selection: keep top `keep` by |z| with min α-separation of 0.01
  const order = Array.from({ length: gridSize }, (_, i) => i)
    .sort((a, b) => Math.abs(zs[b]) - Math.abs(zs[a]));

  const selected = [];
  const minSep = 0.01;
  for (const idx of order) {
    if (selected.length >= keep) break;
    const alpha = alphas[idx];
    let tooClose = false;
    for (const s of selected) {
      if (Math.abs(alpha - s.alpha) < minSep) { tooClose = true; break; }
    }
    if (!tooClose) {
      selected.push({ alpha, zFind: zs[idx], idx });
    }
  }

  // rescore on pScore
  return selected.map(({ alpha, zFind }) => {
    const zScore = expSumZ(expSum(pScore, alpha));
    const label = `exp sum peak at α=${alpha.toFixed(5)} (zFind=${zFind.toFixed(2)})`;
    const view = {
      source: "primes",
      plane: "polar",
      lens: "residue",
      p: { N: N * 2, alpha, kres: 6 },
    };
    return { kind: "expsum", alpha, zFind, zScore, label, view };
  });
}

/* scanGapAutocorr(prep, maxLag=32)
   Autocorr of gFind; z per lag; rescore on gScore.
   Returns [{kind, param (lag), zFind, zScore, label, view}]. */
export function scanGapAutocorr(prep, maxLag = 32) {
  const { gFind, gScore, N } = prep;
  const zFind = autocorr(Array.from(gFind), maxLag);
  const zScore = autocorr(Array.from(gScore), maxLag);
  const view = {
    source: "gaps",
    plane: "graph",
    lens: "pulse",
    p: { N: N * 2 },
  };
  const results = [];
  for (let lag = 1; lag <= maxLag; lag++) {
    results.push({
      kind: "gapcorr",
      param: lag,
      zFind: zFind[lag],
      zScore: zScore[lag],
      label: `gap autocorrelation lag=${lag} (zFind=${zFind[lag].toFixed(2)})`,
      view,
    });
  }
  return results;
}

/* Stable id for a result row. */
function makeId(row) {
  if (row.kind === "residue") return `residue-q${row.q}`;
  if (row.kind === "expsum") return `expsum-a${row.alpha.toFixed(6)}`;
  if (row.kind === "gapcorr") return `gapcorr-lag${row.param}`;
  return `${row.kind}-${Math.random()}`;
}

/* runScan(N, onProgress?)
   Runs all three scanners (calling onProgress(fraction, note) if given between stages),
   concatenates, sorts by |zScore| descending, returns top 60. Each row gets a stable id. */
export async function runScan(N, onProgress) {
  const notify = onProgress ?? (() => {});

  notify(0, "preparing");
  const prep = prepareScan(N);

  notify(0.05, "scanning residues");
  const resRows = scanResidues(prep);

  notify(0.35, "scanning exp sums");
  const expRows = scanExpSums(prep);

  notify(0.75, "scanning gap autocorrelation");
  const gapRows = scanGapAutocorr(prep);

  notify(0.95, "sorting");
  const all = [...resRows, ...expRows, ...gapRows];
  all.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
  const top = all.slice(0, 60);
  for (const row of top) row.id = makeId(row);

  notify(1, "done");
  return top;
}

/* sequenceFor(result, prep)
   For kind 'residue': first 12 primes in the worst class r mod q (full range).
   For 'gapcorr':      first 12 gaps (from gFind).
   For 'expsum':       null. */
export function sequenceFor(result, prep) {
  if (result.kind === "expsum") return null;

  if (result.kind === "gapcorr") {
    return Array.from(prep.gFind).slice(0, 12);
  }

  if (result.kind === "residue") {
    const { q } = result;
    // find worst.r from the result label or recompute
    // We stored the worst.r inside the label, but easier to recompute from full range
    const rFind = residueChi(prep.pFind, q);
    const r = rFind.worst.r;
    const all = [...prep.pFind, ...prep.pScore];
    const out = [];
    for (const p of all) {
      if (p % q === r) { out.push(p); if (out.length >= 12) break; }
    }
    return out;
  }

  return null;
}
