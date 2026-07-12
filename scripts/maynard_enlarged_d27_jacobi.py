#!/usr/bin/env python3
"""Conditioned d=27 calibration using exact shifted-Jacobi radial bases."""

from __future__ import annotations

import json
import math
import time
from collections import defaultdict
from fractions import Fraction
from pathlib import Path

import numpy as np
import scipy.linalg
import scipy.sparse

import maynard_enlarged_d27_numeric as core


WORK = Path('/tmp/maynard-enlarged-d27')
OUTPUT = Path('logs/atlas-next-frontiers/free-boundary-maynard-49/d27-jacobi-candidate.json')


def shifted_jacobi_coefficients(degree: int, alpha: int) -> list[Fraction]:
    """P_degree^(alpha,0)(2*x/A-1), ascending powers of x, exactly."""
    coefficients = [Fraction(0) for _ in range(degree + 1)]
    support_scale = Fraction(26, 25)
    for m in range(degree + 1):
        outer = math.comb(degree + alpha, m) * math.comb(degree, m)
        remaining = degree - m
        for tail_power in range(remaining + 1):
            power = m + tail_power
            value = outer * math.comb(remaining, tail_power)
            if (remaining - tail_power) % 2:
                value = -value
            coefficients[power] += Fraction(value, 1) / support_scale ** power
    return coefficients


def jacobi_transform(basis):
    groups = defaultdict(list)
    for index, (slack, signature) in enumerate(basis):
        groups[signature].append((slack, index))
    rows = []
    columns = []
    data = []
    for signature, entries in groups.items():
        entries.sort()
        radial_alpha = core.K + 2 * sum(signature) - 1
        row_for_slack = {slack: index for slack, index in entries}
        for new_degree, (_, column_index) in enumerate(entries):
            coefficients = shifted_jacobi_coefficients(new_degree, radial_alpha)
            for old_power, coefficient in enumerate(coefficients):
                rows.append(row_for_slack[old_power])
                columns.append(column_index)
                data.append(np.longdouble(coefficient.numerator) / np.longdouble(coefficient.denominator))
    return scipy.sparse.csc_matrix(
        (np.asarray(data, dtype=np.longdouble), (rows, columns)),
        shape=(len(basis), len(basis)),
        dtype=np.longdouble,
    )


def sparse_congruence(matrix, transform):
    left = transform.T @ matrix
    output = (transform.T @ left.T).T
    return np.asarray(output, dtype=np.longdouble)


def build():
    started = time.time()
    basis = core.signature_basis(core.K, core.DEGREE)
    transform = jacobi_transform(basis)
    print(f'[jacobi] R nnz={transform.nnz}', flush=True)
    i_raw = core.fill_moment_matrix(
        basis, core.K, core.SUPPORT_SCALE, 'I128', dtype=np.longdouble,
    )
    i_jacobi = sparse_congruence(i_raw, transform)
    del i_raw
    diagonal = np.diag(i_jacobi).copy()
    inverse = 1 / np.sqrt(diagonal)
    i_scaled128 = i_jacobi * inverse[:, None] * inverse[None, :]
    # Same-signature radial blocks should be orthogonal analytically.
    same_signature_max = np.longdouble(0)
    groups = defaultdict(list)
    for index, (_, signature) in enumerate(basis):
        groups[signature].append(index)
    for indices in groups.values():
        block = i_scaled128[np.ix_(indices, indices)].copy()
        np.fill_diagonal(block, 0)
        same_signature_max = max(same_signature_max, np.max(np.abs(block)))
    print(f'[jacobi] max same-signature I offdiag={same_signature_max:.3e}', flush=True)

    marginal_terms, old_marginal = core.marginal_expansion(basis)
    old_marginal = old_marginal.astype(np.longdouble)
    new_marginal = old_marginal @ transform
    new_marginal = new_marginal @ scipy.sparse.diags(inverse)
    print(f'[jacobi] Tnew nnz={new_marginal.nnz}', flush=True)
    h_raw = core.fill_moment_matrix(
        marginal_terms, core.K - 1, core.MARGINAL_SCALE, 'H128', dtype=np.longdouble,
    )
    left = new_marginal.T @ h_raw
    a_scaled128 = core.K * (new_marginal.T @ left.T).T
    a_scaled128 = np.asarray(a_scaled128, dtype=np.longdouble)
    a_scaled128 = (a_scaled128 + a_scaled128.T) / 2
    del h_raw, left

    i_scaled = np.asarray(i_scaled128, dtype=np.float64)
    a_scaled = np.asarray(a_scaled128, dtype=np.float64)
    np.save(WORK / 'I-jacobi-scaled.npy', i_scaled)
    np.save(WORK / 'A-jacobi-scaled.npy', a_scaled)
    np.save(WORK / 'I-jacobi-diagonal.npy', np.asarray(diagonal, dtype=np.longdouble))
    scipy.sparse.save_npz(WORK / 'jacobi-transform.npz', transform.astype(np.float64))
    return {
        'buildSeconds': time.time() - started,
        'transformNonzeros': int(transform.nnz),
        'marginalTransformNonzeros': int(new_marginal.nnz),
        'sameSignatureMaximumOffDiagonal': float(same_signature_max),
    }


