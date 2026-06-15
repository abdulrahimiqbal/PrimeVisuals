# admissible-endpoint rough-witness offset bridge audit

Candidate:
for each label gap, score the first rough witness offset divided by the gap
width, standardized against random starts with the same width and locally
admissible endpoints.

Integer event limit: `510000`; distinct gap widths:
`83`; baselines built:
`83`; max gap width: `204`.
Degenerate baseline widths: `2,4`.
Missing weak widths: `none`.

Bridge theta: `0.210782`; bridge-max theta:
`-0.236473`; terminal-z theta:
`0.465284`.

## Bridge stiffness

| N | gaps | scored | real Q | real max | real terminalZ | real rmsZ | mean first/g | exception rate | Cramer Q range | W210 Q range | W2310 Q range | composite W210 Q range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17983 | 17983 | 0.337578 | 0.690675 | 27.006102 | 1.045751 | 0.563536 | 0.247122 | 0.190348..0.370249 | 0.440670..0.885375 | 0.614224..1.033767 | 0.211761..0.323495 |
| 200000 | 17983 | 17983 | 0.337578 | 0.690675 | 27.006102 | 1.045751 | 0.563536 | 0.247122 | 0.190348..0.370249 | 0.440670..0.885375 | 0.614224..1.033767 | 0.211761..0.323495 |
| 200000 | 17983 | 17983 | 0.337578 | 0.690675 | 27.006102 | 1.045751 | 0.563536 | 0.247122 | 0.190348..0.370249 | 0.440670..0.885375 | 0.614224..1.033767 | 0.211761..0.323495 |
| 250000 | 22043 | 22043 | 0.339969 | 0.600476 | 29.536596 | 1.042162 | 0.558659 | 0.241845 | 0.172206..0.271700 | 0.437911..0.779816 | 0.667007..1.209136 | 0.178399..0.522247 |
| 500000 | 41537 | 41537 | 0.402620 | 0.566250 | 39.866694 | 1.050117 | 0.544931 | 0.228640 | 0.154443..0.413822 | 0.538617..1.185094 | 0.734671..1.027444 | 0.149085..0.554246 |

## Terminal aggregate z

| N | real terminalZ | Cramer range | W210 range | W2310 range | composite W210 range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 27.006102 | -0.634259..0.735617 | 14.365732..15.594261 | 18.511110..20.026821 | 2.176434..4.026011 |
| 200000 | 27.006102 | -0.634259..0.735617 | 14.365732..15.594261 | 18.511110..20.026821 | 2.176434..4.026011 |
| 200000 | 27.006102 | -0.634259..0.735617 | 14.365732..15.594261 | 18.511110..20.026821 | 2.176434..4.026011 |
| 250000 | 29.536596 | -0.530287..0.533873 | 15.309391..17.055705 | 19.430104..21.554411 | 3.002645..4.574949 |
| 500000 | 39.866694 | 0.204934..0.589665 | 19.334524..20.995175 | 25.091231..26.852650 | 5.070892..6.196100 |

Endpoint dominant real gap-width buckets:
- g=18: n=2512, aggregateZ=17.547985, meanZ=0.350120, meanFirst=0.387429, exceptions=0.029459
- g=14: n=2281, aggregateZ=16.237051, meanZ=0.339973, meanFirst=0.433958, exceptions=0.085050
- g=24: n=1278, aggregateZ=15.041253, meanZ=0.420745, meanFirst=0.332420, exceptions=0.022692
- g=10: n=3842, aggregateZ=14.429331, meanZ=0.232792, meanFirst=0.557782, exceptions=0.155648
- g=20: n=1214, aggregateZ=14.012332, meanZ=0.402162, meanFirst=0.335008, exceptions=0.020593
- g=12: n=4237, aggregateZ=13.275855, meanZ=0.203954, meanFirst=0.441075, exceptions=0.062072
- g=6: n=7474, aggregateZ=12.416920, meanZ=0.143627, meanFirst=0.703059, exceptions=0.410490
- g=30: n=862, aggregateZ=10.258844, meanZ=0.349418, meanFirst=0.255298, exceptions=0.002320
- g=28: n=609, aggregateZ=9.041302, meanZ=0.366372, meanFirst=0.298968, exceptions=0.004926
- g=40: n=195, aggregateZ=8.815513, meanZ=0.631292, meanFirst=0.238462, exceptions=0.000000

SVG: `logs/playground-artifacts/rough-witness-admissible-offset-audit-500000.svg`
JSON: `logs/playground-artifacts/rough-witness-admissible-offset-audit-500000.json`
