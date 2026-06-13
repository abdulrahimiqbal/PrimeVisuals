# Farey Completion Audit

## Criterion 1: Different World

Satisfied. The object is `B_b(n)=sum(ν_b(k)-ν_b(h))` over Farey fractions `h/k`, using gcd, divisibility, and products. The definition contains no primality test, no `mu`, no `Lambda`, and no prime-indexed sum.

## Criterion 2: Factor Check

Satisfied. The package does not introduce a Dirichlet-series multiplier. `B_b(n)` is not multiplicative in `n`, and the global Franel-Landau/Mikolas Farey-product remainder is explicitly excluded. The totient insertion row `fareynew(n)=phi(n)` is recorded only as a baseline with Dirichlet series `zeta(s-1)/zeta(s)`.

## Criterion 3: Dictionary Moves Prime Information

Satisfied. Every odd prime `p` forces the two-stage sign/order pattern
`B_p(p)=p-1`, then `B_p(n)<0` for `ceil(8p/3)<=n<=3p-1`, and finally
`B_p(3p-1)=-(p-1)/2`. This constrains the sign and ordering geometry of
Farey-product p-adic surplus, not the size of a residual.

Numerical checks:

- [1,000,2,000]: 135/135 real primes satisfy the signature; Li count 137.199589.
- [10,000,20,000]: 1,033/1,033 real primes satisfy the signature; Li count 1042.476827.
- Cramer seeds: 12345, 271828, 314159, 161803, 424242.

## Criterion 4: Derivation

Satisfied as an honest one-directional bridge. The derivation is a direct reduced-fraction count up to row `3p-1`, packaged in the Phase-4 expert pack and Lean-stub-ready theorem `prime_farey_surplus_spike_canyon`.

## Criterion 5: Exhibit And Phase-4 Pack

Satisfied. The reproducible artifacts are:

- `logs/farey-product-artifacts/numerics.json`
- `logs/farey-product-artifacts/farey-product-summary.svg`
- `logs/farey-product-artifacts/farey-product-exhibit.html`
- `logs/farey-product-artifacts/farey-phase4-pack.md`
- `logs/farey-product-artifacts/farey_phase4_stub.lean`
- `tests/farey-phase4.test.js`

The Phase-4 pack ends with the required three-sentence section titled `WHAT THIS TEACHES ABOUT PRIMES`.

## Verdict

COMPLETE for v2 under the criterion-4 one-directional route. The CA-XA RH-equivalent branch remains a stronger open research lead, but it is not used as the completion certificate.
