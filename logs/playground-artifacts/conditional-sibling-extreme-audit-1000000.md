# conditional sibling-extreme filtration audit

Candidate:
parent-conditioned sibling maximum child innovation, normalized by
`sqrt(2 log sibling_count)`.

## Integer side

Mean-extreme theta:
`-0.042994`.

| N | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | composite meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17978 | 0.391816 | 0.601060 | 0.548633..0.669053 | 0.437205..0.483806 | 0.821057..0.957568 |
| 200000 | 17978 | 0.391816 | 0.601060 | 0.548633..0.669053 | 0.437205..0.483806 | 0.821057..0.957568 |
| 250000 | 22038 | 0.395084 | 0.609388 | 0.564352..0.673175 | 0.455950..0.516155 | 0.789272..0.976928 |
| 500000 | 41532 | 0.378285 | 0.600568 | 0.577439..0.713283 | 0.453946..0.628746 | 0.760122..0.927932 |
| 1000000 | 78492 | 0.367103 | 0.577968 | 0.569352..0.717610 | 0.487690..0.626412 | 0.824353..0.862654 |

Endpoint per-edge real path:

| edge | fibers | meanExtreme | maxFiber |
| --- | ---: | ---: | ---: |
| 6->30 | 2 | 0.147967 | 0.162567 |
| 30->210 | 8 | 0.301552 | 0.451724 |
| 210->2310 | 48 | 0.440925 | 0.791669 |
| 2310->30030 | 480 | 0.577968 | 1.107624 |

## Function fields

F_2[t] stages:
- factors <= degree 1: product degree 2, eligible residues 1
- factors <= degree 2: product degree 4, eligible residues 3
- factors <= degree 3: product degree 10, eligible residues 147

| degree | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | reducible meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 13 | 630 | 0.199925 | 0.399849 | 0.322964..0.666016 | 0.930743..1.101938 | 0.686226..1.128286 |
| 14 | 1161 | 0.186720 | 0.373440 | 0.412148..0.701768 | 0.199869..0.342644 | 0.563073..1.351360 |
| 15 | 2182 | 0.285229 | 0.529610 | 0.403586..1.000596 | 0.375160..0.619685 | 0.481313..1.074033 |
| 16 | 4080 | 0.197805 | 0.395610 | 0.557257..0.957260 | 0.392204..0.904275 | 0.532886..1.428310 |

F_3[t] stages:
- factors <= degree 1: product degree 3, eligible residues 8
- factors <= degree 2: product degree 9, eligible residues 4096

| degree | real labels | real meanExtreme | real maxEdgeExtreme | eligible meanExtreme range | reducible meanExtreme range | sibling-shuffle meanExtreme range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 312 | 0.293473 | 0.293473 | 0.293035..0.293395 | 1.792516..2.116133 | 0.993294..1.207756 |
| 8 | 810 | 0.240906 | 0.240906 | 0.240822..0.242300 | 1.644218..2.045986 | 1.032363..1.234151 |
| 9 | 2184 | 0.206929 | 0.206929 | 0.206890..0.207261 | 1.585396..2.071170 | 1.199886..1.490952 |
| 10 | 5880 | 0.370060 | 0.370060 | 0.370168..0.372566 | 0.370078..0.370148 | 0.990767..1.109035 |

SVG: `logs/playground-artifacts/conditional-sibling-extreme-audit-1000000.svg`
JSON: `logs/playground-artifacts/conditional-sibling-extreme-audit-1000000.json`
