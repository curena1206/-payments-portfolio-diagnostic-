import { Panel } from "../components/Panel";
import { pfiModel } from "../domain/pfi/model";

export function AssessmentFoundationPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Assessment route</p>
        <h1>Seven-dimension foundation</h1>
        <p className="lead">Question interaction and persistence begin in I1.</p>
      </header>
      <div className="dimension-grid">
        {pfiModel.dimensions.map((dimension) => (
          <Panel key={dimension.id} title={dimension.name}>
            <p>7 questions</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
