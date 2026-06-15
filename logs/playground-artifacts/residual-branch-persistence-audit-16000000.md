# residual-field branch persistence audit

Candidate:
weighted adjacent sign alignment of standardized AP residuals along the
local-obstruction tower.

## Integer side

Alignment theta:
`0.069785`.
Persistence-minus-half theta:
`0.069785`.

| N | real labels | real alignment | real persistence | eligible alignment range | composite alignment range | level-permutation alignment range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78492 | 0.228443 | 0.614221 | 0.281697..0.451082 | 0.278397..0.398247 | -0.079260..0.036938 |
| 2000000 | 148927 | 0.283901 | 0.641950 | 0.294499..0.495559 | 0.249393..0.596045 | -0.180440..0.122242 |
| 4000000 | 283140 | 0.374054 | 0.687027 | 0.336911..0.415616 | 0.322035..0.397945 | -0.071069..0.079697 |
| 8000000 | 539771 | 0.289061 | 0.644530 | 0.312376..0.433173 | 0.308411..0.575872 | -0.028440..0.056715 |
| 16000000 | 1031124 | 0.288339 | 0.644170 | 0.348110..0.447200 | 0.296694..0.386235 | -0.133725..0.097795 |

Endpoint per-level real energy carried along the same branch field:

| level | labels | df | norm |
| --- | ---: | ---: | ---: |
| 6 | 1031124 | 1 | 0.129674 |
| 30 | 1031124 | 7 | 0.070501 |
| 210 | 1031124 | 47 | 0.107131 |
| 2310 | 1031124 | 479 | 0.190153 |
| 30030 | 1031124 | 5759 | 0.352949 |

## Function fields

F_2[t] stages:
- factors <= degree 1: product degree 2, eligible residues 1
- factors <= degree 2: product degree 4, eligible residues 3
- factors <= degree 3: product degree 10, eligible residues 147

| degree | real labels | real alignment | real persistence | eligible alignment range | reducible alignment range | level-permutation alignment range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 19 | 27594 | nan | nan | 0.049913..0.178159 | 0.032273..0.114039 | nan..nan |
| 20 | 52377 | nan | nan | 0.080907..0.250473 | 0.019931..0.108150 | nan..nan |
| 21 | 99858 | -0.038193 | 0.480904 | 0.024383..0.200959 | 0.016304..0.162551 | -0.084789..0.010641 |
| 22 | 190557 | nan | nan | 0.007438..0.219611 | 0.020388..0.168297 | nan..nan |

F_3[t] stages:
- factors <= degree 1: product degree 3, eligible residues 8
- factors <= degree 2: product degree 9, eligible residues 4096

| degree | real labels | real alignment | real persistence | eligible alignment range | reducible alignment range | level-permutation alignment range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5880 | 0.061317 | 0.530658 | 0.033199..0.076827 | 0.049928..0.066728 | -0.015120..0.030422 |
| 11 | 16104 | nan | nan | 0.032009..0.065917 | 0.024219..0.049012 | nan..nan |
| 12 | 44220 | 0.020765 | 0.510383 | 0.041437..0.059007 | 0.038513..0.063802 | -0.017323..0.005095 |
| 13 | 122640 | nan | nan | 0.035469..0.055708 | 0.015628..0.062473 | nan..nan |

SVG: `logs/playground-artifacts/residual-branch-persistence-audit-16000000.svg`
JSON: `logs/playground-artifacts/residual-branch-persistence-audit-16000000.json`
