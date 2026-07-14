#!/usr/bin/env python3
"""Uniform entrance above one half into a hard one-core pair set.

On the ordered annulus

    |m| <= 17/50,       1 < r <= 9/5,
    x=m-r/2 < y=m+r/2,

put

    S={(x,y): min(|x|,|y|)<=3/5}.

If a point is outside S, the midpoint constraint forces

    -31/25 <= x < -3/5,       3/5 < y <= 31/25.

This script constructs six disjoint selected clocks, all entering the same
hard set S:

* the inward q=2 and q=3 prime clocks of x;
* the inward q=2 and q=3 prime clocks of y;
* one finite x-arch single-jump submeasure into [-1/2,1/2];
* one finite y-arch single-jump submeasure into [-1/2,1/2].

The arch subdensity is chosen uniformly below both possible marginals.  The
total selected rate is rigorously greater than 1/2 on the entire complement,
not merely at sampled source points.  Unused infinite Levy activity is left
at the source phase and is not counted as a finite clock.

Reproduction:

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_one_core_annulus_certificate.py
"""

from flint import arb, ctx

from coupling_shoulder_box_certificate import C, J, K_positive, q


ctx.prec = 180

LOG2 = arb(2).log()
LOG3 = arb(3).log()
CORE = q(3, 5)
ARCH_TARGET = q(1, 2)
SOURCE_MAX = q(31, 25)


def inward_23_lower(cells: int) -> arb:
    """Uniform q=2,3 inward rate on [3/5,31/25]."""

    left = CORE
    right = SOURCE_MAX
    width = (right - left) / cells
    minimum = None
    for index in range(cells):
        source_left = left + index * width
        source_right = source_left + width
        c_upper = max(C(source_left).upper(), C(source_right).upper())
        value = arb(0)
        for shift, coefficient in (
            (LOG2, LOG2 / arb(2).sqrt()),
            (LOG3, LOG3 / arb(3).sqrt()),
        ):
            target_left = source_left - shift
            target_right = source_right - shift
            target_abs_upper = max(
                abs(target_left).upper(),
                abs(target_right).upper(),
            )
            # K is even and decreasing in |target|.  This endpoint value is
            # therefore a pointwise lower bound throughout the source cell.
            value += (
                coefficient
                * K_positive(arb(target_abs_upper)).lower()
                / c_upper
            )
        lower = value.lower()
        if minimum is None or lower < minimum:
            minimum = lower
    assert minimum is not None
    return minimum


def arch_single_lower(cells: int) -> tuple[arb, arb]:
    """Mass of one uniform arch submeasure into [-1/2,1/2]."""

    # For |source|<=31/25 and |z|<=1/2, |source-z|<=87/50 and
    # C(source)<=C(31/25).  Hence the following density is dominated by
    # either coordinate's actual arch marginal everywhere on the source box.
    width = ARCH_TARGET / cells
    positive_k_mass = arb(0)
    for index in range(cells):
        right = (index + 1) * width
        # Monotonicity of K makes the right-endpoint sum a lower sum.
        positive_k_mass += K_positive(right).lower() * width
    k_mass = 2 * positive_k_mass
    rate = k_mass * J(q(87, 50)) / C(SOURCE_MAX)
    return k_mass, rate


def main() -> None:
    # Geometry of all four prime targets over the complete source intervals.
    negative_source = arb(
        (-SOURCE_MAX - CORE) / 2,
        (SOURCE_MAX - CORE) / 2,
    )
    positive_source = -negative_source
    for shift in (LOG2, LOG3):
        assert abs(negative_source + shift) < CORE
        assert abs(positive_source - shift) < CORE

    prime_one_side = inward_23_lower(65_536)
    k_mass, arch_one_side = arch_single_lower(65_536)
    selected = 2 * prime_one_side + 2 * arch_one_side
    assert selected > q(1, 2)

    print("precision_bits:", ctx.prec)
    print("hard_target: min_abs_coordinate <=", CORE)
    # Print the defining rational endpoints explicitly.  Arb deliberately
    # renders these wide balls in compact ``[+/- ...]`` notation, which can
    # obscure their nonzero midpoint in a transcript.
    print("complement_x_box: [-31/25,-3/5]")
    print("complement_y_box: [3/5,31/25]")
    print("checked_x_ball_endpoints:", negative_source.lower(), negative_source.upper())
    print("checked_y_ball_endpoints:", positive_source.lower(), positive_source.upper())
    print("prime_q23_one_coordinate_lower:", prime_one_side)
    print("K_mass_on_arch_target_lower:", k_mass)
    print("arch_single_one_coordinate_lower:", arch_one_side)
    print("selected_rate_lower:", selected)
    print("margin_over_half:", selected - q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
