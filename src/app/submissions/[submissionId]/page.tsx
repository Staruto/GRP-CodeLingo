import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button-link";
import { SubmissionResult } from "@/components/submissions/submission-result";
import { SubmissionTime } from "@/components/submissions/submission-time";
import { getSampleSubmissionIds, getSampleSubmissions, getSubmission, usesLocalDatabase } from "@/server/practice";

type SubmissionPageProps = PageProps<"/submissions/[submissionId]">;

export function generateStaticParams() {
  return getSampleSubmissionIds().map((submissionId) => ({ submissionId }));
}

async function readSubmission(params: SubmissionPageProps["params"]) {
  if (usesLocalDatabase()) await connection();
  return getSubmission((await params).submissionId);
}

export async function generateMetadata({ params }: SubmissionPageProps): Promise<Metadata> {
  const submission = await readSubmission(params);
  if (!submission) notFound();
  return {
    title: `Submission ${submission.id}`,
    robots: { index: false },
  };
}

export default function SubmissionDetailPage({ params }: SubmissionPageProps) {
  if (usesLocalDatabase()) return <SubmissionDetail params={params} />;

  return (
    <Suspense fallback={<p role="status">Loading submission…</p>}>
      <SubmissionDetail params={params} />
    </Suspense>
  );
}

async function SubmissionDetail({ params }: Pick<SubmissionPageProps, "params">) {
  const submission = await readSubmission(params);
  if (!submission) notFound();

  const isMock = !usesLocalDatabase();
  const samples = await getSampleSubmissions();

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

        {isMock && <p className="mb-3 text-sm text-muted">Prototype · Sample submission</p>}
        <h1 id="submission-heading" className="page-heading break-words">
          Submission <span className="font-mono">{submission.id}</span>
        </h1>
      </section>

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="section-heading">Submission details</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-6 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium">Submission ID</dt>
            <dd className="mt-1 break-all font-mono">{submission.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium">Submitted at</dt>
            <dd className="mt-1"><SubmissionTime submittedAt={submission.submittedAt} /></dd>
          </div>
          <div>
            <dt className="text-sm font-medium">Submitted by</dt>
            <dd className="mt-1 break-words">
              <Link href={`/users/${encodeURIComponent(submission.username)}`} className="text-link">{submission.username}</Link>
            </dd>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-sm font-medium">Problem</dt>
            <dd className="mt-1">
              <Link href={`/problems/${submission.problem.slug}`} className="text-link font-bold">
                <span className="font-mono">{submission.problem.slug}</span>
                <span aria-hidden="true"> · </span>
                {submission.problem.title}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium">Question type</dt>
            <dd className="mt-1">{submission.problem.type}</dd>
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
        <div className="mt-4"><SubmissionResult verdict={submission.verdict} /></div>
        {isMock && <p className="mt-3 text-sm text-muted">This answer and verdict are sample data.</p>}
      </section>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`/problems/${submission.problem.slug}`}>View problem</ButtonLink>
        <ButtonLink href="/submissions" variant="secondary">Back to submissions</ButtonLink>
      </div>

      {samples.length > 0 && (
        <nav aria-label="Sample submissions" className="border-t border-border pt-5 text-sm">
          <p className="mb-2 font-bold">Explore sample submissions</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {samples.map((sample) => (
              <li key={sample.id}>
                <Link
                  href={`/submissions/${sample.id}`}
                  aria-current={sample.id === submission.id ? "page" : undefined}
                  className="text-link"
                >
                  <span className="font-mono">{sample.id}</span> — {sample.verdict === "AC" ? "Correct" : "Incorrect"}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
