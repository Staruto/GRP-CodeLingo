import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProblemCatalogue } from "@/components/problems/problem-catalogue";
import { getProblems, usesLocalDatabase } from "@/server/practice";

export const metadata: Metadata = {
  title: "Problems",
  description:
    "Browse CodeLingo practice questions by title, question type, difficulty, and topic.",
};

export default function ProblemsPage() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="problems-heading">
        <h1 id="problems-heading" className="page-heading">Problems</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Practise reading and understanding code. Predict what a program prints
          or find the error, then explore a new topic at your own pace.
        </p>
      </section>
      <Suspense fallback={<p role="status">Loading problems…</p>}>
        <Catalogue />
      </Suspense>
    </div>
  );
}

async function Catalogue() {
  const isMock = !usesLocalDatabase();
  if (!isMock) await connection();
  const catalogue = await getProblems();
  return (
    <>
      {isMock && (
        <p className="text-sm text-muted">Example catalogue · Practice statuses are mock data.</p>
      )}
      <ProblemCatalogue catalogue={catalogue} isMock={isMock} />
    </>
  );
}
