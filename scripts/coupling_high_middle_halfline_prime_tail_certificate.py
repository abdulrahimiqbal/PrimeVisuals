#!/usr/bin/env python3
"""Exact prime-ledger tail for the high mandatory halfline.

Use the coordinates from the mandatory cut

    d=v-x-1/2>0,  e=y-v>=log(2),  a=x+d=v-1/2,
    y=x+1/2+d+e=a+1/2+e.

This file proves the prime-only domination

    nu_x^prime([a,infinity))
      > sum_(log n<=e) Lambda(n)n^(-1/2)K(y-log n)/C(y)       (1)

whenever

    |x|<=3/5,  y>=7/5,  and  a>=1.

Thus the repaired residual ledger following the continuous increment
certificate is automatic on this entire positive-target tail; none of its
remaining archimedean surplus is needed there.

Two elementary prime estimates make the proof uniform in y.  First, put
``theta(T)=sum_(p<=T)log(p)`` and ``psi(T)=sum_(p^k<=T)log(p)``.  For an
integer n, the product of the primes in ``(n,2n]`` divides
``binomial(2n,n)``, whence

    theta(2n)-theta(n) <= 2n log(2).

Dyadic summation gives ``theta(T)<4T log(2)``.  Since
``psi(T)=sum_(k>=1)theta(T^(1/k))`` and
``log(T)/sqrt(T)<=2/e``, it follows that

    psi(T)<(4log(2)+8/e)T<6T.                            (2)

Partial summation therefore gives, for every N>=2,

    sum_(q<=N) Lambda(q)/sqrt(q) < 12sqrt(N).             (3)

Taking ``N=exp(e)`` and using ``C(y)>=exp(y/2)/2`` bounds the complete
captured demand by

    24exp(-(a+1/2)/2)K(a+1/2).                           (4)

For ``2/5<=d<=log(25)``, choose the least prime power m with
``log(m)>=d`` from

    2,3,4,5,7,8,9,11,13,16,17,19,23,25.

Its initial gap above ``exp(2/5)`` and every consecutive ratio are at most
``3/2``.  Hence

    0 <= log(m)-d <= log(3/2),
    Lambda(m)/sqrt(m) >= log(2)/4.                       (5)

The weak inequalities include both switch conventions: an x atom at
``log(m)=d`` belongs to the closed x tail, and a y atom at ``log(n)=e`` is
included in the captured demand.

Since K is strictly decreasing on the positive half-line (item 182), (4)--
(5) and ``y-log(n)=a+1/2+e-log(n)>=a+1/2`` reduce this range to

    K(a+log(3/2))/K(a+1/2)
      > (96/log(2)) C(3/5)exp(-3/4).                       (6)

Put ``t=a+1/2>=3/2`` and ``delta=1/2-log(3/2)>0``.  The positive first
theta term and geometric upper tail used in item 191 give

    K(t-delta)/K(t)
      >= (1/2) exp(-9delta/2
                    +pi exp(2t)(1-exp(-2delta)))
                    (1-16exp(-3pi exp(2t))).               (7)

Both nonconstant factors on the right increase strictly with t.  The exact
Arb check at t=3/2 is already above 17,000, while the right side of (6) is
below 69.

For ``d>log(25)`` use Nagura's theorem in its published form: for every real
``X>25`` there is a prime ``p`` satisfying ``X<p<6X/5`` (J. Nagura,
*Proc. Japan Acad.* 28 (1952), 177--181).  The endpoint ``X=25`` is covered
directly by ``p=29``.  With ``X=exp(d)``, the resulting x atom
has displacement below ``log(6/5)`` and coefficient greater than
``d exp(-d/2)/sqrt(6/5)``.  Since ``a=d+x>=log(25)-3/5``, the remaining
kernel quotient is (7) at

    t>=log(25)-1/10,  delta=1/2-log(6/5).

It is greater than ``2.45e327``; the required elementary factor is below
9.  This proves (1) on the whole unbounded source band.  Nagura is the only
external prime-interval theorem used; (2)--(4) were proved above and do not
invoke the prime number theorem or any RH-strength error estimate.
"""

from __future__ import annotations

from flint import arb, ctx


ctx.prec = 240


PI = arb.pi()
HALF = arb(1) / 2
X_BOUND = arb(3) / 5
Y_MIN = arb(7) / 5
A_MIN = arb(1)
D_MIN = arb(2) / 5


def prime_power_data(limit: int) -> tuple[tuple[int, int], ...]:
    """Return every (prime power, base prime) strictly below limit."""

    is_prime = [True] * limit
    is_prime[0] = False
    is_prime[1] = False
    result: list[tuple[int, int]] = []
    for prime in range(2, limit):
        if not is_prime[prime]:
            continue
        power = prime
        while power < limit:
            result.append((power, prime))
            power *= prime
        for multiple in range(prime * prime, limit, prime):
            is_prime[multiple] = False
    return tuple(sorted(result))


