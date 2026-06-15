# local-sieve-subtracted triple-shape cumulant audit

Candidate:
inside each short window, condition on observed count and on the
window-specific small-factor eligible offsets, then measure the remaining
triple-shape residual.

Integer windows: length `210`, reduced offsets `48`,
small-prime cutoff `97`, active primes
`11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97`.

## Integer fresh blocks

| block | windows | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate residual |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 4761 | -0.000354 | -0.000721 | 0.000367 | 0.025319 | 0.019444 |
| 2000000..4000000 | 9523 | -0.000463 | -0.000676 | 0.000213 | 0.020788 | -0.024975 |
| 4000000..8000000 | 19047 | -0.000783 | -0.000678 | -0.000105 | -0.014459 | 0.040971 |
| 8000000..16000000 | 38093 | -0.000752 | -0.000677 | -0.000075 | -0.014724 | -0.000765 |

Endpoint local-sieve count-matched controls:

- aggregate residual range: `-0.033718 .. 0.013122`
- mean residual range: `-0.000173 .. 0.000067`
- rms residual range: `0.016347 .. 0.016414`

## F_2[t] degree path

Factor degree cutoff: `3`.

| degree | windows | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate residual |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 350 | -0.048371 | -0.046908 | -0.001463 | -0.027368 | 0.068419 |
| 16 | 607 | -0.051457 | -0.047685 | -0.003772 | -0.092939 | 0.120056 |
| 17 | 1088 | -0.047495 | -0.046776 | -0.000719 | -0.023715 | 0.074485 |
| 18 | 1883 | -0.047661 | -0.046936 | -0.000725 | -0.031464 | -0.116204 |

Endpoint local-sieve count-matched controls:
`-0.020812 .. 0.121595`.

## F_3[t] degree path

Factor degree cutoff: `2`.

| degree | windows | mean raw delta | mean local shift | mean residual | aggregate residual | composite aggregate residual |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 180 | -0.009143 | -0.027122 | 0.017979 | 0.241217 | 0.118962 |
| 9 | 500 | -0.033407 | -0.024893 | -0.008515 | -0.190395 | -0.344214 |
| 10 | 1230 | -0.028971 | -0.024965 | -0.004006 | -0.140480 | -0.021182 |
| 11 | 3030 | -0.027838 | -0.023294 | -0.004544 | -0.250118 | -0.020913 |

Endpoint local-sieve count-matched controls:
`-0.063228 .. 0.100471`.

## Dominant count/eligible-size classes

Z endpoint:
`k3/e24:n1:mean0.12781:A0.1278, k3/e25:n1:mean-0.10865:A-0.1087, k4/e20:n3:mean-0.04775:A-0.0827, k3/e22:n1:mean0.08188:A0.0819, k6/e18:n2:mean0.05659:A0.0800, k12/e32:n7:mean0.02950:A0.0781, k3/e19:n1:mean-0.07744:A-0.0774, k4/e23:n1:mean0.07534:A0.0753, k5/e21:n13:mean-0.02028:A-0.0731, k5/e23:n9:mean-0.02316:A-0.0695, k4/e21:n1:mean-0.05847:A-0.0585, k5/e22:n16:mean0.01427:A0.0571`

F_2[t] endpoint:
`k4/e6:n76:mean-0.00945:A-0.0824, k4/e5:n255:mean-0.00496:A-0.0793, k3/e4:n499:mean0.00192:A0.0430, k3/e6:n116:mean-0.00098:A-0.0106, k3/e5:n810:mean-0.00025:A-0.0070, k5/e6:n20:mean-0.00142:A-0.0064, k4/e4:n79:mean0.00000:A0.0000, k5/e5:n27:mean0.00000:A0.0000, k6/e6:n1:mean0.00000:A0.0000`

F_3[t] endpoint:
`k3/e5:n564:mean-0.01786:A-0.4241, k3/e6:n822:mean-0.01263:A-0.3622, k3/e8:n6:mean-0.12545:A-0.3073, k3/e7:n264:mean0.01769:A0.2874, k3/e4:n54:mean-0.03033:A-0.2229, k4/e6:n504:mean0.00935:A0.2099, k5/e6:n156:mean-0.00713:A-0.0891, k4/e7:n180:mean0.00459:A0.0616, k5/e7:n90:mean0.00413:A0.0392, k6/e8:n6:mean0.01077:A0.0264, k4/e8:n45:mean-0.00386:A-0.0259, k4/e5:n234:mean-0.00137:A-0.0209`

## Strongest windows

Z:
`11385570:k4:e25:res0.14867, 8421210:k7:e23:res0.13424, 15492330:k3:e24:res0.12781, 13599810:k8:e20:res0.11307, 9690870:k3:e25:res-0.10865, 12703320:k6:e22:res0.10760, 9111270:k8:e24:res0.10713, 14001750:k5:e24:res0.10688`

F_2[t]:
`18:132:k3:e5:res0.11378, 18:188:k3:e5:res0.11378, 18:271:k3:e5:res0.11378, 18:279:k3:e5:res0.11378, 18:281:k3:e5:res0.11378, 18:436:k3:e5:res0.11378, 18:463:k3:e5:res0.11378, 18:641:k3:e5:res0.11378`

F_3[t]:
`11:345:k3:e7:res0.22462, 11:591:k3:e7:res0.22462, 11:1190:k3:e7:res0.22462, 11:1406:k3:e7:res0.22462, 11:1803:k3:e7:res0.22462, 11:1919:k3:e7:res0.22462, 11:2049:k3:e7:res0.22462, 11:2135:k3:e7:res0.22462`

SVG: `logs/playground-artifacts/triple-local-sieve-audit-16000000-p97-f32.svg`
JSON: `logs/playground-artifacts/triple-local-sieve-audit-16000000-p97-f32.json`
