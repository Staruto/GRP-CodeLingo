import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { problemDifficulties, problemTypes, singleSelectTypes, type ProblemDetail, type ProblemOption } from "../lib/practice";

export const problemContentDirectory = join(process.cwd(), "content", "problems");

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOption(value: unknown): value is ProblemOption {
  return typeof value === "object" && value !== null &&
    "key" in value && typeof value.key === "string" && /^[a-z0-9_-]+$/.test(value.key) &&
    "label" in value && hasText(value.label);
}

export function readPublicProblem(slug: string): ProblemDetail {
  if (!/^CL\d{3,}$/.test(slug)) throw new Error(`Invalid problem slug ${slug}.`);

  const path = join(problemContentDirectory, slug);
  const markdown = readFileSync(join(path, "problem.md"), "utf8");
  if (!/^---\r?\n/.test(markdown)) throw new Error(`Expected YAML front matter for ${slug}.`);
  const { data, content } = matter(markdown);
  const exampleCode = readFileSync(join(path, "example.c"), "utf8").trimEnd();
  const { title, type, difficulty, tags, options } = data;
  if (!hasText(title) || !hasText(content) || !hasText(exampleCode) ||
    !problemTypes.includes(type) || !problemDifficulties.includes(difficulty) ||
    !Array.isArray(tags) || tags.length === 0 || !tags.every(hasText) ||
    new Set(tags.map((tag) => tag.trim())).size !== tags.length) {
    throw new Error(`Invalid problem metadata for ${slug}.`);
  }

  const detail = {
    slug,
    title: title.trim(),
    difficulty,
    tags: tags.map((tag) => tag.trim()),
    status: null,
    statementMarkdown: content,
    exampleCode,
    codeLanguage: "c",
  };
  if (type === "Predict Output" && options === undefined) return { ...detail, type };
  if (singleSelectTypes.includes(type) && Array.isArray(options) && options.length >= 2 &&
    options.every(isOption) && new Set(options.map(({ key }) => key)).size === options.length) {
    return { ...detail, type, options: options.map(({ key, label }) => ({ key, label })) };
  }

  throw new Error(`Invalid options for ${slug}.`);
}
