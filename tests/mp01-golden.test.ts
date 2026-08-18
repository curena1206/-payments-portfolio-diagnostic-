import { describe, expect, it } from "vitest";
import { pfiV28Catalog } from "../src/domain/assessment/catalog";
import { AssessmentService } from "../src/domain/assessment/service";
import type { Contact, IdentityRepository } from "../src/domain/identity/contracts";
import { generateAssessmentResult } from "../src/domain/results/generation";
import { bindMp01Responses } from "../src/fixtures/mp01";
import { loadMp01GoldenFixture } from "../src/fixtures/load";
import { InMemoryAssessmentRepository } from "../src/infrastructure/persistence/InMemoryAssessmentRepository";

class EmptyIdentityRepository implements IdentityRepository {
  getContact(): Promise<Contact | null> {
    return Promise.resolve(null);
  }

  findContactByEmail(): Promise<Contact | null> {
    return Promise.resolve(null);
  }

  saveContact(): Promise<void> {
    return Promise.resolve();
  }
}

function collectObjectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjectKeys(item, keys));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      keys.add(key.toLowerCase());
      collectObjectKeys(child, keys);
    }
  }
  return keys;
}

describe("MP-01 controlled implementation golden fixture v1.0.1", () => {
  it("reproduces every approved control through the canonical I1/I3 pipeline", async () => {
    const fixture = loadMp01GoldenFixture();
    const boundResponses = bindMp01Responses(fixture, pfiV28Catalog);
    expect(boundResponses).toHaveLength(49);
    expect(new Set(boundResponses.map((response) => response.questionId)).size).toBe(49);

    const assessments = new InMemoryAssessmentRepository();
    let clockTick = 0;
    const service = new AssessmentService({
      assessments,
      catalog: pfiV28Catalog,
      identities: new EmptyIdentityRepository(),
      newId: () => "10000000-0000-4000-8000-000000000001",
      now: () =>
        `2026-08-18T12:${String(Math.floor(clockTick / 60)).padStart(2, "0")}:${String(clockTick++ % 60).padStart(2, "0")}+02:00`,
    });

    let assessment = await service.createAssessment({
      idempotencyKey: "mp01-create",
    });
    for (const [index, response] of boundResponses.entries()) {
      assessment = await service.recordScoredResponse({
        assessmentId: assessment.id,
        questionId: response.questionId,
        optionId: response.option.id,
        idempotencyKey: `mp01-response-${index + 1}`,
      });
    }
    expect(assessment.lifecycle).toBe("complete");
    expect(assessment.revision).toBe(49);

    const result = generateAssessmentResult(assessment, pfiV28Catalog);
    expect(
      Object.fromEntries(
        result.dimensions.map((dimension) => [
          dimension.dimensionId,
          dimension.displayScore,
        ]),
      ),
    ).toEqual(fixture.expected.dimensionDisplayScores);
    expect(result.composite).toMatchObject({
      state: "standard",
      displayScore: fixture.expected.standardCompositeDisplayScore,
    });

    expect(result.signals).toHaveLength(8);
    expect(result.signals.map((signal) => signal.questionId)).toEqual(
      expect.arrayContaining(fixture.expected.signalQuestionIds),
    );

    const strengths = result.profile
      .filter((entry) => entry.state === "formal-strength")
      .map((entry) => entry.dimension.dimensionId);
    expect(strengths).toEqual(fixture.expected.formalStrengthDimensionIds);

    const dimensionAgenda = result.examinationAgenda.filter(
      (entry) => entry.type === "dimension",
    );
    expect(dimensionAgenda).toHaveLength(3);
    expect(dimensionAgenda.map((entry) => entry.dimensionId)).toEqual(
      expect.arrayContaining(fixture.expected.dimensionAgendaDimensionIds),
    );

    const agendaDimensionIds = new Set(
      dimensionAgenda.map((entry) => entry.dimensionId),
    );
    const ordinaryScored = result.profile
      .filter(
        (entry) =>
          entry.state === "standard-scored" &&
          !agendaDimensionIds.has(entry.dimension.dimensionId),
      )
      .map((entry) => entry.dimension.dimensionId);
    expect(ordinaryScored).toEqual(fixture.expected.ordinaryScoredDimensionIds);

    const multiRailAgenda = dimensionAgenda.find(
      (entry) => entry.dimensionId === "multi-rail",
    );
    expect(
      boundResponses.find((response) => response.questionId === "M4")?.option,
    ).toMatchObject({ score: 3, path: "intentional-choice" });
    expect(multiRailAgenda?.intentionalChoices).toContainEqual(
      expect.objectContaining({
        questionId: fixture.expected.intentionalChoice.questionId,
        score: fixture.expected.intentionalChoice.score,
        reviewFrame: fixture.expected.intentionalChoice.reviewFrame,
      }),
    );
    expect(result.pattern.kind).toBe(fixture.expected.pattern.kind);
    if (result.pattern.kind !== "strength-signal-convergence") {
      throw new Error("Expected MP-01 convergence Pattern");
    }
    expect(result.pattern.strengthDimensionIds).toEqual(
      expect.arrayContaining(fixture.expected.pattern.strengthDimensionIds),
    );
    expect(result.pattern.signalDimensionIds).toEqual(
      expect.arrayContaining(fixture.expected.pattern.signalDimensionIds),
    );
    expect(result.pattern.agendaDimensionIds).toEqual(
      expect.arrayContaining(fixture.expected.pattern.agendaDimensionIds),
    );

    const resultKeys = collectObjectKeys(result);
    for (const prohibited of [
      "diagnosis",
      "severity",
      "maturity",
      "recommendation",
      "prescription",
      "owner",
      "kpi",
      "actionplan",
      "action-plan",
    ]) {
      expect(resultKeys.has(prohibited)).toBe(false);
    }
  });
});
