import { assessmentAggregateSchema, type AssessmentAggregate } from "../../domain/assessment/aggregate";
import {
  AssessmentConflictError,
  IdempotencyConflictError,
  type AssessmentRepository,
  type SaveAssessmentCommand,
} from "../../domain/assessment/repository";

interface IdempotencyRecord {
  fingerprint: string;
  result: AssessmentAggregate;
}

function clone(assessment: AssessmentAggregate): AssessmentAggregate {
  return assessmentAggregateSchema.parse(structuredClone(assessment));
}

export class InMemoryAssessmentRepository implements AssessmentRepository {
  private readonly assessments = new Map<string, AssessmentAggregate>();
  private readonly idempotency = new Map<string, IdempotencyRecord>();
  public successfulWriteCount = 0;

  async load(assessmentId: string): Promise<AssessmentAggregate | null> {
    const assessment = this.assessments.get(assessmentId);
    return Promise.resolve(assessment ? clone(assessment) : null);
  }

  save(command: SaveAssessmentCommand): Promise<AssessmentAggregate> {
    return Promise.resolve().then(() => {
      const priorCommand = this.idempotency.get(command.idempotencyKey);
      if (priorCommand) {
        if (priorCommand.fingerprint !== command.commandFingerprint) {
          throw new IdempotencyConflictError(command.idempotencyKey);
        }
        return clone(priorCommand.result);
      }

      const current = this.assessments.get(command.assessment.id);
      if (command.expectedRevision === null) {
        if (current) throw new AssessmentConflictError(command.assessment.id);
      } else if (!current || current.revision !== command.expectedRevision) {
        throw new AssessmentConflictError(command.assessment.id);
      }

      const saved = clone(command.assessment);
      this.assessments.set(saved.id, saved);
      this.idempotency.set(command.idempotencyKey, {
        fingerprint: command.commandFingerprint,
        result: saved,
      });
      this.successfulWriteCount += 1;
      return clone(saved);
    });
  }

  async findLatestRecoverable(contactId: string): Promise<AssessmentAggregate | null> {
    const matches = [...this.assessments.values()]
      .filter(
        (assessment) =>
          assessment.recoveryContactId === contactId &&
          assessment.lifecycle === "in-progress",
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    const latest = matches[0];
    return Promise.resolve(latest ? clone(latest) : null);
  }
}
