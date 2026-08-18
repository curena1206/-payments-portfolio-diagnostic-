import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          Payments Franchise Index
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
