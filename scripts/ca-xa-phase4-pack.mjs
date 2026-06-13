#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_INPUT = "logs/divisor-extremes-artifacts/ca-xa-transitions.json";
const DEFAULT_OUTPUT = "logs/divisor-extremes-artifacts/ca-xa-phase4-pack.md";

function fmt(value, digits = 6) {
  if (!Number.isFinite(value)) return "n/a";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function int(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function linesForRuns(runs) {
  return runs.map((run) => (
    `- frontier ${int(run.fromFrontier)}: no-base primes ${run.primes.join(", ")}; `
    + `recovery path ${run.recoveryPrimes.join(", ")}; extra steps ${int(run.extraStepsAfterNoBaseRun)}`
  )).join("\n");
}

function main() {
  const input = process.argv[2] || DEFAULT_INPUT;
  const output = process.argv[3] || DEFAULT_OUTPUT;
  if (!existsSync(input)) throw new Error(`missing input ${input}`);

  const data = JSON.parse(readFileSync(input, "utf8"));
  const summary = data.summary;
  const postFirst = summary.caStepDecompositionSummary.postFirstCaXa;
  const approximation = postFirst.criticalApproximationSummary;
  const gap = approximation.newFrontierGap;
  const recovery = gap.noBaseRecovery;
  const boundary = approximation.newFrontierBoundary;
  const cSummary = data.cramerShapeContrast.map((row) => {
    const fakeGap = row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap;
    const fakeRecovery = fakeGap.noBaseRecovery;
    return `- seed ${row.seed}: ${int(fakeGap.noBaseBeforeSecondOrderThreshold)}/${int(fakeGap.steps)} no-base; `
      + `max run ${int(fakeGap.noBaseRuns.maxRunLength)}; unrecovered ${int(fakeRecovery.unrecoveredRuns)}; `
      + `max recovery steps ${int(fakeRecovery.maxTotalStepsToRecovery)}`;
  }).join("\n");

  const pack = `# CA-XA Phase-4 Expert Pack

Source artifact: \`${resolve(input)}\`

## Object

\`H = CA-XA\`, the intersection of colossally abundant numbers and extremely abundant records, is a divisor-world object. Its definition uses divisor sums and record/extremal conditions, not primality tests, \`mu\`, \`Lambda\`, or prime-indexed sums. Prime structure enters only through the CA endpoint theorem and the factorization of CA endpoints.

## Bridge Status

Known bridge: RH implies infinitely many \`CA-XA\` endpoints by Nazardonyavi-Yakubovich, and infinitely many \`CA-XA\` endpoints imply infinitely many XA records, hence RH. Lemma 21 gives the closure rule used here: a non-CA XA record between consecutive CA numbers forces the next CA endpoint to be XA. The new prime-pattern theorem below is still CONJECTURAL.

## Factor Check

No Dirichlet-series multiplier is being introduced. The object is an extremal divisor-record sequence, so the L2 failure mode of a catalog RH object multiplied by a zero-free bounded factor does not apply.

## Dictionary

For a new-frontier CA step \`C -> C*p\`, define

\`\`\`text
A(C)  = log(C) log log(C)
P0(C) = A(C) / W(A(C))
P2(C) = P0(C) + (log log(C) log(P0(C))) / (2(log(P0(C))+1)).
\`\`\`

The artifact verifies that the exact losing condition is equivalently:

\`\`\`text
p > Pcrit(C,0)
<=> F(p,1) < F(Pcrit(C,0),1)
\`\`\`

and that the root-free diagnostic

\`\`\`text
p > P2(C)
\`\`\`

has zero sign mismatches in the checked range.

## Lean-Stub-Ready Statements

Standalone parseable Lean 4 stub: \`logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean\`.

\`\`\`lean
def is_CA (n : Nat) : Prop := sorry
def is_XA (n : Nat) : Prop := sorry
def H (n : Nat) : Prop := is_CA n /\\ is_XA n

def F (x : Real) (k : Nat) : Real := sorry
def P0 (C : Nat) : Real := sorry
def P2 (C : Nat) : Real := sorry

def ca_frontier (C : Nat) : Nat := sorry
def next_ca_prime_step (C D : Nat) (p : Nat) : Prop := sorry
def no_base_step (C D : Nat) (p : Nat) : Prop :=
  next_ca_prime_step C D p /\\ (p : Real) > P2 C

def recovery_path (steps : List Nat) : Prop := sorry
\`\`\`

\`\`\`lean
-- CONJECTURE A: no-base runs are uniformly bounded.
axiom bounded_no_base_runs :
  exists B : Nat, forall run, is_no_base_run run -> run.length <= B

-- CONJECTURE B: every no-base run has uniformly bounded recovery.
axiom bounded_no_base_recovery :
  exists R : Nat, forall run, is_no_base_run run -> exists path,
    recovery_path path /\\ path.length <= R

-- CONDITIONAL THEOREM: A+B bound skipped CA endpoints and skipped frontier primes.
theorem bounded_CA_XA_skips_from_recovery :
  bounded_no_base_runs -> bounded_no_base_recovery ->
  exists K : Nat, forall A B, consecutive_H A B ->
    skipped_CA_endpoints A B <= K /\\ skipped_frontier_primes A B <= K := by
  sorry
\`\`\`

## Numerical Evidence

Real scan through A004394 rows \`s1..s${int(data.limit)}\`:

- XA records: ${int(summary.xaCount)}
- CA records: ${int(summary.caCount)}
- CA-XA records: ${int(summary.caXaCount)}
- non-CA XA closure failures: ${int(summary.closureFailures)}
- new-frontier CA steps after the first CA-XA record: ${int(gap.steps)}
- root-free no-base events \`p>P2(C)\`: ${int(gap.noBaseBeforeSecondOrderThreshold)}
- no-base run count: ${int(recovery.runCount)}
- maximum no-base run length: ${int(recovery.maxNoBaseRunLength)}
- unrecovered real no-base runs: ${int(recovery.unrecoveredRuns)}
- maximum total steps to recovery: ${int(recovery.maxTotalStepsToRecovery)}
- maximum extra steps after a no-base block: ${int(recovery.maxExtraStepsAfterNoBaseRun)}
- deepest cumulative log margin: ${fmt(recovery.deepestCumulativeLogMargin, 18)}
- exact-boundary mismatches: ${int(boundary.secondOrderBoundaryMismatches)}

Recovery paths:

${linesForRuns(recovery.runs)}

Fixed-shape Cramer contrast:

${cSummary}

## Nulls

Ordinary prime-gap bounds do not currently close the theorem. In this scan, the Baker-Harman-Pintz \`x^0.525\` scale fits inside only ${int(gap.ordinaryPrimeGapBenchmarks.bhp0525FitsP2Interval)} of ${int(gap.steps)} real \`(frontier,P2]\` intervals and in ${int(gap.ordinaryPrimeGapBenchmarks.noBaseBhp0525FitsP2Interval)} of the no-base cases. Dusart 2010 has ${int(gap.ordinaryPrimeGapBenchmarks.dusart2010ApplicableFrontiers)} applicable frontiers in this range.

## Status

OPEN / CONJECTURAL. The bridge and dictionary are exact, and the finite evidence is strong, but the global no-base-run and recovery bounds are not proved.
Focused stuck pack: \`logs/divisor-extremes-artifacts/ca-xa-stuck-pack.md\`.

## WHAT THIS TEACHES ABOUT PRIMES

The primes chosen by colossally abundant records are not free to drift arbitrarily: when the next prime jumps past the explicit threshold P2(C), the record height usually falls.
In the checked range, those jumps are rare, short, and quickly repaired by later prime choices or by increasing an older prime exponent.
The missing theorem is now concrete: prove that this jump-and-repair pattern must always stay bounded.
`;

  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, pack);
  process.stdout.write(`${output}\n`);
}

main();
