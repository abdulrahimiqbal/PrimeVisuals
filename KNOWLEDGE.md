# KNOWLEDGE — what this tool has established about the primes

The project's compounding memory. Agents: read this before starting any
goal; append after finishing one; never delete (corrections cite the entry
they correct). Classification: `KNOWN-MATH` (matches an established
theorem), `OBSERVED` (replicated here, unexplained in hand), `OPEN`
(question worth pursuing). See MACHINE_HOW_TO_USE.md for the rules.

---

## 2026-07-10 · RH-EQUIVALENT / NEW VIEW — Weil screw prime-knot decomposition

Source: `logs/weil-screw/PREREGISTRATION.md`, pilot artifacts, and
`logs/weil-screw/NOVELTY_AUDIT.md`; implementation `src/core/weilScrew.js`
and `scripts/weil-screw-knot-pilot.mjs`.

Object:
Suzuki's June-2026 continuous screw function expresses the Weil kernel through
archimedean terms and prime-power knots
`Lambda(n)/sqrt(n)(|t|-log n)_+`. On positive points every knot decomposes
exactly into `-2 min(t,u)` plus the increment kernel of the positive triangular
stationary covariance `(c-|t-u|)_+`.

Result:
matrix reconstruction errors stay below `2e-10` through `exp(a)=1000` on
uniform and Chebyshev grids of dimensions 12, 20, and 28. All sampled total
Weil kernels are nonnegative. Separate-eigenvalue domination fails strongly:
the simple lower bound falls to about `-62`, while the full generalized minimum
remains near `8e-4`. Finite positivity is produced by cross-eigenspace
alignment.

Disguise:
the second derivative of each knot produces cosine frequency
`cos(xi log n)`; summing prime-power weights recovers the prime side of Weil's
explicit formula. A global Fourier proof is therefore circular. The only
unclosed residue is a uniform principal-angle bound for localized compressed
operators, already adjacent to work of Yoshida, Bombieri,
Connes--Consani--Moscovici, and Suzuki.

STATUS: `EXACT NEW COORDINATE / NO RH CLAIM / LOCALIZED ANGLE PROBLEM OPEN`.

CONNECTION:
this is the first campaign object whose failure mode isolates a genuinely
operator-theoretic obstruction rather than a local-sieve or Möbius shadow. A
future survivor must control eigenspace alignment uniformly in support radius;
finite positivity or the knot identity alone is insufficient.

Follow-up alignment audit:
the deficit-normalized triangular frame has coverage above one on every
frozen 28-point cell and its exact Schur reserve is positive.  This does not
survive the disguise audit as a new invariant.  Once the archimedean/linear
block is negative on the whole sampled space, coverage above one is, by
congruence, exactly equivalent to positivity of the sampled Weil matrix.  At
smaller radii the Schur complement is likewise an exact reformulation.  No
independent reserve bound or valid extrapolation was obtained.

CORRECTION/STATUS:
`logs/weil-screw/ALIGNMENT_NOVELTY_AUDIT.md` supersedes the pilot verdict
"frame-coverage law survives."  The computation survives only as a calibrated
coordinate and anti-circularity test: `FINITE IDENTITY / NOT PROMOTED`.

CvS parity follow-up:
using the July-2026 cutoff-free closed forms, a proposed full alternation of
even and odd finite spectra was preregistered and falsified.  Bulk violations
occur with macroscopic margins, including at `c=3,N=7` and `c=13,N=6`.
However, the actually relevant ground inequality `E_0<O_0` survived all 88
zeta cells through `c=100,N=12`, with positive-cell ratios `O_0/E_0` from
about `84.6` upward.  Reversed and signed prime-weight controls can break the
ground ordering, so it is not forced by centrosymmetry alone.  A new unseen
holdout is frozen in
`logs/cvs-parity-interlacing/GROUND_PARITY_PREREGISTRATION.md`.

STATUS: `FULL INTERLACING FALSIFIED / GROUND-PARITY CONJECTURE LIVE / NO THEOREM`.

Ground-parity holdout result (2026-07-11):
all 105 unseen cutoff-free zeta cells at 90 digits, with cutoffs
`11,19,23,31,43,59,97` and `N=2,...,16`, satisfy `E_0<O_0`.  The smallest
positive-cell ratio is about `178.8`.  The new reversed/signed controls also
pass, while earlier controls at `c=17` and `c=100` failed, so arithmetic
specificity is mixed.  No comparison theorem or continuum gap bound is known.

DECISION: `FINITE CONJECTURE SURVIVES / PAUSE BRUTE FORCE`.  Additional matrix
ladders are low value; continue only with a symbolic parity comparison or a
proof-level obstruction.

## 2026-07-10 · RH-EQUIVALENT / CALIBRATED NEGATIVE — Nyman--Beurling Schur flow

Source: `logs/nyman-beurling/PREREGISTRATION.md`, pilot artifacts and
`logs/nyman-beurling/NOVELTY_AUDIT.md`; implementation
`src/core/nymanBeurling.js` and `scripts/nyman-schur-pilot.mjs`.

Object:
use Ehm's q=1 Gram formula for the Báez--Duarte integer-dilation form of the
Nyman--Beurling criterion, compute the optimal squared distance `d_N^2`, and
score the one-step Schur innovation `d_(N-1)^2-d_N^2` only after removing
index, Gram-pivot, and newest-coefficient magnitude effects. The limit
`d_N->0` is equivalent to RH; finite monotonicity is automatic and never
counts as evidence.

Result:
the prime class has a full-range residual innovation effect at permutation
`z=4.55`, but misses the frozen final-third gate at `z=3.01`. The containing
negative-Möbius class falls from `z=4.04` to `z=2.55`. Müntz direct cutoffs
2048/4096/8192 give log-gain correlations 1 at printed precision and maximum
distance change below `9.5e-13`.

Disguise:
optimal Nyman--Beurling Dirichlet polynomials are already governed by
Möbius/Levinson--Selberg coefficients. The observed feature is a finite
coefficient shadow and supplies no bound forcing the approximation distance to
zero. Ehm's decomposition locates the true unresolved work in Landau/Mertens
and inversion-error estimates.

STATUS: `CALIBRATED NEGATIVE / NO CONJECTURE / RH PROOF OBLIGATION SHARPENED`.

CONNECTION:
the exact Gram/Krylov machinery transfers successfully from the Maynard sieve
problem into an RH-equivalent Hilbert-space problem, but descriptive arithmetic
classification is again insufficient. The next candidate must control the full
quadratic error or factor it positively, not merely explain finite innovations.

## 2026-07-10 · THEOREM-ADJACENT / EXACT CALIBRATION — Maynard--Tao variational engine

Source: `logs/maynard-variational/PREREGISTRATION.md` and
`logs/maynard-variational/calibration.md`; implementation
`src/core/maynardVariational.js` and
`scripts/maynard-variational-audit.mjs`.

Object:
maximize `sum_m J_k^(m)(F)/I_k(F)` over polynomial functions on the simplex
`sum t_i<=1`. Complete monomial Gram matrices and Maynard's symmetric
`(1-P1)^b P2^c` matrices are evaluated by closed-form simplex integrals.
Candidate eigenvectors are numerical; promotion requires a rational witness
rechecked with `BigInt`-only arithmetic.

Calibration result:
Maynard's explicit `k=5` witness is reproduced exactly as
`1417255/708216 = 2.001162074847...`. The complete cubic optimizer proposes
`2.002887195760...`; a four-decimal rationalization remains exactly
`11148726395/5566329648 = 2.002886479963...`. The 42-dimensional symmetric
engine reproduces Maynard's numerical `M_105` lower bound as
`4.002069762947...`.

Krylov extension:
the exact moment generator reproduces the first Polymath8b formulas and a
10-dimensional generalized eigenproblem gives `M_5>=2.007140291425...`,
matching the later published table value `2.00714`. The stable
8-dimensional k=54 ladder reaches `3.699398868216...`; deeper double-precision
Hankel systems are too ill-conditioned to certify.

Correction:
the earlier council target `M_50>4` conflated two quantities. Polymath8b
proves standard `M_54>4.00238`; its k=50 value above 4 is the enlarged-support
`M_{50,1/25}>4.0043`. The present 42-term basis gives only
`3.699945714759...` at k=54. The Krylov basis is now implemented, but
high-precision depth and rational certification remain the next mandatory
calibration.

STATUS: `VALIDATED ENGINE / KNOWN RESULTS REPRODUCED / NO NEW THEOREM YET`.

CONNECTION:
unlike the two invariant pilots above, this route has a direct theorem gate:
an exact improvement to `M_k`, combined with a checked admissible tuple, can
change a bounded-gap consequence. Numerical eigenvalues alone never qualify.

## 2026-07-10 · NEW-OBJECT / CALIBRATION — sieve-conditioned interaction defect flow

Source: `logs/2026-07-10-local-global-defect.md`; preregistration
`logs/local-global-defect/PREREGISTRATION.md`; pilot and factor artifacts in
`logs/local-global-defect/`; implementation
`src/core/localGlobalDefect.js`, `scripts/local-global-defect-pilot.mjs`, and
`scripts/scid-factor-check.mjs`.

Object:
for a fixed three-shift constellation, restrict centers to those where every
shift avoids all local factors through a cutoff. On the resulting three-bit
prime/irreducible mask distribution `P`, define total correlation
`TC=sum_i H(P_i)-H(P)` and normalized defect
`SCID=TC/sum_i H(P_i)`. The local-information coordinate is
`tau=-log(eligible fraction)`.

Result:
the shallow-cutoff signal is strong but decays under deeper exact local
conditioning. At `N=1,000,000`, integer strict control z-scores fall from
`47.5..56.1` at `p<=5` to `-1.09..0.63` at `p<=29`. `F_3[t]` and `F_5[t]`
show the same qualitative collapse before their deep composite controls lose
support. `F_2[t]` degree 20 retains two shape-level excesses at local degree 3,
but fails three-shape replication and remains the same order as the truncated
tuple Euler-product prediction.

Disguise check:
the eight three-bit mask probabilities are recovered by inclusion–exclusion
from the seven nonempty subset moments. SCID is therefore a nonlinear summary
of fixed single/pair/triple prime-tuple counts, not a new arithmetic invariant.
The factor audit reconstructs its scale from Hardy–Littlewood and
prime-polynomial tuple Euler products. Named composites/reducibles are included
as strict controls; deeper `F_3[t]`/`F_5[t]` points fail rather than bypass that
gate when their reducible pools are too small.

STATUS: `CALIBRATION / KNOWN-CONJECTURAL TUPLE CONTENT / NO SURVIVOR`.

CONNECTION:
this supplies the common explanation for the centered-tensor and quotient
spectral cycles 003–007: any fixed-dimensional statistic of a fixed shift mask
factors through finitely many tuple moments. Future searches must use growing
exclusion sets, genuine sequence dynamics, or another object not recoverable
from fixed tuple counts.

## 2026-07-10 · NEW-OBJECT / CALIBRATED NEGATIVE — deep-admissible gap transition copula

Source: `logs/2026-07-10-local-global-defect.md`; preregistration and artifacts
in `logs/gap-transition-copula/`; implementation
`src/core/gapTransitionCopula.js` and
`scripts/gap-transition-copula-pilot.mjs`.

Object:
map each consecutive prime gap to its pointwise `B`-admissible mid-PIT value,
cross-fit an empirical rank coordinate, subtract a shrunk training mean for
the residue transition class `(p_i mod W,p_{i+1} mod W)`, and score lag-one
correlation of the holdout residual sequence.

Result:
the shallow `B=29,W=210` cell reaches adjusted correlation `-0.0254121` and
strict `|z|=4.86` at `N=2,000,000`, but the preregistered deeper cutoff breaks
the lead. At `B=97,W=210`, correlation is `-0.0081227`, inside the same-B fake
and B-rough-composite controls, with strict `|z|=0.63`. `B=97,W=30` similarly
has strict `|z|=1.07`. Support passes, and the sign is stable, but cutoff and
control survival fail.

STATUS: `CALIBRATED NEGATIVE / NO CONFIRMATORY RUN`.

CONNECTION:
this is the order-sensitive successor to the one-gap PIT and
transition-matched adjacent-gap entries. It shows that even after marginal
rank removal and residue-transition subtraction, the apparent lag-one signal
at cutoff 29 is leftover local admissibility: extending the exact pointwise
null through 97 absorbs it.


## 2026-06-16 · FRONTIER / LOCAL CHOWLA WEATHER — no survivor

Source: `logs/frontier/chowla-weather-report.md`; audit data
`logs/frontier/chowla-weather-laws.json`; feature matrix
`logs/frontier/chowla-weather-feature-matrix.csv`; visuals
`logs/frontier/chowla-weather-heatmap.svg` and
`logs/frontier/chowla-weather-phase.svg`; implementation
`src/core/frontier/chowlaWeather.js` and
`scripts/frontier-chowla-weather.mjs`.

Object:
`lambda(n)=(-1)^Omega(n)`,
`B(h,x,L)=sum_{n=x}^{x+L-1} lambda(n)lambda(n+h)`, and
`Z(h,x,L)=B(h,x,L)/sqrt(L)`, scanned locally over
`N=300,000`, `H=512`, windows `256..8192`, stride `512`, with a
dyadic rerun at `N/2=150,000`.

Run result:
no feature-family law survived the preregistered gates. The top-ranked
law was `omega(h)=1 and h mod 8=3`, but it had train real-vs-null
`z=0.416506`, far below the required `4`, and was not separated from
h-size or one-modulus controls. The strongest one-modulus control had
`z=0.855507`; h-size control had `z=0.289745`; parity control had `z=0`.
No individual `h` column is promoted.

Disguise check:
the run does not use zeta, zeros, explicit formula terms, RH-equivalent
criteria, Robin, Nicolas, or Lagarias criteria. Candidate promotion is
limited to feature laws of complexity at most two unless overwhelming,
with train/holdout split by `h<=H/2`, dyadic persistence, and controls
for h-size, parity, and one-modulus explanations. The local heatmap is
retained as a diagnostic artifact only, not as evidence.

STATUS: `NO SURVIVOR / LOCAL WEATHER ALSO NULL`.

CONNECTION:
this directly strengthens the earlier terminal `C_h(N)` negative result.
The previous run rejected isolated h outliers; this run keeps local
position and window scale but still finds no rigid residual locus after
feature-law, null, holdout, and dyadic gates. Future Chowla searches
should change the statistic or null geometry, not merely rescan terminal
or local h columns.

## 2026-06-16 · FRONTIER / CHOWLA RESIDUAL ATLAS — no survivor

Source: `logs/frontier/chowla-report.md`; audit data
`logs/frontier/chowla-atlas.json`; heatmap
`logs/frontier/chowla-heatmap.svg`; implementation
`src/core/frontier/chowla.js` and `scripts/frontier-chowla.mjs`.

Object:
`S(h,N)=sum_{1<=n<=N-h} lambda(n)lambda(n+h)`, with
`lambda(n)=(-1)^Omega(n)` and residual
`(Z_real-mean_random_multiplicative)/sd_random_multiplicative`, where
`Z=S/sqrt(N)`.

Run result:
at `N0=20,000`, `levels=4`, `H=256`, and `20` seeds per null, no locus
survived the random-multiplicative null, shuffled-Liouville null, dyadic
persistence, holdout, feature-support, and known-disguise gates. The top
ranked columns were isolated single shifts `h=101` and `h=92`; both had
dyadic persistence but failed the single-shift multiple-testing /
low-complexity gate. At `N=160,000`, real field energy was `0.9494`
against random multiplicative `0.9898±0.0536` and shuffled
`0.9954±0.0600`.

Feature audit:
final feature dependence was weak: `omega(h)` R2 `0.0155`,
`Omega(h)` R2 `0.0405`, squarefree R2 `0.0042`, `v2(h)` R2 `0.0336`,
parity R2 `0.0033`, radical bucket R2 `0.0351`, and oddpart bucket R2
`0.0542`. No candidate conjecture is promoted.

Disguise check:
the statistic is fixed-shift Chowla parity, not prime-counting, explicit
formula residuals, cumulative gaps, or an endpoint telescope. Parity-only
and `v2`-only explanations are disqualified as known low-complexity
artifacts; isolated high-h columns are treated as sampling artifacts
unless they clear a stronger multiple-testing/description gate.

STATUS: `NO SURVIVOR / CALIBRATED NEGATIVE`.

CONNECTION:
this is the dependency-free, reusable successor to the earlier
Liouville residual calibration entry. It narrows the future search target:
single-shift outliers are not enough; the next credible lead needs a
pre-registered factorization-family law or a held-out expansion in `H`
and `N`.

## 2026-06-16 · NEW-OBJECT / CALIBRATION — Liouville residual atlas

Source: `logs/2026-06-16-frontierlab-liouville-atlas.md`; audit script
`scripts/frontierlab-liouville-atlas.mjs`; artifacts in
`logs/frontierlab-artifacts/`.

New object:
`lambda(n)=(-1)^Omega(n)` and its polynomial analogue
`lambda(f)=(-1)^Omega(f)` over `F_q[t]` are now first-class lab objects.
Integer formulas can call `lambda(n)` or `liouville(n)`. The function-field
kernel exposes `polynomialLiouville`, `liouvilleTwoPoint`, and random
completely multiplicative polynomial controls.

First integer values for `n=1..16`:
`1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,-1,1,1,1`.

Motivation:
search the fixed-shift Chowla residual field
`C_h(N)=sum_{n<=N} lambda(n)lambda(n+h)` for a rigid shift-space locus
after null comparison and two-universe calibration.

Run result:
at `N=2,000,000`, `h<=32`, `F_2[t]` degree `20`, and `F_3[t]` degree
`13`, the integer Liouville field is not promoted. Integer final energy is
`0.702596`, while the combined integer null energy range is
`0.762999..1.460655`; the real-vs-null z-score is `-1.599384`,
persistence is `0.663134`, and cross-world coherence is `0.000896`.

Function-field calibration:
`F_2[t]` degree `20` has energy `2.175326` against random multiplicative
control range `1.459062..1.685726`; `F_3[t]` degree `13` has energy
`2.016338` against range `0.847596..1.252154`. These are structured
finite-degree polynomial effects, not coherent integer residual laws:
integer-minus-`F_2[t]` cosine is `0.107869`, and integer-minus-`F_3[t]`
cosine is `-0.106076`.

Disguise check:
this is not prime-counting, `psi(x)-x`, Mertens, a cumulative-gap
telescope, a residue-class Fourier shadow, or dyadic smoothing. It is the
standard Liouville/Chowla parity object on all positive integers, so
composite control as a primality signature is not applicable. No
RH-equivalence or theorem is claimed; positive future findings must be
reported as Chowla-adjacent conjectural evidence unless proved separately.

STATUS: `CALIBRATION / NOT-PROMOTED`.

CONNECTION:
this implements the COUNCIL two-universes recommendation on the
Chowla/multiplicative-randomness target. It is also a corrective to the
gap-line graveyard entries above: the measurement starts from a centered,
non-telescoping residual with matched random multiplicative and
function-field controls before any line or phase boundary is scored.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — deep-admissible PIT gap null

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/deep-admissible-gap-pit-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the finite-wheel PIT gap bias by replacing the `W=2310` mask with
a deeper pointwise admissibility null. For cutoff `B`, use
`h_B(n)=A_B(n)*rho_B/log(n)`, where `A_B(n)=1` if `n` has no prime
factor `<=B` and `rho_B=prod_{ell<=B} ell/(ell-1)`. Main cutoff:
`B=97`, starting after `p>100,000`.

Result: the deeper null absorbs the finite-wheel bias into ordinary
noise. At `N=4,000,000`, `rho_97=8.311357`, scored prime gaps are
`273,553`, mean PIT value is `0.001270`, endpoint `Z=0.664286`, and max
`|Z|=1.074534`. The last block `(3,000,000,4,000,000]` is essentially
flat with `Z=-0.020988`.

Controls show no survivor. Same-cutoff fake labels give endpoint
`Z=-0.380874..0.355473`; bootstraps cover the real scale
(`Z=0.563303..1.059042`, max `0.636218..1.071555`); sign flips and
centered shuffles are comparable. The cutoff family identifies the Cycle
87 missing main term: endpoint `Z` shrinks from `B=2` `11.494224` to
`B=5` `4.330365`, `B=11` `2.262118`, `B=29` `0.908350`, and `B=97`
`0.664286`.

STATUS: `GRAVEYARD / DEEP-ADMISSIBLE PIT NULL ABSORPTION`.

CONNECTION: direct sequel to the finite-wheel PIT gap martingale. Cycle
87 showed the `W=2310` PIT line was not order-level but also not matched
by same-wheel fakes; Cycle 88 explains most of that mismatch as missing
small-prime admissibility beyond `11`. One-gap PITs are now calibrated
enough to stop producing big lines; next attempts should be genuinely
multi-offset/order-dependent or use a two-universe matched statistic.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — finite-wheel PIT gap martingale

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/wheel-pit-gap-martingale-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
replace empirical Palm centering with an instantaneous discrete
next-event null. For wheel `W`, use
`h_W(n)=W/(phi(W)log n)` on `gcd(n,W)=1` classes and score each observed
consecutive prime gap by its mid-PIT value under the local survival
distribution. Main wheel: `W=2310`.

Result: the `W=2310` PIT path is a real finite-wheel mismatch but not an
ordered critical line. At `N=4,000,000`, after `p>2310` there are
`282,802` scored prime gaps, mean PIT value `0.004427`, endpoint
`Z=2.354165`, and max `|Z|=2.359392`. Same-wheel fake labels generated
from the local model have endpoint `Z=-0.542396..0.514884`, so finite
wheel-Poisson independence underfits the prime one-point gap law.

Controls break the order claim. Shuffling the real PIT values preserves
the endpoint (`Z=2.354165`), bootstraps give `1.896709..2.816568`, while
sign flips and centered shuffles collapse to ordinary size. The wheel
family shows the bias shrinking as more local sieve structure is added:
`W=2` gives `Z=11.851953`, `W=30` gives `4.488158`, `W=210` gives
`3.008644`, and `W=2310` gives `2.354165`.

STATUS: `GRAVEYARD / FINITE-WHEEL PIT DISTRIBUTION BIAS`.

CONNECTION: direct refinement of the Palm gap sequence. Cycles 84-86 used
raw nonlinear gaps, train/test gap means, and rolling gap means; all made
large lines from distribution or time-locality artifacts. The discrete
PIT null removes the rolling-lag artifact and leaves a smaller
finite-wheel one-point mismatch. It is closer to the arithmetic-residual
template because Cramer-style fake labels do not absorb it, but it still
fails because order is irrelevant once the real PIT values are fixed.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — rolling Palm local window-lag residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/palm-rolling-local-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the cross-fitted Palm gap-law failure by using a past-only rolling
null. For each consecutive event gap, compute
`U_i=exp(-int_{x_i}^{x_{i+1}}dt/log(t))-1/2`; score it against the
previous `K=8192` event gaps, using the current gap-width bucket when it
has at least `12` previous samples and the whole rolling window otherwise.

Result: the rolling null creates an even sharper line, but it is a
one-sided window-lag artifact. At `N=4,000,000`, real primes have
`274,952` scored records, `272,699` gap-scoped scores, `2,253`
fallback scores, residual mean `1.669563`, endpoint `Z=875.449663`, and
max `|Z|=875.449663`.

Controls break the prime claim. Cramer labels processed through the same
rolling protocol give `Z=872.212597..875.116810`, W210 gives
`873.758523..875.790681`, and W2310 gives `873.746996..876.232549`.
Sign flips collapse to `max |Z|=2.109084..6.327356`, and globally
centered shuffles have `max |Z|=0.444789..1.354605`. Window sizes
`4096`, `8192`, and `16384` keep the same huge positive residual.

STATUS: `GRAVEYARD / ROLLING PALM WINDOW-LAG ARTIFACT`.

CONNECTION: direct repair of the train/test Palm nonstationarity break.
For fixed gap `g`, `U≈exp(-g/log x)-1/2` rises with `x`; a past-only
empirical bucket center lags the current smooth value, and small
within-gap variance amplifies the lag. The next Palm attempt needs an
instantaneous smooth null in `(gap, log x)` or a local regression that
includes the density coordinate, not just a rolling order window.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — cross-fitted Palm gap-law residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/palm-gaplaw-centered-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the Palm log-hazard gap line by removing the one-point gap law.
For consecutive prime gaps, use `U_i=exp(-Lambda_i)-1/2`, fit
first-half gap-width means and variances `m_g,s_g`, then score only the
second half by `(U_i-m_gap_i)/s_gap_i`.

Result: the repair becomes a train/test nonstationarity line. At
`N=4,000,000`, the first-half training set has `148,932` records, the
second-half test set has `134,212`, usable gap means are `43/60`, and
fallback test records are `86`. The standardized test residual has mean
`1.218976`, endpoint `Z=446.571203`, and max `|Z|=446.571203`.

Controls show the line is not order-level prime regularity. Residual
shuffles and bootstraps reproduce the endpoint
(`445.924316..447.269834`), and Cramer/W210/W2310 labels processed with
the same train/test protocol have the same scale (`441..450`). Sign flips
collapse to ordinary size (`max |Z|=1.561404..4.253409`). Named
composites `25`, `35`, `77`, and `289` fail the consecutive-prime event
input.

STATUS: `GRAVEYARD / TRAIN-TEST PALM GAP NONSTATIONARITY`.

CONNECTION: direct repair of the nonlinear Palm gap-distribution break.
Cycle 84 showed the raw nonlinear Palm score is a one-point gap-law line;
Cycle 85 shows first-half gap-width centering is still not local enough,
because `U_i` drifts with `log(p)` even at fixed gap width. Future Palm
gap work needs a time-local null such as gap-width plus log-time buckets,
a rolling fit, or an explicit smooth main term in `g/log(p)`.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — nonlinear Palm log-hazard gap line

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/palm-loghazard-gap-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for consecutive prime gaps `p_i<p_{i+1}`, use Palm/log-density time
`Lambda_i=int_{p_i}^{p_{i+1}}dt/log(t)` and score the nonlinear transform
`U_i=exp(-Lambda_i)-1/2`. The raw hazard `Lambda_i-1` was explicitly
forbidden as evidence because its cumulative sum telescopes to a
`Li-pi` prime-counting bridge.

Result: the nonlinear score makes a dramatic line, but it is a one-point
gap-distribution bias. At `N=4,000,000`, real primes have `283,144`
pairs, mean `Lambda=1.000721`, mean `exp(-Lambda)=0.462557`, endpoint
`Z=-69.018095`, max `|Z|=69.019356`, and theta max sum `0.915628`.
The raw hazard telescope stayed small: endpoint `Z=1.329263`.

Empirical gap-value controls absorb the line. Shuffling the observed
`U_i` values gives the same endpoint `Z=-69.018095` and max
`|Z|=69.018095..69.044949`; bootstraps give
`67.299401..70.420507`. Pure Poisson hazard controls are near zero
(`max |Z|=1.601772..3.554601`), Cramer labels underfit
(`46.504109..49.805943`), and W2310 random labels reproduce most of the
drift (`61.767583..64.434052`). Named composites `25`, `35`, `77`, and
`289` fail the consecutive-prime event input.

STATUS: `GRAVEYARD / PALM-GAP DISTRIBUTION BIAS`.

