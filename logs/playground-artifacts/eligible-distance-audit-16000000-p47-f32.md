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
| 1000000..2000000 | 4761 | 0.002803 | 0.002744 | 0.000059 | 0.004061 | 0.006823 |
| 2000000..4000000 | 9523 | 0.003102 | 0.002965 | 0.000136 | 0.013283 | -0.008990 |
| 4000000..8000000 | 19047 | 0.003082 | 0.003193 | -0.000110 | -0.015233 | -0.013277 |
| 8000000..16000000 | 38094 | 0.003465 | 0.003391 | 0.000074 | 0.014350 | 0.015428 |

Endpoint leave-one local-shuffle fake controls:
`-0.005988 .. 0.004882`.

## F_2[t] degree path

Factor degree cutoff: `3`; additive window: `F_2^5`.

| degree | windows | real excess | fake excess | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 21 | 31222 | 0.052947 | 0.053016 | -0.000069 | -0.012130 | -0.008664 |
| 22 | 58772 | 0.053825 | 0.053840 | -0.000014 | -0.003506 | -0.009254 |
| 23 | 110798 | 0.054237 | 0.054460 | -0.000223 | -0.074385 | -0.133746 |
| 24 | 208663 | 0.054846 | 0.055405 | -0.000559 | -0.255471 | -0.417479 |

Endpoint leave-one local-shuffle fake controls:
`-0.133575 .. 0.279732`.

## F_3[t] degree path

Factor degree cutoff: `2`; additive window: `F_3^3`.

| degree | windows | real excess | fake excess | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12 | 14174 | 0.043362 | 0.042698 | 0.000663 | 0.078989 | -0.438495 |
| 13 | 39714 | 0.043099 | 0.044774 | -0.001675 | -0.333900 | -0.102999 |
| 14 | 109869 | 0.046654 | 0.046146 | 0.000508 | 0.168354 | -0.140471 |
| 15 | 306606 | 0.047047 | 0.047489 | -0.000442 | -0.244778 | -0.272073 |

Endpoint leave-one local-shuffle fake controls:
`-0.197279 .. 0.301270`.

## Dominant classes

Z endpoint:
`k3/e25:n1:mean0.16381:A0.164, k2/e23:n1:mean0.11429:A0.114, k3/e28:n2:mean0.07857:A0.111, k6/e31:n6:mean0.02469:A0.060, k5/e24:n6:mean0.02414:A0.059, k6/e23:n3:mean0.03060:A0.053, k3/e30:n1:mean0.04857:A0.049, k4/e24:n2:mean0.02683:A0.038, k5/e29:n15:mean-0.00957:A-0.037, k4/e30:n2:mean0.02611:A0.037, k5/e26:n11:mean0.01068:A0.035, k4/e29:n2:mean-0.02444:A-0.035`

F_2[t] endpoint:
`k2/e6:n10709:mean-0.00368:A-0.380, k2/e4:n63255:mean-0.00112:A-0.281, k3/e6:n5727:mean-0.00165:A-0.125, k3/e5:n29824:mean-0.00035:A-0.060, k3/e4:n16266:mean-0.00044:A-0.056, k2/e5:n75507:mean0.00020:A0.056, k4/e6:n1624:mean0.00118:A0.048, k4/e5:n5479:mean0.00054:A0.040, k5/e6:n272:mean0.00022:A0.004`

F_3[t] endpoint:
`k2/e7:n22968:mean-0.00391:A-0.592, k2/e4:n12462:mean-0.00340:A-0.380, k2/e6:n74835:mean-0.00094:A-0.256, k4/e8:n965:mean0.00685:A0.213, k3/e8:n1570:mean0.00526:A0.208, k2/e8:n1743:mean0.00426:A0.178, k3/e7:n18210:mean0.00107:A0.145, k2/e5:n59028:mean0.00057:A0.138, k3/e6:n46572:mean-0.00058:A-0.126, k5/e7:n2208:mean-0.00223:A-0.105, k4/e5:n6200:mean0.00115:A0.091, k6/e8:n56:mean0.01095:A0.082`

## Strongest windows

Z:
`15492330:k3:e28:r0.17556:D0.2387, 14518140:k3:e25:r0.16381:D0.2171, 8421210:k7:e28:r0.11678:D0.1410, 12623100:k2:e23:r0.11429:D0.2419, 15825810:k12:e30:r0.11165:D0.1218, 11097660:k7:e28:r0.11070:D0.1299, 9810570:k7:e27:r0.10159:D0.1237, 13626270:k5:e24:r0.09743:D0.1415`

F_2[t]:
`24:534:k2:e5:r0.75000:D0.7500, 24:770:k2:e5:r0.75000:D0.7500, 24:966:k2:e4:r0.75000:D0.7500, 24:1262:k2:e4:r0.75000:D0.7500, 24:1485:k2:e4:r0.75000:D0.7500, 24:1498:k2:e6:r0.75000:D0.7500, 24:1922:k2:e4:r0.75000:D0.7500, 24:1942:k2:e4:r0.75000:D0.7500`

F_3[t]:
`15:644:k2:e6:r0.88889:D0.8889, 15:1065:k2:e5:r0.88889:D0.8889, 15:1201:k2:e5:r0.88889:D0.8889, 15:1311:k2:e5:r0.88889:D0.8889, 15:1420:k2:e5:r0.88889:D0.8889, 15:1528:k2:e6:r0.88889:D0.8889, 15:1548:k2:e8:r0.88889:D0.8889, 15:1670:k2:e6:r0.88889:D0.8889`

SVG: `logs/playground-artifacts/eligible-distance-audit-16000000-p47-f32.svg`
JSON: `logs/playground-artifacts/eligible-distance-audit-16000000-p47-f32.json`
