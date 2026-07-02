#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  chowlaHeatmapSvg,
  dyadicChowlaAtlas,
  liouvilleUpTo,
  randomMultiplicativeNull,
  scoreChowlaAtlas,
  shuffleNull,
} from "../src/core/frontier/chowla.js";

function parseArgs(argv) {
  const args = {
    N0: 20000,
    levels: 4,
    H: 256,
    seeds: 20,
    outDir: "logs/frontier",
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    if (["N0", "levels", "H", "seeds"].includes(key)) args[key] = Number(value);
    else if (key === "outDir") args.outDir = value;
    else throw new Error(`unknown argument --${key}`);
  }
  return args;
}

function fmt(x, digits = 4) {
  return Number.isFinite(x) ? Number(x).toFixed(digits) : "n/a";
}

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function std(values) {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1));
}

function energy(values) {
  if (!values.length) return 0;
  return Math.sqrt(values.reduce((s, v) => s + v * v, 0) / values.length);
}

function maxAbs(values) {
  return values.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
}

function realLevelSummary(level) {
  const zs = level.rows.map((row) => row.Z);
  return { energy: energy(zs), maxAbs: maxAbs(zs) };
}

function nullLevelSummary(nullObj, levelIndex) {
  const rows = nullObj.levels[levelIndex].rows;
  const sampleCount = rows[0]?.samplesZ.length || 0;
  const energies = [];
  const maxes = [];
  for (let s = 0; s < sampleCount; s++) {
    const zs = rows.map((row) => row.samplesZ[s]);
    energies.push(energy(zs));
    maxes.push(maxAbs(zs));
  }
  return {
    energyMean: mean(energies),
    energyStd: std(energies),
    energyMin: Math.min(...energies),
    energyMax: Math.max(...energies),
    maxAbsMean: mean(maxes),
    maxAbsStd: std(maxes),
    maxAbsMin: Math.min(...maxes),
    maxAbsMax: Math.max(...maxes),
  };
}

function candidateLabel(candidate) {
  if (candidate.type === "shift") return `h=${candidate.h}`;
  return candidate.description;
}

function candidateTable(candidates) {
  if (!candidates.length) return "_No candidates were scored._";
  return `| rank | locus | score | max |z_random| | max |z_shuffle| | persistence | holdout ratio | verdict | rejection |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
${candidates.slice(0, 12).map((candidate, i) => `| ${i + 1} | ${candidateLabel(candidate)} | ${fmt(candidate.score, 3)} | ${fmt(candidate.maxAbsZNullNormalized, 3)} | ${fmt(candidate.shuffleMaxAbsZNormalized, 3)} | ${fmt(candidate.persistence, 3)} | ${fmt(candidate.holdout.ratio, 3)} | ${candidate.verdict} | ${(candidate.rejectionReasons || []).join("; ") || "passed gates"} |`).join("\n")}`;
}

function dyadicTable(candidates, Ns) {
  const shown = candidates.slice(0, 8);
  if (!shown.length) return "_No dyadic rows._";
  const headers = Ns.map((N) => `N=${N}`);
  return `| locus | ${headers.join(" | ")} | persistence | holdout |
| --- | ${headers.map(() => "---:").join(" | ")} | ---: | --- |
${shown.map((candidate) => {
  const cells = candidate.dyadic.map((row) => fmt(row.randomNormalized, 3));
  return `| ${candidateLabel(candidate)} | ${cells.join(" | ")} | ${fmt(candidate.persistence, 3)} | ${candidate.holdout.pass ? "pass" : "fail"} |`;
}).join("\n")}`;
}

function nullComparisonTable(atlas, randomNull, shuffled) {
  return `| N | real energy | real max | random energy mean+-sd | random max range | shuffle energy mean+-sd | shuffle max range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${atlas.levels.map((level, i) => {
  const real = realLevelSummary(level);
  const rand = nullLevelSummary(randomNull, i);
  const shuf = nullLevelSummary(shuffled, i);
  return `| ${level.N} | ${fmt(real.energy, 4)} | ${fmt(real.maxAbs, 4)} | ${fmt(rand.energyMean, 4)} +- ${fmt(rand.energyStd, 4)} | ${fmt(rand.maxAbsMin, 4)}..${fmt(rand.maxAbsMax, 4)} | ${fmt(shuf.energyMean, 4)} +- ${fmt(shuf.energyStd, 4)} | ${fmt(shuf.maxAbsMin, 4)}..${fmt(shuf.maxAbsMax, 4)} |`;
}).join("\n")}`;
}

