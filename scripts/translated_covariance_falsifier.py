#!/usr/bin/env python3
"""Arb falsifier for the explicit rotating translated-radical covariance.

The construction uses the tail covariance

    kappa(t) = 3/(9+t^2) + (1341/1000) cos(omega*t)/(4+t^2),
    omega = 2*pi/log(plastic_constant).

This script certifies both facts needed in its exact audit:

1. kappa is negative at half the plastic window and positive at every
   separation at least the plastic window.
2. The tail-to-center coefficient has nonzero derivative cusps whose
   x^(-2) Fourier asymptotic changes sign.  Consequently the resulting
   kernel R(x,0) is negative for infinitely many positive-tail x and cannot
   majorize q(x)>0.

Both theta series have displayed geometric tails.  Upper incomplete gamma
functions evaluate the retained half-line Laplace terms exactly; Xi evaluates
the full transform.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 scripts/translated_covariance_falsifier.py
"""

from flint import acb, arb, ctx


ctx.prec = 160


def rat(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()

# This interval strictly encloses the unique positive root of p^3-p-1.
PLASTIC = arb("1.324717957244746025960908854", "1e-27")
assert 3 * PLASTIC**2 - 1 > 0
assert 0 in PLASTIC**3 - PLASTIC - 1

D = PLASTIC.log()
OMEGA = 2 * PI / D

# The ratio of the absolute oscillatory term to the positive term in kappa is
#
#   (447/1000) (9+t^2)/(4+t^2),
#
# and is strictly decreasing for t>0.  The two endpoint comparisons certify
# the claimed signs without sampling.
C = rat(447, 1000)
LOWER_RATIO = (4 + D**2 / 4) / (9 + D**2 / 4)
UPPER_RATIO = (4 + D**2) / (9 + D**2)
assert LOWER_RATIO < C
assert C < UPPER_RATIO

KAPPA_HALF = 3 / (9 + D**2 / 4) - rat(1341, 1000) / (4 + D**2 / 4)
assert KAPPA_HALF < -rat(9, 10000)


# Rigorous K(0).  For n>=5 the nth theta summand is bounded by
# 20 n^4 exp(-3n^2), with successive ratio at most
# (6/5)^4 exp(-33).
tail_first = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = (arb(6) / 5) ** 4 * (-arb(3) * 11).exp()
tail_bound = tail_first / (1 - tail_ratio)
assert tail_bound < arb("1e-28")

K_ZERO = arb(0)
for n in range(1, 5):
    z = PI * n * n
    K_ZERO += PI * n * n * (2 * z - 3) * (-z).exp()
K_ZERO += arb(0, "1e-28")


# For every frequency used below the half-Laplace parameter has real part 1.
# Positivity of each theta term therefore gives
#
#   |integral_0^infinity k_n(t) exp(-s t) dt|
#      <= integral_0^infinity k_n(t) exp(-t) dt
#      < 2*pi*n^2*exp(-pi*n^2).
#
# For n>=8 successive majorants have ratio at most
# (9/8)^2 exp(-17*pi).  The resulting full complex tail is below 1e-84.
half_tail_first = 2 * PI * arb(8) ** 2 * (-PI * 8**2).exp()
half_tail_ratio = (arb(9) / 8) ** 2 * (-17 * PI).exp()
half_tail_bound = half_tail_first / (1 - half_tail_ratio)
assert half_tail_bound < arb("1e-84")
HALF_TAIL = acb(arb(0, "1e-84"), arb(0, "1e-84"))


def half_laplace(s: acb) -> acb:
    """A(s)=integral_0^infinity K(t) exp(-s*t) dt."""
    assert 1 in s.real
    total = acb(0)
    for n in range(1, 8):
        z = PI * n * n
        coefficient = acb(z) ** (-rat(1, 4) + s / 2) / 2
        # python-flint's method convention is z.gamma_upper(shape).
        gamma_9 = acb(z).gamma_upper(acb(rat(9, 4)) - s / 2)
        gamma_5 = acb(z).gamma_upper(acb(rat(5, 4)) - s / 2)
        total += coefficient * (2 * gamma_9 - 3 * gamma_5)
    return total + HALF_TAIL


def xi(z: acb) -> acb:
    """The standard completed Xi(z)=xi(1/2+i*z)."""
    s = acb(rat(1, 2)) + acb(0, 1) * z
    return (
        s
        * (s - 1)
        * acb(PI) ** (-s / 2)
        * (s / 2).gamma()
        * s.zeta()
        / 2
    )


def center_coefficient(frequency: arb) -> arb:
    """H_0(xi) in Psi(0,xi)=sqrt(rho(xi))*H_0(xi)."""
    full_plus = xi(acb(frequency, 1)) / 2
    incomplete_plus = half_laplace(acb(1, -frequency))
    full_minus = full_plus.conjugate()
    incomplete_minus = incomplete_plus.conjugate()
    value = (
        incomplete_plus / full_plus
        + incomplete_minus / full_minus
        - acb(K_ZERO)
        * (
            1 / (acb(1, -frequency) * full_plus)
            + 1 / (acb(1, frequency) * full_minus)
        )
    )
    assert 0 in value.imag
    return value.real


H_ZERO = center_coefficient(arb(0))
H_OMEGA = center_coefficient(OMEGA)
assert H_ZERO < -rat(13, 5)
assert H_OMEGA < -50

# With Fourier convention kappa(t)=integral rho(xi)exp(i*xi*t) dxi,
#
#   rho(xi) = (1/2)e^(-3|xi|)
#             +(1341/8000)[e^(-2|xi-omega|)+e^(-2|xi+omega|)].
#
# For f=rho*H_0 the derivative jumps are
#
#   J_0     = -3 H_0(0),
#   J_omega = -4(1341/8000) H_0(omega).
#
# Twice integrating its Fourier transform gives
#
#   integral f(xi)e^(i*x*xi)dxi
#      =-[J_0+2J_omega cos(omega*x)]/x^2+o(x^-2).
#
# Both certified jumps are positive.  Along x=2*pi*n/omega the leading
# coefficient is therefore strictly negative, proving infinitely many
# tail-to-center violations.
J_ZERO = -3 * H_ZERO
J_OMEGA = -4 * rat(1341, 8000) * H_OMEGA
assert J_ZERO > 7
assert J_OMEGA > 30
assert J_ZERO + 2 * J_OMEGA > 60

print("plastic-window D:", D)
print("kappa(D/2):", KAPPA_HALF)
print("half-Laplace theta tail:", half_tail_bound)
print("H_0(0):", H_ZERO)
print("H_0(omega):", H_OMEGA)
print("derivative jumps J_0,J_omega:", J_ZERO, J_OMEGA)
print("tail-to-center sign obstruction: PASS")
