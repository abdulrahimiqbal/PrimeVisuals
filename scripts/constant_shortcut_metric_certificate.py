#!/usr/bin/env python3
"""Arb certificate excluding every constant-cost prime-shortcut metric.

Put ``ell_q = log(q)`` for prime powers q and let ``d_a`` be the intrinsic
metric obtained from the U-path metric by adjoining every undirected edge

    z <--> z + ell_q

with the same cost ``a > 0``.  This script certifies two explicit
Kantorovich contacts.

* If ``a <= 8``, use the q=2 edge from ``-log(2)/2`` to ``log(2)/2`` and
  the cubic smoothstep contact.  Its range is [0,a], its U-slope is at most
  one, and its generator defect is strictly positive.

* More generally, if every (possibly state- and channel-dependent) shortcut
  cost is at least ``R``, where

      R = U(7 log(2)/8) - U(5 log(2)/8) < 7,

  use a bounded folded U-contact of oscillation R and the ordinary pair
  ``(3 log(2)/4, 13 log(2)/16)``.  The contact equals U plus a constant on
  this pair, the U-distance of the pair is below R, and its generator
  defect is strictly positive.

For constant costs, R < 7 < 8 makes the two cases cover every a > 0.  The
second case is also the universal positive-floor theorem used by
``rate_calibrated_shortcut_certificate.py``.  All displayed comparisons
are Arb interval comparisons.  Infinite theta, archimedean, and prime-power
tails are bounded explicitly below; no sampled-to-continuum extrapolation is
used.

Run, for example, with

    PYTHONPATH=/tmp/pvdeps python3 scripts/constant_shortcut_metric_certificate.py
"""

from flint import arb, ctx


ctx.prec = 160


def rat(p: int, q: int = 1) -> arb:
    return arb(p) / q


PI = arb.pi()
LOG2 = arb(2).log()


# For x >= 0, write K as its positive theta expansion.  Uniformly for
# x >= 0 and n >= 5, the summands and their first two derivatives are at
# most 20 n^4 exp(-3n^2), 125 n^6 exp(-3n^2), and
# 1000 n^8 exp(-3n^2), respectively.  Consecutive majorants decrease by
# the ratios used here.
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
    if not right > left:
        return arb(0)
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        cell_left = left + index * width
        cell_right = cell_left + width
        total += function(interval_ball(cell_left, cell_right)) * width
    return total


def geometric_enclosure(
    function,
    epsilon: arb,
    endpoint: arb,
    ratio: arb = rat(101, 100),
) -> arb:
    """Integrate in a positive distance variable using geometric cells."""
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


def single_theta_decay(x: arb) -> arb:
    """The positive logarithmic decay of every theta summand at x."""
    y = PI * (2 * x).exp()
    return 2 * y - rat(5, 2) - 4 * y / (2 * y - 3)


# -------------------------------------------------------------------------
# Small floors: a cubic contact saturating the q=2 shortcut.
# -------------------------------------------------------------------------

HALF = LOG2 / 2
SMALL_EPSILON = rat(1, 1000)


def smoothstep(v: arb) -> arb:
    return 3 * v**2 - 2 * v**3


# On [-HALF,HALF], U' > 18.  Thus for a <= 8 the physical derivative of
# a*smoothstep((x+HALF)/LOG2), whose maximum is 12/LOG2, is at most U'.
minimum_u_prime = None
for index in range(2048):
    z = interval_ball(HALF * index / 2048, HALF * (index + 1) / 2048)
    k, kp, kpp = k_triplet(z)
    u_prime = (kp / k) ** 2 - kpp / k
    assert u_prime > 18
    if minimum_u_prime is None or u_prime.lower() < minimum_u_prime:
        minimum_u_prime = u_prime.lower()

assert 12 / LOG2 < 18

# The base U-distance across the q=2 edge is 2U(HALF)>8, so the intrinsic
# distance is exactly a throughout this small-floor case.
k_half, u_half = k_u(HALF)
assert u_half > 4

# At the left endpoint, the archimedean contribution is
#
#   C(HALF)^-1 [ int_0^LOG2 J(u)K(u-HALF)S(u/LOG2)du
#                  + int_LOG2^infinity J(u)K(u-HALF)du ].
#
# The first 1/1000 is bounded using S(v)<=3v^2, J(u)<=1/u, and
# K<=K(0).  Beyond u=3 every theta summand decays at rate >100.
def small_central_left(u: arb) -> arb:
    return (
        J(u)
        * k_triplet(HALF - u)[0]
        * smoothstep(u / LOG2)
        / C(HALF)
    )


def small_central_right(u: arb) -> arb:
    return (
        J(u)
        * k_triplet(u - HALF)[0]
        * smoothstep(u / LOG2)
        / C(HALF)
    )


def small_positive_tail(u: arb) -> arb:
    return J(u) * k_triplet(u - HALF)[0] / C(HALF)


