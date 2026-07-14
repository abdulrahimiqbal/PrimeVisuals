#!/usr/bin/env python3
"""Exact midpoint-only repair of the positive-anchor strip.

For

    1/10 <= x <= 2/5,       9999/10000 <= y <= 10001/10000,

split the x-range into the same three boxes as the item-160 certificate.
This allocation does not need a separation decrease.

* retain the common-target archimedean subclock on [-1,1] outside I;
* on U=[-1/5,-1/10], replace that common event by two separately
  dominated single-coordinate events (adding one copy of its rate);
* on I retain only the y-coordinate single subdensity;
* add x's negative q=2 clock and y's negative q=2,3,4 clocks.

The selected rate exceeds 1/2 on every box.  Every noncoalescent target has
absolute midpoint below 1/2, whereas every source midpoint is above 1/2.
Consequently the edge is favorable for every cost G(r)H(m) for which G is
nondecreasing and already saturated by r=1/2 and H is even and
nondecreasing in |m|.  This removes the dangerous outward-midpoint x-single
branch from the earlier strip allocation.

For a concrete rational C1 phase, let S(t)=3t^2-2t^3 on [0,1], extended by
0 to the left and 1 to the right, and put

    H(m)=1+32 S(25(|m|-1/2)).

Every source has H=33 and every target has H<=1 (strict target inequalities
allow the boundary value).  If G is normalized to one after r=1/2, the
selected normalized drift is therefore at least ``rate*32/33``; its worst
certified value remains greater than 1/2.

Reproduction:

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_positive_anchor_midpoint_certificate.py
"""

from flint import arb, ctx

from coupling_positive_anchor_strip_certificate import (
    INWARD_234,
    Y,
    common_outside_interval,
    minimum_rate_sum,
    q,
)
from coupling_shoulder_anchor_phase_certificate import (
    integrate_selected_arch,
    k_signed,
    source_density_lower,
)
from coupling_shoulder_box_certificate import LOG2, interval


ctx.prec = 180

U = (-q(1, 5), -q(1, 10))
X_Q2_MINUS = ((LOG2, LOG2, arb(2).sqrt(), -1),)


def integrate_one_marginal(
    left: arb,
    right: arb,
    source_box: tuple[arb, arb],
    pieces: int = 8192,
) -> arb:
    """Cellwise constant selected density from one positive target slice."""
    assert left > 0 and right > left
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        z = interval(left + index * width, left + (index + 1) * width)
        density = k_signed(z, False).lower() * source_density_lower(z, source_box)
        if density > 0:
            total += density * width
    return total


def midpoint_box(
    box_a: tuple[arb, arb], box_b: tuple[arb, arb]
) -> tuple[arb, arb]:
    return (box_a[0] + box_b[0]) / 2, (box_a[1] + box_b[1]) / 2


def shifted_box(box: tuple[arb, arb], shift: arb) -> tuple[arb, arb]:
    return box[0] + shift, box[1] + shift


def assert_central_midpoint(
    box_a: tuple[arb, arb], box_b: tuple[arb, arb]
) -> None:
    left, right = midpoint_box(box_a, box_b)
    assert left > -q(1, 2)
    assert right < q(1, 2)


def certify_box(
    name: str,
    x_box: tuple[arb, arb],
    single_interval: tuple[arb, arb],
) -> arb:
    common = common_outside_interval(x_box, Y, single_interval)
    unpaired_common = integrate_selected_arch(
        U[0], U[1], 8192, x_box, Y, "common", True
    )
    y_single = integrate_one_marginal(single_interval[0], single_interval[1], Y)
    x_q2 = minimum_rate_sum(x_box, X_Q2_MINUS)
    y_q234 = minimum_rate_sum(Y, INWARD_234)
    selected = common + unpaired_common + y_single + x_q2 + y_q234
    assert selected > q(1, 2)

    # Every source midpoint is strictly above 1/2.
    source_midpoint = midpoint_box(x_box, Y)
    assert source_midpoint[0] > q(1, 2)

    # The two events replacing the common U clock.
    assert_central_midpoint(U, Y)
    assert_central_midpoint(x_box, U)

    # The retained y-single event on I.
    assert_central_midpoint(x_box, single_interval)

    # The selected prime clocks are all negative-coordinate shifts.
    assert_central_midpoint(shifted_box(x_box, -LOG2), Y)
    for logq in (arb(2).log(), arb(3).log(), arb(4).log()):
        assert_central_midpoint(x_box, shifted_box(Y, -logq))

    print(name + "_x_box:", x_box)
    print(name + "_source_midpoint:", source_midpoint)
    print(name + "_common_outside_I:", common)
    print(name + "_extra_unpaired_U:", unpaired_common)
    print(name + "_y_single_I:", y_single)
    print(name + "_x_q2_minus:", x_q2)
    print(name + "_y_q234_minus:", y_q234)
    print(name + "_selected_rate:", selected)
    print(name + "_margin_over_half:", selected - q(1, 2))
    return selected


def main() -> None:
    rates = (
        certify_box(
            "box_1", (q(1, 10), q(1, 5)), (q(3, 10), q(1, 2))
        ),
        certify_box(
            "box_2", (q(1, 5), q(3, 10)), (q(7, 20), q(11, 20))
        ),
        certify_box(
            "box_3", (q(3, 10), q(2, 5)), (q(7, 20), q(59, 100))
        ),
    )
    assert min(rates) > q(1, 2)
    smooth_phase_drift = min(rates) * q(32, 33)
    assert smooth_phase_drift > q(1, 2)
    print("worst_selected_rate:", min(rates))
    print("smooth_phase_source_to_target_ratio:", q(1, 33))
    print("smooth_phase_normalized_drift:", smooth_phase_drift)
    print("smooth_phase_margin_over_half:", smooth_phase_drift - q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
