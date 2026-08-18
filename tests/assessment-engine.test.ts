import { beforeEach, describe, expect, it } from "vitest";
import { createAssessmentAggregate } from "../src/domain/assessment/aggregate";
import { pfiV28Catalog } from "../src/domain/assessment/catalog";
import {
  getAssessmentProgress,
  getDimensionProgress,
} from "../src/domain/assessment/progress";
import {
  AssessmentConflictError,
  IdempotencyConflictError,
} from "../src/domain/assessment/repository";
import {
  AssessmentModelMismatchError,
  AssessmentService,
} from "../src/domain/assessment/service";
import {
  contactSchema,
  type Contact,
  type IdentityRepository,
} from "../src/domain/identity/contracts";
import { pfiQuestions } from "../src/domain/pfi/model";
import { InMemoryAssessmentRepository } from "../src/infrastructure/persistence/InMemoryAssessmentRepository";

const assessmentId1 = "10000000-0000-4000-8000-000000000001";
const assessmentId2 = "10000000-0000-4000-8000-000000000002";
const contactId = "20000000-0000-4000-8000-000000000001";

class InMemoryIdentityRepository implements IdentityRepository {
  private readonly contacts = new Map<string, Contact>();

  add(contact: Contact): void {
    this.contacts.set(contact.id, contact);
  }

  getContact(id: string): Promise<Contact | null> {
    return Promise.resolve(this.contacts.get(id) ?? null);
  }

  findContactByEmail(email: string): Promise<Contact | null> {
    return Promise.resolve(
      [...this.contacts.values()].find((contact) => contact.email === email) ?? null,
    );
  }

  saveContact(contact: Contact): Promise<void> {
    this.contacts.set(contact.id, contact);
    return Promise.resolve();
  }
}

