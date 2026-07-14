#!/usr/bin/env python3
"""Preserved Arb certificate for the original shoulder rate allocation.

This is the first narrow-box certificate recorded in continuation item 157.
It has a slightly larger selected rate than the later midpoint--separation
repair, but controls only the target midpoint.  Keeping it in a separate
script preserves that exact result while ``coupling_shoulder_box_certificate``
certifies the stronger target geometry.

Reproduction:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_shoulder_box_rate_certificate.py
"""

from flint import arb, ctx

from coupling_shoulder_box_certificate import (
    C,
    K_positive,
    LOG2,
    LOG3,
    LOG4,
    X,
    Y,
    ZERO_GAP,
    common_piece,
    integrate_lower,
    interval,
    inward_rate,
    q,
    theta_tail_bound,
    x_residual_piece,
)


ctx.prec = 180


def main() -> None:
    common_lower = integrate_lower(
        -arb(1), -ZERO_GAP, 32768, lambda z: common_piece(z, True)
    )
    common_lower += integrate_lower(
        ZERO_GAP, q(7, 10), 32768, lambda z: common_piece(z, False)
    )

    residual_i1_lower = integrate_lower(
        -q(3, 10), -ZERO_GAP, 16384,
        lambda z: x_residual_piece(z, True),
    )
    residual_i1_lower += integrate_lower(
        ZERO_GAP, q(1, 10), 8192,
        lambda z: x_residual_piece(z, False),
    )
    residual_i2_lower = integrate_lower(
        q(1, 10), q(2, 5), 24576,
        lambda z: x_residual_piece(z, False),
    )

    p2x = inward_rate(X, LOG2, LOG2, arb(2).sqrt())
    p2y = inward_rate(Y, LOG2, LOG2, arb(2).sqrt())
    p3x = inward_rate(X, LOG3, LOG3, arb(3).sqrt())
    p3y = inward_rate(Y, LOG3, LOG3, arb(3).sqrt())
    p4x = inward_rate(X, LOG4, LOG2, arb(2))
    p4y = inward_rate(Y, LOG4, LOG2, arb(2))

    d2 = p2x - p2y
    d3 = p3y - p3x
    unmatched_q3 = d3 - d2
    d4 = p4y - p4x
    assert d2 > 0
    assert d3 > d2
    assert d4 > 0
    assert residual_i1_lower > unmatched_q3.upper()

    # Common target; synchronous q2/q3; q2--q3 cross allocation; residual
    # q3--arch allocation; single y-q4 excess; and the disjoint I2 residual.
    progress_lower = (
        common_lower
        + p2y.lower()
        + p3y.lower()
        + d4.lower()
        + residual_i2_lower
    )
    assert progress_lower > q(1, 2)

    cutoff = q(71, 100)
    midpoint = (X + Y) / 2
    assert abs(midpoint - LOG2) < cutoff
    assert abs(midpoint - LOG3) < cutoff
    assert abs(midpoint - (LOG2 + LOG3) / 2) < cutoff
    assert abs(
        (interval(-q(3, 10), q(1, 10)) + Y - LOG3) / 2
    ) < cutoff
    assert abs(midpoint - LOG2) < cutoff
    assert abs(
        (interval(q(1, 10), q(2, 5)) + Y) / 2
    ) < cutoff

    print("precision_bits:", ctx.prec)
    print("theta_tail_bound:", theta_tail_bound)
    print("source_x_box:", X)
    print("source_y_box:", Y)
    print("common_arch_lower:", common_lower)
    print("residual_i1_lower:", residual_i1_lower)
    print("residual_i2_lower:", residual_i2_lower)
    print("unmatched_q3:", unmatched_q3)
    print("q4_excess:", d4)
    print("progress_rate_lower:", progress_lower)
    print("threshold:", q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
