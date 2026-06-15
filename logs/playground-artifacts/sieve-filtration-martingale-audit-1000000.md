# finite-eligible sieve-filtration martingale audit

Candidate:
`A_*(N)=mean_W chi_W/(df_W)`, where `chi_W` is computed against the
deepest visible eligible background projected to level `W`.

## Integer side

Real theta:
`meanNorm=-0.092980`,
`endpointNorm=-0.064791`,
`abs(meanNorm-1)=0.019860`.

| N | real labels | real meanNorm | real W=30030 norm | Cramer meanNorm range | eligible meanNorm range | composite meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17978 | 0.188754 | 0.474063 | 0.550470..0.835287 | 0.397016..0.811300 | 0.228440..0.377018 |
| 200000 | 17978 | 0.188754 | 0.474063 | 0.550470..0.835287 | 0.397016..0.811300 | 0.228440..0.377018 |
| 250000 | 22038 | 0.213552 | 0.476604 | 0.460832..0.790004 | 0.378135..0.647644 | 0.220092..0.342171 |
| 500000 | 41532 | 0.206061 | 0.459060 | 0.655705..1.422863 | 0.421281..1.049389 | 0.286325..0.421113 |
| 1000000 | 78492 | 0.160041 | 0.425710 | 0.588988..0.841301 | 0.331374..0.980922 | 0.330462..0.568954 |

Endpoint per-level real path:

| level W | labels | df | chi | norm |
| ---: | ---: | ---: | ---: | ---: |
| 6 | 78492 | 1 | 0.016180 | 0.016180 |
| 30 | 78492 | 7 | 0.157788 | 0.022541 |
| 210 | 78492 | 47 | 4.903101 | 0.104321 |
| 2310 | 78492 | 479 | 110.865359 | 0.231452 |
| 30030 | 78492 | 5759 | 2451.661776 | 0.425710 |

## Function fields

F_2[t] stages:
- factors <= degree 1: product degree 2, eligible residues 1
- factors <= degree 2: product degree 4, eligible residues 3
- factors <= degree 3: product degree 10, eligible residues 147

| degree | real labels | real meanNorm | real endpoint norm | eligible meanNorm range | reducible meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 13 | 630 | 0.163014 | 0.326027 | 0.218037..0.514840 | 0.882551..1.367123 |
| 14 | 1161 | 0.115111 | 0.230222 | 0.275813..0.736576 | 0.116845..0.143110 |
| 15 | 2182 | 0.179815 | 0.357797 | 0.281029..1.197908 | 0.216579..0.406068 |
| 16 | 4080 | 0.181033 | 0.362067 | 0.399451..1.000725 | 0.247542..1.206603 |

F_3[t] stages:
- factors <= degree 1: product degree 3, eligible residues 8
- factors <= degree 2: product degree 9, eligible residues 4096

| degree | real labels | real meanNorm | real endpoint norm | eligible meanNorm range | reducible meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 312 | 0.158242 | 0.316484 | 0.205861..0.421978 | 1.638264..2.368949 |
| 8 | 810 | 0.332772 | 0.406891 | 0.397902..0.787376 | 1.380079..2.187029 |
| 9 | 2184 | 0.233455 | 0.466911 | 0.351195..0.600279 | 0.944479..1.481570 |
| 10 | 5880 | 0.276160 | 0.454360 | 0.456708..0.984453 | 0.305242..0.402765 |

SVG: `logs/playground-artifacts/sieve-filtration-martingale-audit-1000000.svg`
JSON: `logs/playground-artifacts/sieve-filtration-martingale-audit-1000000.json`
