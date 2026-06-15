# Function-field constant-orbit companion residual audit

Finite-field object is defined first: aggregate constant shifts `f+c`, `c in F_q^*`, over monic irreducibles and subtract polynomial twin-prime predictions.

Integer transport uses shifts [2,4,6,8,10,12] with finite singular products through primes <= 447. Range: 200000.

## Integer endpoint trace

| N | centers | observed | expected | z | observed/center | expected/center |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 12500 | 1324 | 1692 | 1703.914382 | -0.330728 | 1.277946 | 1.286944 |
| 25000 | 2594 | 3103 | 3128.586716 | -0.519238 | 1.196222 | 1.206086 |
| 50000 | 4965 | 5568 | 5612.546324 | -0.669039 | 1.121450 | 1.130422 |
| 100000 | 9424 | 9883 | 9994.648522 | -1.246502 | 1.048705 | 1.060553 |
| 200000 | 17816 | 17614 | 17760.888786 | -1.221273 | 0.988662 | 0.996907 |

## Integer controls at endpoint

| control | z range | abs z range | theta range |
| --- | ---: | ---: | ---: |
| hlBernoulli | -1.661929..2.412062 | 0.057275..2.412062 | -0.370147..1.166318 |
| w30030 | 0.483800..5.016077 | 0.483800..5.016077 | 0.106150..1.829505 |
| cramer | 10.706338..16.398007 | 10.706338..16.398007 | 0.835188..1.418906 |
| composite | 4.603026..5.999145 | 4.603026..5.999145 | 0.817502..1.039144 |

## Function-field constant orbit

### F_3[t]

| degree | actual | predicted | cumulative z | per-degree z |
| ---: | ---: | ---: | ---: | ---: |
| 10 | 432 | 467.791581 | -1.654835 | -1.654835 |
| 11 | 1170 | 1159.813241 | -0.634669 | 0.299118 |
| 12 | 3012 | 2923.695420 | 0.929390 | 1.633116 |
| 13 | 7494 | 7473.587933 | 0.757918 | 0.236114 |
| 14 | 19020 | 19332.188904 | -1.293641 | -2.245313 |
Cumulative residual exponent: `0.458199`.

### F_5[t]

| degree | actual | predicted | cumulative z | per-degree z |
| ---: | ---: | ---: | ---: | ---: |
| 5 | 392 | 354.776701 | 1.976229 | 1.976229 |
| 6 | 1040 | 1231.850527 | -3.881937 | -5.466181 |
| 7 | 4560 | 4525.156928 | -1.532200 | 0.517964 |
| 8 | 17650 | 17322.860829 | 1.354520 | 2.485551 |
| 9 | 69060 | 68435.989504 | 2.742860 | 2.385336 |
Cumulative residual exponent: `0.472766`.

## Top integer shift cells

| shift | observed | expected | z |
| ---: | ---: | ---: | ---: |
| 2 | 2125 | 2131.306654 | -0.145706 |
| 4 | 2095 | 2131.306654 | -0.838812 |
| 6 | 4221 | 4262.613309 | -0.732065 |
| 8 | 2156 | 2131.306654 | 0.570503 |
| 10 | 2813 | 2841.742206 | -0.588745 |
| 12 | 4204 | 4262.613309 | -1.031131 |

## Named composite check

| n | is prime | hit count among n+h | hits |
| ---: | --- | ---: | --- |
| 25 | no | 3 | {"2":false,"4":true,"6":true,"8":false,"10":false,"12":true} |
| 35 | no | 4 | {"2":true,"4":false,"6":true,"8":true,"10":false,"12":true} |
| 77 | no | 3 | {"2":true,"4":false,"6":true,"8":false,"10":false,"12":true} |
| 121 | no | 2 | {"2":false,"4":false,"6":true,"8":false,"10":true,"12":false} |
| 169 | no | 3 | {"2":false,"4":true,"6":false,"8":false,"10":true,"12":true} |
| 289 | no | 1 | {"2":false,"4":true,"6":false,"8":false,"10":false,"12":false} |

## Factor check

A survivor must beat the integer HL Bernoulli controls after finite local products are fixed. If the integer real line sits inside those controls, the object is ordinary Hardy-Littlewood prime-pair noise, regardless of Cramer/W30030 behavior.

## Files

- JSON: `logs/playground-artifacts/function-field-constant-orbit-200000.json`
- SVG: `logs/playground-artifacts/function-field-constant-orbit-200000.svg`