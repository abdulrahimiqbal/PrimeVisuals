# Two-Universes Breakthrough Protocol - Cycle 020

Generated: 2026-06-17T10:28:36.907Z

Candidate: **Non-CM Legendre family pilot**

Decision: **NONCM_LEGENDRE_FAMILY_PILOT_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL**

Cycle 020 reaches a genuine non-CM non-isotrivial family, but remains pilot-scale and fails integer holdout, control/profile, scale, novelty, and expert-pack gates.

## Promotion Gates

| gate | status | evidence |
| --- | --- | --- |
| Precise theorem-shaped statement | PASS | Candidate states V_S(K)=sum_lambda a_K(E_lambda)/sqrt(\|K\|*good_lambda) for the non-CM Legendre family E_lambda:y^2=x(x-1)(x-lambda). |
| Exact finite-field interpretation | PASS | F_q[t] side is exact: K=F_q[t]/P, lambda is a low-degree polynomial window, and traces are computed by quadratic characters in the residue field. |
| Integer-prime holdout evidence | FAIL | Integer side only ran pilot endpoints 5000, 10000, 20000 through N=20000; preregistered promotion requires 1M, 2M, 4M, and 8M. |
| Local/null/random controls | FAIL | No matched profile survives: integerBeatsControls=false, signsAligned=true, profileSpread=6.427625. |
| Compression / low parameter count | PASS | Low-parameter object: one Legendre family, one fixed lambda-window rule, and one normalized trace statistic. |
| Scale and field stability | FAIL | Scale gate requires the full integer ladder, q=3,5,7 field ladders, and matched profile. Integer ladder=false; field ladders=true; matchedProfile=false. |
| Novelty audit | FAIL | The object is a genuine forced mutation out of CM, but the present result is only a known-style Legendre-family mean-zero trace pilot with no control-surviving new residual. |
| Reproducible code, logs, plots | PASS | JSON/MD/SVG/script artifacts are present for the non-CM pilot run. |
| Plausible proof path | PASS | The trace statistic is exact and small-prime point-count validation passes; a proof path would start from Legendre-family trace sums and monodromy baselines. |
| Expert-ready evidence pack | FAIL | No expert-ready breakthrough pack exists because this is pilot-scale, lacks the full integer ladder, and fails control/profile gates. |

## Non-CM Legendre Evidence

### Non-CM Legendre Diagnostics

| required integer ladder | complete q ladders | validation passed | integer beats controls | signs aligned | profile spread | matched profile | max endpoint |z| |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| false | true | true | false | true | 6.427625 | false | 1.126554 |

### Theorem Shape

| part | statement |
| --- | --- |
| statistic | V_S(K)=sum_{lambda in S good} a_K(E_lambda)/sqrt(\|K\|*good), E_lambda:y^2=x(x-1)(x-lambda) |
| Z | K=F_p with integer lambda window |
| F_q[t] | K=F_q[t]/P with low-degree polynomial lambda(t) window |
| baseline | Non-CM Legendre-family monodromy suggests mean-zero trace sums; promotion requires full integer ladder and matched field controls. |

### Integer Pilot Ladder

| endpoint | labels | mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| 5000 | 667 | 0.017762 | 0.458727 | 0.490096 | 1.058777 |
| 10000 | 1227 | 0.012503 | 0.437961 | 0.455010 | 1.058777 |
| 20000 | 2260 | 0.016063 | 0.763627 | 0.786265 | 1.202139 |

### Integer Controls

| control | final abs z range | max abs z range | energy z range |
| --- | ---: | ---: | ---: |
| shuffle | 0.763627..0.763627 | 1.272498..3.316071 | 0.786265..0.786265 |
| signFlip | 0.164474..1.428257 | 1.238744..2.015646 | -1.470598..0.946104 |
| bootstrap | 0.172818..3.424116 | 1.812003..3.582680 | 0.175109..3.558179 |

### Field Endpoints

| q | endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | F_3:deg7 | 312 | 508 | -0.018519 | 0.175267 | 0.175048 | 1.028500 |
| 5 | F_5:deg5 | 624 | 829 | 0.011784 | 0.555622 | 0.552367 | 2.063712 |
| 7 | F_7:deg4 | 588 | 728 | 0.046249 | 1.126554 | 1.227354 | 1.468925 |

### Point-Count Validation

| p | lambda | trace | point count | ok |
| ---: | ---: | ---: | ---: | --- |
| 5 | 2 | -2 | 8 | true |
| 7 | 2 | 0 | 8 | true |
| 11 | 2 | 0 | 12 | true |
| 13 | 2 | 6 | 8 | true |
| 17 | 2 | 2 | 16 | true |
| 19 | 2 | 0 | 20 | true |

## Surprise Ledger

- **observedSignal**: Integer final z=0.763627; max endpoint |z|=1.126554; profileSpread=6.427625; matchedProfile=false.
- **expectedNull**: A useful non-CM Legendre-family residual should survive integer controls, full integer scale ladder, and align in sign/scale across q=3,5,7 field profiles.
- **knownExplanation**: Known Legendre-family trace-sum/monodromy baselines predict mean-zero behavior; the pilot profile is small and control-absorbed.
- **survivedControls**: 
- **failedControls**: Integer profile does not beat controls, full integer holdout ladder is absent, and q-field profile spread is too large
- **whatFailed**: The object is an exact non-CM pilot, not a breakthrough candidate.
- **suspectedInvariant**: A useful continuation needs either full-scale non-CM trace computation or a theorem-first residual with a named nonzero baseline.
- **nextMutation**: Require fast non-CM trace engine or theorem-first nonzero residual before promotion attempt

## Forced Representation Mutation

Mutation: **Require fast non-CM trace engine or theorem-first nonzero residual before promotion attempt**

The non-CM Legendre family is the right kind of representation jump, but the current exact evaluator is only a pilot and the observed profile does not survive the strict holdout/control/scale gates.

Preregistered next move:

- Do not promote pilot-scale non-CM trace profiles as breakthrough structure.
- A next cycle must either implement a faster non-CM trace engine for the full 1M/2M/4M/8M integer ladder, or formulate a theorem-first residual computable without brute rational-prime point counting.
- Keep the exact finite-field object, integer analogue, q=3,5,7 ladders, local/null controls, novelty audit, proof path, and expert-pack criteria preregistered before data.
- If the next proposal cannot name the theorem baseline and the nonzero residual in advance, stop rather than fitting another trace statistic.

## Artifact Inventory

- present: `logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-20000.json`
- present: `logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-20000.md`
- present: `logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-20000.svg`
- present: `scripts/noncm-legendre-family-pilot-audit.mjs`

