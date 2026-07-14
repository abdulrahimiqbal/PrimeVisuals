#!/usr/bin/env python3
"""Floating discovery only for continuation item 195.2."""

from __future__ import annotations

from math import cosh, exp, log, pi, sqrt
from random import Random

from scipy.integrate import quad
from scipy.optimize import differential_evolution


def kernel(t: float) -> float:
    t = abs(t)
    total = 0.0
    for n in range(1, 6):
        scale = pi * n * n
        v = scale * exp(2 * t)
        total += scale * exp(2.5 * t) * (2 * v - 3) * exp(-v)
    return total


def levy(h: float) -> float:
    return exp(-h / 2) / (1 - exp(-2 * h))


def prime_powers(limit: int) -> tuple[tuple[int, float, float], ...]:
    sieve = [True] * (limit + 1)
    sieve[:2] = [False, False]
    for p in range(2, int(sqrt(limit)) + 1):
        if sieve[p]:
            for n in range(p * p, limit + 1, p):
                sieve[n] = False
    rows = []
    for p in range(2, limit + 1):
        if not sieve[p]:
            continue
        q = p
        while q <= limit:
            rows.append((q, log(q), log(p) / sqrt(q)))
            q *= p
    return tuple(sorted(rows))


PRIMES = prime_powers(10000)
YMAX = 2.8


def arch(source: float, left: float, right: float) -> float:
    if right <= left:
        return 0.0
    return quad(
        lambda h: kernel(source + h) * levy(h),
        left,
        right,
        epsabs=2e-11,
        epsrel=2e-11,
        limit=160,
    )[0]


def residual_xde(x: float, d: float, e: float, relative: bool = True) -> float:
    y = x + 0.5 + d + e
    if not (-0.6 <= x <= 0.6 and d > 0 and e >= log(2) and 1.4 <= y <= YMAX):
        return 10.0
    cx = cosh(x / 2)
    cy = cosh(y / 2)
    xpr = sum(w * kernel(x + lq) / cx for _, lq, w in PRIMES if lq >= d)
    ypr = sum(w * kernel(y - lq) / cy for _, lq, w in PRIMES if lq <= e)
    a = 0.5 / cx * (
        arch(x, d, d + 0.3) + arch(x, d + e + 0.2, 8.0)
    )
    b = 0.5 / cx * (
        arch(x, d, d + e) + arch(x, d + e + 0.05, 8.0)
    )
    supply = xpr + a + b
    if relative:
        return supply / ypr - 1 if ypr > 0 else 10.0
    return supply - ypr


def objective(values) -> float:
    x, y, t = map(float, values)
    dmax = y - x - 0.5 - log(2)
    if dmax <= 0.002:
        return 10.0
    d = 0.002 + t * (dmax - 0.002)
    e = y - x - 0.5 - d
    return residual_xde(x, d, e)


def main() -> None:
    result = differential_evolution(
        objective,
        [(-0.6, 0.6), (1.4, YMAX), (0.0, 1.0)],
        seed=20260714,
        popsize=18,
        maxiter=50,
        polish=True,
        workers=1,
        updating="immediate",
        tol=1e-9,
    )
    print("minimum", result.fun)
    x, y, t = result.x
    dmax = y - x - 0.5 - log(2)
    d = 0.002 + t * (dmax - 0.002)
    e = y - x - 0.5 - d
    print("x_d_e", (x, d, e))
    print("y", y)
    rng = Random(20260714)
    worst = (99.0, None)
    for _ in range(500):
        x = rng.uniform(-0.6, 0.6)
        d = rng.uniform(0.002, 4.0)
        e_low = max(log(2), 0.9 - x - d)
        e_high = YMAX - 0.5 - x - d
        if e_low > e_high:
            continue
        e = rng.uniform(e_low, e_high)
        value = residual_xde(x, d, e)
        if value < worst[0]:
            worst = (value, (x, d, e, x + 0.5 + d + e))
    print("random_worst", worst)


if __name__ == "__main__":
    main()
