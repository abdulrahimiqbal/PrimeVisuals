#!/usr/bin/env python3
"""Arb certificate for the universal sharp-tail Hall obstruction.

This script certifies the two finite inequalities used in the accompanying
proof.

1.  More than one half of the opposite-tail residual density

        r(t) = 4 K(t) sinh(t/2),   t > 0,

    lies in I=[3/80,21/80].

2.  For every a,b in I, an explicit two-fold d_U-contact at (-a,b)
    violates the rate-1/2 full-generator contact inequality.  The square is
    covered by 32^2 exact rational boxes.  Monotonicity turns each box into
    endpoint expressions, and interval Riemann sums enclose the remaining
    one-dimensional archimedean integrals.

Reproduction:

    python3 -m pip install --target /tmp/pvdeps python-flint
    PYTHONPATH=/tmp/pvdeps python3 scripts/universal_tail_hall_certificate.py
"""

from flint import arb, ctx


ctx.prec = 144


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
LOG2 = arb(2).log()
SQRT2 = arb(2).sqrt()
C2 = LOG2 / SQRT2

LO = q(3, 80)
HI = q(21, 80)
THETA = q(2, 5)
ONE = arb(1)


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(x: arb) -> arb:
    return (-x / 2).exp() / (1 - (-2 * x).exp())


# All calls below have x in the padded interval [-1/1000,101/100].  For
# n>=5, putting t=exp(2x) gives t>99/100 and y=pi*n^2*t>3n^2.  The theta
# summands and their first two derivatives are bounded respectively by
#
#   20 n^4 exp(-3n^2), 125 n^6 exp(-3n^2), 1000 n^8 exp(-3n^2).
#
# Indeed 2y-3<2y, |(log k_n)'|<2y, and
# |k_n''/k_n|<5y^2.  Each displayed majorant decreases geometrically after
# n=5 with the ratio used here.
PADDED_LEFT = -q(1, 1000)
PADDED_RIGHT = q(101, 100)
assert (2 * PADDED_LEFT).exp() > q(99, 100)
assert PI * q(99, 100) > 3

tail_bounds = []
for power, factor in ((4, 20), (6, 125), (8, 1000)):
    first = factor * arb(5) ** power * (-arb(3) * 25).exp()
    ratio = (arb(6) / 5) ** power * (-arb(3) * 11).exp()
    tail_bounds.append(first / (1 - ratio))

assert tail_bounds[0] < arb("1e-28")
assert tail_bounds[1] < arb("1e-26")
assert tail_bounds[2] < arb("1e-23")

K_TAIL = arb(0, "1e-28")
KP_TAIL = arb(0, "1e-26")
KPP_TAIL = arb(0, "1e-23")


def k_triplet(x: arb) -> tuple[arb, arb, arb]:
    """Return rigorous enclosures of K,K',K'' on the positive branch."""
    assert x > PADDED_LEFT
    assert x < PADDED_RIGHT
    k_sum = arb(0)
    kp_sum = arb(0)
    kpp_sum = arb(0)
    for n in range(1, 5):
        y = PI * n * n * (2 * x).exp()
        k = PI * n * n * (q(5, 2) * x).exp() * (2 * y - 3) * (-y).exp()
        logarithmic_derivative = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
        minus_logarithmic_derivative_prime = (
            4 * y + 24 * y / (2 * y - 3) ** 2
        )
        k_sum += k
        kp_sum += k * logarithmic_derivative
        kpp_sum += k * (
            logarithmic_derivative**2
            - minus_logarithmic_derivative_prime
        )
    return k_sum + K_TAIL, kp_sum + KP_TAIL, kpp_sum + KPP_TAIL


def K(x: arb) -> arb:
    return k_triplet(x)[0]


def U(x: arb) -> arb:
    k, kp, _ = k_triplet(x)
    return -kp / k


def interval_ball(left: arb, right: arb) -> arb:
    assert right > left
    return arb(
        (left + right) / 2,
        (right - left) / 2 + arb("1e-40"),
    )


