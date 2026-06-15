# pmugapres audit

Candidate: `pmugapres(n)=sum_{p<=n} mu(p-1)*(gap(p)-log(p))`.

Preregistered confirmation: flat line with stable residual and materially
smaller scale than five Cramer and composite controls.

Preregistered break: visible drift, unstable residual exponent, or comparable
fake/composite controls.

## Summary at N=4000000

| series | labels | final value | maxAbs | maxAbs/sqrt(N) | theta |
| --- | ---: | ---: | ---: | ---: | ---: |
| real-primes | 283146 | -3611.032 | 5269.837 | 2.634919 | 0.710683 |
| cramer-seed-12345 | 283084 | 319.467 | 2357.982 | 1.178991 | 0.328289 |
| cramer-seed-271828 | 283531 | 1901.580 | 3359.981 | 1.679990 | 0.313558 |
| cramer-seed-314159 | 282625 | -601.003 | 3447.911 | 1.723956 | 0.509795 |
| cramer-seed-161803 | 283065 | -5038.886 | 5894.846 | 2.947423 | 0.728284 |
| cramer-seed-424242 | 284735 | -1214.031 | 3804.634 | 1.902317 | 0.624502 |
| composite-W210-seed-12345 | 195003 | 476.676 | 4012.886 | 2.006443 | 0.243372 |
| composite-W210-seed-271828 | 194809 | 2377.105 | 3602.321 | 1.801160 | 0.056078 |
| composite-W210-seed-314159 | 194729 | 2199.620 | 3719.844 | 1.859922 | 0.257910 |
| composite-W210-seed-161803 | 194728 | 1854.002 | 9288.430 | 4.644215 | 0.862841 |
| composite-W210-seed-424242 | 195784 | -2145.684 | 3883.764 | 1.941882 | 0.427744 |

SVG: `logs/playground-artifacts/pmugapres-audit-4000000.svg`
JSON: `logs/playground-artifacts/pmugapres-audit-4000000.json`
