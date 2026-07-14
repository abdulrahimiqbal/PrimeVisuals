#!/usr/bin/env python3
"""Arb certificate for a directed shoulder-to-anchor coupling phase.

On the rational pair box

    x in [799/1000,801/1000],  y in [999/1000,1001/1000],

leave the four inward q=2 and q=3 prime clocks as single-coordinate jumps.
Their total rate is uniformly above 1/2.  Each such event leaves one
coordinate in [-31/100,31/100] and the other in the original shoulder box.

Thus, in a discrete-phase HJB ledger where the shoulder has weight W_H and
the resulting one-core-coordinate anchor rectangles have a lower weight
W_A, these four disjoint marginal channels alone contribute

    QW_H <= -h (W_H-W_A),   h > 1/2.

All unused channels may retain the shoulder weight.  This is one directed
local phase edge, not a completed global annular Lyapunov function.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_shoulder_anchor_certificate.py
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
X = interval(q(799, 1000), q(801, 1000))
Y = interval(q(999, 1000), q(1001, 1000))


def C(x: arb) -> arb:
    return (x / 2).cosh()


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


def inward_two_three_rate(t: arb) -> arb:
    q2 = LOG2 / arb(2).sqrt() * K_positive_branch(t - LOG2) / C(t)
    q3 = LOG3 / arb(3).sqrt() * K_positive_branch(LOG3 - t) / C(t)
    return q2 + q3


rate_x = inward_two_three_rate(X)
rate_y = inward_two_three_rate(Y)
progress_rate = rate_x + rate_y


# All four target intervals lie in the declared core anchor.
ANCHOR = q(31, 100)
assert X - LOG2 > -ANCHOR
assert X - LOG2 < ANCHOR
assert X - LOG3 > -ANCHOR
assert X - LOG3 < ANCHOR
assert Y - LOG2 > -ANCHOR
assert Y - LOG2 < ANCHOR
assert Y - LOG3 > -ANCHOR
assert Y - LOG3 < ANCHOR


assert progress_rate > q(29, 50)


print("shoulder X box:", X)
print("shoulder Y box:", Y)
print("x q2+q3 inward rate:", rate_x)
print("y q2+q3 inward rate:", rate_y)
print("uniform shoulder-to-anchor rate:", progress_rate)
print("rate-minus-half:", progress_rate - q(1, 2))
print("CERTIFIED: four independent prime clocks give a >1/2 directed phase edge")
