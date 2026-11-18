import type { Metadata } from "next";
import { ProblemCatalogue } from "@/components/problems/problem-catalogue";

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
        <p className="mt-3 text-sm text-muted">
          Example catalogue · All problems and completion statuses are mock data.
        </p>
      </section>
      <ProblemCatalogue />
    </div>
  );
}
