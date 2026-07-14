#!/usr/bin/env python3
"""Exact local shrink from separation 4/5 to separation 1/2.

Write

    c(u,v)=|m|+(r-2|m|)_+/4,  m=(u+v)/2, r=|u-v|,
    S={c<=2/5 or r<=1/2}.

After ordering and reflection, this certificate treats the robust compact
sub-band

    c(x,y)>2/5,       1/2<y-x<=4/5,       y<=1.

The geometry forces ``13/20<y<=1``.  We cover the containing rational
rectangle ``13/20<=y<=1, 1/2<=r<=4/5`` and discard only cells that cannot
contain a point with ``c>2/5``.

On every remaining source cell we use two finite archimedean single-jump
submeasures into the strict 1/2-balls about the other coordinate.  Disjoint
signwise intervals entering the characteristic branch c<2/5 are then added;
a strict rational gap separates them from the first allocation.  Their rates
are rigorous lower Darboux sums, with a 256-bin first pass and a 512-bin exact
rescue before any source refinement.

We then form a finite bipartite flow from signed x-prime atoms to signed
y-prime atoms.  A prime atom is first used as a single-coordinate clock
whenever its whole target rectangle is in S.  All such atoms from one
marginal are lower-bounded as one correlated sum over the source coordinate;
splitting their minima atom-by-atom would discard valid correlation and is
insufficient on the exact witness in the companion falsifier.  If the
exact rational lower bound is L and the
pointwise selected-atom sum is H(s), the subclock is defined by the measurable
common thinning factor L/H(s); hence its atom rates are dominated termwise
and its total rate is exactly L.  Every remaining flow edge is retained only
when its whole two-coordinate target rectangle is in S.  Capacities are
rounded *down* to exact rationals before the max-flow computation; the
resulting ledger therefore defines fixed cellwise subclocks dominated by the
physical marginals.  The two marginals are processed independently, and no
marginal atom is reused.  The failed full-ledger split-minimum allocation is
preserved in
``coupling_four_fifths_to_half_split_singles_falsifier.py``.

The prime labels are 2,3,4,5,7,8,9.  This is merely a constructive finite
selection, not an assertion that larger prime powers cannot help.  Target
coordinates are restricted to [-2,2].

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_four_fifths_to_half_local_certificate.py
"""

from __future__ import annotations

from fractions import Fraction

from flint import arb, ctx

from coupling_unit_to_four_fifths_union_certificate import (
    characteristic_upper,
)
from coupling_wide_separation_band_certificate import (
    C,
    interval,
    k_positive_unchecked,
    q,
)
import coupling_wide_separation_band_certificate as wide_base


ctx.prec = 180

Y_LEFT = q(13, 20)
Y_RIGHT = arb(1)
R_LEFT = q(1, 2)
R_RIGHT = q(4, 5)
TARGET_R = q(1, 2)
TARGET_C = q(2, 5)
TARGET_GAP = q(1, 100_000)
TARGET_COORD = arb(2)

Y_CELLS = 28                 # width 1/80
R_CELLS = 30                 # width 1/100
PRIME_CELLS = 48
MAX_REFINEMENT_DEPTH = 8
BASE_ARCH_CELLS = 256
RESCUE_ARCH_CELLS = 512

# Most cells certify with a 256-piece target Darboux sum.  Cells close to the
# half-rate threshold are recomputed with 512 pieces before source refinement;
# both are rigorous lower sums, and the mesh choice is recorded per leaf.

PRIME_DATA = tuple(
    (
        prime_power,
        arb(prime_power).log(),
        arb(prime).log() / arb(prime_power).sqrt(),
    )
    for prime_power, prime in (
        (2, 2), (3, 3), (4, 2), (5, 5), (7, 7), (8, 2), (9, 3)
    )
)


def kernel_even(argument: arb) -> arb:
    if argument < 0:
        return k_positive_unchecked(-argument)
    if argument > 0:
        return k_positive_unchecked(argument)
    radius = max(abs(argument.lower()), abs(argument.upper()))
    return k_positive_unchecked(arb(0, radius))


