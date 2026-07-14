#!/usr/bin/env python3
"""Exact uniform source-box certificate for the sharp terminal edge.

Let

    c(u,v) = |(u+v)/2| + (|u-v|-|u+v|)_+/4
           = max(|u|,|v|,|u+v|)/2

and ``T={c<=9/25 or |u-v|<=1/10}``.  This file promotes the five-family
point allocation in ``coupling_terminal_sharp_point_certificate.py`` to the
closed rational source rectangle

    |x+1/5| <= EPS_X,       |y-4/5| <= EPS_Y.            (1)

The selected target intervals are shrunk at precisely those endpoints whose
geometry used equality at the central source.  Every assertion is then made
with an Arb source interval, so the printed lower rate is simultaneous for
every source in (1), rather than a list of point certificates.

Unlike the point file, prime subatoms are not fixed decimal constants.  The
first four positive theta terms of each physical prime atom are selected.
This gives both lower and upper source-box bounds for the selected amount.
The two cross-prime families are checked against uniform lower bounds for the
receiving physical atoms.  The translated arch family is checked cellwise
for all x, y and u in their respective intervals.

This proves only one local hard-stage edge.  It makes no claim that finitely
many such rectangles cover ``S_.40\\S_.36``, and it makes no reset/renewal
claim.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_terminal_sharp_box_certificate.py
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

from coupling_terminal_sharp_point_certificate import (
    C,
    J_partial,
    K_partial_positive,
    LEVY_TERMS,
    TARGET_C,
    TARGET_R,
    THETA_TERMS,
    TRANSLATION,
    interval,
    partial_arch_density,
    partial_arch_mass,
)


ctx.prec = 240


def aq(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


def fq(numerator: int, denominator: int = 1) -> Fraction:
    return Fraction(numerator, denominator)


# These are deliberately constants, not values discovered at run time.  A
# larger rectangle may be substituted only if every assertion below remains
# valid.  SEARCH_CANDIDATES is a reproducible diagnostic printed after the
# theorem; it is not used to choose or weaken the certified rectangle.
EPS_X = fq(1, 800)
EPS_Y = fq(7, 2_000_000)
DOMINATION_CELLS = 256


def source_ball(center: Fraction, radius: Fraction) -> arb:
    """An outward Arb enclosure of a closed rational interval."""

    return interval(aq(center.numerator, center.denominator)
                    - aq(radius.numerator, radius.denominator),
                    aq(center.numerator, center.denominator)
                    + aq(radius.numerator, radius.denominator))


def prime_subatom(source: arb, power: int, prime: int, direction: int) -> arb:
    """Selected n<=4 positive subatom, uniformly enclosed in source."""

    assert direction in (-1, 1)
    target = source + direction * arb(power).log()
    return (
        arb(prime).log()
        / arb(power).sqrt()
        * K_partial_positive(abs(target))
        / C(source)
    )


def physical_prime_lower(source: arb, power: int, prime: int,
                         direction: int) -> arb:
    """A rigorous lower bound for a physical atom (positive subseries)."""

    return prime_subatom(source, power, prime, direction)


def characteristic_box_strict_or_closed(
    u_left: Fraction,
    u_right: Fraction,
    v_left: Fraction,
    v_right: Fraction,
) -> bool:
    """Prove c<=9/25 on a rational rectangle by its convex formula."""

    bound = fq(18, 25)
    values_u = (u_left, u_right)
    values_v = (v_left, v_right)
    return (
        max(abs(value) for value in values_u) <= bound
        and max(abs(value) for value in values_v) <= bound
        and max(abs(u + v) for u in values_u for v in values_v) <= bound
    )


def tube_box(
    u_left: Fraction,
    u_right: Fraction,
    v_left: Fraction,
    v_right: Fraction,
) -> bool:
    return max(
        abs(u - v)
        for u in (u_left, u_right)
        for v in (v_left, v_right)
    ) <= fq(1, 10)


def uniform_geometry(eps_x: Fraction, eps_y: Fraction) -> None:
    """Verify all continuous rectangles and all source-dependent atoms."""

    xl, xr = -fq(1, 5) - eps_x, -fq(1, 5) + eps_x
    yl, yr = fq(4, 5) - eps_y, fq(4, 5) + eps_y

    # Family 1: the left endpoint moves inward with the worst negative x.
    f1l, f1r = -fq(13, 25) + eps_x, fq(18, 25)
    assert characteristic_box_strict_or_closed(xl, xr, f1l, f1r)

    # Family 4: shrink both tube endpoints against the y source interval.
    f4l, f4r = fq(7, 10) + eps_y, fq(9, 10) - eps_y
    assert tube_box(f4l, f4r, yl, yr)

    # Family 3: the y-q5 target moves with y, so shrink both endpoints.
    # The irrational atom interval itself is checked below with Arb.
    assert -fq(909, 1000) + eps_y < -fq(71, 100) - eps_y

    xb = source_ball(-fq(1, 5), eps_x)
    yb = source_ball(fq(4, 5), eps_y)
    log2, log3, log4, log5 = (arb(n).log() for n in (2, 3, 4, 5))
    x_q2_plus = xb + log2
    x_q2_minus = xb - log2
    x_q3_plus = xb + log3
    y_q2_minus = yb - log2
    y_q3_minus = yb - log3
    y_q4_minus = yb - log4
    y_q5_minus = yb - log5

    def c_arb(u: arb, v: arb) -> arb:
        return max(abs(u), abs(v), abs(u + v)) / 2

    assert c_arb(xb, y_q2_minus) < TARGET_C
    assert c_arb(xb, y_q3_minus) < TARGET_C
    # The v=-18/25 endpoint is an exact closed-target equality through
    # |v|=18/25.  Check the other two affine pieces strictly with Arb rather
    # than asking a rounded Arb hull to prove that rational equality.
    assert abs(x_q2_plus) < 2 * TARGET_C
    assert abs(x_q2_plus - aq(18, 25)) < 2 * TARGET_C
    assert abs(x_q2_plus - aq(13, 25)) < 2 * TARGET_C
    assert c_arb(x_q2_plus, y_q4_minus) < TARGET_C

    f3 = interval(
        -aq(909, 1000) + aq(eps_y.numerator, eps_y.denominator),
        -aq(71, 100) - aq(eps_y.numerator, eps_y.denominator),
    )
    assert abs(f3 - y_q5_minus) < TARGET_R
    assert abs(x_q2_minus - y_q5_minus) < TARGET_R
    assert abs(x_q3_plus - yb) < TARGET_R
    assert TRANSLATION < TARGET_R


def translated_density_certificate(xb: arb, yb: arb) -> tuple[arb, arb]:
    """Prove f_y(u+.099)>=f_x(u), uniformly in both source intervals."""

    left = aq(63, 100)
    right = aq(69, 100)
    width = (right - left) / DOMINATION_CELLS
    worst_difference = None
    worst_ratio = None
    for index in range(DOMINATION_CELLS):
        cell_left = left + index * width
        cell_right = cell_left + width
        u = interval(cell_left, cell_right)
        v = u + TRANSLATION
        x_density = partial_arch_density(xb, u)
        y_density = partial_arch_density(yb, v)
        difference = y_density - x_density
        ratio = y_density / x_density
        assert difference > 0
        if worst_difference is None or difference.lower() < worst_difference:
            worst_difference = difference.lower()
        if worst_ratio is None or ratio.lower() < worst_ratio:
            worst_ratio = ratio.lower()
    assert worst_difference is not None and worst_ratio is not None
    assert worst_ratio > 1
    return worst_difference, worst_ratio


def evaluate_box(eps_x: Fraction, eps_y: Fraction,
                 check_geometry: bool = True,
                 check_density: bool = True) -> dict[str, arb]:
    """Return simultaneous bounds; assertions make a proof when requested."""

    if check_geometry:
        uniform_geometry(eps_x, eps_y)
    xb = source_ball(-fq(1, 5), eps_x)
    yb = source_ball(fq(4, 5), eps_y)
    ex = aq(eps_x.numerator, eps_x.denominator)
    ey = aq(eps_y.numerator, eps_y.denominator)

    y_q2_minus = prime_subatom(yb, 2, 2, -1)
    y_q3_minus = prime_subatom(yb, 3, 3, -1)
    y_q4_minus = prime_subatom(yb, 4, 2, -1)
    x_q2_minus = prime_subatom(xb, 2, 2, -1)
    x_q3_plus = prime_subatom(xb, 3, 3, +1)

    family_1 = (
        partial_arch_mass(yb, -aq(13, 25) + ex, aq(18, 25))
        + y_q2_minus + y_q3_minus
    )
    family_2 = (
        partial_arch_mass(yb, -aq(18, 25), -aq(13, 25))
        + y_q4_minus
    )
    family_3 = (
        partial_arch_mass(
            xb, -aq(909, 1000) + ey, -aq(71, 100) - ey
        )
        + x_q2_minus
    )
    family_4 = (
        partial_arch_mass(xb, aq(7, 10) + ey, aq(9, 10) - ey)
        + x_q3_plus
    )
    family_5 = partial_arch_mass(xb, aq(63, 100), aq(69, 100))

    x_q2_plus_capacity = physical_prime_lower(xb, 2, 2, +1)
    y_q5_minus_capacity = physical_prime_lower(yb, 5, 5, -1)
    assert family_2.upper() < x_q2_plus_capacity.lower()
    assert family_3.upper() < y_q5_minus_capacity.lower()

    if check_density:
        worst_difference, worst_ratio = translated_density_certificate(xb, yb)
    else:
        # Used only by the explicitly labelled radius diagnostic.  The fixed
        # theorem rectangle always takes the checked branch.
        worst_difference, worst_ratio = arb(0), arb(0)
    selected_rate = family_1 + family_2 + family_3 + family_4 + family_5
    return {
        "family_1": family_1,
        "family_2": family_2,
        "family_3": family_3,
        "family_4": family_4,
        "family_5": family_5,
        "x_q2_plus_capacity": x_q2_plus_capacity,
        "y_q5_minus_capacity": y_q5_minus_capacity,
        "translated_difference": worst_difference,
        "translated_ratio": worst_ratio,
        "selected_rate": selected_rate,
    }


def main() -> None:
    answer = evaluate_box(EPS_X, EPS_Y)
    assert answer["selected_rate"] > aq(1, 2)

    # Exact marginal-disjointness.  Endpoints of arch intervals have zero
    # mass, and the positive gaps shown here remain after shrinking.
    assert -fq(18, 25) < -fq(13, 25) + EPS_X < fq(18, 25) < fq(729, 1000)
    assert -fq(909, 1000) + EPS_Y < -fq(71, 100) - EPS_Y < fq(63, 100)
    assert fq(69, 100) < fq(7, 10) + EPS_Y < fq(9, 10) - EPS_Y

    print("precision_bits:", ctx.prec)
    print("source_box_x:", -fq(1, 5) - EPS_X, -fq(1, 5) + EPS_X)
    print("source_box_y:", fq(4, 5) - EPS_Y, fq(4, 5) + EPS_Y)
    print("target: c<=9/25 or separation<=1/10")
    for name in ("family_1", "family_2", "family_3", "family_4", "family_5"):
        print(name + ":", answer[name])
    print("family_2_x_q2_plus_capacity:", answer["x_q2_plus_capacity"])
    print("family_3_y_q5_minus_capacity:", answer["y_q5_minus_capacity"])
    print("translated_density_worst_difference_lower:",
          answer["translated_difference"])
    print("translated_density_worst_ratio_lower:", answer["translated_ratio"])
    print("uniform_selected_rate:", answer["selected_rate"])
    print("uniform_margin_over_half:", answer["selected_rate"] - aq(1, 2))
    print("uniform_selected_rate_lower:", answer["selected_rate"].lower())
    print("uniform_margin_over_half_lower:",
          (answer["selected_rate"] - aq(1, 2)).lower())
    print("CERTIFIED: uniform sharp-box S_.40 -> S_.36 rate exceeds 1/2")

if __name__ == "__main__":
    main()
