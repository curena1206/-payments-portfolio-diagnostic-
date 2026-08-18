import { useRef, useState } from "react";
import type { AssessmentAggregate } from "../domain/assessment/aggregate";
import { pfiV28Catalog } from "../domain/assessment/catalog";
import type { PfiQuestion } from "../domain/pfi/schema";
import { ConfirmationDialog } from "./ConfirmationDialog";

const naCopy: Record<string, { confirmation: string; caveat: string }> = {
  G4: {
    confirmation:
      "Confirm only if the relevant decision activities genuinely operate within one integrated organizational unit with no separate functional authority requiring coordination across a boundary.",
    caveat:
      "A shared senior executive or common reporting ancestor does not by itself establish structural absence.",
  },
  B2: {
    confirmation:
      "Confirm only if the franchise's product architecture structurally does not generate, hold, or influence client balances, and could not do so without becoming a materially different business.",
    caveat: "Small balances or low strategic emphasis do not qualify.",
  },
  B3: {
    confirmation:
      "Confirm only if the franchise's product architecture structurally does not generate, hold, or influence client balances, and could not do so without becoming a materially different business.",
    caveat:
      "Confirm this question independently. A confirmed N/A response to B2 does not automatically apply here.",
  },
};

interface QuestionCardProps {
  question: PfiQuestion;
  position: number;
  assessment: AssessmentAggregate;
  onSelect: (questionId: string, optionId: string) => Promise<void>;
  onConfirmNa: (questionId: string) => Promise<void>;
}

export function QuestionCard({
  question,
  position,
  assessment,
  onSelect,
  onConfirmNa,
}: QuestionCardProps) {
  const [naOpen, setNaOpen] = useState(false);
  const naButtonRef = useRef<HTMLButtonElement>(null);
  const response = assessment.responses[question.id];
  const options = pfiV28Catalog.listOptions(question.id);
  const instruction =
    question.pathType === "dual-path"
      ? "Select one statement. Different descriptions may represent equally mature but substantively different choices."
      : "Select the statement that most accurately describes the franchise today.";

  function closeNa() {
    setNaOpen(false);
    window.setTimeout(() => naButtonRef.current?.focus(), 0);
  }

  return (
    <article className="question-card" data-question-id={question.id}>
      <header className="question-header">
        <p className="question-number">Question {position} of 7</p>
        <h3>{question.question}</h3>
        <p className="question-instruction">{instruction}</p>
      </header>
      <fieldset className="response-group">
        <legend className="visually-hidden">Response for {question.id}</legend>
        {options.map((option) => (
          <label className="response-option" key={option.id}>
            <input
              checked={response?.kind === "scored" && response.optionId === option.id}
              name={`response-${question.id}`}
              onChange={() => void onSelect(question.id, option.id)}
              type="radio"
              value={option.id}
            />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      {question.naEligible ? (
        <div className="na-control">
          <p className="secondary-label">Secondary applicability control</p>
          <button
            aria-pressed={response?.kind === "confirmed-na"}
            className="na-button"
            onClick={() => setNaOpen(true)}
            ref={naButtonRef}
            type="button"
          >
            {response?.kind === "confirmed-na" ? "Confirmed: " : ""}
            This condition does not apply to this franchise.
          </button>
        </div>
      ) : null}
      {naOpen ? (
        <ConfirmationDialog
          confirmLabel="Confirm N/A"
          onCancel={closeNa}
          onConfirm={() => {
            void onConfirmNa(question.id).then(closeNa);
          }}
          title="Confirm this condition does not apply"
        >
          <p>{naCopy[question.id]?.confirmation}</p>
          <p>{naCopy[question.id]?.caveat}</p>
        </ConfirmationDialog>
      ) : null}
    </article>
  );
}
