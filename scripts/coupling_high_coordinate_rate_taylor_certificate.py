#!/usr/bin/env python3
"""Taylor certificate for the delicate high-coordinate selected rate.

For 4/5<=x<=9/10 and x+1/2<=y<=7/5, retain

    X_x = nu_x^arch([9/10,x+1]),
    Y_y = nu_y^sel([-9/10,13/10]),

where ``sel`` keeps the first two positive theta summands, the first sixteen
positive Levy summands, and the inward q=2,3,4,5,7,8,9 prime atoms.  The x
interval is contained in every half-ball about y, and the part of the y
interval above x-1/2 is contained in the half-ball about x.  The remaining
central and tail pieces are the demands of the companion Hall certificate.

The x rate is increasing: after differentiating under the finite target
integral, ``-J'(h)>=J(h)/2`` and ``C'/C=tanh(x/2)/2<1/2``; the moving upper
endpoint is positive.  Also [-9/10,13/10] is contained in
[-9/10,x+1/2].  It is therefore enough to prove

    X_(4/5) + Y_y > 1/2,       13/10<=y<=7/5.

Arch and prime derivatives nearly cancel, so separately minimizing them on
a source box loses the 5e-7 reserve.  This script instead builds one exact
finite analytic function F(y), evaluates F and F' at rational cell centers,
and uses a rigorous interval upper bound for |F''| in Taylor's theorem.  The
only finite-theta cusp, at y=log 4, is enclosed in a rational bracket and
checked directly.  No mesh-to-continuum extrapolation is used.
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

from coupling_exact_arch_integral import kernel_exponential_integral
from coupling_four_fifths_to_half_local_certificate import (
    fraction_arb,
    rational_below,
)
from coupling_wide_separation_band_certificate import interval, q


ctx.prec = 240

PI = arb.pi()
LEVY_TERMS = 16
THETA_TERMS = 2
Y_LEFT = q(13, 10)
Y_RIGHT = q(7, 5)
CELL_COUNT = 100
LOG4_LEFT = arb("1.38629436111")
LOG4_RIGHT = arb("1.38629436113")

PRIME_DATA = tuple(
    (
        prime_power,
        arb(prime_power).log(),
        arb(prime).log() / arb(prime_power).sqrt(),
    )
    for prime_power, prime in (
        (2, 2), (3, 3), (4, 2), (5, 5), (7, 7), (8, 2), (9, 3)
    )
)


def exact_lower(value: Fraction) -> arb:
    return arb(value.numerator) / value.denominator


def finite_integral(exponent, left, right) -> Fraction:
    return rational_below(
        kernel_exponential_integral(
            exponent, left, right, THETA_TERMS
        )
    )


RATES = tuple(arb(2 * k) + arb(1) / 2 for k in range(LEVY_TERMS))
Y_INTEGRALS = tuple(
    finite_integral(rate, arb("-.9"), arb("1.3")) for rate in RATES
)
X_INTEGRALS = tuple(
    finite_integral(-rate, arb(".9"), arb("1.8")) for rate in RATES
)


def theta2_triplet_positive(t: arb) -> tuple[arb, arb, arb]:
    """The first two positive theta summands and their first derivatives."""

    total = arb(0)
    first = arb(0)
    second = arb(0)
    for n in range(1, THETA_TERMS + 1):
        nn = arb(n * n)
        v = PI * nn * (2 * t).exp()
        term = PI * nn * (q(5, 2) * t).exp() * (2 * v - 3) * (-v).exp()
        logarithmic_derivative = q(5, 2) + 4 * v / (2 * v - 3) - 2 * v
        minus_logarithmic_second = 4 * v + 24 * v / (2 * v - 3) ** 2
        total += term
        first += term * logarithmic_derivative
        second += term * (
            logarithmic_derivative**2 - minus_logarithmic_second
        )
    assert total > 0
    return total, first, second


def sech_data(y: arb) -> tuple[arb, arb]:
    c = (y / 2).cosh()
    logarithmic_slope = (y / 2).tanh() / 2
    logarithmic_slope_prime = 1 / (4 * c**2)
    return logarithmic_slope, logarithmic_slope_prime


def x_constant() -> arb:
    x = q(4, 5)
    numerator = arb(0)
    for rate, integral_value in zip(RATES, X_INTEGRALS):
        numerator += (rate * x).exp() * exact_lower(integral_value)
    return numerator / (x / 2).cosh()


X_CONSTANT = x_constant()


def selected_triplet(y: arb, q4_sign: int) -> tuple[arb, arb, arb]:
    """Return F,F',F'' on a box not crossing y=log 4."""

    assert q4_sign in (-1, 1)
    cosh = (y / 2).cosh()
    g = 1 / cosh
    c, cp = sech_data(y)

    arch0 = arb(0)
    arch1 = arb(0)
    arch2 = arb(0)
    for rate, integral_value in zip(RATES, Y_INTEGRALS):
        term = exact_lower(integral_value) * (-rate * y).exp()
        arch0 += term
        arch1 -= (rate + c) * term
        arch2 += ((rate + c) ** 2 - cp) * term
    arch0 *= g
    arch1 *= g
    arch2 *= g

    prime0 = arb(0)
    prime1 = arb(0)
    prime2 = arb(0)
    for power, logq, coefficient in PRIME_DATA:
        raw = y - logq
        sign = q4_sign if power == 4 else (1 if raw > 0 else -1)
        t = sign * raw
        k, kp, kpp = theta2_triplet_positive(t)
        prime0 += coefficient * k
        prime1 += coefficient * (sign * kp - c * k)
        prime2 += coefficient * (
            kpp - 2 * c * sign * kp + (c**2 - cp) * k
        )
    prime0 *= g
    prime1 *= g
    prime2 *= g
    return X_CONSTANT + arch0 + prime0, arch1 + prime1, arch2 + prime2


