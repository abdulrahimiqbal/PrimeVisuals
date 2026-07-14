#!/usr/bin/env python3
"""Rigorous certificate for the subcritical increasing-path Farkas dual.

The intended final conclusion is that no admissible increasing path density
can have local coarse curvature 499/1000.  This script contains only
outward-rounded Arb comparisons; the accompanying continuation-state proof
supplies the analytic tail and cutoff/domain passages.

Reproduction:

    PYTHONPATH=/tmp/pvdeps python3 \
        scripts/subcritical_path_farkas_certificate.py
"""

from flint import arb, arb_series, ctx


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
LOG2 = arb(2).log()
SQRT2 = arb(2).sqrt()
HALF_LOG2 = LOG2 / 2
ONE = arb(1)


def C(x):
    return ((x / 2).exp() + (-x / 2).exp()) / 2


def S(x):
    return ((x / 2).exp() - (-x / 2).exp()) / 2


def tanh_half(x):
    return S(x) / C(x)


def J(x):
    return (-x / 2).exp() / (1 - (-2 * x).exp())


def minus_J_prime(x):
    return J(x) * (q(1, 2) + 2 / ((2 * x).exp() - 1))


# For x >= -1/20 the terms n >= 7 in K and its first three derivatives are
# bounded by 1e-35.  The slightly enlarged range is needed only by the first
# reflected compact rectangle.  Replacing exp(2x) by exp(-1/10) gives the
# displayed geometric majorant; all other calls below evaluate K at a
# nonnegative argument.
TAIL_Y_FACTOR = (-q(1, 10)).exp()
for power, factor in (
    (4, 2000),
    (6, 100000),
    (8, 10000000),
    (10, 1000000000000),
):
    first = arb(7) ** power * (-PI * 49 * TAIL_Y_FACTOR).exp()
    ratio = (
        (arb(8) / 7) ** power
        * (-PI * 15 * TAIL_Y_FACTOR).exp()
    )
    assert factor * first / (1 - ratio) < arb("1e-35")

THETA_ERROR = arb(0, "1e-35")
THETA_SERIES_ERROR = arb(0, "1e-30")

# Relative theta tails for x>=log(2)/2.  Here y=pi exp(2x)>=2pi.
# After retaining n<=6, the ratios below dominate respectively K and K'.
Y_LARGE = 2 * PI
large_k_first = q(4, 3) * arb(7) ** 4 * (-arb(48) * Y_LARGE).exp()
large_k_ratio = (q(8, 7)) ** 4 * (-arb(15) * Y_LARGE).exp()
LARGE_K_RELERR = large_k_first / (1 - large_k_ratio)
large_kp_first = 4 * Y_LARGE * arb(7) ** 6 * (-arb(48) * Y_LARGE).exp()
large_kp_ratio = (q(8, 7)) ** 6 * (-arb(15) * Y_LARGE).exp()
LARGE_KP_RELERR = large_kp_first / (1 - large_kp_ratio)
assert LARGE_K_RELERR < arb("1e-120")
assert LARGE_KP_RELERR < arb("1e-115")

# Uniform relative tails for K and its first three derivatives on x>=0.
# If y=pi exp(2x), then k_n/k_1 <= 2 n^4 exp(-(n^2-1)y).
# For n>=7 we also use |(log k_n)'|<=4n^2y and the elementary derivative
# majorants recorded below.  Polynomial times exp(-48y) decreases for
# y>=pi, so its largest value is attained at y=pi.
RELATIVE_DERIVATIVE_TAILS = []
for power, factor in ((4, 2), (6, 8 * PI), (8, 48 * PI**2), (10, 200 * PI**3)):
    first = factor * arb(7) ** power * (-arb(48) * PI).exp()
    ratio = (q(8, 7)) ** power * (-arb(15) * PI).exp()
    RELATIVE_DERIVATIVE_TAILS.append(first / (1 - ratio))
assert RELATIVE_DERIVATIVE_TAILS[0] < arb("1e-60")
assert RELATIVE_DERIVATIVE_TAILS[1] < arb("1e-55")
assert RELATIVE_DERIVATIVE_TAILS[2] < arb("1e-48")
assert RELATIVE_DERIVATIVE_TAILS[3] < arb("1e-40")


def K_and_K_prime(x):
    k = 0
    kp = 0
    for n in range(1, 7):
        y = PI * n * n * (2 * x).exp()
        kn = (
            PI
            * n
            * n
            * (q(5, 2) * x).exp()
            * (2 * y - 3)
            * (-y).exp()
        )
        logarithmic_derivative = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
        k += kn
        kp += kn * logarithmic_derivative
    if isinstance(x, arb_series):
        tail = arb_series(
            [THETA_SERIES_ERROR, THETA_SERIES_ERROR, THETA_SERIES_ERROR],
            3,
        )
        return k + tail, kp + tail
    return k + THETA_ERROR, kp + THETA_ERROR


