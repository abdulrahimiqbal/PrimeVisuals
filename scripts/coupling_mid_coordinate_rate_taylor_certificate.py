#!/usr/bin/env python3
"""Exact rate certificate for 3/5<=x<4/5 and 1<y<=7/5.

For ordered sources with 1/2<y-x<=4/5 retain the x-arch interval
``[9/10,x+9/10]``.  It lies in every half-ball about y: its lower endpoint
is at least y-1/2 because y<=7/5, and its upper endpoint is at most y+1/2
because y-x>1/2.  The selected x rate is increasing by
``-J'>=J/2`` and ``C'/C<1/2``, so x=3/5 is worst.

From y retain the first two theta and sixteen Levy summands on
``[-9/10,11/10]`` and all inward q=2,3,4,5,7,8,9 atoms.  The continuum and
atoms are routed by the companion middle-band Hall certificate.  Since a
live source has y>x+1/2>=11/10, it remains only to certify the correlated
one-variable rate on 11/10<=y<=7/5.  A second-order Taylor model preserves
the near cancellation between arch and prime pieces; the finite-theta cusp
at log(4) is enclosed directly.

The companion ledger uses ``[2/5,11/10]`` and the y q=2 atom as single
clocks.  Directly on the whole closed containing ranges, the first interval
is within distance 1/2 of x in ``[3/5,4/5]``, and
``r-log(2) in (-1/2,1/2)``.  The x rate interval is also a single clock:
its lower endpoint satisfies ``9/10-y>=-1/2`` and its upper endpoint has
offset ``9/10-r<=2/5``.  Thus this middle proof is uniform on the strip; it
is not inferred by interpolating the two endpoint certificates.  In the
combined partition the low policy owns x=3/5, the high policy owns x=4/5,
and this policy owns 3/5<x<4/5 (all three certificates prove their closed
containing boxes).
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

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

Y_LEFT = q(11, 10)
Y_RIGHT = q(7, 5)
CELL_COUNT = 300
LOG4_LEFT = arb("1.38629436111")
LOG4_RIGHT = arb("1.38629436113")

Y_INTEGRALS = tuple(
    finite_integral(rate, arb("-.9"), arb("1.1")) for rate in RATES
)
X_INTEGRALS = tuple(
    finite_integral(-rate, arb(".9"), arb("1.5")) for rate in RATES
)


def x_constant() -> arb:
    x = q(3, 5)
    numerator = arb(0)
    for rate, integral_value in zip(RATES, X_INTEGRALS):
        numerator += (rate * x).exp() * exact_lower(integral_value)
    return numerator / (x / 2).cosh()


X_CONSTANT = x_constant()


def audit_target_geometry() -> None:
    """Exact endpoint audit for the middle-band single clocks."""

    # Rational endpoints are exact Fractions; Arb is reserved for log(2).
    half_exact = Fraction(1, 2)
    r_left_exact, r_right_exact = half_exact, Fraction(4, 5)
    x_left_exact, x_right_exact = Fraction(3, 5), Fraction(4, 5)
    y_right_exact = Fraction(7, 5)

    # x arch [9/10,x+9/10] against y=x+r.  Its lower endpoint is bounded
    # using y<=7/5; its upper endpoint has the sharper offset 9/10-r<=2/5.
    assert Fraction(9, 10) - y_right_exact >= -half_exact
    assert (Fraction(9, 10) - r_left_exact
            <= Fraction(2, 5) < half_exact)

    # y arch [2/5,11/10] against x.
    assert (Fraction(2, 5) - x_right_exact
            >= -Fraction(2, 5) > -half_exact)
    assert Fraction(11, 10) - x_left_exact <= half_exact

    # y q=2 target has displacement r-log(2) from x.
    half = q(1, 2)
    r_left, r_right = half, q(4, 5)
    log2 = arb(2).log()
    assert r_left - log2 > -half
    assert r_right - log2 < half


def selected_triplet(y: arb, q4_sign: int):
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
    return (
        X_CONSTANT + arch0 + g * prime0,
        arch1 + g * prime1,
        arch2 + g * prime2,
    )


def taylor_lower(left, right, sign):
    midpoint = (left + right) / 2
    radius = (right - left) / 2
    value, derivative, _second = selected_triplet(midpoint, sign)
    _value_box, _derivative_box, second_box = selected_triplet(
        interval(left, right), sign
    )
    return (
        value.lower()
        - absolute_upper(derivative) * radius
        - absolute_upper(second_box) * radius**2 / 2
    )


def direct_cusp_lower(left, right):
    y = interval(left, right)
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
    return X_CONSTANT + numerator / (y / 2).cosh()


def main() -> None:
    audit_target_geometry()
    log4 = arb(4).log()
    assert LOG4_LEFT < log4 < LOG4_RIGHT
    regular = [Y_LEFT + (Y_RIGHT - Y_LEFT) * i / CELL_COUNT
               for i in range(CELL_COUNT + 1)]
    # 1.386 lies at regular index 286 and 1.387 at 287.
    assert regular[286] < LOG4_LEFT < LOG4_RIGHT < regular[287]
    boundaries = regular[:287] + [LOG4_LEFT, LOG4_RIGHT] + regular[287:]

    minimum = None
    worst = None
    for left, right in zip(boundaries, boundaries[1:]):
        assert right > left
        if right < log4:
            lower = taylor_lower(left, right, -1)
            mode = "taylor-negative-q4"
        elif left > log4:
            lower = taylor_lower(left, right, +1)
            mode = "taylor-positive-q4"
        else:
            lower = direct_cusp_lower(left, right).lower()
            mode = "direct-cusp"
        assert lower > q(1, 2), (left, right, lower)
        if minimum is None or lower < minimum:
            minimum = lower
            worst = (left, right, mode)

    assert minimum is not None and worst is not None
    print("precision_bits:", ctx.prec)
    print("closed_strip_target_audit: PASS")
    print("source_band: 3/5<=x<4/5, 1<y<=7/5")
    print("selected_theta_terms: 2")
    print("selected_levy_terms:", LEVY_TERMS)
    print("x_constant_at_3/5:", X_CONSTANT)
    print("Taylor_cells_including_cusp:", len(boundaries) - 1)
    print("worst_cell:", worst)
    print("worst_selected_rate:", minimum)
    print("worst_margin:", minimum - q(1, 2))
    print("middle_coordinate_rate_taylor: PASS")


if __name__ == "__main__":
    main()
