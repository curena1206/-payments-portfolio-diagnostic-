import {
  assessmentAggregateSchema,
  type AssessmentAggregate,
} from "../../domain/assessment/aggregate";
import {
  AssessmentConflictError,
  IdempotencyConflictError,
  type AssessmentRepository,
  type SaveAssessmentCommand,
} from "../../domain/assessment/repository";

interface PersistedAssessmentState {
  assessments: Record<string, AssessmentAggregate>;
  commands: Record<
    string,
    { fingerprint: string; result: AssessmentAggregate }
  >;
}

const EMPTY_STATE: PersistedAssessmentState = { assessments: {}, commands: {} };

export class BrowserAssessmentRepository implements AssessmentRepository {
  constructor(
    private readonly storage: Storage,
    private readonly storageKey = "pfi.assessments.v1",
  ) {}

  load(assessmentId: string): Promise<AssessmentAggregate | null> {
    const assessment = this.read().assessments[assessmentId];
    return Promise.resolve(
      assessment ? assessmentAggregateSchema.parse(structuredClone(assessment)) : null,
    );
  }

  save(command: SaveAssessmentCommand): Promise<AssessmentAggregate> {
    return Promise.resolve().then(() => {
      const state = this.read();
      const prior = state.commands[command.idempotencyKey];
      if (prior) {
        if (prior.fingerprint !== command.commandFingerprint) {
          throw new IdempotencyConflictError(command.idempotencyKey);
        }
        return assessmentAggregateSchema.parse(structuredClone(prior.result));
      }

      const current = state.assessments[command.assessment.id];
      if (command.expectedRevision === null) {
        if (current) throw new AssessmentConflictError(command.assessment.id);
      } else if (!current || current.revision !== command.expectedRevision) {
        throw new AssessmentConflictError(command.assessment.id);
      }

      const saved = assessmentAggregateSchema.parse(command.assessment);
      const next: PersistedAssessmentState = {
        assessments: { ...state.assessments, [saved.id]: saved },
        commands: {
          ...state.commands,
          [command.idempotencyKey]: {
            fingerprint: command.commandFingerprint,
            result: saved,
          },
        },
      };
      this.storage.setItem(this.storageKey, JSON.stringify(next));
      return assessmentAggregateSchema.parse(structuredClone(saved));
    });
  }

  findLatestRecoverable(contactId: string): Promise<AssessmentAggregate | null> {
    const latest = Object.values(this.read().assessments)
      .filter(
        (assessment) =>
          assessment.recoveryContactId === contactId &&
          assessment.lifecycle === "in-progress",
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
    return Promise.resolve(latest ? assessmentAggregateSchema.parse(latest) : null);
  }

  private read(): PersistedAssessmentState {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return structuredClone(EMPTY_STATE);
    const parsed = JSON.parse(raw) as PersistedAssessmentState;
    return {
      assessments: Object.fromEntries(
        Object.entries(parsed.assessments).map(([id, assessment]) => [
          id,
          assessmentAggregateSchema.parse(assessment),
        ]),
      ),
      commands: Object.fromEntries(
        Object.entries(parsed.commands).map(([key, command]) => [
          key,
          {
            fingerprint: command.fingerprint,
            result: assessmentAggregateSchema.parse(command.result),
          },
        ]),
      ),
    };
  }
}
