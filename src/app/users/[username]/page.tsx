import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button-link";
import { getSampleProfileUsernames, getUserProfile, usesLocalDatabase } from "@/server/practice";

export const metadata: Metadata = {
  title: "User profile",
};

export function generateStaticParams() {
  return getSampleProfileUsernames().map((username) => ({ username }));
}

export default function UserProfilePage({ params }: PageProps<"/users/[username]">) {
  if (usesLocalDatabase()) return <UserProfile params={params} />;

  return (
    <Suspense fallback={<p role="status">Loading profile…</p>}>
      <UserProfile params={params} />
    </Suspense>
  );
}

async function UserProfile({ params }: Pick<PageProps<"/users/[username]">, "params">) {
  const isMock = !usesLocalDatabase();
  if (!isMock) await connection();

  const { username } = await params;
  const profile = await getUserProfile(username);
  if (!profile) notFound();

  const joinedOn = profile.joinedAt.slice(0, 10);
  const joinedDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" })
    .format(new Date(profile.joinedAt));

  return (
    <div className="space-y-8">
      <header>
        {isMock && <p className="mb-2 text-sm text-muted">Prototype · Sample profile and practice data</p>}
        <h1 className="page-heading [overflow-wrap:anywhere]">{profile.displayName}</h1>
        <p className="mt-2 text-muted [overflow-wrap:anywhere]">@{profile.username}</p>
        <p className="mt-3 text-sm">Joined <time dateTime={joinedOn}>{joinedDate}</time></p>
      </header>

      <section aria-labelledby="practice-stats-heading">
        <h2 id="practice-stats-heading" className="section-heading">Practice statistics</h2>
        <dl className="mt-4 grid gap-5 border-y border-border py-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Problems solved</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{profile.solvedProblems}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Total attempts</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{profile.totalAttempts}</dd>
          </div>
        </dl>
      </section>

      <ButtonLink href="/problems">Browse problems</ButtonLink>
    </div>
  );
}
