# Novelty audit: Nyman--Beurling Schur innovation flow

Date: 2026-07-10

## Verdict

`RH-EQUIVALENT CALIBRATION / MÖBIUS-COEFFICIENT SHADOW / NO SURVIVOR`

The finite one-step Schur innovations are a new diagnostic in this repository,
but the observed arithmetic split is not a new route to RH. Prime indices are
a subset of the `mu(n)=-1` class, and the sign/magnitude of optimal
Nyman--Beurling coefficients is already expected to track Möbius and
Levinson--Selberg mollifier structure. The full-range prime residual reaches
`z=4.55`, but the frozen final-third gate reaches only `z=3.01`; negative
Möbius similarly falls from `z=4.04` to `z=2.55`.

The numerical calculation is stable: changing the Müntz-series direct cutoff
from 2048 to 4096 to 8192 changes finite distances by less than `9.5e-13` and
leaves log-gain correlations equal to 1 at printed precision. The negative is
therefore structural rather than numerical.

## What is already known

1. Báez--Duarte proves that the integer dilation sequence suffices in the
   Nyman--Beurling criterion, so `d_N -> 0` is equivalent to RH. The finite
   distance and its monotonicity are Hilbert-space projection facts.
   https://arxiv.org/abs/math/0202141
2. Bettin, Conrey, and Farmer identify the conditional asymptotic optimality of
   Möbius/Levinson--Selberg Dirichlet-polynomial coefficients.
   https://arxiv.org/abs/1211.5191
3. Ehm derives the Gram kernel used here and explicitly decomposes its quadratic
   form into Landau-, Mertens-, and inversion-error terms. The paper identifies
   estimates for those terms as the major unresolved obstacle.
   https://arxiv.org/abs/2405.06349
4. Alouges, Darses, and Hillion obtain generalized Nyman--Beurling criteria and
   block-Hankel Gram structures for tuned/randomized dilation families.
   https://arxiv.org/abs/2006.02953
5. Recent work studies multiscale Gram decay and block compressibility, so a
   finite sparse-looking Gram pattern is not by itself novel arithmetic.
   https://arxiv.org/abs/2510.18132

## Proof obligation exposed

An RH-relevant advance must give an unconditional coefficient family whose
full quadratic error tends to zero, or a new operator factorization that makes
that convergence automatic. A finite prime-versus-composite innovation split
does neither. Extending this pilot after its frozen holdout failure would only
optimize a known Möbius shadow.

No conjecture is promoted.
