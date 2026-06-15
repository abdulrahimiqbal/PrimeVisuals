# count+pair-conditioned triple-shape residual audit

Candidate:
condition on count and pair-distance bin inside each short window, then measure
the third-order variance of triple distance shapes.

Integer windows: length `210`, reduced offsets `48`,
pair-distance bins `24`.

## Integer fresh blocks

| block | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 4761 | -0.035754 | -2.466997 | 0.989823 | 1.846761 | 1.009479 |
| 2000000..4000000 | 9523 | -0.050308 | -4.909377 | 0.987630 | -0.649852 | 1.004019 |
| 4000000..8000000 | 19047 | -0.061005 | -8.419330 | 0.983296 | 1.358117 | 1.003288 |
| 8000000..16000000 | 38093 | -0.051973 | -10.143768 | 0.985496 | 0.544335 | 1.006663 |

Endpoint count+pair matched controls:

- aggregate Z range: `-1.449829 .. 2.091175`
- mean z range: `-0.007428 .. 0.010714`
- rms z range: `1.001171 .. 1.007301`

## F_2[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 21 | 10634 | -0.037740 | -3.891831 | 0.171041 | 0.417465 | 0.390022 |
| 22 | 19071 | -0.032526 | -4.491826 | 0.159640 | -0.330326 | 0.361049 |
| 23 | 34318 | -0.031425 | -5.821602 | 0.150788 | -0.176898 | 0.343493 |
| 24 | 61190 | -0.031181 | -7.713138 | 0.149554 | -0.368757 | 0.340075 |

Endpoint count+pair matched controls:
`-0.163438 .. 0.207611`.

## F_3[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12 | 7877 | -0.031927 | -2.833643 | 0.311485 | -0.667365 | 0.303337 |
| 13 | 20289 | -0.025476 | -3.628836 | 0.261610 | -0.399077 | 0.276172 |
| 14 | 52362 | -0.034626 | -7.923349 | 0.258884 | 642137.210088 | 370738.489254 |
| 15 | 135841 | -0.025772 | -9.498739 | 0.232501 | -0.874507 | 0.243090 |

Endpoint count+pair matched controls:
`-0.809750 .. 0.368246`.

## Dominant count/pair classes

Z endpoint:
`k15/b9:n695:mean-0.194:Z-5.101, k17/b10:n10:mean1.511:Z4.779, k20/b8:n125:mean-0.368:Z-4.119, k11/b8:n1616:mean-0.101:Z-4.075, k15/b8:n1843:mean-0.086:Z-3.691, k16/b8:n1413:mean-0.090:Z-3.392, k14/b8:n2248:mean-0.068:Z-3.221, k12/b11:n4:mean1.540:Z3.080, k11/b4:n14:mean0.819:Z3.066, k13/b6:n471:mean-0.140:Z-3.032, k13/b7:n1533:mean-0.076:Z-2.959, k5/b2:n1:mean2.958:Z2.958`

F_2[t] endpoint:
`k4/b17:n3528:mean-0.467:Z-27.721, k5/b18:n612:mean-0.447:Z-11.050, k6/b18:n18:mean-1.128:Z-4.784, k4/b18:n677:mean0.048:Z1.246, k3/b20:n31144:mean-0.000:Z-0.001, k3/b18:n15553:mean-0.000:Z-0.001, k3/b10:n5120:mean0.000:Z0.000, k4/b19:n2228:mean0.000:Z0.000, k4/b20:n2310:mean0.000:Z0.000`

F_3[t] endpoint:
`k5/b17:n856:mean-1.206:Z-35.281, k4/b16:n4428:mean-0.446:Z-29.677, k5/b19:n1278:mean-0.591:Z-21.119, k6/b19:n276:mean-0.959:Z-15.934, k5/b20:n3552:mean0.135:Z8.053, k6/b20:n174:mean0.426:Z5.624, k7/b19:n28:mean-0.765:Z-4.047, k8/b19:n6:mean-0.749:Z-1.834, k6/b17:n49:mean-0.043:Z-0.300, k3/b16:n10842:mean-0.000:Z-0.001, k3/b18:n52266:mean-0.000:Z-0.001, k4/b21:n15858:mean-0.000:Z-0.000`

## Strongest windows

Z:
`9144870:k14:b10:z5.900, 10626840:k16:b7:z5.882, 15143520:k11:b7:z5.011, 8223810:k12:b7:z4.939, 11898810:k14:b8:z4.748, 13940010:k14:b10:z4.406, 15720810:k16:b9:z4.403, 11198460:k12:b5:z4.387`

F_2[t]:
`24:6983:k6:b18:z-1.128, 24:46036:k6:b18:z-1.128, 24:50464:k6:b18:z-1.128, 24:65094:k6:b18:z-1.128, 24:155492:k6:b18:z-1.128, 24:174740:k6:b18:z-1.128, 24:183441:k6:b18:z-1.128, 24:209310:k6:b18:z-1.128`

F_3[t]:
`15:91311:k7:b19:z-1.680, 15:91312:k7:b19:z-1.680, 15:108804:k7:b19:z-1.680, 15:108805:k7:b19:z-1.680, 15:112:k5:b17:z-1.566, 15:142:k5:b17:z-1.566, 15:477:k5:b17:z-1.566, 15:2268:k5:b17:z-1.566`

SVG: `logs/playground-artifacts/window-thirdshape-audit-16000000.svg`
JSON: `logs/playground-artifacts/window-thirdshape-audit-16000000.json`
