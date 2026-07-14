#!/usr/bin/env python3
"""Rigorous scalar congestion bound for the midpoint prime-current attempt.

This certifies only the finite inequality used in the route audit.  It does
not claim that the scalar ODE current is a physical graph current or a
Douglas selector.

For every prime power q, the exact beta-CDF calculation bounds the residual
profile G_q by

    |G_q(x)| <= b(q)
      = 2*pi*log(q)*q^(3/4)*exp(-pi*q)/(1-4*exp(-3*pi*q)).

Prime powers are a subset of the integers.  If n >= 2, then

    b(n+1)^2 / b(n)^2
      <= R
      = (log(3)/log(2))^2*(3/2)^(3/2)*exp(-2*pi).

Indeed log(n+1)/log(n) and (1+1/n) decrease, while the ratio of
denominators is below one.  Hence

    sum_{q prime power} sup_x |G_q(x)|^2
      <= sum_{n>=2} b(n)^2
      <= b(2)^2/(1-R) < 189/1_000_000.

All displayed transcendental comparisons are made with Arb intervals.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/midpoint_prime_current_bound_certificate.py
"""

from flint import arb, ctx


ctx.prec = 240


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()
TWO = arb(2)
THREE = arb(3)
TARGET = q(189, 1_000_000)


def scalar_bound(n: int) -> arb:
    x = arb(n)
    return (
        2
        * PI
        * x.log()
        * x ** q(3, 4)
        * (-PI * x).exp()
        / (1 - 4 * (-3 * PI * x).exp())
    )


B2 = scalar_bound(2)
RATIO = (
    (THREE.log() / TWO.log()) ** 2
    * q(3, 2) ** q(3, 2)
    * (-2 * PI).exp()
)
ALL_INTEGER_SUM_UPPER = B2**2 / (1 - RATIO)
MARGIN = TARGET - ALL_INTEGER_SUM_UPPER

assert RATIO < q(9, 1000)
assert ALL_INTEGER_SUM_UPPER < TARGET
assert MARGIN > q(1, 10_000_000)

print("precision_bits:", ctx.prec)
print("b2:", B2)
print("b2_squared:", B2**2)
print("uniform_successive_square_ratio_upper:", RATIO)
print("all_integer_square_sum_upper:", ALL_INTEGER_SUM_UPPER)
print("target:", TARGET)
print("strict_margin:", MARGIN)
print("RESULT: PASS")
