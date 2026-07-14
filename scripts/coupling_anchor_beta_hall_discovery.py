#!/usr/bin/env python3
"""Discover the sharp one-dimensional mixed anchor--beta Hall radius.

For an anchor ``x`` let ``kappa_x`` be the capacity measure consisting of

* the archimedean density ``K(u) J(|u-x|) / cosh(x/2)``;
* all prime-power atoms ``x +/- log(q)`` with weight
  ``Lambda(q) q^(-1/2) K(x +/- log(q)) / cosh(x/2)``; and
* a free holding atom at ``x``.

The demand is either ``beta_+ = 2 exp(-z/2) K(z) dz`` or its reflection
``beta_-``.  A dominated coupling supported on ``|u-z| <= D`` exists iff

    beta(I) <= kappa_x(I + [-D,D])

for every interval I whose D-neighbourhood avoids x.  Intervals suffice in
one dimension: components farther than 2D have disjoint neighbourhoods,
while components separated by at most 2D are dominated by their interval
hull.  On the left of x the interval inequalities are equivalently

    L(b) <= min_{a<=b} R(a),
    L(t)=F(t)-G(t+D),   R(t)=F(t)-G(t-D),

where F and G are cumulative demand and capacity.  The right side is the
same left-side calculation after reflection.  Thus each scan is linear in
the grid size; no generic transport LP is used.

This is deliberately a floating-point discovery/falsification program, not
an exact certificate.  It reports the active Hall interval so a subsequent
Arb proof needs to enclose only the actual finite family of extrema.
"""

from __future__ import annotations

import argparse
from bisect import bisect_right
from dataclasses import dataclass
from math import cosh, exp, isfinite, log, pi, sqrt

import numpy as np
from scipy.integrate import cumulative_trapezoid


def kernel(t):
    """Four-term theta evaluation; omitted terms are negligible here."""
    a = np.abs(np.asarray(t, dtype=float))
    total = np.zeros_like(a)
    for n in range(1, 5):
        v = pi * n * n * np.exp(2 * a)
        total += (
            pi * n * n * np.exp(2.5 * a) * (2 * v - 3) * np.exp(-v)
        )
    return total


def levy(h):
    h = np.asarray(h, dtype=float)
    return np.exp(-h / 2) / (-np.expm1(-2 * h))


def prime_power_table(limit: int) -> tuple[np.ndarray, np.ndarray]:
    """Return distinct q<=limit and Lambda(q)/sqrt(q), sorted by q."""
    if limit < 2:
        return np.empty(0), np.empty(0)
    sieve = np.ones(limit + 1, dtype=bool)
    sieve[:2] = False
    for p in range(2, int(sqrt(limit)) + 1):
        if sieve[p]:
            sieve[p * p : limit + 1 : p] = False
    primes = np.flatnonzero(sieve)
    rows: list[tuple[int, float]] = []
    for p0 in primes:
        p = int(p0)
        q = p
        coefficient = log(p)
        while q <= limit:
            rows.append((q, coefficient / sqrt(q)))
            if q > limit // p:
                break
            q *= p
    rows.sort()
    return (
        np.asarray([q for q, _ in rows], dtype=float),
        np.asarray([c for _, c in rows], dtype=float),
    )


@dataclass
class Witness:
    deficit: float
    a: float
    b: float
    side: str


