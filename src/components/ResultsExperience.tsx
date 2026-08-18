import { pfiModel } from "../domain/pfi/model";
import { respondentDimensionIds } from "../domain/pfi/presentationOrder";
import type {
  CompositeResult,
  GeneratedAssessmentResult,
  ProfileEntry,
} from "../domain/results/types";
import {
  agendaContent,
  dimensionName,
  patternCopy,
  strengthEvidence,
} from "../application/results/content";

function CompositeDisclosure({ composite }: { composite: CompositeResult }) {
  if (composite.state === "standard") {
    return (
      <>
        <p className="result-explanation">
          Your PFI Composite is {composite.displayScore}/100, a weighted summary
          of your responses across seven payments franchise dimensions.
        </p>
        <p className="result-disclosure">
          It reflects the responses provided in this assessment and is not an
          independent verification of your organization.
        </p>
        <p className="result-bridge">
          The composite summarizes your results across seven underlying
          dimensions. The sections that follow show how those dimensions differ
          and, where the evidence warrants, identify areas for closer attention.
        </p>
      </>
    );
  }

  if (composite.state === "adjusted") {
    return (
      <>
        <p className="result-explanation">
          Calculated from the {composite.scoredDimensionCount} dimensions for
          which sufficient evidence was available.
        </p>
        <dl className="adjusted-facts">
          <div><dt>Scored dimensions</dt><dd>{composite.scoredDimensionCount} of 7</dd></div>
          <div><dt>Standard-weight coverage</dt><dd>{composite.standardWeightCoveragePercent.toFixed(2)}%</dd></div>
          <div><dt>Missing dimensions</dt><dd>{composite.missingDimensions.map((item) => item.dimensionName).join(", ")}</dd></div>
        </dl>
        <p className="result-bridge">
          The composite summarizes the dimensions for which sufficient evidence
          was available. The sections that follow show how the available
          dimension evidence differs and, where the evidence warrants, identify
          areas for closer attention.
        </p>
      </>
    );
  }

  return (
    <>
      <p className="result-explanation">
        PFI methodology requires at least five scored dimensions representing at
        least 65% of Standard PFI weight before calculating a composite.
      </p>
      <p className="result-disclosure">
        {composite.reason === "dimension-count"
          ? `${composite.scoredDimensionCount} dimensions have sufficient evidence.`
          : `${composite.standardWeightCoveragePercent.toFixed(2)}% of Standard PFI weight has sufficient evidence.`}
      </p>
      <p className="result-bridge">
        A composite could not be calculated under PFI&apos;s methodology. The
        sections that follow show the available dimension evidence and, where
        the evidence warrants, identify areas for closer attention.
      </p>
    </>
  );
}

function MethodologyReference({ composite }: { composite: CompositeResult }) {
  return (
    <details className="methodology-reference">
      <summary>How PFI is calculated</summary>
      <p>
        Questions carry equal weight within each dimension. Confirmed N/A
        responses are excluded from that dimension&apos;s average, and at least four
        scored responses are required for a Dimension Score.
      </p>
      <dl className="weight-list">
        {pfiModel.dimensions.map((dimension) => (
          <div key={dimension.id}>
            <dt>{dimension.name}</dt>
            <dd>{dimension.standardWeightPercent.toFixed(2)}%</dd>
          </div>
        ))}
      </dl>
      {composite.state !== "standard" ? (
        <p>These are the original Standard PFI weights.</p>
      ) : null}
    </details>
  );
}

function ProfileRow({ entry }: { entry: ProfileEntry }) {
  const isStrength = entry.state === "formal-strength";
  const score = entry.dimension.displayScore;
  return (
    <li className={`profile-row${isStrength ? " profile-row-strength" : ""}`}>
      <div className="profile-row-heading">
        <h3>{entry.dimension.dimensionName}</h3>
        <div className="profile-score">
          {score === null ? "Insufficient basis" : score.toFixed(1)}
          {score !== null ? <span className="visually-hidden"> out of 100</span> : null}
        </div>
        {isStrength ? <strong className="strength-label">Strength</strong> : null}
      </div>
      {score !== null ? (
        <div className="profile-track" aria-hidden="true">
          <span style={{ width: `${score}%` }} />
        </div>
      ) : null}
      {isStrength ? (
        <details className="strength-evidence">
          <summary>Evidence supporting this treatment</summary>
          <ul>
            {strengthEvidence(entry).map((evidence) => <li key={evidence}>{evidence}</li>)}
          </ul>
        </details>
      ) : null}
    </li>
  );
}

