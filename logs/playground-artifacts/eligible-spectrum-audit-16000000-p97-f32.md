# local eligible Fourier-power entropy audit

Candidate:
center prime occupancy inside each local eligible window, compute the
Fourier-power distribution, and compare its normalized entropy against exact
eligible/count shuffled controls.

Integer windows: length `210`, reduced offsets `48`,
small-prime cutoff `97`, active primes
`11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97`.

Residual aggregate: `sum(observed entropy - per-window mean of five
count-matched shuffled controls) / sqrt(windows)`.

## Integer fresh blocks

| block | windows | mean entropy | local mean | mean residual | aggregate residual | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 4761 | 0.909473 | 0.909774 | -0.000301 | -0.020764 | -0.006488 |
| 2000000..4000000 | 9523 | 0.909249 | 0.909457 | -0.000207 | -0.020230 | -0.022143 |
| 4000000..8000000 | 19047 | 0.909319 | 0.909364 | -0.000045 | -0.006222 | -0.012268 |
| 8000000..16000000 | 38094 | 0.909202 | 0.909284 | -0.000082 | -0.016047 | -0.018665 |

Endpoint local-eligible shuffled controls:
`-0.030006 .. 0.021665`.

## F_2[t] degree path

Factor degree cutoff: `3`; additive window: `F_2^5`.

| degree | windows | mean entropy | local mean | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 940 | 0.832068 | 0.829699 | 0.002369 | 0.072619 | -0.085871 |
| 16 | 1848 | 0.825726 | 0.828155 | -0.002429 | -0.104399 | -0.003646 |
| 17 | 3652 | 0.830556 | 0.831070 | -0.000514 | -0.031082 | 0.046256 |
| 18 | 7222 | 0.833416 | 0.833807 | -0.000391 | -0.033267 | -0.006657 |

Endpoint local-eligible shuffled controls:
`-0.046999 .. 0.057292`.

## F_3[t] degree path

Factor degree cutoff: `2`; additive window: `F_3^3`.

| degree | windows | mean entropy | local mean | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 231 | 0.889797 | 0.898364 | -0.008567 | -0.130213 | -0.070016 |
| 9 | 673 | 0.893934 | 0.894827 | -0.000893 | -0.023166 | 0.015035 |
| 10 | 2103 | 0.897821 | 0.897268 | 0.000553 | 0.025342 | -0.017854 |
| 11 | 6174 | 0.900337 | 0.900358 | -0.000021 | -0.001659 | 0.083362 |

Endpoint local-eligible shuffled controls:
`-0.013248 .. 0.019009`.

## Dominant classes

Z endpoint:
`k15/e28:n487:mean0.00227:A0.050, k22/e28:n6:mean-0.01799:A-0.044, k18/e31:n41:mean-0.00654:A-0.042, k10/e28:n145:mean0.00346:A0.042, k10/e26:n395:mean-0.00204:A-0.040, k16/e25:n388:mean0.00193:A0.038, k6/e21:n25:mean-0.00753:A-0.038, k12/e31:n27:mean-0.00714:A-0.037, k21/e32:n5:mean-0.01588:A-0.036, k14/e29:n300:mean0.00204:A0.035, k10/e27:n236:mean-0.00230:A-0.035, k6/e15:n1:mean-0.03512:A-0.035`

F_2[t] endpoint:
`k3/e5:n810:mean-0.00403:A-0.115, k4/e6:n76:mean-0.00827:A-0.072, k2/e5:n1415:mean0.00147:A0.055, k2/e6:n170:mean-0.00340:A-0.044, k3/e6:n116:mean-0.00291:A-0.031, k4/e5:n255:mean-0.00064:A-0.010, k1/e5:n1051:mean0.00006:A0.002, k1/e4:n1373:mean-0.00000:A-0.000, k1/e6:n92:mean-0.00000:A-0.000, k3/e4:n499:mean-0.00000:A-0.000, k5/e6:n20:mean0.00000:A0.000, k2/e4:n1345:mean-0.00000:A-0.000`

F_3[t] endpoint:
`k4/e8:n45:mean0.03073:A0.206, k3/e7:n264:mean0.01171:A0.190, k4/e6:n504:mean-0.00646:A-0.145, k4/e7:n180:mean-0.00996:A-0.134, k2/e5:n852:mean-0.00298:A-0.087, k3/e6:n822:mean0.00243:A0.070, k5/e7:n90:mean0.00604:A0.057, k2/e8:n15:mean-0.01118:A-0.043, k2/e4:n189:mean0.00261:A0.036, k2/e7:n252:mean0.00215:A0.034, k2/e6:n807:mean-0.00075:A-0.021, k6/e8:n6:mean-0.00827:A-0.020`

## Strongest windows

Z:
`13881000:k15:e24:r-0.10781:H0.8118, 10937640:k14:e27:r-0.08644:H0.8301, 14029680:k9:e22:r-0.07991:H0.8229, 13329960:k13:e24:r-0.07947:H0.8427, 11477760:k15:e26:r-0.07768:H0.8437, 15200640:k17:e29:r-0.07529:H0.8498, 15895110:k11:e26:r-0.07513:H0.8381, 14340900:k13:e25:r-0.07471:H0.8360`

F_2[t]:
`18:5530:k3:e6:r-0.21075:H0.6474, 18:6267:k3:e6:r-0.21075:H0.6474, 18:3458:k3:e6:r-0.21075:H0.6474, 18:7725:k3:e6:r-0.21075:H0.6474, 18:7273:k3:e6:r0.16860:H0.8582, 18:654:k3:e6:r-0.16860:H0.6474, 18:783:k3:e6:r0.16860:H0.8582, 18:1147:k3:e6:r-0.16860:H0.6474`

F_3[t]:
`11:101:k4:e8:r-0.21742:H0.6918, 11:3069:k4:e8:r-0.17067:H0.6918, 11:1631:k4:e8:r0.16724:H0.9255, 11:3017:k4:e8:r-0.15086:H0.7453, 11:0:k4:e8:r0.14982:H0.9255, 11:1459:k4:e8:r0.14239:H0.9255, 11:5398:k4:e7:r-0.13825:H0.7643, 11:1657:k4:e8:r0.13680:H0.9255`

SVG: `logs/playground-artifacts/eligible-spectrum-audit-16000000-p97-f32.svg`
JSON: `logs/playground-artifacts/eligible-spectrum-audit-16000000-p97-f32.json`
