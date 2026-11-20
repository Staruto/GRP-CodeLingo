import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { SubmissionResult } from "@/components/submissions/submission-result";
import {
  getMockSubmissionDetail,
  mockSubmissionDetails,
} from "@/lib/mock-submission-details";

type SubmissionPageProps = {
  params: Promise<{ submissionId: string }>;
};

export function generateStaticParams() {
  return mockSubmissionDetails.map(({ id }) => ({ submissionId: id }));
}

export async function generateMetadata({
  params,
}: SubmissionPageProps): Promise<Metadata> {
  const { submissionId } = await params;
  const submission = getMockSubmissionDetail(submissionId);

  return {
    title: submission ? `Submission ${submission.id}` : "Submission not found",
    robots: { index: false },
  };
}

export default async function SubmissionDetailPage({ params }: SubmissionPageProps) {
  const { submissionId } = await params;
  const submission = getMockSubmissionDetail(submissionId);

  if (!submission) {
    notFound();
  }

  const submittedAt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Shanghai",
  }).format(new Date(submission.submittedAt));

  return (
    <div className="space-y-10">
      <section aria-labelledby="submission-heading">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li><Link href="/" className="text-link">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/submissions" className="text-link">Submissions</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="break-all font-mono">{submission.id}</li>
          </ol>
        </nav>

        <p className="mb-3 text-sm text-muted">Prototype · Sample submission</p>
        <h1 id="submission-heading" className="page-heading">
          Submission <span className="font-mono">{submission.id}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          An example of a fixed-answer practice submission. The answer, result,
          and activity shown here are sample data, not a real student record.
        </p>
      </section>

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="section-heading">Submission details</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-6 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-muted">Submission ID</dt>
            <dd className="mt-1 break-all font-mono">{submission.id}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Submitted at (UTC+8)</dt>
            <dd className="mt-1"><time dateTime={submission.submittedAt}>{submittedAt}</time></dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Submitted by</dt>
            <dd className="mt-1 break-words">
              <Link href={`/users/${submission.username}`} className="text-link">
                {submission.username}
              </Link>
            </dd>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-sm text-muted">Problem</dt>
            <dd className="mt-1">
              <Link href={`/problems/${submission.problem.id}`} className="text-link">
                <span className="font-mono">{submission.problem.id}</span>
                <span aria-hidden="true"> · </span>
                {submission.problem.title}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Question type</dt>
            <dd className="mt-1">{submission.problem.questionType}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="answer-heading">
        <h2 id="answer-heading" className="section-heading">Submitted answer</h2>
        <pre className="mt-4 whitespace-pre-wrap break-words rounded-md border border-border bg-background px-4 py-5 font-mono text-sm leading-6 [overflow-wrap:anywhere]">
          <code>{submission.submittedAnswer}</code>
        </pre>
      </section>

      <section aria-labelledby="result-heading">
        <h2 id="result-heading" className="section-heading">Result</h2>
        <div className="mt-4"><SubmissionResult result={submission.result} /></div>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          This result is part of the example. No answer has been submitted,
          graded, or saved by this prototype.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`/problems/${submission.problem.id}`}>View problem</ButtonLink>
        <ButtonLink href="/submissions" variant="secondary">Back to submissions</ButtonLink>
      </div>

      <nav aria-label="Sample submissions" className="border-t border-border pt-5 text-sm">
        <p className="mb-2 font-bold">Explore sample submissions</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {mockSubmissionDetails.map((sample) => (
            <li key={sample.id}>
              <Link
                href={`/submissions/${sample.id}`}
                aria-current={sample.id === submission.id ? "page" : undefined}
                className="text-link"
              >
                <span className="font-mono">{sample.id}</span> — {sample.result}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
