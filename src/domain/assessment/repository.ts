import type { AssessmentAggregate } from "./aggregate";

export interface SaveAssessmentCommand {
  assessment: AssessmentAggregate;
  expectedRevision: number | null;
  idempotencyKey: string;
  commandFingerprint: string;
}

export interface AssessmentRepository {
  load(assessmentId: string): Promise<AssessmentAggregate | null>;
  save(command: SaveAssessmentCommand): Promise<AssessmentAggregate>;
  findLatestRecoverable(contactId: string): Promise<AssessmentAggregate | null>;
}

export class AssessmentNotFoundError extends Error {}
export class AssessmentConflictError extends Error {}
export class IdempotencyConflictError extends Error {}
