#!/usr/bin/env python3
"""Exact first-moment charge for infinite small archimedean activity.

For one marginal at source s, write its jump increment h=z-s.  On |h|<d,

    nu_s(dh) = K(s+h) J(|h|) / C(s) dh,
    J(u) <= exp(3d/2)/(2u).

The theta expansion gives the global elementary bound sup K<1.  Therefore,
for a pair function W that is L_m-Lipschitz in midpoint and L_r-Lipschitz in
separation, completing both marginal small-jump measures by single-coordinate
jumps contributes in absolute value at most

    (L_m+2L_r) exp(3d/2) d.

This is a generator first-moment bound, not a finite-rate interpretation of
the logarithmically infinite Levy mass.  At d=1/200 and 1/100 the respective
coefficients are rigorously below 0.005038 and 0.010152.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_small_jump_upward_certificate.py
"""

from flint import arb, ctx


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()


# For t>=0 and w=pi*n^2*exp(2t), each positive theta summand is at most
#
#   2(pi*n^2)^(-1/4) w^(9/4) exp(-w)
#     <= 2 pi^2 n^4 exp(-pi*n^2),
#
# because w>=pi*n^2>9/4 and u^(9/4)e^-u is then decreasing.
first = 2 * PI**2 * (-PI).exp()
second = 2 * PI**2 * arb(2) ** 4 * (-4 * PI).exp()
ratio_after_two = q(3, 2) ** 4 * (-5 * PI).exp()
assert ratio_after_two < q(1, 100000)
k_global_majorant = first + second / (1 - ratio_after_two)
assert k_global_majorant < 1


def small_jump_coefficient(delta: arb) -> arb:
    # 1-exp(-2u)>=2u exp(-2u) gives J(u)<=exp(3u/2)/(2u).
    return delta * (q(3, 2) * delta).exp()


coefficient_005 = small_jump_coefficient(q(1, 200))
coefficient_01 = small_jump_coefficient(q(1, 100))
assert coefficient_005 < arb("0.005038")
assert coefficient_01 < arb("0.010152")


print("precision_bits:", ctx.prec)
print("global_K_majorant:", k_global_majorant)
print("delta_0.005_coefficient_for_(Lm+2Lr):", coefficient_005)
print("delta_0.01_coefficient_for_(Lm+2Lr):", coefficient_01)
print("certificate: PASS")
