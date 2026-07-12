#!/usr/bin/env python3
"""Optimized numeric calibration for Polymath8b M_(50,1/25), degree 27.

This deliberately avoids rational objects in the dense matrices.  Exact
factorial orbit weights are cached as Python integers, matrix blocks are
filled with NumPy, and the marginal matrix is factored as k*T.T*H*T with T
sparse.  A spectral cutoff of the I Gram matrix is explicit in every output;
the resulting vector is only a proposal until exact Rayleigh evaluation.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import pickle
import time
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
import scipy.linalg
import scipy.sparse
import scipy.special


K = 50
EPSILON_DENOMINATOR = 25
EPSILON = 1.0 / 25.0
SUPPORT_SCALE = 1.0 + EPSILON
MARGINAL_SCALE = 1.0 - EPSILON
TWICE_EPSILON = 2.0 * EPSILON
DEGREE = 27
ARTIFACT_STEM = "d27-numeric"


def even_signatures(maximum_degree: int, maximum_length: int) -> list[tuple[int, ...]]:
    output: list[tuple[int, ...]] = [()]
    current: list[int] = []

    def visit(remaining: int, maximum_part: int) -> None:
        top = min(remaining - remaining % 2, maximum_part)
        for part in range(top, 1, -2):
            current.append(part)
            output.append(tuple(current))
            if len(current) < maximum_length:
                visit(remaining - part, part)
            current.pop()

    visit(maximum_degree, maximum_degree - maximum_degree % 2)
    output.sort(key=lambda signature: (sum(signature), len(signature), signature))
    return output


def signature_basis(k: int, maximum_degree: int) -> list[tuple[int, tuple[int, ...]]]:
    output = []
    for signature in even_signatures(maximum_degree, k):
        signature_degree = sum(signature)
        for slack_power in range(maximum_degree - signature_degree + 1):
            output.append((slack_power, signature))
    output.sort(key=lambda item: (item[0] + sum(item[1]), sum(item[1]), item[0], item[1]))
    return output


FACTORIAL = [math.factorial(index) for index in range(2 * (K + DEGREE + 2) + 1)]


def orbit_size(k: int, signature: tuple[int, ...]) -> int:
    counts = Counter(signature)
    counts[0] = k - len(signature)
    denominator = 1
    for count in counts.values():
        denominator *= FACTORIAL[count]
    return FACTORIAL[k] // denominator


WEIGHT_CACHE: dict[tuple[int, tuple[int, ...], tuple[int, ...]], int] = {}


def product_factorial_weight(
    k: int,
    alpha: tuple[int, ...],
    beta: tuple[int, ...],
) -> int:
    """Compute W_k(alpha,beta) by a labelled-part/subset DP."""
    # W is symmetric.  Put the shorter signature in the subset mask.
    if (len(alpha), alpha) > (len(beta), beta):
        alpha, beta = beta, alpha
    key = (k, alpha, beta)
    cached = WEIGHT_CACHE.get(key)
    if cached is not None:
        return cached

    length = len(alpha)
    zero_slots = k - length
    baseline = math.prod(FACTORIAL[part] for part in alpha)
    # Each beta part is temporarily labelled.  Divide by multiplicity
    # factorials at the end to recover distinct beta-orbit assignments.
    states: dict[int, int] = {0: baseline}
    for processed, exponent in enumerate(beta):
        next_states: dict[int, int] = defaultdict(int)
        exponent_factorial = FACTORIAL[exponent]
        for mask, value in states.items():
            used_alpha = mask.bit_count()
            used_zero = processed - used_alpha
            available_zero = zero_slots - used_zero
            if available_zero > 0:
                next_states[mask] += value * available_zero * exponent_factorial
            available_mask = ((1 << length) - 1) ^ mask
            while available_mask:
                bit = available_mask & -available_mask
                coordinate = bit.bit_length() - 1
                ratio = FACTORIAL[alpha[coordinate] + exponent] // FACTORIAL[alpha[coordinate]]
                next_states[mask | bit] += value * ratio
                available_mask ^= bit
        states = next_states

    labelled_total = sum(states.values())
    multiplicity_divisor = math.prod(FACTORIAL[count] for count in Counter(beta).values())
    value = orbit_size(k, alpha) * (labelled_total // multiplicity_divisor)
    WEIGHT_CACHE[key] = value
    return value


def grouped_items(items: list[tuple[int, tuple[int, ...]]]):
    groups: dict[tuple[int, ...], list[tuple[int, int]]] = defaultdict(list)
    for index, (slack_power, signature) in enumerate(items):
        groups[signature].append((index, slack_power))
    return groups


def fill_moment_matrix(
    items: list[tuple[int, tuple[int, ...]]],
    dimension: int,
    scale: float,
    label: str,
    dtype=np.float64,
) -> np.ndarray:
    """Fill integral (scale-S)^(a+b) P_alpha P_beta in signature blocks."""
    started = time.time()
    matrix = np.empty((len(items), len(items)), dtype=dtype, order="F")
    groups = grouped_items(items)
    signatures = list(groups)
    log_scale = math.log(scale)
    block_count = len(signatures) * (len(signatures) + 1) // 2
    completed = 0
    for left_position, left_signature in enumerate(signatures):
        left_group = groups[left_signature]
        left_indices = np.fromiter((item[0] for item in left_group), dtype=np.int64)
        left_slack = np.fromiter((item[1] for item in left_group), dtype=np.int64)
        for right_position in range(left_position + 1):
            right_signature = signatures[right_position]
            right_group = groups[right_signature]
            right_indices = np.fromiter((item[0] for item in right_group), dtype=np.int64)
            right_slack = np.fromiter((item[1] for item in right_group), dtype=np.int64)
            weight = product_factorial_weight(dimension, left_signature, right_signature)
            slack = left_slack[:, None] + right_slack[None, :]
            total_degree = dimension + sum(left_signature) + sum(right_signature) + slack
            if dtype == np.longdouble:
                values = np.empty(slack.shape, dtype=np.longdouble)
                for local_row in range(slack.shape[0]):
                    for local_column in range(slack.shape[1]):
                        r = int(slack[local_row, local_column])
                        total = int(total_degree[local_row, local_column])
                        values[local_row, local_column] = (
                            np.longdouble(weight)
                            * np.longdouble(FACTORIAL[r])
                            / np.longdouble(FACTORIAL[total])
                            * np.longdouble(scale) ** total
                        )
            else:
                log_values = (
                    math.log(weight)
                    + scipy.special.gammaln(slack + 1)
                    - scipy.special.gammaln(total_degree + 1)
                    + total_degree * log_scale
                )
                values = np.exp(log_values)
            matrix[np.ix_(left_indices, right_indices)] = values
            if left_position != right_position:
                matrix[np.ix_(right_indices, left_indices)] = values.T
            completed += 1
        if left_position % 25 == 0 or left_position + 1 == len(signatures):
            print(
                f"[{label}] signature {left_position + 1}/{len(signatures)}; "
                f"blocks {completed}/{block_count}; weights {len(WEIGHT_CACHE)}; "
                f"{time.time() - started:.1f}s",
                flush=True,
            )
    return matrix


def marginal_expansion(
    basis: list[tuple[int, tuple[int, ...]]],
) -> tuple[list[tuple[int, tuple[int, ...]]], scipy.sparse.csc_matrix]:
    columns: list[dict[tuple[int, tuple[int, ...]], float]] = []
    all_terms: set[tuple[int, tuple[int, ...]]] = set()
    for slack_power, signature in basis:
        column: dict[tuple[int, tuple[int, ...]], float] = defaultdict(float)
        exponents = sorted(set(signature) | ({0} if len(signature) < K else set()))
        for exponent in exponents:
            if exponent == 0:
                remaining = signature
            else:
                remaining_list = list(signature)
                remaining_list.remove(exponent)
                remaining = tuple(remaining_list)
            resulting_slack = slack_power + exponent + 1
            beta_coefficient = (
                FACTORIAL[slack_power]
                * FACTORIAL[exponent]
                / FACTORIAL[resulting_slack]
            )
            for output_slack in range(resulting_slack + 1):
                coefficient = (
                    beta_coefficient
                    * math.comb(resulting_slack, output_slack)
                    * TWICE_EPSILON ** (resulting_slack - output_slack)
                )
                key = (output_slack, remaining)
                column[key] += coefficient
                all_terms.add(key)
        columns.append(column)

    terms = sorted(all_terms, key=lambda item: (item[0] + sum(item[1]), sum(item[1]), item[0], item[1]))
    row_index = {term: index for index, term in enumerate(terms)}
    rows: list[int] = []
    columns_index: list[int] = []
    data: list[float] = []
    for column_index, column in enumerate(columns):
        for term, coefficient in column.items():
            rows.append(row_index[term])
            columns_index.append(column_index)
            data.append(coefficient)
    transform = scipy.sparse.csc_matrix(
        (np.asarray(data), (np.asarray(rows), np.asarray(columns_index))),
        shape=(len(terms), len(basis)),
    )
    return terms, transform


def build_matrices(work_directory: Path) -> dict:
    started = time.time()
    basis = signature_basis(K, DEGREE)
    print(f"[basis] {len(basis)} directions", flush=True)
    if len(basis) != 2526:
        raise RuntimeError(f"Expected 2526 directions, found {len(basis)}")

    i_raw = fill_moment_matrix(basis, K, SUPPORT_SCALE, "I")
    diagonal = np.diag(i_raw).copy()
    if not np.all(diagonal > 0):
        raise RuntimeError("I has a non-positive diagonal")
    inverse_sqrt_diagonal = 1.0 / np.sqrt(diagonal)
    i_scaled = i_raw * inverse_sqrt_diagonal[:, None] * inverse_sqrt_diagonal[None, :]
    del i_raw
    np.save(work_directory / "I-scaled.npy", i_scaled)
    np.save(work_directory / "I-diagonal.npy", diagonal)
    print(f"[I] saved; {time.time() - started:.1f}s", flush=True)

    marginal_terms, transform = marginal_expansion(basis)
    print(
        f"[marginal] {len(marginal_terms)} terms; T nnz={transform.nnz}; "
        f"density={transform.nnz / (transform.shape[0] * transform.shape[1]):.6f}",
        flush=True,
    )
    h_raw = fill_moment_matrix(marginal_terms, K - 1, MARGINAL_SCALE, "H")
    transform_scaled = transform @ scipy.sparse.diags(inverse_sqrt_diagonal)
    multiply_started = time.time()
    # Sparse-dense products cost O(nnz(T)*dimension), not O(m^2*n).
    left = transform_scaled.T @ h_raw
    print(f"[A] T.T@H {time.time() - multiply_started:.1f}s", flush=True)
    a_scaled = K * (transform_scaled.T @ left.T).T
    a_scaled = np.asarray(a_scaled)
    a_scaled = (a_scaled + a_scaled.T) / 2.0
    print(f"[A] assembled {time.time() - multiply_started:.1f}s", flush=True)
    np.save(work_directory / "A-scaled.npy", a_scaled)
    del h_raw, left, a_scaled

    basis_payload = [
        {"index": index, "slackPower": slack, "signature": list(signature)}
        for index, (slack, signature) in enumerate(basis)
    ]
    (work_directory / "basis.json").write_text(json.dumps(basis_payload) + "\n")
    with (work_directory / "weights.pkl").open("wb") as handle:
        pickle.dump(WEIGHT_CACHE, handle, protocol=pickle.HIGHEST_PROTOCOL)
    return {
        "basisDimension": len(basis),
        "marginalDimension": len(marginal_terms),
        "transformNonzeros": int(transform.nnz),
        "weightCacheSize": len(WEIGHT_CACHE),
        "buildSeconds": time.time() - started,
    }


def solve_matrices(work_directory: Path, cutoffs: list[float]) -> dict:
    started = time.time()
    i_scaled = np.load(work_directory / "I-scaled.npy", mmap_mode=None)
    a_scaled = np.load(work_directory / "A-scaled.npy", mmap_mode=None)
    basis = json.loads((work_directory / "basis.json").read_text())
    print("[solve] diagonalize scaled I", flush=True)
    i_values, i_vectors = scipy.linalg.eigh(i_scaled, driver="evr", check_finite=False)
    i_min = float(i_values[0])
    i_max = float(i_values[-1])
    negative = int(np.count_nonzero(i_values <= 0))
    print(
        f"[solve] I spectrum min={i_min:.3e} max={i_max:.3e}; nonpositive={negative}",
        flush=True,
    )
    candidates = []
    diagonal = np.load(work_directory / "I-diagonal.npy")
    for cutoff in cutoffs:
        keep = i_values > cutoff * i_max
        rank = int(np.count_nonzero(keep))
        whitening = i_vectors[:, keep] / np.sqrt(i_values[keep])[None, :]
        compressed = whitening.T @ a_scaled @ whitening
        compressed = (compressed + compressed.T) / 2.0
        largest_value, largest_vector = scipy.linalg.eigh(
            compressed,
            subset_by_index=[rank - 1, rank - 1],
            driver="evr",
            check_finite=False,
        )
        quotient = float(largest_value[0])
        z = whitening @ largest_vector[:, 0]
        denominator = float(z @ i_scaled @ z)
        numerator = float(z @ a_scaled @ z)
        generalized_residual = np.linalg.norm(a_scaled @ z - quotient * (i_scaled @ z))
        original_coefficients = z / np.sqrt(diagonal)
        original_coefficients /= np.max(np.abs(original_coefficients))
        candidate_path = work_directory / f"candidate-cutoff-{cutoff:.0e}.npy"
        np.save(candidate_path, original_coefficients)
        row = {
            "cutoff": cutoff,
            "rank": rank,
            "quotient": quotient,
            "directQuotient": numerator / denominator,
            "denominator": denominator,
            "generalizedResidual": float(generalized_residual),
            "candidatePath": str(candidate_path),
        }
        row["stable"] = (
            abs(row["quotient"] - row["directQuotient"]) < 1e-3
            and abs(row["denominator"] - 1.0) < 1e-3
            and row["generalizedResidual"] < 1e-5
        )
        candidates.append(row)
        print(f"[solve] {row}", flush=True)

    stable_candidates = [row for row in candidates if row["stable"]]
    best_stable = max(stable_candidates, key=lambda row: row["directQuotient"]) \
        if stable_candidates else None
    rejected = [row for row in candidates if not row["stable"]]
    coefficient_source = best_stable or min(
        candidates,
        key=lambda row: abs(row["quotient"] - row["directQuotient"]),
    )
    coefficients = np.load(coefficient_source["candidatePath"])
    candidate_payload = {
        "k": K,
        "epsilon": f"1/{EPSILON_DENOMINATOR}",
        "degree": DEGREE,
        "dimension": len(basis),
        "iSpectrum": {
            "minimum": i_min,
            "maximum": i_max,
            "nonpositive": negative,
            "conditionEstimatePositive": i_max / i_values[negative] if negative < len(i_values) else None,
        },
        "candidates": candidates,
        "bestStable": best_stable,
        "rejectedUnstable": rejected,
        "coefficientSource": coefficient_source,
        "coefficients": [
            {
                **basis[index],
                "coefficient": float(coefficients[index]),
                "scaledMagnitude": float(abs(coefficients[index]) * math.sqrt(diagonal[index])),
            }
            for index in range(len(basis))
        ],
        "solveSeconds": time.time() - started,
    }
    output_path = Path(
        f"logs/atlas-next-frontiers/free-boundary-maynard-49/{ARTIFACT_STEM}-candidate.json"
    )
    output_path.write_text(json.dumps(candidate_payload, indent=2) + "\n")
    return candidate_payload


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", choices=("build", "solve", "all"), default="all")
    parser.add_argument("--work-directory", default="/tmp/maynard-enlarged-d27")
    parser.add_argument("--cutoffs", default="1e-8,1e-10,1e-12,1e-14")
    parser.add_argument("--k", type=int, default=50)
    parser.add_argument("--epsilon-denominator", type=int, default=25)
    parser.add_argument("--degree", type=int, default=27)
    return parser.parse_args()


def main() -> None:
    arguments = parse_arguments()
    global K, EPSILON, SUPPORT_SCALE, MARGINAL_SCALE, TWICE_EPSILON
    global DEGREE, FACTORIAL, ARTIFACT_STEM, EPSILON_DENOMINATOR
    K = arguments.k
    EPSILON_DENOMINATOR = arguments.epsilon_denominator
    EPSILON = 1.0 / arguments.epsilon_denominator
    SUPPORT_SCALE = 1.0 + EPSILON
    MARGINAL_SCALE = 1.0 - EPSILON
    TWICE_EPSILON = 2.0 * EPSILON
    DEGREE = arguments.degree
    FACTORIAL = [math.factorial(index) for index in range(2 * (K + DEGREE + 2) + 1)]
    ARTIFACT_STEM = (
        f"d{DEGREE}-numeric-k{K}-e1over{arguments.epsilon_denominator}"
    )
    WEIGHT_CACHE.clear()
    work_directory = Path(arguments.work_directory)
    work_directory.mkdir(parents=True, exist_ok=True)
    report = {"phase": arguments.phase, "workDirectory": str(work_directory)}
    if arguments.phase in ("build", "all"):
        report["build"] = build_matrices(work_directory)
    if arguments.phase in ("solve", "all"):
        cutoffs = [float(value) for value in arguments.cutoffs.split(",")]
        report["solve"] = solve_matrices(work_directory, cutoffs)
    report_path = Path(
        f"logs/atlas-next-frontiers/free-boundary-maynard-49/{ARTIFACT_STEM}-run.json"
    )
    report_path.write_text(json.dumps(report, indent=2) + "\n")
    if arguments.phase == "build":
        console_report = report
    else:
        solve_report = report.get("solve", {})
        console_report = {
            "k": solve_report.get("k"),
            "epsilon": solve_report.get("epsilon"),
            "degree": solve_report.get("degree"),
            "dimension": solve_report.get("dimension"),
            "iSpectrum": solve_report.get("iSpectrum"),
            "bestStable": solve_report.get("bestStable"),
            "rejectedUnstable": solve_report.get("rejectedUnstable"),
            "solveSeconds": solve_report.get("solveSeconds"),
            "candidateArtifact": str(
                Path(
                    "logs/atlas-next-frontiers/free-boundary-maynard-49/"
                    f"{ARTIFACT_STEM}-candidate.json"
                )
            ),
        }
    print(json.dumps(console_report, indent=2))


if __name__ == "__main__":
    main()
