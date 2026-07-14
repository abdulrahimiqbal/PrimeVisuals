#!/usr/bin/env python3
"""Conditioned LP discovery for bounded local U-contacts.

This is a discovery program, not an interval certificate.  It avoids the
ill-conditioned finite difference ``(Lf(x+h)-Lf(x))/h`` by differentiating
the symmetric fixed-distance representation of the archimedean generator.
The test function is piecewise affine in ``u=U(z)`` and is constrained to
have range in ``[0,b]`` and U-slope at most one.  Two cells adjacent to the
contact point have U-slope exactly one.

At isolated prime targets the derivative is relaxed to its optimal value
``+U'``.  Such values can be approached by smooth spikes of arbitrarily
small support and amplitude.  Consequently the returned optimum is an upper
bound for the chosen knot model; a positive value is only a discovery signal,
whereas a stable negative value is useful for rejecting an alleged contact.

Run with the repository dependency bundle, for example

    PYTHONPATH=/tmp/pvdeps python3 scripts/bounded_local_contact_discovery.py \
        --b 0.01 --x 0.75
"""

from __future__ import annotations

import argparse
import math

import numpy as np
from scipy.integrate import quad
from scipy.optimize import brentq, linprog


PI = math.pi


def k_values(z: float) -> tuple[float, float, float, float]:
    """Return K, K', U, U' in double precision."""
    absolute = abs(z)
    k_sum = 0.0
    kp_sum = 0.0
    kpp_sum = 0.0
    for n in range(1, 6):
        y = PI * n * n * math.exp(2.0 * absolute)
        if y > 745.0:
            continue
        term = (
            PI
            * n
            * n
            * math.exp(2.5 * absolute)
            * (2.0 * y - 3.0)
            * math.exp(-y)
        )
        logarithmic_derivative = 2.5 + 4.0 * y / (2.0 * y - 3.0) - 2.0 * y
        minus_logarithmic_derivative_prime = (
            4.0 * y + 24.0 * y / (2.0 * y - 3.0) ** 2
        )
        k_sum += term
        kp_sum += term * logarithmic_derivative
        kpp_sum += term * (
            logarithmic_derivative**2 - minus_logarithmic_derivative_prime
        )
    if k_sum == 0.0:
        signed_infinity = math.copysign(1.0e300, z)
        return 0.0, 0.0, signed_infinity, 1.0e300
    u_absolute = -kp_sum / k_sum
    u = math.copysign(u_absolute, z) if z else 0.0
    u_prime = (kp_sum / k_sum) ** 2 - kpp_sum / k_sum
    return k_sum, -u * k_sum, u, u_prime


def U(z: float) -> float:
    return k_values(z)[2]


def inverse_u(value: float) -> float:
    return brentq(lambda z: U(z) - value, -2.5, 2.5)


def J(t: float) -> float:
    return math.exp(-t / 2.0) / (-math.expm1(-2.0 * t))


def C(x: float) -> float:
    return math.cosh(x / 2.0)


def tanh_half(x: float) -> float:
    return math.tanh(x / 2.0)


def prime_powers(maximum: int) -> list[tuple[int, float]]:
    sieve = bytearray(b"\x01") * (maximum + 1)
    primes: list[int] = []
    for p in range(2, maximum + 1):
        if sieve[p]:
            primes.append(p)
            if p * p <= maximum:
                sieve[p * p : maximum + 1 : p] = b"\x00" * (
                    (maximum - p * p) // p + 1
                )
    result: list[tuple[int, float]] = []
    for p in primes:
        q = p
        while q <= maximum:
            result.append((q, math.log(p) / math.sqrt(q)))
            q *= p
    return sorted(result)


