# Function-field constant-orbit companion residual audit

Finite-field object is defined first: aggregate constant shifts `f+c`, `c in F_q^*`, over monic irreducibles and subtract polynomial twin-prime predictions.

Integer transport uses shifts [2,4,6,8,10,12] with finite singular products through primes <= 2828. Range: 8000000.

## Integer endpoint trace

| N | centers | observed | expected | z | observed/center | expected/center |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41370 | 37897 | 38126.313203 | -1.290182 | 0.916050 | 0.921593 |
| 1000000 | 78330 | 67944 | 68244.493947 | -1.256519 | 0.867407 | 0.871243 |
| 2000000 | 148765 | 122752 | 122837.025817 | -0.263658 | 0.825140 | 0.825712 |
| 4000000 | 282978 | 221910 | 222017.704698 | -0.247294 | 0.784195 | 0.784576 |
| 8000000 | 539609 | 403015 | 403224.205408 | -0.354968 | 0.746865 | 0.747253 |

## Integer controls at endpoint

| control | z range | abs z range | theta range |
| --- | ---: | ---: | ---: |
| hlBernoulli | -1.026879..2.176576 | 0.130998..2.176576 | -0.192325..0.978061 |
| w30030 | 10.904731..13.740834 | 10.904731..13.740834 | 0.852852..1.257694 |
| cramer | 60.552366..65.365508 | 60.552366..65.365508 | 0.955565..1.037229 |
| composite | 17.489400..19.161663 | 17.489400..19.161663 | 0.859555..0.984648 |

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
| 2 | 48583 | 48386.904649 | 0.934698 |
| 4 | 48247 | 48386.904649 | -0.666862 |
| 6 | 96631 | 96773.809298 | -0.507186 |
| 8 | 48357 | 48386.904649 | -0.142542 |
| 10 | 64372 | 64515.872865 | -0.603986 |
| 12 | 96825 | 96773.809298 | 0.181803 |

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

- JSON: `logs/playground-artifacts/function-field-constant-orbit-8000000.json`
- SVG: `logs/playground-artifacts/function-field-constant-orbit-8000000.svg`