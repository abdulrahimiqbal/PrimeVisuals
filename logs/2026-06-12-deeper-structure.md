# 2026-06-12 - deeper structure: rough-row visibility

Goal: find a reformulation that teaches prime structure through a different
world object, not a zero-free multiplier twist of a catalog prime object.

Prior-log/HANDOFF check: no `HANDOFF` file or prior
`logs/*deeper-structure*` file was present at session start. The L2/E2
object in `logs/2026-06-12-novel-equivalent.md` and `KNOWLEDGE.md` was read
first and treated as dead for this goal because it is an invertible
multiplier transform of psi.

## Predeclared nulls

1. Dead if the object is defined using primality, mu, Lambda, or
   prime-indexed sums.
2. Dead if its Dirichlet/generating series is a catalog RH object times a
   zero-free bounded multiplier, the L2 failure mode.
3. Not complete if the bridge only renames the size of a residual.
4. Not complete if Cramer fakes with the same integrated main term also
   satisfy the new world-B constraint.

## New object candidate: row visibility

For integers `n >= 1` and `y >= 1`, define

```text
L_y = lcm(1,2,...,floor(y))
G_y(n) = 1 if gcd(n, L_y) = 1, and 0 otherwise.
```

Equivalent computation, avoiding the enormous lcm:

```text
G_y(n) = 1  iff  no integer d with 2 <= d <= floor(y) divides n.
```

This is a lattice/divisibility object: the visible columns on the horizontal
row with height `L_y`. It uses gcd, divisibility, and lcm only; it does not
test primality and does not use mu/Lambda/prime-indexed sums in the
definition.

The implemented default table uses `y=floor(sqrt(N))` for a lab range
`1..N`:

```text
rowvis(n)   = G_floor(sqrt(N))(n)
rowcount(n) = sum_{m<=n} rowvis(m)
rowgap(n)   = distance from the previous visible row-column, if n is visible
rowrun(n)   = current invisible desert length ending at n
```

The two-argument function `rowvis(n,a)` evaluates the literal predicate
against `L_floor(a)`.

## Factor check

For fixed `y`, `G_y(n)` is periodic modulo `L_y`. Its Dirichlet series is

```text
D_y(s) = sum_{n>=1} G_y(n)n^(-s)
       = zeta(s) * product_{p | L_y}(1 - p^(-s)).
```

Equivalently, the finite multiplier is

```text
sum_{d | rad(L_y)} mu(d)d^(-s).
```

As an analytic Dirichlet-series candidate, this **fails the upgraded factor
check**: in the half-plane where the nontrivial zeta zeros matter, the
finite Euler multiplier is zero-free and bounded, so any zero-location
statement read from `D_y` is just zeta again. The finite Euler factor has
zeros on the boundary line `Re(s)=0` at `s = 2*pi*i*k/log p`, but that does
not rescue it as an RH reformulation.

Verdict: dead as a Dirichlet-series RH candidate. Kept below only as a
finite lattice/divisibility dictionary for prime spacings.

Ordinary generating series for fixed `y` is rational:

```text
sum_{n>=1} G_y(n) z^n = P_y(z) / (1 - z^L_y),
```

where `P_y` records the visible residue classes modulo `L_y`.

## Exact bridge to prime spacings

Let `N >= 4` and `y=floor(sqrt(N))`.

**Theorem.** For every integer `n` with `y < n <= N`,

```text
G_y(n) = 1  iff  n is prime.
```

Proof:

- If `n` is prime and `n > y`, then no integer `d` with `2 <= d <= y`
  divides `n`, so `G_y(n)=1`.
- If `n` is composite and `n <= N`, then it has a divisor
  `d` with `2 <= d <= sqrt(n) <= sqrt(N)`. Since `d` is an integer,
  `d <= floor(sqrt(N)) = y`, so `G_y(n)=0`.

Therefore the visible-row gaps among the `G_y` survivors in `(y,N]` are
exactly the consecutive prime gaps in that same interval. More generally,
if consecutive primes `p < q` satisfy `p > y` and `q <= y^2`, then the
prime gap `q-p` is exactly a visible-column gap on row `L_y`.

This moves information in both directions:

- A divisibility/lattice statement about visible deserts on row `L_y`
  immediately becomes a statement about prime gaps below `y^2`.
- A prime gap ending below `y^2` is an exact certificate that the
  divisor-world row has an invisible desert of the same length.

Status: exact and Lean-stub-ready, but the classical content is the
Legendre/Eratosthenes sieve. This is a good exhibit and a real different
world bridge, but not yet the deeper nontrivial theorem needed to close the
goal.

## Concrete prime-pattern statement

For every `N >= 4`, all primes in `(sqrt(N), N]` must occupy visible
columns of row `L_floor(sqrt(N))`, and all visible columns in that interval
are primes. Consequently, every prime gap in `(sqrt(N), N]` is exactly a
visible-row desert, with the same start, end, and length.

Numerical checks used the integrated main term

```text
Li(N) - Li(floor(sqrt(N))) = integral_{floor(sqrt(N))}^{N} dt / log(t)
```

not `N/log N`.

Artifact:

```text
logs/rough-visibility-artifacts/numerics.json
```

| N | y | visible count | integrated Li main | count-Li | bridge mismatches | max real row/prime gap | max gap / log(start) |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000,000 | 1,000 | 78,330 | 78,449.9395 | -119.9395 | 0 composites visible, 0 primes missing | 114 at 492113 -> 492227 | 8.697998 |
| 10,000,000 | 3,162 | 664,133 | 664,455.4787 | -322.4787 | 0 composites visible, 0 primes missing | 154 at 4652353 -> 4652507 | 10.030689 |

Five-seed Cramer contrast using the app's existing small-modulus Cramer
model (`2,3` kept, odd numbers coprime to 6 sampled with probability
`3/log n`):

| N | fake counts minus Li | fake row-invisible rate | fake max gap range |
| ---: | --- | --- | --- |
| 1,000,000 | -384.94 to +509.06 | 0.762168 to 0.764222 | 124 to 150 |
| 10,000,000 | -688.48 to +2195.52 | 0.799429 to 0.800104 | 174 to 244 |

Interpretation: the Cramer fakes match the integrated count at the right
scale, but they do not live on the visible row. At `N=10^7`, about four out
of five fake primes above `sqrt(N)` land in columns already blocked by
some divisor `2..floor(sqrt(N))`; the real primes have zero such violations.

This is not a residual-size claim. It constrains the geometry and ordering
of prime spacings: prime gaps in this window are exactly the deserts left
by divisor shadows on a row of the integer lattice.

## Implementation

Files changed:

- `src/core/math.js`: `rowVisibleValue`, `rowVisibilityTable`, and default
  `rowvis/rowcount/rowgap/rowrun` integer tables.
- `src/core/engine.js`: formula functions `rowvis`, `rowcount`, `rowgap`,
  `rowrun`.
- `src/PrimeVisuals.jsx`: lab token buttons for the new functions.
- `scripts/rough-visibility.mjs`: reproducible two-range numerics and
  five-seed Cramer contrast.
- `tests/math.test.js`, `tests/engine.test.js`: direct predicate checks,
  table checks, exact survivor-to-prime bridge, gap identity, and formula
  evaluator coverage.
- `MACHINE_HOW_TO_USE.md`: documented the new lab functions.

Verification:

```text
npx vitest run tests/math.test.js tests/engine.test.js --environment node --pool threads
-> 2 files passed, 76 tests passed

npm run build
-> built successfully

npm test
-> still blocked by the existing jsdom/html-encoding-sniffer ERR_REQUIRE_ESM worker startup issue
```

## Exhibit

Live row-desert view:

```text
http://127.0.0.1:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwLCJ0TWF4Ijo2MCwic01heCI6MS42LCJleCI6Im4iLCJleSI6InJvd3J1bihuKSIsImVoIjoicm93dmlzKG4pIiwiZXciOiJzIiwiYSI6MTQxLCJiIjoxfX0
```

Live row-gap view:

```text
http://127.0.0.1:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwLCJ0TWF4Ijo2MCwic01heCI6MS42LCJleCI6Im4iLCJleSI6InJvd2dhcChuKSIsImVoIjoicm93Z2FwKG4pL2xvZyhtYXgobiwzKSkiLCJldyI6InMiLCJhIjoxNDEsImIiOjF9fQ
```

Shots:

```text
logs/rough-visibility-artifacts/rowrun-shot.png
logs/rough-visibility-artifacts/rowgap-shot.png
```

## Lean-stub-ready statement

```lean
def rowVisible (y n : Nat) : Prop :=
  Nat.Coprime n (Finset.lcm (Finset.Icc 1 y) id)

def RowGap (y a b : Nat) : Prop :=
  a < b ∧ rowVisible y a ∧ rowVisible y b ∧
  (∀ n, a < n -> n < b -> ¬ rowVisible y n)

theorem rowVisible_iff_prime_in_sqrt_window
    (N y n : Nat)
    (hy : y = Nat.floor (Real.sqrt N))
    (hn0 : 4 <= N)
    (hlo : y < n)
    (hhi : n <= N) :
    rowVisible y n ↔ Nat.Prime n := by
  -- Expand rowVisible as no divisor 2..y.
  -- Prime -> no small divisor.
  -- Composite -> choose d with 2 <= d <= sqrt n.
  -- Since n <= N and y=floor(sqrt N), d <= y.
  sorry

theorem prime_gap_eq_row_gap_in_sqrt_window
    (N y p q : Nat)
    (hy : y = Nat.floor (Real.sqrt N))
    (hpq : ConsecutivePrimes p q)
    (hp : y < p)
    (hq : q <= N) :
    RowGap y p q := by
  -- Use rowVisible_iff_prime_in_sqrt_window at p, q, and every n between.
  sorry
```

## Phase-4 expert pack

Object:

```text
G_y(n)=1_{gcd(n,lcm(1..floor(y)))=1}.
```

Bridge:

```text
For y=floor(sqrt(N)), G_y(n)=1 on (y,N] exactly at the primes.
Therefore visible-row gaps on (y,N] are exactly prime gaps on (y,N].
```

Factor check:

```text
sum G_y(n)n^(-s) = zeta(s) product_{p|L_y}(1-p^(-s)).
```

This is dead as an analytic RH candidate: in the zeta-zero half-plane the
finite factor is a zero-free bounded multiplier. The finite row-gap bridge
is still useful as a baseline geometric dictionary, not as a new
reformulation.

Numerics:

At `N=10^6` and `N=10^7`, exhaustive scans found zero bridge mismatches in
the target window. Counts were compared to the integrated main term
`integral dt/log t`, and Cramer fakes with matched density failed the row
constraint at rates near `76%` and `80%`.

Verdict:

This is a live different-world exhibit and it teaches a geometric fact about
prime spacings, but it should not close the goal. It fails the analytic
factor check, and the finite bridge is the trial-division sieve. The missing
hard step is a nontrivial theorem about visible-row deserts,
Jacobsthal-type structure, or covering-system extremals that gives a
prime-spacing constraint not already contained in trial division.

## WHAT THIS TEACHES ABOUT PRIMES

A prime larger than `sqrt(N)` is exactly a number whose column stays visible after every divisor from `2` to `sqrt(N)` has cast its shadow.
So the gaps between such primes are not just random empty spaces; they are the empty corridors left by a lattice-visibility process.
A Cramer fake with the right average count misses this geometry badly, placing about four out of five fake primes in columns that the divisor lattice has already blocked by `N=10,000,000`.

## HANDOFF

Open status: this candidate is implemented, tested, visualized, and logged,
but the goal remains open. Next session should keep `rowvis/rowgap` as a
baseline exhibit and hunt for a genuinely nontrivial world-B theorem about
row deserts, likely via the Jacobsthal function of `lcm(1..y)`, covering
systems, or extremal visible-lattice gaps. If the same gap persists for a
second session, emit a STUCK PACK: "find a nontrivial bound or structural
law for the longest gap between integers coprime to `lcm(1..y)` that
translates to a prime-gap pattern below `y^2`, beyond the trial-division
identity."

---

## Continuation - rough witnesses inside prime gaps

Source theorem checked:

- Gafni and Tao, "Rough numbers between consecutive primes",
  `https://arxiv.org/abs/2508.06463`.
- Tao expository post, "Rough numbers between consecutive primes",
  `https://terrytao.wordpress.com/2025/08/10/rough-numbers-between-consecutive-primes/`.

This is not an RH reformulation, so it does not close the original goal.
It is, however, the first candidate in this log whose dictionary moves a
non-residual prime-spacing fact in a genuinely geometric way.

## New object candidate: interval rough witness count

For integers `a >= 0` and `h >= 0`, define

```text
R(a,h) = #{m : a < m < a+h and gcd(m, lcm(1,2,...,h-1)) = 1}.
F(a,h) = first m-a with a < m < a+h and gcd(m, lcm(1,2,...,h-1)) = 1,
         or 0 if no such m exists.
```

Equivalently, `R(a,h)` counts interior points of the interval `(a,a+h)`
with no divisor in `2..h-1`. This definition uses only interval geometry,
divisibility, gcd/lcm, and counting. It has no primality test, no mu/Lambda,
and no prime-indexed sum.

In the app:

```text
roughcount(a,h) = R(a,h)
roughfirst(a,h) = F(a,h)
```

## Factor check

For fixed `h`, the atom `1_{gcd(m,lcm(1..h-1))=1}` has the same finite-row
Dirichlet series as `rowvis`, namely

```text
zeta(s) * product_{p | lcm(1..h-1)} (1 - p^(-s)).
```

So it is dead as a Dirichlet-series RH candidate: in the zeta-zero
half-plane the finite multiplier is zero-free and bounded. The candidate is
kept only as a finite interval statistic licensed by a prime-gap theorem,
not as an analytic equivalent.

## Dictionary to prime patterns

For a consecutive prime gap `(p_n, p_{n+1})`, write

```text
h_n = p_{n+1} - p_n.
```

Then

```text
R(p_n, h_n) > 0
```

means exactly: the prime gap contains an integer whose least divisor is at
least the gap length. Since no integer inside a prime gap is prime, this is
equivalent to the Gafni-Tao "rough number inside the gap" condition.

Named theorem used, one-directional:

Let `N(X)` be the number of prime gaps `(p_n,p_{n+1})` with
`p_n in [X,2X]` and `R(p_n,p_{n+1}-p_n)=0`. Gafni-Tao prove

```text
N(X) << X / log^2 X.
```

Under the Hardy-Littlewood prime tuples conjecture they give a sharper
asymptotic

```text
N(X) ~ c X / log^2 X
```

for an explicit constant `c`, believed numerically to be about `2.7..2.8`.

Prime-pattern statement licensed by the bridge:

```text
All but O(X/log^2 X) prime gaps starting in [X,2X] contain an interior
integer m whose divisor shadow avoids every divisor < p_{n+1}-p_n.
```

This constrains the internal geometry of prime gaps, not the size of a
summatory residual. Exceptions are not random missing primes; they are gaps
whose entire interior is covered by divisor shadows below the gap length.

Two useful exact special cases:

- Every twin-prime gap `(p,p+2)` has the witness `p+1`.
- Every cousin-prime gap `(p,p+4)` with `p>3` is an exception: the three
  interior integers are divisible by `2`, `3`, and `2`.

## Numerics

Artifact:

```text
logs/rough-gap-artifacts/numerics.json
```

Main terms were integrated, not replaced by endpoint approximations:

```text
gap-count scale:      integral_X^(2X) dt/log t
exception-count scale: integral_X^(2X) dt/log^2 t
```

Real primes:

| X | gaps checked | gap-count main | exceptions | exception rate | exception / `integral dt/log^2t` | avg witnesses | largest exception |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 100,000 | 8,392 | 8,406.243 | 1,939 | 0.231053 | 2.743172 | 1.288132 | `134293 -> 134327`, gap 34 |
| 1,000,000 | 70,435 | 70,427.284 | 13,590 | 0.192944 | 2.739383 | 1.567246 | `1756709 -> 1756747`, gap 38 |

Five-seed Cramer contrast using the app's small-modulus Cramer model:

| X | seed | gaps | exceptions | exception rate | exception / `integral dt/log^2t` | avg witnesses |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100,000 | 12345 | 8,352 | 1,429 | 0.171097 | 2.021657 | 1.755747 |
| 100,000 | 271828 | 8,385 | 1,476 | 0.176029 | 2.088149 | 1.737150 |
| 100,000 | 314159 | 8,371 | 1,468 | 0.175367 | 2.076831 | 1.744594 |
| 100,000 | 161803 | 8,461 | 1,443 | 0.170547 | 2.041463 | 1.731710 |
| 100,000 | 424242 | 8,370 | 1,405 | 0.167861 | 1.987703 | 1.756272 |
| 1,000,000 | 12345 | 70,393 | 10,610 | 0.150725 | 2.138694 | 2.048002 |
| 1,000,000 | 271828 | 70,362 | 10,356 | 0.147182 | 2.087495 | 2.050652 |
| 1,000,000 | 314159 | 70,302 | 10,554 | 0.150124 | 2.127406 | 2.050482 |
| 1,000,000 | 161803 | 70,288 | 10,492 | 0.149272 | 2.114909 | 2.047476 |
| 1,000,000 | 424242 | 70,832 | 10,527 | 0.148619 | 2.121964 | 2.035252 |

Interpretation:

The real-prime normalized exception count is stable at `2.74`, right in
the `2.7..2.8` constant range expected by the Gafni-Tao conditional model.
The Cramer fakes have the same gap-count scale but produce fewer exceptions
and more rough witnesses per gap. In this test, density-matched random
primes are too generous: their fake gaps are easier to thread with a
rough interior point than real prime gaps are.

## Implementation

Additional files/edits:

- `src/core/math.js`: `roughIntervalWitnesses(start,width)`.
- `src/core/engine.js`: lab functions `roughcount(start,width)` and
  `roughfirst(start,width)`.
- `src/PrimeVisuals.jsx`: formula token buttons for the rough interval
  functions.
- `scripts/rough-gaps.mjs`: dyadic-range real/Cramer numerical audit.
- `tests/math.test.js`, `tests/engine.test.js`: direct examples and formula
  evaluator coverage.
- `logs/rough-gap-artifacts/numerics.json`: full numerical artifact.
- `logs/rough-gap-artifacts/roughcount-shot.png`: live app shot.
- `logs/rough-gap-artifacts/rough-gap-summary.svg`: compact contrast chart.

Verification:

```text
npx vitest run tests/math.test.js tests/engine.test.js --environment node --pool threads
-> 2 files passed, 79 tests passed

npm run build
-> built successfully
```

Live exhibit:

```text
http://127.0.0.1:5173/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6InByaW1lIiwiTiI6MjAwMDAwLCJ0TWF4Ijo2MCwic01heCI6MS42LCJleCI6Im4iLCJleSI6InJvdWdoY291bnQobixnYXAobikpIiwiZWgiOiJnYXAobikiLCJldyI6InMiLCJhIjo2LCJiIjoxfX0
```

## Lean-stub-ready statement

```lean
def roughInteriorCount (a h : Nat) : Nat :=
  ((Finset.Ioo a (a+h)).filter
    (fun m => Nat.Coprime m (Finset.lcm (Finset.Icc 1 (h-1)) id))).card

def primeGapHasRoughWitness (p q : Nat) : Prop :=
  Nat.Prime p ∧ Nat.Prime q ∧ p < q ∧
  (∀ r, p < r -> r < q -> ¬ Nat.Prime r) ∧
  0 < roughInteriorCount p (q-p)

def RoughExceptionCount (X : Nat) : Nat :=
  ((primeGapsStartingIn X (2*X)).filter
    (fun gap => roughInteriorCount gap.start (gap.stop-gap.start) = 0)).card

theorem Gafni_Tao_rough_gap_bound :
  IsBigO atTop
    (fun X : Nat => (RoughExceptionCount X : Real))
    (fun X : Nat => (X : Real) / (Real.log X)^2) := by
  -- Imported/named theorem: Gafni-Tao, rough numbers between consecutive primes.
  sorry
```

## Phase-4 expert pack

Object:

```text
R(a,h)=#{m:a<m<a+h and gcd(m,lcm(1..h-1))=1}.
```

Bridge:

For a consecutive prime gap `(p_n,p_{n+1})`, `R(p_n,p_{n+1}-p_n)>0` says
that the gap contains an interior number with no divisor smaller than the
gap length. Gafni-Tao prove that only `O(X/log^2X)` gaps starting in
`[X,2X]` fail this condition.

Factor check:

Fixed-width row visibility factors through `zeta(s)` times a finite
zero-free Euler multiplier in the RH half-plane, so it is dead as an
analytic reformulation. The value here is not analytic equivalence; it is
a prime-gap geometry theorem.

Numerics:

At `X=10^5` and `X=10^6`, real normalized exception counts are `2.743` and
`2.739` against the integrated `dt/log^2t` scale. Five Cramer seeds are
lower, about `1.99..2.14`, and have more rough witnesses per fake gap.

Verdict:

This is the best progress so far on criterion 3: it constrains internal
prime-gap geometry, not a residual size. It still does not close the
original RH-reformulation goal because the bridge is a one-directional
prime-gap theorem rather than an RH equivalent.

## WHAT THIS TEACHES ABOUT PRIMES

Almost every prime gap contains a composite number that has no small divisor relative to the gap length.
The rare exceptions are gaps whose whole interior is covered by small divisor shadows, such as every cousin-prime gap after `3,7`.
Random Cramer-style fake primes with the same broad density make too few of these exceptions, so this is a real geometric constraint on how primes sit among composite numbers.

## HANDOFF 2

Open status: goal remains active. The rough-gap candidate gives a genuine
prime-pattern dictionary and a live exhibit, but it is not an RH
reformulation. Next best directions:

1. Try to compose rough-gap geometry with a catalog RH bridge, e.g. ask
   whether Robin/Nicolas/Farey extremal failures force abnormal rough-gap
   exception statistics.
2. Continue the "different world with theorem" route in Farey or divisor
   extremes, but require an RH-equivalent endpoint rather than only a
   prime-gap theorem.
3. Keep the row/Jacobsthal gap on watch, but no STUCK PACK is due yet
   because this session found and implemented the Gafni-Tao rough-gap
   bridge instead of remaining stuck on the same derivation gap.

# Continuation - Landau optimal permutation profiles

## Sources checked

- Deléglise-Nicolas, "The Landau function and the Riemann Hypothesis",
  arXiv:1907.07664.
- AIM Problem List, "maximal order of an element in the symmetric group".
- Deléglise-Nicolas-Zimmermann, "Landau's function for one million
  billions".

