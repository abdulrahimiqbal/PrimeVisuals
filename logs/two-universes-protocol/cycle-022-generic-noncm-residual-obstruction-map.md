# Generic non-CM residual obstruction map

Cycle 022 applies the cycle-021 stop rule before data: leave `j=1728`, `j=0`, CM, special automorphism loci, and fixed local congruence signals; require a named generic non-CM residual and finite-field theorem baseline.

## Registration Requirements

| id | rule |
| --- | --- |
| exact_finite_field_baseline | A finite-field theorem baseline must be named before data. |
| generic_noncm_object | The object must leave j=1728, j=0, CM, special automorphism, and fixed local congruence loci. |
| nonzero_control_surviving_residual | A nonzero residual must remain after local congruence, complete-family, and special-locus controls are subtracted. |
| full_integer_ladder | The integer side must be computable on the preregistered 1M/2M/4M/8M ladder without brute point-counting per prime. |
| matched_field_profile | The same statistic must make sense on q=3,5,7 F_q[t] residue fields without changing explanation per q. |
| novelty_proof_path | The route must not be a renamed known theorem calibration and must expose a plausible proof path. |

## Candidate Class Screen

| class | exact finite-field baseline | generic status | integer 8M status | eligible | blocker |
| --- | --- | --- | --- | --- | --- |
| complete_legendre_second_moment | Character orthogonality gives the complete-family baseline S_2(K)=\|K\|^2-2\|K\|-3 for odd finite fields. | not sufficient: the complete family includes special loci and collapses by all-parameter orthogonality | computable by formula, but only as a calibration identity | false | No nonzero residual remains after the exact complete-family theorem baseline. |
| special_excised_complete_legendre_moment | Can be reduced to complete-family orthogonality minus CM special-locus trace-square controls. | closer, but still a complete-family identity over the remaining parameter shell | requires CM trace-square bookkeeping but does not create a new statistic | false | Deleting special loci still leaves no named nonzero generic residual. |
| fixed_generic_lambda_trace | No exact two-universe finite-field baseline is registered; Sato-Tate is an archimedean distribution heuristic, not a matched F_q[t] theorem here. | yes, if lambda avoids CM and special automorphism loci | not computable in the current loop at full 8M without a fast non-CM trace engine or SEA-style implementation | false | No preregistered finite-field theorem baseline and no full-scale integer trace engine. |
| incomplete_generic_lambda_window | No exact baseline is currently named for the incomplete window after local and special-locus controls. | possible, depending on the window | current exact point-counting path is pilot-scale only, as cycle 020 showed | false | The required nonzero residual is not stated before computation. |
| generic_supersingular_lambda_roots | Deuring polynomial gives an exact finite-field object, but the generic root-count profile is governed by supersingular j-distribution/class-number structure. | partly generic after deleting j=1728 and j=0 | no full-ladder implementation is registered that separates generic roots from known local and CM controls | false | The residual after known supersingular, class-number, and extension-degree baselines is not named. |
| higher_generic_legendre_moments | Moment formulas are expected to involve modular/monodromy trace terms, but no exact baseline is registered in this repo for q=3,5,7 and the integer ladder. | possible after special-locus deletion | not implemented | false | No exact baseline or reproducible implementation exists. |
| l_adic_monodromy_trace_function | Plausible finite-field theory exists in principle, but no concrete trace function, conductor, normalization, or integer analogue is registered here. | possible | not defined | false | The object is not concrete enough to score or reproduce. |

## Summary

- Candidate classes screened: 7
- Experiment-eligible classes: 0
- Exact finite-field baselines present or reducible: 5
- Full integer ladder implementations present: 1
- Nonzero residuals named before data: 0
- Branch decision: NO_EXPERIMENT_ELIGIBLE_GENERIC_NONCM_RESIDUAL

## Forced Next Move

Register a concrete generic non-CM residual with exact finite-field baseline, special/CM/local controls, and a full 8M integer implementation before any new data run.

JSON: `logs/two-universes-protocol/cycle-022-generic-noncm-residual-obstruction-map.json`
SVG: `logs/two-universes-protocol/cycle-022-generic-noncm-residual-obstruction-map.svg`
