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
| 125000 | 11734 | 1.221886 | 1.887849 | 30,42 -1.888 |
| 250000 | 22044 | 1.364981 | 2.618808 | 30,42 -2.619 |
| 500000 | 41538 | 1.061921 | 2.090680 | 30,42 -2.091 |
| 1000000 | 78498 | 0.923270 | 1.439254 | 18,24 -1.439 |

Integer exponent fits:
`energy theta=-0.156461`,
`max-cell theta=-0.097507`.

Endpoint controls at N=1000000:

| group | residual energy range | max abs cell range | energy theta range |
| --- | ---: | ---: | ---: |
| Cramer labels | 20.778708 .. 23.516556 | 30.929271 .. 35.898736 | 0.311991 .. 0.454012 |
| W=30030 fake labels | 1.887458 .. 3.980531 | 3.183820 .. 5.970478 | 0.199890 .. 0.425201 |
| W=30030 composite-only | 48.641918 .. 49.048532 | 58.272185 .. 59.074199 | 0.310704 .. 0.314552 |

Strongest real endpoint cells:

- 18,24: -1.439254
- 12,18: -1.420880
- 30,42: -1.342801
- 6,24: -1.308960
- 12,24: -1.234506
- 24,30: -0.979736
- 24,42: 0.801538
- 18,30: 0.676832

## Function-field side

### F_2[t]

| degree | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 5 | 6 | 1.189454 | 2.171185 | t^3 + t^2 | t^5 + t^4 + t^3 + t -2.171 |
| 6 | 9 | 0.788934 | 1.194353 | t^3 + t^2 | t^4 + t -1.194 |
| 7 | 18 | 0.407336 | 0.721472 | t^2 + t | t^4 + t -0.721 |
| 8 | 30 | 0.394400 | 0.840233 | t^2 + t | t^4 + t 0.840 |

Endpoint random monic controls:
`2.301125 .. 2.492951`
energy, max cell
`3.034323 .. 3.034323`.

Endpoint random reducible controls:
`2.268769 .. 2.492951`
energy, max cell
`3.034323 .. 3.034323`.

Strongest endpoint cells:

- t^2 + t | t^4 + t: 0.840233
- t^3 + t | t^5 + t^4 + t^3 + t: -0.747374
- t^2 + t | t^5 + t^4 + t^3 + t: -0.281302
- t^3 + t^2 | t^5 + t^4 + t^3 + t: 0.261304
- t^3 + t^2 | t^4 + t: -0.242820
- t^3 + t | t^4 + t: -0.242820
- t^2 + t | t^3 + t^2: 0.083578
- t^2 + t | t^3 + t: 0.083578

### F_3[t]

| degree | labels | residual energy | max abs cell | strongest cell |
| ---: | ---: | ---: | ---: | --- |
| 11 | 16104 | 0.744448 | 0.777337 | t^3 + 2*t | t^4 + 2*t^2 -0.777 |
| 12 | 44220 | 1.067365 | 1.992678 | t^3 + 2*t | 2*t^3 + t 1.993 |
| 13 | 122640 | 2.378466 | 4.209917 | t^3 + 2*t | 2*t^3 + t -4.210 |
| 14 | 341484 | 3.567285 | 9.438485 | t^3 + 2*t | 2*t^3 + t 9.438 |
| 15 | 956576 | 2.448606 | 4.586496 | t^3 + 2*t | 2*t^3 + t -4.586 |

Endpoint random monic controls:
`177.255338 .. 177.606248`
energy, max cell
`177.681463 .. 178.275478`.

Endpoint random reducible controls:
`176.441789 .. 176.869706`
energy, max cell
`176.805542 .. 178.003640`.

Strongest endpoint cells:

- t^3 + 2*t | 2*t^3 + t: -4.586496
- t^3 + 2*t | t^4 + 2*t^2: -2.079551
- t^3 + 2*t | t^4 + t^3 + 2*t^2 + 2*t: -2.079551
- t^3 + 2*t | t^4 + 2*t^3 + 2*t^2 + t: -2.079551
- 2*t^3 + t | t^4 + 2*t^2: -2.079551
- 2*t^3 + t | t^4 + t^3 + 2*t^2 + 2*t: -2.079551
- 2*t^3 + t | t^4 + 2*t^3 + 2*t^2 + t: -2.079551
- t^4 + 2*t^2 | t^4 + t^3 + 2*t^2 + 2*t: -2.079551


SVG: `logs/playground-artifacts/additive-triple-constellation-audit-1000000.svg`
JSON: `logs/playground-artifacts/additive-triple-constellation-audit-1000000.json`
