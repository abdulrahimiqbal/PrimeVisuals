# CA-XA divisor-frontier occupancy audit

Candidate:
count frontiers occupied by `CA ∩ XA` records and test whether `(occupied-Li)/sqrt(Li)` is a divisor-world critical line.

Source: `logs/divisor-extremes-artifacts/ca-xa-transitions.json`.
Frontier range: 113..2719.

## Occupancy decomposition

| Y | primes in range | occupied frontiers | skipped | Li main | prime residual | occupancy Q | skipped/sqrt(Li) | identity error |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 151 | 7 | 6 | 1 | 7.790245 | -0.283130 | -0.641412 | 0.358282 | 1.110e-16 |
| 200 | 17 | 16 | 1 | 17.280668 | -0.067517 | -0.308075 | 0.240558 | -5.551e-17 |
| 300 | 33 | 32 | 1 | 35.422111 | -0.406965 | -0.574986 | 0.168021 | 0.000e+0 |
| 500 | 66 | 65 | 1 | 68.882369 | -0.347293 | -0.467781 | 0.120489 | 0.000e+0 |
| 800 | 110 | 109 | 1 | 115.285180 | -0.492236 | -0.585371 | 0.093135 | 0.000e+0 |
| 1000 | 139 | 138 | 1 | 144.698154 | -0.473699 | -0.556831 | 0.083132 | 0.000e+0 |
| 1439 | 199 | 193 | 6 | 206.536143 | -0.524386 | -0.941883 | 0.417497 | 0.000e+0 |
| 1500 | 210 | 204 | 6 | 214.900803 | -0.334309 | -0.743600 | 0.409291 | 0.000e+0 |
| 2000 | 274 | 268 | 6 | 281.897743 | -0.470389 | -0.827749 | 0.357360 | -1.110e-16 |
| 2677 | 359 | 348 | 11 | 369.220583 | -0.531903 | -1.104369 | 0.572466 | 2.220e-16 |
| 2719 | 368 | 357 | 11 | 374.536868 | -0.337771 | -0.906160 | 0.568389 | 0.000e+0 |

Exponent fits: `abs(Q) theta=0.273798`, `abs(pi residual) theta=0.334563`, `skip correction theta=0.275399`.

Endpoint: occupied 357 of 368 prime frontiers, skipped 11.
Endpoint decomposition: Q=-0.906160, prime residual=-0.337771, skipped/sqrt(Li)=0.568389.

## Fixed-shape fake-base controls

| group | skipped/Li | skipped total | max skipped | frontier changes | nonzero skips | closure failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| real CA-XA | 0.029370 | 11 | 5 | 356 | 3 | 0 |
| seed 12345 | 0.762531 | 6 | 6 | 1 | 1 | 0 |
| seed 271828 | 0.155274 | 19 | 6 | 98 | 5 | 0 |
| seed 314159 | 0.242260 | 49 | 24 | 164 | 5 | 344 |
| seed 161803 | 0.532715 | 7 | 6 | 5 | 2 | 0 |
| seed 424242 | 0.378592 | 146 | 37 | 245 | 10 | 1 |

Fake skipped/Li range: 0.155274..0.762531; real=0.029370.

## Factor check

The candidate line has an exact decomposition:

`(occupied-Li)/sqrt(Li) = (pi-Li)/sqrt(Li) - skipped/sqrt(Li)`.

Thus the apparent line is prime-count residual plus a small finite skipped-frontier correction. That is a relabeling unless a new theorem bounds skipped frontiers uniformly.

SVG: `logs/playground-artifacts/caxa-frontier-occupancy-audit.svg`
JSON: `logs/playground-artifacts/caxa-frontier-occupancy-audit.json`