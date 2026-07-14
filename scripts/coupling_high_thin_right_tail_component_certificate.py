#!/usr/bin/env python3
"""Exact two-sided right-tail replacement and component erasure.

Let ``nu_s`` be the complete physical jump measure, put ``d=3/20``, and
assume the high-thin source bounds

    31/50<=x<y<=21/10,
    d<=y-x<=1/5,       x+y<=4.                         (1)

This file proves the two open/closed half-line inequalities

    nu_x((p,infinity)) >= nu_y([p+d,infinity)),        (2)
        p>=y+d,

    nu_y((q-d,infinity)) >= nu_x([q,infinity)),        (3)
        q>=y+3d.

They include every prime power and use exactly the displayed atom ownership.
Consequently, if ``p<q``, ``p>=y+d``, and ``q-p>2d``, adding (2) at p and
(3) at q gives

    nu_x((p,q)) >= nu_y([p+d,q-d]).                    (4)

For the high-thin target, every neighborhood at coordinate at least 17/20
is only the strict d-tube.  Thus every bounded A-component lying wholly to
the right of the mandatory component ``(y-d,y+d)`` can be erased without
increasing the exact Hall cover functional.  Endpoint atoms newly exposed at
``p+d`` or ``q-d`` are covered by (4), not discarded as null boundaries.

Arch ledgers.  For (2), map a y target w to w-d in the first half of the x
arch density.  Here ``w>=y+2d``.  With ``a=w-y>=2d`` and
``0<=y-x-d<=1/20``, the item-191 theta quotient gives

    f_x(w-d)/f_y(w)
      >= {K(w-d)/K(w)} exp(-1/40)(1-exp(-3/5)) > 161.  (5)

For (3), map an x target u to u-d in the first half of the y arch density.
Here ``u>=y+3d``; discarding the favorable Levy ratio gives

    f_y(u-d)/f_x(u)
      >= {K(u-d)/K(u)}/cosh(21/20) > 18189.            (6)

Both ratios are far above two, so the half-ledger normalization is explicit.

Prime ledgers.  An outward atom at target t=s+log(n) is assigned the second
half of the opposite arch density on

    [t-d,t-d+ell_n],        ell_n=1/(16n).              (7)

The intervals are mutually disjoint because
``log(1+1/n)>1/(n+1)>1/(16n)``.  They lie in the required *open* supply tail
even when the demand atom is at its closed endpoint: the one shared endpoint
has zero arch mass.  Since n>=2,

    d-ell_n >= d-1/32 = 19/160.                        (8)

K is decreasing, so the kernel quotient in every atom ledger is bounded by
the fixed displacement 19/160.  In (2), after ``J(h)>=exp(-h/2)``, complete
atom domination reduces to

    K(t-19/160)/K(t)
      >=32 n log(n) exp((1/5-d+1/32)/2).               (9)

Its worst base is ``n=2,t=159/200+log(2)``.  In (3), using
``C(x)/C(y)>=1/cosh(21/20)``, it reduces to

    K(t-19/160)/K(t)
      >=32 n log(n) cosh(21/20)
          exp(-(2d-1/32)/2),                           (10)

whose worst base is ``n=2,t=31/50+log(2)``.  The certified base ratios in
(9)--(10) exceed 2956 and 49 respectively.  The theta-quotient logarithmic
slopes exceed the comparison slope ``1+1/log(2)`` already at both bases and
increase thereafter.  Hence all integers n>=2, and therefore all prime
powers, are covered without a finite cutoff or a prime-gap theorem.

Only outward atoms can occur in the displayed positive tails.  The two arch
halves and all intervals (7) are disjoint in multiplicity.  This proves
(2)--(4) as exact measure inequalities on unbounded half-lines.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_thin_right_tail_component_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base
from coupling_high_middle_right_tail_certificate import (
    kernel_quotient_lower,
)


ctx.prec = 200

q = base.q
THIN_RADIUS = q(3, 20)
X_MIN = q(31, 50)
Y_MIN = q(159, 200)
Y_MAX = q(21, 10)
SEPARATION_MAX = q(1, 5)
LENGTH_AT_TWO = q(1, 32)
ATOM_DISPLACEMENT = q(19, 160)
HALF = q(1, 2)


def main() -> None:
    log_two = arb(2).log()
    y_normalizer_max = (Y_MAX / 2).cosh().upper()

    assert (THIN_RADIUS - LENGTH_AT_TWO - ATOM_DISPLACEMENT).contains(0)
    assert log_two > SEPARATION_MAX + THIN_RADIUS

    # First arch half: y right tail -> x tail, displacement d.
    first_arch_base = Y_MIN + 2 * THIN_RADIUS
    first_arch_quotient = kernel_quotient_lower(
        first_arch_base, THIN_RADIUS
    )
    first_arch_levy_factor = (
        (-q(1, 40)).exp()
        * (1 - (-q(3, 5)).exp())
    )
    first_arch_ratio = (
        first_arch_quotient * first_arch_levy_factor
    ).lower()
    assert first_arch_ratio > 2

    # First arch half in the reverse tail inequality.
    second_arch_base = Y_MIN + 3 * THIN_RADIUS
    second_arch_quotient = kernel_quotient_lower(
        second_arch_base, THIN_RADIUS
    )
    second_arch_ratio = (
        second_arch_quotient / y_normalizer_max
    ).lower()
    assert second_arch_ratio > 2

    # The disjoint atom intervals.  The elementary gap proof is analytic;
    # these base checks audit its strict direction at n=2.
    n_two = arb(2)
    assert (1 + 1 / n_two).log() > 1 / (n_two + 1)
    assert 1 / (n_two + 1) > 1 / (16 * n_two)
    assert LENGTH_AT_TWO < THIN_RADIUS

    comparison_log_slope = 1 + 1 / log_two

    # (2), y atom paid by x arch.
    first_atom_base = Y_MIN + log_two
    first_atom_quotient = kernel_quotient_lower(
        first_atom_base, ATOM_DISPLACEMENT
    )
    first_atom_required = (
        64 * log_two
        * ((SEPARATION_MAX - THIN_RADIUS + LENGTH_AT_TWO) / 2).exp()
    )
    first_atom_ratio = (
        first_atom_quotient / first_atom_required
    ).lower()
    assert first_atom_ratio > 1
    first_atom_scale = arb.pi() * (2 * first_atom_base).exp()
    first_atom_log_slope = (
        2 * first_atom_scale
        * (1 - (-2 * ATOM_DISPLACEMENT).exp())
    )
    assert first_atom_log_slope > comparison_log_slope

    # (3), x atom paid by y arch.
    second_atom_base = X_MIN + log_two
    second_atom_quotient = kernel_quotient_lower(
        second_atom_base, ATOM_DISPLACEMENT
    )
    second_atom_required = (
        64 * log_two * y_normalizer_max
        * (-(2 * THIN_RADIUS - LENGTH_AT_TWO) / 2).exp()
    )
    second_atom_ratio = (
        second_atom_quotient / second_atom_required
    ).lower()
    assert second_atom_ratio > 1
    second_atom_scale = arb.pi() * (2 * second_atom_base).exp()
    second_atom_log_slope = (
        2 * second_atom_scale
        * (1 - (-2 * ATOM_DISPLACEMENT).exp())
    )
    assert second_atom_log_slope > comparison_log_slope

    print("precision_bits:", ctx.prec)
    print(
        "source_band:",
        "31/50<=x<y<=21/10, 3/20<=y-x<=1/5, x+y<=4",
    )
    print("tail_displacement_d:", THIN_RADIUS)
    print("atom_interval_length: 1/(16n)")
    print("minimum_atom_kernel_displacement:", ATOM_DISPLACEMENT)
    print("y_to_x_arch_base_ratio:", first_arch_ratio)
    print("x_to_y_arch_base_ratio:", second_arch_ratio)
    print("y_atom_to_x_arch_base_ratio:", first_atom_ratio)
    print("x_atom_to_y_arch_base_ratio:", second_atom_ratio)
    print("atom_comparison_log_slope:", comparison_log_slope)
    print("first_atom_quotient_log_slope:", first_atom_log_slope)
    print("second_atom_quotient_log_slope:", second_atom_log_slope)
    print("all_prime_powers_and_exact_tail_endpoints: PASS")
    print("two_right_halfline_replacements: PASS")
    print("bounded_postmandatory_right_A_components_erasable: PASS")
    print("premandatory_compact_components: NOT_CLAIMED")


if __name__ == "__main__":
    main()
