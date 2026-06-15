# holdout residue-transition Markov surprise audit

Candidate:
train a smoothed residue transition matrix on the lower half of each fresh
range, score upper-half consecutive labels by log likelihood, and subtract
row-shuffled next-residue controls.

Aggregate: `(observed log score - mean row-shuffle score) * sqrt(test
transitions)`.

Smoothing: `0.5`.

## Integer paths

### modulus 30

Reduced residue states: `8`.

| block | transitions | observed | fake mean | residual | aggregate | row-shuffle controls |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1000000..2000000 | 34777 | -1.888381 | -2.311224 | 0.422843 | 78.854328 | -0.565941 .. 1.100479 |
| 2000000..4000000 | 66329 | -1.904871 | -2.285943 | 0.381071 | 98.142654 | -1.345528 .. 1.112807 |
| 4000000..8000000 | 126927 | -1.920523 | -2.263177 | 0.342654 | 122.076770 | -1.080431 .. 0.625474 |
| 8000000..16000000 | 243069 | -1.934634 | -2.243815 | 0.309181 | 152.432674 | -0.916401 .. 1.278726 |

Final controls:

- row-shuffle aggregate range: `-0.916401 .. 1.278726`
- Cramer aggregate range: `91.436129 .. 92.742743`
- wheel aggregate range: `161.893762 .. 164.634517`
- composite aggregate range: `70.027394 .. 71.196689`

### modulus 210

Reduced residue states: `48`.

| block | transitions | observed | fake mean | residual | aggregate | row-shuffle controls |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1000000..2000000 | 34777 | -2.046660 | -6.195831 | 4.149171 | 773.762017 | -2.412969 .. 3.192506 |
| 2000000..4000000 | 66329 | -2.089030 | -6.545064 | 4.456035 | 1147.625734 | -2.944753 .. 2.865091 |
| 4000000..8000000 | 126927 | -2.133896 | -6.857535 | 4.723639 | 1682.882174 | -1.975921 .. 2.210431 |
| 8000000..16000000 | 243069 | -2.181235 | -7.114923 | 4.933688 | 2432.408255 | -3.942334 .. 3.285972 |

Final controls:

- row-shuffle aggregate range: `-3.942334 .. 3.285972`
- Cramer aggregate range: `1426.419345 .. 1431.210092`
- wheel aggregate range: `2395.348001 .. 2401.489245`
- composite aggregate range: `1571.700223 .. 1583.780605`

## F_2[t] encoded-order path

Residue modulus: `t^3 + t + 1`; states: `7`.

| degree | transitions | observed | fake mean | residual | aggregate | row-shuffle controls | composite aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 21 | 42814 | -1.766119 | -1.818660 | 0.052541 | 10.871591 | -0.300725 .. 0.365663 | 0.532530 .. 0.771873 |
| 22 | 81683 | -1.770437 | -1.815647 | 0.045210 | 12.921032 | -0.217393 .. 0.102950 | 0.713818 .. 0.837098 |
| 23 | 156277 | -1.770472 | -1.814935 | 0.044464 | 17.577393 | -0.576982 .. 0.625832 | 0.923292 .. 1.050055 |
| 24 | 299521 | -1.772211 | -1.813684 | 0.041473 | 22.697616 | -0.104586 .. 0.240780 | 1.230738 .. 1.396778 |

## F_3[t] encoded-order path

Residue modulus: `t^2 + 1`; states: `8`.

| degree | transitions | observed | fake mean | residual | aggregate | row-shuffle controls | composite aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 12 | 19360 | -1.908467 | -1.989791 | 0.081323 | 11.315352 | -0.426439 .. 0.598661 | 2.946520 .. 3.378753 |
| 13 | 53686 | -1.913254 | -1.982465 | 0.069211 | 16.036458 | -0.335613 .. 0.450504 | 4.180786 .. 4.664440 |
| 14 | 149301 | -1.915158 | -1.979840 | 0.064682 | 24.992686 | -0.316973 .. 0.526662 | 6.122624 .. 6.499782 |
| 15 | 418486 | -1.918619 | -1.975366 | 0.056748 | 36.710375 | -0.632772 .. 0.780383 | 8.955617 .. 9.571079 |

SVG: `logs/playground-artifacts/residue-transition-holdout-audit-16000000-q30-210-f32.svg`
JSON: `logs/playground-artifacts/residue-transition-holdout-audit-16000000-q30-210-f32.json`
