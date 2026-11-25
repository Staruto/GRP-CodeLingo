import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SubmissionList } from "@/components/submissions/submission-list";
import { getCurrentUser, getPersonalSubmissions, usesLocalDatabase } from "@/server/practice";

export const metadata: Metadata = { title: "Personal submission history" };

export default async function PersonalSubmissionsPage() {
  const isMock = !usesLocalDatabase();
  if (!isMock) await connection();
  const [user, submissions] = await Promise.all([getCurrentUser(), getPersonalSubmissions()]);

  return (
    <div className="space-y-6">
      <header>
        {isMock && <p className="mb-2 text-sm text-muted">Prototype · Sample submissions</p>}
        <h1 className="page-heading">Personal submission history</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {user ? (
            <>
              Showing recent submissions for{" "}
              <Link href={`/users/${encodeURIComponent(user.username)}`} className="text-link">
                {user.displayName} (@{user.username})
              </Link>, the configured development identity.{" "}
            </>
          ) : "The configured development identity is unavailable. "}
          CodeLingo has no persistent login session.
        </p>
        <Link href="/submissions" className="text-link mt-3 inline-block">View public submissions</Link>
      </header>
      {user && <SubmissionList submissions={submissions} emptyMessage="This user has no submissions yet." />}
    </div>
  );
}
