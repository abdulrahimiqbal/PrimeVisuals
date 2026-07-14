#!/usr/bin/env python3
"""Floating EDF test for the simultaneous mandatory arch ledger.

This discovery program replaces the falsified constant 51/100 beta color by
the actual spatial remainder left by the item-195 translation.  If ``z`` is
the lost y-arch target and ``u=z-1/5`` its x-arch image, item 195 validates a
full-density quotient ``R_cell`` on each of 2,800 cells.  The translation
therefore needs at most ``1/R_cell`` of the x density and leaves

    alpha_x(u) = 1 - 1/R_cell,        u>x+3/10.

Here the quotient cell is indexed by ``z=u+1/5``.  The proved increasing
tail quotient supplies the constant conservative remainder from the endpoint
cell for ``z>=13/10``.  No item-195 mass is used for ``u<=x+3/10``.  The
item-193 base slice can occur only for ``u>=9/10``;
there we additionally reserve exactly ``1/250``.  Thus this test deliberately
uses less capacity than the pointwise proof actually leaves.

For each x the one-dimensional interval Hall inequalities are evaluated by
the cumulative earliest-deadline formula.  The right-side inequalities are
computed after reflection, including reflection of the non-even function
``alpha``.  Prime-power atoms are included exactly as floating locations and
weights.  This remains a floating discovery/falsification program: a pass is
only a target for an Arb finite-flow certificate, while a positive deficit is
an active cut to enclose exactly.
"""

from __future__ import annotations

import argparse
from math import cosh

import numpy as np
from scipy.integrate import cumulative_trapezoid

import coupling_anchor_beta_hall_discovery as hall
import coupling_high_middle_halfline_arch_increment_certificate as increment


CELL_LEFT = -0.1
CELL_RIGHT = 1.3
CELL_COUNT = 2800
CELL_WIDTH = (CELL_RIGHT - CELL_LEFT) / CELL_COUNT
SUPPLY_SHIFT = 0.2
BASE_SLICE_LEFT = 0.9
BASE_FRACTION = 1 / 250


def validated_ratio_floors() -> tuple[np.ndarray, float]:
    """Recompute the exact item-195 lower quotient on every compact cell."""

    base = increment.base
    q = increment.q
    width = (increment.Z_RIGHT - increment.Z_LEFT) / increment.CELLS
    floors = np.empty(increment.CELLS)
    for index in range(increment.CELLS):
        left = increment.Z_LEFT + index * width
        right = left + width
        z = base.interval(left, right)
        supply_k, _ = base.kernel_bounds(z - q(1, 5))
        _, demand_k = base.kernel_bounds(z)
        supply_j = base.levy_shape(right + q(2, 5)).lower()
        demand_j = base.levy_shape(q(7, 5) - right).upper()
        ratio = (
            (supply_k * supply_j / increment.C06)
            / (demand_k * demand_j / increment.C14)
        )
        assert ratio > 2
        floors[index] = float(ratio.lower())

    displacement = q(1, 5)
    tail_kernel_ratio = increment.kernel_quotient_lower(
        increment.Z_RIGHT, displacement
    )
    tail_elementary_ratio = (
        (-q(3, 20)).exp()
        / (
            2
            * base.levy_shape(q(1, 10))
            * increment.C06
        )
    )
    tail_ratio = tail_kernel_ratio * tail_elementary_ratio
    assert tail_ratio > 2
    return floors, float(tail_ratio.lower())


RATIO_FLOORS, TAIL_RATIO_FLOOR = validated_ratio_floors()


def leftover_fraction(x: float, u: np.ndarray) -> np.ndarray:
    """Conservative spatial arch fraction left for the beta transport."""

    u = np.asarray(u, dtype=float)
    result = np.ones_like(u)
    z = u + SUPPLY_SHIFT
    used_by_increment = u > x + 0.3
    compact = used_by_increment & (z > CELL_LEFT) & (z < CELL_RIGHT)
    indices = np.floor((z[compact] - CELL_LEFT) / CELL_WIDTH).astype(int)
    indices = np.clip(indices, 0, CELL_COUNT - 1)
    result[compact] -= 1 / RATIO_FLOORS[indices]
    tail = used_by_increment & (z >= CELL_RIGHT)
    result[tail] -= 1 / TAIL_RATIO_FLOOR
    result[u >= BASE_SLICE_LEFT] -= BASE_FRACTION
    assert np.all(result > 0)
    assert np.all(result <= 1)
    return result


