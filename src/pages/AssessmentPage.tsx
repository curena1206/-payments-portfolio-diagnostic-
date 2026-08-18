import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssessmentExperience } from "../application/assessment/AssessmentExperienceContext";
import { QuestionCard } from "../components/QuestionCard";
import { RecoveryPanel } from "../components/RecoveryPanel";
import { SaveStatus } from "../components/SaveStatus";
import {
  getAssessmentProgress,
  getDimensionProgress,
} from "../domain/assessment/progress";
import { respondentDimensions } from "../domain/pfi/presentationOrder";

function firstIncompleteDimension(assessment: NonNullable<ReturnType<typeof useAssessmentExperience>["active"]>) {
  const progress = getDimensionProgress(assessment);
  const progressByDimension = new Map(
    progress.map((dimension) => [dimension.dimensionId, dimension]),
  );
  return respondentDimensions.find(
    (dimension) => progressByDimension.get(dimension.id)?.complete !== 7,
  )?.id ?? respondentDimensions[0]!.id;
}

export function AssessmentPage() {
  const navigate = useNavigate();
  const experience = useAssessmentExperience();
  const { active, loading } = experience;
  const [openDimension, setOpenDimension] = useState<string | null | undefined>(
    undefined,
  );

  const dimensionProgress = useMemo(
    () => (active ? getDimensionProgress(active) : []),
    [active],
  );

  if (loading) {
    return <p aria-live="polite" className="route-status">Restoring your assessment…</p>;
  }
  if (!active) {
    return (
      <div className="route-status">
        <h1>No active assessment</h1>
        <button className="button button-primary" onClick={() => void navigate("/")} type="button">Return to entry</button>
      </div>
    );
  }

  const totalProgress = getAssessmentProgress(active);
  const effectiveOpenDimension =
    openDimension === undefined ? firstIncompleteDimension(active) : openDimension;

  return (
    <div className="assessment-layout">
      <header className="assessment-header">
        <div>
          <p className="eyebrow">Payments Franchise Index</p>
          <h1>Assessment</h1>
          <p className="lead">Select the evidence statement that best represents the franchise today.</p>
        </div>
        <div className="assessment-progress" aria-label={`${totalProgress.complete} of 49 complete`}>
          <strong>{totalProgress.complete} of 49 complete</strong>
          <progress max="49" value={totalProgress.complete}>{totalProgress.complete} of 49</progress>
          <SaveStatus
            error={experience.saveError}
            onRetry={() => void experience.retrySave()}
            status={experience.saveStatus}
          />
        </div>
      </header>

      <div className="dimension-accordion">
        {respondentDimensions.map((dimension, dimensionIndex) => {
          const expanded = effectiveOpenDimension === dimension.id;
          const progress = dimensionProgress.find((item) => item.dimensionId === dimension.id)!;
          const panelId = `dimension-panel-${dimension.id}`;
          return (
            <section className={`dimension-section${expanded ? " is-expanded" : ""}`} key={dimension.id}>
              <h2>
                <button
                  aria-controls={panelId}
                  aria-expanded={expanded}
                  className="dimension-toggle"
                  onClick={() => setOpenDimension(expanded ? null : dimension.id)}
                  type="button"
                >
                  <span className="dimension-index">{String(dimensionIndex + 1).padStart(2, "0")}</span>
                  <span className="dimension-name">{dimension.name}</span>
                  <span className="dimension-completion">{progress.complete} of 7 complete</span>
                  <span aria-hidden="true" className="dimension-chevron">⌄</span>
                </button>
              </h2>
              {expanded ? (
                <div className="dimension-panel" id={panelId}>
                  {dimension.questions.map((question, questionIndex) => (
                    <QuestionCard
                      assessment={active}
                      key={question.id}
                      onConfirmNa={(questionId) =>
                        experience.confirmNotApplicable(questionId)
                      }
                      onSelect={(questionId, optionId) =>
                        experience.selectOption(questionId, optionId)
                      }
                      position={questionIndex + 1}
                      question={question}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <RecoveryPanel
        enabled={active.recoveryContactId !== null}
        onEnable={(email) => experience.associateRecovery(email)}
      />

      <section className="completion-panel" aria-labelledby="completion-title">
        <div>
          <p className="eyebrow">Assessment completion</p>
          <h2 id="completion-title">{totalProgress.complete} of 49 complete</h2>
          <p>Results become available after every question has a committed response.</p>
        </div>
        <button
          className="button button-primary"
          disabled={!totalProgress.resultEligible}
          onClick={() => void navigate("/results")}
          type="button"
        >
          View results
        </button>
      </section>
    </div>
  );
}
