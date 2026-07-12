# Preregistration: exact Maynard--Tao variational campaign

Date frozen: 2026-07-10

## Question

Can a reproducible, exact-arithmetic search in the Maynard--Tao variational problem produce a better certified lower bound for `M_k`, and can that bound improve an unconditional theorem on bounded gaps between primes?

This is a theorem-adjacent campaign, not an anomaly hunt. No numerical eigenvalue is a discovery. A result is promotable only when a rational polynomial witness and its quotient have been verified with exact arithmetic and the downstream prime-gap implication has been independently checked.

## Object

For the simplex

`R_k = {t_i >= 0 : sum_i t_i <= 1}`,

define

`I_k(F) = integral_Rk F(t)^2 dt`

and

`J_k^(m)(F) = integral (integral F dt_m)^2 dt_1 ... dt_(m-1) dt_(m+1) ... dt_k`.

The target is

`M_k = sup_F [sum_m J_k^(m)(F)] / I_k(F)`.

The initial search space is the complete monomial basis of total degree at most `d`. Every Gram entry is a closed-form simplex integral. Numerical generalized eigenvectors are proposal generators only; `BigInt` rational integration is the certificate layer.

## Calibration gates

Before any novel search:

1. The constant polynomial must give exactly `2k/(k+1)` numerically.
2. Maynard's published five-variable polynomial must reproduce the exact quotient `1417255/708216 > 2`.
3. An independent generalized-eigenvalue search in the complete cubic space for `k = 5` must return a value above `2` with residual below `1e-5`.
4. All focused and full repository tests must pass.

Failure of any calibration gate stops the discovery search.

## Discovery ladder

1. Reproduce `M_5 > 2` exactly.
2. Reproduce a published `M_k > 4` computation using a symmetry-reduced basis.
3. Rationalize the best numerical vector and verify its quotient exactly.
4. Search neighboring basis families, degrees, and `k`, with frozen train/holdout basis families.
5. Promote only a strict certified improvement that yields a checked improvement in a prime-gap consequence.

## Controls against self-deception

- Report the full basis and every coefficient of any witness.
- Recompute certificates from a clean process using rational arithmetic only.
- Treat ill-conditioned numerical matrices as failed cells, not large scores.
- Compare against the best reliable published benchmark located in the novelty audit.
- Separate an improved variational lower bound from an improved admissible-tuple diameter; both are required for a gap record.
- Require independent mathematical review before using the word “breakthrough.”

## Primary references

- James Maynard, *Small gaps between primes*, Annals of Mathematics 181 (2015), arXiv:1311.4600.
- D. H. J. Polymath, *Variants of the Selberg sieve, and bounded intervals containing many primes*, Research in the Mathematical Sciences 1 (2014), arXiv:1407.4897.
