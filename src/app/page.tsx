import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button-link";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PracticeChart } from "@/components/practice-chart";
import { getCurrentUser, getPracticeStats, getProblems, usesLocalDatabase } from "@/server/practice";

const announcements = [
  {
    title: "Start with the fundamentals",
    description: "Try a short input/output or arithmetic problem to get comfortable with programming basics.",
  },
  {
    title: "A first look at CodeLingo",
    description: "Open the recommended problem to preview the question and answer area.",
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-10">
      <Suspense fallback={<p role="status">Loading practice…</p>}>
        <HomePractice />
      </Suspense>
      <section aria-labelledby="announcements-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
          <h2 id="announcements-heading" className="section-heading">Announcements</h2>
          <span className="text-sm text-muted">Sample announcements</span>
        </div>
        <ul className="divide-y divide-border">
          {announcements.map((announcement) => (
            <li key={announcement.title} className="py-4">
              <h3 className="font-bold">{announcement.title}</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{announcement.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

async function HomePractice() {
  await connection();
  const [user, practiceStats, problems] = await Promise.all([getCurrentUser(), getPracticeStats(), getProblems()]);
  const isMock = !usesLocalDatabase();
  const recommendedProblem = problems[0];
  return (
    <>
      <section aria-labelledby="welcome-heading">
        {isMock && (
          <p className="text-sm text-muted">
            Example profile <span aria-hidden="true">·</span> Mock practice data
          </p>
        )}
        <h1 id="welcome-heading" className={`page-heading${isMock ? " mt-1" : ""}`}>
          {user ? `Welcome back, ${user.displayName}!` : "Welcome to CodeLingo"}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          CodeLingo helps students practise programming concepts, one problem at
          a time. Pick a problem and build your understanding at your own pace.
        </p>
        <div className="mt-5">
          <ButtonLink href="/problems">Browse problems</ButtonLink>
        </div>
        {recommendedProblem && (
          <div className="mt-7 border-y border-border py-4">
            <h2 className="mb-2 text-sm font-bold text-muted">
              Recommended problem {isMock && <span className="font-normal">— example</span>}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-mono text-sm text-muted">{recommendedProblem.slug}</span>
                <Link className="text-link font-bold" href={`/problems/${recommendedProblem.slug}`}>
                  {recommendedProblem.title}
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={recommendedProblem.difficulty} />
                {recommendedProblem.tags.map((tag) => (
                  <span key={tag} className="text-sm text-muted">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
      <section aria-labelledby="practice-heading">
        <h2 id="practice-heading" className="section-heading">Your practice this month</h2>
        <PracticeChart stats={practiceStats} isMock={isMock} />
      </section>
    </>
  );
}
