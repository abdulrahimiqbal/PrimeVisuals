# Derivations and round ledger

This file is append-only. Each round records the theorem target, semantic and
algebraic kill test, exact mathematical work, minimal proof obligation, and
promotion/kill decision.

## Round 1 — zero-density to exclusion

### Frozen theorem target

Show that one zero `rho=beta+i gamma`, `beta>1/2+delta`, forces enough
additional off-line zeros for a density theorem to exclude the original zero.

### Exact symmetry lemma

The identities `xi(s)=xi(1-s)` and
`xi(conj(s))=conj(xi(s))` preserve multiplicity and force only the quartet

`rho, conj(rho), 1-rho, 1-conj(rho)`.

At positive ordinate, only `beta+i gamma` lies to the right of
`1/2+delta`; symmetry creates no vertical population.

### Explicit countermodel

Fix `0<delta<a<1/2`, `b>0`, and
`R(T)=T/(2 pi) log(T/(2 pi e))`. For all sufficiently large integers `n`,
choose the unique `t_n` satisfying `R(t_n)=n` and put

`H(z)=prod_(n>=n0) (1+z^2/t_n^2)`.

Because `t_n` is asymptotic to `2 pi n/log n`, `sum t_n^(-2)` converges, so the
product converges locally uniformly to a real even entire function of order
one. Let

`Q_(a,b)(z)=(z^2-(a+ib)^2)(z^2-(a-ib)^2)`

and

`Xi_*(s)=C H(s-1/2) Q_(a,b)(s-1/2)`, `C` real and nonzero.

Then `Xi_*(1-s)=Xi_*(s)` and
`Xi_*(conj(s))=conj(Xi_*(s))`. Its zeros consist of the critical-line zeros
`1/2 +/- i t_n` and exactly one quartet `1/2 +/- a +/- ib`. Moreover its
positive-ordinate zero count is `R(T)+O(1)`, while for `T>=b` its count to the
right of `1/2+delta` is exactly one. Thus functional equation, conjugation,
finite order, and the Riemann--von Mangoldt leading count do not force the
desired amplification.

### Conditional recurrence lemma

Let a closed disk `D` around a positive-ordinate off-line zero lie in
`{1/2<sigma<Re(s)<1, Im(s)>0}` and contain no boundary zero. If the set of
nonnegative shifts `tau in [0,T]` for which

`sup_(s in boundary D) |zeta(s+i tau)-zeta(s)| < min_(boundary D)|zeta(s)|`

has measure at least `cT`, Rouché's theorem gives one zero in every translated
disk. A maximal `2r`-separated subset yields at least `cT/(4r)` disjoint disks,
so `N(sigma,T+O(1))` is at least a positive constant times `T`. This contradicts
any sublinear density estimate for fixed `sigma>1/2`.

Bagchi's theorem identifies global strong recurrence on every admissible
compact subset of the right half of the strip with RH; it does not say that
recurrence on this one selected circle is independently equivalent to RH. For
fixed `sigma`, a theorem supplying the circle recurrence around every zero to
the right of `sigma`, combined with Bohr--Landau `N(sigma,T)=o(T)`, proves that
half-plane zero-free; conversely the zero-free statement makes the conditional
amplification assertion vacuous. Thus the specially quantified fixed-`sigma`
input is equivalent to that fixed-`sigma` exclusion, and the family for every
`sigma>1/2` is RH-equivalent. It is not a weaker missing lemma.

### Decision

`KILLED` as an unconditional density-to-exclusion shortcut. Retain the
countermodel and Rouché lemma as exact calibration. Reopen only with a new
Euler-product mechanism not reducible to RH-equivalent recurrence.

## Round 2 — mollifier coercivity

### Frozen theorem target

Derive zero exclusion from a uniform positive boundary `L^2` bound for a
mollified analytic zero detector.

### Exact no-go lemma

Let `O` be a nonzero outer function in `H^2(D)` and let

`B(z)=prod_j ((|a_j|/a_j)(a_j-z)/(1-conj(a_j)z))`

