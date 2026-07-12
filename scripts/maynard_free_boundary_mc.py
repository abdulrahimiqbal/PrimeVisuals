#!/usr/bin/env python3
"""Monte Carlo hostile test for the inactive-chamber Maynard correction.

This is deliberately a reconnaissance layer, never a certificate.  It works
inside a spectrally stable subspace of the degree-27 k=50 Gram matrices,
learns the chamber correction from one conditional sample, and evaluates the
proposed corrected witness on an independent holdout sample.
"""

from __future__ import annotations

import argparse
import json
import math
from fractions import Fraction
from pathlib import Path

import numpy as np
import scipy.linalg


K = 50
EPSILON_DENOMINATOR = 25
A = 26.0 / 25.0
B = 24.0 / 25.0


def chamber_volume_ratio() -> float:
    """Exact uniform volume ratio for t_i <= S-B inside S <= A."""
    edge = Fraction(EPSILON_DENOMINATOR + 1, EPSILON_DENOMINATOR)
    cutoff = Fraction(EPSILON_DENOMINATOR - 1, EPSILON_DENOMINATOR)
    shell = (edge**K - cutoff**K) / K
    shell -= K * cutoff ** (K - 1) * (edge - cutoff)
    for selected in range(2, K + 1):
        upper = min(edge, Fraction(selected, selected - 1) * cutoff)
        if upper <= cutoff:
            continue
        residual = selected * cutoff - (selected - 1) * upper
        shell += ((-1) ** selected) * math.comb(K, selected) * (
            cutoff**K - residual**K
        ) / ((selected - 1) * K)
    chamber = shell / math.factorial(K - 1)
    total = edge**K / math.factorial(K)
    return float(chamber / total)


def accepted_chamber_sample(rng: np.random.Generator, size: int) -> tuple[np.ndarray, np.ndarray]:
    points = []
    sums = []
    accepted = 0
    candidate_size = max(10_000, min(100_000, size * 10))
    while accepted < size:
        exponentials = rng.exponential(size=(candidate_size, K + 1))
        t = A * exponentials[:, :K] / exponentials.sum(axis=1)[:, None]
        total = t.sum(axis=1)
        keep = np.max(t, axis=1) <= total - B
        t = t[keep]
        total = total[keep]
        remaining = size - accepted
        if len(t) > remaining:
            t = t[:remaining]
            total = total[:remaining]
        if len(t):
            points.append(t)
            sums.append(total)
            accepted += len(t)
    return np.vstack(points), np.concatenate(sums)


