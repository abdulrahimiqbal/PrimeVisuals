# Preregistration: Nyman--Beurling Schur innovation flow

Date frozen: 2026-07-10

## Why this object

The Báez--Duarte strengthening of the Nyman--Beurling criterion says that RH
is equivalent to the optimal squared distance `d_N^2` tending to zero when
the dilation basis is restricted to `theta_n=1/n`. Unlike the bounded-gap
variational problem, this object is logically connected to RH.

The finite distance itself is known and monotone by Hilbert-space projection.
That fact is not a discovery. The exploratory object is the one-step Schur
innovation

`gain_N = d_(N-1)^2 - d_N^2`,

together with its normalized coefficient, Gram pivot, and arithmetic class of
`N`. A useful new invariant would be a scale-stable factorization or lower
bound for the cumulative innovations that forces `d_N^2 -> 0` without assuming
RH.

## Frozen implementation

- Gram entries use Ehm's 2024 formula for `q=1`:
  `G_uv=(K+log(v/u)/2)/v + S1(v/u)/u`, oriented with `v>=u`.
- `S1` is summed directly through 4096 terms and its rational-periodic tail is
  evaluated by Bernoulli polynomials through order six and Hurwitz-zeta
  Euler--Maclaurin tails.
- Mixed terms use `F_n=(gamma-1-log n)/n`.
- Initial scale ladder: every `N=1..60`.

## Controls

1. Recompute at direct cutoffs 2048, 4096, and 8192; numerical conclusions
   must be stable well above truncation error.
2. Compare innovation by prime, squarefree composite, and nonsquarefree class.
3. Compare with the same gains randomly permuted within dyadic index blocks.
4. Regress out `log N`, Gram pivot, and the magnitude of the newest optimal
   coefficient before attributing arithmetic structure.
5. Treat monotonicity of `d_N` as a built-in identity, never as evidence.

## Lead gate

A candidate must show a low-complexity arithmetic law in the residual Schur
innovation with absolute control z-score at least 4, persist in the final
third of indices, survive all three numerical cutoffs, and not reduce to
Möbius/Levinson--Selberg coefficients or a known Gram decomposition.

Even a passing finite lead is only a conjecture candidate. A path toward RH
requires a proved uniform bound whose sum forces the distance to zero.

## Primary audit anchors

- Báez--Duarte, *A strengthening of the Nyman--Beurling criterion for the
  Riemann hypothesis* (2003).
- Bettin, Conrey, Farmer, *An optimal choice of Dirichlet polynomials for the
  Nyman--Beurling criterion* (2013).
- Ehm, *On certain Gram matrices and their associated series* (2024).
- Alouges, Darses, Hillion, *Polynomial approximations in a generalized
  Nyman--Beurling criterion* (2022).