be any finite Blaschke product (with the conventional factor omitted at
`a_j=0`). Then `F=BO` belongs to `H^2(D)`, has every prescribed `a_j` as a
zero, and

`|F(e^(i theta))|=|O(e^(i theta))|`

for almost every `theta`. Consequently, for every nonnegative measurable
boundary weight `w` for which the integral exists,

`integral w |F|^2 = integral w |O|^2`.

Proof: each Blaschke factor is analytic in the disk and has boundary modulus
one almost everywhere. A finite product is inner; multiplication by an inner
function is an isometry of `H^2`. The zero and weighted-modulus assertions are
then immediate.

### Consequence for the route

A coercive quantity depending only on boundary moduli of a mollified analytic
function cannot distinguish a zero-free function from one with arbitrary
finitely many interior zeros. Point evaluation lower bounds would distinguish
zeros, but proving such a lower bound on the zeta detector is the zero-free
claim itself. Mean-square information can contribute to density/proportion
theorems (as in Levinson--Conrey methods), but it cannot by this abstract
mechanism exclude an isolated off-line zero.

### Decision

`KILLED` as stated. Reopen only with phase/interior information or a
zeta-specific structural constraint that quantitatively rules out the inner
factor while being proved independently of zero exclusion. The lemma is
classical Hardy-space theory, not a new Class-D result.

## Round 3 — de Branges/canonical systems

### Frozen theorem target

Construct a zeta-native canonical system with independently proved positive
Hamiltonian and exact zero correspondence.

### Exact circularity lemmas

Put `Xi(z)=xi(1/2-iz)` and `F#(z)=conj(F(conj z))`. Functional equation and
reality give `Xi#=Xi`, so `Xi` itself cannot be Hermite--Biehler: the required
strict inequality `|E#(z)|<|E(z)|` in the upper half-plane is equality for
`Xi`.

If `Xi=A=(E+E#)/2` for a Hermite--Biehler `E`, then every zero of `Xi` is
real. Indeed, an upper-half-plane zero would give `E(z)=-E#(z)`, contradicting
strict Hermite--Biehler inequality; conjugation handles the lower half-plane.
Thus proving an exact-`Xi` companion Hermite--Biehler already proves RH.

A real pole/spectrum set alone also does not determine a canonical Hamiltonian.
For a discrete real set `lambda_n` and different positive summable weights
`w_n`, the Herglotz functions

`m_w(z)=a+bz+sum_n w_n(1/(lambda_n-z)-lambda_n/(1+lambda_n^2))`

have the same pole set but different norming data and hence different
trace-normalized Hamiltonians. Feeding all zeta ordinates as a real spectrum
assumes RH; feeding only verified zeros gives only that subset; feeding the
full xi-derived Weyl function requires first proving Herglotz/innerness.

For a positive canonical system, the Lagrange identity expresses the de
Branges kernel as an integral `int Y*HY`, after the terminal boundary term is
shown to vanish. With initial `A=Xi`, positivity and the terminal condition
therefore prove RH. Inverse spectral theory cannot be invoked first unless the
Hermite--Biehler/Herglotz property is already known.

### Strongest live coefficient-side formulation

Suzuki's Euler/gamma kernel gives unconditional local Fredholm invertibility
and an explicitly positive zeta-native diagonal Hamiltonian on a short time
interval for parameters `nu*omega>1`. The exact unresolved statement is
global: for a sequence `omega_n downarrow 0`, `nu_n omega_n>1`, prove

`det(1 +/- K_(omega_n,nu_n)[t]) != 0` for every `t>=0`

and terminal decay of the associated de Branges kernel as `t->infinity`,
using coefficient-side input and no zero-free/innerness/Weil-positivity
assumption. Suzuki's theorem makes that package RH-equivalent.

### Decision

`PARKED`. The inverse-spectral and zero-insertion shortcuts are killed as
circular or underdetermined. The zeta-native local Hamiltonian is legitimate,
but the global Fredholm--endpoint lemma is an exact RH-equivalent, not a proved
intermediate advance.

