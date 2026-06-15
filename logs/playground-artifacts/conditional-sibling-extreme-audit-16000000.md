# conditional sibling-extreme filtration audit

Candidate:
parent-conditioned sibling maximum child innovation, normalized by
`sqrt(2 log sibling_count)`.

## Integer side

Mean-extreme theta:
`-0.036491`.

| N | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | composite meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78492 | 0.367103 | 0.577968 | 0.569352..0.717610 | 0.487690..0.626412 | 0.824353..0.862654 |
| 2000000 | 148927 | 0.374346 | 0.561191 | 0.585380..0.783051 | 0.491425..0.635739 | 0.725838..0.886835 |
| 4000000 | 283140 | 0.333774 | 0.544802 | 0.661231..0.763494 | 0.538304..0.653022 | 0.784741..0.853395 |
| 8000000 | 539771 | 0.323507 | 0.539069 | 0.600972..0.708820 | 0.545335..0.656927 | 0.810202..0.987304 |
| 16000000 | 1031124 | 0.347983 | 0.532540 | 0.609883..0.670970 | 0.586414..0.694475 | 0.770643..0.942498 |

Endpoint per-edge real path:

| edge | fibers | meanExtreme | maxFiber |
| --- | ---: | ---: | ---: |
| 6->30 | 2 | 0.216254 | 0.235933 |
| 30->210 | 8 | 0.250728 | 0.365426 |
| 210->2310 | 48 | 0.392410 | 0.622520 |
| 2310->30030 | 480 | 0.532540 | 1.052367 |

## Function fields

F_2[t] stages:
- factors <= degree 1: product degree 2, eligible residues 1
- factors <= degree 2: product degree 4, eligible residues 3
- factors <= degree 3: product degree 10, eligible residues 147

| degree | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | reducible meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 19 | 27594 | 0.220900 | 0.441799 | 0.508386..0.982085 | 0.480252..0.632583 | 0.524595..1.023083 |
| 20 | 52377 | 0.198512 | 0.397024 | 0.656760..0.954816 | 0.457788..0.696525 | 0.548053..1.496037 |
| 21 | 99858 | 0.203395 | 0.388674 | 0.513946..0.915533 | 0.412919..0.900300 | 0.724391..1.000790 |
| 22 | 190557 | 0.217797 | 0.435594 | 0.420943..1.103090 | 0.421126..0.882072 | 0.571294..0.809012 |

F_3[t] stages:
- factors <= degree 1: product degree 3, eligible residues 8
- factors <= degree 2: product degree 9, eligible residues 4096

| degree | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | reducible meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5880 | 0.370060 | 0.370060 | 0.370168..0.372566 | 0.370078..0.370148 | 0.990767..1.109035 |
| 11 | 16104 | 0.581444 | 0.581444 | 0.581636..0.618631 | 0.597342..0.617103 | 0.938740..1.081659 |
| 12 | 44220 | 0.657456 | 0.657456 | 0.680907..0.707803 | 0.715630..0.743759 | 0.966201..1.063325 |
| 13 | 122640 | 0.469138 | 0.469138 | 0.642100..0.769004 | 0.662525..0.697262 | 0.881934..0.947429 |

SVG: `logs/playground-artifacts/conditional-sibling-extreme-audit-16000000.svg`
JSON: `logs/playground-artifacts/conditional-sibling-extreme-audit-16000000.json`
