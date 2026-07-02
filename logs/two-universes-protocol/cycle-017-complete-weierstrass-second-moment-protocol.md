# Two-Universes Breakthrough Protocol - Cycle 017

Generated: 2026-06-17T10:08:51.872Z

Candidate: **Complete Weierstrass second-moment transport**

Decision: **WEIERSTRASS_SECOND_MOMENT_CALIBRATION_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL**

Cycle 017 executes the higher-moment algebraic-family mutation, but exact orthogonality absorbs the full theorem-normalized residual.

## Promotion Gates

| gate | status | evidence |
| --- | --- | --- |
| Precise theorem-shaped statement | PASS | Candidate states M2(K)/(\|K\|*good_count)-1 with theorem residual subtracting -1/\|K\|^2 for the complete family y^2=x^3+a*x+b. |
| Exact finite-field interpretation | PASS | F_q[t] side is exact: K=F_q[t]/P for monic irreducibles P over q=3,5,7, and the family is defined over the finite residue field K. |
| Integer-prime holdout evidence | PASS | Integer side checks the preregistered ladder 1000000, 2000000, 4000000, 8000000 through N=8000000. |
| Local/null/random controls | FAIL | Exact second-moment identity absorbs the signal: max exact residual z=0; max ST-baseline residual z=0.001459028. |
| Compression / low parameter count | PASS | One parameter-free second-moment identity covers every odd finite field, with no fitted coefficients. |
| Scale and field stability | PASS | Exact residual is stable across complete integer and q=3,5,7 ladders. Integer ladder=true; field ladders=true; validation=true; allExactResidualsZero=true. |
| Novelty audit | FAIL | This is a higher-moment mutation, but the exact residual is standard diagonal character orthogonality plus singular-curve bookkeeping. |
| Reproducible code, logs, plots | PASS | JSON/MD/SVG/script artifacts are present for the full 8M and q=3,5,7 run. |
| Plausible proof path | PASS | The exact formula is stated in the artifact and brute-validated over small prime fields. |
| Expert-ready evidence pack | FAIL | No expert-ready breakthrough pack exists because the candidate is fully explained by exact second-moment orthogonality. |

## Weierstrass Second-Moment Evidence

### Weierstrass Second-Moment Diagnostics

| complete integer ladder | complete q ladders | validation passed | exact residuals zero | absorbed by exact moment | max exact residual z | max ST-baseline residual z |
| --- | --- | --- | --- | --- | ---: | ---: |
| true | true | true | true | true | 0.000000 | 0.001459 |

### Theorem Shape

| part | statement |
| --- | --- |
| statistic | M2(K)/( \|K\| * good_count ) - 1, with theorem residual subtracting -1/\|K\|^2 |
| Z | K=F_p for rational primes p>=5 |
| F_q[t] | K=F_q[t]/P for monic irreducibles P over q=3,5,7 |
| exact identity | For odd finite fields K, the complete nonsingular family y^2=x^3+a*x+b has normalized second moment 1-1/\|K\|^2 |

### Integer Ladder

| label | labels | mean ST residual | ST residual z | ST energy z | exact residual z |
| --- | ---: | ---: | ---: | ---: | ---: |
| Z<=1000000 | 78496 | -0.000001161 | -0.000325287 | -1.966656 | 0.000000 |
| Z<=2000000 | 148931 | -0.000000612 | -0.000236156 | -1.966657 | 0.000000 |
| Z<=4000000 | 283144 | -0.000000322 | -0.000171273 | -1.966658 | 0.000000 |
| Z<=8000000 | 539775 | -0.000000169 | -0.000124047 | -1.966658 | 0.000000 |

### Field Endpoints

| q | endpoint | cumulative labels | endpoint labels | ST residual z | ST energy z | exact residual z |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 3 | F_3:deg12 | 69706 | 44220 | -0.001459028 | -1.988962 | 0.000000 |
| 5 | F_5:deg8 | 63319 | 48750 | -0.000870398 | -2.444791 | 0.000000 |
| 7 | F_7:deg7 | 141280 | 117648 | -0.000406178 | -2.825737 | 0.000000 |

### Brute Validation

| p | formula good count | brute good count | formula singular square sum | brute singular square sum | formula good M2 | brute good M2 | ok |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 20 | 20 | 4 | 4 | 96 | 96 | true |
| 7 | 42 | 42 | 6 | 6 | 288 | 288 | true |
| 11 | 110 | 110 | 10 | 10 | 1200 | 1200 | true |
| 13 | 156 | 156 | 12 | 12 | 2016 | 2016 | true |

## Surprise Ledger

- **observedSignal**: Normalized second moment is exactly 1-1/|K|^2; max exact residual z=0; max ST-baseline residual z=0.001459028.
- **expectedNull**: After subtracting the exact second-moment identity, no residual should remain.
- **knownExplanation**: Diagonal character orthogonality and singular-curve bookkeeping prove the complete-family second moment over every odd finite field.
- **survivedControls**: Exact second-moment theorem baseline removes every residual
- **failedControls**: No control-surviving theorem-normalized residual remains
- **whatFailed**: The candidate is higher-moment calibration, not a breakthrough signal.
- **suspectedInvariant**: Complete all-parameter algebraic-family moments are too rigid; useful next objects must break completeness or use monodromy/spectral residuals.
- **nextMutation**: Leave complete orthogonality moments; register an incomplete-family, monodromy, or spectral residual

## Forced Representation Mutation

Mutation: **Leave complete orthogonality moments; register an incomplete-family, monodromy, or spectral residual**

The higher-moment mutation also collapses exactly under finite-field character orthogonality, leaving no theorem-normalized residual.

Preregistered next move:

- Do not promote complete all-parameter moments whose residual is exactly zero after orthogonality bookkeeping.
- A next algebraic-family cycle must use an incomplete family, monodromy/spectral statistic, or a finite-field theorem whose integer analogue has a nonzero residual after the theorem baseline.
- Before data, preregister the finite-field object, integer analogue, local/null controls, full ladders, novelty audit, proof path, and expert-pack criteria.
- If the next object cannot name a nonzero theorem-normalized residual, stop rather than adding another complete-family calibration.

## Artifact Inventory

- present: `logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-8000000.json`
- present: `logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-8000000.md`
- present: `logs/two-universes-protocol/cycle-017-complete-weierstrass-second-moment-8000000.svg`
- present: `scripts/complete-weierstrass-second-moment-transport-audit.mjs`