def K(x):
    return K_and_K_prime(x)[0]


def K_and_K_prime_large(x):
    """Relative-error theta enclosure, valid for x>=log(2)/2."""

    k = arb(0)
    kp = arb(0)
    k1 = None
    for n in range(1, 7):
        y = PI * n * n * (2 * x).exp()
        kn = (
            PI
            * n
            * n
            * (q(5, 2) * x).exp()
            * (2 * y - 3)
            * (-y).exp()
        )
        logarithmic_derivative = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
        if n == 1:
            k1 = kn
        k += kn
        kp += kn * logarithmic_derivative
    k_error = abs(k1).upper() * LARGE_K_RELERR.upper()
    kp_error = abs(k1).upper() * LARGE_KP_RELERR.upper()
    return k + error_ball(k_error), kp + error_ball(kp_error)


def K_large(x):
    return K_and_K_prime_large(x)[0]


def K_through_third_nonnegative(x):
    """Relative enclosures of K,K',K'',K''' for an Arb box x>=0."""

    values = [arb(0), arb(0), arb(0), arb(0)]
    k1 = None
    for n in range(1, 7):
        y = PI * n * n * (2 * x).exp()
        kn = (
            PI
            * n
            * n
            * (q(5, 2) * x).exp()
            * (2 * y - 3)
            * (-y).exp()
        )
        logarithmic_derivative = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
        a = 4 * y + 24 * y / (2 * y - 3) ** 2
        a_prime = 8 * y - 48 * y * (2 * y + 3) / (2 * y - 3) ** 3
        if n == 1:
            k1 = kn
        values[0] += kn
        values[1] += kn * logarithmic_derivative
        values[2] += kn * (logarithmic_derivative**2 - a)
        values[3] += kn * (
            logarithmic_derivative**3
            - 3 * logarithmic_derivative * a
            - a_prime
        )
    k1_upper = abs(k1).upper()
    for index, relative_tail in enumerate(RELATIVE_DERIVATIVE_TAILS):
        values[index] += error_ball(k1_upper * relative_tail.upper())
    return tuple(values)


def A_nonnegative(x):
    """A=K U=-K' on x>=0."""

    return -K_through_third_nonnegative(x)[1]


def B_nonnegative(x):
    """B=K v=(-K'+K tanh(x/2)/2)/C(x)^2 on x>=0."""

    k, kp, _, _ = K_through_third_nonnegative(x)
    return (-kp + k * tanh_half(x) / 2) / C(x) ** 2


def v_nonnegative(x):
    k, kp, _, _ = K_through_third_nonnegative(x)
    return (-kp / k + tanh_half(x) / 2) / C(x) ** 2


def v_prime_nonnegative(x):
    k, kp, kpp, _ = K_through_third_nonnegative(x)
    u = -kp / k
    up = (kp / k) ** 2 - kpp / k
    s = tanh_half(x)
    sp = 1 / (2 * C(x) ** 2)
    return (up + sp / 2 - s * (u + s / 2)) / C(x) ** 2


def B_second_nonnegative(x):
    """Second derivative of the odd analytic function B on x>=0."""

    k, kp, kpp, kppp = K_through_third_nonnegative(x)
    s = tanh_half(x)
    sp = 1 / (2 * C(x) ** 2)
    spp = -s * sp
    p = -kp + k * s / 2
    pp = -kpp + kp * s / 2 + k * sp / 2
    ppp = -kppp + kpp * s / 2 + kp * sp + k * spp / 2
    return (ppp - 2 * s * pp + (s**2 - sp) * p) / C(x) ** 2


def A_prime_nonnegative(x):
    return -K_through_third_nonnegative(x)[2]


def A_second_nonnegative(x):
    return -K_through_third_nonnegative(x)[3]


def B_prime_nonnegative(x):
    k, kp, kpp, _ = K_through_third_nonnegative(x)
    s = tanh_half(x)
    sp = 1 / (2 * C(x) ** 2)
    p = -kp + k * s / 2
    pp = -kpp + kp * s / 2 + k * sp / 2
    return (pp - s * p) / C(x) ** 2


def J_prime(x):
    lower = arb(x.lower())
    upper = arb(x.upper())
    assert lower > 0
    j_upper = (-lower / 2).exp() / (1 - (-2 * lower).exp())
    magnitude = j_upper * (q(1, 2) + 2 / ((2 * lower).exp() - 1))
    return interval_ball(-arb(magnitude.upper()), arb(0))


def J_second(x):
    lower = arb(x.lower())
    upper = arb(x.upper())
    assert lower > 0
    denominator = (2 * lower).exp() - 1
    j_upper = (-lower / 2).exp() / (1 - (-2 * lower).exp())
    a_upper = q(1, 2) + 2 / denominator
    extra_upper = 4 * (2 * upper).exp() / denominator**2
    magnitude = j_upper * (a_upper**2 + extra_upper)
    return interval_ball(arb(0), arb(magnitude.upper()))


