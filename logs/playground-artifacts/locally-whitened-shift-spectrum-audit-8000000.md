# locally whitened shift-incidence spectrum audit

Candidate:
center each fixed shift by its observed pair rate over locally admissible
opportunities, whiten the incidence columns, and score the off-diagonal
covariance spectral radius.

## Integer side

Rho theta: `0.029639`; pairRms theta:
`-0.152768`.

| N | labels | real rho | real pairRms | mean pair rate | eligible rho range | composite rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41538 | 0.021396 | 0.004793 | 0.429311 | 0.018944..0.031035 | 0.018106..0.031225 | 0.020683..0.025665 |
| 1000000 | 78498 | 0.017459 | 0.003821 | 0.405845 | 0.014423..0.021472 | 0.015602..0.021193 | 0.012989..0.016785 |
| 2000000 | 148933 | 0.020304 | 0.003638 | 0.384332 | 0.009449..0.014938 | 0.009566..0.018750 | 0.008630..0.015016 |
| 4000000 | 283146 | 0.020698 | 0.003127 | 0.365322 | 0.005769..0.009035 | 0.006060..0.012496 | 0.007212..0.011568 |
| 8000000 | 539777 | 0.021600 | 0.003245 | 0.347959 | 0.005960..0.007371 | 0.007471..0.011577 | 0.005023..0.006394 |

## Function fields

F_2[t] shifts: t^2 + t, t^3 + t^2, t^3 + t, t^4 + t^3 + t^2 + t, t^4 + t, t^5 + t^4 + t^3 + t, t^5 + t^3 + t^2 + t, t^6 + t^5 + t^2 + t

| degree | labels | real rho | real pairRms | mean pair rate | monic rho range | reducible rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 19 | 27594 | 0.360630 | 0.064056 | 0.193656 | 0.023088..0.041157 | 0.020171..0.035413 | 0.024154..0.030145 |
| 20 | 52377 | 0.345067 | 0.059883 | 0.183917 | 0.011008..0.028390 | 0.016176..0.023177 | 0.015016..0.022376 |
| 21 | 99858 | 0.329221 | 0.056846 | 0.174666 | 0.014396..0.016401 | 0.010941..0.017165 | 0.012223..0.015904 |
| 22 | 190557 | 0.313324 | 0.054231 | 0.167430 | 0.007840..0.013374 | 0.008233..0.011506 | 0.009000..0.010670 |

F_3[t] shifts: t^3 + 2*t, 2*t^3 + t, t^4 + 2*t^2, 2*t^4 + t^2, t^4 + t^3 + 2*t^2 + 2*t, 2*t^4 + 2*t^3 + t^2 + t, t^4 + 2*t^3 + 2*t^2 + t, 2*t^4 + t^3 + t^2 + 2*t

| degree | labels | real rho | real pairRms | mean pair rate | monic rho range | reducible rho range | column-null rho range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5880 | 0.208143 | 0.033711 | 0.319643 | 0.052616..0.079581 | 0.047346..0.084370 | 0.053003..0.073648 |
| 11 | 16104 | 0.248863 | 0.037074 | 0.285581 | 0.035534..0.055798 | 0.029241..0.044492 | 0.035147..0.056744 |
| 12 | 44220 | 0.210107 | 0.030450 | 0.263529 | 0.015518..0.033587 | 0.021421..0.030126 | 0.019375..0.023926 |
| 13 | 122640 | 0.187906 | 0.027158 | 0.242551 | 0.009864..0.013916 | 0.010614..0.016320 | 0.010462..0.014541 |

SVG: `logs/playground-artifacts/locally-whitened-shift-spectrum-audit-8000000.svg`
JSON: `logs/playground-artifacts/locally-whitened-shift-spectrum-audit-8000000.json`
