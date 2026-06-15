# unlabeled prime-pair difference roughness audit

Candidate:
sample unordered prime/irreducible pairs, reduce their difference to an
unlabeled roughness feature omega(diff), bucket by difference size/degree,
and aggregate z-scores against random odd/monic pair backgrounds.

## Integer side

Abs aggregate theta: `0.490107`; rmsZ
theta: `0.000279`.

| N | labels | pair samples | real aggregateZ | real absAggregateZ | real rmsZ | real mean omega | Cramer abs range | odd-random abs range | odd-composite abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17983 | 26976 | 39.596730 | 39.596730 | 1.045597 | 2.831851 | 24.584830..27.776807 | 0.330833..2.225774 | 0.621423..3.470343 |
| 250000 | 22043 | 33066 | 43.028511 | 43.028511 | 1.043864 | 2.852568 | 26.578666..29.843990 | 0.004246..0.950959 | 1.743812..3.968496 |
| 500000 | 41537 | 62307 | 59.602192 | 59.602192 | 1.050096 | 2.925450 | 36.648465..38.538410 | 0.682527..2.973577 | 1.180653..3.397554 |
| 1000000 | 78497 | 117747 | 82.488935 | 82.488935 | 1.046639 | 2.987057 | 50.604173..53.585396 | 0.080471..0.971352 | 1.150040..4.306159 |
| 2000000 | 148932 | 120000 | 80.201503 | 80.201503 | 1.043668 | 3.040942 | 49.561069..52.781046 | 0.147847..1.237684 | 0.807413..3.077372 |

Endpoint top buckets:
- 19: n=37675, aggregateZ=43.960626, meanZ=0.226484
- 20: n=27961, aggregateZ=37.826001, meanZ=0.226211
- 18: n=25310, aggregateZ=37.335811, meanZ=0.234682
- 17: n=13950, aggregateZ=28.542438, meanZ=0.241660
- 16: n=7386, aggregateZ=19.378083, meanZ=0.225479
- 15: n=3903, aggregateZ=15.183319, meanZ=0.243034
- 14: n=1942, aggregateZ=11.202276, meanZ=0.254204
- 13: n=927, aggregateZ=6.558330, meanZ=0.215404

## Function fields

F_2[t]

| degree | labels | samples | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 14 | 1161 | 10000 | 105.540675 | 105.540675 | 1.266429 | 0.004605..1.864664 | 0.050457..1.882519 |
| 15 | 2182 | 10000 | 103.789330 | 103.789330 | 1.256273 | 0.213266..1.417069 | 0.558794..1.446767 |
| 16 | 4080 | 10000 | 103.066231 | 103.066231 | 1.261496 | 0.050118..1.544205 | 0.593041..2.206166 |
| 17 | 7710 | 15420 | 127.011892 | 127.011892 | 1.256972 | 0.083631..0.877691 | 0.118802..1.546703 |

Endpoint F_2[t] top buckets:
- 16: n=7583, aggregateZ=86.662335, meanZ=0.995199
- 15: n=3932, aggregateZ=64.127348, meanZ=1.022672
- 14: n=1925, aggregateZ=47.398126, meanZ=1.080304
- 13: n=1008, aggregateZ=33.708469, meanZ=1.061717
- 12: n=488, aggregateZ=24.251889, meanZ=1.097831
- 11: n=239, aggregateZ=17.258889, meanZ=1.116385
- 10: n=139, aggregateZ=12.090312, meanZ=1.025487
- 9: n=51, aggregateZ=7.194443, meanZ=1.007424


F_3[t]

| degree | labels | samples | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 312 | 10000 | 49.855577 | 49.855577 | 1.134133 | 0.278652..1.802860 | 0.334648..1.787831 |
| 8 | 810 | 10000 | 51.805554 | 51.805554 | 1.147941 | 0.946676..3.072596 | 0.068908..2.298130 |
| 9 | 2184 | 10000 | 51.238928 | 51.238928 | 1.132886 | 0.130129..1.559047 | 0.149789..1.020908 |
| 10 | 5880 | 11760 | 54.246846 | 54.246846 | 1.136547 | 0.200179..0.949801 | 0.358907..1.821853 |

Endpoint F_3[t] top buckets:
- 9: n=7857, aggregateZ=44.695396, meanZ=0.504237
- 8: n=2575, aggregateZ=23.901033, meanZ=0.471008
- 7: n=872, aggregateZ=15.632734, meanZ=0.529391
- 6: n=297, aggregateZ=8.661261, meanZ=0.502577
- 5: n=110, aggregateZ=6.077247, meanZ=0.579443
- 3: n=11, aggregateZ=3.719897, meanZ=1.121591
- 4: n=33, aggregateZ=3.056382, meanZ=0.532048
- 2: n=3, aggregateZ=2.054805, meanZ=1.186342

SVG: `logs/playground-artifacts/pair-difference-roughness-audit-2000000.svg`
JSON: `logs/playground-artifacts/pair-difference-roughness-audit-2000000.json`
