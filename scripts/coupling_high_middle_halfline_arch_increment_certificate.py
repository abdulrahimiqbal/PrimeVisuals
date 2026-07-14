#!/usr/bin/env python3
"""Exact archimedean increment ledger for the high mandatory halfline.

For e>=1/10 set ``v=y-e`` and assume the mandatory halfline cut is finite,
so ``v>x+1/2``.  Relative to e=1/10 its continuous part changes by

    nu_x^arch([v-1/2,y-3/5))
       -nu_y^arch((v,y-1/10]).                           (1)

This file proves the stronger pointwise transport

    z -> z-1/5,
    (97/200) f_x(z-1/5) >= f_y(z)                       (2)

for every target in the lost y interval.  The image of (2) lies in the
complete x tail ``[v-1/2,infinity)`` and has displacement 1/5<1/2.

Reduction to one variable is exact.  Since z>v>x+1/2, one has
``x<z-1/2<z-1/5``.  For a target to the right of x, f_x increases with x,
so its minimum is x=-3/5.  Since z<y and y-z>=1/10, f_y(z) decreases with
y; its maximum is attained at

    y_*(z)=max(7/5,z+1/10).

Thus (2) is equivalent to the two scalar inequalities

    K(z-1/5)J(z+2/5)/C(3/5)
       >= (200/97)K(z)J(7/5-z)/C(7/5),
                                      -1/10<z<=13/10,   (3)

    K(z-1/5)J(z+2/5)/C(3/5)
       >= (200/97)K(z)J(1/10)/C(z+1/10), z>=13/10.     (4)

The rational Arb cells below prove (3).  Formula (4) is a half-line theta
quotient: with A=pi exp(2z),

    K(z-1/5)/K(z)
      >= (1/2)exp(-9/10+A(1-exp(-2/5)))
                    (1-16exp(-3A)).                    (5)

Its logarithm has positive derivative.  Also

    J(z+2/5)C(z+1/10)
       >= exp(-3/20)/2,

so one exact evaluation of (5) at z=13/10 proves (4) for all larger z.
Monotonic decrease of K used in the cell bounds follows from continuation
item 182: U=-(log K)' has U(0)=0 and U'(t)>18.

Ledger separation.  Equation (2) consumes only a ``97/200`` colored part of
the x arch density.  Arithmetically it is disjoint from candidate colors
``51/100`` and ``1/250``, with used sum ``999/1000<1``.  However the proposed
``51/100`` beta transport has a continuum Hall obstruction certified in
``coupling_half_arch_beta_full_falsifier.py``.  Thus this file proves the
``97/200`` continuous subtransport only; it does not validate that candidate
global decomposition.

For reference, the older half-ledger decomposition led to the residual

    nu_x^prime([v-1/2,infinity))
      +nu_x^arch([v-1/2,infinity))
      -(1/2)nu_x^arch(S_y)
      -nu_y^arch((v,y-1/10])
      -sum_(1/10<log n<=e) Lambda(n)n^(-1/2)K(y-log n)/C(y)
        >=0.                                                (6)

The current proof does not use (6): prime terms are handled by the
simultaneous beta composition rather than any componentwise residual.
The historical warning remains useful: replacing the exact surplus by only
one half of the x arch tail is false.  At
``(x,y,v)=(-3/5,5/2,5/2-log 13)`` its two available terms are approximately
``0.2116970794+0.1463905948``, below the captured-prime demand
``0.3667581472`` by ``0.008670473``.  No such stronger ledger is claimed.

For y<=4 the finite-cut condition gives e<y-x-1/2<=41/10, so the obsolete
residual (6) contains only prime powers n<exp(41/10)<61.  No certification of
that componentwise residual is claimed or needed here.
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base


ctx.prec = 200


q = base.q
PI = arb.pi()
Z_LEFT = -q(1, 10)
Z_RIGHT = q(13, 10)
CELLS = 2800
C06 = (q(3, 5) / 2).cosh()
C14 = (q(7, 5) / 2).cosh()
ARCH_FRACTION = q(97, 200)
REQUIRED_FULL_RATIO = q(200, 97)


def kernel_quotient_lower(t: arb, displacement: arb) -> arb:
    scale = PI * (2 * t).exp()
    shifted = scale * (-2 * displacement).exp()
    assert shifted > 3
    ratio = 16 * (-3 * scale).exp()
    assert ratio < 1
    return (
        q(1, 2) * (-q(9, 2) * displacement).exp()
        * (scale * (1 - (-2 * displacement).exp())).exp()
        * (1 - ratio)
    ).lower()


def main() -> None:
    width = (Z_RIGHT - Z_LEFT) / CELLS
    assert width.contains(q(1, 2000))
    worst = None

    for index in range(CELLS):
        left = Z_LEFT + index * width
        right = left + width
        z = base.interval(left, right)

        supply_k, _ = base.kernel_bounds(z - q(1, 5))
        _, demand_k = base.kernel_bounds(z)
        supply_j = base.levy_shape(right + q(2, 5)).lower()
        # On this band J(7/5-z) increases with z.
        demand_j = base.levy_shape(q(7, 5) - right).upper()
        ratio = (
            (supply_k * supply_j / C06)
            / (demand_k * demand_j / C14)
        )
        assert ratio > REQUIRED_FULL_RATIO, (index, left, right, ratio)
        if worst is None or ratio < worst[0]:
            worst = (ratio, left, right)

    assert worst is not None

    displacement = q(1, 5)
    tail_kernel_ratio = kernel_quotient_lower(Z_RIGHT, displacement)
    tail_elementary_ratio = (
        (-q(3, 20)).exp()
        / (2 * base.levy_shape(q(1, 10)) * C06)
    )
    tail_ratio = tail_kernel_ratio * tail_elementary_ratio
    assert tail_ratio > REQUIRED_FULL_RATIO

    scale = PI * (2 * Z_RIGHT).exp()
    tail_log_slope_lower = 2 * scale * (
        1 - (-2 * displacement).exp()
    )
    assert tail_log_slope_lower > 0

    # Exact finite atom cutoff for the residual compact y<=4 ledger.
    assert (q(41, 10)).exp() < 61

    print("precision_bits:", ctx.prec)
    print("source_band: |x|<=3/5, y>=7/5")
    print("increment_range: e>=1/10, v=y-e>x+1/2")
    print("translation_displacement:", q(1, 5))
    print("selected_arch_fraction:", ARCH_FRACTION)
    print("required_full_density_ratio:", REQUIRED_FULL_RATIO)
    print("compact_rational_cells:", CELLS)
    print("worst_compact_ratio_cell:", worst)
    print("tail_kernel_ratio_lower_at_13/10:", tail_kernel_ratio)
    print("tail_full_ratio_lower_at_13/10:", tail_ratio)
    print("tail_log_slope_lower:", tail_log_slope_lower)
    print("arch_increment_97_over_200_ledger: PASS")
    print("componentwise_residual_ledger_(6): NOT_USED")
    print("half_arch_only_prime_ledger: FALSIFIED_AT_q13_STRESS")


if __name__ == "__main__":
    main()
