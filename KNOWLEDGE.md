# KNOWLEDGE — what this tool has established about the primes

The project's compounding memory. Agents: read this before starting any
goal; append after finishing one; never delete (corrections cite the entry
they correct). Classification: `KNOWN-MATH` (matches an established
theorem), `OBSERVED` (replicated here, unexplained in hand), `OPEN`
(question worth pursuing). See MACHINE_HOW_TO_USE.md for the rules.

---

## 2026-06-12 · TWO-UNIVERSES / KNOWN-MATH + OBSERVED — function-field calibration

Source: `logs/2026-06-12-two-universes.md`; implementation in
`src/core/ffield.js`, registry integration in `src/core/registry.js`, tests in
`tests/ffield.test.js`, and calibration artifacts in
`logs/two-universes-artifacts/calibration-summary.json`,
`logs/two-universes-artifacts/calibration-summary.svg`, and
`logs/two-universes-artifacts/calibration-summary.png`, plus the aligned
two-world plot `logs/two-universes-artifacts/two-universes-comparison.png`.

**[F_q[t]: THEOREM]** The exact count of monic irreducibles of degree `n` is
`(1/n) sum_{d|n} mu(d) q^(n/d)`. The new polynomial Eratosthenes implementation
matches this formula with zero error for every generated row:
`q=2, n<=24` and `q=3, n<=15`. The optimized ternary product-crossing iterator
builds `q=3, n<=15` in about `26.6s` on this machine, down from about `125s`.

**[F_q[t]: THEOREM with hypotheses]** Weil's RH for curves over finite fields is
the theorem-side contrast to integer RH; see Milne,
`https://arxiv.org/abs/1509.00797`. Sawin-Shusterman, Annals of Mathematics
196 (2022), `https://annals.math.princeton.edu/2022/196-2/p01`, prove Chowla
and twin-prime results over `F_q[T]` under stated
odd-characteristic/large-field hypotheses. Caveat: their examples include
`F_{3^6}` for 2-point Chowla, so the current base-field `F_3[t]` run is
classified as measured calibration against the theorem shape, not as a direct
instance of that hypothesis. `F_2[t]` is outside the odd-characteristic
condition.

**[F_3[t]: measured]** Chowla two-point decay through degree `15`, fitting
`log |C(h,n)|` over nonzero rows:
`h=1` slope `-0.528104` (per-degree factor `0.589722`), `h=t` slope
`-0.437555` (factor `0.645613`), and `h=t+1` the same as `h=t`.

**[Z: measured]** The logarithmically weighted integer Chowla normalization
`sum mu(m)mu(m+h)/m / sum 1/m` remains negative at the few-percent scale.
At `N=10^7`: `h=1 -> -0.0475573`, `h=2 -> -0.0384093`,
`h=3 -> -0.0302006`. At `N=10^8`: `h=1 -> -0.0417993`,
`h=2 -> -0.0337572`, `h=3 -> -0.0265351`.
The gap between these curves is the live two-universes object.

**[F_q[t]: measured] / [Z: measured] twin-density comparison.** In `F_2[t]`,
the shifts `1`, `t`, and `t+1` have local singular-series obstructions at the
tested range: predicted `0`, observed `0`. In `F_3[t]` at degree `15`, observed
over predicted is `1.011649` for `h=1` and `1.000209` for `h=t` and `h=t+1`.
For integer twins, observed over `2*C2*integral dt/log^2(t)` rises from
`0.908187` at `10^5` to `0.985449` at `10^7` and `0.991897` at `10^8`.

**DIVERGENCE table, first battery.** Source artifact:
`logs/two-universes-artifacts/divergence-summary.json`, with five matched
Cramer-style seeds `12345,271828,314159,161803,424242`.

| statistic | F_q[t] value | Z value | matched null | verdict |
| --- | ---: | ---: | --- | --- |
| `[F_3[t]: measured]` residue chi z, degree-1 poly modulus; `[Z: measured]` mod 3 | `-0.675771` | `-0.653785` | F null abs `0.555985`; Z null abs `0.791554` | noise |
| `[F_3[t]: measured]` residue chi z, degree-2 poly modulus; `[Z: measured]` mod 15 | `-1.787888` | `-1.759483` | F null abs `1.060238`; Z null abs `0.353326` | noise |
| `[F_3[t]: measured]` gap autocorrelation lag-1 z; `[Z: measured]` prime-gap lag-1 z | `-0.009527` | `-35.556953` | F null abs `0.004526`; Z null abs `4.071342` | STAR DIVERGENCE candidate |
| `[F_3[t]: measured]` spacing L1 from Exp(1); `[Z: measured]` same | `0.297686` | `0.336751` | F null `0.226118`; Z null `0.330122` | STAR DIVERGENCE candidate |
| `[F_2[t]: measured]` gap autocorrelation lag-1 z; `[Z: measured]` prime-gap lag-1 z at `N=2^24` | `-38.674010` | `-37.397983` | F null abs `5.876399`; Z null abs `4.370919` | STAR SHARED-LAW candidate |
| `[F_2[t]: measured]` spacing L1 from Exp(1); `[Z: measured]` same at `N=2^24` | `0.302540` | `0.334248` | F null `0.081317`; Z null `0.328576` | STAR DIVERGENCE candidate |

CONNECTION: the `[F_3[t]: measured]` gap-autocorrelation divergence is the
matched two-universes version of the existing consecutive prime gap
anti-correlation entry: the integer anti-correlation survives and strengthens
under range expansion, while the `F_3[t]` degree/value sequence stays near its
polynomial Cramer null. The `[F_2[t]: measured]` shared-law row says that the
same statistic can also become shared once the characteristic-2 ordering is used,
so this is not a generic "all function fields behave like independent samples"
story.

CONNECTION: this is the calibrated function-field counterpart to the existing
Mertens/Chowla-adjacent integer entries: the integer column remains measured
and conjectural, while the function-field build can be pinned to exact finite
theorems and exact count formulas. It also connects to the twin-prime spectrum
entry by replacing spectral/noise evidence with a direct observed/predicted
density ratio in both universes.

## 2026-06-12 · NEW-OBJECT / OPEN — bounded continued-fraction denominators

