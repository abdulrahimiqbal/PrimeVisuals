#!/usr/bin/env python3
"""Uniform remote-exit charge for the compact pair HJB.

On

    |m| <= 4/5,    r <= 4/5,

both coordinates satisfy |s|<=6/5.  The certificate uses the slightly larger
source envelope |s|<=5/4, which also covers every target of the central-shell
certificate (|m|<17/50 and r<9/5 imply |s|<31/25<5/4).  It bounds the total rate,
summed over both marginals, of every archimedean or prime-power jump whose
new coordinate has absolute value at least 2.  The bound is below 10^-65.

Consequently, for any bounded phase function W, completing a local coupling
by arbitrary remote single-coordinate jumps contributes at most

    10^-65 * osc(W)

to its upward generator ledger.  This does not charge the much more important
returns between shells inside [-2,2]^2; it only removes the genuinely remote
tail from the finite HJB problem.

The proof uses the positive theta expansion.  At t=2 every summand is
positive and its logarithmic derivative is below -300; that derivative is
strictly decreasing in its theta parameter.  Hence

    K(t) <= K(2) exp(-300(t-2)),  t>=2.

For prime powers we overcount Lambda(n) by log(n) and all integers n>=3.
For n>=26, |s +/- log(n)|>=log(n)-5/4 and exp(13/4)<26, giving the convergent
p-series majorant K(2)(26/n)^300.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps:scripts python3 \
      scripts/coupling_compact_remote_exit_certificate.py
"""

from flint import arb, ctx


ctx.prec = 200


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


PI = arb.pi()
TWO = arb(2)
SOURCE_BOUND = q(5, 4)
DECAY = arb(300)


def theta_summand(n: int, t: arb) -> arb:
    nn = arb(n * n)
    v = PI * nn * (2 * t).exp()
    return PI * nn * (q(5, 2) * t).exp() * (2 * v - 3) * (-v).exp()


# Exact K(2) enclosure.  For n>=5, replace 2v-3 by 2v and sum the resulting
# n^4 Gaussian majorant geometrically.
k_two = sum((theta_summand(n, TWO) for n in range(1, 5)), arb(0))
tail_first = 2 * PI**2 * arb(5) ** 4 * arb(9).exp() * (
    -PI * arb(25) * arb(4).exp()
).exp()
tail_ratio = q(6, 5) ** 4 * (
    -PI * arb(11) * arb(4).exp()
).exp()
assert tail_ratio < q(1, 1000)
theta_tail = tail_first / (1 - tail_ratio)
k_two += arb(0, theta_tail)
assert k_two > 0


# For one positive theta summand, d/dt log(S)=
# 5/2+4v/(2v-3)-2v.  Its derivative with respect to v is negative, so the
# n=1,t=2 value controls every summand on t>=2.
v0 = PI * arb(4).exp()
log_derivative_at_v0 = q(5, 2) + 4 * v0 / (2 * v0 - 3) - 2 * v0
derivative_in_v_at_v0 = -12 / (2 * v0 - 3) ** 2 - 2
assert log_derivative_at_v0 < -DECAY
assert derivative_in_v_at_v0 < 0


# The closest remote arch target is distance 2-5/4=3/4.  J decreases and
# J(3/4)<1, so each signed spatial tail is bounded by int_2^infty K(t)dt.
def J(h: arb) -> arb:
    return (-h / 2).exp() / (1 - (-2 * h).exp())


assert J(q(3, 4)) < 1
pair_arch_exit = 4 * k_two / DECAY


# A q=2 jump cannot leave [-2,2] from this core.  For q=3,...,25, each of
# two orientations on each of two coordinates contributes at most
# (log n)/sqrt(n) K(2) when it is an exit.  This overcounts prime powers by
# every integer.
assert SOURCE_BOUND + arb(2).log() < 2
finite_coefficient = sum(
    (arb(n).log() / arb(n).sqrt() for n in range(3, 26)), arb(0)
)


# For n>=26 the coefficient is <1 and decreasing.  Integral comparison gives
# sum_{n>=26}(26/n)^300 <= 1+26/299.
assert arb(26).log() / arb(26).sqrt() < 1
assert q(13, 4).exp() < 26
p_series_bound = 1 + q(26, 299)
pair_prime_exit = 4 * (finite_coefficient + p_series_bound) * k_two


pair_remote_exit = pair_arch_exit + pair_prime_exit
assert pair_remote_exit < arb("1e-65")


print("precision_bits:", ctx.prec)
print("K(2)_enclosure:", k_two)
print("theta_n_ge_5_tail:", theta_tail)
print("log_derivative_at_t2_n1:", log_derivative_at_v0)
print("pair_arch_remote_exit_upper:", pair_arch_exit)
print("pair_prime_remote_exit_upper:", pair_prime_exit)
print("pair_total_remote_exit_upper:", pair_remote_exit)
print("upward_HJB_charge: pair_total_remote_exit_upper * osc(W)")
print("certificate: PASS")
