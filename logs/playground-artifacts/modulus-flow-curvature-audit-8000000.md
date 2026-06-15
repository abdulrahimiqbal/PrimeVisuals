# Primorial modulus-flow curvature audit

Candidate:
measure how much new residue imbalance is injected while refining a nested wheel or polynomial-modulus tower.

## Integer side

Tower:
- W=6, phi=2
- W=30, phi=8
- W=210, phi=48
- W=2310, phi=480
- W=30030, phi=5760

| N | labels | real meanK | balanced fake meanK | real defect | real flatness | effect vs eligible | K levels |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 500000 | 41532 | 0.239518 | 0.007456 | 0.777752 | 0.680481 | -0.280945 | 0.073, 0.114, 0.287, 0.485 |
| 1000000 | 78492 | 0.209243 | 0.005346 | 0.806561 | 0.759330 | -0.343848 | 0.024, 0.119, 0.246, 0.448 |
| 2000000 | 148927 | 0.206358 | 0.001544 | 0.804702 | 0.644311 | -0.405028 | 0.074, 0.100, 0.244, 0.408 |
| 4000000 | 283140 | 0.181320 | 0.000824 | 0.830559 | 0.771939 | -0.381106 | 0.033, 0.076, 0.227, 0.389 |
| 8000000 | 539771 | 0.175499 | 0.000701 | 0.835522 | 0.770708 | -0.457373 | 0.021, 0.088, 0.217, 0.376 |

Integer exponent fits:
`meanK theta=-0.119301`,
`defect theta=0.026909`,
`abs(effect-vs-eligible) theta=0.167953`.

Endpoint controls at N=8000000:

| group | meanK range | defect range | flatness range |
| --- | ---: | ---: | ---: |
| balanced residue fake | 0.000701 .. 0.000701 | 0.999300 .. 0.999300 | 1.384645 .. 1.384645 |
| eligible random | 0.463488 .. 0.823259 | 0.316436 .. 0.563111 | 0.069628 .. 0.565159 |
| Cramer labels | 0.708652 .. 0.874825 | 0.179038 .. 0.348898 | 0.108132 .. 0.283378 |
| composite eligible | 0.408721 .. 0.569874 | 0.438077 .. 0.623083 | 0.131412 .. 0.480826 |

## F_2[t] side

Tower:
- first 3 irreducibles, degree=4, phi=3, modulus=(t)*(t + 1)*(t^2 + t + 1)
- first 4 irreducibles, degree=7, phi=21, modulus=(t)*(t + 1)*(t^2 + t + 1)*(t^3 + t + 1)
- first 5 irreducibles, degree=10, phi=147, modulus=(t)*(t + 1)*(t^2 + t + 1)*(t^3 + t + 1)*(t^3 + t^2 + 1)
- first 6 irreducibles, degree=14, phi=2205, modulus=(t)*(t + 1)*(t^2 + t + 1)*(t^3 + t + 1)*(t^3 + t^2 + 1)*(t^4 + t + 1)

| degree | labels | real meanK | balanced fake meanK | real defect | real flatness | effect vs random monic | K levels |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 18 | 14532 | 0.307862 | 0.015126 | 0.704895 | 0.433644 | -0.704028 | 0.160, 0.280, 0.484 |
| 19 | 27594 | 0.283531 | 0.007987 | 0.729742 | 0.488648 | -0.730754 | 0.142, 0.237, 0.472 |
| 20 | 52377 | 0.262183 | 0.003038 | 0.752036 | 0.555141 | -0.791800 | 0.072, 0.290, 0.425 |
| 21 | 99858 | 0.211696 | 0.001887 | 0.799600 | 0.632650 | -0.795452 | 0.081, 0.159, 0.396 |
| 22 | 190557 | 0.256653 | 0.001159 | 0.751210 | 0.422394 | -0.725517 | 0.136, 0.236, 0.399 |

Exponent fits: `meanK theta=-0.101877`, `defect theta=0.033955`, `abs(effect-vs-random) theta=0.022444`.

Endpoint controls at degree=22:

| group | meanK range | defect range | flatness range |
| --- | ---: | ---: | ---: |
| balanced residue fake | 0.001159 .. 0.001159 | 0.998842 .. 0.998842 | 1.125372 .. 1.125372 |
| random monic | 0.883712 .. 1.086012 | 0.071976 .. 0.279040 | 0.056047 .. 0.244429 |
| random reducible | 1.001646 .. 1.186889 | 0.098892 .. 0.252920 | 0.059652 .. 0.245516 |

## F_3[t] side

Tower:
- first 3 irreducibles, degree=3, phi=8, modulus=(t)*(t + 1)*(t + 2)
- first 4 irreducibles, degree=5, phi=64, modulus=(t)*(t + 1)*(t + 2)*(t^2 + 1)
- first 5 irreducibles, degree=7, phi=512, modulus=(t)*(t + 1)*(t + 2)*(t^2 + 1)*(t^2 + t + 2)
- first 6 irreducibles, degree=9, phi=4096, modulus=(t)*(t + 1)*(t + 2)*(t^2 + 1)*(t^2 + t + 2)*(t^2 + 2*t + 2)

| degree | labels | real meanK | balanced fake meanK | real defect | real flatness | effect vs random monic | K levels |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 9 | 2184 | 0.372405 | 0.213893 | 0.634432 | 0.249430 | -0.650515 | 0.255, 0.380, 0.482 |
| 10 | 5880 | 0.337836 | 0.076223 | 0.675428 | 0.394270 | -0.651947 | 0.155, 0.391, 0.468 |
| 11 | 16104 | 0.349656 | 0.009586 | 0.681460 | 0.582197 | -0.656096 | 0.107, 0.337, 0.605 |
| 12 | 44220 | 0.376817 | 0.006985 | 0.628003 | 0.206092 | -0.704129 | 0.315, 0.329, 0.486 |
| 13 | 122640 | 0.246905 | 0.001153 | 0.758974 | 0.381851 | -0.800235 | 0.136, 0.238, 0.367 |

Exponent fits: `meanK theta=-0.070988`, `defect theta=0.028418`, `abs(effect-vs-random) theta=0.048899`.

Endpoint controls at degree=13:

| group | meanK range | defect range | flatness range |
| --- | ---: | ---: | ---: |
| balanced residue fake | 0.001153 .. 0.001153 | 0.998847 .. 0.998847 | 0.564995 .. 0.564995 |
| random monic | 0.981028 .. 1.202681 | 0.013914 .. 0.327937 | 0.003580 .. 0.214358 |
| random reducible | 1.087206 .. 1.165445 | 0.096938 .. 0.225200 | 0.016105 .. 0.154338 |

SVG: `logs/playground-artifacts/modulus-flow-curvature-audit-8000000.svg`
JSON: `logs/playground-artifacts/modulus-flow-curvature-audit-8000000.json`