Source: `logs/2026-06-12-deeper-structure.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `src/PrimeVisuals.jsx`, and
`scripts/continued-fraction-zaremba.mjs`; artifacts in
`logs/continued-fraction-artifacts/numerics.json`,
`logs/continued-fraction-artifacts/z2-deep.json`,
`logs/continued-fraction-artifacts/continued-fraction-summary.svg`,
`logs/continued-fraction-artifacts/z2-deep-summary.svg`, and
`logs/continued-fraction-artifacts/cfheight-shot.png`.

**NEW-OBJECT — `Z_A`, bounded continued-fraction denominator sets.**
`Z_A` is the set of denominators of finite regular continued fractions
`[0; a_1,...,a_k]` whose canonical final digit is greater than `1` and
whose partial quotients all satisfy `a_i <= A`. The app exposes
`cf2den(n)=1_{n in Z_2}`, `cf2num(n)`, the number of canonical
`{1,2}` numerators for denominator `n`, and `cfheight(n)`, the least tested
bound up to `5`. This is a continued-fraction/continuant object, with no
primality test and no `mu`/`Lambda`/prime-indexed sum.

Factor check: `Z_A` is generated by the continuant recurrence
`q_{j+1}=a_{j+1}q_j+q_{j-1}` over a finite alphabet. No multiplicative
Dirichlet series or Euler product is used, so it is not the L2-style
zero-free multiplier disguise.

Prime-pattern hook, updated with 2026 sources: Shkredov proves the
prime-denominator Zaremba case with an absolute constant, and Xin Zhang's
May 2026 preprint claims full Zaremba for every natural denominator. Thus
some absolute `A` with all primes in `Z_A` is now theorem-level, but no
longer prime-specific. Hensley's stronger prime-denominator pattern remains
the small-alphabet target: every sufficiently large prime should lie in
`Z_2`.

Numerics: in `[10000,20000]`, `674/1033` real primes lie in `Z_2`
(`0.652469`) versus weighted Cramer main `656.422020`; five Cramer seeds
average `0.626363`. Real primes have `2636` total `{1,2}` numerator
witnesses, or `2.551791` per label, versus weighted Cramer main
`2443.808236` and five-seed average `2.345399` per label. In
`[50000,100000]`, `2978/4459` real primes lie in `Z_2` (`0.667863`) versus
weighted Cramer main `2861.672229`; five Cramer seeds average `0.640623`.
Real primes have `10820` total `{1,2}` numerator witnesses, or `2.426553`
per label, versus weighted Cramer main `10133.857730` and five-seed
average `2.267832` per label. Every tested real prime in both ranges lies
in `Z_3`.

Deep `Z_2` witness scan: in `[100000,200000]`, real primes have
`cf2num` total `22438`, or `2.673737` per label, versus weighted Cramer
main `20200.015064` and five-seed average `2.410903` per label; the real
`Z_2` hit rate is `0.666587` versus five-seed Cramer average `0.636393`.
In `[500000,1000000]`, real primes have `cf2num` total `113540`, or
`3.071970` per label, versus weighted Cramer main `103756.386251` and
five-seed average `2.809391` per label; the real `Z_2` hit rate is
`0.743777` versus five-seed Cramer average `0.710600`.

STATUS: open/conjectural small-alphabet lead, not a goal close. The 2026
Zaremba results strengthen the different-world bridge, but the
large-alphabet theorem covers all denominators and therefore does not teach
prime-specific structure by itself. The observed prime enrichment in
`Z_2` membership and `cf2num` witness multiplicity is the live prime-pattern
target, still conjectural and not RH-equivalent. STUCK PACK emitted in the
log: the missing theorem is any nontrivial prime-specific lower bound for
`cf2num(p)` over the small alphabet `{1,2}`.

## 2026-06-12 · NEW-OBJECT / KNOWN-MATH — Farey reciprocal-product signatures

Source: `logs/2026-06-12-deeper-structure.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `src/PrimeVisuals.jsx`, and
`scripts/farey-products.mjs`; artifacts in
`logs/farey-product-artifacts/numerics.json`,
`logs/farey-product-artifacts/farey-product-summary.svg`,
`logs/farey-product-artifacts/farey-product-exhibit.html`, and
`logs/farey-product-artifacts/fareyord-shot.png`. Phase-4 packaging is
generated by `scripts/farey-phase4.mjs` with
`logs/farey-product-artifacts/farey-phase4-pack.md`,
`logs/farey-product-artifacts/farey_phase4_stub.lean`,
`logs/farey-product-artifacts/farey-completion-audit.md`, and test coverage
in `tests/farey-phase4.test.js`.

**NEW-OBJECT — `B_b(n)`, reciprocal Farey-product base surplus.** Let
`R_n` be the product of reciprocals of all positive Farey fractions
`h/k` of order `n`. For an integer base `b>=2`,
`B_b(n)=sum(ν_b(k)-ν_b(h))` over reduced `h/k`, where `ν_b(m)` is the
largest exponent `e` with `b^e | m`. This is defined by fractions, gcd,
divisibility, and products, with no primality test and no
`mu`/`Lambda`/prime-indexed sum. The app exposes `fareynew(n)`,
`fareydef(n)`, and `fareyord(n,a)`.

Factor check: the simple insertion row is `fareynew(n)=phi(n)`, with
Dirichlet series `zeta(s-1)/zeta(s)`, so it is a known totient/Farey
baseline rather than a new bridge. The product surplus `B_b(n)` is not a
multiplicative Dirichlet-series object in `n`; for prime `b=p`,
Lagarias-Mehta give p-adic Farey-product formulas, not a zero-free
multiplier twist of a catalog RH object. The global logarithmic Farey
product is catalog-adjacent through Mikolas/Franel-Landau and is not
counted as new by itself.

Prime-pattern hook: for every odd prime `p`, the Farey product forces the
exact sign pattern
`B_p(p)=p-1`, `B_p(n)<0` for `ceil(8p/3)<=n<=3p-1`, and
`B_p(3p-1)=-(p-1)/2`. Thus each prime creates a denominator surplus at its
own row, then a forced numerator surplus before row `3p`.

Numerics: in `[1000,2000]`, all `135/135` primes satisfy the exact shape
versus Li count `137.199589`, with endpoint debt `100394` versus
integrated main term `102293.752931`. Five Cramer seeds have exact-shape
rates `0.379032,0.384058,0.395683,0.389313,0.367188` (average
`0.383055`). In `[10000,20000]`, all `1033/1033` primes satisfy the exact
shape versus Li count `1042.476827`, with endpoint debt `7716881` versus
main `7787063.079816`; Cramer exact-shape rates average `0.311904`.

