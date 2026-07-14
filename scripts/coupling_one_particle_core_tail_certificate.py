#!/usr/bin/env python3
"""Exact analytic-tail certificate for the one-particle direct-core rate.

For the item-57 one-particle process, put ``C(s)=cosh(s/2)`` and let
``K`` be the even Riemann kernel.  The prime-power part of the jump rate from
``s`` directly into ``[-3/5,3/5]`` contains the prime-only subrate

    P(s) = C(s)^(-1) sum_{p: |s-log p|<=3/5}
                         (log p)/sqrt(p) K(s-log p).

This certificate proves

    P(s) > 1/4

for every

    |s| >= log(3,594,641) + 3/5.

The sole external estimate is the following unconditional theorem, quoted
with its endpoint hypothesis exactly as used here.

    Dusart, "Estimates of some functions over primes without R.H.",
    arXiv:1002.0442, Theorem 5.2:

        |theta(u)-u| < 0.2 u/log(u)^2    for u >= 3,594,641,

where ``theta(u)=sum_{p<=u} log p``.  Although Dusart's proof uses a finite
verification of zeta zeros and an explicit zero-free region, the theorem is
unconditional and assumes neither RH nor an RH-strength PNT error term.

For ``s>0``, write ``X=exp(s)`` and partition the target coordinate
``z=s-log p`` into the 120 half-open rational bins

    [zL,zR),       -3/5 <= zL < zR <= 3/5,

of width 1/100.  The corresponding prime interval is

    (X exp(-zR), X exp(-zL)],

so the endpoint convention matches ``theta(upper)-theta(lower)`` exactly.
The possible omitted endpoint ``z=3/5`` only lowers the selected subrate.

If ``epsilon=0.2/log(3,594,641)^2``, Dusart's theorem gives on each bin

    theta(X exp(-zL)) - theta(X exp(-zR))
      >= X {exp(-zL)(1-epsilon)-exp(-zR)(1+epsilon)}.

Every displayed bracket is checked positive.  Direct Arb interval evaluation
of K on the whole absolute target bin supplies ``Kbin``.  Since

    p^(-1/2) >= X^(-1/2) exp(zL/2),
    C(s) = (X+1)/(2 sqrt(X)),

the normalized contribution is summed rigorously.  Reflection of the kernel
and prime clocks proves the negative-s half-line.

The Riemann-kernel enclosure retains n=1,2,3,4 exactly.  For n>=5 and
``t>=-10^(-8)``, the positive theta summands have total less than 10^(-28):
``pi exp(-2*10^(-8))>3`` gives the same majorant
``20 n^4 exp(-3n^2)`` used in the earlier coupling certificates.  The tiny
negative guard is needed only because an outward Arb ball representing a bin
starting at zero can extend microscopically below zero.

Reproduction:

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_one_particle_core_tail_certificate.py
"""

from flint import arb, ctx


ctx.prec = 200


def q(numerator: int, denominator: int) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()
CORE = q(3, 5)
BIN_WIDTH = q(1, 100)
BIN_COUNT = 120
THETA_THRESHOLD = arb(3_594_641)
DUSART_ETA = q(1, 5)
NEGATIVE_GUARD = arb("1e-8")


# Uniform tail for n>=5.  Consecutive terms of 20*n^4*exp(-3*n^2)
# have ratio at most the n=5 ratio below.
first_tail = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = q(6, 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = first_tail / (1 - tail_ratio)
assert PI * (-2 * NEGATIVE_GUARD).exp() > 3
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def interval_cover(left: arb, right: arb) -> arb:
    """Outward Arb ball covering the complete real interval [left,right]."""

    assert right > left
    result = arb((left + right) / 2, (right - left) / 2)
    assert result.lower() <= left.lower()
    assert result.upper() >= right.upper()
    assert result.lower() > -NEGATIVE_GUARD
    return result


def kernel_interval(t: arb) -> arb:
    """Riemann-kernel enclosure on a ball with t>-10^(-8)."""

    assert t.lower() > -NEGATIVE_GUARD
    total = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        w = PI * nn * (2 * t).exp()
        total += (
            PI
            * nn
            * (q(5, 2) * t).exp()
            * (2 * w - 3)
            * (-w).exp()
        )
    return total + K_TAIL


def absolute_bin(left: arb, right: arb) -> arb:
    """A ball covering {|z|: left<=z<=right}."""

    if right <= 0:
        return interval_cover(-right, -left)
    if left >= 0:
        return interval_cover(left, right)
    return interval_cover(arb(0), max(-left, right))


def main() -> None:
    epsilon = DUSART_ETA / THETA_THRESHOLD.log() ** 2
    assert epsilon < arb("0.000878")

    weighted_lower_sum = arb(0)
    smallest_theta_bracket = None
    smallest_kernel_lower = None

    for index in range(BIN_COUNT):
        z_left = -CORE + index * BIN_WIDTH
        z_right = z_left + BIN_WIDTH

        kernel_lower = kernel_interval(
            absolute_bin(z_left, z_right)
        ).lower()
        assert kernel_lower > 0

        # theta(upper)-theta(lower), using the half-open target bin
        # [z_left,z_right) and a single uniform relative error epsilon.
        theta_bracket = (
            (-z_left).exp() * (1 - epsilon)
            - (-z_right).exp() * (1 + epsilon)
        )
        assert theta_bracket > 0

        weighted_lower_sum += (
            (z_left / 2).exp() * kernel_lower * theta_bracket
        )
        if smallest_theta_bracket is None or theta_bracket < smallest_theta_bracket:
            smallest_theta_bracket = theta_bracket
        if smallest_kernel_lower is None or kernel_lower < smallest_kernel_lower:
            smallest_kernel_lower = kernel_lower

    assert smallest_theta_bracket is not None
    assert smallest_kernel_lower is not None

    # In the analytic regime X>=THETA_THRESHOLD*exp(CORE), but the weaker
    # X>=THETA_THRESHOLD already gives this convenient rational lower bound.
    normalization_lower = 2 * THETA_THRESHOLD / (THETA_THRESHOLD + 1)
    prime_core_rate_lower = normalization_lower * weighted_lower_sum
    assert prime_core_rate_lower > q(1, 4)

    source_threshold = THETA_THRESHOLD.log() + CORE
    largest_compact_prime = THETA_THRESHOLD * (2 * CORE).exp()

    print("precision_bits:", ctx.prec)
    print("Dusart_theta_threshold:", THETA_THRESHOLD)
    print("Dusart_relative_error_upper:", epsilon)
    print("target_core_radius:", CORE)
    print("target_bins:", BIN_COUNT)
    print("target_bin_width:", BIN_WIDTH)
    print("smallest_theta_increment_bracket:", smallest_theta_bracket)
    print("smallest_kernel_bin_lower:", smallest_kernel_lower)
    print("source_abs_threshold:", source_threshold)
    print("largest_prime_needed_below_threshold:", largest_compact_prime)
    print("prime_only_direct_core_rate_lower:", prime_core_rate_lower)
    print("target_rate_threshold:", q(1, 4))
    print("certificate: PASS")


if __name__ == "__main__":
    main()
