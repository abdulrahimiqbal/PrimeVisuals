#!/usr/bin/env python3
"""Rigorous discovery for full beta transport through anchors |x|<=6.

This reuses the exact upper-demand/lower-capacity flow proved in
``coupling_mixed_anchor_beta_full_certificate.py``, but enlarges the anchor
range and allows middle product distance below 499/1000.  If every adaptive
cell passes, the output is an exact finite certificate on the displayed
range; this file remains labelled discovery until its continuum theorem and
finite-source consequence receive an independent audit.
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

import coupling_mixed_anchor_beta_full_certificate as full
import coupling_mixed_anchor_beta_hall_certificate as base


ctx.prec = 200

ANCHOR_BOUND = base.q(6)
MIDDLE_D = base.q(499, 1000)
X_BASE_CELLS = 120
MAX_DEPTH = 8


def main() -> None:
    base.TARGET_D = base.q(1, 2)
    base.MIDDLE_D = MIDDLE_D
    base.S = ANCHOR_BOUND
    base.X_BASE_CELLS = X_BASE_CELLS
    base.DEMAND_CAPACITIES = {
        +1: full.middle_demand_upper_capacities(+1),
        -1: full.middle_demand_upper_capacities(-1),
    }

    tail_ratio = base.tail_ratio_certificate()
    x_width = ANCHOR_BOUND / X_BASE_CELLS
    leaves = 0
    maximum_depth = 0
    worst = None
    worst_cell = None

    def certify_or_split(left: arb, right: arb, depth: int = 0) -> None:
        nonlocal leaves, maximum_depth, worst, worst_cell
        supplies = tuple(
            base.Supply(node.label, node.box, Fraction(1, 2))
            if node.label == ("hold",)
            else node
            for node in base.supplies((left, right))
        )
        results = {
            sign: base.greedy_match(supplies, sign) for sign in (-1, +1)
        }
        if not all(result[0] for result in results.values()):
            assert depth < MAX_DEPTH, (left, right, depth, results)
            middle = (left + right) / 2
            certify_or_split(left, middle, depth + 1)
            certify_or_split(middle, right, depth + 1)
            return
        leaves += 1
        maximum_depth = max(maximum_depth, depth)
        for sign, result in results.items():
            reserve = result[2]
            if worst is None or reserve < worst:
                worst = reserve
                worst_cell = (left, right, sign, result[3])

    for index in range(X_BASE_CELLS):
        left = index * x_width
        certify_or_split(left, left + x_width)

    assert worst is not None and worst_cell is not None
    print("precision_bits:", ctx.prec)
    print("anchor_interval: [-6,6] (reflection from [0,6])")
    print("middle_product_separation_bound:", MIDDLE_D)
    print("tail_translation_distance:", base.TAIL_SHIFT)
    print("tail_density_ratio_lower:", tail_ratio)
    print("prime_power_constructive_cutoff_and_count:", base.Q_MAX,
          len(base.PRIME_DATA))
    print("base_x_cells:", X_BASE_CELLS)
    print("certified_x_leaves:", leaves)
    print("maximum_x_refinement_depth:", maximum_depth)
    print("worst_cell_(xL,xR,beta_sign,active_nodes):", worst_cell)
    print("worst_current_flow_reserve:", base.fraction_arb(worst))
    print("status: RIGOROUS DISCOVERY PASS")


if __name__ == "__main__":
    main()
