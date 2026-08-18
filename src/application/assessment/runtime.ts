import { pfiV28Catalog } from "../../domain/assessment/catalog";
import { AssessmentService } from "../../domain/assessment/service";
import type { IdentityRepository } from "../../domain/identity/contracts";
import { BrowserAssessmentRepository } from "../../infrastructure/persistence/BrowserAssessmentRepository";
import { BrowserIdentityRepository } from "../../infrastructure/persistence/BrowserIdentityRepository";

export interface ContinuityStore {
  getCurrentAssessmentId(): string | null;
  setCurrentAssessmentId(id: string): void;
}

export interface AssessmentRuntime {
  service: AssessmentService;
  identities: IdentityRepository;
  continuity: ContinuityStore;
  newId(): string;
  now(): string;
}

function randomId(): string {
  return globalThis.crypto.randomUUID();
}

export function createBrowserAssessmentRuntime(
  storage: Storage = globalThis.localStorage,
): AssessmentRuntime {
  const assessments = new BrowserAssessmentRepository(storage);
  const identities = new BrowserIdentityRepository(storage);
  const now = () => new Date().toISOString();
  const newId = () => randomId();
  return {
    service: new AssessmentService({
      assessments,
      catalog: pfiV28Catalog,
      identities,
      now,
      newId,
    }),
    identities,
    continuity: {
      getCurrentAssessmentId: () => storage.getItem("pfi.current-assessment.v1"),
      setCurrentAssessmentId: (id) => storage.setItem("pfi.current-assessment.v1", id),
    },
    newId,
    now,
  };
}
