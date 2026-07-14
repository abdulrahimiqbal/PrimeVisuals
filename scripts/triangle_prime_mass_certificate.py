#!/usr/bin/env python3
"""Arb certificate for the prime-edge budget of triangle allocations.

Let

    P = sum_{q=p^k} Lambda(q)/sqrt(q)
            * integral_R K(x) K(x+log(q)) dx.

The accompanying analytic argument proves

    P < 1/125 + 13/20000 + 13/5000 = 9/800 < 1/72.

This script certifies the only finite numerical inequalities in that proof:
the q=2 and q=3 autocorrelation bounds and the first term of the elementary
majorant used for every q>=4.  All series tails are enclosed by displayed
geometric majorants; no floating-point samples are used.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 scripts/triangle_prime_mass_certificate.py
"""

from fractions import Fraction

from flint import arb, ctx


ctx.prec = 160


def rat(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()


# On 0 <= x <= log(3)/2 and n>=5, the nth positive theta summand of
# K and its first derivative are bounded respectively by
#
#     20 n^4 exp(-3 n^2),       125 n^6 exp(-3 n^2).
#
# These are the same uniform theta bounds audited in
# universal_tail_hall_certificate.py.  Successive majorants have ratio at
# most (6/5)^power exp(-33), so the following are rigorous full tail bounds.
tail_bounds: list[arb] = []
for power, factor in ((4, 20), (6, 125)):
    first = factor * arb(5) ** power * (-arb(3) * 25).exp()
    ratio = (arb(6) / 5) ** power * (-arb(3) * 11).exp()
    tail_bounds.append(first / (1 - ratio))

assert tail_bounds[0] < arb("1e-28")
assert tail_bounds[1] < arb("1e-26")

K_TAIL = arb(0, "1e-28")
KP_TAIL = arb(0, "1e-26")


def k_and_kp(x: arb) -> tuple[arb, arb]:
    """Rigorous enclosures of K(x), K'(x) on the required positive range."""
    assert x >= 0
    assert x < rat(11, 20)
    k_sum = arb(0)
    kp_sum = arb(0)
    for n in range(1, 5):
        y = PI * n * n * (2 * x).exp()
        k_n = (
            PI
            * n
            * n
            * (rat(5, 2) * x).exp()
            * (2 * y - 3)
            * (-y).exp()
        )
        logarithmic_derivative = rat(5, 2) + 4 * y / (2 * y - 3) - 2 * y
        k_sum += k_n
        kp_sum += k_n * logarithmic_derivative
    return k_sum + K_TAIL, kp_sum + KP_TAIL


K_ZERO, _ = k_and_kp(arb(0))
assert K_ZERO < rat(1, 2)


def autocorrelation_upper(q: int) -> arb:
    """Return 2 K(0) K(log(q)/2)/U(log(q)/2) * log(q)/sqrt(q)."""
    midpoint = arb(q).log() / 2
    k_mid, kp_mid = k_and_kp(midpoint)
    u_mid = -kp_mid / k_mid
    assert u_mid > 0
    return (
        arb(q).log()
        / arb(q).sqrt()
        * 2
        * K_ZERO
        * k_mid
        / u_mid
    )


B2 = autocorrelation_upper(2)
B3 = autocorrelation_upper(3)
assert B2 < rat(1, 125)
assert B3 < rat(13, 20000)


# For m>=4 the analytic theta estimate gives
#
#   b_m = 4 pi^2 log(m) m^(7/4) exp(-pi m)
#
# as an upper bound after overcounting all integers rather than only prime
# powers.  Moreover
#
#   b_(m+1)/b_m
#     <= (3/2)(25/16)exp(-pi) < 15/128 < 1/8,
#
# because log(m+1)/log(m)<=3/2, ((m+1)/m)^(7/4)<=25/16,
# and exp(pi)>20.  Thus sum_{m>=4} b_m < (8/7)b_4 < 13/5000.
assert PI.exp() > 20
B4_MAJORANT = (
    4
    * PI**2
    * arb(4).log()
    * arb(4) ** rat(7, 4)
    * (-4 * PI).exp()
)
assert B4_MAJORANT < rat(11, 5000)
assert rat(8, 7) * rat(11, 5000) < rat(13, 5000)


TOTAL_BOUND = rat(1, 125) + rat(13, 20000) + rat(13, 5000)
assert Fraction(1, 125) + Fraction(13, 20000) + Fraction(13, 5000) == Fraction(9, 800)
assert TOTAL_BOUND < rat(1, 72)

print("theta tail bounds (K,K'):", *tail_bounds)
print("K(0):", K_ZERO)
print("q=2 autocorrelation upper:", B2, "< 1/125")
print("q=3 autocorrelation upper:", B3, "< 13/20000")
print("b_4 majorant:", B4_MAJORANT, "< 11/5000")
print("P < 9/800 < 1/72: PASS")