export function ResultsExperience({ result }: { result: GeneratedAssessmentResult }) {
  const profile = respondentDimensionIds.map((dimensionId) => {
    const entry = result.profile.find(
      (candidate) => candidate.dimension.dimensionId === dimensionId,
    );
    if (!entry) throw new Error(`Profile is missing dimension ${dimensionId}`);
    return entry;
  });
  const signalsByDimension = new Map<string, typeof result.signals>();
  for (const signal of result.signals) {
    signalsByDimension.set(signal.dimensionId, [
      ...(signalsByDimension.get(signal.dimensionId) ?? []),
      signal,
    ]);
  }
  const orderedSignalDimensionIds = respondentDimensionIds.filter((dimensionId) =>
    signalsByDimension.has(dimensionId),
  );
  const orderedAgenda = [...result.examinationAgenda].sort((left, right) => {
    return (
      respondentDimensionIds.indexOf(left.dimensionId as (typeof respondentDimensionIds)[number]) -
      respondentDimensionIds.indexOf(right.dimensionId as (typeof respondentDimensionIds)[number])
    );
  });

  return (
    <article className="results-report">
      <header className="results-title">
        <p className="eyebrow">Payments Franchise Index</p>
        <h1>Your PFI result</h1>
        <nav aria-label="Result sections" className="results-nav">
          {[
            ["result", "Result"], ["profile", "Profile"], ["signals", "Signals"],
            ["pattern", "Pattern"], ["agenda", "Examination Agenda"], ["next-step", "Next Step"],
          ].map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}
        </nav>
      </header>

      <section aria-labelledby="result-heading" className="result-hero" id="result">
        <div className="section-kicker">Result</div>
        <h2 id="result-heading">
          {result.composite.state === "standard"
            ? "Your PFI Composite"
            : result.composite.state === "adjusted"
              ? "Adjusted PFI Composite"
              : "Composite not available"}
        </h2>
        {result.composite.displayScore !== null ? (
          <p className="composite-number">
            {result.composite.displayScore.toFixed(1)} <span>/ 100</span>
          </p>
        ) : null}
        <CompositeDisclosure composite={result.composite} />
        <MethodologyReference composite={result.composite} />
      </section>

      <section aria-labelledby="profile-heading" className="result-section" id="profile">
        <div className="section-kicker">Profile</div>
        <h2 id="profile-heading">The shape of the evidence at a glance</h2>
        <p className="section-intro">All seven Dimension Scores remain visible. Strength marks evidence-grounded treatment only.</p>
        <ol className="profile-list">{profile.map((entry) => <ProfileRow entry={entry} key={entry.dimension.dimensionId} />)}</ol>
      </section>

      <section aria-labelledby="signals-heading" className="result-section" id="signals">
        <div className="section-kicker">Signals</div>
        <h2 id="signals-heading">Individual evidence points</h2>
        <p className="section-intro">Each qualifying evidence point remains independently reachable.</p>
        {result.signals.length === 0 ? (
          <p className="empty-state" role="status">No qualifying question-level signals were surfaced under PFI&apos;s rules.</p>
        ) : (
          <div className="signal-groups">
            {orderedSignalDimensionIds.map((dimensionId) => (
              <details className="signal-group" key={dimensionId}>
                <summary aria-label={`Show signals for ${dimensionName(dimensionId)}`}>{dimensionName(dimensionId)}</summary>
                <div className="signal-list">
                  {signalsByDimension.get(dimensionId)!.map((signal) => (
                    <article className="signal-item" key={signal.questionId}>
                      <p className="secondary-label">{signal.category === "sri" ? "Strategic Relevance Indicator" : "Universal Low-Score Visibility"}</p>
                      <h3>{signal.construct}</h3>
                      <p><strong>Selected evidence</strong></p>
                      <p>{signal.evidenceText}</p>
                    </article>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="pattern-heading" className="pattern-section" id="pattern">
        <div className="section-kicker">Pattern</div>
        <h2 id="pattern-heading">Whole-profile synthesis</h2>
        <p className="pattern-copy">{patternCopy(result.pattern)}</p>
        <p className="pattern-bridge">The next section moves from whole-profile description to specific evidence that met PFI&apos;s rules for deeper examination.</p>
      </section>

      <section aria-labelledby="agenda-heading" className="result-section" id="agenda">
        <div className="section-kicker">Examination Agenda</div>
        <h2 id="agenda-heading">Evidence for deeper examination</h2>
        {result.examinationAgenda.length === 0 ? (
          <p className="empty-state" role="status">No areas met PFI&apos;s rules for Examination Agenda treatment.</p>
        ) : (
          <div className="agenda-list">
            {orderedAgenda.map((entry) => {
              const content = agendaContent(entry, result);
              const entryId = entry.type === "dimension" ? entry.dimensionId : entry.questionId;
              return (
                <article className="agenda-entry" key={`${entry.type}-${entryId}`}>
                  <header className="agenda-heading">
                    <h3>{entry.type === "dimension" ? dimensionName(entry.dimensionId) : pfiModel.dimensions.flatMap((dimension) => dimension.questions).find((question) => question.id === entry.questionId)?.title}</h3>
                    {entry.type === "dimension" ? <span>{entry.dimensionScore.toFixed(1)} <span className="visually-hidden">out of 100</span></span> : null}
                  </header>
                  <div className="agenda-jobs">
                    <section aria-labelledby={`${entryId}-shows`}>
                      <h4 id={`${entryId}-shows`}>What your assessment shows</h4>
                      <ul>{content.shows.map((item) => <li key={item.label}><strong>{item.label}:</strong> {item.evidence}</li>)}</ul>
                      {content.intentionalChoices.map((choice) => <p className="intentional-choice" key={choice.evidence}><strong>Deliberate choice:</strong> {choice.evidence.replace("This response records a deliberate choice: ", "")}</p>)}
                    </section>
                    <section aria-labelledby={`${entryId}-why`}>
                      <h4 id={`${entryId}-why`}>Why it is worth examining</h4>
                      <p>{content.why}</p>
                    </section>
                    <section aria-labelledby={`${entryId}-next`}>
                      <h4 id={`${entryId}-next`}>What to examine next</h4>
                      <p>{content.next}</p>
                      {content.intentionalChoices.map((choice) => <p key={choice.next}>{choice.next}</p>)}
                    </section>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="next-step-heading" className="next-step" id="next-step">
        <div className="section-kicker">Next Step</div>
        <h2 id="next-step-heading">Continue with the evidence</h2>
        <p>{result.governingPrinciple}</p>
      </section>
    </article>
  );
}
