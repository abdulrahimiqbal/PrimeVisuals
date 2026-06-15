# Locally whitened window Walsh residual audit

State shifts: [-30,-22,-14,-6,6,14,22,30]. Features: 36 one/two-coordinate Walsh products. Local covariance is trained on 48 prime-prefix matched composite runs and tested against 15 heldout seeds.

Range: 200000. Local modulus: 11025. Shrinkage: off-diagonal factor 0.65; endpoint ridge scales 1e-8, 1e-8, 1e-8, 1e-8, 1e-8.

## Endpoint trace

| N | centers | real W | real Zmax | top feature | local-holdout W | Cramer W | W210 W | composite W |
| ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| 12500 | 1482 | 7.568903 | 3.333876 | -30 | 5.833227..8.387200 | 6.600715..11.088518 | 7.815150..10.186062 | 7.617648..10.090643 |
| 25000 | 2752 | 7.488394 | 2.985244 | -30 | 4.716083..8.954884 | 6.727969..10.198442 | 7.457977..9.830446 | 8.706773..11.142668 |
| 50000 | 5123 | 9.528525 | 2.914888 | 22*30 | 5.008698..9.238880 | 7.647339..10.285944 | 8.241490..10.377632 | 7.218097..11.206189 |
| 100000 | 9582 | 9.896301 | 3.094869 | -14*22 | 5.004719..8.479221 | 5.244772..10.306771 | 6.970413..8.851526 | 6.055335..7.920585 |
| 200000 | 17973 | 10.863261 | 3.989309 | -30*22 | 6.186418..8.709464 | 7.441002..12.136648 | 7.988501..9.911909 | 4.765308..7.217949 |

## Max-coordinate trace

| N | real Zmax | local-holdout Zmax | Cramer Zmax | W210 Zmax | composite Zmax |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 12500 | 3.333876 | 1.900936..4.460326 | 2.062974..3.755830 | 2.500624..4.620612 | 2.382987..3.755749 |
| 25000 | 2.985244 | 1.818251..4.587224 | 1.927705..4.093528 | 2.399317..4.569416 | 2.471623..4.287509 |
| 50000 | 2.914888 | 1.596132..3.316011 | 2.071589..3.871422 | 2.591387..4.558563 | 2.408647..3.764501 |
| 100000 | 3.094869 | 1.770745..3.426426 | 1.951435..4.642530 | 2.237686..3.852104 | 2.551293..4.711910 |
| 200000 | 3.989309 | 1.943918..3.571508 | 2.180530..5.332009 | 2.504196..4.010439 | 1.546571..2.513181 |

## Top endpoint whitened coordinates

| feature | kind | z |
| --- | --- | ---: |
| -30*22 | two | -3.989309 |
| -22*-14 | two | -3.222376 |
| -14*6 | two | 2.358868 |
| -14 | one | -2.279268 |
| 22*30 | two | 2.249877 |
| -14*-6 | two | 2.149713 |
| -30 | one | -1.992981 |
| 22 | one | 1.897948 |
| -22*-6 | two | -1.886512 |
| 6*30 | two | 1.884364 |
| -14*30 | two | 1.850974 |
| 30 | one | -1.803313 |

## Summary

Real whitened-norm theta: `0.144484`.
Real raw-residual theta: `0.569480`.
Endpoint local-holdout W range: `6.186418..8.709464`.
Endpoint Cramer W range: `7.441002..12.136648`.
Endpoint W210 W range: `7.988501..9.911909`.
Endpoint composite W range: `4.765308..7.217949`.

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

- JSON: `logs/playground-artifacts/locally-whitened-window-walsh-200000.json`
- SVG: `logs/playground-artifacts/locally-whitened-window-walsh-200000.svg`