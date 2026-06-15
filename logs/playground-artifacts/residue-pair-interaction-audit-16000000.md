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
| 2 | 0.470767 | 0.109760 | 0.367124 .. 1.026756 | 18.998208 | 11.273278 | 0.793077 .. 0.994019 | 0.544670 | 0.102974 | 0.955942 .. 1.092781 |
| 4 | 0.552707 | 0.111889 | 0.769551 .. 0.948990 | 14.116254 | 8.574990 | 0.916268 .. 0.996880 | 13.020873 | 6.916872 | 0.962502 .. 1.037382 |
| 5 | 0.623722 | 0.108877 | 0.856582 .. 1.026481 | 12.731016 | 7.893263 | 0.933649 .. 1.008737 | 10.999146 | 5.839964 | 0.948492 .. 1.051160 |

## Integer scale stability at budget 5

| block | Z energy | Z maxAbs | composite energy | composite maxAbs |
| --- | ---: | ---: | ---: | ---: |
| 1000000..2000000 | 0.618279 | 1.899527 | 0.109661 | 0.388025 |
| 2000000..4000000 | 0.636713 | 1.668725 | 0.128932 | 0.427554 |
| 4000000..8000000 | 0.647019 | 1.697137 | 0.098884 | 0.294703 |
| 8000000..16000000 | 0.623722 | 1.788167 | 0.108877 | 0.309453 |

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
`Z:13:r12:h4=-1.788, Z:13:r10:h4=1.661, Z:13:r6:h6=1.390, Z:13:r4:h6=-1.366, Z:13:r8:h6=1.343, Z:7:r4:h4=1.232, Z:13:r3:h2=1.133, Z:13:r9:h2=-1.124`

Z composite pairs:
`Z:11:r8:h4=0.309, Z:13:r5:h6=-0.298, Z:11:r4:h4=0.238, Z:13:r10:h4=0.224, Z:13:r10:h6=0.218, Z:13:r9:h2=-0.208, Z:3:r2:h6=-0.208, Z:3:r1:h6=0.208`

F_2[t]:
`F_2[t]:t^2 + t + 1:r1:hs3=34.999, F_2[t]:t^2 + t + 1:r3:hs3=34.999, F_2[t]:t^2 + t + 1:r1:hs2=34.947, F_2[t]:t^2 + t + 1:r2:hs2=34.947, F_2[t]:t^2 + t + 1:r2:hs1=34.728, F_2[t]:t^2 + t + 1:r3:hs1=34.728, F_2[t]:t^2 + t + 1:r1:hs4=26.788, F_2[t]:t^2 + t + 1:r4:hs4=-26.019`

F_3[t]:
`F_3[t]:t^2 + 2*t + 2:r1:hs1=33.959, F_3[t]:t^2 + 2*t + 2:r2:hs1=33.959, F_3[t]:t^2 + 2*t + 2:r3:hs2=33.959, F_3[t]:t^2 + 2*t + 2:r5:hs2=33.959, F_3[t]:t^2 + 2*t + 2:r3:hs4=33.662, F_3[t]:t^2 + 2*t + 2:r2:hs3=33.309, F_3[t]:t^2 + 2*t + 2:r3:hs3=33.026, F_3[t]:t^2 + 2*t + 2:r4:hs3=32.955`

SVG: `logs/playground-artifacts/residue-pair-interaction-audit-16000000.svg`
JSON: `logs/playground-artifacts/residue-pair-interaction-audit-16000000.json`
