# unlabeled unit-divisor shape deviation audit

Candidate:
score the bucket-standardized aggregate deviation of the normalized
log-divisor / degree-divisor cloud width of p-1 or f-1, using only unlabeled
factorization shape.

## Integer side

Abs aggregate theta: `0.465005`; rmsZ
theta: `0.003013`.

| N | labels | real aggregateZ | real absAggregateZ | real rmsZ | real meanShape | Cramer abs range | odd-composite abs range | bucket-composite abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17983 | 7.232662 | 7.232662 | 1.066899 | 1.146786 | 9.229465..9.788780 | 0.796858..1.761440 | 0.125364..2.783936 |
| 250000 | 22043 | 7.896873 | 7.896873 | 1.069954 | 1.146821 | 9.743561..10.788407 | 1.067048..2.890861 | 0.190317..2.569644 |
| 500000 | 41537 | 10.704937 | 10.704937 | 1.072178 | 1.148797 | 13.154124..14.606754 | 1.659049..2.881828 | 1.093878..3.871217 |
| 1000000 | 78497 | 14.218928 | 14.218928 | 1.074488 | 1.150274 | 18.194736..19.299949 | 1.994100..3.837229 | 1.992235..4.080342 |
| 2000000 | 148932 | 19.336872 | 19.336872 | 1.074065 | 1.152077 | 25.254219..26.308846 | 2.790164..3.311225 | 2.101716..4.406075 |

Endpoint top buckets:
- 3:14: n=6434, aggregateZ=10.011079, meanZ=0.124807
- 3:13: n=6134, aggregateZ=8.557215, meanZ=0.109260
- 3:15: n=6222, aggregateZ=8.031253, meanZ=0.101817
- 3:12: n=5769, aggregateZ=7.830466, meanZ=0.103095
- 3:16: n=5439, aggregateZ=7.474187, meanZ=0.101345
- 4:10: n=7374, aggregateZ=6.154035, meanZ=0.071665
- 3:17: n=3437, aggregateZ=5.979109, meanZ=0.101987
- 3:11: n=5331, aggregateZ=5.889904, meanZ=0.080668

## Function fields

F_2[t]

| degree | labels | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range | bucket-reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 2182 | -18.991917 | 18.991917 | 1.115910 | 0.002244..1.047776 | 0.267326..2.239316 | 1.216513..2.423977 |
| 16 | 4080 | -26.105265 | 26.105265 | 1.130703 | 0.361424..2.155483 | 1.427199..2.517188 | 1.978651..3.380685 |
| 17 | 7710 | -33.155576 | 33.155576 | 1.137753 | 0.062119..1.084017 | 0.223065..3.058651 | 2.243008..4.622240 |
| 18 | 14532 | -42.835211 | 42.835211 | 1.154804 | 0.094509..1.435941 | 1.435926..2.848445 | 2.384977..5.053695 |

Endpoint F_2[t] top buckets:
- 3:15: n=840, aggregateZ=-28.982753, meanZ=-1.000000
- 3:13: n=472, aggregateZ=-27.196644, meanZ=-1.251827
- 3:14: n=626, aggregateZ=-26.633190, meanZ=-1.064476
- 3:12: n=310, aggregateZ=-23.619932, meanZ=-1.341522
- 3:11: n=204, aggregateZ=-22.294181, meanZ=-1.560905
- 3:10: n=136, aggregateZ=-19.629967, meanZ=-1.683256
- 3:9: n=94, aggregateZ=-18.933458, meanZ=-1.952837
- 4:7: n=592, aggregateZ=-13.819419, meanZ=-0.567975


F_3[t]

| degree | labels | real aggregateZ | real absAggregateZ | real rmsZ | monic abs range | reducible abs range | bucket-reducible abs range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 312 | -2.775239 | 2.775239 | 0.819098 | 0.162517..0.952103 | 0.280882..1.103209 | 0.036238..1.100666 |
| 8 | 810 | -4.747714 | 4.747714 | 0.916427 | 0.056327..1.133386 | 0.014604..1.272608 | 0.448307..2.338733 |
| 9 | 2184 | -7.747010 | 7.747010 | 0.943151 | 0.011659..0.693880 | 0.167252..1.838288 | 0.206015..2.128991 |
| 10 | 5880 | -12.008416 | 12.008416 | 0.952593 | 0.019086..2.280800 | 0.235277..2.425790 | 0.549066..1.990738 |

Endpoint F_3[t] top buckets:
- 3:7: n=522, aggregateZ=-7.075943, meanZ=-0.309706
- 3:4: n=177, aggregateZ=-5.972226, meanZ=-0.448900
- 3:6: n=510, aggregateZ=-5.273466, meanZ=-0.233513
- 4:4: n=582, aggregateZ=-4.742936, meanZ=-0.196601
- 4:5: n=468, aggregateZ=-4.197622, meanZ=-0.194035
- 2:6: n=111, aggregateZ=-3.589035, meanZ=-0.340656
- 2:2: n=9, aggregateZ=3.483773, meanZ=1.161258
- 5:3: n=153, aggregateZ=-3.327991, meanZ=-0.269052

SVG: `logs/playground-artifacts/unit-divisor-shape-deviation-audit-2000000.svg`
JSON: `logs/playground-artifacts/unit-divisor-shape-deviation-audit-2000000.json`
