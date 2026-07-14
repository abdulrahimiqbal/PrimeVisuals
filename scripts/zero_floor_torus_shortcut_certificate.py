#!/usr/bin/env python3
"""Exact certificate for a noncollapsed zero-floor shortcut metric.

Put ``ell = log(2)`` and

    alpha = pi*sqrt(2)/ell,       beta = pi*sqrt(3)/ell,
    Phi(x) = (cos(alpha*x), sin(alpha*x),
              cos(beta*x),  sin(beta*x)).

For the prime-power channel ``q=2^n`` give every edge
``z <-> z+n*ell`` the state-independent cost

    A_n = |Phi(z+n*ell)-Phi(z)|
        = 2*sqrt(sin(pi*n*sqrt(2)/2)^2
                 + sin(pi*n*sqrt(3)/2)^2).

Give every other prime-power edge its U-path cost.  The notes accompanying
this certificate prove that all A_n are positive, inf_n A_n=0 by Kronecker,
and the resulting intrinsic metric d is separating because
``d(x,y) >= |Phi(x)-Phi(y)|`` and Phi is injective.

This script certifies a strict failure of rate-1/2 W_1 curvature.  With
``h=ell/2``, ``A=A_1``, take the unit torus functional

    f(x) = [2 sin(pi sqrt(2)/2) sin(alpha*x)
            +2 sin(pi sqrt(3)/2) sin(beta*x)] / A.

It is 1-Lipschitz for d and satisfies
``f(h)-f(-h)=d(-h,h)=A``.  Reflection gives the exact generator defect

    Lf(h)-Lf(-h)+A/2 = 2 Lf(h)+A/2.

All finite calculations below use Arb intervals.  The theta, spatial, and
prime-power tails are bounded analytically; no sampled sign or grid
extrapolation is used.

Run with, for example,

    PYTHONPATH=/tmp/pvdeps \
      python3 scripts/zero_floor_torus_shortcut_certificate.py
"""

from flint import arb, ctx


ctx.prec = 180


def rat(p: int, q: int = 1) -> arb:
    return arb(p) / q


PI = arb.pi()
LOG2 = arb(2).log()
SQRT2 = arb(2).sqrt()
SQRT3 = arb(3).sqrt()
SQRT5 = arb(5).sqrt()
HALF = LOG2 / 2
ALPHA = PI * SQRT2 / LOG2
BETA = PI * SQRT3 / LOG2
PHI_SPEED = PI * SQRT5 / LOG2

# This is the only input from the already-certified global theta geometry:
# U'(x)>18.  The elementary rational comparisons below independently show
# that the torus curve has speed below 11, hence below U'.
assert PI < rat(22, 7)
assert SQRT5 < rat(9, 4)
assert LOG2 > rat(69, 100)
assert PHI_SPEED < 11


# For x>=0, the first four positive theta summands enclose K.  The omitted
# n>=5 tails are bounded just as in the constant-shortcut certificate.
THETA_TAILS = []
for power, factor in ((4, 20), (6, 125), (8, 1000)):
    first = factor * arb(5) ** power * (-arb(3) * 25).exp()
    ratio = (arb(6) / 5) ** power * (-arb(3) * 11).exp()
    THETA_TAILS.append(first / (1 - ratio))

assert THETA_TAILS[0] < arb("1e-28")
assert THETA_TAILS[1] < arb("1e-26")
assert THETA_TAILS[2] < arb("1e-23")


