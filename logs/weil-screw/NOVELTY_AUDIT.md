# Novelty and disguise audit: Brownian--triangular prime-knot decomposition

Date: 2026-07-10

## Finite result

For every prime-power knot in Suzuki's screw function, set
`h_c(t)=(|t|-c)_+`, `c=log n`. On positive points the associated increment
kernel satisfies the exact identity

`K_h = -2 B + K_r`,

where `B(t,u)=min(t,u)` and `r_c(t)=(c-|t|)_+`. The second term is the
increment covariance obtained from the positive triangular stationary kernel.

The implementation verifies this identity through `exp(a)=1000` with maximum
matrix reconstruction error below `2e-10`. Uniform and Chebyshev grids of
dimensions 12, 20, and 28 all give nonnegative sampled total screw kernels.

The simplest operator proof fails decisively. The lower bound obtained by
adding the separate minimum generalized eigenvalues becomes negative as soon
as prime knots enter and falls to about `-62` near `exp(a)=1000`, while the
sampled total minimum remains around `8e-4`. Positivity therefore depends on
cross-eigenspace alignment, not termwise domination.

## Disguise check

The decomposition is an elementary new coordinate for this project, not yet a
new theorem. Distributionally, the second derivative of
`(|t|-c)_+` is supported at `t=+/-c`; its Fourier transform introduces
`cos(c xi)/xi^2`. Summing with `c=log n` and weights `Lambda(n)/sqrt(n)`
recovers the prime-power cosine side of Weil's explicit formula. Thus a global
Fourier-symbol proof of the required alignment would simply restate the
original Weil positivity problem.

The potentially nontrivial residue is localization: on finite intervals the
archimedean and triangular operators are compressed and do not diagonalize
simultaneously. Suzuki, Yoshida, Bombieri, and Connes--Consani already study
these localized forms and their ground states. A publishable advance would
need a new uniform-in-`a` compressed-operator angle inequality, not the knot
identity or finite positivity plots.

## Primary sources checked

- Suzuki, *Weil's quadratic form via the screw function* (June 2026):
  https://arxiv.org/abs/2606.09096
- Bombieri, *Remarks on Weil's quadratic functional in the theory of prime
  numbers, I* (2000):
  https://www.bdim.eu/item?id=RLIN_2000_9_11_3_183_0
- Connes--Consani, *The scaling Hamiltonian* (2019):
  https://arxiv.org/abs/1910.14368
- Rodgers--Tao, *The De Bruijn--Newman constant is non-negative* (2018):
  https://arxiv.org/abs/1801.05914

## Verdict

`NEW DECOMPOSITION VIEW / EXACT FINITE CALIBRATION / GLOBAL FOURIER DISGUISE / LOCALIZED ANGLE PROBLEM OPEN`

No breakthrough or RH claim is promoted. The next admissible question is
whether the compressed archimedean negative subspace and the triangular-prime
positive subspace obey a uniform principal-angle bound that is stronger than
generic spectral inequalities and not already implicit in the localized Weil
operator literature.
