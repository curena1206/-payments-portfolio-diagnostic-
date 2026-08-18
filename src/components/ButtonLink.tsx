import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

interface ButtonLinkProps extends PropsWithChildren {
  to: string;
}

export function ButtonLink({ children, to }: ButtonLinkProps) {
  return (
    <Link className="button-link" to={to}>
      {children}
    </Link>
  );
}
