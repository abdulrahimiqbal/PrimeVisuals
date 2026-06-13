#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_INPUT = "logs/divisor-extremes-artifacts/ca-xa-transitions.json";
const DEFAULT_OUTPUT = "logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean";

function int(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function fixed(value, digits = 18) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value).toFixed(digits);
}

function main() {
  const input = process.argv[2] || DEFAULT_INPUT;
  const output = process.argv[3] || DEFAULT_OUTPUT;
  if (!existsSync(input)) throw new Error(`missing input ${input}`);

  const data = JSON.parse(readFileSync(input, "utf8"));
  const postFirst = data.summary.caStepDecompositionSummary.postFirstCaXa;
  const gap = postFirst.criticalApproximationSummary.newFrontierGap;
  const recovery = gap.noBaseRecovery;
  const seedLines = data.cramerShapeContrast.map((row) => {
    const fakeGap = row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap;
    const fakeRecovery = fakeGap.noBaseRecovery;
    return `-- cramer seed ${row.seed}: ${int(fakeGap.noBaseBeforeSecondOrderThreshold)}/${int(fakeGap.steps)} no-base, max run ${int(fakeGap.noBaseRuns.maxRunLength)}, unrecovered ${int(fakeRecovery.unrecoveredRuns)}, max recovery ${int(fakeRecovery.maxTotalStepsToRecovery)}`;
  }).join("\n");

  const lean = `/-
CA-XA Phase-4 theorem stubs.

Generated from: ${resolve(input)}

This file is intentionally a Lean 4 skeleton. The divisor-world definitions
are opaque placeholders, and the final theorem is a conditional proof target
closed by sorry. The point is to make the current conjectural bridge precise
enough to hand to a formalization effort without pretending the missing global
prime-pattern theorem has been proved.

Real scan evidence:
-- rows = ${int(data.limit)}
-- XA records = ${int(data.summary.xaCount)}
-- CA records = ${int(data.summary.caCount)}
-- CA-XA records = ${int(data.summary.caXaCount)}
-- closure failures = ${int(data.summary.closureFailures)}
-- real new-frontier steps = ${int(gap.steps)}
-- real no-base events p > P2(C) = ${int(gap.noBaseBeforeSecondOrderThreshold)}
-- real no-base runs = ${int(recovery.runCount)}
-- max real no-base run = ${int(recovery.maxNoBaseRunLength)}
-- unrecovered real no-base runs = ${int(recovery.unrecoveredRuns)}
-- max real total recovery steps = ${int(recovery.maxTotalStepsToRecovery)}
-- max real extra recovery steps = ${int(recovery.maxExtraStepsAfterNoBaseRun)}
-- deepest real cumulative log margin = ${fixed(recovery.deepestCumulativeLogMargin)}
${seedLines}
-/

namespace CAXA

opaque Real : Type

opaque is_CA : Nat -> Prop
opaque is_XA : Nat -> Prop

def H (n : Nat) : Prop :=
  is_CA n ∧ is_XA n

axiom F : Nat -> Nat -> Real
axiom P0 : Nat -> Real
axiom P2 : Nat -> Real
opaque ca_frontier : Nat -> Nat

opaque next_ca_prime_step : Nat -> Nat -> Nat -> Prop
opaque above_P2 : Nat -> Nat -> Prop

def no_base_step (C D p : Nat) : Prop :=
  next_ca_prime_step C D p ∧ above_P2 C p

structure NoBaseRun where
  start_frontier : Nat
  primes : List Nat

structure RecoveryPath where
  primes : List Nat
  uses_old_exponent_step : Prop

def run_length (run : NoBaseRun) : Nat :=
  run.primes.length

def path_length (path : RecoveryPath) : Nat :=
  path.primes.length

opaque is_no_base_run : NoBaseRun -> Prop
opaque recovery_path : NoBaseRun -> RecoveryPath -> Prop
opaque consecutive_H : Nat -> Nat -> Prop
opaque skipped_CA_endpoints : Nat -> Nat -> Nat
opaque skipped_frontier_primes : Nat -> Nat -> Nat

-- CONJECTURE A: no-base runs are uniformly bounded.
axiom bounded_no_base_runs :
  ∃ B : Nat, ∀ run : NoBaseRun, is_no_base_run run -> run_length run ≤ B

-- CONJECTURE B: every no-base run has uniformly bounded recovery.
axiom bounded_no_base_recovery :
  ∃ R : Nat, ∀ run : NoBaseRun, is_no_base_run run ->
    ∃ path : RecoveryPath, recovery_path run path ∧ path_length path ≤ R

-- CONDITIONAL THEOREM: A+B bound skipped CA endpoints and skipped frontier primes.
theorem bounded_CA_XA_skips_from_recovery
    (hRuns : ∃ B : Nat, ∀ run : NoBaseRun, is_no_base_run run -> run_length run ≤ B)
    (hRecovery : ∃ R : Nat, ∀ run : NoBaseRun, is_no_base_run run ->
      ∃ path : RecoveryPath, recovery_path run path ∧ path_length path ≤ R) :
    ∃ K : Nat, ∀ A B : Nat, consecutive_H A B ->
      skipped_CA_endpoints A B ≤ K ∧ skipped_frontier_primes A B ≤ K := by
  sorry

end CAXA
`;

  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, lean);
  process.stdout.write(`${output}\n`);
}

main();
