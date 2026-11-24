import { ButtonLink } from "@/components/button-link";

export default function UserNotFound() {
  return (
    <section aria-labelledby="not-found-heading" className="space-y-5">
      <h1 id="not-found-heading" className="page-heading">User not found</h1>
      <p className="text-muted">No profile matches that username.</p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </section>
  );
}