CONNECTION: direct nonlinear repair of the log-mass prime-count bridge.
The raw hazard is still the old `Li-pi` funnel; the nonlinear transform
escapes that telescope but falls into the prime-gap distribution / local
wheel funnel. Future Palm gap work must center by a local or empirical
gap-distribution null before testing ordered residual cancellation.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — complete Weierstrass family second moment

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/complete-weierstrass-family-second-moment-audit.mjs`; artifacts
in `logs/playground-artifacts/`.

Preregistered candidate:
raise the elliptic family dimension from one parameter to the complete
two-parameter Weierstrass family
`E_{a,b}: y^2=x^3+a*x+b` over `F_p`, discard singular
`4a^3+27b^2=0`, and score
`U2(p)=sum_good a_p(E_{a,b})^2/(p*good_count)-1`.

Result: adding the second parameter kills the residual by exact
orthogonality. For all parameters,
`sum_(a,b) a_p(E_{a,b})^2=p^2*(p-1)`. Singular curves are
`a=-3r^2`, `b=2r^3`; their trace-square sum is `p-1`. Therefore
`M2_good(p)=(p-1)*(p^2-1)` and
`U2(p)=-1/p^2`. Brute force for every prime `5<=p<=97` matched the
formula.

At `N=50,000`, there are `5,131` scored prime fields. The
Sato-Tate-centered endpoint is `Z=-0.001272279`, cumulative main
`-0.091134609`, and exact residual `Z=0`. Named composites `25`, `35`,
`77`, and `289` fail the prime-field input.

STATUS: `GRAVEYARD / COMPLETE-FAMILY ORTHOGONALITY IDENTITY`.

CONNECTION: direct sequel to the complete one-parameter second-moment
break. One parameter left a low-dimensional CM trace component; two
parameters impose full character orthogonality. Complete elliptic
parameter universes are calibration machines unless the statistic is
designed to survive diagonal orthogonality and singular bookkeeping.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — complete elliptic family second moment

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/complete-elliptic-family-second-moment-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
complete the family `E_a: y^2=x^3+a*x+1` over `F_p`, discard singular
`4a^3+27=0`, and score the Sato-Tate-normalized second moment
`U2(p)=sum_good_a a_p(E_a)^2/(p*good_count)-1`.

Result: the candidate collapses to an exact trace-pair identity. For all
parameters,
`sum_a a_p(E_a)^2 = p^2 + p*(C_p-R_p)`, where
`R_p=#{x in F_p*:2*x^3=1}` and
`C_p=sum_u chi(u*(1-4*u^3))=-a_p(y^2=x^3-4)-chi(-1)`.
After subtracting singular trace squares, brute force for every prime
`5<=p<=97` matched the formula.

At `N=50,000`, there are `5,131` scored primes. The Sato-Tate-centered
path has endpoint `Z=0.024529`, max abs `Z=0.554795`, and
energy-normalized `r=1.216074`; the exact residual endpoint is `Z=0`.
The nonzero term is the Hasse trace sequence of the fixed CM curve
`y^2=x^3-4`, not a new prime critical line. Named composites `25`, `35`,
`77`, and `289` fail the prime-field input.

STATUS: `GRAVEYARD / CM TRACE-PAIR IDENTITY`.

CONNECTION: continuation of the elliptic-family sequence. The incomplete
family made a false mean line, the complete first moment became the exact
identity `sum_a a_p=-p`, and the complete second moment became a fixed CM
elliptic trace. Complete-family moments should be classified by their
moment-expansion varieties before any residual is scored.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — complete elliptic family trace main line

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/complete-elliptic-family-trace-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the incomplete elliptic family bias by taking all parameters
`a in F_p` for `E_a: y^2=x^3+a*x+1`, discarding singular
`4a^3+27=0`, and scoring the complete-family trace
`S(p)=sum_good_a a_p(E_a)` after subtracting the derived main term.

Result: the complete-family first moment is an exact character-sum
identity, not a prime critical line. For all parameters,
`sum_{a in F_p} a_p(E_a)=-p`: in
`a_p(E_a)=-sum_x chi(x^3+a*x+1)`, the `x=0` term contributes `p`, and
for each `x!=0`, the map `a -> x^3+a*x+1` is a bijection of `F_p`, so its
character sum is zero. Singular parameters only add an explicit small
correction. Brute-force validation for every prime `5<=p<=97` matched the
formula.

At `N=50,000`, the raw complete-family line has `5,131` primes and
`raw Z=-71.642604`, but the exact-main `Z` is also `-71.642604`; residual
`Z=0` and max residual/sqrt `0` at every endpoint. Named composites
`25`, `35`, `77`, and `289` fail the prime-field input.

STATUS: `GRAVEYARD / EXACT COMPLETE-FAMILY CHARACTER-SUM IDENTITY`.

CONNECTION: direct continuation of the incomplete elliptic-family break.
Completing the finite-field parameter universe removes the finite-window
bias by turning the first moment into an exact identity. This is the
elliptic-family analogue of local-shell collapses: the natural main term
is so exact that no residual remains.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — elliptic family mean-trace bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/elliptic-family-mean-trace-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
move from a fixed elliptic curve to a small family. For
`E_a: y^2=x^3+a*x+1`, integer `1<=a<=A`, define
`V_A(p)=sum_a a_p(E_a)/(sqrt(p)*sqrt(good_a_count))` over good reductions
and score `Z_A(N)=sum_{p<=N}V_A(p)/sqrt(good prime count)`.

Result: the dramatic line is a finite-family main-term failure. At
`N=5,000` and `A=256`, there are `667` scored primes, empirical value mean
`-0.536857`, endpoint `Z=-13.865048`, and max `|Z|=15.231524`.
Distribution-aware controls reproduce the line: observed-value shuffles
have max `|Z|=13.865048..14.266289`, bootstraps
`11.433563..15.387563`, and Cramer-index resampling
`11.638374..16.209495`. Zero-mean normal controls fail only because they
omit the incomplete-family bias. The empirical-centered diagnostic forces
endpoint zero but still has max `|Z|=12.371090` and a final holdout block
`Z=4.917361`. The family-size check `A=128` changes scale: endpoint
`Z=-9.367562`, max `|Z|=10.989824`.

Named composites `25`, `35`, `77`, and `289` fail the prime-field input:
the family trace over `F_n` is not defined for composite modulus `n`.
This is not a Chebyshev, Mertens, or gap-telescope identity; it breaks by
using the wrong family main term.

STATUS: `GRAVEYARD / INCOMPLETE ELLIPTIC-FAMILY CHARACTER-SUM BIAS`.

CONNECTION: family analogue of the Thue-Morse and square-phase breaks.
Assuming zero mean before installing the correct finite-window null
manufactures a line. Future elliptic attempts need exact complete-family
moment formulas or conductor-sorted family main terms before scoring any
critical-line residual.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — elliptic Hasse-trace moment line

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/elliptic-hasse-trace-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
leave local integer shells by importing a non-CM elliptic curve
`E: y^2=x^3-x+1`. For good primes, compute exact point counts
`a_p=p+1-#E(F_p)` and score the second Sato-Tate moment residual
`U2(p)=a_p^2/p-1` by `Z2(N)=sum_{p<=N} U2(p)/sqrt(good prime count)`.

Result: this is generic trace-distribution noise, not a prime critical
line. At `N=80,000`, there are `7,835` good primes, mean
`a_p/(2sqrt(p))=-0.002175`, mean `U2=-0.003971`, endpoint
`Z2=-0.351458`, and max `|Z2|=2.000000`. Controls reproduce the
excursion: trace shuffles have max `|Z2|=1.578314..2.881151`,
observed-trace bootstrap `1.502925..3.787077`, Sato-Tate samples
`1.771226..3.265835`, and Cramer-index resampling
`1.725203..2.692539`. The fresh holdout `(40,000,80,000]` has real
`Z2=-0.901266`, inside every control family.

Named composites `25`, `35`, `77`, and `289` fail the prime-field input:
`#E(F_n)` and Hasse trace `a_n` are not defined for composite modulus
`n`. This object does not telescope to `theta`, `psi`, or `M`; the break is
that a fixed-curve moment measures Sato-Tate equidistribution rather than
prime regularity.

STATUS: `GRAVEYARD / SATO-TATE TRACE-DISTRIBUTION NOISE`.

CONNECTION: external-arithmetic analogue of the Thue-Morse break. A real
theorem-level distribution exists, but the candidate only measured generic
bounded-moment random walk after the correct distributional null was
installed. Future elliptic attempts need curve-family/prime-parameter
interaction, closer to murmurations, not fixed-curve moments.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — square-phase prime drift

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/square-phase-prime-drift-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
use square-root geometry without zeta or zeros. For
`k=floor(sqrt(n))`, define the square-annulus phase
`phi(n)=2*(n-k^2)/(2k+1)-1`. Score
`Z_W(N)=sum_{p<=N}(phi(p)-E_W(phi|same square annulus))/sqrt(sum Var_W)`,
where `E_W` and `Var_W` are exact over `W=2310` candidates in the same
square annulus.

Result: after exact local-shell centering, the real trace is an ordinary
small random walk. At `N=16,000,000`, real primes give `1,031,124` scored
labels, raw centered sum `675.017602`, sqrt variance `586.256518`,
endpoint `Z=1.151403`, and max `|Z|=1.428432`. Exact-shell controls
reproduce the flatness: 15 W-random controls have max `|Z|`
`1.235646..2.403408`, and 15 W-composite controls have max `|Z|`
`1.289472..2.667986`. The fresh holdout `(8M,16M]` has real
`Z=1.095728`, inside Cramer `-1.019844..1.333675`, W-random
`-1.068868..1.551592`, and W-composite `-1.329624..1.232813`.

Named composites do not create a prime-only predicate: `25`, `35`, and
`77` are not W-eligible, while `289` is W-eligible with one-step centered
score `-1.573133` but is not prime. The function-field analogue was
rejected as non-coordinate-free: inside fixed degree every monic
polynomial has the same norm, and ordering lower coefficients would
reintroduce the coefficient-ordering artifact.

STATUS: `GRAVEYARD / SQUARE-ANNULUS LOCAL-SHELL RANDOM WALK`.

CONNECTION: square-root geometry joins the primorial recovery-debt,
rough-shell residue-current, and Thue-Morse breaks. The exact local shell,
not Cramer, is the real adversary; even an intrinsic-looking coordinate
must survive shell centering before it can claim prime regularity.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — Thue-Morse prime balance

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/thue-morse-prime-balance-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
use automatic-sequence cancellation as a non-zeta route. Define
`T_b(x)=sum_{p<=x}(-1)^(sum of base-b digits of p)` and score
`max_{y<=x}|T_b(y)|/sqrt(pi(x))`, with base `2` as the Thue-Morse
primary and bases `3`/`10` as holdouts. The function-field analogue used
coefficient digit parity over irreducibles in `F_q[t]`.

Result: the statistic is a local-shell digit artifact, not a prime
critical line. At `N=16,000,000`, the real base-2 prime endpoint has
maxAbs/sqrt `33.836373`, while 15 Cramer controls give
`29.884983..32.853785`, sampled W210 composites give
`30.668306..33.647293`, and rough31 composites give
`30.090235..32.325706`. More importantly, exact non-prime local shells
already carry the effect: W6 candidates have maxAbs/sqrt `71.024484` and
theta `0.792499`; W210 candidates have maxAbs/sqrt `61.092931` and theta
`0.793146`. This matches the classical Newman/Gelfond digit-sum bias
scale `log(3)/log(4)`, caused by Thue-Morse on residue classes modulo `3`.

Base and two-universe checks break transport. Base `3` collapses to
integer parity, so odd primes all have the same digit-sum parity and the
endpoint is `-sqrt(pi(x))` scale (`-1015.443745` normalized at
`16,000,000`). Over `F_2[t]`, coefficient parity is `f(1)`; irreducibles
of degree `>1` cannot have `f(1)=0` without the factor `t+1`, so the
endpoint degree `22` has forced maxAbs/sqrt `436.528350`.

STATUS: `GRAVEYARD / NEWMAN-DIGIT LOCAL-SHELL ARTIFACT`.

CONNECTION: digit-dynamical sibling of the primorial recovery-debt and
rough-shell residue-current breaks. The correct adversary is the exact
local candidate shell, not Cramer. It also reinforces the
lex/coefficient-ordering warning: coordinate encodings can manufacture
lines before prime regularity enters.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — rough-shell residue-current spectral edge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/rough-residue-current-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
leave neighbor factor-shape. In fresh integer blocks, count prime centers
by nonzero residue class across small prime moduli, but whiten every cell
against exact `257`-rough odd-center counts in the same block. Stack these
whitened residue currents and score
`lambda_max(covariance rows) / Marchenko-Pastur edge`. The finite-field
analogue used irreducibles against monic centers with no factors of degree
`<=floor(d/2)-1`.

Result: the integer statistic is absorbed by the rough-shell null. At
`N=8,000,000`, budget `10` real edge is `0.941540`, inside rough-random
controls `0.879736..1.065678`, rough-composite controls
`0.893949..1.047297`, and Cramer controls `0.922074..1.055315`. The
endpoint trace is not stable outside controls: budget-10 edges are
`1.084238`, `1.117257`, `1.025502`, `1.103748`, `0.941540`.

Finite fields diverge rather than transport: `F_3[t]` budget-5 edge
`1.246217` and `F_5[t]` budget-5 edge `1.544332` exceed their rough
controls, with strongest columns in low-degree polynomial residue cells.
This is an S2-style lead only; it is not an integer critical line.

Named composite centers `25`, `35`, `77`, and `289` fail `257`-rough
eligibility, which is a null-shell exclusion rather than prime-specific
success.

STATUS: `GRAVEYARD / ROUGH-SHELL RESIDUE CONTROL`.

CONNECTION: non-neighbor sibling of the roughness-profile break. It shows
that installing the rough shell directly absorbs integer residue-current
spectra just as it absorbed neighbor factor-shape. The finite-field
residue-current excess may be a genuine two-universe divergence to study
separately.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — roughness-collapse profile line

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/roughness-collapse-profile-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
turn the Cycle 74 roughness failure into the object. For each roughness
cutoff `B`, compare prime-center composite-neighbor factor fragmentation
to the same statistic on centers coprime to all primes `<=B`:
`Delta(B,N)=mean_prime_center_split - mean_B_rough_center_split`. Use
`T(B,N)=sum_{B<p<=sqrt(N)}1/p` as the x-coordinate. In finite fields, use
rough degree `r` and `T_q(r,d)=sum_{r<deg P<=floor(d/2)}1/|P|`.

Result: the coordinate is diagnostic but not a line. At `N=8,000,000`,
the integer endpoint affine fit has only `R2=0.772822`, slope `0.00262688`,
intercept `-0.00060288`, and RMSE `0.00048737`; the through-origin fit is
worse with `R2=0.665542`. Across endpoints, integer affine slopes drift
from `0.00335696` to `0.00262688`.

The two-universe check breaks transport. Finite-field endpoint slopes are
about one order of magnitude larger: `F_3[t]` degree `11` has slope
`0.023563` and `F_5[t]` degree `7` has slope `0.016163`. Their profiles
are rough-degree response curves, not a shared normalized critical line.

Named composite centers remain valid inputs: `25` mean split `0.53104907`,
`35` `0.53728096`, `77` `0.52767616`, and `289` `0.47469394`.

STATUS: `GRAVEYARD / NONLINEAR ROUGHNESS PROFILE`.

CONNECTION: direct continuation of the rough-center smoothness null. It
shows that matching one roughness cutoff is insufficient, but the simple
Mertens-tail mass `sum 1/p` is also insufficient. Future neighbor-factor
experiments need the full roughness response surface as the null, or they
should leave this branch.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — constant-orbit composite-only factor-shape residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/function-field-factor-shape-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
avoid direct companion-prime counting. In finite fields, for irreducible
centers `f` and constants `c`, discard irreducible mates `f+c` and score
only the reducible mate's factor fragmentation
`split(g)=1-sum_i (deg P_i/deg g)^2`. The integer transport used prime
centers `p`, shifts `{2,4,6,8,10,12}`, discarded prime mates, and scored
`1-sum_i (log p_i/log n)^2` over composite mates.

Result: the first-pass signal was large but false. Against the weak
`W=30030` local shell, the integer endpoint at `8,000,000` had real mean
split `0.493384` versus null `0.491172`, with `z=21.378472`. W-fake
controls were only `-1.667971..2.242923`, W-composite controls
`-12.577774..-10.545819`, and Cramer `-26.567175..-24.088176`.

The adversarial rough-center null breaks it. Requiring centers coprime to
all primes `<=31,97,257` moves the endpoint z to `9.187508`, `3.126492`,
and `1.414119`. The finite-field side shows the same mechanism: at the
endpoint, `F_3[t]` actual `z=40.542933` is reproduced by rough-center
controls `39.411262..41.493255`, and `F_5[t]` actual `z=25.851698` by
rough-center controls `24.937767..26.649481`.

STATUS: `GRAVEYARD / ROUGH-CENTER SMOOTHNESS NULL`.

CONNECTION: this is the roughness-depth version of the primorial
recovery-debt and local-null Walsh failures. Cramer is the wrong
adversary; the correct null is the no-small-factor shell matching the
center conditioning. Composite-only neighbor factor shapes mostly measure
that the center is rough, not a new critical line.

## 2026-06-15 · PLAYGROUND / GRAVEYARD — function-field constant-orbit companion residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/function-field-constant-orbit-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
define the statistic in finite fields first. For odd `q`, degree `d`, and
monic irreducible `f`, aggregate the constant orbit `f+c`, `c in F_q^*`:
`A_q(d)=sum_c #{irreducible f: f+c irreducible}`. The null was fixed as
`P_q(d)=sum_c polynomialTwinPrediction(q,d,c,d)`. The integer transport
used shifts `{2,4,6,8,10,12}`, finite Hardy-Littlewood singular products,
and Bernoulli variance.

Result: the finite-field-first discipline was useful, but the object is
still companion-prime counting. Through `8,000,000`, the integer side has
`539,609` prime centers, observed companions `403,015`, expected
`403,224.205408`, endpoint `z=-0.354968`, and residual exponent
`theta=-0.203636`.

Endpoint integer controls:

- Hardy-Littlewood Bernoulli z range: `-1.026879..2.176576`
- W30030 fake z range: `10.904731..13.740834`
- Cramer-label z range: `60.552366..65.365508`
- composite-center z range: `17.489400..19.161663`

So real is absorbed by the correct pair-correlation null. W30030, Cramer,
and composite controls fail because they are one-point label controls and
do not encode the pair singular series.

Function-field endpoint checks were sqrt-scale but not a shared law:
`F_3[t]` degree `14` had actual `19020`, predicted `19332.188904`,
cumulative z `-1.293641`, theta `0.458199`; `F_5[t]` degree `9` had
actual `69060`, predicted `68435.989504`, cumulative z `2.742860`, theta
`0.472766`.

Named composite centers do not fail the companion predicate: `25` has
three hits among `n+{2,4,6,8,10,12}`, `35` has four, `77` has three, and
`289` has one.

STATUS: `GRAVEYARD / HARDY-LITTLEWOOD COMPANION NULL`.

CONNECTION: function-field-first prevented a post-hoc null, but the object
still collapses to the Hardy-Littlewood/twin-prime funnel. This is the
pair-correlation analogue of the primorial recovery-debt break: once the
null installs the actual local mechanism, the apparent line is ordinary
prime-pair noise.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — primorial recovery-debt rank line

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/primorial-recovery-debt-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
leave squarefree windows and measure how quickly primes recover after
small-prime residue obstructions are removed. With
`W=2*3*5*7*11*13=30030`, define `rank_W(a,b)` as the number of
`W`-coprime candidates in `(a,b]`. For consecutive primes, compare this
rank to the geometric local-sieve main term with
`q(n)=W/(phi(W)log n)`, scoring
`D(Y)=sum(rank_W(p_i,p_{i+1})-1/q(p_i))/sqrt(sum((1-q)/q^2))`.

Result: a clean flat line, but not a new prime line. Through `8,000,000`,
real primes have `539,608` pairs, endpoint `z=0.330247`, rank mean
`2.843308`, expected rank `2.842276`, and residual exponent
`theta=0.523367`.

Endpoint controls:

- W30030 fake z range: `-2.752731..1.580178`; rank mean
  `2.833505..2.846717`
- W210 fake z range: `156.305434..161.196521`; rank mean
  `3.374733..3.392490`
- Cramer-label z range: `506.629035..510.030011`; rank mean
  `4.927947..4.946909`
- count-matched composite z range: `-7.062751..-6.934205`; rank mean
  `2.843281..2.843314`

Break: the correct local fake absorbs the real line. Cramer and W210 are
wildly wrong only because they do not install all local factors in the
candidate definition; that is a null-model failure, not prime-specific
structure. Count-matched composites are not prefix-shaped like primes.

Named composite check: `25`, `35`, and `77` fail W-eligibility because
they share small factors with `W`; the W-coprime composite `289` is
eligible and has rank `1` to the next prime against expected `1.324964`,
so the single-center mechanism is not prime-exclusive.

STATUS: `GRAVEYARD / PRIMORIAL GEOMETRIC WAITING-TIME NULL`.

CONNECTION: this is the small-dimensional sibling of the window-Walsh
failures. It validates the user's warning about Cramer more sharply:
once the null has the same local arithmetic as the statistic, the apparent
regularity becomes an ordinary geometric waiting-time law in primorial
candidate coordinates.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — locally whitened squarefree window Walsh residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/locally-whitened-window-walsh-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the raw `L2` failure of the squarefree window Walsh spectrum by
training a matched-composite covariance null. Keep the same 36 one- and
two-coordinate Walsh features from
`v(n)=(mu(oddpart(n+h)))`,
`H={-30,-22,-14,-6,6,14,22,30}`, but score
`W(Y)=sqrt((S_p(Y)-m(Y))^T C(Y)^-1 (S_p(Y)-m(Y)))` and
`Zmax(Y)=max_i |S_p(Y)_i-m_i(Y)|/sqrt(C_ii(Y))`.

Result: whitening fixed the raw-norm defect, but not in a prime-specific
way. Through `8,000,000`, with 48 local matched-composite training seeds
and 15 heldout seeds, real primes have `539,766` centers, whitened norm
`W=7.505021`, `Zmax=2.339112` on feature `-30*22`, whitened exponent
`thetaW=0.007907`, and raw residual exponent `thetaRaw=0.499075`.

Endpoint controls:

- local-holdout `W` range: `6.100177..7.725819`; `Zmax`
  `1.640417..3.071974`
- Cramer-label `W` range: `5.942774..8.652724`; `Zmax`
  `1.547614..2.883696`
- W210-label `W` range: `4.785714..8.290173`; `Zmax`
  `1.614704..3.694394`
- count-matched composite `W` range: `4.767471..7.099229`; `Zmax`
  `1.259035..2.953260`

So the real whitened norm and max-coordinate statistic both sit inside
the registered controls. The top feature also rotates across endpoints:
`-30`, `-22*22`, `-6`, `-30*14`, then `-30*22`.

Named composite centers are valid inputs rather than excluded cases:
`25` has state norm `5.291503`, `35` has `5.291503`, and `77` has
`4.582576`. Function-field shell checks remain calibration only:
`F_3[t]` degree `12` gives norm/sqrt `1.860295`; `F_5[t]` degree `8`
gives `9.497584`.

STATUS: `GRAVEYARD / WHITENED WALSH LOCAL-NULL NOISE`.

CONNECTION: direct repair of the raw window-Walsh norm failure. It proves
that the branch's attractive flatness is a property of the local
matched-composite covariance cloud, not a prime critical line. Future
cycles should leave squarefree Walsh windows rather than keep tuning their
normalization.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — prime-centered squarefree window Walsh spectrum

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/squarefree-window-walsh-spectrum-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
avoid adjacent-prime transport entirely. For each odd center `n`, build
the symmetric squarefree cloud
`v(n)=(mu(oddpart(n+h)))` over
`H={-30,-22,-14,-6,6,14,22,30}`. Form the 36 one- and two-coordinate
Walsh products and test
`||sum_{p<=Y} phi(p)-mean_local||_2/sqrt(pi(Y))`, where `mean_local` is
estimated from local-residue matched composite centers modulo
`3^2*5^2*7^2 = 11025`.

Result: the candidate avoids the overlap/near-overlap gap kernel from the
previous squarefree-cloud transition cycles, but it does not survive
controls. Through `8,000,000`, real primes have `539,766` centers,
residual/sqrt `5.917251`, raw/sqrt `4.989004`, and residual exponent
`theta=0.439662`.

Endpoint controls using fifteen seeds:

- Cramer-label residual/sqrt range: `3.956465..6.693396`
- W210-label residual/sqrt range: `4.060671..6.657885`
- composite residual/sqrt range: `3.395444..5.036039`
- local-residue composite residual/sqrt range: `4.470062..6.206311`

So the real endpoint sits inside Cramer, W210, and local-residue composite
controls. It only beats ordinary composites, which is not enough for a
prime-specific line.

Top residual features are scattered ordinary coordinates, not a coherent
window law: `-6` one-coordinate at `2.328790` sigma, `-30*22` at
`1.845229`, `-14*22` at `-1.765920`, `6*14` at `-1.753126`, and
`-30*6` at `-1.417019`. Function-field shell checks are calibration only:
`F_3[t]` degree `12` has norm/sqrt `1.860295`, while `F_5[t]` degree `8`
has `9.497584`, confirming raw feature norms can be large under different
local shell distributions.

STATUS: `GRAVEYARD / WINDOW WALSH NORM CONTROL-NOISE`.

CONNECTION: direct response to the near-overlap squarefree-cloud kernel.
Transport-free window distributions avoid shifted-integer reuse, but raw
high-dimensional Walsh `L2` is an artifact factory unless whitened by
matched-control covariance or replaced by a pre-registered small intrinsic
feature family with multiple-testing control.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — overlap-projected squarefree cloud residual operator

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/overlap-projected-cloud-operator-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the Cycle 68 squarefree-cloud transition matrix by excluding exact
shift overlaps. For consecutive labels `a<b` with gap `g`, omit matrix
entry `(h_i,h_j)` when `h_i-h_j=g`, then entrywise center the remaining
terms and test `||B(Y)||_op/sqrt(pair_count)`.

Result: exact projection alone still leaves a huge signal. Through
`8,000,000`, real has `539,771` pairs, `op/sqrt=78.292168`,
`frob/sqrt=134.722555`, skipped entries per pair `2.607873`, and
op-norm exponent `theta=0.847975`.

Endpoint controls:

- row-shuffle op/sqrt range: `3.137134..4.213223`
- Cramer-label op/sqrt range: `3.110493..3.860462`
- W210-label op/sqrt range: `3.061837..3.636226`
- odd-composite op/sqrt range: `14.235542..15.368696`
- local-residue composite op/sqrt range: `3.516561..3.743411`

Break: radius factor check. Let
`delta = gap - (h_prev-h_next)`, the distance between the two shifted
integers being compared. Exact projection removes only `delta=0`. The
effect persists through `|delta|<=6`, but collapses once the local
near-overlap band reaches `|delta|<=10`:

- `R=0`: endpoint op/sqrt `78.292168`
- `R=2`: endpoint op/sqrt `77.251092`
- `R=4`: endpoint op/sqrt `66.552427`
- `R=6`: endpoint op/sqrt `64.955193`
- `R=10`: endpoint op/sqrt `4.058764`
- `R=20`: endpoint op/sqrt `1.778456`

At `R=10`, the candidate falls inside the row-shuffle range. The signal is
therefore a local gap-neighborhood kernel, not a hidden residual transport
law.

STATUS: `GRAVEYARD / NEAR-OVERLAP GAP-NEIGHBORHOOD KERNEL`.

CONNECTION: direct repair of the shifted-overlap gap operator. It sharpens
the mandatory factor check for consecutive-prime cloud operators: remove a
pre-registered forbidden distance band, not just exact equality, before
claiming residual structure.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — squarefree cloud transition operator

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/squarefree-cloud-transition-operator-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for each prime, build the signed squarefree cloud
`v(p)=(mu(oddpart(p+h)))` over
`H={-10,-8,-4,-2,2,4,8,10}`. For consecutive primes, accumulate the
centered lag-1 transport matrix
`A(Y)=sum (v(p_i)-mean_prev)(v(p_{i+1})-mean_next)^T`, and test the line
`||A(Y)||_op/sqrt(pair_count)`.

Result: large signal, but no critical line. Through `8,000,000`, real
has `539,771` prime pairs, `op/sqrt=276.026573`,
`frob/sqrt=330.007848`, and fitted op-norm exponent `theta=0.882546`.
Controls at endpoint:

- row-shuffle op/sqrt range: `3.172272..4.172398`
- Cramer-label op/sqrt range: `222.844506..225.821964`
- W210-label op/sqrt range: `217.862613..220.515233`
- odd-composite op/sqrt range: `228.035157..230.183584`
- local-residue composite op/sqrt range: `3.401160..4.049893`

Break: exact shifted-overlap factor check. If `p_{i+1}=p_i+g` and
`h_prev=g+h_next`, then `p_i+h_prev = p_{i+1}+h_next`; that matrix entry
multiplies the same shifted integer by itself, producing
`mu(oddpart(m))^2`, a squarefree indicator. At the endpoint, `28`
matrix entries are on this exact-overlap support, and they carry
`99.9877%` of the Frobenius mass. Matrix/overlap-nonzero correlation is
`0.870307`.

STATUS: `GRAVEYARD / SHIFTED-OVERLAP GAP OPERATOR`.

