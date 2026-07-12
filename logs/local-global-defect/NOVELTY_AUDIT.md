# SCID primary-source novelty and disguise audit

Date: 2026-07-10

Verdict: `NEW SUMMARY / KNOWN-CONJECTURAL CONTENT / DO NOT PROMOTE`.

## Algebraic reduction

For a three-bit prime indicator vector, SCID is completely determined by the
seven nonempty subset moments

```text
m_S = P(all coordinates in S are prime-like | full local eligibility).
```

Inclusion–exclusion recovers every exact mask probability from these moments.
Consequently, SCID contains no arithmetic information beyond the single,
pair, and triple prime-tuple counts for the fixed shifts. Its name and
information-theoretic packaging appear new to this audit, but the underlying
arithmetic object is the fixed-shift Hardy–Littlewood tuple family.

## Primary sources checked

1. Green and Tao, *Linear equations in primes*, formulate the generalized
   Hardy–Littlewood problem as counting prime points on affine lattices,
   explicitly including `(n,n+2)` as the twin-prime example:
   https://annals.math.princeton.edu/wp-content/uploads/annals-v171-n3-p08-p.pdf
2. Pintz, *On the singular series in the prime k-tuple conjecture*, records
   the Euler product
   `prod_p (1-nu_p/p)(1-1/p)^(-k)` and Gallagher's average singular-series
   theorem: https://arxiv.org/abs/1004.1084
3. Lemke Oliver and Soundararajan, *Unexpected biases in the distribution of
   consecutive primes*, derive computationally discovered biases by
   inclusion–exclusion over Hardy–Littlewood singular series. This is a direct
   warning that a new statistical wrapper can still be singular-series
   content: https://arxiv.org/abs/1603.03720
4. Sawin and Shusterman, *On the Chowla and twin primes conjectures over
   F_q[T]*, prove a quantitative twin-prime theorem for irreducible
   polynomials under their field condition:
   https://annals.math.princeton.edu/2022/196-2/p01
5. Bank, Bary-Soroker, and Rosenzweig, *Prime polynomials in short intervals
   and in arithmetic progressions*, give quantitative equidistribution for
   prime polynomials and other factorization types:
   https://arxiv.org/abs/1302.0625
6. A 2026 arXiv preprint explicitly studies "dependencies of prime numbers in
   a tuple" through Hardy–Littlewood constants. It is not needed for the
   reduction above, but it makes the semantic novelty claim unsafe:
   https://arxiv.org/abs/2601.08889

No searched source used the exact term "sieve-conditioned interaction defect"
or the same entropy normalization. That naming-level novelty is insufficient:
the invariant is an invertible nonlinear summary of already named tuple
moments.

## Numerical factor check

`scripts/scid-factor-check.mjs` reconstructs the eight mask probabilities from
truncated tuple Euler products and scores the same SCID. At the strongest
supporting scales:

- integer shallow-cutoff debiased/predicted ratios are mostly near one;
- the integer signal becomes indistinguishable from controls by cutoffs
  `17..29`;
- `F_2[t]` degree-20 ratios at degree-3 local depth are `1.820`, `0.176`, and
  `1.342` for shapes A/B/C, with only A/C above their listed controls;
- those A/C values are still of the same order as the prime-polynomial tuple
  Euler prediction and do not replicate in shape B;
- support fails for the deeper `F_3[t]` and `F_5[t]` composite controls at the
  pilot degrees.

The truncated product is an asymptotic diagnostic rather than a proof. It is
already sufficient to reject a discovery claim because the object factorizes
through fixed tuple moments and the data show the predicted local-factor
decay.

## Consequence for the search

Do not continue with fixed-dimensional entropy, covariance, cumulant, or
spectral summaries of a fixed shift tuple. All such summaries are functions of
finitely many prime-tuple moments and inherit the same disguise problem.

The next object must use either:

- a growing exclusion set;
- genuine consecutive-event dynamics;
- a scale-dependent operator whose dimension grows;
- or a theorem-shaped quantity not recoverable from finitely many fixed-shift
  moments.

