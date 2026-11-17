import { ButtonLink } from "@/components/button-link";

export default function ProblemNotFound() {
  return (
    <section aria-labelledby="not-found-title" className="space-y-4">
      <h1 id="not-found-title" className="page-heading">Problem not found</h1>
      <p className="text-muted">Check the problem ID or choose a sample problem from the homepage.</p>
      <ButtonLink href="/" variant="secondary">Back to home</ButtonLink>
    </section>
  );
}