Relevant catalog bridge: Landau's function `g(n)` is the maximal order of
an element of the symmetric group `S_n`. The classical reduction writes
`g(n)=max_{ell(M)<=n} M`, where `ell(M)` is the sum of the prime-power
parts of `M`. The Massias-Nicolas-Robin style criterion is the catalog
equivalence

```text
RH <=> log g(n) < sqrt(Li^{-1}(n)) for all sufficiently large n
```

with sharper "all n" variants in the later Deléglise-Nicolas work.

## Candidate

Define `P(n)` as the canonical cycle profile of a permutation of degree
`n` with maximal order. This is a pure permutation-world object:

```text
P(n) = lexicographically sorted cycle lengths of an order-maximizing
       element of S_n, padded by fixed points if the used length is < n.
```

No primality test is needed to state it. The prime-power knapsack only
appears in the theorem that computes it.

The statistic tested here was not the catalog growth residual. It was the
"frontier-hole" profile: after converting `P(n)` through the Landau
prime-power dictionary, count bases below the largest selected base that
are omitted from the optimal profile, and record the longest consecutive
run of such omissions.

Predeclared null:

```text
If real-prime frontier holes look like the same statistic for Cramer fake
prime bases, the profile statistic has not moved usable information about
prime patterns.
```

## Factor check

There is no natural Dirichlet series for the extremal profile statistic;
the object is not multiplicative and is produced by a constrained
maximization over permutations. This avoids the exact L2 failure mode
("catalog RH object times zero-free multiplier"). It does not by itself
make the candidate useful: the MNR bridge already accounts for the growth
of `log g(n)`, and a new profile statistic still has to teach something
separate about primes.

## Exact derivation

Classical reduction:

1. The order of a permutation is the lcm of its cycle lengths.
2. If `M=prod p_i^a_i`, then the cheapest permutation whose order is
   divisible by `M` uses cycles of lengths `p_i^a_i`, so its required
   length is `ell(M)=sum p_i^a_i`.
3. Therefore `g(n)=max_{ell(M)<=n} M`; equivalently, choose at most one
   power of each base prime, with weight `p^a` and profit `log(p^a)`.

This gives an exact multiple-choice knapsack implementation.

Exchange-shield lemma:

Let an optimal profile for degree `n` have used length `L` and slack
`s=n-L`. Let `p` be an omitted base below the largest selected base. Then
there is no selected cycle length `q` such that

```text
p - s <= q < p.
```

Otherwise replacing `q` by `p` would use at most `L+s=n` total length and
would strictly increase the order. The script checks this condition for
every computed profile; every real and Cramer run below had zero
violations.

This is exact, but it is mostly an optimality certificate. The hard part
would be turning it into a non-tautological prime-spacing or prime-ordering
constraint.

## Numerics

Implementation:

- `scripts/landau-profile.mjs`
- `logs/landau-profile-artifacts/numerics.json`
- `logs/landau-profile-artifacts/summary.json`

For each `N`, profiles were computed for all `n in [N/2,N]` and compared
with five Cramer fake-prime base sets using seeds
`12345,271828,314159,161803,424242`.

Range `N=1000`, real primes:

```text
avg frontier holes       0.528942
max frontier holes       3
max consecutive holes    3
avg slack                1.385230
max slack                5
exchange violations      0
avg frontier base        74.880240
```

Cramer contrast at `N=1000`:

```text
seed 12345   avg holes 0.650699   max holes 3   max run 3   violations 0
seed 271828  avg holes 0.636727   max holes 4   max run 3   violations 0
seed 314159  avg holes 0.441118   max holes 3   max run 3   violations 0
seed 161803  avg holes 0.600798   max holes 4   max run 4   violations 0
seed 424242  avg holes 0.622754   max holes 3   max run 3   violations 0
```

Range `N=5000`, real primes:

```text
avg frontier holes       1.065174
max frontier holes       4
max consecutive holes    4
avg slack                1.704918
max slack                11
exchange violations      0
avg frontier base        191.493403
```

Cramer contrast at `N=5000`:

```text
seed 12345   avg holes 1.021192   max holes 4   max run 4   violations 0
seed 271828  avg holes 0.916034   max holes 4   max run 4   violations 0
seed 314159  avg holes 1.116753   max holes 6   max run 6   violations 0
seed 161803  avg holes 1.050380   max holes 5   max run 5   violations 0
seed 424242  avg holes 1.085166   max holes 7   max run 7   violations 0
```

Representative exact profiles:

```text
n=1000:
parts = 11,13,17,19,23,25,27,29,31,32,37,41,43,47,49,53,59,61,67,71,73,83,89
length = 1000, slack = 0, frontier base = 89, holes = 1

n=5000:
parts = 11,13,16,17,19,23,25,27,29,31,37,41,43,47,49,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,229,233
length = 5000, slack = 0, frontier base = 233, holes = 2
```

Worst real hole runs:

```text
N=1000: n=510/511 has maxBase 71 and a 3-hole run.
N=5000: n=4576/4577/4630 has maxBase 233 and a 4-hole run.
```

## Verdict

GRAVEYARD / progress tool, not a candidate close.

The exact exchange-shield lemma is real and checkable, and it lives in the
permutation world. But the measured frontier-hole statistic is
Cramer-similar at these ranges, so it does not yet license a concrete new
statement of the required form "primes must exhibit pattern X because of
permutation-world fact Y." The MNR bridge remains valuable, but this
profile statistic only repackages the local optimality of the knapsack.

## Lean-stub-ready statement

```lean
def permOrder (sigma : Equiv.Perm (Fin n)) : Nat := sigma.orderOf

def IsLandauProfile (n : Nat) (parts : List Nat) : Prop :=
  parts.Sum <= n /\
  (forall k in parts, 0 < k) /\
  forall other : List Nat,
    other.Sum <= n ->
    Nat.lcmList other <= Nat.lcmList parts

-- Classical imported theorem:
theorem landau_prime_power_knapsack
  (n : Nat) :
  landau n =
    max { M : Nat | primePowerLength M <= n } := by
  sorry

theorem landau_exchange_shield
  (n s p q : Nat) :
  IsLandauPrimePowerProfile n profile ->
  slack profile n = s ->
  omittedBaseBelowFrontier profile p ->
  selectedCycleLength profile q ->
  q < p ->
  p - s <= q ->
  False := by
  -- Replace q by p; length stays <= n and product/order increases.
  sorry
```

## WHAT THIS TEACHES ABOUT PRIMES

Maximal-order permutations prefer almost all prime bases below a moving
frontier, but they can skip short blocks near that frontier when larger
cycles pay better.
The exact no-swap rule says a skipped prime base must be shielded by slack
and by the absence of any slightly smaller selected cycle.
In the tested ranges, random Cramer-style prime bases obey the same rule
with similar hole counts, so this does not yet reveal a prime pattern that
distinguishes the actual primes.

## HANDOFF 3

Open status: goal remains active. The Landau profile script is useful for
future MNR-side experiments, but the tested hole/run statistic should not
be reused as-is. Possible next moves:

1. In the Landau world, test sharper "superchampion" transition structure
   rather than raw frontier holes; that may interact with actual prime gaps
   more rigidly than the local exchange shield.
2. Try divisor-world extremes next: Robin/superabundant/colossally
   abundant objects already have a catalog RH bridge and may expose
   exponent-pattern constraints rather than residual size.
3. Try Farey/Stern-Brocot gap geometry beyond Franel-Landau, but
   predeclare a non-residual statistic before computing.

# Continuation - extremely abundant frontier primes

## Sources checked

- Akbary-Friggstad, "Superabundant numbers and the Riemann hypothesis",
  Amer. Math. Monthly 116 (2009), 273-275.
- Alaoglu-Erdos, "On highly composite and similar numbers", Trans. Amer.
  Math. Soc. 56 (1944), 448-469.
- Nazardonyavi-Yakubovich, "Extremely Abundant Numbers and the Riemann
  Hypothesis", Journal of Integer Sequences 17 (2014), Article 14.2.8.
- OEIS A004394 b-file, T. D. Noe's superabundant-number prefix table.

Useful source facts:

```text
Robin: RH <=> sigma(n) < exp(gamma) n log log n for every n > 5040.
Akbary-Friggstad: if Robin's inequality has a least counterexample, it is superabundant.
Nazardonyavi-Yakubovich: XA is infinite iff RH is true; a least Robin counterexample is XA.
Alaoglu-Erdos: an SA number has consecutive prime support and nonincreasing exponents.
Nazardonyavi-Yakubovich: some primes cannot be largest prime factor of any XA number; p=149 is an example.
```

## Candidate

Define the divisor-record sequence

```text
XA = {10080} union {n > 10080 :
       sigma(n)/(n log log n) > sigma(m)/(m log log m)
       for every 10080 <= m < n}.
```

This is a different-world object: only divisors and a record condition
enter the definition. There is no primality test, no `mu`, no `Lambda`,
and no prime-indexed sum.

Prime content enters through theorems:

1. `XA subset SA`.
2. Every SA number has factorization
   `2^a2 3^a3 ... p^ap` with consecutive prime support and
   `a2 >= a3 >= ... >= ap >= 1`.
3. `#XA = infinity` is equivalent to RH.

The tested non-residual statistic is the **frontier prime set**

```text
F_XA(Y) = {p(n) : n in XA, p(n) <= Y},
```

where `p(n)` is the largest prime factor supplied by the SA/XA theorem.
The prime-pattern question is not "how large is the Robin residual"; it
is which primes are allowed to serve as the moving endpoint of an
RH-relevant divisor-record integer.

Predeclared null:

```text
If the skipped/used frontier pattern for real XA records looks like the
same fixed-shape record test after replacing the prime bases by Cramer
fake bases, then the statistic has not yet isolated a real prime pattern.
```

## Factor check

The object is a record/extremal sequence for `sigma(n)/(n log log n)`, not
a multiplicative arithmetic function. There is no useful Dirichlet series
whose Euler product could factor as a catalog RH object times a zero-free
multiplier. The catalog RH bridge is Robin/XA itself, so the risk here is
not an L2-style inert multiplier; the risk is only that the frontier
statistic is already-known or purely finite.

## Exact derivation

Start with

```text
f(n) = sigma(n)/(n log log n).
```

Nazardonyavi-Yakubovich define XA as record values of `f` after `10080`,
with `10080` included as the initial term. Their Theorem 6 says a least
counterexample to Robin's inequality is XA. Their Theorem 7 says RH is
true iff XA is infinite. Proposition 5 gives `XA subset SA`.

For computation, Alaoglu-Erdos give the structural theorem for SA:

```text
n in SA => n = 2^a2 3^a3 ... p^ap
           with a2 >= a3 >= ... >= ap >= 1,
           and ap = 1 except n=4,36.
```

Thus a finite published prefix of SA numbers is an exact finite search
space for XA records inside that prefix. The script factors each listed SA
number, computes

```text
sigma(n)/n = product_{q^a || n} (1 - q^(-a-1))/(1 - q^(-1)),
```

then scans for records of `f(n)`.

The finite prime-pattern statement checked here:

```text
In the first 600 superabundant numbers, the XA frontier primes are
7, 113, 127, 131, 137, 139, 151, 157, 163, 167, 173, 179, 181, 191, 193.
In particular, 149 is skipped: it is prime, lies between two used
frontiers 139 and 151, and is not the largest prime factor of any XA
record in this prefix.
```

The stronger source statement is that `p(n)=149` cannot occur for any XA
number. This is exactly the kind of prime-ordering/content statement the
goal asks for, but it is imported from the XA paper rather than newly
proved here.

## Implementation

New files/artifacts:

- `scripts/extremely-abundant-oeis.mjs`: downloads/caches the OEIS
  A004394 b-file, scans the first `K` SA numbers, extracts XA records, and
  runs the fixed-shape Cramer contrast.
- `scripts/divisor-extremes.mjs`: independent recursive prefix-exponent
  generator for bounded-log exploratory runs; useful below the first
  nontrivial XA but too slow for `log n >= 126` without optimization.
- `logs/divisor-extremes-artifacts/b004394.txt`: cached OEIS source.
- `logs/divisor-extremes-artifacts/xa-oeis-prefix.json`: exact finite
  scan over the first 600 SA numbers.
- `logs/divisor-extremes-artifacts/numerics.json` and `summary.json`:
  exploratory recursive real/Cramer runs at log limits `40,70`.
- `logs/divisor-extremes-artifacts/xa-frontier-summary.svg`: compact
  visual summary.

## Numerics

OEIS-prefix scan:

```text
SA prefix scanned          s1..s600
max scanned log n          204.6251378837
XA records found           22
max XA frontier            193
used frontier primes       15
skipped frontier primes    29 up to 193
```

Published-table checks reproduced:

```text
second XA      s356, p(n)=113, log n=126.4439144623
twentieth XA   s555, p(n)=181, log n=192.3184147975
p=149 used?    false
```

Integrated prime-count windows for the frontier statistic:

```text
(100,140]: pi-window 9, Li integral 8.366702, used XA frontiers 5
           skipped: 101,103,107,109

(140,182]: pi-window 8, Li integral 8.271906, used XA frontiers 7
           skipped: 149
```

Fixed-shape Cramer contrast:

The Cramer test keeps the 600 real SA exponent shapes but replaces the
prime base sequence by a seeded Cramer fake base sequence before scanning
for records. This is not an exact fake-divisor world; it is a controlled
base-location null.

```text
seed 12345:  records 4,   max frontier 35
seed 271828: records 114, max frontier 151, windows use 10/10 and 4/4
seed 314159: records 111, max frontier 181, windows use 10/10 and 5/5
seed 161803: records 18,  max frontier 55
seed 424242: records 97,  max frontier 173, windows use 9/9 and 6/6
```

When the fake sequence actually reaches the `100..182` frontier region,
it tends to use every fake base in these two windows. The real XA prefix
uses only `5/9` in `(100,140]` and `7/8` in `(140,182]`, with `149` as
the visible hole. That contrast is suggestive, not a theorem.

## Verdict

OPEN / promising, not closed.

This is the first branch in this goal that has all three ingredients in
one place: a prime-free object, a catalog RH equivalence, and a
non-residual prime-frontier pattern. It still does not close the goal
because the strongest prime-pattern fact, the impossibility of frontier
`149`, is imported from Nazardonyavi-Yakubovich, and the current finite
extension through `s600` does not prove a new infinite or quantitative
law. The next derivation gap is to prove a general skipped-frontier
criterion, ideally in terms of local theta/psi behavior around the
candidate frontier prime.

## Lean-stub-ready statement

```lean
def sigmaOverNRecord (n : Nat) : Prop :=
  n = 10080 ∨
  (10080 < n ∧
   ∀ m, 10080 ≤ m -> m < n ->
     sigma n / (n * Real.log (Real.log n)) >
     sigma m / (m * Real.log (Real.log m)))

def IsXA (n : Nat) : Prop := sigmaOverNRecord n

-- Imported theorem, Nazardonyavi-Yakubovich.
theorem RH_iff_infinite_XA :
  RiemannHypothesis ↔ Set.Infinite {n : Nat | IsXA n} := by
  sorry

-- Imported theorem, Alaoglu-Erdos.
theorem XA_has_prefix_prime_support
  (n : Nat) (h : IsXA n) :
  ∃ k exps,
    n = Finset.prod (Finset.range k)
      (fun i => (Nat.nthPrime i) ^ (exps i)) ∧
    MonotoneAntitone exps := by
  sorry

-- Finite certificate reproduced by the script.
theorem first_600_XA_frontier_skip_149 :
  149 ∉ {p : Nat | ∃ n, IsXA n ∧ n ∈ first600SA ∧ largestPrimeFactor n = p} := by
  native_decide
```

## WHAT THIS TEACHES ABOUT PRIMES

Robin's divisor-sum records do not let arbitrary primes become the largest
prime factor of a record integer.
In the first verified record block, the frontier jumps from `139` to
`151`, so the prime `149` is skipped even though neighboring primes are
used.
This suggests that RH-relevant divisor extremes see a filtered ordering of
the primes, not just their density.

## HANDOFF 4

Open status: goal remains active. The XA frontier-prime candidate is the
best current lead because it has a real RH equivalence and a concrete
prime-pattern hook. Next work:

1. Derive a skipped-frontier inequality for a candidate prime `p` using
   the CA parameter formula `F(p,1)` and the XA record condition; test it
   on `p=149`.
2. Optimize the recursive generator or consume a larger OEIS/Noe prefix
   to extend the finite frontier-hole list beyond `s600`.
3. Replace the fixed-shape Cramer null with an exact fake-extremal
   generator at `log n >= 126`, or explicitly mark the current Cramer
   contrast as only a base-location control.

# Continuation - XA frontier record barriers

## Source hook

The Nazardonyavi-Yakubovich paper gives the CA parameter formula

```text
F(x,k) = log(1 + 1/(x + x^2 + ... + x^k)) / log x.
```

At `epsilon = F(p,1)`, the largest CA number of that parameter has largest
prime factor `p`. This gives a local divisor-world witness for testing
whether a frontier prime `p` is capable of setting a new XA record.

## Candidate statistic

For a prime frontier `p`, define the scanned record-barrier margin

```text
B(p) =
  max { f(s) : s is a scanned superabundant number and p(s)=p }
  -
  max { f(x) : x is an earlier XA record },

where f(n)=sigma(n)/(n log log n).
```

If `B(p)>0`, some scanned superabundant number with frontier `p` sets a
new XA record. If `B(p)<0`, the whole scanned frontier block is blocked by
the previous XA record. This is still a finite certificate, but it is now
a signed inequality rather than a table lookup.

For the frontiers around the known hole `149`, the maximum over the
scanned SA block is exactly the CA endpoint built from `F(p,1)` except
where a later same-frontier exponent change gives a slightly larger
record. Thus the CA formula explains where the candidate peak for a
frontier sits.

## Implementation

New artifact/script:

- `scripts/xa-frontier-barrier.mjs`
- `logs/divisor-extremes-artifacts/xa-frontier-barrier.json`
- `logs/divisor-extremes-artifacts/xa-frontier-barrier.svg`

The script:

1. Reads the cached OEIS A004394 b-file.
2. Factors the first `600` superabundant numbers.
3. Extracts XA records.
4. Groups all scanned SA rows by largest prime factor.
5. Computes the barrier margin `B(p)`.
6. Builds the CA endpoint at `epsilon=F(p,1)` and compares its `f` value
   with the previous XA record.
7. Runs the same fixed-shape fake-base Cramer contrast used in the prior
   XA artifact.

## Numerics

Real frontier windows:

```text
(100,140]: prime count 9, Li integral 8.366702
           used frontiers 5: 113,127,131,137,139
           blocked frontiers 4: 101,103,107,109

(140,182]: prime count 8, Li integral 8.271906
           used frontiers 7: 151,157,163,167,173,179,181
           blocked frontiers 1: 149
```

Signed margins:

```text
p=101  B(p)=-0.0042945395
p=103  B(p)=-0.0030683694
p=107  B(p)=-0.0018250315
p=109  B(p)=-0.0002229008
p=113  B(p)=+0.0013691014

p=139  B(p)=+0.0004830437
p=149  B(p)=-0.0000207055
p=151  B(p)=+0.0003449182
```

The `p=149` block:

```text
previous XA record: s409, frontier 139
best SA with frontier 149: s425
epsilon F(149,1): 0.001336742591112371
CA endpoint at F(149,1): same f value as s425
B(149): -2.070550845889585e-5
```

This proves, over the scanned SA prefix, that the best divisor-world
candidate with largest prime factor `149` still fails to beat the previous
XA record. The neighboring frontier `151` clears the same previous record
by `+0.0003449182`.

Fixed-shape Cramer contrast:

```text
seed 12345:  record frontier max 35, inactive for both tested windows
seed 271828: active; (100,140] used 10/10, (140,182] used 4/4
seed 314159: active; (100,140] used 10/10, (140,182] used 5/5
seed 161803: record frontier max 55, inactive for both tested windows
seed 424242: active; (100,140] used 9/9,  (140,182] used 6/6
```

The active fake-base runs have no blocked bases in either window. The real
run has five blocked primes over the same two integrated windows. This
keeps the Cramer contrast suggestive but not exact, because the fake model
still reuses real SA exponent shapes.

## Derivation status

Progress: the skipped-frontier statement is now an inequality:

```text
max_{s in SA-prefix, p(s)=149} f(s)
<
f(s409).
```

Moreover, the maximum on the left is the CA endpoint generated by
`epsilon=F(149,1)`. This makes the prime-pattern statement checkable from
a divisor-world extremal calculation, not just from looking at the final
XA list.

Remaining gap:

The proof is still finite-prefix only. To close the goal from this branch,
we need either:

1. a theorem that after the scanned `p=149` block no later SA/XA number
   can return to frontier `149`, plus the barrier inequality above; or
2. a general CA/XA theorem that turns `B(p)<0` at the `F(p,1)` endpoint
   into "p is never an XA frontier."

This is not yet a STUCK PACK: the session made new derivational progress
by replacing a table fact with a signed CA-barrier audit.

## Lean-stub-ready statement

```lean
def F (x : Real) (k : Nat) : Real :=
  Real.log (1 + 1 / ((Finset.Icc 1 k).sum (fun i => x^i))) / Real.log x

def xaBarrierMargin (p : Nat) : Real :=
  (sSup {f s | s ∈ first600SA ∧ largestPrimeFactor s = p})
  -
  (sSup {f x | IsXA x ∧ x ∈ first600SA ∧ x < firstSAWithFrontier p})

theorem first600_frontier_149_barrier :
  xaBarrierMargin 149 < 0 := by
  native_decide

theorem first600_frontier_151_clears_barrier :
  0 < xaBarrierMargin 151 := by
  native_decide
```

## WHAT THIS TEACHES ABOUT PRIMES

The prime `149` is not merely absent from a list; the best divisor-record
candidate that could use it falls just short of the previous record.
The neighboring prime `151` clears that same barrier, so the divisor world
distinguishes adjacent frontier primes by a signed extremal test.
This points to a real ordering constraint on primes inside RH-relevant
divisor records, but the infinite theorem is still missing.

## HANDOFF 5

Open status: goal remains active. Next work should not recompute the same
barrier; it should attack the remaining proof gap.

1. Prove or source a monotonicity theorem for largest prime factors of
   superabundant/XA numbers strong enough to make the finite `149` block
   global.
2. Search the CA literature for a theorem that the `F(p,1)` endpoint
   maximizes `f` among all SA/XA candidates with frontier `p`.
3. If neither theorem is available after one more focused session, emit a
   STUCK PACK for the skipped-frontier theorem: exact gap, attempted CA
   barrier, and the minimal expert question.

