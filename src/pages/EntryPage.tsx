import { ButtonLink } from "../components/ButtonLink";
import { Panel } from "../components/Panel";
import { pfiModel } from "../domain/pfi/model";

export function EntryPage() {
  return (
    <div className="page-stack">
      <section className="hero-foundation">
        <p className="eyebrow">PFI · Standard model v28</p>
        <h1>Payments Franchise Index</h1>
        <p className="lead">
          A structured view of a payments franchise based on respondent evidence.
        </p>
        <ButtonLink to="/assessment">Open assessment foundation</ButtonLink>
      </section>
      <Panel eyebrow="Authoritative model" title="Implementation baseline">
        <dl className="facts">
          <div><dt>Dimensions</dt><dd>{pfiModel.dimensions.length}</dd></div>
          <div><dt>Questions</dt><dd>49</dd></div>
          <div><dt>Scale</dt><dd>0–5</dd></div>
        </dl>
        <p className="boundary-copy">
          I0 establishes the application foundation only. Assessment interaction,
          scoring, results, consent, and discussion-request behavior follow in
          their authorized increments.
        </p>
      </Panel>
    </div>
  );
}
