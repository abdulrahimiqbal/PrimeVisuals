# Quadratic-twist CM family audit

Candidate:
test an incomplete quadratic-twist family of the CM curve `E:y^2=x^3-x`.

Integer side: squarefree twists `d` in a fixed low-conductor window. Function-field side: polynomial twists `D(t)` in a fixed low-degree window. Statistic:

`V_S(K)=sum_{D in S, D!=0 mod K} chi_K(D) * a_K(E) / sqrt(|K| * good_D)`.

This breaks complete-family orthogonality and avoids constant-curve degree-only profiles by using nonconstant twist polynomials on the `F_q[t]` side.

## Summary

- Complete integer ladder 1M/2M/4M/8M: true
- Required q=3,5,7 field ladders: true
- Trace formula validation passed: true
- Integer beats controls: false
- Signs aligned: false
- Profile spread: 192.683362
- Matched profile: false
- Max endpoint |z|: 91.536493

## Integer Rows

Twists: `1`, `2`, `3`, `5`, `6`, `7`, `10`, `11`, `13`, `14`, `15`, `17`

| endpoint | labels | mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| N<=1000000 | 78497 | -0.000340 | -0.095205 | -0.097181 | 0.854839 |
| N<=2000000 | 148932 | -0.002107 | -0.813050 | -0.824910 | 0.854839 |
| N<=4000000 | 283145 | -0.000761 | -0.404821 | -0.408626 | 0.854839 |
| N<=8000000 | 539776 | -0.000647 | -0.475062 | -0.478405 | 0.854839 |

## Integer Controls

| control | final |z| range | max |z| range | energy z range |
| --- | ---: | ---: | ---: |
| shuffle | 0.475062..0.475062 | 1.662419..3.684981 | -0.478405..-0.478405 |
| signFlip | 0.005294..1.452551 | 1.393964..3.035414 | -0.029336..1.462774 |
| bootstrap | 0.238998..1.202246 | 1.475425..2.839584 | -1.208269..0.457296 |

## F_3[t] Rows

Twists: `t+0`, `t+1`, `t+2`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`, `t^2+1t+0`, `t^2+1t+1`, `t^2+1t+2`, `t^2+2t+0`, `t^2+2t+1`, `t^2+2t+2`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | 3 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_3:deg2 | 3 | 6 | 0.603023 | 0.738549 | 1.732051 | 0.738549 |
| F_3:deg3 | 8 | 14 | 0.000000 | 0.483494 | 1.732051 | 0.738549 |
| F_3:deg4 | 18 | 32 | 1.154701 | 3.994036 | 4.510542 | 3.994036 |
| F_3:deg5 | 48 | 80 | 0.000000 | 2.526050 | 4.510542 | 3.994036 |
| F_3:deg6 | 116 | 196 | -1.552873 | -11.252829 | -6.698715 | 11.252829 |
| F_3:deg7 | 312 | 508 | 0.000000 | -6.989690 | -6.698715 | 11.252829 |
| F_3:deg8 | 810 | 1318 | 1.667901 | 32.873820 | 17.224154 | 32.923818 |
| F_3:deg9 | 2184 | 3502 | 0.000000 | 20.167395 | 17.224154 | 32.923818 |
| F_3:deg10 | 5880 | 9382 | -1.710842 | -91.536493 | -44.419777 | 91.536493 |

## F_5[t] Rows

Twists: `t+0`, `t+1`, `t+2`, `t+3`, `t+4`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`, `t^2+0t+3`, `t^2+0t+4`, `t^2+1t+0`, `t^2+1t+1`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | 5 | 0.107017 | 0.239298 | 0.591706 | 0.421637 |
| F_5:deg2 | 10 | 15 | 0.514994 | 1.467868 | 1.848579 | 1.467868 |
| F_5:deg3 | 40 | 55 | 0.568038 | 3.830336 | 2.508856 | 3.830336 |
| F_5:deg4 | 150 | 205 | -0.090529 | 1.035580 | 1.184732 | 3.830336 |
| F_5:deg5 | 624 | 829 | -0.423446 | -8.662130 | -6.356526 | 8.717874 |
| F_5:deg6 | 2580 | 3409 | 0.494319 | 17.571493 | 10.561569 | 17.663333 |
| F_5:deg7 | 11160 | 14569 | -0.059902 | 2.961279 | 3.589264 | 17.663333 |

## F_7[t] Rows

Twists: `t+0`, `t+1`, `t+2`, `t+3`, `t+4`, `t+5`, `t+6`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`, `t^2+0t+3`, `t^2+0t+4`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | 7 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_7:deg2 | 21 | 28 | 0.401391 | 1.592969 | 1.510243 | 1.716233 |
| F_7:deg3 | 112 | 140 | 0.000000 | 0.712398 | 1.510243 | 1.716233 |
| F_7:deg4 | 588 | 728 | 0.447741 | 10.069906 | 6.308141 | 10.096695 |
| F_7:deg5 | 3360 | 4088 | 0.000000 | 4.249479 | 6.308141 | 10.096695 |
| F_7:deg6 | 19544 | 23632 | -0.559153 | -69.320177 | -38.157491 | 69.348580 |

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

JSON: `logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-8000000.json`
SVG: `logs/two-universes-protocol/cycle-019-quadratic-twist-cm-family-8000000.svg`
