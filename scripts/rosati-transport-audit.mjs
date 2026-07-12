#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  buildModularRosatiAudit,
  coarseOrbitQuotientCertificate,
  compactnessDoesNotImplyPositivity,
  idempotentLinearizationCertificate,
  stringifyTransportBigInts,
} from '../src/core/rosatiTransportObstructions.js'

const outputDirectory = process.argv[2]
  || 'logs/arithmetic-hodge-transport/rosati-discriminator'

const modularRosati = buildModularRosatiAudit()
const idempotentCollapse = idempotentLinearizationCertificate([
  'Abel-Jacobi prime image',
  'idempotent boundary stratum',
])
const flowCollapse = coarseOrbitQuotientCertificate()
const compactnessCountermodel = compactnessDoesNotImplyPositivity()

const allModularChecksPass = modularRosati.rows.every(
  (row) => Object.values(row.checks).every(Boolean),
)

const report = stringifyTransportBigInts({
  generatedAt: new Date().toISOString(),
  verdict: allModularChecksPass
    ? 'P2 RECONSTRUCTED / P3 RESET AT EXACT COMPARISON GATE'
    : 'MODULAR ROSATI AUDIT FAILED',
  modularRosati,
  carrierObstructions: {
    idempotentCollapse,
    flowCollapse,
  },
  compactnessCountermodel,
  firstUnprovedArrow: {
    name: 'P3-C0b explicit-basis one-prime Weil--Sonin comparison identity',
    places: ['infinity', 2],
    support: '[3^(-1/2), 3^(1/2)] before autocorrelation',
    requiredInequality: '-sum_(v in {infinity,2}) W_v(g*g*) >= SoninTrace_(infinity,2)(g) >= 0',
    achievedInput: 'P3-C0a exact Sonin projection transport P_S=D P (P D^*D P)^(-1) P D^* and trace-class positivity',
    requiredInput: 'derive the Sonin trace in the explicit CvS/CCM basis and assemble E_S=Q_S-T_S with archimedean calibration',
    signStage: 'deferred until P3-C0b is proved',
    localizedWeilSideLane: 'the c=3 pole-free Poincare / frequency-tail Schur problem tests Q_W, not E_S',
  },
})

fs.mkdirSync(outputDirectory, { recursive: true })
fs.writeFileSync(
  path.join(outputDirectory, 'transport-audit.json'),
  `${JSON.stringify(report, null, 2)}\n`,
)

console.log(JSON.stringify({
  verdict: report.verdict,
  modularRows: modularRosati.rows.length,
  outputDirectory,
}))

if (!allModularChecksPass) process.exitCode = 1
