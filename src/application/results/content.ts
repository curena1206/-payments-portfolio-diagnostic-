import { pfiV28Catalog } from "../../domain/assessment/catalog";
import { pfiModel } from "../../domain/pfi/model";
import type {
  ExaminationAgendaEntry,
  GeneratedAssessmentResult,
  PatternResult,
  ProfileEntry,
  QualifyingSignal,
} from "../../domain/results/types";

const dimensionsById = new Map(
  pfiModel.dimensions.map((dimension) => [dimension.id, dimension]),
);

export function dimensionName(dimensionId: string): string {
  const dimension = dimensionsById.get(dimensionId);
  if (!dimension) throw new Error(`Unknown PFI dimension: ${dimensionId}`);
  return dimension.name;
}

function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

export function patternCopy(
  pattern: PatternResult,
  profileDimensionOrder: string[],
): string {
  const byProfileOrder = (ids: string[]) =>
    [...ids].sort(
      (left, right) =>
        profileDimensionOrder.indexOf(left) - profileDimensionOrder.indexOf(right),
    );
  if (pattern.kind === "strength-signal-convergence") {
    return `Strength evidence appears across ${formatList(byProfileOrder(pattern.strengthDimensionIds).map(dimensionName))}, while qualifying question-level signals occur within ${formatList(byProfileOrder(pattern.signalDimensionIds).map(dimensionName))} rather than being scattered elsewhere in the profile.`;
  }
  if (pattern.kind === "isolated-signal") {
    return `A qualifying question-level signal appears within ${dimensionName(pattern.signalDimensionId)}, while no pronounced broader cross-dimension pattern is evident from this assessment.`;
  }
  return "No pronounced cross-dimension pattern is evident from this assessment.";
}

export function strengthEvidence(entry: ProfileEntry): string[] {
  if (entry.state !== "formal-strength") return [];
  return entry.evidenceOptionIds.slice(0, 2).map((optionId) => {
    const questionId = optionId.split(":", 1)[0]!;
    const question = pfiV28Catalog.getQuestion(questionId);
    const option = pfiV28Catalog.getOption(questionId, optionId);
    return `${question.title}: ${option.text}`;
  });
}

export interface AgendaContent {
  shows: Array<{ label: string; evidence: string }>;
  why: string;
  next: string;
  intentionalChoices: Array<{ evidence: string; next: string }>;
}

function signalContent(signal: QualifyingSignal): AgendaContent {
  const question = pfiV28Catalog.getQuestion(signal.questionId);
  return {
    shows: [{ label: signal.construct, evidence: signal.evidenceText }],
    why: question.constructMeasured,
    next: `Examine the evidence used to assess ${question.title.toLowerCase()}, including how current and consistently applied that evidence is.`,
    intentionalChoices: [],
  };
}

export function agendaContent(
  entry: ExaminationAgendaEntry,
  result: GeneratedAssessmentResult,
): AgendaContent {
  if (entry.type === "question") {
    const signal = result.signals.find(
      (candidate) => candidate.questionId === entry.questionId,
    );
    if (!signal) throw new Error(`Agenda signal ${entry.questionId} is unavailable`);
    return signalContent(signal);
  }

  const signals = entry.signalQuestionIds.map((questionId) => {
    const signal = result.signals.find(
      (candidate) => candidate.questionId === questionId,
    );
    if (!signal) throw new Error(`Agenda signal ${questionId} is unavailable`);
    return signal;
  });
  const evidenceQuestions = (signals.length > 0
    ? signals.map((signal) => pfiV28Catalog.getQuestion(signal.questionId))
    : entry.evidenceOptionIds.slice(0, 3).map((optionId) =>
        pfiV28Catalog.getQuestion(optionId.split(":", 1)[0]!),
      ));
  const shows = (signals.length > 0
    ? signals.map((signal) => ({
        label: signal.construct,
        evidence: signal.evidenceText,
      }))
    : entry.evidenceOptionIds.slice(0, 3).map((optionId) => {
        const questionId = optionId.split(":", 1)[0]!;
        return {
          label: pfiV28Catalog.getQuestion(questionId).title,
          evidence: pfiV28Catalog.getOption(questionId, optionId).text,
        };
      }));
  return {
    shows,
    why: `The selected evidence bears on ${formatList(evidenceQuestions.map((question) => question.constructMeasured.replace(/\.$/, "").toLowerCase()))}.`,
    next: `Examine the evidence used to assess ${formatList(evidenceQuestions.map((question) => question.title.toLowerCase()))}, including how current and consistently applied that evidence is.`,
    intentionalChoices: entry.intentionalChoices.map((choice) => ({
      evidence: `This response records a deliberate choice: ${choice.evidenceText}`,
      next: "Examine whether the assumptions supporting that choice continue to hold.",
    })),
  };
}