describe("I1 assessment engine and persistence", () => {
  let assessments: InMemoryAssessmentRepository;
  let identities: InMemoryIdentityRepository;
  let service: AssessmentService;
  let nextId: number;
  let tick: number;

  beforeEach(() => {
    assessments = new InMemoryAssessmentRepository();
    identities = new InMemoryIdentityRepository();
    nextId = 1;
    tick = 0;
    service = new AssessmentService({
      assessments,
      catalog: pfiV28Catalog,
      identities,
      newId: () =>
        nextId++ === 1
          ? assessmentId1
          : assessmentId2,
      now: () => `2026-08-18T10:${String(tick++).padStart(2, "0")}:00+02:00`,
    });
  });

  it("creates one canonical Unanswered state for every authoritative question", async () => {
    const assessment = await service.createAssessment({ idempotencyKey: "create-1" });

    expect(assessment.id).toBe(assessmentId1);
    expect(assessment.modelId).toBe("pfi-standard-v28");
    expect(assessment.lifecycle).toBe("in-progress");
    expect(Object.keys(assessment.responses)).toHaveLength(49);
    expect(Object.values(assessment.responses).every((state) => state.kind === "unanswered")).toBe(true);
    expect(getAssessmentProgress(assessment)).toEqual({
      complete: 0,
      total: 49,
      resultEligible: false,
    });
  });

  it("exposes the governed six-option and nine-option authoritative structures", () => {
    const capabilityOnly = pfiV28Catalog.listOptions("C1");
    const dualPath = pfiV28Catalog.listOptions("C2");

    expect(capabilityOnly).toHaveLength(6);
    expect(capabilityOnly.every((option) => option.path === null)).toBe(true);
    expect(dualPath).toHaveLength(9);
    expect(dualPath.filter((option) => option.path === "capability")).toHaveLength(3);
    expect(dualPath.filter((option) => option.path === "intentional-choice")).toHaveLength(3);
  });

  it("accepts only an authoritative option belonging to the selected question", async () => {
    await service.createAssessment({ idempotencyKey: "create-1" });
    const c2Option = pfiV28Catalog.listOptions("C2")[0];
    expect(c2Option).toBeDefined();

    await expect(
      service.recordScoredResponse({
        assessmentId: assessmentId1,
        questionId: "C1",
        optionId: c2Option!.id,
        idempotencyKey: "invalid-option",
      }),
    ).rejects.toThrow("is not authoritative for C1");
  });

  it("rejects an unsupported recorded model before interpreting a response", async () => {
    const unsupported = {
      ...createAssessmentAggregate({
        id: assessmentId1,
        now: "2026-08-18T10:00:00+02:00",
      }),
      modelId: "pfi-standard-v29",
    };
    await assessments.save({
      assessment: unsupported,
      expectedRevision: null,
      idempotencyKey: "unsupported-create",
      commandFingerprint: "unsupported-create",
    });
    const writesBeforeAttempt = assessments.successfulWriteCount;

    await expect(
      service.recordScoredResponse({
        assessmentId: assessmentId1,
        questionId: "C1",
        optionId: pfiV28Catalog.listOptions("C1")[0]!.id,
        idempotencyKey: "unsupported-score",
      }),
    ).rejects.toBeInstanceOf(AssessmentModelMismatchError);
    expect(assessments.successfulWriteCount).toBe(writesBeforeAttempt);
    expect((await assessments.load(assessmentId1))?.responses.C1).toEqual({
      kind: "unanswered",
    });
  });

  it("autosaves scored transitions and preserves internal Dual-path identity", async () => {
    await service.createAssessment({ idempotencyKey: "create-1" });
    const option = pfiV28Catalog.listOptions("C2").find(
      (candidate) => candidate.score === 4 && candidate.path === "intentional-choice",
    );
    expect(option).toBeDefined();

    const saved = await service.recordScoredResponse({
      assessmentId: assessmentId1,
      questionId: "C2",
      optionId: option!.id,
      idempotencyKey: "score-c2",
    });
    const reloaded = await assessments.load(assessmentId1);

    expect(saved.responses.C2).toEqual(pfiV28Catalog.toScoredEvidence(option!));
    expect(reloaded).toEqual(saved);
    expect(saved.revision).toBe(1);
    expect(getAssessmentProgress(saved).complete).toBe(1);
  });

  it("permits explicit confirmed N/A only for G4, B2, and B3 without free-form prose", async () => {
    await service.createAssessment({ idempotencyKey: "create-1" });

    await expect(
      service.confirmNotApplicable({
        assessmentId: assessmentId1,
        questionId: "C1",
        idempotencyKey: "na-c1",
      }),
    ).rejects.toThrow("C1 is not N/A-eligible");

    for (const questionId of ["G4", "B2", "B3"] as const) {
      const saved = await service.confirmNotApplicable({
        assessmentId: assessmentId1,
        questionId,
        idempotencyKey: `na-${questionId}`,
      });
      const confirmed = saved.responses[questionId];
      expect(confirmed?.kind).toBe("confirmed-na");
      if (confirmed?.kind === "confirmed-na") {
        expect(confirmed.confirmedAt).toBeTypeOf("string");
        expect("evidence" in confirmed).toBe(false);
      }
    }
  });

  it("supports Scored → N/A → Scored replacement without numeric N/A coercion", async () => {
    await service.createAssessment({ idempotencyKey: "create-1" });
    const option = pfiV28Catalog.listOptions("G4")[2];
    expect(option).toBeDefined();
    await service.recordScoredResponse({
      assessmentId: assessmentId1,
      questionId: "G4",
      optionId: option!.id,
      idempotencyKey: "g4-score-1",
    });
    const notApplicable = await service.confirmNotApplicable({
      assessmentId: assessmentId1,
      questionId: "G4",
      idempotencyKey: "g4-na",
    });
    expect(notApplicable.responses.G4).toMatchObject({ kind: "confirmed-na" });
    expect("score" in notApplicable.responses.G4!).toBe(false);

    const scoredAgain = await service.recordScoredResponse({
      assessmentId: assessmentId1,
      questionId: "G4",
      optionId: option!.id,
      idempotencyKey: "g4-score-2",
    });
    expect(scoredAgain.responses.G4).toEqual(
      pfiV28Catalog.toScoredEvidence(option!),
    );
  });

  it("treats cancellation as transient UI activity and performs no write", async () => {
    const original = await service.createAssessment({ idempotencyKey: "create-1" });
    const writesBeforeCancel = assessments.successfulWriteCount;
    const afterCancel = await service.cancelNotApplicable(assessmentId1);

    expect(afterCancel).toEqual(original);
    expect(assessments.successfulWriteCount).toBe(writesBeforeCancel);
  });

  it("counts Scored and confirmed N/A factually while excluding Unanswered", async () => {
    await service.createAssessment({ idempotencyKey: "create-1" });
    const c1 = pfiV28Catalog.listOptions("C1")[0]!;
    await service.recordScoredResponse({
      assessmentId: assessmentId1,
      questionId: "C1",
      optionId: c1.id,
      idempotencyKey: "score-c1",
    });
    const assessment = await service.confirmNotApplicable({
      assessmentId: assessmentId1,
      questionId: "B2",
      idempotencyKey: "na-b2",
    });

    expect(getAssessmentProgress(assessment)).toEqual({
      complete: 2,
      total: 49,
      resultEligible: false,
    });
    expect(getDimensionProgress(assessment)).toEqual([
      { dimensionId: "client-value", complete: 1, total: 7 },
      { dimensionId: "governance", complete: 0, total: 7 },
      { dimensionId: "revenue", complete: 0, total: 7 },
      { dimensionId: "balance-sheet", complete: 1, total: 7 },
      { dimensionId: "multi-rail", complete: 0, total: 7 },
      { dimensionId: "margin-cost", complete: 0, total: 7 },
      { dimensionId: "growth-engine", complete: 0, total: 7 },
    ]);
  });

  it("counts all three confirmed N/A states toward 49/49 completion", async () => {
    let assessment = await service.createAssessment({ idempotencyKey: "create-1" });
    for (const question of pfiQuestions) {
      if (["G4", "B2", "B3"].includes(question.id)) {
        assessment = await service.confirmNotApplicable({
          assessmentId: assessmentId1,
          questionId: question.id,
          idempotencyKey: `na-complete-${question.id}`,
        });
      } else {
        assessment = await service.recordScoredResponse({
          assessmentId: assessmentId1,
          questionId: question.id,
          optionId: pfiV28Catalog.listOptions(question.id)[0]!.id,
          idempotencyKey: `score-complete-${question.id}`,
        });
      }
    }

    expect(getAssessmentProgress(assessment)).toEqual({
      complete: 49,
      total: 49,
      resultEligible: true,
    });
    expect(assessment.lifecycle).toBe("complete");
  });

  it("withholds result eligibility at 48/49 and grants it only at 49/49", async () => {
    let assessment = await service.createAssessment({ idempotencyKey: "create-1" });
    for (const [index, question] of pfiQuestions.entries()) {
      if (index === 48) break;
      const option = pfiV28Catalog.listOptions(question.id)[0]!;
      assessment = await service.recordScoredResponse({
        assessmentId: assessmentId1,
        questionId: question.id,
        optionId: option.id,
        idempotencyKey: `score-${question.id}`,
      });
    }
    expect(getAssessmentProgress(assessment)).toEqual({
      complete: 48,
      total: 49,
      resultEligible: false,
    });
    expect(assessment.lifecycle).toBe("in-progress");

    const finalQuestion = pfiQuestions[48]!;
    const finalOption = pfiV28Catalog.listOptions(finalQuestion.id)[0]!;
    assessment = await service.recordScoredResponse({
      assessmentId: assessmentId1,
      questionId: finalQuestion.id,
      optionId: finalOption.id,
      idempotencyKey: `score-${finalQuestion.id}`,
    });
    expect(getAssessmentProgress(assessment)).toEqual({
      complete: 49,
      total: 49,
      resultEligible: true,
    });
    expect(assessment.lifecycle).toBe("complete");
    expect(assessment.completedAt).not.toBeNull();
  });

  it("makes repeated autosave commands idempotent", async () => {
    await service.createAssessment({ idempotencyKey: "create-1" });
    const option = pfiV28Catalog.listOptions("C1")[3]!;
    const command = {
      assessmentId: assessmentId1,
      questionId: "C1",
      optionId: option.id,
      idempotencyKey: "same-autosave",
    };
    const first = await service.recordScoredResponse(command);
    const writesAfterFirst = assessments.successfulWriteCount;
    const repeated = await service.recordScoredResponse(command);

    expect(repeated).toEqual(first);
    expect(assessments.successfulWriteCount).toBe(writesAfterFirst);
    expect(repeated.revision).toBe(1);
  });

  it("makes repeated create commands idempotent", async () => {
    const first = await service.createAssessment({ idempotencyKey: "same-create" });
    const writesAfterFirst = assessments.successfulWriteCount;
    const repeated = await service.createAssessment({ idempotencyKey: "same-create" });

    expect(repeated).toEqual(first);
    expect(assessments.successfulWriteCount).toBe(writesAfterFirst);
  });

  it("rejects reuse of an idempotency key for a different command", async () => {
    await service.createAssessment({ idempotencyKey: "create-1" });
    const first = pfiV28Catalog.listOptions("C1")[0]!;
    const second = pfiV28Catalog.listOptions("C1")[1]!;
    await service.recordScoredResponse({
      assessmentId: assessmentId1,
      questionId: "C1",
      optionId: first.id,
      idempotencyKey: "reused-key",
    });
    await expect(
      service.recordScoredResponse({
        assessmentId: assessmentId1,
        questionId: "C1",
        optionId: second.id,
        idempotencyKey: "reused-key",
      }),
    ).rejects.toBeInstanceOf(IdempotencyConflictError);
  });

  it("rejects stale concurrent writes through optimistic revision checks", async () => {
    const original = createAssessmentAggregate({ id: assessmentId1, now: "2026-08-18T10:00:00+02:00" });
    await assessments.save({
      assessment: original,
      expectedRevision: null,
      idempotencyKey: "create-direct",
      commandFingerprint: "create-direct",
    });
    const option = pfiV28Catalog.listOptions("C1")[0]!;
    const firstUpdate = {
      ...original,
      revision: 1,
      responses: {
        ...original.responses,
        C1: pfiV28Catalog.toScoredEvidence(option),
      },
    };
    await assessments.save({
      assessment: firstUpdate,
      expectedRevision: 0,
      idempotencyKey: "write-1",
      commandFingerprint: "write-1",
    });
    await expect(
      assessments.save({
        assessment: { ...firstUpdate, responses: { ...original.responses, C2: original.responses.C2! } },
        expectedRevision: 0,
        idempotencyKey: "write-2",
        commandFingerprint: "write-2",
      }),
    ).rejects.toBeInstanceOf(AssessmentConflictError);
  });

  it("reloads and resumes committed state through a new service instance", async () => {
    await service.createAssessment({ idempotencyKey: "create-1" });
    const option = pfiV28Catalog.listOptions("R4").find(
      (candidate) => candidate.path === "capability",
    )!;
    const saved = await service.recordScoredResponse({
      assessmentId: assessmentId1,
      questionId: "R4",
      optionId: option.id,
      idempotencyKey: "score-r4",
    });
    const reloadedService = new AssessmentService({
      assessments,
      catalog: pfiV28Catalog,
      identities,
      newId: () => assessmentId2,
      now: () => "2026-08-18T12:00:00+02:00",
    });

    expect(await reloadedService.resumeAssessment(assessmentId1)).toEqual(saved);
  });

  it("isolates responses across multiple assessment instances", async () => {
    await service.createAssessment({ idempotencyKey: "create-1" });
    await service.createAssessment({ idempotencyKey: "create-2" });
    const option = pfiV28Catalog.listOptions("C1")[0]!;
    await service.recordScoredResponse({
      assessmentId: assessmentId1,
      questionId: "C1",
      optionId: option.id,
      idempotencyKey: "assessment-1-c1",
    });

    expect((await service.resumeAssessment(assessmentId1)).responses.C1?.kind).toBe("scored");
    expect((await service.resumeAssessment(assessmentId2)).responses.C1).toEqual({ kind: "unanswered" });
  });

  it("associates optional recovery through Contact without consent or Discussion Request state", async () => {
    identities.add(
      contactSchema.parse({
        id: contactId,
        email: "recovery@example.com",
        createdAt: "2026-08-18T09:00:00+02:00",
      }),
    );
    const assessment = await service.createAssessment({
      idempotencyKey: "create-with-contact",
      recoveryContactId: contactId,
    });

    expect(assessment.recoveryContactId).toBe(contactId);
    expect("consent" in assessment).toBe(false);
    expect("discussionRequest" in assessment).toBe(false);
    expect((await service.resumeLatestForContact(contactId))?.id).toBe(assessment.id);
    await expect(
      service.associateRecoveryContact({
        assessmentId: assessment.id,
        contactId: "29999999-9999-4999-8999-999999999999",
        idempotencyKey: "unknown-contact",
      }),
    ).rejects.toThrow("Unknown recovery Contact");
  });

  it("can add a known recovery Contact after an assessment has started", async () => {
    identities.add(
      contactSchema.parse({
        id: contactId,
        email: "recovery@example.com",
        createdAt: "2026-08-18T09:00:00+02:00",
      }),
    );
    await service.createAssessment({ idempotencyKey: "create-1" });

    const associated = await service.associateRecoveryContact({
      assessmentId: assessmentId1,
      contactId,
      idempotencyKey: "associate-contact",
    });

    expect(associated.recoveryContactId).toBe(contactId);
    expect((await service.resumeLatestForContact(contactId))?.id).toBe(assessmentId1);
  });

  it("removes superseded assessments from recovery and prohibits further writes", async () => {
    identities.add(
      contactSchema.parse({
        id: contactId,
        email: "recovery@example.com",
        createdAt: "2026-08-18T09:00:00+02:00",
      }),
    );
    await service.createAssessment({
      idempotencyKey: "create-with-contact",
      recoveryContactId: contactId,
    });
    await service.supersedeAssessment({
      assessmentId: assessmentId1,
      idempotencyKey: "supersede-1",
    });

    expect(await service.resumeLatestForContact(contactId)).toBeNull();
    await expect(
      service.recordScoredResponse({
        assessmentId: assessmentId1,
        questionId: "C1",
        optionId: pfiV28Catalog.listOptions("C1")[0]!.id,
        idempotencyKey: "write-after-supersede",
      }),
    ).rejects.toThrow("cannot be changed");
  });
});
