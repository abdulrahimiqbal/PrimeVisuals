# local eligible distance-transport residual audit

Candidate:
within each local eligible window, compare the sorted pair-distance
distribution of prime offsets to leave-one per-rank centers of five exact
eligible/count shuffled controls by a Wasserstein-1-style mean absolute
transport distance.

Integer windows: length `210`, reduced offsets `48`,
small-prime cutoff `97`, active primes
`11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97`.

Integer metric: `Z/210Z circular`.
Field metrics: `F_2^5 degree ultrametric`, `F_3^3 degree ultrametric`.

Residual aggregate: `sum((observed distance excess) - (mean fake distance
excess)) / sqrt(windows)`.

## Integer fresh blocks

| block | windows | real excess | fake excess | mean residual | aggregate residual | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 4761 | 0.002778 | 0.002643 | 0.000134 | 0.009264 | 0.005322 |
| 2000000..4000000 | 9523 | 0.003038 | 0.002878 | 0.000159 | 0.015539 | 0.002561 |
| 4000000..8000000 | 19047 | 0.003057 | 0.003096 | -0.000039 | -0.005415 | -0.006475 |
| 8000000..16000000 | 38094 | 0.003413 | 0.003311 | 0.000102 | 0.019934 | 0.009586 |

Endpoint leave-one local-shuffle fake controls:
`-0.012163 .. 0.008566`.

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
`k3/e24:n1:mean0.18730:A0.187, k3/e19:n1:mean0.16667:A0.167, k2/e17:n1:mean0.11810:A0.118, k3/e25:n1:mean0.05746:A0.057, k4/e20:n3:mean0.03011:A0.052, k5/e22:n16:mean0.01255:A0.050, k4/e21:n1:mean-0.04683:A-0.047, k5/e21:n13:mean0.01243:A0.045, k4/e23:n1:mean0.03810:A0.038, k7/e17:n3:mean0.02165:A0.037, k5/e27:n1:mean0.03724:A0.037, k5/e17:n2:mean0.02429:A0.034`

F_2[t] endpoint:
`k2/e4:n1345:mean-0.00675:A-0.247, k2/e5:n1415:mean0.00429:A0.161, k2/e6:n170:mean-0.01147:A-0.150, k3/e4:n499:mean-0.00574:A-0.128, k3/e6:n116:mean0.01106:A0.119, k3/e5:n810:mean0.00235:A0.067, k4/e5:n255:mean-0.00105:A-0.017, k4/e6:n76:mean-0.00000:A-0.000, k5/e6:n20:mean0.00000:A0.000`

F_3[t] endpoint:
`k2/e6:n807:mean0.02610:A0.742, k2/e4:n189:mean-0.04303:A-0.592, k2/e7:n252:mean-0.02937:A-0.466, k2/e8:n15:mean-0.08296:A-0.321, k3/e5:n564:mean0.01173:A0.279, k3/e7:n264:mean-0.01712:A-0.278, k4/e6:n504:mean0.00406:A0.091, k4/e5:n234:mean-0.00576:A-0.088, k4/e7:n180:mean0.00654:A0.088, k3/e6:n822:mean0.00270:A0.078, k4/e8:n45:mean-0.01103:A-0.074, k2/e5:n852:mean-0.00216:A-0.063`

## Strongest windows

Z:
`15492330:k3:e24:r0.18730:D0.2476, 14518140:k3:e19:r0.16667:D0.2190, 12623100:k2:e17:r0.11810:D0.2019, 13626270:k5:e22:r0.11648:D0.1518, 15825810:k12:e22:r0.11038:D0.1195, 14723310:k8:e24:r0.09772:D0.1103, 12481560:k4:e20:r0.09079:D0.1337, 8421210:k7:e23:r0.08902:D0.1223`

F_2[t]:
`18:587:k2:e4:r0.75000:D0.7500, 18:704:k2:e5:r0.75000:D0.7500, 18:1299:k2:e4:r0.75000:D0.7500, 18:1393:k2:e5:r0.75000:D0.7500, 18:1472:k2:e5:r0.75000:D0.7500, 18:1622:k2:e5:r0.75000:D0.7500, 18:1890:k2:e5:r0.75000:D0.7500, 18:1978:k2:e4:r0.75000:D0.7500`

F_3[t]:
`11:182:k2:e6:r0.88889:D0.8889, 11:748:k2:e6:r0.88889:D0.8889, 11:1261:k2:e5:r0.88889:D0.8889, 11:1530:k2:e6:r0.88889:D0.8889, 11:1722:k2:e5:r0.88889:D0.8889, 11:1968:k2:e5:r0.88889:D0.8889, 11:2125:k2:e6:r0.88889:D0.8889, 11:2211:k2:e6:r0.88889:D0.8889`

SVG: `logs/playground-artifacts/eligible-distance-audit-16000000-p97-f32.svg`
JSON: `logs/playground-artifacts/eligible-distance-audit-16000000-p97-f32.json`
