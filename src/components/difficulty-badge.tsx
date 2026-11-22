import type { ProblemDifficulty } from "@/lib/practice";

const difficultyStyles: Record<ProblemDifficulty, string> = {
  Easy: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Medium: "border-amber-200 bg-amber-50 text-amber-800",
  Hard: "border-rose-200 bg-rose-50 text-rose-800",
};

export function DifficultyBadge({ difficulty }: { difficulty: ProblemDifficulty }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${difficultyStyles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
