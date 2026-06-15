# Deep-admissible next-gap PIT audit

For each consecutive event gap after `100000`, compute the discrete mid-PIT score under `h_B(n)=A_B(n)*rho_B/log(n)`, where `A_B(n)=1` when `n` has no prime divisor `<=B`. Main cutoff: `97`.

## Main real endpoint trace

| N | scored count | sum | mean | Z | max abs Z | energy Z |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 12452 | 59.773978 | 0.004800 | 0.535664 | 0.547889 | 2.270663 |
| 500000 | 31946 | 133.364605 | 0.004175 | 0.746161 | 0.775800 | 3.086917 |
| 1000000 | 68906 | 281.301341 | 0.004082 | 1.071626 | 1.074534 | 4.340235 |
| 2000000 | 139341 | 295.472891 | 0.002121 | 0.791550 | 1.074534 | 3.146873 |
| 3000000 | 207224 | 352.842389 | 0.001703 | 0.775105 | 1.074534 | 3.052188 |
| 4000000 | 273553 | 347.437061 | 0.001270 | 0.664286 | 1.074534 | 2.598379 |

Main PIT summary:

- start after: 100000
- rho_B: 8.311357
- small prime count: 25
- scored count: 273553
- skipped early pairs: 9591
- impossible observed next events: 0
- value mean: 0.001270
- value mean abs: 0.241725
- value range: -0.226632..0.499998

## Cutoff family on real primes

| B | rho_B | scored | value mean | endpoint Z | max abs Z | theta max sum | same-B fake endpoint Z range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 2.000000 | 273553 | 0.021977 | 11.494224 | 11.495037 | 0.942759 | -0.636299..0.802173 |
| 5 | 3.750000 | 273553 | 0.008279 | 4.330365 | 4.332341 | 0.937829 | -0.828127..0.302847 |
| 11 | 4.812500 | 273553 | 0.004325 | 2.262118 | 2.265950 | 0.889166 | -0.446093..0.537134 |
| 29 | 6.331229 | 273553 | 0.001737 | 0.908350 | 0.956810 | 0.879467 | -0.386430..0.458344 |
| 97 | 8.311357 | 273553 | 0.001270 | 0.664286 | 1.074534 | 0.587677 | -0.380874..0.355473 |

## Main control summary at full range

| control | count range | endpoint Z range | max abs Z range | energy Z range | theta max sum range | value mean range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| shuffle | 273553..273553 | 0.664286..0.664286 | 0.702369..1.014626 | 2.598379..2.598379 | 0.519039..1.047745 | 0.000000..0.000000 |
| bootstrap | 273553..273553 | 0.563303..1.059042 | 0.636218..1.071555 | 2.202872..4.137954 | 0.581659..1.108748 | 0.000000..0.000000 |
| signFlip | 273553..273553 | -0.452927..0.316063 | 0.459124..0.826836 | -1.771641..1.236291 | 0.261058..0.764895 | 0.000000..0.000000 |
| centeredShuffle | 273553..273553 | 0.000000..0.000000 | 0.481938..0.772409 | 0.000000..0.000000 | 0.157153..0.516670 | 0.000000..0.000000 |
| sameCutoff | 273841..274771 | -0.380874..0.355473 | 0.372700..0.775715 | -1.492670..1.390470 | 0.301055..0.936745 | -0.000727..0.000679 |

Final holdout block:

- real final block: count 66329, Z -0.020988.
- shuffle: count 66329..66329, Z 0.028508..0.964210.
- bootstrap: count 66329..66329, Z 0.059363..0.742350.
- signFlip: count 66329..66329, Z -0.386831..0.280943.
- centeredShuffle: count 66329..66329, Z -0.165122..0.307256.
- sameCutoff: count 66100..66726, Z -0.371670..0.319371.

Named composite checks:

| n | consecutive-prime event? | reason |
| ---: | --- | --- |
| 25 | no | the statistic is scored on a consecutive prime/event pair p_i<p_{i+1}; this composite is not a prime event label |
| 35 | no | the statistic is scored on a consecutive prime/event pair p_i<p_{i+1}; this composite is not a prime event label |
| 77 | no | the statistic is scored on a consecutive prime/event pair p_i<p_{i+1}; this composite is not a prime event label |
| 289 | no | the statistic is scored on a consecutive prime/event pair p_i<p_{i+1}; this composite is not a prime event label |

Factor check:

This is not a raw gap sum, not the `Li-pi` hazard telescope, and not a rolling empirical center. It is an explicit finite-admissibility survival distribution. A survivor must beat same-cutoff fake labels and residual order controls.

Break verdict at N=4000000: real B97 endpoint Z 0.664286, max abs Z 1.074534.

SVG: `logs/playground-artifacts/deep-admissible-gap-pit-4000000.svg`
JSON: `logs/playground-artifacts/deep-admissible-gap-pit-4000000.json`