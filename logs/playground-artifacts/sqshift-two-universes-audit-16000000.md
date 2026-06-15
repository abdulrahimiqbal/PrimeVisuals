# Two-universes squarefree-shift audit

Candidate:
`SqShift_U = mean_{prime objects a in U} mu(a-1)^2 - A_U`.

Integer main term is the finite Artin product through primes `l<=sqrt(x)`.
Function-field main term is
`prod_{deg P<=floor(n/2)}(1-1/(|P|^2-|P|))`.

## Integer side

| N | labels | squarefree | finite product | mean | residual | residual/sqrt(labels) | binomial z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78498 | 29397 | 0.374003330406 | 0.37449362 | 38.487 | 0.137366 | 0.284 |
| 2000000 | 148933 | 55778 | 0.373988418651 | 0.37451740 | 78.783 | 0.204144 | 0.422 |
| 4000000 | 283146 | 105993 | 0.373977626866 | 0.37434045 | 102.731 | 0.193062 | 0.399 |
| 8000000 | 539777 | 202013 | 0.373970562284 | 0.37425270 | 152.292 | 0.207286 | 0.428 |
| 16000000 | 1031130 | 385704 | 0.373965934633 | 0.37405953 | 96.506 | 0.095038 | 0.196 |

Integer residual exponent versus labels:
`theta=0.387320`.

### Integer controls at N=16000000

| group | mean range | residual/sqrt(labels) range | binomial z range | theta range |
| --- | ---: | ---: | ---: | ---: |
| ordinary Cramer | 0.37925309 .. 0.38055166 | 5.370049 .. 6.686213 | 11.098 .. 13.819 | 0.943346 .. 1.107014 |
| W=210 fake labels | 0.37428438 .. 0.37525331 | 0.323551 .. 1.307084 | 0.669 .. 2.701 | 0.424057 .. 1.023305 |
| W=210 composite-only | 0.37424201 .. 0.37573187 | 0.237643 .. 1.518647 | 0.491 .. 3.139 | 0.157349 .. 1.000459 |

## Function-field side

### F_2[t]

| degree | labels | squarefree | finite product | mean | residual | residual/sqrt(labels) | binomial z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 20 | 52377 | 11303 | 0.216096945928 | 0.21580083 | -15.510 | -0.067769 | -0.165 |
| 21 | 99858 | 21552 | 0.216096945928 | 0.21582647 | -27.009 | -0.085470 | -0.208 |
| 22 | 190557 | 41195 | 0.216087358454 | 0.21618203 | 18.041 | 0.041329 | 0.100 |
| 23 | 364722 | 78840 | 0.216087358454 | 0.21616464 | 28.186 | 0.046672 | 0.113 |
| 24 | 698870 | 151134 | 0.216083042707 | 0.21625481 | 120.044 | 0.143596 | 0.349 |

Residual exponent versus labels:
`theta=0.639064`.

Final-degree controls:

| group | mean range | residual/sqrt(labels) range | binomial z range | theta range |
| --- | ---: | ---: | ---: | ---: |
| random monic labels | 0.49982555 .. 0.50158922 | 237.284072 .. 238.715266 | 576.532 .. 580.009 |  |
| random reducible labels | 0.51178033 .. 0.51278298 | 247.454641 .. 247.974160 | 601.243 .. 602.506 |  |

### F_3[t]

| degree | labels | squarefree | finite product | mean | residual | residual/sqrt(labels) | binomial z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 11 | 16104 | 8772 | 0.546663535523 | 0.54470939 | -31.470 | -0.247984 | -0.498 |
| 12 | 44220 | 24278 | 0.546544061872 | 0.54902759 | 109.822 | 0.522250 | 1.049 |
| 13 | 122640 | 66963 | 0.546544061872 | 0.54601272 | -65.164 | -0.186076 | -0.374 |
| 14 | 341484 | 186720 | 0.546508394861 | 0.54678989 | 96.127 | 0.164498 | 0.330 |
| 15 | 956576 | 522885 | 0.546508394861 | 0.54662149 | 108.186 | 0.110614 | 0.222 |

Residual exponent versus labels:
`theta=0.228272`.

Final-degree controls:

| group | mean range | residual/sqrt(labels) range | binomial z range | theta range |
| --- | ---: | ---: | ---: | ---: |
| random monic labels | 0.66627884 .. 0.66727826 | 117.248290 .. 118.216055 | 235.518 .. 237.462 |  |
| random reducible labels | 0.67447703 .. 0.67568251 | 125.258090 .. 126.352955 | 251.607 .. 253.806 |  |


SVG: `logs/playground-artifacts/sqshift-two-universes-audit-16000000.svg`
JSON: `logs/playground-artifacts/sqshift-two-universes-audit-16000000.json`
