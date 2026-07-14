#!/usr/bin/env python3
"""Discover finite subhazards into hard pair-state target sets.

This is a nonrigorous finite-channel search companion to item 168.  Unlike a
scalar HJB, a hard target stage needs only a marginal-admissible *selected*
subcoupling of intensity greater than 1/2 into a measurable set S.  All
unselected jumps are irrelevant to the instantaneous hazard.  For a fixed
source pair this script solves the exact finite LP suggested by that fact:

* a real-real edge consumes one atom from each marginal;
* a real-stay or stay-real edge consumes one marginal atom;
* only edges whose resulting physical pair belongs to S are admitted;
* row and column usages are bounded by the discretized marginal masses.

Archimedean targets are quadrature bins and tails are truncated, so the output
is for mechanism discovery and falsification only.  Any promoted box must be
rebuilt with cellwise Arb lower envelopes and an explicit marginal ledger.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

import numpy as np
from scipy.optimize import linprog
from scipy.sparse import coo_matrix

import coupling_characteristic_hjb_discovery as base


Target = Callable[[float, float], bool]


@dataclass
class EntryResult:
    m: float
    r: float
    rate: float
    flows: list[tuple[float, str, str, float, float]]
    dual_rows: list[tuple[float, str, float, float]]
    dual_cols: list[tuple[float, str, float, float]]
    dual_bound: float


def solve_entry(m: float, r: float, target: Target) -> EntryResult:
    x, y = m - 0.5 * r, m + 0.5 * r
    rows = base.marginal_atoms(x)
    cols = base.marginal_atoms(y)

    # Sparse variable list: (row index or -1, column index or -1, labels,
    # targets).  A -1 index denotes a no-jump coordinate.
    edges: list[tuple[int, int, str, str, float, float]] = []
    for i, a in enumerate(rows):
        if target(a.target, y):
            edges.append((i, -1, a.channel, "stay", a.target, y))
    for j, b in enumerate(cols):
        if target(x, b.target):
            edges.append((-1, j, "stay", b.channel, x, b.target))
    for i, a in enumerate(rows):
        for j, b in enumerate(cols):
            if target(a.target, b.target):
                edges.append((i, j, a.channel, b.channel, a.target, b.target))

    if not edges:
        return EntryResult(m, r, 0.0, [], [], [], 0.0)

    constraint_rows = []
    constraint_cols = []
    data = []
    for k, (i, j, *_rest) in enumerate(edges):
        if i >= 0:
            constraint_rows.append(i)
            constraint_cols.append(k)
            data.append(1.0)
        if j >= 0:
            constraint_rows.append(len(rows) + j)
            constraint_cols.append(k)
            data.append(1.0)
    capacities = coo_matrix(
        (data, (constraint_rows, constraint_cols)),
        shape=(len(rows) + len(cols), len(edges)),
    ).tocsr()
    rhs = np.array([a.mass for a in rows] + [b.mass for b in cols])
    result = linprog(
        -np.ones(len(edges)),
        A_ub=capacities,
        b_ub=rhs,
        bounds=(0.0, None),
        method="highs",
    )
    if not result.success:
        raise RuntimeError(result.message)

    flows = []
    for amount, edge in zip(result.x, edges):
        if amount > 1.0e-7:
            _i, _j, ca, cb, za, zb = edge
            flows.append((amount, ca, cb, za, zb))
    flows.sort(reverse=True)
    # For min -sum(flow), scipy reports nonpositive inequality marginals.
    # Their negatives are the fractional vertex-cover weights.  This
    # bipartite incidence LP is integral, so the values should be 0/1 apart
    # from solver tolerance and expose the active Hall/min-cut certificate.
    cover = -np.asarray(result.ineqlin.marginals)
    dual_rows = [
        (float(cover[i]), atom.channel, atom.target, atom.mass)
        for i, atom in enumerate(rows)
        if cover[i] > 1.0e-7
    ]
    dual_cols = [
        (float(cover[len(rows) + j]), atom.channel, atom.target, atom.mass)
        for j, atom in enumerate(cols)
        if cover[len(rows) + j] > 1.0e-7
    ]
    dual_bound = sum(weight * mass for weight, _c, _z, mass in dual_rows)
    dual_bound += sum(weight * mass for weight, _c, _z, mass in dual_cols)
    return EntryResult(
        m, r, -result.fun, flows, dual_rows, dual_cols, dual_bound
    )


def characteristic_sublevel(cutoff: float) -> Target:
    return lambda x, y: base.characteristic(x, y) < cutoff


def tube(radius: float) -> Target:
    return lambda x, y: abs(x - y) < radius


def union(*targets: Target) -> Target:
    return lambda x, y: any(target(x, y) for target in targets)


def scan_points(name: str, target: Target,
                points: list[tuple[float, float]]) -> None:
    print(f"TARGET {name}")
    worst = None
    for m, r in points:
        answer = solve_entry(m, r, target)
        print(
            f"  m={m:+.3f} r={r:.3f} c="
            f"{base.characteristic(m-r/2,m+r/2):.3f} "
            f"entry_rate={answer.rate:.9f}"
        )
        if worst is None or answer.rate < worst.rate:
            worst = answer
    assert worst is not None
    print(f"  WORST m={worst.m:+.3f} r={worst.r:.3f} rate={worst.rate:.9f}")
    print("  largest selected flows at worst point")
    for amount, ca, cb, za, zb in worst.flows[:15]:
        print(
            f"    mass={amount:.8f} {ca:>9s} x {cb:<9s} "
            f"target=({za:+.5f},{zb:+.5f}) "
            f"c={base.characteristic(za,zb):.5f} r={abs(za-zb):.5f}"
        )
    print()


def main() -> None:
    # Coarse symmetry-reduced compact-annulus probes.  These include the
    # previously difficult central, positive-anchor, and shoulder geometries.
    points = [
        (0.00, 0.40), (0.00, 0.80), (0.00, 1.20), (0.00, 1.70),
        (0.10, 0.40), (0.10, 0.80), (0.10, 1.20),
        (0.25, 0.40), (0.25, 0.80), (0.25, 1.20),
        (0.35, 0.40), (0.35, 0.70), (0.35, 1.20),
        (0.50, 0.40), (0.50, 0.80), (0.70, 0.20), (0.70, 0.80),
        (0.90, 0.20),
    ]
    scan_points("r<0.1", tube(0.1), points)
    scan_points("r<0.2", tube(0.2), points)
    scan_points("c<0.30 OR r<0.1",
                union(characteristic_sublevel(0.30), tube(0.1)), points)


if __name__ == "__main__":
    main()