def kernel_quotient_lower(t: arb, displacement: arb) -> arb:
    """The item-191 theta lower bound for K(t-d)/K(t)."""

    assert t >= arb(3) / 2
    assert 0 < displacement <= HALF
    scale = PI * (2 * t).exp()
    shifted_scale = scale * (-2 * displacement).exp()
    assert shifted_scale > 3
    geometric_ratio = 16 * (-3 * scale).exp()
    assert geometric_ratio < 1
    result = (
        HALF * (-arb(9) * displacement / 2).exp()
        * (scale * (1 - (-2 * displacement).exp())).exp()
        * (1 - geometric_ratio)
    )
    assert result > 0
    return result.lower()


def main() -> None:
    data = prime_power_data(61)
    powers = tuple(power for power, _prime in data)
    candidates = tuple(power for power in powers if power <= 31)
    expected_candidates = (
        2, 3, 4, 5, 7, 8, 9, 11, 13, 16, 17,
        19, 23, 25, 27, 29, 31,
    )
    assert candidates == expected_candidates

    log2 = arb(2).log()
    log_three_halves = (arb(3) / 2).log()

    # This retains the former compact-y completeness audit.  On y<=4 the
    # source constraints imply d<log(31), while a>=1 gives d>=2/5.
    d_upper = arb(41) / 10 - log2
    assert d_upper < arb(31).log()
    assert (D_MIN - (A_MIN - X_BOUND)).contains(0)
    assert arb(2).log() - D_MIN < log_three_halves
    for left, right in zip(candidates, candidates[1:]):
        assert arb(right) / left <= arb(3) / 2

    coefficient_floor = log2 / 4
    for power, prime in data:
        if power <= 31:
            coefficient = arb(prime).log() / arb(power).sqrt()
            if power == 16:
                assert (coefficient - coefficient_floor).contains(0)
            else:
                assert coefficient > coefficient_floor

    # This is the complete captured list: exp(41/10)<61.
    assert (arb(41) / 10).exp() < 61
    coefficient_sum = sum(
        (arb(prime).log() / arb(power).sqrt()
         for power, prime in data),
        arb(0),
    )
    assert coefficient_sum < 13

    # Self-contained Chebyshev bound used on the unbounded y range.  The
    # dyadic binomial argument in the docstring proves theta(T)<4log(2)T;
    # summing theta(T^(1/k)) then gives this coefficient, uniformly in T.
    chebyshev_coefficient = 4 * log2 + 8 / arb.const_e()
    assert chebyshev_coefficient < 6

    displacement = HALF - log_three_halves
    assert displacement > 0
    t0 = arb(3) / 2
    quotient = kernel_quotient_lower(t0, displacement)
    finite_d_required = (
        24 * (X_BOUND / 2).cosh() * (-arb(3) / 4).exp()
        / coefficient_floor
    )
    assert finite_d_required < 69
    assert quotient > finite_d_required

    # The main exponential in (5), and also its positive geometric
    # correction, increase with t.  This displayed derivative is a strict
    # lower bound for the logarithmic derivative of the full right side.
    scale0 = PI * (2 * t0).exp()
    quotient_log_slope_lower = (
        2 * scale0 * (1 - (-2 * displacement).exp())
    )
    assert quotient_log_slope_lower > 0

    # Nagura range d>=log(25).  Its strict prime interval gives an x atom
    # strictly inside the closed tail.  The elementary prefactor is worst
    # at d=log(25), x=-3/5; the theta quotient is worst at the corresponding
    # a=log(25)-3/5.
    log25 = arb(25).log()
    nagura_displacement = HALF - (arb(6) / 5).log()
    nagura_t0 = log25 - arb(1) / 10
    nagura_quotient = kernel_quotient_lower(
        nagura_t0, nagura_displacement
    )
    nagura_required = (
        24 * (arb(6) / 5).sqrt() * (X_BOUND / 2).cosh()
        * (arb(1) / 20).exp() / log25
    )
    assert nagura_required < 9
    assert nagura_quotient > nagura_required
    nagura_scale = PI * (2 * nagura_t0).exp()
    nagura_log_slope_lower = (
        2 * nagura_scale
        * (1 - (-2 * nagura_displacement).exp())
    )
    assert nagura_log_slope_lower > 0

    print("precision_bits:", ctx.prec)
    print("source_band: |x|<=3/5, y>=7/5")
    print("tail_condition: a=x+d>=1, e>=log(2)")
    print("complete_prime_powers_below_61:", powers)
    print("least_x_atom_candidates:", candidates)
    print("captured_coefficient_sum_upper:", coefficient_sum)
    print("self_contained_psi_linear_coefficient:",
          chebyshev_coefficient)
    print("single_x_coefficient_floor:", coefficient_floor)
    print("kernel_displacement:", displacement)
    print("kernel_quotient_lower_at_a=1:", quotient)
    print("finite_d_required_kernel_quotient_upper:", finite_d_required)
    print("quotient_log_slope_lower:", quotient_log_slope_lower)
    print("Nagura_input: X>25 gives X<p<6X/5; X=25 uses p=29")
    print("Nagura_kernel_displacement:", nagura_displacement)
    print("Nagura_kernel_quotient_lower_at_boundary:", nagura_quotient)
    print("Nagura_required_kernel_quotient_upper:", nagura_required)
    print("Nagura_quotient_log_slope_lower:",
          nagura_log_slope_lower)
    print("closed_x_switch_and_closed_y_switch_endpoints: PASS")
    print("mandatory_prime_tail_a_ge_1: PASS")


if __name__ == "__main__":
    main()
