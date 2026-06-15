# local-eligible predecessor-squarefree rank discrepancy audit

Candidate:
inside each local eligible set, score offsets by whether the predecessor is
squarefree, then compare prime offsets against finite-population count-matched
subsets.

Integer windows: length `210`, reduced offsets `48`,
small-prime cutoff `97`, active primes
`11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97`.

## Integer fresh blocks

| block | windows | observed mean | local mean | mean delta | mean z | aggregate Z | composite aggregate Z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 4761 | 0.374258 | 0.373944 | 0.000314 | 0.005791 | 0.399580 | -0.584127 |
| 2000000..4000000 | 9523 | 0.374138 | 0.374056 | 0.000081 | 0.000445 | 0.043470 | 0.952501 |
| 4000000..8000000 | 19047 | 0.374221 | 0.373878 | 0.000343 | 0.003955 | 0.545817 | -1.481712 |
| 8000000..16000000 | 38094 | 0.374119 | 0.374044 | 0.000075 | -0.001435 | -0.280160 | 0.186530 |

Endpoint local-eligible count-matched controls:

- aggregate Z range: `-0.279263 .. 1.175867`
- mean z range: `-0.001431 .. 0.006025`
- rms z range: `0.995982 .. 1.002281`

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
`k10/e29:n67:meanZ0.421:Z3.447, k14/e19:n8:meanZ-0.966:Z-2.733, k14/e27:n795:meanZ0.086:Z2.429, k7/e30:n1:meanZ2.401:Z2.401, k8/e29:n12:meanZ-0.666:Z-2.307, k19/e33:n1:meanZ-2.098:Z-2.098, k23/e27:n2:meanZ-1.474:Z-2.085, k22/e31:n5:meanZ0.929:Z2.077, k18/e30:n95:meanZ-0.210:Z-2.046, k22/e28:n6:meanZ-0.824:Z-2.018, k18/e32:n11:meanZ-0.599:Z-1.988, k24/e27:n1:meanZ-1.927:Z-1.927`

F_2[t] endpoint:
`k4/e5:n208:meanZ-0.188:Z-2.705, k2/e4:n928:meanZ0.077:Z2.348, k1/e6:n82:meanZ0.205:Z1.858, k1/e4:n930:meanZ-0.052:Z-1.588, k5/e6:n18:meanZ0.293:Z1.245, k3/e5:n624:meanZ0.039:Z0.966, k4/e6:n71:meanZ0.081:Z0.679, k1/e5:n848:meanZ0.017:Z0.498, k3/e6:n100:meanZ-0.028:Z-0.284, k2/e6:n137:meanZ0.009:Z0.107, k3/e4:n340:meanZ-0.003:Z-0.058, k2/e5:n1111:meanZ0.001:Z0.044`

F_3[t] endpoint:
`k6/e8:n6:meanZ1.355:Z3.320, k4/e5:n231:meanZ0.172:Z2.607, k5/e7:n90:meanZ-0.248:Z-2.352, k6/e7:n6:meanZ-0.749:Z-1.835, k5/e6:n156:meanZ-0.132:Z-1.644, k1/e3:n18:meanZ-0.354:Z-1.500, k2/e3:n3:meanZ-0.707:Z-1.225, k4/e6:n495:meanZ-0.055:Z-1.225, k1/e7:n78:meanZ0.106:Z0.937, k4/e7:n180:meanZ0.068:Z0.906, k3/e6:n822:meanZ-0.027:Z-0.770, k2/e8:n15:meanZ-0.148:Z-0.572`

## Strongest windows

Z:
`12592230:k14:e28:z-3.873:obs0.000:loc0.357, 15499050:k9:e26:z3.705:obs0.778:loc0.308, 14449050:k13:e27:z3.618:obs0.769:loc0.407, 11955930:k14:e24:z-3.593:obs0.143:loc0.458, 12317130:k15:e26:z-3.544:obs0.000:loc0.269, 9177420:k16:e25:z3.530:obs0.750:loc0.480, 14454720:k12:e26:z3.477:obs0.750:loc0.385, 11812290:k6:e23:z3.475:obs1.000:loc0.391`

F_2[t]:
`18:416:k2:e6:z2.236:obs1.000:loc0.333, 18:2361:k2:e6:z2.236:obs1.000:loc0.333, 18:4975:k2:e6:z2.236:obs1.000:loc0.333, 18:7007:k2:e6:z2.236:obs1.000:loc0.333, 18:756:k5:e6:z-2.236:obs0.000:loc0.167, 18:1369:k1:e6:z2.236:obs1.000:loc0.167, 18:1543:k1:e6:z2.236:obs1.000:loc0.167, 18:2669:k5:e6:z-2.236:obs0.000:loc0.167`

F_3[t]:
`11:384:k4:e7:z2.449:obs1.000:loc0.571, 11:2026:k4:e7:z-2.449:obs0.000:loc0.429, 11:2720:k4:e7:z-2.449:obs0.000:loc0.429, 11:3387:k4:e7:z2.449:obs1.000:loc0.571, 11:5035:k4:e7:z-2.449:obs0.000:loc0.429, 11:5398:k4:e7:z2.449:obs1.000:loc0.571, 11:467:k5:e7:z2.449:obs1.000:loc0.714, 11:484:k5:e7:z-2.449:obs0.000:loc0.286`

SVG: `logs/playground-artifacts/predecessor-rank-audit-16000000-p97-f32.svg`
JSON: `logs/playground-artifacts/predecessor-rank-audit-16000000-p97-f32.json`
