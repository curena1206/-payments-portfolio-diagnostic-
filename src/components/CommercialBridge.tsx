import { useEffect, useMemo, useRef, useState } from "react";
import { useAssessmentExperience } from "../application/assessment/AssessmentExperienceContext";
import type { CommercialBridgeState } from "../domain/identity/commercialService";

const EMPTY_STATE: CommercialBridgeState = { consent: null, discussionRequest: null };

export function CommercialBridge({
  assessmentInstanceId,
  initialContactId,
}: {
  assessmentInstanceId: string;
  initialContactId: string | null;
}) {
  const { commercial, identifyForCommercialAction, newId } = useAssessmentExperience();
  const [contactId, setContactId] = useState(initialContactId);
  const [state, setState] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [discussionSelected, setDiscussionSelected] = useState(false);
  const [consentSelected, setConsentSelected] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [discussionError, setDiscussionError] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [identityError, setIdentityError] = useState(false);
  const discussionKey = useRef(newId());
  const consentKey = useRef(newId());
  const emailInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let current = true;
    commercial.load(initialContactId, assessmentInstanceId).then((loaded) => {
      if (current) setState(loaded);
    }).catch(() => { if (current) setLoadError(true); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [assessmentInstanceId, commercial, initialContactId]);

  const discussionSubmitted = state.discussionRequest?.status === "submitted";
  const consentGranted = state.consent?.status === "granted";
  const selectedCount = Number(discussionSelected && !discussionSubmitted) + Number(consentSelected && !consentGranted);
  const helper = useMemo(() => {
    if (selectedCount === 2) return "Enter your email so we can process the choices you selected.";
    if (discussionSelected) return "Enter your email so we can respond to this discussion request.";
    return "Enter your email so this permission can be recorded and communications can be sent to you.";
  }, [discussionSelected, selectedCount]);

  useEffect(() => {
    if (!contactId && selectedCount > 0) emailInput.current?.focus();
  }, [contactId, selectedCount]);

  async function submitSelected() {
    if (selectedCount === 0) return;
    setSubmitting(true);
    setDiscussionError(false);
    setConsentError(false);
    setIdentityError(false);
    try {
      let resolvedContactId = contactId;
      if (!resolvedContactId) {
        const contact = await identifyForCommercialAction(email);
        resolvedContactId = contact.id;
        setContactId(contact.id);
      }
      const jobs: Promise<unknown>[] = [];
      const names: ("discussion" | "consent")[] = [];
      if (discussionSelected && !discussionSubmitted) {
        names.push("discussion");
        jobs.push(commercial.requestDiscussion({
          contactId: resolvedContactId, assessmentInstanceId,
          idempotencyKey: discussionKey.current,
        }));
      }
      if (consentSelected && !consentGranted) {
        names.push("consent");
        jobs.push(commercial.grantConsent({
          contactId: resolvedContactId, idempotencyKey: consentKey.current,
        }));
      }
      const outcomes = await Promise.allSettled(jobs);
      outcomes.forEach((outcome, index) => {
        const name = names[index];
        if (outcome.status === "fulfilled") {
          if (name === "discussion") {
            setState((current) => ({ ...current, discussionRequest: outcome.value as CommercialBridgeState["discussionRequest"] }));
            setDiscussionSelected(false);
          } else {
            setState((current) => ({ ...current, consent: outcome.value as CommercialBridgeState["consent"] }));
            setConsentSelected(false);
          }
        } else if (name === "discussion") setDiscussionError(true);
        else setConsentError(true);
      });
    } catch {
      setIdentityError(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function withdrawPermission() {
    if (!contactId) return;
    setSubmitting(true);
    setConsentError(false);
    try {
      const consent = await commercial.withdrawConsent({ contactId, idempotencyKey: newId() });
      setState((current) => ({ ...current, consent }));
    } catch { setConsentError(true); }
    finally { setSubmitting(false); }
  }

  return (
    <section aria-labelledby="commercial-bridge-heading" className="commercial-bridge" id="commercial-bridge">
      <div className="section-kicker">Optional continuation</div>
      <h2 id="commercial-bridge-heading">Continue the conversation</h2>
      <p>If you&apos;d like to continue the conversation, the options below are available independently.</p>
      <p className="commercial-reassurance">You can request a discussion about this assessment, receive occasional PFI/payments insights, choose both, or choose neither. Both options are optional and do not affect your assessment results.</p>

      {loading ? <p aria-live="polite">Loading your current choices…</p> : loadError ? (
        <p className="commercial-error" role="alert">We couldn&apos;t load your current choices. Reload the page to try again.</p>
      ) : (
        <div className="commercial-actions">
          <section aria-labelledby="discussion-heading" className="commercial-choice commercial-choice-primary">
            <h3 id="discussion-heading">Discuss this assessment</h3>
            {discussionSubmitted ? (
              <p className="commercial-success" role="status">Your discussion request has been received for this assessment.</p>
            ) : (
              <>
                <p>If you&apos;d like to discuss these results, you can request a conversation about this assessment.</p>
                <label className="commercial-checkbox">
                  <input checked={discussionSelected} disabled={submitting} onChange={(event) => setDiscussionSelected(event.target.checked)} type="checkbox" />
                  <span>Request a discussion</span>
                </label>
              </>
            )}
            {discussionError ? <p className="commercial-error" role="alert">Your discussion request was not submitted. Retry this choice.</p> : null}
          </section>

          <section aria-labelledby="consent-heading" className="commercial-choice">
            <h3 id="consent-heading">Stay connected</h3>
            {consentGranted ? (
              <>
                <p className="commercial-success" role="status">You&apos;re set to receive occasional PFI and payments insights, and your permission for personal outreach is recorded.</p>
                <p>You can change this permission later through the available consent-management route.</p>
                <button className="text-button" disabled={submitting} onClick={() => void withdrawPermission()} type="button">Withdraw permission</button>
              </>
            ) : (
              <label className="commercial-checkbox">
                <input checked={consentSelected} disabled={submitting} onChange={(event) => setConsentSelected(event.target.checked)} type="checkbox" />
                <span>I agree to receive occasional PFI and payments insights and to be contacted personally about my results.</span>
              </label>
            )}
            {consentError ? <p className="commercial-error" role="alert">Your permission was not recorded. Retry this choice.</p> : null}
          </section>
        </div>
      )}

      {selectedCount > 0 ? (
        <div className="commercial-submit">
          {!contactId ? (
            <label htmlFor="commercial-email">{helper}<input autoComplete="email" id="commercial-email" onChange={(event) => setEmail(event.target.value)} ref={emailInput} required type="email" value={email} /></label>
          ) : null}
          {identityError ? <p className="commercial-error" role="alert">We couldn&apos;t process that email. Check it and try again.</p> : null}
          <button className="button button-primary" disabled={submitting || (!contactId && !email)} onClick={() => void submitSelected()} type="button">
            {submitting ? "Submitting…" : selectedCount === 2 ? "Submit selected choices" : discussionSelected ? "Request a discussion" : "Grant permission"}
          </button>
          <p className="privacy-note">Contact information is used only for the choice or choices you affirm. Entering an email does not grant permission by itself.</p>
        </div>
      ) : null}
    </section>
  );
}
