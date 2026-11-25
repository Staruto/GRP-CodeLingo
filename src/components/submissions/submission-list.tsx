import Link from "next/link";
import type { SubmissionSummary } from "@/lib/practice";
import { SubmissionResult } from "./submission-result";
import { SubmissionTime } from "./submission-time";

export function SubmissionList({ submissions, emptyMessage }: {
  submissions: readonly SubmissionSummary[];
  emptyMessage: string;
}) {
  if (submissions.length === 0) {
    return (
      <div className="space-y-2 border-y border-border py-6">
        <p>{emptyMessage}</p>
        <Link href="/problems" className="text-link">Browse problems</Link>
      </div>
    );
  }

  return (
    <ul aria-label="Recent submissions" className="divide-y divide-border border-y border-border">
      {submissions.map((submission) => (
        <li key={submission.id} className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <Link href={`/problems/${submission.problem.slug}`} className="text-link font-bold [overflow-wrap:anywhere]">
              <span className="font-mono text-sm">{submission.problem.slug}</span>
              {" · "}{submission.problem.title}
            </Link>
            <SubmissionResult verdict={submission.verdict} />
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm text-muted">
            <span className="min-w-0">
              Submission{" "}
              <Link href={`/submissions/${submission.id}`} className="text-link break-all font-mono">
                {submission.id}
              </Link>
            </span>
            <span className="min-w-0">
              By{" "}
              <Link href={`/users/${encodeURIComponent(submission.username)}`} className="text-link [overflow-wrap:anywhere]">
                {submission.username}
              </Link>
            </span>
            <SubmissionTime submittedAt={submission.submittedAt} />
          </div>
        </li>
      ))}
    </ul>
  );
}
