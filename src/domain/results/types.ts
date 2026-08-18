export type DimensionResult =
  | {
      status: "scored";
      dimensionId: string;
      dimensionName: string;
      standardWeightPercent: number;
      score: number;
      displayScore: number;
      rawAverage: number;
      applicableQuestionCount: number;
      scoredQuestionCount: number;
      confirmedNaCount: number;
    }
  | {
      status: "insufficient-basis";
      dimensionId: string;
      dimensionName: string;
      standardWeightPercent: number;
      score: null;
      displayScore: null;
      rawAverage: null;
      applicableQuestionCount: number;
      scoredQuestionCount: number;
      confirmedNaCount: number;
    };

export interface MissingDimension {
  dimensionId: string;
  dimensionName: string;
  standardWeightPercent: number;
}

export type CompositeResult =
  | {
      state: "standard";
      score: number;
      displayScore: number;
      scoredDimensionCount: 7;
      standardWeightCoveragePercent: 100;
      missingDimensions: [];
    }
  | {
      state: "adjusted";
      score: number;
      displayScore: number;
      scoredDimensionCount: number;
      standardWeightCoveragePercent: number;
      missingDimensions: MissingDimension[];
    }
  | {
      state: "insufficient-basis";
      reason: "dimension-count" | "weight-coverage";
      score: null;
      displayScore: null;
      scoredDimensionCount: number;
      standardWeightCoveragePercent: number;
      missingDimensions: MissingDimension[];
    };

export interface ResolvedScoredEvidence {
  kind: "scored";
  questionId: string;
  dimensionId: string;
  optionId: string;
  score: number;
  path: "capability" | "intentional-choice" | null;
  evidenceText: string;
}

export interface ResolvedConfirmedNaEvidence {
  kind: "confirmed-na";
  questionId: string;
  dimensionId: string;
  confirmedAt: string;
}

export interface ResolvedUnansweredEvidence {
  kind: "unanswered";
  questionId: string;
  dimensionId: string;
}

export type ResolvedQuestionEvidence =
  | ResolvedScoredEvidence
  | ResolvedConfirmedNaEvidence
  | ResolvedUnansweredEvidence;

export interface QualifyingSignal {
  questionId: string;
  dimensionId: string;
  construct: string;
  category: "sri" | "universal-low-score";
  score: 0 | 1;
  optionId: string;
  evidenceText: string;
}

export type ProfileEntry =
  | {
      state: "formal-strength" | "standard-scored";
      dimension: Extract<DimensionResult, { status: "scored" }>;
      evidenceOptionIds: string[];
    }
  | {
      state: "insufficient-basis";
      dimension: Extract<DimensionResult, { status: "insufficient-basis" }>;
      evidenceOptionIds: [];
    };

export interface IntentionalChoiceRegisterEntry {
  questionId: string;
  optionId: string;
  score: 3 | 4 | 5;
  evidenceText: string;
  reviewFrame: "reassess-supporting-considerations";
}

export type ExaminationAgendaEntry =
  | {
      type: "dimension";
      dimensionId: string;
      dimensionScore: number;
      signalQuestionIds: string[];
      evidenceOptionIds: string[];
      intentionalChoices: IntentionalChoiceRegisterEntry[];
    }
  | {
      type: "question";
      dimensionId: string;
      questionId: string;
      signalCategory: QualifyingSignal["category"];
      evidenceOptionId: string;
      intentionalChoices: [];
    };

export type PatternResult =
  | {
      kind: "strength-signal-convergence";
      strengthDimensionIds: string[];
      signalDimensionIds: string[];
      agendaDimensionIds: string[];
    }
  | {
      kind: "isolated-signal";
      signalDimensionId: string;
    }
  | {
      kind: "no-pronounced-pattern";
    };

export interface GeneratedAssessmentResult {
  modelId: string;
  composite: CompositeResult;
  dimensions: DimensionResult[];
  profile: ProfileEntry[];
  signals: QualifyingSignal[];
  pattern: PatternResult;
  examinationAgenda: ExaminationAgendaEntry[];
  governingPrinciple: "PFI helps identify where to look. Deeper examination determines what, if anything, should change.";
}
