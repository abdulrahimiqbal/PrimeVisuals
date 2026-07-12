#!/usr/bin/env python3
"""Build and rigorously check a dual certificate for the frozen N=8 cone.

The floating-point SDP is used only to choose a rational witness.  Every
inequality in the final certificate is recomputed with Arb ball arithmetic
from the defining formulas: integer endpoint overlaps for the local cone and
Suzuki's explicit archimedean-plus-prime-power screw function for the target.

Requires python-flint.  The certificate proves nonmembership in the exact
width-two cone from PREREGISTRATION.md; it does not make a statement about
other local grammars or about RH.
"""

from __future__ import annotations

import json
import math
from fractions import Fraction
from functools import lru_cache
from pathlib import Path

import numpy as np
from flint import arb, ctx


ROOT = Path(__file__).resolve().parents[1]
LOG_DIR = ROOT / "logs" / "prime-square-completion"
HORIZON = 8
DENOMINATOR = 1_000_000
INTERIOR_SHIFT = Fraction(1, 20)
LERCH_TERMS = 1024

ctx.prec = 256


def primes_below(maximum: int) -> list[int]:
    primes: list[int] = []
    for candidate in range(2, maximum):
        if all(candidate % p for p in primes if p * p <= candidate):
            primes.append(candidate)
    return primes


def prime_power_base(value: int) -> int | None:
    for p in primes_below(value + 1):
        power = p
        while power < value:
            power *= p
        if power == value:
            return p
    return None


def log_ratio(numerator: int, denominator: int = 1) -> arb:
    return (arb(numerator) / denominator).log()


def zero_matrix(size: int) -> list[list[arb]]:
    return [[arb(0) for _ in range(size)] for __ in range(size)]


def shifted_cell_cross_gram(
    maximum: int,
    left_multiplier: int,
    right_multiplier: int,
) -> list[list[arb]]:
    """Exact-branch overlap matrix for translated log-integer cells."""
    size = maximum - 1
    output = zero_matrix(size)
    for row in range(size):
        cell = row + 1
        left_start = cell * left_multiplier
        left_end = min((cell + 1) * left_multiplier, maximum)
        if left_start >= left_end:
            continue
        for column in range(size):
            other = column + 1
            right_start = other * right_multiplier
            right_end = min((other + 1) * right_multiplier, maximum)
            lower = max(left_start, right_start)
            upper = min(left_end, right_end)
            if lower < upper:
                output[row][column] = log_ratio(upper, lower)
    return output


def polynomial_cross_gram(
    maximum: int,
    left_terms: list[tuple[int, int]],
    right_terms: list[tuple[int, int]],
) -> list[list[arb]]:
    size = maximum - 1
    output = zero_matrix(size)
    for left_multiplier, left_coefficient in left_terms:
        for right_multiplier, right_coefficient in right_terms:
            cross = shifted_cell_cross_gram(maximum, left_multiplier, right_multiplier)
            coefficient = left_coefficient * right_coefficient
            for row in range(size):
                for column in range(size):
                    output[row][column] += coefficient * cross[row][column]
    return output


def edge_terms(p: int) -> list[tuple[int, int]]:
    return [(1, 1), (p, -1)]


def square_terms(p: int, q: int) -> list[tuple[int, int]]:
    return [(1, 1), (p, -1), (q, -1), (p * q, 1)]


PI = arb.pi()
EULER_GAMMA = arb.const_euler()
CATALAN = arb.const_catalan()
PSI_QUARTER = -EULER_GAMMA - PI / 2 - 3 * arb.const_log2()
HURWITZ_ZETA_TWO_QUARTER = PI * PI + 8 * CATALAN


