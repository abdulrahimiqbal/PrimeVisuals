# Locally whitened window Walsh residual audit

State shifts: [-30,-22,-14,-6,6,14,22,30]. Features: 36 one/two-coordinate Walsh products. Local covariance is trained on 48 prime-prefix matched composite runs and tested against 15 heldout seeds.

Range: 8000000. Local modulus: 11025. Shrinkage: off-diagonal factor 0.65; endpoint ridge scales 1e-8, 1e-8, 1e-8, 1e-8, 1e-8.

## Endpoint trace

| N | centers | real W | real Zmax | top feature | local-holdout W | Cramer W | W210 W | composite W |
| ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| 500000 | 41528 | 7.007336 | 2.418316 | -30 | 5.260995..9.015103 | 5.892567..9.272943 | 5.501165..9.064473 | 6.064962..8.429743 |
| 1000000 | 78488 | 7.065456 | 2.401466 | -22*22 | 5.301479..9.447679 | 5.598011..8.521382 | 5.408456..8.417313 | 6.353256..8.669960 |
| 2000000 | 148923 | 6.504075 | 2.320315 | -6 | 5.275701..8.157814 | 4.768087..9.133484 | 5.047422..7.972576 | 5.929167..8.239875 |
| 4000000 | 283136 | 6.506467 | 2.236238 | -30*14 | 6.070857..8.671086 | 5.911635..9.310623 | 5.398993..7.806161 | 5.138104..8.167035 |
| 8000000 | 539766 | 7.505021 | 2.339112 | -30*22 | 6.100177..7.725819 | 5.942774..8.652724 | 4.785714..8.290173 | 4.767471..7.099229 |

## Max-coordinate trace

| N | real Zmax | local-holdout Zmax | Cramer Zmax | W210 Zmax | composite Zmax |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 2.418316 | 1.709310..3.573228 | 1.857516..3.404944 | 1.947433..3.261679 | 1.765068..3.492154 |
| 1000000 | 2.401466 | 1.533542..3.403622 | 1.690568..3.215953 | 1.571248..3.665706 | 2.174203..2.960355 |
| 2000000 | 2.320315 | 1.663216..3.232961 | 1.833139..3.560750 | 1.660110..3.010877 | 2.061097..3.689348 |
| 4000000 | 2.236238 | 1.908909..2.857160 | 1.826964..3.124940 | 1.577702..3.538323 | 1.615464..3.045886 |
| 8000000 | 2.339112 | 1.640417..3.071974 | 1.547614..2.883696 | 1.614704..3.694394 | 1.259035..2.953260 |

## Top endpoint whitened coordinates

| feature | kind | z |
| --- | --- | ---: |
| -30*22 | two | 2.339112 |
| -14*22 | two | -2.219475 |
| -14*-6 | two | -1.912840 |
| -6 | one | 1.778591 |
| 6*14 | two | -1.680478 |
| 6*30 | two | -1.558703 |
| -30*14 | two | 1.511233 |
| -22*-6 | two | -1.484187 |
| -22*22 | two | 1.451309 |
| -30*6 | two | -1.299038 |
| -22 | one | -1.233960 |
| -30 | one | -1.104219 |

## Summary

Real whitened-norm theta: `0.007907`.
Real raw-residual theta: `0.499075`.
Endpoint local-holdout W range: `6.100177..7.725819`.
Endpoint Cramer W range: `5.942774..8.652724`.
Endpoint W210 W range: `4.785714..8.290173`.
Endpoint composite W range: `4.767471..7.099229`.

## Named composite check

| n | is prime | state | feature norm |
| ---: | --- | --- | ---: |
| 25 | no | 0,-1,-1,-1,-1,1,-1,1 | 5.291503 |
| 35 | no | -1,-1,1,-1,-1,0,1,1 | 5.291503 |
| 77 | no | -1,1,0,-1,-1,1,0,-1 | 4.582576 |

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

## Factor check

This statistic is still transport-free: no consecutive-prime shifted integer can overlap. The new failure modes are covariance overfit, shrinkage dependence, and multiple-testing rotation in the top z-coordinate. A survivor must beat heldout local composites after the training covariance is fixed.

## Files

- JSON: `logs/playground-artifacts/locally-whitened-window-walsh-8000000.json`
- SVG: `logs/playground-artifacts/locally-whitened-window-walsh-8000000.svg`