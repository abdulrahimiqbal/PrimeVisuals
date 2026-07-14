#!/usr/bin/env python3
"""Rigorous Arb certificate for the local d_U curvature obstruction.

Run with python-flint 0.9.0 or later, for example:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 scripts/u_abel_curvature_certificate.py

Every comparison below is an Arb interval comparison.  The only truncated
series is the theta series used for U'(3 log(2)/4); the displayed geometric
majorants bound all omitted terms.
"""

from flint import arb, ctx


ctx.prec = 200


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


LOG2 = arb(2).log()
SQRT2 = arb(2).sqrt()
PI = arb.pi()

X = q(3, 4) * LOG2
A = q(1, 4) * LOG2
E = q(1, 8) * LOG2


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(x: arb) -> arb:
    return (-x / 2).exp() / (1 - (-2 * x).exp())


def theta_term(x: arb, n: int) -> tuple[arb, arb, arb]:
    """Return k_n, k_n', k_n'' in the positive-x theta expansion of K."""
    y = PI * n * n * (2 * x).exp()
    k = PI * n * n * (q(5, 2) * x).exp() * (2 * y - 3) * (-y).exp()
    logarithmic_derivative = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
    minus_logarithmic_derivative_prime = 4 * y + 24 * y / (2 * y - 3) ** 2
    return (
        k,
        k * logarithmic_derivative,
        k
        * (
            logarithmic_derivative**2
            - minus_logarithmic_derivative_prime
        ),
    )


# The q=2 derivative in C(x) times the backward jump rate is
#
#   (log 2)/sqrt(2) * K(A) * (U(A) - tanh(X/2)/2).
#
# For y >= pi*sqrt(2), each summand is positive, so its n=1 summand is a
# rigorous lower bound for the whole theta series.
y_a = PI * (2 * A).exp()
k_a, kp_a, _ = theta_term(A, 1)
minus_a_a = -kp_a / k_a
q2_raw_n1 = (
    LOG2
    / SQRT2
    * k_a
    * (minus_a_a - q(1, 2) * (X / 2).tanh())
)
assert q2_raw_n1 > q(1, 2)


# For a <= 0, the negative derivative of the archimedean backward mass is
# at most this kernel value at distance X, times int_{-infinity}^0 K.
# Since int C K = 1/4, evenness and C >= 1 give int_{-infinity}^0 K <= 1/8.
minus_j_prime = J(X) * (q(1, 2) + 2 / ((2 * X).exp() - 1))
arch_derivative_kernel = (
    minus_j_prime + q(1, 2) * (X / 2).tanh() * J(X)
)
assert arch_derivative_kernel < q(17, 8)


# Certify 36 < U'(X) and U'(X) C(X) < 40.  At X, y_1 > 8.  For n >= 5,
#
#   k_n                  <= 320 n^4 exp(-8 n^2),
#   |k_n'|               <= 6400 n^6 exp(-8 n^2),
#   |k_n''|              <= 160000 n^8 exp(-8 n^2).
#
# The ratio of consecutive majorants is bounded by the value used below.
K = arb(0)
KP = arb(0)
KPP = arb(0)
for n in range(1, 5):
    kn, kpn, kppn = theta_term(X, n)
    K += kn
    KP += kpn
    KPP += kppn

tail_bounds = []
for power, factor in ((4, 320), (6, 6400), (8, 160000)):
    first = arb(5) ** power * (-arb(8) * 25).exp()
    ratio = (arb(6) / 5) ** power * (-arb(8) * 11).exp()
    bound = factor * first / (1 - ratio)
    assert bound < arb("1e-60")
    tail_bounds.append(bound)

# A symmetric 1e-60 enclosure is wider than each proved tail bound.
tail_error = arb(0, "1e-60")
K += tail_error
KP += tail_error
KPP += tail_error

UP_X = (KP / K) ** 2 - KPP / K
assert UP_X > 36
assert UP_X * C(X) < 40


# U(log(2)/8) > 3/2 follows term by term.  If
# g(y)=2y-5/2-4y/(2y-3), then g'(y)>0, y_n>=y_1>3.73, and
# g(y_1)>3/2.  U is the k_n-weighted average of g(y_n).
y_e = PI * (2 * E).exp()
g_y_e = 2 * y_e - q(5, 2) - 4 * y_e / (2 * y_e - 3)
assert y_e > q(373, 100)
assert g_y_e > q(3, 2)


# On a in [-log(2)/8,0], every backward prime target is included.  The q=2
# raw derivative is >1/2, every other prime derivative is positive, and the
# archimedean raw loss is <(17/8)(1/8)=17/64.  Thus the coordinate cumulative
# derivative is >15/(64 U'(X) C(X)).  Integrating over a coordinate interval
# of length U(log(2)/8)>3/2 gives the following wrong-sign mass.
wrong_sign_mass_lower = q(15, 64) / 40 * q(3, 2)

