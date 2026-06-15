# gaplogwalk audit

Candidate: `gaplogwalk(x)=sum_{p_i,p_{i+1}<=x}(p_{i+1}-p_i-log p_i)`.

Preregistered confirmation: sharp flat line whose normalized residual is stable
and beats five Cramer plus composite controls.

Preregistered break: algebraic collapse to Chebyshev `theta/psi`, visible
drift, or fake/composite reproduction.

Factor check: for any increasing label sequence `a_i`,
`sum (a_{i+1}-a_i-log a_i)=a_k-a_0-sum log a_i`. For primes this is
`p_k-2-theta(p_{k-1})`, hence Chebyshev `theta` in gap clothing.

## Summary at N=16000000

| series | labels | final value | maxAbs | maxAbs/sqrt(N) | theta | identity error |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| real-primes | 1031130 | 4284.948 | 6319.645 | 1.579911 | 0.481322 | 1.674e-7 |
| cramer-seed-12345 | 1030753 | 9940.444 | 13977.594 | 3.494399 | 0.693274 | -2.904e-7 |
| cramer-seed-271828 | 1031604 | -3416.195 | 14832.848 | 3.708212 | 0.689479 | -4.450e-7 |
| cramer-seed-314159 | 1030751 | 9185.811 | 18680.170 | 4.670043 | 0.377288 | -1.052e-7 |
| cramer-seed-161803 | 1033066 | -26937.844 | 29691.491 | 7.422873 | 0.833764 | 7.550e-7 |
| cramer-seed-424242 | 1034420 | -44956.516 | 46867.552 | 11.716888 | 0.616040 | 8.181e-8 |
| composite-W210-seed-12345 | 738141 | 4523495.860 | 4523495.860 | 1130.873965 | 0.931215 | -6.054e-7 |
| composite-W210-seed-271828 | 738545 | 4516754.380 | 4516754.380 | 1129.188595 | 0.928868 | -4.489e-7 |
| composite-W210-seed-314159 | 738991 | 4509126.183 | 4509173.124 | 1127.293281 | 0.925945 | -1.611e-7 |
| composite-W210-seed-161803 | 739546 | 4499717.948 | 4499726.536 | 1124.931634 | 0.927412 | -2.198e-7 |
| composite-W210-seed-424242 | 740943 | 4480299.831 | 4480337.359 | 1120.084340 | 0.930297 | -1.155e-7 |

SVG: `logs/playground-artifacts/gaplogwalk-audit-16000000.svg`
JSON: `logs/playground-artifacts/gaplogwalk-audit-16000000.json`
