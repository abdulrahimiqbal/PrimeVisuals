# Overlap-projected squarefree cloud residual operator audit

State: v(label)=(mu(oddpart(label+h))) for shifts [-10,-8,-4,-2,2,4,8,10]. For each pair, entries with h_prev-h_next=gap are excluded before entrywise centering.

Range: 8000000. Seeds: 12345, 271828, 314159, 161803, 424242. Local composite match modulus: 11025.

## Endpoint trace

| N | pairs | skipped/pair | real op/sqrt | real frob/sqrt | row-shuffle op | Cramer op | W210 op | composite op | local-composite op |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500000 | 41532 | 2.960368 | 26.852970 | 44.734748 | 3.362382..3.953658 | 3.139824..4.330473 | 2.545423..4.179622 | 6.537709..7.091528 | 3.419781..4.151358 |
| 1000000 | 78492 | 2.864432 | 35.103729 | 58.870474 | 3.318571..3.796359 | 3.328628..4.074025 | 2.998514..5.184635 | 7.760820..8.643328 | 2.930724..3.920953 |
| 2000000 | 148927 | 2.775501 | 45.030965 | 76.960042 | 3.250544..3.977892 | 3.142910..4.350469 | 3.044870..3.882735 | 9.236556..10.287152 | 3.303628..4.213772 |
| 4000000 | 283140 | 2.690711 | 59.723534 | 102.256655 | 3.044870..4.241751 | 3.470810..4.065028 | 2.892398..3.772752 | 11.137577..12.921548 | 3.535375..4.140246 |
| 8000000 | 539771 | 2.607873 | 78.292168 | 134.722555 | 3.137134..4.213223 | 3.110493..3.860462 | 3.061837..3.636226 | 14.235542..15.368696 | 3.516561..3.743411 |

## Block operator norms

| block | pairs | real op/sqrt | row-shuffle | Cramer | W210 | composite | local-composite |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (1, 500000] | 41532 | 26.852970 | 3.362382..3.953658 | 3.139824..4.330473 | 2.545423..4.179622 | 6.537709..7.091528 | 3.419781..4.151358 |
| (500000, 1000000] | 36960 | 22.965841 | 3.748707..4.560290 | 3.550776..4.567762 | 3.301382..4.428279 | 5.073971..6.824031 | 3.423870..4.173372 |
| (1000000, 2000000] | 70435 | 28.723723 | 3.499305..4.078403 | 3.765915..4.202531 | 3.072631..4.221448 | 6.324282..7.338947 | 3.240212..4.267690 |
| (2000000, 4000000] | 134213 | 39.571455 | 2.910265..4.252641 | 3.117381..4.115188 | 2.772476..4.293154 | 7.697903..8.918420 | 3.522269..4.386335 |
| (4000000, 8000000] | 256631 | 50.849331 | 3.457375..4.141294 | 3.051888..3.584057 | 2.742886..4.338497 | 9.227745..10.918161 | 3.533102..4.241464 |

## Endpoint projected residual matrix

Rows are previous-label shifts; columns are next-label shifts; entries are projected, entrywise centered, and divided by sqrt(pair count).

| h\\k | -10 | -8 | -4 | -2 | 2 | 4 | 8 | 10 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| -10 | -0.975 | 0.174 | 1.099 | -1.371 | 0.473 | 0.080 | -0.429 | -0.120 |
| -8 | 1.097 | -0.538 | -0.373 | -0.985 | 0.688 | 0.419 | 0.319 | -0.072 |
| -4 | -0.936 | 0.685 | -0.301 | -0.308 | -0.421 | -0.770 | -0.125 | -0.570 |
| -2 | 0.317 | -0.142 | 0.884 | -0.375 | -0.184 | 0.581 | -0.611 | 0.852 |
| 2 | 3.691 | -5.197 | 5.296 | 71.597 | -0.203 | 0.255 | -0.650 | 0.955 |
| 4 | -8.832 | 3.714 | 71.682 | 5.185 | -1.182 | 0.440 | -0.001 | -0.810 |
| 8 | 4.642 | 52.839 | 4.565 | -2.772 | -0.604 | -0.679 | -0.529 | 1.105 |
| 10 | 68.821 | 5.387 | -6.225 | 5.616 | -0.054 | -1.262 | -0.174 | -0.166 |

## Projection check

Endpoint skipped entries per pair: `2.607873`. Per-entry allowed pair count range: `457454..539771`. Exact-overlap entries are absent by construction; if a signal remains, it is not the direct Cycle 68 identity.

## Near-overlap diagnostic

After exact overlaps are removed, entries can still compare shifted integers at very small separation `delta = gap - (h_prev-h_next)`. This diagnostic isolates `|delta|<=2` and then excludes that band too.

Near band `|delta|<=2` op/sqrt: `49.283055`; Frobenius/sqrt: `49.442725`; correlation with full projected matrix: `0.487638`.
Far residual after also excluding `|delta|<=2` has endpoint op/sqrt `77.251092`, frob/sqrt `110.865270`, skipped/pair `7.542021`.

| excluded radius R in `|delta|<=R` | endpoint op/sqrt | endpoint frob/sqrt | skipped entries / pair |
| ---: | ---: | ---: | ---: |
| 0 | 78.292168 | 134.722555 | 2.607873 |
| 2 | 77.251092 | 110.865270 | 7.542021 |
| 4 | 66.552427 | 82.508501 | 12.514822 |
| 6 | 64.955193 | 82.207835 | 17.678441 |
| 10 | 4.058764 | 5.561637 | 26.681496 |
| 20 | 1.778456 | 2.991120 | 44.771221 |

## Coordinate-free function-field shell state check

As in Cycle 68, no lexicographic function-field successor ordering is used. Rows report unordered shell state covariance for constant shifts.

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

Real op-norm theta: `0.847975`.
Endpoint row-shuffle op/sqrt range: `3.137134..4.213223`.
Endpoint Cramer op/sqrt range: `3.110493..3.860462`.
Endpoint W210 op/sqrt range: `3.061837..3.636226`.
Endpoint composite op/sqrt range: `14.235542..15.368696`.
Endpoint local-composite op/sqrt range: `3.516561..3.743411`.

## Factor check

The exact shifted-overlap identity from Cycle 68 is removed entry-by-entry. A survivor must now beat row-shuffle, which preserves the exact state multiset and prime gap projection pattern, and local-composite controls, which preserve the same small-prime residue environment on the real prime timeline.

## Files

- JSON: `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.json`
- SVG: `logs/playground-artifacts/overlap-projected-cloud-operator-8000000.svg`