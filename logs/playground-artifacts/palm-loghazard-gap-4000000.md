# Palm log-hazard gap audit

For consecutive labels `p_i<p_{i+1}`, define `Lambda_i=int_{p_i}^{p_{i+1}} dt/log(t)` by Simpson integration and score `U_i=exp(-Lambda_i)-1/2`.

The raw score `Lambda_i-1` is separately reported as the forbidden telescope: cumulatively it is `Li(p)-pi(p)` at prime endpoints up to endpoint constants.

## Endpoint trace

| N | pairs | mean U | Z | max abs Z | energy Z | theta max sum | raw telescope Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22043 | -0.046229 | -23.775952 | 23.782480 | -28.675506 | 0.915628 | 1.152983 |
| 500000 | 41537 | -0.044050 | -31.099775 | 31.100421 | -37.190661 | 0.915628 | 1.152617 |
| 1000000 | 78497 | -0.041913 | -40.678565 | 40.683180 | -48.181519 | 0.915628 | 1.590085 |
| 2000000 | 148932 | -0.039196 | -52.399468 | 52.401192 | -61.510758 | 0.915628 | 1.085036 |
| 4000000 | 283144 | -0.037443 | -69.018095 | 69.019356 | -80.453719 | 0.915628 | 1.329263 |

Pair summary:

- count: 283144
- mean gap: 14.126974
- mean Lambda: 1.000721
- mean exp(-Lambda): 0.462557
- mean U: -0.037443
- gap range: 2..148
- Lambda range: 0.131564..10.197018

## Control summary at full range

| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range |
| --- | ---: | ---: | ---: | ---: | ---: |
| shuffle | 283144..283144 | -69.018095..-69.018095 | 69.018095..69.044949 | -80.453719..-80.453719 | 0.975887..1.019325 |
| bootstrap | 283144..283144 | -70.419086..-67.296007 | 67.299401..70.420507 | -82.215904..-78.427668 | 0.969866..1.013118 |
| poissonHazard | 283144..283144 | -1.082684..2.057123 | 1.601772..3.554601 | -1.082378..2.056428 | 0.012541..0.691678 |
| cramerLabel | 282623..284733 | -49.805943..-46.472828 | 46.504109..49.805943 | -56.575810..-52.917572 | 0.879970..0.943544 |
| wheel210 | 282728..283911 | -62.165250..-60.754597 | 60.754597..62.175975 | -72.046421..-70.483642 | 0.903765..0.935429 |
| wheel2310 | 282711..283928 | -64.419305..-61.762845 | 61.767583..64.434052 | -74.871323..-71.777519 | 0.912861..0.935493 |

Final holdout block:

- real `(N/2,N]`: count 134212, Z -45.048668.
- shuffle: count 134212..134212, Z -48.847907..-46.374899.
- bootstrap: count 134212..134212, Z -49.129163..-45.906980.
- poissonHazard: count 134212..134212, Z -1.034632..1.055011.
- cramerLabel: count 133958..134759, Z -32.598240..-30.637972.
- wheel210: count 134041..134731, Z -41.568317..-38.944222.
- wheel2310: count 133767..134660, Z -42.493360..-40.348986.

Named composite checks:

| n | prime-gap event? | reason |
| ---: | --- | --- |
| 25 | no | the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label |
| 35 | no | the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label |
| 77 | no | the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label |
| 289 | no | the statistic is indexed by a consecutive-prime left endpoint p_i; this composite is not a prime-gap event label |

Factor check:

The nonlinear score is not the raw `Li-pi` telescope, but it is absorbed by the empirical gap-value shuffle and wheel-random controls. Its endpoint is fixed by the observed mean of `exp(-Lambda)`, so a large line here is gap-distribution bias rather than a new prime critical line.

SVG: `logs/playground-artifacts/palm-loghazard-gap-4000000.svg`
JSON: `logs/playground-artifacts/palm-loghazard-gap-4000000.json`