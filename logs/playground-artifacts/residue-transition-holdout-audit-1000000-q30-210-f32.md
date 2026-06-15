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
| 100000..200000 | 4135 | -1.806935 | -2.446857 | 0.639921 | 41.149488 | -0.518289 .. 1.251682 |
| 125000..250000 | 5079 | -1.821742 | -2.432167 | 0.610426 | 43.503273 | -1.937117 .. 2.242043 |
| 250000..500000 | 9633 | -1.849780 | -2.388045 | 0.538265 | 52.829526 | -0.656445 .. 0.967194 |
| 500000..1000000 | 18259 | -1.871306 | -2.327108 | 0.455803 | 61.590752 | -1.616238 .. 1.676151 |

Final controls:

- row-shuffle aggregate range: `-1.616238 .. 1.676151`
- Cramer aggregate range: `37.668558 .. 39.273742`
- wheel aggregate range: `64.569938 .. 68.712700`
- composite aggregate range: `22.394230 .. 24.124906`

### modulus 210

Reduced residue states: `48`.

| block | transitions | observed | fake mean | residual | aggregate | row-shuffle controls |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 100000..200000 | 4135 | -2.014338 | -4.948154 | 2.933816 | 188.656033 | -1.884673 .. 1.148219 |
| 125000..250000 | 5079 | -2.003343 | -5.056511 | 3.053168 | 217.590420 | -1.849411 .. 1.713784 |
| 250000..500000 | 9633 | -1.993178 | -5.444532 | 3.451355 | 338.743017 | -2.056409 .. 2.329239 |
| 500000..1000000 | 18259 | -2.012188 | -5.822712 | 3.810524 | 514.900323 | -3.005254 .. 2.542452 |

Final controls:

- row-shuffle aggregate range: `-3.005254 .. 2.542452`
- Cramer aggregate range: `316.580079 .. 319.681982`
- wheel aggregate range: `509.741415 .. 516.850641`
- composite aggregate range: `312.288767 .. 314.910216`

## F_2[t] encoded-order path

Residue modulus: `t^3 + t + 1`; states: `7`.

| degree | transitions | observed | fake mean | residual | aggregate | row-shuffle controls | composite aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 15 | 930 | -1.772972 | -1.844541 | 0.071570 | 2.182582 | -0.863280 .. 0.665888 | 0.037857 .. 0.480033 |
| 16 | 1753 | -1.772880 | -1.855002 | 0.082122 | 3.438341 | -0.615014 .. 0.492404 | -0.112457 .. 0.361355 |
| 17 | 3298 | -1.760019 | -1.830931 | 0.070912 | 4.072371 | -0.718168 .. 0.403040 | 0.124741 .. 0.401031 |
| 18 | 6252 | -1.768969 | -1.828260 | 0.059291 | 4.688114 | -0.506718 .. 0.368479 | 0.212993 .. 0.424772 |

## F_3[t] encoded-order path

Residue modulus: `t^2 + 1`; states: `8`.

| degree | transitions | observed | fake mean | residual | aggregate | row-shuffle controls | composite aggregate range |
| ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 8 | 353 | -1.950908 | -2.093234 | 0.142326 | 2.674065 | -0.511018 .. 0.744570 | 0.380155 .. 1.408231 |
| 9 | 946 | -1.884369 | -2.033410 | 0.149040 | 4.584054 | -0.729123 .. 0.562395 | 0.467797 .. 2.393448 |
| 10 | 2575 | -1.909170 | -2.014468 | 0.105298 | 5.343290 | -0.361986 .. 0.299693 | 1.266208 .. 2.111555 |
| 11 | 7050 | -1.908067 | -1.999933 | 0.091866 | 7.713475 | -1.053196 .. 0.431022 | 1.976650 .. 2.397756 |

SVG: `logs/playground-artifacts/residue-transition-holdout-audit-1000000-q30-210-f32.svg`
JSON: `logs/playground-artifacts/residue-transition-holdout-audit-1000000-q30-210-f32.json`
