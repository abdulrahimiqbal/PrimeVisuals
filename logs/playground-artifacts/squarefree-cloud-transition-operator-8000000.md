# Squarefree cloud transition operator audit

State: v(label)=(mu(oddpart(label+h))) for shifts [-10,-8,-4,-2,2,4,8,10]. Bridge: centered lag-1 operator norm divided by sqrt(pair count).

Range: 8000000. Seeds: 12345, 271828, 314159, 161803, 424242. Local composite match modulus: 11025.

## Endpoint trace

| N | pairs | real op/sqrt | real frob/sqrt | row-shuffle op | Cramer op | W210 op | composite op | local-composite op |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41532 | 85.868159 | 105.609557 | 3.630002..4.090917 | 68.478153..70.143446 | 66.618461..67.516854 | 52.679095..53.906400 | 3.466466..4.124643 |
| 1000000 | 78492 | 115.600428 | 140.525805 | 3.626038..4.098423 | 91.381459..93.574070 | 88.848693..91.192034 | 76.502321..76.951413 | 3.279568..4.055178 |
| 2000000 | 148927 | 153.195433 | 185.242925 | 3.249040..4.214230 | 121.952569..125.016841 | 119.807705..121.915653 | 109.623776..111.226195 | 3.341742..4.423331 |
| 4000000 | 283140 | 205.605533 | 247.391056 | 3.062370..4.293159 | 164.911510..168.223313 | 161.718409..163.741466 | 157.977068..160.800012 | 3.572186..4.288293 |
| 8000000 | 539771 | 276.026573 | 330.007848 | 3.172272..4.172398 | 222.844506..225.821964 | 217.862613..220.515233 | 228.035157..230.183584 | 3.401160..4.049893 |

## Block operator norms

| block | pairs | real op/sqrt | row-shuffle | Cramer | W210 | composite | local-composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 500000] | 41532 | 85.868159 | 3.630002..4.090917 | 68.478153..70.143446 | 66.618461..67.516854 | 52.679095..53.906400 | 3.466466..4.124643 |
| (500000, 1000000] | 36960 | 77.543104 | 3.916914..4.549871 | 60.708401..62.249052 | 58.821907..61.633073 | 54.854443..55.582760 | 3.547956..4.171453 |
| (1000000, 2000000] | 70435 | 100.771515 | 3.559339..4.167331 | 80.972378..83.565363 | 79.747953..81.061679 | 78.579418..80.400022 | 3.291862..4.155059 |
| (2000000, 4000000] | 134213 | 137.308522 | 3.052013..4.378948 | 111.116228..113.194822 | 108.621386..110.245316 | 113.392220..116.185534 | 3.535540..4.569441 |
| (4000000, 8000000] | 256631 | 184.402334 | 3.536647..4.081607 | 148.531202..150.849390 | 145.741115..148.371542 | 164.278671..165.529340 | 3.383886..4.292532 |

## Endpoint real matrix

Rows are previous-prime shifts; columns are next-prime shifts; entries are centered and divided by sqrt(pair count).

| h\\k | -10 | -8 | -4 | -2 | 2 | 4 | 8 | 10 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| -10 | -0.975 | 0.174 | 1.099 | -1.371 | 0.473 | 0.080 | -0.429 | -0.120 |
| -8 | 42.538 | -0.538 | -0.373 | -0.985 | 0.688 | 0.419 | 0.319 | -0.072 |
| -4 | 86.841 | 38.978 | -0.301 | -0.308 | -0.421 | -0.770 | -0.125 | -0.570 |
| -2 | 29.880 | 82.213 | 39.532 | -0.375 | -0.184 | 0.581 | -0.611 | 0.852 |
| 2 | 60.538 | 31.185 | 86.387 | 109.810 | -0.203 | 0.255 | -0.650 | 0.955 |
| 4 | 15.896 | 56.889 | 99.797 | 86.114 | 37.432 | 0.440 | -0.001 | -0.810 |
| 8 | 42.322 | 69.370 | 57.801 | 33.721 | 81.674 | 37.692 | -0.529 | 1.105 |
| 10 | 84.119 | 43.053 | 18.514 | 62.375 | 29.610 | 86.472 | 41.153 | -0.166 |

## Exact shifted-overlap diagnostic

