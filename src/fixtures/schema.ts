import { z } from "zod";

export const fixtureManifestEntrySchema = z.object({
  id: z.string().min(1),
  authority: z.string().min(1),
  status: z.enum(["approved", "awaiting-controlled-source"]),
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
