import { ButtonLink } from "@/components/button-link";

export default function SubmissionNotFound() {
  return (
    <section aria-labelledby="not-found-heading" className="space-y-5">
      <p className="text-sm text-muted">Prototype · Sample submissions only</p>
      <h1 id="not-found-heading" className="page-heading">Submission not found</h1>
      <p className="max-w-2xl text-muted">
        This prototype has no sample submission matching that ID. You can open
        an available example or return to the submission history.
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/submissions/SUB-001">View sample submission</ButtonLink>
        <ButtonLink href="/submissions" variant="secondary">Back to submissions</ButtonLink>
      </div>
    </section>
  );
}
