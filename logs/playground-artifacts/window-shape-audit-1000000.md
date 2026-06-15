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
| 100000..200000 | 475 | 0.052957 | 1.154171 | 0.971014 | -0.053226 | 0.981653 |
| 125000..250000 | 594 | 0.075568 | 1.841760 | 0.961400 | -0.815598 | 0.970659 |
| 250000..500000 | 1189 | 0.034601 | 1.193097 | 0.960989 | 0.440752 | 0.993307 |
| 500000..1000000 | 2380 | 0.037793 | 1.843745 | 0.972673 | 0.380630 | 0.998371 |

Endpoint count-matched permutation controls:

- aggregate Z range: `-1.862970 .. 0.823818`
- mean z range: `-0.038187 .. 0.016887`
- rms z range: `1.002019 .. 1.029053`

## F_2[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 740 | 0.399872 | 10.877703 | 0.806730 | 0.078712 | 0.989873 |
| 16 | 1385 | 0.350578 | 13.046948 | 0.862470 | 1.157654 | 1.002609 |
| 17 | 2578 | 0.344377 | 17.485413 | 0.848145 | 0.088213 | 0.988581 |
| 18 | 4813 | 0.326722 | 22.666591 | 0.852317 | 0.379119 | 1.001215 |

Endpoint permutation controls:
`-0.838909 .. 2.331920`.

## F_3[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 231 | 0.355854 | 5.408506 | 0.679634 | -0.903915 | 0.988592 |
| 9 | 638 | 0.318688 | 8.049620 | 0.849511 | -0.092138 | 0.974239 |
| 10 | 1854 | 0.269090 | 11.586486 | 0.863940 | -0.624153 | 0.998418 |
| 11 | 5154 | 0.264201 | 18.967357 | 0.841250 | 0.349778 | 1.002744 |

Endpoint permutation controls:
`-1.355912 .. 1.661297`.

## Count-class checks

Z endpoint:
`k7:n4:mean0.612:Z1.224, k8:n7:mean0.395:Z1.046, k9:n22:mean0.062:Z0.290, k10:n50:mean-0.126:Z-0.892, k11:n84:mean0.023:Z0.211, k12:n171:mean0.088:Z1.150, k13:n239:mean-0.005:Z-0.072, k14:n270:mean0.031:Z0.509, k15:n331:mean-0.005:Z-0.100, k16:n336:mean-0.027:Z-0.487, k17:n314:mean0.153:Z2.704, k18:n214:mean-0.002:Z-0.023, k19:n153:mean-0.000:Z-0.002, k20:n87:mean0.238:Z2.221, k21:n60:mean0.001:Z0.009, k22:n20:mean0.432:Z1.933, k23:n9:mean-0.063:Z-0.190, k24:n7:mean0.068:Z0.181, k25:n2:mean-0.337:Z-0.476`

F_2[t] endpoint:
`k2:n2930:mean0.236:Z12.756, k3:n1425:mean0.407:Z15.378, k4:n410:mean0.640:Z12.965, k5:n47:mean0.809:Z5.543, k6:n1:mean1.039:Z1.039`

F_3[t] endpoint:
`k2:n2124:mean0.158:Z7.293, k3:n1728:mean0.312:Z12.983, k4:n1002:mean0.346:Z10.948, k5:n264:mean0.451:Z7.326, k6:n30:mean0.570:Z3.124, k7:n6:mean0.530:Z1.298`

## Strongest windows

Z:
`576660:k16:z-3.934, 860160:k14:z-3.461, 685860:k16:z-3.365, 783720:k17:z-3.363, 521430:k16:z-3.300, 603960:k9:z-2.939, 969990:k12:z-2.876, 560280:k17:z2.830`

F_2[t]:
`18:44:k3:z-1.435, 18:127:k3:z-1.435, 18:134:k3:z-1.435, 18:227:k3:z-1.435, 18:231:k3:z-1.435, 18:326:k3:z-1.435, 18:373:k3:z-1.435, 18:397:k3:z-1.435`

F_3[t]:
`11:378:k3:z-2.377, 11:432:k3:z-2.377, 11:476:k3:z-2.377, 11:594:k3:z-2.377, 11:689:k3:z-2.377, 11:702:k3:z-2.377, 11:935:k3:z-2.377, 11:959:k3:z-2.377`

SVG: `logs/playground-artifacts/window-shape-audit-1000000.svg`
JSON: `logs/playground-artifacts/window-shape-audit-1000000.json`