def signed_A(x):
    """Odd extension of A, including a safe box crossing zero."""

    if x >= 0:
        return A_nonnegative(x)
    if x <= 0:
        return -A_nonnegative(-x)
    radius = max(-arb(x.lower()), arb(x.upper()))
    magnitude = abs(A_nonnegative(interval_ball(arb(0), radius))).upper()
    return interval_ball(-arb(magnitude), arb(magnitude))


def signed_B(x):
    """Odd extension of B, including a safe box crossing zero."""

    if x >= 0:
        return B_nonnegative(x)
    if x <= 0:
        return -B_nonnegative(-x)
    radius = max(-arb(x.lower()), arb(x.upper()))
    magnitude = abs(B_nonnegative(interval_ball(arb(0), radius))).upper()
    return interval_ball(-arb(magnitude), arb(magnitude))


def r_prime_direct(x):
    a = A_nonnegative(x)
    b = B_nonnegative(x)
    denominator = tight_interval_ball(
        arb(a.lower()) ** 2,
        arb(a.upper()) ** 2,
    )
    return (B_prime_nonnegative(x) * a - b * A_prime_nonnegative(x)) / denominator


def r_prime_enclosure(x):
    """Enclose r' on a nonnegative box, including the removable origin."""

    lower = max(arb(0), arb(x.lower()))
    upper = arb(x.upper())
    split = HALF_LOG2

    def small_enclosure(a, b):
        # certify_r_monotonicity proves
        #     -68 x/125 < r'(x) < -51 x/100
        # throughout this interval, including the removable origin.
        return tight_interval_ball(-q(68, 125) * b, -q(51, 100) * a)

    def large_enclosure(a, b):
        box = interval_ball(a, b)
        u = U_large_tight(box)
        ss = tanh_half(box)
        aa = ss / (2 * u)
        base = ss * (1 + aa) / C(box) ** 2
        extra = q(15, 4) * aa / C(box) ** 2
        # Here d=U'/U-s'/s is positive and at most 15/4.  Since
        # r'=-C^-2{s(1+a)+a d}, these are one-sided endpoint bounds.
        return tight_interval_ball(
            -arb((base + extra).upper()),
            -arb(base.lower()),
        )

    if upper <= split:
        return small_enclosure(lower, upper)
    if lower >= split:
        return large_enclosure(lower, upper)
    left = small_enclosure(lower, split)
    right = large_enclosure(split, upper)
    return tight_interval_ball(
        min(arb(left.lower()), arb(right.lower())),
        max(arb(left.upper()), arb(right.upper())),
    )


def stable_determinant_from_delta(x, delta, *, theta_cells):
    """Compute D_x(x+delta) without subtracting two close r-values."""

    target = x + delta
    target = interval_ball(
        max(arb(0), arb(target.lower())),
        arb(target.upper()),
    )
    average = arb(0)
    for index in range(theta_cells):
        left = q(index, theta_cells)
        right = q(index + 1, theta_cells)
        theta = interval_ball(left, right)
        location = x + theta * delta
        # All uses have a nonnegative segment; erase a possible one-ulp
        # negative padding at the origin before invoking the removable box.
        location = interval_ball(
            max(arb(0), arb(location.lower())),
            arb(location.upper()),
        )
        average += r_prime_enclosure(location) * (right - left)
    return A_nonnegative(target) * (-delta) * average


def stable_determinant_prime(x, target, *, theta_cells):
    """Enclose D_x'(target) with both cancellations retained."""

    delta = target - x
    difference_average = arb(0)
    for index in range(theta_cells):
        left = q(index, theta_cells)
        right = q(index + 1, theta_cells)
        theta = interval_ball(left, right)
        location = x + theta * delta
        location = interval_ball(
            max(arb(0), arb(location.lower())),
            arb(location.upper()),
        )
        difference_average += r_prime_enclosure(location) * (right - left)
    r_difference = -delta * difference_average
    target_box = interval_ball(
        max(arb(0), arb(target.lower())),
        arb(target.upper()),
    )
    return (
        A_prime_nonnegative(target_box) * r_difference
        - A_nonnegative(target_box) * r_prime_enclosure(target_box)
    )


def U_large(x):
    k, kp = K_and_K_prime_large(x)
    return -kp / k