small_arch = (
    riemann_enclosure(
        small_central_left,
        SMALL_EPSILON,
        HALF,
        4096,
    )
    + riemann_enclosure(
        small_central_right,
        HALF,
        LOG2,
        4096,
    )
    + riemann_enclosure(
        small_positive_tail,
        LOG2,
        arb(3),
        8192,
    )
)

k_zero = k_triplet(arb(0))[0]
small_near_zero = (
    3 * k_zero * SMALL_EPSILON**2 / (2 * LOG2**2)
)
# Indeed 1-exp(-2u)>=2u exp(-2u) and exp(3u/2)<2 here, so J(u)<1/u.
assert (3 * SMALL_EPSILON / 2).exp() < 2
small_far_argument = arb(3) - HALF
assert single_theta_decay(small_far_argument) > 100
assert J(arb(3)) < 2
small_far_tail = 2 * k_triplet(small_far_argument)[0] / 100
small_arch += small_near_zero + small_far_tail

# q=2 and q=3 are evaluated directly.  For n>=4, Lambda(n)/sqrt(n)<=1.
# Since every theta summand decays at rate >10 after
# r0=log(4)-HALF, overcounting prime powers by all integers gives
#
#   sum_(n>=4) K(log(n)-HALF)
#       <= K(r0) sum_(n>=4)(4/n)^10 < (13/9)K(r0).
small_prime_2 = LOG2 / arb(2).sqrt() * k_half / C(HALF)
log3 = arb(3).log()
small_prime_3 = (
    log3
    / arb(3).sqrt()
    * k_triplet(log3 - HALF)[0]
    / C(HALF)
)
small_prime_tail_argument = arb(4).log() - HALF
assert single_theta_decay(small_prime_tail_argument) > 10
small_prime_tail = rat(13, 9) * k_triplet(small_prime_tail_argument)[0]
small_prime = small_prime_2 + small_prime_3 + small_prime_tail

# Reflection sends the smoothstep contact F to 1-F and commutes with L.
# Hence the two-endpoint defect is 1/2-2LF(-HALF).
small_defect = rat(1, 2) - 2 * (small_arch + small_prime)
assert small_defect > 0


# -------------------------------------------------------------------------
# Large floors: a bounded folded contact of oscillation R<7.
# -------------------------------------------------------------------------

E = LOG2 / 8
B = LOG2 / 3
P = 5 * LOG2 / 8
X = 3 * LOG2 / 4
Y = 13 * LOG2 / 16
Q = 7 * LOG2 / 8
DELTA = Y - X
LARGE_EPSILON = rat(1, 1000000)

k_e, u_e = k_u(E)
k_b, u_b = k_u(B)
k_p, u_p = k_u(P)
k_x, u_x = k_u(X)
k_y, u_y = k_u(Y)
k_q, u_q = k_u(Q)

left_slope = u_e / (u_b - u_e)
range_r = u_q - u_p
pair_distance = u_y - u_x

assert left_slope > 0
assert left_slope < 1
assert range_r < 7
assert u_e < range_r
assert pair_distance > 0
assert pair_distance < range_r

# The fixed contact is f=g o U, where in physical coordinates
#
#   f=0                              on (-infinity,-B],
#   f=r(U+U(B))                     on [-B,-E],
#   f=-U                            on [-E,0],
#   f=0                             on [0,P],
#   f=U-U(P)                        on [P,Q],
#   f=R                             on [Q,infinity).
#
# Its U-slopes lie in [-1,1], its range is [0,R], and it agrees with
# U-U(P) on [X,Y].
def k_f(z: arb, branch: str) -> tuple[arb, arb]:
    if branch == "negative_zero":
        return k_triplet(-z)[0], arb(0)
    if branch == "negative_up":
        k, u_abs = k_u(-z)
        return k, left_slope * (-u_abs + u_b)
    if branch == "negative_down":
        k, u_abs = k_u(-z)
        return k, u_abs
    if branch == "positive_zero":
        return k_triplet(z)[0], arb(0)
    if branch == "ramp":
        k, u = k_u(z)
        return k, u - u_p
    if branch == "positive_range":
        return k_triplet(z)[0], range_r
    raise ValueError(branch)


# Certify the local derivative bounds used to remove tiny neighborhoods of
# the two archimedean singularities.
for index in range(1024):
    z = interval_ball(P + (Q - P) * index / 1024, P + (Q - P) * (index + 1) / 1024)
    k, kp, kpp = k_triplet(z)
    u = -kp / k
    u_prime = (kp / k) ** 2 - kpp / k
    assert u > 0
    assert u_prime > 0
    assert u_prime < 50


def arch_difference_integrand(z: arb, branch: str, region: str) -> arb:
    k, f = k_f(z, branch)
    f_x = u_x - u_p
    f_y = u_y - u_p
    if region == "left":
        distance_x = X - z
        distance_y = Y - z
    elif region == "between":
        distance_x = z - X
        distance_y = Y - z
    elif region == "right":
        distance_x = z - X
        distance_y = z - Y
    else:
        raise ValueError(region)
    return k * (
        J(distance_y) * (f - f_y) / C(Y)
        - J(distance_x) * (f - f_x) / C(X)
    )


