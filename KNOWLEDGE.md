# KNOWLEDGE — what this tool has established about the primes

The project's compounding memory. Agents: read this before starting any
goal; append after finishing one; never delete (corrections cite the entry
they correct). Classification: `KNOWN-MATH` (matches an established
theorem), `OBSERVED` (replicated here, unexplained in hand), `OPEN`
(question worth pursuing). See MACHINE_HOW_TO_USE.md for the rules.

---

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
