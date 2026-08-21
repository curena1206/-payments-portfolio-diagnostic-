# Implementation decision and defect log

This is a lightweight engineering record, not a new governance framework.

## I0-001 — Typed browser application foundation

**Decision:** Use React, TypeScript, Vite, Zod, Vitest, Testing Library, ESLint,
and pnpm. Keep domain contracts and authoritative data separate from routes and
components.

**Rationale:** The stack provides a runnable local baseline, explicit routes,
compile-time checks, runtime contract validation, deterministic tests, and a
small deployment artifact without determining later persistence infrastructure.

## I0-002 — Persistence boundary without persistence behavior

**Decision:** Define repository interfaces for identity, assessment instances,
answers, contact-scoped consent, and instance-scoped Discussion Requests. Do not
choose a database or implement workflows in I0.

**Rationale:** This establishes the required separation once while keeping I1,
I2, and I5 behavior inside their authorized increments.

## I0-003 — Authoritative v28 extraction

**Decision:** Store verbatim questions, constructs, metadata source statements,
0–5 anchors, and derived 6/9 response-option records in
`pfi-model.v28.json`. Preserve internal path identity while allowing a future UI
to hide it as governed.

The structured model records the authoritative source SHA-256 digest
`6f4f23dda10ffadcaad44be9e81e245ab420c72b47bf70e06e0d0b42e02033e6`.

**Verification:** Extraction used Appendix C and Sections 69, 77, 85, 88, 91,
and 94 of the v28 source. Section 99/100 closure controls were then checked
directly. Automated tests enforce the final numerical controls.

## I0-004 — Earlier weight table integration defect

**Finding:** Section 55 of the cumulative Strategy Working Record contains an
earlier seven-weight table. Later Section 78 explicitly states that its figures
are the locked numerical-control checkpoint and that no alternative figures
supersede them. Sections 96 and 99 reconfirm the final controls. The I0 work order
also repeats those final figures.

**Disposition:** Use the later, explicitly authoritative weights totaling 100%:
31.87, 18.86, 18.86, 11.52, 10.51, 6.25, and 2.13. This is a resolved document
integration history, not a governing conflict requiring reopening.

## I0-005 — MP-01 controlled artifact not supplied

**Finding:** The provided v1.11 record identifies the controlled source as “PFI
Gate 3E-3 Mixed-Profile MP-01 v0.3.3” and confirms a 74.2 Standard Composite and
eight qualifying signals, but does not contain the fixture's full 49 responses
or seven approved Dimension Scores.

**Disposition:** Establish a schema-validated MP-01 manifest slot with the two
confirmed expected controls and mark its data as `awaiting-controlled-source`.
Do not invent fixture responses. Import of the controlled artifact belongs before
I3 golden-result tests.

## I1-001 — Aggregate persistence and autosave boundary

**Decision:** Persist each assessment as one versioned aggregate containing its
lifecycle, optional recovery Contact association, and the canonical state of all
49 responses. Application services depend only on an assessment repository
interface; the in-memory adapter is a deterministic reference implementation,
not a production database choice.

**Rationale:** An aggregate write keeps each answer transition, factual progress,
and completion eligibility atomic. Optimistic revisions reject stale writes, and
command idempotency keys make retries return the original committed result
without producing an additional write.

## I1-002 — Canonical evidence states and completion

**Decision:** A response is exactly one of `Unanswered`, `Scored response`, or
`Confirmed N/A`. Scored responses retain the authoritative option ID, score, and
internal Dual-path identity. Confirmed N/A is permitted only for G4, B2, and B3,
records an explicit affirmative confirmation and its timestamp without storing
free-form rationale, and never receives a numeric score. Both scored and
confirmed-N/A states count factually toward completion; results become eligible
only at 49/49.

**Rationale:** This preserves the governed evidence semantics without introducing
the I3 scoring engine or presentation behavior.

## I1-003 — Recovery identity remains separate

**Decision:** Optional recovery associates an assessment with the shared Contact
model. Neither consent nor Discussion Request state is embedded in the assessment
aggregate or created by recovery operations.

**Rationale:** Recovery identity, commercial consent, and Discussion Requests
have different scopes and remain separated for their authorized increments.

## I1-004 — Explicit questionnaire-version binding

**Decision:** Authoritative question and option access occurs through a catalog
with an explicit model identity. Before any response mutation, the application
service verifies that the Assessment Instance model ID equals the active catalog
model ID. The only supported catalog is `pfi-standard-v28`.

**Rationale:** Stored option IDs must never be silently reinterpreted against a
different questionnaire version. Unsupported or mismatched model identities fail
explicitly; migration behavior is outside I1.

## I2-001 — Assessment experience orchestration

**Decision:** React components render authoritative model content and delegate
all committed response transitions to the reviewed I1 service through an
application context. The context owns loading, saving, saved, error, retry,
resume, and recovery-association orchestration; components own only transient
interaction state such as an open accordion panel or N/A confirmation.

**Rationale:** This keeps persistence and evidence rules out of presentation
components while allowing the full Gate 4B respondent journey to use the same
validated transitions as non-UI clients.

## I2-002 — Browser continuity adapter