CONNECTION: operator-valued successor to the odd-kernel Mobius bridge. It
shows that moving from scalars to matrices can reveal stronger structure,
but consecutive-prime shift clouds require an overlap-subspace projection;
otherwise the operator is a gap histogram weighted by squarefreeness.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — odd-kernel shifted Mobius neighborhood bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/odd-kernel-mobius-neighborhood-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the shifted-Mobius bridge by stripping the forced `2`-part:
`X(p)=mu(oddpart(p-1))mu(oddpart(p+1))`, with
`oddpart(m)=m/2^v2(m)`. Bridge `sum_{p<=Y} X(p)` normalized by
`sqrt(label_count)`. Compare to sign-shuffle, Cramer-label, W210-label,
odd-composite, local-residue composite controls modulo `3^2*5^2*7^2`, and
odd-characteristic function-field shells.

Result: the algebraic zero from Cycle 66 is gone, but no critical line
survives. Through `8,000,000`, real primes have `539,776` labels,
`288,802` nonzero scores, sum `-808`, normalized endpoint `-1.099777`,
nonzero rate `0.535040`, and `max/sqrt=1.324360`.

Controls absorb the real path at the same endpoint:

- sign-shuffle max/sqrt range: `1.110666..1.543499`
- Cramer-label max/sqrt range: `0.809932..1.206662`
- W210-label max/sqrt range: `0.760923..1.215481`
- odd-composite max/sqrt range: `0.604333..1.406027`
- local-residue composite max/sqrt range: `0.502250..1.525804`

The intermediate `4,000,000` spike (`max/sqrt=1.548541`) was not stable;
by `8,000,000` it fell inside the stronger controls. Small-prime
local-only scores have huge deterministic bias, e.g. local `3` endpoint
normalized `-489.798144`, but the full Mobius score is essentially
uncorrelated with them (`corr=0.001458` for local `3`,
`0.001969` for local `3*5*7`).

Function-field top shells are sqrt-scale, not contradictory:
`F_3[t]` degree `12` has prime normalized `0.722827`; `F_5[t]` degree `8`
has prime normalized `-0.317038`.

STATUS: `GRAVEYARD / ODD-KERNEL TWO-SHIFT MOBIUS NOISE`.

CONNECTION: direct repair of the shifted-Mobius mod-4 zero entry. It also
sharpens the Cramer warning: simple density fakes underfit this object,
but permutation and local-residue composite controls are the right
grounding tools for non-density arithmetic hallucinations.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — shifted Mobius twin-neighborhood parity bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/shifted-mobius-neighborhood-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for odd primes, score `X(p)=mu(p-1)mu(p+1)` and bridge
`sum_{p<=Y} X(p)` normalized by `sqrt(nonzero_count)`. Compare to
sign-shuffle, Cramer-label, W210-label, odd-composite controls, and
odd-characteristic function-field shells scoring
`X_q(f)=mu(f-1)mu(f+1)`.

Result: a perfect flat line, but trivial. Through `500,000`, real odd
primes have `41,537` labels, `0` nonzero scores, sum `0`, max/sqrt `0`,
and undefined exponent. All odd integer controls also vanish.

Break: exact factor check. For every odd integer `n`, the neighbors `n-1`
and `n+1` are consecutive even integers, so exactly one is divisible by
`4`. Hence one Mobius factor is `0`, and `mu(n-1)mu(n+1)=0` for every odd
prime and every odd-label control.

Function-field shells are nonzero, e.g. `F_3[t]` degree `12` has
`primeNonzero=11800`, `primeSum=152`, normalized `1.399273`, and `F_5[t]`
degree `8` has `primeNonzero=27710`, `primeSum=-70`, normalized
`-0.420513`. This divergence is a local-universe mismatch, not a rescue:
odd-characteristic polynomials do not share the integer mod-4 squarefactor
obstruction.

STATUS: `GRAVEYARD / TRIVIAL MOD-4 SQUAREFACTOR ZERO`.

CONNECTION: sharpens the two-universes rule from the council memo. A
matched statistic must match local completions first; otherwise a beautiful
integer flat line can be pure `2`-adic obstruction while the function-field
side measures a different local object.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — ordinal normalized-gap extrema bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/ordinal-gap-extrema-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for consecutive prime gaps, normalize
`z_i=(p_{i+1}-p_i)/log(p_i)`. Let `E_i=1` when the middle gap in
`(z_{i-1}, z_i, z_{i+1})` is a strict local maximum or minimum, and bridge
`sum(E_i-2/3)`, using the iid continuous ordinal main term `2/3`.

Result: a real signal, but no new critical line. Through `4,000,000`, real
has `283142` triples, `189885` extrema, rate `0.670635` versus iid
`2/3`, normalized residual `2.111715`, max/sqrt `2.122991`, and fitted
max-residual exponent `theta=1.073375`.

Basic controls underfit the real excess:

- shuffled real gaps endpoint max/sqrt range: `0.384005..0.568804`
- Cramer-label endpoint range: `0.280275..0.954825`
- W210-label endpoint range: `0.418858..0.724963`
- composite-label endpoint range: `0.603883..1.784086`

Break: factor check. `E_i=1` exactly when consecutive normalized-gap
increments `z_i-z_{i-1}` and `z_{i+1}-z_i` have opposite signs. The object
is the ordinal/sign-change form of adjacent-gap anti-persistence. At the
same `4,000,000` range, the existing adjacent normalized gap-product audit
has real `gapac1mean=-0.03392586`, `se=0.00124005`, z `-27.358`. Prior
transition audits classify that branch as consecutive-prime
residue-transition structure, not a new critical line.

STATUS: `GRAVEYARD / ORDINAL ADJACENT-GAP ANTI-PERSISTENCE`.

CONNECTION: coordinate-free sibling of the `gapac1mean` and
transition-matched adjacent gap product entries. It shows ordinalizing can
surface a real prime-specific gap signal, but the mechanism remains the
known adjacent-gap anti-correlation funnel.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — near-Wieferich Euler quotient tail bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/eulerq-tail-bridge-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for odd labels `n`, use the folded base-2 Euler quotient distance
`d_2(n)=min(EQ_2(n), n-EQ_2(n))`. Count near-Wieferich tail hits
`d_2(n)<=sqrt(n)`. For primes, bridge
`sum_{p<=Y}(1_hit - 2/sqrt(p))` and normalize by the integrated variance
`sum (2/sqrt(p))(1-2/sqrt(p))`.

Result: no critical line. Through `2,000,000`, real primes have `148932`
eligible labels, `466` hits versus expected `468.003614`, residual z
`-0.093562`, and max/sqrtVar `0.762760`. The max residual stopped growing
early over this range, but that is not prime-specific.

Controls absorb the real path:

- random-uniform quotient endpoint max/sqrtVar range:
  `0.525060..1.457870`
- W210-label endpoint range: `0.473269..1.583984`
- composite Euler-quotient endpoint range: `0.727234..1.650175`

Block residuals also sit inside controls. Base holdouts do not rescue the
effect: base `3` has residual z `-1.401072`, max/sqrtVar `1.758605`; base
`5` has residual z `-1.359445`, max/sqrtVar `1.472925`. Named composite
`77` is itself a tail hit (`EQ_2(77)=75`, folded distance `2`), so the
event is not prime-only.

Break: conditioning on a named obstruction gives a good integrated main
term and variance, but the event remains the small-window tail of ordinary
Euler-quotient equidistribution. It does not collapse to `psi`, `theta`,
or `M`, yet it collapses to a modular quotient tail distribution with
composite controls.

STATUS: `GRAVEYARD / WIEFERICH-TAIL MODULAR EQUIDISTRIBUTION`.

CONNECTION: rare-event repair of the base-2 Euler quotient phase bridge.
The repair improves the audit method but confirms the same branch failure:
Euler-quotient claims require uniform quotient and composite
Euler-quotient controls, and this candidate does not beat them.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — base-2 Euler quotient phase bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/eulerq-phase-bridge-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for odd labels `n`, define
`EQ_2(n)=((2^phi(n)-1)/n) mod n`, computed from `2^phi(n) mod n^2`.
For primes this is the Fermat quotient `q_p(2) mod p`. Score each label by
`exp(2*pi*i*EQ_2(n)/n)` and track
`max |sum phase| / sqrt(label_count)`.

Result: no critical line. Through `1,000,000`, the real prime endpoint has
`78497` labels, terminal/sqrt `0.279583`, max/sqrt `0.848507`, and maxMag
exponent `theta=0.477861`. The small terminal endpoint is not accepted:
the registered max bridge and block values do not separate, and the path
swings high at earlier cutoffs.

Controls absorb the real path:

- random-phase endpoint max/sqrt range: `0.681549..1.739726`
- W210-label endpoint range: `0.623876..1.166718`
- composite Euler-quotient endpoint range: `0.840627..1.675023`

The real endpoint is only lower than this particular five-seed Cramer-label
range `1.027797..1.583906`, which is too weak because random phases, W210
labels, and composites already cover it. Named composites `25`, `35`, and
`77` have valid base-2 Euler quotient phases, so the construction is not
prime-only.

Break: non-reciprocal higher-congruence lifts can still be ordinary
modular-equidistribution walks. This does not collapse to `psi`, `theta`,
`M`, or the Legendre reciprocity trap, but it collapses to a broader
Fermat/Euler quotient distribution problem with no prime-specific residual
separation.

STATUS: `GRAVEYARD / EULER-QUOTIENT PHASE EQUIDISTRIBUTION NOISE`.

CONNECTION: direct response to the quadratic predecessor character bridge.
Cycle 63 escaped the moving-Legendre gap-residue funnel, but found the next
control rule: Fermat-quotient claims need random-phase, W210-label, and
composite Euler-quotient controls before they can be treated as prime
regularity.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — quadratic predecessor character bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/quadratic-predecessor-bridge-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for consecutive primes `p<q`, score the moving quadratic character
`chi(q)=(p/q)` and track
`max_{y<=Y}|sum_{q<=y} chi(q)|/sqrt(pair_count)`.

Result: no critical line. Through `4,000,000`, the real endpoint has
`283145` pairs, value `-277`, normalized value `-0.520565`,
`maxAbs/sqrt=1.133216`, and maxAbs exponent `theta=0.372494`.
That is ordinary sqrt-scale behavior, not separated structure.

Controls absorb the real path:

- Cramer/Jacobi endpoint `maxAbs/sqrt` range: `0.756767..2.091514`
- random-prime predecessor endpoint range: `1.001667..3.860084`
- composite predecessor endpoint range: `0.838210..1.390751`

Every block-normalized real value also lies inside the corresponding
control ranges. The LAB proxy
`mod(n,max(1,gap(n)))/max(1,gap(n))` renders as a near-horizontal
gap-residue band rather than a new 2-D line.

Break: moving-modulus quadratic symbolism is still caught by the funnel.
Quadratic reciprocity rewrites `(p/q)` using `q mod p` and signs modulo
`4`; since `q=p+gap`, the statistic is gap-residue character energy unless
it separates from controls. It does not.

STATUS: `GRAVEYARD / MOVING QUADRATIC GAP-RESIDUE CHARACTER NOISE`.

CONNECTION: moving-modulus cousin of the fixed QR/QNR gap-mean audit. The
failed bridge sharpens the rule that "nonlinear" plus "moving modulus" is
not enough; Legendre-symbol guesses need a stronger factor check and
prime-modulus controls.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — broad CA/XA slack-pairing balance

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/caxa-slack-pairing-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
pair each maximal `N+` no-base debt block against the immediately
following `N-` new-frontier slack block, score
`rho=slackMargin/debtMagnitude`, and track rms `log(rho)` over frontier
cutoffs.

Result: the broad slack-pairing line fails. Real pairs through frontier
`2719`:

- singleton same-type repair at frontier `139`: `rho=12.143942`
- old-exponent repair at frontier `523`: repair prime `31`, not an `N-`
  slack pair
- cluster repair at frontier `1399`: `N+^3 N-^3`, `rho=1.000348`
- cluster repair at frontier `2633`: `N+^3 N-^3`, `rho=1.151241`

The singleton overpay dominates the all-pair statistic: real same-type rms
`log(rho)=1.443837`, worse than the nonzero coarse fake range
`0.575848..0.612672`. The cluster-only statistic is small
(`0.099590`) but has only two real samples. Coarse fake controls still lack
same-resolution path words and range from zero-event seeds to open tails.

Break: motif mixing plus CA/XA bookkeeping. Singleton, old-exponent repair,
and three-step cluster repair are different mechanisms. Averaging them
creates a false conservation line, while isolating the attractive
`N+^3 N-^3` motif leaves only two samples and remains inside the CA/XA
local margin formula.

STATUS: `GRAVEYARD / BROAD CA-XA SLACK-PAIRING LINE`; substatus
`OPEN-MICRO-LEAD / N+^3 N-^3 CLUSTER BALANCE`.

CONNECTION: direct stress test of the CA/XA recovery grammar entry. It
preserves the useful repeated cluster motif but refutes the broader
slack-conservation guess.

## 2026-06-14 · PLAYGROUND / OPEN-LEAD — CA/XA recovery grammar compression

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/caxa-recovery-grammar-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
encode each CA/XA no-base recovery episode as a local word over
`N+` (new-frontier prime above second-order threshold), `N-`
(new-frontier prime at or below threshold), and `Oe` (old-exponent repair
step). Track `G(Y)`, the number of distinct closed recovery words up to
frontier cutoff `Y`.

Result: a sharper finite grammar lead, but not a critical line. The real
path data matched every recovery step. Through frontier `2719`, four real
closures use only three compact words:

- `N+ N-` at frontier `139`
- `N+ O1` at frontier `523`
- `N+^3 N-^3` at frontiers `1399` and `2633`

The repeated long word is the main nugget: a three-prime second-order
overshoot block is paid back by the next three below-threshold new-frontier
primes. Nonempty fixed-shape fake controls are coarsely messier, reaching
`19` coarse word types, `13` open runs, and max word length `108`; however,
the fake artifact lacks detailed path words, and two fake seeds have no
no-base events at all.

Break: finite CA/XA local grammar. `G(Y)` is a tiny four-event catalog, not
a residual scaling law. The symbols are generated directly from the CA/XA
margin formula, so the construction refines the CA/XA recovery conjecture
rather than escaping into an independent prime-regularity line.

STATUS: `OPEN-LEAD / NOT A CRITICAL LINE`. Next work should either
regenerate fake controls with detailed path words or test a direct
slack-pairing invariant: maximal `N+` debt block versus following `N-`
slack block.

CONNECTION: direct refinement of the CA/XA recovery-debt bridge. Cycle 59
showed fast endpoint recovery; this entry identifies the local words that
perform the recovery and exposes the new funnel: CA/XA local margin
mechanics.

## 2026-06-14 · PLAYGROUND / OPEN-LEAD — CA/XA recovery-debt bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/caxa-recovery-debt-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
use no-base CA/XA divisor-frontier runs as nonlinear recovery events.
Define `B(Y)=max extraStepsAfterNoBaseRun` among no-base runs started by
frontier cutoff `Y`, with debt L2 from negative cumulative log-margin as
the companion scale.

Result: a strong finite recovery-bound lead, but not a critical line.
Through frontier `2719`, real CA/XA has four recovery-debt runs, all
closed. Endpoint real: `8` no-base events, `0` unrecovered runs, max extra
recovery cost `3`, max total recovery steps `6`, deepest debt `11.776`
micro log-margin, debt L2 `13.642` micro. Fixed-shape fake-base controls
are heterogeneous: seeds `314159` and `424242` have no no-base events,
while seeds `12345`, `271828`, and `161803` have open debts and/or long
recovery cost. Endpoint fake ranges: max extra `0..94`, open runs `0..13`,
debt L2 `0..16177.300` micro.

Break: finite CA/XA recovery-bound trace. The object does not collapse to
`pi`, `psi`, or a named gap-width residual, but it is exactly a repackaging
of the existing CA/XA no-base recovery conjecture over a sparse four-event
prefix. The fixed-shape fake null is useful as contrast, not a calibrated
control, because some seeds avoid the event entirely while others fail
badly. One real recovery also uses an old-exponent multiplier (`31`),
keeping the mechanism inside the current CA/XA factorization model.

STATUS: `OPEN-LEAD / NOT A CRITICAL LINE`. Next work should classify local
CA/XA debt-closing motifs rather than extending the same endpoint trace.

CONNECTION: direct pivot from the rough-witness local-gap funnel. It escapes
the prime-gap admissibility branch and the `pi`/`psi` residual funnel, but
lands in a new funnel: the divisor-frontier CA/XA recovery conjecture
itself.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — admissible-endpoint rough-witness offset bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/rough-witness-admissible-offset-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the previous rough-witness offset bridge by conditioning each gap
width background on locally admissible endpoints:
`rowvis(a,g-1)=rowvis(a+g,g-1)=1`. Then score
`roughfirst(a,g)/g`, with `1` for no witness, and bridge the cumulative
z-path over prime gaps.

Result: no critical line, but a useful repair. Baselines were built for all
`111` observed gap widths through max gap `252`; only widths `2,4` were
degenerate. Through `N=4000000`, real bridge stiffness grew
`0.337615,0.403823,0.984037,1.269097,1.635914`, with
`theta=0.673671`. Endpoint real overlapped W=2310 controls
`1.538918..1.907396`; W=210 was nearby `0.954625..1.573307`; Cramer was
small `0.130823..0.233753`.

The repair removed the trivial artifact: `g=4` disappeared from the
dominant buckets, and endpoint Cramer terminal z collapsed to
`-1.683622..-0.290163`. But real terminal z still grew to `88.666531`,
while W=210 reached `38.644211..40.383228` and W=2310 reached
`50.223610..52.514978`.

Break: higher-order local admissibility gap geometry. Endpoint
row-visibility is the correct first subtraction, but rough-witness
first-offset geometry still follows the local gap-admissibility ladder.
Dominant widths are now ordinary even gaps (`24,18,30,14,10,...`) rather
than one tiny forced width, and W=2310 already reproduces the bridge scale.

STATUS: `GRAVEYARD / HIGHER-ORDER LOCAL ADMISSIBILITY GAP GEOMETRY`. Future
rough-witness work needs a full high-primorial / interior-admissibility
model before any residual claim.

CONNECTION: direct repair of the previous rough-witness offset entry. It
confirms the lesson rather than reversing it: subtracting one local layer
helps, but the branch remains inside the local prime-gap sieve funnel.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — gap-conditioned rough-witness offset bridge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/rough-witness-offset-bridge-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for each prime gap `(p,p+g)`, score the first rough witness offset
`roughfirst(p,g)/g`, setting the feature to `1` when no witness exists.
Standardize against random odd starts with the same gap width, then score
the endpoint-free bridge stiffness of the cumulative z-path.

Result: no critical line. Through `N=4000000`, real bridge stiffness grew
`0.953557,1.294362,2.220727,2.885182,3.681865`, with
`theta=0.548737`. The endpoint real value overlapped W=210 wheel-random
controls `3.080627..3.977007`; W=2310 controls were higher
`3.968319..4.284954`. Composite-only W=210 controls were much lower
`0.290671..0.686163`, so the statistic is seeing sieve geometry rather
than pure density noise.

Terminal aggregate z was enormous for every sieve-like label family:
endpoint real `353.012177`, Cramer `161.362392..163.803368`, W=210
`285.685067..287.946006`, W=2310 `307.402154..309.661396`, and
composite-only `171.146148..173.666062`.

Break: local row-visibility / wheel-gap geometry. The endpoint is dominated
by small gap widths. Gap `4` alone has aggregateZ `233.305295` and exception
rate `1`: for primes `p,p+4>3`, the interior offsets are killed by
divisibility by `2` or `3`, while random odd starts with the same width do
not preserve this admissibility condition. Width-conditioning is therefore
too weak.

STATUS: `GRAVEYARD / LOCAL ROW-VISIBILITY WHEEL-GAP GEOMETRY`. Future
rough-witness offset work must condition on the full admissible residue
pattern for each gap width, not only on the width.

CONNECTION: refines the rough-gap exception constant. Counting exceptions
found the Gafni-Tao rough-gap law; scoring first-witness geometry after
only width conditioning exposes the next local-sieve funnel.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — log-mass prime-count bridge stiffness

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/logmass-bridge-stiffness-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
partition integer time by equal increments of the discrete logarithmic
density main term `E(x)=sum_{3<=n<=x}1/log n`, bridge the residual path
`pi(x)-E(x)` by removing its endpoint, and score
`rms(B_j)/sqrt(E(N))`. The function-field analogue uses only degree shells:
`I_q(d)-q^d/d`, bridged in expected shell-mass time.

Result: a real, strong calibration line, but not a new critical line.
Through `N=8000000`, integer bridge rms stayed
`0.106466,0.077587,0.092954,0.066441,0.080637`, with
`theta=-0.110741`. Endpoint real was below Poisson
`0.278550..0.624350`, fixed-total `0.229133..0.316819`, Cramer
`0.168629..0.678911`, and thinned-composite `0.157145..0.992524`
controls. The endpoint bridge's largest normalized displacement was only
`0.159937`.

The two-universe check agreed. Over `F_2[t]` through degree `24`, endpoint
real rms was `0.035370` versus Poisson `0.141744..0.299770` and binomial
`0.090987..0.313468`. Over `F_3[t]` through degree `14`, endpoint real rms
was `0.039001` versus Poisson `0.079865..0.234177`.

Break: prime-counting bridge transform. Every coordinate of the bridge is a
linear combination of `pi(x)-E(x)` values. The function-field version is the
same degree-shell bridge applied to `I_q(d)-q^d/d`, whose smallness is
explained by the Weil RH error term. Endpoint removal gives a better visual
and a useful path-space calibration, but it does not leave the
`pi`/`psi` residual funnel.

STATUS: `GRAVEYARD / PRIME-COUNTING BRIDGE TRANSFORM`. Future bridge work
must apply to a genuinely nonlinear intrinsic event process, not to a
linear transform of prime mass.

CONNECTION: path-space sibling of the original `psi(x)-x` square-root
cancellation nugget and the `l2/L2` dyadic transform. The lesson is sharper:
beating density, fixed-total, Cramer, and composite controls is still not
enough when the object is algebraically a prime-counting residual.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — unlabeled prime-pair difference roughness

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/pair-difference-roughness-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
leave `p-1` and sample unordered pairs of prime labels, using only the
unlabeled roughness `omega(|p-q|/2)` of their difference after
difference-size bucketing. The function-field analogue samples unordered
pairs of same-degree irreducibles and scores `omega(f-g)` by
degree-of-difference bucket.

Result: no critical line. The statistic found a huge real pair-difference
main term. Through `N=2000000`, integer absAggregateZ was
`39.596730,43.028511,59.602192,82.488935,80.201503`; the final plateau is
caused by the fixed pair-sample cap. Endpoint real was much larger than
odd-random `0.147847..1.237684` and odd-composite
`0.807413..3.077372` controls. Cramer controls also failed in the same
direction, endpoint `49.561069..52.781046`, but less strongly than real
primes.

The two-universe check made the mechanism obvious. Over `F_2[t]` through
degree `17`, endpoint real was `127.011892` versus reducibles
`0.118802..1.546703`. Over `F_3[t]` through degree `10`, endpoint real was
`54.246846` versus reducibles `0.358907..1.821853`.

Break: unlabeled pair-difference singular-series bias. Pair differences
with many small prime/irreducible factors have larger Hardy-Littlewood /
function-field singular series. Sampling shifts endogenously and then
forgetting their names does not remove that local tuple main term; it
averages it.

STATUS: `GRAVEYARD / UNLABELED PAIR-DIFFERENCE SINGULAR-SERIES BIAS`.
Future pair-difference statistics must divide out or condition on the full
local singular-series weight before claiming residual behavior.

CONNECTION: this is the endogenous-shift version of the locally whitened
shift-incidence spectrum. Fixed shifts exposed the tuple tensor directly;
random unlabeled shifts expose the same mechanism through roughness of the
sampled differences.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — unlabeled unit-divisor shape deviation

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/unit-divisor-shape-deviation-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
leave named divisibility coordinates and score only the unlabeled divisor
cloud of `p-1` or `f-1`. For `m=prod r_i^{a_i}`, use the normalized variance
of `log D/log m` for a random divisor `D|m`; in function fields replace
`log r_i` by factor degree. Standardize each label against odd/monic
background buckets preserving `omega` and a coarse largest-factor bucket,
then aggregate z-scores at `sqrt(label_count)` scale.

Result: no critical line. The statistic found a real shifted-prime
factorization bias, but not a flat residual. Through `N=2000000`, integer
absAggregateZ grew
`7.232662,7.896873,10.704937,14.218928,19.336872`, with
`theta=0.465005`; rmsZ stayed near `1.07`. Endpoint controls were much
smaller for odd composites `2.790164..3.311225` and bucket-matched
composites `2.101716..4.406075`, while Cramer was larger
`25.254219..26.308846`.

The two-universe check confirmed non-flatness. Over `F_2[t]` through degree
`18`, absAggregateZ grew `18.991917 -> 42.835211`. Over `F_3[t]` through
degree `10`, it grew `2.775239 -> 12.008416`. Endpoint function-field
bucket-reducible controls were far smaller: `F_2[t]`
`2.384977..5.053695`; `F_3[t]` `0.549066..1.990738`.

Break: shifted-factorization main-term misfit. This attempt escaped the
immediate finite-character coordinate check because it did not ask for named
events like `ell | p-1`. But the crude `omega`/largest-factor bucket
background missed a deterministic shifted-prime/shifted-irreducible
factorization bias. The growing aggregate is a wrong-main-term signal, not
critical-scale cancellation.

STATUS: `GRAVEYARD / SHIFTED-FACTORIZATION MAIN-TERM MISFIT`. Future
`p-1` shape work needs a much sharper shifted-factorization null preserving
more of the factor-degree partition, or it should leave the `p-1` branch.

CONNECTION: follows the unit-order character-energy entries. It shows the
next funnel after escaping named congruence coordinates: unlabeled
factorization geometry is governed by shifted-factorization laws rather than
immediate AP characters.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — centered unit-order triple cumulant

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/unit-order-triple-cumulant-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the unit-order local-factor defect by ignoring first-order and
second-order scores. For each small factor of `p-1` or `f-1`, use the same
centered/whitened coordinate as the previous entry, but score only the
`sqrt(label_count)`-scaled rms of triple products
`Z(a)Z(b)Z(c)`.

Result: no new critical line. The integer side was a real subrandom
calibration: through `N=4000000`, scaledTriple was
`0.560920,0.624943,0.573466,0.600689,0.490456`, with raw
`theta=-0.548435`. Endpoint real beat all integer controls: Cramer
`0.767807..0.906607`, local-coprime random `0.779141..0.989429`,
local-coprime composites `0.826242..0.947840`, and column-null
`0.930578..1.058368`.

Function fields were mixed. Over `F_2[t]` through degree `20`, endpoint real
was `0.671374`, slightly below local-reducibles `0.696811..0.970097`. Over
`F_3[t]` through degree `12`, endpoint real was `0.584317`, overlapping
local-reducibles `0.562034..0.704536`. That fails the clean two-universe
survivor gate.

Break: higher-order unit-AP character energy. A centered triple coordinate
`Z(ell_i)Z(ell_j)Z(ell_k)` expands into nonprincipal characters modulo
`ell_i ell_j ell_k`; the function-field analogue is the same character
expansion modulo `g_i g_j g_k`. Moving from first/pair scores to third
tensors does not leave the finite-residue character funnel.

STATUS: `GRAVEYARD / HIGHER-ORDER UNIT-AP CHARACTER ENERGY`. Future
unit-order work must stop using named factor divisibility as coordinates, or
else explicitly treat the result as character/AP calibration.

CONNECTION: direct repair attempt for the previous unit-order entry. It
sharpens the lesson that all finite tensors of `factor | p-1` or `factor |
f-1` are still character statistics.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — unit-order local-factor defect

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/unit-order-factor-defect-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
attach to each prime its intrinsic unit-group order `p-1`, and to each
monic irreducible `f` the polynomial `f-1`. For small factors, whiten the
events `ell | p-1` and `g | f-1` by the unit-residue probability
`1/(norm-1)`. Score the `sqrt(label_count)`-scaled first-order mean defect
and second-order pair defect in quadrature.

