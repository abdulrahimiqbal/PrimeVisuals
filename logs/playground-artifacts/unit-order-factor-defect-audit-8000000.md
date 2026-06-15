# unit-order local-factor defect audit

Candidate:
factor the intrinsic unit-order object p-1 (or f-1), whiten divisibility by
small factors using the prime/irreducible residue-class probability
1/(norm-1), and score first- plus second-order defects at sqrt(label)
scale.

## Integer side

Factors: 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37

Combined theta: `-0.038115`; raw combined
theta: `-0.538115`.

| N | labels | real combined | real scaledMean | real scaledPair | Cramer combined range | local-random combined range | local-composite combined range | column-null combined range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41527 | 0.583877 | 0.293370 | 0.504823 | 8.204501..8.907458 | 1.182372..1.395103 | 1.091179..1.348058 | 0.976050..1.135579 |
| 1000000 | 78487 | 0.589075 | 0.284945 | 0.515574 | 11.251528..12.119517 | 1.061418..1.473372 | 0.904621..1.173941 | 1.019922..1.125664 |
| 2000000 | 148922 | 0.582566 | 0.336067 | 0.475860 | 15.684102..16.655969 | 1.201941..1.387683 | 1.027359..1.343266 | 0.882895..1.050044 |
| 4000000 | 283135 | 0.549695 | 0.225179 | 0.501456 | 21.941661..22.800770 | 0.943381..1.564804 | 0.872198..1.371752 | 0.874845..1.045812 |
| 8000000 | 539766 | 0.534967 | 0.263903 | 0.465344 | 30.627234..31.293226 | 1.114048..1.484896 | 1.001889..1.302567 | 0.926880..1.285557 |

Endpoint top first-order factors:
- 17: -0.000554
- 31: -0.000539
- 3: -0.000415
- 13: -0.000399
- 23: -0.000372
- 7: -0.000333

Endpoint top second-order pairs:
- 17 x 37: 0.002073
- 11 x 37: 0.001375
- 31 x 37: -0.001073
- 23 x 29: -0.001059
- 13 x 19: -0.001057
- 5 x 31: 0.000978

## Function fields

F_2[t] factors: t^2 + t + 1, t^3 + t + 1, t^3 + t^2 + 1, t^4 + t + 1, t^4 + t^3 + 1, t^4 + t^3 + t^2 + t + 1

| degree | labels | real combined | real scaledMean | real scaledPair | monic combined range | local-monic combined range | local-reducible combined range | column-null combined range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 19 | 27594 | 0.647964 | 0.311375 | 0.568246 | 13.144501..13.606957 | 1.134289..1.933482 | 1.169064..1.580003 | 0.952847..1.154077 |
| 20 | 52377 | 0.702774 | 0.505447 | 0.488277 | 17.723305..18.511577 | 1.351316..1.657398 | 1.141502..1.470354 | 0.949456..1.313571 |
| 21 | 99858 | 0.614132 | 0.375202 | 0.486191 | 24.987098..25.774754 | 1.137325..1.700399 | 0.912472..1.406129 | 0.993827..1.148648 |
| 22 | 190557 | 0.582084 | 0.282280 | 0.509057 | 34.222962..34.633911 | 1.254017..1.620818 | 1.042313..1.272413 | 0.769268..1.145502 |

Endpoint F_2[t] top first-order factors:
- t^4 + t^3 + t^2 + t + 1: -0.000942
- t^4 + t^3 + 1: -0.000942
- t^3 + t + 1: 0.000533
- t^3 + t^2 + 1: 0.000533
- t^4 + t + 1: 0.000404
- t^2 + t + 1: -0.000000

Endpoint F_2[t] top second-order pairs:
- t^2 + t + 1 x t^4 + t + 1: -0.002856
- t^3 + t + 1 x t^3 + t^2 + 1: 0.001668
- t^2 + t + 1 x t^3 + t^2 + 1: -0.001273
- t^2 + t + 1 x t^3 + t + 1: -0.001273
- t^2 + t + 1 x t^4 + t^3 + t^2 + t + 1: 0.000997
- t^2 + t + 1 x t^4 + t^3 + 1: 0.000997


F_3[t] factors: t, t + 1, t + 2, t^2 + 1, t^2 + t + 2, t^2 + 2*t + 2

| degree | labels | real combined | real scaledMean | real scaledPair | monic combined range | local-monic combined range | local-reducible combined range | column-null combined range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5880 | 0.528830 | 0.473188 | 0.236124 | 17.962607..19.866364 | 0.791879..1.315742 | 0.420961..0.699884 | 0.833393..1.177967 |
| 11 | 16104 | 0.447873 | 0.000000 | 0.447873 | 30.300915..31.444294 | 0.551316..1.206898 | 0.701989..0.863507 | 0.969708..1.220946 |
| 12 | 44220 | 0.467567 | 0.297477 | 0.360730 | 50.507903..51.646887 | 0.937259..1.261525 | 0.677435..0.923999 | 0.850358..1.347037 |
| 13 | 122640 | 0.306305 | 0.000000 | 0.306305 | 84.124046..85.084012 | 1.020230..1.445375 | 0.689612..0.932880 | 0.925187..1.183731 |

Endpoint F_3[t] top first-order factors:
- t^2 + t + 2: -0.000000
- t^2 + 2*t + 2: -0.000000
- t^2 + 1: -0.000000
- t: 0.000000
- t + 1: 0.000000
- t + 2: 0.000000

Endpoint F_3[t] top second-order pairs:
- t^2 + t + 2 x t^2 + 2*t + 2: 0.001547
- t^2 + 1 x t^2 + 2*t + 2: 0.001547
- t^2 + 1 x t^2 + t + 2: 0.001547
- t + 1 x t^2 + 2*t + 2: 0.001183
- t + 2 x t^2 + t + 2: 0.001183
- t x t^2 + 1: 0.001183

SVG: `logs/playground-artifacts/unit-order-factor-defect-audit-8000000.svg`
JSON: `logs/playground-artifacts/unit-order-factor-defect-audit-8000000.json`
