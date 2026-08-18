import type { AssessmentAggregate } from "../assessment/aggregate";
import { assertCanonicalResponseSet } from "../assessment/aggregate";
import type { AssessmentCatalog } from "../assessment/catalog";
import { pfiV28Catalog } from "../assessment/catalog";
import { pfiModel } from "../pfi/model";
import type { PfiDimension } from "../pfi/schema";
import type {
  CompositeResult,
  DimensionResult,
  ResolvedQuestionEvidence,
} from "./types";

export const DISPLAY_DECIMAL_PLACES = 1;

export function roundForDisplay(value: number): number {
  const multiplier = 10 ** DISPLAY_DECIMAL_PLACES;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

export function calculateDimensionScore(
  scores: ReadonlyArray<number | null>,
  evidenceFloor = pfiModel.dimensionEvidenceFloor,
): { rawAverage: number; score: number; displayScore: number } | null {
  if (scores.length !== 7) {
    throw new Error("Dimension scoring requires the original seven-question frame");
  }
  const applicableScores = scores.filter((score): score is number => score !== null);
  if (applicableScores.some((score) => !Number.isInteger(score) || score < 0 || score > 5)) {
    throw new Error("Dimension question scores must be integers from 0 to 5");
  }
  if (applicableScores.length < evidenceFloor) return null;
  const rawAverage =
    applicableScores.reduce((total, score) => total + score, 0) /
    applicableScores.length;
  const score = rawAverage * 20;
  return { rawAverage, score, displayScore: roundForDisplay(score) };
}

export function resolveAssessmentEvidence(
  assessment: AssessmentAggregate,
  catalog: AssessmentCatalog = pfiV28Catalog,
): ResolvedQuestionEvidence[] {
  if (assessment.modelId !== catalog.modelId || assessment.modelId !== pfiModel.modelId) {
    throw new Error(
      `Assessment model ${assessment.modelId} is not supported by scoring catalog ${catalog.modelId}`,
    );
  }
  assertCanonicalResponseSet(assessment.responses);

  return pfiModel.dimensions.flatMap((dimension) =>
    dimension.questions.map((question): ResolvedQuestionEvidence => {
      const response = assessment.responses[question.id]!;
      if (response.kind === "unanswered") {
        return { kind: "unanswered", questionId: question.id, dimensionId: dimension.id };
      }
      if (response.kind === "confirmed-na") {
        if (!question.naEligible) {
          throw new Error(`Confirmed N/A is not authoritative for ${question.id}`);
        }
        return {
          kind: "confirmed-na",
          questionId: question.id,
          dimensionId: dimension.id,
          confirmedAt: response.confirmedAt,
        };
      }
      const option = catalog.getOption(question.id, response.optionId);
      if (response.score !== option.score || response.path !== option.path) {
        throw new Error(`Persisted scored evidence does not match ${response.optionId}`);
      }
      return {
        kind: "scored",
        questionId: question.id,
        dimensionId: dimension.id,
        optionId: option.id,
        score: option.score,
        path: option.path,
        evidenceText: option.text,
      };
    }),
  );
}

export function scoreDimension(
  dimension: PfiDimension,
  evidence: ResolvedQuestionEvidence[],
): DimensionResult {
  const dimensionEvidence = evidence.filter((item) => item.dimensionId === dimension.id);
  const scored = dimensionEvidence.filter((item) => item.kind === "scored");
  const confirmedNaCount = dimensionEvidence.filter(
    (item) => item.kind === "confirmed-na",
  ).length;
  const calculation = calculateDimensionScore(
    dimension.questions.map((question) => {
      const item = dimensionEvidence.find(
        (candidate) => candidate.questionId === question.id,
      );
      return item?.kind === "scored" ? item.score : null;
    }),
  );
  const common = {
    dimensionId: dimension.id,
    dimensionName: dimension.name,
    standardWeightPercent: dimension.standardWeightPercent,
    applicableQuestionCount: scored.length,
    scoredQuestionCount: scored.length,
    confirmedNaCount,
  };
  if (!calculation) {
    return {
      ...common,
      status: "insufficient-basis",
      score: null,
      displayScore: null,
      rawAverage: null,
    };
  }
  return { ...common, status: "scored", ...calculation };
}

export function evaluateCompositeEligibility(
  scoredDimensionCount: number,
  standardWeightCoveragePercent: number,
): "standard" | "adjusted" | "dimension-count" | "weight-coverage" {
  if (scoredDimensionCount === 7) return "standard";
  if (scoredDimensionCount < 5) return "dimension-count";
  if (standardWeightCoveragePercent < 65) return "weight-coverage";
  return "adjusted";
}

export function calculateComposite(dimensions: DimensionResult[]): CompositeResult {
  const scored = dimensions.filter(
    (dimension): dimension is Extract<DimensionResult, { status: "scored" }> =>
      dimension.status === "scored",
  );
  const missingDimensions = dimensions
    .filter((dimension) => dimension.status === "insufficient-basis")
    .map((dimension) => ({
      dimensionId: dimension.dimensionId,
      dimensionName: dimension.dimensionName,
      standardWeightPercent: dimension.standardWeightPercent,
    }));
  const coverage = scored.reduce(
    (total, dimension) => total + dimension.standardWeightPercent,
    0,
  );
  const weightedTotal = scored.reduce(
    (total, dimension) => total + dimension.standardWeightPercent * dimension.score,
    0,
  );
  const eligibility = evaluateCompositeEligibility(scored.length, coverage);

  if (eligibility === "standard") {
    const score = weightedTotal / 100;
    return {
      state: "standard",
      score,
      displayScore: roundForDisplay(score),
      scoredDimensionCount: 7,
      standardWeightCoveragePercent: 100,
      missingDimensions: [],
    };
  }
  if (eligibility === "dimension-count") {
    return {
      state: "insufficient-basis",
      reason: "dimension-count",
      score: null,
      displayScore: null,
      scoredDimensionCount: scored.length,
      standardWeightCoveragePercent: coverage,
      missingDimensions,
    };
  }
  if (eligibility === "weight-coverage") {
    return {
      state: "insufficient-basis",
      reason: "weight-coverage",
      score: null,
      displayScore: null,
      scoredDimensionCount: scored.length,
      standardWeightCoveragePercent: coverage,
      missingDimensions,
    };
  }
  const score = weightedTotal / coverage;
  return {
    state: "adjusted",
    score,
    displayScore: roundForDisplay(score),
    scoredDimensionCount: scored.length,
    standardWeightCoveragePercent: coverage,
    missingDimensions,
  };
}

export function scoreAssessment(
  assessment: AssessmentAggregate,
  catalog: AssessmentCatalog = pfiV28Catalog,
): { dimensions: DimensionResult[]; evidence: ResolvedQuestionEvidence[] } {
  const evidence = resolveAssessmentEvidence(assessment, catalog);
  return {
    evidence,
    dimensions: pfiModel.dimensions.map((dimension) => scoreDimension(dimension, evidence)),
  };
}
