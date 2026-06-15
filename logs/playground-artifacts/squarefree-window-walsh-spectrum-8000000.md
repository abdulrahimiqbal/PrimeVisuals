# Prime-centered squarefree window Walsh spectrum audit

State shifts: [-30,-22,-14,-6,6,14,22,30]. Features: 36 one/two-coordinate Walsh products. Main metric subtracts the mean of 15 local-residue matched composite baselines.

Range: 8000000. Seeds: 12345, 271828, 314159, 161803, 424242, 8675309, 112358, 141421, 173205, 223606, 99991, 100003, 444444, 555555, 777777. Local modulus: 11025.

## Endpoint trace

| N | centers | real residual/sqrt | real raw/sqrt | Cramer residual | W210 residual | composite residual | local-composite residual |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41528 | 5.826384 | 4.954642 | 3.923157..6.230807 | 3.903180..5.500954 | 3.167469..4.932678 | 4.457128..6.093739 |
| 1000000 | 78488 | 6.571486 | 5.678811 | 3.686945..6.095958 | 4.104340..5.919882 | 3.560758..4.896810 | 3.690738..6.716319 |
| 2000000 | 148923 | 6.170647 | 5.048094 | 4.386918..6.492863 | 3.515405..6.802737 | 3.274347..4.712174 | 3.834753..5.886894 |
| 4000000 | 283136 | 5.435951 | 4.691652 | 4.079074..6.205989 | 3.711850..6.320991 | 3.365825..5.020695 | 4.647743..6.263783 |
| 8000000 | 539766 | 5.917251 | 4.989004 | 3.956465..6.693396 | 4.060671..6.657885 | 3.395444..5.036039 | 4.470062..6.206311 |

## Block residual norms

| block | centers | real residual/sqrt | Cramer | W210 | composite | local-composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 500000] | 41528 | 5.826384 | 3.923157..6.230807 | 3.903180..5.500954 | 3.167469..4.932678 | 4.457128..6.093739 |
| (500000, 1000000] | 36960 | 5.884282 | 4.068473..6.761447 | 3.982924..5.648944 | 3.550619..5.231785 | 4.647574..7.208832 |
| (1000000, 2000000] | 70435 | 6.689071 | 4.938121..6.804565 | 3.830473..5.923843 | 3.435456..4.369467 | 4.160872..6.412374 |
| (2000000, 4000000] | 134213 | 5.193583 | 3.676697..5.860742 | 3.732232..5.611728 | 2.956188..5.155882 | 4.478943..6.325499 |
| (4000000, 8000000] | 256630 | 6.557335 | 4.257945..6.651498 | 4.000175..6.208263 | 3.283241..4.835815 | 4.229662..6.285509 |

## Top endpoint residual features

| feature | kind | value/sqrt | raw value/sqrt |
| --- | --- | ---: | ---: |
| -6 | one | 2.328790 | 1.407401 |
| -30*22 | two | 1.845229 | 1.118843 |
| -14*22 | two | -1.765920 | -1.780348 |
| 6*14 | two | -1.753126 | -1.053509 |
| -30*6 | two | -1.417019 | -0.065334 |
| -14*-6 | two | -1.384443 | -1.234538 |
| -22 | one | -1.365660 | -1.045342 |
| -30*14 | two | 1.246062 | 0.503615 |
| 6*30 | two | -1.175193 | -1.335261 |
| -22*-6 | two | -1.087991 | -1.695959 |
| 30 | one | 1.081820 | 0.404253 |
| -6*14 | two | -1.027920 | -1.630625 |

## Function-field unordered shell Walsh check

| q | degree | shifts | irreducibles | feature count | norm/sqrt |
| ---: | ---: | --- | ---: | ---: | ---: |
| 3 | 1 | 1,2 | 3 | 3 | 3.000000 |
| 3 | 2 | 1,2 | 3 | 3 | 1.732051 |
| 3 | 3 | 1,2 | 8 | 3 | 0.866025 |
| 3 | 4 | 1,2 | 18 | 3 | 2.000000 |
| 3 | 5 | 1,2 | 48 | 3 | 2.031010 |
| 3 | 6 | 1,2 | 116 | 3 | 2.574745 |
| 3 | 7 | 1,2 | 312 | 3 | 1.176697 |
| 3 | 8 | 1,2 | 810 | 3 | 1.763834 |
| 3 | 9 | 1,2 | 2184 | 3 | 0.817057 |
| 3 | 10 | 1,2 | 5880 | 3 | 2.221762 |
| 3 | 11 | 1,2 | 16104 | 3 | 1.204500 |
| 3 | 12 | 1,2 | 44220 | 3 | 1.860295 |
| 5 | 1 | 1,2,3,4 | 5 | 10 | 7.071068 |
| 5 | 2 | 1,2,3,4 | 10 | 10 | 5.000000 |
| 5 | 3 | 1,2,3,4 | 40 | 10 | 4.743416 |
| 5 | 4 | 1,2,3,4 | 150 | 10 | 8.020806 |
| 5 | 5 | 1,2,3,4 | 624 | 10 | 4.167949 |
| 5 | 6 | 1,2,3,4 | 2580 | 10 | 14.146246 |
| 5 | 7 | 1,2,3,4 | 11160 | 10 | 4.602477 |
| 5 | 8 | 1,2,3,4 | 48750 | 10 | 9.497584 |

## Summary

Real residual theta: `0.439662`.
Endpoint Cramer residual/sqrt range: `3.956465..6.693396`.
Endpoint W210 residual/sqrt range: `4.060671..6.657885`.
Endpoint composite residual/sqrt range: `3.395444..5.036039`.
Endpoint local-composite residual/sqrt range: `4.470062..6.206311`.

## Factor check

This is a distributional statistic, not an adjacent-prime transition, so the overlap and near-overlap gap kernels from Cycles 68-69 are not available. The main remaining breakers are local squarefree density mismatch, feature-count norm inflation, and one-coordinate local factors dominating the residual. A survivor must beat local-residue matched composites and not be concentrated in one-coordinate features.

## Files

- JSON: `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.json`
- SVG: `logs/playground-artifacts/squarefree-window-walsh-spectrum-8000000.svg`