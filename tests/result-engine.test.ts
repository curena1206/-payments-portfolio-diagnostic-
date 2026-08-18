import { describe, expect, it } from "vitest";
import { createAssessmentAggregate, type AssessmentAggregate } from "../src/domain/assessment/aggregate";
import { pfiV28Catalog } from "../src/domain/assessment/catalog";
import { pfiModel } from "../src/domain/pfi/model";
import { generateAssessmentResult } from "../src/domain/results/generation";
import {
  calculateComposite,
  calculateDimensionScore,
  evaluateCompositeEligibility,
  roundForDisplay,
} from "../src/domain/results/scoring";
import type { DimensionResult } from "../src/domain/results/types";

type ScoreOverride =
  | number
  | { score: number; path?: "capability" | "intentional-choice" }
  | "na"
  | "unanswered";

function assessmentWith(
  defaultScore: number,
  overrides: Record<string, ScoreOverride> = {},
): AssessmentAggregate {
  const assessment = createAssessmentAggregate({
    id: "10000000-0000-4000-8000-000000000001",
    now: "2026-08-18T10:00:00+02:00",
  });
  const responses = { ...assessment.responses };
  for (const dimension of pfiModel.dimensions) {
    for (const question of dimension.questions) {
      const override = overrides[question.id] ?? defaultScore;
      if (override === "unanswered") continue;
      if (override === "na") {
        responses[question.id] = {
          kind: "confirmed-na",
          confirmedAt: "2026-08-18T10:01:00+02:00",
        };
        continue;
      }
      const score = typeof override === "number" ? override : override.score;
      const requestedPath =
        typeof override === "number" ? undefined : override.path;
      const option = pfiV28Catalog
        .listOptions(question.id)
        .find(
          (candidate) =>
            candidate.score === score &&
            (requestedPath === undefined || candidate.path === requestedPath),
        );
      if (!option) throw new Error(`No option for ${question.id} at ${score}`);
      responses[question.id] = pfiV28Catalog.toScoredEvidence(option);
    }
  }
  return { ...assessment, responses };
}

function dimensionResult(
  dimensionId: string,
  score: number | null,
): DimensionResult {
  const dimension = pfiModel.dimensions.find((candidate) => candidate.id === dimensionId)!;
  if (score === null) {
    return {
      status: "insufficient-basis",
      dimensionId,
      dimensionName: dimension.name,
      standardWeightPercent: dimension.standardWeightPercent,
      score: null,
      displayScore: null,
      rawAverage: null,
      applicableQuestionCount: 3,
      scoredQuestionCount: 3,
      confirmedNaCount: 4,
    };
  }
  return {
    status: "scored",
    dimensionId,
    dimensionName: dimension.name,
    standardWeightPercent: dimension.standardWeightPercent,
    score,
    displayScore: roundForDisplay(score),
    rawAverage: score / 20,
    applicableQuestionCount: 7,
    scoredQuestionCount: 7,
    confirmedNaCount: 0,
  };
}

