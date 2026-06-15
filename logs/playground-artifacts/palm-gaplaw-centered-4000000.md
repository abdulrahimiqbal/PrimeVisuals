# Cross-fitted Palm gap-law residual audit

Train on records with `p_i<=N/2`: for each gap width `g`, estimate the mean and variance of `U_i=exp(-int dt/log(t))-1/2`. Score only second-half records by `(U_i-m_g)/s_g`; rare/unseen gaps use the global train mean and variance.

## Real endpoint trace

| N | test count | sum | mean | Z | max abs Z | energy Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2250000 | 17148 | 16359.914828 | 0.954042 | 124.932175 | 124.932175 | 129.161143 |
| 2500000 | 34139 | 34138.959606 | 0.999999 | 184.767203 | 184.767203 | 181.798843 |
| 3000000 | 67883 | 73415.556652 | 1.081501 | 281.778325 | 281.778325 | 254.975145 |
| 3500000 | 101217 | 116799.207633 | 1.153949 | 367.124329 | 367.124329 | 309.654402 |
| 4000000 | 134212 | 163601.163664 | 1.218976 | 446.571203 | 446.571203 | 354.910829 |

Fit summary:

- train count: 148932
- test count: 134212
- global train mean: -0.039196
- global train sd: 0.242771
- usable gap means: 43/60
- fallback test records: 86
- residual mean: 1.218976
- residual mean abs: 1.221399
- residual range: -1.897945..4.720865

## Control summary at full range

| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range |
| --- | ---: | ---: | ---: | ---: | ---: |
| shuffle | 134212..134212 | 446.571203..446.571203 | 446.571203..446.571203 | 354.910829..354.910829 | 0.999216..1.001052 |
| bootstrap | 134212..134212 | 445.924316..447.269834 | 445.924316..447.269834 | 354.811432..355.070369 | 0.998189..1.001615 |
| signFlip | 134212..134212 | -1.553229..1.816737 | 1.561404..4.253409 | -1.234423..1.443845 | 0.068787..0.821970 |
| cramerLabel | 133958..134759 | 441.144685..444.404567 | 441.144685..444.404567 | 354.322313..355.964281 | 1.116464..1.118017 |
| wheel210 | 134041..134731 | 445.802630..448.078811 | 445.802630..448.078811 | 355.206780..356.128930 | 1.116153..1.118880 |
| wheel2310 | 133767..134660 | 446.850326..449.673083 | 446.850326..449.673083 | 354.892276..356.523808 | 1.115390..1.118353 |

Final holdout block:

- real `(7N/8,N]`: count 32995, Z 257.655809.
- shuffle: count 32995..32995, Z 220.896374..221.859487.
- bootstrap: count 32995..32995, Z 221.010723..221.634701.
- signFlip: count 32995..32995, Z -2.908975..2.224693.
- cramerLabel: count 32816..33308, Z 254.061277..256.272883.
- wheel210: count 32921..33268, Z 257.239136..259.010311.
- wheel2310: count 32852..33293, Z 257.871651..259.681895.

Named composite checks:

| n | prime-gap event? | reason |
| ---: | --- | --- |
| 25 | no | the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label |
| 35 | no | the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label |
| 77 | no | the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label |
| 289 | no | the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label |

Factor check:

The raw Cycle 84 one-point Palm gap bias is removed by first-half gap-width centering. Any remaining line must be judged against residual shuffles/sign flips and against Cramer/Wheel labels processed with the same train/test protocol.

Break verdict at N=4000000: real endpoint Z 446.571203, max abs Z 446.571203.

SVG: `logs/playground-artifacts/palm-gaplaw-centered-4000000.svg`
JSON: `logs/playground-artifacts/palm-gaplaw-centered-4000000.json`