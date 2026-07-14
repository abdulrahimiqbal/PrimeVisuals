#!/usr/bin/env python3
"""Exact compact transport from inward primes into beta-plus.

For ``7/5<=y<=4`` let

    P_y = sum_(q=p^k) Lambda(q)q^(-1/2)K(y-log q)/C(y)
              delta_(y-log q)

and ``beta_+(dz)=2exp(-z/2)K(z)dz``.  This file certifies a beta-dominated
transport of the complete inward-prime measure at distance ``146/1000``.
Central atoms are coupled into the restriction of beta-plus to
``[-1357/1000,3343/1000]``; all remaining atoms are injected into the
disjoint beta tail below ``-1357/1000``.

Only prime powers below ``exp(4+3/2)<245`` can occur in this central part;
the script generates their complete list.  The beta target interval is split
into bins of width 1/500.  Each bin capacity is a rigorous lower bound from
the positive incomplete-gamma theta integral.  On each rational y-cell every
moving atom is bounded above with Arb, and a beta bin is connected only when
the complete product of the atom source box and bin has distance below
146/1000.

The compatible beta-bin ranges are ordered with the atom targets.  Processing
atoms from left to right and consuming the leftmost compatible unused beta
capacity is exact: later atoms have both a no-smaller release bin and a
no-smaller deadline bin, so exchanging any earlier use to the left cannot
hurt a later atom.  Failure at a deadline is therefore the interval-Hall
obstruction; success constructs the flow.  Actual atom masses are served by
scaling each certified upper row by actual/upper mass, which only decreases
beta use and gives a Borel kernel on half-open y-cells.

For the tail put ``t=log(n)-y>=3/2``, ``delta=141/1000``,
``r=exp(-delta)``, and assign the atom at
``z=-t`` to beta mass parametrised
by

    u in I_n=[r*n,r*n+1/1000],       w=y-log(u).

The integer intervals are disjoint, their images satisfy
``0<w-z<delta<146/1000``, and ``w<-1359/1000``.  Since ``n>=19``, the image
kernel is at least ``K(t-140/1000)`` and its beta capacity divided by the
atom mass is at least

    K(t-140/1000) / (1000*(t+4)*K(t)).

The first theta term and the standard geometric majorant prove this exceeds
one at ``t=3/2``; its logarithmic lower slope then exceeds that of
``1000(t+4)`` for the whole half-line.  Thus the tail injection is analytic,
not a finite truncation.  Together with the exact central flow this proves
the complete compact theorem for every ``7/5<=y<=4``.
"""

from __future__ import annotations

from fractions import Fraction
from math import isqrt

from flint import arb, ctx

import coupling_anchor_beta_transport_certificate as base
import coupling_exact_arch_integral as exact_integral
import coupling_mixed_anchor_beta_hall_certificate as hall_base


ctx.prec = 220


q = base.q
D = q(146, 1000)
Y_LEFT = q(7, 5)
Y_RIGHT = q(4)
Y_CELLS = 5200
CENTRAL_LEFT = -q(3, 2)
BETA_LEFT = -q(1357, 1000)
BETA_RIGHT = q(3343, 1000)
BETA_BINS = 2350
Q_MAX = 244
TAIL_SHIFT = q(141, 1000)
TAIL_KERNEL_DISPLACEMENT = q(140, 1000)
TAIL_INTERVAL_WIDTH = q(1, 1000)


def prime_power_data(limit: int):
    sieve = bytearray(b"\x01") * (limit + 1)
    sieve[0:2] = b"\x00\x00"
    for prime in range(2, isqrt(limit) + 1):
        if sieve[prime]:
            sieve[prime * prime : limit + 1 : prime] = b"\x00" * (
                (limit - prime * prime) // prime + 1
            )
    rows = []
    for prime in range(2, limit + 1):
        if not sieve[prime]:
            continue
        power = prime
        while power <= limit:
            rows.append(
                (
                    power,
                    arb(power).log(),
                    arb(prime).log() / arb(power).sqrt(),
                )
            )
            if power > limit // prime:
                break
            power *= prime
    rows.sort(key=lambda row: row[0])
    assert len({row[0] for row in rows}) == len(rows)
    return tuple(rows)


PRIME_DATA = prime_power_data(Q_MAX)
BETA_WIDTH = (BETA_RIGHT - BETA_LEFT) / BETA_BINS
assert BETA_WIDTH.contains(q(1, 500))
BETA_BOXES = tuple(
    (
        BETA_LEFT + index * BETA_WIDTH,
        BETA_LEFT + (index + 1) * BETA_WIDTH,
    )
    for index in range(BETA_BINS)
)


