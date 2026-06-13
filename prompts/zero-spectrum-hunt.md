# GOAL: prime spectroscopy — recover the zeros from raw primes, then point the instrument at sets that have no known spectrum

Read MACHINE_HOW_TO_USE.md and KNOWLEDGE.md first. Create `logs/<today>-zero-spectrum-hunt.md`;
append-only; ⭐-flag findings the moment you see them.

## Why this can matter

ψ(x) − x is a sum of waves 2√x·cos(γ_k·log x + φ_k)/|ρ_k| whose frequencies
γ_k are the Riemann zeros. The zeros are therefore a *measurable spectrum
inside the primes*. Phase A proves you can measure it. Phase C points the
same spectrometer at prime families with NO known L-function — twin primes
and primes of the form n²+1. Nobody can predict their fluctuation spectra;
even proving these sets are infinite is open. A reproducible discrete
spectrum there, surviving every control, would be a genuinely new
observation. That is the bar. It is high; expect to miss it and say so.

## Phase A — calibration (sharp, checkable)

1. Compute F(x) = ψ(x) − x from raw primes (`primePowersUpTo`/`sieve` in
   src/core/math.js). NO `zeta` calls, no ZEROS data in the computation.
   Write `scripts/spectrum.mjs` with tests.
2. Resample g(u) = F(e^u)/e^(u/2) on a uniform grid in u = log x, over
   u ∈ [log 10^4, log 10^7] (extend toward 10^8 with a segmented sieve if
   memory allows — more range = sharper peaks).
3. Windowed DFT (Hann); detect peaks.

SUCCESS CRITERION: the first ≥ 20 peak frequencies match the bundled ZEROS
table (used ONLY as ground truth for checking) within the frequency
resolution Δγ ≈ 2π/(u_max − u_min) ≈ 0.9. Report matched / missed /
spurious counts. If Phase A fails, debug it; do
not proceed.

## Phase B — controls

- Cramér twin: identical pipeline on `cramerPrimes(N, seed)` for ≥ 5 seeds
  → must yield flat noise with no peak stable across seeds.
- Window shift: real peaks stay put when the u-range shifts; leakage moves.
- Amplitude check: peak heights should fall off roughly like 1/|ρ_k|.

## Phase C — the hunt (where new math could live)

Apply the identical spectrometer to residuals of counting functions with no
known governing L-function:

1. **Twin primes**: T(x) = Σ_{p ≤ x, p+2 prime} log p. Main term: fit
   c·x/log x (Hardy–Littlewood shape) empirically and document the fit.
2. **Primes of the form n²+1**: same treatment.
3. For each: first find the right normalization exponent for the residual
   (the θ such that residual/x^θ is bounded — that exponent is itself a
   reportable measurement), then ask: does the normalized residual show
   DISCRETE, stable peaks in log-frequency?

Label the mundane explanations BEFORE claiming anything: inherited ζ-zero
peaks (these sets are subsets of primes — cross-check every peak against
ZEROS), residue-class artifacts (cross-check against the α-peak catalog in
KNOWLEDGE.md), windowing leakage.

BREAKTHROUGH BAR — all four required: a peak that (i) persists and
*sharpens* at 2× and 4× range, (ii) is absent from the seed-averaged
Cramér analog of the same construction, (iii) matches no γ_k and no
rational/residue frequency, (iv) survives window shifts. If all four hold:
mark ⭐⭐, state it as a precise conjecture (frequency ± resolution,
normalization exponent, range tested), take a `shot` of it, and stop to
report rather than embellishing.

## Honesty

Remember the Mertens lesson in KNOWLEDGE.md: 10^7 of clean data once
supported a false conjecture. Finite-range spectra are evidence, never
proof. The likely honest outcome of Phase C is "inherited ζ structure plus
noise" — log it as such; the ranked graveyard is a valid deliverable.

## Deliverables

1. `scripts/spectrum.mjs` + tests.
2. The log file.
3. KNOWLEDGE.md entries with CONNECTION lines (Phase A connects directly
   to the existing ψ(x) entry; Phase C peaks, if any, connect to the
   residue catalog).
4. Final report: Phase A match table, control results, Phase C verdict per
   family with links and screenshots, and the single most interesting open
   question to seed the next run.
