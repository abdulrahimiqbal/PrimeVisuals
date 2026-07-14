#!/usr/bin/env python3
"""Arb certificate for an exact q=2-to-archimedean cross-channel slice.

At the symmetric physical pair (-a,a), a=1/4, retain the common-target
archimedean coupling and the common part of the two positive q=2 clocks.
The unmatched left-particle q=2 jump has target z=log(2)-a and rate

    e_2 = (log(2)/sqrt(2)) [K(log(2)-a)-K(log(2)+a)] / C(a).

The residual right-particle archimedean density at w in (a,z) is

    K(w) [J(w-a)-J(w+a)] / C(a).

This script proves that the residual slice w in [43/125,z] has mass strictly
larger than e_2, while z-43/125<1/10.  Scaling that slice by e_2 divided by
its mass therefore gives an exact marginal-correct joint submeasure which
pairs the whole unmatched prime atom into pair separation below 1/10.
Reflection gives the other orientation.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_prime_arch_slice_certificate.py
"""

from flint import arb, ctx


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
LOG2 = arb(2).log()
SQRT2 = arb(2).sqrt()
A = q(1, 4)
W0 = q(43, 125)
Z = LOG2 - A
Z_OUT = LOG2 + A
PIECES = 65536


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(x: arb) -> arb:
    assert x > 0
    return (-x / 2).exp() / (1 - (-2 * x).exp())


# On the full interval used below x>=W0>0.  Every theta summand is positive,
# and for n>=5 it is bounded by 20 n^4 exp(-3 n^2).  The same majorant also
# covers x=Z and x=Z_OUT, so a single geometric tail enclosure suffices.
first_tail = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = (arb(6) / 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = first_tail / (1 - tail_ratio)
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def K(x: arb) -> arb:
    assert x > 0
    assert x < 1
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
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-50"))


def riemann_enclosure(function, left: arb, right: arb, pieces: int) -> arb:
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        cell_left = left + index * width
        cell_right = cell_left + width
        total += function(interval(cell_left, cell_right)) * width
    return total


prime_excess = LOG2 / SQRT2 * (K(Z) - K(Z_OUT)) / C(A)


def residual_arch_density(w: arb) -> arb:
    return K(w) * (J(w - A) - J(w + A)) / C(A)


slice_mass = riemann_enclosure(residual_arch_density, W0, Z, PIECES)
margin = slice_mass - prime_excess

assert prime_excess > 0
assert margin > arb("1e-8")
assert Z - W0 < q(1, 10)

print("q=2 unmatched rate:", prime_excess)
print("residual arch slice mass:", slice_mass)
print("slice-minus-prime margin:", margin)
print("maximum resulting separation:", Z - W0)
print("CERTIFIED: residual cross-channel slice absorbs the full q=2 excess")
