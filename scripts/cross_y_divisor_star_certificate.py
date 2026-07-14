#!/usr/bin/env python3
"""Interval audit of the non-lumpable cross-y theta/divisor star lift.

The audited carrier uses the exact positive divisor lift for prime edges and
the following true coupling of theta labels on each physical archimedean
edge.  If 0 <= a <= b and pi_a(m)=g_m(a)/K(a), then

    gamma(1,1)=pi_a(1),
    gamma(m,m)=pi_b(m),
    gamma(m,1)=pi_a(m)-pi_b(m),  m>=2.

The theta likelihood ratios imply pi_a(m)>=pi_b(m) for m>=2.  The coupling
is diagonal at a=b and therefore has finite energy against J(|a-b|).

This script is under active audit.  Its final assertions will certify that
the full-carrier sharp half-gap fails for the integer polynomial

    h(y)=2y-33y^2+192y^3-450y^4+360y^5.
"""

from flint import arb, arb_series, ctx


ctx.prec = 128


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
LOGS = [arb(0)] + [arb(m).log() for m in range(1, 65)]


def C(x: arb) -> arb:
    return ((x / 2).exp() + (-x / 2).exp()) / 2


def J(x: arb) -> arb:
    return (-x / 2).exp() / (1 - (-2 * x).exp())


def h(x: arb) -> arb:
    return x * (2 + x * (-33 + x * (192 + x * (-450 + 360 * x))))


def hp(x: arb) -> arb:
    return 2 + x * (-66 + x * (576 + x * (-1800 + 1800 * x)))


def hv(x: arb) -> arb:
    """Mean-value enclosure, tighter than direct interval Horner evaluation."""
    midpoint = x.mid()
    return h(midpoint) + hp(x) * (x - midpoint)


H_COEFFICIENTS = (0, 2, -33, 192, -450, 360)


def hdiff(x: arb, y: arb) -> arb:
    """Cancellation-free enclosure of h(x)-h(y)."""
    divided = arb(0)
    for degree in range(1, 6):
        monomial_sum = arb(0)
        for index in range(degree):
            monomial_sum += x ** (degree - 1 - index) * y**index
        divided += H_COEFFICIENTS[degree] * monomial_sum
    return (x - y) * divided


def hdiff_known(x: arb, y: arb, difference: arb) -> arb:
    """Divided difference when x-y has a dependency-free expression."""
    divided = arb(0)
    for degree in range(1, 6):
        monomial_sum = arb(0)
        for index in range(degree):
            monomial_sum += x ** (degree - 1 - index) * y**index
        divided += H_COEFFICIENTS[degree] * monomial_sum
    return difference * divided


def hdiff_centered(x: arb, y: arb) -> arb:
    """First-order mean-value enclosure around independent midpoint balls."""
    x_mid = x.mid()
    y_mid = y.mid()
    return (
        h(x_mid)
        - h(y_mid)
        + hp(x) * (x - x_mid)
        - hp(y) * (y - y_mid)
    )


def g_gp_ld(n: int, x: arb) -> tuple[arb, arb, arb]:
    y = PI * n * n * (2 * x).exp()
    g = PI * n * n * (q(5, 2) * x).exp() * (2 * y - 3) * (-y).exp()
    ld = q(5, 2) + 4 * y / (2 * y - 3) - 2 * y
    return g, g * ld, ld


def g_and_gp(n: int, x: arb) -> tuple[arb, arb]:
    g, gp, _ = g_gp_ld(n, x)
    return g, gp


# On x>=0 the n>=5 tails, including the polynomial factors used below, are
# far below the temporary symmetric enclosures.  The final version replaces
# these provisional radii by displayed geometric majorants.
K_TAIL = arb(0, "1e-28")
KP_TAIL = arb(0, "1e-26")


def K_and_Kp(x: arb) -> tuple[arb, arb]:
    k = arb(0)
    kp = arb(0)
    for n in range(1, 5):
        gn, gpn = g_and_gp(n, x)
        k += gn
        kp += gpn
    return k + K_TAIL, kp + KP_TAIL


def K(x: arb) -> arb:
    return K_and_Kp(x)[0]


def interval_ball(left: arb, right: arb) -> arb:
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-35"))


def integral_enclosure(function, left: arb, right: arb, pieces: int) -> arb:
    width = (right - left) / pieces
    total = arb(0)
    for index in range(pieces):
        l = left + index * width
        total += function(interval_ball(l, l + width)) * width
    return total


