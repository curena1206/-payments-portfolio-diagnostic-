import { describe, expect, it } from "vitest";
import {
  commercialConsentSchema,
  contactSchema,
  discussionRequestSchema,
} from "../src/domain/identity/contracts";
import { createAssessmentAggregate } from "../src/domain/assessment/aggregate";

const contactId = "11111111-1111-4111-8111-111111111111";
const firstAssessmentId = "22222222-2222-4222-8222-222222222222";
const secondAssessmentId = "33333333-3333-4333-8333-333333333333";
const recordedAt = "2026-08-18T10:00:00+02:00";

describe("shared identity contract", () => {
  it("allows recovery identity without creating or implying consent", () => {
    const contact = contactSchema.parse({
      id: contactId,
      email: "respondent@example.com",
      createdAt: recordedAt,
    });
    const assessment = createAssessmentAggregate({
      id: firstAssessmentId,
      recoveryContactId: contact.id,
      now: recordedAt,
    });

    expect(assessment.recoveryContactId).toBe(contact.id);
    expect("commercialConsent" in contact).toBe(false);
    expect("consent" in assessment).toBe(false);
  });

  it("keeps commercial consent contact-scoped", () => {
    const consent = commercialConsentSchema.parse({
      id: "44444444-4444-4444-8444-444444444444",
      contactId,
      status: "granted",
      recordedAt,
    });

    expect(consent.contactId).toBe(contactId);
    expect("assessmentInstanceId" in consent).toBe(false);
  });

  it("binds each Discussion Request to one contact and originating assessment", () => {
    const firstRequest = discussionRequestSchema.parse({
      id: "55555555-5555-4555-8555-555555555555",
      contactId,
      assessmentInstanceId: firstAssessmentId,
      status: "submitted",
      submittedAt: recordedAt,
    });
    const secondAssessment = createAssessmentAggregate({
      id: secondAssessmentId,
      recoveryContactId: contactId,
      now: recordedAt,
    });

    expect(firstRequest.contactId).toBe(secondAssessment.recoveryContactId);
    expect(firstRequest.assessmentInstanceId).not.toBe(secondAssessment.id);
  });
});
