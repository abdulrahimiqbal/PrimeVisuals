#!/usr/bin/env python3
"""Finite-channel discovery LP for characteristic-coordinate pair phases.

This program is deliberately a *falsifier and design instrument*, not a proof
certificate.  It truncates the archimedean target coordinate to [-2, 2],
discretizes each signed increment logarithmically, and includes prime-power
atoms q <= 100.  The two finite marginal jump measures are coupled by an
optimal-transport LP.  A no-jump copy of the opposite marginal mass is added
to each side, which permits both simultaneous and single-coordinate events
without changing either physical jump marginal.

The printed objective is

    sum Gamma(target) * (Phi(target) / Phi(source) - 1),

i.e. the truncated value of Q Phi / Phi itself.  The target needed by the
RH coupling route is therefore at most -1/2, not merely negative.

Reproduce the three current falsifier cells with

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_characteristic_hjb_discovery.py

The output includes a channel-pair decomposition and the largest individual
positive and negative flows so that new ramps can be designed from actual
mass ledgers rather than from plots.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from math import cosh, exp, expm1, log, pi, sqrt

import numpy as np
from scipy.optimize import linprog
from scipy.sparse import coo_matrix, vstack


ARCH_TARGET = 2.0
ARCH_MIN_INCREMENT = 1.0e-5
ARCH_BINS_PER_SIGN = 96
PRIME_POWER_MAX = 100
FLOW_PRINT_CUTOFF = 1.0e-7
MASS_SOLVE_CUTOFF = 1.0e-14


@dataclass(frozen=True)
class Atom:
    target: float
    mass: float
    channel: str


def smoothstep(t: float) -> float:
    if t <= 0.0:
        return 0.0
    if t >= 1.0:
        return 1.0
    return 3.0 * t * t - 2.0 * t * t * t


def characteristic(x: float, y: float) -> float:
    """c=|m| on a same-sign pair and outer-radius/2 otherwise."""
    m = 0.5 * (x + y)
    r = abs(x - y)
    return abs(m) + 0.25 * max(0.0, r - 2.0 * abs(m))


def separation_factor(r: float) -> float:
    """Logarithmic diagonal profile with a rational C1 bridge to one."""
    if r <= 0.0:
        return 0.0
    if r <= 0.1:
        return 1.0 / sqrt(log((exp(4.0) / 10.0) / r))
    if r < 0.2:
        t = 10.0 * r - 1.0
        return (-15.0 * t**3 + 22.0 * t**2 + t + 8.0) / 16.0
    return 1.0


# Each tuple is (left endpoint, right endpoint, multiplicative plateau).
# Products make the levels independently tunable in discovery runs.
DEFAULT_RAMPS = (
    (0.30, 0.35, 16.0),
    (0.50, 0.54, 33.0),
    (0.71, 0.75, 128.0),
)


def midpoint_factor(c: float, ramps=DEFAULT_RAMPS) -> float:
    value = 1.0
    for left, right, factor in ramps:
        value *= 1.0 + (factor - 1.0) * smoothstep((c - left) / (right - left))
    return value


def phase(x: float, y: float, ramps=DEFAULT_RAMPS) -> float:
    return separation_factor(abs(x - y)) * midpoint_factor(
        characteristic(x, y), ramps
    )


def kernel(z: float) -> float:
    """Positive theta series for the even archimedean weight K."""
    t = abs(z)
    total = 0.0
    # At t=0 the n>=8 terms are already far below double precision.  At
    # larger t convergence is even faster.
    for n in range(1, 9):
        v = pi * n * n * exp(2.0 * t)
        total += (
            pi
            * n
            * n
            * exp(2.5 * t)
            * (2.0 * v - 3.0)
            * exp(-v)
        )
    return total


def levy_shape(u: float) -> float:
    return exp(-0.5 * u) / (-expm1(-2.0 * u))


def prime_powers(limit: int) -> list[tuple[int, int]]:
    """Return (q,p) once for every prime power q=p^k <= limit."""
    primes = []
    for p in range(2, limit + 1):
        if any(p % d == 0 for d in range(2, int(sqrt(p)) + 1)):
            continue
        q = p
        while q <= limit:
            primes.append((q, p))
            q *= p
    return sorted(primes)


def marginal_atoms(source: float) -> list[Atom]:
    atoms: list[Atom] = []
    normalizer = cosh(0.5 * source)

    for direction, name in ((-1.0, "arch-"), (+1.0, "arch+")):
        max_increment = (
            source + ARCH_TARGET if direction < 0.0 else ARCH_TARGET - source
        )
        if max_increment <= ARCH_MIN_INCREMENT:
            continue
        edges = np.geomspace(
            ARCH_MIN_INCREMENT, max_increment, ARCH_BINS_PER_SIGN + 1
        )
        for left, right in zip(edges[:-1], edges[1:]):
            # Geometric midpoint respects the logarithmic singular scale.
            u = sqrt(float(left * right))
            z = source + direction * u
            mass = kernel(z) * levy_shape(u) / normalizer * float(right - left)
            if mass > MASS_SOLVE_CUTOFF:
                atoms.append(Atom(z, mass, name))

    for q, p in prime_powers(PRIME_POWER_MAX):
        ell = log(q)
        coefficient = log(p) / sqrt(q)
        for direction, name in ((-1.0, "prime-"), (+1.0, "prime+")):
            z = source + direction * ell
            mass = coefficient * kernel(z) / normalizer
            if mass > MASS_SOLVE_CUTOFF:
                atoms.append(Atom(z, mass, f"{name}{q}"))
    return atoms


def broad_channel(channel: str) -> str:
    if channel.startswith("arch"):
        return channel
    if channel.startswith("prime"):
        return "prime-" if channel.startswith("prime-") else "prime+"
    return channel


def solve_cell(
    m: float,
    r: float,
    ramps=DEFAULT_RAMPS,
    verbose: bool = True,
) -> dict:
    x, y = m - 0.5 * r, m + 0.5 * r
    source_phase = phase(x, y, ramps)
    if not source_phase > 0.0:
        raise ValueError("source phase must be positive")

    x_atoms = marginal_atoms(x)
    y_atoms = marginal_atoms(y)
    mass_x = sum(atom.mass for atom in x_atoms)
    mass_y = sum(atom.mass for atom in y_atoms)
    rows = x_atoms + [Atom(x, mass_y, "stay")]
    cols = y_atoms + [Atom(y, mass_x, "stay")]
    nr, nc = len(rows), len(cols)

    costs = np.empty((nr, nc))
    for i, a in enumerate(rows):
        for j, b in enumerate(cols):
            if a.channel == "stay" and b.channel == "stay":
                costs[i, j] = 0.0
            else:
                costs[i, j] = phase(a.target, b.target, ramps) / source_phase - 1.0

    # Sparse row- and column-sum constraints.
    indices = np.arange(nr * nc).reshape(nr, nc)
    row_constraint = coo_matrix(
        (
            np.ones(nr * nc),
            (np.repeat(np.arange(nr), nc), indices.ravel()),
        ),
        shape=(nr, nr * nc),
    )
    col_constraint = coo_matrix(
        (
            np.ones(nr * nc),
            (np.repeat(np.arange(nc), nr), indices.T.ravel()),
        ),
        shape=(nc, nr * nc),
    )
    # One column equation is redundant.  Removing it avoids a false numerical
    # infeasibility caused by the last-bit difference between the two ways of
    # summing the same total mass.
    constraints = vstack((row_constraint, col_constraint.tocsr()[:-1])).tocsr()
    rhs = np.array([a.mass for a in rows] + [b.mass for b in cols[:-1]])
    result = linprog(
        costs.ravel(),
        A_eq=constraints,
        b_eq=rhs,
        bounds=(0.0, None),
        method="highs",
        options={"dual_feasibility_tolerance": 1.0e-9,
                 "primal_feasibility_tolerance": 1.0e-9},
    )
    if not result.success:
        raise RuntimeError(result.message)

    flow = result.x.reshape(nr, nc)
    grouped = defaultdict(lambda: [0.0, 0.0])
    individual = []
    for i, a in enumerate(rows):
        for j, b in enumerate(cols):
            amount = flow[i, j]
            if amount <= FLOW_PRINT_CUTOFF:
                continue
            contribution = amount * costs[i, j]
            key = (broad_channel(a.channel), broad_channel(b.channel))
            grouped[key][0] += amount
            grouped[key][1] += contribution
            if a.channel != "stay" or b.channel != "stay":
                individual.append(
                    (
                        contribution,
                        amount,
                        costs[i, j],
                        a.channel,
                        b.channel,
                        a.target,
                        b.target,
                        characteristic(a.target, b.target),
                        abs(a.target - b.target),
                    )
                )

    answer = {
        "m": m,
        "r": r,
        "x": x,
        "y": y,
        "c": characteristic(x, y),
        "source_phase": source_phase,
        "objective": result.fun,
        "mass_x": mass_x,
        "mass_y": mass_y,
        "grouped": grouped,
        "individual": individual,
    }
    if verbose:
        print(
            f"CELL m={m:.6f} r={r:.6f} x={x:.6f} y={y:.6f} "
            f"c={answer['c']:.6f} Phi={source_phase:.9g}"
        )
        print(
            f"objective_QPhi_over_Phi={result.fun:+.12f} "
            f"defect_plus_half={result.fun + 0.5:+.12f} "
            f"marginal_mass=({mass_x:.9f},{mass_y:.9f})"
        )
        print("channel decomposition: mass, contribution")
        for key, (amount, contribution) in sorted(
            grouped.items(), key=lambda item: item[1][1], reverse=True
        ):
            if key == ("stay", "stay"):
                continue
            print(
                f"  {key[0]:>7s} x {key[1]:<7s} "
                f"mass={amount:.9f} contribution={contribution:+.12f}"
            )
        print("largest positive individual flows")
        for entry in sorted(individual, reverse=True)[:12]:
            contribution, amount, edge_cost, ca, cb, za, zb, ct, rt = entry
            print(
                f"  {ca:>9s} x {cb:<9s} mass={amount:.7g} "
                f"edge={edge_cost:+.6g} contrib={contribution:+.7g} "
                f"target=({za:+.5f},{zb:+.5f}) c={ct:.5f} r={rt:.5f}"
            )
        print("largest negative individual flows")
        for entry in sorted(individual)[:12]:
            contribution, amount, edge_cost, ca, cb, za, zb, ct, rt = entry
            print(
                f"  {ca:>9s} x {cb:<9s} mass={amount:.7g} "
                f"edge={edge_cost:+.6g} contrib={contribution:+.7g} "
                f"target=({za:+.5f},{zb:+.5f}) c={ct:.5f} r={rt:.5f}"
            )
        print()
    return answer


def main() -> None:
    for m, r in ((0.50, 0.80), (0.10, 0.80), (0.00, 0.40)):
        solve_cell(m, r)


if __name__ == "__main__":
    main()