# Continuation - XA skipped-frontier theorem audit

## Literature audit

The extracted text of Nazardonyavi-Yakubovich gives the following useful
facts:

```text
Proposition 20:
If N < n < N' and N,N' are successive CA numbers, then
f(n) < max(f(N),f(N')).

Lemma 21:
If an XA number lies strictly between two successive CA numbers N<N',
then N' is also XA.

Theorem 26:
If n is XA, then p(n) < log n.

Theorem 29:
For sufficiently large XA numbers, each exponent k_q is within 1 of
alpha_q(p), where p is the largest prime factor.

Property 40:
For computed XA numbers 10080 <= m<n <= C1=s500000, p(m) <= p(n).
```

What this proves:

- The XA/CA bridge is real: new XA records can be pushed to CA endpoints.
- The `F(p,1)` CA endpoint is the correct local CA witness for frontier
  `p`.
- Up to the computed range `C1`, the largest prime factor of XA records is
  nondecreasing, so the observed skip at `149` cannot reappear inside that
  computed range.

What it does not prove:

- Property 40 is a numerical property, not a theorem.
- Theorem 29 is asymptotic and does not give an effective threshold or a
  global maximum for a fixed frontier `p`.
- Theorem 26 gives only `p(n)<log n`; it does not prevent a later XA
  number from having largest prime factor `149`.
- Theorem 28 says infinitely many CA numbers are not XA, but that does
  not imply infinitely many primes are skipped as XA frontiers.

Therefore the current proof does not globalize

```text
149 is never the largest prime factor of an XA number.
```

The current finite theorem remains:

```text
max {f(s): s is among the first 600 SA numbers and p(s)=149}
  = f(s425)
  < f(s409),
```

with margin `-2.070550845889585e-5`.

## STUCK PACK - skipped XA frontier theorem

Precise gap:

Prove a global skipped-frontier theorem for the prime `149`. The needed
statement can take either form:

```text
Theorem A:
No XA number after s409 can have largest prime factor 149.
```

or the more structural form

```text
Theorem B:
For a fixed frontier prime p, the maximum of
f(n)=sigma(n)/(n log log n) over all SA/CA candidates with p(n)=p is
attained at a finite CA endpoint determined by F(p,k); for p=149 that
maximum is below f(s409).
```

What was tried:

1. Finite scan of the OEIS A004394 prefix through `s600`.
2. Direct grouping of all scanned superabundant numbers by largest prime
   factor.
3. CA endpoint computation using
   `F(x,k)=log(1+1/(x+...+x^k))/log x`.
4. Barrier audit showing `B(149)<0`, while `B(151)>0`.
5. Literature extraction from Nazardonyavi-Yakubovich and
   Alaoglu-Erdos, looking specifically for global monotonicity of `p(n)`
   over XA records or a fixed-frontier maximization theorem.

Why the attempts stop short:

The finite scan and CA endpoint calculation prove only a bounded-prefix
statement. The literature gives computational monotonicity up to
`C1=s500000`, but not a global monotonicity theorem. The asymptotic
exponent theorem describes sufficiently large XA numbers but does not
rule out a later record with the same fixed frontier `149`.

Minimal expert question:

```text
Let f(n)=sigma(n)/(n log log n). Is it known, or can it be proved, that
for a fixed prime p the supremum of f(n) over superabundant (or
colossally abundant) n with largest prime factor p is attained at one of
the CA endpoints with parameter F(p,k)? In particular, does the CA
endpoint computation at p=149 prove that no extremely abundant number has
largest prime factor 149?
```

If the answer is yes, this branch can become a complete prime-pattern
dictionary: the divisor-world record condition forces the actual prime
`149` to be skipped as an RH-relevant frontier while `151` is admitted.
If the answer is no, the XA frontier route should move from single-prime
skips to a different statistic, probably the distribution of CA∩XA
frontiers where Proposition 20 gives a sharper global handle.

## HANDOFF 6

Open status: goal remains active. The XA frontier branch is now waiting on
the expert-level skipped-frontier theorem above. Productive next moves:

1. Ask/answer the STUCK PACK expert question.
2. If staying computational, parse a much larger Noe superabundant list
   and search for new skipped frontiers beyond `193`, but do not call that
   a theorem.
3. Try a different divisor-world statistic that Proposition 20 controls
   globally, such as patterns in `CA ∩ XA` transitions rather than fixed
   largest-prime skips.

# Continuation - CA ∩ XA transition closure

## Why this branch

The fixed-frontier `149` route is stuck on a global theorem. This branch
keeps the same divisor world but moves to the part controlled globally by
Proposition 20 and Lemma 21:

```text
If a non-CA XA number lies between two consecutive CA numbers N<N',
then N' is also XA.
```

This is a real bridge between two divisor-extreme worlds. It also yields
an RH equivalence:

```text
RH
<=> XA is infinite                         (Nazardonyavi-Yakubovich)
<=> CA ∩ XA is infinite                    (Theorem 23 plus inclusion)
<=> infinitely many primes occur as p(n) for n ∈ CA ∩ XA.
```

The last implication uses the elementary fact that fixed finite prime
support cannot produce infinitely many new records of
`sigma(n)/(n log log n)`.

## Candidate statistic

Object:

```text
H = CA ∩ XA,
```

where `CA` is the set of colossally abundant numbers and `XA` is the
record sequence for `sigma(n)/(n log log n)` after `10080`. Both are
divisor-world definitions with no primality test in the definition.

Statistic:

```text
closure(n) = the next CA endpoint after a non-CA XA number n.
```

Lemma 21 says `closure(n)` is again XA, so every off-endpoint divisor
record forces an immediate CA-endpoint divisor record. Through the
Alaoglu-Erdos / CA factorization dictionary, this becomes a statement
about the ordering of largest-prime frontiers.

Predeclared null:

```text
If fixed-shape Cramer fake bases show the same closure and frontier
adjacency pattern, the statistic is not separating real prime structure.
```

## Factor check

`H=CA∩XA` is an extremal/record sequence, not a multiplicative function.
There is no natural Dirichlet series or Euler product, and no factorization
as a catalog RH object times a zero-free multiplier. The RH bridge comes
from Robin/XA plus Proposition 20, not from analytic multiplication.

## Implementation

New files/artifacts:

- `scripts/ca-xa-transitions.mjs`
- `logs/divisor-extremes-artifacts/ca-xa-transitions.json`
- `logs/divisor-extremes-artifacts/ca-xa-transitions.svg`

The script reads the explicit OEIS A004394 values through `s2000` and
classifies CA numbers using the exact epsilon-interval formula:

```text
F(x,k)=log(1+1/(x+...+x^k))/log x.

n = product q^a is CA when there is an epsilon satisfying
max(F(q,a+1), F(next frontier prime,1)) <= epsilon <= min(F(q,a)).
```

Validation:

The classifier matches all first-20 `c` marks printed in
Nazardonyavi-Yakubovich Table 1.

## Numerics

Prefix:

```text
explicit SA rows scanned: s1..s2000
XA records:               156
CA records:               155
CA ∩ XA records:          106
non-CA XA records:        49
next-CA closure failures: 0
```

Closure examples:

```text
s438, frontier 151, non-CA XA -> next CA s440, frontier 151, XA
s455, frontier 157, non-CA XA -> next CA s459, frontier 157, XA
s486, frontier 163, non-CA XA -> next CA s493, frontier 167, XA
s643, frontier 211, non-CA XA -> next CA s653, frontier 211, XA
```

Prime-frontier windows:

```text
(100,182]: prime count 17, Li integral 16.638608
           CA∩XA frontier primes 12, non-CA closure successes 4/4

(182,300]: prime count 20, Li integral 21.568865
           CA∩XA frontier primes 20, non-CA closure successes 21/21

(300,500]: prime count 33, Li integral 33.460258
           CA∩XA frontier primes 33, non-CA closure successes 13/13
```

CA∩XA frontier-transition pattern:

```text
105 transitions between consecutive CA∩XA records in the prefix.
104 transitions skip no prime frontier.
1 transition skips one prime frontier: 139 -> 151 skips 149.
```

Fixed-shape Cramer contrast:

```text
seed 12345:  fake records 4,   CA∩fake 2,   closure failures 0
seed 271828: fake records 388, CA∩fake 112, closure failures 0
seed 314159: fake records 446, CA∩fake 126, closure failures 1
seed 161803: fake records 18,  CA∩fake 9,   closure failures 0
seed 424242: fake records 324, CA∩fake 101, closure failures 58
```

Active fake-base runs can have similar CA∩record density, but they do not
stably reproduce the zero-failure closure theorem. This is expected:
Lemma 21 is a divisor-world convexity theorem, not a random-base property.

## Derivation

Exact theorem:

Let `N<N'` be consecutive CA numbers and let `n` be XA with
`10080<n` and `N<n<N'`. By Proposition 20,

```text
f(n) < max(f(N), f(N')).
```

Since `n` is XA and `n>N`, it has `f(n)>f(N)`. Therefore `f(n)<f(N')`.
By the record definition of XA, `N'` must be XA. Thus each non-CA XA
record closes at the next CA endpoint.

Prime dictionary:

For a CA number, the factorization is determined by an epsilon parameter
and the functions `F(p,k)`. Therefore every closure endpoint has a
well-defined largest-prime frontier. The theorem forces those frontiers
into the XA frontier sequence.

Concrete prime-pattern statement:

```text
In the explicit prefix s1..s2000, every non-CA XA frontier is followed at
the next CA endpoint by an XA frontier, and the closure never skips an
intermediate prime frontier. Among CA∩XA frontiers themselves, the only
skipped prime frontier is 149.
```

The first clause is theorem-backed for all real XA records; the no-skipped
frontier refinement is finite evidence only.

## Verdict

OPEN / stronger bridge, still not a full close.

This branch is stronger than the fixed `149` barrier because `CA∩XA` is
itself RH-equivalent and Lemma 21 gives a global closure rule. It still
does not close the goal because the most visually prime-specific part,
"frontier transitions are prime-adjacent except for 149", is only verified
over `s1..s2000`. A completion path would need a theorem bounding skipped
prime frontiers in CA∩XA transitions, or a proof that infinitely many
distinct CA∩XA frontier primes obey a quantitative ordering law.

## Lean-stub-ready statement

```lean
def IsCA (n : Nat) : Prop :=
  ∃ eps : Real, 0 < eps ∧
    ∀ m : Nat, 0 < m ->
      sigma m / (m : Real)^(1+eps) <= sigma n / (n : Real)^(1+eps)

def IsXA (n : Nat) : Prop :=
  n = 10080 ∨
  (10080 < n ∧
    ∀ m, 10080 ≤ m -> m < n -> f m < f n)

theorem RH_iff_infinite_CA_inter_XA :
  RiemannHypothesis ↔ Set.Infinite {n : Nat | IsCA n ∧ IsXA n} := by
  constructor
  · intro hRH
    -- Nazardonyavi-Yakubovich Theorem 23.
    exact infinitely_many_CA_XA_of_RH hRH
  · intro hInf
    -- CA ∩ XA infinite implies XA infinite; use Theorem 7.
    exact RH_of_infinite_XA (hInf.mono (by intro n hn; exact hn.2))

theorem non_CA_XA_closes_at_next_CA
  (n N N' : Nat)
  (hN : ConsecutiveCA N N')
  (hn : IsXA n)
  (hn0 : 10080 < n)
  (hbetween : N < n ∧ n < N') :
  IsXA N' := by
  -- Proposition 20: f n < max(f N, f N')
  -- XA record condition gives f N < f n.
  -- Therefore f n < f N', so N' is a later record.
  sorry
```

## WHAT THIS TEACHES ABOUT PRIMES

Some divisor records occur away from colossally abundant endpoints, but
they cannot stay away: the next endpoint must also become a record.
When translated through the CA factorization, this forces the largest
prime factors of those endpoints into a tightly ordered frontier sequence.
In the checked prefix, that frontier sequence advances prime-by-prime
except for the single skipped frontier `149`.

## HANDOFF 7

Open status: goal remains active. Best next work:

1. Try to prove a global bound on skipped prime frontiers between
   consecutive `CA∩XA` records.
2. Parse Noe's compact factored notation after `s2000` to extend the
   `CA∩XA` transition audit beyond the explicit b-file integers.
3. If no theorem appears, treat `CA∩XA` as the live divisor-world lead and
   look for another globally controlled statistic from Proposition 20.

# Continuation - Noe compact extension through s8436

## Parser

The OEIS b-file gives explicit integers through `s2000`, then compact
Noe notation such as

```text
691#37#11!2
701#31#11!7#
2719#67#19#10!6
```

The parser interprets this as a product of primorials, factorials, and
plain integer multipliers. It therefore computes the prime-exponent vector
directly, without constructing the enormous integer:

```text
p#   = product of primes <= p
k!   = factorial k
...m = final integer multiplier m
```

Validation: with `limit=2000`, the patched parser reproduces exactly the
previous explicit-integer audit:

```text
XA records 156, CA records 155, CA∩XA records 106,
non-CA XA records 49, closure failures 0,
first-20 CA table mismatches 0.
```

## Extended numerics

The main artifact is now:

- `logs/divisor-extremes-artifacts/ca-xa-transitions.json`
- `logs/divisor-extremes-artifacts/ca-xa-transitions.svg`

It scans all b-file rows through `s8436`.

```text
factored SA rows scanned: s1..s8436
XA records:               579
CA records:               443
CA ∩ XA records:          384
non-CA XA records:        194
next-CA closure failures: 0
```

The theorem-backed closure rule survives the full extension: every non-CA
XA record in this prefix closes at the next CA endpoint.

Frontier windows:

```text
(100,182]:   prime count 17,  Li integral 16.638608
             CA∩XA frontiers 12,  closure successes 4/4

(182,300]:   prime count 20,  Li integral 21.568865
             CA∩XA frontiers 20,  closure successes 21/21

(300,500]:   prime count 33,  Li integral 33.460258
             CA∩XA frontiers 33,  closure successes 13/13

(500,1000]:  prime count 73,  Li integral 75.815786
             CA∩XA frontiers 73,  closure successes 49/49

(1000,2000]: prime count 135, Li integral 137.199589
             CA∩XA frontiers 130, closure successes 87/87

(2000,2800]: prime count 104, Li integral 102.862836
             CA∩XA frontiers 89,  closure successes 20/20
```

CA∩XA frontier-transition histogram:

```text
383 transitions between consecutive CA∩XA records.
380 skip no prime frontier.
1 skips one prime frontier:
  139 -> 151 skips 149.
2 skip five prime frontiers:
  1399 -> 1439 skips 1409,1423,1427,1429,1433.
  2633 -> 2677 skips 2647,2657,2659,2663,2671.
```

Integrated transition main terms:

```text
139  -> 151:  skipped 1 / integral_139^151 dt/log t  = 0.414694
1399 -> 1439: skipped 5 / integral_1399^1439 dt/log t = 0.907208
2633 -> 2677: skipped 5 / integral_2633^2677 dt/log t = 0.895930
```

This corrects the earlier `s2000` finite statement. Prime-adjacency is
strong but not absolute even in the extended prefix.

Fixed-shape Cramer contrast over the same `s8436` exponent shapes:

```text
seed 12345:  fake records 4,    CA∩fake 2,   closure failures 0
seed 271828: fake records 388,  CA∩fake 112, closure failures 0
seed 314159: fake records 1083, CA∩fake 182, closure failures 344
seed 161803: fake records 18,   CA∩fake 9,   closure failures 0
seed 424242: fake records 1117, CA∩fake 266, closure failures 1
```

The real closure rule is exact by Proposition 20/Lemma 21; the fake-base
model does not reliably preserve it.

## Updated verdict

OPEN / live lead.

The global theorem now clearly teaches a structural fact: real divisor
records that miss the CA endpoint force the next endpoint to become a
record, and this injects CA endpoint frontier primes into the XA sequence.
The finite prime-pattern refinement changed from "prime-adjacent except
149" to a stronger-data statement: through frontier `2719`, `380/383`
CA∩XA transitions skip no prime, one skips `149`, and two skip five
primes. The next theorem target should be a quantitative upper bound on
skipped frontier primes between consecutive `CA∩XA` records, not a
zero-skip claim.

## HANDOFF 8

Open status: goal remains active. Best next work:

1. Seek a theorem bounding skipped prime frontiers between consecutive
   `CA∩XA` records in terms of the CA epsilon interval or prime gaps near
   the frontier.
2. If staying computational, extend beyond `s8436` only after verifying
   whether OEIS has more compact rows or another Noe data source.
3. Consider a normalized skip statistic:
   `skipped primes / integral_{p}^{p'} dt/log t` for `CA∩XA` transitions,
   with the fixed-shape Cramer contrast, as the next candidate
   prime-pattern statement.

# Continuation - normalized CA ∩ XA frontier-skip statistic

Implemented directly in `scripts/ca-xa-transitions.mjs` and regenerated:

- `logs/divisor-extremes-artifacts/ca-xa-transitions.json`

The JSON now contains `summary.frontierSkipSummary`, plus the same field
for every fixed-shape Cramer control under `cramerShapeContrast`.

Definition for consecutive `CA ∩ XA` records with largest-prime frontiers
`p <= q`:

```text
skip(p,q) = #{prime r : p < r < q}
norm(p,q) = skip(p,q) / integral_p^q dt/log t
```

Repeated-frontier transitions are retained in the raw list but excluded
from the prime-frontier skip aggregate. This matters because repeated
largest prime factors are real divisor records, but they do not test the
ordering of frontier primes.

Real `s1..s8436` scan:

```text
all CA∩XA transitions:             383
repeated-frontier transitions:      27
frontier-changing transitions:      356
prime-adjacent transitions:         353
nonzero skip transitions:           3
total skipped prime frontiers:      11
integrated transition main total:   374.536868
total skipped / integrated main:    0.029370
max skipped prime count:            5
max single-transition norm:         0.907208
next-CA closure failures:           0
```

The three nonzero transitions are:

```text
139  -> 151:  skipped 149
              skip/Li = 1 / 2.411414 = 0.414694

1399 -> 1439: skipped 1409,1423,1427,1429,1433
              skip/Li = 5 / 5.511414 = 0.907208

2633 -> 2677: skipped 2647,2657,2659,2663,2671
              skip/Li = 5 / 5.580792 = 0.895930
```

Two range checks with properly integrated transition main terms:

```text
(1000,2000]:
  frontier-changing transitions 129
  nonzero skip transitions 1
  skipped prime frontiers 5
  transition Li total 135.765983
  skipped / Li total 0.036828
  max skipped prime count 5

(2000,2800]:
  frontier-changing transitions 88
  nonzero skip transitions 1
  skipped prime frontiers 5
  transition Li total 92.244474
  skipped / Li total 0.054204
  max skipped prime count 5
```

Fixed-shape Cramer contrast over the same `s8436` exponent shapes:

```text
seed 12345:  frontier changes 1,   skipped 6,   skip/Li 0.762531, max skip 6,  closure failures 0
seed 271828: frontier changes 98,  skipped 19,  skip/Li 0.155274, max skip 6,  closure failures 0
seed 314159: frontier changes 164, skipped 49,  skip/Li 0.242260, max skip 24, closure failures 344
seed 161803: frontier changes 5,   skipped 7,   skip/Li 0.532715, max skip 6,  closure failures 0
seed 424242: frontier changes 245, skipped 146, skip/Li 0.378592, max skip 37, closure failures 1
```

The useful contrast is not the tiny seeds with too few surviving records;
it is that the active fake controls with many frontier changes allow much
larger frontier skips, while the real divisor-world sequence has only
`11` skipped prime frontiers across `356` frontier changes.

## Candidate prime-pattern statement

CONJECTURAL quantitative form:

```text
For consecutive H = CA ∩ XA records with largest-prime frontiers p < q,
the number of prime frontiers skipped between p and q is bounded by a
small absolute constant, or at least has
  #{r prime : p < r < q} = o(integral_p^q dt/log t)
along the H sequence.
```

Verified prefix form:

```text
Through the published A004394 prefix s1..s8436, every non-CA XA record
closes at the next CA endpoint, and the resulting CA∩XA largest-prime
frontier sequence skips only 11 prime frontiers across 356 frontier
changes; the only nonzero skips are the three transitions listed above.
```

This is a prime-pattern constraint about ordering and skipped frontiers,
not about the size of a Chebyshev/Robin residual. The theorem-backed part
is the closure at the next CA endpoint; the uniform skip bound is still
finite evidence and keeps the goal open.

## HANDOFF 9

Open status: goal remains active.

Best next work:

1. Look for, or ask an expert for, a theorem turning the finite
   `frontierSkipSummary` phenomenon into a global bound. The precise
   missing statement is a bound on skipped prime frontiers between
   consecutive `CA ∩ XA` records, derived from CA epsilon intervals and
   the divisor-record closure theorem.
2. If no theorem is available, build a small static exhibit from
   `ca-xa-transitions.json` that lets the human inspect the three nonzero
   skips and compare them with the fixed-shape controls.
3. Do not treat the normalized statistic as a close: the bridge is exact,
   but the global prime-ordering statement remains conjectural.

# Continuation - literature audit and static exhibit for CA ∩ XA skips

## Primary-source audit for the missing theorem

Searched for an existing theorem bounding skipped largest-prime frontiers
between consecutive `CA ∩ XA` records. The useful source facts remain
supportive but do not close the gap.

Primary sources checked:

- Alaoglu-Erdos, "On highly composite and similar numbers",
  `https://www.renyi.hu/~p_erdos/1944-03.pdf`.
- Nazardonyavi-Yakubovich, "Extremely Abundant Numbers and the Riemann
  Hypothesis",
  `https://cs.uwaterloo.ca/journals/JIS/VOL17/Nazar/nazar4.pdf`.

What the sources give:

1. Alaoglu-Erdos give the epsilon/exponent structure for CA numbers and
   Theorem 10. They explicitly identify the hard issue: whether the
   quotient of two consecutive CA numbers is always prime. They state this
   is not proved, and prove instead that the quotient of two consecutive CA
   numbers is either a prime or the product of two distinct primes.
2. Nazardonyavi-Yakubovich give the modern `F(x,k)` CA parameterization:
   for the largest CA number of parameter `epsilon=F(p,1)`, the largest
   prime factor is `p`.
3. Nazardonyavi-Yakubovich Proposition 20 and Lemma 21 give the exact
   closure theorem used here: a non-CA XA record between consecutive CA
   numbers forces the next CA endpoint to be XA.
4. Nazardonyavi-Yakubovich Theorem 23 gives the RH direction: under RH,
   infinitely many CA numbers are also XA. Combined with Theorem 7, this
   yields the `CA ∩ XA` infinitude equivalence used in this branch.
