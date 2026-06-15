# prime-predecessor totient/radical rank drift audit

Candidate:
rank even integers in each fresh block by `log(phi(n))/log(n)` and
`log(rad(n))/log(n)`, then score the percentile ranks of prime predecessors
`n=p-1`.

Aggregates:
`sqrt(#prime predecessors) * (mean rank - 1/2)`.

The local-product model weights even `n` by
`product_{odd q|n, q<=97} (q-1)/(q-2)`, the first-order AP bias for
prime predecessors.

## Totient-compression rank

Aggregate exponent fit: prime `0.497689`;
corrected `0.015585`.

| block | prime predecessors | mean prime rank | prime aggregate | local-product aggregate | corrected aggregate | random even range | composite-successor range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 100000..200000 | 8392 | 0.397252505 | -9.412478 | -9.346792 | -0.065686 | 0.155179 .. 0.498911 | 1.403676 .. 2.064248 | -7.852453 .. -7.439795 |
| 125000..250000 | 10310 | 0.397163811 | -10.441798 | -10.360667 | -0.081132 | -0.509907 .. 0.041734 | 2.014321 .. 2.219248 | -8.785903 .. -7.888716 |
| 250000..500000 | 19494 | 0.397521072 | -14.308202 | -14.249612 | -0.058590 | -0.158314 .. 0.364450 | 2.087407 .. 2.681934 | -11.879108 .. -11.343806 |
| 500000..1000000 | 36960 | 0.397518063 | -19.702136 | -19.625121 | -0.077014 | -0.371533 .. 0.056116 | 3.133043 .. 3.672731 | -16.296606 .. -15.627608 |

## Radical-compression rank

Aggregate exponent fit: prime `0.559119`;
corrected `-0.470391`.

| block | prime predecessors | mean prime rank | prime aggregate | local-product aggregate | corrected aggregate | random even range | composite-successor range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 100000..200000 | 8392 | 0.477490450 | -2.062052 | -2.247869 | 0.185818 | -0.181601 .. 0.457973 | -0.146592 .. 0.566624 | -1.856291 .. -1.288125 |
| 125000..250000 | 10310 | 0.476728696 | -2.362926 | -2.488806 | 0.125880 | -0.307872 .. 0.051169 | -0.028697 .. 0.790845 | -2.141919 .. -1.559851 |
| 250000..500000 | 19494 | 0.476635668 | -3.262149 | -3.423891 | 0.161742 | -0.071495 .. 0.376877 | -0.013995 .. 1.174694 | -3.137008 .. -1.965532 |
| 500000..1000000 | 36960 | 0.475089255 | -4.789087 | -4.714148 | -0.074938 | -0.536654 .. 0.440533 | 0.558584 .. 1.122611 | -4.401856 .. -3.412594 |

## Artifacts

- JSON: `logs/playground-artifacts/predecessor-rank-transform-audit-1000000-q97.json`
- SVG: `logs/playground-artifacts/predecessor-rank-transform-audit-1000000-q97.svg`