def integrate_arch(
    left: arb,
    right: arb,
    source_box: tuple[arb, arb],
    cells: int,
) -> arb:
    """Rigorous lower Darboux sum with an explicit target mesh size."""

    assert right > left
    assert cells > 0
    width = (right - left) / cells
    total = arb(0)
    for index in range(cells):
        lo = left + index * width
        z = interval(lo, lo + width)
        density = kernel_even(z).lower()
        density *= wide_base.source_density_lower(z, source_box)
        if density > 0:
            total += density * width
    return total


def shifted(source: tuple[arb, arb], direction: int, logq: arb):
    return source[0] + direction * logq, source[1] + direction * logq


def separation_bound(first: tuple[arb, arb], second: tuple[arb, arb]) -> arb:
    return max(abs(first[0] - second[1]), abs(first[1] - second[0]))


def coordinate_ok(box: tuple[arb, arb]) -> bool:
    return bool(box[0] >= -TARGET_COORD and box[1] <= TARGET_COORD)


def target_ok(first: tuple[arb, arb], second: tuple[arb, arb]) -> bool:
    return bool(
        coordinate_ok(first)
        and coordinate_ok(second)
        and (
            separation_bound(first, second) <= TARGET_R
            or characteristic_upper(first, second) <= TARGET_C
        )
    )


def arch_target(other: tuple[arb, arb]) -> tuple[arb, arb]:
    left = max(-TARGET_COORD, other[1] - TARGET_R + TARGET_GAP)
    right = min(TARGET_COORD, other[0] + TARGET_R - TARGET_GAP)
    assert right > left
    return left, right


def maximum_abs(box: tuple[arb, arb]) -> arb:
    return max(abs(box[0]).upper(), abs(box[1]).upper())


def characteristic_arch_candidates(
    other: tuple[arb, arb]
) -> tuple[tuple[arb, arb], ...]:
    """Disjoint sign boxes whose product with ``other`` has c<2/5."""

    limit = 2 * TARGET_C
    gap = TARGET_GAP
    candidates = []

    if other[0] >= 0:
        # For z<0, c(z,v)=max(-z,v)/2; for z>0,
        # c(z,v)=(z+v)/2.  Splitting at zero retains both sharp formulas.
        if other[1] < limit:
            candidates.append((-limit + gap, -gap))
            positive_right = limit - other[1] - gap
            if positive_right > gap:
                candidates.append((gap, positive_right))
    elif other[1] <= 0:
        # Reflection of the preceding case.
        if -other[0] < limit:
            negative_left = -limit - other[0] + gap
            if negative_left < -gap:
                candidates.append((negative_left, -gap))
            candidates.append((gap, limit - gap))
    else:
        # A source box crossing zero does not have a fixed sign.  The general
        # inequality c(z,v)<=(|z|+|v|)/2 gives a conservative safe radius.
        radius = maximum_abs(other)
        if radius < limit:
            reach = limit - radius - gap
            if reach > gap:
                candidates.append((-reach, -gap))
                candidates.append((gap, reach))

    result = []
    for candidate in candidates:
        if candidate[1] <= candidate[0]:
            continue
        assert coordinate_ok(candidate)
        assert characteristic_upper(candidate, other) <= TARGET_C
        result.append(candidate)
    return tuple(result)


def subtract_interval(
    candidate: tuple[arb, arb], used: tuple[arb, arb]
) -> tuple[tuple[arb, arb], ...]:
    """Return candidate minus a strict gap around the used interval."""

    left, right = candidate
    pieces = []
    left_end = min(right, used[0] - TARGET_GAP)
    if left_end > left:
        pieces.append((left, left_end))
    right_start = max(left, used[1] + TARGET_GAP)
    if right > right_start:
        pieces.append((right_start, right))
    return tuple(pieces)


def characteristic_arch_rate(
    source: tuple[arb, arb],
    other: tuple[arb, arb],
    separation_target: tuple[arb, arb],
    arch_cells: int,
) -> arb:
    """Rate of characteristic-only arch pieces disjoint from sep target."""

    total = arb(0)
    for candidate in characteristic_arch_candidates(other):
        for piece in subtract_interval(candidate, separation_target):
            assert coordinate_ok(piece)
            assert characteristic_upper(piece, other) <= TARGET_C
            # A rational gap makes disjointness interval-decidable; no appeal
            # to measure-zero endpoint overlap is needed.
            assert piece[1] <= separation_target[0] or (
                piece[0] >= separation_target[1]
            )
            total += integrate_arch(
                piece[0], piece[1], source, arch_cells
            )
    return total


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


