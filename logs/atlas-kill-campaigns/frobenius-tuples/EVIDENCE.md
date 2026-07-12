# Evidence: quadratic-Frobenius additive prime-pair race

Run: 2026-07-12T21:48:35.962Z

## Headline confirmatory result

| block | cohort | cells | RMS z | max |z| | Stouffer z |
| --- | --- | ---: | ---: | ---: | ---: |
| (0,1000000] | holdout shifts | 36 | 0.6219 | 1.5643 | 0.0548 |
| (1000000,2000000] | holdout shifts | 36 | 0.6374 | 1.5823 | -0.6550 |
| (2000000,4000000] | holdout shifts | 36 | 0.7847 | 2.1828 | 0.2999 |
| (4000000,8000000] | holdout shifts | 36 | 0.5847 | 1.6878 | -0.2524 |

Final confirmatory profile correlation: `-0.0346`; residual-rate correlation: `-0.0609`; sign agreement: `0.5000`.

## Control envelopes (final confirmatory block)

| family | runs | RMS z range | max |z| range | |Stouffer z| range | replication r range | sign agreement range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| cramer | 8 | 0.7918..1.1280 | 1.4932..3.0890 | 0.1336..1.0187 | -0.3130..0.1077 | 0.3235..0.7222 |
| wheel | 8 | 0.7302..1.0379 | 1.5613..2.3057 | 0.0593..0.9701 | -0.2982..0.2901 | 0.3889..0.5556 |
| composite | 8 | 0.6249..0.9626 | 1.5259..2.6075 | 0.1267..2.3436 | -0.1786..0.3478 | 0.4167..0.6111 |
| semiprime | 8 | 0.6774..0.9058 | 1.4313..2.2629 | 0.0594..0.7067 | -0.0536..0.2698 | 0.4444..0.6389 |
| balancedResidue | 8 | 0.4585..0.8725 | 0.8830..2.0793 | 0.0362..1.1655 | -0.1885..0.2013 | 0.4706..0.6897 |
| nearbyCovers | 1 | 0.8642..0.8642 | 2.0652..2.0652 | 0.2387..0.2387 | 0.1115..0.1115 | 0.4857..0.4857 |

Exact conditional Monte Carlo (256 runs): RMS z 99% envelope `1.2753`; max |z| 99% envelope `3.4827`.

## Hardy--Littlewood count calibration

The Frobenius residual is centered by the observed pair count, so these count errors cannot create it.

| shift | S(h) | N(8m) | predicted | ratio |
| ---: | ---: | ---: | ---: | ---: |
| 2 | 1.320324 | 48618 | 48447.3 | 1.00352 |
| 6 | 2.640647 | 96705 | 96894.0 | 0.99805 |
| 8 | 1.320324 | 48395 | 48446.8 | 0.99893 |
| 12 | 2.640647 | 96895 | 96893.1 | 1.00002 |
| 18 | 2.640647 | 96938 | 96892.2 | 1.00047 |
| 24 | 2.640647 | 96849 | 96891.5 | 0.99956 |
| 32 | 1.320324 | 48312 | 48445.3 | 0.99725 |
| 36 | 2.640647 | 97368 | 96890.1 | 1.00493 |
| 46 | 1.383196 | 50569 | 50751.4 | 0.99641 |
| 48 | 2.640647 | 96822 | 96888.9 | 0.99931 |
| 54 | 2.640647 | 96871 | 96888.4 | 0.99982 |
| 64 | 1.320324 | 48332 | 48443.7 | 0.99769 |

## Gate result

Data verdict: **KILL_NO_REPLICATED_CONTROL_SURVIVING_FROBENIUS_TUPLE_RESIDUAL**

- PASS: exact local identity — 144/144 finite residue checks pass
- FAIL: control survival — real final RMS=0.5847, conditional q99=1.2753, max frozen control=1.1280
- FAIL: disjoint-block replication — r=-0.0346, sign agreement=0.5000
- FAIL: cover/discovery corroboration — matched-cover RMS=0.8642, discovery-shift RMS=0.8076

Full cell data: `cell-data.csv`; structured report: `results.json`.
