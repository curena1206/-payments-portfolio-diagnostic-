import { useState, type FormEvent } from "react";

interface RecoveryPanelProps {
  enabled: boolean;
  onEnable: (email: string) => Promise<void>;
}

export function RecoveryPanel({ enabled, onEnable }: RecoveryPanelProps) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  if (enabled) {
    return (
      <section className="recovery-panel" aria-labelledby="recovery-title">
        <p className="eyebrow">Recovery enabled</p>
        <h2 id="recovery-title">Continue on another device</h2>
        <p>Your recovery contact is associated with this assessment.</p>
        <p className="privacy-note">This does not grant marketing permission.</p>
      </section>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    await onEnable(email);
    setPending(false);
  }

  return (
    <section className="recovery-panel" aria-labelledby="recovery-title">
      <p className="eyebrow">Optional recovery</p>
      <h2 id="recovery-title">Continue on another device</h2>
      <p>Add an email only if you want recoverable continuity beyond this browser or device.</p>
      <form onSubmit={(event) => void submit(event)}>
        <label htmlFor="recovery-email">Email address</label>
        <input
          autoComplete="email"
          id="recovery-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <button className="button button-secondary" disabled={pending} type="submit">
          {pending ? "Enabling recovery…" : "Enable recovery"}
        </button>
      </form>
      <p className="privacy-note">Recovery does not imply reminder or marketing consent.</p>
    </section>
  );
}
