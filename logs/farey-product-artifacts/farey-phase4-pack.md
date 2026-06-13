# Farey Reciprocal-Product Phase-4 Pack

Source artifact: `logs/farey-product-artifacts/numerics.json`

## Object

`B_b(n)=sum(ν_b(k)-ν_b(h))` over positive Farey fractions `h/k` of order `n`. It uses fractions, gcd, divisibility, and products, with no primality test, no `mu`, no `Lambda`, and no prime-indexed sum.

## Bridge Status

This is an exact one-directional known-math bridge, not an RH equivalence. When `b=p` is prime, `B_p(n)` is the `p`-adic valuation of the reciprocal Farey product.

## Factor Check

No Dirichlet-series multiplier is introduced. `B_b(n)` is not multiplicative in `n`, and this package does not use the global Franel-Landau/Mikolas Farey-product remainder. The insertion baseline `fareynew(n)=phi(n)` has Dirichlet series `zeta(s-1)/zeta(s)` and is only a baseline.

## Dictionary

For every odd prime `p`,

```text
B_p(p) = p - 1
B_p(n) < 0 for ceil(8p/3) <= n <= 3p - 1
B_p(3p - 1) = -(p - 1)/2
```

## Derivation

Up to row `3p-1`, only multiples `p` and `2p` can contribute to `ν_p`. The denominator contribution is `phi(p)+phi(2p)=2(p-1)`. At row `n>=2p`, numerator `p` contributes `n-p-1` reduced fractions, and numerator `2p` contributes the count of integers `1<=r<=n-2p` coprime to `2p`.

At the endpoint this gives `2p-2` contributions from numerator `p` and `(p-1)/2` from numerator `2p`, hence

```text
B_p(3p-1)=2(p-1)-(2p-2)-(p-1)/2=-(p-1)/2.
```

For `n=ceil(8p/3)`, write `m=n-2p=ceil(2p/3)`. Since `m<p`, the numerator-`2p` contribution is just the odd count `ceil(m/2)`. Then

```text
B_p(n)=p-1-m-ceil(m/2)<0,
```

checked by the three residue classes of `p mod 3`; increasing `n` through `3p-1` cannot restore positivity.

## Lean-Stub-Ready Statements

Standalone parseable Lean 4 stub: `logs/farey-product-artifacts/farey_phase4_stub.lean`.

```lean
theorem prime_farey_surplus_spike_canyon
    (p : Nat) (hp : OddPrime p) :
    fareyRecipBaseSurplus p p = Int.ofNat (p - 1) ∧
    (∀ n : Nat, ceilEightThirds p ≤ n -> n ≤ 3 * p - 1 ->
      fareyRecipBaseSurplus p n < 0) ∧
    fareyRecipBaseSurplus p (3 * p - 1) = -Int.ofNat ((p - 1) / 2) := by
  sorry
```

## Numerical Evidence

- [1,000,2,000]: real 135/135 exact signatures; Li count 137.199589; endpoint debt 100,394 vs integrated main 102293.752931; five-seed Cramer exact-shape average 0.383055
- [10,000,20,000]: real 1,033/1,033 exact signatures; Li count 1042.476827; endpoint debt 7,716,881 vs integrated main 7787063.079816; five-seed Cramer exact-shape average 0.311904

## Status

GOAL-CLOSE / KNOWN-MATH / ONE-DIRECTIONAL. This satisfies the written v2 criteria through the explicitly allowed one-directional bridge route. The stronger CA-XA RH-equivalent branch remains open as a separate research lead, but it is not required for this Farey completion certificate.

## WHAT THIS TEACHES ABOUT PRIMES

A prime does not only make a full new row of Farey fractions; it first makes an exact denominator surplus at its own row.
Before the Farey order reaches three times that prime, the same prime is forced to switch sides and appear more strongly in numerators.
Random numbers with the right prime-like density do not carry this two-step Farey signature unless the number is actually prime.