**Decision:** Provide versioned browser-storage adapters for assessment
aggregates, idempotency results, the current-assessment pointer, and shared
Contacts. Recovery association remains a Contact link only and creates no
permission or Discussion Request state.

**Rationale:** I2 requires durable same-browser autosave/resume and optional
identity association, while production hosting, authentication, retention, and
cross-device transport remain deployment decisions rather than questionnaire or
scoring behavior.

## I2-003 — Locked density and accessibility treatment

**Decision:** Render exact v28 questions and response statements in vertically
growing radio rows. Dual-path items remain one flat list with internal path data
hidden. Dimension headers are full-width buttons with `aria-expanded`; N/A uses
an eligible-only modal confirmation with initial focus, containment, Escape,
and return focus; operational messages use live-region semantics.

**Rationale:** This implements the Gate 4B/4E interaction architecture without
compressing evidence, exposing scoring metadata, or deferring obvious
assessment-side accessibility foundations.

## I2-004 — Respondent dimension presentation order

**Decision:** Encode the respondent-facing dimension order as an explicit
presentation contract, independent of model storage and Standard PFI weight:
Client Value & Commercial Relevance; Governance & Operating Model; Revenue
Architecture; Balance Sheet & Liquidity Contribution; Multi-Rail Strategy &
Future Readiness; Margin & Cost Structure; Growth Engine Quality. Both the
dimension navigator and first-incomplete resume routing consume this contract.

**Governing source:** Gate 4B Assessment Experience Prototype v0.3, slide 4,
explicitly numbers this sequence 01–07; Gate 4E Production Design Specification
& Handoff v0.1.1, Journey/Route Matrix assessment row, requires seven dimensions
in locked order. The Assessment Experience & Output Working Record v1.11 locks
Gate 4B v0.3 and Gate 4E v0.1.1 as the implementation authorities. The earlier
alternative in Strategy Review Working Record v28 section 19 is labeled
“Working Direction” and is therefore supporting history, not the final Gate 4
presentation decision.

**Rationale:** The final locked sequence currently happens to match the v28
model array, which is arranged by Standard PFI weight. An explicit contract
prevents a future methodology/catalog reordering from silently changing the
respondent journey or resume destination.

## I2-005 — Narrow-mobile dual-path orientation cue

**Decision:** At widths up to 35rem, show a quiet, non-evaluative “Option n of
9” cue above each Dual-path anchor. The cue is presentation-only and excluded
from the radio's accessible name; the radio sequence and all locked anchor text
remain unchanged.

**Rationale:** This improves orientation within long M4-class flat lists without
introducing score/path metadata, sticky obstruction, pagination, truncation, or
hidden response logic.

## I3-001 — Calculation precision and result contracts

**Decision:** Keep full floating-point precision through question averaging and
weighted composite calculations. Round only explicit presentation values to one
decimal place. Produce discriminated, serializable Standard, Adjusted, and
Insufficient-Basis contracts so I4 can render results without recalculating or
inferring methodology.

**Rationale:** v28 Sections 60–61 require full internal precision, presentation-
boundary rounding, equal applicable-question weighting, fixed Standard weights,
and count-first Adjusted eligibility evaluation.

## I3-002 — Deterministic categorical result facts

**Decision:** Generate Signals, Profile states, Examination Agenda entry types,
Intentional-Choice registers, and conservative Pattern facts as structured
domain output. The engine carries exact selected evidence and governed category
identities but does not draft diagnosis, severity, recommendation, prescription,
owner, KPI, or plan language. Pattern emits only directly supportable categorical
configurations or the governed null state.

**Rationale:** Gate 3 assigns qualification and evidence assembly to the engine
while reserving presentation and carefully bounded prose for I4. Structured
facts keep those responsibilities separate and deterministic.

## I3-003 — MP-01 controlled-source dependency refined

**Finding:** The authoritative MP-01 v0.3.3 artifact is now available. It supplies
the seven raw dimension-score arrays, seven approved displayed Dimension Scores,
the 74.2 Standard Composite, eight named qualifying signal outcomes, and the fact
that Multi-Rail includes one Level-3 Intentional-Choice response. It does not
supply a complete question-to-selected-option-ID ledger. The unordered Multi-
Rail facts cannot be converted into that ledger without inference.

**Disposition:** Import the authoritative dimension arithmetic as controlled
golden data and validate all seven Dimension Scores plus the composite exactly.
Keep full MP-01 option-level Signal/Intentional-Choice reproduction blocked on
the missing controlled ledger. Do not reverse-engineer or synthesize it from the
expected outputs.

## I3-004 — MP-01 controlled implementation fixture dependency closed

**Decision:** Adopt independently reviewed MP-01 Controlled Implementation
Golden Fixture v1.0.1 as the authoritative implementation ledger. Store its 49
canonical fixture keys and expected controls as test data. Resolve every key to
exactly one option through the existing `pfi-standard-v28` catalog, then commit
the selections through the reviewed I1 `AssessmentService` before invoking I3.

