import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-identity">
          <a className="site-home-link" href="https://carlosurena.com/">
            Carlos Ureña
          </a>
          <span className="site-identity-divider" aria-hidden="true">·</span>
          <Link className="brand" to="/">
            Payments Franchise Index
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
