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
| 100000..200000 | 475 | -0.000708 | -0.000720 | 0.000012 | 0.000256 | 0.011858 |
| 125000..250000 | 594 | -0.000749 | -0.000698 | -0.000050 | -0.001228 | 0.004023 |
| 250000..500000 | 1189 | -0.001104 | -0.000678 | -0.000426 | -0.014691 | 0.007539 |
| 500000..1000000 | 2380 | -0.000935 | -0.000738 | -0.000197 | -0.009613 | -0.015942 |

Endpoint local-sieve count-matched controls:

- aggregate residual range: `-0.021508 .. 0.025528`
- mean residual range: `-0.000441 .. 0.000523`
- rms residual range: `0.012361 .. 0.013234`

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
`k7/e28:n1:mean-0.04511:A-0.0451, k8/e29:n1:mean0.04133:A0.0413, k10/e26:n6:mean0.01660:A0.0407, k7/e24:n1:mean0.03598:A0.0360, k8/e30:n1:mean0.03491:A0.0349, k13/e28:n51:mean0.00471:A0.0336, k7/e26:n1:mean-0.03253:A-0.0325, k10/e25:n7:mean-0.01210:A-0.0320, k8/e27:n3:mean-0.01766:A-0.0306, k9/e24:n2:mean-0.02085:A-0.0295, k11/e29:n14:mean-0.00785:A-0.0294, k15/e25:n8:mean-0.01037:A-0.0293`

F_2[t] endpoint:
`k4/e6:n76:mean-0.00945:A-0.0824, k4/e5:n255:mean-0.00496:A-0.0793, k3/e4:n499:mean0.00192:A0.0430, k3/e6:n116:mean-0.00098:A-0.0106, k3/e5:n810:mean-0.00025:A-0.0070, k5/e6:n20:mean-0.00142:A-0.0064, k4/e4:n79:mean0.00000:A0.0000, k5/e5:n27:mean0.00000:A0.0000, k6/e6:n1:mean0.00000:A0.0000`

F_3[t] endpoint:
`k3/e5:n564:mean-0.01786:A-0.4241, k3/e6:n822:mean-0.01263:A-0.3622, k3/e8:n6:mean-0.12545:A-0.3073, k3/e7:n264:mean0.01769:A0.2874, k3/e4:n54:mean-0.03033:A-0.2229, k4/e6:n504:mean0.00935:A0.2099, k5/e6:n156:mean-0.00713:A-0.0891, k4/e7:n180:mean0.00459:A0.0616, k5/e7:n90:mean0.00413:A0.0392, k6/e8:n6:mean0.01077:A0.0264, k4/e8:n45:mean-0.00386:A-0.0259, k4/e5:n234:mean-0.00137:A-0.0209`

## Strongest windows

Z:
`822360:k14:e30:res0.05550, 566370:k19:e32:res0.04736, 815640:k13:e28:res0.04633, 809550:k16:e27:res0.04562, 517650:k10:e28:res0.04553, 882210:k13:e26:res0.04515, 736470:k7:e28:res-0.04511, 545160:k10:e29:res-0.04450`

F_2[t]:
`18:132:k3:e5:res0.11378, 18:188:k3:e5:res0.11378, 18:271:k3:e5:res0.11378, 18:279:k3:e5:res0.11378, 18:281:k3:e5:res0.11378, 18:436:k3:e5:res0.11378, 18:463:k3:e5:res0.11378, 18:641:k3:e5:res0.11378`

F_3[t]:
`11:345:k3:e7:res0.22462, 11:591:k3:e7:res0.22462, 11:1190:k3:e7:res0.22462, 11:1406:k3:e7:res0.22462, 11:1803:k3:e7:res0.22462, 11:1919:k3:e7:res0.22462, 11:2049:k3:e7:res0.22462, 11:2135:k3:e7:res0.22462`

SVG: `logs/playground-artifacts/triple-local-sieve-audit-1000000-p47-f32.svg`
JSON: `logs/playground-artifacts/triple-local-sieve-audit-1000000-p47-f32.json`
