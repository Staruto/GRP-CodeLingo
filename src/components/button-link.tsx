import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  const variantClass =
    variant === "primary" ? "button-link-primary" : "button-link-secondary";

  return <Link className={`button-link ${variantClass} ${className}`} {...props} />;
}