def midpoint_integral_enclosure(function, left: arb, right: arb, pieces: int) -> arb:
    """Composite midpoint rule plus a rigorous interval second derivative."""
    width = (right - left) / pieces
    total = arb(0)
    error = arb(0)
    for index in range(pieces):
        cell_left = left + index * width
        cell_right = cell_left + width
        midpoint = (cell_left + cell_right) / 2
        total += function(midpoint) * width
        variable = arb_series(
            [interval_ball(cell_left, cell_right), arb(1), arb(0)], 3
        )
        second_derivative = 2 * function(variable)[2]
        error += (
            width**3 * second_derivative.abs_upper() / 24
        )
    return total + arb(0, error)


def star_unnormalized(a: arb, d: arb) -> arb:
    """K(a)K(b) times the star-coupling squared h-cost, labels 1..4."""
    b = a + d
    ka = K(a)
    kb = K(b)
    g1a, _ = g_and_gp(1, a)
    total = g1a * kb * hdiff_centered(a, b) ** 2
    for m in range(2, 5):
        gmb, _ = g_and_gp(m, b)
        logm = LOGS[m]
        total += ka * gmb * hdiff_centered(a + logm, b + logm) ** 2

        # The exact residual is
        #   sum_n [g_m(a)g_n(b)-g_n(a)g_m(b)].
        # Terms n>m are negative.  For n<m the following likelihood-ratio
        # formula evaluates the positive determinant without subtraction.
        residual_upper = arb(0)
        gm_a, _ = g_and_gp(m, a)
        for n in range(1, m):
            gn_b, _, ld_n_b = g_gp_ld(n, b)
            _, _, ld_m_b = g_gp_ld(m, b)
            # The likelihood-ratio gap ld_n-ld_m is increasing in the
            # physical coordinate.  Hence its integral from a to b is at
            # most d times its endpoint value.
            ratio_exponent_upper = d * (ld_n_b - ld_m_b)
            determinant = (
                gm_a
                * gn_b
                * (-(-ratio_exponent_upper).expm1())
            )
            residual_upper += determinant
        total += residual_upper * hdiff_centered(a + logm, b) ** 2
    return total


def star_majorant(a, d):
    """Analytic upper majorant used by midpoint/Taylor quadrature."""
    b = a + d
    ka, _ = K_and_Kp(a)
    kb, _ = K_and_Kp(b)
    g1a, _ = g_and_gp(1, a)
    total = g1a * kb * hdiff_known(a, b, -d) ** 2
    for m in range(2, 5):
        gmb, _ = g_and_gp(m, b)
        logm = LOGS[m]
        total += ka * gmb * hdiff_known(
            a + logm, b + logm, -d
        ) ** 2
        gm_a, _ = g_and_gp(m, a)
        residual_upper = 0
        for n in range(1, m):
            gn_b, _, ld_n_b = g_gp_ld(n, b)
            _, _, ld_m_b = g_gp_ld(m, b)
            exponent_upper = d * (ld_n_b - ld_m_b)
            residual_upper += gm_a * gn_b * (
                1 - (-exponent_upper).exp()
            )
        total += residual_upper * hdiff_known(
            a + logm, b, logm - d
        ) ** 2
    return total


def arch_majorant(a, d):
    return 2 * (J(d) + J(2 * a + d)) * star_majorant(a, d)


# Modular-coordinate variance on the carrier.  Labels >=5 and x>1 are
# added as explicit analytic tails in the final audit.
X_MAX = arb(1)


def carrier_moment(power: int) -> arb:
    def integrand(a: arb) -> arb:
        value = arb(0)
        for m in range(1, 5):
            gm, _ = g_and_gp(m, a)
            value += gm * h(a + LOGS[m]) ** power
        return 2 * C(a) * value

    return midpoint_integral_enclosure(integrand, arb(0), X_MAX, 512)


mass = midpoint_integral_enclosure(
    lambda a: 2 * C(a) * K(a), arb(0), X_MAX, 512
)
mean = carrier_moment(1)
second = carrier_moment(2)
variance_core = second - 4 * mean**2


# Near the singular diagonal put b=a+d.  Since W(a,a)=0 and every residual
# coefficient also vanishes there, W/d is bounded by the following
# mean-value expression.  Since d J(d)<=1 and J(2a+d)<=J(d), the local strip
# contributes at most 4 delta int bound(a) da.
DELTA = q(1, 1024)


def local_w_over_d(a: arb) -> arb:
    b = a + interval_ball(arb(0), DELTA)
    ka, _ = K_and_Kp(a)
    kb, _ = K_and_Kp(b)
    a_to_b = interval_ball(a.lower(), b.upper())

    g1a, _ = g_and_gp(1, a)
    total = g1a * kb * DELTA * hp(a_to_b).abs_upper() ** 2
    for m in range(2, 5):
        gma, _ = g_and_gp(m, a)
        gmb, _ = g_and_gp(m, b)
        _, gpmb = g_and_gp(m, a_to_b)
        _, kpb = K_and_Kp(a_to_b)
        logm = LOGS[m]
        total += ka * gmb * DELTA * hp(a_to_b + logm).abs_upper() ** 2
        residual_derivative = (
            gma * kpb - ka * gpmb
        ).abs_upper()
        total += residual_derivative * (
            hv(a + logm) - hv(b)
        ).abs_upper() ** 2
    return total


