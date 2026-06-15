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
| 100000..200000 | 475 | 0.377310 | 0.374138 | 0.003172 | 0.043185 | 0.941205 | -0.375437 |
| 125000..250000 | 594 | 0.376723 | 0.374738 | 0.001985 | 0.017081 | 0.416294 | -0.191980 |
| 250000..500000 | 1189 | 0.376194 | 0.373295 | 0.002900 | 0.025693 | 0.885939 | 0.246898 |
| 500000..1000000 | 2380 | 0.373221 | 0.374076 | -0.000855 | -0.013525 | -0.659823 | -1.063329 |

Endpoint local-eligible count-matched controls:

- aggregate Z range: `0.289305 .. 2.217607`
- mean z range: `0.005930 .. 0.045457`
- rms z range: `0.969419 .. 1.015165`

## F_2[t] degree path

Factor degree cutoff: `3`.

| degree | windows | observed mean | local mean | mean delta | mean z | aggregate Z | composite aggregate Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 704 | 0.283949 | 0.288920 | -0.004972 | -0.002448 | -0.064954 | -0.819046 |
| 16 | 1389 | 0.292705 | 0.287833 | 0.004872 | 0.000773 | 0.028815 | -1.261065 |
| 17 | 2716 | 0.292354 | 0.289629 | 0.002725 | 0.007538 | 0.392825 | -0.045828 |
| 18 | 5397 | 0.291125 | 0.288540 | 0.002585 | 0.009150 | 0.672205 | -0.886916 |

Endpoint local-eligible count-matched controls:
`-1.074439 .. 1.113893`.

## F_3[t] degree path

Factor degree cutoff: `2`.

| degree | windows | observed mean | local mean | mean delta | mean z | aggregate Z | composite aggregate Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 231 | 0.538095 | 0.548485 | -0.010390 | -0.012782 | -0.194275 | -1.832617 |
| 9 | 658 | 0.545289 | 0.549414 | -0.004125 | -0.042129 | -1.080680 | -0.333356 |
| 10 | 2061 | 0.544639 | 0.540944 | 0.003694 | 0.010698 | 0.485649 | -1.768919 |
| 11 | 6069 | 0.539405 | 0.541894 | -0.002489 | -0.013045 | -1.016219 | 0.361389 |

Endpoint local-eligible count-matched controls:
`-1.208813 .. 0.855130`.

## Dominant count/eligible-size classes

Z endpoint:
`k14/e24:n4:meanZ-1.126:Z-2.253, k12/e23:n2:meanZ-1.444:Z-2.042, k12/e29:n30:meanZ0.371:Z2.033, k22/e29:n3:meanZ1.173:Z2.032, k14/e30:n39:meanZ0.323:Z2.014, k15/e33:n8:meanZ-0.596:Z-1.685, k25/e32:n1:meanZ-1.646:Z-1.646, k16/e27:n34:meanZ0.282:Z1.644, k11/e32:n1:meanZ-1.608:Z-1.608, k19/e30:n32:meanZ0.281:Z1.592, k17/e24:n1:meanZ-1.554:Z-1.554, k18/e26:n2:meanZ-1.098:Z-1.553`

F_2[t] endpoint:
`k4/e5:n208:meanZ-0.188:Z-2.705, k2/e4:n928:meanZ0.077:Z2.348, k1/e6:n82:meanZ0.205:Z1.858, k1/e4:n930:meanZ-0.052:Z-1.588, k5/e6:n18:meanZ0.293:Z1.245, k3/e5:n624:meanZ0.039:Z0.966, k4/e6:n71:meanZ0.081:Z0.679, k1/e5:n848:meanZ0.017:Z0.498, k3/e6:n100:meanZ-0.028:Z-0.284, k2/e6:n137:meanZ0.009:Z0.107, k3/e4:n340:meanZ-0.003:Z-0.058, k2/e5:n1111:meanZ0.001:Z0.044`

F_3[t] endpoint:
`k6/e8:n6:meanZ1.355:Z3.320, k4/e5:n231:meanZ0.172:Z2.607, k5/e7:n90:meanZ-0.248:Z-2.352, k6/e7:n6:meanZ-0.749:Z-1.835, k5/e6:n156:meanZ-0.132:Z-1.644, k1/e3:n18:meanZ-0.354:Z-1.500, k2/e3:n3:meanZ-0.707:Z-1.225, k4/e6:n495:meanZ-0.055:Z-1.225, k1/e7:n78:meanZ0.106:Z0.937, k4/e7:n180:meanZ0.068:Z0.906, k3/e6:n822:meanZ-0.027:Z-0.770, k2/e8:n15:meanZ-0.148:Z-0.572`

## Strongest windows

Z:
`872340:k18:e31:z-2.971:obs0.222:loc0.452, 855330:k16:e32:z2.875:obs0.625:loc0.375, 732060:k19:e29:z-2.869:obs0.158:loc0.345, 531930:k12:e26:z-2.867:obs0.083:loc0.385, 816690:k19:e32:z2.836:obs0.579:loc0.375, 661710:k13:e29:z-2.824:obs0.154:loc0.448, 788970:k18:e30:z-2.772:obs0.056:loc0.233, 884100:k17:e29:z2.712:obs0.588:loc0.379`

F_2[t]:
`18:416:k2:e6:z2.236:obs1.000:loc0.333, 18:2361:k2:e6:z2.236:obs1.000:loc0.333, 18:4975:k2:e6:z2.236:obs1.000:loc0.333, 18:7007:k2:e6:z2.236:obs1.000:loc0.333, 18:756:k5:e6:z-2.236:obs0.000:loc0.167, 18:1369:k1:e6:z2.236:obs1.000:loc0.167, 18:1543:k1:e6:z2.236:obs1.000:loc0.167, 18:2669:k5:e6:z-2.236:obs0.000:loc0.167`

F_3[t]:
`11:384:k4:e7:z2.449:obs1.000:loc0.571, 11:2026:k4:e7:z-2.449:obs0.000:loc0.429, 11:2720:k4:e7:z-2.449:obs0.000:loc0.429, 11:3387:k4:e7:z2.449:obs1.000:loc0.571, 11:5035:k4:e7:z-2.449:obs0.000:loc0.429, 11:5398:k4:e7:z2.449:obs1.000:loc0.571, 11:467:k5:e7:z2.449:obs1.000:loc0.714, 11:484:k5:e7:z-2.449:obs0.000:loc0.286`

SVG: `logs/playground-artifacts/predecessor-rank-audit-1000000-p47-f32.svg`
JSON: `logs/playground-artifacts/predecessor-rank-audit-1000000-p47-f32.json`
