import type { IdentityRepository } from "../identity/contracts";
import {
  assertCanonicalResponseSet,
  createAssessmentAggregate,
  type AssessmentAggregate,
} from "./aggregate";
import type { AssessmentCatalog } from "./catalog";
import { getAssessmentProgress } from "./progress";
import {
  AssessmentNotFoundError,
  type AssessmentRepository,
} from "./repository";

export interface AssessmentServiceDependencies {
  assessments: AssessmentRepository;
  catalog: AssessmentCatalog;
  identities: IdentityRepository;
  now: () => string;
  newId: () => string;
}

interface CommandIdentity {
  idempotencyKey: string;
}

function fingerprint(type: string, payload: object): string {
  return JSON.stringify({ type, ...payload });
}

export class AssessmentService {
  constructor(private readonly dependencies: AssessmentServiceDependencies) {}

  async createAssessment(
    input: CommandIdentity & { recoveryContactId?: string | null },
  ): Promise<AssessmentAggregate> {
    if (input.recoveryContactId) await this.requireContact(input.recoveryContactId);
    const assessment = createAssessmentAggregate({
      id: this.dependencies.newId(),
      now: this.dependencies.now(),
      recoveryContactId: input.recoveryContactId ?? null,
    });
    this.assertModelBinding(assessment);
    return this.dependencies.assessments.save({
      assessment,
      expectedRevision: null,
      idempotencyKey: input.idempotencyKey,
      commandFingerprint: fingerprint("create", {
        recoveryContactId: input.recoveryContactId ?? null,
      }),
    });
  }

  async recordScoredResponse(
    input: CommandIdentity & {
      assessmentId: string;
      questionId: string;
      optionId: string;
    },
  ): Promise<AssessmentAggregate> {
    return this.update(
      input.assessmentId,
      input.idempotencyKey,
      fingerprint("score", {
        assessmentId: input.assessmentId,
        questionId: input.questionId,
        optionId: input.optionId,
      }),
      (assessment) => {
        const option = this.dependencies.catalog.getOption(
          input.questionId,
          input.optionId,
        );
        return {
          ...assessment,
          responses: {
            ...assessment.responses,
            [input.questionId]: this.dependencies.catalog.toScoredEvidence(option),
          },
        };
      },
    );
  }

  async confirmNotApplicable(
    input: CommandIdentity & {
      assessmentId: string;
      questionId: string;
    },
  ): Promise<AssessmentAggregate> {
    const confirmedAt = this.dependencies.now();
    return this.update(
      input.assessmentId,
      input.idempotencyKey,
      fingerprint("confirm-na", {
        assessmentId: input.assessmentId,
        questionId: input.questionId,
      }),
      (assessment) => {
        const question = this.dependencies.catalog.getQuestion(input.questionId);
        if (!question.naEligible) {
          throw new Error(`${input.questionId} is not N/A-eligible`);
        }
        return {
          ...assessment,
          responses: {
            ...assessment.responses,
            [input.questionId]: { kind: "confirmed-na", confirmedAt },
          },
        };
      },
    );
  }

  async cancelNotApplicable(assessmentId: string): Promise<AssessmentAggregate> {
    return this.resumeAssessment(assessmentId);
  }

  async associateRecoveryContact(
    input: CommandIdentity & { assessmentId: string; contactId: string },
  ): Promise<AssessmentAggregate> {
    await this.requireContact(input.contactId);
    return this.update(
      input.assessmentId,
      input.idempotencyKey,
      fingerprint("associate-recovery", input),
      (assessment) => ({ ...assessment, recoveryContactId: input.contactId }),
    );
  }

  async supersedeAssessment(
    input: CommandIdentity & { assessmentId: string },
  ): Promise<AssessmentAggregate> {
    return this.update(
      input.assessmentId,
      input.idempotencyKey,
      fingerprint("supersede", input),
      (assessment) => ({ ...assessment, lifecycle: "superseded" }),
    );
  }

  async resumeAssessment(assessmentId: string): Promise<AssessmentAggregate> {
    const assessment = await this.dependencies.assessments.load(assessmentId);
    if (!assessment) throw new AssessmentNotFoundError(assessmentId);
    this.assertModelBinding(assessment);
    assertCanonicalResponseSet(assessment.responses);
    return assessment;
  }

  async resumeLatestForContact(contactId: string): Promise<AssessmentAggregate | null> {
    await this.requireContact(contactId);
    return this.dependencies.assessments.findLatestRecoverable(contactId);
  }

  private async update(
    assessmentId: string,
    idempotencyKey: string,
    commandFingerprint: string,
    mutate: (assessment: AssessmentAggregate) => AssessmentAggregate,
  ): Promise<AssessmentAggregate> {
    const existing = await this.resumeAssessment(assessmentId);
    if (existing.lifecycle === "superseded") {
      throw new Error("A superseded assessment cannot be changed");
    }
    const now = this.dependencies.now();
    const changed = mutate(existing);
    const progress = getAssessmentProgress(changed);
    const assessment: AssessmentAggregate = {
      ...changed,
      lifecycle: progress.resultEligible ? "complete" : changed.lifecycle,
      revision: existing.revision + 1,
      updatedAt: now,
      completedAt: progress.resultEligible ? (existing.completedAt ?? now) : null,
    };
    assertCanonicalResponseSet(assessment.responses);
    return this.dependencies.assessments.save({
      assessment,
      expectedRevision: existing.revision,
      idempotencyKey,
      commandFingerprint,
    });
  }

  private async requireContact(contactId: string): Promise<void> {
    if (!(await this.dependencies.identities.getContact(contactId))) {
      throw new Error(`Unknown recovery Contact: ${contactId}`);
    }
  }

  private assertModelBinding(assessment: AssessmentAggregate): void {
    if (assessment.modelId !== this.dependencies.catalog.modelId) {
      throw new AssessmentModelMismatchError(
        assessment.id,
        assessment.modelId,
        this.dependencies.catalog.modelId,
      );
    }
  }
}

export class AssessmentModelMismatchError extends Error {
  constructor(assessmentId: string, recordedModelId: string, catalogModelId: string) {
    super(
      `Assessment ${assessmentId} records unsupported model ${recordedModelId}; ` +
        `active catalog is ${catalogModelId}`,
    );
  }
}
