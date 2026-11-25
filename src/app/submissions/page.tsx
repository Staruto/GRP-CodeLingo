import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SubmissionList } from "@/components/submissions/submission-list";
import { submissionHistoryLimit } from "@/lib/practice";
import { getPublicSubmissions, usesLocalDatabase } from "@/server/practice";

export const metadata: Metadata = { title: "Public submissions" };

export default async function PublicSubmissionsPage() {
  const isMock = !usesLocalDatabase();
  if (!isMock) await connection();
  const submissions = await getPublicSubmissions();

  return (
    <div className="space-y-6">
      <header>
        {isMock && <p className="mb-2 text-sm text-muted">Prototype · Sample submissions</p>}
        <h1 className="page-heading">Public submissions</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Up to {submissionHistoryLimit} recent submissions across all users, newest first.
        </p>
        <Link href="/submissions/me" className="text-link mt-3 inline-block">View personal history</Link>
      </header>
      <SubmissionList submissions={submissions} emptyMessage="No submissions have been recorded yet." />
    </div>
  );
}
