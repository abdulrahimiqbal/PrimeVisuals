/-
Farey reciprocal-product phase-4 theorem stub.

-- range 1,000..2,000: real 135/135 exact, Cramer average 0.383055
-- range 10,000..20,000: real 1,033/1,033 exact, Cramer average 0.311904
-/

namespace FareyProduct

opaque fareyRecipBaseSurplus : Nat -> Nat -> Int
opaque OddPrime : Nat -> Prop
opaque ceilEightThirds : Nat -> Nat

theorem prime_farey_surplus_spike_canyon
    (p : Nat) (hp : OddPrime p) :
    fareyRecipBaseSurplus p p = Int.ofNat (p - 1) ∧
    (∀ n : Nat, ceilEightThirds p ≤ n -> n ≤ 3 * p - 1 ->
      fareyRecipBaseSurplus p n < 0) ∧
    fareyRecipBaseSurplus p (3 * p - 1) = -Int.ofNat ((p - 1) / 2) := by
  sorry

end FareyProduct
