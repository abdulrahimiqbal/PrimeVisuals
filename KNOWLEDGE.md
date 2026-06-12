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
