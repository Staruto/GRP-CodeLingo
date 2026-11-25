import { ButtonLink } from "@/components/button-link";

export default function SubmissionNotFound() {
  return (
    <section aria-labelledby="not-found-heading" className="space-y-5">
      <h1 id="not-found-heading" className="page-heading">Submission not found</h1>
      <p className="max-w-2xl text-muted">No submission matches that ID.</p>
      <ButtonLink href="/submissions">Back to submissions</ButtonLink>
    </section>
  );
}
