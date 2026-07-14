#!/usr/bin/env python3
"""Exact continuous ledgers for every nontrivial left-extra Hall interval.

Let D=1/2, ``|x|<=3/5``, ``y>=7/5``, and let [p,q] be the erosion of an
extra A-component strictly left of the mandatory component.  If its
D-expansion contains x, its x arch mass is infinite and the Hall increment
is trivial.  Otherwise exactly one of the following holds:

    (L)  p<q<x-D,
    (MR) x+D<p<q<y-1.

This file supplies ``97/200``-ledger pointwise transports for the archimedean
demand in both cases.

The MR case is already the scalar theorem certified in
``coupling_high_middle_halfline_arch_increment_certificate.py``.  For every
z>x+D with y-z>=1 (a subset of its y-z>=1/10 domain),

    z -> z-1/5,       f_x(z-1/5) >= (200/97) f_y(z).    (1)

The image is contained in [p-D,q+D].

For the L case use instead

    z -> z+4/25.                                         (2)

Since z<x-D, the image lies to the left of x.  For a target left of its
source, f_s decreases with s, so the x supply is minimized at x=3/5.
The y demand is likewise maximized at the smallest y, namely 7/5.  Thus (2)
reduces exactly to

    K(z+4/25)J(11/25-z)/C(3/5)
      >=(200/97) K(z)J(7/5-z)/C(7/5), z<1/10.           (3)

The rational cells below prove (3) for -13/10<=z<=1/10.  For z<=-13/10,
put t=-z.  The kernel quotient K(t-4/25)/K(t) has the exact lower bound

    (1/2)exp(-18/25+A(1-exp(-8/25)))(1-16exp(-3A)),
    A=pi exp(2t),                                        (4)

whose logarithm is increasing.  Moreover

    J(t+11/25)/J(t+7/5)
      >= exp(12/25)(1-exp(-27/5)).                       (5)

One Arb evaluation at t=13/10 therefore proves the full negative tail.
The decrease of K on the positive half-line is the item-182 consequence of
U(0)=0 and U'(t)>18 for U=-(log K)'.

Only a ``97/200`` colored part of the x arch density is consumed in
(1)--(3).  It is arithmetically disjoint from candidate colors ``51/100``
and ``1/250``, but the proposed ``51/100`` beta transport is itself
falsified by an exact continuum Hall cut.  This file therefore proves only
the continuous subtransport, not that candidate global decomposition, a
separate atomic residual, or the full left-extra Hall theorem.  In fact, replacing
the exact unused arch surplus by a componentwise ledger is false: at the
discovery point ``x=3/5,y=2,E=[-2.29045944,0.05408985]``, the y-prime mass is
about ``0.394067923`` whereas x-prime plus half x-arch is only
``0.357186214``.  The complete interval inequality is still favorable there
by about ``0.075108912`` after retaining the exact arch difference.  Thus a
valid atom audit must certify the full residual
``nu_x(E^D)-nu_y(E)``, not the tempting half-only strengthening.

An earlier proposed componentwise residual retained the flank surplus.  If
I is the translated image ``E+4/25`` in case L or ``E-1/5`` in case MR and
T=E^D, it asked for

    nu_y^prime(E)
      <= nu_x^prime(T)+nu_x^arch(T)-(1/2)nu_x^arch(I).   (6)

That fallback is now dead: the exact switch box at
``x=3/5, y=2.04, a=.005, b=2.15`` gives
``nu_x^prime(T)+nu_x^arch(T)-(1/2)nu_x^arch(I)-nu_y^prime(E)
<-0.00771344``.  Formula (6) is not used.  The live prime mechanism is the
simultaneous beta composition, which couples across the colored prime and
arch ledgers instead of proving a componentwise inequality.
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base


ctx.prec = 200


q = base.q
PI = arb.pi()
Z_LEFT = -q(13, 10)
Z_RIGHT = q(1, 10)
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

        supply_k, _ = base.kernel_bounds(z + q(4, 25))
        _, demand_k = base.kernel_bounds(z)
        # Both distances decrease as z increases.  J is decreasing in its
        # positive argument, so the supply minimum is at z=left and the
        # demand maximum at z=right.
        supply_j = base.levy_shape(q(11, 25) - left).lower()
        demand_j = base.levy_shape(q(7, 5) - right).upper()
        ratio = (
            (supply_k * supply_j / C06)
            / (demand_k * demand_j / C14)
        )
        assert ratio > REQUIRED_FULL_RATIO, (index, left, right, ratio)
        if worst is None or ratio < worst[0]:
            worst = (ratio, left, right)

    assert worst is not None

    displacement = q(4, 25)
    tail_kernel_ratio = kernel_quotient_lower(-Z_LEFT, displacement)
    tail_elementary_ratio = (
        (q(12, 25)).exp() * (1 - (-q(27, 5)).exp())
        * C14 / C06
    )
    tail_ratio = tail_kernel_ratio * tail_elementary_ratio
    assert tail_ratio > REQUIRED_FULL_RATIO

    scale = PI * (-2 * Z_LEFT).exp()
    tail_log_slope_lower = 2 * scale * (
        1 - (-2 * displacement).exp()
    )
    assert tail_log_slope_lower > 0

    print("precision_bits:", ctx.prec)
    print("source_band: |x|<=3/5, y>=7/5")
    print("far_left_translation:", q(4, 25))
    print("middle_right_translation:", -q(1, 5))
    print("selected_arch_fraction:", ARCH_FRACTION)
    print("required_full_density_ratio:", REQUIRED_FULL_RATIO)
    print("compact_rational_cells:", CELLS)
    print("worst_far_left_compact_ratio_cell:", worst)
    print("far_left_tail_kernel_ratio_lower:", tail_kernel_ratio)
    print("far_left_tail_full_ratio_lower:", tail_ratio)
    print("far_left_tail_log_slope_lower:", tail_log_slope_lower)
    print("left_extra_arch_97_over_200_ledgers: PASS")
    print("componentwise_left_extra_prime_ledger: FALSIFIED_NOT_USED")


if __name__ == "__main__":
    main()