STATUS: GOAL-CLOSE / KNOWN-MATH / ONE-DIRECTIONAL. Under the v2 criteria's
explicit allowance for an honestly one-directional bridge, this closes the
goal: it moves a concrete sign/order statement through Farey product
geometry, and random Cramer labels fail the pattern unless they are actual
primes. The Lean stub parses under Lean 4 with only the expected `sorry`
warning. The stronger `CA ∩ XA` RH-equivalent branch remains open as a
separate research lead, not as a blocker for this completion certificate.

## 2026-06-12 · NEW-OBJECT / OPEN — `CA ∩ XA` transition closure

Source: `logs/2026-06-12-deeper-structure.md`; implementation in
`scripts/ca-xa-transitions.mjs` and `scripts/ca-xa-exhibit.mjs`; artifacts in
`logs/divisor-extremes-artifacts/ca-xa-transitions.json` and
`logs/divisor-extremes-artifacts/ca-xa-transitions.svg`, with a static
exhibit at `logs/divisor-extremes-artifacts/ca-xa-exhibit.html` and
screenshots `ca-xa-exhibit-desktop.png`, `ca-xa-exhibit-mobile.png`, and
`ca-xa-exhibit-timeline.png`.
The exhibit now includes a full timeline of all `356` frontier-changing
`CA ∩ XA` transitions.

**NEW-OBJECT — `H = CA ∩ XA`.** `CA` is the set of colossally abundant
numbers and `XA` is the record sequence for `sigma(n)/(n log log n)` after
`10080`. Both are divisor-world definitions with no primality test and no
`mu`/`Lambda`/prime-indexed sum.

Bridge: RH is equivalent to `XA` being infinite, and
Nazardonyavi-Yakubovich prove RH implies infinitely many `CA ∩ XA`
numbers. Conversely, infinite `CA ∩ XA` implies infinite `XA`, hence RH.
So `CA ∩ XA` is an RH-equivalent divisor-world endpoint sequence.

Prime-pattern hook: Lemma 21 says if a non-CA XA number lies between two
successive CA numbers `N<N'`, then `N'` is also XA. Through the CA
epsilon-parameter factorization, the largest prime factor of `N'` is
forced into the XA frontier sequence. This is a global closure rule, unlike
the fixed-prime `149` barrier.

Evidence over OEIS A004394 rows `s1..s8436`: the script parses explicit
integers through `s2000` and Noe compact notation afterward
(`p#`, `k!`, integer multipliers). The epsilon-interval CA classifier
matches all first-20 `c` marks in the paper. The scan finds `579` XA
records, `443` CA records, `384` `CA ∩ XA` records, and `194` non-CA XA
records after `10080`. Every one of the `194` non-CA XA records closes at
the next CA endpoint with zero failures.

Frontier-transition evidence: across `383` transitions between consecutive
`CA ∩ XA` records, `27` repeat the same largest-prime frontier and `356`
change frontier. Of those `356` frontier-changing transitions, `353` skip
no prime frontier, one transition `139 -> 151` skips `149`, and two
transitions skip five primes:
`1399 -> 1439` skips `1409,1423,1427,1429,1433`, while `2633 -> 2677`
skips `2647,2657,2659,2663,2671`. Normalized by the integrated prime
count over the transition interval, the nonzero skips are `0.414694`,
`0.907208`, and `0.895930`; total skipped frontiers are `11` over
transition Li total `374.536868`, giving aggregate skipped/Li
`0.029370`.

CA endpoint barrier instrumentation: between consecutive `CA ∩ XA`
records, the scan now records every skipped CA endpoint `C` and its
deficit `f(C)-f(A)` relative to the previous `CA ∩ XA` record `A`. Through
`s8436` there are `13` skipped CA endpoints in `5` transitions; the
largest run has `5` skipped endpoints, the closest deficit is
`-4.356191e-7`, and the deepest is `-0.000020705508`. The two five-prime
frontier skips correspond exactly to five skipped CA endpoint barriers
each; their eventual closing `CA ∩ XA` records exceed the old record by
only `4.018138e-9` and `4.561476e-7`, respectively.

Quotient-path refinement: through the `443` scanned CA endpoints, all
`442` consecutive CA endpoint quotients are single primes; there are zero
semiprime quotient steps and zero theorem-shape failures. The skipped
endpoint barriers are therefore short runs of prime-multiplier CA steps
whose `sigma(n)/(n log log n)` values stay below the previous `CA ∩ XA`
record until the terminal step. The two five-prime skips are exactly
`×1409, ×1423, ×1427, ×1429, ×1433`, then terminal `×1439`, and
`×2647, ×2657, ×2659, ×2663, ×2671`, then terminal `×2677`.

Prime-step margin refinement: for a consecutive CA step `C -> C*p` where
`p^a || C`, the exact log-height increment is
`log((1-p^-(a+2))/(1-p^-(a+1))) - log(log(log(Cp))/log(log C))`. In the
scanned region after the first `CA ∩ XA` record, `9/396` prime CA steps have
negative margin. These negative steps are concentrated in the observed
barrier runs; the closest terminal recovery is the `1399 -> 1439` transition,
whose cumulative log margin is only `+2.263186326e-9`.

Critical-threshold refinement: for each CA prime step, solve the real
equation "local divisor gain = `log log` penalty" for the critical prime
size. A step loses exactly when `p/critical > 1`. After the first
`CA ∩ XA` record, all `396` prime CA steps have such a threshold;
`9` are above-critical and `387` are below-critical. The maximum observed
above-critical ratio is `1.0050748313658797` at the `×1423` step inside the
`1399 -> 1439` barrier run.

Asymptotic threshold refinement: for a new-frontier CA step (`a=0`), the
critical equation is exactly `P log(1 + log(P)/log C) = log log C`. Its
first-order Lambert-W model is `P0 log P0 = log C log log C`, so
`P0 = A/W(A)` with `A=log C log log C`; adding the correction
`(log log C log P0)/(2(log P0+1))` gives a second-order threshold. In the
post-first-`CA ∩ XA` scan, new-frontier steps account for `367/396` CA
prime steps and `8/9` above-critical events. The first-order model has
`15` classification mismatches and max relative error `0.015545630615664496`;
the corrected model has zero classification mismatches and max relative
error `0.00006873694154307941`. In this range the exact threshold satisfies
`1.9966901960718957 <= Pcrit-log C <= 3.514886129757997`; the worst losing
frontier prime is `7.185022257330729` above `Pcrit`.

