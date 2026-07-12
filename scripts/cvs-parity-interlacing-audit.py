#!/usr/bin/env python3
"""Cutoff-free CvS/CCM even--odd parity interlacing audit.

The closed forms follow the cutoff-free assembly in Groskin (2026),
``verify_dictionary_threeroute.py``, itself matched entrywise to CCM
equations (3.10)--(3.11), (3.16) and Lemma 4.1.  This script adds the odd
sector and an all-level parity-interlacing audit.  It requires ``mpmath``.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import mpmath as mp


PUBLISHED_C13_N4_EVEN = [
    "9.679261860506972216846507e-15",
    "8.649159137860362474999502e-10",
    "0.000005961942266122285204291588",
    "0.004770173008595913832812366",
    "0.4825088599906826253758729",
]


def prime_powers(c: int) -> list[tuple[int, mp.mpf]]:
    primes: list[int] = []
    for value in range(2, c + 1):
        if all(value % prime for prime in primes):
            primes.append(value)
    output: list[tuple[int, mp.mpf]] = []
    for prime in primes:
        power = prime
        while power <= c:
            output.append((power, mp.log(prime)))
            if power > c // prime:
                break
            power *= prime
    return sorted(output)


def controlled_sources(
    sources: list[tuple[int, mp.mpf]], control: str
) -> list[tuple[int, mp.mpf]]:
    if control == "zeta":
        return sources
    weights = [weight for _, weight in sources]
    if control == "reverse_weights":
        return [(source, weight) for (source, _), weight in zip(sources, reversed(weights))]
    if control == "negate_largest":
        output = list(sources)
        if output:
            source, weight = output[-1]
            output[-1] = (source, -weight)
        return output
    raise ValueError(f"Unknown control: {control}")


def build_parity_blocks(c: int, maximum_n: int, control: str = "zeta"):
    length = mp.log(c)
    z = mp.exp(-2 * length)
    pi = mp.pi
    sources = controlled_sources(prime_powers(c), control)

    def a_n(n: int):
        return mp.mpf(1) / 4 + pi * 1j * n / length

    def hyper(n: int):
        argument = a_n(n)
        return mp.hyp2f1(1, argument, argument + 1, z)

    def alpha(n: int):
        argument = a_n(n)
        return (
            mp.exp(-length / 2)
            * mp.im((2 * length / (length + 4 * pi * 1j * n)) * hyper(n))
            + mp.mpf(1) / 2 * mp.im(mp.digamma(argument))
        ) / pi

    def beta(n: int):
        argument = a_n(n)
        first = -length * mp.exp(-length / 2) * mp.im(
            (2 * length / (4 * pi * n - 1j * length)) * hyper(n)
        )
        second = -mp.exp(-length / 2) / 4 * mp.re(mp.lerchphi(z, 2, argument))
        third = mp.mpf(1) / 4 * mp.re(mp.polygamma(1, argument))
        return (first + second + third) / length

    common = (
        mp.mpf(1) / 2
        * mp.log((mp.exp(length / 2) - 1) / (mp.exp(length / 2) + 1))
        + mp.atan(mp.exp(length / 2))
        - pi / 4
        + mp.euler / 2
        + mp.mpf(1) / 2 * mp.log(8 * pi)
    )

    def gamma(n: int):
        argument = a_n(n)
        return (
            -mp.exp(-length / 2)
            * mp.re((2 * length / (length + 4 * pi * 1j * n)) * hyper(n))
            + 2
            * mp.exp(-length / 2)
            * mp.hyp2f1(mp.mpf(1) / 4, 1, mp.mpf(5) / 4, z)
            - mp.mpf(1)
            / 2
            * (mp.re(mp.digamma(argument)) - mp.digamma(mp.mpf(1) / 4))
            + common
        )

    def prime_value(m: int):
        return -mp.fsum(
            weight
            / mp.sqrt(source)
            * mp.sin(2 * pi * m * (1 - mp.log(source) / length))
            for source, weight in sources
        ) / pi

    def prime_derivative(m: int):
        return -2 * mp.fsum(
            weight
            / mp.sqrt(source)
            * (1 - mp.log(source) / length)
            * mp.cos(2 * pi * m * (1 - mp.log(source) / length))
            for source, weight in sources
        )

    indices = range(-maximum_n, maximum_n + 1)
    psi = {m: alpha(m) + prime_value(m) for m in indices}
    psi_derivative = {
        m: -2 * (gamma(m) - beta(m)) + prime_derivative(m) for m in indices
    }

    def cosine_pole(m: int):
        return (
            mp.sinh(length / 4)
            / mp.sqrt(length)
            / (mp.mpf(1) / 4 + (2 * pi * m / length) ** 2)
        )

    def sine_pole(m: int):
        return (
            4
            * pi
            * mp.sinh(length / 4)
            / (length * mp.sqrt(length))
            * m
            / (mp.mpf(1) / 4 + (2 * pi * m / length) ** 2)
        )

    cosines = {m: cosine_pole(m) for m in indices}
    sines = {m: sine_pole(m) for m in indices}

    def entry(m: int, n: int):
        pole = 2 * (cosines[m] * cosines[n] - sines[m] * sines[n])
        if m == n:
            return psi_derivative[n] + pole
        return (psi[m] - psi[n]) / (m - n) + pole

    even = mp.matrix(maximum_n + 1, maximum_n + 1)
    odd = mp.matrix(maximum_n, maximum_n)
    for row in range(maximum_n + 1):
        for column in range(maximum_n + 1):
            if row == 0 and column == 0:
                even[row, column] = entry(0, 0)
            elif row == 0:
                even[row, column] = (entry(0, column) + entry(0, -column)) / mp.sqrt(2)
            elif column == 0:
                even[row, column] = (entry(row, 0) + entry(-row, 0)) / mp.sqrt(2)
            else:
                even[row, column] = entry(row, column) + entry(row, -column)
            if row < maximum_n and column < maximum_n:
                odd[row, column] = entry(row + 1, column + 1) - entry(row + 1, -(column + 1))
    return even, odd


def principal(matrix: mp.matrix, size: int):
    return mp.matrix([[matrix[row, column] for column in range(size)] for row in range(size)])


def eigenvalues(matrix: mp.matrix) -> list[mp.mpf]:
    values, _ = mp.eigsy(matrix)
    return [values[index] for index in range(values.rows)]


def interlacing_row(c: int, control: str, level: int, even, odd):
    even_values = eigenvalues(principal(even, level + 1))
    odd_values = eigenvalues(principal(odd, level))
    lower_gaps = [odd_values[j] - even_values[j] for j in range(level)]
    upper_gaps = [even_values[j + 1] - odd_values[j] for j in range(level)]
    all_gaps = lower_gaps + upper_gaps
    scale = max(mp.mpf(1), max(abs(value) for value in even_values + odd_values))
    return {
        "c": c,
        "control": control,
        "N": level,
        "passes": all(gap > 0 for gap in all_gaps),
        "minimum_gap": mp.nstr(min(all_gaps), 30),
        "relative_minimum_gap": mp.nstr(min(all_gaps) / scale, 30),
        "even_ground": mp.nstr(even_values[0], 30),
        "odd_ground": mp.nstr(odd_values[0], 30),
        "even_values": [mp.nstr(value, 20) for value in even_values],
        "odd_values": [mp.nstr(value, 20) for value in odd_values],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-n", type=int, default=12)
    parser.add_argument("--dps", type=int, default=70)
    parser.add_argument("--cutoffs", default="3,5,7,13,17,29,67,100")
    parser.add_argument("--controls", default="zeta,reverse_weights,negate_largest")
    parser.add_argument("--out", default="logs/cvs-parity-interlacing")
    args = parser.parse_args()
    mp.mp.dps = args.dps
    cutoffs = [int(value) for value in args.cutoffs.split(",")]
    controls = args.controls.split(",")
    rows = []
    calibration_error = None
    for c in cutoffs:
        for control in controls:
            print(f"[cvs-parity] c={c} control={control}", flush=True)
            even, odd = build_parity_blocks(c, args.max_n, control)
            if c == 13 and control == "zeta" and args.max_n >= 4:
                observed = eigenvalues(principal(even, 5))
                calibration_error = max(
                    abs(observed[index] - mp.mpf(PUBLISHED_C13_N4_EVEN[index]))
                    for index in range(5)
                )
            for level in range(2, args.max_n + 1):
                rows.append(interlacing_row(c, control, level, even, odd))

    zeta_rows = [row for row in rows if row["control"] == "zeta"]
    control_rows = [row for row in rows if row["control"] != "zeta"]
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dps": args.dps,
        "maximum_n": args.max_n,
        "cutoffs": cutoffs,
        "controls": controls,
        "published_calibration_max_error": mp.nstr(calibration_error, 30),
        "gates": {
            "published_calibration": calibration_error is not None and calibration_error < mp.mpf("1e-24"),
            "zeta_interlacing": all(row["passes"] for row in zeta_rows),
            "some_control_failure": any(not row["passes"] for row in control_rows),
        },
        "rows": rows,
    }
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "parity-interlacing-audit.json").write_text(json.dumps(report, indent=2) + "\n")

    table = "\n".join(
        f"| {row['c']} | {row['control']} | {row['N']} | "
        f"{'PASS' if row['passes'] else 'FAIL'} | {row['minimum_gap']} | "
        f"{row['even_ground']} | {row['odd_ground']} |"
        for row in rows
    )
    gates = report["gates"]
    markdown = f"""# Cutoff-free CvS parity-interlacing audit

Generated: {report['generated_at']}

- published c=13, N=4 calibration: {'PASS' if gates['published_calibration'] else 'FAIL'}
- strict zeta parity interlacing: {'PASS' if gates['zeta_interlacing'] else 'FAIL'}
- at least one arithmetic control breaks interlacing: {'PASS' if gates['some_control_failure'] else 'FAIL'}

| c | source | N | interlaces | minimum gap | even ground | odd ground |
| ---: | --- | ---: | --- | ---: | ---: | ---: |
{table}

Numerical interlacing is a lead, not a theorem.  Promotion requires an exact
matrix identity or oscillation argument and a continuum-gap analysis.
"""
    (out / "parity-interlacing-audit.md").write_text(markdown)
    print(json.dumps(report["gates"], indent=2))


if __name__ == "__main__":
    main()
