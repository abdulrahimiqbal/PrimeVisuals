#!/usr/bin/env python3
"""Finite-measure transport certificate into the open unit strip.

For the physical one-particle jump measures ``nu_x`` and ``nu_y``, this
script constructs a marginal-admissible selected coupling into

    |u-v| < 1

from every pair ``(x,y)`` in ``[-5/4,5/4]^2`` with ``|x-y|>=1``.  Order the
coordinates and reflect so that ``x<=y`` and ``m=(x+y)/2>=0``.  The source
triangle is then

    1 <= r=y-x <= 5/2,       0 <= m <= 5/4-r/2.

Each rational source cell has a finite bipartite transport network.  Its
vertices are disjoint archimedean target bins in [-1,1] and the signed prime
power atoms q=2,3,4,5,7,8,9,11,13,16,17,19,23 whose whole target box stays in
[-7/5,7/5].  An x-vertex has a dummy edge when its whole box lies within one
of the unchanged y-source box; y-dummy edges are symmetric.  A paired edge
is present only when every point of the two target boxes has separation
strictly below one.

Arch capacities are cellwise constant subdensities, and prime capacities are
uniform source-box lower bounds.  Every capacity is rounded strictly down to
an exact rational before deterministic max flow.  Thus the computed flow is
an explicit finite marginal ledger, not a floating-point extrapolation.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_global_unit_square_transport_certificate.py
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

from coupling_wide_separation_band_certificate import (
    C,
    J,
    interval,
    k_positive_unchecked,
    q,
)


ctx.prec = 180

SOURCE_BOUND = q(5, 4)
M_RIGHT = q(3, 4)
R_LEFT = arb(1)
R_RIGHT = q(5, 2)
TARGET_R = arb(1)
TARGET_COORD = q(7, 5)

M_CELLS = 24                 # width 1/32
R_CELLS = 30                 # width 1/20
ARCH_LEFT = -arb(1)
ARCH_RIGHT = arb(1)
ARCH_BINS = 50               # width 1/25
PRIME_CELLS = 48

PRIME_DATA = tuple(
    (
        power,
        arb(power).log(),
        arb(prime).log() / arb(power).sqrt(),
    )
    for power, prime in (
        (2, 2), (3, 3), (4, 2), (5, 5), (7, 7), (8, 2), (9, 3),
        (11, 11), (13, 13), (16, 2), (17, 17), (19, 19), (23, 23),
    )
)


def kernel_even(argument: arb) -> arb:
    if argument < 0:
        return k_positive_unchecked(-argument)
    if argument > 0:
        return k_positive_unchecked(argument)
    radius = max(abs(argument.lower()), abs(argument.upper()))
    return k_positive_unchecked(arb(0, radius))


def separation_bound(first: tuple[arb, arb], second: tuple[arb, arb]) -> arb:
    return max(abs(first[0] - second[1]), abs(first[1] - second[0]))


def target_ok(first: tuple[arb, arb], second: tuple[arb, arb]) -> bool:
    return bool(
        first[0] >= -TARGET_COORD
        and first[1] <= TARGET_COORD
        and second[0] >= -TARGET_COORD
        and second[1] <= TARGET_COORD
        and separation_bound(first, second) < TARGET_R
    )


def source_boxes(ml: arb, mr: arb, rl: arb, rr: arb):
    return (
        (ml - rr / 2, mr - rl / 2),
        (ml + rl / 2, mr + rr / 2),
    )


def arch_capacity(
    source: tuple[arb, arb], target: tuple[arb, arb]
) -> arb:
    """Mass of one constant arch subdensity on a target bin."""

    left, right = target
    z = interval(left, right)
    distance = max(
        abs(z - source[0]).upper(), abs(z - source[1]).upper()
    )
    c_upper = max(C(source[0]).upper(), C(source[1]).upper())
    density = kernel_even(z).lower() * J(distance).lower() / c_upper
    if density <= 0:
        return arb(0)
    return density * (right - left)


def minimum_atom_rate(
    source: tuple[arb, arb], direction: int, data
) -> arb:
    _power, logq, coefficient = data
    left, right = source
    width = (right - left) / PRIME_CELLS
    minimum = None
    for index in range(PRIME_CELLS):
        lo = left + index * width
        s = interval(lo, lo + width)
        value = coefficient * kernel_even(s + direction * logq) / C(s)
        lower = value.lower()
        if minimum is None or lower < minimum:
            minimum = lower
    assert minimum is not None
    return minimum


def rational_below(value: arb) -> Fraction:
    assert value > 0
    midpoint = value.lower()
    mantissa, exponent = midpoint.man_exp()
    mantissa = int(mantissa)
    exponent = int(exponent)
    if exponent >= 0:
        dyadic = Fraction(mantissa * 2**exponent)
    else:
        dyadic = Fraction(mantissa, 2 ** (-exponent))
    candidate = dyadic * Fraction(999_999_999_999, 1_000_000_000_000)
    while not arb(candidate.numerator) / candidate.denominator < value:
        candidate /= 2
    return candidate


def fraction_arb(value: Fraction) -> arb:
    return arb(value.numerator) / value.denominator


class ExactFlow:
    def __init__(self, size: int):
        self.graph: list[list[list]] = [[] for _ in range(size)]

    def add(self, source: int, target: int, capacity: Fraction) -> None:
        forward = [target, capacity, len(self.graph[target])]
        backward = [source, Fraction(0), len(self.graph[source])]
        self.graph[source].append(forward)
        self.graph[target].append(backward)

    def maximum(self, source: int, target: int) -> Fraction:
        result = Fraction(0)
        size = len(self.graph)
        while True:
            level = [-1] * size
            level[source] = 0
            queue = [source]
            for vertex in queue:
                for neighbour, capacity, _reverse in self.graph[vertex]:
                    if capacity > 0 and level[neighbour] < 0:
                        level[neighbour] = level[vertex] + 1
                        queue.append(neighbour)
            if level[target] < 0:
                return result
            cursor = [0] * size

            def send(vertex: int, amount: Fraction) -> Fraction:
                if vertex == target:
                    return amount
                while cursor[vertex] < len(self.graph[vertex]):
                    edge = self.graph[vertex][cursor[vertex]]
                    neighbour, capacity, reverse = edge
                    if capacity > 0 and level[neighbour] == level[vertex] + 1:
                        pushed = send(neighbour, min(amount, capacity))
                        if pushed > 0:
                            edge[1] -= pushed
                            self.graph[neighbour][reverse][1] += pushed
                            return pushed
                    cursor[vertex] += 1
                return Fraction(0)

            while True:
                pushed = send(source, Fraction(10))
                if pushed == 0:
                    break
                result += pushed


def marginal_nodes(source: tuple[arb, arb]):
    nodes = []
    width = (ARCH_RIGHT - ARCH_LEFT) / ARCH_BINS
    for index in range(ARCH_BINS):
        left = ARCH_LEFT + index * width
        target = left, left + width
        capacity = arch_capacity(source, target)
        if capacity > arb("1e-40"):
            nodes.append(("a" + str(index), target, rational_below(capacity)))

    for data in PRIME_DATA:
        power, logq, _coefficient = data
        for direction in (-1, +1):
            target = (
                source[0] + direction * logq,
                source[1] + direction * logq,
            )
            if target[0] < -TARGET_COORD or target[1] > TARGET_COORD:
                continue
            capacity = minimum_atom_rate(source, direction, data)
            if capacity > arb("1e-40"):
                nodes.append(
                    ((power, direction), target, rational_below(capacity))
                )
    return nodes


def selected_rate(x_box, y_box):
    x_nodes = marginal_nodes(x_box)
    y_nodes = marginal_nodes(y_box)
    size = len(x_nodes) + len(y_nodes) + 2
    source = size - 2
    target = size - 1
    flow = ExactFlow(size)

    for index, (_label, box, capacity) in enumerate(x_nodes):
        flow.add(source, index, capacity)
        if target_ok(box, y_box):
            flow.add(index, target, Fraction(10))
    for index, (_label, box, capacity) in enumerate(y_nodes):
        node = len(x_nodes) + index
        flow.add(node, target, capacity)
        if target_ok(x_box, box):
            flow.add(source, node, Fraction(10))

    edge_count = 0
    for i, (_label_x, box_x, _capacity_x) in enumerate(x_nodes):
        for j, (_label_y, box_y, _capacity_y) in enumerate(y_nodes):
            if target_ok(box_x, box_y):
                flow.add(i, len(x_nodes) + j, Fraction(10))
                edge_count += 1
    return flow.maximum(source, target), len(x_nodes), len(y_nodes), edge_count


def certify_cell(ml: arb, mr: arb, rl: arb, rr: arb):
    x_box, y_box = source_boxes(ml, mr, rl, rr)
    exact, nx, ny, edges = selected_rate(x_box, y_box)
    return fraction_arb(exact), nx, ny, edges


def main() -> None:
    m_width = M_RIGHT / M_CELLS
    r_width = (R_RIGHT - R_LEFT) / R_CELLS
    worst = None
    worst_cell = None
    leaves = 0
    skipped = 0
    maximum_depth = 0

    def certify_or_split(
        ml: arb, mr: arb, rl: arb, rr: arb, depth: int = 0
    ) -> None:
        nonlocal worst, worst_cell, leaves, skipped, maximum_depth
        # The complete cell is beyond y=m+r/2<=5/4.
        if ml + rl / 2 > SOURCE_BOUND:
            skipped += 1
            return
        rate, nx, ny, edges = certify_cell(ml, mr, rl, rr)
        if not rate > q(1, 2):
            assert depth < 6, (ml, mr, rl, rr, rate)
            mm = (ml + mr) / 2
            rm = (rl + rr) / 2
            for ma, mb in ((ml, mm), (mm, mr)):
                for ra, rb in ((rl, rm), (rm, rr)):
                    certify_or_split(ma, mb, ra, rb, depth + 1)
            return
        leaves += 1
        maximum_depth = max(maximum_depth, depth)
        if worst is None or rate.lower() < worst.lower():
            worst = rate
            worst_cell = (ml, mr, rl, rr, nx, ny, edges)

    for i in range(M_CELLS):
        ml = i * m_width
        mr = ml + m_width
        for j in range(R_CELLS):
            rl = R_LEFT + j * r_width
            rr = rl + r_width
            certify_or_split(ml, mr, rl, rr)

    assert worst is not None and worst_cell is not None
    print("precision_bits:", ctx.prec)
    print("source_square: [-5/4,5/4]^2, separation>=1")
    print("target: separation<1, coordinates in [-7/5,7/5]")
    print("base_partition_(m,r):", M_CELLS, "x", R_CELLS)
    print("certified_leaf_cells:", leaves)
    print("outside_triangle_cells_skipped:", skipped)
    print("maximum_refinement_depth:", maximum_depth)
    print("worst_cell_(mL,mR,rL,rR,nx,ny,edges):", worst_cell)
    print("worst_selected_rate:", worst)
    print("worst_margin_over_half:", worst - q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