CA-boundary refinement: the adjacent CA intervals for a prime step
`C -> C*p` meet at the epsilon boundary `F(p,a+1)`. For new-frontier steps
this is `F(p,1)`. Since `F(x,1)` is decreasing, a new-frontier step loses
exactly when `F(p,1) < F(Pcrit(C,0),1)`. The artifact verifies zero
mismatches for this boundary classifier over `367` real new-frontier
steps and over all five fixed-shape controls, with zero interval-glue
error. The eight real losing new-frontier steps have `F(p,1)/F(Pcrit,1)`
between `0.9942588899666227` and `0.9998687215256001`.

Explicit-boundary refinement: replacing the exact root `Pcrit(C,0)` by the
second-order Lambert threshold `P2(C)` gives a root-free classifier
`F(p,1) < F(P2(C),1)`, equivalently `p>P2(C)`. It has zero mismatches on
the `367` real new-frontier steps and all five fixed-shape controls. In
the real scan, `p-P2(C)` ranges from `-43.743571309308436` to
`7.182854992119019`; the eight losing new-frontier steps are exactly the
eight cases with `p-P2(C)>0`. The local second-order Taylor expansion of
`log F(p,1)-log F(P2,1)` has zero sign mismatches and max log-error
`0.00006879296119996492`.

Prime-gap translation: in every scanned new-frontier CA step, the selected
prime `p` is the next base after the old CA frontier. Therefore
`p>P2(C)` is equivalent to there being no base in `(frontier(C),P2(C)]`.
Through `s8436`, the real scan has `8` such no-base events in `4` runs,
with maximum run length `3`; the integrated expected base count over those
empty intervals is `9.005470524093402`. The five fixed-shape Cramer controls
have no-base counts and max run lengths `195/264,143`,
`47/126,23`, `0/140,0`, `127/271,46`, and `0/222,0`. This shows the real
short-run behavior is not just a generic exponent-shape artifact.

Ordinary-gap audit: the Baker-Harman-Pintz `x^0.525` short-interval scale
fits inside the real `(frontier,P2]` interval only `10/367` times and in
zero of the `8` no-base cases, so it is too coarse for this target. Dusart's
2010 explicit interval has no applicable frontiers in the scanned range
because all frontiers are below `396738`. Recovery audit: all four real
no-base runs recover their cumulative log-height deficit, with at most
`3` extra CA steps after the no-base block; the two length-3 runs recover
on the terminal primes `1439` and `2677`.
Recovery-mode refinement: three of the four real recoveries use only
below-`P2` new-frontier steps, with total below-`P2` slack
`27.056672901040542` and total extra new-frontier log margin
`0.00015146697401645636`. The `523 -> 541` no-base run instead recovers
through the non-new-frontier multiplier `31`, contributing
`0.000009490367501261646` log margin. Fixed-shape controls show much weaker
recovery behavior: unrecovered run counts are `13,5,0,8,0`, and the worst
fake recovery path needs `108` total steps and `94` extra steps after the
no-base block.

Phase-4 pack: `logs/divisor-extremes-artifacts/ca-xa-phase4-pack.md`
packages the current branch for expert review. It states the exact
divisor-world object, factor check, dictionary, Lean-stub-ready definitions,
two conjectural axioms (`bounded_no_base_runs`,
`bounded_no_base_recovery`), and the conditional theorem that these imply
bounded skipped CA endpoints and skipped frontier primes. The final
teaching section is deliberately three nontechnical sentences; the pack
remains `OPEN / CONJECTURAL`.
Standalone formal shell:
`logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean`, generated by
`scripts/ca-xa-lean-stub.mjs`, parses under local Lean 4 with only the
expected `sorry` warning. It uses opaque divisor-world predicates for
`CA`, `XA`, no-base runs, recovery paths, and skipped-endpoint counts, and
keeps `bounded_CA_XA_skips_from_recovery` as the exact conditional theorem
target.
Focused STUCK PACK: `logs/divisor-extremes-artifacts/ca-xa-stuck-pack.md`,
generated by `scripts/ca-xa-stuck-pack.mjs`, is now emitted because the
same derivation gap persisted through HANDOFF 26, 27, and 28. The precise
expert question is whether CA epsilon spacing plus prime-gap input can
bound consecutive `p>P2(C)` no-base runs and their recovery; acceptable
answers include a proof, a weaker explicit skipped-frontier bound, or a
counterexample mechanism showing uniform boundedness is the wrong target.

Numerical windows: `(100,182]` has 17 primes versus Li integral
`16.638608`, with 12 `CA ∩ XA` frontier primes and `4/4` non-CA closure
successes. `(500,1000]` has 73 primes versus Li integral `75.815786`, with
73 frontier primes and `49/49` closure successes. `(1000,2000]` has 135
primes versus Li integral `137.199589`, with 130 frontier primes and
`87/87` closure successes. `(2000,2800]` has 104 primes versus Li integral
`102.862836`, with 89 frontier primes and `20/20` closure successes.

Cramer contrast over the same `s8436` exponent shapes: fixed-shape
fake-base seeds `12345,271828,314159,161803,424242` produced fake record
counts `4,388,1083,18,1117`, `CA∩fake` counts `2,112,182,9,266`, and
closure failures `0,0,344,0,1`. Their normalized frontier-skip aggregates
are `0.762531,0.155274,0.242260,0.532715,0.378592`, with max skipped
frontier counts `6,6,24,6,37`. The exact zero-failure closure is
theorem-backed in the real divisor world, not stable random-base behavior.

Threshold Cramer contrast: the same fixed-shape controls now carry the
post-first-`CA ∩ XA` critical-threshold statistic. Real CA steps have
`9/396` above-critical events with max `p/critical =
1.0050748313658797`. The five fake-base seeds have above-critical counts
`206/285,50/136,0/151,139/290,0/238` and max ratios
`1.0831777253411672,1.043469939375496,0.9842246691268529,
1.1004105084684441,0.995157393409754`. This strengthens the numerical
contrast, but it does not supply the missing global run-length theorem.
The corrected new-frontier asymptotic has zero classification mismatches in
all five fixed-shape controls, so future work can use the explicit
`log C`-baseline formula without rerunning the exact root solve at every
step.

STATUS: live lead, not a goal close. The global closure rule is real and
RH-equivalent. The prime-specific refinement is now a quantitative skip
problem: through frontier `2719`, almost all `CA ∩ XA` transitions are
prime-adjacent and the aggregate skipped/Li statistic is tiny, but a
global theorem bounding skipped frontier primes is still missing.
Primary-source audit: Alaoglu-Erdos prove the quotient of consecutive CA
numbers is prime or the product of two distinct primes, while explicitly
leaving the prime-quotient claim open; Nazardonyavi-Yakubovich provide the
`F(x,k)` CA parameterization, Proposition 20, Lemma 21, Theorem 23, and
the XA bound `p(n)<log n`, but no global theorem for skipped frontiers in
the `CA ∩ XA` subsequence. Focused test coverage now lives in
`tests/ca-xa-artifact.test.js`.

