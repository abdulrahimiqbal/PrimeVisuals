/-
Mobius-gap cross-q conjecture stub.

This is a parseable Lean 4 skeleton for the empirical/conjectural law in
`mobius-gap-cross-q-expert-pack.md`. It intentionally contains no proof.
-/

structure FiniteFieldGapRun where
  q : Nat
  characteristic : Nat
  degree : Nat
  twoSidedScrub : Bool
  observedR_num : Int
  observedR_den : Nat

def observedR (run : FiniteFieldGapRun) : Rat :=
  (run.observedR_num : Rat) / (run.observedR_den : Rat)

def within (x lo hi : Rat) : Prop :=
  lo <= x ∧ x <= hi

def f3_degree18 : FiniteFieldGapRun where
  q := 3
  characteristic := 3
  degree := 18
  twoSidedScrub := false
  observedR_num := 19551
  observedR_den := 1000000

def f5_degree12 : FiniteFieldGapRun where
  q := 5
  characteristic := 5
  degree := 12
  twoSidedScrub := false
  observedR_num := 7364
  observedR_den := 1000000

def f7_degree10 : FiniteFieldGapRun where
  q := 7
  characteristic := 7
  degree := 10
  twoSidedScrub := false
  observedR_num := 2492
  observedR_den := 1000000

def f8_degree9_twosided : FiniteFieldGapRun where
  q := 8
  characteristic := 2
  degree := 9
  twoSidedScrub := true
  observedR_num := 6483
  observedR_den := 1000000

def f2_degree25_twosided : FiniteFieldGapRun where
  q := 2
  characteristic := 2
  degree := 25
  twoSidedScrub := true
  observedR_num := 76
  observedR_den := 1000000

/- The intended mathematical objects, left abstract in this stub. -/
axiom polynomial_over_finite_field : Nat -> Type
axiom frobenius_parity_character :
  (q : Nat) -> polynomial_over_finite_field q -> Int
axiom next_lex_irreducible_gap :
  (q : Nat) -> polynomial_over_finite_field q -> Nat
axiom previous_lex_irreducible_gap :
  (q : Nat) -> polynomial_over_finite_field q -> Nat
axiom mobius_gap_correlation :
  (q degree : Nat) -> (twoSidedScrub : Bool) -> Rat

/-
Conjectural law:
* odd q: the low-shift correlation is positive and decays at q^-2 scale;
* q = 2: the two-sided characteristic-2 row is null;
* q = 2^m, m >= 2: Berlekamp-Artin-Schreier parity can give a positive row.
-/
axiom odd_prime_q_squared_scale :
  ∃ A : Rat,
    within A ((12 : Rat) / 100) ((19 : Rat) / 100) ∧
    True

axiom f2_degenerate_null :
  within (mobius_gap_correlation 2 25 true)
    (-(3 : Rat) / 1000) ((3 : Rat) / 1000)

axiom f8_artin_schreier_positive :
  within (mobius_gap_correlation 8 9 true)
    ((4 : Rat) / 1000) ((9 : Rat) / 1000)
