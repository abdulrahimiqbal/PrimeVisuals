# theta210res audit

Candidate:
`Theta210res(x)=sum_{2<=n<=x,gcd(n,210)=1}(isprime(n)*log(n)-210/phi(210))`.

Preregistered confirmation: tight sqrt-normalized flat band, raw exponent near
`1/2`, materially wider W=210 fake-label controls, composite controls fail.

Preregistered break: exact Chebyshev factor identity, or W=210 controls
reproduce residual width.

## Real primes and factor check

| N | value | value/sqrt(N) | maxAbs/sqrt(N) | identity error |
| ---: | ---: | ---: | ---: | ---: |
| 1000000 | -1514.922082 | -1.514922 | 1.606591 | 2.012e-9 |
| 2000000 | -1413.874970 | -0.999761 | 1.541108 | -1.829e-9 |
| 4000000 | -2674.355024 | -1.337178 | 1.617527 | 6.745e-8 |
| 8000000 | -2946.225816 | -1.041648 | 1.399992 | 1.146e-7 |
| 16000000 | -4278.582216 | -1.069646 | 1.580998 | -1.669e-7 |

Real exponent fit from endpoint maxAbs: `theta=0.481511`.
Maximum identity error at endpoints: `1.669023e-7`.

Exact identity checked:
`Theta210res(x)=theta(x)-sum_{p|210,p<=x}log(p)-(210/48)C_210(x)`.

## Control summary at N=16000000

| group | value/sqrt(N) range | maxAbs/sqrt(N) range | theta range |
| --- | ---: | ---: | ---: |
| ordinary Cramer | -1260.223196 .. -1252.563583 | 1252.569872 .. 1260.228209 | 0.996226 .. 1.003700 |
| W=210 fake labels | -2.190201 .. 9.126650 | 2.030669 .. 9.719652 | 0.289889 .. 0.774262 |
| W=210 composite-only | -1130.904287 .. -1120.105779 | 1120.111840 .. 1130.908844 | 0.925840 .. 0.931087 |

SVG: `logs/playground-artifacts/theta210res-audit-16000000.svg`
JSON: `logs/playground-artifacts/theta210res-audit-16000000.json`
