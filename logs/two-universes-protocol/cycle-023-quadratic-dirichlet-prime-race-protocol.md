# Two-Universes Breakthrough Protocol - Cycle 023

Generated: 2026-06-17T10:44:17.404Z

Candidate: **Quadratic Dirichlet prime race**

Decision: **QUADRATIC_DIRICHLET_PRIME_RACE_NO_PROMOTION_UNDER_STRICT_TWO_UNIVERSES_PROTOCOL**

Cycle 023 opens a new Dirichlet-character domain, but the character-race profile is absorbed by nearby-character/random controls and remains known calibration.

## Promotion Gates

| gate | status | evidence |
| --- | --- | --- |
| Precise theorem-shaped statement | PASS | Candidate states Z(X)=sum chi(P)/sqrt(labels) for a fixed quadratic Dirichlet character on rational primes and the matched polynomial Dirichlet character on F_q[t] irreducibles. |
| Exact finite-field interpretation | PASS | F_q[t] side is exact: chi(P) is the quadratic residue character modulo a fixed irreducible quadratic polynomial M_q(t), checked across q=3,5,7 degree ladders. |
| Integer-prime holdout evidence | PASS | Integer side checks the preregistered ladder 1000000, 2000000, 4000000, 8000000 through N=8000000. |
| Local/null/random controls | FAIL | No control-surviving matched profile: integerBeatsControls=false, signsAligned=true, profileSpread=2.209918. |
| Compression / low parameter count | PASS | Low-parameter object: one integer quadratic character, one fixed irreducible quadratic modulus per q, and one normalized cumulative character sum. |
| Scale and field stability | FAIL | Scale gate requires complete integer and field ladders plus a matched control-surviving profile. Integer ladder=true; field ladders=true; matchedProfile=false. |
| Novelty audit | FAIL | The object is a real new domain after the algebraic-family stop, but the observed small character-race sums are standard Dirichlet/PNT-in-progressions calibration and do not beat nearby-character controls. |
| Reproducible code, logs, plots | PASS | JSON/MD/SVG/script artifacts are present for the 8M quadratic Dirichlet race run. |
| Plausible proof path | PASS | The proof path is classical calibration: Dirichlet characters and prime number theorem in arithmetic progressions on Z, polynomial Dirichlet characters and prime polynomial theorem on F_q[t]. |
| Expert-ready evidence pack | FAIL | No expert-ready breakthrough pack exists because controls, novelty, and matched-profile gates fail; this is a calibration artifact. |

## Quadratic Dirichlet Evidence

### Quadratic Dirichlet Diagnostics

| complete integer ladder | complete q ladders | validation passed | integer beats controls | signs aligned | profile spread | matched profile | max endpoint |z| |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| true | true | true | false | true | 2.209918 | false | 0.429200 |

### Theorem Shape

| part | statement |
| --- | --- |
| statistic | Z(X)=sum chi(P)/sqrt(labels), with chi a fixed quadratic Dirichlet character |
| Z | P ranges over rational primes p<=N and chi(p)=(p/m) for fixed odd prime modulus m. |
| F_q[t] | P ranges over monic irreducibles in F_q[t] and chi(P) is the quadratic residue character modulo a fixed irreducible quadratic M_q(t). |
| baseline | Dirichlet prime number theorem / prime polynomial theorem in arithmetic progressions predicts cancellation; promotion requires a residual beyond nearby-character and random controls. |

### Integer Ladder

| endpoint | labels | sum chi | mean chi | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78497 | -77 | -0.000981 | -0.274830 | -0.274830 | 1.732051 |
| 2000000 | 148932 | -116 | -0.000779 | -0.300583 | -0.300583 | 1.732051 |
| 4000000 | 283145 | -81 | -0.000286 | -0.152223 | -0.152223 | 1.732051 |
| 8000000 | 539776 | -216 | -0.000400 | -0.294000 | -0.294000 | 1.732051 |

### Integer Controls

| control | final abs z range | max abs z range | energy z range |
| --- | ---: | ---: | ---: |
| localCharacters | 0.303528..0.464139 | 1.000000..1.632993 | -0.464139..-0.303528 |
| shuffle | 0.294000..0.294000 | 1.520567..3.441236 | -0.294000..-0.294000 |
| signFlip | 0.098000..1.546221 | 1.725402..3.656552 | -1.546221..1.301221 |
| bootstrap | 0.084389..0.691444 | 1.889822..3.295779 | -0.413777..0.691444 |

