# residue-local additive pair interaction energy audit

Candidate:
for each block, modulus, residue, and additive shift, count pair starts and
subtract the exact admissible residue-weighted local pair total. Collapse the
cell matrix by energy only after checking strongest cells and controls.

Integer moduli: `3, 5, 7, 11, 13`; shifts
`2, 4, 6, 8`; budget sizes `2, 4, 5`.

## Final-scale budget path

| budget | Z energy | Z composite energy | Z shuffle energy range | F2 energy | F2 composite energy | F2 shuffle range | F3 energy | F3 composite energy | F3 shuffle range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 0.512679 | 0.094186 | 0.526359 .. 0.893512 | 18.998208 | 11.273278 | 0.793077 .. 0.994019 | 0.544670 | 0.102974 | 0.955942 .. 1.092781 |
| 4 | 0.733270 | 0.121198 | 0.768714 .. 0.902249 | 14.116254 | 8.574990 | 0.916268 .. 0.996880 | 13.020873 | 6.916872 | 0.962502 .. 1.037382 |
| 5 | 0.714427 | 0.111755 | 0.794556 .. 0.962815 | 12.731016 | 7.893263 | 0.933649 .. 1.008737 | 10.999146 | 5.839964 | 0.948492 .. 1.051160 |

## Integer scale stability at budget 5

| block | Z energy | Z maxAbs | composite energy | composite maxAbs |
| --- | ---: | ---: | ---: | ---: |
| 100000..200000 | 0.594233 | 1.800215 | 0.146890 | 0.385173 |
| 125000..250000 | 0.627534 | 1.552263 | 0.129467 | 0.420383 |
| 250000..500000 | 0.738796 | 2.292201 | 0.148613 | 0.402462 |
| 500000..1000000 | 0.714427 | 2.144507 | 0.111755 | 0.278456 |

## F_2[t] degree path at budget 5

| degree | energy | maxAbs | composite energy | composite maxAbs |
| ---: | ---: | ---: | ---: | ---: |
| 15 | 5.410443 | 14.969970 | 3.279156 | 8.424403 |
| 16 | 7.143145 | 19.718012 | 4.370774 | 11.127134 |
| 17 | 9.553752 | 26.664583 | 5.881272 | 14.932696 |
| 18 | 12.731016 | 34.998571 | 7.893263 | 20.088916 |

## F_3[t] degree path at budget 5

| degree | energy | maxAbs | composite energy | composite maxAbs |
| ---: | ---: | ---: | ---: | ---: |
| 8 | 2.922817 | 9.947971 | 1.435997 | 4.405284 |
| 9 | 4.501064 | 14.540098 | 2.289253 | 6.916027 |
| 10 | 7.059050 | 22.182508 | 3.615258 | 10.766912 |
| 11 | 10.999146 | 33.959257 | 5.839964 | 17.322263 |

## Strongest final cells

Z primes:
`Z:11:r6:h8=2.145, Z:7:r6:h4=1.569, Z:13:r10:h8=-1.568, Z:13:r6:h2=1.567, Z:11:r9:h4=-1.520, Z:11:r5:h8=-1.505, Z:13:r9:h6=-1.474, Z:11:r2:h8=-1.405`

Z composite pairs:
`Z:11:r4:h2=-0.278, Z:11:r7:h6=0.248, Z:11:r8:h8=-0.232, Z:13:r10:h2=-0.227, Z:7:r6:h4=0.222, Z:13:r2:h2=0.220, Z:13:r9:h6=-0.219, Z:3:r2:h6=0.194`

F_2[t]:
`F_2[t]:t^2 + t + 1:r1:hs3=34.999, F_2[t]:t^2 + t + 1:r3:hs3=34.999, F_2[t]:t^2 + t + 1:r1:hs2=34.947, F_2[t]:t^2 + t + 1:r2:hs2=34.947, F_2[t]:t^2 + t + 1:r2:hs1=34.728, F_2[t]:t^2 + t + 1:r3:hs1=34.728, F_2[t]:t^2 + t + 1:r1:hs4=26.788, F_2[t]:t^2 + t + 1:r4:hs4=-26.019`

F_3[t]:
`F_3[t]:t^2 + 2*t + 2:r1:hs1=33.959, F_3[t]:t^2 + 2*t + 2:r2:hs1=33.959, F_3[t]:t^2 + 2*t + 2:r3:hs2=33.959, F_3[t]:t^2 + 2*t + 2:r5:hs2=33.959, F_3[t]:t^2 + 2*t + 2:r3:hs4=33.662, F_3[t]:t^2 + 2*t + 2:r2:hs3=33.309, F_3[t]:t^2 + 2*t + 2:r3:hs3=33.026, F_3[t]:t^2 + 2*t + 2:r4:hs3=32.955`

SVG: `logs/playground-artifacts/residue-pair-interaction-audit-1000000.svg`
JSON: `logs/playground-artifacts/residue-pair-interaction-audit-1000000.json`
