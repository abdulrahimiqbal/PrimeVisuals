#!/usr/bin/env python3
"""Global one-particle entrance rate into [-3/5,3/5].

For s>3/5 let R(s) be the complete physical one-particle jump rate whose
target lies in [-3/5,3/5]:

    R(s) = 1/C(s) * (
        integral_{-3/5}^{3/5} J(s-z) K(z) dz
        + sum_{|s-log q|<=3/5} Lambda(q)/sqrt(q) K(s-log q)
    ).

Evenness gives R(-s)=R(s).  This certificate proves

    inf_{|s|>3/5} R(s) > 1/4.

The compact proof has two parts.  On [3/5,4], it splits at every prime-power
entry/exit threshold log(q)+/-3/5, subdivides further, evaluates all atoms
which remain active throughout a source cell, and adds a fixed finite arch
submeasure into [-1/2,1/2].  From 4 to the analytic-tail threshold, an exact
Eratosthenes prime-power table is accumulated into 24 target bins; only atoms
which remain in their target bin throughout a source cell are selected.

For s>=157/10 (which is larger than log(3,594,641)+3/5), primes alone
suffice.  We use the following unconditional published theorem:

    |theta(x)-x| < 0.2*x/(log x)^2,       x>=3,594,641.

This is Theorem 5.2 of P. Dusart, "Estimates of some functions over primes
without R.H.", arXiv:1002.0442.  The theorem is unconditional; it does not
assume RH.  Its finite verified-zero inputs are finite computations, not an
assumption that all zeros are on the critical line.

Reproduction:

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_global_one_core_entrance_certificate.py
"""

from bisect import bisect_left, bisect_right
from math import ceil, isqrt

from flint import arb, ctx


ctx.prec = 180


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
CORE = q(3, 5)
ARCH_TARGET = q(1, 2)
DIRECT_END = arb(4)
THETA_THRESHOLD = arb(3_594_641)
THEOREM_TAIL_START = THETA_THRESHOLD.log() + CORE
TAIL_START = q(157, 10)
assert TAIL_START > THEOREM_TAIL_START
QUARTER = q(1, 4)
DIRECT_MAX_WIDTH = q(1, 200)
HIGH_CELLS = 2340
TARGET_BINS = 24
ARCH_BINS = 32768
TAIL_BINS = 120
ROUNDING_GUARD = arb("1e-40")


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(h: arb) -> arb:
    assert h > 0
    return (-h / 2).exp() / (1 - (-2 * h).exp())