## Round 4 — Nyman--Beurling compactness

### Frozen theorem target

Force the Báez--Duarte approximation distance to zero by a scale-stable
compactness or coercivity principle not already equivalent to RH.

### Projection-limit theorem

Let `V_N` be nested closed finite-dimensional subspaces of a Hilbert space,
`V=closure(union V_N)`, `P_N` the orthogonal projections, and
`r_N=x-P_Nx`, `d_N=||r_N||`. Then

`P_Nx -> P_Vx`, `r_N -> P_(V_perp)x`, and
`d_N^2 downarrow ||P_(V_perp)x||^2`.

Indeed, for `M>N`, orthogonality gives
`||P_Mx-P_Nx||^2=||P_Mx||^2-||P_Nx||^2`. The bounded increasing norms make
`P_Nx` Cauchy; the limiting residual is orthogonal to every `V_N` and hence
to `V`. Thus strong convergence is automatic. Compactness cannot determine
whether the limiting residual is zero; in the Báez--Duarte space that assertion
is exactly the RH-equivalent closure condition.

### Innovation identity and counterexample

For the normalized new direction

`e_N=(I-P_(N-1))rho_N / ||(I-P_(N-1))rho_N||`,

one has exactly

`d_(N-1)^2-d_N^2=|<r_(N-1),e_N>|^2`.

Choose positive `g_n` asymptotic to `1/(n log^2 n)` with
`S=sum g_n<1`, put `B=1-S`, and in `ell^2({0,1,...})` take
`V_N=span(e_1,...,e_N)` and

`x=sqrt(B)e_0 + sum_(n>=2)sqrt(g_n)e_n`.

Then `d_N^2=B+sum_(n>N)g_n=B+Theta(1/log N)` and the innovations are
`g_N`, while `r_N` converges strongly to the nonzero vector `sqrt(B)e_0`.
Scale-stable innovations and norm precompactness therefore do not force a
zero limiting distance.

If `K` is compact on an infinite-dimensional residual subspace, it also cannot
supply coercivity `||w||<=c||Kw||`: an orthonormal weakly-null sequence is sent
to a norm-null sequence.

### Strongest surviving conditional target

The dyadic observability inequality

`d_(2N)^2 <= C log(N) (d_N^2-d_(2N)^2)`

would imply, on writing `a_k=d_(2^k)^2`, that
`a_(k+1)<=Ck log(2)/(1+Ck log(2)) a_k`, hence
`d_N^2 << (log N)^(-1/(C log 2))` and therefore RH. It is a legitimate
infinite-tail theorem, but no mechanism proves it and it is not known to be
weaker than RH. A log-free variant conflicts with Burnol's unconditional
`1/log N`-scale lower bound.

### Decision

`KILLED` as a compactness-first mechanism. The dyadic logarithmic observability
inequality is retained only as an RH-sufficient missing theorem. Reopen with a
target-specific noncompact observability mechanism, not finite innovations or
subsequence compactness.

## Round 5 — global multiscale Weil decomposition

### Frozen theorem target

Represent every localized Weil form by independently defined positive atoms
that are compatible under restriction and uniformly coercive as the support
and resolution grow.

### Exact semantic dichotomy

For a finite symmetric target matrix `Q`, allowing one unrestricted global
Gram atom makes the representation question tautological: `Q` has a
factorization `Q=R^T R` if and only if `Q` is positive semidefinite. Thus an
atom chosen from `Q` by Cholesky, spectral decomposition, or a fitted global
PSD block encodes the desired conclusion rather than explaining it.

At the other extreme, the repository's independently frozen flat width-two
prime-square atom cone is genuinely restrictive and is rigorously separated
from the `N=8` target by a rational dual witness with Arb-certified margins.
Adding an arbitrary global PSD remainder would erase that death certificate
only by reverting to the tautological case above.

