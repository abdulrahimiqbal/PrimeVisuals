#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { sieve } from "../../../src/core/math.js";
import {
  centeredPairScore,
  hardyLittlewoodPairSingularSeries,
  pairConditionedMean,
  pearson,
  quadraticCharacterTable,
  signAgreement,
  summarizeZCells,
  theoreticalQuadraticPairMean,
} from "../../../src/core/frobeniusTuple.js";

const outDir = path.dirname(new URL(import.meta.url).pathname);
const maxN = Math.max(100_000, Number.parseInt(process.argv[2] || "8000000", 10));
const requiredEndpoints = [1_000_000, 2_000_000, 4_000_000, 8_000_000];
const endpoints = requiredEndpoints.filter((x) => x <= maxN);
if (!endpoints.length || endpoints.at(-1) !== maxN) endpoints.push(maxN);

const targetModuli = [5, 7, 11, 13, 17, 19];
const matchedModuli = [23, 29, 31, 37, 41, 43];
const discoveryShifts = [2, 6, 8, 12, 18, 24];
const holdoutShifts = [32, 36, 46, 48, 54, 64];
const shifts = [...discoveryShifts, ...holdoutShifts];
const seeds = [137, 1009, 7919, 65537, 104729, 130363, 196613, 262147];
const wheelPrimes = [2, 3, 5, 7, 11, 13, 17, 19];
const wheel = wheelPrimes.reduce((product, prime) => product * prime, 1);
const wheelDensity = wheelPrimes.reduce((density, prime) => density * (1 - 1 / prime), 1);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function quantile(values, probability) {
  const ordered = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!ordered.length) return NaN;
  const index = Math.min(ordered.length - 1, Math.max(0, Math.ceil(probability * ordered.length) - 1));
  return ordered[index];
}

function range(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? [Math.min(...finite), Math.max(...finite)] : [NaN, NaN];
}

function fmt(value, digits = 4) {
  return Number.isFinite(value) ? value.toFixed(digits) : "NA";
}

function tablesFor(moduli) {
  return moduli.map((modulus) => ({ modulus, table: quadraticCharacterTable(modulus), type: "quadratic" }));
}

function balancedTables(seed) {
  const random = rng(seed);
  return targetModuli.map((modulus) => {
    const signs = Array.from({ length: modulus - 1 }, (_, i) => (i < (modulus - 1) / 2 ? 1 : -1));
    for (let i = signs.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [signs[i], signs[j]] = [signs[j], signs[i]];
    }
    const table = new Int8Array(modulus);
    for (let residue = 1; residue < modulus; residue++) table[residue] = signs[residue - 1];
    return { modulus, table, type: "balanced-residue", seed };
  });
}

function labelsFromFlags(flags) {
  const labels = [];
  for (let n = 2; n < flags.length; n++) if (flags[n]) labels.push(n);
  return labels;
}

