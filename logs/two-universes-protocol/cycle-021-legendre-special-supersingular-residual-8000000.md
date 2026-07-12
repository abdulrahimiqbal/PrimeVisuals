# Legendre special supersingular residual audit

Candidate:
test the theorem-first supersingular special-automorphism loci inside the Legendre family `E_lambda:y^2=x(x-1)(x-lambda)`.

The statistic is `B(K)-3/2`, where `B(K)` counts Legendre parameters in the special `j=1728` and `j=0` orbits that are supersingular over the residue characteristic. This is computable by the Deuring/Hasse invariant theorem, not by point-counting.

## Theorem Baseline

- `j=1728` orbit: `lambda in {-1,2,1/2}`; supersingular iff the residue characteristic is `3 mod 4`.
- `j=0` orbit: `lambda^2-lambda+1=0`; supersingular iff the residue characteristic is `2 mod 3`, and the roots contribute only when they lie in the residue field.
- For rational primes `p>=5`, this collapses to `B(F_p)=3*1_{p=3 mod 4}`, so the integer signal is exactly a local mod-4 theorem control.

## Summary

- Complete integer ladder 1M/2M/4M/8M: true
- Required q=3,5,7 field ladders: true
- Deuring-polynomial validation passed: true
- Local mod-4 control explains integer signal exactly: true
- Integer beats controls: false
- Signs aligned: false
- Profile spread: 1074.517772
- Matched profile: false
- Max endpoint |z|: 563.808478

## Integer Rows

| endpoint | labels | mean residual | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| N<=1000000 | 78496 | 0.002790 | 0.781664 | 0.521110 | 1.500000 |
| N<=2000000 | 148931 | 0.000997 | 0.384799 | 0.256533 | 1.500000 |
| N<=4000000 | 283144 | 0.000742 | 0.394653 | 0.263102 | 1.500000 |
| N<=8000000 | 539775 | 0.000714 | 0.524708 | 0.349806 | 1.500000 |

## Integer Controls

| control | final |z| range | max |z| range | energy z range |
| --- | ---: | ---: | ---: |
| localMod4 | 0.524708..0.524708 | 1.500000..1.500000 | 0.349806..0.349806 |
| shuffle | 0.524708..0.524708 | 2.138882..3.534133 | 0.349806..0.349806 |
| signFlip | 0.210292..2.864459 | 2.261335..4.144809 | -1.670083..1.909639 |
| bootstrap | 0.067375..3.162542 | 2.806243..5.306957 | -2.108361..1.525806 |

## F_3[t] Rows

| endpoint | labels | cumulative labels | B(K) | residual | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | 3 | 1 | -0.500000 | -0.866025 | -1.732051 | 0.866025 |
| F_3:deg2 | 3 | 6 | 1 | -0.500000 | -1.224745 | -2.449490 | 1.224745 |
| F_3:deg3 | 8 | 14 | 1 | -0.500000 | -1.870829 | -3.741657 | 1.870829 |
| F_3:deg4 | 18 | 32 | 1 | -0.500000 | -2.828427 | -5.656854 | 2.828427 |
| F_3:deg5 | 48 | 80 | 1 | -0.500000 | -4.472136 | -8.944272 | 4.472136 |
| F_3:deg6 | 116 | 196 | 1 | -0.500000 | -7.000000 | -14.000000 | 7.000000 |
| F_3:deg7 | 312 | 508 | 1 | -0.500000 | -11.269428 | -22.538855 | 11.269428 |
| F_3:deg8 | 810 | 1318 | 1 | -0.500000 | -18.152135 | -36.304270 | 18.152135 |
| F_3:deg9 | 2184 | 3502 | 1 | -0.500000 | -29.588849 | -59.177699 | 29.588849 |
| F_3:deg10 | 5880 | 9382 | 1 | -0.500000 | -48.430362 | -96.860725 | 48.430362 |
| F_3:deg11 | 16104 | 25486 | 1 | -0.500000 | -79.821676 | -159.643353 | 79.821676 |
| F_3:deg12 | 44220 | 69706 | 1 | -0.500000 | -132.009469 | -264.018939 | 132.009469 |

## F_5[t] Rows

| endpoint | labels | cumulative labels | B(K) | residual | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | 5 | 0 | -1.500000 | -3.354102 | -2.236068 | 3.354102 |
| F_5:deg2 | 10 | 15 | 2 | 0.500000 | -0.645497 | -0.674200 | 3.354102 |
| F_5:deg3 | 40 | 55 | 0 | -1.500000 | -8.427498 | -6.136009 | 8.427498 |
| F_5:deg4 | 150 | 205 | 2 | 0.500000 | 0.873038 | 1.051758 | 8.427498 |
| F_5:deg5 | 624 | 829 | 0 | -1.500000 | -32.074481 | -23.492948 | 32.074481 |
| F_5:deg6 | 2580 | 3409 | 2 | 0.500000 | 6.277121 | 7.831179 | 32.074481 |
| F_5:deg7 | 11160 | 14569 | 0 | -1.500000 | -135.652141 | -99.096476 | 135.652141 |
| F_5:deg8 | 48750 | 63319 | 2 | 0.500000 | 31.798335 | 40.266160 | 135.652141 |

## F_7[t] Rows

| endpoint | labels | cumulative labels | B(K) | residual | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | 7 | 3 | 1.500000 | 3.968627 | 2.645751 | 3.968627 |
| F_7:deg2 | 21 | 28 | 3 | 1.500000 | 7.937254 | 5.291503 | 7.937254 |
| F_7:deg3 | 112 | 140 | 3 | 1.500000 | 17.748239 | 11.832160 | 17.748239 |
| F_7:deg4 | 588 | 728 | 3 | 1.500000 | 40.472213 | 26.981475 | 40.472213 |
| F_7:deg5 | 3360 | 4088 | 3 | 1.500000 | 95.906204 | 63.937469 | 95.906204 |
| F_7:deg6 | 19544 | 23632 | 3 | 1.500000 | 230.590546 | 153.727031 | 230.590546 |
| F_7:deg7 | 117648 | 141280 | 3 | 1.500000 | 563.808478 | 375.872319 | 563.808478 |

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

JSON: `logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-8000000.json`
SVG: `logs/two-universes-protocol/cycle-021-legendre-special-supersingular-residual-8000000.svg`