Proof of the finite dichotomy: the forward direction is the definition of a
Gram matrix. For the reverse direction, the spectral theorem gives
`Q=U diag(lambda_i) U^T` with `lambda_i>=0`; take
`R=diag(sqrt(lambda_i))U^T`.

### Minimal proof obligation

A viable middle class must specify atoms independently of target positivity,
prove projective compatibility under every restriction map, reject the exact
`N=8` separator through a new structural identity rather than post-hoc fitting,
and supply a support-uniform lower bound permitting closure on the complete
Weil test space. No such atom class or compatibility theorem was constructed.

### Decision

`BLOCKED`. The bounded-local frozen grammar remains hard-killed; the
unrestricted-global grammar is circular. Reopen only with an independently
defined global arithmetic carrier and a proved restriction-compatible positive
form. This finite linear-algebra dichotomy is standard, not a Class-D theorem.

## Round 6 — Arithmetic Hodge effectivity

### Frozen theorem target

Construct an independently geometric positive polarization compatible with
finite-place restriction and global closure, rejecting the repository's
RH-false reciprocal controls.

### Finite-place positive transport theorem

Fix the Sonin cutoff `lambda`. Let `H=L^2(R,ds)`, let `M=M_lambda` be the
closed common Mellin-coordinate image of that classical Sonin space, and let
`P` be its orthogonal projection. For a finite set `F` of rational primes define

`d_F(s)=prod_(p in F)(1-p^(-1/2-is))`, `D_F=M_(d_F)`, and `M_F=D_F M`.

Set `m_F=prod_(p in F)(1-p^(-1/2))` and
`M_F^max=prod_(p in F)(1+p^(-1/2))`. Then
`0<m_F<=|d_F(s)|<=M_F^max`, so `D_F` is bounded and invertible. On `M`, put

`G_F=P D_F* D_F P|_M`.

The bounds `m_F^2 I<=G_F<=(M_F^max)^2 I` give an inverse, and the orthogonal
projection onto `M_F` is exactly

`P_F=D_F P G_F^(-1) P D_F*`.

Proof: `A_F=D_F P G_F^(-1/2):M->H` is an isometry with range `D_FM`; hence
`P_F=A_FA_F*`.

If `h` is bounded and `M_hP` is Hilbert--Schmidt (or, more generally, if the
closed product below is first proved Hilbert--Schmidt), commutativity of
multipliers gives

`T_F(h)=Tr(M_h P_F M_h*)=||M_hD_FPG_F^(-1/2)||_HS^2>=0`,

with comparison bounds obtained from `m_F` and `M_F^max`.

For `F subset F'` and `E=F' minus F`, the same formula relative to `P_F`
projects onto `D_E M_F=M_(F')`. The final orthogonal projection is independent
of the order in which primes are added because the final closed subspace is
the same and its orthogonal projection is unique. This does not prove that the
normalized isometries, metrics, or intermediate comparison maps are path-
independent; those can differ by a unitary cocycle.

### Scalar-normalized raw-multiplier obstruction

For `F_x={p:p<=x}`, divergence of `sum_p p^(-1/2)` and elementary logarithmic
bounds give

`m_(F_x)->0`, `M_(F_x)^max->infinity`, and
`M_(F_x)^max/m_(F_x)->infinity`.

These are the actual essential extrema, not merely crude bounds. Unique
factorization makes `{log p:p in F}` rationally independent; Kronecker density
makes `s -> (s log p mod 2pi)_(p in F)` dense in the finite torus. Hence
`||D_F||=M_F^max` and `||D_F^(-1)||=m_F^(-1)`.

The product `||c_xD_(F_x)|| ||(c_xD_(F_x))^(-1)||` is unchanged by every
nonzero scalar `c_x`. Thus no scalar normalization makes these transports
uniformly bounded and uniformly invertible on the fixed unweighted `L^2(ds)`
carrier. This rules out only the crude global passage by scalar-normalized raw
multiplier metric equivalence. It does not rule out convergence of `P_F` or
`T_F`, cancellation through `G_F^(-1)`, non-scalar renormalization, native
`F`-dependent norms, support-by-support estimates, or another completion. For
example, if `M=H`, every `P_F=I` although the raw multiplier condition numbers
diverge.