describe("I3 scoring and result generation", () => {
  it("uses equal applicable-question weighting, removes N/A, and enforces the four-question floor", () => {
    expect(calculateDimensionScore([5, 4, 3, 2, null, null, null])).toEqual({
      rawAverage: 3.5,
      score: 70,
      displayScore: 70,
    });
    expect(calculateDimensionScore([5, 4, 3, null, null, null, null])).toBeNull();
    expect(() => calculateDimensionScore([5, 4, 3, 2])).toThrow(
      "original seven-question frame",
    );
  });

  it("retains calculation precision and rounds only the display boundary", () => {
    const calculation = calculateDimensionScore([5, 5, 5, 4, 4, 4, 4])!;
    expect(calculation.score).toBeCloseTo(88.57142857142857, 12);
    expect(calculation.displayScore).toBe(88.6);
    expect(roundForDisplay(74.25)).toBe(74.3);
  });

  it("selects Standard, Adjusted, count-failure, and weight-failure states in governed order", () => {
    const all = pfiModel.dimensions.map((dimension) => dimensionResult(dimension.id, 60));
    expect(calculateComposite(all).state).toBe("standard");

    const adjusted = all.map((dimension, index) =>
      index < 5 ? dimension : dimensionResult(dimension.dimensionId, null),
    );
    const adjustedResult = calculateComposite(adjusted);
    expect(adjustedResult.state).toBe("adjusted");
    expect(adjustedResult.scoredDimensionCount).toBe(5);
    expect(adjustedResult.standardWeightCoveragePercent).toBe(91.62);

    const countFailure = all.map((dimension, index) =>
      index < 4 ? dimension : dimensionResult(dimension.dimensionId, null),
    );
    expect(calculateComposite(countFailure)).toMatchObject({
      state: "insufficient-basis",
      reason: "dimension-count",
    });

    const lowWeightIds = new Set([
      "revenue",
      "balance-sheet",
      "multi-rail",
      "margin-cost",
      "growth-engine",
    ]);
    const weightFailure = all.map((dimension) =>
      lowWeightIds.has(dimension.dimensionId)
        ? dimension
        : dimensionResult(dimension.dimensionId, null),
    );
    expect(calculateComposite(weightFailure)).toMatchObject({
      state: "insufficient-basis",
      reason: "weight-coverage",
      scoredDimensionCount: 5,
      standardWeightCoveragePercent: 49.27,
    });
  });

  it("applies the Adjusted gates at exactly five dimensions and 65 percent coverage", () => {
    expect(evaluateCompositeEligibility(5, 65)).toBe("adjusted");
    expect(evaluateCompositeEligibility(5, 64.999)).toBe("weight-coverage");
    expect(evaluateCompositeEligibility(4, 100)).toBe("dimension-count");
  });

  it("treats valid N/A as denominator removal with no numeric contribution", () => {
    const result = generateAssessmentResult(
      assessmentWith(3, { G4: "na", B2: "na", B3: "na" }),
    );
    expect(result.composite.state).toBe("standard");
    expect(result.dimensions.find((dimension) => dimension.dimensionId === "governance"))
      .toMatchObject({ score: 60, scoredQuestionCount: 6, confirmedNaCount: 1 });
    expect(result.dimensions.find((dimension) => dimension.dimensionId === "balance-sheet"))
      .toMatchObject({ score: 60, scoredQuestionCount: 5, confirmedNaCount: 2 });
  });

  it("rejects non-authoritative N/A and tampered persisted score metadata", () => {
    expect(() => generateAssessmentResult(assessmentWith(3, { C1: "na" }))).toThrow(
      "Confirmed N/A is not authoritative for C1",
    );
    const tampered = assessmentWith(3);
    const c1 = tampered.responses.C1;
    if (c1?.kind !== "scored") throw new Error("Expected C1 scored evidence");
    tampered.responses.C1 = { ...c1, score: 5 };
    expect(() => generateAssessmentResult(tampered)).toThrow(
      "Persisted scored evidence does not match",
    );
  });

  it("rejects unsupported assessment model versions before interpreting option IDs", () => {
    const assessment = assessmentWith(3);
    expect(() =>
      generateAssessmentResult({ ...assessment, modelId: "pfi-standard-v29" }),
    ).toThrow("is not supported by scoring catalog");
  });

  it("refuses to generate result output before all 49 responses are committed", () => {
    expect(() =>
      generateAssessmentResult(assessmentWith(3, { GE7: "unanswered" })),
    ).toThrow("49 of 49 committed responses");
  });

  it("enforces all three 0-only SRI boundaries and ordinary 0-1 SRI/Universal visibility", () => {
    const scoreOne = generateAssessmentResult(
      assessmentWith(3, { C6: 1, G2: 1, G5: 1, C2: 1, C1: 1 }),
    );
    expect(scoreOne.signals.map((signal) => signal.questionId)).toEqual(["C1", "C2"]);

    const zeroOnly = generateAssessmentResult(
      assessmentWith(3, { C6: 0, G2: 0, G5: 0 }),
    );
    expect(zeroOnly.signals.map((signal) => signal.questionId)).toEqual([
      "C6",
      "G2",
      "G5",
    ]);
  });

  it("applies Strength at 80 inclusive and withholds it when a qualifying signal is embedded", () => {
    const boundary = generateAssessmentResult(assessmentWith(4));
    expect(boundary.profile.every((entry) => entry.state === "formal-strength")).toBe(true);

    const isolatedSignal = generateAssessmentResult(
      assessmentWith(5, { C1: 0 }),
    );
    expect(
      isolatedSignal.profile.find(
        (entry) => entry.dimension.dimensionId === "client-value",
      )?.state,
    ).toBe("standard-scored");
    expect(
      isolatedSignal.dimensions.find(
        (dimension) => dimension.dimensionId === "client-value",
      )?.displayScore,
    ).toBe(85.7);
  });

  it("applies dimension-level Agenda at 40 inclusive without requiring a signal", () => {
    const result = generateAssessmentResult(assessmentWith(2));
    expect(result.signals).toHaveLength(0);
    expect(result.examinationAgenda).toHaveLength(7);
    expect(result.examinationAgenda.every((entry) => entry.type === "dimension")).toBe(true);
  });

  it("keeps Intentional Choice from causing qualification and registers it only in an already-qualified area", () => {
    const neutralChoice = generateAssessmentResult(
      assessmentWith(3, { M4: { score: 3, path: "intentional-choice" } }),
    );
    expect(
      neutralChoice.examinationAgenda.some((entry) => entry.dimensionId === "multi-rail"),
    ).toBe(false);

    const qualifyingChoice = generateAssessmentResult(
      assessmentWith(3, {
        M1: 1,
        M2: 1,
        M3: 1,
        M4: { score: 3, path: "intentional-choice" },
        M5: 1,
        M6: 1,
        M7: 1,
      }),
    );
    const agenda = qualifyingChoice.examinationAgenda.find(
      (entry) => entry.type === "dimension" && entry.dimensionId === "multi-rail",
    );
    expect(agenda).toMatchObject({
      type: "dimension",
      intentionalChoices: [
        {
          questionId: "M4",
          score: 3,
          reviewFrame: "reassess-supporting-considerations",
        },
      ],
    });
  });

  it("generates conservative convergence, isolated-signal, and null Pattern contracts", () => {
    const convergenceOverrides: Record<string, ScoreOverride> = {};
    for (const question of pfiModel.dimensions.slice(0, 3).flatMap((d) => d.questions)) {
      convergenceOverrides[question.id] = 5;
    }
    for (const [dimensionId, scores] of Object.entries({
      "multi-rail": [0, 1, 2, 2, 2, 2, 3],
      "balance-sheet": [0, 1, 1, 2, 2, 2, 3],
      "margin-cost": [0, 0, 1, 2, 2, 2, 3],
    })) {
      const dimension = pfiModel.dimensions.find((item) => item.id === dimensionId)!;
      dimension.questions.forEach((question, index) => {
        convergenceOverrides[question.id] = scores[index]!;
      });
    }
    const convergence = generateAssessmentResult(
      assessmentWith(3, convergenceOverrides),
    );
    expect(convergence.signals).toHaveLength(8);
    expect(convergence.pattern.kind).toBe("strength-signal-convergence");

    expect(generateAssessmentResult(assessmentWith(3, { C1: 0 })).pattern).toEqual({
      kind: "isolated-signal",
      signalDimensionId: "client-value",
    });
    expect(generateAssessmentResult(assessmentWith(3)).pattern).toEqual({
      kind: "no-pronounced-pattern",
    });
  });

  it("derives signals from authoritative evidence rather than stored path or score assertions", () => {
    const result = generateAssessmentResult(assessmentWith(3, { C1: 1 }));
    expect(result.signals[0]).toMatchObject({
      questionId: "C1",
      category: "universal-low-score",
      score: 1,
      construct: "Client-Need Visibility",
    });
  });

  it("returns deterministic I4 contracts without prohibited diagnostic or prescriptive fields", () => {
    const result = generateAssessmentResult(assessmentWith(3, { C1: 0 }));
    const keys = new Set<string>();
    const collectKeys = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(collectKeys);
      if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
          keys.add(key.toLowerCase());
          collectKeys(child);
        }
      }
    };
    collectKeys(result);
    for (const prohibited of [
      "diagnosis",
      "severity",
      "maturity",
      "recommendation",
      "prescription",
      "owner",
      "kpi",
      "plan",
    ]) {
      expect(keys.has(prohibited)).toBe(false);
    }
    expect(result.governingPrinciple).toBe(
      "PFI helps identify where to look. Deeper examination determines what, if anything, should change.",
    );
  });
});
