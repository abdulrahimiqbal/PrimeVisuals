# Novelty and disguise audit

Audit date: 2026-07-12.

## Normal form

For fixed `ell` and `h`, write

`pi_h(X;ell,a) = #{p <= X-h : p and p+h prime, p = a (mod ell)}`.

Let `A_ell(h)` be the `ell-2` residues for which `a(a+h)` is nonzero
modulo `ell`. The audited statistic is exactly

`R_ell,h(X) = sum_{a in A_ell(h)} w_ell,h(a) pi_h(X;ell,a)`,

where

`w_ell,h(a) = chi_ell(a)chi_ell(a+h) + 1/(ell-2)`

and `sum_a w_ell,h(a)=0`. This follows from the elementary identity

`sum_{a mod ell} chi_ell(a)chi_ell(a+h) = -1`

when `ell` does not divide `h`. All registered shifts are in this case.

So the object is a zero-sum contrast of fixed-gap prime-pair counts in
admissible residue classes. Calling the weights “Frobenius” is correct, but it
does not create a new arithmetic object: for a quadratic extension the
Frobenius sign is the Legendre/Dirichlet character, and the pair of signs is a
periodic function of `p mod ell`.

## Reduction classification

### Not ordinary Chebotarev in a compositum

The condition `chi_ell(p)=+/-1` is a Chebotarev condition, and the entire
weight can be read from the cyclotomic Frobenius class `p mod ell`. But the
condition that the translated integer `p+h` is also prime is not a Frobenius
condition on `p` in any fixed finite Galois extension. Ordinary Chebotarev
density therefore does not prove or even formulate the full statistic.

This distinction is visible in the literature: Thorner proves bounded gaps
*within Chebotarev sets* using Maynard's method, not an asymptotic for a
prescribed fixed gap with both endpoints in specified classes. See
[Thorner, *Bounded Gaps Between Primes in Chebotarev Sets*](https://arxiv.org/abs/1401.6677).

### A Hardy--Littlewood-in-progressions shadow

The Hardy--Littlewood prediction for the two linear forms `n` and `n+h`,
refined to a fixed admissible class `a mod ell`, gives the same leading term
for each `a in A_ell(h)`. The zero-sum weights above therefore cancel those
main terms. Consequently `R_ell,h=o(N_h)` is an immediate linear consequence
of the Hardy--Littlewood prime-pair conjecture in arithmetic progressions.

It is weaker than the full conjecture: it gives no main term for `N_h`, and it
can hold vacuously if there are too few fixed-gap pairs. That logical weakness
does not make it a new mechanism. It is one Fourier/character contrast of the
standard residue-refined conjecture. The base conjectural framework is the
original [Hardy--Littlewood 1923 paper](http://archive.ymsc.tsinghua.edu.cn/pacm_paperurl/20170108203038474495327)
and, more generally, the simultaneous-prime-values heuristic in
[Bateman--Horn 1962](https://doi.org/10.1090/S0025-5718-1962-0148632-7).

### Fixed shifts remain the hard regime

Korevaar's review emphasizes that infinitude is still unknown for every
prescribed even prime-pair difference, and treats the Hardy--Littlewood
prime-pair conjecture as the controlling object:
[Korevaar, *Prime pairs and zeta's zeros*](https://arxiv.org/abs/0806.0934).

There are strong average-over-shift theorems, but their averaging window grows
with `X`. Matomaki--Radziwill--Tao obtain the expected `Lambda(n)Lambda(n+h)`
asymptotic for almost all `h` in long shift ranges (beginning at
`X^(8/33+epsilon)` in their result):
[MRT, *Correlations of the von Mangoldt and higher divisor functions I*](https://arxiv.org/abs/1707.01315).
That theorem does not turn this campaign's twelve frozen small shifts into a
new theorem target. Conversely, averaging our 12 cells for an RMS display
does not place them in the proven long-shift regime.

### Bias literature already warns against finite-range residue stories

Lemke Oliver--Soundararajan found and modeled substantial residue-pattern
biases for *consecutive* primes, deriving their conjectural explanation from
a uniform Hardy--Littlewood framework and singular-series lower-order terms:
[Unexpected biases in the distribution of consecutive primes](https://arxiv.org/abs/1603.03720).
Their ordered-consecutive-prime object is not identical to a prescribed fixed
gap, but it is the nearest warning: a finite-range residue contrast is not a
new Frobenius law until singular-series and lower-order explanations are
excluded. Here the exact leading local mean was removed, and no residual even
survived the controls.

## Exact-statement search

Searches included the normalized phrases and formula fragments:

- `quadratic character prime pairs`;
- `chi(n) chi(n+h) primes`;
- `Lambda(n) Lambda(n+h) Dirichlet character`;
- `prime pairs arithmetic progressions Hardy Littlewood character`;
- `Frobenius prime pairs number field`;
- `Chebotarev sets Hardy Littlewood prime tuples`.

No paper naming this exact six-cover/12-shift contrast was found. That is not
positive novelty evidence: the normal-form calculation above reduces it to a
routine linear projection of prime-pair counts in residue classes. The nearest
results already classify both ingredients and the controlling conjecture.

## Audit decision

Classification:

- **not** ordinary Chebotarev in a fixed compositum;
- **yes**, a strictly weaker zero-sum shadow of Hardy--Littlewood in arithmetic
  progressions;
- **not** an independently motivated conjecture after the numerical residual
  failed every promotion gate;
- **not** a field-level breakthrough candidate.

The only honest mathematical residue is the exact finite local identity
`mu_ell(h)=-1/(ell-2)`, which is elementary and already implicit in standard
quadratic-character correlation. It is useful calibration, not a new lemma.