### Polarization discriminator and remaining gap

If a positive Hilbert carrier has a densely defined closed generator `Theta`
with `Theta^dagger=1-Theta` including equality of domains, then `Theta-1/2` is
skew-adjoint and its spectrum lies
on `1/2+iR`. This exactly rejects the reciprocal RH-false controls, but once
the spectrum is identified with zeta zeros it proves RH. The finite-place
Sonin trace does not provide an invariant domain for that generator, a
same-coordinate Weil comparison, or geometric effectivity.

### Decision

`PARKED / PARTIAL LEMMA PROVED`. Finite-place positive transport and final-
projection path independence hold unconditionally; only the scalar-normalized
raw-multiplier uniform-equivalence route to global closure is obstructed. The
viable next theorem is a finite-support geometric comparison
functor into the cyclic/Sonin carrier with a same-coordinate remainder identity,
domain invariance, and sign. No field-level consequence is obtained. The
finite-set formula is a standard operator-theoretic extension of published
semilocal stability; novelty is not claimed.

## Round 12 — broad finite-positivity no-go

### Frozen theorem target

Prove a natural approach-class obstruction strong enough for Class D, not just
a warning that one finite matrix proves nothing.

### Exact finite-information lemma

Let `H` be an infinite-dimensional Hilbert space, let `V` be any proper
finite-dimensional subspace, and let `Q:V->V` be positive semidefinite. There
exists a bounded self-adjoint operator `A` on `H` whose compression to `V` is
exactly `Q` but which is not positive on `H`.

Proof: write `H=V direct_sum V_perp` and set

`A = Q direct_sum (-I_(V_perp))`.

Then `P_V A|_V=Q`, while `<Aw,w>=-||w||^2<0` for every nonzero
`w in V_perp`. The same construction preserves any finite collection of
compression data by taking `V` to contain all tested ranges.

### Sharp scope

The lemma proves that no finite collection of PSD compressions, regardless of
precision, implies positivity of an otherwise unconstrained infinite operator.
It does not obstruct a compatible infinite family: if `V_N` is nested with
dense union and `<Av,v>>=0` for every `v in V_N`, then continuity of a bounded
self-adjoint `A` implies `<Av,v>>=0` for every `v in H`. For unbounded forms,
one additionally needs the form domain and closure theorem.

### Decision

`KILLED` as a Class-D candidate. The exact lemma is elementary and known; it
does not rule out the credible approach class that supplies projective
compatibility and closure. It only formalizes the repository's finite-to-
infinite promotion gate. A qualifying no-go would need a natural restriction
on all scales, not an unconstrained negative direct-sum extension.

## Round 10 — family zero-density transfer

### Frozen theorem target

Prove a family density theorem whose specialization strictly improves the
best individual bound for zeta zeros.

### Exact concentration lemma

Let `n_f>=0` be zero counts (or any nonnegative quantities) in a finite family
`F`, and suppose

`sum_(f in F) w_f n_f <= B`, with `w_f>=0`.

For a distinguished member `f_0` with `w_(f_0)>0`, positivity gives only

`n_(f_0) <= B/w_(f_0)`.

This is sharp under the stated information: take
`n_(f_0)=B/w_(f_0)` and every other `n_f=0`. In particular, a normalized
unweighted average at most `A` permits the distinguished count to be as large
as `|F|A`.

### Consequence for the route

Family averaging alone cannot give an individual zeta improvement. A viable
specialization needs an amplifier or positivity identity that assigns zeta a
weight comparable with the total family weight while keeping the analytic
error below the existing individual bound. That amplifier estimate, not the
family density theorem, is the new proof obligation. No such estimate was
obtained here.

### Decision

