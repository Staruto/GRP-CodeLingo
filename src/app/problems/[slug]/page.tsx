import { notFound } from "next/navigation";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { problems } from "./problems";

type ProblemPageProps = PageProps<"/problems/[slug]">;

export function generateStaticParams() {
  return problems.map(({ id }) => ({ slug: id }));
}

async function getProblem(params: ProblemPageProps["params"]) {
  const { slug } = await params;
  const problem = problems.find(({ id }) => id === slug);

  if (!problem) notFound();

  return problem;
}

export async function generateMetadata({ params }: ProblemPageProps) {
  const problem = await getProblem(params);
  return { title: problem.title };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const problem = await getProblem(params);

  return (
    <article aria-labelledby="problem-title" className="space-y-8">
      <header className="border-b border-border pb-6">
        <p className="font-mono text-sm text-muted">{problem.id}</p>
        <h1 id="problem-title" className="page-heading mt-2">
          {problem.title}
        </h1>
        <dl className="mt-5 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-x-10">
          <div>
            <dt className="text-sm text-muted">Question type</dt>
            <dd className="mt-1 text-sm font-bold">{problem.type}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Difficulty</dt>
            <dd className="mt-1">
              <DifficultyBadge difficulty={problem.difficulty} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Tags</dt>
            <dd className="mt-1 text-sm">{problem.tags.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Example status</dt>
            <dd className="mt-1 text-sm">{problem.status}</dd>
          </div>
        </dl>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="statement-heading" className="min-w-0 space-y-4">
          <h2 id="statement-heading" className="section-heading">Problem statement</h2>
          <div className="space-y-3 text-muted">{problem.statement}</div>
          <figure className="rounded-md border border-border bg-background">
            <figcaption
              id="example-language"
              className="border-b border-border px-4 py-2 text-sm font-bold text-muted"
            >
              JavaScript example
            </figcaption>
            <div
              role="region"
              aria-labelledby="example-language"
              tabIndex={0}
              className="overflow-x-auto"
            >
              <pre className="p-4 text-sm leading-6">
                <code>{problem.code}</code>
              </pre>
            </div>
          </figure>
        </section>

        <section
          aria-labelledby="answer-heading"
          className="rounded-md border border-border bg-background p-4 sm:p-5"
        >
          <h2 id="answer-heading" className="section-heading">Your answer</h2>
          {problem.type === "Predict Output" ? (
            <div className="mt-4">
              <label htmlFor="predicted-output" className="text-sm font-bold">
                Predicted output
              </label>
              <textarea
                id="predicted-output"
                rows={4}
                spellCheck={false}
                autoComplete="off"
                className="mt-2 block w-full resize-y rounded-md border border-slate-500 bg-surface px-3 py-2 font-mono text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </div>
          ) : (
            <fieldset className="mt-4">
              <legend className="text-sm font-bold">Replacement expression</legend>
              <div className="mt-2 space-y-2">
                {problem.options.map((option) => (
                  <label
                    key={option}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm hover:bg-accent-soft"
                  >
                    <input
                      type="radio"
                      name="replacement-expression"
                      value={option}
                      className="size-4 shrink-0 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    />
                    <code className="wrap-anywhere">{option}</code>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <p id="submission-note" className="mt-4 text-sm text-muted">
            In this prototype, you can practise entering an answer. Submission
            and grading will be available later.
          </p>
          <button
            type="button"
            disabled
            aria-describedby="submission-note"
            className="button-link mt-3 cursor-not-allowed border-border bg-slate-100 text-muted"
          >
            Submit Answer
          </button>
        </section>
      </div>
    </article>
  );
}
