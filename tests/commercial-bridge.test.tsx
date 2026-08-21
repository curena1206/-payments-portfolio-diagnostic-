import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";
import type { AssessmentRuntime } from "../src/application/assessment/runtime";
import { pfiV28Catalog } from "../src/domain/assessment/catalog";
import { AssessmentService } from "../src/domain/assessment/service";
import { CommercialBridgeService } from "../src/domain/identity/commercialService";
import { contactSchema, type CommercialConsent, type CommercialWriteCommand, type Contact, type DiscussionRequest, type IdentityRepository } from "../src/domain/identity/contracts";
import { loadMp01GoldenFixture } from "../src/fixtures/load";
import { bindMp01Responses } from "../src/fixtures/mp01";
import { InMemoryAssessmentRepository } from "../src/infrastructure/persistence/InMemoryAssessmentRepository";
import { InMemoryCommercialPermissionRepository } from "../src/infrastructure/persistence/InMemoryCommercialPermissionRepository";

class Identities implements IdentityRepository {
  readonly contacts = new Map<string, Contact>();
  getContact(id: string) { return Promise.resolve(this.contacts.get(id) ?? null); }
  findContactByEmail(email: string) { return Promise.resolve([...this.contacts.values()].find((item) => item.email === email) ?? null); }
  saveContact(contact: Contact) { this.contacts.set(contact.id, contact); return Promise.resolve(); }
}

class SelectivelyFailingPermissions extends InMemoryCommercialPermissionRepository {
  failDiscussion = false;
  failConsent = false;
  override saveDiscussionRequest(command: CommercialWriteCommand<DiscussionRequest>) {
    if (this.failDiscussion) { this.failDiscussion = false; return Promise.reject(new Error("DR unavailable")); }
    return super.saveDiscussionRequest(command);
  }
  override saveConsent(command: CommercialWriteCommand<CommercialConsent>) {
    if (this.failConsent) { this.failConsent = false; return Promise.reject(new Error("Consent unavailable")); }
    return super.saveConsent(command);
  }
}

const contactId = "10000000-0000-4000-8000-000000000001";
const assessmentOne = "20000000-0000-4000-8000-000000000001";
const assessmentTwo = "20000000-0000-4000-8000-000000000002";

function serviceFixture(permissions = new InMemoryCommercialPermissionRepository()) {
  const identities = new Identities();
  identities.contacts.set(contactId, contactSchema.parse({ id: contactId, email: "leader@example.com", createdAt: "2026-08-21T10:00:00Z" }));
  let id = 10;
  const service = new CommercialBridgeService({
    permissions, identities, now: () => "2026-08-21T10:00:00Z",
    newId: () => `30000000-0000-4000-8000-${String(id++).padStart(12, "0")}`,
  });
  return { service, permissions, identities };
}

