import type { SubmissionResult as Result } from "@/lib/mock-submission-details";

const resultStyles: Record<Result, string> = {
  Correct: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Incorrect: "border-rose-200 bg-rose-50 text-rose-800",
};

export function SubmissionResult({ result }: { result: Result }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm font-bold ${resultStyles[result]}`}
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0"
      >
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        {result === "Correct" ? (
          <path d="m5 8 2 2 4-4" stroke="currentColor" strokeWidth="1.5" />
        ) : (
          <path d="m6 6 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.5" />
        )}
      </svg>
      {result}
    </span>
  );
}
