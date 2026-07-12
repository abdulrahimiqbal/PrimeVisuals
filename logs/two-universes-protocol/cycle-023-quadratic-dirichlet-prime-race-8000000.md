# Quadratic Dirichlet prime-race audit

Candidate:
compare the quadratic character race `sum_{p<=N} (p/m)` over rational primes with the matched quadratic Dirichlet character sums over irreducibles in `F_q[t]` modulo irreducible quadratic polynomials.

The statistic is the normalized cumulative character sum `Z(X)=sum chi(P)/sqrt(labels)`. This is a new domain after the algebraic-family stop, but it is expected to be a Dirichlet/PNT-in-progressions calibration rather than a breakthrough.

## Summary

- Integer modulus: 5
- Complete integer ladder 1M/2M/4M/8M: true
- Required q=3,5,7 field ladders: true
- Character validation passed: true
- Integer beats controls: false
- Signs aligned: true
- Profile spread: 2.209918
- Matched profile: false
- Max endpoint |z|: 0.429200

## Integer Rows

| endpoint | labels | sum chi | mean chi | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| N<=1000000 | 78497 | -77 | -0.000981 | -0.274830 | -0.274830 | 1.732051 |
| N<=2000000 | 148932 | -116 | -0.000779 | -0.300583 | -0.300583 | 1.732051 |
| N<=4000000 | 283145 | -81 | -0.000286 | -0.152223 | -0.152223 | 1.732051 |
| N<=8000000 | 539776 | -216 | -0.000400 | -0.294000 | -0.294000 | 1.732051 |

## Integer Controls

| control | final |z| range | max |z| range | energy z range |
| --- | ---: | ---: | ---: |
| localCharacters | 0.303528..0.464139 | 1.000000..1.632993 | -0.464139..-0.303528 |
| shuffle | 0.294000..0.294000 | 1.520567..3.441236 | -0.294000..-0.294000 |
| signFlip | 0.098000..1.546221 | 1.725402..3.656552 | -1.546221..1.301221 |
| bootstrap | 0.084389..0.691444 | 1.889822..3.295779 | -0.413777..0.691444 |

## F_3[t] Rows

Modulus: `t^2 + 1`

| endpoint | labels | cumulative labels | degree sum chi | degree mean chi | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | 3 | -1 | -0.333333 | -0.577350 | -0.577350 | 1.000000 |
| F_3:deg2 | 2 | 5 | -2 | -1.000000 | -1.341641 | -1.341641 | 1.341641 |
| F_3:deg3 | 8 | 13 | 0 | 0.000000 | -0.832050 | -0.832050 | 2.121320 |
| F_3:deg4 | 18 | 31 | -2 | -0.111111 | -0.898027 | -0.898027 | 2.121320 |
| F_3:deg5 | 48 | 79 | 0 | 0.000000 | -0.562544 | -0.562544 | 2.121320 |
| F_3:deg6 | 116 | 195 | -4 | -0.034483 | -0.644503 | -0.644503 | 2.121320 |
| F_3:deg7 | 312 | 507 | 0 | 0.000000 | -0.399704 | -0.399704 | 2.121320 |
| F_3:deg8 | 810 | 1317 | -10 | -0.012346 | -0.523553 | -0.523553 | 2.121320 |
| F_3:deg9 | 2184 | 3501 | 0 | 0.000000 | -0.321113 | -0.321113 | 2.121320 |
| F_3:deg10 | 5880 | 9381 | -24 | -0.004082 | -0.443960 | -0.443960 | 2.121320 |
| F_3:deg11 | 16104 | 25485 | 0 | 0.000000 | -0.269356 | -0.269356 | 2.121320 |
| F_3:deg12 | 44220 | 69705 | -60 | -0.001357 | -0.390126 | -0.390126 | 2.121320 |

## F_5[t] Rows

Modulus: `t^2 + 2`

