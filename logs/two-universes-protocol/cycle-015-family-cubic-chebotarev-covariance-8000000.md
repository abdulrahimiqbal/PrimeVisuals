# Family cubic Chebotarev covariance audit

Candidate:
test a family-level covariance residual across many cubic Kummer covers after subtracting the Chebotarev split baseline.

Statistic:
for covers A,B and active unramified labels lambda, set X_A(lambda)=1 when A is a cube in the residue field and 0 otherwise. Score

`Z_AB = sum_lambda (X_A(lambda)-1/3)(X_B(lambda)-1/3) / sqrt(|labels| * 4/81)`

The family energy is RMS of `Z_AB`; the max statistic is `max |Z_AB|`. Controls use Bernoulli(1/3) split labels with the same pair label counts plus robust multiple-testing envelopes.

## Summary

- Complete integer ladder 1M/2M/4M/8M: true
- Required q=2,5,7 field ladders: true
- Final integer within controls: true
- Final fields within controls: true
- Matched control survival: false
- Max family covariance RMS z: 0.744058
- Max pair absolute z: 2.070664

## Integer Rows

Covers: `2`, `5`, `7`, `11`, `13`, `17`, `19`, `23`, `29`, `31`

| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Z<=1000000 | 10 | 45 | 39230 | 0.904390 | 1.931153 | 1.750000 | 4.250000 | true |
| Z<=2000000 | 10 | 45 | 74410 | 0.887711 | 1.900785 | 1.750000 | 4.250000 | true |
| Z<=4000000 | 10 | 45 | 141446 | 0.746791 | 1.842622 | 1.750000 | 4.250000 | true |
| Z<=8000000 | 10 | 45 | 269774 | 0.744058 | 2.070664 | 1.750000 | 4.250000 | true |

### Integer Top Final Pairs

| A | B | labels | split A | split B | both split | cov z |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 19 | 29 | 269775 | 0.333118 | 0.332992 | 0.110040 | -2.070664 |
| 5 | 31 | 269775 | 0.333078 | 0.333748 | 0.110540 | -1.458417 |
| 5 | 17 | 269776 | 0.333076 | 0.332998 | 0.110329 | -1.367925 |
| 19 | 31 | 269774 | 0.333120 | 0.333746 | 0.110607 | -1.332312 |
| 29 | 31 | 269775 | 0.332989 | 0.333748 | 0.110600 | -1.250484 |
| 13 | 17 | 269775 | 0.332963 | 0.333000 | 0.110355 | -1.218717 |
| 7 | 19 | 269774 | 0.333412 | 0.333120 | 0.110548 | -1.211018 |
| 11 | 13 | 269775 | 0.333433 | 0.332963 | 0.110511 | -1.192725 |

## F_2[t] Rows

Covers: `t`, `t+1`, `t^2+t`, `t^2+t+1`

| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| F_2:deg1 | 4 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg2 | 4 | 3 | 1 | 0.866025 | 1.000000 | 1.750000 | 4.250000 | true |
| F_2:deg3 | 4 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg4 | 4 | 6 | 3 | 0.500000 | 0.866025 | 1.750000 | 4.250000 | true |
| F_2:deg5 | 4 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg6 | 4 | 6 | 9 | 0.841625 | 1.000000 | 1.750000 | 4.250000 | true |
| F_2:deg7 | 4 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg8 | 4 | 6 | 30 | 0.536190 | 0.821584 | 1.750000 | 4.250000 | true |
| F_2:deg9 | 4 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg10 | 4 | 6 | 99 | 0.408248 | 0.603023 | 1.750000 | 4.250000 | true |
| F_2:deg11 | 4 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg12 | 4 | 6 | 335 | 0.498131 | 1.010763 | 1.750000 | 4.250000 | true |
| F_2:deg13 | 4 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg14 | 4 | 6 | 1161 | 0.707107 | 1.056541 | 1.750000 | 4.250000 | true |
| F_2:deg15 | 4 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg16 | 4 | 6 | 4080 | 0.135582 | 0.234834 | 1.750000 | 4.250000 | true |
| F_2:deg17 | 4 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_2:deg18 | 4 | 6 | 14532 | 0.395611 | 0.547496 | 1.750000 | 4.250000 | true |

### F_2[t] Top Final Active Pairs

| A | B | labels | split A | split B | both split | cov z |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| t^2+t | t^2+t+1 | 14532 | 0.333196 | 0.333196 | 0.112029 | 0.547496 |
| t+1 | t^2+t | 14532 | 0.331888 | 0.333196 | 0.109620 | -0.522610 |
| t | t^2+t | 14532 | 0.331888 | 0.333196 | 0.109620 | -0.522610 |
| t | t+1 | 14532 | 0.331888 | 0.331888 | 0.109620 | -0.286191 |
| t+1 | t^2+t+1 | 14532 | 0.331888 | 0.333196 | 0.110721 | 0.074659 |
| t | t^2+t+1 | 14532 | 0.331888 | 0.333196 | 0.110721 | 0.074659 |