def make_knots(x: float, b: float, base_step: float, local_cells: int) -> np.ndarray:
    physical = list(np.arange(-2.5, 2.5 + base_step / 2.0, base_step))
    physical.append(x)
    ux = U(x)
    # Resolve five full amplitude widths on either side of the contact.  The
    # central cell size b/local_cells is the conditioning scale that the old
    # physical grid missed.
    delta_u = b / local_cells
    for index in range(-5 * local_cells, 5 * local_cells + 1):
        level = ux + index * delta_u
        try:
            physical.append(inverse_u(level))
        except ValueError:
            pass
    knots = np.array(sorted(set(round(value, 14) for value in physical)))
    contact = int(np.argmin(abs(knots - x)))
    knots[contact] = x
    return knots


def gauss_rule(left: float, right: float) -> tuple[np.ndarray, np.ndarray]:
    abscissae = np.array(
        [-0.9061798459386640, -0.5384693101056831, 0.0,
         0.5384693101056831, 0.9061798459386640]
    )
    weights = np.array(
        [0.2369268850561891, 0.4786286704993665, 0.5688888888888889,
         0.4786286704993665, 0.2369268850561891]
    )
    midpoint = (left + right) / 2.0
    radius = (right - left) / 2.0
    return midpoint + radius * abscissae, radius * weights


class AffineModel:
    def __init__(self, knots: np.ndarray):
        self.knots = knots
        self.u_knots = np.array([U(z) for z in knots])
        self.dimension = len(knots)

    def value_coefficients(self, z: float) -> tuple[int, float, int, float]:
        if z <= self.knots[0]:
            return 0, 1.0, 0, 0.0
        if z >= self.knots[-1]:
            end = self.dimension - 1
            return end, 1.0, end, 0.0
        index = int(np.searchsorted(self.knots, z) - 1)
        uz = U(z)
        fraction = (uz - self.u_knots[index]) / (
            self.u_knots[index + 1] - self.u_knots[index]
        )
        return index, 1.0 - fraction, index + 1, fraction

    def derivative_coefficients(self, z: float) -> tuple[int, float, int, float]:
        if z <= self.knots[0] or z >= self.knots[-1]:
            return 0, 0.0, 0, 0.0
        index = int(np.searchsorted(self.knots, z) - 1)
        scale = k_values(z)[3] / (
            self.u_knots[index + 1] - self.u_knots[index]
        )
        return index, -scale, index + 1, scale

    @staticmethod
    def add_sparse(
        target: np.ndarray,
        sparse: tuple[int, float, int, float],
        multiplier: float,
    ) -> None:
        i0, c0, i1, c1 = sparse
        target[i0] += multiplier * c0
        target[i1] += multiplier * c1


