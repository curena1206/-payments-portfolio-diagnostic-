import { z } from "zod";
import { evidenceStateSchema, UNANSWERED, type EvidenceState } from "./evidence";
import { pfiModel, pfiQuestions } from "../pfi/model";

export const assessmentLifecycleSchema = z.enum([
  "in-progress",
  "complete",
  "superseded",
]);

export const assessmentAggregateSchema = z.object({
  id: z.string().uuid(),
  modelId: z.string().min(1),
  recoveryContactId: z.string().uuid().nullable(),
  lifecycle: assessmentLifecycleSchema,
  responses: z.record(z.string(), evidenceStateSchema),
  revision: z.number().int().nonnegative(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).nullable(),
});

export type AssessmentAggregate = z.infer<typeof assessmentAggregateSchema>;
export type AssessmentLifecycle = z.infer<typeof assessmentLifecycleSchema>;

export function createAssessmentAggregate(input: {
  id: string;
  now: string;
  recoveryContactId?: string | null;
}): AssessmentAggregate {
  return assessmentAggregateSchema.parse({
    id: input.id,
    modelId: pfiModel.modelId,
    recoveryContactId: input.recoveryContactId ?? null,
    lifecycle: "in-progress",
    responses: Object.fromEntries(
      pfiQuestions.map((question) => [question.id, UNANSWERED]),
    ),
    revision: 0,
    createdAt: input.now,
    updatedAt: input.now,
    completedAt: null,
  });
}

export function assertCanonicalResponseSet(
  responses: Record<string, EvidenceState>,
): void {
  const expected = pfiQuestions.map((question) => question.id).sort();
  const actual = Object.keys(responses).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error("Assessment responses must contain exactly the 49 authoritative questions");
  }
}
