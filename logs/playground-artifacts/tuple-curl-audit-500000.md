# Tuple-residual tetrahedron curl audit

Candidate:
after cellwise tuple singular-series subtraction, treat triple residuals as a
2-cochain on shifts and score the alternating boundary over tetrahedra:
`C_ijkl = R_jkl - R_ikl + R_ijl - R_ijk`.

Integer singular series used primes `<=100000`.

## Integer side

| N | labels | triple energy | curl energy | max abs curl | strongest tetrahedron |
| ---: | ---: | ---: | ---: | ---: | --- |
| 100000 | 9592 | 1.271968 | 1.195158 | 2.681576 | 0,24,30,42 2.682 |
| 100000 | 9592 | 1.271968 | 1.195158 | 2.681576 | 0,24,30,42 2.682 |
| 125000 | 11734 | 1.141533 | 1.286997 | 3.233299 | 6,18,30,60 -3.233 |
| 250000 | 22044 | 1.231373 | 1.058433 | 2.255572 | 6,12,18,60 2.256 |
| 500000 | 41538 | 1.031707 | 1.173569 | 2.262664 | 0,6,12,24 -2.263 |

Integer exponent fits:
`curl theta=-0.044719`,
`max-curl theta=-0.154701`.

Endpoint controls at N=500000:

| group | curl energy range | max abs curl range | curl theta range |
| --- | ---: | ---: | ---: |
| Cramer labels | 19.369837 .. 20.057520 | 43.881006 .. 47.042611 | 0.322001 .. 0.401316 |
| W=30030 fake labels | 1.349154 .. 2.052902 | 3.910877 .. 5.248309 | -0.178828 .. 0.152579 |
| W=30030 composite-only | 7.368661 .. 7.699015 | 16.618467 .. 17.738712 | 0.298565 .. 0.314733 |

Strongest real endpoint tetrahedra:

- 0,6,12,24: -2.262664
- 6,12,18,30: -2.262664
- 18,24,30,42: -2.262664
- 0,12,30,42: 2.252912
- 6,24,42,60: 2.118634
- 0,6,42,60: -2.061556
- 0,6,30,60: -2.013424
- 6,18,24,60: -1.895369

## Function-field side

### F_2[t]

Vertices: `0`, `t^2 + t`, `t^3 + t^2`, `t^3 + t`, `t^4 + t^3 + t^2 + t`, `t^4 + t`, `t^5 + t^4 + t^3 + t`, `t^5 + t^3 + t^2 + t`

| degree | labels | triple energy | curl energy | max abs curl | strongest tetrahedron |
| ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 6 | 1.455645 | 1.457003 | 2.643560 | 0,t^3 + t^2,t^3 + t,t^5 + t^4 + t^3 + t -2.644 |
| 6 | 9 | 0.798977 | 0.654598 | 2.025948 | t^2 + t,t^3 + t^2,t^4 + t,t^5 + t^4 + t^3 + t -2.026 |
| 7 | 18 | 0.360557 | 0.742713 | 1.672075 | t^3 + t^2,t^3 + t,t^4 + t^3 + t^2 + t,t^5 + t^3 + t^2 + t 1.672 |
| 8 | 30 | 0.677465 | 1.200089 | 3.064325 | t^2 + t,t^3 + t^2,t^4 + t,t^5 + t^3 + t^2 + t -3.064 |
| 9 | 56 | 0.797576 | 1.542959 | 3.499646 | t^2 + t,t^3 + t^2,t^5 + t^4 + t^3 + t,t^5 + t^3 + t^2 + t 3.500 |

Endpoint random monic controls:
`1.192442 .. 1.847437`
curl energy, max curl
`2.838499 .. 4.634196`.

Endpoint random reducible controls:
`1.206182 .. 1.498997`
curl energy, max curl
`2.838499 .. 4.614122`.

Strongest endpoint tetrahedra:

