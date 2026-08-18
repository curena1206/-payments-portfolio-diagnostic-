# Payments Franchise Index

This repository contains the production foundation for the Payments Franchise
Index (PFI). The current implementation scope is I0 — Repository & Foundation.

## Local development

Requirements: Node.js 22+ and pnpm 11.19.0.

```sh
pnpm install
pnpm dev
```

The development server prints its local URL. The foundation exposes entry,
assessment, and results routes; assessment behavior and scoring are deliberately
not implemented in I0.

## Verification

```sh
pnpm verify
```

This runs linting, TypeScript checks, unit and contract tests, and the production
build.

## Structure

- `src/app`, `src/pages`, `src/components`: presentation shell and primitives.
- `src/domain/pfi`: authoritative v28 questionnaire data and validation schema.
- `src/domain/identity`: shared Contact, Assessment Instance, consent, and
  Discussion Request contracts.
- `src/domain/assessment`: persistence-neutral assessment answer interfaces.
- `src/fixtures`: fixture manifest and loader foundation.
- `tests`: shell, schema, numerical-control, and identity-scope tests.
- `docs/implementation`: lightweight implementation decisions and legacy
  disposition.

Business and scoring logic must remain outside presentation components. Full
assessment persistence begins in I1; recovery behavior begins in I2; scoring and
result generation begin in I3; commercial consent and Discussion Request behavior
begin in I5.