def solve(x: float, b: float, base_step: float, local_cells: int) -> None:
    knots = make_knots(x, b, base_step, local_cells)
    model = AffineModel(knots)
    n = model.dimension
    contact = int(np.argmin(abs(knots - x)))
    assert abs(knots[contact] - x) < 1.0e-12
    ux_prime = k_values(x)[3]

    arch_objective = np.zeros(n)
    prime_objective = np.zeros(n)
    arch_constant = 0.0
    prime_constant = 0.0
    curvature_constant = ux_prime / 2.0
    fx_sparse = model.value_coefficients(x)

    # Break the t-integral whenever x+t or x-t crosses a knot.  Five-point
    # Gauss quadrature is then applied only inside a fixed affine-U cell.
    breaks = {0.0, 2.5 - x, 2.5 + x, 5.0}
    for z in knots:
        for distance in (z - x, x - z):
            if 0.0 < distance < 5.0:
                breaks.add(float(distance))
    ordered_breaks = sorted(breaks)
    c_x = C(x)
    half_s = tanh_half(x) / 2.0

    for left, right in zip(ordered_breaks[:-1], ordered_breaks[1:]):
        if right - left < 1.0e-14:
            continue
        nodes, weights = gauss_rule(left, right)
        for t, weight in zip(nodes, weights):
            if t == 0.0:
                continue
            kernel = J(float(t)) * weight / c_x
            for z in (x + float(t), x - float(t)):
                kz, kpz, _, _ = k_values(z)
                value_multiplier = kernel * (kpz - half_s * kz)
                model.add_sparse(
                    arch_objective, model.value_coefficients(z), value_multiplier
                )
                model.add_sparse(arch_objective, fx_sparse, -value_multiplier)
                model.add_sparse(
                    arch_objective, model.derivative_coefficients(z), kernel * kz
                )
                arch_constant -= kernel * kz * ux_prime

    # Prime-value terms are exact in the knot model.  Prime-target derivative
    # atoms are assigned their relaxed optimum +U'.  The omitted log(q)>6+|x|
    # terms are far below double precision because of theta decay.
    for q, coefficient in prime_powers(100_000):
        length = math.log(q)
        if length > 6.0 + abs(x):
            break
        for z in (x + length, x - length):
            kz, _, uz, uz_prime = k_values(z)
            rate = coefficient * kz / c_x
            rate_prime = -rate * (uz + half_s)
            model.add_sparse(
                prime_objective, model.value_coefficients(z), rate_prime
            )
            model.add_sparse(prime_objective, fx_sparse, -rate_prime)
            prime_constant += rate * (uz_prime - ux_prime)

    objective = arch_objective + prime_objective
    constant = arch_constant + prime_constant + curvature_constant

    # |dv| <= dU and two-sided differentiability with U-slope one at x.
    a_ub = []
    b_ub = []
    for index, delta_u in enumerate(np.diff(model.u_knots)):
        row = np.zeros(n)
        row[index + 1] = 1.0
        row[index] = -1.0
        a_ub.append(row)
        b_ub.append(delta_u)
        a_ub.append(-row)
        b_ub.append(delta_u)

    a_eq = []
    b_eq = []
    for index in (contact - 1, contact):
        row = np.zeros(n)
        row[index + 1] = 1.0
        row[index] = -1.0
        a_eq.append(row)
        b_eq.append(model.u_knots[index + 1] - model.u_knots[index])

    result = linprog(
        -objective,
        A_ub=np.array(a_ub),
        b_ub=np.array(b_ub),
        A_eq=np.array(a_eq),
        b_eq=np.array(b_eq),
        bounds=[(0.0, b)] * n,
        method="highs",
    )
    if not result.success:
        raise RuntimeError(result.message)
    defect = constant + objective @ result.x
    slopes = np.diff(result.x) / np.diff(model.u_knots)
    print("knots:", n)
    print("contact index/value:", contact, result.x[contact])
    print("defect:", defect)
    print("defect/U'(x):", defect / ux_prime)
    print(
        "arch/prime/curvature:",
        arch_constant + arch_objective @ result.x,
        prime_constant + prime_objective @ result.x,
        curvature_constant,
    )
    print("slope extrema:", slopes.min(), slopes.max())
    active = np.flatnonzero(abs(slopes) > 0.5)
    print("active-slope z intervals:")
    for index in active[:80]:
        print(knots[index], knots[index + 1], slopes[index])
    print("all nontrivial slope runs:")
    selected = np.flatnonzero(abs(slopes) > 1.0e-5)
    if len(selected):
        run_start = selected[0]
        previous = selected[0]
        for index in selected[1:]:
            if index != previous + 1 or abs(slopes[index] - slopes[previous]) > 1.0e-4:
                print(
                    knots[run_start], knots[previous + 1],
                    float(slopes[run_start : previous + 1].min()),
                    float(slopes[run_start : previous + 1].max()),
                )
                run_start = index
            previous = index
        print(
            knots[run_start], knots[previous + 1],
            float(slopes[run_start : previous + 1].min()),
            float(slopes[run_start : previous + 1].max()),
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--x", type=float, default=0.75)
    parser.add_argument("--b", type=float, default=0.01)
    parser.add_argument("--base-step", type=float, default=0.025)
    parser.add_argument("--local-cells", type=int, default=40)
    arguments = parser.parse_args()
    solve(arguments.x, arguments.b, arguments.base_step, arguments.local_cells)


if __name__ == "__main__":
    main()
