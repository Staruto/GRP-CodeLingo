"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/problems", label: "Problems" },
  { href: "/submissions", label: "Submissions" },
] as const;

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="order-3 flex w-full gap-6 text-sm sm:order-2 sm:w-auto">
      {navigation.map(({ href, label }) => {
        const active = href === "/"
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`border-b-2 py-3 font-bold hover:text-accent sm:py-5 ${active ? "border-accent text-accent" : "border-transparent text-muted"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
