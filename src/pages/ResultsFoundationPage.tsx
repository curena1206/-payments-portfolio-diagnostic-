import { Link } from "react-router-dom";
import { useAssessmentExperience } from "../application/assessment/AssessmentExperienceContext";
import { ResultsExperience } from "../components/ResultsExperience";
import { CommercialBridge } from "../components/CommercialBridge";
import { generateAssessmentResult } from "../domain/results/generation";
import type { GeneratedAssessmentResult } from "../domain/results/types";

export function ResultsFoundationPage() {
  const { active, loading } = useAssessmentExperience();

  if (loading) {
    return <p aria-live="polite" className="route-status">Calculating your PFI result…</p>;
  }
  if (!active || active.lifecycle !== "complete") {
    return (
      <div className="route-status results-operational-state">
        <h1>Results are not available yet</h1>
        <p>Complete all 49 assessment questions before viewing results.</p>
        <Link className="button button-primary" to={active ? "/assessment" : "/"}>Return to assessment</Link>
      </div>
    );
  }

  let result: GeneratedAssessmentResult;
  try {
    result = generateAssessmentResult(active);
  } catch {
    return (
      <div className="route-status results-operational-state" role="alert">
        <h1>We couldn&apos;t load your result</h1>
        <p>Your completed assessment remains preserved. Try loading the result again.</p>
        <button className="button button-primary" onClick={() => window.location.reload()} type="button">Try again</button>
      </div>
    );
  }
  return (
    <ResultsExperience result={result}>
      <CommercialBridge assessmentInstanceId={active.id} initialContactId={active.recoveryContactId} />
    </ResultsExperience>
  );
}
