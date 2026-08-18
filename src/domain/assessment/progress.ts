import type { AssessmentAggregate } from "./aggregate";
import { pfiModel } from "../pfi/model";

export interface DimensionProgress {
  dimensionId: string;
  complete: number;
  total: 7;
}

export interface AssessmentProgress {
  complete: number;
  total: 49;
  resultEligible: boolean;
}

export function getDimensionProgress(
  assessment: AssessmentAggregate,
): DimensionProgress[] {
  return pfiModel.dimensions.map((dimension) => ({
    dimensionId: dimension.id,
    complete: dimension.questions.filter((question) => {
      const response = assessment.responses[question.id];
      return response !== undefined && response.kind !== "unanswered";
    }).length,
    total: 7,
  }));
}

export function getAssessmentProgress(
  assessment: AssessmentAggregate,
): AssessmentProgress {
  const complete = Object.values(assessment.responses).filter(
    (response) => response.kind !== "unanswered",
  ).length;
  return { complete, total: 49, resultEligible: complete === 49 };
}
