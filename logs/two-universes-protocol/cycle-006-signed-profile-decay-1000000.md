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

## F_2[t] degree ladder

| run | x | order2 RMS | order2 positive | order2 top20 | order3 RMS | order3 positive | order3 top20 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_2 degree=16 | 65536 | 0.025661 | 0.000000 | 0.353509 | 0.023611 | 0.150000 | 0.434946 |
| F_2 degree=17 | 131072 | 0.022923 | 0.066667 | 0.418588 | 0.014599 | 0.250000 | 0.526471 |
| F_2 degree=18 | 262144 | 0.018474 | 0.000000 | 0.283820 | 0.014681 | 0.050000 | 0.394392 |

## F_3[t] degree ladder

| run | x | order2 RMS | order2 positive | order2 top20 | order3 RMS | order3 positive | order3 top20 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3 degree=8 | 6561 | 0.104376 | 0.000000 | 0.303715 | 0.066313 | 0.000000 | 0.321907 |
| F_3 degree=9 | 19683 | 0.048466 | 0.000000 | 0.321737 | 0.022033 | 0.214286 | 0.343710 |
| F_3 degree=10 | 59049 | 0.046625 | 0.035714 | 0.281005 | 0.026977 | 0.000000 | 0.347630 |

## F_5[t] degree ladder

| run | x | order2 RMS | order2 positive | order2 top20 | order3 RMS | order3 positive | order3 top20 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5 degree=4 | 625 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_5 degree=5 | 3125 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| F_5 degree=6 | 15625 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |

## Correlation diagnostics

### Integer order2 consecutive profile correlations

| from | to | Pearson |
| --- | --- | ---: |

### Cross-universe order2 endpoint profile correlations

| from | to | Pearson |
| --- | --- | ---: |
| Z endpoint | F_2 degree=18 | 0.577653 |
| Z endpoint | F_3 degree=10 | 0.655754 |
| Z endpoint | F_5 degree=6 | 0.000000 |

## Decay slopes

Integer order2 slope: nan; order3 slope: nan

| q | order2 slope | order3 slope |
| ---: | ---: | ---: |
| 2 | -0.237037 | -0.342739 |
| 3 | -0.366762 | -0.409338 |
| 5 | nan | nan |

JSON: `logs/two-universes-protocol/cycle-006-signed-profile-decay-1000000.json`
SVG: `logs/two-universes-protocol/cycle-006-signed-profile-decay-1000000.svg`