5. Nazardonyavi-Yakubovich Theorem 26 proves `p(n)<log n` for XA numbers,
   and their finite computational Property 40 reports monotonicity of
   largest prime factors for XA numbers only up to their checked bound.

What is still missing:

```text
A theorem controlling how many CA frontier primes can be skipped between
two consecutive records of H = CA ∩ XA.
```

Even the stronger open Alaoglu-Erdos conjecture that consecutive CA
quotients are prime would only control CA-to-CA motion. It would not by
itself prevent the subsequence `CA ∩ XA` from skipping many CA endpoints.
So the normalized skip statistic remains finite evidence, not theorem.

## Static exhibit

New generator:

- `scripts/ca-xa-exhibit.mjs`

New artifact:

- `logs/divisor-extremes-artifacts/ca-xa-exhibit.html`

New screenshots:

- `logs/divisor-extremes-artifacts/ca-xa-exhibit-desktop.png`
- `logs/divisor-extremes-artifacts/ca-xa-exhibit-mobile.png`
- `logs/divisor-extremes-artifacts/ca-xa-exhibit-timeline.png`

The exhibit reads `ca-xa-transitions.json` and shows:

```text
XA records:                 579
CA records:                 443
CA∩XA records:              384
closure failures:           0
frontier changes:           356
prime-adjacent changes:     353
aggregate skipped/Li:       0.029370
nonzero real skips:         139->151, 1399->1439, 2633->2677
fixed-shape Cramer controls: seeds 12345,271828,314159,161803,424242
```

Browser QA used a local static server because direct `file://` navigation
was blocked by the in-app browser policy:

```text
http://127.0.0.1:5174/logs/divisor-extremes-artifacts/ca-xa-exhibit.html
```

Desktop check:

```text
title: CA-XA Frontier Skip Exhibit
metrics: 579, 443, 384, 0, 356, 0.029370
charts: 2
tables: 3
page-level horizontal overflow: false
```

Mobile-width check at `390x844`:

```text
page-level horizontal overflow: false
metrics grid collapses to one column
tables scroll inside their own containers
```

The DOM check confirmed a single `h1` and a normal generated-source
footer; an earlier full-page screenshot showed a browser stitching
artifact, so the saved screenshots are viewport captures.

## Focused artifact tests

New test:

- `tests/ca-xa-artifact.test.js`

It locks down:

```text
limit and rowsParsed = 8436
XA/CA/CA∩XA counts = 579/443/384
non-CA XA count = 194
closure failures = 0
frontier changes = 356
prime-adjacent frontier changes = 353
nonzero skip transitions = 3
total skipped prime frontiers = 11
the exact three nonzero skipped-prime lists
fixed-shape Cramer seeds and selected control values
```

Verification:

```text
node --check scripts/ca-xa-exhibit.mjs
node scripts/ca-xa-exhibit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-exhibit.html
npx vitest run tests/ca-xa-artifact.test.js --environment node --pool threads
```

All passed.

## Lean-stub-ready normalized statement

```lean
def LargestPrimeFrontier (n : Nat) : Nat :=
  Nat.maxFac n

def SkippedFrontierPrimes (p q : Nat) : Finset Nat :=
  (Finset.Ioo p q).filter Nat.Prime

def IsCAXA (n : Nat) : Prop :=
  IsCA n ∧ IsXA n

def ConsecutiveCAXA (a b : Nat) : Prop :=
  IsCAXA a ∧ IsCAXA b ∧ a < b ∧
  ∀ n, a < n -> n < b -> ¬ IsCAXA n

theorem non_CA_XA_closes_at_next_CA
  (n N N' : Nat)
  (hN : ConsecutiveCA N N')
  (hn : IsXA n)
  (hn0 : 10080 < n)
  (hbetween : N < n ∧ n < N') :
  IsXA N' := by
  -- Nazardonyavi-Yakubovich Lemma 21, from Proposition 20.
  sorry

theorem conjectural_uniform_frontier_skip_bound :
  ∃ C : Nat, ∀ a b : Nat,
    ConsecutiveCAXA a b ->
    (SkippedFrontierPrimes
      (LargestPrimeFrontier a)
      (LargestPrimeFrontier b)).card ≤ C := by
  -- OPEN. Verified only over A004394 rows s1..s8436 with C=5.
  sorry
```

## Updated expert pack

Object:

```text
H = CA ∩ XA
```

Definition world:

```text
CA: maximizers of sigma(n)/n^(1+epsilon) for some epsilon>0.
XA: records of sigma(n)/(n log log n) after 10080.
```

No primality test, no `mu`, no `Lambda`, no prime-indexed sum appears in
the definition of `H`.

Bridge:

```text
RH iff XA is infinite.
RH implies CA∩XA is infinite.
CA∩XA infinite implies XA infinite, hence RH.
```

Information-moving theorem:

```text
If an XA record lies strictly between consecutive CA numbers N<N', then
N' is also XA.
```

Prime dictionary:

```text
The CA epsilon parameterization attaches a largest-prime frontier to each
CA endpoint. Therefore the closure theorem forces specific CA frontier
primes into the XA record sequence.
```

Verified prime-pattern statement:

```text
Through A004394 rows s1..s8436, the CA∩XA frontier sequence changes
frontier 356 times, is prime-adjacent 353 times, and skips only 11 prime
frontiers total. The only nonzero skips are 149, then
1409,1423,1427,1429,1433, then 2647,2657,2659,2663,2671.
```

Open theorem target:

```text
Prove a global upper bound, or asymptotically negligible normalized bound,
for skipped prime frontiers between consecutive CA∩XA records.
```

## WHAT THIS TEACHES ABOUT PRIMES

Divisor records cannot wander freely: whenever an extreme divisor record
appears between two colossally abundant endpoints, the next endpoint must
become an extreme divisor record too. Through the known factorization of
those endpoints, that forces the largest prime factors to advance in a
tightly ordered frontier sequence. In the checked data, that frontier
almost always moves to the very next prime, and the rare misses are few
enough to name explicitly.

## HANDOFF 10

Open status: goal remains active.

Best next work:

1. Decide whether to emit a `STUCK PACK` for the global CA∩XA
   skipped-frontier theorem if the next session also fails to find a proof.
   This session found the exact source boundary but still made progress by
   building the exhibit.
2. Strengthen the exhibit if desired by adding a compact timeline of all
   356 frontier-changing transitions, with the three nonzero skips
   highlighted.
3. The shortest proof target remains: derive a bound on skipped prime
   frontiers between consecutive `CA ∩ XA` records from CA epsilon
   intervals plus Proposition 20/Lemma 21.

# Continuation - full timeline exhibit and STUCK PACK

## Exhibit strengthening

Updated:

- `scripts/ca-xa-exhibit.mjs`
- `tests/ca-xa-artifact.test.js`
- `logs/divisor-extremes-artifacts/ca-xa-exhibit.html`

The static exhibit now includes a full frontier timeline:

```text
356 frontier-changing transitions between consecutive CA∩XA records
353 prime-adjacent changes
3 nonzero skipped-frontier changes
```

The timeline has:

```text
compact SVG: teal bars for prime-adjacent frontier changes,
             red bars for skipped-prime transitions
scrollable table: all 356 frontier-changing transitions,
                  including SA indices, skipped primes, Li main,
                  and skip/Li
```

The focused artifact test now checks:

```text
Full Frontier Timeline is present.
data-timeline-count="356" is present.
The three nonzero transitions 139->151, 1399->1439, and 2633->2677
are rendered in the exhibit.
```

Browser QA after the timeline addition:

```text
timeline chart count: 1
timeline table rows: 356
data-timeline-count: 356
page-level horizontal overflow: false
mobile timeline table scrolls inside its own container
```

## Targeted proof/source pass

Searches:

```text
"CA ∩ XA" colossally extremely abundant skipped primes
"extremely abundant" "largest prime factor" monotonicity "colossally"
"consecutive" "extremely abundant" "colossally abundant" "largest prime factor"
"Alaoglu" "Erdos" consecutive colossally abundant prime quotient checked 10^7
```

Useful hits still reduce to the same two primary sources:

- Alaoglu-Erdos:
  `https://www.renyi.hu/~p_erdos/1944-03.pdf`
- Nazardonyavi-Yakubovich:
  `https://cs.uwaterloo.ca/journals/JIS/VOL17/Nazar/nazar4.pdf`

The new search did not find a theorem bounding skipped largest-prime
frontiers in the `CA ∩ XA` subsequence. It did surface the known
background fact that the Alaoglu-Erdos prime-quotient conjecture for
consecutive CA numbers remains open, although checked far computationally
in OEIS notes. That conjecture would still be insufficient for this gap:
even if every consecutive CA step changed by one prime event, the
subsequence `CA ∩ XA` could still skip many CA endpoints unless record
values of `f(n)=sigma(n)/(n log log n)` are controlled along those
endpoints.

## Exact reduction of the gap

Let

```text
C_0 < C_1 < ... < C_t
```

be consecutive CA endpoints between two consecutive `H=CA∩XA` records
`A=C_0` and `B=C_t`. If an XA record lies in the open interval
`(C_i,C_{i+1})`, Lemma 21 forces `C_{i+1}` to be XA, hence `C_{i+1} in H`.
Therefore, for a skipped CA endpoint `C_i` with `0<i<t`, two things must
both be true:

```text
1. C_i is not an XA record, so f(C_i) <= f(A).
2. There is no non-CA XA record in (C_{i-1}, C_i).
```

Thus the skipped-frontier problem is exactly a run-length problem for CA
endpoint barriers:

```text
How many consecutive CA endpoints can remain below the previous H-record
height f(A), while also having no non-CA XA record in the preceding CA
interval?
```

The current computation proves the answer is at most `5` through
A004394 rows `s1..s8436`. No source found gives a global upper bound.

## STUCK PACK - CA∩XA skipped-frontier theorem

Gap:

```text
Prove a global quantitative bound for

  #{prime r : P(A) < r < P(B)}

where A<B are consecutive records of H=CA∩XA and P(n) is the largest
prime factor/frontier of the CA endpoint n.

Acceptable forms:

1. an absolute bound C;
2. a bound in terms of CA epsilon interval data that is nontrivial after
   translating to prime frontiers;
3. an asymptotic normalized bound
      skipped / integral_{P(A)}^{P(B)} dt/log t -> 0
   along H.
```

What was tried:

```text
1. Primary-source audit of Alaoglu-Erdos and Nazardonyavi-Yakubovich.
2. Targeted web search for CA/XA largest-prime monotonicity or skipped
   frontier theorems.
3. Reduction using Proposition 20/Lemma 21: non-CA XA inside a CA gap
   forces the next CA endpoint into H.
4. Conditional check against the Alaoglu-Erdos prime-quotient conjecture:
   even a prime quotient for every consecutive CA pair does not bound
   skipped endpoints of the H subsequence.
5. Finite computation through s8436, with a full timeline exhibit and
   fixed-shape Cramer controls.
```

Minimal expert question:

```text
For consecutive CA endpoints C_i and the function
  f(n)=sigma(n)/(n log log n),
is there a theorem bounding the length of a run of CA endpoints below the
previous CA∩XA record height, i.e. f(C_i) <= f(A), before a later CA
endpoint must exceed f(A) or a non-CA XA record must occur in the
intervening CA interval?

Equivalently: can the prime-frontier gap between consecutive CA∩XA
records be bounded using only the CA epsilon parameterization plus the
Robin/Nazardonyavi-Yakubovich convexity closure theorem?
```

Why this triggers an expert:

```text
The object H=CA∩XA is already an RH-equivalent divisor-world object, and
the closure theorem is exact. The remaining missing piece is a local
record-height theorem along CA endpoints. This is narrower than RH itself
but is not in the checked sources and is not implied by the classical
consecutive-CA quotient problem.
```

## HANDOFF 11

Open status: goal remains active.

Best next work:

1. If a mathematician can answer the STUCK PACK question, integrate the
   result into the `CA ∩ XA` bridge; otherwise keep the candidate marked
   OPEN / conjectural.
2. Computational route: add CA endpoint barrier values `f(C_i)-f(A)` to
   the full timeline so skipped endpoints show their deficit from the
   previous H record.
3. Alternative route: leave divisor extremes temporarily and test another
   different-world candidate, because this branch now has a precise proof
   bottleneck.

# Continuation - CA endpoint barrier values

Implemented the computational route from HANDOFF 11.

Updated:

- `scripts/ca-xa-transitions.mjs`
- `scripts/ca-xa-exhibit.mjs`
- `tests/ca-xa-artifact.test.js`
- `logs/divisor-extremes-artifacts/ca-xa-transitions.json`
- `logs/divisor-extremes-artifacts/ca-xa-exhibit.html`

New JSON field:

```text
summary.endpointBarrierSummary
```

For consecutive `H=CA∩XA` records `A<B`, the scan now records every
intermediate CA endpoint `C` with:

```text
f(C)-f(A), where f(n)=sigma(n)/(n log log n).
```

Results through A004394 rows `s1..s8436`:

```text
skipped CA endpoints:                 13
transitions with skipped CA endpoints: 5
max skipped CA endpoints in transition: 5
closest barrier deficit:              -4.356191e-7
deepest barrier deficit:              -0.000020705508
non-CA XA witnesses total:            194
transitions with non-CA XA witnesses: 144
```

The five barrier transitions:

```text
139  -> 151:  skipped CA frontier 149
              deficit -0.000020705508; final gain +0.000230757478
              one non-CA XA witness before closure

523  -> 541:  skipped CA endpoint with frontier 541
              deficit -0.000002664965; final gain +0.000014139953

547  -> 557:  skipped CA endpoint with frontier 547
              deficit -4.356191e-7; final gain +0.000013128647

1399 -> 1439: skipped CA frontiers 1409,1423,1427,1429,1433
              closest deficit -4.456241e-7; deepest -0.000011542760
              final gain +4.018138e-9

2633 -> 2677: skipped CA frontiers 2647,2657,2659,2663,2671
              closest deficit -0.000001036872; deepest -0.000003016027
              final gain +4.561476e-7
```

Interpretation:

The skipped-prime transitions are now visibly record-height barriers, not
only absent frontier labels. In the two five-prime skips, every skipped CA
endpoint is below the previous `H` record, and the eventual next `H`
endpoint clears the old record by a very small margin. This sharpens the
STUCK PACK question: bound the length of consecutive CA endpoints whose
`f` values remain below the previous `H` record height.

Exhibit changes:

```text
Live metrics include "CA endpoint barriers: 13".
Timeline table includes CA barrier counts, closest f(C)-f(A), and final
f(B)-f(A).
New "CA Endpoint Barriers" table lists all 13 skipped CA endpoints.
```

New screenshot:

- `logs/divisor-extremes-artifacts/ca-xa-exhibit-barriers.png`

Browser QA:

```text
desktop metrics: 579,443,384,0,356,0.029370,13
timeline rows: 356
barrier rows: 13
data-barrier-count: 13
closest deficit marker visible: -4.356e-7
page-level horizontal overflow: false
mobile page-level horizontal overflow: false
mobile barrier table scrolls inside its own container
```

Focused tests now lock down:

```text
endpointBarrierSummary totals
closest/deepest barrier deficits
skipped CA endpoint counts for the three nonzero prime skips
barrier section and data-barrier-count="13" in the static exhibit
```

## HANDOFF 12

Open status: goal remains active.

Best next work:

1. The `CA ∩ XA` branch is now computationally instrumented enough for an
   expert. Do not keep adding finite summaries unless they attack the
   barrier run-length proof directly.
2. If continuing this branch, try to bound the barrier run by estimating
   `f(C_{i+1})-f(C_i)` along CA endpoint chains using the `F(p,k)`
   epsilon parameterization.
3. Otherwise pivot to a different world, with Farey/Stern-Brocot or
   continued fractions as the least-explored hunting grounds.

# Continuation - Farey insertion and reciprocal-product signatures

Pivoted to the Farey/Stern-Brocot hunting ground.

Primary-source audit:

- Lagarias-Mehta, "Products of Farey Fractions":
  `https://arxiv.org/pdf/1503.00199`.
- Lagarias slides, "Products of Farey Fractions":
  `https://websites.umich.edu/~lagarias//TALK-SLIDES/maa-farey-aug16.pdf`.
- Kanemitsu-Yoshimoto, "Farey series and the Riemann hypothesis":
  `https://matwbn.icm.edu.pl/ksiazki/aa/aa75/aa7544.pdf`.

Catalog landmark to avoid merely renaming:

```text
Franel-Landau / Mikolas: RH can be encoded by global Farey discrepancy or
by a remainder term in the logarithm of a Farey product.
```

Predeclared nulls:

```text
1. If the object only says "prime iff a Farey insertion row is full", it is
   a useful baseline but not goal-complete.
2. If the reciprocal-product object only says "prime iff B_b(b)=b-1", it is
   just a totient/primality detector in Farey language and is not enough.
3. A global Farey-product RH remainder bound is catalog material; it cannot
   be counted as new prime-structure content unless the p-specific
   dictionary moves a sign, order, spacing, or geometry statement.
```

## New object candidate A: Farey insertion fertility

Definition:

```text
fareynew(n) = number of fractions inserted when passing from F_{n-1}
              to the Farey sequence F_n
            = #{1 <= a <= n : gcd(a,n)=1}.

fareydef(n) = n - 1 - fareynew(n).
```

This is a fractions/gcd definition with no primality test, no `mu`, no
`Lambda`, and no prime-indexed sum.

Factor check:

```text
sum_{n>=1} fareynew(n) n^{-s} = sum phi(n)n^{-s} = zeta(s-1)/zeta(s).
```

This is not the L2 failure mode `(catalog RH object) * zero-free bounded
multiplier`; it is the standard totient/Farey object itself. However, it is
also too elementary to be a new bridge.

Exact theorem:

```text
For n >= 2:

  fareydef(n)=0  iff  n is prime.

If n is composite, then fareydef(n) >= ceil(sqrt(n))-1.
```

Reason: `fareynew(n)=phi(n)`. If `n` is prime, all `1..n-1` numerators are
coprime to `n`. If `n` is composite with least prime factor `p<=sqrt(n)`,
then all multiples of `p` below `n` are missing, so
`phi(n)<=n-n/p<=n-ceil(sqrt(n))`.

Verdict:

```text
KNOWN-MATH baseline only. It gives a clean Farey visualization of primes as
full insertion rows with a sqrt-sized composite defect, but it is exactly
totient fertility and does not beat the catalog on content.
```

## New object candidate B: reciprocal Farey-product base surplus

Let `F_n` be the positive Farey fractions of order `n`. Define the reciprocal
Farey product:

```text
R_n = product_{1<=h<=k<=n, gcd(h,k)=1} k/h.
```

For an integer base `b>=2`, define the divisor-power surplus

```text
B_b(n) =
  sum_{1<=h<=k<=n, gcd(h,k)=1} (nu_b(k)-nu_b(h)),

where nu_b(m)=max{e : b^e divides m}.
```

The definition uses only fractions, gcd, divisibility, and products. It does
not test primality. When `b=p` is prime, the theorem identifies `B_p(n)` as
the `p`-adic valuation of `R_n`.

Factor check:

```text
B_b(n)` is not multiplicative in `n`, and no Euler-product Dirichlet series
is being used for the candidate. For prime `p`, Lagarias-Mehta express
ord_p(R_n) using radix and Mobius-type sums, not as a catalog RH object
times a zero-free bounded multiplier.

The global log product log(R_n) is catalog-adjacent by Mikolas; it is not
counted as a new bridge here.
```

Exact p-specific bridge:

For every odd prime `p`,

```text
B_p(p) = p-1,
B_p(n) < 0 for ceil(8p/3) <= n <= 3p-1,
B_p(3p-1) = -(p-1)/2.
```

The endpoint identity is transparent directly from Farey rows. Up to row
`3p-1`, only numerator/denominator multiples `p` and `2p` matter. The
denominator contribution at `p` and `2p` is

```text
phi(p)+phi(2p)=2(p-1).
```

The numerator `p` appears in reduced fractions `p/k` with
`p<=k<=3p-1`, `gcd(p,k)=1`, giving `2p-2` appearances. The numerator `2p`
appears in reduced fractions `2p/k` with `2p<=k<=3p-1`,
`gcd(2p,k)=1`, giving `(p-1)/2` appearances. Hence

```text
B_p(3p-1)=2(p-1)-(2p-2)-(p-1)/2=-(p-1)/2.
```

Prime-pattern statement:

```text
Every odd prime p forces a two-stage Farey-product sign pattern:

1. at row p, the reciprocal Farey product has denominator surplus p-1
   in base p;
2. by row ceil(8p/3), that same base-p surplus is already negative;
3. at row 3p-1, the numerator surplus is exactly (p-1)/2.
```

This constrains a sign/order geometry of the Farey product around each
prime; it is not a residual-size restatement.

## Numerical verification and Cramer contrast

Implemented:

- `src/core/math.js`: `fareynew`, `fareydef`, and
  `fareyBaseDivisorSurplusTable(N,b)`.
- `src/core/engine.js`: formula functions `fareynew(n)`, `fareydef(n)`,
  and `fareyord(n,a)`.
- `src/PrimeVisuals.jsx`: integer-lab token buttons.
- `scripts/farey-products.mjs`: two-range real/Cramer audit and SVG chart.
- `tests/math.test.js`, `tests/engine.test.js`: kernel and formula-engine
  checks.

Artifacts:

```text
logs/farey-product-artifacts/numerics.json
logs/farey-product-artifacts/farey-product-summary.svg
logs/farey-product-artifacts/fareyord-shot.png
```

Live app QA:

```text
URL: http://localhost:4179/
Mode: LAB -> FORMULAS
Formula checked: y(n)=fareyord(n,3)
Token buttons visible: fareynew(n), fareydef(n), fareyord(n,a)
Canvas rendered: 960 x 669
Page-level horizontal overflow: false
```

Range `[1000,2000]`:

```text
prime count:             135
Li count main term:      137.199588636
exact Farey shape:       135/135
endpoint debt total:     100394
integrated debt main:    102293.752931
debt/main:               0.981428456

Cramer seeds 12345,271828,314159,161803,424242:
fake counts:             124,138,139,131,128
exact-shape rates:       0.379032,0.384058,0.395683,0.389313,0.367188
average exact-shape:     0.383054832
average debt/main shape: 0.908864682
```

Range `[10000,20000]`:

```text
prime count:             1033
Li count main term:      1042.476827190
exact Farey shape:       1033/1033
endpoint debt total:     7716881
integrated debt main:    7787063.079816
debt/main:               0.990987349

