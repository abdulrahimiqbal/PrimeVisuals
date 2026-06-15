# Primorial recovery-debt rank audit

Modulus W=30030, phi(W)=5760. Rank counts W-coprime candidates between consecutive labels. Main term is geometric with q(n)=W/(phi(W)log n).

Range: 200000. Seeds: 12345, 271828, 314159, 161803, 424242, 8675309, 112358, 141421, 173205, 223606, 99991, 100003, 444444, 555555, 777777.

## Endpoint trace

| N | pairs | real z | real rank mean | expected rank mean | W30030 fake z | W210 fake z | Cramer z | composite z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12500 | 1324 | 0.547955 | 1.666163 | 1.650447 | -1.392395..2.532538 | 8.376090..13.130800 | 28.515742..36.416357 | 29.490614..31.766496 |
| 25000 | 2594 | 0.483756 | 1.775251 | 1.764133 | -2.452990..3.151112 | 11.995755..16.680984 | 40.006844..47.025427 | 27.883493..31.093485 |
| 50000 | 4965 | 0.505967 | 1.893656 | 1.884309 | -1.582500..3.658417 | 16.007477..20.317381 | 53.300594..59.286222 | 22.976114..24.546640 |
| 100000 | 9424 | 0.372667 | 2.014962 | 2.009450 | -1.522437..2.327236 | 21.854662..25.991621 | 71.094401..81.186682 | 13.282119..14.790438 |
| 200000 | 17815 | 0.402380 | 2.142464 | 2.137727 | -1.921088..1.318390 | 30.148847..33.103384 | 96.862278..106.036198 | -2.288251..-2.160863 |

## Absolute z and exponent summary

| family | endpoint abs z range | theta range | endpoint rank mean range |
| --- | ---: | ---: | ---: |
| w30030 | 0.001154..1.921088 | -1.330756..2.018510 | 2.115267..2.155906 |
| w210 | 30.148847..33.103384 | 0.925843..1.078729 | 2.522136..2.566088 |
| cramer | 96.862278..106.036198 | 1.000388..1.053197 | 3.616201..3.804445 |
| composite | 2.160863..2.288251 | -0.168960..-0.143495 | 2.142464..2.142520 |
| real | 0.402380 | 0.488856 | 2.142464 |

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

- JSON: `logs/playground-artifacts/primorial-recovery-debt-200000.json`
- SVG: `logs/playground-artifacts/primorial-recovery-debt-200000.svg`