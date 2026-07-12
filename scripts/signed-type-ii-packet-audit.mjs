import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { vonMangoldtTable } from "../src/core/primeVariance.js";
import {
  balancedVaughanPacketAudit,
  completePacketAudit,
  divisorMinusLogTable,
  finiteLocalMangoldtTable,
  localCharacterPacketCertificate,
  logLogSlope,
} from "../src/core/signedTypeIIPacket.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "logs", "atlas-next-frontiers", "signed-type-ii-packet");
const endpoints = [2 ** 12, 2 ** 13, 2 ** 14, 2 ** 15];
const scales = [
  { id: "one-third", H: (X) => Math.round(X ** (1 / 3)) },
  { id: "five-twelfths", H: (X) => Math.round(X ** (5 / 12)) },
  { id: "half-over-two", H: (X) => Math.round(Math.sqrt(X) / 2) },
];
const maximumX = endpoints.at(-1);
const maximumH = Math.max(...endpoints.flatMap((X) => scales.map((scale) => scale.H(X))));
const limit = 2 * maximumX + 2 * maximumH + 4;
const { lambda } = vonMangoldtTable(limit);
const primeResidual = Float64Array.from(lambda, (value, n) => n ? value - 1 : 0);
const divisorResidual = divisorMinusLogTable(limit).values;
const local = finiteLocalMangoldtTable(limit, 11);

const families = [
  { id: "divisor-minus-log", values: divisorResidual },
  { id: "lambda-minus-one", values: primeResidual },
  { id: "local-z11", values: local.values },
  { id: "lambda-minus-local-correlation", values: primeResidual, reference: local.values },
];

const rows = [];
for (const X of endpoints) {
  for (const scale of scales) {
    const H = scale.H(X);
    for (const family of families) {
      const audit = completePacketAudit(family.values, { X, H, reference: family.reference });
      rows.push({
        family: family.id,
        scale: scale.id,
        X,
        H,
        signed: audit.signed,
        shiftwiseAbsolute: audit.shiftwiseAbsolute,
        cancellationRatio: audit.cancellationRatio,
        zeroModeContribution: audit.zeroModeContribution,
        centeredSigned: audit.centeredSigned,
        zeroModeFraction: audit.signed ? audit.zeroModeContribution / audit.signed : null,
        zeroModeIdentityError: audit.zeroModeIdentityError,
      });
    }
  }
}

const fits = [];
for (const family of families) {
  for (const scale of scales) {
    const selected = rows.filter((row) => row.family === family.id && row.scale === scale.id);
    fits.push({
      family: family.id,
      scale: scale.id,
      signedHExponent: logLogSlope(selected, "signed"),
      absoluteHExponent: logLogSlope(selected, "shiftwiseAbsolute"),
      exponentGain: logLogSlope(selected, "shiftwiseAbsolute") - logLogSlope(selected, "signed"),
      cancellationRatios: selected.map((row) => row.cancellationRatio),
    });
  }
}

const zSensitivity = [];
for (const z of [5, 11, 23, 47]) {
  const reference = finiteLocalMangoldtTable(limit, z).values;
  for (const scale of scales) {
    const selected = [];
    for (const X of endpoints) {
      const H = scale.H(X);
      const audit = completePacketAudit(primeResidual, { X, H, reference });
      selected.push({ X, H, signed: audit.signed, shiftwiseAbsolute: audit.shiftwiseAbsolute });
    }
    zSensitivity.push({
      z,
      scale: scale.id,
      signedHExponent: logLogSlope(selected, "signed"),
      absoluteHExponent: logLogSlope(selected, "shiftwiseAbsolute"),
      exponentGain: logLogSlope(selected, "shiftwiseAbsolute") - logLogSlope(selected, "signed"),
      normalizedSigned: selected.map((row) => row.signed / row.X),
    });
  }
}

const localCertificates = [
  localCharacterPacketCertificate(5, 37),
  localCharacterPacketCertificate(7, 37),
].map((certificate) => ({
  z: certificate.z,
  modulus: certificate.modulus,
  zeroCoefficientNormSquared: certificate.zeroCoefficient.normSquared,
  directPacket: certificate.directPacket,
  fourierPacket: certificate.fourierPacket,
  packetIdentityError: certificate.packetIdentityError,
  eulerProductMaxError: certificate.eulerProductMaxError,
}));

const typeII = [
  balancedVaughanPacketAudit({ M: 16, N: 16, H: 6, randomSamples: 64 }),
  balancedVaughanPacketAudit({ M: 20, N: 20, H: 7, randomSamples: 64 }),
  balancedVaughanPacketAudit({ M: 24, N: 24, H: 8, randomSamples: 64 }),
];

const report = {
  frozenAt: "2026-07-12",
  implementation: {
    interval: "complete integer n in [X,2X), shifts 1<=h<2H",
    localModel: "a_z#(n)=P(11)/phi(P(11)) 1_(n,P(11))=1 - 1; z=5,11,23,47 sensitivity also run",
    divisorToy: "d_2(n)-log(n), literally as preregistered; not the MRSTT d_2# approximant",
    signed: "sum_h tau_H(h) E(h)",
    shiftwiseAbsolute: "sum_h tau_H(h) |E(h)|",
    fittedQuantity: "packet/X against H along each frozen X-theta path",
    typeII: "balanced Vaughan alpha_m=mu(m), beta_n=log(n), projected off constants and residue indicators mod 2,3,5",
  },
  endpoints,
  rows,
  fits,
  zSensitivity,
  localCertificates,
  typeII,
};

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "results.json"), `${JSON.stringify(report, null, 2)}\n`);
const csvHeader = [
  "family", "scale", "X", "H", "signed", "shiftwiseAbsolute", "cancellationRatio",
  "zeroModeContribution", "centeredSigned", "zeroModeFraction", "zeroModeIdentityError",
];
const csv = [csvHeader.join(",")];
for (const row of rows) csv.push(csvHeader.map((key) => row[key]).join(","));
fs.writeFileSync(path.join(outputDirectory, "packet-ladder.csv"), `${csv.join("\n")}\n`);

console.log(JSON.stringify({ fits, zSensitivity, localCertificates, typeII }, null, 2));
