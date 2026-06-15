# Primorial recovery-debt rank audit

Modulus W=30030, phi(W)=5760. Rank counts W-coprime candidates between consecutive labels. Main term is geometric with q(n)=W/(phi(W)log n).

Range: 8000000. Seeds: 12345, 271828, 314159, 161803, 424242, 8675309, 112358, 141421, 173205, 223606, 99991, 100003, 444444, 555555, 777777.

## Endpoint trace

| N | pairs | real z | real rank mean | expected rank mean | W30030 fake z | W210 fake z | Cramer z | composite z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41370 | 0.342749 | 2.313561 | 2.310609 | -2.046492..0.777222 | 44.656928..47.890462 | 147.614459..153.404869 | 86.733828..89.737981 |
| 1000000 | 78330 | 0.535475 | 2.446279 | 2.442666 | -1.696263..1.230989 | 61.611854..64.466282 | 200.326367..204.903909 | 82.675746..85.559889 |
| 2000000 | 148765 | 0.336641 | 2.577387 | 2.575620 | -2.120695..1.531251 | 83.572231..86.747354 | 271.595121..276.545998 | 70.350546..73.685632 |
| 4000000 | 282978 | 0.444473 | 2.710624 | 2.708818 | -2.016103..0.911827 | 115.122515..118.548832 | 370.418918..374.981815 | 42.928556..45.329076 |
| 8000000 | 539608 | 0.330247 | 2.843308 | 2.842276 | -2.752731..1.580178 | 156.305434..161.196521 | 506.629035..510.030011 | -7.062751..-6.934205 |

## Absolute z and exponent summary

| family | endpoint abs z range | theta range | endpoint rank mean range |
| --- | ---: | ---: | ---: |
| w30030 | 0.034989..2.752731 | -0.077180..1.436764 | 2.833505..2.846717 |
| w210 | 156.305434..161.196521 | 0.995751..1.021286 | 3.374733..3.392490 |
| cramer | 506.629035..510.030011 | 0.996268..1.004971 | 4.927947..4.946909 |
| composite | 6.934205..7.062751 | -0.210324..-0.198397 | 2.843281..2.843314 |
| real | 0.330247 | 0.523367 | 2.843308 |

## Named center check

| n | is prime | W-eligible | next prime | rank to next prime | expected rank |
| ---: | --- | --- | ---: | ---: | ---: |
| 25 | no | no | 29 | NA | NA |
| 35 | no | no | 37 | NA | NA |
| 77 | no | no | 79 | NA | NA |
| 289 | no | yes | 293 | 1 | 1.324964 |

## Factor check

This object is a normalized prime-gap statistic in W-coprime candidate coordinates. A survivor must beat the W30030 fake process; otherwise the line is only the geometric waiting-time law after local factors are installed.

## Files

- JSON: `logs/playground-artifacts/primorial-recovery-debt-8000000.json`
- SVG: `logs/playground-artifacts/primorial-recovery-debt-8000000.svg`