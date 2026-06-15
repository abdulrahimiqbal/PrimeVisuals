# unlabeled prime-pair difference roughness audit

Candidate:
sample unordered prime/irreducible pairs, reduce their difference to an
unlabeled roughness feature omega(diff), bucket by difference size/degree,
and aggregate z-scores against random odd/monic pair backgrounds.

## Integer side

Abs aggregate theta: `0.000000`; rmsZ
theta: `0.000000`.

| N | labels | pair samples | real aggregateZ | real absAggregateZ | real rmsZ | real mean omega | Cramer abs range | odd-random abs range | odd-composite abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17983 | 20000 | 33.518716 | 33.518716 | 1.045515 | 2.826450 | 21.803752..24.462880 | 0.326930..3.032737 | 1.318065..3.848016 |
| 200000 | 17983 | 20000 | 33.518716 | 33.518716 | 1.045515 | 2.826450 | 21.803752..24.462880 | 0.326930..3.032737 | 1.318065..3.848016 |
| 200000 | 17983 | 20000 | 33.518716 | 33.518716 | 1.045515 | 2.826450 | 21.803752..24.462880 | 0.326930..3.032737 | 1.318065..3.848016 |
| 250000 | 22043 | 20000 | 34.093534 | 34.093534 | 1.045027 | 2.855200 | 21.328185..23.595605 | 0.020702..1.528604 | 1.319952..3.083949 |
| 500000 | 41537 | 20000 | 32.960152 | 32.960152 | 1.048639 | 2.924150 | 20.213407..22.564921 | 0.175586..2.537461 | 0.099299..0.896995 |

Endpoint top buckets:
- 17: n=6292, aggregateZ=17.603200, meanZ=0.221920
- 18: n=4814, aggregateZ=16.448282, meanZ=0.237065
- 16: n=4074, aggregateZ=15.571438, meanZ=0.243960
- 14: n=1247, aggregateZ=10.015960, meanZ=0.283635
- 15: n=2306, aggregateZ=9.744374, meanZ=0.202920
- 13: n=651, aggregateZ=6.741596, meanZ=0.264224
- 10: n=67, aggregateZ=3.594087, meanZ=0.439088
- 11: n=162, aggregateZ=3.285657, meanZ=0.258146

## Function fields

F_2[t]

| degree | labels | samples | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 9 | 56 | 10000 | 110.687606 | 110.687606 | 1.310798 | 0.003679..0.630704 | 1.247299..3.262035 |
| 10 | 99 | 10000 | 112.059071 | 112.059071 | 1.318631 | 0.866378..1.492596 | 0.177741..2.260971 |
| 11 | 186 | 10000 | 110.529409 | 110.529409 | 1.297103 | 0.202647..1.857583 | 0.145544..1.616597 |
| 12 | 335 | 10000 | 108.536812 | 108.536812 | 1.288729 | 0.463827..1.856527 | 1.245764..2.509692 |

Endpoint F_2[t] top buckets:
- 11: n=5123, aggregateZ=76.747333, meanZ=1.072262
- 10: n=2432, aggregateZ=54.666457, meanZ=1.108509
- 9: n=1273, aggregateZ=39.833185, meanZ=1.116428
- 8: n=563, aggregateZ=25.191498, meanZ=1.061695
- 7: n=279, aggregateZ=19.004821, meanZ=1.137789
- 6: n=171, aggregateZ=13.817672, meanZ=1.056664
- 5: n=97, aggregateZ=7.910196, meanZ=0.803159
- 4: n=41, aggregateZ=6.554115, meanZ=1.023581


F_3[t]

| degree | labels | samples | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | 48 | 10000 | 49.340537 | 49.340537 | 1.097275 | 0.044209..1.467585 | 3.828309..5.143477 |
| 6 | 116 | 10000 | 51.450124 | 51.450124 | 1.127626 | 0.033792..1.400758 | 0.426480..2.149754 |
| 7 | 312 | 10000 | 49.749060 | 49.749060 | 1.134863 | 0.118728..1.664808 | 0.507213..1.617837 |
| 8 | 810 | 10000 | 51.484435 | 51.484435 | 1.142985 | 1.023133..3.168971 | 0.055669..2.181310 |

Endpoint F_3[t] top buckets:
- 7: n=6724, aggregateZ=40.605139, meanZ=0.495185
- 6: n=2169, aggregateZ=26.422284, meanZ=0.567336
- 5: n=751, aggregateZ=15.078537, meanZ=0.550224
- 4: n=254, aggregateZ=8.319350, meanZ=0.522002
- 2: n=26, aggregateZ=3.616447, meanZ=0.709244
- 3: n=68, aggregateZ=2.913179, meanZ=0.353275
- 1: n=7, aggregateZ=0.000000, meanZ=0.000000
- 0: n=1, aggregateZ=0.000000, meanZ=0.000000

SVG: `logs/playground-artifacts/pair-difference-roughness-audit-500000.svg`
JSON: `logs/playground-artifacts/pair-difference-roughness-audit-500000.json`