class HallScanner:
    def __init__(self, s: float, step: float, z_bound: float):
        self.s = s
        self.step = step
        self.z_bound = z_bound
        # The padding accommodates every shifted CDF used for D<=1.
        self.u_min = -z_bound - 1.05
        self.u_max = z_bound + 1.05
        self.z = np.arange(-z_bound, z_bound + step / 2, step)
        self.u = np.arange(self.u_min, self.u_max + step / 2, step)

        k_z = kernel(self.z)
        self.beta_density = {
            +1: 2 * np.exp(-self.z / 2) * k_z,
            -1: 2 * np.exp(+self.z / 2) * k_z,
        }
        self.beta_cdf = {
            sign: np.concatenate(
                ([0.0], cumulative_trapezoid(density, self.z))
            )
            for sign, density in self.beta_density.items()
        }

        q_limit = int(exp(s + z_bound + 1.1)) + 10
        self.qs, self.coefficients = prime_power_table(q_limit)

    def demand_cdf(self, sign: int, points: np.ndarray) -> np.ndarray:
        return np.interp(
            points,
            self.z,
            self.beta_cdf[sign],
            left=0.0,
            right=self.beta_cdf[sign][-1],
        )

    def capacity_data(self, x: float):
        """Numerical G_x on the left of x, relative to u_min."""
        c = cosh(x / 2)
        arch = np.zeros_like(self.u)
        mask = self.u < x
        h = x - self.u[mask]
        arch[mask] = kernel(self.u[mask]) * levy(h) / c
        # Do not integrate across the singularity.  Left-side queries are
        # always strictly below x, and the cumulative value there is finite.
        stop = int(np.searchsorted(self.u, x, side="left"))
        arch_cdf = np.zeros_like(self.u)
        if stop >= 2:
            arch_cdf[1:stop] = cumulative_trapezoid(
                arch[:stop], self.u[:stop]
            )
            arch_cdf[stop:] = np.inf

        if self.qs.size:
            targets = x - np.log(self.qs)
            weights = self.coefficients * kernel(targets) / c
            keep = (targets >= self.u_min) & (targets < x)
            order = np.argsort(targets[keep])
            targets = targets[keep][order]
            prefix = np.cumsum(weights[keep][order])
        else:
            targets = np.empty(0)
            prefix = np.empty(0)
        return arch_cdf, targets, prefix

    def capacity_cdf(self, data, points: np.ndarray) -> np.ndarray:
        arch_cdf, targets, prefix = data
        arch = np.interp(points, self.u, arch_cdf, left=0.0, right=np.inf)
        if targets.size == 0:
            return arch
        indices = np.searchsorted(targets, points, side="right") - 1
        atoms = np.where(indices >= 0, prefix[np.maximum(indices, 0)], 0.0)
        return arch + atoms

    def left_witness(self, x: float, sign: int, d: float) -> Witness:
        # A half-grid buffer avoids querying through the arch singularity.
        z = self.z[self.z < x - d - self.step / 2]
        if z.size == 0:
            return Witness(-np.inf, np.nan, np.nan, "left")
        f = self.demand_cdf(sign, z)
        data = self.capacity_data(x)
        left = f - self.capacity_cdf(data, z + d)
        right = f - self.capacity_cdf(data, z - d)
        prefix_argmin = np.minimum.accumulate(right)
        running_index = np.empty(z.size, dtype=int)
        best = 0
        for i in range(z.size):
            if right[i] < right[best]:
                best = i
            running_index[i] = best
        gaps = left - prefix_argmin
        j = int(np.argmax(gaps))
        return Witness(float(gaps[j]), float(z[running_index[j]]), float(z[j]), "left")

    def witness(self, x: float, sign: int, d: float) -> Witness:
        left = self.left_witness(x, sign, d)
        # Reflection maps (x,beta_sign) to (-x,beta_-sign).
        reflected = self.left_witness(-x, -sign, d)
        right = Witness(
            reflected.deficit,
            -reflected.b,
            -reflected.a,
            "right",
        )
        return left if left.deficit >= right.deficit else right

    def critical_radius(
        self, x: float, sign: int, tolerance: float = 2e-7
    ) -> tuple[float, Witness]:
        lo, hi = 0.0, 1.0
        hi_witness = self.witness(x, sign, hi)
        if hi_witness.deficit > tolerance:
            return np.inf, hi_witness
        for _ in range(24):
            mid = (lo + hi) / 2
            w = self.witness(x, sign, mid)
            if w.deficit <= tolerance:
                hi = mid
                hi_witness = w
            else:
                lo = mid
        return hi, hi_witness


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--S", type=float, default=6.0)
    parser.add_argument("--x-step", type=float, default=0.1)
    parser.add_argument("--grid-step", type=float, default=0.001)
    parser.add_argument("--z-bound", type=float, default=2.5)
    args = parser.parse_args()
    scanner = HallScanner(args.S, args.grid_step, args.z_bound)
    worst = None
    for x in np.arange(-args.S, args.S + args.x_step / 2, args.x_step):
        for sign in (+1, -1):
            radius, witness = scanner.critical_radius(float(x), sign)
            row = (radius, float(x), sign, witness)
            if worst is None or radius > worst[0]:
                worst = row
            print(
                f"x={x:+.6f} beta={'+' if sign > 0 else '-'} "
                f"D~{radius:.9f} active={witness.side} "
                f"I=[{witness.a:.6f},{witness.b:.6f}] "
                f"deficit={witness.deficit:+.3e}",
                flush=True,
            )
    assert worst is not None
    radius, x, sign, witness = worst
    print("worst_discovered_radius:", radius)
    print("worst_anchor:", x)
    print("worst_beta_sign:", "+" if sign > 0 else "-")
    print("active_interval:", witness)
    print("status: FLOATING-POINT DISCOVERY ONLY")


if __name__ == "__main__":
    main()
