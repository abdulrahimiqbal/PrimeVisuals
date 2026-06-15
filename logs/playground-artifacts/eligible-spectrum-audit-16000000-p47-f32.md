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
| 1000000..2000000 | 4761 | 0.908482 | 0.908754 | -0.000272 | -0.018751 | -0.047575 |
| 2000000..4000000 | 9523 | 0.908772 | 0.908908 | -0.000136 | -0.013273 | 0.002079 |
| 4000000..8000000 | 19047 | 0.909026 | 0.908979 | 0.000047 | 0.006490 | -0.030214 |
| 8000000..16000000 | 38094 | 0.908938 | 0.909024 | -0.000086 | -0.016780 | -0.003852 |

Endpoint local-eligible shuffled controls:
`-0.009769 .. 0.013741`.

## F_2[t] degree path

Factor degree cutoff: `3`; additive window: `F_2^5`.

| degree | windows | mean entropy | local mean | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 21 | 55020 | 0.841280 | 0.841284 | -0.000004 | -0.001004 | -0.017124 |
| 22 | 107801 | 0.843156 | 0.843253 | -0.000098 | -0.032059 | -0.015203 |
| 23 | 211690 | 0.845703 | 0.845679 | 0.000024 | 0.011068 | 0.010313 |
| 24 | 415000 | 0.847883 | 0.847872 | 0.000011 | 0.007196 | -0.048323 |

Endpoint local-eligible shuffled controls:
`-0.038732 .. 0.027194`.

## F_3[t] degree path

Factor degree cutoff: `2`; additive window: `F_3^3`.

| degree | windows | mean entropy | local mean | mean residual | aggregate residual | composite aggregate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12 | 18405 | 0.902499 | 0.903263 | -0.000764 | -0.103671 | -0.034239 |
| 13 | 54144 | 0.905234 | 0.904831 | 0.000402 | 0.093634 | -0.018512 |
| 14 | 159066 | 0.908256 | 0.908150 | 0.000106 | 0.042397 | 0.042708 |
| 15 | 467414 | 0.910920 | 0.910814 | 0.000106 | 0.072130 | 0.001693 |

Endpoint local-eligible shuffled controls:
`-0.051791 .. 0.028561`.

## Dominant classes

Z endpoint:
`k8/e25:n92:mean-0.00586:A-0.056, k16/e31:n525:mean0.00201:A0.046, k7/e27:n82:mean-0.00463:A-0.042, k10/e35:n11:mean0.01248:A0.041, k5/e21:n1:mean-0.03858:A-0.039, k13/e32:n404:mean-0.00186:A-0.037, k8/e24:n31:mean0.00658:A0.037, k22/e35:n1:mean-0.03574:A-0.036, k24/e34:n1:mean-0.03554:A-0.036, k10/e24:n75:mean-0.00408:A-0.035, k9/e23:n22:mean0.00718:A0.034, k21/e33:n9:mean-0.01088:A-0.033`

F_2[t] endpoint:
`k4/e6:n1624:mean-0.00379:A-0.153, k2/e5:n75507:mean0.00031:A0.086, k3/e5:n29824:mean-0.00041:A-0.071, k3/e6:n5727:mean0.00087:A0.066, k2/e6:n10709:mean-0.00042:A-0.044, k4/e5:n5479:mean-0.00012:A-0.009, k1/e5:n92230:mean-0.00001:A-0.002, k1/e4:n103628:mean-0.00000:A-0.000, k1/e6:n10479:mean-0.00000:A-0.000, k3/e4:n16266:mean-0.00000:A-0.000, k2/e4:n63255:mean-0.00000:A-0.000, k5/e6:n272:mean0.00000:A0.000`

F_3[t] endpoint:
`k3/e7:n18210:mean0.00112:A0.151, k4/e7:n7808:mean0.00117:A0.103, k3/e6:n46572:mean0.00031:A0.067, k6/e8:n56:mean-0.00789:A-0.059, k2/e5:n59028:mean0.00021:A0.052, k2/e6:n74835:mean-0.00015:A-0.040, k2/e8:n1743:mean-0.00082:A-0.034, k3/e5:n28164:mean0.00017:A0.029, k4/e8:n965:mean0.00070:A0.022, k2/e7:n22968:mean-0.00014:A-0.021, k5/e7:n2208:mean0.00028:A0.013, k4/e5:n6200:mean0.00012:A0.009`

## Strongest windows

Z:
`13881000:k15:e28:r-0.10603:H0.8003, 12073530:k12:e30:r-0.09962:H0.8169, 14383320:k14:e31:r-0.09086:H0.8117, 10305120:k15:e31:r-0.08838:H0.8290, 15563100:k14:e30:r-0.08785:H0.8154, 15846390:k12:e30:r-0.08756:H0.8264, 15131550:k15:e30:r-0.08599:H0.8217, 15711570:k19:e28:r-0.08522:H0.8159`

F_2[t]:
`24:23832:k3:e6:r-0.21075:H0.6474, 24:25714:k3:e6:r-0.21075:H0.6474, 24:32278:k3:e6:r-0.21075:H0.6474, 24:34026:k3:e6:r-0.21075:H0.6474, 24:34298:k3:e6:r-0.21075:H0.6474, 24:42990:k3:e6:r-0.21075:H0.6474, 24:44049:k3:e6:r-0.21075:H0.6474, 24:44339:k3:e6:r-0.21075:H0.6474`

F_3[t]:
`15:326024:k4:e8:r-0.28725:H0.6382, 15:333943:k4:e8:r-0.25465:H0.6382, 15:424360:k4:e8:r-0.24490:H0.6382, 15:408361:k4:e8:r-0.23834:H0.6382, 15:490041:k4:e8:r-0.23834:H0.6382, 15:435327:k4:e8:r-0.23491:H0.6382, 15:419185:k4:e8:r-0.23491:H0.6382, 15:196191:k4:e8:r-0.23372:H0.6918`

SVG: `logs/playground-artifacts/eligible-spectrum-audit-16000000-p47-f32.svg`
JSON: `logs/playground-artifacts/eligible-spectrum-audit-16000000-p47-f32.json`