function strongestShiftTable(atlas) {
  const final = atlas.levels[atlas.levels.length - 1];
  const rows = final.rows
    .map((row) => ({ ...row }))
    .sort((a, b) => Math.abs(b.Z) - Math.abs(a.Z))
    .slice(0, 12);
  return `| h | S(h,N) | Z=S/sqrt(N) | rad(h) | omega | Omega | v2 | oddpart | squarefree |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows.map((row) => `| ${row.h} | ${row.S} | ${fmt(row.Z, 4)} | ${row.rad} | ${row.omega} | ${row.bigomega} | ${row.v2} | ${row.oddpart} | ${row.squarefree ? "yes" : "no"} |`).join("\n")}`;
}

function featureSummaryTable(scored) {
  return `| feature | R2 at final N | strongest group | group n | group mean normalized residual |
| --- | ---: | --- | ---: | ---: |
${scored.featureSummaries.map((summary) => {
  const group = summary.groups[0];
  return `| ${summary.label} | ${fmt(summary.r2, 4)} | ${group?.key ?? "n/a"} | ${group?.n ?? 0} | ${fmt(group?.mean ?? 0, 4)} |`;
}).join("\n")}`;
}

function knownDisguiseAudit(scored) {
  const audit = scored.audit;
  const lines = [
    `- h-size explanation: final residual R2 against h is ${fmt(audit.hSizeR2, 4)} and against log(h+1) is ${fmt(audit.logHSizeR2, 4)}.`,
    `- parity-only explanation: Omega(h) parity R2 is ${fmt(audit.parityR2, 4)}; parity-only groups are disqualified as conjectures.`,
    `- trivial small-prime divisibility: v2(h) R2 is ${fmt(audit.v2R2, 4)} and squarefree R2 is ${fmt(audit.squarefreeR2, 4)}; v2-only groups are disqualified.`,
    "- cumulative/telescoping effect: the statistic is the fixed-shift sum S(h,N), not a cumulative gap, prime-counting, or endpoint telescope; the last dyadic level is still treated as holdout.",
    `- sampling artifact: ${audit.survivorCount} of ${audit.candidateCount} scored loci passed all gates at thresholds max-normalized >= ${scored.thresholds.realVsNullSeparation}, persistence >= ${scored.thresholds.persistence}, feature R2 >= ${scored.thresholds.featureR2}, and holdout ratio >= ${scored.thresholds.holdoutRatioMin}.`,
  ];
  return lines.join("\n");
}

function reportMarkdown({ args, atlas, randomNull, shuffled, scored, elapsedMs }) {
  const survivors = scored.survivors || [];
  const top = scored.candidates.slice(0, 12);
  const survivorSection = survivors.length
    ? `## Candidate Conjecture\n\n${survivors.slice(0, 5).map((candidate, i) => `${i + 1}. ${candidate.description}: residual normalized against both nulls persists across dyadic levels with score ${fmt(candidate.score, 4)}. This remains numerical evidence only.`).join("\n")}`
    : `## NO SURVIVOR\n\nNO SURVIVOR. The strongest scored loci failed at least one of the required gates: null separation, dyadic persistence, holdout sign/magnitude, feature support, or known-disguise audit. The ranked list is retained for inspection, but no candidate conjecture is promoted.`;

  return `# FrontierLab Chowla residual search

## Objective and Quarantine

Objective: search for a non-zeta rigid residual locus in the binary Chowla field, especially a stable dependence on the factorization type of h.

Quarantine: this run does not import or evaluate zeta functions, zeta zeros, explicit formula terms, Robin/Nicolas/Lagarias criteria, or any known RH-equivalent. The only arithmetic signal is Liouville parity and fixed-shift products.

Configuration: \`N0=${args.N0}\`, \`levels=${args.levels}\`, \`H=${args.H}\`, \`seeds=${args.seeds}\`.
Elapsed: \`${fmt(elapsedMs / 1000, 2)}s\`.

## Exact Statistic

\`\`\`text
lambda(n) = (-1)^Omega(n)
S(h,N) = sum_{1 <= n <= N-h} lambda(n) lambda(n+h)
Z(h,N) = S(h,N) / sqrt(N)
\`\`\`

The residual used in the heatmap and score is
\`(Z_real(h,N) - mean_random_multiplicative(h,N)) / sd_random_multiplicative(h,N)\`.

## Strongest Raw Final Shifts

${strongestShiftTable(atlas)}

## Strongest Residual Loci and Feature Groups

${candidateTable(top)}

## Dyadic Persistence

Entries are normalized residuals against the random completely multiplicative null.

${dyadicTable(top, atlas.Ns)}

## Feature Dependence Summary

${featureSummaryTable(scored)}

## Null Comparison

${nullComparisonTable(atlas, randomNull, shuffled)}

## Known Disguise Audit

${knownDisguiseAudit(scored)}

${survivorSection}
`;
}

