interface SaveStatusProps {
  status: "idle" | "saving" | "saved" | "error";
  error: string | null;
  onRetry: () => void;
}

export function SaveStatus({ status, error, onRetry }: SaveStatusProps) {
  if (status === "idle") return <p className="save-status">Saved automatically</p>;
  if (status === "saving") {
    return <p aria-live="polite" className="save-status">Saving your response…</p>;
  }
  if (status === "saved") {
    return <p aria-live="polite" className="save-status save-status-success">Response saved</p>;
  }
  return (
    <div aria-live="assertive" className="save-status save-status-error" role="alert">
      <span>We couldn&apos;t save this change. {error}</span>
      <button className="text-button" onClick={onRetry} type="button">Retry</button>
    </div>
  );
}