STUCK PACK emitted: the skipped-frontier problem reduces to a run-length
problem for CA endpoint barriers. If `A=C_0` and `B=C_t` are consecutive
`CA ∩ XA` records inside the consecutive CA endpoint chain
`C_0<C_1<...<C_t`, then each skipped endpoint `C_i` must satisfy
`f(C_i)<=f(A)` and have no non-CA XA record in `(C_{i-1},C_i)`, otherwise
Lemma 21 would force `C_i` into `CA ∩ XA`. Minimal expert question: can
one bound the length of such CA endpoint runs using the CA epsilon
parameterization, the observed prime-quotient path, and the
Robin/Nazardonyavi-Yakubovich convexity closure theorem? The refined
one-step version asks whether CA epsilon spacing plus prime-gap input can
bound consecutive excursions of prime CA steps above their moving critical
threshold `Pcrit(C,a)`.

## 2026-06-12 · NEW-OBJECT / OPEN — extremely abundant frontier primes

Source: `logs/2026-06-12-deeper-structure.md`; implementation in
`scripts/extremely-abundant-oeis.mjs` and `scripts/divisor-extremes.mjs`;
artifacts in `logs/divisor-extremes-artifacts/`. External bridge:
Robin's inequality, the Akbary-Friggstad superabundant reduction, and
Nazardonyavi-Yakubovich's theorem that RH is equivalent to infinitely many
extremely abundant numbers.

**NEW-OBJECT — `XA`, record values of `sigma(n)/(n log log n)` after
`10080`.** This is defined purely in the divisor-sum world, with no
primality test and no `mu`/`Lambda`/prime-indexed sum. Prime structure
enters through the theorem `XA subset SA` plus the Alaoglu-Erdos
prefix-prime exponent theorem for superabundant numbers.

Prime-pattern hook: the largest prime factor of an XA number is a
"frontier prime" of an RH-relevant divisor record. The first 600 published
superabundant numbers contain 22 XA records, with used frontier primes
`7,113,127,131,137,139,151,157,163,167,173,179,181,191,193`. Up to `193`,
the skipped frontier primes are
`2,3,5,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,149`.

Numerical windows: in `(100,140]`, there are 9 primes versus Li integral
`8.366702`, and XA uses 5 frontiers, skipping `101,103,107,109`. In
`(140,182]`, there are 8 primes versus Li integral `8.271906`, and XA uses
7 frontiers, skipping only `149`. The scan reproduces the published
landmarks `s356` as the second XA with frontier `113` and `s555` as the
twentieth XA with frontier `181`; `149` is not used.

Cramer contrast: a fixed-shape fake-base control with seeds
`12345,271828,314159,161803,424242` keeps the first 600 SA exponent shapes
but replaces prime bases by Cramer fake bases. When the fake sequence
reaches the `100..182` frontier region, it uses every fake base in the
two tested windows, unlike the real XA skip at `149`. This is suggestive
only; it is not an exact fake divisor-extreme model.

Barrier refinement: `scripts/xa-frontier-barrier.mjs` converts the skip
into a signed inequality. Let `B(p)` be the maximum `f(s)=sigma(s)/(s log
log s)` over scanned superabundant rows with largest prime factor `p`,
minus the previous XA record value. Then
`B(101)=-0.0042945395`, `B(103)=-0.0030683694`,
`B(107)=-0.0018250315`, `B(109)=-0.0002229008`,
`B(113)=+0.0013691014`, `B(149)=-0.0000207055`, and
`B(151)=+0.0003449182`. The best scanned `p=149` row is the CA endpoint
given by `epsilon=F(149,1)`, so the skip is now explained by a CA/XA
record-barrier calculation rather than only by table absence.

STATUS: best current lead, but not a goal close. It has a prime-free
object, a catalog RH equivalence, and real prime-frontier content; the
missing piece is a global skipped-frontier theorem: either prove the
finite `p=149` block is exhaustive, or prove the `F(p,1)` CA endpoint
criterion globally.

STUCK PACK emitted in `logs/2026-06-12-deeper-structure.md`: the literature
audit found no global theorem that makes the `p=149` finite barrier
global. Nazardonyavi-Yakubovich provide `p(n)<log n` for XA numbers,
an asymptotic exponent theorem, and computational monotonicity of the
largest prime factor up to `C1=s500000`, but not the needed theorem. The
minimal expert question is whether, for fixed prime `p`, the supremum of
`sigma(n)/(n log log n)` over SA/CA candidates with largest prime factor
`p` is attained at a CA endpoint determined by `F(p,k)`.

## 2026-06-12 · NEW-OBJECT / GRAVEYARD — Landau profile frontier holes

Source: `logs/2026-06-12-deeper-structure.md`; implementation in
`scripts/landau-profile.mjs`; artifacts in `logs/landau-profile-artifacts/`.
External bridge: Landau's `g(n)`, with the Massias-Nicolas-Robin RH
criterion for `log g(n)`.

**NEW-OBJECT — `P(n)`, the canonical cycle profile of an order-maximizing
permutation in `S_n`.** This is defined in the permutation world without a
primality test. The prime-power knapsack enters only through Landau's
classical theorem `g(n)=max_{ell(M)<=n} M`.

Tested statistic: after translating the optimal profile through the
Landau prime-power dictionary, count omitted bases below the largest
selected base, and measure the longest consecutive run of such holes.

Exact lemma found: if an optimal profile has slack `s` and omits a base
`p` below the selected frontier, then it cannot contain a selected cycle
length `q` with `p-s <= q < p`; otherwise replacing `q` by `p` fits and
strictly increases the order. The script found zero exchange-shield
violations in all real and Cramer runs.

Evidence: over `n in [500,1000]`, real primes had average `0.528942`
frontier holes and max run `3`; five Cramer seeds had average holes
`0.441118..0.650699` and max runs `3..4`. Over `n in [2500,5000]`, real
primes had average `1.065174` frontier holes and max run `4`; five Cramer
seeds had average holes `0.916034..1.116753` and max runs `4..7`.

