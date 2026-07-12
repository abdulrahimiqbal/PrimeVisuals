# Non-CM Legendre family pilot audit

Candidate:
test a non-isotrivial Legendre family `E_lambda:y^2=x(x-1)(x-lambda)` over rational prime fields and residue fields `F_q[t]/P`.

The statistic is `V_S(K)=sum_{lambda in S} a_K(E_lambda)/sqrt(|K|*good_lambda)`. This is a real non-CM monodromy pilot, but it is not eligible for promotion unless the full 1M/2M/4M/8M integer ladder is run.

## Summary

- Required integer ladder 1M/2M/4M/8M present: false
- Required q=3,5,7 field ladders: true
- Point-count validation passed: true
- Integer beats controls: false
- Signs aligned: false
- Profile spread: 4.021001
- Matched profile: false
- Max endpoint |z|: 0.978550

## Integer Pilot Rows

Parameters: `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`

| endpoint | labels | mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| N<=1250 | 202 | 0.018487 | 0.262747 | 0.301695 | 0.917974 |
| N<=2500 | 365 | 0.045834 | 0.875653 | 0.976989 | 1.288341 |
| N<=5000 | 667 | 0.037890 | 0.978550 | 1.046938 | 1.288341 |

## Integer Controls

| control | final |z| range | max |z| range | energy z range |
| --- | ---: | ---: | ---: |
| shuffle | 0.978550..0.978550 | 1.332409..2.734159 | 1.046938..1.046938 |
| signFlip | 0.069152..1.322867 | 1.043400..1.849820 | -1.415319..0.598664 |
| bootstrap | 0.797942..3.639982 | 1.002460..3.639982 | -0.936431..3.643766 |

## F_3[t] Rows

Parameters: `t+0`, `t+1`, `t+2`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`, `t^2+1t+0`, `t^2+1t+1`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | 3 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_3:deg2 | 3 | 6 | -0.108301 | -0.132641 | -0.425881 | 0.356119 |
| F_3:deg3 | 8 | 14 | -0.136083 | -0.377791 | -0.541909 | 0.413654 |
| F_3:deg4 | 18 | 32 | 0.078567 | 0.000115 | 0.000138 | 0.667447 |
| F_3:deg5 | 48 | 80 | -0.045361 | -0.243360 | -0.262319 | 0.667447 |

## F_5[t] Rows

Parameters: `t+0`, `t+1`, `t+2`, `t+3`, `t+4`, `t^2+0t+0`, `t^2+0t+1`, `t^2+0t+2`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | 5 | -0.696656 | -1.557771 | -2.112050 | 1.557771 |
| F_5:deg2 | 10 | 15 | 0.288197 | -0.155258 | -0.162985 | 2.012596 |
| F_5:deg3 | 40 | 55 | -0.018974 | -0.183417 | -0.201483 | 2.012596 |
| F_5:deg4 | 150 | 205 | 0.080327 | 0.746541 | 0.805595 | 2.012596 |

## F_7[t] Rows

Parameters: `t+0`, `t+1`, `t+2`, `t+3`, `t+4`, `t+5`, `t+6`, `t^2+0t+0`

| endpoint | labels | cumulative labels | degree mean V | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | 7 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_7:deg2 | 21 | 28 | 0.365579 | 1.450847 | 1.220106 | 1.450847 |
| F_7:deg3 | 112 | 140 | 0.000000 | 0.648838 | 0.619924 | 2.296115 |

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

JSON: `logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-5000.json`
SVG: `logs/two-universes-protocol/cycle-020-noncm-legendre-family-pilot-5000.svg`
