#!/usr/bin/env python3
"""Rigorous no-go certificate for the rate-calibrated shortcut family.

For every prime power q=p^k, put l_q=log(q), c_q=Lambda(q)/sqrt(q),

    R_q(x) = c_q [K(x+l_q)/C(x) + K(x)/C(x+l_q)],

and give the undirected edge x<->x+l_q the cost

    a_q(x) = min(U(x+l_q)-U(x), a0/(1+alpha R_q(x))),

where a0>0 and alpha>=0.  This script certifies the finite analytic facts
which, together with ``constant_shortcut_metric_certificate.py``, exclude
rate-1/2 W1 curvature for every parameter pair (a0,alpha).

The proof split is parameter-free:

1. U'(x)>18 globally, so every U-increment is >18 log(2)>7.
2. The global maximum of R_q(x), over every prime power and every x, occurs
   in the q=3 channel.  A maximizing representative x_* can be chosen in
   [-1/50,0].
3. On every q=3 edge with x in [-1/50,0], one fixed U-ramp contact has
   positive normalized generator defect.  Its required U-width is larger
   than the threshold R_*=U(7log(2)/8)-U(5log(2)/8)<7.
4. If the actual uniform edge floor b is below R_*, the rate term determines
   b and the q=3 edge at x_* has cost exactly b; scaling the ramp by b gives
   a saturating global metric contact.  If b>=R_*, the bounded folded contact
   certified by ``constant_shortcut_metric_certificate.py`` applies using
   only the lower bound on all edge costs.

All compact, infinite-theta, infinite-prime, and infinite-integral claims
used here are enclosed by Arb intervals.  The last parameter split is exact
algebra and does not sample (a0,alpha).

Run with, for example,

    PYTHONPATH=/tmp/pvdeps python3 scripts/rate_calibrated_shortcut_certificate.py
"""

from flint import arb, ctx


ctx.prec = 160


def rat(p: int, q: int = 1) -> arb:
    return arb(p) / q


PI = arb.pi()
LOG2 = arb(2).log()
LOG3 = arb(3).log()


# Uniform n>=5 tails for K and its first two derivatives on x>=0.
THETA_TAILS = []
for power, factor in ((4, 20), (6, 125), (8, 1000)):
    first = factor * arb(5) ** power * (-arb(3) * 25).exp()
    ratio = (arb(6) / 5) ** power * (-arb(3) * 11).exp()
    THETA_TAILS.append(first / (1 - ratio))

assert THETA_TAILS[0] < arb("1e-28")
assert THETA_TAILS[1] < arb("1e-26")
assert THETA_TAILS[2] < arb("1e-23")


def k_triplet(x: arb) -> tuple[arb, arb, arb]:
    """Rigorous K,K',K'' enclosures on a nonnegative Arb interval."""
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


def k_u(x: arb) -> tuple[arb, arb]:
    k, kp, _ = k_triplet(x)
    return k, -kp / k


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(x: arb) -> arb:
    return (-x / 2).exp() / (1 - (-2 * x).exp())


def interval_ball(left: arb, right: arb) -> arb:
    return arb(
        (left + right) / 2,
        (right - left) / 2 + arb("1e-40"),
    )


def riemann_enclosure(function, left: arb, right: arb, pieces: int) -> arb:
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        cell_left = left + index * width
        cell_right = cell_left + width
        total += function(interval_ball(cell_left, cell_right)) * width
    return total


def single_theta_decay(x: arb) -> arb:
    y = PI * (2 * x).exp()
    return 2 * y - rat(5, 2) - 4 * y / (2 * y - 3)


# -------------------------------------------------------------------------
# A global lower bound U'>18.
# -------------------------------------------------------------------------

compact_minimum_u_prime = None
for index in range(4096):
    z = interval_ball(LOG2 * index / 4096, LOG2 * (index + 1) / 4096)
    k, kp, kpp = k_triplet(z)
    u_prime = (kp / k) ** 2 - kpp / k
    assert u_prime > 18
    if compact_minimum_u_prime is None or u_prime.lower() < compact_minimum_u_prime:
        compact_minimum_u_prime = u_prime.lower()

# For z>=log(2), put y=pi exp(2z)>=4pi and
#
#   g(y)=2y-5/2-4y/(2y-3),   h(y)=4y+24y/(2y-3)^2.
#
# If w_n are the normalized positive theta summands, then
#
#   U=E_w g,   U'=E_w h-Var_w(g).
#
# The following exact estimates are the termwise/variance proof of
# U'>2U on this whole half-line.  They are the same tail inequalities used
# independently in ``path_metric_farkas_certificate.py``.
y0 = 4 * PI
first_weight = rat(8, 7) * 2**4 * (-3 * y0).exp()
weight_ratio = (rat(3, 2)) ** 4 * (-5 * y0).exp()
epsilon_weight = first_weight / (1 - weight_ratio)
variance_first = rat(32, 7) * y0**2 * 2**8 * (-3 * y0).exp()
variance_ratio = (rat(3, 2)) ** 8 * (-5 * y0).exp()
variance_bound = variance_first / (1 - variance_ratio)
first_difference = (
    5
    + 8 * y0 / (2 * y0 - 3)
    + 24 * y0 / (2 * y0 - 3) ** 2
)
assert first_difference / (1 + epsilon_weight) - variance_bound > 0
# More directly, h(y)-2g(y)>9 for every y>=y0; the following is the
# uniform lower bound actually needed after subtracting the variance.
assert 9 / (1 + epsilon_weight) - variance_bound > 0

