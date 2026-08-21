# I6 integration and release-readiness record

## Disposition

**Classification B — IMPLEMENTATION COMPLETE — RELEASE GATES REMAIN.**

The reviewed I0–I5 product behavior is integrated and no blocking implementation
defect was found in I6. This is not production authorization. E-01–E-10 have not
been executed with participants, and external production infrastructure and
operating-policy decisions remain open.

## Integrated traceability audit

| Governing behavior | Implementation | Automated verification | Runtime/manual verification |
|---|---|---|---|
| Authoritative 49-question v28 model and option structures | `pfi-model.v28.json`, catalog | `pfi-model.contract`, `fixture-loader` | Dense canonical content inspected at 320px |
| Anonymous start; resume; deliberate supersession | assessment context, Entry page, service lifecycle | `assessment-experience`: start/resume/supersede | Entry and completed-assessment continuation inspected |
| Capability-only and Dual-path exclusivity | catalog, QuestionCard fieldsets/radios | `assessment-engine`, `assessment-experience` | Six- and nine-option groups exposed in accessibility tree |
| Autosave, retry, idempotency, stale-write rejection | AssessmentService and repositories | `assessment-engine`, `assessment-experience` | Saved status and committed response reconstruction inspected |
| Factual progress and 48/49 gate | progress and result generation | `assessment-engine`, `assessment-experience`, `i6-integration-release` | 49/49 completion and result route inspected |
| N/A eligibility, transient dialog, cancel/confirm/replacement | service, QuestionCard, ConfirmationDialog | `assessment-engine`, `assessment-experience`, `result-engine` | 320px dialog; focus containment, Escape, and return verified |
| Recovery is optional and non-consent | shared Contact plus explicit recovery command | `assessment-experience`, `identity-contracts`, `commercial-bridge` | Recovery disclosure and commercial controls inspected separately |
| MP-01 v1.0.1 full-precision scoring | scoring/result generation pipeline | `mp01-golden`, `i6-integration-release` | Production Results route inspected |
| Standard, Adjusted, Insufficient Basis | result calculation and rendering | `result-engine`, `results-experience` | Standard MP-01 inspected; other states executable in component integration |
| Six-layer Results order | ResultsExperience | `results-experience`, `commercial-bridge` | Accessibility tree confirms Result through Next Step before bridge |
| Whole-number display with full-precision authority | presentation rounding only | `results-experience`, `mp01-golden` | 74/100 and seven rounded dimensions; one disclosure at every tested width |
| Strengths, Signals, Pattern, Agenda, Intentional Choice | reviewed result generation | `mp01-golden`, `result-engine`, `results-experience` | All layers and individual evidence reachable in runtime tree |
| Result/severity-invariant commercial bridge | CommercialBridge receives IDs only | `commercial-bridge`, `results-experience` | Same post-result placement at all verified widths |
| A/B/C base states and independent DR overlay | commercial service/component | `commercial-bridge` | Reviewed I5 live evidence plus current known/not-granted revisit |
| Shared identity with independent writes | Contact resolution plus two commands | `commercial-bridge` | Reviewed I5 live both-actions evidence |
| Partial failure, isolated retry, no duplication | `Promise.allSettled`, idempotency keys | `commercial-bridge` both asymmetric directions | Independently reviewed I5 live injected-failure evidence |
| Consent withdrawal and revisit | append-only contact consent events | `commercial-bridge`, `i6-integration-release` | Reviewed I5 withdrawal/revisit evidence |
| Multiple instances and no DR leakage | contact consent lookup; instance DR lookup | `commercial-bridge`, `i6-integration-release` | Reconstructed browser state verifies separation |
| Commercial identity does not create recovery | Contact-only commercial identity path | `commercial-bridge` DR-only/consent-only/both | Independently reviewed I5 correction |
| Reload/browser reconstruction and corruption handling | browser repositories and continuity store | `i6-integration-release` | Reload/revisit exercised; malformed state fails closed |
| Loading, empty, save error, Results error, bridge error/retry | route/context/component operational states | `assessment-experience`, `results-experience`, `commercial-bridge` | Status and alert semantics inspected; failure states exercised in integration tests |

Audit result: every locked I0–I5 implementation behavior has an executable path
and an identified automated or runtime verification method. No documentation-only
implementation state was found.

## Adversarial and negative-space coverage

| Prohibited behavior | Guard / evidence |
|---|---|
| Results at 48/49 | result generator throws; route gate and integration tests |
| Invalid/cross-question option | authoritative catalog rejection tests |
| Unsupported model reinterpretation | model-binding rejection test |
| N/A on ineligible question or numeric N/A | assessment/result engine tests |
| Intentional Choice independently qualifying Signal/Agenda | result-engine boundary tests |
| Rounded display changing qualification | full-precision golden controls plus presentation-only tests |
| Cross-instance DR inheritance | commercial and I6 reconstruction tests |
| Recovery implying consent; DR implying consent; consent implying DR | identity/commercial independence tests |
| Commercial identity creating recovery | three explicit commercial-bridge tests |
| Partial failure duplicating success | both asymmetric retry tests |
| Withdrawal erasing historical DR | withdrawal/revisit tests |
| Score/severity branching in bridge | bridge input boundary and invariance tests |
| Stale write replacing newer evidence | optimistic concurrency rejection test |
| Corrupt persistence silently overwritten | I6 fail-closed/no-overwrite tests |

