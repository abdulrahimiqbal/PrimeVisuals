# rough-shell residue-current spectral edge audit

Candidate:
count prime residues in fresh blocks, whiten every residue cell against
the exact `257`-rough shell in the same block,
and score the covariance spectral edge normalized by a Marchenko-Pastur
edge. This is non-neighbor and avoids uniform/Cramer as the primary null.

## Final endpoint budget comparison

| budget | Z moduli | Z edge | Z rough-random edge range | Z rough-composite edge range | Cramer edge range | F3 edge | F3 rough-random edge range | F5 edge | F5 rough-random edge range |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | 3,5,7 | 1.025143 | 0.810737..1.147713 | 0.859848..1.356549 | 0.857555..1.215913 | 1.029437 | 0.545903..0.970186 | 1.320985 | 0.600329..0.959018 |
| 5 | 3,5,7,11,13 | 1.018132 | 0.862394..1.112879 | 0.750429..1.067708 | 0.835940..1.125297 | 1.246217 | 0.678395..0.997624 | 1.544332 | 0.662144..0.956794 |
| 8 | 3,5,7,11,13,17,19,23 | 0.992534 | 0.883093..1.027028 | 0.899991..1.125501 | 0.841651..1.066996 | NA | NA | NA | NA |
| 10 | 3,5,7,11,13,17,19,23,29,31 | 0.941540 | 0.879736..1.065678 | 0.893949..1.047297 | 0.922074..1.055315 | NA | NA | NA | NA |

## Integer budget-10 endpoint trace

Theta for excess edge: `-0.353427`

| N | real edge | real energy | rough-random edge range | rough-composite edge range | excess edge |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 1.084238 | 0.391290 | 0.882315..1.058579 | 0.972930..1.088586 | 0.121891 |
| 1000000 | 1.117257 | 0.425227 | 0.925206..1.042995 | 0.903397..1.172626 | 0.137197 |
| 2000000 | 1.025502 | 0.444681 | 0.909796..1.076824 | 0.914986..1.145503 | 0.051315 |
| 4000000 | 1.103748 | 0.458331 | 0.875461..1.088726 | 0.901677..1.057072 | 0.150932 |
| 8000000 | 0.941540 | 0.467469 | 0.879736..1.065678 | 0.893949..1.047297 | -0.034142 |

Final strongest Z columns:
`Z:29:r7=0.657, Z:31:r27=0.654, Z:31:r8=0.620, Z:23:r18=0.614, Z:17:r12=0.612, Z:29:r28=0.609, Z:31:r24=0.607, Z:29:r10=0.569`

Named composite centers:

| center | 257-rough eligible | residues |
| ---: | --- | --- |
| 25 | no | 3:1, 5:0, 7:4, 11:3, 13:12 |
| 35 | no | 3:2, 5:0, 7:0, 11:2, 13:9 |
| 77 | no | 3:2, 5:2, 7:0, 11:0, 13:12 |
| 289 | no | 3:1, 5:4, 7:2, 11:3, 13:3 |

## Function-field final budgets

F_3[t] strongest columns:
`F_3[t]:t^2 + 1:r8=0.181, F_3[t]:t^2 + t + 2:r6=0.181, F_3[t]:t^2 + 1:r5=0.181, F_3[t]:t^2 + t + 2:r4=0.181, F_3[t]:t:r2=0.174, F_3[t]:t + 1:r2=0.174, F_3[t]:t + 2:r2=0.174, F_3[t]:t:r1=0.174`

F_5[t] strongest columns:
`F_5[t]:t:r4=0.193, F_5[t]:t + 1:r4=0.193, F_5[t]:t + 2:r4=0.193, F_5[t]:t + 3:r4=0.193, F_5[t]:t + 4:r4=0.193, F_5[t]:t:r2=0.169, F_5[t]:t:r3=0.169, F_5[t]:t + 1:r2=0.169`

SVG: `logs/playground-artifacts/rough-residue-current-8000000.svg`
JSON: `logs/playground-artifacts/rough-residue-current-8000000.json`
