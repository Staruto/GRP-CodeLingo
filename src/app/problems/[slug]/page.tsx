import { notFound } from "next/navigation";
import { connection } from "next/server";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { AnswerForm } from "@/components/problems/answer-form";
import { ProblemExample, ProblemMarkdown } from "@/components/problems/problem-markdown";
import { getCurrentUser, getProblem, getSampleProblemSlugs, usesLocalDatabase } from "@/server/practice";
import { submitAnswer } from "@/server/submit-answer";

type ProblemPageProps = PageProps<"/problems/[slug]">;

export function generateStaticParams() {
  return getSampleProblemSlugs().map((slug) => ({ slug }));
}

async function requireProblem(params: ProblemPageProps["params"]) {
  const { slug } = await params;
  if (usesLocalDatabase()) await connection();
  const problem = await getProblem(slug);
  if (!problem) notFound();
  return problem;
}

export async function generateMetadata({ params }: ProblemPageProps) {
  const problem = await requireProblem(params);
  return { title: problem.title };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const problem = await requireProblem(params);
  const isMock = !usesLocalDatabase();
  const action = !isMock && await getCurrentUser() ? submitAnswer.bind(null, problem.slug, problem.type) : undefined;

  return (
    <article aria-labelledby="problem-title" className="space-y-8">
      <header className="border-b border-border pb-6">
        <p className="font-mono text-sm text-muted">{problem.slug}</p>
        <h1 id="problem-title" className="page-heading mt-2">{problem.title}</h1>
        <dl className="mt-5 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-x-10">
          <div>
            <dt className="text-sm text-muted">Question type</dt>
            <dd className="mt-1 text-sm font-bold">{problem.type}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Difficulty</dt>
            <dd className="mt-1"><DifficultyBadge difficulty={problem.difficulty} /></dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Tags</dt>
            <dd className="mt-1 text-sm">{problem.tags.join(", ")}</dd>
          </div>
          {problem.status && (
            <div>
              <dt className="text-sm text-muted">{isMock ? "Example status" : "Status"}</dt>
              <dd className="mt-1 text-sm">{problem.status}</dd>
            </div>
          )}
        </dl>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="statement-heading" className="min-w-0 space-y-4">
          <h2 id="statement-heading" className="section-heading">Problem statement</h2>
          <ProblemMarkdown markdown={problem.statementMarkdown} />
          <figure className="rounded-md border border-border bg-background">
            <figcaption
              id="example-language"
              className="border-b border-border px-4 py-2 text-sm font-bold text-muted"
            >
              {problem.codeLanguage === "c" ? "C" : problem.codeLanguage} example
            </figcaption>
            <div
              role="region"
              aria-labelledby="example-language"
              tabIndex={0}
              className="overflow-x-auto"
            >
              <ProblemExample code={problem.exampleCode} language={problem.codeLanguage} />
            </div>
          </figure>
        </section>

        <section
          aria-labelledby="answer-heading"
          className="rounded-md border border-border bg-background p-4 sm:p-5"
        >
          <h2 id="answer-heading" className="section-heading">Your answer</h2>
          <AnswerForm
            type={problem.type}
            options={"options" in problem ? problem.options : undefined}
            action={action}
          />
        </section>
      </div>
    </article>
  );
}
