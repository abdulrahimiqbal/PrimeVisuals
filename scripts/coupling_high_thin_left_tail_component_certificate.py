#!/usr/bin/env python3
"""Exact erasure of every bounded far-left Hall component, including atoms.

Let ``nu_s`` be the complete physical jump measure, let

    d=3/20,
    31/50<=x<y<=21/10,
    d<=y-x<=1/5,       x+y<=4.                         (1)

These inequalities contain the full high-thin source box
``18/25<=m<=2, 3/20<=r<=1/5``.  If

    p<q<=-17/20,       q-p>2d,

this file proves

    nu_y([p+d,q-d]) < nu_x((p,q)).                     (2)

For this target, every neighborhood of a coordinate at most ``-17/20`` is
only the strict d-tube.  Thus (2) erases any bounded A-component wholly in
the far-left topology without increasing the exact cover functional

    H(A)=nu_x(A)+nu_y(S_y union N_F(A^c)).              (3)

If its length is at most 2d, its newly exposed set is empty; if it is longer,
the newly exposed set is contained in ``[p+d,q-d]`` and (2) applies.  The
closed core is essential: endpoint ownership can expose a y atom exactly at
``p+d`` or ``q-d``.  Hence
after this canonical reduction ``A intersect (-infinity,-17/20]`` has no
bounded component: it is empty or belongs to the unique component meeting
the compact region.  This is a genuine all-prime tail reduction, not an
inference from a finite flow.

Proof of (2).  On the core, pointwise

    K(z)J(x-z)/C(x) > K(z)J(y-z)/C(y),                 (4)

because z<0<x<y, J is decreasing, and C is increasing.  It remains to pay
for every y prime atom in the core using only the disjoint right x-arch
flank ``(q-d,q)``.  Put

    t0=-(q-d)=-q+d >= 1.

Every negative y atom has target ``y-log(n)=-t``.  The certificate proves

    C(y)^(-1) sum_(t>=t0) Lambda(n)n^(-1/2)K(t)
      < C(x)^(-1) int_(t0-d)^t0 K(t)J(x+t)dt.          (5)

There are no outward y atoms on the negative half-line.

Finite switch range, 1<=t0<=8/5.  The 99/100 ledger of the whole x flank
dominates every active prime power at most 37.  The exact list is

    2,3,4,5,7,8,9,11,13,16,17,19,23,25,27,29,31,32,37.

The y range ``159/200<=y<=21/10`` is split into 261 rational cells of width
1/200, and t0 into 120 cells of width 1/200.  On each cell a fixed interval
contained in every moving x flank is integrated by eight positive
right-endpoint Darboux slices.  A prime atom is omitted only when a *strict*
switch inequality proves it impossible on the whole cell; otherwise K is
evaluated at the smallest possible active t.  Thus equality at a moving atom
switch is included, as required by the closed core in (2).

Infinite switch range.  Reserve 1/100 of the right half-flank
``t in (t0-d,t0-d/2)``.  For t0>=8/5 it dominates *all* prime powers; for
t0<=8/5 it dominates all atoms with t>8/5.  Indeed, overcount prime powers
by every integer and use ``Lambda(n)<=log(n)``.  For
``N=exp(y+t0)`` the summand

    g(n)=log(n)n^(-1/2)K(log(n)-y)

is decreasing because continuation item 182 proves
``U=-(log K)'>18t`` for t>0.  The integral test and the change of variables
``n=exp(y+t)`` give

    sum_(n>=N) g(n)
      <= K(t0){(y+t0)exp(-(y+t0)/2)
        +(y+t0)exp((y+t0)/2)/(18t0-3/2)}.              (6)

The item-191 positive-theta quotient at displacement d/2 gives

    K(t0-d/2)/K(t0)
      >= (1/2)exp(-9d/4
          +pi exp(2t0)(1-exp(-d)))
             {1-16exp(-3pi exp(2t0))}.                (7)

At t0=8/5, after taking the worst independent source bounds in (1), one
hundredth of the half-flank lower bound divided by (6) is greater than 1.38.
The logarithmic slope from (7) is greater than 21.47, while the combined
adverse Levy and elementary slopes are below two, so this ratio increases
on the full half-line.  Also ``log(41)-21/10>8/5``; consequently every atom
above 37 belongs to this analytic ledger.  The 99/100 finite ledger and the
1/100 half-flank ledger are disjoint in multiplicity, completing (5).

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_thin_left_tail_component_certificate.py
"""

