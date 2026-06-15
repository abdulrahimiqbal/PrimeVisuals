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
Aggregate exponent fit over fresh blocks: state-only `0.321678`; binned `0.537548`.

| block | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100000..200000 | 4135 | 17.523237 | 66.950851 | 49.427614 | 1.041162082 | 0.000000 |
| 125000..250000 | 5079 | 18.365530 | 77.577654 | 59.212123 | 1.088547876 | 0.000000 |
| 250000..500000 | 9633 | 22.540743 | 102.077503 | 79.536761 | 1.040038124 | 0.000000 |
| 500000..1000000 | 18259 | 28.124547 | 152.779397 | 124.654850 | 1.130645079 | 0.000000 |

Final controls:

- prime state aggregate: `28.124547`
- prime binned aggregate: `152.779397`
- Cramer state aggregate range: `22.976586 .. 24.784129`
- Cramer binned aggregate range: `96.790581 .. 108.084155`
- wheel state aggregate range: `29.565328 .. 31.039914`
- wheel binned aggregate range: `144.420294 .. 151.056146`
- composite state aggregate range: `10.556406 .. 11.081410`
- composite binned aggregate range: `103.190428 .. 108.361797`

### modulus 210

Reduced residue states: `48`.
Aggregate exponent fit over fresh blocks: state-only `0.500629`; binned `0.644898`.

| block | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100000..200000 | 4135 | 119.403664 | 142.560453 | 23.156789 | 2.216977623 | 0.000000 |
| 125000..250000 | 5079 | 133.116817 | 167.964167 | 34.847351 | 2.356826079 | 0.000000 |
| 250000..500000 | 9633 | 184.323929 | 250.125837 | 65.801908 | 2.548459727 | 0.000000 |
| 500000..1000000 | 18259 | 251.200681 | 375.842739 | 124.642058 | 2.781427029 | 0.000000 |

Final controls:

- prime state aggregate: `251.200681`
- prime binned aggregate: `375.842739`
- Cramer state aggregate range: `156.312641 .. 158.765564`
- Cramer binned aggregate range: `210.216763 .. 216.028564`
- wheel state aggregate range: `248.680337 .. 252.995507`
- wheel binned aggregate range: `364.970318 .. 371.918047`
- composite state aggregate range: `153.757191 .. 156.618915`
- composite binned aggregate range: `271.384995 .. 274.183828`

## Function-field encoded-order check

The field rows use consecutive irreducibles in coefficient encoding and bin by
degree of the encoded polynomial gap. This is not coordinate-free; it is kept
only as an artifact check against earlier lex/coefficient failures.

### F_2[t]

Modulus: `t^3 + t + 1`; states: `7`; gap residues:
`8`.

| degree | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate | composite binned range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 15 | 1090 | 0.932506 | 19.629259 | 18.696753 | 0.594553117 | 0.000000 | -3.608611 .. -1.066868 |
| 16 | 2039 | 1.252011 | 25.767729 | 24.515718 | 0.570646981 | 0.000000 | -1.311358 .. -0.143737 |
| 17 | 3854 | 2.309799 | 28.456433 | 26.146635 | 0.458378893 | 0.000000 | -0.436078 .. 0.279569 |
| 18 | 7265 | 2.475850 | 25.775235 | 23.299384 | 0.302402112 | 0.000000 | 0.939915 .. 1.185248 |

### F_3[t]

Modulus: `t^2 + 1`; states: `8`; gap residues:
`9`.

| degree | transitions | state aggregate | binned aggregate | bin incremental aggregate | binned advantage | unseen context rate | composite binned range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 8 | 404 | 0.280952 | 2.388981 | 2.108029 | 0.118856258 | 0.004950 | 0.460485 .. 1.551852 |
| 9 | 1091 | 2.064251 | 7.263212 | 5.198960 | 0.219895493 | 0.000000 | 3.878722 .. 5.553600 |
| 10 | 2939 | 2.525830 | 10.948104 | 8.422274 | 0.201947792 | 0.000000 | 9.660232 .. 10.744069 |
| 11 | 8051 | 4.334797 | 11.068493 | 6.733696 | 0.123356940 | 0.000000 | 17.386202 .. 18.346564 |

## Artifacts

- JSON: `logs/playground-artifacts/gapresidue-holdout-audit-1000000-q30-210-b4-f32.json`
- SVG: `logs/playground-artifacts/gapresidue-holdout-audit-1000000-q30-210-b4-f32.svg`
