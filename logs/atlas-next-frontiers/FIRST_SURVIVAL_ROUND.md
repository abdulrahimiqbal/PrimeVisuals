# First survival round — three redesigned frontiers

Date: 2026-07-12

> **Superseded outcome:** the later full-degree test killed the sole parked
> Maynard mechanism as a privileged breakthrough route. See
> [BREAKTHROUGH_GATE.md](./free-boundary-maynard-49/BREAKTHROUGH_GATE.md).
> The historical first-round classification below is retained to show how the
> candidate advanced and then failed.

## Portfolio verdict

**No field-level theorem has been proved. One concrete mechanism survives in
parked form; one proposed mechanism is killed; one canonical conjecture is
parked after its proposed mechanism failed.**

| Frontier | Mathematical target | Frozen mechanism | Portfolio state |
| --- | --- | --- | --- |
| Free-boundary Maynard 49 | Open and consequence-changing | Exact boundary gain and orbit-compressed inactive-chamber correction survive; naive cell tensor dies on scale | **PARK — sole live mechanism** |
| Signed Type-II packet dispersion | Open; ABAC target retained | Local zero-mode subtraction plus sum-before-norm fails the target residual and large-cutoff sensitivity gates | **KILL mechanism** |
| Frobenius prime correspondence | Known Jones/Silverman--Stange fixed-curve conjecture | Twist concentration/amplification fails parity and de-averaging | **PARK target; mechanism failed** |

The word “survives” therefore has a narrow meaning here. It does not mean a
new theorem. It means a specific next lemma remains both logically relevant
and unrefuted after the frozen hostile controls.

## 1. Free-boundary Maynard 49

Verdict: [PARK; target and compressed mechanism survive](./free-boundary-maynard-49/VERDICT.md).

The exact `k=2`, `epsilon=1/2` control separates the boundary mechanism from a
basis illusion. The global space has quotient below `1.641`, while the integer
boundary-enriched vector `(-1000,462,384)` has exact quotient

`138736208/80929935 = 1.714275539699865...`.

The general inactive-chamber lemma explains the gain: removing a chamber that
is invisible to every `J_i` leaves the numerator unchanged and strictly lowers
the denominator whenever the witness has mass there. At `k=49`, permutation
symmetry reduces the first cut arrangement to at most 50 orbits.

The naive full degree-27 polynomial basis on every orbit is killed: 126,300
variables and 118.85 GiB for one dense floating matrix. The surviving route is
only the central inactive-chamber correction to the 2,526-dimensional global
signature basis. It remains parked because the cited published `k=50`
coefficient payload is unavailable and the repo has not independently
reconstructed the `M_(50,1/25)>4.0043` calibration.

Reopen gate: reproduce that exact `k=50` calibration, implement the rational
orbit-counted correction, demonstrate material gain at `k=50`, and only then
attempt an exact `M_(49,epsilon)>4` certificate.

## 2. Signed Type-II packet dispersion

Verdict: [KILL the proposed mechanism; retain the theorem target](./signed-type-ii-packet/VERDICT.md).

The periodic local model has exact zero Fourier coefficient, but this means it
cannot algebraically cancel the nonzero finite mean of `Lambda-1`. The frozen
literal divisor control `d_2-log` retains a mechanism-sized
`(2 gamma)^2 XH` mean term and is not the divisor-polynomial approximant used
in the primary literature.

More decisively, the theorem-relevant residual `aa-a_11#a_11#` has fitted
signed-versus-absolute H-exponent gains `-1.058`, `-0.500`, and `-0.256` on
the three frozen paths. All nine sensitivity fits with `z>=11` are negative.
The finite Vaughan coefficients do not saturate the generic projected
operator, so coefficient-sensitive estimates are not ruled out, but that is
too weak to rescue the proposed factor-H story.

Reopen gate: explicitly isolate and bound the prime zero mode, use the actual
`d_2#` calibration, freeze `B`, `z`, and smoothing, then prove an analytic
balanced Type-II H-gain that survives local subtraction on two independent
scale blocks.

## 3. Frobenius prime correspondence

Verdict: [PARK at parity and de-averaging](./frobenius-prime-graph/VERDICT.md).

The object is not Atlas-new: elliptic amicable pairs and the finite Frobenius
graph are already in the Silverman--Stange/Jones theory. The implementation
nevertheless passes its exact calibration: it reconstructs
`C_(E0,2)=0.07709328077956204`, recovers the first published pair
`(1622311,1622471)`, and recognizes a non-CM zero-constant control whose finite
graph forbids return.

The proposed path fails. It supplies no estimate that distinguishes prime
group order from semiprime order. In the frozen 34-twist panel, ten nonzero
counts are copies of one unique pair, the zero fraction is `0.7059`, and
`variance/mean^2=2.4`; this is shared-event correlation, not concentration.

Reopen gate: a prime-sensitive lower-bound or bilinear family lemma plus a
correctly normalized second moment with a power-saving off-diagonal strong
enough to imply `Var=o(mean^2)`.

## What the Atlas learned

The redesigned portfolio was less shortsighted than the previous five because
the negative runs separated targets from mechanisms. The Maynard target keeps
one exact low-rank route; Type-II loses a mechanism without falsely refuting
its theorem; Frobenius keeps a canonical conjecture while dropping a novelty
and amplification claim.

Current research allocation: **one live mechanism out of three**, with the
next compute budget going only to the `k=50` signature calibration. Neither of
the other two should receive a larger empirical scan until its named analytic
reopen lemmas exist.

## Reproduction

```bash
node scripts/signed-type-ii-packet-audit.mjs
node scripts/frobenius-prime-graph-audit.mjs
npm test -- --run tests/free-boundary-maynard.test.js tests/signed-type-ii-packet.test.js tests/frobenius-prime-graph.test.js tests/maynard-variational.test.js
```

Focused result: 4 files, 22 tests, all passed.