**Verification:** The end-to-end golden test reproduces all seven Dimension
Scores, the 74.2 Standard Composite, eight Signals, three Formal Strengths,
three dimension-level Examination Agenda areas, one ordinary scored dimension,
the M4 Level-3 Intentional-Choice register, and the governed convergence Pattern.
No production result-generation branch contains MP-01 expected outputs.

**Disposition:** I3-003's missing-ledger dependency is closed. No I3 calculation,
qualification, Signal, Agenda, Intentional-Choice, or Pattern implementation
defect was exposed by the approved fixture.

## I4-001 — Results rendering consumes reviewed I3 facts

**Decision:** Render the six-layer Results experience from the reviewed
`GeneratedAssessmentResult` contract. Presentation resolves governed names,
construct descriptions, selected anchors, and Standard weights through the
authoritative v28 catalog/model; it does not recalculate scores, qualification,
Signals, Pattern, Strength, Agenda, or Intentional-Choice eligibility.

**Rationale:** Working Record v1.11 and Gate 4E require presentation to preserve
the I3 evidence boundary. Keeping content resolution separate from the result
engine prevents UI components from becoming a second scoring implementation.

## I4-002 — Gate 4C density and sequence treatment

**Decision:** Keep the substantive order Result → Profile → Signals → Pattern →
Examination Agenda → Next Step. Profile rows, Signal groups, Pattern named
dimensions, and Agenda entries all consume the single respondent-facing
dimension order in `presentationOrder.ts`. Signals use native disclosure
controls, while Pattern remains a flat editorial passage and Agenda uses the
three semantic jobs in reading order.

**Rationale:** Gate 4C v0.2 supplies the final visual hierarchy, and the reviewed
I2 presentation contract prevents score or methodology order from becoming an
unintended structural ranking. This ordering changes presentation only and does
not alter v28 weights, I3 arrays, qualification, or result facts.

## I4-003 — I4 Next Step boundary excludes commercial behavior

**Decision:** End I4 with the invariant governing principle and no action,
identity, consent, Discussion Request, or commercial component.

**Rationale:** The authorized I4 work order allows the substantive Next Step
boundary but reserves all optional engagement state and behavior for I5.

## I4-004 — Responsive visual verification

**Verification:** MP-01 was rendered through the application at 320, 375, 768,
and 1280 CSS pixels. At every width, document scroll width equaled client width;
all seven Profile rows, eight Signals, three Agenda entries, and six navigation
links remained present. Desktop evidence covers Result, Profile, Signals,
Pattern, and Agenda; mobile and empty operational-state evidence are retained in
`docs/implementation/evidence/i4/`.

## I4-005 — Executive display precision

**Decision:** Render respondent-facing Composite and Dimension Scores as
conventionally rounded whole numbers. Full precision remains authoritative for
calculation and validation, including the MP-01 74.2 validation control and all
stored/result-domain numeric values.

**Rationale:** Tenths of an index point are not treated as managerially
decision-useful distinctions in the executive experience. Display rounding does
not affect PFI methodology, qualification, Standard/Adjusted/Insufficient Basis
determination, or Strength, Signal, Pattern, and Examination Agenda logic. The
achievable Dimension Score set was checked against the locked Strength (>=80)
and Dimension Agenda (<=40) boundaries; no misleading display/qualification
boundary conflict was identified.

**Reconsideration boundary:** Display precision is a presentation-layer
convention that may later be reconsidered based on observed user comprehension
or feedback without changing PFI methodology, provided underlying calculation
and qualification logic remain unchanged.

## I5-001 — Commercial actions use independent scoped transactions

**Decision:** Implement Assessment Discussion Request and commercial consent as
separate service commands and separate idempotent repository writes. Discussion
Request is indexed by assessment instance; current consent is resolved from a
contact-scoped event history. A shared email interaction may establish one
Contact for both selected commands, but email capture is not either command.

**Rationale:** Gate 3F and Gate 4E require operational efficiency without
semantic bundling. Independent writes allow either action to succeed, fail, and
retry without mutating or duplicating the other.

## I5-002 — Consent withdrawal is a prospective contact event

**Decision:** Record withdrawal as a new contact-scoped consent event and render
the latest event as current status. Do not delete or mutate prior consent events,
assessment evidence, or historical instance-scoped Discussion Requests.

**Rationale:** This preserves the locked withdrawal/revisit and audit-metadata
contract while keeping discussion history independent.

## I5-003 — Commercial bridge remains result-invariant

**Decision:** Mount one commercial bridge after the substantive Next Step. Its
inputs are only assessment-instance identity and current Contact association;
it receives no composite, Dimension Score, Strength, Signal, Pattern, Agenda, or
result-state facts.

**Rationale:** Structural absence of result facts prevents severity-responsive
branching and preserves Standard, Adjusted, and Insufficient-Basis behavior.

## I5-004 — Commercial identity does not create recovery association

**Correction:** Resolve or create the shared Contact required by an affirmed
commercial action without associating that Contact as the Assessment Instance's
recovery Contact. Recovery remains an independent, explicitly initiated path.

**Rationale:** The locked disclosure limits use of identity entered in the
Commercial Bridge to the affirmed choice or choices. Contact resolution is
necessary for the scoped commercial records; recovery association is not.
