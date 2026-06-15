# roughmiss audit

Candidate: `roughmiss(x) * log(x)^2 / x`, audited on dyadic windows as
`exceptions / integral dt/log^2(t)`.

Preregistered confirmation: stable real constant distinct from ordinary
Cramer and composite-permitting controls.

Preregistered break: known Gafni-Tao rough-gap law, or reproduction by
non-prime/wheel controls.

## Real primes

| window | gaps | exceptions | constant | exception rate | avg witnesses |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 70435 | 13590 | 2.739383 | 0.192944 | 1.567246 |
| 2000000..4000000 | 134213 | 24562 | 2.723211 | 0.183008 | 1.651882 |
| 4000000..8000000 | 256631 | 45211 | 2.745111 | 0.176171 | 1.736614 |
| 8000000..16000000 | 491353 | 82929 | 2.746621 | 0.168777 | 1.819507 |

Least-squares cumulative main constant: `2.736909`.
Residual exponent fit after subtracting that main term:
`theta=-0.010641`.

## Control ranges

### Cramer

| window | constant range | exception-rate range |
| --- | ---: | ---: |
| 1000000..2000000 | 2.087495..2.138694 | 0.147182..0.150725 |
| 2000000..4000000 | 2.115306..2.141139 | 0.142072..0.143503 |
| 4000000..8000000 | 2.111764..2.160156 | 0.135779..0.138235 |
| 8000000..16000000 | 2.144331..2.158904 | 0.131732..0.132509 |

### W=210 fake labels

| window | constant range | exception-rate range |
| --- | ---: | ---: |
| 1000000..2000000 | 2.721645..2.777078 | 0.191703..0.195255 |
| 2000000..4000000 | 2.730529..2.748379 | 0.183404..0.184784 |
| 4000000..8000000 | 2.722463..2.764237 | 0.174857..0.176627 |
| 8000000..16000000 | 2.736354..2.747184 | 0.168066..0.168608 |

### W=210 composite-only labels

| window | constant range | exception-rate range |
| --- | ---: | ---: |
| 1000000..2000000 | 1.295109..1.319500 | 0.130396..0.134120 |
| 2000000..4000000 | 1.335994..1.360386 | 0.127155..0.129429 |
| 4000000..8000000 | 1.393048..1.423771 | 0.124327..0.126635 |
| 8000000..16000000 | 1.441919..1.464673 | 0.121374..0.123034 |

## Last-window read

Real on `8000000..16000000`:
`2.746621`.

SVG: `logs/playground-artifacts/roughmiss-audit-16000000.svg`
JSON: `logs/playground-artifacts/roughmiss-audit-16000000.json`
