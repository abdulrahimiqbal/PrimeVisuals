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
| 100000..200000 | 4135 | 41.149488 | 291.221438 | 0 | 0.000000 | 0.000000 |
| 125000..250000 | 5079 | 43.503273 | 333.005675 | 0 | 0.000000 | 0.000000 |
| 250000..500000 | 9633 | 52.829526 | 511.663210 | 0 | 0.000000 | 0.000000 |
| 500000..1000000 | 18259 | 61.590752 | 779.217233 | 0 | 0.000000 | 0.000000 |

Final controls:

- exact compatibility quotient: `0.000000`
- Cramer gap aggregate range: `570.920814 .. 573.200898`
- wheel gap aggregate range: `775.760444 .. 782.625096`
- composite gap aggregate range: `588.309690 .. 594.219902`

### modulus 210

Reduced residue states: `48`.

| block | transitions | first-order aggregate | gap aggregate | compatibility violations | violation rate | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100000..200000 | 4135 | 188.656033 | 214.246317 | 0 | 0.000000 | 0.025635 |
| 125000..250000 | 5079 | 217.590420 | 249.634172 | 0 | 0.000000 | 0.019492 |
| 250000..500000 | 9633 | 338.743017 | 397.145241 | 0 | 0.000000 | 0.011004 |
| 500000..1000000 | 18259 | 514.900323 | 622.797184 | 0 | 0.000000 | 0.006682 |

Final controls:

- exact compatibility quotient: `0.000000`
- Cramer gap aggregate range: `341.512722 .. 346.012371`
- wheel gap aggregate range: `618.136141 .. 626.376634`
- composite gap aggregate range: `419.423579 .. 424.780901`

## F_2[t] encoded-order path

Residue modulus: `t^3 + t + 1`; states: `7`.

| degree | transitions | first-order aggregate | gap aggregate | compatibility violations | unseen context rate | composite gap aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 15 | 786 | 3.080776 | 89.131789 | 0 | 0.000000 | 84.329382 .. 87.154284 |
| 16 | 1485 | 4.047443 | 142.065313 | 0 | 0.000000 | 135.842421 .. 141.484209 |
| 17 | 2787 | 4.820140 | 223.161772 | 0 | 0.000000 | 219.345868 .. 222.888101 |
| 18 | 5316 | 5.291908 | 346.871236 | 0 | 0.000000 | 339.705050 .. 344.290893 |

## F_3[t] encoded-order path

Residue modulus: `t^2 + 1`; states: `8`.

| degree | transitions | first-order aggregate | gap aggregate | compatibility violations | unseen context rate | composite gap aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 8 | 304 | 2.327454 | 38.849518 | 0 | 0.009868 | 33.268254 .. 36.574498 |
| 9 | 808 | 5.406545 | 88.085177 | 0 | 0.000000 | 80.774196 .. 84.235509 |
| 10 | 2224 | 5.884149 | 184.505444 | 0 | 0.000000 | 174.086781 .. 179.750713 |
| 11 | 6097 | 8.309551 | 372.134411 | 0 | 0.000000 | 360.484922 .. 365.769447 |

SVG: `logs/playground-artifacts/residue-transition-gapcondition-audit-1000000-q30-210-f32.svg`
JSON: `logs/playground-artifacts/residue-transition-gapcondition-audit-1000000-q30-210-f32.json`
