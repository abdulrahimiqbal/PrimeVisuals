# pmuprev audit

Candidate: `pmuprev(n)=sum_{p<=n} mu(p-1)`.

Preregistered confirmation: real primes give a flat zero line with materially
smaller `maxAbs/sqrt(N)` than Cramer, wheel, and composite-only controls.

Preregistered break: controls reproduce the same scale, or the line is just
ordinary Mobius cancellation sampled through local congruence filters.

## Summary at N=16000000

| series | labels | final value | maxAbs | maxAbs/sqrt(N) | theta |
| --- | ---: | ---: | ---: | ---: | ---: |
| real-primes | 1031130 | -522.000 | 1107.000 | 0.276750 | 0.503583 |
| cramer-seed-12345 | 1030753 | 297.000 | 746.000 | 0.186500 | 0.705276 |
| cramer-seed-271828 | 1031604 | 483.000 | 840.000 | 0.210000 | 0.451608 |
| cramer-seed-314159 | 1030751 | 618.000 | 926.000 | 0.231500 | 0.625797 |
| cramer-seed-161803 | 1033066 | 160.000 | 549.000 | 0.137250 | 0.394276 |
| cramer-seed-424242 | 1034420 | 58.000 | 371.000 | 0.092750 | 0.384043 |
| wheel-expect-W210 |  | -21.942 | 211.784 | 0.052946 | 0.442365 |
| composite-W210-seed-12345 | 738141 | 388.000 | 749.000 | 0.187250 | 0.756653 |
| composite-W210-seed-271828 | 738545 | -142.000 | 362.000 | 0.090500 | 0.257663 |
| composite-W210-seed-314159 | 738991 | -206.000 | 424.000 | 0.106000 | 0.309568 |
| composite-W210-seed-161803 | 739546 | 823.000 | 1021.000 | 0.255250 | 0.349710 |
| composite-W210-seed-424242 | 740943 | 370.000 | 633.000 | 0.158250 | 0.447215 |

SVG: `logs/playground-artifacts/pmuprev-audit-16000000.svg`
JSON: `logs/playground-artifacts/pmuprev-audit-16000000.json`