# Positive theta summands beyond n=4 have total less than 1e-28 on the
# target range |z|<=3/5.  They are positive, so including [0,1e-28] is also
# suitable for every lower bound below.
first_tail = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = q(6, 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = first_tail / (1 - tail_ratio)
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def K_positive(t: arb) -> arb:
    """Outward enclosure of the Riemann kernel for 0<=t<=3/5."""

    assert t >= 0
    assert t <= CORE + ROUNDING_GUARD
    total = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        w = PI * nn * (2 * t).exp()
        total += PI * nn * (q(5, 2) * t).exp() * (2 * w - 3) * (-w).exp()
    return total + K_TAIL


def k_lower_on(left: arb, right: arb) -> arb:
    """Pointwise K lower bound on [left,right] contained in the core."""

    assert left >= -CORE - ROUNDING_GUARD
    assert right <= CORE + ROUNDING_GUARD
    assert right >= left
    radius = max(abs(left).upper(), abs(right).upper())
    # K is even and strictly decreasing on the positive half-line.  The
    # derivative proof is continuation item 48: termwise differentiation
    # gives K_m'=pi*m^2*exp(5t/2-y)*(-4y^2+15y-15/2); above the larger root
    # each term is nonpositive, while below it the exact K_m'' bounds give
    # K''<0 and K'(0)=0.  Hence K(radius) is the interval minimum.
    return K_positive(arb(radius)).lower()


def safe_ceil_exp(x: arb) -> int:
    """Integer certainly at least exp(x)."""

    return int(x.exp().upper().ceil().fmpz())


def safe_floor_exp(x: arb) -> int:
    """Integer certainly at most exp(x)."""

    return int(x.exp().lower().floor().fmpz())


MAX_Q = 11_994_995
assert arb(MAX_Q - 1) < (TAIL_START + CORE).exp() < arb(MAX_Q)


def primes_through(limit: int) -> list[int]:
    """Complete deterministic Eratosthenes sieve."""

    flags = bytearray(b"\x01") * (limit + 1)
    flags[0:2] = b"\x00\x00"
    # Integer square root keeps sieve completeness independent of binary
    # floating-point rounding at a perfect-square cutoff.
    for prime in range(2, isqrt(limit) + 1):
        if flags[prime]:
            start = prime * prime
            flags[start : limit + 1 : prime] = b"\x00" * (
                (limit - start) // prime + 1
            )
    return [n for n in range(2, limit + 1) if flags[n]]


def prime_power_table(limit: int):
    """Sorted q values and prefix sums of Lambda(q)/sqrt(q)."""

    records = []
    for prime in primes_through(limit):
        log_prime = arb(prime).log()
        power = prime
        while power <= limit:
            records.append((power, log_prime / arb(power).sqrt()))
            if power > limit // prime:
                break
            power *= prime
    records.sort(key=lambda record: record[0])
    values = [record[0] for record in records]
    prefix = [arb(0)]
    for _, weight in records:
        prefix.append(prefix[-1] + weight)
    return values, prefix


VALUES, PREFIX = prime_power_table(MAX_Q)


def safe_value_range(log_left: arb, log_right: arb) -> tuple[int, int]:
    """Indices of q with log_left<=log(q)<=log_right, safely inward."""

    if log_right < log_left:
        return 0, 0
    value_left = safe_ceil_exp(log_left)
    value_right = safe_floor_exp(log_right)
    if value_right < value_left:
        return 0, 0
    return bisect_left(VALUES, value_left), bisect_right(VALUES, value_right)


def arch_k_mass_lower() -> arb:
    """Constructive lower mass of K(z) dz on [-1/2,1/2]."""

    width = ARCH_TARGET / ARCH_BINS
    positive = arb(0)
    for index in range(ARCH_BINS):
        right = (index + 1) * width
        positive += K_positive(right).lower() * width
    return 2 * positive


ARCH_K_MASS = arch_k_mass_lower()


def arch_slice_lower(source_right: arb) -> arb:
    """Uniform arch subrate into [-1/2,1/2] on a source cell."""

    # For 3/5<=s<=source_right and |z|<=1/2,
    # s-z<=source_right+1/2.  Both J and 1/C decrease with positive s.
    return ARCH_K_MASS * J(source_right + ARCH_TARGET) / C(source_right)


def direct_prime_lower(source_left: arb, source_right: arb) -> arb:
    """All prime-power atoms active throughout one direct source cell."""

    begin, end = safe_value_range(source_right - CORE, source_left + CORE)
    c_upper = C(source_right).upper()
    total = arb(0)
    for index in range(begin, end):
        weight = PREFIX[index + 1] - PREFIX[index]
        log_power = arb(VALUES[index]).log()
        target_left = source_left - log_power
        target_right = source_right - log_power
        total += weight * k_lower_on(target_left, target_right) / c_upper
    return total.lower()


def threshold_split_cells() -> list[tuple[arb, arb]]:
    """Split [3/5,4] at every atom entry/exit, then to width <1/200."""

    boundaries = [CORE, DIRECT_END]
    # Only q<=exp(4+3/5) can meet the target in this regime.
    cutoff = safe_floor_exp(DIRECT_END + CORE)
    for value in VALUES[: bisect_right(VALUES, cutoff)]:
        log_power = arb(value).log()
        for boundary in (log_power - CORE, log_power + CORE):
            if boundary > CORE and boundary < DIRECT_END:
                boundaries.append(boundary)
    boundaries.sort(key=float)
    for left, right in zip(boundaries, boundaries[1:]):
        assert right > left

    cells = []
    for left, right in zip(boundaries, boundaries[1:]):
        pieces = max(1, ceil(float((right - left) / DIRECT_MAX_WIDTH)) + 1)
        width = (right - left) / pieces
        assert width < DIRECT_MAX_WIDTH
        for index in range(pieces):
            cell_left = left + index * width
            cells.append((cell_left, cell_left + width))
    return cells


def high_binned_prime_lower(source_left: arb, source_right: arb) -> arb:
    """Disjoint exact prefix allocation on one high compact source cell."""

    bin_width = 2 * CORE / TARGET_BINS
    c_upper = C(source_right).upper()
    total = arb(0)
    for index in range(TARGET_BINS):
        target_left = -CORE + index * bin_width
        target_right = target_left + bin_width
        # Every selected q has s-log(q) in this target bin for the whole
        # source cell.  Distinct target bins select disjoint prime powers.
        begin, end = safe_value_range(
            source_right - target_right,
            source_left - target_left,
        )
        if end <= begin:
            continue
        weight = (PREFIX[end] - PREFIX[begin]).lower()
        total += weight * k_lower_on(target_left, target_right) / c_upper
    return total.lower()


def tail_prime_lower() -> arb:
    """Uniform prime-only lower bound beyond the Dusart threshold."""

    # Dusart Theorem 5.2, with every prime-interval endpoint at least the
    # theorem's stated threshold.
    epsilon = q(1, 5) / THETA_THRESHOLD.log() ** 2
    width = 2 * CORE / TAIL_BINS
    normalized = arb(0)
    for index in range(TAIL_BINS):
        left = -CORE + index * width
        right = left + width
        # For p in [exp(s-right),exp(s-left)], u=s-log p lies in
        # [left,right].  The theta theorem and log p>=s-3/5 give the
        # following normalized Chebyshev-mass lower bound.  At
        # s=THEOREM_TAIL_START the smallest lower endpoint is exactly
        # THETA_THRESHOLD.  Our rational TAIL_START is larger.
        theta_mass = (
            (1 - epsilon) * (-left).exp()
            - (1 + epsilon) * (-right).exp()
        ).lower()
        assert theta_mass > 0
        # p^(-1/2)=exp(-s/2)exp(u/2).  Use separate pointwise lower
        # bounds for its u-factor and for K(u).
        normalized += (
            (left / 2).exp().lower()
            * k_lower_on(left, right)
            * theta_mass
        )
    source_factor = 2 * THETA_THRESHOLD / (THETA_THRESHOLD + 1)
    result = source_factor.lower() * normalized
    assert result > QUARTER
    return result.lower()


def main() -> None:
    direct_worst = None
    direct_cell = None
    direct_prime_at_worst = None
    direct_arch_at_worst = None
    direct_cells = threshold_split_cells()
    for left, right in direct_cells:
        prime = direct_prime_lower(left, right)
        arch = arch_slice_lower(right).lower()
        selected = prime + arch
        assert selected > QUARTER
        if direct_worst is None or selected < direct_worst:
            direct_worst = selected
            direct_cell = (left, right)
            direct_prime_at_worst = prime
            direct_arch_at_worst = arch

    high_worst = None
    high_cell = None
    high_width = (TAIL_START - DIRECT_END) / HIGH_CELLS
    assert high_width <= DIRECT_MAX_WIDTH + ROUNDING_GUARD
    for index in range(HIGH_CELLS):
        left = DIRECT_END + index * high_width
        right = left + high_width
        selected = high_binned_prime_lower(left, right)
        assert selected > QUARTER
        if high_worst is None or selected < high_worst:
            high_worst = selected
            high_cell = (left, right)

    tail = tail_prime_lower()
    global_lower = min(direct_worst, high_worst, tail)
    assert global_lower > QUARTER

    print("precision_bits:", ctx.prec)
    print("max_prime_power:", MAX_Q)
    print("prime_power_records:", len(VALUES))
    print("theta_tail_bound_for_K:", theta_tail_bound)
    print("arch_K_mass_lower:", ARCH_K_MASS)
    print("direct_cells:", len(direct_cells))
    print("direct_worst_cell:", direct_cell[0], direct_cell[1])
    print("direct_prime_at_worst:", direct_prime_at_worst)
    print("direct_arch_at_worst:", direct_arch_at_worst)
    print("direct_selected_lower:", direct_worst)
    print("direct_margin_over_quarter:", direct_worst - QUARTER)
    print("high_cells:", HIGH_CELLS)
    print("high_worst_cell:", high_cell[0], high_cell[1])
    print("high_prime_lower:", high_worst)
    print("high_margin_over_quarter:", high_worst - QUARTER)
    print("tail_source_threshold:", TAIL_START)
    print("tail_prime_lower:", tail)
    print("tail_margin_over_quarter:", tail - QUARTER)
    print("global_selected_lower:", global_lower)
    print("global_margin_over_quarter:", global_lower - QUARTER)
    print("certificate: PASS")


if __name__ == "__main__":
    main()
