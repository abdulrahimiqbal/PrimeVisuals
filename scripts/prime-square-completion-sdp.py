#!/usr/bin/env python3
"""Numerical cone projections for the preregistered prime-square kill test.

Requires numpy, scipy, and cvxpy.  Numerical nonmembership is only a death
candidate; a hard kill requires interval certification of the emitted dual.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import cvxpy as cp
import numpy as np
from scipy.optimize import nnls


def frobenius(left: np.ndarray, right: np.ndarray) -> float:
    return float(np.sum(left * right))


def solve_nnls(target: np.ndarray, atoms: list[dict]) -> dict:
    scale = np.linalg.norm(target)
    columns = np.column_stack([np.asarray(atom["matrix"], dtype=float).reshape(-1) / scale for atom in atoms])
    rhs = target.reshape(-1) / scale
    coefficients, _ = nnls(columns, rhs, maxiter=100 * columns.shape[1])
    projection = (columns @ coefficients).reshape(target.shape)
    residual = projection - rhs.reshape(target.shape)
    margins = columns.T @ residual.reshape(-1)
    return {
        "relativeResidual": float(np.linalg.norm(residual)),
        "dualAtomMinimum": float(np.min(margins)),
        "dualTargetSeparation": float(np.sum(residual * rhs.reshape(target.shape))),
        "activeCoefficients": [
            {"name": atom["name"], "value": float(value)}
            for atom, value in zip(atoms, coefficients)
            if value > 1e-9
        ],
        "dual": residual.tolist(),
    }


def solve_sdp(problem: dict) -> dict:
    raw_target = np.asarray(problem["target"], dtype=float)
    target_scale = np.linalg.norm(raw_target)
    target = raw_target / target_scale
    boundary = np.asarray(problem["boundary"]["matrix"], dtype=float) / target_scale
    edges = [np.asarray(atom["matrix"], dtype=float) / target_scale for atom in problem["edges"]]

    mu = cp.Variable(nonneg=True)
    alpha = cp.Variable(len(edges), nonneg=True)
    expression = mu * boundary
    if edges:
        expression = expression + sum(alpha[index] * matrix for index, matrix in enumerate(edges))

    q_variables = []
    pair_cross = []
    for pair in problem["pairs"]:
        q_var = cp.Variable((3, 3), PSD=True)
        cross = [[np.asarray(pair["cross"][r][s], dtype=float) / target_scale for s in range(3)] for r in range(3)]
        expression = expression + sum(q_var[r, s] * cross[r][s] for r in range(3) for s in range(3))
        q_variables.append(q_var)
        pair_cross.append(cross)

    objective = cp.Minimize(0.5 * cp.sum_squares(expression - target))
    optimization = cp.Problem(objective)
    solver = "CLARABEL"
    try:
        optimization.solve(
            solver=cp.CLARABEL,
            tol_gap_abs=1e-10,
            tol_feas=1e-10,
            tol_gap_rel=1e-10,
            max_iter=2000,
            verbose=False,
        )
    except Exception:
        solver = "SCS"
        optimization.solve(solver=cp.SCS, eps=1e-7, max_iters=200000, verbose=False)

    if expression.value is None:
        return {"status": optimization.status, "solver": solver}

    projection = np.asarray(expression.value, dtype=float)
    residual = projection - target
    boundary_margin = frobenius(residual, boundary)
    edge_margins = [frobenius(residual, matrix) for matrix in edges]
    pair_minimums = []
    for cross in pair_cross:
        adjoint = np.asarray([
            [frobenius(residual, cross[r][s]) for s in range(3)]
            for r in range(3)
        ])
        adjoint = (adjoint + adjoint.T) / 2
        pair_minimums.append(float(np.linalg.eigvalsh(adjoint)[0]))
    all_dual_margins = [boundary_margin, *edge_margins, *pair_minimums]
    q_spectra = []
    for pair, q_var in zip(problem["pairs"], q_variables):
        value = np.asarray(q_var.value, dtype=float)
        q_spectra.append({
            "p": pair["p"],
            "q": pair["q"],
            "eigenvalues": np.linalg.eigvalsh((value + value.T) / 2).tolist(),
        })

    return {
        "status": optimization.status,
        "solver": solver,
        "relativeResidual": float(np.linalg.norm(residual)),
        "dualConeMinimum": float(min(all_dual_margins)),
        "dualTargetSeparation": frobenius(residual, target),
        "mu": float(mu.value),
        "activeEdges": [
            {"name": atom["name"], "value": float(value)}
            for atom, value in zip(problem["edges"], np.asarray(alpha.value).reshape(-1))
            if value > 1e-9
        ],
        "pairGramSpectra": q_spectra,
        "dual": residual.tolist(),
    }


def main() -> None:
    problem_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "logs/prime-square-completion/problems")
    output_dir = problem_dir.parent
    rows = []
    for filename in sorted(problem_dir.glob("problem-N*.json"), key=lambda path: int(path.stem.split("N")[-1])):
        problem = json.loads(filename.read_text())
        target = np.asarray(problem["target"], dtype=float)
        width_one_atoms = [problem["boundary"], *problem["edges"]]
        width_two_atoms = [*width_one_atoms, *problem["squares"]]
        print(f"[prime-square-sdp] N={problem['N']} d={problem['dimension']} pairs={len(problem['pairs'])}", flush=True)
        row = {
            "N": problem["N"],
            "split": problem["split"],
            "dimension": problem["dimension"],
            "primeCount": len(problem["primes"]),
            "pairCount": len(problem["pairs"]),
            "normalization": problem["normalization"],
            "widthOneLP": solve_nnls(target, width_one_atoms),
            "widthTwoLP": solve_nnls(target, width_two_atoms),
            "widthTwoSDP": solve_sdp(problem),
        }
        rows.append(row)
        print(
            f"  residuals w1={row['widthOneLP']['relativeResidual']:.3e} "
            f"w2lp={row['widthTwoLP']['relativeResidual']:.3e} "
            f"w2sdp={row['widthTwoSDP'].get('relativeResidual', float('nan')):.3e}",
            flush=True,
        )

    normalization_pass = all(row["normalization"]["strainPrimeError"] < 1e-10 for row in rows)
    width_one_pass = all(row["widthOneLP"]["relativeResidual"] < 1e-8 for row in rows)
    width_two_lp_pass = all(row["widthTwoLP"]["relativeResidual"] < 1e-8 for row in rows)
    width_two_sdp_pass = all(row["widthTwoSDP"].get("relativeResidual", float("inf")) < 1e-8 for row in rows)
    numerical_death_candidate = any(
        row["widthTwoSDP"].get("relativeResidual", 0) > 1e-7
        and row["widthTwoSDP"].get("dualConeMinimum", -1) >= 1e-7
        and row["widthTwoSDP"].get("dualTargetSeparation", 0) < -1e-7
        for row in rows
    )
    if not normalization_pass:
        verdict = "NORMALIZATION KILL"
    elif width_two_sdp_pass and not width_one_pass:
        verdict = "FINITE WIDTH-TWO SURVIVOR / RESEARCH LEAD ONLY"
    elif width_two_sdp_pass:
        verdict = "FINITE LOCAL CONE SURVIVES BUT WIDTH TWO IS NOT YET NECESSARY"
    elif numerical_death_candidate:
        verdict = "WIDTH-TWO NUMERICAL DEATH CANDIDATE / INTERVAL CERTIFICATE REQUIRED"
    else:
        verdict = "INCONCLUSIVE NUMERICAL CONE TEST"

    report = {
        "generatedAt": rows and json.loads((problem_dir / f"problem-N{rows[0]['N']}.json").read_text())["generatedAt"],
        "rows": rows,
        "gates": {
            "normalizationPass": normalization_pass,
            "widthOnePass": width_one_pass,
            "widthTwoLPPass": width_two_lp_pass,
            "widthTwoSDPPass": width_two_sdp_pass,
            "numericalDeathCandidate": numerical_death_candidate,
        },
        "verdict": verdict,
    }
    (output_dir / "kill-test.json").write_text(json.dumps(report, indent=2) + "\n")

    lines = [
        "# Prime-square completion kill test",
        "",
        "The LP and SDP cones are frozen in `PREREGISTRATION.md`. Numerical",
        "nonmembership is not a hard kill until the dual is interval-certified.",
        "",
        "| N | split | dim | pairs | width 1 LP | width 2 LP | width 2 SDP | SDP dual min | SDP separation |",
        "| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for row in rows:
        sdp = row["widthTwoSDP"]
        lines.append(
            f"| {row['N']} | {row['split']} | {row['dimension']} | {row['pairCount']} | "
            f"{row['widthOneLP']['relativeResidual']:.3e} | "
            f"{row['widthTwoLP']['relativeResidual']:.3e} | "
            f"{sdp.get('relativeResidual', float('nan')):.3e} | "
            f"{sdp.get('dualConeMinimum', float('nan')):.3e} | "
            f"{sdp.get('dualTargetSeparation', float('nan')):.3e} |"
        )
    lines += [
        "",
        f"- normalization: {'PASS' if normalization_pass else 'FAIL'}",
        f"- width-one all-cell feasibility: {'PASS' if width_one_pass else 'FAIL'}",
        f"- strict width-two LP all-cell feasibility: {'PASS' if width_two_lp_pass else 'FAIL'}",
        f"- width-two SDP all-cell feasibility: {'PASS' if width_two_sdp_pass else 'FAIL'}",
        "",
        f"Verdict: **{verdict}**.",
        "",
    ]
    (output_dir / "kill-test.md").write_text("\n".join(lines))
    print(f"[prime-square-sdp] {verdict}")


if __name__ == "__main__":
    main()
