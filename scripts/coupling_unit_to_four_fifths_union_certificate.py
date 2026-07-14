#!/usr/bin/env python3
"""Union-target repair of the unit-band hard shrink certificate.

The earlier split-q5 separation-only allocation, retained in
``coupling_unit_to_four_fifths_paired_grouping_falsifier.py``, is false: its
exact worst cell has selected rate about 0.492344.  This independent script
selects every prime atom directly against the actual union

    S = {(u,v): c(u,v) <= 2/5 or |u-v| < 4/5},
    c(u,v)=|m|+(r-2|m|)_+/4.

The source and archimedean allocation are the same; the prime selector below
directly tests both target branches instead of using the failed split ledger:

    c(x,y)>2/5,    4/5<|x-y|<=1,    |x|,|y|<=5/4.

After ordering and reflection, use coordinates ``y`` and ``r=y-x`` with
``4/5<=y<=5/4`` and ``4/5<=r<=1``.  A prime-power single-coordinate clock is
selected cellwise when its whole target rectangle

* lies in ``[-7/5,7/5]^2``; and
* either has separation below 4/5 or has characteristic at most 2/5.

The characteristic test is a rigorous rectangle upper bound using the exact
signwise formulas

    c(u,v)=|u+v|/2                 if uv>=0,
    c(u,v)=max(|u|,|v|)/2         if uv<=0.

For a rectangle crossing a sign boundary, the universally valid upper bound
``(max|u|+max|v|)/2`` is used.  Thus correlation is never inferred from
independent coordinate envelopes.

Reproduction:

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_unit_to_four_fifths_union_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_unit_to_four_fifths_certificate as base


ctx.prec = 180

CHAR_TARGET = base.q(2, 5)


def maximum_abs(box: tuple[arb, arb]) -> arb:
    return max(abs(box[0]).upper(), abs(box[1]).upper())


def characteristic_upper(
    first: tuple[arb, arb], second: tuple[arb, arb]
) -> arb:
    """Safe upper bound for c on a coordinate rectangle."""

    # Same-sign positive rectangle.
    if first[0] >= 0 and second[0] >= 0:
        return (first[1] + second[1]) / 2
    # Same-sign negative rectangle.
    if first[1] <= 0 and second[1] <= 0:
        return -(first[0] + second[0]) / 2
    # Opposite signs, first positive and second negative.
    if first[0] >= 0 and second[1] <= 0:
        return max(first[1], -second[0]) / 2
    # Opposite signs, first negative and second positive.
    if first[1] <= 0 and second[0] >= 0:
        return max(-first[0], second[1]) / 2
    # A sign boundary is crossed.  This follows from
    # c(u,v)<= (|u|+|v|)/2 and avoids any hidden correlation assumption.
    return (maximum_abs(first) + maximum_abs(second)) / 2


def shifted(
    source: tuple[arb, arb], direction: int, logq: arb
) -> tuple[arb, arb]:
    return (
        source[0] + direction * logq,
        source[1] + direction * logq,
    )


def target_qualifies(
    jumping_target: tuple[arb, arb],
    other: tuple[arb, arb],
    r_left: arb,
    r_right: arb,
    logq: arb,
) -> bool:
    separation_ok = (
        max(abs(r_left - logq), abs(r_right - logq)) < base.TARGET_R
    )
    characteristic_ok = characteristic_upper(jumping_target, other) < CHAR_TARGET
    coordinate_ok = (
        jumping_target[0] >= -base.TARGET_COORD
        and jumping_target[1] <= base.TARGET_COORD
    )
    return bool(coordinate_ok and (separation_ok or characteristic_ok))


def selected_for_marginal(
    source: tuple[arb, arb],
    other: tuple[arb, arb],
    direction: int,
    r_left: arb,
    r_right: arb,
):
    selected = []
    for data in base.PRIME_DATA:
        _prime_power, logq, _coefficient = data
        target = shifted(source, direction, logq)
        if target_qualifies(target, other, r_left, r_right, logq):
            selected.append(data)
    return tuple(selected)


def certify_cell(
    y_left: arb, y_right: arb, r_left: arb, r_right: arb
) -> arb:
    # Correlated physical coordinates satisfy x=y-r.  The displayed boxes
    # are safe independent envelopes; every target check is performed on the
    # resulting full rectangle.
    x_box = (y_left - r_right, y_right - r_left)
    y_box = (y_left, y_right)
    z_x = base.arch_target(y_box)
    z_y = base.arch_target(x_box)

    x_selected = selected_for_marginal(
        x_box, y_box, +1, r_left, r_right
    )
    y_selected = selected_for_marginal(
        y_box, x_box, -1, r_left, r_right
    )

    selected = base.integrate_one_marginal(z_x[0], z_x[1], x_box)
    selected += base.integrate_one_marginal(z_y[0], z_y[1], y_box)
    selected += base.minimum_prime_rate(x_box, +1, x_selected)
    selected += base.minimum_prime_rate(y_box, -1, y_selected)

    # Both arch events enter the separation branch strictly.
    assert base.separation_bound(z_x, y_box) < base.TARGET_R
    assert base.separation_bound(x_box, z_y) < base.TARGET_R

    # Every selected atom enters at least one branch of the union target.
    for source, other, direction, terms in (
        (x_box, y_box, +1, x_selected),
        (y_box, x_box, -1, y_selected),
    ):
        for _prime_power, logq, _coefficient in terms:
            target = shifted(source, direction, logq)
            assert target_qualifies(target, other, r_left, r_right, logq)

    return selected


def main() -> None:
    # If |r-log(q)|<4/5 with r<=1, then log(q)<9/5.  Since exp(9/5)<7,
    # q=2,3,4,5 are the complete prime-power list that can enter through the
    # separation branch.  The characteristic branch deliberately uses the
    # same finite list; omitting larger atoms can only lower the certificate.
    assert base.q(9, 5).exp() < 7

    y_width = (base.Y_RIGHT - base.Y_LEFT) / base.Y_CELLS
    r_width = (base.R_RIGHT - base.R_LEFT) / base.R_CELLS
    worst = None
    worst_cell = None

    for i in range(base.Y_CELLS):
        y_left = base.Y_LEFT + i * y_width
        y_right = y_left + y_width
        for j in range(base.R_CELLS):
            r_left = base.R_LEFT + j * r_width
            r_right = r_left + r_width
            rate = certify_cell(y_left, y_right, r_left, r_right)
            assert rate > base.q(1, 2)
            if worst is None or rate.lower() < worst.lower():
                worst = rate
                x_box = (y_left - r_right, y_right - r_left)
                y_box = (y_left, y_right)
                worst_cell = (
                    y_left,
                    y_right,
                    r_left,
                    r_right,
                    tuple(item[0] for item in selected_for_marginal(
                        x_box, y_box, +1, r_left, r_right
                    )),
                    tuple(item[0] for item in selected_for_marginal(
                        y_box, x_box, -1, r_left, r_right
                    )),
                )

    assert worst is not None and worst_cell is not None
    print("precision_bits:", ctx.prec)
    print("source: c>2/5 and 4/5<separation<=1 in [-5/4,5/4]^2")
    print("target: c<2/5 OR separation<4/5; coordinates in [-7/5,7/5]")
    print("partition_(y,r):", base.Y_CELLS, "x", base.R_CELLS)
    print("certified_cells:", base.Y_CELLS * base.R_CELLS)
    print("worst_cell_(yL,yR,rL,rR,x_qs,y_qs):", worst_cell)
    print("worst_selected_rate:", worst)
    print("worst_margin_over_half:", worst - base.q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
