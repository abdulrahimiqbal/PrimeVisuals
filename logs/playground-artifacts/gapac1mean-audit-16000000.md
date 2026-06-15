# gapac1mean audit

Candidate: `gapac1mean(x)=mean((g_i/log p_i - 1)*(g_{i+1}/log p_{i+1} - 1))`.

Preregistered confirmation: stable flat negative line whose effect size beats
five Cramer and composite controls.

Preregistered break: known consecutive-gap anti-correlation/local-residue layer,
unstable effect, or control reproduction.

## Endpoint means for real primes

| N | pairs | mean | se | z |
| ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78496 | -0.03616362 | 0.00221361 | -16.337 |
| 2000000 | 148931 | -0.03768670 | 0.00164981 | -22.843 |
| 4000000 | 283144 | -0.03392586 | 0.00124005 | -27.358 |
| 8000000 | 539775 | -0.03269523 | 0.00090693 | -36.050 |
| 16000000 | 1031128 | -0.03042431 | 0.00066691 | -45.620 |

## Summary at N=16000000

| series | pairs | mean | se | z |
| --- | ---: | ---: | ---: | ---: |
| real-primes | 1031128 | -0.03042431 | 0.00066691 | -45.620 |
| cramer-seed-12345 | 1030751 | -0.00224225 | 0.00079370 | -2.825 |
| cramer-seed-271828 | 1031602 | -0.00245580 | 0.00079800 | -3.077 |
| cramer-seed-314159 | 1030749 | -0.00090743 | 0.00079672 | -1.139 |
| cramer-seed-161803 | 1033064 | -0.00081627 | 0.00078975 | -1.034 |
| cramer-seed-424242 | 1034418 | -0.00041838 | 0.00078692 | -0.532 |
| wheel-W210-seed-12345 | 1031364 | -0.01103866 | 0.00073382 | -15.043 |
| wheel-W210-seed-271828 | 1030851 | -0.01204309 | 0.00073350 | -16.419 |
| wheel-W210-seed-314159 | 1031631 | -0.01181073 | 0.00073006 | -16.178 |
| wheel-W210-seed-161803 | 1032320 | -0.01163717 | 0.00072927 | -15.957 |
| wheel-W210-seed-424242 | 1033840 | -0.01145157 | 0.00072768 | -15.737 |
| composite-W210-seed-12345 | 738139 | 0.14492582 | 0.00200571 | 72.257 |
| composite-W210-seed-271828 | 738543 | 0.14054785 | 0.00199164 | 70.569 |
| composite-W210-seed-314159 | 738989 | 0.14259430 | 0.00200299 | 71.191 |
| composite-W210-seed-161803 | 739544 | 0.14092039 | 0.00199714 | 70.561 |
| composite-W210-seed-424242 | 740941 | 0.13868084 | 0.00198640 | 69.815 |

SVG: `logs/playground-artifacts/gapac1mean-audit-16000000.svg`
JSON: `logs/playground-artifacts/gapac1mean-audit-16000000.json`
