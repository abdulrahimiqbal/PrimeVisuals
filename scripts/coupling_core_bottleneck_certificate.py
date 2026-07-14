#!/usr/bin/env python3
"""Exact Arb certificate for the direct reset/common-jump bottleneck.

For the physical Markov generator in item 57, let

    beta^+(dy) = 2 exp(-y/2) K(y) dy

be the positive-tail inward-prime limit, and let

    a_x(z) = J(|x-z|) K(z) / C(x)

be the archimedean jump density.  This script proves, at a=1/4,

    beta^+([-a,a]) < 3/8,
    integral min(a_{-a}(z),a_a(z)) dz < 3/8.

Consequently every symmetric interval core [-A,A] has either inward reset
mass below 3/8 (A <= a), or worst-pair common archimedean coalescence rate
below 3/8 (A >= a).  This falsifies the *direct two-clock certificate* above
rate 3/8; it does not rule out a multistep/reflection coupling.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_core_bottleneck_certificate.py
"""

from flint import arb, ctx


ctx.prec = 160


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
A = q(1, 4)
THREE_EIGHTHS = q(3, 8)
R = arb(1)
PIECES = 65536


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(x: arb) -> arb:
    assert x > 0
    return (-x / 2).exp() / (1 - (-2 * x).exp())


# Uniform theta-tail enclosure on the padded range used by the interval
# constructor.  For n >= 5, y > 3 n^2 and
#
#   k_n <= 20 n^4 exp(-3 n^2).
#
# The ratio of consecutive majorants is bounded by its n=5 value.  The
# exponential bound is worst at the padded left endpoint: the logarithmic
# derivative in x is at most 9/2-2*pi*25*exp(2x)<0.
PADDED_LEFT = -q(1, 1000)
assert (2 * PADDED_LEFT).exp() > q(99, 100)
assert PI * q(99, 100) > 3
assert q(9, 2) - 2 * PI * 25 * (2 * PADDED_LEFT).exp() < 0
assert 2 * PI**2 * (q(9, 2) * PADDED_LEFT).exp() < 20
first_tail = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = (arb(6) / 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = first_tail / (1 - tail_ratio)
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def K(x: arb) -> arb:
    """Rigorous K enclosure on the positive branch (with rounding padding)."""
    assert x > -q(1, 1000)
    assert x < q(101, 100)
    total = arb(0)
    for n in range(1, 5):
        y = PI * n * n * (2 * x).exp()
        total += (
            PI
            * n
            * n
            * (q(5, 2) * x).exp()
            * (2 * y - 3)
            * (-y).exp()
        )
    return total + K_TAIL


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb(
        (left + right) / 2,
        (right - left) / 2 + arb("1e-45"),
    )


def riemann_enclosure(function, left: arb, right: arb, pieces: int) -> arb:
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        cell_left = left + index * width
        cell_right = cell_left + width
        total += function(interval(cell_left, cell_right)) * width
    return total


# Evenness of K gives beta^+([-a,a]) = 4 int_0^a C(x)K(x)dx.
reset_mass = riemann_enclosure(lambda x: 4 * C(x) * K(x), arb(0), A, PIECES)
assert reset_mass < THREE_EIGHTHS


# Since J is strictly decreasing,
#
# min(a_{-a}(z),a_a(z)) = K(z) J(|z|+a) / C(a).
#
# Integrate [0,1] by interval arithmetic and bound [1,infinity) explicitly.
overlap_main = riemann_enclosure(
    lambda x: 2 * K(x) * J(x + A) / C(A),
    arb(0),
    R,
    PIECES,
)

# For z >= 1,
#
# K(z) <= 2 pi^2 exp(9z/2) exp(-pi exp(2z))
#         / (1-16 exp(-3 pi exp(2))),
# J(z+a) <= exp(-(z+a)/2)/(1-exp(-2(1+a))).
#
# Substitution u=exp(2z) evaluates the remaining elementary majorant.
u0 = (2 * R).exp()
series_ratio = 16 * (-3 * PI * u0).exp()
assert series_ratio < 1
tail_constant = (
    2
    / C(A)
    * 2
    * PI**2
    * (-A / 2).exp()
    / (1 - series_ratio)
    / (1 - (-2 * (R + A)).exp())
)
elementary_tail_integral = (
    q(1, 2)
    * (-PI * u0).exp()
    * (u0 / PI + 1 / PI**2)
)
overlap_tail = tail_constant * elementary_tail_integral
overlap_rate = overlap_main + arb(0, overlap_tail.upper())
assert overlap_rate < THREE_EIGHTHS


print("precision_bits:", ctx.prec)
print("pieces:", PIECES)
print("theta_tail_bound:", theta_tail_bound)
print("reset_mass_beta_plus_interval:", reset_mass)
print("arch_common_jump_overlap_main:", overlap_main)
print("arch_common_jump_overlap_tail_upper:", overlap_tail)
print("arch_common_jump_overlap_total:", overlap_rate)
print("threshold:", THREE_EIGHTHS)
print("certificate: PASS")
