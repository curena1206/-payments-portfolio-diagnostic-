# Payments Franchise Index

This repository contains the production foundation for the Payments Franchise
Index (PFI). The current implementation scope is I2 — Assessment Experience.

## Local development

Requirements: Node.js 22+ and pnpm 11.19.0.

```sh
pnpm install
pnpm dev
```

The development server prints its local URL. The respondent experience supports
entry, same-assessment resume, seven-dimension navigation, automatic saving,
governed N/A confirmation, factual completion, and optional recovery identity.
Scoring and results generation remain deliberately unimplemented.

## Verification

```sh
pnpm verify
```

This runs linting, TypeScript checks, unit and contract tests, and the production
build.

## Structure

- `src/app`, `src/pages`, `src/components`: presentation shell and primitives.
- `src/application/assessment`: respondent-experience orchestration and runtime
  integration outside presentation components.
- `src/domain/pfi`: authoritative v28 questionnaire data and validation schema.
- `src/domain/identity`: shared Contact, consent, and Discussion Request
  contracts.
- `src/domain/assessment`: canonical evidence, aggregate lifecycle, progress,
  authoritative response validation, and persistence-neutral services.
- `src/infrastructure/persistence`: deterministic in-memory test repository and
  browser-backed assessment/contact continuity adapters.
- `src/fixtures`: fixture manifest and loader foundation.
- `tests`: shell, schema, numerical-control, and identity-scope tests.
- `docs/implementation`: lightweight implementation decisions and legacy
  disposition.

Business and scoring logic remain outside presentation components. I2 recovery
associates the shared Contact solely for continuity; it creates no reminder,
commercial-consent, or Discussion Request state. Scoring and result generation
begin in I3; commercial consent and Discussion Request behavior begin in I5.
