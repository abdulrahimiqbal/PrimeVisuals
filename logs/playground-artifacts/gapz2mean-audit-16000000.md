# gapz2mean audit

Candidate: `gapz2mean(x)=mean((gap(p)/log(p)-1)^2)`.

Preregistered confirmation: stable flat real line whose value/trend differs
materially from five W=210 fake-label controls, with composite-only controls
failing.

Preregistered break: ordinary Cramer or W=210 fake labels reproduce the line
and drift; then it is a density/null gap-moment calibration.

## Real primes

| N | gaps | mean | se | z from 1 | mean raw gap |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78497 | 0.63684562 | 0.00577306 | -62.905 | 12.739 |
| 2000000 | 148932 | 0.65972915 | 0.00447362 | -76.062 | 13.429 |
| 4000000 | 283145 | 0.67364079 | 0.00328810 | -99.255 | 14.127 |
| 8000000 | 539776 | 0.68324628 | 0.00241030 | -131.417 | 14.821 |
| 16000000 | 1031129 | 0.69293530 | 0.00176765 | -173.713 | 15.517 |

Real log-range trend slope: `0.01957686`.

## Control summary at N=16000000

| group | mean range | se range | log-trend slope range | z-from-1 range |
| --- | ---: | ---: | ---: | ---: |
| ordinary Cramer | 0.80285184 .. 0.80897533 | 0.00221124 .. 0.00226904 | 0.00986179 .. 0.01560731 | -89.004 .. -84.187 |
| W=210 fake labels | 0.74060622 .. 0.74667723 | 0.00201704 .. 0.00204084 | 0.01405514 .. 0.01839082 | -128.601 .. -125.091 |
| W=210 composite-only | 1.71727648 .. 1.73234729 | 0.00593465 .. 0.00601779 | -0.15648567 .. -0.13506215 | 120.863 .. 123.341 |

## Primorial wheel ladder

| W | W/phi(W) | mean range at N=16000000 | log-trend slope range |
| ---: | ---: | ---: | ---: |
| 210 | 4.375000 | 0.74060622 .. 0.74667723 | 0.01405514 .. 0.01839082 |
| 2310 | 4.812500 | 0.72899849 .. 0.73443346 | 0.01601946 .. 0.01868338 |
| 30030 | 5.213542 | 0.71977950 .. 0.72520346 | 0.01538949 .. 0.01917254 |
| 510510 | 5.539388 | 0.71533131 .. 0.71957386 | 0.01715324 .. 0.01933034 |
| 9699690 | 5.847132 | 0.71095543 .. 0.71435455 | 0.01613070 .. 0.01904727 |

SVG: `logs/playground-artifacts/gapz2mean-audit-16000000.svg`
JSON: `logs/playground-artifacts/gapz2mean-audit-16000000.json`