Result: a strong cross-universe calibration line, but not a new critical
line. Through `N=8000000`, the integer combined defect stayed flat:
`0.583877,0.589075,0.582566,0.549695,0.534967`, with scaled
`theta=-0.038115` and raw `theta=-0.538115`. Endpoint real beat the serious
controls: local-coprime random labels `1.114048..1.484896`,
local-coprime composites `1.001889..1.302567`, and column-null controls
`0.926880..1.285557`. Raw Cramer labels failed much more strongly:
`30.627234..31.293226`.

The two-universe check matched the direction. Over `F_2[t]` through degree
`22`, using factors through degree `4`, endpoint real was `0.582084` versus
local-reducibles `1.042313..1.272413`. Over `F_3[t]` through degree `13`,
using factors through degree `2`, endpoint real was `0.306305` versus
local-reducibles `0.689612..0.932880`.

Break: known unit-AP character energy. The coordinate `ell | p-1` is exactly
`p == 1 mod ell` inside `(Z/ellZ)^*`; likewise `g | f-1` is
`f == 1 mod g` inside `(F_q[t]/g)^*`. After centering, each feature is a
finite linear combination of nonprincipal characters, and pair products are
characters modulo the product. The line is therefore prime equidistribution
in finite residue groups, explained by Dirichlet/PNT-in-AP over integers and
Weil/PNT-in-AP over function fields.

STATUS: `GRAVEYARD / KNOWN-MATH UNIT-AP CHARACTER ENERGY`. Keep this as a
high-quality arithmetic-hyperuniformity calibration. It shows that
intrinsic factorization language alone does not escape the character funnel.

CONNECTION: this is the unit-group/factorization cousin of the
finite-eligible sieve-filtration martingale. It escaped fixed coordinate
shifts and beat local-coprime composite controls, but still reduces exactly
to character equidistribution.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — locally whitened shift-incidence spectrum

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/locally-whitened-shift-spectrum-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
return to fixed-shift prime graphs, but remove more local structure before
scoring. For each shift `h`, define opportunities where `p+h` survives the
small-prime local obstruction, compute the observed pair rate `r_h`, whiten
`1_{p+h prime}` by `(1-r_h)/sqrt(r_h(1-r_h))`, and score the spectral radius
of the off-diagonal covariance matrix over shifts.

Result: an integer calibration line, but not a new critical line. Through
`N=8000000`, integer `rho` was nearly flat:
`0.021396,0.017459,0.020304,0.020698,0.021600`, with
`theta=0.029639`. The endpoint real value beat all simple fake controls:
Cramer `0.007548..0.014133`, final-eligible random
`0.005960..0.007371`, sampled final-eligible composites
`0.007471..0.011577`, and column permutations `0.005023..0.006394`.

Break: fixed-shift local tuple tensor. Pair-rate whitening removes pair
density but the covariance of two shift columns is a centered count of the
triple pattern `{p, p+h_i, p+h_j}` after opportunity masking. That is a
Hardy-Littlewood singular-series / function-field tuple-constant object.
The cross-universe scale check failed badly: endpoint `F_2[t]` had
`rho=0.313324`, `rhoNorm=0.118425` versus reducibles
`0.008233..0.011506`; endpoint `F_3[t]` had `rho=0.187906`,
`rhoNorm=0.071022` versus reducibles `0.010614..0.016320`.

STATUS: `GRAVEYARD / FIXED-SHIFT LOCAL TUPLE TENSOR`. Fixed shifts can still
produce strong real-vs-random lines, but pair whitening only pushes the
known local-tuple obstruction up one order. Future graph attempts should
either subtract the full tuple tensor before spectral scoring or leave fixed
coordinate shifts for intrinsic factorization graphs.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — conditional sibling-extreme filtration line

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/conditional-sibling-extreme-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the local-filtration branch by conditioning on every parent residue
count and scoring only sibling-level extremes. For each refinement
`W -> Wp`, child innovations are
`(C_child-C_parent E_child/E_parent)/sqrt(C_parent q(1-q))`, and the score is
the mean parent-fiber maximum divided by `sqrt(2 log sibling_count)`.

Result: a real cross-universe calibration line, but not a new critical line.
Through `N=16000000`, integer real meanExtreme is
`0.367103,0.374346,0.333774,0.323507,0.347983` with `theta=-0.036491`.
Endpoint controls are much higher: final-eligible random
`0.609883..0.670970`, sampled final-eligible composites
`0.586414..0.694475`, and parent-conditioned sibling multinomial controls
`0.770643..0.942498`.

The two-universe check matched the direction. Over `F_2[t]` through degree
`22`, factors through degree `3` gave real `0.217797` versus reducible
controls `0.421126..0.882072`. Over `F_3[t]` through degree `13`, factors
through degree `2` gave real `0.469138` versus reducible controls
`0.662525..0.697262`.

Break: nonlinear AP-residual calibration. Conditioning on parent counts fixes
the martingale-aggregation failure from the previous entry, but each child
innovation is still a fixed-modulus AP residual component. By finite
Fourier/character orthogonality on the quotient fiber, the statistic is a
nonlinear functional of the same character-equidistribution data. The likely
explanation remains Dirichlet/PNT-in-AP over integers and Weil/PNT-in-AP over
`F_q[t]`.

STATUS: `GRAVEYARD / NONLINEAR AP-RESIDUAL CALIBRATION`. Keep it as a strong
calibration line for arithmetic hyperuniformity; do not claim novelty.

CONNECTION: this is the martingale-preserving repair of residual-field branch
persistence and the nonlinear repair of the finite-eligible
character-energy line. It shows the fixed AP/local-factor branch is
productive as calibration, but exhausted for the "different route" goal
unless character-equidistribution functionals themselves become the target.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — residual-field branch persistence

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/residual-branch-persistence-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the finite-eligible sieve-filtration martingale by scoring nonlinear
residual geometry instead of L2 energy. For each deepest eligible residue
modulo `30030`, follow the standardized AP residual field through
`6 -> 30 -> 210 -> 2310 -> 30030` and score adjacent ancestor sign alignment.
The function-field analogue follows residue branches through products of
small irreducibles.

Result: no critical line. The integer signal is positive, but not
prime-specific. At `N=16000000`, real alignment is `0.288339`, while
final-eligible random controls are `0.348110..0.447200` and sampled
final-eligible composites are `0.296694..0.386235`. The only cleanly defeated
null is the independent level-permutation control, `-0.133725..0.097795`.

Function fields did not rescue the object. Over `F_2[t]`, factors through
degree `3` give no usable nonzero branch pairs at degrees `19`, `20`, or
`22`; only degree `21` has real alignment `-0.038193`. Over `F_3[t]`, factors
through degree `2` give usable real alignments only at degrees `10`
(`0.061317`) and `12` (`0.020765`), both at reducible-control scale.

Break: filtration-martingale aggregation. A parent residual is the sum of its
child residuals:
`C_parent-E_parent = sum_child (C_child-E_child)`. Therefore branch sign
persistence is partly forced by tower geometry for any label set sampled from
the same deepest background. Independent level permutation is too weak
because it destroys this aggregation identity.

STATUS: `GRAVEYARD / FILTRATION-MARTINGALE GEOMETRY`, not a new critical
line.

CONNECTION: this is the nonlinear repair of the finite-eligible
character-energy calibration entry. It shows that avoiding quadratic
character energy is insufficient; nested local-filtration statistics must
also quotient out parent-child martingale aggregation. Future controls should
shuffle sibling residuals conditioned on each parent residual.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — finite-eligible sieve-filtration martingale

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/sieve-filtration-martingale-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
build an intrinsic local-obstruction filtration. For the primorial tower
`6 -> 30 -> 210 -> 2310 -> 30030`, count primes in eligible residue classes,
but subtract the deepest finite eligible background `gcd(n,30030)=1`
projected to each coarser level. Score
`A_*(N)=mean_W chi_W/(df_W)`. The function-field analogue uses products of
all irreducibles up to a small factor degree.

Result: a real line, but not a new critical line. Through `N=16000000`, the
integer real curve is flat and subrandom:
`meanNorm=0.160041,0.173827,0.187302,0.153368,0.170082` with
`theta=-0.000508`. Endpoint controls were higher: Cramer
`0.649029..1.212557`, final-eligible random `0.447919..1.029102`, and
final-eligible sampled composites `0.449680..0.716115`.

The two-universe check matched the direction. Over `F_2[t]` through degree
`22`, factors through degree `3` gave real `meanNorm=0.110042` versus
reducible controls `0.323119..0.931569`. Over `F_3[t]` through degree `13`,
factors through degree `2` gave real `meanNorm=0.174349` versus reducible
controls `0.317873..0.822499`.

Break: the finite eligible correction does not create a new object. At
`N=16000000`, replacing the finite deepest background by the ordinary uniform
AP main gives virtually the same norms: at `W=30030`, `0.352949` finite
versus `0.353189` uniform. By character orthogonality, the statistic is the
normalized L2 energy of nonprincipal Dirichlet character sums over primes
modulo `W`; the function-field version is the same multiplicative-character
energy controlled by the finite-field PNT/Weil RH.

STATUS: `GRAVEYARD / KNOWN-MATH CHARACTER-ENERGY CALIBRATION`. This is a real
cross-universe calibration line, not a novel non-zeta critical line.

CONNECTION: this is the cleaned-up descendant of the primorial modulus-flow
curvature entry and another instance of the real arithmetic-cancellation
nugget: Cramer fake primes fail, but the explanation is known character/AP
regularity. Future local-filtration attempts must factor through characters
before making novelty claims.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — Thue-Morse prime balance

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/thue-morse-prime-balance-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
use the automatic sign `tm(n)=(-1)^{s_2(n)}` and score
`T(x)=sum_{p<=x} tm(p)` by `max_{y<=x}|T(y)|/sqrt(pi(x))`. This tested
whether a digital-dynamical prime theorem could supply a non-zeta critical
line.

Result: no critical line. Through `N=16000000`, base-2 real primes ended with
`maxAbs/sqrt(pi)=33.836373` and exponent `theta=0.774832`, not a flat
sqrt-scale line. The effect did not separate from stronger fake controls:
sampled composites coprime to `210` ended at `30.910564..32.982561`, while
Cramer label controls ended at `29.884983..31.845043`.

Base dependence was decisive. The same prime labels with base-3 digit parity
exploded to `1015.443745` with `theta=1.000009`; base 10 ended at only
`9.402768`. The function-field coefficient-parity analogue also failed:
over `F_2[t]` at degree `22`, real irreducibles had maxAbs/sqrt
`436.528350`, while random monic controls were `1.001080..1.933437`.
Factor check: coefficient parity over `F_2[t]` is `f(1)`, and irreducibles of
degree greater than one cannot have `f(1)=0` or they are divisible by `t+1`.
The sign is therefore forced by a local algebraic obstruction.

Break: digital automatic encoding artifact. The known Mauduit-Rivat
sum-of-digits/equidistribution context makes this a legitimate theorem-rich
branch, but the plotted finite line is representation-dependent and not an
intrinsic RH-grade residual.

STATUS: `GRAVEYARD / DIGITAL AUTOMATIC ENCODING ARTIFACT`, not a new
critical line.

CONNECTION: this reinforces the existing warning that lex/coefficient/digit
orderings manufacture artifacts. It also sharpens the null hierarchy:
Cramer is only a weak density null; sampled composites, base changes, and
function-field local-factor checks are the breaks that mattered here.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — CA-XA divisor-frontier occupancy line

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/caxa-frontier-occupancy-audit.mjs`; source artifact
`logs/divisor-extremes-artifacts/ca-xa-transitions.json`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
use the divisor-world object `H = CA ∩ XA` and count occupied largest-prime
frontiers. Let `A(Y)` be the number of prime frontiers `<=Y` that appear as
frontiers of `H`. Test
`Q(Y)=(A(Y)-Li(Y))/sqrt(Li(Y))` as a divisor-record shadow of a critical line,
rather than a direct prime-label statistic.

Result: no critical line. The exact factor check killed it:

`(occupied-Li)/sqrt(Li) = (pi-Li)/sqrt(Li) - skipped/sqrt(Li)`.

Through the available CA-XA artifact, frontier range `113..2719`, the endpoint
has `368` prime frontiers, `357` occupied frontiers, and `11` skipped
frontiers. Thus `Q(2719)=-0.906160` decomposes exactly as ordinary
prime-count residual `-0.337771` minus skipped correction `0.568389`.

The fake-base CA-XA controls still show that the divisor-world closure lead is
real: real skipped/Li is `0.029370`, while fixed-shape fake controls range
`0.155274..0.762531`, with some fake controls having closure failures. But
those controls test CA-XA closure/scarcity, not a new prime-counting line.

Break: prime-frontier relabeling with finite skip correction. This is not a
`psi`/`M` disguise; it is the other funnel failure: a non-prime/divisor object
whose plotted frontier occupancy is exactly `pi(Y)` plus a small correction.

STATUS: `GRAVEYARD / PRIME-FRONTIER RELABELING`, not a new critical line.

CONNECTION: this connects the playground to the earlier CA-XA live lead. The
CA-XA branch remains mathematically interesting because of closure and rare
skips, but frontier occupancy against `Y` must not be claimed as a separate
critical line. Future CA-XA work should target skipped-frontier run bounds or
recovery-path margins, not occupancy residuals.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — locally calibrated shift-incidence operator

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/shift-incidence-operator-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the fixed-shift graph degree failure by replacing degree variance with
a centered shift-incidence operator. For each label `p`, form
`X_p(h)=1_{p+h is a label}` over eight admissible shifts, subtract each
shift's individual pair count, and score the spectral radius `rho(C)` of the
off-diagonal correlation matrix.

Result: no critical line. Pair-centering was meaningful: at `N=8000000`, real
integer `rho=0.129218` was far above column-permutation controls
`0.005490..0.006709` and Cramer controls `0.015330..0.024378`. But primorial
eligible sampled composites shadowed the integer trace: endpoint composite
`rho=0.124619..0.126261`, and real/composite off-diagonal matrix correlation
rose from `0.9816` at `5e5` to `0.9983` at `8e6`.

Function fields did not match the integer level. Endpoint `F_2[t]` had
`rho=0.313324`; endpoint `F_3[t]` had `rho=0.187906`; integer endpoint was
`rho=0.129218`. Their random monic/reducible and column-null controls were all
near `0.008..0.016` at the endpoint, so the field signal is also local
shift-admissibility structure rather than random density.

Break: fixed-shift triple/overlap covariance. This is not a `psi`/`M`
disguise, and it is not independent pair noise, but it remains in the
Hardy-Littlewood local tuple funnel. Cramer is the wrong adversary for this
object; wheel/singular-series composite geometry is the right one.

STATUS: `GRAVEYARD / LOCAL TUPLE-ADMISSIBILITY COVARIANCE`, not a new
critical line.

CONNECTION: this is the pair-centered repair of the fixed-shift graph degree
entry. It shows future graph operators must subtract the local admissibility
matrix/tensor itself before claiming a prime-specific residual. Otherwise
primorial-eligible composites reproduce the signed operator direction.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — fixed-shift prime graph degree spectrum

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/fixed-shift-graph-degree-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
leave consecutive order and build an unordered graph on primes, with an edge
between `p` and `p+h` for fixed admissible shifts
`H={6,12,18,24,30,42,60,90}`. Score
`D=std(degree)/sqrt(mean degree)`. The function-field analogue uses
irreducibles of fixed degree and polynomial shifts divisible by all linear
factors, so the object is coordinate-free and avoids lex order.

Result: no critical line. The integer trace looked temptingly flat:
`D=0.791977`, `0.802859`, `0.809209`, `0.816985`, `0.823568` through
`N=5e5..8e6`, with exponent `theta=0.014917`. But endpoint sampled composite
controls overlapped it almost exactly: `0.830489..0.832803`. Cramer labels
were higher (`0.906341..0.911995`), so the statistic detects arithmetic/local
constraints, but not prime-specific regularity.

Function fields failed to match the integer level. `F_2[t]` degree `22` had
`D=1.235972`; `F_3[t]` degree `13` had `D=1.109492`. Random monic controls in
the fields had much lower mean degree because the chosen real shifts preserve
linear-factor admissibility; this mainly exposes local admissibility, not a
shared critical line.

Break: unordered pair-graph calibration plus composite overlap and
two-universe level mismatch. This is not a `psi`/`M` disguise, but the mean
degree is a bundle of fixed prime-pair counts and the variance adds small
overlap/triple information, putting it back in the Hardy-Littlewood local
tuple funnel.

STATUS: `GRAVEYARD / FIXED-SHIFT PAIR-GRAPH CALIBRATION`, not a new critical
line.

CONNECTION: this is the unordered two-universe repair after the ordered
transport branch. It removes consecutive-order artifacts, but raw graph degree
spectra are still too close to pair-count calibration. Future graph work must
subtract local pair/triple expectations before scoring a spectral invariant,
or pivot to sieve-variational benchmarks.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — gap-conditioned trimmed transport bulk

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/gapconditioned-transport-bulk-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the consecutive residue-ratio transport spectrum by making the
gap-conditioned null primary and trimming the largest transition-ratio cells.
For `W=210,2310,30030`, preserve the actual gap sequence, randomize starting
reduced residues, compute ratio-cell z-scores, remove
`max(1,ceil(0.01*phi(W)))` cells by `|z|`, and score the remaining RMS bulk.

Result: no critical line. The prime trimmed bulk grew
`2.433868`, `2.823835`, `3.484645`, `4.281077`, `5.807114` through
`N=5e5..8e6`, with exponent `theta=0.336223`. Trimming did not fix the
scaling: full-energy exponent was `0.328844` and top-cell exponent was
`0.289645`.

Endpoint controls broke prime-specificity. At `N=8e6`, prime bulk
`5.807114` lay inside sampled natural-order composite controls
`5.428721..5.917630`. Cramer labels were lower (`2.433128..2.655894`), but
the composite overlap is decisive. The endpoint was also dominated by
`W=210` bulk `10.340913`, not a balanced multi-level line.

Break: natural-order gap/residue transition structure shared by composites,
plus no coordinate-free second universe. This is not a `psi`/`M` disguise, but
it remains in the ordered consecutive-prime race / gap-support branch.

STATUS: `GRAVEYARD / GAP-CONDITIONED ORDERED-TRANSPORT NOISE`, not a new
critical line.

CONNECTION: this is the stricter repair of the consecutive residue-ratio
transport entry. It confirms that gap conditioning is necessary but not
sufficient; top-cell trimming does not produce a stable prime-specific bulk.
Future transport work should stop using consecutive order and move to
unordered two-universe fixed-shift graphs or sieve-variational benchmarks.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — consecutive residue-ratio transport spectrum

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/residue-ratio-transport-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the endpoint-balanced residue-flow failure by scoring ordered movement
instead of endpoint mass. For consecutive primes `p_i,p_{i+1}` and primorial
modulus `W`, compute the unit-group transport ratio
`r_i=p_{i+1}*p_i^{-1} mod W`, then compare the ratio spectrum over
`W=210,2310,30030` to random shuffles of the same endpoint residue multiset,
Cramer labels, sampled composites, and gap-conditioned random starts.

Result: strong ordered structure, but no critical line. Against the weak
shuffle null, real mean energy grew
`10.377676`, `15.558425`, `20.270476`, `22.435134`, `43.333207` through
`N=5e5..8e6`, with exponent `theta=0.502968`. The endpoint exceeded Cramer
controls (`16.090424..24.531205`) and sampled composite controls
(`33.125968..39.578243`).

Break: most of the huge signal was gap-support structure. At `W=210`, the
identity ratio had count `0` while the shuffle null expected `11127.40`
(`z=-141.603`), because prime gaps in this range do not reach the modulus.
When the control preserved the actual prime gap sequence and randomized only
the starting residue, endpoint mean energy fell from `43.333207` to
`6.372712`; the gap-conditioned path still grew with `theta=0.328844`.

Known-check: the remaining gap-conditioned signal is real but belongs to
ordered AP transition / Lemke Oliver-Soundararajan consecutive-prime residue
bias, not a new critical line. It is not a `psi`/`M` disguise, but it is a
known-adjacent prime-race statistic.

Two-universe check failed structurally. Consecutive order is canonical over
integers; coefficient or lex order over `F_q[t]` is an artifact class already
flagged in this project. A survivor would need a coordinate-free
function-field transport analogue.

STATUS: `GRAVEYARD / ORDERED AP TRANSITION BIAS + GAP-SUPPORT CONSTRAINT`,
not a new critical line.

CONNECTION: this is the ordered-transport repair of the primorial
modulus-flow and Möbius-twisted local-flow entries. It shows endpoint balance
is too weak, but ordered residue transport must condition on the actual gap
sequence before scoring and must avoid lex-order function-field artifacts.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — Möbius-twisted local modulus flow

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/mobius-modulus-flow-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the balanced-residue fake from the primorial modulus-flow entry by
attaching a multiplicative predecessor feature. For each tower modulus `W` and
reduced residue `a`, compute local background mean/variance of `mu(n-1)` among
all endpoint-eligible `n=a mod W`, then score standardized prime residuals
`sum_{p<=x, p=a mod W} mu(p-1)`. The function-field analogue uses
polynomial `mu(f-1)` over irreducibles.

Result: no critical line. The integer real energy was not flat or stable:
`0.394094`, `0.408524`, `0.902240`, `0.916565`, `1.152024` through
`N=250k..4e6`. More importantly, the separation from stratified
same-endpoint-residue composite fakes decayed rapidly:
`abs(effect-vs-stratified) theta=-1.051230`, ending at only `-0.093192`.
At `N=4e6`, real `meanE=1.152024` sat inside the stratified fake range
`0.745306..1.586824`.

Function fields did not rescue the object. `F_2[t]` through degrees `17..20`
had real meanE `0.555894`, `0.578413`, `0.750641`, `0.480280`; endpoint
stratified reducible controls were `0.753437..2.428385`. `F_3[t]` through
degrees `10..12` had real meanE `0.719831`, `0.536172`, `1.214587`; endpoint
stratified controls were `1.084596..1.811527`. The two fields do not show a
shared stable line.

Break: predecessor Möbius AP/local conditioning plus two-universe instability.
This is not a `psi`/`M` disguise, but it does reopen the already-known
prime-predecessor AP/local-product trap: conditioning on residues controls
much of the divisibility and squarefree texture of `p-1`.

STATUS: `GRAVEYARD / PREDECESSOR MOBIUS AP-LOCAL CALIBRATION`, not a new
critical line.

CONNECTION: this is the multiplicative repair of the primorial modulus-flow
curvature entry. It shows the stronger adversary needed for future
modulus-flow work: balanced residue fakes plus local feature backgrounds.
Merely adding `mu(p-1)` to a balanced residue statistic is not enough; it
returns to the predecessor branch.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — primorial modulus-flow curvature

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/modulus-flow-curvature-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
treat primes as a measure flowing through the nested residue-class tower
`6 -> 30 -> 210 -> 2310 -> 30030`. For each modulus `W`, compute the
reduced-residue chi-square energy
`E(W,x)=sum_a (C_W(a)-P/phi(W))^2/(P/phi(W))`, then score the new curvature
injected by refinement:
`K_i=(E(W_{i+1})-E(W_i))/(phi(W_{i+1})-phi(W_i))`.

Result: a real calibration signal, but no critical line. The integer endpoint
at `N=8e6` had low mean curvature, `meanK=0.175499`, versus eligible random
controls `0.463488..0.823259`, Cramer labels `0.708652..0.874825`, and
composite-eligible controls `0.408721..0.569874`. The path was stable-ish but
not flat: real meanK moved `0.239518`, `0.209243`, `0.206358`, `0.181320`,
`0.175499` through `N=5e5..8e6`, with endpoint K levels
`0.021`, `0.088`, `0.217`, `0.376`.

Function fields showed the same random-label separation. `F_2[t]` real meanK
through degrees `18..22` was `0.307862`, `0.283531`, `0.262183`, `0.211696`,
`0.256653`, while endpoint random monic controls were `0.883712..1.086012`.
`F_3[t]` real meanK through degrees `9..13` was `0.372405`, `0.337836`,
`0.349656`, `0.376817`, `0.246905`, while endpoint random monic controls were
`0.981028..1.202681`.

Break: a balanced non-prime residue fake beats the primes by construction.
Endpoint balanced-fake meanK was `0.000701` over integers, `0.001159` over
`F_2[t]`, and `0.001153` over `F_3[t]`. The statistic therefore rewards
residue balance itself, not a prime-specific mechanism.

Known-check: by character orthogonality, the fixed-modulus chi-square energy
is a normalized sum of squared non-principal character sums over primes:
`(1/P) * sum_{chi != chi0} |sum_{p<=x} chi(p)|^2`. The tower increments are
the nested version of AP/Dirichlet-character equidistribution. In function
fields this is exactly the kind of object controlled by the Weil RH for
`F_q[t]`; over integers it is Dirichlet AP territory. No zeros are used in the
construction, but the grounding funnel is character-sum cancellation.

STATUS: `GRAVEYARD / AP CHARACTER-SUM EQUILIBRATION + BALANCED-RESIDUE FAKE`,
not a new critical line.

CONNECTION: this is the non-Cramer pivot after the quotient residual
sign-domain failure. It shows Cramer was not the only weak null; naive random
residue labels are also too weak. Future modulus-flow work must include
stratified/balanced residue relabelings as adversarial controls and add a
constraint they cannot fake, such as ordered transport, multiplicative
convolution, or Möbius interaction.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — quotient residual sign-domain persistence

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/quotient-sign-domain-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
collapse translated triple faces on `H={0,6,12,18,24,30,42,60}` to relative
shapes `(a,b)`, subtract the Hardy-Littlewood / polynomial tuple main for each
shape, build the quotient graph of shapes that co-occur in tetrahedra, and
score the largest same-sign component above `|R|>1`.

Result: no critical line. The integer quotient topology collapsed as range
grew. `P(tau=1)` moved
`0.382353`, `0.529412`, `0.205882`, `0.117647`, `0.029412` through `N=6e6`,
with exponent `theta=-0.957080`. At the endpoint only four shapes were active,
and the largest component was a singleton:
`{"sign":1,"size":1,"labels":["18,54"],"maxAbs":1.5391972312563291}`. Shape
energy also drifted down to `0.653216` (`theta=-0.221626`).

Controls did not rescue the object. Endpoint Cramer labels saturated the
quotient graph (`P=0.852941`, energy `40.309539..43.810842`), `W=30030`
fake-label controls saturated completely (`P=1.000000`, energy
`6.321608..8.527241`), and composite-only controls saturated with huge energy
(`90.556684..91.179125`). These are poor topology nulls, not evidence for a
prime line.

Function fields failed the two-universe gate. `F_2[t]` was jagged
(`P=0.111111`, `0.166667`, `0.314815`, `0.092593`, `0.425926` through degree
`22`) with endpoint energy near unit scale. `F_3[t]` grew to `P=0.800000` at
degree `13`, but the endpoint was dominated by repeated algebraic shape
classes, especially `t^3 + 2*t | 2*t^3 + t: -4.209921`.

Break: quotient residual-complex noise plus function-field algebraic-class
repetition. This is not a `psi`/`M` disguise, but it is also not a survivor.
Cramer is only a contrast class here; the real falsifier is that the prime
quotient topology itself evaporates after local tuple calibration and shift
quotienting.

STATUS: `GRAVEYARD / QUOTIENT RESIDUAL-SIGN NOISE`, not a new critical line.

CONNECTION: this closes the immediate additive residual-complex branch after
the triple constellation and tetrahedron curl entries. Future work should stop
centering fixed prime tuples and try a more intrinsic modulus-flow,
transport, variational, or renormalization object whose controls are matched
to local arithmetic structure from the start.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — tuple-residual tetrahedron curl

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/tuple-curl-audit.mjs`; artifacts in `logs/playground-artifacts/`.

Preregistered candidate:
after subtracting the Hardy-Littlewood / polynomial tuple main from every
translated triple face on `H={0,6,12,18,24,30,42,60}`, treat the whitened triple
residuals as a 2-cochain and score the alternating tetrahedron boundary
`C_ijkl=R_jkl-R_ikl+R_ijl-R_ijk`.

Result: no critical line. With translated face counting fixed, the integer
curl is small and stable: `1.255687`, `1.139053`, `1.177774`, `1.091482`,
`1.077125` through `N=6e6`, with exponent `theta=-0.080570`. Endpoint Cramer
labels fail high (`50.577372..52.181001`) because they lack local tuple
constraints; composite-only controls also fail high (`16.851810..17.477379`).
The relevant wheel controls are close but above real (`1.619873..2.683367`),
consistent with post-local tuple noise rather than a new residual line.

