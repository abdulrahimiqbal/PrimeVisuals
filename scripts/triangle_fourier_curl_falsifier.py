#!/usr/bin/env python3
"""Arb certificate for the naive length-Fourier curl inverse obstruction.

This certificate concerns only the auxiliary construction which tries to
turn the *entire* Brownian current into triangle curls before projecting out
physical gradients.  It does not test the Douglas inequality and therefore
does not prove or disprove RH.

Write ``xi_std(t)=xi(1/2+i*t)`` in the standard completed normalization and

    Khat(t) = xi_std(t)/2,
    mhat(t) = [xi_std(t+i/2)+xi_std(t-i/2)]/4,
    A(L) = integral_R K(x)K(x+L) dx.

For ``eta=5`` and a prime-power length ``L=log(q)``, the optimized sine
triangle defect has multiplier

    V(theta) = 4 sin(theta/2)^2
        * {1/2 + sin(theta)/(2 theta)
                    - [2 sin(theta/2)/theta]^2},
    theta = eta L.

The expression in braces is the variance of a cosine on an interval, so
``0 <= V <= 4``.  This script proves

    Phi = sum_(q=p^k) Lambda(q)/sqrt(q) A(log q)V(5 log q) < 0.0016,
    mhat(5) > 0.137,                 mhat(10) < 0.019,

and hence the naive sine-sector squared inverse constant

    mhat(5)^2 [c-mhat(10)] / [c Phi],       c=1/4,

is greater than 10.8.  The physical gradient projection omitted by this
construction is exactly why this is not a Douglas/RH counterexample.

The four autocorrelations for q=2,3,4,5 are evaluated by Plancherel,

    A(L) = (1/(4*pi)) integral_0^infinity xi_std(t)^2 cos(Lt) dt.

The integral is cut at 50.  Eight integrations by parts and a fully summed
theta-series bound for ``||K^(8)||_1`` enclose the omitted Fourier tail.  For
q>=6 we use the analytic prime-power-overcounting bound proved with the same
theta estimates in ``triangle_prime_mass_certificate.py``:

    Lambda(q)/sqrt(q) A(log q)
      <= b_q = 4*pi^2*log(q)*q^(7/4)*exp(-pi*q).

The integer tail is geometric with the displayed rigorous ratio.

Reproduce with

    PYTHONPATH=/tmp/pvdeps python3 -u \
      scripts/triangle_fourier_curl_falsifier.py
"""

from fractions import Fraction

from flint import acb, arb, ctx


ctx.prec = 140


def rat(numerator: int, denominator: int = 1) -> arb:
    return arb(numerator) / denominator


PI = arb.pi()
HALF = rat(1, 2)
ETA = arb(5)
C = rat(1, 4)
FOURIER_CUTOFF = arb(50)
DERIVATIVE_ORDER = 8


def xi_standard(z: acb) -> acb:
    """Return the standard entire xi(1/2+i*z)."""
    s = acb(HALF) + acb(0, 1) * z
    return (
        s
        * (s - 1)
        * acb(PI) ** (-s / 2)
        * (s / 2).gamma()
        * s.zeta()
        / 2
    )


def mhat(t: int) -> acb:
    z = acb(t)
    shift = acb(0, HALF)
    return (xi_standard(z + shift) + xi_standard(z - shift)) / 4


M5 = mhat(5)
M10 = mhat(10)
assert 0 in M5.imag
assert 0 in M10.imag
assert M5.real > arb("0.137")
assert M10.real > 0
assert M10.real < arb("0.019")


def derivative_polynomial(alpha: Fraction) -> list[Fraction]:
    """Coefficients of (alpha+2z*d/dz)^8[(2z-3)e^-z]/e^-z."""
    coefficients = [Fraction(-3), Fraction(2)]
    for _ in range(DERIVATIVE_ORDER):
        new = [Fraction(0)] * (len(coefficients) + 1)
        for degree, coefficient in enumerate(coefficients):
            new[degree] += (alpha + 2 * degree) * coefficient
            new[degree + 1] -= 2 * coefficient
        coefficients = new
    return coefficients


def k_derivative_l1_bound() -> arb:
    """Rigorous full-line upper bound for ||K^(8)||_1."""
    alpha_q = Fraction(5, 2)
    alpha = rat(alpha_q.numerator, alpha_q.denominator)
    coefficients = derivative_polynomial(alpha_q)
    retained = arb(0)

    # K is even.  On either half-line its nth theta summand has alpha=5/2.
    # Change variables z=pi*n^2*exp(2x) and sum n<=10 exactly in Arb.
    for n in range(1, 11):
        x = PI * n * n
        for degree, coefficient_q in enumerate(coefficients):
            coefficient = rat(
                abs(coefficient_q.numerator), coefficient_q.denominator
            )
            shape = alpha / 2 + degree
            retained += (
                x ** (1 - alpha / 2)
                * coefficient
                * x.gamma_upper(shape)
                / 2
            )

    # Bound every n>=11 incomplete-gamma term by its first exponential
    # majorant and a geometric ratio, exactly as in the audited multiplier
    # certificate.
    first_n = 11
    first_x = PI * first_n**2
    theta_tail = arb(0)
    for degree, coefficient_q in enumerate(coefficients):
        coefficient = rat(
            abs(coefficient_q.numerator), coefficient_q.denominator
        )
        shape = alpha / 2 + degree
        first = (
            coefficient
            * first_x**degree
            * (-first_x).exp()
            / (2 * (1 - (shape - 1) / first_x))
        )
        ratio = (rat(12, 11) ** (2 * degree)) * (-23 * PI).exp()
        theta_tail += first / (1 - ratio)

    full_line = 2 * (retained + theta_tail)
    assert full_line < arb("1.05e10")
    return full_line


