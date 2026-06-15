# valid gap-residue holdout law audit

Candidate:
train `P(gap mod W | current residue, coarse gap/log(p) bin)` on the lower
half of each fresh range, score the upper half, and subtract the valid
landing-residue baseline `uniform {h: gcd(a+h,W)=1}`.

The reported aggregate is
`sqrt(test transitions) * mean log(P_train(h|context) / P_valid(h|a))`.
The state-only model uses context `a`; the binned model uses `(a,zbin)`.

Smoothing: `0.5`; bins: `4`.

## Integer paths

### modulus 30

Reduced residue states: `8`.
Aggregate exponent fit over fresh blocks: state-only `0.357222`; binned `0.461548`.

| block | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 34777 | 35.630166 | 216.374187 | 180.744021 | 1.160270878 | 0.000000 |
| 2000000..4000000 | 66329 | 44.959523 | 252.056047 | 207.096524 | 0.978690554 | 0.000000 |
| 4000000..8000000 | 126927 | 56.617532 | 370.002500 | 313.384968 | 1.038550576 | 0.000000 |
| 8000000..16000000 | 243069 | 71.393008 | 516.001012 | 444.608003 | 1.046612136 | 0.000000 |

Final controls:

- prime state aggregate: `71.393008`
- prime binned aggregate: `516.001012`
- Cramer state aggregate range: `59.308263 .. 59.952263`
- Cramer binned aggregate range: `374.506402 .. 377.920308`
- wheel state aggregate range: `75.918296 .. 77.111427`
- wheel binned aggregate range: `500.896916 .. 506.724815`
- composite state aggregate range: `33.358036 .. 34.565124`
- composite binned aggregate range: `345.142208 .. 351.243666`

### modulus 210

Reduced residue states: `48`.
Aggregate exponent fit over fresh blocks: state-only `0.460604`; binned `0.498491`.

| block | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 34777 | 340.251263 | 538.895919 | 198.644657 | 2.889740451 | 0.000000 |
| 2000000..4000000 | 66329 | 458.987864 | 712.765100 | 253.777236 | 2.767545066 | 0.000000 |
| 4000000..8000000 | 126927 | 618.946357 | 1013.446121 | 394.499764 | 2.844616057 | 0.000000 |
| 8000000..16000000 | 243069 | 833.187491 | 1407.034906 | 573.847414 | 2.853908759 | 0.000000 |

Final controls:

- prime state aggregate: `833.187491`
- prime binned aggregate: `1407.034906`
- Cramer state aggregate range: `543.184094 .. 544.463871`
- Cramer binned aggregate range: `905.054574 .. 908.335731`
- wheel state aggregate range: `833.094680 .. 836.401636`
- wheel binned aggregate range: `1389.175994 .. 1395.788612`
- composite state aggregate range: `562.743564 .. 567.756390`
- composite binned aggregate range: `1080.668308 .. 1089.737444`

## Function-field encoded-order check

The field rows use consecutive irreducibles in coefficient encoding and bin by
degree of the encoded polynomial gap. This is not coordinate-free; it is kept
only as an artifact check against earlier lex/coefficient failures.

### F_2[t]

Modulus: `t^3 + t + 1`; states: `7`; gap residues:
`8`.

| degree | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate | composite binned range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 21 | 49928 | 6.313134 | 85.962199 | 79.649064 | 0.384711732 | 0.000000 | 3.898545 .. 4.251852 |
| 22 | 95278 | 7.931362 | 114.905062 | 106.973700 | 0.372256975 | 0.000000 | 5.565225 .. 5.678390 |
| 23 | 182360 | 9.923847 | 153.200655 | 143.276808 | 0.358753238 | 0.000000 | 7.634083 .. 7.796976 |
| 24 | 349434 | 12.896507 | 205.164066 | 192.267559 | 0.347071312 | 0.000000 | 10.244856 .. 10.465007 |

### F_3[t]

Modulus: `t^2 + 1`; states: `8`; gap residues:
`9`.

| degree | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate | composite binned range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 12 | 22109 | 6.600799 | 17.064903 | 10.464104 | 0.114767595 | 0.000000 | 27.482238 .. 28.587405 |
| 13 | 61319 | 9.543641 | 25.430350 | 15.886708 | 0.102696300 | 0.000000 | 44.162621 .. 45.373121 |
| 14 | 170741 | 14.441052 | 40.104344 | 25.663291 | 0.097056026 | 0.000000 | 18.528933 .. 19.070059 |
| 15 | 478287 | 21.902811 | 62.933607 | 41.030796 | 0.090999360 | 0.000000 | 29.525742 .. 30.029146 |

## Artifacts

- JSON: `logs/playground-artifacts/gapresidue-holdout-audit-16000000-q30-210-b4-f32.json`
- SVG: `logs/playground-artifacts/gapresidue-holdout-audit-16000000-q30-210-b4-f32.svg`
