import type { Verdict } from "@/lib/practice";

const verdictStyles: Record<Verdict, string> = {
  AC: "border-emerald-200 bg-emerald-50 text-emerald-800",
  WA: "border-rose-200 bg-rose-50 text-rose-800",
};

export function SubmissionResult({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm font-bold ${verdictStyles[verdict]}`}
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
        {verdict === "AC" ? (
          <path d="m5 8 2 2 4-4" stroke="currentColor" strokeWidth="1.5" />
        ) : (
          <path d="m6 6 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.5" />
        )}
      </svg>
      {verdict === "AC" ? "Correct" : "Incorrect"}
    </span>
  );
}
