# Ordinal normalized-gap extrema bridge audit

Candidate: E=1 when the middle normalized gap in a triple is a strict local max/min; residual against iid ordinal main term 2/3.

Range: 500000. Seeds: 12345, 271828, 314159, 161803, 424242.

## Endpoint trace

| N | triples | hits | rate | real z | real max/sqrt | shuffled max | Cramer max | W210 max | composite max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 31250 | 3364 | 2286 | 0.679548 | 0.747126 | 1.000000 | 0.316092..0.511494 | 0.307479..0.873324 | 0.307026..0.551246 | 0.413317..0.831013 |
| 62500 | 6271 | 4219 | 0.672779 | 0.484070 | 0.732419 | 0.235721..0.660861 | 0.226725..0.894157 | 0.299859..0.706447 | 0.343211..0.719154 |
| 125000 | 11730 | 7884 | 0.672123 | 0.590923 | 0.680177 | 0.289306..0.901773 | 0.181300..0.781709 | 0.414998..0.824708 | 0.293815..1.055463 |
| 250000 | 22040 | 14737 | 0.668648 | 0.294133 | 0.496210 | 0.211058..0.662361 | 0.333920..0.833314 | 0.431865..0.723132 | 0.316854..0.811425 |
| 500000 | 41534 | 27755 | 0.668248 | 0.322213 | 0.379459 | 0.199543..0.557739 | 0.271281..0.908966 | 0.314970..0.762788 | 0.371277..1.002610 |

## Block normalized residuals

| block | triples | hits | rate | real | shuffled | Cramer | W210 | composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 31250] | 3364 | 2286 | 0.679548 | 0.747126 | -0.218391..0.333333 | -0.592961..0.708867 | -0.365563..0.125324 | -0.228823..0.659079 |
| (31250, 62500] | 2907 | 1933 | 0.664947 | -0.092736 | -0.092736..0.890264 | 0.086793..0.364824 | -0.300499..0.549927 | -0.479708..0.276787 |
| (62500, 125000] | 5459 | 3665 | 0.671368 | 0.347386 | -1.506845..-0.072184 | -0.440117..0.272468 | -0.624077..-0.279663 | -0.488991..0.760413 |
| (125000, 250000] | 10310 | 6853 | 0.664694 | -0.200253 | -0.249496..0.105051 | -0.042461..0.522859 | -0.672590..0.700222 | 0.127950..0.694850 |
| (250000, 500000] | 19494 | 13018 | 0.667795 | 0.157570 | -0.501358..-0.042974 | -0.356389..0.563309 | -0.232959..0.449226 | -0.079529..0.281466 |

## Summary

Real max residual theta: `0.117503`.
Endpoint shuffled-gap max/sqrt range: `0.199543..0.557739`.
Endpoint Cramer max/sqrt range: `0.271281..0.908966`.
Endpoint W210 max/sqrt range: `0.314970..0.762788`.
Endpoint composite max/sqrt range: `0.371277..1.002610`.

## Factor check

The object is a nonlinear ordinal transform of adjacent normalized gaps. It does not telescope to theta/psi, but if W210/Cramer labels or shuffled real gaps reproduce the bridge, then it is not a new critical line. A positive excess would be the ordinal form of adjacent-gap anti-correlation or transition structure unless transition-matched controls fail.

## Files

- JSON: `logs/playground-artifacts/ordinal-gap-extrema-500000.json`
- SVG: `logs/playground-artifacts/ordinal-gap-extrema-500000.svg`