#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_INPUT = "logs/divisor-extremes-artifacts/ca-xa-transitions.json";
const DEFAULT_OUTPUT = "logs/divisor-extremes-artifacts/ca-xa-stuck-pack.md";

function int(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function fixed(value, digits = 18) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value).toFixed(digits);
}

function cramerLines(rows) {
  return rows.map((row) => {
    const gap = row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap;
    const recovery = gap.noBaseRecovery;
    return `- seed ${row.seed}: ${int(gap.noBaseBeforeSecondOrderThreshold)}/${int(gap.steps)} no-base; `
      + `max run ${int(gap.noBaseRuns.maxRunLength)}; `
      + `unrecovered ${int(recovery.unrecoveredRuns)}; `
      + `max recovery ${int(recovery.maxTotalStepsToRecovery)}`;
  }).join("\n");
}

function recoveryLines(runs) {
  return runs.map((run) => (
    `- frontier ${int(run.fromFrontier)}: no-base ${run.primes.join(", ")}; `
    + `recovery ${run.recoveryPrimes.join(", ")}; `
    + `extra steps ${int(run.extraStepsAfterNoBaseRun)}; `
    + `extra new-frontier steps ${int(run.extraNewFrontierSteps)}; `
    + `extra old-exponent steps ${int(run.extraNonNewFrontierSteps)}`
  )).join("\n");
}

function main() {
  const input = process.argv[2] || DEFAULT_INPUT;
  const output = process.argv[3] || DEFAULT_OUTPUT;
  if (!existsSync(input)) throw new Error(`missing input ${input}`);

  const data = JSON.parse(readFileSync(input, "utf8"));
  const summary = data.summary;
  const postFirst = summary.caStepDecompositionSummary.postFirstCaXa;
  const gap = postFirst.criticalApproximationSummary.newFrontierGap;
  const recovery = gap.noBaseRecovery;
  const ordinary = gap.ordinaryPrimeGapBenchmarks;
  const barrier = summary.endpointBarrierSummary;

  const pack = `# CA-XA Focused STUCK PACK

Source artifact: \`${resolve(input)}\`

## Trigger

The same derivation gap has persisted through HANDOFF 26, HANDOFF 27, and HANDOFF 28: the bridge and dictionary are exact, but the global theorem that would turn the numerical prime pattern into a completed reformulation is still missing.

## Exact Gap

Let \`H = CA ∩ XA\`. Between consecutive \`H\` records, follow the consecutive CA endpoint chain. For a new-frontier CA step \`C -> C*p\`, the exact losing boundary is the real root \`Pcrit(C,0)\`, and the checked root-free replacement is

\`\`\`text
P2(C) = A(C)/W(A(C)) + (log log(C) log(A(C)/W(A(C)))) / (2(log(A(C)/W(A(C)))+1)),
A(C) = log(C) log log(C).
\`\`\`

The unresolved theorem is:

\`\`\`text
Conjecture A. Runs of consecutive new-frontier CA steps with p > P2(C) are uniformly bounded.
Conjecture B. Every such run has uniformly bounded recovery in sigma(n)/(n log log n), allowing both later below-P2 new-frontier steps and old-exponent CA steps.
Conditional theorem. A+B imply a uniform bound for skipped CA endpoints and skipped frontier primes between consecutive H records.
\`\`\`

The parseable Lean shell is \`logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean\`; its theorem \`bounded_CA_XA_skips_from_recovery\` is still closed by \`sorry\`.

## What Was Tried

1. Exact divisor-world bridge. \`CA\`, \`XA\`, and \`H\` are defined without a primality test, and Nazardonyavi-Yakubovich give the RH bridge through infinitely many \`XA\` and \`CA ∩ XA\` endpoints.
2. Endpoint closure. Lemma 21 closes every scanned non-CA \`XA\` record at the next CA endpoint: \`${int(summary.closureFailures)}\` closure failures in \`${int(summary.nonCaXaCount)}\` non-CA \`XA\` records after \`10080\`.
3. Exact local dictionary. The \`Pcrit(C,0)\` classifier and \`P2(C)\` replacement have zero sign mismatches in the real scan and in all fixed-shape Cramer controls.
4. Ordinary prime-gap input. Baker-Harman-Pintz \`x^0.525\` fits inside only \`${int(ordinary.bhp0525FitsP2Interval)}\` of \`${int(gap.steps)}\` real \`(frontier(C),P2(C)]\` intervals and in \`${int(ordinary.noBaseBhp0525FitsP2Interval)}\` of the no-base cases. Dusart 2010 has \`${int(ordinary.dusart2010ApplicableFrontiers)}\` applicable frontiers in the scanned range.
5. Recovery decomposition. The real run at frontier \`523\` recovers through the old-exponent multiplier \`31\`, so a proof using only later below-\`P2\` new frontiers is insufficient.

## Evidence Snapshot

Real scan through A004394 rows \`s1..s${int(data.limit)}\`:

- XA records: ${int(summary.xaCount)}
- CA records: ${int(summary.caCount)}
- CA-XA records: ${int(summary.caXaCount)}
- frontier-changing \`H\` transitions: ${int(summary.frontierSkipSummary.frontierChangingTransitions)}
- skipped CA endpoints: ${int(barrier.skippedCAEndpointTotal)}
- max skipped CA endpoints in one transition: ${int(barrier.maxSkippedCAEndpoints)}
- new-frontier CA steps after first \`H\`: ${int(gap.steps)}
- no-base events \`p>P2(C)\`: ${int(gap.noBaseBeforeSecondOrderThreshold)}
- no-base runs: ${int(recovery.runCount)}
- max no-base run length: ${int(recovery.maxNoBaseRunLength)}
- unrecovered real no-base runs: ${int(recovery.unrecoveredRuns)}
- max total recovery steps: ${int(recovery.maxTotalStepsToRecovery)}
- max extra recovery steps after a no-base block: ${int(recovery.maxExtraStepsAfterNoBaseRun)}
- deepest cumulative log margin: ${fixed(recovery.deepestCumulativeLogMargin)}

Real recovery paths:

${recoveryLines(recovery.runs)}

Fixed-shape Cramer contrast:

${cramerLines(data.cramerShapeContrast)}

## Minimal Expert Questions

1. Can CA epsilon spacing plus known or conjectural prime-gap input prove any uniform bound, or even a useful explicit bound, for consecutive new-frontier steps satisfying \`p>P2(C)\`?
2. If a no-base run occurs, can the cumulative log-height deficit be forced to recover in boundedly many CA steps when old-exponent multipliers are allowed?
3. Equivalently, for consecutive \`H\` records \`A=C_0 < C_1 < ... < C_t=B\` inside the CA endpoint chain, can one bound \`t\` from the CA parameterization and the record inequality \`sigma(C_i)/(C_i log log C_i) <= sigma(A)/(A log log A)\` for \`0<i<t\`?

## Expert Answer That Would Move The Goal

A useful answer is one of:

- a proof of Conjecture A and Conjecture B;
- a weaker explicit bound that still gives a quantitative skipped-frontier theorem;
- a counterexample mechanism showing that uniform boundedness is the wrong target and suggesting the correct growth scale.

## Status

OPEN / CONJECTURAL. This pack is a trigger for expert mathematical input, not a completion certificate.
`;

  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, pack);
  process.stdout.write(`${output}\n`);
}

main();
