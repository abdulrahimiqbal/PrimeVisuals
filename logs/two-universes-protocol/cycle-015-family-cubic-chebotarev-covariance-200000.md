# Family cubic Chebotarev covariance audit

Candidate:
test a family-level covariance residual across many cubic Kummer covers after subtracting the Chebotarev split baseline.

Statistic:
for covers A,B and active unramified labels lambda, set X_A(lambda)=1 when A is a cube in the residue field and 0 otherwise. Score

`Z_AB = sum_lambda (X_A(lambda)-1/3)(X_B(lambda)-1/3) / sqrt(|labels| * 4/81)`

The family energy is RMS of `Z_AB`; the max statistic is `max |Z_AB|`. Controls use Bernoulli(1/3) split labels with the same pair label counts plus robust multiple-testing envelopes.

## Summary

- Complete integer ladder 1M/2M/4M/8M: false
- Required q=2,5,7 field ladders: true
- Final integer within controls: true
- Final fields within controls: true
- Matched control survival: false
- Max family covariance RMS z: 0.955442
- Max pair absolute z: 2.325825

## Integer Rows

Covers: `2`, `5`, `7`, `11`, `13`, `17`

| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Z<=200000 | 6 | 15 | 8986 | 0.955442 | 2.325825 | 1.750000 | 4.250000 | true |

### Integer Top Final Pairs

| A | B | labels | split A | split B | both split | cov z |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 11 | 17 | 8988 | 0.330663 | 0.332443 | 0.104473 | -2.325825 |
| 5 | 11 | 8988 | 0.329217 | 0.330663 | 0.105696 | -1.344865 |
| 2 | 17 | 8988 | 0.332332 | 0.332443 | 0.107365 | -1.329043 |
| 7 | 13 | 8986 | 0.332183 | 0.336190 | 0.109170 | -1.070737 |
| 5 | 13 | 8987 | 0.329142 | 0.336263 | 0.108267 | -1.033758 |
| 2 | 7 | 8987 | 0.332369 | 0.332146 | 0.108045 | -1.002112 |
| 2 | 13 | 8987 | 0.332369 | 0.336263 | 0.110048 | -0.733124 |
| 11 | 13 | 8987 | 0.330700 | 0.336263 | 0.112385 | 0.501056 |

## F_2[t] Rows

Covers: `t`, `t+1`, `t^2+t`, `t^2+t+1`

| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| F_2:deg1 | 4 | 0 | Infinity | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg2 | 4 | 3 | 1 | 0.866025 | 1.000000 | 1.750000 | 4.250000 | true |
| F_2:deg3 | 4 | 0 | Infinity | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg4 | 4 | 6 | 3 | 0.500000 | 0.866025 | 1.750000 | 4.250000 | true |
| F_2:deg5 | 4 | 0 | Infinity | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg6 | 4 | 6 | 9 | 0.841625 | 1.000000 | 1.750000 | 4.250000 | true |
| F_2:deg7 | 4 | 0 | Infinity | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg8 | 4 | 6 | 30 | 0.536190 | 0.821584 | 1.750000 | 4.250000 | true |

### F_2[t] Top Final Active Pairs

| A | B | labels | split A | split B | both split | cov z |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| t | t^2+t+1 | 30 | 0.333333 | 0.300000 | 0.066667 | -0.821584 |
| t+1 | t^2+t+1 | 30 | 0.333333 | 0.300000 | 0.066667 | -0.821584 |
| t^2+t | t^2+t+1 | 30 | 0.300000 | 0.300000 | 0.066667 | -0.547723 |
| t | t+1 | 30 | 0.333333 | 0.333333 | 0.100000 | -0.273861 |
| t | t^2+t | 30 | 0.333333 | 0.300000 | 0.100000 | 0.000000 |
| t+1 | t^2+t | 30 | 0.333333 | 0.300000 | 0.100000 | 0.000000 |

## F_5[t] Rows

Covers: `t`, `t+1`, `t+2`, `t+3`, `t+4`, `t^2+1`

| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| F_5:deg1 | 6 | 0 | Infinity | NA | NA | 1.750000 | 4.250000 | true |
| F_5:deg2 | 6 | 15 | 10 | 0.670820 | 1.581139 | 1.750000 | 4.250000 | true |
| F_5:deg3 | 6 | 0 | Infinity | NA | NA | 1.750000 | 4.250000 | true |
| F_5:deg4 | 6 | 15 | 150 | 0.702140 | 1.837117 | 1.750000 | 4.250000 | true |

### F_5[t] Top Final Active Pairs

| A | B | labels | split A | split B | both split | cov z |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| t | t^2+1 | 150 | 0.333333 | 0.300000 | 0.066667 | -1.837117 |
| t+1 | t+4 | 150 | 0.333333 | 0.333333 | 0.100000 | -0.612372 |
| t | t+2 | 150 | 0.333333 | 0.333333 | 0.100000 | -0.612372 |
| t | t+4 | 150 | 0.333333 | 0.333333 | 0.100000 | -0.612372 |
| t+2 | t+4 | 150 | 0.333333 | 0.333333 | 0.100000 | -0.612372 |
| t+3 | t+4 | 150 | 0.333333 | 0.333333 | 0.100000 | -0.612372 |
| t | t+1 | 150 | 0.333333 | 0.333333 | 0.100000 | -0.612372 |
| t | t+3 | 150 | 0.333333 | 0.333333 | 0.100000 | -0.612372 |

## F_7[t] Rows

Covers: `t`, `t+1`, `t+2`, `t+3`, `t+4`, `t+5`

| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| F_7:deg1 | 6 | 15 | 5 | 0.948683 | 1.565248 | 1.750000 | 4.250000 | true |
| F_7:deg2 | 6 | 15 | 21 | 0.462910 | 0.654654 | 1.750000 | 4.250000 | true |
| F_7:deg3 | 6 | 15 | 112 | 0.661438 | 0.661438 | 1.750000 | 4.250000 | true |
| F_7:deg4 | 6 | 15 | 588 | 0.381324 | 0.494872 | 1.750000 | 4.250000 | true |

### F_7[t] Top Final Active Pairs

| A | B | labels | split A | split B | both split | cov z |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| t+2 | t+4 | 588 | 0.333333 | 0.333333 | 0.115646 | 0.494872 |
| t | t+2 | 588 | 0.333333 | 0.333333 | 0.115646 | 0.494872 |
| t+1 | t+3 | 588 | 0.333333 | 0.333333 | 0.115646 | 0.494872 |
| t | t+5 | 588 | 0.333333 | 0.333333 | 0.115646 | 0.494872 |
| t+3 | t+5 | 588 | 0.333333 | 0.333333 | 0.115646 | 0.494872 |
| t+4 | t+5 | 588 | 0.333333 | 0.333333 | 0.107143 | -0.433013 |
| t+3 | t+4 | 588 | 0.333333 | 0.333333 | 0.107143 | -0.433013 |
| t+1 | t+2 | 588 | 0.333333 | 0.333333 | 0.107143 | -0.433013 |

## Novelty Audit

- This is a family-level object, so it is a real mutation from cycles 013 and 014.
- The null explanation is still standard Chebotarev/Kummer equidistribution for independent cubic residue characters.
- A promotion would require matched control-surviving covariance in Z and every required F_q[t] ladder, plus a proof path that is not just Chebotarev independence.

JSON: `logs/two-universes-protocol/cycle-015-family-cubic-chebotarev-covariance-200000.json`
SVG: `logs/two-universes-protocol/cycle-015-family-cubic-chebotarev-covariance-200000.svg`