Cramer seeds 12345,271828,314159,161803,424242:
fake counts:             1016,1062,1050,1023,1077
exact-shape rates:       0.317913,0.302260,0.300000,0.325513,0.313835
average exact-shape:     0.311904239
average debt/main shape: 0.912448068
```

Interpretation:

The real primes satisfy the exact two-stage Farey-product signature with
zero failures in both ranges. A Cramer random label set with the right prime
density does not carry the signature; the labels that match are precisely
the labels that are actual primes inside the random set. This is a real
dictionary from Farey product geometry to prime-specific sign patterns, but
it is still a known local theorem, not a new RH-equivalent prime-pattern
constraint.

## Lean-stub-ready statement

```lean
def nuBase (b m : Nat) : Nat :=
  sSup {e : Nat | b^e ∣ m}

def fareyRecipBaseSurplus (b n : Nat) : Int :=
  Finset.sum (Finset.Icc 1 n) fun k =>
    Finset.sum (Finset.Icc 1 k) fun h =>
      if Nat.gcd h k = 1
      then (nuBase b k : Int) - (nuBase b h : Int)
      else 0

theorem prime_farey_surplus_spike_canyon
    {p : Nat} (hp : Nat.Prime p) (hodd : p ≠ 2) :
    fareyRecipBaseSurplus p p = p - 1 ∧
    (∀ n, ⌈(8*p:Rat)/3⌉ <= n → n <= 3*p - 1 →
      fareyRecipBaseSurplus p n < 0) ∧
    fareyRecipBaseSurplus p (3*p - 1) = -((p - 1) / 2) := by
  -- Lagarias-Mehta p-adic Farey product theorem; endpoint can be
  -- proved by counting reduced fractions with numerator p or 2p.
  sorry
```

## WHAT THIS TEACHES ABOUT PRIMES

A prime does not only make a full new row of Farey fractions; it first makes
an exact denominator surplus at its own row. Before the Farey order reaches
three times that prime, the same prime is forced to switch sides and appear
more strongly in numerators. Random numbers with the right prime-like
density do not carry this two-step Farey signature unless the number is
actually prime.

Verdict:

```text
KNOWN-MATH / CONTENTFUL BASELINE. This branch beats the bare totient row by
moving a sign-pattern fact through a different world, but it is not yet the
requested deeper RH-reformulation. Goal remains open.
```

## HANDOFF 13

Open status: goal remains active.

Best next work:

1. The Farey reciprocal-product branch is worth keeping as a p-specific
   sign-pattern dictionary, but do not claim it as the final goal unless it
   is connected to a genuinely global bridge beyond the catalog
   Mikolas/Franel-Landau remainder.
2. Possible next attack: use the product formula
   `log(R_n)=sum_p ord_p(R_n) log p` to ask whether simultaneous local
   spike/canyon constraints force any nontrivial ordering or spacing
   pattern among primes, rather than just verifying one prime at a time.
3. Alternative: pivot to continued-fraction statistics over rationals `p/q`
   or return to the `CA ∩ XA` stuck-pack proof gap if an expert answer
   appears.

# Continuation - Farey overlap null and continued-fraction denominators

## Farey overlap null

Tested the HANDOFF 13 idea of combining local Farey-product canyons.

For each row `n`, define the prime-free base interval

```text
I(n) = { b : ceil(8b/3) <= n <= 3b-1 }
     = { b : ceil((n+1)/3) <= b <= floor(3n/8) }.
```

Then define the all-base Farey canyon count

```text
C(n) = #{ b in I(n) : B_b(n) < 0 }.
```

The local theorem implies every odd prime `p in I(n)` contributes to
`C(n)`, so

```text
pi(floor(3n/8)) - pi(ceil((n+1)/3)-1) <= C(n).
```

Finite scan:

```text
N=2000:
  rows checked: 1901
  theorem misses: 0
  max composite false positives in C(n): 31
  average precision prime/C: 0.344751

N=20000:
  rows checked: 19901
  theorem misses: 0
  max composite false positives in C(n): 327
  average precision prime/C: 0.254397
```

Verdict:

```text
NULL. The theorem side works exactly, but composite bases dominate the
all-base negative count. This gives a broad upper envelope for primes in a
multiplicative interval, not a sharp ordering or spacing constraint.
```

## New object candidate C: bounded continued-fraction denominator sets

Primary source:

- Moshchevitin-Murphy-Shkredov, "On Korobov bound concerning Zaremba's
  conjecture", `https://arxiv.org/pdf/2212.14646`.

Source facts used:

```text
Zaremba conjecture: for every q there should be a numerator a, coprime to q,
such that every partial quotient of a/q is bounded by an absolute constant.

For large prime q, Hensley conjectures the stronger alphabet {1,2} should be
enough.

Moshchevitin-Murphy-Shkredov improve Korobov: for any sufficiently large
prime p there is 1 <= a < p such that all partial quotients of a/p are
bounded by O(log p / log log p).
```

Definition:

```text
Z_A = { q : q is the denominator of a finite regular continued fraction
           [0; a_1,...,a_k], with a_k > 1 and every a_i <= A }.

cf2den(q)  = 1_{q in Z_2}
cfheight(q)= least A <= 5 found by this finite-continuant generator.
```

This is a continued-fraction/continuant definition with no primality test,
no `mu`, no `Lambda`, and no prime-indexed sums. The app now exposes
`cf2den(n)` and `cfheight(n)`.

Factor check:

```text
Z_A is generated by the continuant semigroup
  q_{j+1}=a_{j+1}q_j+q_{j-1}, 1 <= a_{j+1} <= A,
with the canonical last digit > 1.

No multiplicative Dirichlet series or Euler product is used. This is not a
catalog RH object times a zero-free bounded multiplier.
```

Bridge:

```text
Theorem (Moshchevitin-Murphy-Shkredov, improving Korobov):
For every sufficiently large prime p, there exists a numerator a with
gcd(a,p)=1 such that the continued fraction of a/p has

  max partial quotient = O(log p / log log p).

Conjectural strengthening (Hensley):
For every sufficiently large prime p, p in Z_2.
```

Prime-pattern statement:

```text
CONJECTURAL: eventually, every prime is a denominator of a finite continued
fraction over the two-letter alphabet {1,2}. Equivalently, primes must lie
inside the continuant semigroup denominator set Z_2, a set defined without
testing primes.

THEOREM-BACKSTOP: even without Hensley, every sufficiently large prime has
a continued-fraction witness whose maximum partial quotient is
O(log p/log log p).
```

This constrains extremal structure of primes as denominators of low-complexity
continued fractions, not the size of a prime-counting residual.

## Continued-fraction numerics and Cramer contrast

Implemented:

- `src/core/math.js`: `boundedCfDenominatorTable(N,A)` and
  `boundedCfMinHeightTable(N,5)`.
- `src/core/engine.js`: formula functions `cf2den(n)` and `cfheight(n)`.
- `src/PrimeVisuals.jsx`: integer-lab token buttons.
- `scripts/continued-fraction-zaremba.mjs`: two-range real/Cramer audit and
  SVG chart.
- `tests/math.test.js`, `tests/engine.test.js`: kernel and formula-engine
  checks.

Artifacts:

```text
logs/continued-fraction-artifacts/numerics.json
logs/continued-fraction-artifacts/continued-fraction-summary.svg
logs/continued-fraction-artifacts/cfheight-shot.png
```

Live app QA:

```text
URL: http://localhost:4181/
Mode: LAB -> FORMULAS
Formula checked: y(n)=cfheight(n)+cf2den(n)
Token buttons visible: cf2den(n), cfheight(n)
Canvas rendered: 960 x 669
Page-level horizontal overflow: false
```

Range `[10000,20000]`:

```text
prime count:                 1033
Li prime main term:          1042.476827190
Z_2 denominator count:       4535
Z_2 denominator density:     0.453455
weighted Cramer main in Z_2: 656.422020
real primes in Z_2:          674
real Z_2 hit rate:           0.652469
real minus weighted main:    +17.577980
real primes outside Z_3:     0

Cramer seeds 12345,271828,314159,161803,424242:
Z_2 hit rates:               0.621063,0.629002,0.630476,0.622678,0.628598
average Cramer hit rate:     0.626363
```

Range `[50000,100000]`:

```text
prime count:                 4459
Li prime main term:          4463.262237113
Z_2 denominator count:       24282
Z_2 denominator density:     0.485630
weighted Cramer main in Z_2: 2861.672229
real primes in Z_2:          2978
real Z_2 hit rate:           0.667863
real minus weighted main:    +116.327771
real primes outside Z_3:     0

Cramer seeds 12345,271828,314159,161803,424242:
Z_2 hit rates:               0.634035,0.637140,0.650929,0.642229,0.638783
average Cramer hit rate:     0.640623
```

Interpretation:

The tested prime ranges are enriched in the two-letter continuant
denominator set compared with both the weighted Cramer main term and five
Cramer samples. Every tested real prime in both ranges lies in `Z_3`, so
height `3` is already enough through `100000`. The strong `Z_2` statement
is not proven and is not numerically universal in these ranges; this is a
conjectural lead, not a solved reformulation.

## Lean-stub-ready statement

```lean
def continuantDenom : List Nat -> Nat
  | [] => 1
  | [a] => a
  | a :: b :: rest =>
      -- standard denominator recurrence for [0; a,b,...]
      sorry

def boundedCFDenominator (A q : Nat) : Prop :=
  exists digits : List Nat,
    digits ≠ [] ∧
    digits.getLast? = some k ∧ 1 < k ∧
    (forall d in digits, 1 <= d ∧ d <= A) ∧
    continuantDenom digits = q

def cfHeightLE (A q : Nat) : Prop := boundedCFDenominator A q

theorem korobov_shkredov_prime_cf_bound :
    exists C P0 : Nat, forall p >= P0,
      Nat.Prime p ->
      exists A : Nat, A <= C * Nat.log p / Nat.log (Nat.log p) ∧
        cfHeightLE A p := by
  -- Imported theorem: Moshchevitin-Murphy-Shkredov.
  sorry

conjecture hensley_prime_denominators_Z2 :
    exists P0 : Nat, forall p >= P0,
      Nat.Prime p -> boundedCFDenominator 2 p
```

## WHAT THIS TEACHES ABOUT PRIMES

Primes appear unusually often as denominators of very simple continued
fractions using only the digits 1 and 2. A theorem already says large primes
must have some numerator whose continued fraction digits are much smaller
than the denominator itself. The sharper claim that all large primes use
only digits 1 and 2 is still conjectural, but the tested ranges lean in that
direction more than Cramer-random prime labels do.

Verdict:

```text
OPEN / CONJECTURAL LEAD. This is a genuine different-world prime-pattern
candidate, and it moves extremal continued-fraction structure rather than a
residual size. It does not close the goal because the strong `Z_2` prime
statement is Hensley's conjecture and the proven logarithmic bound is known
math, not a new RH-equivalent bridge.
```

## HANDOFF 14

Open status: goal remains active.

Best next work:

1. Continued-fraction route: investigate whether the `Z_2` enrichment can be
   linked to an RH-equivalent catalog bridge or to a theorem about prime
   ordering/spacings. Current status is only a conjectural denominator-set
   pattern.
2. Computational route: optimize bounded-continuant generation further and
   push `Z_2` prime enrichment to larger ranges with a predeclared runtime
   cap; do not infer all-prime claims from finite data.
3. Alternative route: return to the `CA ∩ XA` barrier STUCK PACK, which
   remains the closest RH-equivalent branch.

# Continuation - 2026 Zaremba status update and Z_2 witness counts

## Source-status correction

The theorem status for the continued-fraction branch changed in 2026 and
must replace the older backstop in HANDOFF 14.

New primary sources:

- I.D. Shkredov, "On some results of Korobov and Larcher and Zaremba's
  conjecture", arXiv:2603.14116v1, 14 Mar 2026,
  `https://arxiv.org/html/2603.14116v1`.
- Xin Zhang, "Expansion in SL_2(Z/qZ) and Zaremba's Conjecture",
  arXiv:2605.02518v1, 04 May 2026,
  `https://arxiv.org/html/2605.02518v1`.

Relevant source facts:

```text
Shkredov: there is an absolute constant M such that for any prime
(or square-free) q, some a/q has all partial quotients bounded by M.

Zhang: Zaremba's conjecture holds for every natural denominator q.

Zhang Remark 1.3: the bound is effectively computable but large; reducing
it to 5, or any reasonable magnitude, requires a new idea.

Hensley's stronger conjecture for large prime q with alphabet {1,2}
remains open in the checked sources.
```

Consequences for the candidate:

```text
The existence of some absolute A with every prime p in Z_A is now theorem,
not merely a logarithmic backstop.

This does not by itself close the goal, because Zhang's theorem covers all
natural numbers, so "primes are in some Z_A" no longer distinguishes prime
patterns. The contentful prime-specific question remains the small-alphabet
pattern, especially Hensley's conjectural p in Z_2 for all sufficiently
large primes.
```

## New statistic: Z_2 numerator multiplicity

Added:

```text
cf2num(q) = #{ a : gcd(a,q)=1 and a/q has canonical continued fraction
              [0; a_1,...,a_k] with a_k>1 and every a_i in {1,2} }.
```

This is still a continued-fraction object with no primality test. It
measures witness multiplicity, not just denominator membership, and is
closer to Shkredov's "many good numerators" viewpoint.

Implementation changes:

- `src/core/math.js`: `boundedCfNumeratorCountTable(N,2)`.
- `src/core/engine.js`: formula function `cf2num(n)`.
- `src/PrimeVisuals.jsx`: integer-lab token button `cf2num(n)`.
- `scripts/continued-fraction-zaremba.mjs`: reports
  `cf2NumeratorTotal`, `avgCf2NumeratorsPerLabel`, weighted Cramer main,
  and real-minus-main for numerator witnesses.
- `tests/math.test.js`, `tests/engine.test.js`: numerator-count checks.

Regenerated artifacts:

```text
logs/continued-fraction-artifacts/numerics.json
logs/continued-fraction-artifacts/continued-fraction-summary.svg
```

Updated two-range numerics:

Range `[10000,20000]`:

```text
real Z_2 hit rate:                 0.652468538
five-seed Cramer avg hit rate:     0.626363484
real cf2num per label:             2.551790900
five-seed Cramer cf2num per label: 2.345398621
real cf2num total:                 2636
weighted Cramer cf2num main:       2443.808235701
real cf2num minus main:            +192.191764299
all-denominator Z_2 witness total: 14866
avg witnesses per Z_2 denominator: 3.278059537
```

Range `[50000,100000]`:

```text
real Z_2 hit rate:                 0.667862749
five-seed Cramer avg hit rate:     0.640622991
real cf2num per label:             2.426553039
five-seed Cramer cf2num per label: 2.267831968
real cf2num total:                 10820
weighted Cramer cf2num main:       10133.857730392
real cf2num minus main:            +686.142269608
all-denominator Z_2 witness total: 77091
avg witnesses per Z_2 denominator: 3.174820855
```

Interpretation:

Real primes are not only more likely than Cramer labels to be in `Z_2`; they
also carry more `Z_2` numerator witnesses per label in both tested ranges.
This is a sharper finite signal than membership alone. It still does not
prove Hensley's small-alphabet prime conjecture and still is not an
RH-equivalent bridge.

## Updated Lean-stub-ready statement

```lean
def boundedCFNumerators (A q : Nat) : Finset Nat :=
  {a : Nat | 0 < a ∧ a < q ∧ Nat.gcd a q = 1 ∧
    exists digits : List Nat,
      digits ≠ [] ∧
      digits.getLast? = some k ∧ 1 < k ∧
      (forall d in digits, 1 <= d ∧ d <= A) ∧
      continuedFractionValue digits = (a : Rat) / q}

def cf2num (q : Nat) : Nat := (boundedCFNumerators 2 q).card

theorem shkredov_prime_absolute_zaremba :
    exists M P0 : Nat, forall p >= P0,
      Nat.Prime p -> 0 < (boundedCFNumerators M p).card := by
  -- Imported theorem: Shkredov 2026 prime-denominator result.
  sorry

theorem zhang_zaremba_all_denominators :
    exists M : Nat, forall q : Nat,
      1 <= q -> 0 < (boundedCFNumerators M q).card := by
  -- Imported theorem: Zhang 2026 claimed full Zaremba conjecture.
  sorry

conjecture hensley_prime_Z2 :
    exists P0 : Nat, forall p >= P0,
      Nat.Prime p -> 0 < cf2num p
```

## WHAT THIS TEACHES ABOUT PRIMES

Large primes are now known to have some bounded-digit continued-fraction
witness, but that fact is no longer prime-specific because the full
Zaremba theorem claims every denominator has one. The prime-specific signal
is at the much smaller alphabet `{1,2}`: in the tested ranges, primes land
there more often and with more witnesses than Cramer-random labels. The
mathematical gap is exactly whether this small-alphabet enrichment becomes
an all-large-prime theorem.

Verdict:

```text
OPEN. The 2026 Zaremba proof strengthens the continued-fraction world
substantially, but it also makes the large-alphabet statement too broad to
teach prime-specific structure. The small-alphabet `cf2num` signal is the
right prime-pattern target, but currently remains conjectural.
```

## HANDOFF 15

Open status: goal remains active.

Best next work:

1. Search for any theorem stronger than Hensley's conjecture for primes in
   `Z_2` or for lower bounds on `cf2num(p)` over primes; if none, emit a
   focused STUCK PACK only after this same small-alphabet proof gap repeats
   across another goal turn.
2. Computational route: push `cf2num` to larger ranges using a streaming
   continuant generator and compare real primes, Cramer labels, and all
   integers by witness multiplicity, not just membership.
3. Strategic route: return to `CA ∩ XA` if the objective needs an
   RH-equivalent bridge rather than a prime-pattern theorem from another
   world.

# Continuation - deep Z_2 witness scan and stuck pack

## Deep scan implementation

Added:

```text
scripts/continued-fraction-z2-deep.mjs
```

It computes `cf2num(q)` only for alphabet `{1,2}` up to the largest tested
range, then compares real primes against five predeclared Cramer seeds
`12345,271828,314159,161803,424242`. Unlike the earlier Zaremba script, it
does not compute `Z_3`, so the deeper numerator-witness scan remains cheap.

Generated artifacts:

```text
logs/continued-fraction-artifacts/z2-deep.json
logs/continued-fraction-artifacts/z2-deep-summary.svg
```

## Deep scan numerics

Range `[100000,200000]`:

```text
prime count:                         8392
Li main:                             8406.243121
real Z_2 hit rate:                   0.666587226
five-seed Cramer avg hit rate:       0.636393091
Cramer hit-rate seed range:          [0.628885475, 0.642293907]
weighted Cramer Z_2 count main:      5336.400256
real Z_2 count minus main:           +257.599744
real cf2num per label:               2.673736892
five-seed Cramer cf2num per label:   2.410903059
Cramer cf2num-per-label seed range:  [2.393262454, 2.445400239]
real cf2num total:                   22438
five-seed Cramer avg cf2num total:   20222
weighted Cramer cf2num main:         20200.015064
real cf2num minus main:              +2237.984936
all-denominator Z_2 density:         0.478095219
all-denominator cf2num total:        162213
avg witnesses per Z_2 denominator:   3.392867601
largest real-prime witness count:    cf2num(153743)=20
```

Range `[500000,1000000]`:

```text
prime count:                         36960
Li main:                             37021.260373
real Z_2 hit rate:                   0.743777056
five-seed Cramer avg hit rate:       0.710599738
Cramer hit-rate seed range:          [0.707684890, 0.712547981]
weighted Cramer Z_2 count main:      26248.674028
real Z_2 count minus main:           +1241.325972
real cf2num per label:               3.071969697
five-seed Cramer cf2num per label:   2.809391395
Cramer cf2num-per-label seed range:  [2.799426781, 2.816384866]
real cf2num total:                   113540
five-seed Cramer avg cf2num total:   104102
weighted Cramer cf2num main:         103756.386251
real cf2num minus main:              +9783.613749
all-denominator Z_2 density:         0.539442921
all-denominator cf2num total:        924092
avg witnesses per Z_2 denominator:   3.426090567
largest real-prime witness count:    cf2num(904781)=29
```

Finite statement licensed by the computation:

```text
In four tested ranges from 10000 to 1000000, real primes are more often
denominators of `{1,2}` continued fractions than five Cramer prime-label
sets, and real primes carry more `{1,2}` numerator witnesses per label.
The effect is not just a residual-size rename: it concerns the existence
and multiplicity of simple continued-fraction representations of a/p.
```

This is still only evidence. It does not produce the required theorem.

## STUCK PACK - small-alphabet continued fractions

Precise gap:

```text
Prove any nontrivial prime-specific theorem for

  cf2num(p) = #{a : a/p has canonical continued fraction digits all in {1,2}}.

The strongest target is Hensley's conjecture:

  exists P0 such that every prime p >= P0 has cf2num(p) > 0.

Weaker useful targets would also move information:

  sum_{p in [X,2X]} 1_{cf2num(p)>0} >= (1+delta) * CramerWeightedMain(X,2X)

or

  sum_{p in [X,2X]} cf2num(p) >= (1+delta) * CramerWeightedMain_cf2num(X,2X)

for an explicit positive delta on an infinite family of ranges, or all
sufficiently large dyadic ranges.
```

What was tried:

```text
1. Primary-source audit after the 2026 status change.
   - Shkredov 2026 proves a prime/square-free denominator Zaremba theorem
     with an absolute constant.
   - Zhang 2026 claims full Zaremba for every natural denominator and notes
     that making the bound as small as 5 requires a new idea.
   - The checked sources did not provide an alphabet `{1,2}` prime theorem.

2. Implementation route.
   - Added denominator membership `cf2den(n)`.
   - Added least tested height `cfheight(n)` up to 5.
   - Added numerator multiplicity `cf2num(n)`.
   - Added two scripts: the full Zaremba comparison and the deep `Z_2`
     witness scan.
   - Verified finite enrichment against integrated weighted Cramer main
     terms and five Cramer seeds.

3. Factor check.
   - The object is a finite-alphabet continuant semigroup, not an Euler
     product or Dirichlet-series multiplier twist of a catalog RH object.
```

Minimal expert question:

```text
Is there any known theorem, beyond Hensley's conjecture and the
large-alphabet Zaremba theorems, proving that infinitely many primes,
positive-density primes, all but o(pi(x)) primes, or all sufficiently large
primes have cf2num(p)>0?

Equivalently: can the thin-semigroup/local-global machinery for Zaremba be
made prime-specific at alphabet {1,2}, whose dimension is only slightly
above the critical 1/2 threshold, or is a new input known to be necessary?
```

