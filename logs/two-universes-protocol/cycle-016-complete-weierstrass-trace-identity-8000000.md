# Complete Weierstrass trace identity transport audit

Candidate:
transport an exact complete-family character-sum identity across rational prime fields and residue fields F_q[t]/P.

For every odd finite field K, define

`T(K)=|K|^-1 sum_{a in K} -sum_{x in K} chi(x^3+a*x+1)`.

Then `T(K)=-1` exactly. The scored residual is `R(K)=T(K)+1`, so a real breakthrough candidate would need nonzero structure after this exact theorem baseline.

## Proof

Swap the sums over `a` and `x`. For `x=0`, `chi(1)=1` for all `a`, contributing `|K|` to the inner character sum. For each `x != 0`, the map `a -> x^3+a*x+1` is a bijection of `K`, so the quadratic character sums to `0`. Therefore `sum_a sum_x chi(x^3+a*x+1)=|K|`, and the trace sum is `-|K|`.

## Summary

- Complete integer ladder 1M/2M/4M/8M: true
- Required q=3,5,7 field ladders: true
- Brute validation passed: true
- All exact residuals zero: true
- Absorbed by exact identity: true
- Max residual z after exact baseline: 0.000000
- Max wrong-zero-baseline z: 734.693814

## Integer Rows

| label | labels | raw T(K) | exact main | residual z | wrong zero-baseline z |
| --- | ---: | ---: | ---: | ---: | ---: |
| Z<=1000000 | 78496 | -1.000000 | -1.000000 | 0.000000 | -280.171376 |
| Z<=2000000 | 148931 | -1.000000 | -1.000000 | 0.000000 | -385.915794 |
| Z<=4000000 | 283144 | -1.000000 | -1.000000 | 0.000000 | -532.112770 |
| Z<=8000000 | 539775 | -1.000000 | -1.000000 | 0.000000 | -734.693814 |

## F_3[t] Rows

| label | labels | raw T(K) | exact main | residual z | wrong zero-baseline z |
| --- | ---: | ---: | ---: | ---: | ---: |
| F_3:deg1 | 3 | -1.000000 | -1.000000 | 0.000000 | -1.732051 |
| F_3:deg2 | 3 | -1.000000 | -1.000000 | 0.000000 | -1.732051 |
| F_3:deg3 | 8 | -1.000000 | -1.000000 | 0.000000 | -2.828427 |
| F_3:deg4 | 18 | -1.000000 | -1.000000 | 0.000000 | -4.242641 |
| F_3:deg5 | 48 | -1.000000 | -1.000000 | 0.000000 | -6.928203 |
| F_3:deg6 | 116 | -1.000000 | -1.000000 | 0.000000 | -10.770330 |
| F_3:deg7 | 312 | -1.000000 | -1.000000 | 0.000000 | -17.663522 |
| F_3:deg8 | 810 | -1.000000 | -1.000000 | 0.000000 | -28.460499 |
| F_3:deg9 | 2184 | -1.000000 | -1.000000 | 0.000000 | -46.733286 |
| F_3:deg10 | 5880 | -1.000000 | -1.000000 | 0.000000 | -76.681158 |
| F_3:deg11 | 16104 | -1.000000 | -1.000000 | 0.000000 | -126.901537 |
| F_3:deg12 | 44220 | -1.000000 | -1.000000 | 0.000000 | -210.285520 |

## F_5[t] Rows

| label | labels | raw T(K) | exact main | residual z | wrong zero-baseline z |
| --- | ---: | ---: | ---: | ---: | ---: |
| F_5:deg1 | 5 | -1.000000 | -1.000000 | 0.000000 | -2.236068 |
| F_5:deg2 | 10 | -1.000000 | -1.000000 | 0.000000 | -3.162278 |
| F_5:deg3 | 40 | -1.000000 | -1.000000 | 0.000000 | -6.324555 |
| F_5:deg4 | 150 | -1.000000 | -1.000000 | 0.000000 | -12.247449 |
| F_5:deg5 | 624 | -1.000000 | -1.000000 | 0.000000 | -24.979992 |
| F_5:deg6 | 2580 | -1.000000 | -1.000000 | 0.000000 | -50.793700 |
| F_5:deg7 | 11160 | -1.000000 | -1.000000 | 0.000000 | -105.640901 |
| F_5:deg8 | 48750 | -1.000000 | -1.000000 | 0.000000 | -220.794022 |

## F_7[t] Rows

| label | labels | raw T(K) | exact main | residual z | wrong zero-baseline z |
| --- | ---: | ---: | ---: | ---: | ---: |
| F_7:deg1 | 7 | -1.000000 | -1.000000 | 0.000000 | -2.645751 |
| F_7:deg2 | 21 | -1.000000 | -1.000000 | 0.000000 | -4.582576 |
| F_7:deg3 | 112 | -1.000000 | -1.000000 | 0.000000 | -10.583005 |
| F_7:deg4 | 588 | -1.000000 | -1.000000 | 0.000000 | -24.248711 |
| F_7:deg5 | 3360 | -1.000000 | -1.000000 | 0.000000 | -57.965507 |
| F_7:deg6 | 19544 | -1.000000 | -1.000000 | 0.000000 | -139.799857 |
| F_7:deg7 | 117648 | -1.000000 | -1.000000 | 0.000000 | -342.998542 |

## Brute Validation

| side | field | trace sum | expected | ok |
| --- | --- | ---: | ---: | --- |
| Z | F_5 | -5 | -5 | true |
| Z | F_7 | -7 | -7 | true |
| Z | F_11 | -11 | -11 | true |
| Z | F_13 | -13 | -13 | true |
| Z | F_17 | -17 | -17 | true |
| F_q[t] | F_3^2 | -9 | -9 | true |
| F_q[t] | F_3^3 | -27 | -27 | true |
| F_q[t] | F_5^2 | -25 | -25 | true |
| F_q[t] | F_7^1 | -7 | -7 | true |

## Novelty Audit

- This is a genuine non-Chebotarev domain/object: a complete Weierstrass character-sum family.
- It is not a breakthrough candidate because the exact elementary identity absorbs the full signal.
- Continuing cannot reuse complete-family sums that telescope by bijection; it must register an incomplete-family, monodromy, or other object with a nonzero residual and hostile controls before data.

JSON: `logs/two-universes-protocol/cycle-016-complete-weierstrass-trace-identity-8000000.json`
SVG: `logs/two-universes-protocol/cycle-016-complete-weierstrass-trace-identity-8000000.svg`
