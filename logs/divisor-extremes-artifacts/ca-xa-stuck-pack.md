# CA-XA Focused STUCK PACK

Source artifact: `/Users/rahim/Downloads/PrimeVisuals/logs/divisor-extremes-artifacts/ca-xa-transitions.json`

## Trigger

The same derivation gap has persisted through HANDOFF 26, HANDOFF 27, and HANDOFF 28: the bridge and dictionary are exact, but the global theorem that would turn the numerical prime pattern into a completed reformulation is still missing.

## Exact Gap

Let `H = CA ∩ XA`. Between consecutive `H` records, follow the consecutive CA endpoint chain. For a new-frontier CA step `C -> C*p`, the exact losing boundary is the real root `Pcrit(C,0)`, and the checked root-free replacement is

```text
P2(C) = A(C)/W(A(C)) + (log log(C) log(A(C)/W(A(C)))) / (2(log(A(C)/W(A(C)))+1)),
A(C) = log(C) log log(C).
```

The unresolved theorem is:

```text
Conjecture A. Runs of consecutive new-frontier CA steps with p > P2(C) are uniformly bounded.
Conjecture B. Every such run has uniformly bounded recovery in sigma(n)/(n log log n), allowing both later below-P2 new-frontier steps and old-exponent CA steps.
Conditional theorem. A+B imply a uniform bound for skipped CA endpoints and skipped frontier primes between consecutive H records.
```

The parseable Lean shell is `logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean`; its theorem `bounded_CA_XA_skips_from_recovery` is still closed by `sorry`.

## What Was Tried

1. Exact divisor-world bridge. `CA`, `XA`, and `H` are defined without a primality test, and Nazardonyavi-Yakubovich give the RH bridge through infinitely many `XA` and `CA ∩ XA` endpoints.
2. Endpoint closure. Lemma 21 closes every scanned non-CA `XA` record at the next CA endpoint: `0` closure failures in `194` non-CA `XA` records after `10080`.
3. Exact local dictionary. The `Pcrit(C,0)` classifier and `P2(C)` replacement have zero sign mismatches in the real scan and in all fixed-shape Cramer controls.
4. Ordinary prime-gap input. Baker-Harman-Pintz `x^0.525` fits inside only `10` of `367` real `(frontier(C),P2(C)]` intervals and in `0` of the no-base cases. Dusart 2010 has `0` applicable frontiers in the scanned range.
5. Recovery decomposition. The real run at frontier `523` recovers through the old-exponent multiplier `31`, so a proof using only later below-`P2` new frontiers is insufficient.

## Evidence Snapshot

Real scan through A004394 rows `s1..s8,436`:

- XA records: 579
- CA records: 443
- CA-XA records: 384
- frontier-changing `H` transitions: 356
- skipped CA endpoints: 13
- max skipped CA endpoints in one transition: 5
- new-frontier CA steps after first `H`: 367
- no-base events `p>P2(C)`: 8
- no-base runs: 4
- max no-base run length: 3
- unrecovered real no-base runs: 0
- max total recovery steps: 6
- max extra recovery steps after a no-base block: 3
- deepest cumulative log margin: -0.000011776209093505

Real recovery paths:

- frontier 139: no-base 149; recovery 149, 151; extra steps 1; extra new-frontier steps 1; extra old-exponent steps 0
- frontier 523: no-base 541; recovery 541, 31; extra steps 1; extra new-frontier steps 0; extra old-exponent steps 1
- frontier 1,399: no-base 1409, 1423, 1427; recovery 1409, 1423, 1427, 1429, 1433, 1439; extra steps 3; extra new-frontier steps 3; extra old-exponent steps 0
- frontier 2,633: no-base 2647, 2657, 2659; recovery 2647, 2657, 2659, 2663, 2671, 2677; extra steps 3; extra new-frontier steps 3; extra old-exponent steps 0

Fixed-shape Cramer contrast:

- seed 12345: 195/264 no-base; max run 143; unrecovered 13; max recovery 10
- seed 271828: 47/126 no-base; max run 23; unrecovered 5; max recovery 0
- seed 314159: 0/140 no-base; max run 0; unrecovered 0; max recovery 0
- seed 161803: 127/271 no-base; max run 46; unrecovered 8; max recovery 108
- seed 424242: 0/222 no-base; max run 0; unrecovered 0; max recovery 0

## Minimal Expert Questions

1. Can CA epsilon spacing plus known or conjectural prime-gap input prove any uniform bound, or even a useful explicit bound, for consecutive new-frontier steps satisfying `p>P2(C)`?
2. If a no-base run occurs, can the cumulative log-height deficit be forced to recover in boundedly many CA steps when old-exponent multipliers are allowed?
3. Equivalently, for consecutive `H` records `A=C_0 < C_1 < ... < C_t=B` inside the CA endpoint chain, can one bound `t` from the CA parameterization and the record inequality `sigma(C_i)/(C_i log log C_i) <= sigma(A)/(A log log A)` for `0<i<t`?

## Expert Answer That Would Move The Goal

A useful answer is one of:

- a proof of Conjecture A and Conjecture B;
- a weaker explicit bound that still gives a quantitative skipped-frontier theorem;
- a counterexample mechanism showing that uniform boundedness is the wrong target and suggesting the correct growth scale.

## Status

OPEN / CONJECTURAL. This pack is a trigger for expert mathematical input, not a completion certificate.
