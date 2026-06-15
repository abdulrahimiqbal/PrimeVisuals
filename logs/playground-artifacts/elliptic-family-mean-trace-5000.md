# Elliptic family mean-trace audit

Family: `E_a: y^2=x^3+a*x+1`, integer `1<=a<=A`; bad reductions are skipped per prime.

Candidate: `V_A(p)=sum_a a_p(E_a)/(sqrt(p)*sqrt(good_a_count))`; `Z_A(N)=sum V_A(p)/sqrt(good_prime_count)`.

## A=256 endpoint trace

| N | primes | sum V | Z | max |Z| |
| ---: | ---: | ---: | ---: | ---: |
| 313 | 63 | -114.877096 | -14.473154 | 14.820198 |
| 625 | 112 | -153.010617 | -14.458144 | 14.820198 |
| 1250 | 202 | -214.803462 | -15.113519 | 15.151199 |
| 2500 | 365 | -281.407346 | -14.729534 | 15.231524 |
| 5000 | 667 | -358.083478 | -13.865048 | 15.231524 |

A=256 controls, 15 seeds:

| control | count range | final Z range | final |Z| range | max |Z| range | theta range |
| --- | ---: | ---: | ---: | ---: | ---: |
| shuffle | 667..667 | -13.865048..-13.865048 | 13.865048..13.865048 | 13.865048..14.266289 | 0.864215..1.202578 |
| bootstrap | 667..667 | -15.373721..-11.335259 | 11.335259..15.373721 | 11.433563..15.387563 | 0.825236..1.317225 |
| normal | 667..667 | -0.949710..1.366729 | 0.011292..1.366729 | 1.303893..2.754981 | 0.146581..0.708945 |
| cramerIndex | 631..694 | -16.119260..-11.605470 | 11.605470..16.119260 | 11.638374..16.209495 | 0.972053..1.250873 |

A=256 empirical-centered diagnostic:

| N | primes | centered sum | centered Z | centered max |Z| |
| ---: | ---: | ---: | ---: | ---: |
| 313 | 63 | -81.055118 | -10.211985 | 12.371090 |
| 625 | 112 | -92.882657 | -8.776586 | 12.371090 |
| 1250 | 202 | -106.358391 | -7.483350 | 12.371090 |
| 2500 | 365 | -85.454618 | -4.472899 | 12.371090 |
| 5000 | 667 | 0.000000 | 0.000000 | 12.371090 |

Fresh holdout block:

| object | count/range | Z/range | |Z| range |
| --- | ---: | ---: | ---: |
| real | 302 | -4.412216 | 4.412216 |
| shuffle | 302..302 | -10.162412..-8.095958 | 8.095958..10.162412 |
| bootstrap | 302..302 | -11.160281..-7.698605 | 7.698605..11.160281 |
| normal | 302..302 | -1.585803..1.908425 | 0.028749..1.908425 |
| cramerIndex | 269..322 | -11.688548..-7.594660 | 7.594660..11.688548 |

## A=128 holdout family

| N | primes | sum V | Z | max |Z| |
| ---: | ---: | ---: | ---: | ---: |
| 313 | 63 | -79.953285 | -10.073167 | 10.486976 |
| 625 | 112 | -106.945193 | -10.105371 | 10.486976 |
| 1250 | 202 | -155.015034 | -10.906820 | 10.932176 |
| 2500 | 365 | -189.552964 | -9.921656 | 10.989824 |
| 5000 | 667 | -241.929876 | -9.367562 | 10.989824 |

Trace summaries:

- A=256 value mean: `-0.536857`, sd: `1.040261`, range: `-9.651538..2.315157`
- A=128 value mean: `-0.362713`, sd: `1.009227`, range: `-6.819235..3.233599`
- max |a_p|/(2sqrt(p)) seen in A=256 family: `0.999527`

Named composite checks:

| n | prime field? | reason |
| ---: | --- | --- |
| 25 | no | composite modulus is not a finite field, so the family trace over F_n is not defined |
| 35 | no | composite modulus is not a finite field, so the family trace over F_n is not defined |
| 77 | no | composite modulus is not a finite field, so the family trace over F_n is not defined |
| 289 | no | composite modulus is not a finite field, so the family trace over F_n is not defined |

Factor check:

This is not a Chebyshev, Mertens, or gap-telescope identity. It breaks if distributional controls reproduce the family-mean walk, because then the object is a finite-family Sato-Tate/character-sum average rather than prime regularity.

SVG: `logs/playground-artifacts/elliptic-family-mean-trace-5000.svg`
JSON: `logs/playground-artifacts/elliptic-family-mean-trace-5000.json`