# I0 legacy disposition

The legacy implementation remains preserved in Git history at commit
`248e96fb07369e00cd9f5ceaeac85d3b94f67497`. It is not product authority.

## Retain

- The recognizable Payments Franchise Index product name.
- The broad navy, neutral, and restrained gold visual direction, re-expressed as
  accessible design tokens rather than copied CSS.
- A browser-delivered application and a responsive, single-column-safe baseline.

## Refactor / migrate

- The static single-page document becomes a typed React application shell with
  explicit entry, assessment, and results routes.
- Global legacy styling becomes tokens plus reusable shell/panel/button
  primitives.
- Questionnaire content moves from executable JavaScript into schema-validated,
  versioned implementation data.
- In-memory-only behavior is replaced by persistence interfaces; persistence
  business logic remains deferred to its authorized increment.

## Replace

- Six-pillar / 42-question data is replaced by the authoritative seven-dimension,
  49-question v28 model.
- The legacy aggregate, sub-score, and rule architecture is replaced by a neutral
  domain boundary. The governed scoring engine is not implemented until I3.
- Legacy N/A handling is replaced at the contract level by an explicit nonnumeric
  answer state. Full N/A interaction and lifecycle behavior remain later work.
- Ad hoc DOM rendering and CDN runtime dependencies are replaced by a package,
  build, type-check, lint, test, and CI baseline.

## Retire

- Maturity classifications and score bands.
- Diagnostic-severity heatmaps.
- Causal diagnoses.
- Recommendations, priorities, owners, KPIs, and prescriptive 30/60/90 plans.
- Legacy scenario controls and their implied scoring behavior.
- Obsolete three-sub-score presentation.
- Mislabelled PDF/clipboard behavior and the jsPDF CDN dependency.
- The active-root `app.js`, `model.js`, and `styles.css` files. Their full content
  remains recoverable from Git history.
