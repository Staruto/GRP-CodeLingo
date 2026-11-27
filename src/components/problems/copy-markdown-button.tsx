"use client";

import { useState } from "react";

export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [feedback, setFeedback] = useState("");

  async function copyMarkdown() {
    setFeedback("");
    try {
      await navigator.clipboard.writeText(markdown);
      setFeedback("Markdown copied.");
    } catch {
      setFeedback("Could not copy Markdown. Check your browser's clipboard permissions and try again.");
    }
  }

  return (
    <>
      <button type="button" onClick={copyMarkdown} className="button-link button-link-secondary cursor-pointer">
        Copy Markdown
      </button>
      <p role="status" className="col-span-full text-right text-sm text-muted not-empty:mt-1">
        {feedback}
      </p>
    </>
  );
}