## F_5[t] Rows

Covers: `t`, `t+1`, `t+2`, `t+3`, `t+4`, `t^2+1`, `t^2+2`, `t^2+3`, `t^2+4`, `t^2+t`

| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| F_5:deg1 | 10 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_5:deg2 | 10 | 45 | 8 | 0.848528 | 2.000000 | 1.750000 | 4.250000 | true |
| F_5:deg3 | 10 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_5:deg4 | 10 | 45 | 150 | 0.904249 | 1.959592 | 1.750000 | 4.250000 | true |
| F_5:deg5 | 10 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_5:deg6 | 10 | 45 | 2580 | 0.732734 | 1.358436 | 1.750000 | 4.250000 | true |
| F_5:deg7 | 10 | 0 | NA | NA | NA | 1.750000 | 4.250000 | true |
| F_5:deg8 | 10 | 45 | 48750 | 0.664777 | 1.019049 | 1.750000 | 4.250000 | true |

### F_5[t] Top Final Active Pairs

| A | B | labels | split A | split B | both split | cov z |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| t+3 | t^2+t | 48750 | 0.333333 | 0.332308 | 0.109744 | -1.019049 |
| t+2 | t^2+t | 48750 | 0.333333 | 0.332308 | 0.109744 | -1.019049 |
| t+3 | t^2+4 | 48750 | 0.333333 | 0.332308 | 0.109744 | -1.019049 |
| t+4 | t^2+t | 48750 | 0.333333 | 0.332308 | 0.109744 | -1.019049 |
| t+2 | t^2+4 | 48750 | 0.333333 | 0.332308 | 0.109744 | -1.019049 |
| t | t^2+1 | 48750 | 0.333333 | 0.332308 | 0.109744 | -1.019049 |
| t+4 | t^2+1 | 48750 | 0.333333 | 0.332308 | 0.109744 | -1.019049 |
| t+1 | t^2+1 | 48750 | 0.333333 | 0.332308 | 0.109744 | -1.019049 |

## F_7[t] Rows

Covers: `t`, `t+1`, `t+2`, `t+3`, `t+4`, `t+5`, `t+6`, `t^2+1`, `t^2+2`, `t^2+3`

| label | covers | active pairs | min pair labels | cov RMS z | max abs cov z | RMS envelope | max envelope | within controls |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| F_7:deg1 | 10 | 45 | 4 | 0.807504 | 1.565248 | 1.750000 | 4.250000 | true |
| F_7:deg2 | 10 | 45 | 19 | 0.795578 | 2.124265 | 1.750000 | 4.250000 | true |
| F_7:deg3 | 10 | 45 | 112 | 0.613829 | 1.228385 | 1.750000 | 4.250000 | true |
| F_7:deg4 | 10 | 45 | 588 | 0.548188 | 1.484615 | 1.750000 | 4.250000 | true |
| F_7:deg5 | 10 | 45 | 3360 | 0.449669 | 1.190363 | 1.750000 | 4.250000 | true |
| F_7:deg6 | 10 | 45 | 19544 | 0.377297 | 0.768956 | 1.750000 | 4.250000 | true |
| F_7:deg7 | 10 | 45 | 117648 | 0.330053 | 0.734697 | 1.750000 | 4.250000 | true |

### F_7[t] Top Final Active Pairs

| A | B | labels | split A | split B | both split | cov z |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| t | t^2+1 | 117648 | 0.333333 | 0.333129 | 0.110567 | -0.734697 |
| t^2+2 | t^2+3 | 117648 | 0.334047 | 0.333843 | 0.111893 | 0.577262 |
| t^2+1 | t^2+2 | 117648 | 0.333129 | 0.334047 | 0.110907 | -0.577262 |
| t+4 | t^2+3 | 117648 | 0.333333 | 0.333843 | 0.110941 | -0.524784 |
| t+3 | t^2+3 | 117648 | 0.333333 | 0.333843 | 0.110941 | -0.524784 |
| t+6 | t^2+3 | 117648 | 0.333333 | 0.333843 | 0.111587 | 0.472305 |
| t+1 | t^2+3 | 117648 | 0.333333 | 0.333843 | 0.111587 | 0.472305 |
| t+5 | t^2+1 | 117648 | 0.333333 | 0.333129 | 0.111281 | 0.367348 |

## Novelty Audit

- This is a family-level object, so it is a real mutation from cycles 013 and 014.
- The null explanation is still standard Chebotarev/Kummer equidistribution for independent cubic residue characters.
- A promotion would require matched control-surviving covariance in Z and every required F_q[t] ladder, plus a proof path that is not just Chebotarev independence.

JSON: `logs/two-universes-protocol/cycle-015-family-cubic-chebotarev-covariance-8000000.json`
SVG: `logs/two-universes-protocol/cycle-015-family-cubic-chebotarev-covariance-8000000.svg`
