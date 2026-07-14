#!/usr/bin/env python3
"""Numerical discovery audit for a non-lumpable cross-y hybrid lift.

This is deliberately not a proof certificate.  It freezes the label-ordering
polynomial h0, uses the diagonal star coupling for |a-b|<epsilon and the
h0-antitone coupling outside, then searches a finite modular/label/sign test
space for an upstairs half-gap counterexample.
"""

import math
import numpy as np
from scipy.integrate import quad_vec
from scipy.linalg import eigh
from scipy.optimize import minimize
from scipy.special import roots_legendre


PI = math.pi
MAX_LABEL = 18
MAX_Q = 64
Y_KNOTS = np.linspace(0.0, 1.2, 9)
Y_STEP = Y_KNOTS[1] - Y_KNOTS[0]


def phi(y):
    z = PI * math.exp(2 * y)
    if z > 740:
        return 0.0
    return PI * math.exp(2.5 * y) * (2 * z - 3) * math.exp(-z)


def g(label, radius):
    return phi(radius + math.log(label)) / math.sqrt(label)


def label_law(radius):
    weights = np.array([g(m, radius) for m in range(1, MAX_LABEL + 1)])
    total = float(np.sum(weights))
    return weights / total, total


def C(radius):
    return math.cosh(radius / 2)


def J(distance):
    return math.exp(-distance / 2) / (-math.expm1(-2 * distance))


def h0(y):
    return y * (2 + y * (-33 + y * (192 + y * (-450 + 360 * y))))


def hats(y):
    return np.maximum(0.0, 1.0 - np.abs(y - Y_KNOTS) / Y_STEP)


def feature(radius, label, sign):
    y = radius + math.log(label)
    base = hats(y)
    rare = float(label >= 2)
    return np.concatenate(
        [
            base,
            sign * base,
            np.array([rare, sign * rare, rare * y, sign * rare * y]),
        ]
    )


DIM = 2 * len(Y_KNOTS) + 4


def star_pairs(a, b, pa, pb):
    """Pairs (source label,destination label,mass), assuming a<=b."""
    pairs = [(1, 1, pa[0])]
    for m in range(2, MAX_LABEL + 1):
        pairs.append((m, m, pb[m - 1]))
        residual = pa[m - 1] - pb[m - 1]
        if residual > 0:
            pairs.append((m, 1, residual))
    return pairs


def antitone_pairs(a, b, pa, pb, order_value):
    source = sorted(
        range(1, MAX_LABEL + 1), key=lambda m: (order_value(a, m), m)
    )
    target = sorted(
        range(1, MAX_LABEL + 1),
        key=lambda m: (order_value(b, m), m),
        reverse=True,
    )
    i = j = 0
    source_mass = pa[source[0] - 1]
    target_mass = pb[target[0] - 1]
    pairs = []
    while i < len(source) and j < len(target):
        mass = min(source_mass, target_mass)
        pairs.append((source[i], target[j], mass))
        source_mass -= mass
        target_mass -= mass
        if source_mass < 1e-15:
            i += 1
            if i < len(source):
                source_mass = pa[source[i] - 1]
        if target_mass < 1e-15:
            j += 1
            if j < len(target):
                target_mass = pb[target[j] - 1]
    return pairs


def coupling_pairs(a, b, pa, pb, epsilon, order_value):
    if b - a < epsilon:
        return star_pairs(a, b, pa, pb)
    return antitone_pairs(a, b, pa, pb, order_value)


def prime_powers(limit):
    result = []
    for p in range(2, limit + 1):
        if any(p % d == 0 for d in range(2, int(math.sqrt(p)) + 1)):
            continue
        value = p
        while value <= limit:
            result.append((value, math.log(p)))
            value *= p
    return sorted(result)


def matrix_outer_difference(left, right):
    difference = left - right
    return np.outer(difference, difference)


def carrier_covariance(nodes, weights, laws):
    mass = 0.0
    mean = np.zeros(DIM)
    second = np.zeros((DIM, DIM))
    for radius, weight, (probabilities, k_value) in zip(nodes, weights, laws):
        for sign in (-1, 1):
            for label, probability in enumerate(probabilities, 1):
                node_mass = weight * C(radius) * k_value * probability
                value = feature(radius, label, sign)
                mass += node_mass
                mean += node_mass * value
                second += node_mass * np.outer(value, value)
    return second - np.outer(mean, mean) / mass


