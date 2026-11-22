import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { problemContentDirectory, readPublicProblem } from "./content";
import { inTransaction } from "./connection";
import { devProfile } from "./dev-profile";

function readProblem(slug: string) {
  const problem = readPublicProblem(slug);
  const answer: unknown = JSON.parse(
    readFileSync(join(problemContentDirectory, slug, "answer.json"), "utf8"),
  );
  if (typeof answer !== "object" || answer === null) throw new Error(`Invalid answer for ${slug}.`);

  if (problem.type === "Predict Output" &&
    "expectedOutput" in answer && typeof answer.expectedOutput === "string" &&
    !("correctOptionKey" in answer)) {
    return { ...problem, options: [], expectedOutput: answer.expectedOutput, correctOptionKey: null };
  }

  if (problem.type === "Find the Error" &&
    "correctOptionKey" in answer && typeof answer.correctOptionKey === "string" &&
    !("expectedOutput" in answer) && problem.options.some(({ key }) => key === answer.correctOptionKey)) {
    return { ...problem, expectedOutput: null, correctOptionKey: answer.correctOptionKey };
  }

  throw new Error(`Invalid answer or options for ${slug}.`);
}

export function seed(db: DatabaseSync) {
  const problems = readdirSync(problemContentDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map(readProblem);

  return inTransaction(db, () => {
    db.prepare(`
      INSERT INTO users (username, display_name, time_zone, created_at)
      VALUES (?, ?, ?, ?) ON CONFLICT(username) DO NOTHING
    `).run(devProfile.username, devProfile.displayName, devProfile.timeZone, Date.now());

    const insertProblem = db.prepare(`
      INSERT INTO problems (slug, title, question_type, difficulty, statement_markdown, example_code, code_language)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO NOTHING
      RETURNING id
    `);
    const insertTag = db.prepare("INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING");
    const linkTag = db.prepare("INSERT INTO problem_tags SELECT ?, id FROM tags WHERE name = ?");
    const insertOption = db.prepare("INSERT INTO problem_options VALUES (?, ?, ?, ?)");
    const insertAnswer = db.prepare("INSERT INTO problem_answers VALUES (?, ?, ?)");

    let imported = 0;
    for (const problem of problems) {
      const row = insertProblem.get(
        problem.slug, problem.title, problem.type, problem.difficulty,
        problem.statementMarkdown, problem.exampleCode, problem.codeLanguage,
      );
      if (!row) continue;

      const id = Number(row.id);
      for (const tag of problem.tags) {
        insertTag.run(tag);
        linkTag.run(id, tag);
      }
      problem.options.forEach(({ key, label }, index) => insertOption.run(id, key, label, index + 1));
      insertAnswer.run(id, problem.expectedOutput, problem.correctOptionKey);
      imported++;
    }
    return imported;
  });
}