Function-field checks agree with the break. `F_2[t]` degree `22` had curl
energy `1.292316`, near unit scale. `F_3[t]` degree `13` was higher
(`2.127812`) and above random monic/reducible controls, but the top cells
repeat in algebraic shift classes with identical values such as `3.143652`.

Break: post-Hardy-Littlewood residual noise plus function-field algebraic-cell
repetition. The object is not `psi`/`M`; the decisive null is translated
cellwise tuple calibration, not Cramer.

STATUS: `GRAVEYARD / RESIDUAL-HYPERGRAPH NOISE`, not a new critical line.

CONNECTION: this is the topology/persistence follow-up to the additive triple
constellation entry. It adds a tooling lesson: every shift-complex face must be
translated to its own first vertex before counting. After that correction,
unquotiented tetrahedron curl is calibrated noise; future residual-complex
work should quotient shift symmetries or score sign-domain persistence rather
than raw alternating sums.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — HL-whitened additive triple constellation surface

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/additive-triple-constellation-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
count fixed additive triples `n,n+a,n+b` and `f,f+h1,f+h2`, subtract the
Hardy-Littlewood / polynomial tuple singular-series main in each cell, and test
whether the whitened residual surface has a stable flat or sharp line across
integers and function fields.

Result: no critical line. The integer side is almost too well calibrated by the
tuple singular series. At `N=8e6`, real prime triples had residual energy
`0.622159` and max cell `1.340741`; five Cramer label controls had energy
`46.448977..50.117544`, `W=30030` fake-label controls had
`7.047914..9.612751`, and composite-only controls had
`99.088712..99.635743`. The fake controls fail because independent labels, even
wheel-conditioned labels, do not enforce higher-order tuple local factors.

Function fields did not rescue the line. `F_2[t]` stayed near unit residual
energy after polynomial tuple subtraction (`1.066932` at degree `23`). `F_3[t]`
had a tempting degree-14 spike (`energy=3.567283`, max cell `9.438483`), but it
was dominated by the symmetric algebraic shift pair
`h=t^3+2t`, `-h=2t^3+t`; extending to degree `15` flipped the cell sign and
reduced it to `-4.586496`.

Break: Hardy-Littlewood tuple calibration on the integer side plus algebraic
shift-cell noise on the function-field side. This is not `psi`/`M`, and Cramer
is not the decisive falsifier; the full tuple singular series is.

STATUS: `GRAVEYARD / HARDY-LITTLEWOOD TUPLE CALIBRATION`, not a new critical
line.

CONNECTION: this is the triple-count continuation of the prime-pair shift
matrix branch. The new lesson is that wheel-density fakes are still too weak
for additive constellations: future additive work must subtract the full
cellwise tuple product before looking at residual topology or hypergraph-level
statistics.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — AP-scrubbed predecessor large-prime tail rank

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/predecessor-tail-rank-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
strip all prime factors `q<=97` from even `n`, rank the large-prime tail by
`omega(tail_97(n))` and `log(rad(tail_97(n)))/log(n)`, then score prime
predecessors `n=p-1` against AP-product weighted nulls
`W_Q(n)=product_{odd q|n, q<=Q}(q-1)/(q-2)` for `Q=97` and `Q=997`.

Result: no critical line. Raw tail lines survive small-prime stripping, but
the AP-product null absorbs them. At `N=16e6`, tail-omega raw aggregate was
`-10.868466`; corrected aggregates were `0.191767` for `Q=97` and
`-0.138521` for `Q=997`. Tail-radical raw aggregate was much sharper
(`-32.866264`) but corrected to `-0.060163` for `Q=97` and `-0.058167` for
`Q=997`.

The tail-omega corrected path under `Q=997` was sign-changing:
`0.029305`, `-0.064326`, `0.078819`, `-0.138521`. Tail-radical was
control-scale throughout: `0.005609`, `0.043671`, `0.041246`, `-0.058167`.
Cramer controls again underfit the AP line (`-18.768329..-17.869983` for
tail-radical versus real `-32.866264`) because Cramer preserves only small
congruence bias.

Break: this is not a `psi`/`M` disguise. It is extended
prime-predecessor AP-tail calibration. Once the AP product is included before
scoring, the large-prime tail residual disappears.

STATUS: `GRAVEYARD / EXTENDED PREDECESSOR AP-TAIL CALIBRATION`, not a new
critical line.

CONNECTION: this is the adversarial repair of the prime-predecessor
totient/radical rank drift. It closes the immediate predecessor-feature branch:
random-even and Cramer controls are no longer acceptable primary nulls for
`p-1` features; the local/AP product must be in the construction from the
start.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — prime-predecessor totient/radical rank drift

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/predecessor-rank-transform-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
rank even integers in fresh blocks by `log(phi(n))/log(n)` and
`log(rad(n))/log(n)`, then score percentile ranks of prime predecessors
`n=p-1`. The hoped-for line was a stable rank drift after subtracting the
block marginal distribution.

Result: sharp raw lines, but no critical line. At `N=16e6`, the
totient-rank aggregate path was `-27.150120`, `-37.436796`, `-51.921873`,
`-71.811003`; the radical-rank path was `-6.496268`, `-9.015748`,
`-12.372822`, `-17.454748`. Both scale like a stable mean-rank offset
(`theta≈0.50` versus prime-predecessor count).

Break: a small-prime AP/local-product model explains the lines. Weighting
even `n` by `product_{odd q|n, q<=97}(q-1)/(q-2)` reproduces the endpoints:
totient model `-71.594586` versus prime `-71.811003`, radical model
`-17.187241` versus prime `-17.454748`. Corrected aggregates were
control-scale: final `-0.216417` for totient and `-0.267506` for radical.
Cramer controls underfit because they preserve only the smallest congruence
biases: final totient Cramer range `-58.399577..-57.666419`.

Composite-successor controls failed in the expected direction
(`9.642660..10.141439` for totient, `2.204442..2.891076` for radical), which
confirms the effect is prime-predecessor AP structure but does not make it
new.

STATUS: `GRAVEYARD / PREDECESSOR LOCAL-PRODUCT AP CALIBRATION`, not a new
critical line.

CONNECTION: this is the rank-transform version of the squarefree-predecessor,
predecessor-rank, and omega-predecessor graveyard branch. Rank transforms
remove block marginal drift, but they do not remove the conditional local
product `P(q|p-1)≈1/(q-1)`.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — local divisor-graph edge energy

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/divisor-graph-window-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
leave consecutive residue order and score a graph invariant inside each
`210`-window. Put prime offsets into a complete graph with edge weight
`omega(|u-v|)`, compare the mean edge weight to five exact count-matched
random subsets of the same local eligible set (no divisor by primes up to
cutoff `B`), and aggregate
`sqrt(windows) * mean(E_real - E_shuffle)`.

Result: no critical line. The exact local-eligible null absorbs the graph
energy. At `N=16e6`, cutoff `47`, the aggregate path was `-0.037997`,
`-0.051225`, `-0.074773`, `-0.022201`, with endpoint inside shuffle controls
`-0.035629..0.028950` and composite controls
`-0.065806..0.053703`. At cutoff `97`, the path changed sign:
`-0.038045`, `-0.030706`, `-0.000632`, `0.014197`, again inside shuffle
controls `-0.035609..0.034966`; composite controls were positive and larger
(`0.010261..0.128277`).

Top final pair-difference contributions were ordinary small-prime difference
classes. For `B=97`, the largest weighted excesses included `d=6`
(`-843.935`), `d=66` (`813.106`), `d=150` (`-617.803`), `d=84`
(`-608.576`), `d=42` (`448.333`), and `d=30` (`-406.734`). These large
cellwise deviations cancel in the scalar graph energy once the exact local
eligible set is used as the null.

Break: this is not a `psi`/`M` disguise; it is an overcompressed
pair-difference statistic. Local eligibility and exact count-matched sampling
already determine the average divisor weight of pair differences.

STATUS: `GRAVEYARD / EXACT LOCAL-ELIGIBLE GRAPH CALIBRATION`, not a new
critical line.

CONNECTION: this is the non-residue graph-invariant continuation of the local
eligible branch from Cycles 24-30. It also answers the Cycle 33 handoff's
suggestion to try a random graph invariant: the stronger local-eligible null,
not Cramer, is the decisive falsifier.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — valid gap-residue holdout law

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/gapresidue-holdout-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
after Cycle 32 showed that next residue is determined by current residue and
`gap mod W`, target the free variable directly. Train a smoothed empirical law
`P(gap mod W | current residue, coarse gap/log(p) bin)` on the lower half of a
fresh block, score the upper half, and subtract the valid landing-residue
baseline uniform over `h` such that `gcd(a+h,W)=1`.

Result: no critical line. The binned advantage is real and stable, but it is
mostly local-wheel/gap-size calibration. At `N=16e6`, modulus `210`, primes had
binned aggregate path `538.895919`, `712.765100`, `1013.446121`,
`1407.034906`, with exponent fit `0.498491` versus transitions. Five
wheel-density controls nearly matched the endpoint
(`1389.175994..1395.788612`), while composite-only wheel-density controls
also carried a large same-direction line (`1080.668308..1089.737444`). The
prime-minus-wheel residual was jagged across blocks:
`5.350`, `24.221`, `16.423`, `14.999`.

At modulus `30`, primes ended at binned aggregate `516.001012`, wheel controls
at `500.896916..506.724815`, and composites at
`345.142208..351.243666`. Adding gap-size bins supplied most of the effect:
mod-`30` final state-only aggregate was `71.393008`, while the binned
aggregate was `516.001012`.

Function-field encoded-order checks were artifact-only. After correcting the
script to use `irreduciblesByDegree[d]` as full monic polynomial encodings,
invalid field target rates were `0`; endpoints were `F_2[t]` degree `24`
binned aggregate `205.164066` and `F_3[t]` degree `15` binned aggregate
`62.933607`. These still depend on coefficient order.

Break: valid landing constraints avoid the exact next-residue identity from
Cycle 32, but the remaining line is the stable empirical law of a
wheel-conditioned short-gap process. It is not `psi`/`M`; it is the
Lemke-Oliver-Soundararajan/local-wheel calibration layer.

STATUS: `GRAVEYARD / LOCAL-WHEEL GAP-SIZE CALIBRATION`, not a new critical
line.

CONNECTION: this closes the immediate "target gap residue itself" continuation
from the gap-conditioned transition quotient. It also records a tooling
lesson for the two-universes branch: `irreduciblesByDegree[d]` already stores
monic polynomial encodings; adding `q^d` again measures an encoded-order
artifact.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — gap-conditioned transition compatibility quotient

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/residue-transition-gapcondition-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the row-shuffle transition null from the holdout Markov experiment by
conditioning on the actual gap residue `h = gap mod W`. The hoped-for object
was a remaining next-residue transition residual after conditioning on
`(current residue, h)`.

Result: exact collapse. Once `h` is known, the next residue is determined:
`b = a + h (mod W)`. At `N=16e6`, integer primes had zero compatibility
violations at every scale for both modulus `30` and modulus `210`; the exact
compatibility quotient was `0`. The misleading gap-row-shuffle aggregates
were huge because shuffling `b` breaks the identity: at modulus `210`, primes
had gap-row-shuffle aggregate `3412.883719`, while wheel controls matched it
(`3412.127804..3418.374575`) and composites were also huge
(`2641.122297..2653.201149`).

Function-field encoded-order checks also had zero compatibility violations:
`F_2[t]` degree `24` gap-row-shuffle aggregate `4018.266465`, violations
`0`; `F_3[t]` degree `15` aggregate `4975.697754`, violations `0`. This is
the same residue arithmetic identity in coefficient encoding.

Break: the repaired transition observable has no next-residue degrees of
freedom. The Cycle 31 line was sharp because the null violated deterministic
gap-residue compatibility; after conditioning on `gap mod W`, the quotient is
identically zero.

STATUS: `GRAVEYARD / EXACT GAP-RESIDUE COMPATIBILITY CALIBRATION`, not a new
critical line.

CONNECTION: this is the exact calibration promised by the holdout
residue-transition Markov break. It moves the next transition target one level
up: any nontrivial residue-order experiment must target the gap residue
sequence itself, not the next residue after the gap is known.

## 2026-06-14 · PLAYGROUND / GRAVEYARD — holdout residue-transition Markov surprise

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/residue-transition-holdout-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for consecutive prime residues modulo `30` and `210`, train a smoothed
transition matrix on the lower half of each fresh block, score the upper half
by holdout log likelihood, and subtract row-shuffled next-residue controls.
The aggregate is `(observed log score - row-shuffle mean) * sqrt(test
transitions)`. Controls include Cramér fake primes, wheel-density sequences,
composite-only wheel-density sequences, and encoded-order function-field
chains.

Result: no critical line. The integer effect is real but not prime-specific.
At `N=16e6`, modulus `210`, primes had residual `4.933688` and aggregate
`2432.408255`, far outside row-shuffle controls `-3.942334..3.285972`; but
wheel-density controls reproduced nearly all of it
(`2395.348001..2401.489245`), Cramér controls were also huge
(`1426.419345..1431.210092`), and composite-only wheel controls were huge
(`1571.700223..1583.780605`). At modulus `30`, the same story held:
prime aggregate `152.432674`, wheel controls `161.893762..164.634517`.

Function-field encoded-order checks were outside row-shuffle controls but not
coordinate-free: `F_2[t]` degree `24` aggregate `22.697616`, controls
`-0.104586..0.240780`; `F_3[t]` degree `15` aggregate `36.710375`, controls
`-0.632772..0.780383`. These rely on coefficient order and do not provide a
transportable two-universe law.

Break: row-shuffling next residues is too weak because it destroys
wheel/gap residue compatibility. The holdout matrix learns stable
consecutive-prime residue transition memory: the Lemke-Oliver-Soundararajan
branch, not a new critical line. A same-block exact Markov model would absorb
the target by construction.

STATUS: `GRAVEYARD / LO-S RESIDUE-TRANSITION MARKOV CALIBRATION`, not a new
critical line.

CONNECTION: this leaves the local eligible subset funnel but enters a known
transition-bias funnel. It shows a sharp line can be manufactured by a weak
null; the wheel fake curve nearly matching primes is the diagnostic.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — local eligible distance-transport residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/eligible-distance-transport-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
inside each local eligible window, sort the pairwise-distance vector of the
prime offsets and compare it by a Wasserstein-1-style mean absolute distance
to leave-one centers from five exact eligible/count shuffled controls. The
integer metric is circular distance on the `210` wheel; the function-field
metric is the short-interval degree ultrametric on `F_2^5` and `F_3^3`.

Result: no critical line. At `N=16e6`, cutoff `47`, the integer endpoint had
real distance excess `0.003465`, fake excess `0.003391`, mean residual
`0.000074`, and aggregate `0.014350`; fake controls were
`-0.005988..0.004882`, but the composite aggregate was slightly larger at
`0.015428`. Fresh blocks were tiny and sign-changing:
`0.004061`, `0.013283`, `-0.015233`, `0.014350`. Cutoff `97` kept a small
positive sign but same-scale composite behavior: prime aggregate `0.019934`,
controls `-0.012163..0.008566`, composite `0.009586`.

Function fields did not transport the effect. `F_2[t]` degree `24` had
aggregate `-0.255471`, inside controls `-0.133575..0.279732`; `F_3[t]`
degree `15` had aggregate `-0.244778`, inside controls
`-0.197279..0.301270`. Both degree paths were jagged, and strongest field
windows were repeated `k=2` ultrametric atoms (`0.75000` over `F_2[t]`,
`0.88889` over `F_3[t]`).

Break: this is an optimal-transport norm on the same pairwise-distance
geometry already exposed in the count-conditioned window-shape branch. The
integer leftover is tiny and composite-scale; the field side is metric/class
artifact.

STATUS: `GRAVEYARD / PAIR-GEOMETRY TRANSPORT CALIBRATION`, not a new critical
line.

CONNECTION: this closes another repair of the Cycle 24 pair-distance branch.
Local eligible conditioning plus exact fake excess absorbs the finite
metric-subset structure; using a richer transport norm does not escape the
pair-geometry funnel.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — local eligible Fourier-power entropy

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/eligible-spectrum-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
inside each local eligible `210`-window, center prime occupancy by exact
window count and eligible-set size, compute the nonzero Fourier-power
distribution, and score its normalized entropy. The residual is observed
entropy minus the per-window mean of five exact eligible/count shuffled
controls, aggregated by `sqrt(window count)`. The function-field analogue uses
all nonzero additive characters on `F_2^5` and `F_3^3`.

Result: no critical line. At `N=16e6`, cutoff `47`, the integer endpoint had
mean entropy `0.908938`, local shuffled mean `0.909024`, mean residual
`-0.000086`, and aggregate `-0.016780`; controls were
`-0.009769..0.013741` and composite aggregate was `-0.003852`. Fresh blocks
were tiny and sign-unstable: `-0.018751`, `-0.013273`, `0.006490`,
`-0.016780`. Cutoff `97` gave the same null-scale result: aggregate
`-0.016047`, controls `-0.030006..0.021665`, composite aggregate
`-0.018665`.

Function fields did not rescue it. `F_2[t]` degree `24` had aggregate
`0.007196`, inside controls `-0.038732..0.027194`. `F_3[t]` degree `15` had
aggregate `0.072130` outside five controls `-0.051791..0.028561`, but the
degree path was jagged (`-0.103671`, `0.093634`, `0.042397`, `0.072130`) and
strongest windows repeated finite-vector class entropy levels.

Break: Parseval fixes total energy by `(k, |E|)`, and the remaining entropy
shape is modeled by exact eligible/count shuffling. The statistic is an
intrinsic spectral form of finite eligible-set pair/autocorrelation geometry,
not a prime-specific residual line.

STATUS: `GRAVEYARD / SPECTRAL ELIGIBLE-SET CALIBRATION`, not a new critical
line.

CONNECTION: this is the spectral version of the Cycle 24-28 local-eligible
funnel. Count, pair-shape, triple-shape, predecessor-rank, adjacent-occupancy,
and Fourier-power entropy have all collapsed once the exact local eligible
process is the null.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — adjacent local-eligible occupancy autocorrelation

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/eligible-adjacent-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
inside each local eligible `210`-window, center prime occupancy by the exact
window count and eligible-set size, then correlate adjacent centered vectors
on the common offset coordinate. The null keeps the exact eligible sets and
exact counts but shuffles occupied eligible offsets; composite controls choose
the same counts from eligible composites. The function-field analogue uses
additive coefficient windows.

Result: no critical line. At `N=16e6`, cutoff `47`, the integer endpoint had
mean correlation `-0.001592`, aggregate `-0.310727`, and rms correlation
`0.143682`; shuffled controls were `-0.301192..-0.002800` and the composite
aggregate was `0.063753`. Fresh blocks did not stabilize:
`-0.048276`, `-0.049013`, `0.010754`, `-0.310727`. Increasing the cutoff to
`97` moved the integer endpoint to aggregate `-0.150751`, while the composite
aggregate was `-0.259623`.

The function-field endpoints looked superficially stronger but failed the
structure gate: `F_2[t]` degree `24` had aggregate `-1.505915` outside
controls `-0.483351..0.390085`, and `F_3[t]` degree `15` had aggregate
`-0.616582` outside controls `-0.403387..0.484416`; both were dominated by
tiny `(k,e)` adjacent classes and repeated coefficient-adjacent extreme
correlations.

Break: the integer statistic is local-eligible null noise and cutoff
sensitive; the field statistic is coefficient-transport/class artifact. This
is not a `psi`/`M` relabeling, but it is still not intrinsic enough to escape
the eligible-process null.

STATUS: `GRAVEYARD / ADJACENT ELIGIBLE-PROCESS NOISE + COEFFICIENT ARTIFACT`,
not a new critical line.

CONNECTION: this extends the Cycle 26/27 lesson. The local eligible process is
a serious base space; adjacent coordinate transport is not coordinate-free and
behaves like the lex/coefficient-ordering artifact class already warned about.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — local-eligible predecessor-squarefree rank discrepancy

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/predecessor-rank-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
inside each local eligible short-window set, score offsets by
`Q(n)=1_{n-1 squarefree}` and compare the prime offsets against
finite-population count-matched subsets of the same eligible set. The
function-field analogue uses `Q(f)=1_{f-1 squarefree}` via polynomial Möbius.

Result: no residual line. At `N=16e6`, cutoff `47`, integer primes had
observed mean `0.374119`, local eligible mean `0.374038`, mean delta
`0.000081`, and aggregate `Z=-0.240925`, inside controls
`-1.170858..1.253823`; composite eligible aggregate was `-0.047546`. Cutoff
`97` gave the same result: aggregate `Z=-0.280160`, controls
`-0.279263..1.175867`. Function-field endpoints were also control-scale:
`F_2[t]` aggregate `-0.390244`, controls `-0.453207..0.209119`; `F_3[t]`
aggregate `-0.695799`, controls `-0.651960..1.369031`.

Break: this is the local-eligible version of the known squarefree-predecessor
Euler product. The raw level near `0.374` is the Artin/local-product scale
already logged for `psqprevmean`; once the window-specific eligible process is
the null, no prime-specific rank residual remains.

STATUS: `GRAVEYARD / PREDECESSOR LOCAL-PRODUCT CALIBRATION`, not a new
critical line.

CONNECTION: this extends the squarefree-predecessor density entry and the
Cycle 26 local-sieve shape entry. The local eligible set is a strong null: it
absorbs both short-window shape and predecessor-squarefree rank.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — local-sieve-subtracted triple-shape cumulant

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/triple-local-sieve-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
repair the Cycle 25 third-order window-shape residual by conditioning on the
actual local eligible offsets in each short window. For a `210`-window with
base `m*210`, form the offsets surviving all small prime divisibility tests
from `11` through a cutoff `B`, then compare the observed prime triple-shape
mean against count-matched random subsets of that eligible set. The
function-field analogue uses irreducible polynomial factors as the local
eligibility tests.

Result: the integer Cycle 25 nugget collapses. At `N=16e6`, cutoff `47`,
the raw integer triple-shape shift was `-0.000752`, while the local eligible
set already predicted `-0.000697`, leaving residual `-0.000055` and aggregate
`-0.010760` inside endpoint controls `-0.041541..-0.006619`. At cutoff `97`,
the result was the same: raw `-0.000752`, local shift `-0.000677`, residual
`-0.000075`, aggregate `-0.014724`, controls `-0.033718..0.013122`.

Break: this is finite local-sieve geometry, not a critical line. Small primes
beyond the base `210` wheel carve window-specific eligible offset sets whose
own triple shapes already have the lower distance-variance seen in Cycle 25.
The function-field side did not rescue it: `F_2[t]` endpoint residual was
inside controls, and `F_3[t]` was small, jagged, and dominated by repeated
`(k, eligible-size)` classes.

STATUS: `GRAVEYARD / FINITE LOCAL-SIEVE SHAPE CALIBRATION`, not a new critical
line.

CONNECTION: this closes the count -> pair -> triple short-window shape branch.
Cycle 24 exposed a pair-spread bias; Cycle 25 found a third-order residual
after pair conditioning; Cycle 26 shows that the third-order residual is
mostly the shape of the finite local eligible set itself. This lands in the
Hardy-Littlewood/Bateman-Horn local-factor layer.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — count+pair-conditioned triple-shape residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/window-thirdshape-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
inside each `210`-admissible window, condition on both prime count `k` and a
bin of mean pairwise distance, then score a third-order shape statistic:
the average normalized variance of the three side-lengths of prime triples.
The intended repair was to project out Cycle 24's pair-distance statistic and
ask whether triple organization remained.

Result: a real integer nugget, but no critical line. At `N=16e6` with `24`
pair bins, integer primes had endpoint mean `z=-0.051973` and aggregate
`Z=-10.143768`, while matched controls were `-1.449829..2.091175` and
integer composites were `0.544335`. Fresh-block means were stable:
`-0.035754`, `-0.050308`, `-0.061005`, `-0.051973`. With sharper `96` pair
bins the integer signal remained: mean `z=-0.053101`, aggregate
`Z=-10.363969`, composites `0.565469`.

Break: the two-universe and class-dominance gates failed. At `24` bins,
`F_2[t]` and `F_3[t]` had matching negative aggregates (`-7.713138` and
`-9.498739`), but the signal was dominated by a few `(k,D-bin)` classes
larger than the total. At `96` bins, `F_2[t]` shrank to `-3.076691` and
`F_3[t]` flipped near zero/positive (`0.681365`). Finite-field composite
controls produced huge degenerate z-scores in small ultrametric bins, exposing
normalization/binning artifacts.

STATUS: `GRAVEYARD / THIRD-ORDER WINDOW-SHAPE LOCAL CALIBRATION`, not a new
critical line.

