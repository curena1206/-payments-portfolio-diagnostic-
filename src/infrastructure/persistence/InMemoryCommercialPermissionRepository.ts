import {
  commercialConsentSchema,
  discussionRequestSchema,
  type CommercialConsent,
  type CommercialPermissionRepository,
  type CommercialWriteCommand,
  type DiscussionRequest,
} from "../../domain/identity/contracts";

export class InMemoryCommercialPermissionRepository implements CommercialPermissionRepository {
  readonly consents: CommercialConsent[] = [];
  readonly discussionRequests: DiscussionRequest[] = [];
  private readonly idempotency = new Map<string, { fingerprint: string; record: CommercialConsent | DiscussionRequest }>();

  getCurrentConsent(contactId: string): Promise<CommercialConsent | null> {
    return Promise.resolve(this.consents.filter((item) => item.contactId === contactId).at(-1) ?? null);
  }

  getDiscussionRequest(assessmentInstanceId: string): Promise<DiscussionRequest | null> {
    return Promise.resolve(this.discussionRequests.find((item) => item.assessmentInstanceId === assessmentInstanceId) ?? null);
  }

  saveConsent(command: CommercialWriteCommand<CommercialConsent>): Promise<CommercialConsent> {
    const prior = this.resolvePrior(command);
    if (prior) return Promise.resolve(commercialConsentSchema.parse(prior));
    const record = commercialConsentSchema.parse(command.record);
    this.consents.push(record);
    this.idempotency.set(command.idempotencyKey, { fingerprint: command.commandFingerprint, record });
    return Promise.resolve(record);
  }

  saveDiscussionRequest(command: CommercialWriteCommand<DiscussionRequest>): Promise<DiscussionRequest> {
    const existing = this.discussionRequests.find((item) => item.assessmentInstanceId === command.record.assessmentInstanceId);
    if (existing) return Promise.resolve(existing);
    const prior = this.resolvePrior(command);
    if (prior) return Promise.resolve(discussionRequestSchema.parse(prior));
    const record = discussionRequestSchema.parse(command.record);
    this.discussionRequests.push(record);
    this.idempotency.set(command.idempotencyKey, { fingerprint: command.commandFingerprint, record });
    return Promise.resolve(record);
  }

  private resolvePrior<T>(command: CommercialWriteCommand<T>): CommercialConsent | DiscussionRequest | null {
    const prior = this.idempotency.get(command.idempotencyKey);
    if (!prior) return null;
    if (prior.fingerprint !== command.commandFingerprint) throw new Error("Commercial idempotency conflict");
    return prior.record;
  }
}
