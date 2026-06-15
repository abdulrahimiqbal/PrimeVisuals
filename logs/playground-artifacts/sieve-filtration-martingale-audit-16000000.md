# finite-eligible sieve-filtration martingale audit

Candidate:
`A_*(N)=mean_W chi_W/(df_W)`, where `chi_W` is computed against the
deepest visible eligible background projected to level `W`.

## Integer side

Real theta:
`meanNorm=-0.000508`,
`endpointNorm=-0.065493`,
`abs(meanNorm-1)=0.000059`.

| N | real labels | real meanNorm | real W=30030 norm | Cramer meanNorm range | eligible meanNorm range | composite meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1000000 | 78492 | 0.160041 | 0.425710 | 0.588988..0.841301 | 0.331374..0.980922 | 0.330462..0.568954 |
| 2000000 | 148927 | 0.173827 | 0.390650 | 0.542033..0.700014 | 0.520655..0.872181 | 0.294798..0.419469 |
| 4000000 | 283140 | 0.187302 | 0.373413 | 0.465424..0.927347 | 0.394462..1.005252 | 0.364583..0.445448 |
| 8000000 | 539771 | 0.153368 | 0.360941 | 0.547207..1.684648 | 0.492066..0.723229 | 0.326193..0.662790 |
| 16000000 | 1031124 | 0.170082 | 0.352949 | 0.649029..1.212557 | 0.447919..1.029102 | 0.449680..0.716115 |

Endpoint per-level real path:

| level W | labels | df | chi | norm |
| ---: | ---: | ---: | ---: | ---: |
| 6 | 1031124 | 1 | 0.129674 | 0.129674 |
| 30 | 1031124 | 7 | 0.493510 | 0.070501 |
| 210 | 1031124 | 47 | 5.035165 | 0.107131 |
| 2310 | 1031124 | 479 | 91.083203 | 0.190153 |
| 30030 | 1031124 | 5759 | 2032.633169 | 0.352949 |

## Function fields

F_2[t] stages:
- factors <= degree 1: product degree 2, eligible residues 1
- factors <= degree 2: product degree 4, eligible residues 3
- factors <= degree 3: product degree 10, eligible residues 147

| degree | real labels | real meanNorm | real endpoint norm | eligible meanNorm range | reducible meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 19 | 27594 | 0.111106 | 0.222212 | 0.381309..1.266206 | 0.322399..0.502428 |
| 20 | 52377 | 0.129652 | 0.259305 | 0.499195..1.342521 | 0.310390..0.457024 |
| 21 | 99858 | 0.073660 | 0.146959 | 0.362134..1.078621 | 0.314073..0.828667 |
| 22 | 190557 | 0.110042 | 0.220084 | 0.335036..1.628027 | 0.323119..0.931569 |

F_3[t] stages:
- factors <= degree 1: product degree 3, eligible residues 8
- factors <= degree 2: product degree 9, eligible residues 4096

| degree | real labels | real meanNorm | real endpoint norm | eligible meanNorm range | reducible meanNorm range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5880 | 0.276160 | 0.454360 | 0.456708..0.984453 | 0.305242..0.402765 |
| 11 | 16104 | 0.283876 | 0.567753 | 0.406345..0.844251 | 0.369126..0.476419 |
| 12 | 44220 | 0.320361 | 0.466269 | 0.499285..0.866193 | 0.447085..0.628975 |
| 13 | 122640 | 0.174349 | 0.348698 | 0.507861..0.897907 | 0.317873..0.822499 |

SVG: `logs/playground-artifacts/sieve-filtration-martingale-audit-16000000.svg`
JSON: `logs/playground-artifacts/sieve-filtration-martingale-audit-16000000.json`
