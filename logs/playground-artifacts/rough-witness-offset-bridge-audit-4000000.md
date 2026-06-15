# gap-conditioned rough-witness offset bridge audit

Candidate:
for each label gap, score the first rough witness offset divided by the gap
width, standardize against random odd starts with the same width, and score
the bridged cumulative z-path.

Integer event limit: `4010000`; distinct gap widths:
`111`; max gap width: `252`.

Bridge theta: `0.548737`; bridge-max theta:
`0.532026`; terminal-z theta:
`0.462298`.

## Bridge stiffness

| N | gaps | real Q | real max | real terminalZ | real rmsZ | mean first/g | exception rate | Cramer Q range | W210 Q range | W2310 Q range | composite W210 Q range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22043 | 0.953557 | 1.460351 | 108.260032 | 1.402741 | 0.558659 | 0.241845 | 0.459258..1.005520 | 1.423498..1.758912 | 1.329103..2.167253 | 0.327374..0.756749 |
| 500000 | 41537 | 1.294362 | 1.728170 | 145.772911 | 1.400751 | 0.544931 | 0.228640 | 0.446826..1.223698 | 1.561427..2.457770 | 1.881637..2.184878 | 0.196470..0.779604 |
| 1000000 | 78497 | 2.220727 | 3.197986 | 194.987783 | 1.389102 | 0.531080 | 0.215868 | 0.696026..1.615502 | 2.022609..2.830566 | 2.264257..2.858662 | 0.291121..0.480763 |
| 2000000 | 148932 | 2.885182 | 4.133179 | 262.145550 | 1.378882 | 0.518722 | 0.205026 | 1.096363..1.827984 | 2.552516..3.391925 | 2.878304..3.621348 | 0.183185..0.446555 |
| 4000000 | 283145 | 3.681865 | 5.159946 | 353.012177 | 1.368836 | 0.506784 | 0.194589 | 1.860515..2.337406 | 3.080627..3.977007 | 3.968319..4.284954 | 0.290671..0.686163 |

## Terminal aggregate z

| N | real terminalZ | Cramer range | W210 range | W2310 range | composite W210 range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 108.260032 | 49.617762..52.104961 | 89.802688..92.371110 | 96.519314..98.863306 | 44.690484..46.932718 |
| 500000 | 145.772911 | 67.114149..69.150919 | 119.471733..121.565996 | 129.237928..130.807977 | 64.015947..65.686044 |
| 1000000 | 194.987783 | 89.933812..91.260977 | 158.536813..161.126313 | 171.492518..174.475219 | 88.516794..90.622410 |
| 2000000 | 262.145550 | 121.041470..122.060080 | 211.716234..215.201539 | 229.791575..231.769475 | 123.320216..125.598020 |
| 4000000 | 353.012177 | 161.362392..163.803368 | 285.685067..287.946006 | 307.402154..309.661396 | 171.146148..173.666062 |

Endpoint dominant real gap-width buckets:
- g=4: n=26628, aggregateZ=233.305295, meanZ=1.429734, meanFirst=1.000000, exceptions=1.000000
- g=10: n=23995, aggregateZ=153.548961, meanZ=0.991258, meanFirst=0.551307, exceptions=0.146947
- g=6: n=44895, aggregateZ=147.481889, meanZ=0.696049, meanFirst=0.696462, exceptions=0.394209
- g=18: n=18471, aggregateZ=93.200254, meanZ=0.685760, meanFirst=0.369179, exceptions=0.023496
- g=12: n=28456, aggregateZ=83.544465, meanZ=0.495257, meanFirst=0.431479, exceptions=0.053767
- g=22: n=8081, aggregateZ=80.857900, meanZ=0.899477, meanFirst=0.357280, exceptions=0.021779
- g=16: n=10659, aggregateZ=72.271770, meanZ=0.700020, meanFirst=0.401832, exceptions=0.018763
- g=14: n=15130, aggregateZ=69.698199, meanZ=0.566633, meanFirst=0.419838, exceptions=0.068473
- g=24: n=10967, aggregateZ=67.646394, meanZ=0.645953, meanFirst=0.312582, exceptions=0.014680
- g=8: n=18804, aggregateZ=57.585544, meanZ=0.419941, meanFirst=0.557674, exceptions=0.187301

SVG: `logs/playground-artifacts/rough-witness-offset-bridge-audit-4000000.svg`
JSON: `logs/playground-artifacts/rough-witness-offset-bridge-audit-4000000.json`
