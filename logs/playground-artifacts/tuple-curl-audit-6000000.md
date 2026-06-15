# Tuple-residual tetrahedron curl audit

Candidate:
after cellwise tuple singular-series subtraction, treat triple residuals as a
2-cochain on shifts and score the alternating boundary over tetrahedra:
`C_ijkl = R_jkl - R_ikl + R_ijl - R_ijk`.

Integer singular series used primes `<=100000`.

## Integer side

| N | labels | triple energy | curl energy | max abs curl | strongest tetrahedron |
| ---: | ---: | ---: | ---: | ---: | --- |
| 375000 | 31904 | 1.053544 | 1.282254 | 3.034155 | 0,6,30,60 -3.034 |
| 750000 | 60238 | 1.034003 | 1.454173 | 3.638755 | 0,12,30,42 3.639 |
| 1500000 | 114155 | 0.842793 | 1.526844 | 3.225594 | 0,12,18,24 3.226 |
| 3000000 | 216816 | 0.691590 | 1.178944 | 2.696631 | 0,12,30,42 2.697 |
| 6000000 | 412849 | 0.588438 | 1.077125 | 3.181641 | 0,6,30,42 3.182 |

Integer exponent fits:
`curl theta=-0.080570`,
`max-curl theta=-0.029533`.

Endpoint controls at N=6000000:

| group | curl energy range | max abs curl range | curl theta range |
| --- | ---: | ---: | ---: |
| Cramer labels | 50.577372 .. 52.181001 | 110.209418 .. 115.056599 | 0.377068 .. 0.390539 |
| W=30030 fake labels | 1.619873 .. 2.683367 | 4.859864 .. 7.842262 | 0.040793 .. 0.252121 |
| W=30030 composite-only | 16.851810 .. 17.477379 | 37.605266 .. 39.330034 | 0.318402 .. 0.333908 |

Strongest real endpoint tetrahedra:

- 0,6,30,42: 3.181641
- 0,6,42,60: -2.517059
- 0,6,18,42: 2.470487
- 0,24,30,42: 2.173255
- 0,12,30,42: 2.045222
- 6,12,24,60: -2.007245
- 0,6,18,60: -1.921048
- 6,12,18,42: -1.884778

## Function-field side

### F_2[t]

Vertices: `0`, `t^2 + t`, `t^3 + t^2`, `t^3 + t`, `t^4 + t^3 + t^2 + t`, `t^4 + t`, `t^5 + t^4 + t^3 + t`, `t^5 + t^3 + t^2 + t`

| degree | labels | triple energy | curl energy | max abs curl | strongest tetrahedron |
| ---: | ---: | ---: | ---: | ---: | --- |
| 18 | 14532 | 0.808934 | 1.440098 | 4.409885 | 0,t^3 + t^2,t^4 + t^3 + t^2 + t,t^5 + t^4 + t^3 + t -4.410 |
| 19 | 27594 | 0.999155 | 1.854132 | 4.610541 | 0,t^2 + t,t^4 + t^3 + t^2 + t,t^4 + t 4.611 |
| 20 | 52377 | 1.220113 | 1.523597 | 3.859756 | t^3 + t^2,t^3 + t,t^4 + t^3 + t^2 + t,t^5 + t^3 + t^2 + t -3.860 |
| 21 | 99858 | 0.792859 | 1.244097 | 3.800392 | 0,t^3 + t,t^5 + t^4 + t^3 + t,t^5 + t^3 + t^2 + t 3.800 |
| 22 | 190557 | 1.006496 | 1.292316 | 3.062882 | t^3 + t^2,t^3 + t,t^4 + t^3 + t^2 + t,t^4 + t 3.063 |

Endpoint random monic controls:
`27.732915 .. 28.185781`
curl energy, max curl
`51.793030 .. 52.987031`.

Endpoint random reducible controls:
`27.735181 .. 28.277648`
curl energy, max curl
`51.916016 .. 53.295246`.

Strongest endpoint tetrahedra:

