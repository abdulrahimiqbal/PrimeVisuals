# Deep-admissible prime-gap transition copula — pilot

This is an exploratory pilot under
`logs/gap-transition-copula/PREREGISTRATION.md`. It cannot be promoted as a
discovery.

Primary statistic: lag-one correlation of cross-fitted PIT ranks after a
shrunk transition-class mean modulo `W` is removed.

- maximum endpoint: 500000
- endpoints: 500000
- cutoffs: 29, 97
- wheels: 30, 210
- seeds: 3
- pilot lead gate: FAIL

| B | endpoint | W | pairs | unseen frac | raw rank corr | transition-adjusted corr | same-B fake range | rough-composite range | order-shuffle range | strict |z| | support |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 29 | 500000 | 30 | 19492 | 0.0000 | 0.0001380 | -0.0142942 | -0.0085936..-0.0040668 | -0.0009906..0.0023965 | -0.0053158..0.0034729 | 2.95 | PASS |
| 29 | 500000 | 210 | 19492 | 0.0106 | 0.0001380 | -0.0083005 | -0.0062012..-0.0024728 | -0.0022135..0.0049314 | -0.0113880..-0.0019951 | 0.46 | PASS |
| 97 | 500000 | 30 | 19492 | 0.0000 | 0.0171857 | 0.0084204 | -0.0072538..-0.0003435 | 0.0002387..0.0049449 | -0.0106494..0.0133631 | 0.47 | PASS |
| 97 | 500000 | 210 | 19492 | 0.0106 | 0.0171857 | 0.0127615 | -0.0035175..0.0020656 | 0.0019424..0.0056134 | -0.0076745..-0.0010798 | 4.07 | PASS |

Interpretation rule: a raw adjacent-gap correlation is already known
calibration. Only the transition-adjusted correlation, compared against every
listed control family, can trigger a confirmatory run.

JSON: `logs/gap-transition-copula/gap-transition-copula-quick.json`
SVG: `logs/gap-transition-copula/gap-transition-copula-quick.svg`
