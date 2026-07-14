#!/usr/bin/env python3
"""Arb certificate for the universal even-feature reflection countercontact.

This proves that every metric d satisfying

    d >= |U(x)-U(y)|,       d(-x,x)=2U(x)  (x>0)

fails the rate-1/2 full-generator contraction test.  In particular this
includes every Euclidean chord (or max) embedding obtained by adjoining any
bounded even scalar or vector feature to U, for every positive scale.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 scripts/even_feature_reflection_certificate.py
"""

from flint import arb, ctx


ctx.prec = 160


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


LOG2 = arb(2).log()
PI = arb.pi()
SQRT2 = arb(2).sqrt()

X = LOG2 / 4
A = LOG2 / 2
B = 3 * LOG2 / 4
OUTWARD_TWO = 5 * LOG2 / 4
TAIL_START = arb(1)


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(x: arb) -> arb:
    return (-x / 2).exp() / (1 - (-2 * x).exp())


# Arb radius rounding pads the integration cells slightly.  Uniformly on the
# explicitly certified padded interval [1/3,101/100], y_1=pi exp(2x) lies in
# (6,24), and exp(5x/2)<13.  Hence, for n>=5,
#
#   k_n       <= 2500 n^4 exp(-6n^2),
#   |k_n'|    <= 120000 n^6 exp(-6n^2).
#
# Consecutive majorants have ratio at most (6/5)^m exp(-66).
PADDED_LEFT = q(1, 3)
PADDED_RIGHT = q(101, 100)
assert A > PADDED_LEFT
assert TAIL_START < PADDED_RIGHT
assert PI * (2 * PADDED_LEFT).exp() > 6
assert PI * (2 * PADDED_RIGHT).exp() < 24
assert (q(5, 2) * PADDED_RIGHT).exp() < 13

for power, factor in ((4, 2500), (6, 120000)):
    first = arb(5) ** power * (-arb(6) * 25).exp()
    ratio = (arb(6) / 5) ** power * (-arb(6) * 11).exp()
    bound = factor * first / (1 - ratio)
    assert bound < arb("1e-40")

TAIL_ERROR = arb(0, "1e-40")


def k_and_k_prime(x: arb) -> tuple[arb, arb]:
    """Rigorous K,K' enclosure on the padded interval [1/3,101/100]."""
    k_sum = arb(0)
    kp_sum = arb(0)
    for n in range(1, 5):
        y = PI * n * n * (2 * x).exp()
        k = PI * n * n * (q(5, 2) * x).exp() * (2 * y - 3) * (-y).exp()
        logarithmic_derivative = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
        k_sum += k
        kp_sum += k * logarithmic_derivative
    return k_sum + TAIL_ERROR, kp_sum + TAIL_ERROR


K_A, KP_A = k_and_k_prime(A)
K_B, KP_B = k_and_k_prime(B)
K_OUT, _ = k_and_k_prime(OUTWARD_TWO)

U_A = -KP_A / K_A
U_B = -KP_B / K_B
PLATEAU = 2 * (U_B - U_A)


# At X=log(2)/4 the q=2 backward and outward targets have absolute values B
# and 5log(2)/4.  Both lie on the plateau of the odd correction.  Therefore
# the normalized q=2 contribution is the expression below.  Every q>=3 term
# is nonnegative because both targets also lie on the same plateau and K is
# strictly decreasing on the positive half-line.
q2_lower = (
    LOG2
    / SQRT2
    * PLATEAU
    * (K_B - K_OUT)
    / C(X)
)
assert q2_lower > q(3, 25)


# Bound the complete archimedean loss
#
#   int_A^infinity m(u)K(u)[J(u-X)-J(u+X)]du / C(X),
#
# where m(u)=2(U(u)-U(A)) on [A,B] and m(u)=PLATEAU thereafter.
# We upper-bound the raw integral (dropping 1/C(X)<1) by rigorous interval
# Riemann enclosures on [A,B] and [B,1].  On the transition interval,
# mK=-2K'-2U(A)K, so no division by an interval theta sum is needed.
def interval_ball(left: arb, right: arb) -> arb:
    return arb(
        (left + right) / 2,
        (right - left) / 2 + arb("1e-38"),
    )


def integral_enclosure(left: arb, right: arb, pieces: int, transition: bool) -> arb:
    enclosure = arb(0)
    for index in range(pieces):
        cell_left = left + (right - left) * index / pieces
        cell_right = left + (right - left) * (index + 1) / pieces
        u = interval_ball(cell_left, cell_right)
        k, kp = k_and_k_prime(u)
        kernel_difference = J(u - X) - J(u + X)
        if transition:
            m_times_k = -2 * kp - 2 * U_A * k
        else:
            m_times_k = PLATEAU * k
        enclosure += m_times_k * kernel_difference * (cell_right - cell_left)
    return enclosure


transition_integral = integral_enclosure(A, B, 512, True)
plateau_integral = integral_enclosure(B, TAIL_START, 512, False)


# For u>=1, monotonicity of U and the exponential-series representation of J
# give
#
#   K(u) <= K(1) exp(-U(1)(u-1)),
#   J(u-X) <= J(1-X) exp(-(u-1)/2).
K_ONE, KP_ONE = k_and_k_prime(TAIL_START)
U_ONE = -KP_ONE / K_ONE
tail_integral = (
    PLATEAU
    * K_ONE
    * J(TAIL_START - X)
    / (U_ONE + q(1, 2))
)

arch_raw_upper = transition_integral + plateau_integral + tail_integral
assert arch_raw_upper < q(13, 200)


# The baseline U contributes -(1/4)tanh(X/2) after adding U(X)/2 to LU(X).
reserve = q(1, 4) * (X / 2).tanh()
assert reserve < q(11, 500)


# Thus, for the explicit odd contact potential described in the accompanying
# proof, F(X)=Lf(X)+U(X)/2 has a completely rational positive lower bound.
single_endpoint_defect_lower = q(33, 1000)


print("U(log(2)/2) enclosure:", U_A)
print("U(3log(2)/4) enclosure:", U_B)
print("plateau height enclosure:", PLATEAU)
print("normalized q=2 lower enclosure:", q2_lower)
print("arch transition enclosure:", transition_integral)
print("arch plateau enclosure:", plateau_integral)
print("arch tail enclosure:", tail_integral)
print("complete raw arch upper enclosure:", arch_raw_upper)
print("baseline reserve enclosure:", reserve)
print("single-endpoint defect lower bound:", single_endpoint_defect_lower)
print("reflection-pair generator defect lower bound:", 2 * single_endpoint_defect_lower)
print("CERTIFIED: every even-feature reflection-preserving metric fails")
