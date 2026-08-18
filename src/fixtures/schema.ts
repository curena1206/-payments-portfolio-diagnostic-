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

export const mp01GoldenFixtureSchema = z.object({
  id: z.literal("MP-01"),
  authority: z.literal("PFI MP-01 Controlled Implementation Golden Fixture v1.0.1"),
  modelId: z.literal("pfi-standard-v28"),
  responseKeys: z.array(z.string().min(1)).length(49).superRefine((keys, context) => {
    if (new Set(keys).size !== keys.length) {
      context.addIssue({ code: "custom", message: "MP-01 response keys must be unique" });
    }
  }),
  expected: z.object({
    dimensionDisplayScores: z.record(z.string(), z.number()),
    standardCompositeDisplayScore: z.literal(74.2),
    signalQuestionIds: z.array(z.string()).length(8),
    formalStrengthDimensionIds: z.array(z.string()).length(3),
    dimensionAgendaDimensionIds: z.array(z.string()).length(3),
    ordinaryScoredDimensionIds: z.array(z.string()).length(1),
    intentionalChoice: z.object({
      dimensionId: z.literal("multi-rail"),
      questionId: z.literal("M4"),
      score: z.literal(3),
      path: z.literal("intentional-choice"),
      reviewFrame: z.literal("reassess-supporting-considerations"),
    }),
    pattern: z.object({
      kind: z.literal("strength-signal-convergence"),
      strengthDimensionIds: z.array(z.string()),
      signalDimensionIds: z.array(z.string()),
      agendaDimensionIds: z.array(z.string()),
    }),
  }),
});

export type Mp01GoldenFixture = z.infer<typeof mp01GoldenFixtureSchema>;
