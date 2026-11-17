"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { DifficultyBadge } from "@/components/difficulty-badge";
import {
  filterProblems,
  mockProblems,
  problemDifficulties,
  problemTypes,
  type ProblemDifficulty,
  type ProblemType,
} from "@/lib/mock-problems";

const tags = [...new Set(mockProblems.flatMap((problem) => problem.tags))].sort();
const controlClassName =
  "min-h-11 w-full min-w-0 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ProblemCatalogue() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ProblemType | "">("");
  const [difficulty, setDifficulty] = useState<ProblemDifficulty | "">("");
  const [tag, setTag] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const problems = filterProblems(mockProblems, { query, type, difficulty, tag });
  const hasFilters = Boolean(query || type || difficulty || tag);

  function clearFilters() {
    setQuery("");
    setType("");
    setDifficulty("");
    setTag("");
    searchRef.current?.focus();
  }

  return (
    <section aria-label="Problem catalogue">
      <form
        role="search"
        aria-label="Find practice problems"
        aria-describedby="problem-filter-help"
        onSubmit={(event) => event.preventDefault()}
        className="border-y border-border py-5"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="min-w-0">
            <label htmlFor="problem-search" className="mb-2 block text-sm font-bold">
              Search problems
            </label>
            <input
              ref={searchRef}
              id="problem-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title or ID, e.g. CL001"
              autoComplete="off"
              className={controlClassName}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="problem-type" className="mb-2 block text-sm font-bold">
              Question type
            </label>
            <select
              id="problem-type"
              value={type}
              onChange={(event) => setType(event.target.value as ProblemType | "")}
              className={controlClassName}
            >
              <option value="">All types</option>
              {problemTypes.map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="problem-difficulty" className="mb-2 block text-sm font-bold">
              Difficulty
            </label>
            <select
              id="problem-difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as ProblemDifficulty | "")}
              className={controlClassName}
            >
              <option value="">All difficulties</option>
              {problemDifficulties.map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="problem-tag" className="mb-2 block text-sm font-bold">
              Topic tag
            </label>
            <select
              id="problem-tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className={controlClassName}
            >
              <option value="">All tags</option>
              {tags.map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p id="problem-filter-help" className="text-sm text-muted">
            Results update as you type. Filters work together.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="button-link button-link-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear filters
          </button>
        </div>
        <noscript>
          <p className="mt-3 text-sm text-muted">
            Enable JavaScript to search and filter. The full example catalogue is shown below.
          </p>
        </noscript>
      </form>

      <div className="flex flex-wrap items-baseline justify-between gap-2 py-5">
        <h2 className="section-heading">Practice questions</h2>
        <p role="status" aria-atomic="true" className="text-sm text-muted">
          {problems.length} of {mockProblems.length} problems
        </p>
      </div>

      {problems.length > 0 ? (
        <>
          <div
            aria-hidden="true"
            className="hidden gap-6 border-y border-border bg-background px-3 py-3 text-xs font-bold text-muted lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
          >
            <span>Problem</span>
            <div className="grid grid-cols-[1.1fr_0.7fr_1.4fr_0.9fr] gap-4">
              <span>Question type</span>
              <span>Difficulty</span>
              <span>Tags</span>
              <span>Status (mock)</span>
            </div>
          </div>
          <ul aria-label="Practice questions" className="divide-y divide-border border-y border-border lg:border-t-0">
            {problems.map((problem) => (
              <li
                key={problem.id}
                className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-6 lg:px-3"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted">{problem.id}</p>
                  <h3 className="mt-1 font-bold">
                    <Link className="text-link inline-block py-1" href={`/problems/${problem.slug}`}>
                      {problem.title}
                    </Link>
                  </h3>
                </div>
                <dl className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-[1.1fr_0.7fr_1.4fr_0.9fr]">
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs text-muted lg:sr-only">Question type</dt>
                    <dd>{problem.type}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs text-muted lg:sr-only">Difficulty</dt>
                    <dd><DifficultyBadge difficulty={problem.difficulty} /></dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs text-muted lg:sr-only">Tags</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {problem.tags.map((problemTag) => (
                        <span key={problemTag} className="rounded border border-border bg-background px-2 py-0.5 text-xs text-muted">
                          {problemTag}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-1 text-xs text-muted lg:sr-only">Status (mock)</dt>
                    <dd className={problem.status === "Solved" ? "font-bold text-accent" : "text-muted"}>
                      {problem.status}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="border-y border-border py-10 text-center">
          <h3 className="font-bold">No problems found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Try a different title or ID, or clear your filters to see all practice questions.
          </p>
          <button type="button" onClick={clearFilters} className="button-link button-link-primary mt-5">
            Show all problems
          </button>
        </div>
      )}
    </section>
  );
}
