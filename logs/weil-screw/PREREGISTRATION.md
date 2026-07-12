# Preregistration: Weil screw prime-knot operator flow

Date frozen: 2026-07-10

## Frontier source

Suzuki (June 2026) gives an explicit continuous screw function `g(t)` for the
Riemann zeta function. RH is equivalent to positive semidefiniteness of

`K_g(t,u)=g(t-u)-g(t)-g(-u)+g(0)`

on every finite point set. The function contains archimedean terms plus one
piecewise-linear knot `Lambda(n)/sqrt(n) * (|t|-log n)_+` for every prime
power.

## New decomposition under test

For `h_c(t)=(|t|-c)_+` and positive points,

`K_h = -2 B + K_r`,

where `B(t,u)=min(t,u)` is Brownian covariance and
`r_c(t)=(c-|t|)_+` is the triangular autocorrelation kernel. Thus every
prime-power update is an explicit competition between a negative Brownian
piece and a positive increment kernel.

The identity itself is elementary. The research question is whether the sum
of triangular prime-knot increments admits a scale-uniform operator domination
by the archimedean kernel plus the Brownian pieces. Such a proved domination
would establish Weil positivity and therefore RH.

## Frozen pilot

- support radii `a` cross every prime-power knot through `log(1000)`;
- point sets: uniform and Chebyshev positive grids, dimensions 12, 20, 28;
- normalize generalized eigenvalues by Brownian covariance;
- evaluate the explicit Lerch term independently at two series tolerances;
- record total minimum margin, archimedean-only margin, summed triangular
  positive load, summed Brownian relief, and each knot's leverage.

## Controls and promotion gate

- Finite nonnegative matrices are expected evidence, not a breakthrough.
- A grid-specific eigenvalue or a restatement of screw positivity is rejected.
- A candidate must be an explicit low-complexity operator inequality, remain
  valid across both grids and all dimensions, and have a proof obligation that
  does not assume a zero-free region equivalent to RH.
- The inequality must be audited against Yoshida, Bombieri, Connes--Consani,
  Connes--Consani--Moscovici, Suzuki, and classical conditionally negative
  definite/triangular-kernel theory.

Primary source: https://arxiv.org/abs/2606.09096
