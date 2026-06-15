# adjacent local-eligible occupancy autocorrelation audit

Candidate:
center prime occupancy inside each local eligible window and correlate adjacent
window residual vectors on the common offset coordinate.

Integer windows: length `210`, reduced offsets `48`,
small-prime cutoff `47`, active primes
`11,13,17,19,23,29,31,37,41,43,47`.

## Integer fresh blocks

| block | adjacent pairs | mean corr | aggregate | rms corr | composite aggregate | composite rms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100000..200000 | 474 | 0.003866 | 0.084168 | 0.142527 | 0.063137 | 0.053981 |
| 125000..250000 | 593 | 0.002006 | 0.048842 | 0.142092 | 0.017487 | 0.138877 |
| 250000..500000 | 1188 | -0.009511 | -0.327836 | 0.143982 | -0.294358 | 0.148114 |
| 500000..1000000 | 2379 | -0.000519 | -0.025309 | 0.147083 | -0.128407 | 0.135334 |

Endpoint local-eligible shuffled controls:

- aggregate range: `-0.189611 .. 0.222113`
- mean corr range: `-0.003887 .. 0.004554`
- rms corr range: `0.144104 .. 0.146636`

## F_2[t] degree path

Factor degree cutoff: `3`.

| degree | adjacent pairs | mean corr | aggregate | rms corr | composite aggregate | composite rms |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 282 | -0.000811 | -0.013627 | 0.327857 | 0.034244 | 0.335300 |
| 16 | 568 | 0.004025 | 0.095924 | 0.345987 | 0.451077 | 0.364203 |
| 17 | 1073 | 0.013311 | 0.436029 | 0.338513 | -0.642873 | 0.341597 |
| 18 | 2118 | -0.011343 | -0.522019 | 0.354981 | -0.530305 | 0.344405 |

Endpoint local-eligible shuffled controls:
`-0.123229 .. 0.614151`.

## F_3[t] degree path

Factor degree cutoff: `2`.

| degree | adjacent pairs | mean corr | aggregate | rms corr | composite aggregate | composite rms |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 186 | 0.030490 | 0.415832 | 0.244848 | 0.199298 | 0.225760 |
| 9 | 518 | -0.024449 | -0.556442 | 0.230516 | 0.264149 | 0.209202 |
| 10 | 1669 | -0.001866 | -0.076237 | 0.215181 | -0.194642 | 0.232492 |
| 11 | 4850 | -0.000640 | -0.044537 | 0.224679 | -0.199069 | 0.222357 |

Endpoint local-eligible shuffled controls:
`-0.472095 .. 0.072392`.

## Dominant adjacent classes

Z endpoint:
`k15-12/e27-30:n2:mean0.3400:A0.481, k17-20/e30-31:n2:mean-0.3094:A-0.438, k15-18/e28-29:n2:mean0.3057:A0.432, k16-11/e33-28:n1:mean0.4319:A0.432, k15-15/e26-30:n1:mean0.4265:A0.426, k12-17/e27-28:n1:mean-0.4246:A-0.425, k16-14/e27-29:n2:mean0.2901:A0.410, k19-14/e32-29:n1:mean-0.4040:A-0.404, k15-19/e28-28:n2:mean0.2777:A0.393, k19-18/e33-27:n1:mean-0.3907:A-0.391, k12-22/e27-32:n1:mean-0.3898:A-0.390, k19-12/e28-31:n1:mean-0.3839:A-0.384`

F_2[t] endpoint:
`k2-3/e4-5:n42:mean0.1695:A1.099, k3-1/e6-5:n3:mean-0.4869:A-0.843, k2-3/e4-6:n14:mean-0.2187:A-0.818, k2-4/e5-5:n25:mean-0.1535:A-0.768, k3-2/e6-5:n3:mean-0.4224:A-0.732, k2-4/e4-5:n8:mean-0.2516:A-0.712, k1-1/e4-6:n10:mean0.2214:A0.700, k3-3/e4-6:n2:mean-0.4714:A-0.667, k4-2/e5-6:n1:mean-0.6455:A-0.645, k2-1/e4-6:n4:mean0.3195:A0.639, k2-4/e5-6:n4:mean0.3162:A0.632, k2-2/e5-6:n7:mean-0.2334:A-0.618`

F_3[t] endpoint:
`k2-3/e5-7:n30:mean-0.1799:A-0.986, k4-1/e5-6:n14:mean-0.2187:A-0.818, k5-3/e6-4:n1:mean0.7906:A0.791, k4-2/e5-5:n37:mean0.1269:A0.772, k5-5/e7-6:n2:mean0.5346:A0.756, k4-1/e6-4:n15:mean-0.1778:A-0.689, k4-1/e5-7:n2:mean-0.4658:A-0.659, k3-1/e7-6:n8:mean-0.2216:A-0.627, k3-2/e7-7:n14:mean0.1658:A0.620, k4-5/e6-7:n3:mean0.3335:A0.578, k4-1/e7-6:n9:mean-0.1926:A-0.578, k2-1/e6-7:n7:mean0.2164:A0.572`

## Strongest adjacent pairs

Z:
`879060->879270:k17-14:e30-29:c0.4831, 784140->784350:k17-20:e30-31:c-0.4769, 996450->996660:k16-11:e33-28:c0.4319, 631890->632100:k17-17:e30-30:c0.4271, 775530->775740:k15-15:e26-30:c0.4265, 829920->830130:k12-17:e27-28:c-0.4246, 651840->652050:k15-14:e29-28:c0.4214, 506100->506310:k15-18:e28-29:c0.4185`

F_2[t]:
`18:4703->18:4704:k4-1:e5-5:c-0.9500, 18:7519->18:7520:k1-4:e5-5:c-0.9500, 18:1847->18:1848:k1-1:e4-4:c0.9167, 18:2855->18:2856:k1-3:e4-4:c-0.9167, 18:7263->18:7264:k1-1:e4-4:c0.9167, 18:4127->18:4128:k2-2:e4-5:c-0.9129, 18:287->18:288:k3-4:e4-5:c0.9037, 18:1509->18:1510:k1-1:e5-4:c0.9037`

F_3[t]:
`11:2456->11:2457:k1-4:e6-5:c-0.8981, 11:2190->11:2191:k1-1:e6-6:c0.8667, 11:4380->11:4381:k1-1:e6-6:c0.8667, 11:2072->11:2073:k4-1:e5-7:c-0.8626, 11:4318->11:4319:k4-1:e5-6:c-0.8573, 11:6259->11:6260:k4-1:e5-6:c-0.8573, 11:1985->11:1986:k4-4:e5-5:c0.8500, 11:4055->11:4056:k1-4:e5-5:c-0.8500`

SVG: `logs/playground-artifacts/eligible-adjacent-audit-1000000-p47-f32.svg`
JSON: `logs/playground-artifacts/eligible-adjacent-audit-1000000-p47-f32.json`
