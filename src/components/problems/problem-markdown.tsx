import "server-only";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

const highlightStyles = "[&_.hljs-comment]:text-muted [&_.hljs-keyword]:font-bold [&_.hljs-keyword]:text-accent [&_.hljs-meta]:text-accent [&_.hljs-number]:text-amber-800 [&_.hljs-string]:text-emerald-800 [&_.hljs-type]:text-accent";

export function ProblemMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className={`space-y-3 text-muted [&_h2]:text-lg [&_h2]:font-bold [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5 ${highlightStyles}`}>
      <Markdown skipHtml rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
        {markdown}
      </Markdown>
    </div>
  );
}

export function ProblemExample({ code, language }: { code: string; language: string }) {
  const longestBackticks = (code.match(/`+/g) ?? []).reduce((longest, run) => Math.max(longest, run.length), 2);
  const fence = "`".repeat(longestBackticks + 1);
  return (
    <Markdown skipHtml rehypePlugins={[rehypeSanitize, rehypeHighlight]} components={{
      pre: ({ children }) => <pre className={`p-4 text-sm leading-6 ${highlightStyles}`}>{children}</pre>,
    }}>
      {`${fence}${language}\n${code}\n${fence}`}
    </Markdown>
  );
}
