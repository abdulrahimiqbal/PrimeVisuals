# pmuprev audit

Candidate: `pmuprev(n)=sum_{p<=n} mu(p-1)`.

Preregistered confirmation: real primes give a flat zero line with materially
smaller `maxAbs/sqrt(N)` than Cramer, wheel, and composite-only controls.

Preregistered break: controls reproduce the same scale, or the line is just
ordinary Mobius cancellation sampled through local congruence filters.

## Summary at N=4000000

| series | labels | final value | maxAbs | maxAbs/sqrt(N) | theta |
| --- | ---: | ---: | ---: | ---: | ---: |
| real-primes | 283146 | -825.000 | 833.000 | 0.416500 | 0.951303 |
| cramer-seed-12345 | 283084 | 77.000 | 299.000 | 0.149500 | 0.580437 |
| cramer-seed-271828 | 283531 | 385.000 | 452.000 | 0.226000 | 0.577561 |
| cramer-seed-314159 | 282625 | 247.000 | 329.000 | 0.164500 | 0.408307 |
| cramer-seed-161803 | 283065 | 160.000 | 351.000 | 0.175500 | 0.454572 |
| cramer-seed-424242 | 284735 | -74.000 | 235.000 | 0.117500 | 0.509532 |
| wheel-expect-W210 |  | -75.865 | 184.277 | 0.092138 | 0.361526 |
| composite-W210-seed-12345 | 195003 | 309.000 | 364.000 | 0.182000 | 0.514051 |
| composite-W210-seed-271828 | 194809 | -79.000 | 362.000 | 0.181000 | 0.218054 |
| composite-W210-seed-314159 | 194729 | -270.000 | 373.000 | 0.186500 | 0.601510 |
| composite-W210-seed-161803 | 194728 | 680.000 | 716.000 | 0.358000 | 0.759273 |
| composite-W210-seed-424242 | 195784 | 365.000 | 421.000 | 0.210500 | 0.923203 |

SVG: `logs/playground-artifacts/pmuprev-audit-4000000.svg`
JSON: `logs/playground-artifacts/pmuprev-audit-4000000.json`