def solve(cutoffs=(1e-12, 1e-14, 1e-16)):
    started = time.time()
    i_scaled = np.load(WORK / 'I-jacobi-scaled.npy')
    a_scaled = np.load(WORK / 'A-jacobi-scaled.npy')
    values, vectors = scipy.linalg.eigh(i_scaled, driver='evr', check_finite=False)
    maximum = values[-1]
    print(
        f'[jacobi-solve] I min={values[0]:.3e}, max={maximum:.3e}, '
        f'nonpositive={np.count_nonzero(values <= 0)}',
        flush=True,
    )
    rows = []
    best_vector = None
    best_direct = -math.inf
    for cutoff in cutoffs:
        keep = values > cutoff * maximum
        rank = int(np.count_nonzero(keep))
        whitening = vectors[:, keep] / np.sqrt(values[keep])[None, :]
        compressed = whitening.T @ a_scaled @ whitening
        compressed = (compressed + compressed.T) / 2
        eigenvalue, eigenvector = scipy.linalg.eigh(
            compressed,
            subset_by_index=[rank - 1, rank - 1],
            driver='evr',
            check_finite=False,
        )
        z = whitening @ eigenvector[:, 0]
        denominator = z @ i_scaled @ z
        numerator = z @ a_scaled @ z
        direct = float(numerator / denominator)
        residual = float(np.linalg.norm(a_scaled @ z - eigenvalue[0] * (i_scaled @ z)))
        row = {
            'cutoff': cutoff,
            'rank': rank,
            'eigenvalue': float(eigenvalue[0]),
            'directQuotient': direct,
            'denominator': float(denominator),
            'residual': residual,
        }
        rows.append(row)
        print(f'[jacobi-solve] {row}', flush=True)
        if direct > best_direct:
            best_direct = direct
            best_vector = z

    transform = scipy.sparse.load_npz(WORK / 'jacobi-transform.npz')
    diagonal = np.load(WORK / 'I-jacobi-diagonal.npy')
    new_coefficients = best_vector / np.sqrt(diagonal.astype(np.float64))
    original = transform @ new_coefficients
    original /= np.max(np.abs(original))
    np.save(WORK / 'candidate-jacobi-original.npy', original)
    basis = core.signature_basis(core.K, core.DEGREE)
    payload = {
        'k': core.K,
        'epsilon': '1/25',
        'degree': core.DEGREE,
        'dimension': len(basis),
        'iSpectrum': {
            'minimum': float(values[0]),
            'maximum': float(maximum),
            'nonpositive': int(np.count_nonzero(values <= 0)),
        },
        'cutoffs': rows,
        'bestDirectQuotient': best_direct,
        'solveSeconds': time.time() - started,
        'coefficients': [
            {
                'index': index,
                'slackPower': slack,
                'signature': list(signature),
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
    print(json.dumps({'build': build_report, 'solve': {
        'iSpectrum': solve_report['iSpectrum'],
        'cutoffs': solve_report['cutoffs'],
        'bestDirectQuotient': solve_report['bestDirectQuotient'],
        'solveSeconds': solve_report['solveSeconds'],
    }}, indent=2))


if __name__ == '__main__':
    main()