K8_L1 = k_derivative_l1_bound()

# Since |Khat(t)|<=||K^(8)||_1/|t|^8 and xi_std=2*Khat,
# the omitted part of A has absolute value at most the following quantity.
A_TAIL = (
    K8_L1**2
    / (PI * (2 * DERIVATIVE_ORDER - 1) * FOURIER_CUTOFF ** (2 * DERIVATIVE_ORDER - 1))
)
assert A_TAIL < arb("7.7e-8")


def autocorrelation(q: int) -> arb:
    """Rigorous enclosure of A(log q), including the |t|>50 tail."""
    length = arb(q).log()

    def integrand(z: acb, analytic: bool) -> acb:
        return xi_standard(z) ** 2 * (acb(length) * z).cos()

    finite = acb(0)
    for left in range(50):
        finite += acb.integral(
            integrand,
            arb(left),
            arb(left + 1),
            abs_tol=arb("1e-20"),
            rel_tol=arb("1e-20"),
            eval_limit=10000,
        )
    finite /= 4 * PI
    assert 0 in finite.imag
    result = finite.real + arb(0, A_TAIL.upper())
    # For the very small q=4,5 correlations this deliberately coarse common
    # Fourier-tail enclosure may cross zero.  Positivity itself follows from
    # the real-space definition A(L)=int K(x)K(x+L)dx; only the rigorous
    # upper endpoint is used below.
    assert result.upper() > 0
    return result


def curl_factor(q: int) -> arb:
    theta = ETA * arb(q).log()
    variance = (
        HALF
        + theta.sin() / (2 * theta)
        - (2 * (theta / 2).sin() / theta) ** 2
    )
    factor = 4 * (theta / 2).sin() ** 2 * variance
    assert factor > 0
    assert factor < 4
    return factor


PRIME_BASE = {2: 2, 3: 3, 4: 2, 5: 5}
PARTIAL_PHI = arb(0)
AUTOCORRELATIONS: dict[int, arb] = {}
TERMS: dict[int, arb] = {}
for q, prime_base in PRIME_BASE.items():
    autocorrelation_value = autocorrelation(q)
    weight = arb(prime_base).log() / arb(q).sqrt() * autocorrelation_value
    term = weight * curl_factor(q)
    AUTOCORRELATIONS[q] = autocorrelation_value
    TERMS[q] = term
    PARTIAL_PHI += term


# Overcount all prime powers q>=6 by all integers.  For n>=4,
# b_(n+1)/b_n is at most RATIO; this is the audited elementary estimate in
# triangle_prime_mass_certificate.py.
RATIO = rat(3, 2) * rat(25, 16) * (-PI).exp()
assert RATIO < rat(15, 128)
assert RATIO < rat(1, 8)
B6 = 4 * PI**2 * arb(6).log() * arb(6) ** rat(7, 4) * (-6 * PI).exp()
WEIGHT_TAIL = B6 / (1 - RATIO)
PHI_TAIL = 4 * WEIGHT_TAIL
PHI = PARTIAL_PHI + arb(0, PHI_TAIL.upper())

assert PARTIAL_PHI < arb("0.001508")
assert PHI_TAIL < arb("0.000049")
assert PHI < arb("0.0016")


NAIVE_CONSTANT_SQUARED = M5.real**2 * (C - M10.real) / (C * PHI)
assert NAIVE_CONSTANT_SQUARED > rat(54, 5)


print("precision_bits:", ctx.prec)
print("mhat(5):", M5.real)
print("mhat(10):", M10.real)
print("||K^(8)||_1 upper enclosure:", K8_L1)
print("autocorrelation Fourier-tail enclosure:", A_TAIL)
for q in PRIME_BASE:
    print(
        f"q={q} A(log q):", AUTOCORRELATIONS[q],
        "curl contribution:", TERMS[q],
    )
print("q=2,3,4,5 contribution:", PARTIAL_PHI)
print("q>=6 curl-tail upper:", PHI_TAIL)
print("full Phi upper enclosure:", PHI)
print("naive inverse constant squared lower enclosure:", NAIVE_CONSTANT_SQUARED)
print("RESULT: PASS (auxiliary curl inverse falsified; no RH implication)")
