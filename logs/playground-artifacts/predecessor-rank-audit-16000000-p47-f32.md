# local-eligible predecessor-squarefree rank discrepancy audit

Candidate:
inside each local eligible set, score offsets by whether the predecessor is
squarefree, then compare prime offsets against finite-population count-matched
subsets.

Integer windows: length `210`, reduced offsets `48`,
small-prime cutoff `47`, active primes
`11,13,17,19,23,29,31,37,41,43,47`.

## Integer fresh blocks

| block | windows | observed mean | local mean | mean delta | mean z | aggregate Z | composite aggregate Z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 4761 | 0.374258 | 0.373941 | 0.000318 | 0.004330 | 0.298800 | 0.262921 |
| 2000000..4000000 | 9523 | 0.374138 | 0.374079 | 0.000059 | 0.000007 | 0.000704 | -0.258213 |
| 4000000..8000000 | 19047 | 0.374221 | 0.373919 | 0.000301 | 0.002352 | 0.324536 | -0.198073 |
| 8000000..16000000 | 38094 | 0.374119 | 0.374038 | 0.000081 | -0.001234 | -0.240925 | -0.047546 |

Endpoint local-eligible count-matched controls:

- aggregate Z range: `-1.170858 .. 1.253823`
- mean z range: `-0.005999 .. 0.006424`
- rms z range: `0.995706 .. 1.003308`

## F_2[t] degree path

Factor degree cutoff: `3`.

| degree | windows | observed mean | local mean | mean delta | mean z | aggregate Z | composite aggregate Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 21 | 41156 | 0.289222 | 0.289043 | 0.000180 | 0.001433 | 0.290805 | 0.390883 |
| 22 | 80830 | 0.288397 | 0.288362 | 0.000035 | -0.001856 | -0.527787 | -0.419868 |
| 23 | 158646 | 0.288194 | 0.288718 | -0.000525 | -0.002362 | -0.940686 | -1.862541 |
| 24 | 311114 | 0.288437 | 0.288770 | -0.000334 | -0.000700 | -0.390244 | -0.746657 |

Endpoint local-eligible count-matched controls:
`-0.453207 .. 0.209119`.

## F_3[t] degree path

Factor degree cutoff: `2`.

| degree | windows | observed mean | local mean | mean delta | mean z | aggregate Z | composite aggregate Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12 | 18051 | 0.546322 | 0.541873 | 0.004449 | 0.013260 | 1.781481 | -1.940456 |
| 13 | 53163 | 0.541078 | 0.542194 | -0.001116 | -0.004517 | -1.041558 | 0.363907 |
| 14 | 156168 | 0.541832 | 0.541823 | 0.000009 | 0.000018 | 0.007082 | -0.204459 |
| 15 | 459148 | 0.541753 | 0.542116 | -0.000363 | -0.001027 | -0.695799 | -0.595825 |

Endpoint local-eligible count-matched controls:
`-0.651960 .. 1.369031`.

## Dominant count/eligible-size classes

Z endpoint:
`k6/e24:n8:meanZ-1.060:Z-2.998, k12/e28:n909:meanZ0.081:Z2.444, k20/e34:n17:meanZ0.589:Z2.430, k8/e30:n125:meanZ0.214:Z2.395, k8/e25:n92:meanZ-0.248:Z-2.382, k9/e22:n9:meanZ-0.673:Z-2.018, k9/e28:n418:meanZ0.097:Z1.981, k7/e34:n4:meanZ-0.967:Z-1.934, k14/e35:n27:meanZ-0.366:Z-1.904, k11/e27:n662:meanZ0.073:Z1.880, k24/e32:n1:meanZ-1.856:Z-1.856, k8/e22:n6:meanZ-0.755:Z-1.848`

F_2[t] endpoint:
`k2/e4:n43346:meanZ0.012:Z2.474, k4/e5:n4342:meanZ-0.030:Z-1.952, k5/e6:n234:meanZ-0.082:Z-1.251, k1/e4:n71736:meanZ-0.004:Z-1.044, k4/e6:n1396:meanZ0.026:Z0.962, k3/e5:n23609:meanZ-0.004:Z-0.656, k2/e5:n59332:meanZ-0.002:Z-0.528, k3/e4:n11261:meanZ-0.004:Z-0.427, k1/e6:n9051:meanZ0.004:Z0.409, k1/e5:n72681:meanZ-0.001:Z-0.304, k3/e6:n4960:meanZ-0.004:Z-0.259, k2/e6:n9166:meanZ-0.001:Z-0.055`

F_3[t] endpoint:
`k6/e8:n56:meanZ0.623:Z4.660, k4/e8:n965:meanZ-0.120:Z-3.719, k2/e3:n660:meanZ-0.116:Z-2.973, k3/e7:n18210:meanZ0.018:Z2.466, k1/e6:n61365:meanZ-0.008:Z-2.042, k2/e8:n1743:meanZ0.046:Z1.920, k5/e7:n2208:meanZ-0.036:Z-1.669, k2/e5:n57549:meanZ-0.006:Z-1.500, k1/e3:n1386:meanZ0.038:Z1.425, k1/e8:n884:meanZ0.046:Z1.382, k1/e4:n16455:meanZ0.009:Z1.123, k1/e7:n15414:meanZ-0.008:Z-1.050`

## Strongest windows

Z:
`14449050:k13:e32:z4.126:obs0.769:loc0.344, 11812290:k6:e27:z3.854:obs1.000:loc0.333, 12592230:k14:e30:z-3.833:obs0.000:loc0.367, 13140120:k14:e27:z-3.742:obs0.000:loc0.333, 13652940:k15:e28:z-3.728:obs0.067:loc0.393, 9061710:k12:e28:z3.690:obs0.750:loc0.357, 12092850:k12:e28:z3.690:obs0.750:loc0.357, 9723840:k14:e22:z-3.682:obs0.071:loc0.364`

F_2[t]:
`24:1807:k2:e6:z2.236:obs1.000:loc0.333, 24:1909:k2:e6:z2.236:obs1.000:loc0.333, 24:3210:k2:e6:z2.236:obs1.000:loc0.333, 24:3272:k2:e6:z2.236:obs1.000:loc0.333, 24:4693:k2:e6:z2.236:obs1.000:loc0.333, 24:4804:k2:e6:z2.236:obs1.000:loc0.333, 24:5457:k2:e6:z2.236:obs1.000:loc0.333, 24:5647:k2:e6:z2.236:obs1.000:loc0.333`

F_3[t]:
`15:3663:k4:e8:z-2.646:obs0.000:loc0.500, 15:23407:k4:e8:z-2.646:obs0.000:loc0.500, 15:42331:k4:e8:z-2.646:obs0.000:loc0.500, 15:105115:k2:e8:z-2.646:obs0.000:loc0.750, 15:105791:k2:e8:z-2.646:obs0.000:loc0.750, 15:106546:k2:e8:z-2.646:obs0.000:loc0.750, 15:108075:k3:e8:z-2.646:obs0.000:loc0.625, 15:123930:k2:e8:z-2.646:obs0.000:loc0.750`

SVG: `logs/playground-artifacts/predecessor-rank-audit-16000000-p47-f32.svg`
JSON: `logs/playground-artifacts/predecessor-rank-audit-16000000-p47-f32.json`
