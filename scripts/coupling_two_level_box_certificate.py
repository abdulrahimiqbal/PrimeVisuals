#!/usr/bin/env python3
"""Exact compact-box two-level coupling certificate near (-1/4,1/4).

For the item-57 jump generator write

    a_x(z) = J(|z-x|) K(z) / C(x),
    r_2^+(x) = (log(2)/sqrt(2)) K(x+log(2))/C(x),
    r_2^-(x) = (log(2)/sqrt(2)) K(x-log(2))/C(x).

This script treats every starting pair in the rational box

    X = [-2501/10000,-2499/10000],
    Y = [ 2499/10000, 2501/10000].

It constructs three disjoint marginal-correct subcouplings, each of whose
events ends at pair separation at most 1/10:

  1. shifted arch/arch targets (z,z+1/10), on two central z intervals;
  2. one-coordinate arch targets in a 1/10-neighborhood of the other point;
  3. each unmatched q=2 atom paired with a reserved arch slice.

Their total event rate H is certified above 1/2 uniformly on the whole box.
Consequently the two-level stopped Lyapunov W=1+A 1_{|x-y|>1/10}
satisfies QW <= -H A at every point of this box (all unused events have
W-increment at most zero).  This is a local annular certificate, not a global
coupling or a proof of RH.

Target allocation table (endpoints have zero measure):

                first coordinate             second coordinate
  shifted arch  z in [-.248,.148] pieces     z+.1 in [-.148,.248] pieces
  single arch   [.1501,.3499]                [-.3499,-.1501]
  q2 arch slice [-.443,-.3575]               [.3575,.443]

The listed target regions are pairwise disjoint in each column.  Synchronous
common parts of the q=2 clocks preserve the old separation; every remaining
channel is left unused by this finite subcoupling and can be completed by
single-coordinate jumps.  Hence no marginal mass is counted twice.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_two_level_box_certificate.py
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
SQRT2 = arb(2).sqrt()
SHIFT = q(1, 10)
THETA = q(99, 100)
X = interval(-q(2501, 10000), -q(2499, 10000))
Y = interval(q(2499, 10000), q(2501, 10000))
L1, L2 = -q(248, 1000), -q(51, 1000)
R1, R2 = -q(49, 1000), q(148, 1000)
S1, S2 = q(1501, 10000), q(3499, 10000)
Q1, Q2 = q(3575, 10000), q(443, 1000)
COMPARE_PIECES = 16384
INTEGRAL_PIECES = 65536


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(x: arb) -> arb:
    assert x > 0
    return (-x / 2).exp() / (1 - (-2 * x).exp())


# All theta arguments used below lie in [-1e-45,1).  As in the other exact
# campaign certificates, the n>=5 tail is bounded uniformly by
# 20 n^4 exp(-3n^2), with the consecutive ratio bounded at n=5.
first_tail = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = (arb(6) / 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = first_tail / (1 - tail_ratio)
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def K_positive_branch(x: arb) -> arb:
    assert x > -q(1, 1000)
    assert x < 1
    total = arb(0)
    for n in range(1, 5):
        v = PI * n * n * (2 * x).exp()
        total += (
            PI
            * n
            * n
            * (q(5, 2) * x).exp()
            * (2 * v - 3)
            * (-v).exp()
        )
    return total + K_TAIL


def riemann_enclosure(function, left: arb, right: arb, pieces: int) -> arb:
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        cell_left = left + index * width
        cell_right = cell_left + width
        total += function(interval(cell_left, cell_right)) * width
    return total


# Densities on sign-fixed pieces.  In the shifted coupling the first target
# is z and the second target is w=z+SHIFT.
def ax_negative(z: arb) -> arb:
    return K_positive_branch(-z) * J(z - X) / C(X)


def ax_positive(z: arb) -> arb:
    return K_positive_branch(z) * J(z - X) / C(X)


def by_shift_w_negative(z: arb) -> arb:
    w = z + SHIFT
    return K_positive_branch(-w) * J(Y - w) / C(Y)


def by_shift_w_positive(z: arb) -> arb:
    w = z + SHIFT
    return K_positive_branch(w) * J(Y - w) / C(Y)


# Verify pointwise marginal domination of the chosen 99/100 densities.
def verify_cells(left, right, pieces, lhs, rhs):
    width = (right - left) / pieces
    smallest = None
    for index in range(pieces):
        z = interval(left + index * width, left + (index + 1) * width)
        margin = rhs(z) - THETA * lhs(z)
        assert margin > 0
        if smallest is None or margin.lower() < smallest.lower():
            smallest = margin
    return smallest


left_margin_1 = verify_cells(L1, -SHIFT, COMPARE_PIECES, by_shift_w_negative, ax_negative)
left_margin_2 = verify_cells(-SHIFT, L2, COMPARE_PIECES, by_shift_w_positive, ax_negative)
right_margin_1 = verify_cells(R1, arb(0), COMPARE_PIECES, ax_negative, by_shift_w_positive)
right_margin_2 = verify_cells(arb(0), R2, COMPARE_PIECES, ax_positive, by_shift_w_positive)


translation_rate = THETA * (
    riemann_enclosure(by_shift_w_negative, L1, -SHIFT, INTEGRAL_PIECES)
    + riemann_enclosure(by_shift_w_positive, -SHIFT, L2, INTEGRAL_PIECES)
    + riemann_enclosure(ax_negative, R1, arb(0), INTEGRAL_PIECES)
    + riemann_enclosure(ax_positive, arb(0), R2, INTEGRAL_PIECES)
)


single_x_rate = riemann_enclosure(ax_positive, S1, S2, INTEGRAL_PIECES)
single_y_rate = riemann_enclosure(
    lambda u: K_positive_branch(u) * J(Y + u) / C(Y),
    S1,
    S2,
    INTEGRAL_PIECES,
)


c2 = LOG2 / SQRT2
e_plus = c2 * (
    K_positive_branch(X + LOG2) / C(X)
    - K_positive_branch(Y + LOG2) / C(Y)
)
e_minus = c2 * (
    K_positive_branch(LOG2 - Y) / C(Y)
    - K_positive_branch(LOG2 - X) / C(X)
)
assert e_plus > 0
assert e_minus > 0


positive_slice_capacity = riemann_enclosure(
    lambda w: K_positive_branch(w) * J(w - Y) / C(Y),
    Q1,
    Q2,
    INTEGRAL_PIECES,
)
negative_slice_capacity = riemann_enclosure(
    lambda u: K_positive_branch(u) * J(u + X) / C(X),
    Q1,
    Q2,
    INTEGRAL_PIECES,
)
assert positive_slice_capacity - e_plus > arb("1e-5")
assert negative_slice_capacity - e_minus > arb("1e-5")


# Every target in either q2 slice is within 1/10 of the corresponding prime
# target, uniformly on the starting box.
assert Q2 < X + LOG2
assert Q2 < LOG2 - Y
assert X + LOG2 - Q1 < SHIFT
assert LOG2 - Y - Q1 < SHIFT


progress_rate = (
    translation_rate + single_x_rate + single_y_rate + e_plus + e_minus
)
assert progress_rate > q(501, 1000)


print("starting X box:", X)
print("starting Y box:", Y)
print("shifted-arch rate:", translation_rate)
print("single-arch rate:", single_x_rate + single_y_rate)
print("q2 cross rate:", e_plus + e_minus)
print("uniform progress rate:", progress_rate)
print("progress-minus-half:", progress_rate - q(1, 2))
print("positive q2 slice spare capacity:", positive_slice_capacity - e_plus)
print("negative q2 slice spare capacity:", negative_slice_capacity - e_minus)
print(
    "smallest shifted-density margins:",
    left_margin_1,
    left_margin_2,
    right_margin_1,
    right_margin_2,
)
print("CERTIFIED: the whole rational pair box has two-level progress rate > 1/2")