def U_large_tight(x):
    """Dependency-free enclosure of U for x>=log(2)/2.

    U is the positive theta-weighted average of
    g_n=2y_n-5/2-4y_n/(2y_n-3).  Bounding the denominator below by its
    n=1 term gives a tight one-sided correction to g_1.
    """

    y = PI * (2 * x).exp()
    y_lower = arb(y.lower())
    y_upper = arb(y.upper())
    # g_1 is strictly increasing for y>3/2; evaluating the endpoints avoids
    # interval dependency in 2y-4y/(2y-3).
    g1_lower = 2 * y_lower - q(5, 2) - 4 * y_lower / (2 * y_lower - 3)
    g1_upper = 2 * y_upper - q(5, 2) - 4 * y_upper / (2 * y_upper - 3)
    g1 = interval_ball(g1_lower, g1_upper)
    correction = arb(0)
    for n in range(2, 7):
        yn = n * n * y
        ratio = (
            n
            * n
            * (2 * yn - 3)
            / (2 * y - 3)
            * (-(n * n - 1) * y).exp()
        )
        gn = 2 * yn - q(5, 2) - 4 * yn / (2 * yn - 3)
        correction += ratio * (gn - g1)
    correction += LARGE_KP_RELERR + abs(g1).upper() * LARGE_K_RELERR
    lower = g1_lower.lower()
    upper = (g1 + correction).upper()
    return interval_ball(arb(lower), arb(upper))


def U_tight_nonnegative(x):
    """Dependency-free theta-weighted enclosure of U for x>=0."""

    y = PI * (2 * x).exp()
    g1 = 2 * y - q(5, 2) - 4 * y / (2 * y - 3)
    numerator = g1
    denominator = arb(1)
    for n in range(2, 7):
        yn = n * n * y
        ratio = (
            n
            * n
            * (2 * yn - 3)
            / (2 * y - 3)
            * (-(n * n - 1) * y).exp()
        )
        gn = 2 * yn - q(5, 2) - 4 * yn / (2 * yn - 3)
        numerator += ratio * gn
        denominator += ratio
    numerator += error_ball(RELATIVE_DERIVATIVE_TAILS[1].upper())
    denominator += error_ball(RELATIVE_DERIVATIVE_TAILS[0].upper())
    return numerator / denominator


def r_tight_nonnegative(x):
    u = U_tight_nonnegative(x)
    return (1 + tanh_half(x) / (2 * u)) / C(x) ** 2


K_ONE, KP_ONE = K_and_K_prime(ONE)
GAMMA = -KP_ONE / K_ONE


def interval_ball(left, right):
    return arb(
        (left + right) / 2,
        (right - left) / 2 + arb("1e-48"),
    )


def tight_interval_ball(left, right):
    """Endpoint hull without an absolute padding (needed at theta scale)."""

    return arb((left + right) / 2, (right - left) / 2)


def error_ball(radius):
    return arb(0, radius)


def second_derivative_bound(function, variable_ball):
    variable = arb_series([variable_ball, arb(1)], 3)
    expansion = function(variable)
    return abs(2 * expansion[2]).upper()


def midpoint_integral(function, left, right):
    midpoint = (left + right) / 2
    width = right - left
    value = function(midpoint) * width
    derivative_bound = second_derivative_bound(
        function,
        interval_ball(left, right),
    )
    return value + error_ball(derivative_bound * width**3 / 24)


def psi(x):
    """The fast Farkas weight psi=K/C, evaluated using K-evenness."""

    return K(abs(x)) / C(x)


def psi_negative(x):
    """Analytic branch of psi on a box already proved to lie below zero."""

    return K(-x) / C(x)


def q2_rate_derivative(z, delta):
    """D_2=-d/dx[c_2 K(x+log 2)/C(x)] at x=z-log2+delta."""

    x = z - LOG2 + delta
    target = z + delta
    k_target, kp_target = K_and_K_prime(target)
    return (
        LOG2
        / (SQRT2 * C(x))
        * (-kp_target + q(1, 2) * tanh_half(x) * k_target)
    )


def arch_rate_integrand(z, delta, u):
    """A_R integrand on z<=y<=1 after y=z+(1-z)u."""

    x = z - LOG2 + delta
    y = z + (1 - z) * u
    distance = y - x
    kernel = minus_J_prime(distance) - q(1, 2) * tanh_half(x) * J(distance)
    return (1 - z) * kernel * K(y) / C(x)


def arch_rate_tail(z, delta):
    """Upper bound for the A_R integral over y>=1."""

    x = z - LOG2 + delta
    distance = 1 - x
    kernel = minus_J_prime(distance) - q(1, 2) * tanh_half(x) * J(distance)
    # U(y)>=U(1)=GAMMA and the extra exp(-y/2) factors in the
    # kernel only improve this bound.
    return kernel * K_ONE / (C(x) * (GAMMA + q(1, 2)))


def weighted_prime(z, delta):
    return psi_negative(z - LOG2 + delta) * q2_rate_derivative(z, delta)


def weighted_arch_integrand(z, delta, u):
    return psi_negative(z - LOG2 + delta) * arch_rate_integrand(z, delta, u)


