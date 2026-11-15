import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PracticeChart } from "@/components/practice-chart";

const recommendedProblem = {
  id: "CL001",
  title: "Sum of Two Numbers",
  tags: ["Input/Output", "Arithmetic"],
} as const;

const announcements = [
  {
    title: "Start with the fundamentals",
    description:
      "Try a short input/output or arithmetic problem to get comfortable with programming basics.",
  },
  {
    title: "A first look at CodeLingo",
    description:
      "This frontend prototype previews the practice experience. Problem pages and account features are still to come.",
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-10">
      <section aria-labelledby="welcome-heading">
        <p className="mb-3 text-sm text-muted">
          Example profile <span aria-hidden="true">·</span> Mock practice data
        </p>
        <h1 id="welcome-heading" className="page-heading">
          Welcome back, Alex!
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          CodeLingo helps students practise programming concepts, one problem at
          a time. Pick a problem and build your understanding at your own pace.
        </p>
        <div className="mt-5">
          <ButtonLink href="/problems">Browse problems</ButtonLink>
        </div>
        <div className="mt-7 border-y border-border py-4">
          <h2 className="mb-3 text-sm font-bold text-muted">
            Recommended problem <span className="font-normal">— example</span>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-sm text-muted">
                {recommendedProblem.id}
              </span>
              <Link
                className="text-link font-bold"
                href={`/problems/${recommendedProblem.id}`}
              >
                {recommendedProblem.title}
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty="Easy" />
              {recommendedProblem.tags.map((tag) => (
                <span key={tag} className="text-sm text-muted">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="practice-heading">
        <h2 id="practice-heading" className="section-heading">
          Your practice this month
        </h2>
        <PracticeChart />
      </section>

      <section aria-labelledby="announcements-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
          <h2 id="announcements-heading" className="section-heading">Announcements</h2>
          <span className="text-sm text-muted">Sample announcements</span>
        </div>
        <ul className="divide-y divide-border">
          {announcements.map((announcement) => (
            <li key={announcement.title} className="py-4">
              <h3 className="font-bold">{announcement.title}</h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                {announcement.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
