# Fixed-shift graph degree-spectrum audit

Candidate:
build an unordered graph on primes/irreducibles using a fixed admissible shift set and score `D=std(degree)/sqrt(mean degree)`.

## Integer side

Shifts: 6, 12, 18, 24, 30, 42, 60, 90

| N | labels | mean degree | D | zero frac | shift edges |
| ---: | ---: | ---: | ---: | ---: | --- |
| 500000 | 41538 | 4.073427 | 0.791977 | 0.005561 | 6:9184, 12:9152, 18:9227, 24:9190, 30:12317, 42:11061, 60:12207, 90:12263 |
| 1000000 | 78498 | 3.850366 | 0.802859 | 0.007949 | 6:16386, 12:16378, 18:16451, 24:16342, 30:21990, 42:19838, 60:21829, 90:21909 |
| 2000000 | 148933 | 3.646069 | 0.809209 | 0.010602 | 6:29419, 12:29523, 18:29544, 24:29536, 30:39387, 42:35619, 60:39222, 90:39260 |
| 4000000 | 283146 | 3.466063 | 0.816985 | 0.014162 | 6:53224, 12:53299, 18:53448, 24:53347, 30:71152, 42:64018, 60:71078, 90:71135 |
| 8000000 | 539777 | 3.300937 | 0.823568 | 0.017913 | 6:96705, 12:96895, 18:96938, 24:96849, 30:129152, 42:116230, 60:128851, 90:129265 |

Integer exponent fits: `D theta=0.014917`, `meanDegree theta=-0.081981`.

Endpoint controls at N=8000000:

| group | D range | mean degree range | zero frac range |
| --- | ---: | ---: | ---: |
| Cramer labels | 0.906341 .. 0.911995 | 3.256548 .. 3.275631 | 0.027078 .. 0.027853 |
| sampled composites | 0.830489 .. 0.832803 | 3.324321 .. 3.331179 | 0.018400 .. 0.018604 |

## F_2[t] side

Shifts: t^2 + t, t^3 + t^2, t^3 + t, t^4 + t^3 + t^2 + t, t^4 + t, t^5 + t^4 + t^3 + t

| degree | labels | mean degree | D | zero frac |
| ---: | ---: | ---: | ---: | ---: |
| 19 | 27594 | 2.341813 | 1.192622 | 0.248786 |
| 20 | 52377 | 2.223724 | 1.211871 | 0.272715 |
| 21 | 99858 | 2.113481 | 1.228465 | 0.295970 |
| 22 | 190557 | 2.020141 | 1.235972 | 0.315108 |

Exponent fits: `D theta=0.018731`, `meanDegree theta=-0.076695`.

Endpoint controls at degree=22:

| group | D range | mean degree range | zero frac range |
| --- | ---: | ---: | ---: |
| random monic | 1.377753 .. 1.380859 | 0.538359 .. 0.550324 | 0.754520 .. 0.758844 |
| random reducible | 1.378675 .. 1.385172 | 0.542599 .. 0.553640 | 0.753239 .. 0.757170 |

## F_3[t] side

Shifts: t^3 + 2*t, 2*t^3 + t, t^4 + 2*t^2, 2*t^4 + t^2, t^4 + t^3 + 2*t^2 + 2*t, 2*t^4 + 2*t^3 + t^2 + t, t^4 + 2*t^3 + 2*t^2 + t, 2*t^4 + t^3 + t^2 + 2*t

| degree | labels | mean degree | D | zero frac |
| ---: | ---: | ---: | ---: | ---: |
| 10 | 5880 | 5.114286 | 1.038293 | 0.032143 |
| 11 | 16104 | 4.569300 | 1.037542 | 0.040238 |
| 12 | 44220 | 4.216463 | 1.078634 | 0.065581 |
| 13 | 122640 | 3.880822 | 1.109492 | 0.085470 |

Exponent fits: `D theta=0.023506`, `meanDegree theta=-0.089712`.

Endpoint controls at degree=13:

| group | D range | mean degree range | zero frac range |
| --- | ---: | ---: | ---: |
| random monic | 1.350879 .. 1.363433 | 1.223451 .. 1.239628 | 0.525326 .. 0.529949 |
| random reducible | 1.358275 .. 1.367725 | 1.233888 .. 1.254958 | 0.521469 .. 0.526623 |

SVG: `logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.svg`
JSON: `logs/playground-artifacts/fixed-shift-graph-degree-audit-8000000.json`