arch_difference = arb(0)
for left, right, branch in (
    (-arb(3), -B, "negative_zero"),
    (-B, -E, "negative_up"),
    (-E, arb(0), "negative_down"),
    (arb(0), P, "positive_zero"),
):
    arch_difference += riemann_enclosure(
        lambda z, branch=branch: arch_difference_integrand(z, branch, "left"),
        left,
        right,
        4096,
    )

# The four ramp pieces are integrated in distance coordinates, with
# geometric cells resolving the two removable singularities.
arch_difference += geometric_enclosure(
    lambda s: arch_difference_integrand(X - s, "ramp", "left"),
    LARGE_EPSILON,
    X - P,
)
midpoint = (X + Y) / 2
arch_difference += geometric_enclosure(
    lambda s: arch_difference_integrand(X + s, "ramp", "between"),
    LARGE_EPSILON,
    midpoint - X,
)
arch_difference += geometric_enclosure(
    lambda s: arch_difference_integrand(Y - s, "ramp", "between"),
    LARGE_EPSILON,
    Y - midpoint,
)
arch_difference += geometric_enclosure(
    lambda s: arch_difference_integrand(Y + s, "ramp", "right"),
    LARGE_EPSILON,
    Q - Y,
)

arch_difference += riemann_enclosure(
    lambda z: arch_difference_integrand(z, "positive_range", "right"),
    Q,
    arb(3),
    8192,
)

# For 0<r<=DELTA+EPSILON, J(r)<=1/r.  On the ramp, K<=K(P) and
# |Delta f|<=50|Delta x|.  The following symmetric error contains both
# omitted neighborhoods and both source kernels.
assert J(DELTA - LARGE_EPSILON) < 1 / (DELTA - LARGE_EPSILON)
near_ratio = (DELTA + LARGE_EPSILON) / (DELTA - LARGE_EPSILON)
large_near_error = (
    8 * LARGE_EPSILON * k_p * 50 * near_ratio
)

# At |z|>=3 both source distances exceed 2, J<1, and every theta
# summand decays at rate >100.
assert J(arb(3) - Y) < 1
assert single_theta_decay(arb(3)) > 100
large_far_error = 4 * range_r * k_triplet(arb(3))[0] / 100
arch_difference += arb(0, large_near_error + large_far_error)


def prime_term_at_2(t: arb, u_t: arb) -> arb:
    f_t = u_t - u_p
    forward_k = k_triplet(t + LOG2)[0]
    backward_abs = LOG2 - t
    backward_k, backward_u_abs = k_u(backward_abs)
    backward_f = left_slope * (-backward_u_abs + u_b)
    return (
        LOG2
        / arb(2).sqrt()
        / C(t)
        * (
            forward_k * (range_r - f_t)
            + backward_k * (backward_f - f_t)
        )
    )


def prime_term_at_3(t: arb, u_t: arb) -> arb:
    f_t = u_t - u_p
    return (
        log3
        / arb(3).sqrt()
        / C(t)
        * (
            k_triplet(t + log3)[0] * (range_r - f_t)
            - k_triplet(log3 - t)[0] * f_t
        )
    )


prime_difference_23 = (
    prime_term_at_2(Y, u_y)
    - prime_term_at_2(X, u_x)
    + prime_term_at_3(Y, u_y)
    - prime_term_at_3(X, u_x)
)

# Bound every omitted q>=4 term in absolute value.  Overcount prime powers
# by all integers, use Lambda(n)/sqrt(n)<=1, and dominate both orientations
# by K(log(n)-Y).  The same (4/n)^10 sum gives 13/9.
large_prime_tail_argument = arb(4).log() - Y
assert single_theta_decay(large_prime_tail_argument) > 10
large_prime_error = (
    4
    * range_r
    * rat(13, 9)
    * k_triplet(large_prime_tail_argument)[0]
)

large_defect = (
    arch_difference
    + prime_difference_23
    + pair_distance / 2
    + arb(0, large_prime_error)
)
assert large_defect > 0


print("small-contact minimum U' lower endpoint:", minimum_u_prime)
print("small-contact arch upper enclosure:", small_arch.upper())
print("small-contact prime upper enclosure:", small_prime.upper())
print("small-floor defect lower enclosure:", small_defect.lower())
print("bounded-contact oscillation R:", range_r)
print("bounded-contact pair U-distance:", pair_distance)
print("bounded-contact arch-difference enclosure:", arch_difference)
print("bounded-contact q=2,3 prime difference:", prime_difference_23)
print("bounded-contact omitted-prime error:", large_prime_error)
print("large-floor defect lower enclosure:", large_defect.lower())
print("CERTIFIED: every variable shortcut system with floor >= R fails rate 1/2")
print("CERTIFIED: every constant-cost prime-shortcut metric fails rate 1/2")
