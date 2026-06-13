import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const artifactPath = "logs/divisor-extremes-artifacts/ca-xa-transitions.json";
const exhibitPath = "logs/divisor-extremes-artifacts/ca-xa-exhibit.html";
const phase4PackPath = "logs/divisor-extremes-artifacts/ca-xa-phase4-pack.md";
const leanStubPath = "logs/divisor-extremes-artifacts/ca_xa_phase4_stub.lean";
const stuckPackPath = "logs/divisor-extremes-artifacts/ca-xa-stuck-pack.md";

describe("CA-XA transition artifact", () => {
  it("contains the theorem-backed closure and normalized frontier-skip summary", () => {
    expect(existsSync(artifactPath)).toBe(true);
    const data = JSON.parse(readFileSync(artifactPath, "utf8"));
    const summary = data.summary;
    const skips = summary.frontierSkipSummary;
    const barriers = summary.endpointBarrierSummary;

    expect(data.limit).toBe(8436);
    expect(data.rowsParsed).toBe(8436);
    expect(summary.xaCount).toBe(579);
    expect(summary.caCount).toBe(443);
    expect(summary.caXaCount).toBe(384);
    expect(summary.nonCaXaCount).toBe(194);
    expect(summary.closureFailures).toBe(0);

    expect(skips.allTransitions).toBe(383);
    expect(skips.repeatedFrontierTransitions).toBe(27);
    expect(skips.frontierChangingTransitions).toBe(356);
    expect(skips.zeroSkipTransitions).toBe(353);
    expect(skips.nonzeroSkipTransitions).toBe(3);
    expect(skips.skippedPrimeTotal).toBe(11);
    expect(skips.skippedOverLiTotal).toBeCloseTo(0.0293696053137314, 12);
    expect(skips.maxSkippedPrimeCount).toBe(5);
    expect(barriers.skippedCAEndpointTotal).toBe(13);
    expect(barriers.transitionsWithSkippedCAEndpoints).toBe(5);
    expect(barriers.maxSkippedCAEndpoints).toBe(5);
    expect(barriers.closestBarrierDeficit).toBeCloseTo(-4.35619124106168e-7, 15);
    expect(barriers.deepestBarrierDeficit).toBeCloseTo(-0.00002070550845889585, 15);
    expect(barriers.nonCaXaWitnessTotal).toBe(194);
    expect(barriers.transitionsWithNonCaXaWitnesses).toBe(144);
    expect(summary.caQuotientSummary.total).toBe(442);
    expect(summary.caQuotientSummary.byKind).toEqual({ prime: 442 });
    expect(summary.caQuotientSummary.theoremShapeFailures).toEqual([]);
    expect(summary.caStepDecompositionSummary.postFirstCaXa.primeSteps).toBe(396);
    expect(summary.caStepDecompositionSummary.postFirstCaXa.negativePrimeSteps).toBe(9);
    expect(summary.caStepDecompositionSummary.postFirstCaXa.thresholdStats.aboveCritical).toBe(9);
    expect(summary.caStepDecompositionSummary.postFirstCaXa.thresholdStats.belowCritical).toBe(387);
    expect(summary.caStepDecompositionSummary.postFirstCaXa.thresholdStats.maxCriticalRatio)
      .toBeCloseTo(1.0050748313658797, 15);
    const approximation = summary.caStepDecompositionSummary.postFirstCaXa.criticalApproximationSummary;
    expect(approximation.newFrontierFirstOrder.steps).toBe(367);
    expect(approximation.newFrontierFirstOrder.classificationMismatches).toBe(15);
    expect(approximation.newFrontierFirstOrder.aboveCriticalByApproximation).toBe(23);
    expect(approximation.newFrontierFirstOrder.maxAbsRelativeError)
      .toBeCloseTo(0.015545630615664496, 15);
    expect(approximation.newFrontierSecondOrder.steps).toBe(367);
    expect(approximation.newFrontierSecondOrder.classificationMismatches).toBe(0);
    expect(approximation.newFrontierSecondOrder.aboveCriticalByApproximation).toBe(8);
    expect(approximation.newFrontierSecondOrder.maxAbsRelativeError)
      .toBeCloseTo(0.00006873694154307941, 15);
    expect(approximation.newFrontierBaseline.steps).toBe(367);
    expect(approximation.newFrontierBaseline.aboveCritical).toBe(8);
    expect(approximation.newFrontierBaseline.primeMinusLogN.max)
      .toBeCloseTo(10.370041724223938, 12);
    expect(approximation.newFrontierBaseline.criticalMinusLogN.min)
      .toBeCloseTo(1.9966901960718957, 12);
    expect(approximation.newFrontierBaseline.criticalMinusLogN.max)
      .toBeCloseTo(3.514886129757997, 12);
    expect(approximation.newFrontierBaseline.primeMinusCritical.max)
      .toBeCloseTo(7.185022257330729, 12);
    expect(approximation.newFrontierBoundary.steps).toBe(367);
    expect(approximation.newFrontierBoundary.belowCriticalBoundary).toBe(8);
    expect(approximation.newFrontierBoundary.classificationMismatches).toBe(0);
    expect(approximation.newFrontierBoundary.caBoundaryRatioToCritical.min)
      .toBeCloseTo(0.9942588899666227, 15);
    expect(approximation.newFrontierBoundary.caBoundaryRatioToCritical.max)
      .toBeCloseTo(1.0680151308622592, 15);
    expect(approximation.newFrontierBoundary.caBoundaryLogNScale.min)
      .toBeCloseTo(0.9783111678703077, 15);
    expect(approximation.newFrontierBoundary.caBoundaryLogNScale.max)
      .toBeCloseTo(1.0561262320258822, 15);
    expect(approximation.newFrontierBoundary.firstOrderTaylorMismatches).toBe(0);
    expect(approximation.newFrontierBoundary.secondOrderTaylorMismatches).toBe(0);
    expect(approximation.newFrontierBoundary.maxAbsFirstOrderTaylorError)
      .toBeCloseTo(0.0018539479676814435, 15);
    expect(approximation.newFrontierBoundary.maxAbsSecondOrderTaylorError)
      .toBeCloseTo(0.00006872379838833431, 15);
    expect(approximation.newFrontierBoundary.belowSecondOrderBoundary).toBe(8);
    expect(approximation.newFrontierBoundary.secondOrderBoundaryMismatches).toBe(0);
    expect(approximation.newFrontierBoundary.caBoundaryRatioToSecondOrder.min)
      .toBeCloseTo(0.9942606211642624, 15);
    expect(approximation.newFrontierBoundary.caBoundaryRatioToSecondOrder.max)
      .toBeCloseTo(1.0680548515895607, 15);
    expect(approximation.newFrontierBoundary.secondOrderCenterDelta.max)
      .toBeCloseTo(7.182854992119019, 12);
    expect(approximation.newFrontierBoundary.maxAbsSecondOrderCenterSecondOrderTaylorError)
      .toBeCloseTo(0.00006879296119996492, 15);
    expect(approximation.newFrontierBoundary.maxAbsIntervalGlueError).toBe(0);
    expect(approximation.newFrontierGap.steps).toBe(367);
    expect(approximation.newFrontierGap.nextBaseMismatches).toBe(0);
    expect(approximation.newFrontierGap.noBaseBeforeSecondOrderThreshold).toBe(8);
    expect(approximation.newFrontierGap.noBaseClassifierMismatches).toBe(0);
    expect(approximation.newFrontierGap.noBaseRuns.maxRunLength).toBe(3);
    expect(approximation.newFrontierGap.noBaseRuns.runCount).toBe(4);
    expect(approximation.newFrontierGap.expectedBaseCountTotal)
      .toBeCloseTo(1200.522950332441, 9);
    expect(approximation.newFrontierGap.noBaseExpectedBaseCountTotal)
      .toBeCloseTo(9.005470524093402, 12);
    expect(approximation.newFrontierGap.ordinaryPrimeGapBenchmarks.bhp0525FitsP2Interval).toBe(10);
    expect(approximation.newFrontierGap.ordinaryPrimeGapBenchmarks.noBaseBhp0525FitsP2Interval).toBe(0);
    expect(approximation.newFrontierGap.ordinaryPrimeGapBenchmarks.intervalOverBhp0525.max)
      .toBeCloseTo(1.29135714593705, 15);
    expect(approximation.newFrontierGap.ordinaryPrimeGapBenchmarks.dusart2010ApplicableFrontiers).toBe(0);
    expect(approximation.newFrontierGap.noBaseRecovery.runCount).toBe(4);
    expect(approximation.newFrontierGap.noBaseRecovery.unrecoveredRuns).toBe(0);
    expect(approximation.newFrontierGap.noBaseRecovery.maxNoBaseRunLength).toBe(3);
    expect(approximation.newFrontierGap.noBaseRecovery.maxTotalStepsToRecovery).toBe(6);
    expect(approximation.newFrontierGap.noBaseRecovery.maxExtraStepsAfterNoBaseRun).toBe(3);
    expect(approximation.newFrontierGap.noBaseRecovery.deepestCumulativeLogMargin)
      .toBeCloseTo(-0.000011776209093505331, 18);
    expect(approximation.newFrontierGap.noBaseRecovery.recoveredUsingOnlyNewFrontierSteps).toBe(3);
    expect(approximation.newFrontierGap.noBaseRecovery.recoveredUsingNonNewFrontierSteps).toBe(1);
    expect(approximation.newFrontierGap.noBaseRecovery.recoveredWithoutExtraSteps).toBe(0);
    expect(approximation.newFrontierGap.noBaseRecovery.totalExtraNewFrontierSlack)
      .toBeCloseTo(27.056672901040542, 12);
    expect(approximation.newFrontierGap.noBaseRecovery.totalExtraNewFrontierMargin)
      .toBeCloseTo(0.00015146697401645636, 18);
    expect(approximation.newFrontierGap.noBaseRecovery.totalExtraNonNewFrontierMargin)
      .toBeCloseTo(0.000009490367501261646, 18);
    expect(approximation.newFrontierGap.noBaseRecovery.runs.map((run) => [
      run.fromFrontier,
      run.primes,
      run.extraStepsAfterNoBaseRun,
      run.recoveryPrimes,
      run.extraNewFrontierSteps,
      run.extraNonNewFrontierSteps,
    ])).toEqual([
      [139, [149], 1, [149, 151], 1, 0],
      [523, [541], 1, [541, 31], 0, 1],
      [1399, [1409, 1423, 1427], 3, [1409, 1423, 1427, 1429, 1433, 1439], 3, 0],
      [2633, [2647, 2657, 2659], 3, [2647, 2657, 2659, 2663, 2671, 2677], 3, 0],
    ]);
    expect(approximation.newFrontierGap.ranges.map((row) => [
      row.range,
      row.steps,
      row.noBaseBeforeSecondOrderThreshold,
    ])).toEqual([
      [[100, 500], 65, 1],
      [[500, 1000], 72, 1],
      [[1000, 2000], 134, 3],
      [[2000, 3000], 93, 3],
    ]);
    expect(approximation.maxAbsNewFrontierEquationResidual)
      .toBeCloseTo(7.680078795146983e-12, 24);
    expect(summary.caStepDecompositionSummary.postFirstCaXa.minLogGainMinusPenalty)
      .toBeCloseTo(-0.000011776209093505331, 18);
    expect(summary.barrierStepDecompositionSummary.transitionCount).toBe(5);
    expect(summary.barrierStepDecompositionSummary.maxPathLength).toBe(6);
    expect(summary.barrierStepDecompositionSummary.closestFinalCumulativeLogMargin)
      .toBeCloseTo(2.26318632606283e-9, 21);

    expect(skips.nonzeroTransitions.map((row) => [row.fromFrontier, row.toFrontier, row.skippedPrimes])).toEqual([
      [139, 151, [149]],
      [1399, 1439, [1409, 1423, 1427, 1429, 1433]],
      [2633, 2677, [2647, 2657, 2659, 2663, 2671]],
    ]);
    expect(summary.frontierTransitions
      .filter((row) => row.skippedPrimeCount > 0)
      .map((row) => [row.fromFrontier, row.toFrontier, row.skippedCAEndpointCount])).toEqual([
        [139, 151, 1],
        [1399, 1439, 5],
        [2633, 2677, 5],
      ]);
    const longBarrier = summary.endpointBarrierSummary.transitions.find((row) => row.fromFrontier === 1399);
    expect(longBarrier.caEndpointPath.map((row) => [
      row.quotientFromPreviousCA.numerator[0].p,
      row.quotientFromPreviousCA.kind,
      row.isTerminalH,
    ])).toEqual([
      [1409, "prime", false],
      [1423, "prime", false],
      [1427, "prime", false],
      [1429, "prime", false],
      [1433, "prime", false],
      [1439, "prime", true],
    ]);
    const longBarrierDecomposition = summary.barrierStepDecompositionSummary.transitions
      .find((row) => row.fromFrontier === 1399);
    expect(longBarrierDecomposition.path.map((row) => [
      row.quotient[0].p,
      row.logGainMinusPenalty,
      row.cumulativeLogGainMinusPenalty,
      row.criticalRatio,
      row.isTerminalH,
    ])).toEqual([
      [1409, -2.5099453380332624e-7, -2.5099453380332624e-7, 1.000311097774963, false],
      [1423, -0.000004054948752195593, -0.0000043059432859989194, 1.0050748313658797, false],
      [1427, -0.000002195452383890197, -0.0000065013956698891165, 1.002755974336582, false],
      [1429, 7.471883725940513e-7, -0.000005754207297295065, 0.9990604467297021, false],
      [1433, 0.0000025431142940549392, -0.000003211093003240126, 0.9967925099629182, false],
      [1439, 0.000003213356189566189, 2.26318632606283e-9, 0.9959296679805235, true],
    ]);
  });

  it("includes normalized skip controls for every fixed-shape Cramer seed", () => {
    const data = JSON.parse(readFileSync(artifactPath, "utf8"));
    const controls = data.cramerShapeContrast;

    expect(controls.map((row) => row.seed)).toEqual([12345, 271828, 314159, 161803, 424242]);
    for (const row of controls) {
      expect(row.frontierSkipSummary).toBeTruthy();
      expect(row.caStepThresholdSummary).toBeTruthy();
      expect(row.caStepThresholdSummary.thresholdStats.withThreshold)
        .toBe(row.caStepThresholdSummary.primeSteps);
      expect(row.caStepThresholdSummary.thresholdStats.aboveCritical)
        .toBe(row.caStepThresholdSummary.negativePrimeSteps);
      expect(row.caStepThresholdSummary.criticalApproximationSummary.newFrontierSecondOrder.classificationMismatches)
        .toBe(0);
      expect(row.caStepThresholdSummary.criticalApproximationSummary.newFrontierBoundary.classificationMismatches)
        .toBe(0);
      expect(row.caStepThresholdSummary.criticalApproximationSummary.newFrontierBoundary.secondOrderTaylorMismatches)
        .toBe(0);
      expect(row.caStepThresholdSummary.criticalApproximationSummary.newFrontierBoundary.secondOrderBoundaryMismatches)
        .toBe(0);
      expect(row.caStepThresholdSummary.criticalApproximationSummary.newFrontierBoundary.secondOrderCenterSecondOrderTaylorMismatches)
        .toBe(0);
      expect(row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap.nextBaseMismatches)
        .toBe(0);
      expect(row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap.noBaseClassifierMismatches)
        .toBe(0);
      expect(row.caStepThresholdSummary.criticalApproximationSummary.newFrontierBoundary.maxAbsIntervalGlueError)
        .toBe(0);
      expect(row.frontierSkipSummary.frontierChangingTransitions).toBeGreaterThanOrEqual(1);
      expect(row.frontierSkipSummary.maxSkippedPrimeCount).toBeGreaterThanOrEqual(6);
    }
    expect(controls.find((row) => row.seed === 314159).closureFailures).toBe(344);
    expect(controls.find((row) => row.seed === 424242).frontierSkipSummary.maxSkippedPrimeCount).toBe(37);
    expect(controls.map((row) => [
      row.seed,
      row.caStepThresholdSummary.primeSteps,
      row.caStepThresholdSummary.thresholdStats.aboveCritical,
      row.caStepThresholdSummary.thresholdStats.belowCritical,
    ])).toEqual([
      [12345, 285, 206, 79],
      [271828, 136, 50, 86],
      [314159, 151, 0, 151],
      [161803, 290, 139, 151],
      [424242, 238, 0, 238],
    ]);
    expect(controls.map((row) => [
      row.seed,
      row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap.steps,
      row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap.noBaseBeforeSecondOrderThreshold,
      row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap.noBaseRuns.maxRunLength,
    ])).toEqual([
      [12345, 264, 195, 143],
      [271828, 126, 47, 23],
      [314159, 140, 0, 0],
      [161803, 271, 127, 46],
      [424242, 222, 0, 0],
    ]);
    expect(controls.map((row) => {
      const recovery = row.caStepThresholdSummary.criticalApproximationSummary.newFrontierGap.noBaseRecovery;
      return [
        row.seed,
        recovery.runCount,
        recovery.unrecoveredRuns,
        recovery.maxNoBaseRunLength,
        recovery.maxTotalStepsToRecovery,
        recovery.maxExtraStepsAfterNoBaseRun,
      ];
    })).toEqual([
      [12345, 16, 13, 57, 10, 6],
      [271828, 5, 5, 23, 0, 0],
      [314159, 0, 0, 0, 0, 0],
      [161803, 20, 8, 19, 108, 94],
      [424242, 0, 0, 0, 0, 0],
    ]);
    expect(controls.find((row) => row.seed === 161803)
      .caStepThresholdSummary.thresholdStats.maxCriticalRatio)
      .toBeCloseTo(1.1004105084684441, 15);
    expect(controls.find((row) => row.seed === 424242)
      .caStepThresholdSummary.thresholdStats.maxCriticalRatio)
      .toBeCloseTo(0.995157393409754, 15);
  });

  it("renders a full frontier timeline in the static exhibit", () => {
    expect(existsSync(exhibitPath)).toBe(true);
    const html = readFileSync(exhibitPath, "utf8");

    expect(html).toContain("Full Frontier Timeline");
    expect(html).toContain("CA Endpoint Barriers");
    expect(html).toContain("CA Quotient Path");
    expect(html).toContain('data-timeline-count="356"');
    expect(html).toContain('data-barrier-count="13"');
    expect(html).toContain('data-ca-quotient-total="442"');
    expect(html).toContain('data-ca-quotient-prime-count="442"');
    expect(html).toContain("Negative prime-step margins");
    expect(html).toContain("New-frontier asymptotic");
    expect(html).toContain("CA-boundary classifier");
    expect(html).toContain("Explicit P2 boundary");
    expect(html).toContain("P2 no-base runs");
    expect(html).toContain("Ordinary gap fit");
    expect(html).toContain("No-base recovery");
    expect(html).toContain("Recovery mode");
    expect(html).toContain("unrecovered P2 runs");
    expect(html).toContain("max recovery steps");
    expect(html).toContain("Boundary Taylor");
    expect(html).toContain("max P2 run");
    expect(html).toContain("log sigma gain");
    expect(html).toContain("loglog penalty");
    expect(html).toContain("p/critical");
    expect(html).toContain("F/Fcrit");
    expect(html).toContain("above critical");
    expect(html).toContain("max p/critical");
    expect(html).toContain("All 356 CA-XA frontier-changing transitions");
    expect(html).toContain("139 &rarr; 151");
    expect(html).toContain("1,399 &rarr; 1,439");
    expect(html).toContain("2,633 &rarr; 2,677");
    expect(html).toContain("-4.356e-7");
    expect(html).toContain("0.029370");
  });

  it("renders a Lean-stub-ready phase-4 expert pack with a three-sentence teaching section", () => {
    expect(existsSync(phase4PackPath)).toBe(true);
    const pack = readFileSync(phase4PackPath, "utf8");

    expect(pack).toContain("# CA-XA Phase-4 Expert Pack");
    expect(pack).toContain("## Factor Check");
    expect(pack).toContain("## Lean-Stub-Ready Statements");
    expect(pack).toContain("Standalone parseable Lean 4 stub");
    expect(pack).toContain("ca_xa_phase4_stub.lean");
    expect(pack).toContain("axiom bounded_no_base_runs");
    expect(pack).toContain("axiom bounded_no_base_recovery");
    expect(pack).toContain("theorem bounded_CA_XA_skips_from_recovery");
    expect(pack).toContain("OPEN / CONJECTURAL");
    expect(pack).toContain("Focused stuck pack");
    expect(pack).toContain("ca-xa-stuck-pack.md");
    expect(pack).toContain("root-free no-base events `p>P2(C)`: 8");
    expect(pack).toContain("maximum no-base run length: 3");
    expect(pack).toContain("unrecovered real no-base runs: 0");
    expect(pack).toContain("seed 12345: 195/264 no-base; max run 143");
    expect(pack).toContain("Baker-Harman-Pintz `x^0.525` scale fits inside only 10 of 367");

    const teachingSection = pack.split("## WHAT THIS TEACHES ABOUT PRIMES\n\n").at(1);
    expect(teachingSection).toBeTruthy();
    const teachingLines = teachingSection.trim().split(/\n+/);
    expect(teachingLines).toHaveLength(3);
    for (const line of teachingLines) expect(line.endsWith(".")).toBe(true);
  });

  it("generates a standalone Lean 4 phase-4 theorem stub", () => {
    expect(existsSync(leanStubPath)).toBe(true);
    const lean = readFileSync(leanStubPath, "utf8");

    expect(lean).toContain("namespace CAXA");
    expect(lean).toContain("opaque Real : Type");
    expect(lean).toContain("opaque is_CA : Nat -> Prop");
    expect(lean).toContain("def H (n : Nat) : Prop");
    expect(lean).toContain("def no_base_step (C D p : Nat) : Prop");
    expect(lean).toContain("axiom bounded_no_base_runs");
    expect(lean).toContain("axiom bounded_no_base_recovery");
    expect(lean).toContain("theorem bounded_CA_XA_skips_from_recovery");
    expect(lean).toContain("sorry");

    expect(lean).toContain("-- real no-base events p > P2(C) = 8");
    expect(lean).toContain("-- max real no-base run = 3");
    expect(lean).toContain("-- unrecovered real no-base runs = 0");
    expect(lean).toContain("-- cramer seed 12345: 195/264 no-base, max run 143");
    expect(lean).toContain("-- cramer seed 161803: 127/271 no-base, max run 46");
  });

  it("emits a focused stuck pack for the unresolved CA-XA theorem gap", () => {
    expect(existsSync(stuckPackPath)).toBe(true);
    const pack = readFileSync(stuckPackPath, "utf8");

    expect(pack).toContain("# CA-XA Focused STUCK PACK");
    expect(pack).toContain("HANDOFF 26, HANDOFF 27, and HANDOFF 28");
    expect(pack).toContain("## Exact Gap");
    expect(pack).toContain("Conjecture A. Runs of consecutive new-frontier CA steps with p > P2(C)");
    expect(pack).toContain("Conjecture B. Every such run has uniformly bounded recovery");
    expect(pack).toContain("bounded_CA_XA_skips_from_recovery");
    expect(pack).toContain("## What Was Tried");
    expect(pack).toContain("Baker-Harman-Pintz `x^0.525` fits inside only `10` of `367`");
    expect(pack).toContain("Dusart 2010 has `0` applicable frontiers");
    expect(pack).toContain("old-exponent multiplier `31`");
    expect(pack).toContain("## Minimal Expert Questions");
    expect(pack).toContain("Can CA epsilon spacing plus known or conjectural prime-gap input");
    expect(pack).toContain("counterexample mechanism showing that uniform boundedness is the wrong target");
    expect(pack).toContain("OPEN / CONJECTURAL");

    expect(pack).toContain("- no-base events `p>P2(C)`: 8");
    expect(pack).toContain("- max no-base run length: 3");
    expect(pack).toContain("- unrecovered real no-base runs: 0");
    expect(pack).toContain("seed 12345: 195/264 no-base; max run 143");
    expect(pack).toContain("seed 161803: 127/271 no-base; max run 46");
  });
});
