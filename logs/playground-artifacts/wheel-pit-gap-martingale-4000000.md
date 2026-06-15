# Wheel-PIT next-event martingale audit

For each consecutive event gap, compute the discrete mid-PIT score under the local wheel model `h_W(n)=W/(phi(W)log n)` on `gcd(n,W)=1` classes. Main wheel: `2310`.

## Main real endpoint trace

| N | scored count | sum | mean | Z | max abs Z | energy Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 21701 | 141.414661 | 0.006517 | 0.959963 | 0.982989 | 3.522592 |
| 500000 | 41195 | 252.810905 | 0.006137 | 1.245586 | 1.264706 | 4.538850 |
| 1000000 | 78155 | 455.094141 | 0.005823 | 1.627882 | 1.632110 | 5.890952 |
| 2000000 | 148590 | 696.782190 | 0.004689 | 1.807600 | 1.817506 | 6.506503 |
| 3000000 | 216473 | 1029.792169 | 0.004757 | 2.213338 | 2.229626 | 7.951769 |
| 4000000 | 282802 | 1251.924380 | 0.004427 | 2.354165 | 2.359392 | 8.440578 |

Main PIT summary:

- start after: 2311
- scored count: 282802
- skipped early pairs: 342
- impossible observed next events: 0
- value mean: 0.004427
- value mean abs: 0.244452
- value range: -0.341713..0.499989

## Wheel family on real primes

| W | start | scored | value mean | endpoint Z | max abs Z | theta max sum | same-W fake endpoint Z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 9 | 283141 | 0.022274 | 11.851953 | 11.852765 | 0.907195 | -0.474378..0.732102 |
| 30 | 44 | 283131 | 0.008435 | 4.488158 | 4.490107 | 0.885734 | -0.822892..0.246764 |
| 210 | 211 | 283099 | 0.005655 | 3.008644 | 3.011863 | 0.859238 | -0.468216..0.408232 |
| 2310 | 2311 | 282802 | 0.004427 | 2.354165 | 2.359392 | 0.839201 | -0.542396..0.514884 |

## Main control summary at full range

| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range | value mean range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| shuffle | 282802..282802 | 2.354165..2.354165 | 2.355564..2.397413 | 8.440578..8.440578 | 0.751445..1.308005 | 0.000000..0.000000 |
| bootstrap | 282802..282802 | 1.896709..2.816568 | 1.968705..2.896643 | 6.798384..10.097469 | 0.850752..1.258284 | 0.000000..0.000000 |
| signFlip | 282802..282802 | -0.615262..0.154825 | 0.462394..1.119343 | -2.205949..0.555108 | 0.145126..0.856269 | 0.000000..0.000000 |
| centeredShuffle | 282802..282802 | -0.000000..-0.000000 | 0.455639..0.865420 | -0.000000..-0.000000 | 0.147450..0.679197 | 0.000000..0.000000 |
| sameWheel | 282309..284012 | -0.542396..0.514884 | 0.412957..0.986279 | -1.938831..1.836360 | 0.044742..0.895450 | -0.001018..0.000969 |

Final holdout block:

- real final block: count 66329, Z 0.862501.
- shuffle: count 66329..66329, Z 0.934913..1.494045.
- bootstrap: count 66329..66329, Z 0.608124..1.409584.
- signFlip: count 66329..66329, Z -0.533482..0.491864.
- centeredShuffle: count 66329..66329, Z -0.305908..0.566685.
- sameWheel: count 66127..66621, Z -0.229444..0.602745.

Named composite checks:

| n | consecutive-prime event? | reason |
| ---: | --- | --- |
| 25 | no | the statistic is scored on a consecutive prime/event pair x_i<x_{i+1}; this composite is not a prime event label |
| 35 | no | the statistic is scored on a consecutive prime/event pair x_i<x_{i+1}; this composite is not a prime event label |
| 77 | no | the statistic is scored on a consecutive prime/event pair x_i<x_{i+1}; this composite is not a prime event label |
| 289 | no | the statistic is scored on a consecutive prime/event pair x_i<x_{i+1}; this composite is not a prime event label |

Factor check:

This is not a raw gap sum, not the `Li-pi` hazard telescope, and not a rolling empirical center. It is a discrete PIT against an explicit local next-event distribution. A survivor must beat same-wheel fake labels and residual order controls.

Break verdict at N=4000000: real W2310 endpoint Z 2.354165, max abs Z 2.359392.

SVG: `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.svg`
JSON: `logs/playground-artifacts/wheel-pit-gap-martingale-4000000.json`