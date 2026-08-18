import { pfiModel } from "./model";

/**
 * Locked respondent-facing order from Gate 4B Assessment Experience Prototype
 * v0.3, slide 4. This is intentionally independent of methodology weights and
 * the storage order of the v28 model catalog.
 */
export const respondentDimensionIds = [
  "client-value",
  "governance",
  "revenue",
  "balance-sheet",
  "multi-rail",
  "margin-cost",
  "growth-engine",
] as const;

const dimensionsById = new Map(
  pfiModel.dimensions.map((dimension) => [dimension.id, dimension]),
);

export const respondentDimensions = respondentDimensionIds.map((dimensionId) => {
  const dimension = dimensionsById.get(dimensionId);
  if (!dimension) {
    throw new Error(
      `Respondent presentation order references unknown dimension: ${dimensionId}`,
    );
  }
  return dimension;
});

if (
  respondentDimensions.length !== pfiModel.dimensions.length ||
  new Set(respondentDimensionIds).size !== respondentDimensionIds.length
) {
  throw new Error("Respondent presentation order must include every PFI dimension");
}
