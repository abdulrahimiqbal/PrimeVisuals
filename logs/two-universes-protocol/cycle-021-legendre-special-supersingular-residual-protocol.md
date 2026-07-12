# Two-Universes Breakthrough Protocol - Cycle 021

Generated: 2026-06-17T10:34:05.488Z

Candidate: **Legendre special supersingular residual**

Decision: **LEGENDRE_SPECIAL_SUPERSINGULAR_RESIDUAL_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL**

Cycle 021 is theorem-first and full-scale, but it is exactly explained by known local congruence and CM special-locus criteria.

## Promotion Gates

| gate | status | evidence |
| --- | --- | --- |
| Precise theorem-shaped statement | PASS | Candidate states R(K)=B(K)-3/2, where B(K) counts supersingular Legendre parameters in the j=1728 and j=0 special automorphism loci. |
| Exact finite-field interpretation | PASS | F_q[t] side is exact: for K=F_q[t]/P, the special-locus count is determined by q mod 4, q mod 3, and whether q^deg(P) contains the j=0 lambda roots. |
| Integer-prime holdout evidence | PASS | Integer side checks the preregistered ladder 1000000, 2000000, 4000000, 8000000 through N=8000000. |
| Local/null/random controls | FAIL | The integer signal is explained exactly by the local mod-4 theorem control B(F_p)=3*1_{p=3 mod 4}; no control-surviving residual remains. |
| Compression / low parameter count | PASS | Low-parameter object: two special Legendre automorphism loci, one supersingularity count, and one centered residual. |
| Scale and field stability | FAIL | Scale gate requires full ladders, matched q=3,5,7 profile, and a non-local residual. Integer ladder=true; field ladders=true; matchedProfile=false; localControlExplains=true. |
| Novelty audit | FAIL | The large field-side z values and the integer residual are known supersingular special-locus congruence effects, not new two-universe structure. |
| Reproducible code, logs, plots | PASS | JSON/MD/SVG/script artifacts are present for the theorem-first 8M run. |
| Plausible proof path | PASS | The proof path is explicit: Deuring/Hasse invariant detects supersingular Legendre parameters, and the special j=1728/j=0 loci reduce to congruence criteria. |
| Expert-ready evidence pack | FAIL | No expert-ready breakthrough pack exists because the result is a known local congruence/CM special-locus theorem and fails controls, novelty, and matched-profile gates. |

## Legendre Special Supersingular Evidence

### Legendre Special Supersingular Diagnostics

| complete integer ladder | complete q ladders | validation passed | local control explains | integer beats controls | signs aligned | profile spread | matched profile | max endpoint |z| |
| --- | --- | --- | --- | --- | --- | ---: | --- | ---: |
| true | true | true | true | false | false | 1074.517772 | false | 563.808478 |

### Theorem Shape

| part | statement |
| --- | --- |
| statistic | R(K)=B(K)-3/2, where B(K) counts supersingular Legendre parameters in the j=1728 and j=0 special automorphism loci |
| Z | For rational primes p>=5, B(F_p)=3*1_{p=3 mod 4}; this is the Deuring/Hasse invariant criterion for the j=1728 orbit. |
| F_q[t] | For K=F_q[t]/P of degree d, B(K) is determined by q mod 4, q mod 3, and whether q^d contains the j=0 lambda roots. |
| baseline | This is a theorem-first nonzero residual, but it is exactly a local congruence/CM special-locus signal and is not novel. |

### Integer Ladder

| endpoint | labels | mean residual | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78496 | 0.002790 | 0.781664 | 0.521110 | 1.500000 |
| 2000000 | 148931 | 0.000997 | 0.384799 | 0.256533 | 1.500000 |
| 4000000 | 283144 | 0.000742 | 0.394653 | 0.263102 | 1.500000 |
| 8000000 | 539775 | 0.000714 | 0.524708 | 0.349806 | 1.500000 |

### Integer Controls

