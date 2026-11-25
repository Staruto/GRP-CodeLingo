import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { SiteNavigation } from "@/components/site-navigation";
import { getCurrentUser, usesLocalDatabase } from "@/server/practice";

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
        <Suspense>
          <HeaderProfile />
        </Suspense>
      </Container>
    </header>
  );
}

async function HeaderProfile() {
  const isMock = !usesLocalDatabase();
  if (!isMock) await connection();
  const user = await getCurrentUser();
  if (!user) return null;

  const className = "order-2 ml-auto flex items-center gap-2 rounded-md sm:order-3 sm:py-3";
  const profile = (
    <>
      <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-muted">
        {user.username.slice(0, 2).toUpperCase()}
      </span>
      <div className="text-sm leading-tight">
        <p className="font-bold">{user.displayName}</p>
        {isMock && <p className="mt-1 text-xs text-muted">Example profile</p>}
      </div>
    </>
  );

  return isMock ? (
    <Link href="/profile" aria-label={`View ${user.displayName}'s profile`} className={`${className} hover:text-accent`}>
      {profile}
    </Link>
  ) : <div className={className}>{profile}</div>;
}

function SiteNavigationFallback() {
  return (
    <nav aria-label="Main navigation" className="order-3 flex w-full gap-6 text-sm sm:order-2 sm:w-auto">
      <Link href="/" className="py-3 font-bold text-muted sm:py-5">Home</Link>
      <Link href="/problems" className="py-3 font-bold text-muted sm:py-5">Problems</Link>
      <Link href="/submissions" className="py-3 font-bold text-muted sm:py-5">Submissions</Link>
    </nav>
  );
}
