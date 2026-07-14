#!/usr/bin/env python3
"""Arb certificate for an opposite-anchor-to-central directed edge.

For

    x in [-3865/10000,-3861/10000],
    y in [ 7999/10000, 8001/10000],

use a common-target archimedean clock on the finite target interval
[-9/10,7/10], and leave four prime clocks as single-coordinate jumps:
x's positive q=2 clock and y's negative q=2,3,4 clocks.  These channels are
disjoint, marginal-correct, and their total rate is uniformly greater than
1/2.  Every prime event lands in

    |midpoint| < 14/25,   separation < 1/2,

while every common-target event coalesces.  Hence this supplies a directed
local HJB edge from the indicated opposite-anchor box to a narrower central
phase.  Unselected channels and upward phase costs still have to be charged
in a global annular ledger.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_opposite_anchor_box_certificate.py
"""

from flint import arb, ctx


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-50"))


PI = arb.pi()
LOG2 = arb(2).log()
LOG3 = arb(3).log()
LOG4 = arb(4).log()
X = interval(-q(3865, 10000), -q(3861, 10000))
Y = interval(q(7999, 10000), q(8001, 10000))
ZERO_GAP = q(1, 1000000)
PIECES = 32768


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(h: arb) -> arb:
    assert h > 0
    return (-h / 2).exp() / (1 - (-2 * h).exp())


first_tail = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = (arb(6) / 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = first_tail / (1 - tail_ratio)
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def K_positive(t: arb) -> arb:
    assert t > -q(1, 1000)
    assert t < 1
    total = arb(0)
    for n in range(1, 5):
        v = PI * n * n * (2 * t).exp()
        total += (
            PI
            * n
            * n
            * (q(5, 2) * t).exp()
            * (2 * v - 3)
            * (-v).exp()
        )
    return total + K_TAIL


def integrate_lower(left: arb, right: arb, pieces: int, integrand) -> arb:
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        z = interval(left + index * width, left + (index + 1) * width)
        value = integrand(z).lower()
        if value > 0:
            total += value * width
    return total


def common_left_of_x_negative(z: arb) -> arb:
    k = K_positive(-z)
    bx = J(X - z) / C(X)
    by = J(Y - z) / C(Y)
    return k * min(bx.lower(), by.lower())


def common_between_x_and_zero_negative(z: arb) -> arb:
    k = K_positive(-z)
    bx = J(z - X) / C(X)
    by = J(Y - z) / C(Y)
    return k * min(bx.lower(), by.lower())


def common_positive(z: arb) -> arb:
    k = K_positive(z)
    bx = J(z - X) / C(X)
    by = J(Y - z) / C(Y)
    return k * min(bx.lower(), by.lower())


# Omit the whole narrow source-X box from the common integral so no interval
# ever evaluates J at zero.  The omitted common mass is positive and is not
# needed for the lower bound.
common_rate = integrate_lower(
    -q(9, 10), -q(3866, 10000), PIECES, common_left_of_x_negative
)
common_rate += integrate_lower(
    -q(3860, 10000), -ZERO_GAP, PIECES, common_between_x_and_zero_negative
)
common_rate += integrate_lower(
    ZERO_GAP, q(7, 10), PIECES, common_positive
)


c2 = LOG2 / arb(2).sqrt()
c3 = LOG3 / arb(3).sqrt()
p2x_plus = c2 * K_positive(X + LOG2) / C(X)
p2y_minus = c2 * K_positive(Y - LOG2) / C(Y)
p3y_minus = c3 * K_positive(LOG3 - Y) / C(Y)
p4y_minus = LOG2 / arb(2) * K_positive(LOG4 - Y) / C(Y)
prime_rate = p2x_plus + p2y_minus + p3y_minus + p4y_minus
progress_rate = common_rate + prime_rate


# Exact target geometry for the four prime clocks.
MID = q(14, 25)
SEP = q(1, 2)


def check_target(u: arb, v: arb) -> None:
    assert abs((u + v) / 2) < MID
    assert abs(u - v) < SEP


check_target(X + LOG2, Y)
check_target(X, Y - LOG2)
check_target(X, Y - LOG3)
check_target(X, Y - LOG4)


assert progress_rate > q(57, 100)


print("source X box:", X)
print("source Y box:", Y)
print("common-target lower rate:", common_rate)
print("four prime clocks:", prime_rate)
print("uniform progress rate:", progress_rate)
print("progress-minus-half:", progress_rate - q(1, 2))
print("CERTIFIED: opposite anchor has a >1/2 edge into the central phase")
