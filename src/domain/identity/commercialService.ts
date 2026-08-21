import {
  commercialConsentSchema,
  discussionRequestSchema,
  type CommercialConsent,
  type CommercialPermissionRepository,
  type DiscussionRequest,
  type IdentityRepository,
} from "./contracts";

export interface CommercialBridgeState {
  consent: CommercialConsent | null;
  discussionRequest: DiscussionRequest | null;
}

export class CommercialBridgeService {
  constructor(private readonly dependencies: {
    permissions: CommercialPermissionRepository;
    identities: IdentityRepository;
    now: () => string;
    newId: () => string;
  }) {}

  async load(contactId: string | null, assessmentInstanceId: string): Promise<CommercialBridgeState> {
    if (!contactId) return { consent: null, discussionRequest: null };
    await this.requireContact(contactId);
    const [consent, discussionRequest] = await Promise.all([
      this.dependencies.permissions.getCurrentConsent(contactId),
      this.dependencies.permissions.getDiscussionRequest(assessmentInstanceId),
    ]);
    return { consent, discussionRequest };
  }

  async grantConsent(input: { contactId: string; idempotencyKey: string }): Promise<CommercialConsent> {
    await this.requireContact(input.contactId);
    const current = await this.dependencies.permissions.getCurrentConsent(input.contactId);
    if (current?.status === "granted") return current;
    const record = commercialConsentSchema.parse({
      id: this.dependencies.newId(), contactId: input.contactId,
      status: "granted", recordedAt: this.dependencies.now(),
    });
    return this.dependencies.permissions.saveConsent({
      record, idempotencyKey: input.idempotencyKey,
      commandFingerprint: JSON.stringify({ type: "grant-consent", contactId: input.contactId }),
    });
  }

  async withdrawConsent(input: { contactId: string; idempotencyKey: string }): Promise<CommercialConsent> {
    await this.requireContact(input.contactId);
    const current = await this.dependencies.permissions.getCurrentConsent(input.contactId);
    if (current?.status === "withdrawn") return current;
    const record = commercialConsentSchema.parse({
      id: this.dependencies.newId(), contactId: input.contactId,
      status: "withdrawn", recordedAt: this.dependencies.now(),
    });
    return this.dependencies.permissions.saveConsent({
      record, idempotencyKey: input.idempotencyKey,
      commandFingerprint: JSON.stringify({ type: "withdraw-consent", contactId: input.contactId }),
    });
  }

  async requestDiscussion(input: {
    contactId: string; assessmentInstanceId: string; idempotencyKey: string;
  }): Promise<DiscussionRequest> {
    await this.requireContact(input.contactId);
    const current = await this.dependencies.permissions.getDiscussionRequest(input.assessmentInstanceId);
    if (current?.status === "submitted") return current;
    const record = discussionRequestSchema.parse({
      id: this.dependencies.newId(), contactId: input.contactId,
      assessmentInstanceId: input.assessmentInstanceId,
      status: "submitted", submittedAt: this.dependencies.now(),
    });
    return this.dependencies.permissions.saveDiscussionRequest({
      record, idempotencyKey: input.idempotencyKey,
      commandFingerprint: JSON.stringify({
        type: "request-discussion", contactId: input.contactId,
        assessmentInstanceId: input.assessmentInstanceId,
      }),
    });
  }

  private async requireContact(contactId: string): Promise<void> {
    if (!(await this.dependencies.identities.getContact(contactId))) {
      throw new Error(`Unknown Contact: ${contactId}`);
    }
  }
}
