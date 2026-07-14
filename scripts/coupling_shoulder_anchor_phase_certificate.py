#!/usr/bin/env python3
"""Exact finite-state shoulder/anchor coupling fragment.

This script certifies two local facts for the item-154 compact-annulus HJB.

* On H=[3/4,17/20] x [19/20,21/20], the four independent inward
  q=2,3 clocks have total rate >1/2 and land in four explicit one-core
  anchor boxes.
* On each anchor box, a disjoint allocation made from a common
  archimedean subdensity, both single archimedean marginals on one finite
  interval, the still-outer q=2,3,4,5 clocks, and one inner q=2 clock has
  total rate >1/2.  Every selected target either coalesces or has midpoint
  in (-4/5,4/5).

The result is deliberately a finite HJB fragment, not a completed global
coupling: unused channels and returns from the recovery set still require
weights in the global phase ledger.  All selected archimedean intervals are
separated from the source boxes.  The infinite residual Levy activity is
therefore neither truncated nor misinterpreted as a finite clock.

Reproduction:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_shoulder_anchor_phase_certificate.py
"""

from flint import arb, ctx

from coupling_shoulder_box_certificate import (
    C,
    J,
    K_positive,
    LOG2,
    LOG3,
    LOG4,
    ZERO_GAP,
    interval,
    q,
    theta_tail_bound,
)


ctx.prec = 180

LOG5 = arb(5).log()


def k_signed(z: arb, negative: bool) -> arb:
    return K_positive(-z if negative else z)


def max_abs_distance(z: arb, left: arb, right: arb) -> arb:
    d_left = abs(z - left).upper()
    d_right = abs(z - right).upper()
    return max(d_left, d_right)


def source_density_lower(z: arb, source_box: tuple[arb, arb]) -> arb:
    """Uniform lower bound for J(|s-z|)/C(s) over a source interval."""
    left, right = source_box
    distance_upper = max_abs_distance(z, left, right)
    c_upper = max(C(left).upper(), C(right).upper())
    return J(distance_upper).lower() / c_upper


def integrate_selected_arch(
    left: arb,
    right: arb,
    pieces: int,
    box_a: tuple[arb, arb],
    box_b: tuple[arb, arb],
    mode: str,
    negative: bool,
) -> arb:
    """Construct a cellwise common or two-single selected subdensity."""
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        lo = left + index * width
        z = interval(lo, lo + width)
        k_lower = k_signed(z, negative).lower()
        a_lower = source_density_lower(z, box_a)
        b_lower = source_density_lower(z, box_b)
        if mode == "common":
            density = k_lower * min(a_lower, b_lower)
        else:
            assert mode == "singles"
            # These are two separate physical jumps.  Each selected density
            # is dominated by its own marginal, so their rates add.
            density = k_lower * (a_lower + b_lower)
        if density > 0:
            total += density * width
    return total


def common_outside_interval(
    box_a: tuple[arb, arb],
    box_b: tuple[arb, arb],
    single_interval: tuple[arb, arb],
) -> arb:
    """Common subclock on [-1,1] minus the two-single interval."""
    il, ir = single_interval
    total = integrate_selected_arch(-arb(1), -ZERO_GAP, 12288,
                                    box_a, box_b, "common", True)
    if il < 0:
        total += integrate_selected_arch(-ZERO_GAP, il, 4096,
                                         box_a, box_b, "common", True)
    elif il > ZERO_GAP:
        total += integrate_selected_arch(ZERO_GAP, il, 4096,
                                         box_a, box_b, "common", False)
    # Every chosen single interval is positive in the present certificate.
    assert il > 0
    total += integrate_selected_arch(ir, arb(1), 12288,
                                     box_a, box_b, "common", False)
    return total


def rate_on_source(source: arb, logq: arb, mangoldt: arb,
                   sqrtq: arb, direction: int) -> arb:
    argument = source + direction * logq
    if argument < 0:
        kval = K_positive(-argument)
    else:
        assert argument > 0
        kval = K_positive(argument)
    return mangoldt / sqrtq * kval / C(source)


def minimum_rate_sum(
    source_box: tuple[arb, arb],
    terms: tuple[tuple[arb, arb, arb, int], ...],
    pieces: int = 8192,
) -> arb:
    """Rigorous lower envelope by a complete interval partition."""
    left, right = source_box
    width = (right - left) / pieces
    global_lower = None
    for index in range(pieces):
        lo = left + index * width
        source = interval(lo, lo + width)
        value = arb(0)
        for logq, mangoldt, sqrtq, direction in terms:
            value += rate_on_source(source, logq, mangoldt, sqrtq, direction)
        lower = value.lower()
        if global_lower is None or lower < global_lower:
            global_lower = lower
    assert global_lower is not None
    return global_lower


