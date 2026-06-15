# local-sieve-subtracted triple-shape cumulant audit

Candidate:
inside each short window, condition on observed count and on the
window-specific small-factor eligible offsets, then measure the remaining
triple-shape residual.

Integer windows: length `210`, reduced offsets `48`,
small-prime cutoff `47`, active primes
`11,13,17,19,23,29,31,37,41,43,47`.

## Integer fresh blocks

| block | windows | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate residual |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 4761 | -0.000354 | -0.000700 | 0.000346 | 0.023858 | 0.023305 |
| 2000000..4000000 | 9523 | -0.000463 | -0.000678 | 0.000215 | 0.020993 | -0.008306 |
| 4000000..8000000 | 19047 | -0.000783 | -0.000694 | -0.000089 | -0.012279 | 0.018843 |
| 8000000..16000000 | 38093 | -0.000752 | -0.000697 | -0.000055 | -0.010760 | 0.023027 |

Endpoint local-sieve count-matched controls:

- aggregate residual range: `-0.041541 .. -0.006619`
- mean residual range: `-0.000213 .. -0.000034`
- rms residual range: `0.016866 .. 0.017056`

## F_2[t] degree path

Factor degree cutoff: `3`.

| degree | windows | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate residual |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 21 | 10634 | -0.047213 | -0.046930 | -0.000284 | -0.029238 | 0.144106 |
| 22 | 19071 | -0.047150 | -0.046605 | -0.000545 | -0.075283 | 0.066865 |
| 23 | 34318 | -0.045813 | -0.046331 | 0.000518 | 0.096043 | 0.001979 |
| 24 | 61190 | -0.046368 | -0.046605 | 0.000236 | 0.058501 | -0.052809 |

Endpoint local-sieve count-matched controls:
`-0.047922 .. 0.083166`.

## F_3[t] degree path

Factor degree cutoff: `2`.

| degree | windows | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate residual |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12 | 7877 | -0.022522 | -0.025256 | 0.002735 | 0.242708 | 0.147240 |
| 13 | 20289 | -0.025214 | -0.024571 | -0.000643 | -0.091544 | -0.161172 |
| 14 | 52362 | -0.025535 | -0.024548 | -0.000986 | -0.225728 | -0.217339 |
| 15 | 135841 | -0.023874 | -0.024493 | 0.000620 | 0.228372 | 0.598558 |

Endpoint local-sieve count-matched controls:
`0.018649 .. 0.192882`.

## Dominant count/eligible-size classes

Z endpoint:
`k3/e28:n2:mean0.10028:A0.1418, k3/e30:n1:mean-0.10164:A-0.1016, k4/e25:n2:mean-0.06383:A-0.0903, k4/e29:n2:mean-0.06146:A-0.0869, k4/e26:n1:mean0.07652:A0.0765, k3/e25:n1:mean-0.07094:A-0.0709, k6/e33:n1:mean0.06821:A0.0682, k4/e24:n2:mean-0.04547:A-0.0643, k6/e29:n31:mean0.01093:A0.0608, k5/e27:n14:mean-0.01531:A-0.0573, k7/e21:n1:mean0.05708:A0.0571, k4/e31:n3:mean0.03110:A0.0539`

F_2[t] endpoint:
`k3/e6:n5727:mean0.00218:A0.1652, k4/e5:n5479:mean0.00110:A0.0811, k4/e6:n1624:mean0.00184:A0.0743, k3/e4:n16266:mean-0.00055:A-0.0703, k5/e6:n272:mean0.00084:A0.0138, k3/e5:n29824:mean0.00006:A0.0099, k4/e4:n1640:mean0.00000:A0.0000, k6/e6:n18:mean0.00000:A0.0000, k5/e5:n340:mean0.00000:A0.0000`

F_3[t] endpoint:
`k3/e7:n18210:mean0.00405:A0.5470, k3/e4:n3756:mean-0.00606:A-0.3711, k4/e8:n965:mean0.00997:A0.3097, k3/e6:n46572:mean0.00118:A0.2542, k3/e5:n28164:mean-0.00125:A-0.2098, k3/e8:n1570:mean-0.00422:A-0.1674, k4/e5:n6200:mean0.00143:A0.1129, k5/e7:n2208:mean-0.00199:A-0.0935, k5/e8:n282:mean0.00491:A0.0824, k6/e8:n56:mean0.00615:A0.0460, k5/e6:n2790:mean0.00076:A0.0404, k6/e7:n302:mean0.00087:A0.0151`

## Strongest windows

Z:
`11385570:k4:e31:res0.14936, 8421210:k7:e28:res0.13248, 15492330:k3:e28:res0.12882, 14001750:k5:e29:res0.11487, 12230190:k8:e30:res0.11034, 9111270:k8:e27:res0.10983, 12111540:k6:e29:res0.10837, 15834420:k9:e30:res0.10803`

F_2[t]:
`24:43:k3:e5:res0.11378, 24:173:k3:e5:res0.11378, 24:422:k3:e5:res0.11378, 24:476:k3:e5:res0.11378, 24:485:k3:e5:res0.11378, 24:1000:k3:e5:res0.11378, 24:1261:k3:e5:res0.11378, 24:1388:k3:e5:res0.11378`

F_3[t]:
`15:6606:k3:e8:res0.22912, 15:6633:k3:e8:res0.22912, 15:8910:k3:e8:res0.22912, 15:10278:k3:e8:res0.22912, 15:11097:k3:e8:res0.22912, 15:12438:k3:e8:res0.22912, 15:16200:k3:e8:res0.22912, 15:18387:k3:e8:res0.22912`

SVG: `logs/playground-artifacts/triple-local-sieve-audit-16000000-p47-f32.svg`
JSON: `logs/playground-artifacts/triple-local-sieve-audit-16000000-p47-f32.json`
