import {
  commercialConsentSchema,
  discussionRequestSchema,
  type CommercialConsent,
  type CommercialPermissionRepository,
  type CommercialWriteCommand,
  type DiscussionRequest,
} from "../../domain/identity/contracts";

interface StoredCommercialData {
  consents: CommercialConsent[];
  discussionRequests: DiscussionRequest[];
  idempotency: Record<string, { fingerprint: string; kind: "consent" | "discussion"; recordId: string }>;
}

export class BrowserCommercialPermissionRepository implements CommercialPermissionRepository {
  constructor(private readonly storage: Storage, private readonly storageKey = "pfi.commercial.v1") {}

  getCurrentConsent(contactId: string): Promise<CommercialConsent | null> {
    const records = this.read().consents.filter((item) => item.contactId === contactId);
    return Promise.resolve(records.at(-1) ?? null);
  }

  getDiscussionRequest(assessmentInstanceId: string): Promise<DiscussionRequest | null> {
    return Promise.resolve(this.read().discussionRequests.find(
      (item) => item.assessmentInstanceId === assessmentInstanceId,
    ) ?? null);
  }

  saveConsent(command: CommercialWriteCommand<CommercialConsent>): Promise<CommercialConsent> {
    const data = this.read();
    const prior = this.prior(data, command, "consent");
    if (prior) return Promise.resolve(commercialConsentSchema.parse(prior));
    const record = commercialConsentSchema.parse(command.record);
    data.consents.push(record);
    data.idempotency[command.idempotencyKey] = { fingerprint: command.commandFingerprint, kind: "consent", recordId: record.id };
    this.write(data);
    return Promise.resolve(record);
  }

  saveDiscussionRequest(command: CommercialWriteCommand<DiscussionRequest>): Promise<DiscussionRequest> {
    const data = this.read();
    const existing = data.discussionRequests.find(
      (item) => item.assessmentInstanceId === command.record.assessmentInstanceId,
    );
    if (existing) return Promise.resolve(existing);
    const prior = this.prior(data, command, "discussion");
    if (prior) return Promise.resolve(discussionRequestSchema.parse(prior));
    const record = discussionRequestSchema.parse(command.record);
    data.discussionRequests.push(record);
    data.idempotency[command.idempotencyKey] = { fingerprint: command.commandFingerprint, kind: "discussion", recordId: record.id };
    this.write(data);
    return Promise.resolve(record);
  }

  private prior<T>(data: StoredCommercialData, command: CommercialWriteCommand<T>, kind: "consent" | "discussion"): CommercialConsent | DiscussionRequest | null {
    const prior = data.idempotency[command.idempotencyKey];
    if (!prior) return null;
    if (prior.fingerprint !== command.commandFingerprint || prior.kind !== kind) {
      throw new Error(`Idempotency key ${command.idempotencyKey} was already used for another commercial command`);
    }
    const records = kind === "consent" ? data.consents : data.discussionRequests;
    return records.find((item) => item.id === prior.recordId) ?? null;
  }

  private read(): StoredCommercialData {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return { consents: [], discussionRequests: [], idempotency: {} };
    const value = JSON.parse(raw) as StoredCommercialData;
    return {
      consents: value.consents.map((item) => commercialConsentSchema.parse(item)),
      discussionRequests: value.discussionRequests.map((item) => discussionRequestSchema.parse(item)),
      idempotency: value.idempotency ?? {},
    };
  }

  private write(data: StoredCommercialData): void { this.storage.setItem(this.storageKey, JSON.stringify(data)); }
}