VERDICT: useful MNR-side tooling, but not a goal-closing candidate. The
statistic is Cramer-similar and the exact shield lemma is mostly an
optimality certificate, so it does not yet move a concrete new statement
about real prime patterns.

## 2026-06-12 · NEW-OBJECT / KNOWN-MATH — rough witnesses inside prime gaps

Source: `logs/2026-06-12-deeper-structure.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `src/PrimeVisuals.jsx`, and
`scripts/rough-gaps.mjs`. External theorem: Gafni-Tao, "Rough numbers
between consecutive primes", `https://arxiv.org/abs/2508.06463`; Tao
expository post: `https://terrytao.wordpress.com/2025/08/10/rough-numbers-between-consecutive-primes/`.

**NEW-OBJECT — `R(a,h)=#{m:a<m<a+h and gcd(m,lcm(1..h-1))=1}`.** This is
an interval/divisibility object with no primality test, no `mu`/`Lambda`,
and no prime-indexed sum. The app exposes it as `roughcount(a,h)` and
`roughfirst(a,h)`.

KNOWN-MATH bridge: for a consecutive prime gap `(p_n,p_{n+1})`,
`R(p_n,p_{n+1}-p_n)>0` means the gap contains an interior integer whose
least divisor is at least the gap length. Gafni-Tao prove that the number
of gaps starting in `[X,2X]` failing this condition is `O(X/log^2 X)`, with
a Hardy-Littlewood conditional asymptotic `cX/log^2X` and expected
`c≈2.7..2.8`.

Factor check: for fixed `h`, the row-visibility atom factors as
`zeta(s) product_{p|lcm(1..h-1)}(1-p^{-s})`, so it is dead as an analytic
RH-reformulation. The content here is the one-directional prime-gap
geometry theorem, not an RH equivalence.

Evidence: over `[10^5,2·10^5]`, real primes had `1939` exceptional gaps
among `8392`, equal to `2.743172 * integral_X^(2X) dt/log^2t`. Over
`[10^6,2·10^6]`, real primes had `13590` exceptions among `70435`, equal
to `2.739383` on the same integrated scale. Five Cramer seeds had lower
normalized constants, about `1.99..2.14`, and more rough witnesses per fake
gap. Artifact: `logs/rough-gap-artifacts/numerics.json`; shot:
`logs/rough-gap-artifacts/roughcount-shot.png`.

CONNECTION: this improves on the rough-row baseline by replacing the
trial-division identity with a current sieve theorem about almost all prime
gaps. It still does not close the RH-reformulation goal, but it satisfies
the "dictionary moves information" standard better than any prior candidate
in this log: it constrains the internal geometry of prime gaps rather than
the size of a summatory residual.

## 2026-06-12 · NEW-OBJECT / KNOWN-MATH — rough-row visibility `rowvis/rowgap`

Source: `logs/2026-06-12-deeper-structure.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, and the lab tokens in
`src/PrimeVisuals.jsx`.

**NEW-OBJECT — `G_y(n)=1_{gcd(n,lcm(1..floor(y)))=1}`.** This is a
divisibility/lattice row-visibility object: no primality test, no
`mu`/`Lambda`, and no prime-indexed sum in the definition. The default lab
table uses `y=floor(sqrt(N))`, exposing `rowvis(n)`, `rowcount(n)`,
`rowgap(n)`, and `rowrun(n)`; `rowvis(n,a)` evaluates the literal
two-parameter predicate.

KNOWN-MATH bridge: for `y=floor(sqrt(N))`, `G_y(n)=1` for `y<n<=N` iff
`n` is prime. Thus visible-row gaps in `(sqrt(N),N]` are exactly prime
gaps in that window. This is the Legendre/Eratosthenes sieve recast as
lattice visibility, so it is a baseline bridge rather than a goal-closing
breakthrough.

Factor check:
`sum G_y(n)n^{-s}=zeta(s) product_{p|lcm(1..y)}(1-p^{-s})`. The finite
factor is zero-free and bounded in the half-plane where zeta-zero questions
matter, so the object **fails** as an analytic RH-reformulation by the
upgraded disguise check. It is kept only as a finite lattice dictionary for
prime spacings.

Evidence: exhaustive checks found zero bridge mismatches for `N=10^6`
and `N=10^7`. Counts above `sqrt(N)` were compared with the integrated
main term `integral dt/log t`: `78330` vs `78449.9395` at `10^6`, and
`664133` vs `664455.4787` at `10^7`. Max row/prime gaps were `114` at
`492113 -> 492227` and `154` at `4652353 -> 4652507`. Five Cramer seeds
matched the count scale but failed row visibility heavily: row-invisible
fake-prime rates were about `76%` at `10^6` and `80%` at `10^7`.

CONNECTION: this gives a useful different-world baseline and a concrete
failure mode after L2: even when the definition is prime-free, the
Dirichlet series can still collapse to zeta times an inert multiplier.
Future work should seek a nontrivial theorem about visible-row deserts
(Jacobsthal function of `lcm(1..y)`, covering systems, or extremal lattice
gaps) that translates into a prime-spacing law beyond trial division.

## 2026-06-12 · NEW-OBJECT — dyadic exponential Chebyshev transform `l2/L2`

Source: `logs/2026-06-12-novel-equivalent.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, and the `E2` chip in
`src/core/chips.js`.

**NEW-OBJECT — `l2(n)=Σ_{2^k|n} Λ(n/2^k)/k!`, with `L2(x)=Σ_{n≤x}l2(n)`.**
This is the dyadic exponential transform `E2` applied to Chebyshev's
`ψ(x)`: `L2(x)=Σ_{k≥0}ψ(x/2^k)/k!`. The transformed main term is exactly
`sqrt(e)x`, so the clean statement is
`sup_{x≥3}|L2(x)-sqrt(e)x|/(sqrt(x)(1+log x)^2)<∞`. The inverse
coefficients are `(-1)^k/k!`, hence this statement is equivalent, by
Dirichlet convolution and summatory switching, to the classical
`ψ(x)-x=O(sqrt(x)log^2x)` RH-equivalent.

First values:
`l2(1..8) = 0, log2, log3, 2log2, log5, log3, log7, (5/2)log2`;
`l2(9..16) = log3, log5, log11, (1/2)log3, log13, log7, 0, (8/3)log2`.

Disguise check: not `Λ`, since `l2(4)=2log2` while `Λ(4)=log2`, and
`l2(6)=log3` while `Λ(6)=0`; not `ψ`, since `L2` has main term
`sqrt(e)x` rather than `x`; not a Redheffer/Farey/Mertens catalog object.
Nearest catalog neighbors are the classical `ψ` residual and broad
Möbius-convolution/Riesz-type criteria, but this concrete dyadic
factorial multiplier `exp(2^{-s})` and residual statement were not found
in the checked catalogs.

