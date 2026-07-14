#!/usr/bin/env python3
"""Rigorous finite core checks for the increasing-path-metric Farkas dual.

This script only certifies the compact numerical part of the argument.  The
tail is handled by the explicit dyadic estimates recorded with the proof.

Reproduction:

    PYTHONPATH=/tmp/pvdeps python3 scripts/path_metric_farkas_certificate.py
"""

from flint import arb, arb_series, ctx


ctx.prec = 160


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
LOG2 = arb(2).log()
SQRT2 = arb(2).sqrt()
Z_MAX = LOG2 / 2
DELTA_LEFT = q(1, 10)
DELTA_RIGHT = q(11, 40)
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


# On 0 <= x <= 1, the n >= 7 tails in K and K' are smaller than 1e-40.
# Indeed k_n <= 2000 n^4 exp(-pi n^2), while
# |k_n'| <= 100000 n^6 exp(-pi n^2), and consecutive majorants from n=7
# have ratio below (8/7)^6 exp(-15 pi).
for power, factor in (
    (4, 2000),
    (6, 100000),
    (8, 10000000),
    # This also dominates every omitted derivative through K''' that enters
    # a second-derivative midpoint remainder below.
    (10, 1000000000000),
):
    first = arb(7) ** power * (-PI * 49).exp()
    ratio = (arb(8) / 7) ** power * (-PI * 15).exp()
    assert factor * first / (1 - ratio) < arb("1e-40")

THETA_ERROR = arb(0, "1e-40")
THETA_SERIES_ERROR = arb(0, "1e-35")


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


def K_KP_KPP(x):
    k = 0
    kp = 0
    kpp = 0
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
        minus_logarithmic_derivative_prime = (
            4 * y + 24 * y / (2 * y - 3) ** 2
        )
        k += kn
        kp += kn * logarithmic_derivative
        kpp += kn * (
            logarithmic_derivative**2
            - minus_logarithmic_derivative_prime
        )
    # The analogous n^8 majorant is also below 1e-40 from n=7 onward.
    return k + THETA_ERROR, kp + THETA_ERROR, kpp + THETA_ERROR


K_ONE, KP_ONE = K_and_K_prime(ONE)
GAMMA = -KP_ONE / K_ONE