arch_local = 4 * DELTA * integral_enclosure(
    local_w_over_d, arb(0), X_MAX, 512
)


# Regular rectangle d in [delta,3/2], a in [0,1].
D_MAX = q(3, 2)
A_PIECES = 64
D_PIECES = 128
arch_regular = arb(0)
arch_midpoint = arb(0)
arch_error_a = arb(0)
arch_error_d = arb(0)
arch_error_a_point = arb(0)
arch_error_d_point = arb(0)
arch_range = arb(0)
max_second_a_point = 0.0
max_second_d_point = 0.0
a_width = X_MAX / A_PIECES
d_width = (D_MAX - DELTA) / D_PIECES
for i in range(A_PIECES):
    a_left = i * a_width
    a = interval_ball(a_left, a_left + a_width)
    for j in range(D_PIECES):
        d_left = DELTA + j * d_width
        d = interval_ball(d_left, d_left + d_width)
        a_mid = (a_left + a_left + a_width) / 2
        d_mid = (d_left + d_left + d_width) / 2
        center_value = arch_majorant(a_mid, d_mid)

        a_variable = arb_series([a, arb(1), arb(0)], 3)
        d_variable = arb_series([d, arb(1), arb(0)], 3)
        second_a = 2 * arch_majorant(a_variable, d)[2]
        second_d = 2 * arch_majorant(a, d_variable)[2]
        a_point_variable = arb_series([a_mid, arb(1), arb(0)], 3)
        d_point_variable = arb_series([d_mid, arb(1), arb(0)], 3)
        second_a_point = 2 * arch_majorant(a_point_variable, d_mid)[2]
        second_d_point = 2 * arch_majorant(a_mid, d_point_variable)[2]
        max_second_a_point = max(
            max_second_a_point, float(second_a_point.abs_upper())
        )
        max_second_d_point = max(
            max_second_d_point, float(second_d_point.abs_upper())
        )
        cell_error_a = a_width**2 * second_a.abs_upper() / 24
        cell_error_d = d_width**2 * second_d.abs_upper() / 24
        arch_midpoint += center_value * a_width * d_width
        arch_error_a += cell_error_a * a_width * d_width
        arch_error_d += cell_error_d * a_width * d_width
        arch_error_a_point += (
            a_width**2 * second_a_point.abs_upper() / 24
            * a_width * d_width
        )
        arch_error_d_point += (
            d_width**2 * second_d_point.abs_upper() / 24
            * a_width * d_width
        )
        arch_regular += (
            center_value + cell_error_a + cell_error_d
        ) * a_width * d_width
        arch_range += arch_majorant(a, d) * a_width * d_width


# Reflected cross-y prime energy.  Same-side divisor edges have zero cost for
# h(y).  The displayed finite sum is the exact q<=64,n<=4 core.
def prime_powers(limit: int) -> list[tuple[int, int]]:
    result = []
    for p in range(2, limit + 1):
        prime = all(p % d for d in range(2, int(p**0.5) + 1))
        if not prime:
            continue
        value = p
        while value <= limit:
            result.append((value, p))
            value *= p
    return sorted(result)


prime_core = arb(0)
for prime_power, prime in prime_powers(64):
    length = LOGS[prime_power]
    coefficient = arb(prime).log() / arb(prime_power).sqrt()
    for n in range(1, 5):
        logn = LOGS[n]

        def prime_integrand(a: arb) -> arb:
            gn, _ = g_and_gp(n, length - a)
            return (
                K(a)
                * gn
                * hdiff_known(
                    length - a + logn,
                    a,
                    length + logn - 2 * a,
                ) ** 2
            )

        prime_core += coefficient * midpoint_integral_enclosure(
            prime_integrand, arb(0), length, 128
        )


print("carrier mass core:", mass)
print("carrier variance core:", variance_core)
print("arch local core:", arch_local)
print("arch regular core:", arch_regular)
print("arch regular midpoint/error-a/error-d:", arch_midpoint, arch_error_a, arch_error_d)
print("arch point-Hessian error-a/error-d:", arch_error_a_point, arch_error_d_point)
print("arch natural-range enclosure:", arch_range)
print("max point Hessians a,d:", max_second_a_point, max_second_d_point)
print("prime reflected core:", prime_core)
print("provisional core deficit:", variance_core / 2 - arch_local - arch_regular - prime_core)
