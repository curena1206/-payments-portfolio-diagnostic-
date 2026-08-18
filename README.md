# Payments Franchise Index

This repository contains the production foundation for the Payments Franchise
Index (PFI). The current implementation scope is I1 — Assessment Engine &
Persistence.

## Local development

Requirements: Node.js 22+ and pnpm 11.19.0.

```sh
pnpm install
pnpm dev
```

The development server prints its local URL. The presentation remains the I0
shell. I1 adds persistence-neutral assessment lifecycle and evidence services;
assessment UI and scoring remain deliberately unimplemented.

## Verification

```sh
pnpm verify
```

This runs linting, TypeScript checks, unit and contract tests, and the production
build.

## Structure

- `src/app`, `src/pages`, `src/components`: presentation shell and primitives.
- `src/domain/pfi`: authoritative v28 questionnaire data and validation schema.
- `src/domain/identity`: shared Contact, consent, and Discussion Request
  contracts.
- `src/domain/assessment`: canonical evidence, aggregate lifecycle, progress,
  authoritative response validation, and persistence-neutral services.
- `src/infrastructure/persistence`: deterministic in-memory assessment repository
  used to verify persistence behavior without choosing production storage.
- `src/fixtures`: fixture manifest and loader foundation.
- `tests`: shell, schema, numerical-control, and identity-scope tests.
- `docs/implementation`: lightweight implementation decisions and legacy
  disposition.

Business and scoring logic must remain outside presentation components. Full
I1 provides optional Contact association solely for reload/resume. User-facing
recovery behavior remains in I2; scoring and result generation begin in I3;
commercial consent and Discussion Request behavior begin in I5.