# From L U = -U/2-(1/4)tanh(x/2), the amount that has to be beaten is half
# of the reserve: c s'(X)/(2 U'(X)) < 1/576, using U'(X)>36.
half_reserve_upper = q(1, 576)
assert wrong_sign_mass_lower > half_reserve_upper


print("q2 raw n=1 lower enclosure:", q2_raw_n1)
print("arch derivative-kernel enclosure:", arch_derivative_kernel)
print("theta tail bounds (K,K',K''):", *tail_bounds)
print("U'(3 log(2)/4) enclosure:", UP_X)
print("U'(3 log(2)/4) C(3 log(2)/4) enclosure:", UP_X * C(X))
print("U(log(2)/8) termwise lower witness:", g_y_e)
print("wrong-sign mass lower bound:", wrong_sign_mass_lower)
print("half-reserve upper bound:", half_reserve_upper)
print("CERTIFIED: local d_U coarse curvature is strictly less than 1/2")


# -------------------------------------------------------------------------
# Phase-circle Abel embedding: a coupling-independent full-generator no-go.
# -------------------------------------------------------------------------
# Put B=7 log(2)/8.  On the whole interval [X,B], the same q=2 backward
# derivative beats the complete archimedean loss by more than 1/10.  We
# certify the uniform inequality by an exhaustive cover of 128 Arb balls.
B = q(7, 8) * LOG2
uniform_margin = q(1, 10)
cover_size = 128

for index in range(cover_size):
    left = X + (B - X) * index / cover_size
    right = X + (B - X) * (index + 1) / cover_size
    x_ball = arb((left + right) / 2, (right - left) / 2 + arb("1e-55"))
    reflected_distance = LOG2 - x_ball

    y = PI * (2 * reflected_distance).exp()
    k = (
        PI
        * (q(5, 2) * reflected_distance).exp()
        * (2 * y - 3)
        * (-y).exp()
    )
    logarithmic_derivative = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
    q2_n1 = (
        LOG2
        / SQRT2
        * k
        * (
            -logarithmic_derivative
            - q(1, 2) * (x_ball / 2).tanh()
        )
    )

    arch_kernel = J(x_ball) * (
        q(1, 2)
        + 2 / ((2 * x_ball).exp() - 1)
        + q(1, 2) * (x_ball / 2).tanh()
    )
    assert q2_n1 - arch_kernel / 8 > uniform_margin

assert C(B) < q(21, 20)


# The quantile map T_beta satisfies X<T_beta(X)<B.  Strict stochastic
# dominance gives the first inequality.  For the second, it is enough to
# prove
#
#   int_X^B exp(-u/2)K(u)du
#       > int_B^infinity (exp(u/2)-exp(-u/2))K(u)du.
#
# The left integrand is decreasing.  The negative logarithmic derivative of
# the right integrand is U(u)-coth(u/2)/2 and is increasing.  The following
# point bounds therefore give respectively a lower and an upper integral
# bound.  Four theta terms are enclosed, with the omitted tails bounded by
# the same geometric argument as above (now y_1>10).
K_B = arb(0)
KP_B = arb(0)
for n in range(1, 5):
    kn, kpn, _ = theta_term(B, n)
    K_B += kn
    KP_B += kpn

for power, factor in ((4, 500), (6, 11000)):
    first = arb(5) ** power * (-arb(10) * 25).exp()
    ratio = (arb(6) / 5) ** power * (-arb(10) * 11).exp()
    bound = factor * first / (1 - ratio)
    assert bound < arb("1e-60")

K_B += tail_error
KP_B += tail_error
U_B = -KP_B / K_B

left_endpoint_integrand = (-B / 2).exp() * K_B
right_endpoint_integrand = ((B / 2).exp() - (-B / 2).exp()) * K_B
right_decay_rate = U_B - q(1, 2) / (B / 2).tanh()

assert LOG2 / 8 > q(43, 500)
assert left_endpoint_integrand > q(49, 10000)
assert right_endpoint_integrand < q(21, 5000)
assert right_decay_rate > 14
assert q(43, 500) * q(49, 10000) > q(21, 5000) / 14


print("uniform q=2-minus-arch margin on [3 log(2)/4,7 log(2)/8]: > 1/10")
print("K(7 log(2)/8) enclosure:", K_B)
print("U(7 log(2)/8) enclosure:", U_B)
print("quantile left-integral lower bound:", q(43, 500) * q(49, 10000))
print("quantile right-integral upper bound:", q(21, 5000) / 14)
print("CERTIFIED: X < T_beta(X) < 7 log(2)/8")
print("CERTIFIED: every phase-circle Abel chord metric fails rate-1/2 contraction")
