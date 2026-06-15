# sqrt phase residual audit

Candidate:
`sqrtphaseres(x)=sum_{p<=x} cos(2*pi*sqrt(p)) - integral_2^x cos(2*pi*sqrt(t))/log(t) dt`.

The integral is approximated by midpoint intervals, matching the lab primitive.

Endpoint max-residual exponent fit: `0.592007`.

## Real primes

| N | labels | phase sum | density main | residual | residual/sqrt(labels) | maxAbs residual/sqrt(labels) |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78498 | -83.600 | -0.394 | -83.206 | -0.296977 | 0.296977 |
| 2000000 | 148933 | -95.203 | 29.821 | -125.024 | -0.323965 | 0.323965 |
| 4000000 | 283146 | -374.625 | -0.394 | -374.230 | -0.703289 | 0.703289 |
| 8000000 | 539777 | -320.723 | 24.639 | -345.362 | -0.470075 | 0.509368 |
| 16000000 | 1031130 | -184.200 | -0.395 | -183.805 | -0.181009 | 0.368538 |

## Real dyadic blocks

| block | labels | phase sum | density main | residual | residual/sqrt(labels) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1..1000000 | 78498 | -83.600 | -0.394 | -83.206 | -0.296977 |
| 1000000..2000000 | 70435 | -11.604 | 30.215 | -41.818 | -0.157570 |
| 2000000..4000000 | 134213 | -279.421 | -30.215 | -249.206 | -0.680239 |
| 4000000..8000000 | 256631 | 53.902 | 25.033 | 28.868 | 0.056986 |
| 8000000..16000000 | 491353 | 136.523 | -25.034 | 161.557 | 0.230478 |

## Control summary at N=16000000

| group | residual range | residual/sqrt(labels) range | maxAbs residual/sqrt(labels) range |
| --- | ---: | ---: | ---: |
| ordinary Cramer | -263.285 .. 935.711 | -0.259221 .. 0.921647 | 0.124868 .. 0.921647 |
| W=210 fake labels | -305.594 .. 206.617 | -0.300911 .. 0.203207 | 0.145326 .. 0.416172 |
| W=210 composite-only | -1185.882 .. 604.261 | -1.380295 .. 0.701992 | 0.304359 .. 1.380295 |

SVG: `logs/playground-artifacts/sqrtphase-audit-16000000.svg`
JSON: `logs/playground-artifacts/sqrtphase-audit-16000000.json`
