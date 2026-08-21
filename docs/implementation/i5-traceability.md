# I5 Commercial Bridge traceability

| Governing requirement | Implementation | Verification |
|---|---|---|
| Three base states A/B/C | `CommercialBridge` resolves identity and latest contact consent independently | known/unknown/granted UI tests |
| Per-instance Discussion Request overlay | `CommercialBridgeService.requestDiscussion` and repository assessment-instance lookup | scope and cross-instance tests |
| Contact-scoped commercial consent | consent event history keyed by Contact | grant, revisit, withdrawal tests |
| Progressive/shared identity | action selections reveal one purpose-specific email field only when identity is unknown | both-actions and known-identity UI tests |
| Separate affirmative choices and writes | two checkboxes orchestrate two independent commands | both-actions and independent-write tests |
| Partial failure and retry | `Promise.allSettled`; successful state is retained and failed selection remains retryable | both asymmetric-failure UI tests plus selective-failure domain test |
| Idempotency | action-specific keys and repository command fingerprints; one DR per assessment instance | repeated-command test |
| Withdrawal/revisit | append withdrawal event; latest contact event governs render | prospective-withdrawal test |
| Multi-instance isolation | consent lookup by Contact; DR lookup by assessment instance | second-assessment test |
| No gating / choose neither | bridge follows all six result layers and has no required action | UI order and neither-action test |
| Severity/content invariance | bridge API accepts no generated-result facts | component boundary plus full I0–I5 regression suite |
| Accessibility | labeled checkboxes/email, focus transfer to newly required identity, semantic regions/headings, visible focus, live status/alerts, minimum target styles | focus/component tests and runtime keyboard/semantic checks |

E-01 through E-10 remain empirical release dependencies. I5 automated and
runtime checks do not mark any empirical item passed.

Runtime-browser evidence and its remaining narrow-viewport/failure-injection
capture dependency are recorded in `docs/implementation/evidence/i5/README.md`.
