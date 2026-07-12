# Prime-square completion kill test

The LP and SDP cones are frozen in `PREREGISTRATION.md`. Numerical
nonmembership is not a hard kill until the dual is interval-certified.

| N | split | dim | pairs | width 1 LP | width 2 LP | width 2 SDP | SDP dual min | SDP separation |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | discovery | 7 | 1 | 7.743e-01 | 7.743e-01 | 7.738e-01 | 1.850e-12 | -5.987e-01 |
| 10 | holdout | 9 | 1 | 8.041e-01 | 8.041e-01 | 8.016e-01 | 1.571e-12 | -6.426e-01 |
| 12 | discovery | 11 | 2 | 8.192e-01 | 8.192e-01 | 8.129e-01 | 1.702e-13 | -6.607e-01 |
| 15 | holdout | 14 | 3 | 8.317e-01 | 8.317e-01 | 8.235e-01 | 8.961e-13 | -6.781e-01 |
| 18 | discovery | 17 | 4 | 8.381e-01 | 8.381e-01 | 8.319e-01 | 1.609e-12 | -6.921e-01 |
| 22 | holdout | 21 | 5 | 8.441e-01 | 8.441e-01 | 8.366e-01 | 5.540e-12 | -6.998e-01 |
| 26 | discovery | 25 | 6 | 8.472e-01 | 8.472e-01 | 8.404e-01 | 2.855e-13 | -7.062e-01 |
| 30 | holdout | 29 | 7 | 8.504e-01 | 8.504e-01 | 8.429e-01 | 2.112e-13 | -7.104e-01 |

- normalization: PASS
- width-one all-cell feasibility: FAIL
- strict width-two LP all-cell feasibility: FAIL
- width-two SDP all-cell feasibility: FAIL

Verdict: **INCONCLUSIVE NUMERICAL CONE TEST**.
