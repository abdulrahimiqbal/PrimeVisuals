#!/usr/bin/env python3
"""Hard shrink from the unit band to separation below four fifths.

Assume a pair lies in [-5/4,5/4]^2 and in the previous hard target

    c(x,y) <= 2/5  or  |x-y| <= 1,

where ``c=|m|+(r-2|m|)_+/4``.  This certificate treats the remaining branch

    c(x,y) > 2/5,       4/5 < |x-y| <= 1.

After exchange and reflection it is enough to cover

    -1/5 < x < 9/20,    4/5 < y <= 5/4,
    4/5 < y-x <= 1.

The allocation uses two finite archimedean single-coordinate subclocks,
inward prime-power clocks q=2,3,4,5, and one cross-prime pairing:
the outward q=2 atom of the left coordinate is paired with the inward q=5
atom of the right coordinate below the onset at which q=5 alone enters the
target.  Above that onset, q=5 remains in the *same correlated marginal sum*
as the other right-coordinate prime atoms; it must not be lower-bounded in a
separate minimum.  Thus no marginal mass is counted twice and no valid
correlation is discarded.  Every selected event is rigorously checked to
have separation below 4/5 and both coordinates in [-7/5,7/5].

The formerly split-minimum ledger is retained, and exactly falsified, in
``coupling_unit_to_four_fifths_paired_grouping_falsifier.py``.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_unit_to_four_fifths_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

from coupling_wide_separation_band_certificate import (
    C,
    integrate_one_marginal,
    interval,
    k_positive_unchecked,
    q,
)


ctx.prec = 180

Y_LEFT = q(4, 5)
Y_RIGHT = q(5, 4)
R_LEFT = q(4, 5)
R_RIGHT = arb(1)
TARGET_R = q(4, 5)
TARGET_GAP = q(1, 10000)
TARGET_COORD = q(7, 5)

Y_CELLS = 18             # width 1/40
R_CELLS = 40             # width 1/200; resolves the q=5 onset
PRIME_CELLS = 256


PRIME_DATA = tuple(
    (
        prime_power,
        arb(prime_power).log(),
        arb(prime).log() / arb(prime_power).sqrt(),
    )
    for prime_power, prime in ((2, 2), (3, 3), (4, 2), (5, 5))
)

PRIME_BY_POWER = {item[0]: item for item in PRIME_DATA}


def kernel_even(argument: arb) -> arb:
    if argument < 0:
        return k_positive_unchecked(-argument)
    if argument > 0:
        return k_positive_unchecked(argument)
    radius = max(abs(argument.lower()), abs(argument.upper()))
    return k_positive_unchecked(arb(0, radius))


def arch_target(other: tuple[arb, arb]) -> tuple[arb, arb]:
    left = max(-TARGET_COORD, other[1] - TARGET_R + TARGET_GAP)
    right = min(TARGET_COORD, other[0] + TARGET_R - TARGET_GAP)
    assert right > left
    return left, right


def selected_for_marginal(
    source: tuple[arb, arb],
    direction: int,
    r_left: arb,
    r_right: arb,
):
    selected = []
    for data in PRIME_DATA:
        _prime_power, logq, _coefficient = data
        target = (
            source[0] + direction * logq,
            source[1] + direction * logq,
        )
        if (
            max(abs(r_left - logq), abs(r_right - logq)) < TARGET_R
            and target[0] >= -TARGET_COORD
            and target[1] <= TARGET_COORD
        ):
            selected.append(data)
    return tuple(selected)


def minimum_prime_rate(source, direction: int, selected) -> arb:
    if not selected:
        return arb(0)
    left, right = source
    width = (right - left) / PRIME_CELLS
    global_lower = None
    for index in range(PRIME_CELLS):
        lo = left + index * width
        s = interval(lo, lo + width)
        value = arb(0)
        for _prime_power, logq, coefficient in selected:
            value += coefficient * kernel_even(s + direction * logq) / C(s)
        lower = value.lower()
        if global_lower is None or lower < global_lower:
            global_lower = lower
    assert global_lower is not None
    return global_lower


def paired_two_five_rate(x_box, y_box, r_left: arb, r_right: arb) -> arb:
    """Couple x -> x-log(2) with y -> y-log(5), without mass reuse."""
    q2 = PRIME_BY_POWER[2]
    q5 = PRIME_BY_POWER[5]
    log_ratio = q5[1] - q2[1]
    assert max(abs(r_left - log_ratio), abs(r_right - log_ratio)) < TARGET_R
    x_target = (x_box[0] - q2[1], x_box[1] - q2[1])
    y_target = (y_box[0] - q5[1], y_box[1] - q5[1])
    assert x_target[0] >= -TARGET_COORD
    assert x_target[1] <= TARGET_COORD
    assert y_target[0] >= -TARGET_COORD
    assert y_target[1] <= TARGET_COORD
    x_rate = minimum_prime_rate(x_box, -1, (q2,))
    y_rate = minimum_prime_rate(y_box, -1, (q5,))
    return min(x_rate, y_rate)


def separation_bound(a: tuple[arb, arb],
                     b: tuple[arb, arb]) -> arb:
    return max(abs(a[0] - b[1]), abs(a[1] - b[0]))


def certify_cell(yl: arb, yr: arb,
                 r_left: arb, r_right: arb) -> arb:
    # Correlated coordinates x=y-r and y are enclosed dependency-safely.
    x_box = (yl - r_right, yr - r_left)
    y_box = (yl, yr)
    zx = arch_target(y_box)
    zy = arch_target(x_box)
    x_selected = selected_for_marginal(x_box, +1, r_left, r_right)
    y_selected = selected_for_marginal(y_box, -1, r_left, r_right)
    q5 = PRIME_BY_POWER[5]
    q5_single_qualifies = (
        max(abs(r_left - q5[1]), abs(r_right - q5[1])) < TARGET_R
    )
    # Below its single-coordinate onset, q=5 is absent from y_selected and
    # its marginal may instead be used by the paired q=2/q=5 clock.  Above
    # onset it stays inside y_selected: taking one minimum of the correlated
    # q-sum is essential and is stronger than summing separate minima.
    assert q5_single_qualifies == any(
        item[0] == 5 for item in y_selected
    )

    selected = integrate_one_marginal(zx[0], zx[1], x_box)
    selected += integrate_one_marginal(zy[0], zy[1], y_box)
    selected += minimum_prime_rate(x_box, +1, x_selected)
    selected += minimum_prime_rate(y_box, -1, y_selected)
    if not q5_single_qualifies:
        selected += paired_two_five_rate(x_box, y_box, r_left, r_right)
    assert separation_bound(zx, y_box) < TARGET_R
    assert separation_bound(x_box, zy) < TARGET_R
    for source, direction, terms in (
        (x_box, +1, x_selected), (y_box, -1, y_selected)
    ):
        for _prime_power, logq, _coefficient in terms:
            target = (
                source[0] + direction * logq,
                source[1] + direction * logq,
            )
            assert target[0] >= -TARGET_COORD
            assert target[1] <= TARGET_COORD
            assert max(abs(r_left - logq), abs(r_right - logq)) < TARGET_R
    return selected


def main() -> None:
    y_width = (Y_RIGHT - Y_LEFT) / Y_CELLS
    r_width = (R_RIGHT - R_LEFT) / R_CELLS
    worst = None
    worst_cell = None
    count = 0
    for i in range(Y_CELLS):
        yl = Y_LEFT + i * y_width
        yr = yl + y_width
        for j in range(R_CELLS):
            rl = R_LEFT + j * r_width
            rr = rl + r_width
            rate = certify_cell(yl, yr, rl, rr)
            count += 1
            if worst is None or rate.lower() < worst.lower():
                worst = rate
                worst_cell = (
                    yl, yr, rl, rr,
                    tuple(item[0] for item in selected_for_marginal(
                        (yl - rr, yr - rl), +1, rl, rr
                    )),
                    tuple(item[0] for item in selected_for_marginal(
                        (yl, yr), -1, rl, rr
                    )),
                )

    assert worst is not None and worst_cell is not None
    print("precision_bits:", ctx.prec)
    print("source: c>2/5 and 4/5<separation<=1 in [-5/4,5/4]^2")
    print("target: separation<4/5 and coordinates in [-7/5,7/5]")
    print("partition_(y,r):", Y_CELLS, "x", R_CELLS)
    print("certified_cells:", count)
    print("worst_cell_(yL,yR,rL,rR,x_qs,y_qs):", worst_cell)
    print("worst_selected_rate:", worst)
    print("worst_margin_over_half:", worst - q(1, 2))
    assert worst > q(1, 2)
    print("certificate: PASS")


if __name__ == "__main__":
    main()
