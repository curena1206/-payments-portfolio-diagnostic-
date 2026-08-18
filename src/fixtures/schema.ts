import { z } from "zod";

export const fixtureManifestEntrySchema = z.object({
  id: z.string().min(1),
  authority: z.string().min(1),
  status: z.enum([
    "approved",
    "partial-controlled-source",
    "awaiting-controlled-source",
  ]),
  expected: z.object({
    standardComposite: z.number().min(0).max(100).optional(),
    qualifyingSignalCount: z.number().int().nonnegative().optional(),
  }),
  dataFile: z.string().nullable(),
});

export const fixtureManifestSchema = z.object({
  version: z.literal(1),
  fixtures: z.array(fixtureManifestEntrySchema),
});

export type FixtureManifest = z.infer<typeof fixtureManifestSchema>;

const sevenScoresSchema = z.tuple([
  z.number().int().min(0).max(5),
  z.number().int().min(0).max(5),
  z.number().int().min(0).max(5),
  z.number().int().min(0).max(5),
  z.number().int().min(0).max(5),
  z.number().int().min(0).max(5),
  z.number().int().min(0).max(5),
]);

export const mp01DimensionControlsSchema = z.object({
  id: z.literal("MP-01"),
  authority: z.literal("PFI Gate 3E-3 Mixed-Profile MP-01 v0.3.3"),
  scope: z.string().min(1),
  dimensionRawScores: z.record(z.string(), sevenScoresSchema),
  expectedDimensionDisplayScores: z.record(z.string(), z.number()),
  expectedStandardCompositeDisplayScore: z.literal(74.2),
  expectedQualifyingSignalCount: z.literal(8),
  namedSignalOutcomes: z.array(
    z.object({
      dimensionId: z.string(),
      constructLabel: z.string(),
      category: z.enum(["sri", "universal-low-score"]),
    }),
  ).length(8),
  intentionalChoiceControl: z.object({
    dimensionId: z.literal("multi-rail"),
    score: z.literal(3),
    path: z.literal("intentional-choice"),
    questionId: z.null(),
  }),
  unresolvedFixtureDependency: z.string().min(1),
});

export type Mp01DimensionControls = z.infer<typeof mp01DimensionControlsSchema>;
