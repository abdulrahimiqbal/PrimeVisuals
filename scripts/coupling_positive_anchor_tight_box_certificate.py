#!/usr/bin/env python3
"""Tight Arb certificate for the hardest positive-anchor endpoint.

For

    x in [99999/1000000,100001/1000000],
    y in [999999/1000000,1000001/1000000],

the direct common clock plus y's inward q=2,3,4 clocks is just below 1/2.
This certificate closes the local deficit by using two additional legitimate
channels: the x q=2 positive clock and an x-arch residual slice.

On target z in [.4001,.5805] one has a_x(z)>=a_y(z).  Allocate a_y(z) to a
common-target event and leave the residual a_x(z)-a_y(z) as a single x jump;
the combined progress-event rate on that interval is therefore a_x(z).
Outside it, use explicit common subdensities a_y on [-1,.4001] (with a tiny
source-box omission) and a_x on [.5835,.99].  All density comparisons are
checked cellwise.  Together with the four prime clocks, the resulting rate
is uniformly greater than 1/2.

Every selected target has separation <61/100.  In the short endpoint segment
has |midpoint|<9/10.  This is a directed local HJB edge, not a global phase
closure; upward and unused channels remain for the finite-cover ledger.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_positive_anchor_tight_box_certificate.py
"""

from flint import arb, ctx


ctx.prec = 200


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-55"))


PI = arb.pi()
LOG2 = arb(2).log()
LOG3 = arb(3).log()
LOG4 = arb(4).log()
X = interval(q(99999, 1000000), q(100001, 1000000))
Y = interval(q(999999, 1000000), q(1000001, 1000000))
SOURCE_LEFT = q(99998, 1000000)
SOURCE_RIGHT = q(100002, 1000000)
MIDDLE_LEFT = q(4001, 10000)
MIDDLE_RIGHT = q(5805, 10000)
OUTER_LEFT = q(5835, 10000)
OUTER_RIGHT = q(99, 100)
NEGATIVE_LEFT = -q(99, 100)
ZERO_GAP = q(1, 1000000)
COMPARE_PIECES = 32768
INTEGRAL_PIECES = 131072


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


def ay_negative(z: arb) -> arb:
    return K_positive(-z) * J(Y - z) / C(Y)


def ay_positive(z: arb) -> arb:
    return K_positive(z) * J(Y - z) / C(Y)


def ax_right(z: arb) -> arb:
    return K_positive(z) * J(z - X) / C(X)


def ax_left_positive(z: arb) -> arb:
    return K_positive(z) * J(X - z) / C(X)


def ax_left_negative(z: arb) -> arb:
    return K_positive(-z) * J(X - z) / C(X)


def integrate_lower(left: arb, right: arb, pieces: int, integrand) -> arb:
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        z = interval(left + index * width, left + (index + 1) * width)
        value = integrand(z).lower()
        if value > 0:
            total += value * width
    return total


def verify(left: arb, right: arb, pieces: int, larger, smaller) -> arb:
    width = (right - left) / pieces
    smallest_margin = None
    for index in range(pieces):
        z = interval(left + index * width, left + (index + 1) * width)
        margin = larger(z) - smaller(z)
        assert margin > 0
        if smallest_margin is None or margin.lower() < smallest_margin.lower():
            smallest_margin = margin
    return smallest_margin


# Common a_y below the source and between the source and .4001.
left_cmp_1 = verify(NEGATIVE_LEFT, -ZERO_GAP, COMPARE_PIECES, ax_left_negative, ay_negative)
left_cmp_2 = verify(ZERO_GAP, SOURCE_LEFT, COMPARE_PIECES, ax_left_positive, ay_positive)
left_cmp_3 = verify(SOURCE_RIGHT, MIDDLE_LEFT, COMPARE_PIECES, ax_right, ay_positive)
# Residual x mass is positive on the middle slice.
middle_cmp = verify(MIDDLE_LEFT, MIDDLE_RIGHT, COMPARE_PIECES, ax_right, ay_positive)
# Past the omitted crossover gap, a_x is the common subdensity.
outer_cmp = verify(OUTER_LEFT, OUTER_RIGHT, COMPARE_PIECES, ay_positive, ax_right)


arch_progress = integrate_lower(NEGATIVE_LEFT, -ZERO_GAP, INTEGRAL_PIECES, ay_negative)
arch_progress += integrate_lower(ZERO_GAP, SOURCE_LEFT, INTEGRAL_PIECES, ay_positive)
arch_progress += integrate_lower(SOURCE_RIGHT, MIDDLE_LEFT, INTEGRAL_PIECES, ay_positive)
# Common a_y plus the disjoint residual a_x-a_y has total event rate a_x.
middle_progress = integrate_lower(
    MIDDLE_LEFT, MIDDLE_RIGHT, INTEGRAL_PIECES, ax_right
)
arch_progress += middle_progress
arch_progress += integrate_lower(OUTER_LEFT, OUTER_RIGHT, INTEGRAL_PIECES, ax_right)


c2 = LOG2 / arb(2).sqrt()
c3 = LOG3 / arb(3).sqrt()
p2x_plus = c2 * K_positive(X + LOG2) / C(X)
p2y_minus = c2 * K_positive(Y - LOG2) / C(Y)
p3y_minus = c3 * K_positive(LOG3 - Y) / C(Y)
p4y_minus = LOG2 / arb(2) * K_positive(LOG4 - Y) / C(Y)
prime_progress = p2x_plus + p2y_minus + p3y_minus + p4y_minus
progress_rate = arch_progress + prime_progress


def check_target(u: arb, v: arb) -> None:
    assert abs(u - v) < q(61, 100)
    assert abs((u + v) / 2) < q(9, 10)


check_target(X + LOG2, Y)
check_target(X, Y - LOG2)
check_target(X, Y - LOG3)
check_target(X, Y - LOG4)
check_target(interval(MIDDLE_LEFT, MIDDLE_RIGHT), Y)


assert progress_rate > q(50001, 100000)


print("source X box:", X)
print("source Y box:", Y)
print("arch progress lower:", arch_progress)
print("prime progress:", prime_progress)
print("uniform progress rate:", progress_rate)
print("progress-minus-half:", progress_rate - q(1, 2))
print("density margins:", left_cmp_1, left_cmp_2, left_cmp_3, middle_cmp, outer_cmp)
print("CERTIFIED: the positive-anchor endpoint box has a >1/2 directed edge")
