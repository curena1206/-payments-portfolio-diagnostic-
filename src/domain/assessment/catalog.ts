import { pfiModel } from "../pfi/model";
import type { PfiModel, PfiQuestion } from "../pfi/schema";
import type { ScoredEvidence } from "./evidence";

export interface AuthoritativeOption {
  id: string;
  questionId: string;
  score: number;
  path: "capability" | "intentional-choice" | null;
  text: string;
}

export interface AssessmentCatalog {
  readonly modelId: string;
  getQuestion(questionId: string): PfiQuestion;
  getOption(questionId: string, selectedOptionId: string): AuthoritativeOption;
  listOptions(questionId: string): AuthoritativeOption[];
  toScoredEvidence(option: AuthoritativeOption): ScoredEvidence;
}

function optionId(
  questionId: string,
  score: number,
  path: AuthoritativeOption["path"],
): string {
  return `${questionId}:${score}:${path ?? "common"}`;
}

class PfiAssessmentCatalog implements AssessmentCatalog {
  readonly modelId: string;
  private readonly questionsById: Map<string, PfiQuestion>;
  private readonly optionsById = new Map<string, AuthoritativeOption>();

  constructor(model: PfiModel) {
    this.modelId = model.modelId;
    const questions = model.dimensions.flatMap((dimension) => dimension.questions);
    this.questionsById = new Map(questions.map((question) => [question.id, question]));

    for (const question of questions) {
      for (const option of question.responseOptions) {
        const authoritativeOption: AuthoritativeOption = {
          id: optionId(question.id, option.score, option.path),
          questionId: question.id,
          score: option.score,
          path: option.path,
          text: option.text,
        };
        if (this.optionsById.has(authoritativeOption.id)) {
          throw new Error(`Duplicate authoritative option ${authoritativeOption.id}`);
        }
        this.optionsById.set(authoritativeOption.id, authoritativeOption);
      }
    }
  }

  getQuestion(questionId: string): PfiQuestion {
    const question = this.questionsById.get(questionId);
    if (!question) throw new Error(`Unknown PFI question: ${questionId}`);
    return question;
  }

  getOption(questionId: string, selectedOptionId: string): AuthoritativeOption {
    const option = this.optionsById.get(selectedOptionId);
    if (!option || option.questionId !== questionId) {
      throw new Error(`Option ${selectedOptionId} is not authoritative for ${questionId}`);
    }
    return option;
  }

  listOptions(questionId: string): AuthoritativeOption[] {
    this.getQuestion(questionId);
    return [...this.optionsById.values()].filter(
      (option) => option.questionId === questionId,
    );
  }

  toScoredEvidence(option: AuthoritativeOption): ScoredEvidence {
    return {
      kind: "scored",
      optionId: option.id,
      score: option.score,
      path: option.path,
    };
  }
}

export const pfiV28Catalog: AssessmentCatalog = new PfiAssessmentCatalog(pfiModel);
