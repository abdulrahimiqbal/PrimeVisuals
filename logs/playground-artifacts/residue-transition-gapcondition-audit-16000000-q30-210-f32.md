# gap-conditioned transition compatibility quotient audit

Candidate:
repair the row-shuffle transition null by conditioning on the actual gap
residue. Since `b = a + gap mod W`, the exact compatibility quotient should
have no remaining next-residue degree of freedom.

Columns:

- first-order aggregate: `P(b|a)` versus row-shuffled `b`
- gap aggregate: `P(b|a,gap mod W)` versus row-shuffled `b`
- exact quotient: compatibility violations of `b=a+gap mod W`

Smoothing: `0.5`.

## Integer paths

### modulus 30

Reduced residue states: `8`.

| block | transitions | first-order aggregate | gap aggregate | compatibility violations | violation rate | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 34777 | 78.854328 | 1178.244947 | 0 | 0.000000 | 0.000000 |
| 2000000..4000000 | 66329 | 98.142654 | 1765.575178 | 0 | 0.000000 | 0.000000 |
| 4000000..8000000 | 126927 | 122.076770 | 2640.536732 | 0 | 0.000000 | 0.000000 |
| 8000000..16000000 | 243069 | 152.432674 | 3928.417333 | 0 | 0.000000 | 0.000000 |

Final controls:

- exact compatibility quotient: `0.000000`
- Cramer gap aggregate range: `2947.427139 .. 2954.236151`
- wheel gap aggregate range: `3931.844761 .. 3936.781169`
- composite gap aggregate range: `3217.040194 .. 3231.317817`

### modulus 210

Reduced residue states: `48`.

| block | transitions | first-order aggregate | gap aggregate | compatibility violations | violation rate | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 34777 | 773.762017 | 966.262123 | 0 | 0.000000 | 0.003422 |
| 2000000..4000000 | 66329 | 1147.625734 | 1481.848270 | 0 | 0.000000 | 0.001794 |
| 4000000..8000000 | 126927 | 1682.882174 | 2257.022802 | 0 | 0.000000 | 0.001379 |
| 8000000..16000000 | 243069 | 2432.408255 | 3412.883719 | 0 | 0.000000 | 0.000650 |

Final controls:

- exact compatibility quotient: `0.000000`
- Cramer gap aggregate range: `2026.780077 .. 2031.729051`
- wheel gap aggregate range: `3412.127804 .. 3418.374575`
- composite gap aggregate range: `2641.122297 .. 2653.201149`

## F_2[t] encoded-order path

Residue modulus: `t^3 + t + 1`; states: `7`.

| degree | transitions | first-order aggregate | gap aggregate | compatibility violations | unseen context rate | composite gap aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 21 | 36216 | 12.326504 | 1212.217081 | 0 | 0.000000 | 1215.791171 .. 1221.776619 |
| 22 | 69178 | 15.604672 | 1814.166333 | 0 | 0.000000 | 1830.265316 .. 1835.599288 |
| 23 | 132395 | 20.248055 | 2708.145417 | 0 | 0.000000 | 2739.862563 .. 2747.967864 |
| 24 | 253438 | 26.154260 | 4018.266465 | 0 | 0.000000 | 4078.467960 .. 4086.541771 |

## F_3[t] encoded-order path

Residue modulus: `t^2 + 1`; states: `8`.

| degree | transitions | first-order aggregate | gap aggregate | compatibility violations | unseen context rate | composite gap aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 12 | 16790 | 12.862346 | 729.873393 | 0 | 0.000000 | 714.869347 .. 720.570342 |
| 13 | 46533 | 17.943658 | 1401.621888 | 0 | 0.000000 | 1387.499336 .. 1395.220654 |
| 14 | 129309 | 27.471515 | 2654.291752 | 0 | 0.000000 | 2641.683832 .. 2649.749100 |
| 15 | 362973 | 41.119047 | 4975.697754 | 0 | 0.000000 | 4977.510850 .. 4981.610543 |

SVG: `logs/playground-artifacts/residue-transition-gapcondition-audit-16000000-q30-210-f32.svg`
JSON: `logs/playground-artifacts/residue-transition-gapcondition-audit-16000000-q30-210-f32.json`
