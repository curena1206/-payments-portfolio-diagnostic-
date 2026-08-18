import { Panel } from "../components/Panel";

export function ResultsFoundationPage() {
  return (
    <div className="page-stack">
      <Panel eyebrow="Results route" title="No result has been generated">
        <p>
          Assessment completion is available for handoff. The governed scoring
          engine and six-layer results experience begin in later increments.
        </p>
      </Panel>
    </div>
  );
}
