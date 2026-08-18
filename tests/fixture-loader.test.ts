import { describe, expect, it } from "vitest";
import {
  loadFixtureManifest,
  loadMp01GoldenFixture,
} from "../src/fixtures/load";

describe("fixture foundation", () => {
  it("loads the controlled MP-01 fixture slot deterministically", () => {
    const manifest = loadFixtureManifest();
    expect(manifest.fixtures).toContainEqual({
      id: "MP-01",
      authority: "PFI MP-01 Controlled Implementation Golden Fixture v1.0.1",
      status: "approved",
      expected: { standardComposite: 74.2, qualifyingSignalCount: 8 },
      dataFile: "mp-01.golden.json",
    });
  });

  it("loads the approved 49-response MP-01 golden fixture", () => {
    const fixture = loadMp01GoldenFixture();
    expect(fixture.responseKeys).toHaveLength(49);
    expect(new Set(fixture.responseKeys).size).toBe(49);
    expect(fixture.expected.dimensionDisplayScores).toEqual({
      "client-value": 94.3,
      governance: 91.4,
      revenue: 88.6,
      "multi-rail": 34.3,
      "balance-sheet": 31.4,
      "margin-cost": 28.6,
      "growth-engine": 57.1,
    });
    expect(fixture.expected.signalQuestionIds).toHaveLength(8);
    expect(fixture.expected.intentionalChoice).toEqual({
      dimensionId: "multi-rail",
      questionId: "M4",
      score: 3,
      path: "intentional-choice",
      reviewFrame: "reassess-supporting-considerations",
    });
  });
});