from __future__ import annotations

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base
from coupling_high_middle_right_tail_certificate import (
    kernel_quotient_lower,
)


ctx.prec = 180

q = base.q
THIN_RADIUS = q(3, 20)
HALF_FLANK = THIN_RADIUS / 2
X_MIN = q(31, 50)
X_MAX = q(77, 40)
Y_MIN = q(159, 200)
Y_MAX = q(21, 10)
MIDPOINT_CAP = arb(4)
SOURCE_GAP_MIN = THIN_RADIUS
COMPACT_BOUNDARY = q(17, 20)
TAIL_CUTOFF = q(8, 5)
FINITE_LEDGER = q(99, 100)
TAIL_LEDGER = q(1, 100)
Y_CELLS = 261
T_CELLS = 120
FLANK_SLICES = 8


def prime_power_data(limit: int) -> tuple[tuple[int, int], ...]:
    """Every (prime power, base prime) at most limit."""

    is_prime = [True] * (limit + 1)
    is_prime[0] = False
    is_prime[1] = False
    result: list[tuple[int, int]] = []
    for prime in range(2, limit + 1):
        if not is_prime[prime]:
            continue
        power = prime
        while power <= limit:
            result.append((power, prime))
            power *= prime
        for multiple in range(prime * prime, limit + 1, prime):
            is_prime[multiple] = False
    return tuple(sorted(result))


def source_x_upper(y_left: arb, y_right: arb) -> arb:
    """Maximum x allowed by x<=y-d and x+y<=4 on a y cell."""

    switch = q(83, 40)
    if y_right <= switch:
        result = y_right - SOURCE_GAP_MIN
    elif y_left >= switch:
        result = MIDPOINT_CAP - y_left
    else:
        # The rational y grid has the switch as a cell boundary, so this is
        # only a defensive enclosure.
        result = X_MAX
    # At the exact switch Arb endpoint padding can straddle X_MAX by one
    # ulp.  Clamping to the independently proved global bound is conservative.
    if not result <= X_MAX:
        result = X_MAX
    return arb(result.upper())


def finite_switch_certificate(
    data: tuple[tuple[int, int], ...],
) -> tuple[arb, int, int, arb, arb, arb, arb, tuple[int, ...]]:
    """Validate the complete q<=37 switch ledger."""

    y_width = (Y_MAX - Y_MIN) / Y_CELLS
    t_width = (TAIL_CUTOFF - arb(1)) / T_CELLS
    assert y_width.contains(q(1, 200))
    assert t_width.contains(q(1, 200))

    worst = None
    for y_index in range(Y_CELLS):
        y_left = Y_MIN + y_index * y_width
        y_right = y_left + y_width
        x_upper = source_x_upper(y_left, y_right)
        x_normalizer_upper = (x_upper / 2).cosh().upper()
        y_normalizer_lower = (y_left / 2).cosh().lower()

        for t_index in range(T_CELLS):
            t_left = arb(1) + t_index * t_width
            t_right = t_left + t_width

            # [t_right-d,t_left] lies in every moving [t0-d,t0].
            fixed_left = t_right - THIN_RADIUS
            fixed_right = t_left
            assert fixed_left > 0
            assert fixed_left < fixed_right
            slice_width = (
                fixed_right - fixed_left
            ) / FLANK_SLICES

            supply_lower = arb(0)
            for slice_index in range(FLANK_SLICES):
                right_endpoint = (
                    fixed_left + (slice_index + 1) * slice_width
                )
                kernel_lower, _kernel_upper = base.kernel_bounds(
                    right_endpoint
                )
                levy_lower = base.levy_shape(
                    x_upper + right_endpoint
                ).lower()
                supply_lower += (
                    FINITE_LEDGER * slice_width
                    * kernel_lower * levy_lower
                    / x_normalizer_upper
                )

            demand_upper = arb(0)
            active: list[int] = []
            for power, prime in data:
                log_power = arb(power).log()
                maximum_t = log_power - y_left
                # Equality can belong to the closed erosion core, so omit
                # only after proving a strict separation from the switch.
                if maximum_t < t_left:
                    continue

                # On the active subset, t>=t_left and
                # t=log(power)-y>=log(power)-y_right.
                target_lower = arb((log_power - y_right).lower())
                if target_lower < t_left:
                    target_lower = arb(t_left.lower())
                _kernel_lower, kernel_upper = base.kernel_bounds(
                    target_lower
                )
                demand_upper += (
                    arb(prime).log() / arb(power).sqrt()
                    * kernel_upper / y_normalizer_lower
                )
                active.append(power)

            if not active:
                continue
            ratio_lower = (supply_lower / demand_upper).lower()
            assert ratio_lower > 1, (
                y_index,
                t_index,
                y_left,
                y_right,
                t_left,
                t_right,
                x_upper,
                supply_lower,
                demand_upper,
                tuple(active),
            )
            if worst is None or ratio_lower < worst[0]:
                worst = (
                    ratio_lower,
                    y_index,
                    t_index,
                    y_left,
                    t_left,
                    supply_lower,
                    demand_upper,
                    tuple(active),
                )

    assert worst is not None
    return worst


