#!/usr/bin/env python3
"""Exact compact switch cover for the mandatory high-mixed halfline.

Put

    d=v-x-1/2>0,  e=y-v>=log(2),  a=x+d=v-1/2,
    y=x+1/2+d+e.

On ``|x|<=3/5``, ``7/5<=y<=4`` and ``a<1``, this certificate proves the
remaining prime ledger after the small-e base and the displacement-1/5
continuous transport:

    Y = sum_(log n<=e) Lambda(n)n^(-1/2)K(y-log n)/C(y)

      <= X + A,                                             (1)

    X = sum_(log m>=d) Lambda(m)m^(-1/2)K(x+log m)/C(x),

    A = C(x)^(-1) [
          int_d^(d+3/10) K(x+h)J(h)dh
        + (1/2)int_(d+3/10)^(d+e) K(x+h)J(h)dh
        + (1/2)int_(d+e+1/20)^(d+e+1/5) K(x+h)J(h)dh
        + int_(d+e+1/5)^infinity K(x+h)J(h)dh ].             (2)

Formula (2) is exactly the disjoint multiplicity form of

    (1/2)nu_x^arch(T\\I)+(1/2)nu_x^arch(T\\S_y),

where ``T=[v-1/2,infinity)``, ``I=[v-1/5,y-3/10]`` is the image of the
continuous transport, and ``S_y=[y-1/2,y-9/20]`` is the small-e base slice.
Thus (1) proves the exact residual Hall cut, not the false half-arch-only
strengthening falsified at q=13.

All switches are handled exactly.  The e cells are
``[log q_i,log q_(i+1))`` and contain precisely the first i captured y
atoms; the lower endpoint is included.  The d cells are
``(log q_(j-1),log q_j]`` and contain precisely the x atoms beginning with
q_j; the upper endpoint is included because the x tail is closed.  Shared
non-switch subdivision boundaries may be covered twice, which is harmless.

The adaptive boxes are a finite proof, not a sampled extrapolation.  On a
box, fixed target intervals contained in all four moving arch intervals are
integrated by positive Darboux sums.  For a fixed target z>x,

    partial_x log f_x(z)
      =1/2+2/(exp(2(z-x))-1)-tanh(x/2)/2 >0,

so the lower source endpoint is valid.  K is bounded by its exact positive
theta series and its proved monotonicity; J is decreasing.  Upper prime
demands and lower prime supplies use Arb enclosures on the full source box.
Every omitted theta term, prime atom, and arch interval is positive.

The companion prime-tail certificate handles ``a>=1`` for every y.  This
file makes no claim for ``y>4,a<1``; that high-source range remains a
separate obligation.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import ceil

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base


ctx.prec = 160


q = base.q
HALF = q(1, 2)
X_LEFT = -q(3, 5)
X_RIGHT = q(3, 5)
Y_LEFT = q(7, 5)
Y_RIGHT = q(4)
A_RIGHT = q(1)
D_RIGHT = q(8, 5)
E_RIGHT = q(41, 10)
ARCH_CUTOFF = q(7, 5)
ANALYTIC_A = q(13, 20)
ANALYTIC_D = q(2, 5)


def prime_power_data(limit: int) -> tuple[tuple[int, int, arb, arb], ...]:
    """Every (power, base prime, log power, log prime) below limit."""

    is_prime = [True] * limit
    is_prime[0] = False
    is_prime[1] = False
    result: list[tuple[int, int, arb, arb]] = []
    for prime in range(2, limit):
        if not is_prime[prime]:
            continue
        power = prime
        while power < limit:
            result.append(
                (power, prime, arb(power).log(), arb(prime).log())
            )
            power *= prime
        for multiple in range(prime * prime, limit, prime):
            is_prime[multiple] = False
    return tuple(sorted(result))


PRIME_DATA = prime_power_data(61)


def kernel_quotient_lower(t: arb, displacement: arb) -> arb:
    """Positive-theta lower bound for K(t-d)/K(t)."""

    scale = arb.pi() * (2 * t).exp()
    shifted = scale * (-2 * displacement).exp()
    assert shifted > 3
    ratio = 16 * (-3 * scale).exp()
    assert ratio < 1
    return (
        q(1, 2) * (-q(9, 2) * displacement).exp()
        * (scale * (1 - (-2 * displacement).exp())).exp()
        * (1 - ratio)
    ).lower()


def lower_point(value: arb) -> arb:
    return arb(value.lower())


def upper_point(value: arb) -> arb:
    return arb(value.upper())


def maximum(*values: arb) -> arb:
    result = values[0]
    for value in values[1:]:
        if value > result:
            result = value
    return result


def minimum(*values: arb) -> arb:
    result = values[0]
    for value in values[1:]:
        if value < result:
            result = value
    return result


@dataclass(frozen=True)
class Box:
    x_left: arb
    x_right: arb
    d_left: arb
    d_right: arb
    e_left: arb
    e_right: arb
    x_start: int
    y_count: int
    depth: int = 0


@dataclass(frozen=True)
class EffectiveBox:
    x_left: arb
    x_right: arb
    d_left: arb
    d_right: arb
    e_left: arb
    e_right: arb
    y_left: arb
    y_right: arb


def effective_box(box: Box) -> EffectiveBox | None:
    """Interval propagation for y in [7/5,4] and x+d<1."""

    xl = lower_point(box.x_left)
    xr = upper_point(box.x_right)
    dl = lower_point(box.d_left)
    dr = upper_point(box.d_right)
    el = lower_point(box.e_left)
    er = upper_point(box.e_right)

    # Empty before propagation.
    if xr < xl or dr < dl or er < el:
        return None
    if xr + HALF + dr + er < Y_LEFT:
        return None
    if xl + HALF + dl + el > Y_RIGHT:
        return None
    if xl + dl >= A_RIGHT:
        return None

    for _ in range(3):
        xl = maximum(xl, Y_LEFT - HALF - dr - er)
        xr = minimum(
            xr,
            Y_RIGHT - HALF - dl - el,
            A_RIGHT - dl,
        )
        dl = maximum(dl, Y_LEFT - HALF - xr - er, q(0))
        dr = minimum(
            dr,
            Y_RIGHT - HALF - xl - el,
            A_RIGHT - xl,
        )
        el = maximum(el, Y_LEFT - HALF - xr - dr)
        er = minimum(er, Y_RIGHT - HALF - xl - dl)
        if xr < xl or dr < dl or er < el:
            return None

    y_left = maximum(Y_LEFT, xl + HALF + dl + el)
    y_right = minimum(Y_RIGHT, xr + HALF + dr + er)
    if y_right < y_left:
        return None
    return EffectiveBox(xl, xr, dl, dr, el, er, y_left, y_right)


def arch_integral_lower(
    source: arb,
    left: arb,
    right: arb,
    cells: int,
) -> arb:
    """Positive Darboux lower bound for int_left^right f_source(z)dz."""

    if right <= left:
        return arb(0)
    assert left > source
    width = (right - left) / cells
    normalizer = (source / 2).cosh()
    total = arb(0)
    for index in range(cells):
        cell_left = left + index * width
        cell_right = cell_left + width
        kernel_lower, _kernel_upper = base.kernel_bounds(
            base.interval(cell_left, cell_right)
        )
        levy_lower = base.levy_shape(cell_right - source).lower()
        total += width * kernel_lower * levy_lower / normalizer
    return total.lower()


def fixed_arch_lower(effective: EffectiveBox, cells: int) -> arb:
    """Contained disjoint subintervals of all four terms in (2)."""

    xl = effective.x_left
    xr = effective.x_right
    dl = effective.d_left
    dr = effective.d_right
    el = effective.e_left
    er = effective.e_right
    source = lower_point(xl)

    intervals: list[tuple[arb, arb, arb]] = []

    # Full multiplicity on [x+d,x+d+3/10].
    intervals.append((
        upper_point(xr + dr),
        lower_point(xl + dl + q(3, 10)),
        q(1),
    ))

    # Half multiplicity from d+3/10 to d+e.  Nothing beyond 7/5 is
    # needed in the lower certificate.
    intervals.append((
        upper_point(xr + dr + q(3, 10)),
        minimum(
            lower_point(xl + dl + el),
            ARCH_CUTOFF,
        ),
        HALF,
    ))

    # The finite right flank [y-9/20,y-3/10].
    intervals.append((
        upper_point(xr + dr + er + q(1, 20)),
        lower_point(xl + dl + el + q(1, 5)),
        HALF,
    ))

    # Retain only a short part of the final full tail.
    tail_left = upper_point(xr + dr + er + q(1, 5))
    intervals.append((
        tail_left,
        minimum(tail_left + q(3, 10), q(3, 2)),
        q(1),
    ))

    total = arb(0)
    for left, right, multiplicity in intervals:
        if right > left:
            total += multiplicity * arch_integral_lower(
                source, left, right, cells
            )
    return total.lower()


def x_prime_lower(box: Box, effective: EffectiveBox) -> arb:
    """Finite positive restriction of the complete x-prime tail."""

    x_box = base.interval(effective.x_left, effective.x_right)
    cosh_upper = max(
        (effective.x_left / 2).cosh().upper(),
        (effective.x_right / 2).cosh().upper(),
    )
    total = arb(0)
    for power, _prime, log_power, log_prime in PRIME_DATA[box.x_start:]:
        target = x_box + log_power
        kernel_lower, _kernel_upper = base.kernel_bounds(target)
        total += (
            log_prime / arb(power).sqrt()
            * kernel_lower / cosh_upper
        )
    return total.lower()


def y_prime_upper(box: Box, effective: EffectiveBox) -> arb:
    """Upper bound for the exact captured y-prime set on an e cell."""

    y_box = base.interval(effective.y_left, effective.y_right)
    cosh_lower = (effective.y_left / 2).cosh().lower()
    total = arb(0)
    for power, _prime, log_power, log_prime in PRIME_DATA[:box.y_count]:
        _kernel_lower, kernel_upper = base.kernel_bounds(y_box - log_power)
        total += (
            log_prime / arb(power).sqrt()
            * kernel_upper / cosh_lower
        )
    return total.upper()


def bound_box(
    box: Box,
    effective: EffectiveBox,
    cells: int,
) -> tuple[arb, arb, arb, arb]:
    x_prime = x_prime_lower(box, effective)
    arch = fixed_arch_lower(effective, cells)
    y_prime = y_prime_upper(box, effective)
    return (x_prime + arch - y_prime).lower(), x_prime, arch, y_prime


def box_widths(effective: EffectiveBox) -> tuple[arb, arb, arb]:
    return (
        effective.x_right - effective.x_left,
        effective.d_right - effective.d_left,
        effective.e_right - effective.e_left,
    )


def split_box(box: Box, dimension: int) -> tuple[Box, Box]:
    endpoints = [
        (box.x_left, box.x_right),
        (box.d_left, box.d_right),
        (box.e_left, box.e_right),
    ]
    left, right = endpoints[dimension]
    midpoint = lower_point((left + right) / 2)
    assert midpoint > left and midpoint < right

    values = dict(
        x_left=box.x_left,
        x_right=box.x_right,
        d_left=box.d_left,
        d_right=box.d_right,
        e_left=box.e_left,
        e_right=box.e_right,
        x_start=box.x_start,
        y_count=box.y_count,
        depth=box.depth + 1,
    )
    left_values = dict(values)
    right_values = dict(values)
    names = (
        ("x_left", "x_right"),
        ("d_left", "d_right"),
        ("e_left", "e_right"),
    )
    lower_name, upper_name = names[dimension]
    left_values[upper_name] = midpoint
    right_values[lower_name] = midpoint
    return Box(**left_values), Box(**right_values)


def choose_split(effective: EffectiveBox) -> int:
    widths = box_widths(effective)
    # Equalize the three sources of interval loss.  The e coordinate is
    # slightly more sensitive because it moves every y-prime target.
    scores = (
        widths[0] / q(1, 100),
        widths[1] / q(1, 100),
        widths[2] / q(1, 125),
    )
    return max(range(3), key=lambda index: scores[index])


def initial_boxes() -> list[Box]:
    # d ownership: (0,log2], (log2,log3], (log3,log4],
    # (log4,8/5].  The retained x list starts at 2,3,4,5 respectively.
    d_boundaries = (
        q(0),
        PRIME_DATA[0][2],
        PRIME_DATA[1][2],
        PRIME_DATA[2][2],
        D_RIGHT,
    )
    assert tuple(data[0] for data in PRIME_DATA[:4]) == (2, 3, 4, 5)
    assert PRIME_DATA[2][2] < D_RIGHT < PRIME_DATA[3][2]

    result: list[Box] = []
    for d_index in range(4):
        for e_index, data in enumerate(PRIME_DATA):
            e_left = data[2]
            e_right = (
                PRIME_DATA[e_index + 1][2]
                if e_index + 1 < len(PRIME_DATA)
                else E_RIGHT
            )
            if e_left > E_RIGHT:
                continue
            assert e_right > e_left
            result.append(Box(
                X_LEFT,
                X_RIGHT,
                d_boundaries[d_index],
                d_boundaries[d_index + 1],
                e_left,
                e_right,
                d_index,
                e_index + 1,
            ))
    return result


def main() -> None:
    powers = tuple(data[0] for data in PRIME_DATA)
    assert powers == (
        2, 3, 4, 5, 7, 8, 9, 11, 13, 16, 17, 19, 23,
        25, 27, 29, 31, 32, 37, 41, 43, 47, 49, 53, 59,
    )
    assert E_RIGHT.exp() < 61

    coefficient_sum = sum(
        (data[3] / arb(data[0]).sqrt() for data in PRIME_DATA),
        arb(0),
    )
    coefficient_floor = arb(2).log() / 4
    assert coefficient_sum < 13
    displacement = HALF - (q(3, 2)).log()
    analytic_quotient = kernel_quotient_lower(
        ANALYTIC_A + HALF, displacement
    )
    analytic_required = (
        13 / coefficient_floor
        * (X_RIGHT / 2).cosh() / (Y_LEFT / 2).cosh()
    )
    assert analytic_required < 63
    assert analytic_quotient > analytic_required
    analytic_scale = arb.pi() * (2 * (ANALYTIC_A + HALF)).exp()
    analytic_log_slope_lower = (
        2 * analytic_scale * (1 - (-2 * displacement).exp())
    )
    assert analytic_log_slope_lower > 0

    # For a>=13/20 and d>=2/5, the least x prime power above exp(d)
    # is at logarithmic distance at most log(3/2), while every captured y
    # target is at least a+1/2.  The preceding quotient therefore proves
    # X>Y without using any arch mass.

    stack = initial_boxes()
    attempted = 0
    leaves = 0
    pruned = 0
    analytic = 0
    max_depth = 0
    worst = None
    worst_ratio = None

    while stack:
        box = stack.pop()
        attempted += 1
        effective = effective_box(box)
        if effective is None:
            pruned += 1
            continue
        if (
            effective.x_left + effective.d_left >= ANALYTIC_A
            and effective.d_left >= ANALYTIC_D
        ):
            analytic += 1
            continue

        widths = box_widths(effective)
        # Avoid evaluating boxes whose fixed contained intervals are still
        # needlessly thin.  This is only a performance decision.
        pre_split = (
            widths[0] + widths[1] >= q(1, 4)
            or widths[0] + widths[1] + widths[2] >= q(2, 5)
        )

        certified = None
        details = None
        if not pre_split:
            x_prime = x_prime_lower(box, effective)
            y_prime = y_prime_upper(box, effective)
            total_width = widths[0] + widths[1] + widths[2]
            meshes = [24]
            if total_width < q(2, 25):
                meshes.append(96)
            if total_width < q(1, 50):
                meshes.append(256)
            for cells in meshes:
                arch = fixed_arch_lower(effective, cells)
                residual = (x_prime + arch - y_prime).lower()
                details = (residual, x_prime, arch, y_prime)
                if residual > 0:
                    certified = cells
                    break

        if certified is not None and details is not None:
            leaves += 1
            max_depth = max(max_depth, box.depth)
            if worst is None or details[0] < worst[0]:
                worst = (
                    details[0],
                    details[1],
                    details[2],
                    details[3],
                    certified,
                    box,
                    effective,
                )
            ratio = ((details[1] + details[2]) / details[3]).lower()
            if worst_ratio is None or ratio < worst_ratio[0]:
                worst_ratio = (ratio, certified, box, effective)
            continue

        assert box.depth < 32, (box, effective, details)
        dimension = choose_split(effective)
        left, right = split_box(box, dimension)
        stack.append(right)
        stack.append(left)

        if attempted % 500 == 0:
            print(
                "progress:",
                attempted,
                "stack:", len(stack),
                "leaves:", leaves,
                "pruned:", pruned,
                "depth:", box.depth,
                flush=True,
            )

    assert worst is not None and worst_ratio is not None
    print("precision_bits:", ctx.prec)
    print("source_band: |x|<=3/5, 7/5<=y<=4")
    print("residual_domain: e>=log2, a=x+d<1")
    print("complete_prime_powers_below_61:", powers)
    print("initial_switch_boxes:", len(initial_boxes()))
    print("attempted_boxes:", attempted)
    print("certified_leaves:", leaves)
    print("pruned_boxes:", pruned)
    print("analytic_prime_tail_boxes:", analytic)
    print("maximum_depth:", max_depth)
    print("analytic_tail_kernel_quotient_lower:", analytic_quotient)
    print("analytic_tail_required_upper:", analytic_required)
    print("analytic_tail_log_slope_lower:", analytic_log_slope_lower)
    print("worst_(residual,xprime,arch,yprime,cells,box,effective):",
          worst)
    print("worst_supply_to_demand_ratio_(ratio,cells,box,effective):",
          worst_ratio)
    print("closed_x_switch_and_closed_y_switch_endpoints: PASS")
    print("compact_mandatory_residual: PASS")


if __name__ == "__main__":
    main()
