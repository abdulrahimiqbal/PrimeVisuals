# gapac1mean audit

Candidate: `gapac1mean(x)=mean((g_i/log p_i - 1)*(g_{i+1}/log p_{i+1} - 1))`.

Preregistered confirmation: stable flat negative line whose effect size beats
five Cramer and composite controls.

Preregistered break: known consecutive-gap anti-correlation/local-residue layer,
unstable effect, or control reproduction.

## Endpoint means for real primes

| N | pairs | mean | se | z |
| ---: | ---: | ---: | ---: | ---: |
| 250000 | 22042 | -0.04686839 | 0.00387940 | -12.081 |
| 500000 | 41536 | -0.03640566 | 0.00297523 | -12.236 |
| 1000000 | 78496 | -0.03616362 | 0.00221361 | -16.337 |
| 2000000 | 148931 | -0.03768670 | 0.00164981 | -22.843 |
| 4000000 | 283144 | -0.03392586 | 0.00124005 | -27.358 |

## Summary at N=4000000

| series | pairs | mean | se | z |
| --- | ---: | ---: | ---: | ---: |
| real-primes | 283144 | -0.03392586 | 0.00124005 | -27.358 |
| cramer-seed-12345 | 283082 | -0.00316749 | 0.00147420 | -2.149 |
| cramer-seed-271828 | 283529 | -0.00434047 | 0.00149329 | -2.907 |
| cramer-seed-314159 | 282623 | -0.00106574 | 0.00151070 | -0.705 |
| cramer-seed-161803 | 283063 | 0.00133098 | 0.00149109 | 0.893 |
| cramer-seed-424242 | 284733 | -0.00047353 | 0.00144845 | -0.327 |
| wheel-W210-seed-12345 | 283451 | -0.01452553 | 0.00134862 | -10.771 |
| wheel-W210-seed-271828 | 283004 | -0.01570794 | 0.00135303 | -11.609 |
| wheel-W210-seed-314159 | 283409 | -0.01365624 | 0.00134488 | -10.154 |
| wheel-W210-seed-161803 | 282947 | -0.01243147 | 0.00136518 | -9.106 |
| wheel-W210-seed-424242 | 284236 | -0.00982368 | 0.00135754 | -7.236 |
| composite-W210-seed-12345 | 195001 | 0.18654935 | 0.00422716 | 44.131 |
| composite-W210-seed-271828 | 194807 | 0.18321991 | 0.00416123 | 44.030 |
| composite-W210-seed-314159 | 194727 | 0.18966090 | 0.00424916 | 44.635 |
| composite-W210-seed-161803 | 194726 | 0.19575567 | 0.00432022 | 45.311 |
| composite-W210-seed-424242 | 195782 | 0.19152536 | 0.00426234 | 44.934 |

SVG: `logs/playground-artifacts/gapac1mean-audit-4000000.svg`
JSON: `logs/playground-artifacts/gapac1mean-audit-4000000.json`