## MP-01 production-path control

The browser-backed I1/I3 path reproduces underlying Dimension Scores 94.3,
91.4, 88.6, 31.4, 34.3, 28.6, and 57.1; Standard Composite 74.2; eight Signals;
three Strengths; three dimension Agenda entries; and M4 Level-3 Intentional
Choice. Respondent presentation remains 74 / 100 and 94, 91, 89, 31, 34, 29,
57, with exactly one rounding disclosure.

## Runtime accessibility and responsive verification

- Actual viewport checks passed at 320, 375, 768, and 1280 CSS pixels. At each
  width, document scroll width equaled client width and the bridge itself had no
  overflow. Bridge panels used one column through 768 and two columns at 1280.
- The 320px assessment rendered a nine-radio Dual-path group without horizontal
  overflow. The N/A dialog fit within the viewport, focused Cancel on open,
  contained forward/reverse Tab, closed with Escape, and returned focus.
- Headings, accordion expanded state, radio groups, progress, dialog, status,
  alert, consent label, and result disclosures were present in the accessibility
  tree. Commercial controls retained a visible 3px focus outline.
- The 320px reflow check is at least as restrictive as the required 1280px-wide
  layout at 400% zoom; no essential two-dimensional scrolling occurred.
- Measured text contrasts: muted text on white 5.43:1; muted on canvas 5.01:1;
  strong accent on white 6.96:1; success 7.06:1; error 7.22:1. These exceed
  WCAG 2.2 AA text thresholds.
- Primary controls and labeled option rows exceed 24px. Native radio/checkbox
  boxes are smaller but their enclosing labels provide the target. Isolated
  brand/disclosure text targets use the SC 2.5.8 spacing exception; no adjacent
  target overlap was observed.
- Browser coverage in this environment: Codex in-app Chromium surface. Separate
  Safari/Firefox execution was not available and remains deployment QA.
- Real screen-reader speech output was not available. Runtime roles/names/states
  and live regions were inspected, but NVDA/JAWS/VoiceOver confirmation remains
  a release gate.

## E-01–E-10 empirical gates

Gate 4E provides the task/risk and minimum evidence for each item and requires,
before testing, item-specific preregistration of participant sample and relevant
segments, task-success criteria, observation-coding rules, and a systematic-
failure threshold. The governing contract exists; no completed item-specific
preregistration or participant results were found. Thresholds must not be set or
relaxed after observing results.

| ID | Required empirical question | Status |
|---|---|---|
| E-01 | Resume versus deliberate-new-assessment comprehension | NOT EXECUTED — RELEASE GATE OPEN |
| E-02 | Dense nine-option Dual-path comparison | NOT EXECUTED — RELEASE GATE OPEN |
| E-03 | N/A open/cancel/confirm comprehension | NOT EXECUTED — RELEASE GATE OPEN |
| E-04 | Composite/result interpreted without verdict, grade, or certification | NOT EXECUTED — RELEASE GATE OPEN |
| E-05 | Profile shape and Strength treatment without invented ordinary-row bands | NOT EXECUTED — RELEASE GATE OPEN |
| E-06 | Signal discoverability without count-as-severity interpretation | NOT EXECUTED — RELEASE GATE OPEN |
| E-07 | Pattern versus Agenda without diagnosis/prescription interpretation | NOT EXECUTED — RELEASE GATE OPEN |
| E-08 | DR optionality and consent independence | NOT EXECUTED — RELEASE GATE OPEN |
| E-09 | Two actions/scopes understood after shared identity | NOT EXECUTED — RELEASE GATE OPEN |
| E-10 | Representative dense mobile task completion | NOT EXECUTED — RELEASE GATE OPEN |

Before production release: approve item-specific preregistration, recruit the
defined sample/segments, execute all tasks, code observations under the locked
rules, apply the precommitted systematic-failure thresholds, and record evidence
plus PASS/refine/narrow-reopen disposition for every item.

## Production infrastructure and operating dependencies

| Area | Current status | Release disposition |
|---|---|---|
| Hosting/deployment | Production build verified; no public host configured | Deployment configuration required |
| Persistence/storage | Versioned browser localStorage implemented and tested | Production durable storage decision is a blocker |
| Cross-device recovery/authentication | Contact association model only; no authenticated transport | Release blocker if cross-device recovery is offered |
| Privacy/storage policy | Purpose copy exists; no approved public privacy/storage policy or link | Release blocker |
| Commercial delivery/notification | DR and consent persist locally; no delivery/notification backend | Release blocker |
| Consent persistence/audit | Contact-scoped event history implemented locally | Production audit, legal basis, retention, and durable storage requirements are blockers |
| DR handling | Instance-scoped record implemented locally | Operational queue/owner/status handling is a blocker |
| Analytics/telemetry | Not implemented | Decision/configuration required if measurement is required |
| Error monitoring | Not implemented | Production configuration required |
| Environment/configuration/secrets | No external services or secrets configured | Required with selected infrastructure |
| Retention/deletion | Not implemented | Policy and implementation required before storing production data |
| Public routing/direct routes | Client routes work in dev; host fallback configuration absent | Deployment verification required |
| Performance | Production build passes; 535kB main-chunk advisory remains | Nonblocking optimization candidate; verify against launch budget |

Implementation complete does not mean release authorized. Production release
remains blocked by E-01–E-10, assistive-technology/browser coverage, and the
production infrastructure/policy items above.
