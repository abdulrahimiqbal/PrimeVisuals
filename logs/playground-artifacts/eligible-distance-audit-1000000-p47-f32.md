# local eligible distance-transport residual audit

Candidate:
within each local eligible window, compare the sorted pair-distance
distribution of prime offsets to leave-one per-rank centers of five exact
eligible/count shuffled controls by a Wasserstein-1-style mean absolute
transport distance.

Integer windows: length `210`, reduced offsets `48`,
small-prime cutoff `47`, active primes
`11,13,17,19,23,29,31,37,41,43,47`.

Integer metric: `Z/210Z circular`.
Field metrics: `F_2^5 degree ultrametric`, `F_3^3 degree ultrametric`.

Residual aggregate: `sum((observed distance excess) - (mean fake distance
excess)) / sqrt(windows)`.

## Integer fresh blocks

| block | windows | real excess | fake excess | mean residual | aggregate residual | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100000..200000 | 475 | 0.002079 | 0.001990 | 0.000089 | 0.001946 | 0.007144 |
| 125000..250000 | 594 | 0.001823 | 0.002133 | -0.000310 | -0.007545 | -0.010432 |
| 250000..500000 | 1189 | 0.002473 | 0.002318 | 0.000155 | 0.005329 | -0.003220 |
| 500000..1000000 | 2380 | 0.002576 | 0.002492 | 0.000084 | 0.004115 | 0.000787 |

Endpoint leave-one local-shuffle fake controls:
`-0.006274 .. 0.006905`.

## F_2[t] degree path

Factor degree cutoff: `3`; additive window: `F_2^5`.

| degree | windows | real excess | fake excess | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 710 | 0.042987 | 0.046229 | -0.003242 | -0.086380 | 0.040631 |
| 16 | 1333 | 0.048445 | 0.048889 | -0.000444 | -0.016205 | 0.195128 |
| 17 | 2496 | 0.048596 | 0.049658 | -0.001062 | -0.053076 | 0.015754 |
| 18 | 4706 | 0.049355 | 0.050396 | -0.001041 | -0.071428 | -0.095427 |

Endpoint leave-one local-shuffle fake controls:
`-0.188980 .. 0.188547`.

## F_3[t] degree path

Factor degree cutoff: `2`; additive window: `F_3^3`.

| degree | windows | real excess | fake excess | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 219 | 0.015628 | 0.031410 | -0.015782 | -0.233555 | -0.178227 |
| 9 | 605 | 0.043415 | 0.032467 | 0.010948 | 0.269292 | 0.289613 |
| 10 | 1830 | 0.041396 | 0.037354 | 0.004042 | 0.172915 | 0.046567 |
| 11 | 5052 | 0.042458 | 0.041037 | 0.001421 | 0.100985 | 0.146911 |

Endpoint leave-one local-shuffle fake controls:
`-0.216411 .. 0.221117`.

## Dominant classes

Z endpoint:
`k9/e23:n2:mean0.03552:A0.050, k8/e29:n1:mean-0.03963:A-0.040, k11/e32:n1:mean0.02842:A0.028, k11/e30:n10:mean0.00564:A0.018, k13/e30:n35:mean0.00278:A0.016, k11/e26:n12:mean0.00468:A0.016, k9/e27:n7:mean0.00554:A0.015, k15/e30:n60:mean0.00181:A0.014, k9/e30:n3:mean-0.00717:A-0.012, k8/e25:n2:mean-0.00864:A-0.012, k12/e24:n4:mean0.00600:A0.012, k13/e25:n7:mean-0.00453:A-0.012`

F_2[t] endpoint:
`k2/e4:n1345:mean-0.00675:A-0.247, k2/e5:n1415:mean0.00429:A0.161, k2/e6:n170:mean-0.01147:A-0.150, k3/e4:n499:mean-0.00574:A-0.128, k3/e6:n116:mean0.01106:A0.119, k3/e5:n810:mean0.00235:A0.067, k4/e5:n255:mean-0.00105:A-0.017, k4/e6:n76:mean-0.00000:A-0.000, k5/e6:n20:mean0.00000:A0.000`

F_3[t] endpoint:
`k2/e6:n807:mean0.02610:A0.742, k2/e4:n189:mean-0.04303:A-0.592, k2/e7:n252:mean-0.02937:A-0.466, k2/e8:n15:mean-0.08296:A-0.321, k3/e5:n564:mean0.01173:A0.279, k3/e7:n264:mean-0.01712:A-0.278, k4/e6:n504:mean0.00406:A0.091, k4/e5:n234:mean-0.00576:A-0.088, k4/e7:n180:mean0.00654:A0.088, k3/e6:n822:mean0.00270:A0.078, k4/e8:n45:mean-0.01103:A-0.074, k2/e5:n852:mean-0.00216:A-0.063`

## Strongest windows

Z:
`603960:k9:e23:r0.07437:D0.0882, 514920:k8:e29:r-0.03963:D0.0233, 673680:k10:e25:r0.03884:D0.0633, 663390:k18:e31:r0.03779:D0.0447, 517650:k10:e28:r0.03763:D0.0561, 860160:k14:e28:r0.03740:D0.0474, 695940:k12:e28:r0.03709:D0.0454, 685860:k16:e28:r0.03648:D0.0448`

F_2[t]:
`18:587:k2:e4:r0.75000:D0.7500, 18:704:k2:e5:r0.75000:D0.7500, 18:1299:k2:e4:r0.75000:D0.7500, 18:1393:k2:e5:r0.75000:D0.7500, 18:1472:k2:e5:r0.75000:D0.7500, 18:1622:k2:e5:r0.75000:D0.7500, 18:1890:k2:e5:r0.75000:D0.7500, 18:1978:k2:e4:r0.75000:D0.7500`

F_3[t]:
`11:182:k2:e6:r0.88889:D0.8889, 11:748:k2:e6:r0.88889:D0.8889, 11:1261:k2:e5:r0.88889:D0.8889, 11:1530:k2:e6:r0.88889:D0.8889, 11:1722:k2:e5:r0.88889:D0.8889, 11:1968:k2:e5:r0.88889:D0.8889, 11:2125:k2:e6:r0.88889:D0.8889, 11:2211:k2:e6:r0.88889:D0.8889`

SVG: `logs/playground-artifacts/eligible-distance-audit-1000000-p47-f32.svg`
JSON: `logs/playground-artifacts/eligible-distance-audit-1000000-p47-f32.json`