def certify_left_q2_rectangle(
    z_left,
    z_right,
    delta_left,
    delta_right,
    *,
    z_cells,
    delta_cells,
    u_cells,
    target=q(9, 500),
):
    """Lower-bound 2 int psi(x)(D_2-A_R) dx / psi(z).

    This is a contribution to 2 N_psi from the forward q=2 rectangle on the
    left of z.  Pointwise D_2>A_R is checked before the integral is used.
    """

    minimum = None
    for z_index in range(z_cells):
        zl = z_left + (z_right - z_left) * z_index / z_cells
        zr = z_left + (z_right - z_left) * (z_index + 1) / z_cells
        z = interval_ball(zl, zr)
        prime = arb(0)
        arch = arb(0)
        delta_width = (delta_right - delta_left) / delta_cells
        for delta_index in range(delta_cells):
            dl = delta_left + delta_width * delta_index
            dr = dl + delta_width
            delta = interval_ball(dl, dr)

            # Certify D_2>A_R directly.  The u-transform covers [z,infinity)
            # exactly, so no unreported spatial tail remains.
            arch_rate = arb(0)
            for u_index in range(u_cells):
                ul = q(u_index, u_cells)
                ur = q(u_index + 1, u_cells)
                # A direct interval Riemann enclosure is faster here than a
                # nested Taylor rule and is rigorous because the whole
                # u-cell is evaluated at once.
                arch_rate += (
                    arch_rate_integrand(z, delta, interval_ball(ul, ur))
                    * (ur - ul)
                )
            arch_rate += arch_rate_tail(z, delta)
            assert q2_rate_derivative(z, delta) > arch_rate, (
                "q2 pointwise sign failed",
                z_index,
                delta_index,
                z,
                delta,
                q2_rate_derivative(z, delta),
                arch_rate,
            )

            prime += midpoint_integral(
                lambda d: weighted_prime(z, d),
                dl,
                dr,
            )
            psi_mass = midpoint_integral(
                lambda d: psi_negative(z - LOG2 + d),
                dl,
                dr,
            )
            # arch_rate encloses A_R uniformly on this entire delta-cell.
            # Multiplying its upper endpoint by the exact psi mass gives a
            # one-sided upper bound, which is the direction needed below.
            arch += arb(arch_rate.upper()) * psi_mass

        ratio_reserve = 2 * (prime - arch) - target * psi(z)
        assert ratio_reserve > 0, (
            "Npsi reserve failed",
            z_index,
            zl,
            zr,
            prime,
            arch,
            psi(z),
            ratio_reserve,
        )
        if minimum is None or ratio_reserve.lower() < minimum.lower():
            minimum = ratio_reserve
    return minimum


def certify_compact_npsi():
    """Certify 2 N_psi(z)>9 psi(z)/500 on 0<=z<=log(2)/2.

    Four rational z-ranges use the favorable q=2 rectangles found by exact
    sign isolation.  The first range has additional reflected mass; the
    left rectangle alone is already very close to the target, so for now the
    reported comparison deliberately requires it to carry the whole target.
    """

    # On |z|<=1/20, the two reflected rectangles are disjoint and each
    # supplies 9/1000 of psi.  For z>=1/20 the left rectangle alone has the
    # full 9/500 reserve.
    reflected = certify_left_q2_rectangle(
        -q(1, 20),
        arb(0),
        q(3, 25),
        q(17, 50),
        z_cells=32,
        delta_cells=48,
        u_cells=96,
        target=q(7, 1000),
    )
    direct = certify_left_q2_rectangle(
        arb(0),
        q(1, 20),
        q(7, 100),
        q(9, 25),
        z_cells=32,
        delta_cells=48,
        u_cells=96,
        target=q(11, 1000),
    )
    print("compact reflected Npsi range:", -q(1, 20), q(1, 20))
    print("reflected/direct reserve enclosures:", reflected, direct)

    partitions = (
        (q(1, 20), q(3, 20), q(3, 100), q(8, 25), 24),
        (q(3, 20), q(1, 4), q(1, 50), q(29, 100), 24),
        (q(1, 4), HALF_LOG2, q(1, 50), q(1, 4), 24),
    )
    results = []
    for zl, zr, dl, dr, cells in partitions:
        result = certify_left_q2_rectangle(
            zl,
            zr,
            dl,
            dr,
            z_cells=cells,
            delta_cells=48,
            u_cells=96,
        )
        results.append((zl, zr, result))
        print("compact Npsi range:", zl, zr)
        print("reserve enclosure:", result)
    return results


