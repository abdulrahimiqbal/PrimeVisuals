#!/usr/bin/env python3
"""Coupling-independent capacity cut for the first characteristic c-ramp.

Let

    c(u,v)=|m|+(r-2|m|)_+/4,
    m=(u+v)/2,  r=|u-v|,

and let H_0(c)=1+15 S((c-3/10)/(1/20)), with S the clamped cubic
smoothstep.  Thus H_0=16 on c>=7/20 and H_0>=1 everywhere.

At the exact source

    x=1/20,  y=3/4,

one has c=2/5 and H_0=16.  Universally c(u,v)>=max(|u|,|v|)/2.  Hence every
joint transition with H_0(c')<16 must send y into (-7/10,7/10).  Its total
rate under any marginal-correct coupling is therefore bounded by the y
marginal jump capacity of that interval.

The archimedean part of this capacity is integrated by outward-rounded Arb
upper sums.  No positive prime direction can enter the interval.  In the
negative direction the exact inequalities

    1/20 < log(q) < 29/20

leave precisely q=2,3,4 among prime powers.  The script proves that the full
capacity is below 501/1000.  Since the largest possible normalized decrease
per favorable event is 15/16, the negative part of QH_0/H_0 is below 47/100.

Thus no coupling, re-pairing, or use of the item-163 selected reserve can
produce normalized c-phase drift 1/2 at this source for this factor.  Positive
and same-level channels were discarded in the favorable direction, so this
is an upper obstruction rather than a failed construction.

Reproduce with:

    PYTHONPATH=/tmp/pvdeps python3 \
      scripts/coupling_characteristic_capacity_cut_certificate.py
"""

from flint import arb, ctx


ctx.prec = 200


def q(p: int, d: int = 1) -> arb:
    return arb(p) / d


def interval(left: arb, right: arb) -> arb:
    assert right > left
    return arb((left + right) / 2, (right - left) / 2 + arb("1e-55"))


PI = arb.pi()
X = q(1, 20)
Y = q(3, 4)
TARGET = q(7, 10)
PIECES = 131072


def C(x: arb) -> arb:
    return (x / 2).cosh()


def J(h: arb) -> arb:
    assert h > 0
    return (-h / 2).exp() / (1 - (-2 * h).exp())


tail_first = 20 * arb(5) ** 4 * (-arb(3) * 25).exp()
tail_ratio = q(6, 5) ** 4 * (-arb(3) * 11).exp()
theta_tail_bound = tail_first / (1 - tail_ratio)
assert theta_tail_bound < arb("1e-28")
K_TAIL = arb(0, "1e-28")


def k_positive_unchecked(t: arb) -> arb:
    total = arb(0)
    for n in range(1, 5):
        nn = arb(n * n)
        w = PI * nn * (2 * t).exp()
        total += PI * nn * (q(5, 2) * t).exp() * (2 * w - 3) * (-w).exp()
    return total + K_TAIL


def K_positive(t: arb) -> arb:
    assert t >= 0
    assert t < 1
    return k_positive_unchecked(t)


def K_even(t: arb) -> arb:
    if t < 0:
        return K_positive(-t)
    if t > 0:
        return K_positive(t)
    radius = max(abs(t.lower()), abs(t.upper()))
    # The signed evaluation encloses the positive-branch range on [0,radius].
    return k_positive_unchecked(arb(0, radius))


def arch_capacity_upper() -> arb:
    width = 2 * TARGET / PIECES
    total = arb(0)
    for index in range(PIECES):
        lo = -TARGET + index * width
        z = interval(lo, lo + width)
        assert Y - z > 0
        density = K_even(z) * J(Y - z) / C(Y)
        total += density.upper() * width
    return total


LOG2 = arb(2).log()
LOG3 = arb(3).log()
LOG4 = arb(4).log()
LOG5 = arb(5).log()

# Exact prime-power enumeration for y-log(q) in (-7/10,7/10).
assert LOG2 > q(1, 20)
assert LOG4 < q(29, 20)
assert LOG5 > q(29, 20)
assert Y + LOG2 > TARGET


def inward_rate(logq: arb, mangoldt: arb, sqrtq: arb) -> arb:
    return mangoldt / sqrtq * K_even(Y - logq) / C(Y)


arch_capacity = arch_capacity_upper()
prime_capacity = (
    inward_rate(LOG2, LOG2, arb(2).sqrt())
    + inward_rate(LOG3, LOG3, arb(3).sqrt())
    + inward_rate(LOG4, LOG2, arb(2))
)
total_capacity = arch_capacity + prime_capacity
normalized_negative_capacity = q(15, 16) * total_capacity

assert total_capacity < q(501, 1000)
assert normalized_negative_capacity < q(47, 100)


print("precision_bits:", ctx.prec)
print("source_(x,y):", X, Y)
print("source_(m,r,c):", (X + Y) / 2, Y - X, q(2, 5))
print("arch_target_capacity_upper:", arch_capacity)
print("prime_q234_capacity:", prime_capacity)
print("total_favorable_event_capacity_upper:", total_capacity)
print("normalized_negative_generator_upper:", normalized_negative_capacity)
print("obstruction_threshold:", q(1, 2))
print("certificate: PASS")