| control | final abs z range | max abs z range | energy z range |
| --- | ---: | ---: | ---: |
| localMod4 | 0.524708..0.524708 | 1.500000..1.500000 | 0.349806..0.349806 |
| shuffle | 0.524708..0.524708 | 2.138882..3.534133 | 0.349806..0.349806 |
| signFlip | 0.210292..2.864459 | 2.261335..4.144809 | -1.670083..1.909639 |
| bootstrap | 0.067375..3.162542 | 2.806243..5.306957 | -2.108361..1.525806 |

### Field Endpoints

| q | endpoint | labels | cumulative labels | B(K) | residual | z | energy z | max abs z |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | F_3:deg12 | 44220 | 69706 | 1 | -0.500000 | -132.009469 | -264.018939 | 132.009469 |
| 5 | F_5:deg8 | 48750 | 63319 | 2 | 0.500000 | 31.798335 | 40.266160 | 135.652141 |
| 7 | F_7:deg7 | 117648 | 141280 | 3 | 1.500000 | 563.808478 | 375.872319 | 563.808478 |

### Deuring Validation

| p | p mod 4 | special lambdas | Deuring supersingular lambdas | formula count | ok |
| ---: | ---: | --- | --- | ---: | --- |
| 5 | 1 | 2,3,4 |  | 0 | true |
| 7 | 3 | 2,3,4,5,6 | 2,4,6 | 3 | true |
| 11 | 3 | 2,6,10 | 2,6,10 | 3 | true |
| 13 | 1 | 2,4,7,10,12 |  | 0 | true |
| 17 | 1 | 2,9,16 |  | 0 | true |
| 19 | 3 | 2,8,10,12,18 | 2,10,18 | 3 | true |
| 23 | 3 | 2,12,22 | 2,12,22 | 3 | true |
| 29 | 1 | 2,15,28 |  | 0 | true |
| 31 | 3 | 2,6,16,26,30 | 2,16,30 | 3 | true |
| 43 | 3 | 2,7,22,37,42 | 2,22,42 | 3 | true |

## Surprise Ledger

- **observedSignal**: Integer final z=0.524708; max endpoint |z|=563.808478; profileSpread=1074.517772; localControlExplains=true.
- **expectedNull**: A useful theorem-first residual should remain after local congruence, special automorphism, and CM controls are subtracted.
- **knownExplanation**: Deuring/Hasse invariant plus j=1728 and j=0 special-locus congruence criteria explain the entire signal.
- **survivedControls**: 
- **failedControls**: Exact local mod-4 theorem control reproduces the integer signal; q=3,5,7 profiles are fixed by q-local congruence and extension-degree effects
- **whatFailed**: The object is a known theorem calibration, not a breakthrough candidate.
- **suspectedInvariant**: Large theorem-first signals can be fake breakthroughs unless all local congruence and special-locus baselines are subtracted first.
- **nextMutation**: Leave special automorphism and CM loci; require generic non-CM residual with a named baseline

## Forced Representation Mutation

Mutation: **Leave special automorphism and CM loci; require generic non-CM residual with a named baseline**

The theorem-first supersingular residual is computable without point-counting and has a full integer ladder, but the signal is exactly a known local congruence/CM special-locus effect.

Preregistered next move:

- Do not promote supersingular special-orbit signals or any statistic exactly explained by p mod 4, p mod 3, or fixed-character local controls.
- A next algebraic cycle must use generic non-CM Legendre/elliptic-family structure, not j=1728 or j=0 special automorphism loci.
- Before data, name the finite-field theorem baseline and the nonzero residual that remains after subtracting all local congruence and CM-special-locus controls.
- If no generic residual can be stated before computation, stop rather than using large z-scores from known local theorem effects.

## Artifact Inventory

- present: `logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-8000000.json`
- present: `logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-8000000.md`
- present: `logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-8000000.svg`
- present: `scripts/legendre-special-supersingular-residual-audit.mjs`