def certify_scaled_dyadic_npsi(
    power,
    z_left,
    z_right,
    *,
    z_cells=128,
    u_cells=96,
):
    """Certify 2 N_psi>9 psi/500 using q=2**power.

    Put L=power*log(2), a=z-L, delta=u/U(z), and integrate
    1/50<=u<=4/5.  Item 104's proved bound U'/U<=15/4 gives

        K(z+delta)/K(z)
          >= exp[-u exp(15u/(4U(z)))].

    A direct cut-tail estimate proves D_q>=4 A_R on every box below, so
    D_q-A_R>=3D_q/4.  All tiny K(z) factors have cancelled before Arb
    evaluation; this prevents a false loss of relative precision.
    """

    shift = power * LOG2
    coefficient = LOG2 * (-shift / 2).exp()
    ulower = q(1, 50)
    uupper = q(4, 5)
    minimum = None
    for z_index in range(z_cells):
        zl = z_left + (z_right - z_left) * z_index / z_cells
        zr = z_left + (z_right - z_left) * (z_index + 1) / z_cells
        z = interval_ball(zl, zr)
        uz = U_large_tight(z)
        assert uz > q(37, 5)
        total_lower = arb(0)
        for u_index in range(u_cells):
            u0 = ulower + (uupper - ulower) * u_index / u_cells
            u1 = ulower + (uupper - ulower) * (u_index + 1) / u_cells
            u = interval_ball(u0, u1)
            delta = u / uz
            x = z - shift + delta

            # Relative K ratio and derivative factor, using U monotonicity
            # and the already-certified logarithmic derivative bound.
            u_ratio_upper = (q(15, 4) * u / uz).exp()
            k_ratio_lower = (-u * u_ratio_upper).exp()
            derivative_factor = 1 - 1 / (2 * uz)

            distance = shift - delta
            arch_kernel = minus_J_prime(distance) - q(1, 2) * tanh_half(x) * J(distance)
            d_over_arch = (
                coefficient
                * k_ratio_lower
                * derivative_factor
                * uz**2
                / arch_kernel
            )
            assert d_over_arch > 4

            normalized_lower = (
                q(3, 2)
                * coefficient
                * C(z)
                * K(abs(x))
                / C(x) ** 2
                * k_ratio_lower
                * derivative_factor
            )
            assert normalized_lower > 0
            total_lower += arb(normalized_lower.lower()) * (u1 - u0)

        reserve = total_lower - q(9, 500)
        assert reserve > 0, (
            "scaled dyadic Npsi reserve failed",
            power,
            z_index,
            z,
            total_lower,
            reserve,
        )
        if minimum is None or reserve.lower() < minimum.lower():
            minimum = reserve
    print("scaled dyadic Npsi power/range:", power, z_left, z_right)
    print("normalized reserve enclosure:", minimum)
    return minimum


def certify_midrange_npsi():
    results = []
    for power in range(1, 8):
        left = max(HALF_LOG2, (power - q(1, 2)) * LOG2)
        right = (power + q(1, 2)) * LOG2
        results.append(
            certify_scaled_dyadic_npsi(
                power,
                left,
                right,
                z_cells=32,
                u_cells=64,
            )
        )
    return results


def certify_uniform_dyadic_tail_npsi():
    """Certify the same Npsi bound for every dyadic power k>=8.

    Write L=k log(2), z=L+a, |a|<=log(2)/2 and delta=u/U(z).
    The exact coefficient satisfies

        exp(-L/2) C(L+a) >= exp(a/2)/2.

    Item 104 proves that U is increasing and U'/U<=15/4 on this
    half-line.  Consequently U(z)>=U(15 log(2)/2)=:U0, and all remaining
    k-dependence is removed by the one-sided bounds used below.  The compact
    Arb cover is therefore a certificate for infinitely many powers, not a
    finite extrapolation.
    """

    z0 = q(15, 2) * LOG2
    u0 = U_large_tight(z0)
    assert u0 > q(1000)
    ulower = q(1, 50)
    uupper = q(4, 5)

    # The factor exp(-L/2) in D and J(L-delta) in A_R cancel exactly.
    # With x=a+delta one has -tanh(x/2)/2<=1/2, so the bracket multiplying
    # J is at most 1+2/(exp(2d)-1).  These worst-case values certify the
    # pointwise sign D>=4 A_R uniformly before any favorable rectangle is
    # integrated.
    delta_max = uupper / u0
    distance_min = 8 * LOG2 - delta_max
    arch_scaled_upper = (
        (delta_max / 2).exp()
        / (1 - (-2 * distance_min).exp())
        * (1 + 2 / ((2 * distance_min).exp() - 1))
    )
    uniform_k_ratio = (
        -uupper * (q(15, 4) * uupper / u0).exp()
    ).exp()
    uniform_derivative = 1 - 1 / (2 * u0)
    uniform_d_over_arch = (
        LOG2
        * uniform_k_ratio
        * uniform_derivative
        * u0**2
        / arch_scaled_upper
    )
    assert uniform_d_over_arch > 4
    a_cells = 128
    u_cells = 96
    total_minimum = None
    for a_index in range(a_cells):
        al = -HALF_LOG2 + LOG2 * a_index / a_cells
        ar = -HALF_LOG2 + LOG2 * (a_index + 1) / a_cells
        a = interval_ball(al, ar)
        total = arb(0)
        for u_index in range(u_cells):
            ul = ulower + (uupper - ulower) * u_index / u_cells
            ur = ulower + (uupper - ulower) * (u_index + 1) / u_cells
            u = interval_ball(ul, ur)

            # Here 0<=delta<=u/U0.  Enlarging to that full interval loses
            # correlation only in the safe (lower-bound) direction.
            delta = interval_ball(arb(0), arb((u / u0).upper()))
            x = a + delta
            k_ratio = (-u * (q(15, 4) * u / u0).exp()).exp()
            derivative_factor = 1 - 1 / (2 * u0)
            normalized = (
                q(3, 4)
                * LOG2
                * (a / 2).exp()
                * K(abs(x))
                / C(x) ** 2
                * k_ratio
                * derivative_factor
            )
            assert normalized > 0
            total += arb(normalized.lower()) * (ur - ul)
        reserve = total - q(9, 500)
        assert reserve > 0, (
            "uniform dyadic tail Npsi reserve failed",
            a_index,
            a,
            total,
            reserve,
        )
        if total_minimum is None or reserve.lower() < total_minimum.lower():
            total_minimum = reserve
    print("uniform dyadic Npsi tail: every power >= 8")
    print("normalized reserve enclosure:", total_minimum)
    return total_minimum


