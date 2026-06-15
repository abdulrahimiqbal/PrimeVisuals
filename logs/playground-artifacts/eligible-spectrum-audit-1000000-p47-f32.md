# local eligible Fourier-power entropy audit

Candidate:
center prime occupancy inside each local eligible window, compute the
Fourier-power distribution, and compare its normalized entropy against exact
eligible/count shuffled controls.

Integer windows: length `210`, reduced offsets `48`,
small-prime cutoff `47`, active primes
`11,13,17,19,23,29,31,37,41,43,47`.

Residual aggregate: `sum(observed entropy - per-window mean of five
count-matched shuffled controls) / sqrt(windows)`.

## Integer fresh blocks

| block | windows | mean entropy | local mean | mean residual | aggregate residual | composite aggregate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100000..200000 | 475 | 0.909573 | 0.909416 | 0.000156 | 0.003406 | 0.017315 |
| 125000..250000 | 594 | 0.908196 | 0.908898 | -0.000702 | -0.017107 | 0.024487 |
| 250000..500000 | 1189 | 0.908917 | 0.909216 | -0.000299 | -0.010310 | 0.008426 |
| 500000..1000000 | 2380 | 0.908010 | 0.908883 | -0.000873 | -0.042601 | -0.014512 |

Endpoint local-eligible shuffled controls:
`-0.019921 .. 0.029353`.

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
`k18/e31:n40:mean-0.00687:A-0.043, k16/e32:n29:mean-0.00791:A-0.043, k11/e31:n6:mean0.01713:A0.042, k22/e35:n1:mean0.03767:A0.038, k19/e34:n3:mean0.02144:A0.037, k20/e32:n8:mean-0.01269:A-0.036, k23/e33:n4:mean-0.01778:A-0.036, k15/e24:n4:mean-0.01721:A-0.034, k17/e30:n65:mean-0.00413:A-0.033, k11/e32:n1:mean-0.03328:A-0.033, k17/e25:n3:mean-0.01791:A-0.031, k14/e29:n60:mean-0.00398:A-0.031`

F_2[t] endpoint:
`k3/e5:n810:mean-0.00403:A-0.115, k4/e6:n76:mean-0.00827:A-0.072, k2/e5:n1415:mean0.00147:A0.055, k2/e6:n170:mean-0.00340:A-0.044, k3/e6:n116:mean-0.00291:A-0.031, k4/e5:n255:mean-0.00064:A-0.010, k1/e5:n1051:mean0.00006:A0.002, k1/e4:n1373:mean-0.00000:A-0.000, k1/e6:n92:mean-0.00000:A-0.000, k3/e4:n499:mean-0.00000:A-0.000, k5/e6:n20:mean0.00000:A0.000, k2/e4:n1345:mean-0.00000:A-0.000`

F_3[t] endpoint:
`k4/e8:n45:mean0.03073:A0.206, k3/e7:n264:mean0.01171:A0.190, k4/e6:n504:mean-0.00646:A-0.145, k4/e7:n180:mean-0.00996:A-0.134, k2/e5:n852:mean-0.00298:A-0.087, k3/e6:n822:mean0.00243:A0.070, k5/e7:n90:mean0.00604:A0.057, k2/e8:n15:mean-0.01118:A-0.043, k2/e4:n189:mean0.00261:A0.036, k2/e7:n252:mean0.00215:A0.034, k2/e6:n807:mean-0.00075:A-0.021, k6/e8:n6:mean-0.00827:A-0.020`

## Strongest windows

Z:
`587580:k20:e32:r-0.08342:H0.8258, 603330:k13:e27:r-0.07737:H0.8381, 668850:k16:e32:r-0.07471:H0.8345, 901110:k17:e29:r-0.07441:H0.8447, 826140:k15:e28:r-0.07113:H0.8568, 792960:k12:e28:r-0.07102:H0.8459, 533400:k10:e29:r-0.06666:H0.8456, 663600:k12:e24:r-0.06395:H0.8478`

F_2[t]:
`18:5530:k3:e6:r-0.21075:H0.6474, 18:6267:k3:e6:r-0.21075:H0.6474, 18:3458:k3:e6:r-0.21075:H0.6474, 18:7725:k3:e6:r-0.21075:H0.6474, 18:7273:k3:e6:r0.16860:H0.8582, 18:654:k3:e6:r-0.16860:H0.6474, 18:783:k3:e6:r0.16860:H0.8582, 18:1147:k3:e6:r-0.16860:H0.6474`

F_3[t]:
`11:101:k4:e8:r-0.21742:H0.6918, 11:3069:k4:e8:r-0.17067:H0.6918, 11:1631:k4:e8:r0.16724:H0.9255, 11:3017:k4:e8:r-0.15086:H0.7453, 11:0:k4:e8:r0.14982:H0.9255, 11:1459:k4:e8:r0.14239:H0.9255, 11:5398:k4:e7:r-0.13825:H0.7643, 11:1657:k4:e8:r0.13680:H0.9255`

SVG: `logs/playground-artifacts/eligible-spectrum-audit-1000000-p47-f32.svg`
JSON: `logs/playground-artifacts/eligible-spectrum-audit-1000000-p47-f32.json`
