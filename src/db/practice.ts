import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { submissionHistoryLimit } from "../lib/practice";
import type {
  CurrentUser, ProblemDetail, ProblemDifficulty, ProblemStatus, ProblemSummary, ProblemType,
  PublicUserProfile, SingleSelectType, SubmissionSummary, SubmissionView, Verdict,
} from "../lib/practice";
import { derivePracticeStats } from "../server/practice-stats";
import { inTransaction } from "./connection";

export function findUser(db: DatabaseSync, username: string): CurrentUser | null {
  const row = db.prepare(`
    SELECT id, username, display_name, time_zone, role FROM users WHERE username = ?
  `).get(username);
  return row ? {
    id: Number(row.id),
    username: String(row.username),
    displayName: String(row.display_name),
    timeZone: String(row.time_zone),
    role: row.role as CurrentUser["role"],
  } : null;
}

export function findPublicUserProfile(db: DatabaseSync, username: string): PublicUserProfile | null {
  const row = db.prepare(`
    SELECT u.username, u.display_name, u.created_at,
      COUNT(s.id) AS total_attempts,
      COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN s.problem_id END) AS solved_problems
    FROM users u
    LEFT JOIN submissions s ON s.user_id = u.id
    WHERE u.username = ?
    GROUP BY u.id
  `).get(username);
  return row ? {
    username: String(row.username),
    displayName: String(row.display_name),
    joinedAt: new Date(Number(row.created_at)).toISOString(),
    solvedProblems: Number(row.solved_problems),
    totalAttempts: Number(row.total_attempts),
  } : null;
}

type ProblemRow = {
  id: number;
  slug: string;
  title: string;
  question_type: ProblemType;
  difficulty: ProblemDifficulty;
  tags: string;
  status: ProblemStatus | null;
};

const problemSummaryColumns = `
  p.id, p.slug, p.title, p.question_type, p.difficulty,
  (SELECT json_group_array(t.name ORDER BY t.id)
    FROM problem_tags pt JOIN tags t ON t.id = pt.tag_id
    WHERE pt.problem_id = p.id) AS tags,
  CASE
    WHEN viewer.id IS NULL THEN NULL
    WHEN EXISTS (SELECT 1 FROM submissions s
      WHERE s.problem_id = p.id AND s.user_id = viewer.id AND s.verdict = 'AC') THEN 'Solved'
    WHEN EXISTS (SELECT 1 FROM submissions s
      WHERE s.problem_id = p.id AND s.user_id = viewer.id AND s.verdict = 'WA') THEN 'Attempted'
    ELSE 'Not attempted'
  END AS status
`;

function toSummary(row: ProblemRow): ProblemSummary {
  return {
    slug: row.slug,
    title: row.title,
    type: row.question_type,
    difficulty: row.difficulty,
    tags: JSON.parse(row.tags),
    status: row.status,
  };
}

export function listProblems(db: DatabaseSync, userId: number | null) {
  const rows = db.prepare(`
    SELECT ${problemSummaryColumns}
    FROM problems p LEFT JOIN users viewer ON viewer.id = ?
    ORDER BY p.slug
  `).all(userId) as ProblemRow[];
  return rows.map(toSummary);
}

export function findProblem(db: DatabaseSync, slug: string, userId: number | null): ProblemDetail | null {
  const row = db.prepare(`
    SELECT ${problemSummaryColumns}, p.statement_markdown, p.example_code, p.code_language
    FROM problems p LEFT JOIN users viewer ON viewer.id = ?
    WHERE p.slug = ?
  `).get(userId, slug) as (ProblemRow & {
    statement_markdown: string;
    example_code: string;
    code_language: string;
  }) | undefined;
  if (!row) return null;

  const detail = {
    ...toSummary(row),
    statementMarkdown: row.statement_markdown,
    exampleCode: row.example_code,
    codeLanguage: row.code_language,
  };
  if (row.question_type === "Predict Output") return { ...detail, type: row.question_type };

  const options = db.prepare(`
    SELECT option_key, label FROM problem_options WHERE problem_id = ? ORDER BY position
  `).all(row.id);
  return {
    ...detail,
    type: row.question_type,
    options: options.map((option) => ({ key: String(option.option_key), label: String(option.label) })),
  };
}

type SubmissionRow = {
  id: string;
  submitted_at: number;
  verdict: Verdict;
  username: string;
  slug: string;
  title: string;
};

const submissionColumns = "s.id, s.submitted_at, s.verdict, u.username, p.slug, p.title";
const submissionTables = `
  FROM submissions s
  JOIN users u ON u.id = s.user_id
  JOIN problems p ON p.id = s.problem_id
`;
const submissionListQuery = `SELECT ${submissionColumns} ${submissionTables}`;
const recentSubmissionsOrder = "ORDER BY s.submitted_at DESC, s.id DESC LIMIT ?";