def prime_powers_through(limit):
    """Return exact (q,p) pairs with q=p**j<=limit."""

    sieve = [True] * (limit + 1)
    primes = []
    for candidate in range(2, limit + 1):
        if sieve[candidate]:
            primes.append(candidate)
            if candidate * candidate <= limit:
                for multiple in range(candidate * candidate, limit + 1, candidate):
                    sieve[multiple] = False
    answer = []
    for prime in primes:
        power = prime
        while power <= limit:
            answer.append((power, prime))
            power *= prime
    answer.sort()
    return answer


COMPACT_PRIME_POWERS = prime_powers_through(2048)


def certify_tv_tail_constants():
    """Elementary absolute tails omitted by the compact Tv cover."""

    # For t>=2, item 153's termwise theta estimates give
    # K<=4*pi^2 exp(9t/2-pi exp(2t)) and
    # A=K U<=12*pi^3 exp(13t/2-pi exp(2t)).
    # Also J(t)<=101 exp(-t/2)/100.  The logarithmic derivative of the
    # resulting arch majorant is at most 6-2*pi*exp(4)<0.
    arch_first = (
        8
        * q(101, 100)
        * 12
        * PI**3
        * (12 - PI * arb(4).exp()).exp()
    )
    arch_tail = arch_first / (2 * PI * arb(4).exp() - 6)
    assert arch_tail < arb("1e-60")

    # For q>2048 and x<=5, t=log(q)-x>=log(2049)-5>2.
    # Overcount prime powers by every integer and use Lambda(n)<=log n.
    # The displayed b_n has consecutive ratio below 3/5 from n=2049 on.
    n0 = arb(2049)
    gaussian = PI * arb(-10).exp()
    prime_first = (
        48
        * PI**3
        * (-q(65, 2)).exp()
        * n0.log()
        * n0**6
        * (-gaussian * n0**2).exp()
    )
    ratio = (
        (arb(2050).log() / n0.log())
        * (arb(2050) / n0) ** 6
        * (-gaussian * (2 * n0 + 1)).exp()
    )
    assert ratio < q(3, 5)
    prime_tail = prime_first / (1 - ratio)
    assert prime_tail < arb("1e-240")
    return arch_tail, prime_tail


TV_ARCH_TAIL, TV_PRIME_TAIL = certify_tv_tail_constants()


def compact_arch_E_scaled(
    x,
    *,
    u_cells=96,
    t_cells=192,
    theta_cells=8,
    return_parts=False,
):
    """Enclose C(x) E_A(x) on 1/1000<=x<=5.

    With A=KU, B=KUr and r=B/A, the integrand is
    D_x(y)=r(x)A(y)-B(y).  Pairing the two sides of x and then using
    h=xu on 0<h<x and h=x+t on h>x gives

      x int_0^1 J(xu){D(x(1+u))+D(x(1-u))}du
       +int_0^inf J(x+t){D(2x+t)-D(t)}dt.

    This is the even-reflection step; every argument of A,B below is
    nonnegative.  The first u-cell is bounded by Taylor's theorem so the
    removable J pole is never evaluated as an interval division by zero.
    """

    kx, _, _, _ = K_through_third_nonnegative(x)
    ax = A_nonnegative(x)
    bx = B_nonnegative(x)
    rx = r_tight_nonnegative(x)

    def determinant(t):
        return rx * A_nonnegative(t) - B_nonnegative(t)

    def determinant_prime(t):
        return rx * A_prime_nonnegative(t) - B_prime_nonnegative(t)

    def determinant_second(t):
        return rx * A_second_nonnegative(t) - B_second_nonnegative(t)

    u_cut = q(1, 100)
    local_left = x * (1 - u_cut)
    local_right = x * (1 + u_cut)
    local_box = interval_ball(
        arb(max(arb(0), arb(local_left.lower()))),
        arb(local_right.upper()),
    )
    f_second = determinant_second(local_box)
    x_upper = arb(x.upper())
    near_zero_bound = (
        x_upper**2
        * u_cut**2
        * (x_upper * u_cut / 2).exp()
        * abs(f_second).upper()
        / 4
    )

    near = arb(0)
    for index in range(u_cells):
        ul = u_cut + (1 - u_cut) * index / u_cells
        ur = u_cut + (1 - u_cut) * (index + 1) / u_cells
        u = interval_ball(ul, ur)
        a = x * u
        symmetric = stable_determinant_from_delta(
            x,
            a,
            theta_cells=theta_cells,
        ) + stable_determinant_from_delta(
            x,
            -a,
            theta_cells=theta_cells,
        )
        integrand = x * J(a) * symmetric
        width = ur - ul
        near += integrand * width

    far = arb(0)
    t_stop = arb(2)
    for index in range(t_cells):
        tl = t_stop * index / t_cells
        tr = t_stop * (index + 1) / t_cells
        tm = (tl + tr) / 2
        t = interval_ball(tl, tr)
        delta_midpoint = determinant(2 * x + tm) - determinant(tm)
        integrand_midpoint = J(x + tm) * delta_midpoint
        delta = determinant(2 * x + t) - determinant(t)
        delta_prime = determinant_prime(2 * x + t) - determinant_prime(t)
        delta_second = determinant_second(2 * x + t) - determinant_second(t)
        integrand_second = (
            J_second(x + t) * delta
            + 2 * J_prime(x + t) * delta_prime
            + J(x + t) * delta_second
        )
        width = tr - tl
        far += (
            integrand_midpoint * width
            + error_ball(abs(integrand_second).upper() * width**3 / 24)
        )

    # The analytic tail is two-sided; add its absolute value only in the
    # adverse direction.  Its bound is uniform in the whole compact x-box.
    if return_parts:
        return near, far, arb(near_zero_bound), TV_ARCH_TAIL
    return near + far + arb(near_zero_bound) + TV_ARCH_TAIL


