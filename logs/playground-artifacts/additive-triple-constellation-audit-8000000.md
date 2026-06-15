# HL-whitened additive triple constellation audit

Candidate:
fixed additive triples `n,n+a,n+b` and `f,f+h1,f+h2`, with each cell
whitened as `(observed-main)/sqrt(main)` after singular-series subtraction.

Integer singular series used primes `<=100000`. Function-field
singular products used all irreducibles through the audited max degree.

## Integer side

| N | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 500000 | 41538 | 1.061921 | 2.090680 | 30,42 -2.091 |
| 1000000 | 78498 | 0.923270 | 1.439254 | 18,24 -1.439 |
| 2000000 | 148933 | 0.907070 | 1.865846 | 12,18 -1.866 |
| 4000000 | 283146 | 0.596594 | 1.267726 | 12,18 -1.268 |
| 8000000 | 539777 | 0.622159 | 1.340741 | 30,42 -1.341 |

Integer exponent fits:
`energy theta=-0.217264`,
`max-cell theta=-0.146496`.

Endpoint controls at N=8000000:

| group | residual energy range | max abs cell range | energy theta range |
| --- | ---: | ---: | ---: |
| Cramer labels | 46.448977 .. 50.117544 | 68.559580 .. 75.094871 | 0.367192 .. 0.401312 |
| W=30030 fake labels | 7.047914 .. 9.612751 | 8.685881 .. 12.898645 | 0.387245 .. 0.643306 |
| W=30030 composite-only | 99.088712 .. 99.635743 | 119.139854 .. 119.937357 | 0.334405 .. 0.336791 |

Strongest real endpoint cells:

- 30,42: -1.340741
- 12,18: -1.163371
- 18,30: 0.960974
- 18,42: -0.657291
- 6,24: -0.621456
- 12,30: 0.593430
- 6,42: 0.476023
- 6,30: -0.366269

## Function-field side

### F_2[t]

| degree | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 19 | 27594 | 0.962045 | 1.531494 | t^2 + t | t^4 + t 1.531 |
| 20 | 52377 | 0.735513 | 1.406335 | t^2 + t | t^4 + t 1.406 |
| 21 | 99858 | 1.024943 | 1.694249 | t^2 + t | t^3 + t^2 1.694 |
| 22 | 190557 | 0.687781 | 1.050757 | t^2 + t | t^3 + t^2 -1.051 |
| 23 | 364722 | 1.066932 | 2.291348 | t^3 + t | t^5 + t^4 + t^3 + t -2.291 |

Endpoint random monic controls:
`84.979649 .. 85.265045`
energy, max cell
`106.597605 .. 106.917294`.

Endpoint random reducible controls:
`84.574232 .. 84.816265`
energy, max cell
`106.224635 .. 106.624246`.

Strongest endpoint cells:

- t^3 + t | t^5 + t^4 + t^3 + t: -2.291348
- t^3 + t^2 | t^5 + t^4 + t^3 + t: -1.348964
- t^2 + t | t^3 + t^2: -1.179143
- t^2 + t | t^3 + t: -1.179143
- t^3 + t^2 | t^3 + t: -1.179143
- t^3 + t^2 | t^4 + t: -0.208387
- t^3 + t | t^4 + t: -0.208387
- t^2 + t | t^5 + t^4 + t^3 + t: 0.157571

### F_3[t]

| degree | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 10 | 5880 | 1.298690 | 1.662864 | t^3 + 2*t | t^4 + 2*t^2 1.663 |
| 11 | 16104 | 0.744448 | 0.777337 | t^3 + 2*t | t^4 + 2*t^2 -0.777 |
| 12 | 44220 | 1.067365 | 1.992677 | t^3 + 2*t | 2*t^3 + t 1.993 |
| 13 | 122640 | 2.378467 | 4.209918 | t^3 + 2*t | 2*t^3 + t -4.210 |
| 14 | 341484 | 3.567283 | 9.438483 | t^3 + 2*t | 2*t^3 + t 9.438 |

Endpoint random monic controls:
`113.399440 .. 113.753315`
energy, max cell
`113.782121 .. 114.175220`.

Endpoint random reducible controls:
`112.752568 .. 113.017008`
energy, max cell
`113.121716 .. 113.585572`.

Strongest endpoint cells:

- t^3 + 2*t | 2*t^3 + t: 9.438483
- t^4 + 2*t^2 | t^4 + t^3 + 2*t^2 + 2*t: 2.409885
- t^4 + 2*t^2 | t^4 + 2*t^3 + 2*t^2 + t: 2.409885
- t^4 + t^3 + 2*t^2 + 2*t | t^4 + 2*t^3 + 2*t^2 + t: 2.409885
- t^3 + 2*t | t^4 + 2*t^2: 1.859547
- t^3 + 2*t | t^4 + t^3 + 2*t^2 + 2*t: 1.859547
- t^3 + 2*t | t^4 + 2*t^3 + 2*t^2 + t: 1.859547
- 2*t^3 + t | t^4 + 2*t^2: 1.859547


SVG: `logs/playground-artifacts/additive-triple-constellation-audit-8000000.svg`
JSON: `logs/playground-artifacts/additive-triple-constellation-audit-8000000.json`