function featureCsv(scored) {
  const rows = [["feature", "key", "n", "members_h", "mean_final_random_normalized", "energy_final_random_normalized", "feature_r2"]];
  for (const summary of scored.featureSummaries) {
    for (const group of summary.groups) {
      rows.push([
        summary.label,
        group.key,
        group.n,
        group.h.join(" "),
        group.mean,
        group.energy,
        summary.r2,
      ]);
    }
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
}

const args = parseArgs(process.argv.slice(2));
const t0 = Date.now();
fs.mkdirSync(args.outDir, { recursive: true });

console.error(`[frontier-chowla] atlas N0=${args.N0}, levels=${args.levels}, H=${args.H}`);
const atlas = dyadicChowlaAtlas({ N0: args.N0, levels: args.levels, H: args.H });
const maxN = atlas.Ns[atlas.Ns.length - 1];
const lambda = liouvilleUpTo(maxN);

console.error(`[frontier-chowla] random multiplicative null seeds=${args.seeds}`);
const randomNull = randomMultiplicativeNull({ N: atlas.Ns, H: args.H, seeds: args.seeds });

console.error(`[frontier-chowla] shuffled Liouville null seeds=${args.seeds}`);
const shuffled = shuffleNull({ lambda, N: atlas.Ns, H: args.H, seeds: args.seeds });

const scored = scoreChowlaAtlas(atlas, { randomMultiplicative: randomNull, shuffle: shuffled });
const elapsedMs = Date.now() - t0;

const output = {
  objective: "FrontierLab Chowla residual search for non-zeta rigid loci",
  quarantine: ["no zeta", "no zeta zeros", "no explicit formula", "no RH-equivalent criteria"],
  args,
  elapsedMs,
  atlas,
  nulls: {
    randomMultiplicative: randomNull,
    shuffle: shuffled,
  },
  scored,
};

const jsonPath = path.join(args.outDir, "chowla-atlas.json");
const reportPath = path.join(args.outDir, "chowla-report.md");
const svgPath = path.join(args.outDir, "chowla-heatmap.svg");
const csvPath = path.join(args.outDir, "chowla-feature-summary.csv");

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
fs.writeFileSync(reportPath, reportMarkdown({ args, atlas, randomNull, shuffled, scored, elapsedMs }));
fs.writeFileSync(svgPath, chowlaHeatmapSvg(atlas, { randomMultiplicative: randomNull }, scored));
fs.writeFileSync(csvPath, featureCsv(scored));

const summary = {
  ok: true,
  survivorCount: scored.survivors.length,
  top5: scored.candidates.slice(0, 5).map((candidate) => ({
    locus: candidateLabel(candidate),
    score: Number(candidate.score.toFixed(6)),
    verdict: candidate.verdict,
    rejectionReasons: candidate.rejectionReasons,
  })),
  files: { jsonPath, reportPath, svgPath, csvPath },
};

console.log(JSON.stringify(summary, null, 2));
