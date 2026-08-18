import type { PropsWithChildren } from "react";

interface PanelProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
}

export function Panel({ children, eyebrow, title }: PanelProps) {
  return (
    <section className="panel">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}