`BLOCKED`, not refuted. Family technology can create genuine theorems, but the
frozen implication chain omitted the indispensable individualizing amplifier.
Reopen with a precisely normalized amplifier and a proved saving after its
diagonal and off-diagonal costs are included. The concentration lemma is
elementary and not novel.

## Round 11 — nonlinear prime-block statistic

### Frozen theorem target

Use a cubic or higher block statistic to escape the repository's killed
translation-invariant quadratic class and prove a new RH-relevant prime
correlation theorem.

### Exact polynomial reduction

Let `a(n)=Lambda(n)-1`, let `f` have finite support, and define

`S_f(n)=sum_u f(u)a(n+u)`.

For every finite summation interval `I`, direct expansion gives

`sum_(n in I) S_f(n)^3`

`=sum_(u,v,w) f(u)f(v)f(w) sum_(n in I) a(n+u)a(n+v)a(n+w)`.

More generally, every degree-`d` polynomial in finitely many block coordinates
is an exact finite linear combination of shifted joint moments of order at
most `d`. Repeated shifts give lower-dimensional diagonal terms; distinct
shifts are precisely prime `k`-tuple/correlation content. The proof is the
finite multinomial expansion, so no convergence or interchange issue occurs.

### Consequence for the route

Moving from quadratic to cubic blocks avoids the previously proved quadratic
kernel identity, but it does not itself create cancellation: it replaces a
pair-correlation theorem by a uniformly weighted triple-correlation theorem.
For a growing block length, the number of shifts and the needed uniformities
grow as well. No estimate was found that controls the distinct-shift triple
remainder at a scale yielding a new zeta-zero or prime-distribution theorem.

### Decision

`BLOCKED`. Reopen only with a named mechanism for the weighted higher-order
correlations (for example a genuine Gowers-uniformity, spectral, or dispersion
estimate in the required growing range) and a complete downstream implication.
Changing the nonlinear observable or plotting its finite distribution is not
such a mechanism. The reduction is elementary and has no novelty claim.

## Round 8 — quantitative Furstenberg mixing

### Frozen theorem target

Upgrade qualitative Möbius/Liouville Furstenberg structure to a polynomial
mixing rate that yields power-saving fixed-shift cancellation.

### Exact correspondence and coordinate-equivalence

For Liouville `a`, let `X={-1,1}^Z`, `T` be the shift, and `F(x)=x_0`. The
Cesàro empirical measure `nu_N=N^(-1)sum_(n<=N)delta_(T^n a)` satisfies

`int prod_j F(T^(h_j)x) dnu_N`

`=N^(-1)sum_(n<=N)prod_j a(n+h_j)`.

For a finite window `I`, Walsh inversion expresses the discrepancy of the
empirical sign-pattern law from the uniform Bernoulli law as the sum of all
nonempty correlation coefficients on subsets of `I`. Consequently polynomial
cylinder discrepancy is equivalent, up to window-dependent constants, to
power-saving Chowla for those shifts. Renaming the estimate “quantitative
Furstenberg convergence” creates no new mechanism.

### Three exact mismatches

1. Mixing of a fixed limiting measure concerns separation `h->infinity`, while
   Chowla concerns `N->infinity` at fixed shifts. A stationary two-state Markov
   chain with correlation parameter `rho`, `|rho|<1`, is exponentially mixing
   but has adjacent correlation `rho!=0`.
2. Even the Bernoulli Koopman shift has no spectral gap on mean-zero `L^2`:
   for `f_L=L^(-1/2)sum_(j=1)^L X_j`, `||f_L||_2=1` but
   `||Uf_L-f_L||_2=sqrt(2/L)->0`.
3. Identification of the limiting system supplies no empirical rate for the
   deterministic point. Bernoulli-generic sequences can be built by
   concatenating increasingly dominant typical blocks so their cylinder
   frequencies converge along a prescribed arbitrarily slow schedule.

Logarithmic Furstenberg averages also do not Tauberianly yield ordinary
power-saving cancellation: sparse superexponential blocks can leave logarithmic
means tending to zero while ordinary Cesàro means stay bounded away from zero
along block endpoints.

