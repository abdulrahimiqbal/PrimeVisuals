# count-conditioned admissible window shape residual audit

Candidate:
condition on the number of primes/irreducibles in each short admissible
window, then measure whether their positions are more spread or clustered than
a uniformly random count-matched subset.

Integer windows: length `210`, reduced offsets `48`.
Function windows: `F_2[t]` low-degree offset space `2^5`; `F_3[t]`
low-degree offset space `3^3`.

## Integer fresh blocks

| block | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 4761 | 0.043509 | 3.002110 | 0.959913 | 1.147304 | 1.013349 |
| 2000000..4000000 | 9523 | 0.045214 | 4.412234 | 0.981321 | -0.956038 | 1.009991 |
| 4000000..8000000 | 19047 | 0.042024 | 5.799745 | 0.968211 | 0.754770 | 1.000221 |
| 8000000..16000000 | 38094 | 0.040226 | 7.851116 | 0.967992 | 1.367015 | 1.008209 |

Endpoint count-matched permutation controls:

- aggregate Z range: `-3.154926 .. 0.325069`
- mean z range: `-0.016164 .. 0.001666`
- rms z range: `1.010733 .. 1.014954`

## F_2[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 21 | 31652 | 0.303883 | 54.063915 | 0.855141 | -0.459354 | 1.003717 |
| 22 | 59486 | 0.304730 | 74.322814 | 0.857043 | -0.012901 | 1.005141 |
| 23 | 111880 | 0.298424 | 99.818271 | 0.858285 | -0.608418 | 1.004224 |
| 24 | 210661 | 0.298616 | 137.058126 | 0.859589 | -1.544534 | 1.006691 |

Endpoint permutation controls:
`-1.328486 .. -0.074457`.

## F_3[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12 | 14294 | 0.235159 | 28.114967 | 0.849844 | -0.529795 | 1.003210 |
| 13 | 40008 | 0.261793 | 52.363813 | 0.846094 | 1.386802 | 1.003963 |
| 14 | 110499 | 0.229839 | 76.401619 | 0.861235 | 2.293929 | 0.997987 |
| 15 | 307858 | 0.229536 | 127.358162 | 0.858619 | 3.473082 | 0.998821 |

Endpoint permutation controls:
`0.807838 .. 4.725059`.

## Count-class checks

Z endpoint:
`k2:n1:mean0.546:Z0.546, k3:n4:mean-0.876:Z-1.752, k4:n15:mean-0.037:Z-0.142, k5:n73:mean-0.186:Z-1.585, k6:n172:mean0.033:Z0.434, k7:n523:mean-0.003:Z-0.059, k8:n1170:mean-0.023:Z-0.794, k9:n2109:mean0.008:Z0.362, k10:n3232:mean0.029:Z1.656, k11:n4531:mean0.028:Z1.900, k12:n5223:mean0.074:Z5.345, k13:n5458:mean0.029:Z2.175, k14:n5092:mean0.004:Z0.259, k15:n3964:mean0.076:Z4.754, k16:n2896:mean0.046:Z2.449, k17:n1798:mean0.082:Z3.474, k18:n967:mean0.113:Z3.520, k19:n512:mean0.060:Z1.357, k20:n222:mean0.153:Z2.286, k21:n83:mean0.158:Z1.443, k22:n31:mean-0.004:Z-0.024, k23:n13:mean0.167:Z0.601, k24:n4:mean-0.123:Z-0.247, k25:n1:mean0.826:Z0.826`

F_2[t] endpoint:
`k2:n149471:mean0.238:Z91.961, k3:n51817:mean0.416:Z94.789, k4:n8743:mean0.601:Z56.228, k5:n612:mean0.817:Z20.206, k6:n18:mean1.039:Z4.407`

F_3[t] endpoint:
`k2:n172017:mean0.169:Z70.125, k3:n98422:mean0.269:Z84.436, k4:n31200:mean0.382:Z67.548, k5:n5686:mean0.498:Z37.532, k6:n499:mean0.601:Z13.431, k7:n28:mean0.839:Z4.437, k8:n6:mean1.006:Z2.464`

## Strongest windows

Z:
`15825810:k12:z-4.605, 9330300:k13:z-3.961, 10526460:k14:z-3.734, 14948640:k14:z-3.720, 14019390:k16:z-3.675, 14883120:k10:z-3.655, 11750970:k15:z-3.602, 14395080:k15:z-3.544`

F_2[t]:
`24:18:k3:z-1.435, 24:141:k3:z-1.435, 24:306:k3:z-1.435, 24:354:k3:z-1.435, 24:456:k3:z-1.435, 24:771:k3:z-1.435, 24:951:k3:z-1.435, 24:981:k3:z-1.435`

F_3[t]:
`15:263:k3:z-2.377, 15:405:k3:z-2.377, 15:440:k3:z-2.377, 15:458:k3:z-2.377, 15:506:k3:z-2.377, 15:648:k3:z-2.377, 15:707:k3:z-2.377, 15:725:k3:z-2.377`

SVG: `logs/playground-artifacts/window-shape-audit-16000000.svg`
JSON: `logs/playground-artifacts/window-shape-audit-16000000.json`