def arch_matrix(nodes, weights, laws, epsilon, order_value):
    result = np.zeros((DIM, DIM))
    for i, a in enumerate(nodes):
        pa, ka = laws[i]
        for j, b in enumerate(nodes):
            pb, kb = laws[j]
            if a <= b:
                pairs = coupling_pairs(a, b, pa, pb, epsilon, order_value)
                reverse = False
            else:
                pairs = coupling_pairs(b, a, pb, pa, epsilon, order_value)
                reverse = True
            same = np.zeros((DIM, DIM))
            cross = np.zeros((DIM, DIM))
            for source, target, mass in pairs:
                left_label, right_label = (
                    (target, source) if reverse else (source, target)
                )
                for sign in (-1, 1):
                    same += mass * matrix_outer_difference(
                        feature(a, left_label, sign),
                        feature(b, right_label, sign),
                    )
                    cross += mass * matrix_outer_difference(
                        feature(a, left_label, sign),
                        feature(b, right_label, -sign),
                    )
            same_distance = abs(a - b)
            same_kernel = 0.0 if i == j else J(same_distance)
            result += (
                0.5
                * weights[i]
                * weights[j]
                * ka
                * kb
                * (same_kernel * same + J(a + b) * cross)
            )
    return result


def arch_matrix_resolved(epsilon, order_value, cutoff=1.3, degree=30):
    """Resolve the singular diagonal layer in distance coordinates.

    The integral over ordered (a,b) in the preceding routine equals the
    integral over the triangle b=a+d, d>0.  The star interval is integrated
    linearly in d.  Outside it, d=exp(t) cancels the leading 1/d behavior of
    J(d), which is essential once epsilon is below a tensor-grid spacing.
    This remains discovery quadrature, not an interval certificate.
    """
    raw, raw_weights = roots_legendre(degree)
    result = np.zeros((DIM, DIM))

    def integrate_distance(d, distance_weight, use_star):
        nonlocal result
        a_max = cutoff - d
        if a_max <= 0:
            return
        a_nodes = (raw + 1) * a_max / 2
        a_weights = raw_weights * a_max / 2
        for a, a_weight in zip(a_nodes, a_weights):
            b = a + d
            pa, ka = label_law(a)
            pb, kb = label_law(b)
            if use_star:
                pairs = star_pairs(a, b, pa, pb)
            else:
                pairs = antitone_pairs(a, b, pa, pb, order_value)
            same = np.zeros((DIM, DIM))
            cross = np.zeros((DIM, DIM))
            for source, target, mass in pairs:
                for sign in (-1, 1):
                    same += mass * matrix_outer_difference(
                        feature(a, source, sign),
                        feature(b, target, sign),
                    )
                    cross += mass * matrix_outer_difference(
                        feature(a, source, sign),
                        feature(b, target, -sign),
                    )
            result += (
                distance_weight
                * a_weight
                * ka
                * kb
                * (J(d) * same + J(a + b) * cross)
            )

    # The finite star layer d in (0,epsilon).
    if epsilon > 0:
        d_nodes = (raw + 1) * epsilon / 2
        d_weights = raw_weights * epsilon / 2
        for d, d_weight in zip(d_nodes, d_weights):
            integrate_distance(d, d_weight, True)

    # The antitone layer.  Log-distance coordinates resolve its logarithmic
    # growth as epsilon tends to zero.
    lower = max(epsilon, 1e-14)
    if lower < cutoff:
        t_lower = math.log(lower)
        t_upper = math.log(cutoff)
        t_nodes = (raw + 1) * (t_upper - t_lower) / 2 + t_lower
        t_weights = raw_weights * (t_upper - t_lower) / 2
        for t, t_weight in zip(t_nodes, t_weights):
            d = math.exp(t)
            integrate_distance(d, t_weight * d, False)
    return result


