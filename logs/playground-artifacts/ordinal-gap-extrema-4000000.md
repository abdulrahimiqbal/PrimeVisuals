# Ordinal normalized-gap extrema bridge audit

Candidate: E=1 when the middle normalized gap in a triple is a strict local max/min; residual against iid ordinal main term 2/3.

Range: 4000000. Seeds: 12345, 271828, 314159, 161803, 424242.

## Endpoint trace

| N | triples | hits | rate | real z | real max/sqrt | shuffled max | Cramer max | W210 max | composite max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22040 | 14737 | 0.668648 | 0.294133 | 0.496210 | 0.244737..0.893626 | 0.333920..0.833314 | 0.431865..0.723132 | 0.355461..1.486912 |
| 500000 | 41534 | 27755 | 0.668248 | 0.322213 | 0.379459 | 0.354925..0.816164 | 0.271281..0.908966 | 0.314970..0.762788 | 0.481015..1.796097 |
| 1000000 | 78494 | 52516 | 0.669045 | 0.666267 | 0.756689 | 0.325995..0.659129 | 0.226412..0.787257 | 0.294492..0.665962 | 0.431376..1.662151 |
| 2000000 | 148929 | 99833 | 0.670340 | 1.417417 | 1.451104 | 0.302313..0.656452 | 0.280213..0.713840 | 0.289127..0.994072 | 0.736751..1.721855 |
| 4000000 | 283142 | 189885 | 0.670635 | 2.111715 | 2.122991 | 0.384005..0.568804 | 0.280275..0.954825 | 0.418858..0.724963 | 0.603883..1.784086 |

## Block normalized residuals

| block | triples | hits | rate | real | shuffled | Cramer | W210 | composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 250000] | 22040 | 14737 | 0.668648 | 0.294133 | -0.716248..0.577040 | -0.219611..0.686921 | -0.680304..0.053703 | -0.254425..1.345935 |
| (250000, 500000] | 19494 | 13018 | 0.667795 | 0.157570 | -0.057298..0.558656 | -0.356389..0.563309 | -0.232959..0.449226 | -0.058933..1.020935 |
| (500000, 1000000] | 36960 | 24761 | 0.669940 | 0.629389 | -0.712614..0.176853 | -0.370912..0.209717 | -0.401820..0.479765 | 0.121419..0.803835 |
| (1000000, 2000000] | 70435 | 47317 | 0.671782 | 1.357720 | -0.349164..0.280085 | -0.628649..0.412086 | -0.866876..0.722202 | 0.136736..0.966170 |
| (2000000, 4000000] | 134213 | 90052 | 0.670963 | 1.574083 | -0.276602..0.102816 | -0.577164..0.654426 | -0.157367..0.794824 | 0.119930..0.831463 |

## Summary

Real max residual theta: `1.073375`.
Endpoint shuffled-gap max/sqrt range: `0.384005..0.568804`.
Endpoint Cramer max/sqrt range: `0.280275..0.954825`.
Endpoint W210 max/sqrt range: `0.418858..0.724963`.
Endpoint composite max/sqrt range: `0.603883..1.784086`.

## Factor check

The object is a nonlinear ordinal transform of adjacent normalized gaps. It does not telescope to theta/psi, but if W210/Cramer labels or shuffled real gaps reproduce the bridge, then it is not a new critical line. A positive excess would be the ordinal form of adjacent-gap anti-correlation or transition structure unless transition-matched controls fail.

## Files

- JSON: `logs/playground-artifacts/ordinal-gap-extrema-4000000.json`
- SVG: `logs/playground-artifacts/ordinal-gap-extrema-4000000.svg`