def compact_prime_E_scaled(x, *, theta_cells=16):
    """Enclose C(x) E_P(x), with an analytic q>2048 tail."""

    ax = A_nonnegative(x)
    rx = r_tight_nonnegative(x)

    def determinant_signed(t):
        return rx * signed_A(t) - signed_B(t)

    total = arb(0)
    for power, prime in COMPACT_PRIME_POWERS:
        shift = arb(power).log()
        coefficient = arb(prime).log() / arb(power).sqrt()
        # The few low shifts carry essentially all of the mass and need
        # their +/- cancellation retained across an x-box.  Remote targets
        # are already theta-small, so direct signed evaluation is sharper.
        if power <= 32:
            outward = stable_determinant_from_delta(
                x,
                shift,
                theta_cells=theta_cells,
            )
            if x < shift:
                inward = -stable_determinant_from_delta(
                    x,
                    shift - 2 * x,
                    theta_cells=theta_cells,
                )
            elif x > shift:
                inward = stable_determinant_from_delta(
                    x,
                    -shift,
                    theta_cells=theta_cells,
                )
            else:
                inward = determinant_signed(x - shift)
            total += coefficient * (outward + inward)
        else:
            total += coefficient * (
                determinant_signed(x + shift)
                + determinant_signed(x - shift)
            )
    return total + TV_PRIME_TAIL


def certify_compact_tv_bound(
    left,
    right,
    *,
    x_cells,
    u_cells=96,
    t_cells=192,
):
    """Prove Tv<=(129/250)v on one rational compact x-range."""

    minimum = None
    minimum_index = None
    for index in range(x_cells):
        xl = left + (right - left) * index / x_cells
        xr = left + (right - left) * (index + 1) / x_cells
        x = interval_ball(xl, xr)
        k, _, _, _ = K_through_third_nonnegative(x)
        u = U_tight_nonnegative(x)
        rx = r_tight_nonnegative(x)
        rhs = C(x) * rx * (q(2, 125) * u - tanh_half(x) / 4)
        lhs = compact_arch_E_scaled(
            x,
            u_cells=u_cells,
            t_cells=t_cells,
        ) + compact_prime_E_scaled(x)
        reserve = rhs - lhs
        assert reserve > 0, (
            "compact Tv reserve failed",
            index,
            x,
            rhs,
            lhs,
            reserve,
        )
        if minimum is None or reserve.lower() < minimum.lower():
            minimum = reserve
            minimum_index = index
    print("compact Tv range:", left, right)
    print("reserve/index:", minimum, minimum_index)
    return minimum


def certify_compact_tv():
    covers = (
        (q(1, 1000), q(1, 20), 48),
        (q(1, 20), q(1, 4), 64),
        (q(1, 4), arb(1), 96),
        (arb(1), arb(2), 64),
        (arb(2), arb(5), 96),
    )
    return [
        certify_compact_tv_bound(left, right, x_cells=cells)
        for left, right, cells in covers
    ]


if __name__ == "__main__":
    certify_compact_npsi()
    certify_midrange_npsi()
    certify_uniform_dyadic_tail_npsi()
    print("PARTIAL CERTIFICATE: global Npsi bound")
