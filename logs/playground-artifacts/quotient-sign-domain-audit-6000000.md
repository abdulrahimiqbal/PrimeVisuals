# Quotient residual sign-domain persistence audit

Candidate:
collapse translated triple faces to relative shapes, subtract the local tuple
main for each shape, and score the largest same-sign connected component in the
quotient shape graph at `|R|>1`.

Integer quotient shape count: `34`.

## Integer side

| N | labels | shape energy | P(tau=1) | active shapes | largest component | strongest shape |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 375000 | 31904 | 1.128928 | 0.382353 | 13 | 13 | 36,54 -2.455 |
| 750000 | 60238 | 1.047162 | 0.529412 | 18 | 18 | 36,54 -2.088 |
| 1500000 | 114155 | 0.853135 | 0.205882 | 8 | 7 | 36,54 -1.920 |
| 3000000 | 216816 | 0.673087 | 0.117647 | 5 | 4 | 12,18 -2.001 |
| 6000000 | 412849 | 0.653216 | 0.029412 | 4 | 1 | 18,54 1.539 |

Integer exponent fits:
`P theta=-0.957080`,
`shape-energy theta=-0.221626`.

Endpoint controls at N=6000000:

| group | P range | active range | shape energy range | P theta range |
| --- | ---: | ---: | ---: | ---: |
| Cramer labels | 0.852941 .. 0.852941 | 34 .. 34 | 40.309539 .. 43.810842 | 0.000000 .. 0.071946 |
| W=30030 fake labels | 1.000000 .. 1.000000 | 34 .. 34 | 6.321608 .. 8.527241 | 0.008614 .. 0.556890 |
| W=30030 composite-only | 1.000000 .. 1.000000 | 34 .. 34 | 90.556684 .. 91.179125 | 0.000000 .. 0.000000 |

Strongest real endpoint shapes:

- 18,54: 1.539197
- 30,42: -1.226479
- 6,60: -1.175982
- 12,36: 1.128072
- 18,30: 0.988839
- 6,54: -0.907354
- 24,42: 0.883383
- 24,36: 0.838595

Largest real endpoint component:
`{"sign":1,"size":1,"labels":["18,54"],"maxAbs":1.5391972312563291}`

## Function-field side

### F_2[t]

Quotient shape count: `54`.

| degree | labels | shape energy | P(tau=1) | active shapes | largest component | strongest shape |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 18 | 14532 | 0.821151 | 0.111111 | 9 | 6 | t^3 + t | t^4 + t 2.021 |
| 19 | 27594 | 0.975376 | 0.166667 | 22 | 9 | t^4 + t^2 | t^5 + t^3 -2.305 |
| 20 | 52377 | 1.225098 | 0.314815 | 18 | 17 | t^4 + t^3 + t^2 + t | t^5 + t^4 + t^3 + t -2.256 |
| 21 | 99858 | 0.801750 | 0.092593 | 12 | 5 | t^5 + t^4 + t^3 + t | t^5 + t^3 + t^2 + t -1.780 |
| 22 | 190557 | 1.005022 | 0.425926 | 27 | 23 | t^4 + t^3 + t^2 + t | t^5 + t^4 + t^3 + t 2.092 |

Endpoint random monic controls:
| random monic | 1.000000 .. 1.000000 | 54 .. 54 | 63.430181 .. 63.579289 | 0.000000 .. 0.000000 |

Endpoint random reducible controls:
| random reducible | 1.000000 .. 1.000000 | 54 .. 54 | 63.129918 .. 63.473937 | 0.000000 .. 0.000000 |

Strongest endpoint shapes:

- t^4 + t^3 + t^2 + t | t^5 + t^4 + t^3 + t: 2.091746
- t^4 + t^2 | t^5 + t^2: 1.782941
- t^4 + t^2 | t^5 + t^4: 1.782941
- t^5 + t^2 | t^5 + t^4: 1.782941
- t^5 + t^4 | t^5 + t^2: 1.782941
- t^5 + t^4 + t^2 + t | t^5 + t: 1.782941
- t^5 + t^4 + t^3 + t | t^5 + t^3 + t^2 + t: 1.608126
- t^2 + t | t^4 + t^3 + t^2 + t: 1.406335

### F_3[t]

Quotient shape count: `30`.

| degree | labels | shape energy | P(tau=1) | active shapes | largest component | strongest shape |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 9 | 2184 | 0.845536 | 0.033333 | 4 | 1 | t^3 + 2*t | 2*t^3 + t -3.702 |
| 10 | 5880 | 1.038611 | 0.400000 | 12 | 12 | t^3 + 2*t | t^4 + 2*t^2 1.663 |
| 11 | 16104 | 1.433812 | 0.200000 | 6 | 6 | t^4 + 2*t^2 | 2*t^4 + 2*t^3 + t^2 + t -3.395 |
| 12 | 44220 | 1.244351 | 0.600000 | 19 | 18 | t^4 + 2*t^2 | 2*t^4 + t^2 -2.443 |
| 13 | 122640 | 2.018166 | 0.800000 | 27 | 24 | t^3 + 2*t | 2*t^3 + t -4.210 |

Endpoint random monic controls:
| random monic | 1.000000 .. 1.000000 | 30 .. 30 | 73.097152 .. 73.505071 | 0.000000 .. 0.000000 |

Endpoint random reducible controls:
| random reducible | 1.000000 .. 1.000000 | 30 .. 30 | 72.696303 .. 73.220263 | 0.000000 .. 0.000000 |

Strongest endpoint shapes:

- t^3 + 2*t | 2*t^3 + t: -4.209921
- t^3 + 2*t | t^4 + 2*t^2: -2.077599
- t^3 + 2*t | t^4 + t^3 + 2*t^2 + 2*t: -2.077599
- t^3 + 2*t | t^4 + 2*t^3 + 2*t^2 + t: -2.077599
- t^3 + 2*t | 2*t^4 + t^2: -2.077599
- t^3 + 2*t | 2*t^4 + t^3 + t^2 + 2*t: -2.077599
- t^3 + 2*t | 2*t^4 + 2*t^3 + t^2 + t: -2.077599
- 2*t^3 + t | t^4 + 2*t^2: -2.077599


SVG: `logs/playground-artifacts/quotient-sign-domain-audit-6000000.svg`
JSON: `logs/playground-artifacts/quotient-sign-domain-audit-6000000.json`
