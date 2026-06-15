# locally whitened shift-incidence spectrum audit

Candidate:
center each fixed shift by its observed pair rate over locally admissible
opportunities, whiten the incidence columns, and score the off-diagonal
covariance spectral radius.

## Integer side

Rho theta: `-0.293607`; pairRms theta:
`-0.236994`.

| N | labels | real rho | real pairRms | mean pair rate | eligible rho range | composite rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17984 | 0.027178 | 0.005622 | 0.464851 | 0.031653..0.041306 | 0.032702..0.043147 | 0.024856..0.036385 |
| 200000 | 17984 | 0.027178 | 0.005622 | 0.464851 | 0.031653..0.041306 | 0.032702..0.043147 | 0.024856..0.036385 |
| 250000 | 22044 | 0.024975 | 0.004964 | 0.455646 | 0.026243..0.036653 | 0.029138..0.039367 | 0.024786..0.033953 |
| 500000 | 41538 | 0.021396 | 0.004793 | 0.429311 | 0.018944..0.031035 | 0.018106..0.031225 | 0.020683..0.025665 |
| 1000000 | 78498 | 0.017459 | 0.003821 | 0.405845 | 0.014423..0.021472 | 0.015602..0.021193 | 0.012989..0.016785 |

## Function fields

F_2[t] shifts: t^2 + t, t^3 + t^2, t^3 + t, t^4 + t^3 + t^2 + t, t^4 + t, t^5 + t^4 + t^3 + t, t^5 + t^3 + t^2 + t, t^6 + t^5 + t^2 + t

| degree | labels | real rho | real pairRms | mean pair rate | monic rho range | reducible rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 13 | 630 | 0.553445 | 0.100452 | 0.278968 | 0.101674..0.167313 | 0.131648..0.208305 | 0.121118..0.204995 |
| 14 | 1161 | 0.589355 | 0.101378 | 0.259690 | 0.123398..0.174812 | 0.125641..0.155724 | 0.097663..0.159020 |
| 15 | 2182 | 0.518929 | 0.085052 | 0.244615 | 0.072589..0.159289 | 0.073486..0.160664 | 0.073787..0.096863 |
| 16 | 4080 | 0.446674 | 0.079224 | 0.229350 | 0.058162..0.068720 | 0.059403..0.096078 | 0.041027..0.082432 |

F_3[t] shifts: t^3 + 2*t, 2*t^3 + t, t^4 + 2*t^2, 2*t^4 + t^2, t^4 + t^3 + 2*t^2 + 2*t, 2*t^4 + 2*t^3 + t^2 + t, t^4 + 2*t^3 + 2*t^2 + t, 2*t^4 + t^3 + t^2 + 2*t

| degree | labels | real rho | real pairRms | mean pair rate | monic rho range | reducible rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 312 | 0.438524 | 0.081704 | 0.451923 | 0.227903..0.325178 | 0.162743..0.270150 | 0.220378..0.316407 |
| 8 | 810 | 0.419848 | 0.067624 | 0.386111 | 0.119372..0.208156 | 0.113952..0.195161 | 0.133763..0.170251 |
| 9 | 2184 | 0.279534 | 0.048210 | 0.351190 | 0.097092..0.116881 | 0.055333..0.167571 | 0.076104..0.114889 |
| 10 | 5880 | 0.208143 | 0.033711 | 0.319643 | 0.052616..0.079581 | 0.047346..0.084370 | 0.053003..0.073648 |

SVG: `logs/playground-artifacts/locally-whitened-shift-spectrum-audit-1000000.svg`
JSON: `logs/playground-artifacts/locally-whitened-shift-spectrum-audit-1000000.json`
