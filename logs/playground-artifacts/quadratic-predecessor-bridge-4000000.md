# Quadratic predecessor character bridge audit

Candidate:
for consecutive primes `p<q`, score `chi(q)=(p/q)` and track `max |sum chi| / sqrt(pair_count)`.

Range: 4000000. Seeds: 12345, 271828, 314159, 161803, 424242.

## Endpoint trace

| N | pairs | real value | real normalized | real maxAbs/sqrt | Cramer maxAbs/sqrt range | random-prime predecessor range | composite predecessor range |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 250000 | 22043 | -207 | -1.394232 | 1.468321 | 0.617526..3.097513 | 1.259552..3.677622 | 1.010978..2.540925 |
| 500000 | 41537 | -177 | -0.868472 | 1.422920 | 0.537112..2.321311 | 0.917549..2.679047 | 0.736250..1.919159 |
| 1000000 | 78497 | -145 | -0.517537 | 1.035074 | 0.426284..2.898929 | 1.256374..2.816134 | 0.535482..1.963434 |
| 2000000 | 148932 | -146 | -0.378320 | 1.057222 | 0.590309..2.880938 | 1.381130..3.581092 | 0.976989..1.611902 |
| 4000000 | 283145 | -277 | -0.520565 | 1.133216 | 0.756767..2.091514 | 1.001667..3.860084 | 0.838210..1.390751 |

## Block normalized values

| block | pairs | real | Cramer range | random-prime predecessor range | composite predecessor range |
| --- | ---: | ---: | ---: | ---: | ---: |
| (1, 250000] | 22043 | -1.394232 | -2.940244..2.462867 | -3.071421..0.269423 | 0.215675..2.345469 |
| (250000, 500000] | 19494 | 0.214868 | -1.012712..1.445294 | -1.561371..0.286490 | -1.862185..1.489748 |
| (500000, 1000000] | 36960 | 0.166450 | -2.912682..1.880533 | -1.934982..0.998700 | -0.644994..2.486348 |
| (1000000, 2000000] | 70435 | -0.003768 | -0.854086..1.405667 | -2.679016..1.932961 | -1.375304..0.772431 |
| (2000000, 4000000] | 134213 | -0.357581 | -1.225156..1.007637 | -1.924384..1.367541 | -0.837994..1.487645 |

## Summary

Real maxAbs theta: `0.372494`.
Cramer maxAbs/sqrt endpoint range: `0.756767..2.091514`.
Random-prime predecessor endpoint range: `1.001667..3.860084`.
Composite predecessor endpoint range: `0.838210..1.390751`.

## Factor check

By quadratic reciprocity, `(p/q)` can be rewritten using `q mod p` and the sign of `p,q mod 4`; since `q=p+gap`, this is a moving gap-residue character. If the audit separates only against weak Cramer/Jacobi labels but not against prime-modulus random predecessor controls, the construction is gap-residue character energy rather than a critical line.

## Files

- JSON: `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.json`
- SVG: `logs/playground-artifacts/quadratic-predecessor-bridge-4000000.svg`
