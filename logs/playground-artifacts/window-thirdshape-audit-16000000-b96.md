# count+pair-conditioned triple-shape residual audit

Candidate:
condition on count and pair-distance bin inside each short window, then measure
the third-order variance of triple distance shapes.

Integer windows: length `210`, reduced offsets `48`,
pair-distance bins `96`.

## Integer fresh blocks

| block | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 4761 | -0.043652 | -3.012003 | 0.995648 | 1.621104 | 1.012997 |
| 2000000..4000000 | 9523 | -0.051254 | -5.001630 | 0.995521 | -0.447419 | 1.008000 |
| 4000000..8000000 | 19047 | -0.063327 | -8.739763 | 0.988882 | 2.000320 | 1.010113 |
| 8000000..16000000 | 38093 | -0.053101 | -10.363969 | 0.991409 | 0.565469 | 1.010875 |

Endpoint count+pair matched controls:

- aggregate Z range: `-0.584971 .. 2.048306`
- mean z range: `-0.002997 .. 0.010495`
- rms z range: `0.998287 .. 1.003392`

## F_2[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 21 | 10634 | -0.015971 | -1.646932 | 0.069241 | 2758348.663367 | 1617225.130384 |
| 22 | 19071 | -0.013901 | -1.919657 | 0.064961 | -772399.254822 | 681192.340206 |
| 23 | 34318 | -0.012591 | -2.332570 | 0.059049 | 2239056.448087 | 1049594.662352 |
| 24 | 61190 | -0.012438 | -3.076691 | 0.058211 | 872665.389295 | 862480.207838 |

Endpoint count+pair matched controls:
`-0.302171 .. 0.228139`.

## F_3[t] degree path

| degree | windows | mean z | aggregate Z | rms z | composite aggregate Z | composite rms z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12 | 7877 | -0.000539 | -0.047796 | 0.108255 | 2192691.979545 | 1176870.939917 |
| 13 | 20289 | 0.001035 | 0.147363 | 0.108164 | 376883.297224 | 244691.713523 |
| 14 | 52362 | 0.001095 | 0.250498 | 0.113619 | 2369724.118642 | 794781.510994 |
| 15 | 135841 | 0.001849 | 0.681365 | 0.106991 | 2507160.804085 | 612473.299261 |

Endpoint count+pair matched controls:
`-0.131812 .. 0.095898`.

## Dominant count/pair classes

Z endpoint:
`k14/b43:n1:mean4.104:Z4.104, k15/b34:n478:mean-0.178:Z-3.881, k11/b32:n409:mean-0.191:Z-3.854, k16/b30:n236:mean-0.238:Z-3.662, k10/b43:n10:mean1.073:Z3.394, k14/b28:n252:mean-0.212:Z-3.373, k15/b36:n297:mean-0.191:Z-3.292, k13/b35:n498:mean-0.147:Z-3.288, k7/b28:n16:mean-0.796:Z-3.184, k15/b35:n394:mean-0.155:Z-3.085, k8/b19:n7:mean1.160:Z3.069, k12/b41:n32:mean-0.511:Z-2.892`

F_2[t] endpoint:
`k4/b68:n3528:mean-0.176:Z-10.436, k5/b72:n202:mean-0.698:Z-9.922, k3/b80:n31144:mean-0.000:Z-0.001, k3/b72:n15553:mean-0.000:Z-0.001, k3/b40:n5120:mean0.000:Z0.000, k4/b76:n2228:mean0.000:Z0.000, k4/b80:n2310:mean0.000:Z0.000, k4/b72:n677:mean0.000:Z0.000, k6/b73:n18:mean-0.000:Z-0.000, k5/b74:n410:mean0.000:Z0.000`

F_3[t] endpoint:
`k5/b68:n136:mean2.554:Z29.789, k6/b77:n78:mean2.453:Z21.662, k5/b70:n720:mean-0.413:Z-11.093, k7/b79:n24:mean1.653:Z8.096, k6/b78:n198:mean-0.144:Z-2.032, k7/b77:n4:mean-0.979:Z-1.958, k8/b79:n6:mean0.545:Z1.335, k3/b67:n10842:mean-0.000:Z-0.001, k3/b74:n52266:mean-0.000:Z-0.001, k4/b85:n15858:mean-0.000:Z-0.000, k4/b71:n2298:mean0.000:Z0.000, k4/b81:n4059:mean-0.000:Z-0.000`

## Strongest windows

Z:
`8223810:k12:b28:z5.573, 9144870:k14:b40:z5.492, 15143520:k11:b28:z5.346, 10626840:k16:b31:z5.169, 14235480:k15:b33:z4.680, 8332380:k12:b30:z4.671, 9998940:k8:b24:z4.663, 8717940:k16:b29:z4.614`

F_2[t]:
`24:9240:k5:b72:z-0.698, 24:9432:k5:b72:z-0.698, 24:10007:k5:b72:z-0.698, 24:10215:k5:b72:z-0.698, 24:11474:k5:b72:z-0.698, 24:12061:k5:b72:z-0.698, 24:16705:k5:b72:z-0.698, 24:18967:k5:b72:z-0.698`

F_3[t]:
`15:9726:k5:b68:z2.554, 15:12153:k5:b68:z2.554, 15:13513:k5:b68:z2.554, 15:13732:k5:b68:z2.554, 15:27666:k5:b68:z2.554, 15:32410:k5:b68:z2.554, 15:39134:k5:b68:z2.554, 15:45472:k5:b68:z2.554`

SVG: `logs/playground-artifacts/window-thirdshape-audit-16000000-b96.svg`
JSON: `logs/playground-artifacts/window-thirdshape-audit-16000000-b96.json`