def integral_enclosure(function, left: arb, right: arb, pieces: int) -> arb:
    """Natural interval-extension Riemann enclosure on a fixed interval."""
    total = arb(0)
    width = (right - left) / pieces
    for index in range(pieces):
        cell_left = left + width * index
        cell_right = cell_left + width
        total += function(interval_ball(cell_left, cell_right)) * width
    return total


# U is strictly increasing throughout every endpoint range used in the box
# estimates.  This is a finite interval proof of U'=(K'/K)^2-K''/K>0, not a
# plot or a point sample.
MONO_LEFT = q(27, 100)
MONO_RIGHT = q(67, 100)
MONO_PIECES = 2048
for index in range(MONO_PIECES):
    left = MONO_LEFT + (MONO_RIGHT - MONO_LEFT) * index / MONO_PIECES
    right = MONO_LEFT + (MONO_RIGHT - MONO_LEFT) * (index + 1) / MONO_PIECES
    x = interval_ball(left, right)
    k, kp, kpp = k_triplet(x)
    u_prime = (kp / k) ** 2 - kpp / k
    assert u_prime > 0


def r2(z: arb) -> arb:
    """The q=2 jump rate as a function of the starting state z."""
    return C2 * K(LOG2 - z) / C(z)


# On z in [-HI,HI], r2'(z)=r2(z)[U(log2-z)-tanh(z/2)/2]>0.
# Here U(x) is the positive weighted average of
# g(y_n)=2y_n-5/2-4y_n/(2y_n-3), and g is increasing.  The following
# endpoint calculation therefore proves the bracket is positive uniformly;
# it does not rely on extending the finite U' cover past MONO_RIGHT.
y_r2 = PI * (2 * (LOG2 - HI)).exp()
g_r2 = 2 * y_r2 - q(5, 2) - 4 * y_r2 / (2 * y_r2 - 3)
assert g_r2 - q(1, 2) * (HI / 2).tanh() > 0


def delta_j(u: arb, a: arb, b: arb) -> arb:
    """Positive archimedean loss kernel for the left fold."""
    return J(u - a) / C(a) - J(u + b) / C(b)


# For fixed u, delta_j increases in both a and b.  For the first term this is
# because -J'(u-a)/J(u-a)>1/2 while C'(a)/C(a)<1/2; the second term decreases
# with b.  Positivity follows from u-a<u+b and C(a),C(b)>=1 together with the
# same derivative formulas.  The minimal distance below is
# (1-theta)(log(2)-a-b)>0, so J is never evaluated at its pole.
assert (1 - THETA) * (LOG2 - 2 * HI) > q(1, 20)


# For u>=1 every theta summand satisfies -k_n'/k_n>40.  Hence
# K(u)<=K(1)exp(-40(u-1)).  This supplies all infinite-tail bounds below.
y_one = PI * (arb(2)).exp()
g_one = 2 * y_one - q(5, 2) - 4 * y_one / (2 * y_one - 3)
assert g_one > 40
K_ONE = K(ONE)


TRANSITION_PIECES = 256
PLATEAU_PIECES = 256


