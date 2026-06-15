# gap-conditioned rough-witness offset bridge audit

Candidate:
for each label gap, score the first rough witness offset divided by the gap
width, standardize against random odd starts with the same width, and score
the bridged cumulative z-path.

Integer event limit: `510000`; distinct gap widths:
`83`; max gap width: `204`.

Bridge theta: `0.495339`; bridge-max theta:
`0.144525`; terminal-z theta:
`0.469174`.

## Bridge stiffness

| N | gaps | real Q | real max | real terminalZ | real rmsZ | mean first/g | exception rate | Cramer Q range | W210 Q range | W2310 Q range | composite W210 Q range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17983 | 0.785125 | 1.403054 | 96.992503 | 1.400818 | 0.563536 | 0.247122 | 0.415375..1.025070 | 1.193716..1.628597 | 1.308863..1.776838 | 0.185286..0.419878 |
| 200000 | 17983 | 0.785125 | 1.403054 | 96.992503 | 1.400818 | 0.563536 | 0.247122 | 0.415375..1.025070 | 1.193716..1.628597 | 1.308863..1.776838 | 0.185286..0.419878 |
| 200000 | 17983 | 0.785125 | 1.403054 | 96.992503 | 1.400818 | 0.563536 | 0.247122 | 0.415375..1.025070 | 1.193716..1.628597 | 1.308863..1.776838 | 0.185286..0.419878 |
| 250000 | 22043 | 0.883498 | 1.369063 | 106.571671 | 1.394908 | 0.558659 | 0.241845 | 0.428730..0.963416 | 1.329330..1.649009 | 1.273321..2.087276 | 0.318193..0.746464 |
| 500000 | 41537 | 1.188736 | 1.582884 | 143.652462 | 1.393935 | 0.544931 | 0.228640 | 0.388102..1.170331 | 1.464009..2.367948 | 1.800876..2.094611 | 0.210486..0.771583 |

## Terminal aggregate z

| N | real terminalZ | Cramer range | W210 range | W2310 range | composite W210 range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 96.992503 | 43.067460..46.641129 | 80.350529..82.441535 | 87.000898..88.815818 | 38.371053..40.500944 |
| 200000 | 96.992503 | 43.067460..46.641129 | 80.350529..82.441535 | 87.000898..88.815818 | 38.371053..40.500944 |
| 200000 | 96.992503 | 43.067460..46.641129 | 80.350529..82.441535 | 87.000898..88.815818 | 38.371053..40.500944 |
| 250000 | 106.571671 | 47.807690..50.327009 | 87.673342..90.209382 | 94.486944..96.842083 | 43.794272..45.989565 |
| 500000 | 143.652462 | 64.762207..66.810483 | 116.754208..118.709721 | 126.669914..128.219326 | 62.613480..64.332121 |

Endpoint dominant real gap-width buckets:
- g=4: n=4558, aggregateZ=94.325768, meanZ=1.397151, meanFirst=1.000000, exceptions=1.000000
- g=6: n=7474, aggregateZ=59.708906, meanZ=0.690657, meanFirst=0.703059, exceptions=0.410490
- g=10: n=3842, aggregateZ=58.616631, meanZ=0.945676, meanFirst=0.557782, exceptions=0.155648
- g=18: n=2512, aggregateZ=38.047696, meanZ=0.759134, meanFirst=0.387429, exceptions=0.029459
- g=14: n=2281, aggregateZ=36.688615, meanZ=0.768190, meanFirst=0.433958, exceptions=0.085050
- g=12: n=4237, aggregateZ=35.783476, meanZ=0.549735, meanFirst=0.441075, exceptions=0.062072
- g=22: n=1101, aggregateZ=33.418452, meanZ=1.007147, meanFirst=0.368425, exceptions=0.029064
- g=16: n=1512, aggregateZ=30.354563, meanZ=0.780635, meanFirst=0.404266, exceptions=0.024471
- g=28: n=609, aggregateZ=25.366179, meanZ=1.027889, meanFirst=0.298968, exceptions=0.004926
- g=24: n=1278, aggregateZ=24.045388, meanZ=0.672615, meanFirst=0.332420, exceptions=0.022692

SVG: `logs/playground-artifacts/rough-witness-offset-bridge-audit-500000.svg`
JSON: `logs/playground-artifacts/rough-witness-offset-bridge-audit-500000.json`