function scoreFlags(name, kind, flags, covers = tablesFor(targetModuli)) {
  const labels = labelsFromFlags(flags);
  const cumulative = endpoints.map((endpoint) => ({ endpoint, cells: [], pairCounts: {} }));

  for (const shift of shifts) {
    const counts = new Int32Array(covers.length);
    const sums = new Int32Array(covers.length);
    let rawPairCount = 0;
    let endpointIndex = 0;
    const means = covers.map((cover) => pairConditionedMean(cover.table, shift).mean);

    const snapshot = (index) => {
      const row = cumulative[index];
      row.pairCounts[shift] = rawPairCount;
      for (let coverIndex = 0; coverIndex < covers.length; coverIndex++) {
        row.cells.push({
          cover: covers[coverIndex].modulus,
          coverType: covers[coverIndex].type,
          shift,
          ...centeredPairScore(sums[coverIndex], counts[coverIndex], means[coverIndex]),
        });
      }
    };

    for (const left of labels) {
      const upper = left + shift;
      while (endpointIndex < endpoints.length && upper > endpoints[endpointIndex]) {
        snapshot(endpointIndex++);
      }
      if (upper > maxN) break;
      if (!flags[upper]) continue;
      rawPairCount++;
      for (let coverIndex = 0; coverIndex < covers.length; coverIndex++) {
        const { modulus, table } = covers[coverIndex];
        const a = table[left % modulus];
        const b = table[upper % modulus];
        if (a === 0 || b === 0) continue;
        counts[coverIndex]++;
        sums[coverIndex] += a * b;
      }
    }
    while (endpointIndex < endpoints.length) snapshot(endpointIndex++);
  }

  for (const row of cumulative) {
    row.summary = summarizeZCells(row.cells);
    row.discovery = summarizeZCells(row.cells.filter((cell) => discoveryShifts.includes(cell.shift)));
    row.holdout = summarizeZCells(row.cells.filter((cell) => holdoutShifts.includes(cell.shift)));
  }

  const blocks = cumulative.map((row, index) => {
    const previous = index ? cumulative[index - 1] : null;
    const previousByKey = new Map((previous?.cells || []).map((cell) => [`${cell.cover}:${cell.shift}`, cell]));
    const cells = row.cells.map((cell) => {
      const before = previousByKey.get(`${cell.cover}:${cell.shift}`);
      return {
        cover: cell.cover,
        coverType: cell.coverType,
        shift: cell.shift,
        ...centeredPairScore(
          cell.sum - (before?.sum || 0),
          cell.count - (before?.count || 0),
          cell.mean,
        ),
      };
    });
    return {
      lo: previous?.endpoint || 0,
      hi: row.endpoint,
      cells,
      summary: summarizeZCells(cells),
      discovery: summarizeZCells(cells.filter((cell) => discoveryShifts.includes(cell.shift))),
      holdout: summarizeZCells(cells.filter((cell) => holdoutShifts.includes(cell.shift))),
    };
  });

  const replication = blocks.length >= 4 ? (() => {
    const first = blocks.at(-2).cells.filter((cell) => holdoutShifts.includes(cell.shift));
    const lastMap = new Map(blocks.at(-1).cells.filter((cell) => holdoutShifts.includes(cell.shift)).map((cell) => [`${cell.cover}:${cell.shift}`, cell]));
    const second = first.map((cell) => lastMap.get(`${cell.cover}:${cell.shift}`));
    return {
      pearsonZ: pearson(first.map((cell) => cell.z), second.map((cell) => cell?.z)),
      pearsonResidualRate: pearson(first.map((cell) => cell.residualRate), second.map((cell) => cell?.residualRate)),
      signAgreementZ: signAgreement(first.map((cell) => cell.z), second.map((cell) => cell?.z)),
      cells: first.length,
      blocks: [[blocks.at(-2).lo, blocks.at(-2).hi], [blocks.at(-1).lo, blocks.at(-1).hi]],
    };
  })() : null;

  return { name, kind, labelCount: labels.length, covers: covers.map((cover) => cover.modulus), cumulative, blocks, replication };
}

function cramerFlags(seed) {
  const random = rng(seed);
  const flags = new Uint8Array(maxN + 1);
  for (let n = 3; n <= maxN; n++) if (random() < 1 / Math.log(n)) flags[n] = 1;
  return flags;
}

function buildWheelEligible() {
  const eligible = new Uint8Array(maxN + 1).fill(1, 2);
  for (const prime of wheelPrimes) for (let n = prime; n <= maxN; n += prime) eligible[n] = 0;
  return eligible;
}

function wheelFlags(seed, eligible) {
  const random = rng(seed);
  const flags = new Uint8Array(maxN + 1);
  for (let n = 23; n <= maxN; n++) {
    if (eligible[n] && random() < Math.min(1, 1 / (wheelDensity * Math.log(n)))) flags[n] = 1;
  }
  return flags;
}

function binIndex(n) {
  return Math.floor(Math.log2(Math.max(2, n)));
}

function binCounts(flags, predicate = () => true) {
  const counts = new Int32Array(32);
  for (let n = 2; n <= maxN; n++) if (flags[n] && predicate(n)) counts[binIndex(n)]++;
  return counts;
}

function sampledCandidateFlags(seed, candidates, targetCounts) {
  const random = rng(seed);
  const candidateCounts = binCounts(candidates);
  const probabilities = Array.from(candidateCounts, (count, index) => count ? Math.min(1, targetCounts[index] / count) : 0);
  const flags = new Uint8Array(maxN + 1);
  for (let n = 2; n <= maxN; n++) {
    if (candidates[n] && random() < probabilities[binIndex(n)]) flags[n] = 1;
  }
  return flags;
}

function roughSemiprimes(primeFlags) {
  const primes = labelsFromFlags(primeFlags).filter((prime) => prime > 19);
  const flags = new Uint8Array(maxN + 1);
  for (let i = 0; i < primes.length && primes[i] * primes[i] <= maxN; i++) {
    const left = primes[i];
    for (let j = i; j < primes.length; j++) {
      const product = left * primes[j];
      if (product > maxN) break;
      flags[product] = 1;
    }
  }
  return flags;
}