INWARD_23 = (
    (LOG2, LOG2, arb(2).sqrt(), -1),
    (LOG3, LOG3, arb(3).sqrt(), -1),
)
INWARD_2345 = INWARD_23 + (
    (LOG4, LOG2, arb(2), -1),
    (LOG5, LOG5, arb(5).sqrt(), -1),
)


def midpoint_box(box_a: tuple[arb, arb], box_b: tuple[arb, arb]) -> arb:
    return interval((box_a[0] + box_b[0]) / 2,
                    (box_a[1] + box_b[1]) / 2)


def shifted_box(box: tuple[arb, arb], shift: arb) -> tuple[arb, arb]:
    return box[0] + shift, box[1] + shift


def assert_midpoint_cutoff(box_a: tuple[arb, arb],
                           box_b: tuple[arb, arb]) -> None:
    assert abs(midpoint_box(box_a, box_b)) < q(4, 5)


def anchor_certificate(
    name: str,
    box_a: tuple[arb, arb],
    box_b: tuple[arb, arb],
    outer_index: int,
    inner_direction: int,
    single_interval: tuple[arb, arb],
) -> arb:
    outer = box_b if outer_index == 1 else box_a
    inner = box_a if outer_index == 1 else box_b

    common = common_outside_interval(box_a, box_b, single_interval)
    singles = integrate_selected_arch(single_interval[0], single_interval[1],
                                      8192, box_a, box_b, "singles", False)
    outer_prime = minimum_rate_sum(outer, INWARD_2345)
    inner_prime = minimum_rate_sum(
        inner, ((LOG2, LOG2, arb(2).sqrt(), inner_direction),)
    )
    selected = common + singles + outer_prime + inner_prime
    assert selected > q(1, 2)

    # Geometry of every prime target.  The common target is diagonal.
    for logq in (LOG2, LOG3, LOG4, LOG5):
        target_outer = shifted_box(outer, -logq)
        if outer_index == 1:
            assert_midpoint_cutoff(inner, target_outer)
        else:
            assert_midpoint_cutoff(target_outer, inner)
    target_inner = shifted_box(inner, inner_direction * LOG2)
    if outer_index == 1:
        assert_midpoint_cutoff(target_inner, outer)
    else:
        assert_midpoint_cutoff(outer, target_inner)

    zbox = single_interval
    # Either coordinate may make the selected single jump into zbox.
    assert_midpoint_cutoff(zbox, box_b)
    assert_midpoint_cutoff(box_a, zbox)

    print(name + "_common_outside:", common)
    print(name + "_two_single_arch:", singles)
    print(name + "_outer_prime_2345:", outer_prime)
    print(name + "_inner_prime_2:", inner_prime)
    print(name + "_selected_rate:", selected)
    return selected


def main() -> None:
    h_x = (q(3, 4), q(17, 20))
    h_y = (q(19, 20), q(21, 20))

    shoulder_x = minimum_rate_sum(h_x, INWARD_23)
    shoulder_y = minimum_rate_sum(h_y, INWARD_23)
    shoulder_rate = shoulder_x + shoulder_y
    assert shoulder_rate > q(1, 2)

    # The four independent single-coordinate clocks land in these anchors.
    ax2 = (shifted_box(h_x, -LOG2), h_y)
    ax3 = (shifted_box(h_x, -LOG3), h_y)
    ay2 = (h_x, shifted_box(h_y, -LOG2))
    ay3 = (h_x, shifted_box(h_y, -LOG3))
    for anchor in (ax2, ax3, ay2, ay3):
        assert abs(midpoint_box(*anchor)) < q(61, 100)

    print("precision_bits:", ctx.prec)
    print("theta_tail_bound:", theta_tail_bound)
    print("shoulder_x_q2q3_lower:", shoulder_x)
    print("shoulder_y_q2q3_lower:", shoulder_y)
    print("shoulder_to_anchor_rate:", shoulder_rate)

    rates = (
        anchor_certificate("anchor_x_q2", *ax2, 1, -1,
                           (q(3, 10), q(1, 2))),
        anchor_certificate("anchor_x_q3", *ax3, 1, +1,
                           (q(1, 10), q(3, 10))),
        anchor_certificate("anchor_y_q2", *ay2, 0, -1,
                           (q(9, 25), q(7, 10))),
        anchor_certificate("anchor_y_q3", *ay3, 0, +1,
                           (q(1, 5), q(2, 5))),
    )
    assert min(rates) > q(1, 2)
    print("minimum_anchor_selected_rate:", min(rates))
    print("threshold:", q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
