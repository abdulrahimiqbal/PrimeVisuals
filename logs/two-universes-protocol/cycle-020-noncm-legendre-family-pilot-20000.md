# Non-CM Legendre family pilot audit

Candidate:
test a non-isotrivial Legendre family `E_lambda:y^2=x(x-1)(x-lambda)` over rational prime fields and residue fields `F_q[t]/P`.

The statistic is `V_S(K)=sum_{lambda in S} a_K(E_lambda)/sqrt(|K|*good_lambda)`. This is a real non-CM monodromy pilot, but it is not eligible for promotion unless the full 1M/2M/4M/8M integer ladder is run.

## Summary

- Required integer ladder 1M/2M/4M/8M present: false
- Required q=3,5,7 field ladders: true
- Point-count validation passed: true
- Integer beats controls: false
- Signs aligned: true
- Profile spread: 6.427625
- Matched profile: false
- Max endpoint |z|: 1.126554

## Integer Pilot Rows

Parameters: `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`

| endpoint | labels | mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| N<=5000 | 667 | 0.017762 | 0.458727 | 0.490096 | 1.058777 |
| N<=10000 | 1227 | 0.012503 | 0.437961 | 0.455010 | 1.058777 |
| N<=20000 | 2260 | 0.016063 | 0.763627 | 0.786265 | 1.202139 |

## Integer Controls

| control | final |z| range | max |z| range | energy z range |
| --- | ---: | ---: | ---: |
| shuffle | 0.763627..0.763627 | 1.272498..3.316071 | 0.786265..0.786265 |
| signFlip | 0.164474..1.428257 | 1.238744..2.015646 | -1.470598..0.946104 |
| bootstrap | 0.172818..3.424116 | 1.812003..3.582680 | 0.175109..3.558179 |

## F_3[t] Rows

Parameters: `t+0`, `t+1`, `t+2`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`, `t^2+1t+0`, `t^2+1t+1`, `t^2+1t+2`, `t^2+2t+0`, `t^2+2t+1`, `t^2+2t+2`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | 3 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_3:deg2 | 3 | 6 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_3:deg3 | 8 | 14 | -0.166667 | -0.356348 | -0.462910 | 0.942809 |
| F_3:deg4 | 18 | 32 | 0.064150 | -0.031578 | -0.037768 | 0.942809 |
| F_3:deg5 | 48 | 80 | -0.055556 | -0.318114 | -0.354434 | 0.942809 |
| F_3:deg6 | 116 | 196 | 0.108391 | 0.694865 | 0.780025 | 0.942809 |
| F_3:deg7 | 312 | 508 | -0.018519 | 0.175267 | 0.175048 | 1.028500 |

## F_5[t] Rows

Parameters: `t+0`, `t+1`, `t+2`, `t+3`, `t+4`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`, `t^2+0t+3`, `t^2+0t+4`, `t^2+1t+0`, `t^2+1t+1`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | 5 | -0.747938 | -1.672440 | -2.197827 | 1.672440 |
| F_5:deg2 | 10 | 15 | 0.182861 | -0.493438 | -0.605829 | 2.063712 |
| F_5:deg3 | 40 | 55 | -0.005164 | -0.285542 | -0.341217 | 2.063712 |
| F_5:deg4 | 150 | 205 | 0.071745 | 0.603735 | 0.658018 | 2.063712 |
| F_5:deg5 | 624 | 829 | 0.011784 | 0.555622 | 0.552367 | 2.063712 |

## F_7[t] Rows

Parameters: `t+0`, `t+1`, `t+2`, `t+3`, `t+4`, `t+5`, `t+6`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`, `t^2+0t+3`, `t^2+0t+4`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | 7 | -0.076360 | -0.202031 | -0.577350 | 0.534522 |
| F_7:deg2 | 21 | 28 | 0.266984 | 0.958545 | 0.785807 | 1.454880 |
| F_7:deg3 | 112 | 140 | -0.016700 | 0.270593 | 0.257354 | 1.454880 |
| F_7:deg4 | 588 | 728 | 0.046249 | 1.126554 | 1.227354 | 1.468925 |

## Point-Count Validation

| p | lambda | trace | point count | ok |
| ---: | ---: | ---: | ---: | --- |
| 5 | 2 | -2 | 8 | true |
| 7 | 2 | 0 | 8 | true |
| 11 | 2 | 0 | 12 | true |
| 13 | 2 | 6 | 8 | true |
| 17 | 2 | 2 | 16 | true |
| 19 | 2 | 0 | 20 | true |

## Novelty Audit

- This is the first non-CM, non-isotrivial algebraic-family pilot in the strict loop.
- It is deliberately not promoted because the current implementation is a pilot and lacks the full 8M integer ladder.
- A real promotion attempt needs a faster trace engine or a theorem-first residual that avoids brute point counting on rational primes.

JSON: `logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-20000.json`
SVG: `logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-20000.svg`