If `p_{i+1}=p_i+g` and `h_prev = g+h_next`, then `p_i+h_prev` and `p_{i+1}+h_next` are the same integer. Those entries test squarefreeness of the same shifted number twice, producing a deterministic positive contribution.

Support entries: `28`. Frobenius share on exact-overlap support: `0.999877`. Matrix/overlap-nonzero correlation: `0.870307`.

| previous h | next h | gap | overlap pairs | nonzero overlaps/sqrt | matrix entry |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | -2 | 4 | 48286 | 38.213339 | 109.810287 |
| 4 | -4 | 8 | 34751 | 28.115218 | 99.797052 |
| -4 | -10 | 6 | 82317 | 87.777027 | 86.840780 |
| 10 | 4 | 6 | 82317 | 87.734833 | 86.471609 |
| 2 | -4 | 6 | 82317 | 80.926529 | 86.387163 |
| 4 | -2 | 6 | 82317 | 80.748223 | 86.113816 |
| 10 | -10 | 20 | 17773 | 15.298947 | 84.119350 |
| -2 | -8 | 6 | 82317 | 82.355701 | 82.213380 |
| 8 | 2 | 6 | 82317 | 82.278118 | 81.674235 |
| 8 | -8 | 16 | 20392 | 16.530757 | 69.369582 |
| 10 | -2 | 12 | 53583 | 56.591131 | 62.374826 |
| 2 | -10 | 12 | 53583 | 56.667354 | 60.537526 |

## Coordinate-free function-field shell state check

No lexicographic transition is used here; that would be an ordering artifact. Rows report unordered shell state covariance for constant shifts.

| q | degree | shifts | irreducibles | mean norm | covariance op |
| ---: | ---: | --- | ---: | ---: | ---: |
| 3 | 1 | 1,2 | 3 | 1.414214 | 0.000000 |
| 3 | 2 | 1,2 | 3 | 1.000000 | 0.000000 |
| 3 | 3 | 1,2 | 8 | 0.176777 | 0.843750 |
| 3 | 4 | 1,2 | 18 | 0.333333 | 0.845061 |
| 3 | 5 | 1,2 | 48 | 0.265165 | 0.367188 |
| 3 | 6 | 1,2 | 116 | 0.181854 | 0.746342 |
| 3 | 7 | 1,2 | 312 | 0.054393 | 0.535503 |
| 3 | 8 | 1,2 | 810 | 0.057854 | 0.552066 |
| 3 | 9 | 1,2 | 2184 | 0.013598 | 0.547892 |
| 3 | 10 | 1,2 | 5880 | 0.011646 | 0.575245 |
| 3 | 11 | 1,2 | 16104 | 0.006323 | 0.537590 |
| 3 | 12 | 1,2 | 44220 | 0.008151 | 0.551420 |
| 5 | 1 | 1,2,3,4 | 5 | 2.000000 | 0.000000 |
| 5 | 2 | 1,2,3,4 | 10 | 0.707107 | 0.000000 |
| 5 | 3 | 1,2,3,4 | 40 | 0.000000 | 0.000000 |
| 5 | 4 | 1,2,3,4 | 150 | 0.235702 | 1.408076 |
| 5 | 5 | 1,2,3,4 | 624 | 0.076923 | 0.913462 |
| 5 | 6 | 1,2,3,4 | 2580 | 0.154310 | 0.804712 |
| 5 | 7 | 1,2,3,4 | 11160 | 0.009857 | 0.740494 |
| 5 | 8 | 1,2,3,4 | 48750 | 0.033107 | 0.786289 |

## Summary

Real op-norm theta: `0.882546`.
Endpoint row-shuffle op/sqrt range: `3.172272..4.172398`.
Endpoint Cramer op/sqrt range: `222.844506..225.821964`.
Endpoint W210 op/sqrt range: `217.862613..220.515233`.
Endpoint composite op/sqrt range: `228.035157..230.183584`.
Endpoint local-composite op/sqrt range: `3.401160..4.049893`.

## Factor check

This object avoids collapsing to a one-coordinate Mobius product, but it still uses the prime successor order. Row-shuffle controls keep the exact same state multiset and break any claim that depends only on available local states; local-composite controls keep a matched small-prime residue environment and break finite local squarefactor explanations. A survivor must beat both.

## Files

- JSON: `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.json`
- SVG: `logs/playground-artifacts/squarefree-cloud-transition-operator-8000000.svg`