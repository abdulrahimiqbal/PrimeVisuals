# Quadratic-twist CM family audit

Candidate:
test an incomplete quadratic-twist family of the CM curve `E:y^2=x^3-x`.

Integer side: squarefree twists `d` in a fixed low-conductor window. Function-field side: polynomial twists `D(t)` in a fixed low-degree window. Statistic:

`V_S(K)=sum_{D in S, D!=0 mod K} chi_K(D) * a_K(E) / sqrt(|K| * good_D)`.

This breaks complete-family orthogonality and avoids constant-curve degree-only profiles by using nonconstant twist polynomials on the `F_q[t]` side.

## Summary

- Complete integer ladder 1M/2M/4M/8M: false
- Required q=3,5,7 field ladders: true
- Trace formula validation passed: true
- Integer beats controls: false
- Signs aligned: false
- Profile spread: 34.212773
- Matched profile: false
- Max endpoint |z|: 13.208389

## Integer Rows

Twists: `1`, `2`, `3`, `5`, `6`, `7`, `10`, `11`

| endpoint | labels | mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| N<=200000 | 17983 | -0.002879 | -0.386066 | -0.398102 | 1.117526 |

## Integer Controls

| control | final |z| range | max |z| range | energy z range |
| --- | ---: | ---: | ---: |
| shuffle | 0.386066..0.386066 | 1.403661..4.211398 | -0.398102..-0.398102 |
| signFlip | 0.122885..0.796401 | 1.156114..2.791151 | -0.807745..0.821229 |
| bootstrap | 0.029832..2.161399 | 1.988539..2.985709 | -2.181108..1.183045 |

## F_3[t] Rows

Twists: `t+0`, `t+1`, `t+2`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`, `t^2+1t+0`, `t^2+1t+1`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | 3 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_3:deg2 | 3 | 6 | 0.219428 | 0.268744 | 0.410513 | 0.377964 |
| F_3:deg3 | 8 | 14 | 0.000000 | 0.175934 | 0.410513 | 0.377964 |
| F_3:deg4 | 18 | 32 | 0.942809 | 3.116369 | 2.998232 | 3.166234 |
| F_3:deg5 | 48 | 80 | 0.000000 | 1.970965 | 2.998232 | 3.166234 |
| F_3:deg6 | 116 | 196 | -1.267916 | -9.246383 | -5.706595 | 9.246383 |

## F_5[t] Rows

Twists: `t+0`, `t+1`, `t+2`, `t+3`, `t+4`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | 5 | -0.156894 | -0.350826 | -0.689289 | 0.561266 |
| F_5:deg2 | 10 | 15 | 0.209203 | 0.337610 | 0.578942 | 0.788644 |
| F_5:deg3 | 40 | 55 | 0.695701 | 3.928644 | 2.565197 | 3.928644 |
| F_5:deg4 | 150 | 205 | -0.142553 | 0.541471 | 0.606889 | 3.946323 |
| F_5:deg5 | 624 | 829 | -0.518614 | -10.970346 | -8.025835 | 10.990250 |

## F_7[t] Rows

Twists: `t+0`, `t+1`, `t+2`, `t+3`, `t+4`, `t+5`, `t+6`, `t^2+0t+0`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | 7 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_7:deg2 | 21 | 28 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_7:deg3 | 112 | 140 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_7:deg4 | 588 | 728 | 0.606092 | 13.208389 | 7.937254 | 13.256508 |

## Trace Validation

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

## Novelty Audit

- This is a real mutation from cycle 018: the `F_q[t]` side uses nonconstant quadratic twists, not a constant curve.
- It is not promoted unless the integer profile survives controls and the q=3,5,7 field profiles match in sign and scale.
- If this fails, the next step must leave CM twist factorization and use non-CM monodromy or a theorem-first incomplete-family residual.

JSON: `logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-200000.json`
SVG: `logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-200000.svg`