# The quoted tail bounds use monotonicity of the elementary rational
# functions after y0.  These polynomial assertions certify it.
tail_polynomial = 16 * y0**3 - 228 * y0**2 + 360 * y0 - 225
tail_polynomial_prime = 48 * y0**2 - 456 * y0 + 360
assert tail_polynomial > 0
assert tail_polynomial_prime > 0
assert 96 * y0 - 456 > 0

_, u_at_log2 = k_u(LOG2)
assert u_at_log2 > 9
# Therefore U'>18 on z>=log(2) as well.  Evenness of K makes U' even.
assert 18 * LOG2 > 7


# -------------------------------------------------------------------------
# The global endpoint-rate maximum is in the q=3 channel near zero.
# -------------------------------------------------------------------------

def endpoint_rate(x: arb, length: arb, coefficient: arb) -> arb:
    """R_q(x) on the symmetric half x in [-length/2,0]."""
    return coefficient * (
        k_triplet(x + length)[0] / C(x)
        + k_triplet(-x)[0] / C(x + length)
    )


q3_coefficient = LOG3 / arb(3).sqrt()
rate_witness = endpoint_rate(-rat(1, 75), LOG3, q3_coefficient)

# Reflection x -> -x-length leaves R_q invariant.  On x>=0 both summands
# decrease because U>0 and tanh>0.  Hence it suffices to enclose
# [-length/2,0].  All prime powers below 11 other than 3 are listed here.
finite_channels = (
    (2, LOG2, LOG2 / arb(2).sqrt()),
    (4, arb(4).log(), LOG2 / 2),
    (5, arb(5).log(), arb(5).log() / arb(5).sqrt()),
    (7, arb(7).log(), arb(7).log() / arb(7).sqrt()),
    (8, arb(8).log(), LOG2 / arb(8).sqrt()),
    (9, arb(9).log(), LOG3 / 3),
)

finite_rate_uppers = {}
for channel, length, coefficient in finite_channels:
    maximum_upper = None
    for index in range(2048):
        left = -length / 2 + length * index / 4096
        right = -length / 2 + length * (index + 1) / 4096
        value = endpoint_rate(
            interval_ball(left, right),
            length,
            coefficient,
        )
        if maximum_upper is None or value.upper() > maximum_upper:
            maximum_upper = value.upper()
    assert maximum_upper < rate_witness
    finite_rate_uppers[channel] = maximum_upper

# For q>=11, Lambda(q)/sqrt(q)<3/4.  If endpoints u,v are length l apart,
# either both have absolute value >=l/4, or one has absolute value <l/4 and
# the other has absolute value >3l/4.  Monotonicity of K and C then gives
# respectively
#
#   K(u)/C(v)+K(v)/C(u) <= 2K(l/4),
#   K(u)/C(v)+K(v)/C(u) <= K(0)/C(3l/4)+K(3l/4).
#
# Both bounds decrease with l, so l=log(11) is the worst endpoint.
log11 = arb(11).log()
large_channel_bound_1 = rat(3, 4) * 2 * k_triplet(log11 / 4)[0]
large_channel_bound_2 = rat(3, 4) * (
    k_triplet(arb(0))[0] / C(3 * log11 / 4)
    + k_triplet(3 * log11 / 4)[0]
)
assert large_channel_bound_1 < rate_witness
assert large_channel_bound_2 < rate_witness

# Locate every maximizing representative in the symmetric q=3 half inside
# I=[-1/50,0].  The exhaustive enclosure below handles the complementary
# compact interval; monotonicity handles x>=0.
outside_upper = None
outside_right = -rat(1, 50)
for index in range(16384):
    left = -LOG3 / 2 + (outside_right + LOG3 / 2) * index / 16384
    right = -LOG3 / 2 + (outside_right + LOG3 / 2) * (index + 1) / 16384
    value = endpoint_rate(
        interval_ball(left, right),
        LOG3,
        q3_coefficient,
    )
    if outside_upper is None or value.upper() > outside_upper:
        outside_upper = value.upper()
assert outside_upper < rate_witness
assert endpoint_rate(arb(0), LOG3, q3_coefficient) < rate_witness


# -------------------------------------------------------------------------
# A uniform countercontact on every possible q=3 maximizing edge.
# -------------------------------------------------------------------------

RAMP_START = LOG2 / 3
RAMP_END = 17 * LOG2 / 24
_, u_start = k_u(RAMP_START)
_, u_end = k_u(RAMP_END)
ramp_width = u_end - u_start

