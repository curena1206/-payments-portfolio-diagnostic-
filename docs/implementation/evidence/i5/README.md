# I5 runtime evidence

## Completed live-browser checks

- Results retained the locked six-layer order and governing Next Step; the
  Commercial Bridge followed it.
- State A rendered without requesting identity.
- Selecting both actions preserved two independent affirmative controls and
  revealed one purpose-specific identity field.
- Shared-identity submission produced distinct Discussion Request and consent
  acknowledgments.
- Consent withdrawal returned the consent surface to not-granted while the
  completed Discussion Request acknowledgment remained.
- Reload/revisit retained the historical Discussion Request and current
  withdrawn consent state.
- Semantic regions, headings, labels, status messages, and controls were
  present in the browser accessibility tree.
- At the actual 1280px viewport, document scroll width equaled client width
  (1265px), the bridge did not overflow, and its two action panels rendered as
  two equal columns. See `results-commercial-flow-1280.jpg`.

## Remaining runtime-evidence dependency

The in-app browser's responsive viewport capability accepted 320, 375, and
768px overrides but continued reporting and rendering a 1280px viewport. No
narrow-width image was retained or labeled as evidence. Automated responsive
CSS and component coverage remains green, but the required actual 320, 375,
and 768px runtime screenshots must still be captured in a browser surface whose
viewport override is effective.

The asymmetric partial-failure and retry paths are proven through the actual
application component/runtime in automated tests, including no-duplication
assertions in both directions. Screenshot evidence for those injected failure
states remains part of the same runtime-evidence dependency.