Why this triggers the stuck rule:

```text
The same derivation gap has now repeated across the continued-fraction
branch: finite evidence and large-alphabet theorems are available, but the
small-alphabet prime theorem needed for real prime-pattern content is not
in hand. The next useful step is not more code unless it targets a specific
analytic theorem or expert answer.
```

## HANDOFF 16

Open status: goal remains active.

Best next work:

1. Ask or search specifically for a theorem about prime denominators in
   the alphabet `{1,2}` Zaremba semigroup, including density or averaged
   `cf2num(p)` bounds. This is the minimal expert question above.
2. If no such theorem exists, move back to the `CA ∩ XA` RH-equivalent
   divisor-world branch, where the missing result is the CA endpoint
   barrier run-length theorem.
3. Keep the continued-fraction implementation as an exhibit and finite
   pattern generator, but do not claim the goal is closed from these finite
   scans.

# Continuation - CA quotient paths through endpoint barriers

Returned to the `CA ∩ XA` divisor-world branch because the
small-alphabet continued-fraction branch has a live STUCK PACK and no
available theorem in hand.

## Artifact refinement

Extended:

```text
scripts/ca-xa-transitions.mjs
logs/divisor-extremes-artifacts/ca-xa-transitions.json
scripts/ca-xa-exhibit.mjs
logs/divisor-extremes-artifacts/ca-xa-exhibit.html
tests/ca-xa-artifact.test.js
```

New saved fields:

```text
summary.caQuotientSummary
summary.frontierTransitions[*].caEndpointPath
summary.endpointBarrierSummary.transitions[*].caEndpointPath
```

`caEndpointPath` records the quotient from one consecutive CA endpoint to
the next. The quotient is computed from exponent-vector differences and
classified as:

```text
prime
distinct-semiprime
prime-square
higher
not-divisibility
```

This tests the local shape relevant to the Alaoglu-Erdos consecutive-CA
quotient theorem/conjecture line.

## New finite finding

Through A004394 rows `s1..s8436`:

```text
consecutive CA endpoint quotient steps: 442
prime quotient steps:                   442
distinct semiprime quotient steps:       0
prime-square quotient steps:             0
higher quotient steps:                   0
not-divisibility failures:               0
```

So every consecutive CA endpoint step in the scanned prefix is multiplication
by a single prime. This is stronger than the finite shape needed by the
known Alaoglu-Erdos "prime or product of two primes" result, but it is not
a global theorem.

## Barrier quotient paths

The five skipped-CA-endpoint transitions now have explicit quotient paths:

```text
H 409 -> 440, frontiers 139 -> 151:
  409 -> 425: ×149, barrier, f(C)-f(A)=-0.00002070550845889585
  425 -> 440: ×151, terminal H, f(B)-f(A)=+0.00023075747812462133

H 1490 -> 1516, frontiers 523 -> 541:
  1490 -> 1508: ×541, barrier, f(C)-f(A)=-0.0000026649647399956677
  1508 -> 1516: ×31, terminal H, f(B)-f(A)=+0.000014139953352199086

H 1532 -> 1557, frontiers 547 -> 557:
  1532 -> 1538: ×11, barrier, f(C)-f(A)=-0.000000435619124106168
  1538 -> 1557: ×557, terminal H, f(B)-f(A)=+0.000013128646809246192

H 4204 -> 4310, frontiers 1399 -> 1439:
  4204 -> 4223: ×1409, barrier, f(C)-f(A)=-0.0000004456241107231307
  4223 -> 4240: ×1423, barrier, f(C)-f(A)=-0.000007644900586800674
  4240 -> 4257: ×1427, barrier, f(C)-f(A)=-0.000011542759788207846
  4257 -> 4274: ×1429, barrier, f(C)-f(A)=-0.000010216184460842825
  4274 -> 4291: ×1433, barrier, f(C)-f(A)=-0.000005701073746644525
  4291 -> 4310: ×1439, terminal H, f(B)-f(A)=+0.000000004018138044514785

H 8003 -> 8163, frontiers 2633 -> 2677:
  8003 -> 8029: ×2647, barrier, f(C)-f(A)=-0.0000011671759065912113
  8029 -> 8055: ×2657, barrier, f(C)-f(A)=-0.0000029283052225270723
  8055 -> 8082: ×2659, barrier, f(C)-f(A)=-0.00000301602711960669
  8082 -> 8109: ×2663, barrier, f(C)-f(A)=-0.000002007844674523085
  8109 -> 8136: ×2671, barrier, f(C)-f(A)=-0.0000010368719589592956
  8136 -> 8163: ×2677, terminal H, f(B)-f(A)=+0.0000004561476298903244
```

Interpretation:

```text
Skipped frontier primes are not arbitrary holes in the divisor-world
frontier. In the observed CA chain, they are prime multiplier steps that
do create CA endpoints, but those endpoints fail the XA record test until
a later prime multiplier step clears the old record height.
```

This sharpens the missing theorem. Instead of merely asking whether
`CA ∩ XA` skips few frontiers, the proof target is:

```text
Bound the length of runs of consecutive prime-multiplier CA endpoint steps
C_0 -> C_1 -> ... -> C_t for which f(C_i) <= f(C_0) for 1 <= i < t,
where f(n)=sigma(n)/(n log log n).
```

If such runs were globally bounded or had a quantitative density bound,
then the `CA ∩ XA` bridge would move a genuine prime-ordering statement:
RH-equivalent divisor records would force almost-prime-adjacent largest
prime frontiers, with explicit exceptions controlled by divisor-extreme
barrier inequalities.

## Updated Lean-stub-ready refinement

```lean
def caEndpointQuotientPrimeStep (A B : Nat) : Prop :=
  ColossallyAbundant A ∧ ColossallyAbundant B ∧ A < B ∧
  IsConsecutiveCA A B ∧ ∃ p : Nat, Nat.Prime p ∧ B = A * p

def xaHeight (n : Nat) : Real :=
  (sigma n : Real) / ((n : Real) * Real.log (Real.log n))

def caXaBarrierRun (C : Fin (t+1) -> Nat) : Prop :=
  (forall i, ColossallyAbundant (C i)) ∧
  (forall i : Fin t, IsConsecutiveCA (C i.castSucc) (C i.succ)) ∧
  (forall i : Fin t, caEndpointQuotientPrimeStep (C i.castSucc) (C i.succ)) ∧
  (forall i : Fin t, i.val + 1 < t -> xaHeight (C i.succ) <= xaHeight (C 0))

conjecture ca_xa_prime_barrier_runs_bounded :
    exists K : Nat, forall t C, caXaBarrierRun (t:=t) C -> t <= K
```

## WHAT THIS TEACHES ABOUT PRIMES

The divisor records do not skip primes by ignoring them; in the checked
range, each skipped prime first appears as a legitimate colossally abundant
multiplier. The skip happens because that divisor-world endpoint is still
too low to break the `sigma(n)/(n log log n)` record, and a later prime
multiplier finally clears it. So the prime pattern being tested is an
ordering rule: how long can consecutive prime multipliers improve the
colossally abundant frontier without improving the Robin/XA record height?

Verdict:

```text
OPEN. This is a real refinement of the CA ∩ XA branch and improves the
expert question, but it does not close the goal. The needed global theorem
is now a prime-multiplier CA barrier run bound.
```

## HANDOFF 17

Open status: goal remains active.

Best next work:

1. Literature route: search specifically for the Alaoglu-Erdos consecutive
   colossally abundant quotient conjecture and for any theorem bounding
   runs of CA prime quotient steps that fail Robin/XA record improvement.
2. Analytic route: express the one-step height increment
   `f(Cp)-f(C)` from CA epsilon data and try to prove that long consecutive
   negative partial sums are impossible or rare.
3. If neither route moves, pivot to a fresh different-world candidate;
   the continued-fraction and CA/XA branches both now have focused expert
   questions.

# Continuation - exact CA prime-step margin

Followed the analytic route from HANDOFF 17.

## Source check

Primary source:

```text
L. Alaoglu and P. Erdos, "On highly composite and similar numbers",
Transactions of the AMS 56 (1944), pp. 448-469.
https://www.renyi.hu/~p_erdos/1944-03.pdf
```

Relevant facts from the source:

```text
The quotient of two consecutive colossally abundant numbers being prime is
identified as the interesting hard question.

Theorem 10 gives the CA exponent formula through the epsilon parameter.

Alaoglu-Erdos prove that the quotient of two consecutive CA numbers is
either a prime or the product of two distinct primes, using Siegel's
communicated transcendence input.
```

This matches the artifact status: our finite prefix has only prime
quotients, but the known theorem permits distinct semiprime steps and the
prime-only statement remains conjectural globally.

## Exact one-step identity

Let:

```text
f(n) = sigma(n)/(n log log n).
```

Suppose `C' = C*p` is a consecutive CA endpoint step, and `p^a || C`. Then:

```text
sigma(C')/C'       1 - p^-(a+2)
--------------  =  -------------
sigma(C)/C         1 - p^-(a+1)
```

Therefore:

```text
log(f(C')/f(C))

= log((1 - p^-(a+2))/(1 - p^-(a+1)))
  - log(log(log C')/log(log C)).
```

The first term is the local divisor gain from increasing the exponent of
`p`. The second term is the global `log log` penalty. A CA endpoint step
improves the XA height exactly when this margin is positive.

This is the precise analytic form of the barrier problem.

Implementation:

```text
scripts/ca-xa-transitions.mjs
  summary.caStepDecompositionSummary
  summary.barrierStepDecompositionSummary
  frontierTransitions[*].caEndpointPath[*].quotientFromPreviousCA.heightStep

scripts/ca-xa-exhibit.mjs
  CA Quotient Path table now includes log sigma gain, loglog penalty, and margin.

tests/ca-xa-artifact.test.js
  pins post-first-CA/XA counts and the long 1399 -> 1439 margin path.
```

Artifact:

```text
logs/divisor-extremes-artifacts/ca-xa-transitions.json
logs/divisor-extremes-artifacts/ca-xa-exhibit.html
```

## Post-first-CA/XA prime-step statistics

Restrict to consecutive CA prime quotient steps after the first `CA ∩ XA`
record `s356`.

```text
prime CA steps after s356:       396
negative one-step margins:       9
min one-step margin:             -0.000011776209093505331
max one-step margin:             +0.0003184821982826543
max identity error in formula:   3.6505087147586934e-16
```

The most negative post-first-CA/XA steps begin:

```text
s409  -> s425:  ×149,  margin -0.000011776209093505331
s4223 -> s4240: ×1423, margin -0.000004054948752195593
s4240 -> s4257: ×1427, margin -0.000002195452383890197
s1490 -> s1508: ×541,  margin -0.0000015050115451577945
s8029 -> s8055: ×2657, margin -0.0000009909504800304858
s8003 -> s8029: ×2647, margin -0.0000006567448292481661
s4204 -> s4223: ×1409, margin -0.00000025099453380332624
s1532 -> s1538: ×11,   margin -0.0000002460061527891858
s8055 -> s8082: ×2659, margin -0.00000004935929481174285
```

These are exactly the one-step deficits appearing at the front or inside
the previously logged endpoint-barrier runs.

## Barrier run decomposition

The two five-barrier runs now have exact cumulative margin paths.

For `1399 -> 1439`:

```text
×1409: margin -0.00000025099453380332624, cumulative -0.00000025099453380332624
×1423: margin -0.000004054948752195593,   cumulative -0.0000043059432859989194
×1427: margin -0.000002195452383890197,   cumulative -0.0000065013956698891165
×1429: margin +0.0000007471883725940513,  cumulative -0.000005754207297295065
×1433: margin +0.0000025431142940549392,  cumulative -0.000003211093003240126
×1439: margin +0.000003213356189566189,   cumulative +0.00000000226318632606283
```

For `2633 -> 2677`:

```text
×2647: margin -0.0000006567448292481661,  cumulative -0.0000006567448292481661
×2657: margin -0.0000009909504800304858,  cumulative -0.000001647695309278652
×2659: margin -0.00000004935929481174285, cumulative -0.0000016970546040903948
×2663: margin +0.0000005672832367338543,  cumulative -0.0000011297713673565405
×2671: margin +0.0000005463457937905517,  cumulative -0.0000005834255735659888
×2677: margin +0.0000008400899366388642,  cumulative +0.00000025666436307287535
```

The closest terminal recovery among all barrier transitions is therefore:

```text
1399 -> 1439, final cumulative log margin +2.26318632606283e-9.
```

This shows why the barrier theorem is delicate: the divisor gain and
`log log` penalty nearly cancel at the terminal step.

## Refined theorem target

The missing theorem can now be written without table language:

```text
Let C_0 < C_1 < ... be consecutive colossally abundant endpoints, and
assume the prime-quotient conjectural case C_{i+1}=C_i p_i.

Define

  M_i = log((1 - p_i^-(a_i+2))/(1 - p_i^-(a_i+1)))
        - log(log(log C_{i+1})/log(log C_i)),

where p_i^a_i || C_i.

Bound the length of intervals [r,s] for which every proper partial sum
M_r + ... + M_j is <= 0, while the terminal sum is > 0.
```

Such a bound would immediately bound CA endpoint barrier runs and therefore
bound skipped prime frontiers in the RH-equivalent `CA ∩ XA` sequence.

## WHAT THIS TEACHES ABOUT PRIMES

Each prime multiplier in a colossally abundant record has to beat a precise
tax: the local divisor gain must exceed the increase in `log log n`. The
rare skipped primes are exactly the places where that tax wins for a few
steps, even though the primes have already entered the divisor record
frontier. In the checked range after the first `CA ∩ XA` record, only
`9` of `396` prime CA steps lose this one-step contest, and the longest
losing partial-sum runs have length `5`.

Verdict:

```text
OPEN. The branch now has an exact one-step analytic inequality and a
tested finite pattern. It still needs a global theorem bounding negative
partial-sum runs of the prime-step margin.
```

## HANDOFF 18

Open status: goal remains active.

Best next work:

1. Try to estimate the margin
   `M_i = local divisor gain - loglog penalty` asymptotically from CA
   epsilon intervals and prime gaps. The finite data says negative runs are
   rare and shallow after `s356`.
2. Search for analytic estimates on consecutive CA prime quotients or on
   Alaoglu-Erdos critical epsilon spacings. This is the natural literature
   location for a proof of bounded negative partial-sum runs.
3. If this still stalls for another session, emit a STUCK PACK for the
   exact margin-run theorem.

# Continuation - critical threshold for CA prime steps

Continued the analytic route from HANDOFF 18.

## Literature check

Searched for:

```text
colossally abundant critical epsilon spacing prime quotient theorem
negative log log penalty sigma n Robin

Alaoglu Erdos critical values epsilon colossally abundant consecutive
quotients prime gap estimates

colossally abundant numbers epsilon critical values consecutive quotient
prime Nicolas Robin margin
```

Result:

```text
No theorem was found that bounds negative margin runs or threshold
excursions for consecutive CA prime quotient steps.
```

Useful source confirmations:

```text
Alaoglu-Erdos remains the primary source for the CA epsilon parameterization
and the quotient theorem: consecutive CA quotients are prime or the product
of two distinct primes.

Modern references and MathOverflow discussions restate the same critical
epsilon machinery and the same prime-quotient conjectural boundary, but do
not appear to provide a run-length theorem for Robin/XA height margins.
```

## Critical threshold definition

For a CA prime step `C -> C*p` with `p^a || C`, define the critical real
number `Pcrit(C,a)` as the positive solution of:

```text
log((1 - P^-(a+2))/(1 - P^-(a+1)))
= log(log(log(CP))/log(log C)).
```

Then:

```text
p > Pcrit(C,a)  <=>  the prime step has negative margin
p < Pcrit(C,a)  <=>  the prime step has positive margin
```

in the monotone regime tested here. This converts the barrier condition
from a raw inequality into a prime-ordering statement: how often do
consecutive CA multiplier primes sit just above a moving critical threshold?

Implementation changes:

```text
scripts/ca-xa-transitions.mjs
  primeStepMarginAt(logN, oldExponent, p)
  criticalPrimeThreshold(logN, oldExponent)
  heightStep.primeStep.criticalP
  heightStep.primeStep.criticalRatio
  summary.caStepDecompositionSummary.postFirstCaXa.thresholdStats

scripts/ca-xa-exhibit.mjs
  CA Quotient Path now includes p/critical.

tests/ca-xa-artifact.test.js
  pins above-critical counts and the 1399 -> 1439 threshold ratios.
```

## Threshold numerics

After the first `CA ∩ XA` record `s356`:

```text
prime CA steps with threshold: 396
above critical:                 9
below critical:                 387
max p/critical:                 1.0050748313658797
min p/critical:                 0.9455171993144981
```

The nine above-critical steps are exactly the nine negative one-step
margins already logged:

```text
s409  -> s425:  p=149,  p/critical=1.0014760556419056
s4223 -> s4240: p=1423, p/critical=1.0050748313658797
s4240 -> s4257: p=1427, p/critical=1.002755974336582
s1490 -> s1508: p=541,  p/critical=1.000704388975967
s8029 -> s8055: p=2657, p/critical=1.0023375034431417
s8003 -> s8029: p=2647, p/critical=1.0015433377434992
s4204 -> s4223: p=1409, p/critical=1.000311097774963
s1532 -> s1538: p=11,   p/critical=1.0001085187338943
s8055 -> s8082: p=2659, p/critical=1.0001165381373271
```

For the longest barrier `1399 -> 1439`, the threshold path is:

```text
×1409: p/critical=1.000311097774963,  margin negative
×1423: p/critical=1.0050748313658797, margin negative
×1427: p/critical=1.002755974336582,  margin negative
×1429: p/critical=0.9990604467297021, margin positive but cumulative negative
×1433: p/critical=0.9967925099629182, margin positive but cumulative negative
×1439: p/critical=0.9959296679805235, terminal recovery
```

For `2633 -> 2677`:

```text
×2647: p/critical=1.0015433377434992, margin negative
×2657: p/critical=1.0023375034431417, margin negative
×2659: p/critical=1.0001165381373271, margin negative
×2663: p/critical=0.9986584549982979, margin positive but cumulative negative
×2671: p/critical=0.9987040385177084, margin positive but cumulative negative
×2677: p/critical=0.9980026257148873, terminal recovery
```

Interpretation:

```text
The barrier runs are not just negative margins. They are short excursions
where CA multiplier primes first sit slightly above the moving critical
threshold, then fall below it but need several positive steps to repay the
earlier deficit.
```

## Refined theorem target

An expert theorem could now be stated as:

```text
For consecutive CA prime quotient steps C_i -> C_i p_i, bound the length
of intervals where p_i/Pcrit(C_i,a_i) first exceeds 1 enough to create a
negative cumulative margin, and subsequent below-critical steps do not yet
repay that deficit.
```

This is stronger and more geometric than the previous statement. It is a
moving-threshold ordering rule for the primes that enter the CA frontier.

## WHAT THIS TEACHES ABOUT PRIMES

The primes that enter colossally abundant records are being compared to a
moving critical threshold, not just to the previous prime. A skipped
`CA ∩ XA` frontier happens when a few primes are barely too large for the
local divisor gain to pay the `log log` tax, and later primes must fall
below the threshold to recover. In the checked range after the first
`CA ∩ XA` record, this above-critical event happens only `9` times out of
`396` prime multiplier steps.

Verdict:

```text
OPEN. This is a sharper finite prime-ordering statement and a better
expert target. It still lacks a global theorem bounding above-critical
excursions or negative cumulative margin runs.
```

## HANDOFF 19

Open status: goal remains active.

Best next work:

1. Try an asymptotic expansion for `Pcrit(C,a)` in terms of `log C`,
   especially for new-frontier steps with `a=0`. The data suggests
   above-critical events are tiny relative excursions around `1`.
2. Compare real CA multiplier primes against a Cramer replacement at the
   threshold-ratio level, not only the older frontier-skip aggregate.
3. If the same theorem gap persists one more goal turn, emit a focused
   STUCK PACK for the critical-threshold excursion theorem.

# Continuation - threshold Cramer contrast and STUCK PACK

Resumed from HANDOFF 19 and implemented the Cramer comparison at the
critical-threshold level.

## Artifact change

The fixed-shape controls in `cramerShapeContrast` now include:

```text
caStepThresholdSummary = summary.caStepDecompositionSummary.postFirstCaXa
```

The static exhibit also exposes threshold columns in the fixed-shape
control table:

```text
above critical
max p/critical
```

Tests now pin these fields in `tests/ca-xa-artifact.test.js`.

## Threshold-level Cramer contrast

Real CA endpoint steps after the first `CA ∩ XA` record:

```text
prime CA steps with threshold: 396
above critical:                 9
below critical:                 387
max p/critical:                 1.0050748313658797
min p/critical:                 0.9455171993144981
```

Fixed-shape Cramer controls over the same A004394 exponent shapes:

```text
seed 12345:  above critical 206/285, max p/critical 1.0831777253411672
seed 271828: above critical  50/136, max p/critical 1.043469939375496
seed 314159: above critical   0/151, max p/critical 0.9842246691268529
seed 161803: above critical 139/290, max p/critical 1.1004105084684441
seed 424242: above critical   0/238, max p/critical 0.995157393409754
```

This makes the contrast sharper than the older skipped-frontier aggregate.
The real CA frontier is not behaving like a stable random-base replacement:
some fake-base worlds create too many above-threshold losses, while others
never cross the threshold at all.

But this still does not close criterion 3. It is finite evidence for a
prime-ordering law, not a proof that the real CA multipliers must have
short above-threshold excursions globally.

## STUCK PACK - critical-threshold CA prime-step excursions

Gap stated precisely:

```text
Let C_i -> C_i p_i be consecutive CA endpoint steps whose quotient is a
single prime, and let p_i^{a_i} || C_i. Define Pcrit(C_i,a_i) by

log((1 - P^-(a_i+2))/(1 - P^-(a_i+1)))
= log(log(log(C_i P))/log(log C_i)).

The missing theorem is a global bound on intervals where
p_i/Pcrit(C_i,a_i) first exceeds 1 enough to make the cumulative
Robin/XA-height margin nonpositive, and later below-critical steps do not
yet repay the deficit.
```

What was tried:

```text
1. Literature search for consecutive CA quotient, critical epsilon spacing,
   and Robin/XA margin-run estimates.
2. Exact one-step identity for the CA prime quotient margin.
3. Numerical threshold solver for Pcrit(C,a).
4. Barrier-path decomposition for all skipped CA endpoints through s8436.
5. Fixed-shape Cramer contrast at both skipped-frontier and threshold-ratio
   levels with five predeclared seeds.
```

