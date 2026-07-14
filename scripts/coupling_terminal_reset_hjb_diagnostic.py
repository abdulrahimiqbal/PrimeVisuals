#!/usr/bin/env python3
"""Reset-aware diagnostic for the item-213 nested terminal phase chain.

This is a floating-point falsification/design program, not a proof
certificate.  It uses the equality-constrained nonlocal transport LP (so
every retained marginal jump is charged) and the nested physical shells

    S_a = {characteristic <= a or separation <= 1/10}.

At a source in shell i, a target in a deeper shell receives the corresponding
continuation weight, a target remaining in shell i keeps the source weight,
and a target in an earlier shell pays that earlier weight.  A target outside
S_.40 pays an abstract recovery weight.  Thus unused returns are included,
unlike in a selected-hazard max-flow calculation.

The script concentrates on the sharp first-shell source
``(m,r)=(3/10,1)``.  It reports the best possible HJB drift for several
small-jump cutoffs and the Pareto curve between progress and recovery exits.

There is an exact reason the hard physical-shell relabeling diverges at this
source.  Here ``(x,y)=(-1/5,4/5)``.  Every outward y-arch jump of size u>0
has ``|y+u|>4/5``, hence cannot remain in ``S_.40`` through the
characteristic branch.  It can remain only through the radius-1/10 tube,
which requires the x target to lie in a bounded interval near ``y+u``.
The complete x capacity of such intervals is finite, whereas the y outward
arch measure of ``0<u<delta`` is infinite because ``J(u)~1/(2u)`` and
``K(4/5)>0``.  Thus an instantaneous hard reset on leaving ``S_.40`` has
infinite intensity.  A legitimate survivor must retain the phase on residual
jumps and use a smooth buffer, or stop only at a buffered macroscopic exit.

Archimedean tails and prime powers are truncated, so no passing value is a
theorem.  A stable failing lower bound, however, is useful as a route
falsifier; promotion of such a bound requires an interval dual certificate.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from math import inf

import numpy as np
from scipy.optimize import linprog
from scipy.sparse import coo_matrix, vstack

import coupling_characteristic_hjb_discovery as base
import coupling_hard_stage_discovery as hard


THRESHOLDS = (0.40, 0.36, 0.32, 0.28, 0.24, 0.20,
              0.15, 0.10, 0.05, 0.00)
TUBE_RADIUS = 0.10
# Finest sharp values reported in item 213 where available.  The first value
# uses the 1,536-bin refinement rather than the coarser grid minimum.
STAGE_RATES = (0.500085106, 0.5005126, 0.5025871, 0.5052208,
               0.5137264, 0.5349648, 0.5635045, 0.6137034,
               0.9358843)
GLOBAL_RETURN_RATE = 0.584582


@dataclass(frozen=True)
class SolveResult:
    drift_ratio: float
    recovery_mass: float
    progress_mass: float
    earlier_mass: float
    same_mass: float


def physical_level(x: float, y: float) -> int:
    """Deepest nested shell containing (x,y), or -1 outside S_.40."""
    if abs(x - y) <= TUBE_RADIUS:
        return len(THRESHOLDS)
    c = base.characteristic(x, y)
    answer = -1
    for index, threshold in enumerate(THRESHOLDS):
        if c <= threshold + 1.0e-13:
            answer = index
    return answer


def success_chain_weights(kappa: float) -> np.ndarray:
    """Minimal weights for the ideal reset-free pure-success chain."""
    weights = np.ones(len(THRESHOLDS) + 1)
    for index in range(len(STAGE_RATES) - 1, -1, -1):
        h = STAGE_RATES[index]
        if not h > kappa:
            raise ValueError(f"stage rate {h} does not exceed kappa={kappa}")
        weights[index] = h / (h - kappa) * weights[index + 1]
    return weights


def transport_constraints(rows, cols):
    nr, nc = len(rows), len(cols)
    indices = np.arange(nr * nc).reshape(nr, nc)
    row_constraint = coo_matrix(
        (np.ones(nr * nc),
         (np.repeat(np.arange(nr), nc), indices.ravel())),
        shape=(nr, nr * nc),
    )
    col_constraint = coo_matrix(
        (np.ones(nr * nc),
         (np.repeat(np.arange(nc), nr), indices.T.ravel())),
        shape=(nc, nr * nc),
    )
    constraints = vstack((row_constraint, col_constraint.tocsr()[:-1])).tocsr()
    rhs = np.array([atom.mass for atom in rows] +
                   [atom.mass for atom in cols[:-1]])
    return constraints, rhs


def solve_source(
    m: float,
    r: float,
    weights: np.ndarray,
    recovery_factor: float,
    recovery_penalty_scale: float = 1.0,
) -> SolveResult:
    x, y = m - r / 2, m + r / 2
    source_level = physical_level(x, y)
    if not 0 <= source_level < len(THRESHOLDS):
        raise ValueError(f"source is not in a nonterminal nested shell: {source_level}")
    source_weight = weights[source_level]

    x_atoms = base.marginal_atoms(x)
    y_atoms = base.marginal_atoms(y)
    mass_x = sum(atom.mass for atom in x_atoms)
    mass_y = sum(atom.mass for atom in y_atoms)
    rows = x_atoms + [base.Atom(x, mass_y, "stay")]
    cols = y_atoms + [base.Atom(y, mass_x, "stay")]
    nr, nc = len(rows), len(cols)

    costs = np.empty((nr, nc))
    labels = np.empty((nr, nc), dtype=np.int16)
    for i, a in enumerate(rows):
        for j, b in enumerate(cols):
            if a.channel == "stay" and b.channel == "stay":
                costs[i, j] = 0.0
                labels[i, j] = source_level
                continue
            level = physical_level(a.target, b.target)
            labels[i, j] = level
            if level < 0:
                target_weight = recovery_factor * weights[0]
                # Scaling this term traces the exact progress/reset Pareto
                # frontier without changing the transition classification.
                costs[i, j] = recovery_penalty_scale * (
                    target_weight - source_weight
                )
            else:
                target_weight = weights[level]
                costs[i, j] = target_weight - source_weight

    constraints, rhs = transport_constraints(rows, cols)
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
    recovery_mass = float(flow[labels < 0].sum())
    progress_mass = float(flow[labels > source_level].sum())
    earlier_mass = float(flow[(labels >= 0) & (labels < source_level)].sum())
    same_mass = float(flow[labels == source_level].sum())
    return SolveResult(
        drift_ratio=float(result.fun / source_weight),
        recovery_mass=recovery_mass,
        progress_mass=progress_mass,
        earlier_mass=earlier_mass,
        same_mass=same_mass,
    )


def configure(cutoff: float, bins: int, target: float, prime_max: int) -> None:
    base.ARCH_MIN_INCREMENT = cutoff
    base.ARCH_BINS_PER_SIGN = bins
    base.ARCH_TARGET = target
    base.PRIME_POWER_MAX = prime_max


def sharp_scan(kappa: float) -> None:
    weights = success_chain_weights(kappa)
    recovery_factor = GLOBAL_RETURN_RATE / (GLOBAL_RETURN_RATE - kappa)
    print("RESET-AWARE SHARP FIRST-SHELL HJB")
    print(f"kappa={kappa:.9f}")
    print(f"recovery_factor={recovery_factor:.12f}")
    print("ideal_success_weight_ratios:",
          [float(weights[i] / weights[i + 1]) for i in range(len(weights)-1)])
    refinements = (
        (0.0100, 72),
        (0.0050, 96),
        (0.0020, 128),
        (0.0010, 160),
        (0.0005, 192),
        (0.0002, 256),
        (0.0001, 320),
    )
    for cutoff, bins in refinements:
        configure(cutoff, bins, 4.0, 1000)
        answer = solve_source(0.30, 1.00, weights, recovery_factor)
        print(
            f"cutoff={cutoff:.7f} bins={bins:4d} "
            f"QW/W={answer.drift_ratio:+.12f} "
            f"QW/W+kappa={answer.drift_ratio+kappa:+.12f} "
            f"exit={answer.recovery_mass:.9f} "
            f"progress={answer.progress_mass:.9f} "
            f"earlier={answer.earlier_mass:.9f}"
        )


def pareto_scan(kappa: float, cutoff: float, bins: int) -> None:
    weights = success_chain_weights(kappa)
    recovery_factor = GLOBAL_RETURN_RATE / (GLOBAL_RETURN_RATE - kappa)
    configure(cutoff, bins, 4.0, 1000)
    print("SHARP PROGRESS/RECOVERY PARETO SCAN")
    print(f"kappa={kappa:.9f} cutoff={cutoff} bins={bins}")
    for penalty in (0.0, 0.01, 0.03, 0.1, 0.3, 1.0, 3.0,
                    10.0, 30.0, 100.0, 300.0, 1000.0):
        answer = solve_source(
            0.30, 1.00, weights, recovery_factor,
            recovery_penalty_scale=penalty,
        )
        print(
            f"penalty={penalty:8.2f} exit={answer.recovery_mass:.12f} "
            f"progress={answer.progress_mass:.12f} "
            f"weighted_objective={answer.drift_ratio:+.12f}"
        )


def buffer_stage_scan() -> None:
    """Discovery scan for the proposed extra S_.43 -> S_.40 node."""
    configure(0.002, 160, 4.0, 1000)
    target = hard.union(
        hard.characteristic_sublevel(0.40 + 1.0e-12),
        hard.tube(TUBE_RADIUS + 1.0e-12),
    )
    points: list[tuple[float, float]] = []
    for m in np.arange(0.0, 0.451, 0.025):
        for r in (0.11, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60,
                  0.70, 0.80, 0.90, 1.00, 1.10, 1.20, 1.30,
                  1.40, 1.50, 1.60, 1.70, 1.80):
            x, y = m-r/2, m+r/2
            c = base.characteristic(x, y)
            if 0.40 < c <= 0.43 + 1.0e-12:
                points.append((float(m), float(r)))
    # The outward continuation of the old sharp source is more informative
    # than a 0.025 midpoint grid.
    for epsilon in (0.0001, 0.0005, 0.001, 0.002, 0.005,
                    0.010, 0.020, 0.030, 0.040, 0.050, 0.075,
                    0.100, 0.150, 0.200):
        x, y = -0.2, 0.8 + 2 * epsilon
        points.append(((x+y)/2, y-x))
    points = list(dict.fromkeys(points))
    worst = (inf, None)
    print("BUFFER STAGE S_.43 -> S_.40")
    for m, r in points:
        answer = hard.solve_entry(m, r, target)
        if answer.rate < worst[0]:
            worst = (answer.rate, (m, r, base.characteristic(m-r/2,m+r/2)))
        if abs(m - 0.30) < 0.031 and r >= 1.0:
            print(
                f"  sharp-ray m={m:.7f} r={r:.7f} "
                f"c={base.characteristic(m-r/2,m+r/2):.7f} "
                f"rate={answer.rate:.12f}"
            )
    print(f"  point_count={len(points)}")
    print(f"  sampled_minimum={worst[0]:.12f} point={worst[1]}")

    # Can the sharp S_.40 -> S_.36 clock itself survive on a larger buffer?
    # This is the condition needed by item 178 to make its exit factor small,
    # rather than merely inserting a preceding S_.43 -> S_.40 edge.
    lower_target = hard.union(
        hard.characteristic_sublevel(0.36 + 1.0e-12),
        hard.tube(TUBE_RADIUS + 1.0e-12),
    )
    print("BUFFERED SHARP CLOCK target S_.36")
    for epsilon in (0.0, 0.0001, 0.0005, 0.001, 0.002, 0.005,
                    0.010, 0.020, 0.030, 0.040, 0.050, 0.075,
                    0.100, 0.150, 0.200):
        x, y = -0.2, 0.8 + 2 * epsilon
        m, r = (x+y)/2, y-x
        answer = hard.solve_entry(m, r, lower_target)
        print(
            f"  c={base.characteristic(x,y):.7f} "
            f"rate={answer.rate:.12f}"
        )


def buffered_first_hjb_scan(kappa: float) -> None:
    """Optimistic HJB for S_.40->S_.36 inside an S_.41 buffer.

    Progress is assigned value zero (more favorable than the real remaining
    chain).  An exit from S_.41 is assigned the moment factor of an optimistic
    exact return clock.  Two return rates are displayed: item 175's much
    stronger global one-core rate and the sampled local S_.43->S_.40 rate.
    """

    def one(cutoff: float, bins: int, return_rate: float):
        configure(cutoff, bins, 4.0, 1000)
        x, y = -0.2, 0.8
        x_atoms = base.marginal_atoms(x)
        y_atoms = base.marginal_atoms(y)
        mass_x = sum(atom.mass for atom in x_atoms)
        mass_y = sum(atom.mass for atom in y_atoms)
        rows = x_atoms + [base.Atom(x, mass_y, "stay")]
        cols = y_atoms + [base.Atom(y, mass_x, "stay")]
        recovery = return_rate / (return_rate - kappa)
        nr, nc = len(rows), len(cols)
        costs = np.empty((nr, nc))
        labels = np.empty((nr, nc), dtype=np.int8)
        # label 1=progress S_.36, 0=safe S_.41, -1=buffer exit.
        for i, a in enumerate(rows):
            for j, b in enumerate(cols):
                if a.channel == "stay" and b.channel == "stay":
                    labels[i, j] = 0
                    costs[i, j] = 0.0
                    continue
                if abs(a.target-b.target) <= TUBE_RADIUS or \
                        base.characteristic(a.target,b.target) <= 0.36+1e-13:
                    labels[i, j] = 1
                    costs[i, j] = -1.0  # optimistic zero continuation
                elif base.characteristic(a.target,b.target) <= 0.41+1e-13:
                    labels[i, j] = 0
                    costs[i, j] = 0.0
                else:
                    labels[i, j] = -1
                    costs[i, j] = recovery - 1.0
        constraints, rhs = transport_constraints(rows, cols)
        result = linprog(costs.ravel(), A_eq=constraints, b_eq=rhs,
                         bounds=(0.0,None), method="highs",
                         options={"dual_feasibility_tolerance":1e-9,
                                  "primal_feasibility_tolerance":1e-9})
        if not result.success:
            raise RuntimeError(result.message)
        flow = result.x.reshape(nr,nc)
        return (result.fun, float(flow[labels < 0].sum()),
                float(flow[labels > 0].sum()), recovery)

    def constrained_exit(cutoff: float, bins: int, required: float):
        """Minimum S_.41 exit mass subject to a required S_.36 flow."""
        configure(cutoff, bins, 4.0, 1000)
        x, y = -0.2, 0.8
        x_atoms = base.marginal_atoms(x)
        y_atoms = base.marginal_atoms(y)
        mass_x = sum(atom.mass for atom in x_atoms)
        mass_y = sum(atom.mass for atom in y_atoms)
        rows = x_atoms + [base.Atom(x, mass_y, "stay")]
        cols = y_atoms + [base.Atom(y, mass_x, "stay")]
        nr,nc=len(rows),len(cols)
        progress=np.zeros((nr,nc)); exits=np.zeros((nr,nc))
        for i,a in enumerate(rows):
            for j,b in enumerate(cols):
                if a.channel=="stay" and b.channel=="stay":
                    continue
                c=base.characteristic(a.target,b.target)
                tube=abs(a.target-b.target)<=TUBE_RADIUS
                if tube or c<=.36+1e-13:
                    progress[i,j]=1.0
                elif c>.41+1e-13:
                    exits[i,j]=1.0
        constraints,rhs=transport_constraints(rows,cols)
        result=linprog(exits.ravel(),A_ub=-progress.reshape(1,-1),
                       b_ub=np.array([-required]),A_eq=constraints,b_eq=rhs,
                       bounds=(0,None),method="highs",
                       options={"dual_feasibility_tolerance":1e-9,
                                "primal_feasibility_tolerance":1e-9})
        if not result.success:
            return None
        flow=result.x.reshape(nr,nc)
        return (result.fun,float((flow*progress).sum()))

    print("OPTIMISTIC BUFFERED FIRST-STAGE HJB S_.41 domain")
    for return_rate, label in ((GLOBAL_RETURN_RATE, "global-.584582"),
                               (0.5000416, "local-.5000416")):
        print(f"  return={label}")
        for cutoff,bins in ((.01,72),(.005,96),(.002,128),(.001,160),
                            (.0005,192),(.0002,256),(.0001,320)):
            objective,exit_mass,progress,recovery = one(
                cutoff,bins,return_rate
            )
            print(
                f"    cutoff={cutoff:.7f} QW/W={objective:+.12f} "
                f"plus_kappa={objective+kappa:+.12f} "
                f"exit={exit_mass:.12f} progress={progress:.12f} "
                f"R={recovery:.6f}"
            )
    print("  constrained progress/exit Pareto")
    for required in (.4999, .5, .50002, .500033, .50005):
        values=[]
        for cutoff,bins in ((.002,128),(.001,160),(.0005,192),
                            (.0002,256),(.0001,320)):
            values.append((cutoff,constrained_exit(cutoff,bins,required)))
        print(f"    required={required:.6f} values={values}")


def smooth_two_subphase_scan(kappa: float, refine: bool = True) -> None:
    """Search a smooth phase-A buffer with explicit phase-B success value."""
    h = STAGE_RATES[0]
    rho = (h-kappa)/h
    original_phase=base.phase
    configure(.003,48,3.0,300)

    points=[]
    # Near-boundary rays, same-sign shoulders, and nonlocal-return probes.
    for c in (.361,.37,.38,.39,.40,.405,.41,.42,.43,.45,.48,.52,.60,
              .75,1.0,1.25,1.5):
        # Opposite-sign continuation of the sharp point when possible.
        x=-.2; y=2*c
        points.append(((x+y)/2,y-x))
    points += [(0,.4),(0,.8),(0,1.2),(.1,.8),(.2,.4),(.2,1.2),
               (.3,.6),(.3,1.0),(.4,.8),(.5,.4),(.5,1.0),
               (.6,.2),(.6,1.2),(.8,.2),(.8,.8),(1.0,.4),
               (1.0,1.2),(1.2,.4),(1.5,.2),(1.5,1.0)]
    points=[(m,r) for m,r in points
            if base.characteristic(m-r/2,m+r/2)>.36+1e-9]
    points=list(dict.fromkeys(points))

    def make_phase(c0,c1,amplitude):
        def stopped(x,y,ramps=()):
            del ramps
            c=base.characteristic(x,y)
            if abs(x-y)<=TUBE_RADIUS+1e-12 or c<=.36+1e-12:
                return rho
            t=(c-c0)/(c1-c0)
            return 1.0+amplitude*base.smoothstep(t)
        return stopped

    candidates=[]
    for c0,c1 in ((.402,.41),(.405,.42),(.405,.43),
                  (.40,.45),(.40,.50),(.40,.70),(.40,1.0),
                  (.40,1.5),(.40,2.0)):
        for amplitude in (.01,.03,.1,.2,.3,.5,.7,1.0,1.5,4.0):
            base.phase=make_phase(c0,c1,amplitude)
            worst=(-inf,None)
            for m,r in points:
                value=base.solve_cell(m,r,(),verbose=False)["objective"]
                if value>worst[0]: worst=(value,(m,r))
                # Early rejection keeps the search inexpensive.
                if value+kappa>.005:
                    break
            candidates.append((worst[0]+kappa,c0,c1,amplitude,worst))
    base.phase=original_phase
    candidates.sort()
    print("SMOOTH TWO-SUBPHASE HJB SEARCH")
    print(f"  kappa={kappa} next/source_ratio={rho:.12f} points={len(points)}")
    for row in candidates[:15]:
        print(" ",row)

    if not refine:
        return
    # Re-evaluate the best candidate without early rejection at two cutoffs.
    _margin,c0,c1,amplitude,_worst=candidates[0]
    for cutoff,bins in ((.002,160),(.0005,256),(.0001,384)):
        configure(cutoff,bins,5.0,5000)
        base.phase=make_phase(c0,c1,amplitude)
        values=[]
        for m,r in points:
            values.append((base.solve_cell(m,r,(),verbose=False)["objective"],m,r))
        values.sort(reverse=True)
        print(f"  refine cutoff={cutoff} bins={bins} worst={values[:5]}")
    base.phase=original_phase


def gate5_bypass_audit(kappa: float) -> None:
    """Print the exact item-176/item-178 restart requirement."""
    epsilon=0.5-kappa
    lam=0.5-epsilon/2
    moment=lam/(lam-kappa)
    required=1/moment
    print("ITEM-176 GLOBAL RETURN / ITEM-178 RETRY ALGEBRA")
    print(f"  kappa={kappa:.12f}")
    print(f"  epsilon=1/2-kappa={epsilon:.12f}")
    print(f"  lambda=1/2-epsilon/2={lam:.12f}")
    print(f"  M=lambda/(lambda-kappa)={moment:.12f}")
    print(f"  required_q<1/M=epsilon/(1-epsilon)={required:.12f}")
    print("  hypotheses: exact success clock valid to exhausting exits;")
    print("              uniform residual finite-horizon compact containment;")
    print("              item-176 return to the same compact entry set;")
    print("              fresh randomness and strong-Markov restart.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kappa", type=float, default=0.499)
    parser.add_argument("--sharp", action="store_true")
    parser.add_argument("--pareto", action="store_true")
    parser.add_argument("--cutoff", type=float, default=0.0005)
    parser.add_argument("--bins", type=int, default=192)
    parser.add_argument("--buffer", action="store_true")
    parser.add_argument("--buffer-only", action="store_true")
    parser.add_argument("--buffer-hjb", action="store_true")
    parser.add_argument("--smooth", action="store_true")
    parser.add_argument("--smooth-quick", action="store_true")
    parser.add_argument("--gate5", action="store_true")
    args = parser.parse_args()
    if not 0 < args.kappa < 0.5:
        raise ValueError("need 0 < kappa < 1/2")
    actions=(args.sharp or args.pareto or args.buffer or args.buffer_only or
             args.buffer_hjb or args.smooth or args.smooth_quick or args.gate5)
    if args.sharp or not actions:
        sharp_scan(args.kappa)
    if args.pareto:
        pareto_scan(args.kappa, args.cutoff, args.bins)
    if args.buffer or args.buffer_only:
        buffer_stage_scan()
    if args.buffer_hjb:
        buffered_first_hjb_scan(args.kappa)
    if args.smooth:
        smooth_two_subphase_scan(args.kappa)
    if args.smooth_quick:
        smooth_two_subphase_scan(args.kappa,False)
    if args.gate5:
        gate5_bypass_audit(args.kappa)


if __name__ == "__main__":
    main()