function pairIntegral(endpoint, shift, step = 64) {
  const upper = Math.max(2, endpoint - shift);
  let value = 0;
  for (let lo = 2; lo < upper; lo += step) {
    const hi = Math.min(upper, lo + step);
    const midpoint = (lo + hi) / 2;
    value += (hi - lo) / (Math.log(midpoint) * Math.log(midpoint + shift));
  }
  return value;
}

function pairCalibration(real) {
  return shifts.map((shift) => ({
    shift,
    singularSeries: hardyLittlewoodPairSingularSeries(shift),
    endpoints: endpoints.map((endpoint, index) => {
      const observed = real.cumulative[index].pairCounts[shift];
      const predicted = hardyLittlewoodPairSingularSeries(shift) * pairIntegral(endpoint, shift);
      return { endpoint, observed, predicted, ratio: observed / predicted };
    }),
  }));
}

function sampleBinomialExact(n, probability, random) {
  if (probability <= 0) return 0;
  if (probability >= 1) return n;
  if (probability > 0.5) return n - sampleBinomialExact(n, 1 - probability, random);
  const logFailure = Math.log1p(-probability);
  let position = 0;
  let successes = 0;
  while (true) {
    const u = Math.max(Number.MIN_VALUE, random());
    position += Math.floor(Math.log(u) / logFailure) + 1;
    if (position > n) return successes;
    successes++;
  }
}

function exactConditionalMonteCarlo(real, repetitions = 256) {
  const template = real.blocks.at(-1).cells.filter((cell) => holdoutShifts.includes(cell.shift));
  const metrics = [];
  for (let repetition = 0; repetition < repetitions; repetition++) {
    const random = rng((0xA53C9E1D + repetition * 0x9E3779B1) >>> 0);
    const cells = template.map((cell) => {
      const positiveProbability = (1 + cell.mean) / 2;
      const positives = sampleBinomialExact(cell.count, positiveProbability, random);
      return centeredPairScore(2 * positives - cell.count, cell.count, cell.mean);
    });
    metrics.push(summarizeZCells(cells));
  }
  return {
    repetitions,
    block: [real.blocks.at(-1).lo, real.blocks.at(-1).hi],
    cellCount: template.length,
    rmsZ: { range: range(metrics.map((row) => row.rmsZ)), q95: quantile(metrics.map((row) => row.rmsZ), 0.95), q99: quantile(metrics.map((row) => row.rmsZ), 0.99) },
    maxAbsZ: { range: range(metrics.map((row) => row.maxAbsZ)), q95: quantile(metrics.map((row) => row.maxAbsZ), 0.95), q99: quantile(metrics.map((row) => row.maxAbsZ), 0.99) },
    stoufferAbs: { range: range(metrics.map((row) => Math.abs(row.stoufferZ))), q95: quantile(metrics.map((row) => Math.abs(row.stoufferZ)), 0.95), q99: quantile(metrics.map((row) => Math.abs(row.stoufferZ)), 0.99) },
  };
}

function summarizeControlFamily(runs) {
  const finalRows = runs.map((run) => run.blocks.at(-1).holdout);
  const replications = runs.map((run) => run.replication).filter(Boolean);
  return {
    runs: runs.length,
    finalBlockRmsZ: range(finalRows.map((row) => row.rmsZ)),
    finalBlockMaxAbsZ: range(finalRows.map((row) => row.maxAbsZ)),
    finalBlockStoufferAbs: range(finalRows.map((row) => Math.abs(row.stoufferZ))),
    replicationPearsonZ: range(replications.map((row) => row.pearsonZ)),
    replicationSignAgreement: range(replications.map((row) => row.signAgreementZ)),
  };
}

function finiteFieldIdentity() {
  return [...targetModuli, ...matchedModuli].map((q) => {
    const table = quadraticCharacterTable(q);
    return shifts.map((shift) => {
      const exact = pairConditionedMean(table, shift);
      return { q, shift, exact, formula: theoreticalQuadraticPairMean(q, shift), ok: Math.abs(exact.mean - theoreticalQuadraticPairMean(q, shift)) < 1e-14 };
    });
  }).flat();
}

function csvRows(real) {
  const header = "scope,lo,hi,cover,shift,count,sum,local_mean,residual,residual_rate,z\n";
  const rows = [];
  for (const block of real.blocks) for (const cell of block.cells) {
    rows.push(["block", block.lo, block.hi, cell.cover, cell.shift, cell.count, cell.sum, cell.mean, cell.residual, cell.residualRate, cell.z].join(","));
  }
  for (const row of real.cumulative) for (const cell of row.cells) {
    rows.push(["cumulative", 0, row.endpoint, cell.cover, cell.shift, cell.count, cell.sum, cell.mean, cell.residual, cell.residualRate, cell.z].join(","));
  }
  return header + rows.join("\n") + "\n";
}

