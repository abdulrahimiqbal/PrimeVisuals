#!/usr/bin/env python3
"""Exact falsifier for the split-q5 version of the 1 to 4/5 shrink.

This preserves the failed allocation that was once implemented in
``coupling_unit_to_four_fifths_certificate.py``.  When the right-coordinate
q=5 atom is separation-qualified, the failed ledger removes it from the
correlated q=2,3,4,5 marginal sum and lower-bounds q=5 separately.  Although
both lower bounds are valid, their sum loses source correlation and is too
small to prove the required uniform rate 1/2.

The program exhausts the same exact rational partition and proves that the
reported worst Arb enclosure lies wholly below 1/2.  It falsifies only this
split-minimum allocation, not the corrected correlated-sum certificate.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_unit_to_four_fifths_paired_grouping_falsifier.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_unit_to_four_fifths_certificate as base


ctx.prec = 180


def failed_certify_cell(
    y_left: arb, y_right: arb, r_left: arb, r_right: arb
) -> arb:
    x_box = (y_left - r_right, y_right - r_left)
    y_box = (y_left, y_right)
    z_x = base.arch_target(y_box)
    z_y = base.arch_target(x_box)
    x_selected = base.selected_for_marginal(
        x_box, +1, r_left, r_right
    )
    y_selected_all = base.selected_for_marginal(
        y_box, -1, r_left, r_right
    )
    # The precise defect: q=5 is split out of the correlated marginal sum.
    y_selected_without_five = tuple(
        item for item in y_selected_all if item[0] != 5
    )

    selected = base.integrate_one_marginal(z_x[0], z_x[1], x_box)
    selected += base.integrate_one_marginal(z_y[0], z_y[1], y_box)
    selected += base.minimum_prime_rate(x_box, +1, x_selected)
    selected += base.minimum_prime_rate(
        y_box, -1, y_selected_without_five
    )

    q5 = base.PRIME_BY_POWER[5]
    q5_single_qualifies = any(
        item[0] == 5 for item in y_selected_all
    )
    if q5_single_qualifies:
        selected += base.minimum_prime_rate(y_box, -1, (q5,))
    else:
        selected += base.paired_two_five_rate(
            x_box, y_box, r_left, r_right
        )

    assert base.separation_bound(z_x, y_box) < base.TARGET_R
    assert base.separation_bound(x_box, z_y) < base.TARGET_R
    return selected


def main() -> None:
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
            rate = failed_certify_cell(
                y_left, y_right, r_left, r_right
            )
            if worst is None or rate.lower() < worst.lower():
                worst = rate
                x_box = (y_left - r_right, y_right - r_left)
                y_box = (y_left, y_right)
                worst_cell = (
                    y_left,
                    y_right,
                    r_left,
                    r_right,
                    tuple(item[0] for item in base.selected_for_marginal(
                        x_box, +1, r_left, r_right
                    )),
                    tuple(item[0] for item in base.selected_for_marginal(
                        y_box, -1, r_left, r_right
                    )),
                )

    assert worst is not None and worst_cell is not None
    print("precision_bits:", ctx.prec)
    print("failed_allocation: split q5 minimum above its onset")
    print("partition_(y,r):", base.Y_CELLS, "x", base.R_CELLS)
    print("certified_cells:", base.Y_CELLS * base.R_CELLS)
    print("worst_cell_(yL,yR,rL,rR,x_qs,y_qs):", worst_cell)
    print("worst_selected_rate:", worst)
    print("worst_margin_over_half:", worst - base.q(1, 2))
    assert worst < base.q(1, 2)
    print("falsifier: PASS")


if __name__ == "__main__":
    main()