CONNECTION: Cycle 25 strengthens Cycle 24's lesson. After count and pair
conditioning, integer primes still show a small third-order local shape bias:
triples are slightly less "one close pair plus a far third" than matched
random subsets. But this remains local-window geometry, probably tied to the
`k`-tuple/local-factor hierarchy; it does not transport cleanly to the
function-field model.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — count-conditioned admissible window shape residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/window-shape-audit.mjs`; artifacts in `logs/playground-artifacts/`.

Preregistered candidate:
partition integers into `210`-aligned admissible windows, condition exactly on
the number `k` of primes in each window, and compare the mean pairwise distance
of prime offsets against uniformly random count-matched subsets. The same
count-conditioned shape statistic was run on additive low-degree windows in
`F_2[t]` and `F_3[t]`.

Result: a real but non-surviving window-spread bias. At `N=16e6`, integer
mean `z` stayed small and stable across fresh blocks:
`0.043509`, `0.045214`, `0.042024`, `0.040226`, with endpoint aggregate
`Z=7.851116`. Count-matched permutation controls at the endpoint had aggregate
range `-3.154926..0.325069`, and composite windows had aggregate `1.367015`.

Break: the statistic is still a two-point object. Conditioning on count removes
the one-point density, but mean pairwise distance is controlled by
separation-dependent pair correlations, hence by Hardy-Littlewood/local
factors. Function-field transport also failed in scale: `F_2[t]` mean
`z=0.298616` and `F_3[t]` mean `z=0.229536`, with aggregate values
`137.058126` and `127.358162`. Strongest windows repeated identical discrete
shape values, indicating additive-subspace/count-class structure.

STATUS: `GRAVEYARD / COUNT-CONDITIONED PAIR-CORRELATION CALIBRATION`, not a
new critical line.

CONNECTION: this is the exact-count repair of the residue-local pair branch.
It removes density and one-point residue effects, exposing a genuine small
integer window-spread bias, but the remaining shape is pair correlation. Next
window attempts should project out pairwise distance and test a third-order
shape statistic.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — residue-local additive pair interaction energy

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/residue-pair-interaction-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for each fresh block, modulus, residue, and additive shift, count prime-pair
starts and subtract the exact admissible residue-weighted split of the
observed total pair count. The cell matrix energy was compared with exact
residue shuffles, composite-pair controls, and the same construction over
`F_2[t]` / `F_3[t]`.

Result: the integer side gave a stable low-energy line but not a new critical
line. At budget 5, integer energies across fresh blocks were `0.618279`,
`0.636713`, `0.647019`, `0.623722`; the endpoint exact residue-shuffle range
was `0.856582..1.026481`. This is real smoothing of additive prime-pair starts
across residue classes, but it is Hardy-Littlewood/AP equidistribution.

Break: the two-universe gate failed hard. With field caps `F_2[t]` degree 18
and `F_3[t]` degree 11, top energies were `12.731016` and `10.999146`, versus
shuffle ranges `0.933649..1.008737` and `0.948492..1.051160`. Strongest cells
were dominated by degree-2 moduli: `t^2+t+1` over `F_2[t]` and
`t^2+2*t+2` over `F_3[t]`, with residuals around `33..35`.

Composite-pair controls did not reproduce the integer prime energy; they were
much smoother (`0.108877` endpoint energy) because composite pairs are dense.
That does not save the candidate: the integer signal is a known AP pair
calibration, while the function-field analogue used an incomplete local main.

STATUS: `GRAVEYARD / RESIDUE-LOCAL HARDY-LITTLEWOOD CALIBRATION`, not a new
critical line.

CONNECTION: this combines the Cycle 22 residue-current warning with the Cycle
20 prime-pair local-main warning. Exact local means matter even more in
residue-resolved pair statistics. A missing residue-class singular-series or
character correction can dominate the whole heatmap.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — whitened residue-current spectral edge

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/residue-current-spectrum-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
concatenate square-root-normalized prime excesses over reduced residue classes
for a growing modulus budget, split into fresh blocks/degrees, and track the
covariance spectral edge
`lambda_max / Marchenko-Pastur-edge`. The same construction was run for
integer primes and for irreducibles in `F_2[t]` and `F_3[t]`.

Result: the edge made a tempting near-flat line around `1`, but it is not a
prime-specific critical line. At final budget 8 and `N=16e6`, integer primes
had edge `1.072053`, `F_2[t]` edge `1.092706`, and `F_3[t]` edge `1.045277`.
But composite reduced-residue controls had the same integer edge:
`1.070663`.

Break: with exact local residue means, composite counts are
`eligible_counts - prime_counts`, so composite residual vectors are essentially
negative prime residual vectors scaled by density. The energy gate sees the
scale difference (`0.518709` for primes versus `0.137966` for composites at
budget 8), but the normalized spectral edge divides the scale out and keeps
the same covariance shape. The integer edge was also not stable across ranges:
`1.007219`, `1.233785`, `0.918531`, `1.072053`.

The lower real energies versus iid residue-count controls are genuine
equidistribution: integer prime energy `0.518709` versus random
`0.942234..0.974985`; `F_2[t]` energy `0.325253`; `F_3[t]` energy `0.311141`.
That is classical AP equidistribution / prime polynomial theorem territory,
not a new line.

STATUS: `GRAVEYARD / NORMALIZED EQUIDISTRIBUTION SPECTRUM`, not a new
critical line.

CONNECTION: this is the residue-spectrum version of the scale-gate lesson
from the HL-whitened prime-pair direction field. Normalized directions and
normalized eigenvalues can make non-prime controls look meaningful; amplitude
is where the arithmetic signal lived, and here amplitude collapses to known
residue-class equidistribution.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — HL-whitened prime-pair residual direction field

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/primepair-shape-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
after full Hardy-Littlewood subtraction, treat the vector of normalized
prime-pair residual cells across fixed shifts as a direction and test whether
fresh dyadic blocks have a stable adjacent-cosine / anchor-projection line.
The same direction geometry was computed for `F_2[t]` and `F_3[t]` using
polynomial twin predictions.

Result: no stable line. For integer fresh blocks through `16e6`, adjacent
cosines were `0.273, 0.139, -0.137, -0.237, -0.222`, with mean `-0.036742`,
mean pairwise cosine `0.029185`, and mean anchor Hamming distance `0.500000`.
Fair W=30030 fake labels, scored against their own finite-wheel main, occupied
the same noise-scale band: mean adjacent cosine `-0.069971..0.165289`.

Break: direction coherence alone is dangerously main-term sensitive. The same
W-fake labels scored against the full Hardy-Littlewood main produced a fake
high-coherence line (`0.675249..0.888615`) with inflated energy
`2.224440..3.017251`; composite-only controls produced nearly perfect
coherence (`~0.9999`) only because their residual energies were enormous
(`~73` mean, `~121` max block). The scale gate is mandatory.

Function-field transport failed too. `F_2[t]` mean adjacent cosine was
`-0.138826`; `F_3[t]` was `-0.592723` with repeated algebraic shift classes.

STATUS: `GRAVEYARD / SECOND-ORDER HARDY-LITTLEWOOD NOISE`, not a new critical
line.

CONNECTION: this closes the immediate continuation of the prime-pair shift
matrix entry. First-order pair residuals are Hardy-Littlewood calibration;
second-order residual directions are noise plus main-term sensitivity. Future
shape statistics must carry both a correct local main and a scale gate before
direction/eigenvector claims count.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — two-universes prime-pair shift residual matrix

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/primepair-shift-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for fixed admissible shifts, compare pair-count residual cells after local
main subtraction:
`R_Z=(pair_count-K_W(h) integral dt/log(t)^2)/sqrt(main)` for integers and
`R_q=(twin_irreducible_count-polynomial_prediction)/sqrt(prediction)` for
`F_q[t]`, then inspect cells before taking an energy norm.

Result: the finite-wheel integer residual looked like a dramatic line but was
a main-term artifact. With `W=30030`, integer residual energy grew from
`2.521359` at `1e6` to `6.408587` at `16e6`, all cells negative at the
endpoint. The finite-wheel factor was uniformly `1.018020` times the full
Hardy-Littlewood singular-series factor for the tested shifts; after correcting
to full HL factors, the integer energy collapsed to a tight band:
`0.725862`, `0.658355`, `0.532555`, `0.550920`, `0.678342`.

Controls: ordinary Cramer and W=30030 composite-only controls failed
catastrophically at `16e6` (`40.208956..42.432851` and
`194.448374..194.975042` energy ranges). W=30030 fake labels were closer
(`0.852313..1.730085`) but still above the full-HL real endpoint `0.678342`.
This confirms real arithmetic cancellation, but it is explained by
Hardy-Littlewood local singular-series calibration.

Function-field transport did not produce a shared line. `F_2[t]` degree 24
energy `0.645350` matched the corrected integer scale, but `F_3[t]` degree 15
energy was `1.432781` with repeated algebraic shift cells
(`-1.886,-1.886,-1.681,-1.681,-1.681,0.135,0.890,0.135`).

STATUS: `GRAVEYARD / HARDY-LITTLEWOOD CALIBRATION`, not a new critical line.

CONNECTION: this is the prime-pair analogue of the high-primorial gap-moment
residual entry. A finite wheel can manufacture a growing residual from a
small singular-series error. The real lesson is that pair-count work needs
full local factors and cellwise matrices before any norm or line claim.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — two-universes Möbius additive-shift energy

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/muchowla-shift-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
for shifts `h=1..8`, compare the square-root-normalized energy of
`sum_a mu(a)mu(a+h)` over integers and over monic polynomials in `F_q[t]`.
This repaired the previous ordering artifact by using fixed additive shifts
instead of consecutive coefficient-encoding gaps.

Result: the intrinsic version is an honest Chowla/Möbius calibration, not a
new critical line. At `N=16000000`, integer energy was `0.698359` with max
cell `1.543250`, inside the five randomized squarefree-sign control range
`0.390809..0.795914`. Integer dyadic blocks were not stable winners:
`0.350572`, `0.795615`, `0.745583`, `0.590403`, `0.657631`, with two modest
control-range exceedances but no consistent separation.

Function-field behavior also failed transport. `F_2[t]` degree 24 energy
`0.925378` was inside random sign controls `0.478537..0.969590`; `F_3[t]`
degree 15 energy `1.881828` was above controls `0.271266..0.993709`, but the
cells repeated in algebraic shift classes
(`-0.937,-0.937,-2.105,-2.105,-2.105,-2.105,-2.105,-2.105`) and the degree
path was jagged.

Break: after removing coefficient-order adjacency, the statistic collapses to
known/expected Chowla-type cancellation. The scalar energy hides unstable
individual shift cells and does not separate integers from randomized Möbius
signs.

STATUS: `GRAVEYARD / CHOWLA CALIBRATION`, not a new critical line.

CONNECTION: this is the intrinsic additive-shift repair of the normalized
gap-phase surface entry. It confirms that two-universe statistics must be
intrinsic, but also shows that scalar energy norms can erase the cell-level
pathologies that matter. Next two-universe attempts should inspect prime-pair
or irreducible-pair shift residual matrices cell-by-cell after local
singular-series subtraction.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — two-universes normalized gap-phase surface

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/gapphase-surface-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`S_U(d,j)=mean exp(2*pi*i*j*gap/meanGap_d)` for harmonics `j=1..8`, subtract
a matched random-label baseline cell-by-cell, then collapse the residual
surface by L2 norm. Integers used dyadic prime windows and W=210 random
baselines; `F_q[t]` used fixed-degree irreducibles and random monic baselines.

Result: the two-universes transport failed. At the last integer block
`8e6..16e6`, the real-vs-W210-random norm was `0.015403` with W=210 control
range `0.002738..0.005455`. But at top degree, `F_2[t]` had real-vs-random
norm `0.242744` against random controls `0.002879..0.005380`, and `F_3[t]`
had `0.237596` against `0.002510..0.003816`. Reducible controls gave the same
break: `F_2[t]` degree 24 real-vs-reducible `0.243633` against
`0.003408..0.004858`, and `F_3[t]` degree 15 real-vs-reducible `0.237028`
against `0.003293..0.004174`.

Break: the function-field statistic depended on coefficient/lex encoding
adjacency. The `F_2[t]` matrix screenshot showed hard vertical stripes, and the
surface norm amplified those stripes rather than measuring a coordinate-free
prime law. The integer side is also a normalized gap-distribution harmonic,
connecting it to the earlier gap-moment graveyard.

STATUS: `GRAVEYARD / ORDERING ARTIFACT + GAP CALIBRATION`, not a new critical
line.

CONNECTION: this sharpens the existing Kurlberg-Rosenzweig warning. Moving to
the function-field universe only helps when the statistic is intrinsic; using
"next polynomial in coefficient encoding" turns the theorem side into an
artifact amplifier. Future two-universes work should use additive shift
families or residue-class surfaces, not consecutive encoding gaps.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — square-root phase prime residual

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/sqrtphase-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`sqrtphaseres(x)=sum_{p<=x}cos(2*pi*sqrt(p))-integral_2^x cos(2*pi*sqrt(t))/log(t)dt`.

Result: the app-scale trace looked like a very thin horizontal line, but the
audited residual was not a stable critical-line object. At `N=16000000`, real
primes had `1031130` labels, phase sum `-184.200`, midpoint density main
`-0.395`, residual `-183.805`, residual/sqrt(labels) `-0.181009`, and
maxAbs residual/sqrt(labels) `0.368538`. The endpoint max-residual exponent
fit was `theta=0.592007`.

Break: fresh dyadic blocks were unstable and changed sign:
`-0.296977`, `-0.157570`, `-0.680239`, `0.056986`, `0.230478` after
sqrt-label normalization. The endpoint lay inside the W=210 fake-label control
range (`-0.300911..0.203207`) and far inside the composite-only range
(`-1.380295..0.701992`). A factor check identifies the statistic as a smooth
weighted prime-counting residual, i.e. a PNT/exponential-sum calibration rather
than a new route outside the prime-counting funnel.

STATUS: `GRAVEYARD / PNT EXPONENTIAL-SUM CALIBRATION`, not a new critical
line.

CONNECTION: this is the nonlocal cousin of the Fourier/matrix-stripe theme.
The curved phase escapes the local predecessor/gap composite trap, but not the
weighted-prime-counting residual funnel. Future phase work should be a
two-universe residual surface with matched baselines before any scalar line is
claimed.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — composite-subtracted omega-predecessor gap residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/oprevgapres-audit.mjs`; artifacts in `logs/playground-artifacts/`.

Preregistered candidate:
`Ores(x)=C_real(x)-mean_s C_composite_s(x)`, where `C` is the mod-210
residue-centered covariance between `omega(label-1)` and normalized next gap,
and `composite_s` are residue-count-matched composite label sequences.

Result: cumulative residuals looked positive but unstable. The residual fell
from `0.01205656` at `1e6` to `0.00220786` at `16e6`. Fresh dyadic blocks
contradicted the cumulative picture: after the first block, residuals were
negative on every block (`-0.00759383`, `-0.00477188`, `-0.00392160`,
`-0.00592215`).

Break: subtracting the matched composite baseline created an endpoint
transient, not a stable line. The sign flip across blocks is the decisive
failure, and the residual is still tied to composite-seed spread.

STATUS: `GRAVEYARD / BRANCH CLOSED`, not a new critical line.

CONNECTION: this closes the predecessor-feature/gap covariance branch from
the squarefree-tail and omega-predecessor entries below. The raw covariance
was composite geometry; the real-minus-composite residual is an unstable
baseline artifact.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — omega-predecessor gap covariance

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/oprevgapcov-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`oprevgapcov(x)=mean((omega(p-1)-log(log(p)))*(gap(p)/log(p)-1))`, with the
audit sharpening the centering to
`omega(label-1)-E[omega(label-1)|label mod 210]`.

Result: real primes showed a stable-looking negative covariance after
mod-210 residue centering. At `N=16000000`, real primes had `1031083` events,
covariance mean `-0.00440152`, Pearson `r=-0.00747481`, and
`z=-7.590`.

Break: ordinary Cramer and W=210 fake-label controls were near zero, but they
were under-controls. Residue-count-matched composite controls reproduced and
exceeded the effect: covariance range `-0.00739640..-0.00538802` and z range
`-12.335..-8.994`. Therefore the negative covariance is local/composite
geometry, not prime-specific gap regularity.

STATUS: `GRAVEYARD / LOCAL-COMPOSITE GEOMETRY`, not a new critical line.

CONNECTION: this is the non-rare continuation of the squarefree-tail gap
covariance entry below. It also reinforces the QR-gap and transition-audit
lesson: for conditional gap/predecessor-feature statistics, ordinary Cramer
and simple wheel controls are too weak; residue-count-matched composite
controls are the decisive breaker.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — squarefree-tail gap covariance

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/sqtailgapcov-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`sqtailgapcov(x)=mean(((mu(p-1)^2)-A_tail)*(gap(p)/log(p)-1))` over primes
whose predecessor has no `2^2,3^2,5^2,7^2` divisor. The tail expectation
after conditioning away those small square obstructions was
`A_tail=0.967772748847`.

Result: the app-scale trace looked like a sharp horizontal line, but the
audited effect was noise-scale. At `N=16000000`, real primes had `398620`
clean labels, `12916` large-square failures, fail rate `0.032402`, mean
covariance `0.00010325`, endpoint z `0.444`, and fail-minus-pass normalized
gap mean difference `-0.003263`.

Controls broke the claim: ordinary Cramer controls had z range
`-1.482..1.243`, W=210 fake-label controls `-2.741..1.903`, and W=210
composite-only controls `1.114..4.694`. The real effect is smaller than the
control envelope, and the path is unstable across range.

STATUS: `GRAVEYARD / NOISE + LOCAL GEOMETRY`, not a new critical line.

CONNECTION: this is the conditioned residual continuation of the squarefree
prime-predecessor and two-universes squarefree-shift entries. Removing small
local square obstructions is not enough: the post-product large-square tag is
too rare, and multiplying it by normalized gap size gives a flat zero line
rather than prime-specific residual structure.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — two-universes squarefree-shift residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/sqshift-two-universes-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`SqShift_U=mean_{prime objects a in U}mu(a-1)^2-A_U`, comparing integers and
function fields after subtracting each universe's finite local Euler product.
The integer main term used primes `l<=sqrt(x)` in
`prod_l(1-1/(l(l-1)))`; the function-field main term used
`prod_{deg P<=floor(n/2)}(1-1/(|P|^2-|P|))`.

Result: the two-universes transport works as calibration, not as a critical
line. At `N=16000000`, integers had mean `0.37405953` against finite product
`0.373965934633`, residual/sqrt(labels) `0.095038`, and binomial z `0.196`.
For `F_2[t]` degree `24`, mean `0.21625481` against product
`0.216083042707`, residual/sqrt(labels) `0.143596`, z `0.349`. For `F_3[t]`
degree `15`, mean `0.54662149` against product `0.546508394861`,
residual/sqrt(labels) `0.110614`, z `0.222`.

Break: the residuals are tiny after finite local-product subtraction and do not
form a stable shared law. Signs flip across function-field degrees, and fitted
residual exponents disagree (`Z: 0.387`, `F_2[t]: 0.639`, `F_3[t]: 0.228`).
Integer W=210 fake and composite-only controls reproduce the raw local-density
scale; function-field random monic/reducible controls fail only because they
are not irreducible-local-product matched.

STATUS: `GRAVEYARD / KNOWN-MATH CALIBRATION`, not a new critical line.

CONNECTION: this is the two-universes version of the squarefree
prime-predecessor entry below. It closes the pure shifted-squarefree-density
branch: the interesting content is the local Euler product itself, not a
post-product residual law.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — squarefree prime-predecessor density

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/psqprevmean-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`psqprevmean(x)=mean_{p<=x}mu(p-1)^2`, the running squarefree rate of prime
predecessors.

Result: the line is real and very flat, but it is a known local-congruence
density. The Artin/local product
`prod_q(1-1/(q(q-1)))=0.373955838964` is the main term: for each prime `q`,
the squarefree condition excludes the prime residue class `p == 1 mod q^2`.
At `N=16000000`, real primes had `385704` squarefree predecessors among
`1031130` primes, mean `0.37405953`, residual `106.916` versus
`A*pi(N)`, and residual/sqrt(labels) `0.105289`. The endpoint max-residual
fit gave `theta=0.478687`.

Controls: ordinary Cramer controls were biased high
(`0.37925309..0.38055166`) because their local residue model is too weak, but
W=210 fake labels reproduced the level (`0.37428438..0.37525331`) and W=210
composite-only controls also reproduced it (`0.37424201..0.37573187`), with
square-root-scale residuals.

STATUS: `GRAVEYARD / KNOWN-MATH CALIBRATION`, not a new critical line. The
real residual is pretty, but the main line is local Euler-product sieving and
the composite control does not fail.

CONNECTION: this is the non-gap multiplicative counterpart to the rough-gap and
gap-moment calibration entries. It shows that even away from gaps and away from
Chebyshev mass, flat lines can live entirely in the local-sieve layer.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — high-primorial gap-moment residual

Source: `logs/2026-06-13-playground-critical-line.md`; audit script
`scripts/gapz2res-primorial-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`G2res_W(x)=gapz2mean(x)-B_W(x)`, where `B_W(x)` is the five-seed fake-label
baseline restricted to `gcd(n,W)=1`. This was the residual version of the
normalized gap second moment, starting from high primorials instead of W=210.

Result: high-primorial subtraction did not produce a stable critical-line
residual. At `N=16000000`, the real-baseline residuals were:
`-0.01962302` for W=`9,699,690`, `-0.01658375` for W=`223,092,870`, and
`-0.01438172` for W=`6,469,693,230`. The same shrinkage appeared across the
endpoint path: for W=`9,699,690` residuals were
`-0.02484050,-0.01630198,-0.01605712,-0.01741031,-0.01962302`, while for
W=`6,469,693,230` they were
`-0.01623945,-0.01073808,-0.01073656,-0.01195317,-0.01438172`.

STATUS: `GRAVEYARD / LOCAL-SIEVE UNDERFIT`, not a new critical line. The
residual shrinks as the local wheel grows, so the remaining signal is unresolved
singular-series/admissibility mass left over after finite primorial truncation.

CONNECTION: this is the residual continuation of the normalized gap second
moment entry. It shows that merely subtracting a large finite wheel baseline is
not enough; scalar gap-moment work needs a limiting singular-series baseline
before residual claims are meaningful.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — normalized gap second moment

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/gapz2mean-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`gapz2mean(x)=mean_{p_i,p_{i+1}<=x}(g_i/log(p_i)-1)^2`. The hope was that a
non-cumulative, non-adjacent normalized gap moment could give a flat line whose
residual escaped both the Chebyshev funnel and the adjacent-transition branch.

Result: real primes draw a stable flat line, but it is a local-admissibility
calibration, not a new critical line. Real means rose from `0.63684562` at
`1e6` to `0.69293530` at `16e6`, with log-range trend slope `0.01957686`.
At `16e6`, ordinary Cramer controls were higher (`0.80285184..0.80897533`),
W=210 fake labels were closer but still high (`0.74060622..0.74667723`), and
W=210 composite-only controls failed high (`1.71727648..1.73234729`).

The decisive audit was the primorial-wheel ladder. Five-seed fake-label means
at `16e6` moved monotonically toward real as the wheel grew:
W=210 `0.74060622..0.74667723`, W=2310 `0.72899849..0.73443346`,
W=30030 `0.71977950..0.72520346`, W=510510 `0.71533131..0.71957386`,
W=9699690 `0.71095543..0.71435455`.

STATUS: `GRAVEYARD / KNOWN-MATH CALIBRATION`, not a new critical line. The
statistic is a scalar view of prime-gap distribution shaped by local
admissibility and Hardy-Littlewood singular-series effects. W=210 is too weak
for this family; a future residual must subtract a high-primorial or full
singular-series baseline before plotting.

CONNECTION: this refines the rough-gap and adjacent-gap lessons. Ordinary
Cramer and small-wheel controls underfit gap distributions, and scalar gap
moments can look prime-specific until the local sieve is strengthened along a
primorial ladder.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — W=210-compensated Chebyshev mass

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/theta210res-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`Theta210res(x)=sum_{2<=n<=x,gcd(n,210)=1}(isprime(n)*log(n)-210/48)`. The
point was to build the W=210 local-wheel null into a Chebyshev-like log-mass
line before plotting.

Result: the real line is tight but exactly a Chebyshev disguise. At
`N=16000000`, real `value/sqrt(N)=-1.069646`, `maxAbs/sqrt(N)=1.580998`, and
the endpoint max-envelope exponent fit was `theta=0.481511`. Five W=210
fake-label controls were wider (`maxAbs/sqrt(N)=2.030669..9.719652`), while
ordinary Cramer and composite-only controls failed linearly because they do not
match the W=210 coprime-label expectation.

Factor check:
`Theta210res(x)=theta(x)-sum_{p|210,p<=x}log(p)-(210/48)C_210(x)`, where
`C_210(x)=#{2<=n<=x:gcd(n,210)=1}`. Since `(210/48)C_210(x)=x+O(1)`, this is
`theta(x)-x` plus bounded periodic/local-prime terms. The maximum endpoint
identity error in the audit was floating roundoff (`1.669023e-7`).

STATUS: `GRAVEYARD / KNOWN-MATH disguise`, not a new critical line. The
real-vs-W210-fake contrast is the already logged arithmetic square-root
cancellation of Chebyshev residuals.

CONNECTION: this is the W=210 version of the cumulative centered-gap telescope:
strengthening the null can make the comparison fair without escaping THE
FUNNEL. Any cumulative `isprime(n)*log(n)` statistic must be factor-checked
against `theta/psi` before being considered new.

## 2026-06-13 · PLAYGROUND / CLOSED-ARTIFACT — rough-gap exception constant is wheel-sieve geometry

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/roughmiss-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`R(x)=roughmiss(x)*log(x)^2/x`, where `roughmiss(x)` counts consecutive prime
gaps `(p,p+g)` with no interior integer `m` satisfying
`gcd(m,lcm(1..g-1))=1`. The proper audit used dyadic windows and normalized
exceptions by `integral dt/log^2(t)`.

Result: the real line is stable and flat, but not a new critical line. Real
dyadic constants were `2.739383`, `2.723211`, `2.745111`, and `2.746621` on
windows `1e6..2e6` through `8e6..16e6`; the cumulative least-squares main
constant was `2.736909`, with residual exponent fit `theta=-0.010641`.
Ordinary Cramer controls were lower on the last window (`2.144331..2.158904`),
but five `W=210` fake-label controls reproduced the real constant
(`2.736354..2.747184`). `W=210` composite-only labels failed low
(`1.441919..1.464673`).

STATUS: `CLOSED-ARTIFACT / KNOWN-MATH CALIBRATION`, not a new critical line.
The ordinary Cramer contrast from the rough-gap entry was under-controlled:
once fake labels preserve the local wheel through `2*3*5*7`, the rough-gap
exception constant is reproduced by non-prime random coprime labels. The line
is useful Gafni-Tao/sieve calibration, not prime-specific residual regularity.

CONNECTION: this corrects and sharpens the 2026-06-12 rough-witness entry.
It also repeats the Cycle 6/7 lesson from adjacent gap products: a flat
prime-looking line can survive ordinary Cramer while dying against a stronger
local-wheel or transition-matched null.

## 2026-06-13 · PLAYGROUND / CLOSED-ARTIFACT — transition-matched adjacent gap products

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`scripts/gapac1-transition-audit.mjs`; artifacts in
`logs/playground-artifacts/`.

Preregistered candidate:
`gapac1mean(x)-B_q(x)`, where `B_q` is a transition-class baseline. For each
endpoint and modulus `q`, every normalized gap is replaced by the mean
normalized gap for its transition class
`(p_i mod q, p_{i+1} mod q)`, and adjacent products are averaged over the
actual transition-class sequence.

Result: transition matching closes the adjacent-gap branch. Mod `11` barely
explains the real flat line: at `N=16000000`, raw mean `-0.03042431`,
baseline `-0.00129555`, residual `-0.02912875`. Mod `210` explains most of the
line: baseline `-0.02517945`, residual `-0.00524485`. But the residual is not
prime-specific: after the same `q=210` baseline, five Cramer controls had
residuals `-0.00481260..-0.00434714`, and five `W=210` fake-label controls had
`-0.00489857..-0.00446234`. Composite-only controls were near zero
(`-0.00096742..0.00082691`).

STATUS: `CLOSED-ARTIFACT / KNOWN-MATH CALIBRATION`, not a new critical line.
The prime-specific part of the adjacent normalized gap-product line is local
transition structure; the remaining `q=210` residual is a universal artifact of
the transition-class replacement baseline for prime-density label sequences.

CONNECTION: this closes the wheel-subtracted adjacent gap-product entry. It
also connects to the earlier two-universes transition audits: scalar gap
anti-correlation is too coarse, and the correct explanatory layer is
consecutive residue-pair transition structure, not an RH-grade residual line.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — wheel-subtracted adjacent gap products

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`scripts/gapac1residual-audit.mjs`; artifacts in `logs/playground-artifacts/`.

Preregistered candidate:
`gapac1mean(x)-baseline_W210(x)`, where `baseline_W210(x)` is the mean over
five `W=210` fake-label controls. The target was to subtract the independent
local-wheel layer from the adjacent normalized gap-product line.

The residual remained a stable flat negative line. At `N=16000000`, the real
mean was `-0.03042431`, the five-seed `W=210` baseline was `-0.01159624`, and
the residual was `-0.01882806` (`-28.232` real standard errors). Across
`N=1000000..16000000`, the residual stayed in `-0.02338384..-0.01882806`.
After subtracting the same baseline, Cramer controls were positive
(`0.00935400..0.01117787`), independent `W=210` fake controls were near zero
(`-0.00044684..0.00055758`), and composite-only controls were strongly positive
(`0.15027708..0.15652206`).

STATUS: `GRAVEYARD / KNOWN-MATH CALIBRATION`, not a new critical line. The
residual survives simple wheel subtraction, but that null is still underfit for
adjacent gaps. The remaining line is the known consecutive-prime
residue-transition / Lemke Oliver-Soundararajan layer, not a new route.

CONNECTION: this refines the adjacent normalized gap-product entry. It shows
that independent wheel controls are not enough for adjacent-gap statistics; the
next necessary audit is transition-matched, preserving consecutive residue-pair
counts modulo `11` or `210`.

## 2026-06-13 · PLAYGROUND / KNOWN-MATH CALIBRATION — adjacent normalized gap products

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/gapac1mean-audit.mjs`; artifacts in `logs/playground-artifacts/`.

Preregistered candidate:
`gapac1mean(x)=mean((g_i/log p_i - 1)*(g_{i+1}/log p_{i+1} - 1))`. Unlike raw
cumulative gap sums, this does not telescope. It produced a genuine flat
negative line: at app scale `N=200000`, `flatness=0.092212` after the initial
transient, and at `N=16000000` the real mean was `-0.03042431` with
`se=0.00066691` and `z=-45.620`.

Controls at `N=16000000`: five ordinary Cramer seeds were near zero
(`-0.00245580..-0.00041838`), five `W=210` fake-label controls reproduced a
weaker negative layer (`-0.01204309..-0.01103866`), and five `W=210`
composite-only controls had the opposite sign (`0.13868084..0.14492582`).

STATUS: `KNOWN-MATH CALIBRATION / GRAVEYARD`, not a new critical line. This is
the normalized scalar form of the already logged consecutive-prime gap
anti-correlation / Lemke Oliver-Soundararajan-adjacent residue-transition
layer. It survives Cramer, but not novelty.

CONNECTION: this is the non-telescoping counterpart to the cumulative centered
gap graveyard entry. It shows the difference between a Chebyshev disguise and a
real local prime statistic: the latter can beat Cramer and composite controls,
but still lands in the known local-residue transition family unless the
wheel/transition baseline is subtracted.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — cumulative centered gaps

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`scripts/gaplogwalk-audit.mjs`; artifacts in `logs/playground-artifacts/`.

Preregistered candidate:
`G(x)=sum_{p_i,p_{i+1}<=x}(p_{i+1}-p_i-log p_i)`. It looked like a gap-only
flat-line candidate in the existing `gaps:walk` patch view, but the factor
check is exact:

`sum_{i<k}(a_{i+1}-a_i-log a_i)=a_k-a_0-sum_{i<k}log a_i`.

For primes this becomes `p_k-2-theta(p_{k-1})`, so the construction is
Chebyshev `theta` in gap clothing. At `N=16000000`, the identity error was only
floating roundoff (`1.674e-7`), real primes had `maxAbs/sqrt(N)=1.579911` and
short-range `theta=0.481322`, five Cramer controls had `3.494399..11.716888`,
five `W=210` fake-label controls had `2.029044..9.718014`, and composite-only
controls failed massively (`1120.084340..1130.873965`) because the endpoint and
log-sum terms no longer balance at the same density.

STATUS: `GRAVEYARD / KNOWN-MATH disguise`. The real-vs-Cramer contrast is the
already logged arithmetic square-root cancellation of Chebyshev residuals, not
a new gap line.

CONNECTION: this is the cleanest algebraic instance of THE FUNNEL in the
playground ledger. A cumulative gap statistic with a raw `gap` term telescoped
directly back to the `theta/psi` residual family, connecting to the `ψ(x)-x`
and `L2` entries rather than opening a new route.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — Mobius-weighted centered gaps

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/pmugapres-audit.mjs`; artifacts in `logs/playground-artifacts/`.

