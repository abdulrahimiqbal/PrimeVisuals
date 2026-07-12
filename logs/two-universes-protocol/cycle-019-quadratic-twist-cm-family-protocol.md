# Two-Universes Breakthrough Protocol - Cycle 019

Generated: 2026-06-17T10:18:55.092Z

Candidate: **Quadratic-twist CM family residual**

Decision: **QUADRATIC_TWIST_CM_FAMILY_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL**

Cycle 019 uses a nonconstant incomplete twist family, but the integer side is absorbed by controls and q-profile alignment fails.

## Promotion Gates

| gate | status | evidence |
| --- | --- | --- |
| Precise theorem-shaped statement | PASS | Candidate states V_S(K)=sum_D chi_K(D)a_K(E)/sqrt(\|K\|*good_D) for an incomplete quadratic-twist family of E:y^2=x^3-x. |
| Exact finite-field interpretation | PASS | F_q[t] side is exact: K=F_q[t]/P, with nonconstant low-degree twist polynomials D(t) and quadratic characters in the residue field. |
| Integer-prime holdout evidence | PASS | Integer side checks the preregistered ladder 1000000, 2000000, 4000000, 8000000 through N=8000000. |
| Local/null/random controls | FAIL | No matched profile survives: integerBeatsControls=false, signsAligned=false, profileSpread=192.683362. |
| Compression / low parameter count | PASS | Low-parameter object: one CM curve, one fixed twist-window rule, and one normalized family trace statistic. |
| Scale and field stability | FAIL | Scale gate requires complete ladders and matched integer/field profile. Integer ladder=true; field ladders=true; matchedProfile=false. |
| Novelty audit | FAIL | The mutation is genuine and nonconstant on the F_q[t] side, but the signal still factors through CM trace and quadratic-character windows; controls/profile gates fail. |
| Reproducible code, logs, plots | PASS | JSON/MD/SVG/script artifacts are present for the full 8M and q=3,5,7 run. |
| Plausible proof path | PASS | The CM trace formula is brute-validated and the quadratic-twist trace factorization is explicit. |
| Expert-ready evidence pack | FAIL | No expert-ready breakthrough pack exists because controls, scale stability, novelty, and matched-profile gates fail. |

## Quadratic-Twist CM Evidence

### Quadratic-Twist CM Diagnostics

| complete integer ladder | complete q ladders | validation passed | integer beats controls | signs aligned | profile spread | matched profile | max endpoint |z| |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| true | true | true | false | false | 192.683362 | false | 91.536493 |

### Theorem Shape

| part | statement |
| --- | --- |
| statistic | V_S(K)=sum_{D in S, D nonzero} chi_K(D)*a_K(E)/sqrt(\|K\|*good_D), E:y^2=x^3-x |
| Z | K=F_p with squarefree integer twists d in a low-conductor window |
| F_q[t] | K=F_q[t]/P with low-degree nonconstant polynomial twists D(t) |
| baseline | Quadratic-twist trace factorization gives exact values; promotion requires matched residual profile beyond integer controls. |

### Integer Ladder

| endpoint | labels | mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78497 | -0.000340 | -0.095205 | -0.097181 | 0.854839 |
| 2000000 | 148932 | -0.002107 | -0.813050 | -0.824910 | 0.854839 |
| 4000000 | 283145 | -0.000761 | -0.404821 | -0.408626 | 0.854839 |
| 8000000 | 539776 | -0.000647 | -0.475062 | -0.478405 | 0.854839 |

### Integer Controls

| control | final abs z range | max abs z range | energy z range |
| --- | ---: | ---: | ---: |
| shuffle | 0.475062..0.475062 | 1.662419..3.684981 | -0.478405..-0.478405 |
| signFlip | 0.005294..1.452551 | 1.393964..3.035414 | -0.029336..1.462774 |
| bootstrap | 0.238998..1.202246 | 1.475425..2.839584 | -1.208269..0.457296 |

### Field Endpoints

| q | endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | F_3:deg10 | 5880 | 9382 | -1.710842 | -91.536493 | -44.419777 | 91.536493 |
| 5 | F_5:deg7 | 11160 | 14569 | -0.059902 | 2.961279 | 3.589264 | 17.663333 |
| 7 | F_7:deg6 | 19544 | 23632 | -0.559153 | -69.320177 | -38.157491 | 69.348580 |

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

- **observedSignal**: Integer final z=-0.475062; max endpoint |z|=91.536493; profileSpread=192.683362; matchedProfile=false.
- **expectedNull**: A useful incomplete twist-family residual should survive integer controls and align in sign/scale across q=3,5,7 field profiles.
- **knownExplanation**: CM trace factorization and quadratic-character windows explain the observed profile behavior.
- **survivedControls**: 
- **failedControls**: Integer controls absorb the prime profile and q-field profiles do not align in sign/scale
- **whatFailed**: The object is a nonconstant CM-character calibration, not a breakthrough candidate.
- **suspectedInvariant**: CM factorization remains too rigid; useful algebraic-family transport likely requires non-CM monodromy or theorem-first nonzero residuals.
- **nextMutation**: Leave CM twist factorization; register non-CM monodromy or theorem-first incomplete-family residual

## Forced Representation Mutation

Mutation: **Leave CM twist factorization; register non-CM monodromy or theorem-first incomplete-family residual**

The nonconstant twist family avoids the constant-curve failure, but the profiles still factor through CM traces and quadratic-character windows and do not survive the strict matched-profile gates.

Preregistered next move:

- Do not promote CM twist-family character-window profiles as breakthrough structure.
- A next algebraic cycle must use non-CM monodromy, a non-isotrivial curve/family over F_q(t), or a theorem-first incomplete-family residual with a named nonzero baseline.
- Before data, preregister the theorem baseline, integer analogue, local/null controls, full ladders, novelty audit, proof path, and expert-pack criteria.
- If no such non-CM/non-isotrivial object is named, stop rather than adding another CM-character calibration.

## Artifact Inventory

- present: `logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-8000000.json`
- present: `logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-8000000.md`
- present: `logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-8000000.svg`
- present: `scripts/quadratic-twist-cm-family-audit.mjs`

