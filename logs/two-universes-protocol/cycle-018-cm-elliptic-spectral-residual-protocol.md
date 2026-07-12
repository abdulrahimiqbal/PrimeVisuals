# Two-Universes Breakthrough Protocol - Cycle 018

Generated: 2026-06-17T10:13:42.032Z

Candidate: **CM elliptic spectral residual**

Decision: **CM_ELLIPTIC_SPECTRAL_RESIDUAL_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL**

Cycle 018 breaks complete-family orthogonality with a fixed CM curve, but the integer profile is absorbed by controls and the F_q[t] side is degree-rigid.

## Promotion Gates

| gate | status | evidence |
| --- | --- | --- |
| Precise theorem-shaped statement | PASS | Candidate states u2(K)=a_K(E)^2/\|K\|-1 for the fixed CM curve E:y^2=x^3-x. |
| Exact finite-field interpretation | PASS | F_q[t] side is exact: K=F_q[t]/P and, for constant E/F_q, a_K is computed by the Frobenius recurrence from a_q. |
| Integer-prime holdout evidence | PASS | Integer side checks the preregistered ladder 1000000, 2000000, 4000000, 8000000 through N=8000000. |
| Local/null/random controls | FAIL | No matched profile survives: integerBeatsControls=false, fieldSignsAligned=false, fieldIntegerZSpread=4485.312225. |
| Compression / low parameter count | PASS | Low-parameter object: one fixed CM curve and one fixed u2 spectral statistic. |
| Scale and field stability | FAIL | Scale gate requires complete ladders and matched integer/field profile. Integer ladder=true; field ladders=true; matchedProfile=false. |
| Novelty audit | FAIL | The mutation is genuine, but the finite-field side is a constant-curve degree profile and the integer side is absorbed by controls; this is CM calibration, not new structure. |
| Reproducible code, logs, plots | PASS | JSON/MD/SVG/script artifacts are present for the full 8M and q=3,5,7 run. |
| Plausible proof path | PASS | The CM trace formula is brute-validated over small prime fields and the field recurrence is explicit. |
| Expert-ready evidence pack | FAIL | No expert-ready breakthrough pack exists because controls and matched-field gates fail. |

## CM Elliptic Evidence

### CM Elliptic Diagnostics

| complete integer ladder | complete q ladders | validation passed | integer beats controls | field signs aligned | profile spread | matched profile | max endpoint |z| |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| true | true | true | false | false | 4485.312225 | false | 2262.660872 |

### Theorem Shape

| part | statement |
| --- | --- |
| statistic | u2(K)=a_K(E)^2/\|K\|-1 for E:y^2=x^3-x |
| Z | K=F_p for rational primes p>=3, with CM trace formula by two-square representation |
| F_q[t] | K=F_q[t]/P; for constant E/F_q, a_K is computed by the Frobenius recurrence a_{q^d}=a_q*a_{q^{d-1}}-q*a_{q^{d-2}} |
| baseline | CM Sato-Tate predicts mean-zero u2 in aggregate, but no exact labelwise cancellation is subtracted. |

### Integer Ladder

| endpoint | labels | mean u2 | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78497 | -0.003321 | -0.930586 | -0.658940 | 1.607453 |
| 2000000 | 148932 | -0.001019 | -0.393371 | -0.278309 | 1.607453 |
| 4000000 | 283145 | -0.000955 | -0.508032 | -0.359390 | 1.607453 |
| 8000000 | 539776 | -0.000687 | -0.504460 | -0.356829 | 1.607453 |

### Integer Controls

| control | final abs z range | max abs z range | energy z range |
| --- | ---: | ---: | ---: |
| shuffle | 0.504460..0.504460 | 2.600927..4.389432 | -0.356829..-0.356829 |
| signFlip | 0.169457..2.402715 | 2.126007..4.051351 | -0.363024..1.699556 |
| bootstrap | 0.176868..1.361376 | 3.094197..4.358104 | -0.699195..0.962414 |

### Field Endpoints

| q | endpoint | cumulative labels | trace | u2 | z | energy z | max abs z |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | F_3:deg14 | 533830 | -4374 | 3.000000 | 1418.343737 | 540.640776 | 1418.343737 |
| 5 | F_5:deg10 | 1256567 | 474 | -0.976993 | -397.412784 | -319.390040 | 960.051910 |
| 7 | F_7:deg8 | 861580 | 4802 | 3.000000 | 2262.660872 | 806.279869 | 2262.660872 |

### Trace Validation

| p | formula trace | brute trace | ok |
| ---: | ---: | ---: | --- |
| 3 | 0 | 0 | true |
| 5 | -2 | -2 | true |
| 7 | 0 | 0 | true |
| 13 | 6 | 6 | true |
| 17 | 2 | 2 | true |
| 29 | -10 | -10 | true |
| 37 | -2 | -2 | true |
| 53 | 14 | 14 | true |
| 97 | 18 | 18 | true |

## Surprise Ledger

- **observedSignal**: Integer final z=-0.504460; max field endpoint |z|=2262.660872; matchedProfile=false.
- **expectedNull**: A true two-universe spectral residual should survive integer controls and align across q=3,5,7 field profiles.
- **knownExplanation**: CM trace formula and constant-curve Frobenius recurrence explain the observed profiles.
- **survivedControls**: 
- **failedControls**: Integer order/null controls absorb the prime profile and field profiles are degree-rigid/misaligned
- **whatFailed**: The object is a fixed-curve calibration, not a breakthrough candidate.
- **suspectedInvariant**: Constant curves over F_q[t] are too rigid; useful algebraic-family transport must use nonconstant monodromy or incomplete-family residuals.
- **nextMutation**: Leave constant curves; register nonconstant monodromy or an incomplete-family residual

## Forced Representation Mutation

Mutation: **Leave constant curves; register nonconstant monodromy or an incomplete-family residual**

The fixed CM curve avoids complete-family orthogonality, but its F_q[t] side is degree-rigid and its integer profile is absorbed by controls.

Preregistered next move:

- Do not promote constant-curve residue-field degree profiles as two-universe structure.
- A next algebraic cycle must use a nonconstant curve/family over F_q(t), an incomplete family, or a monodromy/spectral statistic whose finite-field profile is not determined only by degree.
- Before data, preregister the theorem baseline, integer analogue, local/null controls, full ladders, novelty audit, proof path, and expert-pack criteria.
- If the object cannot avoid complete-family orthogonality and constant-curve degree rigidity, stop rather than adding another calibration.

## Artifact Inventory

- present: `logs/two-universes-protocol/cycle-018-cm-elliptic-spectral-residual-8000000.json`
- present: `logs/two-universes-protocol/cycle-018-cm-elliptic-spectral-residual-8000000.md`
- present: `logs/two-universes-protocol/cycle-018-cm-elliptic-spectral-residual-8000000.svg`
- present: `scripts/cm-elliptic-spectral-residual-audit.mjs`

