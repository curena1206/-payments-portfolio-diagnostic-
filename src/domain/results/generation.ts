import type { AssessmentAggregate } from "../assessment/aggregate";
import type { AssessmentCatalog } from "../assessment/catalog";
import { pfiV28Catalog } from "../assessment/catalog";
import { pfiModel } from "../pfi/model";
import { calculateComposite, scoreAssessment } from "./scoring";
import type {
  DimensionResult,
  ExaminationAgendaEntry,
  GeneratedAssessmentResult,
  PatternResult,
  ProfileEntry,
  QualifyingSignal,
  ResolvedQuestionEvidence,
  ResolvedScoredEvidence,
} from "./types";

const questionById = new Map(
  pfiModel.dimensions.flatMap((dimension) =>
    dimension.questions.map((question) => [question.id, question]),
  ),
);

function isSignalScore(
  score: number,
  visibility: "sri" | "universal-low-score",
  sriActivation: "0-only" | "0-1" | null,
): score is 0 | 1 {
  if (visibility === "universal-low-score") return score === 0 || score === 1;
  return sriActivation === "0-only" ? score === 0 : score === 0 || score === 1;
}

export function generateSignals(
  evidence: ResolvedQuestionEvidence[],
): QualifyingSignal[] {
  return evidence.flatMap((item): QualifyingSignal[] => {
    if (item.kind !== "scored") return [];
    const question = questionById.get(item.questionId);
    if (!question) throw new Error(`Unknown PFI question: ${item.questionId}`);
    if (!isSignalScore(item.score, question.visibility, question.sriActivation)) return [];
    return [
      {
        questionId: item.questionId,
        dimensionId: item.dimensionId,
        construct: question.title,
        category: question.visibility,
        score: item.score,
        optionId: item.optionId,
        evidenceText: item.evidenceText,
      },
    ];
  });
}

export function generateProfile(
  dimensions: DimensionResult[],
  evidence: ResolvedQuestionEvidence[],
  signals: QualifyingSignal[],
): ProfileEntry[] {
  return dimensions.map((dimension): ProfileEntry => {
    if (dimension.status === "insufficient-basis") {
      return { state: "insufficient-basis", dimension, evidenceOptionIds: [] };
    }
    const dimensionSignals = signals.some(
      (signal) => signal.dimensionId === dimension.dimensionId,
    );
    const evidenceOptionIds = evidence
      .filter(
        (item): item is ResolvedScoredEvidence =>
          item.kind === "scored" && item.dimensionId === dimension.dimensionId,
      )
      .map((item) => item.optionId);
    return {
      state:
        dimension.score >= 80 && !dimensionSignals
          ? "formal-strength"
          : "standard-scored",
      dimension,
      evidenceOptionIds,
    };
  });
}

export function generateExaminationAgenda(
  dimensions: DimensionResult[],
  evidence: ResolvedQuestionEvidence[],
  signals: QualifyingSignal[],
): ExaminationAgendaEntry[] {
  const entries: ExaminationAgendaEntry[] = [];
  for (const dimension of dimensions) {
    if (dimension.status !== "scored") continue;
    const dimensionEvidence = evidence.filter(
      (item): item is ResolvedScoredEvidence =>
        item.kind === "scored" && item.dimensionId === dimension.dimensionId,
    );
    const dimensionSignals = signals.filter(
      (signal) => signal.dimensionId === dimension.dimensionId,
    );
    if (dimension.score <= 40) {
      entries.push({
        type: "dimension",
        dimensionId: dimension.dimensionId,
        dimensionScore: dimension.score,
        signalQuestionIds: dimensionSignals.map((signal) => signal.questionId),
        evidenceOptionIds: dimensionEvidence.map((item) => item.optionId),
        intentionalChoices: dimensionEvidence
          .filter((item) => item.path === "intentional-choice" && item.score >= 3)
          .map((item) => ({
            questionId: item.questionId,
            optionId: item.optionId,
            score: item.score as 3 | 4 | 5,
            evidenceText: item.evidenceText,
            reviewFrame: "reassess-supporting-considerations",
          })),
      });
      continue;
    }
    for (const signal of dimensionSignals) {
      entries.push({
        type: "question",
        dimensionId: dimension.dimensionId,
        questionId: signal.questionId,
        signalCategory: signal.category,
        evidenceOptionId: signal.optionId,
        intentionalChoices: [],
      });
    }
  }
  return entries;
}

export function generatePattern(
  profile: ProfileEntry[],
  signals: QualifyingSignal[],
  agenda: ExaminationAgendaEntry[],
): PatternResult {
  const strengthDimensionIds = profile
    .filter((entry) => entry.state === "formal-strength")
    .map((entry) => entry.dimension.dimensionId);
  const signalDimensionIds = [...new Set(signals.map((signal) => signal.dimensionId))];
  const agendaDimensionIds = agenda
    .filter((entry) => entry.type === "dimension")
    .map((entry) => entry.dimensionId);
  if (
    strengthDimensionIds.length > 0 &&
    signalDimensionIds.length > 0 &&
    agendaDimensionIds.length > 0 &&
    signalDimensionIds.every((dimensionId) => agendaDimensionIds.includes(dimensionId))
  ) {
    return {
      kind: "strength-signal-convergence",
      strengthDimensionIds,
      signalDimensionIds,
      agendaDimensionIds,
    };
  }
  if (signalDimensionIds.length === 1) {
    return { kind: "isolated-signal", signalDimensionId: signalDimensionIds[0]! };
  }
  return { kind: "no-pronounced-pattern" };
}

export function generateAssessmentResult(
  assessment: AssessmentAggregate,
  catalog: AssessmentCatalog = pfiV28Catalog,
): GeneratedAssessmentResult {
  const { dimensions, evidence } = scoreAssessment(assessment, catalog);
  if (evidence.some((item) => item.kind === "unanswered")) {
    throw new Error("Assessment results require 49 of 49 committed responses");
  }
  const signals = generateSignals(evidence);
  const profile = generateProfile(dimensions, evidence, signals);
  const examinationAgenda = generateExaminationAgenda(dimensions, evidence, signals);
  return {
    modelId: assessment.modelId,
    composite: calculateComposite(dimensions),
    dimensions,
    profile,
    signals,
    pattern: generatePattern(profile, signals, examinationAgenda),
    examinationAgenda,
    governingPrinciple:
      "PFI helps identify where to look. Deeper examination determines what, if anything, should change.",
  };
}