Evidence: interval envelope fits for `|L2(x)-sqrt(e)x|` gave
`theta=0.515111` over `2e4..1e6` and `theta=0.512133` over `1e5..1e7`.
Through `1e7`, `max |R2|/sqrt(x)=0.828718` for `x≥10000`; Cramér
prime-power fakes through `4e6` reached `7.84`, `9.72`, and `10.37`.
Live raw-residual view:
`http://localhost:5174/#v=eyJtb2RlIjoibGFiIiwibGFiIjp7ImRvbWFpbiI6ImludCIsIk4iOjIwMDAwLCJ0TWF4Ijo2MCwic01heCI6MS42LCJleCI6Im4iLCJleSI6IkwyKG4pLXNxcnQoZSkqbiIsImVoIjoiKEwyKG4pLXNxcnQoZSkqbikvc3FydChuKSIsImV3IjoicyIsImEiOjAuNSwiYiI6Mi4zOTl9fQ`;
shot `logs/novel-equivalent-artifacts/l2-raw-residual-shot.png`;
numeric artifact `logs/novel-equivalent-artifacts/l2-numerics.json`.

CONNECTION: this is the 2026-06-12 `ψ(x)-x` entry seen through a new
invertible transform. It preserves the RH-sensitive square-root residual
while changing the main line from `x` to `sqrt(e)x`; the Cramér contrast
extends the earlier ψ real-vs-fake test to the transformed object.

## 2026-06-13 · Decoding the first anomaly-scan leaderboard

Source: in-app anomaly scan over primes ≤ 200,000 (find ≤ N, score on
(N, 2N]); peaks re-decoded with `contFrac` and re-evaluated at the exact
rational angles.

