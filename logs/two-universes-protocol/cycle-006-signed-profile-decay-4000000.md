# Signed residual-profile / scale-decay audit

Candidate:
after exact admissibility subtraction, compare signed residual profiles binned by train allowed-rate and compare log-slope decay across scale/degree.

```text
R_S = mean_holdout Z_S(v), |S| in {2,3}
profile_k = bin_by_train_rate({R_S : |S|=k})
accept only if signed profiles and decay slopes match across Z and F_q[t] beyond controls
```

Profile bins: 8. Seeds per control family: 3.

## Integer scales

| run | x | order2 RMS | order2 positive | order2 top20 | order3 RMS | order3 positive | order3 top20 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Z N=1000000 | 1000000 | 0.040363 | 0.000000 | 0.285851 | 0.021321 | 0.000000 | 0.317017 |
| Z N=2000000 | 2000000 | 0.036715 | 0.000000 | 0.292192 | 0.019088 | 0.000000 | 0.318133 |
| Z N=4000000 | 4000000 | 0.031512 | 0.000000 | 0.279855 | 0.015729 | 0.000000 | 0.308302 |

## F_2[t] degree ladder

| run | x | order2 RMS | order2 positive | order2 top20 | order3 RMS | order3 positive | order3 top20 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_2 degree=20 | 1048576 | 0.013123 | 0.000000 | 0.323161 | 0.007062 | 0.150000 | 0.362167 |
| F_2 degree=21 | 2097152 | 0.012474 | 0.000000 | 0.294852 | 0.005858 | 0.050000 | 0.388589 |
| F_2 degree=22 | 4194304 | 0.011508 | 0.000000 | 0.270826 | 0.006118 | 0.000000 | 0.337358 |

## F_3[t] degree ladder

| run | x | order2 RMS | order2 positive | order2 top20 | order3 RMS | order3 positive | order3 top20 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3 degree=11 | 177147 | 0.051097 | 0.000000 | 0.256382 | 0.028477 | 0.000000 | 0.266629 |
| F_3 degree=12 | 531441 | 0.028416 | 0.000000 | 0.261293 | 0.013892 | 0.000000 | 0.259617 |
| F_3 degree=13 | 1594323 | 0.027872 | 0.000000 | 0.260646 | 0.014388 | 0.000000 | 0.286640 |

## F_5[t] degree ladder

| run | x | order2 RMS | order2 positive | order2 top20 | order3 RMS | order3 positive | order3 top20 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5 degree=6 | 15625 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_5 degree=7 | 78125 | 0.079032 | 0.000000 | 0.228562 | 0.131565 | 0.000000 | 0.220906 |
| F_5 degree=8 | 390625 | 0.067518 | 0.000000 | 0.235197 | 0.038570 | 0.000000 | 0.246409 |

## Correlation diagnostics

### Integer order2 consecutive profile correlations

| from | to | Pearson |
| --- | --- | ---: |
| Z N=1000000 | Z N=2000000 | 0.459445 |
| Z N=2000000 | Z N=4000000 | 0.906567 |

### Cross-universe order2 endpoint profile correlations

| from | to | Pearson |
| --- | --- | ---: |
| Z endpoint | F_2 degree=22 | 0.489766 |
| Z endpoint | F_3 degree=13 | 0.597886 |
| Z endpoint | F_5 degree=8 | 0.527427 |

## Decay slopes

Integer order2 slope: -0.178567; order3 slope: -0.219413

| q | order2 slope | order3 slope |
| ---: | ---: | ---: |
| 2 | -0.094713 | -0.103549 |
| 3 | -0.275846 | -0.310710 |
| 5 | -0.097836 | -0.762394 |

JSON: `logs/two-universes-protocol/cycle-006-signed-profile-decay-4000000.json`
SVG: `logs/two-universes-protocol/cycle-006-signed-profile-decay-4000000.svg`