- t^3 + t^2,t^3 + t,t^4 + t^3 + t^2 + t,t^4 + t: 3.062882
- t^3 + t^2,t^3 + t,t^4 + t^3 + t^2 + t,t^5 + t^3 + t^2 + t: 2.728404
- 0,t^3 + t^2,t^4 + t^3 + t^2 + t,t^5 + t^4 + t^3 + t: -2.492017
- 0,t^2 + t,t^3 + t^2,t^4 + t^3 + t^2 + t: 2.457093
- 0,t^2 + t,t^3 + t,t^4 + t^3 + t^2 + t: 2.457093
- 0,t^3 + t^2,t^3 + t,t^4 + t: 2.457093
- t^2 + t,t^3 + t^2,t^3 + t,t^4 + t: 2.457093
- t^3 + t^2,t^3 + t,t^4 + t,t^5 + t^4 + t^3 + t: -2.336377

### F_3[t]

Vertices: `0`, `t^3 + 2*t`, `2*t^3 + t`, `t^4 + 2*t^2`, `t^4 + t^3 + 2*t^2 + 2*t`, `t^4 + 2*t^3 + 2*t^2 + t`, `2*t^4 + t^3 + t^2 + 2*t`, `2*t^4 + 2*t^3 + t^2 + t`

| degree | labels | triple energy | curl energy | max abs curl | strongest tetrahedron |
| ---: | ---: | ---: | ---: | ---: | --- |
| 9 | 2184 | 0.872061 | 1.837812 | 3.979666 | 0,t^3 + 2*t,2*t^3 + t,t^4 + 2*t^2 3.980 |
| 10 | 5880 | 1.072030 | 1.839090 | 3.246349 | 0,t^3 + 2*t,t^4 + t^3 + 2*t^2 + 2*t,2*t^4 + 2*t^3 + t^2 + t -3.246 |
| 11 | 16104 | 1.469523 | 2.182460 | 3.755640 | 0,t^3 + 2*t,t^4 + 2*t^2,2*t^4 + t^3 + t^2 + 2*t -3.756 |
| 12 | 44220 | 1.285992 | 1.580864 | 3.088277 | 0,t^3 + 2*t,2*t^3 + t,t^4 + 2*t^2 -3.088 |
| 13 | 122640 | 2.013854 | 2.127812 | 3.143652 | 0,t^3 + 2*t,t^4 + t^3 + 2*t^2 + 2*t,2*t^4 + 2*t^3 + t^2 + t 3.144 |

Endpoint random monic controls:
`0.507751 .. 0.793014`
curl energy, max curl
`1.181916 .. 1.620565`.

Endpoint random reducible controls:
`0.452693 .. 0.714805`
curl energy, max curl
`0.986961 .. 1.718043`.

Strongest endpoint tetrahedra:

- 0,t^3 + 2*t,t^4 + t^3 + 2*t^2 + 2*t,2*t^4 + 2*t^3 + t^2 + t: 3.143652
- 0,t^3 + 2*t,t^4 + 2*t^3 + 2*t^2 + t,2*t^4 + t^3 + t^2 + 2*t: 3.143652
- 0,2*t^3 + t,t^4 + 2*t^2,2*t^4 + t^3 + t^2 + 2*t: -3.143652
- 0,2*t^3 + t,t^4 + 2*t^3 + 2*t^2 + t,2*t^4 + 2*t^3 + t^2 + t: -3.143652
- 0,t^4 + 2*t^2,t^4 + 2*t^3 + 2*t^2 + t,2*t^4 + t^3 + t^2 + 2*t: 3.143652
- 0,t^4 + t^3 + 2*t^2 + 2*t,t^4 + 2*t^3 + 2*t^2 + t,2*t^4 + 2*t^3 + t^2 + t: -3.143652
- 0,t^4 + 2*t^3 + 2*t^2 + t,2*t^4 + t^3 + t^2 + 2*t,2*t^4 + 2*t^3 + t^2 + t: 3.143652
- t^3 + 2*t,2*t^3 + t,t^4 + 2*t^2,2*t^4 + 2*t^3 + t^2 + t: 3.143652


SVG: `logs/playground-artifacts/tuple-curl-audit-6000000.svg`
JSON: `logs/playground-artifacts/tuple-curl-audit-6000000.json`
