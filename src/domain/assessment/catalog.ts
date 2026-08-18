import { pfiQuestions } from "../pfi/model";
import type { PfiQuestion } from "../pfi/schema";
import type { ScoredEvidence } from "./evidence";

export interface AuthoritativeOption {
  id: string;
  questionId: string;
  score: number;
  path: "capability" | "intentional-choice" | null;
  text: string;
}

const questionsById = new Map(pfiQuestions.map((question) => [question.id, question]));

function optionId(
  questionId: string,
  score: number,
  path: AuthoritativeOption["path"],
): string {
  return `${questionId}:${score}:${path ?? "common"}`;
}

const optionsById = new Map<string, AuthoritativeOption>();

for (const question of pfiQuestions) {
  for (const option of question.responseOptions) {
    const authoritativeOption: AuthoritativeOption = {
      id: optionId(question.id, option.score, option.path),
      questionId: question.id,
      score: option.score,
      path: option.path,
      text: option.text,
    };
    if (optionsById.has(authoritativeOption.id)) {
      throw new Error(`Duplicate authoritative option ${authoritativeOption.id}`);
    }
    optionsById.set(authoritativeOption.id, authoritativeOption);
  }
}

export function getAuthoritativeQuestion(questionId: string): PfiQuestion {
  const question = questionsById.get(questionId);
  if (!question) throw new Error(`Unknown PFI question: ${questionId}`);
  return question;
}

export function getAuthoritativeOption(
  questionId: string,
  selectedOptionId: string,
): AuthoritativeOption {
  const option = optionsById.get(selectedOptionId);
  if (!option || option.questionId !== questionId) {
    throw new Error(`Option ${selectedOptionId} is not authoritative for ${questionId}`);
  }
  return option;
}

export function toScoredEvidence(option: AuthoritativeOption): ScoredEvidence {
  return {
    kind: "scored",
    optionId: option.id,
    score: option.score,
    path: option.path,
  };
}

export function listAuthoritativeOptions(questionId: string): AuthoritativeOption[] {
  getAuthoritativeQuestion(questionId);
  return [...optionsById.values()].filter((option) => option.questionId === questionId);
}