### Field Endpoints

| q | modulus | endpoint | labels | cumulative labels | degree sum chi | degree mean chi | z | energy z | max abs z |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | t^2 + 1 | F_3:deg12 | 44220 | 69705 | -60 | -0.001357 | -0.390126 | -0.390126 | 2.121320 |
| 5 | t^2 + 2 | F_5:deg8 | 48750 | 63318 | -78 | -0.001600 | -0.429200 | -0.429200 | 1.520572 |
| 7 | t^2 + 1 | F_7:deg7 | 117648 | 141279 | 0 | 0.000000 | -0.194216 | -0.194216 | 1.616448 |

### Character Validation

| side | item | ok |
| --- | --- | --- |
| Z | p=2, residue=2, chi=-1, Euler=4 | true |
| Z | p=3, residue=3, chi=-1, Euler=4 | true |
| Z | p=7, residue=2, chi=-1, Euler=4 | true |
| Z | p=11, residue=1, chi=1, Euler=1 | true |
| Z | p=13, residue=3, chi=-1, Euler=4 | true |
| Z | p=17, residue=2, chi=-1, Euler=4 | true |
| Z | p=19, residue=4, chi=1, Euler=1 | true |
| Z | p=23, residue=3, chi=-1, Euler=4 | true |
| F_3[t] | modulus=t^2 + 1, residue=1, chi=1, chi(square)=1 | true |
| F_3[t] | modulus=t^2 + 1, residue=2, chi=1, chi(square)=1 | true |
| F_5[t] | modulus=t^2 + 2, residue=1, chi=1, chi(square)=1 | true |
| F_5[t] | modulus=t^2 + 2, residue=2, chi=1, chi(square)=1 | true |
| F_7[t] | modulus=t^2 + 1, residue=1, chi=1, chi(square)=1 | true |
| F_7[t] | modulus=t^2 + 1, residue=2, chi=1, chi(square)=1 | true |

## Surprise Ledger

- **observedSignal**: Integer final z=-0.294000; max endpoint |z|=0.429200; profileSpread=2.209918; matchedProfile=false.
- **expectedNull**: A useful character-race residual should survive nearby-character, shuffle, bootstrap, and q=3,5,7 profile controls beyond Dirichlet/PNT calibration.
- **knownExplanation**: Quadratic character cancellation under Dirichlet/PNT-in-progressions and polynomial Dirichlet character sums explain the small observed profiles.
- **survivedControls**: 
- **failedControls**: Integer profile does not beat nearby-character/random controls despite full ladders and exact q-side character objects
- **whatFailed**: The object is a standard Dirichlet-character calibration, not a breakthrough candidate.
- **suspectedInvariant**: Single-character count imbalances are too classical; any continuation needs higher-order transition bias with a non-arbitrary F_q[t] analogue.
- **nextMutation**: Leave single-character prime races; require higher-order transition bias with canonical F_q[t] analogue or stop

## Forced Representation Mutation

Mutation: **Leave single-character prime races; require higher-order transition bias with canonical F_q[t] analogue or stop**

The quadratic character race has exact objects and full ladders, but the signal is small, control-absorbed, and explained by classical Dirichlet/PNT-in-progressions calibration.

Preregistered next move:

- Do not promote single Dirichlet-character prime races or residue-class count imbalances by themselves.
- A next character-race cycle must either name a higher-order transition/consecutive-bias statistic with a canonical order-free F_q[t] analogue, or stop this branch.
- Before data, register the finite-field theorem/null model, integer analogue, local character controls, holdout ladder, q-ladders, novelty audit, proof path, and expert-pack criteria.
- If the F_q[t] analogue depends on arbitrary lexicographic ordering, reject it before computation rather than reviving the cycle-001 ordering failure.

## Artifact Inventory

- present: `logs/two-universes-protocol/cycle-023-quadratic-dirichlet-prime-race-8000000.json`
- present: `logs/two-universes-protocol/cycle-023-quadratic-dirichlet-prime-race-8000000.md`
- present: `logs/two-universes-protocol/cycle-023-quadratic-dirichlet-prime-race-8000000.svg`
- present: `scripts/quadratic-dirichlet-prime-race-audit.mjs`

