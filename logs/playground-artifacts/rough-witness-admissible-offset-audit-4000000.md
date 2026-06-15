# admissible-endpoint rough-witness offset bridge audit

Candidate:
for each label gap, score the first rough witness offset divided by the gap
width, standardized against random starts with the same width and locally
admissible endpoints.

Integer event limit: `4010000`; distinct gap widths:
`111`; baselines built:
`111`; max gap width: `252`.
Degenerate baseline widths: `2,4`.
Missing weak widths: `none`.

Bridge theta: `0.673671`; bridge-max theta:
`0.536948`; terminal-z theta:
`0.439626`.

## Bridge stiffness

| N | gaps | scored | real Q | real max | real terminalZ | real rmsZ | mean first/g | exception rate | Cramer Q range | W210 Q range | W2310 Q range | composite W210 Q range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22043 | 22043 | 0.337615 | 0.683949 | 28.678748 | 1.038775 | 0.558659 | 0.241845 | 0.172069..0.271860 | 0.446012..0.785897 | 0.667020..1.218812 | 0.179610..0.537646 |
| 500000 | 41537 | 41537 | 0.403823 | 0.734711 | 38.715406 | 1.047163 | 0.544931 | 0.228640 | 0.146705..0.389586 | 0.562927..1.176895 | 0.719072..1.014281 | 0.145652..0.553668 |
| 1000000 | 78497 | 78497 | 0.984037 | 1.559767 | 50.669674 | 1.046459 | 0.531080 | 0.215868 | 0.123080..0.427365 | 0.870918..1.325360 | 0.931346..1.474326 | 0.172002..0.722390 |
| 2000000 | 148932 | 148932 | 1.269097 | 1.913220 | 67.016514 | 1.044441 | 0.518722 | 0.205026 | 0.114028..0.219878 | 0.919282..1.497374 | 1.195566..1.761975 | 0.193057..0.506145 |
| 4000000 | 283145 | 283145 | 1.635914 | 2.352754 | 88.666531 | 1.042737 | 0.506784 | 0.194589 | 0.130823..0.233753 | 0.954625..1.573307 | 1.538918..1.907396 | 0.218037..0.535084 |

## Terminal aggregate z

| N | real terminalZ | Cramer range | W210 range | W2310 range | composite W210 range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 28.678748 | -0.922496..0.118319 | 14.616890..16.364256 | 18.631524..20.697647 | 2.566431..4.110997 |
| 500000 | 38.715406 | -0.393480..-0.031157 | 18.379069..20.139270 | 24.015956..25.711284 | 4.484569..5.523958 |
| 1000000 | 50.669674 | -1.097803..-0.200529 | 23.471483..25.088640 | 30.929749..32.407225 | 5.626128..6.995169 |
| 2000000 | 67.016514 | -1.218299..-0.084328 | 29.335648..31.899527 | 39.176927..41.259526 | 8.586280..9.541986 |
| 4000000 | 88.666531 | -1.683622..-0.290163 | 38.644211..40.383228 | 50.223610..52.514978 | 10.813240..12.512455 |

Endpoint dominant real gap-width buckets:
- g=24: n=10967, aggregateZ=34.905430, meanZ=0.333311, meanFirst=0.312582, exceptions=0.014680
- g=18: n=18471, aggregateZ=31.225090, meanZ=0.229752, meanFirst=0.369179, exceptions=0.023496
- g=30: n=8323, aggregateZ=29.655276, meanZ=0.325059, meanFirst=0.247859, exceptions=0.002283
- g=14: n=15130, aggregateZ=29.368777, meanZ=0.238763, meanFirst=0.419838, exceptions=0.068473
- g=10: n=23995, aggregateZ=28.829058, meanZ=0.186110, meanFirst=0.551307, exceptions=0.146947
- g=26: n=4893, aggregateZ=23.361373, meanZ=0.333973, meanFirst=0.275873, exceptions=0.004905
- g=6: n=44895, aggregateZ=22.878534, meanZ=0.107976, meanFirst=0.696462, exceptions=0.394209
- g=20: n=9082, aggregateZ=22.843399, meanZ=0.239701, meanFirst=0.312431, exceptions=0.012552
- g=12: n=28456, aggregateZ=21.280716, meanZ=0.126154, meanFirst=0.431479, exceptions=0.053767
- g=16: n=10659, aggregateZ=20.722754, meanZ=0.200719, meanFirst=0.401832, exceptions=0.018763

SVG: `logs/playground-artifacts/rough-witness-admissible-offset-audit-4000000.svg`
JSON: `logs/playground-artifacts/rough-witness-admissible-offset-audit-4000000.json`
