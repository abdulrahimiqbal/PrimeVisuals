# Hard death certificate at N=8

A rational symmetric matrix `Y` separates the complete screw target
from every element of the frozen width-two SDP cone. All displayed
quantities were recomputed from the defining formulas using Arb balls;
the floating SDP was used only to discover `Y`.

- denominator of `Y`: `1000000`
- boundary margin: `[0.103972004484228888562150062781 +/- 3.83e-31]`
- target separation: `[-0.195376865458487614913624877847 +/- 3.51e-31]`
- certified: `YES`

## Edge margins

- p=2: `[0.177374498823506432359822455794 +/- 3.12e-31]`
- p=3: `[0.224252967819794121817094719081 +/- 3.76e-31]`
- p=5: `[0.170008874735548838175750930482 +/- 5.17e-32]`
- p=7: `[0.112415194439877454023693369933 +/- 1.29e-31]`

## Pair-block Sylvester certificates

- (2,3): leading minors `[0.177374498823506432359822455794 +/- 3.12e-31]`, `[0.0258555584675552122652104243574 +/- 9.29e-34]`, `[0.00348181151870950986872203751150 +/- 4.44e-33]`

Because the boundary and edge pairings are positive and each pair-block
adjoint is positive definite, `<Y,C> >= 0` for every cone element `C`.
The strictly negative target pairing therefore proves nonmembership.
This kills only the preregistered width-two grammar, not the divisor-cube
program, other local grammars, or RH.
