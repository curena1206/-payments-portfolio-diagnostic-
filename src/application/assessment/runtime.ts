import { pfiV28Catalog } from "../../domain/assessment/catalog";
import { AssessmentService } from "../../domain/assessment/service";
import type { IdentityRepository } from "../../domain/identity/contracts";
import { CommercialBridgeService } from "../../domain/identity/commercialService";
import { BrowserAssessmentRepository } from "../../infrastructure/persistence/BrowserAssessmentRepository";
import { BrowserIdentityRepository } from "../../infrastructure/persistence/BrowserIdentityRepository";
import { BrowserCommercialPermissionRepository } from "../../infrastructure/persistence/BrowserCommercialPermissionRepository";

export interface ContinuityStore {
  getCurrentAssessmentId(): string | null;
  setCurrentAssessmentId(id: string): void;
}

export interface AssessmentRuntime {
  service: AssessmentService;
  identities: IdentityRepository;
  commercial: CommercialBridgeService;
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
  const permissions = new BrowserCommercialPermissionRepository(storage);
  const now = () => new Date().toISOString();
  const newId = () => randomId();
  const commercial = new CommercialBridgeService({ permissions, identities, now, newId });
  return {
    service: new AssessmentService({
      assessments,
      catalog: pfiV28Catalog,
      identities,
      now,
      newId,
    }),
    identities,
    commercial,
    continuity: {
      getCurrentAssessmentId: () => storage.getItem("pfi.current-assessment.v1"),
      setCurrentAssessmentId: (id) => storage.setItem("pfi.current-assessment.v1", id),
    },
    newId,
    now,
  };
}