describe("I5 commercial bridge domain", () => {
  it("keeps discussion and consent as independent scoped writes", async () => {
    const { service, permissions } = serviceFixture();
    await service.requestDiscussion({ contactId, assessmentInstanceId: assessmentOne, idempotencyKey: "dr-1" });
    expect((await service.load(contactId, assessmentOne)).discussionRequest?.status).toBe("submitted");
    expect((await service.load(contactId, assessmentOne)).consent).toBeNull();
    await service.grantConsent({ contactId, idempotencyKey: "consent-1" });
    expect((await service.load(contactId, assessmentOne)).consent?.status).toBe("granted");
    expect(permissions.discussionRequests).toHaveLength(1);
    expect(permissions.consents).toHaveLength(1);
  });

  it("is idempotent for repeated action commands", async () => {
    const { service, permissions } = serviceFixture();
    const first = await service.requestDiscussion({ contactId, assessmentInstanceId: assessmentOne, idempotencyKey: "same-dr" });
    const repeat = await service.requestDiscussion({ contactId, assessmentInstanceId: assessmentOne, idempotencyKey: "same-dr" });
    const grant = await service.grantConsent({ contactId, idempotencyKey: "same-consent" });
    const repeatGrant = await service.grantConsent({ contactId, idempotencyKey: "same-consent" });
    expect(repeat.id).toBe(first.id);
    expect(repeatGrant.id).toBe(grant.id);
    expect(permissions.discussionRequests).toHaveLength(1);
    expect(permissions.consents).toHaveLength(1);
  });

  it("isolates partial failure and retries only the failed write", async () => {
    const permissions = new SelectivelyFailingPermissions();
    const { service } = serviceFixture(permissions);
    permissions.failConsent = true;
    const outcomes = await Promise.allSettled([
      service.requestDiscussion({ contactId, assessmentInstanceId: assessmentOne, idempotencyKey: "dr" }),
      service.grantConsent({ contactId, idempotencyKey: "consent" }),
    ]);
    expect(outcomes.map((item) => item.status)).toEqual(["fulfilled", "rejected"]);
    expect(permissions.discussionRequests).toHaveLength(1);
    expect(permissions.consents).toHaveLength(0);
    await service.grantConsent({ contactId, idempotencyKey: "consent" });
    expect(permissions.discussionRequests).toHaveLength(1);
    expect(permissions.consents).toHaveLength(1);
  });

  it("withdraws consent prospectively without changing historical discussion requests", async () => {
    const { service, permissions } = serviceFixture();
    await service.grantConsent({ contactId, idempotencyKey: "grant" });
    await service.requestDiscussion({ contactId, assessmentInstanceId: assessmentOne, idempotencyKey: "dr" });
    await service.withdrawConsent({ contactId, idempotencyKey: "withdraw" });
    const revisited = await service.load(contactId, assessmentOne);
    expect(revisited.consent?.status).toBe("withdrawn");
    expect(revisited.discussionRequest?.status).toBe("submitted");
    expect(permissions.consents.map((item) => item.status)).toEqual(["granted", "withdrawn"]);
  });

  it("persists consent across assessments without leaking discussion requests", async () => {
    const { service } = serviceFixture();
    await service.grantConsent({ contactId, idempotencyKey: "grant" });
    await service.requestDiscussion({ contactId, assessmentInstanceId: assessmentOne, idempotencyKey: "dr" });
    expect((await service.load(contactId, assessmentTwo)).consent?.status).toBe("granted");
    expect((await service.load(contactId, assessmentTwo)).discussionRequest).toBeNull();
  });
});

async function completedRuntime(
  knownIdentity = false,
  permissions: InMemoryCommercialPermissionRepository = new InMemoryCommercialPermissionRepository(),
): Promise<{ runtime: AssessmentRuntime; permissions: InMemoryCommercialPermissionRepository; contactId: string | null; assessmentId: string }> {
  const assessments = new InMemoryAssessmentRepository();
  const identities = new Identities();
  let id = 100;
  let time = 0;
  const newId = () => `40000000-0000-4000-8000-${String(id++).padStart(12, "0")}`;
  const now = () => `2026-08-21T10:00:${String(time++ % 60).padStart(2, "0")}Z`;
  const service = new AssessmentService({ assessments, identities, catalog: pfiV28Catalog, newId, now });
  const knownContact = knownIdentity ? contactSchema.parse({ id: newId(), email: "known@example.com", createdAt: now() }) : null;
  if (knownContact) await identities.saveContact(knownContact);
  let assessment = await service.createAssessment({ idempotencyKey: "create", recoveryContactId: knownContact?.id ?? null });
  for (const [index, response] of bindMp01Responses(loadMp01GoldenFixture(), pfiV28Catalog).entries()) {
    assessment = await service.recordScoredResponse({ assessmentId: assessment.id, questionId: response.questionId, optionId: response.option.id, idempotencyKey: `answer-${index}` });
  }
  return {
    permissions,
    contactId: knownContact?.id ?? null,
    assessmentId: assessment.id,
    runtime: {
      service, identities,
      commercial: new CommercialBridgeService({ permissions, identities, newId, now }),
      continuity: { getCurrentAssessmentId: () => assessment.id, setCurrentAssessmentId: () => undefined },
      newId, now,
    },
  };
}