function toSubmissionSummary(row: SubmissionRow): SubmissionSummary {
  return {
    id: row.id,
    submittedAt: new Date(row.submitted_at).toISOString(),
    verdict: row.verdict,
    username: row.username,
    problem: { slug: row.slug, title: row.title },
  };
}

export function listPublicSubmissions(db: DatabaseSync): SubmissionSummary[] {
  const rows = db.prepare(`${submissionListQuery} ${recentSubmissionsOrder}`)
    .all(submissionHistoryLimit) as SubmissionRow[];
  return rows.map(toSubmissionSummary);
}

export function listUserSubmissions(db: DatabaseSync, userId: number): SubmissionSummary[] {
  const rows = db.prepare(`${submissionListQuery} WHERE s.user_id = ? ${recentSubmissionsOrder}`)
    .all(userId, submissionHistoryLimit) as SubmissionRow[];
  return rows.map(toSubmissionSummary);
}

export function findSubmission(db: DatabaseSync, id: string): SubmissionView | null {
  const row = db.prepare(`
    SELECT ${submissionColumns}, p.question_type,
      COALESCE(s.submitted_text, opt.label) AS submitted_answer
    ${submissionTables}
    LEFT JOIN problem_options opt ON opt.problem_id = s.problem_id AND opt.option_key = s.selected_option_key
    WHERE s.id = ?
  `).get(id) as (SubmissionRow & { question_type: ProblemType; submitted_answer: string }) | undefined;
  if (!row) return null;
  const summary = toSubmissionSummary(row);
  return {
    ...summary,
    problem: { ...summary.problem, type: row.question_type },
    submittedAnswer: row.submitted_answer,
  };
}

type AnswerInput = { type: "Predict Output"; text: string } | { type: SingleSelectType; optionKey: string };

function normalizeOutput(answer: string) {
  return answer.replace(/\r\n?/g, "\n").replace(/[ \t]+(?=\n|$)/g, "").replace(/\n+$/, "");
}

export function recordSubmission(
  db: DatabaseSync, userId: number, slug: string, answer: AnswerInput, submittedAt = Date.now(),
) {
  return inTransaction(db, () => {
    const problem = db.prepare(`
      SELECT p.id, p.question_type, a.expected_output, a.correct_option_key
      FROM problems p JOIN problem_answers a ON a.problem_id = p.id
      WHERE p.slug = ?
    `).get(slug);
    if (!problem || problem.question_type !== answer.type) return null;

    const problemId = Number(problem.id);
    let submittedText: string | null = null;
    let selectedOptionKey: string | null = null;
    let accepted: boolean;
    if (answer.type === "Predict Output") {
      if (typeof problem.expected_output !== "string") return null;
      submittedText = answer.text;
      accepted = normalizeOutput(answer.text) === normalizeOutput(problem.expected_output);
    } else {
      if (typeof problem.correct_option_key !== "string") return null;
      const option = db.prepare(`
        SELECT 1 FROM problem_options WHERE problem_id = ? AND option_key = ?
      `).get(problemId, answer.optionKey);
      if (!option) return null;
      selectedOptionKey = answer.optionKey;
      accepted = answer.optionKey === problem.correct_option_key;
    }

    const id = randomUUID();
    db.prepare(`
      INSERT INTO submissions (id, user_id, problem_id, verdict, submitted_at, submitted_text, selected_option_key)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, problemId, accepted ? "AC" : "WA", submittedAt, submittedText, selectedOptionKey);
    return id;
  });
}

export function readPracticeStats(db: DatabaseSync, user: CurrentUser, now = Date.now()) {
  const firstAcceptances = db.prepare(`
    SELECT MIN(submitted_at) AS time FROM submissions
    WHERE user_id = ? AND verdict = 'AC' AND submitted_at <= ? GROUP BY problem_id
  `).all(user.id, now);
  const acceptances = db.prepare(`
    SELECT submitted_at AS time FROM submissions WHERE user_id = ? AND verdict = 'AC' AND submitted_at <= ?
  `).all(user.id, now);
  const topicRows = db.prepare(`
    SELECT t.name, COUNT(s.id) AS attempts, COUNT(CASE WHEN s.verdict = 'AC' THEN 1 END) AS accepted
    FROM tags t JOIN problem_tags pt ON pt.tag_id = t.id
    LEFT JOIN submissions s ON s.problem_id = pt.problem_id AND s.user_id = ?
      AND s.verdict IN ('AC', 'WA') AND s.submitted_at <= ?
    GROUP BY t.id ORDER BY t.name
  `).all(user.id, now);

  return derivePracticeStats(
    now,
    user.timeZone,
    firstAcceptances.map((row) => Number(row.time)),
    acceptances.map((row) => Number(row.time)),
    topicRows.map((row) => {
      const accepted = Number(row.accepted);
      const attempts = Number(row.attempts);
      return { tag: String(row.name), accepted, attempts, accuracy: attempts === 0 ? null : accepted / attempts };
    }),
  );
}
