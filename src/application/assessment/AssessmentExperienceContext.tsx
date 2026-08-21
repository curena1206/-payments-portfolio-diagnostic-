import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type { AssessmentAggregate } from "../../domain/assessment/aggregate";
import { contactSchema, type Contact } from "../../domain/identity/contracts";
import type { CommercialBridgeService } from "../../domain/identity/commercialService";
import {
  createBrowserAssessmentRuntime,
  type AssessmentRuntime,
} from "./runtime";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AssessmentExperienceValue {
  active: AssessmentAggregate | null;
  recoverable: AssessmentAggregate | null;
  loading: boolean;
  recoveryError: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  startNew: (supersedeCurrent?: boolean) => Promise<AssessmentAggregate>;
  resume: () => AssessmentAggregate | null;
  selectOption: (questionId: string, optionId: string) => Promise<void>;
  confirmNotApplicable: (questionId: string) => Promise<void>;
  retrySave: () => Promise<void>;
  associateRecovery: (email: string) => Promise<void>;
  identifyForCommercialAction: (email: string) => Promise<Contact>;
  commercial: CommercialBridgeService;
  newId: () => string;
}

const AssessmentExperienceContext = createContext<AssessmentExperienceValue | null>(
  null,
);

export function AssessmentExperienceProvider({
  children,
  runtime: suppliedRuntime,
}: PropsWithChildren<{ runtime?: AssessmentRuntime | undefined }>) {
  const runtime = useMemo(
    () => suppliedRuntime ?? createBrowserAssessmentRuntime(),
    [suppliedRuntime],
  );
  const [active, setActive] = useState<AssessmentAggregate | null>(null);
  const [recoverable, setRecoverable] = useState<AssessmentAggregate | null>(null);
  const [loading, setLoading] = useState(
    () => runtime.continuity.getCurrentAssessmentId() !== null,
  );
  const [recoveryError, setRecoveryError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const retryRef = useRef<(() => Promise<AssessmentAggregate>) | null>(null);

  useEffect(() => {
    let current = true;
    const id = runtime.continuity.getCurrentAssessmentId();
    if (!id) return;
    runtime.service
      .resumeAssessment(id)
      .then((assessment) => {
        if (!current) return;
        setRecoverable(assessment);
        setActive(assessment);
      })
      .catch(() => {
        if (current) setRecoveryError(true);
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [runtime]);

  const commit = useCallback(async (operation: () => Promise<AssessmentAggregate>) => {
    retryRef.current = operation;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const saved = await operation();
      setActive(saved);
      setRecoverable(saved);
      setSaveStatus("saved");
      retryRef.current = null;
    } catch (error) {
      setSaveStatus("error");
      setSaveError(error instanceof Error ? error.message : "The change was not saved.");
    }
  }, []);

  const startNew = useCallback(
    async (supersedeCurrent = false) => {
      if (supersedeCurrent && recoverable?.lifecycle === "in-progress") {
        await runtime.service.supersedeAssessment({
          assessmentId: recoverable.id,
          idempotencyKey: runtime.newId(),
        });
      }
      const assessment = await runtime.service.createAssessment({
        idempotencyKey: runtime.newId(),
      });
      runtime.continuity.setCurrentAssessmentId(assessment.id);
      setActive(assessment);
      setRecoverable(assessment);
      setSaveStatus("idle");
      return assessment;
    },
    [recoverable, runtime],
  );

  const value = useMemo<AssessmentExperienceValue>(
    () => ({
      active,
      recoverable,
      loading,
      recoveryError,
      saveStatus,
      saveError,
      startNew,
      resume: () => recoverable,
      selectOption: async (questionId, optionId) => {
        if (!active) return;
        const command = {
          assessmentId: active.id,
          questionId,
          optionId,
          idempotencyKey: runtime.newId(),
        };
        await commit(() => runtime.service.recordScoredResponse(command));
      },
      confirmNotApplicable: async (questionId) => {
        if (!active) return;
        const command = {
          assessmentId: active.id,
          questionId,
          idempotencyKey: runtime.newId(),
        };
        await commit(() => runtime.service.confirmNotApplicable(command));
      },
      retrySave: async () => {
        if (retryRef.current) await commit(retryRef.current);
      },
      associateRecovery: async (email) => {
        if (!active) return;
        const normalized = email.trim().toLowerCase();
        let contact = await runtime.identities.findContactByEmail(normalized);
        if (!contact) {
          contact = contactSchema.parse({
            id: runtime.newId(),
            email: normalized,
            createdAt: runtime.now(),
          });
          await runtime.identities.saveContact(contact);
        }
        const command = {
          assessmentId: active.id,
          contactId: contact.id,
          idempotencyKey: runtime.newId(),
        };
        await commit(() => runtime.service.associateRecoveryContact(command));
      },
      identifyForCommercialAction: async (email) => {
        if (!active) throw new Error("No active assessment");
        const normalized = email.trim().toLowerCase();
        let contact = await runtime.identities.findContactByEmail(normalized);
        if (!contact) {
          contact = contactSchema.parse({
            id: runtime.newId(), email: normalized, createdAt: runtime.now(),
          });
          await runtime.identities.saveContact(contact);
        }
        if (active.recoveryContactId !== contact.id) {
          const updated = await runtime.service.associateRecoveryContact({
            assessmentId: active.id, contactId: contact.id,
            idempotencyKey: runtime.newId(),
          });
          setActive(updated);
          setRecoverable(updated);
        }
        return contact;
      },
      commercial: runtime.commercial,
      newId: () => runtime.newId(),
    }),
    [
      active,
      commit,
      loading,
      recoverable,
      recoveryError,
      runtime,
      saveError,
      saveStatus,
      startNew,
    ],
  );

  return (
    <AssessmentExperienceContext.Provider value={value}>
      {children}
    </AssessmentExperienceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAssessmentExperience(): AssessmentExperienceValue {
  const value = useContext(AssessmentExperienceContext);
  if (!value) throw new Error("Assessment experience provider is missing");
  return value;
}
