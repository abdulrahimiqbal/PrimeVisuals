#!/usr/bin/env python3
"""Extended-precision Bernstein conditioning for the d=27 calibration."""

from __future__ import annotations

import json
import math
import time
from collections import defaultdict
from pathlib import Path

import numpy as np
import scipy.linalg
import scipy.sparse

import maynard_enlarged_d27_numeric as core


WORK = Path('/tmp/maynard-enlarged-d27')
OUTPUT = Path('logs/atlas-next-frontiers/free-boundary-maynard-49/d27-bernstein-candidate.json')


def bernstein_transform(basis):
    groups = defaultdict(list)
    for index, (slack, signature) in enumerate(basis):
        groups[signature].append((slack, index))
    rows = []
    columns = []
    data = []
    scale = np.longdouble(26) / np.longdouble(25)
    for signature, entries in groups.items():
        entries.sort()
        maximum = len(entries) - 1
        row_for_slack = {slack: index for slack, index in entries}
        for slack, column_index in entries:
            remaining = maximum - slack
            for added in range(remaining + 1):
                coefficient = np.longdouble(math.comb(remaining, added))
                coefficient *= scale ** (remaining - added)
                if added % 2:
                    coefficient = -coefficient
                rows.append(row_for_slack[slack + added])
                columns.append(column_index)
                data.append(coefficient)
    return scipy.sparse.csc_matrix(
        (np.asarray(data, dtype=np.longdouble), (rows, columns)),
        shape=(len(basis), len(basis)),
        dtype=np.longdouble,
    )


def congruence(matrix, transform):
    left = transform.T @ matrix
    return np.asarray((transform.T @ left.T).T, dtype=np.longdouble)


def build():
    started = time.time()
    basis = core.signature_basis(core.K, core.DEGREE)
    transform = bernstein_transform(basis)
    print(f'[bernstein] R nnz={transform.nnz}', flush=True)
    i_raw = core.fill_moment_matrix(
        basis, core.K, core.SUPPORT_SCALE, 'I128', dtype=np.longdouble,
    )
    marginal_terms, marginal = core.marginal_expansion(basis)
    marginal = marginal.astype(np.longdouble)
    h_raw = core.fill_moment_matrix(
        marginal_terms, core.K - 1, core.MARGINAL_SCALE, 'H128', dtype=np.longdouble,
    )
    left = marginal.T @ h_raw
    a_raw = core.K * (marginal.T @ left.T).T
    a_raw = np.asarray(a_raw, dtype=np.longdouble)
    a_raw = (a_raw + a_raw.T) / 2
    del h_raw, left, marginal
    print(f'[bernstein] raw matrices {time.time() - started:.1f}s', flush=True)

    i_new = congruence(i_raw, transform)
    a_new = congruence(a_raw, transform)
    del i_raw, a_raw
    diagonal = np.diag(i_new).copy()
    print(
        f'[bernstein] diagonal min={np.min(diagonal):.3e}, '
        f'max={np.max(diagonal):.3e}, nonpositive={np.count_nonzero(diagonal <= 0)}',
        flush=True,
    )
    if np.any(diagonal <= 0):
        raise RuntimeError('Extended-precision Bernstein I has a non-positive diagonal')
    inverse = 1 / np.sqrt(diagonal)
    i_scaled = np.asarray(i_new * inverse[:, None] * inverse[None, :], dtype=np.float64)
    a_scaled = np.asarray(a_new * inverse[:, None] * inverse[None, :], dtype=np.float64)
    i_scaled = (i_scaled + i_scaled.T) / 2
    a_scaled = (a_scaled + a_scaled.T) / 2
    np.save(WORK / 'I-bernstein-scaled.npy', i_scaled)
    np.save(WORK / 'A-bernstein-scaled.npy', a_scaled)
    np.save(WORK / 'I-bernstein-diagonal.npy', diagonal)
    scipy.sparse.save_npz(WORK / 'bernstein-transform.npz', transform.astype(np.float64))
    return {
        'buildSeconds': time.time() - started,
        'transformNonzeros': int(transform.nnz),
    }


