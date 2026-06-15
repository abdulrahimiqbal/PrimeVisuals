# Mobius-twisted local modulus-flow audit

Candidate:
locally subtract residue-class means of `mu(n-1)` and score standardized prime residual energy through the wheel / polynomial-modulus tower.

## Integer side

| N | labels | real meanE | effect vs stratified | level energies |
| ---: | ---: | ---: | ---: | --- |
| 250000 | 22038 | 0.394094 | -1.301257 | 0.028, 0.381, 0.450, 0.504, 0.607 |
| 500000 | 41532 | 0.408524 | -0.964605 | 0.123, 0.311, 0.484, 0.520, 0.605 |
| 1000000 | 78492 | 0.902240 | -1.019333 | 1.312, 1.252, 0.775, 0.566, 0.606 |
| 2000000 | 148927 | 0.916565 | -0.230692 | 1.497, 1.158, 0.673, 0.627, 0.628 |
| 4000000 | 283140 | 1.152024 | -0.093192 | 2.509, 1.232, 0.748, 0.632, 0.639 |

Integer exponent fits: `meanE theta=0.462515`, `abs(effect-vs-stratified) theta=-1.051230`.

Endpoint controls at N=4000000:

| group | meanE range | defect range | flatness range |
| --- | ---: | ---: | ---: |
| stratified composite by residue | 0.745306 .. 1.586824 | 0.322769 .. 0.960816 | 0.198177 .. 0.539418 |
| eligible random | 0.716385 .. 1.569951 | 0.366505 .. 0.937204 | 0.327254 .. 0.514331 |
| Cramer labels | 0.557293 .. 0.925520 | 0.370045 .. 0.502597 | 0.391878 .. 0.537047 |
| composite random | 1.315468 .. 2.225281 | 0.349802 .. 1.692764 | 0.114891 .. 0.524861 |

## F_2[t] side

| degree | labels | real meanE | effect vs stratified | level energies |
| ---: | ---: | ---: | ---: | --- |
| 17 | 7710 | 0.555894 | -0.883781 | 0.590, 0.534, 0.477, 0.623 |
| 18 | 14532 | 0.578413 | -0.550097 | 0.477, 0.560, 0.621, 0.655 |
| 19 | 27594 | 0.750641 | -0.218242 | 1.023, 0.724, 0.622, 0.634 |
| 20 | 52377 | 0.480280 | -0.897114 | 0.323, 0.355, 0.600, 0.643 |

Exponent fits: `meanE theta=-0.028100`, `abs(effect-vs-stratified) theta=-0.136572`.

Endpoint controls at degree=20:

| group | meanE range | defect range | flatness range |
| --- | ---: | ---: | ---: |
| stratified reducible by residue | 0.753437 .. 2.428385 | 0.236101 .. 2.098953 | 0.160992 .. 0.633326 |
| random monic | 0.825434 .. 1.647466 | 0.207223 .. 1.072301 | 0.185867 .. 0.518834 |
| random reducible | 0.922659 .. 1.444087 | 0.229826 .. 0.504764 | 0.166157 .. 0.337072 |

## F_3[t] side

| degree | labels | real meanE | effect vs stratified | level energies |
| ---: | ---: | ---: | ---: | --- |
| 10 | 5880 | 0.719831 | -0.898768 | 1.073, 0.510, 0.632, 0.664 |
| 11 | 16104 | 0.536172 | -1.515961 | 0.333, 0.609, 0.576, 0.627 |
| 12 | 44220 | 1.214587 | -0.304550 | 2.570, 0.935, 0.678, 0.675 |

Exponent fits: `meanE theta=0.259524`, `abs(effect-vs-stratified) theta=-0.536823`.

Endpoint controls at degree=12:

| group | meanE range | defect range | flatness range |
| --- | ---: | ---: | ---: |
| stratified reducible by residue | 1.084596 .. 1.811527 | 0.312698 .. 1.008195 | 0.098672 .. 0.423184 |
| random monic | 0.816526 .. 1.109879 | 0.184469 .. 0.306695 | 0.182615 .. 0.300986 |
| random reducible | 1.472933 .. 1.665324 | 0.545002 .. 0.792790 | 0.183887 .. 0.331240 |

SVG: `logs/playground-artifacts/mobius-modulus-flow-audit-4000000.svg`
JSON: `logs/playground-artifacts/mobius-modulus-flow-audit-4000000.json`