def minimum_atom_sum_rate(
    source: tuple[arb, arb], selected
) -> arb:
    """Uniform lower bound for a correlated sum of distinct prime atoms."""

    assert selected
    left, right = source
    width = (right - left) / PRIME_CELLS
    minimum = None
    for index in range(PRIME_CELLS):
        lo = left + index * width
        s = interval(lo, lo + width)
        value = arb(0)
        for data, direction in selected:
            _power, logq, coefficient = data
            value += coefficient * kernel_even(
                s + direction * logq
            ) / C(s)
        lower = value.lower()
        if minimum is None or lower < minimum:
            minimum = lower
    assert minimum is not None
    return minimum


def rational_below(value: arb) -> Fraction:
    """Return a positive exact rational strictly below a positive Arb ball."""

    assert value > 0
    lower_midpoint = value.lower()
    mantissa, exponent = lower_midpoint.man_exp()
    mantissa = int(mantissa)
    exponent = int(exponent)
    if exponent >= 0:
        dyadic = Fraction(mantissa * 2**exponent)
    else:
        dyadic = Fraction(mantissa, 2 ** (-exponent))
    # Move a fixed relative amount below the midpoint returned for the lower
    # endpoint.  The following verification is interval-exact; repeated
    # halving is only a guard against a future change in Arb's endpoint
    # conversion and retains arbitrarily small positive atom sums.
    candidate = dyadic * Fraction(999_999_999_999, 1_000_000_000_000)
    while not arb(candidate.numerator) / candidate.denominator < value:
        candidate /= 2
    assert candidate > 0
    return candidate


def fraction_arb(value: Fraction) -> arb:
    return arb(value.numerator) / value.denominator


class ExactFlow:
    """Small deterministic Dinic flow over exact ``Fraction`` capacities."""

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


def prime_ledger(x_box, y_box) -> tuple[Fraction, tuple, tuple, int]:
    x_nodes = []
    y_nodes = []
    singles = Fraction(0)
    x_single_terms = []
    y_single_terms = []
    x_single_labels = []
    y_single_labels = []

    for data in PRIME_DATA:
        power, logq, _coefficient = data
        for direction in (-1, +1):
            target = shifted(x_box, direction, logq)
            if coordinate_ok(target):
                label = (power, direction)
                if target_ok(target, y_box):
                    x_single_terms.append((data, direction))
                    x_single_labels.append(label)
                else:
                    minimum = minimum_atom_rate(
                        x_box, direction, data
                    )
                    if minimum > 0:
                        capacity = rational_below(minimum)
                        x_nodes.append((label, target, capacity))

            target = shifted(y_box, direction, logq)
            if coordinate_ok(target):
                label = (power, direction)
                if target_ok(x_box, target):
                    y_single_terms.append((data, direction))
                    y_single_labels.append(label)
                else:
                    minimum = minimum_atom_rate(
                        y_box, direction, data
                    )
                    if minimum > 0:
                        capacity = rational_below(minimum)
                        y_nodes.append((label, target, capacity))

    if x_single_terms:
        singles += rational_below(
            minimum_atom_sum_rate(x_box, tuple(x_single_terms))
        )
    if y_single_terms:
        singles += rational_below(
            minimum_atom_sum_rate(y_box, tuple(y_single_terms))
        )

    size = len(x_nodes) + len(y_nodes) + 2
    source = size - 2
    target = size - 1
    flow = ExactFlow(size)
    for index, (_label, _box, capacity) in enumerate(x_nodes):
        flow.add(source, index, capacity)
    for index, (_label, _box, capacity) in enumerate(y_nodes):
        flow.add(len(x_nodes) + index, target, capacity)

    edge_count = 0
    for x_index, (_x_label, x_target, _x_capacity) in enumerate(x_nodes):
        for y_index, (_y_label, y_target, _y_capacity) in enumerate(y_nodes):
            if target_ok(x_target, y_target):
                flow.add(x_index, len(x_nodes) + y_index, Fraction(10))
                edge_count += 1

    return (
        singles + flow.maximum(source, target),
        tuple(x_single_labels),
        tuple(y_single_labels),
        edge_count,
    )


