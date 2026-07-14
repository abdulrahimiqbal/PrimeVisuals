#!/usr/bin/env python3
"""Global elementary bounds for the Riemann coupling kernel.

The small-jump reflection estimate uses only

    sup_t K(t) < 1,            sup_t |K'(t)| < 11.

This script certifies both inequalities directly from the positive theta
series, without sampling t.  By evenness it suffices to take t>=0.  Put
``a=pi*n^2`` and ``w=a*exp(2t)``.  The n-th summand is

    S_n(t)=a^(-1/4) w^(5/4)(2w-3)e^(-w).

Since w>=a>=pi, ``S_n <= 2 a^(-1/4)w^(9/4)e^(-w)``.  Also

    d/dt log S_n = 5/2 + 4w/(2w-3) - 2w,

whose absolute value is at most ``13/2+2w``.  The relevant powers times
``e^-w`` are decreasing beyond their displayed maxima, reducing both
global estimates to rapidly convergent Gaussian sums.

Reproduction:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_kernel_global_bounds_certificate.py
"""

from flint import arb, ctx


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()


def gaussian_tail(first_index: int, term, ratio) -> arb:
    first = term(first_index)
    rho = ratio(first_index)
    assert rho < 1
    return first / (1 - rho)


def k_majorant(n: int) -> arb:
    nn = arb(n * n)
    return 2 * PI**2 * nn**2 * (-PI * nn).exp()


def k_ratio(n: int) -> arb:
    return q(n + 1, n) ** 4 * (-PI * (2 * n + 1)).exp()


k_bound = sum((k_majorant(n) for n in range(1, 5)), arb(0))
k_tail = gaussian_tail(5, k_majorant, k_ratio)
k_bound += k_tail
assert k_bound < 1


def exp_power(x: arb, exponent: arb) -> arb:
    return (exponent * x.log()).exp()


# For n=1, w^(13/4)e^-w reaches its maximum at w=13/4, just
# to the right of pi.  The w^(9/4) term is already decreasing at pi.
a1 = PI
d1_bound = 2 * exp_power(a1, -q(1, 4)) * (
    q(13, 2) * exp_power(a1, q(9, 4)) * (-a1).exp()
    + 2 * exp_power(q(13, 4), q(13, 4)) * (-q(13, 4)).exp()
)


def derivative_majorant(n: int) -> arb:
    a = PI * n * n
    # Valid for n>=2, where a>13/4 and both power-exponential factors
    # are decreasing from their left endpoint.
    return 2 * (q(13, 2) * a**2 + 2 * a**3) * (-a).exp()


def derivative_ratio(n: int) -> arb:
    # The polynomial has degree at most six in n.  Replacing its exact
    # consecutive ratio by ((n+1)/n)^6 is an upper bound.
    return q(n + 1, n) ** 6 * (-PI * (2 * n + 1)).exp()


d_bound = d1_bound + sum(
    (derivative_majorant(n) for n in range(2, 5)), arb(0)
)
d_tail = gaussian_tail(5, derivative_majorant, derivative_ratio)
d_bound += d_tail
assert d_bound < 11


print("precision_bits:", ctx.prec)
print("K_global_majorant:", k_bound)
print("K_n_ge_5_tail:", k_tail)
print("Kprime_n1_majorant:", d1_bound)
print("Kprime_global_majorant:", d_bound)
print("Kprime_n_ge_5_tail:", d_tail)
print("certified_bounds: sup K < 1, sup |K'| < 11")
print("certificate: PASS")
