# unit-order local-factor defect audit

Candidate:
factor the intrinsic unit-order object p-1 (or f-1), whiten divisibility by
small factors using the prime/irreducible residue-class probability
1/(norm-1), and score first- plus second-order defects at sqrt(label)
scale.

## Integer side

Factors: 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37

Combined theta: `0.127985`; raw combined
theta: `-0.372015`.

| N | labels | real combined | real scaledMean | real scaledPair | Cramer combined range | local-random combined range | local-composite combined range | column-null combined range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200000 | 17973 | 0.495243 | 0.193364 | 0.455934 | 5.426055..5.907228 | 1.118733..1.311913 | 0.909511..1.155892 | 0.930912..1.146009 |
| 200000 | 17973 | 0.495243 | 0.193364 | 0.455934 | 5.426055..5.907228 | 1.118733..1.311913 | 0.909511..1.155892 | 0.930912..1.146009 |
| 250000 | 22033 | 0.516027 | 0.163711 | 0.489370 | 5.802259..6.564994 | 0.974999..1.404709 | 0.984663..1.399497 | 0.933579..1.117212 |
| 500000 | 41527 | 0.583877 | 0.293370 | 0.504823 | 8.204501..8.907458 | 1.182372..1.395103 | 1.091179..1.348058 | 0.976050..1.135579 |
| 1000000 | 78487 | 0.589075 | 0.284945 | 0.515574 | 11.251528..12.119517 | 1.061418..1.473372 | 0.904621..1.173941 | 1.019922..1.125664 |

Endpoint top first-order factors:
- 19: -0.001746
- 31: -0.001720
- 17: -0.001602
- 37: -0.000945
- 29: 0.000885
- 7: -0.000655

Endpoint top second-order pairs:
- 17 x 23: -0.004846
- 17 x 19: -0.003877
- 19 x 29: -0.003694
- 29 x 37: -0.003671
- 19 x 31: -0.003394
- 23 x 31: 0.003363

## Function fields

F_2[t] factors: t^2 + t + 1, t^3 + t + 1, t^3 + t^2 + 1, t^4 + t + 1, t^4 + t^3 + 1, t^4 + t^3 + t^2 + t + 1

| degree | labels | real combined | real scaledMean | real scaledPair | monic combined range | local-monic combined range | local-reducible combined range | column-null combined range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 13 | 630 | 0.602285 | 0.326132 | 0.506345 | 1.936973..2.807615 | 1.191277..1.436874 | 0.954282..1.731064 | 0.923275..1.190238 |
| 14 | 1161 | 0.617276 | 0.253922 | 0.562630 | 2.253061..2.985376 | 1.097457..1.973294 | 0.997135..1.637573 | 0.915722..1.266153 |
| 15 | 2182 | 0.554622 | 0.110451 | 0.543512 | 3.705773..4.467164 | 1.070621..1.360755 | 1.141135..1.484979 | 0.885437..1.078096 |
| 16 | 4080 | 0.603764 | 0.379075 | 0.469929 | 4.997905..5.754522 | 0.965333..1.462712 | 0.741054..1.867082 | 0.837387..1.278080 |

Endpoint F_2[t] top first-order factors:
- t^4 + t^3 + t^2 + t + 1: -0.007861
- t^4 + t^3 + 1: -0.007861
- t^4 + t + 1: 0.007861
- t^3 + t + 1: 0.003602
- t^3 + t^2 + 1: 0.003602
- t^2 + t + 1: 0.000000

Endpoint F_2[t] top second-order pairs:
- t^2 + t + 1 x t^4 + t^3 + 1: 0.012506
- t^2 + t + 1 x t^4 + t^3 + t^2 + t + 1: 0.012506
- t^2 + t + 1 x t^4 + t + 1: -0.011117
- t^2 + t + 1 x t^3 + t^2 + 1: 0.008915
- t^2 + t + 1 x t^3 + t + 1: 0.008915
- t^4 + t + 1 x t^4 + t^3 + t^2 + t + 1: -0.008403


F_3[t] factors: t, t + 1, t + 2, t^2 + 1, t^2 + t + 2, t^2 + 2*t + 2, t^3 + 2*t + 1, t^3 + 2*t + 2, t^3 + t^2 + 2, t^3 + t^2 + t + 2, t^3 + t^2 + 2*t + 1, t^3 + 2*t^2 + 1, t^3 + 2*t^2 + t + 1, t^3 + 2*t^2 + 2*t + 2

| degree | labels | real combined | real scaledMean | real scaledPair | monic combined range | local-monic combined range | local-reducible combined range | column-null combined range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 810 | 0.833042 | 0.322049 | 0.768273 | 4.421246..4.797600 | 0.810091..0.936163 | 2.596691..3.110187 | 1.032657..1.113130 |
| 9 | 2184 | 0.769799 | 0.600680 | 0.481429 | 7.267892..7.996352 | 0.774182..1.008284 | 1.760065..2.000442 | 1.040987..1.248972 |
| 10 | 5880 | 0.855973 | 0.444632 | 0.731431 | 11.676138..12.885730 | 0.750628..0.872296 | 1.865702..2.002372 | 1.032825..1.105419 |

Endpoint F_3[t] top first-order factors:
- t^3 + 2*t + 1: -0.008980
- t^3 + 2*t + 2: -0.008980
- t^2 + 1: -0.007714
- t^2 + 2*t + 2: -0.007714
- t^2 + t + 2: -0.007714
- t: -0.004082

Endpoint F_3[t] top second-order pairs:
- t^3 + t^2 + 2 x t^3 + 2*t^2 + t + 1: -0.029333
- t^3 + t^2 + 2*t + 1 x t^3 + 2*t^2 + 2*t + 2: -0.029333
- t^3 + t^2 + t + 2 x t^3 + 2*t^2 + 1: -0.029333
- t^3 + 2*t + 1 x t^3 + 2*t + 2: -0.022612
- t^2 + t + 2 x t^3 + t^2 + 2: 0.018255
- t^2 + t + 2 x t^3 + 2*t^2 + t + 1: 0.018255

SVG: `logs/playground-artifacts/unit-order-factor-defect-audit-1000000.svg`
JSON: `logs/playground-artifacts/unit-order-factor-defect-audit-1000000.json`