def certify_tail_constants():
    """Certify every compact/numerical constant in the dyadic tail proof."""
    z0 = LOG2 / 2
    k_at_z0, kp_at_z0, _ = K_KP_KPP(z0)
    assert -kp_at_z0 / k_at_z0 > q(37, 5)
    cover_cells = 8192
    for index in range(cover_cells):
        left = z0 + (LOG2 - z0) * index / cover_cells
        right = z0 + (LOG2 - z0) * (index + 1) / cover_cells
        z = interval_ball(left, right)
        k, kp, kpp = K_KP_KPP(z)
        u = -kp / k
        up = (kp / k) ** 2 - kpp / k
        assert up > 0
        assert up / u < q(15, 4)

        f_prime = (
            z.exp() / (u - q(1, 2))
            - z.exp() * up / (u - q(1, 2)) ** 2
            + up / (u + q(1, 2)) ** 2
        )
        assert f_prime < 0

    # For z >= log(2), put y=pi exp(2z)>=4pi.  If
    # g(y)=2y-5/2-4y/(2y-3), then g_x'=4y+24y/(2y-3)^2.
    # The polynomial below is 4(2y-3)^2[(5/2)g-g_x']; it is
    # positive at 4pi and increasing thereafter.  Hence termwise
    # g_x'<(5/2)g, and U'/U<5/2 after subtracting the variance.
    y0 = 4 * PI
    polynomial = 16 * y0**3 - 228 * y0**2 + 360 * y0 - 225
    polynomial_prime = 48 * y0**2 - 456 * y0 + 360
    assert polynomial > 0
    assert polynomial_prime > 0
    assert 96 * y0 - 456 > 0

    # The variance cannot spoil the termwise strict inequality g_x'>2g.
    # For n>=2, k_n/k_1 <= (8/7)n^4 exp(-(n^2-1)y0), and
    # (g_n-g_1)^2 <= 4n^4y0^2.  The n-tail ratio is maximized at n=2.
    first_weight = q(8, 7) * 2**4 * (-3 * y0).exp()
    weight_ratio = (q(3, 2)) ** 4 * (-5 * y0).exp()
    epsilon = first_weight / (1 - weight_ratio)
    variance_first = q(32, 7) * y0**2 * 2**8 * (-3 * y0).exp()
    variance_ratio = (q(3, 2)) ** 8 * (-5 * y0).exp()
    variance_bound = variance_first / (1 - variance_ratio)
    g1_difference = 5 + 8 * y0 / (2 * y0 - 3) + 24 * y0 / (2 * y0 - 3) ** 2
    assert g1_difference / (1 + epsilon) - variance_bound > 0

    # Constants used in D >= 10 A_R and in the integrated dyadic bound.
    u_min = q(37, 5)
    x_max = LOG2 / 2 + q(5, 74)
    assert K(x_max) > q(7, 100)
    assert q(1, 2) * tanh_half(LOG2 / 2) < q(9, 100)
    d_min = LOG2 - q(5, 74)
    assert q(1, 2) + 2 / ((2 * d_min).exp() - 1) + q(9, 100) < q(7, 5)
    assert 1 / (1 - (-2 * d_min).exp()) < q(10, 7)
    assert (q(5, 148)).exp() < q(26, 25)

    logarithmic_growth = q(15, 4)
    integrated_u_upper = (
        u_min
        / logarithmic_growth
        * ((logarithmic_growth / (2 * u_min)).exp() - 1)
    )
    assert (-integrated_u_upper).exp() > q(14, 25)

    d_over_arch = (
        LOG2
        * q(14, 25)
        * q(731, 740)
        * u_min
        * (u_min + q(1, 2))
        / q(52, 25)
    )
    assert d_over_arch > 10

    tail_coefficient = (
        q(9, 5)
        * q(7, 100)
        * q(731, 740)
        * q(7, 50)
        * LOG2
    )
    k0, kp0, _ = K_KP_KPP(z0)
    u0 = -kp0 / k0
    f0 = z0.exp() / (u0 - q(1, 2)) - 1 / (u0 + q(1, 2))
    assert q(101, 100) * f0 < 8 * tail_coefficient / arb(2).sqrt().sqrt()
    return tail_coefficient


def interval_ball(left, right):
    return arb(
        (left + right) / 2,
        (right - left) / 2 + arb("1e-45"),
    )


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


def prime_integrand(z, delta):
    x = z - LOG2 + delta
    target = z + delta
    k_target, kp_target = K_and_K_prime(target)
    # C(x) cancels before evaluation; no U=-K'/K division occurs.
    return (
        LOG2
        / SQRT2
        * K(-x)
        * (-kp_target + q(1, 2) * tanh_half(x) * k_target)
    )


def arch_integrand(z, delta, v):
    x = z - LOG2 + delta
    y = z + (1 - z) * v
    distance = y - x
    kernel = minus_J_prime(distance) - q(1, 2) * tanh_half(x) * J(distance)
    # C(x) cancels against the lower bound phi(x) >= C(x)K(x).
    return (1 - z) * K(-x) * kernel * K(y)


def residual_integrand(z, v):
    y = z + (1 - z) * v
    return (1 - z) * S(y) * K(y)


def arch_tail_integrand(z, delta):
    x = z - LOG2 + delta
    distance = 1 - x
    kernel = minus_J_prime(distance) - q(1, 2) * tanh_half(x) * J(distance)
    return K(-x) * kernel * K_ONE / (GAMMA + q(1, 2))


def arch_rate_integrand(z, delta, v):
    x = z - LOG2 + delta
    y = z + (1 - z) * v
    distance = y - x
    kernel = minus_J_prime(distance) - q(1, 2) * tanh_half(x) * J(distance)
    return (1 - z) * kernel * K(y) / C(x)


def arch_rate_tail(z, delta):
    x = z - LOG2 + delta
    distance = 1 - x
    kernel = minus_J_prime(distance) - q(1, 2) * tanh_half(x) * J(distance)
    return kernel * K_ONE / (C(x) * (GAMMA + q(1, 2)))


def q2_rate_derivative(z, delta):
    x = z - LOG2 + delta
    target = z + delta
    k_target, kp_target = K_and_K_prime(target)
    return (
        LOG2
        / (SQRT2 * C(x))
        * (-kp_target + q(1, 2) * tanh_half(x) * k_target)
    )


