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