def beta_bin_capacities() -> tuple[Fraction, ...]:
    result = []
    for left, right in BETA_BOXES:
        lower = 2 * exact_integral.kernel_exponential_integral(
            -q(1, 2), left, right, theta_terms=4
        )
        assert lower > 0
        result.append(hall_base.rational_below(lower))
    return tuple(result)


BETA_CAPACITIES = beta_bin_capacities()
_prefix = [Fraction(0)]
for _capacity in BETA_CAPACITIES:
    _prefix.append(_prefix[-1] + _capacity)
BETA_PREFIX_CAPACITIES = tuple(_prefix)


def central_atoms(y_left: arb, y_right: arb):
    """Atoms whose source box meets the central side of the split.

    A switch-crossing box is assigned wholly to this finite flow.  Its width
    is 1/2000, while the gap between -3/2 and the beta cutoff is 143/1000,
    so this ownership convention still leaves a strict 146/1000 edge.
    """

    result = []
    y_box = base.interval(y_left, y_right)
    c_lower = (y_left / 2).cosh().lower()
    for power, log_power, coefficient in PRIME_DATA:
        target_left = y_left - log_power
        target_right = y_right - log_power
        if not target_right > CENTRAL_LEFT:
            continue
        _kernel_lower, kernel_upper = base.kernel_bounds(y_box - log_power)
        upper = coefficient * kernel_upper / c_lower
        assert upper > 0
        result.append(
            (
                power,
                target_left,
                target_right,
                hall_base.rational_above(upper),
            )
        )
    # Prime powers increase while their targets decrease.
    result.reverse()
    return tuple(result)


def compatible_range(target_left: arb, target_right: arb):
    """Return the maximal consecutive block of rigorously compatible bins.

    The left endpoints increase with the bin index, so the first strict
    inequality is false-then-true.  The right endpoints also increase, so
    the second is true-then-false.  Binary search is therefore the same
    exact product-box test as a full scan, with logarithmic rather than
    linear cost.  An undecided Arb comparison is conservatively treated as
    false and hence cannot introduce an invalid edge.
    """

    lower = target_right - D
    upper = target_left + D
    count = len(BETA_BOXES)

    lo, hi = 0, count
    while lo < hi:
        middle = (lo + hi) // 2
        if BETA_BOXES[middle][0] > lower:
            hi = middle
        else:
            lo = middle + 1
    first = lo

    lo, hi = -1, count
    while lo + 1 < hi:
        middle = (lo + hi) // 2
        if BETA_BOXES[middle][1] < upper:
            lo = middle
        else:
            hi = middle
    last = lo

    assert first < count and last >= 0 and first <= last, (
        target_left,
        target_right,
        BETA_LEFT,
        BETA_RIGHT,
    )
    assert BETA_BOXES[first][0] > lower
    assert BETA_BOXES[last][1] < upper
    return first, last


def certify_cell(y_left: arb, y_right: arb):
    atoms = central_atoms(y_left, y_right)
    capacities = list(BETA_CAPACITIES)
    cursor = 0
    minimum_reserve = None
    used_bins = 0
    previous_first = -1
    previous_last = -1

    for power, target_left, target_right, need0 in atoms:
        first, last = compatible_range(target_left, target_right)
        assert first >= previous_first and last >= previous_last
        previous_first, previous_last = first, last
        cursor = max(cursor, first)
        need = need0
        if cursor > last:
            available = Fraction(0)
        else:
            # Greedy consumption is contiguous: only the current cursor bin
            # can be partially used, and every later bin retains its original
            # capacity.  The exact prefix ledger avoids repeatedly summing
            # thousands of large Fractions.
            available = capacities[cursor] + (
                BETA_PREFIX_CAPACITIES[last + 1]
                - BETA_PREFIX_CAPACITIES[cursor + 1]
            )
        reserve = available - need
        if minimum_reserve is None or reserve < minimum_reserve:
            minimum_reserve = reserve
        assert reserve > 0, (
            y_left,
            y_right,
            power,
            target_left,
            target_right,
            first,
            last,
            need,
            available,
        )
        while need > 0:
            assert cursor <= last
            take = min(need, capacities[cursor])
            need -= take
            capacities[cursor] -= take
            if capacities[cursor] == 0:
                cursor += 1
                used_bins += 1
    if minimum_reserve is None:
        minimum_reserve = Fraction(1)
    return minimum_reserve, len(atoms), used_bins


def kernel_quotient_lower(t: arb, displacement: arb) -> arb:
    """First-theta lower bound for K(t-displacement)/K(t)."""

    scale = arb.pi() * (2 * t).exp()
    shifted_scale = scale * (-2 * displacement).exp()
    assert shifted_scale > 3
    remainder = 16 * (-3 * scale).exp()
    assert remainder < 1
    value = (
        q(1, 2)
        * (-q(9, 2) * displacement).exp()
        * (scale * (1 - (-2 * displacement).exp())).exp()
        * (1 - remainder)
    )
    assert value > 0
    return value.lower()