@lru_cache(maxsize=None)
def lerch_quarter(numerator: int, denominator: int) -> arb:
    """Enclose Phi((den/num)^2, 2, 1/4) with an explicit positive tail."""
    if numerator == denominator:
        return HURWITZ_ZETA_TWO_QUARTER
    z = arb(denominator * denominator) / (numerator * numerator)
    power = arb(1)
    total = arb(0)
    for index in range(LERCH_TERMS):
        total += 16 * power / ((4 * index + 1) ** 2)
        power *= z
    tail_upper = 16 * power / ((4 * LERCH_TERMS + 1) ** 2) / (1 - z)
    # The omitted series is positive and no larger than tail_upper.
    return total + tail_upper * arb("0.5 +/- 0.5")


@lru_cache(maxsize=None)
def screw_value(left: int, right: int = 1) -> arb:
    """Suzuki screw value at abs(log(left/right)) for positive integers."""
    numerator = max(left, right)
    denominator = min(left, right)
    divisor = math.gcd(numerator, denominator)
    numerator //= divisor
    denominator //= divisor
    if numerator == denominator:
        return arb(0)

    ratio = arb(numerator) / denominator
    root = ratio.sqrt()
    t = ratio.log()
    archimedean = (
        -4 * (root + 1 / root - 2)
        - (t / 2) * (PSI_QUARTER - PI.log())
        - (
            HURWITZ_ZETA_TWO_QUARTER
            - lerch_quarter(numerator, denominator) / root
        ) / 4
    )

    prime_power = arb(0)
    cutoff = numerator // denominator
    for value in range(2, cutoff + 1):
        p = prime_power_base(value)
        if p is None:
            continue
        prime_power += (
            log_ratio(p) / arb(value).sqrt()
            * log_ratio(numerator, denominator * value)
        )
    return archimedean + prime_power


@lru_cache(maxsize=None)
def screw_kernel(left: int, right: int) -> arb:
    return screw_value(left, right) - screw_value(left, 1) - screw_value(right, 1)


def target_matrix(maximum: int) -> list[list[arb]]:
    size = maximum - 1
    return [
        [
            screw_kernel(row + 2, column + 2)
            - screw_kernel(row + 1, column + 2)
            - screw_kernel(row + 2, column + 1)
            + screw_kernel(row + 1, column + 1)
            for column in range(size)
        ]
        for row in range(size)
    ]


def dot_rational_ball(numerators: list[list[int]], matrix: list[list[arb]]) -> arb:
    return sum(
        (
            arb(numerators[row][column]) / DENOMINATOR
            * matrix[row][column]
        )
        for row in range(len(numerators))
        for column in range(len(numerators))
    )


def determinant_two(matrix: list[list[arb]]) -> arb:
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]


def determinant_three(matrix: list[list[arb]]) -> arb:
    return (
        matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1])
        - matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0])
        + matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
    )


def interval_string(value: arb) -> str:
    return value.str(30)


def build_rational_witness() -> list[list[int]]:
    report = json.loads((LOG_DIR / "kill-test.json").read_text())
    row = next(item for item in report["rows"] if item["N"] == HORIZON)
    residual = np.asarray(row["widthTwoSDP"]["dual"], dtype=float)
    shifted = (residual + residual.T) / 2
    shifted += float(INTERIOR_SHIFT) * np.eye(HORIZON - 1)
    return np.rint(shifted * DENOMINATOR).astype(np.int64).tolist()


