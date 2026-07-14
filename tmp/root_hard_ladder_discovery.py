#!/usr/bin/env python3
"""Floating source-grid discovery for the post-half hard ladder."""

from __future__ import annotations

import numpy as np

import coupling_hard_stage_discovery as hard
import coupling_characteristic_hjb_discovery as base


def target(c0: float, r0: float):
    return hard.union(hard.characteristic_sublevel(c0), hard.tube(r0))


def scan(name, source_c, source_r, target_c, target_r, coord=2.0):
    desired = target(target_c, target_r)
    rows = []
    for m in np.linspace(0.0, coord, 25):
        max_r = 2 * (coord - m)
        for r in np.linspace(0.0, max_r, 33):
            x, y = m - r / 2, m + r / 2
            c = base.characteristic(x, y)
            if not (c <= source_c + 1e-12 or r <= source_r + 1e-12):
                continue
            if c < target_c or r < target_r:
                continue
            answer = hard.solve_entry(float(m), float(r), desired)
            rows.append((answer.rate, m, r, c, answer))
    rows.sort(key=lambda row: row[0])
    print("STAGE", name, "count", len(rows))
    for rate, m, r, c, _answer in rows[:12]:
        print("cell", rate, m, r, c)
    answer = rows[0][4]
    print("worst flows")
    for flow in answer.flows[:24]:
        print(flow)
    print("dual rows", answer.dual_rows[:24])
    print("dual cols", answer.dual_cols[:24])
    print("dual bound", answer.dual_bound)


def main():
    scan("T0_to_T1", .4, .5, .3, .2)
    scan("T1_to_T2", .3, .2, .2, .15)


if __name__ == "__main__":
    main()
