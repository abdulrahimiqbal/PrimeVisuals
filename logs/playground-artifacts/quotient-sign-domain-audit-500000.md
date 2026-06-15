# Quotient residual sign-domain persistence audit

Candidate:
collapse translated triple faces to relative shapes, subtract the local tuple
main for each shape, and score the largest same-sign connected component in the
quotient shape graph at `|R|>1`.

Integer quotient shape count: `34`.

## Integer side

| N | labels | shape energy | P(tau=1) | active shapes | largest component | strongest shape |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 100000 | 9592 | 1.295783 | 0.588235 | 20 | 20 | 12,54 -2.576 |
| 100000 | 9592 | 1.295783 | 0.588235 | 20 | 20 | 12,54 -2.576 |
| 125000 | 11734 | 1.191918 | 0.470588 | 16 | 16 | 12,54 -2.339 |
| 250000 | 22044 | 1.240870 | 0.529412 | 18 | 18 | 30,42 -2.619 |
| 500000 | 41538 | 1.065557 | 0.382353 | 13 | 13 | 36,54 -2.173 |

Integer exponent fits:
`P theta=-0.214496`,
`shape-energy theta=-0.099506`.

Endpoint controls at N=500000:

| group | P range | active range | shape energy range | P theta range |
| --- | ---: | ---: | ---: | ---: |
| Cramer labels | 0.676471 .. 0.852941 | 28 .. 34 | 14.807305 .. 17.254129 | -0.058974 .. 0.291567 |
| W=30030 fake labels | 0.529412 .. 1.000000 | 18 .. 34 | 1.365170 .. 2.826276 | -0.228585 .. 0.722273 |
| W=30030 composite-only | 1.000000 .. 1.000000 | 34 .. 34 | 39.386771 .. 39.728488 | 0.000000 .. 0.000000 |

Strongest real endpoint shapes:

- 36,54: -2.172925
- 30,42: -2.090680
- 12,60: -1.904027
- 12,54: -1.821078
- 6,24: -1.620983
- 6,18: -1.428743
- 18,42: -1.412742
- 6,54: -1.402513

Largest real endpoint component:
`{"sign":-1,"size":13,"labels":["6,18","6,54","36,54","24,54","12,60","12,48","30,42","6,60","12,54","6,42","18,42","18,24","6,24"],"maxAbs":2.172925076808449}`

## Function-field side

### F_2[t]

Quotient shape count: `54`.

| degree | labels | shape energy | P(tau=1) | active shapes | largest component | strongest shape |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 6 | 1.482343 | 0.666667 | 36 | 36 | t^4 + t | t^5 + t^4 + t^2 + t -2.427 |
| 6 | 9 | 0.804746 | 0.296296 | 16 | 16 | t^4 + t | t^5 + t^4 + t^2 + t -1.462 |
| 7 | 18 | 0.341792 | 0.000000 | 0 | 0 | t^4 + t^3 + t^2 + t | t^5 + t^4 + t^3 + t 0.814 |
| 8 | 30 | 0.668263 | 0.055556 | 4 | 3 | t^4 + t^3 | t^5 + t^3 -1.447 |
| 9 | 56 | 0.799932 | 0.074074 | 8 | 4 | t^4 + t | t^5 + t 2.812 |

Endpoint random monic controls:
| random monic | 0.925926 .. 1.000000 | 50 .. 54 | 2.396737 .. 2.859884 | 0.000000 .. 0.000000 |

Endpoint random reducible controls:
| random reducible | 0.962963 .. 1.000000 | 52 .. 54 | 2.394878 .. 2.770997 | 0.000000 .. 0.000000 |

Strongest endpoint shapes:

- t^4 + t | t^5 + t: 2.812299
- t^4 + t^2 | t^5 + t^3: -1.458771
- t^4 + t^2 | t^5 + t^4 + t^3 + t^2: -1.458771
- t^5 + t^3 | t^5 + t^4 + t^3 + t^2: -1.458771
- t^5 + t^4 + t^3 + t^2 | t^5 + t^3: -1.458771
- t^3 + t | t^5 + t^3: 1.126754
- t^3 + t^2 | t^5 + t^4: 1.126754
- t^3 + t^2 | t^5 + t^4 + t^3 + t^2: 1.126754

### F_3[t]

Quotient shape count: `30`.

| degree | labels | shape energy | P(tau=1) | active shapes | largest component | strongest shape |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 48 | 0.251875 | 0.000000 | 0 | 0 | t^4 + 2*t^2 | 2*t^4 + 2*t^3 + t^2 + t -0.481 |
| 6 | 116 | 0.786664 | 0.033333 | 3 | 1 | t^4 + 2*t^2 | 2*t^4 + t^2 -1.309 |
| 7 | 312 | 0.483041 | 0.033333 | 1 | 1 | t^3 + 2*t | 2*t^3 + t 1.666 |
| 8 | 810 | 1.062581 | 0.300000 | 10 | 9 | t^4 + 2*t^2 | 2*t^4 + t^2 -2.104 |

Endpoint random monic controls:
| random monic | 1.000000 .. 1.000000 | 30 .. 30 | 9.405739 .. 9.907956 | 0.000000 .. 0.000000 |

Endpoint random reducible controls:
| random reducible | 1.000000 .. 1.000000 | 30 .. 30 | 9.388452 .. 9.704430 | 0.000000 .. 0.000000 |

Strongest endpoint shapes:

- t^4 + 2*t^2 | 2*t^4 + t^2: -2.103591
- t^4 + t^3 + 2*t^2 + 2*t | 2*t^4 + 2*t^3 + t^2 + t: -2.103591
- t^4 + 2*t^3 + 2*t^2 + t | 2*t^4 + t^3 + t^2 + 2*t: -2.103591
- t^4 + 2*t^2 | 2*t^4 + t^3 + t^2 + 2*t: -1.553437
- t^4 + 2*t^2 | 2*t^4 + 2*t^3 + t^2 + t: -1.553437
- t^4 + t^3 + 2*t^2 + 2*t | 2*t^4 + t^2: -1.553437
- t^4 + t^3 + 2*t^2 + 2*t | 2*t^4 + t^3 + t^2 + 2*t: -1.553437
- t^4 + 2*t^3 + 2*t^2 + t | 2*t^4 + t^2: -1.553437


SVG: `logs/playground-artifacts/quotient-sign-domain-audit-500000.svg`
JSON: `logs/playground-artifacts/quotient-sign-domain-audit-500000.json`
