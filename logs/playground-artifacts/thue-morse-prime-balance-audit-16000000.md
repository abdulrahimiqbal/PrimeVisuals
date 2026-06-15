# Thue-Morse prime-balance audit

Candidate:
`T(x)=sum_{p<=x}(-1)^{s_2(p)}`, scored by `max |T| / sqrt(pi(x))`.

## Integer side

| series | endpoint labels | final normalized | maxAbs/sqrt(labels) | maxAbs theta | block normalized values |
| --- | ---: | ---: | ---: | ---: | --- |
| real-primes-base2 | 1031130 | -33.801905 | 33.836373 | 0.774832 | -17.004, -0.554, -21.283, -2.647, -28.924 |
| real-primes-base3 | 1031130 | -1015.443745 | 1015.443745 | 1.000009 | -280.168, -265.396, -366.351, -506.588, -700.966 |
| real-primes-base10 | 1031130 | -9.402768 | 9.402768 | 0.586339 | -6.839, -6.424, -5.020, 0.472, -6.173 |

Exact local-shell comparators:

| shell | endpoint labels | final normalized | maxAbs/sqrt(labels) | maxAbs theta |
| --- | ---: | ---: | ---: | ---: |
| W6-candidates-base2 | 5333332 | -70.954336 | 71.024484 | 0.792499 |
| W210-candidates-base2 | 3657141 | -61.048483 | 61.092931 | 0.793146 |

Cramer endpoint maxAbs/sqrt(labels): 29.884983..32.853785.
Sampled composite endpoint maxAbs/sqrt(labels): 30.668306..33.647293.
Rough31 composite endpoint maxAbs/sqrt(labels): 30.090235..32.325706.
Pool sizes: primes 1031130, W210 composites 2626015, rough31 composites 1414527.

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

SVG: `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.svg`
JSON: `logs/playground-artifacts/thue-morse-prime-balance-audit-16000000.json`