**KNOWN-MATH — every exponential-sum peak sits at a rational multiple of
2π.** All eleven `exp sum peak` rows decode, with error < 1e-5, to
α/2π ∈ {1/2, 1/3, 4/15, 2/19, 7/19, 9/38, 13/33, 1/46, 2/11, 19/66,
17/78}. These are Dirichlet structure: at α = 2πa/q the sum
Σ exp(iαp) sees primes sorted by residue mod q, and the missing
non-coprime classes prevent cancellation. The two giants are q = 2
("all primes are odd", z ≈ 287 at the exact angle) and q = 3 ("primes
avoid multiples of 3", z ≈ 143). Evidence:
`{"domain":"prime"}`-style check: `expSumZ(expSum(primes, 2π·a/q))` for
each fraction above, primes ≤ 200,000.

**OBSERVED → tool improvement — the scan grid lands *near* peaks, not on
them.** The grid point α = 2.09412 scored z ≈ 6.4, but the exact angle
2π/3 = 2.0944 scores z ≈ 142.8: exponential-sum peaks are far sharper
than the 1500-point grid. CONNECTION: the in-app continued-fraction
readout already computes the snap target; the scanner should refine each
peak to its nearest convergent before scoring. (`OPEN`: implement peak
refinement in `scanExpSums`; until then, leaderboard z-values for expsum
rows are large underestimates.)

**KNOWN-MATH — consecutive prime gaps anti-correlate.** The one
non-expsum leaderboard row: gap autocorrelation at lag 1, z ≈ −6.9,
surviving holdout (−6.85 → −6.7). A long gap tends to be followed by a
short one. This is the statistical fingerprint adjacent to the
Lemke Oliver–Soundararajan consecutive-primes bias (2016); under a pure
Cramér model the correlation would be ~0. CONNECTION: the Cramér TWIN
overlay should *not* reproduce this — a direct twin-vs-real autocorr
comparison is an easy confirming experiment.
Spec: `{"cfg":{"source":"gaps","plane":"graph","lens":"pulse","p":{"N":400000}}}` + `autocorr(gaps, 1)`.

**OBSERVED — matrix stripes and expsum peaks are the same fact through
two lenses.** Prime matrix at W = 210 = 2·3·5·7 shows solid
single-residue columns (screenshot evidence in session); the expsum peaks
at a/q are the Fourier shadow of exactly those forbidden and allowed columns.
CONNECTION: any new residue-flavored finding should be cross-checked in
both representations before being called new.

**OPEN — what survives below the Dirichlet layer?** Every leaderboard
entry so far is residue structure or gap anti-correlation. The next
search should subtract the residue layer (work within a fixed coprime
class, or score expsums against the Dirichlet-predicted peak heights
rather than against randomness) and ask what is left.

---

## 2026-06-12 · Straight-line hunt without zeta

Source: `logs/2026-06-12-straight-line-hunt.md`. Forbidden route respected:
no `zeta(...)` formulas and no `ZEROS` table in the direct computations.

**KNOWN-MATH — Chebyshev's ψ gives the cleanest prime straight line in this tool.**
Use the elementary von Mangoldt atom
`Λ(n)=isprime(rad(n))*log(rad(n))`, then
`ψ(x)=Σ_{n≤x}Λ(n)`. The graph `ψ(x)` against `x` is a near-perfect line,
and the residual `Fψ(x)=ψ(x)-x` is the prize. Direct audit through
`10^7` found, for every integer `10000≤x≤10000000`,
`|Fψ(x)|≤0.710161*sqrt(x)`; the record-max fit over
`N={10^5,2·10^5,4·10^5,10^6,2·10^6,4·10^6,10^7}` was
`|Fψ|≈0.717764*x^0.481757`. The classical RH-equivalent formulation is
`ψ(x)-x=O(x^(1/2+epsilon))` for every `epsilon>0`; the bounded
`sqrt(x)` behavior here is finite-range evidence, not a proof.
Evidence link:
`http://localhost:5173/#v=eyJtb2RlIjoicGF0Y2giLCJjZmciOnsic291cmNlIjoicHNpIiwicGxhbmUiOiJncmFwaCIsImxlbnMiOiJtb25vIiwicCI6eyJOIjoxMDAwMCwiSyI6MH19LCJjaGlwcyI6eyJ4IjpbXSwieSI6W119LCJyZXNpZHVhbCI6dHJ1ZSwidHdpbk1vZGUiOiJyZWFsIn0`
and screenshots `/tmp/primevisuals-psi-line.png`,
`/tmp/primevisuals-psi-residual.png`.
CONNECTION: unlike the residue-layer entries above, this is not a
Fourier/matrix residue-class effect. Cramer fake primes preserve the
main line but lose the tight residual, so the arithmetic content is in
the cancellation below density and residue structure.

**OBSERVED — Cramer fake primes fail the ψ residual sharpness test.**
Using `cramerPrimes(N, seed)` with seeds `12345`, `271828`, and `314159`,
the fake ψ line still satisfies `ψfake(x)≈x`, but shifted-window residuals
are much wider. Example: on `(400000,1000000]`, real primes had
`max |ψ-x|/sqrt(x)=0.636863`; the three fake seeds had `4.707338`,
`3.244401`, and `7.999347`. On `(2000000,4000000]`, real primes had
`0.675483`; fake seeds had `2.293267`, `3.513092`, and `4.330315`.
CONNECTION: this extends the existing Cramer comparison idea from gap
anti-correlation to a global summatory line. Density-matched randomness
does not reproduce the observed square-root-scale tightness.

**KNOWN-MATH — the Mertens walk is the strongest flat-zero companion.**
The line is `M(x)=0`, with `M(x)=Σ_{n≤x}μ(n)`. Direct audit through `10^7`
found, for every integer `10000≤x≤10000000`,
`|M(x)|≤0.462977*sqrt(x)`; the record-max fit was
`|M|≈0.420441*x^0.490168`. The classical RH-equivalent formulation is
`M(x)=O(x^(1/2+epsilon))` for every `epsilon>0`. Evidence link:
`http://localhost:5173/#v=eyJtb2RlIjoicGF0Y2giLCJjZmciOnsic291cmNlIjoibW9iaXVzIiwicGxhbmUiOiJ3YWxrIiwibGVucyI6Im1vbm8iLCJwIjp7Ik4iOjYwMDAwfX0sImNoaXBzIjp7IngiOltdLCJ5IjpbXX0sInJlc2lkdWFsIjp0cnVlLCJ0d2luTW9kZSI6InJlYWwifQ`
and screenshot `/tmp/primevisuals-mertens-normalized.png`.
CONNECTION: ψ and M are two elementary summatory views of the same
square-root-cancellation theme. M is cleaner numerically here, while ψ is
the cleaner "line of primes" and supports the Cramer fake-prime falsifier.

**OPEN — make the ψ residual first-class in the UI.** The lab can express
`Λ(n)=isprime(rad(n))*log(rad(n))`, but arbitrary cumulative sums of lab
formulas are not currently exposed as shareable lab specs. The patch
`psi` source can show `ψ(x)-x`, but its UI label/decor still references
the explicit-formula setting even at `K=0`, and the built-in Cramer TWIN
overlay only supports `primes` and `gaps`. A future tool improvement is a
formula+cumsum source or a `psi` twin source generated from
`cramerPrimes`. CONNECTION: this would let future "below the Dirichlet
layer" searches compare real and fake summatory laws visually, the same
way current residue and gap views compare real/fake structure.

---

## 2026-06-12 · Zero spectrum recovered from raw primes

Source: `logs/2026-06-12-zero-spectrum-hunt.md`,
`scripts/spectrum.mjs`. Computation path used raw prime powers from
`primePowersUpTo` and a Hann-windowed DFT of
`(ψ(e^u)-e^u)/e^(u/2)` on a uniform log grid; bundled `ZEROS` were used
only after the DFT for matching.

**KNOWN-MATH — the Riemann-zero frequencies are measurable in raw primes.**
Over `10^4≤x≤10^8` with 8192 log samples, the first 20 ranked spectral
peaks match zeros 1-20 one-for-one within the finite-window resolution
`Delta gamma = 0.682188`. Top-35 match counts: `matched=35`,
`missed=0`, `spurious=0`. The first 20 amplitude ratios versus the
explicit-formula scale `2/|rho|` lie between about `0.9675` and `1.0276`.
Evidence artifacts:
`logs/zero-spectrum-hunt-artifacts/phase-a.json`,
`logs/zero-spectrum-hunt-artifacts/phase-a.svg`, and
`logs/zero-spectrum-hunt-artifacts/phase-a.png`.
CONNECTION: this is the frequency-domain version of the existing
2026-06-12 `ψ(x)-x` entry. That entry measured square-root-scale
cancellation; this entry resolves the oscillatory modes causing that
cancellation.

**OBSERVED — cumulative Cramer fake-prime residuals have colored
continuous spectra.** The same `psi` pipeline on `cramerPrimes` does not
produce the ordered zeta ladder, but it is not literally flat amplitude
noise: cumulative random walks leave broad low-frequency and window-shaped
background. A 25-seed average at `10^7` had no all-seed-stable peaks and
zeta-range amplitudes far below the real-prime calibration, but frequency
clustering of local maxima alone is too permissive as a novelty test.
CONNECTION: this extends the previous Cramer comparison entry. Cramer is
still a falsifier for arithmetic structure, but for summatory spectra it
must be read as a colored-noise background, not as white noise.

**OBSERVED — twin-prime and `n^2+1` prime spectra showed no new discrete
line.** Twin-prime weighted counts through `10^8` fit
`c*x/log(x)` with `c≈1.404` at full range and a finite-range residual
normalization estimate `theta≈0.696`; the visible peaks are residue
aliases, inherited zeta peaks, low-frequency leakage, or Cramer-background
matches. Weighted primes of the form `n^2+1` through `10^8` produced 841
events, fit `c*sqrt(x)` with `c≈1.367`, and gave `theta≈0.266`. The most
interesting graveyard candidate was an unmatched `n^2+1` peak near
`gamma≈17.51`, stable under range and window shifts, but it fails the
breakthrough bar because nearby unexplained peaks also appear in the
Cramer `n^2+1` analog. CONNECTION: the dominant Phase C peaks connect
back to the 2026-06-13 residue catalog (`1/2`, `1/3`, `2/11`, `1/46`,
`2/19`, etc.) and to the matrix/expsum residue-layer entry. Below that
layer, this run found no reproducible non-Cramer discrete spectrum.

**OPEN — isolate sparse-family spectra from Cramer colored noise.** The
next run should use larger ranges or segmented sieving, more Cramer seeds,
and a predeclared background/coherence statistic for summatory random
walks before revisiting the `n^2+1` `gamma≈17.51` graveyard candidate.
CONNECTION: this is the same "what survives below the Dirichlet layer?"
question from the anomaly-scan entry, now translated from additive
residue frequencies to log-frequency spectra of sparse prime families.