function renderEvidence(report) {
  const real = report.real;
  const lines = [
    "# Evidence: quadratic-Frobenius additive prime-pair race",
    "",
    `Run: ${report.generatedAt}`,
    "",
    "## Headline confirmatory result",
    "",
    "| block | cohort | cells | RMS z | max |z| | Stouffer z |",
    "| --- | --- | ---: | ---: | ---: | ---: |",
  ];
  for (const block of real.blocks) {
    lines.push(`| (${block.lo},${block.hi}] | holdout shifts | ${block.holdout.cellCount} | ${fmt(block.holdout.rmsZ)} | ${fmt(block.holdout.maxAbsZ)} | ${fmt(block.holdout.stoufferZ)} |`);
  }
  lines.push(
    "",
    `Final confirmatory profile correlation: \`${fmt(real.replication.pearsonZ)}\`; residual-rate correlation: \`${fmt(real.replication.pearsonResidualRate)}\`; sign agreement: \`${fmt(real.replication.signAgreementZ)}\`.`,
    "",
    "## Control envelopes (final confirmatory block)",
    "",
    "| family | runs | RMS z range | max |z| range | |Stouffer z| range | replication r range | sign agreement range |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  );
  for (const [name, summary] of Object.entries(report.controlSummaries)) {
    lines.push(`| ${name} | ${summary.runs} | ${summary.finalBlockRmsZ.map((x) => fmt(x)).join("..") } | ${summary.finalBlockMaxAbsZ.map((x) => fmt(x)).join("..") } | ${summary.finalBlockStoufferAbs.map((x) => fmt(x)).join("..") } | ${summary.replicationPearsonZ.map((x) => fmt(x)).join("..") } | ${summary.replicationSignAgreement.map((x) => fmt(x)).join("..") } |`);
  }
  lines.push(
    "",
    `Exact conditional Monte Carlo (${report.conditionalMonteCarlo.repetitions} runs): RMS z 99% envelope \`${fmt(report.conditionalMonteCarlo.rmsZ.q99)}\`; max |z| 99% envelope \`${fmt(report.conditionalMonteCarlo.maxAbsZ.q99)}\`.`,
    "",
    "## Hardy--Littlewood count calibration",
    "",
    "The Frobenius residual is centered by the observed pair count, so these count errors cannot create it.",
    "",
    "| shift | S(h) | N(8m) | predicted | ratio |",
    "| ---: | ---: | ---: | ---: | ---: |",
  );
  for (const row of report.pairCalibration) {
    const final = row.endpoints.at(-1);
    lines.push(`| ${row.shift} | ${fmt(row.singularSeries, 6)} | ${final.observed} | ${fmt(final.predicted, 1)} | ${fmt(final.ratio, 5)} |`);
  }
  lines.push(
    "",
    "## Gate result",
    "",
    `Data verdict: **${report.verdict.status}**`,
    "",
    ...report.verdict.gates.map((gate) => `- ${gate.pass ? "PASS" : "FAIL"}: ${gate.name} — ${gate.evidence}`),
    "",
    "Full cell data: `cell-data.csv`; structured report: `results.json`.",
  );
  return `${lines.join("\n")}\n`;
}

console.error(`[frobenius-tuples] building real sieve through ${maxN}`);
const primeFlags = sieve(maxN);
const wheelEligible = buildWheelEligible();
const targetCounts = binCounts(primeFlags);
const compositeCandidates = Uint8Array.from(wheelEligible, (value, n) => value && !primeFlags[n] ? 1 : 0);
console.error("[frobenius-tuples] building rough-semiprime candidate set");
const semiprimeCandidates = roughSemiprimes(primeFlags);

console.error("[frobenius-tuples] scoring real target and matched covers");
const real = scoreFlags("real-primes-target-covers", "real", primeFlags);
const matchedCovers = scoreFlags("real-primes-matched-covers", "nearby-covers", primeFlags, tablesFor(matchedModuli));
const controls = { cramer: [], wheel: [], composite: [], semiprime: [], balancedResidue: [] };

for (let index = 0; index < seeds.length; index++) {
  const seed = seeds[index];
  console.error(`[frobenius-tuples] controls ${index + 1}/${seeds.length}, seed=${seed}`);
  controls.cramer.push(scoreFlags(`cramer-${seed}`, "cramer", cramerFlags(seed)));
  controls.wheel.push(scoreFlags(`wheel-${seed}`, "wheel", wheelFlags(seed ^ 0x9E3779B9, wheelEligible)));
  controls.composite.push(scoreFlags(`wheel-composite-${seed}`, "composite", sampledCandidateFlags(seed ^ 0x517CC1B7, compositeCandidates, targetCounts)));
  controls.semiprime.push(scoreFlags(`rough-semiprime-${seed}`, "semiprime", sampledCandidateFlags(seed ^ 0x85EBCA6B, semiprimeCandidates, targetCounts)));
  controls.balancedResidue.push(scoreFlags(`balanced-residue-${seed}`, "balanced-residue", primeFlags, balancedTables(seed)));
}

console.error("[frobenius-tuples] exact conditional Monte Carlo");
const conditionalMonteCarlo = exactConditionalMonteCarlo(real, 256);
const controlSummaries = Object.fromEntries(Object.entries(controls).map(([name, runs]) => [name, summarizeControlFamily(runs)]));
controlSummaries.nearbyCovers = summarizeControlFamily([matchedCovers]);
const finalReal = real.blocks.at(-1).holdout;
const heaviestControlRms = Math.max(...Object.values(controlSummaries).map((summary) => summary.finalBlockRmsZ[1]));
const validation = finiteFieldIdentity();
const validationPassed = validation.every((row) => row.ok);
const controlsPassed = finalReal.rmsZ > conditionalMonteCarlo.rmsZ.q99 && finalReal.rmsZ > heaviestControlRms;
const replicationPassed = real.replication.pearsonZ >= 0.5 && real.replication.signAgreementZ >= 2 / 3;
const corroborationPassed = matchedCovers.blocks.at(-1).holdout.rmsZ > conditionalMonteCarlo.rmsZ.q99
  || real.blocks.at(-1).discovery.rmsZ > conditionalMonteCarlo.rmsZ.q99;
const dataSurvivor = validationPassed && controlsPassed && replicationPassed && corroborationPassed;
const verdict = {
  status: dataSurvivor ? "DATA_SURVIVOR_PENDING_NOVELTY_AND_PROOF_AUDIT" : "KILL_NO_REPLICATED_CONTROL_SURVIVING_FROBENIUS_TUPLE_RESIDUAL",
  dataSurvivor,
  gates: [
    { name: "exact local identity", pass: validationPassed, evidence: `${validation.filter((row) => row.ok).length}/${validation.length} finite residue checks pass` },
    { name: "control survival", pass: controlsPassed, evidence: `real final RMS=${fmt(finalReal.rmsZ)}, conditional q99=${fmt(conditionalMonteCarlo.rmsZ.q99)}, max frozen control=${fmt(heaviestControlRms)}` },
    { name: "disjoint-block replication", pass: replicationPassed, evidence: `r=${fmt(real.replication.pearsonZ)}, sign agreement=${fmt(real.replication.signAgreementZ)}` },
    { name: "cover/discovery corroboration", pass: corroborationPassed, evidence: `matched-cover RMS=${fmt(matchedCovers.blocks.at(-1).holdout.rmsZ)}, discovery-shift RMS=${fmt(real.blocks.at(-1).discovery.rmsZ)}` },
  ],
};

const report = {
  candidate: "Quadratic-Frobenius additive prime-pair race",
  generatedAt: new Date().toISOString(),
  maxN,
  endpoints,
  targetModuli,
  matchedModuli,
  discoveryShifts,
  holdoutShifts,
  seeds,
  wheel,
  wheelDensity,
  theoremObject: {
    statistic: "R_ell,h(X)=sum_{p,p+h prime}((p/ell)((p+h)/ell)-mu_ell(h))",
    exactLocalMean: "mu_ell(h)=-1/(ell-2) when ell does not divide h; all registered cells are nondegenerate",
    normalized: "Z=R/sqrt(N_h(1-mu^2))",
    strength: "stronger than ordinary Chebotarev on primes, weaker than full Hardy-Littlewood in progressions",
  },
  real,
  matchedCovers,
  controls,
  controlSummaries,
  conditionalMonteCarlo,
  pairCalibration: pairCalibration(real),
  finiteFieldLocalIdentity: validation,
  verdict,
};

fs.writeFileSync(path.join(outDir, "results.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, "cell-data.csv"), csvRows(real));
fs.writeFileSync(path.join(outDir, "EVIDENCE.md"), renderEvidence(report));
console.log(JSON.stringify({
  ok: true,
  verdict: verdict.status,
  finalConfirmatory: finalReal,
  replication: real.replication,
  conditionalMonteCarlo,
  controlSummaries,
  artifacts: ["PREREGISTRATION.md", "run-audit.mjs", "results.json", "cell-data.csv", "EVIDENCE.md"].map((name) => path.join(outDir, name)),
}, null, 2));