### Decision

`KILLED` as a distinct mechanism. Mixing in shift separation is irrelevant to
fixed adjacent shifts, the Bernoulli shift lacks the proposed Koopman gap, and
polynomial empirical Bernoulli convergence is exactly the desired arithmetic
correlation estimate. Reopen only with an independently proved finite-scale
arithmetic input such as polynomial Gowers uniformity plus an effective transfer.

## Round 7 — shifted Möbius bilinear forms

### Frozen theorem target

Prove power-saving shifted Type-II cancellation for the actual coefficient
classes arising in a decomposition of binary Möbius correlation.

### Exact coefficient decomposition

For every `n>=2` and a fixed nonzero integer shift `h`,

`mu(n)=-sum_(p|n, p not| n/p) mu(n/p)/omega(n)`.

For squarefree `n`, all `omega(n)` summands equal `-mu(n)/omega(n)`; if `n`
is not squarefree, every eligible removal leaves a square factor and both sides
vanish. Consequently

`sum_(n<=X)mu(n)mu(n+h)`

`=O_h(1)-sum_(pr<=X,p not|r) mu(r)/(1+omega(r)) mu(pr+h)`.

The genuine balanced boxes therefore have prime support in `p` and the
specific coefficient `mu(r)/(1+omega(r))`, which is also
`int_0^1 mu(r)t^(omega(r))dt`. They are not arbitrary-coefficient boxes.

This identity alone does not establish uniformity for growing or negative
shifts.

### Corrected dispersion gate

For

`B_(P,R)(h)=sum_(p~P prime)sum_(r~R,p not|r)`
` mu(r)/(1+omega(r)) mu(pr+h)`,

Cauchy cannot silently remove the inherited condition `p not|r`. First define
the unrestricted box `B_tilde` by dropping that condition. Direct counting
gives

`|B-B_tilde| << (R+P)/log P`

on balanced prime boxes. If `L` is the number of primes `p~P`, Cauchy in `r`
and triangle inequality then give

`|B_tilde|^2 <= R (L R + sum_(p!=q)`
` |sum_(r~R)mu(pr+h)mu(qr+h)|)`.

Equivalently, one can retain both exclusions inside the inner sum and bound
their total correction explicitly.

The two affine forms have determinant `h(p-q)!=0`, and
`gcd(pr+h,qr+h)` divides `h(q-p)`. Thus local factors are explicit, but the
off-diagonal is an averaged, unweighted, growing-slope affine-Chowla problem.
The local factors depend on divisors of `h(q-p)` and no support-uniform constant
was proved. If

`sum_(p!=q)|sum_r mu(pr+h)mu(qr+h)| << L^2 R^(1-eta)`,

then
`|B| << R sqrt(L)+L R^(1-eta/2)` plus the exclusion error. On
`P~R~X^(1/2)`, the resulting saving is `eta/4`, capped by the diagonal
`1/4` barrier. Such an input is not supplied by logarithmic fixed-form Chowla
or almost-all-shift results.

The arbitrary-coefficient shifted cut norm is not algebraically refuted. A
Rademacher/Khintchine argument gives the lower bound

`sup_(|alpha|,|beta|<=1)|sum alpha_m beta_n mu(mn+h)|`
`>=2^(-1/2)sum_m (sum_n mu(mn+h)^2)^(1/2)`,

which has random-matrix scale `X^(3/4)` on balanced squarefree-density boxes
and limits any possible arbitrary-coefficient saving to at most `delta=1/4`.
For `h=0`, the known choice `alpha_m=mu(m)`, `beta_n=mu(n)` saturates at
order `X`; the shifted case has no analogous rank-one saturation.

### Why one Type-II theorem still does not close Chowla

