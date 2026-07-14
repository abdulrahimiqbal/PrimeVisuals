#!/usr/bin/env python3
"""Exact counterexample to the proposed left-extra residual ledger.

The continuum translations in
``coupling_high_middle_left_extra_arch_certificate.py`` are valid, but their
remaining sufficient prime/arch inequality (197.2) need not hold.  In the
left component coordinates used there, take

    x=3/5, y=51/25, a=1/200, b=43/20, g=y-x=36/25.

The proposed residual is

    Xpr + A - Ypr,

    Xpr = C(x)^(-1) sum_(a<=log q<=a+b+1)
             Lambda(q)q^(-1/2)K(x-log q),

    Ypr = C(y)^(-1) sum_(g+1/2+a<=log q<=g+1/2+a+b)
             Lambda(q)q^(-1/2)K(y-log q),

    A = C(x)^(-1){int_a^(a+b+1)K(x-h)J(h)dh
          -(1/2)int_(a+17/50)^(a+b+17/50)K(x-h)J(h)dh}.

This certificate proves ``Xpr+A-Ypr<0``.  Prime upper bounds and the full
arch upper bound include a uniform positive theta tail; the y-prime lower
bound and subtracted arch lower bound retain only positive theta terms.
Every integral is validated by Arb and split where ``x-h`` changes sign.

Reproduce with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_high_middle_left_extra_residual_falsifier.py
"""

from __future__ import annotations

from flint import acb, arb, ctx

import coupling_high_thin_projection_hall_certificate as theta


ctx.prec = 240


def q(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


X = q(3, 5)
Y = q(51, 25)
A_LEFT = q(1, 200)
B_WIDTH = q(43, 20)
GAP = Y - X
HALF = q(1, 2)
SHIFT = q(17, 50)


def prime_powers(limit: int) -> tuple[tuple[int, int], ...]:
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    result: list[tuple[int, int]] = []
    for prime in range(2, limit + 1):
        if not sieve[prime]:
            continue
        for multiple in range(prime * prime, limit + 1, prime):
            sieve[multiple] = False
        power = prime
        while power <= limit:
            result.append((power, prime))
            if power > limit // prime:
                break
            power *= prime
    return tuple(sorted(result))


ALL_POWERS = prime_powers(100)


def kernel_partial(t: arb) -> arb:
    return theta.theta_partial_real(abs(t))


def kernel_upper(t: arb) -> arb:
    return arb(kernel_partial(t).upper()) + theta.THETA_TAIL


def selected_powers(left: arb, right: arb) -> tuple[tuple[int, int], ...]:
    return tuple(
        (power, prime)
        for power, prime in ALL_POWERS
        if left <= arb(power).log() <= right
    )


def prime_sum(source: arb, left: arb, right: arb, upper: bool) -> tuple[arb, tuple[int, ...]]:
    selected = selected_powers(left, right)
    total = arb(0)
    for power, prime in selected:
        target = source - arb(power).log()
        kernel = kernel_upper(target) if upper else kernel_partial(target).lower()
        total += arb(prime).log() / arb(power).sqrt() * kernel
    total /= (source / 2).cosh()
    return (arb(total.upper()) if upper else arb(total.lower()),
            tuple(power for power, _prime in selected))


def partial_arch_integral(left: arb, right: arb) -> arb:
    """Validated first-four-theta integral of K(x-h)J(h)."""

    assert 0 < left < right

    def before(h: acb, analytic: bool) -> acb:
        del analytic
        return theta.theta_partial_complex(acb(X) - h) * theta.levy_complex(h)

    def after(h: acb, analytic: bool) -> acb:
        del analytic
        return theta.theta_partial_complex(h - acb(X)) * theta.levy_complex(h)

    options = dict(abs_tol=arb("1e-55"), rel_tol=arb("1e-55"), eval_limit=100_000)
    total = acb(0)
    if left < X:
        endpoint = min(right, X)
        total += acb.integral(before, left, endpoint, **options)
    if right > X:
        endpoint = max(left, X)
        total += acb.integral(after, endpoint, right, **options)
    assert total.imag == 0
    return total.real


def levy_tail(h: arb) -> arb:
    exponential = (-h / 2).exp()
    return exponential.atanh() + exponential.atan()


def main() -> None:
    x_left = A_LEFT
    x_right = A_LEFT + B_WIDTH + 1
    y_left = GAP + HALF + A_LEFT
    y_right = y_left + B_WIDTH
    sub_left = A_LEFT + SHIFT
    sub_right = A_LEFT + B_WIDTH + SHIFT

    x_prime, x_powers = prime_sum(X, x_left, x_right, upper=True)
    y_prime, y_powers = prime_sum(Y, y_left, y_right, upper=False)

    # Exact switch guards and complete lists.
    assert arb(1).log() < x_left < arb(2).log()
    assert arb(23).log() < x_right < arb(25).log()
    assert arb(5).log() < y_left < arb(7).log()
    assert arb(59).log() < y_right < arb(61).log()
    assert x_powers == (2, 3, 4, 5, 7, 8, 9, 11, 13, 16, 17, 19, 23)
    assert y_powers == (
        7, 8, 9, 11, 13, 16, 17, 19, 23, 25, 27, 29,
        31, 32, 37, 41, 43, 47, 49, 53, 59,
    )

    full_partial = partial_arch_integral(x_left, x_right)
    sub_partial = partial_arch_integral(sub_left, sub_right)
    # The omitted K tail is positive.  Add it to the full integral and omit
    # it from the subtracted half integral to obtain an upper bound.
    full_tail_upper = theta.THETA_TAIL * (
        levy_tail(x_left) - levy_tail(x_right)
    )
    arch_upper = (
        arb(full_partial.upper()) + full_tail_upper
        - HALF * arb(sub_partial.lower())
    ) / (X / 2).cosh()
    arch_upper = arb(arch_upper.upper())

    residual_upper = arb((x_prime + arch_upper - y_prime).upper())
    assert residual_upper < 0

    print("precision_bits:", ctx.prec)
    print("parameters_(x,y,a,b,g):", (X, Y, A_LEFT, B_WIDTH, GAP))
    print("x_prime_powers:", x_powers)
    print("y_prime_powers:", y_powers)
    print("x_prime_upper:", x_prime)
    print("arch_full_partial:", full_partial)
    print("arch_subtracted_partial:", sub_partial)
    print("arch_omitted_tail_upper:", full_tail_upper)
    print("arch_residual_upper:", arch_upper)
    print("y_prime_lower:", y_prime)
    print("residual_upper_Xpr_plus_A_minus_Ypr:", residual_upper)
    print("left_extra_residual_counterexample: PASS")


if __name__ == "__main__":
    main()
