import {
  contactSchema,
  type Contact,
  type IdentityRepository,
} from "../../domain/identity/contracts";

export class BrowserIdentityRepository implements IdentityRepository {
  constructor(
    private readonly storage: Storage,
    private readonly storageKey = "pfi.contacts.v1",
  ) {}

  getContact(id: string): Promise<Contact | null> {
    return Promise.resolve(this.read()[id] ?? null);
  }

  findContactByEmail(email: string): Promise<Contact | null> {
    const normalized = email.trim().toLowerCase();
    return Promise.resolve(
      Object.values(this.read()).find((contact) => contact.email === normalized) ?? null,
    );
  }

  saveContact(contact: Contact): Promise<void> {
    const valid = contactSchema.parse(contact);
    this.storage.setItem(
      this.storageKey,
      JSON.stringify({ ...this.read(), [valid.id]: valid }),
    );
    return Promise.resolve();
  }

  private read(): Record<string, Contact> {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return {};
    return Object.fromEntries(
      Object.entries(JSON.parse(raw) as Record<string, Contact>).map(([id, contact]) => [
        id,
        contactSchema.parse(contact),
      ]),
    );
  }
}