- t^2 + t,t^3 + t^2,t^5 + t^4 + t^3 + t,t^5 + t^3 + t^2 + t: 3.499646
- t^3 + t^2,t^4 + t^3 + t^2 + t,t^5 + t^4 + t^3 + t,t^5 + t^3 + t^2 + t: 3.348626
- t^2 + t,t^4 + t^3 + t^2 + t,t^5 + t^4 + t^3 + t,t^5 + t^3 + t^2 + t: 3.068725
- t^3 + t,t^4 + t,t^5 + t^4 + t^3 + t,t^5 + t^3 + t^2 + t: -3.068725
- t^2 + t,t^3 + t^2,t^4 + t,t^5 + t^3 + t^2 + t: 3.016445
- t^2 + t,t^3 + t,t^4 + t,t^5 + t^4 + t^3 + t: 3.016445
- t^2 + t,t^4 + t^3 + t^2 + t,t^4 + t,t^5 + t^3 + t^2 + t: 3.016445
- t^2 + t,t^3 + t^2,t^4 + t^3 + t^2 + t,t^5 + t^3 + t^2 + t: 2.563870

### F_3[t]

Vertices: `0`, `t^3 + 2*t`, `2*t^3 + t`, `t^4 + 2*t^2`, `t^4 + t^3 + 2*t^2 + 2*t`, `t^4 + 2*t^3 + 2*t^2 + t`, `2*t^4 + t^3 + t^2 + 2*t`, `2*t^4 + 2*t^3 + t^2 + t`

| degree | labels | triple energy | curl energy | max abs curl | strongest tetrahedron |
| ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 48 | 0.252306 | 0.320817 | 0.470830 | 0,t^3 + 2*t,t^4 + 2*t^2,2*t^4 + t^3 + t^2 + 2*t -0.471 |
| 6 | 116 | 0.787634 | 0.531732 | 1.072006 | 0,t^3 + 2*t,2*t^3 + t,2*t^4 + t^3 + t^2 + 2*t -1.072 |
| 7 | 312 | 0.498306 | 1.120361 | 1.819841 | 0,t^3 + 2*t,2*t^3 + t,t^4 + 2*t^2 -1.820 |
| 8 | 810 | 1.086641 | 0.514038 | 0.916923 | 0,t^4 + 2*t^2,t^4 + t^3 + 2*t^2 + 2*t,2*t^4 + 2*t^3 + t^2 + t 0.917 |

Endpoint random monic controls:
`0.428396 .. 0.693994`
curl energy, max curl
`1.100307 .. 1.558768`.

Endpoint random reducible controls:
`0.409181 .. 0.671655`
curl energy, max curl
`1.008615 .. 1.742153`.

Strongest endpoint tetrahedra:

- 0,t^4 + 2*t^2,t^4 + t^3 + 2*t^2 + 2*t,2*t^4 + 2*t^3 + t^2 + t: 0.916923
- 0,t^4 + 2*t^2,t^4 + 2*t^3 + 2*t^2 + t,2*t^4 + t^3 + t^2 + 2*t: 0.916923
- 0,t^4 + t^3 + 2*t^2 + 2*t,t^4 + 2*t^3 + 2*t^2 + t,2*t^4 + t^3 + t^2 + 2*t: 0.916923
- t^3 + 2*t,t^4 + 2*t^2,t^4 + t^3 + 2*t^2 + 2*t,2*t^4 + t^3 + t^2 + 2*t: 0.916923
- 2*t^3 + t,t^4 + 2*t^2,t^4 + 2*t^3 + 2*t^2 + t,2*t^4 + 2*t^3 + t^2 + t: 0.916923
- 2*t^3 + t,t^4 + t^3 + 2*t^2 + 2*t,t^4 + 2*t^3 + 2*t^2 + t,2*t^4 + 2*t^3 + t^2 + t: 0.916923
- 0,t^3 + 2*t,t^4 + 2*t^2,2*t^4 + 2*t^3 + t^2 + t: -0.916923
- 0,t^3 + 2*t,t^4 + t^3 + 2*t^2 + 2*t,2*t^4 + t^3 + t^2 + 2*t: -0.916923


SVG: `logs/playground-artifacts/tuple-curl-audit-500000.svg`
JSON: `logs/playground-artifacts/tuple-curl-audit-500000.json`