def certify_cell(
    y_left: arb,
    y_right: arb,
    r_left: arb,
    r_right: arb,
    arch_cells: int = BASE_ARCH_CELLS,
):
    x_box = y_left - r_right, y_right - r_left
    y_box = y_left, y_right
    x_arch = arch_target(y_box)
    y_arch = arch_target(x_box)

    arch = integrate_arch(x_arch[0], x_arch[1], x_box, arch_cells)
    arch += integrate_arch(y_arch[0], y_arch[1], y_box, arch_cells)
    arch += characteristic_arch_rate(
        x_box, y_box, x_arch, arch_cells
    )
    arch += characteristic_arch_rate(
        y_box, x_box, y_arch, arch_cells
    )
    assert target_ok(x_arch, y_box)
    assert target_ok(x_box, y_arch)

    prime, x_singles, y_singles, edge_count = prime_ledger(x_box, y_box)
    return arch + fraction_arb(prime), x_singles, y_singles, edge_count


def main() -> None:
    y_width = (Y_RIGHT - Y_LEFT) / Y_CELLS
    r_width = (R_RIGHT - R_LEFT) / R_CELLS
    worst = None
    worst_cell = None
    certified = 0
    skipped = 0
    maximum_depth = 0
    maximum_arch_cells = 0

    def certify_or_split(
        yl: arb, yr: arb, rl: arb, rr: arb, depth: int = 0
    ) -> None:
        nonlocal worst, worst_cell, certified, skipped, maximum_depth
        nonlocal maximum_arch_cells
        # With ordered/reflected coordinates in this rectangle, a source
        # outside c<=2/5 must have x>=0 and c=y-r/2.  If even its upper
        # envelope is at most 2/5, the whole cell is already in S.
        if yr - rl / 2 <= TARGET_C:
            skipped += 1
            return
        arch_cells = BASE_ARCH_CELLS
        rate, x_singles, y_singles, edge_count = certify_cell(
            yl, yr, rl, rr, arch_cells
        )
        if not rate > q(1, 2):
            arch_cells = RESCUE_ARCH_CELLS
            rate, x_singles, y_singles, edge_count = certify_cell(
                yl, yr, rl, rr, arch_cells
            )
        if not rate > q(1, 2):
            assert depth < MAX_REFINEMENT_DEPTH, (
                yl, yr, rl, rr, rate
            )
            ym = (yl + yr) / 2
            rm = (rl + rr) / 2
            for ya, yb in ((yl, ym), (ym, yr)):
                for ra, rb in ((rl, rm), (rm, rr)):
                    certify_or_split(ya, yb, ra, rb, depth + 1)
            return
        certified += 1
        maximum_depth = max(maximum_depth, depth)
        maximum_arch_cells = max(maximum_arch_cells, arch_cells)
        if worst is None or rate.lower() < worst.lower():
            worst = rate
            worst_cell = (
                yl, yr, rl, rr, x_singles, y_singles, edge_count,
                arch_cells,
            )

    for i in range(Y_CELLS):
        yl = Y_LEFT + i * y_width
        yr = yl + y_width
        for j in range(R_CELLS):
            rl = R_LEFT + j * r_width
            rr = rl + r_width
            certify_or_split(yl, yr, rl, rr)

    assert worst is not None and worst_cell is not None
    print("precision_bits:", ctx.prec)
    print("source: c>2/5, 1/2<separation<=4/5, ordered/reflected y<=1")
    print("target: c<=2/5 OR separation<=1/2; coordinates in [-2,2]")
    print("partition_(y,r):", Y_CELLS, "x", R_CELLS)
    print("certified_cells:", certified)
    print("already_target_cells_skipped:", skipped)
    print("maximum_refinement_depth:", maximum_depth)
    print("maximum_arch_cells:", maximum_arch_cells)
    print("worst_cell_(yL,yR,rL,rR,x_singles,y_singles,pair_edges,arch_cells):")
    print(worst_cell)
    print("worst_selected_rate:", worst)
    print("worst_margin_over_half:", worst - q(1, 2))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