The exact decomposition also contains small-`p` Type-I affine correlations and
small-`r` shifted-prime Möbius endpoints. For `r=1`, the trivial upper bound is
`O(X/log X)`; the sum is not proved to have that size. This is already `o(X)`,
so it does not obstruct qualitative binary Chowla, but it is larger than
`X^(1-delta)` for every fixed `delta>0`. Hence the balanced power-saving
estimate requires separate parity-breaking Type-I and endpoint theorems before
it implies a fixed-power binary-Chowla bound.

### Decision

`PARKED`. The false unshifted form remains hard-killed; the actual shifted
coefficient class survives algebraically, but dispersion closes back on a
power-saving affine-Chowla estimate and the endpoint pieces remain parity-
sensitive. The round proved an exact decomposition and proof-obligation map,
not a new cancellation theorem. Reopen only with both the averaged growing-
slope affine bound and power-saving endpoint control. The complete required
suite is not shown weaker than binary Chowla: its growing-slope uniformity and
shifted-prime endpoint are partly stronger or logically incomparable.

## Round 9 — Maynard enlarged-support certificate

### Frozen theorem target

First reproduce the published `M_(50,1/25)>4.0043` gate stably, then produce
an exact rational `M_(49,epsilon)>4` witness and its unconditional gap-240
consequence.

### REOPEN entry

Prior death certificate: the degree-27 denominator Gram problem has computed
condition scale about `10^17`; ordinary double precision misses the known
`k=50` positive control, apparent crossings fail direct Rayleigh evaluation,
and the stable `k=49` quotient is about `3.976`.

New mechanism: decide a rational threshold by exact inertia rather than by a
generalized eigensolve or a larger basis. This keeps the same frozen matrices
and targets `A-tau I` directly, so it is not a wider parameter sweep, higher
cutoff, new visualization, or sub-machine eigenvalue.

Decisive proof of concept: exact rational degree-5 inertia brackets the known
degree-5 optimum between `3.5` and `3.51`. Falsifier: failure to isolate a
positive interval pivot/block at the published degree-27 threshold, or failure
of the extracted rational vector under exact scalar reevaluation.

### Exact threshold-inertia lemma

Let rational symmetric `A,I` have `I` positive definite and let rational
`tau`. Then

`lambda_max(A,I)>tau`

if and only if the rational form `B_tau=A-tau I` has positive inertia, if and
only if there is a nonzero rational vector `c` with `c^T B_tau c>0`.

The Rayleigh definition proves the real-direction equivalence; a positive
real direction can be approximated by a rational one because positivity is
open. If a rational symmetric factorization
`P^T B_tau P=L D L^T` has `y^TDy>0`, then
`c=P L^(-T)y` is a rational witness with `c^TB_tau c=y^TDy>0`.

This avoids forming `I^(-1/2)AI^(-1/2)` or resolving the smallest modes of
`I`. After clearing all matrix and coefficient denominators, it can finish
with the integer inequality corresponding to

`10000 c^T A c - 40043 c^T I c > 0`, `c^T I c>0`.

### Safe exact proof of concept and scale audit

On the repository's exact degree-5, dimension-14 enlarged-signature pair,
exact rational `LDL^T` found inertia `(1 positive,13 negative)` at `tau=3.5`
and `(0,14)` at `tau=3.51` and `4.0043`, matching the documented optimum
`3.506624900927...`. Already at dimension 14, reduced pivot numerators and
denominators reached roughly 900--1050 decimal digits. A naive exact dense
dimension-2526 factorization would require about 5.4 billion elimination
updates with severe coefficient swell and is not a credible direct backend.
The proof-of-concept script reports inertia and digit sizes; it does not yet
export the positive pivot list or a rational witness vector.

A viable full proposal layer would use equilibrated, block-pivoted
multiprecision ball `LDL^T` or a matrix-free block iteration, extract one
direction, and certify only the two scalar forms exactly with an independent
modular/CRT checker.

### Decision

`BLOCKED AFTER REOPEN TEST`. The new exact certificate strategy is valid and
passes its small-degree falsifier, but it does not reproduce the required
degree-27 `k=50` control and produces no `k=49` witness. The prior
breakthrough death certificate therefore survives; the open variational target
is not refuted.