def prime_matrix():
    same = np.zeros((DIM, DIM))
    reflected = np.zeros((DIM, DIM))

    def k_value(radius):
        return sum(g(label, radius) for label in range(1, MAX_LABEL + 1))

    for q, von_mangoldt in prime_powers(MAX_Q):
        length = math.log(q)
        for n in range(1, MAX_LABEL + 1):
            m = q * n

            def same_integrand(radius):
                coefficient = k_value(radius) * g(m, radius)
                value = np.zeros((DIM, DIM))
                for sign in (-1, 1):
                    value += matrix_outer_difference(
                        feature(radius, m, sign),
                        feature(radius + length, n, sign),
                    )
                return coefficient * value.reshape(-1)

            same_piece = quad_vec(
                same_integrand, 0.0, 1.3, epsabs=1e-9
            )[0].reshape(DIM, DIM)
            same += von_mangoldt * same_piece

            def reflected_integrand(radius):
                source_radius = length - radius
                coefficient = (
                    k_value(radius) * g(n, source_radius) / math.sqrt(q)
                )
                return (
                    coefficient
                    * matrix_outer_difference(
                        feature(source_radius, n, 1),
                        feature(radius, 1, -1),
                    ).reshape(-1)
                )

            reflected_piece = quad_vec(
                reflected_integrand, 0.0, length, epsabs=1e-9
            )[0].reshape(DIM, DIM)
            reflected += von_mangoldt * reflected_piece
            if n > 6 and max(
                np.max(np.abs(same_piece)), np.max(np.abs(reflected_piece))
            ) < 1e-12:
                break
    return same + reflected


def smallest_generalized(energy, covariance):
    eigenvalues, eigenvectors = np.linalg.eigh(covariance)
    selected = eigenvalues > 1e-10
    whitener = eigenvectors[:, selected] @ np.diag(
        1 / np.sqrt(eigenvalues[selected])
    )
    reduced = whitener.T @ energy @ whitener
    values, vectors = eigh(reduced)
    witness = whitener @ vectors[:, 0]
    witness /= np.max(np.abs(witness))
    return values[0], witness


def covariance_whitener(covariance):
    eigenvalues, eigenvectors = np.linalg.eigh(covariance)
    selected = eigenvalues > 1e-10
    return eigenvectors[:, selected] @ np.diag(1 / np.sqrt(eigenvalues[selected]))


def optimize_mixture(arch_matrices, prime, covariance):
    """Numerically maximize the finite-space generalized minimum eigenvalue."""
    whitener = covariance_whitener(covariance)
    reduced = [whitener.T @ (arch + prime) @ whitener for arch in arch_matrices]
    count = len(reduced)

    def objective(theta):
        matrix = sum(weight * piece for weight, piece in zip(theta, reduced))
        values, vectors = eigh(matrix, subset_by_index=(0, 0))
        vector = vectors[:, 0]
        gradient = np.array([vector @ piece @ vector for piece in reduced])
        return -values[0], -gradient

    starts = [np.full(count, 1 / count)]
    starts.extend(np.eye(count))
    best = None
    for start in starts:
        result = minimize(
            lambda theta: objective(theta)[0],
            start,
            jac=lambda theta: objective(theta)[1],
            method="SLSQP",
            bounds=[(0.0, 1.0)] * count,
            constraints={"type": "eq", "fun": lambda theta: np.sum(theta) - 1},
            options={"ftol": 1e-11, "maxiter": 500},
        )
        if best is None or result.fun < best.fun:
            best = result
    theta = best.x / np.sum(best.x)
    energy = prime + sum(
        weight * arch for weight, arch in zip(theta, arch_matrices)
    )
    value, witness = smallest_generalized(energy, covariance)
    return value, theta, witness


def polynomial_order(radius, label):
    return h0(radius + math.log(label))


def witness_order(coefficients):
    """Use only the sign-even part, since the present coupling is label-only."""

    def order(radius, label):
        plus = feature(radius, label, 1)
        minus = feature(radius, label, -1)
        return coefficients @ ((plus + minus) / 2)

    return order


def main():
    raw_nodes, raw_weights = roots_legendre(80)
    nodes = (raw_nodes + 1) * 0.65
    weights = raw_weights * 0.65
    laws = [label_law(radius) for radius in nodes]
    covariance = carrier_covariance(nodes, weights, laws)
    prime = prime_matrix()
    for epsilon in (0.0002, 0.0001, 0.00005, 0.00002, 0.00001, 0.000005):
        arch = arch_matrix_resolved(epsilon, polynomial_order)
        value, witness = smallest_generalized(arch + prime, covariance)
        print("epsilon", epsilon, "smallest", value, flush=True)
        print("witness", np.array2string(witness, precision=4), flush=True)


if __name__ == "__main__":
    main()
