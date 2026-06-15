# residual-field branch persistence audit

Candidate:
weighted adjacent sign alignment of standardized AP residuals along the
local-obstruction tower.

## Integer side

Alignment theta:
`0.002374`.
Persistence-minus-half theta:
`0.002374`.

| N | real labels | real alignment | real persistence | eligible alignment range | composite alignment range | level-permutation alignment range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17978 | 0.225835 | 0.612918 | 0.283238..0.415702 | 0.283989..0.428292 | -0.046852..0.078135 |
| 200000 | 17978 | 0.225835 | 0.612918 | 0.283238..0.415702 | 0.283989..0.428292 | -0.046852..0.078135 |
| 250000 | 22038 | 0.307765 | 0.653882 | 0.279243..0.332480 | 0.302307..0.517959 | -0.089197..-0.007070 |
| 500000 | 41532 | 0.291549 | 0.645774 | 0.313010..0.499688 | 0.235564..0.440629 | -0.148208..0.065113 |
| 1000000 | 78492 | 0.228443 | 0.614221 | 0.281697..0.451082 | 0.278397..0.398247 | -0.079260..0.036938 |

Endpoint per-level real energy carried along the same branch field:

| level | labels | df | norm |
| --- | ---: | ---: | ---: |
| 6 | 78492 | 1 | 0.016180 |
| 30 | 78492 | 7 | 0.022541 |
| 210 | 78492 | 47 | 0.104321 |
| 2310 | 78492 | 479 | 0.231452 |
| 30030 | 78492 | 5759 | 0.425710 |

## Function fields

F_2[t] stages:
- factors <= degree 1: product degree 2, eligible residues 1
- factors <= degree 2: product degree 4, eligible residues 3
- factors <= degree 3: product degree 10, eligible residues 147

| degree | real labels | real alignment | real persistence | eligible alignment range | reducible alignment range | level-permutation alignment range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 13 | 630 | nan | nan | -0.019697..0.133796 | 0.086965..0.226587 | nan..nan |
| 14 | 1161 | nan | nan | 0.035697..0.237097 | nan..nan | nan..nan |
| 15 | 2182 | 0.027084 | 0.513542 | 0.040528..0.242305 | 0.060777..0.161471 | -0.082012..0.084808 |
| 16 | 4080 | nan | nan | 0.087055..0.206817 | -0.008123..0.258768 | nan..nan |

F_3[t] stages:
- factors <= degree 1: product degree 3, eligible residues 8
- factors <= degree 2: product degree 9, eligible residues 4096

| degree | real labels | real alignment | real persistence | eligible alignment range | reducible alignment range | level-permutation alignment range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 312 | nan | nan | 0.076621..0.182841 | 0.012546..0.122327 | nan..nan |
| 8 | 810 | 0.067981 | 0.533990 | 0.066563..0.132704 | 0.028677..0.103774 | 0.002772..0.062195 |
| 9 | 2184 | nan | nan | 0.033426..0.054298 | 0.014844..0.046750 | nan..nan |
| 10 | 5880 | 0.061317 | 0.530658 | 0.033199..0.076827 | 0.049928..0.066728 | -0.015120..0.030422 |

SVG: `logs/playground-artifacts/residual-branch-persistence-audit-1000000.svg`
JSON: `logs/playground-artifacts/residual-branch-persistence-audit-1000000.json`