def certify_core(
    z_cells: int,
    delta_cells: int,
    v_cells: int,
    z_start=arb(0),
    z_stop=Z_MAX,
):
    delta_width = (DELTA_RIGHT - DELTA_LEFT) / delta_cells
    v_width = ONE / v_cells
    minimum = None
    minimum_index = None

    # For y >= 1, K(y) <= K(1)exp(-GAMMA(y-1)).
    residual_tail = (
        q(1, 2)
        * (q(1, 2)).exp()
        * K_ONE
        / (GAMMA - q(1, 2))
    )

    for z_index in range(z_cells):
        z_left = z_start + (z_stop - z_start) * z_index / z_cells
        z_right = z_start + (z_stop - z_start) * (z_index + 1) / z_cells
        z = interval_ball(z_left, z_right)
        prime = arb(0)
        arch = arb(0)

        for delta_index in range(delta_cells):
            delta_left = DELTA_LEFT + delta_width * delta_index
            delta_right = delta_left + delta_width
            delta_midpoint = (delta_left + delta_right) / 2
            delta_ball = interval_ball(delta_left, delta_right)

            prime += midpoint_integral(
                lambda delta: prime_integrand(z, delta),
                delta_left,
                delta_right,
            )

            for v_index in range(v_cells):
                v_left = v_width * v_index
                v_right = v_left + v_width
                v_midpoint = (v_left + v_right) / 2
                v_ball = interval_ball(v_left, v_right)
                midpoint_value = (
                    arch_integrand(z, delta_midpoint, v_midpoint)
                    * delta_width
                    * v_width
                )
                delta_error = (
                    second_derivative_bound(
                        lambda delta: arch_integrand(z, delta, v_ball),
                        delta_ball,
                    )
                    * delta_width**3
                    * v_width
                    / 24
                )
                v_error = (
                    second_derivative_bound(
                        lambda v: arch_integrand(z, delta_ball, v),
                        v_ball,
                    )
                    * delta_width
                    * v_width**3
                    / 24
                )
                arch += midpoint_value + error_ball(delta_error + v_error)

            arch += midpoint_integral(
                lambda delta: arch_tail_integrand(z, delta),
                delta_left,
                delta_right,
            )

            # Pointwise D_2 > A_R is needed before replacing phi by C K.
            arch_rate = arb(0)
            for v_index in range(v_cells):
                v_left = v_width * v_index
                v_right = v_left + v_width
                arch_rate += midpoint_integral(
                    lambda v: arch_rate_integrand(z, delta_ball, v),
                    v_left,
                    v_right,
                )
            arch_rate += arch_rate_tail(z, delta_ball)
            assert q2_rate_derivative(z, delta_ball) > arch_rate

        residual = arb(0)
        for v_index in range(v_cells):
            v_left = v_width * v_index
            v_right = v_left + v_width
            residual += midpoint_integral(
                lambda v: residual_integrand(z, v),
                v_left,
                v_right,
            )
        residual += residual_tail

        # Certify a uniform one-percent strict dual reserve.
        difference = 2 * (prime - arch) - q(101, 400) * residual
        # This assertion is deliberately inside the loop: an indeterminate
        # Arb ordering must never cause a failing cell to be skipped by the
        # reporting-minimum logic below.
        assert difference > 0
        if minimum is None or difference.lower() < minimum.lower():
            minimum = difference
            minimum_index = z_index

    return minimum, minimum_index


if __name__ == "__main__":
    tail_coefficient = certify_tail_constants()
    print("dyadic tail coefficient:", tail_coefficient)
    # The margin is smallest at z=0, so use a nonuniform rational cover.
    covers = (
        (arb(0), q(1, 100), 16),
        (q(1, 100), q(1, 20), 16),
        (q(1, 20), q(1, 10), 32),
        (q(1, 10), Z_MAX, 64),
    )
    certified = []
    for left, right, cells in covers:
        minimum, index = certify_core(
            cells,
            48,
            48,
            left,
            right,
        )
        assert minimum > 0
        certified.append((left, right, minimum, index))
        print("core subinterval:", left, right)
        print("minimum enclosure:", minimum, "at local cell", index)
        print("minimum lower endpoint:", minimum.lower())
        print("minimum upper endpoint:", minimum.upper())
        print("rigorous positivity comparison:", bool(minimum > 0))
    print("CERTIFIED: compact path-metric Farkas coefficient is negative")
