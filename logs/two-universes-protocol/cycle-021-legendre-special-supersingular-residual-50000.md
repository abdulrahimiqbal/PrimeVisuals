# Legendre special supersingular residual audit

Candidate:
test the theorem-first supersingular special-automorphism loci inside the Legendre family `E_lambda:y^2=x(x-1)(x-lambda)`.

The statistic is `B(K)-3/2`, where `B(K)` counts Legendre parameters in the special `j=1728` and `j=0` orbits that are supersingular over the residue characteristic. This is computable by the Deuring/Hasse invariant theorem, not by point-counting.

## Theorem Baseline

- `j=1728` orbit: `lambda in {-1,2,1/2}`; supersingular iff the residue characteristic is `3 mod 4`.
- `j=0` orbit: `lambda^2-lambda+1=0`; supersingular iff the residue characteristic is `2 mod 3`, and the roots contribute only when they lie in the residue field.
- For rational primes `p>=5`, this collapses to `B(F_p)=3*1_{p=3 mod 4}`, so the integer signal is exactly a local mod-4 theorem control.

## Summary

- Complete integer ladder 1M/2M/4M/8M: false
- Required q=3,5,7 field ladders: true
- Deuring-polynomial validation passed: true
- Local mod-4 control explains integer signal exactly: true
- Integer beats controls: false
- Signs aligned: false
- Profile spread: 58.566970
- Matched profile: false
- Max endpoint |z|: 40.472213

## Integer Rows

| endpoint | labels | mean residual | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| N<=12500 | 1490 | 0.014094 | 0.544034 | 0.362689 | 1.500000 |
| N<=25000 | 2760 | 0.008696 | 0.456832 | 0.304555 | 1.500000 |
| N<=50000 | 5131 | 0.009647 | 0.691042 | 0.460694 | 1.500000 |

## Integer Controls

| control | final |z| range | max |z| range | energy z range |
| --- | ---: | ---: | ---: |
| localMod4 | 0.691042..0.691042 | 1.500000..1.500000 | 0.460694..0.460694 |
| shuffle | 0.691042..0.691042 | 1.950034..4.330127 | 0.460694..0.460694 |
| signFlip | 0.355991..2.156887 | 2.121320..3.421952 | -0.739903..1.437925 |
| bootstrap | 0.314110..2.659463 | 2.598076..4.036150 | -1.493767..1.772975 |

## F_3[t] Rows

| endpoint | labels | cumulative labels | B(K) | residual | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | 3 | 1 | -0.500000 | -0.866025 | -1.732051 | 0.866025 |
| F_3:deg2 | 3 | 6 | 1 | -0.500000 | -1.224745 | -2.449490 | 1.224745 |
| F_3:deg3 | 8 | 14 | 1 | -0.500000 | -1.870829 | -3.741657 | 1.870829 |
| F_3:deg4 | 18 | 32 | 1 | -0.500000 | -2.828427 | -5.656854 | 2.828427 |
| F_3:deg5 | 48 | 80 | 1 | -0.500000 | -4.472136 | -8.944272 | 4.472136 |
| F_3:deg6 | 116 | 196 | 1 | -0.500000 | -7.000000 | -14.000000 | 7.000000 |

## F_5[t] Rows

| endpoint | labels | cumulative labels | B(K) | residual | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | 5 | 0 | -1.500000 | -3.354102 | -2.236068 | 3.354102 |
| F_5:deg2 | 10 | 15 | 2 | 0.500000 | -0.645497 | -0.674200 | 3.354102 |
| F_5:deg3 | 40 | 55 | 0 | -1.500000 | -8.427498 | -6.136009 | 8.427498 |
| F_5:deg4 | 150 | 205 | 2 | 0.500000 | 0.873038 | 1.051758 | 8.427498 |
| F_5:deg5 | 624 | 829 | 0 | -1.500000 | -32.074481 | -23.492948 | 32.074481 |

## F_7[t] Rows

| endpoint | labels | cumulative labels | B(K) | residual | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | 7 | 3 | 1.500000 | 3.968627 | 2.645751 | 3.968627 |
| F_7:deg2 | 21 | 28 | 3 | 1.500000 | 7.937254 | 5.291503 | 7.937254 |
| F_7:deg3 | 112 | 140 | 3 | 1.500000 | 17.748239 | 11.832160 | 17.748239 |
| F_7:deg4 | 588 | 728 | 3 | 1.500000 | 40.472213 | 26.981475 | 40.472213 |

## Deuring Validation

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

## Novelty Audit

- This satisfies the theorem-first/non-point-counting constraint after the non-CM trace pilot.
- It is deliberately not promoted because the integer signal is exactly the known `p mod 4` supersingularity criterion for the `j=1728` CM orbit.
- A real continuation must leave special automorphism/CM loci and name a generic non-CM residual with a nonzero baseline.

JSON: `logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-50000.json`
SVG: `logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-50000.svg`
