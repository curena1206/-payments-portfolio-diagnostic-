import { beforeEach, describe, expect, it } from "vitest";
import { createBrowserAssessmentRuntime } from "../src/application/assessment/runtime";
import { pfiV28Catalog } from "../src/domain/assessment/catalog";
import { contactSchema } from "../src/domain/identity/contracts";
import { generateAssessmentResult } from "../src/domain/results/generation";
import { loadMp01GoldenFixture } from "../src/fixtures/load";
import { bindMp01Responses } from "../src/fixtures/mp01";

describe("I6 production-path integration", () => {
  beforeEach(() => localStorage.clear());

  it("reconstructs the complete MP-01 journey and preserves scoped commercial history", async () => {
    const fixture = loadMp01GoldenFixture();
    const responses = bindMp01Responses(fixture, pfiV28Catalog);
    const firstRuntime = createBrowserAssessmentRuntime(localStorage);
    let assessment = await firstRuntime.service.createAssessment({ idempotencyKey: "i6-create" });
    firstRuntime.continuity.setCurrentAssessmentId(assessment.id);

    for (const [index, response] of responses.entries()) {
      if (index === 48) {
        expect(assessment.lifecycle).toBe("in-progress");
        expect(() => generateAssessmentResult(assessment)).toThrow(
          "Assessment results require 49 of 49 committed responses",
        );
      }
      assessment = await firstRuntime.service.recordScoredResponse({
        assessmentId: assessment.id,
        questionId: response.questionId,
        optionId: response.option.id,
        idempotencyKey: `i6-answer-${index}`,
      });
    }

    const result = generateAssessmentResult(assessment);
    expect(result.composite).toMatchObject({ state: "standard", displayScore: 74.2 });
    expect(Object.fromEntries(result.dimensions.map((item) => [item.dimensionId, item.displayScore])))
      .toEqual(fixture.expected.dimensionDisplayScores);
    expect(result.signals).toHaveLength(8);
    expect(result.profile.filter((item) => item.state === "formal-strength")).toHaveLength(3);
    expect(result.examinationAgenda.filter((item) => item.type === "dimension")).toHaveLength(3);

    const contact = contactSchema.parse({
      id: firstRuntime.newId(), email: "integration@example.com", createdAt: firstRuntime.now(),
    });
    await firstRuntime.identities.saveContact(contact);
    await firstRuntime.commercial.requestDiscussion({
      contactId: contact.id, assessmentInstanceId: assessment.id, idempotencyKey: "i6-dr",
    });
    await firstRuntime.commercial.grantConsent({ contactId: contact.id, idempotencyKey: "i6-consent" });
    expect((await firstRuntime.service.resumeAssessment(assessment.id)).recoveryContactId).toBeNull();

    const reconstructedRuntime = createBrowserAssessmentRuntime(localStorage);
    const reconstructed = await reconstructedRuntime.service.resumeAssessment(assessment.id);
    expect(reconstructed).toEqual(assessment);
    expect(reconstructedRuntime.continuity.getCurrentAssessmentId()).toBe(assessment.id);
    expect(await reconstructedRuntime.commercial.load(contact.id, assessment.id)).toMatchObject({
      consent: { status: "granted", contactId: contact.id },
      discussionRequest: { status: "submitted", assessmentInstanceId: assessment.id },
    });

    const second = await reconstructedRuntime.service.createAssessment({ idempotencyKey: "i6-second" });
    expect(await reconstructedRuntime.commercial.load(contact.id, second.id)).toMatchObject({
      consent: { status: "granted", contactId: contact.id }, discussionRequest: null,
    });
    await reconstructedRuntime.commercial.withdrawConsent({
      contactId: contact.id, idempotencyKey: "i6-withdraw",
    });

    const revisitedRuntime = createBrowserAssessmentRuntime(localStorage);
    expect(await revisitedRuntime.commercial.load(contact.id, assessment.id)).toMatchObject({
      consent: { status: "withdrawn", contactId: contact.id },
      discussionRequest: { status: "submitted", assessmentInstanceId: assessment.id },
    });
  });

  it("fails closed on corrupted browser state without overwriting it", async () => {
    localStorage.setItem("pfi.assessments.v1", "{corrupted");
    const runtime = createBrowserAssessmentRuntime(localStorage);
    await expect(runtime.service.resumeAssessment("10000000-0000-4000-8000-000000000001"))
      .rejects.toThrow();
    expect(localStorage.getItem("pfi.assessments.v1")).toBe("{corrupted");

    localStorage.clear();
    localStorage.setItem("pfi.contacts.v1", "{corrupted");
    expect(() => createBrowserAssessmentRuntime(localStorage).identities.findContactByEmail("x@example.com"))
      .toThrow();
    expect(localStorage.getItem("pfi.contacts.v1")).toBe("{corrupted");

    localStorage.clear();
    const validRuntime = createBrowserAssessmentRuntime(localStorage);
    const contact = contactSchema.parse({
      id: validRuntime.newId(), email: "valid@example.com", createdAt: validRuntime.now(),
    });
    await validRuntime.identities.saveContact(contact);
    localStorage.setItem("pfi.commercial.v1", "{corrupted");
    await expect(validRuntime.commercial.load(contact.id, "20000000-0000-4000-8000-000000000001"))
      .rejects.toThrow();
    expect(localStorage.getItem("pfi.commercial.v1")).toBe("{corrupted");
  });
});
