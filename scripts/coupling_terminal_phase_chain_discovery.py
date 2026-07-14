#!/usr/bin/env python3
"""Discovery audit for the nested terminal hard-phase chain.

This is a floating-point primal/dual diagnostic, not a proof certificate.
For

    S_a = {(u,v): characteristic(u,v) <= a or |u-v| <= 1/10},

the numerically sharp first proposed edge is ``S_.40 -> S_.36`` at
``(m,r)=(3/10,1)``, i.e. ``(x,y)=(-1/5,4/5)``.  The script does three
reproducible checks:

* ``--sharp`` refines the logarithmic arch quadrature and prints the apparent
  limiting max-flow/min-cut value;
* ``--ledger`` prints the broad-channel primal ledger and the integral dual
  cover returned by HiGHS at the finest displayed resolution;
* ``--grid`` scans the symmetry-reduced compact point grid used to locate the
  sharp source for every adjacent threshold in ``THRESHOLDS``.

The continuum Hall inequalities, uniform source boxes, tail completion, and
the exit/return renewal ledger remain unproved.  In particular, no value
printed here may be used as an exact ``>1/2`` certificate.

Reproduce the quick sharp audit with

    PYTHONPATH=/tmp/pvdeps:scripts python3 -u \
      scripts/coupling_terminal_phase_chain_discovery.py --sharp --ledger

and the wider point scan with ``--grid``.
"""

from __future__ import annotations

import argparse
from collections import defaultdict

import coupling_characteristic_hjb_discovery as base
import coupling_hard_stage_discovery as hard


TUBE_RADIUS = 0.1
SHARP_UPPER = 0.40
SHARP_LOWER = 0.36
SHARP_POINT = (0.30, 1.00)
THRESHOLDS = (0.40, 0.36, 0.32, 0.28, 0.24, 0.20,
              0.15, 0.10, 0.05, 0.00)
REFINEMENTS = (
    (0.0200, 64),
    (0.0100, 96),
    (0.0050, 128),
    (0.0020, 192),
    (0.0010, 256),
    (0.0005, 320),
    (0.0002, 384),
    (0.0001, 512),
    (0.000001, 640),
    (0.000001, 768),
    (0.000001, 1024),
    (0.000001, 1280),
    (0.000001, 1536),
)


def target(level: float):
    # Tiny boundary padding only compensates binary conversion in this
    # floating diagnostic.  An exact certificate must choose half-open
    # ownership and prove its boundary geometry separately.
    return hard.union(
        hard.characteristic_sublevel(level + 1.0e-12),
        hard.tube(TUBE_RADIUS + 1.0e-12),
    )


def configure(cutoff: float, bins: int) -> None:
    base.ARCH_MIN_INCREMENT = cutoff
    base.ARCH_BINS_PER_SIGN = bins
    base.PRIME_POWER_MAX = 100


def sharp_audit() -> None:
    print("SHARP S_.40 -> S_.36 AT (m,r)=(.3,1)")
    for cutoff, bins in REFINEMENTS:
        configure(cutoff, bins)
        answer = hard.solve_entry(*SHARP_POINT, target(SHARP_LOWER))
        print(
            f"  cutoff={cutoff:.6g} bins={bins:4d} "
            f"primal={answer.rate:.15f} dual={answer.dual_bound:.15f}"
        )


def broad(channel: str) -> str:
    if channel.startswith("arch") or channel == "stay":
        return channel
    return channel


def ledger_audit() -> None:
    cutoff, bins = REFINEMENTS[-1]
    configure(cutoff, bins)
    answer = hard.solve_entry(*SHARP_POINT, target(SHARP_LOWER))
    grouped: dict[tuple[str, str], float] = defaultdict(float)
    stored = 0.0
    for amount, x_channel, y_channel, _u, _v in answer.flows:
        grouped[(broad(x_channel), broad(y_channel))] += amount
        stored += amount

    print("FINE PRIMAL GROUPED LEDGER")
    print(f"  cutoff={cutoff:.6g} bins={bins}")
    print(f"  objective={answer.rate:.15f}")
    print(f"  stored_flows_above_1e-7={stored:.15f}")
    for channels, amount in sorted(
        grouped.items(), key=lambda item: item[1], reverse=True
    ):
        print(f"  {channels[0]:>10s} x {channels[1]:<10s} {amount:.15f}")

    print("FINE INTEGRAL DUAL COVER (quadrature atoms only)")
    x_mass = sum(entry[3] for entry in answer.dual_rows)
    y_mass = sum(entry[3] for entry in answer.dual_cols)
    print(
        f"  x_nodes={len(answer.dual_rows)} x_mass={x_mass:.15f} "
        f"y_nodes={len(answer.dual_cols)} y_mass={y_mass:.15f} "
        f"total={x_mass + y_mass:.15f}"
    )
    for side, entries in (("x", answer.dual_rows),
                          ("y", answer.dual_cols)):
        by_channel: dict[str, list[float]] = defaultdict(list)
        channel_mass: dict[str, float] = defaultdict(float)
        for weight, channel, point, mass in entries:
            assert abs(weight - 1.0) < 1.0e-7
            by_channel[broad(channel)].append(point)
            channel_mass[broad(channel)] += mass
        for channel in sorted(by_channel):
            points = by_channel[channel]
            print(
                f"  {side}:{channel:<10s} nodes={len(points):4d} "
                f"range=[{min(points):+.9f},{max(points):+.9f}] "
                f"mass={channel_mass[channel]:.15f}"
            )


def diagnostic_grid() -> list[tuple[float, float, float]]:
    points: list[tuple[float, float, float]] = []
    midpoint_values = [index / 40 for index in range(17)]
    separation_values = (
        0.11, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70,
        0.80, 0.90, 1.00, 1.10, 1.20, 1.30, 1.40, 1.50, 1.60,
    )
    for midpoint in midpoint_values:
        for separation in separation_values:
            x = midpoint - separation / 2
            y = midpoint + separation / 2
            characteristic = base.characteristic(x, y)
            if characteristic <= SHARP_UPPER + 1.0e-12:
                points.append((midpoint, separation, characteristic))
    return points


def grid_audit() -> None:
    configure(0.002, 160)
    points = diagnostic_grid()
    print(f"GRID POINTS IN S_.40: {len(points)}")
    for upper, lower in zip(THRESHOLDS, THRESHOLDS[1:]):
        entry_target = target(lower)
        worst_rate = float("inf")
        worst_point = None
        for midpoint, separation, characteristic in points:
            if characteristic <= lower + 1.0e-12:
                continue
            if characteristic > upper + 1.0e-12:
                continue
            answer = hard.solve_entry(midpoint, separation, entry_target)
            if answer.rate < worst_rate:
                worst_rate = answer.rate
                worst_point = (midpoint, separation, characteristic)
        print(
            f"  S_{upper:.2f}->S_{lower:.2f} "
            f"minimum={worst_rate:.15f} point={worst_point}"
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sharp", action="store_true")
    parser.add_argument("--ledger", action="store_true")
    parser.add_argument("--grid", action="store_true")
    args = parser.parse_args()
    if not (args.sharp or args.ledger or args.grid):
        args.sharp = True
        args.ledger = True
    if args.sharp:
        sharp_audit()
    if args.ledger:
        ledger_audit()
    if args.grid:
        grid_audit()


if __name__ == "__main__":
    main()