# This is the large-floor threshold from the companion certificate.
_, u_floor_left = k_u(5 * LOG2 / 8)
_, u_floor_right = k_u(7 * LOG2 / 8)
floor_threshold = u_floor_right - u_floor_left
assert floor_threshold < 7
assert ramp_width > floor_threshold


def ramp_value(z: arb) -> arb:
    return (k_u(z)[1] - u_start) / ramp_width


def contact_arch_difference(x: arb, pieces: int = 1024) -> arb:
    """L_arch F(x+log3)-L_arch F(x), uniformly for an x interval."""
    y = x + LOG3
    c_x = C(x)
    c_y = C(y)

    # Negative z=-r and 0<=z<=RAMP_START: F(z)=0, so only the target
    # source y contributes, with F(y)=1.
    negative = riemann_enclosure(
        lambda r: -k_triplet(r)[0] * J(y + r) / c_y,
        arb(0),
        arb(3),
        pieces,
    )
    central_zero = riemann_enclosure(
        lambda z: -k_triplet(z)[0] * J(y - z) / c_y,
        arb(0),
        RAMP_START,
        pieces // 2,
    )

    # On the ramp, both source terms are present.  There are no singularities:
    # x<=0<RAMP_START and y>=log(3)-1/50>RAMP_END.
    ramp = riemann_enclosure(
        lambda z: k_triplet(z)[0]
        * (
            J(y - z) * (ramp_value(z) - 1) / c_y
            - J(z - x) * ramp_value(z) / c_x
        ),
        RAMP_START,
        RAMP_END,
        pieces,
    )

    # For z>=RAMP_END, F(z)=1, so only the source x contributes.
    positive = riemann_enclosure(
        lambda z: -k_triplet(z)[0] * J(z - x) / c_x,
        RAMP_END,
        arb(3),
        pieces,
    )

    # On both omitted |z|>=3 tails, J<1.  Every theta summand decays at
    # logarithmic rate >100 after 3.
    assert J(arb(3)) < 1
    assert single_theta_decay(arb(3)) > 100
    tail_error = 2 * k_triplet(arb(3))[0] / 100
    return negative + central_zero + ramp + positive + arb(0, tail_error)


def contact_prime_difference(x: arb) -> tuple[arb, arb]:
    """Prime contribution, with q>=7 enclosed by an absolute tail."""
    y = x + LOG3
    c_x = C(x)
    c_y = C(y)

    # q=2: the target's backward endpoint lies inside the ramp.
    z2 = y - LOG2
    q2 = LOG2 / arb(2).sqrt() * (
        k_triplet(z2)[0] * (ramp_value(z2) - 1) / c_y
        - k_triplet(x + LOG2)[0] / c_x
    )

    # q=3 is exactly minus the symmetric endpoint rate.
    q3 = -q3_coefficient * (
        k_triplet(-x)[0] / c_y
        + k_triplet(y)[0] / c_x
    )

    # For q=4 and 5, the source's forward endpoint has value one and the
    # target's backward endpoint has value zero.
    log4 = arb(4).log()
    q4 = -LOG2 / 2 * (
        k_triplet(x + log4)[0] / c_x
        + k_triplet(log4 - y)[0] / c_y
    )
    log5 = arb(5).log()
    q5 = -log5 / arb(5).sqrt() * (
        k_triplet(x + log5)[0] / c_x
        + k_triplet(log5 - y)[0] / c_y
    )

    # For every q>=7, Lambda(q)/sqrt(q)<=1.  Both nonzero orientations are
    # bounded by K(log(q)-log(3)); overcount prime powers by all integers and
    # use sum_(n>=7)(7/n)^10 < 16/9.
    prime_tail_argument = arb(7).log() - LOG3
    assert single_theta_decay(prime_tail_argument) > 10
    tail_error = rat(32, 9) * k_triplet(prime_tail_argument)[0]
    return q2 + q3 + q4 + q5 + arb(0, tail_error), tail_error


minimum_contact_defect = None
for index in range(16):
    left = -rat(1, 50) + rat(1, 50) * index / 16
    right = -rat(1, 50) + rat(1, 50) * (index + 1) / 16
    x = interval_ball(left, right)
    arch = contact_arch_difference(x)
    prime, prime_error = contact_prime_difference(x)
    defect = rat(1, 2) + arch + prime
    assert defect > 0
    if minimum_contact_defect is None or defect.lower() < minimum_contact_defect:
        minimum_contact_defect = defect.lower()


print("compact U' minimum lower endpoint:", compact_minimum_u_prime)
print("global q=3 rate witness:", rate_witness)
for channel in sorted(finite_rate_uppers):
    print("finite-channel upper", channel, finite_rate_uppers[channel])
print("q>=11 endpoint-rate bounds:", large_channel_bound_1, large_channel_bound_2)
print("q=3 outside-I upper:", outside_upper)
print("large-floor threshold:", floor_threshold)
print("small-floor ramp U-width:", ramp_width)
print("uniform q=3 contact defect lower endpoint:", minimum_contact_defect)
print("CERTIFIED: every rate-calibrated shortcut metric fails rate 1/2")