class VariableScanner(hall.HallScanner):
    def capacity_data_weighted(self, x: float, reflected: bool):
        """Left-of-x capacity, with alpha(u) or its reflected alpha(-u)."""

        c = cosh(x / 2)
        arch = np.zeros_like(self.u)
        mask = self.u < x
        h = x - self.u[mask]
        physical_u = -self.u[mask] if reflected else self.u[mask]
        physical_x = -x if reflected else x
        arch[mask] = (
            leftover_fraction(physical_x, physical_u)
            * hall.kernel(self.u[mask])
            * hall.levy(h)
            / c
        )
        stop = int(np.searchsorted(self.u, x, side="left"))
        arch_cdf = np.zeros_like(self.u)
        if stop >= 2:
            arch_cdf[1:stop] = cumulative_trapezoid(
                arch[:stop], self.u[:stop]
            )
            arch_cdf[stop:] = np.inf

        targets = x - np.log(self.qs)
        weights = self.coefficients * hall.kernel(targets) / c
        keep = (targets >= self.u_min) & (targets < x)
        order = np.argsort(targets[keep])
        targets = targets[keep][order]
        prefix = np.cumsum(weights[keep][order])
        return arch_cdf, targets, prefix

    def left_witness_weighted(
        self,
        x: float,
        sign: int,
        d: float,
        reflected: bool,
    ) -> hall.Witness:
        z = self.z[self.z < x - d - self.step / 2]
        if z.size == 0:
            return hall.Witness(-np.inf, np.nan, np.nan, "left")
        f = self.demand_cdf(sign, z)
        data = self.capacity_data_weighted(x, reflected)
        left = f - self.capacity_cdf(data, z + d)
        right = f - self.capacity_cdf(data, z - d)
        prefix_argmin = np.minimum.accumulate(right)
        running_index = np.empty(z.size, dtype=int)
        best = 0
        for index in range(z.size):
            if right[index] < right[best]:
                best = index
            running_index[index] = best
        gaps = left - prefix_argmin
        j = int(np.argmax(gaps))
        return hall.Witness(
            float(gaps[j]),
            float(z[running_index[j]]),
            float(z[j]),
            "left",
        )

    def witness_weighted(self, x: float, d: float) -> hall.Witness:
        # The demand is beta-plus.  Reflection turns it into beta-minus and
        # turns alpha(u) into alpha(-u).
        left = self.left_witness_weighted(x, +1, d, False)
        reflected = self.left_witness_weighted(-x, -1, d, True)
        right = hall.Witness(
            reflected.deficit,
            -reflected.b,
            -reflected.a,
            "right",
        )
        return left if left.deficit >= right.deficit else right


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--x-step", type=float, default=0.01)
    parser.add_argument("--grid-step", type=float, default=0.0002)
    parser.add_argument("--z-bound", type=float, default=3.0)
    parser.add_argument("--distance", type=float, default=0.354)
    args = parser.parse_args()

    scanner = VariableScanner(0.6, args.grid_step, args.z_bound)
    worst: tuple[float, float, hall.Witness] | None = None
    for x0 in np.arange(-0.6, 0.6 + args.x_step / 2, args.x_step):
        x = float(round(x0, 12))
        witness = scanner.witness_weighted(x, args.distance)
        row = (witness.deficit, x, witness)
        if worst is None or witness.deficit > worst[0]:
            worst = row
        print(f"x={x:+.3f} {witness}", flush=True)

    assert worst is not None
    print("compact_ratio_floor_min:", float(RATIO_FLOORS.min()))
    print("tail_ratio_floor:", TAIL_RATIO_FLOOR)
    print(
        "leftover_at_x=-.6_u=0:",
        float(leftover_fraction(-0.6, np.array([0.0]))[0]),
    )
    print(
        "leftover_at_x=+.6_u=0:",
        float(leftover_fraction(+0.6, np.array([0.0]))[0]),
    )
    print(
        "leftover_at_x=+.6_u=.9:",
        float(leftover_fraction(+0.6, np.array([0.9]))[0]),
    )
    print("worst_discovered:", worst)
    print("status: FLOATING-POINT DISCOVERY ONLY")


if __name__ == "__main__":
    main()
