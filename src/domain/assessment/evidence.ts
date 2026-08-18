import { z } from "zod";
import { responsePathSchema } from "../pfi/schema";

export const unansweredEvidenceSchema = z.object({
  kind: z.literal("unanswered"),
});

export const scoredEvidenceSchema = z.object({
  kind: z.literal("scored"),
  optionId: z.string().min(1),
  score: z.number().int().min(0).max(5),
  path: responsePathSchema.nullable(),
});

export const confirmedNaEvidenceSchema = z.object({
  kind: z.literal("confirmed-na"),
  confirmedAt: z.string().datetime({ offset: true }),
});

export const evidenceStateSchema = z.discriminatedUnion("kind", [
  unansweredEvidenceSchema,
  scoredEvidenceSchema,
  confirmedNaEvidenceSchema,
]);

export type EvidenceState = z.infer<typeof evidenceStateSchema>;
export type ScoredEvidence = z.infer<typeof scoredEvidenceSchema>;

export const UNANSWERED: EvidenceState = Object.freeze({ kind: "unanswered" });
