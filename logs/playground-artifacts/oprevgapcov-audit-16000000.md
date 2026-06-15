# oprevgapcov audit

Candidate:
`mean((omega(label-1)-E[omega(label-1)|label mod 210])*(gap/log(label)-1))`.

The app primitive uses `log(log(p))` centering for a quick view; this audit
uses endpoint-local residue-class centering modulo `210`.

## Real primes

| N | events | covariance mean | Pearson r | z=r*sqrt(events) |
| ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78452 | -0.00397095 | -0.00802167 | -2.247 |
| 2000000 | 148887 | -0.00430237 | -0.00823304 | -3.177 |
| 4000000 | 283100 | -0.00406771 | -0.00744599 | -3.962 |
| 8000000 | 539731 | -0.00355370 | -0.00625985 | -4.599 |
| 16000000 | 1031083 | -0.00440152 | -0.00747481 | -7.590 |

## Control summary at N=16000000

| group | covariance range | r range | z range | full path covariance range |
| --- | ---: | ---: | ---: | ---: |
| ordinary Cramer | -0.00036835 .. 0.00088855 | -0.00058248 .. 0.00140943 | -0.592 .. 1.433 | -0.00167464 .. 0.00143475 |
| W=210 fake labels | -0.00104935 .. 0.00081133 | -0.00174168 .. 0.00134479 | -1.770 .. 1.366 | -0.00134396 .. 0.00129432 |
| residue-count-matched composite | -0.00739640 .. -0.00538802 | -0.01214717 .. -0.00885713 | -12.335 .. -8.994 | -0.02137599 .. -0.00538802 |

SVG: `logs/playground-artifacts/oprevgapcov-audit-16000000.svg`
JSON: `logs/playground-artifacts/oprevgapcov-audit-16000000.json`