def solve(cutoffs=(1e-10, 1e-12, 1e-14, 1e-16)):
    started = time.time()
    i_scaled = np.load(WORK / 'I-bernstein-scaled.npy')
    a_scaled = np.load(WORK / 'A-bernstein-scaled.npy')
    values, vectors = scipy.linalg.eigh(i_scaled, driver='evr', check_finite=False)
    maximum = values[-1]
    nonpositive = int(np.count_nonzero(values <= 0))
    print(
        f'[bernstein] I min={values[0]:.3e}, max={maximum:.3e}, nonpositive={nonpositive}',
        flush=True,
    )
    rows = []
    stable_vectors = []
    for cutoff in cutoffs:
        keep = values > cutoff * maximum
        rank = int(np.count_nonzero(keep))
        whitening = vectors[:, keep] / np.sqrt(values[keep])[None, :]
        compressed = whitening.T @ a_scaled @ whitening
        compressed = (compressed + compressed.T) / 2
        eigenvalue, eigenvector = scipy.linalg.eigh(
            compressed, subset_by_index=[rank - 1, rank - 1],
            driver='evr', check_finite=False,
        )
        z = whitening @ eigenvector[:, 0]
        denominator = z @ i_scaled @ z
        numerator = z @ a_scaled @ z
        row = {
            'cutoff': cutoff,
            'rank': rank,
            'eigenvalue': float(eigenvalue[0]),
            'directQuotient': float(numerator / denominator),
            'denominator': float(denominator),
            'residual': float(np.linalg.norm(a_scaled @ z - eigenvalue[0] * (i_scaled @ z))),
        }
        row['stable'] = (
            abs(row['eigenvalue'] - row['directQuotient']) < 1e-3
            and abs(row['denominator'] - 1.0) < 1e-3
            and row['residual'] < 1e-5
        )
        rows.append(row)
        print(f'[bernstein] {row}', flush=True)
        if row['stable']:
            stable_vectors.append((row, z))

    if not stable_vectors:
        raise RuntimeError('Bernstein solve produced no numerically stable cutoff')
    best_stable, best_vector = max(
        stable_vectors, key=lambda item: item[0]['directQuotient'],
    )

    transform = scipy.sparse.load_npz(WORK / 'bernstein-transform.npz')
    diagonal = np.load(WORK / 'I-bernstein-diagonal.npy').astype(np.float64)
    new_coefficients = best_vector / np.sqrt(diagonal)
    original = transform @ new_coefficients
    original /= np.max(np.abs(original))
    np.save(WORK / 'candidate-bernstein-original.npy', original)
    basis = core.signature_basis(core.K, core.DEGREE)
    payload = {
        'k': core.K,
        'epsilon': '1/25',
        'degree': core.DEGREE,
        'dimension': len(basis),
        'iSpectrum': {
            'minimum': float(values[0]), 'maximum': float(maximum), 'nonpositive': nonpositive,
        },
        'cutoffs': rows,
        'bestStable': best_stable,
        'rejectedUnstable': [row for row in rows if not row['stable']],
        'solveSeconds': time.time() - started,
        'coefficients': [
            {
                'index': index, 'slackPower': slack, 'signature': list(signature),
                'coefficient': float(original[index]),
            }
            for index, (slack, signature) in enumerate(basis)
        ],
    }
    OUTPUT.write_text(json.dumps(payload, indent=2) + '\n')
    return payload


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    build_report = build()
    solve_report = solve()
    print(json.dumps({
        'build': build_report,
        'solve': {
            'iSpectrum': solve_report['iSpectrum'],
            'cutoffs': solve_report['cutoffs'],
            'bestStable': solve_report['bestStable'],
            'rejectedUnstable': solve_report['rejectedUnstable'],
            'solveSeconds': solve_report['solveSeconds'],
        },
    }, indent=2))


if __name__ == '__main__':
    main()
