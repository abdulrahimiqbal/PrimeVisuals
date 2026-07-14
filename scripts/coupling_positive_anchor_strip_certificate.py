#!/usr/bin/env python3
"""Marginal-safe finite cover of the positive-anchor residual strip.

Uniformly for

    1/10 <= x <= 2/5,       9999/10000 <= y <= 10001/10000,

this script constructs, on each of three rational source boxes, disjoint
archimedean and prime subcouplings with selected rate greater than 1/2.
The archimedean allocation is a common-target subdensity on [-1,1] outside
one displayed interval and two independent single-coordinate subdensities on
that interval.  Each cellwise constant density is bounded below separately
for every source point in its box, so no monotonic extrapolation in x is used.
The prime allocation consists only of y's inward q=2,3,4 clocks.

Every selected event either coalesces or enters

    |midpoint| < 4/5,       separation < 4/5.

This is a directed local edge.  Unused channels, exits, and returns are not
assigned zero cost in any claimed global HJB inequality.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_positive_anchor_strip_certificate.py
"""

from flint import arb, ctx

from coupling_shoulder_anchor_phase_certificate import (
    INWARD_23,
    common_outside_interval,
    integrate_selected_arch,
    midpoint_box,
    minimum_rate_sum,
    q,
)
from coupling_shoulder_box_certificate import LOG4


ctx.prec = 180

Y = (q(9999, 10000), q(10001, 10000))
INWARD_234 = INWARD_23 + ((LOG4, arb(2).log(), arb(2), -1),)


def separation_bound(box_a: tuple[arb, arb],
                     box_b: tuple[arb, arb]) -> arb:
    return max(abs(box_a[0] - box_b[1]), abs(box_a[1] - box_b[0]))


def shifted_box(box: tuple[arb, arb], shift: arb) -> tuple[arb, arb]:
    return box[0] + shift, box[1] + shift


def certify_box(name: str, x_box: tuple[arb, arb],
                single_interval: tuple[arb, arb]) -> arb:
    common = common_outside_interval(x_box, Y, single_interval)
    singles = integrate_selected_arch(
        single_interval[0], single_interval[1], 8192,
        x_box, Y, "singles", False,
    )
    y_primes = minimum_rate_sum(Y, INWARD_234)
    selected = common + singles + y_primes
    assert selected > q(1, 2)

    midpoint_cutoff = q(4, 5)
    separation_cutoff = q(4, 5)

    # Either coordinate may make the selected single jump.
    assert abs(midpoint_box(single_interval, Y)) < midpoint_cutoff
    assert abs(midpoint_box(x_box, single_interval)) < midpoint_cutoff
    assert separation_bound(single_interval, Y) < separation_cutoff
    assert separation_bound(x_box, single_interval) < separation_cutoff

    # The three prime clocks act only on y.  The common clock is diagonal.
    for logq in (arb(2).log(), arb(3).log(), LOG4):
        target_y = shifted_box(Y, -logq)
        assert abs(midpoint_box(x_box, target_y)) < midpoint_cutoff
        assert separation_bound(x_box, target_y) < separation_cutoff

    print(name + "_x_box:", x_box)
    print(name + "_single_interval:", single_interval)
    print(name + "_common_lower:", common)
    print(name + "_two_singles_lower:", singles)
    print(name + "_y_q234_lower:", y_primes)
    print(name + "_selected_lower:", selected)
    print(name + "_margin_over_half:", selected - q(1, 2))
    return selected


def main() -> None:
    rates = (
        certify_box("box_1", (q(1, 10), q(1, 5)),
                    (q(3, 10), q(1, 2))),
        certify_box("box_2", (q(1, 5), q(3, 10)),
                    (q(7, 20), q(11, 20))),
        certify_box("box_3", (q(3, 10), q(2, 5)),
                    (q(7, 20), q(59, 100))),
    )
    assert min(rates) > q(1, 2)
    print("worst_selected_lower:", min(rates))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