def tail_injection_certificate():
    """Certify the infinite omitted-prime-power injection analytically."""

    t0 = -CENTRAL_LEFT
    delta = TAIL_SHIFT
    d0 = TAIL_KERNEL_DISPLACEMENT
    epsilon = TAIL_INTERVAL_WIDTH
    n0 = arb(19)
    r = (-delta).exp()

    assert 0 < d0 < delta < D
    # y+t>=29/10 forces the integer prime power n>=19.
    assert q(29, 10).exp() < n0
    # For u<=rn+epsilon we still have u<n, hence the square-root factor
    # sqrt(n/u) in the capacity/demand quotient is greater than one.
    assert r + epsilon / n0 < 1
    # log(1+epsilon*exp(delta)/n) is smaller than delta-d0.  Therefore
    # |y-log(u)|<=t-d0 and monotonicity of K on (0,infinity) gives the
    # kernel lower bound used in the module proof.
    correction_upper = epsilon * delta.exp() / n0
    assert correction_upper < delta - d0
    # Every tail image is strictly left of the central beta ledger.
    assert CENTRAL_LEFT + delta < BETA_LEFT

    quotient = kernel_quotient_lower(t0, d0)
    required = 1000 * (t0 + 4)
    assert quotient > required

    scale0 = arb.pi() * (2 * t0).exp()
    quotient_log_slope_lower = (
        2 * scale0 * (1 - (-2 * d0).exp())
    )
    required_log_slope_upper = 1 / (t0 + 4)
    assert quotient_log_slope_lower > required_log_slope_upper

    return (
        quotient,
        required,
        quotient_log_slope_lower,
        required_log_slope_upper,
        correction_upper,
    )


def main() -> None:
    # Exact cutoff: exp(11/2)<245.
    assert q(11, 2).exp() < 245
    monotone_n1, monotone_tail = (
        base.certify_kernel_monotonicity_constants()
    )
    y_width = (Y_RIGHT - Y_LEFT) / Y_CELLS
    assert y_width.contains(q(1, 2000))
    (
        tail_quotient,
        tail_required,
        tail_slope,
        required_slope,
        correction_upper,
    ) = tail_injection_certificate()

    worst = None
    worst_cell = None
    maximum_atoms = 0
    maximum_used_bins = 0

    for index in range(Y_CELLS):
        y_left = Y_LEFT + index * y_width
        y_right = y_left + y_width
        reserve, atoms, used_bins = certify_cell(y_left, y_right)
        maximum_atoms = max(maximum_atoms, atoms)
        maximum_used_bins = max(maximum_used_bins, used_bins)
        if worst is None or reserve < worst:
            worst = reserve
            worst_cell = (y_left, y_right, atoms, used_bins)

    assert worst is not None and worst_cell is not None and worst > 0
    print("precision_bits:", ctx.prec)
    print("Ksecond_n1_upper_on_short_interval:", monotone_n1)
    print("Ksecond_n_ge_2_abs_upper:", monotone_tail)
    print("source_y_interval:", (Y_LEFT, Y_RIGHT))
    print("central_prime_target:", f"z>{CENTRAL_LEFT}")
    print("target_distance:", D)
    print("beta_supply_interval:", (BETA_LEFT, BETA_RIGHT))
    print("beta_bins_and_width:", BETA_BINS, BETA_WIDTH)
    print("prime_power_cutoff_and_count:", Q_MAX, len(PRIME_DATA))
    print("rational_y_cells_and_width:", Y_CELLS, y_width)
    print("maximum_central_atoms:", maximum_atoms)
    print("maximum_fully_consumed_beta_bins:", maximum_used_bins)
    print("worst_cell_(yL,yR,atoms,used_bins):", worst_cell)
    print("worst_exact_available_minus_current_demand:", hall_base.fraction_arb(worst))
    print("compact_central_inward_prime_to_beta: PASS")
    print("tail_interval_(delta,width):", (TAIL_SHIFT, TAIL_INTERVAL_WIDTH))
    print("tail_kernel_displacement:", TAIL_KERNEL_DISPLACEMENT)
    print("tail_log_correction_upper_at_n=19:", correction_upper)
    print("tail_kernel_quotient_lower_at_t=3/2:", tail_quotient)
    print("tail_required_upper_at_t=3/2:", tail_required)
    print("tail_quotient_log_slope_lower:", tail_slope)
    print("tail_required_log_slope_upper:", required_slope)
    print("left_tail_injection: PASS")
    print("compact_complete_inward_prime_to_beta: PASS")


if __name__ == "__main__":
    main()