Preregistered candidate:
`pmugapres(x)=sum_{p<=x} mu(p-1)*(g_p-log p)`, where `g_p` is the following
prime gap. The hope was that predecessor Mobius parity would cancel centered
gap noise more tightly for true primes than for fake labels.

It failed the audit. At `N=800000`, the shareable lab plot had
`flatness=0.711424`, `linearity=0.612941`, and y-range
`[-2206.399,429.182]`; visually it still looked like a thin horizontal band
because the canvas compressed the vertical excursions. At `N=4000000`, real
primes had `maxAbs/sqrt(N)=2.634919` and short-range `theta=0.710683`; five
Cramer seeds had `1.178991..2.947423`, five `W=210` fake-label controls had
`1.678564..3.276658`, and five `W=210` composite-only controls had
`1.801160..4.644215`.

STATUS: `GRAVEYARD`. This is noisy covariance between predecessor Mobius parity
and centered gap increments, not a critical line. Controls match or exceed the
real scale.

CONNECTION: this is the gap-residual sibling of the previous
prime-predecessor Mobius entry. Adding centered gaps did not escape the
local-control failure mode; it amplified noise and made the fake/composite
checks decisive. It also reinforces the visual-audit lesson: a thin-looking
summatory trace is not evidence of flatness without numeric scaling and
controls.

## 2026-06-13 · PLAYGROUND / GRAVEYARD — prime-predecessor Mobius lines

Source: `logs/2026-06-13-playground-critical-line.md`; implementation in
`src/core/math.js`, `src/core/engine.js`, `tests/prime-predecessor.test.js`,
and `scripts/pmuprev-audit.mjs`; artifacts in `logs/playground-artifacts/`.

Two preregistered critical-line guesses failed:

1. `pmuprev(x)=sum_{p<=x} mu(p-1)` initially looked like a flat zero line at
   `N=200000`, with y-range `[-52,41]`, but range expansion and controls killed
   breakthrough status. At `N=16000000`, real primes had
   `maxAbs/sqrt(N)=0.276750` and short-range `theta=0.503583`; five Cramer
   seeds had `0.092750..0.231500`, and five `W=210` composite-only controls had
   `0.090500..0.255250`. The object did not isolate a stable main term or a
   prime-specific residual law.
2. `M((p-1)/2)` over primes `p` gave the same vertical range as ordinary
   `M(n)` over the corresponding half-range: for `p<=800000`, the prime-sampled
   graph had `[-257,240]`, while ordinary `M(n)` over `n<=400000` had
   `[-258,240]`. This is a direct Mertens relabeling, not a new line.

STATUS: `GRAVEYARD`. The useful lesson is procedural: small horizontal-looking
summatory bands must be range-expanded and audited against composite-only
controls before they are treated as cancellation laws. Any object whose plotted
quantity is already `M(f(n))` belongs to the Mertens branch unless the new
content is an audited residual comparison after subtracting the ordinary `M`
baseline.

CONNECTION: this extends the logged `mu(p±1)` and local-control branches. It is
also a clean instance of THE FUNNEL: one guess became a Mobius subsequence sum
with no prime-specific advantage, and the other collapsed exactly to `M`.

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

## 2026-06-13 · TWO-UNIVERSES / OBSERVED + OPEN — homogeneous gap anti-correlation audit

Source: `logs/2026-06-13-research-loop.md`; audit script
`scripts/two-universes-audit.mjs`; artifacts
`logs/two-universes-artifacts/audit-q2-25-q3-16.json` and
`logs/two-universes-artifacts/audit-q2-25-q3-16.md`.

Correction to the first divergence table: the old `[F_3[t]: measured]` prefix
gap-autocorrelation divergence was a degree-boundary artifact. When the
holdout is the homogeneous last-degree block, `F_3[t]` shows the same negative
lag-1 gap autocorrelation direction as `F_2[t]` and `Z`.

Expanded audit:
- `[F_2[t]: measured]` degrees `23,24,25` prefix gap z values:
  `-22.114425`, `-30.102265`, `-38.674010`; degree-25 holdout:
  `-29.693543`. The degree-25 sampled local polynomial wheel null
  (`degree<=2`) has prefix meanAbs z `3.053767`.
- `[F_3[t]: measured]` degree-16 prefix gap z is only `-0.009527`, but the
  degree-16 homogeneous holdout is `-38.498676`; the sampled local polynomial
  wheel null (`degree<=1`) has holdout meanAbs z `12.355884`.
- `[Z: measured]` at `N=2^25` has prefix/holdout gap z
  `-48.855444` / `-37.440042`; at `N=3^16`, prefix/holdout gap z
  `-53.817891` / `-47.842984`. The strongest sampled integer wheel null
  (`W=210`) has prefix meanAbs z `11.583438` at `2^25` and `12.873099` at
  `3^16`.

Spacing L1 did not clear the local-null threshold. Example: `F_2[t]`
degree-25 prefix is `0.302540` versus degree-2 wheel null `0.280673`, and
`Z` at `2^25` is `0.215654` versus `W=210` null `0.206883`.

STATUS: `OBSERVED`, not a breakthrough. The homogeneous gap
anti-correlation passes numeric persistence, five-seed Cramer contrast, and
disjoint holdout, but in this coarse form it is too close to the known
consecutive-prime residue-bias layer (LO-S-adjacent) to satisfy novelty. The
live `OPEN` version is to compute the full two-universes transition law for
consecutive residue/gap-bin pairs after subtracting local-wheel nulls.

CONNECTION: this corrects the previous two-universes divergence row and
connects it to the 2026-06-13 "consecutive prime gaps anti-correlate" entry:
the phenomenon is shared on homogeneous finite-field degree blocks, while
prefix mixing across polynomial degrees can hide it.

## 2026-06-13 · CROSS-STATISTICS / CLOSED-ARTIFACT — QR mod 11 gap effect

Source: `logs/2026-06-13-research-loop.md`; scripts
`scripts/cross-stat-battery.mjs` and `scripts/qr-gap-audit.mjs`; artifacts
`logs/cross-stat-artifacts/cross-stat-8000000.json`,
`logs/cross-stat-artifacts/cross-stat-8000000.md`,
`logs/cross-stat-artifacts/qr-gap-mod-11-32000000.json`, and
`logs/cross-stat-artifacts/qr-gap-mod-11-32000000.md`.

The broad uncomputed cross-statistic battery tested correlations between
following prime gaps and `mu(p-1)`, `|mu(p-1)|`, `omega(p-1)`, the analogous
`p+1` features, all-integer `mu(n)`, `|mu(n)|`, `omega(n)` versus
gap-to-next-prime countdowns, and QR-vs-QNR conditional gaps modulo
`5,7,11,13`.

First-pass survivor: primes in quadratic-residue classes modulo `11` have
larger normalized following gaps than primes in nonresidue classes. At `N=8e6`,
the Welch z-score was `18.328595`, with QR mean `1.021042` and QNR mean
`0.979813`; five ordinary Cramer controls had meanAbs z `0.869013`.

Targeted audit through `32e6` killed breakthrough status. Real QR-vs-QNR z
scores were `18.328595`, `24.015158`, `32.214839`, and holdout
`21.507889` on `(16e6,32e6]`, but a composite-permitting control matched to
the real per-residue densities modulo `11` produced meanAbs z scores
`15.620890`, `21.235547`, `28.619727`, and holdout `18.467626`. Thus most of
the effect is reproduced by residue/wheel geometry without primality.

`corr_omega_n_gap_to_next` also crossed the mechanical first-pass threshold
(`-161.453049` at `8e6`, holdout `-109.377475`), but fake controls were
already huge (`76.710500` and `51.271944` meanAbs), so it is classified as
local countdown geometry rather than a prime law.

STATUS: `CLOSED-ARTIFACT`, not a breakthrough. The useful lesson is
methodological: QR/QNR gap differences must be audited against
residue-count-matched composite controls, not just ordinary Cramer labels.

CONNECTION: this is the integer-only analog of the two-universes local-wheel
audit above. In both cases, ordinary Cramer labels under-control residue
position effects; a stronger wheel/count-matched null is required before
calling a conditional gap statistic new.

## 2026-06-13 · TWO-UNIVERSES / KNOWN-MATH + OPEN — residue transition screen

Source: `logs/2026-06-13-research-loop.md`; scripts
`scripts/two-universes-transition-audit.mjs` and
`scripts/transition-targeted-residue.mjs`; artifacts
`logs/two-universes-artifacts/transition-audit.json`,
`logs/two-universes-artifacts/transition-audit.md`,
`logs/two-universes-artifacts/transition-targeted-residue-mod-11.json`, and
`logs/two-universes-artifacts/transition-targeted-residue-mod-11.md`.

Transition audit scope: full `F_2[t]` degrees `23,24,25`, but reduced
`F_3[t]` degrees `13,14,15` because the full degree-16 transition screen needs
a streaming sampler/matrix accumulator. Integer comparison intervals were
`(2^22,2^23]`, `(2^23,2^24]`, `(2^24,2^25]` and reduced base-3 intervals
`(3^12,3^13]`, `(3^13,3^14]`, `(3^14,3^15]`.

Result:
- `[F_2[t]: measured]` had no passing transition row. The strongest row,
  degree-2 residue transition, had local-wheel ratios `3.223,2.637,6.954`
  but failed the sharpen rule.
- Reduced `[F_3[t]: measured]` had no passing transition row. The strongest
  degree-1 residue row had ratios `0.395,1.097,2.326` with unstable top-cell
  sign.
- `[Z: measured]` reproduced a strong mod-11 consecutive-prime
  residue-transition bias. On `(2^24,2^25]`, the residue-count-matched
  composite control still left L1 ratio `10.352`; on the reduced
  `(3^14,3^15]` interval, ratio `8.097`.

STATUS: `KNOWN-MATH` calibration plus `OPEN` tooling lead, not a breakthrough.
The integer mod-11 survivor is exactly the Lemke Oliver-Soundararajan
consecutive-prime residue-pair phenomenon, not a new statistic. Nearest catalog:
Lemke Oliver and Soundararajan, "Unexpected biases in the distribution of
consecutive primes", arXiv:1603.03720 / PNAS 2016; Tao's 2016 exposition
describes the same object as the distribution of
`(p_n mod q, p_{n+1} mod q)` for small `q`.

OPEN: finish the full `F_3[t]` degree-16 transition audit with a streaming
null sampler that accumulates transition matrices online instead of
materializing five multi-million-entry null sequences. Only after that can the
two-universes transition-law branch be considered fully exhausted.

CONNECTION: this closes the local-wheel transition lead at reduced scale by
linking its only survivor back to the already logged LO-S/residue layer. It
also explains why scalar gap anti-correlation is too coarse: the integer
transition matrix carries known residue-pair bias, while the tested finite-field
blocks did not show a matching residual law.

## 2026-06-13 · TWO-UNIVERSES / CLOSED-ARTIFACT — full transition audit

Source: `logs/2026-06-13-research-loop.md`; updated streaming implementation in
`scripts/two-universes-transition-audit.mjs`; targeted integer controls in
`scripts/transition-targeted-residue.mjs`; artifacts
`logs/two-universes-artifacts/transition-audit.json`,
`logs/two-universes-artifacts/transition-audit.md`,
`logs/two-universes-artifacts/transition-targeted-residue-mod-11.json`,
`logs/two-universes-artifacts/transition-targeted-residue-mod-11.md`,
`logs/two-universes-artifacts/transition-targeted-residue-mod-5.json`, and
`logs/two-universes-artifacts/transition-targeted-residue-mod-5.md`.

Correction/update to the previous OPEN tooling note: the full `F_3[t]`
degree-16 transition audit now completes. Polynomial local-wheel nulls stream
directly into transition matrices rather than materializing sampled null
sequences.

Full transition screen:
- `[F_2[t]: measured]` strongest transition row:
  `poly-mod-deg-2-residue-transition`, ratios `3.223,2.637,6.954`; it fails
  the sharpen/persistence rule.
- `[F_3[t]: measured]` strongest transition row:
  `poly-mod-deg-2-residue-transition`, ratios `1.123,1.206,1.371`; it remains
  below the ratio `2` threshold at degree `16`.
- `[Z: measured]` reproduces integer residue-pair bias. `Z-mod-11` ratios are
  `4.092,4.640,6.539` on the base-2-aligned intervals and
  `3.615,5.498,8.453` on the base-3-aligned intervals.

Targeted residue-count matched controls for integer survivors:
- Mod `11` transition ratios are `10.352` on `(2^24,2^25]`, `8.097` on
  `(3^14,3^15]`, and `13.061` on `(3^15,3^16]`.
- Mod `5` transition ratios are `5.275`, `4.550`, and `6.479` on the same
  intervals.

STATUS: `CLOSED-ARTIFACT / KNOWN-MATH calibration`, not a breakthrough. The
integer survivor is the known Lemke Oliver-Soundararajan consecutive-prime
residue-pair bias family. There is no S1 shared transition law in the tested
finite-field blocks, and the S2 contrast is not novel enough for escalation:
it is "known integer LO-S transition bias not mirrored by these finite-field
local-wheel screens."

CONNECTION: this closes the homogeneous-transition branch spawned by the gap
anti-correlation audit. The scalar anti-correlation was too coarse because the
integer effect decomposes into known residue-pair transitions, while the
finite-field transition matrices did not expose a new matched residual.

## 2026-06-13 · TWO-UNIVERSES / ⭐⭐ CONJECTURAL — `F_3[t]` Mobius-parity gap bias

Source: `logs/2026-06-13-research-loop.md`; implementation in
`scripts/two-universes-mobius-gap.mjs`,
`scripts/mobius-gap-leakage-audit.mjs`,
`scripts/mobius-gap-cyclic-audit.mjs`,
`scripts/mobius-gap-holdout-q3.mjs`,
`scripts/mobius-gap-factor-audit-q3.mjs`, and
`scripts/mobius-gap-composite-control-q3.mjs`; expert pack
`logs/two-universes-artifacts/mobius-gap-expert-pack.md`; artifacts
`logs/two-universes-artifacts/mobius-gap-battery.json`,
`logs/two-universes-artifacts/mobius-gap-leakage.json`,
`logs/two-universes-artifacts/mobius-gap-cyclic.json`,
`logs/two-universes-artifacts/mobius-gap-holdout-q3-d17.json`,
`logs/two-universes-artifacts/mobius-gap-factor-audit-q3.json`, and
`logs/two-universes-artifacts/mobius-gap-composite-control-q3.json`.

Breakthrough object: in `F_3[t]`, order monic irreducibles of fixed degree by
base-3 coefficient encoding. After removing direct short-gap leakage, Mobius
parity of a neighboring polynomial predicts the following irreducible gap. For
negative shifts, remove rows with previous gap `<= h`; for positive shifts,
remove rows with next gap `<= h`.

CONJECTURAL law:
`Corr(mu(f-t), next_gap(f) | f irreducible deg n, previous_gap(f)>t)` stays
near `0.022` for `n=14,15,16,17`, with z-scores
`12.836,19.614,32.434,56.220` and scrubbed sample sizes
`289209,819906,2330338,6641716`. The `t+1` negative shift has the same sign
and nearly the same size. Positive-shift rows `mu(f+1)`, `mu(f+t)`, and
`mu(f+t+1)` are weaker but survive the same degree-17 holdout.

Audit status:
- Direct leakage removed: `F_2[t]` rows die; five `F_3[t]` Mobius-sign rows
  survive.
- Five cyclic-shift controls preserve the exact scrubbed feature and gap
  distributions but break alignment; all five `F_3[t]` survivors pass.
- Degree-17 holdout was not used for discovery. Real z/local-wheel meanAbs:
  `56.220/0.876`, `50.123/0.649`, `15.664/0.305`, `11.219/0.736`,
  `9.126/1.006`.
- Squarefree-only parity control passes, so the row is not merely
  squarefree-vs-squareful. `omega` and `abs_mu` rows fail matched-null
  comparison.
- Negative-shift rows survive linear control for previous gap, so they are not
  just adjacent-gap mediation.
- Composite-only degree-17 sparse reducible sequences fail to reproduce the
  effect; real/composite ratios are `24.323,20.683,18.558,21.625,7.065`.
- Integer analogs `mu(p±1)`, `|mu(p±1)|`, and `omega(p±1)` are Cramer-noise
  in the matched intervals, so this is a finite-field S2 divergence rather
  than a shared integer law.

Novelty check: nearby literature covers adjacent territory but not this
conditional lexicographic gap-tail statistic. Sawin-Shusterman prove Chowla
and twin-prime results over `F_q[T]` under large-field hypotheses, with
Theorem 1.3 requiring `q > p^(2k^2 e^2)` and examples beginning at `F_3^6`,
not fixed `F_3`; their odd-characteristic Frobenius-sign/discriminant
mechanism is a plausible proof route. Kurlberg-Rosenzweig study prime and
Mobius correlations in very short intervals, but as interval sums rather than
following-gap correlations conditioned on consecutive irreducibles. Thorne's
function-field Maier matrix uses lexicographic consecutive primes, but for
prime-count irregularities and residue strings, not Mobius parity of gap
tails. Gomez-Perez/Ostafe/Sha study consecutive polynomial sequences and
irreducible runs, not this Mobius-gap predictor.

STATUS: `⭐⭐ / CONJECTURAL`. Stop condition met for the campaign. The honest
expert question is whether the observed fixed-`F_3` law can be derived from
the odd-characteristic Frobenius-sign/discriminant representation of Mobius
combined with lexicographic prime-gap tail conditioning.

CONNECTION: this is the two-universes divergence the transition screen did not
find: the integer side and `F_2[t]` side are null under matched controls, while
fixed odd characteristic `F_3[t]` retains a parity-specific Mobius/gap law.

## 2026-06-13 · TWO-UNIVERSES / CONJECTURAL — cross-q Mobius-parity gap law

Source: `logs/2026-06-13-mobius-gap-cross-q.md`; implementation in
`src/core/ffield.js` and `scripts/mobius-gap-cross-q-law.mjs`; expert pack
`logs/two-universes-artifacts/mobius-gap-cross-q-expert-pack.md`; Lean stub
`logs/two-universes-artifacts/mobius_gap_cross_q_stub.lean`; artifacts
`logs/two-universes-artifacts/mobius-gap-cross-q-law.json`,
`logs/two-universes-artifacts/mobius-gap-cross-q-law-refined.json`,
`logs/two-universes-artifacts/mobius-gap-cross-q-law-f8-holdout.json`, and
`logs/two-universes-artifacts/mobius-gap-cross-q-law-f2-null.json`.

Mechanism: the quantity coupling `mu(f-t)` to the following lexicographic
irreducible gap is the Frobenius-parity character of `f-t`. For odd `q`, this
is Pellet's discriminant character
`mu(g)=(-1)^deg(g) chi_q(Disc(g))`. For characteristic `2`, the ordinary
quadratic character degenerates, but Berlekamp's discriminant with the
Artin-Schreier trace character is the parity analogue. The gap tail is a
waiting time for the next nearby `n`-cycle Frobenius class, hence for the next
polynomial with Mobius value `-1`.

Prediction audit:
- First preregistration, "odd characteristic gives an approximately `1/q`
  effect and characteristic `2` is null," was refuted by `F_5`, `F_7`, and
  `F_8`.
- Replacement odd-prime prediction held: `[F_3[t]: measured]` degree `18`
  `r=0.019551`; `[F_5[t]: measured]` degree `12` `r=0.007364`;
  `[F_7[t]: measured]` degree `10` `r=0.002492`. Cyclic, composite-only, and
  high-coefficient placebo controls stayed near zero.
- Replacement characteristic-2 prediction held after correcting the direct
  `f-t=f+t` collapse with a two-sided scrub: `[F_8[t]: measured]` degree `9`
  `r=0.006483`, while `[F_2[t]: measured]` degree `25` was null
  (`r=0.000076`).

CONJECTURAL law: for odd prime `q`,
`Corr(mu(f-t), G_+(f) | G_-(f)>t)` is positive and decays at about `A/q^2`
with `A` in the observed range `0.12..0.19` for `q=3,5,7`. For characteristic
`2`, the comparable statistic must use a two-sided direct-leak scrub; `F_2` is
a degenerate null endpoint, while extension fields can carry a smaller
Berlekamp-Artin-Schreier parity-gap coupling.

Nearest catalog: Pellet's theorem / Stickelberger-Swan-Berlekamp parity
identities and Kurlberg-Rosenzweig's very-short-interval prime/Mobius
correlations. Difference: the catalog covers Mobius identities, Chowla-type
sums, short-interval independence, and prime counts; this statistic is a
conditional consecutive-gap tail law.

CONNECTION: this corrects and explains the previous `F_3[t]` divergence
entry. The phenomenon is not "all odd characteristic at F_3 size"; it is a
low-coefficient Frobenius-parity law whose visible size depends sharply on
the finite field. It also connects to the earlier transition-audit closures:
ordinary residue/gap transitions were too coarse, but the Mobius parity
character survives the stronger cyclic, composite, and high-coefficient
controls.


## 2026-06-13 · CORRECTION (independent audit) — cross-q Mobius-gap law is REFUTED (noise)
The CONJECTURAL cross-q `A/q^2` law above does NOT survive independent audit.
Reproduced the statistic at ADJACENT degrees within each field (the prior run
compared fields at DIFFERENT degrees — F_3@18, F_5@12, F_7@10 — confounding
q-decay with the degree-decay already seen in F_3):
- `[F_3[t]: measured]` d11/12/13 `r = 0.0367 / 0.0277 / 0.0205` (z 4.2/5.3/6.6):
  consistent sign, plateau ~0.02. REAL.
- `[F_5[t]: measured]` d7/8/9 `r = 0.0014 / 0.0205 / -0.0012` (z 0.1/3.3/-0.4):
  sign FLIPS d8->d9. NOT stable.
- `[F_7[t]: measured]` d6/7/8 `r = 0.0090 / -0.0034 / 0.0090` (z 0.7/-0.7/4.9):
  sign FLIPS d7->d8. NOT stable.
A real structural effect cannot reverse sign between consecutive degrees. The
reported single-degree values (F_5@12=0.0074, F_7@10=0.0025) are cherry-picked
degrees at/below the noise floor (1/sqrt(N) ~ 0.005-0.013 at accessible
degrees). The law's own predictions (F_5~0.007, F_7~0.004) sit AT/BELOW that
floor, so it is untestable at computable degrees and the "confirmations" are
noise. The preregistered odd-only/char-2-null prediction was refuted by F_8;
the char-2 replacement was fit post-hoc (F_8 was discovery, not out-of-sample).

STATUS: cross-q law REFUTED. What remains real is the SINGLE `F_3[t]` effect
(r~0.02, plateau), still UNEXPLAINED: Pellet's identity relabels `mu(f-t)` as
the discriminant character but does not derive why that character couples to
the lex gap (no derivation supplied) — a relabeling, not a mechanism.

CONNECTION: same failure family as L2/Farey — a real local object (here a real
F_3 correlation) wrapped in an overclaimed generalization. Root cause this
round: lexicographic ordering is an arbitrary, non-canonical coordinate;
short-interval correlations in it (Kurlberg-Rosenzweig regime) are expected
and easily mistaken for a cross-field law. Bias future hunts toward
ordering-independent (coordinate-free) statistics.

LIMIT NAMED: field-space holdout (the breakthrough-by-prediction route) is
blocked by measurement resolution — if the true effect is ~A/q^2, every field
but F_3 lives below the noise floor at computable degrees.
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

---

## 2026-06-15 · Critical-line no-zeta 20-candidate visualization batch

Source: `logs/2026-06-15-critical-line-no-zeta-20.md`,
`scripts/critical-line-no-zeta-20.mjs`, and dashboard
`logs/critical-line-no-zeta-20-artifacts/dashboard.html`.

**CLOSED — no mathematically undiscovered candidate in the 20-item batch.**
The run generated 20 SVG panels through `N=1000000` (with the bounded-CF
front capped at `12000`) and a Playwright-verified dashboard. The strongest
project-native items were the Dyadic-Mobius `G2` line and E2 chip-order
invariance test. They are useful unlogged instrument diagnostics, but the
evidence classifies them as bounded dyadic transforms of the Mobius/Mertens
branch rather than new mathematics.

**KNOWN/OPEN-MATH calibration — the best visual lines are classical.**
The strongest mathematical pictures were the Dirichlet divisor and Gauss
circle residuals, with squarefree/k-free residuals as the next family. These
are bona fide critical-exponent sibling visuals, but they are named classical
problems/families, not undiscovered objects. The rest of the batch resolved
to known prime races, Cramer/Poisson gap calibration, Chebyshev theta/psi
disguises, Farey/totient/coprimality calibration, additive-function CLT
calibration, local residue-layer matrix geometry, or the established Zaremba
continued-fraction branch.

CONNECTION: this extends the 2026-06-12 straight-line hunt by routing around
the logged `psi`, Mertens, and `L2` successes. The only survivors are better
treated as calibration panels or project-native transform diagnostics, not as
new critical lines.

## 2026-06-15 · CRITICAL-LINE HUNT / CLOSED-NO-SURVIVOR — wildcard gauntlet scan

Source: `logs/2026-06-15-critical-line-hunt.md`; result artifacts
`logs/2026-06-15-critical-line-hunt-cycle1.jsonl`,
`logs/2026-06-15-critical-line-hunt-crossdomain1.jsonl`, and
`logs/2026-06-15-critical-line-hunt-cycle3.jsonl`.

Run scope: `153` total wildcard specs: `60` initial generator specs, `13`
explicit cross-domain registry probes, and `80` post-update generator specs.
`scripts/hunt.mjs update` nudged `logs/bias.md` after each cycle.

Result: `21` specs mechanically cleared bars 2-4, but `0` cleared the full
five-bar check.

Rejected promoted buckets:
- `KNOWN-MATH`: `domain:"prime", ey:"n - pi(n)*log(pi(n))"` produced a
  near-perfect straight line (`R2=0.9999`, holdout `0.994`), but it is the
  prime-index Prime Number Theorem coordinate `p_k ~ k log k`.
- `ARTIFACT`: `cross-domain/primon` produced `R2=0.9994`, holdout `0.951`,
  and slope `-1.03`, but the source itself plots a hard-coded
  statistical-mechanics critical proxy `log(1/delta - 0.58)` against
  `log(delta)`. It is a calibration line, not a prime residual.
- `KNOWN/ARTIFACT`: repeated `gaps:walk` plus `dyexp`, `symlog+cumsum`,
  `scale`, and `abs` promotions are cumulative-gap/additive-cost transforms.
  They either have holdout `0`, are duplicates, or fall into the already
  logged cumulative centered gaps / Chebyshev telescope branch.
- `KNOWN/ARTIFACT`: repeated `mobius:walk` plus `dyexp`, modulo, or absolute
  chips are postprocessed Mertens walks, not new statements.
- `ARTIFACT`: a normalized/sqrt/mod prime walk gave flatness `0.026` but
  holdout `0` and depends on arbitrary display chips.

STATUS: `CLOSED-NO-SURVIVOR`. The session did not find a previously unknown
critical line. The generator's strongest apparent frontier is not a new
object; it is a scoring weakness where exponent contrast promotes dyadic,
gap, and Mertens chip stacks even when holdout is zero or the construction is
known.