def k_triplet_nonnegative(x: arb) -> tuple[arb, arb, arb]:
    """Return rigorous K,K',K'' enclosures for a nonnegative Arb x."""
    k_sum = arb(0)
    kp_sum = arb(0)
    kpp_sum = arb(0)
    for n in range(1, 5):
        y = PI * n * n * (2 * x).exp()
        k = (
            PI
            * n
            * n
            * (rat(5, 2) * x).exp()
            * (2 * y - 3)
            * (-y).exp()
        )
        logarithmic_derivative = rat(5, 2) + 4 * y / (2 * y - 3) - 2 * y
        minus_logarithmic_derivative_prime = (
            4 * y + 24 * y / (2 * y - 3) ** 2
        )
        k_sum += k
        kp_sum += k * logarithmic_derivative
        kpp_sum += k * (
            logarithmic_derivative**2
            - minus_logarithmic_derivative_prime
        )
    return (
        k_sum + arb(0, THETA_TAILS[0]),
        kp_sum + arb(0, THETA_TAILS[1]),
        kpp_sum + arb(0, THETA_TAILS[2]),
    )


def K(x: arb) -> arb:
    """Use the exact evenness K(-x)=K(x)."""
    return k_triplet_nonnegative(abs(x))[0]


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(x: arb) -> arb:
    return (-x / 2).exp() / (1 - (-2 * x).exp())


def interval_ball(left: arb, right: arb) -> arb:
    return arb(
        (left + right) / 2,
        (right - left) / 2 + arb("1e-50"),
    )


def geometric_enclosure(
    function,
    epsilon: arb,
    endpoint: arb,
    ratio: arb = rat(1001, 1000),
) -> arb:
    """Enclose an integral on [epsilon,endpoint] in geometric cells."""
    current = epsilon
    total = arb(0)
    while current < endpoint:
        following = current * ratio
        if following > endpoint:
            following = endpoint
        total += (
            function(interval_ball(current, following))
            * (following - current)
        )
        current = following
    return total


def riemann_enclosure(function, left: arb, right: arb, pieces: int) -> arb:
    """Enclose a regular finite integral by interval Riemann cells."""
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        cell_left = left + index * width
        cell_right = cell_left + width
        total += function(interval_ball(cell_left, cell_right)) * width
    return total


def single_theta_decay(x: arb) -> arb:
    """Positive logarithmic decay of every theta summand at x."""
    y = PI * (2 * x).exp()
    return 2 * y - rat(5, 2) - 4 * y / (2 * y - 3)


S2 = (PI * SQRT2 / 2).sin()
S3 = (PI * SQRT3 / 2).sin()
A = 2 * (S2**2 + S3**2).sqrt()


def contact(x: arb) -> arb:
    return (
        2 * S2 * (ALPHA * x).sin()
        + 2 * S3 * (BETA * x).sin()
    ) / A


assert A > 0
# Algebraically sin(alpha*h)=S2 and sin(beta*h)=S3, so these endpoint
# values are exact.  The direct interval evaluations are retained as an
# independent consistency check, while using the simplified expression
# avoids dependency widening in the generator integral.
assert (contact(HALF) - A / 2).contains(0)
assert (contact(-HALF) + A / 2).contains(0)
F_HALF = A / 2


# -------------------------------------------------------------------------
# Archimedean generator contribution at h=log(2)/2.
# -------------------------------------------------------------------------

ARCH_EPSILON = rat(1, 10**9)
ARCH_CUTOFF = arb(3)


def arch_side(distance: arb, direction: int) -> arb:
    y = HALF + direction * distance
    return (
        J(distance)
        * K(y)
        * (contact(y) - F_HALF)
        / C(HALF)
    )


arch = geometric_enclosure(
    lambda r: arch_side(r, -1),
    ARCH_EPSILON,
    HALF + ARCH_CUTOFF,
)
arch += geometric_enclosure(
    lambda r: arch_side(r, +1),
    ARCH_EPSILON,
    ARCH_CUTOFF - HALF,
)

# For 0<r<=epsilon, J(r)<1/r because
# 1-e^(-2r)>=2r e^(-2r) and e^(3r/2)<2.  The contact derivative has absolute
# value at most |Phi'|.  Direct interval evaluation encloses K in the two
# omitted neighborhoods.
assert (rat(3, 2) * ARCH_EPSILON).exp() < 2
near_k = K(interval_ball(HALF - ARCH_EPSILON, HALF + ARCH_EPSILON))
arch_near_error = (
    2 * ARCH_EPSILON * PHI_SPEED * near_k / C(HALF)
)

