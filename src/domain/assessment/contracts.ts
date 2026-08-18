export type CommittedAnswer =
  | { kind: "scored"; optionIndex: number }
  | { kind: "not-applicable"; evidence: string };

export interface AssessmentAnswerRecord {
  assessmentInstanceId: string;
  questionId: string;
  answer: CommittedAnswer;
  revision: number;
  updatedAt: string;
}

export interface AssessmentAnswerRepository {
  list(assessmentInstanceId: string): Promise<AssessmentAnswerRecord[]>;
  save(record: AssessmentAnswerRecord): Promise<void>;
}

export interface PersistenceServices {
  answers: AssessmentAnswerRepository;
}
