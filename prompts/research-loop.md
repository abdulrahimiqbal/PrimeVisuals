# STANDING GOAL: the research loop — answer the top open question, compound, repeat

You are not done after one finding. Run cycles until (a) a ⭐⭐ candidate
clears the breakthrough bar, or (b) the cycle budget is spent (default 6).
Read MACHINE_HOW_TO_USE.md and KNOWLEDGE.md first. One log file for the
whole loop: `logs/<today>-research-loop.md`, a section per cycle.

## The cycle

1. **Pick.** Rank every OPEN item in KNOWLEDGE.md by
   (chance of novelty × answerability here). Novelty heuristic: ψ(x),
   M(x), π(x), and twin counts are the most-studied objects in
   mathematics — re-measuring them scores near zero. Prefer statistics
   nobody computes: cross-correlations BETWEEN arithmetic functions (does
   μ(n) know anything about gap(n)? does ω(p−1) know about the gap after
   p?), conditional statistics (gaps after a quadratic residue vs after a
   non-residue), second-order and triple correlations, natural-but-odd
   subsets. Lemke Oliver–Soundararajan (2016) found new structure with
   tools no stronger than these by computing a simple statistic nobody
   had bothered to compute. That is your model.
2. **Design the decisive experiment first.** Before computing: state what
   outcome settles the question each way, the null model, and the
   threshold. Predeclare; then run.
3. **Answer it completely** in this cycle: computation, Cramér seeds
   (≥ 5), range doubling, window/holdout shifts, verdict. No "promising,
   needs follow-up" verdicts for anything answerable within the cycle.
4. **Append** the verdict to KNOWLEDGE.md (KNOWN-MATH / OBSERVED /
   CLOSED-ARTIFACT / NEW-OPEN) with CONNECTION lines.
5. **Spawn** at most 2 new OPEN questions, each with one line on why it
   could be new math. Then GOTO 1.

## Hard rules

- Never end a cycle with an answerable question unanswered. "Interesting
  next question" is the *input* to the next cycle, not the output of the
  run.
- **Fit main terms properly before measuring exponents.** A c·x/log x fit
  to a quantity whose true expansion carries x/log²x corrections produces
  a fake θ ≈ 0.7–0.9. Use numerically integrated (Li-type) main terms or
  two-term fits. Diagnostic: if the residual is monotone, your main term
  is wrong — that is fit error, not arithmetic.
- **Background-corrected peaks.** Spectra of cumulative residuals have
  colored (random-walk) backgrounds even for fake primes. Score peaks as
  height ÷ local spectral median, calibrated on ≥ 10 Cramér seeds, before
  calling anything a peak.
- **Escalation = stop.** A ⭐⭐ candidate (sharpens with range; absent in
  seed-averaged Cramér analog; matches no known γ_k, rational, or residue
  frequency; survives window shifts) ends the loop. Write the precise
  conjecture + full evidence pack into KNOWLEDGE.md, take `shot`s, and
  stop — the next step is human and expert review, not more cycles.
- Track elapsed time per cycle in the log.

## Cycle 1 is preassigned — close the two dangling questions

1. **Twin-prime θ re-measurement.** The recorded θ ≈ 0.696 is suspect:
   re-fit with the integrated Hardy–Littlewood main term (numerically
   integrate the log-weighted analog of 2C₂∫dt/log²t) and re-measure.
   Prediction to test: θ drops toward ~0.5, i.e. the 0.696 was main-term
   misfit. Either result closes the question; θ ≈ 0.5 for twins would be
   a clean measured fact worth its own KNOWLEDGE entry.
2. **The n²+1 γ ≈ 17.51 peak.** Re-test with the background-corrected
   peak statistic above across ≥ 10 Cramér-n²+1 seeds and a doubled
   segmented range. Verdict: CLOSED-ARTIFACT or survivor. If survivor,
   it inherits ⭐ and a designed follow-up in cycle 2.

Then continue the loop on whatever ranks highest.
