# sqtailgapcov audit

Candidate:
`sqtailgapcov(x)=mean(((mu(p-1)^2)-A_tail)*(gap(p)/log(p)-1))`, over labels
whose predecessor has no `2^2,3^2,5^2,7^2` divisor.

`A_tail=0.967772748847`, with Artin product
`0.373955838964` and small-square product
`0.386408730159`.

## Real primes

| N | clean labels | large-square failures | fail rate | mean covariance | z | fail-pass gap mean diff |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 30382 | 985 | 0.032421 | 0.00022568 | 0.278 | -0.007158 |
| 2000000 | 57621 | 1843 | 0.031985 | 0.00007725 | 0.131 | -0.002553 |
| 4000000 | 109518 | 3525 | 0.032186 | 0.00004417 | 0.102 | -0.001425 |
| 8000000 | 208720 | 6707 | 0.032134 | 0.00015441 | 0.489 | -0.004982 |
| 16000000 | 398620 | 12916 | 0.032402 | 0.00010325 | 0.444 | -0.003263 |

Real cumulative-sum exponent versus clean-label count:
`theta=0.865526`.

## Control summary at N=16000000

| group | mean range | z range | fail-rate range | gap mean diff range | theta range |
| --- | ---: | ---: | ---: | ---: | ---: |
| ordinary Cramer | -0.00036025 .. 0.00029908 | -1.482 .. 1.243 | 0.030036 .. 0.030630 | -0.010605 .. 0.011483 | 0.319270 .. 0.872898 |
| W=210 fake labels | -0.00065526 .. 0.00043164 | -2.741 .. 1.903 | 0.030326 .. 0.030606 | -0.014924 .. 0.021819 | 0.619510 .. 1.864463 |
| W=210 composite-only | 0.00048071 .. 0.00188835 | 1.114 .. 4.694 | 0.029393 .. 0.029820 | -0.027621 .. 0.017027 | 0.681427 .. 1.019753 |

SVG: `logs/playground-artifacts/sqtailgapcov-audit-16000000.svg`
JSON: `logs/playground-artifacts/sqtailgapcov-audit-16000000.json`