| endpoint | labels | cumulative labels | degree sum chi | degree mean chi | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | 5 | -1 | -0.200000 | -0.447214 | -0.447214 | 1.414214 |
| F_5:deg2 | 9 | 14 | -3 | -0.333333 | -1.069045 | -1.069045 | 1.414214 |
| F_5:deg3 | 40 | 54 | 0 | 0.000000 | -0.544331 | -0.544331 | 1.500000 |
| F_5:deg4 | 150 | 204 | -6 | -0.040000 | -0.700140 | -0.700140 | 1.500000 |
| F_5:deg5 | 624 | 828 | 0 | 0.000000 | -0.347524 | -0.347524 | 1.500000 |
| F_5:deg6 | 2580 | 3408 | -20 | -0.007752 | -0.513892 | -0.513892 | 1.500000 |
| F_5:deg7 | 11160 | 14568 | 0 | 0.000000 | -0.248554 | -0.248554 | 1.520572 |
| F_5:deg8 | 48750 | 63318 | -78 | -0.001600 | -0.429200 | -0.429200 | 1.520572 |

## F_7[t] Rows

Modulus: `t^2 + 1`

| endpoint | labels | cumulative labels | degree sum chi | degree mean chi | z | energy z | max abs z |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | 7 | -1 | -0.142857 | -0.377964 | -0.377964 | 1.414214 |
| F_7:deg2 | 20 | 27 | -4 | -0.200000 | -0.962250 | -0.962250 | 1.414214 |
| F_7:deg3 | 112 | 139 | 0 | 0.000000 | -0.424094 | -0.424094 | 1.616448 |
| F_7:deg4 | 588 | 727 | -12 | -0.020408 | -0.630495 | -0.630495 | 1.616448 |
| F_7:deg5 | 3360 | 4087 | 0 | 0.000000 | -0.265917 | -0.265917 | 1.616448 |
| F_7:deg6 | 19544 | 23631 | -56 | -0.002865 | -0.474878 | -0.474878 | 1.616448 |
| F_7:deg7 | 117648 | 141279 | 0 | 0.000000 | -0.194216 | -0.194216 | 1.616448 |

## Character Validation

| side | item | ok |
| --- | --- | --- |
| Z | p=2, residue=2, chi=-1, Euler=4 | true |
| Z | p=3, residue=3, chi=-1, Euler=4 | true |
| Z | p=7, residue=2, chi=-1, Euler=4 | true |
| Z | p=11, residue=1, chi=1, Euler=1 | true |
| Z | p=13, residue=3, chi=-1, Euler=4 | true |
| Z | p=17, residue=2, chi=-1, Euler=4 | true |
| Z | p=19, residue=4, chi=1, Euler=1 | true |
| Z | p=23, residue=3, chi=-1, Euler=4 | true |
| Z | p=29, residue=4, chi=1, Euler=1 | true |
| Z | p=31, residue=1, chi=1, Euler=1 | true |
| F_3[t] | residue=1, chi=1, square=1, chi(square)=1 | true |
| F_3[t] | residue=2, chi=1, square=1, chi(square)=1 | true |
| F_3[t] | residue=3, chi=1, square=2, chi(square)=1 | true |
| F_3[t] | residue=4, chi=-1, square=6, chi(square)=1 | true |
| F_5[t] | residue=1, chi=1, square=1, chi(square)=1 | true |
| F_5[t] | residue=2, chi=1, square=4, chi(square)=1 | true |
| F_5[t] | residue=3, chi=1, square=4, chi(square)=1 | true |
| F_5[t] | residue=4, chi=1, square=1, chi(square)=1 | true |
| F_7[t] | residue=1, chi=1, square=1, chi(square)=1 | true |
| F_7[t] | residue=2, chi=1, square=4, chi(square)=1 | true |
| F_7[t] | residue=3, chi=1, square=2, chi(square)=1 | true |
| F_7[t] | residue=4, chi=1, square=2, chi(square)=1 | true |

## Novelty Audit

- This is a genuinely different object from the stopped algebraic-family branch: Dirichlet character prime races.
- It is not promoted unless a character-race residual survives nearby-character, shuffle, bootstrap, and q-profile controls.
- A likely failure means the signal is a known Dirichlet/PNT-in-progressions calibration, not new two-universe structure.

JSON: `logs/two-universes-protocol/cycle-023-quadratic-dirichlet-prime-race-8000000.json`
SVG: `logs/two-universes-protocol/cycle-023-quadratic-dirichlet-prime-race-8000000.svg`
