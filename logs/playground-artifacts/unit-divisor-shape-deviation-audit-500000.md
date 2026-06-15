# unlabeled unit-divisor shape deviation audit

Candidate:
score the bucket-standardized aggregate deviation of the normalized
log-divisor / degree-divisor cloud width of p-1 or f-1, using only unlabeled
factorization shape.

## Integer side

Abs aggregate theta: `0.468433`; rmsZ
theta: `0.005881`.

| N | labels | real aggregateZ | real absAggregateZ | real rmsZ | real meanShape | Cramer abs range | odd-composite abs range | bucket-composite abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17983 | 7.232662 | 7.232662 | 1.066899 | 1.146786 | 9.229465..9.788780 | 0.796858..1.761440 | 0.125364..2.783936 |
| 200000 | 17983 | 7.232662 | 7.232662 | 1.066899 | 1.146786 | 9.229465..9.788780 | 0.796858..1.761440 | 0.125364..2.783936 |
| 200000 | 17983 | 7.232662 | 7.232662 | 1.066899 | 1.146786 | 9.229465..9.788780 | 0.796858..1.761440 | 0.125364..2.783936 |
| 250000 | 22043 | 7.896873 | 7.896873 | 1.069954 | 1.146821 | 9.743561..10.788407 | 1.067048..2.890861 | 0.190317..2.569644 |
| 500000 | 41537 | 10.704937 | 10.704937 | 1.072178 | 1.148797 | 13.154124..14.606754 | 1.659049..2.881828 | 1.093878..3.871217 |

Endpoint top buckets:
- 3:13: n=1960, aggregateZ=5.429565, meanZ=0.122641
- 3:12: n=2066, aggregateZ=4.635882, meanZ=0.101992
- 3:14: n=1739, aggregateZ=4.358473, meanZ=0.104516
- 3:11: n=2047, aggregateZ=4.292330, meanZ=0.094871
- 3:10: n=1875, aggregateZ=4.145401, meanZ=0.095734
- 3:15: n=1045, aggregateZ=3.881848, meanZ=0.120083
- 3:6: n=544, aggregateZ=2.890498, meanZ=0.123929
- 4:9: n=2058, aggregateZ=2.805734, meanZ=0.061848

## Function fields

F_2[t]

| degree | labels | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range | bucket-reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 9 | 56 | -3.185760 | 3.185760 | 1.005600 | 0.026455..2.001390 | 0.225708..1.540469 | 0.240902..1.602189 |
| 10 | 99 | -3.978733 | 3.978733 | 1.010854 | 0.206360..1.164381 | 0.330925..1.161820 | 0.006385..1.798334 |
| 11 | 186 | -6.700250 | 6.700250 | 0.936694 | 0.061730..0.694218 | 0.166162..0.816845 | 0.074801..2.172590 |
| 12 | 335 | -8.125344 | 8.125344 | 1.044322 | 0.021576..1.035461 | 0.059968..1.697539 | 0.574274..2.504803 |

Endpoint F_2[t] top buckets:
- 3:6: n=16, aggregateZ=-5.685786, meanZ=-1.421446
- 3:7: n=20, aggregateZ=-5.602358, meanZ=-1.252725
- 3:9: n=28, aggregateZ=-5.291503, meanZ=-1.000000
- 3:8: n=18, aggregateZ=-4.504247, meanZ=-1.061661
- 3:5: n=8, aggregateZ=-3.298800, meanZ=-1.166302
- 4:3: n=20, aggregateZ=-2.071718, meanZ=-0.463250
- 4:5: n=46, aggregateZ=-1.972945, meanZ=-0.290895
- 5:4: n=8, aggregateZ=-1.928637, meanZ=-0.681876


F_3[t]

| degree | labels | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range | bucket-reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | 48 | -1.299038 | 1.299038 | 0.707107 | 0.059787..0.654648 | 0.059787..1.172212 | 0.042276..1.323803 |
| 6 | 116 | -0.323644 | 0.323644 | 0.738599 | 0.076374..0.966854 | 0.060587..0.372076 | 0.768954..2.421865 |
| 7 | 312 | -2.775239 | 2.775239 | 0.819098 | 0.162517..0.952103 | 0.280882..1.103209 | 0.036238..1.100666 |
| 8 | 810 | -4.747714 | 4.747714 | 0.916427 | 0.056327..1.133386 | 0.014604..1.272608 | 0.448307..2.338733 |

Endpoint F_3[t] top buckets:
- 2:5: n=54, aggregateZ=-4.666667, meanZ=-0.635053
- 3:5: n=90, aggregateZ=-3.872983, meanZ=-0.408248
- 3:3: n=48, aggregateZ=-3.674659, meanZ=-0.530391
- 4:3: n=90, aggregateZ=-2.885962, meanZ=-0.304207
- 4:4: n=60, aggregateZ=-2.683282, meanZ=-0.346410
- 2:2: n=9, aggregateZ=-2.404407, meanZ=-0.801469
- 3:2: n=21, aggregateZ=2.042253, meanZ=0.445656
- 5:2: n=6, aggregateZ=-1.414214, meanZ=-0.577350

SVG: `logs/playground-artifacts/unit-divisor-shape-deviation-audit-500000.svg`
JSON: `logs/playground-artifacts/unit-divisor-shape-deviation-audit-500000.json`
