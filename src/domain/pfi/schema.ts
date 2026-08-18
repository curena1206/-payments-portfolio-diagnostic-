import { z } from "zod";

export const responsePathSchema = z.enum(["capability", "intentional-choice"]);

export const anchorSchema = z.object({
  score: z.number().int().min(0).max(5),
  text: z.string().min(1),
});

export const responseOptionSchema = anchorSchema.extend({
  path: responsePathSchema.nullable(),
});

export const questionSchema = z.object({
  id: z.string().regex(/^(?:C|G|R|B|M|MC|GE)[1-7]$/),
  title: z.string().min(1),
  question: z.string().min(1),
  constructMeasured: z.string().min(1),
  pathType: z.enum(["capability-only", "dual-path"]),
  pathTypeSource: z.string().min(1),
  naEligible: z.boolean(),
  naEligibilitySource: z.string().min(1),
  visibility: z.enum(["sri", "universal-low-score"]),
  sriActivation: z.enum(["0-only", "0-1"]).nullable(),
  visibilitySource: z.string().min(1),
  anchors: z.array(anchorSchema).length(6),
  responseOptions: z.array(responseOptionSchema).min(6).max(9),
});

export const dimensionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  standardWeightPercent: z.number().positive(),
  sourceSection: z.string().min(1),
  questions: z.array(questionSchema).length(7),
});

export const pfiModelSchema = z.object({
  modelId: z.literal("pfi-standard-v28"),
  title: z.string().min(1),
  authority: z.object({
    document: z.literal("PFI Strategy Review Working Record"),
    version: z.literal("v28"),
    sourceFile: z.string().min(1),
    sourceSha256: z.literal(
      "6f4f23dda10ffadcaad44be9e81e245ab420c72b47bf70e06e0d0b42e02033e6",
    ),
    questionnaireClosureSections: z.tuple([z.literal("99"), z.literal("100")]),
  }),
  scale: z.object({ minimum: z.literal(0), maximum: z.literal(5) }),
  dimensionEvidenceFloor: z.literal(4),
  dimensions: z.array(dimensionSchema).length(7),
});

export type PfiModel = z.infer<typeof pfiModelSchema>;
export type PfiQuestion = z.infer<typeof questionSchema>;
