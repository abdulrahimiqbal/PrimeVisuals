# HL-whitened additive triple constellation audit

Candidate:
fixed additive triples `n,n+a,n+b` and `f,f+h1,f+h2`, with each cell
whitened as `(observed-main)/sqrt(main)` after singular-series subtraction.

Integer singular series used primes `<=100000`. Function-field
singular products used all irreducibles through the audited max degree.

## Integer side

| N | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 100000 | 9592 | 1.374445 | 1.960996 | 30,42 -1.961 |
| 100000 | 9592 | 1.374445 | 1.960996 | 30,42 -1.961 |
| 125000 | 11734 | 1.221886 | 1.887849 | 30,42 -1.888 |
| 250000 | 22044 | 1.364981 | 2.618808 | 30,42 -2.619 |
| 500000 | 41538 | 1.061921 | 2.090680 | 30,42 -2.091 |

Integer exponent fits:
`energy theta=-0.120638`,
`max-cell theta=0.094642`.

Endpoint controls at N=500000:

| group | residual energy range | max abs cell range | energy theta range |
| --- | ---: | ---: | ---: |
| Cramer labels | 15.411246 .. 18.062064 | 23.415936 .. 27.532701 | 0.264853 .. 0.479805 |
| W=30030 fake labels | 1.376443 .. 2.802355 | 2.158771 .. 4.256431 | -0.035628 .. 0.486792 |
| W=30030 composite-only | 39.000481 .. 39.332643 | 46.819352 .. 47.610543 | 0.306901 .. 0.308722 |

Strongest real endpoint cells:

- 30,42: -2.090680
- 6,24: -1.620983
- 6,18: -1.428743
- 18,42: -1.412742
- 18,24: -1.211710
- 6,42: -1.003606
- 12,24: -0.970961
- 12,30: -0.884052

## Function-field side

### F_2[t]

| degree | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 6 | 9 | 0.787674 | 1.192928 | t^3 + t^2 | t^4 + t -1.193 |
| 7 | 18 | 0.406073 | 0.719586 | t^2 + t | t^4 + t -0.720 |
| 8 | 30 | 0.394555 | 0.843194 | t^2 + t | t^4 + t 0.843 |
| 9 | 56 | 0.575191 | 0.968019 | t^2 + t | t^5 + t^4 + t^3 + t -0.968 |
| 10 | 99 | 0.744243 | 1.114813 | t^3 + t^2 | t^5 + t^4 + t^3 + t -1.115 |

Endpoint random monic controls:
`3.243447 .. 3.513060`
energy, max cell
`4.109960 .. 4.340355`.

Endpoint random reducible controls:
`3.152122 .. 3.455968`
energy, max cell
`3.962184 .. 4.340355`.

Strongest endpoint cells:

- t^3 + t^2 | t^5 + t^4 + t^3 + t: -1.114813
- t^2 + t | t^3 + t^2: -1.017049
- t^2 + t | t^3 + t: -1.017049
- t^3 + t^2 | t^3 + t: -1.017049
- t^3 + t | t^5 + t^4 + t^3 + t: -0.788292
- t^2 + t | t^4 + t: -0.428780
- t^3 + t^2 | t^4 + t: -0.428780
- t^3 + t | t^4 + t: -0.428780

### F_3[t]

| degree | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 5 | 48 | 0.233166 | 0.245755 | t^3 + 2*t | t^4 + 2*t^2 -0.246 |
| 6 | 116 | 0.632530 | 0.772961 | t^4 + 2*t^2 | t^4 + t^3 + 2*t^2 + 2*t -0.773 |
| 7 | 312 | 0.546687 | 1.666200 | t^3 + 2*t | 2*t^3 + t 1.666 |
| 8 | 810 | 0.515617 | 1.003283 | t^3 + 2*t | 2*t^3 + t -1.003 |

Endpoint random monic controls:
`9.443245 .. 9.992574`
energy, max cell
`9.714048 .. 10.355893`.

Endpoint random reducible controls:
`9.395653 .. 9.652045`
energy, max cell
`9.622355 .. 10.080817`.

Strongest endpoint cells:

- t^3 + 2*t | 2*t^3 + t: -1.003283
- t^4 + 2*t^2 | t^4 + t^3 + 2*t^2 + 2*t: -0.636514
- t^4 + 2*t^2 | t^4 + 2*t^3 + 2*t^2 + t: -0.636514
- t^4 + t^3 + 2*t^2 + 2*t | t^4 + 2*t^3 + 2*t^2 + t: -0.636514
- t^3 + 2*t | t^4 + 2*t^2: -0.269745
- t^3 + 2*t | t^4 + t^3 + 2*t^2 + 2*t: -0.269745
- t^3 + 2*t | t^4 + 2*t^3 + 2*t^2 + t: -0.269745
- 2*t^3 + t | t^4 + 2*t^2: -0.269745


SVG: `logs/playground-artifacts/additive-triple-constellation-audit-500000.svg`
JSON: `logs/playground-artifacts/additive-triple-constellation-audit-500000.json`
