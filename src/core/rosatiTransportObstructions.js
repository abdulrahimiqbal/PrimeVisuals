const abs = (value) => value < 0n ? -value : value

const gcd = (left, right) => {
  let a = abs(left)
  let b = abs(right)
  while (b !== 0n) [a, b] = [b, a % b]
  return a
}

export const rational = (numerator, denominator = 1n) => {
  let top = BigInt(numerator)
  let bottom = BigInt(denominator)
  if (bottom === 0n) throw new Error('rational denominator must be nonzero')
  if (bottom < 0n) {
    top = -top
    bottom = -bottom
  }
  const divisor = gcd(top, bottom)
  return { numerator: top / divisor, denominator: bottom / divisor }
}

const multiplyRational = (left, right) => rational(
  left.numerator * right.numerator,
  left.denominator * right.denominator,
)

const rationalPower = (base, exponent) => {
  const baseValue = BigInt(base)
  if (baseValue <= 1n) throw new Error('base must exceed one')
  if (!Number.isInteger(exponent)) throw new Error('exponent must be an integer')
  if (exponent >= 0) return rational(baseValue ** BigInt(exponent))
  return rational(1n, baseValue ** BigInt(-exponent))
}

const sameRational = (left, right) => (
  left.numerator === right.numerator && left.denominator === right.denominator
)

/**
 * A point mass at lambda=base^exponent in the idelic scaling algebra.
 * The modular Rosati involution is
 *
 *   delta_lambda^sharp = |lambda| delta_(lambda^-1).
 */
export const sharpScalingAtom = ({
  base = 2,
  exponent,
  coefficient = rational(1n),
}) => ({
  base,
  exponent: -exponent,
  coefficient: multiplyRational(coefficient, rationalPower(base, exponent)),
})

export const buildModularRosatiAudit = ({
  base = 2,
  exponents = [-4, -2, -1, 0, 1, 2, 4],
} = {}) => ({
  base,
  relation: 'delta_lambda^sharp = |lambda| delta_(lambda^-1)',
  generatorRelation: 'Phi_t^sharp = exp(t) Phi_(-t)',
  infinitesimalRelation: 'Theta^sharp = 1 - Theta',
  rows: exponents.map((exponent) => {
    const atom = { base, exponent, coefficient: rational(1n) }
    const sharp = sharpScalingAtom(atom)
    const doubleSharp = sharpScalingAtom(sharp)
    return {
      exponent,
      sharp,
      checks: {
        inverseSupport: sharp.exponent === -exponent,
        modularCoefficient: sameRational(
          sharp.coefficient,
          rationalPower(base, exponent),
        ),
        involutive: doubleSharp.exponent === exponent
          && sameRational(doubleSharp.coefficient, atom.coefficient),
      },
    }
  }),
})

/**
 * Universal certificate: if x+x=x in a commutative monoid, then the image of
 * x under every homomorphism to an abelian group is zero.
 */
export const idempotentLinearizationCertificate = (labels = ['prime-stratum']) => ({
  theorem: 'Every homomorphism from an idempotent commutative monoid to an abelian group is zero.',
  proof: 'f(x)=f(x+x)=f(x)+f(x), so cancellation gives f(x)=0.',
  elements: labels.map((label) => ({
    label,
    monoidRelation: `${label}+${label}=${label}`,
    groupCompletionRelation: `${label}=0`,
    killedByGroupCompletion: true,
  })),
})

/**
 * The orbit-set quotient P/G has trivial induced G-action: [g.x]=[x].
 * Stacky/homotopy quotients may retain isotropy; this certificate concerns
 * only the coarse orbit quotient used by the arithmetic Jacobian.
 */
export const coarseOrbitQuotientCertificate = (
  parameters = [-2, -1, 0, 1, 2],
) => ({
  theorem: 'The action inducing a coarse orbit quotient acts trivially on that quotient.',
  proof: 'For every g and x, the orbit classes satisfy [g.x]=[x].',
  rows: parameters.map((parameter) => ({
    parameter,
    quotientAction: 'identity',
    infinitesimalGenerator: 0,
  })),
})

/**
 * Compactness, trace-class control, and an exact finite model do not imply the
 * sign needed for polarization.  K=lambda*P is rank one, while I-K has a
 * negative direction whenever lambda>1.
 */
export const compactnessDoesNotImplyPositivity = (eigenvalue = 2) => {
  if (!(eigenvalue > 1)) throw new Error('countermodel eigenvalue must exceed one')
  return {
    compactOperator: [[eigenvalue, 0], [0, 0]],
    residualOperator: [[1 - eigenvalue, 0], [0, 1]],
    rank: 1,
    traceClass: true,
    compact: true,
    residualEigenvalues: [1 - eigenvalue, 1],
    residualPositiveSemidefinite: false,
    lesson: 'A Schatten or quasi-inner remainder still needs a sharp norm/sign theorem.',
  }
}

export const stringifyTransportBigInts = (value) => JSON.parse(JSON.stringify(
  value,
  (_, item) => typeof item === 'bigint' ? item.toString() : item,
))
