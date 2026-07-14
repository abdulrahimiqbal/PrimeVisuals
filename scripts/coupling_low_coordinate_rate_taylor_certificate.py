#!/usr/bin/env python3
"""Exact selected-rate certificate for 1/5<x<=3/5 and 1<y<=7/5.

Only sources with 1/2<y-x<=4/5 are used in the coupling, but the scalar
rate argument is slightly stronger.  Retain the x-arch restriction
``[x+3/10,x+9/10]`` and from y retain the first two theta/sixteen Levy
summands on ``[-9/10,x+1/2]`` together with inward q=2,3,4,5,7,8,9.

Here is the complete one-coordinate target audit, written with
``r=y-x``.  For the x restriction, ``z-y`` lies in
``[3/10-r,9/10-r]``, hence in ``[-1/2,2/5]``.  For the y arch restriction,
``[x-1/2,x+1/2]`` enters the separation target.  The remaining interval
``[-4/5,x-1/2]`` enters the characteristic target: if ``z<=0`` then
``c(x,z)=max(x,-z)/2<=2/5``, while if ``z>=0`` then
``c(x,z)=(x+z)/2<=7/20``.  Thus ``[-4/5,x+1/2]`` is a single-clock
restriction; only the disjoint tail ``[-9/10,-4/5]`` needs pairing.

The q=2 inward y atom is a separation clock because
``r-log(2) in (-1/2,1/2)``.  For q=3, the same holds unless
``r-log(3)<-1/2``; in that case its target is below ``x-1/2`` and the two
sign cases give characteristic at most ``3/10`` or ``7/20``.  The q=4
target lies in ``(1-log(4),7/5-log(4)]`` and the two sign cases give
characteristic below ``2/5``.  Finally q=5 is negative because
``log(5)>7/5``; using the live constraint ``y>1`` gives
``c(x,y-log(5))<max(3/5,4/5)/2=2/5``.  These are correlated
``y=x+r`` arguments, not conclusions drawn from the containing x-y box.

For fixed y the selected rate decreases with x.  Indeed the derivative of
the x restriction is computed exactly below.  The derivative contributed by
the moving y-target endpoint is

    sech(y/2) K_2(x+1/2) J_16(|y-x-1/2|),

which on the actual source band is at most
``16 sech(1/2) K_2(x+1/2)``.  Forty exact x cells prove that this upper bound
plus the x-rate derivative is negative.  It remains to set x=3/5, where the
rate is the one-variable function with x interval [9/10,3/2] and y interval
[-9/10,11/10].  Taylor's theorem certifies it on 1<=y<=7/5, with direct
rational brackets around the finite-theta cusps y=log 3 and y=log 4.
For 1<=y<11/10 the y interval crosses its source, so the two sides of
``J_16(|y-z|)`` are integrated separately; using the one-sided exponential
formula there would give an invalid upper rather than a lower bound.
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

from coupling_exact_arch_integral import kernel_exponential_integral
from coupling_high_coordinate_rate_taylor_certificate import (
    LEVY_TERMS,
    PRIME_DATA,
    RATES,
    absolute_upper,
    exact_lower,
    finite_integral,
    sech_data,
    theta2_triplet_positive,
)
from coupling_wide_separation_band_certificate import interval, q


ctx.prec = 240

Y_LEFT = arb(1)
Y_RIGHT = q(7, 5)
CELL_COUNT = 400
LOG3_LEFT = arb("1.09861228866")
LOG3_RIGHT = arb("1.09861228868")
LOG4_LEFT = arb("1.38629436111")
LOG4_RIGHT = arb("1.38629436113")

Y_INTEGRALS = tuple(
    finite_integral(rate, arb("-.9"), arb("1.1")) for rate in RATES
)
X_INTEGRALS = tuple(
    finite_integral(-rate, arb(".9"), arb("1.5")) for rate in RATES
)


def x_constant():
    x = q(3, 5)
    value = arb(0)
    for rate, integral_value in zip(RATES, X_INTEGRALS):
        value += (rate * x).exp() * exact_lower(integral_value)
    return value / (x / 2).cosh()


X_CONSTANT = x_constant()


def audit_target_geometry() -> None:
    """Exact endpoint inequalities behind every one-coordinate clock."""

    # Keep rational endpoint equalities out of Arb interval comparisons.
    half_exact = Fraction(1, 2)
    target_c_exact = Fraction(2, 5)
    r_left_exact, r_right_exact = half_exact, Fraction(4, 5)
    x_right_exact = Fraction(3, 5)

    assert Fraction(3, 10) - r_right_exact >= -half_exact
    assert Fraction(9, 10) - r_left_exact <= target_c_exact < half_exact
    assert max(x_right_exact, Fraction(4, 5)) / 2 <= target_c_exact
    assert ((2 * x_right_exact - half_exact) / 2
            <= Fraction(7, 20) < target_c_exact)

    half = q(1, 2)
    target_c = q(2, 5)
    r_left, r_right = half, q(4, 5)
    x_right = q(3, 5)
    y_left, y_right = arb(1), q(7, 5)

    log2 = arb(2).log()
    log3 = arb(3).log()
    log4 = arb(4).log()
    log5 = arb(5).log()

    # q=2: separation for the full r interval.
    assert r_left - log2 > -half
    assert r_right - log2 < half

    # q=3: separation unless r-log(3)<-1/2.  On that complement, a
    # negative target has |z|<=log(3)-1 and a positive target is <x-1/2.
    assert arb(1) < log3 < q(11, 10)
    assert max(x_right, log3 - y_left) / 2 < target_c
    assert (2 * x_right - half) / 2 < target_c

    # q=4: use y>=1 for a negative target and y<=7/5 for a positive one.
    assert q(6, 5) < log4 < q(7, 5)
    assert max(x_right, log4 - y_left) / 2 < target_c
    assert (x_right + y_right - log4) / 2 < target_c

    # q=5 is negative throughout; y>1 is the essential correlated bound.
    assert q(7, 5) < log5 < q(9, 5)
    assert max(x_right, log5 - y_left) / 2 < target_c


def selected_triplet(y: arb, sign3: int, sign4: int):
    """Selected value and derivatives when the y target lies to its left."""

    g = 1 / (y / 2).cosh()
    c, cp = sech_data(y)
    a0 = arb(0)
    a1 = arb(0)
    a2 = arb(0)
    for rate, integral_value in zip(RATES, Y_INTEGRALS):
        term = exact_lower(integral_value) * (-rate * y).exp()
        a0 += term
        a1 -= (rate + c) * term
        a2 += ((rate + c) ** 2 - cp) * term

    p0 = arb(0)
    p1 = arb(0)
    p2 = arb(0)
    for power, logq, coefficient in PRIME_DATA:
        raw = y - logq
        if power == 3:
            sign = sign3
        elif power == 4:
            sign = sign4
        else:
            sign = 1 if raw > 0 else -1
        k, kp, kpp = theta2_triplet_positive(sign * raw)
        p0 += coefficient * k
        p1 += coefficient * (sign * kp - c * k)
        p2 += coefficient * (
            kpp - 2 * c * sign * kp + (c**2 - cp) * k
        )
    return (
        X_CONSTANT + g * (a0 + p0),
        g * (a1 + p1),
        g * (a2 + p2),
    )


def endpoint_enclosure(lower, upper):
    """Return an outward Arb enclosure from two ordered endpoints."""

    lower = arb(lower)
    upper = arb(upper)
    assert lower <= upper
    return interval(lower, upper) if lower < upper else lower


def crossing_integrals(rate: arb, y: arb):
    """Enclose the two positive arch pieces split at y<=11/10."""

    endpoint = q(11, 10)
    # ``interval`` carries a tiny outward guard radius; intersect that guard
    # with the analytic branch's exact domain.
    yl = max(arb(1), arb(y.lower()))
    yr = min(endpoint, arb(y.upper()))
    assert arb(1) <= yl <= yr <= endpoint

    left_at_l = kernel_exponential_integral(
        rate, arb("-.9"), yl, 2
    )
    left_at_r = kernel_exponential_integral(
        rate, arb("-.9"), yr, 2
    )
    left_integral = endpoint_enclosure(
        left_at_l.lower(), left_at_r.upper()
    )

    right_at_l = kernel_exponential_integral(
        -rate, yl, endpoint, 2
    )
    if yr < endpoint:
        right_at_r = kernel_exponential_integral(
            -rate, yr, endpoint, 2
        )
        right_lower = right_at_r.lower()
    else:
        right_lower = arb(0)
    right_integral = endpoint_enclosure(
        right_lower, right_at_l.upper()
    )
    return (
        (-rate * y).exp() * left_integral,
        (rate * y).exp() * right_integral,
    )


def selected_triplet_crossing(y: arb, sign3: int, sign4: int):
    """Actual selected value and derivatives for 1<=y<=11/10."""

    g = 1 / (y / 2).cosh()
    c, cp = sech_data(y)
    a0 = arb(0)
    a1 = arb(0)
    a2 = arb(0)
    ky, _kpy, _kppy = theta2_triplet_positive(y)
    for rate in RATES:
        left, right = crossing_integrals(rate, y)
        total = left + right
        first = rate * (right - left)
        second = rate**2 * total - 2 * rate * ky
        a0 += total
        a1 += first
        a2 += second

    p0 = arb(0)
    p1 = arb(0)
    p2 = arb(0)
    for power, logq, coefficient in PRIME_DATA:
        raw = y - logq
        if power == 3:
            sign = sign3
        elif power == 4:
            sign = sign4
        else:
            sign = 1 if raw > 0 else -1
        k, kp, kpp = theta2_triplet_positive(sign * raw)
        p0 += coefficient * k
        p1 += coefficient * (sign * kp - c * k)
        p2 += coefficient * (
            kpp - 2 * c * sign * kp + (c**2 - cp) * k
        )
    return (
        X_CONSTANT + g * (a0 + p0),
        g * (a1 - c * a0 + p1),
        g * (a2 - 2 * c * a1 + (c**2 - cp) * a0 + p2),
    )


def taylor_lower(left, right, sign3, sign4):
    midpoint = (left + right) / 2
    radius = (right - left) / 2
    function = (
        selected_triplet_crossing
        if right <= q(11, 10)
        else selected_triplet
    )
    value, derivative, _second = function(midpoint, sign3, sign4)
    _vbox, _dbox, second = function(
        interval(left, right), sign3, sign4
    )
    return (
        value.lower()
        - absolute_upper(derivative) * radius
        - absolute_upper(second) * radius**2 / 2
    )


def direct_cusp_lower(left, right, cusp_power):
    y = interval(left, right)
    numerator = arb(0)
    crossing = right <= q(11, 10)
    if crossing:
        # Keep only pieces uniformly on one side of every source in the
        # cusp box; the omitted middle strip is positive.
        for rate in RATES:
            left_piece = kernel_exponential_integral(
                rate, arb("-.9"), left, 2
            ) * (-rate * right).exp()
            right_piece = kernel_exponential_integral(
                -rate, right, q(11, 10), 2
            ) * (rate * left).exp()
            numerator += left_piece + right_piece
    else:
        for rate, integral_value in zip(RATES, Y_INTEGRALS):
            numerator += exact_lower(integral_value) * (-rate * y).exp()
    for power, logq, coefficient in PRIME_DATA:
        raw = y - logq
        if power == cusp_power:
            t = interval(arb(0), absolute_upper(raw))
        elif raw > 0:
            t = raw
        else:
            t = -raw
        k, _kp, _kpp = theta2_triplet_positive(t)
        numerator += coefficient * k
    if crossing:
        return X_CONSTANT + numerator / (right / 2).cosh()
    return X_CONSTANT + numerator / (y / 2).cosh()


def x_derivative_upper(left, right):
    """Upper bound for d/dx of the complete selected rate on the live band."""

    x = interval(left, right)
    g = 1 / (x / 2).cosh()
    c, _cp = sech_data(x)
    derivative = arb(0)
    for rate in RATES:
        integral_value = kernel_exponential_integral(
            -rate, x + q(3, 10), x + q(9, 10), 2
        )
        za = x + q(3, 10)
        zb = x + q(9, 10)
        ka, _kpa, _kppa = theta2_triplet_positive(za)
        kb, _kpb, _kppb = theta2_triplet_positive(zb)
        integral_derivative = (
            kb * (-rate * zb).exp() - ka * (-rate * za).exp()
        )
        derivative += (
            g * (rate * x).exp()
            * ((rate - c) * integral_value + integral_derivative)
        )
    endpoint_k, _kp, _kpp = theta2_triplet_positive(x + q(1, 2))
    moving_endpoint_upper = (
        LEVY_TERMS * endpoint_k / (arb(1) / 2).cosh()
    )
    return derivative + moving_endpoint_upper


def main():
    audit_target_geometry()
    log3 = arb(3).log()
    log4 = arb(4).log()
    assert LOG3_LEFT < log3 < LOG3_RIGHT
    assert LOG4_LEFT < log4 < LOG4_RIGHT

    derivative_maximum = None
    derivative_worst = None
    for i in range(40):
        left = q(1, 5) + arb(i) / 100
        right = left + q(1, 100)
        upper = x_derivative_upper(left, right).upper()
        assert upper < 0, (left, right, upper)
        if derivative_maximum is None or upper > derivative_maximum:
            derivative_maximum = upper
            derivative_worst = (left, right)

    regular = [Y_LEFT + (Y_RIGHT - Y_LEFT) * i / CELL_COUNT
               for i in range(CELL_COUNT + 1)]
    assert regular[98] < LOG3_LEFT < LOG3_RIGHT < regular[99]
    assert regular[386] < LOG4_LEFT < LOG4_RIGHT < regular[387]
    boundaries = (
        regular[:99] + [LOG3_LEFT, LOG3_RIGHT]
        + regular[99:387] + [LOG4_LEFT, LOG4_RIGHT] + regular[387:]
    )

    minimum = None
    worst = None
    for left, right in zip(boundaries, boundaries[1:]):
        assert right > left
        crossing3 = not (right < log3 or left > log3)
        crossing4 = not (right < log4 or left > log4)
        assert not (crossing3 and crossing4)
        if crossing3:
            lower = direct_cusp_lower(left, right, 3).lower()
            mode = "direct-log3"
        elif crossing4:
            lower = direct_cusp_lower(left, right, 4).lower()
            mode = "direct-log4"
        else:
            sign3 = -1 if right < log3 else +1
            sign4 = -1 if right < log4 else +1
            lower = taylor_lower(left, right, sign3, sign4)
            mode = "taylor"
        assert lower > q(1, 2), (left, right, lower)
        if minimum is None or lower < minimum:
            minimum = lower
            worst = (left, right, mode)

    assert minimum is not None and worst is not None
    print("precision_bits:", ctx.prec)
    print("correlated_single_target_audit: PASS")
    print("source_band: 1/5<x<=3/5, 1<y<=7/5, 1/2<y-x<=4/5")
    print("x_derivative_cells:", 40)
    print("worst_x_derivative_cell:", derivative_worst)
    print("largest_certified_x_derivative_upper:", derivative_maximum)
    print("y_Taylor_cells_including_cusps:", len(boundaries) - 1)
    print("worst_y_cell_at_x=3/5:", worst)
    print("worst_selected_rate:", minimum)
    print("worst_margin:", minimum - q(1, 2))
    print("low_coordinate_rate_taylor: PASS")


if __name__ == "__main__":
    main()
