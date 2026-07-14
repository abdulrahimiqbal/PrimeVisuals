#!/usr/bin/env python3
"""Uniform hard entrance into a one-core set on the full compact square.

For every physical pair in ``[-5/4,5/4]^2`` outside

    S_core = {(x,y): min(|x|,|y|) <= 3/5},

both coordinates satisfy ``3/5 < |s| <= 5/4``.  For each marginal select
three disjoint single-coordinate clocks:

* the q=2 and q=3 prime-power jumps directed toward the origin;
* a finite archimedean subdensity supported on [-1/2,1/2].

Every selected event enters S_core because the jumping coordinate lands in
[-3/5,3/5].  The construction is independent of the signs, ordering,
midpoint, and separation of the source pair.  It is therefore a full-square
extension of the narrower item-171 entrance edge, recorded separately so the
original certificate and reproduction transcript remain unchanged.

The arch subdensity is

    K(z) J(7/4) / C(5/4),   |z| <= 1/2.

It is dominated by every source marginal in scope since |s-z|<=7/4,
J is decreasing, and C(s)<=C(5/4).  All unused Levy activity is left out of
the selected hard-stage clock.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_one_core_square_certificate.py
"""

from flint import arb, ctx

from coupling_shoulder_box_certificate import C, J, K_positive, q


ctx.prec = 180

LOG2 = arb(2).log()
LOG3 = arb(3).log()
CORE = q(3, 5)
ARCH_TARGET = q(1, 2)
SOURCE_MAX = q(5, 4)
MAX_DISTANCE = q(7, 4)
CELLS = 65_536


def inward_23_lower() -> arb:
    """Uniform inward q=2,3 rate on 3/5 <= |s| <= 5/4."""
    width = (SOURCE_MAX - CORE) / CELLS
    minimum = None
    for index in range(CELLS):
        source_left = CORE + index * width
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
                abs(target_left).upper(), abs(target_right).upper()
            )
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


def arch_single_lower() -> tuple[arb, arb]:
    width = ARCH_TARGET / CELLS
    positive_k_mass = arb(0)
    for index in range(CELLS):
        # K is positive and decreasing on the positive half-line, so this is
        # a dependency-free Darboux lower sum.
        positive_k_mass += K_positive((index + 1) * width).lower() * width
    k_mass = 2 * positive_k_mass
    rate = k_mass * J(MAX_DISTANCE) / C(SOURCE_MAX)
    return k_mass, rate


def main() -> None:
    # Exact geometry for positive sources; evenness/reflection handles the
    # negative source interval.
    positive_source = arb(
        (CORE + SOURCE_MAX) / 2,
        (SOURCE_MAX - CORE) / 2,
    )
    for shift in (LOG2, LOG3):
        assert abs(positive_source - shift) < CORE
    assert SOURCE_MAX + ARCH_TARGET == MAX_DISTANCE

    prime_one_coordinate = inward_23_lower()
    k_mass, arch_one_coordinate = arch_single_lower()
    selected = 2 * (prime_one_coordinate + arch_one_coordinate)
    assert selected > q(1, 2)

    print("precision_bits:", ctx.prec)
    print("source_square: [-5/4,5/4]^2")
    print("hard_target: min_abs_coordinate <=", CORE)
    print("complement_coordinate_abs_range: [3/5,5/4]")
    print("prime_q23_one_coordinate_lower:", prime_one_coordinate)
    print("K_mass_on_arch_target_lower:", k_mass)
    print("arch_single_one_coordinate_lower:", arch_one_coordinate)
    print("selected_rate_lower:", selected)
    print("margin_over_half:", selected - q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