describe("I5 commercial bridge experience", () => {
  it("renders after the six substantive layers and supports both actions through shared identity", async () => {
    const { runtime, permissions } = await completedRuntime();
    const { container } = render(<MemoryRouter initialEntries={["/results"]}><App runtime={runtime} /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Continue the conversation" })).toBeVisible();
    const nextStep = container.querySelector("#next-step")!;
    const bridge = container.querySelector("#commercial-bridge")!;
    expect(nextStep.compareDocumentPosition(bridge)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.queryByLabelText(/Enter your email/)).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole("checkbox", { name: "Request a discussion" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to receive occasional/ }));
    expect(screen.getByLabelText("Enter your email so we can process the choices you selected.")).toBeVisible();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "executive@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit selected choices" }));
    expect(await screen.findByText("Your discussion request has been received for this assessment.")).toBeVisible();
    expect(screen.getByText(/permission for personal outreach is recorded/)).toBeVisible();
    expect(permissions.discussionRequests).toHaveLength(1);
    expect(permissions.consents).toHaveLength(1);
  });

  it("allows neither action and leaves the complete result unchanged", async () => {
    const { runtime, permissions } = await completedRuntime();
    render(<MemoryRouter initialEntries={["/results"]}><App runtime={runtime} /></MemoryRouter>);
    expect(await screen.findByText(/Both options are optional and do not affect/)).toBeVisible();
    expect(screen.getByRole("heading", { name: "Your PFI Composite" })).toBeVisible();
    expect(permissions.discussionRequests).toHaveLength(0);
    expect(permissions.consents).toHaveLength(0);
    expect(await screen.findByRole("checkbox", { name: "Request a discussion" })).not.toBeChecked();
  });

  it("renders known identity without re-requesting email and keeps consent ungranted", async () => {
    const { runtime } = await completedRuntime(true);
    render(<MemoryRouter initialEntries={["/results"]}><App runtime={runtime} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("checkbox", { name: "Request a discussion" }));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /I agree to receive occasional/ })).not.toBeChecked();
  });

  it("renders granted consent and submitted discussion as acknowledgments, then supports withdrawal", async () => {
    const fixture = await completedRuntime(true);
    await fixture.runtime.commercial.grantConsent({ contactId: fixture.contactId!, idempotencyKey: "seed-consent" });
    await fixture.runtime.commercial.requestDiscussion({ contactId: fixture.contactId!, assessmentInstanceId: fixture.assessmentId, idempotencyKey: "seed-dr" });
    render(<MemoryRouter initialEntries={["/results"]}><App runtime={fixture.runtime} /></MemoryRouter>);
    expect(await screen.findByText("Your discussion request has been received for this assessment.")).toBeVisible();
    expect(screen.getByText(/permission for personal outreach is recorded/)).toBeVisible();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Withdraw permission" }));
    expect(await screen.findByRole("checkbox", { name: /I agree to receive occasional/ })).not.toBeChecked();
    expect(fixture.permissions.discussionRequests).toHaveLength(1);
    expect(fixture.permissions.consents.map((item) => item.status)).toEqual(["granted", "withdrawn"]);
  });

  it("keeps a successful discussion request when consent fails and retries only consent", async () => {
    const permissions = new SelectivelyFailingPermissions();
    permissions.failConsent = true;
    const fixture = await completedRuntime(true, permissions);
    render(<MemoryRouter initialEntries={["/results"]}><App runtime={fixture.runtime} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("checkbox", { name: "Request a discussion" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to receive occasional/ }));
    fireEvent.click(screen.getByRole("button", { name: "Submit selected choices" }));
    expect(await screen.findByText("Your discussion request has been received for this assessment.")).toBeVisible();
    expect(screen.getByText("Your permission was not recorded. Retry this choice.")).toBeVisible();
    expect(permissions.discussionRequests).toHaveLength(1);
    expect(permissions.consents).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Grant permission" }));
    expect(await screen.findByText(/permission for personal outreach is recorded/)).toBeVisible();
    expect(permissions.discussionRequests).toHaveLength(1);
    expect(permissions.consents).toHaveLength(1);
  });

  it("keeps successful consent when the discussion request fails and retries only discussion", async () => {
    const permissions = new SelectivelyFailingPermissions();
    permissions.failDiscussion = true;
    const fixture = await completedRuntime(true, permissions);
    render(<MemoryRouter initialEntries={["/results"]}><App runtime={fixture.runtime} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("checkbox", { name: "Request a discussion" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to receive occasional/ }));
    fireEvent.click(screen.getByRole("button", { name: "Submit selected choices" }));
    expect(await screen.findByText(/permission for personal outreach is recorded/)).toBeVisible();
    expect(screen.getByText("Your discussion request was not submitted. Retry this choice.")).toBeVisible();
    expect(permissions.consents).toHaveLength(1);
    expect(permissions.discussionRequests).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Request a discussion" }));
    expect(await screen.findByText("Your discussion request has been received for this assessment.")).toBeVisible();
    expect(permissions.consents).toHaveLength(1);
    expect(permissions.discussionRequests).toHaveLength(1);
  });

  it("moves focus to shared identity when an unknown respondent selects an action", async () => {
    const { runtime } = await completedRuntime();
    render(<MemoryRouter initialEntries={["/results"]}><App runtime={runtime} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("checkbox", { name: "Request a discussion" }));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });
});