def absolute_upper(value: arb) -> arb:
    return max(abs(value.lower()), abs(value.upper()))


def taylor_lower(left: arb, right: arb, q4_sign: int) -> arb:
    midpoint = (left + right) / 2
    radius = (right - left) / 2
    value, derivative, _second_at_midpoint = selected_triplet(
        midpoint, q4_sign
    )
    source_box = interval(left, right)
    _box_value, _box_derivative, second = selected_triplet(
        source_box, q4_sign
    )
    result = value.lower()
    result -= absolute_upper(derivative) * radius
    result -= absolute_upper(second) * radius**2 / 2
    return result


def direct_cusp_lower(left: arb, right: arb) -> arb:
    """Direct interval lower on a tiny bracket containing log 4."""

    y = interval(left, right)
    cosh = (y / 2).cosh()
    numerator = arb(0)
    for rate, integral_value in zip(RATES, Y_INTEGRALS):
        numerator += exact_lower(integral_value) * (-rate * y).exp()
    for power, logq, coefficient in PRIME_DATA:
        raw = y - logq
        if power == 4:
            t = interval(arb(0), absolute_upper(raw))
        elif raw > 0:
            t = raw
        else:
            t = -raw
        k, _kp, _kpp = theta2_triplet_positive(t)
        numerator += coefficient * k
    return X_CONSTANT + numerator / cosh


def main() -> None:
    log4 = arb(4).log()
    assert LOG4_LEFT < log4 < LOG4_RIGHT
    # All seven selected inward atoms remain in [-.9,1.3] on the source band.
    for _power, logq, _coefficient in PRIME_DATA:
        assert Y_LEFT - logq > arb("-.9")
        assert Y_RIGHT - logq < arb("1.3")

    regular = [Y_LEFT + (Y_RIGHT - Y_LEFT) * i / CELL_COUNT
               for i in range(CELL_COUNT + 1)]
    # log(4) lies in the unique rational cell [1.386,1.387].  Insert its
    # certified bracket by exact comparisons; no float chooses cell order.
    assert regular[86] < LOG4_LEFT < LOG4_RIGHT < regular[87]
    boundaries = regular[:87] + [LOG4_LEFT, LOG4_RIGHT] + regular[87:]

    minimum = None
    worst = None
    cells = 0
    for left, right in zip(boundaries, boundaries[1:]):
        assert right > left
        cells += 1
        if right < log4:
            lower = taylor_lower(left, right, -1)
            mode = "taylor-negative-q4"
        elif left > log4:
            lower = taylor_lower(left, right, +1)
            mode = "taylor-positive-q4"
        else:
            assert left < LOG4_RIGHT and right > LOG4_LEFT
            lower = direct_cusp_lower(left, right).lower()
            mode = "direct-cusp"
        assert lower > q(1, 2), (left, right, lower)
        if minimum is None or lower < minimum:
            minimum = lower
            worst = (left, right, mode)

    assert minimum is not None and worst is not None
    print("precision_bits:", ctx.prec)
    print("selected_theta_terms:", THETA_TERMS)
    print("selected_levy_terms:", LEVY_TERMS)
    print("x_constant_at_4/5:", X_CONSTANT)
    print("y_cells_including_log4_bracket:", cells)
    print("log4_bracket:", (LOG4_LEFT, LOG4_RIGHT))
    print("worst_cell:", worst)
    print("worst_selected_rate_lower:", minimum)
    print("worst_margin_over_half:", minimum - q(1, 2))
    print("high_coordinate_rate_taylor: PASS")


if __name__ == "__main__":
    main()
