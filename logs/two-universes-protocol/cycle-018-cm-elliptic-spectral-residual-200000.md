# CM elliptic spectral residual audit

Candidate:
test the fixed CM elliptic curve `E: y^2=x^3-x` using the spectral statistic `u2(K)=a_K(E)^2/|K|-1`.

Integer side: rational primes `p`. Function-field side: residue fields `F_q[t]/P`; since the curve is constant, `a_{q^d}` depends only on `q` and `deg(P)`.

## Summary

- Complete integer ladder 1M/2M/4M/8M: false
- Required q=3,5,7 field ladders: true
- Trace formula validation passed: true
- Integer beats order/null controls: false
- Field signs aligned with integer endpoint: false
- Field/integer endpoint z spread: 204.489318
- Matched profile: false
- Max endpoint |z|: 123.235020

## Integer Rows

| endpoint | labels | mean u2 | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| N<=200000 | 17983 | -0.004494 | -0.602648 | -0.427086 | 1.607453 |

## Integer Control Summary

| control | final |z| range | max |z| range | energy z range |
| --- | ---: | ---: | ---: |
| shuffle | 0.602648..0.602648 | 2.267699..4.084251 | -0.427086..-0.427086 |
| signFlip | 0.311717..1.411862 | 1.920330..4.051351 | -0.856161..1.000562 |
| bootstrap | 0.150531..2.336709 | 2.378898..4.212005 | -1.668294..0.449715 |

## F_3[t] Rows

| endpoint | cumulative labels | u2 | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | -1.000000 | -1.732051 | -1.732051 | 1.732051 |
| F_3:deg2 | 6 | 3.000000 | 2.449490 | 1.095445 | 2.449490 |
| F_3:deg3 | 14 | -1.000000 | -0.534522 | -0.324443 | 2.449490 |
| F_3:deg4 | 32 | 3.000000 | 9.192388 | 3.676955 | 9.192388 |
| F_3:deg5 | 80 | -1.000000 | 0.447214 | 0.254000 | 9.192388 |
| F_3:deg6 | 196 | 3.000000 | 25.142857 | 9.792902 | 25.142857 |
| F_3:deg7 | 508 | -1.000000 | 1.774713 | 0.998752 | 25.142857 |
| F_3:deg8 | 1318 | 3.000000 | 68.036075 | 26.190777 | 68.036075 |

## F_5[t] Rows

| endpoint | cumulative labels | u2 | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | -0.200000 | -0.447214 | -2.236068 | 0.447214 |
| F_5:deg2 | 15 | 0.440000 | 0.877876 | 2.326367 | 0.877876 |
| F_5:deg3 | 55 | 2.872000 | 15.948872 | 6.490761 | 15.948872 |
| F_5:deg4 | 205 | -0.686400 | 1.069995 | 0.763387 | 15.948872 |
| F_5:deg5 | 829 | 1.151680 | 25.491773 | 20.924489 | 25.491773 |
| F_5:deg6 | 3409 | 2.504384 | 123.235020 | 54.528471 | 123.235020 |

## F_7[t] Rows

| endpoint | cumulative labels | u2 | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | -1.000000 | -2.645751 | -2.645751 | 2.645751 |
| F_7:deg2 | 28 | 3.000000 | 10.583005 | 4.000000 | 10.583005 |
| F_7:deg3 | 140 | -1.000000 | -4.732864 | -3.190896 | 10.583005 |
| F_7:deg4 | 728 | 3.000000 | 63.302692 | 22.824110 | 63.302692 |
| F_7:deg5 | 4088 | -1.000000 | -25.837745 | -17.452435 | 63.302692 |

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

- This breaks the complete-family orthogonality pattern by using one fixed CM curve.
- It is not promoted if the integer order is absorbed by controls or if the field profiles do not match the integer profile.
- Constant-curve residue fields are degree-rigid; a stronger next step would need nonconstant monodromy over `F_q(t)` or an incomplete family with a theorem-normalized nonzero residual.

JSON: `logs/two-universes-protocol/cycle-018-cm-elliptic-spectral-residual-200000.json`
SVG: `logs/two-universes-protocol/cycle-018-cm-elliptic-spectral-residual-200000.svg`
