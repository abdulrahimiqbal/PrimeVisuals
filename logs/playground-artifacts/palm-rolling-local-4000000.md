# Rolling local Palm gap-law residual audit

For each event gap, score `U_i=exp(-int dt/log(t))-1/2` against only the previous `8192` event gaps. If the current gap width has at least `12` previous samples in the window, use that bucket mean/sd; otherwise use the whole previous window.

## Real endpoint trace

| N | scored count | sum | mean | Z | max abs Z | energy Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 13851 | 19956.454553 | 1.440795 | 169.567580 | 169.567580 | 114.544366 |
| 500000 | 33345 | 51474.396710 | 1.543692 | 281.887556 | 281.887556 | 178.549336 |
| 1000000 | 70305 | 112930.889061 | 1.606300 | 425.911769 | 425.911769 | 259.717299 |
| 2000000 | 140740 | 231557.517631 | 1.645286 | 617.234385 | 617.234385 | 367.759192 |
| 3000000 | 208623 | 346519.157361 | 1.660983 | 758.658200 | 758.658200 | 447.916058 |
| 4000000 | 274952 | 459049.608500 | 1.669563 | 875.449663 | 875.449663 | 514.211438 |

Rolling-null summary:

- record count before burn-in: 283144
- scored count: 274952
- burn-in records: 8192
- gap-scoped scores: 272699
- window-fallback scores: 2253
- distinct gap-scoped widths: 34
- residual mean: 1.669563
- residual mean abs: 1.699751
- residual range: -1.933132..3.581397
- local sd range: 0.000032..0.249536

## Control summary at full range

| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range | residual mean range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| shuffle | 274952..274952 | 875.449663..875.449663 | 875.449663..875.451637 | 514.211438..514.211438 | 0.999328..1.001392 | 0.000000..0.000000 |
| bootstrap | 274952..274952 | 875.032875..875.684014 | 875.032875..875.684014 | 513.986970..514.438127 | 0.999506..1.000384 | 0.000000..0.000000 |
| signFlip | 274952..274952 | -2.932719..1.453917 | 2.109084..6.327356 | -1.722586..0.853985 | 0.110090..0.723636 | 0.000000..0.000000 |
| centeredShuffle | 274952..274952 | -0.000000..-0.000000 | 0.444789..1.354605 | -0.000000..-0.000000 | 0.133215..0.547695 | 0.000000..0.000000 |
| cramerLabel | 274431..276541 | 872.212597..875.116810 | 872.212597..875.116810 | 512.202900..513.792723 | 1.046536..1.049467 | 1.663634..1.665782 |
| wheel210 | 274536..275719 | 873.758523..875.790681 | 873.758523..875.790681 | 513.091782..514.380075 | 1.046641..1.049908 | 1.667007..1.668532 |
| wheel2310 | 274519..275736 | 873.746996..876.232549 | 873.746996..876.232549 | 513.151654..514.613068 | 1.047194..1.048689 | 1.667629..1.669403 |

Final holdout block:

- real final block: count 66329, Z 436.936510.
- shuffle: count 66329..66329, Z 429.482938..430.617060.
- bootstrap: count 66329..66329, Z 429.540663..430.343003.
- signFlip: count 66329..66329, Z -2.475801..1.351286.
- centeredShuffle: count 66329..66329, Z -0.355565..0.488164.
- cramerLabel: count 66117..66777, Z 435.083514..437.285870.
- wheel210: count 66155..66665, Z 435.154444..437.508519.
- wheel2310: count 66092..66890, Z 435.251796..438.845461.

Window-size stability:

| K | scored | gap-scoped | fallback | residual mean | endpoint Z | max abs Z | theta max sum |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 4096 | 279048 | 274422 | 4626 | 1.659930 | 876.858073 | 876.858073 | 1.026023 |
| 8192 | 274952 | 272699 | 2253 | 1.669563 | 875.449663 | 875.449663 | 1.048159 |
| 16384 | 266760 | 265642 | 1118 | 1.654415 | 854.485760 | 854.485760 | 1.074545 |

Named composite checks:

| n | prime-gap event? | reason |
| ---: | --- | --- |
| 25 | no | the statistic is indexed by a consecutive-prime left endpoint x_i; this composite is not an event label |
| 35 | no | the statistic is indexed by a consecutive-prime left endpoint x_i; this composite is not an event label |
| 77 | no | the statistic is indexed by a consecutive-prime left endpoint x_i; this composite is not an event label |
| 289 | no | the statistic is indexed by a consecutive-prime left endpoint x_i; this composite is not an event label |

Factor check:

The raw hazard telescope is not used, and the one-point Palm gap distribution is centered by a rolling past-only null. Any survivor must therefore beat residual order controls and the same rolling protocol on fake event labels.

Break verdict at N=4000000: real endpoint Z 875.449663, max abs Z 875.449663.

SVG: `logs/playground-artifacts/palm-rolling-local-4000000.svg`
JSON: `logs/playground-artifacts/palm-rolling-local-4000000.json`