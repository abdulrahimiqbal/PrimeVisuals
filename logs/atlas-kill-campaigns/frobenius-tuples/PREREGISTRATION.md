# Preregistration: quadratic-Frobenius additive prime-pair race

Frozen before inspecting the new statistic's values. Existing repo cycles 002--005,
013--015, and 023 were read first; they are prior evidence, not holdout data for this
specific object.

## Question

Does a zero-mean Frobenius class function retain reproducible structure after one
conditions on an additive prime pair and removes the exact joint local expectation?

For an odd prime `ell`, let

`chi_ell(n) = (n/ell)`

be the quadratic character. It is the nontrivial character of
`Gal(Q(sqrt(D_ell))/Q)`, where `D_ell = ell` for `ell = 1 (mod 4)` and
`D_ell = -ell` for `ell = 3 (mod 4)`. For a fixed even shift `h`, define, over
unramified prime pairs,

`Y_ell,h(p) = chi_ell(p) chi_ell(p+h)`.

The exact conditional local mean is

`mu_ell(h) = average_{r mod ell: r(r+h) != 0} chi_ell(r)chi_ell(r+h)`.

Thus `mu_ell(h) = -1/(ell-2)` when `ell` does not divide `h`, and `1` when it
does. Every registered shift is coprime to every target `ell`, so no target cell
is degenerate. The centered residual is

`R_ell,h(X) = sum_{p <= X-h; p,p+h prime} (Y_ell,h(p)-mu_ell(h))`.

Its conditional-null z score is

`Z_ell,h(X) = R_ell,h(X) / sqrt(N_h(X) (1-mu_ell(h)^2))`,

where `N_h(X)` is the observed number of unramified pairs in that cell.
Centering by the observed pair count is deliberate: under the Hardy--Littlewood
prime-pair prediction, both the weighted and unweighted counts carry the same
pair singular series `S(h)`. Subtracting `mu_ell(h) N_h(X)` cancels it exactly,
including finite-range count error. The audit will nevertheless report
`N_h(X)/(S(h) integral_2^(X-h) dt/(log t log(t+h)))` as a calibration.

## Why this statement is between Chebotarev and full Hardy--Littlewood

The asymptotic assertion `R_ell,h(X)=o(N_h(X))`, when prime pairs are numerous,
is stronger than ordinary Chebotarev because labels are sampled only on the
additive constraint `p+h` prime. It is strictly weaker than the full
Hardy--Littlewood conjecture in arithmetic progressions: it neither supplies the
main term for `N_h(X)` nor implies that infinitely many such pairs exist. It is
also not fixed-field Chebotarev in a compositum, because `p+h` is a second
rational integer whose primality is not a Frobenius condition on `p` in any
fixed finite extension.

## Frozen family, shifts, and data split

- Target covers: `ell = [5, 7, 11, 13, 17, 19]`.
- Matched-cover controls: `ell = [23, 29, 31, 37, 41, 43]`.
- Discovery shifts: `h = [2, 6, 8, 12, 18, 24]`.
- Holdout shifts: `h = [32, 36, 46, 48, 54, 64]`.
- All shifts are even and coprime to all target and matched-cover moduli.
- Integer endpoints: `X = [1e6, 2e6, 4e6, 8e6]`.
- Range blocks: `(0,1e6]`, `(1e6,2e6]`, `(2e6,4e6]`, `(4e6,8e6]`, assigned
  by the upper prime `p+h`.
- Discovery data: target covers, discovery shifts, first two blocks (`<=2e6`).
- Confirmatory data: target covers, holdout shifts, last two blocks (`2e6..8e6`).
- No shift, cover, sign, endpoint, or statistic will be selected after seeing
  the new values.

## Registered summaries

For each cover/shift cohort and each cumulative endpoint or disjoint block:

- RMS of the cell z scores;
- maximum absolute cell z;
- Stouffer mean z (diagnostic only because cells are dependent);
- correlation and sign agreement between the `2e6..4e6` and `4e6..8e6`
  holdout cell profiles;
- Hardy--Littlewood pair-count calibration by shift.

The headline confirmatory object is the 36-cell vector on the six target covers
and six holdout shifts in each of the final two disjoint blocks. The earlier
blocks and discovery shifts may explain failures but cannot rescue the verdict.

## Frozen controls

Each stochastic control uses the fixed seeds
`[137,1009,7919,65537,104729,130363,196613,262147]` where applicable.

1. **Exact conditional local Monte Carlo:** retain every real cell's pair count
   and draw admissible residues modulo `ell`, hence exactly preserving
   `mu_ell(h)` and conditional variance.
2. **Cramer flags:** independent labels with probability `1/log n`; ramified
   pairs are excluded and exact `mu_ell(h)` is still subtracted.
3. **W-wheel flags:** labels sampled only among numbers coprime to
   `W=2*3*5*7*11*13*17*19`, with density corrected by `W/phi(W)`.
4. **W-wheel composite flags:** the same local eligibility and dyadic-bin
   density as real primes, but genuine primes are forbidden.
5. **Rough semiprime flags:** products of two primes greater than 19, sampled by
   dyadic bin to match the real-prime count.
6. **Balanced residue-class functions:** replace each Legendre sign table by a
   fixed-seed balanced permutation on nonzero residues, recomputing its exact
   pair-conditioned mean for every shift.
7. **Nearby quadratic covers:** the six frozen matched-cover moduli above.

Controls 2--5 test whether generic sparse/local/composite sets reproduce the
profile. Control 1 tests pure conditional fluctuation. Control 6 asks whether
the multiplicative character itself matters. Control 7 tests cover selection.

## Function-field control

If computationally feasible without introducing an arbitrary ordering, run the
same residue identity over `F_q[t]` as an exact local algebra check, not as an
integer-profile match. There is no canonical fixed integer shift `h` across
polynomial degrees, and an order-dependent substitute is forbidden. Failure to
run a canonical field statistic cannot promote the integer candidate.

## Kill and promotion rules

The candidate is killed unless all of the following hold:

1. direct enumeration validates every `mu_ell(h)` formula;
2. the final-block confirmatory RMS exceeds every frozen control-family
   envelope and the exact conditional Monte Carlo 99% envelope;
3. the two confirmatory block profiles have Pearson correlation at least `0.5`
   and sign agreement at least `2/3`;
4. the same direction is visible in matched covers or discovery shifts without
   post-selection;
5. a primary-source literature audit isolates a conjecture not already covered
   by Hardy--Littlewood/Bateman--Horn in progressions, Chebotarev in a fixed
   compositum, prime-pair race literature, or known lower-order biases; and
6. the result yields either a strict lemma or a quantitatively stated new
   conjecture with an identifiable proof obligation smaller than full
   Hardy--Littlewood.

A large isolated z score, a cumulative-only effect, ordinary pair-count excess,
or a residue bias reproduced by balanced functions/composites is a kill, not a
survivor.
