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

Aggregate exponent fit: prime `0.501119`;
corrected `0.942897`.

| block | prime predecessors | mean prime rank | prime aggregate | local-product aggregate | corrected aggregate | random even range | composite-successor range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1000000..2000000 | 70435 | 0.397699560 | -27.150120 | -27.096575 | -0.053546 | -0.527880 .. -0.141559 | 4.275975 .. 5.017394 | -22.367514 .. -21.888487 |
| 2000000..4000000 | 134213 | 0.397811652 | -37.436796 | -37.409251 | -0.027545 | -0.263650 .. 0.091053 | 5.813199 .. 6.254916 | -30.452339 .. -30.058756 |
| 4000000..8000000 | 256631 | 0.397506625 | -51.921873 | -51.735597 | -0.186276 | -0.312425 .. 0.283803 | 7.127419 .. 8.221013 | -42.350628 .. -41.369048 |
| 8000000..16000000 | 491353 | 0.397554194 | -71.811003 | -71.594586 | -0.216417 | -0.447372 .. 0.464446 | 9.642660 .. 10.141439 | -58.399577 .. -57.666419 |

## Radical-compression rank

Aggregate exponent fit: prime `0.506780`;
corrected `1.596889`.

| block | prime predecessors | mean prime rank | prime aggregate | local-product aggregate | corrected aggregate | random even range | composite-successor range | Cramer range |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1000000..2000000 | 70435 | 0.475522352 | -6.496268 | -6.505969 | 0.009701 | -0.524756 .. 0.070408 | 0.742191 .. 1.331837 | -5.243176 .. -4.645525 |
| 2000000..4000000 | 134213 | 0.475390404 | -9.015748 | -8.982471 | -0.033277 | -0.501487 .. 0.110378 | 1.180996 .. 1.986721 | -6.887074 .. -6.672743 |
| 4000000..8000000 | 256631 | 0.475576145 | -12.372822 | -12.421930 | 0.049108 | -0.251879 .. 0.161894 | 1.654883 .. 2.036517 | -9.999427 .. -9.451788 |
| 8000000..16000000 | 491353 | 0.475099001 | -17.454748 | -17.187241 | -0.267506 | -0.056843 .. 0.389956 | 2.204442 .. 2.891076 | -13.750084 .. -13.267530 |

## Artifacts

- JSON: `logs/playground-artifacts/predecessor-rank-transform-audit-16000000-q97.json`
- SVG: `logs/playground-artifacts/predecessor-rank-transform-audit-16000000-q97.svg`
