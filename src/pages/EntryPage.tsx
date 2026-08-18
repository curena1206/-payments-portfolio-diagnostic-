import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssessmentExperience } from "../application/assessment/AssessmentExperienceContext";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { getAssessmentProgress } from "../domain/assessment/progress";

export function EntryPage() {
  const navigate = useNavigate();
  const { loading, recoverable, recoveryError, resume, startNew } =
    useAssessmentExperience();
  const [confirmNew, setConfirmNew] = useState(false);

  async function beginNew(supersede = false) {
    await startNew(supersede);
    void navigate("/assessment");
  }

  if (loading) {
    return <p aria-live="polite" className="route-status">Restoring your assessment…</p>;
  }

  return (
    <div className="entry-page page-stack">
      <header className="entry-intro">
        <p className="eyebrow">PFI · Standard model v28</p>
        <h1>Assess the commercial health of your payments franchise.</h1>
        <p className="lead">
          49 evidence-based questions across seven dimensions. Your responses are
          saved automatically in this browser so you can return later.
        </p>
      </header>
      {recoveryError ? (
        <div className="notice notice-error" role="alert">
          <strong>We couldn&apos;t recover this assessment.</strong>
          <span>Try again on the original browser or start a new assessment.</span>
        </div>
      ) : null}
      <div className="entry-options">
        <section className="entry-card entry-card-primary">
          <p className="eyebrow">New assessment</p>
          <h2>Start without identity</h2>
          <p>No contact information is required. Results become available after all 49 questions are complete.</p>
          <button
            className="button button-primary"
            onClick={() => {
              if (recoverable?.lifecycle === "in-progress") setConfirmNew(true);
              else void beginNew();
            }}
            type="button"
          >
            Start assessment
          </button>
        </section>
        {recoverable ? (
          <section className="entry-card">
            <p className="eyebrow">Returning assessment</p>
            <h2>{getAssessmentProgress(recoverable).complete} of 49 complete</h2>
            <p>Continue the same assessment at the first incomplete question in the authoritative order.</p>
            <button
              className="button button-primary"
              onClick={() => {
                void resume();
                void navigate(recoverable.lifecycle === "complete" ? "/results" : "/assessment");
              }}
              type="button"
            >
              Continue assessment
            </button>
          </section>
        ) : (
          <section className="entry-card entry-empty">
            <p className="eyebrow">Returning assessment</p>
            <h2>No assessment to resume</h2>
            <p>Start a new assessment on this browser. Optional cross-device recovery can be added later.</p>
          </section>
        )}
      </div>
      {confirmNew ? (
        <ConfirmationDialog
          confirmLabel="Start new assessment"
          onCancel={() => setConfirmNew(false)}
          onConfirm={() => void beginNew(true)}
          title="Start a new assessment?"
        >
          <p>This will supersede the unfinished assessment and preserve it as historical evidence.</p>
          <p>Your new assessment will begin with 49 unanswered questions.</p>
        </ConfirmationDialog>
      ) : null}
    </div>
  );
}