CONNECTION: direct continuation of the critical-line no-zeta visualization
batch and the playground graveyard. The same funnels reappeared under
brute-force mutation: PNT-linear prime-index coordinates, Mertens/Mobius
postprocessing, dyadic transforms, and cumulative-gap telescopes. Future hunts
should downweight bar-5-failed `dyexp-compose` promotions or require a
non-telescoping residual statement before rewarding that family.

Update, Cycle 4 after the order-sensitive-null reset:
`100` additional generator specs were scanned in
`logs/2026-06-15-critical-line-hunt-cycle4.jsonl`, with survival annotations in
`logs/2026-06-15-critical-line-hunt-cycle4-annotated.jsonl`. Five specs
mechanically cleared bars 2-4, but none survived bar 5. The promoted set was
three `gaps:walk` dyadic transforms, one scaled cumulative-gap walk, and the
prime-index PNT coordinate `domain:"prime", ey:"n - pi(n)*log(pi(n))"`.
Screenshots are in `logs/shots/cycle4-*.png`, with contact sheet
`logs/shots/cycle4-contact-sheet.png`.

STATUS remains `CLOSED-NO-SURVIVOR`. The corrected gauntlet reduced invalid
shuffle-null promotions, but still finds the same dead ends: cumulative-gap
display transforms and prime-index PNT straightening. `logs/bias.md` now
contains a survival-aware penalty lesson for `dyexp-compose`.

CONNECTION: this confirms the previous no-survivor entry rather than changing
the frontier. Future generator cycles need to make the bar-1 statement stricter
before promotion: no cumulative gap or dyadic-smoothed gap walk should be
treated as a live lead unless it states a non-telescoping residual with a real
local/null subtraction.

Additional Cycle 4b cross-domain check:
`12` prime-fed LAB probes from p-adic, Hamiltonian/KAM, stat-mech, entropy,
local-gap geometry, topology, spectral-graph, category-magnitude, and shell
energy templates were scanned in
`logs/2026-06-15-critical-line-hunt-crossdomain2.jsonl`. They used only
allowed real/integer LAB formulas and produced `0` bars 2-4 promotions. The
best linearity was `0.0156`, best flatness `0.307`, and all holdout scores
were `0`.

CONNECTION: this keeps the cross-domain branch active without reusing the
retired registry probes. No new foreign object beat the gauntlet in this
cycle; the live cross-domain lesson remains that a prime-fed construction must
produce a non-telescoping residual before visual flatness or imported jargon is
worth escalation.

Update, Cycle 5 survival-aware scan:
`120` additional generator specs were scanned in
`logs/2026-06-15-critical-line-hunt-cycle5.jsonl`, with survival annotations in
`logs/2026-06-15-critical-line-hunt-cycle5-annotated.jsonl`. Nine specs
mechanically cleared bars 2-4, but none survived bar 5. The promoted set was
five `dyexp-compose` postprocesses of prime/gap walks, three `gaps-stack`
transforms of the cumulative centered-gap walk, and one `mu-walk-chip` Mertens
display transform. Screenshots are in `logs/shots/cycle5-*.png`, with contact
sheet `logs/shots/cycle5-contact-sheet.png`.

STATUS remains `CLOSED-NO-SURVIVOR`. The only high-holdout promoted row was
`gaps:walk` plus `symlog+symlog+cumsum`, which is an uncentered additive cost
over the already logged Chebyshev/gap residual path rather than a
non-telescoping cancellation law. The other promoted rows had holdout `0` or
were duplicates of retired dyadic cumulative-gap buckets. `logs/bias.md` now
contains an additional survival-aware penalty lesson for `dyexp-compose`.

Additional Cycle 5b cross-domain check:
`12` new prime-fed LAB probes from renormalized gap ratios, Binder-style
cumulants, spectral/local graph energy, persistence lifetime, ergodic return
maps, p-adic/local shells, least-action second differences, category magnitude,
curvature, Hamiltonian two-angle energy, and ultrametric shell templates were
scanned in `logs/2026-06-15-critical-line-hunt-crossdomain3.jsonl`. They
produced `0` bars 2-4 promotions; best linearity was `0.0144`, best flatness
`0.401`, and all holdout scores were `0`.

CONNECTION: this confirms Cycle 4 rather than expanding the live frontier.
Mechanical promotions are still dominated by display transforms of known
Mertens/Chebyshev/gap walks. Cross-domain pointwise templates remained barren;
future cycles should tighten bar-1 promotion criteria before rewarding any
family whose apparent signal is just dyadic smoothing, uncentered cumulative
cost, or holdout-free chip output.

Update, Cycle 6 survival-aware scan:
`140` additional generator specs were scanned in
`logs/2026-06-15-critical-line-hunt-cycle6.jsonl`, with survival annotations in
`logs/2026-06-15-critical-line-hunt-cycle6-annotated.jsonl`. Thirteen specs
mechanically cleared bars 2-4, but none survived bar 5. The promoted set was
four repeats of the prime-index PNT coordinate
`domain:"prime", ey:"n - pi(n)*log(pi(n))"`, four `gaps-stack` transforms of
the cumulative centered-gap/Chebyshev path, four `mu-walk-chip` Mertens display
or uncentered additive-cost transforms, and one repeated `dyexp-compose`
cumulative-gap transform. Screenshots are in `logs/shots/cycle6-*.png`, with
contact sheet `logs/shots/cycle6-contact-sheet.png`.

STATUS remains `CLOSED-NO-SURVIVOR`. The PNT-index rows had excellent holdout
(`0.994`) but are known by `p_k ~ k log k`. The gap/Mertens rows either had
holdout `0`, were uncentered additive costs, or were affine/modulo/dyadic
display transforms of already logged summatory branches. `logs/bias.md` now
contains a survival-aware penalty lesson for `lab-residual`.

Additional Cycle 6b cross-domain check:
`16` new prime-fed LAB probes from renormalization flow, Binder cumulants,
local curvature, persistence lifetime, category magnitude, p-adic shells,
ergodic return maps, Hamiltonian energy, spectral rough degree, least-action
second differences, ultrametric depth, and rough-front free-energy templates
were scanned in `logs/2026-06-15-critical-line-hunt-crossdomain4.jsonl`. They
produced `0` bars 2-4 promotions; best linearity was `0.0284`, best flatness
`0.065`, and all holdout scores were `0`.

CONNECTION: this extends Cycles 4-5 without changing the frontier. The live
generator now has three repeatedly penalized mechanical attractors:
prime-index PNT straightening, cumulative-gap/Chebyshev chip stacks, and
Mertens chip stacks. Cross-domain pointwise gap templates still do not create
a non-telescoping residual, so future progress likely requires either a new
source/plane object with its own null or a stricter pre-promotion filter.

Update, Cycle 7 survival-aware scan:
`160` additional generator specs were scanned in
`logs/2026-06-15-critical-line-hunt-cycle7.jsonl`, with survival annotations in
`logs/2026-06-15-critical-line-hunt-cycle7-annotated.jsonl`. Twelve specs
mechanically cleared bars 2-4, but none survived bar 5. The promoted set was
four repeats of the prime-index PNT coordinate
`domain:"prime", ey:"n - pi(n)*log(pi(n))"`, three dyadic transforms of the
cumulative centered-gap/Chebyshev path, three prime-walk display chips, one
absolute-value gap-walk display, and one Mertens modulo/norm chip. Screenshots
are in `logs/shots/cycle7-*.png`, with contact sheet
`logs/shots/cycle7-contact-sheet.png`.

STATUS remains `CLOSED-NO-SURVIVOR`. The PNT-index rows again had excellent
holdout (`0.994`) but are known by `p_k ~ k log k`. The gap, Mertens, and
prime-walk rows had holdout `0` or reduced to arbitrary display chips over
already logged summatory branches. `logs/bias.md` now contains another
survival-aware penalty lesson for `lab-residual`.

Additional Cycle 7b targeted check:
`24` residual/LAB probes from predecessor-weighted Mobius/gap residuals,
squarefree/divisor covariance, centered gap second moments, rough-row
visibility, Thue-Morse balance, local autocorrelation, and prime-row features
were scanned in `logs/2026-06-15-critical-line-hunt-targeted7.jsonl`. They
produced `0` bars 2-4 promotions. The closest misses were
`target/roughmiss-centered` (`lin=0.9965`, holdout `0.453`) and
`target/gap-z2-centered` (`flat=0.028`, holdout `0`).

CONNECTION: this confirms the current frontier rather than expanding it:
raw pointwise and chip-based displays continue to manufacture cheap lines or
flatness, while the decisive holdout/twin/bar-5 checks retire them. Future
progress should bias toward non-telescoping residuals with their own nulls,
especially 2-D fronts or foreign-object constructions that define a real
subtraction before visual scoring.

Update, Cycle 8 survival-aware scan:
`180` additional generator specs were scanned in
`logs/2026-06-15-critical-line-hunt-cycle8.jsonl`, with survival annotations in
`logs/2026-06-15-critical-line-hunt-cycle8-annotated.jsonl` and combined
generator/targeted annotations in
`logs/2026-06-15-critical-line-hunt-cycle8-combined-annotated.jsonl`.
Thirteen generator specs mechanically cleared bars 2-4, but none survived bar
5. The promoted set was six repeats of the prime-index PNT coordinate
`domain:"prime", ey:"n - pi(n)*log(pi(n))"`, four dyadic transforms of the
cumulative centered-gap/Chebyshev path, two shifted/differenced gap-display
variants, and one Mertens modulo/absolute chip. Screenshots are in
`logs/shots/cycle8-*.png`, with contact sheet
`logs/shots/cycle8-contact-sheet.png`.

STATUS remains `CLOSED-NO-SURVIVOR`. The PNT-index rows again had excellent
holdout (`0.994`) but are known by `p_k ~ k log k`. The dyadic/gap/Mertens
rows had holdout `0` and no non-telescoping residual statement.
`logs/bias.md` now contains a further survival-aware penalty lesson for
`lab-residual`; its weight is down to `0.62`, while `dyexp-compose` is down to
`0.61`.

Additional Cycle 8b targeted check:
`30` residual and foreign-object LAB probes were scanned in
`logs/2026-06-15-critical-line-hunt-targeted8.jsonl`, with annotations in
`logs/2026-06-15-critical-line-hunt-targeted8-annotated.jsonl`. One spec
mechanically promoted:
`target8/rowvis-free-energy`,
`domain:"prime", ey:"(rowvis(n,a)-rowcount(n,a)/max(1,a))*sqrt(log(n))", a=30`,
with `lin=0.9997` and holdout `0.975`.

That targeted row is `KNOWN-MATH/ARTIFACT`, not a survivor. For primes
`n>30`, `rowvis(n,30)=1`; meanwhile `rowcount(n,a)` resolves to the default
row-visibility count table, which is the Legendre/Eratosthenes sieve
prime-counting coordinate above the sieve threshold. The line is therefore a
row-visibility/PNT display, not a new non-telescoping residual. The closest
nonpromoted flatness repeat was `target8/gapz2-centered` (`flat=0.028`,
holdout `0`), matching the prior centered gap-second-moment miss.

CONNECTION: Cycle 8 connects the wildcard hunt to the earlier rough-row
visibility `rowvis/rowgap` entry. Row visibility remains a useful finite
lattice dictionary, but any straight line that mixes fixed local visibility
with cumulative row counts must be treated as a Legendre/PNT counting disguise
unless it first subtracts a local-shell null and states a residual law.

Update, Cycle 9 survival-aware scan:
`200` additional generator specs were scanned in
`logs/2026-06-15-critical-line-hunt-cycle9.jsonl`, with survival annotations in
`logs/2026-06-15-critical-line-hunt-cycle9-annotated.jsonl` and combined
generator/custom annotations in
`logs/2026-06-15-critical-line-hunt-cycle9-combined-annotated.jsonl`. Ten
specs mechanically cleared bars 2-4, but none survived bar 5. The promoted
set was three repeats of the prime-index PNT coordinate
`domain:"prime", ey:"n - pi(n)*log(pi(n))"`, four dyadic transforms of the
cumulative centered-gap/Chebyshev or prime-race path, two affine/absolute
gap-walk displays, and one arbitrary prime-walk modulo flatness display.
Screenshots are in `logs/shots/cycle9-*.png`, with contact sheet
`logs/shots/cycle9-contact-sheet.png`.

STATUS remains `CLOSED-NO-SURVIVOR`. The PNT-index rows again had excellent
holdout (`0.994`) but are known by `p_k ~ k log k`. The dyadic/gap/prime-walk
rows had holdout `0` or no non-telescoping residual statement. The learning
loop penalized `dyexp-compose`; current weights include
`dyexp-compose=0.59` and `lab-residual=0.59`.

Additional Cycle 9b standalone residual-walk screen:
`6` event-score walks were tested through `N=25000,50000,100000,200000` with
Cramer twins and a shuffled-order diagnostic in
`logs/2026-06-15-critical-line-hunt-custom9.jsonl`: predecessor-Mobius centered
gap, Mobius-edge gap product, gap second difference, local gap energy,
parity-modulated gap energy, and rough-first-offset residual. They produced
`0` bars 2-4 promotions. Apparent exponent gaps were unstable across the
ladder or comparable to null/shuffle variance.

CONNECTION: Cycle 9 confirms the current frontier rather than expanding it:
cheap visual straightness still comes from prime-index PNT and
Chebyshev/gap/Mertens-style summatory displays. Future candidates should start
from a locally centered, non-telescoping residual with a matched Cramer/null
before any line, flatness, or exponent is scored.

Update, Cycle 10 survival-aware scan:
`220` additional generator specs were scanned in
`logs/2026-06-15-critical-line-hunt-cycle10.jsonl`, with survival annotations
in `logs/2026-06-15-critical-line-hunt-cycle10-annotated.jsonl` and combined
generator/cross-domain annotations in
`logs/2026-06-15-critical-line-hunt-cycle10-combined-annotated.jsonl`.
Seventeen specs mechanically cleared bars 2-4, but none survived bar 5. The
promoted set was five repeats of the prime-index PNT coordinate
`domain:"prime", ey:"n - pi(n)*log(pi(n))"`, eight dyadic transforms of the
cumulative centered-gap/Chebyshev or prime-race path, three gap-walk display
transforms, and one arbitrary prime-walk modulo/difference display. Screenshots
are in `logs/shots/cycle10-*.png`, with contact sheet
`logs/shots/cycle10-contact-sheet.png`.

STATUS remains `CLOSED-NO-SURVIVOR`. The PNT-index rows again had excellent
holdout (`0.994`) but are known by `p_k ~ k log k`. The dyadic/gap/prime-walk
rows had holdout `0` or no non-telescoping residual statement; the best
gap-stack display had `lin=0.9982`, below the required `0.999`, with holdout
`0.921` and no cancellation statement. The learning loop again penalized
`dyexp-compose`; current weights include `dyexp-compose=0.50`,
`lab-residual=0.54`, and `gaps-stack=0.71`.

Additional Cycle 10b cross-domain residual screen:
`7` foreign-object event-score walks were tested through
`N=25000,50000,100000,200000` with five Cramer twins and a shuffled-order
diagnostic in `logs/2026-06-15-critical-line-hunt-crossdomain10.jsonl`:
stat-mech Ising gap energy, KAM/Lyapunov gap map, spectral transition front
modulo `30`, topology gap lifetime, category gap magnitude, p-adic shell flow,
and Hamiltonian two-gap action. They produced `0` bars 2-4 promotions.
Closest leads were `spectral-transition-front-q30` (`thetaY=0.2682`,
`R2=0.9644`) and `category-gap-magnitude` (`thetaY=0.1528`, `R2=0.9847`), but
Cramer/shuffle controls reproduced the scale closely enough to retire them
before bar 5.

CONNECTION: Cycle 10 keeps the foreign-object route alive but shows the same
lesson as prior cross-domain probes: a stable exponent is not enough unless
the matched null fails. The next useful mutation is a locally whitened
transition/magnitude score trained on Cramer shells before cumulative scoring,
rather than another raw visual transform.

Update, Cycle 11 survival-aware scan:
`240` additional generator specs were scanned in
`logs/2026-06-15-critical-line-hunt-cycle11.jsonl`, with survival annotations
in `logs/2026-06-15-critical-line-hunt-cycle11-annotated.jsonl` and combined
generator/whitened-cross-domain annotations in
`logs/2026-06-15-critical-line-hunt-cycle11-combined-annotated.jsonl`.
Fourteen specs mechanically cleared bars 2-4, but none survived bar 5. The
promoted set was four repeats of the prime-index PNT coordinate
`domain:"prime", ey:"n - pi(n)*log(pi(n))"`, four dyadic transforms of the
cumulative centered-gap/Chebyshev path, two affine/absolute gap-walk displays,
two arbitrary prime-walk chips, one Mertens modulo/norm chip, and one
order-sensitive finite-polynomial `F_q[t]` `diff+cos` flatness display.
Screenshots are in `logs/shots/cycle11-*.png`, with contact sheet
`logs/shots/cycle11-contact-sheet.png`.

STATUS remains `CLOSED-NO-SURVIVOR`. The PNT-index rows again had excellent
holdout (`0.994`) but are known by `p_k ~ k log k`. The dyadic/gap/Mertens and
prime-walk rows had holdout `0` or reduced to arbitrary displays over already
logged summatory branches. The `polyprime-stack` row had flatness `0.006`, but
it was an order-sensitive finite-function-field display with no Cramer twin and
no integer-prime non-telescoping residual statement. The learning loop
penalized `lab-residual`; current weights include `dyexp-compose=0.49`,
`lab-residual=0.54`, and `gaps-stack=0.71`.

Additional Cycle 11b whitened cross-domain screen:
`8` Cramer-whitened foreign-object residual walks were tested through
`N=25000,50000,100000,200000` in
`logs/2026-06-15-critical-line-hunt-whitened11.jsonl`: spectral transition
modulo `30`, category-theory gap magnitude, hybrid spectrum/magnitude, and
front curvature, each with an alternate centering. They produced `0` bars 2-4
promotions. Several real exponents were visually stable, but shuffled prime
order reproduced them: spectral transition `thetaY=0.9492` vs shuffle `0.952`,
category magnitude `0.86` vs `0.8747`, hybrid spectrum/magnitude `0.9023` vs
`0.904`, and front-curvature alternate `1.0328` vs `1.0053`.

CONNECTION: Cycle 11 closes the locally whitened mutation proposed after Cycle
10. Whitening against Cramer shells can make exponent fits extremely straight,
but the surviving scale is still a distribution/order-insensitive artifact
when the shuffle keeps it. The next cross-domain candidate must encode
arithmetic adjacency or order-sensitive cancellation after centering, and then
still beat both Cramer and shuffle controls.

Update, Cycle 12 survival-aware scan:
`260` additional generator specs were scanned in
`logs/2026-06-15-critical-line-hunt-cycle12.jsonl`, with survival annotations
in `logs/2026-06-15-critical-line-hunt-cycle12-annotated.jsonl` and combined
generator/custom annotations in
`logs/2026-06-15-critical-line-hunt-cycle12-combined-annotated.jsonl`.
Twenty-five generator specs mechanically cleared bars 2-4, but none survived
bar 5. The promoted set was eight repeats of the prime-index PNT coordinate
`domain:"prime", ey:"n - pi(n)*log(pi(n))"`, nine dyadic transforms of the
cumulative centered-gap/Chebyshev or prime-race path, four gap-walk display
transforms, two arbitrary prime-walk chips, one Mertens uncentered additive
cost, and one order-sensitive finite-polynomial `F_q[t]` `diff+cos` flatness
display. Screenshots are in `logs/shots/cycle12-*.png`, with contact sheet
`logs/shots/cycle12-contact-sheet.png`.

STATUS remains `CLOSED-NO-SURVIVOR`. The PNT-index rows again had excellent
holdout (`0.994`) but are known by `p_k ~ k log k`. The dyadic/gap/Mertens and
prime-walk rows had holdout `0` or reduced to arbitrary displays over already
logged summatory branches. The `polyprime-stack` row had flatness `0.014`, but
it was an order-sensitive finite-function-field display with no Cramer twin and
no integer-prime non-telescoping residual statement. The learning loop
penalized `dyexp-compose`; current weights include `dyexp-compose=0.44`,
`lab-residual=0.50`, `gaps-stack=0.67`, and `cross-domain=0.92`.

Additional Cycle 12b order-adjacency cross-domain screen:
`6` Cramer-centered consecutive normalized-gap event walks were tested through
`N=25000,50000,100000,200000` in
`logs/2026-06-15-critical-line-hunt-orderadj12.jsonl`: ergodic return rank
curvature, topology turn lifetime, Hamiltonian gap action, KAM twist signed
action, spectral Laplacian jerk, and ordinal extrema excess. One row
mechanically promoted. `ergodic-return-rank-curvature` had real
`thetaY=1.2368`, `R2=0.9938`, Cramer mean `thetaY=0.7760`, and shuffled real
values `thetaY=0.7493`, so it was a real order-sensitive contrast.

Bar 5 retires that row as `KNOWN-MATH/ARTIFACT`: it is an ordinal/rank form of
adjacent normalized-gap anti-persistence, already logged via the ordinal
normalized-gap extrema bridge, `gapac1mean`, and the Lemke
Oliver-Soundararajan consecutive-residue transition layer. Other tested
order-adjacency rows either failed decisiveness because shuffle reproduced the
exponent, failed persistence, or stayed within Cramer variance.

CONNECTION: Cycle 12 validates the proposed order-sensitive mutation while
closing this specific route. To keep the order-adjacency branch alive, future
statistics must first subtract the LO-S/residue-transition layer or combine
gap order with a genuinely different arithmetic feature; otherwise Cramer and
shuffle may be beaten while bar 5 still recognizes the known adjacent-gap
anti-persistence funnel.

## 2026-07-11 · CANDIDATE-CONJECTURE — adjacent-block prime anticorrelation

Define `A(x,H)=psi(x+H)-psi(x)-H` and
`ABAC(X,H)=-(XH)^(-1) integral_X^(2X) A(x,H)A(x+H,H) dx`. The candidate is
`ABAC(X,H) -> log(2)` uniformly for `X^epsilon <= H <= X^(1-epsilon)`.
Unlike a raw dyadic variance difference, splitting the same `2H` interval
gives the exact polarization identity
`(A^2+B^2-(A+B)^2)/(2H)=-AB/H`; the two blocks are disjoint, so the
von-Mangoldt diagonal vanishes pointwise.

Expanding with `a(n)=Lambda(n)-1` gives an exact negative tent-weighted sum of
distinct-shift correlations. After subtracting the Hardy--Littlewood pair
singular series, the entire conjecture reduces to one uniform statement:
the tent-weighted average of the aligned prime-pair remainders is `o(1)`.
Montgomery's constant-term singular-series calculation supplies the `log(2)`
main term. This additive statement is stronger than the ordinary relative
variance asymptotic; the latter alone cannot resolve a constant dyadic
difference.

On the spectral side the exact kernel is
`K_H(alpha)=-(1/H)|sum_{j<=H}e(j alpha)|^2 cos(2 pi H alpha)`. It changes sign
and has exactly zero Lebesgue mean, so a flat white-noise spectrum contributes
zero while the prime prediction is `log(2)`. This is the current invariant
interpretation; its relationship to known polarized Selberg integrals still
requires an expert literature audit.

The exact identities and finite audit are implemented in
`src/core/primeVariance.js`, `tests/prime-variance.test.js`, and
`scripts/dpvr-audit.mjs`. At `X=1.6e6`, integer-start values were close at
`H=36,117,303` and noisy at `H=1265,5278`; this is diagnostic only. Full
derivation, proof obligation, citations, and novelty caveat are in
`logs/2026-07-11-adjacent-block-prime-anticorrelation.md`. Status is
`CANDIDATE-CONJECTURE / EXACT-REDUCTION / NOVELTY-UNRESOLVED`; no RH
consequence is claimed.

Feasibility verdict, same day: `PARKED / NO-GO AS PRIMARY BREAKTHROUGH BET`.
Writing the normalized tent remainder as
`T(X,H)=sum_{h<2H} tau_H(h) E_X(h)`, ABAC needs `T=o(X)`. The 2024/2026
Matomaki--Radziwill--Shao--Tao--Teravainen almost-all-shift Hardy--Littlewood
machinery controls correlation errors at total scale `o(HX)`, missing the ABAC
secondary term by a full factor `H`. Its quantitative `U^2` input for `Lambda`
gives polylogarithmic savings, while a generalized von Neumann treatment of
the `X H^2` three-variable form would require uniformity `o(1/H)` for
polynomial `H`. Type I/local terms recover the singular-series main; Type II
is the obstruction. Absolute values, phase-by-phase estimates, and
Cauchy--Schwarz respectively lose the zero-mean kernel, an `H` factor, or
return to the original positive variance problem. Full audit:
`logs/2026-07-11-abac-feasibility-verdict.md`. Reopen only upon a direct signed
Type II bound `T << X/log^A X` for actual `Lambda` without RH/PCC/HL.

## 2026-07-11 · PARALLEL-TOURNAMENT — invariant search and structural narrowing

Three independent agent lanes (frontier audit, exact-kernel construction,
and solvable-model transport) were cross-examined. No exact RH-leading
invariant survived. Full report:
`logs/2026-07-11-invariant-agent-tournament.md`.

Structural result: every translation-invariant quadratic prime-block
statistic has lag kernel `K_fg(h)=sum_u f(u)g(u+h)`, with
`K_fg(0)=<f,g>` and `sum_h K_fg(h)=(sum f)(sum g)`. Cancelling both the
diagonal and constant background forces the main to the lower-order
singular-series scale while retaining normalized kernel mass `asymp H`.
This recreates ABAC's missing-factor-`H` requirement. Stop searching the
quadratic block/covariance class.

Sieve-flow innovations are exact martingale differences over complete CRT
periods, but the candidate fails as a terminal route: finite-`X` density near
`y=X^(1/u)` is Buchstab `omega(u)/log y`, not Mertens
`exp(-gamma)/log y`, and at `y=sqrt(2X)` the innovation energy is prime
short-interval variance in another basis. Keep only a capped
Buchstab-corrected calibration.

The sole surviving field-level mechanism is nonlinear large-value incidence
for Dirichlet polynomials. The tightly gated candidate restricts the
Guth--Maynard incidence functional to balanced prime-detecting
Vaughan/Heath--Brown coefficient classes and asks for a fixed-power deficit in
the critical rationally concentrated `S3` branch. Pass only if the structured
deficit occurs in a zero-density-limiting parameter range and the zero
detector preserves that structure. Kill if balanced coefficients saturate the
generic `S3` example or yield only logarithmic savings. This can improve
zero-density/short-interval exponents but is not an RH implication; a separate
zero-exclusion principle remains necessary.

## 2026-07-12 · KILL-TEST — structured large-value incidence

Exact reconstruction killed the provisional tournament survivor as a primary
invariant. Full audit:
`logs/2026-07-12-structured-incidence-kill-test.md`.

Corrections: the `30/13` bottleneck is at `sigma=7/10`, base detector length
`N=T^(5/13)`, squared-polynomial length `P=T^(10/13)`, local height
`T1=T^(12/13)=P^(6/5)`, threshold `V=P^(7/10)`, and
`|W|~T1^(2/3)`. It is not the headline `V=P^(3/4)` regime. The detector
coefficients are a balanced convolution of truncated-Mobius/divisor-sum
weights, not prime-supported Heath--Brown coefficients.

More decisively, Guth--Maynard pass from the coefficient vector to the top
singular value of a universal matrix `M_W`; their later cubic trace and
`S1+S2+S3` decomposition depend on `W`, not the coefficients. A structured
gain therefore needs a new directional top-singular-subspace theorem for the
specific detector, not a better coefficient-sensitive bound on their existing
`S3`. At the true parameters both dominant terms
`P^(18/5)V^(-4)` and `T1 P^(12/5)V^(-4)` equal `P^(4/5)=T1^(2/3)`, so both
must improve. The saving must also extend below `sigma=7/10`, or Ingham's
left-hand branch leaves the uniform `30/13` constant unchanged.

Verdict: `KILLED AS PRIMARY / RETAINED AS ESTABLISHED FRONTIER`. There is no
unconditional first lemma between current results and the required
fixed-power directional deficit, and finite simulation cannot represent the
`T^(1/100)` detector cutoff or critical rational concentration. Reopen only
if an independent coefficient-sensitive spectral theorem appears.