def main() -> None:
    numerators = build_rational_witness()
    primes = primes_below(HORIZON)
    boundary = polynomial_cross_gram(HORIZON, [(1, 1)], [(1, 1)])
    boundary_margin = dot_rational_ball(numerators, boundary)

    edge_margins: dict[str, arb] = {}
    for p in primes:
        edge = polynomial_cross_gram(HORIZON, edge_terms(p), edge_terms(p))
        edge_margins[str(p)] = dot_rational_ball(numerators, edge)

    pair_certificates = []
    for left, p in enumerate(primes):
        for q in primes[left + 1:]:
            if p * q >= HORIZON:
                continue
            operators = [edge_terms(p), edge_terms(q), square_terms(p, q)]
            adjoint = [[arb(0) for _ in range(3)] for __ in range(3)]
            for row in range(3):
                for column in range(3):
                    forward = dot_rational_ball(
                        numerators,
                        polynomial_cross_gram(HORIZON, operators[row], operators[column]),
                    )
                    reverse = dot_rational_ball(
                        numerators,
                        polynomial_cross_gram(HORIZON, operators[column], operators[row]),
                    )
                    adjoint[row][column] = (forward + reverse) / 2
            leading_minors = [
                adjoint[0][0],
                determinant_two([row[:2] for row in adjoint[:2]]),
                determinant_three(adjoint),
            ]
            pair_certificates.append({
                "p": p,
                "q": q,
                "adjoint": [[interval_string(value) for value in row] for row in adjoint],
                "leadingPrincipalMinors": [interval_string(value) for value in leading_minors],
                "positiveDefinite": all(value > 0 for value in leading_minors),
            })

    target = target_matrix(HORIZON)
    target_separation = dot_rational_ball(numerators, target)
    passed = (
        boundary_margin > 0
        and all(value > 0 for value in edge_margins.values())
        and all(pair["positiveDefinite"] for pair in pair_certificates)
        and target_separation < 0
    )

    certificate = {
        "claim": "The N=8 complete screw target is outside the frozen width-two SDP cone.",
        "arithmetic": "Arb ball arithmetic via python-flint",
        "precisionBits": ctx.prec,
        "horizon": HORIZON,
        "witnessDenominator": DENOMINATOR,
        "witnessNumerators": numerators,
        "interiorShift": str(INTERIOR_SHIFT),
        "lerchTerms": LERCH_TERMS,
        "boundaryMargin": interval_string(boundary_margin),
        "edgeMargins": {key: interval_string(value) for key, value in edge_margins.items()},
        "pairCertificates": pair_certificates,
        "targetSeparation": interval_string(target_separation),
        "passed": bool(passed),
    }
    (LOG_DIR / "hard-death-certificate-N8.json").write_text(
        json.dumps(certificate, indent=2) + "\n"
    )

    lines = [
        "# Hard death certificate at N=8",
        "",
        "A rational symmetric matrix `Y` separates the complete screw target",
        "from every element of the frozen width-two SDP cone. All displayed",
        "quantities were recomputed from the defining formulas using Arb balls;",
        "the floating SDP was used only to discover `Y`.",
        "",
        f"- denominator of `Y`: `{DENOMINATOR}`",
        f"- boundary margin: `{interval_string(boundary_margin)}`",
        f"- target separation: `{interval_string(target_separation)}`",
        f"- certified: `{'YES' if passed else 'NO'}`",
        "",
        "## Edge margins",
        "",
    ]
    lines.extend(f"- p={p}: `{interval_string(value)}`" for p, value in edge_margins.items())
    lines += ["", "## Pair-block Sylvester certificates", ""]
    for pair in pair_certificates:
        minors = ", ".join(f"`{value}`" for value in pair["leadingPrincipalMinors"])
        lines.append(f"- ({pair['p']},{pair['q']}): leading minors {minors}")
    lines += [
        "",
        "Because the boundary and edge pairings are positive and each pair-block",
        "adjoint is positive definite, `<Y,C> >= 0` for every cone element `C`.",
        "The strictly negative target pairing therefore proves nonmembership.",
        "This kills only the preregistered width-two grammar, not the divisor-cube",
        "program, other local grammars, or RH.",
        "",
    ]
    (LOG_DIR / "hard-death-certificate-N8.md").write_text("\n".join(lines))
    if not passed:
        raise SystemExit("Arb certificate failed")
    print("[prime-square-certificate] HARD DEATH CERTIFIED AT N=8")
    print(f"  boundary={interval_string(boundary_margin)}")
    print(f"  target={interval_string(target_separation)}")


if __name__ == "__main__":
    main()
