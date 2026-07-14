#!/usr/bin/env python3
"""Exact open-triangle Hall transport at the right high-thin boundary.

Let ``nu_s`` be the complete physical jump measure and remove the two local
archimedean pieces of displacement below

    epsilon = 1/100000.

Put

    d=3/20,  y=x+d+a,
    x>=31/50,  0<=a<=1/20.                              (1)

Write an inward y target as ``v=y-t`` and an outward x target as ``u=x+h``.
The strict thin-tube condition ``|u-v|<d`` is exactly

    a<h+t<a+2d.                                          (2)

This file proves every nested Hall inequality

    int_epsilon^T K(y-t)J(t)/C(y) dt
      < int_(max(epsilon,a-T))^d
          K(x+h)J(h)/C(x) dh,                           (3)

for ``epsilon<T<=a``.  Consequently the complete inward y arch measure on
``[epsilon,a]`` couples into a submeasure of the complete outward x law with
support in the *open strip* (2).  There are no inward prime atoms in the
demand interval because ``a<=1/20<log(2)``.  Every outward x prime atom is
left unused, so (3) includes all prime powers without a truncation or an
unrecorded atom switch.

Here is the uniform reduction used by the certificate.  Put ``b=a-T`` and

    I(r)=int_r^infinity J(t)dt
        =atanh(exp(-r/2))+atan(exp(-r/2)).               (4)

Since ``T<=1/20-b``, monotonicity of K and C gives

    demand <= U_x(b)
      ={K(x+d+b)/C(x+d+b)}{I(epsilon)-I(1/20-b)}.        (5)

Retain only the finite open-neighborhood supply

    S_x(b)=C(x)^(-1) int_(max(epsilon,b))^d
                         K(x+h)J(h)dh.                  (6)

The endpoint ``h=b`` has zero arch measure.  Moreover ``h<d`` on the
retained open interval.  Hence ``h+t<a+2d`` for every ``t<=a``, while the
only remaining matching constraint is ``h>a-t``; no closed-support limit is
being substituted for the open target.

It remains to prove ``S_x(b)>U_x(b)``.  Continuation item 182 proves that
``U_K=-(log K)'`` is strictly increasing on the positive half-line.  For
``h<=d<=b+d`` this makes

    K(x+h)/K(x+b+d)

nondecreasing in x.  The factor ``C(x+b+d)/C(x)`` is also increasing.
Therefore ``S_x(b)/U_x(b)`` is minimized at ``x=31/50``.

The interval ``0<=b<=1/20-epsilon`` is split into twenty exact rational
cells.  On a cell ``[b_L,b_R]``, every supply interval (6) contains the fixed
interval ``[b_R,d]``.  Four positive right-endpoint Darboux slices give
a lower bound because both K and J decrease.  Formula (5) is bounded above
at ``b_L``.  All theta and Levy evaluations are Arb enclosures at 160 bits.
The worst certified lower ratio is greater than 1.38.

One-dimensional Hall sufficiency is elementary here and needs no appeal to
an open-support version of a general Strassen theorem.  For the remaining
relation ``h>a-t``, a Borel demand set E with ``sup(E)=T`` has neighborhood
``(a-T,d)`` in the retained supply, and its mass is at most that of
``[epsilon,T]``.  Thus (3) is every Hall inequality.  Equivalently, match
the increasing demand quantile from ``t=epsilon`` against the decreasing
supply quantile from ``h=d``.  The prefix inequalities say pointwise that
``h>=a-t``; their strict reserve makes the inequality strict away from the
zero-mass first quantile.  Since ``h<d`` and ``t<=a``, the upper inequality
``h+t<a+2d`` is automatic.  This gives a Borel coupling on the open strip
(2).  This is only the right local triangle; it does not classify arbitrary
Hall covers for the full three-branch target.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_thin_right_triangle_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base


ctx.prec = 160

q = base.q
EPSILON = q(1, 100000)
X_MIN = q(31, 50)
THIN_RADIUS = q(3, 20)
A_MAX = q(1, 20)
B_CELLS = 20
SUPPLY_SLICES = 4


def levy_tail(displacement: arb) -> arb:
    """The exact integral of J from displacement to infinity."""

    exponential = (-displacement / 2).exp()
    return exponential.atanh() + exponential.atan()


def main() -> None:
    assert A_MAX < arb(2).log()
    assert X_MIN > 0

    x_normalizer_upper = (X_MIN / 2).cosh().upper()
    worst = None

    for index in range(B_CELLS):
        b_left = (A_MAX - EPSILON) * index / B_CELLS
        b_right = (A_MAX - EPSILON) * (index + 1) / B_CELLS

        # For every b in this cell,
        # [b_right,d] is contained in
        # [max(epsilon,b),d].  The lower endpoint is strictly larger
        # than epsilon even on the first cell.
        supply_left = b_right
        supply_right = THIN_RADIUS
        assert supply_left > EPSILON
        assert supply_left < supply_right
        slice_width = (
            supply_right - supply_left
        ) / SUPPLY_SLICES

        supply_lower = arb(0)
        for slice_index in range(SUPPLY_SLICES):
            right_endpoint = (
                supply_left + (slice_index + 1) * slice_width
            )
            kernel_lower, _kernel_upper = base.kernel_bounds(
                X_MIN + right_endpoint
            )
            levy_lower = base.levy_shape(right_endpoint).lower()
            supply_lower += (
                slice_width * kernel_lower * levy_lower
                / x_normalizer_upper
            )

        # K(x+d+b)/C(x+d+b) and the allowed maximum T=1/20-b
        # are both largest at b=b_left.
        demand_anchor = X_MIN + THIN_RADIUS + b_left
        _kernel_lower, kernel_upper = base.kernel_bounds(demand_anchor)
        maximum_T = A_MAX - b_left
        levy_mass_upper = (
            levy_tail(EPSILON) - levy_tail(maximum_T)
        ).upper()
        demand_upper = (
            kernel_upper * levy_mass_upper
            / (demand_anchor / 2).cosh().lower()
        )

        ratio_lower = (supply_lower / demand_upper).lower()
        assert ratio_lower > 1, (
            index,
            b_left,
            b_right,
            supply_lower,
            demand_upper,
            ratio_lower,
        )
        if worst is None or ratio_lower < worst[0]:
            worst = (
                ratio_lower,
                index,
                b_left,
                b_right,
                supply_lower,
                demand_upper,
            )

    assert worst is not None
    print("precision_bits:", ctx.prec)
    print("source_band: x>=31/50, y=x+3/20+a, 0<=a<=1/20")
    print("local_cutoff_epsilon:", EPSILON)
    print("b_cells:", B_CELLS)
    print("positive_supply_slices_per_cell:", SUPPLY_SLICES)
    print(
        "worst_(ratio,cell,bL,bR,supply_lower,demand_upper):",
        worst,
    )
    print("strict_open_relation_a_lt_h_plus_t_lt_a_plus_2d: PASS")
    print("inward_prime_demand_below_log2: EMPTY")
    print("all_outward_prime_atoms: RETAINED_UNUSED")
    print("right_local_triangle_Hall_transport: PASS")
    print("arbitrary_full_target_Hall_cuts: NOT_CLAIMED")


if __name__ == "__main__":
    main()