def analytic_tail_certificate() -> tuple[arb, ...]:
    """Validate the all-integer tail bound from t0=8/5 onward."""

    t0 = TAIL_CUTOFF
    quotient = kernel_quotient_lower(t0, HALF_FLANK)
    decay_slope = 18 * t0 - q(3, 2)
    assert decay_slope > 0

    # In (6), z exp(-z/2) decreases for z>2, while
    # z exp(z/2) increases.  Bound the two terms at opposite y endpoints.
    negative_exponential_term = (
        (Y_MIN + t0) * (-(Y_MIN + t0) / 2).exp()
    )
    positive_exponential_term = (
        (Y_MAX + t0) * ((Y_MAX + t0) / 2).exp()
        / decay_slope
    )
    demand_factor_upper = (
        negative_exponential_term + positive_exponential_term
    )

    # Discard the favorable C(y)/C(x)>1.
    supply_factor_lower = (
        TAIL_LEDGER * HALF_FLANK
        * base.levy_shape(X_MAX + t0 - HALF_FLANK).lower()
        * quotient
    )
    ratio_lower = (supply_factor_lower / demand_factor_upper).lower()
    assert ratio_lower > 1

    scale = arb.pi() * (2 * t0).exp()
    quotient_log_slope_lower = (
        2 * scale * (1 - (-2 * HALF_FLANK).exp())
    )
    # For h>=X_MAX+t0-d/2, |(log J)'|<1.  The first demand
    # factor decreases and the second has logarithmic slope below one.
    assert 2 / ((2 * (X_MAX + t0 - HALF_FLANK)).exp() - 1) < q(1, 2)
    adverse_log_slope_upper = arb(2)
    assert quotient_log_slope_lower > adverse_log_slope_upper

    # Every prime power above 37 is at least 41, and hence is already in the
    # t>8/5 ledger even at the largest source y.
    assert arb(41).log() - Y_MAX > TAIL_CUTOFF

    return (
        quotient,
        negative_exponential_term,
        positive_exponential_term,
        supply_factor_lower,
        demand_factor_upper,
        ratio_lower,
        quotient_log_slope_lower,
        adverse_log_slope_upper,
    )


def main() -> None:
    data = prime_power_data(37)
    expected = (
        2, 3, 4, 5, 7, 8, 9, 11, 13, 16,
        17, 19, 23, 25, 27, 29, 31, 32, 37,
    )
    assert tuple(power for power, _prime in data) == expected

    # Geometry and source extrema used in the proof.
    assert (-COMPACT_BOUNDARY - THIN_RADIUS + arb(1)).contains(0)
    assert X_MAX + Y_MIN < MIDPOINT_CAP
    assert (X_MAX + q(83, 40) - MIDPOINT_CAP).contains(0)

    finite_worst = finite_switch_certificate(data)
    analytic = analytic_tail_certificate()

    print("precision_bits:", ctx.prec)
    print(
        "source_band:",
        "31/50<=x<y<=21/10, 3/20<=y-x<=1/5, x+y<=4",
    )
    print("left_topology_boundary_q<=-17/20")
    print("finite_prime_powers_through_37:", expected)
    print("finite_cells_(y,t0):", (Y_CELLS, T_CELLS))
    print("positive_flank_slices_per_cell:", FLANK_SLICES)
    print(
        "finite_worst_(ratio,ycell,tcell,yL,tL,supply,demand,active):",
        finite_worst,
    )
    print(
        "analytic_(quotient,Dminus,Dplus,S,D,ratio,Q_slope,bad_slope):",
        analytic,
    )
    print("strict_core_and_all_prime_switch_endpoints: PASS")
    print("bounded_far_left_A_components_erasable: PASS")
    print("full_compact_Hall_classification: NOT_CLAIMED")


if __name__ == "__main__":
    main()
