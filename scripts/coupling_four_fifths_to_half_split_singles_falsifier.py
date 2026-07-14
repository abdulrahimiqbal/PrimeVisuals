#!/usr/bin/env python3
"""Exact witness against splitting qualifying prime minima atom by atom.

The obsolete ledger lower-bounded every single-coordinate prime atom on its
own before adding the bounds.  At the rational source cell printed below,
the complete current allocation—including both characteristic-only
archimedean pieces—then has total rate rigorously below 1/2.  The corrected
certificate instead keeps all qualifying single atoms of each marginal in
one correlated sum and takes one uniform lower bound.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_four_fifths_to_half_split_singles_falsifier.py
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

import coupling_four_fifths_to_half_local_certificate as base


ctx.prec = 180


def split_prime_ledger(x_box, y_box):
    x_nodes = []
    y_nodes = []
    singles = Fraction(0)
    x_single_labels = []
    y_single_labels = []

    for data in base.PRIME_DATA:
        power, logq, _coefficient = data
        for direction in (-1, +1):
            target = base.shifted(x_box, direction, logq)
            if base.coordinate_ok(target):
                minimum = base.minimum_atom_rate(
                    x_box, direction, data
                )
                if minimum > 0:
                    capacity = base.rational_below(minimum)
                    label = (power, direction)
                    if base.target_ok(target, y_box):
                        singles += capacity
                        x_single_labels.append(label)
                    else:
                        x_nodes.append((label, target, capacity))

            target = base.shifted(y_box, direction, logq)
            if base.coordinate_ok(target):
                minimum = base.minimum_atom_rate(
                    y_box, direction, data
                )
                if minimum > 0:
                    capacity = base.rational_below(minimum)
                    label = (power, direction)
                    if base.target_ok(x_box, target):
                        singles += capacity
                        y_single_labels.append(label)
                    else:
                        y_nodes.append((label, target, capacity))

    size = len(x_nodes) + len(y_nodes) + 2
    source = size - 2
    target = size - 1
    flow = base.ExactFlow(size)
    for index, (_label, _box, capacity) in enumerate(x_nodes):
        flow.add(source, index, capacity)
    for index, (_label, _box, capacity) in enumerate(y_nodes):
        flow.add(len(x_nodes) + index, target, capacity)

    edge_count = 0
    for x_index, (_label, x_target, _capacity) in enumerate(x_nodes):
        for y_index, (_label2, y_target, _capacity2) in enumerate(y_nodes):
            if base.target_ok(x_target, y_target):
                flow.add(
                    x_index, len(x_nodes) + y_index, Fraction(10)
                )
                edge_count += 1

    return (
        singles + flow.maximum(source, target),
        tuple(x_single_labels),
        tuple(y_single_labels),
        edge_count,
    )


def main() -> None:
    y_left = base.q(79, 80)
    y_right = base.q(1)
    r_left = base.q(79, 100)
    r_right = base.q(4, 5)
    x_box = y_left - r_right, y_right - r_left
    y_box = y_left, y_right
    x_arch = base.arch_target(y_box)
    y_arch = base.arch_target(x_box)
    arch = base.integrate_arch(
        x_arch[0], x_arch[1], x_box, base.BASE_ARCH_CELLS
    )
    arch += base.integrate_arch(
        y_arch[0], y_arch[1], y_box, base.BASE_ARCH_CELLS
    )
    arch += base.characteristic_arch_rate(
        x_box, y_box, x_arch, base.BASE_ARCH_CELLS
    )
    arch += base.characteristic_arch_rate(
        y_box, x_box, y_arch, base.BASE_ARCH_CELLS
    )
    prime, x_singles, y_singles, edge_count = split_prime_ledger(
        x_box, y_box
    )
    rate = arch + base.fraction_arb(prime)

    print("precision_bits:", ctx.prec)
    print("witness_(yL,yR,rL,rR):", (
        y_left, y_right, r_left, r_right
    ))
    print("x_singles:", x_singles)
    print("y_singles:", y_singles)
    print("pair_edges:", edge_count)
    print("split_ledger_rate:", rate)
    print("margin_over_half:", rate - base.q(1, 2))
    assert rate < base.q(1, 2)
    print("falsifier: PASS")


if __name__ == "__main__":
    main()
