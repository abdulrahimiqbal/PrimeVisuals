#!/usr/bin/env python3
"""Floating search for the two left-extra residual prime ledgers.

This is a discovery/falsification companion to
``coupling_high_middle_left_extra_arch_certificate.py``.  It evaluates the
exact finite prime-power sums and high-accuracy quadrature for the retained
archimedean surplus in (197.2), but it is not an interval certificate.
"""

from __future__ import annotations

from functools import lru_cache
from math import cosh, exp, log, pi, sqrt

import numpy as np
from scipy.integrate import quad
from scipy.optimize import differential_evolution


def kernel_scalar(t: float) -> float:
    t = abs(t)
    total = 0.0
    for n in range(1, 8):
        v = pi * n * n * exp(2 * t)
        total += pi * n * n * exp(2.5 * t) * (2 * v - 3) * exp(-v)
    return total


def levy(t: float) -> float:
    return exp(-t / 2) / (-np.expm1(-2 * t))


@lru_cache(maxsize=None)
def prime_powers(limit: int) -> tuple[tuple[int, float, float], ...]:
    sieve = bytearray(b"\x01") * (limit + 1)
    if limit >= 0:
        sieve[0] = 0
    if limit >= 1:
        sieve[1] = 0
    rows: list[tuple[int, float, float]] = []
    for p in range(2, limit + 1):
        if not sieve[p]:
            continue
        for multiple in range(p * p, limit + 1, p):
            sieve[multiple] = 0
        power = p
        while power <= limit:
            rows.append((power, log(power), log(p) / sqrt(power)))
            if power > limit // p:
                break
            power *= p
    rows.sort()
    return tuple(rows)


def prime_sum(source: float, left_log: float, right_log: float,
              sign: int) -> float:
    assert sign in (-1, 1)
    if right_log < log(2):
        return 0.0
    limit = max(2, int(exp(right_log)) + 2)
    total = 0.0
    for _power, log_power, coefficient in prime_powers(limit):
        if left_log - 1e-13 <= log_power <= right_log + 1e-13:
            total += coefficient * kernel_scalar(source + sign * log_power)
    return total / cosh(source / 2)


def arch_integral(source: float, left_h: float, right_h: float,
                  sign: int) -> float:
    if right_h <= left_h:
        return 0.0
    value, error = quad(
        lambda h: kernel_scalar(source + sign * h) * levy(h)
        / cosh(source / 2),
        left_h,
        right_h,
        epsabs=1e-13,
        epsrel=3e-12,
        limit=250,
    )
    if error > 2e-10:
        raise RuntimeError((source, left_h, right_h, sign, value, error))
    return value


def left_residual(parameters: np.ndarray) -> tuple[float, tuple[float, ...]]:
    x, y, a, b = map(float, parameters)
    if y < 1.4 or a <= 0 or b <= 0:
        return 1e3, ()
    g = y - x
    x_prime = prime_sum(x, a, a + b + 1, -1)
    y_prime = prime_sum(y, g + .5 + a, g + .5 + a + b, -1)
    arch = arch_integral(x, a, a + b + 1, -1)
    arch -= .5 * arch_integral(x, a + .34, a + b + .34, -1)
    return x_prime + arch - y_prime, (x_prime, arch, y_prime)


def middle_right_residual(
    parameters: np.ndarray,
) -> tuple[float, tuple[float, ...]]:
    x, a, b, r = map(float, parameters)
    if a <= 0 or b <= 0 or r <= 0:
        return 1e3, ()
    y = x + 1.5 + a + b + r
    if y < 1.4:
        return 1e3, ()
    x_prime = prime_sum(x, a, a + b + 1, +1)
    y_prime = prime_sum(y, 1 + r, 1 + r + b, -1)
    arch = arch_integral(x, a, a + b + 1, +1)
    arch -= .5 * arch_integral(x, a + .3, a + b + .3, +1)
    return x_prime + arch - y_prime, (x_prime, arch, y_prime)


def run(name: str, objective, bounds) -> None:
    def ratio_objective(values) -> float:
        _residual, pieces = objective(values)
        if len(pieces) != 3 or pieces[2] < 1e-280:
            return 1e6
        return (pieces[0] + pieces[1]) / pieces[2]

    result = differential_evolution(
        ratio_objective,
        bounds,
        seed=20260714,
        popsize=18,
        maxiter=160,
        polish=True,
        workers=1,
        updating="immediate",
        tol=2e-9,
    )
    residual, pieces = objective(result.x)
    print(name)
    print("parameters:", tuple(float(value) for value in result.x))
    print("residual:", residual)
    print("pieces_(xprime,arch,yprime):", pieces)
    print("ratio:", ratio_objective(result.x))


def main() -> None:
    run(
        "L",
        left_residual,
        ((-.6, .6), (1.4, 4.0), (1e-4, 4.0), (1e-4, 5.0)),
    )
    run(
        "MR",
        middle_right_residual,
        ((-.6, .6), (1e-4, 4.0), (1e-4, 5.0), (1e-4, 4.0)),
    )
    print("status: FLOATING-POINT DISCOVERY ONLY")


if __name__ == "__main__":
    main()
