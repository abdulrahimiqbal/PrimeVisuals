# CA-XA Phase-4 Expert Pack

Source artifact: `/Users/rahim/Downloads/PrimeVisuals/logs/divisor-extremes-artifacts/ca-xa-transitions.json`

## Object

`H = CA-XA`, the intersection of colossally abundant numbers and extremely abundant records, is a divisor-world object. Its definition uses divisor sums and record/extremal conditions, not primality tests, `mu`, `Lambda`, or prime-indexed sums. Prime structure enters only through the CA endpoint theorem and the factorization of CA endpoints.

## Bridge Status

Known bridge: RH implies infinitely many `CA-XA` endpoints by Nazardonyavi-Yakubovich, and infinitely many `CA-XA` endpoints imply infinitely many XA records, hence RH. Lemma 21 gives the closure rule used here: a non-CA XA record between consecutive CA numbers forces the next CA endpoint to be XA. The new prime-pattern theorem below is still CONJECTURAL.

## Factor Check

No Dirichlet-series multiplier is being introduced. The object is an extremal divisor-record sequence, so the L2 failure mode of a catalog RH object multiplied by a zero-free bounded factor does not apply.

## Dictionary

For a new-frontier CA step `C -> C*p`, define

```text
A(C)  = log(C) log log(C)
P0(C) = A(C) / W(A(C))
P2(C) = P0(C) + (log log(C) log(P0(C))) / (2(log(P0(C))+1)).
```

The artifact verifies that the exact losing condition is equivalently:

```text
p > Pcrit(C,0)
<=> F(p,1) < F(Pcrit(C,0),1)
```

and that the root-free diagnostic

```text
p > P2(C)
```

has zero sign mismatches in the checked range.

## Lean-Stub-Ready Statements

Standalone parseable Lean 4 stub: `logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean`.

```lean
def is_CA (n : Nat) : Prop := sorry
def is_XA (n : Nat) : Prop := sorry
def H (n : Nat) : Prop := is_CA n /\ is_XA n

def F (x : Real) (k : Nat) : Real := sorry
def P0 (C : Nat) : Real := sorry
def P2 (C : Nat) : Real := sorry

def ca_frontier (C : Nat) : Nat := sorry
def next_ca_prime_step (C D : Nat) (p : Nat) : Prop := sorry
def no_base_step (C D : Nat) (p : Nat) : Prop :=
  next_ca_prime_step C D p /\ (p : Real) > P2 C

def recovery_path (steps : List Nat) : Prop := sorry
```

```lean
-- CONJECTURE A: no-base runs are uniformly bounded.
axiom bounded_no_base_runs :
  exists B : Nat, forall run, is_no_base_run run -> run.length <= B

-- CONJECTURE B: every no-base run has uniformly bounded recovery.
axiom bounded_no_base_recovery :
  exists R : Nat, forall run, is_no_base_run run -> exists path,
    recovery_path path /\ path.length <= R

-- CONDITIONAL THEOREM: A+B bound skipped CA endpoints and skipped frontier primes.
theorem bounded_CA_XA_skips_from_recovery :
  bounded_no_base_runs -> bounded_no_base_recovery ->
  exists K : Nat, forall A B, consecutive_H A B ->
    skipped_CA_endpoints A B <= K /\ skipped_frontier_primes A B <= K := by
  sorry
```

## Numerical Evidence

Real scan through A004394 rows `s1..s8,436`:

- XA records: 579
- CA records: 443
- CA-XA records: 384
- non-CA XA closure failures: 0
- new-frontier CA steps after the first CA-XA record: 367
- root-free no-base events `p>P2(C)`: 8
- no-base run count: 4
- maximum no-base run length: 3
- unrecovered real no-base runs: 0
- maximum total steps to recovery: 6
- maximum extra steps after a no-base block: 3
- deepest cumulative log margin: -0.000011776209093505
- exact-boundary mismatches: 0

Recovery paths:

- frontier 139: no-base primes 149; recovery path 149, 151; extra steps 1
- frontier 523: no-base primes 541; recovery path 541, 31; extra steps 1
- frontier 1,399: no-base primes 1409, 1423, 1427; recovery path 1409, 1423, 1427, 1429, 1433, 1439; extra steps 3
- frontier 2,633: no-base primes 2647, 2657, 2659; recovery path 2647, 2657, 2659, 2663, 2671, 2677; extra steps 3

Fixed-shape Cramer contrast:

- seed 12345: 195/264 no-base; max run 143; unrecovered 13; max recovery steps 10
- seed 271828: 47/126 no-base; max run 23; unrecovered 5; max recovery steps 0
- seed 314159: 0/140 no-base; max run 0; unrecovered 0; max recovery steps 0
- seed 161803: 127/271 no-base; max run 46; unrecovered 8; max recovery steps 108
- seed 424242: 0/222 no-base; max run 0; unrecovered 0; max recovery steps 0

## Nulls

Ordinary prime-gap bounds do not currently close the theorem. In this scan, the Baker-Harman-Pintz `x^0.525` scale fits inside only 10 of 367 real `(frontier,P2]` intervals and in 0 of the no-base cases. Dusart 2010 has 0 applicable frontiers in this range.

## Status

OPEN / CONJECTURAL. The bridge and dictionary are exact, and the finite evidence is strong, but the global no-base-run and recovery bounds are not proved.
Focused stuck pack: `logs/divisor-extremes-artifacts/ca-xa-stuck-pack.md`.

## WHAT THIS TEACHES ABOUT PRIMES

The primes chosen by colossally abundant records are not free to drift arbitrarily: when the next prime jumps past the explicit threshold P2(C), the record height usually falls.
In the checked range, those jumps are rare, short, and quickly repaired by later prime choices or by increasing an older prime exponent.
The missing theorem is now concrete: prove that this jump-and-repair pattern must always stay bounded.