# On |y|>=3, both source distances exceed 3-h, J<1, and each positive theta
# summand decays at rate >100.  Also |f(y)-f(h)|<=2sqrt(2)<3.
assert J(ARCH_CUTOFF - HALF) < 1
assert single_theta_decay(ARCH_CUTOFF) > 100
arch_far_error = 6 * K(ARCH_CUTOFF) / (100 * C(HALF))
arch += arb(0, arch_near_error + arch_far_error)


# -------------------------------------------------------------------------
# Prime generator contribution.  Evaluate q=2,3 and enclose every q>=4 by
# an integer overcount.
# -------------------------------------------------------------------------


def prime_term(q: int, von_mangoldt: arb) -> arb:
    log_q = arb(q).log()
    coefficient = von_mangoldt / arb(q).sqrt()
    return coefficient * (
        K(HALF + log_q) * (contact(HALF + log_q) - F_HALF)
        + K(HALF - log_q) * (contact(HALF - log_q) - F_HALF)
    ) / C(HALF)


prime = prime_term(2, LOG2) + prime_term(3, arb(3).log())

# For q>=4, Lambda(q)/sqrt(q)<=1.  At r0=log(4)-h each theta summand has
# logarithmic decay >10, so
#
#   sum_{n>=4} K(log(n)-h)
#       <= K(r0) sum_{n>=4}(4/n)^10 < (13/9)K(r0).
#
# The outgoing K(h+log n) is smaller.  With |Delta f|<3, this bounds both
# orientations and overcounts all prime powers by all integers.
tail_argument = arb(4).log() - HALF
assert single_theta_decay(tail_argument) > 10
# Integral comparison gives
# sum_{n>=5}(4/n)^10 <= (14/9)(4/5)^10 < 4/9.
assert 1 + rat(14, 9) * rat(4, 5) ** 10 < rat(13, 9)
prime_tail_error = rat(26, 3) * K(tail_argument) / C(HALF)
prime += arb(0, prime_tail_error)


# Reflection commutes with L and f is odd, so the displayed expression is
# exactly Lf(h)-Lf(-h)+d(-h,h)/2.
defect = 2 * (arch + prime) + A / 2
assert defect > rat(4, 25)


print("torus speed enclosure:", PHI_SPEED)
print("q=2 shortcut cost A_1:", A)
print("arch contribution L_A f(h):", arch)
print("prime contribution L_P f(h):", prime)
print("arch near/far errors:", arch_near_error, arch_far_error)
print("prime q>=4 tail error:", prime_tail_error)
print("two-endpoint rate-1/2 defect:", defect)
print("CERTIFIED: separating zero-floor torus metric fails sharp W1 curvature")


# -------------------------------------------------------------------------
# Uniform small-phase band used by the infinite-torus character barrier.
# -------------------------------------------------------------------------
#
# For a single circle whose phase advance under x -> x+log(2) is 2*pi*omega,
# the odd unit-chord contact at +/-h is
#
#     g_omega(x)=sin(2*pi*omega*x/log(2)) / (2 sin(pi*omega)).
#
# The following interval contains every phase in the explicit infinite-torus
# construction
#
#   omega_j = 1/100 + 10^(-(j+30))*sqrt(p_j),  j>=1,
#
# where p_j is the j-th prime.  It certifies uniformly that the canonical
# q=2 Hilbert-chord contact has the *right* curvature sign (strictly negative
# defect), so the finite-character barrier is not hiding another q=2 copy of
# the positive contact above.

OMEGA_BAND = arb(rat(1, 100), arb("1e-28"))
BAND_T = 2 * PI * OMEGA_BAND / LOG2
BAND_HALF_VALUE = rat(1, 2)


def band_contact(x: arb) -> arb:
    return (BAND_T * x).sin() / (2 * (BAND_T * HALF).sin())


