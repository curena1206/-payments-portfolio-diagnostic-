import { useEffect, useRef, type KeyboardEvent, type PropsWithChildren } from "react";

interface ConfirmationDialogProps extends PropsWithChildren {
  title: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmationDialog({
  children,
  title,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  function containFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), input:not([disabled])",
    );
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <div className="dialog-backdrop">
      <div
        aria-labelledby="confirmation-title"
        aria-modal="true"
        className="confirmation-dialog"
        onKeyDown={containFocus}
        ref={dialogRef}
        role="dialog"
      >
        <p className="eyebrow">Confirmation required</p>
        <h2 id="confirmation-title">{title}</h2>
        <div className="dialog-copy">{children}</div>
        <div className="dialog-actions">
          <button className="button button-primary" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
          <button className="button button-secondary" onClick={onCancel} ref={cancelRef} type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
