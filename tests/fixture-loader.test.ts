import { describe, expect, it } from "vitest";
import {
  loadFixtureManifest,
  loadMp01DimensionControls,
} from "../src/fixtures/load";

describe("fixture foundation", () => {
  it("loads the controlled MP-01 fixture slot deterministically", () => {
    const manifest = loadFixtureManifest();
    expect(manifest.fixtures).toContainEqual({
      id: "MP-01",
      authority: "PFI Gate 3E-3 Mixed-Profile MP-01 v0.3.3",
      status: "partial-controlled-source",
      expected: { standardComposite: 74.2, qualifyingSignalCount: 8 },
      dataFile: "mp-01.dimension-controls.json",
    });
  });

  it("loads only the authoritative MP-01 dimension controls without inventing option IDs", () => {
    const fixture = loadMp01DimensionControls();
    expect(fixture.expectedDimensionDisplayScores).toEqual({
      "client-value": 94.3,
      governance: 91.4,
      revenue: 88.6,
      "multi-rail": 34.3,
      "balance-sheet": 31.4,
      "margin-cost": 28.6,
      "growth-engine": 57.1,
    });
    expect(fixture.namedSignalOutcomes).toHaveLength(8);
    expect(fixture.intentionalChoiceControl).toEqual({
      dimensionId: "multi-rail",
      score: 3,
      path: "intentional-choice",
      questionId: null,
    });
  });
});
