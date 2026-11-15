import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { SiteNavigation } from "@/components/site-navigation";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <Container className="flex flex-wrap items-center gap-x-8 gap-y-1 py-3 sm:py-0">
        <Link href="/" className="order-1 py-2 text-xl font-bold tracking-tight">
          Code<span className="text-accent">Lingo</span>
        </Link>
        <Suspense fallback={<SiteNavigationFallback />}>
          <SiteNavigation />
        </Suspense>
        <Link
          href="/profile"
          aria-label="View Alex's profile"
          className="order-2 ml-auto flex items-center gap-2 rounded-md hover:text-accent sm:order-3 sm:py-3"
        >
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-muted">
            AL
          </span>
          <div className="text-sm leading-tight">
            <p className="font-bold">Alex</p>
            <p className="mt-1 text-xs text-muted">Example profile</p>
          </div>
        </Link>
      </Container>
    </header>
  );
}

function SiteNavigationFallback() {
  return (
    <nav aria-label="Main navigation" className="order-3 flex w-full gap-6 text-sm sm:order-2 sm:w-auto">
      <Link href="/" className="py-3 font-bold text-muted sm:py-5">Home</Link>
      <Link href="/problems" className="py-3 font-bold text-muted sm:py-5">Problems</Link>
    </nav>
  );
}
