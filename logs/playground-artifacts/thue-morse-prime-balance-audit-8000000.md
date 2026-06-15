# Thue-Morse prime-balance audit

Candidate:
`T(x)=sum_{p<=x}(-1)^{s_2(p)}`, scored by `max |T| / sqrt(pi(x))`.

## Integer side

| series | endpoint labels | final normalized | maxAbs/sqrt(labels) | maxAbs theta | block normalized values |
| --- | ---: | ---: | ---: | ---: | --- |
| real-primes-base2 | 539777 | -19.122216 | 19.872187 | 0.788936 | -8.645, -15.615, -0.554, -21.283, -2.647 |
| real-primes-base3 | 539777 | -734.692453 | 734.692453 | 1.000017 | -203.799, -192.250, -265.396, -366.351, -506.588 |
| real-primes-base10 | 539777 | -7.106349 | 8.724707 | 0.751883 | -4.740, -4.941, -6.424, -5.020, 0.472 |

Exact local-shell comparators:

| shell | endpoint labels | final normalized | maxAbs/sqrt(labels) | maxAbs theta |
| --- | ---: | ---: | ---: | ---: |
| W6-candidates-base2 | 2666666 | -33.646195 | 36.159372 | 0.792524 |
| W210-candidates-base2 | 1828571 | -29.606285 | 31.859572 | 0.785155 |

Cramer endpoint maxAbs/sqrt(labels): 16.507773..18.255148.
Sampled composite endpoint maxAbs/sqrt(labels): 15.149140..17.791052.
Rough31 composite endpoint maxAbs/sqrt(labels): 15.188612..16.375499.
Pool sizes: primes 539777, W210 composites 1288798, rough31 composites 683055.

Named composite checks:

| n | prime input? | base2 sign | base3 sign | base10 sign |
| ---: | --- | ---: | ---: | ---: |
| 25 | no | -1 | -1 | -1 |
| 35 | no | -1 | -1 | 1 |
| 77 | no | 1 | -1 | 1 |
| 289 | no | -1 | -1 | -1 |

## Function-field coefficient-parity check

### F_2[t]

| degree | irreducibles | real normalized | real maxAbs/sqrt(labels) | random monic maxAbs range | random reducible maxAbs range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 19 | 27594 | -166.114418 | 166.114418 | 0.529755..2.173201 | 8.084789..11.028543 |
| 20 | 52377 | -228.860219 | 228.860219 | 0.694747..2.477495 | 10.333819..13.610928 |
| 21 | 99858 | -316.003165 | 316.003165 | 0.661386..1.727831 | 14.208718..17.211853 |
| 22 | 190557 | -436.528350 | 436.528350 | 0.352784..2.151063 | 18.960968..22.820969 |

### F_3[t]

| degree | irreducibles | real normalized | real maxAbs/sqrt(labels) | random monic maxAbs range | random reducible maxAbs range |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5880 | -0.521641 | 1.069363 | 0.521641..1.943111 | 0.560764..3.155925 |
| 11 | 16104 | -5.122081 | 5.768252 | 0.496448..2.245836 | 0.464927..2.379798 |
| 12 | 44220 | 1.892665 | 2.192257 | 0.784647..2.715356 | 0.537365..2.097149 |
| 13 | 122640 | -0.759566 | 3.249572 | 0.525414..2.721303 | 0.799543..2.118790 |

## Factor check

Over `F_2[t]`, coefficient parity is `f(1)`. A monic irreducible of degree greater than one cannot have `f(1)=0`, or it would be divisible by `t+1`. Therefore the sign is forced for almost every irreducible. The two-universe version explodes by algebra, not by prime regularity.

SVG: `logs/playground-artifacts/thue-morse-prime-balance-audit-8000000.svg`
JSON: `logs/playground-artifacts/thue-morse-prime-balance-audit-8000000.json`