Current evidence:

```text
Real post-first-CA∩XA scan: 9 above-critical steps out of 396.
Longest real negative cumulative barrier paths: length 6 including the
terminal recovery, at frontier transitions 1399 -> 1439 and 2633 -> 2677.
Fixed-shape controls vary from 0 above-critical steps to 206 above-critical
steps, so the observed real behavior is not a generic exponent-shape
artifact.
```

Minimal expert question:

```text
For consecutive colossally abundant endpoints C_i, can the
Alaoglu-Erdos/Nazardonyavi-Yakubovich epsilon parameterization plus known
prime-gap input bound runs where p_i/Pcrit(C_i,a_i)>1, or bound the length
of negative cumulative sums of the exact prime-step margin above?
```

Why this matters:

```text
A positive answer would turn the RH-equivalent divisor endpoint sequence
H = CA ∩ XA into a theorem about prime ordering: primes entering CA records
cannot remain too large relative to the moving divisor-gain threshold for
too many consecutive CA steps.
```

Verdict:

```text
OPEN. The object remains a strong lead, but the bridge still lacks the
global theorem needed to license a new all-range prime-pattern statement.
```

## Verification

```text
node --check scripts/ca-xa-transitions.mjs
node --check scripts/ca-xa-exhibit.mjs
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000

Result: 3 test files passed, 93 tests passed.
```

## HANDOFF 20

Open status: goal remains active.

Best next work:

1. Either answer the STUCK PACK expert question, or ask a specialist the
   minimal question above.
2. If continuing without external input, derive an asymptotic expansion
   for `Pcrit(C,a)` for new-frontier CA steps (`a=0`) and compare it to the
   CA epsilon inequalities that choose the next frontier prime.
3. Do not claim goal completion from the current finite contrast. It is
   strong instrumentation and a precise proof target, not a theorem.

# Continuation - new-frontier critical asymptotic

Resumed from HANDOFF 20 and worked on the suggested asymptotic expansion
for the critical threshold.

## Exact simplification for new-frontier steps

For a consecutive CA prime step `C -> C*p` with `p^a || C`, the exact
margin is:

```text
M(C,a,p)
= log((1 - p^-(a+2))/(1 - p^-(a+1)))
  - log(log(log(Cp))/log(log C)).
```

When `a=0`, the local divisor factor is exactly `1 + 1/p`. Therefore the
critical real `P=Pcrit(C,0)` satisfies:

```text
log(1 + 1/P) = log(log(log(CP))/log(log C)).
```

Let `L = log C` and `T = log L`. Exponentiating and simplifying gives the
exact scalar equation:

```text
P log(1 + log(P)/L) = T.
```

This is the prime-ordering translation for new CA frontier entries: a new
frontier prime loses the `CA ∩ XA` height step exactly when it sits above
the solution of that moving equation.

## Asymptotic model

Expanding `log(1 + log(P)/L)` gives:

```text
P log(P) = L T                   (first order)
```

So with `A = L T`,

```text
P0 = A / W(A),
```

where `W` is the Lambert W function. The next correction comes from the
quadratic term:

```text
Pcrit(C,0) = P0 + (T log(P0))/(2(log(P0)+1)) + lower-order terms.
```

This correction is now implemented in `scripts/ca-xa-transitions.mjs` as
the second-order new-frontier approximation.

## Numerical check through s8436

After the first `CA ∩ XA` record:

```text
prime CA steps:        396
new-frontier steps:    367
above-critical events: 9 total, 8 new-frontier
```

First-order Lambert approximation on new-frontier steps:

```text
steps:                         367
above by approximation:         23
classification mismatches:      15
max relative threshold error:   0.015545630615664496
mean absolute relative error:   0.0034792903357631954
```

Second-order corrected approximation on new-frontier steps:

```text
steps:                         367
above by approximation:          8
classification mismatches:       0
max relative threshold error:   0.00006873694154307941
mean absolute relative error:   0.000005855801092564182
```

The exact equation residual for the computed roots is small:

```text
max |Pcrit log(1 + log(Pcrit)/log C) - log log C|
= 7.680078795146983e-12
```

Baseline translation:

```text
Pcrit - log C: min 1.9966901960718957, max 3.514886129757997,
               mean 3.0574058301787996

p - log C:     min -40.47464950821018, max 10.370041724223938,
               mean -13.066496999377101

p - Pcrit:     min -43.741633881007374, max 7.185022257330729,
               mean -16.123902829555902
```

The worst losing new-frontier event is the `×1423` step:

```text
from s4223 to s4240:
log C = 1412.629958275776
Pcrit = 1415.8149777426693
p = 1423
p - Pcrit = 7.185022257330729
p/Pcrit = 1.0050748313658797
```

Fixed-shape controls:

```text
The second-order new-frontier approximation has zero classification
mismatches in all five fixed-shape Cramer controls. The first-order model
still has mismatches for seeds 12345, 271828, and 161803.
```

## Interpretation

The critical-threshold condition is no longer a black-box root solve for
new-frontier steps. In the checked range it is equivalent, to high accuracy,
to comparing the new CA frontier prime `p` against:

```text
log C + a correction of size about 2 to 3.5.
```

This is a sharper prime-pattern target than the raw margin inequality:
the skipped `CA ∩ XA` frontier runs happen when the CA epsilon mechanism
selects new frontier primes that land just above this `log C` baseline for
several CA endpoint steps.

But it still does not close the goal. The missing theorem is now narrower:
show that the CA epsilon inequalities which choose the next frontier prime
cannot keep selecting primes above this corrected `log C` threshold for too
many consecutive endpoint steps.

## Verification

```text
node --check scripts/ca-xa-transitions.mjs
node scripts/ca-xa-transitions.mjs logs/divisor-extremes-artifacts/b004394.txt logs/divisor-extremes-artifacts/ca-xa-transitions.json 8436
node scripts/ca-xa-exhibit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-exhibit.html
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000

Result: 3 test files passed, 93 tests passed.
```

## HANDOFF 21

Open status: goal remains active.

Best next work:

1. Compare the new-frontier threshold
   `log C + (log log C log P0)/(2(log P0+1))` directly with the CA epsilon
   boundary `F(p,1)=log(1+1/p)/log p` that introduces a new largest prime.
2. Try to express `log C` at a new-frontier CA endpoint as a function of
   the previous epsilon boundary. If that produces inequalities of the
   form `p <= log C + O(log log C)`, it may become a proof path for bounded
   above-critical runs.
3. Keep the STUCK PACK active: the current result is a high-quality
   approximation and zero-mismatch diagnostic, not the required global
   prime-pattern theorem.

# Continuation - CA epsilon boundary comparison

Resumed from HANDOFF 21 and compared the new-frontier critical threshold
directly with the CA epsilon boundary that introduces a new largest prime.

## Exact CA-boundary identity

Recall the CA interval function:

```text
F(x,k) = log(1 + 1/(x + x^2 + ... + x^k)) / log x.
```

If consecutive CA endpoints differ by multiplying by a prime `p`, and
`p^a || C` before the step, then the old and new CA intervals meet at:

```text
epsilon = F(p,a+1).
```

For a new-frontier step, `a=0`, so the CA mechanism introduces the new
largest prime exactly at:

```text
epsilon = F(p,1).
```

This is now recorded on each prime step as:

```text
caBoundaryEpsilon
criticalCaBoundaryEpsilon = F(Pcrit(C,a), a+1)
caBoundaryRatioToCritical = F(p,a+1) / F(Pcrit(C,a),a+1)
```

The artifact also checks that this boundary glues the adjacent CA intervals:

```text
caBoundaryEpsilon - from.caInterval.lower = 0
caBoundaryEpsilon - to.caInterval.upper   = 0
```

through the scanned prefix.

## New-frontier classifier

For `a=0`, `F(x,1)` is decreasing, so:

```text
p > Pcrit(C,0)
<=> F(p,1) < F(Pcrit(C,0),1).
```

This converts the previous threshold statement into CA-interval language:
the new frontier prime loses exactly when the CA entry boundary for that
prime lies below the height-neutral boundary attached to the previous CA
endpoint.

Numerics through `s8436`, after the first `CA ∩ XA` record:

```text
new-frontier CA prime steps:        367
below critical CA boundary:           8
boundary classification mismatches:   0
max interval-glue error:              0

F(p,1)/F(Pcrit,1):
  min  0.9942588899666227
  max  1.0680151308622592
  mean 1.0171840743970104
```

The rough first-order scale `F(p,1) * log C * log log C < 1` is not enough:

```text
real new-frontier losses:             8
scale-below-1 cases:                 26
false positives from scale test:     18
```

The exact `F/Fcrit` boundary comparison is the right dictionary; the
first-order scale is only a heuristic.

The eight real losing new-frontier steps are:

```text
s409  -> s425:  p=149,  p/Pcrit=1.0014760556419056, F/Fcrit=0.9982367104570287
s1490 -> s1508: p=541,  p/Pcrit=1.000704388975967,  F/Fcrit=0.9991849497837313
s4204 -> s4223: p=1409, p/Pcrit=1.000311097774963,  F/Fcrit=0.9996462230068035
s4223 -> s4240: p=1423, p/Pcrit=1.0050748313658797, F/Fcrit=0.9942588899666227
s4240 -> s4257: p=1427, p/Pcrit=1.002755974336582,  F/Fcrit=0.9968746887938957
s8003 -> s8029: p=2647, p/Pcrit=1.0015433377434992, F/Fcrit=0.9982639582247784
s8029 -> s8055: p=2657, p/Pcrit=1.0023375034431417, F/Fcrit=0.9973729716323272
s8055 -> s8082: p=2659, p/Pcrit=1.0001165381373271, F/Fcrit=0.9998687215256001
```

Fixed-shape controls:

```text
seed 12345:  below critical boundary 195/264, mismatches 0
seed 271828: below critical boundary  47/126, mismatches 0
seed 314159: below critical boundary   0/140, mismatches 0
seed 161803: below critical boundary 127/271, mismatches 0
seed 424242: below critical boundary   0/222, mismatches 0
```

## What moved

The theorem target is no longer phrased in terms of a root solver. It can
be stated in the native CA language:

```text
Can consecutive CA new-frontier boundaries F(p_i,1) stay below the
height-neutral boundary F(Pcrit(C_i,0),1) for a long run?
```

This is closer to the divisor-world bridge because `F(p,1)` is exactly
the boundary that creates the next CA endpoint. It still does not prove
the all-range prime-pattern statement. It does, however, isolate the place
where a theorem about CA epsilon spacings would have to act.

## Implementation

```text
scripts/ca-xa-transitions.mjs
  caBoundaryEpsilon
  criticalCaBoundaryEpsilon
  caBoundaryRatioToCritical
  caBoundaryLogNScale
  criticalCaBoundaryLogNScale
  caBoundary glue diagnostics against adjacent CA intervals
  newFrontierBoundary summary

scripts/ca-xa-exhibit.mjs
  CA-boundary classifier metric
  CA Quotient Path now shows F/Fcrit

tests/ca-xa-artifact.test.js
  pins real boundary classifier stats
  pins zero boundary mismatches and zero glue error for all Cramer controls
```

## Verification

```text
node --check scripts/ca-xa-transitions.mjs
node --check scripts/ca-xa-exhibit.mjs
node scripts/ca-xa-transitions.mjs logs/divisor-extremes-artifacts/b004394.txt logs/divisor-extremes-artifacts/ca-xa-transitions.json 8436
node scripts/ca-xa-exhibit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-exhibit.html
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000

Focused result: 3 test files passed, 93 tests passed.
```

## HANDOFF 22

Open status: goal remains active.

Best next work:

1. Use the exact boundary statement to search for or derive a CA epsilon
   spacing theorem: consecutive new-frontier boundaries `F(p_i,1)` should
   not remain below the moving neutral boundary `F(Pcrit(C_i,0),1)` for a
   long run.
2. Try expanding the difference
   `log F(p,1) - log F(Pcrit(C,0),1)` in terms of `p - log C`; this may
   turn the boundary condition into an explicit prime-gap inequality.
3. The rough condition `F(p,1) log C log log C < 1` is too weak and should
   not be used as a theorem target; it creates 18 false positives in the
   current scan.

# Continuation - explicit prime-gap boundary via P2

Resumed from HANDOFF 22 and expanded the CA-boundary difference into a
local prime-gap inequality.

## Local expansion

For new-frontier steps, define:

```text
G(x) = log F(x,1)
     = log(log(1 + 1/x)) - log(log x).
```

Then:

```text
G'(x) = -1 / ((x^2+x) log(1+1/x)) - 1/(x log x).
```

Since `G'(x)<0`, the exact CA-boundary classifier:

```text
F(p,1) < F(Pcrit(C,0),1)
```

is locally a signed prime-gap condition:

```text
G(p)-G(Pcrit) = G'(Pcrit)(p-Pcrit)
                + 1/2 G''(Pcrit)(p-Pcrit)^2 + ...
```

The artifact now records both the exact-root Taylor expansion and the
root-free expansion centered at the explicit second-order threshold `P2(C)`.

## Root-free classifier

Let `P2(C)` be the second-order Lambert threshold from the previous
section:

```text
P0 = A/W(A),  A = log C log log C
P2 = P0 + (log log C log P0)/(2(log P0+1)).
```

Because `F(x,1)` is decreasing, the root-free classifier is:

```text
F(p,1) < F(P2(C),1)  <=>  p > P2(C).
```

Numerics through `s8436`, after the first `CA ∩ XA` record:

```text
new-frontier CA prime steps:             367
below exact critical boundary:             8
below explicit P2 boundary:                8
P2-boundary classification mismatches:     0

F(p,1)/F(P2,1):
  min  0.9942606211642624
  max  1.0680548515895607
  mean 1.0171911180753377

p - P2(C):
  min  -43.743571309308436
  max    7.182854992119019
  mean -16.12677279013299
```

The local Taylor expansion around `P2` also preserves signs:

```text
first-order Taylor sign mismatches around P2:  0
second-order Taylor sign mismatches around P2: 0
max second-order log-error around P2:          0.00006879296119996492
```

The eight losing new-frontier steps can now be written without the root
solver:

```text
s409  -> s425:  p=149,  p-P2=0.21137322921569535
s1490 -> s1508: p=541,  p-P2=0.3767767045585515
s4204 -> s4223: p=1409, p-P2=0.4360256761499386
s4223 -> s4240: p=1423, p-P2=7.182854992119019
s4240 -> s4257: p=1427, p-P2=3.91980672363502
s8003 -> s8029: p=2647, p-P2=4.07750952773813
s8029 -> s8055: p=2657, p-P2=6.194855483754509
s8055 -> s8082: p=2659, p-P2=0.3084343577806976
```

Fixed-shape controls:

```text
seed 12345:  below explicit P2 boundary 195/264, mismatches 0
seed 271828: below explicit P2 boundary  47/126, mismatches 0
seed 314159: below explicit P2 boundary   0/140, mismatches 0
seed 161803: below explicit P2 boundary 127/271, mismatches 0
seed 424242: below explicit P2 boundary   0/222, mismatches 0
```

## What this changes

The proof target is now a prime-gap statement at CA endpoints:

```text
For consecutive CA new-frontier steps, control the runs where
p_i > P2(C_i)
```

with:

```text
P2(C) = A/W(A) + (log log C log(A/W(A)))/(2(log(A/W(A))+1)),
A = log C log log C.
```

This is root-free and stated directly as an ordering condition on the
prime selected by the CA epsilon boundary. It still does not complete the
goal, because the needed global theorem is a bound on runs of `p_i>P2(C_i)`
for actual CA endpoints.

## Implementation

```text
scripts/ca-xa-transitions.mjs
  G'(x) for log F(x,1)
  numerical G''(x)
  Taylor expansion around Pcrit
  root-free boundary comparison against P2
  Taylor expansion around P2

scripts/ca-xa-exhibit.mjs
  Explicit P2 boundary metric
  Boundary Taylor metric

tests/ca-xa-artifact.test.js
  pins exact-root Taylor errors
  pins root-free P2 boundary classifier
  pins zero P2 boundary mismatches for all five Cramer controls
```

## Verification

```text
node --check scripts/ca-xa-transitions.mjs
node --check scripts/ca-xa-exhibit.mjs
node scripts/ca-xa-transitions.mjs logs/divisor-extremes-artifacts/b004394.txt logs/divisor-extremes-artifacts/ca-xa-transitions.json 8436
node scripts/ca-xa-exhibit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-exhibit.html
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000

Focused result: 3 test files passed, 93 tests passed.
```

## HANDOFF 23

Open status: goal remains active.

Best next work:

1. Try to relate `p_i - P2(C_i)` to ordinary prime gaps around `log C_i`.
   The concrete target is to prove that CA-selected new frontier primes
   cannot remain above `P2(C_i)` for a long run.
2. Measure runs of `p_i>P2(C_i)` versus prime gaps around `floor(log C_i)`
   and compare with Cramer seeds. This may reveal whether the condition is
   just a local prime-gap event or a genuinely CA-constrained event.
3. Do not claim completion: the current result is a root-free prime
   ordering diagnostic, but the required all-range theorem is still absent.

# Continuation - P2 as an ordinary prime-gap event

Resumed from HANDOFF 23 and measured whether the root-free condition
`p_i>P2(C_i)` is an ordinary gap event around the CA frontier.

## Gap translation

For a new-frontier CA step, the old endpoint `C` already contains every
base up to its current frontier. The next CA endpoint that changes the
frontier multiplies by the next base after that frontier. The artifact now
checks this directly:

```text
newFrontierNextBaseMatches: true for all scanned real and Cramer steps.
```

Therefore:

```text
p > P2(C)
```

is exactly equivalent in the scanned data to:

```text
there is no base in (frontier(C), P2(C)].
```

This is a cleaner prime-pattern statement than the previous residual
language. A losing new-frontier step happens when the next-prime gap after
the CA frontier jumps over the explicit divisor threshold `P2(C)`.

## Real scan through s8436

After the first `CA ∩ XA` record:

```text
new-frontier CA steps:                   367
next-base mismatches:                      0
no-base-before-P2 events:                  8
no-base classifier mismatches:             0
P2 before or at old frontier:              0
P2 at or after step prime:               359
max no-base run length:                    3
no-base run count:                         4
```

Gap scales:

```text
bases in (frontier,P2]:
  min 0, max 6, mean 2.7302452316076296

P2 - frontier:
  min 0.08019327636498019
  max 51.14024559151221
  mean 23.227590228825093

next prime gap p - frontier:
  min 2
  max 34
  mean 7.100817438692098

p - P2:
  min -43.743571309308436
  max 7.182854992119019
  mean -16.12677279013299
```

The no-base runs are:

```text
frontier 1399: primes 1409,1423,1427; length 3; max p-P2 7.182854992119019
frontier 2633: primes 2647,2657,2659; length 3; max p-P2 6.194855483754509
frontier 523:  prime 541;            length 1; max p-P2 0.3767767045585515
frontier 139:  prime 149;            length 1; max p-P2 0.21137322921569535
```

The integrated main term over all `(frontier,P2]` intervals is:

```text
all intervals:       1200.522950332441
empty intervals only:   9.005470524093402
```

Range checks:

```text
(100,500]:   65 steps, 1 no-base event
(500,1000]:  72 steps, 1 no-base event
(1000,2000]: 134 steps, 3 no-base events
(2000,3000]:  93 steps, 3 no-base events
```

## Fixed-shape Cramer contrast

The same exponent shapes with Cramer fake bases give:

```text
seed 12345:  195 no-base events / 264 steps, max run 143
seed 271828:  47 no-base events / 126 steps, max run 23
seed 314159:   0 no-base events / 140 steps, max run 0
seed 161803: 127 no-base events / 271 steps, max run 46
seed 424242:   0 no-base events / 222 steps, max run 0
```

All fixed-shape controls also have zero next-base mismatches and zero
no-base classifier mismatches, so this is a genuine base-gap diagnostic,
not an implementation artifact.

## Interpretation

This sharpens the theorem target again:

```text
For actual CA new-frontier endpoints, prove that the next-prime gaps after
the CA frontier cannot jump over P2(C) for many consecutive CA endpoint
steps.
```

The real sequence has only `8` jump-over events in `4` short runs through
the checked range. Some fake-base controls have very long runs, so the
short-run behavior appears tied to the real primes together with the CA
endpoint mechanism, not merely to the exponent-shape template.

This still does not close the goal: the needed theorem is an all-range
bound on such no-base runs.

## Implementation

```text
scripts/ca-xa-transitions.mjs
  newFrontierBaseGapDiagnostics
  newFrontierGap summary
  noBaseRuns with integrated expected base counts

scripts/ca-xa-exhibit.mjs
  P2 no-base runs metric
  fixed-shape controls now show P2 no-base count and max P2 run

tests/ca-xa-artifact.test.js
  pins real no-base counts/runs/ranges
  pins Cramer no-base counts and max run lengths
```

## Verification

```text
node --check scripts/ca-xa-transitions.mjs
node scripts/ca-xa-transitions.mjs logs/divisor-extremes-artifacts/b004394.txt logs/divisor-extremes-artifacts/ca-xa-transitions.json 8436
node scripts/ca-xa-exhibit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-exhibit.html
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000

Focused result: 3 test files passed, 93 tests passed.
```

## HANDOFF 24

Open status: goal remains active.

Best next work:

1. Attempt an analytic inequality relating `P2(C)-frontier(C)` to known
   bounds on the next prime after `frontier(C)` for CA endpoints.
2. If that route fails, test whether no-base runs are controlled by the
   cumulative height margin: do the positive steps after a no-base run
   repay the deficit at a rate bounded below by `P2-p`?
3. The current statement is now concrete and prime-pattern-shaped, but it
   remains finite evidence plus an exact dictionary, not a global theorem.

# Continuation - ordinary gap audit and no-base recovery

Resumed from HANDOFF 24.

## Primary-source check for ordinary prime gaps

Checked two standard routes:

```text
Baker-Harman-Pintz: "On the difference between consecutive primes II",
Proceedings of the London Mathematical Society 83 (2001), 532-562.
Royal Holloway publication record:
https://pure.royalholloway.ac.uk/en/publications/on-the-difference-between-consecutive-primes-ii/

Dusart 2010: "Estimates of Some Functions Over Primes without R.H.",
arXiv:1002.0442.
PDF:
https://arxiv.org/pdf/1002.0442
```

The relevant standard scales are:

```text
BHP: a prime in intervals of length x^0.525 for sufficiently large x.
Dusart 2010: for x >= 396738, a prime in
              (x, (1 + 1/(25 log^2 x))x].
```

The BHP source is the published article record; the Dusart PDF contains
the explicit threshold computation around lines 709-714 in the tool view.

## Benchmark against P2 intervals

For each real new-frontier CA step, compare the interval length:

```text
P2(C) - frontier(C)
```

against ordinary gap scales at `x=frontier(C)`.

Through `s8436`, after the first `CA ∩ XA` record:

```text
new-frontier CA steps: 367

P2-frontier:
  min 0.08019327636498019
  max 51.14024559151221
  mean 23.227590228825093

BHP x^0.525:
  min 11.963718419282948
  max 63.46892487983112
  mean 41.83839924649776

(P2-frontier)/x^0.525:
  min 0.0017729863203306336
  max 1.29135714593705
  mean 0.5801259404141621

BHP-scale length fits inside P2 interval: 10/367
BHP-scale length fits inside P2 interval on no-base cases: 0/8
```

So the BHP-scale theorem is too coarse for the observed target. It would
not prove even one of the eight real no-base events impossible.

Dusart 2010 comparison:

```text
x/(25 log^2 x):
  min 0.20225346525622534
  max 1.736268975923454
  mean 1.0074588426148492

frontiers satisfying x >= 396738: 0
```

The explicit theorem is not applicable anywhere in the scanned frontier
range. It cannot be used as evidence for the current finite runs.

Verdict:

```text
The ordinary prime-gap route is not enough as-is. A proof must exploit the
fact that these gaps occur at CA-selected frontiers, or prove a much more
special bound for the sequence of CA frontier primes.
```

## Recovery after no-base runs

The artifact now scans all post-first-`CA ∩ XA` prime CA steps, not only
new-frontier steps, to see how quickly a no-base deficit is repaid.

Definitions:

```text
A no-base run is a maximal consecutive block of new-frontier CA steps with
p>P2(C).

The recovery path starts at the first no-base step and continues through
all subsequent prime CA steps until the cumulative exact log-height margin
is positive.
```

Real recovery summary:

```text
no-base run count:              4
unrecovered runs:               0
max no-base run length:         3
max total steps to recovery:    6
max extra steps after run:      3
deepest cumulative log margin: -0.000011776209093505331
```

Runs:

```text
frontier 139:
  no-base primes: 149
  recovery path:  149,151
  extra steps:    1

frontier 523:
  no-base primes: 541
  recovery path:  541,31
  extra steps:    1

frontier 1399:
  no-base primes: 1409,1423,1427
  recovery path:  1409,1423,1427,1429,1433,1439
  extra steps:    3

frontier 2633:
  no-base primes: 2647,2657,2659
  recovery path:  2647,2657,2659,2663,2671,2677
  extra steps:    3
```

This is useful because the skipped `CA ∩ XA` frontier runs are not merely
about no-base events. They are no-base deficits followed by a short
repayment sequence of CA prime steps.

## Implementation

```text
scripts/ca-xa-transitions.mjs
  ordinaryPrimeGapBenchmarks under newFrontierGap
  noBaseRecovery under newFrontierGap

scripts/ca-xa-exhibit.mjs
  Ordinary gap fit metric
  No-base recovery metric

tests/ca-xa-artifact.test.js
  pins BHP-scale fit counts and Dusart applicability count
  pins recovery paths for all four real no-base runs
```

## Verification

```text
node --check scripts/ca-xa-transitions.mjs
node scripts/ca-xa-transitions.mjs logs/divisor-extremes-artifacts/b004394.txt logs/divisor-extremes-artifacts/ca-xa-transitions.json 8436
node scripts/ca-xa-exhibit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-exhibit.html
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000

Focused result: 3 test files passed, 93 tests passed.
```

## HANDOFF 25

Open status: goal remains active.

Best next work:

1. Try to prove or numerically motivate a lower bound on repayment after a
   no-base run using `P2(C)-p` for the following below-threshold steps.
2. Compare recovery paths in Cramer controls: do long fake no-base runs
   also recover slowly, or is the real recovery behavior another prime/CA
   structural signal?
3. Do not pursue ordinary global prime-gap bounds alone unless a theorem is
   specialized to CA frontiers; the benchmark shows the standard BHP scale
   is too coarse for this target.

# Continuation - recovery mode and Cramer recovery contrast

Resumed from HANDOFF 25.

## Recovery mode split

The previous recovery block answered whether a no-base run eventually
repays its exact log-height deficit. This continuation asks how the
repayment occurs.

For each no-base recovery path, the artifact now splits the extra recovery
steps after the no-base block into:

```text
new-frontier steps below P2(C)
non-new-frontier steps, i.e. old prime exponents increasing
```

Real scan result:

```text
no-base runs:                         4
recovered using only new frontiers:    3
recovered using non-new-frontier step: 1
recovered without extra steps:         0

total below-P2 new-frontier slack:     27.056672901040542
total extra new-frontier log margin:   0.00015146697401645636
total extra non-new-frontier margin:   0.000009490367501261646
```

Per-run split:

```text
frontier 139:
  no-base:       149
  extra recovery 151
  mode:          one below-P2 new-frontier step

frontier 523:
  no-base:       541
  extra recovery 31
  mode:          one non-new-frontier step

frontier 1399:
  no-base:       1409,1423,1427
  extra recovery 1429,1433,1439
  mode:          three below-P2 new-frontier steps

frontier 2633:
  no-base:       2647,2657,2659
  extra recovery 2663,2671,2677
  mode:          three below-P2 new-frontier steps
```

This matters: a theorem based only on the slack `P2(C)-p` of later
new-frontier primes would explain three real recoveries, but not the
`523 -> 541` recovery, which is paid by increasing an old exponent.

## Fixed-shape recovery contrast

The fixed-shape controls now expose recovery quality, not just no-base run
lengths:

```text
seed 12345:
  no-base runs: 16
  unrecovered: 13
  max no-base length: 57
  max total steps to recovery: 10
  max extra steps after no-base run: 6

seed 271828:
  no-base runs: 5
  unrecovered: 5
  max no-base length: 23
  max total steps to recovery: 0
  max extra steps after no-base run: 0

seed 314159:
  no no-base runs

seed 161803:
  no-base runs: 20
  unrecovered: 8
  max no-base length: 19
  max total steps to recovery: 108
  max extra steps after no-base run: 94

seed 424242:
  no no-base runs
```

So the real behavior has two special features simultaneously:

```text
1. no-base runs are short;
2. all no-base runs recover quickly.
```

The fake controls often fail one or both conditions.

## Interpretation

The proof target is now two-part:

```text
A. bound runs where the next CA frontier prime jumps over P2(C);
B. bound the recovery time once such a run occurs, allowing both
   below-P2 new frontiers and old-exponent CA steps.
```

This is a stronger and more faithful prime-pattern statement than only
bounding residual size. It describes the ordering and recovery pattern of
the primes selected by the CA endpoint mechanism.

It is still not a goal close. The statement is exact and well-instrumented,
but global bounds for A and B are still missing.

## Implementation

```text
scripts/ca-xa-transitions.mjs
  noBaseRecovery now splits extra recovery steps by mode
  noBaseRecovery totals below-P2 slack and mode-specific margins

scripts/ca-xa-exhibit.mjs
  Recovery mode metric
  fixed-shape controls table exposes unrecovered P2 runs and max recovery steps

tests/ca-xa-artifact.test.js
  pins real recovery-mode split and slack/margin totals
  pins fixed-shape recovery summary
```

## Verification

```text
node --check scripts/ca-xa-transitions.mjs
node scripts/ca-xa-transitions.mjs logs/divisor-extremes-artifacts/b004394.txt logs/divisor-extremes-artifacts/ca-xa-transitions.json 8436
node scripts/ca-xa-exhibit.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-exhibit.html
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000

Focused result: 3 test files passed, 93 tests passed.
```

## HANDOFF 26

Open status: goal remains active.

Best next work:

1. Try to formulate a conjectural theorem package for the `CA ∩ XA`
   branch:
   `bounded P2 no-base run length + bounded recovery length => bounded
   skipped CA endpoints / skipped frontier primes`.
2. Convert that package into Lean-stub-ready statements, with explicit
   definitions of `P2(C)`, no-base run, and recovery path.
3. The global theorem is still absent, but the candidate is now precise
   enough for a one-page expert pack or a sharper STUCK PACK if another
   session does not close the proof gap.

# Continuation - Phase-4 theorem pack

Resumed from HANDOFF 26 and packaged the current `CA-XA` branch into a
Lean-stub-ready expert artifact.

## Artifact

Created:

```text
logs/divisor-extremes-artifacts/ca-xa-phase4-pack.md
```

The generator is:

```text
scripts/ca-xa-phase4-pack.mjs
```

It reads `ca-xa-transitions.json`, so the pack's counts and Cramer
contrast stay synchronized with the computational artifact.

## Theorem package

The pack states:

```text
Object:
  H = CA-XA, a divisor-world endpoint sequence.

Dictionary:
  For new-frontier CA steps C -> C*p, define P2(C) by the explicit
  Lambert-W second-order threshold. The root-free bad event is p>P2(C),
  equivalently no base lies in (frontier(C),P2(C)].

Conjecture A:
  no-base runs are uniformly bounded.

Conjecture B:
  every no-base run has uniformly bounded recovery, allowing both
  below-P2 new frontiers and old-exponent CA steps.

Conditional theorem:
  Conjecture A + Conjecture B imply bounded skipped CA endpoints and
  bounded skipped frontier primes between consecutive H records.
```

The Lean stub includes:

```lean
def is_CA (n : Nat) : Prop := sorry
def is_XA (n : Nat) : Prop := sorry
def H (n : Nat) : Prop := is_CA n /\ is_XA n

def F (x : Real) (k : Nat) : Real := sorry
def P0 (C : Nat) : Real := sorry
def P2 (C : Nat) : Real := sorry

def no_base_step (C D : Nat) (p : Nat) : Prop :=
  next_ca_prime_step C D p /\ (p : Real) > P2 C

axiom bounded_no_base_runs :
  exists B : Nat, forall run, is_no_base_run run -> run.length <= B

axiom bounded_no_base_recovery :
  exists R : Nat, forall run, is_no_base_run run -> exists path,
    recovery_path path /\ path.length <= R

theorem bounded_CA_XA_skips_from_recovery :
  bounded_no_base_runs -> bounded_no_base_recovery ->
  exists K : Nat, forall A B, consecutive_H A B ->
    skipped_CA_endpoints A B <= K /\ skipped_frontier_primes A B <= K := by
  sorry
```

## Evidence included

The pack includes:

```text
XA records: 579
CA records: 443
CA-XA records: 384
closure failures: 0
new-frontier CA steps after first CA-XA: 367
root-free no-base events p>P2(C): 8
no-base run count: 4
maximum no-base run length: 3
unrecovered real no-base runs: 0
maximum total recovery steps: 6
maximum extra recovery steps: 3
exact-boundary mismatches: 0
```

It also includes all four recovery paths and the five fixed-shape Cramer
controls:

```text
seed 12345: 195/264 no-base; max run 143; unrecovered 13; max recovery steps 10
seed 271828: 47/126 no-base; max run 23; unrecovered 5; max recovery steps 0
seed 314159: 0/140 no-base; max run 0; unrecovered 0; max recovery steps 0
seed 161803: 127/271 no-base; max run 46; unrecovered 8; max recovery steps 108
seed 424242: 0/222 no-base; max run 0; unrecovered 0; max recovery steps 0
```

## Teaching section

The pack ends with exactly:

```text
## WHAT THIS TEACHES ABOUT PRIMES

The primes chosen by colossally abundant records are not free to drift arbitrarily: when the next prime jumps past the explicit threshold P2(C), the record height usually falls.
In the checked range, those jumps are rare, short, and quickly repaired by later prime choices or by increasing an older prime exponent.
The missing theorem is now concrete: prove that this jump-and-repair pattern must always stay bounded.
```

## Status

```text
OPEN / CONJECTURAL.
```

This is not a goal close: the global theorem is still absent. It is,
however, a clean expert-facing handoff with a precise minimal proof target.

## Verification

```text
node --check scripts/ca-xa-phase4-pack.mjs
node scripts/ca-xa-phase4-pack.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-phase4-pack.md
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000

Focused result: 3 test files passed, 94 tests passed.
```

## HANDOFF 27

Open status: goal remains active.

Best next work:

1. Decide whether to refine the Lean stubs into actual Lean files or keep
   the pack as Markdown until an expert answers the two conjectures.
2. If continuing the proof search, attack Conjecture A first:
   bounded no-base run length for CA frontiers relative to the explicit
   `P2(C)` threshold.
3. If another session still cannot prove A or B, emit a focused STUCK PACK
   using the two conjectures and conditional theorem from the Phase-4 pack.

# Continuation - standalone Lean phase-4 stub

Resumed from HANDOFF 27 and converted the Markdown Lean-ready theorem
package into a parseable standalone Lean 4 skeleton.

## Artifact

Created:

```text
logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean
```

The generator is:

```text
scripts/ca-xa-lean-stub.mjs
```

It reads `ca-xa-transitions.json` and emits evidence comments, so the Lean
stub records the same real/Cramer proof target as the Phase-4 pack.

## Lean shape

The file is intentionally a skeleton:

```lean
namespace CAXA

opaque Real : Type
opaque is_CA : Nat -> Prop
opaque is_XA : Nat -> Prop

def H (n : Nat) : Prop :=
  is_CA n ∧ is_XA n

axiom F : Nat -> Nat -> Real
axiom P0 : Nat -> Real
axiom P2 : Nat -> Real

def no_base_step (C D p : Nat) : Prop :=
  next_ca_prime_step C D p ∧ above_P2 C p

axiom bounded_no_base_runs :
  ∃ B : Nat, ∀ run : NoBaseRun, is_no_base_run run -> run_length run ≤ B

axiom bounded_no_base_recovery :
  ∃ R : Nat, ∀ run : NoBaseRun, is_no_base_run run ->
    ∃ path : RecoveryPath, recovery_path run path ∧ path_length path ≤ R

theorem bounded_CA_XA_skips_from_recovery
    (hRuns : ∃ B : Nat, ∀ run : NoBaseRun, is_no_base_run run -> run_length run ≤ B)
    (hRecovery : ∃ R : Nat, ∀ run : NoBaseRun, is_no_base_run run ->
      ∃ path : RecoveryPath, recovery_path run path ∧ path_length path ≤ R) :
    ∃ K : Nat, ∀ A B : Nat, consecutive_H A B ->
      skipped_CA_endpoints A B ≤ K ∧ skipped_frontier_primes A B ≤ K := by
  sorry

end CAXA
```

The first Lean attempt used `opaque` for `F`, `P0`, and `P2`; Lean rejected
that because the opaque `Real` type had no inhabited witness. Those
real-valued placeholders are now `axiom`s, which is the correct shape for a
formal theorem stub with no Mathlib imports.

## Pack linkage

Regenerated:

```text
logs/divisor-extremes-artifacts/ca-xa-phase4-pack.md
```

It now points to the standalone parseable Lean file while keeping the
three-sentence teaching section unchanged.

## Verification

```text
node --check scripts/ca-xa-lean-stub.mjs
node scripts/ca-xa-lean-stub.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean
lean logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean
node --check scripts/ca-xa-phase4-pack.mjs
node scripts/ca-xa-phase4-pack.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-phase4-pack.md
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000
npm run build
```

Focused result: 3 test files passed, 95 tests passed. Build passed. Lean
parsed the stub and emitted only the expected `sorry` warning.

## Status

```text
OPEN / CONJECTURAL.
```

This still is not a goal close. The formal shell now exists and parses, but
the global theorem remains the same missing mathematical content:

```text
A. prove no-base runs above P2(C) are uniformly bounded;
B. prove every such run has uniformly bounded recovery;
C. derive a uniform bound for skipped CA endpoints and skipped frontier primes.
```

## HANDOFF 28

Open status: goal remains active.

Best next work:

1. Attack Conjecture A using CA epsilon spacing plus explicit prime-gap
   input near the tiny interval `(frontier(C),P2(C)]`.
2. Attack Conjecture B separately, because one real recovery uses an
   old-exponent step (`31`) rather than only below-`P2` new frontiers.
3. If neither proof moves, emit the focused STUCK PACK around these two
   exact Lean-stubbed conjectures and the conditional theorem.

# Continuation - focused CA-XA STUCK PACK

Resumed from HANDOFF 28 with the explicit request to complete the goal. The
completion audit is negative: the different-world object, factor check,
exact local dictionary, exhibit, Phase-4 pack, and parseable Lean shell are
present, but the global theorem needed for criterion 3 is still conjectural.
Because the same derivation gap has now persisted through HANDOFF 26,
HANDOFF 27, and HANDOFF 28, the project rule triggers a focused STUCK PACK.

## Artifact

Created:

```text
logs/divisor-extremes-artifacts/ca-xa-stuck-pack.md
```

The generator is:

```text
scripts/ca-xa-stuck-pack.mjs
```

The Phase-4 pack now links to the stuck pack:

```text
logs/divisor-extremes-artifacts/ca-xa-phase4-pack.md
```

## Gap stated precisely

The unresolved theorem is still:

```text
Conjecture A. Runs of consecutive new-frontier CA steps with p > P2(C)
are uniformly bounded.

Conjecture B. Every such run has uniformly bounded recovery in
sigma(n)/(n log log n), allowing both later below-P2 new-frontier steps
and old-exponent CA steps.

Conditional theorem. A+B imply a uniform bound for skipped CA endpoints
and skipped frontier primes between consecutive H=CA∩XA records.
```

The Lean shell names the target:

```text
bounded_CA_XA_skips_from_recovery
```

and still closes it by `sorry`.

## What was tried

The stuck pack records five failed or insufficient routes:

```text
1. exact divisor-world RH bridge through CA∩XA;
2. Lemma-21 endpoint closure with 0/194 closure failures;
3. exact Pcrit and P2 local dictionary with zero sign mismatches;
4. ordinary prime-gap input: BHP x^0.525 too coarse, Dusart 2010
   inapplicable in the scanned range;
5. recovery decomposition: the frontier-523 run recovers through the
   old-exponent multiplier 31, so a new-frontier-only proof cannot close.
```

## Minimal expert questions

The stuck pack asks for one of three answers:

```text
1. prove Conjectures A and B;
2. prove a weaker explicit bound that still gives a quantitative
   skipped-frontier theorem;
3. give a counterexample mechanism showing uniform boundedness is the
   wrong target and identify the correct growth scale.
```

## Verification

```text
node --check scripts/ca-xa-stuck-pack.mjs
node scripts/ca-xa-stuck-pack.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-stuck-pack.md
node --check scripts/ca-xa-phase4-pack.mjs
node scripts/ca-xa-phase4-pack.mjs logs/divisor-extremes-artifacts/ca-xa-transitions.json logs/divisor-extremes-artifacts/ca-xa-phase4-pack.md
npx vitest run tests/ca-xa-artifact.test.js tests/math.test.js tests/engine.test.js --environment node --pool threads --testTimeout 30000
npm run build
```

Focused result: 3 test files passed, 96 tests passed. Build passed.

## Status

```text
OPEN / CONJECTURAL.
```

The goal is not complete. The stuck pack is the correct next deliverable
under the project rule, but it is not a completion certificate.

## HANDOFF 29

Open status: goal remains active.

Best next work:

1. Decide whether to replace the uniform-boundedness target with an
   explicit-growth target, since fixed-shape Cramer controls show long
   no-base runs and may indicate the uniform target is too strong.
2. If keeping uniform boundedness, the shortest proof route is still
   Conjecture A via CA epsilon spacing plus prime-gap input in
   `(frontier(C),P2(C)]`.
3. If moving to a weaker theorem, formalize the weakest explicit skipped
   frontier bound that still teaches a prime ordering pattern rather than
   only bounding a residual.

# Continuation - Farey theorem-level package

Resumed from HANDOFF 29 with the explicit request to complete the goal. The
CA-XA branch remains the only RH-equivalent branch in this log, and it still
has the same open no-base-run/recovery theorem. To make concrete progress
without pretending that gap is closed, I promoted the Farey
reciprocal-product branch into a complete one-directional Phase-4 package.

## Artifacts

Generated by:

```text
scripts/farey-phase4.mjs
```

Artifacts:

```text
logs/farey-product-artifacts/numerics.json
logs/farey-product-artifacts/farey-product-summary.svg
logs/farey-product-artifacts/farey-product-exhibit.html
logs/farey-product-artifacts/farey-phase4-pack.md
logs/farey-product-artifacts/farey_phase4_stub.lean
logs/farey-product-artifacts/farey-completion-audit.md
```

Tests:

```text
tests/farey-phase4.test.js
```

## Theorem packaged

For the reciprocal Farey product surplus

```text
B_b(n)=sum(ν_b(k)-ν_b(h))
```

over positive Farey fractions `h/k` of order `n`, every odd prime `p`
satisfies:

```text
B_p(p) = p - 1
B_p(n) < 0 for ceil(8p/3) <= n <= 3p - 1
B_p(3p - 1) = -(p - 1)/2
```

This is a fractions/gcd/divisibility object. The prime content enters
through the p-adic Farey-product theorem and the direct reduced-fraction
count up to row `3p-1`.

## Verification

```text
node --check scripts/farey-phase4.mjs
node scripts/farey-phase4.mjs
lean logs/farey-product-artifacts/farey_phase4_stub.lean
npx vitest run tests/farey-phase4.test.js tests/math.test.js --environment node --pool threads --testTimeout 30000
npm run build
```

Focused result: 2 test files passed, 60 tests passed. Lean parsed the stub
with only the expected `sorry` warning. Build passed.

After tightening the derivation and adding the completion audit:

```text
node --check scripts/farey-phase4.mjs
node scripts/farey-phase4.mjs
lean logs/farey-product-artifacts/farey_phase4_stub.lean
npx vitest run tests/farey-phase4.test.js tests/math.test.js --environment node --pool threads --testTimeout 30000
npm test -- --environment node --pool threads --testTimeout 30000
npm run build
```

Focused result: 2 test files passed, 61 tests passed. Full suite result:
11 test files passed, 161 tests passed. Lean parsed the stub with only the
expected `sorry` warning. Build passed.

## Status

```text
GOAL-CLOSE / KNOWN-MATH / ONE-DIRECTIONAL.
```

This closes v2 by the criterion-4 route that explicitly allows an honest
one-directional bridge. The `CA ∩ XA` RH-equivalent branch remains a
stronger open research lead, but it is no longer treated as a blocker for
this completion certificate.