def side_lower(a_left: arb, a_right: arb, b_left: arb, b_right: arb) -> arb:
    """Lower bound for the left-fold contribution on one parameter box."""
    # q0=log(2)-b and q1=(3/5)log(2)+(2/5)a-(3/5)b.
    q1_min = q(3, 5) * LOG2 + q(2, 5) * a_left - q(3, 5) * b_right
    q1_max = q(3, 5) * LOG2 + q(2, 5) * a_right - q(3, 5) * b_left
    q0_min = LOG2 - b_right
    q0_max = LOG2 - b_left

    # Since U is increasing, these are uniform lower and upper bounds for
    # M=2[U(q0)-U(q1)].
    m_lower = 2 * (U(q0_min) - U(q1_max))
    m_upper = 2 * (U(q0_max) - U(q1_min))
    assert m_lower > 0

    # r2 is increasing, so both factors below are endpoint lower bounds for
    # M[r2(b)-r2(-a)], the selected q=2 prime contribution.
    selected_prime = m_lower * (r2(b_left) - r2(-a_left))
    assert selected_prime > 0

    # The fold height m(u) is at most 2[U(u)-U(q1_min)] until q0_min and at
    # most m_upper thereafter.  delta_j is maximized at (a_right,b_right).
    u_q1 = U(q1_min)

    def transition_integrand(u: arb) -> arb:
        k, kp, _ = k_triplet(u)
        m_times_k = -2 * kp - 2 * u_q1 * k
        return m_times_k * delta_j(u, a_right, b_right)

    transition_loss = integral_enclosure(
        transition_integrand,
        q1_min,
        q0_min,
        TRANSITION_PIECES,
    )

    plateau_loss = m_upper * integral_enclosure(
        lambda u: K(u) * delta_j(u, a_right, b_right),
        q0_min,
        ONE,
        PLATEAU_PIECES,
    )

    # Drop the favorable second term in delta_j.  The exponential-series
    # formula for J gives J(u-a)<=J(1-a)exp(-(u-1)/2).
    tail_loss = (
        m_upper
        * K_ONE
        * J(ONE - a_right)
        / C(a_right)
        / q(81, 2)
    )
    return selected_prime - transition_loss - plateau_loss - tail_loss


# Exhaustive exact-rational cover of I^2.  Every q>=3 prime term omitted from
# side_lower has the favorable sign, so the selected q=2 lower bound suffices.
BOXES = 32
edges = [LO + (HI - LO) * index / BOXES for index in range(BOXES + 1)]
side_bounds = [[arb(0) for _ in range(BOXES)] for _ in range(BOXES)]

for i in range(BOXES):
    for j in range(BOXES):
        side_bounds[i][j] = side_lower(
            edges[i], edges[i + 1], edges[j], edges[j + 1]
        )

certified_boxes = 0
worst_lower = None
worst_cell = None
for i in range(BOXES):
    for j in range(BOXES):
        reserve_upper = q(1, 4) * (
            (edges[i + 1] / 2).tanh() + (edges[j + 1] / 2).tanh()
        )
        defect = side_bounds[i][j] + side_bounds[j][i] - reserve_upper
        assert defect > 0
        certified_boxes += 1
        lower_float = float(defect.lower())
        if worst_lower is None or lower_float < worst_lower:
            worst_lower = lower_float
            worst_cell = (i, j, defect)


# Exact Hall mass balance.  It is enough to prove
#
#   int_I r > int_(0,LO) r + int_(HI,infinity) r.
#
# All finite integrals are natural interval-extension enclosures.  For u>=1,
# sinh(u/2)<=exp(u/2)/2 and the rate-40 theta bound gives the displayed tail.
def residual_density(t: arb) -> arb:
    return 4 * K(t) * (t / 2).sinh()


inside_mass = integral_enclosure(residual_density, LO, HI, 2048)
left_mass = integral_enclosure(residual_density, arb(0), LO, 512)
right_finite_mass = integral_enclosure(residual_density, HI, ONE, 4096)
right_tail_mass = 2 * K_ONE * (q(1, 2)).exp() / q(79, 2)
mass_balance = inside_mass - left_mass - right_finite_mass - right_tail_mass
assert mass_balance > 0


print("theta tail bounds (K,K',K''):", *tail_bounds)
print("certified U-monotonicity interval:", MONO_LEFT, MONO_RIGHT)
print("certified parameter boxes:", certified_boxes)
print("worst box lower enclosure (i,j,value):", worst_cell)
print("inside residual mass enclosure:", inside_mass)
print("outside-left residual mass enclosure:", left_mass)
print("outside-right finite residual mass enclosure:", right_finite_mass)
print("outside-right tail residual mass enclosure:", right_tail_mass)
print("Hall mass-balance lower enclosure:", mass_balance)
print("CERTIFIED: no sharp U-calibrated full-generator tail coupling exists")
