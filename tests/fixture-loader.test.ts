import { describe, expect, it } from "vitest";
import { loadFixtureManifest } from "../src/fixtures/load";

describe("fixture foundation", () => {
  it("loads the controlled MP-01 fixture slot deterministically", () => {
    const manifest = loadFixtureManifest();
    expect(manifest.fixtures).toContainEqual({
      id: "MP-01",
      authority: "PFI Gate 3E-3 Mixed-Profile MP-01 v0.3.3",
      status: "awaiting-controlled-source",
      expected: { standardComposite: 74.2, qualifyingSignalCount: 8 },
      dataFile: null,
    });
  });
});
