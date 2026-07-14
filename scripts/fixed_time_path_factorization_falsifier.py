#!/usr/bin/env python3
"""Exact three-state audit for sharp fixed-time path factorizations.

The chain has generator T=-L with eigenvalues 0, 1/2, 1.  At
t0=2 log(2), P=exp(-t0 T) therefore has eigenvalues 1, 1/2, 1/4.
It obeys the sharp centered L2 contraction but fails the corresponding
Doeblin minorization.  Its residual is instead one signed three-point square.

All matrix checks below use exact rational arithmetic.  No numerical
approximation to an exponential or eigenvalue is used.
"""

from fractions import Fraction as F


T = (
    (F(5, 12), F(-1, 12), F(-1, 3)),
    (F(-1, 12), F(5, 12), F(-1, 3)),
    (F(-1, 3), F(-1, 3), F(2, 3)),
)

P = (
    (F(5, 8), F(1, 8), F(1, 4)),
    (F(1, 8), F(5, 8), F(1, 4)),
    (F(1, 4), F(1, 4), F(1, 2)),
)

ONE = (F(1), F(1), F(1))
U = (F(1), F(-1), F(0))
V = (F(1), F(1), F(-2))


def mv(matrix, vector):
    return tuple(sum(row[j] * vector[j] for j in range(3)) for row in matrix)


def scale(value, vector):
    return tuple(value * entry for entry in vector)


def sub(left, right):
    return tuple(left[i] - right[i] for i in range(3))


def residual_matrix():
    # S = r(I-Pi) - (P-Pi), with r=1/2 and Pi_ij=1/3.
    r = F(1, 2)
    result = []
    for i in range(3):
        row = []
        for j in range(3):
            identity = F(int(i == j))
            projection = F(1, 3)
            row.append(r * (identity - projection) - (P[i][j] - projection))
        result.append(tuple(row))
    return tuple(result)


def main():
    # T is a conservative symmetric Markov generator: -T has nonnegative
    # off-diagonal entries.
    assert all(sum(row) == 0 for row in T)
    assert all(T[i][j] <= 0 for i in range(3) for j in range(3) if i != j)

    # The displayed eigenvectors span R^3 and give the exact spectrum.
    assert mv(T, ONE) == scale(F(0), ONE)
    assert mv(T, U) == scale(F(1, 2), U)
    assert mv(T, V) == scale(F(1), V)

    # At t0=2 log 2 these exponentiate to 1, 1/2, and 1/4.
    assert all(sum(row) == 1 for row in P)
    assert all(entry >= 0 for row in P for entry in row)
    assert mv(P, ONE) == ONE
    assert mv(P, U) == scale(F(1, 2), U)
    assert mv(P, V) == scale(F(1, 4), V)

    # The sharp Doeblin mass would be (1-r)Pi, whose every entry is 1/6.
    assert P[0][1] == F(1, 8) < F(1, 6)

    # Yet the centered fixed-time residual is PSD and is exactly
    # (1/24) V V^T = (1/4) v v^T for v=V/sqrt(6).
    residual = residual_matrix()
    expected = tuple(tuple(F(1, 24) * V[i] * V[j] for j in range(3))
                     for i in range(3))
    assert residual == expected
    assert mv(residual, ONE) == scale(F(0), ONE)
    assert mv(residual, U) == scale(F(0), U)
    assert mv(residual, V) == scale(F(1, 4), V)

    # Positive off-diagonal (1,2) rules out an ordinary graph/conditional-
    # variance decomposition; the residual needs the signed row (1,1,-2).
    assert residual[0][1] == F(1, 24) > 0

    print("PASS: exact Markov spectrum is {0, 1/2, 1}")
    print("PASS: fixed-time spectrum is {1, 1/2, 1/4}")
    print("PASS: sharp Doeblin minorization fails at P_12=1/8<1/6")
    print("PASS: residual is the signed square (1/24)|(1,1,-2) dot f|^2")
    print("PASS: three states are the first dimension allowing this escape")


if __name__ == "__main__":
    main()
