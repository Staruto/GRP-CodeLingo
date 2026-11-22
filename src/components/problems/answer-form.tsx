"use client";

import { useActionState } from "react";
import type { ProblemOption } from "@/lib/practice";

type AnswerFormProps = {
  options?: readonly ProblemOption[];
  action?: (previousError: string | null, data: FormData) => Promise<string>;
};

const inactiveAction = async () => "Grading is available in local practice mode.";

export function AnswerForm({ options, action }: AnswerFormProps) {
  const [error, formAction, pending] = useActionState(action ?? inactiveAction, null);

  return (
    <form action={action ? formAction : undefined}>
      {options ? (
        <fieldset className="mt-4">
          <legend className="text-sm font-bold">Replacement expression</legend>
          <div className="mt-2 space-y-2">
            {options.map((option) => (
              <label
                key={option.key}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent-soft"
              >
                <input
                  type="radio"
                  name="selectedOptionKey"
                  value={option.key}
                  required={Boolean(action)}
                  className="size-4 shrink-0 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
                <code className="wrap-anywhere">{option.label}</code>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="mt-4">
          <label htmlFor="predicted-output" className="text-sm font-bold">
            Predicted output
          </label>
          <textarea
            id="predicted-output"
            name="submittedText"
            rows={4}
            spellCheck={false}
            autoComplete="off"
            className="mt-2 block w-full resize-y rounded-md border border-slate-500 bg-surface px-3 py-2 font-mono text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>
      )}
      {!action && (
        <p id="submission-note" className="mt-4 text-sm text-muted">
          In this prototype, you can practise entering an answer. Submission and grading are available in local practice mode.
        </p>
      )}
      {error && <p role="alert" className="mt-4 text-sm text-rose-800">{error}</p>}
      <button
        type={action ? "submit" : "button"}
        disabled={!action || pending}
        aria-describedby={action ? undefined : "submission-note"}
        className={`button-link mt-3 ${action ? "button-link-primary disabled:opacity-50" : "cursor-not-allowed border-slate-300 bg-slate-100 text-muted"}`}
      >
        {pending ? "Grading…" : "Submit Answer"}
      </button>
    </form>
  );
}
