# Pole-free Dirichlet-form audit at `c=3`

Date: 2026-07-12

Status: **WEIL-LANE POINTWISE ROUTE KILLED / NOT A SONIN-REMAINDER IDENTITY**.

Post-attack correction: `A_tilde=A_a-W_0,2` removes the rank-two zeta pole
term.  It is not the Sonin comparison remainder `A_a-T_Sonin`.  The form below
therefore informs only the fixed-width localized-Weil lane unless a separate
comparison theorem identifies an additional relation.

## Exact structural reduction

For localization half-width

`a=(log 3)/2`,

the cutoff contains the prime `2` (the endpoint `3` has zero overlap on the
open support core).  Removing the rank-two pole contribution from the
localized Weil operator gives the pole-free operator `A_tilde`.  The form
identity recorded in
[Andrade, *The pole term is the only obstruction to Perron structure*](https://zenodo.org/records/20682834)
has the shape

`<A_tilde v,v> = jump_energy_infinity(v) + jump_energy_2(v)`

`                  + integral kappa_a(x)|v(x)|^2 dx`.

The two jump energies are nonnegative.  The continuous kernel is

`J(t)=exp(-|t|/2)/(1-exp(-2|t|))>0`,

and the prime term is the squared difference across the shift `log 2` on the
overlap interval.  The potential is

`kappa_a(x)=-1/2 log(a^2-x^2)-(log(2*pi)+EulerGamma+1)`

`             -m_1(x)-(log 2)/sqrt(2) w_2(x)`,

where `m_1` is the integral of
`J(t)-1/(2|t|)` across the interval and `w_2` is the endpoint-overlap
indicator.

## Diagnostic values

High-precision evaluation gives

| point | `kappa_a(x)` |
| ---: | ---: |
| `0` | `-3.0809984551...` |
| `0.1` | `-3.0636216770...` |
| just below `log 2-a` | `-3.0443950910...` |
| just above `log 2-a` | `-3.5345241522...` |
| `0.4` | `-3.1850118897...` |

The discontinuous drop is exactly the prime potential
`(log 2)/sqrt(2)=0.490129...` entering when the shift overlap turns on.

The values are far from zero; therefore the sufficient condition
`kappa_a>=0` is decisively false.  No pointwise-potential argument can prove
the `c=3` form positive.

## Remaining analytic statement

The required result is now an explicit constrained nonlocal Poincare
inequality:

`jump_energy_infinity(v)+jump_energy_2(v)`

`  >= integral (-kappa_a(x)) |v(x)|^2 dx`

for the pole-neutral and zero-moment support class, with strict inequality for
nonzero `v`.

The gap is critically tuned: finite constrained Galerkin minima approach about
`9.45e-4`, while the separate energy and negative-potential pieces are of
order one.  Entrywise absolute values and generic compact-operator norms lose
the needed margin.  A proof must use the nonlocal Dirichlet structure,
Loewner/divided-difference parity, or a rigorous resolvent/Schur enclosure.

This is consistent with the current operator frontier:

- the pole-free operator has unconditional Perron structure;
- the full even problem reduces to a scalar Krein resolvent criterion;
- general fixed-width positivity and the required nonlocal nodal identity
  remain open.

No positivity or Sonin-domination theorem is claimed by this audit.
