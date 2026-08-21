import { z } from "zod";

const id = z.string().uuid();
const timestamp = z.string().datetime({ offset: true });

export const contactSchema = z.object({
  id,
  email: z.string().email(),
  createdAt: timestamp,
});

export const commercialConsentSchema = z.object({
  id,
  contactId: id,
  status: z.enum(["granted", "withdrawn"]),
  recordedAt: timestamp,
});

export const discussionRequestSchema = z.object({
  id,
  contactId: id,
  assessmentInstanceId: id,
  status: z.enum(["submitted", "processing", "completed", "failed"]),
  submittedAt: timestamp,
});

export type Contact = z.infer<typeof contactSchema>;
export type CommercialConsent = z.infer<typeof commercialConsentSchema>;
export type DiscussionRequest = z.infer<typeof discussionRequestSchema>;

export interface IdentityRepository {
  getContact(contactId: string): Promise<Contact | null>;
  findContactByEmail(email: string): Promise<Contact | null>;
  saveContact(contact: Contact): Promise<void>;
}

export interface CommercialPermissionRepository {
  getCurrentConsent(contactId: string): Promise<CommercialConsent | null>;
  saveConsent(command: CommercialWriteCommand<CommercialConsent>): Promise<CommercialConsent>;
  getDiscussionRequest(
    assessmentInstanceId: string,
  ): Promise<DiscussionRequest | null>;
  saveDiscussionRequest(command: CommercialWriteCommand<DiscussionRequest>): Promise<DiscussionRequest>;
}

export interface CommercialWriteCommand<T> {
  record: T;
  idempotencyKey: string;
  commandFingerprint: string;
}