def band_arch_side(distance: arb, direction: int) -> arb:
    y = HALF + direction * distance
    return (
        J(distance)
        * K(y)
        * (band_contact(y) - BAND_HALF_VALUE)
        / C(HALF)
    )


band_arch = geometric_enclosure(
    lambda r: band_arch_side(r, -1),
    ARCH_EPSILON,
    HALF + ARCH_CUTOFF,
)
band_arch += geometric_enclosure(
    lambda r: band_arch_side(r, +1),
    ARCH_EPSILON,
    ARCH_CUTOFF - HALF,
)

band_derivative_bound = BAND_T / (2 * (BAND_T * HALF).sin())
band_value_difference_bound = 1 / (2 * (BAND_T * HALF).sin()) + rat(1, 2)
band_near_error = (
    2 * ARCH_EPSILON * band_derivative_bound * near_k / C(HALF)
)
band_far_error = (
    2
    * band_value_difference_bound
    * K(ARCH_CUTOFF)
    / (100 * C(HALF))
)
band_arch += arb(0, band_near_error + band_far_error)


def band_prime_term(q: int, von_mangoldt: arb) -> arb:
    log_q = arb(q).log()
    coefficient = von_mangoldt / arb(q).sqrt()
    return coefficient * (
        K(HALF + log_q)
        * (band_contact(HALF + log_q) - BAND_HALF_VALUE)
        + K(HALF - log_q)
        * (band_contact(HALF - log_q) - BAND_HALF_VALUE)
    ) / C(HALF)


band_prime = band_prime_term(2, LOG2) + band_prime_term(3, arb(3).log())
band_prime_tail_error = (
    2
    * rat(13, 9)
    * band_value_difference_bound
    * K(tail_argument)
    / C(HALF)
)
band_prime += arb(0, band_prime_tail_error)

band_defect = 2 * (band_arch + band_prime) + rat(1, 2)
assert band_defect < -rat(1, 5000)

# The opposite-tail reset sine moment is
#
#   M(t)=2 int_R exp(-y/2)K(y)sin(ty)dy
#       =-4 int_0^infinity K(y)sinh(y/2)sin(ty)dy.
#
# It controls every remote dyadic-edge character defect.  On [0,3] its
# integrand has one strict sign throughout the phase band.  Beyond 3, K has
# logarithmic decay >100 and exp(y/2) loses only 1/2 from that rate.
assert BAND_T * ARCH_CUTOFF < PI


def reset_moment_integrand(y: arb) -> arb:
    return -4 * K(y) * (y / 2).sinh() * (BAND_T * y).sin()


reset_moment = riemann_enclosure(
    reset_moment_integrand,
    arb(0),
    ARCH_CUTOFF,
    8192,
)
reset_tail_error = (
    2 * K(ARCH_CUTOFF) * (ARCH_CUTOFF / 2).exp() / rat(199, 2)
)
reset_moment += arb(0, reset_tail_error)
assert reset_moment < -rat(1, 1000)

# For the remote-edge argument, Kronecker aligns the first six phases so
# sin(pi*n*omega_j)<=-1/2.  Their reset contribution is at least H/2000;
# the uncontrolled Hilbert tail costs at most T/2 because beta^+ has mass
# 1/2.  This exact positive number is the limiting numerator before the
# harmless factor 4/a_n.
remote_head_weight = sum((rat(1, 4) ** j for j in range(1, 7)), arb(0))
remote_tail_weight = rat(1, 3) * rat(1, 4) ** 6
remote_reset_numerator = remote_head_weight / 2000 - remote_tail_weight / 2
assert remote_reset_numerator > rat(0)

print("uniform omega band:", OMEGA_BAND)
print(
    "uniform small-phase q=2 defect bounds:",
    band_defect.lower(),
    band_defect.upper(),
)
print("uniform opposite-tail reset sine moment:", reset_moment)
print("remote aligned reset-numerator lower bound:", remote_reset_numerator)
print("CERTIFIED: every phase in the infinite-torus band has q=2 defect < -1/5000")
