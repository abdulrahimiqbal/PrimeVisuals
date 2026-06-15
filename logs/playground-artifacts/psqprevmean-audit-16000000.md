# psqprevmean audit

Candidate: `psqprevmean(x)=mean_{p<=x} mu(p-1)^2`.

Artin/local-congruence product used as main term:
`0.373955838964`.

Preregistered confirmation: stable flat line whose count residual relative to
`A*pi(x)` is materially smaller than five Cramer and W=210 fake/composite
controls.

Preregistered break: flat line explained by local congruence Euler product and
reproduced by fake labels or composite controls.

## Real primes

| N | labels | squarefree | mean | residual vs A*labels | residual/sqrt(labels) |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78498 | 29397 | 0.37449362 | 42.215 | 0.150672 |
| 2000000 | 148933 | 55778 | 0.37451740 | 83.635 | 0.216717 |
| 4000000 | 283146 | 105993 | 0.37434045 | 108.900 | 0.204655 |
| 8000000 | 539777 | 202013 | 0.37425270 | 160.239 | 0.218103 |
| 16000000 | 1031130 | 385704 | 0.37405953 | 106.916 | 0.105289 |

Real endpoint max-residual exponent: `theta=0.478687`.

## Control summary at N=16000000

| group | mean range | residual/sqrt(labels) range | max residual/sqrt(labels) range | theta range |
| --- | ---: | ---: | ---: | ---: |
| ordinary Cramer | 0.37925309 .. 0.38055166 | 5.380302 .. 6.696463 | 5.380302 .. 6.696463 | 0.874052 .. 1.026554 |
| W=210 fake labels | 0.37428438 .. 0.37525331 | 0.333809 .. 1.317334 | 0.433617 .. 1.317334 | 0.512762 .. 0.937705 |
| W=210 composite-only | 0.37424201 .. 0.37573187 | 0.246333 .. 1.527329 | 0.246333 .. 1.527329 | 0.231962 .. 0.729805 |

SVG: `logs/playground-artifacts/psqprevmean-audit-16000000.svg`
JSON: `logs/playground-artifacts/psqprevmean-audit-16000000.json`