def partition_data(basis: list[dict]) -> tuple[list[tuple[int, ...]], list[tuple[tuple[int, ...], int]]]:
    item_keys = [
        (tuple(exponent // 2 for exponent in item["signature"]), item["slackPower"])
        for item in basis
    ]
    partitions = sorted(
        {partition for partition, _ in item_keys},
        key=lambda partition: (sum(partition), len(partition), partition),
    )
    return partitions, item_keys


def feature_matrix(
    t: np.ndarray,
    total: np.ndarray,
    partitions: list[tuple[int, ...]],
    item_keys: list[tuple[tuple[int, ...], int]],
) -> np.ndarray:
    """Evaluate (A-S)^a P_alpha using P_alpha=m_(alpha/2)(t_i^2)."""
    x = t * t
    power_sums = [None] + [np.sum(x**power, axis=1) for power in range(1, 14)]
    values: dict[tuple[int, ...], np.ndarray] = {(): np.ones(len(t))}
    for partition in partitions:
        if not partition:
            continue
        part = partition[-1]
        tail = partition[:-1]
        value = power_sums[part] * values[tail]
        for old_part in set(tail):
            merged = list(tail)
            merged.remove(old_part)
            merged.append(old_part + part)
            merged_partition = tuple(sorted(merged, reverse=True))
            value -= merged_partition.count(old_part + part) * values[merged_partition]
        values[partition] = value / partition.count(part)
    slack = A - total
    features = np.empty((len(t), len(item_keys)), dtype=np.float64)
    for index, (partition, power) in enumerate(item_keys):
        features[:, index] = values[partition] * slack**power
    return features


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--work-directory", default="/tmp/maynard-enlarged-d27")
    parser.add_argument("--k", type=int, default=50)
    parser.add_argument("--epsilon-denominator", type=int, default=25)
    parser.add_argument("--cutoff", type=float, default=1e-12)
    parser.add_argument("--train", type=int, default=4_000)
    parser.add_argument("--train-batch", type=int, default=4_000)
    parser.add_argument("--holdout", type=int, default=40_000)
    parser.add_argument("--holdout-batch", type=int, default=2_000)
    parser.add_argument("--correction-cap", type=float, default=0.99)
    parser.add_argument("--seed", type=int, default=20260712)
    args = parser.parse_args()
    global K, EPSILON_DENOMINATOR, A, B
    K = args.k
    EPSILON_DENOMINATOR = args.epsilon_denominator
    A = 1.0 + 1.0 / EPSILON_DENOMINATOR
    B = 1.0 - 1.0 / EPSILON_DENOMINATOR

    work = Path(args.work_directory)
    basis = json.loads((work / "basis.json").read_text())
    partitions, item_keys = partition_data(basis)
    i_scaled = np.load(work / "I-scaled.npy")
    a_scaled = np.load(work / "A-scaled.npy")
    diagonal = np.load(work / "I-diagonal.npy")

    i_values, i_vectors = scipy.linalg.eigh(i_scaled, driver="evr", check_finite=False)
    keep = i_values > args.cutoff * i_values[-1]
    whitening = i_vectors[:, keep] / np.sqrt(i_values[keep])[None, :]
    compressed_a = whitening.T @ a_scaled @ whitening
    compressed_a = (compressed_a + compressed_a.T) / 2.0

    rng = np.random.default_rng(args.seed)
    volume_total = A**K / math.factorial(K)
    uniform_ratio = chamber_volume_ratio()
    volume_chamber = volume_total * uniform_ratio
    correction = np.zeros((whitening.shape[1], whitening.shape[1]), dtype=np.float64)
    remaining_train = args.train
    while remaining_train:
        batch_size = min(args.train_batch, remaining_train)
        train_t, train_sum = accepted_chamber_sample(rng, batch_size)
        train_features = feature_matrix(train_t, train_sum, partitions, item_keys)
        train_features /= np.sqrt(diagonal)[None, :]
        sampled_map = train_features @ whitening
        correction += (volume_chamber / args.train) * (sampled_map.T @ sampled_map)
        remaining_train -= batch_size
    correction = (correction + correction.T) / 2.0
    denominator = np.eye(whitening.shape[1]) - correction
    denominator_values = scipy.linalg.eigvalsh(denominator, check_finite=False)
    raw_minimum_denominator = float(denominator_values[0])
    correction_cap_applied = denominator_values[0] <= 0
    if denominator_values[0] <= 0:
        correction_values, correction_vectors = scipy.linalg.eigh(
            correction,
            driver="evr",
            check_finite=False,
        )
        correction_values = np.minimum(correction_values, args.correction_cap)
        correction = (correction_vectors * correction_values[None, :]) @ correction_vectors.T
        correction = (correction + correction.T) / 2.0
        denominator = np.eye(whitening.shape[1]) - correction
        denominator_values = scipy.linalg.eigvalsh(denominator, check_finite=False)
    eigenvalue, eigenvector = scipy.linalg.eigh(
        compressed_a,
        denominator,
        subset_by_index=[whitening.shape[1] - 1, whitening.shape[1] - 1],
        driver="gvx",
        check_finite=False,
    )
    vector = eigenvector[:, 0]
    numerator = float(vector @ compressed_a @ vector)
    global_i = float(vector @ vector)
    train_chamber_i = float(vector @ correction @ vector)
    scaled_coefficients = whitening @ vector
    coefficients = scaled_coefficients / np.sqrt(diagonal)

    holdout_sum = 0.0
    holdout_sum_squares = 0.0
    holdout_count = 0
    remaining = args.holdout
    while remaining:
        batch_size = min(args.holdout_batch, remaining)
        hold_t, hold_sum = accepted_chamber_sample(rng, batch_size)
        features = feature_matrix(hold_t, hold_sum, partitions, item_keys)
        values = features @ coefficients
        squares = values * values
        holdout_sum += float(np.sum(squares))
        holdout_sum_squares += float(np.sum(squares * squares))
        holdout_count += len(squares)
        remaining -= batch_size
    conditional_mean = holdout_sum / holdout_count
    conditional_variance = max(
        0.0,
        (holdout_sum_squares - holdout_count * conditional_mean**2) / (holdout_count - 1),
    )
    conditional_se = math.sqrt(conditional_variance / holdout_count)
    holdout_chamber_i = volume_chamber * conditional_mean
    holdout_chamber_se = volume_chamber * conditional_se
    holdout_quotient = numerator / (global_i - holdout_chamber_i)

    candidate_path = work / f"free-boundary-mc-cutoff-{args.cutoff:.0e}.npy"
    np.save(candidate_path, coefficients / np.max(np.abs(coefficients)))
    report = {
        "status": "MONTE_CARLO_RECONNAISSANCE_ONLY",
        "k": K,
        "epsilon": f"1/{EPSILON_DENOMINATOR}",
        "degree": 27,
        "cutoff": args.cutoff,
        "stableRank": int(np.count_nonzero(keep)),
        "trainingSamples": args.train,
        "holdoutSamples": args.holdout,
        "uniformChamberVolumeRatio": uniform_ratio,
        "training": {
            "rawMinimumCorrectedDenominatorEigenvalue": raw_minimum_denominator,
            "correctionEigenvalueCap": args.correction_cap,
            "correctionCapApplied": correction_cap_applied,
            "minimumCorrectedDenominatorEigenvalue": float(denominator_values[0]),
            "correctedQuotient": float(eigenvalue[0]),
            "globalI": global_i,
            "chamberI": train_chamber_i,
            "chamberMassRatio": train_chamber_i / global_i,
        },
        "holdout": {
            "numerator": numerator,
            "globalI": global_i,
            "chamberI": holdout_chamber_i,
            "chamberIStandardError": holdout_chamber_se,
            "chamberMassRatio": holdout_chamber_i / global_i,
            "correctedQuotient": holdout_quotient,
            "marginBelowFour": 4.0 - holdout_quotient,
            "uncertaintyScope": "Sampling error only; excludes Gram conditioning and correction-cap systematics",
        },
        "candidatePath": str(candidate_path),
    }
    output = Path(
        "logs/atlas-next-frontiers/free-boundary-maynard-49/"
        f"d27-free-boundary-mc-k{K}-e1over{EPSILON_DENOMINATOR}-cutoff{args.cutoff:.0e}.json"
    )
    output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
