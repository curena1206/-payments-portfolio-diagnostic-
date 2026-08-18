import { describe, expect, it } from "vitest";
import { pfiModel, pfiQuestions } from "../src/domain/pfi/model";

const expectedWeights = new Map([
  ["Client Value & Commercial Relevance", 31.87],
  ["Governance & Operating Model", 18.86],
  ["Revenue Architecture", 18.86],
  ["Balance Sheet & Liquidity Contribution", 11.52],
  ["Multi-Rail Strategy & Future Readiness", 10.51],
  ["Margin & Cost Structure", 6.25],
  ["Growth Engine Quality", 2.13],
]);

describe("PFI v28 numerical controls", () => {
  it("contains seven dimensions and exactly seven questions per dimension", () => {
    expect(pfiModel.dimensions).toHaveLength(7);
    expect(pfiModel.dimensions.map((dimension) => dimension.questions.length)).toEqual(
      Array(7).fill(7),
    );
    expect(pfiQuestions).toHaveLength(49);
    expect(new Set(pfiQuestions.map((question) => question.id)).size).toBe(49);
  });

  it("contains the exact Dual-path set", () => {
    expect(
      pfiQuestions
        .filter((question) => question.pathType === "dual-path")
        .map((question) => question.id),
    ).toEqual(["C2", "C3", "C7", "R4", "R6", "M4", "MC4"]);
  });

  it("contains the locked visibility classifications", () => {
    expect(pfiQuestions.filter((question) => question.visibility === "sri")).toHaveLength(32);
    expect(
      pfiQuestions.filter((question) => question.visibility === "universal-low-score"),
    ).toHaveLength(17);
    expect(
      pfiQuestions
        .filter((question) => question.visibility === "sri")
        .every((question) => question.sriActivation !== null),
    ).toBe(true);
    expect(
      pfiQuestions
        .filter((question) => question.visibility === "universal-low-score")
        .every((question) => question.sriActivation === null),
    ).toBe(true);
    expect(
      pfiQuestions
        .filter((question) => question.sriActivation === "0-only")
        .map((question) => question.id),
    ).toEqual(["C6", "G2", "G5"]);
    expect(
      pfiQuestions
        .filter((question) => question.sriActivation === "0-1")
        .map((question) => question.id),
    ).toEqual([
      "C2", "C5", "C7", "G1", "G3", "G4", "G6", "G7", "R3", "R5", "R7",
      "B2", "B4", "B5", "B7", "M1", "M3", "M4", "M5", "M7", "MC1",
      "MC2", "MC3", "MC4", "MC7", "GE3", "GE4", "GE5", "GE7",
    ]);
  });

  it("contains exactly the three locked N/A-eligible questions", () => {
    expect(
      pfiQuestions.filter((question) => question.naEligible).map((question) => question.id),
    ).toEqual(["G4", "B2", "B3"]);
  });

  it("contains six anchors and the governed 6/9 option architecture", () => {
    for (const question of pfiQuestions) {
      expect(question.anchors.map((anchor) => anchor.score)).toEqual([0, 1, 2, 3, 4, 5]);
      expect(question.responseOptions).toHaveLength(
        question.pathType === "dual-path" ? 9 : 6,
      );
    }
  });

  it("contains the exact Standard weights totaling 100%", () => {
    expect(
      pfiModel.dimensions.map(({ name, standardWeightPercent }) => [
        name,
        standardWeightPercent,
      ]),
    ).toEqual([...expectedWeights.entries()]);
    expect(
      pfiModel.dimensions.reduce(
        (total, dimension) => total + dimension.standardWeightPercent,
        0,
      ),
    ).toBe(100);
  });
});
